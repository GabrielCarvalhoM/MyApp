# QRE-SC-R1: Quality & Reliability gate on the Safety Continuity candidate

**Judge:** Quality & Reliability Engineer. I am an independent instance and did not write the candidate. **Date:** 2026-11-20. Synthetic athletes only.

**Read:** CANDIDATE.md, SUCCESSOR_LEDGER.json, `evidence/`, `bench/`, QRE_O1_R1/R2 and the FREEZE-6 suite. I did not read the Security or SSCTR reviews of this mission.

**Rules followed:**
- This file is my only repository write.
- I ran no `npm run verify` or `verify-r*` script and did no recursive deletion.
- Scratch work is in `scratchpad/qre-sc-1795182087-31828/`: `git archive` extracts of `d6348ff` and `48e428f`, plus my own tools in `tools/`.

## 1. Verdict

**READY_WITH_CONDITIONS** for a synthetic successor freeze. This verdict does not cover real athletes.

What holds:
- **No regression.** The suite moves by exactly the 5 declared tests, and the successors are faithful.
- **Stable.** Results are deterministic, and re-read, round trip and replay are stable.
- **No dose change.** Lineage dose is byte-identical and performance is neutral.
- **SEC-O1-02 matches P7.** In every phantom pass I checked (58), the one-review result equals the split-review reference, where FREEZE-6 never did.
- **Freezes preserved.** Every earlier freeze and every sporting freeze reports the same on this line as on FREEZE-6.

What binds the freeze:
- **QRE-SC-02.** SEC-O1-03's cap can drop a "done" or a "not done" voice depending on arrival order. Past 16 voices, this moves SB-1 and the restart pause in the less protective direction. QRE does not close SEC-O1-03 with the stop-only exception.
- **QRE-SC-01** (record only). One differential arm, the declaration "just before the stop", was vacuous, and two record claims are inexact.

No finding needs a Founder decision. QRE-SC-02 is an amendment to a policy that Security and QRE were asked to decide (CANDIDATE §B).

## Identities judged

| Input | Identity |
|---|---|
| Candidate | `d6348ffe7d12…`, branch `claude/v1-core-safety-continuity`, clean tree (only `reviews/` untracked) |
| `src/v1-f08.mjs` / `src/r6-provenance.mjs` | `7ec9b6d53be4…` / `8a850a7410c4…` (FREEZE-6: `f1065bf1e8c2…` / `b206416f48c8…`) |
| `test/v1core-sc-safety-continuity.test.mjs` / `test/v1core-sc-successors.test.mjs` | `55ae42620290…` / `113ba4776886…` |
| CANDIDATE.md / SUCCESSOR_LEDGER.json / `evidence/sc-differential.mjs` / `evidence/mutate-sc.mjs` | `6d0c360eb34f…` / `c3a233b3b9fc…` / `bc03295e64b6…` / `af050acb87f2…` |
| Base | `48e428f` (FREEZE-6). Clean worktree `v1-core-o1`: `v1core-freeze-6.mjs --check` gives 60/60 |
| Node | v24.19.0 on Windows. No iPhone claim |

## 2. Results per item

