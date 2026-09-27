# Spec Delta

## MODIFIED Requirements

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
