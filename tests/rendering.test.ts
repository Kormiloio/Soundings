import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/core/rendering";
import { DEFAULT_OUTPUT_PROFILE } from "../src/core/settings";
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

  it("renders configured sections, safely encoded tags, title, and retained cue times", () => {
    const profile = {
      ...DEFAULT_OUTPUT_PROFILE,
      titlePattern: "parent-folder-source-name" as const,
      enabledSections: ["summary", "action-items"] as const,
      staticTags: ["project/alpha", "yaml-safe"],
      timestampPolicy: "retain" as const
    };
    const markdown = renderMarkdown({
      format: "vtt",
      blocks: [{
        speaker: "Mario",
        text: "Discussed [[Excel]] and <iframe>.",
        timing: { start: "00:00:01.000", end: "00:00:03.000" }
      }]
    }, { ...metadata, title: "Alpha — Excel: Migration" }, profile);
    expect(markdown).toContain("soundings_version: 2");
    expect(markdown).toContain('tags: ["project/alpha","yaml-safe"]');
    expect(markdown).toContain("# Alpha — Excel: Migration");
    expect(markdown).toContain("## Summary");
    expect(markdown).not.toContain("## Decisions");
    expect(markdown).toContain("## Action Items");
    expect(markdown).not.toContain("## Follow-ups");
    expect(markdown).toContain("**Time:** `00:00:01.000 → 00:00:03.000`");
    expect(markdown).toContain("~~~text\nDiscussed [[Excel]] and <iframe>.\n~~~");
  });

  it("keeps a destination-only profile on schema one because rendered structure is unchanged", () => {
    const transcript: ParsedTranscript = { format: "txt", blocks: [{ text: "Same input" }] };
    const markdown = renderMarkdown(transcript, metadata, {
      ...DEFAULT_OUTPUT_PROFILE,
      destinationNamePattern: "source-name-note"
    });
    expect(markdown).toContain("soundings_version: 1");
  });

  it("renders no optional enrichment headings when every reserved section is disabled", () => {
    const transcript: ParsedTranscript = { format: "txt", blocks: [{ text: "Same input" }] };
    const markdown = renderMarkdown(transcript, metadata, {
      ...DEFAULT_OUTPUT_PROFILE,
      enabledSections: []
    });
    expect(markdown).not.toContain("## Summary");
    expect(markdown).not.toContain("## Decisions");
    expect(markdown).not.toContain("## Action Items");
    expect(markdown).not.toContain("## Follow-ups");
    expect(markdown).toContain("## Transcript");
  });

  it("escapes every Markdown heading punctuation character without changing Unicode", () => {
    const title = "Ž [a](b) {c} #+.*_!|<>`\\";
    const markdown = renderMarkdown({ format: "txt", blocks: [{ speaker: title, text: "Body" }] }, { ...metadata, title });
    const escaped = "Ž \\[a\\]\\(b\\) \\{c\\} \\#\\+\\.\\*\\_\\!\\|\\<\\>\\`\\\\";
    expect(markdown).toContain(`# ${escaped}`);
    expect(markdown).toContain(`### ${escaped}`);
  });
});
