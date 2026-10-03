# Design

## Context

Output profiles already offer constrained, validated choices: title, destination name, sections, tags, and timestamp policy. Each is bound into the plan fingerprint and shown in the review summary. Transcript display is one more choice of the same kind. Rendering stays pure in `src/core/rendering.ts`; nothing touches discovery, planning, or the create-only executor.

## Decisions

1. **One option, two values.**
   - `OutputProfile.transcriptDisplay: "plain" | "folded-callout"`, default `plain`.
   - Saved profiles without the field migrate to `plain`. An unknown value is rejected by `validateOutputProfile` with an actionable error. The existing migration then restores the default profile with a content-free notice, as for any invalid profile value.
   - *Deferred:* an expanded variant (`+`), a custom label, and other callout types. Each widens the input surface (a free-text label would need escaping as a callout title) and none is needed for the core goal. They can be added later as further constrained choices.

2. **Callout shape.** For `folded-callout`, the transcript section is:

   ```markdown
   ## Transcript

   > [!quote]- Full Transcript
   > ### Alice
   >
   > ~~~text
   > We need to understand the migration.
   > ~~~
   ```

   - **Callout type `quote`:** semantically a transcript, with a built-in Obsidian style and no theme dependency.
   - **Folded by default (`-`):** the point of the feature.
   - **Fixed label `Full Transcript`:** literal, so no escaping is needed.
   - **Heading outside:** `## Transcript` stays outside the callout, so the section heading, outline, and links to `#Transcript` are unchanged.
   - **Speakers inside:** speaker headings (`### …`) stay inside the callout, unchanged from plain output apart from the prefix.

3. **Containment by prefixing.**
   - The plain transcript body is rendered exactly as today: blocks, speaker headings, timing lines, and dynamically sized `~~~` fences.
   - Then every line of that body is prefixed: non-empty lines with `> ` and empty lines with `>`.
   - Because fence sizing happens before prefixing, a transcript cannot close its fence early. Because every line, including blank ones, carries the container marker, CommonMark cannot end the blockquote before the final line, since lazy continuation does not apply inside fenced code.
   - A transcript line that itself starts with `>` or `> [!note]` is literal text inside the fence, so it cannot open a nested callout.
   - The renderer splits on `\n` only; input is already normalized from CRLF by the decoder.
   - *Alternative rejected:* an HTML `<details>` block. It is raw HTML in a note, which the Markdown contract forbids for source-derived content, and Obsidian search and editing treat it worse.

4. **Schema version and identity.**
   - `noteSchemaVersion` returns `2` whenever `transcriptDisplay` is not `plain`, matching every other non-default profile choice. A plain default note stays version `1`.
   - Frontmatter is unchanged, so manual-enrichment source identification (versions 1 and 2) works for folded notes without change.

5. **Fingerprint, summary, settings screen.**
   - **Fingerprint:** `outputProfileFingerprint` includes `transcriptDisplay`, so changing it after review makes the plan stale.
   - **Summary:** `outputProfileSummary` appends `transcript: plain` or `transcript: folded callout`.
   - **Settings screen:** a **Transcript display** dropdown appears in the Note output group with the description "Plain shows the full transcript; Folded callout collapses it behind one click and stays searchable."

6. **Structural verification.**
   - Tests parse rendered notes with `micromark` (CommonMark), exact-pinned as a dev dependency, and assert that:
     - exactly one blockquote follows `## Transcript`
     - its first line is the callout marker
     - every transcript character appears inside it
     - nothing from the transcript appears after it
   - Adversarial inputs include:
     - lines starting with `>`, `> [!note]`, `~~~` and backtick runs, `---`, `#`, and `</details>`
     - many blank lines, a 5 MB transcript, and multi-speaker WebVTT with retained timestamps
   - Obsidian's callout handling extends CommonMark blockquotes, so packaged desktop acceptance verifies the real rendering: folded state, expand on click, search hits inside, and speaker headings.

7. **Bounds.** Prefixing is a single linear pass, adding about 2 bytes per line. The bounded-processing tests cover the folded path at the size limit.

## Risks / Trade-offs

- **Source bytes change.** The Markdown source of folded notes differs from plain notes: every transcript line starts with `> `. That is visible in source mode and opt-in.
- **Outline.** Obsidian may not list headings inside a folded callout in the Outline pane. Speaker headings were never the main navigation and `## Transcript` stays outside. Acceptance records the actual behavior.
- **Changing the setting** only affects new conversions. Existing notes are never rewritten, which is documented.

## Migration

None for vaults. Saved settings without `transcriptDisplay` load as `plain`, and their output is byte-identical to `0.2.3`.
