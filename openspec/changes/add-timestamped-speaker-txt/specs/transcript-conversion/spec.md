# Transcript Conversion Delta

## MODIFIED Requirements

### Requirement: Faithful plain-text conversion
Soundings SHALL preserve the decoded text and order of a `.txt` source, except for documented BOM removal and line-ending normalization, when the TXT layout is Plain text or when Timestamped speaker recognition falls back to plain text. Structured interpretation SHALL occur only with explicit opt-in to Timestamped speaker and complete recognition of the documented layout.

#### Scenario: Plain transcript retains content
- **GIVEN** a UTF-8 `.txt` transcript containing speaker labels, blank lines, punctuation, and Unicode characters with Plain text selected
- **WHEN** Soundings renders the transcript section
- **THEN** those elements appear in the same order and with the same textual meaning after line endings are normalized

#### Scenario: Empty plain-text source
- **GIVEN** a `.txt` source contains no text after BOM removal
- **WHEN** Soundings attempts conversion
- **THEN** Soundings classifies the source as empty and does not produce a publishable note

### Requirement: Versioned Markdown contract
Soundings SHALL render a generated note with valid YAML frontmatter, a title derived from a validated built-in pattern, validated static tags when configured, the enabled reserved enrichment sections, and a transcript section using a versioned schema. Source-derived text SHALL be encoded so it cannot escape its intended section, become active embedded HTML or Obsidian embed syntax, or activate Obsidian inline syntax (comments, math, highlights, strikethrough, or block references) in generated headings. Frontmatter strings SHALL escape C1 control characters and Unicode line and paragraph separators. When the transcript display is `folded-callout`, Soundings SHALL render the transcript body directly below the `## Transcript` heading as a single collapsed Obsidian callout introduced by `> [!quote]- Full Transcript`, with every line of the body, including blank lines, carrying the callout prefix, so that the callout contains the entire transcript and no source-derived text can end, escape, or nest inside it.

#### Scenario: Generated note structure
- **GIVEN** a supported transcript has been parsed successfully with the default output profile
- **WHEN** Soundings renders its Markdown
- **THEN** the result preserves the prior frontmatter, title, Summary, Decisions, Action Items, Follow-ups, and Transcript structure

#### Scenario: Parent-folder title is rendered without a content label
- **GIVEN** a supported source under `Projects/Alpha/` uses the `parent-folder-source-name` title pattern
- **WHEN** Soundings renders its Markdown
- **THEN** the heading is `Alpha — Source name`
- **AND** Soundings does not label the content as a transcript, meeting, conversation, or Markdown document

#### Scenario: Optional sections and tags are configured
- **GIVEN** a valid output profile disables some reserved sections and defines static tags
- **WHEN** Soundings renders the note
- **THEN** only enabled reserved sections appear
- **AND** the validated tags appear as YAML data without changing the frontmatter structure

#### Scenario: Metadata value contains YAML-sensitive characters
- **GIVEN** a filename, title, inferred project, or tag contains YAML-sensitive characters
- **WHEN** Soundings renders frontmatter
- **THEN** each value is encoded so it cannot alter the intended frontmatter structure

#### Scenario: No enrichment has run
- **GIVEN** Soundings renders a note with the Summary section enabled
- **WHEN** no enrichment input exists
- **THEN** the note clearly indicates that no summary was generated and does not fabricate decisions, actions, follow-ups, people, or projects

#### Scenario: Transcript contains Markdown control syntax
- **GIVEN** a transcript contains headings, frontmatter delimiters, raw HTML, fenced-code delimiters, or Obsidian embed syntax
- **WHEN** Soundings renders the transcript section
- **THEN** the human-visible source text is preserved while the source text cannot alter the generated note structure or activate an embed

#### Scenario: Speaker or title contains Obsidian inline syntax
- **GIVEN** a WebVTT speaker or derived title contains `%%`, `$`, `==`, `~~`, or `^`
- **WHEN** Soundings renders the heading
- **THEN** those characters are escaped so the visible heading text is preserved
- **AND** no comment, math, highlight, strikethrough, or block reference is activated and later transcript text remains visible in reading view

#### Scenario: Filename contains C1 control characters
- **GIVEN** a source filename contains a character in U+0080–U+009F, U+2028, or U+2029
- **WHEN** Soundings renders frontmatter
- **THEN** each such character is written as a `\uXXXX` escape inside a valid double-quoted YAML scalar

#### Scenario: Transcript is rendered as a folded callout
- **GIVEN** the transcript display is `folded-callout` and a WebVTT transcript has several speakers
- **WHEN** Soundings renders the note
- **THEN** `## Transcript` is followed by one callout whose first line is `> [!quote]- Full Transcript`
- **AND** every speaker heading, retained timestamp line, and literal transcript fence appears inside that callout in source order
- **AND** the frontmatter and reserved sections are unchanged

#### Scenario: Source text tries to break out of the callout
- **GIVEN** the transcript display is `folded-callout` and transcript text contains blank lines, lines starting with `>` or `> [!note]`, tilde or backtick runs, `---`, or headings
- **WHEN** Soundings renders the note and the result is parsed as CommonMark
- **THEN** exactly one blockquote follows `## Transcript`, it contains every transcript character, and no transcript text appears after it
- **AND** the transcript text remains literal and visible inside its fence

