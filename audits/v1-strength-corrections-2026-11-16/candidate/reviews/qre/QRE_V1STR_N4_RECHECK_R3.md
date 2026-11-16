# QRE recheck R3: V1STR N4 focused fix-forward (5f7f6f6)

- **Judge:** Quality & Reliability Engineer 1.3.0, a fresh instance (claude-opus-5-5). I did not write the fix and I am not the instance that wrote R1 and R2; I read their records and reran their probes. This is the one recheck the Founder authorized for N4.
- **Judged:** commit `5f7f6f6fae64dbe0ad7a90ca550dce7bdc517636` against `76b8448` (the code of `3342a1d`). HEAD and a clean tree were confirmed before anything ran. Bytes judged (sha256 prefix):
  - `CoachingCore/src/r7b-repertoire.mjs` 1997a4e5e0e60908 (44+/11- against its frozen base)
  - `CoachingCore/src/v1-strength.mjs` 6ea7486c009809d3
  - `CoachingCore/src/v1-strength-index.mjs` 36666ab27894cf21 (unchanged since R2)
  - `CoachingCore/v1/STRENGTH_EXTENSION_V1.json` 06d4731de7cf748a
  - `CoachingCore/scripts/v1str-freeze.mjs` 0da887ff8c20d53c
  - `CoachingCore/test/v1str-extension.test.mjs` 07ce5a4df0354875 (the other four `v1str-*` test files and the helpers are byte-identical to `76b8448`)
- **Where things ran:** the joint suite, the own tests and `--preserved` ran in the worktree, which stayed clean apart from my own new files under `reviews/qre/`. Everything else ran in new scratch clones under `scratchpad/judges/qre-n4/`: `r3-clone` (5f7f6f6, probes), `r3-red` (76b8448 code with the new test file), `r3-mut-0..3` (mutation), `r3-freeze` (the freeze rehearsal, with a TEST-ONLY records file). No recursive deletion was used; nothing was committed, pushed or written outside those places.
- **Independence:** I read the SSCTR R2 record only for the statements of SSCTR-STR-B-01, B-02, B-04 and the six closing criteria (as listed in `V1STR_CLOSURE.md`). I did not open the SSCTR's working folder or any SSCTR R3 file. `SSCTR_V1STR_N4_RECHECK_R3.md` and `.json` appeared in `reviews/ssctr/` while I worked; I did not read them, and nothing here depends on them.
- **Host context:** my context included the host `CLAUDE.md` and a memory index written in the author's sessions. I took from them only operating rules that the brief also states (never `npm run verify`, no recursive deletion, copy `ajv` into scratch copies). No evidence, count or conclusion here comes from them.
- **Probes:** new probes are `reviews/qre/probes/r3-*.mjs` (harnesses in `probes/scratch-only/r3-*.mjs`), outputs in `probes/outputs/r3-*`. The R1 and R2 probes were rerun unchanged.

## Verdict: READY_WITH_CONDITIONS

The fix closes QRE-STR-B-01 on every path I could construct, and it does only what it declares. In a plan in force the plane rule now only keeps:

- **Asking slots:** a slot asks only where the plan was built with it asking. A plan built without an asking slot never gains one.
- **Same-state comparison:** every review was compared with the same plan state reviewed without the plane rule. 7,140 in-force sequences and 36,006 reviews were measured this way, plus 714 late changes. Every difference was an anchored slot keeping its own configuration. No slot was given anything else, no MAIN row took a configuration held in another role, and no loaded MAIN row left its goal range.
- **New plans:** byte-identical to the previous bytes (2,412 first plans and 54 restarts, same digest).
- **N1, N2 and N3:** they behave exactly as in R2.

I found no new blocker. The conditions are the integration conditions carried from R1 and R2, which this fix does not touch (listed below). They are why the verdict is not plain READY. They do not stop synthetic use, enabling records or a freeze.

**From the quality side:**

