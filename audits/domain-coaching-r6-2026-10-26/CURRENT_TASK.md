# DOMAIN_COACHING_R6 — current task (continuation handoff)

Updated 2026-10-26 by the third Claude Code continuation session, at the Founder's request, after SSCTR round 10 returned. The fourth session then did steps 0–2 and the dossier and dispatch of step 3 (CHECKPOINT resume point 17). A new session continues **exactly from here**. Do not reopen finished work.

**Status: R6 IS CLOSED WITH AN EXPLICIT BLOCKER (2026-10-27; CHECKPOINT resume point 20).** Nothing remains to do in R6. Do not reopen it. The next step is DOMAIN_COACHING_R7, which needs its own Founder-authorized mission; start from `CoachingCore/r6/OPEN_GAPS_R6.md` (R7 entry) and `FINAL_DISPOSITION.json`. The history follows.
- **What happened.** SSCTR round 12, the last round the Founder bound allows, refused the freeze. D53 is still open on the from-log and pending path, and D54 is new: a re-establishment row ignores the taper, race-week and post-event doses. Both are runtime-only. The SSCTR's next step is "In R7: fix D53 for every state mode and D54".
- **The steps below no longer apply as written:** steps 1–3 (no more cycles), step 4 (no FREEZE-2, so no official FREEZE-2 outputs and no post-fix rerun), and in step 5 the engineering re-review and the R5 reclassification. All are recorded as not run.
- **The blocked closure, in order:**
  1. **Coaching-quality judge** on the first evaluation only: **dispatched** with `continuation/coaching-judge-first-evaluation-prompt.md`. Verify its outputs when it returns.
  2. **Topic docs.** Apply the drafts and the doc edits, plus a status note on D53, D54 and the refused freeze.
  3. **Hand-written deliverables:**
     - `PROGRAM_QUALITY_R6`, from the judge;
     - `OPEN_GAPS_R6`, with the blocker first and the R7 entry;
     - `READINESS_VERDICTS_R6`: NOT_READY, with `NEXT_ENGINEERING_STEP` = DOMAIN_COACHING_R7;
     - `FINAL_REPORT.md`, in Portuguese;
     - the `r6/README` refresh.
  4. **Generated and recorded files:**
     - `node scripts/document-r6.mjs`, non-dev; the official outputs stay FREEZE-1's;
     - `node scripts/queue-r6.mjs`;
     - the insert-only mission and ledger lines;
     - `node scripts/verify-r6.mjs --write`, which fails honestly the checks that need FREEZE-2 or current-policy official outputs;
     - `finalize-r6.mjs`, adapted to record the FREEZE-2 entries as not run.

**Founder bound (binding; [FOUNDER_LOOP_BOUND.md](FOUNDER_LOOP_BOUND.md)):**
- After round 11, **at most one more cycle**, and only if every blocking item is new, narrow and runtime-only.
- Anything else **closes R6 with an explicit blocker**, and DOMAIN_COACHING_R7 is the next step: D52 failing again, a required policy change, a needed Founder decision, or a second NO.
- Borderline cases close. Never open a round 13.

Read in this order:
1. this file;
2. [CHECKPOINT.md](CHECKPOINT.md), resume points 15, 16 and 17 (13 and 14 cover the round-8 answers, if needed);
3. [continuation/README.md](continuation/README.md), which indexes the saved prompts, judge briefs, drafts, author checks and reviewed runtime copies.

Read the Founder's requests ([FOUNDER_REQUEST.md](FOUNDER_REQUEST.md), [FOUNDER_CONTINUATION_REQUEST.md](FOUNDER_CONTINUATION_REQUEST.md)) only for the rules, the deliverable list (§25) and the verdicts (§26). The previous version of this file, with the full designs of D47–D49 and R11–R13 as they were specified, is `continuation/CURRENT_TASK.as-of-round-10-dispatch.md`.

