import { describe, expect, it } from "vitest";
import { buildEnrichmentPlan } from "../src/core/enrichment-planning";
import { executeEnrichmentPlan } from "../src/core/enrichment-execution";
import type { PublicationAdapter } from "../src/core/execution";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { sha256 } from "../src/core/hash";
import { testDigest } from "./test-crypto";

const encoder = new TextEncoder();

class MemoryPublicationAdapter implements PublicationAdapter {
  readonly files = new Map<string, Uint8Array>();
  createHook?: (path: string, bytes: Uint8Array) => void | Promise<void>;
  corruptReadback = false;

  async readBinary(path: string): Promise<Uint8Array> {
    const value = this.files.get(path);
    if (!value) throw new Error("missing");
    if (this.corruptReadback && path.endsWith("Enrichment.md")) return encoder.encode("corrupt");
    return new Uint8Array(value);
  }

  exists(path: string): boolean {
    return this.files.has(path);
  }

  async createBinary(path: string, bytes: Uint8Array): Promise<void> {
    await this.createHook?.(path, bytes);
    if (this.files.has(path)) throw new Error("exists");
    this.files.set(path, new Uint8Array(bytes));
  }
}

async function evidenceFor(path: string, body: string) {
  const bytes = encoder.encode(body);
  const identified = await identifySourceNote(path, bytes, 5_000_000, (data) => sha256(data, testDigest));
  if (!identified.ok || !identified.value) throw new Error("invalid fixture");
  return identified.value;
}

describe("enrichment execution", () => {
  it("creates and verifies a companion note", async () => {
    const sourcePath = "meetings/note.md";
    const body = '---\ntype: "meeting-transcript"\nsoundings_version: 1\n---\n# Title';
    const vault = new MemoryPublicationAdapter();
    vault.files.set(sourcePath, encoder.encode(body));
    const evidence = await evidenceFor(sourcePath, body);
    const draft = Object.freeze({
      summary: "Done",
      decisions: ["A"],
      actionItems: [] as readonly string[],
      followUps: [] as readonly string[]
    });
    const plan = buildEnrichmentPlan(sourcePath, evidence, draft, new Set(), new Date(0), "p1");
    const outcome = await executeEnrichmentPlan(plan, vault, { digest: testDigest, maxSourceBytes: 5_000_000 });
    expect(outcome.status).toBe("created");
    expect(vault.files.has("meetings/note - Enrichment.md")).toBe(true);
    expect(vault.files.get(sourcePath)).toEqual(encoder.encode(body));
  });

  it("refuses stale source evidence", async () => {
    const sourcePath = "note.md";
    const vault = new MemoryPublicationAdapter();
    vault.files.set(sourcePath, encoder.encode('---\ntype: "meeting-transcript"\nsoundings_version: 1\n---\n# New'));
    const evidence = await evidenceFor(sourcePath, '---\ntype: "meeting-transcript"\nsoundings_version: 1\n---\n# Old');
    const draft = Object.freeze({
      summary: "x",
      decisions: [] as readonly string[],
      actionItems: [] as readonly string[],
      followUps: [] as readonly string[]
    });
    const plan = buildEnrichmentPlan(sourcePath, evidence, draft, new Set(), new Date(0), "p1");
    const outcome = await executeEnrichmentPlan(plan, vault, { digest: testDigest, maxSourceBytes: 5_000_000 });
    expect(outcome.status).toBe("stale");
    expect(vault.files.has("note - Enrichment.md")).toBe(false);
  });

  it("refuses destination races", async () => {
    const sourcePath = "note.md";
    const body = '---\ntype: "meeting-transcript"\nsoundings_version: 1\n---\n# Title';
    const vault = new MemoryPublicationAdapter();
    vault.files.set(sourcePath, encoder.encode(body));
    vault.createHook = (path) => {
      vault.files.set(path, encoder.encode("existing"));
    };
    const evidence = await evidenceFor(sourcePath, body);
    const draft = Object.freeze({
      summary: "x",
      decisions: [] as readonly string[],
      actionItems: [] as readonly string[],
      followUps: [] as readonly string[]
    });
    const plan = buildEnrichmentPlan(sourcePath, evidence, draft, new Set(), new Date(0), "p1");
    const outcome = await executeEnrichmentPlan(plan, vault, { digest: testDigest, maxSourceBytes: 5_000_000 });
    expect(outcome.status).toBe("blocked");
  });

  it("cancels before publication", async () => {
    const sourcePath = "note.md";
    const body = '---\ntype: "meeting-transcript"\nsoundings_version: 1\n---\n# Title';
    const vault = new MemoryPublicationAdapter();
    vault.files.set(sourcePath, encoder.encode(body));
    const evidence = await evidenceFor(sourcePath, body);
    const draft = Object.freeze({
      summary: "x",
      decisions: [] as readonly string[],
      actionItems: [] as readonly string[],
      followUps: [] as readonly string[]
    });
    const plan = buildEnrichmentPlan(sourcePath, evidence, draft, new Set(), new Date(0), "p1");
    const controller = new AbortController();
    controller.abort();
    const outcome = await executeEnrichmentPlan(plan, vault, {
      signal: controller.signal,
      digest: testDigest,
      maxSourceBytes: 5_000_000
    });
    expect(outcome.status).toBe("canceled");
    expect(vault.files.has("note - Enrichment.md")).toBe(false);
  });

  it("reports verification failures without leaking bodies", async () => {
    const sourcePath = "note.md";
    const body = '---\ntype: "meeting-transcript"\nsoundings_version: 1\n---\n# Title';
    const vault = new MemoryPublicationAdapter();
    vault.files.set(sourcePath, encoder.encode(body));
    vault.corruptReadback = true;
    const evidence = await evidenceFor(sourcePath, body);
    const draft = Object.freeze({
      summary: "secret summary",
      decisions: [] as readonly string[],
      actionItems: [] as readonly string[],
      followUps: [] as readonly string[]
    });
    const plan = buildEnrichmentPlan(sourcePath, evidence, draft, new Set(), new Date(0), "p1");
    const outcome = await executeEnrichmentPlan(plan, vault, { digest: testDigest, maxSourceBytes: 5_000_000 });
    expect(outcome.status).toBe("needs-attention");
    expect(JSON.stringify(outcome)).not.toContain("secret summary");
  });
});
