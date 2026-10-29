# DOMAIN_COACHING_R6 — current task (continuation handoff)

Updated 2026-10-26 by the second Claude Code continuation session, at the Founder's request, after SSCTR round 8 returned. A new session continues **exactly from here**. Do not reopen finished work.

Read in this order:
1. this file;
2. the latest resume points of [CHECKPOINT.md](CHECKPOINT.md) (resume points 11 and 12);
3. [continuation/README.md](continuation/README.md), which lists the saved drafts, prompts and author checks.

Read the Founder's requests ([FOUNDER_REQUEST.md](FOUNDER_REQUEST.md), [FOUNDER_CONTINUATION_REQUEST.md](FOUNDER_CONTINUATION_REQUEST.md)) only for the rules, the deliverable list (§25) and the verdicts (§26).

## Rules that still bind
- **Commands.** Never run `npm run verify` or any `verify-r*` historical script; they regenerate closed evidence. `node scripts/verify-r6.mjs` is the R6 verifier.
- **Mission files.** `CURRENT_MISSION.md` and `MISSION_LEDGER.md` are insert-only.
- **Hands off.** Do not edit `product/` or `canon/`; the R6 baseline binds them. No UI, Figma, KMP, production or real-athlete plans.
- **Parallel work.** Preserve the OB-2 work. OB-2's 3 queue items are appended by `scripts/queue-r6.mjs` at closure.
- **Independence.** The worker is never the judge. Every agent dispatch carries exactly one `<task-route>{…}</task-route>` JSON.
- **Language.** Status messages to the Founder are in Portuguese. Topic `.md` deliverables are in English. `FINAL_REPORT.md` is in Portuguese.
- **Holdout integrity.** Never read `CoachingCore/r6/holdout/R6_INDEPENDENT_HOLDOUT.json` or `FIRST_EVALUATION.json` while changing the runtime. Never re-run the first evaluation. The first raw is immutable.
- **Mutation-check scripts** (`continuation/author-checks/`) temporarily rewrite `CoachingCore/src`. Run them only when no judge or probe is reading the runtime, and never after FREEZE-2.

## Where things stand

| Item | State |
|---|---|
| FREEZE-1 | `CoachingCore/r6/RUNTIME_FREEZE_R6.json`, digest `507f35fc…`. Sources preserved byte-identical in `freeze-1-source/`; official outputs in `freeze-1-outputs/`. |
| Fresh holdout | Sealed by an independent author: 35 cases, corpus `49a85b8c…`, manifest flags clean. |
| **First evaluation** | Ran **once** on unchanged FREEZE-1: `CoachingCore/r6/holdout/FIRST_EVALUATION.json`, sha256 `b3d155b63d525325ac94688f403efa073b12698dd342ed43a87093be7a75eb3e`, 35 cases, 0 errors. The runtime author has **not** inspected its contents. It is the primary record. |
| Engineering review of FREEZE-1 | **FAIL**, 23 findings QRE-R6-01…23 (`reviews/quality-engineering-review.json`). All fixed. Scope pinned by `CoachingCore/test/r6-engineering-fixes.test.mjs`. |
| SSCTR round 7 (R6-POLICY-3 `e9c87e09…`) | Freeze NO; D42–D46 binding. Outputs preserved as `reviews/ssctr-*.r7.*`. |
| Answered (sessions 1 and 2) | **D42**, **D43**, **D46**, **R9** and **R10** (session 1); **D44**, **D45**, **R6**, **R7** and one author-found return-entry fix (session 2). The logged-load bounds and the 75-minute half-marathon threshold are now read from the policy. Dossier: `reviews/ssctr-dossier/REVISION_R6_POLICY_4.md`. Tests: `CoachingCore/test/r6-ssctr-r7-fixes.test.mjs`, 14. |
| Policy now | **R6-POLICY-4**, hash `1046ad0ef1291068b309e229852b782e8a8f0eee478c3f8aec59facedd80a554`, file sha `2ab7ea45d29cd520ce295ecd942718715edf8089b184cd2810ec130da698241c`. Reviewed in round 8. Its bytes are preserved as `reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-1046ad0e.json` (hash and sha verified; step 0 done). |
| **SSCTR round 8 (R6-POLICY-4 `1046ad0e…`)** | **Freeze NO.** REVISE: NONCLINICAL-RETURN (D49) and EVENT-TRANSITION (D47). APPROVE_WITH_CONDITIONS: the other eight; LOAD-ESTABLISHMENT still needs D48 before freeze, and PLANNED-PROGRESSION shares D49. **Binding: D47, D48, D49.** Resolved: D42, D44, D46. D43 is partly resolved (now D47); D45 is resolved in mechanism (now D48). Adopted: R6, R7, R9 (half marathon), R10 and the author-found fix (except the week after step 2, which is D49). New non-blocking recommendations: R11, R12, R13. R5 and R8 remain open. The queue proposal now has 8 items. Round-8 outputs are the current `reviews/ssctr-*` files; the probe is `reviews/ssctr-probe-delta-policy4-r8.mjs` and its `.out.json`. The real authority now enables eight boundaries, so event and restart programs return UNSUPPORTED until the next review. |
| Suite | `node --test` in `CoachingCore`: **408/408**. |
| R5 regression | The dev replay differs from the judged FREEZE-1 replay in 8 cases (H01, H07, H08, H10, H12, H14, H17, H22), only in the race-day warm-up line (D43(c)). The R5 judge reclassifies the changed cases after FREEZE-2. Re-check after D47; it may change legacy race days too. |
| Docs | **Drafts** written against `1046ad0e…`: `continuation/topic-doc-drafts/` for EVENT_TRANSITION, RUN_PROGRAMMING and STRENGTH_PROGRAMMING. They need D47 and D49 wording before they are applied. **Small edits** to RETURN_ENGINE, ADAPTIVE_COACHING and COLD_START are listed in `continuation/README.md`. The other topic docs are current for FREEZE-2. |
| Scripts prepared outside the freeze | `freeze-r6-2.mjs`: the disclosure, the r7 test file and the reviewed hashes. `document-r6.mjs`: the FREEZE-2 digest and the topic test patterns. `finalize-r6.mjs`: the POLICY_4 dossier and the r7 tests. `demonstrations-r6.mjs`: demo B wording for D45. `continuation/engineering-rereview-message.md` and the coaching brief in `judge-prompts.md`: rounds 7–8. |

