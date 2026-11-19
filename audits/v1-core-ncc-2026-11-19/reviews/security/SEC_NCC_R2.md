# SEC-NCC-R2: narrow Security recheck of SEC-NCC-01 (focal correction cycle)

**Judge:** Security, Privacy & Abuse Architect. Same independent instance as SEC_NCC_R1; not the author. **Date:** 2026-11-19. Synthetic athletes only.
**Scope:** only SEC-NCC-01's seven closing items, plus the trust of `availableAt`. This is no new general audit. I read no QRE or SSCTR review.

**Verdict: PASS.** SEC-NCC-01 is **CLOSED**. Nothing in this recheck blocks the FREEZE-5 write.

SEC-NCC-02, SEC-NCC-03, OOS-1 and OOS-2 stay as SEC_NCC_R1 classified them: none blocks the freeze, and they are routed in CANDIDATE §F. C-F01-2, SEC-SR2-02, SEC-CORE-03 and O-1 are unchanged.

## Identities

| Input | Identity |
|---|---|
| Judged commit | `b05d5eab6c42b6290255eba5b00a88fd0310e95f`. The cycle runtime is `963547b3cbc9c101f6f041dd3734bf154e59fea0`; there is no `CoachingCore/src` change from 963547b to b05d5ea. |
| `CoachingCore/src/r6-provenance.mjs` @b05d5ea | sha256 `408eb9beb84c2548214a03bb282d5133e81e3908d21148008c57fd54a44a3581` |
| `git diff ef490bb 963547b -- CoachingCore/src` | sha256 `f1c273208f5b6913cf628a087b18753d8f1b507592a4d18ff45227692490866b` (+8/−4, one file) |
| NCC test file @b05d5ea | sha256 `05377a41317671d713376bcee7d9879ffbce27dc4322bffdc723406c273f64d3` |
| `evidence/mutation-cycle1.txt` | sha256 `868ab3640b56f60d11a374095418233f9ff7a7dfb7d643dcc45e21597f2747eb` |
| Judge probes (scratch `sec-ncc2-h3v8/probes/`, outside the repo) | Unchanged from R1: `e5d.mjs` `c5b37b5cc7cfbfa3`, `edge.mjs` `f24fe16e48fdaa71`, `engine-e5d.mjs` `70b0c7b25270b7aa`, `fuzz2.mjs` `a224161bcd354341`, `sb1.mjs` `52b1a885dcbf406b`. New: `r2.mjs` `ed09edbe85554c16`. |

**How it was run.** All probes ran on a scratch extract of `git archive b05d5ea CoachingCore audits`. One independent mutant ran on a separate scratch copy. No verify script was run, nothing was committed, and no worktree, freeze or history was touched. This file is the only repository write.

## The seven closing items

| # | Item | Evidence on b05d5ea | Result |
|---|---|---|---|
| 1 | `e5d` d1 ≡ d2 in force | **d1** (W carried, then A and C): `C[C]` 15 min SYMPTOM in force, `W(sup>C)` as history, nothing refused, 0 unflagged min, `session:sm` quarantined. **d2** (one review): `C[C]` 15 min SYMPTOM in force, `A(sup>C)`, W refused (`DUPLICATE_CONFLICT_QUARANTINED`), 0 min, `session:sm`. **d3 control:** identical to d1. | **PASS**. The difference between d1 and d2 is judged below. |
| 2 | E5a admitted | The correction of the late part A, arriving a review later, is admitted: `C/sm[C]{SYMPTOM}<C,W:hk-m>`, with W's row as history. Nothing refused; the readiness question asks. | **PASS** |
| 3 | E5c refused, split and in one review | Both give `C2:INVALID_CORRECTION_CHAIN`, and the record stays `M/sm2<M,W2:hk-2>` unchanged. | **PASS** |
| 4 | `engine-e5d` | `d3-fix` is in force, conflicted, 12 min, SYMPTOM. `dev-d3` (40 min) is history. Nothing refused. No d3 run-history fact (`runHistoryD3: []`). `warningSignScreen` is REQUIRED with `RUN_STOPPED_FOR_A_SYMPTOM`. | **PASS** |
| 5 | Re-read ×2 and JSON round trip | `r2.mjs`: for d1, d2 and E5a, two re-reads plus a JSON round trip (the last one with `incoming:true`) change nothing in force, in flags or in the quarantine. The fuzz re-read check was 0. | **PASS** |
| 6 | Holder-clock mutant killed | `mutation-cycle1.txt`: 11/11 mutants killed, plus RED on FREEZE-4. **Independent run:** I replaced `Date.parse(corrected)<namedAt` with `Date.parse(corrected)<availability(old)` in a scratch copy. The NCC tests then gave 21 pass / 5 fail: C1/P1-S1, C1/P1-S2+P2, SEC-NCC-01 (e5d/E5a/E5c), C1/P7 engine and SEC-NCC-01 engine. | **PASS** |
| 7 | Directed suites green; fuzz re-run | NCC **26/26**; SEC-R2 correction integrity **24/24**. `sb1` shapes as in R1 (F1 kept and asks, F2 refused, F3 keeps `session:sm`). Fuzz details below. | **PASS** |

