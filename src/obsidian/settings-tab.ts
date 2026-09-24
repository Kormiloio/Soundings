import { App, PluginSettingTab, Setting } from "obsidian";
import { DEFAULT_SETTINGS, validateSettings, type SoundingsSettings } from "../core/settings";
import type { TranscriptFormat } from "../core/types";

export interface SettingsOwner {
  settings: SoundingsSettings;
  setSettings(settings: SoundingsSettings): Promise<void>;
}

export class SoundingsSettingTab extends PluginSettingTab {
  private errorEl?: HTMLElement;

  constructor(app: App, private readonly owner: SettingsOwner) {
    super(app, owner as never);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("p", {
      text: "Soundings reads transcript files locally, preserves every source, and never overwrites an existing Markdown note."
    });
    this.errorEl = containerEl.createDiv({ cls: "soundings-settings__error", attr: { role: "alert", "aria-live": "polite" } });

    for (const format of ["txt", "vtt"] as const) this.addFormatSetting(format);

    new Setting(containerEl)
      .setName("Excluded folders")
      .setDesc("One vault-relative folder per line. Hidden folders and .obsidian remain excluded.")
      .addTextArea((component) => {
        component.setValue(this.owner.settings.excludedPaths.filter((path) => !DEFAULT_SETTINGS.excludedPaths.includes(path)).join("\n"));
        component.inputEl.setAttr("aria-label", "Excluded vault folders");
        component.onChange(async (value) => {
          const paths = value.split("\n").map((path) => path.trim()).filter(Boolean);
          await this.trySave({ ...this.owner.settings, excludedPaths: paths }, component.inputEl);
        });
      });

    new Setting(containerEl)
      .setName("Maximum transcript bytes")
      .setDesc("Files above this limit are reported but never read or converted.")
      .addText((component) => {
        component.setValue(String(this.owner.settings.maxSourceBytes));
        component.inputEl.setAttr("inputmode", "numeric");
        component.inputEl.setAttr("aria-label", "Maximum transcript bytes");
        component.onChange(async (value) => this.trySave(
          { ...this.owner.settings, maxSourceBytes: Number(value) }, component.inputEl
        ));
      });

    new Setting(containerEl)
      .setName("Infer project from folder")
      .setDesc("Use the first folder below the configured project root as note metadata.")
      .addToggle((component) => component
        .setValue(this.owner.settings.projectInferenceEnabled)
        .onChange(async (value) => this.trySave({ ...this.owner.settings, projectInferenceEnabled: value })));

    new Setting(containerEl)
      .setName("Project root")
      .setDesc("A vault-relative folder such as Projects.")
      .addText((component) => {
        component.setValue(this.owner.settings.projectRoot);
        component.inputEl.setAttr("aria-label", "Project root folder");
        component.onChange(async (value) => this.trySave({ ...this.owner.settings, projectRoot: value }, component.inputEl));
      });
  }

  private addFormatSetting(format: TranscriptFormat): void {
    new Setting(this.containerEl)
      .setName(`Convert .${format} transcripts`)
      .setDesc(`Include .${format} files in reviewed scans.`)
      .addToggle((component) => component
        .setValue(this.owner.settings.enabledFormats.includes(format))
        .onChange(async (enabled) => {
          const formats = enabled
            ? [...this.owner.settings.enabledFormats, format]
            : this.owner.settings.enabledFormats.filter((candidate) => candidate !== format);
          await this.trySave({ ...this.owner.settings, enabledFormats: formats });
        }));
  }

  private async trySave(candidate: Partial<SoundingsSettings>, input?: HTMLInputElement | HTMLTextAreaElement): Promise<void> {
    const validation = validateSettings(candidate);
    const message = validation.errors.join(" ");
    this.errorEl?.setText(message);
    if (input) input.setAttr("aria-invalid", message ? "true" : "false");
    if (validation.settings) await this.owner.setSettings(validation.settings);
  }
}
