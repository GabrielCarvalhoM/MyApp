# SSCTR review of Safety Continuity & Execution Occurrence Closure, R1 (2026-11-20)

**Verdict: ACCEPT_WITH_CONDITIONS** on `d6348ffe7d12849fddfe7e2bc99e65c56fd3ab86` (runtime `e66ca21`), for the synthetic successor freeze. **No blocking condition.**
- **C-O1-2:** CLOSED for its sporting side.
- **SEC-O1-01b/c:** matches SSCTR_O1_R2 (c). O-NCC-S1 is CLOSED.
- **SEC-O1-02 / SEC-O1-03:** no sporting objection.
- **C-O1-3:** stays open, and its record needs one correction (C-SC-3).
- **Dose:** the lineage matrix is byte-identical. Every dose difference I found is authorized (§5).

## 0. Reviewer, target, method

**Reviewer.** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5, a fresh instance launched by the Chief.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, I made no clinical judgment and I delegated nothing.
- I did not write this candidate, and I did not read the Security or QRE reviews of this mission.

**Literature.** I made no new empirical claim and set no dose, threshold or progression. Each decision checks an admission or consistency rule against rules already decided: C-F01-1 r2 (ii), SSCTR_O1_R1 A–C, SSCTR_O1_R2 (c), C-Q08-1/2, P3 and P7. So I assigned no evidence status, wrote no JSON record and did not run the validator. WebSearch and WebFetch were not loaded.

