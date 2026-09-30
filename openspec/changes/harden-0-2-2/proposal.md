# Proposal

## Why

A full code review and security review of published release `0.2.1` (2026-09-30) found no confidentiality or overwrite defect, but did find availability, identity, lifecycle, and structure defects that an untrusted transcript or an ordinary vault event can trigger:

- **Parser denial of service (high, reproduced).** The WebVTT voice-tag expression in `src/core/parsers.ts` backtracks cubically: 3 KB of `<v.` takes about 2 s and 6 KB about 12 s on the UI thread. The generic tag expression is quadratic on unterminated `<` runs. The `c.class` branch of the allowed-tag expression backtracks exponentially, so a tag of roughly 100 characters freezes the parser (found during implementation). The 5 MB source limit does not bound this. A small file placed in a shared or synced vault freezes Obsidian during scan, conversion, or, with observation enabled, with no user action.
- **Observation runs at vault load.** The `create` subscription is registered during `onload`, and Obsidian emits `create` for every existing file before layout is ready. Every existing transcript is re-read and queued on launch. Combined with the parser defect, one poisoned file would freeze every launch.
- **Observation busy-blocking.** Every created file of any type enters the pending set and runs every stability retry (about 750 ms), even for non-transcripts and permanent outcomes. Sync bursts block scan, conversion, and enrichment as "already running" for minutes.
- **Batch abort on tilde runs.** Fence sizing spreads every `~` run into `Math.max`. About 150,000 runs throw `RangeError` outside any per-item isolation, so the remaining selected items are abandoned without a results summary.
- **Case- and Unicode-variant collisions are not planned.** Planning compares exact strings, so `Bar.txt` beside an existing `bar.md`, or two sources differing only by case or Unicode form, are reported eligible on case-insensitive desktop filesystems. Obsidian's own `createBinary` existence check fails the write safely, but the review plan misstates the outcome.
- **Hidden destinations.** Sanitization can produce a dot-leading basename (`?.env.txt` → `.env.md`) that Obsidian does not index, so neither collision check can see it and the created note would be invisible.
- **Unload does not disable open modals.** A review or enrichment modal left open after the plugin is disabled can still start a create operation.
- **WebVTT attribution after `</v>`.** Text following a closing voice tag is credited to the previous speaker, contrary to the per-speaker requirement. The voice-tag expression also strips unknown tags that merely start with `v` (for example `<video>`), instead of refusing them.
- **Structure breaks in notes.** An enrichment Summary line of `~~~`, a backtick fence, `---`, or `===` changes companion-note structure. A companion backlink target containing `]]`, `|`, `#`, `^`, or `[` can break out of the wikilink and inject raw HTML such as a remote `<img>`. Speaker and title headings leave Obsidian inline syntax (`%%`, `$`, `==`, `~~`, `^`) active, so a speaker named `%%` can hide later transcript text in reading view.
- **Settings.** Any settings change clears the observation inbox. Saved settings are not type-checked, so `"false"` enables observation and a non-array `excludedPaths` prevents the plugin from loading.
- **Smaller defects.** The decoder strips a second, genuine leading U+FEFF. C1 control characters in filenames are written raw into YAML frontmatter. Two fingerprint checks were reported as comparing a value with itself; implementation showed each is the only guard against publishing unreviewed output when a caller passes mutable input, so they are kept and tested (see design decision 14). One test asserts a different code path than its name claims. Closing the progress dialog with Esc does not cancel the run.
- **Release tooling.** `scripts/prepare-release.mjs` will recursively remove any in-repository `--output` path, including `src` or `.git`. `scripts/audit-runtime.mjs` is a name blocklist that misses `requestUrl`, `request`, dynamic `import()`, `eval`, `new Function`, `vault.adapter.*` writes, `vault.process`, `vault.append`, `vault.modifyBinary`, and `fileManager.trashFile`. The `obsidian` dev dependency is declared as `latest`.

## What Changes

