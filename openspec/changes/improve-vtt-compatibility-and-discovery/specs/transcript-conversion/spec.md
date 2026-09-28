# Spec Delta

## MODIFIED Requirements

### Requirement: Faithful WebVTT conversion
Soundings SHALL validate the WebVTT signature, accept cue timestamps in either `mm:ss.sss` or `hh:mm:ss.sss` form, omit WebVTT control records and cue timing syntax from prose, preserve cue text order, and retain speaker attribution only when explicitly and reliably encoded. Soundings SHALL accept voice spans without a closing tag and multiple voice lines within one cue without dropping their text.

#### Scenario: Zoom-style WebVTT is converted
- **GIVEN** a valid WebVTT transcript with ordered cues and explicit voice spans
- **WHEN** Soundings converts the source
- **THEN** the transcript contains the cue text in order with the explicit speaker names and excludes the `WEBVTT` header, cue identifiers, timestamps, and cue settings

#### Scenario: Cue timestamps omit hours
- **GIVEN** a valid WebVTT transcript uses `mm:ss.sss` cue timestamps
- **WHEN** Soundings converts the source
- **THEN** the cue text is converted in order without requiring an hours component

#### Scenario: Voice tags are unclosed or repeated within a cue
- **GIVEN** a valid WebVTT cue contains an unclosed voice span or multiple voice lines
- **WHEN** Soundings converts the source
- **THEN** the transcript preserves every voice line in source order without exposing voice-tag markup
- **AND** retains the first explicitly encoded speaker as the cue attribution

#### Scenario: Repeated adjacent caption text is not invented or dropped silently
- **GIVEN** a valid WebVTT file contains overlapping or repeated cue text
- **WHEN** Soundings converts the source
- **THEN** Soundings applies a documented deterministic rule and the result can be traced to the source cue sequence

#### Scenario: Malformed WebVTT fails individually
- **GIVEN** a `.vtt` candidate lacks a valid WebVTT signature or contains structure that cannot be parsed safely
- **WHEN** Soundings attempts conversion
- **THEN** Soundings reports a parse failure for that source and produces no Markdown content for publication
