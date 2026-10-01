# Tasks

## 0. Changeset approval
- [x] 0.1 Draft proposal, design, spec deltas, and tasks; pass `openspec validate add-folded-transcript-callouts --strict`
- [ ] 0.2 Owner approves scope and the design choices: callout type `quote`, folded by default, fixed label `Full Transcript`, speaker headings inside, no expanded variant or custom label in `0.3.0`

## 1. Profile option
- [ ] 1.1 Add `transcriptDisplay` (`plain` | `folded-callout`, default `plain`) to `OutputProfile`, `DEFAULT_OUTPUT_PROFILE`, and `validateOutputProfile`; tests for the default, migration of profiles without the field, and rejection of unknown values
- [ ] 1.2 Include it in `outputProfileFingerprint` and `outputProfileSummary`; tests that changing it marks a plan stale and that the summary states it
- [ ] 1.3 Return note schema version `2` for non-plain display; test

## 2. Rendering
- [ ] 2.1 Render the folded callout by prefixing every line of the plain transcript body (`> ` / `>`) below `## Transcript`; golden fixtures for plain txt, multi-speaker vtt, and vtt with retained timestamps
- [ ] 2.2 Prove plain output is byte-identical to `0.2.3` with the existing goldens unchanged
- [ ] 2.3 Add exact-pinned `micromark` and structural tests: one blockquote after `## Transcript`, callout marker first, all text contained, nothing after; adversarial inputs as listed in the design
- [ ] 2.4 Extend the bounded-processing tests to the folded path at the size limit

## 3. Settings screen
- [ ] 3.1 Add the **Transcript display** dropdown to the Note output group; update the settings-tab and UI contract tests (definition count)
- [ ] 3.2 Confirm `npm run lint` stays at zero warnings, including Obsidian sentence-case rules for the new text

## 4. Documentation and version
- [ ] 4.1 Update `README.md` (settings list), `docs/SUPPORTED_TRANSCRIPTS.md` (generated Markdown), and `docs/PRD.md` (an FR for transcript display, phase 8 status)
- [ ] 4.2 Add `0.3.0` changelog notes; bump `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` to `0.3.0`
- [ ] 4.3 Update `openspec/project.md` and `docs/VERIFICATION.md`; run build, lint, tests, audits, strict validation, release staging, and `git diff --check`

## 5. Acceptance and publication
- [ ] 5.1 Packaged desktop acceptance in a disposable vault. Cover:
  - default (plain) conversion unchanged
  - folded conversion renders collapsed with the label, expands on click, and shows speakers and text
  - Obsidian search finds a phrase inside a folded transcript
  - Outline behavior recorded
  - an adversarial transcript stays inside the callout
  - changing the display after review marks the plan stale
  - manual enrichment works on a folded note
  - protected hashes unchanged
- [ ] 5.2 Open a pull request; CI passes under `Protect main`
- [ ] 5.3 After owner approval, merge and push tag `0.3.0`; verify three attested assets and unchanged prior releases
- [ ] 5.4 Owner rescans the Community listing; record the scorecard (target: Review Passed, no warnings)
- [ ] 5.5 Archive the change and sync the deltas into `openspec/specs/`
