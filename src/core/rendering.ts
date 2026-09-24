import type { NoteMetadata, ParsedTranscript, TranscriptBlock } from "./types";

function yamlScalar(value: string | number): string {
  return typeof value === "number" ? String(value) : JSON.stringify(value);
}

const MARKDOWN_HEADING_PUNCTUATION = new Set(["\\", "`", "*", "_", "{", "}", "[", "]", "(", ")", "#", "+", ".", "!", "|", "<", ">"]);

function safeHeading(value: string): string {
  const singleLine = value.replace(/[\r\n]+/g, " ");
  const escaped = [...singleLine].map((character) => MARKDOWN_HEADING_PUNCTUATION.has(character) ? `\\${character}` : character).join("");
  return escaped.trim() || "Untitled";
}

function literalBlock(text: string): string {
  const longest = Math.max(0, ...[...text.matchAll(/~+/g)].map((match) => match[0].length));
  const fence = "~".repeat(Math.max(3, longest + 1));
  return `${fence}text\n${text}\n${fence}`;
}

function renderBlock(block: TranscriptBlock): string {
  const heading = block.speaker ? `### ${safeHeading(block.speaker)}\n\n` : "";
  return `${heading}${literalBlock(block.text)}`;
}

export function renderMarkdown(transcript: ParsedTranscript, metadata: NoteMetadata): string {
  const frontmatter = [
    "---",
    `type: ${yamlScalar("meeting-transcript")}`,
    `source: ${yamlScalar("transcript")}`,
    `source_file: ${yamlScalar(metadata.sourceFile)}`,
    `source_format: ${yamlScalar(metadata.sourceFormat)}`,
    "soundings_version: 1",
    `converted_at: ${yamlScalar(metadata.convertedAt)}`,
    ...(metadata.project ? [`project: ${yamlScalar(metadata.project)}`] : []),
    "---"
  ].join("\n");
  const blocks = transcript.blocks.map(renderBlock).join("\n\n");
  return `${frontmatter}\n\n# ${safeHeading(metadata.title)}\n\n## Summary\n\n> Not generated. Add a summary manually or with an approved enrichment workflow.\n\n## Decisions\n\n## Action Items\n\n## Follow-ups\n\n## Transcript\n\n${blocks}\n`;
}
