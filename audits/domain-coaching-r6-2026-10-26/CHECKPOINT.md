# R6 continuation checkpoint

Updated by the Claude Code continuation session. Read [HANDOFF_REHYDRATION.md](HANDOFF_REHYDRATION.md) first for the Codex-era state. This file is the running state of the continuation; it records only what exists on disk.

## 2026-10-26 — after the API interruption (resume point 1)

A connection drop interrupted the session after `src/r6-learning.mjs` was written. On resume, every R6 file was present and passed `node --check`; the baseline still differs only in the insert-only OB-2 lines of `CURRENT_MISSION.md` and `MISSION_LEDGER.md` (unchanged since 11:39 local). The historical suite passes 280/280. One inconsistency was fixed: the development-authority helper lived under `test/`, which `node --test` executes as a test file (281 counted); it now lives at `CoachingCore/r6/fixtures/dev-authority.mjs`.

Done (authored by the continuation root; drafts from the Codex workers were the starting point):

- `src/r6-catalogue.mjs` — movement catalogue, competence-aware candidates and same-intent substitutes; no load tables.
- `src/r6-intake.mjs` — onboarding-like canonical intake; no static priority; turns material only on shared days; wearable history as provenance-bearing lower bound; unknowns in four categories; clinical, out-of-scope and ASK separated.
- `r6/PROGRAM_POLICY_R6.json` — ten new/changed envelopes with explicit operational values; awaits independent SSCTR review.
- `src/r6-authority.mjs` — per-boundary activation bound to the exact policy hash; fails closed.
- `src/r6-prescription.mjs` — run and strength prescriptions from effort cues and load modes; validation.
- `src/r6-balanced.mjs` — ordinal interference model, H0–H3 costs, Pareto, lowest worst-case joint harm, ASK only for genuine trade-offs (fixed a lower-demand ranking bug and an H3 asymmetry).
- `src/r6-program.mjs` — cold-start generator refactored into run and strength state machines with ADVANCE/HOLD/REGRESS/EARNED transitions, so adaptation reuses the same projection.
- `src/r6-provenance.mjs`, `src/r6-learning.mjs` — causal time, day precision, duplicate merge, conflict quarantine, corrections, partial/noisy evidence with hysteresis.
- `r6/fixtures/profiles.mjs` — development intakes A–H plus edge profiles (not holdout evidence).

Not yet done: `src/r6-adaptation.mjs`, `src/r6-legacy.mjs`, `src/r6-simulator.mjs`, index exports, R6 tests, R5 regression run, demonstrations A–M, SSCTR review, freeze, fresh holdout, independent reviews, deliverables, verification, verdicts, mission/ledger entries, final disposition.

## Resume point 2 — adaptation engine written

- `src/r6-adaptation.mjs` exists and passes smoke runs: weekly gating (ADVANCE/HOLD/REGRESS/EARNED per run role and per exercise), mid-week gating deferred until the week completes, missed/partial without debt, same-week move only without added interference, performance signals (single vs repeated), local/systemic fatigue, schedule change re-arrangement, unavailable day, double conflict, intent-preserving substitution, goal/event-date re-plan, staged nonclinical return, event-week protection, clinical routing, causal provenance and reference continuation.
- `src/r6-program.mjs` gained staged RETURN mode (run and strength) and an exported `blocksFrom`; consolidation now steps the long run back by two steps instead of referencing history.
- Next: `src/r6-legacy.mjs` (R5-INPUT-1 path with root-cause fixes), `src/r6-index.mjs`, simulator, tests.

## Resume point 3 — legacy path, simulator, tests; SSCTR running

- `src/r6-legacy.mjs`, `src/r6-index.mjs`, `src/r6-simulator.mjs`, `r6/fixtures/trajectories.mjs`, `scripts/ssctr-dossier-r6.mjs` written; `scripts/evaluate-holdout-r6.mjs` adapter clock fixed (latest causal instant of the session day) and accepts development options.
- Policy gained `operational.hybrid` (interference gap thresholds, previously only in code) and `learning.comparablePhaseClasses`; policy hash at SSCTR dispatch `81114d89c2a855294bbea3a677eddd336a364c7a9cf9b04a5401d06a9f2de6c3`. Do not edit the policy while the SSCTR review runs.
- Native SSCTR agent dispatched (background) with the dossier in `audits/domain-coaching-r6-2026-10-26/reviews/ssctr-dossier/`; it was told about later runtime-only changes.
- Tests: `test/r6-intake-program.test.mjs`, `r6-balanced-provenance.test.mjs`, `r6-adaptation.test.mjs`, `r6-r5-regression.test.mjs`, `r6-simulation.test.mjs`. Full suite 342/342. Defects found by tests and fixed: lower-demand ranking, H3 asymmetry, balanced signature ignoring back-to-back order, ledger expiry, earned-span window, regression hysteresis, one-easy-run-per-step, rotation during return, taper not reducing two-repetition sessions.
- R5 holdout development replay (DEV authority): all 24 run without errors; generation fixed for H02/H03/H09/H11/H13/H20/H21/H24; H08 progresses on the third repeated easier run; H16 re-establishes; H19 substitutes. The official R5 regression record must be produced with the real authority after the SSCTR review and freeze.
- Next: demonstrations A–M, R6 holdout interface, simulate/regress/freeze/verify scripts, package aliases; then SSCTR outcome → freeze → fresh holdout author → first evaluation → independent judges.

## Resume point 4 — SSCTR first round answered; delta review running

- SSCTR first round (native agent): 3 APPROVE_WITH_CONDITIONS (LOAD-ESTABLISHMENT, SUBSTITUTION, ROTATION), 7 REVISE; 26 binding defects including a clinical-boundary breach (illness-named pauses given a nonclinical return). Outputs: `reviews/ssctr-policy-review.json`, `ssctr-records.json`, `ssctr-review.md`, probes `reviews/ssctr-probe-*.mjs`.
- Answered as **R6-POLICY-2** (hash `a7570f2e004c87dd7371357525e37090fe7b4cf65f8460ef143bc28e00d7476c`) plus runtime changes; reviewed policy preserved as `reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-81114d89.json`. Response: `reviews/ssctr-dossier/REVISION_R6_POLICY_2.md`; probe reruns in `reviews/ssctr-dossier/revision-probes/`. New module `src/r6-clinical.mjs`.
- Defects found by the author during the rework and fixed: KEEP selected while marked inadmissible; regression hysteresis blind to rebuild gates; misleading interference labels; walk/jog collapsing under the run ceiling; familiar-quality reservation ignoring the week-1 ceiling; ladder restarting below a familiar task; trace basis not naming the decisive comparison.
- Suite 366/366. Dev simulation 14/14 invariants; R5 dev replay 24/24 without errors; demonstrations A–M rebuilt with ten uniform fields.
- Scripts ready: `evaluate-holdout-r6.mjs` (R6-native references, role preference lists), `regress-r5-in-r6.mjs` (raw replay → `r6/R5_HOLDOUT_REPLAY_R6.json`), `simulate-r6.mjs`, `demonstrations-r6.mjs`, `document-r6.mjs` (topic JSONs), `freeze-r6.mjs` (discovers runtime data files), `verify-r6.mjs` (read-only; `--write` → `r6/VERIFICATION.json`). Package defaults point to R6 (`r6/CONFORMANCE_SUPERSESSION_R6.md`).
- Holdout interface updated (`r6/holdout/INTERFACE_ONLY.md`); author brief drafted in the session scratchpad.
- Next: SSCTR delta outcome → (fix + re-review if needed) → freeze → fresh holdout author → seal → single first evaluation → independent judges → official outputs with real authority → deliverables → verification → mission entries → final disposition.

