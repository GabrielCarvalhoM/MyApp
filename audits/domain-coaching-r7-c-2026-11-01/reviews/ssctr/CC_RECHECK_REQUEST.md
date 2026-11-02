# R7-C Phase 5 — SSCTR recheck request (narrow, on R7C-FREEZE-2, after the single correction cycle)

You are the project's sports-science reviewer: `sports-science-concurrent-training-reviewer`, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY for bounded nonclinical internal sporting decisions. Clinical judgment stays CLINICAL_HUMAN_REQUIRED.

Read first your constitution `governance/agents/sports-science-reviewer/CONSTITUTION.md` and your skill `.agents/skills/sports-science-review/SKILL.md`. Your records for this mission:
- [r1](SSCTR_SEMANTIC_DISPOSITION_R7C.md): NOT_READY on SSCTR-SD-01;
- [r2](SSCTR_SEMANTIC_REDISPOSITION_R7C.md): ACCEPT_R7C_UNKNOWN_SEMANTICS, with conditions C2/C3/C7/C8/C9;
- [r3](SSCTR_FINAL_RECHECK_R7C.md): ACCEPT_WITH_CONDITIONS on R7C-FREEZE-1, no blocker, FR-01..03;

each with its JSON. You did not author the runtime, the correction cycle, its tests or the freeze.

This is the narrow recheck the correction cycle requires. It is not a new disposition. Do not change policy, catalog, canon, product, runtime, tests or the freeze, and do not append to the human queue. **There is no second correction cycle:** a blocker here closes R7-C as `CLOSED_NOT_READY`.

## Why a recheck

The Engineering review of R7C-FREEZE-1 ([ENGINEERING_REVIEW_R7C.md](../engineering/ENGINEERING_REVIEW_R7C.md)) was NOT_READY. Two of its findings bear on what you accepted:
- **QE-R7C-02 falsified the premise behind R1/C9.** Your records said the next week's stale projection is cured by the first decision of the next week. When the answer week's review is skipped, that decision kept the stale week b+1 as VALID, above the single-run ceiling.
- **QE-R7C-01:** an answer recorded by a decision that does not apply it (a refusal such as R4, a clinical route, a clinical return report) was never applied afterwards, even when re-sent as C3 prescribes.

## Bytes

- **R7C-FREEZE-2:** record `CoachingCore/r7/c/RUNTIME_FREEZE_R7C_2.json` (sha256 `457582a2094c3d1ed89067ee56caadcd8def58e94f6e68750e010624337bfa8d`).
  - Commit `a10cec04071be97e409f11a4f831f13eae0c9769`; source digest `9e424f702dbc2861f00d7ee0f2993172e74702afeb46767b7065eec6eaa63f35`; manifest digest `02c50ef3a98cf5770551934b116acb47aa3240fefc0a640d0639f2db5597efb9`; 854 tests.
  - Verifier: `node CoachingCore/scripts/verify-r7c.mjs --revision 2` (read-only; `--suite` also re-runs the suite).
- **The cycle's delta:** `git diff 1890f66356455112907d757032a8b1cd2de29c00 a10cec04071be97e409f11a4f831f13eae0c9769 -- CoachingCore/src CoachingCore/test`.

## What changed (runtime only; no policy, catalog or dose change)

1. **C9 / R1 (QE-R7C-02).** A factual re-plan never counts as executed the decision week's run sessions that elapsed with no report. Such sessions are unknown, in the weeks it projects, for both the transition and the single-run ceiling.
   - After a day-2 known-stop answer, week b+1 now equals the on-time plan in all 8 measured cases, the taper-to-race-week case included. On R7C-FREEZE-1 it was up to EASY 50 / QUALITY 34 / LONG 55 / a race touch.
