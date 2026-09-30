import { describe, expect, it, vi } from "vitest";
import type { DiscoveryAdapter } from "../src/core/discovery";
import { discoverStableTranscript, ObservationProcessor, planTranscriptInbox, TranscriptInbox } from "../src/core/observation";
import { DEFAULT_SETTINGS } from "../src/core/settings";
import type { VaultFileRef } from "../src/core/types";
import { testDigest } from "./test-crypto";

const encoder = new TextEncoder();

function evidence(path: string, sha256: string, byteLength = 4) {
  return { path, format: "txt" as const, byteLength, sha256 };
}

function changingAdapter(path: string, bodies: Array<Uint8Array | Error | undefined>): DiscoveryAdapter & { reads: number } {
  let reads = 0;
  return {
    get reads() { return reads; },
    listFiles: () => [],
    fileForPath: (candidate): VaultFileRef | undefined => candidate === path && bodies[Math.min(reads, bodies.length - 1)] !== undefined
      ? { path, extension: "txt", size: 4, isFile: true }
      : undefined,
    readBinary: async () => {
      const value = bodies[Math.min(reads, bodies.length - 1)];
      reads += 1;
      if (value instanceof Error || value === undefined) throw value ?? new Error("missing");
      return value;
    }
  };
}

describe("transcript inbox", () => {
  it("deduplicates the same identity and replaces changed current evidence", () => {
    const inbox = new TranscriptInbox();
    expect(inbox.upsert(evidence("Meetings/one.txt", "a"))).toBe("added");
    expect(inbox.upsert(evidence("Meetings/one.txt", "a"))).toBe("unchanged");
    expect(inbox.upsert(evidence("Meetings/one.txt", "b", 5))).toBe("updated");
    expect(inbox.entries()).toEqual([{ path: "Meetings/one.txt", format: "txt", size: 5, contentIdentity: "b" }]);
  });

  it("removes deleted entries without disturbing unrelated entries", () => {
    const inbox = new TranscriptInbox();
    inbox.upsert(evidence("one.txt", "a"));
    inbox.upsert(evidence("two.txt", "b"));
    expect(inbox.remove("one.txt")).toBe(true);
    expect(inbox.entries().map((entry) => entry.path)).toEqual(["two.txt"]);
    expect(inbox.remove("missing.txt")).toBe(false);
  });
});

describe("stable event discovery", () => {
  it("waits for two unchanged readable identities", async () => {
    const path = "Meetings/one.txt";
    const adapter = changingAdapter(path, [encoder.encode("part"), encoder.encode("done"), encoder.encode("done")]);
    const wait = vi.fn(async () => undefined);
    const item = await discoverStableTranscript(adapter, path, { ...DEFAULT_SETTINGS, observationRoots: ["Meetings"] }, new AbortController().signal, testDigest, { attempts: 4, wait });
    expect(item?.classification).toBe("eligible");
    expect(adapter.reads).toBe(3);
    expect(wait).toHaveBeenCalledTimes(2);
  });

  it("retries unreadable files and exhausts without queuing unstable input", async () => {
    const path = "Meetings/one.txt";
    const adapter = changingAdapter(path, [new Error("busy"), encoder.encode("a"), encoder.encode("b")]);
    const item = await discoverStableTranscript(adapter, path, DEFAULT_SETTINGS, new AbortController().signal, testDigest, { attempts: 3 });
    expect(item).toBeUndefined();
    expect(adapter.reads).toBe(3);
  });

  it("returns after eventual readability and cancels pending retries", async () => {
    const path = "one.txt";
    const eventual = changingAdapter(path, [new Error("busy"), encoder.encode("done"), encoder.encode("done")]);
    expect((await discoverStableTranscript(eventual, path, DEFAULT_SETTINGS, new AbortController().signal, testDigest))?.classification).toBe("eligible");

    const controller = new AbortController();
    const pending = changingAdapter(path, [encoder.encode("part"), encoder.encode("done")]);
    const result = await discoverStableTranscript(pending, path, DEFAULT_SETTINGS, controller.signal, testDigest, {
      wait: async () => { controller.abort(); }
    });
    expect(result).toBeUndefined();
    expect(pending.reads).toBe(1);
  });

  it("ignores paths outside configured observation roots before reading", async () => {
    const adapter = changingAdapter("Archive/one.txt", [encoder.encode("body")]);
    const result = await discoverStableTranscript(adapter, "Archive/one.txt", { ...DEFAULT_SETTINGS, observationRoots: ["Meetings"] }, new AbortController().signal, testDigest);
    expect(result).toBeUndefined();
    expect(adapter.reads).toBe(0);
  });
});

