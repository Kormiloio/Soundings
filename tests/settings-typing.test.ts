import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, migrateSavedSettings, sanitizeSavedSettings, validateSettings } from "../src/core/settings";

const MANDATORY = [".obsidian", ".soundings"];

describe("saved settings typing", () => {
  it.each([
    ["observationEnabled", "false"],
    ["observationEnabled", 1],
    ["projectInferenceEnabled", "yes"],
    ["maxSourceBytes", "5000000"],
    ["projectRoot", 42],
    ["excludedPaths", "Archive"],
    ["excludedPaths", ["Archive", 7]],
    ["enabledFormats", "txt"],
    ["enabledFormats", [null]],
    ["observationRoots", { Meetings: true }],
    ["observationRoots", [["Meetings"]]],
    ["outputProfile", "default"],
    ["outputProfile", ["source-name"]]
  ])("resets %s saved as %j to its default", (field, value) => {
    const sanitized = sanitizeSavedSettings({ [field]: value });
    expect(sanitized.resetFields).toEqual([field]);
    expect(field in sanitized.input).toBe(false);
  });

  it("keeps correctly typed fields and drops unknown keys", () => {
    const sanitized = sanitizeSavedSettings({
      observationEnabled: true,
      observationRoots: ["Meetings"],
      excludedPaths: ["Archive"],
      maxSourceBytes: 1000,
      extra: "ignored"
    });
    expect(sanitized.resetFields).toEqual([]);
    expect(sanitized.input).toEqual({ observationEnabled: true, observationRoots: ["Meetings"], excludedPaths: ["Archive"], maxSourceBytes: 1000 });
  });

  it.each([null, undefined, "settings", 42, ["observationEnabled"]])("treats %j saved data as empty", (raw) => {
    const sanitized = sanitizeSavedSettings(raw);
    expect(sanitized.input).toEqual({});
  });

  it("never enables observation from a string", () => {
    const sanitized = sanitizeSavedSettings({ observationEnabled: "false" });
    const migrated = migrateSavedSettings(sanitized.input, MANDATORY);
    expect(migrated.settings?.observationEnabled).toBe(false);
    expect(migrated.settings?.excludedPaths).toEqual(expect.arrayContaining(MANDATORY));
  });

  it("rejects wrong-typed fields passed directly to validation", () => {
    const wrong = { ...DEFAULT_SETTINGS, observationEnabled: "false" } as unknown as typeof DEFAULT_SETTINGS;
    expect(validateSettings(wrong, MANDATORY).settings).toBeUndefined();
    const wrongList = { ...DEFAULT_SETTINGS, excludedPaths: "Archive" } as unknown as typeof DEFAULT_SETTINGS;
    expect(() => validateSettings(wrongList, MANDATORY)).not.toThrow();
    expect(validateSettings(wrongList, MANDATORY).settings).toBeUndefined();
    const wrongEntry = { ...DEFAULT_SETTINGS, observationRoots: [7] } as unknown as typeof DEFAULT_SETTINGS;
    expect(() => validateSettings(wrongEntry, MANDATORY)).not.toThrow();
    expect(validateSettings(wrongEntry, MANDATORY).settings).toBeUndefined();
  });

  it("reports reset fields by name only", () => {
    const sanitized = sanitizeSavedSettings({ projectRoot: { secret: "private body" } });
    expect(JSON.stringify(sanitized.resetFields)).not.toContain("private body");
  });
});
