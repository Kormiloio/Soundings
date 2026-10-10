# note-output-configuration Specification

## Purpose
Provide a constrained, validated output profile that lets users tailor deterministic notes while preserving safe paths, faithful transcript content, and predictable rendering.

## Requirements

### Requirement: Output profiles use constrained choices
Soundings SHALL support only documented built-in choices for reserved sections, static tags, title pattern, destination-name pattern, WebVTT timestamp policy, and transcript display. The supported title patterns SHALL be `source-name` and `parent-folder-source-name`. The supported destination-name patterns SHALL be `source-name` and `source-name-note`. The supported transcript displays SHALL be `plain` (the default) and `folded-callout`. It SHALL NOT execute user-supplied code or interpolate arbitrary vault content.

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

#### Scenario: Saved profile predates transcript display
- **GIVEN** saved settings contain an output profile without a transcript display value
- **WHEN** Soundings migrates the settings
- **THEN** the effective transcript display is `plain`
- **AND** generated notes are byte-identical to those produced before the option existed

#### Scenario: Unknown transcript display is supplied
- **GIVEN** a saved or edited profile sets transcript display to a value other than `plain` or `folded-callout`
- **WHEN** Soundings validates settings
- **THEN** the value is rejected with an actionable error
- **AND** no conversion uses it

#### Scenario: Review shows the transcript display
- **GIVEN** the transcript display is `folded-callout`
- **WHEN** Soundings builds the conversion plan
- **THEN** the output-profile summary states that transcripts are shown as a folded callout

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
Each conversion plan SHALL bind to the validated output profile used to derive and render it, including its transcript display. Execution SHALL fail closed when the effective output profile has changed since planning.

#### Scenario: Profile changes after review
- **GIVEN** the user reviewed and selected a candidate under one output profile
- **WHEN** the saved output profile changes before execution
- **THEN** Soundings reports the item as stale or blocked
- **AND** creates no destination

#### Scenario: Transcript display changes after review
- **GIVEN** the user reviewed and selected a candidate with transcript display `plain`
- **WHEN** the transcript display changes to `folded-callout` before execution
- **THEN** Soundings reports the item as stale
- **AND** creates no destination

### Requirement: Saved settings are type-validated
Soundings SHALL validate the runtime type of every saved setting when loading. A field with the wrong type SHALL fall back to its safe default with a content-free warning, mandatory exclusions SHALL always be applied, and a malformed settings file SHALL NOT prevent the plugin from loading or enable any disabled capability.

#### Scenario: Boolean setting is saved as a string
- **GIVEN** the saved settings contain `observationEnabled: "false"`
- **WHEN** Soundings loads its settings
- **THEN** transcript observation remains disabled

#### Scenario: List setting has the wrong type
- **GIVEN** the saved settings contain a non-array `excludedPaths` or non-string entries in `enabledFormats` or `observationRoots`
- **WHEN** Soundings loads
- **THEN** the plugin loads with the safe default for each invalid field and mandatory exclusions applied
- **AND** no file is changed until the user explicitly saves settings

### Requirement: SRT is explicitly enabled without broadening saved settings
Soundings SHALL expose an accessible SRT format toggle, disabled by default. Loading settings SHALL preserve an existing valid enabled-format list without adding SRT. Missing or malformed format settings SHALL use the existing safe TXT/VTT default rather than enabling SRT. Explicitly enabled SRT SHALL persist through validated save/reload, including an SRT-only selection.

#### Scenario: Existing enabled formats survive upgrade
- **GIVEN** saved settings enable TXT only or TXT/VTT and observation is disabled
- **WHEN** the user loads the SRT-capable version
- **THEN** the enabled formats remain unchanged, SRT stays disabled, and observation remains disabled

#### Scenario: Missing or malformed format settings do not enable SRT
- **GIVEN** enabled-format settings are absent or have the wrong runtime type
- **WHEN** Soundings loads settings
- **THEN** the safe TXT/VTT default applies without enabling SRT
- **AND** no settings file is rewritten automatically

#### Scenario: User explicitly enables only SRT
- **GIVEN** the user enables SRT and disables TXT/VTT through settings
- **WHEN** validated settings are saved and reloaded
- **THEN** only SRT is enabled and the shared scan/event policy uses that selection

### Requirement: Caption timestamp controls cover VTT and SRT
Soundings SHALL present one caption timestamp control and corresponding review summary applying `omit` or `retain` to both VTT and SRT. Existing saved timestamp choices and fingerprints SHALL remain semantically compatible; changing the choice after review SHALL invalidate the plan. This control SHALL NOT interpret timestamp-like strings in plain TXT.

#### Scenario: Retain applies to both caption formats
- **GIVEN** an existing profile retains WebVTT timestamps and SRT is explicitly enabled
- **WHEN** the user reviews VTT and SRT candidates
- **THEN** settings and review describe one caption timestamp policy and both formats retain their represented cue times

#### Scenario: Timestamp policy changes after SRT review
- **GIVEN** an SRT was reviewed and selected with timestamps omitted
- **WHEN** the effective policy changes to retain before execution
- **THEN** conversion is stale or blocked and creates no destination

#### Scenario: TXT timestamp-like text is untouched
- **GIVEN** a TXT source contains `[00:12:34] Alice: hello`
- **WHEN** either caption timestamp choice is used
- **THEN** that TXT string remains literal text without extracted timing or speaker attribution
