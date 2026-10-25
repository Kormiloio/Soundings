# Proposal: Explicit Shared TXT Kinds

## Why

Soundings 0.4.1 preserves TXT faithfully but labels every resulting note as a meeting transcript, even when the file contains notes, minutes, correspondence, or chat. Users need to identify that material explicitly without automatic classification, source rewriting, or loss of the existing manual enrichment workflow.

## What Changes

- Target the proposed 0.4.2 increment, without changing release metadata or authorizing publication during planning.
- Add a Content type menu to each eligible TXT row: Transcript (default), Notes, Meeting Minutes, Correspondence, and Chat. Choices exist only in the current review; refreshing resets types and selections. VTT/SRT remain transcripts.
- Keep transcript conversion byte-compatible with 0.4.1. Non-transcript choices preserve the complete decoded TXT as literal source text, regardless of the global timestamped-speaker setting, and do not infer senders, participants, dates, or identities.
- Give new shared-text output schema 3, explicit content-kind metadata, a Source Text section, and the existing optional reserved enrichment sections. Plain/folded display remains available with neutral source-text wording. Type labels do not invent extracted summaries or decisions.
- Extend verified-note manual enrichment to the new schema without accepting arbitrary Markdown. All newly published companions use the neutral Back to Source Note link label; existing companions remain untouched.
- Bind each choice to the reviewed plan. Changing a row's type clears that row's selection and updates its visible interpretation before it can be selected again. Execution rejects unreviewed or invalid type/policy changes.

## Capabilities

### New Capabilities

None; extend the existing conversion and enrichment workflow rather than introduce a parallel importer.

### Modified Capabilities

- `conversion-planning`: explicit per-TXT content-kind selection, review revisions, safe reset behavior, and execution binding.
- `transcript-conversion`: additive schema-3 shared-text rendering alongside unchanged transcript contracts.
- `manual-enrichment`: strict eligibility for supported shared-text metadata and neutral new companion backlinks.

## Impact

Affected implementation areas: core plan/types, execution, rendering, enrichment evidence/rendering, review state/modal, and the Obsidian conversion callback. Existing parsers, discovery exclusions, collision identity, create-only adapters, lifecycle checks, and enrichment draft validation should be reused. Focused coverage belongs in planning/review, TXT layout, goldens, execution, and enrichment tests, plus a disposable desktop rehearsal.

The only vault mutations remain explicitly confirmed creation of an absent adjacent Markdown note or an absent enrichment companion, followed by read-back verification. Stale evidence, collisions, cancellation/unload, unsupported metadata, and read/create failures retain fail-closed outcomes; no fallback overwrite, cleanup deletion, or silent partial output is introduced. Diagnostics remain content-free and all processing stays local through public Obsidian APIs.

Non-goals: DOCX/PDF/RTF/HTML/email-file import, provider-specific parsing, chat/email structure extraction, remembered per-path classifications, bulk type assignment, custom type vocabularies or templates, AI summaries, Person links, reconversion of existing notes, mobile support, and new runtime dependencies. The unrelated `document-provider-compatibility` change is not part of this proposal.
