# Proposal

## Why

The current review modal is safe but becomes cumbersome when a vault contains many transcripts because every candidate is shown in one unfiltered list and eligible items must be selected individually. Soundings should make large plans easier to understand and operate without changing the explicit-review or unselected-by-default safety model.

## What Changes

- Add classification summary counts, path search, and classification filters to the conversion plan.
- Add explicit **Select all eligible shown** and **Clear selection** controls while keeping every candidate unselected when a plan first opens or refreshes.
- Keep the selected count and conversion action synchronized with the current plan, including when filters change.
- Preserve source and destination visibility, keyboard access, cancelability, and non-mutating review behavior.
- Do not add automatic selection, automatic conversion, source mutation, overwrite behavior, network access, or mobile support.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `conversion-planning`: Make large conversion plans searchable, filterable, countable, and safely batch-selectable while preserving explicit selection and non-mutating planning.

## Impact

- Affects the review modal, supporting presentation state, styles, accessibility tests, and large-plan integration coverage.
- Does not change parsing, destination derivation, execution revalidation, release assets, or vault mutation APIs.
- Introduces no new vault mutation; only the existing explicit **Convert selected** action may create absent Markdown destinations.
