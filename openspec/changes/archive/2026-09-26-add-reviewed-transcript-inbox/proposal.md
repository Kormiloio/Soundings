# Proposal

## Why

Users currently rescan the whole vault to discover transcripts added while Obsidian is open. An opt-in reviewed inbox can surface newly created supported files promptly while retaining Soundings' explicit, create-only conversion boundary.

## What Changes

- Add an off-by-default setting that observes newly created supported transcript files while Obsidian is open.
- Allow observation to be limited to configured vault-relative folders and apply every existing mandatory and user exclusion before reading content.
- Queue eligible new candidates in a local in-memory inbox and notify the user without opening a modal or converting automatically.
- Add a command and notice action that opens the normal reviewed conversion plan for queued candidates, initially unselected.
- Deduplicate repeated events, isolate unreadable or transient files, and clear owned observation state on plugin unload.
- Defer automatic conversion, background processing while Obsidian is closed, persisted transcript content, network activity, mobile support, and source mutation.

## Capabilities

### New Capabilities

- `transcript-inbox`: Define opt-in observation, safe candidate queuing, user notification, and reviewed handoff for newly created transcripts.

### Modified Capabilities

- `transcript-discovery`: Apply existing supported-format, size, configuration-directory, hidden-folder, Soundings-state, and user-exclusion rules to event-driven discovery.

## Impact

- Affects settings, Obsidian vault-event registration, lifecycle coordination, discovery adapters, notices, commands, documentation, and disposable-vault acceptance.
- Adds no automatic vault mutation. Conversion remains a separate explicit action that reuses the existing planner and executor.
- Stores paths and content-free evidence in memory only; transcript bodies are not logged or persisted by the inbox.
