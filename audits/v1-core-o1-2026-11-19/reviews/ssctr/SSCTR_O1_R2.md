# SSCTR narrow recheck of O-1 after cycle 1, R2 (2026-11-19)

**Verdict on `774fcf0` (runtime `r6-provenance.mjs` `b206416f…`, from `4ccca2d`) for the synthetic successor freeze: ACCEPT_WITH_CONDITIONS. Nothing blocks the freeze.**
- **(a)** The cycle-1 change moves no sporting reading I accepted in R1. All my probe outputs are byte-identical to 24ca2ae, and the lineage dump is byte-identical to `lineage-candidate.jsonl`. The change can only keep a dispute open longer, never credit one.
- **(b)** CANDIDATE.md §B, §E and §G, the successors and SUCCESSOR_LEDGER.json discharge **C-O1-1** and **C-O1-4**. Two precision notes remain, neither blocking (C-O1-R2-1, O-O1-R2-1).
- **(c)** I **AGREE** with Security's item 6/7 rule (SEC-O1-01b/c) as policy, with the clarifications below. It is the SSCTR-RWS-B-01 rule applied to SB-1. There is no divergence to route to the Founder.

SSCTR_O1_R1 otherwise stands. C-O1-2, C-O1-3 and C-O1-5 are unchanged and bind before real-athlete use, as recorded.

## Reviewer, target, method

**Reviewer:** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5, the same instance as R1.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, no clinical judgment was made and nothing was delegated. No literature was needed: these are admission rules, not empirical claims.
- I read Security's SEC_O1_R1 only where (c) required it: §§1, 6, 7, the SEC-O1-01 cases and the routing row.

**Bytes:** a `git archive` extract of `774fcf0` in my scratch directory, plus node_modules. I did not use the working tree.

| File @774fcf0 | SHA-256 |
|---|---|
| `CoachingCore/src/r6-provenance.mjs` | `b206416f48c8ff368f16ac1c6980b16d34650cbcffce1a060bf9425df56ad80a` |
| `CoachingCore/test/v1core-o1-conflict-evidence.test.mjs` | `734f274f6bcfd550ea80e3cb03738461bfedbd6e6a4e9b03704a4238917e703c` |
| `CoachingCore/test/v1core-o1-successors.test.mjs` | `7aacc76933345bedab3eef4676360a56df82666d5f7e1fae3ea365df0b5fc30d` |
| `audits/v1-core-o1-2026-11-19/CANDIDATE.md` | `2a4397e72d8dbd67705f77a19ecdc49ca9938f5326784ad9540cb1e0d24cc5ca` |
| `audits/v1-core-o1-2026-11-19/SUCCESSOR_LEDGER.json` | `4c71f07d3d7b94d75e184effce888413b1d654e66f9958858cdc121d607bd59c` |
| `reviews/security/SEC_O1_R1.md` | `6e8e5e2f68c196884329c5fec751b843f6dee0b0e17e2b8f646a557b24e3d06f` |

**Runtime delta from 24ca2ae:** one line. The `voicesOf` fallback now depends on `heldBefore` instead of `mine`, so an unknown speaker's correction carries every other voice of the flagged row.

**Commands:**
- Focal file plus successor file: **19/19** (15 + 4).
- R7-D 3.3 T4: passes.
- I did not run the full suite, `npm run verify` or `verify-r*`.

## (a) No sporting reading moves

All probes are R1's, unchanged, rerun on the 774fcf0 extract (`…/scratchpad/ssctr-o1-r1-7c3a/probes/`, outputs in `out4/`):

