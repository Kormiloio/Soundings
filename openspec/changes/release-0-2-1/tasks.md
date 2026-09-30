# Tasks

## 1. Transcript faithfulness
- [x] 1.1 Split multi-voice cues into per-speaker blocks with cue timing; update voice-payload tests and add inline and leading-unattributed cases
- [x] 1.2 Skip WebVTT header metadata up to the first blank line without dropping a cue that directly follows the signature; add tests
- [x] 1.3 Treat whitespace-only lines as cue separators and fail closed on timing-less chunks; add tests
- [x] 1.4 Decode character references in one pass; add a `&amp;lt;` test
- [x] 1.5 Verify golden outputs for single-voice fixtures are unchanged

## 2. Manual enrichment
- [x] 2.1 Identify frontmatter by line-delimited fences; add tests for `---` inside values, CRLF, and BOM
- [x] 2.2 Keep the enrichment modal open with its draft on every non-created outcome and refresh source evidence after a stale outcome; add modal tests
- [x] 2.3 Verify cancel still discards the draft and no path creates or edits files without explicit confirmation

## 3. Release automation (extends `automate-release-provenance`)
- [x] 3.1 Accept only bare semantic tags; update workflow contract tests
- [x] 3.2 Split read-only build and job-scoped publish jobs; disable persisted credentials; verify tag is on `main`; refuse existing releases
- [x] 3.3 Pin actions by commit SHA and move CI/release to Node.js 22
- [x] 3.4 Publish only the matching changelog section and fail if it is missing

## 4. Documentation and version
- [x] 4.1 Correct the `0.2.0` changelog, add `0.2.1` notes, and update PRD, `openspec/project.md`, `docs/RELEASING.md`, and `docs/SUPPORTED_TRANSCRIPTS.md`
- [x] 4.2 Record in `docs/VERIFICATION.md` that published `0.2.0` assets differ from the accepted build
- [x] 4.3 Bump `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` to `0.2.1`
- [x] 4.4 Run build, full tests, runtime audit, dependency audit, strict OpenSpec validation, and `git diff --check`

## 5. Acceptance and publication
- [x] 5.1 Stage `0.2.1` and complete packaged desktop acceptance in a disposable vault (multi-voice, header metadata, enrichment draft retention, create-only checks) with recorded hashes
- [x] 5.2 Push the branch, open a pull request, and confirm CI passes
- [ ] 5.3 After owner approval, merge and push tag `0.2.1`; verify three matching attested assets and unchanged prior releases
