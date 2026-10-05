import type { DigestFunction } from "./hash";
import { sha256 } from "./hash";
import { parseTranscript } from "./parsers";
import type { SoundingsSettings } from "./settings";
import type { PlanClassification, SourceEvidence, TranscriptFormat, VaultFileRef } from "./types";

export interface DiscoveryAdapter {
  listFiles(): readonly VaultFileRef[];
  fileForPath(path: string): VaultFileRef | undefined;
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
  return extension === "txt" || extension === "vtt" || extension === "srt" ? extension : undefined;
}

export function isHiddenPath(path: string): boolean {
  return path.split("/").some((segment) => segment.startsWith("."));
}

export function isAtOrBelow(path: string, folder: string): boolean {
  return path === folder || path.startsWith(`${folder}/`);
}

export function isExcludedPath(path: string, settings: SoundingsSettings): boolean {
  return isHiddenPath(path) || settings.excludedPaths.some((folder) => isAtOrBelow(path, folder));
}

export function isWithinObservationRoots(path: string, roots: readonly string[]): boolean {
  return roots.length === 0 || roots.some((root) => isAtOrBelow(path, root));
}

/**
 * Path-only observation policy: enabled supported format, not excluded, within the observation roots.
 * It never reads the vault, so creation events for other files cost nothing and are never pending work.
 */
export function isObservableCandidatePath(path: string, settings: SoundingsSettings): boolean {
  const format = formatForPath(path);
  return format !== undefined
    && settings.enabledFormats.includes(format)
    && !isExcludedPath(path, settings)
    && isWithinObservationRoots(path, settings.observationRoots);
}

export async function discoverTranscriptFile(
  adapter: Pick<DiscoveryAdapter, "readBinary">,
  file: VaultFileRef,
  settings: SoundingsSettings,
  digest?: DigestFunction
): Promise<DiscoveryItem | undefined> {
  if (!file.isFile) return undefined;
  const format = formatForPath(file.path);
  if (!format || !settings.enabledFormats.includes(format)) return undefined;

  if (isExcludedPath(file.path, settings)) {
    return { sourcePath: file.path, format, classification: "excluded", reason: "Path is excluded." };
  }
  if (file.size > settings.maxSourceBytes) {
    return { sourcePath: file.path, format, classification: "oversize", reason: "Source exceeds the configured size limit." };
  }

  try {
    const bytes = await adapter.readBinary(file.path);
    if (bytes.byteLength > settings.maxSourceBytes) {
      return { sourcePath: file.path, format, classification: "oversize", reason: "Source exceeds the configured size limit." };
    }
    if (bytes.byteLength === 0) {
      return { sourcePath: file.path, format, classification: "empty", reason: "Source is empty." };
    }

    const parsed = parseTranscript(format, bytes);
    if (!parsed.ok || !parsed.value) {
      const error = parsed.error;
      if (error === "empty") return { sourcePath: file.path, format, classification: "empty", reason: "Source is empty." };
      if (error === "malformed-vtt") return { sourcePath: file.path, format, classification: "unreadable", reason: "VTT structure is malformed." };
      if (error === "malformed-srt") return { sourcePath: file.path, format, classification: "unreadable", reason: "SRT structure is malformed or outside the supported numbered-cue subset." };
      if (error === "unsupported-vtt") return { sourcePath: file.path, format, classification: "unsupported", reason: "VTT format is not supported." };
      return { sourcePath: file.path, format, classification: "unreadable", reason: `Parsing failed: ${error}.` };
    }

    if (!digest) throw new Error("secure-hash-unavailable");
    const sourceHash = await sha256(bytes, digest);
    return {
      sourcePath: file.path,
      format,
      classification: "eligible",
      reason: "Ready for review.",
      evidence: Object.freeze({ path: file.path, format, byteLength: bytes.byteLength, sha256: sourceHash })
    };
  } catch {
    return { sourcePath: file.path, format, classification: "unreadable", reason: "Source could not be read or hashed." };
  }
}

export async function discoverTranscripts(
  adapter: DiscoveryAdapter,
  settings: SoundingsSettings,
  signal?: AbortSignal,
  batchSize = 50,
  digest?: DigestFunction
): Promise<DiscoveryResult> {
  const items: DiscoveryItem[] = [];
  let processed = 0;

  for (const file of adapter.listFiles()) {
    if (signal?.aborted) return { items: Object.freeze(items), canceled: true };
    const item = await discoverTranscriptFile(adapter, file, settings, digest);
    if (item) items.push(item);

    processed += 1;
    if (processed % batchSize === 0) await (adapter.yieldControl?.() ?? Promise.resolve());
  }
  return { items: Object.freeze(items), canceled: false };
}
