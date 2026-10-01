import { describe, expect, it } from "vitest";
import { parseTranscript, parseVtt } from "../src/core/parsers";
import { renderMarkdown } from "../src/core/rendering";
import type { NoteMetadata } from "../src/core/types";

const BUDGET_MS = 500;
const MEGABYTE = 1024 * 1024;

function cue(payload: string): string {
  return `WEBVTT\n\n00:00.000 --> 00:01.000\n${payload}`;
}

function repeatTo(unit: string, bytes: number): string {
  return unit.repeat(Math.ceil(bytes / unit.length));
}

function timed<T>(run: () => T): { readonly result: T; readonly elapsed: number } {
  const started = performance.now();
  const result = run();
  return { result, elapsed: performance.now() - started };
}

const metadata: NoteMetadata = {
  sourceFile: "Bounds.txt",
  sourceFormat: "txt",
  title: "Bounds",
  convertedAt: "2026-09-30T00:00:00.000Z"
};

describe("bounded WebVTT markup processing", () => {
  const adversarial = [
    { name: "repeated voice-class openers", payload: repeatTo("<v.", MEGABYTE) },
    { name: "repeated voice openers", payload: repeatTo("<v ", MEGABYTE) },
    { name: "repeated unterminated angle brackets", payload: repeatTo("<", MEGABYTE) },
    { name: "repeated voice-class openers closed once", payload: `${repeatTo("<v.", MEGABYTE)}>` },
    { name: "repeated angle brackets closed once", payload: `${repeatTo("<", MEGABYTE)}>` },
    { name: "many short class groups on one class tag", payload: `<c${".a".repeat(60)} x>text` }
  ];

  for (const { name, payload } of adversarial) {
    it(`classifies ${name} within the time budget`, () => {
      const { elapsed } = timed(() => parseVtt(cue(payload)));
      expect(elapsed).toBeLessThan(BUDGET_MS);
    });
  }

  it("refuses a tag longer than 256 characters", () => {
    expect(parseVtt(cue(`<c.${"a".repeat(300)}>text</c>`))).toEqual({ ok: false, error: "unsupported-vtt" });
    expect(parseVtt(cue(`${repeatTo("<v.", 4096)}>`))).toEqual({ ok: false, error: "unsupported-vtt" });
  });

  it("accepts a tag at the 256-character limit", () => {
    const tag = `c.${"a".repeat(254)}`;
    expect(tag).toHaveLength(256);
    const parsed = parseVtt(cue(`<${tag}>text</c>`));
    expect(parsed.ok).toBe(true);
    expect(parsed.value?.blocks[0]?.text).toBe("text");
  });

  it("keeps an unterminated angle bracket as literal text", () => {
    const parsed = parseVtt(cue("a < b and <v Mario"));
    expect(parsed.ok).toBe(true);
    expect(parsed.value?.blocks[0]?.text).toBe("a < b and <v Mario");
  });

  it("refuses a tag body that contains another angle bracket", () => {
    expect(parseVtt(cue("a <<i>x</i>"))).toEqual({ ok: false, error: "unsupported-vtt" });
    expect(parseVtt(cue("x <</v> y"))).toEqual({ ok: false, error: "unsupported-vtt" });
  });

  it("keeps an empty angle-bracket pair as literal text", () => {
    const parsed = parseVtt(cue("a <> b"));
    expect(parsed.value?.blocks[0]?.text).toBe("a <> b");
  });

  it("accepts class groups on the class tag without backtracking", () => {
    const parsed = parseVtt(cue(`<c${".a".repeat(60)}>text</c>`));
    expect(parsed.value?.blocks[0]?.text).toBe("text");
  });

  it("processes many small allowed tags in linear time", () => {
    const { result, elapsed } = timed(() => parseVtt(cue(repeatTo("<i>a</i> ", MEGABYTE))));
    expect(elapsed).toBeLessThan(BUDGET_MS);
    expect(result.ok).toBe(true);
  });

  it("processes many multi-voice spans in linear time", () => {
    const payload = repeatTo("<v Alice>hi <v Bob>yo ", MEGABYTE);
    const { result, elapsed } = timed(() => parseVtt(cue(payload)));
    expect(elapsed).toBeLessThan(BUDGET_MS);
    expect(result.ok).toBe(true);
  });
});

describe("bounded fence sizing", () => {
  it("renders 150,000 separate tilde runs without a stack error", () => {
    const text = "~ ".repeat(150_000) + "~~~~~~~";
    const parsed = parseTranscript("txt", new TextEncoder().encode(text));
    expect(parsed.ok).toBe(true);
    const { result: markdown, elapsed } = timed(() => renderMarkdown(parsed.value!, metadata));
    expect(elapsed).toBeLessThan(BUDGET_MS);
    expect(markdown).toContain(`\n${"~".repeat(8)}text\n`);
  });
});
