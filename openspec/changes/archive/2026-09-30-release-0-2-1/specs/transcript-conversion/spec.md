# Spec Delta

## MODIFIED Requirements

### Requirement: Faithful WebVTT conversion
Soundings SHALL validate the WebVTT signature, ignore header metadata lines that follow the signature before the first blank line, accept cue timestamps in either `mm:ss.sss` or `hh:mm:ss.sss` form, omit WebVTT control records and cue settings from prose, preserve cue text order, retain speaker attribution only when explicitly and reliably encoded, and apply the validated timestamp policy. Soundings SHALL accept voice spans without a closing tag and multiple voice spans within one cue without dropping their text, and SHALL attribute each voice span's text only to that span's speaker. Lines that are empty or contain only spaces or tabs SHALL separate cues. Character references SHALL be decoded exactly once. The `omit` policy SHALL exclude cue timing syntax, while the `retain` policy SHALL render each retained source timestamp deterministically without changing its represented time.

#### Scenario: Zoom-style WebVTT is converted
- **GIVEN** a valid WebVTT transcript with ordered cues, timestamps, and explicit voice spans and the timestamp policy is `omit`
- **WHEN** Soundings converts the source
- **THEN** the transcript contains the cue text in order with explicit speaker names and excludes the `WEBVTT` header, cue identifiers, timestamps, and cue settings

#### Scenario: Zoom-style timestamps are retained
- **GIVEN** a valid WebVTT transcript with ordered cues and the timestamp policy is `retain`
- **WHEN** Soundings converts the source
- **THEN** each rendered cue includes its source start and end time in a documented deterministic form
- **AND** cue text order and represented times remain faithful to the source

#### Scenario: Cue timestamps omit hours
- **GIVEN** a valid WebVTT transcript uses `mm:ss.sss` cue timestamps
- **WHEN** Soundings converts the source
- **THEN** the cue text is converted in order without requiring an hours component

#### Scenario: Voice tags are unclosed or repeated within a cue
- **GIVEN** a valid WebVTT cue contains an unclosed voice span or multiple voice spans for different speakers
- **WHEN** Soundings converts the source
- **THEN** the transcript preserves every voice span's text in source order without exposing voice-tag markup
- **AND** each span's text appears under its own speaker with the cue's timing
- **AND** text before the first voice span in the cue has no speaker attribution

#### Scenario: Header metadata follows the signature
- **GIVEN** a WebVTT file has `Kind:` or `Language:` lines directly below `WEBVTT` followed by a blank line and valid cues
- **WHEN** Soundings discovers or converts the source
- **THEN** the source is eligible and the header lines do not appear in the transcript

#### Scenario: Whitespace-only line separates cues
- **GIVEN** two cues are separated by a line containing only spaces
- **WHEN** Soundings converts the source
- **THEN** the cues become separate blocks and no timing line appears in transcript text

#### Scenario: Encoded character reference is decoded once
- **GIVEN** cue text contains `&amp;lt;`
- **WHEN** Soundings converts the source
- **THEN** the transcript text contains `&lt;`

#### Scenario: Repeated adjacent caption text is not invented or dropped silently
- **GIVEN** a valid WebVTT file contains overlapping or repeated cue text
- **WHEN** Soundings converts the source
- **THEN** Soundings applies a documented deterministic rule and the result can be traced to the source cue sequence

#### Scenario: Malformed WebVTT fails individually
- **GIVEN** a `.vtt` candidate lacks a valid WebVTT signature or contains structure that cannot be parsed safely
- **WHEN** Soundings attempts conversion
- **THEN** Soundings reports a parse failure for that source and produces no Markdown content for publication
