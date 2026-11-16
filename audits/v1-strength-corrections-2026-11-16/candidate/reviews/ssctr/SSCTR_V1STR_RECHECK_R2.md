# SSCTR recheck R2: V1STR corrective cycle (3342a1d)

**Record:** `SSCTR-V1STR-RECHECK-R2`, 2026-11-16. Structured version: `SSCTR_V1STR_RECHECK_R2.json` (same folder). This is the one recheck. R1 (`SSCTR_V1STR_REVIEW_R1.*`, committed unedited in `4af0653`) is not edited.

**Reviewer:** SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, protocol SSCTR-EP-1.0.0.
- The same subagent instance as R1, launched by the Chief with the project SSCTR adapter text. Model inherited (claude-opus-5-5). This instance cannot verify its own dispatch mechanism.
- Not the author of the candidate or of the corrective cycle (Chief on Fable 5.2).
- Software provisional reviewer with no human credentials. This is not human, empirical or clinical validation.

**Not in this record:** no enabling record (`SSCTR_V1STR_RECORDS.json` is not created), no gate closed, nothing published, no queue or governance edit. I read the QRE round-1 review (`reviews/qre/QRE_V1STR_REVIEW_R1.md`, `7d1cd692…`), including its section "For the SSCTR judge". The QRE recheck does not exist yet, so I have not read it.

## 0. Target

| Item | Value |
|---|---|
| Commits | `21838cb` (judged in R1) → `4af0653` (both reviews as received) → `3342a1d` (the cycle; HEAD verified, tree clean apart from this folder) |
| `v1/STRENGTH_EXTENSION_V1.json` | `15a51f55e847ad01d683912d50319629ead68a1cfa00d3c69c5061b3e596850f`, verified against the bytes. No numeric JSON value and no quantity in any string. Still binds the catalog `ceee276a…` and the decision JSON `f8dee367…` |
| `src/r7b-repertoire.mjs` | `0a8d2013…7477` (43+/11- against `2dfa216`, as the author states) |
| `src/v1-strength.mjs` | `81dce34e…cba` |
| `src/v1-strength-index.mjs` | `36666ab2…1b10` |
| Author record of the cycle `V1STR_CORRECTIVE_CYCLE.md` | `7b475358…04d` |
| Frozen engine files (`r6-*.mjs`, `r6/`, `r7/`) | No diff between `21838cb` and `3342a1d` |

## 1. Dispositions

| Boundary | R1 | R2 | In one line |
|---|---|---|---|
| `V1X-STRENGTH-HOLD-DOSE` (N1) | BLOCK | **ACCEPT_WITH_CONDITIONS** | A-02 is closed. The trunk residual is declared, pinned, and every lost row was a hold. A-03, A-04b and A-05 must be closed before any non-synthetic use. |
| `V1X-STRENGTH-UPPER-LOADING` (N2) | BLOCK | **ACCEPT_WITH_CONDITIONS** | A-02 is closed and the 4-day joint test exists. N2 alone changes no trunk row and no row outside the upper body. |
| `V1X-STRENGTH-PLANE` (N4) | BLOCK | **BLOCK** | New plans are now right: A-01 is closed (128/128/128), and beginners' new plans are identical to the plan without the rule. **But in a plan in force, after a change of strength days, the plane rule turns a configuration the plan held only as an accessory into a MAIN, and the MAIN carries the accessory's dose.** Example: barbell-overhead-press at 2–4×7 for 10 weeks under STRENGTH (range 4–6) in 44 of 672 changes; lat-pulldown at 3×7 in running beginner plans. This is the A-01 defect on the in-force path, so it stays blocking. Named blocker: **SSCTR-STR-B-01**. |
| `V1X-STRENGTH-EXPOSURE` (N3) | ACCEPT_WITH_CONDITIONS | **ACCEPT_WITH_CONDITIONS** | Unchanged. The QRE robustness edges are fixed: only whole repetitions count, and only this athlete's reports. |

## 2. Evidence I ran on 3342a1d (read-only)

