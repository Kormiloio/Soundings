import { describe, expect, it } from "vitest";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { sha256 } from "../src/core/hash";

const testDigest = async (data: Uint8Array) => await sha256(data, async (algorithm, buffer) => {
  return await crypto.subtle.digest(algorithm, buffer);
});
const encoder = new TextEncoder();

describe("source note identification", () => {
  it("identifies a valid Soundings note", async () => {
    const content = "---\ntype: \"meeting-transcript\"\nsource: \"transcript\"\nsoundings_version: 1\n---\n# Title";
    const bytes = encoder.encode(content);
    const result = await identifySourceNote("note.md", bytes, 5_000_000, testDigest);
    expect(result.ok).toBe(true);
    expect(result.value).toMatchObject({
      path: "note.md",
      soundingsVersion: 1,
      byteLength: bytes.byteLength
    });
  });

  it("rejects oversized notes", async () => {
    const content = "---\ntype: \"meeting-transcript\"\nsource: \"transcript\"\nsoundings_version: 1\n---\n# Title";
    const bytes = encoder.encode(content);
    const result = await identifySourceNote("note.md", bytes, 10, testDigest);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid-soundings-note");
  });

  it("rejects notes without frontmatter", async () => {
    const bytes = encoder.encode("# Just a title");
    const result = await identifySourceNote("note.md", bytes, 5_000_000, testDigest);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid-soundings-note");
  });

  it("rejects notes with wrong type", async () => {
    const content = "---\ntype: \"something-else\"\nsource: \"transcript\"\nsoundings_version: 1\n---\n# Title";
    const bytes = encoder.encode(content);
    const result = await identifySourceNote("note.md", bytes, 5_000_000, testDigest);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid-soundings-note");
  });

  it("rejects notes with missing version", async () => {
    const content = "---\ntype: \"meeting-transcript\"\nsource: \"transcript\"\n---\n# Title";
    const bytes = encoder.encode(content);
    const result = await identifySourceNote("note.md", bytes, 5_000_000, testDigest);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid-soundings-note");
  });

  it("rejects notes with invalid version format", async () => {
    const content = "---\ntype: \"meeting-transcript\"\nsource: \"transcript\"\nsoundings_version: abc\n---\n# Title";
    const bytes = encoder.encode(content);
    const result = await identifySourceNote("note.md", bytes, 5_000_000, testDigest);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid-soundings-note");
  });

  it("accepts the configured-output schema", async () => {
    const content = "---\ntype: meeting-transcript\nsource: transcript\nsoundings_version: 2\n---\n# Title";
    const result = await identifySourceNote("note.md", encoder.encode(content), 5_000_000, testDigest);
    expect(result.value?.soundingsVersion).toBe(2);
  });

  it.each([
    ["type prefix", "type: meeting-transcript-lookalike\nsource: transcript\nsoundings_version: 1"],
    ["wrong source", "type: meeting-transcript\nsource: imported\nsoundings_version: 1"],
    ["unsupported schema", "type: meeting-transcript\nsource: transcript\nsoundings_version: 999"],
    ["version suffix", "type: meeting-transcript\nsource: transcript\nsoundings_version: 1beta"],
    ["duplicate type", "type: meeting-transcript\ntype: meeting-transcript\nsource: transcript\nsoundings_version: 1"]
  ])("rejects %s metadata", async (_label, frontmatter) => {
    const result = await identifySourceNote("note.md", encoder.encode(`---\n${frontmatter}\n---\n# Title`), 5_000_000, testDigest);
    expect(result).toEqual({ ok: false, error: "invalid-soundings-note" });
  });
});
