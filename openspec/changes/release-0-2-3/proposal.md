# Proposal

## Why

The Obsidian Community listing still shows release `0.2.0`, with Health **Excellent** and Review **Satisfactory**. The 2026-10-01 scorecard for `0.2.0` reports one actionable finding:

- **`@typescript-eslint/no-unsafe-argument` at `src/core/settings.ts:101` and `:102`.** `Array.isArray()` narrows the read-only `enabledSections` array to `any[]`, so each `section` is `any` when it is passed to the typed `RESERVED_SECTION_SET.has()` and `sectionSet.add()`. The values are validated before use, so this is not a runtime defect. It is still the only finding that keeps Review below **Passed**, and it remains in `0.2.2` at the same lines.

Our gates never run the scanner's type-aware lint rules, so the warning passed three releases unnoticed.

The remaining scorecard items need no code:
- The missing artifact attestations are already fixed in `0.2.1` and `0.2.2`.
- Vault enumeration is expected and disclosed.
- "Malware scan not available" is a scanner disclosure.
- The hygiene note about a missing contributing guide does not affect the rating.

Packaged acceptance of `0.2.2` also left one check unverified: manual-enrichment companion publication did not produce a file on disk during the run. Before a fresh Community review, that path must be confirmed in the desktop app, or fixed.

## What Changes

- Make output-profile validation type-safe: iterate untrusted arrays as `unknown` and narrow each element with a type guard before typed use. Fix every other `no-unsafe-*` finding the lint gate reports in runtime source.
- Add a lint gate: pinned `eslint` and `typescript-eslint` dev dependencies with the type-checked recommended rules, plus Obsidian's published plugin lint rules where available. It runs as `npm run lint` in CI and the release build and must report **zero** warnings and errors on `src/`.
- Confirm companion-note publication in the desktop app. If it does not create the companion note, diagnose and fix it in this change, with a regression test. **Confirmed working on 2026-10-01; no fix needed.**
- Add a short `CONTRIBUTING.md` describing setup, the spec-first workflow, and the pull-request rules.
- Bump to `0.2.3`; update the changelog, PRD, `openspec/project.md`, and verification docs.
- After publication, the owner rescans the Community listing against `0.2.3`.

Non-goals:
- no new feature or output option (folded transcript callouts are planned separately as `0.3.0`)
- no new vault mutation, network access, or behavior change beyond any companion-publication fix
- no mobile support
- no change to published releases `0.1.0`–`0.2.2`

## User-data safety

No new mutation is introduced. The settings change only tightens static types around values that are already validated at runtime; accepted and rejected settings stay identical, and existing tests must pass unchanged. A companion-publication fix, if needed, stays create-only with source-evidence and destination revalidation. The lint tooling is development-only and never ships in `main.js`. The runtime audit still requires the bundle to load only `obsidian`.

## Capabilities

### Modified Capabilities

- `community-release`: CI and release gates include a zero-warning type-aware lint, and corrective releases clear actionable Community findings for the published listing.

## Impact

- **Code:** `src/core/settings.ts`, plus any other runtime file the lint gate flags.
- **Tooling:** `package.json` and `package-lock.json` (new pinned dev dependencies), an ESLint configuration file, `.github/workflows/ci.yml`, and `.github/workflows/release.yml`.
- **Docs and metadata:** `CONTRIBUTING.md`, `CHANGELOG.md`, `docs/`, `openspec/project.md`, and version metadata.
- **Possibly:** manual-enrichment files, if companion publication needs a fix.
