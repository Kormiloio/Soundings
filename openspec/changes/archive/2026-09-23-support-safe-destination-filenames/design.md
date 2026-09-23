# Design

## Context

See `proposal.md` for motivation. Destination derivation is currently a pure operation in the planning core: it replaces the final source extension with `.md`. The reviewed plan carries that path into the executor, which revalidates the source and uses the public Obsidian create-only API. The failure observed in desktop Obsidian occurred at that final create call for source basenames containing `:`.

The solution must keep the plan authoritative, preserve content-free diagnostics, and avoid any retry that creates a path the user did not review.

## Goals / Non-Goals

**Goals:**

- Keep filename normalization deterministic, pure, and testable before any vault mutation.
- Preserve source folders, source filenames, source bytes, rendered note titles, and `source_file` metadata.
- Make all collision checks operate on the exact path later passed to the create-only API.
- Retain ordinary Unicode and punctuation that Obsidian accepts.

**Non-Goals:**

- Querying or changing operating-system filenames.
- Generating numbered alternatives when the normalized path collides.
- Retrying publication under a different unreviewed path.
- Claiming mobile compatibility; mobile remains deferred even though the logic stays platform-independent.

## Decisions

### Normalize only the destination basename in the pure planning layer

Split the vault-relative source at its final `/`, remove only the final transcript extension, normalize that basename, then append `.md` and rejoin the original folder. Directory segments are not rewritten because they already name existing vault folders.

The normalizer will replace each maximal run of ASCII control characters and the cross-platform filename characters `\ : * ? " < > |`, including adjacent whitespace, with ` - `. It will then trim unsafe trailing spaces and periods and trim a replacement separator introduced at either edge. Already-safe basenames remain byte-for-byte unchanged.

Alternative considered: sanitize inside the Obsidian adapter after creation fails. Rejected because the review would show a different destination from the one actually created, and a retry complicates collision safety.

### Represent an unusable result as a blocked plan item

Destination derivation will return an explicit failure when normalization leaves no usable basename. Planning will classify that candidate as non-selectable with a content-free reason instead of inventing a generic name.

Alternative considered: fall back to `Transcript.md`. Rejected because multiple sources could silently converge on an opaque name and the result would disclose less useful intent during review.

### Reuse collision and executor boundaries

Existing-path and same-plan ambiguity checks will consume the final normalized destination. The executor will receive that reviewed path unchanged and retain its existing destination recheck, create-only write, byte verification, and per-item outcomes. No vault-adapter behavior or new write API is needed.

Alternative considered: allow the adapter to choose an available numbered path. Rejected because it would weaken deterministic preview and could bypass reviewed collision decisions.

### Preserve the semantic title separately from the safe path

The generated note title and `source_file` metadata continue to derive from the original source path. Filename safety changes storage naming only; it does not rewrite transcript content or metadata that identifies the source.

## Risks / Trade-offs

- [Two distinct source names normalize to one destination] → Detect the ambiguity during planning and block both candidates.
- [A pre-existing note occupies the normalized path] → Report the collision during planning and recheck again during execution; never number or overwrite it.
- [Normalization is more conservative than the current macOS filesystem requires] → Prefer portable Obsidian note paths and show the exact changed path before selection.
- [An unhandled platform-specific restriction still causes creation failure] → Preserve the current isolated failure outcome and source-preservation boundary; extend the normalization contract only through a later reviewed change.
- [Changing destination derivation affects FR-06 wording] → Update the PRD and project context alongside implementation.

## Migration Plan

1. Add and test the pure destination-basename normalizer and blocked-result handling.
2. Update planning integration and documentation, then run the complete automated and runtime-audit suite.
3. Build the plugin and verify safe-name preservation, colon normalization, collision blocking, source-byte preservation, and successful read-back in a disposable Obsidian desktop vault.
4. Only after disposable-vault acceptance, install the verified build in the work vault and rerun a fresh review. Previously failed attempts require no cleanup because they created no destination.

Rollback consists of reinstalling the prior plugin build. Any Markdown notes already created by the fixed build remain user-owned vault content and must not be removed automatically.
