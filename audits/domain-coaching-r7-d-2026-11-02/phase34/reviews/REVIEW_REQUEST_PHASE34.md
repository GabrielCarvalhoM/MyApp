# R7-D Phase 3.4: request for the fresh SSCTR recheck and the narrow quality/reliability check

## The candidate

Branch `claude/domain-coaching-r7-d`, commit **`1978cc4`**.
- **Runtime bytes:** those of `7cadcd8`. `CoachingCore/src/r6-adaptation.mjs` has sha256 `1163e105…` and `CoachingCore/src/r6-composition.mjs` has `8aa5f950…`. Every other source file equals R7D-FREEZE-4.
- **Delta from R7D-FREEZE-4** (reviewed runtime `3228a70`, bound files `b242237`):
  - `r6-adaptation.mjs` +169/−45;
  - `r6-composition.mjs` +6/−1.

  See `git diff 3228a70 1978cc4 -- CoachingCore/src`.
- **New test file:** `CoachingCore/test/r7d-phase34.test.mjs`, 31 tests.
- **Existing assertions updated**, each marked "R7-D Phase 3.4": four in `r7d-phase33.test.mjs` (T4 ×3 and T5) and one characterization in `r7d-phase32.test.mjs` (T5).
- No policy, catalog, record, queue, `product/` or `canon/` byte changed.

## Authority

- **The Founder's Phase 3.4 decision** (`../AUTHORIZATION_PHASE34.md`): direction A for SSCTR-P33-F01, the re-entry week contract (QE-R7D-P33-01), and F08 with a benchmark and the clinical boundary.
- **`../policy/SSCTR_P34_DECISION_R7D.json`** (SSCTR-R7D-P34-DECISION-r1, ACCEPT_WITH_CONDITIONS):
  - direction A as variant γ;
  - binding readings BR-Q1 to BR-Q6;
  - conditions CF-P34-01 to CF-P34-11;
  - findings F01 to F05.
- **`../policy/PCG_F08_AUTHORITY_R7D.json`** (PCG-R7D-F08-r1): F08 is BLOCKED_BY_AUTHORITY (F08-BLOCK-G04); R-F08-1 is required; conditions PCG-F08-C01 to C10.
- **CF-P34-08 requires a fresh SSCTR instance:** the instance that wrote the decision record never judges its implementation.

**One bounded cycle.** At most one narrow, runtime-only correction cycle follows these checks. A blocker that cycle does not close means no freeze: the phase closes with that blocker named.

## The rule as implemented (`r6-adaptation.mjs`, `r6-composition.mjs`)

