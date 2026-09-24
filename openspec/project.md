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
- **Enrichment boundary:** future manual, local, or provider-backed enrichment; absent from the foundation runtime.

## Active focus

1. Maintain the published desktop Community plugin without weakening its local-only and create-only boundaries.
2. Evaluate Android, iOS, and iPadOS only through a separate future change.

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

## Definition of done

A change is complete only when its tasks are checked, automated tests pass, named manual/device checks are recorded, documentation matches actual behavior, and no safety-critical decision is hidden in implementation details.
