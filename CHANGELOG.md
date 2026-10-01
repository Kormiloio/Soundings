# Changelog

## 0.2.3 — 2026-10-01

Soundings `0.2.3` is a small corrective release. It behaves exactly like `0.2.2` for you, and it clears the one warning Obsidian's automated Community review reported.

### 🔍 Community review
- **Type-safety warning fixed**: Obsidian's scanner flagged that settings validation passed an untyped value into a typed check (`no-unsafe-argument` in `src/core/settings.ts`). The values were already validated, so nothing was unsafe at runtime, but the check now proves the type instead of assuming it. Accepted and rejected settings are unchanged.
- **Same review rules, run locally**: every change is now linted with Obsidian's official ESLint rules and type-aware TypeScript checks before it can be merged or released, so this kind of warning cannot slip through again.

### 📄 Project
- Added a contributing guide covering setup, safety rules, the spec-first workflow, and private security reporting.

### Notes
- No change to how transcripts are found, converted, or written. Existing notes are never modified.

## 0.2.2 — 2026-09-30

Soundings `0.2.2` is a hardening patch for `0.2.1`, from a full code and security review. It adds no features, no network access, and no new way of changing your vault. Every new refusal leaves your files untouched and explains why.

### 🔒 Safety and stability
- **No more freezes on hostile captions**: A small crafted `.vtt` file could freeze Obsidian during a scan, or, with observation on, as soon as it synced in. Caption markup is now read in a single pass, and 1 MB adversarial files classify in milliseconds. A cue tag longer than 256 characters, or a tag containing a second `<` (for example `a <<i>x</i>`), is refused. A lone `<` is still kept as text.
- **One bad file no longer stops a batch**: A transcript that fails to render is reported as failed and the remaining selected files still convert.
- **Letter case and accents count as the same name**: `Bar.txt` next to an existing `bar.md`, or `Foo.txt` next to `foo.vtt`, is now blocked instead of shown as ready. The same applies to names that differ only in how accented characters are encoded. Soundings also checks storage directly just before writing, so a file Obsidian has not indexed still blocks conversion.
- **No hidden notes**: A name that would become a dot-file after cleanup (for example `?.env.txt` → `.env.md`) is refused, because Obsidian would hide it.
- **Disabling Soundings stops everything**: Dialogs close when the plugin unloads, and a review or enrichment form left open can no longer write afterwards. Closing the progress dialog with Escape now cancels the run.

### 🗣️ WebVTT faithfulness
- Text after a closing `</v>` no longer goes to the previous speaker.
- Tags that merely start with `v`, such as `<video>`, are refused like other unknown tags instead of being silently removed.
- A second, genuine U+FEFF character at the start of a file is kept.

### 👀 Observation
- Observation starts after Obsidian finishes loading the vault, so existing transcripts are no longer re-queued on every launch.
- New notes, images, and other non-transcript files are filtered by path alone, so sync bursts no longer make Soundings "busy".
- Changing settings other than observation on/off or observation roots keeps the inbox.

### 📝 Notes and enrichment
- Speaker and title headings escape `%`, `$`, `=`, `~`, and `^`, so a speaker named `%%` cannot hide the rest of the transcript and `$5 … $10` does not render as math. Generated Markdown source changes only for headings that contain these characters.
- Invisible control characters in filenames are written as `\uXXXX` escapes in frontmatter.
- In manual enrichment, typed lines such as `~~~`, a backtick fence, `---`, or `===` stay visible text and no longer change the companion note's sections.
- Manual enrichment is refused for a note whose name contains `[ ] | # ^ < >`, because the backlink could not point at it safely. Rename the note first.

### ⚙️ Settings
- Saved settings with the wrong type (for example `"false"` as text) reset to safe defaults field by field, with a notice naming them. A malformed settings file no longer prevents the plugin from loading.

### 🧰 Release tooling
- The runtime audit now requires the bundle to load only `obsidian`, and blocks more network, code-loading, and destructive vault patterns.
- Release staging writes only to `release/<version>` and refuses symbolic links.

### Notes
- Existing notes are never modified. Only new conversions and new companion notes are affected.

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
