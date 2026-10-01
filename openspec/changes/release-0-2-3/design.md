# Design

## Context

The scanner's finding is a static-typing issue in pure core code, so the fix stays in `src/core`. The lint gate is development tooling only and adds no runtime dependency. Desktop-only scope and every safety boundary from `0.2.2` are unchanged.

## Decisions

1. **Type-safe output-profile validation.**
   - Read `enabledSections` (and any similar untrusted array) as `unknown`. After `Array.isArray`, iterate it as `readonly unknown[]`, which is assignable from `any[]` without an unsafe operation.
   - Narrow each element with a type guard, `isReservedSection(value: unknown): value is ReservedSection`, which checks `typeof value === "string"` and membership in `RESERVED_SECTIONS`.
   - Error messages and accepted values stay identical, and existing settings tests must pass unchanged.
   - *Alternative rejected:* an inline `as ReservedSection` cast. It silences the rule without proving the type, and earlier Community scans flagged unnecessary assertions.

2. **Zero-warning type-aware lint gate.**
   - Add pinned, exact-version dev dependencies: `eslint`, `typescript-eslint`, and Obsidian's published plugin lint rules (`eslint-plugin-obsidianmd`) if available on npm.
   - A flat `eslint.config.mjs` lints `src/**/*.ts` with `typescript-eslint`'s `recommendedTypeChecked` set, using `parserOptions.projectService`, plus the Obsidian plugin's recommended rules.
   - `npm run lint` runs `eslint src --max-warnings=0`.
   - CI runs `npm run lint` after the build. The release build job runs it before staging, so a lint finding blocks publication.
   - Tests and scripts are excluded at first to keep scope small, which is acceptable because they never ship. Runtime source must be clean.
   - Before relying on the Obsidian plugin's rules, confirm by implementation that its recommended set reproduces the `0.2.0` finding on the `0.2.2` code. If the package is unavailable or incompatible, use `typescript-eslint` alone and record the gap.
   - *Alternative rejected:* a single regex rule in `audit-rules.mjs` for this pattern. It cannot track types and would miss the next case.
   - **Implementation notes (2026-10-01):**
     - **Versions:** ESLint is pinned to the 9.x line (`9.39.5`, with matching `@eslint/js`), not 10.x, because `eslint-plugin-obsidianmd@0.4.2` requires ESLint 9. `typescript-eslint` is `8.71.0`. All are exact-pinned.
     - **Obsidian plugin:** `eslint-plugin-obsidianmd` comes from `obsidianmd/eslint-plugin` (MIT). Its `recommended` flat config already bundles ESLint recommended, `typescript-eslint` `recommendedTypeChecked`, and the Obsidian rules (41 rules, including `package.json` checks), so the config uses it directly. It installed without a peer conflict. It nests a private `obsidian@1.12.3`; the root `obsidian@1.13.1` pin is unchanged.
     - **Audit:** the nested copy adds the same moderate `moment` advisory, now 3 dev-only findings. `npm audit --omit=dev` still reports 0, and none of it ships in `main.js`.
     - **Gate wiring:** `npm run lint` is `eslint . --max-warnings=0`, ignoring tests, scripts, build output, and staging. `npm run check` now runs build, lint, and tests, so the release job's existing `npm run check` lints before staging. CI runs lint as its own step after the build. A workflow contract test enforces the script, the exact pins, and step order.
     - **Reproduction:** before any fix, the gate reported exactly the scanner's finding, `no-unsafe-argument` at `src/core/settings.ts:101:37` and `102:27`. It also reported three errors added in `0.2.2`:
       - `settings.ts:216`: an unnecessary type assertion in `sanitizeSavedSettings`
       - `main.ts:106`: unsafe assignment in the `own()` modal helper
       - `main.ts:109`: unsafe call in the same helper
       All five are fixed in task group 3.
     - **Sentence case:** the Obsidian `ui/sentence-case` rule flagged four strings that use the product name "Soundings" or a quoted command name. The scanner did not report those strings against `0.2.0`, where two of them already existed. The rule stays enabled with `brands` (`Soundings`, `Obsidian`, `WebVTT`, `Markdown`) and an `ignoreRegex` for quoted command names, rather than lowercasing a proper noun.

3. **Fix all reported findings, not only the scanned lines.** Any other `no-unsafe-*`, `no-floating-promises`, or Obsidian-rule finding in `src/` is fixed in this change, without behavior changes. A finding that cannot be fixed safely is suppressed only with an inline justification, listed in this design, and approved in review.

4. **Companion-publication verification.**
   - The first implementation task is a desktop check in the existing `0.2.2` acceptance vault: publish a companion for `Enrichment/Weekly sync.md` and confirm `Weekly sync - Enrichment.md` exists on disk with the expected bytes.
   - If it does not, reproduce the failure in an automated test, then fix it within the existing create-only and revalidation boundaries, and amend this design and the `manual-enrichment` spec delta.
   - If it does, record the result and make no code change.
   - **Outcome (2026-10-01):** it passed. The `0.2.2` caveat came from a form that had not been submitted. This change makes no manual-enrichment code or spec change.

5. **`CONTRIBUTING.md`.** A one-page guide covering:
   - local setup (`npm ci`, `npm run check`, `npm run lint`)
   - the spec-first workflow (`openspec/`, the PRD)
   - pull requests (CI must pass; `main` and release tags are protected by rulesets)
   - security and privacy expectations (local-only, create-only, content-free logs)

## Risks / Trade-offs

- **New dev dependencies widen the supply chain.** Versions are pinned exactly and locked, `npm audit` stays in CI, and none ship in the bundle; the runtime audit still enforces an `obsidian`-only bundle.
- **The scanner's exact rule set is not published as configuration.** The local gate might differ from it. Mitigations: reproduce the known finding locally before trusting the gate, and the post-publication rescan is the final check.
- **Type-checked linting is slower than plain linting.** That is acceptable for a codebase of about 3,000 lines.

## Migration

None for vaults or settings. Release `0.2.3` is published through the existing attested workflow under the repository rulesets.
