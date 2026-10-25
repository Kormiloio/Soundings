# Design

## Context

See proposal.md for motivation and the three capability deltas for observable behavior. This is a cross-cutting data-model change and requires a design even though no new external service is involved.

Observed in the 0.4.1 checkout:

- `src/core/types.ts` separates TXT interpretation from format but has no semantic content kind. `buildPlan` freezes items and captures settings/profile/layout evidence.
- `src/core/execution.ts` rereads and hashes source bytes, reparses using captured TXT policy, compares interpretation, and publishes through the existing create-only adapter with read-back verification.
- `src/obsidian/review-modal.ts` owns selections and filters but receives a fixed plan. Its conversion callback passes only selected paths, so changing row state in the modal alone would not reach execution safely.
- `src/core/rendering.ts` always emits meeting-transcript/transcript metadata and a Transcript body. Profile-derived schemas are 1/2; recognized structured TXT is schema 2.
- `src/core/enrichment-evidence.ts` recognizes only schema 1/2 meeting-transcript/transcript tuples, using a bounded frontmatter identity subset rather than treating every Markdown note as eligible. `enrichment-rendering.ts` uses a full-path backlink but labels it Back to Transcript Note.
- Existing planning, TXT layout, goldens, review-state/modal, execution, and enrichment tests provide extension points. The separate provider-compatibility planning directory is unrelated and must not be changed.

## Goals / Non-Goals

**Goals:** Keep byte-compatible transcript defaults; make reviewed semantic kind distinct from physical format and parsing layout; preserve source evidence across an explicit in-memory review revision; reuse creation and companion protections.

**Non-Goals:** No general importer abstraction, parser registry, new persistent classification store, per-kind template engine, global default-kind setting, automatic extraction, or source-note migration. Acceptance remains desktop-only and uses public vault APIs; mobile evaluation is explicitly deferred.

## Decisions

### 1. A small content-kind union, not another format

Use internal values `transcript`, `notes`, `meeting-minutes`, `correspondence`, and `chat`. Format remains txt/vtt/srt. Eligible TXT gets a per-row Content type dropdown; VTT/SRT remain fixed transcripts. Fresh scans and inbox reviews default to Transcript, and format enablement/exclusions are unchanged. Keep existing command IDs; generalize candidate/search wording where needed so the review does not falsely label chosen shared text as a transcript.

A saved global kind would classify unrelated future files silently; filename/content inference would contradict explicit owner identification. Neither is introduced. Batch assignment is deferred to keep the first interaction and its evidence simple.

### 2. Revised immutable plans, not mutable rendering metadata

Add a pure plan-revision operation that validates eligible TXT assignments, returns a new frozen plan/revision with captured effective kind/policy identity, and leaves original byte evidence, safe destinations, and collision classifications intact. A changed row is deselected; unchanged selections and filters survive. Refresh/reopen discards kind choices and all selection. Stable source paths identify rows only within that review, not across scans.

Update the modal/controller conversion contract so execution receives the actual reviewed revised plan, not the original closure's plan with a detached kind map. Bind the selected paths to that revision. Ignore no unknown kinds: a missing kind on a supported legacy/default plan means Transcript, while an explicitly invalid or incompatible kind is refused. Capture and check effective kind/interpretation identity before parsing and again after asynchronous work immediately before creation, alongside existing settings/profile/layout/lifecycle checks. Test captured-object alteration, queued stale selection, and in-flight policy changes.

Keeping kind only in UI state risks executing a different plan; persisting a path map creates stale identity and rename concerns. Revising the existing plan keeps the reviewed source and output contract together without retaining payloads in review state.

### 3. Non-transcript TXT uses the complete literal decoding path

For shared-text rows, force effective TXT parsing to plain at execution regardless of global Timestamped speaker. Discovery still verifies readability, strict decoding, bounds, and source identity; its transcript recognition result does not authorize discarding source lines from shared-text output. The revised row shows the explicit literal override. Returning to Transcript restores the original captured transcript interpretation, using discovery metadata without retaining the transcript body.

Do not mutate the global setting or force existing TXT-layout fingerprint checks to compare a deliberate per-item plain override to the global layout. Track captured global layout separately from effective per-item parsing policy and revalidate both. Existing source/settings changes still invalidate the run. All source-like timing, mail headers, separators, whitespace, and repeated content remain literal.

