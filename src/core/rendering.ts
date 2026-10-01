import type { NoteMetadata, ParsedTranscript, TranscriptBlock } from "./types";
import { DEFAULT_OUTPUT_PROFILE, type OutputProfile, type ReservedSection } from "./settings";

// JSON.stringify leaves C1 controls and Unicode line/paragraph separators raw; YAML parsers may reject
// or split on them, so they are written as \uXXXX escapes inside the double-quoted scalar.
const YAML_UNSAFE_CHARACTERS = /[\u0080-\u009f\u2028\u2029]/g;

export function yamlScalar(value: string | number): string {
  if (typeof value === "number") return String(value);
  return JSON.stringify(value).replace(YAML_UNSAFE_CHARACTERS, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

// Markdown punctuation plus Obsidian inline syntax: comments (%%), math ($), highlights (==),
// strikethrough (~~), and block references (^).
const MARKDOWN_HEADING_PUNCTUATION = new Set([
  "\\", "`", "*", "_", "{", "}", "[", "]", "(", ")", "#", "+", ".", "!", "|", "<", ">", "%", "$", "=", "~", "^"
]);

export function safeHeading(value: string): string {
  const singleLine = value.replace(/[\r\n]+/g, " ");
  const escaped = [...singleLine].map((character) => MARKDOWN_HEADING_PUNCTUATION.has(character) ? `\\${character}` : character).join("");
  return escaped.trim() || "Untitled";
}

function literalBlock(text: string): string {
  let longest = 0;
  let run = 0;
  for (let index = 0; index < text.length; index += 1) {
    run = text.charCodeAt(index) === 0x7e ? run + 1 : 0;
    if (run > longest) longest = run;
  }
  const fence = "~".repeat(Math.max(3, longest + 1));
  return `${fence}text\n${text}\n${fence}`;
}

function renderBlock(block: TranscriptBlock, profile: OutputProfile): string {
  const heading = block.speaker ? `### ${safeHeading(block.speaker)}\n\n` : "";
  const timing = profile.timestampPolicy === "retain" && block.timing
    ? `**Time:** \`${block.timing.start} → ${block.timing.end}\`\n\n`
    : "";
  return `${timing}${heading}${literalBlock(block.text)}`;
}

const SECTION_CONTENT: Record<ReservedSection, string> = {
  summary: "## Summary\n\n> Not generated. Add a summary manually or with an approved enrichment workflow.",
  decisions: "## Decisions",
  "action-items": "## Action Items",
  "follow-ups": "## Follow-ups"
};

function noteSchemaVersion(profile: OutputProfile): number {
  const defaultSections = DEFAULT_OUTPUT_PROFILE.enabledSections;
  const sectionsMatch = profile.enabledSections.length === defaultSections.length
    && profile.enabledSections.every((section, index) => section === defaultSections[index]);
  return profile.titlePattern === DEFAULT_OUTPUT_PROFILE.titlePattern
    && sectionsMatch
    && profile.staticTags.length === 0
    && profile.timestampPolicy === DEFAULT_OUTPUT_PROFILE.timestampPolicy
    ? 1
    : 2;
}

export function renderMarkdown(
  transcript: ParsedTranscript,
  metadata: NoteMetadata,
  profile: OutputProfile = DEFAULT_OUTPUT_PROFILE
): string {
  const frontmatter = [
    "---",
    `type: ${yamlScalar("meeting-transcript")}`,
    `source: ${yamlScalar("transcript")}`,
    `source_file: ${yamlScalar(metadata.sourceFile)}`,
    `source_format: ${yamlScalar(metadata.sourceFormat)}`,
    `soundings_version: ${noteSchemaVersion(profile)}`,
    `converted_at: ${yamlScalar(metadata.convertedAt)}`,
    ...(metadata.project ? [`project: ${yamlScalar(metadata.project)}`] : []),
    ...(profile.staticTags.length > 0 ? [`tags: ${JSON.stringify(profile.staticTags)}`] : []),
    "---"
  ].join("\n");
  const blocks = transcript.blocks.map((block) => renderBlock(block, profile)).join("\n\n");
  const sections = profile.enabledSections.map((section) => SECTION_CONTENT[section]);
  const header = `\n\n# ${safeHeading(metadata.title)}\n\n`;
  const body = [...sections, `## Transcript\n\n${blocks}`].join("\n\n");
  return `${frontmatter}${header}${body}\n`;
}
