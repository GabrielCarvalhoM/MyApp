# SSCTR review of the V1 blocker closure candidate, R1 (2026-11-24)

**Verdict on `6e85222c60cd1f3ee51a074a015b1d0f71a3431a` (base `ee256ae8`): ACCEPT_WITH_CONDITIONS. No SSCTR item blocks physical validation or the RC freeze.**
- **C-O1-3 is closed.** The adverse count is the same in every order of arrival and after any correction that leaves the dispute open. A flagged row still earns nothing.
- **QRE-INT-02 is closed on its SSCTR constraint.** A re-sent run is admitted once and carried to the pace readers, and a stop on an ASKed form is still screened.
- **SEC-SC-02, SEC-SC-03, SEC-INT-07, G07 and C-O1-5:** accepted as designed, with the conditions below.
- **One dose change:** C-O1-3, in the protective direction only (§3).
- **Five new findings,** all Low or informational. None blocks; two bind before real athletes, through existing native checks.

## 0. Reviewer, bytes, method

**Reviewer**
- SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5, launched as a fresh instance by the Chief.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only. No human review took place, I made no clinical judgment, I delegated nothing, and I claim no native dispatch.
- I wrote none of the candidate, its tests or its evidence. I did not read the Security or QRE reviews of this line.

**Literature**
- WebSearch and WebFetch exist as deferred tools; I did not load them.
- Every ruling here is about which evidence is admitted and to which reader. Each one is checked against rules already decided: decision A of SSCTR_O1_R1, SB-1, the systemic-convergence hold, my SSCTR_INT_R2 item 4 constraint and the lineage rule.
- I make no new empirical sporting claim and set no number. I wrote no JSON decision record and did not run the validator.

**Bytes.** I ran `git archive 6e85222 CoachingCore audits` and `git archive ee256ae …` into new directories under my scratchpad (`…/scratchpad/ssctr-bc-r1-1795526362/{cand,base}`), with `node_modules` copied in.
- I judged only the bytes of the commit.
- The worktree also holds modified and untracked files from other work: `audits/v1-aif-p0-jsc…`, `NATIVE_OBLIGATIONS.md` and `suite-*.txt`. I neither judged nor touched them.

| File @6e85222 | SHA-256 prefix | @ee256ae |
|---|---|---|
| `src/r6-adaptation.mjs` | `b8da4d12ba8f2d15` | `c82c5e113f2cdf5a` |
| `src/v1-f08.mjs` | `689c227ca9f8de43` | `7ec9b6d53be49dad` |
| `src/r6-provenance.mjs` | `8705f1c92f0b5c03` | `cd0ede9d9d178691` |
| `src/v1-run-format-index.mjs` | `a21048f67ac25185` | `60ad593097e82d37` |
| `src/boundary/integration.mjs` | `49c2842e712f8d82` | `c209775029a81dc9` |
| `src/boundary/admission.mjs` | `fe78490f9c481af7` | — |
| `src/boundary/custody.mjs` | `f58b52399eca4d77` | — |
| `test/v1bc-blocker-closure.test.mjs` | `bf616c1148bf1484` | (new) |
| `V1_BLOCKER_INVENTORY.md` | `d64dc569147a28e5` | (new) |
| `evidence/reproductions-before-after.txt` | `fc9cb0d2db76d743` | (new) |
| `evidence/bc-diff/SUMMARY.txt` | `4508387a0321ae93` | (new) |
| `evidence/bench-ee256ae-vs-candidate.txt` | `fba2d0c7936facb5` | (new) |

