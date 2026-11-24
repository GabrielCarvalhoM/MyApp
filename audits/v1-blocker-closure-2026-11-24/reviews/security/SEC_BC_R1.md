# SEC_BC_R1: Security / PCG review of the V1 blocker-closure candidate

**Judge:** Security, Privacy & Abuse Architect, acting as the independent Security/PCG judge. I am not the author. **Date:** 2026-11-24. Synthetic athletes only. I read no QRE or SSCTR review of this mission.
**Judged:** commit `6e85222c60cd1f3ee51a074a015b1d0f71a3431a` (branch `claude/v1-cc-blocker-closure`), against base `ee256ae880b6369c6ae22907b13e5e845ff74604`.

## Identities judged

| File (`CoachingCore/src/`) | sha256 (first 16) |
|---|---|
| `r6-adaptation.mjs` | `b8da4d12ba8f2d15` |
| `r6-provenance.mjs` | `8705f1c92f0b5c03` |
| `v1-f08.mjs` | `689c227ca9f8de43` |
| `v1-run-format-index.mjs` | `a21048f67ac25185` |
| `boundary/custody.mjs` | `f58b52399eca4d77` |
| `boundary/integration.mjs` | `49c2842e712f8d82` |
| `boundary/admission.mjs` | `fe78490f9c481af7` |

New probes in `probes/` (each takes the root that holds `CoachingCore` as its argument, so it runs on either tree):

| Probe | sha256 (first 16) |
|---|---|
| `q1-erasure-behind-clock-hold.mjs` | `f73fac09b6dea8a9` |
| `q2-record-start-window.mjs` | `54db9cb4439b8600` |
| `q3-duplicate-after-erasure.mjs` | `a7de5cde33ec251a` |
| `q4-evolves-bc.mjs` | `3b2bb2958b5b560d` |

Earlier probes re-run, unchanged: SEC_INT_R2 `p1`, `p2`, `p4`, `p5-limits`, `p6`, `p7`, `p8-evolves-r2`, and the SC probe `evidence/probes/p3b.mjs` (`c330e64c1cebc3ad`, the same hash as in SEC_SC_R1).

## Commands run

- Two `git archive` extracts in new scratch directories (`6e85222` and `ee256ae`, `CoachingCore` and `audits`), with `node_modules` copied in. Every probe ran on both trees.
- `node --test test/v1bc-blocker-closure.test.mjs test/v1bc-rc-record.test.mjs` on the candidate: **17/17 focal tests pass**. The RC-1 record test fails in my copy only because the extract is not a git repository (`git show ee256ae:…`). I did not judge it.
- The regression suites on both trees: `v1int-authorship`, `-custody`, `-cycle1`, `-journeys`, `-limits`; `v1core-sc-*` (continuity, successors); `v1core-o1-*` (conflict evidence, successors); `v1cp-f08`; `v1core-cf011r2-restart-evidence`; `v1core-ncc-normalization-consistency`; `v1cib-custody`; `v1cib-cfobs1`. That is 215 tests.
  - Base: 207 pass, 8 fail (the known ledger moves and pre-existing failures listed in SEC_SC_R1 §5).
  - Candidate: 205 pass, 10 fail. The 8 above, plus 2 old pins whose successors are green in the focal file: `v1int-authorship:149`, which asserts "QRE-INT-02 as it stands" (successor: the QRE-INT-02 device route), and `A04L`, the old limits table (successor: A04L with `safetyExcess`).
- No `npm run verify`, no `verify-r*`, nothing committed, pushed or deleted. This file and the four probes are my only repository writes.

## Verdict: **FAIL**

There is one blocking finding, **SEC-BC-01**. It is a regression introduced by this commit's SEC-INT-04 change.

When the clock is behind the record, an erasure of health facts dates its erasure marker in the past. An earlier readiness declaration then answers the marker, so a **standing clinical hold is released**: the next weekly review gives `KEEP` where it should give `CLINICAL_HUMAN_REQUIRED`.

