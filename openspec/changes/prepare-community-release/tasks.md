# Tasks

## 1. Public repository readiness

- [ ] 1.1 Add the standard MIT `LICENSE` with a 2026 Kormilo copyright notice and verify GitHub recognizes the repository license
- [x] 1.2 Rewrite the root README for end users with purpose, desktop requirements, Community/manual installation, first-use instructions, safety and privacy disclosures, limitations, support, development, and licensing; verify every required disclosure is present
- [x] 1.3 Add release and Community-submission documentation with the exact `0.1.0` asset, tag, ownership, policy, and rollback procedure; verify the instructions match current official Obsidian documentation
- [x] 1.4 Update `docs/PRD.md` and `openspec/project.md` to reflect release readiness scope and acceptance gates, then verify desktop-only and local/create-only boundaries remain explicit

## 2. Obsidian review cleanup

- [x] 2.1 Remove the redundant raw settings-page heading while preserving the safety explanation and every setting control; verify settings behavior and accessibility tests pass
- [x] 2.2 Extend UI contract coverage to reject raw settings headings and confirm the existing controls, alert semantics, ribbon control, and command remain intact

## 3. Reproducible release tooling

- [x] 3.1 Add a fail-closed release preparation script that validates package, manifest, and compatibility versions and stages exactly `main.js`, `manifest.json`, and `styles.css`; verify a valid `0.1.0` build produces the expected clean inventory
- [x] 3.2 Add automated release-readiness tests for required repository files, manifest constraints, README disclosures, ignored generated output, exact staged assets, and version agreement; verify missing or inconsistent metadata fails with content-free actionable errors
- [x] 3.3 Add package scripts and gitignore coverage for release staging, then verify production runtime assets remain untracked while the verifier is repeatable from a clean checkout

## 4. Automated release-candidate verification

- [x] 4.1 Run the production build, complete automated suite, 5,000-file rehearsal, runtime security audit, release readiness checks, and `git diff --check`; record that all gates pass with zero source mutations
- [x] 4.2 Run strict OpenSpec change validation and reconcile proposal, design, specs, tasks, PRD, and project context with the implemented release workflow

## 5. Packaged desktop acceptance

- [x] 5.1 Install only the staged `0.1.0` assets into a disposable Obsidian desktop vault and verify plugin identity, minimum version, desktop-only declaration, settings screen, ribbon label, and command-palette entry
- [x] 5.2 Verify both scan entry points show the same unselected plan and closing without conversion leaves all disposable-vault hashes and paths unchanged
- [x] 5.3 Convert one eligible synthetic transcript beside an existing collision and verify one reviewed destination is created while every source and pre-existing Markdown file remains byte-for-byte unchanged
- [x] 5.4 Record packaged-build hashes, Obsidian/OS target details, acceptance outcomes, and the official-policy review date in the verification documentation

## 6. Immutable GitHub release

- [ ] 6.1 Commit and push the verified release candidate to `main`, then verify the worktree is clean and local `main` matches `origin/main`
- [ ] 6.2 Recheck that plugin ID `soundings` is available, the public default-branch metadata is correct, and neither tag nor release `0.1.0` already exists; stop for review on any conflict
- [ ] 6.3 Create exact tag and GitHub release `0.1.0` with `main.js`, `manifest.json`, and `styles.css` as individual assets, then verify remote asset names and hashes match the accepted staging directory

## 7. Owner-controlled Community submission

- [ ] 7.1 Provide the owner with the verified repository URL, release evidence, desktop declaration, and exact `community.obsidian.md` submission steps; verify no account or policy action was automated
- [ ] 7.2 Guide the owner through GitHub account linking, listing ownership selection, developer-policy acceptance, and submission, then record the directory confirmation or actionable automated-review feedback
