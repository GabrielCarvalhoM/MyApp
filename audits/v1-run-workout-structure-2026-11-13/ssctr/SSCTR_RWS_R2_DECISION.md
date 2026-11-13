# SSCTR-RWS-R2-DECISION: native run formats (2026-11-13)

`SSCTR_RWS_R2_DECISION.json` is the authoritative record. Runtime values are under `values`; they are meant to become `CoachingCore/v1/RUN_FORMATS_V1.json`. The reference cases are in `workedExamples` (WE-01 to WE-34).

**Author.** An AI instance of the SSCTR acting as decision author, under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical sporting content only. It is independent of the Chief, who wrote the proposals. It holds no human credentials, and this record is not human, clinical or empirical validation. It enables no boundary and judges no implementation. A fresh SSCTR instance must judge the candidate and issue the `V1X-RUN-NATIVE` enabling record. No frozen file was changed.

**Builds on.**
- `SSCTR-V1RC-DECISION-r1`: the bands, the 1.5% on-band fraction, recalibration and withdrawal.
- `SSCTR-RWS-DECISION-r1`: the history for this request, and still the authority for `EQUIVALENT` mode. This record supersedes four of its items for native prescription only: Q1 (time ceiling per repetition), Q3 (5-min minimum), Q4 (time-only recoveries) and Q6 (no distance target on continuous runs). It also narrows Q9 for progressions that stay inside one domain.

**Literature access** (Europe PMC REST via Node; no web pages used as evidence):
- **Read in full-text passages:** Haugen 2022, Schoenmakers 2026, Segev 2026, Knopp 2024, Grivas 2026 (auxiliary only) and Zouhal 2024.
- **Read as abstracts only:** Seiler 2013, Buchheit and Laursen 2013, Casado 2022, Ranieri 2026 and Varela-Sanz 2023.
- **Reused from earlier records, not re-read:** the GNSS sources, Seiler and Hetlelid 2005 and Frandsen 2025 (from r1), and Jones 2019 (from V1RC).
- **Negative searches:** no study compares time-prescribed with distance-prescribed sessions, no study covers pyramid sessions in runners, no trial covers progression runs in recreational runners, and no wrist-GNSS validation covers repetitions.
- **Validator:** Python is not installed, so the skill validator did not run. Node confirmed that the JSON parses.

## Rulings

Categories: (a) already approved, (b) new decision, (c) depends on evidence.

