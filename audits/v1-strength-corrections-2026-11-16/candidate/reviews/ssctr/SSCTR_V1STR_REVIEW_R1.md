# SSCTR review R1: V1STR implemented candidate (four strength corrections)

**Record:** `SSCTR-V1STR-REVIEW-R1`, 2026-11-16. Structured version: `SSCTR_V1STR_REVIEW_R1.json` (same folder).

**Reviewer:** SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, protocol SSCTR-EP-1.0.0.
- A subagent instance launched by the Chief with the project SSCTR adapter text as its instructions. Model inherited (claude-opus-5-5). This instance cannot verify its own dispatch mechanism and does not claim a native agent-type dispatch.
- Not the author of the candidate (the author is the Chief on Fable 5.2) and not the author of the 2026-11-13 decision it is checked against.
- Software provisional reviewer, `PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY`. No human credentials. This is not human, empirical or clinical validation.

**What this is:** the separate review of the implemented candidate that `SI-V1-SSCTR-SQ-1` to `SQ-4` (revision `SI-V1-SSCTR-r1`) said was still required. It checks the implementation against those decisions. It makes no new dose decision and adds no new policy.

**What this is not:** no enabling record is issued here (`SSCTR_V1STR_RECORDS.json` is not created in this round). No gate is closed. Nothing is published. The human queue is not edited.

## 0. Target and bytes

| Item | Value |
|---|---|
| Worktree | `.claude/worktrees/v1-strength-corrections`, branch `claude/v1-strength-corrections` |
| Candidate commit | `21838cb` (HEAD verified; working tree clean before this review) |
| Base | `2dfa216` (COACHINGCORE-V1-RACE-FORECAST-FREEZE-1) |
| `CoachingCore/v1/STRENGTH_EXTENSION_V1.json` | `e375a8be02e4be6df44f06f4d0bd51bb4e68692c153b145239ae81b9fd32cacb`, verified against the bytes; equals `STRENGTH_VALUES_SHA256` |
| `src/v1-strength.mjs` | `7e5eb85b…16a6` |
| `src/v1-strength-index.mjs` | `937a0839…63b9` |
| `src/r7b-repertoire.mjs` at 21838cb | `6bd4f365…3ec53833` (base `8bdd5d5d…a483`, the bytes the 2026-11-13 decision read) |
| Decision JSON bound by the values | `f8dee367…d379`, verified |
| Catalog R7B0-CATALOG-2 | `ceee276a…92f9`, verified, same as the decision |
| R6-POLICY-5 (`r6/PROGRAM_POLICY_R6.json`) | `a75be1aa…e100`, verified, same as the decision |
| Author record `V1STR_CANDIDATE.md` | `dc5f2d4c…a9145` |
| Directed tests | extension `a0b11315…`, preservation `d9df86d5…`, exposure `6c817ced…`, helpers `874c0025…` |
| Author probe `probe-v1str.mjs` | `06d18a4b…5281` |

`STRENGTH_INTELLIGENCE_FOUNDATION.md` is now `de9465d9…9ac9`, not the `50e6a5ed…` the decision bound. The diff (`3ed9dec`..`879f23f`) only records the decision: the C.5 heading, the new §8.1 summary, and invariants V-EXT-06 to 08 in E.2/E.3 taken from the decision's own conditions. N1–N4 are unchanged in substance. This review rules that the decision has **not** expired under its "byte change to sections 0, B.2, C.5 or 8" trigger (finding A-13).

## 1. Dispositions

| Boundary | Disposition | Why, in one line |
|---|---|---|
| `V1X-STRENGTH-HOLD-DOSE` (N1, SQ-1) | **BLOCK** | The rule itself is acceptable. It is blocked only by **A-02**, which all three selection boundaries share: a plan built under one set of strength rules and reviewed under another answers `UNSUPPORTED` even to a new pain or injury flag. SQ1-C7 is NOT MET as declared (condition A-03). |
| `V1X-STRENGTH-UPPER-LOADING` (N2, SQ-2) | **BLOCK** | The rule itself is acceptable. It is blocked only by **A-02**. SQ2-C8 is PARTIAL because the 4-day joint test is missing (A-06). |
| `V1X-STRENGTH-PLANE` (N4, SQ-4) | **BLOCK** | **A-01:** the plane rule changes MAIN doses. In 72 of 1500 synthetic profiles, all with a STRENGTH goal, the vertical MAIN lift is also an accessory row elsewhere in the week. Because one exercise keeps one state, the MAIN row is then prescribed at 3×7 @RIR3 for the whole plan, outside the STRENGTH range of 4–6 repetitions. SQ4-C6 dose clause NOT MET. **A-02** also applies. Condition A-04(a): one beginner profile under a 40-min budget loses trunk rows. |
| `V1X-STRENGTH-EXPOSURE` (N3, SQ-3) | **ACCEPT_WITH_CONDITIONS** | Descriptive only. Nothing reads it, and its output matches the catalog oracle. The Data/G03 semantics and the display rules remain conditions. |