| Part | What the runtime does | Binds |
|---|---|---|
| Trigger | Between two separate unapplied breaks, a plan week wholly between them, executed completely in at least one sport | BR-Q1, γ |
| Re-entry week contract | Counted: gated runs (EASY, LONG, QUALITY, WALK_JOG); the race touch and the race, finished and not adverse or conflicting; every strength exercise with reps, RIR and a known-unit load. Optional WALK, RECOVERY_EASY, SHAKEOUT and strides never count. A session on the later break's first day counts when the break states `startedAt` and the session was observed before it (the history cut) | BR-Q4, BR-Q5; QE-R7D-P33-01/-02 |
| Own return | **One sport complete:** the earlier break becomes `OWN_RETURN`:<br>• its own class (`returnClass`), the unchanged R6 recipe (`returnEntry`, a pure refactor), no demonstration;<br>• reconstructed the day after it ended (`ownReturnOf`);<br>• per-sport merge (`stateForStop`): the re-entered sport reads executed history, the other continues from that return;<br>• the later break is classed by its own days.<br>**Every sport complete:** `TRAINING_AFTER`, unchanged.<br>**None complete:** continuity (`TRAINING_NOT_REESTABLISHED` / `NO_TRAINING_BETWEEN`), unchanged.<br>**An applied return between the breaks:** no own return (the guard) | BR-Q1.4, BR-Q3; QE-R7D-P33-03 |
| Record | In `separateBreaks`:<br>• `OWN_RETURN` with `ownReturn {class, days, startDate, endDate, returnDay, reentered:{RUN, STRENGTH}}`;<br>• `WITHIN_OWN_RETURN` with `ownReturnOf` and `stopInOwnReturn` | CF-P34-05 |
| Corrections and late evidence | A named correction of the latest break re-reads the separate breaks its return recorded (`recordedStop`). `staleReturn` rebuilds an own-return return from its record, and genuine late evidence is still asked (I6) | CF-P34-02 (SSCTR-P34-F02), CF-P34-04 |
| Ceiling | `composeWeeks` no longer counts the return week's elapsed, unexecuted runs in the single-run ceiling. It uses `beforeReturn`, as `conditionalNext` C3/C5 already did | CF-P34-03 (SSCTR-P34-F01) |
| R-F08-1 | A clinical-cause report keeps its episode clinical: a restated nonclinical reason never ends CLINICAL_HUMAN_REQUIRED. This is carried by a symbol on a shallow copy of the review. The conformance anchor `const clinical=clinicalRoute(kind,review);` is byte-identical | PCG-R7D-F08-r1, PCG-F08-C02/C03 |
| Unchanged | Doses, percentages, ceilings, thresholds, increments, cadences and recipes; clinical first; eligibility; F08 (no clearance input, no S5/S6); every conformance anchor (R7-B, R7-B.1 and R7-B.2 PASS) | CF-P34-09, CF-P34-10 |

**Your own probes on the candidate.** `../policy/ssctr-probes/p34-ssctr.mjs` and `p34-ceiling.mjs` were rerun on a scratch copy of the candidate (Chief, not committed). The results:
- W1–W4 equal PROTO-γ-raceKeys;
- S1/S2 equal PROTO-γ-sameDay;
- R2, L1, L1k, R1k, R2k and C3 are identical;
- R1 and R1b are lower than PROTO-γ by the ceiling fix and now equal the episode rule;
- G1–G4 give equal doses;
- C1 and C2 keep the earlier break after the correction.

## Before and after (`../probes/p34-witness.mjs`, outputs in `../probes/out/`)

| Case | R7D-FREEZE-4 | Candidate |
|---|---|---|
| **P1, the Founder's case:** 14-day holiday; two weeks with every run done and the Friday strength missed; a 4-day trip | LONG 32, RESTART, running 15/20/20/20 | SHORT 4 (the trip). Holiday `OWN_RETURN` MODERATE/14, RUN re-entered 11-30. Running EASY: LONG 75, EASY 50/41, LONG 65 (= E1, two complete weeks). Strength steps nothing (ESTABLISH/FROM_LOG) |
| P2: the Tuesday easy run missed each week, strength complete | LONG 32, RESTART | SHORT 4, STRENGTH re-entered. Running RETURN from the holiday's return: 20/30/30/45. Strength at its executed doses: 2x8@85 |
| P3: three weeks, the Friday strength missed | LONG 39, RESTART | SHORT 4, RUN re-entered |
| P4: one week (runs done, Friday strength missed); P5: one week in full without RIR | MODERATE 25 | SHORT 4, RUN re-entered |
| P6: the late form | LONG 34, RESTART | SHORT 4, RUN re-entered |
| C2: the trip corrected (+1 day) after P1's return | SHORT 5 with the holiday dropped; strength at pre-break doses (2x8@85) | SHORT 5 with the holiday `OWN_RETURN` kept; strength ESTABLISH |
| C3: F1 (one isolated run), its return, then the trip corrected | SHORT 5 with the holiday dropped; pre-break doses (THRESHOLD 41, LONG 70) | MODERATE 22 through the holiday; 15/20/30/30/45 |
| Controls (F1 isolated run, X1, X2 both partial, E1, V4 weekly reviews, K3 applied when stated, CL clinical) | — | Unchanged on both runtimes |

