import { App, PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import { editableExcludedPaths, validateSettings, type SoundingsSettings } from "../core/settings";
import type { TranscriptFormat } from "../core/types";

type SoundingsSettingKey = "txt" | "vtt" | "excludedPaths" | "maxSourceBytes" | "projectInferenceEnabled" | "projectRoot";

export interface SettingsOwner {
  settings: SoundingsSettings;
  readonly settingsPolicy?: {
    readonly configDir: string;
    readonly mandatoryExcludedPaths: readonly string[];
  };
  setSettings(settings: SoundingsSettings): Promise<void>;
}

export class SoundingsSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly owner: SettingsOwner) {
    super(app, owner as never);
  }

  getSettingDefinitions(): SettingDefinitionItem<SoundingsSettingKey>[] {
    const configDir = this.owner.settingsPolicy?.configDir ?? "the configured Obsidian folder";
    return [
      {
        name: "Soundings safety",
        searchable: false,
        render: (setting) => {
          setting
            .setName("")
            .setDesc("Soundings reads transcript files locally, preserves every source, and never overwrites an existing Markdown note.");
        }
      },
      this.formatDefinition("txt"),
      this.formatDefinition("vtt"),
      {
        name: "Excluded folders",
        desc: `One vault-relative folder per line. Hidden folders and ${configDir} remain excluded.`,
        control: {
          type: "textarea",
          key: "excludedPaths",
          rows: 4,
          validate: (value) => this.validateControl("excludedPaths", value)
        }
      },
      {
        name: "Maximum transcript bytes",
        desc: "Files above this limit are reported but never read or converted.",
        control: {
          type: "number",
          key: "maxSourceBytes",
          min: 1,
          step: 1,
          validate: (value) => this.validateControl("maxSourceBytes", value)
        }
      },
      {
        name: "Infer project from folder",
        desc: "Use the first folder below the configured project root as note metadata.",
        control: { type: "toggle", key: "projectInferenceEnabled" }
      },
      {
        name: "Project root",
        desc: "A vault-relative folder such as Projects.",
        control: {
          type: "text",
          key: "projectRoot",
          validate: (value) => this.validateControl("projectRoot", value)
        }
      }
    ];
  }

  getControlValue(key: string): unknown {
    const settingKey = key as SoundingsSettingKey;
    switch (settingKey) {
      case "txt":
      case "vtt": return this.owner.settings.enabledFormats.includes(settingKey);
      case "excludedPaths": return this.editableExclusions().join("\n");
      case "maxSourceBytes": return this.owner.settings.maxSourceBytes;
      case "projectInferenceEnabled": return this.owner.settings.projectInferenceEnabled;
      case "projectRoot": return this.owner.settings.projectRoot;
    }
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    const settingKey = key as SoundingsSettingKey;
    const candidate = this.candidateFor(settingKey, value);
    const policy = this.owner.settingsPolicy;
    if (!policy) throw new Error("safe-settings-policy-unavailable");
    const validation = validateSettings(candidate, policy.mandatoryExcludedPaths);
    if (!validation.settings) throw new Error(validation.errors.join(" "));
    await this.owner.setSettings(validation.settings);
  }

  private formatDefinition(format: TranscriptFormat): SettingDefinitionItem<SoundingsSettingKey> {
    return {
      name: `Convert .${format} transcripts`,
      desc: `Include .${format} files in reviewed scans.`,
      control: {
        type: "toggle",
        key: format,
        validate: (value) => this.validateControl(format, value)
      }
    };
  }

  private editableExclusions(): readonly string[] {
    return editableExcludedPaths(this.owner.settings, this.owner.settingsPolicy?.mandatoryExcludedPaths ?? []);
  }

  private candidateFor(key: SoundingsSettingKey, value: unknown): Partial<SoundingsSettings> {
    switch (key) {
      case "txt":
      case "vtt": {
        const formats = new Set(this.owner.settings.enabledFormats);
        if (value === true) formats.add(key);
        else formats.delete(key);
        return { ...this.owner.settings, enabledFormats: [...formats], excludedPaths: this.editableExclusions() };
      }
      case "excludedPaths": return {
        ...this.owner.settings,
        excludedPaths: String(value).split("\n").map((path) => path.trim()).filter(Boolean)
      };
      case "maxSourceBytes": return { ...this.owner.settings, excludedPaths: this.editableExclusions(), maxSourceBytes: Number(value) };
      case "projectInferenceEnabled": return { ...this.owner.settings, excludedPaths: this.editableExclusions(), projectInferenceEnabled: value === true };
      case "projectRoot": return { ...this.owner.settings, excludedPaths: this.editableExclusions(), projectRoot: String(value) };
    }
  }

  private validateControl(key: SoundingsSettingKey, value: unknown): string | undefined {
    const policy = this.owner.settingsPolicy;
    if (!policy) return "The vault configuration directory could not be verified.";
    const validation = validateSettings(this.candidateFor(key, value), policy.mandatoryExcludedPaths);
    return validation.errors.join(" ") || undefined;
  }
}
