# Soundings — Agent Instructions

## Spec discipline

Before touching implementation, read:

- `docs/PRD.md`
- `openspec/project.md`
- the active change's `proposal.md`, `design.md`, `specs/`, and `tasks.md`

If implementation work has no changeset, create one before writing code. Every changeset must contain a proposal, design, tasks, and capability specs with observable Given/When/Then scenarios.

During implementation:

- Check off `tasks.md` items only after verification.
- Update `design.md` when implementation differs from the approved design.
- Update the PRD and `openspec/project.md` when scope, behavior, risk, or priority changes.
- Do not call a phase complete until its automated tests and named manual checks pass.

## Hard rules

1. Protect vault content over conversion convenience.
2. Never delete, rename, move, or overwrite a source transcript automatically.
3. Never overwrite an existing Markdown file; report the collision for review.
4. Keep deterministic conversion separate from optional AI enrichment.
5. Do not transmit transcript or note content unless a later approved change adds an explicit, informed, user-initiated integration.
6. Use Obsidian's public vault APIs for cross-platform file access; do not depend on Node filesystem APIs in the plugin core.
7. Exclude `.obsidian/`, hidden folders, configured exclusions, and Soundings' own generated state from scanning by default.
8. Log paths and outcome metadata only when needed for diagnosis; never log transcript bodies, generated note bodies, credentials, or model prompts.
9. Test with a disposable vault before a personal or work vault.
10. No implementation claim is complete without unit tests, integration tests, and target-device verification appropriate to the change.

## Project structure

- Product documentation: `docs/`
- OpenSpec project context and changes: `openspec/`
- Plugin source: `src/` (after approval)
- Automated tests: `tests/` (after approval)
- Build output: generated and never the source of truth
