# QRE review R2: Normalization Consistency Closure, cycle 1 (narrow recheck)

**Judge:** Quality & Reliability Engineer (independent instance; not the author). This is a recheck of my R1 conditions C1–C5 only, not a new audit. I did not read the Security or SSCTR reviews.

**Verdict: READY_WITH_CONDITIONS.** C1 and C2 are closed. C3, C4 and C5 are satisfied in the records. Two non-blocking notes remain; both concern records or the harness, and neither needs a runtime change. **Nothing from QRE blocks the FREEZE-5 write on `b05d5ea`.**

## Identities judged

| Item | Value |
|---|---|
| Commit | `b05d5eab6c42b6290255eba5b00a88fd0310e95f` |
| Cycle runtime commit | `963547b3cbc9c101f6f041dd3734bf154e59fea0`; `git diff 963547b b05d5ea -- CoachingCore` is empty |
| Runtime delta | `git diff ef490bb 963547b -- CoachingCore/src`: `r6-provenance.mjs`, +8/−4 (`partOf` keeps `availableAt`; the chain rule reads `namedAt`) |
| `src/r6-provenance.mjs` | sha256 `408eb9beb84c2548214a03bb282d5133e81e3908d21148008c57fd54a44a3581` |
| NCC test file | `05377a41317671d7…` (26 tests) |
| `scripts/v1core-freeze-5.mjs` | `3b75ff2e…`, unchanged since ef490bb |
| Records | `CANDIDATE.md` `a1570a51…`, `CYCLE1.md` `3cfa9eab…`, `SUCCESSOR_LEDGER.json` `5c6747ce…`, `evidence/differential.mjs` `2b6edd47…` |

Environment: Node v24.19.0. All runs used new scratch extracts of b05d5ea, ef490bb and e704180, plus a clean `git clone --shared` of b05d5ea. Nothing was written to the repository except this file.

## C1: the rule reads the named report's own clock: CLOSED

**My R1 reproducers, re-run unchanged on the cycle runtime:**

