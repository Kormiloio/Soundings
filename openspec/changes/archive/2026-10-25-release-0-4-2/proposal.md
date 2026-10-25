# Proposal

## Why

The completed `add-shared-text-kinds` implementation has passed automated verification and owner-assisted desktop acceptance, but it still carries 0.4.1 metadata and has not been staged as an installable 0.4.2 package. A separately controlled release change is needed to version, stage, and accept the exact package without treating preparation as authorization to publish.

## What Changes

- Update package, manifest, compatibility-map, changelog, PRD/project, and verification metadata for 0.4.2.
- Re-run the full build, lint, test, runtime-audit, dependency-audit, OpenSpec, release-contract, and whitespace gates.
- Stage exactly `main.js`, `manifest.json`, and `styles.css` under `release/0.4.2/` and record their SHA-256 hashes.
- Install only those staged assets in a disposable Obsidian vault using a non-default dot-prefixed configuration directory, then verify loading, exclusion of that directory, reviewed mixed-kind conversion, create-only collision handling, literal output, and protected hashes.
- Record candidate readiness and keep pull request, merge, tag, GitHub release, provenance verification, Community review, spec synchronization, and archival behind later explicit owner approvals.

Non-goals:
- no new content kind, parser, rendering behavior, setting, command, dependency, network access, or vault mutation
- no modification of published 0.4.1 or any earlier release, tag, asset, or evidence
- no work-vault installation and no use of personal or work content for acceptance
- no publication, Community action, main-spec synchronization, or OpenSpec archival under release-preparation authorization alone
- no change to the unrelated `document-provider-compatibility` planning work

User-data safety boundaries:
- Release preparation writes only versioned repository metadata and the guarded local `release/0.4.2/` staging directory.
- Desktop acceptance uses synthetic files in a disposable vault. Soundings remains reviewed, local-only, and create-only; source files and pre-existing destinations must remain byte-for-byte unchanged.
- Any staging mismatch, existing destination, changed source, failed read-back, or package inconsistency fails closed and blocks readiness rather than replacing content.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change applies the existing `community-release` requirements to version 0.4.2 without changing product or release behavior, so `.openspec.yaml` declares `skip_specs: true`.

## Impact

- **Metadata/docs:** `package.json`, `package-lock.json`, `manifest.json`, `versions.json`, `CHANGELOG.md`, `docs/PRD.md`, `docs/VERIFICATION.md`, and `openspec/project.md`.
- **Local staging:** ignored `release/0.4.2/` containing exactly three installable assets.
- **Acceptance:** a new ignored disposable custom-configuration vault and evidence directory.
- **External state:** none during preparation. A pull request, tag, GitHub release, attestations, Community review, and archive require later explicit authorization.
