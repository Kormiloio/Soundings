# Desktop installation

Soundings requires Obsidian desktop 1.13.7 or later. Foundation acceptance passed in a disposable macOS vault; rehearse with synthetic files and a backed-up disposable vault before enabling it against important content.

The foundation release supports Obsidian desktop only. Do not install it on Android, iOS, or iPadOS; mobile support requires a separate future change.

## Build

1. Install Node.js 20 or later.
2. Run `npm install` in the Soundings repository.
3. Run `npm run check` and `npm run audit:runtime`.

The build produces `main.js`. The other runtime files are `manifest.json` and `styles.css`.

## Manual private installation

1. Create or select an Obsidian desktop vault. Use a disposable vault for the first rehearsal.
2. Open that vault's configured Obsidian configuration folder (normally `.obsidian`), then create `plugins/soundings/` inside it.
3. Copy `main.js`, `manifest.json`, and `styles.css` into that folder.
4. In Obsidian desktop, open **Settings → Community plugins**, reload installed plugins, and enable **Soundings**.
5. Add synthetic `.txt` and `.vtt` files. Do not use confidential transcripts during acceptance testing.
6. Run **Soundings: Scan vault for transcripts** from the command palette.
7. Review source and destination paths, select only synthetic eligible files, and convert them.

## Optional observation settings

After the manual workflow is familiar, open **Settings → Soundings** to opt in to **Observe new transcripts**. Observation is disabled by default. Add one vault-relative folder per line under **Observation roots**, or leave the list empty to observe the whole otherwise-permitted vault. Invalid roots are rejected; hidden folders, the configured Obsidian directory, Soundings state, and excluded folders remain unavailable.

Observation runs only while Obsidian and the plugin are open. It queues content-free evidence in memory, shows a local notice, and requires **Soundings: Review transcript inbox** plus an explicit selection before conversion. Disabling the setting or plugin cancels pending checks and clears the inbox.

## Removal

Disable Soundings, then remove its plugin folder from the disposable vault. Generated Markdown notes are normal vault files and are never deleted automatically; review and remove them manually if desired.
