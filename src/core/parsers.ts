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
const ALLOWED_TAG = /^\/?(?:b|i|u|c(?:\.[^ >]+)*|lang(?:\s+[^>]+)?|ruby|rt)$/i;

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

const VOICE_START = /<v(?:\.[^\s>]+)?\s+([^>]+)>/gi;

function stripCueMarkup(text: string): Result<string, "unsupported-vtt"> {
  let unsupported = false;
  const stripped = text
    .replace(/<\/?v(?:\.([^\s>]+))?\s*[^>]*>/gi, "")
    .replace(/<([^>]+)>/g, (_match, tag: string) => {
      if (!ALLOWED_TAG.test(tag.trim())) unsupported = true;
      return "";
    });
  return unsupported ? { ok: false, error: "unsupported-vtt" } : { ok: true, value: decodeEntities(stripped) };
}

function parseCuePayload(
  payload: string,
  timing: TranscriptBlock["timing"]
): Result<readonly TranscriptBlock[], "unsupported-vtt"> {
  const segments: Array<{ readonly speaker?: string; readonly raw: string }> = [];
  let cursor = 0;
  let speaker: string | undefined;
  for (const match of payload.matchAll(VOICE_START)) {
    const start = match.index ?? 0;
    if (start > cursor || speaker !== undefined) segments.push({ speaker, raw: payload.slice(cursor, start) });
    speaker = decodeEntities(match[1].trim());
    cursor = start + match[0].length;
  }
  segments.push({ speaker, raw: payload.slice(cursor) });

  const multiple = segments.length > 1;
  const blocks: TranscriptBlock[] = [];
  for (const segment of segments) {
    const stripped = stripCueMarkup(segment.raw);
    if (!stripped.ok || stripped.value === undefined) return { ok: false, error: "unsupported-vtt" };
    const text = multiple ? stripped.value.trim() : stripped.value;
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
