import { isLinkableVaultPath } from "./enrichment-rendering";
import type { Result } from "./types";

export interface SourceNoteEvidence {
  readonly path: string;
  readonly byteLength: number;
  readonly sha256: string;
  readonly soundingsVersion: number;
}

const SUPPORTED_SOUNDINGS_VERSIONS = new Set([1, 2]);

function frontmatterValue(frontmatter: string, key: string): string | undefined {
  const prefix = `${key}:`;
  const matches = frontmatter
    .split(/\r?\n/u)
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length).trim());
  return matches.length === 1 ? matches[0] : undefined;
}

function frontmatterBlock(content: string): string | undefined {
  const lines = (content.charCodeAt(0) === 0xfeff ? content.slice(1) : content).split(/\r?\n/u);
  if (lines[0]?.trimEnd() !== "---") return undefined;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trimEnd() === "---") return lines.slice(1, index).join("\n");
  }
  return undefined;
}

function isScalar(value: string | undefined, expected: string): boolean {
  return value === expected || value === JSON.stringify(expected);
}

export async function identifySourceNote(
  path: string,
  bytes: Uint8Array,
  maxBytes: number,
  digest: (data: Uint8Array) => Promise<string>
): Promise<Result<SourceNoteEvidence, "invalid-soundings-note" | "source-note-unlinkable">> {
  if (!isLinkableVaultPath(path)) return { ok: false, error: "source-note-unlinkable" };
  if (bytes.byteLength > maxBytes) return { ok: false, error: "invalid-soundings-note" };
  
  let content: string;
  try {
    content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, error: "invalid-soundings-note" };
  }

  const frontmatter = frontmatterBlock(content);
  if (frontmatter === undefined) return { ok: false, error: "invalid-soundings-note" };

  if (!isScalar(frontmatterValue(frontmatter, "type"), "meeting-transcript")) {
    return { ok: false, error: "invalid-soundings-note" };
  }
  if (!isScalar(frontmatterValue(frontmatter, "source"), "transcript")) {
    return { ok: false, error: "invalid-soundings-note" };
  }

  const rawVersion = frontmatterValue(frontmatter, "soundings_version");
  if (!rawVersion || !/^[0-9]+$/u.test(rawVersion)) {
    return { ok: false, error: "invalid-soundings-note" };
  }
  const version = Number(rawVersion);
  if (!SUPPORTED_SOUNDINGS_VERSIONS.has(version)) {
    return { ok: false, error: "invalid-soundings-note" };
  }

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
