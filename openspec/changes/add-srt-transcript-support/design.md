# Design

## Context

See `proposal.md` for motivation and scope. The current `TranscriptFormat` is `txt | vtt`; discovery and settings validation each enumerate those formats, and parser dispatch sends every non-TXT input to WebVTT. These are the concrete integration points for SRT. Existing `TranscriptBlock` already carries literal text, optional speaker, and start/end timing strings. Rendering uses timed blocks without a format-specific branch, sizes literal fences safely, and optionally folds all blocks into one callout.

Planning stores source and settings evidence; execution reparses and revalidates before create-only publication. Manual and event-driven discovery share the same path policy. Manual enrichment identifies a generated note by its source/type/schema metadata rather than a TXT/VTT extension. Reuse these boundaries and exercise them with SRT-specific tests rather than introduce a second execution flow.

## Goals / Non-Goals

**Goals:** add one format to existing pure parsing and shared adapter paths; make saved-setting behavior explicit; prove faithful output, failure isolation, bounded work, and compatibility.

**Non-Goals:** no new source-kind model or Person-note resolution. An `Alice:` payload is literal SRT text in this release. General written material remains a later design because the renderer and enrichment identification currently require meeting-transcript metadata. No mobile acceptance claim or runtime network/filesystem dependency.

## Decisions

### 1. Parse SRT directly into the existing model

Add a pure SRT parser in `src/core/parsers.ts`, extend the format/error types, and make dispatch explicit for each supported format. One accepted cue becomes one timed block with no speaker field. Use the existing strict decoder and linear line/block traversal; validate numeric fields without unbounded backtracking or unsafe numeric conversion. Compare times without precision loss for long hour fields. Do not parse the whole SRT as WebVTT after replacing commas: VTT control records, voice tags, entity decoding, and timestamp dialects have different semantics.

Alternative: a parser dependency. No new runtime dependency is planned because the supported subset is small and the existing pure parser boundary is established; any proposed library must meet the same fidelity/bounds contract and be separately justified rather than silently expand dialect support.

### 2. Define a conservative, literal-payload subset

Accept standalone positive decimal counters and comma-millisecond hour-based timing with nonempty multiline payloads. Allow blank/space/tab separators, EOF after the final payload, repeated/nonconsecutive counters, overlapping cues, and repeated text. Normalize only BOM, line endings, and timing representation. Preserve payload whitespace, apparent tags, and character references literally. Do not impose subtitle display-width limits on transcript text.

Reject unsupported timing/index layouts and invalid intervals as malformed SRT before eligibility; a whitespace-only cue-free file is empty. A malformed later cue invalidates the source, not just that cue. A missing separator must not cause a following cue to be silently absorbed as dialogue; include a targeted ambiguity fixture and fail closed when a counter/timing pair within payload would otherwise hide a cue boundary. This intentionally conservative refusal should be documented alongside the subset.

Alternative: strip HTML-like styling, infer speakers, decode entities, or repair dialects. Those transformations risk changed meaning and would add independent product decisions. Keeping payload literal is consistent with current TXT handling and the renderer's inert fences.

The subset is a Soundings compatibility policy, not a claim that all SRT exports follow a formal standard. Background reference: [Library of Congress SRT format description](https://www.loc.gov/preservation/digital/formats/fdd/fdd000569.shtml), consulted 2026-10-03; it describes numbered timed blocks, formatting variants, and encoding variability. UTF-16/legacy encodings, same-line indices, dot-millisecond times, and positioning extensions are deferred.

### 3. Keep SRT off unless explicitly enabled

Retain the current TXT/VTT default enabled list for new and malformed/missing saved settings. Extend validation to accept `srt`; preserve existing explicit lists without appending it, including users who intentionally disabled a format. Expose `Convert .srt transcripts` through the established declarative settings/read/save paths. Observation remains disabled by default and shares the same enabled-format list when explicitly enabled.

Alternative: enable SRT automatically on upgrade. This would broaden discovery and possible notifications without a deliberate setting change; opt-in avoids that expansion.

### 4. Reuse one caption timestamp policy and the existing schema

Rename visible `WebVTT timestamps` wording to `Caption timestamps` in settings and review; keep the saved `timestampPolicy` field and values. SRT comma fractions normalize to dots in the model, so the renderer can retain the same timing presentation. No format-specific output template, new schema version, or enrichment path is needed: add `source_format: "srt"` under the existing schema/profile rules. Preserve original TXT/VTT golden Markdown unchanged; review-summary wording is an intentional UI change, not a rendered-note change.

Alternative: a second SRT timing setting or schema 3. Neither is justified when the output semantics and note structure remain the same. Confirm assumptions through generated-SRT enrichment and schema tests.

### 5. Extend classification, not publication privileges

Add SRT recognition to shared path discovery and parser errors to content-free classification. Use the existing planner/executor for normalization, same-basename cross-format collisions, case/Unicode identity, source evidence, effective-setting fingerprints, storage existence, cancellation, and unload. An accepted SRT introduces only the same adjacent Markdown creation already allowed for other formats. Do not bypass review or create a second publication method.

## Risks / Trade-offs

- SRT exports vary in encoding and layout: support the documented subset, report unsupported layouts without payloads, and retain redacted real-world fixtures when available. Do not claim provider-wide compatibility from synthetic samples.
- Literal formatting tags may be visually noisy: preserve them rather than silently discard content; cleanup can be separately proposed.
- A counter/timing pair quoted in dialogue is structurally ambiguous without a separator: fail closed rather than risk losing or reclassifying content; document this refusal and test it.
- Format assumptions in test factories or exhaustive checks can misroute SRT: audit current TXT/VTT branches and prove parser dispatch, mixed-format planning/execution, observation, and companion enrichment.
- A parser can be linear yet pause the UI at the source limit: retain the 5 MB limit, test 1 MB adversarial classification against the 500 ms reference-desktop budget, profile valid near-limit files, and repeat the responsive disposable-vault scan.
- New format membership can change setting identities: preserve saved choices and assert that an effective setting change after review blocks publication.

## Migration Plan

1. Implement pure parser/model tests before adapter integration, keeping existing output fixtures unchanged.
2. Add opt-in format settings, shared discovery/error mapping, and caption wording; verify old and malformed settings load safely without automatic persistence or SRT enablement.
3. Run full automated, lint/build, runtime/production dependency, strict-spec, and scale gates.
4. Stage the candidate package and run named disposable-vault desktop checks with protected hashes. Never install an unaccepted build in a personal/work vault.
5. Prepare matching version metadata and release notes only after implementation gates. Publication requires explicit owner approval, accepted asset hashes, and attestation verification.
6. On completion, sync these deltas and archive the change. Until then, main specs and the published 0.3.0 package remain the current behavior.

Rollback requires no vault rewrite: disable SRT or reinstall a prior accepted plugin build. Source files and generated notes remain untouched; no format option rollback may enable previously disabled discovery or observation.
