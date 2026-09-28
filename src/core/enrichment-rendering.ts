import { Result } from "./types";
import { normalizeDestinationBasename } from "./planning";
import { EnrichmentDraft } from "./enrichment-draft";
import { safeHeading, yamlScalar } from "./rendering";

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

  const renderList = (items: readonly string[]) => 
    items.length > 0 ? items.map(item => `- ${safeHeading(item)}`).join("\n") : "> None recorded.";

  const sections = [
    `## Summary\n\n${draft.summary ? safeHeading(draft.summary) : "> Not provided."}`,
    `## Decisions\n\n${renderList(draft.decisions)}`,
    `## Action Items\n\n${renderList(draft.actionItems)}`,
    `## Follow-ups\n\n${renderList(draft.followUps)}`
  ].join("\n\n");

  const sourceLink = `[[${sourcePath.slice(sourcePath.lastIndexOf("/") + 1, sourcePath.lastIndexOf("."))}|Back to Transcript Note]]`;

  return `${frontmatter}\n\n${sections}\n\n---\n${sourceLink}\n`;
}
