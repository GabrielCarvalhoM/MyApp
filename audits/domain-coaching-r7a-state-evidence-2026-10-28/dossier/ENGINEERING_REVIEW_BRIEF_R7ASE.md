# COACHING CORE — STATE EVIDENCE MODEL — engineering review brief

You are the **independent engineering judge** of the single freeze of the COACHING CORE — STATE EVIDENCE MODEL mission: value-scoped fact vs projection. This is the main gate (Founder request §28). You did not write this runtime. You change nothing under `CoachingCore/` and rule on no sporting dose: the SSCTR reviews the same bytes in parallel, regression-only.

## The freeze

| | |
|---|---|
| Revision | **STATE-EVIDENCE-FREEZE-1** (`CoachingCore/r7/state-evidence/RUNTIME_FREEZE_STATE_EVIDENCE.json`; file SHA-256 in the freeze identity below) |
| Source digest | the canonical `hash()` of the `src/*.mjs` SHA-256 map, as in `CoachingCore/scripts/freeze-r7ase.mjs` |
| Policy | R6-POLICY-5 `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, unchanged |
| Delta from R7A-BOUNDARY-FINAL-FREEZE (`36a71ca8…`) | changed: `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs`, `test/r7ab-week-start-authority.test.mjs`; added: `test/r7ase-state-evidence.test.mjs`. Diff: `dossier/RUNTIME_DELTA_R7ASE.diff`. Byte-exact R7A-BOUNDARY-FINAL-FREEZE copy: `boundary-freeze-source/` |

**Freeze identity.** Source digest `692483ce5147d90797441baf2ac73c9d433197bd40047f147202ca4e4bff2cc1`; freeze file SHA-256 `a8683cbad60fd7f7b9da8b09e5c44bc74a55c6a2445e744606d37dbc6fde69f7`; policy R6-POLICY-5 `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c` (unchanged). At the freeze, the read-only `verify-r7ase.mjs` passes 15 of 17 checks. The two open ones are `independent-reviews` (these reviews) and `deliverables` (the closure).

Recompute the digest at the start and at the end of your review, and record both.

## The question (Founder request §28)

> **Is there any normal V1 path on which a value that was only planned or projected is consumed as a historical fact without evidence pertinent to that value?**

If yes, and it is material: NOT_READY. The Founder's decision is given (§0: `STATE_EVIDENCE_AUTHORITY = VALUE_SCOPED`; recursive whole-week authority rejected), and you do not re-discuss it. Judge whether the runtime implements it, on every path.

## Read first

1. `FOUNDER_REQUEST.md`, verbatim. §1–§3, §8–§17 (I1–I11), §18–§20 (the P40 case, families A–K, properties P1–P7) and §28.
2. `STATE_EVIDENCE_CONTRACT.md` (R7ASE-STATE-EVIDENCE-1):
   - the two views (§2);
   - what a value is (§3);
   - the historical value of each value (§4);
   - the facts (§5), the record (§6) and the declared boundaries E1–E6 (§7).

   It succeeds §3, §4's point and B8 of the R7-A boundary contract (`../domain-coaching-r7a-boundary-2026-10-28/WEEK_START_AUTHORITY_CONTRACT.md`).
3. `dossier/RUNTIME_DELTA_R7ASE.diff`, and the code:
   - in `src/r6-adaptation.mjs`: `historicalView` (with `reviewOf`, `exerciseAsAssumed`, `runAsAssumed`, `atDose`, `factsOf`, `ruleOn`, `held`), `stateAtBreak`, `projectedBaseOf`, `evidenceStart`;
   - in `src/r6-program.mjs`: `strengthAtBreak`'s load fact, `exercisePremiseOf`, `projectedStart`, `anchoredStart`.
4. `CoachingCore/test/r7ase-state-evidence.test.mjs`, and the three cases of `test/r7ab-week-start-authority.test.mjs` marked `State evidence` (contract §9).
5. Your predecessor's re-check: `../domain-coaching-r7a-boundary-2026-10-28/reviews/quality-engineering-r7ab-recheck.md` (QE-R7AB-01 to 03) and its probes P40–P47b.

## Probes you must re-run at least (§18, §28)

| Item | Probe |
|---|---|
| QE-R7AB-01, the original | `../domain-coaching-r7a-boundary-2026-10-28/reviews/qe-r7ab-P40-held-outside-return.mjs` (four time zones, `QE_TZ`); with `QE_LIVE_ROOT=<this folder>/boundary-freeze-source/CoachingCore` for the before. It must fail before and pass now: history 20 kg, the plan still projecting 22 kg |
| Its variants | P40b, P40c, P41, P47b (same folder) |
| Earlier blockers | QE-R7AF-01: `../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-P30c-reproduction.mjs`, `qe-r7af-P30b-earned-week-grid.mjs`. QE-R7A2-01: P17, P19, P20, P21. QE-R7A1-09/10: P13, P14. Identity: `qe-r7af-P31-identity-order-grid.mjs` at four time zones |
| Your own | every class the Founder names (§28): weekly review, next-week start, return, partial evidence, cross-sport, cross-exercise, corrections, progression, week boundary |

**Author evidence to check, not a substitute for your own runs:**
- the recorded outputs on the frozen bytes in `probes/runs/`. `probes/EVIDENCE_RUNS_R7ASE.json` binds each to the digest before and after its run; `probes/COMPARE_R7ASE.json` compares them with the R7A-BOUNDARY-FINAL-FREEZE outputs, with every difference named in `probes/COMPARE_R7ASE_NAMED.json`;
- the consumer audit (§21) `dossier/CONSUMER_AUDIT_R7ASE.md`: every reader of the stored starts, by the view it reads;
- the self-challenge `probes/r7ase-self-challenge.mjs`: 12 classes, with a same-facts oracle against a reviewed control;
- mutation `probes/mutation-check-r7ase.mjs`;
- regression `CoachingCore/r7/state-evidence/REGRESSION_R7ASE.json`, with its differences named in `probes/REGRESSION_R7ASE_NAMED.json`;
- the new tests on the boundary-freeze copy `probes/r7ase-tests.on-boundary-freeze.out.txt`.

## Where to look hardest

Any path on which a stored value counts as history without evidence pertinent to it:
- **A review's start (`WEEK_EVIDENCE`).** History reads a value from it only when the start before held that value as stored; otherwise it rebuilds the value by the same rule on its historical value.
  - Is the "held" test sound per value: a fact-read value, a value absent from history, a value rebuilt one week earlier (`held`), the start a return of the week replaced?
  - Is the rebuilt rule the review's rule: gates, systemic signals, confirmations, logs, performed dates, the transition's skeleton?
- **A projection (`CONDITIONAL_PLAN`).** History promotes it per sport, when the week before executed every row as assumed, and only for values whose base was historical.
  - Can a value pass without its own pertinent evidence: rows removed by an adaptation, a gate that advanced on an unusable log, lighter or heavier loads, partial sessions, unlogged repetitions or effort, conflicted or corrected reports, late syncs?
- **The facts read in a week (§5).**
  - The load fact on known-load rows: lighter, heavier with the target met, effort-guided rows.
  - The lifted projected dose (`atDose`).
  - Unknown units; counts never executed; dates.
- **Planning versus history (E1).** The planner keeps projecting. Can any *history* consumer still read the planning view?
  - Return entries, ceilings and staleness checks;
  - anything a later decision treats as "what the athlete did".
- **Run values (E2).** A run value read through an unreviewed week is kept, never re-gated. Is any kept value ever one only a projection made?
- **Two or more steps.** A projection over a rebuilt value, a review over a verified projection over a falsified one, returns in between (SHORT, MODERATE), corrections of the same episode, late reports of an earlier one.
- **Equivalence.** The week boundary (Sunday against Monday), handlers at every clock, order (P7), time zones. A handler that applies the weekly review's rule on the week's last day is that sport's review (contract E6). So the Sunday cells of P30, P30b and P47 now equal their Sunday-reviewed control for the sports the handler re-planned and the unreviewed control for the others; the Monday cells equal the unreviewed control. Each is named in `probes/COMPARE_R7ASE_NAMED.json`. Judge whether that is right.

## Rules

- **Read-only use of the runtime.** Use synthetic data and the DEV_TEST_ONLY authority (`r6/fixtures/dev-authority.mjs`).
- **Where you write.** Put your scripts and outputs in `audits/domain-coaching-r7a-state-evidence-2026-10-28/reviews/`, with the prefix `qe-r7ase-`. The probe helpers in `../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs` load the live runtime read-only; `QE_LIVE_ROOT` points them at a copy. Never write under `CoachingCore/` or into another audit folder.
- **Never run:**
  - `npm run verify` or `simulate`;
  - any `verify-r*.mjs` with `--write`;
  - any `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script;
  - any evidence runner (`run-evidence-*.mjs`, `ssctr-*-run.mjs`);
  - `mutation-check-*.mjs`.