| Q | Ruling | Cat. | What it says | Conf. |
|---|---|---|---|---|
| N1 Catalog | APPROVE_WITH_CONDITIONS | b on a | Each family keeps the domain and the repetition and recovery minutes of its ladder. Distances run from 200 to 950 m in 50 m units, then from 1000 to 6000 m in 100 m units. **Repetition length is pinned to the step**; only pyramid flanks may be shorter, down to the family's shortest ladder repetition. Recoveries are the step's own minutes, walk or jog. | LOW |
| N2 E1, E2 | APPROVE_WITH_CONDITIONS | b tied to a | Work and each repetition must fall within **[0.9, 1.015]** of the step, measured at the fast and slow band edges. 0.9 is the engine's completion read and 1.015 is the V1RC on-band fraction. E3 allows the budget plus **at most one extra recovery interval of the step**. Any wider tolerance is abstained (c). | LOW |
| N3 Eligibility | APPROVE_WITH_CONDITIONS | b | **NOVICE:** even repeats with time recoveries only, and continuous runs stay in time. **INTERMEDIATE and EXPERIENCED:** every pattern. **Phases:** ESTABLISHMENT and POST_EVENT stay in time. CONSOLIDATION allows even repeats and continuous runs only. SPECIFIC has no pyramid. TAPER and RACE_WEEK allow even repeats only. | LOW |
| N4 Continuous | APPROVE_WITH_CONDITIONS | b | The format is **"D km, or M min if that comes first"**, and either end counts as done. The band is the session's own domain band; the observed easy band is never used for LONG. D is the largest 1 km (else 0.5 km) value that a runner at the ceiling covers within M, subject to E4. A runner who is slower stops at M, which is not a shortened run. No run ever lasts longer than the time prescription. | LOW |
| N5 Distance recovery | APPROVE_WITH_CONDITIONS | b | Distance recoveries are a jog, for INTERMEDIATE and EXPERIENCED runners, with even repeats, in build, development, next-block and specific phases. The distance is the step's recovery minutes at the RECOVERY fast edge, **rounded up** to 50 m. Walking is allowed and simply makes the recovery longer. | LOW |
| N6 Progressive | REJECT + APPROVE_WITH_CONDITIONS + ABSTAIN | b; c | **Rejected:** the easy, then steady, then domain run. Its steady minutes have no band, and its final block is longer than the step's repetition. **Approved:** PROGRESSIVE_REPEATS (threshold, half and marathon: even repeats moving from the slow edge to no faster than the fast edge) and PROGRESSIVE_EASY (easy and long runs: the second half may rise toward the top of the easy band). **Abstained:** progressions across domains, which need a steady domain. | LOW |
| N7 Completion | APPROVE_WITH_CONDITIONS | a + b | A step counts as done when a lap is confirmed, not when the GPS distance matches. GPS affects only the evidence tier. Repetitions under 5 min may be prescribed but are never calibration evidence. Native repetitions have no time ceiling, but each one shows its estimated time range. Two residuals are accepted: a runner far faster than the band is read as partial, and GPS under-reading can lengthen a repetition by up to about 9%. | LOW |
| N8 Suppressions | APPROVE_WITH_CONDITIONS | a + b | The author's list is kept and seven reasons are added. The order is fixed (see below). Only NO_FORMAT_WITHIN_ENVELOPE can fall back to `EQUIVALENT` (r1, repetitions of 5 min or more). | MOD |
| N9 Taper and touch | APPROVE_WITH_CONDITIONS | b | The taper keeps the peak session's recorded distance as even repeats with the engine's reduced count, if E1–E5 pass against the taper step. The touch uses even repeats with time recoveries; otherwise it falls back to time. No other pattern is used. | LOW |
| N10 Variety | APPROVE_WITH_CONDITIONS | b | Rotation picks `entries[weekIndex mod n]` among the admissible passing entries. It is not progression, the dose key is unchanged and the format stays fixed for the week. After a partial or harder-than-target session, the next session at the same step uses even repeats again. | LOW |

**Suppression order:**
1. EXTENSION_NOT_ENABLED
2. HOLD_NO_PRESCRIPTION
3. CLINICAL_ROUTE
4. WARNING_SIGN_SCREEN_REQUIRED
5. MODE_WALK_JOG_RESTART_RETURN
6. ENGINE_CONVERTED_TO_EASY
7. TEST_ALREADY_DONE_THIS_WEEK
8. NOT_A_NATIVE_FAMILY
9. PHASE_NOT_ELIGIBLE
10. FIRST_EXPOSURE (engine flag: ladder step 0)
11. EXPRESSION_PREFERENCE_TIME
12. EXPERIENCE_NOT_ELIGIBLE
13. BAND_UNAVAILABLE
14. MARATHON_ESTIMATE_ABOVE_360_MIN
15. NO_FORMAT_WITHIN_ENVELOPE
16. NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE
17. TEXT_CHECK_FAILED
18. STRUCTURE_ERROR

## Catalog summary

| Family | Domain | Rotation entries | EQUIVALENT fallback |
|---|---|---|---|
| THRESHOLD | THRESHOLD_CONTROLLED (repetitions 5, 8, 10 min) | even, even + distance recovery, mixed, pyramid, progressive repeats | yes |
| FIVE_K_SPECIFIC | FIVE_K_EFFORT (2, 3 min) | even, even + distance recovery, mixed, pyramid | no |
| TEN_K_SPECIFIC | TEN_K_EFFORT (3, 4 min) | even, even + distance recovery, mixed, pyramid | no |
| HALF_MARATHON_SPECIFIC | HALF_MARATHON_EFFORT (10, 12, 15 min) | even, even + distance recovery, mixed, pyramid, progressive repeats | yes |
| MARATHON_SPECIFIC | MARATHON_EFFORT (15, 20 min) | the same as half marathon, plus the 6:00:00 rule | yes |
| RACE_TOUCH | event domain | even only, time recoveries | 5-min touches only |
| EASY, LONG | EASY, LONG bands | continuous distance, progressive easy | — |
| RECOVERY_EASY, SHAKEOUT | RECOVERY band | continuous distance | — |
| WALK, WALK_JOG, RACE, FAMILIAR_REPEATED_BOUTS | — | time only | — |

