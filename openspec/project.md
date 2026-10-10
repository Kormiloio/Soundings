# Soundings — Project Context

## Mission

Turn transcripts already organized inside an Obsidian vault into navigable Markdown knowledge without surrendering local control or risking existing content.

## Non-negotiables

1. Preserve original transcript files.
2. Never overwrite an existing destination note.
3. Keep discovery/planning separate from execution.
4. Revalidate evidence immediately before every vault mutation.
5. Keep foundation processing local, deterministic, and free of network access.
6. Keep AI enrichment outside the converter core and behind a separately approved capability.
7. Ship the first release as desktop-only while retaining public Obsidian API boundaries for possible future mobile work.
8. Test mutations against disposable vaults before personal or work data.

## Initial architecture boundaries

- **Obsidian adapter:** commands, settings, notices, vault events, review UI, and lifecycle.
- **Discovery and exclusions:** inventories supported candidates without mutation.
- **Conversion planner:** derives destination paths and classifies eligibility, collisions, exclusions, and errors.
- **Transcript parsers:** produce a source-neutral transcript model from plain text and WebVTT.
- **Markdown renderer:** produces versioned frontmatter and deterministic note sections.
- **Conversion executor:** revalidates evidence and publishes only to an absent destination.
- **Diagnostics:** content-free outcome records and user-facing summaries.
- **Enrichment boundary:** manual local companion-note enrichment (shipped); future provider-backed enrichment remains separately approved and outside the converter core.

## Active focus

1. Maintain the published desktop Community plugin without weakening its local-only and create-only boundaries.
   - Completed change `release-0-2-3` (published as `0.2.3` on 2026-10-01; Community review **Passed**; archived) clears the Community scorecard's `no-unsafe-argument` warning in `src/core/settings.ts`, adds a zero-warning type-aware lint gate to CI and releases, confirms companion-note publication in the desktop app, and adds `CONTRIBUTING.md`. After publication the listing is rescanned against `0.2.3`.
   - Completed change `harden-0-2-2` (published as `0.2.2` on 2026-10-01; archived) fixed the `0.2.1` review findings before new features ship: a linear-time WebVTT markup scanner, observation registered after layout-ready, case- and Unicode-insensitive collision identity, unload guards, note-structure escaping, typed settings, and fail-closed release tooling.
2. Introduce ergonomic transcript callouts in Output Profiles (`> [!quote]- Full Transcript`) as opt-in feature release `0.3.0`.
   - Completed change `2026-10-03-add-folded-transcript-callouts` (published as 0.3.0 on 2026-10-02 local time; archived) adds a **Transcript display** profile choice: `plain` (default, byte-identical) or `folded-callout`, which wraps the transcript in one collapsed, searchable `quote` callout. Every line is prefixed so source text cannot escape it, and containment is proven with CommonMark structural tests. Automated and owner-assisted packaged desktop acceptance pass; PR #8 merged and the three matching published assets have verified attestations. The owner-reported Community rescan shows Health Excellent and Review Passed; deltas are synced to the main specs.