- **May run (read-only):** `node CoachingCore/scripts/verify-r7ase.mjs` without `--write`, and `node --test` in `CoachingCore`.
- **No correction cycle follows your verdict** (Founder §27). A material blocker closes the mission NOT_READY and returns to the Founder.

## What to write

`reviews/quality-engineering-r7ase-review.md` (prose) and `reviews/quality-engineering-r7ase-review.json`:

```json
{
 "revision": "R7ASE-QE-r1",
 "reviewer": "fresh quality-reliability-engineer (model, effort)",
 "freezeReviewed": {"revision": "STATE-EVIDENCE-FREEZE-1", "sourceDigest": "…", "fileSha256": "…"},
 "digestStart": "…", "digestEnd": "…",
 "verdict": "READY | NOT_READY",
 "answerToSection28": "…",
 "findings": [{"id": "QE-R7ASE-NN", "severity": "HIGH|MEDIUM|LOW", "material": true, "what": "…", "reproduction": "reviews/…", "class": "projection consumed as history | other"}],
 "blockers": {"QE-R7AB-01": "CLOSED|OPEN", "QE-R7AF-01": "…", "QE-R7AF-02": "…", "QE-R7A-01": "…", "QE-R7A1-09": "…", "QE-R7A1-10": "…", "QE-R7A2-01": "…", "QE-R7A2-02": "…", "QE-R7A2-03": "…"},
 "recommendations": {"VALUE_SCOPED_EVIDENCE_AUTHORITY": "READY|NOT_READY", "HISTORICAL_STATE_INTEGRITY": "…", "PLANNING_PROJECTION_INTEGRITY": "…", "STATE_PRESERVATION_INTEGRITY": "…", "WEEK_START_STATE_AUTHORITY": "…", "RETURN_RECOVERY_CEILING_INTEGRITY_engineering": "…", "WEEK_COMPOSITION_INTEGRITY": "…", "EVENT_SUPERSESSION_INTEGRITY": "…", "EXERCISE_MERGE_INTEGRITY": "…"},
 "boundaries": {"E1": "accepted|rejected: why", "E2": "…", "E3": "…", "E4": "…", "E5": "…", "E6": "…"},
 "probesRun": ["…"]
}
```

If NOT_READY, state for each material finding (Founder §32):
- the reproduction;
- which state atom lost its provenance;
- whether the failure comes from the chosen granularity;
- whether HistoricalState and PlanningProjection would need to be physically separate structures.
