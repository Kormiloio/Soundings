import {
  enrichmentDraftFingerprint,
  enrichmentDraftHasContent,
  type EnrichmentDraft
} from "./enrichment-draft";
import type { SourceNoteEvidence } from "./enrichment-evidence";
import { destinationForEnrichment, isLinkableVaultPath, renderCompanionMarkdown } from "./enrichment-rendering";
import { collisionKey } from "./planning";

export type EnrichmentPlanStatus = "ready" | "empty" | "destination-exists" | "destination-invalid";

export interface EnrichmentPlan {
  readonly id: string;
  readonly sourcePath: string;
  readonly destinationPath: string;
  readonly sourceEvidence: SourceNoteEvidence;
  readonly draft: EnrichmentDraft;
  readonly draftFingerprint: string;
  readonly renderedMarkdown: string;
  readonly convertedAt: string;
  readonly status: EnrichmentPlanStatus;
  readonly reason: string;
}

export const UNLINKABLE_REASON = "The note name contains [ ] | # ^ < > or a line break, so a companion note cannot link back to it safely. Rename the note first.";

function hasCollision(existingPaths: ReadonlySet<string>, destinationPath: string): boolean {
  const key = collisionKey(destinationPath);
  for (const path of existingPaths) if (collisionKey(path) === key) return true;
  return false;
}

export function buildEnrichmentPlan(
  sourcePath: string,
  evidence: SourceNoteEvidence,
  draft: EnrichmentDraft,
  existingPaths: ReadonlySet<string>,
  createdAt: Date,
  id: string
): EnrichmentPlan {
  const convertedAt = createdAt.toISOString();
  const linkable = isLinkableVaultPath(sourcePath);
  const destination = destinationForEnrichment(sourcePath);
  const destinationPath = linkable && destination.ok && destination.value ? destination.value : "";

  let status: EnrichmentPlanStatus = "ready";
  let reason = "Ready for publication.";

  if (!linkable) {
    status = "destination-invalid";
    reason = UNLINKABLE_REASON;
  } else if (!destination.ok || !destinationPath) {
    status = "destination-invalid";
    reason = "A safe companion destination could not be derived.";
  } else if (hasCollision(existingPaths, destinationPath)) {
    status = "destination-exists";
    reason = "Companion destination already exists.";
  } else if (!enrichmentDraftHasContent(draft)) {
    status = "empty";
    reason = "Add at least one enrichment field before publication.";
  }

  const renderedMarkdown = destinationPath
    ? renderCompanionMarkdown(sourcePath, draft, convertedAt)
    : "";

  return Object.freeze({
    id,
    sourcePath,
    destinationPath,
    sourceEvidence: evidence,
    draft,
    draftFingerprint: enrichmentDraftFingerprint(draft),
    renderedMarkdown,
    convertedAt,
    status,
    reason
  });
}
