import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, normalizeVaultPath, settingsFingerprint, validateSettings } from "../src/core/settings";

describe("settings", () => {
  it("uses local-only foundation defaults without automatic conversion", () => {
    expect(DEFAULT_SETTINGS.enabledFormats).toEqual(["txt", "vtt"]);
    expect(DEFAULT_SETTINGS.projectInferenceEnabled).toBe(false);
    expect(DEFAULT_SETTINGS).not.toHaveProperty("automaticConversion");
  });

  it.each(["", "   ", "/absolute", "../escape", "one/../escape", "one//two", "C:/vault", "one\\two"])(
    "rejects invalid vault path %j",
    (path) => expect(normalizeVaultPath(path)).toBeUndefined()
  );

  it("normalizes and de-duplicates valid exclusions without removing safe defaults", () => {
    const result = validateSettings({ excludedPaths: ["Archive", "Archive"] });
    expect(result.errors).toEqual([]);
    expect(result.settings?.excludedPaths).toEqual([".obsidian", ".soundings", "Archive"]);
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
});
