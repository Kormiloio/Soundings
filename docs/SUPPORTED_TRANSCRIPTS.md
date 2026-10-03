# Supported transcript rules

## Plain text (`.txt`)

- Encoding: strict UTF-8 or UTF-8 with a byte-order mark.
- Normalization: removal of one leading BOM (a second U+FEFF is kept as content) and CRLF/CR line endings converted to LF.
- Preservation: line order, blank lines, punctuation, Unicode, and repetition remain intact.
- No speaker, task, decision, topic, or identity inference is performed.
- Empty or invalid UTF-8 files are refused.

## WebVTT (`.vtt`)

- A valid `WEBVTT` signature is required.
- Hour-based (`hh:mm:ss.ttt`) and hourless (`mm:ss.ttt`) timestamps, cue identifiers, and cue settings are accepted.
- Header metadata lines directly below `WEBVTT` (for example `Kind:` and `Language:`) are ignored up to the first blank line.
- A line that is empty or contains only spaces or tabs separates cues.
- Cue text remains ordered and repeated cues remain repeated.
- Explicit WebVTT voice spans become speaker headings. When one cue contains several voice spans, each span becomes its own block under its own speaker with the cue's timing; text before the first voice span, and text after a closing `</v>`, has no speaker. A voice tag is `v` followed by a space, a `.class`, or `>`; other tags that merely begin with `v` (such as `<video>`) are unknown tags and are refused.
- Character references (`&amp;`, `&lt;`, `&gt;`, `&lrm;`, `&rlm;`, `&nbsp;`) are decoded exactly once.
- Timing syntax and format-control records are omitted from note prose.
- A cue tag longer than 256 characters, or a tag containing a second `<` (for example `a <<i>x</i>`), is refused. A lone `<` with no closing `>` is kept as literal text.
- Unsupported style/region blocks, unknown tags (including inline karaoke timestamp tags such as `<00:00:01.500>` used by auto-generated captions), malformed cues, empty files, and invalid UTF-8 are refused rather than guessed.

## Generated Markdown

- The note is created beside its source by replacing only the final extension with `.md`.
- Source text is placed in dynamic literal fences so HTML, Markdown, links, and Obsidian embeds remain inert.
- Transcript display defaults to plain output. The optional folded callout uses `> [!quote]- Full Transcript` below `## Transcript`; every line, including blank lines, speaker headings, and retained timestamps, stays inside it. Source text remains literal, and the full transcript stays searchable in Obsidian. Existing notes are never rewritten.
- YAML metadata is versioned and safely encoded; C1 control characters and Unicode line/paragraph separators in names are written as `\uXXXX` escapes.
- Speaker and title headings escape Markdown punctuation and Obsidian inline syntax (`%%`, `$`, `==`, `~~`, `^`), so a speaker named `%%` cannot hide later text and `$5 … $10` does not render as math.
- Summary, Decisions, Action Items, and Follow-ups are reserved but never fabricated.
- An existing destination blocks conversion, including one that differs only by letter case (`bar.md` for `Bar.txt`) or Unicode composition. Soundings never converts over it.
- Two sources whose destinations differ only by letter case or Unicode composition (for example `Foo.txt` and `foo.vtt`) are both blocked as ambiguous.
- A cleaned-up name that would start with a period (for example `?.env.txt` → `.env.md`) is refused, because Obsidian hides such files.

## Size and platform status

The desktop foundation release requires Obsidian 1.13.7 or later and uses a conservative maximum of 5,000,000 bytes per transcript. Real Obsidian desktop vault-API acceptance passed on macOS arm64; see `VERIFICATION.md`. Android, iOS, and iPadOS are outside the first-release support scope.

## Optional observation

Observation applies the same enabled-format, size, hidden-folder, configured Obsidian directory, Soundings-state, and user-exclusion rules as a manual scan. Configured observation roots narrow that policy; they never broaden it. Path-only checks (format, enabled formats, exclusions, observation roots) run before any read, so other new files cost nothing. A created file must produce the same readable content identity twice within a bounded retry window before it is queued. Checking stops at once for excluded or oversized files; empty, unreadable, or unsupported files are rechecked within the window because they may still be being written. Files that already exist when Obsidian starts are not queued; use a manual scan for them.

Queued entries contain only the vault-relative path, format, byte length, and content hash in memory. Opening the inbox replans current files and destination collisions in the standard unselected review. No creation event opens a modal or converts a file automatically.
