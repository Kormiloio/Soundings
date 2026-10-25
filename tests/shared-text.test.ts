import { describe, expect, it } from "vitest";
import { micromark } from "micromark";
import { discoverTranscriptFile } from "../src/core/discovery";
import { buildPlan, reviseContentKind, collisionKey } from "../src/core/planning";
import { changeReviewContentKind, projectReviewPlan, selectAllVisibleEligible } from "../src/core/review-state";
import { contentKindFor, isContentKind } from "../src/core/content-kind";
import { DEFAULT_SETTINGS, DEFAULT_OUTPUT_PROFILE } from "../src/core/settings";
import { executePlan, type PublicationAdapter } from "../src/core/execution";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { buildEnrichmentPlan } from "../src/core/enrichment-planning";
import { executeEnrichmentPlan } from "../src/core/enrichment-execution";
import { sha256 } from "../src/core/hash";
import { parseTranscript } from "../src/core/parsers";
import { renderMarkdown } from "../src/core/rendering";
import type { PlanItem } from "../src/core/types";
import { testDigest } from "./test-crypto";
import baselineHashes from "./fixtures/shared-text-041-hashes.json";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const kinds = ["notes", "meeting-minutes", "correspondence", "chat"] as const;
const source = "11:01:03 --> 11:01:05\nAlex: Silver lantern.\n  continuation\n\n11:01:04 --> 11:01:06\nSam: Repeat this.";
const settings = { ...DEFAULT_SETTINGS, txtLayout: "timestamped-speaker" as const };
const draft = { summary: "Reviewed", decisions: [], actionItems: [], followUps: [] };

async function setup(text = source) {
  const files = new Map([["one.txt", encoder.encode(text)]]);
  const adapter: PublicationAdapter = {
    readBinary: async (path) => { const bytes = files.get(path); if (!bytes) throw new Error("private failure"); return bytes.slice(); },
    exists: (path) => [...files.keys()].some((key) => collisionKey(key) === collisionKey(path)),
    existsOnDisk: async (path) => [...files.keys()].some((key) => collisionKey(key) === collisionKey(path)),
    createBinary: async (path, bytes) => { if (adapter.exists(path)) throw new Error("exists"); files.set(path, bytes.slice()); }
  };
  const discovered = (await discoverTranscriptFile(adapter, { path: "one.txt", extension: "txt", size: files.get("one.txt")!.length, isFile: true }, settings, testDigest))!;
  const original = buildPlan([discovered], new Set(), settings, new Date(0), () => "shared");
  const plan = reviseContentKind(original, "one.txt", "notes").value!;
  const options = { settings, digest: testDigest, selectedSourcePaths: new Set(["one.txt"]), selectedPlanRevision: plan.revision, now: () => new Date(0) };
  return { files, adapter, original, plan, options };
}

describe("shared-text review policy", () => {
  it("validates kinds and preserves immutable evidence and destinations", async () => {
    const { original, plan } = await setup();
    expect(isContentKind("__proto__")).toBe(false);
    expect(contentKindFor({ format: "txt" })).toBe("transcript");
    expect(reviseContentKind(original, "one.txt", "unknown").ok).toBe(false);
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.items[0])).toBe(true);
    expect(plan.items[0].evidence).toEqual(original.items[0].evidence);
    expect(plan.items[0].destinationPath).toBe(original.items[0].destinationPath);
    expect(original.items[0].contentKind).toBe("transcript");
    for (const item of [{ ...original.items[0], format: "vtt" }, { ...original.items[0], classification: "excluded" }]) {
      expect(reviseContentKind({ ...original, items: [item as PlanItem] }, "one.txt", "notes").ok).toBe(false);
    }
  });

  it("deselects only changed rows and preserves hidden choices through filtering", async () => {
    const { original } = await setup();
    const second = { ...original.items[0], sourcePath: "two.txt", destinationPath: "two.md" };
    const mixed = buildPlan([...original.items, second], new Set(), settings, new Date(0), () => "mixed");
    const revised = changeReviewContentKind(mixed, new Set(["one.txt", "two.txt"]), "one.txt", "chat");
    expect([...revised.selected]).toEqual(["two.txt"]);
    const projection = projectReviewPlan(revised.plan, { query: "two", selectedSourcePaths: revised.selected });
    expect(projection.selectedCount).toBe(1);
    expect(revised.plan.items[0].contentKind).toBe("chat");
    expect([...selectAllVisibleEligible(revised.selected, projection.visibleItems)]).toEqual(["two.txt"]);
    const restored = reviseContentKind(revised.plan, "one.txt", "transcript").value!;
    expect(restored.items[0].txtInterpretation).toBe(original.items[0].txtInterpretation);
    expect(buildPlan(revised.plan.items, new Set(), settings, new Date(0), () => "fresh").items.every((item) => item.contentKind === "transcript")).toBe(true);
  });
});

