# Spec Delta

## ADDED Requirements

### Requirement: Event-driven discovery uses the scan safety policy
Event-driven discovery SHALL recognize the same enabled formats and enforce the same configured Obsidian directory, hidden-folder, Soundings-state, user-exclusion, path-validation, and maximum-size boundaries as a manual scan before reading candidate content.

#### Scenario: Manual and event discovery agree
- **GIVEN** a supported file is created while observation is enabled
- **WHEN** both event-driven discovery and a later manual scan evaluate the same unchanged file and settings
- **THEN** both paths agree whether the file is a supported candidate
- **AND** neither path mutates the vault

#### Scenario: Observation root is invalid
- **GIVEN** an observation root is absolute, empty, traverses above the vault, or otherwise invalid
- **WHEN** Soundings validates observation settings
- **THEN** Soundings rejects the value and does not register broadened observation behavior
