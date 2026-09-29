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
    expect(markdown).toContain("[[folder/note|Back to Transcript Note]]");
  });

  it("uses the full vault path to disambiguate duplicate note names", () => {
    const draft: EnrichmentDraft = { summary: "Reviewed", decisions: [], actionItems: [], followUps: [] };
    const alpha = renderCompanionMarkdown("Projects/Alpha/Meeting.md", draft, "2026-09-27T10:00:00Z");
    const beta = renderCompanionMarkdown("Projects/Beta/Meeting.md", draft, "2026-09-27T10:00:00Z");
    expect(alpha).toContain("[[Projects/Alpha/Meeting|Back to Transcript Note]]");
    expect(beta).toContain("[[Projects/Beta/Meeting|Back to Transcript Note]]");
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

  it("preserves natural punctuation and multiline paragraphs in summary and list items", () => {
    const draft: EnrichmentDraft = {
      summary: "First paragraph.\n\nSecond paragraph (with details!).\n## Injected Heading",
      decisions: ["Approve v0.2.0 release (unanimous)."],
      actionItems: ["- Check documentation! (urgent)"],
      followUps: ["Schedule demo on Friday?"]
    };
    const markdown = renderCompanionMarkdown("folder/note.md", draft, "2026-09-27T10:00:00Z");
    expect(markdown).toContain("## Summary\n\nFirst paragraph.\n\nSecond paragraph (with details!).\n\\## Injected Heading");
    expect(markdown).toContain("- Approve v0.2.0 release (unanimous).");
    expect(markdown).toContain("- \\- Check documentation! (urgent)");
    expect(markdown).toContain("- Schedule demo on Friday?");
  });
});
