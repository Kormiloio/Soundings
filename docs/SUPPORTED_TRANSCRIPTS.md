# Supported transcript rules

## Plain text (`.txt`)

- Encoding: strict UTF-8 or UTF-8 with a byte-order mark.
- Normalization: removal of one leading BOM (a second U+FEFF is kept as content) and CRLF/CR line endings converted to LF.
- Preservation: line order, blank lines, punctuation, Unicode, and repetition remain intact.
- In the default Plain text layout, no speaker, task, decision, topic, or identity inference is performed.
- Empty or invalid UTF-8 files are refused.

### Timestamped speaker (0.4.1 development candidate)

Opt in with **TXT layout: Timestamped speaker**. The complete file must match this layout:

```text
11:01:03 --> 11:01:05
Alex Rivera: Silver lantern.
Second line stays here.

11:01:04 --> 11:01:06
Sam Lee: Welcome.
```

- Each blank-separated block has an exact two-digit `HH:MM:SS` time range, then a nonempty speaker label followed by a colon and spaces/tabs, nonempty dialogue, and optional nonblank continuation lines.
- Minutes/seconds are 00-59; end must be later than start. Spaces/tabs are accepted around the timing line and arrow. Leading/trailing blank separators and no final newline are accepted.
- Dialogue continuation whitespace, source order, overlap, repetition, Unicode, markup, and character references remain literal. Only the label/delimiter and structural time/separator lines are interpreted. Labels become safely escaped headings, not Person links.
- Fractions, counters, preambles, missing separators, missing labels/dialogue, invalid intervals, and midnight rollover fall back to the entire decoded source as one plain block. No partial interpretation is published. Invalid UTF-8 still fails decoding.
- Review distinguishes recognized blocks from whole-file fallback. **Transcript timestamps** retains original TXT time strings or omits generated timing lines; it does not rebase time. Both transcript displays work and recognized TXT uses schema 2. Default and fallback retain existing output/schema behavior.
- Existing notes are never rewritten. Changing layout invalidates reviewed plans and does not enable conversion or observation. Desktop acceptance and release remain pending.

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

## SubRip (`.srt`, published 0.4.0)

- Enable **Convert .srt transcripts** explicitly. New and existing saved profiles keep SRT disabled unless selected; TXT/VTT defaults and observation defaults are unchanged.
- Encoding: strict UTF-8, optionally one BOM; CRLF and CR normalize to LF. Legacy encodings and UTF-16 are not auto-detected.
- Each cue has a standalone positive decimal counter, a timing line such as `00:00:01,250 --> 00:00:03,000`, and one or more nonblank text lines.
- Hours have at least two digits, minutes/seconds are 00-59, and milliseconds have exactly three digits after a comma. Spaces or tabs separate the arrow from the times. The end must be later than the start; long hours are compared without numeric precision loss.
- An empty or spaces/tabs-only line separates cues. The final cue need not end with a blank line.
- Cue order, repeated/nonconsecutive counters, overlapping cues, repeated dialogue, multiline text, and payload whitespace are preserved. Counters never sort or deduplicate content.
- `Alice: hello`, `<b>hello</b>`, and `&amp;` remain literal payload strings. No speaker inference, entity decoding, styling, or Person-note linking is performed.
- **Transcript timestamps** (called **Caption timestamps** in 0.4.0) omits generated timing lines or retains normalized times such as `00:00:01.250`, without changing their represented time. Both plain and folded displays use the same existing note structure and containment guards.
- Missing counters/payloads, invalid times, dot-millisecond timing, same-line counters, timing positioning extensions, and ambiguous missing cue separators are refused as unreadable. A counter immediately followed by a timing line inside payload is refused because it may be an unseparated cue. The entire source fails; valid earlier cues are not published alone and there is no TXT fallback.
- Empty or whitespace-only sources are empty; invalid UTF-8 is an encoding failure. Diagnostic reasons do not expose payloads.
- Packaged desktop acceptance and release publication passed for 0.4.0; Community rescan and OpenSpec closure remain pending in the recorded evidence.

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
