import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { micromark } from "micromark";
import { parseTranscript, parseTxt } from "../src/core/parsers";
import { DEFAULT_SETTINGS, DEFAULT_OUTPUT_PROFILE, migrateSavedSettings, sanitizeSavedSettings, settingsFingerprint, validateSettings } from "../src/core/settings";
import { renderMarkdown } from "../src/core/rendering";
import { discoverTranscriptFile } from "../src/core/discovery";
import { buildPlan } from "../src/core/planning";
import { executePlan, type PublicationAdapter } from "../src/core/execution";
import { testDigest } from "./test-crypto";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { sha256 } from "../src/core/hash";
import { buildEnrichmentPlan } from "../src/core/enrichment-planning";
import { executeEnrichmentPlan } from "../src/core/enrichment-execution";
import { ObservationProcessor, planTranscriptInbox } from "../src/core/observation";

const source = "11:01:03 --> 11:01:05\nAlex Rivera: Silver lantern.\n  continuation\n\n11:01:04 --> 11:01:06\nSam Lee: Repeat this.\n\n11:01:06 --> 11:01:08\nSam Lee: Repeat this.";
const encoder = new TextEncoder();
const settings = { ...DEFAULT_SETTINGS, txtLayout: "timestamped-speaker" as const };
const metadata = { sourceFile: "one.txt", sourceFormat: "txt" as const, title: "one", convertedAt: new Date(0).toISOString() };

describe("TXT layout settings and parsing", () => {
  it("migrates absent, invalid, and valid saved values safely", () => {
    for (const raw of [{}, { txtLayout: null }, { txtLayout: "unknown" }, { txtLayout: 2 }]) {
      const result = migrateSavedSettings(sanitizeSavedSettings(raw).input).settings!;
      expect(result.txtLayout).toBe("plain");
      expect(result.enabledFormats).toEqual(DEFAULT_SETTINGS.enabledFormats);
      expect(result.observationEnabled).toBe(false);
    }
    expect(validateSettings(settings).settings?.txtLayout).toBe("timestamped-speaker");
    expect(settingsFingerprint(settings)).not.toBe(settingsFingerprint(DEFAULT_SETTINGS));
  });

  it("recognizes the synthetic sample, multiline text, overlap, and repetition", async () => {
    const fixture = await readFile("tests/fixtures/timestamped-speaker.txt");
    const parsed = parseTranscript("txt", fixture, "timestamped-speaker").value!;
    expect(parsed.txtInterpretation).toBe("timestamped-speaker");
    expect(parsed.blocks).toHaveLength(3);
    expect(parsed.blocks[0]).toEqual({ speaker: "Alex Rivera", text: "Silver lantern.\nSecond line stays here.", timing: { start: "11:01:03", end: "11:01:05" } });
    expect(parsed.blocks[1].text).toBe(parsed.blocks[2].text);
    expect(parseTxt(source).value?.blocks).toEqual([{ text: source }]);
  });

  it("accepts bounded whitespace, Unicode, BOM, CRLF, and no final newline", () => {
    const text = "\ufeff\r\n \t11:01:03\t--> 11:01:05 \r\n\u017deljko-Smith:\t Hello &amp;\r\n  tail\t";
    expect(parseTranscript("txt", encoder.encode(text), "timestamped-speaker").value?.blocks).toEqual([
      { speaker: "\u017deljko-Smith", text: "Hello &amp;\n  tail\t", timing: { start: "11:01:03", end: "11:01:05" } }
    ]);
  });

  it.each([
    "Preamble\n\n" + source, source.replace("\n\n", "\n"), source.replace("11:01:03", "11:61:03"),
    source.replace("11:01:03", "11:01:03.000"), source.replace("11:01:05", "11:01:03"),
    source.replace("Alex Rivera: Silver lantern.", "No label"), "23:59:59 --> 00:00:01\nAlex: Hello",
    "11:01:03 --> 11:01:05\nAlex:   ", "1\n" + source, " \t\n", "Alex: Hello"
  ])("preserves the entire unfamiliar input %#", (text) => {
    expect(parseTxt(text, "timestamped-speaker").value).toEqual({ format: "txt", txtInterpretation: "plain-fallback", blocks: [{ text }] });
  });

  it("keeps decoding and empty-source failures", () => {
    expect(parseTranscript("txt", new Uint8Array([0xc3, 0x28]), "timestamped-speaker").error).toBe("unsupported-encoding");
    expect(parseTxt("", "timestamped-speaker").error).toBe("empty");
  });

  it("processes near-limit and adversarial input without losing text", () => {
    const nearLimit = (source + "\n\n").repeat(Math.floor(4_900_000 / (source.length + 2)));
    const start = performance.now();
    const parsed = parseTxt(nearLimit, "timestamped-speaker").value!;
    expect(parsed.blocks.length).toBe(3 * Math.floor(4_900_000 / (source.length + 2)));
    expect(renderMarkdown(parsed, metadata)).toContain("Silver lantern.");
    for (const text of [" ".repeat(1_000_000) + "X", "11:".repeat(330_000) + "-->"]) {
      expect(parseTxt(text, "timestamped-speaker").value?.blocks).toEqual([{ text }]);
    }
    console.info(`TXT near-limit/adversarial rehearsal: ${(performance.now() - start).toFixed(1)} ms; all blocks preserved.`);
  });
});

