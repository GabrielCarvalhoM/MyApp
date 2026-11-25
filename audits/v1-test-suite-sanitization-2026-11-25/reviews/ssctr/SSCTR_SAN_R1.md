# SSCTR review of the V1 test-suite sanitization, R1 (2026-11-25)

**Disposition: ACCEPT_WITH_CONDITIONS** on revision **`7254984`** (base `90452b8`).
- No runtime byte changed, and no prescription, dose, pause, return, calibration, zone or readiness rule changed (Q1).
- Every successor named for the 15 in-scope entries asserts behaviour that a recorded SSCTR decision approved (Q2a). Every sporting effect of the superseding changes that I traced is covered by a recorded SSCTR decision (Q2b).
- The E-1 family's current behaviour is the safer one for the athlete. It was accepted in SSCTR terms under L1/L5 (lifecycle (c) and C-C1, then closure-2). One scope limit, real HealthKit (C-C5), is still open (Q3).
- The mission's own `contract` text misstates or understates the sporting meaning in six places. All six are record corrections. **None blocks and none needs a runtime change** (SSCTR-SAN-01 to -06).

All athletes and data are synthetic. This review is not a training-policy decision.

## 0. Reviewer, authority, method

**Reviewer.** SSCTR (agent SSCTR-1.0.0, constitution SSCTR-CONST-1.0.0, evidence protocol 1.0.0), model claude-opus-5-5, launched by the Chief as a fresh instance.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical matters only. No human review took place, I made no clinical judgment and I delegated nothing.
- I wrote none of this mission's files and none of the superseding changes or their decisions. I did not read any QRE or Security review of this mission.

**Native availability.** This session's system prompt is the body of the project's native adapter `.claude/agents/sports-science-concurrent-training-reviewer.md`, and no Agent tool is available to me, which matches its `disallowedTools: Agent`. So I appear to run as that native agent type. I cannot inspect the dispatch mechanism itself, so I do not claim more than that. I inherited the caller's model, tools and permissions.

**Literature access.** WebSearch and WebFetch exist in this session as deferred tools. I did not load them. Every question here is about traceability: does a test's stated contract, and its successor, match a decision already on record? I make no empirical sporting claim, so:
- I assign no evidence status;
- I set no dose, threshold or progression;
- I wrote no structured JSON record and did not run `validate_records.py`.

**Bytes judged** (git objects at `7254984`). The worktree's `CoachingCore/` equals `7254984` (empty `git diff`).

| File | SHA-256 |
|---|---|
| `CoachingCore/test/HISTORICAL_TESTS.json` | `69e494a28f010437d45bf733d4d9c939048a7047c9532f1c566d7d89eadfb810` |
| `audits/v1-test-suite-sanitization-2026-11-25/RESOLUTION_MATRIX.md` | `16f3d41aeb6220d512615caee5212b0c609c6d33e75360c299b80f1ceadb511a` |
| `audits/v1-test-suite-sanitization-2026-11-25/ROOT_CAUSE_CLASSIFICATION.md` | `6c06e9f1620c971acc26c78d3653adeef0729e11f0206afac99dbd5ae9706923` |
| `audits/v1-test-suite-sanitization-2026-11-25/FAILURE_INVENTORY.md` | `6c1700b4867d2d3624fa47e388e677f4e12646a0a9e013837aba5ff766d2c4e6` |
| `CoachingCore/test/v1san-boundary-safety.test.mjs` | `b5cdea1b9b2592394e496d62dc139d21f288e441efb37141eab9c5e811efcea7` |
| `CoachingCore/test/v1core-o1-successors.test.mjs` | `7aacc76933345bedab3eef4676360a56df82666d5f7e1fae3ea365df0b5fc30d` |
| `CoachingCore/test/v1core-sc-successors.test.mjs` | `113ba47768860ccba61055d3c9387129b53ee8c29fac99762c7ac5a7dd62d4c6` (the same bytes SSCTR_SC_R1 judged) |
| `CoachingCore/test/v1core-cf011r2-restart-evidence.test.mjs` | `6844a9c2e5e3591750ec2414c5e682e994760d07d21e2541e27ff09ed18e035a` |

