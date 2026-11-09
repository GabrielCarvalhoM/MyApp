# V1CP Fix-Forward: request for the single independent review round

**Candidate:** branch `claude/v1cp-fix-forward`, commit named in the dispatch (worktree `.claude/worktrees/v1-coaching-productization`). Base: `8039d94` (V1CP closure; last reviewed runtime `5ee9dec`). Historical reference: R7D-FREEZE-6 (`40daadd`, worktree `domain-coaching-r7-d` at `32b5ce3`), read-only.

**Bound:** one review round of this consolidated candidate (SSCTR fresh instance, QRE, Security, in parallel). At most one narrow, runtime-only fix cycle may follow for a new finding; anything else closes with a named blocker (Founder rule, bounded review cycles). No judge edits the runtime, the tests, the canon or another judge's record.

## What the candidate claims (to verify, not to accept)

| Item | Claim | Where |
|---|---|---|
| NB-1 | Chaining per sport and per condition as SSCTR CH-r2-1..10 states (moved sports at the stricter rung carrying unresolved conditions; unchanged case not recorded; recurrence and same-condition-in-wait persistence; per-sport 14-day count across early ends, declared breaks and disjoint reports; region merge; separate answers for two reports of one condition) | `src/r6-adaptation.mjs` Situation 1 block (`boundConds`, `answerOf`, `markSport`, `chainedReport`, `supersededChain`, `episodeCheck`, `wellbeingCheck`, `episodeWeekly`, `episodeLadder`, `sportPlan`) |
| NB-2 (D3) | The race as the athlete's own event in scope (window, wait, ladder, recipe step, readiness restart): the rung's session, touch easy, no strength that day, no completion item; paths offered once; leaving the scope said; no pre-race start after the race | `src/r6-composition.mjs` (`raceAsOwnEvent`, `wellbeingSessions`, `restartRaceSessions`, `fixedStartOf`), `src/r6-adaptation.mjs` (`raceScope`, `finishProposal`, `RACE_IN_RETURN`) |
| NB-3..NB-6 | As in the WIP commit's tests (rest/wait days before a break; unchecked ladder week; race result lower bound; D49 on executed sets) | `test/v1cp-ff.test.mjs` |
| D1, D2, D4 | FASTER only with a whole executed and checked week (FF-Q1); early end from the day after the report with today's screen, weekly form ends with the plan week (FF-Q3); waited days count (FF-N1); 1 to N days, never 0 (FF-Q6) | idem |
| D5 | `guidance` level on every clinical route (URGENT_CARE_ADVISED for W2–W5, X1); interim wording | `src/v1-f08.mjs` (`guidanceOf`, `signRoute`), `finish` |
| D6 | Demanding = Balanced prescriptions (limitation recorded, FF-Q4) | test FF-Q4 |
| D7 | Dispositions of HQ-V1CP-SSCTR-Q01..Q12 in SSCTR-FF-Q5; queue 235 unchanged | SSCTR decision record |
| SB-1..SB-5 | As in the WIP tests (new stop screened; clinical before id conflict; unreadable holds fail closed; hold fact always recorded; default restart asks) | `test/v1cp-ff.test.mjs`, `test/v1cp-ff-guard.test.mjs` |
| QRE-V1CPR-02/-05/-06 | Restart checks read; race on every route (composition rule); per-condition improvement | idem |
| LEX-3 | The 43 directed texts, with and without the answer no | `src/r6-clinical.mjs`, test FF-Q8 |

## Evidence (re-run it; do not trust it)

- RED on 5ee9dec: `evidence/RED_ON_5ee9dec_final.txt` (43 of 50 fail; the 7 that pass are guards of behaviour already right).
- GREEN: the full CoachingCore suite (`node --test` from `CoachingCore`, `V1CP_ROOT` unset): `evidence/GREEN_FULL_SUITE.txt`.
- Differential (read-only `audits/v1-coaching-productization-2026-11-08/evidence/differential.mjs`): `evidence/DIFFERENTIAL_FF_vs_FREEZE6.json`, `evidence/DIFFERENTIAL_FF_vs_5ee9dec.json`, `evidence/DIFFERENTIAL_FF_vs_5ee9dec_fields.txt`.
- Journeys A–G: `evidence/f08-journeys.mjs`, `evidence/JOURNEYS_FF.json`.
- Mutation: `evidence/MUTATION_FF.json`.
- Integration contract delta: `audits/v1-coaching-productization-2026-11-08/INTEGRATION_CONTRACT_V1CP.md` section 10.

## Rules for every judge

- Probe only on your own scratch copy in a new, uniquely named folder under your scratchpad. Never `rm -rf` or any recursive deletion; never touch the repository, worktrees, freezes or history. Never run `npm run verify` or any `verify-r*` script.
- Write only your own record (JSON and MD) under `audits/v1cp-fix-forward-2026-11-09/reviews/<role>/`. No commit, no push.
- Classify each named blocker CLOSED or OPEN with evidence; classify anything new as BLOCKING (with a concrete failing scenario) or NON_BLOCKING (condition or future item). Do not change the criteria to pass, and do not reopen R7-D or earlier records.
- States stay distinct: implementation done, technical validation, integration readiness, authorization for real athletes, app publication readiness. F08 stays F08_OPEN and V1_COACHING_AUTHORITY_READY = NO unless a judge's own authority says otherwise, and none here does.

## Chief observations for classification (not fixed here: outside the named blockers)

- **CF-OBS-1 (pre-existing at 5ee9dec, reproduced at the candidate).** When the client omits the reference state, a weekly review plans over an unreleased `CLINICAL_HOLD` that the record holds (status MODIFY). With the reference state sent, the clinical dependency stands (CLINICAL_HUMAN_REQUIRED); with an altered hold row, the candidate now holds (`record.f08Unreadable`, SB-3). The reference-state chain is the R7 continuity mechanism and the record hold is what a readiness declaration binds (QRE-V1CPR-08). Security and QRE: is a record hold that is not enforced without the reference state blocking for this candidate, a condition for integration, or acceptable as the protocol's contract? A fix would be narrow and runtime-only (an unreleased record hold keeps the clinical route on every review kind but the readiness declaration and a declared break), but it would change default-path outputs wherever a clinical decision is followed by a review sent without its reference state.
- **CF-OBS-2.** QRE-V1CPR-05 (a), an EVENT_DATE_CHANGE that moves the race into a return week, could not be built on the 8-week fixture: the R6 event rule refuses a new date closer than its horizon ("too close to plan safely"). The race rule is a composition rule applied on every route that places a race in scope; the date-change route is covered by construction, not by a directed test.
