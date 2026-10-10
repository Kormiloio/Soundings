import type { DiscoveryItem } from "./discovery";
import {
  outputProfileFingerprint,
  outputProfileSummary,
  settingsFingerprint,
  type DestinationNamePattern,
  type SoundingsSettings,
  type TitlePattern
} from "./settings";
import type { ConversionPlan, PlanItem, Result } from "./types";

export type DestinationError = "source-has-no-extension" | "destination-basename-invalid" | "destination-basename-hidden";

/**
 * Identity used for every collision comparison. Desktop filesystems are commonly case-insensitive and
 * sync providers may change Unicode composition, so two paths that fold to the same key are one file.
 */
export function collisionKey(path: string): string {
  return path.normalize("NFC").toLowerCase();
}

const REJECTED_BASENAME_CHARACTERS = new Set(["\\", ":", "*", "?", '"', "<", ">", "|"]);

function isRejectedBasenameCharacter(character: string): boolean {
  return character.charCodeAt(0) <= 31 || REJECTED_BASENAME_CHARACTERS.has(character);
}

function removeTrailingWhitespace(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1].trim() === "") end -= 1;
  return value.slice(0, end);
}

export function normalizeDestinationBasename(basename: string): Result<string, "destination-basename-invalid"> {
  const parts: string[] = [];
  let current = "";
  let index = 0;
  while (index < basename.length) {
    const character = basename[index];
    if (!isRejectedBasenameCharacter(character)) {
      current += character;
      index += 1;
      continue;
    }
    current = removeTrailingWhitespace(current);
    if (current.length > 0) parts.push(current);
    current = "";
    index += 1;
    while (index < basename.length) {
      const next = basename[index];
      if (!isRejectedBasenameCharacter(next) && next.trim() !== "") break;
      index += 1;
    }
  }
  current = current.replace(/[ .]+$/u, "");
  if (current.length > 0) parts.push(current);
  const normalized = parts.join(" - ");
  return normalized.length > 0
    ? { ok: true, value: normalized }
    : { ok: false, error: "destination-basename-invalid" };
}

function sourceBasename(sourcePath: string): Result<string, "source-has-no-extension"> {
  const slash = sourcePath.lastIndexOf("/");
  const dot = sourcePath.lastIndexOf(".");
  if (dot <= slash) return { ok: false, error: "source-has-no-extension" };
  return { ok: true, value: sourcePath.slice(slash + 1, dot) };
}

export function destinationFor(
  sourcePath: string,
  pattern: DestinationNamePattern = "source-name"
): Result<string, DestinationError> {
  const slash = sourcePath.lastIndexOf("/");
  const sourceName = sourceBasename(sourcePath);
  if (!sourceName.ok || sourceName.value === undefined) return sourceName;
  const safeSourceName = normalizeDestinationBasename(sourceName.value);
  if (!safeSourceName.ok || safeSourceName.value === undefined) return safeSourceName;
  const basename = pattern === "source-name-note" ? `${safeSourceName.value} - Note` : safeSourceName.value;
  const normalized = normalizeDestinationBasename(basename);
  if (!normalized.ok || normalized.value === undefined) return normalized;
  // Obsidian does not index dot-leading names, so neither collision check could see them.
  if (normalized.value.startsWith(".")) return { ok: false, error: "destination-basename-hidden" };
  const folder = slash >= 0 ? sourcePath.slice(0, slash + 1) : "";
  return { ok: true, value: `${folder}${normalized.value}.md` };
}

export function titleFor(sourcePath: string, pattern: TitlePattern = "source-name"): string {
  const name = sourcePath.slice(sourcePath.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  const sourceName = dot > 0 ? name.slice(0, dot) : name;
  if (pattern === "source-name") return sourceName;
  const slash = sourcePath.lastIndexOf("/");
  if (slash < 0) return sourceName;
  const parentPath = sourcePath.slice(0, slash);
  const parent = parentPath.slice(parentPath.lastIndexOf("/") + 1);
  return parent ? `${parent} — ${sourceName}` : sourceName;
}

export function inferProject(sourcePath: string, settings: SoundingsSettings): string | undefined {
  if (!settings.projectInferenceEnabled) return undefined;
  const root = settings.projectRoot;
  if (!sourcePath.startsWith(`${root}/`)) return undefined;
  const remainder = sourcePath.slice(root.length + 1);
  const segments = remainder.split("/");
  return segments.length >= 2 && segments[0] ? segments[0] : undefined;
}

export function buildPlan(
  discovery: readonly DiscoveryItem[],
  existingPaths: ReadonlySet<string>,
  settings: SoundingsSettings,
  now = new Date(),
  idFactory?: () => string
): ConversionPlan {
  const profileFingerprint = outputProfileFingerprint(settings.outputProfile);
  const existingKeys = new Set([...existingPaths].map(collisionKey));
  const draft = discovery.map((item): PlanItem => {
    const destination = destinationFor(item.sourcePath, settings.outputProfile.destinationNamePattern);
    const destinationPath = destination.value;
    let classification = item.classification;
    let reason = item.reason;
    if (classification === "eligible" && (!destination.ok || !destinationPath)) {
      classification = "destination-invalid";
      reason = destination.error === "destination-basename-hidden"
        ? "The Markdown destination would start with a period, which Obsidian hides. Rename the source outside Soundings."
        : "A safe Markdown destination could not be derived from this filename.";
    } else if (classification === "eligible" && destinationPath && existingKeys.has(collisionKey(destinationPath))) {
      classification = "destination-exists";
      reason = "Destination already exists.";
    }
    return {
      ...item,
      destinationPath,
      classification,
      reason,
      title: titleFor(item.sourcePath, settings.outputProfile.titlePattern),
      project: inferProject(item.sourcePath, settings),
      ...(classification === "eligible" ? { outputProfileFingerprint: profileFingerprint } : {})
    };
  });

  const destinationCounts = new Map<string, number>();
  for (const item of draft) {
    if (item.classification === "eligible" && item.destinationPath) {
      const key = collisionKey(item.destinationPath);
      destinationCounts.set(key, (destinationCounts.get(key) ?? 0) + 1);
    }
  }
  const items = draft.map((item): PlanItem => Object.freeze(
    item.classification === "eligible" && item.destinationPath && (destinationCounts.get(collisionKey(item.destinationPath)) ?? 0) > 1
      ? { ...item, classification: "destination-ambiguous", reason: "Multiple sources resolve to this destination." }
      : item
  ));
  return Object.freeze({
    txtLayout: settings.txtLayout,
    id: idFactory?.() ?? (() => { throw new Error("secure-id-unavailable"); })(),
    settingsFingerprint: settingsFingerprint(settings),
    outputProfile: settings.outputProfile,
    outputProfileFingerprint: profileFingerprint,
    outputProfileSummary: outputProfileSummary(settings.outputProfile),
    createdAt: now.toISOString(),
    items: Object.freeze(items)
  });
}

export function isPlanCurrent(plan: ConversionPlan, settings: SoundingsSettings): boolean {
  return plan.settingsFingerprint === settingsFingerprint(settings);
}
