import type { ParsedTranscript, Result, TranscriptBlock, TranscriptFormat } from "./types";

export type ParseError = "unsupported-encoding" | "empty" | "malformed-vtt" | "unsupported-vtt";

export function decodeUtf8(bytes: Uint8Array): Result<string, "unsupported-encoding"> {
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const withoutBom = decoded.charCodeAt(0) === 0xfeff ? decoded.slice(1) : decoded;
    return { ok: true, value: withoutBom.replace(/\r\n?/g, "\n") };
  } catch {
    return { ok: false, error: "unsupported-encoding" };
  }
}

export function parseTxt(text: string): Result<ParsedTranscript, "empty"> {
  if (text.length === 0) return { ok: false, error: "empty" };
  return { ok: true, value: { format: "txt", blocks: Object.freeze([{ text }]) } };
}

const TIMING = /^(\d{2,}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2,}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})(?:\s+.*)?$/;
// Equivalent to the 0.2.1 language without ambiguous repetition, so matching cannot backtrack.
const ALLOWED_TAG = /^\/?(?:b|i|u|c(?:\.[^ >]+)?|lang(?:\s[^>]*)?|ruby|rt)$/i;
const MAX_TAG_LENGTH = 256;

const CHARACTER_REFERENCES: Readonly<Record<string, string>> = Object.freeze({
  amp: "&",
  lt: "<",
  gt: ">",
  lrm: "\u200e",
  rlm: "\u200f",
  nbsp: "\u00a0"
});

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|lrm|rlm|nbsp);/g, (_match, name: string) => CHARACTER_REFERENCES[name]);
}

function validTimestamp(value: string): boolean {
  const parts = value.split(":");
  if (parts.length === 3) {
    const [, minutes = "", seconds = ""] = parts;
    return Number(minutes) <= 59 && Number(seconds.slice(0, 2)) <= 59;
  }
  if (parts.length === 2) {
    const [, seconds = ""] = parts;
    return Number(seconds.slice(0, 2)) <= 59;
  }
  return false;
}

type CueToken =
  | { readonly kind: "text"; readonly value: string }
  | { readonly kind: "tag"; readonly body: string };

// Single left-to-right pass: a tag runs from "<" to the next ">", as in 0.2.1.
// A "<" with no later ">" is literal text and "<>" is literal. A tag body that is longer than
// MAX_TAG_LENGTH or contains "<" is refused, because its boundaries are ambiguous.
function tokenizeCue(payload: string): Result<readonly CueToken[], "unsupported-vtt"> {
  const tokens: CueToken[] = [];
  let textStart = 0;
  let searchFrom = 0;
  while (searchFrom < payload.length) {
    const open = payload.indexOf("<", searchFrom);
    if (open === -1) break;
    const close = payload.indexOf(">", open + 1);
    if (close === -1) break;
    if (close === open + 1) {
      searchFrom = close + 1;
      continue;
    }
    const body = payload.slice(open + 1, close);
    if (body.length > MAX_TAG_LENGTH || body.includes("<")) return { ok: false, error: "unsupported-vtt" };
    if (open > textStart) tokens.push({ kind: "text", value: payload.slice(textStart, open) });
    tokens.push({ kind: "tag", body });
    textStart = close + 1;
    searchFrom = close + 1;
  }
  if (textStart < payload.length) tokens.push({ kind: "text", value: payload.slice(textStart) });
  return { ok: true, value: tokens };
}

function isWhitespace(character: string | undefined): boolean {
  return character !== undefined && /\s/.test(character);
}

// Returns the raw annotation of a voice start tag (`v`, optional `.class`, whitespace, annotation), else undefined.
function voiceAnnotation(body: string): string | undefined {
  if (body[0] !== "v" && body[0] !== "V") return undefined;
  let index = 1;
  if (body[index] === ".") {
    const classStart = index + 1;
    index = classStart;
    while (index < body.length && !isWhitespace(body[index])) index += 1;
    if (index === classStart) return undefined;
  }
  if (!isWhitespace(body[index]) || body.length - index < 2) return undefined;
  return body.slice(index);
}

