# SEC-O1-R2: narrow Security recheck of SEC-O1-01a (the one cycle)

**Judge:** Security, Privacy & Abuse Architect. Same independent instance as SEC_O1_R1; not the author. **Date:** 2026-11-19. Synthetic athletes only.
**Scope:**
- the four closing items of SEC-O1-01a (SEC_O1_R1 §5);
- how `CANDIDATE.md` §B and §G record the other Security items.

This is no new general audit. I read no QRE review.

**Verdict for the synthetic successor freeze: PASS.**
- SEC-O1-01a is **CLOSED**.
- Nothing from Security blocks the successor freeze.
- `CANDIDATE.md` needs three record corrections (§3). They are record-only, not runtime, and are due in the closing record.
- SEC-O1-01b/c, SEC-O1-02 and SEC-O1-03 stay open as SEC_O1_R1 classified them. They bind before real athletes.

## Identities

| Input | Identity |
|---|---|
| Judged candidate | `774fcf04f85956e72b210823256e65a6216e7ee2` (records). The runtime is from `4ccca2d7c46209dd7357a9f02ed89f7cde03e4dd`, with no `CoachingCore/src` change from 4ccca2d to 774fcf0. |
| `CoachingCore/src/r6-provenance.mjs` | sha256 `b206416f48c8ff368f16ac1c6980b16d34650cbcffce1a060bf9425df56ad80a`. The diff against 24ca2ae is one line: the `voicesOf` fallback now reads `heldBefore` instead of `mine`. |
| `test/v1core-o1-conflict-evidence.test.mjs` @774fcf0 | sha256 `734f274f6bcfd550…` |
| `CANDIDATE.md` @774fcf0 | sha256 `2a4397e72d8dbd67…` |
| `SEC_O1_R1.md` as committed at 4ccca2d | Byte-identical to the file I wrote (`git diff` empty) |
| Judge probes | Unchanged from R1: `p1.mjs` `80a6910f9567759f`, `p2.mjs` `6f0449467a5d9761`, `fuzz-o1.mjs` `af3dac0b6dc925b9` |

**How it was run.**
- Everything ran on a scratch `git archive 774fcf0` extract.
- Two mutants ran on two separate new scratch copies.
- No verify script was run, nothing was committed, and nothing was deleted. This file is the only repository write.

## 1. SEC-O1-01a closing items

| # | Item | Evidence on 774fcf0 | Result |
|---|---|---|---|
| 1 | `p2.mjs` ends in ASK, with S a voice of the row in force | `U1[C]{N2,S,U1}` gives **ASK**, with nothing excluded. On 24ca2ae it was `U1{}`, DECLARED. The unknown-speaker correction still disagrees with S, so the dispute stands and S is carried. | **PASS** |
| 2 | Amendment and O-1 tests green | O-1 **15/15**, including P4 (the amendment) and SEC-O1-01a (cycle 1). O-1 successors **4/4**. | **PASS** |
| 3 | The mutant is killed | Two independent mutants were run. **`mine?…:null`** (24ca2ae restored) fails the SEC-O1-01a test, and p2 returns to DECLARED. **`voicesOf=holder`** (no fallback) fails P4 and SEC-O1-01a, and p2 returns to DECLARED. Both are killed. | **PASS** |
| 4 | SEC-R2 24/24; cf011r2 green except the orphan test | SEC-R2 **24/24**. cf011r2 **35/36**: the one failure is the pre-existing `SEC-R2-01 engine-written orphan` (same assertion on f40fbe1). f08 **15/15**. NCC 23/26: the same three intended moves as in R1 (F1, F3, scenario 21 successor), for QRE to re-baseline. | **PASS** |

**No other change.**
- `p1.mjs` gives byte-identical outputs on 774fcf0 and 24ca2ae, apart from timings.
- The fuzz over 2 seeds × 1500 cases is unchanged:

| Seed | Order-dependent SB-1 cases | Borrowed activity | Self-flag | Event id reuse | Same class (activity shared across sessions) |
|---|---|---|---|---|---|
| 4242 | 86 | 78 | 4 | 3 | 1 |
| 99 | 74 | 69 | 5 | 0 | 0 |

