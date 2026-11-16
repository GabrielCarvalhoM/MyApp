# SSCTR recheck R3: V1STR N4 focused fix-forward (5f7f6f6)

**Record:** `SSCTR-V1STR-N4-RECHECK-R3`, 2026-11-16. Structured version: `SSCTR_V1STR_N4_RECHECK_R3.json` (same folder). This is the one independent SSCTR recheck the Founder authorized for the N4 fix-forward. R1 and R2 (`SSCTR_V1STR_REVIEW_R1.*`, `SSCTR_V1STR_RECHECK_R2.*`) are not edited.

**Reviewer:** SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, protocol SSCTR-EP-1.0.0.
- A fresh subagent instance, not the instance that wrote R1 and R2. Launched by the Chief with the project SSCTR adapter text; model inherited (claude-opus-5-5). This instance cannot verify its own dispatch mechanism.
- Not the author of the candidate or of the fix (Chief on Fable 5.2).
- Software provisional reviewer with no human credentials. Nothing here is human, empirical or clinical validation.

**Not in this record:** no enabling record (`SSCTR_V1STR_RECORDS.json` is not created), no gate closed, nothing published, no queue or governance edit. As instructed, I did **not** read the QRE recheck of this fix (`…N4_RECHECK_R3…` under `reviews/qre/`); the records are decided after it, in a separate step. I read the R2 QRE recheck only through the closure's summary.

**Host context.** My context holds the host `CLAUDE.md` and a memory index written in the author's sessions. I took nothing from them as evidence. I used one operational hint from the memory index (an archive extract of `CoachingCore` needs its dependency folder copied in) to build scratch trees of older commits, and verified it by running them.

**Literature access.** Europe PMC REST confirmed working (one query on exercise variation, 10 hits). One record read at abstract-summary level, not full text: Kassiano W et al., *Does Varying Resistance Exercises Promote Superior Muscle Hypertrophy and Strength Gains? A Systematic Review*, J Strength Cond Res 2022;36(6):1753-1762, PMID 35438660, doi:10.1519/jsc.0000000000004258 (8 studies, N = 241, all young men; systematic variation may help, excessive or random variation may compromise gains). It is auxiliary context for D-18 and D-19 only; no ruling here rests on it. Every ruling is conformance to SQ-4 and to R2's six criteria, or a conservative narrowing.

## 0. Target

| Item | Value |
|---|---|
| Commit | `5f7f6f6fae64dbe0ad7a90ca550dce7bdc517636`, HEAD of `claude/v1-strength-corrections`, tree clean at start (verified) |
| Previous judged bytes | `3342a1dc013ff72da34f530cfa7028797ac6fb4a`; `76b84480…4912` has the same `CoachingCore/` bytes (empty `git diff --stat 3342a1d 76b8448 -- CoachingCore`) |
| Fix | `git diff 76b8448 5f7f6f6`: two expressions in `buildTemplates` (which slots ask in a plan in force; what an anchored slot prefers when its own configuration does not fit), comments, the `planInForce` phrase in the values, the pinned values sha, the freeze script's authorized hashes and header, the test file |
| `v1/STRENGTH_EXTENSION_V1.json` | `06d4731de7cf748adf53ff4b88bdffcfe14200ee69c9d8cd1d86257c0d749b33`, verified against the bytes; still binds catalog `ceee276a…92f9` (file `r7/b0/REPERTOIRE_CATALOG_B0.json` verified) and decision JSON `f8dee367…d379` (verified) |
| `src/r7b-repertoire.mjs` | `1997a4e5e0e6090829686ed1a277036436b326543bfc1ac923ed6fc10eba776b` |
| `src/v1-strength.mjs` | `6ea7486c009809d342943d3983592bdbfda409c6ddb29126761c8d7990328dda` (only the pinned values sha changed) |
| `src/v1-strength-index.mjs` | `36666ab2…1b10` (unchanged) |
| `test/v1str-extension.test.mjs` | `07ce5a4df0354875a5c356dd8af3c194cb8ed069965948f0b8e04f14e1624c20` |
| `scripts/v1str-freeze.mjs` | `0da887ff…4c98` |
| `r6/PROGRAM_POLICY_R6.json` | `a75be1aa…e100` (unchanged) |
| Author record `V1STR_N4_FIX_FORWARD.md` | `8729dfd5…0a5010` |
| Author probe `probes/n4-b02-counts.mjs` | `074567cb…42aa` |
| Frozen engine (`src/r6-*.mjs`, `r6/`, `r7/`) | no diff between `2dfa216` and `5f7f6f6` |