function isVoiceMarkup(body: string): boolean {
  const first = body[0] === "/" ? body[1] : body[0];
  return first === "v" || first === "V";
}

function parseCuePayload(
  payload: string,
  timing: TranscriptBlock["timing"]
): Result<readonly TranscriptBlock[], "unsupported-vtt"> {
  const tokens = tokenizeCue(payload);
  if (!tokens.ok || !tokens.value) return { ok: false, error: "unsupported-vtt" };

  const segments: Array<{ readonly speaker?: string; readonly parts: string[]; hasRaw: boolean }> = [];
  let current: { readonly speaker?: string; readonly parts: string[]; hasRaw: boolean } = { parts: [], hasRaw: false };
  for (const token of tokens.value) {
    if (token.kind === "text") {
      current.parts.push(token.value);
      current.hasRaw = true;
      continue;
    }
    const annotation = voiceAnnotation(token.body);
    if (annotation !== undefined) {
      if (current.hasRaw || current.speaker !== undefined) segments.push(current);
      current = { speaker: decodeEntities(annotation.trim()), parts: [], hasRaw: false };
      continue;
    }
    if (!isVoiceMarkup(token.body) && !ALLOWED_TAG.test(token.body.trim())) return { ok: false, error: "unsupported-vtt" };
    current.hasRaw = true;
  }
  segments.push(current);

  const multiple = segments.length > 1;
  const blocks: TranscriptBlock[] = [];
  for (const segment of segments) {
    const decoded = decodeEntities(segment.parts.join(""));
    const text = multiple ? decoded.trim() : decoded;
    if (multiple && text.length === 0) continue;
    blocks.push({ text, ...(segment.speaker ? { speaker: segment.speaker } : {}), timing });
  }
  return { ok: true, value: blocks };
}

export function parseVtt(text: string): Result<ParsedTranscript, "empty" | "malformed-vtt" | "unsupported-vtt"> {
  if (text.length === 0) return { ok: false, error: "empty" };
  const lines = text.split("\n");
  if (!/^WEBVTT(?:\s.*)?$/.test(lines[0])) return { ok: false, error: "malformed-vtt" };
  let bodyStart = 1;
  while (bodyStart < lines.length && lines[bodyStart].trim() !== "" && !lines[bodyStart].includes("-->")) bodyStart += 1;
  const body = lines.slice(bodyStart).join("\n").trim();
  if (body.length === 0) return { ok: false, error: "empty" };
  const chunks = body.split(/\n(?:[ \t]*\n)+/);
  const blocks: TranscriptBlock[] = [];
  for (const chunk of chunks) {
    const cue = chunk.split("\n");
    if (cue[0] === "NOTE" || cue[0].startsWith("NOTE ")) continue;
    if (/^(STYLE|REGION)(?:\s|$)/.test(cue[0])) return { ok: false, error: "unsupported-vtt" };
    let timingIndex = 0;
    if (!cue[0].includes("-->")) timingIndex = 1;
    const timingMatch = cue[timingIndex]?.match(TIMING);
    if (!timingMatch || !validTimestamp(timingMatch[1]) || !validTimestamp(timingMatch[2])) {
      return { ok: false, error: "malformed-vtt" };
    }
    const payload = cue.slice(timingIndex + 1).join("\n");
    if (payload.length === 0) return { ok: false, error: "malformed-vtt" };
    const parsed = parseCuePayload(payload, Object.freeze({ start: timingMatch[1], end: timingMatch[2] }));
    if (!parsed.ok || !parsed.value) return { ok: false, error: parsed.error ?? "unsupported-vtt" };
    blocks.push(...parsed.value);
  }
  if (blocks.length === 0) return { ok: false, error: "empty" };
  return { ok: true, value: { format: "vtt", blocks: Object.freeze(blocks) } };
}

export function parseTranscript(format: TranscriptFormat, bytes: Uint8Array): Result<ParsedTranscript, ParseError> {
  const decoded = decodeUtf8(bytes);
  if (!decoded.ok || decoded.value === undefined) return { ok: false, error: decoded.error ?? "unsupported-encoding" };
  return format === "txt" ? parseTxt(decoded.value) : parseVtt(decoded.value);
}
