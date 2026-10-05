import { readFile } from "node:fs/promises";
import { micromark } from "micromark";
import { describe, expect, it, vi } from "vitest";
import { discoverTranscripts, type DiscoveryAdapter } from "../src/core/discovery";
import { executePlan, type PublicationAdapter } from "../src/core/execution";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { buildEnrichmentPlan } from "../src/core/enrichment-planning";
import { executeEnrichmentPlan } from "../src/core/enrichment-execution";
import { sha256 } from "../src/core/hash";
import { ObservationProcessor, planTranscriptInbox } from "../src/core/observation";
import { buildPlan } from "../src/core/planning";
import { parseTranscript } from "../src/core/parsers";
import { renderMarkdown } from "../src/core/rendering";
import { migrateSavedSettings, sanitizeSavedSettings, validateSettings, DEFAULT_SETTINGS, type SoundingsSettings } from "../src/core/settings";
import { testDigest } from "./test-crypto";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const body = "1\n00:00:01,250 --> 00:00:03,000\nAlice: Silver lantern.";
const settings: SoundingsSettings = { ...DEFAULT_SETTINGS, enabledFormats: ["txt", "vtt", "srt"] };

class Vault implements DiscoveryAdapter, PublicationAdapter {
  readonly files = new Map<string, Uint8Array>();
  readonly reads: string[] = [];
  readonly creates: string[] = [];
  onRead?: (path: string) => void;
  onCreate?: (path: string) => void;
  diskWinner?: string;
  constructor(contents: Record<string, string> = {}) {
    for (const [path, text] of Object.entries(contents)) this.files.set(path, encoder.encode(text));
  }
  listFiles() {
    return [...this.files].map(([path, bytes]) => ({ path, extension: path.split(".").pop()!, size: bytes.byteLength, isFile: true }));
  }
  fileForPath(path: string) { return this.listFiles().find((file) => file.path === path); }
  async readBinary(path: string) {
    this.reads.push(path);
    this.onRead?.(path);
    const bytes = this.files.get(path);
    if (!bytes) throw new Error("missing");
    return bytes.slice();
  }
  exists(path: string) { return this.files.has(path); }
  async existsOnDisk(path: string) { return path === this.diskWinner || this.exists(path); }
  async createBinary(path: string, bytes: Uint8Array) {
    this.onCreate?.(path);
    if (await this.existsOnDisk(path)) throw new Error("exists");
    this.creates.push(path);
    this.files.set(path, bytes.slice());
  }
}

async function planFor(vault: Vault, config = settings) {
  const discovery = await discoverTranscripts(vault, config, undefined, 50, testDigest);
  return buildPlan(discovery.items, new Set(vault.files.keys()), config, new Date(0), () => "srt");
}

