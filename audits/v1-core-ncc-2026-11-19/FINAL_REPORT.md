# Normalization Consistency Closure (F1, F2, F3): final report

**State: CLOSED, freeze emitted.** The freeze is **COACHINGCORE-V1-CORE-SAFETY-FREEZE-5** (`CoachingCore/v1/RUNTIME_FREEZE_V1CORE_5.json`):
- It binds 60 files at `8cee682` (filesDigest `db1f5510…`).
- The runtime is `963547b`: round-1 candidate `07301f3` plus the one focal cycle. `src/r6-provenance.mjs` sha256 is `408eb9be…`.
- `node CoachingCore/scripts/v1core-freeze-5.mjs --check` gives 60/60.

The freeze is additive. The nine earlier records are the `e704180` bytes:
- FREEZE-1 is 46/47 and FREEZE-4 is 39/40, each with `src/r6-provenance.mjs` declared amended.
- FREEZE-2 is 14/15 and FREEZE-3 is 23/24, with `src/v1-f08.mjs` at FREEZE-4's bytes.
- Every sporting freeze is unchanged.
- By design, `v1core-freeze-4.mjs --check` now names this line's files.

**Line:** branch `claude/v1-core-normalization-consistency`, worktree `.claude/worktrees/v1-core-ncc`, from `e704180`. Commits, in order:
- `07301f3`: candidate
- `6de2004` and `ef490bb`: evidence and records
- `a1c9b56`: R1 reviews
- `963547b`: cycle 1
- `b05d5ea`: cycle records
- `a1eaf13`: R2 rechecks
- `8cee682`: Mac package
- `b71e9f8`: freeze
- this report

**Nothing pushed or merged.**

## A. Normalization Consistency, per finding (details in `CANDIDATE.md` §A)

| Finding | Reproduced on FREEZE-4 | Cause | Fix (`r6-provenance.mjs` only) | State |
|---|---|---|---|---|
| **F1** (P0) | Carried rows in force lost to late reports with earlier clocks. Recounted per case: 210 on seed 20261119, all 210 identically on FREEZE-3; 0 with a monotone clock. | The carried record and the incoming reports were sorted together by availability, so a late report was read before the record it arrived after, and ties went by event id. | The record is rebuilt first (history, then rows in force), then the incoming reports. A correction made before the report it names was available is refused, read against that report's own clock (cycle 1: the clock its part now keeps). | **Closed** for synthetic use |
| **F2** (P1) | One watch activity in force on two sessions, in 22–38 passes per run; dose journey B | A merged part kept no activity; the index read only a row's own activity; a conflict on a retired row was flagged on no output row. | A part keeps its activity (and its clock), a row binds its parts' activities, and the conflict is flagged on the row in force. | **Closed** for records this line writes. Records FREEZE-4 wrote stay unbound (SEC-NCC-03). |
| **F3** (P1) | The quarantine of a carried correction in conflict was lost on every re-read: 627–710 passes per run; the weekly review then read PARTIAL or COMPLETED with nothing new. | Its own carried flag was read as a conflict to resolve. | Whether a correction resolves a conflict reads the quarantine its identity held before it (`heldBefore`). | **Closed** |

## B. Differential evidence (`CANDIDATE.md` §B, `evidence/cycle1/`)

Twelve configurations were run: seeds 20261119, 1 and 2, non-monotone and monotone, with the original generator and the extended one (corrections of merged parts, late device re-syncs).

On the candidate, all of these are 0:
- rows in force lost, orphans, double identities and double activities;
- re-read and round-trip instability of what is in force;
- quarantine lost on re-read;
- nondeterminism;
- unexplained passes, and unexplained incoming fates.

The same harness, run with the round-1 runtime as the candidate, reports 42 unexplained passes: the defect the R1 judges found.

## C. Sporting impact (`CANDIDATE.md` §C)

- No sporting rule, threshold, progression, periodization, calibration, Race Forecast, Pace Insights, Strength rule or coach profile changed. Pace Revision stays off.
- **Dose changes only where FREEZE-4 had lost, borrowed or double-bound evidence:**
  - F1 keeps the athlete's own correction (symptom stops included), flagged; the dose is identical because the session is out of dose either way.
  - F2 refuses borrowed watch evidence. In that journey, restart running goes 45 → 40 min, the bound 49 → 40 and the easy runs 2 → 1. This errs low and matches FREEZE-4 when the watch report holds the row.
  - F3 keeps a disputed session CONFLICTED.
  - Lineage scenario 21 EASY reads as LONG: weekly status COMPLETED, with a disputed history reference (SSCTR-NCC-01, routed).
- Running is counted as EASY + LONG only; walks and strength are reported apart.

## D. Reviews (`reviews/`)

