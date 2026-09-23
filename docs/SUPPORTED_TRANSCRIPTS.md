# Supported transcript rules

## Plain text (`.txt`)

- Encoding: strict UTF-8 or UTF-8 with a byte-order mark.
- Normalization: BOM removal and CRLF/CR line endings converted to LF.
- Preservation: line order, blank lines, punctuation, Unicode, and repetition remain intact.
- No speaker, task, decision, topic, or identity inference is performed.
- Empty or invalid UTF-8 files are refused.

## WebVTT (`.vtt`)

- A valid `WEBVTT` signature is required.
- Zoom-style hour-based timestamps, cue identifiers, and cue settings are accepted.
- Cue text remains ordered and repeated cues remain repeated.
- Explicit WebVTT voice spans become speaker headings.
- Timing syntax and format-control records are omitted from note prose.
- Unsupported style/region blocks, unknown tags, malformed cues, empty files, and invalid UTF-8 are refused rather than guessed.

## Generated Markdown

- The note is created beside its source by replacing only the final extension with `.md`.
- Source text is placed in dynamic literal fences so HTML, Markdown, links, and Obsidian embeds remain inert.
- YAML metadata is versioned and safely encoded.
- Summary, Decisions, Action Items, and Follow-ups are reserved but never fabricated.
- A missing or existing destination blocks conversion. Soundings never reconverts over it.

## Size and platform status

The desktop foundation release requires Obsidian 1.13.7 or later and uses a conservative maximum of 5,000,000 bytes per transcript. Real Obsidian desktop vault-API acceptance passed on macOS arm64; see `VERIFICATION.md`. Android, iOS, and iPadOS are outside the first-release support scope.
