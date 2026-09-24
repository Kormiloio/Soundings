import { TFile, Vault } from "obsidian";
import type { DiscoveryAdapter } from "../core/discovery";
import type { PublicationAdapter } from "../core/execution";
import type { VaultFileRef } from "../core/types";

export class ObsidianVaultAdapter implements DiscoveryAdapter, PublicationAdapter {
  constructor(private readonly vault: Vault) {}

  listFiles(): readonly VaultFileRef[] {
    return this.vault.getFiles().map((file) => ({
      path: file.path,
      extension: file.extension,
      size: file.stat.size,
      isFile: true
    }));
  }

  async readBinary(path: string): Promise<Uint8Array> {
    const file = this.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) throw new Error("vault-file-missing");
    return new Uint8Array(await this.vault.readBinary(file));
  }

  exists(path: string): boolean {
    return this.vault.getAbstractFileByPath(path) !== null;
  }

  async createBinary(path: string, bytes: Uint8Array): Promise<void> {
    const owned = new Uint8Array(bytes);
    await this.vault.createBinary(path, owned.buffer);
  }

  async yieldControl(): Promise<void> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }
}
