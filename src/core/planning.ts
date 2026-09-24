import type { DiscoveryItem } from "./discovery";
import { settingsFingerprint, type SoundingsSettings } from "./settings";
import type { ConversionPlan, PlanItem, Result } from "./types";

export type DestinationError = "source-has-no-extension" | "destination-basename-invalid";

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

export function destinationFor(sourcePath: string): Result<string, DestinationError> {
  const slash = sourcePath.lastIndexOf("/");
  const dot = sourcePath.lastIndexOf(".");
  if (dot <= slash) return { ok: false, error: "source-has-no-extension" };
  const basename = sourcePath.slice(slash + 1, dot);
  const normalized = normalizeDestinationBasename(basename);
  if (!normalized.ok || normalized.value === undefined) return normalized;
  const folder = slash >= 0 ? sourcePath.slice(0, slash + 1) : "";
  return { ok: true, value: `${folder}${normalized.value}.md` };
}

export function titleFor(sourcePath: string): string {
  const name = sourcePath.slice(sourcePath.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
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
  const draft = discovery.map((item): PlanItem => {
    const destination = destinationFor(item.sourcePath);
    const destinationPath = destination.value;
    let classification = item.classification;
    let reason = item.reason;
    if (classification === "eligible" && (!destination.ok || !destinationPath)) {
      classification = "destination-invalid";
      reason = "A safe Markdown destination could not be derived from this filename.";
    } else if (classification === "eligible" && destinationPath && existingPaths.has(destinationPath)) {
      classification = "destination-exists";
      reason = "Destination already exists.";
    }
    return {
      ...item,
      destinationPath,
      classification,
      reason,
      title: titleFor(item.sourcePath),
      project: inferProject(item.sourcePath, settings)
    };
  });

  const destinationCounts = new Map<string, number>();
  for (const item of draft) {
    if (item.classification === "eligible" && item.destinationPath) {
      destinationCounts.set(item.destinationPath, (destinationCounts.get(item.destinationPath) ?? 0) + 1);
    }
  }
  const items = draft.map((item): PlanItem => Object.freeze(
    item.classification === "eligible" && item.destinationPath && (destinationCounts.get(item.destinationPath) ?? 0) > 1
      ? { ...item, classification: "destination-ambiguous", reason: "Multiple sources resolve to this destination." }
      : item
  ));
  return Object.freeze({
    id: idFactory?.() ?? (() => { throw new Error("secure-id-unavailable"); })(),
    settingsFingerprint: settingsFingerprint(settings),
    createdAt: now.toISOString(),
    items: Object.freeze(items)
  });
}

export function isPlanCurrent(plan: ConversionPlan, settings: SoundingsSettings): boolean {
  return plan.settingsFingerprint === settingsFingerprint(settings);
}
