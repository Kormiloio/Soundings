# Manual Enrichment Specification

## Purpose

Let users capture reviewed summaries, decisions, action items, and follow-ups locally in a separate create-only companion note linked to an existing Soundings transcript note.

## Requirements

### Requirement: Enrichment starts from a verified Soundings note
Soundings SHALL offer manual enrichment only for a readable Markdown note whose line-delimited frontmatter contains supported Soundings metadata and whose vault path can be linked without escaping wikilink syntax, and SHALL record content-free evidence sufficient to detect source-note changes before publication.

#### Scenario: Supported transcript note is selected
- **GIVEN** the active note has supported Soundings metadata and a readable current identity
- **WHEN** the user invokes manual enrichment
- **THEN** Soundings opens a local structured entry form for Summary, Decisions, Action Items, and Follow-ups
- **AND** does not modify the active note

#### Scenario: Frontmatter value contains a delimiter-like substring
- **GIVEN** a generated Soundings note's `source_file` value contains `---`
- **WHEN** the user invokes manual enrichment
- **THEN** Soundings identifies the note from its complete frontmatter and opens the entry form

#### Scenario: Unsupported note is selected
- **GIVEN** the active file lacks supported Soundings metadata or cannot be read safely
- **WHEN** the user invokes manual enrichment
- **THEN** Soundings reports a content-free actionable reason
- **AND** creates or changes no file

#### Scenario: Source note path cannot be linked safely
- **GIVEN** a Soundings note whose vault path contains `[`, `]`, `|`, `#`, `^`, `<`, `>`, or a line break
- **WHEN** the user invokes manual enrichment
- **THEN** Soundings reports a content-free reason that the note name cannot be linked safely
- **AND** creates or changes no file

### Requirement: Structured input is local and reviewed
Soundings SHALL accept manual local input for the supported enrichment sections, validate size and structure, and show the complete rendered companion note and exact destination before publication. Entered text SHALL be encoded so it cannot open a code fence, create a setext heading or thematic break, or otherwise change the companion note's section structure. It SHALL make no model or network request. It SHALL retain the in-memory draft until publication succeeds or the user cancels.

#### Scenario: User previews enrichment
- **GIVEN** the user entered valid local enrichment fields
- **WHEN** the user continues to review
- **THEN** Soundings shows the exact companion destination, source-note link, metadata, and rendered section content
- **AND** no file has been created

#### Scenario: User cancels enrichment
- **GIVEN** the entry or review interface is open
- **WHEN** the user cancels or closes it
- **THEN** Soundings discards the uncommitted form state
- **AND** leaves every vault file unchanged

#### Scenario: Enrichment input is empty or invalid
- **GIVEN** every enrichment field is empty or an input exceeds a documented safe limit
- **WHEN** the user requests review or publication
- **THEN** Soundings blocks publication with an actionable local validation message
- **AND** creates no destination

#### Scenario: Publication does not create a companion
- **GIVEN** the user confirmed publication of a reviewed draft
- **WHEN** the outcome is stale, blocked, canceled, failed, or needs attention
- **THEN** the form remains open with every entered field intact and a content-free reason
- **AND** after a stale outcome the next review uses freshly verified source evidence

#### Scenario: Entered text contains Markdown structure syntax
- **GIVEN** a Summary or list entry contains a line of `~~~`, three backticks, `---`, or `===`
- **WHEN** the user reviews the companion note
- **THEN** the preview shows the entered text visibly preserved
- **AND** every section heading and the source-note link that follow remain intact

### Requirement: Companion publication is create-only
Soundings SHALL derive a deterministic Obsidian-safe companion destination beside the transcript note, treat any existing path that differs from it only by letter case or Unicode composition as that destination, revalidate source-note evidence and destination absence in both the vault index and vault storage immediately before publication, and create the companion atomically or fail without fallback overwrite behavior.

#### Scenario: Reviewed companion is created
- **GIVEN** valid reviewed enrichment, unchanged source-note evidence, and an absent companion destination
- **WHEN** the user explicitly confirms publication
- **THEN** Soundings creates and reads back one companion Markdown note linked to the source note
- **AND** the transcript source, transcript note, and every pre-existing Markdown file remain unchanged

#### Scenario: Companion destination already exists
- **GIVEN** the deterministic companion destination exists before planning or appears after review
- **WHEN** Soundings plans or executes publication
- **THEN** Soundings reports a collision
- **AND** leaves the existing destination byte-for-byte unchanged

#### Scenario: Source note changes after review
- **GIVEN** the transcript note changes after enrichment review
- **WHEN** Soundings revalidates before publication
- **THEN** Soundings reports stale evidence and creates no companion

#### Scenario: Publication is canceled or fails
- **GIVEN** publication is canceled or the create operation fails
- **WHEN** Soundings settles the attempt
- **THEN** Soundings reports a content-free canceled or failed outcome
- **AND** does not mutate the source transcript or transcript note

#### Scenario: Companion destination exists with different letter case
- **GIVEN** `meetings/NOTE - enrichment.md` exists and the derived companion destination is `meetings/note - Enrichment.md`
- **WHEN** Soundings plans or executes publication
- **THEN** Soundings reports a collision without calling the create operation
- **AND** the existing file remains byte-for-byte unchanged

### Requirement: Enrichment diagnostics remain content-free
Soundings SHALL NOT log or include manual enrichment bodies, transcript bodies, note bodies, model prompts, or credentials in diagnostic records or result summaries.

#### Scenario: Enrichment fails validation
- **GIVEN** an enrichment attempt fails validation or publication
- **WHEN** Soundings reports the outcome
- **THEN** the report may include vault-relative paths, sizes, identities, and error categories
- **AND** excludes entered enrichment text and source-note content
