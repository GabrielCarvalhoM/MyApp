# R7-A Final Boundary Closure — engineering re-check brief

You are the **independent engineering judge** of the single freeze of the DOMAIN_COACHING_R7-A Final Boundary Closure. This is the main gate (Founder request §20). You did not write this runtime. You change nothing under `CoachingCore/` and rule on no sporting dose: the SSCTR re-checks the same bytes in parallel, regression-only.

## The freeze

| | |
|---|---|
| Revision | **R7A-BOUNDARY-FINAL-FREEZE** (`CoachingCore/r7/boundary/RUNTIME_FREEZE_R7A_BOUNDARY.json`, file SHA-256 `3ebc9b02995d95f39b172fbbb79b652c149b10c74984ce7b8da6fd870778b97d`) |
| Source digest | `36a71ca84fb87789d8623e2050ac9e308a963400af86a3ba73a373043bbf186c`: the canonical `hash()` of the `src/*.mjs` SHA-256 map, as in `CoachingCore/scripts/freeze-r7ab.mjs` |
| Policy | R6-POLICY-5 `18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c`, unchanged |
| Delta from R7A-FINAL-FREEZE (`ec2debe7…`) | changed: `src/r6-adaptation.mjs`, `src/r6-composition.mjs`, `src/r6-program.mjs`, `test/r6-adaptation.test.mjs`; added: `test/r7ab-week-start-authority.test.mjs`. Diff: `dossier/RUNTIME_DELTA_R7AB.diff`. Byte-exact R7A-FINAL-FREEZE copy: `final-freeze-source/` |

Recompute the digest at the start and at the end of your review, and record both.

## The question (Founder request §20)

> **Is there any common V1 path on which a projected or re-planned state is reused as history without evidence that gives it that authority?**

If yes: NOT_READY. The Founder's decisions are given, and you do not re-discuss whether they are convenient:
- §0.1: planned state is not automatically historical; only evidence-anchored state is history for later reconstructions;
- §11: a same-episode correction that contradicts its already-attributed re-entry, with a material effect, is asked.

Judge whether the runtime implements them, consistently and on every handler.

## Read first

1. `FOUNDER_REQUEST.md` §0, §1, §2, §7–§16, §20 (verbatim).
2. `WEEK_START_AUTHORITY_CONTRACT.md` (R7AB-WEEKSTART-1):
   - the record and who sets it (§2);
   - the one consumer `historicalWeekStart` (§3);
   - the state point (§4), which now applies before any return too, since B3 is superseded;
   - the contradiction rule (§5);
   - the declared boundaries B7–B11 (§6), the items with sporting reach (§7) and the invariant map (§8).
3. `dossier/RUNTIME_DELTA_R7AB.diff` and the code:
   - `historicalWeekStart` and `stateAtBreak` in `src/r6-adaptation.mjs`;
   - the `startAuthority` passed by `weeklyReview`, `rebuild` and `returnAfterPause`, and the §11 check after the composition in `returnAfterPause`;
   - `composeWeeks` in `src/r6-composition.mjs`;
   - `WEEK_START`, `premiseOf`, `startAuthority`, `anchoredStart`, `projectedStart` and `generateProgram` in `src/r6-program.mjs`.
4. `CoachingCore/test/r7ab-week-start-authority.test.mjs`, and the edited case in `test/r6-adaptation.test.mjs` (marked `R7-A boundary`).
5. The predecessor's re-check: `audits/domain-coaching-r7a-final-2026-10-28/reviews/quality-engineering-r7af-recheck.md` (QE-R7AF-01 to 04, boundaries B1–B6).

## Probes you must re-run at least (§20)

| §20 item | Probe |
|---|---|
| The original QE-R7AF-01 probe | `audits/domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-P30c-reproduction.mjs` and `qe-r7af-P30b-earned-week-grid.mjs`; with `QE_LIVE_ROOT=<this folder>/final-freeze-source/CoachingCore` for the before |
| Relevant earlier return probes | P17, P19, P20, P21 (`audits/domain-coaching-r7a2-2026-10-28/reviews/`); P13, P14 (`audits/domain-coaching-r7a1-2026-10-27/reviews/`); the R7-A final judge's P35, P38 |
| Interruption-identity regression | `qe-r7af-P31-identity-order-grid.mjs` at four time zones (`QE_TZ`); P34; P37 |
| No-op handler | P15 (`qe-a2-P15-…`), P30b's full-kit cell, and your own |
| Cross-week | P19 next-week cells; your own on either side of a week boundary, the week before reviewed or not |
| Evidence promotion | your own: a week executed exactly as projected, without a review, against the same week reviewed; then a week that is not executed as projected (missed, partial, adverse, skipped, reduced, lighter load, unlogged) |
| Temporal contradiction | P37 E1, E2, E7, and your own (`startedAt` as well as dates) |

