# Proposal

## Why

Transcript files placed throughout an Obsidian vault remain outside the normal Markdown-centered search, linking, and metadata workflow. Soundings needs a trustworthy foundation that converts those files locally without changing the originals or risking existing notes before any enrichment or automation is considered.

## What Changes

- Establish a desktop-only Obsidian community plugin foundation for `.txt` and WebVTT `.vtt` transcripts.
- Add recursive, read-only discovery with default and user-configured exclusions.
- Add a reviewable conversion plan that shows source paths, intended destinations, eligibility, and blocking reasons before any write.
- Add deterministic plain-text and WebVTT parsing plus versioned Markdown rendering.
- Add explicitly selected, create-only batch publication beside each source with execution-time revalidation, cancellation, and content-free outcome reporting.
- Preserve every source transcript and treat every existing destination as an immutable collision.
- Keep network access, telemetry, AI enrichment, source deletion, source movement, and existing-note updates outside this change.
- Defer Android, iOS, and iPadOS support and acceptance to a separately approved future change.

No breaking change is introduced because Soundings has no prior runtime release.

## Capabilities

### New Capabilities

- `transcript-discovery`: Recursively inventory supported transcript candidates through the Obsidian vault API while honoring safe default and user-configured exclusions.
- `conversion-planning`: Classify candidates and present a non-mutating, reviewable plan with stable source evidence and deterministic destination paths.
- `transcript-conversion`: Parse supported plain-text and WebVTT inputs and render faithful, structured, versioned Markdown without AI or network access.
- `safe-note-publication`: Execute only selected create operations after revalidation, refuse all collisions and stale evidence, preserve sources, support cancellation, and report content-free outcomes.

### Modified Capabilities

None. This is the initial capability set.

## Impact

- Introduces the future TypeScript plugin scaffold, Obsidian adapter, settings, review UI, and lifecycle integration.
- Introduces pure discovery, planning, parsing, rendering, and execution modules with unit and integration tests.
- Adds generated Markdown notes beside selected source transcripts; this is the only approved vault mutation.
- Requires no account, credential, remote service, model runtime, or production dependency beyond Obsidian's public API.
- Declares the first release desktop-only and requires disposable-vault verification in Obsidian desktop before use with personal or work vaults.