A BLOCK here means the current bytes may not receive an enabling record. HOLD and UPPER become ACCEPT_WITH_CONDITIONS at recheck once A-02 is closed. PLANE needs A-01 and A-02 closed. The author's one bounded corrective cycle is enough for both. Neither needs a new number.

## 2. Evidence run by this reviewer (read-only)

| Check | Result |
|---|---|
| `node --test test/v1str-extension.test.mjs test/v1str-preservation.test.mjs test/v1str-exposure.test.mjs` | 47/47 pass (TAP, 2 min) |
| `node audits/v1-strength-intelligence-2026-11-13/probe-strength.mjs` | 37/37: the gaps reproduce on the frozen entry point |
| `node audits/…/candidate/probes/probe-v1str.mjs --verbose` | 37/37. Sweep: profiles with no vertical push 116 → 60 (all strength class NONE); no vertical pull 120 → 72 (48 dumbbell-only and dumbbell-and-bench, 24 bodyweight); horizontal planes unchanged (0 and 12); plank rows 0 |
| Own probe `probe-ssctr.mjs`: 26 named profiles, DEV vs OFF, every week | See §5 |
| Own scan `scan-roles.mjs`: 1500 profiles (9 equipment sets × 4 goals × 2–5 days × 4 experience classes × named-lift sets, plus 60 hybrids) under OFF, PLANE alone and DEV | Profiles with an externally loaded MAIN row outside the goal range: OFF 128, PLANE 172, DEV 172. PLANE adds rows in 72 profiles, all STRENGTH (A-01); PLANE has fewer in 24, equal in 730 |
| Own probe `probe-binding.mjs`: D-9, D-2, D-1 | A-02 reproduced (§7); D-2 and D-1 behaviour confirmed |
| Own probe `probe-catalog-profiles.mjs`: KETTLEBELL_ONLY, BANDS_AND_BAR and PULL_UP_BAR_ONLY (the three catalog profiles the tests do not use) × 4 goals × 4 classes × 2–5 days | 0 problems: no hold, every trunk slot filled, trunk per week equal, N2 identical where there is no external upper option |
| Own probe `probe-short.mjs`: plans of 1–6 weeks to a race | The engine accepts only the 4-week plan in this set (ESTABLISHMENT/BUILD/SPECIFIC/RACE_WEEK). Nothing is new in an event week, DEV equal to OFF |
| Own probes `probe-time.mjs`, `probe-time2.mjs`: 30–60 min sessions | No session goes over the chosen minutes. Trunk-free weeks under tight time budgets: see A-04 |

