# R7-B.2 — blocker closure record (U2)

DOMAIN_COACHING_R7-B.2 (contract [R7B2-CONTRACT-r1](../../../audits/domain-coaching-r7-b2-2026-10-31/TASK_CONTRACT.md), Founder [request](../../../audits/domain-coaching-r7-b2-2026-10-31/FOUNDER_REQUEST.md)) closes the one blocker of the R7-B.1 closure ([handoff](../b1/R7B1_CLOSURE_HANDOFF.md)), **QE-R7B1-04**, on the predecessor runtime **R7B1-FREEZE-2**:
- commit `146ebb8`;
- source `f54e5c03…`, manifest `980d8301…`;
- 114 files, 786 tests.

The mission base `033f300` carries the same Coaching Core bytes (`git diff 2c6cb93 033f300 -- CoachingCore` is empty). In this record, "the baseline" means those bytes: `src/r6-adaptation.mjs` blob sha256 `f2a4f4f7…`.

This record covers unit U2: reproduction, the contract §4 inventory, the RED test, the fix and GREEN. The evidence on the fixed bytes beyond U2 is U3's: the G3 grid, the G4 differential, G5 mutation, G6 conformance and the freeze R7B2-FREEZE-1. The review is U4's.

Nothing in R6-POLICY-5, R7B0-CATALOG-2, its schema, the 13 B0 SSCTR r2 records, R7B1-SSCTR-r2 or the human queue changed. No dose, selection, substitution choice or training rule changed. No clinical reading was added.

## QE-R7B1-04 — the late-evidence question before the clinical screen (Engineering, MAJOR, blocking)

- **Finding.** In a return's re-entry week, once late training from before the break is recorded, a review reporting pain or injury with an exercise got R7-A's question ("confirm that interruption again") instead of the human route. The pending state was ASK, so the clinical flag was lost. With a block choice or an unrecognised choice in the same review, the block-choice question came back instead. A later review that reported only the pain got the same question (K6b, two steps).
- **Root cause.** The decision step ran `decide=c=>(kind!=='RETURN_AFTER_PAUSE'&&staleReturn(c))||(HANDLERS[kind]??weeklyReview)(c)` (baseline `src/r6-adaptation.mjs:359`). `staleReturn` (`:1245–1251`) returns its ASK before the handler runs, so the substitution handler's clinical screen (`:542–543`) was never reached. R7-B.1 had already made the handler's clinical result outrank the block-choice question (`:368`, QE-R7B1-01). But `handled` was then the stale-return ASK, not the handler's result, so that rule could not apply.
- **Authority.**
  - B0-C06 condition 8 and SSCTR D08 (clinical-screen-first);
  - QE-R7B1-01 (a clinical route the handler takes is the decision, with no proposal);
  - R7-A final I6 (confirmation-first, for reviews without a clinical signal);
  - the residual authority closure, QE-R7ADA-01 (a clinical route proposes nothing, `withFactualReplan`);
  - CLAUDE.md (clinical judgment stays CLINICAL_HUMAN_REQUIRED).

  No new policy.
- **Fix: one precedence point** (`src/r6-adaptation.mjs:368`, `:371–372`; line numbers in this item are on the fixed bytes).

  ```js
  const clinical=clinicalRoute(kind,review);
  const handled=clinical??(factual?.ask?null:decide(factual?.ctx??ctx));
  const decision0=clinical??factual?.ask??withFactualReplan(factual,handled.status==='CLINICAL_HUMAN_REQUIRED'?handled:choiceAsk??handled);
  ```

  - **Where it applies.** It runs inside the decision step, after every admission check (§4 class a below) and after the canonical factual state is computed. It comes before:
    - `staleReturn` (inside `decide`);
    - the factual re-plan's own question (`factual?.ask`);
    - the block-choice questions (`choiceAsk`, and the "could not be applied" question at `:373`, which already skips a clinical decision);
    - the return handler's report-identity question.
  - **What it returns when `clinical` is null.** Every expression is the baseline expression, so the decision is the baseline decision. Nothing else is reordered.
  - **Shared screens.** `clinicalRoute(kind,review)` (`:552`) returns the clinical route that the review's own handler screen takes, or null. It uses the two handlers' screens, which are now shared functions, so the precedence point and the handler can never read a report differently:
    - `substitutionClinical(sub)` (`:542`): the substitution screen, moved verbatim from the handler. It routes on pain, injury, or a free text that `screenInterruptionReason` reads as CLINICAL. `exerciseSubstitution` calls it at the same place (`:566`). As in the handler, it applies only to a report that names its exercise (`typeof sub.exerciseId==='string'`), because the route's reason and scope name that exercise.
    - `interruptionScreen(i)` (`:547`): the interruption-reason screen and its route, moved verbatim. `returnAfterPause` calls it at the same place (`:1283`) and keeps its `screen` for its later questions.
    - Reviews of any other kind have no clinical screen of their own; they get null and are unchanged.
  - **The route is the handler's own.**
    - status and action CLINICAL_HUMAN_REQUIRED;
    - the same reason text, byte for byte (asserted in the tests), and scope;
    - no proposal;
    - pending CLINICAL_HUMAN_REQUIRED through `withReference`, unchanged, and sticky for later reviews.
  - **The review's evidence is still recorded.** `out.actualLedger` is built before the decision, so late evidence and corrections in the review stay in `actualLedger`.
  - **Late evidence is never suppressed.** `staleReturn` is unchanged and state-derived. A later review with no clinical signal and no pending clinical state still gets the confirmation question.