describe("shared-text output and guards", () => {
  // Captured from the tag's parser/renderer; fixed hashes keep this check runnable in shallow CI checkouts.
  it("reproduces tagged 0.4.1 transcript bytes, including structured TXT", async () => {
    const hashes: string[] = [];
    for (const [format, text] of [["txt", source], ["txt", "From: Alex\n\nLiteral message"], ["vtt", "WEBVTT\n\n00:01.000 --> 00:02.000\n<v Alex>Hello"], ["srt", "1\n00:00:01,000 --> 00:00:02,000\nHello"]] as const) {
      for (const transcriptDisplay of ["plain", "folded-callout"] as const) {
        for (const timestampPolicy of ["omit", "retain"] as const) {
          for (const layout of ["plain", "timestamped-speaker"] as const) {
            const bytes = encoder.encode(text);
            const metadata = { sourceFile: "source." + format, sourceFormat: format, title: "source", convertedAt: "fixed" };
            const profile = { ...DEFAULT_OUTPUT_PROFILE, transcriptDisplay, timestampPolicy };
            hashes.push(await sha256(encoder.encode(renderMarkdown(parseTranscript(format, bytes, layout).value!, metadata, profile)), testDigest));
          }
        }
      }
    }
    expect(hashes).toEqual(baselineHashes);
  });
  it.each(kinds)("matches complete expected output for %s", (kind) => {
    const parsed = parseTranscript("txt", encoder.encode("From: Alex\n\nLiteral message.")).value!;
    const markdown = renderMarkdown(parsed, { contentKind: kind, sourceFile: "source.txt", sourceFormat: "txt", title: "source", convertedAt: "fixed" });
    expect(markdown).toBe([
      "---", 'type: "shared-text"', 'source: "shared-text"', 'source_file: "source.txt"',
      'source_format: "txt"', `content_kind: "${kind}"`, "soundings_version: 3", 'converted_at: "fixed"', "---", "", "# source", "",
      "## Summary", "", "> Not generated. Add a summary manually or with an approved enrichment workflow.", "",
      "## Decisions", "", "## Action Items", "", "## Follow-ups", "", "## Source Text", "",
      "~~~text", "From: Alex", "", "Literal message.", "~~~", ""
    ].join("\n"));
  });

  it("keeps near-limit literal content complete and rejects unsafe decoding", () => {
    const text = "From: Alex\n~~~\n".repeat(300_000);
    const parsed = parseTranscript("txt", encoder.encode(text)).value!;
    expect(parsed.blocks[0].text).toBe(text);
    const markdown = renderMarkdown(parsed, { contentKind: "notes", sourceFile: "large.txt", sourceFormat: "txt", title: "large", convertedAt: "fixed" });
    expect(markdown).toContain(text);
    expect(parseTranscript("txt", new Uint8Array([0xc3, 0x28])).ok).toBe(false);
    expect(parseTranscript("txt", new Uint8Array()).ok).toBe(false);
  });

  it("isolates a missing shared-text source from a valid selected transcript", async () => {
    const { files, adapter, original, options } = await setup();
    files.set("two.txt", encoder.encode("ordinary text"));
    const second = (await discoverTranscriptFile(adapter, { path: "two.txt", extension: "txt", size: 13, isFile: true }, settings, testDigest))!;
    const base = buildPlan([...original.items, second], new Set(), settings, new Date(0), () => "mixed");
    const plan = reviseContentKind(base, "one.txt", "chat").value!;
    files.delete("one.txt");
    const outcomes = await executePlan(plan, adapter, { ...options, selectedSourcePaths: new Set(["one.txt", "two.txt"]) });
    expect(outcomes.map((entry) => entry.status)).toEqual(["stale", "created"]);
    expect(files.has("one.md")).toBe(false);
    expect(decoder.decode(files.get("two.md"))).not.toContain("content_kind");
  });
  it.each(kinds)("creates complete literal %s output for every display/timing combination", async (kind) => {
    for (const transcriptDisplay of ["plain", "folded-callout"] as const) {
      for (const timestampPolicy of ["omit", "retain"] as const) {
        const { files, adapter, original, options } = await setup();
        const config = { ...settings, outputProfile: { ...DEFAULT_OUTPUT_PROFILE, transcriptDisplay, timestampPolicy } };
        const base = buildPlan(original.items, new Set(), config, new Date(0), () => "combo");
        const plan = reviseContentKind(base, "one.txt", kind).value!;
        expect((await executePlan(plan, adapter, { ...options, settings: config }))[0].status).toBe("created");
        const markdown = decoder.decode(files.get("one.md"));
        expect(markdown).toContain(`content_kind: "${kind}"`);
        expect(markdown).toContain('type: "shared-text"\nsource: "shared-text"');
        expect(markdown).toContain("soundings_version: 3");
        expect(markdown).toContain("## Source Text");
        expect(markdown).not.toContain("**Time:**");
        const unfolded = markdown.split("\n").map((line) => line.startsWith("> ") ? line.slice(2) : line === ">" ? "" : line).join("\n");
        expect(unfolded).toContain(source);
        expect(markdown.includes("Full Source Text")).toBe(transcriptDisplay === "folded-callout");
        expect(files.get("one.txt")).toEqual(encoder.encode(source));
      }
    }
  });

  it.each(["plain", "folded-callout"] as const)("contains adversarial text and metadata in %s", async (transcriptDisplay) => {
    const text = "From: Alex <alex@example.test>\n\n# Heading\n~~~\n> [!note] literal\n![[embed]]\n<b>hello</b> &amp;\n\u017deljko\n";
    const parsed = parseTranscript("txt", encoder.encode("\ufeff" + text.replaceAll("\n", "\r\n"))).value!;
    const markdown = renderMarkdown(parsed, { contentKind: "correspondence", sourceFile: 'one\"\u0085.txt', sourceFormat: "txt", title: "%%$==", convertedAt: "fixed" }, { ...DEFAULT_OUTPUT_PROFILE, transcriptDisplay, enabledSections: [], staticTags: ["shared"] });
    const html = micromark(markdown);
    expect(html).toContain("&lt;b&gt;hello&lt;/b&gt;");
    expect(html).not.toContain("<b>hello</b>");
    expect(markdown).toContain("\\u0085");
    expect(markdown).not.toContain("## Decisions");
    expect(markdown).toContain('tags: ["shared"]');
    expect((html.match(/<blockquote>/g) ?? []).length).toBe(transcriptDisplay === "plain" ? 0 : 1);
  });

  it.each(["revision", "kind", "policy", "source", "settings", "destination", "cancel", "read-fail", "create-fail", "readback"])("retains %s safety", async (mode) => {
    const { files, adapter, plan, options } = await setup();
    let candidate = plan;
    const controller = new AbortController();
    let config = settings;
    if (mode === "kind") candidate = { ...plan, items: [{ ...plan.items[0], contentKind: "chat" }] };
    if (mode === "policy") candidate = { ...plan, items: [{ ...plan.items[0], txtInterpretation: "plain" }] };
    if (mode === "source") files.set("one.txt", encoder.encode("changed"));
    if (mode === "settings") config = { ...settings, txtLayout: "plain" as never };
    if (mode === "destination") files.set("ONE.md", encoder.encode("protected"));
    if (mode === "cancel") controller.abort();
    const guarded: PublicationAdapter = { ...adapter,
      readBinary: async (path) => {
        if (mode === "read-fail" && path === "one.txt") throw new Error("private failure");
        if (mode === "readback" && path === "one.md") return encoder.encode("bad");
        return adapter.readBinary(path);
      },
      createBinary: async (path, bytes) => { if (mode === "create-fail") throw new Error("private failure"); await adapter.createBinary(path, bytes); }
    };
    const outcomes = await executePlan(candidate, guarded, { ...options, selectedPlanRevision: mode === "revision" ? 0 : plan.revision, settings: config, signal: controller.signal });
    expect(outcomes[0].status).toBe(mode === "cancel" ? "canceled" : mode === "destination" ? "blocked" : mode === "create-fail" ? "failed" : mode === "readback" ? "needs-attention" : "stale");
    expect(files.has("one.md")).toBe(mode === "readback");
    expect(JSON.stringify(outcomes)).not.toContain("private failure");
  });

  it.each(["kind", "revision", "layout", "settings", "cancel", "race"])("refuses unreviewed %s during asynchronous reads", async (mode) => {
    const { files, adapter, plan, options } = await setup();
    const item = { ...plan.items[0] };
    const mutable = { ...plan, items: [item] };
    const config = { ...settings };
    const controller = new AbortController();
    const guarded = { ...adapter, readBinary: async (path: string) => {
      if (path === "one.txt") {
        if (mode === "kind") item.contentKind = "chat";
        if (mode === "revision") mutable.revision = 9;
        if (mode === "layout") mutable.txtLayout = "plain";
        if (mode === "settings") config.maxSourceBytes = 1;
        if (mode === "cancel") controller.abort();
        if (mode === "race") files.set("ONE.md", encoder.encode("protected"));
      }
      return adapter.readBinary(path);
    } };
    expect((await executePlan(mutable, guarded, { ...options, settings: config, signal: controller.signal }))[0].status).toBe(mode === "cancel" ? "canceled" : mode === "race" ? "blocked" : "stale");
    expect(files.has("one.md")).toBe(false);
    expect(files.get("one.txt")).toEqual(encoder.encode(source));
  });
});

