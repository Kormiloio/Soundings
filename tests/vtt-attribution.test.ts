import { describe, expect, it } from "vitest";
import { decodeUtf8, parseVtt } from "../src/core/parsers";

function cue(payload: string): string {
  return `WEBVTT\n\n00:00.000 --> 00:01.000\n${payload}`;
}

function blocksOf(payload: string): ReadonlyArray<{ readonly speaker?: string; readonly text: string }> {
  const parsed = parseVtt(cue(payload));
  expect(parsed.ok).toBe(true);
  return (parsed.value?.blocks ?? []).map(({ speaker, text }) => (speaker ? { speaker, text } : { text }));
}

describe("closing voice tags", () => {
  it("gives text after a closing voice tag no speaker", () => {
    expect(blocksOf("<v Alice>hi</v> narrator <v Bob>yo")).toEqual([
      { speaker: "Alice", text: "hi" },
      { text: "narrator" },
      { speaker: "Bob", text: "yo" }
    ]);
  });

  it("gives trailing text after the last closing voice tag no speaker", () => {
    expect(blocksOf("<v Alice>hi</v> [laughter]")).toEqual([
      { speaker: "Alice", text: "hi" },
      { text: "[laughter]" }
    ]);
  });

  it("keeps single-voice output unchanged when only whitespace follows the closing tag", () => {
    expect(blocksOf("<v Mario>Hello world</v>")).toEqual([{ speaker: "Mario", text: "Hello world" }]);
    const parsed = parseVtt(`${cue("<v Mario>Hello world</v>  ")}\n\n00:01.000 --> 00:02.000\nNext`);
    expect(parsed.value?.blocks.map(({ speaker, text }) => ({ speaker, text }))).toEqual([
      { speaker: "Mario", text: "Hello world  " },
      { speaker: undefined, text: "Next" }
    ]);
  });

  it("treats a closing voice tag without an open voice as markup only", () => {
    expect(blocksOf("before</v> after")).toEqual([{ text: "before after" }]);
  });

  it("does not split on allowed tags that follow a closing voice tag", () => {
    expect(blocksOf("<v Alice>hi</v><i>aside</i>")).toEqual([
      { speaker: "Alice", text: "hi" },
      { text: "aside" }
    ]);
  });
});

describe("strict voice-tag recognition", () => {
  it.each(["<video>x</video> hey", "<vfoo>x", "x</vbar>", "<V2 Bob>hi"])("refuses the unknown tag in %s", (payload) => {
    expect(parseVtt(cue(payload))).toEqual({ ok: false, error: "unsupported-vtt" });
  });

  it.each([
    ["<v>bare voice</v>", [{ text: "bare voice" }]],
    ["<v.loud>classed voice</v>", [{ text: "classed voice" }]],
    ["<V Bob>upper-case voice</V>", [{ speaker: "Bob", text: "upper-case voice" }]],
    ["<v\tBob>tab-separated voice", [{ speaker: "Bob", text: "tab-separated voice" }]]
  ])("accepts the voice markup in %s", (payload, expected) => {
    expect(blocksOf(payload)).toEqual(expected);
  });
});

describe("byte-order mark handling", () => {
  it("removes exactly one leading byte-order mark", () => {
    const decoded = decodeUtf8(new Uint8Array([0xef, 0xbb, 0xbf, 0xef, 0xbb, 0xbf, 0x41]));
    expect(decoded).toEqual({ ok: true, value: "﻿A" });
  });

  it("still removes a single byte-order mark", () => {
    expect(decodeUtf8(new Uint8Array([0xef, 0xbb, 0xbf, 0x41]))).toEqual({ ok: true, value: "A" });
  });
});
