import { sha256 } from "./hash";
import type { SoundingsSettings } from "./settings";
import type { PlanClassification, SourceEvidence, TranscriptFormat, VaultFileRef } from "./types";

export interface DiscoveryAdapter {
  listFiles(): readonly VaultFileRef[];
  readBinary(path: string): Promise<Uint8Array>;
  yieldControl?(): Promise<void>;
}

export interface DiscoveryItem {
  readonly sourcePath: string;
  readonly format?: TranscriptFormat;
  readonly classification: PlanClassification;
  readonly reason: string;
  readonly evidence?: SourceEvidence;
}

export interface DiscoveryResult {
  readonly items: readonly DiscoveryItem[];
  readonly canceled: boolean;
}

export function formatForPath(path: string): TranscriptFormat | undefined {
  const dot = path.lastIndexOf(".");
  if (dot < 0) return undefined;
  const extension = path.slice(dot + 1).toLowerCase();
  return extension === "txt" || extension === "vtt" ? extension : undefined;
}

export function isHiddenPath(path: string): boolean {
  return path.split("/").some((segment) => segment.startsWith("."));
}

export function isAtOrBelow(path: string, folder: string): boolean {
  return path === folder || path.startsWith(`${folder}/`);
}

function excluded(path: string, settings: SoundingsSettings): boolean {
  return isHiddenPath(path) || settings.excludedPaths.some((folder) => isAtOrBelow(path, folder));
}

export async function discoverTranscripts(
  adapter: DiscoveryAdapter,
  settings: SoundingsSettings,
  signal?: AbortSignal,
  batchSize = 50,
  hasher: (bytes: Uint8Array) => Promise<string> = sha256
): Promise<DiscoveryResult> {
  const items: DiscoveryItem[] = [];
  let processed = 0;

  for (const file of adapter.listFiles()) {
    if (signal?.aborted) return { items: Object.freeze(items), canceled: true };
    if (!file.isFile) continue;
    const format = formatForPath(file.path);
    if (!format || !settings.enabledFormats.includes(format)) continue;

    if (excluded(file.path, settings)) {
      items.push({ sourcePath: file.path, format, classification: "excluded", reason: "Path is excluded." });
      continue;
    }
    if (file.size > settings.maxSourceBytes) {
      items.push({ sourcePath: file.path, format, classification: "oversize", reason: "Source exceeds the configured size limit." });
      continue;
    }

    try {
      const bytes = await adapter.readBinary(file.path);
      if (bytes.byteLength > settings.maxSourceBytes) {
        items.push({ sourcePath: file.path, format, classification: "oversize", reason: "Source exceeds the configured size limit." });
      } else if (bytes.byteLength === 0) {
        items.push({ sourcePath: file.path, format, classification: "empty", reason: "Source is empty." });
      } else {
        const digest = await hasher(bytes);
        items.push({
          sourcePath: file.path,
          format,
          classification: "eligible",
          reason: "Ready for review.",
          evidence: Object.freeze({ path: file.path, format, byteLength: bytes.byteLength, sha256: digest })
        });
      }
    } catch {
      items.push({ sourcePath: file.path, format, classification: "unreadable", reason: "Source could not be read or hashed." });
    }

    processed += 1;
    if (processed % batchSize === 0) await (adapter.yieldControl?.() ?? Promise.resolve());
  }
  return { items: Object.freeze(items), canceled: false };
}
