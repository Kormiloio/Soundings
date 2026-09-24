# Design

## Context

See `proposal.md` for motivation. The Community draft resolved the immutable `0.1.0` release and passed dependency and obfuscation checks, but its source scan flagged compatibility, lint, settings-search, and deprecated-API findings. The same scan also identified vault enumeration as expected behavior that should be transparent to users.

The affected runtime spans pure discovery/planning/rendering code, the Obsidian adapter and settings UI, and release tooling. The accepted safety boundary remains unchanged: discovery may inventory vault-relative paths but reads only eligible candidates; publication is explicit and create-only; content never leaves the device.

## Goals / Non-Goals

**Goals:**

- Remove every actionable automated-review warning without changing accepted transcript output, destination derivation, or mutation behavior.
- Derive the mandatory configuration-folder exclusion from the active vault and fail closed if that host value is unusable.
- Make every Soundings setting searchable through Obsidian 1.13's declarative settings system while preserving validation and accessibility.
- Produce a reproducible, immutable `0.1.1` package and evidence suitable for rescanning the existing Community draft.
- Keep pure discovery, planning, parsing, and rendering independent of Obsidian and Node modules.

**Non-Goals:**

- Supporting Obsidian releases older than 1.13.7 or retaining the deprecated imperative settings fallback.
- Claiming or testing mobile support; `isDesktopOnly: true` remains authoritative.
- Changing which transcript formats are accepted, how notes are rendered, or how destinations are published.
- Automating Community draft publication or changing the immutable `0.1.0` release.

## Decisions

### Inject host cryptography and identifiers into the pure workflow

The pure core will expose hashing logic that operates on an injected Web Crypto digest capability rather than reading `globalThis`. The Obsidian entry point will construct the runtime hasher and plan-ID factory from `activeWindow.crypto`, pass the hasher into discovery and execution, and pass the ID factory into planning. Cooperative yielding in the Obsidian vault adapter will use `activeWindow.setTimeout`.

This keeps popout-window selection at the host boundary and retains direct dependency injection in tests. Using `window` directly throughout the core was rejected because it couples pure modules to a particular DOM realm. Keeping a hidden `globalThis` fallback was rejected because it would preserve the review finding and make runtime realm selection ambiguous.

### Replace flagged regular expressions with explicit character transforms

Destination basename normalization will classify control codes and Obsidian-rejected punctuation with character predicates, collapse each unsafe run with its surrounding whitespace to the same ` - ` separator, and preserve trailing dot/space removal. Heading escaping will iterate characters and prefix the existing Markdown punctuation set with a backslash. Existing table and golden tests will pin equivalence, including controls, brackets, backslashes, Unicode, punctuation runs, and unusable basenames.

Changing normalization policy was rejected because already reviewed destination paths and collision behavior must remain stable. Merely suppressing lint was rejected because the Community scanner is the release gate.

### Build runtime settings from host policy plus user preferences

The pure settings validator will accept explicit mandatory exclusions. The Obsidian plugin will normalize `this.app.vault.configDir`, combine it with Soundings-owned state, and use that policy for initial load and every settings update. Mandatory exclusions remain present in the runtime settings fingerprint but are omitted from the editable user-exclusions field. The UI description will name the active configured directory instead of hardcoding `.obsidian`.

If `Vault.configDir` is not a safe vault-relative path, plugin setup records an unavailable configuration state, presents a content-free notice, and refuses scans. Falling back to `.obsidian` was rejected because it would broaden discovery in a vault that uses a renamed configuration directory. Storing the host directory as a user preference was rejected because it is host-owned state and users must not be able to remove the safety exclusion accidentally.

### Adopt declarative settings without a legacy display path

Because the manifest requires Obsidian 1.13.7, `SoundingsSettingTab` will implement `getSettingDefinitions()`, `getControlValue()`, and `setControlValue()` and remove `display()`. Definitions will include a non-searchable rendered safety explanation and six searchable controls: two format toggles, excluded folders, maximum transcript bytes, project inference, and project root.

Synthetic control keys will adapt individual UI values to the existing settings model. Textarea and numeric validators will reuse pure validation rules and allow Obsidian to render inline validation errors and associated accessibility state. Successful writes go through the plugin's single validated persistence path; dynamic predicates or values call `update()` only when definitions must be refreshed.

