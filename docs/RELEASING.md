# Release and Community submission

This document is the maintainer checklist for Soundings releases. Set `<version>` to the approved semantic version for the release candidate. Releases are desktop-only and require Obsidian 1.13.7 or later. Published releases remain immutable.

Official references reviewed on 2026-09-23:

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Submission requirements for plugins](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)

Recheck these pages immediately before publishing because directory requirements can change.

## Release candidate

1. Confirm `package.json` and `manifest.json` both declare `<version>`.
2. Confirm `versions.json` maps `<version>` and every previously published version to minimum Obsidian version `1.13.7`.
3. Run:

   ```bash
   npm ci
   npm run check          # build, zero-warning type-aware lint (Obsidian rules), tests
   npm run audit:runtime
   npm run spec:validate
   npm run release:prepare -- --tag <version>
   git diff --check
   ```

   Staging writes only to `release/<version>/` inside the repository and replaces that folder. It refuses any other `--output` and refuses a symbolic-link `release/` or version folder. Never stage a version that is already published: that overwrites the local copy of the accepted assets. The published assets are immutable, and a byte-identical copy can be rebuilt from the release tag.

   Repository rulesets enforce this process, as of 2026-10-01:
   - **`Protect main`:** changes reach `main` only through a pull request whose `Build, Audit & Test` check passes on an up-to-date branch. No approval is required, so the solo maintainer can merge. Deletion and force-push are blocked, and there is no bypass.
   - **`Protect release tags`:** only repository admins may create tags, and no tag may be moved, deleted, or force-pushed.

4. Confirm `release/<version>/` contains exactly:

   - `main.js`
   - `manifest.json`
   - `styles.css`

5. Install those staged files—not files copied from another directory—into a disposable Obsidian desktop vault whose configured Obsidian directory is not `.obsidian`, and complete the acceptance checks in `docs/VERIFICATION.md`.
6. Commit and push the accepted release candidate to `main`. Confirm local `main` matches `origin/main` and the worktree is clean.

## Automated CI & Attested Release Workflow

Releases are now driven and attested through GitHub Actions:

1. **Continuous Integration (`.github/workflows/ci.yml`)**:
   Runs on every pull request and push to `main` with read-only permissions (`contents: read`). Executes the full test suite, production build, runtime audit, dependency audit, OpenSpec strict validation, and diff checks.

2. **Automated Attestation & Release (`.github/workflows/release.yml`)**:
   Triggers only when a bare version tag (for example `0.2.1`) is pushed. Never use a `v` prefix: Obsidian downloads assets from the release whose tag exactly equals the manifest version, so release `v0.1.3` was not installable through Obsidian.
   - The **build** job has read-only permissions and no persisted credentials. It verifies the tag commit is on `main`, runs every gate, stages exactly `main.js`, `manifest.json`, and `styles.css`, extracts the `## <version>` section of `CHANGELOG.md` as release notes (failing if it is missing), and uploads one bundle.
   - The **publish** job alone holds `contents: write`, `id-token: write`, and `attestations: write`. It installs nothing, refuses an existing release, attests the three bundle assets, and creates the release from those exact bytes.
   - Actions are pinned to full commit SHAs; update pins deliberately and record the version in the trailing comment.

## Manual Pre-publication checks

Before tagging or creating external state, confirm:
- `https://github.com/Kormiloio/Soundings` default branch is `main`.
- `package.json`, `manifest.json`, and `versions.json` versions agree.
- All gates pass locally via `npm test && npm run audit:runtime && npm run release:prepare -- --tag <version>`.
- Disposable-vault manual verification is recorded in `docs/VERIFICATION.md`.

## Submit to the Obsidian Community directory

The repository owner performs these account and policy actions:

1. Sign in at [community.obsidian.md](https://community.obsidian.md) with an Obsidian account.
2. Connect the GitHub account that can verify access to `Kormiloio/Soundings`.
3. Open the existing Soundings draft and refresh or rescan it against release `<version>`.
4. Confirm dependency and obfuscation checks pass and no actionable source warning remains.
5. Leave the draft unpublished and record the result if any actionable finding remains.
6. Only after a clean review, explicitly select **Publish**.

Account linking, ownership selection, policy acceptance, reviewer responses, and final publication are never automated by the Soundings repository tooling.

## Review feedback and rollback

Before the `<version>` GitHub release exists, rollback is a normal code revert followed by rebuilding and repeating acceptance. After publication, leave that release and every prior release immutable. Address any later finding in a new OpenSpec change, increment the patch version, update `versions.json`, repeat every gate, and publish a new matching release.
