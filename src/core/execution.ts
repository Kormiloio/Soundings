import { equalBytes, sha256, type DigestFunction } from "./hash";
import { parseTranscript } from "./parsers";
import { isPlanCurrent } from "./planning";
import { renderMarkdown } from "./rendering";
import type { SoundingsSettings } from "./settings";
import type { ConversionPlan, ExecutionOutcome, PlanItem } from "./types";

export interface PublicationAdapter {
  readBinary(path: string): Promise<Uint8Array>;
  exists(path: string): boolean;
  createBinary(path: string, bytes: Uint8Array): Promise<void>;
}

export interface ExecuteOptions {
  readonly selectedSourcePaths: ReadonlySet<string>;
  readonly settings: SoundingsSettings;
  readonly signal?: AbortSignal;
  readonly now?: () => Date;
  readonly digest?: DigestFunction;
  readonly onProgress?: (complete: number, total: number) => void;
}

function outcome(item: PlanItem, status: ExecutionOutcome["status"], reason: string): ExecutionOutcome {
  return Object.freeze({ sourcePath: item.sourcePath, destinationPath: item.destinationPath ?? "", status, reason });
}

async function executeItem(
  item: PlanItem,
  adapter: PublicationAdapter,
  options: ExecuteOptions
): Promise<ExecutionOutcome> {
  if (item.classification !== "eligible" || !item.destinationPath || !item.evidence || !item.format || !item.title) {
    return outcome(item, "blocked", item.reason);
  }
  if (options.signal?.aborted) return outcome(item, "canceled", "Conversion was canceled.");

  let source: Uint8Array;
  try {
    source = await adapter.readBinary(item.sourcePath);
  } catch {
    return outcome(item, "stale", "Source is missing or unreadable.");
  }
  if (source.byteLength > options.settings.maxSourceBytes) return outcome(item, "stale", "Source now exceeds the size limit.");

  let currentHash: string;
  try {
    if (!options.digest) throw new Error("secure-hash-unavailable");
    currentHash = await sha256(source, options.digest);
  } catch {
    return outcome(item, "failed", "Secure source hashing is unavailable.");
  }
  if (source.byteLength !== item.evidence.byteLength || currentHash !== item.evidence.sha256) {
    return outcome(item, "stale", "Source changed after preview.");
  }
  if (adapter.exists(item.destinationPath)) return outcome(item, "blocked", "Destination already exists.");

  const parsed = parseTranscript(item.format, source);
  if (!parsed.ok || !parsed.value) return outcome(item, "failed", `Transcript parsing failed: ${parsed.error ?? "unknown"}.`);
  const rendered = renderMarkdown(parsed.value, {
    sourceFile: item.sourcePath.slice(item.sourcePath.lastIndexOf("/") + 1),
    sourceFormat: item.format,
    title: item.title,
    convertedAt: (options.now ?? (() => new Date()))().toISOString(),
    ...(item.project ? { project: item.project } : {})
  });
  const bytes = new TextEncoder().encode(rendered);
  if (options.signal?.aborted) return outcome(item, "canceled", "Conversion was canceled.");

  try {
    await adapter.createBinary(item.destinationPath, bytes);
  } catch {
    return adapter.exists(item.destinationPath)
      ? outcome(item, "blocked", "Destination appeared during publication.")
      : outcome(item, "failed", "Destination could not be created.");
  }

  try {
    const finalBytes = await adapter.readBinary(item.destinationPath);
    if (!equalBytes(finalBytes, bytes)) return outcome(item, "needs-attention", "Created destination did not match the rendered bytes.");
  } catch {
    return outcome(item, "needs-attention", "Created destination could not be verified.");
  }
  return outcome(item, "created", "Markdown note created and verified.");
}

export async function executePlan(
  plan: ConversionPlan,
  adapter: PublicationAdapter,
  options: ExecuteOptions
): Promise<readonly ExecutionOutcome[]> {
  const outcomes: ExecutionOutcome[] = [];
  const selected = plan.items.filter((item) => options.selectedSourcePaths.has(item.sourcePath));

  if (!isPlanCurrent(plan, options.settings)) {
    return Object.freeze(selected.map((item) => outcome(item, "stale", "Settings changed after preview.")));
  }

  for (const item of plan.items) {
    if (!options.selectedSourcePaths.has(item.sourcePath)) {
      outcomes.push(outcome(item, "skipped", "Item was not selected."));
      continue;
    }
    if (options.signal?.aborted) {
      outcomes.push(outcome(item, "canceled", "Conversion was canceled."));
      continue;
    }
    outcomes.push(await executeItem(item, adapter, options));
    options.onProgress?.(outcomes.filter((entry) => entry.status !== "skipped").length, selected.length);
  }
  return Object.freeze(outcomes);
}

export class RunCoordinator {
  private active?: AbortController;

  get isActive(): boolean {
    return this.active !== undefined;
  }

  begin(): AbortSignal {
    if (this.active) throw new Error("soundings-run-active");
    this.active = new AbortController();
    return this.active.signal;
  }

  cancel(): void {
    this.active?.abort();
  }

  finish(signal: AbortSignal): void {
    if (this.active?.signal === signal) this.active = undefined;
  }
}
