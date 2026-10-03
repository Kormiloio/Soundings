# Foundation verification record

**Last updated:** 2026-10-02

## Soundings 0.3.0 automated candidate

The `add-folded-transcript-callouts` candidate passed automated verification on 2026-10-02 on branch `release/0.3.0`:

- Reproducible dependency installation with `npm ci --ignore-scripts --offline`.
- `npm run check`: production build, TypeScript, zero-warning type-aware Obsidian lint, and 461 tests across 39 files.
- Plain-output golden fixtures unchanged; three new folded fixtures cover text, multi-speaker WebVTT, and retained timestamps.
- Exact-pinned `micromark` 4.0.2 proves one enclosing blockquote, literal source preservation, and no escaped transcript content for adversarial inputs and a 5,000,000-byte transcript. The structural parser test has a 30-second timeout; production rendering independently passes its 500 ms budget at that size.
- Saved-profile migration, invalid display rejection, review summary, settings dropdown validation/persistence, stale-plan refusal, source preservation, and folded-note enrichment identification/planning pass.
- Runtime audit: only `obsidian` is loaded; no network, telemetry, Node filesystem, or destructive vault APIs.
- Production dependency audit: zero vulnerabilities. The full online audit reports the same three moderate development-only findings already recorded for 0.2.3, through `moment`, `obsidian`, and the lint plugin; they are absent from the shipped bundle.
- Strict OpenSpec validation, release staging, and `git diff --check` pass.
- The 5,000-file rehearsal recorded 4.7 ms for scanning and zero source mutations.

Staged assets in `release/0.3.0/`:

- `main.js`: `baff0763c27b29293efa33de831f7c852c80a23d05ccead1e8402a0eb31583fc`
- `manifest.json`: `56c5c841267f2aeeea00f6d608e18f1fa8aef40b66f162871a68a3f72af62418`
- `styles.css`: `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9`

Packaged desktop acceptance is **pending**. The initial Obsidian CLI probe reported that Obsidian was not running. A subsequent computer-use attempt reported "Computer Use permissions are not granted", so real-app acceptance could not begin.

A disposable acceptance vault was prepared at `/private/tmp/soundings-030-acceptance.NgrOT5` with the exact three staged assets copied into `Config/plugins/soundings/` and their hashes verified against the candidate. It includes plain text, multi-speaker WebVTT, adversarial Markdown, a protected existing destination, and hidden/config-directory exclusion fixtures. `Protected-hashes.json` records the seven source/protected-file baselines; `Acceptance.md` contains the checklist. Configure that vault to use `Config` before enabling the plugin. No personal or work vault was modified.

Collapsed rendering, click expansion, search, Outline, real-app enrichment, stale-plan behavior, and protected-file hashes must still be verified in the desktop app. PR/CI, publication, Community rescan, and archival remain pending. This is an unreleased candidate.

## Soundings 0.2.3 automated candidate

The `release-0-2-3` automated gate passed on 2026-10-01 on branch `release/0.2.3`:
- `npm ci`
- `npm run check`: production build and TypeScript checks with `strictBindCallApply`, the zero-warning type-aware lint (`eslint-plugin-obsidianmd` 0.4.2 recommended rules), and 437 automated tests across 37 files
- the runtime audit (bundle loads only `obsidian`)
- the production dependency audit, with zero vulnerabilities
- strict OpenSpec validation, release staging, and `git diff --check`

