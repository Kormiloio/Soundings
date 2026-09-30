import { describe, expect, it } from "vitest";
import type { DiscoveryItem } from "../src/core/discovery";
import { buildEnrichmentPlan } from "../src/core/enrichment-planning";
import { executeEnrichmentPlan } from "../src/core/enrichment-execution";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { executePlan, type PublicationAdapter } from "../src/core/execution";
import { sha256 } from "../src/core/hash";
import { buildPlan, collisionKey, destinationFor } from "../src/core/planning";
import { DEFAULT_SETTINGS } from "../src/core/settings";
import { testDigest } from "./test-crypto";

const encoder = new TextEncoder();

/**
 * Models a case-insensitive desktop filesystem (macOS APFS default) whose vault index is exact-match
 * and omits hidden files, like Obsidian's in-memory index.
 */
class CaseInsensitiveVault implements PublicationAdapter {
  readonly disk = new Map<string, { readonly path: string; readonly bytes: Uint8Array }>();
  readonly creates: string[] = [];

  put(path: string, body: string): void {
    this.disk.set(collisionKey(path), { path, bytes: encoder.encode(body) });
  }

  private indexed(path: string): boolean {
    const entry = this.disk.get(collisionKey(path));
    return entry !== undefined && entry.path === path && !path.split("/").some((segment) => segment.startsWith("."));
  }

  async readBinary(path: string): Promise<Uint8Array> {
    const entry = this.disk.get(collisionKey(path));
    if (!entry) throw new Error("missing");
    return new Uint8Array(entry.bytes);
  }

  exists(path: string): boolean {
    return this.indexed(path);
  }

  async existsOnDisk(path: string): Promise<boolean> {
    return this.disk.has(collisionKey(path));
  }

  async createBinary(path: string, bytes: Uint8Array): Promise<void> {
    this.creates.push(path);
    if (this.disk.has(collisionKey(path))) throw new Error("exists");
    this.disk.set(collisionKey(path), { path, bytes: new Uint8Array(bytes) });
  }
}

async function eligible(path: string, body: string): Promise<DiscoveryItem> {
  const bytes = encoder.encode(body);
  const format = path.toLowerCase().endsWith(".vtt") ? "vtt" : "txt";
  return {
    sourcePath: path,
    format,
    classification: "eligible",
    reason: "Ready",
    evidence: { path, format, byteLength: bytes.byteLength, sha256: await sha256(bytes, testDigest) }
  };
}

