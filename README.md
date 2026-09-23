# Soundings

Soundings is a local-first Obsidian community plugin that turns transcript files already placed anywhere in a vault into safe, structured Markdown notes beside their originals.

**Tagline:** Turn transcripts into navigable knowledge.

## Status

Foundation implementation and desktop acceptance are complete. The first release is desktop-only, requires Obsidian 1.13.7 or later, and has been verified in a disposable vault on macOS arm64. Android, iOS, and iPadOS remain outside the release scope.

## Foundation scope

- Discover `.txt` and Zoom-style `.vtt` transcripts recursively through Obsidian's vault API.
- Preview eligible files and collisions before writing.
- Create a Markdown note beside each selected transcript without changing the source.
- Add useful frontmatter and deterministic transcript structure.
- Support Obsidian desktop 1.13.7 or later; the recorded real-app acceptance baseline is macOS arm64.
- Keep all processing offline and inside the vault.

AI summaries, decisions, action items, and cross-vault entity linking are planned as later, separately approved capabilities.

## Development

```bash
npm install
npm run check
npm run audit:runtime
```

See `docs/INSTALLATION.md` for disposable-vault installation and `docs/SUPPORTED_TRANSCRIPTS.md` for the exact conversion contract.

## Documents

- Product requirements: `docs/PRD.md`
- Project rules and roadmap: `openspec/project.md`
- Initial change: `openspec/changes/define-transcript-conversion-foundation/`
- Verification record: `docs/VERIFICATION.md`

## Safety defaults

- Preserve every original transcript.
- Never overwrite an existing Markdown note.
- Require a reviewed selection for initial batch conversion.
- Disable automatic conversion by default.
- Make no network requests and collect no telemetry.

## Known limitations

- Existing `.md` destinations are always blocked, including previous Soundings output.
- Source updates are not synchronized into an existing generated note.
- Plain-text transcripts are preserved without speaker inference.
- WebVTT support is intentionally strict and may reject provider-specific extensions.
- The conservative 5 MB source limit applies to the desktop foundation release.
- Android, iOS, and iPadOS are not supported by the first release.
- Automatic conversion, AI enrichment, audio transcription, and external folders are not implemented.