## Resume point 5 — SSCTR rounds 2–3 answered; screen-only round 4 running

- Round 2 (hash 1c5e3844…): 8/10 approved; COLD-START and NONCLINICAL-RETURN held by the clinical screen (D34 clause handling, D35 Spanish); D36 dose key and D37 cost disclosure required before freeze — all fixed (hash 983171ac…).
- Round 3 (hash 983171ac…): same 8/10; screen still missed double negation (D38) and PT/ES falls (D39); R3 strongly recommended — all fixed and R3 adopted (hash d766f0d9…). Free text alone now asks for a structured reason category; the legacy R5 `clinicalReason=false` is mapped to a category.
- Author-found defects fixed in this period: restart→easy run-day jump; long-run oscillation under the share cap (policy semantics amended: the cap holds, never shortens).
- Suite 371/371; dev simulation 14/14 invariants; R5 dev replay 24/24; randomized self-check (~640 programs) clean.
- Next: SSCTR round 4 → freeze → holdout author + engineering judge → official outputs → single first evaluation → coaching and R5 judges → deliverables → verification → closure.

## Resume point 6 — frozen; official outputs; R5 judge done; holdout author and engineering judge running

- SSCTR rounds 4–6: round 4 approved 10/10 with residual D40 (mid-clause without/sem/sin); round 5 answered D41 (time/contrast conditions); round 6 at the final R6-POLICY-2 hash `af2779fe0fc0e0a52f4b6371d3b360996687e57931b9b3feb878e9652f464910`: all ten boundaries APPROVE_WITH_CONDITIONS, freeze yes. Further lexical residuals are an owned open gap (re-review the screen before production, KMP or real athletes). Proposed queue items: `reviews/ssctr-proposed-queue-items.json` (10). Recommendations R1/R2 stay open; R3 adopted.
- Freeze: `CoachingCore/r6/RUNTIME_FREEZE_R6.json`, frozenAt 2026-10-26T18:33:58.846Z, sourceDigest `507f35fc…`, 53 entries. Nothing in the freeze may change from here on; scripts outside the freeze (document/finalize/queue/verify) may.
- Official outputs (real authority): `SIMULATION_RESULTS_R6.json` (14/14 invariants), `DEMONSTRATIONS_R6.json` (A–M), `R5_HOLDOUT_REPLAY_R6.json` (24 cases, 0 errors). Suite 373/373.
- R5 regression judge (independent, `reviews/r5-regression-review.json/.md`): QUALITY_READY_WITH_CONDITIONS; before→after BEST 4→11, ACCEPTABLE 4→10, SUBOPTIMAL 3→0, INSUFFICIENT 6→2, UNSUPPORTED 7→0, CLINICAL_OUT_OF_SCOPE 0→1; no regressions; findings F-LEGACY-FLAT, F-H18-HORIZON-SCOPE, F-H21-LEARNING-NOT-OPERATIVE, F-H24-CONFLICT-FIRST-WINS (P2), H13/H16/H06 (P3).
- `scripts/document-r6.mjs` gained `buildR5Regression` → `r6/R5_HOLDOUT_REGRESSION_R6.json`.
- Running in background: fresh holdout author (seals `r6/holdout/R6_INDEPENDENT_HOLDOUT.json` + `INDEPENDENCE_MANIFEST.json`; week indices are 0-based, clarification recorded in its manifest) and the engineering judge (`reviews/quality-engineering-review.json/.md`).
- Next: seal → `node scripts/evaluate-holdout-r6.mjs` exactly once → coaching-quality judge → document-r6 (real) → PROGRAM_QUALITY / OPEN_GAPS / READINESS_VERDICTS / FINAL_REPORT / README → queue-r6 → verify-r6 --write → insert-only mission and ledger entries → finalize-r6 → checkpoint.

## Resume point 7 — engineering judge FAIL on FREEZE-1; bugfix delta before the single first evaluation

- Independent engineering review (`reviews/quality-engineering-review.json/.md`, probes in `reviews/quality-engineering/`): **FAIL / QUALITY_BLOCKED** on digest `507f35fc…`. Findings: 1 CRITICAL (QRE-R6-01 load units), 7 HIGH (02 logged-load bound, 03 race proximity by days, 04 missing gate defaults to ADVANCE, 05 non-date assessedAt, 06 contradictory interruption facts, 07 clinical lexicon gaps, 08 schedule change validation), 8 MEDIUM (09–16), 7 LOW (17–23).
- Decision (runtime author/orchestrator): the Definition of Done requires known software bugs fixed with regression tests, and the fresh holdout is not sealed yet and has not been read by the runtime author. So the findings are fixed **before** the single first evaluation, as a delta freeze (FREEZE-2) recorded against FREEZE-1. The fixes are driven only by the engineering findings (the judge never read the holdout). The holdout author saw only `INTERFACE_ONLY.md`, which stays byte-identical. The single first evaluation runs on FREEZE-2. FREEZE-1 outputs are archived, not overwritten silently.
- Required after the fixes: an SSCTR delta binding review (some fixes touch reviewed functions or policy semantics), FREEZE-2, official outputs regenerated, an engineering re-review on the new digest, and R5-judge reclassification of changed R5 replay cases.

## Resume point 8 — single first evaluation recorded on FREEZE-1; fix scope pinned

- Holdout sealed by the independent author: 35 cases (11 GENERATE, 24 SEQUENCE, 53 review steps), corpus `49a85b8c…`, authorStartedAt 18:34:51Z (after frozenAt 18:33:58Z), sealedAt 19:20:13Z; manifest flags runtime/outputs not inspected, no engine implementation by the author. Interface gaps it noted are recorded in its manifest (`interfaceGapsNoted`).
- Decision revised (supersedes the "fix before evaluation" plan of resume point 7): the Founder's protocol says no retuning before the first evaluation is recorded. So the single first evaluation ran on the **unchanged FREEZE-1** runtime (53/53 entries verified, no drift): `node scripts/evaluate-holdout-r6.mjs` → `r6/holdout/FIRST_EVALUATION.json`, 35 cases, 0 errors, sha256 `b3d155b63d525325ac94688f403efa073b12698dd342ed43a87093be7a75eb3e`, evaluatedAt ≈19:21Z. Its contents were not inspected by the runtime author.
- Fix scope pinned **before** any corpus exposure: `CoachingCore/test/r6-engineering-fixes.test.mjs` (written 19:20:34Z, one test per QRE-R6-01…23 finding) was authored from the engineering review alone. The holdout author's hand-back, which carries one-line case summaries, arrived after that file was written. FREEZE-2 changes are limited to those findings plus the policy declarations the SSCTR needs for them; nothing from the holdout informs them.
- Sequence from here: implement fixes (GREEN) → full suite → SSCTR delta binding review → FREEZE-2 (`RUNTIME_FREEZE_R6_2.json`, predecessor FREEZE-1) → official outputs regenerated → post-fix rerun of the sealed corpus on FREEZE-2, labelled challenge reuse (`POSTFIX_EVALUATION_FREEZE2.json`, never overwriting the first raw) → engineering re-review on FREEZE-2 → coaching-quality judge classifies the first evaluation (primary) and the post-fix rerun (secondary) → R5 judge reclassifies changed R5 cases.

