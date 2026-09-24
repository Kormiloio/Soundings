# Release and Community submission

This document is the maintainer checklist for the corrective Soundings 0.1.2 patch. The release is desktop-only and requires Obsidian 1.13.7 or later. Published releases `0.1.0` and `0.1.1` remain immutable.

Official references reviewed on 2026-09-23:

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Submission requirements for plugins](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)

Recheck these pages immediately before publishing because directory requirements can change.

## Release candidate

1. Confirm `package.json` and `manifest.json` both declare `0.1.2`.
2. Confirm `versions.json` maps `0.1.0`, `0.1.1`, and `0.1.2` to minimum Obsidian version `1.13.7`.
3. Run:

   ```bash
   npm ci
   npm run check
   npm run audit:runtime
   npm run release:prepare
   openspec validate clear-community-review-followups --strict
   git diff --check
   ```

4. Confirm `release/0.1.2/` contains exactly:

   - `main.js`
   - `manifest.json`
   - `styles.css`

5. Install those staged files—not files copied from another directory—into a disposable Obsidian desktop vault whose configured Obsidian directory is not `.obsidian`, and complete the acceptance checks in `docs/VERIFICATION.md`.
6. Commit and push the accepted release candidate to `main`. Confirm local `main` matches `origin/main` and the worktree is clean.

## Pre-publication checks

Before creating external state, confirm all of the following:

- `https://github.com/Kormiloio/Soundings` is public and its default branch is `main`.
- GitHub recognizes the root `LICENSE` as MIT.
- The existing Community draft still resolves repository `Kormiloio/Soundings` and plugin ID `soundings`.
- Git tag `0.1.2` does not exist locally or remotely.
- GitHub release `0.1.2` does not exist.
- Published releases `0.1.0` and `0.1.1` still expose their original three assets with the recorded hashes.

Stop for review if any tag, release, or plugin-ID conflict exists. Never move or replace an existing release tag automatically.

## Publish GitHub release 0.1.2

Create an immutable release whose tag is exactly `0.1.2` without a `v` prefix. Attach these three files from `release/0.1.2/` as individual assets:

- `main.js`
- `manifest.json`
- `styles.css`

After publication, verify the public release exposes exactly those assets and compare their SHA-256 hashes with the accepted staging directory. Recheck that `0.1.0` and `0.1.1` are unchanged. If another correction is needed, increment the patch version and publish a new release; do not rewrite any published tag.

## Submit to the Obsidian Community directory

The repository owner performs these account and policy actions:

1. Sign in at [community.obsidian.md](https://community.obsidian.md) with an Obsidian account.
2. Connect the GitHub account that can verify access to `Kormiloio/Soundings`.
3. Open the existing Soundings draft and refresh or rescan it against release `0.1.2`.
4. Confirm dependency and obfuscation checks pass and no actionable source warning remains.
5. Leave the draft unpublished and record the result if any actionable finding remains.
6. Only after a clean review, explicitly select **Publish**.

Account linking, ownership selection, policy acceptance, reviewer responses, and final publication are never automated by the Soundings repository tooling.

## Review feedback and rollback

Before the `0.1.2` GitHub release exists, rollback is a normal code revert followed by rebuilding and repeating acceptance. After publication, leave `0.1.0`, `0.1.1`, and `0.1.2` immutable. Address any later finding in a new OpenSpec change, increment the patch version, update `versions.json`, repeat every gate, and publish a new matching release.