- **Diff.** `src/r6-adaptation.mjs`, +32 / −8. The +32 is the comment, the three shared screen functions and the precedence point. The −8 is the two inline screens, the handlers' inline report accessors and the two decision lines.

## Inventory (contract §4): every exit that can come before a handler's clinical screen once a review reaches the decision step

Line numbers are on the baseline bytes. Probe: [`b2-inventory.mjs`](../../../audits/domain-coaching-r7-b2-2026-10-31/probes/b2-inventory.mjs), outputs in its `out/`.

| # | Exit (baseline) | Class | Evidence and disposition |
|---|---|---|---|
| 1 | Program integrity HOLD `:296`; authority and catalog UNSUPPORTED `:299–300`; contract and chronology HOLD `:309` | (a) admission refusal | Unchanged; nothing is known about the review yet |
| 2 | Eligibility clinical flag `:312` | safety, first | Unchanged; already before everything (inventory row "eligibility flag": CLINICAL) |
| 3 | Eligibility ASK `:316`; post-race eligibility and function check `:319` (SSCTR D04) | (a) safety requirement | Unchanged. Unknown eligibility is ASK, never clearance or illness (CLAUDE.md; contract D02). Inventory row: substitution pain without an assessment → eligibility ASK |
| 4 | `previousValidity` `:320–321`: integrity HOLD, sticky prior clinical, RECOVERED with a pending question | (a), safety, n/a | Integrity HOLD is (a). The sticky clinical state is safety, first. The RECOVERED ASK comes before no clinical screen: RECOVERED has none |
| 5 | Malformed lists `:322–324`, `:327`; athlete model integrity `:332`; malformed facts caught `:385` | (a) contract and integrity refusal | Unchanged (inventory row: malformed observations → HOLD) |
| 6 | **`staleReturn` inside `decide` `:359`** | **(b)** | **QE-R7B1-04.** K6 and K6b reproduced on the baseline, row for row identical to the recorded R7-B.1 outputs. Fixed by the precedence point |
| 7 | **Factual re-plan question `factual?.ask` `:357`, `:367–368` (R7B2-CAND-01)** | **(b)** | **Reproduced on the baseline (see "CAND-01" below).** Fixed by the same point |
| 8 | Block-choice and unrecognised-choice questions `:365–366`, `:368–369` | already safe | Since QE-R7B1-01 a clinical handler result outranks them. QE-R7B1-04 reached them only through row 6 (K6 rows with choices); fixed with it |
| 9 | **`returnAfterPause` report-identity question `:1257–1258` (R7B2-CAND-02)** | **(b)** | **Reproduced on the baseline through the public API (see "CAND-02" below).** Fixed by the same point |
| 10 | `exerciseSubstitution` without a named exercise `:541` ("Say which exercise should change and why") | (c) other | See "Adjacent: a substitution report without its exercise" below. Recorded, not fixed |
| 11 | `returnAfterPause` episode question `:1294` and its own `staleReturn` `:1296` | already safe | Both come after its screen `:1259–1260` |
| 12 | Counterfactual validation UNSUPPORTED `:379` | n/a | Only when a decision proposes; a clinical route proposes nothing |

Outside the decision step, `src/r6-legacy.mjs` (the legacy path) and the intake (`src/r6-intake.mjs`, `src/r6-program.mjs:1301`) have their own clinical checks. They do not route through `evaluateProgram`'s decision step and are out of B.2's scope.

### CAND-01 — the factual re-plan question (class b, fixed)

