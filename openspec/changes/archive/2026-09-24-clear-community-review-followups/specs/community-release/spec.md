# Spec Delta

## ADDED Requirements

### Requirement: Corrective releases clear actionable Community findings
Each corrective release prepared for the existing Soundings Community draft SHALL use a new immutable semantic version, preserve every earlier published tag and asset, reproduce its committed production bundle, and receive a completed Community review with no actionable source warning or failure before the owner is asked to publish the listing.

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