| Probe | Result on 774fcf0 |
|---|---|
| `lineage-dump.mjs DOSE=1` (author's) | Byte-identical to `lineage-candidate.jsonl`: the same six rows move, all lower |
| `dose6.mjs` (w+1..w+6) | Byte-identical to 24ca2ae and 889d2ae |
| `rwsb01.mjs` (3 orders × 2 named ids) | Byte-identical: CONFLICTED in all 6, no run-history fact, screen REQUIRED and then cleared only by the answer |
| `occ2.mjs` (f08 pause by conflict path) | Byte-identical. C-O1-2 remains as recorded (2 weeks vs 0) |
| `adv.mjs`, `adv2.mjs` | Identical. C-O1-3 remains as recorded (1 vs 0) |

**The new SEC-O1-01a test.**
- Before: an unknown-source correction could retire a device-recorded symptom stop unheard and release SB-1.
- Now: the stop is carried, the row stays CONFLICTED, and SB-1 asks.
- This only keeps a dispute open (it errs low). It never credits a session and never clears a safety signal. I accept it.

## (b) Records

| Condition | Status | Basis |
|---|---|---|
| C-O1-1(a) successors | **Discharged** | All four successors are GREEN, with ledger entries carrying `sporting` and `safety` fields. (1) F1 :101: the re-send is EXACT_REPLAY. (2) F3 :162: P is kept as a voice, never merged. (3) Lineage :205: row 19 reads as row 10. (4) RWS-B-01 :105: `conflicted` true, the screen assertion unchanged |
| C-O1-1(b) record | **Discharged** | §E states the six row moves, the RWS-B-01 move (3 of 6 cases credited a 100-min fact on FREEZE-5) and row 18 LONG 365 → 360 with minutes and km unchanged. §A and the commit table state the 1d418d1 → 24ca2ae amendment. The ledger records row 19 as COMPLETED → PARTIAL, as rows 08/10 |
| C-O1-4 POLICY corrections | **Discharged** | §B corrects §3 B (recovery) and P7, and links C-O1-2 and C-O1-3 |
| §B decisions A–C | Correct | Occurrence and recovery are replaced as in R1; P2 is interim; B and C are adopted |
| §G conditions | Correct, with one wording fix | C-O1-R2-1 below |

**Two details I checked:**
- In the lineage successor, row 21's history column `'whole'` reads `exec.extentKm`, the displayed row's extent: 11 / 16 km.
  - That value is FREEZE-5's own (base EASY 21 extent 11).
  - The run-history fact stays 0, so it reaches no dose reader. This is P2, as corrected under C-O1-4.
- The composed RWS-B-01 successor names one id per order (the frozen loop's).
  - The normalizer-level focal test covers both names in two orders.
  - My `rwsb01.mjs` on 774fcf0 covers all 6 combinations.
  - The remaining combination, one review naming the device's row, is covered only by the probe (O-O1-R2-1).

## (c) Security items 6/7 (SEC-O1-01b/c): AGREE as policy

**The rule:**
- A declared stop on record after the latest readiness declaration keeps SB-1 asking until a later readiness declaration.
- That holds wherever the stop sits: in force, as a kept voice, or on a history row.
- No correction, merge, speaker rule or dispute resolution answers it. That includes a correction by the stop's own speaker.

**Why I agree:**
- **It is my own rule, applied to a second reader.** SSCTR-RWS-B-01 already rules, for the run-format screen, that a contradiction, a refused report, a merge or a correction never removes a reported stop. Even a correction that only changes the stated reason does not unsay the symptom. Only the screen answered after the stop clears it. Two readers of the same safety signal should not disagree on what clears it.
- **It separates the two questions P4 mixed for stop-bearing voices.** The speaker rule and resolution settle the **amount** (credit or no credit), and that stays unchanged. They never settle whether the athlete is ready to train again. This matches S6/S8, which I accepted.
- **Its cost is a question, never a dose.**
  - It produces ASK only. It sets no clinical state, restriction or referral and infers no symptom, consistent with SSCTR-05.
  - It is not a permanent block: a later readiness declaration answers it (S8).
  - The athlete's burden is one more readiness answer, including after a stop declared by mistake. That is proportionate for a safety signal.
- **Integrity refusals still never count** (P3). Another athlete's report, invalid times and borrowed activities stay out, as Security's item 1 states.

**Clarifications** (scope notes, not divergences):
1. **Every declared stop counts.** A missing or unlisted reason reads as SYMPTOM (V1RC R-01). A stop with a nonclinical reason (time, weather) also keeps SB-1 asking. SB-1 already asks for any session that took place after the declaration, so the only additions are that the stop cannot be retracted and that zero-minute stops count. I accept that over-asking.
2. **Zero-minute stops.** Once implemented, the rule also closes my observation **O-NCC-S1** (a zero-minute symptom stop after a declaration did not re-open SB-1). The implementation's test should include that case.
3. **No interaction with C-O1-2.** The occurrence rule reads only "took place" voices for the pause; this rule reads only stops for SB-1. Both bind before a real-athlete restart. Core may implement them together, but neither depends on the other.
4. **The quantitative effect of cases b and c is unchanged.** An athlete's own correction may still settle the amount dispute. It no longer releases SB-1.

**Binding.** I agree with Security: before a real-athlete restart, not the synthetic freeze. Runtime change: yes, in f08 SB-1 or the normalizer, mechanism chosen by Core. Owner: Core with Security, then a narrow SSCTR recheck.

## Conditions after R2

| Id | What | Binding | Runtime change | Owner |
|---|---|---|---|---|
| C-O1-1, C-O1-4 | Successors and record; POLICY corrections | — | — | **Discharged by this review** |
| C-O1-R2-1 | CANDIDATE §G: C-O1-3's binding should read "before **real-athlete** weekly-review gating", as in SSCTR_O1_R1 §5; C-O1-2's owner should end "then SSCTR" | Closing record | No | Author with Chief |
| O-O1-R2-1 | Add a composed assertion for the RWS-B-01 one-review order naming the device's row, which today only my probe covers. That probe shows CONFLICTED | Observation | No | QRE / author |
| SEC-O1-01b/c | A stop keeps SB-1 asking until a later declaration, as agreed in (c), including zero-minute stops (closes O-NCC-S1) | Before real-athlete restart | Yes | Core with Security; then SSCTR |
| C-O1-2, C-O1-3, C-O1-5, O-O1-1 | Unchanged from R1 | As in R1 | As in R1 | As in R1 |
| O-O1-A | Accepted as a conservative observation (the reading errs toward dispute) | Observation | — | QRE |

**Proposed human-queue item (proposed only, not written):**

| Proposed id | Decision | Status if adopted |
|---|---|---|
| HQ-SSCTR-O1-04 | A declared stop after a readiness declaration keeps the readiness question open until a later declaration; no correction or resolution answers it (SEC-O1-01b/c), when implemented | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |

HQ-SSCTR-O1-01..03 stand as proposed in R1.
