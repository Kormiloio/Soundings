import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { discoverTranscripts, type DiscoveryAdapter } from "../src/core/discovery";
import { executePlan, type PublicationAdapter } from "../src/core/execution";
import { buildPlan } from "../src/core/planning";
import { clearReviewSelection, projectReviewPlan, selectAllVisibleEligible } from "../src/core/review-state";
import { DEFAULT_SETTINGS, type SoundingsSettings } from "../src/core/settings";
import type { VaultFileRef } from "../src/core/types";
import { testDigest } from "./test-crypto";

const encoder = new TextEncoder();

class DisposableVaultAdapter implements DiscoveryAdapter, PublicationAdapter {
  readonly paths = new Set<string>();
  yieldHook?: () => void;

  constructor(private readonly root: string, initial: readonly string[]) {
    initial.forEach((path) => this.paths.add(path));
  }

  listFiles(): readonly VaultFileRef[] {
    return [...this.paths].map((path) => ({ path, extension: path.split(".").pop() ?? "", size: path === "Oversize/large.srt" ? 5_000_001 : path.endsWith(".txt") ? 13 : 1, isFile: true }));
  }

  fileForPath(path: string): VaultFileRef | undefined {
    return this.listFiles().find((file) => file.path === path);
  }

  async readBinary(path: string): Promise<Uint8Array> {
    return readFile(this.absolute(path));
  }

  exists(path: string): boolean { return this.paths.has(path); }

  async existsOnDisk(path: string): Promise<boolean> { return this.paths.has(path); }

  async createBinary(path: string, bytes: Uint8Array): Promise<void> {
    const absolute = this.absolute(path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, bytes, { flag: "wx" });
    this.paths.add(path);
  }

  async yieldControl(): Promise<void> { this.yieldHook?.(); }

  private absolute(path: string): string { return join(this.root, ...path.split("/")); }
}

function digest(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

describe("5,000-file disposable desktop rehearsal", () => {
  let root = "";
  let adapter: DisposableVaultAdapter;
  const settings: SoundingsSettings = { ...DEFAULT_SETTINGS, enabledFormats: ["txt", "vtt", "srt"] };
  const transcriptPaths = Array.from({ length: 10 }, (_, index) => `Projects/ProMBA/meeting-${String(index).padStart(3, "0")}.${index % 2 === 0 ? "srt" : "txt"}`);
  const additional = {
    "Malformed/bad.srt": "malformed",
    "Empty/empty.srt": "",
    "Oversize/large.srt": "x".repeat(5_000_001),
    ".hidden/private.srt": "1\n00:00:01,000 --> 00:00:02,000\nExcluded"
  };
  const protectedPaths = [...transcriptPaths, ...Object.keys(additional)];
  const notePaths = Array.from({ length: 4986 }, (_, index) => `Notes/note-${String(index).padStart(4, "0")}.md`);

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), "soundings-acceptance-"));
    await Promise.all([...protectedPaths, ...notePaths].map(async (path) => {
      const absolute = join(root, ...path.split("/"));
      await mkdir(dirname(absolute), { recursive: true });
      const text = path in additional ? additional[path as keyof typeof additional]
        : path.endsWith(".srt") ? "1\n00:00:01,000 --> 00:00:02,000\nSilver lantern.\nSecond line."
          : path.endsWith(".txt") ? "Meeting body\n" : "# Note\n";
      await writeFile(absolute, encoder.encode(text));
    }));
    adapter = new DisposableVaultAdapter(root, [...protectedPaths, ...notePaths]);
  }, 30_000);

  afterAll(async () => { if (root) await rm(root, { recursive: true, force: true }); });

  it("scans responsively, previews, converts, refuses a race, cancels, restarts, and preserves sources", async () => {
    const sourceBefore = new Map<string, string>();
    for (const path of protectedPaths) sourceBefore.set(path, digest(await adapter.readBinary(path)));

    const started = performance.now();
    const discovery = await discoverTranscripts(adapter, settings, undefined, 2, testDigest);
    const elapsed = performance.now() - started;
    expect(discovery.items).toHaveLength(14);
    expect(discovery.items.slice(10).map((item) => item.classification)).toEqual(["unreadable", "empty", "oversize", "excluded"]);
    expect(elapsed).toBeLessThan(10_000);

    const plan = buildPlan(discovery.items, new Set(adapter.paths), settings, new Date(0), () => "scale");
    const pathsBeforeReview = new Set(adapter.paths);
    const reviewStarted = performance.now();
    const filtered = projectReviewPlan(plan, { query: "meeting-00", classification: "eligible" });
    expect(filtered.visibleItems).toHaveLength(10);
    const selected = selectAllVisibleEligible(new Set(), filtered.visibleItems);
    expect(selected.size).toBe(10);
    const hidden = projectReviewPlan(plan, { query: "meeting-000", selectedSourcePaths: selected });
    expect(hidden.visibleItems).toHaveLength(1);
    expect(hidden.selectedCount).toBe(10);
    expect(clearReviewSelection().size).toBe(0);
    expect(performance.now() - reviewStarted).toBeLessThan(1_000);
    expect(adapter.paths).toEqual(pathsBeforeReview);
    for (const path of protectedPaths) expect(digest(await adapter.readBinary(path))).toBe(sourceBefore.get(path));

    const raceSource = transcriptPaths[1];
    const raceDestination = raceSource.replace(/\.txt$/, ".md");
    await adapter.createBinary(raceDestination, encoder.encode("external winner"));
    const outcomes = await executePlan(plan, adapter, {
      selectedSourcePaths: new Set([transcriptPaths[0], raceSource]), settings, now: () => new Date(0), digest: testDigest
    });
    expect(outcomes.find((entry) => entry.sourcePath === transcriptPaths[0])?.status).toBe("created");
    expect(outcomes.find((entry) => entry.sourcePath === raceSource)?.status).toBe("blocked");
    expect(new TextDecoder().decode(await adapter.readBinary(raceDestination))).toBe("external winner");

    const restartDiscovery = await discoverTranscripts(adapter, settings, undefined, 50, testDigest);
    const restartPlan = buildPlan(restartDiscovery.items, new Set(adapter.paths), settings, new Date(1), () => "restart");
    expect(restartPlan.items.find((item) => item.sourcePath === transcriptPaths[0])?.classification).toBe("destination-exists");

    const controller = new AbortController();
    adapter.yieldHook = () => controller.abort();
    const canceled = await discoverTranscripts(adapter, settings, controller.signal, 1, testDigest);
    expect(canceled.canceled).toBe(true);
    adapter.yieldHook = undefined;

    for (const path of protectedPaths) expect(digest(await adapter.readBinary(path))).toBe(sourceBefore.get(path));
    process.stdout.write(`Soundings 5,000-file mixed SRT/TXT rehearsal: ${elapsed.toFixed(1)} ms scan, zero source mutations.\n`);
  }, 30_000);
});
