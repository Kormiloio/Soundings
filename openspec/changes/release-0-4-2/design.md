# Design

## Context

See `proposal.md` for motivation. `add-shared-text-kinds` is complete with 18/18 tasks, 619 passing tests, strict validation, runtime/dependency audits, and owner-assisted acceptance in `test-vault/shared-text-042/`. Runtime metadata remains 0.4.1, the accepted development assets are not a versioned package, and the unrelated `document-provider-compatibility` change is untracked and must remain outside this release.

The existing release tooling validates matching package/manifest/tag versions, the compatibility map, minimum Obsidian version, staging location, symlink safety, and the exact three-file inventory. Published releases are immutable and the release workflow is tag-driven, least-privilege, and attested.

## Goals / Non-Goals

**Goals:**
- produce one reproducible 0.4.2 candidate from the accepted working tree
- make version metadata, release notes, project status, and verification evidence agree
- install the staged bytes in a fresh disposable vault with a non-default configuration directory
- verify the packaged candidate preserves shared-text behavior and create-only/local-only boundaries
- stop at a recorded release-ready checkpoint until the owner separately authorizes external mutations

**Non-Goals:**
- alter conversion, enrichment, discovery, parsing, rendering, or settings behavior
- introduce a runtime or development dependency
- test mobile platforms; 0.4.2 remains desktop-only with minimum Obsidian 1.13.7
- publish, tag, push, change the Community listing, synchronize main specs, or archive either change during preparation

## Decisions

1. **Version only after accepted implementation evidence.** Update `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` together to 0.4.2, preserving all earlier compatibility entries and `minAppVersion: 1.13.7`. This keeps release metadata atomic. The rejected alternative is staging with the 0.4.1 manifest, which could not be accepted as the package Obsidian would install for 0.4.2.

2. **Use the existing guarded staging command.** Run `npm run release:prepare -- --tag 0.4.2` and accept only `release/0.4.2/{main.js,manifest.json,styles.css}`. Record SHA-256 hashes and verify the staged manifest is byte-identical to the root manifest. The rejected alternative is manually assembling assets, which bypasses version, path, symlink, and inventory checks.

3. **Keep implementation and release acceptance distinct.** The existing `shared-text-042` vault remains implementation evidence. Final package acceptance uses a new ignored vault and installs only staged assets under a non-default dot-prefixed configuration folder. This proves the staged package, config-directory exclusion, and saved settings rather than another development copy.

4. **Use a narrow, synthetic release smoke matrix.** The package vault contains one source for each reviewed kind, an existing destination collision, and a sentinel inside the configured Obsidian directory. Acceptance verifies plugin/version display, unselected review, kind menus, one mixed-kind conversion, literal schema-3 output, legacy Transcript compatibility, source/collision/sentinel hashes, and no unexpected destinations. The broad adversarial and lifecycle matrix is not repeated because it already passed against the same runtime implementation; its automated and desktop evidence remains part of the release record.

5. **Separate preparation from external state.** Completion of local candidate acceptance means release-ready, not published. Pull request creation, push/merge, bare tag, GitHub release, downloaded-asset/provenance checks, Community review, main-spec synchronization, and archival stay unchecked until explicitly authorized and observed. The rejected alternative is treating “prepare 0.4.2” as blanket permission for irreversible external actions.

6. **Preserve unrelated work by scope, not cleanup.** Do not edit, delete, stage, or otherwise normalize `openspec/changes/document-provider-compatibility/`. Release diffs and eventual commits must include only shared-text and 0.4.2 release files. Existing user changes are never reverted.

## Risks / Trade-offs

- **[Version metadata changes before publication]** → A failed package check leaves an ordinary uncommitted candidate; fix or revert only release-owned edits deliberately, then rebuild and repeat acceptance. No tag or published asset exists yet.
- **[Development and staged bytes diverge]** → Hash root and staged assets, install only staged assets, and verify the root/staged manifest identity before acceptance.
- **[Custom-folder setup accidentally scans its own plugin files]** → Put a unique sentinel below the configured Obsidian directory and require zero review matches or destination for it.
- **[Manual acceptance misses a regression]** → Keep the full 619-test gate, runtime audit, dependency audit, strict OpenSpec validation, release contracts, fixed 0.4.1 Transcript baselines, and the earlier full desktop matrix as prerequisites.
- **[Release scope absorbs unrelated planning]** → Record status before and after, leave the provider change unmodified, and inspect the final diff before any future commit.

## Migration Plan

There is no vault or settings migration. Release preparation updates repository metadata, rebuilds, and stages a new semantic version. Rollback before publication is a normal reviewed revert of release-owned metadata and staging; published 0.4.1 and all earlier releases remain untouched. After publication, any defect requires a new patch release rather than moving or replacing 0.4.2.
