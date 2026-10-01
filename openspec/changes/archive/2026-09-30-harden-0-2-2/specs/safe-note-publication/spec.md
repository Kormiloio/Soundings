# Spec Delta

## MODIFIED Requirements

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
