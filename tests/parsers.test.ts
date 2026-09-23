import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { decodeUtf8, parseTranscript, parseTxt, parseVtt } from "../src/core/parsers";

const encoder = new TextEncoder();
const fixture = async (name: string) => readFile(join(process.cwd(), "tests/fixtures", name));

describe("transcript parsers", () => {
  it("strictly decodes BOM, CRLF, and Unicode", () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...encoder.encode("č\r\nž\r")]);
    expect(decodeUtf8(bytes)).toEqual({ ok: true, value: "č\nž\n" });
  });

  it("rejects invalid UTF-8", () => {
    expect(decodeUtf8(new Uint8Array([0xc3, 0x28]))).toEqual({ ok: false, error: "unsupported-encoding" });
  });

  it("preserves plain text without speaker inference", () => {
    const text = "Mario: Hello\n\nRepeated\nRepeated";
    const result = parseTxt(text);
    expect(result.value?.blocks).toEqual([{ text }]);
    expect(result.value?.blocks[0].speaker).toBeUndefined();
    expect(parseTxt("")).toEqual({ ok: false, error: "empty" });
  });

  it("parses Zoom-style WebVTT and explicit speakers", async () => {
    const result = parseTranscript("vtt", await fixture("zoom-voice.vtt"));
    expect(result.ok).toBe(true);
    expect(result.value?.blocks).toEqual([
      { speaker: "Mario", text: "We need to understand the migration." },
      { speaker: "Katie", text: "Agreed & documented." }
    ]);
  });

  it("retains repeated adjacent captions", async () => {
    const result = parseTranscript("vtt", await fixture("repeated.vtt"));
    expect(result.value?.blocks.map((block) => block.text)).toEqual(["Repeat this.", "Repeat this."]);
  });

  it("rejects malformed and unsupported WebVTT", async () => {
    expect(parseTranscript("vtt", await fixture("malformed.vtt"))).toEqual({ ok: false, error: "malformed-vtt" });
    expect(parseVtt("WEBVTT\n\nSTYLE\n::cue { color: red; }")).toEqual({ ok: false, error: "unsupported-vtt" });
    expect(parseVtt("WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n<script>x</script>")).toEqual({ ok: false, error: "unsupported-vtt" });
  });
});
