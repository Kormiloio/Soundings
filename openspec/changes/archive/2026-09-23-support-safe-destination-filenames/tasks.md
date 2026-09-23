# Tasks

## 1. Pure destination planning

- [x] 1.1 Add a pure destination-basename normalization result that preserves safe Unicode names, deterministically replaces the specified rejected characters, trims unsafe endings, and reports unusable basenames; verify focused unit cases pass.
- [x] 1.2 Integrate the normalized destination into plan construction and non-selectable classification without changing original source title or evidence; verify planning tests cover the observed colon filename and a fully unusable basename.
- [x] 1.3 Apply existing-path and same-plan ambiguity checks to final normalized destinations; verify automated tests prove sanitized collisions are blocked and existing Markdown bytes are never changed.

## 2. Publication safety and regression coverage

- [x] 2.1 Add an integration test that previews and creates a colon-bearing source at the reviewed safe destination while preserving source bytes, original `source_file` metadata, and the create-only read-back check.
- [x] 2.2 Add failure, stale-evidence, cancellation, and destination-race regression cases around normalized destinations; verify every case remains isolated and creates no partial or overwriting write.

## 3. Documentation and automated verification

- [x] 3.1 Update `docs/PRD.md` FR-06, filename-edge-case quality coverage, implementation checkpoint, and `openspec/project.md` active context to match the approved destination-normalization behavior; verify documentation contains no claim beyond completed evidence.
- [x] 3.2 Run `npm run check`, `npm run audit:runtime`, `git diff --check`, and strict OpenSpec validation; verify all commands pass before any target-vault installation.

## 4. Desktop acceptance and deployment

- [x] 4.1 In a disposable Obsidian desktop 1.13.7+ vault, verify the plan exposes the exact safe destination, a colon-bearing source converts and reads back successfully, a sanitized collision is blocked, cancellation creates nothing, and pre/post source hashes match.
- [x] 4.2 After disposable-vault acceptance and explicit confirmation, install the verified `main.js`, `manifest.json`, and `styles.css` in the work vault; verify their hashes match the accepted build before enabling it.
- [x] 4.3 In the work vault, run a fresh scan and convert one previously failing colon-bearing transcript; verify the reviewed safe destination is created and readable, the source path and bytes remain unchanged, and no existing Markdown is overwritten.