- **Path.** `factual?.ask` is returned without running any handler. It has two sources:
  - `factualReplan` → `composeWeeks` → `reapply` of a recorded UNAVAILABLE_DAY adaptation over the race date (`src/r6-composition.mjs:122`);
  - `graduationWithdrawal` → `rebuild`: an arrangement trade-off in `contextAfter` (`:728–731`), or the same composition question.
- **Reachability through the public API.**
  - The unavailable-day handler refuses to record a date that holds the race (`:808`).
  - An event moves only through `goalChange`, whose own `rebuild` asks the same question and whose new date is at least 7 days ahead, so never in the current week.
  - So `factualReplan`'s question needs a program state the runtime itself never produces.
  - `graduationWithdrawal`'s arrangement question is reachable in principle: a graduation, then an agenda change, then a correction that withdraws the graduation. It was not constructed.
- **Reproduction.** On the baseline, the probe built that state from the runtime's own program:
  - the program is a race program after 5 reviewed weeks, with an UNAVAILABLE_DAY adaptation over its race date on the race week and its hash recomputed. `validProgram` accepts it: the program carries no tamper-proof binding beyond its hash;
  - a review in week 5 that corrects week 4's strength reports, which moves this week's PlanningView;
  - weekly control → "The race now falls on a date marked unavailable…" (the question fires);
  - **substitution pain → that ASK**;
  - **an illness return → that ASK**;
  - controls: the same pain without the correction → CLINICAL; the same pain on the runtime's own program → CLINICAL.
- **Classification and fix.** The contract's rule (§4) and the binding invariant name the factual re-plan question among those that must not replace a clinical route. It is reproduced, so it is class (b), fixed by placing the same single point before `factual?.ask`. This adds no extra mechanism. On the fixed bytes both rows are CLINICAL, with no proposal. Without a clinical signal the question is asked as before (test "preserved (CAND-01)").

### CAND-02 — the return's report-identity question (class b, fixed)

- **Path.** A return report resent under an event id that already belongs to a recorded return, with other facts, is asked about the id (`:1258`) before the interruption-reason screen (`:1259`).
- **Reproduction through the public API.** On the baseline:
  - a nonclinical return (WORK) re-establishes;
  - the same id is then resent with the reason "Flu illness", or the category INJURY, or `clinicalReason:true`;
  - each gets "This report id already belongs to a different interruption report…": ASK, with pending ASK and the clinical flag lost;
  - control: a new id with "Flu illness" → CLINICAL.
- **Classification.** Class (b), not (a). The id question is an identity question about bookkeeping (R7-A final P6), and the contract rule names "episode or report-identity question" among those that yield. The report is otherwise complete, and its clinical route does not depend on the id. The clinical route proposes nothing and records no interruption, so routing it cannot apply a report twice.
- **Fix.** The same point (the return screen runs first). Preserved:
  - the same report again (same id, same facts) is still KEEP. Its facts passed the screen when it was first recorded, and every REESTABLISH decision records its `inputHash`;
  - the same id with other nonclinical facts is still asked.

### Adjacent: a substitution report without its exercise (class c, recorded, not fixed)

- **Behaviour.** A substitution review with `pain:true` and no `exerciseId` gets "Say which exercise should change and why" (ASK, missing `substitution.exerciseId`, `substitution.reason`). It is unchanged on the fixed bytes (inventory row ADJ).
- **Why it is not in the QE-R7B1-04 class.**
  - It is not a re-entry question, and no other decision-step question replaces a handler route here: it is the substitution report's own missing subject.
  - The handler's clinical route is scoped to the named exercise (reason "…with \<exercise\>…", scope `{exerciseId}`). Routing an unnamed report would need a new route shape, which is neither the handler's own reason and scope (invariant 2) nor the smallest change.
- **Disposition.**
  - Severity: observation.
  - Owner: the next runtime mission (Engineering), with Product/UX for the wording and the SSCTR if an unscoped clinical route is proposed.
  - Next action: decide whether a substitution report that carries a clinical signal and names no exercise routes to a human with an unscoped route, or is asked with the pain acknowledged.

## Regression tests

[`test/r7b2-clinical-precedence.test.mjs`](../../test/r7b2-clinical-precedence.test.mjs), 13 tests. Six are RED on the baseline, and the seven named "preserved" pass on both.

