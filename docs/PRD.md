# Product requirements document: Soundings

**Repository codename:** Soundings
**Product type:** Obsidian community plugin
**Document status:** Desktop releases through 0.1.1 published; corrective 0.1.2 Community review follow-up in progress
**Last updated:** 2026-09-23

## 1. Product summary

Soundings converts transcript files already organized anywhere inside an Obsidian vault into structured Markdown notes stored beside their sources. The foundation release is deterministic, local-only, and create-only: it discovers `.txt` and Zoom-style `.vtt` files, shows what would happen, and creates selected `.md` notes without moving, deleting, renaming, or overwriting user content.

Later releases may add optional transcript cleanup, summaries, decisions, action items, people and project links, and local or explicitly configured AI providers. Those capabilities are outside the foundation release and require separate security and privacy review.

## 2. Problem

Obsidian is built around Markdown. Users can place Zoom and other meeting transcripts in the correct project folders, but `.txt` and `.vtt` content is not integrated into the normal Markdown-centered search, linking, metadata, and knowledge-management workflow. Existing import and transcript tools do not fully match the desired workflow of recursively discovering transcripts already located throughout a vault, safely converting them in place, and preserving the originals.

Without automation, the user must repeatedly rename, copy, clean, structure, and annotate transcripts. This produces inconsistent notes and makes institutional memory harder to search and connect.

## 3. Goals

- Discover supported transcript files recursively anywhere in the vault.
- Let the user review eligible files, exclusions, and destination collisions before conversion.
- Convert selected `.txt` and `.vtt` sources into well-formed Markdown beside the original.
- Preserve the authoritative source transcript byte-for-byte.
- Produce consistent metadata and sections that are ready for Obsidian search and later enrichment.
- Infer useful context, such as the containing project folder, conservatively and transparently.
- Work through Obsidian's public APIs while shipping the first release as desktop-only.
- Make privacy and safe-write behavior understandable and verifiable.
- Publish a reproducible desktop package whose GitHub release assets and Community listing metadata match the accepted source revision.

## 4. Foundation non-goals

- Transcribing audio or video.
- Calling an AI service or local model.
- Generating summaries, decisions, tasks, follow-ups, or entity links with AI.
- Modifying an existing Markdown note when its source changes.
- Deleting, moving, renaming, or archiving source transcripts.
- Watching folders outside the active vault.
- Synchronizing files between devices or storage providers.
- Supporting every caption or transcript dialect in the first release.
- Running while Obsidian is closed.
- Supporting Android, iOS, or iPadOS in the first release.

## 5. Primary workflow

1. The user places transcript files in the appropriate vault folders using their normal file workflow.
2. The user starts **Scan vault for transcripts** from the Soundings ribbon control or runs **Soundings: Scan vault for transcripts** from the command palette.
3. Soundings inventories supported files and classifies each as eligible, already converted, excluded, unsupported, unreadable, or blocked by a destination collision.
4. Soundings shows a reviewable plan and selects no blocked item.
5. The user chooses the eligible transcripts to convert.
6. Soundings revalidates the source and destination, then creates each Markdown note beside its source.
7. Soundings reports created, skipped, blocked, and failed items without exposing note content in diagnostics.

After the reviewed workflow is proven safe, a later milestone may provide opt-in conversion when a supported file is created while Obsidian is open. Automatic conversion remains disabled by default.

## 6. Generated note contract

A generated note should have a predictable structure without pretending that deterministic parsing produced AI knowledge:

```markdown
---
type: meeting-transcript
source: transcript
source_file: "Meeting 1.vtt"
source_format: vtt
soundings_version: 1
converted_at: 2026-09-22T14:30:00Z
project: ProMBA
---

# Meeting 1

## Summary

> Not generated. Add a summary manually or with an approved enrichment workflow.

## Decisions

## Action Items

## Follow-ups

## Transcript

### Mario

~~~text
We need to understand…
~~~
```

The exact metadata schema is versioned. A missing or ambiguous project value is omitted rather than guessed. Foundation conversion may normalize caption structure and line endings but must preserve the spoken text represented by the source.