Everything else in scope holds, or is closed, on these bytes. One consolidated corrective cycle can close SEC-BC-01 (and SEC-BC-02) narrowly.

## Status per item in scope

| Item | Status | Evidence |
|---|---|---|
| **SEC-SC-02** (a voice dated by its own `observedAt`) | **CLOSED** | `p3b` on both trees: G2 and G4 go from DECLARED to **ASK**. D3, D4, A0 and C5 are unchanged. The p3b diff moves only G1, G2 and G4 (plus the bytes of the engine-only J3 shape). The rule is the one SEC_SC_R1 set: a stop observed before the declaration stays answered by it. |
| **SEC-SC-03** (a stop on the restart day) | **CLOSED** | `p3b` G1 goes from NO_PAUSE to **ASK**. The change only adds a 0-week pause where the pause was null, so it can only add a question. |
| SB-1 regressions (D3/D4 and every SB-1 behaviour closed earlier) | **No regression** | The whole p3b matrix (A1–A6, B, C, D, E1, F1–F7, H) is identical apart from G1, G2 and G4. The SC, O-1, cf011r2, NCC and v1cp-f08 suites are unchanged against the base. The differential reports `declaredWhereOldAsked` 0, `declaredOverStop` 0 and credit gained/lost 0/0 in all 16 configurations. |
| **C-O1-3** (security side) | **CLOSED, no exposure** | The adverse count is 1 in all four orders (`reproductions-before-after.txt`; focal tests). The change only reads a flagged row as ADVERSE, which is never credit, so it cannot grant progression. |
| **QRE-INT-02** (an undecided report keeps only its stop): can it bypass a hold or the screen? | **No bypass** | It only changes the record of formats that later readers use (`read`). It reuses `stopOnly`, which keeps `stop` and the speaker. The screen reads stops only (`screenOf` → `symptomSessions`). A refused review still returns `held(...)` before this code runs. The decided set includes merged ids, parts, input hashes and `excluded`. The worst misuse is withholding one's own pace evidence. |
| **SEC-INT-02R** (my four rules; six p8 forgeries; legitimate shapes) | **CLOSED** | `p8` gives 6/6 REFUSED, with both controls KEPT. `q4` adds 13 more forgeries: a deleted or blanked merged response (with or without a device response), deleted response keys, a stop removed, `completed` removed, a value fabricated in the row only, minutes dropped from a part, an extra response key, a deleted or downgraded kept-voice response, and a kept-voice stop removed. **All 13 are refused.** `q4` also keeps 6 legitimate shapes, and the focal test, `p1` and the journeys keep the rest. **Rule 1 is implemented with declared tolerances**, not byte equality: `completionRead`, fields that state nothing, and `distanceKm` → `manualDistanceKm`. `SAFETY_FACTS` still compares stop, completion, recovery and next-day function first, so none of the tolerances can drop a safety fact. **Rule 4 is met as I wrote it.** One residual is SEC-BC-O-1. |
| **SEC-INT-06** (`BEFORE_RECORD_START` from the enrollment day) | **CLOSED** (one native note, SEC-BC-O-2) | `p5` (A): 480 reports → 24 recorded and 57 requests refused (`BEFORE_RECORD_START`); the record grows 251 → 277 KB instead of 695 KB. `q2`: future-dated reports record nothing, and a report with no date is `INVALID_TIME`. A form whose `occurrenceDate` is in the window but whose `observedAt` is older is admitted. It is bounded by the day of its `occurrenceDate`, so the growth bound holds. |
| **SEC-INT-07** (a safety signal past a limit, at most 3 more) | **CLOSED** | `p5` (B): a 17th correction carrying a symptom stop is now admitted. `q2` (d): 8 plain + 3 ADVERSE reports admitted, the 12th refused. The focal test covers the 4th excess and the screen asking. `statesSafetySignal` reads a stop the way f08 `stopped` does. |
| **O-SC-1** (the boundary is the V1 bound) | **AGREE** | The focal test pins the most voices one session can reach through the boundary: one athlete chain plus 4 device activities. The SEC-INT-07 excess raises the chain bound to 19 corrections (still bounded). The engine-only J3 growth is not reachable through V1. |
| **SEC-INT-04 (rest)** (erasure under a clock behind the record) | **OPEN → SEC-BC-01 (blocking)** | `p2` B: erasure now passes and `lastAt` does not move back. But `q1` shows the erasure marker carries the behind instant and releases a standing clinical hold. |
| **SSCTR-INT-R2-01** (a duplicate-only answer carries the screen) | **PARTIAL → SEC-BC-02** | `q3`: before an erasure, the duplicate answer names the screen. After an erasure of health facts, it says `null` while the retained stop still requires the screen. The next non-duplicate review asks it. |
| **G07** (screen erased; stop facts kept as a safety retention) | **AGREE (Security side), pending the Founder** | `p4` and the focal test: after the erasure, `carried.screen` is null and a device delivery gets `SCREEN_REQUIRED` (fail-closed). The stop facts hold no free text, and keeping them keeps the screen asking. Account erasure removes everything. The Founder confirms or narrows the retention before real athletes. |
| **D1** (clock set ahead) as NATIVE_OBLIGATION | **AGREE** | The criterion is sound: refuse an operation more than 300 s ahead of a trusted reference, verified on an iPhone. One note: D1 covers only a clock set ahead. The behind-clock class is portable and must not wait for native work (SEC-BC-01). |
| **SEC-INT-05 (rest), SEC-INT-12** as DEFERRED_NON_BLOCKING | **AGREE** | Neither has a safety or dose effect (`p7` case 4, `p9`). Both are still **before real athletes**, as their closing criteria say. |
| **QRE-SC-04 / O-SC-S4** as unreachable through the boundary | **AGREE** | Ids are boundary-owned (`BOUNDARY_OWNED` includes `eventId`, `provenance` and `conflicted`). A workout linked to another session is refused (`ACTIVITY_LINKED_ELSEWHERE`). A device re-sync is bound as a correction by its activity. Both err low or long. |
| **OOS-1/2, SEC-SC-O-1, SEC-SC-O-2** as ALREADY_CLOSED | **AGREE** | Client `provenance`, `conflicted` and `context` are refused at admission. SEC-SC-O-1 was closed at the portable layer in SEC_INT_R2. |

