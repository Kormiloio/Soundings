# safe-note-publication Specification

## Purpose

Publish only explicitly reviewed Markdown notes through a create-only boundary that preserves transcript sources, refuses stale or ambiguous work, and reports outcomes without content disclosure.

## Requirements

### Requirement: Selected create-only execution
Soundings SHALL execute only explicitly selected eligible operations from the current reviewed plan and SHALL publish only when the destination is absent at execution time.

#### Scenario: Selected eligible conversion succeeds
- **GIVEN** an eligible item is explicitly selected and its source evidence and absent destination remain current
- **WHEN** the user starts conversion
- **THEN** Soundings creates exactly one Markdown note at the reviewed destination and leaves the source unchanged

#### Scenario: Unselected item is not executed
- **GIVEN** a current plan contains selected and unselected eligible items
- **WHEN** the user starts conversion
- **THEN** Soundings attempts publication only for the selected items

### Requirement: Execution-time source revalidation
Immediately before publication, Soundings SHALL revalidate that the source still exists at the reviewed path and matches the plan's content identity.

#### Scenario: Source content changed after preview
- **GIVEN** an eligible transcript is selected and then its content changes after the plan was created
- **WHEN** Soundings reaches that operation during execution
- **THEN** Soundings refuses publication as stale, leaves the source unchanged, and requires a new scan and review

#### Scenario: Source disappeared after preview
- **GIVEN** an eligible transcript is selected and then no longer exists at its reviewed path
- **WHEN** Soundings reaches that operation during execution
- **THEN** Soundings reports the operation as stale and creates no destination

### Requirement: Execution-time collision refusal
Soundings SHALL use a create-only publication boundary that fails rather than replacing an existing destination, including when the destination appears after preview. Immediately before creation, Soundings SHALL refuse when either the vault index or the vault storage adapter reports that the destination, or a case variant of it, exists.

#### Scenario: Destination appears after preview
- **GIVEN** an eligible item is selected and another process creates its destination after preview
- **WHEN** Soundings attempts publication
- **THEN** Soundings reports a collision and leaves the existing destination byte-for-byte unchanged

#### Scenario: Destination creation races publication
- **GIVEN** the destination is absent during revalidation but is created concurrently before Soundings publishes
- **WHEN** the create-only operation loses the race
- **THEN** Soundings reports a collision and does not retry with an overwriting operation

#### Scenario: Destination exists but is not indexed
- **GIVEN** an eligible item is selected and a file exists at its destination, or at a case variant of it, that the vault index does not report
- **WHEN** Soundings attempts publication
- **THEN** Soundings reports a collision without calling the create operation
- **AND** the existing file remains byte-for-byte unchanged

### Requirement: Source preservation
Soundings SHALL NOT modify, delete, move, or rename a source transcript during planning, conversion, successful publication, failure handling, cancellation, or plugin unload.

#### Scenario: Successful batch preserves sources
- **GIVEN** one or more selected transcripts are converted successfully
- **WHEN** execution completes
- **THEN** every source remains at its original path with its original bytes

#### Scenario: Failed conversion preserves source
- **GIVEN** parsing or publication fails for a selected transcript
- **WHEN** Soundings handles the failure
- **THEN** the source remains at its original path with its original bytes

### Requirement: Cancellation and lifecycle safety
Soundings SHALL stop starting new operations after cancellation or plugin unload, SHALL close its owned review, enrichment, progress, and results interfaces on unload, and SHALL NOT expose a partially written destination. Closing the progress interface by any means SHALL cancel the active run.

#### Scenario: User cancels a batch
- **GIVEN** a multi-item conversion batch is executing
- **WHEN** the user cancels it
- **THEN** Soundings allows only the currently indivisible create operation to settle, starts no additional operations, and reports remaining items as canceled

#### Scenario: Plugin unloads during execution
- **GIVEN** a conversion batch is executing
- **WHEN** Soundings unloads
- **THEN** Soundings cancels owned work, starts no further operations, and does not publish a partial destination

#### Scenario: Review interface outlives the plugin
- **GIVEN** a conversion review or manual-enrichment interface is open
- **WHEN** Soundings unloads and the interface's confirm action is invoked afterwards
- **THEN** Soundings starts no scan, conversion, or companion publication and creates no file

#### Scenario: Progress interface is dismissed
- **GIVEN** a conversion batch is executing and its progress interface is open
- **WHEN** the user closes the progress interface with Escape or its close control
- **THEN** Soundings cancels the run as if Cancel had been chosen and reports remaining items as canceled

### Requirement: Isolated and verified outcomes
Soundings SHALL isolate failures by item, including unexpected parse or render errors, verify readable final bytes after a reported create, and summarize every selected operation as created, skipped, blocked, stale, canceled, needs-attention, or failed. An unexpected error at a point where publication may already have occurred SHALL be reported as needs-attention rather than failed.

#### Scenario: One operation fails while another remains valid
- **GIVEN** a batch contains two selected operations and the first fails before publication
- **WHEN** the second still has current evidence and an absent destination
- **THEN** Soundings reports the first failure and may create the second without weakening its validation

#### Scenario: Created note cannot be verified
- **GIVEN** the vault API reports successful creation but the final destination cannot be read back or does not match the rendered bytes
- **WHEN** Soundings verifies publication
- **THEN** Soundings reports the item as needs-attention, performs no overwrite or source mutation, and identifies the destination for manual inspection

#### Scenario: Rendering one item throws unexpectedly
- **GIVEN** a batch contains two selected items and rendering the first throws an unexpected error
- **WHEN** Soundings executes the batch
- **THEN** the first item is reported as failed with a content-free category
- **AND** the second item is still evaluated and the results summary is shown

#### Scenario: Unexpected error where publication may have started
- **GIVEN** a batch contains two selected items and an unexpected error escapes processing of the first item
- **WHEN** Soundings executes the batch
- **THEN** the first item is reported as needs-attention with a content-free reason directing the user to inspect its destination
- **AND** the second item is still evaluated

### Requirement: Content-free diagnostics
User-facing results and diagnostic logs SHALL NOT contain transcript bodies, generated note bodies, model prompts, or credentials.

#### Scenario: Conversion reports a parse error
- **GIVEN** a selected transcript cannot be parsed
- **WHEN** Soundings records and presents the failure
- **THEN** the report may include the vault-relative path, source format, size, content identity, and error category but excludes transcript text