3. Closed the published SRT-only `0.4.0` release through `add-srt-transcript-support`: UTF-8 numbered cues, faithful literal text, shared timestamp/display options, and the existing reviewed create-only flow. SRT is opt-in and saved enabled formats are preserved. Build/lint, 523 tests across 41 files, runtime/production audits, strict validation, staging, and packaged desktop acceptance (including custom configuration-folder exclusions) pass. PR #11 merged and the attested bare-tag release shipped on 2026-10-05; downloaded assets match accepted hashes, provenance is verified, and all nine prior releases remain unchanged. The owner supplied the current public Review: Passed listing on 2026-10-09 and authorized spec sync/archive; closure is complete.
4. Published `add-timestamped-speaker-txt` as `0.4.1`: one opt-in blank-separated time-range / speaker-dialogue TXT layout, whole-file plain fallback, content-free interpretation review, and schema-2 structured output. Plain text remains default; synthetic fixtures replace private samples. Automated checks and owner-assisted desktop acceptance pass, including the final versioned custom-folder package check. Owner-authorized publication completed on 2026-10-09 through PR #13 and the attested release workflow; downloaded assets match accepted hashes and all ten prior release inventories remain unchanged. Owner Community rescan and authorization to sync/archive this TXT change remain pending. `0.4.2` explicitly identified shared TXT (notes, minutes, correspondence, chat) remains separate, with its own schema/enrichment design. `0.4.3` is an optional evidence-driven fixes/UX checkpoint, not a feature commitment.
5. Prioritize `document-provider-compatibility`: a provider compatibility index, verified Zoom export guidance, provenance-labeled representative fixtures with complete expected output and workflow safety checks, and a transcript contribution checklist. Reuse `tests/golden.test.ts`, existing integration/execution coverage, and the 5,000-file acceptance baseline. Label synthetic reproductions separately from provider-verified exports and distinguish released support from the structured-TXT development candidate. This documentation/test change adds no runtime behavior and explicitly skips capability deltas; parser changes discovered by its evidence require separate changes.
6. Design guarded speaker-to-person entity linking against existing vault notes as a separate proposed `0.5.0` change. Extracting a speaker label does not resolve a vault identity; ambiguous matches require user choice and Person notes are never created automatically.
7. Defer provider-specific JSON, direct document/email extraction, safe reconversion, and model-backed enrichment to separately scoped changes. Evaluate Android, iOS, and iPadOS only through a separate future change. Centralized UI strings/localization and hide/reopen during conversion are later investigations; hiding must be designed explicitly against the current dismiss-to-cancel contract. A parser registry is deferred until concrete format growth justifies it.

The owner uses mostly Zoom but also receives transcripts and general written material from other people. The proposed release sequence is recorded in `docs/PRD.md`; numbers are provisional, have no dates, and additive patch-version targets must be confirmed per release. Create one implementation change at a time, and leave main capability specs unchanged until the corresponding behavior is implemented and verified.

## Foundation implementation checkpoint

The TypeScript plugin, discovery and planning core, strict text/WebVTT parsers, inert Markdown renderer, create-only executor, review UI, settings, and cancellation lifecycle are implemented. The production build and 60 automated tests pass. A temporary 5,000-file desktop rehearsal completed in 4.1 ms for the recorded scan phase and recorded zero source mutations. The runtime audit found no network, telemetry, Node filesystem, credential, or destructive vault APIs, and npm reports no production dependency vulnerabilities.

Desktop acceptance passed in a disposable vault using Obsidian 1.13.7 on macOS 26.6.2 arm64. Keyboard-visible validation, create/read-back, planning-time collision refusal, execution-time destination-race refusal, and source-byte preservation were verified. The first release is desktop-only; mobile support and acceptance are deferred.

The safe-destination change performs deterministic basename normalization in the pure planner, exposes the final path before selection, and applies all collision checks to that reviewed path. The production build, runtime security audit, strict OpenSpec validation, 69 automated tests, and a repeated 5,000-file rehearsal with zero source mutations pass. Disposable-vault acceptance on Obsidian desktop 1.13.7 confirmed the exact reviewed safe destination, successful create/read-back, sanitized collision refusal, close-without-conversion behavior, and unchanged source hashes. After explicit confirmation, the accepted build was installed in the work vault with matching plugin-file hashes. A controlled conversion then created the reviewed safe destination with correct source metadata while preserving the original transcript hash; the other 25 candidates were skipped and no existing Markdown was overwritten.