Scratch scripts and outputs: `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\21ffbd32-da9f-43c9-b8b9-3f3dffe707fe\scratchpad\ssctr-v1str\`. These are outside the repository and not part of the record.

**Literature access.** WebFetch to the Europe PMC REST API was confirmed this session.
- PMID 29541130 (Kikuchi & Nakazato 2017, J Exerc Sci Fit 15(1):37–42, doi 10.1016/j.jesf.2017.06.003) was re-verified at abstract level. It reports 18 young men, bench press at 40% 1RM against push-up matched to that load, 8 weeks, with similar 1RM and thickness gains. This is consistent with how the decision used it, as counterevidence when load is matched.
- Two directed searches for new evidence that could trigger expiry were run, for 2025–2026 syntheses on exercise variation, selection or plane and for 2024–2026 syntheses on core stability or planks. 301 and 8 hits; the first pages were read. None is applicable to recreational adult or hybrid V1 populations. The hits were youth swimmers, soccer players and clinical populations, so no expiry trigger fired. This null result is logged; it is not proof of absence.
- No new literature was needed. This review decides conformance to approved decisions, and none of its rulings depends on a new scientific claim.

## 3. Conditions: MET / PARTIAL / NOT MET

### SQ-1 (holds)
| # | Status | Evidence |
|---|---|---|
| c1 | MET | Values `holdDose.configurations` = front-plank, side-plank; `timeDose: null`. Test "SQ-1 c1". `shaped()` rejects other bytes. |
| c2 | MET | `admitted()` excludes them. That covers slot, alternative, fallback, event-week stand-in (`admissibleAlternative`), plan validation and `r6-adaptation` ladder `stepOk`. Tests "SQ-1 c2" ×3: named substitute gets ASK, free substitute is never a plank, dead-bug→front-plank offer gone, familiarity does not admit. Sweep has 0 plank rows. |
| c3 | PARTIAL | Every TRUNK slot is filled in every profile I ran: the 9 helper sets plus the 3 catalog profiles the tests lack. Week-level trunk counts equal OFF at 60 min. **But** under tight time budgets the hold rule leaves weeks with no trunk row where OFF had one (A-04). |
| c4 | MET | No seconds value, duration, conversion or hold progression in the values, `v1-strength*.mjs` or the exemplar (grep). Rows carry only `restSeconds`. Test "SQ-1 c4". |
| c5 | MET | `knownLimitations: NO_ANTI_LATERAL_FLEXION_ROW` in every answer under HOLD for a plan built under it. The text says the rest is "not claimed to be equivalent". Test "SQ-1 c5". |
| c6 | MET | Test "SQ-1 c6": HOLD alone changes only trunk accessory rows, MAIN identical over 432 plans and every week. Replacements are at the goal dose (e.g. bird-dog / pallof-press 1×12 @3 where front-plank 1×12 @3 stood). |
| c7 | NOT MET | No migration (D-1). A plan built before the rules keeps planks in repetitions (probe: `w1 front-plank 1x12@3 … w11 2x16@3` under the rules in force). Condition A-03. |
| c8 | MET | `timeDose` must be null for the values to load. A time dose means new bytes, a new sha and new records. |

### SQ-2 (loaded upper body under RUNNING_SUPPORT)
| # | Status | Evidence |
|---|---|---|
| c1 | MET | `loadingFirst` only when the role's purposes include RUNNING_SUPPORT and the pattern is upper (PUSH, PULL, ELBOW_*, SHOULDER_ABDUCTION). Accessory slots under an EVENT reach it; MAIN slots of another goal do not. Tests "SQ-2 c1, c5", "SQ-2 c1 with an event", and C.6 (lower and trunk rows and runs unchanged). |
| c2 | MET | `selectionCompare` key order; unit test "SQ-2 c2". |
| c3 | MET | Test "SQ-2 c3" (no HIGH lift without familiarity; NONE/NOVICE LOW only). Probe: hybrid full gym gets db-bench-press, db-row, lat-pulldown and db-overhead-press, never barbell-row or bench-press. |
| c4 | MET | Test "SQ-2 c4": `ESTABLISH`, no kg, same sets and reserve, reps 6–10. Probe: every new loaded upper row starts `ESTABLISH`. |
| c5 | MET | BW and BANDS in tests; BANDS_AND_BAR and PULL_UP_BAR_ONLY in my probe. N2 alone is byte-identical. |
| c6 | MET (stricter) | A running plan never changes MAIN through N2 (D-1). This is a constraint ("only at a block boundary"), and never changing satisfies it. |
| c7 | MET (runtime) | The runtime emits no running or injury claim. No app copy exists yet. |
| c8 | PARTIAL | The joint test covers RS, full gym, 2 days. The 4-day case is not in a directed test. My probe shows the correct order: UPPER db-bench-press / db-row; UPPER_B lat-pulldown / db-overhead-press. A-06. |

### SQ-3 (exposure)
| # | Status | Evidence |
|---|---|---|
| c1 | MET | Oracle from the catalog `prim` lists (tests "SQ-3 c1" ×2): secondary muscles not counted, unilateral once, PRACTICE never. The hand-checked week matches the foundation's scenario B (Q3 H5 G6 P6 L6 B2). |
| c2 | MET | `planned` and `executed` are separate, with `imputed:false`. A session marked complete with no sets counts nothing. Superseded, conflicted, other-athlete and out-of-week reports are excluded. Data/G03 semantics remain a dependency (D-7). |
| c3 | MET | Test V-INT-01 (source names) and "SQ-3 c3" (every plan and decision identical with exposure on or off). `consumers: []` is required to load. |
| c4 | MET (runtime) | Label "Working sets where the muscle is a primary mover. Descriptive only."; `descriptiveOnly:true`; no target or score keys (test "SQ-3 c4, c5"). |
| c5 | MET (runtime) | Regex test over the object; no forbidden claim in values or runtime text. App copy pending. |
| c6 | MET | Permissive. Nothing the runtime emits exceeds it. |
| c7 | MET | No target, threshold, fraction or auto-increase anywhere. |

### SQ-4 (plane alternation)
| # | Status | Evidence |
|---|---|---|
| c1 | MET | `planeSlot`: every second slot in template order, at most half, none for a single slot. Templates hold at most one PUSH and one PULL MAIN each. Test "SQ-4 c1". The 1-day plan is identical to OFF. |
| c2 | MET | Key order own → plane (guarded) → familiar → established → [N2] → purpose. Test with a familiar bench: bench-press in slot 1, db-overhead-press in slot 2. |
| c3 | MET under the D-3 reading | No slot drops from external load (test "SQ-4 c3"). The literal example (dumbbells + bands keep db-row) holds whenever N2 is on. With PLANE alone under RS the slot takes band-pulldown where it would take band-row: same class (A-07). |
| c4 | MET | Tests "SQ-4 c4" ×2: no vertical push for NONE/NOVICE, lat-pulldown or band-pulldown for them, practice rows unchanged, HIGH vertical only when familiar. |
| c5 | MET | Slot fixed through reviews, block boundary, equipment gain and substitution (test "SQ-4 c5"; sims "each slot as it was built"). Directives win. Existing plans: stricter reading, no adoption (D-1, D-2). |
| c6 | PARTIAL | Phase clause MET: no exercise new to the plan in TAPER, RACE_WEEK or POST_EVENT (test "SQ-4 c6"; probes with post-event and race weeks). **Dose clause NOT MET: A-01.** |
| c7 | MET (runtime) | No coverage claim emitted. |
| c8 | MET (runtime) | No benefit claim emitted. |
| c9 | MET | V-EXT-05; sweep: vertical pull with machines or bands where the vertical option is equal or better, vertical push for INT/EXP dumbbell profiles, dumbbell-only pull unchanged, slot identity, V-EXT-01 (tests "SQ-4 c9", "V-EXT-01" ×3). |

## 4. Rulings on the declared readings

| Reading | Ruling | Reason |
|---|---|---|
| **D-1** No migration; a plan keeps the rules it was built under | **ACCEPT_WITH_CONDITION** (synthetic only) | For SQ2-C6 and SQ4-C5 the reading is stricter than the condition and acceptable. For SQ1-C7 it leaves the exact defect SQ-1 removed: plank rows in repetitions. No pre-rule plan exists today and no app reaches this entry point (D-11), so the gap is latent. **Before any athlete can hold a plan built without HOLD while HOLD is on**, one of these must hold. (a) The environment proves that every plan was built under HOLD (the rules are on from the first plan, with no plan from the frozen entry points). (b) The SQ1-C7 migration is implemented: the plank row is replaced from the next built week by an admissible trunk accessory as a recorded reason-based change, disclosed, never mid-session, never touching MAIN, and reviewed by SSCTR. See A-03. |
| **D-2** N4 only keeps, never adopts, in a running plan | **ACCEPT** | No exercise is introduced into a running plan and no MAIN changes mid-block. Adoption stays an athlete-initiated block-boundary change (B0-C06) or a new plan. Probe: a 2→4-day schedule change drops the built vertical lifts and keeps horizontal only, identical to OFF; a new 4-day plan would hold them (A-08). Acceptable as long as no copy claims plane coverage the plan no longer has (SQ4-C7). |
| **D-3** Guard measured against the slot's own choice without the rule | **ACCEPT** | It is faithful to the guard's purpose: the vertical preference never takes a slot down from external load. It diverges from the letter of SQ4-C3 only when the slot's own choice is already bodyweight or band while an external horizontal exists (PLANE alone under RS; a familiar push-up or band-row). There the slot is not downgraded relative to what it would take. A-07. |
| **D-4** Literal alternation; a familiar vertical in slot 1 leaves no horizontal plane | **ACCEPT** | The faithful reading of SQ4-C1/C2, identical to today (probe: familiar pull-up gives pull-up in both slots; familiar barbell-OHP gives OHP in both, OFF and DEV). Asking slot 2 for "the plane opposite slot 1" is a different rule that SQ-4 did not approve. A-09. |
| **D-5** N2 reaches upper accessory slots | **ACCEPT** | Inside SQ2-C1 (goal RS covers all upper slots; EVENT covers accessories). Test: no template holds fewer externally loaded upper rows. Push-up and band-row leaving a full-gym runner's plan is the intended effect. |
| **D-6** A new lifter's second pull is first established a week later | **ACCEPT** | Existing first-exposure rule (B0-C06 c2, B0-C07 c7): effort-guided, RIR 3, no load transferred. Probe NONE + machines: seated-cable-row debuts in week 1 at 2×10 @3 `ESTABLISH` (OFF 2×8 `FROM_LOG`). Inside GENERAL 8–12; one extra low-skill machine establishment in week 1. A-10. Its time-fit consequence under a 40-min budget (the pull settles at 3×10 and the trunk row is dropped) is handled under A-04(a), not accepted here. |
| **D-7** Executed exposure from logged sets only | **ACCEPT_WITH_CONDITION** | The count is conservative: it undercounts, never imputes. A session logged outside its week, or a moved (SKIPPED) session that was logged, counts nowhere. Condition: any surface describes the executed number as "sets logged in this week's sessions" and never as everything done. Data/G03 semantics must be reviewed jointly before any athlete-facing display. A-12. |
| **D-8** review-by not enforced by the runtime | **ACCEPT_WITH_CONDITION** | Consistent with the run extensions, and acceptable for synthetic use. Each enabling record carries `review_by` 2027-04-30, the event triggers and an owner (Chief). Before any non-synthetic use, an expiry control must exist: runtime fail-closed after `review_by` as the B0 records do, or a recorded governance withdrawal. A withdrawal must not cause A-02. A-05. |
| **D-9** Rules changed between plan and review → `UNSUPPORTED` | **REJECT as implemented** | Probe: a plan built under every rule and reviewed under OFF or under HOLD alone answers `UNSUPPORTED` to a fresh pain flag, an injury flag, pain with an exercise, systemic fatigue and an adverse week. The frozen entry point on the same plan answers `CLINICAL_HUMAN_REQUIRED`. Only an already-recorded hold answers first (the author's test). Record issuance, revision, withdrawal and a values-byte change are routine governance events, and each one triggers this. Blocking finding A-02. Routine reviews answering `UNSUPPORTED` are a separate condition before non-synthetic use (A-04b). |
| **D-10** Two historical tests fail by design | **ACCEPT** (no sporting content) | No prescription effect. Correctness and freeze integrity are QRE's. |
| **D-11** No integration | **ACCEPT_WITH_CONDITION** | Nothing reaches an athlete. Condition: an enabling record never authorizes integration. Integration is a new SSCTR trigger and needs A-03, A-04b and A-05 resolved. |
| **D-12** The development authority is stripped here but accepted by the frozen entry points | **ACCEPT_WITH_CONDITION** | No sporting objection. Condition: no integration passes options or a development authority. A rule turns on only through an independent record. QRE/Security own the check. |

## 5. What real profiles are prescribed (corrections on, DEV, against OFF)

All doses below are the engine's existing goal doses. `ESTABLISH` means a load chosen by effort with no kilogram value.

- **Beginners (class NONE), 2 days.**
  - Dumbbells: FULL_A goblet-squat / db-floor-press / db-row, FULL_B glute-bridge / db-row / db-floor-press. No vertical push or pull is admissible or available. Trunk is dead-bug. Week 0 is practice rows plus effort establishment. Only weeks 9–11 differ from OFF, because the rotation no longer offers a plank.
  - Machines: FULL_B pull becomes lat-pulldown, and seated-cable-row debuts in week 1 at 2×10 (D-6). Push stays horizontal.
  - Bodyweight: incline-push-up and prone-ytw-raise; nothing vertical admissible; equal to OFF except the trunk rotation.
  - 3 days, machines: the novice density cap holds (FULL_A, FULL_B, CORE); the CORE plank becomes bird-dog; trunk rows per week are equal.
- **Intermediate hypertrophy, full gym, named bench.** Bench-press KNOWN 3×8 at 60 kg as declared, then reps rise 8→10→12 before load. FULL_B gets lat-pulldown and db-overhead-press at 2–3×8 @3, starting `ESTABLISH`. Exposure is described with no target.
- **Experienced, no named lift.** No HIGH-skill lift (db-bench-press, db-row, goblet-squat, db-rdl). The vertical lifts are lat-pulldown and db-overhead-press.
- **Experienced, named barbell lifts.** Back-squat, deadlift, bench-press, barbell-row and barbell-OHP are all `ESTABLISH`, with no kg from experience. **3+ days under STRENGTH: barbell-overhead-press is both the UPPER accessory and the FULL_B vertical MAIN, and the MAIN is prescribed 3×7 @3 from week 1 (A-01).**
- **Hybrid 10K, RUNNING_SUPPORT.**
  - Full gym: db-bench-press, db-row, lat-pulldown, db-overhead-press, all `ESTABLISH` at 2×8 @3.
  - Dumbbells + bands: db-floor-press and db-row, with db-row kept in the vertical pull slot by the guard, plus db-overhead-press.
  - Bands only: push-up / band-row, band-pulldown / pike-push-up.
  - Bodyweight: push-up, pike-push-up, prone-ytw-raise.
  - Taper: 1 set @3, only exercises done before. Race week and post-event week: MAIN rows only @4, nothing new.
  - Arrangement, phases, blocks and run sessions are identical, and the ordinal interference costs are equal in every week (V-INT-02 and my probes).
- **1 to 5 strength days (intermediate GENERAL and RS, full gym).** 1 day equals OFF except the trunk rotation. 2 days: FULL_B vertical. 3 days: FULL_B vertical. 4 days: UPPER_B vertical. 5 days: as 4, and the CORE plank becomes pallof-press. Trunk rows per week are equal at 60 min.

**Envelopes.**
- Every non-PRACTICE row checked stays within the goal's set maximum and reserve (author's test over 128 plans, plus my probes).
- No HIGH skill appears without familiarity.
- No plank appears; nothing is new in an event week; no session exceeds the chosen minutes.
- Exceptions:
  - The A-01 MAIN dose under STRENGTH.
  - Repetition counts above the goal range on **bodyweight** rows (dead-bug, glute-bridge, push-up 14–16). These are identical in OFF: an existing feature of the bodyweight progression, not this candidate.

**Trunk.**
- Present in every week where OFF has it, at 60 min and in all 12 catalog/helper equipment sets.
- Race week and post-event week hold MAIN rows only, in OFF as in DEV (existing event-week rule).
- Exception under tight time budgets: A-04.

**Interference.** The CMP picture is unchanged at the engine's resolution: same arrangement, same ordinal costs, same CMP.P04 trim. Upper-body changes carry no run-axis demand class in the catalog. No physiological claim is made by this review.

## 6. Limits the Founder set

- **No number added.** The values file contains no number at all, and the candidate adds no dose, rep range, set count, reserve, load or time value. The only dose effect is the indirect one in A-01: a shared exercise state that moves a MAIN row's repetitions. It must be removed, not approved.
- **No hypertrophy target, range, threshold, forecast or claim** anywhere in values or runtime output. MET.
- **Familiarity.** Only named exercises count. Years of experience grant no HIGH lift. An old load (June 2026) is not used as a working load. An unknown name selects nothing. A named lift without a load is established by effort. MET (author test "familiarity is what the athlete named"; probes).
- **No independent strength engine** (the rules act inside the repertoire's selection) and **no catalog expansion.** MET.
- **Taper, holds and interference preserved:** MET, except the clinical route after a rules change (A-02).
- **Synthetic only:** MET. No enabling record exists, and the default authority has every boundary off.

## 7. Findings

| Id | Severity | Boundary | Statement | Evidence |
|---|---|---|---|---|
| SSCTR-STR-A-01 | BLOCKING | PLANE | In 72 of 1500 profiles (STRENGTH goal, INTERMEDIATE/EXPERIENCED, 3–5 days; full gym with named barbell lifts, machines, dumbbells, dumbbells + bands, barbell set), the vertical MAIN is the same configuration as an accessory row elsewhere in the week (barbell-overhead-press, lat-pulldown, db-overhead-press). Its state is shared, so the MAIN is prescribed 3×7 @RIR3 for ~11 weeks, outside R6-POLICY-5 STRENGTH repRange 4–6. OFF never does this for these configurations. SQ4-C6 dose clause NOT MET. | `scan-roles.mjs` (OFF 128 / PLANE 172 / DEV 172 profiles with an out-of-range external MAIN; +72 all STRENGTH); `probe-ssctr.mjs` "EXP STRENGTH FULL 3d named barbell lifts" w1 `barbell-overhead-press[M] 3x7@3`. |
| SSCTR-STR-A-02 | BLOCKING | HOLD, UPPER, PLANE | `evaluateProgram` answers `UNSUPPORTED` (reason "not planned under the bound repertoire catalog") for a plan whose recorded strength rules differ from those in force, **before** the clinical screen. A fresh pain flag, an injury flag and pain with an exercise are not routed to `CLINICAL_HUMAN_REQUIRED`; systemic fatigue and an adverse week get no response. The frozen entry point on the same plan routes the flag. Every record issuance, revision or withdrawal and every values-byte change triggers this. | `probe-binding.mjs` §D-9 (OFF and HOLD-only rows all `UNSUPPORTED`; DEV and P give `CLINICAL_HUMAN_REQUIRED`); `v1-strength-index.mjs` `closed()` plus `evaluateProgram`. |
| SSCTR-STR-A-03 | CONDITION | HOLD | SQ1-C7 is not implemented. A plan built without HOLD keeps planks prescribed in repetitions under the rules in force. | Test "a plan records the rules…"; `probe-binding.mjs` §D-1 (`front-plank 1x12@3 … 2x16@3`). |
| SSCTR-STR-A-04 | CONDITION | HOLD, PLANE | (a) Under tight session time, the rules leave some weeks with fewer trunk rows than the plan without them, and some with none (counts in §10). **HOLD:** a rotated front-plank re-established at 2×7 used to fit the time budget. Without it, the dead-bug row (no rotation alternative left) progresses and no longer fits; the time fit drops it, as it already does in other weeks of the same OFF plans. The row lost was the defective plank-in-reps. **PLANE:** for a machine beginner, the pull that debuts a week later (D-6) settles at 3×10 instead of 3×8 and takes the time of the session's dead-bug row. This contradicts the author's C.6 claim ("the upper-body rules change upper rows only"), which was tested only at 45–60 min. SQ1-C3 is PARTIAL at week level. (b) Routine reviews of a plan under other rules give no adaptation (see A-02); acceptable only for synthetic use. | `probe-time3.mjs`, `probe-trunk30.mjs`; `probe-binding.mjs`. |
| SSCTR-STR-A-05 | CONDITION | all | `review_by` is not read by the runtime (D-8). Stale approval must not extend silently (SSCTR-09). | `v1-strength.mjs` `strengthAuthority` (no date). |
| SSCTR-STR-A-06 | CONDITION | UPPER, PLANE, HOLD | Test gaps against named conditions: the SQ2-C8 joint test lacks the 4-day case; the SQ1-C3 test uses the helper equipment sets rather than the catalog's nine (KETTLEBELL_ONLY, BANDS_AND_BAR and PULL_UP_BAR_ONLY are absent); no test covers a tight time budget. My probes found no defect in the first two. | `v1str-extension.test.mjs` lines 103–110, 269–277. |
| SSCTR-STR-A-07 | OBSERVATION | PLANE | D-3 guard: with PLANE alone under RS + dumbbells + bands, FULL_B pull = band-pulldown where SQ4-C3's letter says db-row. Same class as the slot's own choice (band-row). Holds literally with UPPER on. | `probe-ssctr.mjs` "D-3 … mains by authority". |
| SSCTR-STR-A-08 | OBSERVATION | PLANE | After a mid-plan schedule change that creates new template types (2→4 days), the built vertical MAINs leave the plan, identical to OFF. Coverage returns only with a new plan or a block-boundary MAIN change. | `probe-binding.mjs` §D-2. |
| SSCTR-STR-A-09 | OBSERVATION | PLANE | D-4: an athlete with a familiar vertical lift has no horizontal plane of that pattern, as today. A symmetric rule would need its own SSCTR question. | `probe-ssctr.mjs` (pull-up, barbell-OHP). |
| SSCTR-STR-A-10 | OBSERVATION | PLANE | D-6: one extra establishment exposure in week 1 for machine beginners, inside the GENERAL envelope. | `probe-ssctr.mjs` "NONE GENERAL MACHINES 2d". |
| SSCTR-STR-A-11 | OBSERVATION (pre-existing, routed) | none (frozen engine) | The frozen engine already shares one state between a configuration's MAIN and ACCESSORY rows. Under STRENGTH a lunge MAIN gets 3×7 @3 (bulgarian-split-squat-db, db-split-squat in 4–5-day plans, OFF). The frozen engine also drops every trunk row from **1801 weeks** of the 600 time-limited plans (30/40/45 min) I ran, outside race and post-event weeks. This bears directly on B0-C05's whole-week trunk condition. Neither issue is caused by this candidate. Route both to the Chief as pre-existing envelope questions (B0-C05 under time fit; R6-POLICY-5 MAIN range under shared state). | `scan-roles.mjs` OFF rows; `probe-time3.mjs`; `probe-trunk30.mjs` (OFF weeks 5–7). |
| SSCTR-STR-A-12 | OBSERVATION | EXPOSURE | D-7 undercount cases (logged outside the week; a moved and SKIPPED session that was logged). Conservative, never imputed. G03 dependency. | `v1-strength.mjs` `weeklyStrengthExposure`. |
| SSCTR-STR-A-13 | OBSERVATION | all | The foundation's bytes changed after the decision (`50e6a5ed…` → `de9465d9…`). The changes are documentary records of the decision itself, so the decision has not expired. Enabling records should bind the decision JSON (`f8dee367…`) as the values file does. | `git diff 3ed9dec 879f23f`. |

## 8. What must be true to close each finding (testable)

- **A-01.** With PLANE on, no externally loaded MAIN row is prescribed outside its goal's R6-POLICY-5 `repRange` for a configuration that the same profile without PLANE does not already have out of range. Test: a directed scan at least as wide as STRENGTH × INTERMEDIATE/EXPERIENCED × 3–5 days × {full gym with named barbell lifts, machines, dumbbells, dumbbells + bands, barbell set} shows zero added rows. One acceptable route is a plane-preferring slot that does not prefer a configuration the week holds in another role; the author chooses the route. No new dose number, no change to the dose rules and no edit to a frozen dose path may be used to close it.
- **A-02.** For a plan built under strength rules that differ from those in force, the answer is the one the entry point below gives, whatever the boundary set or values sha (OFF; each single boundary; another sha). That entry point gives `CLINICAL_HUMAN_REQUIRED` with no proposal for a current clinical flag (pain, injury, illness, functional limitation, clinical concern), for pain linked to an exercise, and for an already-recorded hold. This answer must come before any `UNSUPPORTED`. Test: those signals under at least OFF, `only('HOLD')` and a foreign sha.
- **A-03** (before any non-synthetic use, not before the synthetic record): D-1 condition (a) or (b).
- **A-04 (a), ruled now.**
  - **HOLD residual: accepted as a declared limitation.** Restoring it would mean keeping a plank prescribed in repetitions, the exact row SQ-1 rejected. The time-fit rule that drops the trunk row is pre-existing (A-11). Conditions before the HOLD enabling record:
    - the author's record and the record's limitation text state the residual and its cause;
    - a directed test over 30/40/45-min budgets pins the count, so the residual cannot grow silently;
    - no new trunk-free week appears where the trunk row lost was **not** a hold.
  - **PLANE residual: not accepted as is.** After the A-01 fix the time-budget scan is rerun. With PLANE on, no week may hold fewer trunk rows than without PLANE, unless the cause is shown to be a removed hold. The author chooses how to achieve this, without any new dose number.
- **A-04 (b)** (before non-synthetic use): a reviewed continuation path for plans built under other rules (review under the plan's recorded rules, or a recorded migration or new-plan offer at the next built week).
- **A-05** (before non-synthetic use): runtime fail-closed after `review_by`, or a recorded governance withdrawal with an owner, and A-02 closed.
- **A-06** (before the enabling records): add the 4-day joint assertion (RS, full gym, INTERMEDIATE), the three missing catalog equipment profiles in the SQ1-C3 test, and the time-budget trunk check of A-04(a).

## 9. Conditions to attach to each enabling record (round 2; proposed, not issued)

Common to all four:
- Synthetic data only: no real athlete, no integration (D-11, D-12).
- Bound to values sha `e375a8be…cacb`, catalog `ceee276a…92f9`, R6-POLICY-5 `a75be1aa…e100` and decision JSON `f8dee367…d379`.
- `review_by` 2027-04-30, plus the 2026-11-13 event triggers (byte change, new systematic review, V1 scope change, adverse event or runtime inconsistency, funded human revalidation without AI veto). Owner: Chief.
- A-02 closed before issue. A-03, A-04(b) and A-05 closed before any non-synthetic use.

Per boundary:
- **HOLD.**
  - SQ1-C5 limitation stays in every answer, and no copy claims equivalence or injury prevention.
  - No time dose; option (b) needs its own SSCTR decision.
  - A-04(a) and A-06 resolved.
  - Pre-rule plans: D-1 (a)/(b).
- **UPPER.**
  - Scope exactly SQ2-C1.
  - No copy that loaded upper work improves running or prevents injury.
  - 4-day joint test added.
  - Re-review if added load for bodyweight exercises or new RS-tagged upper configurations are admitted.
- **PLANE.**
  - A-01 closed with the scan.
  - The A-04(a) PLANE trunk residual closed.
  - D-3 reading recorded as the guard's definition.
  - No coverage or benefit claim (SQ4-C7, C8).
  - No automatic adoption in running plans; any adoption mechanism is a new SSCTR question.
  - Re-review on new vertical configurations or templates with a different count of same-pattern MAIN slots.
- **EXPOSURE.**
  - `consumers: []` and V-INT-01 stay green.
  - SQ3-C4/C5 apply to every surface.
  - The executed number is described as logged sets of the week's sessions (D-7).
  - Data/G03 joint review before any athlete-facing display.
  - Any target, fraction or auto-increase only through G02.

## 10. Trunk under tight time budgets (A-04 count)

`probe-time3.mjs` ran 600 synthetic plans (lifters at 30/40/45 min × 6 equipment sets × 4 goals × 2–5 days × NONE/INTERMEDIATE, plus hybrids) and compared each authority against OFF, week by week, outside race and post-event weeks:

| Authority | Weeks with fewer trunk rows than OFF | Weeks dropping to zero trunk where OFF has some |
|---|---|---|
| DEV (all) | 92 (34 profiles) | 35 (13 profiles) |
| HOLD alone | 85 (31 profiles) | 32 (12 profiles) |
| UPPER alone | 0 | 0 |
| PLANE alone | 7 (3 profiles) | 3 (1 profile: 40 min, machines + dumbbells, GENERAL, 2 days, NONE) |
| OFF itself: weeks with no trunk row at all | 1801 | (pre-existing, A-11) |

At 60 min, and in the author's 45-min hybrids, trunk rows are equal in every week. Rulings are in §8 (A-04).

## 11. Funded human revalidation

Each of the four boundaries has prescriptive impact. Queue items `HQ-SI-V1-SSCTR-SQ-1` to `SQ-4` remain **proposed only**, because this instance may not edit the queue. Enabling records issued later should link to them. Items a funded qualified human should revalidate, with no AI veto:
- the loss of anti-lateral-flexion work and any time dose for holds;
- loaded upper work for runners and push-up equivalence when load is matched;
- whether plane coverage matters at all;
- the primary-only counting convention;
- the pre-existing shared-state dose semantics of A-11 and time-fit trunk loss.

## 12. What I could not verify

- The dispatch mechanism of this instance (inherited, not self-verifiable).
- Full-text appraisal of any source. Only abstract or record level was read this session.
- Restart near a race (`restartProgram` with fewer than 4 weeks to the event).
- The behaviour of any app copy or integration, because none exists.
- The QRE verdict, which is produced in parallel and not read in this round.
- The full joint suite (1581/1583) and `v1str-freeze --preserved`, both of which the author reported. I did not run them; they are QRE's.
- `validate_records.py`. Not run: this file is a candidate review, not a `decision.schema.json` record, and the queue entries are only proposed.
- Any physiological effect of the changes. No human, empirical or clinical validation occurred.

**Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication:** NOT_PUBLISHED. human_validation = false, empirical_product_validation = false, clinical_clearance = false.