describe("collision identity", () => {
  it("folds letter case and Unicode composition", () => {
    expect(collisionKey("a/Bar.md")).toBe(collisionKey("A/bar.MD"));
    expect(collisionKey("Café.md")).toBe(collisionKey("Café.md"));
    expect(collisionKey("a/Bar.md")).not.toBe(collisionKey("a/Baz.md"));
  });

  it("blocks a source whose destination exists with different letter case", async () => {
    const plan = buildPlan([await eligible("a/Bar.txt", "x")], new Set(["a/bar.md"]), DEFAULT_SETTINGS, new Date(0), () => "p");
    expect(plan.items[0].classification).toBe("destination-exists");
    expect(plan.items[0].destinationPath).toBe("a/Bar.md");
  });

  it("blocks a source whose destination exists in another Unicode composition", async () => {
    const plan = buildPlan([await eligible("Café.txt", "x")], new Set(["Café.md"]), DEFAULT_SETTINGS, new Date(0), () => "p");
    expect(plan.items[0].classification).toBe("destination-exists");
  });

  it("blocks sources that differ only by letter case as ambiguous", async () => {
    const plan = buildPlan([await eligible("a/Foo.txt", "x"), await eligible("a/foo.vtt", "y")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p");
    expect(plan.items.map((entry) => entry.classification)).toEqual(["destination-ambiguous", "destination-ambiguous"]);
  });

  it("blocks sources that differ only by Unicode composition as ambiguous", async () => {
    const plan = buildPlan([await eligible("Café.txt", "x"), await eligible("Café.vtt", "y")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p");
    expect(plan.items.map((entry) => entry.classification)).toEqual(["destination-ambiguous", "destination-ambiguous"]);
  });

  it("keeps distinct destinations eligible", async () => {
    const plan = buildPlan([await eligible("a/Foo.txt", "x"), await eligible("b/foo.txt", "y")], new Set(["a/Food.md"]), DEFAULT_SETTINGS, new Date(0), () => "p");
    expect(plan.items.map((entry) => entry.classification)).toEqual(["eligible", "eligible"]);
  });
});

describe("hidden destinations", () => {
  it.each(["Notes/?.env.txt", "Notes/:.hidden.vtt", ".txt.txt"])("refuses a dot-leading destination for %s", (source) => {
    expect(destinationFor(source)).toEqual({ ok: false, error: "destination-basename-hidden" });
  });

  it("classifies a dot-leading destination as invalid with an actionable reason", async () => {
    const plan = buildPlan([await eligible("Notes/?.env.txt", "x")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p");
    expect(plan.items[0].classification).toBe("destination-invalid");
    expect(plan.items[0].reason).toMatch(/start with a period/);
  });

  it("keeps names with inner periods eligible", () => {
    expect(destinationFor("Notes/v1.2 review.txt")).toEqual({ ok: true, value: "Notes/v1.2 review.md" });
  });
});

describe("execution-time filesystem existence check", () => {
  it("refuses a case-variant destination that the vault index does not report", async () => {
    const vault = new CaseInsensitiveVault();
    vault.put("a/Bar.txt", "hello");
    const plan = buildPlan([await eligible("a/Bar.txt", "hello")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p");
    vault.put("a/bar.md", "user note");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["a/Bar.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest
    });
    expect(outcomes[0].status).toBe("blocked");
    expect(vault.creates).toEqual([]);
    expect(new TextDecoder().decode(await vault.readBinary("a/bar.md"))).toBe("user note");
  });

  it("refuses a destination that exists on disk but is missing from the index", async () => {
    const vault = new CaseInsensitiveVault();
    vault.put("Meeting.txt", "hello");
    const plan = buildPlan([await eligible("Meeting.txt", "hello")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p");
    vault.disk.set(collisionKey("Meeting.md"), { path: "MEETING.md", bytes: encoder.encode("unindexed") });
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["Meeting.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest
    });
    expect(outcomes[0]).toMatchObject({ status: "blocked", reason: "Destination already exists." });
    expect(vault.creates).toEqual([]);
  });

  it("fails closed when the filesystem check itself fails", async () => {
    const vault = new CaseInsensitiveVault();
    vault.put("Meeting.txt", "hello");
    vault.existsOnDisk = async () => { throw new Error("adapter failure"); };
    const plan = buildPlan([await eligible("Meeting.txt", "hello")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["Meeting.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest
    });
    expect(outcomes[0].status).toBe("failed");
    expect(vault.creates).toEqual([]);
  });

  it("still creates when no variant exists", async () => {
    const vault = new CaseInsensitiveVault();
    vault.put("Meeting.txt", "hello");
    const plan = buildPlan([await eligible("Meeting.txt", "hello")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p");
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["Meeting.txt"]), settings: DEFAULT_SETTINGS, digest: testDigest
    });
    expect(outcomes[0].status).toBe("created");
  });

  it("refuses a case-variant companion destination at planning and at publication", async () => {
    const sourcePath = "meetings/note.md";
    const body = '---\ntype: "meeting-transcript"\nsource: "transcript"\nsoundings_version: 1\n---\n# Title';
    const vault = new CaseInsensitiveVault();
    vault.put(sourcePath, body);
    const identified = await identifySourceNote(sourcePath, encoder.encode(body), 5_000_000, (data) => sha256(data, testDigest));
    const draft = Object.freeze({ summary: "Done", decisions: [] as readonly string[], actionItems: [] as readonly string[], followUps: [] as readonly string[] });

    const blocked = buildEnrichmentPlan(sourcePath, identified.value!, draft, new Set(["meetings/NOTE - enrichment.md"]), new Date(0), "e1");
    expect(blocked.status).toBe("destination-exists");

    const plan = buildEnrichmentPlan(sourcePath, identified.value!, draft, new Set(), new Date(0), "e2");
    expect(plan.status).toBe("ready");
    vault.put("meetings/NOTE - enrichment.md", "user note");
    const outcome = await executeEnrichmentPlan(plan, vault, { digest: testDigest, maxSourceBytes: 5_000_000 });
    expect(outcome.status).toBe("blocked");
    expect(vault.creates).toEqual([]);
  });
});
