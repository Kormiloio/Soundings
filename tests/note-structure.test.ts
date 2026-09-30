import { describe, expect, it } from "vitest";
import { buildEnrichmentPlan } from "../src/core/enrichment-planning";
import { identifySourceNote } from "../src/core/enrichment-evidence";
import { isLinkableVaultPath, renderCompanionMarkdown } from "../src/core/enrichment-rendering";
import type { EnrichmentDraft } from "../src/core/enrichment-draft";
import { sha256 } from "../src/core/hash";
import { renderMarkdown, safeHeading, yamlScalar } from "../src/core/rendering";
import type { NoteMetadata } from "../src/core/types";
import { testDigest } from "./test-crypto";

const encoder = new TextEncoder();

const metadata: NoteMetadata = {
  sourceFile: "Meeting.vtt",
  sourceFormat: "vtt",
  title: "Meeting",
  convertedAt: "2026-09-30T00:00:00.000Z"
};

function draft(overrides: Partial<EnrichmentDraft>): EnrichmentDraft {
  return { summary: "", decisions: [], actionItems: [], followUps: [], ...overrides };
}

/** Headings and thematic breaks that begin a line outside fenced blocks. */
function structuralLines(markdown: string): string[] {
  const lines: string[] = [];
  let fence: string | undefined;
  const body = markdown.startsWith("---\n") ? markdown.slice(markdown.indexOf("\n---\n", 4) + 5) : markdown;
  for (const line of body.split("\n")) {
    const trimmed = line.trimStart();
    const opener = /^(`{3,}|~{3,})/.exec(trimmed)?.[1];
    if (fence) {
      if (opener && opener[0] === fence[0] && opener.length >= fence.length) fence = undefined;
      continue;
    }
    if (opener) { fence = opener; lines.push(`fence:${opener}`); continue; }
    if (/^#{1,6}\s/.test(trimmed)) lines.push(trimmed);
    else if (/^=+\s*$/.test(trimmed) || /^(?:-[ \t]*){3,}$/.test(trimmed) || /^(?:\*[ \t]*){3,}$/.test(trimmed) || /^(?:_[ \t]*){3,}$/.test(trimmed) || /^-+\s*$/.test(trimmed)) {
      lines.push(`setext-or-break:${trimmed}`);
    }
  }
  return lines;
}

describe("heading inline syntax", () => {
  it.each(["%%", "$", "==", "~~", "^"])("escapes %j in generated headings", (token) => {
    const heading = safeHeading(`A ${token} B`);
    for (const character of new Set(token)) {
      expect(heading).not.toMatch(new RegExp(`(?<!\\\\)\\${character}`));
    }
    expect(heading.replaceAll("\\", "")).toBe(`A ${token} B`);
  });

  it("keeps a %% speaker from hiding later transcript text", () => {
    const markdown = renderMarkdown({ format: "vtt", blocks: [
      { speaker: "%%", text: "hidden?" },
      { speaker: "Bob", text: "still visible" }
    ] }, metadata);
    expect(markdown).toContain("### \\%\\%\n");
    expect(markdown).not.toMatch(/^### %%/m);
  });

  it("keeps a $5 … $10 title from rendering as math", () => {
    const markdown = renderMarkdown({ format: "txt", blocks: [{ text: "x" }] }, { ...metadata, title: "Budget $5 to $10" });
    expect(markdown).toContain("# Budget \\$5 to \\$10\n");
  });

  it("leaves ordinary headings unchanged", () => {
    expect(safeHeading("Mario")).toBe("Mario");
    expect(safeHeading("Katie O'Neil — Q3")).toBe("Katie O'Neil — Q3");
  });
});

describe("frontmatter control characters", () => {
  it.each(["\u0085", "\u009f", "\u2028", "\u2029"])("escapes %j in a YAML scalar", (character) => {
    const scalar = yamlScalar(`a${character}b`);
    expect(scalar).not.toContain(character);
    expect(scalar).toMatch(/^"a\\u[0-9a-f]{4}b"$/);
    expect(JSON.parse(scalar)).toBe(`a${character}b`);
  });

  it("keeps ordinary Unicode and existing escapes unchanged", () => {
    expect(yamlScalar("Željko \"quoted\" 會議")).toBe(JSON.stringify("Željko \"quoted\" 會議"));
  });

  it("writes a filename with C1 controls as a single-line frontmatter value", () => {
    const markdown = renderMarkdown({ format: "txt", blocks: [{ text: "x" }] }, { ...metadata, sourceFile: "a\u0085b\u2028c.txt" });
    const frontmatter = markdown.split("\n---\n")[0];
    expect(frontmatter).not.toMatch(/[\u0080-\u009f\u2028\u2029]/);
    expect(frontmatter).toContain('source_file: "a\\u0085b\\u2028c.txt"');
  });
});

describe("enrichment prose structure", () => {
  const attacks = ["~~~", "```", "````js", "---", "===", "***", "___", "- - -", "# heading", "   ~~~"];

  it.each(attacks)("keeps sections intact when the summary contains %j", (line) => {
    const markdown = renderCompanionMarkdown("folder/note.md", draft({ summary: `Intro\n${line}\nOutro`, decisions: ["D1"] }), "t");
    expect(structuralLines(markdown)).toEqual([
      "## Summary",
      "## Decisions",
      "## Action Items",
      "## Follow-ups",
      "setext-or-break:---"
    ]);
    expect(markdown).toContain("[[folder/note|Back to Transcript Note]]");
    expect(markdown.replaceAll("\\", "")).toContain(line.trimStart());
  });

  it.each(attacks)("keeps sections intact when a list item is %j", (line) => {
    const markdown = renderCompanionMarkdown("folder/note.md", draft({ decisions: [line], actionItems: [line] }), "t");
    expect(structuralLines(markdown)).toEqual([
      "## Summary",
      "## Decisions",
      "## Action Items",
      "## Follow-ups",
      "setext-or-break:---"
    ]);
  });

  it("leaves ordinary prose unchanged", () => {
    const markdown = renderCompanionMarkdown("folder/note.md", draft({ summary: "Line one\nLine two - with dash", decisions: ["Ship it"] }), "t");
    expect(markdown).toContain("## Summary\n\nLine one\nLine two - with dash\n");
    expect(markdown).toContain("- Ship it");
  });
});

describe("linkable companion sources", () => {
  const NOTE = '---\ntype: "meeting-transcript"\nsource: "transcript"\nsoundings_version: 1\n---\n# T\n';

  it.each(["x]] <img src=https://attacker.example/p.png> [[y.md", "Meeting [#3].md", "a|b.md", "a#b.md", "a^b.md", "a<b.md", "a>b.md", "a\nb.md", "folder]/note.md"])(
    "refuses %j as an enrichment source",
    async (path) => {
      expect(isLinkableVaultPath(path)).toBe(false);
      const identified = await identifySourceNote(path, encoder.encode(NOTE), 5_000_000, (data) => sha256(data, testDigest));
      expect(identified).toEqual({ ok: false, error: "source-note-unlinkable" });
    }
  );

  it.each(["folder/note.md", "Meetings/1 - 1 Review (final).md", "Željko/會議.md"])("accepts %j", (path) => {
    expect(isLinkableVaultPath(path)).toBe(true);
  });

  it("does not plan a companion for an unlinkable source", async () => {
    const evidence = { path: "a#b.md", byteLength: 1, sha256: "x", soundingsVersion: 1 };
    const plan = buildEnrichmentPlan("a#b.md", evidence, draft({ summary: "S" }), new Set(), new Date(0), "e");
    expect(plan.status).toBe("destination-invalid");
    expect(plan.renderedMarkdown).toBe("");
  });
});
