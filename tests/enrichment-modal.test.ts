import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SourceNoteEvidence } from "../src/core/enrichment-evidence";
import type { EnrichmentOutcome } from "../src/core/enrichment-execution";
import type { EnrichmentPlan } from "../src/core/enrichment-planning";
import { EnrichmentModal, type EnrichmentModalActions } from "../src/obsidian/enrichment-modal";
import { resetRuntimeControls, runtimeControls, type FakeButtonComponent, type FakeTextComponent } from "./obsidian-runtime-stub";

const sourcePath = "Meetings/Standup.md";
const evidence = (sha256: string): SourceNoteEvidence => ({ path: sourcePath, byteLength: 10, sha256, soundingsVersion: 1 });

function latestButton(text: string): FakeButtonComponent {
  const match = runtimeControls.buttons.filter((entry) => entry.buttonEl.text === text).at(-1);
  if (!match) throw new Error(`Missing button: ${text}`);
  return match;
}

function latestField(label: string): FakeTextComponent {
  const match = runtimeControls.texts.filter((entry) => entry.inputEl.attributes.get("aria-label") === label).at(-1);
  if (!match) throw new Error(`Missing field: ${label}`);
  return match;
}

function outcome(status: EnrichmentOutcome["status"], reason: string): EnrichmentOutcome {
  return { sourcePath, destinationPath: "Meetings/Standup - Enrichment.md", status, reason };
}

async function openWithDraft(actions: Partial<EnrichmentModalActions>) {
  const publish = vi.fn<(plan: EnrichmentPlan) => Promise<EnrichmentOutcome | undefined>>();
  const full: EnrichmentModalActions = {
    sourceEvidence: evidence("old"),
    existingPaths: () => new Set(),
    planId: () => "plan",
    publish,
    reidentify: vi.fn(async () => evidence("new")),
    ...actions
  };
  const modal = new EnrichmentModal({} as never, sourcePath, full);
  modal.open();
  await latestField("Enrichment summary").change("Private summary text");
  await latestField("Enrichment decisions").change("Ship it\nAnnounce it");
  await latestButton("Continue to review").click();
  return { modal, actions: full };
}

describe("enrichment modal draft retention", () => {
  beforeEach(() => resetRuntimeControls());

  it("keeps the draft and refreshes evidence after a stale outcome", async () => {
    const publish = vi.fn(async () => outcome("stale", "Source note changed after preview."));
    const { modal, actions } = await openWithDraft({ publish });
    await latestButton("Publish companion note").click();

    expect(actions.reidentify).toHaveBeenCalledTimes(1);
    expect(modal.contentEl.textContent).toContain("Source note changed after preview. Your draft is kept.");
    expect(modal.contentEl.textContent).not.toContain("Private summary text");
    expect(latestField("Enrichment summary").value).toBe("Private summary text");
    expect(latestField("Enrichment decisions").value).toBe("Ship it\nAnnounce it");

    await latestButton("Continue to review").click();
    const retry = vi.mocked(actions.publish);
    retry.mockResolvedValueOnce(outcome("created", "Companion note created and verified."));
    await latestButton("Publish companion note").click();
    expect(retry.mock.calls[1][0].sourceEvidence.sha256).toBe("new");
    expect(modal.contentEl.children).toHaveLength(0);
  });

  it.each(["blocked", "failed", "canceled", "needs-attention"] as const)("keeps the draft after a %s outcome", async (status) => {
    const { modal, actions } = await openWithDraft({ publish: vi.fn(async () => outcome(status, "Destination already exists.")) });
    await latestButton("Publish companion note").click();
    expect(actions.reidentify).not.toHaveBeenCalled();
    expect(modal.contentEl.textContent).toContain("Not published: Destination already exists. Your draft is kept.");
    expect(latestField("Enrichment summary").value).toBe("Private summary text");
  });

  it("keeps the draft when publication is refused before execution", async () => {
    const { modal } = await openWithDraft({ publish: vi.fn(async () => undefined) });
    await latestButton("Publish companion note").click();
    expect(modal.contentEl.textContent).toContain("Not published. Your draft is kept.");
    expect(latestField("Enrichment decisions").value).toBe("Ship it\nAnnounce it");
  });

  it("blocks review when the source is no longer a Soundings note", async () => {
    const { modal, actions } = await openWithDraft({
      publish: vi.fn(async () => outcome("stale", "Source note changed after preview.")),
      reidentify: vi.fn(async () => undefined)
    });
    await latestButton("Publish companion note").click();
    await latestButton("Continue to review").click();
    expect(modal.contentEl.textContent).toContain("no longer a supported Soundings note");
    expect(actions.publish).toHaveBeenCalledTimes(1);
  });

  it("closes only after a created outcome and cancel never publishes", async () => {
    const created = await openWithDraft({ publish: vi.fn(async () => outcome("created", "Companion note created and verified.")) });
    await latestButton("Publish companion note").click();
    expect(created.modal.contentEl.children).toHaveLength(0);

    resetRuntimeControls();
    const canceled = await openWithDraft({});
    await latestButton("Cancel").click();
    expect(canceled.actions.publish).not.toHaveBeenCalled();
    expect(canceled.modal.contentEl.children).toHaveLength(0);
  });
});
