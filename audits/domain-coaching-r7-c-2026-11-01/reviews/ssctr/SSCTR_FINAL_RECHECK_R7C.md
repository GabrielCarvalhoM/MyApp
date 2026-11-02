# SSCTR final recheck: R7-C on R7C-FREEZE-1

Record `SSCTR-FR-R7C-r3`, dated 2026-11-02. The structured record is [SSCTR_FINAL_RECHECK_R7C.json](SSCTR_FINAL_RECHECK_R7C.json).

## Decision

**Gate: ACCEPT_WITH_CONDITIONS.** All nine items are confirmed on the frozen bytes, and there are no blockers.

The gate is not READY because the acceptance in [r2](SSCTR_SEMANTIC_REDISPOSITION_R7C.md) holds only with these conditions binding:
- **Consumer conditions:** C2, C3, C8 and C9.
- **Also in force:** C4, C5, C7 and C10.

These conditions are carried, but they are obligations on consumers, G03 and Engineering. No frozen byte discharges them. No new condition is added.

This is a narrow recheck, not a new disposition. The Founder's single correction cycle is not needed on SSCTR's account.

| # | Item | Result |
|---|---|---|
| 1 | SD-01 closed on the frozen bytes | **CONFIRMED** |
| 2 | SD-02 closed | **CONFIRMED** |
| 3 | SD-03 closed, within SSCTR-SD5-02 (C3/C8) | **CONFIRMED** |
| 4 | Accepted semantics frozen; split matches `legacyTests`/`legacySplitRules`; no KNOWN_MISS invariant weakened | **CONFIRMED** |
| 5 | G02 inside R6-PARTIAL-NOISY-LEARNING | **CONFIRMED** |
| 6 | D1 still the ACCEPTABLE_RESIDUAL | **CONFIRMED** |
| 7 | Taper and race week | **CONFIRMED** |
| 8 | Clinical boundary (clinical-first, K6, K6b, CAND-01, CAND-02) | **CONFIRMED** |
| 9 | C2, C3, C7, C8 and C9 in the freeze record and the handoff | **CONFIRMED** |

## Why each item holds

1. **SD-01.**
   - The runtime equals r2's bytes:
     - `r6-adaptation.mjs` `8b189617…1587`;
     - `r6-composition.mjs` `2a4c47e8…b7ce`;
     - `git diff e1a4ef4 1890f66 -- CoachingCore/src` is empty.
   - These outputs are byte-identical on the frozen bytes:
     - SD7: 0 credited;
     - SD9: week 7 at 15/15/15;
     - SD8;
     - my 3,060-cell grid: 0 validity or history violations;
     - the coordinator's grid: 1,200 cells, 0 violations.
   - On the Phase 4 runtime, the frozen split tests fail where SD-01 lived (see item 4).
2. **SD-02.** The answer week is tested by:
   - the directed tests;
   - the split: D18 on day 0 and day 2, §19 (b), and the QRE-R6-04 day-2 answer.

   Mutant SD-M2 is killed (read, not re-run).
3. **SD-03.**
   - My `signals-residuals` and `recovered-and-held` probes are byte-identical, and the S grid is 6/0.
   - The residual is no wider: an answer inside SCHEDULE_CHANGE, EQUIPMENT_CHANGE, GOAL_CHANGE, UNAVAILABLE_DAY or LOCAL_FATIGUE still drops the held signal.
   - The residual stays under C3 and C8.
4. **The split.**
   - **Scope.** Commit `738928b` touches exactly the five files, with their freeze-record sha256.
   - **Reading.** Every variant was read against r2's `legacyTests`, and every split rule is met.
   - **KNOWN_MISS.** Each original assertion is unchanged on that path. Two are strengthened: the QRE-R6-04 per-decision check and the exact §19 held list.
   - **My cross-runtime probe** ([probes/final/](probes/final/)) runs the five frozen tests with only the two runtime files swapped:

     | Runtime | QRE-R6-04 | D18 | F3/H25 | §19 | Fifth |
     |---|---|---|---|---|---|
     | Frozen | pass | pass | pass | pass | pass |
     | Phase 4 `6240080` (SD-01 present) | fail | fail | pass | fail | pass |
     | R7B2-FREEZE-1 | fail | fail | fail | fail | fail |

     - On the Phase 4 runtime, the three failures come from the answer returning KEEP/KEEP.
     - On R7B2-FREEZE-1, each test fails at its UNREPORTED step. QRE-R6-04's KNOWN_MISS block passes there first.
5. **G02.**
   - `learnedMaintenance` is untouched by the Phase 5 delta.
   - The G02 output is byte-identical to the Phase 4 output on which r1 confirmed the binding.
6. **D1.**
   - The holdout is byte-identical.
   - Against Phase 4, only H19 S2's reason text differs. Status, action and plan hash are unchanged.
   - S4 (the D1 step) is still KEEP on R7-C and on B.2.