describe("shared-text companions", () => {
  it("refuses unreadable oversized and unlinkable shared notes", async () => {
    const { files, adapter, plan, options } = await setup();
    await executePlan(plan, adapter, options);
    const bytes = files.get("one.md")!;
    const digest = (data: Uint8Array) => sha256(data, testDigest);
    expect((await identifySourceNote("one.md", bytes, 1, digest)).ok).toBe(false);
    expect((await identifySourceNote("one.md", new Uint8Array([0xc3, 0x28]), 5_000_000, digest)).ok).toBe(false);
    expect((await identifySourceNote("one|other.md", bytes, 5_000_000, digest)).error).toBe("source-note-unlinkable");
    expect((await identifySourceNote("one.md", encoder.encode('content_kind: "notes"'), 5_000_000, digest)).ok).toBe(false);
  });
  it.each(["stale", "kind-change", "race", "cancel", "read-fail", "create-fail", "readback"])("retains companion %s protection", async (mode) => {
    const { files, adapter, plan, options } = await setup();
    await executePlan(plan, adapter, options);
    const sourceBefore = files.get("one.txt")!.slice();
    const noteBefore = files.get("one.md")!.slice();
    const evidence = (await identifySourceNote("one.md", noteBefore, 5_000_000, (bytes) => sha256(bytes, testDigest))).value!;
    const companion = buildEnrichmentPlan("one.md", evidence, draft, new Set(files.keys()), new Date(0), "companion");
    if (mode === "stale") files.set("one.md", encoder.encode(decoder.decode(noteBefore) + "changed"));
    if (mode === "kind-change") files.set("one.md", encoder.encode(decoder.decode(noteBefore).replace('content_kind: "notes"', 'content_kind: "chat"')));
    const controller = new AbortController();
    const guarded: PublicationAdapter = { ...adapter,
      readBinary: async (path) => {
        if (path === "one.md" && mode === "read-fail") throw new Error("private");
        if (path === "one.md" && mode === "cancel") controller.abort();
        if (path.endsWith("Enrichment.md") && mode === "readback") return encoder.encode("corrupt");
        return adapter.readBinary(path);
      },
      createBinary: async (path, bytes) => {
        if (mode === "create-fail") throw new Error("private");
        if (mode === "race") files.set(path.toUpperCase(), encoder.encode("protected"));
        await adapter.createBinary(path, bytes);
      }
    };
    const outcome = await executeEnrichmentPlan(companion, guarded, { digest: testDigest, maxSourceBytes: 5_000_000, signal: controller.signal });
    expect(outcome.status).toBe(mode === "cancel" ? "canceled" : mode === "race" ? "blocked" : mode === "create-fail" ? "failed" : mode === "readback" ? "needs-attention" : "stale");
    expect(files.get("one.txt")).toEqual(sourceBefore);
    if (mode !== "stale" && mode !== "kind-change") expect(files.get("one.md")).toEqual(noteBefore);
    expect(JSON.stringify(outcome)).not.toContain("private");
  });

  it.each(kinds)("publishes a guarded companion for %s", async (kind) => {
    const { files, adapter, original, options } = await setup();
    const plan = reviseContentKind(original, "one.txt", kind).value!;
    await executePlan(plan, adapter, options);
    const before = new Map(files);
    const evidence = (await identifySourceNote("one.md", files.get("one.md")!, 5_000_000, (bytes) => sha256(bytes, testDigest))).value!;
    const companion = buildEnrichmentPlan("one.md", evidence, draft, new Set(files.keys()), new Date(0), "companion");
    expect((await executeEnrichmentPlan(companion, adapter, { digest: testDigest, maxSourceBytes: 5_000_000 })).status).toBe("created");
    expect(decoder.decode(files.get("one - Enrichment.md"))).toContain("[[one|Back to Source Note]]");
    for (const [path, bytes] of before) expect(files.get(path)).toEqual(bytes);
    expect((await executeEnrichmentPlan(companion, adapter, { digest: testDigest, maxSourceBytes: 5_000_000 })).status).toBe("blocked");
  });

  it.each(["missing", "duplicate", "format", "kind", "schema", "tuple"])("rejects %s identity", async (mode) => {
    let body = '---\ntype: "shared-text"\nsource: "shared-text"\nsource_format: "txt"\ncontent_kind: "notes"\nsoundings_version: 3\n---\n# Note';
    if (mode === "missing") body = body.replace('content_kind: "notes"\n', "");
    if (mode === "duplicate") body = body.replace('content_kind: "notes"', 'content_kind: "notes"\ncontent_kind: "chat"');
    if (mode === "format") body = body.replace('"txt"', '"vtt"');
    if (mode === "kind") body = body.replace('"notes"', '"unknown"');
    if (mode === "schema") body = body.replace("version: 3", "version: 4");
    if (mode === "tuple") body = body.replace('type: "shared-text"', 'type: "meeting-transcript"');
    expect((await identifySourceNote("one.md", encoder.encode(body), 5_000_000, (bytes) => sha256(bytes, testDigest))).ok).toBe(false);
  });
});
