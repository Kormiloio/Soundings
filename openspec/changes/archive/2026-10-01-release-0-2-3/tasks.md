# Tasks

## 0. Changeset approval
- [x] 0.1 Record the 2026-10-01 Community scorecard findings for `0.2.0` and the open `0.2.2` companion-publication caveat in `proposal.md`
- [x] 0.2 Draft design, spec delta, and tasks; pass `openspec validate release-0-2-3 --strict`
- [x] 0.3 Owner approves the changeset scope before implementation begins (approved 2026-10-01)

## 1. Companion-publication verification (`0.2.2` caveat)
- [x] 1.1 In the `0.2.2` acceptance vault, publish a companion for `Enrichment/Weekly sync.md` and confirm the file and its bytes on disk
- [x] 1.2 If it fails: reproduce it in an automated test, fix it within create-only revalidation, and amend the design and the `manual-enrichment` spec delta. If it passes: record the result. **Passed 2026-10-01:** the companion note was created with correct content and the source note was unchanged. No code change was needed, and the result is recorded in `docs/VERIFICATION.md`

## 2. Lint gate
- [x] 2.1 Add pinned `eslint`, `typescript-eslint`, and (if available) `eslint-plugin-obsidianmd` dev dependencies; run `npm audit`
- [x] 2.2 Add `eslint.config.mjs` (type-checked recommended rules plus Obsidian rules) and `npm run lint` with `--max-warnings=0` on `src/`
- [x] 2.3 Confirm the gate reproduces the `0.2.0` finding at `src/core/settings.ts:101-102` before any fix
- [x] 2.4 Run `npm run lint` in CI after the build and in the release build job before staging; update workflow contract tests

## 3. Type-safety fixes
- [x] 3.1 Add an `isReservedSection` type guard and iterate untrusted arrays as `unknown` in output-profile validation; existing settings tests pass unchanged
- [x] 3.2 Fix every other runtime finding from the lint gate without behavior change; list any justified suppression in the design
- [x] 3.3 Add a regression test proving wrong-typed sections are still rejected with the same messages

## 4. Repository hygiene
- [x] 4.1 Add `CONTRIBUTING.md` (setup, spec-first workflow, pull requests and rulesets, safety expectations)

## 5. Documentation and version
- [x] 5.1 Add `0.2.3` changelog notes
- [x] 5.2 Update `docs/PRD.md`, `docs/RELEASING.md` (lint gate), `openspec/project.md` (checkpoint and test count), and `docs/VERIFICATION.md`
- [x] 5.3 Bump `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` to `0.2.3`
- [x] 5.4 Run build, lint, full tests, runtime and dependency audits, strict OpenSpec validation, release staging, and `git diff --check`

## 6. Acceptance and publication
- [x] 6.1 (passed 2026-10-01, no caveats) Packaged desktop acceptance of the staged `0.2.3` assets in a disposable vault. Cover:
  - scan and classification smoke check
  - one create-only conversion with read-back
  - companion publication creates the file on disk
  - output-profile settings load and save unchanged
  - protected-content hashes before and after
- [x] 6.2 Open a pull request; CI (including lint) passes under the `Protect main` ruleset
- [x] 6.3 After owner approval, merge and push tag `0.2.3`; verify three matching attested assets and unchanged prior releases
- [x] 6.4 Owner rescans the Community listing against `0.2.3`; record the scorecard (target: Review **Passed**). Achieved: Health Excellent and Review Passed with no warnings.
- [x] 6.5 Archive the change and sync the spec delta into `openspec/specs/`

## Owner actions (outside code)
- [x] O.1 (enabled by the owner 2026-10-01, confirmed through the API) Enable GitHub private vulnerability reporting (**Settings → Code security → Private vulnerability reporting → Enable**) so that the **Report a vulnerability** route in `CONTRIBUTING.md` works. It was disabled when checked on 2026-10-01.
