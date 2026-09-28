# Design

## Context

Local scripts already build and validate an exact three-asset staging directory, but release publication and evidence collection are manual. GitHub Actions can issue artifact attestations only when the workflow uses the repository's identity token and attestation permission. This is repository automation, not plugin runtime behavior.

## Goals / Non-Goals

**Goals:**

- Make pull-request verification and tagged release publication reproducible.
- Generate attestations for installable assets from the tagged source.
- Preserve immutable tags/releases and least-privilege permissions.

**Non-Goals:**

- Publishing the Obsidian Community listing or responding on the owner's behalf.
- Automatically choosing a version or creating a tag.
- Changing the runtime bundle's network, telemetry, vault, or platform boundaries.

## Decisions

1. Split CI and release into separate workflows. CI uses read-only repository permissions and runs on pull requests and pushes. Release runs only for tags matching semantic versions and grants `contents: write`, `id-token: write`, and `attestations: write` at the release job. A combined always-privileged workflow was rejected.
2. Reuse package scripts and the release-preparation program as the source of truth rather than duplicating version and inventory checks in YAML. Add a tag argument driven by the event ref so the script has no hard-coded current version.
3. Build once in the release job, hash the staged assets, attest `main.js`, `manifest.json`, and `styles.css`, and upload those same bytes. Rebuilding separately for upload was rejected because provenance and release bytes could diverge.
4. Fail if the tag or release is already present and never use replacement flags. Immutability is more important than one-click repair; corrections use a new patch version.
5. Keep issue templates and changelog guidance declarative and content-free. No user vault data enters CI.

## Risks / Trade-offs

- [Workflow permissions may be unavailable at organization level] → Add a preflight checklist and fail before publication when attestation permissions are denied.
- [Dependency drift can break reproducibility] → Use the committed lockfile and pinned action major versions; keep build reproduction in Community review.
- [Tag push can trigger an invalid candidate] → All gates run before release creation, so failure leaves the tag for maintainer review but publishes no assets.
- [Automated publication reduces a manual checkpoint] → Tag creation remains explicit and immutable; Community listing publication stays owner-controlled.

## Migration Plan

Land CI first and verify it on a pull request. Test the release workflow without publishing by exercising its scripts and permission linting, then use it for the next new version only. Existing `0.1.0` through `0.1.2` releases remain untouched. Rollback disables the workflows; no runtime or vault migration exists.
