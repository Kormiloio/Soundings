import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SoundingsPlugin from "../src/main";
import { buildEnrichmentPlan, type EnrichmentPlan } from "../src/core/enrichment-planning";
import type { EnrichmentModalActions } from "../src/obsidian/enrichment-modal";
import { EnrichmentModal } from "../src/obsidian/enrichment-modal";
import { ProgressModal, ResultsModal, ReviewModal, type ReviewActions } from "../src/obsidian/review-modal";
import type { ExecutionOutcome } from "../src/core/types";
import { notices, openModals, resetRuntimeControls, TFile, type Plugin } from "./obsidian-runtime-stub";

const encoder = new TextEncoder();

interface FakeFile { readonly path: string; readonly extension: string; readonly stat: { readonly size: number } }

function fakeFile(path: string, size: number): FakeFile {
  const extension = path.slice(path.lastIndexOf(".") + 1);
  return Object.assign(new TFile(), { path, extension, stat: { size } });
}

class FakeVault {
  readonly configDir = ".obsidian";
  readonly files = new Map<string, Uint8Array>();
  readonly creates: string[] = [];
  readonly listeners: Array<{ readonly name: string; readonly callback: (file: unknown) => void }> = [];
  createGate?: Promise<void>;
  readonly adapter = { exists: async (path: string) => this.files.has(path) };

  getFiles(): FakeFile[] {
    return [...this.files].map(([path, bytes]) => fakeFile(path, bytes.byteLength));
  }
  getAbstractFileByPath(path: string): FakeFile | null {
    const bytes = this.files.get(path);
    return bytes ? fakeFile(path, bytes.byteLength) : null;
  }
  async readBinary(file: FakeFile): Promise<ArrayBuffer> {
    const bytes = this.files.get(file.path);
    if (!bytes) throw new Error("missing");
    return bytes.slice().buffer;
  }
  async createBinary(path: string, data: ArrayBuffer): Promise<void> {
    this.creates.push(path);
    await this.createGate;
    if (this.files.has(path)) throw new Error("exists");
    this.files.set(path, new Uint8Array(data));
  }
  on(name: string, callback: (file: unknown) => void): unknown {
    const ref = { name, callback };
    this.listeners.push(ref);
    return ref;
  }
  offref(ref: unknown): void {
    const index = this.listeners.indexOf(ref as FakeVault["listeners"][number]);
    if (index >= 0) this.listeners.splice(index, 1);
  }
}

function fakeApp(vault: FakeVault, activePath?: string) {
  return {
    vault,
    workspace: {
      getActiveFile: () => (activePath ? vault.getAbstractFileByPath(activePath) : null),
      onLayoutReady: (callback: () => void) => callback()
    }
  };
}

async function settle(): Promise<void> {
  for (let index = 0; index < 20; index += 1) await new Promise((resolve) => setTimeout(resolve, 0));
}

function stubPlugin(plugin: SoundingsPlugin): Plugin {
  return plugin as unknown as Plugin;
}

function command(plugin: SoundingsPlugin, id: string) {
  const found = stubPlugin(plugin).commands.find((entry) => entry.id === id);
  if (!found) throw new Error(`missing command ${id}`);
  return found;
}

function modalOf<T>(type: abstract new (...args: never[]) => T): T | undefined {
  return openModals.find((modal) => modal instanceof type) as T | undefined;
}

async function loadedPlugin(vault: FakeVault, activePath?: string): Promise<SoundingsPlugin> {
  const plugin = new SoundingsPlugin(fakeApp(vault, activePath) as never, {} as never);
  await plugin.onload();
  return plugin;
}

const NOTE = '---\ntype: "meeting-transcript"\nsource: "transcript"\nsoundings_version: 1\n---\n# Title\n';

