# Safety Continuity & Execution Occurrence Closure: candidate

This is the Founder mission of 2026-11-20, which follows `COACHINGCORE-V1-CORE-SAFETY-FREEZE-6`.
- **Base:** `48e428f`. `v1core-freeze-6.mjs --check` gave 60/60 before any change.
- **Scope:** synthetic athletes only. Nothing has been pushed or merged.
- **Line:** branch `claude/v1-core-safety-continuity`, worktree `.claude/worktrees/v1-core-continuity`.
- **Runtime:** two files, +29 / −6 against FREEZE-6:

| File | FREEZE-6 sha256 | Candidate sha256 |
|---|---|---|
| `CoachingCore/src/v1-f08.mjs` | `f1065bf1…` | `7ec9b6d5…` |
| `CoachingCore/src/r6-provenance.mjs` | `b206416f…` | `8a850a74…` |

## A. The changes

1. **SEC-O1-01b/c (P0), in `v1-f08.mjs`, `restartIntake`.** SB-1 now also asks when the record holds a **declared stop** after the latest readiness declaration.
   - **Where the stop can sit:** in the row in force, in a voice kept on a disputed row, or in a history row that a correction replaced. `stopOnRecord` reads every voice of every row that is not a fact; the normalizer keeps all of them.
   - **What counts as a stop:** any `actual.stop` value other than none or `false` (`statedStop`'s reading). That covers every reason and zero minutes (O-NCC-S1).
   - **What answers it:** only a readiness declaration made after the session. A correction, the speaker rule or a dispute resolution changes the amount (and so the credit), never this.
   - **What is unchanged:** a stop-less "done" retracted by its own speaker still releases SB-1. A stop observed before the declaration is still answered by it. Integrity refusals still never reach the record. Clinical holds are read before SB-1 and are untouched.
2. **C-O1-2 (P0), in `v1-f08.mjs`, `occurred`.** The "(ii)" occurrence (a disputed session whose every well-formed voice says it took place) now holds for a head-on dispute (`CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS`) as well as for a correction in conflict.
   - **Why:** since O-1 both keep every voice (SSCTR_O1_R1 decision A).
   - **Where it is read:** the restart pause, the last executed day (per sport) and SB-1's existing "voice says done" reading.
   - **Never read by:** `executed`, so C-Q08-1 minutes and days, run history, calibration and every dose reader are unchanged.
   - **Still no occurrence:** a "not done" voice, a malformed voice, a flag with one voice (a record written before O-1), and an integrity flag (`EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`, `ACTIVITY_BOUND_TO_TWO_SESSIONS`). These keep the interim reading, which errs long.
3. **SEC-O1-02 / QRE-O1-02 (P1), in `r6-provenance.mjs`.** An execution counts as in dispute only while a **flagged row in force** is on it (`disputedHere`, used for `heldBefore` and for the quarantine refusal).
   - **The defect:** some integrity refusals quarantined an execution with no row flagged on it, and nothing of that quarantine carried to the next review. The cases were an activity of another session, a self-flagged report whose chain is refused, and an event id held by another session's row or by a history row.
   - **The fix:** a later report of that execution in the same review is now read as in the next review. It is no longer refused unkept, and a correction no longer "resolves" a dispute that is not on record.
   - **What is unchanged:** the refusals themselves, the flag on the row that holds the activity or the id, and the pass's `quarantinedIdentities` list. No quarantine is removed.
4. **SEC-O1-03 (P1), in `r6-provenance.mjs`, `keepVoice`.** A flagged row keeps at most `VOICE_LIMIT = 16` voices, counting its own part and merged parts.
   - **Beyond the limit:** a refused report stays refused, with its input hash in `excluded`, and is not kept. The exception is a report that declares a stop while the row holds no stop yet: it is kept once more.
   - **No new writes:** nothing is added to the row for the excess, so a replay changes nothing.
   - **The resolution rule is unchanged** for the voices kept.

f08's clinical paths, the run-format layer, run history, calibration, Race Forecast, Pace Insights, Strength, the coach profiles, programming, availability and every threshold are unchanged. Pace Revision stays off. **C-O1-3 is not implemented** (§D).

## B. Policy decided or proposed

| Item | Source | Status here |
|---|---|---|
| SEC-O1-01b/c rule | SEC_O1_R1 item 6, SSCTR_O1_R2 (c) and its clarifications 1–4 | Implemented as decided |
| C-O1-2 | SSCTR_O1_R1 decision A, C-O1-2 | Implemented as decided. Integrity flags are excluded (author's reading: those flags keep no voice of what raised them). **SSCTR to confirm** |
| SEC-O1-02 | SEC_O1_R1 §5 ("processed as without that quarantine … order- and batch-independent") | Implemented. **Security and QRE to approve** |
| SEC-O1-03 | SEC_O1_R1 §5 (cap the kept voices per row) | **Proposed policy for Security and QRE, implemented narrowly (see below)** |

The SEC-O1-03 policy proposal:
- **The limit.** Measured: the most voices on any row is **3** in the O-1 differential (12 configurations, 3000 cases each) and **6** in the SC differential, whose generator adds stops and so more disputes (`evidence/sc-diff/SUMMARY.txt`, last column). The limit, 16, is more than 2.5 times the larger.
  - Bench (`bench/voice-load.json`): the normal load is byte-identical.
  - At 40 disputing reports the row is 16 voices, 5.5 KB (FREEZE-6: 41 voices, 12.9 KB).
  - At the 2000-report abuse shape it is 16 voices, **20.7 KB** (FREEZE-6: 2001 voices, **2.6 MB**). Timings: see CYCLE1.md §3 (QRE-SC-01b: the figures first quoted here were not those of `voice-load.json`).
- **What it preserves:**
  - identity and integrity, since the refusals are unchanged;
  - the audit trail: every excess report stays in the review's `excluded`, with its input hash;
  - the dispute: still CONFLICTED, no credit;
  - the safety signal: one stop is always kept, and SB-1 needs only one;
  - determinism: within the limit nothing changes.
- **What it costs (stated, not hidden):**
  - Past 16 voices, which voices are kept depends on arrival order, so P7 holds only within the limit. A later resolution must agree with the voices kept, not with the excess. This applies only to the abuse regime.
  - Agreeing merges (`SAME_EXECUTION_DIFFERENT_SOURCE`) also add parts and are not capped here. That is pre-existing (R7-A) and is observation O-SC-1.
  - A report's own byte size belongs to the app boundary (C-F01-2), as SEC_O1_R1 §5 already said. Trimming kept voices to validated fields was not done, because a kept voice that later agrees is merged into the amount.
- **Not closed by this declaration:** Security and QRE decide whether the cap closes SEC-O1-03, or closes it only together with the boundary limit.

## C. Tests and evidence (`evidence/`, `test/`)

- **Focal tests:** `test/v1core-sc-safety-continuity.test.mjs`, **18/18**.
  - 18 SEC-O1-01b/c cases: B1–B5 on a kept stop; an admitted stop corrected away (symptom, time, no reason, zero minutes, duration, completion); a refused correction; a replayed or earlier declaration; an independent clinical hold.
  - The engine journeys: weekly reviews, a round trip, a replay, and the restart asking, then answered by a stated reason or by a later declaration.
  - 14 C-O1-2 cases: run and strength, both orders, a late report, a resolution, a refused correction, duplicates, a re-read and round trip, an interrupted run, and the engine pause.
  - SEC-O1-02 C1/C3 ≡ C2, what stays, and QRE-O1-02; SEC-O1-03.
- **RED on `48e428f`** (`evidence/red-on-48e428f.txt`): 12 of the first 14 tests. The 2 that pass are guard tests that must pass on both.
- **Successors:** `test/v1core-sc-successors.test.mjs`, 4/4; see `SUCCESSOR_LEDGER.json`.
- **Mutants** (`evidence/mutate-sc.mjs`, `mutation-sc.txt`): **14/14 killed** by the focal and successor files, control 22/22.
  - S1–S5: the stop reading.
  - O1–O4: occurrence, including "occurrence credited as executed".
  - Q1–Q2: the phantom quarantine.
  - L1–L3: the limit and its stop exception.
- **Suite:** see `evidence/suite-candidate.txt` and §E.
- **Differential** (`evidence/sc-differential.mjs`, built by `compose-sc-differential.mjs` from the O-1 harness, unedited; `evidence/sc-diff/`). It is the O-1 generator with `STOPS=1`: a quarter of the reports carry a declared stop, a tenth of those at zero minutes.
  - **Configurations:** 12, from seeds 20261119, 1 and 2 × base, EXT, MONO and EXT+MONO, with 3000 cases each.
  - **Normalizer side (FREEZE-6 vs the candidate on the same input).** Every differing pass is PHANTOM_LISTED, PHANTOM_QUARANTINE or PHANTOM_VOICES, all on an identity that a phantom-raising refusal touched. **UNEXPLAINED is 0** (runtime `e66ca21`; `sc-diff/SUMMARY.txt`; seed 1 EXT+MONO also has 2 ORDER_ONLY).
    - Credit: 4 gains, all inspected, and about 90 losses (errs low).
    - The gains are 2 valid device reports that FREEZE-6 lost through a phantom, and 2 self-contradictions settled by the athlete's last correction under the speaker rule. Each equals the reading the same reports get across two reviews.
  - **f08 side (FREEZE-6's f08 vs the candidate's on the same record; an early declaration, none, and one placed just before the latest stop).** Every difference is OCCURRENCE or STOP_ON_RECORD.
  - **Invariants, all 0 in all 12 configurations:**
    - declared where FREEZE-6 asked;
    - C-Q08-1 exposure differing;
    - declared over a stop after the declaration;
    - last executed day moved without a voiced occurrence;
    - rows lost, orphans, double identity or activity, re-read or round-trip instability, nondeterminism;
    - voiceLost, integrityVoiceKept, unmergedVoiceOnCleanRow.
- **Security's probes on the candidate:**
  - `p1.mjs`: B1–B5 ASK (FREEZE-6: DECLARED). C1 and C3 now ASK (§A.3). G spam: 16 voices.
  - `p2.mjs`: ASK.

## D. Not implemented: C-O1-3 (P1)

- **Reproduced on the candidate:** SSCTR's `adv2.mjs` gives the same rows as on FREEZE-6. The weekly `adverseSessions` is 0 / 0 / 1 / 0 across device first, device first + re-sync, athlete first, and athlete first + re-sync. SSCTR's criterion is the same count in all four.
- **Why not here:** the readers are in `r6-adaptation.mjs`: `weekEvidence.kind`, the adverse hold and repeated-adverse REGRESS, which reads `usable`. No component this line changed is among them, and they are protective dose readers (REGRESS, hold). Changing them is a separate prescription-affecting change for SSCTR and QRE.
- **Impact:** only systemic convergence is order-dependent today. REGRESS never hears a conflicted row in any order. It errs toward not protecting in the athlete-first-then-re-sync order.
- **Binding:** before real-athlete weekly-review gating, as recorded. Owner: Core with QRE, then SSCTR.
- **Next decision:** whether the kind of a disputed row is read across its voices (an adverse response that no voice contradicts), and whether REGRESS reads it.

## E. Regression, dose and performance (runtime `e66ca21`)

**Suite: 1846 / 1804 / 42** (`evidence/suite-candidate.txt`). The failures were compared title by title with FREEZE-6 (`audits/v1-core-o1-2026-11-19/evidence/suite-r2.txt`, 1823 / 1786 / 37):
- **FREEZE-6's 37:** unchanged in title. None is fixed and none is masked.
- **New: 5, all by design** (`SUCCESSOR_LEDGER.json`):
  - four C-O1-2 moves, each with a green successor: O-1:146, and cf011r2 A12, B4-B5 and B7;
  - FREEZE-6's own preservation test (`v1core-o1-freeze.test.mjs:13`), which any runtime change after FREEZE-6 fails. Its successor comes with a successor freeze.
- **Added:** 22 tests (18 focal, 4 successors), all green.

**Dose.**
- The lineage acceptance matrix (`lineage-dump.mjs DOSE=1`, 62 rows, both families) is **byte-identical** to FREEZE-6's (`evidence/lineage-candidate.jsonl` vs `audits/v1-core-o1-2026-11-19/evidence/lineage-candidate.jsonl`). No in-program dose moves.
- The only prescription input that moves is the **restart pause** (C-O1-2): a disputed session that took place now ends the pause there. That shortens the pause, which can raise the restart's starting class. The class remains bounded by C-Q08-1 (exposure unchanged) and by C-Q08-2. The SC differential shows this as `OCCURRENCE`, with C-Q08-1 identical in every pass.
- SEC-O1-01b/c adds only a question (SB-1 ASK).
- SEC-O1-02 makes some same-review outcomes equal their two-review outcome (credit −90 / +4, the gains inspected in §C).

**Performance** (Node; `bench/bench-48e428f-vs-candidate.json`, `bench/voice-load.json`; base: the clean FREEZE-6 worktree; no iPhone claim):
- review ×0.98 (p95 ×0.95);
- corrected restart ×1.03 (p95 ×1.04);
- normalizer small batch ×1.06, corrected history ×0.94, re-sync ×1.00;
- merged history ×1.01–1.02;
- record bytes ×1.00;
- the voice-load shapes as in §B.

None is material.

**Mac package:** to be updated only for approved runtime (Phase F).