## 7. Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Soundings inventories supported transcript files recursively using Obsidian's public vault API. | Must |
| FR-02 | The foundation release recognizes `.txt` and valid WebVTT `.vtt` files case-insensitively. | Must |
| FR-03 | Default exclusions include the active vault's configured Obsidian configuration directory, hidden folders, Soundings state, and user-configured exclusion patterns. | Must |
| FR-04 | A scan classifies every discovered candidate without mutating the vault. | Must |
| FR-05 | The user can review and select eligible conversions before execution. | Must |
| FR-06 | The destination remains beside the source, replaces the final extension with `.md`, and deterministically normalizes basename characters rejected by Obsidian; the exact final path is shown during review and the source name is unchanged. | Must |
| FR-07 | Conversion creates a new Markdown file only when the destination does not exist at execution time. | Must |
| FR-08 | Soundings never overwrites, deletes, renames, moves, or edits a source transcript. | Must |
| FR-09 | An existing destination is reported as a collision and remains untouched, regardless of its contents. | Must |
| FR-10 | The executor revalidates source identity and destination absence immediately before creation. | Must |
| FR-11 | Plain-text conversion preserves source text with only documented encoding, line-ending, and structural normalization. | Must |
| FR-12 | WebVTT conversion removes format control records, preserves cue text in order, and retains speaker attribution when reliably present. | Must |
| FR-13 | Generated notes contain versioned YAML metadata, a title, reserved enrichment sections, and the converted transcript. | Must |
| FR-14 | Project inference is configurable and uses an explicit folder rule; ambiguous values are omitted. | Should |
| FR-15 | Results distinguish created, skipped, blocked, unsupported, and failed items with actionable reasons. | Must |
| FR-16 | Manual scans and active conversions can be cancelled without corrupting or partially publishing a note. | Must |
| FR-17 | Automatic conversion, when later enabled, is opt-in, runs only while Obsidian is open, and uses the same validation and create-only boundary. | Should |
| FR-18 | The foundation plugin makes no network requests and collects no telemetry. | Must |
| FR-19 | The plugin provides settings for supported formats, exclusions, maximum source size, and project inference without exposing unsafe overwrite behavior. | Must |
| FR-20 | A user can inspect the source path and intended destination for every planned conversion. | Must |
| FR-21 | Obsidian desktop exposes one labeled Soundings ribbon control and retains the command-palette command; both start the same reviewed scan without selecting or converting candidates automatically. | Must |
| FR-22 | Each public release provides an MIT license, complete user guidance including vault-enumeration disclosure, matching version metadata, and exactly the three Obsidian runtime assets under an immutable release tag. | Must |

## 8. Safety, privacy, and security requirements

- **Create-only publication:** destination creation must use an API contract that fails when the path already exists. A check followed by an overwriting write is not sufficient.
- **No source mutation:** the plugin must not offer source deletion or archival in the foundation release.
- **Fail closed:** source changes, destination appearance, parse uncertainty that risks text loss, cancellation, and plugin unload prevent publication or produce an explicit failure.
- **Local processing:** transcript bytes remain on the device and inside the vault. The plugin has no analytics or remote dependency.
- **Content-free diagnostics:** normal logs and notices may contain paths, sizes, hashes, parser outcomes, and error categories but not transcript or generated-note bodies.
- **No secret requirement:** foundation conversion requires no credentials, API keys, tokens, or accounts.
- **Explicit future consent:** any future AI integration must disclose what content leaves the device, the destination, retention implications, and whether a local-only option exists.

## 9. Quality requirements

- **Compatibility:** declare the first release desktop-only, require Obsidian desktop 1.13.7 or later, and use the Obsidian API rather than Node-only filesystem primitives in runtime code. Mobile support requires a later approved change.
- **Correctness:** UTF-8, UTF-8 with BOM, CRLF, repeated VTT cues, cue settings, speaker tags, malformed VTT, empty files, mixed-case extensions, safe Unicode names, rejected filename punctuation, unusable basenames, and post-normalization collisions have automated coverage.
- **Resilience:** one unreadable or malformed transcript does not abort unrelated conversions.
- **Performance:** a 5,000-file disposable desktop vault scan remains responsive and cancelable; parsing and conversion use a documented conservative source-size limit.
- **Accessibility:** the labeled ribbon control, commands, review controls, statuses, and errors are keyboard-accessible and do not rely on color alone.
- **Testability:** discovery, exclusion, planning, parsing, rendering, path derivation, and execution are independently testable.
- **Distribution:** release preparation fails closed when repository metadata, versions, tags, or runtime assets are missing or inconsistent; packaged assets pass desktop acceptance before publication.

## 10. Delivery phases

1. **Foundation:** plugin scaffold, settings model, pure discovery/planning types, parsers, renderer, and safety primitives.
2. **Reviewed conversion alpha:** vault-wide preview and explicit create-only batch conversion in a disposable vault.
3. **Desktop hardening:** large-vault testing, cancellation, accessibility, and real Obsidian desktop verification.
4. **Opt-in observation:** safe conversion of newly created transcripts while Obsidian is open, disabled by default.
5. **Deterministic enrichment:** configurable templates, speaker normalization, and additional transcript formats.
6. **Local intelligence:** separately approved local-model summaries, decisions, actions, and linking.
7. **External AI evaluation:** optional providers only after an explicit data-handling and consent design is approved.
8. **Desktop community release:** documentation, release automation, policy review, and Obsidian catalog submission.
9. **Mobile evaluation:** separately approved Android, iOS, and iPadOS performance and vault-API acceptance.

## 11. Foundation acceptance gate

Soundings may not be enabled in a personal or work vault until a disposable-vault rehearsal demonstrates:

