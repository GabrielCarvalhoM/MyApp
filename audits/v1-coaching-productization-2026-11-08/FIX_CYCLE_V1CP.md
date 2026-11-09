# V1CP — the single bounded fix cycle on candidate fa3985b

**Scope.** The judges reviewed `fa3985b`. This cycle answers their records:
- `ssctr-impl/SSCTR_V1CP_IMPL.json`: NOT_READY, with -01 to -12.
- `quality/QRE_V1CP_IMPL.json`: NOT_READY, with -01 to -13 and 54 mutants.
- `security-impl/SEC_V1CP_IMPL.json`: FAILED, with -01 to -11.
- AF-01, an author-found defect, is the same defect as QRE-V1CP-02.

**Limits.**
- One cycle and one narrow recheck, under the bounded-cycle rule.
- Nothing is frozen or pushed.
- FREEZE-6 is untouched.

## Chief consolidations of SSCTR rulings (implementation reviewer, inside its authority)

These apply the reviewer's stated rule. No number or authority is added. The recheck verifies them.

**C-1. Chaining (SSCTR-V1CPI-01; C-Q05-2 as modified).** This applies to a report made while an episode is open.
- If the report is systemic, or local and overlapping, it supersedes the open episode.
  - The open episode ends from today. Its weeks keep their history.
  - The new report opens its own window at its own intent and coverage (B4).
  - Before the open episode's return started, the new window continues it: at most 14 continuous days (RC-06). Anything beyond that is asked.
- The same condition reported again, in a later plan week of the same chain, routes to the professional-assessment path.
- A local report that overlaps nothing open is asked (I-06).

**C-2. Race (SSCTR-V1CPI-05; I-17 as modified).**
- The return never crosses a race. A race inside the weeks the return needs is asked at the window-end check: move it or skip it.
- A race inside the window is asked, as before.
- During the wait for the check, the race also waits. It is kept and marked `waitsForCheck`, never dropped (QRE-V1CP-07).

**C-3. Early end (SSCTR-V1CPI-06).**
- A WELLBEING_CHECK with `improved: true` before the chosen end, from the window's third day, ends the window the day before. The window's days are then the days it lasted.
- Below 3 days the check is asked again later. Whether an early end may fall below the 3-day minimum is RC-16, for the Founder with PCG.

## Disposition of every finding

