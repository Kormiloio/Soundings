import { Notice, Plugin, TFile, type EventRef, type Modal } from "obsidian";
import { discoverTranscripts } from "./core/discovery";
import { executeEnrichmentPlan, type EnrichmentOutcome } from "./core/enrichment-execution";
import { identifySourceNote, type SourceNoteEvidence } from "./core/enrichment-evidence";
import type { EnrichmentPlan } from "./core/enrichment-planning";
import { executePlan, RunCoordinator } from "./core/execution";
import { sha256 } from "./core/hash";
import type { DigestFunction } from "./core/hash";
import { ObservationProcessor, planTranscriptInbox } from "./core/observation";
import { buildPlan } from "./core/planning";
import {
  createSettingsPolicy,
  DEFAULT_SETTINGS,
  editableExcludedPaths,
  migrateSavedSettings,
  validateSettings,
  type SoundingsSettings,
  type SoundingsSettingsPolicy
} from "./core/settings";
import { EnrichmentModal } from "./obsidian/enrichment-modal";
import { ObsidianVaultAdapter } from "./obsidian/vault-adapter";
import { ProgressModal, ResultsModal, ReviewModal } from "./obsidian/review-modal";
import { SoundingsSettingTab } from "./obsidian/settings-tab";

function observationSettingsChanged(previous: SoundingsSettings, next: SoundingsSettings): boolean {
  return previous.observationEnabled !== next.observationEnabled
    || previous.observationRoots.length !== next.observationRoots.length
    || previous.observationRoots.some((root, index) => root !== next.observationRoots[index]);
}

export default class SoundingsPlugin extends Plugin {
  settings: SoundingsSettings = DEFAULT_SETTINGS;
  settingsPolicy?: SoundingsSettingsPolicy;
  private readonly runs = new RunCoordinator();
  private vaultAdapter?: ObsidianVaultAdapter;
  private observer?: ObservationProcessor;
  private observationEvent?: EventRef;
  private inboxNoticeOutstanding = false;
  private unloaded = false;
  private layoutReady = false;
  private readonly ownedModals = new Set<Modal>();
  private readonly digest: DigestFunction = async (algorithm, data) => {
    const subtle = activeWindow.crypto?.subtle;
    if (!subtle) throw new Error("secure-hash-unavailable");
    return subtle.digest(algorithm, data);
  };

