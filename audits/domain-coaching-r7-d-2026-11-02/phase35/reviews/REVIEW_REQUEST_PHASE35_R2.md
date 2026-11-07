# R7-D Phase 3.5 — request for the narrow rechecks of the bounded-cycle candidate

**Candidate:** the commit that adds this file (`CANDIDATE` below). It supersedes `8e78b8a`, which the first checks judged and which is never frozen:
- SSCTR-R7D-P35-RECHECK-r1: ACCEPT_WITH_CONDITIONS;
- QRE-R7D-PHASE35-CHECK-r1: NOT_READY on QRE-P35-01.

This is the phase's one bounded cycle (QRE CQ3-1). Whatever these rechecks find, no further cycle follows: a blocking finding closes Phase 3.5 NOT_READY, with no freeze.

**What changed since `8e78b8a`:**
- **Runtime:** `6203dcf` changes only `CoachingCore/src/r6-adaptation.mjs` (QRE-P35-01). `r6-composition.mjs` is unchanged since `1978cc4`.
- **Tests:** `6203dcf` adds T36, T37 and T38 to `CoachingCore/test/r7d-phase35.test.mjs`. T31 to T35 are byte-identical in content, and no other test file changed.
- **Instruments, records and evidence:** the commits after `6203dcf`, up to `CANDIDATE`.

**What is asked:** two independent checks that name `CANDIDATE`, narrow to these changes:
1. **SSCTR:** a fresh instance, required by CFP35-01 for the runtime and test bytes that changed.
2. **Quality/Reliability:** an independent instance.

The freeze (`CoachingCore/scripts/freeze-r7d-5.mjs`, prepared, not run) runs only if both pass. After `CANDIDATE` it accepts nothing but new files under the two review folders (QRE-P35-06).

**Binding inputs:**
- `phase35/reviews/ssctr/SSCTR_PHASE35_RECHECK_R7D.json`: CFP35-01 to CFP35-04, SSCTR-P35-F01 and its `smallestFix`, O01 to O03;
- `phase35/reviews/engineering/QUALITY_CHECK_R7D_PHASE35.json`: CQ3-1 to CQ3-5, QRE-P35-01 to -06;
- `PREREGISTRATION_R7D_6.md`: Δ34 to Δ37, appended after Δ33;
- `phase35/AUTHORIZATION_PHASE35.md`.

## 1. The changes

| Item | Change | Directed tests | Evidence |
|---|---|---|---|
| **QRE-P35-01** (blocking) | `returnAfterPause` re-reads an unnamed report whose days equal the latest episode's through `recordedStop`, as it already did for a named report. The QRE's smallest fix is applied as stated. | **T36** (RED on `8e78b8a`, the only test failing there): QH17, a plain re-send; QH18, R07 then a same-dates confirmation. Controls: the TRAINING_AFTER row is kept; a single-break duplicate stays `SAME_BREAK` / `DUPLICATE` with no separate breaks; a continuity return re-sent with the trip's days asks. | Differential vs `8e78b8a`: 177 cases, 176 identical, 1 differing (DEV-53, trigger DUPLICATE). Mutant P35-M13 is killed by T36. |
| **QRE-P35-05** | Tests only. | **T37:** a listed break's report whose reason text turns clinical is no restatement; after the re-entry week it routes `CLINICAL_HUMAN_REQUIRED` by every channel. **T38:** with an earlier return applied on its own, the restatement answers the latest return's question. | Mutants Q10 and Q15 are killed by T37 and T38. |
| **SSCTR-P35-F01 = QRE-P35-02** | Harness only. P18(e) counts a report only when the reducer reads it ADVERSE given recovery ADVERSE: complete, not partial, and with performance other than OVER, or confounded (`kindOf`, `classify`). | — | DEV-54 (the SYc1 shape) is a false-block control. DEV-48 and W-P18j are kept. |
| **QRE-P35-03** | Harness only. In P17, a restatement ends only the window of an earlier report of the same break. | — | DEV-56 and DEV-57 (controls); witness W-P17f. |
| **QRE-P35-04** | Harness only. P18 leaves a restatement out of its open breaks. | — | DEV-55 (control). |
| **QRE-P35-06** | `freeze-r7d-5.mjs` refuses any commit after the reviewed candidate other than new files under `phase35/reviews/ssctr/` and `phase35/reviews/engineering/`. It checks the whole harness folder against the candidate. | — | — |