- correct classification across nested folders and exclusions;
- no mutation of source transcripts;
- no overwrite when a destination exists before preview or appears after preview;
- faithful text output for representative Zoom `.txt` and `.vtt` samples;
- cancellation without a partial destination;
- restart-safe behavior with previously converted and colliding files; and
- content-free diagnostics.

## 12. Open product decisions

- The exact supported Zoom `.txt` layouts and how reliably speakers can be inferred from them.
- Whether timestamps should be retained, removed, or offered as a conversion option.
- Whether the conservative 5 MB desktop source limit should be raised after post-release profiling.
- Whether generated notes should reserve empty enrichment headings or use callouts explaining that enrichment has not run.
- Whether project inference should be based on a configurable root such as `Projects/` or simply the immediate parent folder.
- How a later, explicitly requested reconversion updates a generated note without overwriting user-authored content.
- Which local model runtimes, if any, can work reliably in Obsidian desktop; mobile runtime evaluation is deferred with mobile support.

## 13. Community release acceptance gate

Soundings 0.1.2 may not be published in the Obsidian Community directory until:

- the public default branch contains an MIT license and complete user-facing installation, usage, privacy, safety, limitation, support, and licensing guidance;
- package, manifest, compatibility map, and exact `0.1.2` release tag agree while published releases `0.1.0` and `0.1.1` remain unchanged;
- a clean staging directory contains only `main.js`, `manifest.json`, and `styles.css` and their hashes are recorded;
- the complete automated suite, runtime audit, scale rehearsal, strict OpenSpec validation, and diff checks pass;
- those staged assets pass non-mutating review and explicit create-only conversion checks in a disposable Obsidian desktop vault;
- the public GitHub release exposes the three accepted assets with matching hashes; and
- the Community rescan reports no actionable source warnings; and
- the repository owner explicitly publishes the already created listing draft.

## 14. Implementation checkpoint

The foundation plugin, pure conversion core, reviewed create-only executor, settings, review UI, and lifecycle integration are implemented. The production build, runtime security audit, 60 automated tests, and a temporary 5,000-file desktop rehearsal pass. The rehearsal covered discovery, preview, conversion, destination races, cancellation, restart classification, and source-byte preservation.

The desktop foundation acceptance gate passed in a disposable vault using Obsidian 1.13.7 on macOS 26.6.2 arm64. Manual keyboard validation exposed textual errors without relying on color; real create/read-back succeeded; an existing destination and a destination introduced after preview were preserved; and all source hashes remained unchanged. The first release is desktop-only, with Obsidian 1.13.7 pinned as the verified minimum. Android, iOS, and iPadOS support and acceptance are deferred to a separate future change. The 5 MB source limit remains a conservative desktop default.

Work-vault testing later exposed that Obsidian refused Markdown creation when a source basename contained `:`. The `support-safe-destination-filenames` change now derives and previews a deterministic safe destination without changing the source name. The production build, runtime security audit, strict OpenSpec validation, 69 automated tests, and a repeated 5,000-file rehearsal with zero source mutations pass. Disposable-vault acceptance on Obsidian desktop 1.13.7 confirmed the exact reviewed safe destination, successful create/read-back, sanitized collision refusal, close-without-conversion behavior, and unchanged source hashes. After explicit confirmation, the accepted build was installed in the work vault with matching plugin-file hashes. A controlled conversion then created the reviewed safe destination with correct source metadata while preserving the original transcript hash; the other 25 candidates were skipped and no existing Markdown was overwritten.

The `add-scan-ribbon-icon` change registers one built-in waves control labeled **Scan vault for transcripts** and retains the command-palette entry, with both routed to the existing guarded review workflow. The production build, runtime security audit, strict OpenSpec validation, 69 automated tests, and 5,000-file rehearsal with zero source mutations pass. Disposable-vault acceptance on Obsidian desktop 1.13.7 confirmed one correctly labeled waves icon after disable/re-enable, an unselected review plan on activation, and the retained command-palette entry. After explicit confirmation, the hash-matched build was installed in the work vault; the ribbon opened the same unselected plan, and a repeated close-without-conversion check left the reference transcript and Markdown note hashes unchanged.

The corrective `0.1.1` implementation passed its automated and packaged desktop gates, was published immutably, and received a completed Community rescan. That rescan cleared every original finding and passed network, dependency, obfuscation, and byte-for-byte build checks, but reported two new source warnings: an unnecessary saved-settings type assertion and `activeWindow.setTimeout()` usage. Vault enumeration and missing GitHub artifact attestations remain recorded recommendations rather than failures.

The `clear-community-review-followups` change prepares immutable release `0.1.2` to remove those two warnings without changing conversion behavior or the desktop-only, local-only, reviewed, and create-only boundaries. The listing remains unpublished pending automated checks, packaged desktop acceptance, immutable release verification, and a clean owner-controlled Community rescan.
