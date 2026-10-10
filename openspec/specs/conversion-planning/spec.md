# conversion-planning Specification

## Purpose

Produce a complete, non-mutating conversion preview that makes destinations, collisions, source evidence, exclusions, and user selection explicit before execution.

## Requirements

### Requirement: Deterministic destination derivation
For each supported source, Soundings SHALL derive an Obsidian-safe destination in the source folder by preserving an already-safe basename, replacing each run of control characters or `\`, `:`, `*`, `?`, `"`, `<`, `>`, or `|` together with adjacent whitespace in the basename with a single ` - ` separator, trimming unsafe trailing spaces and periods, and appending `.md`. A sanitized basename that begins with `.` SHALL be refused as a destination that cannot be derived safely. Soundings SHALL expose this exact destination during review and SHALL NOT rename or otherwise mutate the source.

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

#### Scenario: Sanitization produces a hidden destination
- **GIVEN** a supported source at `Notes/?.env.txt`
- **WHEN** Soundings plans its conversion
- **THEN** the item is blocked with an actionable reason that no safe visible destination can be derived
- **AND** no destination is created and the source is unchanged

### Requirement: Collision-first classification
Soundings SHALL classify a candidate as blocked when its final sanitized destination already exists or when multiple candidates in the same plan resolve to the same sanitized destination, comparing paths by their Unicode NFC, case-folded form, and SHALL NOT select a blocked candidate for execution.

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

#### Scenario: Existing destination differs only by letter case
- **GIVEN** `a/Bar.txt` and `a/bar.md` both exist
- **WHEN** Soundings builds the plan
- **THEN** `a/Bar.txt` is classified as blocked by the existing destination
- **AND** `a/bar.md` remains byte-for-byte unchanged

#### Scenario: Sources differ only by letter case or Unicode form
- **GIVEN** `a/Foo.txt` and `a/foo.vtt` exist, or two sources whose names differ only by NFC and NFD composition, and no destination exists
- **WHEN** Soundings builds the plan
- **THEN** both candidates are blocked by an ambiguous destination collision

### Requirement: Stable source evidence
Each eligible planned conversion SHALL record evidence sufficient to detect a missing or content-changed source before execution without retaining transcript content in diagnostics.

#### Scenario: Eligible candidate records evidence
- **GIVEN** a readable supported transcript with no destination collision
- **WHEN** Soundings builds the plan
- **THEN** the plan marks it eligible and records its path, format, byte length, and a content identity value

### Requirement: Parse-aware candidate classification
Soundings SHALL parse each readable, size-permitted supported candidate during discovery before classifying it as eligible. A candidate with malformed content SHALL be classified as unreadable, a recognized WebVTT file containing unsupported structures SHALL be classified as unsupported, and only a successfully parsed candidate SHALL be classified as eligible and receive source evidence.

#### Scenario: Parsable candidate is eligible before review
- **GIVEN** a readable supported transcript passes exclusions and size checks and can be parsed successfully
- **WHEN** Soundings builds the review plan
- **THEN** the candidate is classified as eligible with content-free source evidence

#### Scenario: Malformed WebVTT is unreadable before review
- **GIVEN** a `.vtt` candidate lacks a valid `WEBVTT` signature or contains malformed cue timing
- **WHEN** Soundings builds the review plan
- **THEN** the candidate is classified as unreadable and cannot be selected for conversion

#### Scenario: Unsupported WebVTT structure is reported before review
- **GIVEN** a recognized WebVTT candidate contains an unsupported control record or cue markup
- **WHEN** Soundings builds the review plan
- **THEN** the candidate is classified as unsupported and cannot be selected for conversion

#### Scenario: Parse-aware discovery remains non-mutating
- **GIVEN** a scan evaluates eligible, malformed, and unsupported candidates
- **WHEN** Soundings parses and classifies them for review
- **THEN** no source or destination file is created, modified, moved, renamed, or deleted

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

### Requirement: Review binds TXT interpretation
Soundings SHALL offer Plain text and Timestamped speaker as validated TXT layout choices, defaulting missing or invalid persisted values to Plain text. Plans SHALL capture the validated interpretation policy independently of output display, show the selected TXT layout, and show each eligible TXT candidate's actual interpretation as plain, recognized timestamped-speaker, or whole-file plain fallback with a content-free reason. Discovery and execution SHALL use the same reviewed policy. Any effective policy change or alteration of captured policy after review SHALL prevent publication until a fresh plan is reviewed. Changing TXT layout SHALL NOT enable TXT conversion or automatic publication.

#### Scenario: Existing installation remains plain
- **GIVEN** persisted settings lack a valid TXT layout value
- **WHEN** Soundings loads settings and scans
- **THEN** Plain text is selected and existing TXT interpretation is unchanged

#### Scenario: Actual fallback is visible
- **GIVEN** Timestamped speaker is selected and a plan contains recognized and unfamiliar TXT
- **WHEN** the user reviews candidates
- **THEN** recognized and whole-file fallback rows have distinct content-free interpretation descriptions
- **AND** both remain eligible when otherwise permitted and the plan creates no files

#### Scenario: Layout changes after preview
- **GIVEN** an eligible TXT was reviewed and selected
- **WHEN** effective or captured TXT layout changes before creation
- **THEN** publication is refused as stale and a refreshed unselected plan is required

#### Scenario: Source changes after preview
- **GIVEN** a selected recognized TXT has recorded source evidence
- **WHEN** its bytes change before execution
- **THEN** existing evidence guards refuse publication without silently switching interpretation

#### Scenario: Destination collision still blocks creation
- **GIVEN** structured or fallback TXT resolves to an existing or competing normalized destination, or a destination appears after review
- **WHEN** Soundings plans or executes conversion
- **THEN** it refuses creation and preserves all existing source and destination bytes

#### Scenario: Cancellation and failures retain isolation
- **GIVEN** a selected mixed batch includes structured TXT
- **WHEN** cancellation or unload occurs before creation, or one item becomes unreadable
- **THEN** lifecycle guards prevent later publication for canceled items and a failed item produces no destination
- **AND** uncanceled unrelated valid selections retain existing isolated execution behavior
