import { Notice, Plugin } from "obsidian";
import { discoverTranscripts } from "./core/discovery";
import { executePlan, RunCoordinator } from "./core/execution";
import { buildPlan } from "./core/planning";
import { DEFAULT_SETTINGS, validateSettings, type SoundingsSettings } from "./core/settings";
import { ObsidianVaultAdapter } from "./obsidian/vault-adapter";
import { ProgressModal, ResultsModal, ReviewModal } from "./obsidian/review-modal";
import { SoundingsSettingTab } from "./obsidian/settings-tab";

export default class SoundingsPlugin extends Plugin {
  settings: SoundingsSettings = DEFAULT_SETTINGS;
  private readonly runs = new RunCoordinator();

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new SoundingsSettingTab(this.app, this));
    this.addCommand({
      id: "scan-vault-for-transcripts",
      name: "Scan vault for transcripts",
      callback: () => { void this.scanAndReview(); }
    });
  }

  onunload(): void {
    this.runs.cancel();
  }

  async setSettings(settings: SoundingsSettings): Promise<void> {
    this.settings = settings;
    await this.saveData(settings);
  }

  private async loadSettings(): Promise<void> {
    const stored = await this.loadData() as Partial<SoundingsSettings> | null;
    const validation = validateSettings(stored ?? DEFAULT_SETTINGS);
    this.settings = validation.settings ?? DEFAULT_SETTINGS;
    if (validation.errors.length > 0) new Notice("Soundings ignored invalid saved settings and restored safe defaults.");
  }

  private async scanAndReview(): Promise<void> {
    if (this.runs.isActive) {
      new Notice("Soundings is already scanning or converting.");
      return;
    }
    const signal = this.runs.begin();
    const adapter = new ObsidianVaultAdapter(this.app.vault);
    try {
      const discovery = await discoverTranscripts(adapter, this.settings, signal);
      if (discovery.canceled) {
        new Notice("Soundings scan canceled. No files were changed.");
        return;
      }
      const existing = new Set(adapter.listFiles().map((file) => file.path));
      const plan = buildPlan(discovery.items, existing, this.settings);
      new ReviewModal(this.app, plan, {
        refresh: () => this.scanAndReview(),
        convert: (selected) => this.convertPlan(plan, selected)
      }).open();
    } catch {
      new Notice("Soundings could not complete the scan. No files were changed.");
    } finally {
      this.runs.finish(signal);
    }
  }

  private async convertPlan(plan: ReturnType<typeof buildPlan>, selected: ReadonlySet<string>): Promise<void> {
    if (this.runs.isActive) {
      new Notice("Soundings is already scanning or converting.");
      return;
    }
    const signal = this.runs.begin();
    const progress = new ProgressModal(this.app, () => this.runs.cancel());
    progress.open();
    try {
      const outcomes = await executePlan(plan, new ObsidianVaultAdapter(this.app.vault), {
        selectedSourcePaths: selected,
        settings: this.settings,
        signal,
        onProgress: (complete, total) => progress.update(complete, total)
      });
      progress.close();
      new ResultsModal(this.app, outcomes).open();
    } catch {
      progress.close();
      new Notice("Soundings stopped after an unexpected error. Review the destination paths before retrying.");
    } finally {
      this.runs.finish(signal);
    }
  }
}
