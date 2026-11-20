# QRE-SC-R2: narrow recheck of cycle 1 (QRE-SC-02, QRE-SC-01)

**Judge:** Quality & Reliability Engineer, the same independent instance as R1. I did not write the cycle. **Date:** 2026-11-20. Synthetic athletes only.

**Scope:** QRE-SC-02 and QRE-SC-01 on the cycle-1 bytes, and whether anything regresses. R1's other items are not reopened.

**Rules followed:** this file is my only repository write. I ran no verify scripts, made no commits and did no recursive deletion. Scratch work is in the fresh folder `scratchpad/qre-sc-r2-1795185515-29223/`, with a `git archive a0fe31a` extract and a `48e428f` `src` extract as the FREEZE-6 root.

## Verdict

**READY_WITH_CONDITIONS.** Both binding items are closed and nothing regresses. The conditions are the ones R1 recorded as non-binding: QRE-SC-03 and QRE-SC-04 as stated in R1, and SEC-O1-03 PARTIAL as recorded in CYCLE1 §3. Nothing from R2 binds the successor freeze.

## Identities

| Input | Identity |
|---|---|
| Commit | `a0fe31a2eb00…`; runtime commit `aca0f63`; clean worktree |
| `src/r6-provenance.mjs` | `cd0ede9d9d17…`, +4/−1 against `d6348ff`, `keepVoice` only |
| `src/v1-f08.mjs` | `7ec9b6d53be4…`, unchanged |
| Focal tests / `CYCLE1.md` / `sc-differential.mjs` / `mutate-sc.mjs` | `7b8d213c27c9…` / `75d96abae6f4…` / `872661d930f8…` / `4188870ced1d…` |

The only test change is +34/−0 in this line's own focal file. No frozen file is touched. The new `took` predicate equals f08's `did` (`completed===true || minutes>0`).

## Results

| Check | What I ran | Result |
|---|---|---|
| QRE-SC-02 (a), restart pause | R1's `probe-limit.mjs` on the extract | "Not done" last: kept (17 voices), lastExecuted 10-26, pause 15. "Not done" first: the same. That is FREEZE-6's reading in both orders. On `d6348ff`, "not done" last gave 11-05 and 5. **Closed.** |
| QRE-SC-02 (b), SB-1 | R1's `probe-sb1.mjs` | "Done" last: kept (17 voices), SB-1 asks. "Done" first: asks. That is FREEZE-6's reading in both orders. On `d6348ff`, "done" last gave DECLARED. **Closed.** |
| Persistence | The rest of `probe-limit.mjs` | Unchanged from R1: permutation determinism, full and reversed replay with no change, re-read and round-trip stability, the stop beyond the limit kept once and its replay an EXACT_REPLAY, carried over-limit rows kept whole. One shape differs, by design: an excess id reused with facts of a class no kept voice says (here "not done") is now kept as a voice. The record never held the excess, so this reads like any new report, and it is the reading QRE-SC-02 asks for. The CYCLE1 phrase "an excess id reused writes nothing" holds when the reused facts add no class. Precision note only. |
| Mutants | `mutate-sc.mjs` re-run, plus my 12 mutants adapted to the new line (`tools/qre-mutants-c1.mjs`) | Author's: **19/19 killed, control 25/25**, line for line as `mutation-sc.txt`. Mine: 10/12 killed, including **QM8** (`stop:false`, f08) and **QM11** (excess indexed). Survivors, both narrow and both non-binding: **QM8b** (`stop:false` read as a stop in `keepVoice`'s own predicate: at most one extra voice, and f08 still reads no stop); **QM10** (`took` reduced to `completed===true`: an unstopped "not completed, minutes > 0" voice past the limit would be misclassed). The code is correct on both; one assertion each would pin them. Folded into QRE-SC-03. |
| QRE-SC-01a | Recomposed the harness (byte-identical). Reran seed 1 EXT+MONO and seed 2 EXT | Both JSONs are **byte-identical** to the committed `sc-diff/` files. The before-stop arm now uses a sealed `readinessFact` and compares: seed 2 EXT gives 688 OCCURRENCE, 139 STOP_ON_RECORD and 15 both, equal to my R1 sealed run. All 12 SUMMARY lines report UNEXPLAINED 0 and invariants 0. **Closed.** |
| QRE-SC-01b | Read `bench/voice-load.json` against CYCLE1 §3 | The quoted figures (2001→16 voices, 2.62 MB→20.7 KB, 596→120 ms, re-read 34.5→0.34 ms) are the file's. **Closed.** |
| QRE-SC-01c | Read CYCLE1 §2 | The quarantine-list wording is corrected and QRE-SC-04 is recorded. **Closed.** |
| Regression | Full suite on the extract. Titles and failure locations compared with R1 and with `evidence/suite-cycle1.txt` | 1849 tests, 1807 pass, 40 fail, 2 skipped. The 2 skips are the git-dependent freeze tests, which fail in a worktree; that gives 1849/1807/42 as committed. Against `d6348ff`, the only change is the 3 new green tests. Failing titles and failure locations are identical to R1, so nothing is fixed or masked. |

## Findings

No new finding binds the successor freeze.

- **QRE-SC-02:** closed.
- **QRE-SC-01:** closed.
- **QRE-SC-03:** narrowed to QM8b and QM10. Non-binding; owner: the author.
- **QRE-SC-04:** stands as recorded in R1. Non-binding.
- **SEC-O1-03:** QRE accepts the value 16 and the three-class exception. The PARTIAL disposition in CYCLE1 §3 is Security's to hold.
