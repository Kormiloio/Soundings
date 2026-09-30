# Spec Delta

## MODIFIED Requirements

### Requirement: Enrichment starts from a verified Soundings note
Soundings SHALL offer manual enrichment only for a readable Markdown note whose line-delimited frontmatter contains supported Soundings metadata and SHALL record content-free evidence sufficient to detect source-note changes before publication.

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

### Requirement: Structured input is local and reviewed
Soundings SHALL accept manual local input for the supported enrichment sections, validate size and structure, and show the complete rendered companion note and exact destination before publication. It SHALL make no model or network request. It SHALL retain the in-memory draft until publication succeeds or the user cancels.

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
