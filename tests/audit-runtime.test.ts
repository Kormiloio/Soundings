import { describe, expect, it } from "vitest";
import { executeEnrichmentPlan } from "../src/core/enrichment-execution";
import type { PublicationAdapter } from "../src/core/execution";
import { buildEnrichmentPlan } from "../src/core/enrichment-planning";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { sha256 } from "../src/core/hash";
import { testDigest } from "./test-crypto";

class ForbiddenAdapter implements PublicationAdapter {
  private readonly calls: string[] = [];

  async readBinary(path: string): Promise<Uint8Array> {
    this.calls.push(`readBinary(${JSON.stringify(path)})`);
    throw new Error("Forbidden: readBinary");
  }

  exists(path: string): boolean {
    this.calls.push(`exists(${JSON.stringify(path)})`);
    return false;
  }

  async createBinary(path: string, _bytes: Uint8Array): Promise<void> {
    this.calls.push(`createBinary(${JSON.stringify(path)})`);
  }

  getCalls(): readonly string[] {
    return Object.freeze([...this.calls]);
  }
}

describe("enrichment security audit", () => {
  it("strictly limits adapter calls to the allowed set", async () => {
    const adapter = new ForbiddenAdapter();
    const sourcePath = "transcript.md";
    const bytes = new TextEncoder().encode("---\ntype: \"meeting-transcript\"\nsource: \"transcript\"\nsoundings_version: 1\n---\n# Title");
    const evidence = await identifySourceNote(sourcePath, bytes, 5_000_000, (data) => sha256(data, testDigest));
    
    if (!evidence.ok || !evidence.value) throw new Error("Setup failed");

    const draft = {
      summary: "Summary",
      decisions: [],
      actionItems: [],
      followUps: []
    };

    const plan = buildEnrichmentPlan(
      sourcePath,
      evidence.value,
      draft,
      new Set(),
      new Date(),
      "test-plan"
    );

    try {
      await executeEnrichmentPlan(plan, adapter, {
        digest: testDigest,
        maxSourceBytes: 5_000_000
      });
    } catch {
      // Expected failure from ForbiddenAdapter
    }

    const calls = adapter.getCalls();
    
    const forbiddenMethods = ["remove", "move", "rename", "delete"];
    const hasForbiddenCall = calls.some(call => 
      forbiddenMethods.some(method => call.startsWith(method))
    );
    
    expect(hasForbiddenCall).toBe(false);
  });
});
