# conversion-planning Specification

## Purpose

Produce a complete, non-mutating conversion preview that makes destinations, collisions, source evidence, exclusions, and user selection explicit before execution.

## Requirements

### Requirement: Deterministic destination derivation
For each supported source, Soundings SHALL derive an Obsidian-safe destination in the source folder by preserving an already-safe basename, replacing each run of control characters or `\`, `:`, `*`, `?`, `"`, `<`, `>`, or `|` together with adjacent whitespace in the basename with a single ` - ` separator, trimming unsafe trailing spaces and periods, and appending `.md`. Soundings SHALL expose this exact destination during review and SHALL NOT rename or otherwise mutate the source.

#### Scenario: Destination beside plain-text source
- **GIVEN** a source at `Projects/ProMBA/Meeting 1.txt`
- **WHEN** Soundings plans its conversion
- **THEN** the intended destination is `Projects/ProMBA/Meeting 1.md`
- **AND** the source path and bytes remain unchanged

#### Scenario: Filename contains multiple periods
- **GIVEN** a source at `Projects/ProMBA/Meeting.2026.09.22.vtt`
- **WHEN** Soundings plans its conversion
- **THEN** the intended destination is `Projects/ProMBA/Meeting.2026.09.22.md`

#### Scenario: Filename contains rejected punctuation
- **GIVEN** a source at `Meetings/1:1: Charles : Mario.txt`
- **WHEN** Soundings plans its conversion
- **THEN** the reviewed destination is `Meetings/1 - 1 - Charles - Mario.md`
- **AND** the source remains named `1:1: Charles : Mario.txt`

#### Scenario: Sanitization cannot produce a usable basename
- **GIVEN** a supported source whose basename contains no usable characters after safe normalization
- **WHEN** Soundings plans its conversion
- **THEN** Soundings blocks the item with an actionable path-sanitization reason
- **AND** creates no destination

### Requirement: Collision-first classification
Soundings SHALL classify a candidate as blocked when its final sanitized destination already exists or when multiple candidates in the same plan resolve to the same sanitized destination, and SHALL NOT select a blocked candidate for execution.

#### Scenario: Existing Markdown destination blocks conversion
- **GIVEN** `1:1 Meeting.txt` and `1 - 1 Meeting.md` both exist in the same folder
- **WHEN** Soundings builds the plan
- **THEN** `1:1 Meeting.txt` is classified as blocked by the existing sanitized destination
- **AND** `1 - 1 Meeting.md` remains byte-for-byte unchanged

#### Scenario: Two sources resolve to one destination
- **GIVEN** `Planning: Review.txt` and `Planning - Review.vtt` exist in the same folder while `Planning - Review.md` is absent
- **WHEN** Soundings builds the plan
- **THEN** both candidates are blocked by an ambiguous destination collision until the user resolves it outside Soundings

#### Scenario: User cancels after reviewing a sanitized destination
- **GIVEN** the review plan shows a sanitized destination for an eligible source
- **WHEN** the user closes the plan without execution
- **THEN** Soundings creates no destination and leaves the source unchanged

### Requirement: Stable source evidence
Each eligible planned conversion SHALL record evidence sufficient to detect a missing or content-changed source before execution without retaining transcript content in diagnostics.

#### Scenario: Eligible candidate records evidence
- **GIVEN** a readable supported transcript with no destination collision
- **WHEN** Soundings builds the plan
- **THEN** the plan marks it eligible and records its path, format, byte length, and a content identity value

### Requirement: Reviewable plan and explicit selection
Soundings SHALL show classification counts and let the user search and filter the current plan by vault-relative path and classification. It SHALL show each visible candidate's source, intended destination, classification, and reason, and SHALL execute only eligible items the user explicitly selects from the current plan. Every newly opened or refreshed plan SHALL begin with no selected candidates. **Select all eligible shown** SHALL select only currently visible eligible items, and **Clear selection** SHALL clear every selection in the plan.

