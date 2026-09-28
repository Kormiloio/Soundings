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
      name: "multiple voice lines per cue", 
      content: "WEBVTT\n\n00:00:01.000 --> 00:00:05.000\n<v Mario>Hello\n<v Luigi>Hi there", 
      expectedSpeaker: "Mario",
      expectedText: "Hello\nHi there"
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
});
