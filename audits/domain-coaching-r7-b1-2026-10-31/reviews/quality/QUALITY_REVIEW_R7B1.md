# R7B1-QUALITY-r1 — narrow Quality review of R7B1-FREEZE-1

Independent Quality & Reliability judge. I did not author this runtime. Scope: only what the R7-B.1 delta touches (request §Scope 1–4). Details, reproductions and counts are in [QUALITY_REVIEW_R7B1.json](QUALITY_REVIEW_R7B1.json).

**Bytes judged.** R7B1-FREEZE-1, freeze commit `d41df8b`, source `976a1335…`, manifest `2fc0a59a…`. `node scripts/verify-r7b1.mjs` PASS 23/23 before and after. I ran it without `--tests`; the recorded 24/24 includes the suite. I worked read-only. FREEZE-2 comparisons ran on a `git archive 10b26d6` mirror in the session scratchpad. I did not run any mutate, freeze or `--write` script.

## Findings

| Id | Severity | Finding | Evidence |
|---|---|---|---|
| QR7B1-01 | **MAJOR** (created by R7-B.1) | The `NO_LOWER_SKILL_ALTERNATIVE` question can be a dead end. "Name a … exercise" has no effect in 13 of 46 reachable questions, including the R7-B.1 test fixture (dumbbells + bands, db-row → band-row, bands lost) and a full-equipment athlete. Its missing input `substitution.to` is not read by the EQUIPMENT_CHANGE review it answers (0/46 resolved by resubmitting). Its text can name equipment the athlete still has ("one-arm-db-row needs dumbbells and bench that is not available"). The only way out is not recording the real loss. | q04, q05, q12 |
| QR7B1-02 | **MAJOR** (residual of OBS-04 / R2-04; identical on FREEZE-2) | Under EVERY_2_WEEKS rotation, a reason-based substitution of a rotation-placed exercise puts an unnamed configuration in its slot (`slipsFrom` sees template rows only). In the taper week that configuration has never been performed, and nothing discloses it. Example: push-up → db-bench-press gives incline-push-up in w9-str-d2, whose instruction says "no new exercises". q01: 24 of 6,888 applied decisions. Non-event slot violations: 6/0/0 (EVERY_2_WEEKS/COACH_DECIDES/FIXED), down from 33/32/32. | q08, q01, q09c |
| QR7B1-03 | MINOR (created by R7-B.1) | The new question "Every admissible alternative … is already in a session with X" offers "Add equipment". That option has no effect or is impossible in 29 of 41 cases. Naming another exercise works in 27 of 41, but the question does not offer it. | q03, q02 |
| QR7B1-04 | MINOR | A weekly review that leaves an event-week slot out (a substitute planned before the taper, then missed) gives no disclosure and no text. Only the `eventStandIns` field records it. | q10 |
| QR7B1-05 | OBSERVATION | Some wording is wrong in a program that ends with the post-event week. The second option ("make this change after the post-event week") cannot be acted on, and the rest-by-design text says "start after the post-event week". The decision's detail correctly says "beyond this program". | q07, q06 |
| QR7B1-06 | OBSERVATION (pre-existing, preserved by a test) | When the selected exercise already held another slot, the knock-on change to that slot is missing from `substitutions`. | q09c, q09b |
| QR7B1-07 | OBSERVATION | The recorded-not-changed items (R2-05 as the R18 path, R2-OBS-01, OBS-01…03, the inherited taper equipment change sent to the SSCTR) are recorded truthfully. Their owner, "a later runtime mission", should be named at closure. | records |

## What holds

- **Reachability:**
  - p01 (27,608 programs) is identical to FREEZE-2, and so are p02, p03, p06, p07, p12, p13, p14 and p17b.
  - p16: 74/76 configurations, 7/7 templates and 5/5 archetypes are reached, unchanged. The only change is cable-face-pull, from familiar-only to reached through a review.
  - p04 through reviews: 66 → 67 configurations, none lost. q02 confirms that the changed substitution witnesses are the intended R2-04 change.
- **`NO_NEW_EXERCISE_IN_EVENT_WEEKS`** (q01: 3,208 disclosures, 122 with stand-ins, 3,110 with omissions). Its stand-ins, omitted sessions and weeks match the sessions' `eventStandIns`. Each stand-in row exists with its note and is never heavier than its logged load. `startsAfterEvent` and the detail text are true, and the first exposure after the event is an establishment. Its second option has an effect where weeks follow the event (q07).
- **Rest by design** of a session with every row left out is reachable (q06) and listed in the last decision's omitted sessions.
- **No duplicate rows** (q01 C5, q02, p14).
- **`fallbackFor`** is consistent with the recorded selections (q11: 96 rows, 0 violations).
- **Slot consistency:** under FIXED and COACH_DECIDES the replaced slot always takes the selected exercise.

## Routing

QR7B1-01 was created by this mission's correction, so it fits the contract's single correction cycle. QR7B1-02 is a residual of the closed blockers OBS-04 and R2-04 on rotation programs. The SSCTR decides whether it keeps OBS-04 open. Neither finding needs a catalog or policy change to fix. If the fix for QR7B1-01 changes which configuration a SKILL_MISMATCH slot may take, the SSCTR is consulted.

R7B1_QUALITY_GATE = NOT_READY
