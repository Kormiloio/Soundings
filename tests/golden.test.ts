import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseTranscript } from "../src/core/parsers";
import { renderMarkdown } from "../src/core/rendering";
import type { TranscriptFormat } from "../src/core/types";

const root = join(process.cwd(), "tests/fixtures");
const convertedAt = "2026-09-22T14:30:00.000Z";

async function convert(sourceFile: string, format: TranscriptFormat): Promise<string> {
  const parsed = parseTranscript(format, await readFile(join(root, sourceFile)));
  if (!parsed.ok || !parsed.value) throw new Error(parsed.error);
  return renderMarkdown(parsed.value, {
    sourceFile,
    sourceFormat: format,
    title: sourceFile.slice(0, sourceFile.lastIndexOf(".")),
    convertedAt
  });
}

describe("golden conversions", () => {
  it.each([
    ["plain-unicode.txt", "txt", "expected-plain.md"],
    ["zoom-voice.vtt", "vtt", "expected-zoom.md"]
  ] as const)("converts %s deterministically", async (source, format, expected) => {
    const first = await convert(source, format);
    expect(first).toBe(await readFile(join(root, expected), "utf8"));
    expect(await convert(source, format)).toBe(first);
  });
});
