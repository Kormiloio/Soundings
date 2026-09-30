# Spec Delta

## ADDED Requirements

### Requirement: Bounded transcript processing
Soundings SHALL parse and render any source within the configured size limit in time and stack depth proportional to its length. Cue markup SHALL be scanned without backtracking regular expressions; a tag longer than 256 characters or a `<` without a closing `>` in its cue SHALL make the source unsupported WebVTT. Fence sizing SHALL NOT depend on the number of arguments a function call can accept.

#### Scenario: Adversarial voice-tag input
- **GIVEN** a 1 MB WebVTT cue consisting of repeated `<v.`, repeated `<v `, or repeated `<` characters
- **WHEN** Soundings discovers or converts the source
- **THEN** Soundings classifies the source within 500 ms on the reference desktop
- **AND** reports it as unsupported WebVTT without freezing Obsidian or producing Markdown content

#### Scenario: Plain text contains many tilde runs
- **GIVEN** a `.txt` source contains 150,000 separate `~` runs
- **WHEN** Soundings renders the transcript
- **THEN** rendering completes without a stack or argument-count error
- **AND** the transcript fence is longer than the longest tilde run

## MODIFIED Requirements

### Requirement: Strict local text decoding
Soundings SHALL decode UTF-8 and UTF-8-with-BOM source files locally, SHALL remove exactly one leading byte-order mark, and SHALL fail the individual conversion rather than silently replacing undecodable bytes.

#### Scenario: UTF-8 BOM is accepted
- **GIVEN** a supported transcript begins with a valid UTF-8 byte-order mark
- **WHEN** Soundings converts the source
- **THEN** the generated transcript text excludes the byte-order mark and preserves the decoded content

#### Scenario: Invalid UTF-8 fails closed
- **GIVEN** a supported transcript contains an invalid UTF-8 byte sequence
- **WHEN** Soundings attempts conversion
- **THEN** Soundings reports the source as unsupported encoding and produces no Markdown content for publication

#### Scenario: Genuine leading U+FEFF follows the byte-order mark
- **GIVEN** a supported transcript begins with a UTF-8 byte-order mark followed by an encoded U+FEFF character
- **WHEN** Soundings converts the source
- **THEN** only the byte-order mark is removed and the following U+FEFF character is preserved

### Requirement: Faithful WebVTT conversion
Soundings SHALL validate the WebVTT signature, ignore header metadata lines that follow the signature before the first blank line, accept cue timestamps in either `mm:ss.sss` or `hh:mm:ss.sss` form, omit WebVTT control records and cue settings from prose, preserve cue text order, retain speaker attribution only when explicitly and reliably encoded, and apply the validated timestamp policy. Soundings SHALL accept voice spans without a closing tag and multiple voice spans within one cue without dropping their text, and SHALL attribute each voice span's text only to that span's speaker; text after a closing `</v>` tag SHALL have no speaker attribution. Soundings SHALL recognize a voice tag only when `v` is followed by whitespace, a period, or `>`, and SHALL refuse any other unknown tag. Lines that are empty or contain only spaces or tabs SHALL separate cues. Character references SHALL be decoded exactly once. The `omit` policy SHALL exclude cue timing syntax, while the `retain` policy SHALL render each retained source timestamp deterministically without changing its represented time.

#### Scenario: Zoom-style WebVTT is converted
- **GIVEN** a valid WebVTT transcript with ordered cues, timestamps, and explicit voice spans and the timestamp policy is `omit`
- **WHEN** Soundings converts the source
- **THEN** the transcript contains the cue text in order with explicit speaker names and excludes the `WEBVTT` header, cue identifiers, timestamps, and cue settings

#### Scenario: Zoom-style timestamps are retained
- **GIVEN** a valid WebVTT transcript with ordered cues and the timestamp policy is `retain`
- **WHEN** Soundings converts the source
- **THEN** each rendered cue includes its source start and end time in a documented deterministic form
- **AND** cue text order and represented times remain faithful to the source

#### Scenario: Cue timestamps omit hours
- **GIVEN** a valid WebVTT transcript uses `mm:ss.sss` cue timestamps
- **WHEN** Soundings converts the source
- **THEN** the cue text is converted in order without requiring an hours component

#### Scenario: Voice tags are unclosed or repeated within a cue
- **GIVEN** a valid WebVTT cue contains an unclosed voice span or multiple voice spans for different speakers
- **WHEN** Soundings converts the source
- **THEN** the transcript preserves every voice span's text in source order without exposing voice-tag markup
- **AND** each span's text appears under its own speaker with the cue's timing
- **AND** text before the first voice span in the cue has no speaker attribution

#### Scenario: Header metadata follows the signature
- **GIVEN** a WebVTT file has `Kind:` or `Language:` lines directly below `WEBVTT` followed by a blank line and valid cues
- **WHEN** Soundings discovers or converts the source
- **THEN** the source is eligible and the header lines do not appear in the transcript

#### Scenario: Whitespace-only line separates cues
- **GIVEN** two cues are separated by a line containing only spaces
- **WHEN** Soundings converts the source
- **THEN** the cues become separate blocks and no timing line appears in transcript text

#### Scenario: Encoded character reference is decoded once
- **GIVEN** cue text contains `&amp;lt;`
- **WHEN** Soundings converts the source
- **THEN** the transcript text contains `&lt;`

#### Scenario: Repeated adjacent caption text is not invented or dropped silently
- **GIVEN** a valid WebVTT file contains overlapping or repeated cue text
- **WHEN** Soundings converts the source
- **THEN** Soundings applies a documented deterministic rule and the result can be traced to the source cue sequence

#### Scenario: Malformed WebVTT fails individually
- **GIVEN** a `.vtt` candidate lacks a valid WebVTT signature or contains structure that cannot be parsed safely
- **WHEN** Soundings attempts conversion
- **THEN** Soundings reports a parse failure for that source and produces no Markdown content for publication

#### Scenario: Text follows a closing voice tag
- **GIVEN** a valid WebVTT cue contains `<v Alice>hi</v> narrator <v Bob>yo`
- **WHEN** Soundings converts the source
- **THEN** `hi` appears under Alice, `narrator` appears with no speaker attribution, and `yo` appears under Bob, in source order

#### Scenario: Unknown tag begins with the letter v
- **GIVEN** a WebVTT cue contains `<video>x</video>`
- **WHEN** Soundings discovers or converts the source
- **THEN** the source is classified as unsupported WebVTT and no Markdown content is produced for publication

### Requirement: Versioned Markdown contract
Soundings SHALL render a generated note with valid YAML frontmatter, a title derived from a validated built-in pattern, validated static tags when configured, the enabled reserved enrichment sections, and a transcript section using a versioned schema. Source-derived text SHALL be encoded so it cannot escape its intended section, become active embedded HTML or Obsidian embed syntax, or activate Obsidian inline syntax (comments, math, highlights, strikethrough, or block references) in generated headings. Frontmatter strings SHALL escape C1 control characters and Unicode line and paragraph separators.

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