**Commands** (Node v24.19.0, all read-only; I edited no file except this one):
- **Successors at HEAD.** The successors and covering tests named for the in-scope entries all pass:
  - `v1core-o1-successors` "successor of": 4/4;
  - `v1core-sc-successors` "successor of": 4/4;
  - `v1core-cf011r2-restart-evidence` A3-A4, A5, A e2e, D1, D2, B1-B2: 6/6;
  - `v1core-o1-conflict-evidence` SSCTR-NCC-01 (scenario 21) and (S21b): 2/2.
- **Boundary.** `v1san-boundary-safety.test.mjs`: 13/13.
- **Historical entries.** A sample still fails on the current tree, as phase 2 requires:
  - H03 and H04: 0/2 pass;
  - H06, H07 and H08: 0/3 pass;
  - H16: 0/1 pass.
- **The O-1 lineage dump.** I re-ran `audits/v1-core-o1-2026-11-19/evidence/lineage-dump.mjs` with `DOSE=1` on HEAD into my scratchpad. It gives 62 rows, SHA-256 `317b7d9a6c5050cfcf91ec1ee21735c47fd36aa8e4981d448c763079920dfe7d`. That is **byte-identical** to `lineage-candidate.jsonl`, the dump SSCTR_O1_R1 authorized and SSCTR_SC_R1/R2 reconfirmed. It covers every matrix row's word, completion, conflict flag, execution extent, the doses of weeks w+1 to w+3, and run-history facts. **No later line has moved those sporting readings.**
- **Scenario-21 probe.** In my scratchpad I ran the frozen closure-2 matrix with the O-1 successor's substitutions, changing only scenario 21's history expectation:
  - `'whole'`: 2/2 pass;
  - `'first'` and `null`: 0/2 pass.

  So the expectation is exercised. As the dump shows, at HEAD it is the execution's own extent with pace withheld, `completed:false` and `conflicted:true`: not credit and not a run-history fact.

**Not reviewed.** `REGRESSION_REPORT.md` and three `evidence/*.txt` files exist in the worktree but are **untracked**, so they are not part of `7254984`. `FINAL_REPORT.md`, which the policy cites, does not exist. I do not rely on any of them.

## 1. Q1: no runtime or training-rule change: CONFIRMED

`git diff --name-status 90452b8 7254984` lists 28 files:
- `CoachingCore/package.json`: `scripts` only;
- three new `CoachingCore/scripts/suite-*.mjs`;
- `CoachingCore/test/HISTORICAL_TESTS.json` and two new `v1san-*.test.mjs`;
- the audit's documents and evidence.

Nothing under `CoachingCore/src`, `CoachingCore/v1`, `CoachingCore/fixtures`, `r2`–`r7`, the authority, values or extension files, or any data file is touched. No historical test file is edited, and each is pinned by `fileSha256`. **No prescription, dose, pause, return, calibration, zone or readiness rule changed in this mission.**

There is one sporting-adjacent governance effect, and I accept it. `npm test` now runs the active suite, which excludes the 53 listed tests from phase 1, and phase 2 requires each of them to fail. Policy §4.3 treats a pinned defect that starts passing as a regression first. That is the right direction for the B entries: a returning E-1 or a returning unbounded restart exposure would turn phase 2 red.

## 2. Q2: per-entry table

Decision ids refer to:
- `SSCTR_R2_R1/R2`: `audits/v1-core-cf011-r2-2026-11-18/reviews/ssctr/`, with DECISION.md;
- `SSCTR_NCC_R1`: `audits/v1-core-ncc-2026-11-19/reviews/ssctr/`;
- `SSCTR_O1_R1`: `audits/v1-core-o1-2026-11-19/reviews/ssctr/`;
- `SSCTR_SC_R1/R2`: `audits/v1-core-sc-2026-11-20/reviews/ssctr/`;
- `SSCTR_CORE_R1/R2`: `audits/v1-core-safety-lifecycle-2026-11-18/reviews/ssctr/`;
- `SSCTR_C2_R1`: `audits/v1-core-safety-closure-2-2026-11-18/reviews/ssctr/`.

