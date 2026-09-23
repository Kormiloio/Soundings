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

const TIMING = /^\d{2,}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2,}:\d{2}:\d{2}\.\d{3}(?:\s+.*)?$/;
const ALLOWED_TAG = /^\/?(?:b|i|u|c(?:\.[^ >]+)*|lang(?:\s+[^>]+)?|ruby|rt)$/i;

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&lrm;/g, "\u200e")
    .replace(/&rlm;/g, "\u200f")
    .replace(/&nbsp;/g, "\u00a0");
}

function parseCuePayload(payload: string): Result<TranscriptBlock, "unsupported-vtt"> {
  let speaker: string | undefined;
  let text = payload;
  const voice = text.match(/^<v(?:\.([^\s>]+))?\s+([^>]+)>([\s\S]*?)<\/v>$/i);
  if (voice) {
    speaker = decodeEntities(voice[2].trim());
    text = voice[3];
  }
  let unsupported = false;
  text = text.replace(/<([^>]+)>/g, (_match, tag: string) => {
    if (!ALLOWED_TAG.test(tag.trim())) unsupported = true;
    return "";
  });
  if (unsupported) return { ok: false, error: "unsupported-vtt" };
  return { ok: true, value: { text: decodeEntities(text), ...(speaker ? { speaker } : {}) } };
}

export function parseVtt(text: string): Result<ParsedTranscript, "empty" | "malformed-vtt" | "unsupported-vtt"> {
  if (text.length === 0) return { ok: false, error: "empty" };
  const lines = text.split("\n");
  if (!/^WEBVTT(?:\s.*)?$/.test(lines[0])) return { ok: false, error: "malformed-vtt" };
  const body = lines.slice(1).join("\n").trim();
  if (body.length === 0) return { ok: false, error: "empty" };
  const chunks = body.split(/\n{2,}/);
  const blocks: TranscriptBlock[] = [];
  for (const chunk of chunks) {
    const cue = chunk.split("\n");
    if (cue[0] === "NOTE" || cue[0].startsWith("NOTE ")) continue;
    if (/^(STYLE|REGION)(?:\s|$)/.test(cue[0])) return { ok: false, error: "unsupported-vtt" };
    let timingIndex = 0;
    if (!cue[0].includes("-->")) timingIndex = 1;
    if (!cue[timingIndex] || !TIMING.test(cue[timingIndex])) return { ok: false, error: "malformed-vtt" };
    const payload = cue.slice(timingIndex + 1).join("\n");
    if (payload.length === 0) return { ok: false, error: "malformed-vtt" };
    const parsed = parseCuePayload(payload);
    if (!parsed.ok || !parsed.value) return { ok: false, error: parsed.error ?? "unsupported-vtt" };
    blocks.push(parsed.value);
  }
  if (blocks.length === 0) return { ok: false, error: "empty" };
  return { ok: true, value: { format: "vtt", blocks: Object.freeze(blocks) } };
}

export function parseTranscript(format: TranscriptFormat, bytes: Uint8Array): Result<ParsedTranscript, ParseError> {
  const decoded = decodeUtf8(bytes);
  if (!decoded.ok || decoded.value === undefined) return { ok: false, error: decoded.error ?? "unsupported-encoding" };
  return format === "txt" ? parseTxt(decoded.value) : parseVtt(decoded.value);
}
