# SSCTR V1FC recheck (SSCTR-V1FC-RECHECK-r1), 2026-11-11

The authoritative record is `SSCTR_V1FC_RECHECK.json`. This is the single narrow recheck the cycle bound allows, on commit `06bbc7f`.

I am the same independent SSCTR instance that wrote the review: an AI agent with no human credentials and no clinical equivalence. I did not author the fixes or Amendment 2; I judged only their implementation.

**How I checked.**
- A fresh `git archive` extract of `06bbc7f`, with my review probes rerun on it.
- Differentials against the `2d089c0` extract: 16 inputs for the 10K, the half and the normal journeys, and 10 inputs for the 5K.
- The fix-cycle and V1FC test files: 45 of 45 pass.
- No verify script was run and nothing was deleted.
- The extension hash `8a4ba9b3…96a8` equals the `EXTENSION_SHA256` pinned in `v1-events.mjs`.

## Findings

| id | status | evidence |
|---|---|---|
| R-01 | CLOSED | The ten-week long-run gap now gives a completion race day, with the later or shorter event offered first from week 6. Amendment 2's "to verify" athletes behave as written: the fully executed reference and the one missing only the last two specific long runs both keep marathon effort. Missing weeks 5 to 9 gives a completion. The taper long run follows the 30-day window. The 10K and the half are byte-identical to `2d089c0`. |
| R-02 | CLOSED | Each proposal rebuilds the projection note, and the completion note replaces it when race day becomes a completion. The plan-creation note states the window. |
| R-03 | CLOSED | The taper quality is 0.6 then 0.5 of the peak, for races on any weekday. |
| R-04 | CLOSED | Post-race light strength sessions are at least 7 days apart through day 14. |
| R-05 | CLOSED | The weekly-share sentence now appears with 4 run days. |
| R-06 | CLOSED | Walk/jog athletes, and novices with 2 run days, no longer get the threshold note. |
| R-07 | CLOSED | The disclosure now says "do not train for 7 days". |
| **RC-01 (new, LOW, not blocking)** | OPEN, condition | The completion note opens with "a longest continuous run of 150 minutes, and its executed long run is below 150". This contradicts itself; the next sentence gives the correct windowed value. Product copy fix before any athlete-facing use. |

## Regression check

- **5K:** planned sessions and decisions are identical to `2d089c0`. The only difference is the intended R-06 note change.
- **Normal journeys:** byte-identical to `2d089c0`.
- **F08 cut:** unchanged on the V1 engine. QRE-V1FC-02 adds asking for an unknown condition and an unrecognized sign key, and a yes answer still routes to the clinical hold.
- **Sporting side of other judges' fixes:**
  - SEC-V1FC-03: a session named as missed that belongs to another week, or is still ahead, is asked about and never moved.
  - QRE-V1FC-01: a later marathon date asks for a new plan.
  - Both are coherent.

## Verdict

**READY_WITH_CONDITIONS** for the V1-scoped CoachingCore, with both the 5K and the marathon, on synthetic data only.

Conditions:
- **V1-C1:** synthetic data only.
- **V1-C2:** RC-01 copy fixed before any athlete-facing use.
- **V1-C3:** athletes reach the engine only through `v1-index.mjs`.
- **V1-C4:** human-revalidation queue items HQ-V1FC-SSCTR-A, B1, B2 and B3, appended by the Founder or the Chief.
- **V1-C5:** urgency wording stays INTERIM_PENDING_G04.
- **V1-C6:** observations O-01 to O-05 carried to the re-review due 2027-05-11.

Real athletes: NOT AUTHORIZED.

## Event records

I appended two records bound to `8a4ba9b3…` (APPROVE_WITH_CONDITIONS, SUPPORTED_WITH_LIMITS):
- **V1X-5K**
- **V1X-MARATHON**

The earlier 5K record is bound to `e53a282d…` and enables nothing at `06bbc7f`.
