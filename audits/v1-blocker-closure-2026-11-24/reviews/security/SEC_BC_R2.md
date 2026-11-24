# SEC_BC_R2: narrow Security recheck of the blocker-closure cycle

**Judge:** Security, Privacy & Abuse Architect, the same independent instance as SEC_BC_R1. I am not the author. **Date:** 2026-11-24. Synthetic athletes only.

**Scope:** my R1 findings only, as `CYCLE1.md` (record commit `74aebb0`) disposes them, plus a check that nothing I closed in R1 has regressed. This is not a new review.

**Judged:** commit `220c0056801a593432f87dc5d00b24ac6efdcd25`, the cycle over `6e85222`. Only `boundary/integration.mjs` changed in `src`: its sha256 is now `5b4530edd9cda9b2`. The other six files are byte-identical to R1 (`b8da4d12…`, `8705f1c9…`, `689c227c…`, `a21048f6…`, `f58b5239…`, `fe78490f…`).

## Commands run

All runs used a new `git archive` copy of `220c005` (`CoachingCore` and `audits`, with `node_modules` copied in). The probes also ran on the R1 copy of `6e85222`.

**Tests:**
- `node --test test/v1bc-cycle1.test.mjs test/v1bc-blocker-closure.test.mjs`: **25/25 pass**.
- The R1 regression set (215 tests): **205 pass, 10 fail**. The 10 failures are identical, by title, to those on `6e85222`: the 8 known failures plus the 2 old pins that have successors.

**Probes:**
- Re-run: `q1`–`q4`, `p3b`, `p8`, `p5`, `p4`, `p2`.
- New:
  - `q5-erasure-clock-variants.mjs` (`379a6d92d3f93142`);
  - `q6-hold-under-clock-ahead.mjs` (`0d72b0a4f6c98988`);
  - `q7-erasure-restore.mjs` (`a09febbe0e368a3e`).
- Each takes the root that holds `CoachingCore` as its argument.

**Mutation evidence:** read from `74aebb0`, `mutation-survivors-boundary.json`: 13/13 KILLED, including BC01 (the mutant that drops the lastAt dating) and BC02.

No verify script was run. Nothing was committed, pushed or deleted. This file and the three new probes are my only writes.

## Verdict: **PASS_WITH_CONDITIONS**

- **SEC-BC-01 is CLOSED** for the clock-behind class it named.
- **SEC-BC-02 is CLOSED.**
- **No regression** of anything I closed in R1.
- **One new residual, SEC-BC-R2-01 (Low).**
  - It is reachable only after an earlier operation ran with the clock set **ahead**, which is the Founder D1 class. Only the view is affected, and only for a while: an erasure made after such an operation hides the erasure's hold in the plan view until the clock catches up.
  - It is not blocking for synthetic physical validation. It is a condition before real athletes.

## Status per R1 finding

| Item | Status | Evidence |
|---|---|---|
| **SEC-BC-01** | **CLOSED** | The `q1` attack gives marker `2026-11-20T09:00` (= lastAt), state BLOCKED, weekly CLINICAL_HUMAN_REQUIRED. The control is unchanged. `q5` tries to break it: v1 (the q1 shape), v4 (the clock behind by 1 s), v5 (a revocation of HEALTH_SIGNALS under the same behind clock, then the erasure, then the consent granted again) and v7 (the erased request retried under the behind clock gives `CLOCK_BEHIND_RECORD`, and with the right clock CLINICAL_HUMAN_REQUIRED). **All are BLOCKED / CLINICAL_HUMAN_REQUIRED.** On `6e85222`, v1, v5 and v7 gave RETURNING / KEEP. v2 and v3 (a second declaration as the last operation) stay BLOCKED. `q7` (a backup restored after the attack): without the anchor the record is BLOCKED; with it, `RECORD_ROLLED_BACK`. **No path ends in a released hold under a clock behind the record.** The custody instants (`asOf`, `declaredAt`) are `now()` = `op.at`, and the client cannot set them (`ENGINE_OWNED_FIELDS`). So a marker at lastAt is never earlier than a declaration on record. The cycle-1 test pins the case, and mutant BC01 is killed. |
| **SEC-BC-02** | **CLOSED** | `q3`: after the erasure, the resend is no longer a duplicate. The engine is asked and names `RUN_STOPPED_FOR_A_SYMPTOM`. Once readings are stored again, a later duplicate carries the screen (cycle-1 test). Mutant BC02 is killed. |
| **SEC-BC-O-1** | **AGREE, routed as optional** (Engineering, custody) | `q4`: unchanged, the only kept forgery. Defence in depth; no boundary input produces it. |
| **SEC-BC-O-2** | **CLOSED as a native obligation** | `NATIVE_OBLIGATIONS.md` §3.4a: the HealthKit anchor starts at the enrollment day, a refused index is set aside and the rest is re-sent, and a refused safety report is kept as a draft. Verified at the iOS run. |
| **No regression of R1 closures** | **Holds** | `p3b` is identical to R1 apart from timings and bytes: G1, G2 and G4 ASK, D3 and D4 DECLARED. `p8` 6/6 and `q4` 13/13 forgeries refused, with every legitimate shape kept. `p5`: `BEFORE_RECORD_START` 57, record 277 KB, the 17th correction carrying a stop admitted. `q2` (d): 11 admitted, the 12th refused. `p4` and `p2` unchanged: erasure under a behind clock gives OK, and a symptom stop under it stays `CLOCK_BEHIND_RECORD`. The C-O1-3 and QRE-INT-02 focal tests are green. |

