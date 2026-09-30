# Spec Delta

## ADDED Requirements

### Requirement: Parse-aware candidate classification
Soundings SHALL parse each readable, size-permitted supported candidate during discovery before classifying it as eligible. A candidate with malformed content SHALL be classified as unreadable, a recognized WebVTT file containing unsupported structures SHALL be classified as unsupported, and only a successfully parsed candidate SHALL be classified as eligible and receive source evidence.

#### Scenario: Parsable candidate is eligible before review
- **GIVEN** a readable supported transcript passes exclusions and size checks and can be parsed successfully
- **WHEN** Soundings builds the review plan
- **THEN** the candidate is classified as eligible with content-free source evidence

#### Scenario: Malformed WebVTT is unreadable before review
- **GIVEN** a `.vtt` candidate lacks a valid `WEBVTT` signature or contains malformed cue timing
- **WHEN** Soundings builds the review plan
- **THEN** the candidate is classified as unreadable and cannot be selected for conversion

#### Scenario: Unsupported WebVTT structure is reported before review
- **GIVEN** a recognized WebVTT candidate contains an unsupported control record or cue markup
- **WHEN** Soundings builds the review plan
- **THEN** the candidate is classified as unsupported and cannot be selected for conversion

#### Scenario: Parse-aware discovery remains non-mutating
- **GIVEN** a scan evaluates eligible, malformed, and unsupported candidates
- **WHEN** Soundings parses and classifies them for review
- **THEN** no source or destination file is created, modified, moved, renamed, or deleted