describe("TXT output and reviewed publication", () => {
  it.each(["plain", "folded-callout"] as const)("contains literal payload and escaped labels in %s", async (transcriptDisplay) => {
    const malicious = "11:01:03 --> 11:01:05\n%%$==[[Person]]: <b>hello</b> &amp;\n> [!note] literal\n~~~\n![[embed]]";
    const parsed = parseTxt(malicious, "timestamped-speaker").value!;
    for (const timestampPolicy of ["omit", "retain"] as const) {
      const markdown = renderMarkdown(parsed, metadata, { ...DEFAULT_OUTPUT_PROFILE, transcriptDisplay, timestampPolicy });
      expect(markdown).toContain("soundings_version: 2");
      expect(markdown.includes("**Time:**")).toBe(timestampPolicy === "retain");
      expect(markdown).toContain("source_format: \"txt\"");
      const html = micromark(markdown);
      expect(html).toContain("&lt;b&gt;hello&lt;/b&gt;");
      expect(html).not.toContain("<b>hello</b>");
      expect(html.match(/<blockquote>/g)?.length ?? 0).toBe(transcriptDisplay === "folded-callout" ? 2 : 1);
      expect((await identifySourceNote("one.md", encoder.encode(markdown), 5_000_000, (bytes) => sha256(bytes, testDigest))).ok).toBe(true);
    }
  });

  it("keeps fallback rendered bytes and schema identical to plain interpretation", () => {
    for (const text of ["ordinary text", "prefix\n" + source]) {
      expect(renderMarkdown(parseTxt(text, "timestamped-speaker").value!, metadata)).toBe(renderMarkdown(parseTxt(text).value!, metadata));
    }
  });

  async function setup(text = source) {
    const files = new Map<string, Uint8Array>([["one.txt", encoder.encode(text)]]);
    const adapter: PublicationAdapter = {
      readBinary: async (path) => { const bytes = files.get(path); if (!bytes) throw new Error("missing"); return bytes; },
      exists: (path) => files.has(path), existsOnDisk: async (path) => files.has(path),
      createBinary: async (path, bytes) => { if (files.has(path)) throw new Error("exists"); files.set(path, bytes); }
    };
    const discovered = (await discoverTranscriptFile(adapter, { path: "one.txt", extension: "txt", size: files.get("one.txt")!.length, isFile: true }, settings, testDigest))!;
    const plan = buildPlan([discovered], new Set(), settings, new Date(0), () => "txt");
    const options = { settings, digest: testDigest, selectedSourcePaths: new Set(["one.txt"]), now: () => new Date(0) };
    return { files, adapter, discovered, plan, options };
  }

  it.each([source, "unfamiliar text"])("reviews actual interpretation and creates without source mutation", async (text) => {
    const { files, adapter, discovered, plan, options } = await setup(text);
    expect(discovered.txtInterpretation).toBe(text === source ? "timestamped-speaker" : "plain-fallback");
    expect(discovered.reason).not.toContain("Silver lantern");
    expect(files.size).toBe(1);
    expect((await executePlan(plan, adapter, options))[0].status).toBe("created");
    expect(files.get("one.txt")).toEqual(encoder.encode(text));
  });

  it("publishes a companion for structured TXT without editing either source", async () => {
    const { files, adapter, plan, options } = await setup();
    await executePlan(plan, adapter, options);
    const before = new Map(files);
    const evidence = (await identifySourceNote("one.md", files.get("one.md")!, 5_000_000, (bytes) => sha256(bytes, testDigest))).value!;
    const companion = buildEnrichmentPlan("one.md", evidence, { summary: "Reviewed", decisions: [], actionItems: [], followUps: [] }, new Set(files.keys()), new Date(0), "companion");
    expect((await executeEnrichmentPlan(companion, adapter, { digest: testDigest, maxSourceBytes: 5_000_000 })).status).toBe("created");
    for (const [path, bytes] of before) expect(files.get(path)).toEqual(bytes);
  });

  it("uses the same interpretation in observation and inbox review without creating notes", async () => {
    const { files, adapter } = await setup();
    const discoveryAdapter = {
      ...adapter,
      listFiles: () => [...files].map(([path, bytes]) => ({ path, size: bytes.length, isFile: true, extension: "txt" })),
      fileForPath: (path: string) => files.has(path) ? { path, size: files.get(path)!.length, isFile: true, extension: "txt" } : undefined
    };
    const config = { ...settings, observationEnabled: true };
    const processor = new ObservationProcessor({ adapter: discoveryAdapter, settings: () => config, digest: testDigest, canProcess: () => true, wait: async () => undefined, onChanged: () => undefined });
    await processor.handleCreated("one.txt");
    const plan = await planTranscriptInbox(processor.inbox, discoveryAdapter, config, testDigest, new Date(0), () => "inbox");
    expect(plan?.txtLayout).toBe("timestamped-speaker");
    expect(plan?.items[0].txtInterpretation).toBe("timestamped-speaker");
    expect(files.size).toBe(1);
    processor.stop(true);
  });

  it.each(["cancel-during-read", "layout-during-read", "create-race", "corrupt-readback"])("retains async publication guards: %s", async (mode) => {
    const { files, adapter, plan, options } = await setup();
    const controller = new AbortController();
    const mutableSettings = { ...settings };
    const guarded: PublicationAdapter = {
      ...adapter,
      readBinary: async (path) => {
        if (path === "one.txt") {
          if (mode === "cancel-during-read") controller.abort();
          if (mode === "layout-during-read") mutableSettings.txtLayout = "plain" as never;
        }
        if (path === "one.md" && mode === "corrupt-readback") return encoder.encode("corrupt");
        return adapter.readBinary(path);
      },
      createBinary: async (path, bytes) => {
        if (mode === "create-race") files.set(path, encoder.encode("external winner"));
        await adapter.createBinary(path, bytes);
      }
    };
    const status = (await executePlan(plan, guarded, { ...options, settings: mutableSettings, signal: controller.signal }))[0].status;
    expect(status).toBe(mode === "cancel-during-read" ? "canceled" : mode === "layout-during-read" ? "stale" : mode === "create-race" ? "blocked" : "needs-attention");
    if (mode.endsWith("read")) expect(files.has("one.md")).toBe(false);
    if (mode === "create-race") expect(files.get("one.md")).toEqual(encoder.encode("external winner"));
    expect(files.get("one.txt")).toEqual(encoder.encode(source));
  });

  it("isolates a failed structured TXT read from a valid fallback", async () => {
    const { files, adapter, plan, options } = await setup();
    files.set("two.txt", encoder.encode("ordinary text"));
    const discovered = (await discoverTranscriptFile(adapter, { path: "two.txt", extension: "txt", isFile: true, size: 13 }, settings, testDigest))!;
    const mixed = buildPlan([...plan.items, discovered], new Set(), settings, new Date(0), () => "mixed");
    const guarded = { ...adapter, readBinary: async (path: string) => { if (path === "one.txt") throw new Error("private content"); return adapter.readBinary(path); } };
    const outcomes = await executePlan(mixed, guarded, { ...options, selectedSourcePaths: new Set(["one.txt", "two.txt"]) });
    expect(outcomes.map((outcome) => outcome.status)).toEqual(["stale", "created"]);
    expect(files.has("one.md")).toBe(false);
    expect(JSON.stringify(outcomes)).not.toContain("private content");
  });

  it.each(["settings", "policy", "outcome", "source", "destination", "cancel", "unselected"])("refuses unsafe publication: %s", async (change) => {
    const { files, adapter, plan, options } = await setup();
    let candidate = plan;
    let execution = options;
    if (change === "settings") execution = { ...options, settings: { ...settings, txtLayout: "plain" as never } };
    if (change === "policy") candidate = { ...plan, txtLayout: "plain" };
    if (change === "outcome") candidate = { ...plan, items: [{ ...plan.items[0], txtInterpretation: "plain" }] };
    if (change === "source") files.set("one.txt", encoder.encode(source + "changed"));
    if (change === "destination") files.set("one.md", encoder.encode("protected"));
    const controller = new AbortController();
    if (change === "cancel") controller.abort();
    if (change === "unselected") execution = { ...options, selectedSourcePaths: new Set() };
    const result = await executePlan(candidate, adapter, { ...execution, signal: controller.signal });
    expect(result[0].status).toBe(change === "destination" ? "blocked" : change === "cancel" ? "canceled" : change === "unselected" ? "skipped" : "stale");
    expect(files.has("one.md")).toBe(change === "destination");
    if (change === "destination") expect(files.get("one.md")).toEqual(encoder.encode("protected"));
  });
});
