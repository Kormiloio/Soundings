# Tasks

## 1. Parser compatibility enhancements
- [x] 1.1 Update VTT timestamp regex to support optional hours (`mm:ss.sss` and `hh:mm:ss.sss`)
- [x] 1.2 Update VTT parser to support unclosed voice tags and multiple voice lines per cue
- [x] 1.3 Add adversarial VTT tests for these new cases and verify correct parsing

## 2. Discovery-phase parsing
- [x] 2.1 Integrate `parseTranscript` into the planning/classification loop
- [x] 2.2 Update classification logic to map parsing failures to `unreadable` and unsupported VTT structures to `unsupported`
- [x] 2.3 Verify that the review plan accurately reflects eligibility before conversion is attempted

## 3. Verification and regression
- [x] 3.1 Run the full unit/integration/golden suite to ensure no regressions in existing formats
- [x] 3.2 Verify the 5,000-file rehearsal still produces zero source mutations
- [x] 3.3 Record verification evidence in `docs/VERIFICATION.md`