## Directed tests (`r7d-phase34.test.mjs`, 31/31; 22 fail on R7D-FREEZE-4, the 9 characterization tests pass there)

| Shape (Founder §5; CF-P34-06) | Test |
|---|---|
| The mandatory case (X5 = V1) | T1, against E1 |
| Per sport, both directions (V2, X3) | T2 ×2 |
| Strength without RIR (X4) | T3 |
| Isolated sessions; X1; X2 (the residual) | T4 ×2 (characterization) |
| An adverse run (C4) | T5 |
| Unreported sessions between | T6 |
| The late form (V5); timely forms (V4, K) unchanged | T7 |
| Three breaks with recursion (X8) | T8 |
| Clinical first (X7) | T9 (characterization) |
| No spurious question after an own return; C1/C2 corrections; a replay | T10 ×2 |
| Record, append-only, determinism, declaration order | T11 (characterization) |
| R-F08-1, the PCG P1/P3/P4 and T5 shapes; control | T12 ×3 (the control is characterization) |
| Late evidence I6 | T13 |
| Race weeks W1–W3; optional walks (QH-1) | T14 ×2 (walks: characterization) |
| S1/S2 | T15 |
| The ceiling: G1, G2, G4; R1 bound | T16 |
| R1, R1b and R2 against the episode rule | T17 ×2 |
| E4, V3, W4; X6 (systemic adverse holds both) | T18 ×2 (X6: characterization) |
| A run-only and a strength-only plan; each sport re-entering in a different week | T19 ×2 (plans: characterization) |
| The applied-return guard; L1 (O-01); C3 (O-02); the G3 ceiling | T20 ×2 (guard, L1, C3: characterization) |
| CF-P34-02: the corrected return equals the fresh re-read (one day longer, touching, overlapping); a week moved out; a week moved in | T21 |

## Existing assertions updated (please judge)

- `r7d-phase33.test.mjs` T4, "a session missed or partial":
  - the missed Friday strength now gives `OWN_RETURN` SHORT 4, RUN re-entered, running EASY;
  - the missed long run or partial run gives `OWN_RETURN` with STRENGTH re-entered and running RETURN.

  Under Phase 3.3 the stop ran through.
- `r7d-phase33.test.mjs` T4, "unreported sessions": answered not done, the class is SHORT with `OWN_RETURN` (it was MODERATE, continuity).
- `r7d-phase33.test.mjs` T4, "a conflicted report": corrected to not done, the class is SHORT with `OWN_RETURN`.
- `r7d-phase33.test.mjs` T5, "adverse response": `OWN_RETURN`, STRENGTH re-entered, running RETURN (it was continuity).
- `r7d-phase32.test.mjs` T5, characterization: a clinical-cause kept break restated by name now stays CLINICAL_HUMAN_REQUIRED, with no proposal, 0 returns, and both declarations kept (INJURY, VACATION). Before, the restatement corrected its cause: that is PCG-F08-C03(c).

Each as it stood at R7D-FREEZE-4 fails on the candidate, and each as updated fails on R7D-FREEZE-4 (evidence `red`).

## Instruments (registered before any holdout exists)

| Instrument | What changed |
|---|---|
| `../../harness/` R7D-HARNESS-6 (README section) | P18(a): the counted sessions and the own-return accounting. P18(c) (new): the inverse detector, a sufficient reading over both continuity labels. P18(d) (new): the correction. P02: R-F08-1. P06(b) (new): the own-week ceiling. P08: a run done before the stated `startedAt` counts as before the break. Development cases DEV-32 to DEV-45, including the CF-P34-05 false-block controls DEV-42 to DEV-45. Default record R7D-FREEZE-5 |
| `../../PREREGISTRATION_R7D_6.md` | Δ1–Δ13, in Portuguese |
| `../../author/INTERFACE_DELTA_R7D_6.md` | The per-sport rule, the record, later decisions, R-F08-1, what a client does |
| `../../author/AUTHOR_BRIEF_FINAL_R7D_5.md` | Freeze 5, interface 6, coverage items 9, 11 to 13 |