## Findings

| ID | Severity | Blocking | What | Reproduction | What closes it | Owner |
|---|---|---|---|---|---|---|
| **SEC-BC-01** | **High** (a safety hold released; introduced by this commit) | **Yes.** It blocks this RC, and therefore physical validation of this package and any real athlete. | `eraseHealthFacts` now runs under a clock behind the record (`run(…,false,…)`). Custody's clock is `op.at`, so `erasureFact` gets `declaredAt` = the behind instant. `standingHolds` counts a marker only when it is later than the latest readiness declaration. **The sequence:** a readiness declaration on day 1, then a clinical hold on day 3. The clock is set back to day 0 and the athlete erases the day-3 report. The marker is dated day 0 and is answered by the day-1 declaration. The hold is gone: the state reads RETURNING and the next weekly review gives **KEEP**. With the true clock, or on the base (where the erasure is refused), the result is BLOCKED / `CLINICAL_HUMAN_REQUIRED`. The athlete can reach this from the app's privacy screen with nothing more than the device clock. | `probes/q1-erasure-behind-clock-hold.mjs`. Base: attack `CLOCK_BEHIND_RECORD`, hold kept. Candidate: attack erase OK, marker `2026-11-17T20:00`, `stateAfter: RETURNING`, weekly `KEEP`. The control keeps the hold on both trees. | Under a behind clock, the erasure keeps passing, but **every instant the erasure writes is no earlier than the latest instant on record**: at least `carried.lastAt`, and at least the record's latest fact or row instant. This covers the marker's `declaredAt` and `firstRecordedAt`, the chain append, and the `ERASURE` and `HEALTH_FACTS_ERASED` decision entries. Example: in `integration.mjs`, set `op.at = max(op.at, lastAt)` for `eraseHealthFacts` before custody runs. **Closing evidence:** `q1` attack gives BLOCKED / `CLINICAL_HUMAN_REQUIRED`; the SEC-INT-04 (rest) focal test stays green; `q1` is pinned as a test, with a mutant that drops the max killed. | Engineering (boundary); Security narrow recheck of SEC-BC-01 and SEC-BC-02 only |
| **SEC-BC-02** | Low | No. It must close before real athletes; fixing it in the same cycle is preferred. | SSCTR-INT-R2-01's fix reads `presentation.readings.warningSignScreen`. An erasure sets `readings` to null on purpose (SEC-INT-08), while the retained stop still requires the screen. So a duplicate-only answer after an erasure says `warningSignScreen: null`, which is the reading SSCTR-INT-R2-01 was meant to remove. Device deliveries still fail closed (`SCREEN_REQUIRED`). | `probes/q3-duplicate-after-erasure.mjs`. Candidate: `dupBefore` names the screen, `dupAfter` gives `null`, and a plain review then asks `RUN_STOPPED_FOR_A_SYMPTOM`. | Take the duplicate shortcut only when stored readings exist. Otherwise make the engine call, or answer from the record of formats. `q3` `dupAfter` then names the screen. | Engineering (boundary) |
| SEC-BC-O-1 | Low (observation; defence in depth) | No | Rule 4 accepts any label `r6-provenance.mjs` writes. A misbehaving engine can swap a head-on kept voice's label to an integrity label (`EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`), and custody keeps it. That moves the row into the O-SC-S4 / QRE-SC-04 class, which errs long or low. No boundary input produces it. | `q4`, case "KEPT: label swapped to another engine label" (kept on both trees) | Optional: a kept voice added by an admitted report carries a non-integrity label (`CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS` or `CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE`). | Engineering (custody) |
| SEC-BC-O-2 | Low (native note) | No | `BEFORE_RECORD_START` refuses the **whole** request. If a HealthKit queue that keeps workouts until they are recorded holds a workout from before enrollment, every later delivery in that batch is refused. Device data then stalls (errs low; a device workout carries no stop). | Code: `integration.mjs` admit (the refusal is returned for the whole request); focal test SEC-INT-06 ("whole, nothing written") | Add to `NATIVE_OBLIGATIONS.md`: the HealthKit layer never sends workouts observed before the enrollment day, and drops the indexed item on `BEFORE_RECORD_START`. Check at the iOS run. | Native / Engineering |

**Noted, not judged (pre-existing, identical on both trees):**
- `q2` (a): 20 requests of future-dated reports record nothing, but they add about 45 KB of request and decision entries.
- `p4` B: replaying an erased request records the erasure marker again. This is the behaviour accepted in SEC_INT_R2.

## What the corrective cycle must show

1. **SEC-BC-01:** `q1` attack gives BLOCKED / `CLINICAL_HUMAN_REQUIRED`, and the control is unchanged. Erasure under a behind clock still succeeds, and `lastAt` never moves back. `q1` is pinned as a test.
2. **SEC-BC-02:** `q3` `dupAfter` names `RUN_STOPPED_FOR_A_SYMPTOM`.
3. No other file moves. `p3b`, `p8`, `q4`, `p5`, `q2` and the focal file are unchanged.

With these, I expect **PASS_WITH_CONDITIONS**. The conditions would be: G07 (the Founder's confirmation of the retention), D1 and the other native obligations at iOS revalidation, SEC-INT-05 (rest) and SEC-INT-12 before real athletes, and SEC-BC-O-1 and SEC-BC-O-2 as noted.

**Gate scope:** `6e85222` only. **V1 authority:** NO.
