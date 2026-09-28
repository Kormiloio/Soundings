# Design: Improve WebVTT Compatibility and Discovery Parsing

## Changes to Discovery and Planning

Currently, `discovery.ts` and `planning.ts` only verify file existence, size, and extension. This leads to "lying" eligible status for malformed VTTs.

**Decision:** The planner will now invoke the `parseTranscript` logic during the classification phase.
- If parsing fails because the content is malformed, including a missing or invalid `WEBVTT` signature, classification becomes `unreadable`.
- If the file has a recognized WebVTT structure but uses unsupported control records or cue markup, classification becomes `unsupported`.
- Only files that pass parsing and are considered `eligible` will be marked as such.

## Parser Enhancements (`parsers.ts`)

**Timestamp Flexibility:**
- Update the VTT timestamp regex to allow `mm:ss.sss` as well as `hh:mm:ss.sss`.
- Current regex strictly expects hours. New regex will make hours optional.

**Cue Structure Support:**
- Allow cues with missing closing `</v>` tags (as permitted by the WebVTT standard).
- Handle cues that contain multiple voice lines.

## Classification Logic

The `PlanClassification` will be updated to ensure the following mapping:
- **Parsable + Valid Soundings VTT** $\rightarrow$ `eligible`
- **Parsable + Invalid/Unsupported VTT** $\rightarrow$ `unsupported`
- **Unparsable/Malformed** $\rightarrow$ `unreadable`

## Verification Plan

1. **Adversarial VTT Fixtures**: Create a set of VTT files covering:
    - Timestamps without hours (`00:01.000`).
    - Unclosed voice tags.
    - Multiple voice lines in one cue.
    - Missing `WEBVTT` header as malformed input.
    - Recognized WebVTT containing unsupported structures.
2. **Discovery Audit**: Verify that these files are classified correctly *during* the scan, not just at conversion.
3. **Regression**: Run the full test suite and golden tests to ensure no regressions in `txt` or standard `vtt` parsing.
