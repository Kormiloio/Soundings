# Tasks

## 1. Settings and shared discovery policy

- [x] 1.1 Extend saved settings with observation disabled by default and validated vault-relative observation roots; verify migration, invalid-root, mandatory-exclusion, and settings-search tests pass
- [x] 1.2 Extract a shared single-path discovery policy used by manual and event-driven discovery; verify table-driven tests produce identical classifications for formats, exclusions, size limits, unreadable files, and source evidence
- [x] 1.3 Add bounded stability retry and cancellation behavior for newly created files; verify fake-timer tests cover partial writes, unchanged retries, eventual readability, exhaustion, and unload cancellation

## 2. Inbox core and lifecycle

- [x] 2.1 Implement the content-free in-memory inbox with path/source-identity deduplication and current-entry removal; verify unit tests cover repeated events, changed identities, deleted files, and unrelated failure isolation
- [x] 2.2 Register and unregister public Obsidian create-event observation only while enabled and loaded; verify lifecycle tests prove disabled defaults, no parallel run, unload cleanup, and zero conversion calls
- [x] 2.3 Add coalesced local notification and an inbox command that replans queued files into an unselected standard review; verify integration tests cover collision-after-observation, missing files, dismissal, and no automatic modal or conversion

## 3. Safety and scale verification

- [x] 3.1 Exercise an event storm containing duplicates, exclusions, oversized files, and readable candidates; verify bounded work, responsive cancellation, content-free state, and zero vault mutations
- [x] 3.2 Run the full unit/integration suite, production build, runtime audit, dependency audit, strict OpenSpec validation, and `git diff --check`; verify no network, telemetry, destructive vault API, or persisted transcript content was introduced

## 4. Documentation and desktop acceptance

- [x] 4.1 Update README, settings guidance, `docs/PRD.md`, `openspec/project.md`, supported-transcript documentation, and privacy disclosures; verify observation is described as opt-in, in-memory, local, reviewed, and inactive while Obsidian is closed
- [x] 4.2 Install staged assets in a disposable Obsidian desktop vault and verify disabled-default behavior, enabled observed roots, excluded/config files, deduplication, notification, command handoff, zero preselection, dismissal, and unload cleanup
- [x] 4.3 Convert one explicitly selected inbox candidate through the existing executor; verify source and collision hashes remain unchanged, destination read-back succeeds, and all evidence is recorded in `docs/VERIFICATION.md`