| Boundary | Enabling record over these bytes (values sha `06d4731d…`) |
|---|---|
| `V1X-STRENGTH-HOLD-DOSE` (N1) | **May be issued.** No quality blocker; the conditions below carry. |
| `V1X-STRENGTH-UPPER-LOADING` (N2) | **May be issued.** No quality blocker. |
| `V1X-STRENGTH-PLANE` (N4) | **May be issued.** QRE-STR-B-01 is closed; no quality blocker. Two open questions belong to the SSCTR's sporting ruling, not to quality: criterion 5 (SSCTR-STR-B-02, which the author left to the SSCTR as D-19) and the declared cost (QRE-STR-C-02). |
| `V1X-STRENGTH-EXPOSURE` (N3) | **May be issued.** Unchanged; the G03 data-semantics review still comes before any screen. |

**Freeze:** a freeze may be written over a commit that adds only the review records and the enabling records to `5f7f6f6`. I rehearsed exactly that in a scratch clone with TEST-ONLY records:

- `--write 1` succeeded.
- `--check 1` passed after the record was committed.
- Six kinds of drift were each detected.

The verifier itself refuses to freeze unless independent records enable all four boundaries over `06d4731d…`. The order must be write, then commit the record, then check (the header now says so; QRE-STR-B-02).

## Earlier QRE findings: status

| id | R2 severity | status on 5f7f6f6 | evidence |
|---|---|---|---|
| QRE-STR-B-01 | BLOCKING | **CLOSED** | `r2-b` rerun unchanged: role switch by the rule **0 of 308** (was 16); new exercise 0; NONE plans in force acted on 0 (was 76). `r2-c` rerun: in the 4 traced cases no exercise becomes MAIN and every slot is the slot of the plan without the plane rule (`r3-rerun-r2-c.txt`). Widened: `r3-a` and `r3-f`, see "What I measured". The four new own tests fail on the `76b8448` code for the right reasons: a NONE plan gains 4 asking rows at the change; a 4→2 change asks slots the plan was not built with; a 2→4 change in the taper asks; and `buildTemplates` with `{}` anchors asks `FULL_B:1`/`FULL_B:2`. They pass here (`r3-red-76b8448.tap`). |
| QRE-STR-B-02 | OBSERVATION | **CLOSED (documented)** | The verifier header now gives the order write, commit, check. Rehearsal: `--check 1` before the commit exits 1 with `(untracked) CoachingCore/v1/RUNTIME_FREEZE_V1STR_1.json`, and passes after it (`r3-freeze-rehearsal.json`). The behaviour is unchanged; documenting it was one of the two remedies R2 named. |
| QRE-STR-B-03 | OBSERVATION (D-12 path) | **OPEN, unchanged, as declared** | `r2-a` A6 still throws (`Cannot read properties of undefined (reading 'map')`). The R1 probe `qre-a` still stops on it after its off-identity part, exactly as in R2. Development path only; the fix does not touch it. |
| QRE-STR-B-04 | OBSERVATION | **CLOSED** | `r2-d` rerun: 35 NONE sequences, **0** differ from the plan without the plane rule, even in annotations (was 35 annotation-only). In `r3-a`, the 1,680 sequences of plans that open with movement practice are whole-plan identical to the plan without the plane rule; in `r3-f` the same holds for 168 changes at week 6, after the first block boundary. Mutant R3-06 (consult the class in force) is now fully equivalent. |

The R1 findings that R2 left open stay as R2 recorded them: QRE-STR-A-04 (routing through `v1-index.mjs`, integration; `qre-e mixed` still brings `front-plank` back through the frozen entry point) and QRE-STR-A-05 (partial; continuation path, integration).

## New findings