| Id | Severity | Disposition | Where / test |
|---|---|---|---|
| QRE-V1CP-01 | BLOCKING | FIXED: the A1 collocations are exactly Q01 (c). H20 is back to the approved question. | `r6-clinical.mjs` nonBodyUse; v1cp-block1 A1-1, v1cp-fixcycle QRE-V1CP-01 |
| QRE-V1CP-02 / AF-01 | BLOCKING | FIXED: ended markers carry `endedBy` and an empty hold. They open no episode and fix no later start. Both callers (readiness, declared break) are tested. | `endF08Marks`, `marksOf`, `fixedStartOf`; fixcycle QRE-V1CP-02 (M11) |
| SSCTR-V1CPI-01 | BLOCKING | FIXED by consolidation C-1 | `chainedReport`, `openWindow`; v1cp-f08 S1-10 |
| SEC-V1CPI-01 | HIGH | FIXED: the restart facts travel only under the `RESTART_FACTS` symbol. The intake fields `pause.readinessDeclared`, `pause.bySportDays` and `restart` are input errors. | `r6-intake.mjs`, `restartIntake`, `restartProgram`; fixcycle SEC-V1CPI-01/-02 |
| SEC-V1CPI-02 | HIGH | FIXED: a cause the athlete states is always screened. A declaration on record is read only when no cause is stated. | same |
| SEC-V1CPI-03 / QRE-V1CP-03 | HIGH / MAJOR | FIXED: a newly opened clinical hold appends a CLINICAL_HOLD record fact, with no reason text. `restartIntake` blocks on any hold after the latest declaration. | `withHoldFact`, `holdFact`; fixcycle SEC-V1CPI-03 |
| SEC-V1CPI-04 | MEDIUM | FIXED in the core: F08 rows are sealed (`rowHash`). They are read only when owned, causal, of their type's shape and intact; a check is read only with its episode. Real integrity needs server custody (pending, Security). | `readableF08`; fixcycle SEC-V1CPI-04 |
| SEC-V1CPI-05 | MEDIUM | FIXED: STRENGTH ready needs `restrictions` answered; `[]` means none. | `readReadiness`; fixcycle -05 |
| SEC-V1CPI-06 / QRE-V1CP-10 | MEDIUM / MINOR | NAMED BLOCKER: an erasure tombstone design is needed before any erasure path or real collection. Owners: Engineering and SSCTR; retention basis G07. | — |
| SEC-V1CPI-07 | LOW | FIXED: the screen's local day follows the program's clock. A declaration's screen comes after the latest unreleased hold fact. | `screenDayOf`; fixcycle -07 |
| SEC-V1CPI-08 | LOW | FIXED: unknown keys are never echoed. One `<group>.unrecognized` entry is returned. | `unrecognized`; fixcycle -08 |
| SEC-V1CPI-09 / QRE-V1CP-13 | LOW / MINOR | FIXED: the running restriction is asked. A sport not programmed is validated when sent. A named hold must be on record. A region is asked unless strength is affected. | fixcycle -09 |
| SEC-V1CPI-10 | LOW | FIXED: one event id is one fact. Weekly-review replays with a check are KEEP and add no row. | `replayOf`, `episodeWeekly`, `f08Guard`; fixcycle -10 |
| SEC-V1CPI-11 | LOW | FIXED in the core copy: no "clearance" or "clear" wording, even negated. Urgent wording stays with G04 and the Founder; the yes items are returned so the client can key it. | fixcycle -11 |
| QRE-V1CP-04 | MAJOR | FIXED: a report is new to a check by `provenance.firstRecordedAt`. | `f08Guard`; fixcycle QRE-V1CP-04 |
| QRE-V1CP-05 (M01) | MAJOR | FIXED: D49 continues past the ladder's exit. While the next week would add more than one set, it is one more held strength week (`d49Hold`). | fixcycle QRE-V1CP-05 |
| QRE-V1CP-06 | MAJOR | FIXED: the per-sport days come from the record, and a stated pause never shortens them. | fixcycle SEC-V1CPI-01/-02 |
| QRE-V1CP-07 | MAJOR | FIXED by C-2 | fixcycle QRE-V1CP-07 |
| QRE-V1CP-08 | MAJOR | FIXED: a plan made from the record reads the breaks declared by its creation day as the previous plan's history (C-Q08-3). | evaluate `carried`/`carriedAll`; fixcycle QRE-V1CP-08 |
| QRE-V1CP-09 | MAJOR | FIXED: tests kill M01, M07 (with logged loads), M11, M12, M26, M33, M37, M51 (S1-10) and M54. | v1cp-fixcycle |
| QRE-V1CP-11 | MINOR | CARRIED: the A2-amended R7-C assertions stay "not HOLD". A2 itself is accepted. | — |
| QRE-V1CP-12 | MINOR | FIXED: the differential hashes full results (see below). | evidence/differential.mjs |
| SSCTR-V1CPI-02 (I-14) | MAJOR | FIXED: fixed starts keep the held doses and take the execution facts (`lastPerformed`) from the current state, in composition and in the evidence reducer. | `withExecutionFacts`; fixcycle SSCTR-V1CPI-02 |
| SSCTR-V1CPI-03 (I-15) | MAJOR | FIXED: the window's rest, light-activity and waiting days right before a declared break are days without the sport. | `stopOf`; fixcycle -03 |
| SSCTR-V1CPI-04 | MAJOR | FIXED: a ladder week with no review of its own does not count as done, so the next step repeats. The projection still assumes execution between reviews, as the baseline does for every return. | `episodeWeekly`; fixcycle -04 |
| SSCTR-V1CPI-05 (I-17) | MAJOR | FIXED by C-2 | fixcycle QRE-V1CP-07 |
| SSCTR-V1CPI-06 | MAJOR (B6) | FIXED by C-3 from day 3. Below 3 days: Founder and PCG (RC-16). | fixcycle -06 |
| SSCTR-V1CPI-07 | MAJOR | FIXED: a race result still caps the first long run (Q04). The single-run ceiling is never below the stated typical run or the 15-minute minimum. | `initialRunState`, `initialCeiling`; fixcycle -07 |
| SSCTR-V1CPI-08 (I-09) | MINOR | CARRIED: the first-step hold is one fixed week, not counted in executed weeks. | — |
| SSCTR-V1CPI-09 (I-10) | MINOR | PARTLY FIXED: the reason no longer claims a hold on a region restart. The record's region stop is not added. | `readinessRestart` |
| SSCTR-V1CPI-10 | MINOR | FIXED: "me too", "eu também" and "yo también" in their own clause make the other clause's condition the athlete's own. | fixcycle -10 |
| SSCTR-V1CPI-11 | MINOR, pre-existing | ROUTED: the lexicon gaps "operou" and "my dog bit me" also exist in FREEZE-6. Lexicon data is the SSCTR's and PCG's (C-Q01-2). | — |
| SSCTR-V1CPI-12 | MINOR | FIXED: the regression in the ladder is tested (M33). | fixcycle M33/M37 |

## Executable evidence after the cycle

**Suite.** `node --test` in CoachingCore: 1080/1080. That is 1058 before the cycle plus 22 in `test/v1cp-fixcycle.test.mjs`.

**Differential against FREEZE-6.** Source: `evidence/DIFFERENTIAL_FIXCYCLE.json`.
- Summary: H2 300/300 identical. H1 has 13 of 130 steps differing, the Block 1 set already explained (H20 is now the approved Q01 question).
- Full results: H2 300/300 identical; generations 39/39 identical; H1 104/130 identical.
- Of the 26 H1 steps that differ in full, 13 are the Block 1 steps. The other 13 (H05 s2/s3/s5, H18 s1–s3, H19 s1–s3, H24 s1–s4) differ only by the CLINICAL_HOLD record rows of SEC-V1CPI-03. Their status, action and proposal are unchanged, and the next step's input hash covers the record. Source: `evidence/DIFFERENTIAL_FIXCYCLE_FULL_KEYS.txt`.

**Scenarios on the Founder's synthetic athlete.** Source: `evidence/F08_SCENARIOS.json`.
