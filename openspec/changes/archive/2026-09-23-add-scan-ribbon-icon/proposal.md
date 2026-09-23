# Proposal

## Why

Soundings' reviewed scan is currently discoverable only through the command palette. A persistent ribbon entry will make the plugin's primary action visible and convenient for users who do not remember command names or keyboard shortcuts.

## What Changes

- Add one Soundings ribbon button using Obsidian's public ribbon API and the built-in `waves` icon.
- Give the button the accessible tooltip **Scan vault for transcripts**.
- Route ribbon activation to the same reviewed, read-only scan workflow as the existing command-palette command.
- Retain the command-palette entry and the existing active-run guard, cancellation, exclusions, preview, and create-only boundaries.
- Add no new vault mutation: clicking the icon starts discovery and review only; conversion still requires explicit item selection and confirmation.
- **Non-goals:** custom SVG assets, automatic conversion, alternate scan behavior, mobile acceptance, toolbar customization, or changes to transcript parsing and publication.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `transcript-discovery`: Add a visible, accessible ribbon entry point that invokes the same non-mutating reviewed scan as the command palette.

## Impact

- Affects plugin lifecycle registration in `src/main.ts`, the UI contract tests, product documentation, and desktop manual acceptance.
- Uses the existing Obsidian API and icon set; adds no dependency, settings migration, network access, source mutation, or publication path.
