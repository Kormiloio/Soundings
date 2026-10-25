# Conversion Planning Delta

## ADDED Requirements

### Requirement: Explicit per-file TXT content kind
Soundings SHALL offer each eligible TXT candidate a Content type choice of Transcript, Notes, Meeting Minutes, Correspondence, or Chat. Every fresh manual-scan or inbox review SHALL default to Transcript with nothing selected. Choices SHALL be local to that review, never inferred from content or remembered across refresh/reopen. VTT/SRT SHALL remain Transcript, and changing kind SHALL NOT enable a disabled format, bypass an exclusion or classification, or start conversion.

#### Scenario: Mixed TXT kinds are reviewed
- **GIVEN** a fresh review has several eligible TXT candidates
- **WHEN** the user chooses Notes for one and Correspondence for another
- **THEN** each row shows its chosen kind and effective literal interpretation without changing other rows or creating files
- **AND** both require explicit selection before conversion

#### Scenario: Kind change clears only that selection
- **GIVEN** several rows are selected and have reviewed content kinds
- **WHEN** the user changes one eligible TXT row's kind
- **THEN** that row becomes unselected and its revised kind and interpretation are visible before reselection
- **AND** unchanged rows retain their reviewed kinds and selection, including hidden rows

#### Scenario: Refresh and filtering have distinct behavior
- **GIVEN** the user chose non-transcript kinds and selected some rows
- **WHEN** the user changes search or classification filters
- **THEN** kinds and selections for unchanged rows remain intact
- **AND** refreshing or reopening review instead resets every kind to Transcript and clears every selection

#### Scenario: Blocked or non-TXT row cannot be retyped
- **GIVEN** a row is blocked, excluded, unreadable, empty, oversize, or a VTT/SRT candidate
- **WHEN** the user reviews the plan or submits an incompatible kind assignment
- **THEN** no non-transcript conversion becomes eligible through that assignment

### Requirement: Publication binds reviewed content kind
Soundings SHALL bind each item's validated content kind and effective interpretation to the current reviewed plan revision and explicit selection. Publication SHALL reject unknown kinds, incompatible format/kind combinations, stale revisions, or altered captured policy rather than silently substitute Transcript. Missing kind on a supported legacy plan SHALL mean Transcript. The existing source, settings, output-profile, destination, cancellation, unload, and failure-isolation guards SHALL apply to every kind.

#### Scenario: Captured kind changes after selection
- **GIVEN** a TXT row was reviewed as Notes and selected
- **WHEN** its captured kind or effective interpretation changes outside the reviewed revision before creation
- **THEN** publication is refused as stale or invalid with a content-free reason and no destination

#### Scenario: Revised row returns to Transcript
- **GIVEN** a TXT row was changed from Transcript to Chat
- **WHEN** the user changes it back to Transcript
- **THEN** the reviewed global TXT layout and original transcript interpretation apply again
- **AND** the row requires fresh explicit selection

#### Scenario: Source changes or destination appears
- **GIVEN** shared-text TXT was reviewed and selected
- **WHEN** its bytes change or a case/Unicode-equivalent destination appears before creation
- **THEN** the existing stale-evidence or collision outcome prevents publication and preserves protected bytes

#### Scenario: Cancellation and isolated failure
- **GIVEN** a selected batch contains mixed content kinds
- **WHEN** cancellation or unload occurs before creation, or a source becomes unreadable
- **THEN** canceled items create no later destinations and unreadable items fail without partial output
- **AND** uncanceled unrelated valid selections retain isolated execution behavior

## MODIFIED Requirements

### Requirement: Review binds TXT interpretation
For TXT reviewed as Transcript, Soundings SHALL offer Plain text and Timestamped speaker as validated TXT layout choices, defaulting missing or invalid persisted values to Plain text. Plans SHALL capture the validated interpretation policy independently of output display, show the selected TXT layout, and show each eligible TXT candidate's actual interpretation as plain, recognized timestamped-speaker, or whole-file plain fallback with a content-free reason. Discovery and execution SHALL use the same reviewed policy. Any effective policy change or alteration of captured policy after review SHALL prevent publication until a fresh plan is reviewed. Changing TXT layout SHALL NOT enable TXT conversion or automatic publication. For explicitly non-transcript TXT, the effective interpretation SHALL instead be whole-file literal plain text regardless of the global TXT layout; review SHALL show that override without changing the global setting. Returning a row to Transcript SHALL restore the captured transcript layout under a revised, unselected row.

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
