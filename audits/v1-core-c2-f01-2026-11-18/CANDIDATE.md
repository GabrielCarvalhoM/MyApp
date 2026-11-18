# CORE-C2-F01: restart sizing fix, candidate record

**Mission:** Founder, 2026-11-18. Fix only CORE-C2-F01 (closure-2, `audits/v1-core-safety-closure-2-2026-11-18/CANDIDATE.md` §4a).

**Line:** branch `claude/v1-core-c2-f01`, worktree `.claude/worktrees/v1-core-c2-f01`, from `d92aa88` (the last commit of closure-2). The candidate is **`576e40c`**. Nothing is pushed.

**Frozen inputs, untouched:**
- `COACHINGCORE-V1-CORE-SAFETY-FREEZE-1` (`CoachingCore/v1/RUNTIME_FREEZE_V1CORE_1.json`) and the five earlier records are the bytes `d92aa88` holds.
- The 47 files FREEZE-1 binds are unchanged (47/47).

## 1. Defect and cause

`restartIntake` (`CoachingCore/src/v1-f08.mjs`) reads the stored record as given. Its `executed()` predicate kept rows with `superseded:true`, the rows a correction replaced, which `normalizeObservations` keeps as history (`supersededRows`, R7-A). So:
- C-Q08-1 counted the replaced row and its correction both as training done in the last 28 days. That raised the "record shows" ceiling, so the intake's stated exposure was bounded less or not at all.
- The same predicate set the pause (`lastBy`, `done`) and `trainedAfter`, so a replaced row could also shorten the pause.

Every other V1 reader already excludes these rows (`superseded!==true`): `v1-run-calibration`, `v1-run-forecast-index`, `v1-run-format-index`, `v1-run-history` and `v1-strength`. The restart intake was the one reader that did not.

## 2. Change (one file, `src/v1-f08.mjs`)

- `executed()` adds `o.superseded!==true`. Only rows in force show an execution, for C-Q08-1, the pause and `trainedAfter`.
- The C-Q08-1 28-day window counts each `eventId` once (`once()`). That way a record a client holds twice (the same event duplicated) is not counted twice. Days already counted once, because they go through a `Set`.

**Unchanged:**
- The rule C-Q08-1 itself. The stated exposure is only ever lowered to what the record shows, never raised. Unknown stays unknown.
- C-Q08-2/3, every HOLD and CLINICAL_HUMAN_REQUIRED path, the record returned (`carried.record`, the replaced rows included, byte-for-byte), and `priorCapacity.observations`, which is context only.
- No dose table, progression, periodization, calibration, AM/PM, Race Forecast, Pace Insights or Strength Intelligence. The JavaScriptCore architecture is unchanged, and Pace Revision stays off.

## 3. Values before and after

| Scenario | Before (`d92aa88`) | After (`576e40c`) | In-force control | Evidence |
|---|---|---|---|---|
| Closure-2 probe p14 (runner rw-16, the four quality runs of weeks 3–6 corrected, with or without the watch import) | easy runs 60/60/60, long 100 | **50/50/50, 100** | 50/50/50, 100 (direct merge, no correction) | test `e2e: the values before and after` |
| AIF athlete, all runs of weeks 0–2 corrected (12 replaced rows), restart at day 24 | record shows 292 min/week, so the stated 200 is **not** bounded; runs 40/40/40, long 80 | record shows 146; the stated exposure is bounded to 146 min/week and 3 days; runs **25/25/25, long 60** | 146 min/week; 25/25/25, 60 | Mac journeys `restart-f01` / `restart-f01-control`, `core-oracle.mjs` |

The difference is exactly the replaced rows counted a second time. With them removed from the record, the frozen code gives the control's values too (closure-2 probe, "taking the superseded rows out gives 50 again").

## 4. Tests (`CoachingCore/test/v1core-c2f01-restart-sizing.test.mjs`, 18)

**RED on `d92aa88`:** 14 of 18 (`evidence/red-on-d92aa88.txt`). The four that pass there are the no-reduction guards: no correction; reverse order and double JSON round trip; legacy rows; never raised, unknown stays unknown. **GREEN here:** 18/18.

The oracle of every case is the same restart over a record holding only the executions in force.