In the table:
- **(a)** asks whether the successor asserts the approved behaviour;
- **(b)** asks whether any sporting effect lacks a decision;
- **(c)** asks whether the manifest's `contract` text is accurate.

| Entry | Decision on record | (a) | (b) uncovered effect | (c) contract text | Note |
|---|---|---|---|---|---|
| H03 | C-F01-1 r2 (i)/(ii): DECISION §2 and §4; SSCTR_R2_R1 items 1–3; C-R2-1 discharged in SSCTR_R2_R2 | AGREE | none | **UNDERSTATED** (SAN-02a) | The 0/0 bound and its RESTART mapping are what item 1 accepted. "Lower, never higher" and "the conservative one" hold for the **bound** in this test's shapes. The same change also shortens the pause when a disputed session is the last one, which can lift the C-Q08-2 floor: RESTART 45 becomes EASY_CURRENT 80/80/80/104. That was authorized as correct (C-R2-1). The class mapping is also not monotonic in bounded minutes (SSCTR_R2_R1 O-1) |
| H04 | C-F01-1 r2 (ii), SB-1: DECISION §2–§3; SSCTR_R2_R1 item 4 | AGREE | none | **IMPRECISE** (SAN-06) | D1 (SB-1 asked) and D2 (kept) are the accepted readings. "It is an execution" should be "a recognized occurrence (execution of disputed amount), whose minutes are never counted". SB-1 asks because a voice in force says the athlete trained after the declaration (`claimsDone`), not because of any dose credit. B is a fair category: the ADDENDUM labelled the pinned behaviour "NOT a decided reading" |
| H06 | Decision A (SSCTR_O1_R1 §2 A), implemented as C-O1-2, closed in SSCTR_SC_R1 §1 | AGREE | none | **MISSTATED** queue status (SAN-01); understated effect (SAN-02b) | A12: `[ZERO, DAY-3, 3]`. The pause is read from the disputed session and the bound is unchanged, as in the SC ledger |
| H07 | Decision A / C-O1-2: SSCTR_SC_R1 §1 and §5 | AGREE | none | SAN-01, SAN-02b | The corrected text (13 → 3 days, 50/20 minutes never counted, "not done" still no execution) matches the SC ledger exactly |
| H08 | Decision A / C-O1-2; C-SC-2 (integrity flags excluded on the attribution ground) | AGREE | none | SAN-01. "Forged or partial flag" is correct | The successor also pins that integrity-flagged rows show no occurrence. SSCTR_SC_R1 accepted that as interim (it errs long, O-SC-S4 open). Recording it would be useful, but is not required |
| H13 | O-1 P1/P5: SSCTR_O1_R1 §4 (NCC F1 row, "no dose change") | AGREE | none | accurate | EXACT_REPLAY; nothing admitted. Ledger `sporting: none`, `safety: kept for SB-1` |
| H14 | O-1 P1: SSCTR_O1_R1 §4 (F3 row, "no dose change") | AGREE | none | accurate | Still refused and never merged; kept as a voice |
| H15 | O-1 P1/P4 row 19: SSCTR_O1_R1 §4 | AGREE | none | **UNDERSTATED** (SAN-05) | "Row 19 now read as rows 08/10" is right, but omits the dose consequences in the O-1 ledger's `sporting` field |
| H16 | O-1 P2 interim replaced by decision A / C-O1-2: SSCTR_SC_R1 §1 and §5 | AGREE | none | SAN-01, SAN-02b | "A kept voice is never dose" plus occurrence for the pause, as decided |
| H20 | O-1 P4 speaker rule: SSCTR_O1_R1 §4 (RWS-B-01 row: CONFLICTED in all 6 cases) | AGREE | none | accurate | FREEZE-5 credited a 100-min run-history fact in 3 of 6 cases. The successor pins `app-fix` conflicted in every order, and the screen is unchanged |
| H21 | NCC F1 scenario 21: SSCTR_NCC_R1 item 4, accepted for the synthetic freeze with SSCTR-NCC-01 open; then O-1 (closes SSCTR-NCC-01, row 19): SSCTR_O1_R1 §3 and §4 | AGREE | none | **UNDERSTATED** (SAN-05) | NCC's interim scenario-21 EASY reading credited the disputed device extent (CONFLICTED → COMPLETED). O-1 reversed it: row 21 is CONFLICTED, `completed:false`, run-history 1 → 0, a one-step hold. The text does not say so. The active matrix's `'whole'` for scenario 21 is the execution extent with pace withheld (probe, §0). The CONFLICTED reading is pinned by active `v1core-o1-conflict-evidence` "SSCTR-NCC-01 (scenario 21)" and "(S21b)", which are not named in the manifest |
| H22 | O-1 row 19, LONG: SSCTR_O1_R1 §4 | AGREE | none | UNDERSTATED (SAN-05) | As H15 |
| H40 | Lifecycle cycle 1, element 4 (NOT_RAISED → REQUIRED): SSCTR_CORE_R2 §2, SSCTR_C2_R1 §4; then O-1 dispute in every order: SSCTR_O1_R1 §4 | AGREE | none | **MISSTATED** (SAN-03) | 430c493 did not "keep the dispute in every order". It made a symptom stop on a carried row of a session the plan in force does not name raise the existing warning-sign screen. That is more protective: a request is added and none removed. The dispute-in-every-order move is O-1's (now the earlier assertion at :298). SSCTR_CORE_R2 §2 called the pinned value "a limit of the reader, not a decided exclusion", so B would also be defensible. The category is QRE's call and has no sporting consequence |
| H41 | E-1 (L1 merged reading): SSCTR_CORE_R1 §4 (c), C-C1 closed in SSCTR_C2_R1 §2; then NCC and O-1 as H21 | AGREE | none | UNDERSTATED (SAN-05) | REPORT_NOT_CARRIED was the E-01 compensation that L1 anticipated removing. B is right. The E-1 matrix effects (easy band `[345,575]` for an athlete who said nothing, row 12 history 11 → 6.6, PARTIAL rows) are all accepted in SSCTR_C2_R1 §2, and none raises a dose |
| H42 | As H41, then O-1 row 19 LONG | AGREE | none | UNDERSTATED (SAN-05) | As H41 and H22 |

