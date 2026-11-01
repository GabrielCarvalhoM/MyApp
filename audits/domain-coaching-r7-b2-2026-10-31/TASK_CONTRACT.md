# DOMAIN_COACHING_R7-B.2 — task contract

Contract **R7B2-CONTRACT-r1** · 2026-10-31 America/Sao_Paulo · branch `claude/domain-coaching-r7-b2`, worktree `.claude/worktrees/domain-coaching-r7-b2`, created by the agent runtime from `033f3003ecc31e8514ba26826433b006ce135b03` (the AGENT_EXECUTION_RUNTIME_V1 closure on top of the R7-B.1 closure). Founder authority: the direct [request](FOUNDER_REQUEST.md). Sessions run under `tools/agent-runtime/`; this contract is what every later session reads first.

## 1. Objective and boundary

**Goal.** Close QE-R7B1-04 with the smallest correct runtime change: whenever a review's own input requires the clinical safety screen, that clinical route takes precedence over R7-A's late-evidence question and every other nonclinical re-entry question, while valid R7-A late-evidence behaviour and all R7-A, R7-B0, R7-B and R7-B.1 behaviour stay as they are.

**Baseline (verified at U1).**
- R7-B.1 is CLOSED NOT_READY at `2c6cb931ccc6ad42964db89c33235ab4b0bfa52c`, with one blocker, QE-R7B1-04 ([handoff](../../CoachingCore/r7/b1/R7B1_CLOSURE_HANDOFF.md)).
- The runtime under review is **R7B1-FREEZE-2**: record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json` (sha256 `e75a2799…`), commit `146ebb8`, source `f54e5c03…`, manifest `980d8301…`, 114 files, 786 tests.
- The mission base `033f300` descends from `2c6cb93`. `git diff 2c6cb93 033f300 -- CoachingCore` is empty: the runtime infrastructure above it does not touch Coaching Core.
- `node CoachingCore/scripts/verify-r7b1.mjs` (read-only, without `--tests`) gives 24/24 PASS at `033f300`. The suite count is confirmed in U2, after `npm ci`.

**IMPLEMENTATION_AUTHORIZED = SHADOW_REFERENCE_RUNTIME** (`CoachingCore/`, offline synthetic Node runtime).

**Not authorized:**
- R7-C.
- Reopening R7-B, R7-B0 or R7-B.1, or revisiting their closed blockers.
- The routed R7-B.1 minors: SSCTR F12, F13 and F14, QE-R7B1-02 and -03, QR7B1-06, and the observations. The R7-B backlog.
- Redesigning the intake or state machine, or rewriting R7-A.
- Cleanup, new architecture or catalogue expansion.
- Product, Canon, UI, Figma, KMP, iOS, HealthKit/WorkoutKit, backend, Growth or production effects.
- Merges.

## 2. Authority

1. **Immutable:**
   - everything R7-B.1 §2.1 made immutable: R7B0-CATALOG-2 (`ceee276a…`), its schema and foundation, the 13 B0 SSCTR r2 records, R6-POLICY-5 (`18ec48f3…`) and the R7-A residual-authority freeze record;
   - every closed mission's evidence, including R7-B.1's freeze records, verifications, reviews and probe outputs;
   - the R7B1-SSCTR-r2 records;
   - the human revalidation queue (230 items). It is touched only if an SSCTR review approves new prescriptive records, which is not expected.
2. **Authorities the fix follows** (no new policy):
   - B0-C06 condition 8 (the clinical screen first) and SSCTR D08: the invariant **clinical-screen-first**.
   - QE-R7B1-01 (R7-B.1): a clinical route the handler takes is the decision, with no proposal, whatever block choice the review carries.
   - R7-A final I6 (late evidence; confirmation-first) for every review that carries no clinical signal.
   - The residual authority closure (QE-R7ADA-01): the factual state is computed and kept; a clinical route proposes nothing (`withFactualReplan`).
   - CLAUDE.md: clinical judgment remains CLINICAL_HUMAN_REQUIRED; unknown eligibility is ASK, never clearance or assumed disease.
3. **The handlers' existing clinical screens are the only clinical interpretation.** These are `exerciseSubstitution` (`src/r6-adaptation.mjs:542–543`: pain or injury reported as yes, or a free text the existing `screenInterruptionReason` classes CLINICAL) and `returnAfterPause` (`:1259–1260`, the interruption-reason screen). No new keyword, flag, threshold or clinical reading.

## 3. Defect, as grounded at U1 (bytes of `033f300` = FREEZE-2)

- **The defect.** `evaluateProgram` decides with `decide=c=>(kind!=='RETURN_AFTER_PAUSE'&&staleReturn(c))||(HANDLERS[kind]??weeklyReview)(c)` (`src/r6-adaptation.mjs:359`). During a return's re-entry week, after a late report of training before the break, `staleReturn` (`:1245–1251`) returns its confirmation ASK before the handler runs. The substitution's clinical screen (`:543`) is therefore never reached.
- **Reproduction.** The R7-B.1 Engineering recheck reproduced it on FREEZE-2 bytes, in `audits/domain-coaching-r7-b1-2026-10-31/reviews/engineering/recheck/probes/k6-stale-return-clinical.mjs` and `k6b-stale-return-two-step.mjs` (recorded outputs in `out/`):
  - `substitution-pain` → ASK;
  - `substitution-pain+ladder-choice` → the block-choice ASK;
  - `substitution-pain+unrecognised-choice` → ASK;
  - the two-step K6b, with the late report in one review and the pain alone in a later review of the same re-entry week → ASK.
  - Controls: `substitution-pain-no-late` → CLINICAL_HUMAN_REQUIRED; `return-illness` → CLINICAL_HUMAN_REQUIRED.
- **Same-class candidates, not yet reproduced (U2 checks each).** Each is a nonclinical question that can be returned before a handler's clinical screen:
  - the factual re-plan question `factual?.ask` (`:357`, `:367–368`), which skips every handler;
  - `returnAfterPause`'s same-event-id question (`:1257–1258`), which comes before its own screen.
- **Already safe (grounded).**
  - The eligibility clinical flags (`:312`) and the sticky prior clinical state (`:30`, `:37–38`) come before everything.
  - `returnAfterPause` screens before its own `staleReturn` (`:1296`), and `decide` skips `staleReturn` for RETURN_AFTER_PAUSE.
  - Since QE-R7B1-01, the block-choice questions yield to a clinical handler result (`:368–369`).

## 4. Precedence rule and classification

**Rule.** Once a review is admitted, a clinical route that the review's own handler screen would take is the decision. "Admitted" means its contract, chronology, integrity, authority and eligibility checks have passed; those checks stay first and unchanged, and the eligibility ASK is itself the safety requirement. The decision then:
- has status CLINICAL_HUMAN_REQUIRED, with no proposal;
- keeps the handler's own reason and scope;
- still records the review's evidence in `actualLedger`;
- sets the pending state as today.

No nonclinical question is returned in its place: no late-evidence confirmation, factual re-plan question, block-choice or unrecognised-choice question, or episode or report-identity question.

**Inventory (U2, first step).** Every exit that can be returned before a handler's clinical screen, on FREEZE-2 bytes, is classified:
- (a) **admission refusal or safety requirement.** Unchanged; recorded with its reason.
- (b) **nonclinical question of the QE-R7B1-04 class.** Fixed through the same precedence point once a probe reproduces it.
- (c) **other.** Recorded with owner and next action, not fixed (for example, when a fix would need redesign).

The classification and its evidence go in `CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md`.

**Fix shape.**
- One precedence point in `evaluateProgram`'s decision step, evaluated before `staleReturn` and every other class-(b) exit.
- It reuses the handlers' own screen code, so the two cannot diverge. The handler keeps its own screen.
- Smallest diff, nothing else reordered.
- Late evidence is never suppressed. `staleReturn` stays state-derived and still asks on a later review that carries no clinical signal and no pending clinical state.

## 5. Routing and proportionality

**Classification: T2 / R2 / L3.** One narrow runtime fix with a fresh independent judge. L3 because the defect breaks a safety invariant; only the competent gate is required.

| Role | Owner | Basis |
|---|---|---|
| Coordinator and implementer (worker) | the current Claude session per unit | request; worker ≠ judge |
| Bounded harness engineering (optional) | Codex unit, judged and integrated by the next Claude unit | request "Delegate bounded engineering work to Codex only when useful and verifiable"; never for the fix or its semantics |
| Engineering gate (owner of QE-R7B1-04) | one fresh independent `quality-reliability-engineer` on the frozen bytes; route `claude-opus-5-5` / `xhigh`, mode `productization` | request REVIEW Q1–Q4; R7-B.1 §3 |
| SSCTR | **Not called**, unless G4 shows any change other than "a nonclinical question replaced by CLINICAL_HUMAN_REQUIRED, with no proposal on either side, on a review carrying a clinical signal". If it does, the SSCTR review becomes required. | CLAUDE.md mandatory routing covers rules affecting prescribed training. This fix changes no dose, selection, substitution choice or training rule. Clinical-first is B0-C06 condition 8, already decided. Clinical judgment stays human. R7B1-SSCTR-r2 binds prescriptions that stay byte-identical. |
| Quality | Inherited R7B1 READY under the same G4 condition, with the differential recorded; otherwise one narrow independent Quality review | R7-B.1 §3 practice |
| Security | not affected (no trust boundary) | global routing |
| Founder | reserved decisions only (scope change, unresolvable authority conflict) | CLAUDE.md |

Judge dispatches open with the `<task-route>` envelope the global guard requires. Each judge gets a written request file bound to the freeze identity, with the probes K6 and K6b, the R7-B.1 Engineering recheck record and this contract, and writes its outputs under `audits/domain-coaching-r7-b2-2026-10-31/reviews/`.

## 6. Units

| Unit | Executor and route | Goal | Boundary |
|---|---|---|---|
| U1 | Claude `claude-opus-5-5` / `xhigh` | Intake and plan: request recorded, this contract, mission and ledger blocks | planning_complete |
| U2 | Claude `claude-opus-5-5` / `xhigh` | Steps 1–6 below | implementation_unit_complete |
| U3 | Claude `claude-opus-5-5` / `high` (harness scripts may go to one Codex unit) | Steps 1–4 below | freeze_created |
| U4 | Claude `claude-opus-5-5` / `high` coordinating; judge `claude-opus-5-5` / `xhigh` | Write the review request, dispatch the Engineering judge (and SSCTR or Quality only if §5 requires them), record the verdicts | review_complete |
| U5 | Claude `claude-opus-5-5` / `xhigh` (conditional) | Only for an issue caused by the B.2 change: minimal correction → R7B2-FREEZE-2 → one narrow recheck by a fresh judge given the first review record (the first instance does not survive its session) | correction_cycle_complete |
| U6 | Claude `claude-opus-5-5` / `high` | Closure: final disposition, closure handoff, CoachingCore/r7/b2 README, closed blocks in CURRENT_MISSION and MISSION_LEDGER, push, remote HEAD verified | mission_closure |

**U2 steps** (no change to `src/` before step 4):
1. Install dependencies with `npm ci --prefix CoachingCore`, then confirm the baseline suite (786 tests, 0 failures).
2. Reproduce K6 and K6b on the baseline bytes from copies of the probes.
3. Run the §4 inventory, with a probe for each same-class candidate.
4. Write a RED regression test file and record its failing run on the baseline bytes.
5. Make the minimal fix.
6. GREEN: the new tests and the full suite pass.

**U3 steps:**
1. Evidence on the fixed bytes:
   - intake and timeline differentials against R7B1-FREEZE-2;
   - the adversarial neighbor grid (§7, G3);
   - negative controls (mutation);
   - the inherited conformance checks.
2. The freeze record R7B2-FREEZE-1.
3. A read-only verifier for it.
4. The test-change record.

## 7. Gates (all must hold for CLOSED_READY)

- **G0 baseline.** Done at U1 (see §1); suite count confirmed at U2.
- **G1 reproduction.** On the baseline bytes, K6 (the three bypass rows) and K6b reproduce as recorded, and the two control rows still route to a human. Every class-(b) candidate is either reproduced or shown unreachable.
- **G2 RED → GREEN.**
  - The new tests fail on the baseline bytes and pass after the fix.
  - The full suite passes (786 + new, 0 failures).
  - An existing test changes only if it asserted the defective behaviour, with the reason recorded in `TEST_CHANGES_R7B2.md`.
- **G3 adversarial neighbors** (request A–F, plus the K6 and K6b paths). Each passes with the expected outcome:
  - **A.** Late pre-break evidence, no clinical signal: R7-A's confirmation question, unchanged from FREEZE-2.
  - **B.** Clinical signal, no late evidence: the existing clinical route.
  - **C.** Late evidence + clinical signal in the re-entry week, in the same review or two-step: CLINICAL_HUMAN_REQUIRED, with no proposal and the late evidence kept in `actualLedger`; with a block choice or an unrecognised choice, still CLINICAL.
  - **D.** A nonclinical factual correction + late evidence: never routed to clinical, and unchanged from FREEZE-2.
  - **E.** A block choice + a clinical signal: the QE-R7B1-01 behaviour, unchanged.
  - **F.** An equipment or skill substitution with no clinical signal: B.1 behaviour, unchanged.
  - **After the clinical route:** a later review with no clinical signal and no pending clinical state still receives the late-evidence question, so the evidence is not lost.
  - **Class (b) exits:** every one fixed in U2 has its own clinical and nonclinical pair.
- **G4 differential against R7B1-FREEZE-2.** On the intake and timeline grids (the R7-B.1 differential design, with the predecessor extracted from `146ebb8`), both are identical step by step, except reviews that carry a clinical signal. On those, each changed decision goes from a nonclinical question to CLINICAL_HUMAN_REQUIRED, with no proposal on either side, and no prescription differs anywhere. Any other difference is a finding and triggers §5's SSCTR and Quality conditions.
- **G5 negative control.**
  - Mutants that undo the precedence, one per class-(b) exit fixed (for example, the precedence point removed, or moved after `staleReturn`), are killed by the B.2 tests.
  - The R7-B.1 and R7-B mutation results are inherited, unless the B.2 diff overlaps a mutant's fragment; then those mutants are rerun on the new bytes.
- **G6 inherited checks.** On the new bytes, `conformance-r7b.mjs` and `conformance-r7b1.mjs` pass read-only. A one-entry B.2 conformance delta maps the fix to B0-C06 condition 8 and D08, with its consumers and tests.
- **G7 freeze.** R7B2-FREEZE-1 binds the same kinds of bytes as R7B1-FREEZE-2:
  - files, source and manifest digests, the policy hash and the catalog binding;
  - the unchanged inputs, the evidence reports and the test count.

  Its read-only verifier passes. `verify-r7b1.mjs` then fails `files`, `sourceDigest` and `manifestDigest` on the new bytes by design; this is recorded as a supersession, never rewritten.
- **G8 review.** The Engineering judge answers request Q1–Q4 on the frozen bytes and accepts. SSCTR and Quality are as §5 requires.
- **G9 closure.**
  - Final disposition and states.
  - Clean tree; branch pushed over SSH; remote HEAD equal to local HEAD.

## 8. Tooling rules

- Run long or noisy commands as `node tools/agent-runtime/runtime.mjs capture -- <command>`.
- **Never run a closed mission's probe or script in place if it writes its outputs.** The R7-B.1 judge probes write into their own `out/`. Copy them under `audits/domain-coaching-r7-b2-2026-10-31/probes/` and set `PROBE_ROOT` explicitly; their `lib.mjs` resolves the repository by depth.
- **Never run `npm run verify` or any closed `verify-r*` script with `--write`.** Read-only runs are allowed.
- `CoachingCore/node_modules` is ignored; install it with `npm ci --prefix CoachingCore` (lockfile).
- `CURRENT_MISSION.md` and `MISSION_LEDGER.md`:
  - append-only, LF;
  - never read whole (each is over 100 KB);
  - append inside this mission's own blocks.

## 9. Allowed and prohibited changes

**Allowed:**
- `CoachingCore/src/r6-adaptation.mjs`, for the precedence point only. Another `src/` file only if the inventory proves a class-(b) exit lives there.
- New tests `CoachingCore/test/r7b2-*.test.mjs`.
- New scripts `CoachingCore/scripts/*-r7b2.mjs`.
- New files under `CoachingCore/r7/b2/` and `audits/domain-coaching-r7-b2-2026-10-31/`.
- Insert-only blocks in `CURRENT_MISSION.md` and `MISSION_LEDGER.md`.

**Prohibited:**
- Everything in §2.1.
- R7-B.1, R7-B and earlier freeze, evidence, review and probe files.
- `product/`, `canon/`, `governance/`, `AGENTS.md`, `CLAUDE.md`, `tools/agent-runtime/`, agent configuration.
- The human queue.
- The out-of-scope items of §1.

## 10. Correction policy, stop and terminal states

- **Bounded loop.** Founder loop bound, `audits/domain-coaching-r6-2026-10-26/FOUNDER_LOOP_BOUND.md`, and request CORRECTION POLICY: implementation → freeze → one review per required gate. At most one correction cycle (U5), and only for a narrow, runtime-only issue the B.2 change itself causes. Anything else closes NOT_READY with the exact reproducer, evidence, owner and next narrow action. No verdict is forced.
- **Pre-existing findings.** A pre-existing finding outside the QE-R7B1-04 class that the judge raises is recorded and routed. It blocks READY only if it is a safety bypass of the same invariant.
- **Stop conditions (CLOSED_NOT_READY with a blocker, or FOUNDER_REQUIRED for a reserved decision).** Stop if closing the blocker would need:
  - an intake or state-machine redesign;
  - an R7-A rewrite;
  - a policy or catalog change;
  - a new clinical interpretation.
- **CLOSED_READY.** Only when G1–G9 hold. Then `R7B_RUNTIME_REPERTOIRE_READY = READY`, if every other inherited requirement in the R7-B.1 handoff still holds (its routed minors stay routed and non-blocking).
- **Never declared.** `V1_COACHING_AUTHORITY_READY` stays NO and R7-C is not authorized.
- **Closure states:**
  - R7B2_ENGINEERING_GATE;
  - R7B2_SSCTR_GATE (INHERITED or reviewed);
  - R7B2_QUALITY_GATE (INHERITED or reviewed);
  - R7B_RUNTIME_REPERTOIRE_READY;
  - V1_COACHING_AUTHORITY_READY = NO;
  - correction cycles used.
- **The one question.** Is QE-R7B1-04 closed correctly, with clinical safety precedence restored and the valid predecessor behaviour preserved?
