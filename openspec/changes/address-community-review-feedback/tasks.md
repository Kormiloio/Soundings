# Tasks

## 1. Characterization and review guardrails

- [x] 1.1 Add source-contract tests that reproduce every actionable Community warning (`globalThis`, flagged regular expressions, hardcoded `.obsidian`, missing declarative settings definitions, and deprecated `setWarning`) and verify the unmodified warning fixtures fail for the expected reason
- [x] 1.2 Add characterization vectors for current destination normalization and Markdown heading escaping, including control codes, brackets, backslashes, punctuation runs, Unicode, whitespace, and unusable basenames; verify the tests pin existing output and collision paths
- [x] 1.3 Extend settings and discovery tests for a renamed Obsidian configuration directory, mandatory Soundings state, user exclusions, invalid host configuration, and saved `0.1.0` preferences; verify no excluded candidate content is read and invalid policy prevents discovery

## 2. Host capability and normalization cleanup

- [x] 2.1 Refactor secure hashing to accept an injected digest capability and wire discovery and execution to an `activeWindow.crypto` hasher; verify hash, discovery, stale-source, and failure-isolation tests pass without `globalThis`
- [x] 2.2 Inject the `activeWindow.crypto` plan-ID factory at the Obsidian entry point and use `activeWindow.setTimeout` for adapter yielding; verify deterministic planning tests and the 5,000-file cancellation/yield checks pass
- [x] 2.3 Replace the control-character destination regex with an explicit character transform and verify every characterization, safe-name, collision, and integration test remains byte-for-byte equivalent
- [x] 2.4 Replace the flagged Markdown-heading regex with explicit character escaping and verify golden Markdown output plus adversarial heading tests remain unchanged

## 3. Configurable vault safety policy

- [x] 3.1 Refactor settings validation to combine host-provided mandatory exclusions with user preferences while keeping mandatory paths in runtime fingerprints and out of editable values; verify de-duplication, persistence, and invalid-path tests pass
- [x] 3.2 Resolve and normalize `Vault.configDir` during plugin setup and every settings save, refusing scans with a content-free notice when safe policy cannot be formed; verify a renamed configuration directory is excluded without relying on `.obsidian`
- [x] 3.3 Update discovery/integration fixtures to prove supported-looking files under the configured directory, hidden folders, Soundings state, and user exclusions are never read or offered while unrelated nested transcripts remain discoverable

## 4. Declarative Obsidian UI cleanup

- [x] 4.1 Replace the imperative settings `display()` implementation with declarative definitions for the safety explanation and all six existing settings controls; verify every control is indexed for settings search and the raw heading does not return
- [x] 4.2 Implement declarative control read/write adaptation and inline validation through the existing validated persistence path; verify toggles, textarea, number, project root, saved-value migration, and textual accessibility errors work in UI contract tests
- [x] 4.3 Update configuration-folder settings copy to name the active `Vault.configDir` without exposing mandatory exclusions as editable; verify no runtime or settings text assumes the folder is named `.obsidian`
- [x] 4.4 Replace the progress cancel button's deprecated warning style with `setDestructive()` and verify cancellation remains keyboard-accessible, non-primary, and non-mutating

## 5. Patch metadata, tooling, and documentation

- [x] 5.1 Advance package and manifest metadata to `0.1.1`, retain the `0.1.0` compatibility entry, add `0.1.1` → `1.13.7`, and verify plugin ID, minimum version, and `isDesktopOnly: true` remain unchanged
- [x] 5.2 Generalize release preparation and release-readiness fixtures to use the validated manifest/tag version instead of hardcoded `0.1.0`; verify exact `0.1.1` staging succeeds and version, minimum, tag, asset, or disclosure mismatch fails closed
- [x] 5.3 Update README privacy text to disclose whole-vault path enumeration and candidate-only content reads, then update release/installation guidance for `0.1.1`; verify required public disclosures and manual install steps pass readiness checks
- [x] 5.4 Update `docs/PRD.md`, `openspec/project.md`, runtime-audit coverage, and verification documentation for configurable config directories, declarative settings, unchanged safety boundaries, desktop-only scope, and the pending patch gate; verify the documents agree with the specs and implementation

## 6. Automated and packaged desktop acceptance

- [x] 6.1 Run the production build, full unit/integration/golden suite, 5,000-file rehearsal, runtime source audit, production dependency audit, release-readiness checks, strict OpenSpec validation, and `git diff --check`; record that all gates pass with zero source mutations and no actionable scanner-pattern matches
- [x] 6.2 Install only staged `0.1.1` assets into a disposable Obsidian 1.13.7+ desktop vault whose configuration directory is not `.obsidian`; verify plugin identity, desktop-only metadata, settings search, all six controls, safety explanation, and exclusion copy
- [x] 6.3 In that disposable vault, verify ribbon and command entry points produce the same unselected plan, the renamed config directory is not read or offered, cancellation/close are non-mutating, collisions remain blocked, one selected transcript is created and read back, and every source and pre-existing note hash remains unchanged
- [x] 6.4 Record packaged asset hashes, Obsidian/OS details, saved-settings migration result, custom-config exclusion evidence, normalization equivalence, and all acceptance outcomes in `docs/VERIFICATION.md`

## 7. Immutable release and owner-controlled rescan

- [x] 7.1 Commit and push the accepted candidate to `main`; verify the worktree is clean, local `main` matches `origin/main`, and public default-branch metadata declares `0.1.1`
- [x] 7.2 Confirm tag and GitHub release `0.1.1` do not exist and re-verify `0.1.0` asset names and hashes; stop for review on any conflict or historical mismatch
- [x] 7.3 Create immutable GitHub release `0.1.1` with exactly `main.js`, `manifest.json`, and `styles.css`, then verify remote hashes match the accepted staging directory and `0.1.0` remains unchanged
- [ ] 7.4 Guide the owner to refresh or rescan the existing Community draft against `0.1.1`; record dependency, obfuscation, behavior, and source-review results, and leave the listing unpublished if any actionable finding remains
- [ ] 7.5 After a clean automated review, hand off the final Community **Publish** action to the owner and record the resulting public-directory confirmation without performing account, policy, ownership, reviewer-response, or publication actions on the owner's behalf