describe("SRT settings and discovery", () => {
  it.each([undefined, { enabledFormats: ["txt"] }, { enabledFormats: ["txt", "vtt"] }, { enabledFormats: "srt" }])("does not broaden saved settings: %j", (saved) => {
    const raw = sanitizeSavedSettings(saved).input;
    const migrated = migrateSavedSettings(raw).settings!;
    expect(migrated.enabledFormats).toEqual(Array.isArray(raw.enabledFormats) ? raw.enabledFormats : ["txt", "vtt"]);
    expect(migrated.enabledFormats).not.toContain("srt");
    expect(migrated.observationEnabled).toBe(false);
  });

  it("persists explicitly enabled SRT without changing other profile choices", () => {
    const saved = validateSettings({ ...DEFAULT_SETTINGS, enabledFormats: ["srt"], outputProfile: { ...DEFAULT_SETTINGS.outputProfile, timestampPolicy: "retain" } }).settings!;
    const restored = migrateSavedSettings(sanitizeSavedSettings(JSON.parse(JSON.stringify(saved))).input).settings!;
    expect(restored).toEqual(saved);
    expect(restored.observationEnabled).toBe(false);
  });

  it("classifies mixed inputs and applies exclusions/size/format gates before reads", async () => {
    const vault = new Vault({
      "Nested/good.SrT": body, "bad.srt": "private invalid body", "empty.srt": "", "large.srt": body.repeat(20),
      ".obsidian/private.srt": body, ".hidden/private.srt": body, ".soundings/private.srt": body, "Archive/private.srt": body,
      "plain.txt": "plain", "good.vtt": "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nvoice"
    });
    const config = { ...settings, excludedPaths: [".obsidian", ".soundings", "Archive"], maxSourceBytes: 100 };
    const plan = await planFor(vault, config);
    expect(plan.items.map((item) => item.classification)).toEqual([
      "eligible", "unreadable", "empty", "oversize", "excluded", "excluded", "excluded", "excluded", "eligible", "eligible"
    ]);
    expect(vault.reads).toEqual(["Nested/good.SrT", "bad.srt", "empty.srt", "plain.txt", "good.vtt"]);
    expect(plan.items[0].evidence?.format).toBe("srt");
    expect(plan.items[1].evidence).toBeUndefined();
    expect(JSON.stringify(plan)).not.toContain("private invalid body");
    expect(vault.creates).toEqual([]);
    vault.reads.length = 0;
    await planFor(vault, DEFAULT_SETTINGS);
    expect(vault.reads.some((path) => path.toLowerCase().endsWith(".srt"))).toBe(false);
  });

  it("cancels SRT discovery without mutation and isolates unreadable files", async () => {
    const vault = new Vault({ "one.srt": body, "two.srt": body });
    const controller = new AbortController();
    const canceled = await discoverTranscripts({ ...vault, listFiles: () => vault.listFiles(), fileForPath: (path) => vault.fileForPath(path), readBinary: (path) => vault.readBinary(path), yieldControl: async () => { controller.abort(); } }, settings, controller.signal, 1, testDigest);
    expect(canceled.canceled).toBe(true);
    expect(vault.reads).toEqual(["one.srt"]);
    vault.onRead = (path) => { if (path === "one.srt") throw new Error("private"); };
    expect((await planFor(vault)).items.map((item) => item.classification)).toEqual(["unreadable", "eligible"]);
    expect(vault.creates).toEqual([]);
  });

  it("observes enabled SRT only within allowed roots, deduplicates, and hands off to review", async () => {
    const vault = new Vault({ "Meetings/new.SRT": body, "Elsewhere/no.srt": body, "Meetings/.hidden/no.srt": body });
    const config = { ...settings, observationEnabled: true, observationRoots: ["Meetings"] };
    const changed = vi.fn();
    let canProcess = true;
    const processor = new ObservationProcessor({ adapter: vault, settings: () => config, digest: testDigest, canProcess: () => canProcess, wait: async () => undefined, onChanged: changed });
    await Promise.all(["Meetings/new.SRT", "Meetings/new.SRT", "Elsewhere/no.srt", "Meetings/.hidden/no.srt"].map((path) => processor.handleCreated(path)));
    expect(processor.inbox.size).toBe(1);
    expect(changed).toHaveBeenCalledOnce();
    expect(vault.reads).toEqual(["Meetings/new.SRT", "Meetings/new.SRT"]);
    const inboxPlan = await planTranscriptInbox(processor.inbox, vault, config, testDigest, new Date(0), () => "inbox");
    expect(inboxPlan?.items[0]).toMatchObject({ format: "srt", classification: "eligible" });
    expect(vault.creates).toEqual([]);
    processor.stop(true);
    canProcess = false;
    expect(processor.inbox.size).toBe(0);
    await processor.handleCreated("Meetings/new.SRT");
    expect(processor.inbox.size).toBe(0);
  });

  it("cancels pending SRT observation without queuing or writing", async () => {
    const vault = new Vault({ "new.srt": body });
    const processor = new ObservationProcessor({ adapter: vault, settings: () => ({ ...settings, observationEnabled: true }), digest: testDigest, canProcess: () => true, wait: async () => { processor.stop(true); }, onChanged: vi.fn() });
    await processor.handleCreated("new.srt");
    expect(processor.inbox.size).toBe(0);
    expect(vault.creates).toEqual([]);
  });
});

