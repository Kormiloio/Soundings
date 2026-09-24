# Spec Delta

## MODIFIED Requirements

### Requirement: Safe scan exclusions
Soundings SHALL exclude the active vault's configured Obsidian configuration directory, hidden folders, Soundings-owned state, and user-configured excluded paths before reading candidate content. The configured Obsidian directory exclusion SHALL apply even when the user has renamed it from `.obsidian`.

#### Scenario: Default private paths are excluded
- **GIVEN** a supported-looking file is located under the vault's configured Obsidian directory, another hidden folder, or Soundings-owned state
- **WHEN** Soundings scans the vault with default settings
- **THEN** Soundings does not read or offer that file for conversion

#### Scenario: Renamed configuration directory is excluded
- **GIVEN** the active vault's Obsidian configuration directory is a valid vault-relative path other than `.obsidian`
- **WHEN** Soundings scans the vault
- **THEN** files at or below that configured path are excluded before candidate content is read
- **AND** the exclusion does not depend on a user-entered setting

#### Scenario: User-configured folder is excluded
- **GIVEN** the user has configured a vault-relative folder exclusion
- **WHEN** Soundings scans the vault
- **THEN** supported-looking files at or below that path are excluded from conversion

#### Scenario: Invalid exclusion remains safe
- **GIVEN** a configured exclusion is empty, absolute, traverses above the vault, or otherwise invalid
- **WHEN** Soundings validates scan settings
- **THEN** Soundings rejects the invalid value and does not broaden the scan because of it

#### Scenario: Configured vault directory cannot be accepted safely
- **GIVEN** the host-provided Obsidian configuration directory cannot be normalized as a safe vault-relative path
- **WHEN** Soundings prepares settings for a scan
- **THEN** Soundings reports a content-free configuration failure
- **AND** does not start discovery or mutate vault content
