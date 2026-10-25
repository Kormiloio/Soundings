import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewModal } from "../src/obsidian/review-modal";
import type { ConversionPlan, PlanClassification, PlanItem } from "../src/core/types";
import { DEFAULT_OUTPUT_PROFILE } from "../src/core/settings";
import {
  resetRuntimeControls,
  runtimeControls,
  type FakeButtonComponent,
  type FakeElement,
  type FakeToggleComponent
} from "./obsidian-runtime-stub";

function item(sourcePath: string, classification: PlanClassification, destinationPath?: string): PlanItem {
  return { sourcePath, destinationPath, classification, reason: classification,
    format: sourcePath.endsWith(".txt") ? "txt" : "vtt" };
}

function plan(): ConversionPlan {
  return {
    id: "modal",
    createdAt: new Date(0).toISOString(),
    settingsFingerprint: "settings",
    outputProfile: DEFAULT_OUTPUT_PROFILE,
    outputProfileFingerprint: "profile",
    outputProfileSummary: "Title: Source name; destination: Source name.md; sections: Summary; tags: none; Caption timestamps: omit.",
    items: [
      item("Meetings/Alpha.txt", "eligible", "Meetings/Alpha.md"),
      item("Meetings/Nested/Beta.vtt", "eligible", "Meetings/Nested/Beta.md"),
      item("Archive/Old.txt", "excluded", "Archive/Old.md"),
      item("Meetings/Collision.txt", "destination-exists", "Meetings/Collision.md")
    ]
  };
}

function button(text: string): FakeButtonComponent {
  const match = runtimeControls.buttons.find((entry) => entry.buttonEl.text === text);
  if (!match) throw new Error(`Missing button: ${text}`);
  return match;
}

function latestToggle(label: string): FakeToggleComponent {
  const matches = runtimeControls.toggles.filter((entry) => entry.toggleEl.attributes.get("aria-label") === label);
  const match = matches.at(-1);
  if (!match) throw new Error(`Missing toggle: ${label}`);
  return match;
}

