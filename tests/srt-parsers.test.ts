import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseSrt, parseTranscript } from "../src/core/parsers";
import { renderMarkdown } from "../src/core/rendering";

const encoder = new TextEncoder();
const cue = (text = "hello", start = "00:00:01,250", end = "00:00:03,000") => `1\n${start} --> ${end}\n${text}`;

describe("SubRip parser", () => {
  it("preserves multiline, overlapping and repeated cues without speaker inference", async () => {
    const result = parseTranscript("srt", await readFile("tests/fixtures/captions.srt"));
    expect(result.value?.blocks).toEqual([
      { text: "Alice: Silver lantern.\nSecond line stays here.", timing: { start: "00:00:01.250", end: "00:00:03.000" } },
      { text: "Bob: Repeat this.", timing: { start: "00:00:02.500", end: "00:00:04.000" } },
      { text: "Bob: Repeat this.", timing: { start: "00:00:04.000", end: "00:00:05.500" } }
    ]);
  });

  it.each(["\n", "\r\n", "\r"])("decodes BOM, Unicode and %j line endings", (newline) => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...encoder.encode(cue("  \u010d\u017e\u4e16\u754c  \nnext\t").replaceAll("\n", newline))]);
    expect(parseTranscript("srt", bytes).value?.blocks[0].text).toBe("  \u010d\u017e\u4e16\u754c  \nnext\t");
  });

  it("accepts EOF, whitespace separators, and leading zeros without numeric precision loss", () => {
    const text = `${cue()}\n \t\n${cue("second", "09007199254740992:00:00,000", "9007199254740993:00:00,000")}`;
    expect(parseSrt(text).value?.blocks).toHaveLength(2);
    expect(parseSrt(cue("same hour", "0001:59:59,999", "01:59:59,999")).ok).toBe(false);
  });

  it("preserves markup and entities literally", async () => {
    const text = await readFile("tests/fixtures/adversarial.srt", "utf8");
    expect(parseSrt(text).value?.blocks[0]).toMatchObject({ text: text.split("\n").slice(2).join("\n").trimEnd() });
    expect(parseSrt(text).value?.blocks[0].speaker).toBeUndefined();
  });

  it.each([
    "hello", "0\n00:00:01,000 --> 00:00:02,000\nx", "00:00:01,000 --> 00:00:02,000\nx",
    "1 00:00:01,000 --> 00:00:02,000\nx", "1\n00:00:01,000 --> 00:00:02,000",
    cue("x", "00:60:01,000"), cue("x", "00:00:61,000"), cue("x", "00:00:01.250"),
    cue("x", "00:00:01,25"), cue("x", "00:00:03,000"), cue("x", "00:00:04,000"),
    "1\n00:00:01,000 --> 00:00:02,000 position:10%\nx", `${cue()}\n\n2\ninvalid\nx`, `${cue()}\n2\n00:00:03,000 --> 00:00:04,000\nx`
  ])("rejects malformed source without partial output: %j", (text) => {
    expect(parseSrt(text)).toEqual({ ok: false, error: "malformed-srt" });
  });

  it.each(["malformed.srt", "missing-separator.srt"])("rejects %s entirely", async (name) => {
    expect(parseTranscript("srt", await readFile(`tests/fixtures/${name}`))).toEqual({ ok: false, error: "malformed-srt" });
  });

  it("classifies empty sources and rejects invalid UTF-8 without TXT fallback", () => {
    for (const text of ["", " \t\r\n"]) expect(parseTranscript("srt", encoder.encode(text))).toEqual({ ok: false, error: "empty" });
    expect(parseTranscript("srt", new Uint8Array([0xc3, 0x28]))).toEqual({ ok: false, error: "unsupported-encoding" });
    expect(parseTranscript("srt", new Uint8Array([0xef, 0xbb, 0xbf]))).toEqual({ ok: false, error: "empty" });
    expect(parseTranscript("txt", encoder.encode(cue())).value?.blocks).toEqual([{ text: cue() }]);
  });

  it.each(["9".repeat(1_000_000), `1\n${"0:".repeat(500_000)}`, `${cue()}\n${"1\n-->\n".repeat(170_000)}`])("bounds adversarial input", (text) => {
    const before = performance.now();
    parseSrt(text);
    const elapsed = performance.now() - before;
    expect(elapsed).toBeLessThan(500);
    process.stdout.write(`SRT adversarial classification: ${text.length} characters, ${elapsed.toFixed(1)} ms.\n`);
  });

  it("preserves a near-5 MB valid source and renders without stack errors", () => {
    const payload = "safe caption ".repeat(70);
    const single = cue(payload);
    const count = Math.floor(4_990_000 / (single.length + 2));
    const text = Array.from({ length: count }, () => single).join("\n\n");
    const before = performance.now();
    const parsed = parseSrt(text).value!;
    expect(parsed.blocks).toHaveLength(count);
    expect(parsed.blocks.every((block) => block.text === payload)).toBe(true);
    const markdown = renderMarkdown(parsed, { sourceFile: "large.srt", sourceFormat: "srt", title: "Large", convertedAt: "fixed" });
    expect(markdown.split(payload)).toHaveLength(count + 1);
    const elapsed = performance.now() - before;
    expect(elapsed).toBeLessThan(2000);
    process.stdout.write(`SRT near-limit rehearsal: ${text.length} bytes, ${count} cues, ${elapsed.toFixed(1)} ms parse/render, all cues preserved.\n`);
  });
});
