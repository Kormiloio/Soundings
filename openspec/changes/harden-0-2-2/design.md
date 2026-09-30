# Design

## Context

Every fix stays inside its existing layer.
- Parser, renderer, planner, settings, and enrichment rendering remain pure in `src/core`.
- The existence check and lifecycle guards live at the Obsidian boundary (`src/obsidian`, `src/main.ts`).
- Discovery and planning stay separate from mutation.
- No Node or platform API is added, so future mobile evaluation is unaffected.
- Desktop-only scope is unchanged.

## Decisions

1. **Linear cue-markup scanner.** `stripCueMarkup` and voice segmentation become one left-to-right pass.
   - The pass uses `indexOf("<")` / `indexOf(">")` and never uses regular expressions over unbounded input.
   - A tag runs from `<` to the next `>`, matching the 0.2.1 tag boundaries.
   - A tag body longer than 256 characters, a tag body containing `<`, or a tag outside the allowlist makes the file `unsupported-vtt`, which is already a content-free outcome.
   - A `<` with no later `>` in the cue, and an empty `<>`, stay literal text as in 0.2.1.
   - **Implementation note (deviation from draft):** the draft proposed refusing unterminated `<`. That would newly refuse files with literal "a < b" text that 0.2.1 accepts, so it was dropped.
   - A differential fuzz of 400,000 random cues against the 0.2.1 parser showed that the only behavior differences are cues whose tag body contains `<`. The 0.2.1 two-pass regexes sometimes treated such a `<` as literal and sometimes produced different text. The scanner refuses them all, so every difference is fail-closed.
   - The same review found that `ALLOWED_TAG`'s `c(?:\.[^ >]+)*` backtracks exponentially (about 20 ms at 22 class groups, roughly 10× more per 4 extra groups). It is replaced by the equivalent `c(?:\.[^ >]+)?`. `lang(?:\s+[^>]+)?` becomes the equivalent (after trimming) `lang(?:\s[^>]*)?`.
   - The voice tag is recognized only as `v` followed by `.`, whitespace, or `>`. Classes are `(\.[^\s.>]+)*`, and the annotation is the remainder.
   - Opening `<v …>` starts a new attributed segment. `</v>` ends it, and following text becomes an unattributed segment.
   - Allowed tags are `b`, `i`, `u`, `c` (with classes), `lang`, and `ruby`/`rt`, the same `ALLOWED_TAG` set as `0.2.1`. Classes on `b`/`i`/`u` and cue timestamp tags stay refused (deferred).
   - Single-voice golden outputs must be byte-identical.
   - *Alternative rejected:* rewriting the regular expressions to be unambiguous. This is still fragile under future edits and harder to prove linear.
   - A regression test asserts that 1 MB adversarial inputs (`<v.` repeated, `<` repeated, `<v ` repeated) parse or refuse in under 500 ms.

2. **Fence sizing.** Compute the longest `~` run with a single loop over the string, and never spread into `Math.max`.

3. **Per-item isolation.** In `executePlan`, wrap parse and render for each item in `try`/`catch`. Any thrown error becomes a `failed` outcome with a content-free category (`render-failed`), and the batch continues. The create and read-back section keeps its existing handling.

4. **Collision identity.** `collisionKey(path) = path.normalize("NFC").toLowerCase()`.
   - Planning builds `existingKeys` from existing paths and computes in-plan ambiguity counts by key.
   - The displayed destination path is unchanged (the exact derived path).
   - Case folding is applied on every platform. Some users sync across case-insensitive and case-sensitive systems, and a false "blocked" is safe while a false "eligible" is not.
   - *Alternative rejected:* detecting filesystem case sensitivity at runtime. It is platform-specific and unreliable across sync providers.

5. **Dot-leading destinations.** If the sanitized basename begins with `.`, derivation fails with the existing `destination-invalid` classification and an actionable reason. The source is untouched.

6. **Execution-time filesystem check.**
   - `ConversionVault` gains `existsOnDisk(path)`, implemented as `vault.adapter.exists(path)`. That call is case-insensitive by default and sees unindexed files.
   - Execution refuses with `destination-exists` when either the index lookup or `existsOnDisk` reports the path.
   - The await happens before the final synchronous index check and `createBinary`. This leaves no new await between the last check and create.
   - Companion publication uses the same check.
   - This reads only metadata. It is a public API, but it is adapter-level, so the runtime audit allows `adapter.exists` only in `vault-adapter.ts`.

7. **Observation lifecycle.**
   - `syncObservation` subscribes to `vault.on("create")` only inside `workspace.onLayoutReady`, guarded by the `unloaded` flag.
   - `handleCreated` runs a synchronous prefilter using the shared pure discovery policy (extension, enabled format, observation root, mandatory and user exclusions) before touching `pending`.
   - Stability retries continue only while the file is absent from the index or its evidence differs between attempts. Retries stop immediately on `excluded`, `too-large`, `unsupported`, or non-candidate results.
   - `setSettings` restarts observation, and clears the inbox, only when `observationEnabled` or `observationRoots` changed; otherwise the observer keeps running. The dead default parameter is removed so callers pass `clearInbox` explicitly.

