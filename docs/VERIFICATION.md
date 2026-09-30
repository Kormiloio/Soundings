# Foundation verification record

**Last updated:** 2026-09-29

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
