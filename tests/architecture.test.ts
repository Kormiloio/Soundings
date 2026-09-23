import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  }));
  return files.flat().filter((path) => path.endsWith(".ts"));
}

describe("core dependency boundary", () => {
  it("does not import Obsidian, Node filesystem, or UI modules", async () => {
    const files = await sourceFiles(join(process.cwd(), "src/core"));
    for (const file of files) {
      const source = await readFile(file, "utf8");
      expect(source, file).not.toMatch(/from\s+["']obsidian["']/);
      expect(source, file).not.toMatch(/from\s+["'](?:node:)?fs(?:\/promises)?["']/);
      expect(source, file).not.toMatch(/from\s+["'].*(?:modal|view|settings-tab)["']/);
    }
  });
});
