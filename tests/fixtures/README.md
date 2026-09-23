# Transcript fixture inventory

- `plain-unicode.txt`: plain text, blank lines, punctuation, and Bosnian/Croatian/Serbian Unicode.
- `zoom-voice.vtt`: Zoom-style WebVTT with cue identifiers, timestamps, settings, and explicit voice tags.
- `repeated.vtt`: repeated adjacent captions that must remain repeated.
- `malformed.vtt`: missing `WEBVTT` signature and unsafe to parse.
- `adversarial.txt`: Markdown headings, frontmatter, HTML, code fences, links, and Obsidian embeds.

Filename edge cases are generated in table-driven tests so the fixtures remain portable.
