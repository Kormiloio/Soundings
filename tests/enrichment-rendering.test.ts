import { describe, expect, it } from "vitest";
import { destinationForEnrichment, renderCompanionMarkdown } from "../src/core/enrichment-rendering";
import { EnrichmentDraft } from "../src/core/enrichment-draft";

describe("enrichment rendering", () => {
  it("derives a safe adjacent destination", () => {
    expect(destinationForEnrichment("folder/note.md").value).toBe("folder/note - Enrichment.md");
    expect(destinationForEnrichment("root_note.md").value).toBe("root_note - Enrichment.md");
  });

  it("rejects invalid source notes", () => {
    expect(destinationForEnrichment("folder/note").ok).toBe(false);
    expect(destinationForEnrichment("folder/.hidden.md").ok).toBe(false);
  });

  it("handles unsafe basenames by normalizing them", () => {
    expect(destinationForEnrichment("folder/note:invalid.md").value).toBe("folder/note - invalid - Enrichment.md");
  });

  it("renders a complete companion note with structured content", () => {
    const draft: EnrichmentDraft = {
      summary: "Quick summary",
      decisions: ["D1", "D2"],
      actionItems: ["A1"],
      followUps: []
    };
    const markdown = renderCompanionMarkdown("folder/note.md", draft, "2026-09-27T10:00:00Z");
    
    expect(markdown).toContain('type: "enrichment"');
    expect(markdown).toContain('source_note: "folder/note.md"');
    expect(markdown).toContain('converted_at: "2026-09-27T10:00:00Z"');
    expect(markdown).toContain("## Summary\n\nQuick summary");
    expect(markdown).toContain("- D1\n- D2");
    expect(markdown).toContain("- A1");
    expect(markdown).toContain("> None recorded.");
    expect(markdown).toContain("[[note|Back to Transcript Note]]");
  });

  it("renders a companion note with empty draft defaults", () => {
    const draft: EnrichmentDraft = {
      summary: "",
      decisions: [],
      actionItems: [],
      followUps: []
    };
    const markdown = renderCompanionMarkdown("note.md", draft, "2026-09-27T10:00:00Z");
    expect(markdown).toContain("> Not provided.");
    expect(markdown).toContain("> None recorded.");
  });
});
