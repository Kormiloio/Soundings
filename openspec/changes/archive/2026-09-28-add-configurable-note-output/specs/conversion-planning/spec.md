# Spec Delta

## ADDED Requirements

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
