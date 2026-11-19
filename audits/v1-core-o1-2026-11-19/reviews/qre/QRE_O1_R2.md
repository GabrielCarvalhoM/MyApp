# QRE-O1-R2: narrow recheck of QRE-O1-01 and QRE-O1-03

**Judge:** Quality & Reliability Engineer, the same independent instance as R1 and not the author. **Date:** 2026-11-19. Synthetic athletes only.

**Scope, as requested:**
- the three new tests against M6, M7 and M8;
- the suite totals;
- the record diff `git diff 774fcf0 a205cc7 -- audits CoachingCore/test`.

Nothing else was re-judged.

**Rules followed:**
- This file is the only repository write.
- No verify script was run, and no recursive deletion was done.
- Scratch work is in the scratchpad folder `qre-o1-r2-4c9e/`, using a `git archive` extract of a205cc7.

## 1. Verdict

**READY_WITH_CONDITIONS** for the synthetic successor freeze.
- **QRE-O1-01 is CLOSED.**
- **QRE-O1-03 is CLOSED.**
- No condition binds the freeze any longer.
- The conditions that remain are the non-blocking ones R1 named. They bind before real athletes or are tooling only.

## Identities

| Input | Identity |
|---|---|
| Commit | `a205cc7`, a clean tree |
| `src/r6-provenance.mjs` | `b206416f48c8…`, unchanged since 774fcf0. `git diff 774fcf0 a205cc7 -- CoachingCore/src` is empty |
| `test/v1core-o1-conflict-evidence.test.mjs` | `d729d3b2ad9a…`, 18 tests |

## 2. Checks

| # | Check | Result |
|---|---|---|
| R1 | Focal file on the a205cc7 extract | 18/18 pass |
| R2 | My own 12 mutants from R1, run against the focal file alone | **11 of 12 killed.** M6, M7 and M8 are each killed by exactly their new QRE-O1-01 test. M1 to M5 and M9 to M11 are killed as well. M12, an unreachable overwrite (R1), survives, and no test was asked for it. The source was restored and re-hashed afterwards (`b206416f`) |
| R3 | The new tests' shapes | **M6:** my R1 reproducer, in which sx is read before Z on re-read. Z must stay in force across three re-reads. **M7:** a correction and a replay of a voice kept in the same review must equal the outcome of three separate reviews. **M8:** another session carrying a kept voice's activity in the same review is refused, as it is across reviews. All three are meaningful. The author's `evidence/mutation-o1.txt` (9/9 killed, control 18/18) agrees with my run |
| R4 | Full suite on a205cc7 (my run) | **1823 / 1786 / 37.** The failing titles are identical to `suite-cycle1.txt`. The recorded `evidence/suite-r2.txt` shows the same totals and titles |
| R5 | `o1-diff/*.json` re-emitted | In all 12 files, everything except the added `size` field is byte-identical to the 774fcf0 versions. `differential-ext-late-2.json` `size` equals my R1 rerun. Across the 12: record bytes ×1.028 to ×1.042 and the largest row +0 to +295 B, which matches §F |
| R6 | CANDIDATE §C, §D, §F and §G, plus the ledger note | QRE-O1-03(a), (b) and (c) are stated as R1 found them. QRE-O1-02 is filed with SEC-O1-02 before real athletes, and QRE-O1-04 as tooling. Credit is now guaranteed by the pass-wide `unmergedVoiceOnCleanRow` = 0 |
| R7 | QRE-O1-03(d) | The legacy test now asserts that the next head-on report adds its voice (`['A','X']`). M5 now also fails it |

Two wording nits, neither blocking, can be fixed whenever the record is next touched:
- The ledger note still opens with "FREEZE-5's 31 failures are unchanged, at the same locations" before its correction.
- §F says the normalizer time is "×0.98–0.99". The re-emitted files give ×0.99–1.00.

## 3. Conditions

| ID | Blocking (freeze) | Runtime change | Owner | Status or closing evidence |
|---|---|---|---|---|
| QRE-O1-01 | No longer | No | Author | **CLOSED:** three focal tests; M6, M7 and M8 killed by the focal file (R2, R3) |
| QRE-O1-03 | No longer | No | Author | **CLOSED:** record corrected; JSONs re-emitted with `size` (R5 to R7) |
| QRE-O1-02 | No; binds before real athletes, with SEC-O1-02 | Yes (normalizer) | Core, with QRE and Security | As in R1: the reproducer keeps W1, and the P4 invariant reads 0 in all 12 configurations |
| QRE-O1-04 | No | No (tooling) | Author, with QRE | As in R1 |
| Carried | As recorded in CANDIDATE §G | — | — | Unchanged by this recheck |
