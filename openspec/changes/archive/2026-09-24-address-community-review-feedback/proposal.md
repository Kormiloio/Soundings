# Proposal

## Why

Obsidian's automated Community review found source-compatibility and lint warnings in the published `0.1.0` release, so the draft should remain unpublished until a corrected patch is available. A focused `0.1.1` release can resolve those findings, accurately disclose vault-wide path enumeration, and preserve the already accepted local-only and create-only behavior.

## What Changes

- Replace popout-incompatible `globalThis` access with Obsidian-compatible window or injected platform capabilities while keeping hashing, ID generation, and cooperative yielding deterministic and testable.
- Replace the flagged control-character and Markdown-heading regular expressions with equivalent warning-free normalization that retains all accepted filename and rendering behavior.
- Treat the active vault's configurable Obsidian configuration directory as a mandatory scan exclusion instead of assuming it is named `.obsidian`; continue excluding hidden folders, Soundings state, and user-configured paths.
- Migrate the settings tab to Obsidian's declarative settings definitions for 1.13.0+ search support while retaining the six controls, safety explanation, validation feedback, accessibility semantics, and persisted values.
- Replace deprecated destructive-button styling with the supported API.
- Document that recursive discovery enumerates file paths throughout the active vault through Obsidian's public API, then reads only supported candidates that survive exclusions and size checks.
- Generalize and update release tooling, metadata, documentation, and verification for an immutable `0.1.1` GitHub release; keep the existing `0.1.0` tag and assets unchanged.
- Repeat automated, scale, runtime-audit, packaged desktop, and Community-draft review checks before the owner publishes the listing.
- Add no vault mutation beyond the existing explicit create-only Markdown publication. Failure to resolve configuration, settings validation, source evidence, or destination absence remains fail-closed and must not modify any source or existing note.
- Explicit non-goals: mobile support, AI enrichment, automatic conversion, content transmission, telemetry, external-folder access, source changes, destination overwrites, and publishing the Community listing on the owner's behalf.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `transcript-discovery`: Require scans to exclude the vault's actual configured Obsidian configuration directory while preserving recursive discovery, other exclusions, cancellation, and non-mutation.
- `community-release`: Define the corrected `0.1.1` patch, warning-free Community review gate, vault-enumeration disclosure, immutable release assets, and owner-controlled listing publication.

## Impact

- Core and adapter code: hashing, plan ID creation, destination-name normalization, Markdown heading escaping, settings defaults/validation, vault adapter yielding, settings UI, and progress-modal button styling.
- Public Obsidian APIs: `Vault.configDir`, declarative `PluginSettingTab` definitions, supported destructive-button styling, and popout-compatible window access or injected platform functions.
- Tests: settings/config-directory safety, normalization equivalence, declarative UI/search contracts, runtime source audit, release readiness, integration safety, and the 5,000-file rehearsal.
- Distribution: `package.json`, `manifest.json`, `versions.json`, release tooling, README/release/verification documentation, immutable GitHub release `0.1.1`, and the existing owner-controlled Community draft.
- Dependencies and data handling: no new runtime dependency, network access, credential, telemetry, destructive API, external-file access, or transcript-content logging.