**Q2(b) in summary.** I looked for sporting effects of 3f0b04f, 07301f3, 1d418d1, ec811c1, 0b8e45a and 430c493 that lack a recorded SSCTR decision, and found none. Every effect I found is listed and authorized in the record:
- the C-R2-1 floor lift;
- the window residual C-R2-2, kept;
- scenario 21 through NCC and then O-1;
- the row 18/19/21 moves and the row-18 LONG sizing source 365 → 360 (O-O1-1);
- the RWS-B-01 move;
- the pause shortening of C-O1-2 and the strength first exposure 19 → 27 min (O-SC-S1);
- the SB-1 ASK additions;
- the SEC-O1-02 credit equalization;
- the E-1 return to the merged reading.

The byte-identical lineage dump (§0) shows these readings are still the authorized ones at HEAD.

## 3. Q3: the E-1 family (H30–H50)

**The current behaviour is the safer one for the athlete.**
- Before E-1, a device re-sync replaced the merged row and erased the athlete's own answers. In H50's pinned form that is `[UNKNOWN, UNKNOWN, 0]`: no recovery, no effort, no adverse count.
- So the protective readers (weekly adverse count, systemic convergence, adverse hold) could not hear an adverse response the athlete had given.
- Now the row in force keeps `ADVERSE`/`HARDER`, `adverseSessions` stays 1, and a symptom stop keeps the warning-sign screen REQUIRED until a screen answered after it. That holds in either order and after a late re-sync. The boundary tests pass 13/13 at HEAD.

**It was accepted in SSCTR terms.**
- SSCTR_CORE_R1 §4, item (c): APPROVE_WITH_CONDITIONS, SUPPORTED_WITH_LIMITS. L5 is met in the two-report form at the Core. The RWS consequence "is the reading L1 decided": a row that carries every report in force reads as the merged row. L1-a is accepted expressly.
- SSCTR_CORE_R2 (c): the as-if reading is confirmed in all ten combinations.
- SSCTR_C2_R1 §2–§3: C-C1 is closed (each restated successor is the as-if reading or more conservative, and none raises a dose). C-C2 is closed. The HARD GATE retitle is accepted.
- The adverse voice on a disputed row was later made protective in every order: C-O1-3, closed in `audits/v1-blocker-closure-2026-11-24/reviews/ssctr/SSCTR_BC_R1.md`.

