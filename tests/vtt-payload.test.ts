import { describe, expect, it } from "vitest";
import { parseTranscript } from "../src/core/parsers";

describe("VTT cue payload compatibility", () => {
  const testCases = [
    { 
      name: "closed voice tag", 
      content: "WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n<v Mario>Hello world</v>", 
      expectedSpeaker: "Mario",
      expectedText: "Hello world"
    },
    { 
      name: "unclosed voice tag", 
      content: "WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n<v Mario>Hello world", 
      expectedSpeaker: "Mario",
      expectedText: "Hello world"
    },
    { 
      name: "voice tag with class", 
      content: "WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n<v.primary Mario>Hello world</v>", 
      expectedSpeaker: "Mario",
      expectedText: "Hello world"
    },
    { 
      name: "unsupported tag", 
      content: "WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n<unknown>Hello</unknown>", 
      shouldParse: false 
    }
  ];

  testCases.forEach(({ name, content, expectedSpeaker, expectedText, shouldParse }) => {
    it(`handles ${name}`, () => {
      const bytes = new TextEncoder().encode(content);
      const result = parseTranscript("vtt", bytes);
      
      if (shouldParse === false) {
        expect(result.ok).toBe(false);
        expect(result.error).toBe("unsupported-vtt");
        return;
      }

      expect(result.ok).toBe(true);
      const block = result.value?.blocks[0];
      expect(block?.speaker).toBe(expectedSpeaker);
      expect(block?.text).toBe(expectedText);
    });
  });

  const blocksOf = (content: string) => {
    const result = parseTranscript("vtt", new TextEncoder().encode(content));
    expect(result.ok).toBe(true);
    return result.value?.blocks.map(({ speaker, text, timing }) => ({ speaker, text, timing })) ?? [];
  };
  const timing = { start: "00:00:01.000", end: "00:00:05.000" };

  it("attributes each voice line in a cue to its own speaker", () => {
    expect(blocksOf("WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n<v Mario>Hello\n<v Luigi>Hi there")).toEqual([
      { speaker: "Mario", text: "Hello", timing },
      { speaker: "Luigi", text: "Hi there", timing }
    ]);
  });

  it("splits inline voice spans and keeps leading text unattributed", () => {
    expect(blocksOf("WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n[crosstalk] <v A>Yes</v> <v.loud B>No</v>")).toEqual([
      { speaker: undefined, text: "[crosstalk]", timing },
      { speaker: "A", text: "Yes", timing },
      { speaker: "B", text: "No", timing }
    ]);
  });

  it("rejects unsupported markup inside any voice span", () => {
    const result = parseTranscript("vtt", new TextEncoder().encode("WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n<v A>ok\n<v B><unknown>no"));
    expect(result).toEqual({ ok: false, error: "unsupported-vtt" });
  });

  it("ignores header metadata below the signature", () => {
    expect(blocksOf("WEBVTT\nKind: captions\nLanguage: en\n\n00:00:01.000 --> 00:00:05.000\nHello")).toEqual([
      { speaker: undefined, text: "Hello", timing }
    ]);
  });

  it("keeps a cue that directly follows the signature", () => {
    expect(blocksOf("WEBVTT\n00:00:01.000 --> 00:00:05.000\nHello")).toEqual([{ speaker: undefined, text: "Hello", timing }]);
  });

  it("treats whitespace-only lines as cue separators", () => {
    expect(blocksOf("WEBVTT\n\n00:00:01.000 --> 00:00:05.000\nOne\n \t\n00:00:06.000 --> 00:00:07.000\nTwo")).toEqual([
      { speaker: undefined, text: "One", timing },
      { speaker: undefined, text: "Two", timing: { start: "00:00:06.000", end: "00:00:07.000" } }
    ]);
  });

  it("fails closed when a separated chunk has no timing line", () => {
    const result = parseTranscript("vtt", new TextEncoder().encode("WEBVTT\n\n00:00:01.000 --> 00:00:05.000\nOne\n  \nstray\ntext"));
    expect(result).toEqual({ ok: false, error: "malformed-vtt" });
  });

  it("decodes character references exactly once", () => {
    expect(blocksOf("WEBVTT\n\n00:00:01.000 --> 00:00:05.000\nuse &amp;lt;b&amp;gt; &lt;tags&gt;")[0].text).toBe("use &lt;b&gt; <tags>");
  });
});
