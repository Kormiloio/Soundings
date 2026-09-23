import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/core/rendering";
import type { NoteMetadata, ParsedTranscript } from "../src/core/types";

const metadata: NoteMetadata = {
  sourceFile: "Meeting: \"one\".vtt",
  sourceFormat: "vtt",
  title: "Meeting #1",
  convertedAt: "2026-09-22T14:30:00.000Z",
  project: "Pro: [MBA]"
};

function parseFrontmatter(markdown: string): Record<string, unknown> {
  const body = markdown.split("---\n")[1];
  return Object.fromEntries(body.trim().split("\n").map((line) => {
    const separator = line.indexOf(":");
    const key = line.slice(0, separator);
    const raw = line.slice(separator + 1).trim();
    return [key, raw.startsWith("\"") ? JSON.parse(raw) : Number(raw) || raw];
  }));
}

describe("Markdown rendering", () => {
  it("emits parseable versioned metadata", () => {
    const transcript: ParsedTranscript = { format: "vtt", blocks: [{ text: "Hello" }] };
    const markdown = renderMarkdown(transcript, metadata);
    expect(parseFrontmatter(markdown)).toMatchObject({
      type: "meeting-transcript",
      source_file: "Meeting: \"one\".vtt",
      source_format: "vtt",
      soundings_version: 1,
      project: "Pro: [MBA]"
    });
  });

  it("keeps untrusted transcript text inert inside a dynamic literal fence", () => {
    const attack = "---\n# Heading\n<script>x</script>\n~~~\n![[Secret]]\n[remote](https://example.invalid)";
    const markdown = renderMarkdown({ format: "txt", blocks: [{ text: attack, speaker: "<Admin> #" }] }, metadata);
    expect(markdown).toContain("~~~~text\n");
    expect(markdown).toContain(attack);
    expect(markdown).toContain("### \\<Admin\\> \\#");
    expect(markdown.split("---")).toHaveLength(4);
  });

  it("is byte deterministic with fixed metadata and marks enrichment as absent", () => {
    const transcript: ParsedTranscript = { format: "txt", blocks: [{ text: "Same input" }] };
    const first = renderMarkdown(transcript, metadata);
    expect(renderMarkdown(transcript, metadata)).toBe(first);
    expect(first).toContain("> Not generated.");
    expect(first).toContain("## Decisions\n\n## Action Items");
  });
});
