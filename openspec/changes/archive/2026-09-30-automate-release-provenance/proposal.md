# Proposal

## Why

Soundings releases are reproducible and verified, but release creation is still partly manual and the Community scorecard reports missing GitHub artifact attestations. A tightly scoped release workflow can improve provenance and repeatability without changing the plugin runtime.

## What Changes

- Add a GitHub Actions release workflow that runs only for an explicit semantic-version tag and verifies package, manifest, compatibility-map, and tag agreement.
- Build and test from the tagged source, stage exactly `main.js`, `manifest.json`, and `styles.css`, and produce GitHub artifact attestations for the installable assets.
- Publish a new immutable GitHub release only after all validation gates pass; refuse an existing tag or release mismatch rather than replacing assets.
- Add continuous integration for build, tests, runtime audit, OpenSpec validation, and release-readiness fixtures.
- Add release notes/changelog guidance and issue templates for reproducible support intake.
- Do not change runtime network behavior, telemetry, vault access, supported platforms, or owner-controlled Community listing actions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `community-release`: Require CI-verified, attested, immutable release assets and fail-closed automated publication.

## Impact

- Affects `.github/workflows`, release scripts/tests, repository permissions, maintainer documentation, and support templates.
- GitHub-hosted automation requires least-privilege release and attestation permissions; the installed plugin gains no permissions or dependencies.
- Adds no vault mutation and does not transmit transcript or note content.