The full dependency audit reports three moderate `moment` advisories. All arrive through `obsidian` type packages (the root pin and the lint plugin's nested copy), and none reach `main.js`.

Before any fix, the lint gate reproduced the Community scorecard finding for `0.2.0` exactly: `@typescript-eslint/no-unsafe-argument` at `src/core/settings.ts:101:37` and `102:27`. It also reported three errors added in `0.2.2`: an unnecessary assertion at `settings.ts:216`, and an unsafe assignment and call at `main.ts:106` and `:109`. All are fixed, and the lint reports zero errors and zero warnings. `tests/settings-type-safety.test.ts` passed on the pre-fix code and passes unchanged afterwards.

Compared with published `0.2.2`, the staged `main.js` differs only in output-profile section and tag validation, which now adds a type guard and a `candidates` alias with identical results.

Staged candidate assets, which are the assets installed for packaged acceptance:

- `main.js`: `a3d26647e19a88d10fa7df2095e7132dc84d7c3d488945706a1c1f522e03a8fb`
- `manifest.json`: `40d74fc73687b31d3878de5cc506b6359cc85a4fbd577f5f0988c528f9c4aeee`
- `styles.css`: `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9`

Packaged desktop acceptance passed on 2026-10-01 using Obsidian desktop 1.13.7 on macOS 26.7 arm64.
- **Vault:** a disposable vault with nine fixtures. Only the three staged `0.2.3` assets above were installed, with hashes verified after copying and again after the run.
- **Config folder:** the vault used the default `.obsidian` configuration folder, the same deviation from RELEASING step 5 that was recorded for `0.2.2`.
- **Untrusted saved settings:** the vault was pre-seeded with `enabledSections: ["summary", "bogus", 7]`.

Results:
- **Untrusted saved settings: pass.** On load, Obsidian showed "Soundings ignored invalid saved settings and restored safe defaults." All four section toggles appeared enabled. `data.json` was left byte-for-byte unchanged until the user saved.
- **Valid output-profile save: pass.** After **Include Decisions section** was switched off and the static tag `meeting` added, with no errors, `data.json` held a fully validated profile: sections `summary`, `action-items`, `follow-ups`; tags `["meeting"]`; observation still off; mandatory exclusions present. The invalid values were gone.
- **Scan: pass.** Four candidates: eligible 2 (`Meetings/Standup.vtt`, `Meetings/Notes.txt`), unsupported 1 (`Adversarial/voice-class-freeze.vtt`, which classified instantly), destination-exists 1 (`Collisions/Bar.txt` beside `bar.md`). Nothing was preselected, and the `.hidden/` and `.obsidian/` transcripts were not listed. The plan header reflected the saved profile.
- **Conversion: pass.** One selected item reported `created: 1`. `Meetings/Notes.md` has `tags: ["meeting"]` and `soundings_version: 2`. Its sections are Summary, Action Items, and Follow-ups with no Decisions section, and its transcript is faithful.
- **Companion publication: pass.** **Publish companion note** closed the form, showed the creation notice, and wrote `Enrichment/Weekly sync - Enrichment.md` with frontmatter, the entered summary, all four sections, and the backlink `[[Enrichment/Weekly sync|Back to Transcript Note]]`.
- **Protected content: pass.** Against the pre-launch SHA-256 baseline, 13 files were unchanged, 0 changed, and 0 removed. Only the two created notes were added.

Immutable release `0.2.3` was published on 2026-10-01 (04:33 UTC) by release workflow run `36815628115` from tag `0.2.3` (merge commit `ba1ce8f` of pull request `Kormiloio/Soundings#6`). The tag push was accepted under the `Protect release tags` ruleset through the repository-admin bypass.
- It exposes exactly `main.js`, `manifest.json`, and `styles.css` with the accepted hashes above.
- `gh attestation verify` succeeded for all three against `refs/tags/0.2.3`, and the downloaded assets reproduced the accepted SHA-256 hashes.
- The release notes contain only the `## 0.2.3` section.
- Releases `0.2.2`, `0.2.1`, and `0.2.0` retain their original digests.

The owner rescanned the Community listing on 2026-10-01, and the public scorecard was checked read-only afterwards:
- **Listing:** current version **0.2.3**.
- **Health: Excellent.** Hygiene: "Readme, license, contributing guide, and description all present."
- **Review: Passed.** Six checks passed: verified artifact attestations for `main.js` and `styles.css`, no suspicious network patterns, no vulnerable dependencies, no obfuscation, and a byte-for-byte build reproduction.
- **Warnings:** none. The `0.2.0` `@typescript-eslint/no-unsafe-argument` warnings at `src/core/settings.ts:101-102` and the missing-attestation recommendation are both cleared.
- **Remaining items:** only the disclosure "Malware scan not available" and the expected vault-enumeration recommendation, which is inherent to recursive transcript discovery and disclosed in the README.

Private vulnerability reporting was enabled by the owner on 2026-10-01 and confirmed through the GitHub API.

## Soundings 0.2.2 automated candidate

The `harden-0-2-2` automated gate passed on 2026-09-30 on branch `hardening/0.2.2`: `npm ci`, production build and TypeScript checks, 427 automated tests across 36 files, the runtime audit (bundle loads only `obsidian`), production dependency audit with zero vulnerabilities, strict OpenSpec validation, release staging, and `git diff --check`. The full dependency audit reports two moderate `moment` advisories reachable only through the `obsidian` type package; `moment` is not imported and is absent from `main.js`.

New coverage proves:
- linear-time classification of 1 MB adversarial cues and 150,000 tilde runs
- attribution after `</v>` and refusal of `v`-prefixed unknown tags
- case- and Unicode-variant collision blocking, dot-leading destination refusal, and storage-level existence refusal
- per-item render isolation
- unload and progress-dismissal lifecycle through the real `main.ts`
- layout-ready observation, path-only prefiltering, and inbox retention
- heading, frontmatter, and enrichment structure escaping, and unlinkable-source refusal
- typed saved settings
- fingerprint guards against mutable input
- audit bypass rules and confined release staging

Single-voice golden outputs are unchanged.

Staged candidate assets, which are the assets installed for packaged acceptance:

- `main.js`: `000f022fdb418c7c7ba7471d4df55df31663be42f3ef07f4904cf19ee56ba204`
- `manifest.json`: `d825e0788e124a7ba89116d0ced403e39c642ac28cd79ae22b3e800c2eb8feb2`
- `styles.css`: `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9`

Packaged desktop acceptance ran on 2026-09-30 using Obsidian desktop 1.13.7 (installer 1.13.4) on macOS 26.7 arm64.
- **Vault:** a disposable vault with 321 generated fixtures. Only the three staged `0.2.2` assets above were installed, with hashes verified after copying. Observation was pre-enabled for `Inbox`.
- **Deviation from RELEASING step 5:** the vault used the default `.obsidian` configuration folder. Changing Obsidian's configuration-folder override affects the application, not just one vault. `0.2.2` does not change configuration-directory handling, which automated tests cover and which was last accepted on a custom folder with `0.1.2`.
- **Pre-check:** before launch, the real discovery and planning core was run against the vault from Node and produced every expected classification. It scanned 322 files in 40 ms and made no changes.

Results:
- **Startup quiet: pass.** Opening the vault with `Inbox/Existing before launch.txt` present showed no inbox notice. **Review transcript inbox** reported no current eligible files. **Reload app without saving** again showed no notice.
- **New file observed: pass.** A transcript created in `Inbox/` while Obsidian was open raised the notice. The inbox review listed only that file, eligible and unselected. Closing it wrote nothing.
- **Adversarial scan: pass.** The scan opened responsively with 316 candidates: eligible 309, unsupported 3 (`voice-class-freeze.vtt`, `class-tag-backtracking.vtt`, `video-tag.vtt`), destination-invalid 1 (`?.env.txt`), destination-exists 1 (`Bar.txt` beside `bar.md`), destination-ambiguous 2 (`Foo.txt`, `foo.vtt`), and 0 selected. Blocked items had no selection control. The `.hidden/` and `.obsidian/` transcripts were not listed.
- **Unload with an open review: pass.** With `Unload/Review target.txt` selected, `app.plugins.disablePlugin("soundings")` closed the review by itself, and `Unload/Review target.md` was not created.
- **Selected conversion: pass.** Five selected items reported `created: 5`. On disk:
  - `after-close.md` attributes "hi" to Alice, "narrator" to no speaker, and "yo" to Bob.
  - `percent-speaker.md` writes the heading `\%\%` and keeps Bob's later line.
  - `Budget $5 to $10.md` writes `Budget \$5 to \$10`.
  - `many-tildes.md` (300 KB) is one closed fence.
  - Reading view showed a literal `%%` heading with the later line visible, and a non-math title.
- **Escape on progress: not observable.** All 300 batch notes were created within about one second, before Escape could be pressed. Cancel-on-dismiss is covered by the automated `main.ts` lifecycle test.
- **Unlinkable enrichment source: pass.** **Add manual enrichment** on `Enrichment/Meeting #3.md` showed the rename notice and opened no form.
- **Companion publication: not verified.** For `Enrichment/Weekly sync.md`, the form preview showed all five summary lines (including `~~~`, `---`, and `===`) as text, with every section heading and the backlink. However, no `Weekly sync - Enrichment.md` existed on disk after publication was reported, and no matching file was found elsewhere. The repository owner chose to proceed to release with this check recorded as not verified. Companion publication is covered by the automated suite, and its code path is unchanged from accepted `0.2.1` apart from the new escaping and the unlinkable-source check. **Resolved 2026-10-01 (task 1.1 of `release-0-2-3`):** the earlier form had not been submitted. In the same vault, with the same installed `0.2.2` assets (`main.js` `000f022f…`), **Publish companion note** closed the form, showed the creation notice, and wrote `Enrichment/Weekly sync - Enrichment.md`. The file has `type`, `source_note`, and `converted_at` frontmatter, the entered summary, all four sections, and the backlink `[[Enrichment/Weekly sync|Back to Transcript Note]]`. The source note kept its baseline hash `863c62ad9ce8286b2040dc46bff744472f11e71b4838920aa924838c93c0c323`. Companion publication in `0.2.2` therefore passes.
- **Protected content: pass.** Comparing SHA-256 hashes against the pre-launch baseline: 324 files unchanged and 0 removed. The one changed file, `.obsidian/community-plugins.json`, was rewritten by Obsidian with identical content. Additions were only the 300 batch notes, the five selected notes, and the observed `Inbox/New after launch.txt`. `Collisions/bar.md` kept its hash `3cf134663a373849a3f499055f949cf2d64fdc65c8c33a9bc677878f3b919bf0`.

Immutable release `0.2.2` was published on 2026-10-01 (02:44 UTC) by release workflow run `36807188533` from tag `0.2.2` (merge commit `65d488e` of pull request `Kormiloio/Soundings#3` on `main`).
- It exposes exactly `main.js`, `manifest.json`, and `styles.css` with the accepted hashes above.
- `gh attestation verify` succeeded for all three against `refs/tags/0.2.2`, and the downloaded assets reproduced the accepted SHA-256 hashes.
- The release notes contain only the `## 0.2.2` changelog section.
- Releases `0.2.1`, `0.2.0`, and `0.1.2` retain their original asset digests.

During verification on 2026-09-30, a smoke test of `release:prepare -- --tag 0.2.1` replaced the local, gitignored `release/0.2.1/` staging copy with a branch build. It was restored from a clean rebuild of tag `0.2.1`, whose `main.js`, `manifest.json`, and `styles.css` reproduced the published SHA-256 hashes exactly. The published release was not affected.

## Published 0.2.0 asset discrepancy

Recorded 2026-09-29 during pre-release review. GitHub release `0.2.0` (tag `0.2.0` → commit `4b74b86`) exposes `main.js` `eb42c8fa92046a8af3f71405cd7259b5861e649d9ee4a2aac5e4dd8265e40b58`; rebuilding `4b74b86` reproduces that hash exactly. The packaged acceptance below covered `main.js` `06da240b…`, built from the later uncommitted working tree. `manifest.json` and `styles.css` match. The published `0.2.0` therefore lacks the verified exact source-note identification and full-path companion backlinks; it has no artifact attestations. Release `0.2.0` remains immutable; the corrections ship in `0.2.1`.

## Soundings 0.2.1 automated candidate

The `release-0-2-1` automated gate passed on 2026-09-29: production build and TypeScript checks, 244 automated tests across 29 files, runtime audit, production and full dependency audits with zero vulnerabilities, strict OpenSpec validation, and `git diff --check`. New coverage proves per-speaker blocks for multi-voice cues, ignored WebVTT header metadata, whitespace-only cue separators with fail-closed stray chunks, single-pass character-reference decoding, line-delimited frontmatter identification (delimiter-like values, CRLF, BOM), enrichment draft retention for every non-created outcome with refreshed evidence after stale sources, bare-tag release triggers, read-only dependency installation, job-scoped publish permissions, and SHA-pinned actions. Single-voice golden outputs are unchanged. GitHub CI passed on pull request `Kormiloio/Soundings#1`.

Packaged desktop acceptance passed on 2026-09-30 in a disposable vault using Obsidian desktop 1.13.7 on macOS 26.7 arm64 and only the staged `0.2.1` runtime assets:

- `main.js`: `5abecb496ce7ca2dd3eb261aed2eff224a52112be3c35c10880bcd99e7084b0c`
- `manifest.json`: `b7cc87c78f05d393d242408a3e592120d1add318ddba78ff54ad47e4005829d2`
- `styles.css`: `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9`
- The scan listed `Calls/existing.vtt` as `destination-exists`, omitted `.hidden/secret.vtt`, and classified the YouTube-style header file as eligible.
- Explicit conversion created every selected note. `multi-voice.md` rendered separate Alice, Bob, Alice blocks; `youtube-header.md` contained no header metadata; `whitespace-separator.md` contained two blocks and no timing syntax; `entities.md` rendered `&lt;b&gt;` and `<tag>` exactly.
- Manual enrichment opened for `Meetings/standup---notes.md`. With the companion destination created externally after review, publication was refused and the form stayed open with the typed summary intact. After the blocker was removed, publication created `Meetings/standup---notes - Enrichment.md` with the full-path backlink `[[Meetings/standup---notes|Back to Transcript Note]]`.
- All ten pre-existing files, including every transcript source, `Calls/existing.md`, and the hidden transcript, retained their recorded SHA-256 hashes.

Immutable release `0.2.1` was published on 2026-09-30 by release workflow run `36716977301` from tag `0.2.1` (merge commit `6615f1d` on `main`). It exposes exactly `main.js`, `manifest.json`, and `styles.css` with the accepted hashes above. Each asset has one GitHub build-provenance attestation, and `gh attestation verify` succeeded for all three against `refs/tags/0.2.1`. The release notes contain only the `## 0.2.1` changelog section. Releases `0.2.0` and `0.1.2` retain their original asset digests.

## Soundings 0.2.0 manual-enrichment automated candidate

The hardened manual-enrichment automated gate passed on 2026-09-29:

- Production build and TypeScript checks passed with 221 automated tests across 28 test files.
- Exact source-note identification accepts generated schema versions 1 and 2 and rejects missing source linkage, lookalike types, duplicate metadata, malformed versions, and unsupported schema versions.
- Companion backlinks retain the complete vault-relative source path so duplicate note names in different folders remain unambiguous.
- A maximum-valid 50,000-byte enrichment draft produced a complete review plan without creating a companion or changing the source note.
- Stale source evidence, planning collisions, destination races, cancellation, create failures, and read-back mismatches remain fail-closed and content-free.
- The 5,000-file rehearsal recorded a 4.6 ms scan and zero source mutations.
- Runtime audit, production dependency audit, strict OpenSpec validation, and `git diff --check` passed; the dependency audit reported zero vulnerabilities.
- Packaged desktop acceptance and one explicitly confirmed companion publication passed as recorded below.

Packaged desktop acceptance passed on 2026-09-29 in `/private/tmp/soundings-0.2.0-verification-1790643688` using Obsidian desktop 1.13.7 and only the staged `0.2.0` runtime assets:

- `main.js`: `06da240b437383fc98be6db65c4fc1d9b4ca613980532dc2737be1849d282653`
- `manifest.json`: `ab8f5c3b09034386f4db36318e33acd172b9bb7d1a0e68531857e0ecde2d985a`
- `styles.css`: `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9`
- A lookalike note with an unsupported schema was rejected with no form or file creation. Empty input was blocked with an actionable local validation message.
- The supported Alpha fixture showed the exact `Projects/Alpha/Meeting - Enrichment.md` destination, full `[[Projects/Alpha/Meeting|Back to Transcript Note]]` link, metadata, and rendered sections. Returning to edit preserved form state; canceling created no companion. Its source remained `55228373be3f2b7abca2bb5615df7a127b07400dd5b9e39cb7747c50b680b793`.
- A pre-existing companion blocked publication and remained `a1799130665a73941bcd3abb701c729ac4cad5611f77d578a8fa932c3d0af6cb`.
- An intentional source edit after preview produced a stale-evidence result and no companion. A destination created after preview produced a collision result; the external winner remained `bde352aeb58c5cef363ed2bc2c742bf7a7bdb2b4808c7ac4a5a8c902a9eb590f`.
- Explicit confirmation created exactly `Acceptance/Publish - Enrichment.md`. Read-back matched the reviewed metadata and sections, and Obsidian resolved its full-path backlink to `Acceptance/Publish.md`.
- `Acceptance/Publish.md` remained `f9d358cf3a1853fe3eb54dda37b74dd94499d0eccc06b93bcfeb564005fa5764`; the created companion is `c75d3125eb65e017e8f4abfc7fd2eb08c016242b044f881f4667d490d5b42a96`.
- Same-named Alpha and Beta source notes, the unsupported note, collision source, race source, and every pre-existing destination retained their recorded hashes. Captured notices contained paths or outcome reasons only; debugger capture contained command metadata and no transcript, note, or enrichment bodies, and Obsidian reported no captured errors.

## Automated verification

- Production build and TypeScript checks: passed.
- Automated tests: 96 passed across 15 suites, including Community source-warning contracts, declarative settings, configurable vault-directory safety, release-readiness success, and fail-closed cases.
- Runtime audit: passed; no network, telemetry, Node filesystem, credential, destructive vault API, or actionable Community source-warning pattern was detected.
- npm production dependency audit: zero vulnerabilities reported.
- Golden conversions: representative UTF-8 plain text and Zoom-style WebVTT passed byte-deterministic output checks.
- Safety integration: source changes, missing sources, existing destinations, concurrent destination creation, malformed input, mismatched read-back, cancellation, and plugin ownership passed.

## Configurable output and WebVTT automated candidate

The `add-configurable-note-output` and `improve-vtt-compatibility-and-discovery` automated gate passed on 2026-09-27:

- Production build and TypeScript checks passed.
- All 205 unit, integration, golden, UI-contract, release-readiness, source-contract, adapter, enrichment, and scale tests passed across 26 test files.
- WebVTT coverage accepts timestamps with or without hours, unclosed voice tags, multiple voice lines per cue, and voice-tag classes while retaining deterministic cue text and timing data.
- Discovery coverage proves parsable candidates become eligible with source evidence, malformed WebVTT becomes unreadable, and recognized WebVTT with unsupported structures becomes unsupported before the review plan opens.
- Configurable-output coverage verifies title and destination patterns, optional reserved sections, static tags, timestamp retention, settings migration, previewed profile fingerprints, and execution-time profile revalidation.
- The 5,000-file rehearsal recorded a 4.3 ms scan and zero source mutations.
- Runtime audit passed with no network, telemetry, Node filesystem, credential, destructive vault API, or actionable Community source-warning pattern; the production dependency audit reported zero vulnerabilities.
- Both OpenSpec changes pass strict validation.
- Packaged desktop acceptance remains pending. This working tree also contains the in-progress manual-enrichment command, whose remaining desktop acceptance tasks must pass or be separated before a `0.1.3` release candidate is staged.

## Large-vault review automated candidate

The `improve-large-vault-review` automated gate passed again after desktop acceptance on 2026-09-26:

- Production build and TypeScript checks: passed.
- Full unit, integration, golden, UI-contract, modal-interaction, review-state, release-readiness, source-contract, adapter, and scale suites: 113 passed across 18 suites.
- Review-state coverage verifies immutable classification counts, case-insensitive source/destination search, classification filtering, empty results, hidden-selection accounting, visible-eligible-only bulk selection, clear-all behavior, and fresh unselected state for a new plan.
- Modal integration coverage verifies accessible native search and classification controls, textual live status, keyboard-operable buttons and toggles, disabled conversion without a selection, hidden-selection preservation, exact conversion selection, and reset state when reopened.
- The 5,000-file rehearsal exercised search, filtering, bulk selection, hidden selections, clearing, and cancellation; the final recorded scan completed in 4.9 ms and source/destination mutation counts remained zero before explicit execution.
- Runtime audit: passed with no network, telemetry, Node filesystem, credential, destructive vault API, or actionable Community source-warning pattern.
- Strict OpenSpec validation and git diff whitespace validation: passed.
- Disposable-vault desktop checks and one selected create-only conversion passed as recorded below.

## Reviewed transcript inbox acceptance

The `add-reviewed-transcript-inbox` automated and desktop gates passed on 2026-09-26:

- Production build and TypeScript checks passed with 135 automated tests across 19 suites.
- Shared manual/event discovery, bounded stability retry, cancellation, identity deduplication, missing-entry removal, collision replanning, lifecycle coordination, and a mixed event storm passed without vault mutation.
- Runtime audit found no network, telemetry, Node filesystem, credential, destructive vault API, or actionable Community warning pattern; the production dependency audit reported zero vulnerabilities.
- Strict OpenSpec validation and `git diff --check` passed.
- Disposable desktop acceptance used Obsidian 1.13.7 and `/private/tmp/soundings-inbox-acceptance.f8k5A5` with the development build.
- Observation loaded disabled by default. A transcript created while disabled did not enter the inbox. After enabling observation for `Inbox`, the reviewed inbox contained only the two observed paths: one eligible source and one current destination collision. The outside-root and configured Obsidian-directory files were absent, and the plan started with zero selected items.
- A manual whole-vault scan remained independent from the inbox and correctly enumerated otherwise permitted files outside the observation root.
- Closing the inbox review without selection left the eligible destination absent. Source and protected collision hashes remained unchanged.
- Disabling and re-enabling Soundings cleared owned in-memory state; **Review transcript inbox** then reported no current eligible files.
- Recreating the same synthetic path with identical content retained one unselected inbox entry. A fresh candidate produced one local Soundings notification and did not open a modal automatically.
- Explicitly selecting only `Inbox/Final Conversion.txt` produced `created: 1`. Its source remained `a0694b156e6565cea0ace0d4a81e827e09a8c3fbf168336d65e039d7e5650bf1`.
- Protected `Inbox/Observed Collision.txt` remained `d0316935723bcdb5a3c47e7329f1826100077c199053d6354102be0f912e31cd`, and `Inbox/Observed Collision.md` remained `5a9b9ac649ab4dbc19e80d88131bbd0596741fb7362e094912be78131dcaf09b`.
- The created `Inbox/Final Conversion.md` is 468 bytes with SHA-256 `6554498e7062bde8ced26f427fd379c3522635648de10e603939628ff30f3536`; read-back confirmed the expected source metadata and transcript section without logging note content.

## Large-vault review desktop acceptance

Acceptance passed on 2026-09-26 in `/private/tmp/soundings-large-review-restart.xjD4pP` using the corrected development build in Obsidian desktop. The vault contained 211 synthetic transcript candidates across nested folders and mixed classifications.

- The initial plan reported 202 eligible, 1 excluded, 1 empty, 1 oversize, 4 destination-exists, and 2 destination-ambiguous candidates, with all 211 shown and 0 selected.
- Manual acceptance first exposed an outer-modal overflow at the narrow desktop window. The corrected build constrained the modal to the viewport, kept the header and footer visible, wrapped paths, and made only the candidate list scroll. The repeated check passed without obscured controls or paths.
- Case-insensitive path search reduced `Needle` to 9 visible eligible items. **Select all eligible shown** selected only those 9 items. Two explicitly submitted nine-item synthetic batches reported `created: 9 · skipped: 202`; all source and protected collision hashes remained unchanged.
- A fresh plan reset to 0 selected. Selecting `Review/Zoom Sample.vtt` and then searching for `Transcript 198` showed 1 visible row while retaining the hidden selected count of 1. **Clear selection** returned the total to 0 and disabled conversion.
- With the search cleared, the destination-exists filter showed all 22 current collisions. **Refresh plan** restored all classifications, all 211 rows, and 0 selected. Keyboard entry operated the native search control, and closing the refreshed plan produced no new Markdown file or protected-hash change.
- The first desktop pass showed that pressing Return in the search input could activate the modal's default conversion action. The corrected build consumes that key event in the search control. With `Review/Transcript 198.txt` selected and its search field focused, pressing Return left the plan open at 1 shown and 1 selected; clearing and closing left `Review/Transcript 198.md` absent and the Markdown-file count unchanged at 23.
- A final filtered review selected only `Review/Zoom Sample.vtt`. Execution reported `created: 1 · skipped: 210` using paths and outcome metadata only; no transcript or generated-note body appeared in the result report.
- `Review/Zoom Sample.vtt` remained `db7137ac2afbd4b907843d28d917d5ae71dc0079b30ee0b02ebeac190937ceb8`.
- Protected `Collisions/Existing 1.txt` remained `4e4d753917cf4568b1293e2b94669eb90f961d1917219de091f91c38337868ba`, and `Collisions/Existing 1.md` remained `0476ef679f1859d64e0d81342bfd677fba191d4400f2f75ad4da43eef5d9b55b`.
- Hidden `.private/Hidden.txt` remained `424b4aa505c258e814b8e24884eb8b9430591acc2979f043d1059d4d26560dfb`.
- The created `Review/Zoom Sample.md` is 389 bytes with SHA-256 `ac45b8a0695ffc6d2c1f2d35a6382f16782e1f257e7423dcfceed4ac14f34f3e`; its source metadata and transcript section were verified without logging body content.

## Corrective 0.1.1 automated candidate

The `address-community-review-feedback` automated gate passed on 2026-09-23:

- Production build and TypeScript checks: passed.
- Full unit, integration, golden, UI-contract, release-readiness, and 5,000-file suites: 96 passed across 15 suites.
- Runtime audit: passed with no actionable Community source-warning pattern.
- Production dependency audit: zero vulnerabilities.
- Strict OpenSpec validation and git diff whitespace validation: passed.
- Release metadata: package `0.1.1`, manifest `0.1.1`, compatibility minimum `1.13.7`, and exact release tag `0.1.1` agree; the `0.1.0` compatibility entry remains present.
- Staged inventory: exactly `main.js`, `manifest.json`, and `styles.css`.
- `main.js`: `9edfd78a0597885fc19bb20ca329a9913739b78cb246da8e013c2aef9f9e18b5`
- `manifest.json`: `4b4376fddfe510dc8f72506fd577a6d5446a86054b9a9a049c15969d5d8627e6`
- `styles.css`: `f924a269f05d7c01a75303fd0490c2ab0baf498ddeb5b03dd3c4e23ce69af144`
- Destination and Markdown-heading characterization vectors passed without changing accepted output or collision behavior.

Packaged desktop acceptance passed on 2026-09-23 in `/private/tmp/soundings-0.1.1-acceptance.AIQDyO` using Obsidian desktop 1.13.7 on macOS 26.6.2 arm64. The vault installed only the three staged `0.1.1` assets listed above and changed Obsidian's configuration directory from `.obsidian` to `.soundings-config`.

- Soundings loaded and remained enabled as version `0.1.1`; the packaged manifest retained plugin ID `soundings`, minimum Obsidian version `1.13.7`, and `isDesktopOnly: true`.
- Obsidian wrote its active application, appearance, core-plugin, community-plugin, and workspace state beneath `.soundings-config`, confirming that the renamed directory was in use.
- Searching settings for `Maximum transcript bytes` found and focused the Soundings control. The safety explanation and all six declarative controls were present, and the exclusion copy named `.soundings-config` rather than `.obsidian`.
- The waves ribbon control and command-palette entry opened the same two-item review plan with no candidate selected: `Successful/Alice and Bob.txt` was eligible and `Collision/Planning Review.txt` reported its existing destination.
- `.soundings-config/Private/Should Not Read.txt` was neither read nor offered. Its hash remained `9e0c795ec7ee95d21fae92cbf61dbd2cd1ae7c78f9b98f05bd616f1daf4a3860`.
- Closing the plan without conversion created no destination. The eligible source, collision source, and pre-existing collision destination retained hashes `3dfcb425fc068a64e8700d45b338260ddad51c08d0feea0400e50cc2f717fb5d`, `2df94352050f9765fbbfe0ede4e0a000f5af64aa45da97063c5e93429988498e`, and `0ab81144a8051acd8adf9258e52f943bd14534818fc7d870df07be2cfd240534` respectively.
- Selecting only the eligible transcript produced `created: 1 · skipped: 1`; Soundings read the new note back successfully, left the collision unselected, and preserved all four protected hashes above.
- The created `Successful/Alice and Bob.md` hash is `bcd7e1dcbf192d67caec46b527d2ed66abaaf76dc08053d1ff94960351c2fa32` and contains the expected structured local transcript.
- Saved `0.1.0` preference migration, invalid-settings rejection, and the destination/heading normalization equivalence vectors passed in the automated suite; the fresh disposable vault had no prior saved preferences to migrate manually.

GitHub release `0.1.1` was published from accepted commit `51c04b76a8a9d94f4e4b23aa090f6497c60967c5` and verified at `https://github.com/Kormiloio/Soundings/releases/tag/0.1.1`. It is neither a draft nor a prerelease. Fresh downloads contain exactly `main.js`, `manifest.json`, and `styles.css`, and their SHA-256 hashes match the accepted staging hashes above. A post-publication query and fresh download also confirmed that release `0.1.0`, its target commit, asset inventory, and all three hashes remain unchanged.

The `0.1.1` Community rescan is recorded below. The draft remains unpublished pending the `0.1.2` correction and a clean completed rescan.

## Disposable 5,000-file desktop rehearsal

A temporary filesystem-backed vault containing 4,990 Markdown notes and 10 transcript files was created and removed by the test suite.

- Transcript discovery scan: 4.1 ms in the recorded run.
- Reviewed create: passed.
- Destination race: refused; external winner preserved.
- Cancellation: stopped further discovery work.
- Restart classification: created destination became `destination-exists`.
- Source verification: zero transcript-byte mutations.

The recorded time is a development-machine measurement, not a device performance guarantee.

## Community release candidate

The `prepare-community-release` automated gate passed on 2026-09-23:

- Strict OpenSpec validation: passed.
- Git diff whitespace validation: passed.
- Release metadata: package `0.1.0`, manifest `0.1.0`, compatibility minimum `1.13.7`, and exact release tag `0.1.0` agree.
- Staged inventory: exactly `main.js`, `manifest.json`, and `styles.css`.
- `main.js`: `c31fe1b40aa40258b57c3091b54b2ca451913b70cc3b24b980057e4ebd2853be`
- `manifest.json`: `188551bcafb273c53309f2778042ab4e2227a8fcac3416d4b528f78f8521a0da`
- `styles.css`: `f924a269f05d7c01a75303fd0490c2ab0baf498ddeb5b03dd3c4e23ce69af144`

Packaged desktop acceptance passed on 2026-09-23 in `/private/tmp/soundings-release-acceptance.bsOyek` using Obsidian desktop 1.13.7 on macOS 26.6.2 arm64. The vault installed only the three staged assets listed above.

- The package loaded as Soundings with the desktop-only `0.1.0` manifest and minimum Obsidian version `1.13.7`.
- The settings screen retained all controls and safety text without the redundant raw settings heading.
- The waves ribbon control and command-palette entry opened the same two-item review plan with no candidate selected.
- Closing without conversion created no destination; both source hashes and the pre-existing collision hash remained unchanged.
- Selecting the sole eligible synthetic transcript created and verified exactly `Successful/Alice and Bob.md`; the collision was skipped.
- The eligible source remained `d0ff2ba3a44bc4770f1ed819b5f158fca7db3595777acfc97fa94d3dc677de18`.
- The collision source remained `126ae30bc2d2a159d9f93547b5bb3c549baa4606339c62146048aadfaa46fef9`.
- The pre-existing collision destination remained `a7f5e56dbe3547b4d6f43978e747e8b744571773ee9a4d481025c0b14a541e3f`.
- The newly created reviewed destination hash is `ba79d4a5a2be7494bf59a4a309b820a83ae396e05b448bc7a99c94d3c114a0e3`.

Official Obsidian submission instructions, plugin requirements, developer policies, and Community ownership guidance were reviewed on 2026-09-23.

GitHub release `0.1.0` was published from commit `ea959605fdf16638edd83eea16f9dbe01676a681` and verified at `https://github.com/Kormiloio/Soundings/releases/tag/0.1.0`. It is neither a draft nor a prerelease. The public asset inventory contains exactly `main.js`, `manifest.json`, and `styles.css`; GitHub's reported SHA-256 digests and a fresh download match the accepted staging hashes above.

## Community directory draft review

The repository owner connected GitHub account `mcamaj`, made the active Kormiloio organization membership public, accepted the developer policies and maintenance commitment, and created the Soundings Community listing draft on 2026-09-23. Obsidian resolved release `0.1.0` at commit `ea95960` and began its automated review.

The automated review passed dependency vulnerability and code-obfuscation checks. It reported vault enumeration as an expected behavior recommendation and returned actionable source warnings for `globalThis`, a control-character regular expression, an unnecessary regular-expression escape, the hardcoded `.obsidian` configuration folder, missing declarative settings definitions, and deprecated `setWarning()` usage. The listing remains in draft mode pending a separately specified patch release; no public-directory publish action was taken.

The owner requested a Community rescan after corrective release `0.1.1`. The completed review resolved every warning reported against `0.1.0`; network, dependency, code-obfuscation, and byte-for-byte build-reproduction checks passed. The review retained the expected vault-enumeration recommendation and added a non-blocking recommendation for GitHub artifact attestations on `main.js` and `styles.css`.

The `0.1.1` source review reported two new actionable warnings: an unnecessary `SoundingsSettings` assertion in `src/main.ts:65`, and use of `activeWindow.setTimeout()` rather than `window.setTimeout()` in `src/obsidian/vault-adapter.ts:34`. The listing remains unpublished. These warnings require another separately specified corrective release and clean rescan before the owner receives the final Publish handoff.

## Corrective 0.1.2 candidate

The `clear-community-review-followups` change removes only the two `0.1.1` source warnings, adds local source-contract and runtime-audit checks for both patterns, and preserves the accepted settings migration, configuration-directory exclusion, cooperative yielding, and vault safety behavior. Package, manifest, and compatibility metadata now identify `0.1.2`; compatibility entries for `0.1.0` and `0.1.1` remain present.

The automated `0.1.2` candidate gate passed on 2026-09-23:

- Production build and TypeScript checks: passed.
- Full unit, integration, golden, UI-contract, release-readiness, source-contract, adapter, and 5,000-file suites: 101 passed across 16 suites.
- The 5,000-file rehearsal recorded a 3.5 ms scan and zero source mutations.
- Runtime audit: passed with no actionable Community source-warning pattern, including the saved-settings assertion and rejected timer form.
- Production dependency audit: zero vulnerabilities.
- Strict validation for both active corrective changes and git diff whitespace validation: passed.
- Release metadata: package `0.1.2`, manifest `0.1.2`, compatibility minimum `1.13.7`, and exact release tag `0.1.2` agree; the `0.1.0` and `0.1.1` compatibility entries remain present.
- Staged inventory: exactly `main.js`, `manifest.json`, and `styles.css`.
- `main.js`: `99c02964ed9e0f53cfedbb17bfb4c32b83ea849ee0ee4a478bd384e914c32c9f`
- `manifest.json`: `ef2c39e1d6dcb35325614de5a4054047d6825710f21da90aa651d3bd280675bd`
- `styles.css`: `f924a269f05d7c01a75303fd0490c2ab0baf498ddeb5b03dd3c4e23ce69af144`

Packaged desktop acceptance passed on 2026-09-24 in the existing upgrade vault `/private/tmp/soundings-0.1.1-acceptance.AIQDyO` using Obsidian desktop 1.13.7 on macOS 26.6.2 arm64. Only the three staged `0.1.2` assets were installed over the accepted `0.1.1` plugin inside the active `.soundings-config` directory.

- Soundings loaded and remained enabled as version `0.1.2`; plugin ID `soundings`, minimum Obsidian version `1.13.7`, and `isDesktopOnly: true` remained unchanged.
- A saved `0.1.1` settings record loaded with both formats enabled, the `Archive` user exclusion, 5 MB maximum, disabled project inference, and `Projects` root. Settings search found `Maximum transcript bytes`; the safety explanation and all six controls appeared; only `Archive` was editable; and the copy named `.soundings-config`.
- The ribbon and command-palette entry points showed the same four-item unselected plan. `Upgrade/Carol and Dan.txt` was the only eligible source; three existing destinations were blocked; `.soundings-config/Private/Should Not Read.txt` was not offered.
- Closing the first plan created no destination. Automated cancellation coverage also passed without source mutation or partial publication.
- Selecting only the eligible upgrade transcript through the command entry produced `created: 1 · skipped: 3` and read the new note back successfully.
- `Upgrade/Carol and Dan.txt` remained `114eb890b563f1f7d78b7eda43d6af8a86e77ce9fbd4d1d259f21d97aaf97c3d`.
- `UpgradeCollision/Planning Review.txt` remained `e0ce63ca5869add488effbe23bdf89327db187be8f760ca84359309d8ea76382`.
- The pre-existing `UpgradeCollision/Planning Review.md` remained `66bcd4e3eea55874046a7154adecddf76cb04931fb71ffa18fdc0e29c5518cbe`.
- The protected config transcript remained `9e0c795ec7ee95d21fae92cbf61dbd2cd1ae7c78f9b98f05bd616f1daf4a3860`.
- The created `Upgrade/Carol and Dan.md` hash is `3f056059b0a7f816bea0e178afcf705ca80f93808cfbe8c8803f36929ba28326` and contains the expected structured local transcript.

GitHub release `0.1.2` was published from accepted commit `6e2458ab4c7ae2215d2f47716ca4fad7a9062fc8` and verified at `https://github.com/Kormiloio/Soundings/releases/tag/0.1.2`. It is neither a draft nor a prerelease. A fresh download contains exactly `main.js`, `manifest.json`, and `styles.css`, and all three SHA-256 hashes match the accepted staging directory. Fresh preflight downloads plus post-publication GitHub metadata confirmed that releases `0.1.0` and `0.1.1`, their target commits, asset inventories, and recorded hashes remain unchanged.

The owner requested a Community rescan after corrective release `0.1.2`. The completed review passed network-pattern, dependency-vulnerability, code-obfuscation, and byte-for-byte build-reproduction checks and reported no actionable source warning or failure. The review retained the expected vault-enumeration recommendation and the non-blocking recommendation for GitHub artifact attestations on `main.js` and `styles.css`.

The automated Community gate is clean. The repository owner performed the final **Publish** action on 2026-09-24. The public Soundings page displayed **Add to Obsidian**, Review **Passed**, Health **Excellent**, the expected author and description, and the desktop 1.13.7 requirement. Soundings is now publicly available in the Obsidian Community directory.

## Real Obsidian desktop acceptance

Acceptance passed on 2026-09-22 in a disposable vault using Obsidian 1.13.7 on macOS 26.6.2 arm64.

- Keyboard navigation moved between settings controls without a pointer.
- Invalid maximum-size and excluded-path values produced visible textual errors that did not rely on color; correcting each value cleared the error.
- A source with an existing destination was classified as blocked and could not be selected.
- A destination created after preview was refused during execution and its externally written bytes were preserved.
- An eligible source produced a Markdown note reported as created and read-back verified.
- SHA-256 verification confirmed that every source and both pre-existing/racing destinations remained byte-for-byte unchanged.

The minimum supported Obsidian desktop version is therefore pinned to 1.13.7. The foundation desktop acceptance gate is complete.

## Deferred platform acceptance

The first release is desktop-only. Android, iOS, and iPadOS performance, source-size, create-existing, and read-back acceptance are deferred to a separately approved future change.
