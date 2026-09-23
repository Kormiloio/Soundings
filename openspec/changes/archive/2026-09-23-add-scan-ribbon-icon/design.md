# Design

## Context

See `proposal.md` for motivation. `SoundingsPlugin.onload()` currently registers one settings tab and one command-palette command. That command calls the private `scanAndReview()` workflow, which already owns active-run serialization, discovery, review-plan creation, error notices, and cleanup.

Obsidian's public plugin API provides `addRibbonIcon(icon, title, callback)` and manages registered component cleanup with the plugin lifecycle. The first release remains desktop-only, while the implementation continues to avoid Node filesystem or platform-private APIs.

## Goals / Non-Goals

**Goals:**

- Add a visible entry point without duplicating scan logic or changing scan results.
- Preserve keyboard/tooltip discoverability through a clear accessible label.
- Keep registration and cleanup inside the normal Obsidian plugin lifecycle.

**Non-Goals:**

- A custom icon asset or CSS treatment.
- A second scan implementation or a direct conversion shortcut.
- A configurable toolbar position or mobile acceptance claim.

## Decisions

### Register the built-in `waves` icon during plugin load

Call the public ribbon registration API once from `onload()` using icon id `waves`, title `Scan vault for transcripts`, and a callback that invokes the existing `scanAndReview()` method. This keeps the control visually aligned with Obsidian's theme and avoids shipping or maintaining an SVG asset.

Alternative considered: use a generic file or search icon. Rejected because `waves` gives Soundings a distinct identity while the tooltip supplies the precise action.

### Share one action method across ribbon and command palette

Both entry points will call `scanAndReview()` rather than introducing a wrapper with different discovery or error behavior. The existing `RunCoordinator` therefore continues to refuse concurrent work, and the review modal continues to begin with no selected candidates.

Alternative considered: have the ribbon execute the command by id. Rejected because a direct shared method is simpler, type-checked, and does not depend on command-dispatch lookup behavior.

### Rely on Obsidian lifecycle ownership

Use `addRibbonIcon` from the plugin instance so Obsidian removes the registered element when the plugin unloads. Retain the existing `onunload()` cancellation call for active work. No manual DOM removal or event listener is introduced.

## Risks / Trade-offs

- [The `waves` icon is unavailable or renders unexpectedly in the verified Obsidian version] → Confirm appearance and tooltip in Obsidian desktop 1.13.7 before installing the build in the work vault.
- [Two entry points drift into different behavior later] → Keep both callbacks pointed at the same private method and assert this contract in tests.
- [Repeated plugin loading registers duplicates] → Register once in `onload()` and verify disable/re-enable behavior during desktop acceptance.
- [Ribbon activation starts work while another run is active] → Reuse the existing coordinator guard and notice; do not add a parallel execution path.

## Migration Plan

1. Add the ribbon registration and automated UI-contract coverage.
2. Update documentation and run the full build, tests, runtime audit, whitespace check, and strict OpenSpec validation.
3. Install the verified build in a disposable Obsidian desktop vault and confirm icon appearance, tooltip, activation, unselected review plan, command retention, active-run guard, and disable/re-enable lifecycle.
4. After explicit confirmation, install the hash-matched build in the work vault and verify the ribbon opens the same reviewed scan.

Rollback consists of reinstalling the prior three plugin build artifacts. Rollback changes only plugin code and does not alter vault content.