describe("review modal", () => {
  beforeEach(() => resetRuntimeControls());

  it("revises kind without replacing the focused control and passes the displayed plan", async () => {
    const convert = vi.fn<(selected: ReadonlySet<string>, reviewed?: ConversionPlan) => Promise<void>>().mockResolvedValue();
    const modal = new ReviewModal({} as never, plan(), { refresh: vi.fn(), convert });
    modal.open();
    const typeMenus = () => runtimeControls.dropdowns.filter((entry) => entry.selectEl.attributes.get("aria-label")?.startsWith("Content type"));
    expect(typeMenus()).toHaveLength(1);
    const menu = typeMenus()[0];
    expect([...menu.options.values()]).toEqual(["Transcript", "Notes", "Meeting Minutes", "Correspondence", "Chat"]);
    await button("Select all eligible shown").click();
    const currentMenu = typeMenus().at(-1)!;
    const count = runtimeControls.dropdowns.length;
    await currentMenu.change("notes");
    expect(runtimeControls.dropdowns).toHaveLength(count);
    expect(latestToggle("Select Meetings/Alpha.txt for conversion").value).toBe(false);
    expect(modal.contentEl.textContent).toContain("1 selected");
    expect(modal.contentEl.textContent).toContain("literal plain text");
    await runtimeControls.texts[0].change("beta");
    await runtimeControls.texts[0].change("alpha");
    expect(typeMenus().at(-1)!.value).toBe("notes");
    await latestToggle("Select Meetings/Alpha.txt for conversion").change(true);
    await button("Convert selected").click();
    expect(convert.mock.calls[0][1]?.items[0].contentKind).toBe("notes");
    expect(convert.mock.calls[0][1]?.revision).toBe(1);
    modal.open();
    expect(typeMenus().at(-1)!.value).toBe("transcript");
    expect(modal.contentEl.textContent).toContain("0 selected");
  });

  it("exposes accessible counts, search, filters, and disabled conversion by default", () => {
    const modal = new ReviewModal({} as never, plan(), { refresh: vi.fn(), convert: vi.fn() });
    modal.open();

    expect((modal.modalEl as unknown as FakeElement).classes.has("soundings-review-modal")).toBe(true);
    expect(modal.contentEl.textContent).toContain("4 source candidates");
    expect(modal.contentEl.textContent).toContain("eligible: 2");
    expect(modal.contentEl.textContent).toContain("excluded: 1");
    expect(modal.contentEl.textContent).toContain("destination-exists: 1");
    expect(modal.contentEl.textContent).toContain("0 selected");
    expect(modal.contentEl.textContent).toContain("Title: Source name");
    expect(modal.contentEl.textContent).toContain("TXT layout: Plain text");
    expect(runtimeControls.texts[0].inputEl.attributes.get("aria-label")).toBe("Search source paths");
    expect(runtimeControls.dropdowns[0].selectEl.attributes.get("aria-label")).toBe("Filter by classification");
    expect(button("Convert selected").buttonEl.disabled).toBe(true);

    const enterEvent = { key: "Enter", preventDefault: vi.fn(), stopPropagation: vi.fn() };
    runtimeControls.texts[0].inputEl.dispatchKeydown(enterEvent);
    expect(enterEvent.preventDefault).toHaveBeenCalledOnce();
    expect(enterEvent.stopPropagation).toHaveBeenCalledOnce();

    modal.close();
    expect((modal.modalEl as unknown as FakeElement).classes.has("soundings-review-modal")).toBe(false);
  });

  it("shows opted-in TXT layout and actual fallback without automatically converting", () => {
    const convert = vi.fn();
    const candidate = { ...plan(), txtLayout: "timestamped-speaker" as const,
      items: [{ ...item("one.txt", "eligible", "one.md"), reason: "TXT interpretation: plain text (layout not recognized; entire source preserved)." }] };
    const modal = new ReviewModal({} as never, candidate, { refresh: vi.fn(), convert });
    modal.open();
    expect(modal.contentEl.textContent).toContain("TXT layout: Timestamped speaker");
    expect(modal.contentEl.textContent).toContain("entire source preserved");
    expect(button("Convert selected").buttonEl.disabled).toBe(true);
    expect(convert).not.toHaveBeenCalled();
  });

  it("preserves hidden selection and converts exactly selected current-plan paths", async () => {
    const convert = vi.fn<(selection: ReadonlySet<string>) => Promise<void>>().mockResolvedValue();
    const modal = new ReviewModal({} as never, plan(), { refresh: vi.fn(), convert });
    modal.open();

    await runtimeControls.texts[0].change("nested/beta");
    await button("Select all eligible shown").click();
    expect(modal.contentEl.textContent).toContain("1 selected");
    expect(latestToggle("Select Meetings/Nested/Beta.vtt for conversion").value).toBe(true);

    await runtimeControls.texts[0].change("alpha");
    expect(modal.contentEl.textContent).toContain("1 selected");
    expect(latestToggle("Select Meetings/Alpha.txt for conversion").value).toBe(false);
    await latestToggle("Select Meetings/Alpha.txt for conversion").change(true);
    expect(modal.contentEl.textContent).toContain("2 selected");

    await button("Convert selected").click();
    expect(convert).toHaveBeenCalledTimes(1);
    expect([...convert.mock.calls[0][0]].sort()).toEqual([
      "Meetings/Alpha.txt",
      "Meetings/Nested/Beta.vtt"
    ]);
  });

  it("filters non-eligible rows, clears hidden selection, and resets when reopened", async () => {
    const modal = new ReviewModal({} as never, plan(), { refresh: vi.fn(), convert: vi.fn() });
    modal.open();
    await button("Select all eligible shown").click();
    expect(modal.contentEl.textContent).toContain("2 selected");

    await runtimeControls.dropdowns[0].change("destination-exists");
    expect(modal.contentEl.textContent).toContain("Meetings/Collision.txt");
    expect(button("Select all eligible shown").buttonEl.disabled).toBe(true);
    await button("Clear selection").click();
    expect(modal.contentEl.textContent).toContain("0 selected");

    modal.open();
    expect(modal.contentEl.textContent).toContain("0 selected");
    expect(button("Convert selected").buttonEl.disabled).toBe(true);
  });
});