| # | Item | What I ran | Result |
|---|---|---|---|
| 1 | Regression | Full suite on both extracts. Titles and failure locations compared with `suite-r2.txt` and `suite-candidate.txt` | Candidate: 1846 tests, 1804 pass, 40 fail, 2 skipped. The 2 skips are git-dependent freeze tests ("not a git checkout"); they fail in the worktree run, which gives 1846/1804/42. Against FREEZE-6, exactly 5 titles move (A12, B4-B5, B7, O-1:146, O-1 freeze) and 22 green titles are added. The other 37 failures keep their titles and locations, so nothing is fixed or masked. The 4 moved tests fail only at the substituted lines (cf011r2:112, :144, :156; o1:152). The diff touches no existing test file. |
| 1b | Successors | Read each substitution against the frozen text | Each substitution changes one assertion and is applied exactly once; the frozen files are unedited. The new values are exact: A12 `[ZERO, DAY-3, 3]`, B4-B5 pause 3 with exposure equal to the 13-day run alone, B7 plus three integrity-flag no-occurrence checks (stronger than before). 146's `notDeepEqual(single, clean)` is the weakest, but the one-voice case is pinned exactly elsewhere. Faithful. |
| 2 | Determinism, persistence | `tools/probe-limit.mjs` on both trees: 2000 spam reports (permutation, full and reversed replay, re-read, round trip), stop beyond the limit, an over-limit row carried from FREEZE-6, an excess id reused with other facts | In one batch the reversed order gives the same record (sorted input). Full and reversed replays change nothing. Re-read and round trip are stable. A replayed stop is an EXACT_REPLAY. A carried row with 26 parts keeps all of them, and a new voice on it is refused unkept: the history is never truncated. An excess id reused with other facts is refused with nothing written (FREEZE-6 re-flags the row as `EVENT_ID_REUSED`). The normal-load record is byte-identical. The SB-1 engine journeys (weekly reviews, round trip, replay) pass. |
| 3 | SC differential | Recomposed it (byte-identical to the committed file). Reran seed 1 EXT+MONO and seed 2 EXT: both JSONs are byte-identical to the committed ones. Added instrumentation in `tools/` | The comparison is sound: same input and same prior on both trees, and f08 reads the candidate's record. The phantom classes are justified by construction, since a normalizer difference can only arise where `disputedHere` differs from `quarantined.has`. I checked them against a reference: in 58 PHANTOM_QUARANTINE/VOICES passes over 4 configurations, the candidate's identity rows equal the same batch split into reviews at each phantom-raising refusal, and FREEZE-6 equals that split in none. This covers every credit gain and loss, not only the 4 inspected. Defect: the third f08 arm is vacuous (QRE-SC-01). OCCURRENCE and STOP_ON_RECORD use record-level predicates, which is acceptable only because the f08 diff has two touch points; the invariants (`recentDiffers`, `declaredWhereOldAsked`, `declaredOverStop` = 0) carry the weight. The generator is still the O-1 one (QRE-O1-04): no unknown or third speaker, and at most 6 parts, so VOICE_LIMIT is never exercised. |
| 4 | Mutants | Reran `mutate-sc.mjs`. Added 11 QRE mutants (`tools/qre-mutants.mjs`) | The author's set reproduces: 14/14 killed, control 22/22. Mine: 9/11 killed. **Survived:** QM8 (`stop:false` read as a stop) and QM11 (the excess still indexed by event id, which would let a reused id re-flag the row as an integrity conflict and erase its occurrence). Both are test gaps (QRE-SC-03). |
| 5a | SEC-O1-02 / QRE-O1-02 | The focal reproducer, the split reference (item 3), and the C8 P4 invariant re-implemented in `tools/sc-diff-qre-c8v.mjs`, 6 configurations | My reproducer is closed: one review reads as two, and W1 stays heard. C8 on voiced disputes is 0 in 4 of 6 configurations. In seed 1 STOPS+EXT, FREEZE-6's 3 phantom hits drop to 0. The remaining 1–2 hits in two configurations are equal on both trees: the athlete's own agreeing correction settles the dispute, then a later correction in the same pass replaces that row. That is not a phantom quarantine, so it is a C8-definition limit, not a defect of this line. Integrity-flag hits are out of scope (no voices by design). |
| 5b | SEC-O1-03 | Reran `voice-load.mjs` (5 rounds). Ran shape probes | The measurements are sound: normal 3/3 voices with identical bytes; elevated 16 vs 41; abuse 16 voices and 20.7 KB vs 2001 and 2.6 MB, 154 vs 787 ms, re-read 0.42 vs 42.5 ms. The cap value is acceptable. The exception is not (QRE-SC-02). CANDIDATE §B quotes 446/1798 ms and 1.3/125 ms, which `voice-load.json` does not contain (QRE-SC-01). |
| 6 | Performance and freezes | `bench.mjs` (5 rounds) vs `v1-core-o1`. `v1core-freeze-6 --check`. `v1core-freeze`…`-5`, `v1fc`, `v1rc`, `v1rfc`, `v1rws` 1/2 and `v1str` `--check` on both trees | Review ×0.96 (p95 ×0.95), corrected restart ×0.99, normalizer ×1.00–1.03, merged ×0.99–1.03, record bytes ×1.00. `disputedHere`'s scan is short-circuited by `quarantined.has`. FREEZE-6 `--check` exits 1 by design and names `src/v1-f08.mjs` and the two added tests; it stops before its record step, so `r6-provenance.mjs` is shown by `git diff` only. Every other freeze and sporting verifier gives the same file list on both trees. Nothing under `CoachingCore/v1/` or another mission's `audits/` folder is changed. Lineage `DOSE=1`, regenerated on the extract: byte-identical, 62 rows. |
| 7 | C-O1-3 | Read §D | Adequate: reproduced, readers named (`r6-adaptation.mjs`), why it is out of scope, the direction of the error, the binding point (before real-athlete weekly-review gating), the owner and the next decision. I did not re-run SSCTR's `adv2.mjs`. |
| — | RED | The focal file against the `48e428f` runtime | 16/18 fail and the 2 guard tests pass, consistent with "12 of the first 14". |

## 3. Findings

### QRE-SC-02: past VOICE_LIMIT, arrival order can drop a voice that SB-1 or the restart pause reads (medium; introduced by this line, abuse regime only; **binds the successor freeze**)

`keepVoice` keeps an extra voice beyond 16 only when it is a stop and the row holds no stop. But f08 reads three things from kept voices: a stop (`stopOnRecord`), "took place" (`claimsDone`, SB-1's trainedAfter) and "not done" (`occurred`'s every-voice rule). Reproduced with `tools/probe-limit.mjs` and `tools/probe-sb1.mjs` on both trees, with a readiness declaration before the session:

- **(a) Restart pause.** A device row, 15 disputing "done" voices, then the athlete's "not done".
  - Candidate, "not done" last: dropped, so the row reads as an occurrence (lastExecuted 11-05, RUN pause 5).
  - Candidate, "not done" first: kept (lastExecuted 10-26, pause 15).
  - FREEZE-6: 15 in both orders.
  - This contradicts §A.2 ("still no occurrence: a 'not done' voice"). The pause is shorter, so it errs short.
