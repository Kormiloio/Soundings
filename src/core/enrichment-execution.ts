import { identifySourceNote, type SourceNoteEvidence } from "./enrichment-evidence";
import { enrichmentDraftFingerprint } from "./enrichment-draft";
import { renderCompanionMarkdown } from "./enrichment-rendering";
import { equalBytes, sha256, type DigestFunction } from "./hash";
import { destinationPresence, type PublicationAdapter } from "./execution";
import type { EnrichmentPlan } from "./enrichment-planning";
import type { ExecutionStatus } from "./types";

export interface EnrichmentOutcome {
  readonly sourcePath: string;
  readonly destinationPath: string;
  readonly status: ExecutionStatus;
  readonly reason: string;
}

export interface ExecuteEnrichmentOptions {
  readonly signal?: AbortSignal;
  readonly digest: DigestFunction;
  readonly maxSourceBytes: number;
}

function outcome(
  plan: EnrichmentPlan,
  status: ExecutionStatus,
  reason: string
): EnrichmentOutcome {
  return Object.freeze({
    sourcePath: plan.sourcePath,
    destinationPath: plan.destinationPath,
    status,
    reason
  });
}

async function sourceEvidenceStillValid(
  adapter: PublicationAdapter,
  expected: SourceNoteEvidence,
  digest: DigestFunction,
  maxSourceBytes: number
): Promise<boolean> {
  let bytes: Uint8Array;
  try {
    bytes = await adapter.readBinary(expected.path);
  } catch {
    return false;
  }
  const identified = await identifySourceNote(
    expected.path,
    bytes,
    maxSourceBytes,
    (data) => sha256(data, digest)
  );
  if (!identified.ok || !identified.value) return false;
  const current = identified.value;
  return current.byteLength === expected.byteLength
    && current.sha256 === expected.sha256
    && current.soundingsVersion === expected.soundingsVersion;
}

export async function executeEnrichmentPlan(
  plan: EnrichmentPlan,
  adapter: PublicationAdapter,
  options: ExecuteEnrichmentOptions
): Promise<EnrichmentOutcome> {
  if (plan.status !== "ready") return outcome(plan, "blocked", plan.reason);
  if (options.signal?.aborted) return outcome(plan, "canceled", "Publication was canceled.");
  // Publication re-renders from plan.draft; this keeps the published bytes equal to the reviewed
  // preview even if a caller passed a mutable draft and changed it after review.
  if (enrichmentDraftFingerprint(plan.draft) !== plan.draftFingerprint) {
    return outcome(plan, "stale", "Enrichment changed after preview.");
  }

  if (!await sourceEvidenceStillValid(adapter, plan.sourceEvidence, options.digest, options.maxSourceBytes)) {
    return outcome(plan, "stale", "Source note changed after preview.");
  }

  const presence = await destinationPresence(adapter, plan.destinationPath);
  if (presence === "unknown") return outcome(plan, "failed", "Destination could not be checked.");
  if (presence === "present" || adapter.exists(plan.destinationPath)) {
    return outcome(plan, "blocked", "Destination already exists.");
  }

  const rendered = renderCompanionMarkdown(plan.sourcePath, plan.draft, plan.convertedAt);
  const bytes = new TextEncoder().encode(rendered);
  if (options.signal?.aborted) return outcome(plan, "canceled", "Publication was canceled.");

  try {
    await adapter.createBinary(plan.destinationPath, bytes);
  } catch {
    return adapter.exists(plan.destinationPath) || await destinationPresence(adapter, plan.destinationPath) === "present"
      ? outcome(plan, "blocked", "Destination appeared during publication.")
      : outcome(plan, "failed", "Destination could not be created.");
  }

  try {
    const finalBytes = await adapter.readBinary(plan.destinationPath);
    if (!equalBytes(finalBytes, bytes)) {
      return outcome(plan, "needs-attention", "Created destination did not match the rendered bytes.");
    }
  } catch {
    return outcome(plan, "needs-attention", "Created destination could not be verified.");
  }

  return outcome(plan, "created", "Companion note created and verified.");
}
