import { describe, expect, it } from "vitest";
import { executePlan, RunCoordinator, type PublicationAdapter } from "../src/core/execution";
import { sha256 } from "../src/core/hash";
import { buildPlan } from "../src/core/planning";
import { DEFAULT_SETTINGS, DEFAULT_OUTPUT_PROFILE } from "../src/core/settings";
import type { DiscoveryItem } from "../src/core/discovery";
import { testDigest } from "./test-crypto";

const encoder = new TextEncoder();

class MemoryPublicationAdapter implements PublicationAdapter {
  readonly files = new Map<string, Uint8Array>();
  createHook?: (path: string, bytes: Uint8Array) => void | Promise<void>;
  corruptReadback = false;
  failReads = new Set<string>();

  async readBinary(path: string): Promise<Uint8Array> {
    if (this.failReads.has(path)) throw new Error("read-failed with private body");
    const value = this.files.get(path);
    if (!value) throw new Error("missing");
    if (this.corruptReadback && path.endsWith(".md")) return encoder.encode("corrupt");
    return new Uint8Array(value);
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  async existsOnDisk(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async createBinary(path: string, bytes: Uint8Array): Promise<void> {
    await this.createHook?.(path, bytes);
    if (this.files.has(path)) throw new Error("exists");
    this.files.set(path, new Uint8Array(bytes));
  }
}

async function item(path: string, body: string): Promise<DiscoveryItem> {
  const bytes = encoder.encode(body);
  const format = path.endsWith(".vtt") ? "vtt" : "txt";
  return {
    sourcePath: path,
    format,
    classification: "eligible",
    reason: "Ready",
    evidence: { path, format, byteLength: bytes.byteLength, sha256: await sha256(bytes, testDigest) }
  };
}

describe("per-item isolation", () => {
  it("reports an unexpected render error as failed and continues the batch", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one.txt", encoder.encode("one"));
    vault.files.set("two.txt", encoder.encode("two"));
    const plan = buildPlan([await item("one.txt", "one"), await item("two.txt", "two")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    let calls = 0;
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["one.txt", "two.txt"]),
      settings: DEFAULT_SETTINGS,
      digest: testDigest,
      now: () => (calls++ === 0 ? new Date(Number.NaN) : new Date(0))
    });
    expect(outcomes.map((entry) => entry.status)).toEqual(["failed", "created"]);
    expect(outcomes[0].reason).toContain("render-failed");
    expect(vault.files.has("one.md")).toBe(false);
    expect(vault.files.has("two.md")).toBe(true);
  });

  it("reports an unexpected adapter error as needs-attention and continues the batch", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one.txt", encoder.encode("one"));
    vault.files.set("two.txt", encoder.encode("two"));
    const plan = buildPlan([await item("one.txt", "one"), await item("two.txt", "two")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const exists = vault.exists.bind(vault);
    vault.exists = (path: string) => {
      if (path === "one.md") throw new Error("index failure with private body");
      return exists(path);
    };
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["one.txt", "two.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest, now: () => new Date(0)
    });
    expect(outcomes.map((entry) => entry.status)).toEqual(["needs-attention", "created"]);
    expect(JSON.stringify(outcomes)).not.toContain("private body");
  });
});

