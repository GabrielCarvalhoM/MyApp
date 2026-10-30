# Independent engineering preflight — R7A residual authority

**Date:** 2026-10-30 (America/Sao_Paulo). **Reviewer:** Codex, a fresh session independent of the runtime author. **Scope:** the Founder's advisory preflight of root causes A and B, with bounded preservation checks. This is neither official recheck, a sports-science ruling, nor a declaration of `R7A_EXIT_READINESS`.

**`CODEX_R7ARA_PREFLIGHT = CLEAN`** — no surviving finding in either residual root-cause class on the reviewed bytes.

## Artifact and integrity

| Item | Verified value |
|---|---|
| Repository | `GabrielCarvalhoM/MyApp` |
| Review branch | `review/codex-r7ara-preflight`, based on handoff `4917489364bb1138f8d82b46c20dd65d1bf693c7` |
| Freeze | `R7A-RESIDUAL-AUTHORITY-FREEZE-1` |
| Freeze commit | `7d2da3603e224124696a2290766ec448080f3264` |
| Source digest | `e7172eb2e65bfb1da4c102a7efa2bae64bf1c70b06562fd3ce9896defd6dc17d` |
| Manifest digest | `3d214fb53f62e45ca7d99f39f2c562d358719a2264c2de46098d39b318c85125` |
| Policy | R6-POLICY-5, `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` |
| Policy file SHA-256 | `a75be1aae3818616888e641c104407926d5f16f213a04137f5b21024ccafe100` |
| Environment | Windows, Node `v24.19.0`; locked dependencies installed with `npm ci --ignore-scripts --no-audit --no-fund` |

[Independent integrity instrument](codex-integrity.mjs) implements its own canonical serializer and hashing; it imports neither the runtime hash nor the author's verifier. [Start](codex-integrity-start.json) and [end](codex-integrity-end.json) records bind the live tree to the values above. It checks:

- all 86 manifest files against the freeze, the freeze commit's Git blobs and the handoff's Git blobs;
- the immutable freeze record at both commits, and the absence of unbound source/test modules;
- the predecessor copy and its original freeze record;
- all 146 historical evidence outputs against their recorded hashes and source-digest bindings. This verifies provenance, not fresh execution of those 146 jobs.

The handoff changes only `CURRENT_MISSION.md`, `MISSION_LEDGER.md` and `REVIEW_HANDOFF.md`. No bound runtime/test byte changes between freeze and handoff. The review changes only this `reviews/` directory.

The author's read-only verifier is separately recorded in [start](codex-author-verifier-start.json) and [end](codex-author-verifier-end.json). Its `reviews-not-dispatched` check is expected to fail once this advisory adds review files: it is an author-session stop marker, not an integrity defect. The frozen suite was executed independently: **673 tests, 673 pass, 0 fail, 0 skipped**, in [TAP evidence](codex-frozen-suite.tap).

## Inputs and independence

Read: `REVIEW_HANDOFF.md`, `PRE_FREEZE_REPORT.md`, `RESIDUAL_AUTHORITY_CONTRACT.md`, `ENGINEERING_RECHECK_BRIEF.md`, `SSCTR_RECHECK_BRIEF.md`, and the predecessor's decision-authority contract for its preserved boundaries. Read the prior Engineering review directly with `git show 17e7285:…/quality-engineering-r7ada-review.md` and the prior SSCTR review with `git show 6f5d40c:…/ssctr-r7ada-regression.md`; neither branch was merged.

Observed prior review commits:

- Engineering: `17e7285e144b07be75097f474c494b749f651344` on `review/r7ada-decision-authority-engineering`.
- SSCTR: `6f5d40c3b3525137cbcc2dbe8b5a786bfc6e4014` on `review/r7ada-decision-authority-ssctr`.

Routing: **T2 / R1 / L2**, review phase. This fresh session is the independent engineering judge of another session's runtime; no additional judge of this advisory is claimed. The deliverable is reversible review evidence, with no deployed behavior, trust boundary, policy or product-doctrine change. No Chief cascade or SSCTR dispatch is needed for this advisory engineering task. The official competent rechecks retain their authority.

## Root cause A — correction/retraction/conflict before decisions

**No residual violation found in the tested class.**