## Rules that still bind
- **Commands.** Never run `npm run verify` or any `verify-r*` historical script; they regenerate closed evidence. `node scripts/verify-r6.mjs` is the R6 verifier.
- **Mission files.** `CURRENT_MISSION.md` and `MISSION_LEDGER.md` are insert-only.
- **Hands off.** Do not edit `product/` or `canon/`; the R6 baseline binds them. No UI, Figma, KMP, production or real-athlete plans.
- **Parallel work.** Preserve the OB-2 work. OB-2's 3 queue items are appended by `scripts/queue-r6.mjs` at closure.
- **Independence.** The worker is never the judge. Every agent dispatch carries exactly one `<task-route>{…}</task-route>` JSON.
- **Language.** Status messages to the Founder are in Portuguese. Topic `.md` deliverables are in English. `FINAL_REPORT.md` is in Portuguese.
- **Holdout integrity.** Never read `CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json` or `FIRST_EVALUATION.json` while changing the runtime. Never re-run the first evaluation. The first raw is immutable.
- **Policy text.** R6-POLICY-5 (`18ec48f3…`) is reviewed, and all ten records bind its hash. D52 is runtime-only, so do not change the policy before FREEZE-2. Any byte change needs a full delta binding review of a new hash. R16 and R17 wait for the next policy revision.
- **Review windows.** Do not touch `CoachingCore/src`, the policy or the tests while an SSCTR round, a judge or a probe is reading the runtime. Preserve the reviewed runtime before editing it. The round-10 copy already exists.
- **Mutation-check scripts** (`continuation/author-checks/`) temporarily rewrite `CoachingCore/src`. Run them only while nobody is reading the runtime, and never after FREEZE-2.
- **Backslashes.** Edit code that contains backslashes with the Edit tool, not a shell heredoc. A heredoc once collapsed `\\` and corrupted a regex.
- **Claims.** Make no claim of human, empirical or clinical validation.

## Where things stand

| Item | State |
|---|---|
| FREEZE-1 | `CoachingCore/r6/RUNTIME_FREEZE_R6.json`, digest `507f35fc…`. Sources preserved byte-identical in `freeze-1-source/`; official outputs in `freeze-1-outputs/`. |
| Fresh holdout | Sealed by an independent author: 35 cases, corpus `49a85b8c…`, manifest flags clean. |
| **First evaluation** | Ran **once** on unchanged FREEZE-1: `CoachingCore/r6/holdout/FIRST_EVALUATION.json`, sha256 `b3d155b63d525325ac94688f403efa073b12698dd342ed43a87093be7a75eb3e`, 35 cases, 0 errors. The runtime author has **not** inspected its contents. It is the primary record. |
| Engineering review of FREEZE-1 | **FAIL**, with 23 findings QRE-R6-01…23 (`reviews/quality-engineering-review.json`). All are fixed, with scope pinned by `CoachingCore/test/r6-engineering-fixes.test.mjs`. |
| SSCTR rounds 7–9 | **Round 7**, on R6-POLICY-3: D42–D46, answered in R6-POLICY-4. **Round 8**: D47–D49, answered in R6-POLICY-5. **Round 9**, on R6-POLICY-5: D47–D49 resolved; D50 and D51 found, runtime-only, and fixed at the same hash. Outputs are in `reviews/ssctr-*.r7.*` to `.r9.*`; the dossiers are in `reviews/ssctr-dossier/`. |
| **Policy now** | **R6-POLICY-5**, hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, file sha `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`. Reviewed in rounds 9 and 10. It stays unchanged until FREEZE-2. |
| **SSCTR round 10** (narrow check at `18ec48f3…`) | **Freeze NO, blocked by D52.** D50 and D51 are resolved. All ten records are APPROVE_WITH_CONDITIONS at the hash; D52 must be fixed before freeze for LOAD-ESTABLISHMENT, SUBSTITUTION, ROTATION and NONCLINICAL-RETURN. Rulings: Q1 accepted; Q2 confirmed, its side effect being part of D52; Q3: R14 stays an open gap tied to G03; Q4 becomes the non-blocking R16. R17 is new. The queue proposal has 10 items. The current `reviews/ssctr-*` files are round 10, also copied to `*.r10.*`. |
| Runtime | **D52 fixed** (fourth session): `r6-program.mjs` `8fdadf2f…`, `r6-adaptation.mjs` `d6a1d6fc…`, with the author-found conflict filter. The round-10 reviewed runtime is preserved in `reviews/ssctr-dossier/reviewed-18ec48f3-r10-source/`, and the diff is `RUNTIME_DELTA_D52.diff`. |
| Suite | `node --test` in `CoachingCore`: **438/438**, including the 10 new tests in `test/r6-ssctr-r10-fixes.test.mjs`. |
| R5 regression | Re-checked after D52: the dev replay is semantically unchanged. It differs from the judged FREEZE-1 replay in the same 8 cases (H01, H07, H08, H10, H12, H14, H17, H22), only in the race-day warm-up line. Confirm on the official FREEZE-2 replay. |
| Docs | The topic-doc drafts (EVENT, RUN, STRENGTH) are current through D52. `continuation/README.md` lists the small doc edits, D52 as implemented. |
| Scripts outside the freeze | `freeze-r6-2.mjs`, `finalize-r6.mjs` and `document-r6.mjs` are updated for D52 (step 2 done). `queue-r6.mjs` and `demonstrations-r6.mjs` are unchanged. |
| Judge briefs | `continuation/engineering-rereview-message.md` and `judge-prompts.md` describe D52 as implemented. The remaining `[CHECK AT DISPATCH …]` markers are the round-11 verdict and the official FREEZE-2 R5 replay. |
| **SSCTR round 11** | **Dispatched** (narrow runtime check of D52 at `18ec48f3…`; prompt `continuation/ssctr-round-11-prompt.md`). Its outputs replace the current `reviews/ssctr-*`, and the `.r10` copies are byte-identical to the round-10 files. |

