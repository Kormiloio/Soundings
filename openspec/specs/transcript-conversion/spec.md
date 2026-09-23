# transcript-conversion Specification

## Purpose

Convert supported transcript text into faithful, predictable, versioned Markdown locally, without presenting deterministic formatting as AI-generated understanding.

## Requirements

### Requirement: Strict local text decoding
Soundings SHALL decode UTF-8 and UTF-8-with-BOM source files locally and SHALL fail the individual conversion rather than silently replacing undecodable bytes.

#### Scenario: UTF-8 BOM is accepted
- **GIVEN** a supported transcript begins with a valid UTF-8 byte-order mark
- **WHEN** Soundings converts the source
- **THEN** the generated transcript text excludes the byte-order mark and preserves the decoded content

#### Scenario: Invalid UTF-8 fails closed
- **GIVEN** a supported transcript contains an invalid UTF-8 byte sequence
- **WHEN** Soundings attempts conversion
- **THEN** Soundings reports the source as unsupported encoding and produces no Markdown content for publication

### Requirement: Faithful plain-text conversion
Soundings SHALL preserve the decoded text and order of a `.txt` source, except for documented BOM removal and line-ending normalization.

#### Scenario: Plain transcript retains content
- **GIVEN** a UTF-8 `.txt` transcript containing speaker labels, blank lines, punctuation, and Unicode characters
- **WHEN** Soundings renders the transcript section
- **THEN** those elements appear in the same order and with the same textual meaning after line endings are normalized

#### Scenario: Empty plain-text source
- **GIVEN** a `.txt` source contains no text after BOM removal
- **WHEN** Soundings attempts conversion
- **THEN** Soundings classifies the source as empty and does not produce a publishable note

### Requirement: Faithful WebVTT conversion
Soundings SHALL validate the WebVTT signature, omit WebVTT control records and cue timing syntax from prose, preserve cue text order, and retain speaker attribution only when explicitly and reliably encoded.

#### Scenario: Zoom-style WebVTT is converted
- **GIVEN** a valid WebVTT transcript with ordered cues and explicit voice spans
- **WHEN** Soundings converts the source
- **THEN** the transcript contains the cue text in order with the explicit speaker names and excludes the `WEBVTT` header, cue identifiers, timestamps, and cue settings

#### Scenario: Repeated adjacent caption text is not invented or dropped silently
- **GIVEN** a valid WebVTT file contains overlapping or repeated cue text
- **WHEN** Soundings converts the source
- **THEN** Soundings applies a documented deterministic rule and the result can be traced to the source cue sequence

#### Scenario: Malformed WebVTT fails individually
- **GIVEN** a `.vtt` candidate lacks a valid WebVTT signature or contains structure that cannot be parsed safely
- **WHEN** Soundings attempts conversion
- **THEN** Soundings reports a parse failure for that source and produces no Markdown content for publication

### Requirement: Versioned Markdown contract
Soundings SHALL render a generated note with valid YAML frontmatter, a title, reserved enrichment sections, and a transcript section using a versioned schema. Source-derived text SHALL be encoded so it cannot escape its intended section or become active embedded HTML or Obsidian embed syntax.

#### Scenario: Generated note structure
- **GIVEN** a supported transcript has been parsed successfully
- **WHEN** Soundings renders its Markdown
- **THEN** the result contains valid frontmatter with type, source filename, source format, schema version, and conversion time, followed by a title and Summary, Decisions, Action Items, Follow-ups, and Transcript sections

#### Scenario: Metadata value contains YAML-sensitive characters
- **GIVEN** a filename, title, or inferred project contains quotes, colons, brackets, or other YAML-sensitive characters
- **WHEN** Soundings renders frontmatter
- **THEN** the value is encoded so it cannot alter the intended frontmatter structure

#### Scenario: No enrichment has run
- **GIVEN** Soundings renders a foundation-release note
- **WHEN** the note contains reserved enrichment sections
- **THEN** the note clearly indicates that no summary was generated and does not fabricate decisions, actions, follow-ups, people, or projects

#### Scenario: Transcript contains Markdown control syntax
- **GIVEN** a transcript contains headings, frontmatter delimiters, raw HTML, fenced-code delimiters, or Obsidian embed syntax
- **WHEN** Soundings renders the transcript section
- **THEN** the human-visible source text is preserved while the source text cannot alter the generated note structure or activate an embed

### Requirement: Offline deterministic conversion
Parsing and rendering SHALL make no network request, collect no telemetry, and produce the same semantic Markdown for the same source, settings, metadata, and schema version except for explicitly supplied conversion-time metadata.

#### Scenario: Conversion runs without network access
- **GIVEN** Obsidian has no network connection
- **WHEN** Soundings parses and renders a supported transcript
- **THEN** conversion completes without a credential, account, remote service, or degraded-output warning
