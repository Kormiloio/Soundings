import { describe, expect, it } from "vitest";
import { validateOutputProfile, outputProfileFingerprint, outputProfileSummary, migrateSavedSettings, DEFAULT_OUTPUT_PROFILE, type OutputProfile } from "../src/core/settings";

describe("transcript display settings", () => {
  it("accepts 'folded-callout' as a valid choice", () => {
    const result = validateOutputProfile({ transcriptDisplay: "folded-callout" });
    expect(result.errors).toHaveLength(0);
    expect(result.profile?.transcriptDisplay).toBe("folded-callout");
  });

  it("rejects unknown display choices", () => {
    const result = validateOutputProfile({ transcriptDisplay: "invalid-choice" } as never);
    expect(result.errors).toContain("Unsupported transcript display choice: invalid-choice.");
  });

  it("changes the fingerprint when display mode changes", () => {
    const plainFingerprint = outputProfileFingerprint(DEFAULT_OUTPUT_PROFILE);
    const foldedProfile: OutputProfile = { ...DEFAULT_OUTPUT_PROFILE, transcriptDisplay: "folded-callout" };
    const foldedFingerprint = outputProfileFingerprint(foldedProfile);
    expect(plainFingerprint).not.toBe(foldedFingerprint);
    expect(outputProfileSummary(foldedProfile)).toContain("transcript: folded callout");
    expect(outputProfileSummary(DEFAULT_OUTPUT_PROFILE)).toContain("transcript: plain");
  });

  it("migrates a saved profile without the field to plain without resetting other choices", () => {
    const { transcriptDisplay: _display, ...legacy } = DEFAULT_OUTPUT_PROFILE;
    const migration = migrateSavedSettings({ outputProfile: { ...legacy, timestampPolicy: "retain" } as OutputProfile });
    expect(migration.errors).toEqual([]);
    expect(migration.restoredOutputProfile).toBe(false);
    expect(migration.settings?.outputProfile).toMatchObject({ transcriptDisplay: "plain", timestampPolicy: "retain" });
  });

  it.each([null, 1, false, {}, []])("rejects wrong-typed saved display %# and restores the safe profile", (value) => {
    const migration = migrateSavedSettings({ outputProfile: { transcriptDisplay: value } } as never);
    expect(migration.restoredOutputProfile).toBe(true);
    expect(migration.settings?.outputProfile).toEqual(DEFAULT_OUTPUT_PROFILE);
  });
});