| Instrument | Bounded attack | Result |
|---|---|---|
| Unchanged independent QE Q01 | 78 cells: 13 handler shapes, held KNOWN versus FROM_LOG, multiple logged loads | Fresh result in `codex-runs/findings-Q01.cand.json` |
| Unchanged independent QE Q01b | 45 cells: TOTAL back-squat retraction, wearable quarantine, upward correction | Fresh result in `codex-runs/findings-Q01b.cand.json` |
| Fresh Codex A grid | 54 EARLY/LATE pairs: downward 24→20, upward 20→24, exercise removal; Monday versus Sunday 06:00 before the PM session; nine handler kinds | **0 violations, 0 non-equivalent fact pairs, 0 errors** |
| Same Codex A grid on predecessor | Identical probe and predicates against the byte-verified predecessor | **33 violations / 54 pairs**, no instrument errors; positive control |
| Unchanged QE Q04/Q05 | Temporal/order and decision-context preservation affected by dispatch composition | Fresh results in `codex-runs/` |

The nine fresh handler kinds are weekly review, schedule change, goal change, unavailable day, local fatigue, turn conflict, equipment change, missed session and return report. Q01 adds no-op/next-week variants and recovered/fatigue shapes; Q01b supplies the wearable-conflict case. The fresh predicate compares rows still ahead, confirmation questions, factual history and next-week rows only after verifying equality of canonical facts.

The corrected facts remain authoritative through the tested handler paths. A load above the corrected row still requires confirmation; removal returns to establishment rather than importing the stale KNOWN target. Code reading supports the observed order: `evaluateProgram` normalizes/binds evidence, computes its factual view, invokes `factualReplan` once before dispatch, and composes the handler's result through `withFactualReplan` (`src/r6-adaptation.mjs:345`, `:814`, `:829`). This code reading is supporting inference; the grid supplies executable evidence.

## Root cause B — factual return baseline

**No residual violation found in the tested class.**

| Instrument | Bounded attack | Evidence |
|---|---|---|
| QE Q06c | 21 cells: EASY long/easy ceilings and walk/jog exit, SHORT pauses | `codex-runs/findings-Q06c.cand.json` |
| QE Q06d | MODERATE return targets across execution/consolidation weeks | `codex-runs/findings-Q06d.cand.json` |
| SSCTR continuous probe | 34 cells: TOP5/FULL, exit released/unexecuted, held/projected, executed continuous run, break classes | `codex-runs/findings-ssctr-continuous.cand.json` |
| SSCTR walk/jog matrix | 99 returns, including repeated pauses and released steps | `codex-runs/findings-ssctr-walkjog-matrix.cand.json` |
| Fresh EASY grid | 30 cells: weeks 2/4/5/6/8 × breaks 3/10/11/28/29/33 days | **0 violations** |
| Fresh repeated-return grid | 36 cells: zero/one/two executed return weeks × no next run/one next run × the same six break lengths | **0 violations** |
| Author self-challenge, rerun unchanged | 112 cases, including walk/jog, EASY, repeated pauses, return completion and restart switch | `codex-runs/self-challenge-cand.json` |

The fresh grid crosses both break-class boundaries and consolidation, distinguishes released completion from execution, and checks LONG restart entry/rows. In the applicable EASY state it compares against the largest qualifying executed row of each role since entry. In an active RETURN it compares the executed return step. Its future conditional `returnTo` is not mistaken for the current baseline. The unchanged probes additionally check the re-entry rows and walk/jog recipe: step 8 / step 7 / step 0 for SHORT / MODERATE / LONG when the exit was released but unexecuted.

The first executed continuous run permits EASY as the return state; an unexecuted release does not. A consolidation week's deliberately lower row does not erase the largest tolerated dose already executed. These are applications of the supplied contract, not independent endorsements of a new sports-science preference.

### R7ARA-SELF-01: reproduced and absent from the freeze

[Control probe](codex-self01-controls.mjs) reconstructs the superseded source from Git commit `f373b6c` into a temporary directory, verifies source digest `259ab3eff431d2381d50904be7594d9fa122c7d8d2fc369e20d67b5419f84cb6`, and runs the same public-API scenario on that tree, the predecessor and the freeze. It does not modify any runtime tree. The scratch copy is removed after use.

Scenario: three executed weeks → 14-day pause → return steps 0 and 1 executed → completion released but no EASY-mode run → another 14-day pause.