#### Scenario: Plain display is unchanged
- **GIVEN** the transcript display is `plain` and the source uses an interpretation supported by release `0.2.3`
- **WHEN** Soundings renders that transcript with unchanged settings and conversion timestamp
- **THEN** the note is byte-identical to the output of release `0.2.3`
- **AND** this compatibility scenario does not apply to newly opted-in structured TXT or SRT interpretation

## ADDED Requirements

### Requirement: Complete timestamped-speaker TXT recognition
With Timestamped speaker selected, Soundings SHALL recognize a decoded TXT file only when its entire nonblank content consists of blank-separated blocks with a timing line `HH:MM:SS --> HH:MM:SS`, a first payload line `Speaker: dialogue`, and optional nonblank continuation lines. Hours SHALL be exactly two digits, minutes and seconds SHALL be 00-59, and each end SHALL be strictly after its start. Spaces or tabs SHALL be accepted around the timing line and on either side of the arrow; blank separator lines SHALL contain only spaces or tabs. The speaker delimiter SHALL be the first colon followed by one or more spaces or tabs; its trimmed label and the first dialogue line SHALL be nonempty. Only that delimiter's separator whitespace SHALL be removed from dialogue. Continuation text SHALL otherwise remain literal. Leading/trailing blank separators SHALL be accepted and the final block SHALL NOT require a trailing newline. Source order, overlaps, repetitions, Unicode, and continuation whitespace SHALL be preserved without sorting, merging, entity decoding, identity inference, or time rebasing. A continuation line resembling another timing header without a blank separator SHALL force whole-file fallback.

#### Scenario: Sample-shaped multiline TXT is recognized
- **GIVEN** Timestamped speaker is selected and synthetic TXT contains two valid time ranges followed by `Alex Rivera: Hello.` and `Sam Lee: Welcome.` with multiline continuation text
- **WHEN** Soundings parses the source
- **THEN** separate ordered blocks contain explicit speaker labels, unchanged source time strings, and every dialogue line

#### Scenario: Overlap and repeated dialogue remain
- **GIVEN** valid blocks overlap and repeat the same dialogue
- **WHEN** Soundings parses the source
- **THEN** every block appears in source order without deduplication or inferred chronology

#### Scenario: Unfamiliar or mixed layout falls back completely
- **GIVEN** opted-in TXT contains a preamble, missing separator, missing speaker, empty dialogue, fractional timing, invalid interval, cue counter, or other unrecognized block
- **WHEN** Soundings parses the source
- **THEN** its entire decoded content becomes one plain-text block, including timing syntax and separators
- **AND** no partially recognized speaker or timing fields are retained

#### Scenario: Invalid encoding is not fallback
- **GIVEN** opted-in TXT has invalid UTF-8 bytes
- **WHEN** Soundings evaluates the source
- **THEN** decoding fails under the existing strict-decoding contract and no destination is produced

### Requirement: Structured TXT uses guarded versioned output
Successfully recognized timestamped-speaker TXT SHALL use `source_format: "txt"` and note schema 2, with safe speaker headings, literal dialogue fences, the existing timestamp policy and plain/folded display contract. Retain SHALL display the original `HH:MM:SS` start/end strings; omit SHALL exclude generated time lines. Plain mode and whole-file fallback SHALL preserve existing output bytes and schema selection for the same source, profile, metadata, and conversion timestamp. VTT/SRT output SHALL remain unchanged. The existing legacy plain-display compatibility scenario SHALL apply to unchanged source interpretation, not the newly opted-in structured TXT interpretation. Processing SHALL remain local, linear in source length, and bounded by the configured size limit.

#### Scenario: All four output combinations are honored
- **GIVEN** recognized TXT and each plain/folded and omit/retain combination
- **WHEN** Soundings renders the reviewed note
- **THEN** the note has TXT metadata, schema 2, safe speaker headings, and the selected timing/display choice
- **AND** folded output contains the entire transcript in one collapsed callout

#### Scenario: Dialogue and labels contain active-looking syntax
- **GIVEN** recognized TXT has HTML, embed syntax, Markdown fences, callout markers, or inline-control characters in labels or dialogue
- **WHEN** Soundings renders it
- **THEN** visible text stays faithful without active embeds or escape from the intended heading, fence, or callout

#### Scenario: Default and fallback compatibility
- **GIVEN** Plain text is selected or recognition falls back, and fixed metadata and conversion time
- **WHEN** Soundings renders TXT
- **THEN** output is byte-identical to 0.4.0 for that same plain TXT input and output profile

#### Scenario: Structured note accepts manual enrichment
- **GIVEN** a generated schema-2 structured TXT note is active and its companion destination is absent
- **WHEN** the user reviews and publishes manual enrichment
- **THEN** the existing companion workflow works without changing source or transcript-note bytes

#### Scenario: Adversarial source stays bounded
- **GIVEN** size-permitted TXT contains long delimiter-like lines or many candidate blocks
- **WHEN** Soundings evaluates recognition and renders the result
- **THEN** work and stack usage remain proportional to source length without truncation or payload-bearing diagnostics
