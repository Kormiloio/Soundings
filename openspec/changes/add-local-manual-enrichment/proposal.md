# Proposal

## Why

Generated transcript notes reserve Summary, Decisions, Action Items, and Follow-ups sections, but Soundings does not yet provide a safe workflow for capturing reviewed enrichment. A local manual workflow can deliver structured value now without introducing an AI provider or modifying an existing note.

## What Changes

- Add a command that starts from a Soundings-generated transcript note and opens a local form for summary, decisions, action items, and follow-ups.
- Preview a deterministic companion-note destination and the complete rendered enrichment before publication.
- Create a separate linked companion Markdown note only after explicit confirmation and only when the destination is absent.
- Record content-free source-note evidence and revalidate both source identity and destination absence immediately before creation.
- Treat empty, canceled, stale, colliding, invalid, and failed enrichment attempts as non-mutating outcomes.
- Defer AI generation, local-model runtimes, external providers, automatic inference, edits to existing notes, network requests, and mobile support.

## Capabilities

### New Capabilities

- `manual-enrichment`: Define local structured entry, reviewed rendering, create-only companion publication, linking, and failure behavior.

### Modified Capabilities

None.

## Impact

- Affects commands, local form/review UI, pure enrichment validation and rendering, a create-only publication adapter, tests, and documentation.
- Introduces one new user-confirmed vault mutation: creation of an absent companion Markdown note. It never edits the transcript source, generated transcript note, or any existing destination.
- Uses no model, credential, telemetry, or network dependency.