## Resume point 9 — fixes implemented; SSCTR round 7 running

- FREEZE-1 sources and policy backed up in the session scratchpad (`freeze1/`); FREEZE-1 official outputs archived byte-identical in `audits/.../freeze-1-outputs/` (R5 replay `43b1fdef…` as judged by the R5 judge).
- All 23 QRE findings fixed in `src/r6-{intake,program,adaptation,provenance,clinical,prescription,balanced,catalogue,simulator}.mjs`. Plus one QRE-06-scope fix: a demonstration shorter than the minimum session is not a demonstration. Plus one regression found and fixed during the work: bodyweight logs must remain step evidence.
- Policy **R6-POLICY-3** hash `e9c87e09d35496791c6d6894639652a4c7bd6cbf6f0b01299d57dd7352373f87` (file sha `446e241e…`): semantic declarations only; no envelope magnitude widened; adds `event.raceWindowDays: 6` and `strength.loggedLoadAdoption`. Reviewed R6-POLICY-2 bytes preserved as `reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-af2779fe.json`.
- Tests: 394/394 (21 new in `test/r6-engineering-fixes.test.mjs`; `r6-balanced-provenance.test.mjs` updated to the append-only semantics QRE-14 requires). Dev simulation 14/14, demonstrations A–M, R5 dev replay 24/0 errors and semantically identical to FREEZE-1 (hash-only differences). Author reruns of the judge's probes: fuzz throws 132→3 (non-JSON only), race proximity 0/840, lexicon misses 0, provenance all pass, timezones no deadlock (copies in `reviews/ssctr-dossier/freeze2-author-reruns/`).
- SSCTR round-6 outputs preserved as `*.r6.*`; dossier `reviews/ssctr-dossier/REVISION_R6_POLICY_3.md`; SSCTR round 7 dispatched (native agent, background).
- New scripts: `scripts/freeze-r6-2.mjs` (refuses unless the SSCTR binds the current policy and allows the freeze) and `scripts/evaluate-holdout-r6-postfix.mjs` (once, challenge reuse, checks the first raw unchanged). `verify-r6.mjs` and `finalize-r6.mjs` were taught FREEZE-2, the post-fix rerun and the engineering re-review file (`reviews/quality-engineering-rereview.json`).
- Next: SSCTR verdict → (answer defects if any) → `node scripts/freeze-r6-2.mjs` → official outputs with real authority (simulate, demonstrations, regress) → post-fix rerun → engineering re-review → coaching-quality judge on the first evaluation (primary) and the post-fix rerun (secondary) → deliverables → queue → verify → mission entries → finalize.

## Resume point 10 — SSCTR round 7 answered in part; session handoff

- SSCTR round 7 (native agent) on R6-POLICY-3 `e9c87e09…`: **freeze NO**. REVISE COLD-START, LOAD-ESTABLISHMENT, PLANNED-PROGRESSION, EVENT-TRANSITION; APPROVE_WITH_CONDITIONS the other six. Binding defects D42–D46; non-blocking R5–R10. Answers: day-based event proximity approved; familiar walk/jog start approved in principle (D42 cap); one-increment bound acceptable for stated loads (D44/D45 still needed); widened lexicon accepted inside the owned gap; no blocking ASK for walk/jog-only race preparation once race week and race day match it (D43).
- Implemented after round 7: D42, D43 (with R9 and R10), D46. Tests in `test/r6-ssctr-r7-fixes.test.mjs` (7). Suite **401/401**. Policy is **R6-POLICY-4 interim**, hash `3ae5c6d6…`, not final.
- Pending: D44, D45, R6, R7, the final R6-POLICY-4, then SSCTR round 8. Exact designs and every later step are in **[CURRENT_TASK.md](CURRENT_TASK.md)**.
- Preserved for the next session, since the session scratchpad does not survive:
  - `freeze-1-source/`: FREEZE-1 r6 sources, policy and evaluator, 15 files matching FREEZE-1 hashes;
  - `continuation/`: judge prompts and the engineering re-review message;
  - `reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-e9c87e09.json`: reviewed R6-POLICY-3 bytes, reconstructed and hash-verified.

## Resume point 11 — round-7 answers complete; R6-POLICY-4 final; SSCTR round 8 dispatched

New session (2026-10-26), continuing from CURRENT_TASK without reopening earlier steps.
- **D44**: `advanceStrength` computes the exercise gate before adoption; `loggedLoadDecision(…,{advanced,hint})` refuses an above-plan load unless ADVANCE/EARNED; `loadQuestions` are built after the handler from `decision.gates` (before the week is gated the target criterion is not judged).
- **D45**: an establishment log is `pending` (FROM_LOG, no number, `pendingLoad`, asked) until (a) review `loadConfirmations` (kg/lb, planned convention), (b) a second log within one increment (later exposure, or the same exercise earlier in the same week), or (c) the athlete's load hint in the same convention. A changed pending value always travels in a proposal (`weeklyReview` `pendingMoved`). Return-entry ceiling: the load before the break caps a return log.
- **Author-found** (return path probe, not holdout): every exposure of a return-entry week is at the entry dose, and exercises first set up in it follow the return steps (`buildWeek` within-week state, `advanceStrength`).
- **R6**: `isYes`/`isNo` in `r6-clinical.mjs` (accents ignored, so "sí"); used in adaptation, intake and the legacy path (generation pre-check before the frozen R5 validator, and review). **R7**: lexicon additions; locally negated damage is ASK (`damageMentions`).
- The logged-load bounds and the 75-minute half-marathon materiality threshold are now read from the policy.
- **R6-POLICY-4 final**: hash `1046ad0ef1291068b309e229852b782e8a8f0eee478c3f8aec59facedd80a554`, file sha `2ab7ea45d29cd520ce295ecd942718715edf8089b184cd2810ec130da698241c`. Interim bytes `3ae5c6d6…` were never reviewed (copy only in the session scratchpad).
- Tests **408/408**; `r6-ssctr-r7-fixes.test.mjs` has 14 tests; one existing test updated (`r6-adaptation` "executed as planned → KEEP" now confirms establishment loads via `loadConfirmations`). Mutation check: each new test fails without its fix.
- Dev: simulation 14/14 invariants; demonstrations A–M; R5 dev replay 24/0 errors but **not** semantically identical to the judged FREEZE-1 replay: 8 cases (H01, H07, H08, H10, H12, H14, H17, H22) differ only in the race-day warm-up line (D43(c)). The R5 judge must reclassify them after FREEZE-2.
- SSCTR round-7 probe re-run (author copy in `reviews/ssctr-dossier/policy4-author-reruns/`): 0 violations in every section.
- Round-7 outputs preserved as `reviews/ssctr-*.r7.*` (byte-identical). Dossier: `reviews/ssctr-dossier/REVISION_R6_POLICY_4.md`. SSCTR round 8 dispatched (native agent).
- Next: round-8 verdict → (answer defects if any) → FREEZE-2 (update `freeze-r6-2.mjs` reason first) → official outputs → post-fix rerun → judges → deliverables → closure, as in CURRENT_TASK.

## Resume point 12 — SSCTR round 8 returned: freeze NO (D47–D49); session handoff