describe("observation processor", () => {
  it("coalesces duplicate in-flight events and never processes while another run is active", async () => {
    const path = "one.txt";
    const adapter = changingAdapter(path, [encoder.encode("body"), encoder.encode("body")]);
    const wait = async () => undefined;
    let canProcess = true;
    const changed = vi.fn();
    const processor = new ObservationProcessor({
      adapter, settings: () => ({ ...DEFAULT_SETTINGS, observationEnabled: true }), digest: testDigest,
      canProcess: () => canProcess, wait, onChanged: changed
    });
    const first = processor.handleCreated(path);
    const duplicate = processor.handleCreated(path);
    expect(processor.pendingCount).toBe(1);
    await Promise.all([first, duplicate]);
    expect(processor.inbox.size).toBe(1);
    expect(changed).toHaveBeenCalledOnce();

    canProcess = false;
    await processor.handleCreated("two.txt");
    expect(processor.inbox.size).toBe(1);
  });

  it("cancels owned work and clears content-free state on stop", async () => {
    const controller: { release?: () => void } = {};
    const processor = new ObservationProcessor({
      adapter: changingAdapter("one.txt", [encoder.encode("body"), encoder.encode("body")]),
      settings: () => ({ ...DEFAULT_SETTINGS, observationEnabled: true }), digest: testDigest,
      canProcess: () => true,
      wait: () => new Promise<void>((resolve) => { controller.release = resolve; }),
      onChanged: vi.fn()
    });
    const pending = processor.handleCreated("one.txt");
    processor.stop(true);
    controller.release?.();
    await pending;
    expect(processor.pendingCount).toBe(0);
    expect(processor.inbox.entries()).toEqual([]);
    expect(JSON.stringify(processor.inbox.entries())).not.toContain("body");
  });

  it("bounds work during a mixed event storm and isolates failures", async () => {
    const bodies: Record<string, Uint8Array | Error> = {
      "Meetings/a.txt": encoder.encode("a"),
      "Meetings/b.txt": encoder.encode("b"),
      "Meetings/bad.txt": new Error("private body"),
      "Archive/no.txt": encoder.encode("excluded")
    };
    const reads = new Map<string, number>();
    const adapter: DiscoveryAdapter = {
      listFiles: () => [],
      fileForPath: (path) => ({ path, extension: path.split(".").pop() ?? "", size: path === "Meetings/huge.txt" ? 99 : 1, isFile: true }),
      readBinary: async (path) => {
        reads.set(path, (reads.get(path) ?? 0) + 1);
        const value = bodies[path];
        if (value instanceof Error || !value) throw value ?? new Error("missing");
        return value;
      }
    };
    const processor = new ObservationProcessor({
      adapter,
      settings: () => ({ ...DEFAULT_SETTINGS, observationEnabled: true, observationRoots: ["Meetings"], excludedPaths: ["Archive"], maxSourceBytes: 10 }),
      digest: testDigest, canProcess: () => true, wait: async () => undefined, onChanged: vi.fn(), attempts: 3
    });
    await Promise.all(["Meetings/a.txt", "Meetings/a.txt", "Meetings/b.txt", "Meetings/bad.txt", "Meetings/huge.txt", "Archive/no.txt"].map((path) => processor.handleCreated(path)));
    expect(processor.inbox.entries().map((entry) => entry.path).sort()).toEqual(["Meetings/a.txt", "Meetings/b.txt"]);
    expect(reads.get("Meetings/a.txt")).toBe(2);
    expect(reads.get("Meetings/b.txt")).toBe(2);
    expect(reads.has("Meetings/huge.txt")).toBe(false);
    expect(reads.has("Archive/no.txt")).toBe(false);
    expect(JSON.stringify(processor.inbox.entries())).not.toContain("private body");
  });
});

