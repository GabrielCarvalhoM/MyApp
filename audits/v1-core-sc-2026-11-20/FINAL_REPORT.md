# Safety Continuity & Execution Occurrence Closure: final report

**State: CLOSED, freeze emitted. P0 is closed; P1 is partly implemented, with the remainder routed.**

- **The freeze:** **COACHINGCORE-V1-CORE-SAFETY-FREEZE-7** (`CoachingCore/v1/RUNTIME_FREEZE_V1CORE_7.json`). It is additive to FREEZE-6 and binds 49 files at `0c989da`. `node CoachingCore/scripts/v1core-freeze-7.mjs --check` gives 49/49.
- **The runtime:**

| File | FREEZE-6 sha256 | FREEZE-7 sha256 |
|---|---|---|
| `src/v1-f08.mjs` | `f1065bf1…` | `7ec9b6d5…` |
| `src/r6-provenance.mjs` | `b206416f…` | `cd0ede9d…` |

  +33 / −7 against FREEZE-6.
- **The line:** branch `claude/v1-core-safety-continuity`, worktree `.claude/worktrees/v1-core-continuity`, from `48e428f`. **Nothing has been pushed or merged.** Synthetic athletes only.
- **The records:** `CANDIDATE.md`, `CYCLE1.md` (the one correction cycle), `SUCCESSOR_LEDGER.json`, `MAC_PACKAGE.json`, `evidence/`, `bench/`, and `reviews/` (Security, QRE and SSCTR, R1 and R2 each).

| Judge | R1 (`d6348ff`) | R2 (`a0fe31a`, the bound bytes) |
|---|---|---|
| Security | PASS_WITH_CONDITIONS (SEC-SC-01 blocking) | **PASS** |
| QRE | READY_WITH_CONDITIONS (QRE-SC-02 runtime, QRE-SC-01 record) | **READY_WITH_CONDITIONS** (nothing binding) |
| SSCTR | ACCEPT_WITH_CONDITIONS | **ACCEPT_WITH_CONDITIONS** (C-SC-1..3 discharged) |

## The seventeen questions

1. **Was SEC-O1-01b/c closed?** **Yes, for synthetic use** (SEC_SC_R1/R2).
   - A declared stop after the latest readiness declaration keeps SB-1 asking until a later declaration, wherever the stop sits: in force, as a kept voice, or on a history row.
   - This holds for every reason, at zero minutes, and through every correction shape: Security's B1–B5 and the admitted-stop corrections.
   - A stop-less "done" retracted by its own speaker still releases SB-1, and a stop before the declaration is answered by it.
2. **Was C-O1-2 closed?** **Yes** (SSCTR_SC_R1 item 1). A head-on dispute whose every well-formed voice says the session took place is an occurrence for the restart pause, the same reading as a correction in conflict. Done vs not-done is still no occurrence.
3. **Was C-O1-3 corrected or left open?** **Open.**
   - It is reproduced unchanged: `adv2` gives 0/0/1/0, so it under-protects in 3 of 4 orders.
   - Its readers are in `r6-adaptation.mjs`, a protective-dose module that this line does not touch. The policy was already decided (SSCTR_O1_R1 decision A), so what remains is the implementation.
   - It binds before real-athlete weekly-review gating. Owner: Core with QRE, then SSCTR.
4. **Was SEC-O1-02 corrected or left open?** **Corrected** (approved by Security and QRE). An execution is in dispute only while a flagged row in force is on it.
   - `p1` C1 ≡ C3 ≡ C2.
   - Order-dependent SB-1 fuzz cases go from 86/74/72 to 2/1/1. The remainder is the integrity first-claim class, identical on FREEZE-6.
   - QRE-O1-02 is closed.
   - Residual QRE-SC-04: a phantom identity stays in that review's quarantine list, so the session reads CONFLICTED for one review, which errs low. It binds before weekly-review gating.
5. **Did SEC-O1-03 get a policy, and was it implemented?** **A policy, yes, and it is approved. The implementation is partial.**
   - **Implemented:** at most 16 disputing voices per flagged row, plus one per kind f08 reads (stop, took place, did not take place) when no kept voice has it. The excess stays refused with its input hash and writes nothing.
   - **Effect at 2000 reports:** 16 voices and 20.7 KB, where FREEZE-6 kept 2001 voices and 2.6 MB.
   - **Still open:** the bound on agreeing merges (O-SC-1 and SEC-SC-O-3) and the per-report size limit at the app boundary (C-F01-2). **SEC-O1-03 is not declared closed.**