- **(b) SB-1.** A "not done" row in force, 15 "not done" voices that conflict on response, then a "done 30" voice.
  - Candidate, "done" last: dropped, so `readinessDeclared: true` (the declaration stands).
  - Candidate, "done" first: SB-1 asks.
  - FREEZE-6: asks in both orders.
  - This contradicts the code comment and §B ("SB-1 never loses its signal"), and the SEC-V1CPI-02 rule.

The amount and C-Q08-1 are unaffected. The regime needs more than 16 disputing reports of one session; the most any generated row holds is 6.

**To close (preferred):** keep a voice beyond the limit when it adds a reading class the kept voices lack: a stop, a voice saying it took place, or a voice saying it did not. The bound becomes at most 19 parts, and P7 then holds for every f08 reading beyond the limit. Also needed: one focal test per shape (a) and (b), in both orders, plus a mutant. This is one narrow runtime-only cycle, re-checked by QRE.

**Alternative:** Security, co-owner of SEC-O1-03, records this as an accepted residual. Then the freeze record states that SEC-O1-03 is **not closed**, corrects §A.2 and §B, and QRE-SC-02 binds before real athletes.

**Owner:** Core, with Security; QRE re-checks.

### QRE-SC-01: record and harness inexactness (low; **binds the freeze record**; record and tooling only)

- **(a) The "just before the stop" arm was never compared.**
  - `readyAt=t=>({...R0,declaredAt:t})` breaks the declaration's seal, so `restartIntake` returns HOLD on both trees every time (1000 cases: `beforeStop:HOLD/HOLD` 2156 of 2156).
  - The §C claim of three f08 arms therefore rests on two, and the early arm (declared 2026-10-01) is weak: only 1–22 STOP_ON_RECORD per configuration.
  - I sealed the declaration with `readinessFact(…, t, …)` in `tools/sc-diff-qre-sealed.mjs`. Seed 2 EXT and seed 20261119 base gave READY/READY on every comparison, beforeStop STOP_ON_RECORD 154 and 202, OCCURRENCE 688 and 852, invariants all 0 and UNEXPLAINED 0. So the claim holds in substance.
  - Fix the harness and re-emit, or state the limit.
- **(b) Voice-load figures.** The ms figures in §B do not match `bench/voice-load.json`, which my rerun reproduces.
- **(c) Quarantine list.** "The pass's `quarantinedIdentities` list is unchanged" is inexact. It differs in every PHANTOM_LISTED pass, where the candidate keeps an identity that FREEZE-6's phantom "resolution" removed. See QRE-SC-04.

**Owner:** the author, with QRE.

### QRE-SC-03: test gaps on new lines (low; does not bind; tests)

Mutants QM8 (`stop:false`) and QM11 (the excess indexed by event id) survive the focal and successor files. Add two assertions:
- `stop:false` does not ask;
- an excess id reused with other facts is refused, writes nothing, and leaves the row's conflict reason and its occurrence as they were.

**Owner:** the author.

### QRE-SC-04: the phantom identity stays in the pass's quarantine list (low; does not block the synthetic freeze; binds before real-athlete weekly-review gating, with C-O1-3)

Reproduced with `tools/probe-list.mjs`: a borrowed activity on `sx` is refused, then a valid report F on `sx` arrives in the same review.
- **Candidate:** F is admitted clean, as in the split reference, but `quarantinedIdentities` still lists `session:sx`, so `weekEvidence` reads that session as conflicted during this review only. The next review reads it clean.
- **FREEZE-6:** F is lost entirely, which is worse.

The error is transient and errs low, but the week-level reading is not yet batch-independent (SEC_O1_R1 §5).

**Owner:** Core, with Security, to decide whether a quarantine with no flagged row leaves the pass's list.

### Observations (no condition)

- **O-QRE-1.** The SC harness still lacks QRE-O1-04's closing items: unknown or third speakers, and a P4 invariant. Every-differing-identity attribution is now met. I recommend adding the sealed arm, the split-review reference and C8 on voiced disputes from `tools/` to the harness.
- **O-QRE-2.** O-SC-1 (uncapped agreeing merges) stands as stated.

## 4. Summary of findings

| ID | Binds the successor freeze | Runtime | Owner | Close |
|---|---|---|---|---|
| QRE-SC-02 | **Yes** (or an explicit Security residual with SEC-O1-03 left open, then before real athletes) | Yes (normalizer, one predicate) | Core, with Security; QRE re-checks | Class-preserving exception, tests for (a) and (b) in both orders, a mutant, QRE runtime-only re-check |
| QRE-SC-01 | Yes (the freeze record) | No | Author, with QRE | Sealed arm fixed or limit stated; §B ms figures and the §A.3 list claim corrected |
| QRE-SC-03 | No | No (tests) | Author | Two assertions; QM8 and QM11 killed |
| QRE-SC-04 | No; before real-athlete weekly-review gating | Possibly | Core, with Security | A decision on the list, and a week-level P7 check |
