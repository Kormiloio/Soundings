# Tasks

## 0. Changeset approval
- [x] 0.1 Record code-review and security-review findings for `0.2.1` in `proposal.md`
- [x] 0.2 Draft design, spec deltas, and tasks; pass `openspec validate harden-0-2-2 --strict`
- [x] 0.3 Owner approves the changeset scope before implementation begins (approved 2026-09-30)

## 1. Bounded parsing and rendering (security finding 1, 3)
- [x] 1.1 Add failing regression tests: 1 MB `<v.`, `<v `, and `<` inputs classify within 500 ms; 150,000 tilde runs render
- [x] 1.2 Replace cue-markup regular expressions with a linear scanner (256-character tag limit; tag bodies containing `<` refused; unterminated `<` stays literal); make `ALLOWED_TAG` non-backtracking; differential-fuzz against 0.2.1 (400k cases, only fail-closed differences)
- [x] 1.3 Replace the `Math.max` spread in fence sizing with a loop
- [x] 1.4 Verify every existing golden output is byte-identical

## 2. WebVTT faithfulness (code review 4, 7)
- [x] 2.1 Attribute text after `</v>` to no speaker; add test for `<v A>hi</v> narrator <v B>yo`
- [x] 2.2 Recognize the voice tag only before whitespace, `.`, or `>`; add `<video>` and `<vfoo>` refusal tests
- [x] 2.3 Remove the duplicate U+FEFF strip; add a double-BOM decoding test

## 3. Planning identity (code review 1)
- [x] 3.1 Compare existing and in-plan destinations by NFC case-folded key; add case-variant and NFC/NFD tests
- [x] 3.2 Refuse dot-leading sanitized basenames as `destination-invalid`; add `?.env.txt` test
- [x] 3.3 Add `existsOnDisk` (via `vault.adapter.exists`) to the vault adapter and refuse at execution and companion publication; add tests with a case-insensitive in-memory adapter

## 4. Execution isolation and lifecycle (security 3, code review 3, 16)
- [x] 4.1 Catch parse and render errors per item as `failed`; add test with a throwing renderer
- [x] 4.2 Add the `unloaded` guard to scan, conversion, inbox review, and enrichment publication
- [x] 4.3 Track and close owned modals on unload; make closing the progress modal cancel the run
- [x] 4.4 Add behavior tests for `main.ts`: unload with an open review and an open enrichment modal, and progress dismissal

## 5. Observation (security 2, code review 2, 6)
- [ ] 5.1 Subscribe to `create` only inside `workspace.onLayoutReady`; add test that vault-load events queue nothing
- [ ] 5.2 Prefilter created paths synchronously before `pending`; add non-transcript event-storm test asserting zero pending and no reads
- [ ] 5.3 Stop stability retries on permanent outcomes; add oversized and excluded single-attempt tests
- [ ] 5.4 Restart observation and clear the inbox only when enablement or roots change; add retention test

## 6. Note structure safety (security 4, 5; code review 5, 10, 15)
- [ ] 6.1 Escape `%`, `$`, `=`, `~`, `^` in generated headings; add speaker `%%` and `$5 … $10` tests
- [ ] 6.2 Escape C1 controls and U+2028/U+2029 in frontmatter strings; add YAML round-trip test
- [ ] 6.3 Neutralize fence, setext, and thematic-break lines in enrichment prose and list items; add structure tests
- [ ] 6.4 Refuse enrichment for source-note paths with link-breaking characters; add `x]] <img …> [[y` test

## 7. Settings (code review 12)
- [ ] 7.1 Type-check every saved-settings field with per-field default fallback and content-free warnings
- [ ] 7.2 Add tests for string booleans, a non-array `excludedPaths`, and non-string list entries; verify the plugin loads

## 8. Cleanup (code review 11)
- [ ] 8.1 Remove the self-comparing output-profile and draft fingerprint checks
- [ ] 8.2 Rename or rewrite the stale-profile test so it names the `isPlanCurrent` path

## 9. Release tooling (security 6, 7, 8; code review 13, 14)
- [ ] 9.1 Confine `prepare-release.mjs` output to `release/<version>` and refuse symlinks; add tests for `src`, `.git`, and a symlink
- [ ] 9.2 Add a bundle import allowlist and a repository-wide forbidden-member scan to `audit-runtime.mjs`; add bypass tests (`requestUrl`, `import(`, computed `window[...]`, `vault.process`, `adapter.write`)
- [ ] 9.3 Pin the `obsidian` dev dependency to an exact version and regenerate the lockfile with `npm install` (not `npm audit fix --force`)

## 10. Documentation and version
- [ ] 10.1 Add `0.2.2` changelog notes, including the new refusals and heading-escape output change
- [ ] 10.2 Update `docs/PRD.md` (status, last-updated date, safety section), `docs/SUPPORTED_TRANSCRIPTS.md` (tag limit, `</v>` behavior), `docs/PRIVACY.md` if affected, and `openspec/project.md` (checkpoint and test count)
- [ ] 10.3 Bump `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` to `0.2.2`
- [ ] 10.4 Run build, full tests, runtime and dependency audits, strict OpenSpec validation, and `git diff --check`

## 11. Acceptance and publication
- [ ] 11.1 Stage `0.2.2` and complete packaged desktop acceptance in a disposable vault. Cover:
  - an adversarial `.vtt` scan stays responsive
  - observation is quiet at startup
  - case-variant collision refusal
  - an unlinkable enrichment refusal
  - an unload with an open modal
  - create-only checks, with recorded hashes
- [ ] 11.2 Push the branch, open a pull request, and confirm CI passes
- [ ] 11.3 After owner approval, merge and push tag `0.2.2`; verify three matching attested assets and unchanged prior releases
- [ ] 11.4 Archive the change and sync spec deltas into `openspec/specs/`

## Owner actions (outside code)
- [ ] O.1 Enable branch protection on `main` and tag protection for `x.y.z` tags in GitHub repository settings
