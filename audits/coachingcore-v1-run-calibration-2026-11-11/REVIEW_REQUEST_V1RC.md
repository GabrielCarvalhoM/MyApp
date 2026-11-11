# V1 Run Calibration Extension: request for the independent review of the candidate (V1RC)

**Mission:** CoachingCore V1 Run Calibration Extension (Founder request of 2026-11-11). Branch `claude/coachingcore-v1-run-calibration`, from `981a8f6` (COACHINGCORE-V1-FREEZE-1).
**Candidate:** the commit named in your dispatch. Review an extract of that commit, never the live worktree.
**Rounds:** this one concentrated review, then at most one directed fix cycle and its recheck. Report everything now.

## What the candidate is

An additive overlay beside the frozen V1 engine. It answers at what intensity and, when the evidence supports it, at what pace a run is done, and gives a current race estimate as a range.

| File | Role |
|---|---|
| `CoachingCore/src/v1-run-calibration.mjs` | Evidence, reference selection, bands, estimates, heart rate, assessment, the week-by-week fold |
| `CoachingCore/src/v1-run-index.mjs` | Entry point: the frozen `v1-index.mjs` results unchanged, plus `runCalibration` and `runEvidenceRecord` |
| `CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json` | The sporting values, pinned by hash |
| `CoachingCore/test/v1rc-*.test.mjs`, `test/v1rc-helpers.mjs` | Directed tests and the timeline that mirrors every review on the frozen entry point |
| `CoachingCore/scripts/v1rc-journeys.mjs` | 23 synthetic journeys; output in `evidence/JOURNEYS_V1RC.txt` |
| `CoachingCore/scripts/v1rc-freeze.mjs` | Additive freeze record and the check that FREEZE-1 is preserved |
| `ssctr-decision/SSCTR_V1RC_DECISION.json` | The sporting decision the values come from (a different SSCTR instance) |
| `RUN_CALIBRATION_CONTRACT_V1RC.md` | The data contract |

No file bound by COACHINGCORE-V1-FREEZE-1 is changed (198 of 198 byte-identical). The custody and API boundary does not use the new entry point.

## Claims to test

1. **The engine is untouched.** Every plan, decision, proposal and record is what `v1-index.mjs` returns. With no enabling record the calibration is `DISABLED`.
2. **The values are the decision's.** The values file restates SSCTR-V1RC-DECISION-r1; the runtime reproduces its five worked examples to the second.
3. **Fail closed.** Each boundary needs an independent record bound to the pinned bytes.
4. **Weekly stability.** A week reads only what was on the record before it started.
5. **Withdrawal.** A hold, a break of 14 days or more, or a walk/jog, restart or return week removes every band, estimate and zone.
6. **Standing rules kept.** No pace from a goal; nothing harder from easy pace; no threshold claim; no future projection.
7. **Never throws.** Malformed input returns the engine's own answer.

## Readings the implementer made where the decision left room

Judge each one; they are the likeliest place for a finding.

| # | Reading | Where |
|---|---|---|
| R1 | Two reference tracks: a STANDARD one (results up to the half marathon) carries the curve and every estimate up to the half; the marathon estimate takes the most recent of the STANDARD reference (when it is a half marathon) and the reference among longer results | `selectReference`, `estimateOf` |
| R2 | The deadband holds the reference in force while it stays CURRENT; when it ages out, the newer result takes over as a new reference (training steps reset then) | `selectReference` (`heldId`) |
| R3 | A training step applies to band speeds as a factor. A downward step on the half or marathon also slows that estimate; the band is not slowed twice | `bandsOf`, `shownEstimates` |
| R4 | "Two consecutive sessions" are the last two executions of the domain since that band last changed, each compared with the band of its own week | `fold` |
| R5 | A week also needs the evidence to have been *recorded* before it started, so a late report counts from the next week | `inForce`, `classify` |
| R6 | A week the plan ran in walk/jog, restart or return mode ends earlier evidence, like a long break | `fold` (`modeFloor`) |
| R7 | With a reference, the EASY band's fast edge is the slower of the derived ceiling and the observed median; LONG and RECOVERY take nothing from it, so EASY can show a slower ceiling than LONG | `bandsOf` |
| R8 | The longest recent run counts executed runs, results on record and the intake's figure while that recent | `longestRecentRun` |
| R9 | The marathon block itself is the eligibility: an estimate only when the plan in force is planned for the marathon as an event | `estimateOf` |
| R10 | Supplied lab values are `{protocol, source, values: [{name, value, unit}]}`; without all of them nothing is shown | `heartRateOf` |
| R11 | The heart-rate maximum is not read from evidence dated before a break, hold or return | `heartRateOf` |
| R12 | When the session a test replaced is reported not done, the entry point asks the engine to withhold the move of that session (the engine's own `withhold` option) | `v1-run-index.mjs` |
| R13 | A conflict takes the slower result even when it is the lower-quality one, which can leave no capacity at all (journey 18) | `selectReference` |
| R14 | Race-pace bands are available with the pace boundary on even when the estimate boundary is off | `bandsOf` |

## How to run

In an extract of the candidate commit (copy `CoachingCore/node_modules` from the worktree first; one schema test needs `ajv`):

- `node --test test/v1rc-calibration.test.mjs test/v1rc-flow.test.mjs test/v1rc-limitation-c.test.mjs`
- `node --test` (full suite)
- `node scripts/v1rc-journeys.mjs <a scratch directory>`
- `node scripts/v1rc-fuzz.mjs` (seeded; internal errors and differences from the frozen engine must be zero)
- `node scripts/v1rc-freeze.mjs --preserved`

Never run `npm run verify` or any `verify-r*` script. No recursive deletion.

## Limitation C (secondary)

No runtime change. `test/v1rc-limitation-c.test.mjs` states what the frozen engine already does with `SYSTEMIC_FATIGUE` and `LOCAL_FATIGUE`. The decision's Q11 opinion is ACCEPTABLE_WITH_CONDITIONS, including a repetition limit that routes to the persistent-symptom path and delivery as an offer. Those need a new rule and custody work, so nothing is wired here; the recommendation is to keep C as it is.
