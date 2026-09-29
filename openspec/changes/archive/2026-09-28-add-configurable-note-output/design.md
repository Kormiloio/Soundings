# Design

## Context

The current settings fingerprint binds enabled formats, exclusions, size, and project inference to each plan, while parsing and rendering operate on a small source-neutral model. The renderer emits one fixed schema and WebVTT parsing currently discards timing syntax. Configurability must remain constrained enough to validate before any plan exists.

## Goals / Non-Goals

**Goals:**

- Add deterministic output choices with safe migration defaults.
- Make destination and structure effects visible during review.
- Bind the exact validated profile to planning and execution.
- Preserve faithful content and inert transcript rendering.

**Non-Goals:**

- Arbitrary templates, scripts, regular expressions, user CSS, or dynamic metadata evaluation.
- Reconversion or editing existing Markdown.
- Speaker inference, AI enrichment, or mobile acceptance.

## Decisions

1. Represent output configuration as a closed `OutputProfile` with enumerated title/destination patterns, ordered enabled sections, normalized static tags, and `omit | retain` timestamp policy. The title choices are `source-name` (the current basename title) and `parent-folder-source-name` (rendered as `Parent folder — Source name`, falling back to `Source name` for a root-level source). The destination choices are `source-name` (the current `Source name.md`) and `source-name-note` (`Source name - Note.md`). These labels are deliberately content-neutral because a supported text file can contain a meeting, conversation, imported material, or miscellaneous notes. Closed choices were selected over template strings because safe path and YAML behavior can be proven for every option.
2. Extend parsed WebVTT blocks with optional normalized source timing data. Rendering decides whether to show it, keeping parsing faithful and policy-free. Re-parsing timing text inside the renderer was rejected because it mixes concerns.
3. Include the normalized output profile in the settings fingerprint and plan metadata. Execution rejects a profile mismatch just like other stale settings. Reading live settings during render was rejected because reviewed output could change silently.
4. Derive title and destination through pure functions before collision classification. The parent-folder title uses only the source's immediate vault-relative parent segment and never changes the destination folder. The `source-name-note` destination appends the literal ` - Note` suffix before `.md`. Safe filename normalization remains the final mandatory step regardless of the selected pattern.
5. Advance the note schema version only when the structural contract changes and retain the exact current profile as the migration default. Existing notes are not migrated or rewritten.

## Risks / Trade-offs

- [More combinations increase test surface] → Keep the option set closed and generate table-driven golden cases across each option.
- [Retained timestamps can clutter notes] → Default to omission and document the retained form.
- [Tag or title input could escape YAML/Markdown] → Normalize and encode through existing safe scalar and heading boundaries.
- [Destination patterns create new collisions] → Plan and block against the exact normalized destination before selection and revalidate at execution.

## Migration Plan

Migrate absent output settings to the current layout and timestamp omission. Reject invalid saved profiles and restore safe defaults with a notice. Rollback is safe because existing output remains valid Markdown and no note is rewritten. Desktop packaged acceptance is required; mobile remains deferred.
