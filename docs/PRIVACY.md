# Privacy and data handling

Soundings processes transcript files locally through Obsidian's public vault APIs. It makes no network requests, collects no telemetry, requires no credentials, and does not access files outside the active vault.

Manual scans enumerate vault paths so Soundings can find nested `.txt` and `.vtt` candidates. Content is read only after enabled-format, mandatory configuration-folder, hidden-folder, Soundings-state, user-exclusion, and size checks pass. Diagnostics and user-facing results contain paths and outcome metadata, never transcript or generated-note bodies.

Optional transcript observation is disabled by default and runs only while Obsidian and Soundings are open. It listens for newly created vault files, applies the same safety policy as manual discovery, and retains only vault-relative paths, formats, byte lengths, and content hashes in memory. Inbox state and transcript bodies are not persisted. Disabling observation, disabling the plugin, or unloading Obsidian cancels pending work and clears the inbox.

Observation never converts automatically. The user must open **Soundings: Review transcript inbox**, review the current plan with zero items selected, explicitly select eligible files, and start conversion. Existing Markdown destinations and all source transcripts remain protected by the same create-only executor.
