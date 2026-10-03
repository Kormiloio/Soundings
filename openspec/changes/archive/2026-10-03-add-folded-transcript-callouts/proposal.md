# Proposal

## Why

A generated note places the whole transcript inline under `## Transcript`. A one-hour meeting can run to thousands of lines, so the Summary, Decisions, Action Items, and Follow-ups sections at the top of the note, the parts users return to, sit above a very long scroll. The PRD roadmap (phase 8, "Ergonomic Transcript Display") calls for an optional folded Obsidian callout. It keeps the full transcript one click away without sacrificing full-text search, which indexes callout content like any other Markdown.

## What Changes

- Add an output-profile option, **Transcript display**, with two choices:
  - **Plain** (`plain`): the default and the current behavior. Output is byte-identical to `0.2.3`.
  - **Folded callout** (`folded-callout`): the transcript body is rendered inside one collapsed Obsidian callout, `> [!quote]- Full Transcript`, directly below `## Transcript`.
- Inside the callout, render every transcript line, including blank lines, speaker headings, retained timestamp lines, and literal fences, with the callout prefix. The callout then contains the entire transcript and nothing from the source can end it early or escape it.
- Bind the new option into the output-profile fingerprint, the review summary, the note schema version, settings validation, saved-settings migration, and the settings screen.
- Add structural tests that parse the rendered Markdown with a CommonMark parser, proving the callout contains the whole transcript for adversarial inputs.
- Version `0.3.0` (a minor release, since it adds a user-visible option), with changelog and docs.

Non-goals:
- no change to existing notes; no reconversion or migration of earlier output
- no change to default output; the option is opt-in
- no expanded (`+`) variant, custom callout label, or custom callout type in `0.3.0` (candidates for later)
- no change to Summary, Decisions, Action Items, Follow-ups, frontmatter, or companion notes
- no network access, new vault mutation, or mobile support

## User-data safety

There is no new mutation and no change to create-only publication or revalidation. The option changes only the rendered bytes of new notes, and only when the user selects it. Source text stays literal inside a dynamically sized fence, exactly as today. The callout prefix is container syntax and adds nothing to the spoken text. A plan bound to one display choice goes stale if the choice changes before execution. Diagnostics remain content-free.

## Capabilities

### Modified Capabilities

- `note-output-configuration`: the transcript display choice is a constrained, validated, previewed, and fingerprinted profile option with a backward-compatible default.
- `transcript-conversion`: the Markdown contract defines the folded-callout rendering and its containment guarantee.

## Impact

- **Code:** `src/core/settings.ts`, `src/core/rendering.ts`, `src/obsidian/settings-tab.ts`.
- **Tests:** new structural callout tests and golden fixtures, plus updated settings and contract tests. `micromark`, exact-pinned, is added as a dev dependency for the structural tests.
- **Docs and metadata:** `README.md`, `docs/SUPPORTED_TRANSCRIPTS.md`, `CHANGELOG.md`, `docs/PRD.md`, `openspec/project.md`, `docs/VERIFICATION.md`, and version metadata.
