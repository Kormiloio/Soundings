import { Result } from "./types";
import { normalizeDestinationBasename } from "./planning";
import { EnrichmentDraft } from "./enrichment-draft";
import { yamlScalar } from "./rendering";

export function destinationForEnrichment(sourcePath: string): Result<string, "destination-basename-invalid"> {
  const slash = sourcePath.lastIndexOf("/");
  const dot = sourcePath.lastIndexOf(".");
  if (dot <= slash) return { ok: false, error: "destination-basename-invalid" };
  
  const sourceName = sourcePath.slice(slash + 1, dot);
  if (sourceName.startsWith(".")) return { ok: false, error: "destination-basename-invalid" };
  
  const normalized = normalizeDestinationBasename(`${sourceName} - Enrichment`);
  if (!normalized.ok || normalized.value === undefined) return normalized;
  
  const folder = slash >= 0 ? sourcePath.slice(0, slash + 1) : "";
  return { ok: true, value: `${folder}${normalized.value}.md` };
}

// Characters that would end, alias, or retarget a [[wikilink]], or open raw HTML around it.
const UNLINKABLE_PATH_CHARACTERS = new Set(["[", "]", "|", "#", "^", "<", ">", "\r", "\n"]);

export function isLinkableVaultPath(path: string): boolean {
  for (const character of path) if (UNLINKABLE_PATH_CHARACTERS.has(character)) return false;
  return true;
}

/**
 * A line that would open a code fence, form a heading, or form a setext underline or thematic break
 * (only `=`, `-`, `*`, `_`, and spaces) is escaped so it stays visible text inside its section.
 */
function isStructuralLine(trimmedStart: string): boolean {
  return trimmedStart.startsWith("#")
    || trimmedStart.startsWith("```")
    || trimmedStart.startsWith("~~~")
    || /^[=\-*_][=\-*_ \t]*$/.test(trimmedStart);
}

function safeProse(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return "> Not provided.";
  return trimmed
    .split("\n")
    .map((line) => (isStructuralLine(line.trimStart()) ? `\\${line.trimStart()}` : line))
    .join("\n");
}

function safeListItem(item: string): string {
  const singleLine = item.replace(/[\r\n]+/g, " ").trim();
  if (singleLine.length === 0) return "";
  return /^[-*#+>]/.test(singleLine) || isStructuralLine(singleLine) ? `\\${singleLine}` : singleLine;
}

export function sourceLinkForEnrichment(sourcePath: string): string {
  const dot = sourcePath.lastIndexOf(".");
  const target = dot > sourcePath.lastIndexOf("/") ? sourcePath.slice(0, dot) : sourcePath;
  return `[[${target}|Back to Transcript Note]]`;
}

export function renderCompanionMarkdown(
  sourcePath: string,
  draft: EnrichmentDraft,
  convertedAt: string
): string {
  const frontmatter = [
    "---",
    `type: ${yamlScalar("enrichment")}`,
    `source_note: ${yamlScalar(sourcePath)}`,
    `converted_at: ${yamlScalar(convertedAt)}`,
    "---"
  ].join("\n");

  const renderList = (items: readonly string[]) => {
    const valid = items.map(safeListItem).filter((item) => item.length > 0);
    return valid.length > 0 ? valid.map((item) => `- ${item}`).join("\n") : "> None recorded.";
  };

  const sections = [
    `## Summary\n\n${safeProse(draft.summary)}`,
    `## Decisions\n\n${renderList(draft.decisions)}`,
    `## Action Items\n\n${renderList(draft.actionItems)}`,
    `## Follow-ups\n\n${renderList(draft.followUps)}`
  ].join("\n\n");

  const sourceLink = sourceLinkForEnrichment(sourcePath);

  return `${frontmatter}\n\n${sections}\n\n---\n${sourceLink}\n`;
}
