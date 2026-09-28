import { describe, expect, it } from "vitest";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { sha256 } from "../src/core/hash";

const testDigest = async (data: Uint8Array) => await sha256(data, async (algorithm, buffer) => {
  return await crypto.subtle.digest(algorithm, buffer);
});
const encoder = new TextEncoder();

describe("source note identification", () => {
  it("identifies a valid Soundings note", async () => {
    const content = "---\ntype: \"meeting-transcript\"\nsoundings_version: 1\n---\n# Title";
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
    const content = "---\ntype: \"meeting-transcript\"\nsoundings_version: 1\n---\n# Title";
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
    const content = "---\ntype: \"something-else\"\nsoundings_version: 1\n---\n# Title";
    const bytes = encoder.encode(content);
    const result = await identifySourceNote("note.md", bytes, 5_000_000, testDigest);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid-soundings-note");
  });

  it("rejects notes with missing version", async () => {
    const content = "---\ntype: \"meeting-transcript\"\n---\n# Title";
    const bytes = encoder.encode(content);
    const result = await identifySourceNote("note.md", bytes, 5_000_000, testDigest);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid-soundings-note");
  });

  it("rejects notes with invalid version format", async () => {
    const content = "---\ntype: \"meeting-transcript\"\nsoundings_version: abc\n---\n# Title";
    const bytes = encoder.encode(content);
    const result = await identifySourceNote("note.md", bytes, 5_000_000, testDigest);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("invalid-soundings-note");
  });
});
