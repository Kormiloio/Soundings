# Design

## Context

Soundings-generated notes are immutable after creation and reserve enrichment sections. The existing create-only executor is designed around transcript sources and should not be overloaded with a different input/rendering contract. The new workflow must maintain the same evidence-before-mutation discipline while never editing the transcript note.

## Goals / Non-Goals

**Goals:**

- Validate a Soundings note, collect structured local input, preview exact output, and create one absent companion note.
- Keep validation/rendering pure and vault publication narrowly create-only.
- Make stale evidence, collisions, cancellation, and verification failures explicit.

**Non-Goals:**

- AI or heuristic generation, provider adapters, prompts, credentials, or network requests.
- Editing, merging, or replacing existing notes.
- Treating arbitrary Markdown as a Soundings transcript note.
- Mobile acceptance.

## Decisions

1. Use a companion note rather than updating reserved sections in the transcript note. The destination will be derived deterministically from the transcript note basename with an ` - Enrichment.md` suffix and then pass through the existing safe-name rules. In-place edits were rejected because they cannot distinguish generated from user-authored content safely.
2. Parse only the minimum supported Soundings frontmatter needed to establish note type, schema, and source linkage. Record path, byte length, and digest as evidence; do not retain note bodies in diagnostics.
3. Model entry as a pure immutable draft containing summary text and arrays of decisions, actions, and follow-ups. Validate per-field and total size limits, escape YAML and Markdown control syntax, and render a complete companion document for review.
4. Implement a small enrichment publication plan and executor that mirror the existing check-before-create, revalidate-before-create, exclusive create, and read-back verification sequence. Sharing low-level evidence and adapter contracts is preferred; forcing enrichment through transcript parsing was rejected.
5. Link the companion to the source note using safely encoded frontmatter and a human-visible Obsidian link. Do not add a backlink to the source note because that would require modifying it.

## Risks / Trade-offs

- [Companion notes add another file per meeting] → Use a predictable adjacent name and explicit source linkage.
- [User-entered Markdown could alter structure] → Render fields through constrained list/text encoders and escape structural syntax.
- [Source-note validation could accept lookalikes] → Require supported Soundings metadata and schema plus current evidence.
- [Future AI enrichment may need a different draft shape] → Keep the draft/provider boundary pure, but do not introduce a provider interface or network capability yet.

## Migration Plan

No existing note is migrated. The command appears only when the implementation can validate an active Soundings note, and existing vault content remains unchanged until explicit companion publication. Rollback removes the command; previously created companion notes remain ordinary user-owned Markdown. Desktop disposable-vault acceptance is required and mobile remains deferred.
