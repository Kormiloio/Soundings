import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { discoverTranscripts, type DiscoveryAdapter } from "../src/core/discovery";
import { executePlan, type PublicationAdapter } from "../src/core/execution";
import { buildPlan } from "../src/core/planning";
import { DEFAULT_SETTINGS } from "../src/core/settings";
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
    return [...this.paths].map((path) => ({ path, extension: path.split(".").pop() ?? "", size: path.endsWith(".txt") ? 13 : 1, isFile: true }));
  }

  async readBinary(path: string): Promise<Uint8Array> {
    return readFile(this.absolute(path));
  }

  exists(path: string): boolean { return this.paths.has(path); }

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
  const transcriptPaths = Array.from({ length: 10 }, (_, index) => `Projects/ProMBA/meeting-${String(index).padStart(3, "0")}.txt`);
  const notePaths = Array.from({ length: 4990 }, (_, index) => `Notes/note-${String(index).padStart(4, "0")}.md`);

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), "soundings-acceptance-"));
    await Promise.all([...transcriptPaths, ...notePaths].map(async (path) => {
      const absolute = join(root, ...path.split("/"));
      await mkdir(dirname(absolute), { recursive: true });
      await writeFile(absolute, path.endsWith(".txt") ? encoder.encode("Meeting body\n") : encoder.encode("# Note\n"));
    }));
    adapter = new DisposableVaultAdapter(root, [...transcriptPaths, ...notePaths]);
  }, 30_000);

  afterAll(async () => { if (root) await rm(root, { recursive: true, force: true }); });

  it("scans responsively, previews, converts, refuses a race, cancels, restarts, and preserves sources", async () => {
    const sourceBefore = new Map<string, string>();
    for (const path of transcriptPaths) sourceBefore.set(path, digest(await adapter.readBinary(path)));

    const started = performance.now();
    const discovery = await discoverTranscripts(adapter, DEFAULT_SETTINGS, undefined, 2, testDigest);
    const elapsed = performance.now() - started;
    expect(discovery.items).toHaveLength(10);
    expect(elapsed).toBeLessThan(10_000);

    const plan = buildPlan(discovery.items, new Set(adapter.paths), DEFAULT_SETTINGS, new Date(0), () => "scale");
    const raceSource = transcriptPaths[1];
    const raceDestination = raceSource.replace(/\.txt$/, ".md");
    await adapter.createBinary(raceDestination, encoder.encode("external winner"));
    const outcomes = await executePlan(plan, adapter, {
      selectedSourcePaths: new Set([transcriptPaths[0], raceSource]), settings: DEFAULT_SETTINGS, now: () => new Date(0), digest: testDigest
    });
    expect(outcomes.find((entry) => entry.sourcePath === transcriptPaths[0])?.status).toBe("created");
    expect(outcomes.find((entry) => entry.sourcePath === raceSource)?.status).toBe("blocked");
    expect(new TextDecoder().decode(await adapter.readBinary(raceDestination))).toBe("external winner");

    const restartDiscovery = await discoverTranscripts(adapter, DEFAULT_SETTINGS, undefined, 50, testDigest);
    const restartPlan = buildPlan(restartDiscovery.items, new Set(adapter.paths), DEFAULT_SETTINGS, new Date(1), () => "restart");
    expect(restartPlan.items.find((item) => item.sourcePath === transcriptPaths[0])?.classification).toBe("destination-exists");

    const controller = new AbortController();
    adapter.yieldHook = () => controller.abort();
    const canceled = await discoverTranscripts(adapter, DEFAULT_SETTINGS, controller.signal, 1, testDigest);
    expect(canceled.canceled).toBe(true);
    adapter.yieldHook = undefined;

    for (const path of transcriptPaths) expect(digest(await adapter.readBinary(path))).toBe(sourceBefore.get(path));
    process.stdout.write(`Soundings 5,000-file rehearsal: ${elapsed.toFixed(1)} ms scan, zero source mutations.\n`);
  }, 30_000);
});