**Item 7: the fuzz re-run.** `fuzz2.mjs` ran 3 × 2500 cases (seeds 4242, 99 and 7), 22 500 passes in all:
- Every one of these measures is 0: carried rows lost, identities lost, activities in force on two identities, symptom stops that vanish, quarantines lost, re-read changes, `firstRecordedAt` moved later or forged.
- The other counts are the pre-existing OOS-1/O-1 classes and match R1: refused reports that change rows in force (2, 3 and 2), and one permutation case (OOS-2).

## The d1 vs d2 difference: does it matter?

In both, the execution in force is the athlete's correction: conflicted, out of dose, capacity and calibration, with its stop, and the identity quarantined. The difference is the watch report:
- **d1:** E-1 keeps the watch as a voice, a part of C, and the activity stays bound to `sm`. That is history, not credit.
- **d2:** the watch report is refused, and its activity is in no row.

`r2.mjs` checks the effect downstream:
- **Restart facts** (`restartIntake`, pause and bounded recent exposure) are identical for d1 and d2.
- **A later report of another session carrying `hk-m`:**
  - after **d1** it is refused (`ACTIVITY_BOUND_TO_TWO_SESSIONS`);
  - after **d2** it is admitted.

So d1 is the more protective outcome. The d2 behaviour (a refused watch report's activity is bound nowhere) is FREEZE-4's in one review, identical to R1's base column. It belongs to the O-1 conflict policy, alongside OOS-1. This cycle does not introduce it, and SEC-NCC-01 does not depend on it.

**Not a condition. Observation O-R2-1 (Low):** route it with O-1 to Core + QRE, before real-athlete HealthKit use.

## Trust of `availableAt`

**What sets it.** `partOf` computes `availableAt` from the report's own normalized `correctedAt ?? reportedAt ?? observedAt`. That is the same clock `availability()` already reads for a row, so a report controls only the clock of its own report, as before.

**An incoming report cannot supply a part clock.**
- `incoming:true` strips `provenance.parts`.
- In `r2.mjs` (forged availableAt), an incoming report forged `parts.M.availableAt` at 23:59. After the merge, the stored part M carries M's own 10:00 clock, and the athlete's later correction of M is admitted.

**A carried part's `availableAt` is engine-written record content, so trusting it is within C-F01-2 custody.** A forged carried record could:
- set a late clock, which refuses a correction of that part (a denial a forged record can already cause in many ways);
- drop the clock, which gives FREEZE-4's lenient behaviour.

No new custody assumption, and no trust beyond C-F01-2.

**Clock-less parts.** A part without a clock is never refused by the rule. Only parts written before this line are clock-less, because every report reaching `partOf` has a normalized `observedAt`. That is FREEZE-4 behaviour and not a bypass.

## Conditions after R2

| ID | Status | Blocks FREEZE-5? |
|---|---|---|
| SEC-NCC-01 | **CLOSED** (items 1–7 above) | No |
| SEC-NCC-02 | Open, unchanged; binding before a real-athlete restart (O-1, Core + QRE) | No |
| SEC-NCC-03 | Open, unchanged; before real athletes (Core / release) | No |
| OOS-1, OOS-2, O-R2-1 | Routed | No |

**Verdict: PASS.** SEC-NCC-01 is closed, and nothing blocks the FREEZE-5 write.
