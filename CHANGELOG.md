# Changelog

## 0.2.1 — 2026-09-29

Soundings `0.2.1` is a corrective patch for `0.2.0`. It makes WebVTT speaker attribution faithful, keeps manual-enrichment drafts safe, and ships the enrichment hardening that was verified for, but missing from, the published `0.2.0` assets.

### 🗣️ WebVTT faithfulness
- **Per-speaker attribution**: A caption cue containing several voices (for example `<v Alice>…` then `<v Bob>…`) now produces one block per speaker. In `0.2.0` every line in such a cue was attributed to the first speaker.
- **Header metadata**: Files with `Kind:` or `Language:` lines under `WEBVTT` (common in YouTube captions) are now eligible instead of unreadable.
- **Cue separators**: A line containing only spaces between cues now separates them; it no longer merges two cues into one block.
- **Character references**: `&amp;lt;` now renders as `&lt;` instead of being decoded twice.

### ✍️ Manual enrichment
- If publishing a companion note does not succeed (for example because the transcript note changed or the destination appeared), the form stays open with everything you typed. After a source change, Soundings re-checks the note before you review again.
- Source notes are identified only from their exact Soundings frontmatter (`type`, `source`, and a supported `soundings_version`), including notes whose metadata contains `---`.
- The companion backlink uses the full vault path, so same-named notes in different folders link correctly.

### 🔒 Release integrity
- Releases are built by a read-only job and published by a separate job with GitHub artifact attestations for `main.js`, `manifest.json`, and `styles.css`.
- Only bare version tags (for example `0.2.1`) publish releases, matching what Obsidian installs.

### Notes
- Existing notes are never modified. Only new conversions of multi-voice cues use the new per-speaker layout.

## 0.2.0 — 2026-09-29

Soundings `0.2.0` introduces configurable note output profiles, enhanced WebVTT transcript compatibility, pre-scan classification, and local manual companion notes.

### ✨ New Features

#### 🎛️ Configurable Output Profiles
You now have constrained control over how generated transcript notes are created. Instead of a fixed format, customize output in **Settings → Soundings**:
- **Flexible Naming**: Choose how your notes are titled and named. Use the source name alone or prefix it with the immediate parent folder to keep your vault organized.
- **Selective Content**: Choose which reserved placeholder sections (**Summary**, **Decisions**, **Action Items**, **Follow-ups**) appear in generated transcript notes.
- **Custom Tags**: Add static tags to every generated transcript note, making them easy to find via Obsidian search. Manual enrichment companion notes do not receive these tags.
- **Timestamp Control**: For WebVTT transcripts, choose whether to omit or retain normalized start and end times in your notes.

#### ✍️ Local Manual Companion Notes
Add structured review notes beside any generated transcript without external AI or network calls:
- Run **Soundings: Add manual enrichment** on any active Soundings transcript note.
- Record local summaries, decisions, action items, and follow-ups.
- Preview the exact destination (` - Enrichment.md`) and rendered Markdown before writing.
- Runs locally, creates only an absent companion, and never edits an existing file.

### 🛠️ Improved WebVTT Support & Discovery
We've overhauled the WebVTT parser to be more robust and an even better "first-pass" filter:
- **Greater Compatibility**: The parser handles a wider variety of WebVTT formats, including optional hour timestamps (`mm:ss.ttt`), unclosed voice tags, and multiple voice lines per cue.
- **Smarter Classification**: Parsing now happens during the discovery phase. The Review plan accurately tells you if a file is `Eligible` (ready for conversion), `Unsupported` (unsupported cue syntax), or `Unreadable` (malformed) *before* you start the process.

### 🔒 Safety & Performance
- Zero changes to original transcripts (preserved byte-for-byte).
- Zero overwriting of existing notes.
- The recorded 5,000-file rehearsal completed with zero source mutations; timings are documented in `docs/VERIFICATION.md`.
