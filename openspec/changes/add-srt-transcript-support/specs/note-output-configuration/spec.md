# Note Output Configuration Delta

## ADDED Requirements

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
