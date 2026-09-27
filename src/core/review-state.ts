import type { ConversionPlan, PlanClassification, PlanItem } from "./types";

export const PLAN_CLASSIFICATIONS = Object.freeze<readonly PlanClassification[]>([
  "eligible",
  "excluded",
  "unsupported",
  "unreadable",
  "empty",
  "oversize",
  "destination-invalid",
  "destination-exists",
  "destination-ambiguous"
]);

export type ReviewClassificationFilter = "all" | PlanClassification;

export interface ReviewProjectionOptions {
  readonly query?: string;
  readonly classification?: ReviewClassificationFilter;
  readonly selectedSourcePaths?: ReadonlySet<string>;
}

export interface ReviewProjection {
  readonly counts: Readonly<Record<PlanClassification, number>>;
  readonly visibleItems: readonly PlanItem[];
  readonly selectedCount: number;
  readonly visibleEligibleCount: number;
}

export function createReviewSelection(): Set<string> {
  return new Set<string>();
}

export function selectAllVisibleEligible(
  selectedSourcePaths: ReadonlySet<string>,
  visibleItems: readonly PlanItem[]
): Set<string> {
  const next = new Set(selectedSourcePaths);
  for (const item of visibleItems) {
    if (item.classification === "eligible") next.add(item.sourcePath);
  }
  return next;
}

export function clearReviewSelection(): Set<string> {
  return new Set<string>();
}

function emptyCounts(): Record<PlanClassification, number> {
  return {
    eligible: 0,
    excluded: 0,
    unsupported: 0,
    unreadable: 0,
    empty: 0,
    oversize: 0,
    "destination-invalid": 0,
    "destination-exists": 0,
    "destination-ambiguous": 0
  };
}

function pathMatches(item: PlanItem, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return item.sourcePath.toLowerCase().includes(normalizedQuery)
    || (item.destinationPath?.toLowerCase().includes(normalizedQuery) ?? false);
}

export function projectReviewPlan(
  plan: ConversionPlan,
  options: ReviewProjectionOptions = {}
): ReviewProjection {
  const counts = emptyCounts();
  const eligiblePaths = new Set<string>();
  for (const item of plan.items) {
    counts[item.classification] += 1;
    if (item.classification === "eligible") eligiblePaths.add(item.sourcePath);
  }

  const normalizedQuery = (options.query ?? "").trim().toLowerCase();
  const classification = options.classification ?? "all";
  const visibleItems = plan.items.filter((item) =>
    (classification === "all" || item.classification === classification)
    && pathMatches(item, normalizedQuery)
  );
  const selectedSourcePaths = options.selectedSourcePaths ?? new Set<string>();
  let selectedCount = 0;
  for (const path of selectedSourcePaths) {
    if (eligiblePaths.has(path)) selectedCount += 1;
  }

  return Object.freeze({
    counts: Object.freeze(counts),
    visibleItems: Object.freeze(visibleItems),
    selectedCount,
    visibleEligibleCount: visibleItems.filter((item) => item.classification === "eligible").length
  });
}