describe("safe execution", () => {
  it("creates and verifies only selected eligible notes", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one.txt", encoder.encode("hello"));
    vault.files.set("two.txt", encoder.encode("two"));
    const plan = buildPlan([await item("one.txt", "hello"), await item("two.txt", "two")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["one.txt"]), settings: DEFAULT_SETTINGS, now: () => new Date(0), digest: testDigest
    });
    expect(outcomes.map((entry) => entry.status)).toEqual(["created", "skipped"]);
    expect(vault.files.has("one.md")).toBe(true);
    expect(vault.files.has("two.md")).toBe(false);
    expect(new TextDecoder().decode(vault.files.get("one.txt"))).toBe("hello");
  });

  it("refuses changed and missing sources as stale", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("changed: transcript.txt", encoder.encode("new private body"));
    const plan = buildPlan([await item("changed: transcript.txt", "old private body"), await item("missing: transcript.txt", "gone")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["changed: transcript.txt", "missing: transcript.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest
    });
    expect(outcomes.map((entry) => entry.status)).toEqual(["stale", "stale"]);
    expect(vault.files.has("changed - transcript.md")).toBe(false);
    expect(vault.files.has("missing - transcript.md")).toBe(false);
    expect(JSON.stringify(outcomes)).not.toContain("private body");
  });

  it("refuses settings changed after preview", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one.txt", encoder.encode("one"));
    const plan = buildPlan([await item("one.txt", "one")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["one.txt"]), settings: { ...DEFAULT_SETTINGS, maxSourceBytes: 99 }, digest: testDigest
    });
    expect(outcomes[0].status).toBe("stale");
    expect(vault.files.has("one.md")).toBe(false);
  });

  it("refuses settings whose output profile changed after preview (plan settings fingerprint)", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one.txt", encoder.encode("one"));
    const plan = buildPlan([await item("one.txt", "one")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["one.txt"]),
      settings: { ...DEFAULT_SETTINGS, outputProfile: { ...DEFAULT_OUTPUT_PROFILE, timestampPolicy: "retain" } },
      digest: testDigest
    });
    expect(outcomes[0]).toMatchObject({ status: "stale", reason: "Settings changed after preview." });
    expect(vault.files.has("one.md")).toBe(false);
  });

  it("refuses a mutable output profile changed after preview even when settings still match (item fingerprint)", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one.txt", encoder.encode("one"));
    const profile = { ...DEFAULT_OUTPUT_PROFILE, staticTags: [] as string[] };
    const planningSettings = { ...DEFAULT_SETTINGS, outputProfile: profile };
    const plan = buildPlan([await item("one.txt", "one")], new Set(), planningSettings, new Date(0), () => "p1");
    const reviewedSettings = { ...DEFAULT_SETTINGS, outputProfile: { ...profile, staticTags: [] } };
    profile.timestampPolicy = "retain";
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["one.txt"]), settings: reviewedSettings, digest: testDigest
    });
    expect(outcomes[0]).toMatchObject({ status: "stale", reason: "Output profile changed after preview." });
    expect(vault.files.has("one.md")).toBe(false);
  });

  it("fails closed without an injected secure digest", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one.txt", encoder.encode("one"));
    const plan = buildPlan([await item("one.txt", "one")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["one.txt"]), settings: DEFAULT_SETTINGS
    });
    expect(outcomes[0]).toMatchObject({ status: "failed", reason: "Secure source hashing is unavailable." });
    expect(vault.files.has("one.md")).toBe(false);
  });

  it("preserves a destination that wins the create race", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one: review.txt", encoder.encode("one"));
    vault.createHook = (path) => { vault.files.set(path, encoder.encode("winner")); };
    const plan = buildPlan([await item("one: review.txt", "one")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, { selectedSourcePaths: new Set(["one: review.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest });
    expect(outcomes[0].status).toBe("blocked");
    expect(new TextDecoder().decode(vault.files.get("one - review.md"))).toBe("winner");
  });

  it("reports mismatched or unreadable final bytes as needs-attention without deletion", async () => {
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one.txt", encoder.encode("one"));
    vault.corruptReadback = true;
    const plan = buildPlan([await item("one.txt", "one")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, { selectedSourcePaths: new Set(["one.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest });
    expect(outcomes[0].status).toBe("needs-attention");
    expect(vault.files.has("one.md")).toBe(true);
    expect(vault.files.has("one.txt")).toBe(true);
  });

  it("settles an indivisible create then cancels later items", async () => {
    const controller = new AbortController();
    const vault = new MemoryPublicationAdapter();
    vault.files.set("one: first.txt", encoder.encode("one"));
    vault.files.set("two: second.txt", encoder.encode("two"));
    vault.createHook = () => controller.abort();
    const plan = buildPlan([await item("one: first.txt", "one"), await item("two: second.txt", "two")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["one: first.txt", "two: second.txt"]), settings: DEFAULT_SETTINGS, signal: controller.signal, digest: testDigest
    });
    expect(outcomes.map((entry) => entry.status)).toEqual(["created", "canceled"]);
    expect(vault.files.has("one - first.md")).toBe(true);
    expect(vault.files.has("two - second.md")).toBe(false);
  });

  it("isolates parse failure and continues a valid item", async () => {
    const vault = new MemoryPublicationAdapter();
    const malformed = "not webvtt";
    vault.files.set("bad: transcript.vtt", encoder.encode(malformed));
    vault.files.set("good.txt", encoder.encode("good"));
    const plan = buildPlan([await item("bad: transcript.vtt", malformed), await item("good.txt", "good")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["bad: transcript.vtt", "good.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest
    });
    expect(outcomes.map((entry) => entry.status)).toEqual(["failed", "created"]);
    expect(vault.files.has("bad - transcript.md")).toBe(false);
  });

  it("reports a normalized destination create failure without a partial note", async () => {
    const vault = new MemoryPublicationAdapter();
    const sourcePath = "cannot: create.txt";
    const destinationPath = "cannot - create.md";
    vault.files.set(sourcePath, encoder.encode("source"));
    vault.createHook = () => { throw new Error("create failed"); };
    const plan = buildPlan([await item(sourcePath, "source")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set([sourcePath]), settings: DEFAULT_SETTINGS, digest: testDigest
    });
    expect(outcomes[0]).toMatchObject({ destinationPath, status: "failed", reason: "Destination could not be created." });
    expect(vault.files.has(destinationPath)).toBe(false);
    expect(new TextDecoder().decode(vault.files.get(sourcePath))).toBe("source");
  });
});

describe("run coordinator", () => {
  it("serializes owners and cancels the active run", () => {
    const coordinator = new RunCoordinator();
    const signal = coordinator.begin();
    expect(() => coordinator.begin()).toThrow("soundings-run-active");
    coordinator.cancel();
    expect(signal.aborted).toBe(true);
    coordinator.finish(signal);
    expect(coordinator.isActive).toBe(false);
  });
});