| Judge | R1 on `ef490bb` | R2 on the cycle (`b05d5ea`) |
|---|---|---|
| QRE | NOT_READY (C1 runtime and C2 tests blocking; C3–C5 records) | READY_WITH_CONDITIONS (N1, N2 records/harness only) |
| Security | PASS_WITH_CONDITIONS (SEC-NCC-01 blocking; SEC-NCC-02/-03 not blocking) | PASS |
| SSCTR | ACCEPT_WITH_CONDITIONS (C-NCC-2 record; C-NCC-1 and C-NCC-3 before real athletes) | ACCEPT_WITH_CONDITIONS (C-NCC-R2-1 record only) |

The one focal cycle was used (`CYCLE1.md`). Every record condition is applied in `CANDIDATE.md` and `SUCCESSOR_LEDGER.json`.

## E. Freeze: see the header.

## F. Mac package

`audits/v1-core-safety-lifecycle-2026-11-18/mac/README.md` §11, with hashes in `evidence/MAC_PACKAGE.json`:
- the bundle is relinked (`ce5b01bd…`);
- three journeys are added: `ncc-late-report`, `ncc-merged-activity`, `ncc-quarantine`;
- J5 is unchanged;
- P16 and four earlier journeys move digests only. Two scripts prove 0 differences once the parts' two new fields are removed and the learning model's lists are compared as sets: `evidence/core-journeys-delta.mjs` and `p16-model-order.mjs`;
- `vm-check` is ok with JIT and with `--jitless`;
- a second run is a no-op.

## G. Readiness: the thirteen questions

1. **F1 closed?** Yes, for the synthetic freeze, including the cycle-1 clock correction.
2. **F2 closed?** Yes, for records this line writes. Records FREEZE-4 or earlier wrote keep merged activities unbound (SEC-NCC-03, synthetic only).
3. **F3 closed?** Yes.
4. **Can late events still make valid records disappear?**
   - **On records this line writes: no** (0 losses across twelve configurations and the focal tests). A real conflict still makes the late report refused and the carried row flagged and out of dose.
   - **On records FREEZE-4 wrote with event-id reuse: yes.** The first read by this line refuses or drops a row in force: 17 rows on seed 20261119 and 11 on seed 1, non-monotone only, synthetic. This is declared, and a migration is routed to Core with custody.
5. **Can the same device activity still be credited to different sessions?** Not on records this line writes. Declared edges:
   - QRE C4: an activity a device correction replaced still binds in that review.
   - O-R2-1: an activity refused in one review binds nothing.
6. **Do conflicts stay quarantined after restore?** Yes: re-read ×3 and a JSON round trip, also through the engine's weekly review. Only a valid correction resolves one.
7. **Dose or calibration change?** Only as §C states. Recovered evidence never raises load in any journey. The cycle undid the one increase round 1 had introduced (e5d: bound 40 → 50 on `ef490bb`, 40 now).
8. **Consumer regression?**
   - Passed. The suite gives **1801 / 1770 / 31**, the 31 failures at the baseline's locations plus two by-design entries with successors (`SUCCESSOR_LEDGER.json`).
   - Run history, calibration, forecast, strength exposure, the weekly review and restart pass through the engine tests and the dose probe.
9. **Material performance impact?** No (Node).
   - review ×0.98;
   - restart ×0.99;
   - normalizer ×0.88 to ×1.09, sub-millisecond on a small batch;
   - merged record bytes ×1.017;
   - retained heap equal.

   No iPhone measurement was made.
10. **Earlier freezes intact?** Yes: see the header.
11. **What still blocks real athletes?**
    - C-F01-2 (custody, with SEC-SR2-02).
    - SEC-CORE-03 (correction author).
    - **SSCTR-NCC-01 / C-NCC-1:** a refused head-on conflict leaves the record, so a later correction from the kept source can settle it. Binds before weekly-review gating and run-history use, in the conflict-policy mission.
    - **SEC-NCC-02:** SB-1 does not hear a refused report's symptom stop. Binds before a restart (O-1).
    - **C-NCC-3:** integration must carry the run-format record and use one clock for `reportedAt` and `correctedAt`.
    - SEC-NCC-03, plus the migration of stored records.
    - O-1/B0-F05, the 28-day window contract, local custody, and iOS revalidation.
12. **Mac package up to date?** Yes, prepared (§F). **IOS_REVALIDATION_PENDING:** no JavaScriptCore run was made on Windows.
13. **Next minimal action:**
    1. The Founder authorizes the push of `claude/v1-core-normalization-consistency`.
    2. The Mac/iPhone run, README §2–§4 and §8–§11.
    3. A conflict-policy mission (O-1 with SSCTR-NCC-01, SEC-NCC-02, OOS-1), then C-F01-2 custody, before any real-athlete use.

    No further mission is started here.
