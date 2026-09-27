import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = async (path: string) => readFile(join(process.cwd(), path), "utf8");

describe("Obsidian UI and lifecycle contracts", () => {
  it("declares the verified desktop release boundary", async () => {
    const manifest = JSON.parse(await source("manifest.json")) as {
      isDesktopOnly?: boolean;
      minAppVersion?: string;
      version?: string;
    };
    const versions = JSON.parse(await source("versions.json")) as Record<string, string>;
    expect(manifest.isDesktopOnly).toBe(true);
    expect(manifest.minAppVersion).toBe("1.13.7");
    expect(versions[manifest.version ?? ""]).toBe(manifest.minAppVersion);
  });

  it("exposes validation text and ARIA state without color-only errors", async () => {
    const settings = await source("src/obsidian/settings-tab.ts");
    expect(settings).not.toMatch(/createEl\(["']h[12]["']/);
    expect(settings).not.toContain("Soundings settings");
    expect(settings).toContain("Soundings reads transcript files locally");
    expect(settings).toContain("getSettingDefinitions()");
    expect(settings).toContain("getControlValue(key: string)");
    expect(settings).toContain("setControlValue(key: string, value: unknown)");
    expect(settings).not.toContain("display(): void");
    expect(settings.match(/type: "(?:toggle|textarea|number|text)"/g)).toHaveLength(5);
    expect(settings).toContain('this.formatDefinition("txt")');
    expect(settings).toContain('this.formatDefinition("vtt")');
    expect(settings).toContain("validate: (value)");
  });

  it("keeps blocked review items unselectable and closing non-mutating", async () => {
    const review = await source("src/obsidian/review-modal.ts");
    expect(review).toContain('item.classification === "eligible"');
    expect(review).toContain("this.contentEl.empty()");
    expect(review).not.toMatch(/vault\.(?:create|modify|delete|rename)/);
    expect(review).toContain(".setDestructive()");
    expect(review).not.toContain(".setWarning()");
  });

  it("uses labeled native review controls and textual live status for large plans", async () => {
    const review = await source("src/obsidian/review-modal.ts");
    expect(review).toContain('"Search transcript paths"');
    expect(review).toContain('"Filter by classification"');
    expect(review).toContain('"Select all eligible shown"');
    expect(review).toContain('"Clear selection"');
    expect(review).toContain('"Convert selected"');
    expect(review).toContain('event.key !== "Enter"');
    expect(review).toContain("event.preventDefault()");
    expect(review).toContain("event.stopPropagation()");
    expect(review.match(/"aria-live": "polite"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(review).toContain("projection.selectedCount === 0");
    expect(review).not.toMatch(/style\.(?:color|backgroundColor)/);
  });

  it("keeps large review plans scrollable and path text visible in narrow desktop windows", async () => {
    const styles = await source("styles.css");
    expect(styles).toContain("max-height: calc(100vh - 4rem)");
    expect(styles).toContain("flex: 1 1 24rem");
    expect(styles).toContain("overflow-y: auto");
    expect(styles).toContain("overflow-wrap: anywhere");
    expect(styles).toContain("@media (max-width: 640px)");
    expect(styles).toContain("width: min(54rem, calc(100vw - 2rem))");
  });

  it("registers one ribbon control and one command for the guarded scan workflow", async () => {
    const main = await source("src/main.ts");
    expect(main).toContain("createSettingsPolicy(this.app.vault.configDir)");
    expect(main).toContain("if (!this.settingsPolicy)");
    expect(main.indexOf("if (!this.settingsPolicy)")).toBeLessThan(main.indexOf("const adapter = new ObsidianVaultAdapter"));
    expect(main).toContain("activeWindow.crypto.randomUUID()");
    expect(main).toContain("activeWindow.crypto?.subtle");
    expect(main.match(/this\.addRibbonIcon\(/g)).toHaveLength(1);
    expect(main).toContain('this.addRibbonIcon("waves", "Scan vault for transcripts"');
    expect(main.match(/this\.addCommand\(/g)).toHaveLength(1);
    expect(main).toContain('id: "scan-vault-for-transcripts"');
    expect(main.match(/void this\.scanAndReview\(\)/g)).toHaveLength(2);
    expect(main).toContain("if (this.runs.isActive)");
    expect(main).toContain('new Notice("Soundings is already scanning or converting.")');
    expect(main).toContain("onunload(): void");
    expect(main).toContain("this.runs.cancel()");
    expect(main).not.toContain("ribbonIcon.remove()");
  });
});
