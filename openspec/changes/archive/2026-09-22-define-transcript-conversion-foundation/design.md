# Design

## Context

See `proposal.md` for motivation and the four capability specs for observable behavior. Soundings is greenfield, and the first release will run only in Obsidian desktop. The design must keep thousands-file scans responsive, preserve exact source bytes, render untrusted transcript text safely as Markdown, and enforce no-overwrite semantics even when another process changes the vault after preview. Public Obsidian APIs remain the runtime boundary so a later, separately approved change can evaluate mobile support without first removing desktop-only dependencies.

The initial implementation has no persistent conversion index and no trusted ownership claim over any existing `.md` file. That makes every existing destination user data, regardless of whether it resembles prior Soundings output.

## Goals / Non-Goals

**Goals:**

- Make domain behavior independently testable without loading Obsidian.
- Minimize the mutation surface to one create-only adapter operation.
- Carry source evidence from preview to execution and revalidate it immediately before mutation.
- Keep parsing and rendering deterministic, bounded, and safe for untrusted text.
- Use only runtime facilities available through Obsidian and standard web APIs on supported desktop platforms.

**Non-Goals:**

- A persistent source-to-note sync engine or reconversion workflow.
- Background work while Obsidian is closed.
- Automatic file-event conversion in the foundation change.
- AI, network, account, credential, or telemetry infrastructure.
- A general-purpose subtitle renderer or lossless round-trip back to `.txt`/`.vtt`.
- Android, iOS, or iPadOS release support and acceptance in the foundation change.

## Decisions

### 1. Use a functional core with a narrow Obsidian shell

The codebase will separate:

- `core/discovery`: path and extension filtering over an adapter-provided file inventory;
- `core/planning`: destination derivation, evidence, collision classification, and project inference;
- `core/parsers`: strict UTF-8 decoding and source-format parsing into a neutral transcript model;
- `core/rendering`: YAML-safe metadata and inert Markdown rendering;
- `core/execution`: operation state machine and revalidation policy;
- `obsidian`: vault, settings, command, modal, notice, and lifecycle adapters.

Core modules receive data and capabilities explicitly and do not import `obsidian`, Node filesystem modules, or UI code. This permits fast unit testing and keeps security-relevant decisions visible.

**Alternative considered:** implement the workflow directly in the plugin class. Rejected because it couples parsing, UI state, and vault mutation, making race and failure behavior difficult to test.

### 2. Use Obsidian vault APIs and binary reads throughout

The adapter will inventory `TFile` objects through the public vault API and read source bytes with the binary vault API. Runtime code will not use `fs`, filesystem watchers, absolute paths, or platform launch services.

Binary reads allow strict `TextDecoder("utf-8", { fatal: true })` behavior, reliable BOM handling, byte-length limits, and content hashing before parsing. The adapter will yield between bounded batches so a large scan does not monopolize the UI thread.

**Alternative considered:** use text reads directly. Rejected because permissive decoding can hide invalid bytes and makes it harder to prove source identity.

### 3. Treat the conversion plan as immutable evidence, not a work queue

Each plan item will contain:

- source vault path, format, size, and SHA-256 content identity;
- derived destination path;
- classification and content-free reason;
- proposed title and optional project value;
- selected state maintained separately by the review UI.

The plan never stores transcript bodies after evidence is computed. SHA-256 will use the standard Web Crypto API. If the required hashing facility is unavailable, planning fails closed rather than substituting timestamps as identity.

Plans are single-use snapshots. Refreshing the plan replaces it; settings changes invalidate it; execution never silently upgrades stale evidence.

**Alternatives considered:** timestamps and sizes alone are vulnerable to unchanged metadata; retaining full source content consumes memory and creates an unnecessary content-retention surface. Both are rejected.

### 4. Block every existing or ambiguous destination

Destination derivation replaces only the final extension. Planning detects both existing `.md` files and same-plan collisions such as `Meeting.txt` plus `Meeting.vtt`. The executor repeats the destination check and then uses the vault API's create-only operation as the actual race boundary.

There is no generated-note ownership marker trusted for overwrite in this release. A note with Soundings frontmatter is still immutable user data once present.

**Alternative considered:** update files that declare `soundings_version`. Rejected because users may have edited the generated note and frontmatter alone is insufficient provenance for safe replacement.

### 5. Use a small neutral transcript model

Parsers produce ordered blocks containing optional explicit speaker identity and literal text. They do not infer decisions, topics, identities, or missing speakers.

The `.txt` parser preserves normalized lines and does not guess speaker structure in the first implementation. The WebVTT parser validates the signature and cue grammar, strips control syntax, decodes defined entities, retains explicit voice spans, and keeps cue order. Adjacent cues are not deduplicated in the first release because generic caption deduplication can silently remove legitimate repetition. This rule is deterministic and preserves evidence, at the cost of occasionally repetitive notes.

