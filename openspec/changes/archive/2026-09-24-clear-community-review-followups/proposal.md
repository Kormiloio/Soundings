# Proposal

## Why

The completed Obsidian Community review for `0.1.1` resolved the original findings but reported two new source warnings: an unnecessary TypeScript assertion and unsupported timer guidance. A narrowly scoped `0.1.2` patch is needed to clear those warnings without changing accepted plugin behavior or publishing the listing prematurely.

## What Changes

- Remove the unnecessary `SoundingsSettings` assertion from saved-settings migration while preserving validation, mandatory exclusions, and `0.1.0` preference compatibility.
- Use `window.setTimeout()` for cooperative vault-adapter yielding as required by the Community scanner, while keeping timer access outside the pure conversion core.
- Extend source-review contracts so both warning patterns fail locally before release.
- Advance package, manifest, compatibility, release tooling, and verification records to an immutable `0.1.2` patch; retain `0.1.0` and `0.1.1` releases unchanged.
- Repeat automated checks, exact-asset staging, targeted disposable-vault desktop acceptance, remote hash verification, and the owner-controlled Community rescan.
- Treat GitHub artifact attestations and vault enumeration as recorded non-blocking recommendations; artifact-attestation automation is outside this focused warning-removal patch.
- Add no vault mutation. Discovery remains non-mutating, conversion remains explicit and create-only, and any validation, source-evidence, collision, or release conflict continues to fail without changing a source or existing note.
- Explicit non-goals: mobile support, AI enrichment, automatic conversion, content transmission, telemetry, external-folder access, source or destination mutation changes, artifact-attestation infrastructure, and clicking Community **Publish** on the owner's behalf.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `community-release`: Define the immutable `0.1.2` corrective release, local contracts for the two follow-up warning patterns, preservation of prior releases, and a clean owner-controlled Community rescan before publication.

## Impact

- Runtime source: `src/main.ts` and `src/obsidian/vault-adapter.ts` only, with no intended observable conversion change.
- Tests and audits: Community source-warning fixtures, settings migration coverage, timer behavior, runtime audit, build reproduction, and existing safety suites.
- Distribution: package/manifest version `0.1.2`, compatibility map, release staging, release documentation, verification evidence, immutable GitHub assets, and the existing unpublished Community draft.
- Dependencies and data handling: no new dependency, network call, telemetry, credential, content logging, external-file access, or destructive vault API.