## 2. Evidence (`phase35/evidence/EVIDENCE_PHASE35.json`, on `CANDIDATE`)

- **Suite and directed tests:** suite 1005/1005; directed 3.5 13/13, 3.4 40/40, 3.3 14/14, 3.2 17/17, 3.1 14/14.
- **Conformance:** R7-B, R7-B.1 and R7-B.2.
- **RED on `46934a0`:** the 9 finding tests fail and the 4 adequacy tests pass.
- **RED on `8e78b8a`:** only T36 fails.
- **Mutation:** 18/18, each mutant killed by its own witness.
- **Validation 7 r2:** see Δ37.
- **Regressions** (diagnostic 18, generated 100): no property violation.
- **Differential vs `46934a0`:** 177 cases, 169 identical, 8 differing, 0 unexplained.
- **Differential vs `8e78b8a`:** limited to DEV-53.
- **Fidelity:** every Phase 3.4 recheck probe pinned on `46934a0`.

## 3. Questions

**For the SSCTR** (fresh instance; domain side; CFP35-01 for the touched items only):
1. **QRE-P35-01, domain side.** An unnamed same-dates report now reads the whole stop, as the named one does. Is that the right reading? Do the T36 controls keep their domain meaning?
2. **SSCTR-P35-F01.** Does the harness change close it as its `smallestFix` states? DEV-54 is the SYc1 control, DEV-48 and W-P18j are kept, and Δ35 restates Δ27's necessary-condition wording.
3. **T37.** Is the clinical route of a reason text that turns clinical read correctly?
4. **CFP35-02.** Are O01, O02 and O03 recorded faithfully (Δ36)?
5. Is any number new? The author's answer is none.

**For Quality/Reliability** (CQ3-1 to CQ3-5):
1. Is QRE-P35-01 closed? Check the QH17 and QH18 shapes, the RED test on `8e78b8a`, and the differential limited to the shape. Is any other path reached, or is anything regressed against R7D-FREEZE-4 or `8e78b8a`?
2. CQ3-2: are Q10 and Q15 killed?
3. CQ3-3: are the three harness fixes as stated? Check DEV-53 to DEV-57, W-P17f, no false block, and the sensitivity rows.
4. CQ3-4: is the freeze guard adequate? Is the evidence adequate?

**For both:** classify every finding as blocking or not. For a blocking finding, say whether it is new, narrow and runtime-only, and give the smallest fix.

## 4. Rules (unchanged)

- Work on scratch copies only, rebuilt with `git archive` into new, uniquely named directories under your scratchpad.
- Never delete anything (`rm -rf` and any recursive removal are forbidden). Never touch the repository, the worktrees, the freezes or the history.
- Never run `npm run verify` or any `verify-r*` or `freeze-*` script.
- Write only **new** files under your folder. Never modify or overwrite an r1 file there; the freeze refuses any modified file.
  - SSCTR: `phase35/reviews/ssctr/SSCTR_PHASE35_RECHECK2_R7D.json` and `.md`, with probes under `probes2/` and outputs under `probes2/out/`.
  - Quality: `phase35/reviews/engineering/QUALITY_CHECK_R7D_PHASE35_R2.json` and `.md`, with probes under `probes2/` and outputs under `probes2/out/`.
  - Do not commit, push or stage anything.
- The SSCTR does not open `phase35/reviews/engineering/`, and Quality does not open `phase35/reviews/ssctr/`. The r1 record of your own role is a binding input.
- The record names:
  - `candidate`: the commit;
  - `disposition` for the SSCTR (ACCEPT / ACCEPT_WITH_CONDITIONS / BLOCK) or `verdict` for Quality (READY / READY_WITH_CONDITIONS / NOT_READY);
  - `findings`;
  - `conditionsForFreeze`;
  - for the SSCTR, `proposedHumanRevalidation`.
- **States, unchanged:** V1_COACHING_AUTHORITY_READY = NO; FINAL_HOLDOUT_EXISTS = NO; F08_OPEN; queue at 235, no append.
