# R7-B — Engineering review request (independent)

You are an independent engineering judge (quality and reliability of executable behaviour). You did not author this runtime; the author is not a judge.

## Question

On the frozen bytes of **R7B-RUNTIME-REPERTOIRE-FREEZE-1** (`CoachingCore/r7/b/RUNTIME_FREEZE_R7B.json`), is the R7-B runtime binding of the repertoire catalog correct and robust enough to leave the phase? Test (request §24):

- catalog/runtime conformance (the catalog bytes are read and checked; every planned session belongs to the catalog; roles, conventions and admissibility as bound; the matrix `CoachingCore/r7/b/CONFORMANCE_R7B.json` is truthful — spot-check its claims);
- state transitions (novice density cap and release, graduation, ladder steps, MAIN changes, reason-based substitution, familiar-bouts withdrawal and lapse, rotation state);
- stale-state resurrection (no projected, released or planned value becomes history; no set-aside configuration comes back; no capped/uncapped or graduated/ungraduated state reappears from a stale context; the evidence reducer and the planner agree);
- correction/retraction (R7-A A5: a correction before every decision, including the new block-boundary step and the new `EXERCISE_SUBSTITUTION` kind);
- determinism (same input, same output; no dependence on object or file order);
- boundary behaviour (block boundaries, consolidation, event windows, review dates near the SSCTR records' review-by date, empty or bodyweight-only equipment, one-day schedules);
- impossible combinations (invalid choices, choices off a boundary, ladder skips, MAIN changes to another pattern, kilograms for bands, quality without its gates, unknown configurations) — each must be refused or asked, never planned;
- regression against R7-A (the inherited suite; the R7-A invariants QE-R7ADA-01/02, F1–F4, F4-X, D53, D56–D59, HOLD, MAINTAIN on the new runtime; `CoachingCore/r7/b/REGRESSION_R7B.json`).

## Read (minimum)

`CoachingCore/r7/b/R7B_REVIEW_HANDOFF.md`, the freeze record, `audits/domain-coaching-r7-b-2026-10-31/TEST_CHANGES_R7B.md`, `CoachingCore/r7/R7A_FINAL_HANDOFF.md` (invariants), then the code and tests as you need. Write your own probes; do not rely on the author's tests alone.

## Rules

- Do not edit anything under `CoachingCore/src`, `CoachingCore/test`, `CoachingCore/r6`, `CoachingCore/r7`, `product/`, `canon/`. Do not commit, stash, check out or reset. Never run `npm run verify` or any closed `verify-r*` script (`node CoachingCore/scripts/verify-r7b.mjs --tests` is read-only and allowed; `node --test` is allowed).
- Write only into `audits/domain-coaching-r7-b-2026-10-31/reviews/engineering/`.
- Bounded: one review; a later narrow recheck only for a blocker that is new, narrow and runtime-only. Do not duplicate the SSCTR (sports-science adequacy) or the Quality judge (catalog completeness and reachability).

## Output

- `audits/domain-coaching-r7-b-2026-10-31/reviews/engineering/ENGINEERING_REVIEW_R7B.json`: `{review_id, freeze, sourceDigest, manifestDigest, verdict, findings:[{id, severity: BLOCKER|MAJOR|MINOR|OBSERVATION, area, summary, reproduction (probe path or exact steps), expected, actual}], checked:[...]}`.
- `audits/domain-coaching-r7-b-2026-10-31/reviews/engineering/ENGINEERING_REVIEW_R7B.md`: summary ending with exactly one line `R7B_ENGINEERING_GATE = READY | NOT_READY`. READY means no BLOCKER or MAJOR finding inside this gate.