describe("observation prefilter and bounded retries", () => {
  const settings = { ...DEFAULT_SETTINGS, observationEnabled: true, observationRoots: ["Meetings"], excludedPaths: ["Meetings/Archive"], maxSourceBytes: 10 };

  function countingAdapter(size = 1): DiscoveryAdapter & { readonly lookups: string[]; readonly reads: string[] } {
    const lookups: string[] = [];
    const reads: string[] = [];
    return {
      lookups,
      reads,
      listFiles: () => [],
      fileForPath: (path) => {
        lookups.push(path);
        return { path, extension: path.split(".").pop() ?? "", size, isFile: true };
      },
      readBinary: async (path) => {
        reads.push(path);
        return encoder.encode("body");
      }
    };
  }

  it("never counts non-candidate paths as pending work or reads them", async () => {
    const adapter = countingAdapter();
    const wait = vi.fn(async () => undefined);
    const processor = new ObservationProcessor({
      adapter, settings: () => settings, digest: testDigest, canProcess: () => true, wait, onChanged: vi.fn()
    });
    const paths = [
      ...Array.from({ length: 300 }, (_, index) => `Meetings/note ${index}.md`),
      ...Array.from({ length: 300 }, (_, index) => `Meetings/image ${index}.png`),
      "Meetings/.hidden/one.txt",
      "Meetings/Archive/old.txt",
      "Elsewhere/one.txt",
      "Meetings/disabled.srt"
    ];
    const handled = paths.map((path) => processor.handleCreated(path));
    expect(processor.pendingCount).toBe(0);
    await Promise.all(handled);
    expect(adapter.lookups).toEqual([]);
    expect(adapter.reads).toEqual([]);
    expect(wait).not.toHaveBeenCalled();
  });

  it("does not count a disabled format as pending work", async () => {
    const adapter = countingAdapter();
    const processor = new ObservationProcessor({
      adapter, settings: () => ({ ...settings, enabledFormats: ["vtt"] }), digest: testDigest, canProcess: () => true, wait: async () => undefined, onChanged: vi.fn()
    });
    const handled = processor.handleCreated("Meetings/one.txt");
    expect(processor.pendingCount).toBe(0);
    await handled;
    expect(adapter.lookups).toEqual([]);
  });

  it("stops after one attempt for an oversized transcript", async () => {
    const adapter = countingAdapter(99);
    const wait = vi.fn(async () => undefined);
    const result = await discoverStableTranscript(adapter, "Meetings/huge.txt", settings, new AbortController().signal, testDigest, { attempts: 4, wait });
    expect(result).toBeUndefined();
    expect(adapter.lookups).toEqual(["Meetings/huge.txt"]);
    expect(wait).not.toHaveBeenCalled();
    expect(adapter.reads).toEqual([]);
  });

  it("stops without waiting for a path that is not a candidate", async () => {
    const adapter = countingAdapter();
    const wait = vi.fn(async () => undefined);
    const result = await discoverStableTranscript(adapter, "Meetings/Archive/old.txt", settings, new AbortController().signal, testDigest, { attempts: 4, wait });
    expect(result).toBeUndefined();
    expect(adapter.lookups).toEqual([]);
    expect(wait).not.toHaveBeenCalled();
  });

  it("keeps retrying a transcript that is still empty while it is being written", async () => {
    const adapter = changingAdapter("Meetings/one.txt", [new Uint8Array(), encoder.encode("body"), encoder.encode("body")]);
    const wait = vi.fn(async () => undefined);
    const result = await discoverStableTranscript(adapter, "Meetings/one.txt", settings, new AbortController().signal, testDigest, { attempts: 4, wait });
    expect(result?.classification).toBe("eligible");
    expect(wait).toHaveBeenCalledTimes(2);
  });
});

describe("reviewed inbox handoff", () => {
  it("replans current files, reports a new destination collision, and removes missing entries", async () => {
    const inbox = new TranscriptInbox();
    inbox.upsert(evidence("Meetings/current.txt", "old"));
    inbox.upsert(evidence("Meetings/missing.txt", "gone"));
    const bytes = encoder.encode("current body");
    const files: VaultFileRef[] = [
      { path: "Meetings/current.txt", extension: "txt", size: bytes.byteLength, isFile: true },
      { path: "Meetings/current.md", extension: "md", size: 4, isFile: true }
    ];
    let mutations = 0;
    const adapter: DiscoveryAdapter = {
      listFiles: () => files,
      fileForPath: (path) => files.find((file) => file.path === path),
      readBinary: async (path) => path.endsWith(".txt") ? bytes : encoder.encode("existing")
    };
    const plan = await planTranscriptInbox(inbox, adapter, DEFAULT_SETTINGS, testDigest, new Date(0), () => "inbox");
    expect(plan?.items).toHaveLength(1);
    expect(plan?.items[0].classification).toBe("destination-exists");
    expect(inbox.entries().map((entry) => entry.path)).toEqual(["Meetings/current.txt"]);
    expect(mutations).toBe(0);
  });

  it("returns no plan when every queued file vanished", async () => {
    const inbox = new TranscriptInbox();
    inbox.upsert(evidence("missing.txt", "gone"));
    const adapter: DiscoveryAdapter = { listFiles: () => [], fileForPath: () => undefined, readBinary: async () => { throw new Error("unexpected"); } };
    expect(await planTranscriptInbox(inbox, adapter, DEFAULT_SETTINGS, testDigest, new Date(0), () => "none")).toBeUndefined();
    expect(inbox.size).toBe(0);
  });
});
