import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Finding =
  | "globalThis"
  | "control-regex"
  | "escaped-bracket"
  | "hardcoded-config-dir"
  | "imperative-settings"
  | "deprecated-warning"
  | "settings-assertion"
  | "active-window-timer";

function findings(path: string, source: string): Finding[] {
  const result: Finding[] = [];
  if (/\bglobalThis\b/u.test(source)) result.push("globalThis");
  if (/\\u0000-\\u001f/u.test(source)) result.push("control-regex");
  if (/\\\\\[/u.test(source)) result.push("escaped-bracket");
  if (path.includes("src/") && /["'`]\.obsidian(?:[\/"'`]|$)/u.test(source)) result.push("hardcoded-config-dir");
  if (path.endsWith("settings-tab.ts") && !source.includes("getSettingDefinitions")) result.push("imperative-settings");
  if (/\.setWarning\s*\(/u.test(source)) result.push("deprecated-warning");
  if (path.endsWith("main.ts") && /\bas\s+SoundingsSettings\b/u.test(source)) result.push("settings-assertion");
  if (/\bactiveWindow\.setTimeout\s*\(/u.test(source)) result.push("active-window-timer");
  return result;
}

describe("Community automated-review source contracts", () => {
  it.each([
    ["src/core/hash.ts", "globalThis.crypto", "globalThis"],
    ["src/core/planning.ts", "const unsafe = /[\\u0000-\\u001f]/;", "control-regex"],
    ["src/core/rendering.ts", String.raw`const escaped = /\\[/;`, "escaped-bracket"],
    ["src/core/settings.ts", 'const folder = ".obsidian";', "hardcoded-config-dir"],
    ["src/obsidian/settings-tab.ts", "class Tab { display() {} }", "imperative-settings"],
    ["src/obsidian/review-modal.ts", "button.setWarning()", "deprecated-warning"],
    ["src/main.ts", "stored as SoundingsSettings", "settings-assertion"],
    ["src/obsidian/vault-adapter.ts", "activeWindow.setTimeout(resolve, 0)", "active-window-timer"]
  ] as const)("detects %s review fixture", (path, source, expected) => {
    expect(findings(path, source)).toContain(expected);
  });

  it("keeps current runtime sources free of actionable review patterns", async () => {
    const paths = [
      "src/core/hash.ts",
      "src/core/planning.ts",
      "src/core/rendering.ts",
      "src/core/settings.ts",
      "src/obsidian/vault-adapter.ts",
      "src/obsidian/settings-tab.ts",
      "src/obsidian/review-modal.ts",
      "src/main.ts"
    ];
    const detected = (await Promise.all(paths.map(async (path) => findings(path, await readFile(join(process.cwd(), path), "utf8")))))
      .flat();
    expect(detected).toEqual([]);
  });
});
