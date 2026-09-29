## 🚀 Soundings v0.2.0

Soundings `0.2.0` introduces configurable note output profiles, enhanced WebVTT transcript compatibility, pre-scan classification, and local manual companion notes.

### ✨ New Features

#### 🎛️ Configurable Output Profiles
You now have full control over how your companion notes are created. Instead of a fixed format, customize output in **Settings → Soundings**:
- **Flexible Naming**: Choose how your notes are titled and named. Use the source name alone or prefix it with the immediate parent folder to keep your vault organized.
- **Selective Content**: Toggle specific enrichment sections on or off (**Summary**, **Decisions**, **Action Items**, **Follow-ups**).
- **Custom Tags**: Add static tags to every companion note you generate, making them easy to find via Obsidian search.
- **Timestamp Control**: For WebVTT transcripts, choose whether to omit or retain normalized start and end times in your notes.

#### ✍️ Local Manual Companion Notes
Add structured review notes beside any generated transcript without external AI or network calls:
- Run **Soundings: Add manual enrichment** on any active Soundings transcript note.
- Record local summaries, decisions, action items, and follow-ups.
- Preview the exact destination (` - Enrichment.md`) and rendered Markdown before writing.
- 100% local, create-only, and non-mutating.

### 🛠️ Improved WebVTT Support & Discovery
We've overhauled the WebVTT parser to be more robust and an even better "first-pass" filter:
- **Greater Compatibility**: The parser handles a wider variety of WebVTT formats, including optional hour timestamps (`mm:ss.ttt`), unclosed voice tags, and multiple voice lines per cue.
- **Smarter Classification**: Parsing now happens during the discovery phase. The Review plan accurately tells you if a file is `Eligible` (ready for conversion), `Unsupported` (unsupported cue syntax), or `Unreadable` (malformed) *before* you start the process.

### 🔒 Safety & Performance
- Zero changes to original transcripts (preserved byte-for-byte).
- Zero overwriting of existing notes.
- Sub-millisecond scan overhead across large vaults.
