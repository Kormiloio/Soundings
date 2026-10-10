# Transcript Conversion Delta

## ADDED Requirements

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