**Commands** (Node v24.19.0, from `CoachingCore/` of each extract)
- I ran `node --test` on these ten files: `v1bc-blocker-closure`, `v1core-o1-conflict-evidence`, `v1core-o1-successors`, `v1core-sc-safety-continuity`, `v1core-sc-successors`, `v1int-cycle1`, `-journeys`, `-limits`, `-custody` and `-authorship`.
- Result: **117/120**. All 14 `v1bc` tests pass. The three failures:
  - O-1 "restart pause reads no occurrence from a head-on dispute": fails on ee256ae too. This is the reading C-O1-2 replaced.
  - The tm-5 "QRE-INT-02 (open, routed) pinned" test and the A04L limits test fail by design. Their successors are in `v1bc`.
  - The closing record should name all three (for QRE).
- `v1bc-rc-record` needs a git checkout, so it cannot run in an archive extract (`fatal: not a git repository`). I did not judge it.
- I did not run `npm run verify`, `verify-r*` or the full suite.

**Probes.** All are read-only and synthetic, and live in `audits/v1-blocker-closure-2026-11-24/reviews/ssctr/probes/`. Each takes a CoachingCore root and ran on both extracts.

| Probe (sha256 prefix) | What it reads |
|---|---|
| `b1-retract.mjs` (`4c255d8a`) | C-O1-3 in both orders under seven follow-ups: none, two corrections that keep the dispute and stay adverse, two that keep it and retract, agreement with retraction, agreement keeping ADVERSE |
| `b2-systemic-dose.mjs` (`6795bfa0`), `b3-systemic-dose-week.mjs` (`73ac8e11`) | Dose consequence of C-O1-3: gates and the next three weeks' doses (week 3, BUILD) |
| `b4-restart-stops.mjs` (`316b4da0`), `b9-restart-dose.mjs` (`385ccc0e`) | SEC-SC-02/03 neighbourhood: f08 readings, and the restart through the boundary |
| `b5-resend-pace.mjs` (`2d443e40`) | Successor of my R2 r2c/r2d: ASK → screen → re-send, then replays, against the screen-first control |
| `b6-ask-stop-vs-device.mjs` (`b19d9205`) | An ASKed athlete form against a recorded device run |
| `b7-refused-resend.mjs` (`32115e4f`) | A transient engine refusal (FUTURE_OBSERVATION), then the re-send |
| `b8-erasure.mjs` (`43fc3dcd`) | G07: erasure after a symptom stop and a NOT_FEELING_100 with a warning sign |

The author's `adv2` and `p3b` before/after results agree with what I read in the code and the focal tests. I did not re-run them.

## 1. Item rulings

### 1. C-O1-3, the adverse reading of a disputed row: **ACCEPTED, closed.** The superset reading is adopted as a bounded amendment of decision A (SSCTR-BC-04)

**What changed.** `kindOf` (`r6-adaptation.mjs` l.226–227) reads a flagged row as ADVERSE when any voice it keeps says recovery ADVERSE or next day IMPAIRED: the row's own response or a part in `provenance.parts`. This check runs before the partial and confounded branches.

**Closing criterion met**
- adv2: before 0, 0, 1, 0; after 1, 1, 1, 1.
- b1: all 7 follow-ups give the same row in both orders (14 cells). For example, a correction that keeps the dispute and states only IMPAIRED gives 1 in both orders.
- The athlete's own retraction inside an open dispute gives 0 in both orders. The correction **replaces** the athlete's voice in `parts`, so the athlete's word on their own statements is honoured (the P4 speaker rule).
- The row stays CONFLICTED in every case: no credit, no progression, no calibration.
- The reading survives a re-read and a file-store restore (focal test 2).

**Which readers it reaches.** I traced every `kindOf` consumer.
- Only readers that take the bound ledger with flagged rows hear it:
  - `weekEvidence`: `adverseSessions` and `systemicConvergence`;
  - the evidence reducer at an interruption point (l.2244, l.2567);
  - the re-entry week's `!h.systemic` test.
- These readers do not hear it, because each takes `usable`/`!o.conflicted` rows only:
  - `recent()` and so repeated-adverse REGRESS;
  - `learnedInterference`;
  - the return ladder `executionOf`;
  - `adverseIn`, `raced` and running history.