The ribbon-icon change registers one public-API waves control labeled **Scan vault for transcripts** and keeps the command-palette entry, with both invoking the existing guarded review workflow. The production build, runtime security audit, strict OpenSpec validation, 69 automated tests, and 5,000-file rehearsal with zero source mutations pass. Disposable-vault acceptance on Obsidian desktop 1.13.7 confirmed one correctly labeled waves icon after disable/re-enable, an unselected review plan on activation, and the retained command-palette entry. After explicit confirmation, the hash-matched build was installed in the work vault; the ribbon opened the same unselected plan, and a repeated close-without-conversion check left the reference transcript and Markdown note hashes unchanged.

The approved Community-release change adds MIT licensing, end-user documentation, Obsidian review cleanup, fail-closed release staging, packaged-build acceptance, and immutable GitHub release verification. It introduces no runtime network access, telemetry, external-file access, mobile claim, or new vault mutation. Account linking, listing ownership, policy acceptance, and final Community submission remain explicit repository-owner actions.

The staged `0.1.0` package passed desktop acceptance on Obsidian 1.13.7 and macOS 26.6.2 arm64. Commit `ea95960` is public on `main`; GitHub recognizes the MIT license; plugin ID `soundings` was available at preflight; and immutable release `0.1.0` exposes exactly the three accepted assets with matching SHA-256 hashes. Only the owner-controlled Obsidian Community directory form remains.

The owner created the Community listing draft and the automated review passed dependency and obfuscation checks. Vault enumeration was identified as expected behavior; source warnings cover `globalThis`, regular-expression lint, configurable vault-directory handling, declarative settings search support, and deprecated destructive-button styling. The draft remains unpublished until a separately approved patch addresses those findings.

The `address-community-review-feedback` patch injected host-window cryptography and identifiers at the Obsidian boundary, replaced the flagged regular expressions with equivalent character transforms, derived mandatory exclusions from `Vault.configDir`, adopted declarative searchable settings, and used supported destructive-button styling. Immutable release `0.1.1` passed packaged desktop acceptance and its Community rescan cleared every original warning. The rescan passed network, dependency, obfuscation, and byte-for-byte build checks while reporting expected vault enumeration and missing artifact attestations as recommendations.

The completed `0.1.1` scan identified two follow-up source warnings: an unnecessary `SoundingsSettings` assertion during saved-settings migration and `activeWindow.setTimeout()` in the vault adapter. The `clear-community-review-followups` patch narrowed the exclusion-helper input, used `window.setTimeout()` at the adapter boundary, added local contracts for both findings, and prepared immutable release `0.1.2`. It did not change vault mutation, data handling, supported platforms, or conversion output; the Community listing remained unpublished until the clean completed rescan.

Immutable release `0.1.2` passed 101 automated tests across 16 suites, runtime and dependency audits, strict validation, exact three-asset staging, saved-settings upgrade acceptance, custom-config exclusion, non-mutating review, explicit create/read-back, remote hash verification, and a completed Community review with no actionable finding. On 2026-09-24 the repository owner published Soundings in the Obsidian Community directory; the public listing reports Review Passed and Health Excellent.

The completed `add-reviewed-transcript-inbox` change keeps observation off by default and uses the same pure single-path discovery policy as manual scans. Stable new-file evidence is serialized into a content-free in-memory inbox; a coalesced notice and command hand current files to the existing zero-selection review. Observation is lifecycle-bound, local-only, and cannot call conversion. All 135 automated tests and every production, security, strict-spec, event-storm, disposable-desktop lifecycle, dismissal, deduplication, notification, and explicit create/read-back check passed with protected hashes unchanged.

The completed `improve-vtt-compatibility-and-discovery` change expands WebVTT parser compatibility to support optional hours in timestamps, unclosed voice tags, and multiple voice lines per cue. It moves parsing into the discovery phase so that the review plan accurately classifies items as `eligible`, `unsupported`, or `unreadable` before any conversion is attempted. The production build, runtime security audit, strict OpenSpec validation, and 205 automated tests pass. A repeated 5,000-file rehearsal with zero mutations confirmed stability.