- Integrity-refused ids kept: 0. Re-read changes: 0.
- The one-line widening only adds voices that a resolution must agree with, which is the conservative direction. It grants nothing.

## 2. Still open (unchanged, verified on 774fcf0, not blocking the synthetic freeze)

| Item | Reproducer | Result on 774fcf0 |
|---|---|---|
| SEC-O1-01b/c | `p1` B1 | DECLARED: the athlete names N, and the kept stop is set aside |
| | `p1` B4 | DECLARED: an unknown speaker names S |
| | `p1` B5 | DECLARED: the athlete names S |
| SEC-O1-02 | `p1` C1 | DECLARED (C2 asks) |
| SEC-O1-03 | 2000 spam voices | 2.6 MB on one row |

All of these bind before real athletes.

## 3. `CANDIDATE.md` §B and §G: confirmed or corrected

**Confirmed.**
- **§B Security items 6–7.** A declared stop after the latest readiness declaration keeps SB-1 asking until a later declaration. No correction, merge, speaker rule or resolution answers it. The speaker rule settles amounts, never a safety signal, and is no authentication boundary. This matches SEC_O1_R1 §2, items 6 and 7.
- **§B "P4: Security for amounts only".** Correct.
- **§B P7 note.** The 86/1500 figure for SEC-O1-02 is correct; it comes from seed 4242.
- **§G SEC-O1-01a.** Freeze, runtime, done in cycle 1. Correct, now verified.
- **§G SEC-O1-01b/c.** Before real-athlete restart; f08 or normalizer; Core, with SSCTR to agree, with C-O1-2. Correct.
- **§G SEC-O1-02.** "Before real athletes" is accepted, and it is stricter than R1's "before a real-athlete restart".
- **§G SEC-O1-03.** Correct.
- **§G carried items.** C-F01-2, SEC-CORE-03, SEC-NCC-03, OOS-1 and OOS-2 are correctly carried unchanged.

**Corrections (record only; due in the closing record; owner: the author).**

**R2-REC-1: §B, last bullet, the scope and class of SEC-O1-01b/c.** The record now reads: "a correction from the athlete's own source quality that names another report can still set aside a kept stop … the same class as SEC-CORE-03." This is incomplete and misclassified. The residual is three shapes:
- **c:** the athlete's correction names another report. That includes a correction with **no source at all**, because the MANUAL default counts as the athlete (`p1` B1–B3).
- **b:** an **unknown-speaker** correction names the stop itself, and so retracts another speaker's stop under the E-1 named-only rule (B4).
- the athlete names the stop (B5).

On the classification: B1 happens with a **genuine, authenticated** athlete correction. So this is a gap in the item-6 rule itself, not only SEC-CORE-03. SEC-CORE-03 only widens who can trigger it.

**R2-REC-2: SEC-NCC-02 status is missing.** `CANDIDATE.md` never states it. It should read: **CLOSED on its stated closing evidence** (SEC_O1_R1 §3: f08 hears a refused report's stop, and e7 asks), with the residual mechanisms filed as SEC-O1-01b/c and SEC-O1-02, which are not closed by that declaration.

**R2-REC-3: an identifier collision.** §G uses **O-O1-1** for "the sizing source can move when disputed evidence is withdrawn". SEC_O1_R1 §4 already uses O-O1-1 for "a reused voice id is compared with the row's facts, not the part's", and also has O-O1-2 ("SB-1 dates a voice by its row's `observedAt`"). Neither Security observation appears in §G. Record mine as **SEC-O-O1-1** and **SEC-O-O1-2**: Low, owner QRE, and C-F01-1 r2 for the second.

## 4. Anything still blocking

**Nothing from Security** blocks the synthetic successor freeze.

**Unchanged dependencies, not closed here:**
- SEC-CORE-03: the correction author is not validated, and the speaker rule reads declared fields.
- C-F01-2: custody of stored parts, `availableAt`, `inputHashes` and bindings.
