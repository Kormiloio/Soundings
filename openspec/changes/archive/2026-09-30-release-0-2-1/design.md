# Design

## Context

The parser, evidence check, and enrichment modal are pure or adapter-thin; all fixes stay in those layers and keep discovery/planning separate from vault mutation. Desktop-only scope is unchanged; nothing here adds Node or platform APIs, so future mobile evaluation is unaffected.

## Decisions

1. **Voice segmentation.** A cue payload is split at each `<v …>` start tag. Text before the first voice tag becomes an unattributed block; each voice span becomes a block with that span's speaker. Every block carries the cue's timing. Segments are trimmed of surrounding whitespace and empty segments are dropped only when a cue has more than one segment, so single-voice output stays byte-identical to `0.2.0` goldens. *Alternative rejected:* keeping one block and inlining `Speaker:` prefixes — that mixes generated labels into literal transcript text.
2. **Header block.** After the `WEBVTT` line, lines are skipped until the first blank line, stopping early at a line containing `-->` so files without a blank line after the signature keep parsing as before.
3. **Separators.** Cue chunks split on one or more lines that are empty or contain only spaces/tabs. A chunk without a timing line still fails closed as `malformed-vtt`, so no text is merged silently.
4. **Entities.** One regular-expression pass maps `&amp; &lt; &gt; &lrm; &rlm; &nbsp;`; decoded output is never re-scanned.
5. **Enrichment draft retention.** `publish` returns the outcome; the modal closes only on `created`. On any other outcome it shows the content-free reason and returns to the entry step with the draft intact. For `stale`, the modal asks the plugin to re-identify the source note and uses the fresh evidence and a fresh existing-path snapshot for the next review. If the note is no longer a Soundings note, publishing stays blocked. Canceling still discards the draft.
6. **Frontmatter fences.** The note must begin with a line that is exactly `---` (optional BOM, optional trailing whitespace); frontmatter ends at the next such line.
7. **Release workflow.** A `build` job (permissions `contents: read`, `persist-credentials: false`, full history) runs every gate, verifies the tag commit is reachable from `origin/main`, stages assets, extracts the `## <version>` changelog section, and uploads one artifact. A `publish` job (job-scoped `contents: write`, `id-token: write`, `attestations: write`) downloads that artifact, refuses an existing release, attests the three assets, and creates the release from those same bytes. It never checks out or installs dependencies. Actions are pinned to full commit SHAs with the version in a comment. Tag filter is bare `[0-9]+.[0-9]+.[0-9]+` only.

## Risks / Trade-offs

- Multi-voice notes change shape compared with `0.2.0` → documented in the changelog; only affects new conversions; existing notes are never touched.
- SHA pins need manual bumps → acceptable for a release workflow with write permission.
- Keeping a draft in memory longer → it is never persisted or logged; closing the modal discards it.

## Migration

None for vaults. Release `0.2.1` is the first published through the attested workflow (task 4.3 of `automate-release-provenance`).