## Next steps, in order

### 0. Preserve the reviewed round-8 policy bytes — done
`reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-1046ad0e.json` holds the reviewed bytes: hash `1046ad0e…`, file sha `2ab7ea45…`, both verified. The live policy may now be edited.

> **Third session (2026-10-26):**
> - Steps 1–6 are done. SSCTR round 9 (R6-POLICY-5 `18ec48f3…`) resolved D47–D49 but returned freeze NO on D50 and D51.
> - Both are fixed runtime-only; the policy hash is unchanged. The dossier is `reviews/ssctr-dossier/RUNTIME_DELTA_D50_D51.md`.
> - An SSCTR **round 10** narrow runtime check is dispatched.
> - See CHECKPOINT resume points 13–15. The reviewed round-8 runtime is preserved in `reviews/ssctr-dossier/reviewed-1046ad0e-source/`. Suite 422/422; mutation check `continuation/author-checks/mutation-check-r8.mjs` 16/16.

### 1. D47 (EVENT-TRANSITION): completion race day and negotiation by program history — done
Code: `r6-program.mjs` `raceDayCompletion`, `buildWeek` (race day) and the `EVENT_AMBITIOUS_FOR_CURRENT_RUNNING` item in `generateProgram`.
- **(a) Completion trigger.** Race day is a completion prescription, and the item is emitted with both options, whenever the athlete was in WALK_JOG or RESTART mode in **any week of this program before the race**. That covers the starting class and a restart applied by a review. The history must travel in the run state (for example a flag kept through mode changes, also set by `returnAfterPause` when it applies RESTART), so that reviews and reprojections see it.
- **(b) The stated run.** The item states the longest continuous run the plan reaches by race week: the larger of the achieved long and easy runs, or the continuous ladder step. It is never "0 minutes" when runs were reached.
- **(c) Declaration.** Declare both in `operational.event.raceDayCompletion`. No exemption applies by default. Any event-specific exemption (like the half-marathon threshold) must be declared and reviewed.
- **(d) Tests.** Add the probe-C cases as regression tests: novice 10K in 12 weeks, below-minimum 10K in 12 weeks, restart 10K in 6 weeks, and the half-marathon "longest run 0 minutes" detail. The SSCTR's probe P covers 51 of 360 programs (24 walk/jog-class and 27 restart-class 10K racers); see `ssctr-probe-delta-policy4-r8.mjs` for the inputs.