2. **The ceiling re-plan (QE-R7C-01).** A run dose still ahead in the decision's week can exceed the single-run ceiling the record allows. The ceiling (policy run.singleRunCeiling) is the longest completed run in the 30 days before the week plus 5 minutes, or the reviewed entry when there is none. If the window also holds run sessions of this plan with no executed report (unreported, or reported not done) outside a declared break, that dose rests on training the record does not show. It is re-planned from the facts, whichever decision recorded them. **Scope:**
   - easy running only, the unknown window's own scope; a return, restart or walk/jog week follows its re-entry recipe;
   - never a return report, which decides its own re-entry from the break it declares;
   - never a return-entry week, which stands on the interruption's facts and its current demonstration, not kept in the record;
   - never while a question about unknown training stands. A decision that asks it decides alone, with no run dose planned, as before.

   The answer that a refusal or clinical route recorded is therefore applied at the next decision, with or without the re-send. Clinical-first is unchanged: a clinical route still decides with no proposal.
3. **Held signals (QE-R7C-03).** A held fatigue or performance signal keeps travelling beside a change kept while the question stays open, and it is re-evaluated with the answer as on time. This narrows SSCTR-SD5-02. A held signal still drops when the answer arrives inside a non-review event kind that returns VALID (C3/C8).

**Reach beyond the Engineering findings (please judge it):**
- **Weeks never reported, with the intake run still in the window.** No question is asked here; the facts decide the ceiling. The stored week credits the unreported weeks above that ceiling, for example `E40/Q34/L60` against 55. It is now re-planned from the facts: `E35/E35/L50`, read as the PlanningView reads unclosed weeks.
  - The test `r7a-cycle2.test.mjs:111` (an equipment change with unusable dates) is classified EXPECTED_SEMANTIC_UPDATE. The change is still asked and never applied; the factual re-plan of the credited run doses travels with the date question.
- **Late schedule changes (G01 grid, 6 rows in the MISS column).** R7C-FREEZE-1 kept the credited week-b doses valid after the gap weeks were reported not done (for example `Q43/L75`). FREEZE-2 re-plans them at the single-run ceiling (for example `Q34/L65`). This is your residual R2's late/batch path. In three short-gap rows (an anchor run in the window, so no question is asked) the UNREP plan changes the same way and still holds like the reviewed miss. Every verdict is unchanged.

## Confirm (narrow)

1. **R1 / C9:**
   - Is R1 closed on FREEZE-2?
   - Does C9's consumer condition (do not present week b+1 until a decision re-plans it) still need to bind, be narrowed, or be retired?
   - FR-03: the wording "including the taper-to-race-week case".
2. **The answer after a refusal or clinical route** is applied at the next decision: within the accepted semantics?
3. **The ceiling re-plan's semantics and scope**, including the never-reported class and the late known-stop schedule changes:
   - inside SSCTR-SD-R7C-r2 and the single-run ceiling policy?
   - no new dose?
   - any population where it reads the facts wrongly?
4. **The `r7a-cycle2:111` classification** (EXPECTED_SEMANTIC_UPDATE).
5. **SSCTR-SD5-02 / C8** after QE-R7C-03.
6. **Unchanged:** D1 (ACCEPTABLE_RESIDUAL), G02 (byte-identical), taper and race week, the clinical boundary (K6, K6b, CAND-01/02).
7. **Conditions carried:** C2, C3, C7, C8 and C9 as you set them now.

Gate: `READY | ACCEPT_WITH_CONDITIONS | NOT_READY`. Mark any blocker `DIRECT_R7C_DELTA` or not.

## Evidence on FREEZE-2 (`../../probes/out/`, label `R7C-P5-963239b`)

Manifest `evidence.R7C-P5-963239b.json`; mutation `mutation.R7C-P5-963239b.json`; differential `cc-differential.R7C-P5-963239b.json`.

