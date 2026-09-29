# Spec Delta

## MODIFIED Requirements

### Requirement: Faithful WebVTT conversion
Soundings SHALL validate the WebVTT signature, omit WebVTT control records and cue settings from prose, preserve cue text order, retain speaker attribution only when explicitly and reliably encoded, and apply the validated timestamp policy. The `omit` policy SHALL exclude cue timing syntax, while the `retain` policy SHALL render each retained source timestamp deterministically without changing its represented time.

#### Scenario: Zoom-style WebVTT is converted
- **GIVEN** a valid WebVTT transcript with ordered cues, timestamps, and explicit voice spans and the timestamp policy is `omit`
- **WHEN** Soundings converts the source
- **THEN** the transcript contains the cue text in order with explicit speaker names and excludes the `WEBVTT` header, cue identifiers, timestamps, and cue settings

#### Scenario: Zoom-style timestamps are retained
- **GIVEN** a valid WebVTT transcript with ordered cues and the timestamp policy is `retain`
- **WHEN** Soundings converts the source
- **THEN** each rendered cue includes its source start and end time in a documented deterministic form
- **AND** cue text order and represented times remain faithful to the source

#### Scenario: Repeated adjacent caption text is not invented or dropped silently
- **GIVEN** a valid WebVTT file contains overlapping or repeated cue text
- **WHEN** Soundings converts the source
- **THEN** Soundings applies a documented deterministic rule and the result can be traced to the source cue sequence

#### Scenario: Malformed WebVTT fails individually
- **GIVEN** a `.vtt` candidate lacks a valid WebVTT signature or contains structure that cannot be parsed safely
- **WHEN** Soundings attempts conversion
- **THEN** Soundings reports a parse failure for that source and produces no Markdown content for publication

### Requirement: Versioned Markdown contract
Soundings SHALL render a generated note with valid YAML frontmatter, a title derived from a validated built-in pattern, validated static tags when configured, the enabled reserved enrichment sections, and a transcript section using a versioned schema. Source-derived text SHALL be encoded so it cannot escape its intended section or become active embedded HTML or Obsidian embed syntax.

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