| Tree | Second entry | Target | SELF-01 |
|---|---|---|---|
| Superseded `259ab3ef…` | RETURN step 1, **30/30/45** | Previous conditional target | **Reproduced**: skips entry |
| Predecessor `3a7166b2…` | RETURN step 0, **15/15/20** | easy 40 / long 70 | Absent as a recipe-skip defect; residual target problem remains |
| Freeze `e7172eb2…` | RETURN step 0, **15/15/20** | **easy 30 / long 45**, executed since the prior entry | **Absent** |

[Raw control results](codex-self01-controls.json) contain the executed rows and all three returned states. Thus SELF-01 was introduced in the superseded residual implementation and corrected before the reviewed freeze; it is not a finding on this freeze. Adjacent SHORT/MODERATE/LONG, released/unexecuted and execution-promotion classes are in the fresh grid and unchanged self-challenge.

Probe calibration rejected two apparent SHORT-return flags: they compared a latent conditional target to the just-executed RETURN step. Minimization showed entry step 1 still prescribes the executed 30/30/45; the larger `returnTo` is future conditional progression. The corrected predicate follows E1.3/E1.4. Initial 24-week synthetic inputs were also rejected by the input contract; final grids use the supported 16-week horizon. Neither issue was a runtime finding.

## Read-only preservation

**56/56 fresh probe jobs succeeded:** 41 kit jobs, 8 Engineering/SSCTR finding probes, 6 earlier SSCTR probes and the 112-case author self-challenge. **52 outputs reproduce the frozen evidence exactly; one differs only in its generation clock; three differ only in local paths and a generation clock or truncated stack trace.** For the stack trace, the error type, message and unmatched observation are identical. Every job's source digest equals the freeze before and after execution. The restoration grid covers 864 timelines; the short-return grid covers 315 cases with zero defects. HOLD has 240 gates with all scoped counters zero; MAINTAIN has 393 known-dose rows with no range/RIR/load violations.

The continuous instrument retains three ancillary weekly-view flags already named in the supplied report; its ladder and duration violation counters are zero. MAINTAIN retains its inherited O-1 set-count counter (99). These are unchanged diagnostics, not new scoped findings; no excluded policy issue is reopened.

| Required property | Instruments used |
|---|---|
| F1 / D53 | Four restoration-grid shards, temporal probe, restoration traces |
| F2 / HOLD | Independent 240-gate HOLD probe, reps/tick/systemic probes, frozen suite |
| F3 / MAINTAIN | Independent MAINTAIN probe (393 known-dose rows), R6-H25 strength trace, frozen suite |
| F4 | 99-return walk/jog matrix, 34-cell continuous/exit probe, 12-cell earlier walk/jog probe |
| D56 | Restoration grid A/A2 plus changes probe |
| D57 | Four caps shards and two extension shards, ceiling/accessory probes |
| D58 | Short-return grid and D58 instrument |
| D59 | First-week instrument, eight extended shards, same-day probes |

All executed jobs have their own output and script SHA-256, actual exit code, environment selectors, and source digest before/after execution in [run ledger](codex-reruns.json). [Comparison and acceptance evidence](CODEX_ENGINEERING_PREFLIGHT.json) records the checked predicates and any non-semantic difference explicitly.

Two of the 43 historical kit jobs were deliberately not reexecuted: the broad round-12 instrument and the known R6-H35 corpus-error instrument. Their frozen outputs/bindings were checked for integrity. The requested preservation classes have the narrower fresh executable checks above; no fresh 43/43-kit, mutation, entire 146-job round or scientific-approval claim is made.

## Limits, delivery and stop

No finding on the reviewed freeze survived reproduction and contract-based classification. CLEAN is bounded to the inputs and properties recorded here; it is not exhaustive verification or real-athlete validation.

R1, NF-R7ADA-2, the restart long-run offset, OBS-2, repertoire, pace, marathon, KMP, HealthKit, B0 and new sports-science preferences were not reopened. The preserved predecessor A4/D44 rule for an exposure executed before its correction arrived is not redefined. No runtime, frozen test, policy, prior review, mission, canonical document or queue was edited. No branch was merged.

Only review artifacts/probes in this directory are committed and pushed to `review/codex-r7ara-preflight`. The baseline/freeze and both prior review refs remain unchanged. The preflight stops here. Official rechecks and the closure decision remain with their designated owners.
