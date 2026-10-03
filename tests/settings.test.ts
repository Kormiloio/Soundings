import { describe, expect, it } from "vitest";
import {
  createSettingsPolicy,
  DEFAULT_OUTPUT_PROFILE,
  DEFAULT_SETTINGS,
  editableExcludedPaths,
  migrateSavedSettings,
  normalizeVaultPath,
  settingsFingerprint,
  validateOutputProfile,
  validateSettings
} from "../src/core/settings";

describe("settings", () => {
  it("uses local-only foundation defaults without automatic conversion", () => {
    expect(DEFAULT_SETTINGS.enabledFormats).toEqual(["txt", "vtt"]);
    expect(DEFAULT_SETTINGS.projectInferenceEnabled).toBe(false);
    expect(DEFAULT_SETTINGS.observationEnabled).toBe(false);
    expect(DEFAULT_SETTINGS.observationRoots).toEqual([]);
    expect(DEFAULT_SETTINGS.outputProfile).toEqual({
      titlePattern: "source-name",
      destinationNamePattern: "source-name",
      enabledSections: ["summary", "decisions", "action-items", "follow-ups"],
      staticTags: [],
      timestampPolicy: "omit",
      transcriptDisplay: "plain"
    });
    expect(DEFAULT_SETTINGS).not.toHaveProperty("automaticConversion");
  });

  it.each([
    { titlePattern: "source-name" as const },
    { titlePattern: "parent-folder-source-name" as const },
    { destinationNamePattern: "source-name" as const },
    { destinationNamePattern: "source-name-note" as const },
    { timestampPolicy: "omit" as const },
    { timestampPolicy: "retain" as const }
  ])("accepts closed output choice $titlePattern$destinationNamePattern$timestampPolicy", (choice) => {
    expect(validateOutputProfile({ ...DEFAULT_OUTPUT_PROFILE, ...choice }).errors).toEqual([]);
  });

  it("normalizes section order and de-duplicates trimmed static tags", () => {
    const result = validateOutputProfile({
      ...DEFAULT_OUTPUT_PROFILE,
      enabledSections: ["follow-ups", "summary", "follow-ups"],
      staticTags: [" project/alpha ", "notes", "project/alpha"]
    });
    expect(result.profile?.enabledSections).toEqual(["summary", "follow-ups"]);
    expect(result.profile?.staticTags).toEqual(["project/alpha", "notes"]);
  });

  it.each([
    [{ titlePattern: "template" }, "Unknown title pattern"],
    [{ destinationNamePattern: "../outside" }, "Unknown destination-name pattern"],
    [{ timestampPolicy: "sometimes" }, "Unsupported timestamp policy"],
    [{ enabledSections: ["script"] }, "Unknown reserved section"],
    [{ staticTags: ["#meeting"] }, "Invalid static tag"],
    [{ staticTags: ["two words"] }, "Invalid static tag"],
    [{ staticTags: ["123"] }, "Invalid static tag"],
    [{ staticTags: ["one//two"] }, "Invalid static tag"]
  ])("rejects unsafe output profile %#", (profile, message) => {
    const result = validateOutputProfile(profile as never);
    expect(result.profile).toBeUndefined();
    expect(result.errors.join(" ")).toContain(message);
  });

  it("rejects non-array and non-string saved settings data in the output profile", () => {
    const result = validateOutputProfile({
      enabledSections: "not-an-array" as any,
      staticTags: "not-an-array" as any
    } as any);
    expect(result.profile).toBeUndefined();
    expect(result.errors).toContain("Expected an array for enabled sections, but received: string.");
    expect(result.errors).toContain("Expected an array for static tags, but received: string.");
  });

  it("rejects non-string entries in static tags array", () => {
    const result = validateOutputProfile({
      staticTags: [true, null, 123] as any
    } as any);
    expect(result.profile).toBeUndefined();
    expect(result.errors).toContain("Invalid static tag type: boolean. Expected string.");
    expect(result.errors).toContain("Invalid static tag type: object. Expected string.");
    expect(result.errors).toContain("Invalid static tag type: number. Expected string.");
  });

  it.each(["", "   ", "/absolute", "../escape", "one/../escape", "one//two", "C:/vault", "one\\two"])(
    "rejects invalid vault path %j",
    (path) => expect(normalizeVaultPath(path)).toBeUndefined()
  );

  it("normalizes and de-duplicates valid exclusions without removing safe defaults", () => {
    const result = validateSettings({ excludedPaths: ["Archive", "Archive"] });
    expect(result.errors).toEqual([]);
    expect(result.settings?.excludedPaths).toEqual([".soundings", "Archive"]);
  });

  it("derives mandatory exclusions from the active vault configuration directory", () => {
    const policy = createSettingsPolicy("Config").policy!;
    const result = validateSettings({ excludedPaths: ["Archive", "Archive"] }, policy.mandatoryExcludedPaths);
    expect(result.errors).toEqual([]);
    expect(result.settings?.excludedPaths).toEqual(["Config", ".soundings", "Archive"]);
    expect(editableExcludedPaths(result.settings!, policy.mandatoryExcludedPaths)).toEqual(["Archive"]);
  });

  it("rejects an unsafe host configuration directory instead of falling back", () => {
    expect(createSettingsPolicy("../outside")).toEqual({
      errors: ["Obsidian configuration directory is not a safe vault-relative path."]
    });
  });

  it("loads prior effective exclusions without exposing mandatory paths as editable", () => {
    const policy = createSettingsPolicy(".obsidian").policy!;
    const saved = validateSettings({ excludedPaths: [".obsidian", ".soundings", "Archive"] }, policy.mandatoryExcludedPaths).settings!;
    expect(editableExcludedPaths(saved, policy.mandatoryExcludedPaths)).toEqual(["Archive"]);
  });

  it("migrates saved exclusions through the current host policy from only the field the helper reads", () => {
    const policy = createSettingsPolicy(".soundings-config").policy!;
    const saved = { excludedPaths: [".obsidian", ".soundings", "Archive"] };
    const editable = editableExcludedPaths(saved, policy.mandatoryExcludedPaths);
    const migrated = validateSettings({ excludedPaths: editable }, policy.mandatoryExcludedPaths).settings!;
    expect(migrated.excludedPaths).toEqual([".soundings-config", ".soundings", ".obsidian", "Archive"]);
  });

  it("rejects settings that could broaden a scan", () => {
    const result = validateSettings({ excludedPaths: [""], projectInferenceEnabled: true, projectRoot: "../Projects" });
    expect(result.settings).toBeUndefined();
    expect(result.errors).toHaveLength(2);
  });

  it("fingerprints normalized behavior", () => {
    const first = settingsFingerprint({ ...DEFAULT_SETTINGS, excludedPaths: ["A", "B"] });
    const second = settingsFingerprint({ ...DEFAULT_SETTINGS, excludedPaths: ["B", "A"] });
    expect(first).toBe(second);
  });

  it("includes observation settings in the fingerprint", () => {
    const base = settingsFingerprint(DEFAULT_SETTINGS);
    const withObs = settingsFingerprint({ ...DEFAULT_SETTINGS, observationEnabled: true });
    expect(withObs).not.toBe(base);
  });

  it("includes the normalized output profile in the fingerprint", () => {
    const base = settingsFingerprint(DEFAULT_SETTINGS);
    const customized = validateSettings({
      outputProfile: { ...DEFAULT_OUTPUT_PROFILE, titlePattern: "parent-folder-source-name" }
    }).settings!;
    expect(settingsFingerprint(customized)).not.toBe(base);
  });

  it("keeps observation disabled by default on migration", () => {
    const policy = createSettingsPolicy(".obsidian").policy!;
    const result = validateSettings({}, policy.mandatoryExcludedPaths);
    expect(result.settings?.observationEnabled).toBe(false);
    expect(result.settings?.observationRoots).toEqual([]);
  });

  it("migrates pre-profile settings to byte-compatible output defaults", () => {
    const policy = createSettingsPolicy(".obsidian").policy!;
    const migrated = migrateSavedSettings({ maxSourceBytes: 1234 }, policy.mandatoryExcludedPaths);
    expect(migrated.errors).toEqual([]);
    expect(migrated.restoredOutputProfile).toBe(false);
    expect(migrated.settings?.maxSourceBytes).toBe(1234);
    expect(migrated.settings?.outputProfile).toEqual(DEFAULT_OUTPUT_PROFILE);
  });

  it("restores only an invalid saved output profile when other saved settings are safe", () => {
    const policy = createSettingsPolicy(".obsidian").policy!;
    const migrated = migrateSavedSettings({
      maxSourceBytes: 1234,
      outputProfile: { ...DEFAULT_OUTPUT_PROFILE, titlePattern: "unsafe-template" }
    } as never, policy.mandatoryExcludedPaths);
    expect(migrated.restoredOutputProfile).toBe(true);
    expect(migrated.errors.join(" ")).toContain("Unknown title pattern");
    expect(migrated.settings?.maxSourceBytes).toBe(1234);
    expect(migrated.settings?.outputProfile).toEqual(DEFAULT_OUTPUT_PROFILE);
  });

  it("rejects invalid observation roots", () => {
    const policy = createSettingsPolicy(".obsidian").policy!;
    const result = validateSettings({ observationRoots: ["/absolute", "../escape"] }, policy.mandatoryExcludedPaths);
    expect(result.settings).toBeUndefined();
    expect(result.errors).toHaveLength(2);
  });

  it("normalizes and de-duplicates valid observation roots", () => {
    const policy = createSettingsPolicy(".obsidian").policy!;
    const result = validateSettings({ observationRoots: ["Meetings", "Calls", "Calls"] }, policy.mandatoryExcludedPaths);
    expect(result.settings?.observationRoots).toEqual(["Meetings", "Calls"]);
  });

  it("allows empty observation roots to mean whole vault", () => {
    const policy = createSettingsPolicy(".obsidian").policy!;
    const result = validateSettings({ observationEnabled: true, observationRoots: [] }, policy.mandatoryExcludedPaths);
    expect(result.settings?.observationEnabled).toBe(true);
    expect(result.settings?.observationRoots).toEqual([]);
  });
});