| Mission case | Test |
|---|---|
| 1 no corrections | unit 1 (unchanged values) |
| 2 one correction / 3 several | e2e (4 shapes), e2e `several corrections` (×2, ×3), unit 2-3 |
| 4 device correction | e2e `watch import` correction, unit 4-5 |
| 5 athlete-declared correction | e2e (athlete), unit 4-5, including a correction to "not done", which leaves no execution and so does not shorten the pause |
| 6 two complementary reports | e2e (app + watch, merged E-1 row), unit 6 (merged row with `parts`, then corrected) |
| 7 after persistence and restore | e2e `late` (the correction arrives the next week after a JSON round trip), unit 7 |
| 8 replaced and current mixed | unit 8, three orders; eight distinct executions in force give the same as eight with no correction (no reduction) |
| 9 plan A → B → C | e2e (C made from the record B returned; replaced rows still travel), unit 9 (rows of three plans) |
| 10 duplicated or late events | unit 10 (the same event twice counts once; a late-listed row counts), e2e reversed record |
| 11 rows without newer metadata | unit 11 (no `parts`, `provenance`, `response` or `superseded` field: counted as before) |
| 12 clinical or adverse | unit 12 (a clinical break still answers CLINICAL_HUMAN_REQUIRED first; an adverse response on a replaced row stays in the returned record) |

`v1core-c2f01-freeze.test.mjs` runs `scripts/v1core-freeze-2.mjs --preserved`. It is the successor of closure-2's `v1core-freeze.test.mjs:11`, see §5.

## 5. Regression (`576e40c`, Node 24, worktree)

- **Full suite before the freeze test was added:** **1708 tests, 1684 pass, 24 fail**.
  - 23 are exactly closure-2's historical failures, at the locations of `SUCCESSOR_LEDGER.json`. `v1rws-lineage:146` counts twice, as two subtests.
  - The 24th is `v1core-freeze.test.mjs:11`, closure-2's own FREEZE-1 preservation step. Its base is `16577b6`, and it now names `src/v1-f08.mjs` as amended and undeclared. That is by design, the same way `v1rc-calibration:325`, `v1rws-engine:157` and `v1str-freeze:15` failed when closure-2 amended their files.
  - Its successor is `v1core-c2f01-freeze.test.mjs`, which passes. The six earlier records are the `d92aa88` bytes, FREEZE-1 is 47/47, V1-FREEZE-1 is 197/198 plus `v1-f08.mjs` declared, every other record is whole, nothing else changed since `d92aa88`, and there is no untracked file.
  - Mapped in `F01_SUCCESSOR_LEDGER.json`.
- **Restart, provenance/E-1, persistence and clinical tests:** inside the suite, with no new failure. The closure-2 successors (B-01-R, R2-01, SEC-CORE-14, C-C1/C-C2) all pass.
- **J5/P16:** after relinking the bundle, `lab/oracle.mjs` leaves `j5.json` and `p16.json` byte-identical.
- **`core.json`:**
  - the eight earlier journeys are identical in input and expected values;
  - the anchors, driver and module ids are identical;
  - `localeCompare` calls: 0;
  - `focal.json` changes only `bundleSha256`;
  - `vm-check` is ok, with JIT and with `--jitless`.
- **Node bench** (`bench/bench.mjs`, `d92aa88` vs this tree, 5 interleaved rounds):
  - review median ×1.009, p95 ×1.003;
  - restart from a corrected record: median 29.9 → 31.3 ms (×1.047), p95 ×1.003;
  - record ×1.000.

  None of this is material, so no physical PerformanceTests are needed.

## 6. Security

The change narrows what one pure reader counts. It adds no input, field, trust rule, custody or authorship. The replaced rows are still returned and are not deleted, and the strip and validation in `r6-provenance` are untouched. So no Security review is requested; the mission's "only if material" clause applies. SEC-CORE-03 (the author of a correction) stays open as before: a correction by another voice still counts as the row in force, exactly as every other V1 reader already reads it.

## 7. For the judges

- **SSCTR:** is counting only rows in force, with each event once, the right reading of "what the record shows executed" for C-Q08-1? And is the change of dose confined to removing double credit?
- **QRE:** is the fix minimal and correct? Is the coverage of cases 1–12 sufficient? Is the regression and preservation evidence sound?

Out of scope: the dose rule itself, and SEC-CORE-03.
