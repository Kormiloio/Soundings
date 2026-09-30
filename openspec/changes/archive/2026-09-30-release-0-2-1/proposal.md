# Proposal

## Why

Soundings `0.2.0` was published from commit `4b74b86` (`main.js` SHA-256 `eb42c8fa…`). The packaged desktop acceptance recorded in `docs/VERIFICATION.md` covered a different, later build (`06da240b…`) that included enrichment-identity hardening and the full-path companion backlink. Releases are immutable, so those verified fixes must ship as a new patch.

A pre-release review of `0.2.0` also found defects that affect transcript faithfulness, user-authored text, and release safety:

- A WebVTT cue with several voice spans attributes every line to the first speaker, which misstates who said what. The current spec scenario codifies this and contradicts its own requirement ("retain speaker attribution only when explicitly and reliably encoded").
- Valid WebVTT header metadata lines (for example `Kind:` and `Language:` directly below `WEBVTT`) make a file `unreadable`.
- A whitespace-only line between cues silently merges two cues, so a timing line appears as transcript text.
- `&amp;lt;` is decoded twice and rendered as `<` rather than `&lt;`.
- Manual enrichment closes its form before publication, so any stale-source or collision outcome discards the user's typed draft.
- Source-note identification ends frontmatter at the first `---` substring, so a note converted from a filename containing `---` cannot be enriched.
- The release workflow accepts `v`-prefixed tags that Obsidian cannot install (release `v0.1.3` is uninstallable through Obsidian), grants write and identity-token permissions to dependency installation, persists checkout credentials, pins actions only by mutable major tag, and runs CI on an end-of-life Node.js line.
- The `0.2.0` changelog states that static tags apply to companion notes; they apply only to generated transcript notes.

## What Changes

- Render each explicit WebVTT voice span as its own transcript block with its own speaker and the cue's timing.
- Skip WebVTT header metadata lines up to the first blank line; treat whitespace-only lines as cue separators; decode character references in one pass.
- Keep the manual-enrichment form and draft open until publication succeeds; on a stale source, refresh source evidence and require a new review.
- Identify Soundings frontmatter by line-delimited `---` fences.
- Release automation: accept only bare `x.y.z` tags, split a read-only build job from a job-scoped publishing job, disable persisted checkout credentials, pin actions by commit SHA, verify the tag is on `main`, publish only the matching changelog section, and use Node.js 22.
- Correct `0.2.0` release notes and stale PRD/roadmap status; bump to `0.2.1`.

Non-goals: no new transcript format, no new vault mutation, no overwrite/rename/delete behavior, no network access, no AI provider, no mobile support, no change to published releases `0.1.0`–`0.2.0`.

## User-data safety

No new mutation is introduced. Conversion and companion publication remain create-only with source and destination revalidation. The enrichment change only keeps user-typed text in memory longer (until success or explicit cancel) and never writes it anywhere without confirmation. Diagnostics remain content-free.

## Capabilities

### Modified Capabilities

- `transcript-conversion`: per-voice attribution, header metadata, separator and entity handling.
- `manual-enrichment`: draft retention after non-created outcomes; line-delimited frontmatter identity.
- `community-release`: bare semantic tags only and least-privilege publication (extends the open `automate-release-provenance` change, whose final task uses this release).

## Impact

`src/core/parsers.ts`, `src/core/enrichment-evidence.ts`, `src/obsidian/enrichment-modal.ts`, `src/main.ts`, `.github/workflows/*`, tests, `CHANGELOG.md`, `docs/`, `openspec/project.md`, version metadata. Generated notes for multi-voice cues gain additional speaker headings; single-voice output is unchanged.
