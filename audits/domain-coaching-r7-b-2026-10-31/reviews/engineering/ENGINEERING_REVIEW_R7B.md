# R7-B engineering review (independent), R7B-ENG-r1

| | |
|---|---|
| Freeze | R7B-RUNTIME-REPERTOIRE-FREEZE-1, record `CoachingCore/r7/b/RUNTIME_FREEZE_R7B.json`, commit `4995d58` on `claude/domain-coaching-r7-b` |
| Source digest | `791b531100c190f6b0ed73e892f6e212d7eee5406d144fce4a188170900a2c4f` |
| Manifest digest | `b1a1faf0a7064da99db8a33a0f04852ae3cc3a06177bcb3e4edba7cfdf222f73` |
| Identity | `node scripts/verify-r7b.mjs`: 18/18 PASS before and after the probes, same digests; no tracked file changed |
| Judge | quality-reliability-engineer 1.3.0, independent of the author; one bounded review; nothing in the runtime, tests, catalog or policy edited |
| Machine-readable record | [ENGINEERING_REVIEW_R7B.json](ENGINEERING_REVIEW_R7B.json) |

## Verdict

**NOT_READY.** One BLOCKER and five MAJOR findings fall inside this gate. The author's own evidence reproduces: 714/714 tests pass, conformance PASS (301 entries), and the differential regression shows 0 dose findings over 83 programs. The defects are on paths that evidence never checks. Those paths are the plan that a review decision produces, corrections that arrive after a context decision, and how the new R7-B states interact with each other.

## Findings

| Id | Severity | Area | Finding |
|---|---|---|---|
| QE-R7B-01 | BLOCKER | reason-based substitution | The plan does not prescribe what the decision selects in 19 of 46 applied substitutions. A SKILL_MISMATCH on `db-rdl` reports `kb-deadlift` (the previous rung), but weeks 4–8 prescribe `single-leg-rdl-db`, the **next** rung. `dead-bug` follows the same pattern: the decision says `bird-dog` and the plan prescribes `front-plank`. An athlete-chosen `to: kb-deadlift` is also ignored. Cause: the set-aside exercise leaves the usable set before the directive is looked up by `pick.id === from` (`src/r7b-repertoire.mjs:242,247,276`), so the slot falls back to the order that ranks higher skill first (`:227`). |
| QE-R7B-02 | MAJOR | rotation state vs ladder step | Under EVERY_2_WEEKS, the step `reverse-lunge → reverse-lunge-db` is accepted "from next week", yet week 5 prescribes `reverse-lunge` again. Two other alternatives follow, and the step itself appears only in weeks 10–11 (`rotationFor` cycles over pre-step alternatives that are counted from week 1). |
| QE-R7B-03 | MAJOR | stale state: novice density | `planningBase` takes the B0-C08 density state from the projection (`src/r6-adaptation.mjs:923`). After a correction, a substitution, a schedule change or an equipment statement, week 5 is planned released (`{capped:false}`), while `historicalStateOf` says `{capped:true}`. The weekly review of the same facts holds the cap. |
| QE-R7B-04 | MAJOR | correction: graduation | Graduation is stored in the context and is never re-evaluated. If the qualifying week is later corrected (adverse, or 10 executed minutes), the threshold session stays planned in weeks 4–6. With the same facts known at the boundary review, no graduation happens. |
| QE-R7B-05 | MAJOR | state transition: density cap | The cap is created only at intake. A strength-NONE athlete who goes from 2 to 4 strength days in week 1 gets `LOWER,LOWER_B,UPPER,UPPER_B` in weeks 2–4, before the first block boundary. |
| QE-R7B-06 | MAJOR | conflicting block choices | `[LADDER_STEP goblet→back-squat, MAIN_CHANGE goblet→leg-press]` is applied (MODIFY), while the reverse order is ASK. Two MAIN changes are both applied, and the last one wins. The unapplied step is still written to `ladderReached`, which later lets a substitution to `back-squat` (HIGH skill, never familiar) through; the same request without that step is ASK. |
| QE-R7B-07 | MINOR | set-aside configuration | `back-squat`, set aside for SKILL_MISMATCH, is offered again at the next boundary. Accepting it returns MODIFY ("changes recorded"), but the plan stays `goblet-squat`. |
| QE-R7B-08 | MINOR | inputs dropped silently | Some inputs end in KEEP without any question: block choices in a mid-week review of the boundary week, an unknown choice type, and choices that are not a list. An unknown substitution `to` is replaced by an automatic pick instead of an ASK. |
| QE-R7B-09 | MINOR | review-by boundary | The review-by date is read from the timestamp as written. The same instant gives KEEP when written `…T21:00:00Z` and UNSUPPORTED when written `…T02:00:00+05:00`. |
| QE-R7B-10 | MINOR | record binding | A rejecting record appended for B0-C01 next to its approval does not turn B0-C01 off (fail-open). |
| QE-R7B-11 | MINOR | B0-C10 gating | The intake's 5K fallback reads the default records, not the planner's authority. The binding test's comment claims the "off" case but asserts only "on". |
| QE-R7B-12 | MINOR | matrix truthfulness | The matrix PASS is structural only. The IMPLEMENTED entries B0-C06#c8, B0-C07#c1/#c2/#c5, B0-C08#c1/#c2 and B0-C01#c3 are contradicted by QE-R7B-01…06, and the cited tests check decision records rather than plans. |
| QE-R7B-OBS-01…05 | OBSERVATION | — | (01) Record order changes the binding hash. (02) A MAIN change also rewrites accessory rows of the same configuration. (03) A withdrawn B0-C01 keeps the week's quality until the gating review. (04) A substitution in TAPER or RACE_WEEK introduces a never-performed configuration: **escalated to the SSCTR for classification** (B0-C05 c1 vs DR-134). (05) After 2027-04-30 every decision fails closed. |

