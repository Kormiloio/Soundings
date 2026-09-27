# Spec Delta

## Purpose

Surface newly created supported transcripts in an opt-in, local inbox and hand them to the existing reviewed conversion workflow without automatic publication.

## ADDED Requirements

### Requirement: Observation is explicit and lifecycle-bound
Soundings SHALL keep transcript observation disabled by default. When enabled, observation SHALL run only while the plugin is loaded in Obsidian and SHALL stop when disabled or unloaded.

#### Scenario: Existing user upgrades
- **GIVEN** a user upgrades from a version without transcript observation
- **WHEN** Soundings loads the saved settings
- **THEN** transcript observation remains disabled
- **AND** no candidate is queued until the user enables it

#### Scenario: Plugin unloads during observation
- **GIVEN** transcript observation is enabled
- **WHEN** Soundings unloads or is disabled
- **THEN** owned event subscriptions and pending observation work are canceled
- **AND** no conversion or vault mutation occurs

### Requirement: New candidates are queued safely
Soundings SHALL queue a newly created supported transcript only after applying enabled-format, configured observation-root, mandatory exclusion, user exclusion, source-size, readability, and source-evidence checks. The inbox SHALL retain only vault-relative paths and content-free evidence in memory and SHALL deduplicate repeated events for the same current source identity.

#### Scenario: Supported transcript arrives in an observed folder
- **GIVEN** observation is enabled for `Meetings/` and a readable supported transcript is created below that folder
- **WHEN** the file survives every configured safety check
- **THEN** Soundings adds one content-free inbox entry
- **AND** leaves the source and every destination unchanged

#### Scenario: Excluded transcript event arrives
- **GIVEN** a supported-looking file is created beneath a hidden folder, configured Obsidian directory, Soundings state, or user exclusion
- **WHEN** Soundings receives the creation event
- **THEN** the file is not read or queued

#### Scenario: Repeated events describe the same source
- **GIVEN** the host emits repeated creation events for the same path and current source identity
- **WHEN** Soundings processes those events
- **THEN** the inbox contains one entry for that source

#### Scenario: Candidate is temporarily unreadable
- **GIVEN** a newly created supported file cannot be read safely
- **WHEN** observation evaluates the event
- **THEN** Soundings records a content-free failure or defers that item without blocking unrelated events
- **AND** does not create a destination

### Requirement: Inbox handoff remains reviewed
Soundings SHALL notify the user when new inbox candidates are available and SHALL provide a command or notice action that opens the standard current conversion plan for those candidates with none selected. It SHALL NOT convert an inbox candidate automatically.

#### Scenario: User opens queued candidates
- **GIVEN** one or more current inbox entries exist
- **WHEN** the user opens the inbox review action
- **THEN** Soundings replans those candidates against current vault state
- **AND** presents the standard conversion review with zero selected items

#### Scenario: Destination appears before inbox review
- **GIVEN** an inbox entry was eligible when observed and its destination now exists
- **WHEN** the user opens the inbox review
- **THEN** the current plan reports the collision
- **AND** leaves the existing destination unchanged

#### Scenario: User dismisses the notification
- **GIVEN** Soundings notifies the user of queued candidates
- **WHEN** the user dismisses the notification or closes the review
- **THEN** no source or destination is changed
