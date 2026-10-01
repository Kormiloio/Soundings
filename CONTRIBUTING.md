# Contributing to Soundings

Thank you for helping improve Soundings. It is an Obsidian desktop plugin that turns transcripts already in a vault into Markdown notes, locally and without ever overwriting anything. Every contribution has to keep that promise.

## Before you start

- **Bugs and ideas:** open a [GitHub issue](https://github.com/Kormiloio/Soundings/issues) using the bug or feature template. Never paste confidential transcript text, generated note bodies, credentials, or private vault paths into an issue.
- **Security problems:** do not open a public issue for a vulnerability. Report it privately through the repository's **Security** tab using **Report a vulnerability**.
- **Larger changes:** open an issue first, so the scope can be agreed before you write code.

## Safety rules every change must keep

1. Never delete, rename, move, or overwrite a source transcript or an existing Markdown file. Publication is create-only and fails if the destination exists.
2. Revalidate source evidence and destination absence immediately before every vault write.
3. Keep scanning and planning separate from writing to the vault.
4. Make no network requests and collect no telemetry. Transcript and note content never leaves the device.
5. Use only Obsidian's public vault APIs in the plugin; no Node filesystem access.
6. Keep logs and notices content-free: paths, counts, and outcome categories only, never transcript or note bodies.
7. Exclude Obsidian's configuration folder, hidden folders, and configured exclusions from scanning.

The full list is in [`AGENTS.md`](AGENTS.md), and the product requirements are in [`docs/PRD.md`](docs/PRD.md).

## Development setup

You need Node.js 20.19.0 or later.

```bash
npm ci
npm run check          # build, zero-warning type-aware lint (Obsidian rules), tests
npm run audit:runtime  # bundle loads only "obsidian"; no network, code loading, or destructive vault calls
npm run spec:validate  # strict OpenSpec validation
```

Generated `main.js` and `release/` staging files are not committed. Test changes in a disposable vault, never in a personal or work vault.

## Spec-first workflow

Soundings keeps its specifications and code in step:

1. Before writing code, read `docs/PRD.md`, `openspec/project.md`, and the relevant capability specs in `openspec/specs/`.
2. Any change to behavior, scope, or safety needs an OpenSpec change in `openspec/changes/<name>/`. It holds a `proposal.md`, a `design.md`, a `tasks.md`, and spec deltas with Given/When/Then scenarios. Run `openspec validate <name> --strict`.
3. Implement against that change. Tick tasks only after they are verified, and update `design.md` wherever the implementation differs from the plan.
4. Update the PRD, `openspec/project.md`, and user docs in the same pull request when behavior, scope, or priority changes.
5. After release, archive the change so its deltas merge into `openspec/specs/`.

Small fixes that change no behavior, such as typos or test-only refactors, do not need an OpenSpec change.

## Pull requests

- Branch from `main` and open a pull request. `main` is protected:
  - every change needs a pull request
  - the `Build, Audit & Test` check must pass on an up-to-date branch
  - force-pushes and deletion are blocked
- Keep each pull request focused, and describe the user-visible effect and any safety implications.
- Add or update tests for every behavior change. Changes that write to the vault need tests for success, an existing destination, stale source evidence, cancellation, and failure.
- Lint must report zero warnings. Fix the underlying type problem rather than adding a type assertion or a lint suppression. If a suppression is truly unavoidable, justify it in the change's `design.md`.
- Pin new development dependencies to exact versions. Runtime dependencies are not accepted: the bundle must load only `obsidian`.

## Releases

Releases are cut by the maintainer following [`docs/RELEASING.md`](docs/RELEASING.md):
- **Versions:** bare `x.y.z` tags only. Release tags are protected, and only admins can create them.
- **Gates:** packaged desktop acceptance in a disposable vault before tagging.
- **Publication:** attested assets published by the release workflow. Published releases are never changed.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
