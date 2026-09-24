import { describe, expect, it } from "vitest";
import {
  createSettingsPolicy,
  DEFAULT_SETTINGS,
  editableExcludedPaths,
  normalizeVaultPath,
  settingsFingerprint,
  validateSettings
} from "../src/core/settings";

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