| Check | Result |
|---|---|
| `node --test test/v1str-extension.test.mjs test/v1str-preservation.test.mjs test/v1str-exposure.test.mjs test/v1str-time.test.mjs` | **63/63 pass** |
| `node --test test/v1str-freeze.test.mjs` | **1/1 pass** |
| My R1 `scan-roles.mjs`, unchanged (1500 profiles) | Profiles with an externally loaded MAIN outside the goal range: **OFF 128, PLANE 128, DEV 128** (R1: 172). Profiles where a configuration is MAIN in one template and ACCESSORY in another: 680 / 680 / 680 (R1: 680 / 789 / 804) |
| My R1 `probe-binding.mjs`, unchanged | Plan built under every rule, reviewed under OFF or under HOLD alone. Fresh pain, injury and pain with an exercise → **CLINICAL_HUMAN_REQUIRED, no proposal** (R1: UNSUPPORTED). Weekly review, systemic fatigue and an adverse week → UNSUPPORTED. DEV control and the frozen entry point unchanged. |
| My R1 `probe-time3.mjs`, unchanged (600 plans at 30/40/45 min) | Weeks with fewer trunk rows than OFF / weeks left with no trunk row: **DEV 85 / 32** (31 / 12 profiles); **HOLD 85 / 32**; **UPPER 0 / 0**; **PLANE 0 / 0** (R1: PLANE 7 / 3). OFF itself has 1801 trunk-free weeks (A-11). |
| My R1 `probe-ssctr.mjs` and `probe-catalog-profiles.mjs`, unchanged | Beginner profiles now equal OFF, apart from trunk rows where a plank stood. Every other profile is as in R1. Envelope issues are the pre-existing ones only (bodyweight repetitions; STRENGTH accessory 7 repetitions). 0 problems on the three added catalog equipment profiles. |
| New `r2-probe.mjs` | Changes of days in both directions (2↔3, 2↔4, 3↔4; GENERAL and STRENGTH with named barbell lifts); loss and regain; 384 beginner plans; a beginner plan in force; named-barbell athlete on 3/4/5 days; taper, race and post-event weeks; rotation; restart of a beginner. Results in §5. |
| New `r2-scan-changes.mjs`: 672 changes of strength days in a plan in force (STRENGTH; INTERMEDIATE/EXPERIENCED; 6 equipment sets × 4 named-lift sets × 7 changes × change in week 1 or 3), DEV vs OFF | **44** changes add an externally loaded MAIN outside 4–6 that OFF does not have. All are 4→2 or 5→2 with named barbell lifts on a full gym or a barbell set, and all are barbell-overhead-press, held before **only as an accessory**. **56** bring an upper exercise new to the plan that OFF does not (pike-push-up and band-assisted-pull-up as UPPER accessories from week 9, after 2→3 or 2→4). |
| New `r2-b01-strength.mjs` (detail of the 44) | barbell-overhead-press MAIN outside 4–6 for **10 weeks** (w2 3×7, w3 3×7, w4 2×7, w5 4×7, …). 22 cases 4→2 and 22 cases 5→2, all "held before as ACCESSORY". |
| New `r2-scan-inforce-small.mjs`: 64 changes in beginner plans in force (NONE and NOVICE without a named exercise; GENERAL and STRENGTH; FULL, MACHINES, MACH_DB, BANDS; 3/4/5→2 and 4→3 at week 6), against the same timeline without the plane rule | Every plan built with no plane slot gets them after the change (64/64). In 12 the plane MAIN is lat-pulldown, held only as an accessory before (GENERAL: 2×12 next to MAIN rows at 3×8). Under STRENGTH, **6 add lat-pulldown 3×7**, outside 4–6. The wider in-force scan (more goals, INTERMEDIATE) was stopped once this was established; its partial run is not used. |
| New `r2-b01-detail.mjs` | NONE, machines, 3→2 at week 7: `strengthRules` receives `inForce: {}` (truthy) for a plan built without plane slots. FULL_B:1 becomes lat-pulldown; week 8 `lat-pulldown[M] 1x12@3` against the other MAIN rows at 2×12 (without the rule: `seated-cable-row[M] 2x12@3`); doses converge from week 9. |

