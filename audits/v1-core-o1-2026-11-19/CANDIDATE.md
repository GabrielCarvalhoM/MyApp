# O-1 Conflict Evidence & Safety Policy Closure: candidate (after cycle 1)

Founder mission of 2026-11-19, after `COACHINGCORE-V1-CORE-SAFETY-FREEZE-5` (`f40fbe1`, `v1core-freeze-5.mjs --check` 60/60 before any change). Synthetic athletes only. Nothing pushed or merged.

- **Line:** branch `claude/v1-core-conflict-policy`, worktree `.claude/worktrees/v1-core-o1`.
- **Runtime:** `CoachingCore/src/r6-provenance.mjs` only (+24 / −3 against FREEZE-5). Final sha256 `b206416f…`, from commit `4ccca2d`.
- **Commits, in order:**

| Commit | What |
|---|---|
| `1d418d1` | Candidate |
| `889d2ae` | POLICY r1 |
| `24ca2ae` | The P4 amendment, found by the O-1 differential before any verdict |
| `4ccca2d` | R1 reviews and cycle 1 (SEC-O1-01a) |
| *the commit carrying this file* | Records, successors and evidence |

## A. The change

1. **`keepVoice`.** A report that passed every check and was refused only for a conflict is kept as a voice of the flagged row in force. It is stored as a `provenance.parts` entry in the existing part format, plus its input hash. "Refused only for a conflict" covers two cases:
   - a head-on conflict, `DUPLICATE_CONFLICT_QUARANTINED`;
   - a report on an execution already in dispute, `IDENTITY_QUARANTINED_BY_CONFLICT`, kept only when a flagged row exists and the report's device activity belongs to no other execution.

   Its activity binds to that execution (F2). It is never merged into the amount, never in `mergedSourceIds`, and its refusal stays in `excluded`.
2. **The speaker rule (`speakerOf`).** While a dispute stands on the identity, a correction from a known speaker (one device activity, or the athlete through `MANUAL`/`SELF_REPORT`) is that speaker's word for all of that speaker's voices. Every other speaker's voice is carried and must agree, whichever row id the correction names. A correction from an unknown speaker keeps E-1: only the named report is replaced.
3. **The flagged row answers for the dispute** (`voicesOf`). This applies even when the report the correction names is no longer one of that row's voices, and for any speaker. It came in two steps: `24ca2ae` for known speakers, then cycle 1 (SEC-O1-01a) for unknown speakers as well.

f08, the run-format layer, run history, calibration, Race Forecast, Pace Insights, Strength, the coach profiles and every threshold are unchanged. Pace Revision stays off.

## B. Policy as decided (POLICY.md r1, with the judges' replacements; this section is r2)

- **Adopted by both judges:** P1, P3 and P5; B and C (SSCTR); P4 (SSCTR, and Security for amounts only).
- **Decision A, occurrence (SSCTR replaces P2).** A disputed session whose every kept voice says it took place counts as occurred for the pause, as C-F01-1 r2 (ii) already rules. P2 (a head-on dispute is no occurrence) stays the interim reading for this freeze because it errs long. Implementation is **C-O1-2**.
- **Decision A, recovery/RPE (SSCTR).** An adverse response no voice contradicts must reach the protective readers in every order, never as credit. Today the weekly adverse count depends on who spoke first (pre-existing in kind). Implementation is **C-O1-3**.
- **Corrections to POLICY r1 (C-O1-4):**
  - §3 B "Recovery: no adverse-recovery reading" is wrong. The flagged row's displayed response feeds `weekEvidence.kind`, so the reading depends on which report heads the row (C-O1-3).
  - P7 "that amount is never dose" is wrong. The displayed amount and response feed that reader, and the long-run sizing source can move when disputed evidence is withdrawn (row 18 LONG 365 → 360, O-O1-1).
  - P7 order independence does not hold for SEC-O1-02 (a phantom quarantine, pre-existing): 86 of 1500 Security fuzz cases, down from 138 on FREEZE-5.
