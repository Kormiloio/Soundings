import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { micromark } from "micromark";
import { describe, expect, it } from "vitest";
import { parseTranscript } from "../src/core/parsers";
import { renderMarkdown } from "../src/core/rendering";
import { DEFAULT_OUTPUT_PROFILE, type OutputProfile } from "../src/core/settings";
import type { NoteMetadata, ParsedTranscript } from "../src/core/types";

const profile: OutputProfile = { ...DEFAULT_OUTPUT_PROFILE, transcriptDisplay: "folded-callout" };
const metadata: NoteMetadata = {
  sourceFile: "Transcript.txt", sourceFormat: "txt", title: "Transcript",
  convertedAt: "2026-09-22T14:30:00.000Z"
};

function assertContained(transcript: ParsedTranscript, outputProfile = profile): void {
  const markdown = renderMarkdown(transcript, metadata, outputProfile);
  const plain = renderMarkdown(transcript, metadata, { ...outputProfile, transcriptDisplay: "plain" });
  const body = plain.split("## Transcript\n\n")[1].trimEnd();
  const section = markdown.split("## Transcript\n\n")[1];
  expect(section.startsWith("> [!quote]- Full Transcript\n")).toBe(true);
  expect(section.trimEnd().split("\n").every((line) => line === ">" || line.startsWith("> "))).toBe(true);
  // Parsing the entire section proves there is no sibling after the one enclosing blockquote.
  const html = micromark(section);
  expect(html.match(/<blockquote>/g)).toHaveLength(1);
  expect(html).toBe(`<blockquote>\n${micromark(`[!quote]- Full Transcript\n${body}`)}\n</blockquote>\n`);
  expect(markdown).toContain("soundings_version: 2\n");
  expect(plain).toContain("soundings_version: 1\n");
}

describe("folded transcript containment", () => {
  it.each([
    "> attempted quote\n> [!note] nested callout\n\nlast line",
    "~~~\n~~~~~~~\n```\n```````\n---\n# heading\n</details>",
    "first\n\n\n\n\nlast\n",
    "<script>alert('literal')</script>\n![[embed]]\n&copy;\n    indented",
    "only one line",
    "\n\nleading and trailing blanks\n\n"
  ])("keeps adversarial text literal inside one blockquote %#", (text) => {
    const transcript = parseTranscript("txt", new TextEncoder().encode(text)).value!;
    assertContained(transcript);
    const html = micromark(renderMarkdown(transcript, metadata, profile).split("## Transcript\n\n")[1]);
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    expect(html).toContain(`<code class="language-text">${escaped}\n</code>`);
  });

  it.each(["omit", "retain"] as const)("contains multi-speaker WebVTT with %s timestamps", async (timestampPolicy) => {
    const bytes = await readFile(join(process.cwd(), "tests/fixtures/zoom-voice.vtt"));
    const transcript = parseTranscript("vtt", bytes).value!;
    const outputProfile = { ...profile, timestampPolicy };
    // Retained timestamps independently select schema 2 for plain output.
    if (timestampPolicy === "omit") assertContained(transcript, outputProfile);
    const markdown = renderMarkdown(transcript, metadata, outputProfile);
    expect(markdown).toContain("> ### Mario\n");
    expect(markdown).toContain("> ### Katie\n");
    expect(markdown.includes("> **Time:**")).toBe(timestampPolicy === "retain");
    const body = renderMarkdown(transcript, metadata, { ...outputProfile, transcriptDisplay: "plain" }).split("## Transcript\n\n")[1].trimEnd();
    expect(micromark(markdown.split("## Transcript\n\n")[1])).toBe(`<blockquote>\n${micromark(`[!quote]- Full Transcript\n${body}`)}\n</blockquote>\n`);
  });

  it("contains a transcript at the configured 5,000,000-byte limit", () => {
    const text = "line > literal\n\n".repeat(312_500);
    expect(new TextEncoder().encode(text)).toHaveLength(5_000_000);
    assertContained(parseTranscript("txt", new TextEncoder().encode(text)).value!);
  }, 30_000);
});
