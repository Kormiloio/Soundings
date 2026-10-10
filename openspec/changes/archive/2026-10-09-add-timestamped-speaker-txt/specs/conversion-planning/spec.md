# Conversion Planning Delta

## ADDED Requirements

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
