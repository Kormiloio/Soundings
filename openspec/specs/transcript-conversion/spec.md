# transcript-conversion Specification

## Purpose

Convert supported transcript text into faithful, predictable, versioned Markdown locally, without presenting deterministic formatting as AI-generated understanding.

## Requirements

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

### Requirement: Offline deterministic conversion
Parsing and rendering SHALL make no network request, collect no telemetry, and produce the same semantic Markdown for the same source, settings, metadata, and schema version except for explicitly supplied conversion-time metadata.

#### Scenario: Conversion runs without network access
- **GIVEN** Obsidian has no network connection
- **WHEN** Soundings parses and renders a supported transcript
- **THEN** conversion completes without a credential, account, remote service, or degraded-output warning

### Requirement: Bounded transcript processing
Soundings SHALL parse and render any source within the configured size limit in time and stack depth proportional to its length. Cue markup SHALL be scanned in one pass without backtracking regular expressions. A tag runs from `<` to the next `>`; a tag body longer than 256 characters or containing `<` SHALL make the source unsupported WebVTT, while a `<` with no later `>` in its cue and an empty `<>` pair SHALL remain literal text. Fence sizing SHALL NOT depend on the number of arguments a function call can accept.

#### Scenario: Adversarial voice-tag input
- **GIVEN** a 1 MB WebVTT cue consisting of repeated `<v.`, repeated `<v `, or repeated `<` characters, with or without a final `>`
- **WHEN** Soundings discovers or converts the source
- **THEN** Soundings classifies the source within 500 ms on the reference desktop without freezing Obsidian
- **AND** a source whose only tag exceeds 256 characters or contains `<` is reported as unsupported WebVTT and produces no Markdown content

#### Scenario: Class tag with many class groups
- **GIVEN** a WebVTT cue contains a `c` tag with 60 class groups
- **WHEN** Soundings discovers or converts the source
- **THEN** the tag is accepted or refused within 500 ms and its text is preserved when accepted

#### Scenario: Stray angle bracket precedes a tag
- **GIVEN** a WebVTT cue contains `a <<i>x</i>`
- **WHEN** Soundings discovers or converts the source
- **THEN** the source is reported as unsupported WebVTT rather than guessing which `<` begins the tag

#### Scenario: Plain text contains many tilde runs
- **GIVEN** a `.txt` source contains 150,000 separate `~` runs
- **WHEN** Soundings renders the transcript
- **THEN** rendering completes without a stack or argument-count error
- **AND** the transcript fence is longer than the longest tilde run

### Requirement: Faithful SubRip conversion
Soundings SHALL accept UTF-8 SRT, including one leading BOM and normalized CRLF/CR line endings, with each cue consisting of a standalone positive decimal counter, a `hh:mm:ss,mmm --> hh:mm:ss,mmm` timing line, and one or more nonblank payload lines. Hours SHALL contain at least two digits, minutes and seconds SHALL be in 00-59, and milliseconds SHALL contain exactly three digits. Each cue SHALL have an end time strictly after its start time. Empty or spaces/tabs-only lines SHALL separate cues, and the final cue SHALL NOT require a trailing blank line. Counters SHALL NOT be used to sort, deduplicate, or discard text; repeated/nonconsecutive counters, overlapping cues, and repeated payloads SHALL retain source order. Payload lines, whitespace, Unicode, markup, and character references SHALL remain literal text without speaker inference or entity decoding. Syntax outside this supported subset SHALL fail the entire source rather than publish a partial transcript or fall back to TXT.

#### Scenario: Numbered multiline SRT is converted
- **GIVEN** a valid UTF-8 SRT has numbered cues, multiline dialogue, Unicode, and no final blank line
- **WHEN** Soundings parses the source
- **THEN** every payload line is preserved in cue order with its source timing
- **AND** counters and timing syntax do not become dialogue

#### Scenario: Repeated and overlapping cues are preserved
- **GIVEN** valid cues have repeated or nonconsecutive counters, overlapping times, and repeated dialogue
- **WHEN** Soundings parses the source
- **THEN** every cue remains in its original order without sorting, merging, or deduplication

#### Scenario: Speaker-like text and markup stay literal
- **GIVEN** an SRT payload contains `Alice: hello`, `<b>hello</b>`, `&amp;`, or Obsidian embed syntax
- **WHEN** Soundings parses and renders the source
- **THEN** those strings remain visible literal text and no speaker identity is inferred
- **AND** no HTML or Obsidian embed activates

#### Scenario: Malformed structure prevents partial output
- **GIVEN** an SRT source contains a valid first cue followed by a missing counter, empty payload, invalid minute/second, nonincreasing cue interval, or invalid timing separator
- **WHEN** Soundings parses the source
- **THEN** the source fails with a content-free structure reason and no publishable partial transcript