Each finding has its probe, its expected value and its actual value in the JSON record. To reproduce, run `node <probe>.mjs` from `probes/`; each probe writes `probes/out/<probe>.json`.

| Finding | Probe (check) |
|---|---|
| QE-R7B-01 | `a10-repro.mjs` (A10r), grid `a3-substitution.mjs` (A10) |
| QE-R7B-02 | `a4-rotation.mjs` (A12) |
| QE-R7B-03 | `a-state.mjs` (A3), `a2-state.mjs` (A3b) |
| QE-R7B-04 | `a-state.mjs` (A1), `a2-state.mjs` (A1b) |
| QE-R7B-05 | `a-state.mjs` (A4) |
| QE-R7B-06 | `a-state.mjs` (A8), `a2-state.mjs` (A8b) |
| QE-R7B-07 / -08 | `a-state.mjs` (A7, A9), `c-boundaries.mjs` (C6) |
| QE-R7B-09 | `b-determinism.mjs` (B4) |
| QE-R7B-10 | `c-mutation.mjs` (C1c, temp copies from `git archive HEAD`) |
| QE-R7B-11 | `c-boundaries.mjs` (C2), `c-mutation.mjs` (C1d) |

## What holds (checked)

- **Catalog binding fails closed.** A one-byte catalog change, a missing catalog, missing or unreadable records, or an expired core record each give no program and no review decision. A rejected candidate record turns its feature off.
- **Plans stay inside the catalog.** Reviewed programs with one-day schedules, bodyweight-only, bands-only and pull-up-bar-only equipment, and a 10K with one strength day validate and conform every week. Every row is a catalog configuration in a role it admits, HIGH skill appears only when admissible, and no bodyweight, band or assisted row carries kilograms.
- **Kilograms never reach bands or assistance.** Kilogram and pound logs plus kilogram confirmations change neither a band row nor its state.
- **Impossible inputs are refused or asked:**
  - **Block choices:** an unknown target, a MAIN change from an accessory or to another pattern, a MAIN change to an unfamiliar HIGH-skill lift, a change without a reason, a skipped rung and a step from an exercise not in use are each asked, never planned.
  - **Substitutions:** impossible ones are asked, and pain or an injury flag routes to a human.
- **Quality closes when its gates close.** After graduation, quality disappears when the athlete drops below three run days or changes to a REGULAR goal. A correction inside the boundary review prevents graduation.
- **Familiar repeated bouts stay off.** The lapse and the withdrawal both survive later re-plans.
- **Determinism holds for repeated input and order.** The same input, permuted input lists and permuted observations give identical plans and decisions.
- **R7-A invariants hold on the new paths:** HOLD after graduation, D52/E1 for an unexecuted ladder configuration after a return, and no load transfer on substitution. The inherited suite passes 714/714.
- **Scope left to the other gates.** Sports-science adequacy and the declared interpretations R7B-DECL-01…12 belong to the SSCTR. Catalog completeness and reachability belong to the Quality judge.

## For the owner

QE-R7B-01…06 need runtime changes and a new freeze. Any recheck is narrow and runtime-only, limited to what is new and blocking under the Founder loop bound, and the coordinator decides whether to request one. QE-R7B-OBS-04 goes to the SSCTR.

R7B_ENGINEERING_GATE = NOT_READY
