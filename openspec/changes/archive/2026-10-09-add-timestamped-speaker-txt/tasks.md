# Tasks

## 1. Compatibility and Settings

- [x] 1.1 Reconcile the active SRT delta and legacy plain-display compatibility wording with this opt-in scope; verify strict OpenSpec validation and that all SRT requirements/scenarios remain intact.
- [x] 1.2 Add validated TXT layout types and Plain text migration/default behavior; verify settings tests for absent, invalid, and valid values and fingerprint changes without enabling formats or observation.

## 2. Pure Parsing

- [x] 2.1 Add synthetic timestamped-speaker TXT fixtures and complete-file recognition; verify parser tests for the documented whitespace, Unicode labels, multiline dialogue, BOM/newline handling, final block, overlaps, and repetitions.
- [x] 2.2 Implement whole-file plain fallback and content-free interpretation outcomes; verify tests for preambles, mixed layouts, missing separators, malformed times, midnight rollover, missing labels/dialogue, and unchanged strict-decoding/empty-source behavior.
- [x] 2.3 Verify bounded processing with long delimiter-like lines and near-limit inputs; run parser-bounds tests and record desktop measurements without storing payloads in diagnostics.

## 3. Review and Publication Safety

- [x] 3.1 Propagate immutable validated parsing policy and actual interpretation through discovery, planning, inbox discovery, and execution; verify recognized/fallback classifications and shared-policy integration tests without scan-time writes.
- [x] 3.2 Bind captured policy and outcomes to review evidence; verify settings-change, mutable-policy, source-change, interpretation-mismatch, and refreshed-zero-selection tests refuse unreviewed publication.
- [x] 3.3 Extend existing create-only execution tests for structured and fallback TXT; verify collisions before/after review, explicit selection, cancellation, unload, read-back verification, and isolated mixed-batch failures preserve protected bytes.

## 4. Rendering and Controls

- [x] 4.1 Render recognized TXT through existing speaker/timing blocks with schema 2 and TXT metadata; verify all four display/timestamp combinations and schema-2 manual-enrichment acceptance.
- [x] 4.2 Add adversarial label/dialogue containment cases and default/fallback golden comparisons; verify no active markup or callout escape and byte-identical unchanged TXT/VTT/SRT output with fixed metadata.
- [x] 4.3 Add the TXT layout menu, selected-layout summary, and actual per-row interpretation; generalize timestamp wording without changing its persisted key and verify UI tests for defaults, fallback reasons, selection, and no automatic conversion.

## 5. Documentation and Acceptance

- [x] 5.1 Update README, PRD/project roadmap, and verification guidance with the exact supported layout, whole-file fallback, default behavior, and deferred Person linking; verify examples are synthetic and documentation matches settings and parser tests.
- [x] 5.2 Run repository quality gates and strict OpenSpec validation; record exact commands/results and confirm only intended changes appear in the diff, without an early release-version bump.
- [x] 5.3 Stage the candidate in a disposable desktop vault and verify recognized/fallback review, four output combinations, collapsed-callout search, companion enrichment, stale layout/source guards, collisions, and controlled cancellation; record screenshots and before/after hashes proving source/existing-note preservation.
- [x] 5.4 Before preparing the 0.4.1 release, verify the 0.4.0 Community review and predecessor closure from authoritative evidence; record remaining blockers and obtain explicit release authorization before versioning, publishing, or archiving this change.

## Closure

Published as 0.4.1 with verified downloaded assets and exact-tag provenance. The owner supplied the public listing showing current version 0.4.1, Health Excellent, and Review Passed, then authorized spec synchronization and archival. Both affected main specs were synchronized and validated before this completed change was archived on 2026-10-09. See `docs/VERIFICATION.md` for the release and Community evidence.