**SSCTR round 8** ran on R6-POLICY-4 `1046ad0e…` (native agent, opus/xhigh, ~37 min). It recomputed the hash and the sha, ran `node --test` (408/408) and a new probe, and searched the literature.
- **Freeze verdict: NO.** Blocking items: D47, D48, D49.
- **Dispositions:** REVISE for NONCLINICAL-RETURN and EVENT-TRANSITION; APPROVE_WITH_CONDITIONS for the other eight. The real authority now enables eight boundaries, so event and restart programs return UNSUPPORTED until the next review.
- **Round-7 defects:** D42, D44 and D46 resolved; D43 partly resolved (residual: D47); D45 resolved in mechanism (residual: D48).
- **Adopted:** R6, R7, R9 (half marathon), R10, and the author-found fix except the week after step 2. **New:** R11, R12, R13 (non-blocking). R5 and R8 remain open.
- **The new binding defects:**
  - **D47:** completion race day and negotiation by program history (WALK_JOG or RESTART in any week before the race), stating the longest continuous run reached.
  - **D48:** a pending row's first instruction still says "Use the load you logged last time".
  - **D49:** return weeks earn a block-boundary set, and step 2 comes from the base set count. In 7 of 17 return timelines the sets jump from 2 to 4 or exceed the pre-break dose. This defect predates R6-POLICY-4.
- **Outputs.** Current `reviews/ssctr-*` (revision R6-SSCTR-POLICY-r8). Probe: `reviews/ssctr-probe-delta-policy4-r8.mjs`/`.out.json`. Build script: `ssctr-build-r6-r8.mjs`. Literature: `ssctr-r8-literature.mjs`, `ssctr-evidence/search-r8.json`, `abstracts-r8.json`, `PMC4513221.xml`. The queue proposal has 8 items; the schema validation passes.
- **Verified by the root:** `policyHash` = `1046ad0e…`; `runtimeMayBeFrozen` = false; 10 records; the `.r7` copies are unchanged.

**Saved so nothing is lost** (the session scratchpad does not survive):
- the reviewed R6-POLICY-4 bytes, as `reviews/ssctr-dossier/PROGRAM_POLICY_R6.reviewed-1046ad0e.json` (hash and sha verified);
- `continuation/README.md`, which indexes everything below;
- `continuation/ssctr-round-prompt.md`: the round-8 prompt as a template;
- `continuation/topic-doc-drafts/`: drafts of EVENT_TRANSITION, RUN_PROGRAMMING and STRENGTH_PROGRAMMING (they need D47 and D49 wording);
- `continuation/author-checks/`: the mutation-check scripts and the never-reviewed interim policy `3ae5c6d6…`;
- `continuation/engineering-rereview-message.md` and the coaching brief in `continuation/judge-prompts.md`, updated for rounds 7–8.

**Scripts outside the freeze, already prepared:**
- `freeze-r6-2.mjs`: disclosure of rounds 7–8, the r7 test file and the reviewed hashes;
- `document-r6.mjs`: the FREEZE-2 digest and the topic test patterns;
- `finalize-r6.mjs`: the POLICY_4 dossier and the r7 tests;
- `demonstrations-r6.mjs`: demo B wording for D45 (dev outputs regenerated).

**Runtime state at handoff:**
- **Not modified since the round-8 dispatch:** `CoachingCore/src`, the policy and the tests (408/408).
- **Not run:** no FREEZE-2, no official output, no post-fix rerun, no judge after the engineering FAIL.

**Next:** D47, D48, D49 (and decide R11–R13) → R6-POLICY-5 → SSCTR round 9 → FREEZE-2 → evidence → judges → deliverables → closure, exactly as in **[CURRENT_TASK.md](CURRENT_TASK.md)**.

## Resume point 13 — round-8 defects answered in the runtime; R6-POLICY-5 interim; tests 422/422

Third continuation session (2026-10-26), continuing from CURRENT_TASK step 1 without reopening earlier steps. State verified at start: 408/408, policy `1046ad0e…` equal to the reviewed copy.
- **Reviewed round-8 runtime preserved:** `reviews/ssctr-dossier/reviewed-1046ad0e-source/` (22 files: `src/r6-*.mjs`, `test/r6-*.test.mjs`, MANIFEST with sha256), taken before any edit, so round 9 can diff the delta exactly.
- **D47:** the run state keeps `modeHistory` (WALK_JOG, RESTART; set in `projectWeeks` by `withModeHistory`) and `longestContinuous` (executed easy, long, restart, return runs or a ladder step without walk breaks; `plannedOf` gains `continuousJog`). `raceDayCompletionBasis` → MODE_IN_RACE_WEEK, RETURN_IN_RACE_WEEK, PROGRAM_HISTORY, HALF_MARATHON_LONG_RUN; `eventCompletionItem` builds the item; `finishProposal` recomputes it from every proposal's race-week state (restart or goal change applied by a review). Policy `event.raceDayCompletion.historyModes`.
- **Author-found with D47:** a long-interruption restart clears `achieved` and `longestContinuous` (before: the taper after a restart that exits to EASY used pre-break peaks, e.g. a 50-min taper long run after a 45-min post-restart peak). Policy `return.restartRunHistory`.
- **D48:** `exerciseRow(…,{pending})`: a pending FROM_LOG row reads ramp-up, the pending rule, record the load; never "Use the load you logged".
- **D49:** strength state gains `lastExecutedSets` (last executed count outside a return step and outside a phase reduction), `setCeiling`, `setCap`, `returnInBlock`; the week's planned counts travel as `stateTrace[w].strength.planned` (sets, baseSets, normalSets) so reviews see them. `startStrengthReturn` at moderate and long returns. Step 2 = `returnStepSets` = max(1, min(ceiling−1, entry+1)); phase reductions on top in the steps too; after the steps the cap rises one set per executed unreduced week to the ceiling; above it only through a block with no return-step exposure (ceiling +1). Policy `return.strengthReturnSets`, `return.returnLoadCap`, `strength.setIncreaseAtBlockBoundary`.
- **Interpretation to put to the SSCTR:** the ceiling is the last *unreduced* executed count. In probe-U s4-d14 and s4-d21 the last pre-break week was a consolidation week (2 sets), so the return reaches 3 (the executed development count), and the literal probe check flags "3 above the 2 prescribed".
- **R11** (lexicon + `joinCompounds` for C-section and recém-nascido), **R12** (`easyGate`: with no easy run planned the executed long run gates the conversion; the first converted walk becomes an easy run at the minimum session), **R13** (`projectionGates(week,mode)`): adopted.
- Tests: `test/r6-ssctr-r8-fixes.test.mjs` (14), plus one D48 assertion in the D45 test of `r6-ssctr-r7-fixes.test.mjs` (the SSCTR asked for it there). Suite **422/422**. Mutation check `continuation/author-checks/mutation-check-r8.mjs`: 16 of 16 mutations caught; sources restored byte-identical.
- Scratch rerun of the round-8 probe (not yet the formal author copy): A, B, J, L, M, Q, R 0 violations; P 0 walk/jog- or restart-class racers at effort (completionRuleMismatch 51 is the old rule in the probe); U only the s4 interpretation.
- **Policy:** R6-POLICY-5 written, hash not final until the step-5 work below is done.
- **Next:** CURRENT_TASK step 5 remainder (scripts, dev outputs, R5 identity, formal probe rerun, topic-doc drafts), then step 6 (round-8 copies, dossier, SSCTR round 9).