## Finding

| ID | Severity | Blocking | What | Reproduction | What closes it | Owner |
|---|---|---|---|---|---|---|
| **SEC-BC-R2-01** | Low (D1 class; view only; temporary) | **No** for synthetic physical validation. **Yes before real athletes.** | The marker is now dated at `lastAt`. If an earlier operation ran with the clock set ahead, `lastAt` is in the future. Hold readers read F08 rows "as of now" (`readableF08({at: nowMs})`), so a future-dated marker is not read yet. Erasing the report of a standing hold then shows the plan view as **RETURNING** instead of BLOCKED until the clock reaches `lastAt`. Every write meanwhile is `CLOCK_BEHIND_RECORD`: no engine decision, delivery or acceptance can happen, and the hold reappears when the clock catches up. For comparison: a hold recorded under a clock set ahead stays BLOCKED in the view (`q6`, all trees), and on `6e85222` the same sequence read BLOCKED only because of the R1 defect. | `q5` v6: one action 20 days ahead, the clock set right, the d3 report erased. Marker `2026-12-07T09:00`, state RETURNING, weekly `CLOCK_BEHIND_RECORD`. | Either of these: **(a)** the Founder D1 native criterion (refuse any operation more than 300 s ahead of a trusted reference), verified on iPhone, which bounds the window to 300 s; or **(b)** preferred, portable: views and custody read standing holds at `max(nowMs, the record's lastAt)`, or read an erasure marker as in force whatever its instant. With (b), `q5` v6 reads BLOCKED. | Engineering (boundary views) + Native (D1) |

**Noted, not mine:**
- SSCTR-BC-03 is routed to "Core + Security, then SSCTR" in `CYCLE1.md`. It is not an R1 Security finding and is pre-existing. I accept being consulted on it when it is taken up.
- `CYCLE1.md` corrected the SEC-INT-04 (rest) focal test: it had compared `undefined` with `undefined`. It now reads the stored document's `lastAt`. My R1 claim that "lastAt never moves back" rested on p2 and on that test. It now rests on the corrected test and on the cycle-1 test.

## Ruling on REPMILE-COACHINGCORE-V1-RC-1

**Yes, on the Security side.** RC-1 may be written on `220c005`'s bytes as the release candidate for **physical validation, synthetic athletes only.**

The RC-1 record must carry these conditions:

1. **SEC-BC-R2-01** before real athletes (D1 verified, or the portable fix).
2. **Founder G07** (the stop-fact retention).
3. **D1** and the other native obligations, at the iOS revalidation, including §3.4a.
4. **SEC-INT-05 (rest) and SEC-INT-12** before real athletes.
5. **SEC-BC-O-1** as optional.

**One more condition for the physical run itself.** CYCLE1 states that the Mac bundle does not yet include `integration.mjs`. The boundary Security conditions can only be verified on the iPhone if the bundle carries the boundary at these bytes (`integration.mjs` `5b4530edd9cda9b2`, `custody.mjs` `f58b52399eca4d77`, `admission.mjs` `fe78490f9c481af7`). Until then, the physical run validates the engine, not the boundary.

**Gate scope:** `220c005` only. **V1 authority:** NO. **Real athletes:** NO.