**"Safer" is not "more conservative on every reader."** E-1 also returns some runs to pace evidence that the E-01 compensation used to withhold. For example, the easy band's slow edge widens to `[345,575]` for an athlete who stated nothing. SSCTR accepted that as legitimate easy evidence under L1, with the next week's sessions byte-identical (SSCTR_C2_R1 §2). It is authorized, and it does not reduce safety.

**The open scope limit.** C-C5, real HealthKit re-sync behaviour, is still carried open:
- SSCTR_CORE_R1 §4 says the hard gate E-1 "for real athletes closes only with the adapter's own result tests";
- SSCTR_C2_R1 §7 carries it;
- SSCTR_F01_R1 carries it, and I found no later closure.

The mission's tests use HealthKit-shaped synthetic inputs through `createIntegration`. Its wording "HARD GATE E-1 — closed" (H32/H50 `safetyPoint`, ROOT_CAUSE §C) must therefore be scoped (SAN-04).

## 4. Q4: clinical scope

**Nothing clinical is decided by this mission or by this review.** The in-scope items touch the clinical boundary at three points, and none of them changes:
- SB-1: the pause-reason question, screened clinical first;
- the run-format warning-sign screen after a symptom stop (H20, H40, the boundary test "the screen is still asked");
- CLINICAL_HUMAN_REQUIRED precedence (DECISION §3; SSCTR_R2_R1 item 4, D8).

Two clinical questions are flagged **CLINICAL_HUMAN_REQUIRED** and left undecided:
- **(i) Screen sufficiency.** Whether the existing warning-sign screen is sufficient after a symptom stop. "The screen is still asked" must not be read as clinical sufficiency or clearance.
- **(ii) A symptom stop answered by a nonclinical reason.** Whether a recorded symptom stop needs more than SB-1's generic question when the athlete states a nonclinical pause reason. This is O-SC-S2, owned by Product/UX with Security. Its clinical part belongs to a qualified human.

Neither is a blocker for this test-only mission.

## 5. Conditions

All six are record corrections to `HISTORICAL_TESTS.json` (`contract`, `reason` or `alsoCoveredBy`) or to RESOLUTION_MATRIX/ROOT_CAUSE. **Owner:** author with Chief. **Binding:** this mission's closing record. **None blocks, and none needs a runtime or test-behaviour change.** Because the manifest's fields are data the runner validates, QRE should confirm that any edit keeps the runner green.

