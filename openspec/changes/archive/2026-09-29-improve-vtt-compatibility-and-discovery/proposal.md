# Proposal: Improve WebVTT Compatibility and Discovery Parsing

## Context
Soundings' WebVTT parsing is currently too strict, rejecting valid VTT files that omit hours in timestamps or contain certain valid but uncommon cue structures. Furthermore, discovery only checks for file existence and size, meaning "unsupported" or "malformed" VTT files are listed as `eligible` in the review plan, only to fail during the actual conversion process.

## Goals
1. Expand WebVTT parser compatibility to support real-world VTT dialects (including those without hours in timestamps).
2. Move parsing into the discovery phase so that classification (`eligible` vs `unsupported` vs `unreadable`) is accurate in the review plan.
3. Ensure that the `unsupported` classification is correctly produced for files that are valid VTT but do not meet Soundings' specific constraints.

## Capabilities
- `transcript-conversion`: Accept supported real-world WebVTT timestamp and voice-tag variants while preserving deterministic transcript output.
- `conversion-planning`: Parse supported candidates during discovery so the review plan distinguishes eligible, unsupported, and unreadable sources before execution.

## Non-Goals
- Support for all possible VTT extensions.
- Changing the core conversion workflow (it remains review-then-execute).

## Success Criteria
- `eligible` items in the review plan are guaranteed to be parsable.
- VTT files without hours in timestamps are correctly parsed.
- Valid VTT files that don't meet Soundings' specific requirements are classified as `unsupported` during discovery.
- All existing golden tests continue to pass.