**Found after the first validation 6, before this request** (instrument only):
- P08 blocked the BR-Q5 reading (DEV-44);
- P18(c) could not qualify a strength week with bodyweight rows (DEV-35 was undetected);
- the differential attributed DEV-44/45 to CEILING (the SAME_DAY trigger read only the return record).

All three are corrected, and `../probes/phase34-decomposition.mjs` was added: a hybrid runtime separates the two source changes.

## Evidence on these bytes (`../evidence/EVIDENCE_PHASE34.json`, PASS)

- **Tests:**
  - suite 983/983;
  - directed: Phase 3.4 31/31, Phase 3.3 14/14, Phase 3.2 17/17, Phase 3.1 14/14;
  - conformance R7-B, R7-B.1 and R7-B.2 PASS.
- **Mutation** (`MUTATION_PHASE34.json`): 13/13 killed, each by its own witness test.
- **Harness validation 6** (`../../harness/validation/HARNESS_VALIDATION_R7D_6.json`, superseded runtimes rebuilt into new scratch directories):
  - no false block on 47 development cases;
  - 19/19 sensitivity rows, each new row on R7D-FREEZE-4 and clean on the candidate:
    - P33-F01 by P18(c) (DEV-31/34/35/43);
    - F02 by P18(d) (DEV-37/38);
    - PCG-R7D-F08-F01 by P02 (DEV-39/40);
    - P34-F01 by P06(b) (DEV-41);
    - the race keys by P18(a) (DEV-42);
  - coverage: P17 147, P18 65;
  - 50/50 witnesses.
- **Regressions** (`../regression/`), regression only:
  - the diagnostic corpus has 0 property violations, with VARIANT only on the 4 triaged cases;
  - the generated sample has 0.
- **Differential against R7D-FREEZE-4** (`DIFFERENTIAL_VS_R7D_FREEZE_4.json`): 165 cases, 148 identical, 17 differing, 0 unexplained.
- **Decomposition** (`DECOMPOSITION_VS_R7D_FREEZE_4.json`):
  - 6 cases changed by the ceiling fix alone: DEV-17, -17b, -22, -24, -29 and -41. None raises a planned dose (Chief scratch check);
  - 11 changed by the adaptation change alone;
  - none changed by both.

## Questions

