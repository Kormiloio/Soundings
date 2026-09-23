# Proposal

## Why

Soundings currently derives a Markdown destination by changing only the extension, but Obsidian can refuse creation when a source basename contains characters such as `:` that are not valid for a new note path. Real work-vault conversions therefore fail after review even though the source is otherwise eligible.

## What Changes

- Derive a deterministic, Obsidian-safe Markdown basename while keeping the destination in the source folder.
- Show the sanitized destination in the review plan before the user selects a conversion.
- Run existing-destination and ambiguous-destination collision checks against the sanitized path.
- Preserve the original source filename in note metadata and never rename, move, edit, or delete the source transcript.
- Fail closed without publication when sanitization cannot produce a valid, unambiguous destination.
- Keep processing local and continue using the public Obsidian vault API.
- **Non-goals:** renaming source transcripts, overwriting existing Markdown, automatically choosing a numbered alternative, changing note content, adding network access, or expanding mobile support.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `conversion-planning`: Destination derivation will sanitize unsupported basename characters before appending `.md`, expose the exact result during review, and detect collisions on that final path.

## Impact

- Affects pure destination derivation and planning tests, plus integration and disposable-vault acceptance around create-only publication.
- Updates FR-06 and filename-edge-case documentation because the destination may differ from the source basename when required for safe creation.
- Introduces no dependency, network request, source mutation, overwrite path, or new category of vault mutation; the only mutation remains creation of an explicitly reviewed absent Markdown destination.