  async onload(): Promise<void> {
    const policyValidation = createSettingsPolicy(this.app.vault.configDir);
    this.settingsPolicy = policyValidation.policy;
    await this.loadSettings();
    this.vaultAdapter = new ObsidianVaultAdapter(this.app.vault);
    this.observer = new ObservationProcessor({
      adapter: this.vaultAdapter,
      settings: () => this.settings,
      digest: this.digest,
      canProcess: () => !this.runs.isActive,
      wait: (signal) => this.waitForObservation(signal),
      onChanged: () => this.notifyInbox()
    });
    this.addSettingTab(new SoundingsSettingTab(this.app, this));
    this.addRibbonIcon("waves", "Scan vault for transcripts", () => {
      void this.scanAndReview();
    });
    this.addCommand({
      id: "scan-vault-for-transcripts",
      name: "Scan vault for transcripts",
      callback: () => { void this.scanAndReview(); }
    });
    this.addCommand({
      id: "review-transcript-inbox",
      name: "Review transcript inbox",
      callback: () => { void this.reviewInbox(); }
    });
    this.addCommand({
      id: "add-manual-enrichment",
      name: "Add manual enrichment",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== "md") return false;
        if (checking) return true;
        void this.startManualEnrichment(file.path);
        return true;
      }
    });
    // Obsidian emits "create" for every existing file while the vault loads; subscribe only afterwards.
    this.app.workspace.onLayoutReady(() => {
      this.layoutReady = true;
      this.syncObservation();
    });
  }

  onunload(): void {
    this.unloaded = true;
    this.runs.cancel();
    this.stopObservation(true);
    for (const modal of [...this.ownedModals]) modal.close();
    this.ownedModals.clear();
  }

  /** Tracks a modal so unload closes it; closed modals are forgotten. */
  private own<T extends Modal>(modal: T): T {
    this.ownedModals.add(modal);
    const onClose = modal.onClose.bind(modal);
    modal.onClose = () => {
      this.ownedModals.delete(modal);
      onClose();
    };
    return modal;
  }

  async setSettings(settings: SoundingsSettings): Promise<void> {
    const policy = this.settingsPolicy;
    if (!policy) throw new Error("safe-settings-policy-unavailable");
    const validation = validateSettings(settings, policy.mandatoryExcludedPaths);
    if (!validation.settings) throw new Error("invalid-soundings-settings");
    const previous = this.settings;
    this.settings = validation.settings;
    await this.saveData(validation.settings);
    // Other settings are read lazily by the observer and re-checked at inbox review, so queued
    // candidates survive unrelated changes.
    if (observationSettingsChanged(previous, validation.settings)) {
      this.stopObservation(true);
      this.syncObservation();
    }
  }

  private syncObservation(): void {
    if (!this.settingsPolicy || !this.settings.observationEnabled) {
      this.stopObservation(true);
      return;
    }
    if (this.unloaded || !this.layoutReady || this.observationEvent) return;
    this.observationEvent = this.app.vault.on("create", (file) => {
      if (file instanceof TFile) void this.observer?.handleCreated(file.path);
    });
    this.registerEvent(this.observationEvent);
  }

  private stopObservation(clearInbox: boolean): void {
    if (this.observationEvent) this.app.vault.offref(this.observationEvent);
    this.observationEvent = undefined;
    this.observer?.stop(clearInbox);
    this.inboxNoticeOutstanding = false;
  }

  private waitForObservation(signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      if (signal.aborted) { resolve(); return; }
      const timer = window.setTimeout(finish, 250);
      signal.addEventListener("abort", finish, { once: true });
      function finish(): void {
        window.clearTimeout(timer);
        signal.removeEventListener("abort", finish);
        resolve();
      }
    });
  }

  private notifyInbox(): void {
    if (this.inboxNoticeOutstanding || !this.observer || this.observer.inbox.size === 0) return;
    this.inboxNoticeOutstanding = true;
    new Notice("Soundings found new transcripts. Run ‘Review transcript inbox’ to inspect them.");
  }

  private isBusy(): boolean {
    return this.runs.isActive || (this.observer?.pendingCount ?? 0) > 0;
  }

  private async startManualEnrichment(sourcePath: string): Promise<void> {
    if (this.unloaded) return;
    if (this.isBusy()) {
      new Notice("Soundings is already scanning or converting.");
      return;
    }
    const adapter = this.vaultAdapter;
    if (!adapter) {
      new Notice("Soundings cannot add enrichment until the vault is ready.");
      return;
    }
    const evidence = await this.identifyEnrichmentSource(adapter, sourcePath);
    if (this.unloaded) return;
    if (!evidence) {
      new Notice("Manual enrichment requires an active Soundings transcript note.");
      return;
    }
    this.own(new EnrichmentModal(this.app, sourcePath, {
      sourceEvidence: evidence,
      existingPaths: () => new Set(adapter.listFiles().map((file) => file.path)),
      planId: () => activeWindow.crypto.randomUUID(),
      publish: (plan) => this.publishEnrichment(plan),
      reidentify: () => this.identifyEnrichmentSource(adapter, sourcePath)
    })).open();
  }

  private async identifyEnrichmentSource(
    adapter: ObsidianVaultAdapter,
    sourcePath: string
  ): Promise<SourceNoteEvidence | undefined> {
    let bytes: Uint8Array;
    try {
      bytes = await adapter.readBinary(sourcePath);
    } catch {
      return undefined;
    }
    const identified = await identifySourceNote(
      sourcePath,
      bytes,
      this.settings.maxSourceBytes,
      (data) => sha256(data, this.digest)
    );
    return identified.ok ? identified.value : undefined;
  }

  private async publishEnrichment(plan: EnrichmentPlan): Promise<EnrichmentOutcome | undefined> {
    if (this.unloaded) return undefined;
    if (this.isBusy()) {
      new Notice("Soundings is already scanning or converting.");
      return undefined;
    }
    const signal = this.runs.begin();
    const adapter = new ObsidianVaultAdapter(this.app.vault);
    try {
      const outcome = await executeEnrichmentPlan(plan, adapter, {
        signal,
        digest: this.digest,
        maxSourceBytes: this.settings.maxSourceBytes
      });
      if (outcome.status === "created") new Notice(`Soundings created ${outcome.destinationPath}.`);
      return outcome;
    } catch {
      new Notice("Soundings stopped after an unexpected error. No companion note was verified.");
      return undefined;
    } finally {
      this.runs.finish(signal);
    }
  }

  private async reviewInbox(): Promise<void> {
    if (this.unloaded) return;
    const adapter = this.vaultAdapter;
    const observer = this.observer;
    if (!this.settingsPolicy || !adapter || !observer) {
      new Notice("Soundings cannot review the inbox until the vault configuration is valid.");
      return;
    }
    if (this.isBusy()) {
      new Notice("Soundings is already scanning or converting.");
      return;
    }
    const signal = this.runs.begin();
    this.inboxNoticeOutstanding = false;
    try {
      const plan = await planTranscriptInbox(
        observer.inbox, adapter, this.settings, this.digest, new Date(), () => activeWindow.crypto.randomUUID(), signal
      );
      if (this.unloaded) return;
      if (!plan) {
        new Notice("Soundings transcript inbox has no current eligible files.");
        return;
      }
      this.own(new ReviewModal(this.app, plan, {
        refresh: () => this.reviewInbox(),
        convert: (selected) => this.convertPlan(plan, selected)
      })).open();
    } catch {
      new Notice("Soundings could not review the transcript inbox. No files were changed.");
    } finally {
      this.runs.finish(signal);
    }
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
      ? editableExcludedPaths({ excludedPaths: stored.excludedPaths }, policy.mandatoryExcludedPaths)
      : [];
    const validation = migrateSavedSettings({ ...(stored ?? {}), excludedPaths: storedExclusions }, policy.mandatoryExcludedPaths);
    const safeDefaults = validateSettings({}, policy.mandatoryExcludedPaths).settings;
    this.settings = validation.settings ?? safeDefaults ?? DEFAULT_SETTINGS;
    if (validation.errors.length > 0) new Notice("Soundings ignored invalid saved settings and restored safe defaults.");
  }

  private async scanAndReview(): Promise<void> {
    if (this.unloaded) return;
    if (!this.settingsPolicy) {
      new Notice("Soundings cannot scan until the vault configuration directory is valid.");
      return;
    }
    if (this.isBusy()) {
      new Notice("Soundings is already scanning or converting.");
      return;
    }
    const signal = this.runs.begin();
    const adapter = new ObsidianVaultAdapter(this.app.vault);
    try {
      const discovery = await discoverTranscripts(adapter, this.settings, signal, 50, this.digest);
      if (this.unloaded) return;
      if (discovery.canceled) {
        new Notice("Soundings scan canceled. No files were changed.");
        return;
      }
      const existing = new Set(adapter.listFiles().map((file) => file.path));
      const plan = buildPlan(discovery.items, existing, this.settings, new Date(), () => activeWindow.crypto.randomUUID());
      this.own(new ReviewModal(this.app, plan, {
        refresh: () => this.scanAndReview(),
        convert: (selected) => this.convertPlan(plan, selected)
      })).open();
    } catch {
      new Notice("Soundings could not complete the scan. No files were changed.");
    } finally {
      this.runs.finish(signal);
    }
  }

  private async convertPlan(plan: ReturnType<typeof buildPlan>, selected: ReadonlySet<string>): Promise<void> {
    if (this.unloaded) return;
    if (this.isBusy()) {
      new Notice("Soundings is already scanning or converting.");
      return;
    }
    const signal = this.runs.begin();
    const progress = this.own(new ProgressModal(this.app, () => this.runs.cancel()));
    progress.open();
    try {
      const outcomes = await executePlan(plan, new ObsidianVaultAdapter(this.app.vault), {
        selectedSourcePaths: selected,
        settings: this.settings,
        signal,
        digest: this.digest,
        onProgress: (complete, total) => progress.update(complete, total)
      });
      for (const outcome of outcomes) {
        if (outcome.status === "created") this.observer?.inbox.remove(outcome.sourcePath);
      }
      progress.finish();
      if (!this.unloaded) this.own(new ResultsModal(this.app, outcomes)).open();
    } catch {
      progress.finish();
      new Notice("Soundings stopped after an unexpected error. Review the destination paths before retrying.");
    } finally {
      this.runs.finish(signal);
    }
  }
}
