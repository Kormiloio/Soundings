import type { Result } from "./types";

export interface SourceNoteEvidence {
  readonly path: string;
  readonly byteLength: number;
  readonly sha256: string;
  readonly soundingsVersion: number;
}

export async function identifySourceNote(
  path: string,
  bytes: Uint8Array,
  maxBytes: number,
  digest: (data: Uint8Array) => Promise<string>
): Promise<Result<SourceNoteEvidence, "invalid-soundings-note">> {
  if (bytes.byteLength > maxBytes) return { ok: false, error: "invalid-soundings-note" };
  
  let content: string;
  try {
    content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, error: "invalid-soundings-note" };
  }

  const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!frontmatterMatch) return { ok: false, error: "invalid-soundings-note" };

  const yaml = frontmatterMatch[1];
  const typeMatch = yaml.match(/^type:\s*(?:"meeting-transcript"|meeting-transcript)/m);
  if (!typeMatch) return { ok: false, error: "invalid-soundings-note" };

  const versionMatch = yaml.match(/^soundings_version:\s*(\d+)/m);
  if (!versionMatch) return { ok: false, error: "invalid-soundings-note" };

  const version = parseInt(versionMatch[1], 10);
  if (isNaN(version)) return { ok: false, error: "invalid-soundings-note" };

  return {
    ok: true,
    value: {
      path,
      byteLength: bytes.byteLength,
      sha256: await digest(bytes),
      soundingsVersion: version
    }
  };
}