6. **Can an interruption still disappear after a correction?** No, in every shape the three judges reproduced. The open residuals are:
   - SEC-SC-02 (pre-existing): a voice is dated by its row's `observedAt`;
   - SEC-SC-03 (pre-existing): a stop observed on the restart day gives no pause.
7. **Can a disputed session be recognized as having occurred without gaining quantitative credit?** **Yes.**
   - `occurred` feeds only the pause and the last executed day.
   - C-Q08-1 exposure is identical in every differential pass.
   - The lineage matrix is byte-identical.
   - Duplicates count once.
8. **Is adverse recovery counted correctly?** **Not yet** (C-O1-3, open).
9. **Does the quarantine stay consistent?** **Yes for disputes.** A quarantine with no flagged row no longer acts as a dispute. The list itself can still hold such an identity for one review (QRE-SC-04).
10. **Does the history have proportionate limits against abusive growth?** **For disputing voices, yes.** For agreeing merges and report size, **no**: they are open under SEC-O1-03.
11. **Were there dose changes?** **Yes, all authorized by SSCTR** (C-SC-1, also stated in the freeze record's note):
    - **The restart pause** ends at a disputed session every voice says took place. A 35-day pause can read 5 days, run doses equal the absent case, and the strength first exposure goes from 19 to 27 min, as an undisputed run gives.
    - **SB-1 asks** where FREEZE-6 declared.
    - **The SEC-O1-02 same-review reading** now equals the two-review reading: about 90 identities lose credit and 4 gain, each gain inspected and legitimate.
    - **No in-program change:** the lineage matrix is byte-identical. No rule, threshold or formula changed, and Pace Revision stays off.
12. **Were the earlier freezes preserved?** **Yes.**
    - The eleven earlier records are the bytes of `48e428f`.
    - Core FREEZE-1 to -6 differ only in this line's two declared files.
    - Every sporting freeze is 100% the base bytes.
    - `v1core-freeze-6.mjs --check` names this line's files, by design. Its preservation test has a successor, `v1core-sc-freeze.test.mjs`.
13. **Did the regression pass under the approved conditions?** **Yes.**
    - The suite gives **1849 tests, 1807 pass, 42 fail**. The failures are FREEZE-6's 37, unchanged in title, plus 5 by design: four C-O1-2 moves, each with a green successor, and the FREEZE-6 preservation test, which now has its successor.
    - 25 tests are added and all are green.
    - Mutants: 19/19 killed.
    - SC differential: 12 configurations × 3000 cases, **UNEXPLAINED 0** on the normalizer and f08 sides, every invariant 0.
    - RED on FREEZE-6: 12/14 of the first focal tests. RED on `d6348ff` for the cycle-1 tests.
14. **Was there a material performance impact?** **No** (Node only, no iPhone claim).
    - Review ×0.98, corrected restart ×1.03, normalizer ×0.94–1.06, record bytes ×1.00.
    - The abuse shape: ingestion 596 → 120 ms and re-read 34.5 → 0.34 ms.
15. **Which gates still block real athletes?**
    - C-O1-3, before weekly-review gating;
    - the rest of SEC-O1-03 (O-SC-1, the size limit);
    - SEC-SC-02 and SEC-SC-03;
    - QRE-SC-04;
    - C-O1-5 (an athlete act against a device voice: Product/UX);
    - **C-F01-2** (custody), **SEC-CORE-03** (correction authorship) and C-NCC-3;
    - SEC-NCC-03, OOS-1/2;
    - O-SC-S4 (integrity-flagged rows that every voice says happened);
    - **IOS_REVALIDATION_PENDING**.

    Not binding: QRE-SC-03 (two test-only mutants). Proposed and not appended to the human queue: HQ-SSCTR-SC-01..03.
16. **Is the Mac package updated?** **Prepared** (README §13, `MAC_PACKAGE.json`).
    - The bundle is relinked and J5/P16 are unchanged.
    - The 21 earlier journeys are identical in inputs and expected, and three are new: `sc-stop-corrected`, `sc-zero-stop` and `sc-occurrence`.
    - vm-check is ok with JIT and with `--jitless`, and a second run changes nothing.
    - No JavaScriptCore run was made on Windows.
17. **What is the next minimal action?**
    1. The Founder authorizes the push of `claude/v1-core-safety-continuity`, together with the earlier unpushed lines.
    2. The Mac/iPhone run: README §2–§4 and §8–§13.
    3. The app boundary: C-F01-2 custody (with the SEC-O1-03 report-size limit) and SEC-CORE-03 authorship.

    C-O1-3 is a narrow Core item before weekly-review gating. No mission is started here.