## Resume point 14 — R6-POLICY-5 final; dossier written; SSCTR round 9 dispatched

- **R6-POLICY-5 final:** hash `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, file sha `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100`. Structured diff against `1046ad0e…`: text only plus the `historyModes` list and three new `return` keys; no numeric value changed.
- **Suite 422/422.** The tests in `r6-ssctr-r8-fixes.test.mjs` are named so that `document-r6.mjs` indexes them; its run pattern now also matches "walk conversion" and "longest continuous run".
- **Dev outputs regenerated on the final policy:** simulation 14/14 invariants; demonstrations A–M; R5 dev replay 24/0 errors. The R5 identity check shows the same 8 cases as round 8, differing only in the race-day warm-up line.
- **Formal author rerun of the round-8 probe:** `reviews/ssctr-dossier/policy5-author-reruns/` (README). Author checks: `continuation/author-checks/author-check-event-return.mjs` and `author-check-restart-taper.mjs`.
- **Scripts updated:**
  - `freeze-r6-2.mjs`: r8 tests in `fixScopePinnedBy`; `1046ad0e` in `reviewedSinceFreeze1`; the POLICY_5 dossier; the disclosure now covers rounds 7–9 and two author-found changes.
  - `finalize-r6.mjs`: the POLICY_5 dossier and the r8 tests.
  - `document-r6.mjs`: the run pattern.
- **Topic-doc drafts** updated for D47, D48, D49, R12, R13 and the restart history. `continuation/README.md` lists the small doc edits still to make at closure.
- **Round-8 outputs** copied to `reviews/ssctr-*.r8.*` (byte-identical). The dossier is `reviews/ssctr-dossier/REVISION_R6_POLICY_5.md`, with 9 questions; question 1 is the s4 reading of the D49 ceiling. The prompt as dispatched is `continuation/ssctr-round-9-prompt.md`.
- **SSCTR round 9 dispatched** (native agent, opus/xhigh, background). Do not touch `CoachingCore/src`, the policy or the tests while it runs.
- **Next:** round-9 verdict → (answer defects if any) → FREEZE-2 → evidence → judges → deliverables → closure, as in CURRENT_TASK steps 7–9.

## Resume point 15 — SSCTR round 9 returned freeze NO (D50, D51); both fixed runtime-only; round 10 (narrow check) dispatched

**SSCTR round 9 at `18ec48f3…`** (native agent, opus/xhigh, ~34 min): **freeze NO**, blocking D50 and D51 (runtime-only bugs present since FREEZE-1).
- **Resolved:** D47, D48 and D49. Q1, the unreduced D49 ceiling, is accepted (the round-8 literal check withdrawn).
- **Records:** all ten APPROVE_WITH_CONDITIONS at `18ec48f3…`. The queue proposal has 10 items.
- **New non-blocking items:** R14 (a late restart statement; tied to G03) and R15 (screen false positives). R5, R8 and R9 stay open.
- **Outputs:** the current `reviews/ssctr-*` (r9) were copied byte-identical to `*.r9.*`. Probe: `ssctr-probe-delta-policy5-r9.mjs`.

**D50:** a long-run step that the share cap holds is no increase.
- `distributeRun` marks `progression.heldBy: 'LONG_RUN_SHARE'`, and `plannedOf` carries `longHeldByShare`.
- In `advanceRun`, a held step does not block the easy and quality steps. If one of them steps, the long-run target waits. The easy guard is unchanged.
- Probe S: flat runs of 4+ weeks 47 → 0; quality runner 0 → 7 steps.
- One-increase check: 0 violations in 554 build-week pairs.
- Side effect, disclosed as dossier question 4: consolidation weeks with the long run 5 minutes under an easy run go from 4 to 18 of 207. A floor would need policy text.

**D51:** the return ends with the exercises in use.
- In `advanceStrength`, once no exercise prescribed in the week is still returning and one has just finished, every remaining return marker is cleared.
- Probe Y: the return ends at week 10, and rotation resumes in both cadences.

**Unchanged:** the policy (hash `18ec48f3…`, sha `a75be1aa…`). Only `r6-program.mjs` changed.

**Preserved:** the round-9 reviewed runtime in `reviews/ssctr-dossier/reviewed-18ec48f3-r9-source/`. I rebuilt `r6-program.mjs` there by undoing the edits on a copy; its sha `f5cba5f3…` matches the SSCTR `reviewedFiles`.

**Tests and checks:**
- `test/r6-ssctr-r9-fixes.test.mjs` (6 tests); suite **428/428**.
- `continuation/author-checks/mutation-check-r9.mjs`: 4 of 4 caught.
- Author checks: `author-check-one-increase.mjs`, `author-check-easy-never.mjs`, `author-check-consolidation-long.mjs`.
- Formal rerun of the round-9 probe: `reviews/ssctr-dossier/r9-author-reruns/`. All sections are clean except V (R14).
- Dev outputs regenerated. R5 identity: the same 8 cases.

**Scripts:**
- `freeze-r6-2.mjs`: the r9 tests, the D50/D51 dossier and the disclosure.
- `finalize-r6.mjs`: the r9 tests and the dossier.
- `document-r6.mjs`: the run pattern now matches "share cap" and "quality ladder".

**Drafts:** RUN (D50) and STRENGTH (D51).

**Dossier:** `reviews/ssctr-dossier/RUNTIME_DELTA_D50_D51.md`, with 4 questions. The prompt is `continuation/ssctr-round-10-prompt.md`.

**SSCTR round 10 dispatched** (background). Do not touch `CoachingCore/src`, the policy or the tests while it runs.

**Next:** the round-10 verdict, then FREEZE-2, evidence, judges, deliverables and closure (CURRENT_TASK steps 7–9).

## Resume point 16 — SSCTR round 10 returned freeze NO (D52); session handoff

**SSCTR round 10 at `18ec48f3…`** (native agent, opus/xhigh, about 75 minutes) was the narrow runtime check of D50 and D51. **Freeze NO**, blocked by **D52**, a runtime-only defect present since FREEZE-1.
- **Integrity.** The SSCTR found the hash and the sha unchanged. Of the 39 files it recorded in round 9, only `r6-program.mjs` changed (`f5cba5f3` → `4227f501`), and the diff touches exactly the four functions named.
- **Resolved:**
  - D50: flat runs of 4+ weeks went from 47 to 0 of 66, the one-increase rule holds in 232 weeks, and the 90/40 quality ladder goes 0 → 7.
  - D51: all 42 returns end with the exercises in use, and rotation resumes in all 25 rotating timelines that have weeks left.
- **Rulings:**
  - **Q1 accepted.** In a held week the easy run may equal the long run, never exceed it.
  - **Q2 confirmed.** One consequence belongs to D52: an exercise first prescribed in the pause-dated session of the entry week.
  - **Q3 accepted.** R14 is a non-blocking open gap tied to G03, to close before any use beyond the offline reference.
  - **Q4 non-blocking**, and became **R16** for the next policy revision. On the larger grid the long run falls below an easy run in 25 of 229 consolidation weeks (5 on the round-9 runtime), with no single-session spike.
- **New, non-blocking:**
  - R16: a long-run floor in consolidation and the first cold-start weeks, and no new easy level or walk conversion planned into a consolidation week.
  - R17: declare the bodyweight case of `strength.resumeAfterDays`.
  - G03 gains a question: whether a run of missed sessions without a declared pause should prompt for a reason.
- **Still open:** R5, R8, R9, R14, R15, and the rest of R11 (asking pregnancy/postpartum status again).
- **Records:** all ten are APPROVE_WITH_CONDITIONS / SUPPORTED_WITH_LIMITS at `18ec48f3…`. LOAD-ESTABLISHMENT, SUBSTITUTION, ROTATION and NONCLINICAL-RETURN list D52 as required before freeze. The real authority reads all ten. The queue proposal has 10 items, and the validator passed.
- **D52, as the SSCTR states it** (the binding text is in `reviews/ssctr-policy-review.json`, R6-LOAD-ESTABLISHMENT `runtimeBinding`; the cases are in probe section `Z_D52`):
  - **(A) A prescription that was not executed establishes nothing.**
    - *Today:* `advanceStrength` (`r6-program.mjs` ~409) creates the exercise state (ESTABLISHED, FROM_LOG, no load) for every prescribed exercise, executed or not. The next exposure is then a FROM_LOG row, "Use the load you logged last time…", with full sets and a progression rule, although nothing was logged.
    - *Seen in:* rotation (db-step-up 1×10, EVERY_2_WEEKS and COACH_DECIDES); a FIXED cold start (goblet squat 3×8 with "Add 2 reps per set"); an equipment-window substitute (goblet squat 3×5); and after a return, an exercise first prescribed in the pause-dated session (2×10), reachable through the D51 clearing.
    - *Required:* a never-performed exercise gets the effort-guided establishment row (establishment set count at RIR ≥ 3, ramp-up, no load, no progression step). A FROM_LOG row exists only with a logged load, pending or adopted.
  - **(B) The 28-day re-establishment clock counts from the wrong exposure.**
    - *Today:* `strengthDose` (~330) computes `(w - ex.lastWeek - 1) * 7 > return.moderateMaxDays`, and `ex.lastWeek` is stamped at prescription (~412).
    - *Effect:* a back squat skipped for five weeks resumes at 4×5 at 82.5 kg after 42 days with the clock at 0, and skipped sessions never grow the clock (Z2). After a return, an accessory last done 35 days earlier counts as 28 (Z3).
    - *Required:* count calendar days from the last executed exposure (the completed-work ledger), for rotation back, the end of a substitution window, skipped sessions and exercises not used during a return.
  - **Then:** probe Z (Z1–Z4) becomes regression tests, followed by a narrow runtime check at the same hash: S2, Y2 and Z, the round-10 sections A–Y, and the suite.
- **Outputs.**
  - The current `reviews/ssctr-*` files (R6-SSCTR-POLICY-r10) were copied byte-identical to `*.r10.*`.
  - Probe: `reviews/ssctr-probe-runtime-d50-d51-r10.mjs` and its `.out.json`.
  - Build script: `ssctr-build-r6-r10.mjs`.
  - Literature: `ssctr-r10-literature.mjs`, `ssctr-evidence/search-r10.json`, `abstracts-r10.json`, `PMC13674372.xml` and `PMC11467040.xml`.
- **Verified by the root after the hand-back:**
  - `policyHash` is `18ec48f3…`, the revision is r10, and `runtimeMayBeFrozen` is false with blocking ["D52"];
  - 10 records are bound to the hash;
  - all 44 `reviewedFiles` sha256 equal the current files;
  - the `.r9` copies are untouched;
  - I recomputed the policy hash and sha, and `node --test` passes 428/428.
- **Preserved before any D52 edit:** `reviews/ssctr-dossier/reviewed-18ec48f3-r10-source/`, 24 runtime and test files with a sha256 MANIFEST. The 19 files the SSCTR listed match its record, and `r6-program.mjs` is `4227f501…`.
- **SSCTR observation answered.** It noted that `CoachingCore/scripts/document-r6.mjs` changed at 20:42, outside the files it reviewed. That was the runtime author: `buildR5Regression` now reads the optional R5 re-review (`r5-regression-rereview.json`). It was written with the R5 RECLASSIFICATION brief (`judge-prompts.md`, 20:42:40), about a minute after the round-10 dispatch (20:41). It is a documentation generator, not runtime. Disclose it in the round-11 dossier.
- **Briefs and index updated:**
  - `continuation/engineering-rereview-message.md` and `judge-prompts.md` now cover round 10 and D52. The D52 fix, round 11 and the R5 expected list are marked `[CHECK AT DISPATCH …]`.
  - `continuation/README.md` lists the D52 doc edits.
- **State at handoff:** `CoachingCore/src`, the policy and the tests are unchanged since the round-10 dispatch. Nothing has been run past this point: no FREEZE-2, no official output, no post-fix rerun, no judge.

**Next:** the D52 fix (runtime only) → tests, mutation check and reruns → the `RUNTIME_DELTA_D52.md` dossier → SSCTR round 11 (narrow, same hash) → FREEZE-2 → evidence → judges → deliverables → closure, as in **[CURRENT_TASK.md](CURRENT_TASK.md)**.

## Resume point 17 — D52 fixed runtime-only; dossier written; SSCTR round 11 dispatched

Fourth continuation session (2026-10-26). The starting state was checked first: `node --test` 428/428, policy hash `18ec48f3…`, and all 24 `src/r6-*` and `test/r6-*` files equal to `reviews/ssctr-dossier/reviewed-18ec48f3-r10-source/MANIFEST.json`.

**D52 (A): a prescription that was not executed establishes nothing.**
- `r6-adaptation.mjs` `performedInWeek` (new) returns the local date each exercise was last performed in the reviewed week.
  - A completed or partial report counts when it lists the exercise with a set.
  - A completed report without details counts for every exercise of its session.
  - Missed, not-reported, pending and conflicted sessions perform nothing.
- `advanceStrength`:
  - a new exercise gets its state only when performed; a loaded one also needs a logged load that is adopted or pending;
  - a re-establishment converts only when performed;
  - a from-log state performed without a usable load is marked `unlogged`.
- `strengthDose`: an `unlogged` state gets the effort-guided establishment row, with the earlier ceiling.
- `buildWeek` no longer creates the within-week from-log state, so later sessions of the week repeat the establishment. The return-entry week keeps the entry dose.

**D52 (B): the clock.**
- `lastWeek` is replaced by `lastPerformed`, a local date taken from reviews, from planned dates in projection, and from a known dose's `observedAt` at intake.
- The resume check is `dayGap(lastPerformed, session date) > 28`. `strengthRowsFor` and `buildWeek` pass the date.

**Author-found (QRE-R6-14 area).** `loggedLoads` read the logs of conflicted rows: a conflicted Monday log confirmed Thursday's establishment as KNOWN. It now skips them.

**Files.**
- `r6-program.mjs` `4227f501` → `8fdadf2f`.
- `r6-adaptation.mjs` `c93f7047` → `d6a1d6fc`.
- `test/r6-ssctr-revision.test.mjs`: the D30 test sets `lastPerformed`.
- `test/r6-ssctr-r10-fixes.test.mjs`: new, 10 tests.
- The diff is `reviews/ssctr-dossier/RUNTIME_DELTA_D52.diff`. Of the 44 files in round 10's `reviewedFiles`, only those 3 differ.

**Evidence (dev authority).**
- Suite **438/438**.
- `continuation/author-checks/mutation-check-r10.mjs`: **11 of 11** caught, sources restored byte for byte (sha256 checked).
- `author-check-resume-clock.mjs`: 160 timelines, 2,222 reviews, 0 violations. All 786 from-log rows issued after reviews are pending. It also reproduces the per-session clock split, which occurs only in a deliberate scenario (6 exercise-weeks).
- `author-check-same-week.mjs`: 3,504 → 0 on the round-10 copy against now.
- The round-10 probe rerun (`reviews/ssctr-dossier/r10-author-reruns/`): 24 of 27 sections byte-identical to the SSCTR's own round-10 output. Z has 0 violations, Y and Y2 differ as explained, and V shows only R14.

**Dev outputs regenerated.**
- Simulation: 14/14 invariants.
- Demonstrations A–M: the same selections in all 13. The changes are week-1 rows under the same-week rule.
- R5 dev replay: semantically identical; the same 8 cases differ from the judged replay.
- Backup copies were taken in the session scratchpad only.

**Scripts and documents.**
- `freeze-r6-2.mjs`: r10 tests, the D52 dossier, disclosure for rounds 7–10.
- `finalize-r6.mjs`: the D52 dossier, the r10 tests, and the R5 re-review entry and judgment.
- `document-r6.mjs`: the STRENGTH runtime lists `performedInWeek`; all 10 new tests are indexed (STRENGTH 9, RETURN 1, SUBSTITUTION 1).
- STRENGTH draft updated.
- `continuation/README.md` updated, with the D52 doc edits as implemented.
- Judge briefs: the D52 markers are filled; the round-11 verdict and official-replay markers are left for dispatch.

**Dossier.** `reviews/ssctr-dossier/RUNTIME_DELTA_D52.md`, with 4 questions:
1. the same-week establishment;
2. a completion report without details;
3. the known-dose clock starting at `observedAt`;
4. the per-session clock split.

**SSCTR round 11 dispatched** (background, native, opus/xhigh). The prompt is `continuation/ssctr-round-11-prompt.md`. Do not touch `CoachingCore/src`, the policy or the tests while it runs.

**Next:** verify the round-11 verdict, then FREEZE-2, evidence, judges, deliverables and closure, as in `CURRENT_TASK.md` steps 4–6. If round 11 finds runtime-only defects, answer them as in steps 1–3.

**Founder bound, received while round 11 runs** ([FOUNDER_LOOP_BOUND.md](FOUNDER_LOOP_BOUND.md), verbatim; insert-only amendment in `TASK_CONTRACT.md`):
- **One more cycle at most**, and only if every blocking item is new, narrow and runtime-only.
- **Anything else closes R6 with an explicit blocker**, with DOMAIN_COACHING_R7 as the next step: D52 failing again, a policy change, a Founder decision, or a NO in that last round.

`CURRENT_TASK.md` step 3 now applies this rule.

## Resume point 18 — SSCTR round 11: D52 resolved, D53 found; the last allowed cycle; round 12 dispatched

**SSCTR round 11 at `18ec48f3…`** (native, opus/xhigh, about 58 minutes) said **freeze NO**, blocked by **D53**.
- **D53** is new and runtime-only. After a performed re-establishment at 2 sets, the next week could be 4 sets, because the block-boundary set came back at once on top of the `priorSets` regain. Probe AH found 120 of 584 such next exposures.
- **D52 resolved.**
- **Conflict filter** accepted.
- **Questions:** Q1 accepted, Q2 and Q3 confirmed, Q4 accepted with the new non-blocking R19.
- **New owned gap R18:** weeks without a gating review keep the projection's assumption. It does not block FREEZE-2, but must close before any use beyond the offline reference. The weekly-review contract is now the last condition of every record.
- **Records:** ten APPROVE_WITH_CONDITIONS. D53 is required in LOAD-ESTABLISHMENT, PLANNED-PROGRESSION and ROTATION. The queue proposal has 10 items.
- **Verified by the root:** revision r11, the hash, 10 bound records, 53 `reviewedFiles` all equal to the current files, the validator passed, and the `.r10` copies are untouched.
- **Preserved:** the outputs were copied byte-identical to `*.r11.*`. The runtime is preserved in `reviews/ssctr-dossier/reviewed-18ec48f3-r11-source/` with a MANIFEST: 25 files, the 22 the SSCTR listed match.

**The Founder bound applied.** D53 is new, narrow and runtime-only, and no Founder decision is needed, so this is **the one last cycle**. A NO in round 12 closes R6 with an explicit blocker and makes R7 the next step.

**The D53 fix**, in `r6-program.mjs` only (`8fdadf2f` → `57973e97`):
- a performed re-establishment sets `regainCap` to its count;
- `strengthDose` prescribes `min(normal, setCap, regainCap)` before the phase reduction;
- the cap rises one set per executed week without a phase reduction, and ends once it can no longer bind (at the larger of `maxSets`, `priorSets` and the current count);
- `startStrengthReturn` clears it.

The new test file is `test/r6-ssctr-r11-fixes.test.mjs`, with 5 tests. The diff is `RUNTIME_DELTA_D53.diff` (12 changed lines).

**Evidence:**
- Suite **443/443**.
- `mutation-check-r11.mjs`: **5 of 5** caught, sources restored.
- The round-11 probe rerun (`r11-author-reruns/`): 31 of 35 sections byte-identical. AH has 0 jumps (was 120). AB, AD and AF change only in the held-back counts.
- `author-check-resume-clock.d53.out.json`: 0 violations.
- Dev outputs: 0 semantic differences from the D52 runtime; R5 identity unchanged (the same 8 cases).

**Scripts and briefs:**
- `freeze-r6-2.mjs`: the r11 tests, the D53 dossier, the disclosure for rounds 7–11 and D42–D53, and the field `weeklyReviewContract` (R18).
- `finalize-r6.mjs`: the D53 dossier and the r11 tests.
- `engineering-rereview-message.md` and `judge-prompts.md`: D53, the weekly-review contract, and a round-12 verdict marker.

**Dossier and prompt:** `reviews/ssctr-dossier/RUNTIME_DELTA_D53.md`, which asks no questions, and `continuation/ssctr-round-12-prompt.md`, the last round, which asks for every remaining blocker to be listed.

**SSCTR round 12 dispatched** (background). Do not touch `CoachingCore/src`, the policy or the tests while it runs.

**Next:**
- **Freeze YES:** FREEZE-2, then steps 4–6.
- **Freeze NO:** close R6 with an explicit blocker (`FOUNDER_LOOP_BOUND.md`). No round 13.

## Resume point 19 — SSCTR round 12 says freeze NO (D53 from-log path, D54): R6 closes with an explicit blocker

**SSCTR round 12 at `18ec48f3…`** (native, opus/xhigh, about 44 minutes), the **last** round under the Founder bound, said **freeze NO**, with D53 and D54 blocking.
- **D53** is resolved for a known-load state (probe AH: 0 of 584, against 120 before). It is **still open on the from-log path**: a pending establishment log, or an unlogged state, gets the same re-establishment row but starts no regain cap (`reestablishes()` requires KNOWN). Probe AI: 48 of 1,224 next exposures too high. Probe AJ: 2 sets, then 4×5.
- **D54 is new.** The "Not done for more than 28 days" row in `strengthDose` returns before the phase reduction, so it ignores the taper, race-week and post-event doses. Probe AK: 70 rows, 2 sets at RIR 3 against 1 set at RIR ≥ 4.
- Both predate FREEZE-1, and both are runtime-only: no policy or Founder decision is needed.
- **Records:** ten APPROVE_WITH_CONDITIONS / SUPPORTED_WITH_LIMITS. Changes are required before freeze in LOAD-ESTABLISHMENT (D53, D54), PLANNED-PROGRESSION (D53), ROTATION (D53) and EVENT-TRANSITION (D54).
- **The SSCTR's next step:** "In R7: fix D53 for every state mode and D54 … then a narrow runtime delta check at hash 18ec48f3 … FREEZE-2 cannot follow from this round."
- **Verified by the root:** revision r12, the hash, 10 bound records, 58 `reviewedFiles` all equal to the current files, the validator passed, 10 queue items proposed, and the `.r11` copies untouched. The outputs were copied byte-identical to `*.r12.*`.

**Founder bound spent** (`FOUNDER_LOOP_BOUND.md`). R6 **closes with an explicit blocker**, and DOMAIN_COACHING_R7 is next. From here on:
- no runtime edit;
- no SSCTR round 13;
- no FREEZE-2, so no post-fix rerun, no engineering re-review of FREEZE-2 and no R5 reclassification. All of these are recorded as not run.

**The blocked closure, in order:**
1. The coaching-quality judge on the first evaluation, the primary record bound to FREEZE-1. It is independent and needs no FREEZE-2.
2. The topic docs and the small doc edits, with a status note on D53, D54 and the refused freeze.
3. The hand-written deliverables:
   - `PROGRAM_QUALITY_R6`;
   - `OPEN_GAPS_R6`, with the blocker first and the R7 entry;
   - `READINESS_VERDICTS_R6`;
   - `FINAL_REPORT.md`;
   - the `r6/README` refresh.
4. `document-r6.mjs`.
5. `queue-r6.mjs`.
6. Insert-only mission and ledger lines.
7. `verify-r6.mjs --write`, which reports honestly the checks that fail without FREEZE-2.
8. `finalize-r6.mjs`, adapted so that the FREEZE-2 entries are recorded as not run.

**Closure progress (resume point 19, continued):**
- **Coaching-quality judge** dispatched on the first evaluation only (`continuation/coaching-judge-first-evaluation-prompt.md`), a fresh quality-reliability-engineer, opus/xhigh, in the background. It must not run the holdout through the current runtime and must not read `CoachingCore/r6/*.md`.
- **Topic docs applied:**
  - EVENT, RUN and STRENGTH were copied from the drafts, each with a status note on the closure (D53, D54, the freeze refused);
  - SUBSTITUTION, RETURN, COLD_START and ADAPTIVE each gained a section "After FREEZE-1 (SSCTR rounds 7–12; not frozen)" with the doc edits as implemented and the weekly-review contract.
- **Scripts adapted for the blocked closure:**
  - `finalize-r6.mjs` records the FREEZE-2-only entries as not run (`FREEZE2_ONLY`), and the disposition carries `blocker` and `freeze2`;
  - `document-r6.mjs` labels each topic JSON with `freezeRevision` and `runtimeState`.
- **`OPEN_GAPS_R6`** is generated by `continuation/closure/build-open-gaps.mjs`: blocker first, then the R7 entry. Rerun it after the judge returns, so that its findings are included.
- **Queue preconditions verified read-only:** 114 items; the OB-2 items match this exact sha; 10 SSCTR items; no duplicates.

**Remaining:**
1. Verify the judge's outputs.
2. Rerun `build-open-gaps.mjs`.
3. Write `PROGRAM_QUALITY_R6.md/json`, `READINESS_VERDICTS_R6.json` (with `delivery`, `completeAutonomousDefinitionOfDone`, `policyHash` and `blocker`), `FINAL_REPORT.md` in Portuguese, and the `r6/README` refresh.
4. Run `document-r6.mjs` and `queue-r6.mjs`.
5. Add the mission and ledger lines.
6. Run `verify-r6.mjs --write` and `finalize-r6.mjs`.

## Resume point 20 — R6 CLOSED with an explicit blocker (2026-10-27)

**Coaching-quality judge** (fresh quality-reliability-engineer, opus/xhigh, about 36 minutes), first evaluation only. The verdict is **QUALITY_BLOCKED**.
- **Integrity:** matches. Corpus `49a85b8c…`, first raw `b3d155b6…`, FREEZE-1 `507f35fc…`, policy `af2779fe…`.
- **Cases:** 4 BEST / 14 ACCEPTABLE / 9 SUBOPTIMAL / 1 INSUFFICIENT / 4 UNSUPPORTED / 2 CLINICAL / 1 CORPUS_ERROR (H20), of 35.
- **Programs:** 7 / 13 / 8 / 1 / 1, of 30.
- **Holes:** no architecture hole; core-semantics defects.
- **KMP criteria:** 1 MET (return), 7 PARTLY_MET, 2 NOT_MET.
- **Findings:** 19 (CQ-R6-01…19), 6 of them HIGH.
- **No clinical failure.**
- The judge rebuilt FREEZE-1 for counterfactuals and ran no holdout case on the current runtime.

**Deliverables:**
- `PROGRAM_QUALITY_R6.md/json` and `READINESS_VERDICTS_R6.json`, from `continuation/closure/build-closure-deliverables.mjs`: 16 NOT_READY, RETURN_AFTER_PAUSE_READINESS=PARTIAL, KMP=NOT_READY, NEXT=DOMAIN_COACHING_R7, delivery CLOSED_WITH_EXPLICIT_BLOCKER;
- `OPEN_GAPS_R6.md/json`, from `build-open-gaps.mjs`: 55 items, with the blocker first;
- `FINAL_REPORT.md`, in Portuguese, covering the 15 points;
- the `r6/README` status;
- the topic JSONs, from `document-r6.mjs` (non-dev; `runtimeState` NOT_FROZEN_AFTER_FREEZE_1);
- `R5_HOLDOUT_REGRESSION_R6.json`, identical to the judged FREEZE-1 replay.

**Queue:** 114 → 127.
- **The incident:** the first run of `queue-r6.mjs` wrote the queue and then failed its byte-prefix check. The check was wrong, because `queue_revision` precedes `items`.
- **The recovery:** the original was restored byte-exact (sha `b68f9784…`, equal to the OB-2 record), and the check now reconstructs the original and compares the sha before writing.
- **The rerun:** 13 items appended, the earlier items byte-identical, funding NOT_DECLARED.

**Mission files:** insert-only. `CURRENT_MISSION.md` has a new closure block (DCR6-20261027-closed-blocked-r1) and `MISSION_LEDGER.md` a new line (DCR6-CLOSE-20261027-r1), with the prefixes intact and 2 CRLF lines each, unchanged.

**`VERIFICATION.json`:** 10/14. The 4 failures are expected consequences of the blocker:
- runtime-freeze (drift against FREEZE-1);
- r5-regression and simulation (the official outputs stay on the FREEZE-1 policy);
- independent-reviews (the engineering re-review was not run).

**`FINAL_DISPOSITION.json`** and **`DELIVERABLE_INDEX_R6.json`:** 65 entries, 61 present, 4 recorded as not run because they need FREEZE-2.

**R6 is closed.**
- R7 is not started: it needs its own Founder-authorized mission definition.
- R6 no longer holds the OB-2 doc corrections. Applying them is the OB-2 session's task, not R6's.
