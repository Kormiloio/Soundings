# Tasks

## 1. Project Foundation

- [x] 1.1 Scaffold the TypeScript Obsidian community plugin, manifest, build scripts, and Vitest configuration; verify a clean install can run the production build and empty test suite.
- [x] 1.2 Create the functional-core and Obsidian-adapter module boundaries described in `design.md`; verify a dependency-boundary test prevents core modules from importing `obsidian`, Node filesystem modules, or UI modules.
- [x] 1.3 Implement shared result, evidence, plan-item, transcript-block, and execution-outcome types; verify TypeScript exhaustiveness tests cover every specified classification and outcome.
- [x] 1.4 Add redacted and synthetic `.txt`/`.vtt` fixtures, including Zoom-style, malformed, Unicode, adversarial Markdown, and filename edge cases; verify the fixture inventory documents the behavior each sample covers.

## 2. Settings and Validation

- [x] 2.1 Implement settings defaults for enabled formats, exclusions, maximum source bytes, and project inference; verify tests show automatic conversion is absent and project inference is disabled by default.
- [x] 2.2 Implement centralized validation and normalization for vault-relative exclusions and project roots; verify tests reject empty, absolute, traversal, malformed, and ambiguous values without broadening scan scope.
- [x] 2.3 Add a settings tab for the approved foundation controls and safety explanations; verify manual keyboard navigation exposes validation errors without relying on color alone.

## 3. Transcript Discovery

- [x] 3.1 Implement supported-extension recognition and recursive candidate filtering over an adapter-provided vault inventory; verify tests cover nested paths, mixed-case extensions, unsupported files, and regular-file-only behavior.
- [x] 3.2 Implement default hidden-path, `.obsidian/`, Soundings-state, and user exclusion handling before content reads; verify fake-vault tests prove excluded candidates are never read.
- [x] 3.3 Implement strict binary reads, source-size enforcement, SHA-256 evidence, per-file failure isolation, batched yielding, and cooperative scan cancellation; verify tests cover unreadable files, unavailable hashing, oversize sources, cancellation, and continued discovery of unrelated files.

## 4. Conversion Planning

- [x] 4.1 Implement final-extension-only destination derivation; verify table-driven tests cover multiple periods, mixed-case extensions, Unicode, nested paths, and valid filename edge cases.
- [x] 4.2 Implement classifications for eligible, excluded, unsupported, unreadable, empty, oversize, existing-destination collision, and same-plan destination collision; verify every classification has a focused planner test.
- [x] 4.3 Implement immutable single-use plan evidence and invalidation on refresh or settings changes; verify stale plan objects cannot silently adopt new evidence.
- [x] 4.4 Implement configurable project-root inference with omission outside or directly at the root; verify tests cover nested project files, ambiguous paths, Unicode project names, and disabled inference.

## 5. Parsing and Markdown Rendering

- [x] 5.1 Implement strict UTF-8 and UTF-8-with-BOM decoding plus normalized line endings; verify tests reject invalid byte sequences and preserve Unicode content.
- [x] 5.2 Implement the foundation `.txt` parser without speaker or meaning inference; verify tests preserve decoded line order, blank lines, punctuation, and repeated text while rejecting empty input.
- [x] 5.3 Implement the WebVTT parser for signatures, cue identifiers, timing/settings, defined entities, ordered cue text, and explicit voice spans; verify fixture tests cover Zoom-style input, repetition retention, malformed structure, and unsupported constructs.
- [x] 5.4 Implement versioned metadata and YAML-safe rendering; verify parser-backed tests can load the resulting frontmatter for filenames and project values containing YAML-sensitive characters.
- [x] 5.5 Implement inert transcript rendering and heading sanitization; verify adversarial tests prove raw HTML, headings, frontmatter delimiters, code fences, Markdown links, and Obsidian embeds cannot escape or activate while human-visible text is preserved.
- [x] 5.6 Add golden-file tests for representative `.txt` and `.vtt` conversions; verify repeated runs with fixed metadata produce byte-identical Markdown and clearly empty enrichment sections.

## 6. Safe Note Publication

- [x] 6.1 Implement the serialized execution state machine with explicit selection and per-item source re-read, size check, SHA-256 revalidation, destination recheck, parse, render, create, and read-back stages; verify state-transition tests cover success and every refusal path.
- [x] 6.2 Implement a create-only Obsidian vault adapter that never falls back to modify, rename, move, or delete; verify adapter contract tests inject existing-destination and concurrent-create races and preserve the winning bytes.
- [x] 6.3 Implement final-byte read-back verification and `needs-attention` handling for missing or mismatched reads; verify tests show uncertain files are neither overwritten nor deleted.
- [x] 6.4 Implement cooperative cancellation and plugin-unload ownership across scans and batches; verify tests show no later item starts after cancellation and an indivisible create is reported according to its observed outcome.
- [x] 6.5 Implement isolated content-free result reporting for created, skipped, blocked, stale, canceled, needs-attention, and failed items; verify tests assert transcript bodies, generated bodies, prompts, and credentials never enter notices or diagnostic records.

## 7. Obsidian Experience

- [x] 7.1 Add the `Soundings: Scan vault for transcripts` command and accessible review modal with source, destination, classification, reason, selection, refresh, cancel, and convert controls; verify blocked items cannot be selected and closing the modal performs no writes.
- [x] 7.2 Connect progress, cancellation, and final summaries to the active run without exposing content; verify an integration test covers a mixed batch of created, colliding, stale, malformed, and unselected items.
- [x] 7.3 Register and clean up commands, views, events, and active-run ownership through the plugin lifecycle; verify reload/unload tests leave no orphaned work or duplicate handlers.

## 8. Safety and Release Verification

- [x] 8.1 Run the full build, typecheck, unit, adapter-contract, and integration suites; verify all commands pass from a clean checkout with no network service or credential configured.
- [x] 8.2 Audit the production bundle and runtime imports for network, telemetry, Node filesystem, and credential code; verify the audit records that none is present in the foundation runtime.
- [x] 8.3 Rehearse discovery, preview, conversion, collision races, cancellation, restart, and content-free diagnostics in a disposable 5,000-file desktop vault; verify responsiveness measurements and zero source mutations are recorded.
- [x] 8.4 Declare the first release desktop-only in the Obsidian manifest and add an automated regression check; verify documentation consistently defers Android, iOS, and iPadOS support to a future change.
- [x] 8.5 Verify the minimum supported Obsidian desktop version plus create-existing and read-back behavior in a disposable desktop vault; record platform/version evidence before marking the desktop release ready.
- [x] 8.6 Update `README.md`, `docs/PRD.md`, `openspec/project.md`, user installation guidance, supported transcript rules, and known limitations to match verified behavior; verify documentation contains no claim beyond completed automated and device acceptance.