### 2. D48 (LOAD-ESTABLISHMENT): the pending row instructs effort-guided selection only — done
- **The problem.** `r6-prescription.mjs` `exerciseRow` gives a FROM_LOG row the first instruction "Use the load you logged last time for this exercise", even when the load is pending confirmation (`PENDING_RULE` in `strengthDose`).
- **The fix.** Pass a pending flag from `strengthDose` through `strengthRowsFor` to `exerciseRow`. That covers the normal FROM_LOG branch and the return step-2 pending branch. A pending row states only effort-guided selection, as at establishment: ramp up in the smallest increments, stop at the reserve shown. It never tells the athlete to use the logged load.
- **Test.** Add the assertion to the D45 test in `test/r6-ssctr-r7-fixes.test.mjs`. No policy change is needed.

### 3. D49 (NONCLINICAL-RETURN, shared with PLANNED-PROGRESSION): return sets — done
Code: `r6-program.mjs` `advanceStrength` (`blocksDone`, `priorSets`) and `strengthDose` (return step 2 and the first weeks after the return); `returnAfterPause` in `r6-adaptation.mjs`.
- **(a) No block credit from return weeks.** Return-entry and return-step exposures never count toward a block-boundary set increase. Today an exposure in the last week of a development block, often a consolidation week, is credited as a completed block.
- **(b) Sets come back one at a time.** Step 2 must not come from the base set count. After the return steps, the set count returns to the last executed pre-break set count at most one set per executed week, with consolidation and taper reductions applied on top. It goes above that count only through a block completed with non-return executed exposures. The existing `priorSets` mechanism (QRE-R6-17) can carry the pre-break count, set at return start.
- **(c) Declaration.** Declare all of this in `operational.return`, together with the load cap as the runtime applies it: during the return steps the cap is the current return reference, meaning the adopted entry load, otherwise the load before the break.
- **(d) Tests.** Add the probe-U timelines s1-d35, s3-d21 and s5-d14 as regression tests (inputs in `ssctr-probe-delta-policy4-r8.mjs`, section U). Example of the defect: s1-d35 goes 3 sets before the break, then 1, 2 and 4.

### 4. Non-blocking recommendations: decide, then record — done (R11, R12, R13 adopted; R5, R8 stay open; pregnancy/postpartum re-asking goes to OPEN_GAPS)
- **R13.** `projectionGates` maps RESTART and RETURN sessions of any role to the EASY gate, as `weeklyGates` does, so that a return with a single long-run day completes in projection. Cheap; adopting it is recommended.
- **R12.** When every chosen easy day is a walk, the walk-to-run conversion can never happen. Either gate the conversion on the executed long run when no easy session is planned, or say in the negotiation that conversion needs an easy run.
- **R11.** Lexicon residuals: birth-related words, assault, procedures, stings and burns, the hand body parts and "bruised"; plus re-asking pregnancy and postpartum at reviews and returns. This is the SSCTR's owned gap. Adopt it if cheap; otherwise it goes to OPEN_GAPS.
- Record each decision in the next dossier. R5 and R8 stay open gaps.

### 5. R6-POLICY-5 — done
- Declarations for D47 and D49, plus any adopted R12 or R13; extend `revisionNote`; recompute the hash; keep `node --test` green.
- Put the tests in a new file `test/r6-ssctr-r8-fixes.test.mjs`. Add the file to `finalize-r6.mjs` and to the `fixScopePinnedBy` list in `freeze-r6-2.mjs`, and add `1046ad0e…` to `reviewedSinceFreeze1` there. Extend its disclosure to round 9.
- Re-run the dev outputs (`simulate-r6.mjs --dev`, `demonstrations-r6.mjs --dev`, `regress-r5-in-r6.mjs --dev`) and the R5 identity check (`buildR5Regression({dev:true})`).
- Re-run the SSCTR's round-8 probe as author material: copy it under `reviews/ssctr-dossier/`, adjusting only the import paths, the output name and the expected hash.
- Mutation-check the new tests.
- Update the topic-doc drafts for D47 and D49.

### 6. SSCTR round 9 — round-8 copies and dossier done; dispatched (prompt: `continuation/ssctr-round-9-prompt.md`)
- Copy the round-8 outputs to `*.r8.*`: `ssctr-policy-review`, `ssctr-records`, `ssctr-review.md`, `ssctr-proposed-queue-items`, `ssctr-evidence-manifest`, `ssctr-schema-validation`. Check that the copies are byte-identical.
- Write `reviews/ssctr-dossier/REVISION_R6_POLICY_5.md`. Follow the structure of `REVISION_R6_POLICY_4.md`: item → boundary → policy key → runtime → tests; the questions; the author evidence; the disclosure.
- Dispatch the native `sports-science-concurrent-training-reviewer` with `continuation/ssctr-round-prompt.md` (`model: opus`, `effort: xhigh`). Answer any new defects the same way.

