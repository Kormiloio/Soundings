# Proposal

## Why

Soundings currently converts TXT and WebVTT, but cannot offer SubRip caption files for reviewed conversion. A narrowly scoped SRT addition is the first independently testable step toward broader offline input support without combining format parsing, general shared-text classification, and vault identity linking.

## What Changes

- Target a proposed 0.4.0 release adding opt-in, case-insensitive `.srt` discovery and an explicit format setting; preserve saved enabled-format choices and keep observation off by default.
- Parse a documented UTF-8 SubRip subset into the existing source-neutral timed-block model, preserving cue order, repeated text, multiline payloads, and literal markup without speaker inference.
- Reuse timestamp omission/retention and plain/folded rendering. Generalize the timestamp setting and review wording from WebVTT to captions without introducing a second timing policy.
- Classify malformed SRT before review with content-free reasons, then revalidate source evidence, settings, and destination absence through the existing executor.
- Add golden, adversarial, integration, and packaged desktop acceptance coverage; maintain byte-identical TXT/VTT rendered output for unchanged inputs and profiles.

### Non-goals and safety boundaries

No structured TXT interpretation, general shared-text categories, JSON/document/email extraction, automatic speaker attribution, Person-note linking, AI, audio transcription, reconversion, or mobile support. No network, telemetry, credentials, automatic conversion, or new external-file access. No source or existing-note edits, moves, renames, or deletion.

The only extended vault mutation is explicit create-only publication of an adjacent Markdown note from a selected SRT candidate. Collisions, stale evidence/settings, cancellation, unload, and individual parse/read failures prevent that write; failures do not publish partial notes or abort unrelated valid candidates. Existing manual companion enrichment must continue to work for generated SRT notes under its unchanged guards.

## Capabilities

### New Capabilities

None; SRT extends existing conversion, discovery, and configuration capabilities.

### Modified Capabilities

- `transcript-discovery`: recognize enabled `.srt` sources through the shared manual/event safety policy.
- `transcript-conversion`: define faithful bounded SRT parsing, rendering, and guarded execution acceptance.
- `note-output-configuration`: define opt-in SRT settings, compatibility-preserving migration, and shared caption timestamp controls.

## Impact

Implementation will touch `src/core/types.ts`, `parsers.ts`, `discovery.ts`, `settings.ts`, and `src/obsidian/settings-tab.ts`, plus affected parser dispatch, fixtures, tests, and user/release guidance. The existing planner, executor, renderer, observation, and enrichment boundaries should be reused rather than redesigned; inspect their format assumptions in implementation. No new runtime dependency is planned. Package/release versions remain 0.3.0 during planning and change only as part of separately verified release preparation.
