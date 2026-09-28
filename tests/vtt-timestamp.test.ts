import { describe, expect, it } from "vitest";
import { parseTranscript } from "../src/core/parsers";

describe("VTT timestamp compatibility", () => {
  const testCases = [
    { 
      name: "hours included", 
      content: "WEBVTT\n\n00:01:02.000 --> 00:01:05.000\nHello", 
      shouldParse: true 
    },
    { 
      name: "hours omitted", 
      content: "WEBVTT\n\n01:02.000 --> 01:05.000\nHello", 
      shouldParse: true 
    },
    { 
      name: "malformed hours", 
      content: "WEBVTT\n\n00:61:02.000 --> 00:61:05.000\nHello", 
      shouldParse: false 
    },
    { 
      name: "malformed minutes", 
      content: "WEBVTT\n\n01:61.000 --> 01:65.000\nHello", 
      shouldParse: false 
    }
  ];

  testCases.forEach(({ name, content, shouldParse }) => {
    it(`handles ${name}`, () => {
      const bytes = new TextEncoder().encode(content);
      const result = parseTranscript("vtt", bytes);
      expect(result.ok).toBe(shouldParse);
    });
  });
});
