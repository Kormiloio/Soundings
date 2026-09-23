# Spec Delta

## ADDED Requirements

### Requirement: Accessible manual scan entry points
On Obsidian desktop, Soundings SHALL expose one persistent ribbon control labeled **Scan vault for transcripts** and SHALL retain the command-palette scan command. Activating either entry point SHALL invoke the same reviewed discovery workflow and SHALL NOT select or convert any transcript automatically.

#### Scenario: Ribbon control is discoverable
- **GIVEN** Soundings is enabled in an Obsidian desktop vault
- **WHEN** the user inspects or focuses the left ribbon
- **THEN** exactly one Soundings waves control is available with the label **Scan vault for transcripts**

#### Scenario: Ribbon activation opens the reviewed scan
- **GIVEN** Soundings is idle and supported transcripts exist in the vault
- **WHEN** the user activates the Soundings ribbon control
- **THEN** Soundings performs the same non-mutating discovery used by the command-palette command
- **AND** presents the conversion plan without preselecting any candidate

#### Scenario: Existing command remains available
- **GIVEN** Soundings is enabled
- **WHEN** the user opens the command palette
- **THEN** **Soundings: Scan vault for transcripts** remains available and invokes the same reviewed scan

#### Scenario: Ribbon activation during active work is guarded
- **GIVEN** Soundings is already scanning or converting
- **WHEN** the user activates the ribbon control
- **THEN** Soundings reports that work is already active
- **AND** does not start a parallel scan or mutate vault content

#### Scenario: Plugin unload removes the entry point
- **GIVEN** the Soundings ribbon control is registered
- **WHEN** the plugin unloads or is disabled
- **THEN** the control is no longer actionable and owned work is canceled under the existing lifecycle rules