**SSCTR (fresh instance, narrow). Judge only the implementation against SSCTR-R7D-P34-DECISION-r1:**
1. **Fidelity:** does the runtime implement BR-Q1 to BR-Q6 and γ exactly, with no P34_* switch, ANY or M path (CF-P34-01)? Your probes on the candidate are summarized above. Rerun them if you want.
2. **CF-P34-02, CF-P34-03 and CF-P34-04:** are the correction re-read (T10, T21), the ceiling (T16, T20, G1–G4, R1 against the episode rule) and the late-evidence rebuild (T10, T13) correct from the domain side?
3. **CF-P34-05 and CF-P34-06:** do the instruments and the directed tests cover what you required? Any shape missing?
4. **Disclosures (CF-P34-07):** are SSCTR-P34-F03 (X2, trigger coupling), F04, O-01, the QE-R7D-P33-03 guard and O-02 disclosed without envelope in PREREG-6 Δ9–Δ11 and INTERFACE-6? Do the consumer conditions say what you asked?
5. **The five updated assertions,** from the domain side.
6. **R-F08-1** (PCG-F08-C03(e)): from the domain side only, does a clinical-cause episode stay clinical on every path, with the nonclinical control unaffected? F08 itself stays BLOCKED_BY_AUTHORITY: do not decide it.
7. **New numbers:** does anything in this candidate add a dose, threshold, count, length, percentage, ceiling, increment, tolerance, cadence, recipe or clinical criterion (CF-P34-09)? If it does, that is a blocker.
8. **The queue:** `HQ-R7D-SSCTR-P33-RECHECK` (your Phase 3.3 predecessor's proposal) will be appended naming R7D-FREEZE-4, the freeze its record judged, with its content unchanged (234 → 235). The Phase 3.4 proposals stay proposed (CF-P34-11). Any domain objection?

**Quality/reliability (narrow). Judge only:**
- **Correctness:**
  - `reentryBetween`, `ownReturnOf`, `stateForStop`, `recordedStop` and `stopOf`;
  - the guard `appliedBetween`;
  - the `returnEntry`/`returnClass` refactor (behaviour-preserving?);
  - the `staleReturn` rebuild;
  - the `EPISODE_CLINICAL` symbol path in `clinicalRoute`;
  - the `composeWeeks` ceiling change.
- **Edge cases:**
  - three or more breaks (`WITHIN_OWN_RETURN`);
  - a sport with no counted session in a week;
  - SKIPPED sessions, late or conflicted reports, `startedAt` without observed times;
  - run-only and strength-only plans;
  - corrections that touch, overlap or move weeks;
  - replays.
- **Determinism and append-only:** the record and provenance; event separation.
- **Containment:**
  - can anything outside the six triggers change?
  - are the differential and its decomposition sound?
  - is the hybrid a fair separation?
- **The harness revision:**
  - is P18(a) again a sound necessary condition, and P18(c) a sound sufficient one?
  - is the P08 alignment correct, or does it weaken the oracle?
  - are DEV-42 to DEV-45 and the witnesses adequate?
  - could any check block a correct holdout?
- **Adequacy:** tests, properties and mutation; the five updated assertions.
- **Freeze readiness:** `CoachingCore/scripts/freeze-r7d-5.mjs`, `verify-r7d-5.mjs` and `../integrate-queue-r7d-p33.mjs`, none run yet; and that no script of this phase deletes anything.

## Independence and outputs

- Neither of you wrote the runtime, the tests, the harness, PREREG-6 or the evidence. Do not open the other review's folder.
- Write only in your own folder:
  - SSCTR: `ssctr/SSCTR_PHASE34_RECHECK_R7D.{json,md}` and `ssctr/probes/` (outputs in `ssctr/probes/out/`);
  - quality/reliability: `engineering/QUALITY_CHECK_R7D_PHASE34.{json,md}` and `engineering/probes/` (outputs in `engineering/probes/out/`).
- **Scratch work:** run probes only on copies outside the repository, each in a new, uniquely named directory you create under the session scratchpad. **Never delete anything** (no `rm -rf`, no recursive removal). When you need a fresh copy, make a new directory.
  - Rebuilt runtimes you may copy (read-only; never write into it) are in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/664cd42f-94db-4235-9512-4d8817799bb1/scratchpad/p34-ev-20261107-102113-12324/`:
    - `rt-d4` is R7D-FREEZE-4 (`git archive 3edf3c5`), `rt-d3` is R7D-FREEZE-3;
    - `rt-cand` holds the candidate's runtime bytes (`git archive 7cadcd8`). Its test files predate T17–T21: copy `CoachingCore/test/r7d-phase34.test.mjs` from the repository if you need them.
- The JSON is the structured record. It must carry:
  - `recordId`;
  - `candidate: "1978cc4"`;
  - `disposition` (SSCTR: ACCEPT, ACCEPT_WITH_CONDITIONS or BLOCK) or `verdict` (quality/reliability: READY, READY_WITH_CONDITIONS or NOT_READY);
  - `findings`;
  - `conditionsForFreeze`.
- If you propose a human-revalidation item, put it under `proposedHumanRevalidation.item`, in the queue's item shape, without appending it. This phase authorizes only the one append named above.