8. **Unload guard and modal ownership.**
   - The plugin sets `unloaded = true` in `onunload`.
   - `scan`, `convertPlan`, `publishEnrichment`, and inbox review return early when the flag is set.
   - Opened `ReviewModal`, `EnrichmentModal`, progress, and results modals register in a `Set` and are closed in `onunload`.
   - Closing the progress modal by any means calls `runs.cancel()`.

9. **Enrichment prose safety.** `safeProse` prefixes a backslash to any line whose first non-space characters would:
   - open a fence (three or more `` ` `` or `~`)
   - form a setext underline (`=` or `-` runs only)
   - form a thematic break
   - start a heading (`#`, already escaped today)

   The visible text is preserved. List items in Decisions, Action Items, and Follow-ups get the same line-level escaping.

10. **Linkable companion source.**
    - `identifySourceNote` refuses (a content-free `source-note-unlinkable` reason) when the source note's vault path contains `[`, `]`, `|`, `#`, `^`, `<`, `>`, or a line break.
    - Other paths render the unchanged `[[path|Back to Transcript Note]]`.
    - *Alternative deferred:* a percent-encoded Markdown link. Its resolution behavior in Obsidian 1.13.7 is unverified, and fail-closed is sufficient for a patch.

11. **Heading and metadata escaping.**
    - `safeHeading` additionally backslash-escapes `%`, `$`, `=`, `~`, and `^`.
    - Frontmatter string encoding escapes U+0080–U+009F, U+2028, and U+2029 as `\uXXXX` after `JSON.stringify`. The result is still a valid YAML double-quoted scalar.
    - Outputs for names without these characters are byte-identical.

12. **Decoder.** Remove the manual U+FEFF strip, because `TextDecoder` already drops exactly one BOM. A second, genuine U+FEFF is preserved.

13. **Settings typing.**
    - `validateSettings` checks the runtime type of every field: booleans, safe integers, arrays of strings, and enum members.
    - A wrong-typed field falls back to its default and adds a content-free warning such as `settings-field-reset:<field>`.
    - Mandatory exclusions are always re-applied.
    - Loading never throws on a malformed `data.json`.

14. **Dead checks.**
    - Remove the per-item output-profile fingerprint comparison in `execution.ts`, which is identical to the plan's. `isPlanCurrent` remains the guard.
    - Remove the draft self-comparison in `enrichment-execution.ts`.
    - Rename the stale-profile test to name the `isPlanCurrent` path.

15. **Release tooling.**
    - `prepare-release.mjs` accepts only an output that resolves to `release/<manifest version>` beneath the repository. It refuses if `release/` or the target is a symbolic link (checked with `lstat`) before any removal.
    - `audit-runtime.mjs`:
      - builds with an esbuild metafile and fails unless the only external import is `obsidian`
      - scans all of `src/` for forbidden identifiers and member names (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `requestUrl`, `request(`, `import(`, `eval`, `Function(`, `require(`, `window.open`, `.modify`, `.modifyBinary`, `.process`, `.append`, `.delete`, `.trash`, `.rename`, `.copy`, `fileManager`, `adapter.write`, `adapter.remove`, `adapter.rename`, `adapter.mkdir`)
      - allows `adapter.exists` only in `vault-adapter.ts`
      - fails on computed member access to `window`/`globalThis`
    - Pin `obsidian` to the exact version in the lockfile.

## Risks / Trade-offs

- **Stricter refusals.** Case-folded collisions, unlinkable companion sources, and dot-leading destinations may block names that previously converted. Every refusal fails closed with an actionable reason, is documented in the changelog, and the user resolves it outside Soundings.
- **Heading escapes.** They change the visible Markdown source of headings that contain those characters. Rendered text is unchanged.
- **Tag length limit.** The 256-character limit could refuse an exotic but valid file. This is acceptable for a fail-closed patch; the limit is documented in `docs/SUPPORTED_TRANSCRIPTS.md`.
- **Startup behavior.** Registering observation after layout-ready means files created while Obsidian was closed are not queued automatically. That matches the spec's "newly created while Obsidian is open" intent; a manual scan still finds them.

## Migration

- **Vaults:** none. Saved settings with wrong-typed fields are reset per field to safe defaults on load, and written back only on the next explicit settings save.
- **Release:** `0.2.2` is published through the existing attested workflow.

## Out of scope / owner actions

Enable branch protection on `main` and tag protection for `x.y.z` in GitHub settings. This is recommended by the security review and is a repository-owner action, not code.
