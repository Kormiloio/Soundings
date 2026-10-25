# Tasks

## 1. Pure Content-Kind and Review Policy

- [x] 1.1 Add the validated content-kind model, Transcript default for missing legacy values, and TXT-only assignment rules; verify tests reject unknown values, blocked rows, and VTT/SRT non-transcript assignments without changing settings or format enablement.
- [x] 1.2 Add immutable plan revisions with captured global/effective parsing policy and kind identity; verify source evidence/destinations remain intact, changed rows are deselected, stale revision/captured-object alterations are refused, and no vault write occurs during review.
- [x] 1.3 Extend review-state tests for per-row kinds through search/filter changes, hidden selections, Select all eligible shown, return to Transcript, refresh/reopen, and fresh inbox review; verify reset and selection behavior matches the scenarios.

## 2. Rendering and Conversion Safety

- [x] 2.1 Add schema-3 shared-text rendering with the exact metadata tuple, Source Text body, existing profile sections/tags/titles, and plain/folded display; verify complete expected-output fixtures for all four kinds and literal fence/callout/frontmatter containment.
- [x] 2.2 Route non-transcript TXT through complete plain decoding independently of global TXT layout; verify Unicode, whitespace, BOM/newlines, repeated messages, mail headers, timing-like content under omit/retain, empty/invalid encoding, and near-limit adversarial inputs without truncation.
- [x] 2.3 Bind execution to the reviewed revised plan and recheck kind/effective policy after asynchronous work before create; verify stale source/settings/profile/layout/revision, invalid kinds, destination races, case/Unicode collisions, cancellation/unload, create/read failures, read-back mismatch, and isolated mixed batches preserve protected bytes.
- [x] 2.4 Run unchanged TXT plain/fallback/structured, VTT, and SRT golden comparisons with fixed metadata and timestamps; verify Transcript output bytes/schema remain 0.4.1-compatible and no content_kind is added to legacy output.

## 3. Manual Enrichment Compatibility

- [x] 3.1 Extend verified-note evidence with a strict schema-3 shared-text tuple branch while retaining schema-1/2 support; verify all four kinds, duplicate/missing/unsupported identity fields, mismatched schemas/formats, invalid UTF-8, oversize notes, unlinkable paths, and arbitrary Markdown refusal.
- [x] 3.2 Use Back to Source Note in new companion previews/publication for every supported kind; verify full-path link targets, unchanged suffix/manual sections/escaping, and that no existing companion is rewritten.
- [x] 3.3 Extend enrichment integration tests for shared-text success, source/kind change after preview, collisions before/during publication, cancellation/unload, unavailable reads/create failures, read-back mismatch, and failed-draft retention; verify original TXT, source note, and pre-existing destinations remain unchanged.

## 4. Obsidian Review Integration

- [x] 4.1 Add accessible per-eligible-TXT Content type menus and effective interpretation text to the existing modal; verify labels, default Transcript, immediate deselection on change, disabled/absent choices on blocked/non-TXT rows, and no conversion from Return in search.
- [x] 4.2 Update the modal/controller conversion callback to pass the actual reviewed revision with its selection; verify end-to-end adapter tests publish the displayed kinds rather than the original plan and fresh inbox/manual reviews reset kind state.
- [x] 4.3 Generalize candidate and enrichment wording where required without changing command IDs or introducing a settings migration; verify UI tests for neutral labels and stable keyboard/focus behavior at narrow desktop widths.

## 5. Documentation and Acceptance

- [x] 5.1 Update README, supported-input documentation, PRD/project status, and verification guidance for explicit kinds, literal non-transcript parsing, schema-3 downgrade limits, ephemeral review choices, and neutral companions; verify examples are synthetic and claims match implemented behavior.
- [x] 5.2 Run npm run check, npm run audit:runtime, npm audit --omit=dev, strict OpenSpec validation, and git diff --check; record results and confirm no unrelated provider-compatibility planning, new runtime dependency, or premature version bump enters the implementation diff.
- [x] 5.3 Stage a candidate in a disposable Obsidian desktop vault and verify mixed-kind rows, selection/filter/reset behavior, every kind's metadata/body, both displays, literal timing/headers, and unchanged Transcript output; record screenshots and before/after source/destination hashes with no work-vault mutation.
- [x] 5.4 Verify schema-1/2 and each schema-3 kind's manual companion and exact backlink in the disposable vault, including existing-companion protection, stale source, destination race, controlled cancellation, and unload; record observable results and protected hashes, with any controlled-I/O caveats stated explicitly.
- [x] 5.5 Record final implementation readiness and remaining release gates; verify owner approval is obtained separately before versioning/publication, and that final versioned custom-config package acceptance, release/provenance checks, Community review, and archive authorization are not claimed by planning or automated tests alone.