**Alternative considered:** heuristic speaker and repetition cleanup. Deferred because Zoom export variants require a representative fixture corpus before such transformations can be proven faithful.

### 6. Render source content as inert Markdown

The renderer owns the entire generated document. Metadata uses a constrained schema and a YAML encoder rather than string concatenation. Titles and speaker labels are sanitized before becoming headings.

Transcript text is emitted using a deterministic literal-text encoder that escapes raw HTML, Obsidian embeds, structural headings, frontmatter delimiters, and any fence sequence chosen by the renderer while preserving human-visible text. Renderer tests will include adversarial Markdown and HTML fixtures. The foundation note reserves enrichment sections but explicitly states that no summary has run.

**Alternative considered:** append source text verbatim. Rejected because transcript content could alter note structure, activate embeds, or masquerade as generated metadata.

### 7. Serialize execution and re-read every selected source

Only one Soundings scan or execution owner may be active at a time. For each selected item, the executor:

1. checks cancellation and plugin ownership;
2. resolves the source at the reviewed path;
3. reads bytes, enforces the size limit, and recomputes SHA-256;
4. confirms destination absence;
5. parses and renders from the revalidated bytes;
6. calls the create-only vault adapter once;
7. reads back the destination and compares its bytes with the rendered bytes;
8. records the outcome and proceeds to the next item only if still active.

A destination conflict is never retried with a modifying API. If post-create verification is uncertain, the destination is left for manual inspection and reported as `needs-attention`; the plugin does not overwrite or delete uncertain data.

**Alternative considered:** render once during preview and retain output for execution. Rejected because it increases memory pressure and risks publishing content from stale source evidence.

### 8. Use cooperative cancellation with an indivisible create boundary

An `AbortController` owned by the active run is checked between reads, hashes, parses, renders, and items. Plugin unload aborts the owner and detaches UI/events. The create call itself is treated as indivisible: cancellation does not pretend it can roll back a create whose outcome is already committed or uncertain. No later item begins after cancellation.

**Alternative considered:** delete a just-created note when cancellation arrives. Rejected because destructive rollback can remove a file whose ownership is uncertain after an interrupted call.

### 9. Keep settings small and validation centralized

Foundation settings include enabled source formats, vault-relative exclusions, maximum source bytes, project inference enabled/disabled, and project root. Defaults exclude hidden folders and `.obsidian/`, enable `.txt` and `.vtt`, disable project inference until configured, and use a conservative 5 MB desktop source-size cap. Mobile-safe limits are intentionally unspecified until a future mobile-support change performs platform-specific profiling.

Settings are normalized and validated before a scan. Automatic conversion settings are not included until the later observation change is designed.

### 10. Verify behavior in layers

- Unit tests cover paths, exclusions, strict decoding, VTT fixtures, metadata encoding, inert Markdown rendering, hashes, classifications, and execution state transitions.
- Adapter contract tests use an in-memory fake vault that can inject read failures, races, cancellation, and corrupt read-back.
- Disposable-vault tests verify real Obsidian behavior, including create collision semantics.
- Release acceptance covers Obsidian desktop before real-vault use. Mobile acceptance is outside this change.
- The verified release baseline is Obsidian desktop 1.13.7 on macOS 26.6.2 arm64; the manifest and version map pin 1.13.7 as the minimum supported app version.

## Risks / Trade-offs

- **[Obsidian create semantics vary by version]** → Pin a minimum Obsidian desktop version, test the create-existing contract there, and fail closed on unsupported versions.
- **[Large files or vaults cause UI stalls or memory pressure]** → Apply configurable size limits, bounded concurrency of one for writes, batched discovery, cooperative yielding, and cancellation.
- **[Zoom `.txt` and `.vtt` exports vary]** → Start with strict documented formats, retain representative redacted fixtures, isolate failures, and add variants through new tests rather than permissive guessing.
- **[Literal Markdown escaping reduces copy fidelity in source mode]** → Preserve human-visible text, document normalization, retain the authoritative original beside the note, and test adversarial inputs.
- **[No reconversion means source corrections require manual handling]** → Prefer this limitation to overwriting edited notes; specify provenance-aware updates in a later change.
- **[Read-back uncertainty leaves a questionable generated file]** → Label it `needs-attention`, identify the exact path, perform no automated overwrite or deletion, and require manual review.
- **[Content hashes add scan cost]** → Hash only supported, non-excluded candidates, yield between files, and profile against the 5,000-file acceptance vault.

## Migration Plan

There is no existing installation or data migration. Delivery proceeds through a private development install in a disposable vault, followed by desktop acceptance. Rollback is disabling or uninstalling the plugin; because foundation behavior never changes sources or existing notes, generated notes can be reviewed and removed manually by the user if desired. Mobile enablement requires a later change with its own performance and vault-API acceptance evidence.

## Open Questions

- Should the conservative 5 MB desktop source limit be raised after post-release profiling?
- Which redacted Zoom `.txt` and `.vtt` variants should form the initial compatibility fixture corpus?
