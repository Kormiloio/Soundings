# Spec Delta

## MODIFIED Requirements

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
