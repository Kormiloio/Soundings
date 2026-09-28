export interface EnrichmentDraft {
  readonly summary: string;
  readonly decisions: readonly string[];
  readonly actionItems: readonly string[];
  readonly followUps: readonly string[];
}

export interface EnrichmentValidation {
  readonly draft?: EnrichmentDraft;
  readonly errors: readonly string[];
}

const FIELD_LIMIT_BYTES = 10_000;
const TOTAL_LIMIT_BYTES = 50_000;

export function validateEnrichmentDraft(input: Partial<EnrichmentDraft>): EnrichmentValidation {
  const errors: string[] = [];
  const encoder = new TextEncoder();

  const summary = input.summary ?? "";
  if (typeof summary !== "string") {
    errors.push("Summary must be a string.");
  } else if (encoder.encode(summary).byteLength > FIELD_LIMIT_BYTES) {
    errors.push(`Summary exceeds maximum size of ${FIELD_LIMIT_BYTES} bytes.`);
  }

  const validateArray = (name: string, value: unknown) => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) {
      errors.push(`${name} must be an array.`);
      return [];
    }
    const valid: string[] = [];
    for (const item of value) {
      if (typeof item !== "string") {
        errors.push(`Items in ${name} must be strings.`);
      } else if (encoder.encode(item).byteLength > FIELD_LIMIT_BYTES) {
        errors.push(`Items in ${name} cannot exceed ${FIELD_LIMIT_BYTES} bytes.`);
      } else {
        valid.push(item);
      }
    }
    return valid;
  };

  const decisions = validateArray("Decisions", input.decisions);
  const actionItems = validateArray("Action Items", input.actionItems);
  const followUps = validateArray("Follow-ups", input.followUps);

  const totalSize = encoder.encode(summary).byteLength + 
    [...decisions, ...actionItems, ...followUps].reduce((acc, s) => acc + encoder.encode(s).byteLength, 0);

  if (totalSize > TOTAL_LIMIT_BYTES) {
    errors.push(`Total enrichment content exceeds maximum limit of ${TOTAL_LIMIT_BYTES} bytes.`);
  }

  if (errors.length > 0) return { errors };

  return {
    draft: Object.freeze({
      summary,
      decisions: Object.freeze(decisions),
      actionItems: Object.freeze(actionItems),
      followUps: Object.freeze(followUps)
    }),
    errors
  };
}

export function enrichmentDraftHasContent(draft: EnrichmentDraft): boolean {
  if (draft.summary.trim().length > 0) return true;
  const hasListItem = (items: readonly string[]) => items.some((item) => item.trim().length > 0);
  return hasListItem(draft.decisions) || hasListItem(draft.actionItems) || hasListItem(draft.followUps);
}

export function enrichmentDraftFingerprint(draft: EnrichmentDraft): string {
  return JSON.stringify({
    summary: draft.summary,
    decisions: [...draft.decisions],
    actionItems: [...draft.actionItems],
    followUps: [...draft.followUps]
  });
}
