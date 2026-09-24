# Design

## Context

See `proposal.md` for motivation. Soundings already has an accepted desktop runtime, a production esbuild bundle, a root `manifest.json`, a `versions.json` entry for `0.1.0`, and a public GitHub repository. The repository intentionally ignores generated `main.js`, has no license or published release, and its README is developer-oriented rather than a complete Community listing document. One settings screen uses a raw `<h2>` that conflicts with current Obsidian review guidance.

Release work crosses repository metadata, UI cleanup, build tooling, tests, documentation, GitHub state, and manual desktop acceptance. It must not alter the converter's vault mutation boundary or introduce release behavior into the plugin runtime.

## Goals / Non-Goals

**Goals:**

- Make `0.1.0` reproducibly buildable and independently verifiable before any tag or release is created.
- Produce only the three files Obsidian installs and prove they correspond to committed metadata.
- Present accurate end-user documentation and MIT licensing at the default branch HEAD.
- Resolve the known settings-heading review issue without changing settings values or behavior.
- Capture enough evidence for a short, owner-controlled Community directory submission.

**Non-Goals:**

- Automating Obsidian account authorization, policy acceptance, listing ownership, or the final submission click.
- Adding GitHub release access, update checks, networking, telemetry, or self-installation to plugin runtime code.
- Expanding beyond Obsidian desktop 1.13.7+, changing conversion output, or evaluating mobile platforms.
- Rewriting or moving Git history, replacing an existing tag, or overwriting a pre-existing release.

## Decisions

### Use a local fail-closed release verifier and staging directory

A repository script will validate `package.json`, `manifest.json`, and `versions.json`, run against the production output, and recreate a gitignored release staging directory containing only `main.js`, `manifest.json`, and `styles.css`. It will reject extra or missing staged assets and report paths and metadata only.

This keeps the release reproducible without adding a production dependency or requiring GitHub credentials for verification. A manual collection of files was rejected because it is easy to attach stale or mismatched metadata. Committing `main.js` was rejected because Obsidian guidance recommends keeping generated bundles in releases rather than source control.

### Keep GitHub publication explicit and non-destructive

After local verification and acceptance, publication will create tag and release `0.1.0` only if neither exists remotely, upload the three verified assets, and compare published asset digests with the staging directory. Existing tag or release state will stop the workflow for inspection; it will not be deleted, moved, or replaced automatically.

Automating a force-update path was rejected because release immutability and reviewer confidence are more important than convenience.

### Treat repository and runtime checks as separate gates

Repository readiness tests will cover required files, manifest constraints, README disclosures, ignored build output, and version agreement. Existing unit/integration, scale, and runtime-audit gates will continue to cover behavior and forbidden APIs. A disposable-vault run will install from the staged release assets—not from an arbitrary development folder—so it validates what users will download.

Relying only on unit tests was rejected because attachment composition and real Obsidian loading are distribution concerns that unit tests cannot prove.

### Remove the single settings heading instead of renaming it

The settings page has only one logical section, so the raw `Soundings settings` heading will be removed while the explanatory privacy/safety paragraph remains. This follows current Obsidian guidance with less UI complexity than introducing artificial sections. All controls, accessibility attributes, validation, and persisted values remain unchanged.

### Use MIT with Kormilo ownership and explicit local-only disclosure

The root `LICENSE` will contain the standard MIT text with a 2026 Kormilo copyright notice. The README will explicitly state that the foundation plugin needs no account, payment, credentials, network service, or telemetry and accesses only the active vault through Obsidian APIs.

Apache-2.0 was considered but rejected because the owner selected MIT and the plugin has no stated patent-license requirement. A custom license was rejected because it would complicate review and reuse.

### Preserve desktop-only scope

`isDesktopOnly: true` and `minAppVersion: 1.13.7` remain fixed for `0.1.0`. Even though the runtime avoids Node filesystem APIs, mobile acceptance was deliberately deferred and release metadata must reflect the tested platform rather than theoretical compatibility.

## Risks / Trade-offs

- **[Obsidian policies change after preparation]** → Recheck the official submission requirements immediately before publishing and record the review date.
- **[Generated bundle differs after verification]** → Stage assets only after a production build and compare hashes before and after GitHub upload.
- **[The `soundings` identifier becomes occupied before submission]** → Recheck directory uniqueness immediately before publication; stop for an approved rename rather than silently changing the ID.
- **[A partial external release is created]** → Verify tag absence first, upload all assets in one release operation where possible, and inspect the published asset inventory before declaring completion.
- **[README overstates compatibility or behavior]** → Derive statements from accepted PRD/spec behavior and keep mobile, AI, automatic conversion, and source updates explicitly out of scope.
- **[Directory review requests code changes]** → Create a follow-up OpenSpec change and increment the patch version; do not mutate the published `0.1.0` tag.

## Migration Plan

1. Add licensing, user documentation, settings cleanup, release validation, and tests without changing the manifest version.
2. Run strict OpenSpec validation, production build, all automated tests, the runtime audit, release staging verification, and diff checks.
3. Install the staged assets into a disposable vault and repeat the named non-mutating and create-only acceptance checks.
4. Commit and push the verified release candidate to `main`.
5. Confirm the `soundings` identifier remains available and the public default-branch metadata is correct.
6. Create immutable tag and GitHub release `0.1.0`, upload the three verified assets, and verify the remote inventory and hashes.
7. Hand off the final Community directory form to the owner for account linking, ownership selection, policy acceptance, and submission.

Rollback before publication is a normal code revert. After publication, leave `0.1.0` immutable; correct review findings in a new patch release and update the default-branch manifest and compatibility map accordingly.