- **Security items 6–7 (replaces P6's last sentences).**
  - A declared stop on record after the latest readiness declaration keeps SB-1 asking until a later readiness declaration. No correction, merge, speaker rule or dispute resolution answers it.
  - The speaker rule may settle amounts, never a safety signal. It is not an authentication boundary.
  - This rule is **SEC-O1-01b/c**: not implemented here, it binds before a real-athlete restart and needs SSCTR's agreement (the SSCTR reviewed before it existed). Until then, a correction from the athlete's own source quality that names another report can still set aside a kept stop. That is the same class as SEC-CORE-03.

## C. Tests (`evidence/`, `test/`)

- **Focal tests** (`test/v1core-o1-conflict-evidence.test.mjs`): 15/15 on the candidate.
  - RED on `f40fbe1`: 8 of the first 12 (`evidence/red-on-f40fbe1.txt`).
  - The P4 test is RED on `1d418d1`.
  - The SEC-O1-01a test is RED on `24ca2ae`, so it kills the `mine?…:null` mutant.
- **Successors** (`test/v1core-o1-successors.test.mjs`): 4/4. See `SUCCESSOR_LEDGER.json`.
- **Suite:** **1820 / 1783 / 37** (`evidence/suite-cycle1.txt`).
  - 1801 = FREEZE-5's tests; +15 focal; +4 successors.
  - 31 of the failures are FREEZE-5's own, at the same locations.
  - 6 are by design. Five have green successors; the sixth, freeze preservation, has its successor with FREEZE-6.
- **Judges' focal runs:**
  - SEC-R2 24/24, f08 15/15, R7-D phase 3.3 14/14;
  - cf011r2 35/36. The failing test is the pre-existing orphan test, which fails identically on `f40fbe1`;
  - Security's `p2.mjs` ends in ASK.

## D. Differential vs FREEZE-5 (`evidence/differential.mjs O1=1`, `evidence/o1-diff/`)

It is the NCC harness (same generator, seeds and fate accounting) with O-1 classes and invariants added.

**Coverage:** twelve configurations (seeds 20261119, 1 and 2; non-monotone and monotone; base and EXT), 105,754 passes, 19,537 of which differ.

Every candidate invariant is 0 in all twelve:
- the O-1 ones: voiceLost, integrityVoiceKept, unmergedVoiceOnCleanRow;
- FREEZE-5's: rows lost, orphans, double identity, double activity, re-read and round-trip instability, nondeterminism, unexplained quarantine.

**UNEXPLAINED is 0.** The classes, totalled:

| Class | Passes | What it covers |
|---|---|---|
| VOICE_KEPT | 14,063 | Only the voices and input hashes differ |
| DISPUTE_STAYS | 1,915 | SSCTR-NCC-01 |
| VOICE_AGREES | 1,318 | A kept voice agrees and merges |
| CHAIN_TO_KEPT_VOICE (alone or combined) | 1,282 | A correction of a kept voice is now found, then meets the existing rules |
| SAME_DOSE_PROVENANCE | 363 | |
| VOICE_CARRIED | 163 | P4: FREEZE-5 dropped another speaker's voice at a resolution |
| SPEAKER_RULE | 155 | |
| REPLAY_OF_KEPT_VOICE | 91 | FREEZE-5 read a second copy of a refused report as new, and it settled the conflict it raised |
| ID_HELD_BY_KEPT_VOICE | 83 | |
| ACTIVITY_OF_KEPT_VOICE | 70 | A borrowed activity is refused |
| FORK_AFTER_SPEAKER_RULE | 16 | |
| OCCURRENCE_PER_SSCTR_A | 13 | |
| SAME_DOSE_FLAG_LABEL | 4 | |
| OWN_SPEAKER_E1 | 1 | Observation O-O1-A |

**Credit direction (`credit` in each JSON):**
- The candidate credits a session FREEZE-5 held only in classes where the voices now agree: VOICE_AGREES, CHAIN_TO_KEPT_VOICE ending in agreement, and SPEAKER_RULE.
- It never credits through a kept voice that disagrees (unmergedVoiceOnCleanRow 0).

The classes were written while reading the residual passes. Each predicate is in the file and checkable; QRE should judge whether any class is too wide.

## E. Sporting impact (SSCTR_O1_R1 §4; `evidence/lineage-diff.txt`, `lineage-dump.mjs DOSE=1`)

Six of 62 lineage matrix rows move, all lower, and the cycle-1 runtime reads byte-identically to `1d418d1`:

| Rows | What moves |
|---|---|
| 18 and 21, both families | CONFLICTED is kept and the run-history fact goes 1 → 0. LONG w+2 `QUALITY:34` → `EASY:65`; EASY w+3 one EASY 70 → 65. The next long run is unchanged (100 min, 16 km). Over six weeks EASY rejoins the control from w+4, and LONG lags one week without exceeding the control's peak (SSCTR `dose6`) |
| 18 LONG | The long-run sizing source S2 goes 365 → 360 s/km; minutes and km unchanged (O-O1-1) |
| 19 | Reads exactly as rows 08/10 |

The RWS-B-01 shape is CONFLICTED in every order. FREEZE-5 credited a 100-min run-history fact in 3 of 6 cases that the device's 30 min / 5 km contradicts.

R7-D T4 and the NCC F1/F3 shapes change no dose.

## F. Performance (Node; no iPhone claim)

Engine journeys (`bench/bench-f40fbe1-vs-candidate.json`):

| Measure | Ratio |
|---|---|
| Review, median / p95 | ×0.98 / ×0.96 |
| Corrected restart | ×1.01 / ×1.02 |
| Normalizer, small batch | ×1.02 |
| Normalizer, corrected history | ×1.01 |
| Merged-history merge / re-read / late batch | ×1.00 / ×1.01 / ×1.01 |
| Record bytes (journeys) | ×1.00 (they hold no dispute) |

Dispute-heavy generated records, 3000 cases (`differential.mjs` `size`):
- record bytes ×1.028 (base) and ×1.039 (EXT);
- the largest row grows by at most +111 bytes;
- normalizer time ×0.98–0.99.

Unbounded voice spam (SEC-O1-03) is routed: 2000 voices make a 2.6 MB row.

## G. Conditions and routed items (none is closed by declaration)

| ID | Binds | Runtime | Owner |
|---|---|---|---|
| **SEC-O1-01a** | Freeze | Yes: **done in cycle 1** | Core; Security narrow recheck |
| C-O1-1 (successors, record) | Freeze | No: **done here** | Author |
| C-O1-4 (POLICY corrections) | Record | No: **§B here** | Author |
| C-O1-2 (occurrence for the pause, decision A) | Before real-athlete restart | f08 | Core with QRE, Security |
| SEC-O1-01b/c (a stop keeps SB-1 asking until a later declaration) | Before real-athlete restart | f08 or normalizer | Core; SSCTR to agree; with C-O1-2 |
| C-O1-3 (weekly adverse count order) | Before weekly-review gating | `r6-adaptation.mjs` readers | Core with QRE |
| SEC-O1-02 (phantom quarantine, pre-existing) | Before real athletes | Normalizer | Core with QRE |
| SEC-O1-03 (cap voices, keep only validated fields) | Before real athletes | Bounded | Core |
| C-O1-5 (an athlete act against a device voice) | Before real-athlete use | Later | Product/UX with Security, Core, SSCTR |
| O-O1-1 (sizing source can move when disputed evidence is withdrawn) | Observation | — | QRE |
| O-O1-A (OWN_SPEAKER_E1: outside a dispute a correction naming another speaker's report is disputed by its own speaker's earlier correction; conservative) | Observation | — | SSCTR / QRE |

Carried unchanged: C-F01-2 (custody), SEC-CORE-03 (correction author), C-NCC-3, SEC-NCC-03, OOS-1, OOS-2, and IOS_REVALIDATION_PENDING.

Proposed human-queue items, not appended: HQ-SSCTR-O1-01, -02 and -03 (SSCTR_O1_R1).
