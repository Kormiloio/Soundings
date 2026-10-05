# Tasks

Implementation and automated/staging gates (sections 1-4) pass on 2026-10-03; packaged desktop acceptance (section 5) completed with controlled-I/O lifecycle checks and later manual-edit caveats recorded in `docs/VERIFICATION.md`, including custom-folder confirmation on 2026-10-05. Owner-approved 0.4.0 was published and its downloaded assets/provenance verified on 2026-10-05. Tasks 6.2 and 6.3 remain pending because the owner-controlled Community rescan and subsequent spec sync/archive are not yet complete. Check items only after their named verification passes.

## 1. Pure SRT Parsing

- [x] 1.1 Add synthetic/redacted SRT fixtures for multiline Unicode, repeated/overlapping cues, literal markup, malformed timing, missing separators, and EOF without a blank line; verify each fixture's expected blocks or failure is documented in `tests/fixtures/README.md`, with no private transcript content committed.
- [x] 1.2 Extend format/error types and implement explicit parser dispatch plus a pure numbered-cue SRT parser using the existing strict decoder; verify parser unit tests cover UTF-8/BOM/CRLF/CR, valid intervals, hour precision, and preservation of every payload line in source order.
- [x] 1.3 Add failure and ambiguity tests for missing indices/payloads/separators, invalid ranges, equal/reversed intervals, unsupported dialects, invalid UTF-8, and cue-free empty files; verify no later malformed cue yields partial success or a TXT fallback.
- [x] 1.4 Add parser-bounds tests and a near-5 MB valid fixture generator; verify 1 MB adversarial classification meets the 500 ms reference-desktop budget, all valid cues survive, and there are no stack/argument-limit errors.

## 2. Format Settings and Discovery

- [x] 2.1 Accept explicitly enabled SRT while retaining TXT/VTT defaults and saved enabled-format lists; verify settings tests cover default-off, old/malformed settings, SRT-only save/reload, and unchanged observation defaults without automatic settings writes.
- [x] 2.2 Recognize case-insensitive SRT paths and map parse failures to content-free classification; verify discovery tests cover eligibility/evidence, malformed/empty/unreadable files, mixed-batch isolation, and exclusions/oversize/disabled-format checks before reads.
- [x] 2.3 Extend shared observation tests for explicitly enabled SRT; verify root restrictions, manual/event policy agreement, deduplication, cancellation, and no automatic conversion or broadened startup observation.
- [x] 2.4 Add the declarative SRT toggle and generalize timestamp setting/review wording to captions; verify settings-tab read/save tests, keyboard-accessible control definitions, and accurate profile-summary tests without changing saved timestamp field semantics.

## 3. Rendering and Guarded Publication

- [x] 3.1 Add SRT golden Markdown for all four plain/folded and omit/retain combinations; verify normalized represented times, `source_format: "srt"`, existing schema rules, and byte-identical original TXT/VTT golden outputs.
- [x] 3.2 Extend structural containment tests with SRT payloads containing callout syntax, fences, HTML, embeds, entities, and speaker-like text; verify the payload stays literal and folded output has exactly one containing callout with no escaped transcript content.
- [x] 3.3 Exercise mixed TXT/VTT/SRT destination planning using the existing planner; verify safe-name derivation, same-basename and case/Unicode collisions, explicit selection, and zero mutation on review/refresh/close.
- [x] 3.4 Extend executor/integration tests with selected SRT success, source/settings staleness, storage-level destination races, individual read/parse failure, cancellation, and unload; verify only eligible reviewed items create complete absent destinations and all protected source/existing-note hashes remain unchanged.
- [x] 3.5 Verify a generated SRT note is accepted by existing manual enrichment; integration tests must prove a full-path backlink, create-only companion publication, collision/stale refusal, and unchanged transcript/source bytes.

## 4. Documentation and Automated Gates

- [x] 4.1 Document SRT opt-in, the exact supported subset, literal tags/no speaker inference, caption timing controls, and unsupported encoding/dialect behavior in README and verification guidance; verify docs match tests and do not claim future TXT/general-text/Person-linking features are shipped.
- [x] 4.2 Run `npm run check`, `npm run audit:runtime`, the production dependency audit, strict OpenSpec validation, and `git diff --check`; record actual results and any pre-existing dev-only dependency findings without presenting them as shipped runtime vulnerabilities.
- [x] 4.3 Extend/repeat the disposable 5,000-file scale rehearsal with enabled SRT and mixed classifications; verify responsive scan/review operations, bounded near-limit conversion, cancellation, and zero mutations before explicit execution, then record timings and the reference platform.
- [x] 4.4 Prepare candidate version metadata and release notes for the confirmed release number using existing fail-closed tooling; verify package/manifest/compatibility-map agreement and stage exactly the three runtime assets with recorded hashes, without tagging or publishing.

## 5. Packaged Desktop Acceptance

- [x] 5.1 Install only the staged candidate in a disposable Obsidian desktop vault; verify saved-format preservation, SRT initially disabled, explicit enable/save/reload, caption controls, excluded paths, and fresh unselected review using named keyboard/UI checks.
- [x] 5.2 Convert selected representative SRT fixtures with both displays and both timing choices; verify note metadata, faithful multiline/repeated text, collapse/expand, full-text search, literal adversarial containment, and manual companion enrichment with source/note hashes preserved.
- [x] 5.3 Run packaged refusal checks for existing/cross-format collisions, malformed/oversize input, source/settings changes after review, destination appearance, cancellation, and disable/unload; verify no forbidden or partial destination is created, unrelated valid items remain usable, and record any unobservable checks honestly.

## 6. Owner-Approved Release and Closure

- [x] 6.1 Obtain explicit owner publication approval only after automated and packaged acceptance pass; verify the approval and accepted asset hashes are recorded before any tag/release mutation.
- [ ] 6.2 Publish through the existing bare-tag attested release workflow; verify downloaded runtime assets match accepted hashes, attestations bind the approved source/tag, prior releases are unchanged, and the owner-controlled Community rescan has no actionable warnings.
- [ ] 6.3 Update PRD/project/verification records with actual shipped scope and results, sync the verified delta specs, and archive this change; verify strict main-spec validation passes and every task has genuine supporting evidence.