Maintaining both declarative and imperative implementations was rejected because the supported minimum version makes the fallback unreachable and two render paths could drift. Replacing the settings model wholesale was rejected because persisted data and runtime behavior do not need a migration.

### Use supported API styling and extend source review gates

The cancellation button will use `setDestructive()` with its existing non-primary placement. Automated source contracts will reject `globalThis`, deprecated `setWarning()`, hardcoded configuration-directory assumptions in runtime/settings copy, the two flagged regular-expression forms, and a settings tab without declarative definitions.

These checks complement—not replace—the production build, unit/integration suite, runtime security audit, dependency audit, scale rehearsal, and real packaged acceptance.

### Make release preparation version-driven and preserve immutable history

Package and manifest metadata will advance together to `0.1.1`; `versions.json` will retain `0.1.0` and add the `0.1.1` mapping to Obsidian 1.13.7. Release preparation will derive its staging directory and messages from the validated manifest/tag instead of embedding `0.1.0`. Documentation will describe both the historical release and the corrected patch.

The accepted `0.1.0` tag and assets will not be edited. Publication will stop if `0.1.1` already exists or if remote assets differ from the accepted staging hashes.

### Treat the Community rescan as a release gate

The `0.1.1` package will first pass automated and disposable-vault acceptance, including a vault whose configuration directory is not `.obsidian`. After the immutable GitHub release is verified, the owner will refresh or rescan the existing draft. Any remaining actionable warning keeps the draft unpublished and is recorded; only the owner may click Publish after a clean result.

The vault-enumeration recommendation is not treated as a defect: recursive path inventory is required for vault-wide discovery. It will be documented precisely, including that candidate content is read only after format, exclusion, and size filtering.

## Risks / Trade-offs

- **[Declarative control adaptation changes saved values]** → Cover every synthetic key with read/write tests, validate through the existing pure model, and compare a pre-upgrade settings fixture after reload.
- **[Renamed config directory is accidentally shown as editable]** → Keep mandatory exclusions separate from user-entered exclusions and test that removal attempts cannot affect runtime policy.
- **[Injected cryptography is missing in a host realm]** → Fail discovery/conversion with existing content-free hashing outcomes; never publish from unverifiable evidence.
- **[Character transforms drift from prior regular expressions]** → Add equivalence vectors and retain all destination, collision, rendering, and golden tests before changing implementation.
- **[Automated scanner behavior changes]** → Use local source-contract tests as an early signal, then require the actual Community rescan before publication.
- **[Patch metadata accidentally rewrites `0.1.0`]** → Assert both compatibility entries, verify tag absence before publication, and compare the historical release after publishing `0.1.1`.
- **[Desktop-only code is mistaken for mobile readiness]** → Keep `isDesktopOnly: true`, repeat desktop acceptance, and leave Android/iOS/iPadOS evaluation to a separate approved change.

## Migration Plan

1. Add characterization tests and source-contract checks for the scanner findings, custom config directories, declarative settings, and current normalization output.
2. Refactor host capability injection and warning-free character transforms without changing output contracts.
3. Introduce host-derived mandatory exclusions and migrate the settings tab to declarative definitions; verify saved `0.1.0` preferences load into the same effective `0.1.1` settings.
4. Update public privacy disclosures, PRD/project context, release documentation, runtime audit, and version-driven release tooling.
5. Run strict OpenSpec validation, production build, all automated tests, dependency/runtime audits, diff checks, and the 5,000-file rehearsal.
6. Install only staged `0.1.1` assets into a disposable desktop vault with a renamed config directory; repeat non-mutating review, cancellation, collision, explicit create/read-back, settings search, and source-hash checks.
7. Commit and push the accepted candidate, create immutable GitHub release `0.1.1` only if absent, and verify all three remote asset hashes while confirming `0.1.0` is unchanged.
8. Have the owner rescan the Community draft. Record the result and leave it unpublished on any actionable finding; otherwise hand off the final Publish action to the owner.

Rollback before publication is a normal code revert. After release, leave `0.1.1` immutable and correct any new finding in another patch release.
