import { App, Modal, Setting, type ToggleComponent } from "obsidian";
import {
  clearReviewSelection,
  changeReviewContentKind,
  createReviewSelection,
  PLAN_CLASSIFICATIONS,
  projectReviewPlan,
  selectAllVisibleEligible,
  type ReviewClassificationFilter
} from "../core/review-state";
import type { ConversionPlan, ExecutionOutcome } from "../core/types";
import { CONTENT_KINDS, contentKindDescription, contentKindFor } from "../core/content-kind";

export interface ReviewActions {
  refresh(): Promise<void>;
  convert(selectedSourcePaths: ReadonlySet<string>, reviewedPlan?: ConversionPlan): Promise<void>;
}

export class ReviewModal extends Modal {
  private selected = createReviewSelection();
  private query = "";
  private classification: ReviewClassificationFilter = "all";
  private plan: ConversionPlan;

  constructor(app: App, private readonly initialPlan: ConversionPlan, private readonly actions: ReviewActions) {
    super(app);
    this.plan = initialPlan;
  }

  onOpen(): void {
    const { contentEl } = this;
    this.modalEl.addClass("soundings-review-modal");
    contentEl.empty();
    contentEl.addClass("soundings-review");
    this.selected = createReviewSelection();
    this.plan = this.initialPlan;
    this.query = "";
    this.classification = "all";
    contentEl.createEl("h2", { text: "Soundings conversion plan" });
    contentEl.createEl("p", {
      text: `${this.plan.outputProfileSummary} TXT layout: ${this.plan.txtLayout === "timestamped-speaker" ? "Timestamped speaker" : "Plain text"}.`,
      cls: "soundings-review__profile"
    });
    const summaryEl = contentEl.createEl("p", {
      cls: "soundings-review__summary",
      attr: { "aria-live": "polite" }
    });
    const selectedEl = contentEl.createEl("p", {
      cls: "soundings-review__selected",
      attr: { "aria-live": "polite" }
    });

    new Setting(contentEl)
      .setClass("soundings-review__filters")
      .addText((text) => {
        text.setPlaceholder("Search source or destination paths");
        text.inputEl.setAttr("aria-label", "Search source paths");
        text.inputEl.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          event.stopPropagation();
        });
        text.onChange((query) => {
          this.query = query;
          renderRows();
        });
      })
      .addDropdown((dropdown) => {
        dropdown.selectEl.setAttr("aria-label", "Filter by classification");
        dropdown.addOption("all", "All classifications");
        for (const classification of PLAN_CLASSIFICATIONS) {
          dropdown.addOption(classification, classification.replaceAll("-", " "));
        }
        dropdown.setValue("all").onChange((classification) => {
          this.classification = classification as ReviewClassificationFilter;
          renderRows();
        });
      });

    const itemsEl = contentEl.createDiv({ cls: "soundings-review__items" });

    let convertButton: HTMLButtonElement | undefined;
    let selectVisibleButton: HTMLButtonElement | undefined;
    let clearButton: HTMLButtonElement | undefined;

    const updateState = () => {
      const projection = projectReviewPlan(this.plan, {
        query: this.query,
        classification: this.classification,
        selectedSourcePaths: this.selected
      });
      const counts = PLAN_CLASSIFICATIONS
        .filter((classification) => projection.counts[classification] > 0)
        .map((classification) => `${classification}: ${projection.counts[classification]}`)
        .join(" · ");
      summaryEl.setText(
        `${this.plan.items.length} source candidate${this.plan.items.length === 1 ? "" : "s"}. `
        + `${projection.visibleItems.length} shown${counts ? ` · ${counts}` : ""}.`
      );
      selectedEl.setText(`${projection.selectedCount} selected. Select eligible notes to create.`);
      if (convertButton) convertButton.disabled = projection.selectedCount === 0;
      if (selectVisibleButton) selectVisibleButton.disabled = projection.visibleEligibleCount === 0;
      if (clearButton) clearButton.disabled = projection.selectedCount === 0;
      return projection;
    };

    const renderRows = () => {
      const projection = updateState();
      itemsEl.empty();
      if (projection.visibleItems.length === 0) {
        itemsEl.createEl("p", { text: "No source candidates match the current filters." });
        return;
      }
      for (const item of projection.visibleItems) {
        const row = new Setting(itemsEl)
          .setClass("soundings-review__item")
          .setName(item.sourcePath)
          .setDesc(`${item.destinationPath ?? "No safe destination"} — ${item.classification}: ${contentKindDescription(item)}`);
        if (item.classification === "eligible") {
          let selectionToggle: ToggleComponent | undefined;
          if (item.format === "txt") {
            row.addDropdown((dropdown) => {
              dropdown.selectEl.setAttr("aria-label", `Content type for ${item.sourcePath}`);
              for (const [kind, label] of Object.entries(CONTENT_KINDS)) dropdown.addOption(kind, label);
              dropdown.setValue(contentKindFor(item) ?? "transcript").onChange((kind) => {
                const revised = changeReviewContentKind(this.plan, this.selected, item.sourcePath, kind);
                this.plan = revised.plan;
                this.selected = revised.selected;
                selectionToggle?.setValue(this.selected.has(item.sourcePath));
                const current = this.plan.items.find((entry) => entry.sourcePath === item.sourcePath)!;
                row.setDesc(`${current.destinationPath ?? "No safe destination"} — ${current.classification}: ${contentKindDescription(current)}`);
                updateState();
              });
            });
          }
          row.addToggle((toggle) => {
            selectionToggle = toggle;
            toggle.toggleEl.setAttr("aria-label", `Select ${item.sourcePath} for conversion`);
            toggle.setValue(this.selected.has(item.sourcePath)).onChange((selected) => {
              if (selected) this.selected.add(item.sourcePath);
              else this.selected.delete(item.sourcePath);
              updateState();
            });
          });
        }
      }
    };

    new Setting(contentEl)
      .setClass("soundings-review__selection-actions")
      .addButton((button) => {
        button.setButtonText("Select all eligible shown");
        selectVisibleButton = button.buttonEl;
        button.onClick(() => {
          const projection = projectReviewPlan(this.plan, {
            query: this.query,
            classification: this.classification,
            selectedSourcePaths: this.selected
          });
          this.selected = selectAllVisibleEligible(this.selected, projection.visibleItems);
          renderRows();
        });
      })
      .addButton((button) => {
        button.setButtonText("Clear selection");
        clearButton = button.buttonEl;
        button.onClick(() => {
          this.selected = clearReviewSelection();
          renderRows();
        });
      });

    new Setting(contentEl)
      .setClass("soundings-review__footer")
      .addButton((button) => button.setButtonText("Refresh plan").onClick(async () => {
        this.close();
        await this.actions.refresh();
      }))
      .addButton((button) => button.setButtonText("Close").onClick(() => this.close()))
      .addButton((button) => {
        button.setCta().setButtonText("Convert selected");
        convertButton = button.buttonEl;
        button.onClick(async () => {
          if (this.selected.size === 0) return;
          const selection = new Set(this.selected);
          this.close();
          await this.actions.convert(selection, this.plan);
        });
      });
    renderRows();
  }

  onClose(): void {
    this.modalEl.removeClass("soundings-review-modal");
    this.contentEl.empty();
  }
}

export class ProgressModal extends Modal {
  private progressEl?: HTMLElement;
  private finished = false;

  constructor(app: App, private readonly cancelRun: () => void) {
    super(app);
  }

  onOpen(): void {
    this.contentEl.createEl("h2", { text: "Creating notes" });
    this.progressEl = this.contentEl.createEl("p", { text: "Preparing…", attr: { "aria-live": "polite" } });
    new Setting(this.contentEl).addButton((button) => button
      .setDestructive()
      .setButtonText("Cancel remaining")
      .onClick(() => {
        this.cancelRun();
        button.setDisabled(true);
        this.progressEl?.setText("Canceling after the current safe operation settles…");
      }));
  }

  update(complete: number, total: number): void {
    this.progressEl?.setText(`Processed ${complete} of ${total} selected source${total === 1 ? "" : "s"}.`);
  }

  /** Closes after the run settles, without canceling it. */
  finish(): void {
    this.finished = true;
    this.close();
  }

  onClose(): void {
    // Dismissing the dialog by any means (Escape, close control) cancels the remaining run.
    if (!this.finished) this.cancelRun();
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
