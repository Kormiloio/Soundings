import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain ESM build script without type declarations
import { bundleImports, findViolations } from "../scripts/audit-rules.mjs";

const CLEAN_TAB = 'export class Tab { getSettingDefinitions() { return []; } }';
const OK_BUNDLE = 'var o = require("obsidian"); module.exports = {};';

function violationsFor(file: string, text: string, bundle = OK_BUNDLE): string[] {
  const sources = new Map<string, string>([["src/obsidian/settings-tab.ts", CLEAN_TAB], [file, text]]);
  return (findViolations as (sources: Map<string, string>, bundle: string) => string[])(sources, bundle);
}

describe("runtime audit rules", () => {
  it("passes clean runtime source and an obsidian-only bundle", () => {
    expect(violationsFor("src/core/clean.ts", "const seen = new Set<string>(); seen.delete('a'); modal.open();")).toEqual([]);
  });

  it.each([
    ["requestUrl", "await requestUrl({ url });"],
    ["request", "await request({ url });"],
    ["dynamic import", "const m = await import('x');"],
    ["eval", "eval(code);"],
    ["Function constructor", "const f = new Function('return 1');"],
    ["Function constructor", "const f = Function('return 1');"],
    ["computed global access", "window['fe' + 'tch'](url);"],
    ["computed global access", "activeWindow[name]();"],
    ["window.open", "window.open(url);"],
    ["EventSource", "new EventSource(url);"],
    ["sendBeacon", "navigator.sendBeacon(url, body);"],
    ["fetch", "fetch(url);"],
    ["Node or Electron module import", 'import { shell } from "electron";'],
    ["Node or Electron module import", 'import { readFile } from "node:fs/promises";']
  ])("flags %s in runtime source", (rule, text) => {
    expect(violationsFor("src/core/leak.ts", text).some((entry) => entry.startsWith(rule))).toBe(true);
  });

  it.each([
    "await this.app.vault.process(file, (data) => data);",
    "await this.vault.append(file, text);",
    "await vault.modifyBinary(file, bytes);",
    "await vault.delete(file);",
    "await vault.trash(file, true);",
    "await vault.rename(file, path);",
    "await vault.copy(file, path);",
    "await vault.create(path, text);"
  ])("flags destructive vault call %j anywhere in runtime source", (text) => {
    expect(violationsFor("src/core/anything.ts", text).some((entry) => entry.startsWith("destructive or text-create vault call"))).toBe(true);
  });

  it.each([
    "await this.vault.adapter.write(path, text);",
    "await vault.adapter.writeBinary(path, bytes);",
    "await vault.adapter.remove(path);",
    "await vault.adapter.rename(a, b);",
    "await vault.adapter.mkdir(path);"
  ])("flags storage write %j even at the adapter boundary", (text) => {
    expect(violationsFor("src/obsidian/vault-adapter.ts", text).some((entry) => entry.startsWith("vault adapter write"))).toBe(true);
  });

  it("flags fileManager use", () => {
    expect(violationsFor("src/main.ts", "await this.app.fileManager.trashFile(file);").some((entry) => entry.startsWith("fileManager"))).toBe(true);
  });

  it("allows storage existence checks only at the adapter boundary", () => {
    expect(violationsFor("src/obsidian/vault-adapter.ts", "return this.vault.adapter.exists(path);")).toEqual([]);
    expect(violationsFor("src/main.ts", "return this.app.vault.adapter.exists(path);")
      .some((entry) => entry.startsWith("vault adapter access outside the adapter boundary"))).toBe(true);
  });

  it("allows the core publication adapter's own exists check", () => {
    expect(violationsFor("src/core/execution.ts", "if (adapter.exists(path)) return;")).toEqual([]);
  });

  it.each([
    ['require("electron")', 'bundle import "electron"'],
    ['require("fs")', 'bundle import "fs"'],
    ["require(name)", 'bundle import "<dynamic>"']
  ])("flags bundle import %s", (call, rule) => {
    expect(violationsFor("src/core/clean.ts", "", `${OK_BUNDLE} ${call};`).some((entry) => entry.startsWith(rule))).toBe(true);
  });

  it("lists every bundle require target", () => {
    expect((bundleImports as (bundle: string) => string[])('require("obsidian"); require(`x`); require(y)')).toEqual(["obsidian", "x", "<dynamic>"]);
  });

  it("names the file and rule without echoing source text", () => {
    const violations = violationsFor("src/core/leak.ts", "fetch('https://private.example/secret-body');");
    expect(violations).toContain("fetch (src/core/leak.ts)");
    expect(violations.join(" ")).not.toContain("secret-body");
  });
});
