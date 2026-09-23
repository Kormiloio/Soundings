# transcript-discovery Specification

## Purpose

Provide a read-only inventory of transcript candidates throughout an Obsidian desktop vault while consistently honoring privacy and safety exclusions.

## Requirements

### Requirement: Recursive supported-file discovery
Soundings SHALL discover regular vault files recursively through Obsidian's public vault API and SHALL recognize `.txt` and `.vtt` extensions case-insensitively.

#### Scenario: Nested transcript is discovered
- **GIVEN** a supported transcript exists several folders below the vault root
- **WHEN** the user starts a vault scan
- **THEN** Soundings includes the transcript in the discovered candidate inventory with its vault-relative path and source format

#### Scenario: Mixed-case extension is supported
- **GIVEN** a regular vault file has the extension `.TXT` or `.VTT`
- **WHEN** Soundings scans the vault
- **THEN** Soundings classifies the file as the corresponding supported transcript format

#### Scenario: Unsupported file is not a conversion candidate
- **GIVEN** a vault contains files with extensions other than the enabled transcript formats
- **WHEN** Soundings scans the vault
- **THEN** those files are not offered for conversion

### Requirement: Safe scan exclusions
Soundings SHALL exclude `.obsidian/`, hidden folders, Soundings-owned state, and user-configured excluded paths before reading candidate content.

#### Scenario: Default private paths are excluded
- **GIVEN** a supported-looking file is located under `.obsidian/` or another hidden folder
- **WHEN** Soundings scans the vault with default settings
- **THEN** Soundings does not read or offer that file for conversion

#### Scenario: User-configured folder is excluded
- **GIVEN** the user has configured a vault-relative folder exclusion
- **WHEN** Soundings scans the vault
- **THEN** supported-looking files at or below that path are excluded from conversion

#### Scenario: Invalid exclusion remains safe
- **GIVEN** a configured exclusion is empty, absolute, traverses above the vault, or otherwise invalid
- **WHEN** Soundings validates scan settings
- **THEN** Soundings rejects the invalid value and does not broaden the scan because of it

### Requirement: Discovery is non-mutating and interruptible
A discovery scan SHALL NOT create, modify, move, rename, or delete vault files and SHALL be cancelable.

#### Scenario: Completed scan leaves vault unchanged
- **GIVEN** a vault containing supported and unsupported files
- **WHEN** a discovery scan completes
- **THEN** the bytes and paths of all vault files remain unchanged

#### Scenario: User cancels discovery
- **GIVEN** a discovery scan is in progress
- **WHEN** the user cancels the scan
- **THEN** Soundings stops further discovery work, reports the scan as canceled, and leaves the vault unchanged

### Requirement: Per-file discovery failure isolation
Soundings SHALL classify an inaccessible candidate with an actionable content-free reason and SHALL continue scanning unrelated files.

#### Scenario: One candidate cannot be read
- **GIVEN** one supported transcript becomes inaccessible during discovery while other candidates remain readable
- **WHEN** Soundings completes the scan
- **THEN** the inaccessible item is reported as unreadable without transcript content and the other candidates are still inventoried

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
