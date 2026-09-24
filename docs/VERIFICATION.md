# Foundation verification record

**Last updated:** 2026-09-23

## Automated verification

- Production build and TypeScript checks: passed.
- Automated tests: 76 passed across 13 suites, including release-readiness success and fail-closed cases.
- Runtime audit: passed; no network, telemetry, Node filesystem, credential, or destructive vault APIs detected.
- npm production dependency audit: zero vulnerabilities reported.
- Golden conversions: representative UTF-8 plain text and Zoom-style WebVTT passed byte-deterministic output checks.
- Safety integration: source changes, missing sources, existing destinations, concurrent destination creation, malformed input, mismatched read-back, cancellation, and plugin ownership passed.

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