### 7. FREEZE-2 and evidence (only after the SSCTR says freeze yes)
- Run `node scripts/freeze-r6-2.mjs`. It refuses unless the SSCTR review binds the current policy and allows the freeze, and it records the delta against FREEZE-1.
- Produce the official outputs with the real authority: `node scripts/simulate-r6.mjs`, `node scripts/demonstrations-r6.mjs`, `node scripts/regress-r5-in-r6.mjs`.
- Run `node scripts/evaluate-holdout-r6-postfix.mjs` **once**. It writes `holdout/POSTFIX_EVALUATION_FREEZE2.json`: challenge reuse, never fresh evidence.

### 8. Independent judges
- **Engineering re-review of FREEZE-2.** Dispatch a fresh `quality-reliability-engineer` with `continuation/engineering-rereview-message.md` (already updated for rounds 7–8; add the round-9 changes), its FREEZE-1 report and its probe folder. Output: `reviews/quality-engineering-rereview.json/.md`.
- **Coaching-quality judge.** Use `continuation/judge-prompts.md`, section "COACHING-QUALITY JUDGE (after FREEZE-2 and the post-fix rerun)". It classifies the first evaluation (primary) and the post-fix rerun (secondary). Output: `reviews/coaching-quality-holdout-review.json/.md`.
- **R5 regression.** `buildR5Regression` (in `scripts/document-r6.mjs`) compares each case with the replay judged on FREEZE-1. Ask the R5 judge (`judge-prompts.md`, R5 section) to reclassify every changed case; at least the 8 race-day cases above.

### 9. Deliverables and closure
- Apply the topic-doc drafts and the small doc edits. Then run `node scripts/document-r6.mjs`: it writes the topic JSONs and `R5_HOLDOUT_REGRESSION_R6.json`.
- **Written by hand:**
  - `PROGRAM_QUALITY_R6.md/json`;
  - `OPEN_GAPS_R6.md/json`;
  - `READINESS_VERDICTS_R6.json`: 18 verdicts, plus the fields `delivery`, `completeAutonomousDefinitionOfDone` and `policyHash`, which finalize uses;
  - `FINAL_REPORT.md`: Portuguese, covering the 15 points of the continuation request;
  - the `r6/README.md` refresh.
- **`OPEN_GAPS_R6` must include:**
  - the clinical free-text screen as a heuristic, re-reviewed before production, KMP or real athletes, now including R11;
  - SSCTR R1, R2, R5, R8, plus R12 and R13 if not adopted;
  - rotation of close variants (Founder OB-2 decision versus the SSCTR condition);
  - learning-consent privacy scope (Product/Data);
  - logged-load plausibility (Data);
  - the R5 findings F-LEGACY-FLAT, F-H18, F-H21, F-H13, F-H16 and F-H06 (F-H24 is resolved by the append-only conflicts);
  - the holdout author's interface gaps (in its manifest);
  - pound display and pound increments (product, DR-114);
  - the half-marathon long-run peak below target (for example profile A: 85 of 105 min);
  - intake contradictions accepted in the judge's fuzz;
  - the SKIPPED annotation on a moved missed session;
  - no human, empirical or clinical validation;
  - the scope exclusions;
  - wearable ingestion not implemented;
  - every judge finding.
- **Then, in order:**
  1. `node scripts/queue-r6.mjs`. It appends OB-2's 3 items plus the SSCTR's final proposed items (round 8 proposed 8; use the final round's count). Fix the comment in that script that says "ten". Update the queue count in `CoachingCore/r6/CONFORMANCE_SUPERSESSION_R6.md` to 114 + 3 + the final SSCTR count; it currently says 114→127.
  2. `node scripts/verify-r6.mjs --write`.
  3. Insert-only R6 block in `CURRENT_MISSION.md` and one line in `MISSION_LEDGER.md`.
  4. `node scripts/finalize-r6.mjs`. Add `REVISION_R6_POLICY_5.md` and `r6-ssctr-r8-fixes.test.mjs` to its entries first.
  5. Final checkpoint.

## Readiness stance (do not force READY)
Verdicts follow the independent judges. The KMP prep gate needs every §24 criterion met. Expect `KMP_PRODUCTION_CORE_PREP_READINESS=NOT_READY` unless the coaching judge and the engineering re-review show no fundamental hole. Otherwise `NEXT_ENGINEERING_STEP` stays DOMAIN_COACHING_R7 or an explicit bounded mission.
