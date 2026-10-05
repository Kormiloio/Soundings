import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseTranscript } from "../src/core/parsers";
import { renderMarkdown } from "../src/core/rendering";
import { DEFAULT_OUTPUT_PROFILE, type OutputProfile } from "../src/core/settings";
import type { TranscriptFormat } from "../src/core/types";

const root = join(process.cwd(), "tests/fixtures");
const convertedAt = "2026-09-22T14:30:00.000Z";

async function convert(
  sourceFile: string,
  format: TranscriptFormat,
  profile: OutputProfile = DEFAULT_OUTPUT_PROFILE,
  title = sourceFile.slice(0, sourceFile.lastIndexOf("."))
): Promise<string> {
  const parsed = parseTranscript(format, await readFile(join(root, sourceFile)));
  if (!parsed.ok || !parsed.value) throw new Error(parsed.error);
  return renderMarkdown(parsed.value, {
    sourceFile,
    sourceFormat: format,
    title,
    convertedAt
  }, profile);
}

describe("golden conversions", () => {
  it.each([
    ["plain", "omit", "expected-srt-plain.md"],
    ["plain", "retain", "expected-srt-timestamps.md"],
    ["folded-callout", "omit", "expected-srt-folded.md"],
    ["folded-callout", "retain", "expected-srt-folded-timestamps.md"]
  ] as const)("renders SRT with %s display and %s timestamps", async (transcriptDisplay, timestampPolicy, expected) => {
    expect(await convert("captions.srt", "srt", { ...DEFAULT_OUTPUT_PROFILE, transcriptDisplay, timestampPolicy }))
      .toBe(await readFile(join(root, expected), "utf8"));
  });
  it.each([
    ["plain-unicode.txt", "txt", "omit", "expected-folded-plain.md"],
    ["zoom-voice.vtt", "vtt", "omit", "expected-folded-zoom.md"],
    ["zoom-voice.vtt", "vtt", "retain", "expected-folded-timestamps.md"]
  ] as const)("renders folded %s with %s timestamps", async (source, format, timestampPolicy, expected) => {
    const profile: OutputProfile = { ...DEFAULT_OUTPUT_PROFILE, transcriptDisplay: "folded-callout", timestampPolicy };
    expect(await convert(source, format, profile)).toBe(await readFile(join(root, expected), "utf8"));
  });
  it.each([
    ["plain-unicode.txt", "txt", "expected-plain.md"],
    ["zoom-voice.vtt", "vtt", "expected-zoom.md"]
  ] as const)("converts %s deterministically", async (source, format, expected) => {
    const first = await convert(source, format);
    expect(first).toBe(await readFile(join(root, expected), "utf8"));
    expect(await convert(source, format)).toBe(first);
  });

  it("renders the representative customized profile byte-for-byte", async () => {
    const profile: OutputProfile = {
      titlePattern: "parent-folder-source-name",
      destinationNamePattern: "source-name-note",
      enabledSections: ["summary", "action-items"],
      staticTags: ["project/alpha", "conversation"],
      timestampPolicy: "retain",
      transcriptDisplay: "plain"
    };
    const first = await convert("zoom-voice.vtt", "vtt", profile, "Calls — zoom-voice");
    expect(first).toBe(await readFile(join(root, "expected-custom-profile.md"), "utf8"));
    expect(await convert("zoom-voice.vtt", "vtt", profile, "Calls — zoom-voice")).toBe(first);
  });
});
