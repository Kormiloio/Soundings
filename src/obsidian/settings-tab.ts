import { App, PluginSettingTab, type SettingDefinitionItem } from "obsidian";
import {
  editableExcludedPaths,
  RESERVED_SECTIONS,
  validateSettings,
  type DestinationNamePattern,
  type OutputProfile,
  type ReservedSection,
  type SoundingsSettings,
  type TimestampPolicy,
  type TranscriptDisplay,
  type TitlePattern
} from "../core/settings";
import type { TranscriptFormat } from "../core/types";

type SoundingsSettingKey =
  | "txt" | "vtt" | "excludedPaths" | "maxSourceBytes" | "projectInferenceEnabled" | "projectRoot"
  | "observationEnabled" | "observationRoots" | "titlePattern" | "destinationNamePattern"
  | "summary" | "decisions" | "action-items" | "follow-ups" | "staticTags" | "timestampPolicy" | "transcriptDisplay";

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
      },
      {
        name: "Note output",
        searchable: false,
        render: (setting) => {
          setting.setName("").setDesc("Choose from safe, built-in output options. Every plan previews the exact destination and structure before conversion.");
        }
      },
      {
        name: "Note title",
        desc: "Use the source name alone or prefix it with the immediate parent folder.",
        control: {
          type: "dropdown",
          key: "titlePattern",
          options: {
            "source-name": "Source name",
            "parent-folder-source-name": "Parent folder — Source name"
          }
        }
      },
      {
        name: "Destination name",
        desc: "Create Source name.md or append the content-neutral Note suffix.",
        control: {
          type: "dropdown",
          key: "destinationNamePattern",
          options: {
            "source-name": "Source name.md",
            "source-name-note": "Source name - Note.md"
          }
        }
      },
      ...RESERVED_SECTIONS.map((section) => this.sectionDefinition(section)),
      {
        name: "Static tags",
        desc: "One tag per line. Use letters, numbers, underscores, hyphens, and single slashes; omit the leading #.",
        control: {
          type: "textarea",
          key: "staticTags",
          rows: 3,
          validate: (value) => this.validateControl("staticTags", value)
        }
      },
      {
        name: "WebVTT timestamps",
        desc: "Omit cue times or retain normalized source start and end times.",
        control: {
          type: "dropdown",
          key: "timestampPolicy",
          options: { omit: "Omit", retain: "Retain" }
        }
      },
      {
        name: "Transcript display",
        desc: "Plain shows the full transcript; folded callout collapses it behind one click and stays searchable.",
        control: {
          type: "dropdown",
          key: "transcriptDisplay",
          options: { plain: "Plain", "folded-callout": "Folded callout" },
          validate: (value) => this.validateControl("transcriptDisplay", value)
        }
      },
      {
        name: "Transcript observation",
        searchable: false,
        render: (setting) => {
          setting
            .setName("")
            .setDesc("When enabled, Soundings notifies you of new transcript files created while Obsidian is open. Conversion remains explicit and reviewed.");
        }
      },
      {
        name: "Observe new transcripts",
        desc: "Notify when supported transcript files are created.",
        control: { type: "toggle", key: "observationEnabled" }
      },
      {
        name: "Observation roots",
        desc: `One vault-relative folder per line. Leave empty to observe the whole vault. Hidden folders and ${configDir} remain excluded.`,
        control: {
          type: "textarea",
          key: "observationRoots",
          rows: 3,
          validate: (value) => this.validateControl("observationRoots", value)
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
      case "observationEnabled": return this.owner.settings.observationEnabled;
      case "observationRoots": return this.owner.settings.observationRoots.join("\n");
      case "titlePattern": return this.owner.settings.outputProfile.titlePattern;
      case "destinationNamePattern": return this.owner.settings.outputProfile.destinationNamePattern;
      case "summary":
      case "decisions":
      case "action-items":
      case "follow-ups": return this.owner.settings.outputProfile.enabledSections.includes(settingKey);
      case "staticTags": return this.owner.settings.outputProfile.staticTags.join("\n");
      case "timestampPolicy": return this.owner.settings.outputProfile.timestampPolicy;
      case "transcriptDisplay": return this.owner.settings.outputProfile.transcriptDisplay;
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

  private sectionDefinition(section: ReservedSection): SettingDefinitionItem<SoundingsSettingKey> {
    const names: Record<ReservedSection, string> = {
      summary: "Include Summary section",
      decisions: "Include Decisions section",
      "action-items": "Include Action Items section",
      "follow-ups": "Include Follow-ups section"
    };
    return {
      name: names[section],
      desc: "Include this reserved enrichment section in generated notes.",
      control: { type: "toggle", key: section }
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
      case "observationEnabled": return { ...this.owner.settings, excludedPaths: this.editableExclusions(), observationEnabled: value === true };
      case "observationRoots": return {
        ...this.owner.settings,
        excludedPaths: this.editableExclusions(),
        observationRoots: String(value).split("\n").map((path) => path.trim()).filter(Boolean)
      };
      case "titlePattern": return this.withOutputProfile({ titlePattern: String(value) as TitlePattern });
      case "destinationNamePattern": return this.withOutputProfile({ destinationNamePattern: String(value) as DestinationNamePattern });
      case "summary":
      case "decisions":
      case "action-items":
      case "follow-ups": {
        const sections = new Set(this.owner.settings.outputProfile.enabledSections);
        if (value === true) sections.add(key);
        else sections.delete(key);
        return this.withOutputProfile({ enabledSections: [...sections] });
      }
      case "staticTags": return this.withOutputProfile({
        staticTags: String(value).split("\n").map((tag) => tag.trim()).filter(Boolean)
      });
      case "timestampPolicy": return this.withOutputProfile({ timestampPolicy: String(value) as TimestampPolicy });
      case "transcriptDisplay": return this.withOutputProfile({ transcriptDisplay: String(value) as TranscriptDisplay });
    }
  }

  private withOutputProfile(profile: Partial<OutputProfile>): Partial<SoundingsSettings> {
    return {
      ...this.owner.settings,
      excludedPaths: this.editableExclusions(),
      outputProfile: { ...this.owner.settings.outputProfile, ...profile }
    };
  }

  private validateControl(key: SoundingsSettingKey, value: unknown): string | undefined {
    const policy = this.owner.settingsPolicy;
    if (!policy) return "The vault configuration directory could not be verified.";
    const validation = validateSettings(this.candidateFor(key, value), policy.mandatoryExcludedPaths);
    return validation.errors.join(" ") || undefined;
  }
}
