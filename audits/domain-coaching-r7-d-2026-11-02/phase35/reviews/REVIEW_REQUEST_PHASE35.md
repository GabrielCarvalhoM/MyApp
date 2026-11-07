# R7-D Phase 3.5 — request for the narrow independent checks of the candidate

**Candidate:** the commit that adds this file (named `CANDIDATE` below).
- Runtime: `5839f83` changes only `CoachingCore/src/r6-adaptation.mjs` from `46934a0`. Its sha256 is `60d91e2259bd3bf41d5f01b085a9b230e0f01c9979c7239a15fec0c7c4a9e310`. `r6-composition.mjs` is unchanged since `1978cc4`.
- Tests: `f8cf12e` adds `CoachingCore/test/r7d-phase35.test.mjs` (T31 to T35). No existing test changed since `46934a0`.
- Instruments, records and evidence: the commits after these, up to `CANDIDATE`.

**What is asked:** two independent checks that name `CANDIDATE`:
1. **SSCTR:** a fresh instance, the domain side.
2. **Quality/Reliability:** an independent instance, the engineering side.

The freeze (`CoachingCore/scripts/freeze-r7d-5.mjs`, prepared and not run) runs only if both pass. It refuses any source, test or harness byte that differs from `CANDIDATE`.

**Binding inputs:**
- `phase34/reviews/ssctr/SSCTR_PHASE34_RECHECK2_R7D.json` (CFR2-01 to CFR2-07; the F01 and F02 closures with their stated expectations);
- `phase34/reviews/engineering/QUALITY_CHECK_R7D_PHASE34_R2.json` (CQ2-1 to CQ2-5; the `requiredFix` of QRE2-P34-01);
- `PREREGISTRATION_R7D_6.md` (Δ21–Δ25, and the Phase 3.5 addendum Δ26–Δ31);
- `phase35/AUTHORIZATION_PHASE35.md`.

## 1. What changed and where to look

| Item | Change | Directed tests (RED on `46934a0`) | Probe evidence |
|---|---|---|---|
| **SSCTR-P34R2-F01** | The evidence reducer exposes the systemic flag its gates applied (`out.systemic`). In `reentryBetween`, running needs `!h.systemic`: through the race touch and race too | T31 (SY1 = SY1g; SY0 and SY1x unchanged) | `p34-recheck2` SY1 = SY1g; DEV-48 |
| **SSCTR-P34R2-F02** | `unreportedBetween(…, except)` and the re-entry history (`stateAtBreak` episode) skip the episode being read. The report a correction supersedes is no known stop (`stopOf` passes `H.g.identity`, as `appliedBetween` already did) | T32 ×3: CU3 = CU3f, and answered = CU3fa; CU1 = CU1f; LC1/LC1d = LC1f; CU2 = CU2f; a week left between by a correction moving the trip later is read from the record; a repeated correction changes nothing | `p34-recheck2` CU*, LC*; DEV-49 |
| **QRE2-P34-01** | `listedBreaks`, `restates`, `naming`, `restating`, `restatedReports`, `restatedBreak` and `restatedKeep`, used in `recordedStop`, `keptBreaks` and `evaluateProgram` (details below) | T33 ×3: R07 by three channels, each followed by the confirmation and REESTABLISH and no later ask; a start before the lift keeps the plan; confirmation first; a wrong-day start stays asked and is superseded by a valid one; R04 by three channels, each equal to the start stated from the outset, idempotent | `qre2-p34-runtime` R04/R07 |
| **Δ23 CQ2-3, CQ2-4** | Tests only | T34 (pinned two-level chain doses: kills DEPTH2); T35 (N01 R08 shape; N05 R03 shape) | `phase35/evidence/MUTATION_PHASE35.json` |

**The QRE2-P34-01 rule:**
- A report that names an earlier break the latest return listed (its `separateBreaks` rows other than `LATEST`) and states every fact of it unchanged, the name and start time apart, restates it. It may state no start time, or a valid one on that break's first day.
- The newest report naming such a break decides. When it restates, every report naming that break is "consumed": it is never a break to apply (`keptBreaks`), and `recordedStop` reads its start time.
- A newest report that changes another fact is not consumed. It is read as before (O-02: asked).
- A review whose own report restates is decided as stating no break, and its own row is visible to the re-read (`ctx.carried`). A return report of that kind with nothing kept is decided by `staleReturn` (I6), else KEEP.
- Nothing else changes.

## 2. Instruments (Δ23 → Δ27–Δ30)

**R7D-HARNESS-7:**
- **P18(e) `SYSTEMIC_WEEK_REENTERED`** (SY1): a necessary reading, inside the runtime's rule. It counts complete reports with recovery ADVERSE, in both sports or in three sessions.
- **P18(f) `UNREPORTED_BETWEEN_BREAKS_APPLIED`** (CU3). It is read on every return applied with separate breaks, corrections and confirmations included.
- **P18(c) restored as sufficient.** It never reads a week the systemic rule may hold (a superset). DEV-48 exposed a latent false block: an adverse optional shakeout was not counted.
- **The NESTED guard** reads "after it" by first days (QH4 → DEV-50, NOT_EVALUABLE).
- **Not-evaluable units are listed** per case in the summary and in validation 7, whatever the case result. The Δ30 adjudication text says the judge recomputes the inner own return.