| Reproducer | ef490bb | Cycle runtime |
|---|---|---|
| P1-S1 (late device re-sync) | W2 refused | W2 admitted; 42 min; parts `A2:38`, `W2:42@HK1`. Facts equal the one-review outcome. |
| P1-S2 (athlete's late correction) | Y2 refused | Y2 admitted, split and in one review |
| P2 (adverse answer) | `UNKNOWN` | `ADVERSE/HARDER` in force, in the same review and in a third review |
| P7 (engine) | `INVALID_CORRECTION_CHAIN`, 40 min | `dev-d1-v2` in force, 43 min, as on FREEZE-4 |

**The residual cases, in my own probe:**
- A correction of a merged part dated before that part was reported is refused, split and in one review alike (E5c shape).
- A part from a record ef490bb wrote has no `availableAt` and is not refused by the rule, as on FREEZE-4.
- A further correction of a part through a W2-led row (A3 corrects A2) is admitted and stays stable on re-read.
- Tests E and K (the named report is the row itself) still pass.

**Invariants:**
- the author's EXT-late and late differentials, re-run by me, are byte-identical to `evidence/cycle1/differential-ext-late-20261119.json` and `differential-late-20261119.json`;
- every candidate invariant is 0 in those runs;
- my deep re-read probe (every field of every row, recordArrival as the engine uses it) shows 0 changes on 4405 passes.

**The point the coordinator asked me to judge: the holder id in P1-S1.** I accept asserting facts rather than the holder id. On FREEZE-4 the same split also gives a W2-led row and one review an A2-led row, so this order dependence comes from E-1 and is not new. The cycle also fixes a FREEZE-4 mis-parting here: FREEZE-4's split row keeps `A2:40` where the athlete said 38.

The CANDIDATE wording is slightly narrower than the facts, though. It is not only the event id that follows the leading report: the row-level `provenance.sourceQuality`, `provenance.provider` and `canonicalActivityId` do too (P1-S1 split `WEARABLE_FULL/HEALTHKIT/HK1`; one review `MANUAL/MANUAL/null`). Run history and run format read the row-level `sourceQuality` to decide whether a run is wearable (`v1-run-history.mjs:167`, `v1-run-format.mjs:694`, `v1-run-format-index.mjs:96`). This divergence is the same on FREEZE-4. → **N1**: wording only; routed to SSCTR/Core with E-1.

## C2: tests and harness: CLOSED

**Tests:**
- On the exact ef490bb runtime bytes (fc04b9e2…), the 26-test file gives 21 pass / 5 fail. The five failures are the five cycle tests. On the cycle runtime: 26/26.
- The tests assert the facts C1 requires (ADVERSE/HARDER in force, the symptom stop conflicted and quarantined, the device measurement leading), plus re-read and JSON round trip.
- The author's mutants, re-run by me: RED 8/18, and 11/11 killed, including "holder clock (= ef490bb)", "parts keep no clock" and QM12.
- My three extra mutants are all killed: QA "a part with no clock is refused", QB "the part clock is the observed instant only", QC "the row-is-named branch reads the part clock too".

**Harness:**
- With ef490bb as the candidate, the extended generator gives **42 UNEXPLAINED**, byte-identical to `ef490bb-as-candidate-ext-late-20261119.json`. The cycle runtime gives 0.
- Fate accounting runs before the classes and overrides them.

**Can the fate explanations absorb a real defect? Partly. Detection holds, by two independent means:**
1. **`CONFLICT_WITH_RECORD` explains itself.** A refusal as a conflict flags the row and quarantines the identity, and those effects are what the explanation reads. I planted a defect (HM2: any minute difference between two reports of one execution is a conflict). The fate accounting then "explains" 568–758 wrongful refusals per run as `CONFLICT_WITH_RECORD`. The harness still fails the run (UNEXPLAINED 291–687 across late, mono, EXT), but through the class fallback, not the fate check. → **N2**.
2. **The generator never produces a late non-correction report of the same execution.** A planted defect HM1 (such late reports refused as conflicts) gives classes byte-identical to the candidate. That F1 shape is pinned only by the NCC tests (SSCTR f1, sb1, late agreeing merge), which pass. → part of **N2**.
3. **Independent QRE oracles over the author's generators** (3000 cases each; reports with reused event ids excluded):
   - every `DUPLICATE_CONFLICT_QUARANTINED` refusal must be a real disagreement (completion, ±max(3, 10%) minutes): the candidate has **0 violations** in late, mono, EXT-late and EXT-mono (1214–1645 refusals checked per run);
   - every `INVALID_CORRECTION_CHAIN` refusal is suspect if the record held the named report on the correction's own identity and the correction is dated at or after that report's availability: the candidate has **0 suspects** (EXT-late, late, EXT-mono); ef490bb has **31 suspects** on EXT-late, which confirms the oracle sees the C1 class.

So no real defect is hidden on the candidate. N2 is about the harness as evidence for later lines, not about this runtime.

## C3, C4, C5: records: SATISFIED

- **C3:**
  - CANDIDATE §A states the second limitation for records FREEZE-4 wrote: 17 and 11 rows, non-monotone only, one of them silent as `EXACT_REPLAY`, synthetic, routed to Core with custody.
  - I re-ran the measurement on the cycle runtime: 17 lost on seed 20261119 (16 `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`, 1 silent), as stated.
- **C4:**
  - Declared in CANDIDATE §A and not changed.
  - My P11 probe on the cycle runtime reproduces exactly the declared behaviour: W2 flagged in the same review, Q admitted in the next.
- **C5:**
  - The split-independence claim is withdrawn for ef490bb and restated for 963547b. N1 refines the restated wording.
  - The ledger names `:12 (test), failing assertion at :14`.
  - The harness header says only the fate accounting reads every incoming report.

## Regression and freeze (cycle delta)

- **Full suite** on a clean clone of b05d5ea: **1801 / 1770 / 31**. The failing-location set is identical to my ef490bb run (the baseline 29 plus `v1core-secr2-freeze.test.mjs:14` and `v1core-successor-lineage.test.mjs:205`).
- **Freeze preservation:** `v1core-freeze-5.mjs --preserved` exits 0 on the clean clone: nothing else changed since e704180, no untracked file. The verifier itself is unchanged since ef490bb.

## Conditions (none blocking)

**N1. Records only; not blocking.** In CANDIDATE §A, "what stays order-dependent is only … which correction's event id holds the row" should also name the row-level source fields that follow the leading report under E-1 (`provenance.sourceQuality`, `provider`, `canonicalActivityId`). Run history reads `sourceQuality` for wearable evidence. The behaviour is identical on FREEZE-4. Route to SSCTR/Core with E-1. No runtime change.

**N2. Harness only; not blocking.** For later uses of `differential.mjs`:
- explain conflict refusals from the facts of the pair (the row met and the report refused), not from the flag or quarantine the refusal itself creates;
- add late non-correction reports of the same execution to the generator.

This line's runtime is covered by the independent oracles above and by the NCC tests.

Routed items from R1 (O-QRE-NCC-A, the QM9 test gap) and the line's open items (C-F01-2, SEC-CORE-03, O-1, iOS revalidation) are unchanged.

**Verdict: READY_WITH_CONDITIONS.** C1 and C2 closed; C3, C4 and C5 satisfied. N1 and N2 are not blocking and need no runtime change. Nothing from QRE blocks the FREEZE-5 write on `b05d5ea`.