| id | severity | boundary | statement | reproduced in |
|---|---|---|---|---|
| QRE-STR-C-01 | OBSERVATION | PLANE | **A restart's new plan can make a former accessory the vertical MAIN; no accessory dose reaches the row.** After a pause, `restartProgram` builds a new plan, so the plane rule asks as in any new plan. `heldAs` sees only the earlier sessions of the new week, as D-14 declares.<br>**Where:** 46 of 780 restarts, all from 4 strength days to 2, with a 1-week or 6-week pause. The asking MAIN slot takes a configuration the plan before held only as an ACCESSORY (lat-pulldown, db-overhead-press, barbell-overhead-press, pike-push-up). The same restart without the plane rule takes the horizontal default in that slot.<br>**Dose:** the MAIN row is re-established at the MAIN dose, not carried over from the accessory. First rows are 2×5 or 1×5 to establish under STRENGTH, 2×8 or 2×10 under HYPERTROPHY, and so on. Through nine weeks, 0 of 46 loaded MAIN rows leave the goal range, and the set and repetition trails mirror the slot without the rule. So this is not the B-01 harm.<br>**Not changed by the fix:** new-plan output is byte-identical on `76b8448` and `5f7f6f6`.<br>**Routing:** criterion 2 is stated for plans in force. Whether a restart may promote a former accessory into the vertical MAIN slot is a sporting reading for the SSCTR. | `r3-b-restart-roles.mjs` (`r3-b-merged.json`), `r3-h-restart-trail.mjs` (`r3-h.json`) |
| QRE-STR-C-02 | OBSERVATION | PLANE | **The declared cost of D-18, measured: after a change of days that changes the templates, the plan stops alternating, permanently and silently.**<br>**Measured:** with the predecessor's `r2-b`, **88 of 308** sequences lose a vertical lift the plan held as MAIN (was 2). By change: 2→4: 9, 4→2: 28, 3→4: 14, 4→3: 14, 2→5: 9, 5→2: 14; none in 2↔3. After such a change no slot asks again, also after a return to the original days (2→4→2 in `r3-a`), because the anchors are gone.<br>**What it is:** deterministic, pinned by the new tests, equal to the engine without the rule, and with no dose consequence. No athlete-facing text claims coverage of both planes, and there is also no disclosure that the alternation ended.<br>**Quality view:** I see no quality reason against the cost. Whether it is acceptable for the sport is the SSCTR's ruling; whether to tell the athlete is an integration and product matter. | `r3-rerun-r2-b.json` (B2 `verticalLost`); `r3-a` (`asksAfter`, the back-and-forth sequences) |

No finding is BLOCKING or CONDITION.

## What I measured

**Joint suite (worktree):**
- 1,603 tests: 1,601 pass, 2 fail, 0 skipped, 0 cancelled.
- The two failures are, by name, `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here` and `I10, V6: every file the two earlier freezes bind is byte-identical here except the one amended file; its base is the recorded bytes and its diff is the reader alone`.
- Since `2dfa216`, the only test files changed under `CoachingCore/test` are the five `v1str-*` files. No historical test or expectation was edited.

**Own tests:** 67 of 67 across 5 files, 0 skipped. The freeze test ran.
- The fix removed one own test and added four (41 → 44 in `v1str-extension`). The other four own files and the helpers are byte-identical to `76b8448`.
- **The removed test** ("SQ-4 c5 (SSCTR-STR-A-08)"), evaluated assertion by assertion on these bytes (`r3-d.txt`):
  - Only its two D-15 assertions fail, 4 of 10 each: "the verticals stay in the plan" and "they stay MAIN". This is the rejected reading.
  - Its protective assertions still hold: no upper-body MAIN row is new to the plan (20 of 20), one day to two brings in no vertical lift (3 of 3), and every status is MODIFY (5 of 5).
  - So it pinned only the rejected reading.

**In force, same-state counterfactual (`r3-a`, 12 shards, `r3-a-merged.json`):** each review of a plan built under all the rules was compared with the same plan state and the same review, with the plane boundary taken out of the binding (hash recomputed) and run under HOLD+UPPER.
- **Space:** 204 intake profiles: 4 goals × {INTERMEDIATE, EXPERIENCED with named barbell lifts, NOVICE with a named exercise} × 12 equipment profiles; plans that open with movement practice; and the hybrid race plan.
- **46 sequence kinds:**
  - every change of days among 1 to 5;
  - the same number of days on other weekdays;
  - back-and-forth changes, and three-step changes;
  - equipment loss and regain, alone and around changes of days;
  - SKILL_MISMATCH and preference substitutions of the anchored configuration, followed by changes of days;
  - long runs through the first block-boundary rotations to week 10.
