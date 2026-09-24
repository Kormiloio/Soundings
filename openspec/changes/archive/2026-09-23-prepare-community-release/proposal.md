# Proposal

## Why

Soundings has completed its desktop foundation acceptance, but it cannot yet be installed through Obsidian's Community directory because the public repository lacks a license, an installable GitHub release, complete end-user guidance, and a submission-focused policy review. Preparing a reproducible `0.1.0` release now turns the accepted build into a reviewable public distribution without expanding runtime scope.

## What Changes

- License Soundings under the MIT License, with Kormilo identified as the copyright holder.
- Expand the public README with supported-platform, installation, first-use, privacy, safety, support, and release information suitable for the Community directory listing.
- Align the settings page with Obsidian's current plugin UI guidance by removing the redundant raw settings heading while retaining the safety explanation and all existing controls.
- Add deterministic release verification and packaging that produces exactly `main.js`, `manifest.json`, and `styles.css`, verifies their version and required metadata, and fails closed on inconsistent or missing assets.
- Document and execute the `0.1.0` GitHub release process, including an exact `0.1.0` tag and individually attached runtime assets.
- Record the final automated, disposable-vault, and desktop acceptance evidence required before the owner submits `https://github.com/Kormiloio/Soundings` through the Obsidian Community directory.
- Keep Community-directory account linking, policy acceptance, ownership selection, and final submission as an explicit owner action.
- Add no vault mutations. Release preparation SHALL NOT change transcript discovery, conversion, destination handling, source preservation, local-only processing, or content-free diagnostics.
- Explicit non-goals: mobile support, AI enrichment, automatic conversion, external services, telemetry, self-update behavior, and changes to the accepted transcript contract.

## Capabilities

### New Capabilities

- `community-release`: Defines the observable repository, release-artifact, versioning, policy-review, and submission-readiness contract for an installable desktop Community release.

### Modified Capabilities

None.

## Impact

- Public repository files: `LICENSE`, `README.md`, release documentation, and version metadata.
- Plugin UI: `src/obsidian/settings-tab.ts` and its UI-contract tests; settings behavior and stored values remain unchanged.
- Build and verification tooling: package scripts and release checks that inspect the production bundle and required release assets without adding runtime dependencies.
- External distribution: a GitHub `0.1.0` release in `Kormiloio/Soundings`, followed by owner submission through `community.obsidian.md`.
- Runtime safety: no new network access, filesystem primitive, credential handling, telemetry, destructive API, or vault-content mutation.
