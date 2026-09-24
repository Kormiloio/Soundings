# Design

## Context

See `proposal.md` for motivation and `specs/community-release/spec.md` for the release contract. Release `0.1.1` passed network, dependency, obfuscation, and build-reproduction checks and cleared every original warning, but the completed source scan identified an unnecessary assertion in saved-settings migration and required the global `window` timer in the Obsidian adapter. The accepted conversion and settings behavior must not change.

## Goals / Non-Goals

**Goals:**

- Remove the two exact scanner findings with minimal, type-safe source changes.
- Add local warning contracts that fail before another release is published.
- Preserve settings migration, config-directory exclusions, cooperative yielding, and all vault safety behavior.
- Produce and verify an immutable `0.1.2` package suitable for one more owner-controlled rescan.

**Non-Goals:**

- Changing discovery, planning, parsing, rendering, conversion, or destination publication behavior.
- Adding artifact-attestation automation; the scanner labels it a recommendation and it requires a separate supply-chain design.
- Treating expected vault enumeration as a defect or narrowing recursive discovery.
- Adding mobile support. The package remains desktop-only and mobile acceptance stays deferred.
- Automating the owner's Community Publish action.

## Decisions

### Narrow the exclusion helper input instead of asserting a complete settings object

The editable-exclusion helper will accept only the `excludedPaths` shape it reads. Saved settings can then pass a structurally valid object assembled from stored exclusions without asserting that partially loaded data is a complete `SoundingsSettings`. Existing validation remains the only path that constructs effective settings.

Retaining the assertion was rejected because it is the scanner finding and overstates the runtime evidence. Rewriting migration around a second settings parser was rejected because it duplicates the validated persistence boundary and expands this patch unnecessarily.

### Use the global window timer only in the Obsidian adapter

Cooperative yielding will call `window.setTimeout(resolve, 0)` exactly as required by the Community scanner. Timer access remains confined to the host adapter; pure discovery, planning, parsing, rendering, and execution modules remain platform-independent and test-injected where applicable.

Keeping `activeWindow.setTimeout` was rejected because the completed scanner explicitly warns against it. Moving timer access into the core was rejected because it would couple deterministic domain code to the DOM. No mobile-readiness claim follows from this change; `isDesktopOnly: true` remains unchanged.

### Extend scanner contracts with focused fixtures and source checks

The Community source-contract test and runtime audit will recognize the rejected assertion and timer patterns, prove synthetic fixtures are detected, and confirm current runtime sources are clean. Existing migration, UI, integration, scale, and safety tests will remain the behavioral regression gate.

Only checking for the exact reported line numbers was rejected because line positions drift. Broadly banning all TypeScript assertions was rejected because unrelated assertions can be legitimate; the contract will target the unsafe complete-settings assertion at this migration boundary.

### Publish 0.1.2 without changing earlier releases

Package and manifest versions will advance to `0.1.2`; the compatibility map will retain `0.1.0` and `0.1.1` and add `0.1.2` for Obsidian 1.13.7. Release staging remains version-driven and must contain exactly the three runtime assets. Publication stops if the tag or release already exists or if earlier remote hashes differ from their recorded values.

The staged package will receive a targeted disposable-vault desktop check for identity, saved-settings/config-directory safety, equivalent ribbon/command plans, close-without-conversion non-mutation, collision refusal, and one explicit create/read-back. After remote hash verification, the owner will request another Community review and keep the draft unpublished on any actionable result.

## Risks / Trade-offs

- **[Narrowed helper type hides a missing field dependency]** → Keep the helper implementation limited to `excludedPaths` and cover it with direct migration and mandatory-exclusion tests.
- **[Global window timing differs in an Obsidian popout]** → Limit the change to zero-delay cooperative yielding, retain cancellation/scale tests, and verify the staged build in real Obsidian desktop.
- **[Local pattern checks diverge from the hosted scanner]** → Treat local checks as preflight only and require the completed hosted Community review before publication.
- **[Patch metadata mutates release history]** → Verify `0.1.2` absence and fresh-download hashes for `0.1.0` and `0.1.1` before creating the new immutable release.
- **[Recommendations are mistaken for blockers or silently ignored]** → Record both recommendations explicitly while preserving the actual product behavior and keeping attestation work out of this patch.

## Migration Plan

1. Add focused failing source-contract fixtures for the assertion and timer warnings.
2. Narrow the exclusion-helper input and switch adapter yielding to `window.setTimeout`; run targeted migration, adapter, and source-contract tests.
3. Advance 0.1.2 metadata and documentation while preserving all historical compatibility entries and releases.
4. Run the full build/test/audit/scale/release gate and stage exactly three assets.
5. Install only staged assets in a disposable Obsidian 1.13.7+ desktop vault and repeat the named non-mutation and explicit create/read-back checks.
6. Commit and push the accepted candidate, verify remote preconditions, publish immutable release `0.1.2`, and compare fresh remote hashes for all three releases.
7. Have the owner request a completed Community rescan. Keep the listing unpublished on any actionable finding; otherwise hand off the final Publish click to the owner.

Rollback before release is a normal code revert. After publication, leave `0.1.2` immutable and use another patch for any new finding.
