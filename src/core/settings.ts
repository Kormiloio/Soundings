import type { TranscriptFormat } from "./types";

export const RESERVED_SECTIONS = Object.freeze(["summary", "decisions", "action-items", "follow-ups"] as const);
export type ReservedSection = typeof RESERVED_SECTIONS[number];
export type TitlePattern = "source-name" | "parent-folder-source-name";
export type DestinationNamePattern = "source-name" | "source-name-note";
export type TimestampPolicy = "omit" | "retain";
export type TranscriptDisplay = "plain" | "folded-callout";

export interface OutputProfile {
  readonly titlePattern: TitlePattern;
  readonly destinationNamePattern: DestinationNamePattern;
  readonly enabledSections: readonly ReservedSection[];
  readonly staticTags: readonly string[];
  readonly timestampPolicy: TimestampPolicy;
  readonly transcriptDisplay: TranscriptDisplay;
}

export interface SoundingsSettings {
  readonly enabledFormats: readonly TranscriptFormat[];
  readonly excludedPaths: readonly string[];
  readonly maxSourceBytes: number;
  readonly projectInferenceEnabled: boolean;
  readonly projectRoot: string;
  readonly observationEnabled: boolean;
  readonly observationRoots: readonly string[];
  readonly outputProfile: OutputProfile;
}

export const DEFAULT_MAX_SOURCE_BYTES = 5_000_000;
export const SOUNDINGS_STATE_PATH = ".soundings";

export const DEFAULT_OUTPUT_PROFILE: OutputProfile = Object.freeze({
  titlePattern: "source-name",
  destinationNamePattern: "source-name",
  enabledSections: RESERVED_SECTIONS,
  staticTags: Object.freeze([]),
  timestampPolicy: "omit",
  transcriptDisplay: "plain"
});

export const DEFAULT_SETTINGS: SoundingsSettings = Object.freeze({
  enabledFormats: Object.freeze<TranscriptFormat[]>(["txt", "vtt"]),
  excludedPaths: Object.freeze([SOUNDINGS_STATE_PATH]),
  maxSourceBytes: DEFAULT_MAX_SOURCE_BYTES,
  projectInferenceEnabled: false,
  projectRoot: "Projects",
  observationEnabled: false,
  observationRoots: Object.freeze([]),
  outputProfile: DEFAULT_OUTPUT_PROFILE
});

export interface SettingsValidation {
  readonly settings?: SoundingsSettings;
  readonly errors: readonly string[];
}

export interface SavedSettingsMigration extends SettingsValidation {
  readonly restoredOutputProfile: boolean;
}

export interface SoundingsSettingsPolicy {
  readonly configDir: string;
  readonly mandatoryExcludedPaths: readonly string[];
}

export interface SettingsPolicyValidation {
  readonly policy?: SoundingsSettingsPolicy;
  readonly errors: readonly string[];
}

export interface OutputProfileValidation {
  readonly profile?: OutputProfile;
  readonly errors: readonly string[];
}

const TITLE_PATTERNS = new Set<TitlePattern>(["source-name", "parent-folder-source-name"]);
const DESTINATION_NAME_PATTERNS = new Set<DestinationNamePattern>(["source-name", "source-name-note"]);
const TIMESTAMP_POLICIES = new Set<TimestampPolicy>(["omit", "retain"]);
const TRANSCRIPT_DISPLAY_CHOICES = new Set<TranscriptDisplay>(["plain", "folded-callout"]);
const RESERVED_SECTION_NAMES: ReadonlySet<string> = new Set<string>(RESERVED_SECTIONS);

function isReservedSection(value: unknown): value is ReservedSection {
  return typeof value === "string" && RESERVED_SECTION_NAMES.has(value);
}
const STATIC_TAG = /^[\p{L}\p{N}_-]+(?:\/[\p{L}\p{N}_-]+)*$/u;