| Test | Baseline | Fixed |
|---|---|---|
| QE-R7B1-04: pain, injury, `pain:'yes'`, clinical free text, each with the late report in the same review → the handler's exact route; late report recorded | RED | pass |
| QE-R7B1-04: plus a ladder step, a graduation decline or an unrecognised choice → CLINICAL | RED | pass |
| QE-R7B1-04: two steps (K6b) → CLINICAL; late report stays recorded | RED | pass |
| QE-R7B1-04: after the clinical route, a later review with no signal and no pending clinical state still gets the late-evidence question (`interruption.episodeId`), and one carrying the clinical reference state stays CLINICAL | RED | pass |
| preserved A: late report, no clinical signal (weekly; substitution with `pain:false`; an unclear `pain:'maybe'`; nonclinical discomfort) → R7-A's question, never CLINICAL | pass | pass |
| preserved B: clinical signal, no late evidence → the handler's own route and text (substitution and illness return) | pass | pass |
| preserved: an illness return in the re-entry week, with the late report → CLINICAL | pass | pass |
| preserved D: nonclinical corrections + late report → R7-A's question, never CLINICAL; correction recorded | pass | pass |
| preserved F: skill substitution, no clinical signal → proposes the substitution; the set-aside exercise leaves the plan ahead | pass | pass |
| CAND-02: same id + illness, injury category or clinical flag → CLINICAL | RED | pass |
| preserved CAND-02: same report → KEEP; same id with other nonclinical facts → id question | pass | pass |
| CAND-01: factual re-plan question + substitution pain, illness return, or pain with an unrecognised choice → CLINICAL; correction recorded | RED | pass |
| preserved CAND-01: no clinical signal → the factual re-plan question as before | pass | pass |

Neighbor E (block choice + clinical signal, QE-R7B1-01) keeps its R7-B.1 tests (`test/r7b1-correction-cycle.test.mjs`). They pass unchanged, and the re-entry variants are in the second row above. No existing test changed.

## Evidence (U2)

Logs are under [`audits/domain-coaching-r7-b2-2026-10-31/evidence/`](../../../audits/domain-coaching-r7-b2-2026-10-31/evidence/), copied from the runtime captures.

| Gate | Result | Ref |
|---|---|---|
| G0 suite on the baseline | 786 tests, 786 pass, 0 fail (after `npm ci --prefix CoachingCore`) | `SUITE_baseline-033f300.log` (capture sha256 `ddd8ece4…`) |
| G1 reproduction | K6 and K6b copied verbatim (sha256 equal to the R7-B.1 originals) and run with `PROBE_ROOT` on the baseline. FAIL, with rows identical to the recorded R7-B.1 outputs apart from label and time. Controls `substitution-pain-no-late` and `return-illness` → CLINICAL. CAND-01 and CAND-02 reproduced | `probes/out/*-B2-BASELINE-033f300.json` |
| G2 RED | New file on the baseline: 13 tests, 7 pass, 6 fail (the six in the table) | `RED_r7b2-clinical-precedence_baseline-033f300.log` (capture sha256 `4f92bd36…`) |
| G2 GREEN | New file 13/13. Full suite 799 tests, 799 pass, 0 fail (786 + 13); no existing test changed | `SUITE_U2-fixed.log` (capture sha256 `f6cfa4a8…`) |
| Probes on the fixed bytes | K6, K6b, CAND-01 and CAND-02 PASS. The only changed rows go from a nonclinical ASK to CLINICAL_HUMAN_REQUIRED, with no proposal on either side and pending ASK → CLINICAL. Every control and adjacent row is byte-identical | `probes/out/*-B2-U2-FIXED.json` |

## For U3 and U4

- **G4 and the §5 routing condition.** The fix changes a decision only for a review whose own handler screen routes clinical. Where the baseline returned a nonclinical question there, it now returns the handler's route. Where the baseline already returned the route, nothing changes. Two cases could break the "no proposal on either side" condition:
  - a baseline question on such a review that carried a factual re-plan proposal (`withFactualReplan` attaches one to a question). The clinical route proposes nothing, as every clinical route does (QE-R7B1-01). None appeared in U2's probes and checks, which included corrections in the re-entry week. If the G4 grid shows one, contract §5 requires the SSCTR and a narrow Quality review;
  - a baseline HOLD from an exception in the skipped path.
- **G5 mutants that should be killed by these tests:**
  - the precedence point removed (the baseline);
  - the point moved into `decide` after `staleReturn` (kills the QE-R7B1-04 tests);
  - the point after `factual?.ask` (kills CAND-01);
  - the point limited to EXERCISE_SUBSTITUTION (kills CAND-02 and the CAND-01 illness row);
  - the handler calling its own copy of the screen while the point uses a weaker predicate, for example pain only (kills the injury and free-text rows).
