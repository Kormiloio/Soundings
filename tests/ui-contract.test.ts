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
    expect(settings).toContain('role: "alert"');
    expect(settings).toContain('"aria-live": "polite"');
    expect(settings).toContain('"aria-invalid"');
    expect(settings).toContain('"aria-label"');
  });

  it("keeps blocked review items unselectable and closing non-mutating", async () => {
    const review = await source("src/obsidian/review-modal.ts");
    expect(review).toContain('item.classification === "eligible"');
    expect(review).toContain("this.contentEl.empty()");
    expect(review).not.toMatch(/vault\.(?:create|modify|delete|rename)/);
  });

  it("registers one ribbon control and one command for the guarded scan workflow", async () => {
    const main = await source("src/main.ts");
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
