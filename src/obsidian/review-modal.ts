import { App, Modal, Setting } from "obsidian";
import type { ConversionPlan, ExecutionOutcome } from "../core/types";

export interface ReviewActions {
  refresh(): Promise<void>;
  convert(selectedSourcePaths: ReadonlySet<string>): Promise<void>;
}

export class ReviewModal extends Modal {
  private readonly selected = new Set<string>();

  constructor(app: App, private readonly plan: ConversionPlan, private readonly actions: ReviewActions) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Soundings conversion plan" });
    contentEl.createEl("p", {
      cls: "soundings-review__summary",
      text: `${this.plan.items.length} transcript candidate${this.plan.items.length === 1 ? "" : "s"}. Select eligible notes to create.`
    });

    let convertButton: HTMLButtonElement | undefined;
    const updateConvert = () => { if (convertButton) convertButton.disabled = this.selected.size === 0; };

    for (const item of this.plan.items) {
      const row = new Setting(contentEl)
        .setClass("soundings-review__item")
        .setName(item.sourcePath)
        .setDesc(`${item.destinationPath} — ${item.classification}: ${item.reason}`);
      if (item.classification === "eligible") {
        row.addToggle((toggle) => {
          toggle.toggleEl.setAttr("aria-label", `Select ${item.sourcePath} for conversion`);
          toggle.setValue(false).onChange((selected) => {
            if (selected) this.selected.add(item.sourcePath);
            else this.selected.delete(item.sourcePath);
            updateConvert();
          });
        });
      }
    }

    new Setting(contentEl)
      .addButton((button) => button.setButtonText("Refresh plan").onClick(async () => {
        this.close();
        await this.actions.refresh();
      }))
      .addButton((button) => button.setButtonText("Close").onClick(() => this.close()))
      .addButton((button) => {
        button.setCta().setButtonText("Convert selected");
        convertButton = button.buttonEl;
        updateConvert();
        button.onClick(async () => {
          if (this.selected.size === 0) return;
          const selection = new Set(this.selected);
          this.close();
          await this.actions.convert(selection);
        });
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export class ProgressModal extends Modal {
  private progressEl?: HTMLElement;

  constructor(app: App, private readonly cancelRun: () => void) {
    super(app);
  }

  onOpen(): void {
    this.contentEl.createEl("h2", { text: "Converting transcripts" });
    this.progressEl = this.contentEl.createEl("p", { text: "Preparing…", attr: { "aria-live": "polite" } });
    new Setting(this.contentEl).addButton((button) => button
      .setWarning()
      .setButtonText("Cancel remaining")
      .onClick(() => {
        this.cancelRun();
        button.setDisabled(true);
        this.progressEl?.setText("Canceling after the current safe operation settles…");
      }));
  }

  update(complete: number, total: number): void {
    this.progressEl?.setText(`Processed ${complete} of ${total} selected transcript${total === 1 ? "" : "s"}.`);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export class ResultsModal extends Modal {
  constructor(app: App, private readonly outcomes: readonly ExecutionOutcome[]) {
    super(app);
  }

  onOpen(): void {
    this.contentEl.createEl("h2", { text: "Soundings results" });
    const counts = new Map<string, number>();
    for (const outcome of this.outcomes) counts.set(outcome.status, (counts.get(outcome.status) ?? 0) + 1);
    this.contentEl.createEl("p", {
      text: [...counts].map(([status, count]) => `${status}: ${count}`).join(" · "),
      attr: { "aria-live": "polite" }
    });
    for (const outcome of this.outcomes) {
      new Setting(this.contentEl).setName(outcome.sourcePath).setDesc(`${outcome.status}: ${outcome.reason}`);
    }
    new Setting(this.contentEl).addButton((button) => button.setButtonText("Close").onClick(() => this.close()));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