Scripts and outputs are outside the repository, in `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\21ffbd32-da9f-43c9-b8b9-3f3dffe707fe\scratchpad\ssctr-v1str\` (the `r2-*` files and the R1 scripts).

## 3. R1 findings: status

| Id | R1 severity | R2 status | Evidence |
|---|---|---|---|
| A-01 | BLOCKING | **CLOSED for new plans; reproduced in plans in force → carried as B-01 (BLOCKING)** | New plans: `scan-roles` 128/128/128, sharing 680/680/680; directed test "SQ-4 c6 (SSCTR-STR-A-01)" (288 new plans); named barbell lifts on 3/4/5 days with no plane-caused MAIN outside 4–6 (only the pre-existing lunge rows on 4–5 days). Plans in force: `r2-scan-changes` 44/672 and `r2-scan-inforce-small` 6/64 add an external MAIN outside the goal range, all from a configuration held only as an accessory before the change. |
| A-02 | BLOCKING | **CLOSED** for clinical signals | `probe-binding` (pain, injury, pain with an exercise); test "SSCTR-STR-A-02" (six flags × four authorities, plus a hold on the record). |
| A-03 | CONDITION | OPEN (by design; before non-synthetic use) | No SQ1-C7 migration. A plan built before the rules still holds planks in repetitions (`probe-binding` D-1). |
| A-04(a) HOLD | CONDITION | **CLOSED as a declared limitation** | `TRUNK_ROW_LEFT_OUT_UNDER_A_TIGHT_SESSION_TIME` is in the values and in every answer of a plan built under HOLD. `v1str-time` pins 85/32 and requires every lost row to be a hold. My `probe-time3`: see §2. |
| A-04(a) PLANE | CONDITION | **CLOSED** (via D-13) | `probe-time3`: PLANE alone 0/0. Test "SSCTR-STR-A-04a … plane rule or the loading rule alone". |
| A-04(b) | CONDITION | OPEN (before non-synthetic use) | Routine reviews of a plan under other rules are still UNSUPPORTED (D-16). |
| A-05 | CONDITION | OPEN (before non-synthetic use) | The runtime still does not read `review_by`. |
| A-06 | CONDITION | **CLOSED** | 4-day joint test; KB, BANDS_PULLUP and PULLUP in every sweep; `v1str-time.test.mjs`. |
| A-07 | OBSERVATION | CLOSED (ruled R1; reproduced) | Running RS, dumbbells + bands: band-pulldown with PLANE alone, db-row with UPPER on. |
| A-08 | OBSERVATION | CLOSED as stated (the vertical lifts stay in the plan after a change of days), **but the mechanism chosen for it created B-01 and B-02** | §5, §7 |
| A-09 | OBSERVATION | Unchanged; stays an observation (D-4) | Familiar pull-up and familiar barbell-OHP as in R1. |
| A-10 | OBSERVATION | CLOSED (superseded by D-13) | Beginner plans no longer receive the plane rule, so the D-6 dose shift disappears (384/384 beginner plans equal the plan without PLANE). |
| A-11 | OBSERVATION (pre-existing) | OPEN, routed to the Founder by the author; outside this candidate | `scan-roles` OFF 128; `probe-time3` OFF weeks with no trunk. |
| A-12 | OBSERVATION | Narrowed; G03 dependency stays | Integer repetitions and `athleteId` required (test "SQ-3 c2 (QRE-STR-A-13)"). |
| A-13 | OBSERVATION | CLOSED (ruled R1) | No change. |

## 4. SQ conditions whose status changed

| Condition | R1 | R2 | Evidence |
|---|---|---|---|
| SQ-1 c3 | PARTIAL | **MET** (with the declared limitation) | Slot level as in R1. Week level: the only losses are hold rows under tight time, declared in the values and the answer and pinned by a test. A trunk slot left unfilled after a set-aside is now declared (`TRUNK_SLOT_UNFILLED`; test "SQ-1 c3 (QRE-STR-A-02)"). |
| SQ-1 c7 | NOT MET | NOT MET (unchanged; A-03, before non-synthetic use) | |
| SQ-2 c8 | PARTIAL | **MET** | Test "SQ-2 c8 (SSCTR-STR-A-06)", 4 days: db-bench-press / db-row; lat-pulldown / db-overhead-press. |
| SQ-4 c4 | MET | **MET as amended by D-13** | No vertical push at LOW skill. A pulldown only for a novice past movement practice (class FAMILIAR_UNKNOWN_LOAD): `r2-probe` "NOVICE named db-row: FULL_B:1=lat-pulldown". A class NONE new plan holds none. |
| SQ-4 c5 | MET | **PARTIAL** | Anchor kept through loss and regain (`r2-probe` §2, QRE path: back to lat-pulldown / db-overhead-press). Directives still win. But a change of days now lets the rule adopt a configuration into a MAIN slot of a running plan, including a plan built without the rule (B-01). That goes beyond "an existing program adopts N4 only at its next block boundary with a recorded reason". |
| SQ-4 c6 | PARTIAL | **PARTIAL: dose clause NOT MET in plans in force** | Phase clause still MET: nothing new in taper, race or post-event weeks (`r2-probe` §6). Dose clause: MET for new plans (A-01 closed), **NOT MET in plans in force after a change of days** (B-01). |
| SQ-4 c9 | MET | **MET as amended by D-13** | Vertical pull with machines or bands except in class NONE new plans (sweep 120 → 96 without vertical pull: 60 practice-start, 24 dumbbells only, 12 no equipment). |

## 5. What is prescribed now (point 4 of the request)

- **Beginners (class NONE).**
  - New plans: all 384 beginner plans I generated (NONE, and NOVICE without a named exercise; 12 equipment sets × 4 goals × 2–5 days) are **byte-identical** to the plan without the plane rule (DEV against HOLD + UPPER).
  - A NOVICE who names an exercise is class FAMILIAR_UNKNOWN_LOAD and gets the plane slots. Their push slot stays horizontal at LOW skill.
  - A beginner's restart after 8 weeks stays class NONE, with no plane slot.
  - **In a plan in force, after a change of days, the plane rule enters a beginner's plan (64/64 changes tried). It can make the lat-pulldown the plan held as an accessory a MAIN with the accessory's dose: 3×7 under STRENGTH** (B-01).
- **Strength athlete with named barbell lifts.**
  - 3 days: LOWER back-squat / deadlift; UPPER bench-press / barbell-row, accessories barbell-OHP / db-row; FULL_B lat-pulldown / db-overhead-press. Barbell-OHP is no longer the vertical MAIN because UPPER holds it as an accessory.
  - 4 and 5 days: UPPER_B lat-pulldown / db-overhead-press.
  - No plane-caused MAIN outside 4–6. The only rows outside 4–6 are the pre-existing bulgarian-split-squat-db MAIN at 3×7 on 4–5 days (A-11).
- **Changes of days in a plan in force** (GENERAL and STRENGTH-named-barbell; 2→4, 4→2, 2→3, 3→2, 3→4, 4→3):
  - In the 12 hand-traced changes (each made in week 2): status MODIFY, no MAIN exercise new to the plan, and no external MAIN outside the goal range.
  - The wider scans then found the exceptions below.
  - With 2→4 the vertical lifts move into UPPER's accessory slots (e.g. barbell-OHP 1×5, lat-pulldown 1×5 under STRENGTH; db-overhead-press 1×10, lat-pulldown 1×12 under GENERAL). UPPER_B keeps the horizontal defaults (D-15).
  - In the other directions they stay MAIN.
  - **In 4→2 (or 5→2) under STRENGTH with named lifts, FULL_B:2 becomes barbell-overhead-press.** That is the familiar lift the 4-day plan held only as an accessory, where it was correctly kept out of the vertical MAIN. It brings its accessory dose state:
    - change in week 2: 2×6 (inside 4–6);
    - change in week 1: 2–4×7 for 10 weeks (outside, B-01).
  - After 2→3 or 2→4 the vertical lifts moved into UPPER's accessory slots rotate at the block boundary (week 9) into **pike-push-up and band-assisted-pull-up, exercises new to the plan, bodyweight or assisted**, for a STRENGTH athlete with a full gym. The frozen engine's own accessory rotation in the same timeline brings loaded machine rows instead (B-02).
- **Loss and regain of equipment** (full gym → bands / none / machines → full gym, GENERAL and RS, permanent changes).
  - During the loss the slots take what the ordinary order gives, and no vertical exercise new to the plan comes in. With machines only, both pull MAINs are lat-pulldown, by the engine's own continuity (an exercise already in use).
  - After the regain every slot is back on the configuration it was built with (lat-pulldown, db-overhead-press). Under RS, OFF itself stays on push-up / band-row after the regain (frozen behaviour); DEV returns to the built loaded lifts.
- **Taper, race and post-event weeks** (hybrid 10K; full gym, dumbbells + bands, bands, bodyweight):
  - taper one set @3;
  - race and post-event weeks MAIN rows only @4;
  - **no exercise new in an event phase**, runs identical to OFF.
  - Trunk rows are absent in race and post-event weeks, as in OFF (existing event-week rule).
- **Rotation and the loading guard** (QRE note on D-3). Over 1056 externally loaded upper MAIN slots (16-week plans, rotation COACH_DECIDES and EVERY_2_WEEKS), **0** weekly MAIN rows of those slots are not externally loaded, with or without the rules. MAIN rows do not rotate by calendar (B0-C06: block boundary with a recorded reason), so the guard has nothing to cover there.
- **Interference.** Arrangement, phases and ordinal interference costs are identical to OFF in every named profile rerun. V-INT-02 and C.6 are green.

## 6. Rulings on D-13 to D-17 and on the QRE points

| Reading | Ruling | Reason |
|---|---|---|
| **D-13** No plane rule in a new plan of class NONE | **ACCEPT_WITH_CONDITION** | The benefit of plane alternation is plausible but uncertain, and V1 makes no claim for it (R1 decision). For someone starting from zero its costs were measured: a second configuration of a pattern debuting a week later at another dose, one more establishment, a trunk row lost under tight time, and reps 8→10 on unselected exercises (QRE A-07, 66 plans). Keeping a beginner's first plan to one configuration per pattern matches the engine's existing novice-density and movement-practice logic. It adds no dose, is reversible, and leaves vertical pushing out for them anyway (LOW skill). **Conditions:** (1) the enabling record states that SQ4-C4's "they do get lat-pulldown or band-pulldown" and SQ4-C9's sweep expectation hold only past movement practice, and that a class NONE new plan is identical to the plan without PLANE; (2) no copy shown to a class NONE plan suggests it covers both planes; (3) the Chief tells the Founder that the plane alternation the Founder asked for starts after a beginner's first plan. A restart from the record keeps class NONE (my probe), so "later" needs updated intake facts: an observation for the product, not a blocker (B-03). **The in-force side of D-13 ("in a running plan the class is not consulted") is REJECTED.** A running beginner plan acquires plane slots after a change of days (64/64 tried) and can make an accessory lift a MAIN with an accessory's dose (B-01). |
| **D-14** "Another role" looks at earlier sessions of the week | **ACCEPT for new plans and for anchored slots** | With the pinned catalog the plane-asking slot is in the last template with push and pull for 2, 3, 4 and 5 days, so nothing later can hold it. The role scan confirms PLANE adds no MAIN/ACCESSORY sharing (680 = 680). In a plan in force an **anchored** slot keeps its own MAIN state, which stays in range. It does not cover an **anchorless** slot after a change of days: there the role the configuration held *before* the change is what matters (B-01). Re-review trigger: any template or template-order change. |
| **D-15** After a change of days | **REJECT as declared** | **Kept:** the vertical lifts staying in the plan, and moving into UPPER's accessory slots after 2→4 (the engine's own continuity; doses inside the goal range). **Rejected:** "prefer the plane only among configurations the plan already uses", and with it the two declared guarantees. (1) **"No MAIN leaves its range" fails:** an anchorless plane slot takes a configuration the plan held only as an accessory and gives the MAIN that accessory's dose state. Example: barbell-overhead-press at 2–4×7 for 10 weeks under STRENGTH after 4→2 or 5→2 (44/672); lat-pulldown at 3×7 in a running beginner plan (B-01). (2) **"No new exercise enters because of the rule" fails** in the weeks ahead: the vertical lifts moved into accessory slots rotate at the block boundary into pike-push-up and band-assisted-pull-up (B-02). |
| **D-16** Under other rules only the clinical answer passes | **ACCEPT_WITH_CONDITION** | This is what A-02 required (`probe-binding`; test over six flags and four authorities). A-04(b) stays open: routine reviews give no adaptation, which is acceptable for synthetic use only, and a continuation path is needed before non-synthetic use. |
| **D-17** The trunk limitation, in numbers | **ACCEPT** | Matches my rerun (§2). Every lost row was a plank in repetitions (the test enforces it). The values text claims no equivalence and adds no dose. The 1000+ trunk-free weeks of the frozen engine stay with A-11. |
| **QRE A-07, N4 part** (dose shift of unselected exercises in 66 beginner plans) | **Resolved** | It came from the plane rule in practice-start plans, which D-13 removes (384/384 identical). |
| **QRE A-07, N1 part** (the replacement trunk row's sets and +2–3 min) | **ACCEPT** | The replacement (dead-bug, bird-dog or pallof-press) carries its own established progression under the engine's ordinary rule. It is within the goal's set maximum and reserve, and no session exceeds the athlete's minutes (QRE: 0 of 31,104). The plank row was smaller only because a rotation re-established it. SQ1-C6 asks for the goal dose, and this is it. |
| **QRE D-3 and rotation alternatives** | **ACCEPT** (no guard needed) | 0 non-external weekly MAIN rows in 1056 external plane-or-default slots (§5). An accessory rotating to bodyweight is the pre-existing B0-C06 behaviour and outside SQ4-C3. |
| **QRE A-02, the declared trunk gap** | **ACCEPT** | SQ1-C3 asks for a filled slot or a declared gap. `TRUNK_SLOT_UNFILLED` is declared while it stands, is non-blocking, offers "Accept the gap / Add a band", and claims no equivalence and no time. |
| **QRE A-01** (anchor through loss and regain) | Sporting consequence **resolved** | §5. |
| **QRE A-05** (fresh warning sign on a stranded plan) | Sporting part **resolved** | A-02 closed. The restart path stays A-04(b). |

## 7. New findings

| Id | Severity | Boundary | Statement | Evidence |
|---|---|---|---|---|
| SSCTR-STR-B-01 | **BLOCKING** | PLANE | **The A-01 defect on the in-force path.** After a change of strength days in a plan in force, a plane-asking slot with no anchor "prefers the plane among configurations the plan already uses". It can take a configuration the plan held **only as an ACCESSORY**; the MAIN row then carries that accessory's dose state (one configuration, one state). Two routes: **(a)** a plan built with plane slots whose anchor keys do not exist in the new template set (4→2, 5→2); **(b)** a plan built **without** any plane slot (class NONE, or NOVICE without a named exercise): `slotsInForce` is `{}`, `strengthRules` passes `inForce: {}`, which is truthy, and `buildTemplates` then assigns plane slots to a beginner's running plan. That contradicts D-13. **Doses observed:** <ul><li>barbell-overhead-press MAIN at 3×7, 3×7, 2×7, 4×7 … for 10 weeks under STRENGTH (repetition range 4–6). Named barbell lifts, full gym or barbell set, INTERMEDIATE/EXPERIENCED, 4→2 or 5→2 in week 1: 44 of 672 changes. Without the rule FULL_B:2 stays bench-press.</li><li>Running beginner plans, 3/4/5→2 at week 6: lat-pulldown MAIN at 3×7 under STRENGTH (6 of 64), and at 2×12 or 1×12 next to MAIN rows at 3×8 or 2×12 under GENERAL (12 of 64 give a MAIN an accessory's dose).</li></ul> SQ4-C6 dose clause NOT MET; R6-POLICY-5 STRENGTH range left for 10 weeks. The author's test "SQ-4 c6 (SSCTR-STR-A-01)" covers new plans only. | `r2-scan-changes.mjs`, `r2-b01-strength.mjs`, `r2-scan-inforce-small.mjs`, `r2-b01-detail.mjs`, `r2-probe.mjs` §1 and §4 |
| SSCTR-STR-B-02 | CONDITION | PLANE | After 2→3 or 2→4 days the vertical lifts move into UPPER's accessory slots (D-15). At the block boundary their accessory rotation brings in **pike-push-up and band-assisted-pull-up**, exercises new to the plan and bodyweight or assisted, at 2×7 in week 9 (DEVELOPMENT) for a STRENGTH athlete with a full gym. The frozen engine's rotation in the same timeline brings loaded machine rows. Not an event phase, within the envelope, established by effort, accessory only. But it contradicts "no new exercise enters because of the rule", and it is the loading-guard question for rotation that D-3 left aside, now reached through the plane rule. 56 of 672 changes. | `r2-scan-changes.mjs`, `r2-b01-strength.mjs` |
| SSCTR-STR-B-03 | OBSERVATION | PLANE | D-13's "these athletes get alternation in a later plan" holds only if the intake facts change. A restart from the record after 8 weeks keeps class NONE with no plane slot. | `r2-probe.mjs` §8 |
| SSCTR-STR-B-04 | OBSERVATION | PLANE | The values now carry descriptors (`notInANewPlanThat`, `neverPrefers`, `planInForce`) that the runtime does not read. They describe the code; they are not its authority. Drift between the two is QRE's to hold; no sporting effect. | `v1-strength.mjs` `shaped()`; `r7b-repertoire.mjs` `practiceStart` |

**Ruling on B-01 (why it blocks, and why no record can carry it).**
- It is the same defect I blocked in R1: a MAIN prescribed outside its goal's repetition range for most of a plan, caused by the rule, through one shared dose state. Here it is reached through an ordinary event (a change of strength days) rather than at plan build.
- In R1 I required "no externally loaded MAIN outside its goal's range that the same profile without PLANE does not have". The path is different, but the requirement is the same.
- It is not a safety risk: more repetitions at the same reserve means a lighter load. It is an envelope and goal-adequacy defect, and SQ-4 was approved on the explicit basis of an unchanged dose.
- An enabling record cannot fix a selection behaviour, and the author's one corrective cycle is used. So V1X-STRENGTH-PLANE stays **BLOCK**, with B-01 as the named blocker.

**What would close B-01 in a later, separately authorized mission (testable; I do not prescribe the code):**
1. A plan in force never acquires plane-asking slots it was not built with. Equivalently: a plan built without plane slots is never given one by a review.
2. An anchorless plane slot in a plan in force never takes a configuration the plan held before the change in a role other than MAIN.
3. `r2-scan-changes.mjs` and `r2-scan-inforce-small.mjs` (or equivalents at least as wide) show **0** added out-of-range external MAIN rows and **0** plane MAINs taken from accessory-only configurations.
4. A directed test holds each of these.
5. B-02 is resolved: either the moved verticals' accessory rotation brings no bodyweight or assisted exercise new to the plan where the frozen engine's would be loaded, or SSCTR rules on it with counts.
6. A fresh SSCTR review of those bytes follows.

## 8. Conditions for each enabling record (for the separate request; not issued)

**Common to every record:**
- synthetic data only, and no integration (D-11, D-12, QRE A-04);
- bound to values `15a51f55…850f`, catalog `ceee276a…92f9`, R6-POLICY-5 `a75be1aa…e100` and decision JSON `f8dee367…d379`;
- `review_by` 2027-04-30 plus the 2026-11-13 event triggers, and any template or template-order change (D-14). Owner: Chief;
- **before any non-synthetic use**, all of these closed: A-03 (pre-rule plans: every plan built under HOLD, or the SQ1-C7 migration reviewed), A-04(b) (a reviewed continuation path for plans under other rules), A-05 (expiry control), and QRE A-04 (route every plan carrying the binding through the strength entry point);
- the issuing SSCTR reads the QRE recheck first, and any QRE blocking finding on this boundary's bytes prevents issue;
- the records enable HOLD, UPPER and EXPOSURE only. Plans are then built under `[HOLD, UPPER]`. **Enabling PLANE later is a change of the rules in force:** every plan built before it then gets only the clinical answer (D-16). That transition belongs to A-04(b) and must be designed before PLANE is ever enabled where plans exist.

**Per boundary:**
- **HOLD.**
  - Both known limitations appear in every answer of a plan built under the rule. No copy claims equivalence, injury prevention or a time for any hold.
  - `v1str-time` pins 85/32 and the "every lost row was a hold" check. A change of either is a re-review trigger, not a test update.
  - `TRUNK_SLOT_UNFILLED` stays declared while it stands.
  - A time dose for holds (option b) needs its own SSCTR decision.
- **UPPER.**
  - Scope exactly SQ2-C1.
  - No copy that loaded upper work improves running or prevents injury.
  - Re-review if added load on bodyweight exercises or new RS-tagged upper configurations are admitted.
- **PLANE: no record (BLOCK, B-01).** No record file may carry an enabling or development entry for `V1X-STRENGTH-PLANE`. If a later mission closes B-01 and B-02, the record would carry:
  - D-13 as amended (class NONE new plans identical to the plan without PLANE);
  - D-3 as the guard's definition;
  - no coverage or benefit claim (SQ4-C7, C8);
  - no automatic adoption in running plans;
  - re-review on new vertical configurations, templates, or template order.
- **EXPOSURE.**
  - `consumers: []` and V-INT-01 stay green.
  - SQ3-C4/C5 apply on every surface.
  - The executed number is described as sets logged in this week's sessions.
  - Data/G03 joint review before any athlete-facing display.
  - Any target, fraction or automatic increase only through G02.

## 9. Funded human revalidation

Each record with prescriptive impact needs a `QUEUED_FOR_FUNDED_HUMAN_REVALIDATION` entry. `HQ-SI-V1-SSCTR-SQ-1` to `SQ-4` are still **proposed only**; I may not edit the queue. Items a funded qualified human should revalidate, with no AI veto:
- the loss of anti-lateral-flexion work and a hold time dose;
- the declared trunk loss under tight time;
- loaded upper work for runners;
- whether plane coverage matters, and the D-13 exclusion of beginners;
- the primary-only counting convention;
- the pre-existing shared-state dose and time-fit trunk questions (A-11).

## 10. What I could not verify

- This instance's dispatch mechanism.
- Full-text appraisal of any source. No new literature was needed: every ruling here is conformance or a conservative narrowing, none rests on a new scientific claim.
- The QRE recheck (it does not exist yet).
- The joint suite (1598/1600 per the author) and `v1str-freeze --preserved`. I did not run them; they are QRE's.
- Exhaustive event chains. Changes of days, loss and regain, restarts and clinical signals were sampled, not fuzzed.
- The wider in-force scan (all four goals and INTERMEDIATE, weeks 2 and 6). I stopped it once B-01 was established by the change scan and the beginner scan; its partial run is not used, so the full scale of B-01 across HYPERTROPHY and RUNNING_SUPPORT is not measured.
- Any app copy or integration (none exists).
- Any physiological effect. No human, empirical or clinical validation occurred.

**Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication:** NOT_PUBLISHED. human_validation = false, empirical_product_validation = false, clinical_clearance = false.
