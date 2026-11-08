# R7-D Phase 5: quality and reliability review of the candidate

**Record:** `QRE-R7D-PHASE5-REVIEW-r1`, 2026-11-08. The full evidence is in `QUALITY_PHASE5_REVIEW_R7D.json` beside this file, and the probes and their outputs are in `probes/`.

**Judge:** a fresh instance of the Quality & Reliability Engineer. It did not write the runtime, the harness or the instruments. It will not author or judge the coming holdout, and it did not read the SSCTR review.

**What was judged:** candidate `c7c72e5` (`c7c72e52c741…`), against R7D-FREEZE-5 (`cc0b56f`).

## Verdict: READY_WITH_CONDITIONS

There are no blocking findings, but two conditions bind the freeze (below).

- **The three runtime corrections are correct and causal on the paths their tests pin, and no regression was found.**
  - The suite passes 1014/1014.
  - On R7D-FREEZE-5, exactly T42–T45 fail, each for the right reason.
  - The three conformance checks pass.
  - The differential reproduces byte for byte: 8 cases differ, each explained.
  - The probes for retroactive, late, missed and partial weeks, named corrections, answers and re-sends behave as described.
- **The mutation evidence holds.**
  - All 10 runtime mutants are killed.
  - QF3, QF7 and QF6 are each killed by its own test among T39–T41, and QF0 by all three.
- **K03 removes only the proven false FAILs.**
  - Validation 9 reproduces exactly: no false block, the four instrument-fix rows, reachability, coverage and 60/60 witnesses.
  - 12 of the 28 sensitivity rows were reproduced, including every row read by P03, P06 or the carriers.
  - No Phase 4 result changes.

## Findings

None of them blocks.

- **QRE-P5-F01: TEST_GAP, MAJOR.** No test pins that a missed or unreported entry week keeps the `returnEntry` marker.
  - Mutant J3 ends the marker after any planned strength week. It passes all 1014 tests.
  - J3 brings SSCTR-P4-F01 back: the F13 athlete gets week 9 at 2x10@3 instead of the entry dose.
  - The candidate itself behaves correctly (probes P1 and P2).
  - It is carried to the next candidate (K-P5-1), in the same way as QRE-P4-K04.
- **QRE-P5-F02: a domain question routed to SSCTR.** It extends disclosure 2.
  - The marker covers the first week back only.
  - In a partial entry week, some exercises are never executed (P8): the session was skipped. Others are executed without a usable load (P9: W-D49-A's own loaded rows). After that week, these exercises take a first establishment at 2 sets @RIR3, not the entry dose or the D49 steps.
  - These are the same doses as R7D-FREEZE-5.
  - T43's week-5 bound does not tell the two paths apart.
  - With loads logged (P10), the correction works fully.
- **QRE-P5-F03: HARNESS_GAP, MINOR.** The P06 twin drops a same-day reported session without listing it, when later runs of that week remain. This happened 0 times in DEV-9.
- **QRE-P5-F04: TEST_GAP, MINOR.**
  - Mutant J1 survives: a SHORT return that sets the marker.
  - T46's title promises a restart-recipe control that its body does not contain.
  - The other survivors are equivalent.
- **QRE-P5-F05: trivial.**
  - The witness id W-P06b is used twice.
  - H01 also makes P03(d) stricter.

## Conditions for the freeze

- **K-P5-F1:** the SSCTR ruling on disclosure 2 must explicitly cover the P8 and P9 paths.
  - If SSCTR rules them outside D49/D55, this verdict lapses and QRE-P5-F02 becomes blocking.
  - No narrow change exists in that case. The one-line form has two side effects: it would keep repeating the entry dose, and keep rotation suppressed, for any loaded row never logged with a load.
- **K-P5-F2:** the freeze binds this folder as left, and nothing under src, test, harness, author or PREREG-8 changes after `c7c72e5`. The freeze script already enforces both.

## Other conditions

- **K-P5-1:** carried tests for the missed and late entry week (they kill J3), for a SHORT return (kills J1), and the T46 control.
- **K-P5-2:** the holdout's quality judge accounts for the P06 units that are dropped without being listed.
- **K-P5-3:** the holdout judges read the P8 and P9 shapes as SSCTR rules.

## Disclosure rulings

| Disclosure | Ruling | Why |
|---|---|---|
| 4 | Accepted | The question fires only inside the existing trigger. It is answerable and is not asked again after an answer (P4a, P4b, T46). An unanswered question persists. It never fires with no run left to plan |
| 5 | Accepted | The old assertion encoded the defect; the new one is stricter |
| 6 | Inside K03 | It is the same proven predicate. The trigger is a development case, and no Phase 4 result changes |
| 7 | Accepted | Both carrier sensitivity rows were reproduced under HARNESS-9, and the replacement witnesses fire |
| 8 | Accepted | Product-level rules only, with no runtime output. Every registered coverage item is reachable without runtime output; reachability was reproduced |

## Not done

- The K03 reading of the Phase 4 units F07, F21 and F12 was not re-run, because `final/` cases are not re-graded. DEV-63, DEV-64 and DEV-65 reproduce the same mechanisms.
- 16 of the 28 sensitivity rows are taken from the record. They rest on properties that HARNESS-9 does not change.
