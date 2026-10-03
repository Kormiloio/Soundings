# Spec Delta

## MODIFIED Requirements

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
- **GIVEN** the transcript display is `plain`
- **WHEN** Soundings renders any transcript
- **THEN** the note is byte-identical to the output of release `0.2.3` for the same input and timestamp
