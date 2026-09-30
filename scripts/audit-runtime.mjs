import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { findViolations } from "./audit-rules.mjs";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat();
}

const files = (await walk("src")).filter((path) => path.endsWith(".ts"));
const sources = new Map(await Promise.all(files.map(async (path) => [path.split("\\").join("/"), await readFile(path, "utf8")])));
const bundle = await readFile("main.js", "utf8");

const violations = findViolations(sources, bundle);
if (violations.length > 0) {
  throw new Error(`Runtime audit failed: ${violations.join(", ")}`);
}
process.stdout.write("Runtime audit passed: bundle loads only obsidian; no network, code loading, telemetry, Node filesystem, credential, destructive vault, or storage-write APIs, and no actionable Community source-warning patterns detected.\n");
