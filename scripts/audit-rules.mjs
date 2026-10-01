// Pure runtime-audit rules shared by scripts/audit-runtime.mjs and its tests.
// Patterns are simple and linear; they identify files and rule names, never source content.

/** The only module the production bundle may load at runtime. */
export const ALLOWED_BUNDLE_IMPORTS = Object.freeze(["obsidian"]);

const NETWORK_AND_CODE_LOADING = [
  [/\bfetch\s*\(/u, "fetch"],
  [/\bXMLHttpRequest\b/u, "XMLHttpRequest"],
  [/\bWebSocket\b/u, "WebSocket"],
  [/\bEventSource\b/u, "EventSource"],
  [/\bsendBeacon\b/u, "sendBeacon"],
  [/\brequestUrl\b/u, "requestUrl"],
  [/\brequest\s*\(/u, "request"],
  [/\bimport\s*\(/u, "dynamic import"],
  [/\beval\s*\(/u, "eval"],
  [/\bnew\s+Function\b|\bFunction\s*\(/u, "Function constructor"],
  [/\bwindow\.open\s*\(/u, "window.open"],
  [/\b(?:window|globalThis|activeWindow|self)\s*\[/u, "computed global access"],
  [/["'](?:node:)?(?:fs|fs\/promises|child_process|net|http|https|electron)["']/u, "Node or Electron module import"],
  [/\btelemetry\b/iu, "telemetry"],
  [/\banalytics\b/iu, "analytics"]
];

const DESTRUCTIVE_VAULT = [
  [/\bvault\s*\.\s*(?:modify|modifyBinary|process|append|delete|trash|rename|copy|create)\s*\(/u, "destructive or text-create vault call"],
  [/\badapter\s*\.\s*(?:write|writeBinary|append|process|remove|rmdir|rename|copy|mkdir|trashSystem|trashLocal)\s*\(/u, "vault adapter write"],
  [/\bfileManager\b/u, "fileManager"]
];

const COMMUNITY_WARNINGS = [
  [/\bglobalThis\b/u, "globalThis"],
  [/\\u0000-\\u001f/u, "control-character regular expression"],
  [/\.setWarning\s*\(/u, "deprecated setWarning"],
  [/\bas\s+SoundingsSettings\b/u, "unnecessary SoundingsSettings assertion"],
  [/\bactiveWindow\.setTimeout\s*\(/u, "activeWindow timer"]
];

const ADAPTER_BOUNDARY = "src/obsidian/vault-adapter.ts";

/**
 * @param {ReadonlyMap<string, string>} sources runtime source files keyed by repository-relative path
 * @param {string} bundle production main.js
 * @returns {string[]} violations as "rule (file)" labels
 */
export function findViolations(sources, bundle) {
  const violations = [];
  const report = (name, file) => violations.push(`${name} (${file})`);

  for (const [file, text] of sources) {
    for (const [pattern, name] of [...NETWORK_AND_CODE_LOADING, ...DESTRUCTIVE_VAULT, ...COMMUNITY_WARNINGS]) {
      if (pattern.test(text)) report(name, file);
    }
    // Storage-level access (vault.adapter) is confined to the adapter, which uses only exists().
    if (file !== ADAPTER_BOUNDARY && /\bvault\s*\.\s*adapter\b/u.test(text)) {
      report("vault adapter access outside the adapter boundary", file);
    }
  }

  for (const [pattern, name] of NETWORK_AND_CODE_LOADING) {
    if (pattern.test(bundle)) report(name, "main.js");
  }
  for (const specifier of bundleImports(bundle)) {
    if (!ALLOWED_BUNDLE_IMPORTS.includes(specifier)) report(`bundle import ${JSON.stringify(specifier)}`, "main.js");
  }

  const settingsCore = sources.get("src/core/settings.ts") ?? "";
  const settingsTab = sources.get("src/obsidian/settings-tab.ts") ?? "";
  if (/["'`]\.obsidian(?:[\/"'`]|$)/u.test(settingsCore + settingsTab)) report("hardcoded configuration directory", "settings");
  if (sources.has("src/obsidian/settings-tab.ts") && !settingsTab.includes("getSettingDefinitions")) {
    report("missing declarative settings definitions", "src/obsidian/settings-tab.ts");
  }
  return [...new Set(violations)];
}

/** Every require() target in the bundle; a non-literal target is reported as "<dynamic>". */
export function bundleImports(bundle) {
  const specifiers = [];
  const pattern = /\brequire\s*\(\s*(?:(["'`])([^"'`\n]*)\1\s*\)|)/gu;
  for (const match of bundle.matchAll(pattern)) specifiers.push(match[1] ? match[2] : "<dynamic>");
  return specifiers;
}
