# Tasks

## 1. Output profile and migration

- [x] 1.1 Add the closed output-profile types, current-behavior defaults, normalization, validation, and settings fingerprint contribution; verify unit tests cover the `source-name` and `parent-folder-source-name` title choices, the `source-name` and `source-name-note` destination choices, and reject unknown patterns, unsafe names, invalid tags, and timestamp policies
- [x] 1.2 Extend saved-settings migration and declarative settings controls for sections, tags, title/destination patterns, and timestamp policy; verify pre-profile settings reproduce prior output and invalid saved values restore safe defaults
- [x] 1.3 Add pure title and destination derivation for the approved content-neutral built-in patterns followed by mandatory safe-name normalization; verify tests cover parent-folder titles, root-level title fallback, the literal ` - Note` suffix, Unicode, rejected punctuation, unusable names, duplicate destinations, and existing-destination collisions

## 2. Parsing, planning, and rendering

- [x] 2.1 Preserve normalized WebVTT cue timing in the parsed model without changing plain-text behavior; verify parser tests cover hour-based times, cue settings, repeated cues, malformed timing, and explicit speakers
- [x] 2.2 Bind the normalized profile identity and output summary to each plan; verify tests prove exact preview, collision-first classification, and stale rejection after settings changes
- [x] 2.3 Update the versioned renderer for configured sections, tags, title, and omit/retain timestamps; verify golden tests cover default byte compatibility, each option, YAML-sensitive values, inert Markdown syntax, and deterministic repeated output

## 3. Execution and regression gates

- [x] 3.1 Revalidate the output-profile fingerprint immediately before creation through the existing executor; verify stale profile, destination race, cancellation, and create/read-back tests leave sources and existing Markdown unchanged
- [x] 3.2 Run the full unit/integration/golden suite, 5,000-file rehearsal, production build, runtime audit, dependency audit, strict OpenSpec validation, and `git diff --check`; record zero source mutations and no network or destructive capability

## 4. Documentation and desktop acceptance

- [x] 4.1 Update README, supported-transcript guidance, output-schema documentation, `docs/PRD.md`, and `openspec/project.md`; verify defaults, timestamp semantics, safe built-in patterns, and non-goals match the specs
- [x] 4.2 Install staged assets in a disposable Obsidian desktop vault and verify settings migration, settings search, exact profile preview, default output compatibility, retained timestamps, optional sections/tags, invalid-setting rejection, and close-without-mutation
- [x] 4.3 Execute representative selected profiles and verify destination/read-back bytes, collision refusal, stale-profile refusal, unchanged source and existing-note hashes, and recorded evidence in `docs/VERIFICATION.md`
