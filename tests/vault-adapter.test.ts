import type { Vault } from "obsidian";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ObsidianVaultAdapter } from "../src/obsidian/vault-adapter";

describe("Obsidian vault adapter", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("yields through the global window timer", async () => {
    const setTimeout = vi.fn((callback: () => void, delay: number) => {
      expect(delay).toBe(0);
      callback();
      return 1;
    });
    vi.stubGlobal("window", { setTimeout });
    const adapter = new ObsidianVaultAdapter({} as Vault);
    await adapter.yieldControl();
    expect(setTimeout).toHaveBeenCalledOnce();
  });

  it("checks storage existence with the platform's default case handling", async () => {
    const exists = vi.fn(async (_path: string, _sensitive?: boolean) => true);
    const adapter = new ObsidianVaultAdapter({ adapter: { exists } } as unknown as Vault);
    await expect(adapter.existsOnDisk("a/bar.md")).resolves.toBe(true);
    expect(exists).toHaveBeenCalledWith("a/bar.md");
  });
});
