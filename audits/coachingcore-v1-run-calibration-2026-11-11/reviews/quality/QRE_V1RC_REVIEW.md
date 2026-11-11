# QRE review of the V1 Run Calibration Extension candidate (V1RC)

**Verdict: NOT_READY** (QUALITY_BLOCKED). Six blocking findings, ten non-blocking ones. The authoritative record is `QRE_V1RC_REVIEW.json` beside this file.

- **Candidate:** frozen bytes of commit `bc40218`, reviewed as an extract with no git. No file of the extract was changed. Probes and mutated copies are in my own scratch folder (`qre-v1rc-judge-7f3a`).
- **Judge:** quality-reliability-engineer, an independent instance. I did not write the candidate.
- **Host context disclosure:** my session had the global `CLAUDE.md`, the project `CLAUDE.md` and the project `MEMORY.md` injected. They name earlier missions and earlier finding labels. I judged only from the extract's files and from what I ran.

## Baseline (measured)

| Check | Result |
|---|---|
| `node --test` (full suite) | 1311 of 1311 pass |
| `node --test` on the three v1rc test files | 52 of 52 pass |
| `node scripts/v1rc-journeys.mjs <scratch>` | 23 journeys; the plan and every decision match the frozen engine |
| `node scripts/v1rc-fuzz.mjs` | 250 timelines and 1500 calibrations; 0 internal errors; 0 timelines different from the frozen engine |
| `node scripts/v1rc-freeze.mjs --preserved` | 198 of 198 FREEZE-1 files byte-identical |

## What holds

- **The engine is untouched, with one exception.** I wrote my own differential client, separate from `v1rc-helpers` (`p1-diff.mjs`). It ran two seeds: 171 timelines, 1164 reviews and 171 restarts, covering holds with readiness declarations, breaks of 7 to 20 days, missed sessions, declarations and all four events. It found no difference from the frozen engine except R12.
- **Fail closed (records path).** Each of these turns the boundary off, in a fresh process each time: no records file, a malformed records file, records bound to another hash, a veto, a non-independent record, and altered values bytes. PACE, HR and ESTIMATE each stay off without CAPACITY.
- **Determinism.** The same inputs give the same `runCalibration.hash` under four host time zones and a Turkish locale, after a JSON round trip of every state and with reversed key order. Inputs are not mutated, and outputs are frozen.
- **Conformance.** I recomputed 17 athletes outside the worked examples from the decision's rule text. Bands, estimates and margins match to the second. The only differences are in reason precedence. Population limits of 27 and 75 minutes are inclusive.
- **Robustness.** Over 153 hostile runs there were no exceptions, no `CALIBRATION_ERROR` from plausible input, no NaN or Infinity, no inverted range and no prototype pollution.

## Blocking findings (each has a reproduction in the JSON)

1. **QRE-V1RC-01: R12 changes the engine's decision while the extension is DISABLED, and from unvalidated data.** The engine's `MOVE` becomes `KEEP` in four cases: with no enabling record, from a `RACE_RESULT` that names the session, from a declaration refused as future-dated, and from another athlete's tampered carried row.
   - Required: ask for the withhold only when the extension is on. The trigger must be a `FIELD_TEST` accepted into this athlete's record, naming a live QUALITY run session of the plan in force. Add negative tests.
2. **QRE-V1RC-02: evidence is appended under a review the engine refuses.** The row is stamped with that review's own `asOf`. A backdated or replayed review (engine `HOLD`: the reference clock is invalid) records a result "before the week started", and the week in force moves faster (threshold 340 → 310 s/km).
   - Required: record only under the instant the engine accepted, and keep `declaredAt` monotonic.
3. **QRE-V1RC-03: a mid-week correction (`supersedes`) removes the reference in force at once.** An older and faster result then takes over inside the week (half 6960–7860 → 6420–7740; half-marathon band 355 → 345).
   - Required: supersession applies to a week only when the correcting row is itself in force for that week.
4. **QRE-V1RC-04: `longestRecentRun` reads declared evidence without the recorded-before-the-week condition.** A heat-flagged 15 km declared on Wednesday opens the half-marathon estimate and band inside the week.
   - Required: apply `recordedOn < cutoff` (and the floor). Whether non-qualifying runs may show endurance goes to the SSCTR.
