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
  it("indexes output controls and retains non-searchable explanations", () => {
    const { tab } = setup();
    const definitions = tab.getSettingDefinitions();
    expect(controls(definitions)).toHaveLength(19);
    expect(controls(definitions).map((item) => item.name)).toEqual([
      "Convert .txt transcripts",
      "Convert .vtt transcripts",
      "Convert .srt transcripts",
      "TXT layout",
      "Excluded folders",
      "Maximum transcript bytes",
      "Infer project from folder",
      "Project root",
      "Note title",
      "Destination name",
      "Include Summary section",
      "Include Decisions section",
      "Include Action Items section",
      "Include Follow-ups section",
      "Static tags",
      "Transcript timestamps",
      "Transcript display",
      "Observe new transcripts",
      "Observation roots"
    ]);
    expect(definitions[0]).toMatchObject({ name: "Soundings safety", searchable: false });
    expect(definitions[9]).toMatchObject({ name: "Note output", searchable: false });
    expect(definitions[19]).toMatchObject({ name: "Transcript observation", searchable: false });
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
    await tab.setControlValue("observationEnabled", true);
    expect(owner.settings.observationEnabled).toBe(true);
    await tab.setControlValue("observationRoots", "Meetings\nCalls");
    expect(owner.settings.observationRoots).toEqual(["Meetings", "Calls"]);
    await tab.setControlValue("titlePattern", "parent-folder-source-name");
    await tab.setControlValue("destinationNamePattern", "source-name-note");
    await tab.setControlValue("decisions", false);
    await tab.setControlValue("staticTags", "project/alpha\nnotes");
    await tab.setControlValue("timestampPolicy", "retain");
    expect(tab.getControlValue("transcriptDisplay")).toBe("plain");
    await tab.setControlValue("transcriptDisplay", "folded-callout");
    expect(tab.getControlValue("transcriptDisplay")).toBe("folded-callout");
    expect(owner.settings.outputProfile).toEqual({
      titlePattern: "parent-folder-source-name",
      destinationNamePattern: "source-name-note",
      enabledSections: ["summary", "action-items", "follow-ups"],
      staticTags: ["project/alpha", "notes"],
      timestampPolicy: "retain",
      transcriptDisplay: "folded-callout"
    });
  });

  it("returns inline validation text before an unsafe value is persisted", async () => {
    const { tab } = setup();
    const definitions = controls(tab.getSettingDefinitions());
    const maximum = definitions.find((item) => item.name === "Maximum transcript bytes")!;
    const excluded = definitions.find((item) => item.name === "Excluded folders")!;
    const obsRoots = definitions.find((item) => item.name === "Observation roots")!;
    const staticTags = definitions.find((item) => item.name === "Static tags")!;
    expect(await maximum.control?.validate?.(0 as never)).toContain("positive whole number");
    expect(await excluded.control?.validate?.("../outside" as never)).toContain("Invalid excluded path");
    expect(await obsRoots.control?.validate?.("/absolute" as never)).toContain("Invalid observation root");
    expect(await staticTags.control?.validate?.("#unsafe" as never)).toContain("Invalid static tag");
    const display = definitions.find((item) => item.name === "Transcript display")!;
    expect(display.control).toMatchObject({ type: "dropdown", options: { plain: "Plain", "folded-callout": "Folded callout" } });
    expect(await display.control?.validate?.("unknown" as never)).toContain("Unsupported transcript display choice");
  });

  it("keeps SRT opt-in and persists an SRT-only selection", async () => {
    const { tab, owner } = setup();
    expect(tab.getControlValue("srt")).toBe(false);
    const srt = controls(tab.getSettingDefinitions()).find((item) => item.name === "Convert .srt transcripts")!;
    expect(srt.control).toMatchObject({ type: "toggle", key: "srt" });
    await tab.setControlValue("srt", true);
    await tab.setControlValue("txt", false);
    await tab.setControlValue("vtt", false);
    expect(tab.getControlValue("srt")).toBe(true);
    expect(validateSettings(owner.settings, owner.settingsPolicy!.mandatoryExcludedPaths).settings?.enabledFormats).toEqual(["srt"]);
    expect(owner.settings.observationEnabled).toBe(false);
  });

  it("opts into TXT layout without enabling TXT or observation", async () => {
    const { tab, owner } = setup();
    expect(tab.getControlValue("txtLayout")).toBe("plain");
    await tab.setControlValue("txt", false);
    await tab.setControlValue("txtLayout", "timestamped-speaker");
    expect(tab.getControlValue("txtLayout")).toBe("timestamped-speaker");
    expect(owner.settings.enabledFormats).toEqual(["vtt"]);
    expect(owner.settings.observationEnabled).toBe(false);
  });
});