describe("SRT rendering and guarded execution", () => {
  it.each(["omit", "retain"] as const)("contains literal adversarial payload with %s timing", async (timestampPolicy) => {
    const parsed = parseTranscript("srt", await readFile("tests/fixtures/adversarial.srt")).value!;
    const metadata = { sourceFile: "adversarial.srt", sourceFormat: "srt" as const, title: "SRT", convertedAt: "fixed" };
    const plain = renderMarkdown(parsed, metadata, { ...DEFAULT_SETTINGS.outputProfile, timestampPolicy });
    const folded = renderMarkdown(parsed, metadata, { ...DEFAULT_SETTINGS.outputProfile, timestampPolicy, transcriptDisplay: "folded-callout" });
    const section = folded.split("## Transcript\n\n")[1];
    const plainSection = plain.split("## Transcript\n\n")[1].trimEnd();
    expect(micromark(section)).toBe(`<blockquote>\n${micromark(`[!quote]- Full Transcript\n${plainSection}`)}\n</blockquote>\n`);
    expect(section).toContain("> Final containment sentinel: velvet anchor.");
    expect(micromark(section)).toContain("&lt;b&gt;hello&lt;/b&gt; &amp;amp;");
    expect(section).not.toContain("### Alice");
    expect(section.includes("**Time:**")).toBe(timestampPolicy === "retain");
  });

  it.each([
    ["same.srt", "same.txt"], ["same.srt", "same.vtt"], ["Foo.srt", "foo.txt"], ["Caf\u00e9.srt", "Cafe\u0301.vtt"]
  ])("blocks cross-format destination collision %s / %s", async (srt, other) => {
    const vault = new Vault({ [srt]: body, [other]: other.endsWith(".txt") ? "txt" : "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nx" });
    const plan = await planFor(vault);
    expect(plan.items.map((item) => item.classification)).toEqual(["destination-ambiguous", "destination-ambiguous"]);
    expect(vault.creates).toEqual([]);
  });

  it("creates only explicitly selected safe destinations and preserves every source", async () => {
    const vault = new Vault({ "Meetings/A:B.srt": body, "unselected.srt": body, "plain.txt": "plain" });
    const before = new Map(vault.files);
    const plan = await planFor(vault);
    expect(plan.items[0].destinationPath).toBe("Meetings/A - B.md");
    const outcomes = await executePlan(plan, vault, { settings, selectedSourcePaths: new Set(["Meetings/A:B.srt", "plain.txt"]), digest: testDigest, now: () => new Date(0) });
    expect(outcomes.map((item) => item.status)).toEqual(["created", "skipped", "created"]);
    expect(decoder.decode(vault.files.get("Meetings/A - B.md"))).toContain('source_format: "srt"');
    for (const [path, bytes] of before) expect(vault.files.get(path)).toEqual(bytes);
    expect(vault.files.has("unselected.md")).toBe(false);
  });

  it.each(["one.md", "ONE.md"])("preserves an existing SRT destination %s", async (destination) => {
    const vault = new Vault({ "one.srt": body, [destination]: "protected existing note" });
    const before = new Map(vault.files);
    const plan = await planFor(vault);
    expect(plan.items[0].classification).toBe("destination-exists");
    expect((await executePlan(plan, vault, { settings, selectedSourcePaths: new Set(["one.srt"]), digest: testDigest }))[0].status).toBe("blocked");
    expect(vault.files).toEqual(before);
    expect(vault.creates).toEqual([]);
  });

  it("reparses SRT before publication even if a caller supplied invalid eligible evidence", async () => {
    const vault = new Vault({ "bad.srt": body, "good.srt": body });
    const plan = await planFor(vault);
    const invalid = encoder.encode("private malformed caption");
    vault.files.set("bad.srt", invalid);
    const invalidPlan = { ...plan, items: [
      { ...plan.items[0], evidence: { ...plan.items[0].evidence!, byteLength: invalid.byteLength, sha256: await sha256(invalid, testDigest) } },
      plan.items[1]
    ] };
    const outcomes = await executePlan(invalidPlan, vault, { settings, selectedSourcePaths: new Set(["bad.srt", "good.srt"]), digest: testDigest });
    expect(outcomes.map((item) => item.status)).toEqual(["failed", "created"]);
    expect(vault.files.has("bad.md")).toBe(false);
    expect(JSON.stringify(outcomes)).not.toContain("private malformed caption");
  });

  it.each(["changed", "missing", "disk-race", "create-race", "settings", "cancel"])("refuses %s after review", async (mode) => {
    const vault = new Vault({ "one.srt": body });
    const plan = await planFor(vault);
    const controller = new AbortController();
    let config = settings;
    if (mode === "changed") vault.files.set("one.srt", encoder.encode("malformed after review"));
    if (mode === "missing") vault.files.delete("one.srt");
    if (mode === "disk-race") vault.diskWinner = "one.md";
    if (mode === "create-race") vault.onCreate = (path) => { vault.files.set(path, encoder.encode("external winner")); };
    if (mode === "settings") config = { ...settings, outputProfile: { ...settings.outputProfile, timestampPolicy: "retain" } };
    if (mode === "cancel") vault.onRead = () => { controller.abort(); };
    const outcome = (await executePlan(plan, vault, { settings: config, selectedSourcePaths: new Set(["one.srt"]), digest: testDigest, signal: controller.signal }))[0];
    expect(outcome.status).toBe(mode.includes("race") ? "blocked" : mode === "cancel" ? "canceled" : "stale");
    expect(vault.creates).toEqual([]);
    if (mode === "create-race") expect(decoder.decode(vault.files.get("one.md"))).toBe("external winner");
    else expect(vault.files.has("one.md")).toBe(false);
  });

  it("isolates a failed source read in a mixed-format selected batch", async () => {
    const vault = new Vault({ "bad.srt": body, "good.srt": body, "plain.txt": "plain", "voice.vtt": "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nx" });
    const plan = await planFor(vault);
    vault.onRead = (path) => { if (path === "bad.srt") throw new Error("private payload"); };
    const outcomes = await executePlan(plan, vault, { settings, selectedSourcePaths: new Set(vault.files.keys()), digest: testDigest });
    expect(outcomes.map((item) => item.status)).toEqual(["stale", "created", "created", "created"]);
    expect(JSON.stringify(outcomes)).not.toContain("private payload");
  });

  it.each(["plain", "folded-callout"] as const)("supports guarded companion enrichment for %s SRT notes", async (transcriptDisplay) => {
    const vault = new Vault({ "Meetings/source.srt": body });
    const config = { ...settings, outputProfile: { ...settings.outputProfile, transcriptDisplay } };
    await executePlan(await planFor(vault, config), vault, { settings: config, selectedSourcePaths: new Set(["Meetings/source.srt"]), digest: testDigest });
    const path = "Meetings/source.md";
    const bytes = vault.files.get(path)!;
    const evidence = (await identifySourceNote(path, bytes, 5_000_000, (data) => sha256(data, testDigest))).value!;
    const draft = { summary: "Reviewed summary", decisions: [], actionItems: [], followUps: [] };
    const plan = buildEnrichmentPlan(path, evidence, draft, new Set(vault.files.keys()), new Date(0), "enrichment");
    const options = { digest: testDigest, maxSourceBytes: 5_000_000 };
    expect((await executeEnrichmentPlan(plan, vault, options)).status).toBe("created");
    expect(decoder.decode(vault.files.get(plan.destinationPath))).toContain("[[Meetings/source|Back to Transcript Note]]");
    expect(vault.files.get(path)).toEqual(bytes);
    expect(vault.files.get("Meetings/source.srt")).toEqual(encoder.encode(body));
    expect((await executeEnrichmentPlan(plan, vault, options)).status).toBe("blocked");
    vault.files.set(path, encoder.encode(`${decoder.decode(bytes)}\nchanged`));
    expect((await executeEnrichmentPlan(plan, vault, options)).status).toBe("stale");
  });
});
