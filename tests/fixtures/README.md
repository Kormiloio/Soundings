# Transcript fixture inventory

- `plain-unicode.txt`: plain text, blank lines, punctuation, and Bosnian/Croatian/Serbian Unicode.
- `zoom-voice.vtt`: Zoom-style WebVTT with cue identifiers, timestamps, settings, and explicit voice tags.
- `repeated.vtt`: repeated adjacent captions that must remain repeated.
- `malformed.vtt`: missing `WEBVTT` signature and unsafe to parse.
- `adversarial.txt`: Markdown headings, frontmatter, HTML, code fences, links, and Obsidian embeds.

Filename edge cases are generated in table-driven tests so the fixtures remain portable.

SRT fixtures are entirely synthetic:
- `captions.srt`: three ordered timed blocks, multiline payload, overlap, repeated/nonconsecutive counters, and repeated dialogue; no inferred speaker fields.
- `adversarial.srt`: one literal timed block containing markup, entities, Markdown delimiters, an embed, and the final containment sentinel.
- `malformed.srt`: invalid minute range in a later cue; the entire parse must fail without partial blocks.
- `missing-separator.srt`: ambiguous counter/timing pair within payload; the entire parse must fail.
Unicode, BOM/CRLF/CR, and EOF without a blank separator are generated in SRT tests to keep encoding cases explicit.
The four `expected-srt-*.md` goldens cover every plain/folded and omit/retain combination for `captions.srt`; existing TXT/VTT goldens are unchanged.
