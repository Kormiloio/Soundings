# Community Release Specification

## Purpose

Define a reproducible, policy-compliant desktop release that Obsidian can inspect, install, and list without weakening Soundings' local-only and create-only safety boundaries.

## Requirements

### Requirement: Public repository is submission-ready
The default branch of the public Soundings repository SHALL contain an MIT license, an accurate root manifest, a committed version compatibility map, and a README that explains purpose, supported platform, installation, first use, safety and privacy behavior, limitations, support, and licensing. The manifest description SHALL satisfy Obsidian's Community directory requirements and the plugin identifier SHALL remain `soundings`.

#### Scenario: Repository readiness check passes
- **GIVEN** the release candidate is at the default branch HEAD
- **WHEN** the submission-readiness check evaluates the public repository files
- **THEN** every required file and user-facing disclosure is present
- **AND** the manifest declares version `0.1.0`, minimum Obsidian version `1.13.7`, and desktop-only support

#### Scenario: Required repository metadata is missing
- **GIVEN** a required license, manifest field, compatibility entry, or README disclosure is absent or inconsistent
- **WHEN** the submission-readiness check runs
- **THEN** the release candidate is rejected with a content-free actionable reason
- **AND** no release is published

### Requirement: Release assets are deterministic and complete
The release process SHALL build a production bundle and stage exactly the installable runtime files `main.js`, `manifest.json`, and `styles.css` as individual assets. It SHALL verify that the manifest and compatibility map agree on the release version and minimum Obsidian version before publication.

#### Scenario: Valid release assets are staged
- **GIVEN** the source tree and release metadata are valid for version `0.1.0`
- **WHEN** the release preparation command completes
- **THEN** a clean staging directory contains exactly `main.js`, `manifest.json`, and `styles.css`
- **AND** the staged manifest is byte-identical to the committed root manifest

#### Scenario: Inconsistent release metadata fails closed
- **GIVEN** the package version, manifest version, compatibility map, release tag, or required asset is missing or inconsistent
- **WHEN** release verification runs
- **THEN** verification fails before publication with an actionable metadata-only error
- **AND** no partial release is treated as ready

### Requirement: GitHub release matches the manifest version
The initial public GitHub release SHALL use the exact tag `0.1.0` and SHALL expose `main.js`, `manifest.json`, and `styles.css` as individually downloadable assets whose content matches the verified release staging directory.

#### Scenario: Published release is installable
- **GIVEN** the verified `0.1.0` assets are ready and the default branch manifest declares `0.1.0`
- **WHEN** the GitHub release is published
- **THEN** the release tag is exactly `0.1.0`
- **AND** all three required runtime assets are individually downloadable and match the verified artifacts

#### Scenario: Existing or mismatched release blocks publication
- **GIVEN** tag `0.1.0` already exists with unknown or mismatched assets
- **WHEN** release publication is attempted
- **THEN** the process stops for review instead of replacing the tag or assets automatically

### Requirement: Installed release preserves accepted safety boundaries
Installing and enabling the packaged desktop release SHALL preserve the reviewed Soundings behavior: loading and manual discovery are non-mutating, candidates are unselected by default, conversion remains explicit and create-only, existing Markdown remains untouched, sources remain unchanged, and the runtime performs no network or telemetry activity.

#### Scenario: Disposable-vault release acceptance passes
- **GIVEN** the packaged release is installed in a disposable Obsidian desktop vault containing representative transcripts and collisions
- **WHEN** the plugin is enabled and the user opens a scan from the ribbon and command palette without selecting a candidate
- **THEN** both entry points show the same unselected review plan
- **AND** no vault file is created, modified, moved, renamed, deleted, or transmitted

#### Scenario: Explicit conversion remains create-only
- **GIVEN** the packaged release shows an eligible transcript and an existing destination collision
- **WHEN** the user selects only the eligible transcript and converts it
- **THEN** one new reviewed Markdown destination is created and verified
- **AND** every source and pre-existing Markdown file remains byte-for-byte unchanged

### Requirement: Community submission remains owner-controlled
Soundings SHALL provide a completed submission checklist and evidence record for `https://github.com/Kormiloio/Soundings`, but linking accounts, selecting listing ownership, accepting Obsidian's developer policies, and submitting the listing SHALL require an explicit action by the repository owner.

#### Scenario: Owner receives a complete submission handoff
- **GIVEN** repository checks, release verification, publication, and disposable-vault acceptance have passed
- **WHEN** release preparation is declared complete
- **THEN** the owner receives the repository URL, release version, verified asset list, platform declaration, and exact Community directory submission steps

#### Scenario: Owner has not approved directory submission
- **GIVEN** the GitHub release is ready but the owner has not completed the Community directory form
- **WHEN** automation finishes
- **THEN** Soundings remains publicly downloadable from GitHub
- **AND** no account connection, policy acceptance, ownership choice, or directory submission is performed on the owner's behalf