**Bytes.** I worked only on `git archive` extracts in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/abb6b1a1-a7f0-49c2-8026-065eb68311a4/scratchpad/ssctr-sc-r1-q7m2/`: `xcand` (d6348ff) and `xf6` (48e428f), each with node_modules copied in. Node v24.19.0.

| File | SHA-256 |
|---|---|
| `src/v1-f08.mjs` @d6348ff | `7ec9b6d53be49dadcbd8ab5bd28e49b0df6f146545b2db8c322c0cf488e40997` (FREEZE-6 `f1065bf1…7d37`) |
| `src/r6-provenance.mjs` @d6348ff | `8a850a7410c4c8b57165c684e7a1e154b21ac5926ad0fbb83c67d8f85d243087` (FREEZE-6 `b206416f…ad80a`) |
| `test/v1core-sc-safety-continuity.test.mjs` | `55ae4262029046d1ed3dd3830fc713fa5bcb3b6003195af4937a3e09d0414855` |
| `test/v1core-sc-successors.test.mjs` | `113ba47768860ccba61055d3c9387129b53ee8c29fac99762c7ac5a7dd62d4c6` |
| `CANDIDATE.md` / `SUCCESSOR_LEDGER.json` | `6d0c360e…6084` / `c3a233b3…129f` |
| `evidence/sc-diff/SUMMARY.txt` | `3c97cd9a2f033a707ddbb0621e2db503241568ff1f2550e26e21af7148436acf` |
| `evidence/lineage-candidate.jsonl` | `317b7d9a6c5050cfcf91ec1ee21735c47fd36aa8e4981d448c763079920dfe7d` |

**Runtime diff from 48e428f:** only these two src files, plus the two new test files. No authority, extension or values file changed.

**Commands:**
- Focal file plus successor file: **22/22**.
- `lineage-dump.mjs DOSE=1` on xcand: 62 rows, SHA-256 `317b7d9a…`. That equals both the SC file and the O-1 file, and my O-1 R1 hash.
- `sc-differential.mjs` (STOPS=1 EXT=1, seed 2, GAINED=1): its SC_OUT is **byte-identical** to `sc-diff/sc-ext1-2.json`.
- I did not run `npm run verify`, `verify-r*` or the full suite.

**Probes.** All are synthetic. The new ones are in `…/ssctr-sc-r1-q7m2/probes/`; outputs are in `…/out/`.
- My O-1 probes, unedited: `occ2`, `adv2`, `dose6`, `rwsb01`.
- New `cls.mjs` (`3bacaafd…`): restart class and the first two weeks of doses, by shape.
- New `integ.mjs` (`c55c22ea…`): integrity-flagged rows.

## 1. C-O1-2: occurrence. CLOSED (sporting side)

**`occ2.mjs`, xf6 → xcand.**
- Head-on S21 (device whole, athlete symptom stop) and S21b: pause **2 → 0 weeks**. That is now the same as the correction-in-conflict paths (S21 + re-sync, both athlete corrections), which read 0 on both trees.
- **Done vs not-done head-on: 2 weeks on both trees** (no occurrence).
- Every other line and every `restart` field is identical.

The closing criterion of SSCTR_O1_R1 C-O1-2 is met: the same voices give the same pause whichever voice-keeping path flagged the row.

**No quantitative credit.**
- `occurred` is read only in `restartIntake` (pause, `lastBy`, `done`). It is not exported, and `executed` is unchanged.
- C-Q08-1 still reads `executed` only.
  - `cls.mjs`: the head-on bounded exposure is `runMinutesPerWeek 0, runDaysPerWeek 0`, the same as the absent case. The undisputed case gives 10 / 1.
  - Focal l.131: `recent` equals ABSENT.
  - SC differential: `recentDiffers` is 0 in all 12 configurations.
- The lineage matrix is byte-identical. `dose6`, `rwsb01` and `adv2` are byte-identical xf6 vs xcand, so run history, calibration and progression do not move.
- Duplicates count once (focal l.153). Strength is covered: a load dispute sets `bySport.STRENGTH` and leaves RUN untouched (l.165).

**Restart consequence (`cls.mjs`).** The shape: an undisputed run 35 days back, then a head-on dispute 5 days back, restart with a stated nonclinical reason.
- **The pause:** 5 weeks / 35 days → 0 weeks / 5 days, the same as the undisputed device run.
- **The run doses:** identical on both trees and equal to the absent case (`R15:EASY ×3`, then `R20:EASY ×3`). The bounded zero exposure sets them, not the pause.
- **The strength first exposure:** 19 → 27 min (`STRENGTH_FULL_A/B`), equal to the undisputed reading. The overall pause is read across sports, and this record holds no strength row (O-SC-S1).
- **Unchanged:** without a stated reason, the restart still ASKs `athlete.pause.reasonCategory` in every shape and on both trees.

**Judgment.** A session that every source says took place ends the pause; treating it as absent overstated the pause and imposed an unnecessary return reduction. It is the C-F01-1 r2 (ii) reading already accepted for a correction in conflict. The start stays bounded by C-Q08-1, because its amount is never exposure, and by C-Q08-2. **Accepted.**

**Integrity flags excluded: accepted as interim, on a different ground than the author's.**
- `integ.mjs` shows integrity-flagged rows **do** later hold several voices:
  - `ACTIVITY_BOUND_TO_TWO_SESSIONS` on Z, with parts [Z, ZA], both done;
  - `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS` on X, with parts [A9, X], both done.
- So "keeps no voice of what refused it" is true of the refused report only.
- My ground: an integrity flag disputes the **attribution** of the evidence (which session an activity or id belongs to), not only its amount. Occurrence of this session is then not established by the record.
- Cost: the pause errs long (15 vs 9 days in `integ`), FREEZE-6-identical, and no dose reader moves. See C-SC-2.

## 2. SEC-O1-01b/c, the sporting side: matches R2 (c)

| R2 (c) clarification | Implementation | Status |
|---|---|---|
| 1. Every declared stop counts | `stopped` = `statedStop`'s reading (any value but undefined/null/false). TIME, no reason and zero minutes are tested (l.70–87) | Matches |
| 2. Zero-minute stops (O-NCC-S1) | Asks in force and as a kept voice (l.88–95) | **O-NCC-S1 CLOSED** |
| 3. Independent of C-O1-2 | `trainedAfter` ORs `stopOnRecord` with the unchanged `claimsDoneIn`. No `occurred` read. A zero-minute stop is not a "took place" voice, so it never creates an occurrence | Matches |
| 4. The athlete's correction settles the amount, never readiness | B5 resolves to S2 "not done", unflagged, and SB-1 still asks (l.64–69) | Matches |

**Over-asking: none unacceptable.**
- A stop before the declaration is answered by it. A stop-less "done" retracted by its own speaker still releases. Integrity refusals never count (l.96–105).
- A later declaration always answers, so there is no permanent block.
- The SC differential adds `ready:STOP_ON_RECORD` in 1 to 22 of 3000 cases per configuration, with `declaredOverStop` and `declaredWhereOldAsked` both 0.

**Precision.** "Asking" is SB-1's existing question. Besides a later declaration, it is also answered by a pause reason the athlete states, screened clinical first (focal l.198, V1CP Fix-Forward SB-1, unchanged). R2's "until a later readiness declaration" is to be read that way. This is not a divergence (O-SC-S2).

## 3. SEC-O1-02 / SEC-O1-03: no sporting objection

**SEC-O1-02.** The 3 gains of seed 2 EXT, which I reran:
- **(a)** A valid device report of 41 min. FREEZE-6 refused it through a phantom quarantine raised by an athlete report that was refused for integrity (P3: that report's content never counts).
- **(b, c)** Athlete self-correction chains settled by the athlete's own last correction (SSCTR_O1_R1 C, speaker rule).
- Each equals the two-review reading (P7). The losses err low.

**SEC-O1-03.** The voice limit applies only in an abuse regime: the most parts measured on any row is 6, and the limit is 16. The row stays CONFLICTED with no credit, and one stop is always kept, which is all SB-1 needs. The residual is O-SC-S3.

## 4. C-O1-3: disposition adequate in owner and binding; the record needs correcting

`adv2.mjs` is byte-identical on xf6 and xcand: 0 / 0 / 1 / 0. Owner (Core with QRE, then SSCTR) and binding (before real-athlete weekly-review gating) are as I recorded. Two corrections (C-SC-3):
- **(i) The direction.** By my criterion (an ADVERSE response that no kept voice contradicts; here the device response is UNKNOWN), the count should be 1 in all four orders. The runtime under-protects in **3 of 4** orders: device first, device first + re-sync, athlete first + re-sync. It does not under-protect "in the athlete-first-then-re-sync order" alone.
- **(ii) The "next decision" is already decided.** SSCTR_O1_R1 A decided it: the response is heard by the weekly adverse count and systemic convergence, the adverse hold and repeated-adverse REGRESS, never by credit, progression or calibration. What remains is the implementation in `r6-adaptation.mjs`, QRE review and an SSCTR dose recheck.

## 5. Dose differences and authorization

| Difference | Where seen | Authorization |
|---|---|---|
| Restart pause shorter for a disputed session every voice says took place (2 → 0 weeks; 35 → 5 days) | `occ2`, `cls`, ledger entries O-1:146, A12, B4-B5, B7 | C-O1-2 (SSCTR_O1_R1 A). **Authorized** |
| Strength first exposure at restart 19 → 27 min, in the shape where the disputed run is the only recent row and the record holds no strength row. Equal to the undisputed reading; run doses unchanged | `cls` | Consequence of C-O1-2. **Authorized**; O-SC-S1 |
| SB-1 ASK where FREEZE-6 declared: a question, no dose | focal, SC differential `STOP_ON_RECORD` | SEC-O1-01b/c (SSCTR_O1_R2 (c)). **Authorized** |
| Completion credit equalized to the two-review reading (−~90 / +4 across 12 configurations) | `SUMMARY.txt`; seed 2 EXT rerun identical | P7 (SSCTR_O1_R1 §1) with P3/C. **Authorized** |
| In-program lineage (62 rows), `dose6`, `rwsb01` | byte-identical | None |

**What did not change:** no rule, threshold or formula, and no authority, values or extension file. Pace Revision stays off. Race Forecast, Pace Insights, Strength, calibration and run history are untouched.

## 6. Conditions and observations

| Id | What | Binding | Runtime change | Owner |
|---|---|---|---|---|
| C-SC-1 | The successor-freeze record states the §5 table, including the strength 19 → 27 consequence and that it equals the undisputed reading | Successor freeze (record) | No | Author with Chief |
| C-SC-2 | Correct the stated reason for the integrity exclusion (CANDIDATE §A.2/§B; the f08 comment at its next runtime touch): integrity-flagged rows can hold several "done" voices; they are excluded because attribution is disputed. Interim reading kept (errs long) | Closing record | No (comment later) | Author with Chief |
| C-SC-3 | Correct CANDIDATE §D as in §4 (i) and (ii). C-O1-3 itself stays open | Closing record; C-O1-3 before real-athlete weekly-review gating | C-O1-3: yes, `r6-adaptation.mjs` | Author with Chief; C-O1-3 Core with QRE, then SSCTR |
| O-SC-S1 | Pre-existing: the restart pause is read across sports, so a sport with no row on record takes the other sport's pause. Not introduced here | Observation | — | QRE / Core, then SSCTR |
| O-SC-S2 | Pre-existing: SB-1's question is the generic pause reason and does not name the recorded stop. A stated nonclinical reason answers it over a recorded symptom stop; the run-format warning-sign screen (C-NCC-3) is the stop's reader | Observation | — | Product/UX with Security |
| O-SC-S3 | Beyond VOICE_LIMIT, a "not done" voice can be dropped, depending on order, so occurrence could be read (pause only, abuse regime). If the cap is kept, consider keeping one occurrence-denying voice once, as with the stop | Observation | Possibly | Security / QRE |
| O-SC-S4 | Next decision for integrity-flagged rows whose every voice says done, including a voice independent of the contested activity or id | Observation | — | Security with Core, then SSCTR |
| Carried | C-O1-5, O-O1-1, C-F01-2, SEC-CORE-03, C-NCC-3, C-SR2-5 | Unchanged | — | As recorded |
| Discharged | C-O1-2 (sporting side), O-NCC-S1 | — | — | This review |

## 7. Proposed human-queue items (proposed only; not written)

| Proposed id | Decision | Status if adopted |
|---|---|---|
| HQ-SSCTR-SC-01 | C-O1-2 as implemented: a disputed session whose every well-formed voice says it took place ends the restart pause and never counts as exposure; integrity flags excluded (interim). Fulfils HQ-SSCTR-O1-02 | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |
| HQ-SSCTR-SC-02 | SEC-O1-01b/c as implemented: every declared stop after a readiness declaration (zero minutes included) keeps SB-1 asking; no correction or resolution answers it. Fulfils HQ-SSCTR-O1-04 | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |
| HQ-SSCTR-SC-03 | SEC-O1-02: a same-review reading equals its two-review reading (credit −~90 / +4 in the differential) | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |

**Re-review triggers:**
- any change to `occurred`, `VOICED_DISPUTES`, `stopOnRecord`, `disputedHere`, `keepVoice`/VOICE_LIMIT or the restart pause readers;
- the C-O1-3 implementation;
- real-athlete data on dispute frequency.

**Expiry:** at the successor-freeze closing, or at the first trigger.