**Coverage** (scratch sweep; the bands that admit at least one even-repeat format):

| Ladder | Bands admitted |
|---|---|
| 5K | 39–58% |
| 10K | 58–65% |
| Threshold | 68–73% |
| Half marathon and marathon | 73–82% |
| 5K touch | 8% |
| Continuous runs | 95% |

Step 0 of every ladder stays in time (first exposure).

## Founder examples

| Example | Admitted? | Example input (worked example) |
|---|---|---|
| 6 × 800 m | Yes, where 800 m falls within [0.9, 1.015] of the step repetition | 10K step 3 at 4:50–5:00 (WE-01); 5K step 3 at 3:40–3:45 (WE-03). At 5:05–5:20 it becomes 6 × 750 m (WE-02). |
| 8 × 400 m | Yes | 5K step 1 at 4:50–5:00 (WE-04). Time at a 5:05 slow edge (WE-05). |
| 5 × 1000 m | Yes | Threshold step 2 at 4:50–5:00 (WE-06); 10K step 2 at 3:50–4:00 (WE-07). |
| 8 km continuous | Yes, INTERMEDIATE and above | "8 km or 50 min" with an easy ceiling of 6:15 (WE-08). NOVICE stays in time (WE-09). |
| 16 km long run | Yes, as "16 km or 90 min" with a long ceiling of 5:25 (WE-10) | Most slower in-band runners finish by time. With a 6:20 ceiling at 100 min it becomes 15 km (WE-11). |
| Pyramid | Yes, outside SPECIFIC, CONSOLIDATION and TAPER, at steps with repetitions longer than the family's shortest | 1400-1600-1600-1400 m (WE-14); 700-800-800-800-800-700 m (WE-13) |
| Mixed | Yes | 2 × 1500 m + 2 × 8 min (WE-16) |
| Progressive | Only inside one domain | 5 × 1000 m progressive within the band (WE-18); 8 km progressive easy (WE-20). Easy-to-threshold runs: not admitted. |
| Recovery by time / distance | Time is the default; distance is for INTERMEDIATE and above | 4 × 900 m with a 300 m jog (WE-21); 6 × 750 m with a 350 m jog (WE-22) |

## Escalations

- **Chief:** handoff §3 must say that continuous distances carry the canonical minutes as a time ceiling. Section 4 E3, the patterns, the rotation and the order are in `values`.
- **Founder:** information only.
  - Coverage is partial for 5K and 10K. Widening it needs evidence or funded human review.
  - Progressions across domains need the steady domain (LATER.RUN.STEADY), which is a scope decision.
- **Product:** wording of "D km or M min", the estimated ranges, the recommendation to use the time version in adverse conditions, and the default expression.
- **Data/G03:** what `targetMet` and the measurement source mean. Planned versus executed km is not an adherence measure.
- **Engineering/QRE:**
  - T3: steps and formatHash must survive in the record.
  - Whether V1RC Q8 reads the partial flag (carried over from r1).
  - Subtracting the strides from the continuous-run size.
  - Determinism of the candidate order.
- **Clinical:** nothing new.

**Queue.** Proposed only, not appended: HQ-RWS2-SSCTR-NATIVE, HQ-RWS2-SSCTR-CONTINUOUS and HQ-RWS2-SSCTR-MEASURE, all as QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.

**Expiry.** 2027-05-11, or earlier on any trigger listed in the JSON. **Governance:** no gate is closed, nothing is published and no boundary is enabled.
