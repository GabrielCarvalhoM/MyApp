# CoachingCore V1 Final Closure: request for the one independent review (V1FC)

**Mission:** the Founder's request of 2026-11-11: finish the CoachingCore already built, for a bounded V1 scope, and freeze it. Approval asked here is of the **V1-scoped CoachingCore only** (the engine and its reference boundary on synthetic data). It is not approval of production, backend, operational security or a published app, and it is no authorization for real athletes.

**Candidate:** the commit named in your dispatch, on branch `claude/coachingcore-v1-final-closure` (from `3b14804`, the interrupted V1CIB candidate). Review a `git archive` extract of that commit in a new folder of your own scratchpad, never a worktree. The archive has no `node_modules`: copy the locked `ajv` from `CoachingCore/node_modules` of the worktree `.claude/worktrees/v1-final-closure` into the extract. Never run `npm run verify` or any `verify-r*` script (they rewrite closed missions' evidence). No recursive deletion: build into new folders only. Write your record under `audits/coachingcore-v1-final-closure-2026-11-11/reviews/<role>/` of that worktree, new files only (JSON authoritative, a short MD summary); change nothing else.

**Cycle bound (Founder):** this is the single round. A blocking finding gets at most one directed fix cycle and one narrow recheck by the same role. Anything else closes as a named blocker or as the smallest safe reduction of scope. Say, for each blocking finding, the smallest fix or scope reduction that would close it. Proportional review: look for concrete violations inside the V1 scope and in the shared mechanisms; do not re-audit closed missions.

## The V1 scope under review

| In V1 | Out of V1 (typed unavailability, ASK or HOLD; never an autonomous prescription) |
|---|---|
| Plans for beginners to experienced recreational athletes, running and strength, with the existing coordination, priorities, double days, coach, volume and difficulty choices | F08 Situation 1: temporary reduction windows, rungs, checks, return ladders, speeds, chains |
| Running goals: start running (walk/jog), regular, performance, 10K, half marathon; **5K** and **marathon** by the new event extension | Clinical judgment, clearance, injury or illness management |
| Strength: hypertrophy, strength, general and maintenance; selection, substitution, progression | Ultra distances; pace, zone or time prediction; fuelling |
| Weekly review, executed-session progression, missed and partial sessions, availability, equipment, goal and preference changes | A marathon block for an athlete who does not meet every eligibility criterion (they get the preparatory plan) |
| Declared breaks and their conservative return (R7-C, R7-D) | Release of a hold by anything but the athlete's readiness declaration |
| Clinical holds on the record; the readiness declaration as the one release, sport by sport | |

## What changed since `3b14804`

| Item | Where | What |
|---|---|---|
| V1 scope in the runtime | `src/v1-index.mjs` (the V1 entry point, custody's default engine); `src/r6-adaptation.mjs` (`temporaryReductionOutsideV1`, the record and plan gate, `V1_SCOPE`) | A "not 100%" report or a check is screened only: a sign answered yes is the clinical hold as before; an unanswered sign is asked; with every sign no the plan is kept, with `unavailable: {OUTSIDE_V1_SCOPE, TEMPORARY_REDUCTION}`, and no fact is recorded. A record or plan that holds a Situation 1 report or reduction is HOLD (`record.outsideV1Scope`). |
| SEC-V1CIB-01, PCG A-C2, A-C3 | `src/boundary/custody.mjs` (`accept`, `closed`, `eraseHealthFacts`, `setConsent`, `restart`, `submit`) | A waiting change is closed, with its cause, by an erasure, a coaching-consent revocation, a new plan or a later review. `accept` refuses over a hold, without coaching consent, or when the days it plans have passed (`PENDING_EXPIRED`). |
| SEC-V1CIB-02, -03 | `custody.restart` | A new plan needs the coaching consent in force; its learning consent is custody's, never the app's. |
| SEC-V1CIB-04, PCG B-C1 | `custody` (`rowDigest`, `requestDigest`, `eraseHealthFacts`) | Chain and idempotency digests are keyed (schema `V1CIB-CUSTODY-2`). An erasure also clears the decision entries and stored responses of the erased events and a cached reference of them. A "not 100%" report that opened nothing can be erased by its event id (its log entry only; no marker). |
| PCG-V1CIB-F01 (MOVE, LEARNED_REARRANGEMENT) | `custody.submit` (`OFFERED_ACTIONS`, `rearranges`), engine option `withhold` (`missedSession`, `weeklyReview`), `api.logRun/logStrength` | The same review is decided without the move or the learned rearrangement; that decision is applied with its evidence; the change waits as an offer the athlete accepts or declines. A declined learned pattern is not offered again. Any evidence-applied change that rearranges days waits too. |
| 5K and marathon | `src/v1-events.mjs`, `v1/EVENT_EXTENSION_V1.json`; `r6-authority`, `r6-intake`, `r6-program`, `r6-prescription`, `r6-adaptation` (`goalChange`, review guard), `r7b-repertoire`, `r6-balanced` | The R6 event recipe generalized by an event table; values from the extension file, used only as its pinned bytes and only with an independent SSCTR record bound to them (per event, fail closed). SSCTR decision: `ssctr-decision/SSCTR_V1FC_DECISION.json` and `..._AMENDMENT_1.json`. |

## Evidence

- Suite: the full suite on the candidate (count in the dispatch). New directed tests: `test/v1fc-boundary.test.mjs`, `test/v1fc-scope.test.mjs`, `test/v1fc-events.test.mjs`.
- Journeys: `evidence/JOURNEYS_V1FC.txt` and `.json` (16 simulated athletes week by week, two journeys through the app boundary); regenerate with `node scripts/v1fc-journeys.mjs <your folder>`.
- Inherited, not re-run: the interrupted mission's reviews (`audits/v1-coaching-integration-boundary-2026-11-09/reviews/`: Security PASS_WITH_CONDITIONS, PCG with F01), its fuzz record, and Codex's read-only audit summary in the dispatch. None of them is an approval of this candidate.

## Known facts you should weigh (stated by the author, not hidden)

1. `achieved.long` is the highest long run executed in the program. A marathon athlete who executes 150 minutes early and then misses every long run keeps an effort-anchored race day. This is the R6 rule the half marathon already has (`achievedPeakBasis`); G.2 of the SSCTR decision keeps it.
2. The marathon's "no run for 7 days" and "no strength on days 1 to 3" are implemented as first run on day 8 and first strength on day 4. By calendar week, days 15 to 20 can still be easy-only when the race is early in its week (more conservative, never less).
3. The 5K and marathon tests run under a development extension authority. In the default authority both stay off until an SSCTR record bound to the extension hash exists: a 5K keeps the R7-B fallback, a marathon is UNSUPPORTED.
4. The D49 item of the interrupted mission's fuzz record (`FUZZ_V1CIB.json`, `d49Executed`): seeds 43 and 130 were classed a checker limit (a stale projection after an ASK or a clinical result); seed 386 needs a regional Situation 1 ladder, unreachable in V1.
5. Situation 1 code is still in the repository and is exercised by the earlier missions' tests through `r6-index.mjs` (the research entry point). The V1 entry point is `v1-index.mjs`; custody uses it by default.
6. The reference custody is still synthetic-only. Authentication, key management, the production database, backups, monitoring and G07 stay PENDING, as in the V1CIB contract.

## Questions by role

**SSCTR (sporting judge; a different instance from the decision author).**
1. Does the implementation follow the decision record and its amendment, value by value and condition by condition (G.1 to G.6, A, B1 with B1.8, B2, B3, C.1)? Name each deviation.
2. Are the planned 5K and marathon weeks coherent for the athletes they are planned for (journeys 08 to 12; generate others)? Is the preparatory plan the right answer for the athletes who get it?
3. Is the V1 cut of F08 safe: does any athlete get a less safe path than at `3b14804`, and does anything of Situation 1 still reach normal planning?
4. Do the normal journeys (01 to 07, 13 to 16) show coherent coordinated training: progression on executed sessions, no debt after a miss, strength and running each keeping their stimulus?
5. **If, and only if, you approve an event:** write `reviews/ssctr/SSCTR_V1FC_EVENT_RECORDS.json` as `{"records":[{"boundaryId":"V1X-5K"|"V1X-MARATHON","extensionSha256":"<the pinned hash in src/v1-events.mjs, which must equal the file's>","independent":true,"disposition":"APPROVE"|"APPROVE_WITH_CONDITIONS","evidenceStatus":"WELL_SUPPORTED"|"SUPPORTED_WITH_LIMITS","sourceIds":[...],"conditions":[...],"reviewId":"..."}]}`. A record with another disposition vetoes its event. Without a record the event stays off, which is a valid outcome.

**QRE (reliability).** By your own probes: the V1 scope cannot be bypassed (kinds, aliases, payloads on other kinds, options, a foreign record or plan); the offer path (the two evaluations agree on the record; pending, accept, decline, expiry, supersession; idempotent retries); the extension authority fails closed (bytes, hash, records, a program bound to other bytes); 10K and half-marathon outputs are byte-identical to `3b14804` (differential on your own inputs); JSON round trips of 5K and marathon programs; the marathon projection re-read (B1.8) terminates and is deterministic; mutation of the new rules; the suite count.

**Security.** Recheck SEC-V1CIB-01 to -04 against the fixes; the new surface (the offer and its decline memory under the seal, `PENDING_EXPIRED`, erasure of a logged report, the `targetSessionId` the API now sends, the `unavailable` field, `V1CIB-CUSTODY-2`); no health-derived word in telemetry; the hold cannot be released or bypassed through the new paths; whether the §7 PENDING list of the V1CIB contract is still complete.

**States to report separately:** RUNTIME_CORRECTNESS, V1_SCOPE_ENFORCED, EVENT_EXTENSION (5K, marathon), F08_STATUS, RECORD_CUSTODY_STATUS, INTEGRATION_READY, authorization for real athletes. And your verdict on the one question of this mission: is the V1-scoped CoachingCore ready to freeze (READY, READY_WITH_CONDITIONS, NOT_READY), with every blocking finding named.
