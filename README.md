# Soundings

Turn transcript files into safe, structured Markdown beside their originals in Obsidian.

This checkout contains the accepted 0.4.0 candidate. Packaged desktop acceptance passed and the owner approved publication; release verification is pending.

Soundings recursively finds `.txt`, Zoom-style `.vtt`, and explicitly enabled `.srt` transcripts already stored in your vault. It shows a review plan, lets you choose eligible files, and creates Markdown notes without moving, renaming, deleting, or overwriting existing content.

## Requirements

- Obsidian desktop 1.13.7 or later.
- macOS, Windows, or Linux desktop. Soundings does not support Android, iOS, or iPadOS.
- No account, payment, API key, external program, or network service is required.

## Installation

### Obsidian Community plugins

Soundings is available in the Obsidian Community directory:

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
3. Review the classification counts, source paths, destination paths, and statuses. Nothing is selected automatically.
4. For a large plan, search source or destination paths and filter by classification. The selected count continues to include selected eligible items hidden by the current search or filter.
5. Select eligible transcripts individually, or use **Select all eligible shown** to select only the eligible rows currently visible. **Clear selection** clears every selection, including hidden ones.
6. Select **Convert selected** and review the results before closing the window. Refreshing the plan starts a fresh review with nothing selected.

Soundings creates each note beside its source. If the intended Markdown destination already exists, Soundings reports the collision and leaves that file untouched.

### Optional SRT input

Enable **Convert .srt transcripts** under **Settings → Soundings** before scanning SubRip files. SRT is off by default, and upgrading preserves your saved format choices. **Caption timestamps** applies to both VTT and SRT; **Transcript display** offers the same plain or folded output. SRT speaker labels and formatting tags remain literal text rather than inferred people or rendered HTML. See [Supported transcripts](docs/SUPPORTED_TRANSCRIPTS.md) for the exact subset and safe refusals.

### Optional transcript inbox

In **Settings → Soundings**, you can opt in to **Observe new transcripts** and optionally list vault-relative **Observation roots**, one per line. Empty roots mean the whole otherwise-permitted vault. While Obsidian and Soundings are open, newly created supported files are checked after they stabilize and queued in memory. Soundings shows a coalesced local notice; run **Soundings: Review transcript inbox** to recheck the queued paths in the standard review plan. The plan starts with zero selected items and never converts automatically.

Observation is off by default. It starts only after Obsidian finishes loading the vault, so existing files are not re-queued at startup. It does not run while Obsidian is closed. Disabling Soundings or observation, or changing the observation roots, cancels pending checks and clears the in-memory inbox; other settings changes keep it. A later manual vault scan recovers files missed while observation was inactive.

### Manual enrichment (companion notes)

With a Soundings-generated transcript note active, run **Soundings: Add manual enrichment** from the command palette. Enter summary, decisions, action items, and follow-ups locally, review the exact companion destination and rendered Markdown, then publish. Soundings creates a separate ` - Enrichment.md` note beside the transcript note and links back to it. It never edits the transcript source, the transcript note, or an existing companion file. Lines you type that would change the note's layout (such as `~~~`, a backtick fence, `---`, or `===`) are escaped so they stay visible as text. Enrichment is unavailable for a note whose name contains `[ ] | # ^ < >`, because the backlink could not point at it safely; rename the note first.

## What Soundings creates

Each generated Markdown note contains versioned frontmatter, a title, reserved sections for future enrichment, and a deterministic transcript body. Soundings does not claim to generate summaries, decisions, or action items in this release.

For the exact format and parsing rules, see [Supported transcripts](docs/SUPPORTED_TRANSCRIPTS.md).

## Safety and privacy

- Every original transcript is preserved byte-for-byte.
- Existing Markdown files are never overwritten.
- Discovery is non-mutating and conversion requires an explicit reviewed selection.
- Transcript and note content remains on your device and inside the active vault.
- Soundings accesses vault content through Obsidian's public vault APIs; it does not access files outside the active vault.
- To find transcripts in nested folders, Soundings enumerates file paths throughout the active vault. It reads file content only for enabled `.txt`, `.vtt`, or `.srt` candidates that remain after configuration-folder, hidden-folder, Soundings-state, user-exclusion, and size checks.
- Soundings makes no network requests, includes no client-side or server-side telemetry, and contains no advertising.
- Soundings requires no credentials, account, payment, or external service.
- The optional inbox retains only vault-relative paths, formats, sizes, and content hashes in memory. It does not persist transcript bodies or inbox state.

See [Privacy and data handling](docs/PRIVACY.md) for the complete disclosure.

## Settings

Soundings can enable or disable `.txt`, `.vtt`, and `.srt` candidates (SRT defaults off), exclude vault-relative folders, limit source size, optionally infer project metadata from a configured folder root, and opt in to observation with validated vault-relative roots. You can also configure the output profile for generated notes:

- **Title pattern:** Choose between the source name or the parent folder and source name.
- **Destination pattern:** Choose between the source name or appending a "Note" suffix.
- **Enabled sections:** Toggle the visibility of Summary, Decisions, Action Items, and Follow-ups sections.
- **Static tags:** Add a list of validated YAML tags to every generated note.
- **Caption timestamps:** Choose whether to omit or retain VTT/SRT cue timings. Timestamp-like text in TXT is not interpreted.
- **Transcript display:** Keep the default plain transcript or choose a folded callout labeled **Full Transcript**. Click to expand it; its contents remain searchable. This affects new conversions only. Existing notes are never rewritten.

Hidden folders, Soundings state, user exclusions, and the active vault's configured Obsidian configuration folder remain excluded from scans and observation, even when that folder is not named `.obsidian`.

## Known limitations

- Soundings is desktop-only; packaged 0.4.0 acceptance passed on Obsidian 1.13.7.
- Existing `.md` destinations are always blocked, including previous Soundings output.
- Updating a source does not update an existing generated note.
- Plain-text transcripts are preserved without speaker inference.
- WebVTT support is intentionally strict and may reject provider-specific extensions.
- SRT supports a conservative numbered-cue UTF-8 subset; unsupported encodings/dialects and ambiguous cue boundaries are refused rather than repaired.
- The default maximum source size is 5 MB.
- Automatic conversion, durable/background inbox processing, AI-generated enrichment, audio transcription, external folders, and mobile platforms are not supported.

## Support

Report bugs or request features through [GitHub Issues](https://github.com/Kormiloio/Soundings/issues), and see [Contributing](CONTRIBUTING.md) for development guidance and private security reporting. Do not include confidential transcript text, generated note bodies, credentials, or private vault paths in an issue.

## Development

Soundings is written in TypeScript and requires Node.js 20.19.0 or later for development.

```bash
npm install
npm run check
npm run audit:runtime
npm run spec:validate
npm run release:prepare -- --tag <version>
```

Generated `main.js` and release staging files are intentionally not committed. See [Release and Community submission](docs/RELEASING.md) for the complete maintainer workflow.

## License

Soundings is available under the [MIT License](LICENSE).