## Next steps, in order

### 0. Check the starting state (read-only)
- `node --test` in `CoachingCore`: 428/428.
- The policy hash is `18ec48f3…`, using `hash` from `src/value.mjs` on the parsed JSON.
- `CoachingCore/src/r6-*.mjs` and `test/r6-*.test.mjs` equal `reviews/ssctr-dossier/reviewed-18ec48f3-r10-source/MANIFEST.json`.

### 1. D52: the strength state follows executions (LOAD-ESTABLISHMENT, shared with SUBSTITUTION, ROTATION and NONCLINICAL-RETURN), runtime only
**Where the defect is stated:**
- `reviews/ssctr-policy-review.json`: `records` → R6-LOAD-ESTABLISHMENT `runtimeBinding`, and `freezeVerdict.nextStep`;
- the cases: `reviews/ssctr-probe-runtime-d50-d51-r10.mjs`, section Z (around line 970), and its `.out.json` → `sections.Z_D52`.

**What the SSCTR requires:**
- **(A) A prescription that was not executed establishes nothing.**
  - The next exposure of a never-performed exercise is the effort-guided establishment row: the establishment set count at RIR ≥ 3, ramp-up, no load and no progression step.
  - A FROM_LOG row is issued only when a logged load exists, pending or adopted.
  - The cases cover rotation (EVERY_2_WEEKS and COACH_DECIDES), a FIXED cold start, an equipment-window substitute, and, after a return, an exercise first prescribed in the session dated inside the pause.
- **(B) Count `strength.resumeAfterDays` in calendar days from the last executed exposure** of the exercise, using the completed-work ledger. This applies to rotation back, the end of a substitution window, skipped sessions and exercises not used during a return.

**The code** (line numbers as of `4227f501…`):
- **`r6-program.mjs` `advanceStrength`** (line 401):
  - Line 409 creates a state for every exercise in `used`, meaning prescribed in the week: ESTABLISHED, FROM_LOG, no load, `source:'PLANNED_ESTABLISHMENT'`.
  - Line 412 stamps `ex.lastWeek=w` on all of them.
  - Callers:
    - the weekly review, `r6-adaptation.mjs` line 330, with `used=usedInWeek(…)`, `evidenceGates={ALL:'HOLD',...gates}` and `logs=loggedLoads(ev,…)`;
    - the replan start, `r6-adaptation.mjs` line 425;
    - projection, `r6-program.mjs` line 663, with `{assumeLogged:true}` and empty gates, so every exposure counts as executed.
- **`strengthDose`** (line 325), line 330: the resume branch `(w-ex.lastWeek-1)*7>op.return.moderateMaxDays`, outside a return and not for bodyweight.
- **`buildWeek`** (line 553), around line 588: exercises established earlier in a week count as established for its later sessions. Check whether D52 needs a change there.
- **`r6-prescription.mjs` `exerciseRow`** (line 66): the ESTABLISH instructions are at line 71, followed by the FROM_LOG ones.