- **Totals:** 7,140 sequences, 36,006 reviews, 20,259 with a proposal.
- **Results:**
  - An asking row that is not a slot the plan was built with, or not on its built configuration: **0**.
  - A slot that differs from the counterfactual and is not an anchor keeping its own: **0**. Cascades: 0.
  - An asking row whose anchor does not fit and that differs from the counterfactual: **0** (751 such reviews).
  - Weeks that differ while the selection is the same: **0**.
  - A MAIN row on a configuration held before only in another role, absent from the counterfactual: **0**.
  - A loaded MAIN row out of range, absent from the counterfactual: **0**.
  - Anchors kept where the counterfactual differs: 2,618 reviews.
- **Status differences: 31.** All 31 are the same thing: KEEP with the rule and MODIFY in the counterfactual, at an equipment change to BANDS or back that changes nothing for the anchored slots. The rule keeps the plan as built, which is the declared behaviour.
- **Twin built without the plane rule from scratch (the R2 measure),** 5,424 sequences: role switch by the rule 0, exercise new by the rule 0, loaded MAIN out of range by the rule 0. Whole-plan identity for the 1,680 sequences of plans that open with movement practice: 0 differ.

**Late changes (`r3-f`):** changes of days at week 6, after the first block boundary, on six routes (3→2, 4→2, 5→2, 2→3, 2→4, 4→3, 3→4): 714 sequences and 2,142 counterfactual reviews, every check 0. This includes route (b) of SSCTR-STR-B-01: beginners after the novice cap lifts.

**Anchors and event weeks (`r3-e`):**
- Equipment loss (to none, bands or dumbbells) then regain: 216 of 216 plans keep their anchors through the loss and are back on their own configuration after the regain. 0 anchors lost.
- Changes of days in every direction and equipment changes inside the taper: 28 plans, 84 counterfactual reviews through race week and the week after. 0 not keeping, 0 asking slots not built with, 0 exercises new in the event weeks.

**New plans unchanged (`r3-g`):** 2,412 first plans (4 goals × 5 experience forms × 12 equipment profiles × 1 to 5 days × 30 and 60 minutes, plus hybrids) and 54 restarts. The digest without the values hash is identical on `76b8448` and `5f7f6f6` (`b8afd657b57b8fcc` and `5142e7fb3eac2949`).

**Off, and the frozen entry points:**
- `qre-a`: 576 of 576 first plans and 70 of 70 reviews and restarts identical to `v1-run-forecast-index` with no options. It then stops on B-03, as in R2.
- `qre-e population`: digest `a0c2ab8c6a6ff78e` over 360 answers, the same as on `2dfa216` and `3342a1d`.
- `qre-e hash`: `29f0b2dda0e270fa`, the same as `2dfa216`.

**Preservation differential (`qre-c`), identical to R2:** 648 plans and 103,834 rows. 13,088 rows changed (HOLD 5,340, UPPER 3,334, PLANE 5,195); 0 outside each rule's scope; 0 differences in runs, week shape, phases, blocks or interference; 24 same-exercise dose differences under PLANE (the R2 figure).
- `qre-b` is identical to R2 except its two schedule cases that change templates (2→4, 4→2): there the plan is now the plan without the rule, the declared change.
- `qre-b2`, `qre-c2`, `qre-d` (only a timing differs), `qre-f` and `r2-a` are identical to R2, apart from the values hash.

**Kept anchors through 2→3 (`r3-c`, D-19):**
- In 108 of 108 trails, the kept vertical's MAIN sets × repetitions × reserve equal the same plan without the change of days. The author reported 12 of 12.
- In 62 of them the engine's continuity also puts that vertical into an accessory slot of the new UPPER session. The accessory row carries the MAIN repetitions with fewer sets (STRENGTH: accessory 2×5 at reserve 3 next to MAIN 3×5).
- This path is unchanged by the fix and is part of SSCTR-STR-B-02 / D-19. It is the SSCTR's to judge.

