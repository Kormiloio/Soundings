import { describe, expect, it } from "vitest";
import {
  enrichmentDraftFingerprint,
  enrichmentDraftHasContent,
  validateEnrichmentDraft,
  type EnrichmentDraft
} from "../src/core/enrichment-draft";

describe("enrichment draft validation", () => {
  it("accepts a valid draft", () => {
    const input: Partial<EnrichmentDraft> = {
      summary: "Great meeting",
      decisions: ["Decision 1"],
      actionItems: ["Action 1"],
      followUps: ["Follow-up 1"]
    };
    const result = validateEnrichmentDraft(input);
    expect(result.errors).toEqual([]);
    expect(result.draft).toMatchObject(input);
  });

  it("accepts an empty draft", () => {
    const result = validateEnrichmentDraft({});
    expect(result.errors).toEqual([]);
    expect(result.draft).toEqual({
      summary: "",
      decisions: [],
      actionItems: [],
      followUps: []
    });
  });

  it("rejects non-string summary", () => {
    const result = validateEnrichmentDraft({ summary: 123 as any });
    expect(result.errors).toContain("Summary must be a string.");
    expect(result.draft).toBeUndefined();
  });

  it("rejects oversized summary", () => {
    const result = validateEnrichmentDraft({ summary: "a".repeat(10001) });
    expect(result.errors).toContain("Summary exceeds maximum size of 10000 bytes.");
    expect(result.draft).toBeUndefined();
  });

  it("rejects non-array lists", () => {
    const result = validateEnrichmentDraft({ decisions: "not-an-array" as any });
    expect(result.errors).toContain("Decisions must be an array.");
    expect(result.draft).toBeUndefined();
  });

  it("rejects non-string list items", () => {
    const result = validateEnrichmentDraft({ decisions: [123] as any });
    expect(result.errors).toContain("Items in Decisions must be strings.");
    expect(result.draft).toBeUndefined();
  });

  it("rejects oversized list items", () => {
    const result = validateEnrichmentDraft({ decisions: ["a".repeat(10001)] });
    expect(result.errors).toContain("Items in Decisions cannot exceed 10000 bytes.");
    expect(result.draft).toBeUndefined();
  });

  it("rejects total oversized draft", () => {
    const result = validateEnrichmentDraft({
      summary: "a".repeat(10000),
      decisions: ["a".repeat(10000), "a".repeat(10000), "a".repeat(10000), "a".repeat(10000)],
      actionItems: ["a".repeat(10000)]
    });
    expect(result.errors).toContain("Total enrichment content exceeds maximum limit of 50000 bytes.");
    expect(result.draft).toBeUndefined();
  });

  it("detects empty and non-empty drafts", () => {
    expect(enrichmentDraftHasContent({ summary: "", decisions: [], actionItems: [], followUps: [] })).toBe(false);
    expect(enrichmentDraftHasContent({ summary: "x", decisions: [], actionItems: [], followUps: [] })).toBe(true);
    expect(enrichmentDraftFingerprint({ summary: "a", decisions: [], actionItems: [], followUps: [] }))
      .not.toBe(enrichmentDraftFingerprint({ summary: "b", decisions: [], actionItems: [], followUps: [] }));
  });

  it("handles valid Unicode characters correctly", () => {
    const input = {
      summary: "🌟 Unicode summary",
      decisions: ["✅ Valid", "🚀 Ready"],
    };
    const result = validateEnrichmentDraft(input as any);
    expect(result.errors).toHaveLength(0);
  });
});
