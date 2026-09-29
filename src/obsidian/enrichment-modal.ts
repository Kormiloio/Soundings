import { App, Modal, Setting } from "obsidian";
import { validateEnrichmentDraft } from "../core/enrichment-draft";
import type { SourceNoteEvidence } from "../core/enrichment-evidence";
import { buildEnrichmentPlan, type EnrichmentPlan } from "../core/enrichment-planning";

export interface EnrichmentModalActions {
  readonly sourceEvidence: SourceNoteEvidence;
  readonly existingPaths: ReadonlySet<string>;
  readonly planId: () => string;
  readonly publish: (plan: EnrichmentPlan) => Promise<void>;
}

type Step = "entry" | "preview";

function linesFromInput(value: string): readonly string[] {
  return Object.freeze(value.split("\n").map((line) => line.trim()).filter((line) => line.length > 0));
}

export class EnrichmentModal extends Modal {
  private step: Step = "entry";
  private plan?: EnrichmentPlan;
  private summary = "";
  private decisions = "";
  private actionItems = "";
  private followUps = "";
  private validationEl?: HTMLElement;

  constructor(
    app: App,
    private readonly sourcePath: string,
    private readonly actions: EnrichmentModalActions
  ) {
    super(app);
  }

  onOpen(): void {
    this.modalEl.addClass("soundings-enrichment-modal");
    this.contentEl.addClass("soundings-enrichment");
    this.render();
  }

  onClose(): void {
    this.modalEl.removeClass("soundings-enrichment-modal");
    this.contentEl.empty();
  }

  private render(): void {
    this.contentEl.empty();
    this.validationEl = undefined;
    if (this.step === "entry") this.renderEntry();
    else this.renderPreview();
  }

  private renderEntry(): void {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Add manual enrichment" });
    contentEl.createEl("p", { text: `Source note: ${this.sourcePath}`, cls: "soundings-enrichment__source" });
    this.validationEl = contentEl.createEl("p", {
      cls: "soundings-enrichment__reason",
      attr: { "aria-live": "polite" }
    });

    const addField = (name: string, desc: string, label: string, value: string, onChange: (v: string) => void) => {
      new Setting(contentEl)
        .setName(name)
        .setDesc(desc)
        .addTextArea((area) => {
          area.inputEl.setAttr("aria-label", label);
          area.setValue(value).onChange(onChange);
        });
    };

    addField("Summary", "Optional short summary.", "Enrichment summary", this.summary, (v) => { this.summary = v; });
    addField("Decisions", "One decision per line.", "Enrichment decisions", this.decisions, (v) => { this.decisions = v; });
    addField("Action items", "One action item per line.", "Enrichment action items", this.actionItems, (v) => { this.actionItems = v; });
    addField("Follow-ups", "One follow-up per line.", "Enrichment follow-ups", this.followUps, (v) => { this.followUps = v; });

    new Setting(contentEl)
      .setClass("soundings-enrichment__footer")
      .addButton((button) => button.setButtonText("Cancel").onClick(() => this.close()))
      .addButton((button) => button.setCta().setButtonText("Continue to review").onClick(() => this.continueToPreview()));
  }

  private continueToPreview(): void {
    const validation = validateEnrichmentDraft({
      summary: this.summary,
      decisions: [...linesFromInput(this.decisions)],
      actionItems: [...linesFromInput(this.actionItems)],
      followUps: [...linesFromInput(this.followUps)]
    });
    if (validation.errors.length > 0) {
      this.validationEl?.setText(validation.errors.join(" "));
      return;
    }
    if (!validation.draft) return;

    const plan = buildEnrichmentPlan(
      this.sourcePath,
      this.actions.sourceEvidence,
      validation.draft,
      this.actions.existingPaths,
      new Date(),
      this.actions.planId()
    );

    if (plan.status === "empty") {
      this.validationEl?.setText(plan.reason);
      return;
    }

    this.plan = plan;
    this.step = "preview";
    this.render();
  }

  private renderPreview(): void {
    const plan = this.plan;
    if (!plan) {
      this.step = "entry";
      this.render();
      return;
    }

    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Review enrichment" });
    contentEl.createEl("p", {
      text: plan.status === "ready" ? "Ready to publish." : plan.reason,
      cls: plan.status === "ready" ? "soundings-enrichment__status" : "soundings-enrichment__reason",
      attr: { "aria-live": "polite" }
    });

    const metadataEl = contentEl.createDiv({ cls: "soundings-enrichment__metadata" });
    new Setting(metadataEl).setName("Source note").setDesc(this.sourcePath);
    new Setting(metadataEl).setName("Companion destination").setDesc(plan.destinationPath || "Unavailable");
    new Setting(metadataEl).setName("Source link in note").setDesc(`[[${this.basename()}|Back to Transcript Note]]`);

    contentEl.createEl("h3", { text: "Rendered companion note" });
    const preview = contentEl.createEl("pre", { cls: "soundings-enrichment__preview" });
    preview.setText(plan.renderedMarkdown);

    const canPublish = plan.status === "ready";
    new Setting(contentEl)
      .setClass("soundings-enrichment__footer")
      .addButton((button) => button.setButtonText("Back to edit").onClick(() => {
        this.step = "entry";
        this.render();
      }))
      .addButton((button) => button.setButtonText("Cancel").onClick(() => this.close()))
      .addButton((button) => {
        button.setCta().setButtonText("Publish companion note");
        button.setDisabled(!canPublish);
        button.onClick(async () => {
          if (!canPublish || !this.plan) return;
          const confirmed = this.plan;
          this.close();
          await this.actions.publish(confirmed);
        });
      });
  }

  private basename(): string {
    const slash = this.sourcePath.lastIndexOf("/");
    const name = slash >= 0 ? this.sourcePath.slice(slash + 1) : this.sourcePath;
    const dot = name.lastIndexOf(".");
    return dot > 0 ? name.slice(0, dot) : name;
  }
}