function isStaticTag(value: string): boolean {
  return value.length <= 100 && STATIC_TAG.test(value) && /[\p{L}_-]/u.test(value);
}

export function validateOutputProfile(input?: Partial<OutputProfile>): OutputProfileValidation {
  const errors: string[] = [];
  const titlePattern = input?.titlePattern ?? DEFAULT_OUTPUT_PROFILE.titlePattern;
  if (!TITLE_PATTERNS.has(titlePattern)) errors.push(`Unknown title pattern: ${String(titlePattern)}.`);

  const destinationNamePattern = input?.destinationNamePattern ?? DEFAULT_OUTPUT_PROFILE.destinationNamePattern;
  if (!DESTINATION_NAME_PATTERNS.has(destinationNamePattern)) {
    errors.push(`Unknown destination-name pattern: ${String(destinationNamePattern)}.`);
  }

  const timestampPolicy = input?.timestampPolicy ?? DEFAULT_OUTPUT_PROFILE.timestampPolicy;
  if (!TIMESTAMP_POLICIES.has(timestampPolicy)) errors.push(`Unsupported timestamp policy: ${String(timestampPolicy)}.`);

  const transcriptDisplay = input?.transcriptDisplay === undefined
    ? DEFAULT_OUTPUT_PROFILE.transcriptDisplay : input.transcriptDisplay;
  if (!TRANSCRIPT_DISPLAY_CHOICES.has(transcriptDisplay)) {
    errors.push(`Unsupported transcript display choice: ${String(transcriptDisplay)}.`);
  }

  // Saved data is untrusted: Array.isArray narrows to any[], so iterate as unknown and narrow each element.
  const requestedSections: unknown = input?.enabledSections ?? DEFAULT_OUTPUT_PROFILE.enabledSections;
  const sectionSet = new Set<ReservedSection>();
  if (Array.isArray(requestedSections)) {
    const candidates: readonly unknown[] = requestedSections;
    for (const section of candidates) {
      if (isReservedSection(section)) sectionSet.add(section);
      else errors.push(`Unknown reserved section: ${String(section)}.`);
    }
  } else {
    errors.push(`Expected an array for enabled sections, but received: ${typeof requestedSections}.`);
  }
  const enabledSections = RESERVED_SECTIONS.filter((section) => sectionSet.has(section));

  const staticTags: string[] = [];
  const seenTags = new Set<string>();
  const rawTags: unknown = input?.staticTags ?? DEFAULT_OUTPUT_PROFILE.staticTags;
  if (Array.isArray(rawTags)) {
    const candidates: readonly unknown[] = rawTags;
    for (const rawTag of candidates) {
      if (typeof rawTag !== "string") {
        errors.push(`Invalid static tag type: ${typeof rawTag}. Expected string.`);
        continue;
      }
      const tag = rawTag.trim();
      if (!isStaticTag(tag)) {
        errors.push(`Invalid static tag: ${tag || "(empty)"}. Use letters, numbers, underscores, hyphens, and single slashes; tags cannot be only numbers.`);
      } else if (!seenTags.has(tag)) {
        seenTags.add(tag);
        staticTags.push(tag);
      }
    }
  } else {
    errors.push(`Expected an array for static tags, but received: ${typeof rawTags}.`);
  }

  if (errors.length > 0) return { errors };
  return {
    profile: Object.freeze({
      titlePattern,
      destinationNamePattern,
      enabledSections: Object.freeze(enabledSections),
      staticTags: Object.freeze(staticTags),
      timestampPolicy,
      transcriptDisplay
    }),
    errors
  };
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

export interface SavedSettingsSanitization {
  readonly input: Partial<SoundingsSettings>;
  /** Names of saved fields whose runtime type was wrong; never their values. */
  readonly resetFields: readonly string[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

const SAVED_FIELD_TYPES: Readonly<Record<keyof SoundingsSettings, (value: unknown) => boolean>> = Object.freeze({
  enabledFormats: isStringArray,
  excludedPaths: isStringArray,
  maxSourceBytes: (value) => typeof value === "number",
  projectInferenceEnabled: (value) => typeof value === "boolean",
  projectRoot: (value) => typeof value === "string",
  observationEnabled: (value) => typeof value === "boolean",
  observationRoots: isStringArray,
  outputProfile: (value) => typeof value === "object" && value !== null && !Array.isArray(value)
});

/**
 * Keeps only known saved fields with the expected runtime type. A wrong-typed field is omitted so it
 * takes its safe default, and is reported by name. Non-object saved data is treated as empty.
 */
export function sanitizeSavedSettings(raw: unknown): SavedSettingsSanitization {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return { input: {}, resetFields: [] };
  const record = raw as Record<string, unknown>;
  const input: Record<string, unknown> = {};
  const resetFields: string[] = [];
  for (const [field, hasExpectedType] of Object.entries(SAVED_FIELD_TYPES)) {
    const value = record[field];
    if (value === undefined) continue;
    if (hasExpectedType(value)) input[field] = value;
    else resetFields.push(field);
  }
  return { input, resetFields: Object.freeze(resetFields) };
}

function stringListField(value: unknown, fallback: readonly string[], label: string, errors: string[]): readonly string[] {
  if (value === undefined) return fallback;
  if (isStringArray(value)) return value;
  errors.push(`${label} must be a list of text values.`);
  return [];
}

export function validateSettings(
  input: Partial<SoundingsSettings>,
  mandatoryExcludedPaths: readonly string[] = DEFAULT_SETTINGS.excludedPaths
): SettingsValidation {
  const errors: string[] = [];
  const enabledFormatsRaw = stringListField(input.enabledFormats, DEFAULT_SETTINGS.enabledFormats, "Enabled formats", errors);
  const enabledFormats = [...new Set(enabledFormatsRaw)]
    .filter((format): format is TranscriptFormat => format === "txt" || format === "vtt" || format === "srt");
  if (enabledFormats.length === 0) errors.push("Enable at least one transcript format.");

  const mandatoryExclusions: string[] = [];
  for (const raw of mandatoryExcludedPaths) {
    const normalized = normalizeVaultPath(raw);
    if (!normalized) errors.push("A mandatory excluded path is invalid.");
    else mandatoryExclusions.push(normalized);
  }

  const exclusions: string[] = [];
  for (const raw of stringListField(input.excludedPaths, DEFAULT_SETTINGS.excludedPaths, "Excluded paths", errors)) {
    const normalized = normalizeVaultPath(raw);
    if (!normalized) errors.push(`Invalid excluded path: ${raw || "(empty)"}`);
    else exclusions.push(normalized);
  }

  const maxSourceBytes = input.maxSourceBytes ?? DEFAULT_SETTINGS.maxSourceBytes;
  if (!Number.isSafeInteger(maxSourceBytes) || maxSourceBytes <= 0) {
    errors.push("Maximum source bytes must be a positive whole number.");
  }

  const projectInferenceEnabled = input.projectInferenceEnabled ?? DEFAULT_SETTINGS.projectInferenceEnabled;
  if (typeof projectInferenceEnabled !== "boolean") errors.push("Project inference must be on or off.");
  const projectRootRaw: unknown = input.projectRoot ?? DEFAULT_SETTINGS.projectRoot;
  if (typeof projectRootRaw !== "string") errors.push("Project root must be text.");
  const normalizedProjectRoot = typeof projectRootRaw === "string" ? normalizeVaultPath(projectRootRaw) : undefined;
  if (projectInferenceEnabled && !normalizedProjectRoot) errors.push("Project root must be a valid vault-relative path.");
  const projectRoot = normalizedProjectRoot ?? DEFAULT_SETTINGS.projectRoot;

  const observationEnabled = input.observationEnabled ?? DEFAULT_SETTINGS.observationEnabled;
  if (typeof observationEnabled !== "boolean") errors.push("Observation must be on or off.");
  const observationRootsRaw = stringListField(input.observationRoots, DEFAULT_SETTINGS.observationRoots, "Observation roots", errors);
  const observationRoots: string[] = [];
  for (const raw of observationRootsRaw) {
    const normalized = normalizeVaultPath(raw);
    if (!normalized) errors.push(`Invalid observation root: ${raw || "(empty)"}`);
    else observationRoots.push(normalized);
  }

  const outputProfileValidation = validateOutputProfile(input.outputProfile);
  errors.push(...outputProfileValidation.errors);

  if (errors.length > 0) return { errors };
  return {
    settings: Object.freeze({
      enabledFormats: Object.freeze(enabledFormats),
      excludedPaths: Object.freeze([...new Set([...mandatoryExclusions, ...exclusions])]),
      maxSourceBytes,
      projectInferenceEnabled,
      projectRoot,
      observationEnabled,
      observationRoots: Object.freeze([...new Set(observationRoots)]),
      outputProfile: outputProfileValidation.profile ?? DEFAULT_OUTPUT_PROFILE
    }),
    errors
  };
}

export function migrateSavedSettings(
  input: Partial<SoundingsSettings>,
  mandatoryExcludedPaths: readonly string[] = DEFAULT_SETTINGS.excludedPaths
): SavedSettingsMigration {
  const validation = validateSettings(input, mandatoryExcludedPaths);
  if (validation.settings) return { ...validation, restoredOutputProfile: false };
  if (input.outputProfile === undefined) return { ...validation, restoredOutputProfile: false };

  const profileValidation = validateOutputProfile(input.outputProfile);
  if (profileValidation.profile) return { ...validation, restoredOutputProfile: false };
  const restored = validateSettings({ ...input, outputProfile: DEFAULT_OUTPUT_PROFILE }, mandatoryExcludedPaths);
  return restored.settings
    ? { settings: restored.settings, errors: profileValidation.errors, restoredOutputProfile: true }
    : { errors: validation.errors, restoredOutputProfile: false };
}

export function settingsFingerprint(settings: SoundingsSettings): string {
  return JSON.stringify({
    enabledFormats: [...settings.enabledFormats].sort(),
    excludedPaths: [...settings.excludedPaths].sort(),
    maxSourceBytes: settings.maxSourceBytes,
    projectInferenceEnabled: settings.projectInferenceEnabled,
    projectRoot: settings.projectRoot,
    observationEnabled: settings.observationEnabled,
    observationRoots: [...settings.observationRoots].sort(),
    outputProfile: settings.outputProfile
  });
}

export function outputProfileFingerprint(profile: OutputProfile): string {
  return JSON.stringify({
    titlePattern: profile.titlePattern,
    destinationNamePattern: profile.destinationNamePattern,
    enabledSections: profile.enabledSections,
    staticTags: profile.staticTags,
    timestampPolicy: profile.timestampPolicy,
    transcriptDisplay: profile.transcriptDisplay
  });
}

export function outputProfileSummary(profile: OutputProfile): string {
  const title = profile.titlePattern === "source-name" ? "Source name" : "Parent folder — Source name";
  const destination = profile.destinationNamePattern === "source-name" ? "Source name.md" : "Source name - Note.md";
  const sectionNames: Record<ReservedSection, string> = {
    summary: "Summary",
    decisions: "Decisions",
    "action-items": "Action Items",
    "follow-ups": "Follow-ups"
  };
  const sections = profile.enabledSections.map((section) => sectionNames[section]).join(", ") || "none";
  const tags = profile.staticTags.join(", ") || "none";
  const timestamps = profile.timestampPolicy === "omit" ? "omit" : "retain";
  const display = profile.transcriptDisplay === "plain" ? "plain" : "folded callout";
  return `Title: ${title}; destination: ${destination}; sections: ${sections}; tags: ${tags}; Caption timestamps: ${timestamps}; transcript: ${display}.`;
}