5. **QRE-V1RC-05: week 0 uses the intake day + 1, not its first day.** With intake on the start day, a declaration on day 0 calibrates week 0 inside week 0. Recency is also counted from intake + 1: a result 57 days before the start shows `CURRENT`/`HIGH`, with a `validUntil` before the week begins.
   - Required: the cutoff of week 0 is `startDate`.
6. **QRE-V1RC-06: R11 and withdrawal of zones.** A chest-strap maximum older than 112 days, dated before a break or a hold, is classified `OLDER_THAN_CAPACITY_WINDOW` before the floor is checked. Heart-rate zones therefore return after the return weeks (seen with 150-day and 200-day maxima).
   - Required: exclude evidence dated on or before the floor in `heartRateOf`, and add a test. Mutant M20 survives today.

## Non-blocking findings

- **QRE-V1RC-07:** one GPS distance glitch gives the EASY band a slow edge of 4500 s/km (75:00/km). There is no plausibility window on easy observations.
- **QRE-V1RC-08:** the boundaries are not independent. With CAPACITY alone, the 10 km-equivalent central time is shown. With PACE on and ESTIMATE off (R14), the race-pace bands carry the estimate's pace. Route to the SSCTR.
- **QRE-V1RC-09:** `options.runCalibration` (any unpinned values) and `options.runCalibrationRecords` enable the extension without the file. This is the same class of exposure as `eventExtension`/`eventRecords`. Condition: the integration passes no options (extend QRE-V1FC-05).
- **QRE-V1RC-10:** with the extension off, declared results, heart rate and lab values still accumulate in `runEvidenceRecord`. Route to Security for storage.
- **QRE-V1RC-11:** future-dated intake anchors are accepted and become the reference once their date passes.
- **QRE-V1RC-12:** a declaration whose id collides with an intake anchor (`intake-0`) or a plan race is reported `added`, stored and never read.
- **QRE-V1RC-13:** non-object rows of the carried record are dropped from the returned record (4 → 1). The record is append-only and should be carried unchanged.
- **QRE-V1RC-14:** the contract omits keys, statuses and reasons that the runtime emits. It also claims "off = frozen behaviour" (see 01 and 10).
- **QRE-V1RC-15:** 150,000 anchors give `CALIBRATION_ERROR` because of argument spreading. The engine stays intact; the input is implausible.
- **QRE-V1RC-16:** test adequacy. Surviving mutants are listed below. Each needs a directed test in the fix cycle.

## Surviving mutants

32 targeted mutants ran against the directed tests: 20 were killed and 12 survived.

| Mutant | What it changes | Notes |
|---|---|---|
| M02 | late session reports ignore `recordedOn` | untested |
| M03 | evidence `recordedOn` check dropped | the only guard on the path in QRE-V1RC-02 |
| M06 | hold day not used as a floor | masked by the release floor and the mode floor |
| M11 | upward 4.5% cap removed | behaviour verified correct, but untested |
| M12 | session rows of another athlete read | masked: the engine drops foreign rows |
| M15 | break withdrawal at 15 days instead of 14 | masked: the engine's RETURN weeks |
| M20 | heart-rate maximum read from before a withdrawal | see QRE-V1RC-06 |
| M23 | supersession disabled | the existing test passes through the conflict rule |
| M27 | 56-day window becomes 60 | the boundary is not pinned |
| M29 | a downward step does not slow the half or marathon estimate | R3 untested |
| M31 | withhold `MOVE` asked on every review | the engine's decision changes unseen |
| M32 | longest run ignores `recordedOn` for log rows | untested |

## Not verified

- **Scope:** this verdict covers `bc40218` only. When I wrote these reports, the live worktree held uncommitted changes from another session to the candidate's source, values, flow test and contract, plus a new `test/v1rc-review-fixes.test.mjs`. I did not review them and left them untouched.

- `v1rc-freeze.mjs --write/--check` were not executed, because the extract has no git. They were read and reasoned about only.
- The R12 "other session targeted" path: the engine kept the session in my attempt, so it is not demonstrated.
- No real athlete data, device or UI.
- Sporting value is the SSCTR's to judge (doubts are routed in the JSON).