Reusing speaker blocks for Chat or Minutes was rejected: it could strip headers or infer identities. A generalized text extractor is unnecessary for decoded TXT.

### 4. Additive schema 3 with a neutral body

Only new non-transcript choices emit this identity tuple:

```yaml
type: "shared-text"
source: "shared-text"
source_format: "txt"
content_kind: "notes"
soundings_version: 3
```

The other supported content_kind values are meeting-minutes, correspondence, and chat. Preserve source_file, converted_at, safe title/project/tags, adjacent destination patterns, and the existing enabled reserved sections. The final body is `## Source Text` with one complete literal fence, optionally inside `> [!quote]- Full Source Text`. Timestamp controls never remove literal lines. Reuse existing safe-heading, YAML scalar, adaptive-fence, and line-prefix containment helpers; do not duplicate sanitizers.

The four kinds deliberately share Summary/Decisions/Action Items/Follow-ups placeholders, controlled by the existing profile, rather than inventing type-specific extracted sections. Kind is identity metadata, not a claim of understanding. Transcript mode retains exactly the old metadata, schema selection, Transcript heading and Full Transcript callout; do not add content_kind to legacy transcript output.

The existing Versioned Markdown and timestamped-speaker requirements currently read broadly. Their deltas explicitly scope those transcript-specific sections/recognition to Transcript kind; the new shared-text contract is additive, not a silent relaxation of legacy behavior.

### 5. Explicit shared-text enrichment eligibility

Extend source identification with a separate exact schema-3 tuple branch. Require all identity fields once, support only the four known kind values, and reject mismatched type/source/format, duplicates, unknown schema, invalid UTF-8, oversize notes, and unlinkable paths. Keep legacy schema-1/2 acceptance; do not broaden the version allow-list without also validating the schema-specific tuple. Required fields use the existing generated scalar forms; this is identity validation, not cryptographic proof that a user-created file originated in Soundings.

Carry kind/schema identity in source evidence as needed and keep byte-hash revalidation. Reuse the existing draft, preview, destination derivation, atomic create, source preservation, failure draft retention, and read-back verification. New companions for every supported source use Back to Source Note. This is an intentional new-rendering wording change, not a conversion compatibility change; existing companion files are not rewritten.

Supporting arbitrary Markdown based on a lone content_kind field was rejected because it defeats the current verified-schema boundary. Full YAML parsing is not required for a narrow generated-identity subset and no new runtime dependency is planned.

## Risks / Trade-offs

- Kind changes may accidentally reuse an old selection or original controller plan: use immutable revisions and modal/controller integration tests, not just dropdown tests.
- Global layout and effective plain override may be conflated: test both values, source evidence, and settings-change guards before and during async reads.
- A new schema could invalidate legacy enrichment or accept future metadata too broadly: test the exact acceptance/rejection matrix and unchanged schema-1/2 fixtures.
- More dropdowns increase review density: use accessible native/Obsidian menu controls and stable row layout; verify keyboard interaction and narrow desktop windows.
- A user can choose the wrong semantic label: show it explicitly and require selection after a change; do not guess or silently correct it.
- Later downgrade to 0.4.1 cannot enrich schema-3 notes: document this limitation; source/output files remain readable Markdown and must not be rewritten on downgrade.

## Migration Plan

No settings migration or note backfill. Missing kind remains Transcript; review choices are ephemeral. Keep runtime version metadata at 0.4.1 during implementation until release preparation is separately authorized. Target 0.4.2 remains the owner's proposed additive pre-1.0 increment, not a publication authorization.

Implement pure kind/revision policy and rendering before adapters. Extend manual eligibility before attempting any schema-3 desktop companion publication. Run existing golden/safety tests plus new per-kind fixtures and full repository gates. Perform owner-assisted disposable desktop checks of mixed-kind review, literal output, both display modes, old/new companions, exclusions, stale evidence, collisions, cancellation/unload, and source/destination hashes. Final versioned custom-configuration package acceptance, release authorization, immutable publication/provenance, and Community review remain separate release gates.

Before publication rollback means reverting the implementation candidate and discarding only its disposable setup, not user files. After publication, fixes require a new version; never mutate prior release assets or automatically migrate existing vault notes.
