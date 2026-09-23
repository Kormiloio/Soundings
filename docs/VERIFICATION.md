# Foundation verification record

**Last updated:** 2026-09-23

## Automated verification

- Production build and TypeScript checks: passed.
- Automated tests: 60 passed across 12 suites.
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
