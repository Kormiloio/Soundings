# Foundation verification record

**Last updated:** 2026-10-03

## Soundings 0.4.0 SRT release

Published on 2026-10-05 at [Soundings 0.4.0](https://github.com/Kormiloio/Soundings/releases/tag/0.4.0), neither draft nor prerelease. PR #11 merged as `1969aaaf3d78953f54d66d92cd27ea5eca6147dd`; required PR and merged-main CI passed. Bare tag `0.4.0` resolves to that accepted commit. Release workflow run `37312443088` passed both Build & Verify and Attest & Publish jobs. A fresh download into separate `release/0.4.0-downloaded/` contains exactly the three accepted assets and matches every hash below. `gh attestation verify` passed for all three with repository, signer workflow `.github/workflows/release.yml`, exact source digest, `refs/tags/0.4.0`, and hosted-runner restrictions enforced. Comparing pre/post-publication release IDs, targets, asset IDs/names/sizes/digests confirms all nine prior releases are unchanged.

Git transport failed twice during local sync. The working GitHub API supplied the signed merge commit: its reconstructed Git object hash and tree were verified against GitHub's commit SHA and the accepted branch tree before importing it and fast-forwarding local main. The initial reconstruction failed closed on signature whitespace; the exact representation then matched. Tag creation through GitHub's API emitted the normal push event and ran the unmodified release workflow. No release gate, branch protection, tag identity, or existing release was bypassed or changed.

Owner-controlled Community review was confirmed on 2026-10-09: the owner supplied the current public Soundings listing showing Review: Passed, alongside a 0.4.0 description and current-version details. The owner explicitly authorized SRT spec synchronization and archival. Tasks 6.2 and 6.3 are now complete; historical pending statements below describe their original checkpoints.

Pre-publication checkpoint, 2026-10-05: the owner confirmed Soundings remained loaded after changing the disposable vault to `.soundings-acceptance`. A guarded Obsidian CLI query verifies that exact active configuration directory, plugin version 0.4.0, and saved TXT/VTT/SRT enabled formats. Owner confirmed zero shown after correcting the exclusion search to exactly `Excluded` (the initial screenshot included an extra `>` and is not sufficient by itself). Custom-folder candidate assets match the accepted staging bytes. The release-checklist custom configuration requirement is satisfied. The owner's explicit 2026-10-04 publication approval applies to the accepted hashes below; release execution and post-publication verification are next.

The active `add-srt-transcript-support` candidate passed automated verification on 2026-10-03 on macOS 26.7 (25G229), arm64, Node v26.8.1:

- `npm run check`: production build/TypeScript, zero-warning type-aware Obsidian lint, and 523 tests across 41 files pass.
- Synthetic SRT fixtures cover multiline Unicode, BOM/CRLF/CR/EOF, repeated/overlapping cues, counter/timing ambiguity, invalid intervals, literal markup/entities, and fail-closed decoding/structure. No real transcript content is committed.
- Four SRT golden notes cover plain/folded and omit/retain combinations; original TXT/VTT rendered goldens remain unchanged. Structural CommonMark tests confirm one containing callout with inert payloads.
- Old/malformed settings retain safe TXT/VTT defaults without enabling SRT or observation; explicit SRT-only selection survives validated save/reload. The timestamp UI/summary now says Caption timestamps without changing stored profile semantics.
- Discovery and observation share exclusions, roots, enabled-format and size gates. Integration tests cover cross-format/case/Unicode collisions, protected existing notes, storage/create races, source/settings staleness, failure isolation, explicit selection, and companion enrichment. Tests driving the real plugin entry points refuse later SRT writes after cancellation/unload while validation waits.
- Adversarial classification measurements: 1,000,000 characters in 0.4 ms, 1,000,002 in 0.1 ms, and 1,020,038 in 26.2 ms, all under the reference-desktop 500 ms budget.
- The valid near-limit generator produced 4,989,982 bytes and 5,286 cues; parse/render took 17.8 ms with every cue preserved and no stack error.
- The 5,000-file mixed SRT/TXT disposable filesystem rehearsal recorded 8.3 ms scanning, responsive filtering/bulk selection/clearing, guarded conversion/race/cancellation/restart behavior, and zero protected-source mutations. Measurements are development-machine observations, not guarantees for other devices or real Obsidian UI performance.
- Runtime audit passes: the bundle loads only `obsidian`; no network, code loading, telemetry, Node filesystem, credential, destructive vault, or storage-write APIs.
- Current online production dependency audit: zero vulnerabilities. The full online development audit reports seven entries (four high through `braces`, `micromatch`, `fast-glob`, and OpenSpec; three moderate through `moment`, Obsidian, and the lint plugin). These dependencies were already present: the lockfile diff changes only the two root version fields. They are not included in the runtime bundle. No forced downgrade or unrelated dependency remediation was performed; the full dev audit is not a clean gate.
- Strict OpenSpec validation: nine items pass, zero failures. Release metadata, three-asset staging, and `git diff --check` pass. No tag or release was published.

Staged candidate in `release/0.4.0/`:

- `main.js`: `b09623e16ab62d5440ab397559fe0f0842a56a026790c7de8ea9e118edbb6c19`
- `manifest.json`: `0b61765611876bb97fe558fac777c7c93eae20613c7d8283f978db58a5756cfa`
- `styles.css`: `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9`

Owner-assisted packaged acceptance is **in progress on 2026-10-03**, using the staged candidate and screenshots/reports from Obsidian desktop. The original disposable vault `/private/tmp/soundings-040-acceptance.VgA5d4` disappeared after the owner's laptop restart. Completed screenshot evidence is retained in this chat, but its files cannot be rechecked. Testing resumed in the persistent, Git-ignored `/Users/mc3891/Development/kormilo/soundings/acceptance-vault`, with byte-matched staged assets and fresh synthetic fixtures. No personal/work vault was modified.

- Owner confirmed version 0.4.0. Screenshot shows saved TXT/VTT enabled and SRT initially disabled; explicit SRT enablement and a fresh 13-candidate, zero-selected plan passed. Owner confirmed enablement, retained caption timing, and folded display survived plugin off/on. Tab/Space selection changed the fresh plan to one selected.
- Screenshots verify all four plain/folded and omit/retain combinations, faithful multiline/repeated captions, preserved overlapping timing, collapsed callout rendering and expansion, full-text search matches, and inert adversarial HTML/entities/fences/callout/embed text through the final sentinel. The original vault's folded filenames were reversed relative to selected timestamp settings; evidence is classified by actual output, not filename.
- Persistent-vault companion enrichment targets `Meetings/Plain-retain.md` (actually folded/retain, schema 2). The reviewed summary and full-path source link were published separately. Owner's screenshot confirms return navigation and one backlink. Transcript SHA-256 before/after publication stayed `eecdfa0b4e9559272f0060b84b232f2081ab8aee7e09630d00b18d525eaa2d0e`.
- Screenshots verify malformed/missing-separator sources are unreadable, empty and oversized sources are blocked, no failure selection controls appear, and conversion is disabled with no selected eligible item. Cross-format `Shared.txt`/`Shared.srt` destinations are ambiguous; `Blocked.srt` cannot overwrite its existing note. Owner reports no matches for hidden/configuration-folder `Excluded` fixtures.
- CLI-assisted changes were guarded by the exact persistent vault path and used Obsidian vault/plugin APIs while the owner kept the reviewed modal open. Changing only transcript display produced `Settings changed after preview`; no destination was created and all 16 protected hashes still matched. Intentionally appending a synthetic source marker then produced `Source changed after preview`. Creating an absent protected destination after a fresh review produced `Destination already exists`; its SHA-256 remained `df865d21c45d8021fe8caed2240b8ae6595894916419b2bf388121bac0405493`. The synthetic source modification is intentional test setup, not a plugin mutation.
- Owner closed a selected `Plain-omit.srt` plan without converting; filesystem verification confirms no `Plain-omit.md` was created. This verifies abandoning review, not cancellation during active conversion.

- Natural cancellation rehearsals finished before the owner could cancel: 80 synthetic 565 KB sources produced 80 notes containing their final caption markers, with unchanged source hashes; a further 12-file batch also completed too quickly. These are not cancellation passes.
- Controlled packaged cancellation passed with three fresh SRT fixtures. A temporary in-memory harness delayed only the first validation read during conversion for 15 seconds, leaving scans and released asset bytes unchanged. The owner clicked Cancel remaining; screenshots show three canceled outcomes and filesystem verification confirms zero destinations. Hooks restored after the run. This is an assisted delayed-I/O check, not an unmodified-speed cancellation measurement.
- Controlled packaged disable/unload passed using the same three still-unconverted fixtures: the first validation read waited 15 seconds and the harness called Obsidian's disable-and-save API after one second. The owner observed the progress modal close. Probe results confirm started/delayed/disabled/finished/restored with no error, the plugin unloaded, and zero destinations. Soundings was subsequently re-enabled and probe state removed. The harness changed only temporary runtime method wrappers, not implementation or release assets.
- Final installed/staged SHA-256 comparison matches all three accepted hashes above. Of the original 16 protected files, only `Meetings/Stale-plan.srt` differs, exactly matching the deliberately appended source-change test marker; the race destination remains unchanged. The enrichment source matched its pre-publication hash immediately after publication. A later check finds one added tab on the blank line before its title; removing that tab in memory reproduces the recorded hash exactly. This later edit is preserved, not reverted; transcript content and metadata are otherwise unchanged, and its attribution is not established by the test.

Recovery passed on 2026-10-04: after re-enable, the owner ran a fresh ordinary review and selected only `Cancellation-controlled/Controlled-1.srt`. Screenshot results show `created: 1` and `skipped: 107`, including the selected note's read-back verification. Filesystem inspection confirms the complete caption and retained timing in the new plain note; its source is unchanged, and the other two controlled destinations remain absent. An initial attempt had zero selected, explaining why no conversion occurred; selecting the intended file resolved it without a code change.

The named SRT packaged checks passed with the controlled-I/O caveats above recorded. On 2026-10-04, the owner explicitly approved publishing Soundings 0.4.0. Pre-publication review then identified an additional repository release-checklist requirement: exercise the candidate with a non-default configuration folder. `.soundings-acceptance` is prepared inside the persistent test vault with matching candidate assets and saved settings; this check remains pending before any tag/release mutation. Authorization is recorded, but release execution is still gated on that check.

The 2026-10-04 release recheck passed build/lint and all 523 tests, runtime audit, production dependency audit (zero findings), and strict OpenSpec validation. Lint initially scanned the ignored persistent vault's installed bundle; the tooling-only ESLint ignores now exclude `acceptance-vault/**` and `test-vault/**`, with no runtime asset change. Official Obsidian submission, requirements, developer-policy, and ownership documentation was rechecked. The existing 0.3.0 release remains published; 0.4.0 is not tagged or released yet.

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

Packaged desktop acceptance **passed on 2026-10-02** with the owner operating Obsidian and supplying screenshots. The initial sandboxed CLI probe could not connect, and computer-use permissions were unavailable. A later CLI connection outside the sandbox reached the running disposable vault for the stale-plan settings change.

A disposable acceptance vault was prepared at `/private/tmp/soundings-030-acceptance.NgrOT5` with the exact three staged assets in `.soundings-test-config/plugins/soundings/` and their hashes verified against the candidate. It includes plain text, multi-speaker WebVTT, adversarial Markdown, a protected existing destination, and hidden/config-directory exclusion fixtures. `Protected-hashes.json` records the seven source/protected-file baselines; `Acceptance.md` contains the checklist. Configure that vault to use `.soundings-test-config` before enabling the plugin. The initially prepared `Config` folder was renamed after the owner's screenshot confirmed that Obsidian requires a dot-prefixed configuration folder; the protected baseline path was updated without changing fixture bytes. No personal or work vault was modified.

Owner-assisted packaged acceptance passed on Obsidian desktop 1.13.7, using the staged candidate in the disposable vault above:

- **Settings default: pass.** The owner's screenshot shows Transcript display set to Plain, observation off, and the custom configuration directory named in exclusions.
- **Plain conversion: pass.** The owner reported successful conversion; disk inspection confirms `Meetings/Plain.md` has schema 1, the reserved sections, and the original text in a literal fence.
- **Folded display: pass.** The owner confirmed the callout starts collapsed and expands to show speakers and timestamps. The screenshot and disk inspection show Alice and Bob inside one Full Transcript callout, with retained times and schema 2.
- **Search: pass.** The owner's screenshot shows the generated Folded note returned for `silver lantern`.
- **Containment: pass.** The owner's reading-view screenshot shows all adversarial text, including the final `velvet anchor` sentinel, inside the callout's literal fence.
- **Outline: recorded.** The owner's screenshot shows Transcript in Outline; Alice and Bob are visible inside the callout but absent from Outline. This is the anticipated callout-heading limitation.
- **Manual enrichment: pass.** The owner reported successful companion publication. Disk inspection confirms `Meetings/Folded - Enrichment.md` exists with the entered test summary, all reserved enrichment sections, and the full-path backlink.
- **Protected files: pass.** SHA-256 comparison against `Protected-hashes.json` after the stale-plan check confirms all seven baseline files unchanged, including all sources and the existing collision note. All three installed plugin assets still match the accepted staged hashes.
- **Review exclusions/collisions: pass.** The owner's five-candidate review screenshot shows only the fresh stale-plan source eligible, four existing destinations blocked, and no hidden/config-directory fixtures offered.
- **Stale plan: pass.** With the owner's folded-callout preview still open and the fresh source selected, the CLI invoked Soundings' validated `setSettings` method in the named disposable vault to change display to plain. The owner clicked Convert selected without refreshing; the results screenshot shows `stale: 1` and `Settings changed after preview.` Disk inspection confirms no `Meetings/Stale-plan.md` was created. The settings shortcut was blocked by the modal, so this check uses the real plugin settings method through the CLI rather than the dropdown.

All named packaged desktop checks are complete. Pull request `Kormiloio/Soundings#8` was opened for the accepted candidate. Its required `Build, Audit & Test` check passed in 46 seconds in workflow run `37089996415` at candidate commit `8554f86`. Subsequent verification-only commits also passed CI; final candidate `474fa60` passed in workflow run `37090448713` before merge.

The owner approved merge and publication. PR #8 merged at `8993112497938f0e75ce8d32f7f74aac7136bed8`; bare tag `0.3.0` points to that commit. The tag push was accepted through the repository-admin bypass of the restricted tag-creation rule. Release workflow run `37090532396` completed successfully and published Soundings 0.3.0 at 2026-10-03 02:39:57 UTC (2026-10-02 in America/New_York).

- Published release: `https://github.com/Kormiloio/Soundings/releases/tag/0.3.0`, neither draft nor prerelease, with exactly `main.js`, `manifest.json`, and `styles.css`.
- A fresh download into `/private/tmp/soundings-030-published.AkWgMr` reproduces all three accepted SHA-256 hashes above.
- `gh attestation verify` succeeded for each asset, enforcing `refs/tags/0.3.0`, source commit `8993112497938f0e75ce8d32f7f74aac7136bed8`, and signer workflow `Kormiloio/Soundings/.github/workflows/release.yml`.
- Release notes contain only the dated 0.3.0 changelog section.
- GitHub API snapshots before and after publication confirm all eight prior releases retain their target values, asset IDs, names, sizes, and SHA-256 digests. No previous release was modified.
- Official Obsidian submission, plugin requirements, developer policies, and ownership documentation were rechecked immediately before publication.

On 2026-10-03 the owner supplied the completed Community scorecard after the requested 0.3.0 rescan. This result is owner-reported; it was not independently read from the authenticated Community page.

- **Health: Excellent.** Readme, license, contributing guide, and description present; the scorecard reports active maintenance and 17 installations.
- **Review: Passed.** All six scans passed: verified `main.js` and `styles.css` artifact attestations, no suspicious network patterns, no vulnerable dependencies, no obfuscation, and byte-for-byte reproduction of the released `main.js`.
- **Remaining disclosure:** malware scanning is unavailable.
- **Remaining other item:** vault enumeration exposes vault file paths, which is expected for transcript discovery and disclosed in the README. No actionable warning was included in the supplied scorecard.

The release and Community gates are complete. The folded-transcript change is closed and archived as `2026-10-03-add-folded-transcript-callouts`, with its deltas merged into the main specifications.

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

## Structured TXT 0.4.1 Development Checkpoint (2026-10-06)

Change: `add-timestamped-speaker-txt`. This is an uncommitted development candidate, not a published release or a completed desktop acceptance claim. Runtime version metadata remains 0.4.0 intentionally until release preparation is authorized.

- `npm run check`: build, zero-warning lint, and 560 tests across 42 files pass.
- `npx openspec validate --all --strict`: all 10 changes/specs pass; long-requirement informational notices remain.
- `npm run audit:runtime`: passes without new runtime dependencies, network, telemetry, destructive vault APIs, or source-warning patterns.
- `npm audit --omit=dev`: zero vulnerabilities.
- `git diff --check`: passes.
- `npx vitest run tests/txt-layout.test.ts --reporter=verbose`: near-4.9 MB recognition/rendering plus two approximately 1 MB adversarial fallback inputs took 64.6 ms in the recorded desktop run, preserving every block. Timing is a local observation, not a cross-device guarantee.
- Coverage includes migration defaults, Unicode/multiline recognition, overlaps and repetition, whole-file fallback, encoding refusal, four display/timing combinations, literal containment, schema-2 companion publication, observation/inbox policy consistency, source/settings/captured-policy staleness, cancellation during read, destination races, read-back mismatch, and failure isolation. Existing TXT/VTT/SRT goldens and plugin unload tests remain green.
- The TXT delta carries the complete existing Versioned Markdown contract, with only its legacy plain-display compatibility scenario scoped to interpretations supported by 0.2.3. Main specs and active SRT deltas are unchanged; no predecessor review or closure is implied.

### Isolated Desktop Rehearsal

Staged vault: `test-vault/txt-layout-041`, separate from the previously installed acceptance/work vaults. It has only synthetic Recognized/Fallback TXT sources. Observation is off; TXT layout is opted in, with retain/folded output. Assets are copied from the checked build; the manifest still says 0.4.0, so it must not be mistaken for the published package.

| Staged file | SHA-256 |
| --- | --- |
| `.obsidian/plugins/soundings/main.js` | `9c08a3e44e3617577c97dd0a027722a9bba7af391a9ca35154de19260642d6b3` |
| `.obsidian/plugins/soundings/manifest.json` | `0b61765611876bb97fe558fac777c7c93eae20613c7d8283f978db58a5756cfa` |
| `.obsidian/plugins/soundings/styles.css` | `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9` |
| `Meetings/Recognized.txt` | `25b62913377c9ab26bec50d570a92797eb96031572476b4d0f081513619b594e` |
| `Meetings/Fallback.txt` | `f090be3a51b87d7792bcc38ef69aea8f5bdabe3323ba6981af4385436463588a` |

### Owner-Assisted Desktop Acceptance (2026-10-08 through 2026-10-09)

The named desktop checks passed in the isolated vault. Screenshots supplied by the owner are preserved locally in `test-vault/txt-layout-041-evidence/` (Git-ignored, not release assets). No existing installed work-vault plugin was replaced.

- Unselected review distinguished timestamped-speaker recognition from whole-file plain fallback (`recognized-fallback-plan.png`). Explicit conversion reported creation and read-back verification.
- Reading-view screenshots cover all four output combinations: `folded-retain.png`, `folded-omit.png`, `plain-retain.png`, and `plain-omit.png`. Speaker labels, multiline text, source order, overlapping times when retained, and both repeated captions remained visible.
- `collapsed-search.png` shows the transcript callout collapsed while vault search still finds its synthetic phrase.
- `fallback-render.png` shows the unfamiliar preamble, blank separator, timing syntax, and speaker label retained as one literal block. `default-plain.png` independently confirms the opt-out layout preserves the entire source as literal text rather than interpreting times or speakers.
- Schema-2 companion publication and its backlink were exercised (`companion.png`, `backlink.png`). These screenshots verify the published companion and navigation; they are not a historical before/after hash comparison of the transcript note.
- Repeat discovery refused existing destinations (`existing-destinations.png`). A marker note deliberately created after preview caused `blocked: 1`, with `Destination already exists` (`destination-race.png`). Its SHA-256 was identical before and after execution: `cd9d37fb731bc451d0f52a74033a5a64760984b49a364847da17b3cd89c5d513`.
- Deliberately changing only the synthetic `Stale-source.txt` after preview produced `stale: 1`, `skipped: 6`; the owner confirmed `Source changed after preview`. No `Stale-source.md` was created. This result was owner-reported, not screenshot-captured.
- Changing TXT layout through the macOS Obsidian Preferences menu while the reviewed plan remained open produced `stale: 1`, `Settings changed after preview` (`stale-layout.png`). No `Stale-layout.md` was created. The keyboard shortcut had not opened settings while the plan was active; the menu route worked.
- Controlled cancellation passed with three fresh `Cancel-pause-*.txt` fixtures (`cancel-click.png`, `cancel-results.png`): `canceled: 3`, `skipped: 15`, and no three corresponding destinations. With the owner's approval, a Console harness temporarily wrapped the public vault `readBinary` method for these exact paths in this named disposable vault. It restored the original method on the first matching read, before a 60-second delay, and had an idle restoration timeout. The owner clicked Cancel remaining during the delayed read. This is an assisted delayed-I/O check, not an unmodified-speed measurement; saved plugin assets were untouched.
- Earlier cancellation attempts are not passes: a 15-second delay expired before cancellation took effect and created three notes; another three-file batch was converted before the longer harness was installed. Those notes were left intact, and fresh names were used for the passing attempt.
- Final asset hashes match the staging table above. `Recognized.txt` and `Fallback.txt` still match their original hashes. `Folded-omit.txt`, `Plain-omit.txt`, `Plain-retain.txt`, and `Default-plain.txt` all match the original recognized fixture hash. The deliberately edited stale-source fixture is excluded from this unchanged-source claim.

The canceled sources matched their pre-run SHA-256 values exactly:

| Source | Before and after SHA-256 |
| --- | --- |
| `Meetings/Cancel-pause-1.txt` | `01d39444774dc1770e51d16cce4fdb60faa48d7a667321248a974bc5fe71ee0a` |
| `Meetings/Cancel-pause-2.txt` | `4890cdad7a31e9d230ed8efaab9e1b00ff64fef86b0c549b4972af1be50f653e` |
| `Meetings/Cancel-pause-3.txt` | `88669fba0a1508d2ef99aeb26d82c77fe0580da9dcaa002d6a798b2d66d0f4e8` |

Task 5.3 is complete with these recorded evidence limitations and controlled-I/O caveats. On 2026-10-09, the owner supplied the public Soundings listing showing Review: Passed and separately showing current version 0.4.0; the review screenshot is preserved as `predecessor-review-passed.png`. The owner explicitly approved preparing and publishing 0.4.1, and separately approved synchronization and archival of the completed SRT change. The eight main specs validate strictly after the SRT merge. The four official Obsidian release/policy pages linked in `docs/RELEASING.md` were rechecked on 2026-10-09. GitHub confirms default branch main. All ten existing release inventories were captured before release preparation; 0.4.0 assets still have their previously verified digests.

Release preparation is authorized, not publication proof. Version metadata and release notes are being prepared for 0.4.1. The final versioned package still requires the repository's custom-configuration-folder desktop check before tagging. No 0.4.1 tag, push, release, or network-backed enrichment has occurred at this checkpoint.

### Versioned Release Preparation (2026-10-09)

The SRT change was synchronized into all three main capabilities, strictly validated, and archived at `openspec/changes/archive/2026-10-09-add-srt-transcript-support/` with owner authorization. The 0.4.1 prerequisite task 5.4 is complete; publication itself remains a separate release-checklist gate.

- Package, lockfile, manifest, and compatibility map now agree on 0.4.1, retaining every prior compatibility entry and Obsidian 1.13.7 minimum.
- Fresh `npm ci`, `npm run check` (560 tests, 42 files), `npm run audit:runtime`, `npm audit --omit=dev` (zero vulnerabilities), `npx openspec validate --all --strict` (10 items), and `git diff --check` pass. Installation reports the existing development ESLint deprecation and fsevents install-script allow-list notice; no runtime dependency was added.
- `npm run release:prepare -- --tag 0.4.1` stages exactly three assets: main.js `9c08a3e44e3617577c97dd0a027722a9bba7af391a9ca35154de19260642d6b3`, manifest.json `80d4e9bfe5f7a0d2854b299c681c22f48c2fcb278c13269184325bb749824777`, styles.css `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9`. Runtime JavaScript/styles match the accepted development candidate; only manifest version metadata changed.
- Those exact staged assets were copied into the disposable vault's fresh `.soundings-config-041/plugins/soundings/`. This custom configuration path contains a synthetic `Private-config.txt` exclusion sentinel; the public `Meetings/Package-check.txt` is a fresh structured candidate. Observation remains disabled.

Final versioned package acceptance passed on 2026-10-09. Obsidian's UI requires a dot-prefixed override folder, so the newly prepared test configuration was renamed to `.soundings-config-041` before use. The owner entered that exact override and relaunched (`custom-config-setting.png`), confirmed installed version 0.4.1, and reported no matches for Private-config. The latter two observations were owner-reported rather than screenshot-captured. Fresh review showed one Package-check candidate, zero selected, recognized TXT, retained times, and folded display (`package-plan.png`). Explicit conversion reported one created and 18 skipped (`package-results.png`); the rendered note shows its exact retained range, speaker heading, and literal dialogue (`package-render.png`). Disk inspection confirms TXT schema 2, complete fenced content, and both fixture hashes unchanged: Package-check.txt `0ab918ba733fbdf397a1bde5ad1c9a8c2a2db095c0653f9b128efb6cf8bc0571`, private sentinel `94851a7e2906092af6d0b8d2d2e8cac52e514d8e942dfa5af3ea8eb3381d331e`. Installed assets match the staged hashes above. No private-sentinel destination was created. No work-vault configuration or prior release was modified. The unrelated `document-provider-compatibility` planning change remains outside this release's intended commit scope.

The final package is accepted for the already-authorized 0.4.1 publication. A protected-main PR, passing CI, bare tag, workflow success, downloaded asset hash comparison, attestation verification, and prior-release inventory comparison remain required before claiming publication verified.

### Published 0.4.1 Verification (2026-10-09)

- [PR #13](https://github.com/Kormiloio/Soundings/pull/13) passed required Build, Audit & Test CI and merged through protected main as `96618ef6333eaed86b85b54f83a97b8936948934`. Local main matched origin/main; tracked files were clean. The unrelated untracked `document-provider-compatibility` planning directory was preserved and excluded from the release commit.
- A fresh production build from that merged commit reproduced all three accepted hashes above. Package/manifest version 0.4.1 and the compatibility map agree, and diff checks pass.
- Bare tag `0.4.1` points to that exact main commit. [Release workflow 38010931504](https://github.com/Kormiloio/Soundings/actions/runs/38010931504) passed its read-only build gates and attestation/publication job. The workflow reports an informational upcoming ubuntu-latest migration, not a verification failure.
- [Soundings 0.4.1](https://github.com/Kormiloio/Soundings/releases/tag/0.4.1) is public, neither draft nor prerelease, and contains exactly main.js, manifest.json, and styles.css. GitHub records publication at 2026-10-10T00:53:55Z (2026-10-09 local time).
- Fresh downloads into ignored `release/0.4.1-downloaded/` match all accepted SHA-256 hashes: main.js `9c08a3e44e3617577c97dd0a027722a9bba7af391a9ca35154de19260642d6b3`, manifest.json `80d4e9bfe5f7a0d2854b299c681c22f48c2fcb278c13269184325bb749824777`, styles.css `84ce64b426a6fac9eaf0f91010e1995fb52bcd97cf4c8235f47e7449f8a713e9`.
- `gh attestation verify` succeeds for each downloaded file with the expected repository, signer workflow `.github/workflows/release.yml`, source ref `refs/tags/0.4.1`, source digest `96618ef6333eaed86b85b54f83a97b8936948934`, and self-hosted runners denied. Each exact-policy check returns one verified attestation.
- Pre/post publication API inventories confirm all ten prior release IDs, asset IDs, names, and digests remain unchanged. No prior release or asset was modified.

GitHub publication is verified. The owner-controlled Community rescan for 0.4.1 is still pending; the earlier Review: Passed screenshot covers 0.4.0 only. The completed TXT change remains active until its spec synchronization/archive is explicitly authorized. No Community account or policy action was automated.

### Community Review and Change Closure (2026-10-09)

The owner supplied a new public Soundings listing screenshot showing current version 0.4.1, an Updates entry for 0.4.1, Health Excellent, and Review Passed. It is preserved locally as `test-vault/txt-layout-041-evidence/community-041-passed.png`. This confirms the public listing's release version and review status; it is not a claim about private administrative review details. The Updates date is Oct 10, consistent with the release's UTC publication date, while the local release date is Oct 9.

The owner explicitly authorized recording this result, synchronizing the completed TXT delta, and archiving the change. Conversion-planning gains one review-bound TXT interpretation requirement. Transcript-conversion gains two structured TXT requirements and updates faithful plain-text conversion and the legacy plain-display compatibility scenario. All five delta requirement blocks match the synchronized main specs, and every unrelated requirement remains unchanged, including VTT/SRT behavior. All eight main specs pass strict validation.

All 15 tasks and planning artifacts were complete before archival. The change, including its `.openspec.yaml`, is archived at `openspec/changes/archive/2026-10-09-add-timestamped-speaker-txt/`. The earlier pending statements above are historical checkpoints, now resolved. No runtime code, immutable release, Community account action, or unrelated document-provider planning was changed during closure.
