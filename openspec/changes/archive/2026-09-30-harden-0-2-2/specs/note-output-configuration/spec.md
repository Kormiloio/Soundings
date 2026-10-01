# Spec Delta

## ADDED Requirements

### Requirement: Saved settings are type-validated
Soundings SHALL validate the runtime type of every saved setting when loading. A field with the wrong type SHALL fall back to its safe default with a content-free warning, mandatory exclusions SHALL always be applied, and a malformed settings file SHALL NOT prevent the plugin from loading or enable any disabled capability.

#### Scenario: Boolean setting is saved as a string
- **GIVEN** the saved settings contain `observationEnabled: "false"`
- **WHEN** Soundings loads its settings
- **THEN** transcript observation remains disabled

#### Scenario: List setting has the wrong type
- **GIVEN** the saved settings contain a non-array `excludedPaths` or non-string entries in `enabledFormats` or `observationRoots`
- **WHEN** Soundings loads
- **THEN** the plugin loads with the safe default for each invalid field and mandatory exclusions applied
- **AND** no file is changed until the user explicitly saves settings
