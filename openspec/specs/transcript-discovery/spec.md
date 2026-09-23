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
