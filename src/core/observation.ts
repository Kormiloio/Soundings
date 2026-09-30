import type { DigestFunction } from "./hash";
import { discoverTranscriptFile, isObservableCandidatePath, type DiscoveryAdapter, type DiscoveryItem } from "./discovery";
import type { SoundingsSettings } from "./settings";
import { buildPlan } from "./planning";
import type { ConversionPlan, SourceEvidence, TranscriptFormat } from "./types";

export interface InboxEntry {
  readonly path: string;
  readonly format: TranscriptFormat;
  readonly size: number;
  readonly contentIdentity: string;
}

export class TranscriptInbox {
  private readonly byPath = new Map<string, InboxEntry>();

  get size(): number { return this.byPath.size; }

  entries(): readonly InboxEntry[] {
    return Object.freeze([...this.byPath.values()]);
  }

  upsert(evidence: SourceEvidence): "added" | "updated" | "unchanged" {
    const previous = this.byPath.get(evidence.path);
    if (previous?.contentIdentity === evidence.sha256 && previous.size === evidence.byteLength && previous.format === evidence.format) {
      return "unchanged";
    }
    const entry = Object.freeze({
      path: evidence.path,
      format: evidence.format,
      size: evidence.byteLength,
      contentIdentity: evidence.sha256
    });
    this.byPath.set(evidence.path, entry);
    return previous ? "updated" : "added";
  }

  remove(path: string): boolean { return this.byPath.delete(path); }
  clear(): void { this.byPath.clear(); }
}

export interface StabilityOptions {
  readonly attempts?: number;
  readonly wait?: (signal: AbortSignal) => Promise<void>;
}

export interface ObservationProcessorOptions {
  readonly adapter: DiscoveryAdapter;
  readonly settings: () => SoundingsSettings;
  readonly digest: DigestFunction;
  readonly canProcess: () => boolean;
  readonly wait: (signal: AbortSignal) => Promise<void>;
  readonly onChanged: (inbox: TranscriptInbox) => void;
  readonly attempts?: number;
}

export class ObservationProcessor {
  readonly inbox = new TranscriptInbox();
  private controller = new AbortController();
  private readonly pending = new Map<string, symbol>();
  private tail = Promise.resolve();

  constructor(private readonly options: ObservationProcessorOptions) {}

  get pendingCount(): number { return this.pending.size; }

  async handleCreated(path: string): Promise<void> {
    if (this.controller.signal.aborted || this.pending.has(path) || !this.options.canProcess()) return;
    const settings = this.options.settings();
    if (!settings.observationEnabled || !isObservableCandidatePath(path, settings)) return;
    const token = Symbol(path);
    const signal = this.controller.signal;
    this.pending.set(path, token);
    const work = async (): Promise<void> => {
      if (signal.aborted || !this.options.canProcess()) return;
      const item = await discoverStableTranscript(
        this.options.adapter,
        path,
        settings,
        signal,
        this.options.digest,
        { attempts: this.options.attempts, wait: this.options.wait }
      );
      if (!item?.evidence || signal.aborted) return;
      if (this.inbox.upsert(item.evidence) !== "unchanged") this.options.onChanged(this.inbox);
    };
    const task = this.tail.then(work);
    this.tail = task.catch(() => undefined);
    try {
      await task;
    } finally {
      if (this.pending.get(path) === token) this.pending.delete(path);
    }
  }

  stop(clearInbox: boolean): void {
    this.controller.abort();
    this.controller = new AbortController();
    this.pending.clear();
    this.tail = Promise.resolve();
    if (clearInbox) this.inbox.clear();
  }
}

export async function planTranscriptInbox(
  inbox: TranscriptInbox,
  adapter: DiscoveryAdapter,
  settings: SoundingsSettings,
  digest: DigestFunction,
  now: Date,
  createId: () => string,
  signal?: AbortSignal
): Promise<ConversionPlan | undefined> {
  const items: DiscoveryItem[] = [];
  for (const entry of inbox.entries()) {
    if (signal?.aborted) return undefined;
    const file = adapter.fileForPath(entry.path);
    if (!file) { inbox.remove(entry.path); continue; }
    const item = await discoverTranscriptFile(adapter, file, settings, digest);
    if (item?.classification !== "eligible" || !item.evidence) {
      inbox.remove(entry.path);
      continue;
    }
    inbox.upsert(item.evidence);
    items.push(item);
  }
  if (items.length === 0 || signal?.aborted) return undefined;
  return buildPlan(items, new Set(adapter.listFiles().map((file) => file.path)), settings, now, createId);
}

function sameEvidence(left: SourceEvidence | undefined, right: SourceEvidence | undefined): boolean {
  return left !== undefined && right !== undefined
    && left.path === right.path
    && left.format === right.format
    && left.byteLength === right.byteLength
    && left.sha256 === right.sha256;
}

const PERMANENT_CLASSIFICATIONS: ReadonlySet<DiscoveryItem["classification"]> = new Set(["excluded", "oversize"]);

export async function discoverStableTranscript(
  adapter: DiscoveryAdapter,
  path: string,
  settings: SoundingsSettings,
  signal: AbortSignal,
  digest: DigestFunction,
  options: StabilityOptions = {}
): Promise<DiscoveryItem | undefined> {
  if (!isObservableCandidatePath(path, settings)) return undefined;
  const attempts = options.attempts ?? 4;
  const wait = options.wait ?? (async () => Promise.resolve());
  let previousEvidence: SourceEvidence | undefined;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (signal.aborted) return undefined;
    const file = adapter.fileForPath(path);
    if (!file) return undefined;
    const item = await discoverTranscriptFile(adapter, file, settings, digest);
    if (signal.aborted) return undefined;
    // Waiting cannot turn these into eligible transcripts: size only grows while a file is written.
    if (!item || PERMANENT_CLASSIFICATIONS.has(item.classification)) return undefined;
    if (item.classification === "eligible" && sameEvidence(previousEvidence, item.evidence)) return item;
    previousEvidence = item.classification === "eligible" ? item.evidence : undefined;
    if (attempt + 1 < attempts) await wait(signal);
  }
  return undefined;
}
