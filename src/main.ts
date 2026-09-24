import { Notice, Plugin } from "obsidian";
import { discoverTranscripts } from "./core/discovery";
import { executePlan, RunCoordinator } from "./core/execution";
import type { DigestFunction } from "./core/hash";
import { buildPlan } from "./core/planning";
import {
  createSettingsPolicy,
  DEFAULT_SETTINGS,
  editableExcludedPaths,
  validateSettings,
  type SoundingsSettings,
  type SoundingsSettingsPolicy
} from "./core/settings";
import { ObsidianVaultAdapter } from "./obsidian/vault-adapter";
import { ProgressModal, ResultsModal, ReviewModal } from "./obsidian/review-modal";
import { SoundingsSettingTab } from "./obsidian/settings-tab";

export default class SoundingsPlugin extends Plugin {
  settings: SoundingsSettings = DEFAULT_SETTINGS;
  settingsPolicy?: SoundingsSettingsPolicy;
  private readonly runs = new RunCoordinator();
  private readonly digest: DigestFunction = async (algorithm, data) => {
    const subtle = activeWindow.crypto?.subtle;
    if (!subtle) throw new Error("secure-hash-unavailable");
    return subtle.digest(algorithm, data);
  };

  async onload(): Promise<void> {
    const policyValidation = createSettingsPolicy(this.app.vault.configDir);
    this.settingsPolicy = policyValidation.policy;
    await this.loadSettings();
    this.addSettingTab(new SoundingsSettingTab(this.app, this));
    this.addRibbonIcon("waves", "Scan vault for transcripts", () => {
      void this.scanAndReview();
    });
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
    const policy = this.settingsPolicy;
    if (!policy) throw new Error("safe-settings-policy-unavailable");
    const validation = validateSettings(settings, policy.mandatoryExcludedPaths);
    if (!validation.settings) throw new Error("invalid-soundings-settings");
    this.settings = validation.settings;
    await this.saveData(validation.settings);
  }

  private async loadSettings(): Promise<void> {
    const stored = await this.loadData() as Partial<SoundingsSettings> | null;
    const policy = this.settingsPolicy;
    if (!policy) {
      this.settings = DEFAULT_SETTINGS;
      new Notice("Soundings could not verify the vault configuration directory. Scanning is disabled.");
      return;
    }
    const storedExclusions = stored?.excludedPaths
      ? editableExcludedPaths({ ...DEFAULT_SETTINGS, ...stored, excludedPaths: stored.excludedPaths } as SoundingsSettings, policy.mandatoryExcludedPaths)
      : [];
    const validation = validateSettings({ ...(stored ?? {}), excludedPaths: storedExclusions }, policy.mandatoryExcludedPaths);
    const safeDefaults = validateSettings({}, policy.mandatoryExcludedPaths).settings;
    this.settings = validation.settings ?? safeDefaults ?? DEFAULT_SETTINGS;
    if (validation.errors.length > 0) new Notice("Soundings ignored invalid saved settings and restored safe defaults.");
  }

  private async scanAndReview(): Promise<void> {
    if (!this.settingsPolicy) {
      new Notice("Soundings cannot scan until the vault configuration directory is valid.");
      return;
    }
    if (this.runs.isActive) {
      new Notice("Soundings is already scanning or converting.");
      return;
    }
    const signal = this.runs.begin();
    const adapter = new ObsidianVaultAdapter(this.app.vault);
    try {
      const discovery = await discoverTranscripts(adapter, this.settings, signal, 50, this.digest);
      if (discovery.canceled) {
        new Notice("Soundings scan canceled. No files were changed.");
        return;
      }
      const existing = new Set(adapter.listFiles().map((file) => file.path));
      const plan = buildPlan(discovery.items, existing, this.settings, new Date(), () => activeWindow.crypto.randomUUID());
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
        digest: this.digest,
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
