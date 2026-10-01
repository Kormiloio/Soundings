# Spec Delta

## ADDED Requirements

### Requirement: Runtime audit and release staging fail closed
The runtime audit SHALL fail unless the production bundle's only external import is `obsidian`, and SHALL scan all runtime source for forbidden network, code-loading, destructive vault, storage-adapter write, and file-manager operations, permitting storage-adapter existence checks only at the vault adapter boundary. Release staging SHALL write only to `release/<manifest version>` inside the repository and SHALL refuse symbolic-link targets before removing anything. Host API type dependencies SHALL be pinned to exact versions.

#### Scenario: Runtime source adds a hidden network call
- **GIVEN** a change adds `requestUrl`, dynamic `import()`, `eval`, `new Function`, or computed `window` member access to runtime source
- **WHEN** the runtime audit runs
- **THEN** the audit fails and identifies the file and pattern without transcript or note content

#### Scenario: Runtime source adds a destructive vault call
- **GIVEN** a change adds `vault.process`, `vault.append`, `vault.modifyBinary`, an adapter write, or a file-manager trash call anywhere in runtime source
- **WHEN** the runtime audit runs
- **THEN** the audit fails

#### Scenario: Release staging targets another directory
- **GIVEN** release preparation is invoked with an output of `src`, `.git`, a path outside `release/`, or a symbolic link
- **WHEN** the script validates its output
- **THEN** it exits with an error before removing or writing any file
