# Design

## Context

See proposal.md for motivation. `parseTxt` currently returns a single literal block; `TranscriptBlock` already supports speaker and timing fields. Discovery and execution independently call `parseTranscript` without a source interpretation option. Plans bind settings and output-profile fingerprints, while rendering chooses schema solely from the output profile. Existing tests cover settings migration, mutable-profile attacks, golden output, literal containment, and SRT lifecycle safety.

The main conversion spec's broad legacy plain-display scenario predates SRT and this proposed interpretation. The new structured-output requirement explicitly limits that compatibility promise to unchanged interpretation. Preserve legacy scenarios and existing SRT deltas during spec reconciliation; do not interpret this as permission to change default output.

## Goals / Non-Goals

**Goals:** One pure recognition path shared by discovery and execution, with explicit outcome evidence and whole-file preservation. Extend existing blocks and guards without a new publication mechanism.

**Non-Goals:** Changing SRT speaker-like payload semantics, inferring times as dates or elapsed recording offsets, changing existing generated notes, or depending on private Obsidian APIs. Mobile acceptance is deferred; target desktop with existing public APIs.

## Decisions

### Separate source policy from output profile

Add a normalized `txtLayout` setting (`plain` / `timestamped-speaker`) with a safe migration default. Pass a validated immutable parsing-policy snapshot through discovery, planning, and execution. Include it in the effective settings fingerprint and validate captured policy against its reviewed identity immediately before publication, including mutable-input tests. A display-only setting is unsuitable because discovery must know the interpretation before review. Missing parser options retain the legacy plain default.

### Recognize the whole file in a bounded pure parser

After existing strict decoding, scan lines and blank-separated blocks against the exact delta-spec grammar. Accumulate candidate blocks only provisionally; commit recognized output only when every block matches. Return a content-free interpretation outcome alongside parsed blocks; fallback returns the original decoded string untouched. Do not retain partially recognized content. Use bounded line scans rather than backtracking expressions. Reuse existing block and literal rendering helpers; no new dependency is needed for this deliberately narrow TXT grammar.

Blank lines are structural separators; blank dialogue paragraphs are deliberately outside this layout. Two-digit hours and end-after-start are conservative assumptions based on the sample; midnight rollover, fractions, cue counters, preambles, and other dialects fall back. Continuation lines that resemble timing headers force fallback even when malformed, preventing missing separators from swallowing a cue. Speaker labels are source labels only. Generic auto-detection or a format/provider dropdown would imply broader support than established evidence.

### Make interpretation reviewable

Keep classification eligibility independent from recognition success: unfamiliar decoded nonempty TXT is valid plain fallback. Display the selected layout in plan summary and the actual outcome on eligible TXT rows with no speaker/dialogue excerpts. Capture outcome in the plan and verify it agrees on execution after source evidence checks. Apply the same policy to inbox discovery without enabling formats, observation, or automatic creation. Rename the existing timestamp control/summary to Transcript timestamps so it truthfully covers TXT, VTT, and SRT while retaining its persisted policy key.

### Reuse rendering with explicit schema eligibility

Successful structured TXT supplies speaker headings and exact source time strings to the existing renderer; its interpretation marks it schema 2 even with the default output profile. Default/plain fallback keeps existing schema selection. This avoids silently publishing new structure as schema 1 or changing every existing TXT/SRT note. No schema 3 is needed for fields already supported by schema 2. Verify manual companion enrichment still accepts the resulting notes. Preserve dynamic fences and folded-callout containment, including adversarial speaker labels.

### Keep mutation and release evidence separate

No writes occur in parsing or review. The current execution adapter retains explicit selection, source hash/length checks, destination absence checks, cancellation/unload handling, create-only writes, and read-back verification. Add focused integration cases rather than a second executor. Fixtures use invented labels and dialogue, never the pasted sample.

## Risks / Trade-offs

- Narrow grammar rejects plausible exports -> preserve whole source and expose fallback; add future layouts only through a separate approved scope.
- Global opt-in can interpret any matching TXT -> default remains plain; actual interpretation is visible before selection.
- Parser policy drifts between scan and create -> immutable snapshot, fingerprints, actual-outcome checks, mutable-input tests.
- Speaker text activates Markdown -> reuse safe headings and literal containment tests across four output combinations.
- Unsynced predecessor specs conflict -> reconcile with the active SRT delta before application; retain all SRT requirements and verify predecessor review/closure before release.

## Migration Plan

Implement pure settings/parser behavior first, then policy integration and UI, then documentation and packaged disposable-vault acceptance. Run existing quality gates and unchanged TXT/VTT/SRT golden tests. Do not bump release metadata until release preparation is explicitly authorized. Switching back to Plain text affects future plans only; it neither edits nor deletes existing notes. Publication follows the repository's established release verification process after the 0.4.0 prerequisite is resolved.