**N1, N2, N3:**
- The only byte they share that changed is the `planInForce` descriptor, one line of the values file, which nothing in `CoachingCore` reads. With it changed the pinned sha (`15a51f55…` → `06d4731d…`).
- Their measured behaviour is identical to R2: `qre-c` per-boundary counts, `qre-d` (N3 oracle and consumers), `qre-f`, `r2-a` A4 (trunk-gap disclosure) and A5.

**Amendment pins, checked against git:**
- The base `7e6e0e0` blob is `8bdd5d5d…`, the bytes `COACHINGCORE-V1-FREEZE-1` recorded.
- The file at `5f7f6f6` is `1997a4e5e0e6090829686ed1a277036436b326543bfc1ac923ed6fc10eba776b`.
- The filtered `-U0` diff is `4b52eb740ea1b6d8eabc6008218f41ff6311e5f28544f94b8738c41f519fbef4`, 44 lines added and 11 removed.
- All three equal the verifier's pins.
- Against `3342a1d` the file changes in exactly 4 hunks: two comment hunks and the two declared expressions at lines 300 and 323.

**Freeze verifier (`r3-freeze-rehearsal.json`):**
- **`--preserved`:** exit 0 on the worktree tree and on a pristine clone. It refuses 12 of 12 trees it must refuse:
  - the `3342a1d` bytes of the amended file, uncommitted and committed;
  - one byte in the changed comment;
  - a trailing newline;
  - mutant R3-01, committed;
  - a changed frozen file;
  - an edited earlier record;
  - an untracked or a committed new `src` file;
  - the r5 policy, and the r5 SSCTR review.
  - It passes a changed values file by design: only `--check` covers its own files.
- **`--write 1`:** refused with no records file, and refused with records bound to the old hash `15a51f55…`. Both refusals give the right reason ("no independent SSCTR record enables …").
- **The rehearsed freeze:** over a scratch commit that adds only two stand-in review files and a TEST-ONLY records file enabling the four boundaries over `06d4731d…`, `--write 1` succeeded.
  - It ran the joint suite with all four boundaries on by default: 1,601 of 1,603, the same two failures by name. The own tests: 67 of 67.
  - It bound 74 added files and recorded the amendment as 44+/11-, authorized.
- **`--check 1`:** fails before the record is committed (B-02, documented) and passes after.
- **Drift:** it is detected for a withdrawn enabling record, one byte of the amended file, a later file under `candidate/`, an untracked `src` file, a changed values file (all four boundaries switch off) and an edited earlier record.
- `--write 1` again is refused: a record is never rewritten.

## Mutation (R3)

There were 20 mutants on the two changed expressions (lines 300 and 323 of `r7b-repertoire.mjs`) and their neighbours (297, 322, 327, 364, 366). They ran against the four behaviour test files (66 tests), leaving `v1str-freeze.test.mjs` out. The green control was 66 of 66; there were no timeouts.

| mutant | change | result |
|---|---|---|
| R3-01 | in-force guard removed (every second slot asks again; the `3342a1d` asking) | killed (4) |
| R3-02 | guard reads "the plan has some anchor" | killed (3) |
| R3-03 | a new plan never asks | killed (16) |
| R3-04 | anchor looked up by template index, not type | killed (5) |
| R3-05 | guard inverted | killed (6) |
| R3-06 | class consulted in a plan in force (R2-04) | **survived, equivalent** |
| R3-07 | plane preferred without limit while the own configuration does not fit | killed (2) |
| R3-08 | `3342a1d` restored: `established` preference while own does not fit | killed (1) |
| R3-09 | in force nothing preferred even while own fits | **survived, equivalent on the measured space** |
| R3-10 | preference whenever anchored, fitting or not | killed (2) |
| R3-11 | anchor never read at selection | killed (5) |
| R3-12 | a new plan never prefers the plane | killed (13) |
| R3-13 | anchor drifts to the current pick (A-01 revert) | killed (2) |
| R3-14 | `heldAs` ignored | killed (2) |
| R3-15 | the first slot asks instead of the second | killed (17) |
| R3-16 | no annotation, so anchors are never recorded | killed (7) |
| R3-17 | in force no plane ordering at all | killed (5) |
| R3-18 | anchor presence tested with `!== undefined` | **survived, equivalent** |
| R3-19 | practiceStart off | killed (4) |
| R3-20 | plane ordering removed entirely | killed (14) |

