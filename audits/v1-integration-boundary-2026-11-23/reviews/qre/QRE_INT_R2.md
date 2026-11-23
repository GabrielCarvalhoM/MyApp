# QRE recheck R2: V1INT cycle 1

- **Judge:** Quality & Reliability Engineer, independent.
- **Scope:** only the R1 findings, as `CYCLE1.md` dispositions them. This is not a new full review.
- **Version:** cycle `d310faf` over `a52db2b`.
- **Date:** 2026-11-23. Synthetic only, Node v24.19.0.
- **Probes and raw outputs:** `probes/r2/`. The R1 probes were re-run unchanged into `probes/r2/*-out.txt`.

## Verdict: READY_WITH_CONDITIONS

The verdict covers synthetic use of the boundary. It is not an authorization for real athletes.

Every R1 blocker is now fixed in behaviour: QRE-INT-01, -03 and -04 are each reproduced as closed by my own probes. The remaining conditions are listed with owners in the last section:
- tests that do not yet pin some of the fixes;
- an inaccurate line in the author's suite evidence;
- QRE-INT-02 (core), which is routed.

QRE-INT-02 (core) still blocks any real athlete.

## Current evidence

| Check | Result |
|---|---|
| Full suite, my run on `d310faf` (`probes/r2/suite-qre-d310faf.txt`) | **1905 tests, 1862 pass, 43 fail.** Against the FREEZE-7 failing titles, exactly one is new, the FREEZE-7 preservation test, by design. Against the `a52db2b` titles, none is new. |
| Author's `evidence/suite-cycle1.txt` | **1905 / 1860 / 45.** It labels two v1int limit tests as "NEW (by design, custody.mjs amended)". That label is wrong: a limit test does not depend on a freeze. Both pass in my full run, and in isolation (`probes/r2/limits-d310faf.txt`, 7/7). See C-R2-2. |
| FREEZE-7 bound files, hashed directly | 49/49 byte-identical. `v1core-freeze-7.mjs --check` exits 1, as contract §8 now states. |
| RED `evidence/red-cycle1-on-a52db2b.txt` | 12 of 23 tests fail on the a52db2b bytes. The 12 are the 11 cycle tests and the amendment test. Consistent with the cycle. |
| Mutation over the cycle: 37 mutants in memory, five v1int files (`probes/r2/mutate-run-r2.mjs`, `mutation-r2-out.json`) | 23 killed, 14 survived. Analysis under item 2. |

## 1. Status of each R1 finding

| Finding | Status | Evidence |
|---|---|---|
| **QRE-INT-01** (accepted offer) | **CLOSED** | See (a) below. |
| **QRE-INT-02** (ASK, then sent again) | **Boundary part CLOSED. Core OPEN, routed** (correctly; item 3). | See (b) below. |
| **QRE-INT-03** (`acknowledgeRecordLoss`) | **CLOSED** | See (c) below. |
| **QRE-INT-04** (`evolves`) | **CLOSED in behaviour**, with a test-gap condition (C-R2-1) | See (d) below. |
| **QRE-INT-05** (device answer) | **CLOSED** (boundary). The queue rules are in §9. | See (e) below. |
| **QRE-INT-06** (late delivery across a restart) | **CLOSED by native rule**, plus observation O-R2-1 | See (f) below. |
| **QRE-INT-07** (regression statement) | **CLOSED** for §8 (item 4). Superseded for the cycle by C-R2-2. | — |
| **QRE-INT-08** (anchor write) | **CLOSED** | `p04` (d): `anchorStale: true`. Mutant E03 is killed. |
| **QRE-INT-09** (enroll retry) | **CLOSED by native rule** (§9) | `p04` (c) is unchanged by design. |
| **QRE-INT-10** (erasure) | **Boundary part CLOSED** (E01 and E02 killed). The rest is routed to G07. | — |
| **QRE-INT-11** (test gaps) | **PARTIAL.** I06, I13, A03 and A04L are now killed. I12 still survives, and new gaps appear (C-R2-1). | — |

**(a) QRE-INT-01, the accepted offer** (`p01`, `r2/p12` (1)):
- No format the app shows is missing from the record.
- The report of the moved session, citing the shown format, is recorded (`KEEP`, recorded 1).
- After a decline, the report is recorded as well.
- Accepting after a later review is `NOT_PENDING`, and `pendingRecords` is dropped.
- Mutants P01 and P03 are killed.

