# Design

## Context

The current modal renders every plan item directly, owns a set of selected source paths, and enables conversion when that set is non-empty. The conversion plan is immutable and already contains all classification and path data needed for richer presentation. See `proposal.md` for motivation and the conversion-planning delta for observable behavior.

## Goals / Non-Goals

**Goals:**

- Keep search, filters, counts, and selection as pure presentation state over one immutable plan.
- Preserve explicit selection, current-plan identity, keyboard accessibility, and non-mutating review.
- Remain responsive for the existing 5,000-file desktop acceptance scale.

**Non-Goals:**

- Virtualizing arbitrary vault sizes in the first iteration.
- Persisting filters or selection between plans.
- Automatic selection, conversion, or mobile acceptance.

## Decisions

1. Introduce a pure review-state projection that accepts the plan, query, classification filter, and selected paths and returns visible rows, counts, and selected count. This makes the behavior unit-testable without Obsidian DOM APIs. Directly coupling filtering to DOM nodes was rejected because it is difficult to validate and risks stale controls.
2. Define **Select all eligible shown** against the current projection, not the entire plan. Hidden selections remain selected and visible in the total count until **Clear selection** is used. Clearing hidden selections when filters change was rejected because it silently changes user intent.
3. Re-render the item list from immutable plan data when presentation state changes, while keeping controls and announcements stable. If profiling shows full rerendering is too slow at 5,000 items, add chunked rendering inside the adapter without changing the pure contract.
4. Treat refresh as a new plan and new modal, which naturally resets query, filter, and selection. Reusing selection by path was rejected because source evidence and eligibility may have changed.
5. Constrain the modal container to the available desktop viewport and make only the candidate list flexible and scrollable. Manual acceptance showed that a list-only maximum height could still make the outer modal scroll and obscure the header; keeping the summary, controls, and footer fixed preserves context and prevents default actions from being hidden.
6. Consume Return key events in the path-search input. Manual acceptance showed that the modal's primary button could otherwise receive the key as a default action and convert a current selection while the user intended only to finish a search. Conversion remains available only through its explicit button activation.

## Risks / Trade-offs

- [Large DOM lists may still feel heavy] → Measure the existing 5,000-file fixture and add cooperative chunked rendering if needed.
- [Hidden selections can surprise users] → Display the total selected count independently of visible rows and provide one clear-all action.
- [Classification labels can become visually dense] → Use text labels and native controls; do not rely on color alone.

## Migration Plan

No saved-data migration is required. Ship the UI behind the existing scan entry points, preserve the old unselected default, and roll back by restoring the prior modal because no persisted or vault data format changes.
