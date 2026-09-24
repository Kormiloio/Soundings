import type { TranscriptFormat } from "./types";

export interface SoundingsSettings {
  readonly enabledFormats: readonly TranscriptFormat[];
  readonly excludedPaths: readonly string[];
  readonly maxSourceBytes: number;
  readonly projectInferenceEnabled: boolean;
  readonly projectRoot: string;
}

export const DEFAULT_MAX_SOURCE_BYTES = 5_000_000;
export const SOUNDINGS_STATE_PATH = ".soundings";

export const DEFAULT_SETTINGS: SoundingsSettings = Object.freeze({
  enabledFormats: Object.freeze<TranscriptFormat[]>(["txt", "vtt"]),
  excludedPaths: Object.freeze([SOUNDINGS_STATE_PATH]),
  maxSourceBytes: DEFAULT_MAX_SOURCE_BYTES,
  projectInferenceEnabled: false,
  projectRoot: "Projects"
});

export interface SettingsValidation {
  readonly settings?: SoundingsSettings;
  readonly errors: readonly string[];
}

export interface SoundingsSettingsPolicy {
  readonly configDir: string;
  readonly mandatoryExcludedPaths: readonly string[];
}

export interface SettingsPolicyValidation {
  readonly policy?: SoundingsSettingsPolicy;
  readonly errors: readonly string[];
}

export function normalizeVaultPath(value: string): string | undefined {
  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.startsWith("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("\0") ||
    /^[a-zA-Z]:/.test(trimmed)
  ) return undefined;

  const segments = trimmed.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    return undefined;
  }
  return segments.join("/");
}

export function createSettingsPolicy(configDir: string): SettingsPolicyValidation {
  const normalizedConfigDir = normalizeVaultPath(configDir);
  if (!normalizedConfigDir) return { errors: ["Obsidian configuration directory is not a safe vault-relative path."] };
  return {
    policy: Object.freeze({
      configDir: normalizedConfigDir,
      mandatoryExcludedPaths: Object.freeze([...new Set([normalizedConfigDir, SOUNDINGS_STATE_PATH])])
    }),
    errors: []
  };
}

export function editableExcludedPaths(
  settings: Pick<SoundingsSettings, "excludedPaths">,
  mandatoryExcludedPaths: readonly string[]
): readonly string[] {
  const mandatory = new Set(mandatoryExcludedPaths);
  return Object.freeze(settings.excludedPaths.filter((path) => !mandatory.has(path)));
}

export function validateSettings(
  input: Partial<SoundingsSettings>,
  mandatoryExcludedPaths: readonly string[] = DEFAULT_SETTINGS.excludedPaths
): SettingsValidation {
  const errors: string[] = [];
  const enabledFormats = [...new Set(input.enabledFormats ?? DEFAULT_SETTINGS.enabledFormats)]
    .filter((format): format is TranscriptFormat => format === "txt" || format === "vtt");
  if (enabledFormats.length === 0) errors.push("Enable at least one transcript format.");

  const mandatoryExclusions: string[] = [];
  for (const raw of mandatoryExcludedPaths) {
    const normalized = normalizeVaultPath(raw);
    if (!normalized) errors.push("A mandatory excluded path is invalid.");
    else mandatoryExclusions.push(normalized);
  }

  const exclusions: string[] = [];
  for (const raw of input.excludedPaths ?? DEFAULT_SETTINGS.excludedPaths) {
    const normalized = normalizeVaultPath(raw);
    if (!normalized) errors.push(`Invalid excluded path: ${raw || "(empty)"}`);
    else exclusions.push(normalized);
  }

  const maxSourceBytes = input.maxSourceBytes ?? DEFAULT_SETTINGS.maxSourceBytes;
  if (!Number.isSafeInteger(maxSourceBytes) || maxSourceBytes <= 0) {
    errors.push("Maximum source bytes must be a positive whole number.");
  }

  const projectInferenceEnabled = input.projectInferenceEnabled ?? DEFAULT_SETTINGS.projectInferenceEnabled;
  const projectRootRaw = input.projectRoot ?? DEFAULT_SETTINGS.projectRoot;
  const normalizedProjectRoot = normalizeVaultPath(projectRootRaw);
  if (projectInferenceEnabled && !normalizedProjectRoot) errors.push("Project root must be a valid vault-relative path.");
  const projectRoot = normalizedProjectRoot ?? DEFAULT_SETTINGS.projectRoot;

  if (errors.length > 0) return { errors };
  return {
    settings: Object.freeze({
      enabledFormats: Object.freeze(enabledFormats),
      excludedPaths: Object.freeze([...new Set([...mandatoryExclusions, ...exclusions])]),
      maxSourceBytes,
      projectInferenceEnabled,
      projectRoot
    }),
    errors
  };
}

export function settingsFingerprint(settings: SoundingsSettings): string {
  return JSON.stringify({
    enabledFormats: [...settings.enabledFormats].sort(),
    excludedPaths: [...settings.excludedPaths].sort(),
    maxSourceBytes: settings.maxSourceBytes,
    projectInferenceEnabled: settings.projectInferenceEnabled,
    projectRoot: settings.projectRoot
  });
}