| Id | What | Basis |
|---|---|---|
| **SSCTR-SAN-01** | The H06, H07, H08 and H16 `contract` texts and ROOT_CAUSE RC-5 say "queued HQ-SSCTR-O1-02 for funded-human revalidation". That is not what happened: HQ-SSCTR-O1-02 was proposed only (SSCTR_O1_R1 §7), and so was HQ-SSCTR-SC-01, which fulfils it (SSCTR_SC_R1 §7, SSCTR_SC_R2, SC FINAL_REPORT). The queue `reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json` holds 235 entries at `7254984` and neither id. Restate as "proposed, not appended (queue at 235); HQ-SSCTR-O1-02 → HQ-SSCTR-SC-01". Do not append in this mission. The pre-existing backlog of proposed but unappended SSCTR items is a separate SSCTR-10 matter, owned by the Chief | SSCTR_O1_R1 §7; SSCTR_SC_R1 §7; queue count verified |
| **SSCTR-SAN-02** | Name the authorized consequences that point in the less conservative direction, so that "conservative" is not read as a property of the whole change. (a) H03's `safetyPoint` and RC-3's "lower and never higher" hold for the C-Q08-1 bound only. Add the C-R2-1 floor lift (RESTART 45 → EASY_CURRENT 80 when the disputed session is the last one) and SSCTR_R2_R1 O-1 (class mapping not monotonic). (b) For H06, H07, H08 and H16, add that C-O1-2 shortens the restart pause (35 → 5 days in `cls`). Also add that, where the record holds no strength row, it raises the strength first exposure 19 → 27 min, equal to the undisputed reading (cross-sport pause, O-SC-S1) | SSCTR_R2_R1 §2–§3; SSCTR_R2_R2; SSCTR_SC_R1 §1 and §5; C-SC-1 |
| **SSCTR-SAN-03** | Restate H40's `contract`. Cycle 1 (`430c493`) changed element 4: a symptom stop on a carried row of a session the plan in force does not name now raises the warning-sign screen (NOT_RAISED_BY_THIS_EXTENSION → REQUIRED; the other-athlete element stays NOT_RAISED). The "dispute in every order" is O-1's (RWS-B-01 row) | SSCTR_CORE_R2 §2; SSCTR_C2_R1 §4; SSCTR_O1_R1 §4 |
| **SSCTR-SAN-04** | Scope "HARD GATE E-1 — closed" (H32 and H50 `safetyPoint`, ROOT_CAUSE §C table, RESOLUTION_MATRIX) to "closed for the Core and the integration boundary on synthetic re-sync inputs; for real athletes, open until the real HealthKit adapter's own result tests (C-C5)". The "verified ... by mutation" claim cites REGRESSION_REPORT.md, which is untracked and not in `7254984`. Commit that evidence or drop the claim. Whether the mutation is adequate is QRE's call | SSCTR_CORE_R1 §4 C-C5; SSCTR_C2_R1 §2 and §7 |
| **SSCTR-SAN-05** | For H15, H21, H22, H41 and H42, point the `contract` or `reason` to the ledgers' `sporting` fields, or state them: (1) row 19, both families: completion credit COMPLETED → PARTIAL, LONG w+2 QUALITY:34 → EASY:65, EASY w+3 70 → 65 (O-1); (2) scenario 21: NCC's interim EASY credit of the disputed device extent, reversed by O-1 to CONFLICTED with no completion credit and run-history 1 → 0; (3) the E-1 matrix effects accepted in SSCTR_C2_R1 §2. Add the active `v1core-o1-conflict-evidence` "SSCTR-NCC-01 (scenario 21)" and "(S21b)" tests to `alsoCoveredBy`, because the matrix successor does not read scenario 21's conflict. Its `'whole'` value there is the execution extent with pace withheld, not credit | O-1 SUCCESSOR_LEDGER `sporting`; SSCTR_O1_R1 §3–§4; SSCTR_NCC_R1 item 4; SSCTR_C2_R1 §2 |
| **SSCTR-SAN-06** | In H04's `contract` (and its `supersededBy` "a disputed amount is an execution"), say "a recognized occurrence (execution of disputed amount): its day sets the pause, its minutes never count". Also say that SB-1 is asked because a voice in force says the athlete trained after the declaration (`claimsDone`), not because of any dose credit | DECISION §1–§2; SSCTR_R2_R1 items 2 and 4 |

## 6. Ten AE questions

Not applicable: this review decides no adaptive training action. Each superseding decision answered its own questions in its record.

## 7. Record fields

- **Evidence status:** none assigned, because no empirical claim is made. **Confidence:** HIGH that the traceability findings are right. Each rests on a read record, a test I ran, or a byte comparison. This is not a confidence in any training rule.
- **Gate:** NOT_CLOSED_BY_THIS_RECORD; whole-gate closure false. **Publication:** NOT_PUBLISHED.
- **Validation:** human validation false, empirical product validation false, clinical clearance false.
- **Human queue:** no new prescriptive approval is made, so I propose no queue item. The existing proposals (HQ-SSCTR-O1-01..03, HQ-SSCTR-SC-01..03, HQ-CORE-SSCTR-C, HQ-CORE-C2-SSCTR-A, HQ-SSCTR-BC-01) keep their recorded status.
- **Re-review triggers:**
  - any change to a manifest entry's `successor`, or removal of an entry;
  - a historical entry that starts passing (policy §4.3);
  - any runtime amendment (the integrity test's gate);
  - closure of C-C5;
  - a change to the queue status of the items in SAN-01.
- **Expiry:** at this mission's closing record, or at the first trigger.
- **Supersedes:** nothing. **Dependent items invalidated:** none.