**Score:** 17 of 20 killed. All three survivors are equivalent, so the score over non-equivalent mutants is 17 of 17. Over all non-trivially-equivalent mutants (R3-09 included) it is 17 of 18.

**Why each survivor is equivalent:**
- **R3-06:** no review changes the experience or the named exercises the class is read from, and a plan that opens with movement practice holds no anchor, so the class never matters in force.
- **R3-18:** anchors are always strings (`slotsInForce` keeps only strings).
- **R3-09:** own configuration is ranked first anyway. The preference then only orders the `alternatives` of an anchored row, and rotation reads those only on ACCESSORY rows. The expression's own-fits branch is unchanged by the fix.
- **Digest check:** over 384 in-force sequences (changes of days, equipment loss and regain, weekly reviews to week 9), the candidate and the three mutants give the same digest of every template row (configuration, role, alternatives) and every prescribed row: `27ced03d266c1613` (`r3-i.txt`).

## Declared readings (engineering)

- **D-18 (in force the rule only keeps):** verified as implemented on everything above. The cost is QRE-STR-C-02.
- **D-19 (SSCTR-STR-B-02 not resolved by code):** the author's counts were not rerun with their probe. I measured the mechanism the author describes for 2→3 (`r3-c`): the anchored vertical is kept as MAIN with an unchanged MAIN dose, and the engine also places it in an UPPER accessory slot. The sporting decision is the SSCTR's.
- **D-13 for new plans, D-14, D-16, D-17:** unchanged (the new-plan digest is identical). D-14 is what QRE-STR-C-01 is about.

## Conditions (carried, owner and trigger)

All are carried from R1 and R2 and unchanged by this fix. The owner is the integration mission under the Chief. The trigger is any non-synthetic use or integration.

1. Plans built before the rules are not migrated (SSCTR-STR-A-03).
2. There is no continuation path for a plan built under other rules: only the clinical answer passes (SSCTR-STR-A-04b, QRE-STR-A-05).
3. The runtime does not read the review date (SSCTR-STR-A-05).
4. Routing: only the new entry point enforces the plan's binding (QRE-STR-A-04).
5. N3 data semantics (G03) must be reviewed before any screen.
6. A focal Security review is needed at integration.

QRE-STR-B-03 stays an open observation on the development path.

## Security

No focal Security review is needed for this change. It narrows behaviour, adds no input surface and no parsing, and changes only a descriptor string in the values file, which is re-pinned. A changed values file fails closed: in the rehearsal all four boundaries switched off. A focal review is still required at integration, as R1 and R2 said.

## Not verified

- The sporting acceptability of any dose, of the declared cost (QRE-STR-C-02), of D-19 and criterion 5, and of QRE-STR-C-01. These are the SSCTR's.
- Integration, real data and any UI.
- Exhaustive event sequences. The search space is the one listed above, which is not every combination. In particular:
  - dated (temporary) equipment windows were covered only by the unchanged `qre-b` B2 rerun;
  - restarts covered 780 combinations: 65 profiles, from 2 or 4 days, to 2, 3 or 4 days, with 1- or 6-week pauses.
- The SSCTR probes the author cites (`r2-scan-changes.mjs`, `r2-scan-inforce-small.mjs`, `scan-roles.mjs`, `probe-time3.mjs`, `probe-binding.mjs`) and the author's `n4-b02-counts.mjs` were not rerun by me. `r3-a` covers the same out-of-range and role-switch questions on the four goals.
- The four historical freeze verifiers on their own snapshots were not rerun by me. `--preserved` checks their records against the pinned bytes.
