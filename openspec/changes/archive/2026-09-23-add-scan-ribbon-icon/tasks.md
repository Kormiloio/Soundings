# Tasks

## 1. Ribbon entry point

- [x] 1.1 Register exactly one built-in `waves` ribbon icon during plugin load with tooltip `Scan vault for transcripts`, route it to the existing reviewed scan method, and verify TypeScript compilation succeeds.
- [x] 1.2 Extend UI contract coverage to prove the ribbon and existing command are both registered once, use the same scan method, preserve the active-run guard, and rely on plugin lifecycle cleanup; verify the focused test passes.

## 2. Documentation and automated verification

- [x] 2.1 Update `docs/PRD.md` and `openspec/project.md` to document the ribbon entry point, retained command, unchanged safety boundary, and pending desktop acceptance; verify the documentation makes no unsupported acceptance claim.
- [x] 2.2 Run `npm run check`, `npm run audit:runtime`, `git diff --check`, and strict OpenSpec validation; verify all commands pass before installing the build in any vault.

## 3. Desktop acceptance and deployment

- [x] 3.1 Install the verified build in a disposable Obsidian desktop 1.13.7+ vault and verify one waves icon appears with the correct tooltip, opens an unselected review plan, leaves the command available, respects the active-run guard, and is removed/recreated without duplication across disable/re-enable.
- [x] 3.2 After disposable-vault acceptance and explicit confirmation, install hash-matched `main.js`, `manifest.json`, and `styles.css` in the work vault; verify the ribbon opens the same reviewed plan without modifying vault content.
