# Spec Delta

## ADDED Requirements

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
