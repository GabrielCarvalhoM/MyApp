# Regression evidence: Core Safety & Lifecycle (Node 24, Windows)

## Full suite (`cd CoachingCore && node --test`)

| Tree | Tests | Pass | Fail |
|---|---|---|---|
| base `16577b6` | 1603 | 1601 | 2 |
| candidate `0b8e45a` (+ Mac package `ba59d5a`) | 1651 | 1629 | 22 |

The candidate's 48 new tests (`v1core-*`) all pass. Of the 22 failures, 20 are attributed below, by running the failing files on a copy of the candidate with one change reverted at a time.

| # | Failing test(s) | Attributed to | Shown by | Status |
|---|---|---|---|---|
| 2 | `V1RC COACHINGCORE-V1-FREEZE-1 is preserved…`, `I10, V6: every file the two earlier freezes bind…` | earlier amendments | fail on the base | by design (historical snapshot checks) |
| 1 | `the four earlier freezes are preserved on this line…` (V1STR) | this line amends files they bind | — | by design; the successor freeze declares the amendments |
| 1 | `QRE-RFC-A-03 closed: after a restart…` (`v1rfc-cycle:107,114`) | QRE-AIF-02 | asserts that the ids collide | pins the defect; its invariant (no credit) holds |
| 1 | `E-01 from stored records … after a restart …` (`v1rws-e01`) | partly the namespace: the first form hashed the record → **fixed in `r6-index.mjs` (namespace from the caller's intake + instant)**, passes with E-1 reverted; partly E-1 (line 217) | revert E-1 → passes | namespace part fixed; E-1 part below |
| 16 | `HARD GATE … E-1 … still erases`, `LIMIT, open (hard gate E-1…)`, and 14 RWS lineage/withholding tests (`v1rws-e01`, `v1rws-lineage`, `v1rws-final-fix`, `v1rws-fix-forward`, `v1rws-review-fixes`, `v1rfc-evidence`, `v1rc-review-fixes-qre`: D-01, E-01, B-01, C-01, L4-e, lineage matrices EASY/LONG, heat/walk breaks, race rows, adherence, late re-sync, queued review) | **E-1** (`r6-provenance.mjs`) | with `r6-provenance.mjs` reverted to the base, those files fail 1 test instead of 17 | **for the judges**: each pins the frozen behavior "a device re-sync retires the merged row whole", or the E-01 patch's compensation for it (`wholeRow: REPORT_NOT_CARRIED`, the run withheld from pace evidence). With E-1 the corrected row carries every report in force, so the readings return to those of the merged row before the re-sync. Example: D-01, where the row again carries the app's recordings (`SEVERAL_RECORDINGS`) next to the device's whole measurement. **This is a material change of the RWS readings, and it is not declared by design until SSCTR and QRE judge it** |

Nothing here was hidden by editing a test: no historical test or freeze file was changed.

## Preservation beyond the suite

- P0 `lab/oracle.mjs` on this line: the J5 and P16 fixtures are byte-identical, with the amended engine and after the successor bundle relink.
- P0 `lab/focal-oracle.mjs`: the engine results are identical; only the collation section changes (no `localeCompare` call is left).
- `mac/vm-check.mjs`: the device bundle run as a classic script in a V8 vm context equals the Node oracle, with JIT and with `--jitless`. `mac/core-oracle.mjs` is deterministic: a second run gives byte-identical output.

## Performance (Node; `bench/bench.mjs`, base vs candidate interleaved, 5 rounds × 8 reviews, a two-voice run every week, a restart at week 5)

| | base | candidate | ratio |
|---|---|---|---|
| review median | 112.7 ms | 109.1 ms | 0.97 |
| review p95 | 161.8 ms | 166.9 ms | 1.03 |
| record size after the journey | 55 KB | 89 KB | **1.61** |

Review latency is unchanged within noise. The record grows because E-1 keeps each voice's own report inside a merged row (`provenance.parts`). Justification: without it, a correction cannot know what the other voice said; that is the E-1 defect. Impact on the device: the envelope's atomic write was p95 3.1–3.6 ms for 1.1 MB, against a 50 ms budget (14× headroom); SHA-256 over the record is linear in its size. Possible reductions, not done here: drop the part identical to a row that was never merged; store a part's fields only when they differ from the merged row's.

## After the correction cycle (`430c493`)

The full suite gives **1661 tests, 1638 pass, 23 fail**. The 57 `v1core-*` tests all pass, and J5/P16 are byte-identical (P0 `lab/oracle.mjs`).

The 23 failures:
- the 22 of `0b8e45a`, each with the attribution above, none new in kind;
- **one new failure**, from the B-01 fix: `SSCTR-RWS-B-01: the signal survives time…` (`v1rws-fix-forward.test.mjs:316`). It pins that a carried row of a session the plan does not name, with no report fact beside it (a record older than report facts), raises **no** screen. With the B-01 fix, a symptom stop on such a row now **asks** for the existing screen. The direction is more conservative (a screen asked, never one removed), and it is what SSCTR-CORE-B-01 requires ("whatever plan the session belongs to"). It goes to the SSCTR recheck. It is not declared by design here.