- Replace regular-expression cue-markup handling with a single linear scan that bounds tag length and refuses unknown or ambiguous tags (a tag body containing `<`). Unterminated `<` stays literal as in 0.2.1. Add explicit end-of-voice handling so text after `</v>` has no speaker. Recognize the voice tag only when `v` is followed by whitespace, `.`, or `>`.
- Size tilde fences with a loop, and isolate parse and render failures per item as a `failed` outcome.
- Register observation only after `workspace.onLayoutReady`. Prefilter created paths synchronously (format, enabled formats, roots, exclusions) before they enter the pending set. Stop stability retries on outcomes that cannot change by waiting. Keep the inbox across settings changes that do not affect observation.
- Compare destinations with case-folded, NFC-normalized keys, both for existing paths and for in-plan ambiguity. Classify dot-leading sanitized basenames as `destination-invalid`. At execution, additionally refuse when `vault.adapter.exists` reports the destination.
- Add an `unloaded` guard to scan, conversion, and enrichment entry points. Close owned modals on unload, and make closing the progress dialog cancel the run.
- Neutralize fence openers and setext underlines in enrichment prose. Refuse enrichment for a source note whose path cannot be safely wikilinked. Escape Obsidian inline syntax in generated headings. Escape C1 controls in frontmatter strings.
- Type-check every saved-settings field, falling back to the safe default with a content-free migration warning.
- Remove the duplicate BOM strip, document and test the two fingerprint guards, and fix the misattributed test.
- Restrict release staging to `release/<x.y.z>` with a symlink check. Harden the runtime audit with a bundle import allowlist and a repository-wide forbidden-member list. Pin the `obsidian` dev dependency to an exact version.
- Bump to `0.2.2`; update the changelog, PRD, `openspec/project.md`, and verification docs.

Non-goals:
- no new transcript format, output option, or UI feature
- no new vault mutation, and no overwrite, rename, move, or delete behavior
- no network access, AI provider, or telemetry
- no mobile support
- no change to published releases `0.1.0`–`0.2.1`
- no broadening of WebVTT acceptance (empty cue payloads, `NOTE<tab>`, classed `b`/`i`/`u` tags are deferred to the caption-format roadmap change)

## User-data safety

This change adds no vault mutation and only tightens existing guards. Conversion and companion publication remain create-only with source and destination revalidation. The extra execution-time `adapter.exists` check can only turn a would-be create into a refusal. New refusals (dot-leading destinations, unlinkable companion sources, case-variant collisions, unknown `v…` tags, oversized or unterminated tags) fail closed with content-free reasons. Generated-note output changes only for inputs that previously produced unsafe structure (headings containing Obsidian inline syntax, C1 controls in metadata, enrichment prose with fence or setext lines, text after `</v>`). Existing notes are never modified. Diagnostics remain content-free.

## Capabilities

### Modified Capabilities

- `transcript-conversion`: bounded linear-time parsing, closing-voice attribution, strict voice-tag recognition, single BOM removal, heading and metadata escaping.
- `conversion-planning`: case- and Unicode-insensitive collision identity; refusal of dot-leading destinations.
- `safe-note-publication`: filesystem-level existence refusal, per-item isolation of parse and render failures, unload and progress-dialog lifecycle.
- `transcript-inbox`: layout-ready subscription, synchronous prefilter, bounded retries, inbox retention across unrelated settings changes.
- `manual-enrichment`: structure-safe prose rendering, linkable-source requirement, unload guard.
- `note-output-configuration`: type-validated saved settings.
- `community-release`: allowlist runtime audit, confined release staging, pinned host API types.

## Impact

- **Code:** `src/core/parsers.ts`, `rendering.ts`, `planning.ts`, `execution.ts`, `observation.ts`, `settings.ts`, `enrichment-rendering.ts`, `enrichment-execution.ts`, `enrichment-evidence.ts`; `src/obsidian/vault-adapter.ts`, `review-modal.ts`, `enrichment-modal.ts`; `src/main.ts`.
- **Scripts and packaging:** `scripts/audit-runtime.mjs`, `scripts/prepare-release.mjs`, `package.json`, `package-lock.json`.
- **Tests and docs:** tests, `CHANGELOG.md`, `docs/`, `openspec/project.md`, version metadata.
