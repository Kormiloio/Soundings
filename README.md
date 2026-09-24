# Soundings

Turn transcript files into safe, structured Markdown beside their originals in Obsidian.

Soundings recursively finds `.txt` and Zoom-style `.vtt` transcripts already stored in your vault. It shows a review plan, lets you choose eligible files, and creates Markdown notes without moving, renaming, deleting, or overwriting existing content.

## Requirements

- Obsidian desktop 1.13.7 or later.
- macOS, Windows, or Linux desktop. Soundings 0.1.0 does not support Android, iOS, or iPadOS.
- No account, payment, API key, external program, or network service is required.

## Installation

### Obsidian Community plugins

After Soundings is accepted into the Obsidian Community directory:

1. Open **Settings → Community plugins** in Obsidian desktop.
2. Select **Browse** and search for **Soundings**.
3. Select **Install**, then **Enable**.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the matching [GitHub release](https://github.com/Kormiloio/Soundings/releases).
2. Create `<your-vault>/.obsidian/plugins/soundings/`.
3. Copy all three downloaded files into that folder.
4. Reload Obsidian, then enable **Soundings** under **Settings → Community plugins**.

Use a disposable vault with synthetic transcripts for your first rehearsal. Back up important vaults before installing any community plugin.

## First use

1. Put a synthetic `.txt` or `.vtt` transcript anywhere in a disposable vault.
2. Select the waves icon labeled **Scan vault for transcripts** in the left ribbon. You can also run **Soundings: Scan vault for transcripts** from the command palette.
3. Review every source path, destination path, and status. Nothing is selected automatically.
4. Select only the eligible transcripts you want to convert.
5. Select **Convert selected** and review the results before closing the window.

Soundings creates each note beside its source. If the intended Markdown destination already exists, Soundings reports the collision and leaves that file untouched.

## What Soundings creates

Each generated Markdown note contains versioned frontmatter, a title, reserved sections for future enrichment, and a deterministic transcript body. Soundings does not claim to generate summaries, decisions, or action items in this release.

For the exact format and parsing rules, see [Supported transcripts](docs/SUPPORTED_TRANSCRIPTS.md).

## Safety and privacy

- Every original transcript is preserved byte-for-byte.
- Existing Markdown files are never overwritten.
- Discovery is non-mutating and conversion requires an explicit reviewed selection.
- Transcript and note content remains on your device and inside the active vault.
- Soundings accesses vault content through Obsidian's public vault APIs; it does not access files outside the active vault.
- Soundings makes no network requests, includes no client-side or server-side telemetry, and contains no advertising.
- Soundings requires no credentials, account, payment, or external service.

## Settings

Soundings can enable or disable `.txt` and `.vtt` candidates, exclude vault-relative folders, limit source size, and optionally infer project metadata from a configured folder root. Hidden folders and Obsidian's configuration folder remain excluded.

## Known limitations

- Version 0.1.0 is desktop-only.
- Existing `.md` destinations are always blocked, including previous Soundings output.
- Updating a source does not update an existing generated note.
- Plain-text transcripts are preserved without speaker inference.
- WebVTT support is intentionally strict and may reject provider-specific extensions.
- The default maximum source size is 5 MB.
- Automatic conversion, AI enrichment, audio transcription, external folders, and mobile platforms are not supported.

## Support

Report bugs or request features through [GitHub Issues](https://github.com/Kormiloio/Soundings/issues). Do not include confidential transcript text, generated note bodies, credentials, or private vault paths in an issue.

## Development

Soundings is written in TypeScript and requires Node.js 20 or later for development.

```bash
npm install
npm run check
npm run audit:runtime
npm run release:prepare
```

Generated `main.js` and release staging files are intentionally not committed. See [Release and Community submission](docs/RELEASING.md) for the complete maintainer workflow.

## License

Soundings is available under the [MIT License](LICENSE).