**(b) QRE-INT-02, the report answered ASK and sent again** (`p03` (d), `p03b`, `r2/p12` (2d), `r2/p15`):
- On the device route the main path is gone: a delivery now carries the athlete's last screen, so the R1 sequence records the workout at once.
- A screen the engine judges stale (40 days) still produces ASK. After the athlete answers and the workout is re-delivered, the row is `REPORT_NOT_CARRIED`.
- The athlete-route twin (`p03b`) is unchanged: it still gives `REPORT_NOT_CARRIED`.
- The boundary now refuses an instant with no offset (T01 killed).

**(c) QRE-INT-03, acknowledging a loss** (`p10`, `p04` (a), (b)):
- An intact record with a hold is `NOT_LOST`. The hold stays, and `enroll` is refused.
- A tampered record is `NOT_LOST` and is kept.
- A fork is `RECORD_ROLLED_BACK`.
- Mutants K01, K02, K03 and I13 are killed.

**(d) QRE-INT-04, `evolves`:**
- `p06`: all 5 forged shapes are refused.
- `r2/p14`: 3 forged kept-voice shapes are refused (amount, conflict label, response).
- `p02`: all 7 legitimate shapes are still admitted. The athlete's answers survive device re-syncs, and the chain verifies.

**(e) QRE-INT-05, the device answer** (`p03` (a)–(c), `r2/p12` (2b)):
- Every answer carries `activities[{index, activityId, outcome, eventId}]`.
- A duplicate-only answer holds arrays.
- An empty delivery is `NOTHING_TO_IMPORT` and writes nothing.
- A mixed delivery maps correctly.
- One refused workout still refuses the whole delivery (`p09` (a)). The §9 queue rule now covers this: set it aside and re-send the rest.

**(f) QRE-INT-06, a delivery after a restart** (`r2/p13`):
- The workout linked to the old plan is still `UNKNOWN_SESSION`.
- Re-sent unlinked, as §9 says, after the new plan has started, it is **RECORDED** and the plan view stays `VALID_PLAN`.

## 2. Do the cycle tests discriminate?

**What is killed.** These fixes are pinned by the suite:
- the acknowledge guard: K01–K03, I13;
- `pendingRecords`: P01, P03;
- the device request shape: S04, S05;
- the per-activity answer and duplicates: Q01–Q04;
- erasure: E01, E02;
- `anchorStale`: E03;
- the clock: E04, E05;
- offsets: T01, A03;
- limits: A04L;
- retry clock: I06;
- `evolves`: C10, C11, C12.

**What survives** (`mutation-r2-out.json`):
- **`evolves`: C06, C07, C08, C09 are real guards that no test pins.** My probes kill them:

  | Mutant | Guard removed | Forged shape it then lets through | Probe |
  |---|---|---|---|
  | C06 | A new voice's safety facts must equal its report | A voice of another session's report | `p06` |
  | C07 | `conflicted` must be a boolean | `conflicted: "maybe"` | `p06` |
  | C08 | The conflict label is kept | The label changed | `p14` |
  | C09 | A kept voice keeps the amount and response | The amount and the response changed | `p14` |

  Output: `r2/p06-under-mutants.txt`, `r2/p14-out.txt`.
  - The amendment test carries the first-merge cases. It does not carry the other-session, non-boolean, label or kept-voice shapes.
  - C03, C13, C14 and C15 are masked by overlapping checks: under C03 the dropped own voice is still refused. Pinning each check separately is not required.
- **The screen: S02 survives, and it matters.** S02 drops the capture of the screen the athlete answers in their own review. Under S02, `r2/p15` (a) delivers the onboarding screen instead of the athlete's new one 40 days on. The workout is then NOT_RECORDED, which is exactly the QRE-INT-02 path the mitigation exists to avoid. With the code as written it is RECORDED, and the athlete's screen is carried.
- **Other survivors:**
  - S03, the retry's stored screen: low. A retry after a new screen would give a conflict and lose nothing.
  - S01: `SCREEN_REQUIRED` is not reachable through `enroll`, because an intake with no screen is ASK and not enrolled (`p15` (b)). It is defensive code.
  - P02: `pendingRecords` applied outside `accept`. No other operation can run between the offer and the accept with a different program hash, so this is low.
  - I12: presentation pruning is untested with a second plan. Low.

## 3. QRE-INT-02 routing and the boundary mitigation

**The routing is correct.** The fact is written by the run-format layer of the frozen engine (`appendReportFacts` under an accepted instant, even on ASK). Removing it, or reading a not-recorded report as not in force, is an engine change and needs the Founder. Owner Core + SSCTR + Founder, blocking real athletes, as `CYCLE1.md` and contract §10 say.

