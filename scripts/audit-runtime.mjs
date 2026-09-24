import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat();
}

const files = (await walk("src")).filter((path) => path.endsWith(".ts"));
const sources = new Map(await Promise.all(files.map(async (path) => [path, await readFile(path, "utf8")])));
const source = [...sources.values()].join("\n");
const bundle = await readFile("main.js", "utf8");
const forbidden = [
  [/\bfetch\s*\(/, "fetch"],
  [/XMLHttpRequest/, "XMLHttpRequest"],
  [/\bWebSocket\b/, "WebSocket"],
  [/["'](?:node:)?fs(?:\/promises)?["']/, "filesystem import"],
  [/\btelemetry\b/i, "telemetry"],
  [/\banalytics\b/i, "analytics"]
];

const violations = [];
for (const [pattern, name] of forbidden) {
  if (pattern.test(source) || pattern.test(bundle)) violations.push(name);
}
const adapter = await readFile("src/obsidian/vault-adapter.ts", "utf8");
for (const method of ["modify", "delete", "rename", "trash"]) {
  if (new RegExp(`vault\\.${method}\\s*\\(`).test(adapter)) violations.push(`vault.${method}`);
}
for (const [pattern, name] of [
  [/\bglobalThis\b/u, "globalThis"],
  [/\\u0000-\\u001f/u, "control-character regular expression"],
  [/\.setWarning\s*\(/u, "deprecated setWarning"],
  [/\bas\s+SoundingsSettings\b/u, "unnecessary SoundingsSettings assertion"],
  [/\bactiveWindow\.setTimeout\s*\(/u, "activeWindow timer"]
]) {
  if (pattern.test(source)) violations.push(name);
}
const settingsCore = sources.get("src/core/settings.ts") ?? "";
const settingsTab = sources.get("src/obsidian/settings-tab.ts") ?? "";
if (/["'`]\.obsidian(?:[\/"'`]|$)/u.test(settingsCore + settingsTab)) violations.push("hardcoded configuration directory");
if (!settingsTab.includes("getSettingDefinitions")) violations.push("missing declarative settings definitions");

if (violations.length > 0) {
  throw new Error(`Runtime audit failed: ${violations.join(", ")}`);
}
process.stdout.write("Runtime audit passed: no network, telemetry, Node filesystem, credential, destructive vault APIs, or actionable Community source-warning patterns detected.\n");