| Check | Result on FREEZE-2 | Against R7C-FREEZE-1 (`R7C-P5-f69ddbb`) |
|---|---|---|
| Suite (freeze record; verifier `--suite`) | 854/854, 0 failures | 848/848; +6 directed tests (`r7c-phase5-cc`) |
| Verifier `verify-r7c.mjs --revision 2` | 16/16 PASS with `--suite` ([report](../../../../CoachingCore/r7/c/VERIFICATION_R7C_2.json)): the R7C-FREEZE-1 checks, plus the predecessor record and reviews by SHA-256 and the correction-cycle mutants | — |
| SD answer grid | A: 1,200 cells, 0 violations (24 PREEXISTING_HOLD, 4 ELAPSED_HISTORY_QUESTION); C 9/0, S 6/0, I 4/0 | identical |
| G01 Phase 4 grids | grid A 148 (76/40/32), grid B 46/46, P1 165/0, 0 violations, 0 unnecessary asks | verdicts identical; 6 grid-A rows change: the late schedule changes, MISS column, and in 3 short-gap rows UNREP identically (see above) |
| G02 | byte-identical to Phase 4 (`R7C-P4-39115ed`) | identical |
| SD-01 check (`verify-sd01`) | answer week EASY 15 / LONG 15, VALID | identical |
| SSCTR SD7, SD8, SD9, SD1 probes | as on FREEZE-1 | identical |
| SSCTR R1 probes, re-run on FREEZE-2 bytes (not your folder; outputs available on request) | `r1-exposure`: 168 cells, 168 equal to on time, 0 breaches of the single-run ceiling. `r1-race-week`: race week right after a taper answer EASY 15 / EASY 15 / RACE 75 = on time; next decisions 8/8 equal | on `e1a4ef4`: 112/168 equal; race week EASY 20 / RACE_TOUCH 25 / RACE 75, next 7/8 |
| Engineering probes E1–E4 (bound), on FREEZE-2 bytes | E1: 0 stale VALID cells (16 on FREEZE-1); E3: week b+1 = on time 8/8 (2/8); E3b: none above the ceiling; E2(a): the held fatigue survives the kept change and is re-evaluated with the answer, as on time; E2b: no replay across weeks; E4: 81 checks, the same 2 batch checks (QE-R7C-05) | — |
| Holdout | as on FREEZE-1 | identical |
| Clinical | K6 1/1, K6b 1/1, CAND-01 / CAND-02 / ADJ PASS; inherited adversarial 3,228 checks, 0 failed | identical apart from labels |
| Conformance | R7-B PASS, R7-B.1 delta PASS, R7-B.2 delta PASS | identical |
| Neighbours, differential against R7B2-FREEZE-1 | neighbours as on FREEZE-1; differential against R7B2-FREEZE-1: the same 29 C15 relabels as on FREEZE-1 (PRESERVE 95/98, R7B1_PATH 20/20, B2_PATH 7/33 identical), substitution grid 184/0, clinical sweep 389/0, envelope findings 0 | identical apart from labels (exit codes as on FREEZE-1) |
| Differential against R7C-FREEZE-1 (`phase5-cc-differential.mjs`, 99 scenarios) | 97 identical. Identical: cold starts by class and intake date, timely execution, shorter executed runs, 48 returns with a demonstration. Differing: 2, both the never-reported class | — |
| Mutation | Phase 3 set 17/18 (G02-M4 equivalent, witness killed); Phase 4 rules 8/8; SD mutants 6/6 (fragments follow the new text); correction-cycle mutants CC-M1..M9 9/9 | the R7C-FREEZE-1 sets preserved; CC-M1..M9 new |

## Output

Write only under `audits/domain-coaching-r7-c-2026-11-01/reviews/ssctr/`; your probes go in `probes/cc/`.
- **`SSCTR_CC_RECHECK_R7C.json`**, with these fields:
  - `revision`, `reviewer`, `authority`;
  - `bytes`;
  - `gate`;
  - `items`: each of the seven above, CONFIRMED or NOT, with the reason;
  - `blockers[]` (each `DIRECT_R7C_DELTA` or not), `conditions[]`, `findings[]`, `couldNotVerify`.
- **`SSCTR_CC_RECHECK_R7C.md`**: short, decision first.
