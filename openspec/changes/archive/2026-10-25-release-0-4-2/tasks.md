# Tasks

## 1. Release Boundary and Preflight

- [x] 1.1 Record the owner's 2026-10-25 authorization for local 0.4.2 versioning, staging, and final packaged custom-configuration acceptance; verify proposal/design explicitly exclude push, tag, publication, Community action, spec sync, and archival without later approval.
- [x] 1.2 Reconfirm `add-shared-text-kinds` is 18/18 complete with accepted desktop evidence, the worktree is still at 0.4.1 metadata, and `document-provider-compatibility` remains untouched; record the scoped preflight in verification docs.

## 2. Version and Release Notes

- [x] 2.1 Add a user-facing 0.4.2 changelog section covering explicit reviewed TXT kinds, schema-3 literal Source Text, neutral companion enrichment, safety guards, and narrow-window accessibility; verify it makes no unsupported AI, inference, mobile, or overwrite claim.
- [x] 2.2 Update `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` to exactly 0.4.2 while preserving minimum Obsidian 1.13.7 and every prior compatibility entry; verify metadata agreement with release-contract tests.
- [x] 2.3 Update PRD, project status, README release wording, and verification checkpoint from development candidate to 0.4.2 release candidate; verify historical checkpoints and unrelated provider planning remain intact.

## 3. Automated Gates and Staging

- [x] 3.1 Run clean dependency installation plus build, zero-warning lint, all tests, runtime audit, production dependency audit, and strict OpenSpec validation; record exact results and verify no runtime dependency was added.
- [x] 3.2 Run `npm run release:prepare -- --tag 0.4.2`; verify `release/0.4.2/` contains exactly `main.js`, `manifest.json`, and `styles.css`, the staged manifest matches root bytes, and record all SHA-256 hashes.
- [x] 3.3 Run release-contract tests and `git diff --check`; compare staged runtime JavaScript/styles with the accepted implementation build and verify the final diff excludes `document-provider-compatibility`.

## 4. Versioned Custom-Configuration Acceptance

- [x] 4.1 Prepare a fresh ignored synthetic vault with a non-default dot-prefixed Obsidian configuration directory, staged 0.4.2 assets only, one TXT source for each content kind, an existing-destination collision, and a configuration-directory sentinel; record initial protected hashes.
- [x] 4.2 With owner assistance in Obsidian desktop, verify Soundings loads as 0.4.2, the custom configuration directory is excluded, the initial plan is unselected, per-row kinds remain keyboard operable, and a reviewed mixed-kind selection creates only the expected notes.
- [x] 4.3 Verify generated Transcript/schema-2 and shared-text/schema-3 metadata and literal bodies on disk, read-back success, unchanged source/collision/sentinel hashes, no unexpected destination, and installed asset hashes equal staged hashes; preserve screenshots and record any caveat.

## 5. Local Release Readiness

- [x] 5.1 Record final local 0.4.2 package readiness, accepted asset hashes, custom-config evidence, and remaining external gates; verify no commit, push, pull request, merge, tag, GitHub release, Community action, spec sync, or archive is claimed.
- [x] 5.2 Obtain separate explicit owner approval before beginning any external publication or closure task below.

## 6. Publication and Closure (Separately Authorized)

- [x] 6.1 After approval, commit only the shared-text and 0.4.2 release scope, open a protected-main pull request, and verify required CI passes on the final candidate commit.
- [x] 6.2 After approval, merge through protected main, create the bare `0.4.2` tag, and verify the workflow publishes exactly three assets whose fresh-download hashes and attestations match the accepted candidate while all earlier releases remain unchanged.
- [x] 6.3 After approval, obtain and record the public Community listing's 0.4.2 review/version evidence; do not claim administrative state not visible in the supplied evidence.
- [x] 6.4 After approval, synchronize the shared-text delta into main specs, validate them strictly, archive completed changes, and verify no runtime or immutable release asset changes during closure.