#### Scenario: Unsupported SRT dialect is not guessed
- **GIVEN** an SRT uses decimal-point milliseconds, same-line counter/timing, or timing-line positioning extensions outside the documented subset
- **WHEN** Soundings evaluates the source
- **THEN** it is classified as unreadable with a content-free supported-subset explanation
- **AND** it is not silently treated as TXT or partially converted

#### Scenario: Missing separator is not silently absorbed
- **GIVEN** a payload contains a standalone positive counter immediately followed by a valid SRT timing line without a preceding blank separator
- **WHEN** Soundings parses the source
- **THEN** it fails closed as structurally ambiguous rather than silently absorbing a possible following cue into dialogue
- **AND** no partial note is produced

#### Scenario: SRT decoding and empty sources fail safely
- **GIVEN** an SRT has invalid UTF-8 bytes or no cues after BOM removal and whitespace normalization
- **WHEN** Soundings evaluates the source
- **THEN** invalid bytes produce an unsupported-encoding failure and a cue-free whitespace-only source is empty
- **AND** neither produces a destination

### Requirement: SRT uses existing output and publication guards
Soundings SHALL render SRT using the existing versioned note contract with `source_format: "srt"`, adjacent reviewed destinations, reserved sections, and validated profiles. The existing `omit`/`retain` timestamp policy SHALL apply to SRT; retained times SHALL use `hh:mm:ss.mmm` without changing represented time. Plain and folded displays SHALL preserve literal payload containment, and unchanged TXT/VTT inputs SHALL retain byte-identical rendered output. Execution SHALL require explicit selection and revalidate settings, source evidence, and destination absence under existing collision, cancellation, and unload guards.

#### Scenario: Timestamp and display combinations are honored
- **GIVEN** a valid SRT and each combination of plain/folded display and omit/retain timestamps
- **WHEN** the selected source is converted
- **THEN** the generated note has SRT metadata and the reviewed display/timing choice
- **AND** retained `00:00:01,250` appears as `00:00:01.250`, while omit excludes generated timing lines
- **AND** folded output has one collapsed Full Transcript callout containing all payloads

#### Scenario: Existing or competing destination blocks SRT
- **GIVEN** an SRT's normalized destination already exists, including a case/Unicode equivalent, or another enabled source derives the same destination
- **WHEN** Soundings plans conversion
- **THEN** the candidate is blocked and existing source/destination bytes remain unchanged

#### Scenario: Destination appears after SRT review
- **GIVEN** a valid SRT was reviewed and selected with an absent destination
- **WHEN** that destination appears before publication
- **THEN** execution refuses creation and preserves the newly existing note and source

#### Scenario: Source or settings change after SRT review
- **GIVEN** a valid SRT was reviewed and selected
- **WHEN** its bytes or effective settings change before execution
- **THEN** the item is stale or blocked and creates no destination

#### Scenario: Cancellation or unload prevents later SRT publication
- **GIVEN** an SRT conversion is awaiting source validation or creation
- **WHEN** the user cancels before creation begins or the plugin unloads before publication
- **THEN** existing lifecycle guards prevent subsequent publication for that item
- **AND** no partial note or source mutation occurs

#### Scenario: Failure is isolated within a mixed batch
- **GIVEN** selected SRT, TXT, and VTT candidates include an SRT that becomes unreadable or malformed after review
- **WHEN** Soundings executes the batch
- **THEN** that item receives a content-free failure or stale result without a destination
- **AND** unrelated valid selected items can still complete under their own guards

#### Scenario: SRT note supports existing manual enrichment
- **GIVEN** a newly generated SRT note is active and its companion destination is absent
- **WHEN** the user reviews and explicitly publishes manual enrichment
- **THEN** a separate companion note is created with the correct source backlink
- **AND** the SRT source and generated transcript note remain unchanged

### Requirement: Bounded offline SRT processing
Soundings SHALL parse and render SRT locally in time and stack depth proportional to source size within the configured limit, without network access or telemetry. A 1 MB adversarial SRT structure SHALL classify within 500 ms on the reference desktop without freezing Obsidian.

#### Scenario: Adversarial SRT fails promptly
- **GIVEN** a size-permitted 1 MB SRT contains a very long counter/timing line or repeated delimiter-like text
- **WHEN** Soundings parses it on the reference desktop
- **THEN** classification completes within 500 ms without a stack error or UI freeze
- **AND** failure does not publish partial output

#### Scenario: Large valid SRT preserves all cues offline
- **GIVEN** a valid SRT near the configured 5 MB limit and no network connection
- **WHEN** Soundings parses and renders it
- **THEN** all cues remain present in source order without credentials or remote requests
- **AND** processing remains bounded and diagnostics contain no payload text

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
