# R7-B.1 engineering recheck — R7B1-ENG-r2-RECHECK (the one narrow recheck)

| | |
|---|---|
| Freeze | R7B1-FREEZE-2. Record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json` (sha256 `e75a2799…`), freeze commit `146ebb8`. Worktree HEAD `ea940df` has the same runtime bytes. |
| Source / manifest | `f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612` / `980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8` |
| Identity | `node scripts/verify-r7b1.mjs --tests`: 25/25 PASS before (786 tests). Without `--tests`: 24/24 PASS after. No tracked file changed; the temporary archives were deleted. |
| Judge | The same independent instance as R7B1-ENG-r1; fixed nothing |
| Record | [ENGINEERING_RECHECK_R7B1.json](ENGINEERING_RECHECK_R7B1.json); probes and outputs in [probes/](probes/) |

## Verdict: NOT_READY

The cycle fixes what it set out to fix, and nothing it changed regresses. But the clinical-first property this recheck states for QE-R7B1-01 still fails in one state, through a second question that predates R7-B.1: **QE-R7B1-04 (MAJOR, pre-existing).** No further cycle follows (request §17), so it closes as an explicit blocker.

## Scope

**1. QE-R7B1-01: RESOLVED.** The block-choice question no longer decides before the handler.
- `j1b` (pain or illness × no choice, a ladder step, a declined offer or an unrecognised choice × with or without a correction): 16/16 cases give `CLINICAL_HUMAN_REQUIRED` with no proposal and pending CLINICAL, and the correction is recorded. FREEZE-1 bypassed 12/16.
- `j1`: 132 cases, 0 failures (FREEZE-1 had 18 clinical failures).
- `j1u` (unrecognised, mixed and null choices, 122 cases): the question keeps the factual re-plan, the answer gives the same plan as the review without the choice, and nothing stale comes back.

**2. The rest of the cycle's delta: no regression.**
- **acceptGap** (`k1`):
  - the question names only the missing equipment;
  - a confirmation records the change with the slot left out and discloses it;
  - nothing climbs, no question is asked again, history is untouched;
  - the substitute returns with the equipment, and both the window and the substitution paths work.
- **Event-week guard on every row** (`k2`):
  - 6 event timelines executed as prescribed record nothing and give plans byte-identical to FREEZE-1;
  - with a strength day always skipped, every event-week row is performed, a performed stand-in that fits the date's equipment, or left out, and each omission is disclosed once;
  - the taper window holds as well.
- **Week-of-next-use check** (`k3`, rotation grid): 240 applied and 58 asked on both freezes. The slot failures go from 4 to 0, and no new question appears.
- **Exhaustion question** (`k4`): naming is offered exactly when a named exercise is applied, and a keep-only question asks for nothing.
- **General disclosure and retraction authority over the guard** (`k5`): a retracted only execution removes the exercise from the event weeks ahead. The removal is disclosed, history stops crediting it, and the question carries the same re-plan.
- **Program-end wording:** covered by the cycle's tests.
- **Read-only re-runs:** timeline differential PASS (98/98 preserved identical); adversarial copy 3,228/0; conformance PASS.
- **Copied probes:** every R7B1-ENG-r1 probe is identical to FREEZE-1 except the intended J1b.

**3. Routed items: unchanged.** QE-R7B1-02 (`j7`, `j7b`), QE-R7B1-03 (`j3b`; 64/160 knock-on rows) and both observations give the same outputs as on FREEZE-1, and the cycle made none of them worse.

## New finding

**QE-R7B1-04 — MAJOR — pre-existing (R7-A residual authority `ecd623b` × the R7-B substitution screen `8d32f7d`; identical on R7-B FREEZE-2 and R7B1-FREEZE-1).**
- **Trigger:** a return's re-entry week, once a late report of training before the break is recorded (a later sync, which R7-A Founder rule 0.7 anticipates).
- **Mechanism:** `decide()` puts R7-A's confirmation question before the handler (`src/r6-adaptation.mjs:359`), so the substitution's clinical screen (`:543`) never runs.
- **Result:** a pain report gets "confirm that interruption again" and reference pending ASK, so the clinical dependency is lost. With a block choice, the block-choice question comes back. An illness *return* is unaffected.
- **Contradicts:** B0-C06 condition 8, and scope item 1 ("whatever block choice it carries").
- **Expected:** `CLINICAL_HUMAN_REQUIRED` with no proposal, as the same report gets without the late evidence.
- **Reproduction:** `probes/k6-stale-return-clinical.mjs` and `probes/k6b-stale-return-two-step.mjs` (late report recorded, then the pain report alone).

Observations (routed):
- **OBS-03:** with two gaps from one lost item, the question names only the first, and the second omission is only in `omitted` (`k1` K1b).
- **OBS-04:** the keep-only question is ASK with nothing to answer; a later RECOVERED review is asked again (`k4b`).

## Next action

Close with QE-R7B1-04 as an explicit blocker for the next runtime mission. The handler's clinical screen must come before R7-A's late-evidence confirmation, as the cycle made it come before the block-choice question. Accepting the risk instead is the Founder's decision.

R7B1_ENGINEERING_GATE = NOT_READY
