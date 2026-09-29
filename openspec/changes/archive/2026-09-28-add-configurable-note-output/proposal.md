# Proposal

## Why

Soundings currently emits one fixed note layout and always removes WebVTT timestamps. Users need limited, deterministic control over note sections, metadata, and timestamp presentation without turning conversion into an unsafe template engine.

## What Changes

- Add validated settings for optional reserved sections and static tags, plus the closed title patterns `source-name` and `parent-folder-source-name` and destination-name patterns `source-name` and `source-name-note`.
- Add a WebVTT timestamp policy with deterministic `omit` and `retain` modes.
- Show the exact destination and output-profile summary in the review plan before selection.
- Version the rendered-note contract when an output option changes structure and keep identical inputs and settings deterministic.
- Reject unsafe or invalid configuration without broadening paths or emitting partial output.
- Exclude arbitrary executable templates, source mutation, overwrite/reconversion, AI-generated content, network access, and mobile support.

## Capabilities

### New Capabilities

- `note-output-configuration`: Define the supported safe output profile, validation, preview, and migration behavior.

### Modified Capabilities

- `conversion-planning`: Preview the exact destination and output-profile effects before selection.
- `transcript-conversion`: Render configured sections, tags, titles, and optional WebVTT timestamps deterministically under a versioned schema.

## Impact

- Affects settings and migration, planning metadata, WebVTT parsing/model data, renderer behavior, golden fixtures, documentation, and packaged desktop acceptance.
- Existing users retain the current output by default.
- Adds no mutation beyond creating a selected absent Markdown destination through the existing executor.
