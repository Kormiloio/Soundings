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
});
