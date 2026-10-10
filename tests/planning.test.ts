import { describe, expect, it } from "vitest";
import { buildPlan, destinationFor, inferProject, isPlanCurrent, normalizeDestinationBasename, titleFor } from "../src/core/planning";
import { DEFAULT_OUTPUT_PROFILE, DEFAULT_SETTINGS } from "../src/core/settings";
import type { DiscoveryItem } from "../src/core/discovery";

function eligible(path: string): DiscoveryItem {
  const format = path.toLowerCase().endsWith(".vtt") ? "vtt" : "txt";
  return {
    sourcePath: path,
    format,
    classification: "eligible",
    reason: "Ready",
    evidence: { path, format, byteLength: 1, sha256: "a" }
  };
}

describe("planning", () => {
  it.each([
    ["Projects/A/Meeting 1.txt", "Projects/A/Meeting 1.md"],
    ["Meeting.2026.09.22.VTT", "Meeting.2026.09.22.md"],
    ["Željko/Čujemo.TXT", "Željko/Čujemo.md"],
    ["Meetings/1:1: Charles : Mario.txt", "Meetings/1 - 1 - Charles - Mario.md"],
    ["Meetings/Review? Final. .txt", "Meetings/Review - Final.md"]
  ])("derives destination for %s", (source, expected) => expect(destinationFor(source)).toEqual({ ok: true, value: expected }));

  it("derives content-neutral title choices with a root-level fallback", () => {
    expect(titleFor("Projects/Alpha/Excel Migration.txt", "source-name")).toBe("Excel Migration");
    expect(titleFor("Projects/Alpha/Excel Migration.txt", "parent-folder-source-name")).toBe("Alpha — Excel Migration");
    expect(titleFor("Excel Migration.txt", "parent-folder-source-name")).toBe("Excel Migration");
    expect(titleFor("資料/會議.txt", "parent-folder-source-name")).toBe("資料 — 會議");
  });

  it("derives and safely normalizes the content-neutral Note destination", () => {
    expect(destinationFor("Projects/Alpha/Excel Migration.txt", "source-name-note")).toEqual({
      ok: true,
      value: "Projects/Alpha/Excel Migration - Note.md"
    });
    expect(destinationFor("Planning: Review.txt", "source-name-note").value).toBe("Planning - Review - Note.md");
    expect(destinationFor("資料/會議.txt", "source-name-note").value).toBe("資料/會議 - Note.md");
    expect(destinationFor(":?.txt", "source-name-note")).toEqual({ ok: false, error: "destination-basename-invalid" });
  });

  it("reports basenames that cannot produce a safe destination", () => {
    expect(normalizeDestinationBasename(":::  ")).toEqual({ ok: false, error: "destination-basename-invalid" });
    expect(destinationFor("Meetings/:::  .txt")).toEqual({ ok: false, error: "destination-basename-invalid" });
  });

  it.each([
    ["Review\u0000Final", "Review - Final"],
    ["Review\\Final", "Review - Final"],
    ["Review : ? Final", "Review - Final"],
    ["Željko [sync]", "Željko [sync]"],
    ["  Review : Final.  ", "  Review - Final"]
  ])("preserves destination normalization for %j", (source, expected) => {
    expect(normalizeDestinationBasename(source)).toEqual({ ok: true, value: expected });
  });

  it("blocks an existing destination", () => {
    const plan = buildPlan([eligible("Meeting.txt")], new Set(["Meeting.md"]), DEFAULT_SETTINGS, new Date(0), () => "p1");
    expect(plan.items[0].classification).toBe("destination-exists");
  });

  it("blocks an existing sanitized destination", () => {
    const plan = buildPlan([eligible("1:1 Meeting.txt")], new Set(["1 - 1 Meeting.md"]), DEFAULT_SETTINGS, new Date(0), () => "p1");
    expect(plan.items[0]).toMatchObject({
      destinationPath: "1 - 1 Meeting.md",
      classification: "destination-exists"
    });
  });

  it("blocks sources with an ambiguous shared destination", () => {
    const plan = buildPlan([eligible("Meeting.txt"), eligible("Meeting.vtt")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    expect(plan.items.map((item) => item.classification)).toEqual(["destination-ambiguous", "destination-ambiguous"]);
  });

  it("blocks sources that converge on one sanitized destination", () => {
    const plan = buildPlan([eligible("Planning: Review.txt"), eligible("Planning - Review.vtt")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    expect(plan.items.map((item) => item.destinationPath)).toEqual(["Planning - Review.md", "Planning - Review.md"]);
    expect(plan.items.map((item) => item.classification)).toEqual(["destination-ambiguous", "destination-ambiguous"]);
  });

  it("blocks exact customized destination collisions and ambiguities", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      outputProfile: { ...DEFAULT_OUTPUT_PROFILE, destinationNamePattern: "source-name-note" as const }
    };
    const existing = buildPlan([eligible("Meeting.txt")], new Set(["Meeting - Note.md"]), settings, new Date(0), () => "existing");
    expect(existing.items[0].classification).toBe("destination-exists");

    const duplicate = buildPlan([eligible("Planning: Review.txt"), eligible("Planning - Review.vtt")], new Set(), settings, new Date(0), () => "duplicate");
    expect(duplicate.items.map((item) => item.classification)).toEqual(["destination-ambiguous", "destination-ambiguous"]);
    expect(duplicate.items.map((item) => item.destinationPath)).toEqual([
      "Planning - Review - Note.md",
      "Planning - Review - Note.md"
    ]);
  });

  it("makes an unusable destination non-selectable without changing source evidence or title", () => {
    const source = eligible("Meetings/:::.txt");
    const plan = buildPlan([source], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    expect(plan.items[0]).toMatchObject({
      sourcePath: "Meetings/:::.txt",
      destinationPath: undefined,
      classification: "destination-invalid",
      title: ":::",
      evidence: source.evidence
    });
  });

  it.each(["excluded", "unsupported", "unreadable", "empty", "oversize"] as const)(
    "preserves %s classification",
    (classification) => {
      const plan = buildPlan([{ sourcePath: "one.txt", format: "txt", classification, reason: classification }], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
      expect(plan.items[0].classification).toBe(classification);
    }
  );

  it("creates an immutable single-use snapshot tied to settings", () => {
    const plan = buildPlan([eligible("one.txt")], new Set(), DEFAULT_SETTINGS, new Date(0), () => "p1");
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.items)).toBe(true);
    expect(isPlanCurrent(plan, DEFAULT_SETTINGS)).toBe(true);
    expect(isPlanCurrent(plan, { ...DEFAULT_SETTINGS, maxSourceBytes: 10 })).toBe(false);
    expect(plan.outputProfile).toEqual(DEFAULT_OUTPUT_PROFILE);
    expect(plan.outputProfileSummary).toBe(
      "Title: Source name; destination: Source name.md; sections: Summary, Decisions, Action Items, Follow-ups; tags: none; Transcript timestamps: omit; transcript: plain."
    );
    expect(plan.items[0].outputProfileFingerprint).toBe(plan.outputProfileFingerprint);
  });

  it("previews the exact customized profile and becomes stale after a profile change", () => {
    const customized = {
      ...DEFAULT_SETTINGS,
      outputProfile: {
        ...DEFAULT_OUTPUT_PROFILE,
        titlePattern: "parent-folder-source-name" as const,
        destinationNamePattern: "source-name-note" as const,
        enabledSections: ["summary", "action-items"] as const,
        staticTags: ["project/alpha"],
        timestampPolicy: "retain" as const
      }
    };
    const plan = buildPlan([eligible("Projects/Alpha/Excel Migration.vtt")], new Set(), customized, new Date(0), () => "profile");
    expect(plan.items[0]).toMatchObject({
      title: "Alpha — Excel Migration",
      destinationPath: "Projects/Alpha/Excel Migration - Note.md",
      classification: "eligible"
    });
    expect(plan.outputProfileSummary).toBe(
      "Title: Parent folder — Source name; destination: Source name - Note.md; sections: Summary, Action Items; tags: project/alpha; Transcript timestamps: retain; transcript: plain."
    );
    expect(isPlanCurrent(plan, customized)).toBe(true);
    expect(isPlanCurrent(plan, DEFAULT_SETTINGS)).toBe(false);
  });

  it("infers only one project segment below the configured root", () => {
    const settings = { ...DEFAULT_SETTINGS, projectInferenceEnabled: true, projectRoot: "Projects" };
    expect(inferProject("Projects/ProMBA/Meetings/one.txt", settings)).toBe("ProMBA");
    expect(inferProject("Projects/ProMBA.txt", settings)).toBeUndefined();
    expect(inferProject("Meetings/one.txt", settings)).toBeUndefined();
    expect(inferProject("Projects/Željko/one.txt", settings)).toBe("Željko");
    expect(inferProject("Projects/A/one.txt", DEFAULT_SETTINGS)).toBeUndefined();
  });
});
