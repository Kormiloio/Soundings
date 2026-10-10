# Transcript Discovery Delta

## MODIFIED Requirements

### Requirement: Recursive supported-file discovery
Soundings SHALL discover regular vault files recursively through Obsidian's public vault API and SHALL recognize `.txt`, `.vtt`, and `.srt` extensions case-insensitively. Only enabled formats SHALL be offered as candidates.

#### Scenario: Nested transcript is discovered
- **GIVEN** an enabled supported transcript exists several folders below the vault root
- **WHEN** the user starts a vault scan
- **THEN** Soundings includes the transcript in the discovered candidate inventory with its vault-relative path and source format

#### Scenario: Mixed-case extension is supported
- **GIVEN** a regular vault file has the enabled extension `.TXT`, `.VTT`, or `.SRT`
- **WHEN** Soundings scans the vault
- **THEN** Soundings classifies the file as the corresponding supported transcript format

#### Scenario: Unsupported file is not a conversion candidate
- **GIVEN** a vault contains files with extensions other than the enabled transcript formats
- **WHEN** Soundings scans the vault
- **THEN** those files are not offered for conversion

## ADDED Requirements

### Requirement: SRT discovery shares privacy and classification boundaries
Soundings SHALL apply the existing path, exclusion, source-size, decoding, parsing, and evidence policy to SRT candidates in both manual and event-driven discovery. An invalid SRT structure SHALL be unreadable before selection, an empty source SHALL be empty, and a valid source SHALL receive evidence only after successful parsing. Reasons SHALL NOT contain transcript content.

#### Scenario: Private or oversized SRT is not read
- **GIVEN** SRT is enabled and a candidate is under the configured Obsidian directory, a hidden folder, Soundings state, a user-excluded folder, or exceeds the source-size limit
- **WHEN** discovery evaluates that candidate
- **THEN** it is excluded or oversized as appropriate without reading its content
- **AND** the vault is unchanged

#### Scenario: Valid and malformed SRT are classified independently
- **GIVEN** SRT is enabled and the vault contains one valid source and one with malformed cue timing
- **WHEN** the scan completes
- **THEN** the valid source is eligible with content-free evidence and the malformed source is unreadable without evidence
- **AND** neither source has been modified or converted

#### Scenario: Manual and event discovery agree for SRT
- **GIVEN** observation and SRT are explicitly enabled and an unchanged SRT file is created within an observation root
- **WHEN** event-driven discovery and a manual scan evaluate the file
- **THEN** both apply the same format and safety policy
- **AND** event discovery only queues review and does not automatically convert the file

#### Scenario: SRT discovery is canceled
- **GIVEN** a scan containing SRT candidates is in progress
- **WHEN** the user cancels discovery
- **THEN** further discovery stops at the existing cooperative cancellation boundary
- **AND** all source and destination bytes remain unchanged
