# Spec Delta

## Purpose

Produce a complete, non-mutating conversion preview that makes destinations, collisions, source evidence, exclusions, and user selection explicit before execution.

## ADDED Requirements

### Requirement: Deterministic destination derivation
For each supported source, Soundings SHALL derive the destination by replacing only the source file's final extension with `.md` in the same folder.

#### Scenario: Destination beside plain-text source
- **GIVEN** a source at `Projects/ProMBA/Meeting 1.txt`
- **WHEN** Soundings plans its conversion
- **THEN** the intended destination is `Projects/ProMBA/Meeting 1.md`

#### Scenario: Filename contains multiple periods
- **GIVEN** a source at `Projects/ProMBA/Meeting.2026.09.22.vtt`
- **WHEN** Soundings plans its conversion
- **THEN** the intended destination is `Projects/ProMBA/Meeting.2026.09.22.md`

### Requirement: Collision-first classification
Soundings SHALL classify a candidate as blocked when its destination already exists or when multiple candidates in the same plan resolve to the same destination, and SHALL NOT select a blocked candidate for execution.

#### Scenario: Existing Markdown destination blocks conversion
- **GIVEN** `Meeting.txt` and `Meeting.md` both exist in the same folder
- **WHEN** Soundings builds the plan
- **THEN** `Meeting.txt` is classified as blocked by an existing destination and `Meeting.md` remains untouched

#### Scenario: Two sources resolve to one destination
- **GIVEN** `Meeting.txt` and `Meeting.vtt` exist in the same folder while `Meeting.md` is absent
- **WHEN** Soundings builds the plan
- **THEN** both candidates are blocked by an ambiguous destination collision until the user resolves it outside Soundings

### Requirement: Stable source evidence
Each eligible planned conversion SHALL record evidence sufficient to detect a missing or content-changed source before execution without retaining transcript content in diagnostics.

#### Scenario: Eligible candidate records evidence
- **GIVEN** a readable supported transcript with no destination collision
- **WHEN** Soundings builds the plan
- **THEN** the plan marks it eligible and records its path, format, byte length, and a content identity value

### Requirement: Reviewable plan and explicit selection
Soundings SHALL show each candidate's source, intended destination, classification, and reason, and SHALL execute only eligible items the user explicitly selects from the current plan.

#### Scenario: User reviews nested candidates
- **GIVEN** a scan finds eligible, excluded, unreadable, and colliding transcripts in different folders
- **WHEN** Soundings presents the conversion plan
- **THEN** the user can distinguish every classification and inspect the vault-relative source and destination for each actionable item

#### Scenario: Eligible item is not selected
- **GIVEN** an eligible conversion appears in the current plan
- **WHEN** the user starts execution without selecting that item
- **THEN** Soundings performs no write for that item

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
