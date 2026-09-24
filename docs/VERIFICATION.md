# Foundation verification record

**Last updated:** 2026-09-23

## Automated verification

- Production build and TypeScript checks: passed.
- Automated tests: 96 passed across 15 suites, including Community source-warning contracts, declarative settings, configurable vault-directory safety, release-readiness success, and fail-closed cases.
- Runtime audit: passed; no network, telemetry, Node filesystem, credential, destructive vault API, or actionable Community source-warning pattern was detected.
- npm production dependency audit: zero vulnerabilities reported.
- Golden conversions: representative UTF-8 plain text and Zoom-style WebVTT passed byte-deterministic output checks.
- Safety integration: source changes, missing sources, existing destinations, concurrent destination creation, malformed input, mismatched read-back, cancellation, and plugin ownership passed.

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

The automated Community gate is clean. The listing remains unpublished only until the repository owner performs the final **Publish** action.

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
