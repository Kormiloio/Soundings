import type { TxtLayout } from "./settings";
import type { ContentKind, PlanItem } from "./types";

export const CONTENT_KINDS: Readonly<Record<ContentKind, string>> = Object.freeze({
  transcript: "Transcript",
  notes: "Notes",
  "meeting-minutes": "Meeting Minutes",
  correspondence: "Correspondence",
  chat: "Chat"
});

export function isContentKind(value: unknown): value is ContentKind {
  return typeof value === "string" && Object.hasOwn(CONTENT_KINDS, value);
}

export function contentKindFor(item: Pick<PlanItem, "contentKind" | "format">): ContentKind | undefined {
  const kind = item.contentKind === undefined ? "transcript" : item.contentKind;
  return isContentKind(kind) && (kind === "transcript" || item.format === "txt") ? kind : undefined;
}

export function effectiveTxtLayout(item: PlanItem, layout: TxtLayout): TxtLayout {
  return contentKindFor(item) === "transcript" ? layout : "plain";
}

export function contentPolicyFingerprint(item: PlanItem): string {
  return JSON.stringify([
    item.sourcePath, item.format, item.contentKind ?? "transcript",
    item.txtLayout ?? "plain", item.txtInterpretation ?? "plain"
  ]);
}

export function isContentPolicyCurrent(item: PlanItem): boolean {
  return contentKindFor(item) !== undefined
    && (item.contentPolicyFingerprint === undefined
      ? (item.contentKind ?? "transcript") === "transcript"
      : item.contentPolicyFingerprint === contentPolicyFingerprint(item));
}

export function contentKindDescription(item: PlanItem): string {
  const kind = contentKindFor(item);
  if (!kind) return "Invalid content type.";
  return kind === "transcript" ? item.reason
    : `${CONTENT_KINDS[kind]}. Interpretation: literal plain text; entire source preserved.`;
}
