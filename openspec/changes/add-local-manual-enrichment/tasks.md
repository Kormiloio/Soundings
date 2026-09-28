# Tasks

## 1. Pure enrichment domain

- [x] 1.1 Define supported Soundings-note identification and content-free source evidence; verify tests accept supported schemas and reject missing, malformed, oversized, unreadable, or non-Soundings notes without exposing content
- [x] 1.2 Implement immutable draft types and validation for summary, decisions, action items, follow-ups, per-field limits, and total limits; verify tests cover valid Unicode, empty drafts, oversized input, and structural control syntax
- [x] 1.3 Derive the safe adjacent ` - Enrichment.md` destination and render linked versioned companion Markdown; verify golden tests cover unsafe basenames, YAML/Markdown escaping, source links, deterministic output, and collision paths

## 2. Reviewed interface and publication

- [x] 2.1 Add a command scoped to the active supported Soundings note and a keyboard-accessible local entry form; verify adapter tests cover unsupported notes, cancel/close, validation feedback, and no mutation before confirmation
- [x] 2.2 Add a complete preview showing destination, metadata, source link, and rendered sections; verify UI tests prove the user can return to edit or cancel and no field is logged or persisted before publication
- [x] 2.3 Implement enrichment planning and create-only execution with immediate source-evidence and destination-absence revalidation, exclusive creation, read-back verification, cancellation, and content-free outcomes; verify unit/integration tests cover success, stale source, planning collision, destination race, create failure, verification failure, and unload

## 3. Security and regression gates

- [x] 3.1 Add runtime audit contracts proving the enrichment path has no network, model, credential, telemetry, overwrite, delete, move, or rename capability; verify synthetic forbidden fixtures fail and the production bundle passes
- [ ] 3.2 Run the full unit/integration/golden suite, production build, dependency audit, strict OpenSpec validation, `git diff --check`, and a scale check using maximum valid draft sizes; record zero mutation before explicit publication

## 4. Documentation and desktop acceptance

- [x] 4.1 Update README, enrichment schema guidance, privacy documentation, `docs/PRD.md`, and `openspec/project.md`; verify companion-note ownership, local/manual scope, size limits, non-goals, and future-AI separation match the specs
- [ ] 4.2 Install staged assets in a disposable Obsidian desktop vault and verify supported-note gating, entry validation, exact preview, cancel/close, collision, stale source, destination race, and content-free results with unchanged source transcript and transcript-note hashes
- [ ] 4.3 Publish one explicitly confirmed companion note, verify exact destination/read-back/linkage and unchanged pre-existing hashes, and record all automated and manual evidence in `docs/VERIFICATION.md`