**Validation 7:**
- 52 DEV cases, with DEV-48 to DEV-50 added; no false block;
- 22/22 sensitivity rows, the two new ones on `46934a0`;
- 54/54 witnesses.

**Interface and brief:** INTERFACE-7 (`author/INTERFACE_DELTA_R7D_7.md`) and brief 6, with the coverage items of Δ29.

## 3. Evidence (`phase35/evidence/EVIDENCE_PHASE35.json`, on `CANDIDATE`)

- suite;
- directed: 3.5 10/10, 3.4 40/40, 3.3 14/14, 3.2 17/17, 3.1 14/14;
- conformance R7-B, R7-B.1 and R7-B.2;
- RED on `46934a0`: exactly the 7 finding tests fail, and the 3 adequacy tests pass;
- mutation 15/15, each killed by its own witness;
- validation 7;
- regressions: diagnostic 18 and generated 100 cases, with no property violation; the only corpus error is R7D-D11, which is pre-existing and identical in Phase 3.4;
- differential against `46934a0`: 170 cases, 168 identical, 2 differing (DEV-48 SYSTEMIC, DEV-49 CORRECTION), 0 unexplained;
- **fidelity** (`FIDELITY_PHASE35.json`): every pinned Phase 3.4 recheck probe rerun. Only the stated closure cases changed. `qre2-p34-harness` changes only in its own result fields under HARNESS-7; steps, returns and doses are identical.

## 4. Questions

**For the SSCTR** (domain; CFR2-01 to CFR2-07):
1. Are F01 and F02 closed as stated, with every listed control unchanged? F02 also includes the re-entry history that the superseded return set (the T32 "moved a week later" test).
2. **The domain side of QRE2-P34-01:**
   - Is the order acceptable? The re-read asks for the start time first, and after the restatement asks for the I6 confirmation only when the state changes.
   - Is it acceptable that confirming the trip first asks for the start time again (the fact is still unstated)?
   - Is the restatement rule right: facts unchanged except the start time, the newest report decides, any other change still asked?
3. **O-P35-01** (Δ31; pre-existing since R7-A.2, also for single-break corrections): a correction that moves a short break over the slot its first report eased leaves the next quality session un-eased. Is it a disclosed residual, or does it block?
4. Does the HARNESS-7 change to P18(c), and P18(e)/(f), read BR-Q3.2(1), BR-Q4.2 and BR-Q6 correctly?
5. Is any number new? The author's answer: none.

**For Quality/Reliability** (engineering; CQ2-1 to CQ2-5):
1. Does QRE2-P34-01 now leave ASK on every path? Check R07 and R04 by every channel, confirmations, the escapes, and the persistent asks that remain only while a genuinely needed fact is unstated. Is anything regressed against R7D-FREEZE-4 on accepted inputs?
2. Are the F01 and F02 code changes correct and scoped, with no other path reached?
3. Are the Δ23 items done: CQ2-2 (guard and DEV-50), CQ2-3 (T34, reporting, Δ30 text) and CQ2-4 (T35)? Are the P18(e)/(f) necessary conditions and the P18(c) sufficient condition sound, with no false-block risk on the DEV corpus or the regressions?
4. Are the mutation, differential, fidelity and evidence adequate? Are the freeze and verify scripts ready?

**For both:** classify every finding as blocking or not. For a blocking finding, say whether it is new, narrow and runtime-only, and give the smallest fix. The Chief decides within the Founder's Phase 3.5 limits.

## 5. Rules

- Work on scratch copies only. Rebuild with `git archive` into new, uniquely named directories under your scratchpad. Never delete anything (`rm -rf` and recursive removal are forbidden) and never touch the repository, the worktrees, the freezes or the history.
- Never run `npm run verify` or any `verify-r*` or `freeze-*` script.
- Write only your own record under `phase35/reviews/ssctr/` or `phase35/reviews/engineering/`: a JSON record and an MD summary, your probes under `probes/` and their outputs under `probes/out/`. Do not commit, push or stage anything.
- The SSCTR does not open `phase35/reviews/engineering/`, and Quality does not open `phase35/reviews/ssctr/`.
- The record names `candidate` (the commit), `disposition` (SSCTR: ACCEPT / ACCEPT_WITH_CONDITIONS / BLOCK) or `verdict` (QRE: READY / READY_WITH_CONDITIONS / NOT_READY), `findings`, `conditionsForFreeze` and, for the SSCTR, `proposedHumanRevalidation`.
- **States, unchanged:** V1_COACHING_AUTHORITY_READY = NO; FINAL_HOLDOUT_EXISTS = NO; F08_OPEN; queue at 235 with no append.
