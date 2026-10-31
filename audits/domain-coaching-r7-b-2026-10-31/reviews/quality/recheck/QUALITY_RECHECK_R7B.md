# R7-B: Quality narrow recheck (FREEZE-2)

| | |
|---|---|
| Recheck | R7B-QUALITY-RECHECK-1 of R7B-QUALITY-REVIEW-1 (FREEZE-1, NOT_READY, committed `0fb1339`); same independent judge |
| Frozen identity | R7B-RUNTIME-REPERTOIRE-FREEZE-2, commit `10b26d6`, source digest `d2c730140973c9037de8729387012f830204072053729fbf9bdebf1bc5fe7241`, manifest digest `d509452e4ad2aa98bce2889bd723c0faa22d2394aa5630d9f5a56588c9e6c23a` |
| Frozen bytes | `node scripts/verify-r7b.mjs --freeze 2` passed 19/19 before the probes and again after them, with the same digests. I wrote nothing outside `reviews/quality/recheck/`. |
| Record | [QUALITY_RECHECK_R7B.json](QUALITY_RECHECK_R7B.json); probes in this folder, raw outputs in [out/](out/) |

## Method

I copied the FREEZE-1 probes here unchanged and re-ran them. I added five probes for the specific changes:

- **p09c**: the graduation path stated for each run class.
- **p09d**: an EASY_LOW athlete with a 10K race.
- **p12b, p13b**: what fills a slot after a later rotation turn.
- **p17b**: whether following the pattern disclosure's option closes the gap.

As before, only public entry points were used.

## Status of the FREEZE-1 findings

| Id | FREEZE-1 | FREEZE-2 | Evidence |
|---|---|---|---|
| Q-R7B-01 | MAJOR | RESOLVED | Accepted accessory steps now hold under every cadence; the easier configuration never comes back, and none of the 7 accepted steps reverts. A later turn never lands on a lower rung of the same ladder. (p13, p12, p12b) |
| Q-R7B-02 | MAJOR | RESOLVED | EASY_UNKNOWN is now told "No harder session in this plan" (`path: NONE_IN_V1`), which matches the runtime. WALK_JOG and EASY_LOW are told graduation happens at a block review, and they do graduate. The V1 gap is recorded and its policy question routed to SSCTR and the Founder. (p09, p09b, p09c) |
| Q-R7B-05 | MINOR | FIXED | 0 duplicate rows in 48,600 strength sessions (FREEZE-1 had 1,080). (p14) |
| Q-R7B-07 | MINOR | FIXED | The pull disclosure names skill as the limit and offers only "Add a band", which does close the gap. The pattern disclosure carries the limit, and adding the equipment it suggests closes the gap. (p07, p17, p17b) |
| Q-R7B-03, -04 | MINOR | ROUTED, recorded truthfully | `fixCycle.recorded` names an owner for each; the behaviour is unchanged, as recorded. (p02, p11) |
| Q-R7B-06 | MINOR | RECORDED_DIVERGENCE, truthful | The divergence on `witness:WP-STR-06` matches what the runtime does. (p10) |
| Q-R7B-08 to -11 | OBSERVATION | ROUTED, recorded truthfully | All six items are listed with an owner. |

## Did the fix cycle introduce anything new?

Reachability is unchanged or better:

| Item | Reachable |
|---|---|
| Run families | 10 / 10 |
| Strength configurations | 74 / 76 (the same two unreachable: `back-extension`, `hip-hinge-practice`) |
| Templates | 7 / 7 |
| Archetypes | 5 / 5 |

The full sweep (27,608 programs) and the per-configuration search produced exactly the same sets as on FREEZE-1, and the rotation sweep saw the same configurations. The review-driven probe lost nothing, and `db-step-up` can now be reached after a review instead of only through declared familiarity.

There are no new blocking findings. Two new observations:

- **Q-R7B-R1:** after a full cadence period, a rotation turn may move a stepped-up slot to a lower-skill alternative that is not on the same ladder (pull-up → band-pulldown at week 13). This matches the revised rule and the catalog.
- **Q-R7B-R2:** MOVEMENT_PATTERN_UNAVAILABLE still says "No available equipment supports PUSH" when only the second push slot is empty; its option is now correct.

Outside this delta, I noted one matter for SSCTR: the consolidation week holds back EASY_LOW graduation evidence. The block reviews disclose this truthfully.

No BLOCKER or MAJOR finding remains in this gate for the bytes judged here.

R7B_QUALITY_GATE = READY
