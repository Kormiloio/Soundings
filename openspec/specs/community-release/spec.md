# Community Release Specification

## Purpose

Define a reproducible, policy-compliant desktop release that Obsidian can inspect, install, and list without weakening Soundings' local-only and create-only safety boundaries.

## Requirements

### Requirement: Public repository is submission-ready
The default branch of the public Soundings repository SHALL contain an MIT license, an accurate root manifest, a committed version compatibility map, and a README that explains purpose, supported platform, installation, first use, safety and privacy behavior, limitations, support, and licensing. The README SHALL disclose that recursive discovery enumerates file paths throughout the active vault through Obsidian's public API and reads content only for supported candidates that survive configured exclusions and size checks. The manifest description SHALL satisfy Obsidian's Community directory requirements and the plugin identifier SHALL remain `soundings`.

#### Scenario: Repository readiness check passes
- **GIVEN** the corrected patch release candidate is at the default branch HEAD
- **WHEN** the submission-readiness check evaluates the public repository files
- **THEN** every required file and user-facing disclosure is present
- **AND** the manifest declares version `0.1.1`, minimum Obsidian version `1.13.7`, and desktop-only support

#### Scenario: Vault enumeration is disclosed accurately
- **GIVEN** Soundings recursively inventories candidate paths in the active vault
- **WHEN** a user reviews the public safety and privacy documentation
- **THEN** the documentation explains the vault-wide path enumeration
- **AND** distinguishes path enumeration from content reads and from access outside the active vault

#### Scenario: Required repository metadata is missing
- **GIVEN** a required license, manifest field, compatibility entry, privacy disclosure, or README section is absent or inconsistent
- **WHEN** the submission-readiness check runs
- **THEN** the release candidate is rejected with a content-free actionable reason
- **AND** no release is published

### Requirement: Release assets are deterministic and complete
The release process SHALL build a production bundle and stage exactly the installable runtime files `main.js`, `manifest.json`, and `styles.css` as individual assets. It SHALL derive release staging from the requested semantic version and verify that the package, manifest, compatibility map, release tag, and minimum Obsidian version agree before publication.

#### Scenario: Valid release assets are staged
- **GIVEN** the source tree and release metadata are valid for version `0.1.1`
- **WHEN** the release preparation command completes for tag `0.1.1`
- **THEN** a clean `0.1.1` staging directory contains exactly `main.js`, `manifest.json`, and `styles.css`
- **AND** the staged manifest is byte-identical to the committed root manifest

#### Scenario: Inconsistent release metadata fails closed
- **GIVEN** the package version, manifest version, compatibility map, release tag, minimum version, or required asset is missing or inconsistent
- **WHEN** release verification runs
- **THEN** verification fails before publication with an actionable metadata-only error
- **AND** no partial release is treated as ready

### Requirement: GitHub release matches the manifest version
The corrected public GitHub release SHALL use the exact tag `0.1.1` and SHALL expose `main.js`, `manifest.json`, and `styles.css` as individually downloadable assets whose content matches the verified release staging directory. The published `0.1.0` tag and assets SHALL remain unchanged.

#### Scenario: Published release is installable
- **GIVEN** the verified `0.1.1` assets are ready and the default branch manifest declares `0.1.1`
- **WHEN** the GitHub patch release is published
- **THEN** the release tag is exactly `0.1.1`
- **AND** all three required runtime assets are individually downloadable and match the verified artifacts
- **AND** release `0.1.0` remains immutable

#### Scenario: Existing or mismatched release blocks publication
- **GIVEN** tag `0.1.1` already exists with unknown or mismatched assets
- **WHEN** release publication is attempted
- **THEN** the process stops for review instead of replacing the tag or assets automatically

### Requirement: Installed release preserves accepted safety boundaries
Installing and enabling the packaged desktop release SHALL preserve the reviewed Soundings behavior: loading and manual discovery are non-mutating, candidates are unselected by default, conversion remains explicit and create-only, existing Markdown remains untouched, sources remain unchanged, the configured Obsidian directory remains excluded, and the runtime performs no network or telemetry activity.

#### Scenario: Disposable-vault release acceptance passes
- **GIVEN** the packaged `0.1.1` release is installed in a disposable Obsidian desktop vault containing representative transcripts, collisions, and a renamed configuration directory
- **WHEN** the plugin is enabled and the user opens a scan from the ribbon and command palette without selecting a candidate
- **THEN** both entry points show the same unselected review plan
- **AND** files beneath the configured Obsidian directory are not read or offered
- **AND** no vault file is created, modified, moved, renamed, deleted, or transmitted

#### Scenario: Explicit conversion remains create-only
- **GIVEN** the packaged release shows an eligible transcript and an existing destination collision
- **WHEN** the user selects only the eligible transcript and converts it
- **THEN** one new reviewed Markdown destination is created and verified
- **AND** every source and pre-existing Markdown file remains byte-for-byte unchanged

### Requirement: Community submission remains owner-controlled
Soundings SHALL provide a completed submission checklist and evidence record for `https://github.com/Kormiloio/Soundings`, but linking accounts, selecting listing ownership, accepting Obsidian's developer policies, publishing the listing, and responding to reviewer decisions SHALL require an explicit action by the repository owner.

#### Scenario: Owner receives a complete submission handoff
- **GIVEN** repository checks, `0.1.1` release verification, packaged acceptance, and the automated Community review have passed without actionable source warnings
- **WHEN** patch preparation is declared complete
- **THEN** the owner receives the repository URL, release version, verified asset list, platform declaration, automated-review evidence, and exact draft-publication step

#### Scenario: Automated review still reports actionable findings
- **GIVEN** the Community draft is rescanned against the corrected patch
- **WHEN** any actionable source warning or failure remains
- **THEN** the listing remains unpublished
- **AND** the finding is recorded for another reviewed correction

#### Scenario: Owner has not approved directory submission
- **GIVEN** the GitHub patch release and automated review are ready but the owner has not published the Community draft
- **WHEN** automation finishes
- **THEN** Soundings remains publicly downloadable from GitHub
- **AND** no account connection, policy acceptance, ownership choice, reviewer response, or directory publication is performed on the owner's behalf

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

### Requirement: Release publication is installable and least-privilege
Automated release publication SHALL run only for a bare `x.y.z` tag that equals the manifest version and is reachable from `main`. Dependency installation, build, and verification SHALL run without repository write permission, identity tokens, or persisted credentials. Only a separate publishing job that installs no dependencies SHALL hold release-write and attestation permissions, and it SHALL publish the exact bytes produced and verified by the build job. Workflow actions SHALL be pinned to full commit SHAs.

#### Scenario: Prefixed tag is pushed
- **GIVEN** a maintainer pushes tag `v0.2.1`
- **WHEN** GitHub evaluates release triggers
- **THEN** no release workflow runs and no release is published

#### Scenario: Tag is not on main
- **GIVEN** a bare semantic tag points at a commit not reachable from `main`
- **WHEN** the release workflow runs
- **THEN** the build job fails before staging and no release is published

#### Scenario: Dependency install runs without write access
- **GIVEN** the release workflow is building a tagged release
- **WHEN** dependencies are installed and scripts run
- **THEN** the job token is read-only, no identity token is available, and no credential is persisted in the checkout

#### Scenario: Release notes are version-scoped
- **GIVEN** `CHANGELOG.md` contains a `## <version>` section for the tag
- **WHEN** the release is published
- **THEN** the release notes contain only that section
- **AND** a missing section fails the build before publication