- Graduation already disqualified a CONFLICTED row.
- So the change can only **hold**: never REGRESS, never REDUCE, never a learned rearrangement.

**The superset (author's choice 1).** Decision A heard an adverse voice "that no kept voice contradicts". The candidate also hears one that another voice contradicts.
- I adopt it, for three reasons:
  1. Through the V1 boundary that case does not arise. The device channel carries no `response` (`OBSERVATION_KEYS.DEVICE`). The athlete has one chain per session, and a correction replaces their earlier voice (b1).
  2. Its only effect is a hold.
  3. It keeps the reading independent of order.
- The residual I flagged in SC R2 needs nothing more for V1. Past `VOICE_LIMIT`, which ADVERSE voices are kept can depend on order. Through the boundary a session holds at most 5 voices (1 athlete chain + 4 device activities, the O-SC-1 test), well below 16, so this is engine-only.

### 2. SEC-SC-02 and SEC-SC-03: stops and "done" voices around the readiness declaration and the restart day. **ACCEPTED, no dose change**

**SEC-SC-02**
- Each voice is now dated by its own `observedAt` (`partOf`, `saidAfter`). G2 and G4 now ASK; D3, D4 and "a later declaration answers it" stay DECLARED.
- A part stored before this line has no instant of its own and is read with its row's, as before.
- This is the SB-1 rule applied voice by voice. It is not a new rule.

**SEC-SC-03**
- A stop on the restart day, or any stop after the latest declaration when the last execution is today, now gives a 0-week pause with no declaration standing in. The existing cause question then asks (b4: "stop today" and "done today, stop later today" go from NO_PAUSE to ASK).
- The answer routes as before:
  - a clinical cause gives CLINICAL_HUMAN_REQUIRED;
  - a nonclinical cause gives the same plan, since a 0-week pause reduces nothing (`r6-intake` l.217–223).
- No new clinical rule is created.

**Reach is small.** `days` is the maximum over the sports, so a hybrid plan reaches NO_PAUSE only when every sport was executed on the restart day.
- In b9 (hybrid, through the boundary), both trees ASK, PROPOSE and route CLINICAL identically, with identical program hashes: `39cb0bff…` after a stop, `25acfe16…` after a done session.
- After a restart that follows a stop, the warning-sign screen still reads `RUN_STOPPED_FOR_A_SYMPTOM`.

**A side effect, accepted.** With a declaration, a stop between the declaration and the restart day now asks even when the athlete also trained today (b4, "stop yesterday/3 days ago, done today": NO_PAUSE → ASK). That is SB-1's own reading: the stop is newer than the declaration.

**An asymmetry that remains, pre-existing (SSCTR-BC-03).** With **no** declaration, the same record still reads NO_PAUSE on both trees.

### 3. QRE-INT-02: a report the decision neither recorded nor refused leaves only its stop. **ACCEPTED, closed on my R2 constraint**

My R2 constraint had two halves: pace lineage reads only recorded reports, and the screen keeps reading stated stops.

**Re-sent run (b5, device route)**
- Screen first: 4 report facts, `REPORT_NOT_CARRIED` 0.
- ASK then re-send: 4 facts (ee256ae: 8) and `REPORT_NOT_CARRIED` 0 (ee256ae: 8).
- Two more replays are duplicates: 4 facts, nothing more.
- Rows credited (4), status, program, calibration, forecast and pace insights are identical to the control.
- **Admitted once, carried, no double credit.**

**Athlete route.** The focal test shows recorded once and `withheld: null`. In b6 (c), an ASKed copy of the device's own run used to withhold that run's pace for ever on ee256ae. It is now carried.

**Stop on an ASKed form**
- Only a `standing: false` stop fact is kept, and the warning-sign screen asks at the next review (focal test).
- A screen answered before the stop does not clear it.

**Refused, merged or disputed reports stay in force for the lineage, as before.** I read "recorded" in my R2 constraint as "decided by the engine".
- A refused conflicting report must keep withholding the disputed run's pace. That is the existing lineage rule, and it is protective.
- The transient-refusal edge is SSCTR-BC-02.

**What is now admitted that was withheld before (b6 a, b).**
- Setup: an athlete form stating a symptom stop, or a different amount, against an already **recorded** device run is ASKed and not recorded.
- Result: the device run's pace is carried until the form is re-sent. Then the row is flagged and withheld.
- The stop is screened throughout. Native deliveries wait for the screen (SSCTR-RWS-B-02), and the athlete's form must come back with that answer (SSCTR-INT-02, a §9 obligation).
- So the window should have no athlete-facing effect. It relies on that native obligation: SSCTR-BC-01.

### 4. SEC-INT-07: a safety signal past the limits. **ACCEPTED**

- Past `correctionsPerReport` or `reportsPerDayPerChannel`, a report stating a stop, ADVERSE or IMPAIRED is admitted, at most 3 more. A plain report past the limit, and a fourth excess, are refused.
- Past the limit only signal-bearing reports enter. So the chain head, and the day's last admitted report, always state a signal. A refused fourth can neither retract it nor remove the screen.
- A signal-bearing correction past the limit can still change the amount. But it states ADVERSE or a stop, which holds the dose.
- The device channel states no signal, so its limit is unchanged.

### 5. G07: stop facts kept after `eraseHealthFacts`, the stored screen erased. **Sporting part SUPPORTED; the Founder's confirmation of the retention remains**

- Keeping the stop facts (no free text) is the minimum that stops an erasure from silently ending the warning-sign question. Without it, an erasure would be a way to release a safety screen.
- Erasing the stored screen fails closed: deliveries wait for a new one (`SCREEN_REQUIRED`, b8; ee256ae delivered with the erased screen).
- b8 also shows that erasing a NOT_FEELING_100 with a warning sign **does not release the clinical hold**: the next screen gives CLINICAL_HUMAN_REQUIRED on both trees.
- The legal and privacy scope of the retention is the Founder's and Security's, not mine.

### 6. C-O1-5: contesting device data. **ACCEPTED for V1 with no engine change; condition C-BC-3**

- The athlete's "not done" or different amount keeps the session CONFLICTED.
- Cost: no credit, one progression step at most (`dose6`, SSCTR_O1_R1 §2 B).
- Gain: the contested workout is not used for pace (b6: flagged → withheld).
- That errs low and protects pace, so the missing resolving act is sporting-acceptable for V1. This discharges the sporting half of C-O1-5.
- Whether V1 needs an explicit resolving act is still Product/UX's call, with Security.
- Whether a HealthKit deletion should withdraw the device voice is a post-V1 SSCTR question, as the inventory says.

### Other items in this line (no dose effect)

- **SEC-INT-06 (`BEFORE_RECORD_START`):** accepted.
  - Training before enrollment belongs to the intake (run history, screen); restarts keep the enrollment day.
  - A pre-enrollment safety report is refused too. Its route is the onboarding or next screen (copy: SSCTR-BC-05).
  - The native HealthKit first sync must send pre-enrollment workouts to the intake, not to deliveries. That is the inventory's own decision, and §9 already covers setting a refused index aside.
- **SSCTR-INT-R2-01:** closed. The duplicate-only answer now carries the stored `warningSignScreen` (focal test).
- **SEC-INT-02R (`evolves` / `sameReport`):** no sporting objection.
  - A merge must now carry a new voice's stated response, so an ADVERSE can no longer be merged away.
  - Every legitimate shape in my probes was admitted: b1, 14 corrections on flagged rows; b2/b3, full weeks; b5 and b6, re-sends.
- **SEC-INT-04 rest and O-SC-1:** not sporting.

## 2. Findings

| Id | Severity | Blocking | What / minimal reproduction | What closes it | Owner |
|---|---|---|---|---|---|
| **SSCTR-BC-01** | Low | No for physical validation. **Before real athletes see pace readings**, as part of SSCTR-INT-02's native check | b6 (a): screen at the run day, device run recorded; 40 days later the athlete's form for that session (stop SYMPTOM at 12 min) without a screen → ASK, not recorded. The device row's `reportsReading.withheld` is `null` (ee256ae: `REPORT_NOT_CARRIED`) until the form is re-sent with a screen; then flagged and withheld. Stop screened throughout | No engine change. The SSCTR-INT-02 native check includes: a form named `NOT_RECORDED_BY_THIS_DECISION` goes back in the same request as the screen answer, never after a delivery. A boundary test pins ASK → re-send-with-screen → flagged → withheld | Engineering (native) + QRE |
| **SSCTR-BC-02** | Low | No (pre-existing, observation) | b7: watch workout delivered at 06:01 with end 07:45 → `FUTURE_OBSERVATION`; re-sent at 09:00 → RECORDED, 2 facts, `REPORT_NOT_CARRIED` for ever, on both trees. A transient refusal withholds a legitimate run from pace (same class as QRE-INT-02; reach limited to clock errors, bounded by native D1) | Decide with the next pace-lineage change: a refusal for a transient reason (the time, not the content) should not stand in force against the same activity re-sent valid. Re-review on field data | Core + SSCTR |
| **SSCTR-BC-03** | Low | No (pre-existing, observation) | b4: no readiness declaration; stop on d−1 or d−3, session done on the restart day → `NO_PAUSE` (the cause is not asked); the same record with a declaration asks. Mitigated by the restart's current screen and the warning-sign screen (b9) | SB-1 family: decide whether a stop after the last execution-free day asks without a declaration too; no number needed | Core + Security, then SSCTR |
| **SSCTR-BC-04** | Info | No | C-O1-3 superset (§1 item 1) | **Record:** the closing record states decision A as amended: on a flagged row, any kept voice stating ADVERSE/IMPAIRED reads ADVERSE, also against a contradicting voice, for hold-type readers only. **Re-review trigger:** a second response-bearing speaker per session (another app, a coach, a device-derived recovery or HRV), or any reader that turns this into REGRESS, a reduction, learned interference, credit or calibration | Author with Chief |
| **SSCTR-BC-05** | Low | No | Copy: (a) the cause question for a 0-week stop reads "Say what interrupted training…"; (b) a `BEFORE_RECORD_START` refusal of a report stating a safety signal names no route | (a) ask what stopped the session; (b) the answer points to the warning-sign or eligibility screen | Product/UX |

**C-BC-3 (condition, item 6).** Native/UX copy for "this workout is wrong / not done":
- it says that this records a disagreement: the session earns no credit and the workout is not used for pace;
- it never says that the device workout is corrected or deleted.

Owner: Product/UX. Binding before real athletes.

**Carried, unchanged:** C-O1-2's closure (Safety Continuity), C-F01-2, SEC-CORE-03, O-SC-S1/S2/S4, SSCTR-INT-02/03/05/06 (native) and O-R2-1. **iOS revalidation is pending.**

## 3. Dose statement

**Exactly one dose change: C-O1-3.** It points downward only, holding steps and never reducing them.

**Where it applies.** All three conditions must hold:
- a week's flagged (disputed) session keeps a voice stating recovery ADVERSE or next day IMPAIRED;
- that voice was not the first admitted (device first, or after a device re-sync);
- that row completes systemic convergence: adverse in both sports, or 3 or more adverse sessions.

**Effect.** Every ADVANCE or EARNED gate of that transition becomes HOLD: one step held per gate.

**Size (b3, week 3 BUILD, device-first dispute plus one adverse strength session):**

| | w+1 (CONSOLIDATION) | w+2 (BUILD) | w+3 (BUILD) |
|---|---|---|---|
| QUALITY run (min) | 34 → 34 | 41 → **34** | 48 → **41** |
| Strength FULL_A (min) | 20 → **19** | 39 → **38** | 40 → **39** |
| Strength load step | — | — | 24 kg → **22 kg** (deferred one step) |
| LONG and EASY | unchanged | unchanged | unchanged |

- This is a one-step lag, the same as the athlete-first order already gave on ee256ae (b2, D).
- Running re-entry through such a week is deferred, because the week reads systemic.
- With no convergence (b3, B) only `adverseSessions` moves, and no gate changes.
- REGRESS, REDUCE, learned rearrangement, credit, calibration, the restart and the return ladder are unaffected.
- The hold itself is the decided systemic-convergence rule. Only its reach in disputed sessions changes, and that change is authorized by decision A (SSCTR_O1_R1).

**No dose change from the other items:**
- SEC-SC-02 and SEC-SC-03 add a cause question. A nonclinical answer gives the same plan; a clinical one routes as before (b9: identical hashes).
- QRE-INT-02 leaves credit and program equal to the control (b5). Pace evidence is now complete: a re-sent run is carried once.
- SEC-INT-06, -07, -02R, -04 rest, SSCTR-INT-R2-01, G07 and O-SC-1 change no dose.

## 4. Status fields

- **Dispositions:**
  - C-O1-3: CLOSED, with the decision A amendment (SSCTR-BC-04).
  - QRE-INT-02: CLOSED on the SSCTR constraint (SSCTR-BC-01 joins SSCTR-INT-02).
  - SEC-SC-02 and -03: ACCEPT. Closure is Security's.
  - SEC-INT-07: ACCEPT.
  - G07: sporting part SUPPORTED; the Founder's confirmation remains.
  - C-O1-5: sporting half DISCHARGED for V1 (C-BC-3); the agency half stays with Product/UX.
  - SSCTR-INT-R2-01: CLOSED.
  - Overall: **ACCEPT_WITH_CONDITIONS**.
- **Evidence status:**
  - Record-fidelity and reach claims: SUPPORTED_WITH_LIMITS. Synthetic athletes, one engine version, matched comparators on both trees.
  - That holding a step after converging adverse signals is appropriate: decided earlier, not reopened.
  - The direction of SSCTR-BC-02's effect: PLAUSIBLE_BUT_UNCERTAIN.
- **Confidence:** MODERATE to HIGH on reach and order-independence (code traced and probed); MODERATE on unreachability through the boundary (it rests on the boundary's channel keys and chain rules as they stand).
- **Proposed AE action:** NOT_APPLICABLE.
- **Gate status:** NOT_CLOSED_BY_THIS_RECORD. **Publication:** NOT_PUBLISHED.
- **Validation:** human validation false, empirical product validation false, clinical clearance false.
- **Human revalidation queue (proposed only; not appended):** HQ-SSCTR-BC-01. The protective reading of an adverse voice on a disputed session, as implemented with the superset amendment (C-O1-3, SSCTR-BC-04). It supersedes the proposed HQ-SSCTR-O1-03. Status if adopted: QUEUED_FOR_FUNDED_HUMAN_REVALIDATION.
- **Re-review triggers:**
  - any change to `kindOf`/`voicedAdverse`, `weekEvidence`, the systemic rule or the set of readers that take flagged rows;
  - a second response-bearing channel;
  - any change to `saidAfter`/`partOf.observedAt`, the restart pause or the `decided`/`stopOnly` rule in `v1-run-format-index.mjs`;
  - the lineage rule for refused reports (SSCTR-BC-02);
  - the safety-excess limit;
  - the G07 retention scope;
  - the first real-athlete integration.
- **Expiry:** at the RC freeze closing, or at the first trigger.
- **Supersedes:** nothing. SSCTR_O1_R1 C-O1-3 is closed here, and decision A is amended as stated. SSCTR_INT_R2 item 4 and SSCTR-INT-R2-01 are closed here.
