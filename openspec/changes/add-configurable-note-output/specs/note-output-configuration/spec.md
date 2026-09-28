# Spec Delta

## Purpose

Provide a constrained, validated output profile that lets users tailor deterministic notes while preserving safe paths, faithful transcript content, and predictable rendering.

## ADDED Requirements

### Requirement: Output profiles use constrained choices
Soundings SHALL support only documented built-in choices for reserved sections, static tags, title pattern, destination-name pattern, and WebVTT timestamp policy. The supported title patterns SHALL be `source-name` and `parent-folder-source-name`. The supported destination-name patterns SHALL be `source-name` and `source-name-note`. It SHALL NOT execute user-supplied code or interpolate arbitrary vault content.

#### Scenario: Content-neutral title patterns are derived
- **GIVEN** `Projects/Alpha/Excel Migration.txt` uses the `parent-folder-source-name` title pattern
- **WHEN** Soundings derives the note title
- **THEN** the title is `Alpha — Excel Migration`
- **AND** a root-level source falls back to its source name without inventing a content type

#### Scenario: Content-neutral destination suffix is derived
- **GIVEN** `Projects/Alpha/Excel Migration.txt` uses the `source-name-note` destination pattern
- **WHEN** Soundings derives and safely normalizes the destination
- **THEN** the destination is `Projects/Alpha/Excel Migration - Note.md`
- **AND** the source path is unchanged

#### Scenario: Existing user retains current output
- **GIVEN** saved settings predate output profiles
- **WHEN** Soundings migrates the settings
- **THEN** the effective profile uses `source-name` for both title and destination
- **AND** reproduces the prior note structure and timestamp omission behavior

#### Scenario: Unsafe profile value is supplied
- **GIVEN** a profile contains an unknown pattern, invalid tag, unsafe path segment, or unsupported timestamp policy
- **WHEN** Soundings validates settings
- **THEN** the invalid profile is rejected with an actionable error
- **AND** no conversion begins

### Requirement: Output settings are previewable
Soundings SHALL expose the effective output-profile summary and exact final destination during review before a candidate can be selected.

#### Scenario: User reviews a customized destination
- **GIVEN** a valid built-in destination pattern changes the generated basename
- **WHEN** Soundings builds the conversion plan
- **THEN** the plan displays the exact normalized destination and active output-profile summary
- **AND** the source remains unchanged

#### Scenario: Two customized names collide
- **GIVEN** two candidates resolve to the same final destination under the active profile
- **WHEN** Soundings builds the plan
- **THEN** both candidates are blocked as an ambiguous collision
- **AND** neither candidate can be selected

### Requirement: Settings changes do not alter an existing plan silently
Each conversion plan SHALL bind to the validated output profile used to derive and render it. Execution SHALL fail closed when the effective output profile has changed since planning.

#### Scenario: Profile changes after review
- **GIVEN** the user reviewed and selected a candidate under one output profile
- **WHEN** the saved output profile changes before execution
- **THEN** Soundings reports the item as stale or blocked
- **AND** creates no destination