**`tm-5` pins only the precondition.** It asserts that the report fact exists after the stale-screen ASK. It does not assert the consequence, `REPORT_NOT_CARRIED` after the re-delivery. This is acceptable as an open marker. When Core decides, the test should assert the lineage verdict (`r2/p12` (2d) gives the shape).

**The mitigation is correct and effective on the main path.** These all behave as specified:
- the device states no screen (S04 killed);
- the onboarding screen is carried byte for byte (`tm-5`, S05 killed);
- the athlete's newer screen is carried (`p15` (a)).

It cannot help when the engine judges the athlete's own last screen stale. That case is the routed core.

**Gap:** S02 is not pinned (C-R2-1).

## 4. The corrected regression statement (contract §8)

**Confirmed:**
- the 49 bound files are byte-identical by direct hash;
- `--check` exits 1 by design;
- the successor record is pending approval;
- no engine file changed (the diff `e44d855..d310faf` under `src/` is the three boundary files only).

**Two inaccuracies remain:**
- §8 still points to `evidence/suite-candidate.txt`, but the evidence files are `suite-a52db2b.txt` and `suite-cycle1.txt`.
- `suite-cycle1.txt` lists two v1int limit tests as by-design failures. My clean run shows one new title only (C-R2-2).

**Stale text** to correct:
- §2 and §9.6 still say "the queue keeps a workout until it is in `recorded`". §9.9 (and the README) now key the queue off `activities`, and a workout leaves on RECORDED or DUPLICATE.
- §6 still says "13 of the 41 new tests".

## 5. A successor record for `custody.mjs`

**QRE view: approvable once C-R2-1 (custody part) is met. Not before.**

**What supports it:**
- The amendment is now delimited to `reconcile`/`evolves`. It admits exactly the two shapes the engine writes.
- Every legitimate shape I could build is admitted. Every forged shape the reviewers built is refused (QRE 8/8, and SEC p6 per `CYCLE1.md`).
- There is no dose effect: the amendment only keeps what the engine decided.

**Why not yet.** A successor record binds bytes so that a later change is caught. Today four of its guards (C06–C09) can be deleted with the bound tests still green.

**What the record should bind:**
- `custody.mjs` and the amendment test, extended with the four shapes;
- a verifier in the pattern of earlier lines;
- the FREEZE-1 → successor relation, with base bytes, new bytes and the diff limited to `reconcile`/`evolves`;
- its scope, synthetic only.

Security co-approves.

## Conditions and observations

| Id | Severity | Blocking | Owner | Closes when |
|---|---|---|---|---|
| **C-R2-1** | Medium | Yes for the custody.mjs successor record. Not for synthetic use. | Boundary author | The amendment test carries the QRE `p06` cases 4–5 and the `p14` kept-voice cases, so C06–C09 are killed. A cycle test re-answers a screen in the athlete's own review and checks that the next delivery carries it and is recorded, so S02 is killed. Re-running `probes/r2/mutate-run-r2.mjs --fast --only=C06,C07,C08,C09,S02` shows all killed. |
| **C-R2-2** | Low | No | Boundary author | `evidence/suite-cycle1.txt` is replaced by a clean run, or the two limit failures are explained with their output. The "by design" label is removed from them. Contract §8 points to the real evidence files, and §2, §6 and §9.6 are aligned with §9.9. |
| **QRE-INT-02 (core)** | Medium | Yes for real athletes | Core + SSCTR + Founder | An engine decision, and `tm-5` asserting the lineage verdict after re-delivery. |
| **O-R2-1** | Low | No | SSCTR / Product-UX (pre-existing engine chronology) | Decided. Between a restart and the new plan's start, a review answers HOLD ("chronology failed") and the plan view becomes NEEDS_INPUT. A HealthKit background delivery in that gap does it without the athlete. Reproduce with `r2/p13`, with the delivery date set to the restart day (before the new plan starts): the answer is HOLD with reason "Review contract or chronology failed validation", and the view goes from VALID_PLAN to NEEDS_INPUT. The same holds for an athlete review on that day. The workout is NOT_RECORDED and is re-sent later, so nothing is lost. The question is whether the native queue should hold deliveries until the new plan starts. |

Nothing here closes IOS_REVALIDATION_PENDING, SEC-INT-04 (clock ahead), SEC-INT-06/07 or G07. This gate is valid only for `d310faf` in Node.
