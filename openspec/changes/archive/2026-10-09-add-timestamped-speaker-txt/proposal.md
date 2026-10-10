# Proposal

## Why

The owner's TXT sample contains blank-separated `HH:MM:SS --> HH:MM:SS` ranges followed by named-speaker dialogue. Soundings currently preserves TXT as one literal block. Release 0.4.1 should support this one explicit layout without guessing how all incoming text should be interpreted.

## What Changes

- Add an opt-in TXT layout setting: Plain text (existing default) or Timestamped speaker.
- Recognize complete files in the documented layout, preserving source order, overlapping cues, repeated dialogue, and multiline payloads.
- Preserve the entire decoded source as plain text when any part does not match; show the actual interpretation in review.
- Bind interpretation policy to reviewed settings and revalidate it before creation. Apply existing timestamp and display options to recognized blocks.
- Use synthetic examples and fixtures, not the owner's pasted names or dialogue.

Non-goals: general notes/minutes/chat import, additional TXT dialects, Person-note linking, speaker identity inference, AI, mobile support, network access, source edits, and regeneration of existing notes. Person linking remains a separate 0.5.0 scope.

The only vault mutation remains explicitly reviewed creation of a new adjacent Markdown note. Sources and existing notes remain untouched. Decoding failures, stale evidence, collisions, cancellation, and unload continue to prevent publication under existing guards; unfamiliar decoded TXT is eligible plain fallback, not a partial transcript.

## Capabilities

### New Capabilities

None; extend existing conversion and planning capabilities.

### Modified Capabilities

- `transcript-conversion`: opt-in timestamped-speaker TXT grammar, whole-file fallback, literal containment, versioned structured output, and unchanged default TXT behavior.
- `conversion-planning`: validated TXT interpretation policy, actual per-item interpretation, and stale-policy protection.

## Impact

Affected areas: settings/types, pure parsing, discovery/planning/execution policy propagation, existing renderer, settings/review UI, tests, and user documentation. No new dependencies or permissions are expected. Existing VTT/SRT behavior and manual-enrichment compatibility must remain unchanged.

This proposal targets 0.4.1; it does not bump runtime version metadata or declare the release complete. The 0.4.0 SRT Community review remains pending in the latest supplied evidence. Before implementation, reconcile overlapping specs with the SRT change; before release, verify that predecessor's review and closure rather than assuming success.
