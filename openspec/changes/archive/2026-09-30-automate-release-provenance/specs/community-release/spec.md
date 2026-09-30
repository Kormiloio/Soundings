# Spec Delta

## ADDED Requirements

### Requirement: Automated releases are verified and attested
For a new explicit semantic-version tag, Soundings SHALL run build, automated tests, runtime audit, dependency audit, strict OpenSpec validation, and version-driven release preparation from the tagged source. It SHALL publish exactly `main.js`, `manifest.json`, and `styles.css` only when all gates pass and SHALL attach verifiable GitHub artifact attestations for the installable assets.

#### Scenario: Tagged release succeeds
- **GIVEN** a new semantic-version tag matches package, manifest, and compatibility metadata and no release exists for that tag
- **WHEN** the release workflow completes every required gate
- **THEN** one immutable GitHub release is published with exactly the three verified runtime assets
- **AND** each installable asset has provenance tied to the tagged repository source and workflow run

#### Scenario: Validation fails before publication
- **GIVEN** any build, test, audit, OpenSpec, version, inventory, or hash gate fails
- **WHEN** the release workflow runs
- **THEN** no GitHub release is published
- **AND** the failure identifies metadata and paths without transcript or note content

#### Scenario: Tag or release already exists
- **GIVEN** the requested tag or GitHub release already exists
- **WHEN** automated publication is requested
- **THEN** the workflow stops for maintainer review
- **AND** does not replace the tag, assets, attestations, or prior release

### Requirement: Continuous integration protects release readiness
Soundings SHALL run the production build, automated tests, runtime audit, strict OpenSpec validation, and release-contract tests for proposed changes before they can be treated as release-ready.

#### Scenario: Pull request satisfies continuous checks
- **GIVEN** a proposed repository change preserves all release contracts
- **WHEN** continuous integration evaluates it
- **THEN** every required check reports success without publishing a release

#### Scenario: Runtime boundary regresses
- **GIVEN** a proposed change introduces a forbidden runtime network, telemetry, Node filesystem, destructive vault, or credential pattern
- **WHEN** continuous integration runs the runtime audit
- **THEN** the change fails the required check
- **AND** no release asset is published
