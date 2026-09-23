import type { DiscoveryItem } from "./discovery";
import { settingsFingerprint, type SoundingsSettings } from "./settings";
import type { ConversionPlan, PlanItem } from "./types";

export function destinationFor(sourcePath: string): string {
  const slash = sourcePath.lastIndexOf("/");
  const dot = sourcePath.lastIndexOf(".");
  if (dot <= slash) throw new Error("source-has-no-extension");
  return `${sourcePath.slice(0, dot)}.md`;
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
  idFactory: () => string = () => globalThis.crypto.randomUUID()
): ConversionPlan {
  const draft = discovery.map((item): PlanItem => {
    const destinationPath = destinationFor(item.sourcePath);
    let classification = item.classification;
    let reason = item.reason;
    if (classification === "eligible" && existingPaths.has(destinationPath)) {
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
    if (item.classification === "eligible") {
      destinationCounts.set(item.destinationPath, (destinationCounts.get(item.destinationPath) ?? 0) + 1);
    }
  }
  const items = draft.map((item): PlanItem => Object.freeze(
    item.classification === "eligible" && (destinationCounts.get(item.destinationPath) ?? 0) > 1
      ? { ...item, classification: "destination-ambiguous", reason: "Multiple sources resolve to this destination." }
      : item
  ));
  return Object.freeze({
    id: idFactory(),
    settingsFingerprint: settingsFingerprint(settings),
    createdAt: now.toISOString(),
    items: Object.freeze(items)
  });
}

export function isPlanCurrent(plan: ConversionPlan, settings: SoundingsSettings): boolean {
  return plan.settingsFingerprint === settingsFingerprint(settings);
}
