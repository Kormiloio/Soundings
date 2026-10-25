# Manual Enrichment Delta

## ADDED Requirements

### Requirement: Verified shared-text notes support manual companions
Soundings SHALL accept readable, safely linkable schema-3 shared-text notes with an unambiguous supported tuple of type, source, TXT source format, and one supported content_kind for the existing manual enrichment workflow. Existing schema-1/2 transcript eligibility SHALL remain supported. Unknown schemas, duplicate required identity keys, missing kind, or incompatible metadata tuples SHALL be refused with a content-free reason. Eligibility SHALL NOT extend to arbitrary Markdown merely because it contains a content-kind label. Verified identity and content evidence SHALL be revalidated before companion publication.

#### Scenario: Every shared-text kind can be enriched
- **GIVEN** a generated schema-3 note for Notes, Meeting Minutes, Correspondence, or Chat and an absent companion
- **WHEN** the user enters enrichment, reviews it, and explicitly confirms publication
- **THEN** one verified adjacent companion is created through the existing manual workflow
- **AND** the original TXT, source note, and existing Markdown remain unchanged

#### Scenario: Malformed or future identity is refused
- **GIVEN** an active note has unknown schema, duplicate identity keys, unsupported kind, a schema-3 meeting-transcript tuple, or a non-TXT shared-text format
- **WHEN** manual enrichment is requested
- **THEN** Soundings refuses eligibility without creating a file or accepting it as a legacy transcript

#### Scenario: Shared-text evidence becomes stale
- **GIVEN** a supported shared-text note was reviewed for enrichment
- **WHEN** its content or kind metadata changes before publication
- **THEN** publication is stale, no companion is created, and entered fields remain available for fresh review

#### Scenario: Companion collision cancellation and failure retain protections
- **GIVEN** reviewed enrichment for a shared-text note
- **WHEN** a case/Unicode-equivalent companion exists or appears, cancellation/unload occurs before creation, or reading/creation fails
- **THEN** existing create-only and lifecycle protections prevent unreviewed or partial publication
- **AND** the original source and source note remain unchanged and failed publication retains the draft under existing rules

### Requirement: New companions use neutral source-note wording
Every newly rendered manual companion SHALL use the full safe vault-relative backlink with display label Back to Source Note, for both legacy transcript and shared-text notes. Preview and publication SHALL show the same link and exact destination. Existing notes and companions SHALL NOT be rewritten merely to change this wording. The companion's four manual sections, metadata, literal-input protections, and destination suffix SHALL otherwise remain unchanged.

#### Scenario: Neutral backlink resolves to the right note
- **GIVEN** a supported transcript or shared-text note in a nested folder
- **WHEN** its companion is reviewed and published
- **THEN** the link is `[[full/path/Source name|Back to Source Note]]` and opens that exact source note
- **AND** no source content is inserted into diagnostics

#### Scenario: Existing companions are not relabeled
- **GIVEN** a companion already exists with Back to Transcript Note wording
- **WHEN** the plugin is upgraded or manual enrichment is requested again
- **THEN** the companion remains unchanged and an attempted duplicate publication remains blocked