Release `0.2.0` was published from commit `4b74b86`. Its `main.js` (`eb42c8fa…`) reproduces byte-for-byte from that commit but differs from the build recorded in packaged desktop acceptance (`06da240b…`), which included exact source-note identification and full-path companion backlinks. The `v0.1.3` release was tagged with a `v` prefix and is not installable through Obsidian.

The completed `release-0-2-1` change shipped that verified hardening plus per-speaker WebVTT attribution, header-metadata and whitespace-separator handling, single-pass character-reference decoding, manual-enrichment draft retention after unsuccessful publication, line-delimited frontmatter identification, and a split read-only build / job-scoped publish release workflow with SHA-pinned actions, bare-tag enforcement, and version-scoped release notes. The production build, runtime and dependency audits, strict OpenSpec validation, and 244 automated tests across 29 files pass, and packaged desktop acceptance on Obsidian 1.13.7 (macOS 26.7 arm64) passed with unchanged source hashes. Immutable release `0.2.1` was published on 2026-09-30 by the attested workflow with exactly the accepted asset hashes, and every attestation verifies against tag `0.2.1`.

The completed `harden-0-2-2` change shipped as `0.2.2` through pull request `Kormiloio/Soundings#3`.
- **Bounds:** 1 MB adversarial WebVTT cues classify in milliseconds; 6 KB took about 12 s in `0.2.1`. A 400,000-case differential fuzz against `0.2.1` shows only intended, fail-closed differences.
- **Identity and lifecycle:** collision checks are case- and Unicode-insensitive and backed by a storage-level existence check. Unload guards are covered by behavior tests driving the real `main.ts`, and observation stays quiet at startup.
- **Output and settings:** note and enrichment structure is escaped, and saved settings are type-checked.
- **Tooling:** the runtime audit enforces an `obsidian`-only bundle, and release staging is confined to `release/<version>`.
- **Gate:** the production build, 427 automated tests across 36 files, runtime and production dependency audits, strict OpenSpec validation, release staging, and `git diff --check` pass.
- **Acceptance:** packaged desktop acceptance on Obsidian 1.13.7 passed, except that Escape-cancel was not observable and companion publication was not verified (see `docs/VERIFICATION.md`).
- **Release:** immutable release `0.2.2` was published on 2026-10-01 from merge commit `65d488e` by the attested workflow, with exactly the accepted asset hashes and verified attestations. The change is archived as `2026-09-30-harden-0-2-2`, and its deltas are merged into `openspec/specs/`.

The completed `release-0-2-3` change shipped as `0.2.3` through pull request `Kormiloio/Soundings#6`:
- **Companion publication:** confirmed working in the desktop app, which resolves the `0.2.2` caveat with no code change.
- **Lint gate:** a zero-warning type-aware gate using Obsidian's official ESLint rules runs in CI and inside `npm run check`. It reproduced the scorecard finding exactly before the fix.
- **Fixes:** the finding and three more lint errors are fixed with no behavior change. The bundle differs from `0.2.2` only in section and tag validation.
- **Guide:** `CONTRIBUTING.md` added.
- **Gate:** build, lint, 437 automated tests across 37 files, runtime and production dependency audits, strict OpenSpec validation, release staging, and `git diff --check` pass.
- **Acceptance:** packaged desktop acceptance on Obsidian 1.13.7 passed with no caveats. It covered rejection of untrusted saved sections, a valid profile save, the scan, a profile-aware conversion, companion publication, and unchanged protected hashes.
- **Release:** immutable release `0.2.3` was published on 2026-10-01 from merge commit `ba1ce8f` with verified attestations. After the owner's rescan, the Community listing shows `0.2.3` with Health **Excellent**, Review **Passed**, and no warnings. Private vulnerability reporting is enabled. The change is archived and its delta merged into `openspec/specs/`.

## Definition of done

A change is complete only when its tasks are checked, automated tests pass, named manual/device checks are recorded, documentation matches actual behavior, and no safety-critical decision is hidden in implementation details.
