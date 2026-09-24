# Release and Community submission

This document is the maintainer checklist for Soundings 0.1.0. The release is desktop-only and requires Obsidian 1.13.7 or later.

Official references reviewed on 2026-09-23:

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Submission requirements for plugins](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)

Recheck these pages immediately before publishing because directory requirements can change.

## Release candidate

1. Confirm `package.json` and `manifest.json` both declare `0.1.0`.
2. Confirm `versions.json` maps `0.1.0` to minimum Obsidian version `1.13.7`.
3. Run:

   ```bash
   npm ci
   npm run check
   npm run audit:runtime
   npm run release:prepare
   openspec validate prepare-community-release --strict
   git diff --check
   ```

4. Confirm `release/0.1.0/` contains exactly:

   - `main.js`
   - `manifest.json`
   - `styles.css`

5. Install those staged files—not files copied from another directory—into a disposable Obsidian desktop vault and complete the acceptance checks in `docs/VERIFICATION.md`.
6. Commit and push the accepted release candidate to `main`. Confirm local `main` matches `origin/main` and the worktree is clean.

## Pre-publication checks

Before creating external state, confirm all of the following:

- `https://github.com/Kormiloio/Soundings` is public and its default branch is `main`.
- GitHub recognizes the root `LICENSE` as MIT.
- Plugin ID `soundings` is not already present in the Obsidian Community directory.
- Git tag `0.1.0` does not exist locally or remotely.
- GitHub release `0.1.0` does not exist.

Stop for review if any tag, release, or plugin-ID conflict exists. Never move or replace an existing release tag automatically.

## Publish GitHub release 0.1.0

Create an immutable release whose tag is exactly `0.1.0` without a `v` prefix. Attach these three files from `release/0.1.0/` as individual assets:

- `main.js`
- `manifest.json`
- `styles.css`

After publication, verify the public release exposes exactly those assets and compare their SHA-256 hashes with the accepted staging directory. If a correction is needed after publication, increment the patch version and publish a new release; do not rewrite `0.1.0`.

## Submit to the Obsidian Community directory

The repository owner performs these account and policy actions:

1. Sign in at [community.obsidian.md](https://community.obsidian.md) with an Obsidian account.
2. Connect the GitHub account that can verify access to `Kormiloio/Soundings`.
3. Open **Plugins → New plugin**.
4. Enter `https://github.com/Kormiloio/Soundings`.
5. Choose the intended listing owner. This can be the individual maintainer or an Obsidian Community organization the maintainer belongs to.
6. Review and accept Obsidian's developer policies and maintenance commitment.
7. Submit the plugin and review the automated scan results.

Account linking, ownership selection, policy acceptance, and the final submission are never automated by the Soundings repository tooling.

## Review feedback and rollback

Before the GitHub release exists, rollback is a normal code revert followed by rebuilding and repeating acceptance. After `0.1.0` is public, leave it immutable. Address any Obsidian review finding in a new OpenSpec change, increment the version (for example, `0.1.1`), update `versions.json`, repeat every gate, and publish a new matching release.
