# Tasks

## 1. Release contract hardening

- [x] 1.1 Remove the hard-coded current tag from package scripts and accept an explicit validated tag through the release command; verify release tests pass for matching versions and fail for missing, malformed, mismatched, historical, or existing tags
- [x] 1.2 Extend release fixtures to prove exact three-asset staging, single-build hash identity, immutable prior versions, and content-free failures; verify the fixture suite passes without contacting GitHub
- [x] 1.3 Add changelog and maintainer release-note guidance plus issue/bug-report templates; verify required support fields avoid requesting transcript bodies, note bodies, credentials, or private vault paths

## 2. Continuous integration

- [x] 2.1 Add a least-privilege CI workflow for production build, full tests, runtime audit, dependency audit, strict OpenSpec validation, and diff/release-contract checks; verify workflow syntax and local commands succeed from a clean checkout
- [x] 2.2 Pin runtime setup and action versions and use the committed dependency lockfile; verify dependency installation and byte-for-byte production build reproduction succeed in CI

## 3. Attested immutable release workflow

- [x] 3.1 Add an explicit semantic-tag release workflow with job-scoped `contents`, `id-token`, and `attestations` permissions; verify static workflow tests reject broader permissions and non-semantic tags
- [x] 3.2 Build once, stage and hash the three assets, attest those exact files, and upload the same bytes to a new GitHub release; verify a dry-run or fixture proves the attested subject hashes equal staged/upload hashes
- [x] 3.3 Add fail-closed checks for existing tags/releases and any failed gate; verify fixtures prove no replace/update release command executes on conflict or failure

## 4. Documentation and live verification

- [x] 4.1 Update README badges, `docs/RELEASING.md`, `docs/PRD.md`, `openspec/project.md`, and `docs/VERIFICATION.md`; verify the documented owner/tag boundary, least-privilege permissions, rollback, and Community publication boundary match the workflows
- [ ] 4.2 Run CI on a pull request and verify every required check passes without publishing a release or changing runtime assets
- [ ] 4.3 Use the workflow only for the next approved version after normal packaged desktop acceptance; verify the immutable release has exactly three matching assets, valid artifact attestations, unchanged prior releases, and a clean Community scorecard rescan
