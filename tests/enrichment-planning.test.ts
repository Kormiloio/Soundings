import { describe, expect, it } from "vitest";
import { buildEnrichmentPlan } from "../src/core/enrichment-planning";
import type { SourceNoteEvidence } from "../src/core/enrichment-evidence";

const evidence: SourceNoteEvidence = Object.freeze({
  path: "meetings/note.md",
  byteLength: 100,
  sha256: "abc",
  soundingsVersion: 1
});

const draft = Object.freeze({
  summary: "Summary text",
  decisions: ["D1"],
  actionItems: [] as readonly string[],
  followUps: [] as readonly string[]
});

describe("enrichment planning", () => {
  it("plans a ready publication when the destination is absent", () => {
    const plan = buildEnrichmentPlan(
      "meetings/note.md",
      evidence,
      draft,
      new Set(["other.md"]),
      new Date("2026-09-27T12:00:00.000Z"),
      "plan-1"
    );
    expect(plan.status).toBe("ready");
    expect(plan.destinationPath).toBe("meetings/note - Enrichment.md");
    expect(plan.renderedMarkdown).toContain("Summary text");
  });

  it("blocks empty enrichment", () => {
    const plan = buildEnrichmentPlan(
      "meetings/note.md",
      evidence,
      { summary: "", decisions: [], actionItems: [], followUps: [] },
      new Set(),
      new Date("2026-09-27T12:00:00.000Z"),
      "plan-2"
    );
    expect(plan.status).toBe("empty");
  });

  it("blocks destination collisions", () => {
    const plan = buildEnrichmentPlan(
      "meetings/note.md",
      evidence,
      draft,
      new Set(["meetings/note - Enrichment.md"]),
      new Date("2026-09-27T12:00:00.000Z"),
      "plan-3"
    );
    expect(plan.status).toBe("destination-exists");
  });
});