**Design notes** (the author's reading; verify them before relying on them):
- **Two separate facts.**
  - "Has a logged load" decides FROM_LOG, for (A).
  - "Was performed, and when" drives the clock, for (B).
  - In `advanceStrength`, `executed` means an ADVANCE gate with evidence. A HOLD gate may mean performed without progress or not performed at all (QRE-R6-04 default `ALL:'HOLD'`). So take the performed date from the week's evidence or the ledger, not from the gate.
- **Projection** treats every exposure as executed and logged, so fully executed projections should not change. The exception is where (B) moves a gap across 28 days because it counts calendar days instead of whole weeks. Explain every change in the dev outputs.
- **Keep the earlier fixes intact:**
  - D44: above-plan adoption.
  - D45: an establishment log stays pending until it is confirmed.
  - D48: the pending row text.
  - D49: `lastExecutedSets`, `setCeiling`, `setCap` and `returnInBlock`.
  - D51: the return ends with the exercises prescribed in the week. Q2 confirmed this, so do not redefine "in use".
  - QRE-R6-17: `priorSets`, `reestablishes` and `adoptionBasis`.
- **Bodyweight.** R17 is non-blocking. Keep today's bodyweight resume unless the fix needs otherwise, and say so in the dossier.

**Tests:** a new file, `CoachingCore/test/r6-ssctr-r10-fixes.test.mjs`, that turns probe Z into regression tests:
- **Z1:** a missed first exposure under EVERY_2_WEEKS, COACH_DECIDES and FIXED;
- **Z2:** five weeks of skipped strength, FIXED selection;
- **Z3:** after a return, an exercise first prescribed in the pause-dated session, and an accessory last done 35 days earlier;
- **Z4:** the missed first exposure of an equipment-window substitute.

Give each test a literal `test('…')` name; `document-r6.mjs` does not index template-literal names. Its STRENGTH pattern matches "strength" and "establishment log", among others. Check that the SUBSTITUTION and ROTATION topics pick up the tests you mean them to.

**Author evidence** (dev authority bound to `18ec48f3…`):
- `node --test` passes, and the policy hash is still `18ec48f3…`.
- A mutation check, `continuation/author-checks/mutation-check-r10.mjs`, modelled on `mutation-check-r9.mjs`:
  - every mutation is caught;
  - the sources are restored byte-identical;
  - it runs only while nobody else reads the runtime.
- The round-10 SSCTR probe, re-run as author material in `reviews/ssctr-dossier/r10-author-reruns/`. Adjust only the import paths and the output name.
- The dev outputs: `simulate-r6.mjs --dev`, `demonstrations-r6.mjs --dev`, `regress-r5-in-r6.mjs --dev`, and the R5 identity (`buildR5Regression({dev:true})`). Explain every change.

### 2. Scripts, drafts and briefs for D52 (outside the freeze)
- **`scripts/freeze-r6-2.mjs`**, lines 46–47:
  - add `CoachingCore/test/r6-ssctr-r10-fixes.test.mjs` to `fixScopePinnedBy`;
  - add `RUNTIME_DELTA_D52.md` to `ssctrRounds.dossiers`;
  - extend the disclosure to rounds 7–10 and D42–D52, saying that D52 is runtime-only and was checked by the SSCTR at the same hash before this freeze.
- **`scripts/finalize-r6.mjs`**, near lines 35 and 39: entries for `RUNTIME_DELTA_D52.md` and the r10 test file.
- **`scripts/document-r6.mjs`:** the topic test patterns, as in step 1.
- **Drafts and doc edits:** the STRENGTH draft and the small doc edits for D52 (`continuation/README.md`).
- **Judge briefs:** fill the D52 markers in `continuation/engineering-rereview-message.md` and `judge-prompts.md`. Leave the round-11 verdict marker until dispatch.

### 3. SSCTR round 11: a narrow runtime check at `18ec48f3…`
- The round-10 outputs are already copied to `*.r10.*`, byte-identical.
- **Write the dossier**, `reviews/ssctr-dossier/RUNTIME_DELTA_D52.md`, modelled on `RUNTIME_DELTA_D50_D51.md`:
  - what did not change: the policy, and the other runtime files against `reviewed-18ec48f3-r10-source/`;
  - the fix, (A) and (B), mapped to code and tests;
  - the probe Z rerun;
  - questions, if any;
  - the author evidence;
  - the disclosure.
  - **Answer the SSCTR's observation.** `document-r6.mjs` was changed at 20:42 by the runtime author, to add the optional R5 re-review input of `buildR5Regression`. It is a documentation generator, not runtime. List any later script changes too.
- **Write the prompt**, `continuation/ssctr-round-11-prompt.md`, from `ssctr-round-10-prompt.md`:
  - round 11, with the earlier outputs at `.r1`–`.r10`;
  - the diff against `reviewed-18ec48f3-r10-source/`;
  - a new probe file, `reviews/ssctr-probe-runtime-d52-r11.mjs`, with its `.out.json`;
  - re-run S2, Y2 and Z, the round-10 sections A–Y and the suite;
  - re-issue the ten records with a new freeze verdict;
  - the same rules as round 10.
- **Dispatch** the native `sports-science-concurrent-training-reviewer` (`model: opus`, `effort: xhigh`, background) with exactly one task-route JSON. Round 10 took about 75 minutes. Do not touch `CoachingCore/src`, the policy or the tests while it runs.
- **When it returns, verify:**
  - `policyHash`, revision r11 and `runtimeMayBeFrozen`;
  - 10 records;
  - the `.r10` copies are untouched;
  - `reviewedFiles` against the current files.
- **If it says freeze NO, apply the Founder bound** (`FOUNDER_LOOP_BOUND.md`):
  - **Every blocking item new, narrow and runtime-only:** one last cycle (steps 1–3, a round 12 at the same hash). A NO in round 12 closes R6 with a blocker.
  - **Otherwise:** close R6 with an explicit blocker. That covers D52 or its four questions blocking again, a required policy change, or a needed Founder decision.
  - **Closing with a blocker means:**
    - no FREEZE-2, no runtime edit, no further SSCTR round;
    - the blocker goes first in `OPEN_GAPS_R6` and the R7 entry, with its id, the required change, its owner and its evidence;
    - the coaching-quality judge still judges the first evaluation;
    - the steps that need FREEZE-2 are recorded as not run;
    - the verdicts are NOT_READY and `NEXT_ENGINEERING_STEP` is DOMAIN_COACHING_R7;
    - verification is reported as it is.

### 4. FREEZE-2 and evidence (only after the SSCTR says freeze yes)
- `node scripts/freeze-r6-2.mjs`. It refuses unless `ssctr-policy-review.json` binds the current policy hash with `freezeVerdict.runtimeMayBeFrozen === true`. It records the delta against FREEZE-1.
- Produce the official outputs with the real authority: `node scripts/simulate-r6.mjs`, `node scripts/demonstrations-r6.mjs` and `node scripts/regress-r5-in-r6.mjs`.
- Run `node scripts/evaluate-holdout-r6-postfix.mjs` **once**. It writes `holdout/POSTFIX_EVALUATION_FREEZE2.json`, which is challenge reuse, never fresh evidence.
- From here on: no mutation-check script and no runtime edit.

### 5. Independent judges (in parallel)
- **Engineering re-review of FREEZE-2:**
  - a fresh `quality-reliability-engineer` with `continuation/engineering-rereview-message.md` (fill its markers first), its FREEZE-1 report and its probe folder;
  - output: `reviews/quality-engineering-rereview.json/.md`.
- **Coaching-quality judge:**
  - `continuation/judge-prompts.md`, section "COACHING-QUALITY JUDGE";
  - it judges both evaluations: the first is primary, the post-fix rerun secondary;
  - output: `reviews/coaching-quality-holdout-review.json/.md`.
- **R5 reclassification:**
  - `judge-prompts.md`, section "R5 RECLASSIFICATION (after FREEZE-2 …)";
  - output: `reviews/r5-regression-rereview.json/.md`, which `buildR5Regression` reads.

### 6. Deliverables and closure
- Apply the topic-doc drafts and the small doc edits (`continuation/README.md`). Then run `node scripts/document-r6.mjs`, which writes the topic JSONs and `R5_HOLDOUT_REGRESSION_R6.json`.
- **Written by hand:**
  - `PROGRAM_QUALITY_R6.md/json`;
  - `OPEN_GAPS_R6.md/json`;
  - `READINESS_VERDICTS_R6.json`: 18 verdicts, plus the fields `delivery`, `completeAutonomousDefinitionOfDone` and `policyHash`, which finalize uses;
  - `FINAL_REPORT.md`, in Portuguese, covering the 15 points of the continuation request;
  - the `r6/README.md` refresh.
- **`OPEN_GAPS_R6` must include:**
  - **The clinical free-text screen.** It is a heuristic, to be re-reviewed before production, KMP or real athletes. Include the rest of R11 (asking pregnancy and postpartum status again, as structured questions at reviews and returns) and R15 (false positives on "cut back", "cut down" and the face and eye idioms).
  - **Open SSCTR recommendations:**
    - R1, R2, R5 and R8;
    - R9: any completion exemption must be keyed on executed continuous running, declared and reviewed first;
    - R14: after a late restart, state the executed restart runs (tied to G03);
    - R16: a long-run floor in consolidation and the first cold-start weeks, and no new easy level or walk conversion planned into a consolidation week;
    - R17: how a bodyweight exercise resumes after more than 28 days.
  - **G03 (Product/Data):** how sessions dated inside a declared pause count, and whether a run of missed sessions without a declared pause should prompt for a reason.
  - **D49's limits:** sets come back one per executed unreduced week, and a block with any return exposure earns no set, so the boundary set can wait a block.
  - **Product and data questions:**
    - rotation of close variants (the Founder's OB-2 decision versus the SSCTR condition);
    - the privacy scope of learning consent (Product/Data);
    - logged-load plausibility (Data);
    - pound display and pound increments (product, DR-114).
  - **Earlier findings:**
    - the R5 findings F-LEGACY-FLAT, F-H18, F-H21, F-H13, F-H16 and F-H06 (F-H24 is resolved by the append-only conflicts);
    - the holdout author's interface gaps, listed in its manifest;
    - the half-marathon long-run peak below target (for example profile A: 85 of 105 min);
    - intake contradictions accepted in the judge's fuzz;
    - the SKIPPED annotation on a moved missed session;
    - every judge finding.
  - **Scope and validation:**
    - no human, empirical or clinical validation;
    - the scope exclusions;
    - wearable ingestion is not implemented.
- **Then, in order:**
  1. `node scripts/queue-r6.mjs`. It appends OB-2's 3 items plus the final SSCTR round's proposed items; round 10 proposed 10. `CoachingCore/r6/CONFORMANCE_SUPERSESSION_R6.md` says 114→127, which holds only if the final count is 10. Correct it otherwise.
  2. `node scripts/verify-r6.mjs --write`.
  3. Insert-only R6 block in `CURRENT_MISSION.md` and one line in `MISSION_LEDGER.md`.
  4. `node scripts/finalize-r6.mjs`. Its entries need the r10 tests and `RUNTIME_DELTA_D52.md`, added in step 2.
  5. Final checkpoint.

## Readiness stance (do not force READY)
Verdicts follow the independent judges. The KMP prep gate needs every §24 criterion met. Expect `KMP_PRODUCTION_CORE_PREP_READINESS=NOT_READY` unless the coaching judge and the engineering re-review show no fundamental hole. Otherwise `NEXT_ENGINEERING_STEP` stays DOMAIN_COACHING_R7 or an explicit bounded mission.

## Done in sessions 1–3 (for orientation only)
- **Sessions 1–2:**
  - FREEZE-1, the sealed holdout and the single first evaluation;
  - the engineering FAIL and its 23 fixes;
  - R6-POLICY-3, then R6-POLICY-4: D42–D46, R6, R7, R9, R10 and the author-found return-entry fix.
- **Session 3:**
  - D47–D49, R11–R13 and the author-found restart history, leading to R6-POLICY-5;
  - SSCTR round 9, then D50 and D51, runtime-only;
  - SSCTR round 10.
- **Details:** CHECKPOINT resume points 13–16, and the designs as specified in `continuation/CURRENT_TASK.as-of-round-10-dispatch.md`.