7. **Taper and race week.**
   - **Answer week.** No run above the entry, and no quality or race touch, in any taper or race-week answer week (0 flags).
   - **Next week.** The 112 taper next-week flags are R1 under C9, whose frozen text names the taper-to-race-week case:
     - a race-week touch of 25 minutes after a taper answer;
     - the next decision converges to A.
   - **B2.** The B2 taper residual (SD3) equals B.2.
   - **Unknown training.** Before a taper it asks; it is never read as zero (G01 grids byte-identical).
8. **Clinical boundary.**
   - **My re-runs from verbatim copies:** K6, K6b, CAND-01, CAND-02 and ADJ PASS; adversarial 3,228 checks, 0 failed.
   - **Clinical-first grid:** C 9/0.
   - **R5:** pain with the answer goes to CLINICAL_HUMAN_REQUIRED.
   - **Neighbors:** the 14 flags are clinical on both sides.
   - **Differential:** its 58 step findings are C15 relabels with no clinical signal; substitution grid 184/0; clinical sweep 389/0.
   - **No clinical judgment is made here.**
9. **Conditions.**
   - In the freeze record, `bindingConditions` is string-equal to r2 for C2, C3, C7, C8 and C9, and the verifier check passes.
   - The handoff carries C2, C3, C8, C9 and every C7 disclosure, plus C4, C5 and C10.

## Findings (all non-blocking)

- **FR-01: QRE-R6-04 ANSWERED.**
  - The next-week check covers only VALID decisions.
  - On this fixture the one non-VALID decision has 0 intense sessions next week, so nothing is hidden.
  - Widen the check in a later test revision.
- **FR-02: typed-ask fields.**
  - §19, F3 S2 and the fifth fixture assert the typed ask with four of its six fields.
  - Rule 2 is still met.
- **FR-03: handoff wording.** The handoff paraphrases C8 and C9:
  - C9 drops "including the taper-to-race-week case";
  - "the weeks after are re-planned from the facts" needs "subject to R1/C9".

  The freeze record's verbatim texts govern. At closure, the handoff should say so. Documentary only; the handoff is not a frozen byte.
- **FR-04: the split discriminates.** This is positive evidence (item 4).
- **FR-05: f69ddbb against e1a4ef4.** Every f69ddbb output equals its e1a4ef4 counterpart apart from labels. The exceptions are the suite, the manifest and the mutation output, as stated.

## What I verified myself, and what I did not

**Run by me, on HEAD `f96041f`:**
- **Verifier:** `verify-r7c.mjs --suite`, without `--write`: 12/12 PASS, 848/848.
- **20 probe re-runs, all byte-identical:**
  - 8 of my own sd5 probes;
  - 4 r1 probes;
  - the coordinator's G02, holdout, SD grid, verify-sd01 and G01 probes;
  - neighbors and the differential.
- **The three conformance checks:** PASS, with stdout sha256 equal to the freeze record.
- **The four clinical probes,** run from scratchpad copies.
- **My cross-runtime probe.**
- **Unchanged inputs:**
  - policy;
  - catalog;
  - `product/` and `canon/`;
  - the queue (230 items, `95ea4b92…99c8`, funding NOT_DECLARED).

The hashes are in [probes/final/out/reruns.f96041f.json](probes/final/out/reruns.f96041f.json).

**Literature:**
- Access is confirmed: WebSearch, and WebFetch through its summarizing model.
- My screen found no newer systematic review that would trigger re-review.
- The Bosquet 2007 record shows no correction or retraction.
- No new claim is made.

**Not verified:**
- **Mutation run:** read, not re-run (excluded by the request); its sha256 equals the freeze record.
- **Schema validation:** not run, because Python is not installed.
- **Full texts** of the sources.
- **KNOWN_MISS blocks on R7B2-FREEZE-1.** For D18, F3, §19 and the fifth fixture, the frozen test code did not reach these blocks on R7B2-FREEZE-1, because each test stops at its UNREPORTED step. Their equality to B.2 rests on my r2 probes, re-run byte-identical.
- **The Engineering review:** not read, by instruction.
- **Real-user behaviour and consumer compliance** with C2, C3, C8 and C9.
- **R1, R2 and R3** beyond the shapes probed in r2.
- **Native dispatch:** whether the native project agent type was used cannot be observed.

**Authority and independence:**
- **Authority:** PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY. There is no human, empirical or clinical validation, no publication, and V1 authority stays NO.
- **Independence:**
  - I authored none of the runtime, the fix, the tests, the split, the freeze or the handoff.
  - The split spec I checked against is an earlier instance's r2. I did not re-judge r2's conclusions.
- **Queue:** the two queue items proposed in r2 stay proposed, now bound to R7C-FREEZE-1. Nothing was appended.

**Re-review:** on any change to a frozen file, an engine fix for C8 or C9 (or for C5 or R4), a G03 decision, a relevant policy change, new V1 data, or a relevant new systematic review. At the latest 2027-04-30. Owner: Chief.
