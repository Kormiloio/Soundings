import type { App, SettingDefinition, SettingDefinitionItem } from "obsidian";
import { describe, expect, it, vi } from "vitest";
import { createSettingsPolicy, validateSettings, type SoundingsSettings } from "../src/core/settings";
import { SoundingsSettingTab, type SettingsOwner } from "../src/obsidian/settings-tab";

function setup(): { tab: SoundingsSettingTab; owner: SettingsOwner } {
  const policy = createSettingsPolicy("Config").policy!;
  const owner: SettingsOwner = {
    settings: validateSettings({ excludedPaths: ["Archive"] }, policy.mandatoryExcludedPaths).settings!,
    settingsPolicy: policy,
    setSettings: vi.fn(async (settings: SoundingsSettings) => { owner.settings = settings; })
  };
  return { tab: new SoundingsSettingTab({} as App, owner), owner };
}

function controls(items: SettingDefinitionItem[]): SettingDefinition[] {
  return items.filter((item): item is SettingDefinition => "control" in item && item.control !== undefined);
}

describe("declarative Soundings settings", () => {
  it("indexes six controls and retains the non-searchable safety explanation", () => {
    const { tab } = setup();
    const definitions = tab.getSettingDefinitions();
    expect(controls(definitions)).toHaveLength(6);
    expect(controls(definitions).map((item) => item.name)).toEqual([
      "Convert .txt transcripts",
      "Convert .vtt transcripts",
      "Excluded folders",
      "Maximum transcript bytes",
      "Infer project from folder",
      "Project root"
    ]);
    expect(definitions[0]).toMatchObject({ name: "Soundings safety", searchable: false });
  });

  it("adapts individual controls through validated effective settings", async () => {
    const { tab, owner } = setup();
    expect(tab.getControlValue("excludedPaths")).toBe("Archive");
    await tab.setControlValue("excludedPaths", "Reference\nArchive");
    expect(owner.settings.excludedPaths).toEqual(["Config", ".soundings", "Reference", "Archive"]);
    await tab.setControlValue("txt", false);
    expect(owner.settings.enabledFormats).toEqual(["vtt"]);
    await tab.setControlValue("maxSourceBytes", 1024);
    expect(owner.settings.maxSourceBytes).toBe(1024);
  });

  it("returns inline validation text before an unsafe value is persisted", async () => {
    const { tab } = setup();
    const definitions = controls(tab.getSettingDefinitions());
    const maximum = definitions.find((item) => item.name === "Maximum transcript bytes")!;
    const excluded = definitions.find((item) => item.name === "Excluded folders")!;
    expect(await maximum.control?.validate?.(0 as never)).toContain("positive whole number");
    expect(await excluded.control?.validate?.("../outside" as never)).toContain("Invalid excluded path");
  });
});
