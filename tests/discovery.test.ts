import { describe, expect, it, vi } from "vitest";
import { discoverTranscripts, formatForPath, type DiscoveryAdapter } from "../src/core/discovery";
import { DEFAULT_SETTINGS, type SoundingsSettings } from "../src/core/settings";
import type { VaultFileRef } from "../src/core/types";
import { testDigest } from "./test-crypto";

const encoder = new TextEncoder();

function adapter(files: VaultFileRef[], contents: Record<string, Uint8Array | Error>): DiscoveryAdapter & { reads: string[] } {
  const reads: string[] = [];
  return {
    reads,
    listFiles: () => files,
    readBinary: async (path) => {
      reads.push(path);
      const value = contents[path];
      if (value instanceof Error || value === undefined) throw value ?? new Error("missing");
      return value;
    },
    yieldControl: vi.fn(async () => undefined)
  };
}

function file(path: string, size = 4, isFile = true): VaultFileRef {
  return { path, size, isFile, extension: path.split(".").pop() ?? "" };
}

describe("discovery", () => {
  it.each([["a.TXT", "txt"], ["nested/a.VtT", "vtt"], ["a.md", undefined]])(
    "recognizes %s",
    (path, expected) => expect(formatForPath(path)).toBe(expected)
  );

  it("finds nested supported files and ignores unsupported or non-files", async () => {
    const vault = adapter(
      [file("Projects/A/one.TXT"), file("two.md"), file("Folder.txt", 0, false)],
      { "Projects/A/one.TXT": encoder.encode("hello") }
    );
    const result = await discoverTranscripts(vault, DEFAULT_SETTINGS, undefined, 50, testDigest);
    expect(result.items.map((item) => item.sourcePath)).toEqual(["Projects/A/one.TXT"]);
    expect(result.items[0].classification).toBe("eligible");
  });

  it("excludes hidden and configured paths before reading", async () => {
    const settings: SoundingsSettings = { ...DEFAULT_SETTINGS, excludedPaths: ["Config", ".soundings", "Archive"] };
    const vault = adapter(
      [file("Config/private.txt"), file(".hidden/private.txt"), file(".soundings/private.txt"), file("Archive/old.txt"), file("Nested/ok.txt")],
      { "Nested/ok.txt": encoder.encode("ok") }
    );
    const result = await discoverTranscripts(vault, settings, undefined, 50, testDigest);
    expect(vault.reads).toEqual(["Nested/ok.txt"]);
    expect(result.items.map((item) => item.classification)).toEqual(["excluded", "excluded", "excluded", "excluded", "eligible"]);
  });

  it("isolates unreadable, empty, and oversize items", async () => {
    const settings = { ...DEFAULT_SETTINGS, maxSourceBytes: 5 };
    const vault = adapter(
      [file("bad.txt"), file("empty.txt", 0), file("big.txt", 6), file("good.txt", 2)],
      { "bad.txt": new Error("secret body"), "empty.txt": new Uint8Array(), "good.txt": encoder.encode("ok") }
    );
    const result = await discoverTranscripts(vault, settings, undefined, 50, testDigest);
    expect(result.items.map((item) => item.classification)).toEqual(["unreadable", "empty", "oversize", "eligible"]);
    expect(JSON.stringify(result)).not.toContain("secret body");
  });

  it("fails closed when hashing is unavailable", async () => {
    const vault = adapter([file("one.txt")], { "one.txt": encoder.encode("body") });
    const result = await discoverTranscripts(vault, DEFAULT_SETTINGS, undefined, 50, async () => { throw new Error("no crypto"); });
    expect(result.items[0].classification).toBe("unreadable");
  });

  it("cancels cooperatively and yields between batches", async () => {
    const controller = new AbortController();
    const vault = adapter(
      [file("one.txt"), file("two.txt")],
      { "one.txt": encoder.encode("one"), "two.txt": encoder.encode("two") }
    );
    vault.yieldControl = vi.fn(async () => controller.abort());
    const result = await discoverTranscripts(vault, DEFAULT_SETTINGS, controller.signal, 1, testDigest);
    expect(result.canceled).toBe(true);
    expect(result.items).toHaveLength(1);
    expect(vault.reads).toEqual(["one.txt"]);
  });
});
