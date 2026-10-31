# R7-B.1 — Engineering narrow recheck request (the one recheck, on R7B1-FREEZE-2)

You are the same independent engineering judge who reviewed R7B1-FREEZE-1 (R7B1-ENG-r1, NOT_READY: QE-R7B1-01 MAJOR). You did not author this runtime. Request §17 allowed **one** correction cycle for a narrow blocker the mission's own correction created: correction, new freeze, narrow recheck, then stop. This is that recheck. No further cycle follows it, so a finding you raise stays a finding; it is routed, not corrected here.

## Bytes to judge

- **R7B1-FREEZE-2**: record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json` (sha256 `e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5`, source digest `f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612`, manifest digest `980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8`, freeze commit `146ebb80c51d302ef3518a61c1cab208c7778632`). Verify read-only with `node scripts/verify-r7b1.mjs --tests` (from `CoachingCore/`; the default is FREEZE-2).
- Previous: R7B1-FREEZE-1 (`d41df8b`), your review in `reviews/engineering/` (committed at `2e874f1`).
- Delta: `git diff d41df8b 146ebb80c51d302ef3518a61c1cab208c7778632 -- CoachingCore/src CoachingCore/test`. The two runtime files are `src/r6-adaptation.mjs` and `src/r6-program.mjs`, plus one new test file, `test/r7b1-correction-cycle.test.mjs`. Read the section "Correction cycle" (C1–C6) of `CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md` and the `_2` evidence the freeze record lists.

## Scope (narrow)

1. **QE-R7B1-01.** A review that reports pain with an exercise, or an illness interruption, routes `CLINICAL_HUMAN_REQUIRED` and proposes nothing, whatever block choice it carries (recognised, declined offer or unrecognised), with or without a correction, and the reference state carries the clinical dependency. Your `j1b` and `j1` reproductions apply.
2. **The rest of the cycle's delta, for regressions only:**
   - the unrecognised-choices question, now after the facts, which keeps the factual re-plan;
   - the no-lower-skill question (`acceptGap`; only new gaps);
   - the event-week guard on every row in TAPER, RACE_WEEK and POST_EVENT, with stand-ins fitting the equipment of the date and what the planner records;
   - the week-of-next-use slot check counted over the week;
   - the exhaustion question (`attempt`, `nameable`);
   - the general event-week disclosure (`newEventStandIns`, records named `slots`);
   - the program-end wording.

   Check state transitions and factual authority on these paths (HistoricalState ≠ PlanningProjection; the evidence reducer; the event-week guard reading the week's start state), and the R7-A invariants your review listed.
3. **Your two MINORs (QE-R7B1-02, -03) and your observations** were routed, not changed. Confirm they are unchanged, or say if the cycle made any of them worse.

## Rules

- Read-only on the repository. Write only under `audits/domain-coaching-r7-b1-2026-10-31/reviews/engineering/recheck/`. Re-run probes only from copies there or from a temporary mirror outside the repository, never in committed probe folders. Never run `npm run verify`, any `--write`, or the freeze, mutation or integration scripts with `--write`.
- No commits, no git operations that change state. Delete any temporary archives you create outside the repository.
- Deliver `ENGINEERING_RECHECK_R7B1.json` and `ENGINEERING_RECHECK_R7B1.md`. The last line of the `.md` is `R7B1_ENGINEERING_GATE = READY` or `R7B1_ENGINEERING_GATE = NOT_READY`. For any finding give severity, origin (introduced by the cycle or pre-existing), reproduction, expected and actual.
