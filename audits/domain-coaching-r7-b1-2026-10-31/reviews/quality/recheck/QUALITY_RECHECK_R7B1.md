# R7B1-QUALITY-RECHECK-1 — the one narrow Quality recheck, on R7B1-FREEZE-2

I am the same independent judge who wrote R7B1-QUALITY-r1 (FREEZE-1, NOT_READY). I did not author this runtime. Details and counts are in [QUALITY_RECHECK_R7B1.json](QUALITY_RECHECK_R7B1.json).

**Bytes judged.** R7B1-FREEZE-2: record sha256 `e75a2799…`, freeze commit `146ebb8`, source `f54e5c03…`, manifest `980d8301…`.

`node scripts/verify-r7b1.mjs --tests` passed 25/25 before my work and 24/24 without `--tests` after it. I worked read-only. I wrote only under `reviews/quality/recheck/` and deleted my earlier scratch mirror.

## Earlier findings

| Id | Was | Now | Evidence |
|---|---|---|---|
| QR7B1-01 | MAJOR | **Resolved** | q13 covered 93 no-lower-skill questions: the q05 grid with permanent losses and dated windows, plus the substitution path with a window ahead. All 24,224 checks passed. The missing input is the `acceptGap` field the review reads, and the text names only lost equipment. "Keep" changes nothing. "Leave the slot out" is recorded in 93 of 93 cases and disclosed as `accepted`. After it, nothing needs the lost equipment, nothing climbs, and the set-aside exercise never returns. The next two weekly reviews do not ask again. q12 shows no false equipment claim. |
| QR7B1-02 | MAJOR | **Resolved** | q08: in all four rotation witnesses, the selected exercise takes the rotation slot and nothing never performed enters the taper. q01: no never-performed exercise in event weeks (C1: 24 → 0), and every event-week slot that is newly stood in or left out is disclosed (C10: 0 failures, 206 knock-on slots disclosed). q09c: no replaced slot misses the selected exercise (EVERY_2_WEEKS: 6 → 0). q14: of 154 equipment changes sent in event weeks, none brings a never-performed exercise in or leaves a slot out undisclosed, through the post-event week. |
| QR7B1-03 | MINOR | **Resolved** | q03: naming is offered in exactly the 27 questions where it works. The other 14 offer only keeping, with no missing input. "Add equipment" is gone. |
| QR7B1-04 | MINOR | **Resolved** | q10: the weekly review that leaves the slot out now discloses it, with its sessions and slots. |
| QR7B1-05 | OBS | **Resolved** | q07 and q06: when the program ends with the post-event week, the option says so and the rest text reads "after this program". The 16-week program is unchanged, and its option still works. |

## Regressions checked

- **QE-R7B1-01 (clinical screen first):** q14 sent 6 reviews with pain or illness, each together with a block choice. All 6 go to a human with no proposal, as they do without the choice.
- **Week-level slot check:** q03 statuses are identical to FREEZE-1 (MODIFY 1567, ASK 789). q02 witnesses are unchanged.
- **Reachability through reviews (p04):** 67 configurations, with the same sets as FREEZE-1.
- **Unchanged probes:** p14 finds no duplicates in 48,600 sessions. q11 finds 0 `fallbackFor` violations. q01 checks C2, C3, C6, C8 and C9 all pass.

## New findings

None.

## Unchanged and routed

- QR7B1-06: knock-on changes are not listed in `substitutions`. This is pre-existing; event-week knock-ons are now disclosed.
- QR7B1-07: owners are to be named at closure.
- Under EVERY_2_WEEKS, the selected exercise alternates through rotation in the weeks after the event. That is the rotation's own cadence and lies outside the delta.
- The sports-science adequacy of leaving a slot out, or of "Keep X", after a SKILL_MISMATCH is the SSCTR's call (F13).

R7B1_QUALITY_GATE = READY
