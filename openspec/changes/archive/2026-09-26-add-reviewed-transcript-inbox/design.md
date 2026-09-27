# Design

## Context

Manual scans enumerate current vault files through the public vault API and pass immutable discovery results to planning. Obsidian also exposes vault lifecycle events, but event timing can precede a file becoming stable or readable. The inbox must reuse discovery policy without bypassing reviewed planning or execution.

## Goals / Non-Goals

**Goals:**

- Observe new supported files only after explicit opt-in.
- Reuse one policy for manual and event-driven candidate validation.
- Keep queued state content-free, in memory, deduplicated, and lifecycle-owned.
- Replan every queued item immediately before review.

**Non-Goals:**

- Automatic conversion, monitoring while Obsidian is closed, or a durable job queue.
- Treating change/rename events as new transcript creation.
- Mobile acceptance or external-folder monitoring.

## Decisions

1. Add an observation settings group with `enabled` defaulting to false and validated vault-relative roots. Empty configured roots mean the whole otherwise-permitted vault; invalid roots disable observation rather than broaden it. A single watched folder was rejected because users may have several meeting locations.
2. Register Obsidian `create` events only while observation is enabled. The adapter converts the event into a candidate path and calls a shared single-path discovery function that enforces the same format, path, exclusion, size, read, and digest rules as full scans. Maintaining a second validator was rejected because policies would drift.
3. Queue `{path, format, size, contentIdentity}` in a map keyed by path and replace only when current identity changes. Transcript bytes are released after discovery. Persisting the inbox was rejected for the first version because it adds stale-state and privacy complexity; a manual scan remains the restart recovery path.
4. Coalesce notices while work arrives and expose one command to open the inbox. Opening it replans current files and removes entries that vanished or no longer qualify. The plan remains unselected. Automatically opening a modal was rejected as disruptive.
5. Use the existing run coordinator or a sibling lifecycle coordinator so unload and active conversion prevent parallel work. Event discovery failures remain isolated and content-free.

## Risks / Trade-offs

- [Files may be observed before their writer finishes] → Schedule a bounded cooperative retry based on unchanged path/identity, then report or defer without mutation.
- [Event storms can create repeated work] → Debounce per path and deduplicate by current source identity.
- [In-memory entries disappear on restart] → Document that the next manual scan recovers them; durable state is deferred.
- [Whole-vault observation may be noisy] → Keep the feature off by default and support explicit roots.

## Migration Plan

Add settings with a false default so existing installations remain unchanged. On disable or rollback, unregister events and clear the in-memory inbox; no vault cleanup is required. Desktop acceptance covers event timing and unload. Mobile remains explicitly deferred.