describe("plugin lifecycle", () => {
  beforeEach(() => {
    resetRuntimeControls();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("activeWindow", globalThis);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("closes an open review on unload and refuses its conversion afterwards", async () => {
    const vault = new FakeVault();
    vault.files.set("Meeting.txt", encoder.encode("hello"));
    const plugin = await loadedPlugin(vault);

    await command(plugin, "scan-vault-for-transcripts").callback?.();
    await settle();
    const review = modalOf(ReviewModal);
    expect(review).toBeDefined();

    plugin.onunload();
    expect(openModals).toEqual([]);

    const actions = (review as unknown as { actions: ReviewActions }).actions;
    await actions.convert(new Set(["Meeting.txt"]));
    await actions.refresh();
    await settle();
    expect(vault.creates).toEqual([]);
    expect(openModals).toEqual([]);
  });

  it("closes an open enrichment form on unload and refuses publication afterwards", async () => {
    const vault = new FakeVault();
    vault.files.set("Meeting.md", encoder.encode(NOTE));
    const plugin = await loadedPlugin(vault, "Meeting.md");

    command(plugin, "add-manual-enrichment").checkCallback?.(false);
    await settle();
    const enrichment = modalOf(EnrichmentModal);
    expect(enrichment).toBeDefined();
    const actions = (enrichment as unknown as { actions: EnrichmentModalActions }).actions;

    plugin.onunload();
    expect(openModals).toEqual([]);

    const draft = Object.freeze({ summary: "Done", decisions: [] as readonly string[], actionItems: [] as readonly string[], followUps: [] as readonly string[] });
    const plan: EnrichmentPlan = buildEnrichmentPlan("Meeting.md", actions.sourceEvidence, draft, new Set(), new Date(0), "e1");
    await expect(actions.publish(plan)).resolves.toBeUndefined();
    expect(vault.creates).toEqual([]);
  });

  it("does not start scans or inbox reviews after unload", async () => {
    const vault = new FakeVault();
    vault.files.set("Meeting.txt", encoder.encode("hello"));
    const plugin = await loadedPlugin(vault);
    plugin.onunload();

    await command(plugin, "scan-vault-for-transcripts").callback?.();
    await command(plugin, "review-transcript-inbox").callback?.();
    command(plugin, "add-manual-enrichment").checkCallback?.(false);
    await settle();
    expect(openModals).toEqual([]);
    expect(vault.creates).toEqual([]);
  });

  it("cancels the run when the progress dialog is dismissed", async () => {
    const vault = new FakeVault();
    vault.files.set("One.txt", encoder.encode("one"));
    vault.files.set("Two.txt", encoder.encode("two"));
    const plugin = await loadedPlugin(vault);

    await command(plugin, "scan-vault-for-transcripts").callback?.();
    await settle();
    const review = modalOf(ReviewModal)!;
    let release!: () => void;
    vault.createGate = new Promise<void>((resolve) => { release = resolve; });

    const converting = (review as unknown as { actions: ReviewActions }).actions.convert(new Set(["One.txt", "Two.txt"]));
    await settle();
    const progress = modalOf(ProgressModal);
    expect(progress).toBeDefined();
    progress!.close();
    release();
    await converting;
    await settle();

    const results = modalOf(ResultsModal);
    expect(results).toBeDefined();
    const outcomes = (results as unknown as { outcomes: readonly ExecutionOutcome[] }).outcomes;
    expect(outcomes.map((entry) => entry.status)).toEqual(["created", "canceled"]);
    expect(vault.creates).toEqual(["One.md"]);
  });

  it("keeps a completed run uncanceled when progress closes normally", async () => {
    const vault = new FakeVault();
    vault.files.set("One.txt", encoder.encode("one"));
    const plugin = await loadedPlugin(vault);

    await command(plugin, "scan-vault-for-transcripts").callback?.();
    await settle();
    const review = modalOf(ReviewModal)!;
    await (review as unknown as { actions: ReviewActions }).actions.convert(new Set(["One.txt"]));
    await settle();
    const outcomes = (modalOf(ResultsModal) as unknown as { outcomes: readonly ExecutionOutcome[] }).outcomes;
    expect(outcomes.map((entry) => entry.status)).toEqual(["created"]);
    expect(notices.filter((message) => message.includes("unexpected"))).toEqual([]);
  });

  it("does not open results after the plugin unloads mid-run", async () => {
    const vault = new FakeVault();
    vault.files.set("One.txt", encoder.encode("one"));
    const plugin = await loadedPlugin(vault);

    await command(plugin, "scan-vault-for-transcripts").callback?.();
    await settle();
    const review = modalOf(ReviewModal)!;
    let release!: () => void;
    vault.createGate = new Promise<void>((resolve) => { release = resolve; });
    const converting = (review as unknown as { actions: ReviewActions }).actions.convert(new Set(["One.txt"]));
    await settle();

    plugin.onunload();
    release();
    await converting;
    await settle();
    expect(openModals).toEqual([]);
  });
});
