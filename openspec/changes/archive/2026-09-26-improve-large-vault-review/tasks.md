# Tasks

## 1. Pure review state

- [x] 1.1 Add a pure review-state projection for classification counts, case-insensitive path search, classification filters, visibility, and selected counts; verify unit tests cover mixed classifications, nested paths, empty results, and hidden selections
- [x] 1.2 Add pure select-all-visible-eligible and clear-all transitions; verify tests prove excluded, unsupported, unreadable, empty, oversize, destination-invalid, destination-exists, destination-ambiguous, and hidden eligible items are never selected by the visible bulk action
- [x] 1.3 Pin new-plan and refresh behavior to zero selections; verify lifecycle tests prove prior selection cannot leak into a refreshed plan

## 2. Accessible review interface

- [x] 2.1 Add summary counts, search, classification filter, selected count, select-all-visible-eligible, and clear-selection controls to the review modal; verify UI tests cover labels, keyboard operation, safe Return handling, disabled conversion, and non-color status text
- [x] 2.2 Render filtered rows from immutable plan data and keep hidden selections represented in the selected count; verify DOM integration tests cover filter changes and conversion receives exactly the selected current-plan paths
- [x] 2.3 Add or adjust styles for large-plan controls and narrow desktop windows; verify the modal remains usable at the documented desktop minimum viewport without obscuring source or destination paths

## 3. Scale and safety verification

- [x] 3.1 Extend the 5,000-file rehearsal to exercise search, filtering, bulk selection, clearing, and cancellation; verify responsiveness remains acceptable and source/destination mutation counts remain zero before explicit execution
- [x] 3.2 Run the full unit/integration suite, production build, runtime audit, strict OpenSpec validation, and `git diff --check`; record passing results and confirm no network, overwrite, delete, rename, or move capability was introduced

## 4. Documentation and desktop acceptance

- [x] 4.1 Update README guidance, `docs/PRD.md`, `openspec/project.md`, and verification instructions for the large-vault review controls; verify terminology matches the specs and candidates remain unselected by default
- [x] 4.2 Install the staged assets in a disposable Obsidian desktop vault with a large mixed plan; verify counts, search, filters, bulk selection, hidden-selection count, clear selection, refresh reset, safe Return handling, keyboard access, and close-without-mutation behavior
- [x] 4.3 Perform one selected create-only conversion after filtered review; verify the created destination bytes, unchanged source hash, unchanged collision hash, and content-free result reporting in `docs/VERIFICATION.md`
