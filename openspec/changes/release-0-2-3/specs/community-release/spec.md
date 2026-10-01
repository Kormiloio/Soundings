# Spec Delta

## MODIFIED Requirements

### Requirement: Continuous integration protects release readiness
Soundings SHALL run the production build, a type-aware lint of runtime source that reports zero warnings and errors, automated tests, runtime audit, strict OpenSpec validation, and release-contract tests for proposed changes before they can be treated as release-ready. The release build SHALL run the same lint before staging assets.

#### Scenario: Pull request satisfies continuous checks
- **GIVEN** a proposed repository change preserves all release contracts
- **WHEN** continuous integration evaluates it
- **THEN** every required check reports success without publishing a release

#### Scenario: Runtime boundary regresses
- **GIVEN** a proposed change introduces a forbidden runtime network, telemetry, Node filesystem, destructive vault, or credential pattern
- **WHEN** continuous integration runs the runtime audit
- **THEN** the change fails the required check
- **AND** no release asset is published

#### Scenario: Runtime source passes an untyped value to a typed parameter
- **GIVEN** a proposed change passes a value typed `any` into a typed parameter in runtime source
- **WHEN** continuous integration or the release build runs the lint gate
- **THEN** the check fails before any release asset is staged or published

#### Scenario: Lint tooling stays out of the bundle
- **GIVEN** the lint gate's development dependencies are installed
- **WHEN** the production bundle is built and the runtime audit runs
- **THEN** the bundle still loads only `obsidian`

### Requirement: Corrective releases clear actionable Community findings
Each corrective release prepared for the Soundings Community listing SHALL use a new immutable semantic version, preserve every earlier published tag and asset, reproduce its committed production bundle, and receive a completed Community review with no actionable source warning or failure before the owner is asked to publish the listing or treat the corrective release as complete.

#### Scenario: Corrective patch is ready for owner publication
- **GIVEN** the Community review identified actionable source warnings in release `0.1.1`
- **WHEN** release `0.1.2` is built, accepted in a disposable desktop vault, published with verified assets, and rescanned
- **THEN** the review completes without an actionable source warning or failure
- **AND** releases `0.1.0` and `0.1.1` remain unchanged
- **AND** the owner receives the final Publish handoff

#### Scenario: Local warning contract rejects a regression
- **GIVEN** runtime source contains an unnecessary type assertion at the saved-settings boundary or uses the timer pattern rejected by the Community scanner
- **WHEN** the source-review and runtime-audit gates run
- **THEN** the candidate is rejected before release publication
- **AND** no vault file or prior release is changed

#### Scenario: Community rescan still reports an actionable finding
- **GIVEN** immutable release `0.1.2` has been published and the draft is rescanned
- **WHEN** the completed review contains any actionable source warning or failure
- **THEN** the listing remains unpublished
- **AND** the finding is recorded for a separately reviewed correction

#### Scenario: Non-blocking recommendations remain visible
- **GIVEN** the completed review reports vault enumeration or missing artifact attestations only as recommendations
- **WHEN** release readiness is evaluated
- **THEN** those recommendations are recorded accurately
- **AND** they are not misreported as failures or used to weaken vault-wide discovery, local-only processing, or create-only publication

#### Scenario: Published listing reports a type-safety warning
- **GIVEN** the Community scorecard for the listed release reports `@typescript-eslint/no-unsafe-argument` in runtime source
- **WHEN** corrective release `0.2.3` is built, accepted, published with verified assets, and rescanned
- **THEN** the review reports no actionable source warning or failure
- **AND** releases `0.1.0` through `0.2.2` remain unchanged