## 1. Dispositions

| Boundary | R2 (on `3342a1d`) | R3 (on `5f7f6f6`) | In one line |
|---|---|---|---|
| `V1X-STRENGTH-HOLD-DOSE` (N1) | ACCEPT_WITH_CONDITIONS | **ACCEPT_WITH_CONDITIONS** | Unchanged bytes and unchanged measurements (85/32 trunk limitation, no hold row, clinical precedence). |
| `V1X-STRENGTH-UPPER-LOADING` (N2) | ACCEPT_WITH_CONDITIONS | **ACCEPT_WITH_CONDITIONS** | Unchanged. |
| `V1X-STRENGTH-PLANE` (N4) | BLOCK (B-01) | **ACCEPT_WITH_CONDITIONS** | B-01 is closed on every measure I ran, including the MAIN dose itself: 0 added out-of-range external MAINs in 2,688 single changes, 1,152 chains of two changes and 192 changes between 4 and 5 days; 0 MAIN rows whose dose state another role built because of the rule; 384 kept vertical MAINs with week-by-week doses identical to the same plan without the change. D-18 accepted with conditions; B-02 ruled under D-19 (accepted with a condition on the record). |
| `V1X-STRENGTH-EXPOSURE` (N3) | ACCEPT_WITH_CONDITIONS | **ACCEPT_WITH_CONDITIONS** | Unchanged. |

**No new blocking finding.** These are dispositions on the bytes, not records. The records are issued only after the QRE recheck is read (§10).

## 2. Evidence I ran on 5f7f6f6 (read-only)