The author's recorded outputs on the frozen bytes are in `probes/runs/`, and `probes/EVIDENCE_RUNS_R7AB.json` binds each one to the digest before and after its run (78 runs, all `36a71ca8…`). They are compared with the R7A-FINAL-FREEZE outputs in `probes/COMPARE_R7AB.json`: 68 of 77 are byte-identical, and the 9 differences are named in `probes/COMPARE_R7AB_NAMED.json`. Further author evidence:
- the self-challenge `probes/r7ab-self-challenge.mjs` (9 classes: 0 violations, 56 on R7A-FINAL-FREEZE);
- mutation `probes/mutation-check-r7ab.mjs` (20/21, plus 1 documented guard);
- regression `CoachingCore/r7/boundary/REGRESSION_R7AB.json` (identical on all four corpora);
- the new tests on R7A-FINAL-FREEZE `probes/r7ab-tests.on-final-freeze.out.txt` (10 of 12 fail).

All of this is evidence to check, not a substitute for your own runs.

## Where to look hardest

Any path on which a stored start counts as history without evidence:
- **A review that keeps the plan records nothing.** The projection's premise, verified by the week's evidence (§3), stands in for it. Is that check sound?
  - the rows the projection assumed, against a later adaptation, a re-plan or a scoped re-plan;
  - every gate of the sport;
  - the loads a review would adopt (effort-guided rows in a return keep a known load as their ceiling);
  - systemic signals, confirmations, conflicted or corrected reports, late syncs placed by execution time.
- **A recorded WEEK_EVIDENCE start inside a return:** the base rule for values a review held (week-level, B8).
- **Strength-only compositions:** per-sport parts, and the run part kept.
- **The start a return of the week replaced** (`startBeforeReturnAuthority`), corrections of the same episode, late reports of an earlier one (`late`).
- **Before any return** (B3 superseded): first interruptions after unreviewed weeks, never-logged programs, weeks reviewed with nothing executed.
- **Handler independence (I8, P2) at every clock:** Sunday of a complete week against Monday, and before or after the shift is over.
- **Equivalence classes over time zones.**
- **§11:** named corrections by identity, by report id, a reused name; a moved start, a moved end, `startedAt`; with and without executed re-entry; immaterial cases.

## Rules

- Read-only use of the runtime; synthetic data; DEV_TEST_ONLY authority (`r6/fixtures/dev-authority.mjs`). Put your scripts and outputs in `audits/domain-coaching-r7a-boundary-2026-10-28/reviews/` (prefix `qe-r7ab-`). The probe helpers in `audits/domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs` (over `audits/domain-coaching-r7a1-2026-10-27/reviews/qe-a2-lib.mjs`) load the live runtime read-only; `QE_LIVE_ROOT` points them at a copy.
- Never write under `CoachingCore/` or into another audit folder.
- Never run:
  - `npm run verify` or `simulate`;
  - any `verify-r*.mjs` with `--write`;
  - any `freeze-*`, `prepare-*`, `queue-*` or `regress-*` script;
  - any evidence runner (`run-evidence-*.mjs`, `ssctr-*-run.mjs`).
- These are read-only and may be run: `node CoachingCore/scripts/verify-r7ab.mjs` without `--write`; `node --test` in `CoachingCore`.
- No correction cycle follows your verdict (Founder §22). A material blocker closes the mission NOT_READY and returns to the Founder.

## What to write

`reviews/quality-engineering-r7ab-recheck.md` (prose) and `reviews/quality-engineering-r7ab-recheck.json`:

```json
{
 "revision": "R7AB-QE-r1",
 "reviewer": "fresh quality-reliability-engineer (model, effort)",
 "freezeReviewed": {"revision": "R7A-BOUNDARY-FINAL-FREEZE", "sourceDigest": "…", "fileSha256": "…"},
 "digestStart": "…", "digestEnd": "…",
 "verdict": "READY | NOT_READY",
 "answerToSection20": "…",
 "findings": [{"id": "QE-R7AB-NN", "severity": "HIGH|MEDIUM|LOW", "material": true, "what": "…", "reproduction": "reviews/…", "class": "new manifestation of projected-vs-historical | other"}],
 "blockers": {"QE-R7AF-01": "CLOSED|OPEN", "QE-R7AF-02": "…", "QE-R7A-01": "…", "QE-R7A1-09": "…", "QE-R7A1-10": "…", "QE-R7A2-01": "…", "QE-R7A2-02": "…", "QE-R7A2-03": "…"},
 "recommendations": {"WEEK_START_STATE_AUTHORITY": "READY|NOT_READY", "STATE_PRESERVATION_INTEGRITY": "…", "WEEK_COMPOSITION_INTEGRITY": "…", "EVENT_SUPERSESSION_INTEGRITY": "…", "EXERCISE_MERGE_INTEGRITY": "…", "RETURN_RECOVERY_CEILING_INTEGRITY_engineering": "…"},
 "boundaries": {"B1": "accepted|rejected: why", "B2": "…", "B3 (superseded)": "…", "B4": "…", "B5": "…", "B6": "…", "B7": "…", "B8": "…", "B9": "…", "B10": "…", "B11": "…"},
 "probesRun": ["…"]
}
```

If NOT_READY, state for each material finding (Founder §26):
- the reproduction;
- whether it is a new manifestation of projected-vs-historical;
- whether it requires revising the history/state model;
- why the current solution is insufficient.
