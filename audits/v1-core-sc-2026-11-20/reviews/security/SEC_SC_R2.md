# SEC-SC-R2: narrow Security recheck of cycle 1 (SEC-SC-01)

**Judge:** Security, Privacy & Abuse Architect, the same independent instance as SEC_SC_R1. I am not the author. **Date:** 2026-11-20. Synthetic athletes only. I read no QRE or SSCTR review.
**Scope:** only the cycle-1 `keepVoice` change and how `CYCLE1.md` records SEC-O1-03. No R1 item is reopened.

**Verdict for the synthetic successor freeze: PASS.**
- SEC-SC-01 is **CLOSED**.
- The cycle-1 diff causes no regression.
- The SEC-O1-03 PARTIAL disposition is recorded correctly.
- `CYCLE1.md` §5 has three owner corrections. They are record-only and not blocking (§3).

## Identities

| Input | Identity |
|---|---|
| Judged commit | `a0fe31a2eb0062b72fbb99b10c8ca2dee5e9a6aa` (runtime commit `aca0f63`) |
| `CoachingCore/src/r6-provenance.mjs` | `cd0ede9d9d178691fa02be9b64d07a27449c51e500b09cc1edf2d76a02b7928a`. Against `d6348ff`: +4/−1, in `keepVoice` only |
| `CoachingCore/src/v1-f08.mjs` | `7ec9b6d53be49dadcbd8ab5bd28e49b0df6f146545b2db8c322c0cf488e40997` (unchanged) |
| `test/v1core-sc-safety-continuity.test.mjs` | `7b8d213c27c9a508…` |
| `CYCLE1.md` | `75d96abae6f467c8…` |
| Probes (outside the repo) | R1's `p1`, `p2`, `p3b`, `p4` and `fuzz-o1`, unchanged. New: `p4o.mjs`, which runs both orders and K = 3, 20 and 2000. |

**How it was run.**
- Everything ran on a fresh `git archive a0fe31a` extract (`sec-sc-r2-h4n8`), with `node_modules` copied in.
- I compared it with R1's extracts of `d6348ff` and `48e428f`.
- No verify script was run. Nothing was committed or deleted. This file is the only repository write.

## 1. SEC-SC-01: CLOSED

**`p4`, R1's shapes.** The genuine report arrives after 20 disputing voices.

| Shape | `d6348ff` | `a0fe31a` | FREEZE-6 |
|---|---|---|---|
| a_K20 | DECLARED | **ASK** | ASK |
| b_K20 | RUN pause 5 | **RUN pause 20** | RUN pause 20 |

**`p4o`, both orders.** Three arrangements were run for each shape:
- the genuine report last, across three reviews;
- the genuine report first;
- all in one review, the genuine report last.

Each arrangement ran at K = 3, 20 and 2000.

| Tree | Shape (a), SB-1 | Shape (b), RUN pause |
|---|---|---|
| `a0fe31a` | ASK in all 9 cases | 20 days in all 9 cases |
| `d6348ff` | DECLARED in 4 of 9 cases | 5 days in 4 of 9 cases |

`recent` (C-Q08-1) is identical on all three trees in every case.

**The bound holds.**
- Each exception adds a voice only when no kept voice already says the same thing, so the voice count is bounded and an exception cannot be used to grow a row.
- `VOICE_LIMIT + 3 = 19` is a safe upper bound. In practice it is 18: a full row always holds a "took place" voice or a "did not take place" voice.
- What the exceptions add only errs safe:
  - a kept "took place" voice only makes SB-1 ask;
  - a kept "did not take place" voice only withholds the occurrence, so the pause errs long.
- The excess writes nothing.

**2000-voice spam (`p1` G).**
- 16 voices and 20,731 B, byte-identical to `d6348ff`. The row is still CONFLICTED.
- 2000 stops (`p3b` J1): 16 voices, ASK.
- A replay of the spam leaves the record byte-identical.

**Tests:**
- The focal file, its successors and the O-1 file are green, except the by-design O-1:146.
- The three cycle-1 tests are green.

## 2. No other regression

**Probes against `d6348ff`.**
- `p1`: only the timings differ.
- `p2`: `U1[C]{N2,S,U1}`, ASK.
- `p3b`: the only change is R1's own `I_cap_K20` shape, which goes from DECLARED to **ASK**. All other outputs are the same, including SEC-SC-02 G2/G4 and SEC-SC-03 G1, which are pre-existing and unchanged.

**Fuzz** (3 seeds × 1500 cases):
- 2, 1 and 1 cases where SB-1 differs by arrival or batching. These are the same integrity first-claim cases as in R1.
- Integrity-refused ids kept as voices: 0. Re-read changes: 0.

**Directed suites** (SC, O-1, cf011r2, v1cp-f08, NCC and SEC-R2): **148 tests, 140 pass, 8 fail**. The 8 failing titles are exactly R1's:
- the four ledger moves;
- the orphan test, NCC F1, NCC F3 and the scenario 21 successor, all pre-existing.

The +3 tests are cycle 1's.

## 3. `CYCLE1.md`: confirmed, with record corrections

**§3, SEC-O1-03 PARTIAL: correct.**
- Disputing voices are bounded.
- O-SC-1 (agreeing merges) and the C-F01-2 per-report size limit stay open before real athletes.

**Precision to add (SEC-SC-O-3, Low, observation).** O-SC-1 also applies to a *disputed* row. In `p4o` (a), K = 2000, reports whose facts equal the row in force merge onto the flagged row as `SAME_EXECUTION_DIFFERENT_SOURCE`, giving 35 or 36 parts. The same shape gives 35 parts on `d6348ff` and 2002 on FREEZE-6. So the 19-voice bound applies to disputing voices only, not to a row's total parts. This is consistent with PARTIAL and is not a cycle-1 regression. Owner: Core, with O-SC-1.

**§1, §2 and §4:** consistent with what I reproduced.

**§5, owner corrections (record-only, due in the closing record).** The owners should be as SEC_SC_R1 §3 states them:

| ID | Owner as SEC_SC_R1 §3 states it |
|---|---|
| SEC-SC-02 | Core with QRE (C-F01-1 r2), with SSCTR on whether a late execution of a planned session is the same execution |
| SEC-SC-03 | Core + SSCTR |
| SEC-SC-O-1 | Core/QRE |
| SEC-SC-O-2 | Core |

## 4. Still open (unchanged, not blocking the synthetic freeze)

- **Before real athletes:** SEC-SC-02, SEC-SC-03, and the SEC-O1-03 remainder (O-SC-1 and the boundary size limit).
- **Stated dependencies:** SEC-CORE-03 and C-F01-2.

Nothing from Security blocks the successor freeze.
