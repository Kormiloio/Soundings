import { describe, expect, it } from "vitest";
import {
  clearReviewSelection,
  createReviewSelection,
  projectReviewPlan,
  selectAllVisibleEligible
} from "../src/core/review-state";
import type { ConversionPlan, PlanClassification, PlanItem } from "../src/core/types";

function item(sourcePath: string, classification: PlanClassification, destinationPath?: string): PlanItem {
  return Object.freeze({ sourcePath, destinationPath, classification, reason: classification });
}

function plan(items: readonly PlanItem[]): ConversionPlan {
  return Object.freeze({
    id: "review",
    settingsFingerprint: "settings",
    createdAt: new Date(0).toISOString(),
    items: Object.freeze(items)
  });
}

describe("review-state projection", () => {
  const mixed = plan([
    item("Meetings/Alpha.txt", "eligible", "Meetings/Alpha.md"),
    item("Meetings/Nested/Beta.vtt", "eligible", "Meetings/Nested/Beta.md"),
    item("Archive/Old.txt", "excluded", "Archive/Old.md"),
    item("Meetings/Collision.txt", "destination-exists", "Meetings/Collision.md"),
    item("Meetings/Broken.vtt", "unreadable", "Meetings/Broken.md"),
    item("Meetings/Other.csv", "unsupported")
  ]);

  it("counts every classification while filtering visible rows by classification", () => {
    const projection = projectReviewPlan(mixed, { classification: "eligible" });
    expect(projection.counts).toMatchObject({
      eligible: 2,
      excluded: 1,
      unreadable: 1,
      unsupported: 1,
      "destination-exists": 1
    });
    expect(projection.visibleItems.map((entry) => entry.sourcePath)).toEqual([
      "Meetings/Alpha.txt",
      "Meetings/Nested/Beta.vtt"
    ]);
    expect(projection.visibleEligibleCount).toBe(2);
  });

  it("searches source and destination paths case-insensitively", () => {
    expect(projectReviewPlan(mixed, { query: "nested/BETA" }).visibleItems.map((entry) => entry.sourcePath))
      .toEqual(["Meetings/Nested/Beta.vtt"]);
    expect(projectReviewPlan(mixed, { query: "collision.MD" }).visibleItems.map((entry) => entry.sourcePath))
      .toEqual(["Meetings/Collision.txt"]);
  });

  it("returns an empty visible result without changing overall counts", () => {
    const projection = projectReviewPlan(mixed, { query: "missing/path" });
    expect(projection.visibleItems).toEqual([]);
    expect(projection.counts.eligible).toBe(2);
    expect(projection.visibleEligibleCount).toBe(0);
  });

  it("counts selected eligible paths even when filters hide them", () => {
    const selected = new Set(["Meetings/Alpha.txt", "Meetings/Nested/Beta.vtt", "Archive/Old.txt", "stale.txt"]);
    const projection = projectReviewPlan(mixed, { query: "Alpha", selectedSourcePaths: selected });
    expect(projection.visibleItems.map((entry) => entry.sourcePath)).toEqual(["Meetings/Alpha.txt"]);
    expect(projection.selectedCount).toBe(2);
  });

  it("selects only visible eligible items without mutating prior selection", () => {
    const everyClassification = plan([
      item("Visible.txt", "eligible", "Visible.md"),
      item("Hidden.txt", "eligible", "Hidden.md"),
      item("Excluded.txt", "excluded", "Excluded.md"),
      item("Unsupported.csv", "unsupported"),
      item("Unreadable.txt", "unreadable", "Unreadable.md"),
      item("Empty.txt", "empty", "Empty.md"),
      item("Oversize.txt", "oversize", "Oversize.md"),
      item("Invalid.txt", "destination-invalid"),
      item("Existing.txt", "destination-exists", "Existing.md"),
      item("Ambiguous.txt", "destination-ambiguous", "Ambiguous.md")
    ]);
    const prior = new Set(["Already-selected.txt"]);
    const visible = projectReviewPlan(everyClassification, { query: "Visible" }).visibleItems;
    const selected = selectAllVisibleEligible(prior, visible);

    expect([...prior]).toEqual(["Already-selected.txt"]);
    expect([...selected]).toEqual(["Already-selected.txt", "Visible.txt"]);
    expect(selected).not.toContain("Hidden.txt");
    for (const nonEligible of everyClassification.items.filter((entry) => entry.classification !== "eligible")) {
      expect(selected).not.toContain(nonEligible.sourcePath);
    }
  });

  it("clears all selections with a fresh set", () => {
    const prior = new Set(["one.txt", "two.txt"]);
    const cleared = clearReviewSelection();
    expect(cleared.size).toBe(0);
    expect([...prior]).toEqual(["one.txt", "two.txt"]);
  });

  it("creates each new or refreshed plan with independent empty selection", () => {
    const first = createReviewSelection();
    first.add("one.txt");
    const refreshed = createReviewSelection();
    expect(refreshed.size).toBe(0);
    expect(first).not.toBe(refreshed);
    expect([...first]).toEqual(["one.txt"]);
  });
});