#### Scenario: User reviews nested candidates
- **GIVEN** a scan finds eligible, excluded, unreadable, and colliding transcripts in different folders
- **WHEN** Soundings presents the conversion plan
- **THEN** the user can distinguish every classification and inspect the vault-relative source and destination for each visible item
- **AND** the summary reports accurate counts for every classification

#### Scenario: User filters a large plan
- **GIVEN** a populated conversion plan contains candidates across multiple folders and classifications
- **WHEN** the user searches by a case-insensitive path fragment or selects a classification filter
- **THEN** only matching rows are shown
- **AND** the overall classification counts remain accurate

#### Scenario: User selects all visible eligible candidates
- **GIVEN** the current search and classification filters show eligible and non-eligible candidates
- **WHEN** the user activates **Select all eligible shown**
- **THEN** every visible eligible candidate is selected
- **AND** no hidden eligible, excluded, unsupported, unreadable, empty, oversize, destination-invalid, destination-exists, or destination-ambiguous candidate is selected

#### Scenario: Filter changes preserve explicit selections
- **GIVEN** the user explicitly selected eligible candidates and then changes a filter
- **WHEN** previously selected candidates become hidden
- **THEN** their selection remains represented in the selected count
- **AND** the user can clear all selections before conversion

#### Scenario: Eligible item is not selected
- **GIVEN** an eligible conversion appears in the current plan
- **WHEN** the user starts execution without selecting that item
- **THEN** Soundings performs no write for that item

#### Scenario: Refreshed plan starts unselected
- **GIVEN** the user selected candidates in an earlier plan
- **WHEN** Soundings refreshes discovery and presents a new plan
- **THEN** the refreshed plan has zero selected candidates
- **AND** no conversion starts automatically

#### Scenario: Return in search does not execute
- **GIVEN** the current plan contains an explicitly selected eligible candidate
- **WHEN** the user presses Return while the path-search input is focused
- **THEN** the plan remains open with the selection unchanged
- **AND** no conversion starts

### Requirement: Conservative project inference
When project inference is enabled, Soundings SHALL derive a project value only from the configured vault-relative project-root rule and SHALL omit the value when the path does not identify exactly one project segment.

#### Scenario: Project inferred below configured root
- **GIVEN** the project root is `Projects/` and a source is `Projects/ProMBA/Meetings/Planning.txt`
- **WHEN** Soundings plans the note metadata
- **THEN** the proposed project value is `ProMBA`

#### Scenario: Source is outside configured project root
- **GIVEN** the project root is `Projects/` and a source is `Meetings/Planning.txt`
- **WHEN** Soundings plans the note metadata
- **THEN** the proposed metadata omits the project value

### Requirement: Planning is non-mutating
Building, refreshing, filtering, selecting, or canceling a conversion plan SHALL NOT mutate vault files.

#### Scenario: Plan is canceled
- **GIVEN** the user is reviewing a populated conversion plan
- **WHEN** the user cancels or closes the plan without execution
- **THEN** Soundings leaves every source and destination unchanged

### Requirement: Plan binds the exact output profile
Each eligible planned conversion SHALL record a content-free identity for the validated output profile and SHALL display the profile's exact destination and structural choices before selection.

#### Scenario: Customized plan is reviewable
- **GIVEN** a user selected valid built-in title, section, tag, destination, and timestamp options
- **WHEN** Soundings presents the plan
- **THEN** the plan identifies the active output profile and exact destination
- **AND** remains non-mutating until the user explicitly selects and converts the candidate

#### Scenario: Parent-folder title does not change placement
- **GIVEN** `Projects/Alpha/Excel Migration.txt` uses the `parent-folder-source-name` title pattern and the `source-name-note` destination pattern
- **WHEN** Soundings presents the plan
- **THEN** the title preview is `Alpha — Excel Migration`
- **AND** the exact destination remains in the source folder as `Projects/Alpha/Excel Migration - Note.md`

#### Scenario: Profile-derived destination already exists
- **GIVEN** the active profile derives a destination that already exists
- **WHEN** Soundings classifies the candidate
- **THEN** the candidate is blocked by that exact destination
- **AND** the existing Markdown remains unchanged