Predecessor scripts were rerun **unchanged** from `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\21ffbd32-da9f-43c9-b8b9-3f3dffe707fe\scratchpad\ssctr-v1str\`. My scripts and every output are in `C:\Users\carva\AppData\Local\Temp\claude\858165ffefe5d744\5e4a7765-3b4b-44f4-a8e4-e5048aab9bf3\scratchpad\judges\ssctr-n4\` (`r3-*`).

| Check | R2 (on `3342a1d`) | R3 (on `5f7f6f6`) |
|---|---|---|
| `node --test` on the five `v1str-*` test files | 63/63 + 1/1 | **67/67** (`r3-tests.tap`) |
| The four new tests on a scratch copy of `5f7f6f6` with `76b8448`'s `r7b-repertoire.mjs` swapped in | n/a | **0/4 pass**; first failures name the B-01 cases (a running NONE plan "a slot asks: 4"; STRENGTH FULL 4→2 keeps `FULL_B:1=lat-pulldown, FULL_B:2=barbell-overhead-press`) |
| `scan-roles.mjs` (1,500 new plans) | OFF/PLANE/DEV 128/128/128; sharing 680/680/680 | **identical** (only the timing line differs) |
| `probe-ssctr.mjs` (named profiles) | as R1 apart from beginners | **byte-identical output** |
| `probe-time3.mjs` (600 plans, 30/40/45 min) | DEV 85/32, HOLD 85/32, UPPER 0/0, PLANE 0/0 | **byte-identical output** |
| `probe-binding.mjs` (plan under other rules; pain, injury, pain with an exercise) | CLINICAL_HUMAN_REQUIRED, no proposal | **byte-identical output** |
| `probe-catalog-profiles.mjs` (KB, BANDS_PULLUP, PULLUP) | 0 problems | **byte-identical output** |
| `r2-probe.mjs` | see R2 §5 | Only §1 (changes of days) and §4 (beginner plan in force) differ, exactly where the fix acts: after a change that replaces the asking template no slot asks and the selection is the horizontal default the plan has without the rule; the beginner 3→2 case is now identical to the plan without the rule. §2 loss and regain, §3 beginners' new plans, §5 named-barbell athlete, §6 taper/race/post-event, §7 MAIN rotation and the loading guard, §8 beginner restart: byte-identical |
| `r2-scan-changes.mjs` STRENGTH (672) | out-of-range MAIN added **44**; new upper exercise 56 | **0**; 56 |
| `r2-scan-changes.mjs` GENERAL / HYPERTROPHY / RUNNING_SUPPORT (672 each; not measured in R2) | not run | **0 / 0 / 0**; new upper exercise 104 / 0 / 160 |
| `r2-b01-strength.mjs` | 44 (barbell-overhead-press 2–4×7 for 10 weeks) | **0**; the 2→4 and 2→3 new exercises unchanged (pike-push-up, band-assisted-pull-up, w9 DEVELOPMENT ACCESSORY 2×7) |
| `r2-b01-detail.mjs` (NONE, machines, 3→2 at week 7) | lat-pulldown MAIN 1×12 against 2×12 | **DEV identical to NOPLANE**; "asking slots after the change: none" (`inForce` is still `{}`, now inert) |
| `r2-scan-inforce-small.mjs NONE,NOVICE` (64) | 64 given plane slots; 12 accessory→MAIN; 6 out of range | **0; 0; 0**; MAIN set differs from the no-plane timeline 0 |
| `r2-scan-inforce-small.mjs` default (with INTERMEDIATE, 128) | not run | 0 given a slot; 0 accessory→MAIN; 0 out of range; 12 MAIN sets differ (INTERMEDIATE 3→2, the anchored slot keeping the lift it was built with) |
| `r2-scan-inforce.mjs` NONE / NOVICE / INTERMEDIATE (all four goals, five equipment sets, weeks 2 and 6; **never completed in R2**) | stopped, not used | NONE 280 and NOVICE 280: 0 given a slot, 0 accessory→MAIN, 0 MAIN set differs, 0 out of range. INTERMEDIATE 560: built with slots, 0 accessory→MAIN on a plane slot, 0 out of range; 136 MAIN sets differ from the no-plane timeline (a plan built with the vertical lifts keeps them where its template stays) |
| New `r3-main-dose.mjs` (4 goals × 168 changes, INTERMEDIATE, 6 equipment, named none/barbell, 7 directions, weeks 1 and 3) | n/a | (A) MAIN rows whose configuration first entered the plan as an ACCESSORY and that the timeline without the plane rule does not have at the same week, session and role: **0** in 672 changes. (B) 384 MAINs kept by an anchored asking slot: dose trail differs from the same plan with no change of days **0/384**; 120 of them also have an ACCESSORY row in a week ahead (the D-19 sharing); external MAIN outside the goal range **0** |
| New `r3-chain.mjs` (chains of two changes; 12 chains × 6 equipment × 4 profiles incl. a NOVICE with a named exercise, × 4 goals = 1,152) | n/a | asking slots not built with **0**; out-of-range external MAIN added against NOPLANE **0**; status other than MODIFY 0. A MAIN row on a configuration held only as ACCESSORY before the second change occurs in 336 chains, **every one identical to the same slot in the timeline without the plane rule** (the frozen engine's continuity), **none on an asking slot** |
| New `r3-45.mjs` (4↔5 days, the only other change that keeps the asking template `UPPER_B`; 192) | n/a | anchors exactly as built 192/192; out-of-range added 0; accessory→MAIN not in NOPLANE 0; 384 anchored MAIN rows, dose trail differs from no change **0** |
| New `r3-off-rotation.mjs` (582 new plans, no change of days) | n/a | Frozen engine alone (OFF): in **150** plans an externally loaded upper ACCESSORY rotates into a bodyweight, assisted or band one of the same pattern (378 events; DEVELOPMENT 264, CONSOLIDATION 114; e.g. `db-overhead-press → pike-push-up` 60, `machine-chest-press → incline-push-up` 78, `kb-row → band-row` 12). DEV: 169 plans, 439 events |
| New `r3-b02-at.mjs` (B-02 listed per case on `21838cb`, `76b8448` and `5f7f6f6`; STRENGTH) | n/a | 56 of 672 changes and 64 rows on **each** of the three trees (pike-push-up 40, band-assisted-pull-up 24; all ACCESSORY, week 9 DEVELOPMENT, 2×7; 0 on a plane-asking row). The per-case lists are **byte-identical** across `21838cb`, `76b8448` and `5f7f6f6` (0 diff lines). Trees built by `git archive` into scratch folders with the dependency folder copied in |
| New `r3-b02-at.mjs` RUNNING_SUPPORT, plane rule alone / every rule but the plane rule | n/a | Plane rule alone: 104 changes, 112 rows (pike-push-up 88, band-assisted-pull-up 24), all ACCESSORY, week 9 DEVELOPMENT, 1×10, **0 on a plane-asking row**. Every rule but the plane rule (N2 + N1): 160 changes, 320 accessory rows, 208 externally loaded; 184 enter in the week of the change, 136 in week 9; **pike-push-up 48 in week 9** (N2's loaded accessory rotated by the engine). Same counts as the author's table |
| New `r3-hybrid.mjs` (hybrid 10K 12 w and half marathon 16 w; 4 equipment; 30 and 45 min; 2↔3, 2→4, 3→4, 4→2; change early, mid-plan or in the taper; DEV vs NOPLANE vs OFF) | n/a | 240 plans: status differs 0; **runs differ 0**; strength placement (date, turn, back-to-back order) differs 0; strength sessions over the athlete's minutes 0; an exercise new in TAPER, RACE_WEEK or POST_EVENT 0; loaded MAIN outside 6–10 0 |

## 3. R2's six closing criteria (section 7), on these bytes

| # | Criterion | Status | Counts |
|---|---|---|---|
| 1 | A plan in force never acquires plane-asking slots it was not built with | **MET** | By construction a slot asks only where `inForce` holds a string anchor for that template type and slot (line 300). Measured: plans built with none, 0 given one (small scan 64; full scan NONE 280, NOVICE 280; test "criterion 1", 26). Plans built with slots: asking keys and anchors a subset of the built ones in 1,152 chains (0 violations) and equal to the built ones in 192 changes 4↔5 |
| 2 | An anchorless plane slot in a plan in force never takes a configuration the plan held before the change in a role other than MAIN | **MET** | An anchorless asking slot no longer exists in a plan in force. Plane MAIN from an accessory-only configuration: 0 (small scan 128; full in-force scans 1,120; chains 0 on an asking slot). Wider than the criterion: 0 MAIN rows whose configuration first entered as an accessory and that the no-plane timeline lacks (672 changes) |
| 3 | The scans show 0 added out-of-range external MAIN rows and 0 plane MAINs taken from accessory-only configurations | **MET** | `r2-scan-changes` 0/2,688 (STRENGTH 0, was 44; GENERAL 0; HYPERTROPHY 0; RUNNING_SUPPORT 0); `r2-scan-inforce-small` 0/64 (was 6) and 0/128; full in-force 0/1,120; `r2-b01-strength` 0 (was 44); chains 0/1,152; 4↔5 0/192 |
| 4 | A directed test holds each | **MET** | Four new tests in `test/v1str-extension.test.mjs` (read in full). "criterion 1" holds item 1 for plans built without slots, including 30 and 45 min. "criteria 2 and 3" holds items 1–3 for plans built with slots over 56 changes in four goals, and pins the traced cases (`FULL_B:2` = bench-press after 4→2 and 5→2; seated-cable-row; push-up). "what does not change the templates" holds anchors through weekday moves, a skill substitution and a change of days in the taper with no exercise new in an event phase. "criterion 2" holds the selection at the `buildTemplates` level, including "the familiar overhead press the plan uses is not moved into the MAIN row". All four fail on the pre-fix file (0/4) and pass here. Coverage gap noted as C-01 (4↔5 not in the tests; my probe covers it) |
| 5 | B-02 resolved, either by code or by an SSCTR ruling with counts | **MET by ruling** (second branch) | D-19 ruled in §6 with counts |
| 6 | A fresh SSCTR review of these bytes | **MET** (this record) | The QRE recheck is the other half of the closure; not read here by design |

## 4. R2 findings: status

| Id | R2 severity | R3 status | Evidence |
|---|---|---|---|
| SSCTR-STR-B-01 | BLOCKING | **CLOSED** | §3 criteria 1–3, with the MAIN dose verified, not only the selection: no externally loaded MAIN outside its goal's range that the same timeline without the rule does not have (2,688 + 1,152 + 192 + 1,120 in-force), and no MAIN row carrying a dose state another role built because of the rule (`r3-main-dose` (A) 0/672; chains: every accessory→MAIN identical without the rule). The kept vertical MAINs carry exactly their own doses (0/384 + 0/384 trail differences). SQ4-C6 dose clause now MET in plans in force |
| SSCTR-STR-B-02 | CONDITION | **RULED: ACCEPT_WITH_CONDITION on the record** (D-19, §6) | Counts unchanged by the fix and present on `21838cb`; produced by the frozen engine's continuity and B0-C06 rotation, with no plane row involved |
| SSCTR-STR-B-03 | OBSERVATION | **Unchanged; scope widened by D-18** | A beginner's restart keeps class NONE (`r2-probe` §8 identical). Under D-18 a running plan of any class never starts alternating; alternation comes only with a new plan whose intake facts admit it |
| SSCTR-STR-B-04 | OBSERVATION | **Unchanged** | The runtime still reads only `planeAlternation.patterns`; `planInForce`, `neverPrefers`, `notInANewPlanThat`, `loadingGuard`, `sequence`, `trigger` are not read. The new `planInForce` phrase now describes the code accurately. Drift stays QRE's to hold |
| SSCTR-STR-A-03, A-04(b), A-05, A-11; QRE A-04 | as R2 | **Unchanged, open as in R2** | Not touched by this fix |

SQ-4 conditions whose status changed: **c5 PARTIAL → MET** under D-18 (stricter than "existing programs adopt N4 at the next block boundary": a plan in force never adopts; the configuration stays fixed per slot; directives still win, test "what does not change"). **c6 PARTIAL → MET** (phase clause as before; dose clause now MET in plans in force).

## 5. Ruling on D-18: in a plan in force the rule only keeps

**ACCEPT_WITH_CONDITIONS.**

Reasons:
- It is R1's D-2 reading, which R1 accepted ("N4 only keeps, never adopts, in a running plan"), extended to plans built without plane slots. It is stricter than SQ4-C5's adoption at a block boundary, and stricter is admissible here: SQ-4 was approved on admissibility, stability and the Founder's request, with the benefit of plane coverage PLAUSIBLE_BUT_UNCERTAIN and not claimable (decision record; null search). No evidence ties a sporting outcome to keeping two planes after a change of schedule, while the R2 defect showed what adoption inside a running plan costs. The variation literature I could reach (Kassiano 2022, abstract level) favours systematic variation over frequent or random change, which is consistent with keeping a running plan stable; it is auxiliary only.
- The cost is real and stated: after a change that replaces the template of the asking slots (2↔4, 3↔4, 2↔5, 5→2), the plan no longer alternates planes, and the vertical lifts it was built with can leave it. I saw it in `r2-probe` §1 (4→2: `FULL_B` back to bench-press and barbell-row, or db-row and db-bench-press). After 2→3 and 4↔5 the anchors stay and the lifts stay MAIN with unchanged doses. After 2→4 the lifts first stay as UPPER accessories (the engine's continuity) and then rotate at the block boundary (B-02). The author's count of 88 of 308 QRE sequences losing a vertical MAIN is the author's claim; I did not rerun the QRE probe.
- R2 "kept" the vertical lifts staying in the plan as an accepted consequence of D-15, not as a requirement of SQ-4. The Founder has recorded this cost as accepted ("the selection may keep existing exercises instead of making a desired vertical alternation"), and the Founder's principles state that the alternation is not forced where it would compromise dose, role or stability. Under SSCTR-07, KEEP is the minimum effective change here: no dose, role or stability is touched.

Conditions the PLANE record would carry:
1. It states D-18 as the in-force rule: a slot asks only where the plan was built with it asking; it keeps the configuration it was built with while that fits, prefers nothing while it does not, and returns to it when it fits again; a plan in force never adopts the rule; alternation resumes only in a new plan.
2. No copy for a plan in force claims both planes or "alternation" unless the current week's rows hold them (SQ4-C7, C8), and no copy presents the loss after a change of days as a coaching choice made for the athlete.
3. Any later adoption mechanism in plans in force is a new SQ-4 c5 question with its own SSCTR review, and must keep criteria 1–3 of R2 (no accessory-held configuration moved into a MAIN row).

## 6. Ruling on D-19 and SSCTR-STR-B-02

**ACCEPT_WITH_CONDITION on the record** (criterion 5, second branch).

The author's three claims, checked:
1. **Unchanged by the fix and already present on `21838cb`.** Confirmed: the STRENGTH matrix lists the same 56 changes and 64 rows, case by case, on `21838cb` (the R1 candidate, which had no "already uses" preference), on `76b8448` (the R2 bytes) and on `5f7f6f6`. The predecessor's `r2-scan-changes` gives 56 on `3342a1d` (recorded) and 56 here; GENERAL 104 and RUNNING_SUPPORT 160 here match the author's table.
2. **Produced by the frozen engine's continuity and its B0-C06 rotation, with the plane rule selecting nothing that week.** On the candidate, in every listed case the new row is an UPPER ACCESSORY row with no `planeAlternation` (STRENGTH: 0 of 64 rows on a plane-asking row; RUNNING_SUPPORT with the plane rule alone: 0 of 112). The traced case (`r2-b01-strength`): after 2→3 or 2→4 the moved verticals rotate at week 9 (DEVELOPMENT) into pike-push-up and band-assisted-pull-up, 2×7 ACCESSORY, where OFF's accessories rotate into machine-chest-press and seated-cable-row. The difference comes from which configuration sits in the accessory slot when the engine rotates it: the catalog's admissible alternatives of a vertical configuration, for an athlete not familiar with HIGH-skill vertical lifts, are bodyweight or assisted.
3. **The frozen engine alone rotates a loaded upper accessory into a bodyweight, assisted or band one in the same way, and so does N2 alone under RUNNING_SUPPORT.** Confirmed independently: with every strength boundary off and no change of days, 150 of 582 new plans do so (378 events, including `db-overhead-press → pike-push-up` 60 times), in DEVELOPMENT and CONSOLIDATION only. Under RUNNING_SUPPORT with the plane rule off and the other rules on, N2 puts `db-overhead-press` into the new accessory slot and the engine rotates it into `pike-push-up` in week 9 (48 rows in 672 changes), the same move.

Why it is acceptable:
- It is not a plane-rule selection and touches no MAIN row: the MAIN doses of the kept verticals are identical to the plan without the change (0/384), and no B-02 row appears in an event phase (every listed row is week 9 DEVELOPMENT; the hybrid probe finds nothing new in TAPER, RACE_WEEK or POST_EVENT in 240 plans).
- The rotated row is an accessory at the goal's sets and repetitions with the engine's effort-based establishment, inside the R6-POLICY-5 envelope; one swap at a block boundary, not random change.
- The loss of external loading in a rotated accessory is a property of the frozen B0-C06 rule (no loading guard in accessory rotation), which SQ-4 did not approve or change; R2 already ruled that an accessory rotating to bodyweight is pre-existing B0-C06 behaviour, outside SQ4-C3. A loading guard for rotation would be a new rule on B0-C06, not part of SQ-4. I route that question with A-11 (C-02).
- The fix reduces, not adds, novelty: in the STRENGTH and GENERAL matrices the plan with the rules brings fewer new exercises after a change than the plan without them (author: 384 against 608; consistent with my per-case lists).

Condition on the PLANE record: it states, as a known behaviour of plans in force, that after a change from two to three or four strength days the vertical configurations a plan was built with can occupy upper accessory slots through the engine's continuity, and that at the next block boundary the engine's rotation can replace them with admissible alternatives of the same plane that are bodyweight or assisted; that this is the frozen B0-C06 rotation, not a plane-rule choice; and that no copy presents it as a progression or as the plane rule's doing. A change of these counts is a re-review trigger.

Related observation, not a condition: after 2→4 (and while shared after 2→3) the vertical configuration's UPPER accessory row carries the state the MAIN row built (STRENGTH: barbell-overhead-press 1×5 and lat-pulldown 1×5, where OFF's UPPER accessories are 1×7). That is the frozen engine's one-state-per-configuration (A-11) seen from the accessory side; the reps are inside the goal's range and the MAIN dose is unaffected (0/384).

## 7. N1, N2 and N3 on these bytes, and the sporting envelopes

**N1, N2, N3: R2 dispositions confirmed (ACCEPT_WITH_CONDITIONS each).** No line of theirs changed; the only shared byte is the `planInForce` phrase, hence the new values sha `06d4731d…9b33` every record must bind. Reruns: time budget byte-identical (DEV 85/32, HOLD 85/32, UPPER 0/0, PLANE 0/0, OFF 1,801 trunk-free weeks); role scan identical; binding and clinical precedence byte-identical; catalog profiles byte-identical; own tests 67/67.

**Envelopes (point 6).**
- Dose, progression, recovery: no dose code touched; anchored MAIN doses identical to the no-change plan (768 trails); no out-of-range MAIN added anywhere I measured.
- Interference with running, taper, race week: in 240 hybrid race plans in force (10K and half marathon; changes early, mid-plan and inside the taper) runs, strength placement and status are identical with all rules, without the plane rule and with the strength extension off; no session exceeds the athlete's minutes; nothing new in an event phase. `r2-probe` §6 (taper one set @3, race and post-event weeks MAIN only @4, nothing new in an event phase, runs identical to OFF) is byte-identical to R2.
- 30–45 minute sessions: `probe-time3` byte-identical; the hybrid probe at 30 and 45 min (above); test "criterion 1" at 30 and 45 min.
- Beginners and novices: NONE and NOVICE plans in force identical to the plan without the rule (560 + 64); a NOVICE with a named exercise (class FAMILIAR_UNKNOWN_LOAD) in the chains (288 chains, 0 violations); beginners' new plans byte-identical (`r2-probe` §3, `probe-ssctr`).
- All four strength goals: every matrix above.
- Loss and regain of equipment: `r2-probe` §2 byte-identical to R2 (back to the built anchors after the regain); test "SQ-4 c5 (QRE-STR-A-01)" passes.
- Substitution for skill: test "what does not change the templates" (the athlete's decision takes the slot with its reason; the anchor stays).
- Pain and warning signs: `probe-binding` byte-identical; CLINICAL_HUMAN_REQUIRED with no proposal under every authority, before the refusal of a plan built under other rules.

## 8. New findings

| Id | Severity | Boundary | Statement | Evidence |
|---|---|---|---|---|
| SSCTR-STR-C-01 | OBSERVATION | PLANE | Neither the directed tests nor the R2 change matrices include a change between 4 and 5 strength days, the only change besides 2↔3 that keeps the asking template (`UPPER_B`). My probe shows it right (192 changes: anchors as built, 0 out of range, 0 accessory→MAIN, 0/384 dose differences). A test for it is QRE's call; not a condition. | `r3-45.mjs` |
| SSCTR-STR-C-02 | OBSERVATION (pre-existing, frozen engine) | none (B0-C06) | The frozen accessory rotation has no loading guard: with every strength boundary off, 150 of 582 new plans rotate an externally loaded upper accessory into a bodyweight, assisted or band one of the same pattern (378 events, DEVELOPMENT and CONSOLIDATION). This is the mechanism behind B-02 and behind N2's own rotation under RUNNING_SUPPORT. Whether accessory rotation should keep the loading class is a question for the frozen engine, to route with A-11 to the Founder; it is not a condition of SQ-2 or SQ-4. | `r3-off-rotation.mjs` |

## 9. Conditions each enabling record would carry (for the separate request; not issued)

**Common to every record:**
- synthetic data only and no integration (D-11, D-12, QRE A-04);
- bound to values `06d4731de7cf748adf53ff4b88bdffcfe14200ee69c9d8cd1d86257c0d749b33`, catalog `ceee276a…92f9`, R6-POLICY-5 `a75be1aa…e100`, decision JSON `f8dee367…d379`;
- `review_by` 2027-04-30 plus the 2026-11-13 event triggers, and any change of templates, template order or the template set of a number of days (D-14, D-18). Owner: Chief;
- before any non-synthetic use, closed: A-03 (pre-rule plans), A-04(b) (continuation path for plans under other rules), A-05 (expiry control), QRE A-04 (every plan carrying the binding routed through the strength entry point);
- the issuing SSCTR reads the QRE recheck of this fix first; any QRE blocking finding on a boundary's bytes prevents that boundary's record;
- if the four records are issued together, plans are built under `[HOLD, PLANE, UPPER]`; if PLANE's record is issued after the others, that is a change of the rules in force for every plan already built, and belongs to A-04(b).

**Per boundary:**
- **HOLD:** as R2 (both known limitations in every answer of a plan built under the rule; no equivalence, injury-prevention or hold-time claim; `v1str-time` pins 85/32 and every lost row a hold, a change is a re-review trigger; `TRUNK_SLOT_UNFILLED` declared while it stands; a hold time dose needs its own decision).
- **UPPER:** as R2 (scope exactly SQ2-C1; no copy that loaded upper work improves running or prevents injury; re-review on added load for bodyweight exercises or new RS-tagged upper configurations). C-02 noted, not a condition.
- **PLANE:** D-13 as amended (a class NONE new plan is identical to the plan without PLANE; SQ4-C4 and C9 hold past movement practice only; no copy suggests plane coverage to a class NONE plan); D-18 conditions 1–3 (§5); the D-19 condition (§6); D-3 as the guard's definition; no coverage or benefit claim (SQ4-C7, C8); re-review on new vertical configurations, templates, template order, a template set per number of days, or any adoption mechanism in plans in force; the four tests that pin criteria 1–3 are re-review triggers if changed, not test updates.
- **EXPOSURE:** as R2 (`consumers: []` and V-INT-01 green; SQ3-C4/C5 on every surface; executed described as sets logged in this week's sessions; Data/G03 joint review before any athlete-facing display; any target, fraction or automatic increase only through G02).

## 10. Funded human revalidation

Each record with prescriptive impact needs a `QUEUED_FOR_FUNDED_HUMAN_REVALIDATION` entry. `HQ-SI-V1-SSCTR-SQ-1` to `SQ-4` are still **proposed only**; I may not edit the queue. Items a funded qualified human should revalidate, with no AI veto: the loss of anti-lateral-flexion work and a hold time dose; the declared trunk loss under tight time; loaded upper work for runners; whether plane coverage matters, the D-13 exclusion of beginners and the D-18 loss of alternation after a change of days; accessory rotation from loaded to bodyweight or assisted variants for strength-goal athletes (B-02, C-02); the primary-only counting convention; the pre-existing shared-state dose and time-fit trunk questions (A-11).

## 11. What I could not verify

- This instance's dispatch mechanism.
- Full text of any source (one record read at abstract-summary level; no ruling rests on it).
- The QRE recheck of this fix (not read, by instruction) and therefore the condition that no QRE blocking finding exists.
- The joint suite (author: 1601/1603), `v1str-freeze --preserved` and the historical freezes: QRE's; not run.
- The QRE probe counts the author cites (88 of 308 sequences losing a vertical MAIN; 16 → 0 role switches): not rerun.
- The author's draft probes outside the repository (the `21838cb` clone, the dose trails): not read; I built my own.
- Exhaustive event chains: changes of days, chains of two, loss and regain, taper changes and clinical signals were sampled widely, not fuzzed.
- Any app copy or integration (none exists). Any physiological effect: no human, empirical or clinical validation occurred.

**Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication:** NOT_PUBLISHED. human_validation = false, empirical_product_validation = false, clinical_clearance = false.
