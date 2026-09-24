# Tasks

## 1. Characterize the follow-up findings

- [x] 1.1 Extend the Community source-contract detector with synthetic fixtures for the saved-settings `SoundingsSettings` assertion and `activeWindow.setTimeout`, and verify each uncorrected fixture reports its expected finding
- [x] 1.2 Add or refine settings-migration and cooperative-yield tests so saved exclusions, mandatory config-directory exclusions, cancellation, and yielding behavior are pinned before implementation

## 2. Remove the actionable source warnings

- [x] 2.1 Narrow the editable-exclusion helper input to the data it reads and remove the complete-settings assertion from saved-settings migration; verify prior-settings, invalid-settings, and renamed-config-directory tests pass
- [x] 2.2 Change adapter cooperative yielding to `window.setTimeout()` while keeping timer use outside the pure core; verify adapter, cancellation, integration, and 5,000-file responsiveness tests pass
- [x] 2.3 Extend the runtime source audit for both hosted-review patterns and verify the corrected runtime source contains neither warning pattern

## 3. Prepare the 0.1.2 candidate

- [x] 3.1 Advance package and manifest metadata to `0.1.2`, retain the `0.1.0` and `0.1.1` compatibility entries, add `0.1.2` → `1.13.7`, and verify plugin ID, minimum version, and `isDesktopOnly: true` remain unchanged
- [x] 3.2 Update release-readiness fixtures and version-driven staging for `0.1.2`; verify exact three-asset staging succeeds and inconsistent versions, tags, assets, or historical compatibility entries fail closed
- [x] 3.3 Update `docs/PRD.md`, `openspec/project.md`, release guidance, and verification records with the completed `0.1.1` review, the two follow-up warnings, non-blocking recommendations, unchanged safety scope, and the pending `0.1.2` gate; verify documentation agrees with the proposal and specs

## 4. Automated and packaged desktop acceptance

- [x] 4.1 Run the production build, full unit/integration/golden suite, 5,000-file rehearsal, runtime source audit, production dependency audit, release-readiness checks, strict OpenSpec validation, and `git diff --check`; record all results and zero source mutations
- [x] 4.2 Record the exact staged `0.1.2` asset inventory and SHA-256 hashes, and verify the directory contains only `main.js`, `manifest.json`, and `styles.css`
- [x] 4.3 Install only staged `0.1.2` assets in a disposable Obsidian 1.13.7+ desktop vault with a renamed configuration directory and saved `0.1.1` settings; verify identity, desktop-only metadata, settings migration/search, all six controls, safety text, and active-config exclusion copy
- [x] 4.4 Verify ribbon and command entry points show the same unselected plan, configuration files are not offered, close/cancel are non-mutating, collisions remain blocked, one selected transcript is created and read back, and every source and pre-existing note hash remains unchanged
- [x] 4.5 Record Obsidian/OS details, saved-settings migration, source and destination hashes, and all packaged acceptance outcomes in `docs/VERIFICATION.md`

## 5. Immutable release and owner-controlled rescan

- [x] 5.1 Commit and push the accepted candidate to `main`; verify the worktree is clean, local `main` matches `origin/main`, and public default-branch metadata declares `0.1.2`
- [x] 5.2 Confirm tag and GitHub release `0.1.2` do not exist and freshly verify the exact asset inventories and hashes for immutable releases `0.1.0` and `0.1.1`; stop for review on any conflict or historical mismatch
- [x] 5.3 Create immutable GitHub release `0.1.2` with exactly `main.js`, `manifest.json`, and `styles.css`, then verify remote hashes match the accepted staging directory and both prior releases remain unchanged
- [x] 5.4 Guide the owner to request a completed Community review of `0.1.2`; record releases, network, behavior, source, dependencies, obfuscation, and build-verification results, and leave the listing unpublished if any actionable finding remains
- [ ] 5.5 After a clean review, hand off the final Community **Publish** action to the owner and record the public-directory confirmation without performing account, policy, ownership, reviewer-response, or publication actions on the owner's behalf
