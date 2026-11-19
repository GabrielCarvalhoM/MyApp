# QRE-O1-R1: Quality & Reliability gate on the O-1 candidate

**Judge:** Quality & Reliability Engineer, an independent instance and not the author. **Date:** 2026-11-19. Synthetic athletes only.

I read CANDIDATE.md, POLICY.md, SUCCESSOR_LEDGER.json, SSCTR_O1_R1 and SEC_O1_R1, but none of the parallel rechecks.

**Scope:** the candidate as a synthetic successor freeze. This verdict does not cover real athletes.

**Rules followed:**
- This file is the only repository write.
- No `npm run verify` or `verify-r*` script was run, no verifier was edited, and no recursive deletion was done.
- Scratch work is under the scratchpad folder `qre-o1-r1-7f3a/`, with `git archive` extracts of f40fbe1, 1d418d1, 24ca2ae and 774fcf0.

## 1. Verdict

**READY_WITH_CONDITIONS.**

The runtime does what the record says on every shape I could build:
- reproducible and deterministic;
- re-read ×3, JSON round trip, replay and engine restart are stable;
- plan A rows are untouched across a restart;
- no regression against FREEZE-5's 31 failures;
- every earlier freeze is preserved;
- the four successors are narrow and green.

Two conditions bind the freeze, and neither changes the runtime:
- **QRE-O1-01:** a load-bearing integrity guard is pinned by no test and no differential configuration.
- **QRE-O1-03:** four claims in the record are inexact.

One pre-existing P4 residual, **QRE-O1-02**, binds before real athletes together with SEC-O1-02. It is identical on FREEZE-5, so it is no regression.

No finding needs a policy change or a Founder decision, and none contradicts SSCTR_O1_R1 or SEC_O1_R1. QRE-O1-02 widens the trigger set of SEC-O1-02.

## Identities judged

| Input | Identity |
|---|---|
| Candidate commit | `774fcf0` (branch `claude/v1-core-conflict-policy`, clean tree) |
| `CoachingCore/src/r6-provenance.mjs` | `b206416f48c8…`, the only runtime file changed against f40fbe1 (`408eb9beb84c…`) |
| `test/v1core-o1-conflict-evidence.test.mjs` / `test/v1core-o1-successors.test.mjs` | `734f274f6bcf…` / `7aacc7693334…` |
| `evidence/differential.mjs` / `SUCCESSOR_LEDGER.json` / `CANDIDATE.md` | `b2ebb197f0dc…` / `4c71f07d3d7b…` / `2a4397e72d8d…` |
| FREEZE-5 tree (differential base) | `.claude/worktrees/v1-core-ncc` at `f40fbe1`, with the same r6-provenance hash |
| Node | v24.19.0, Windows. No iPhone claim |

## 2. Checks run

| # | Check | Result |
|---|---|---|
| C1 | Full suite on 774fcf0 (`node --test`) | **1820 / 1783 / 37.** The failing titles are identical to `evidence/suite-cycle1.txt`. Against FREEZE-5 (`suite-963547b.txt`, 31 failures): **0 gone and 6 new**, and the 6 are exactly the ledger's (F1:101, F3:162, lineage LONG, NCC's lineage successor, RWS-B-01 successor-fix-forward:105, the ncc-freeze test). Two of the 31 now fail one assertion earlier: see QRE-O1-03(a) |
| C2 | Focal tests (15) on the four commits | f40fbe1 fails 11/15, and 8 of the first 12 are RED as claimed. 1d418d1 fails only P4 and SEC-O1-01a. 24ca2ae fails only SEC-O1-01a. 774fcf0 passes 15/15. Every RED claim holds |
| C3 | Mutants, each killed by focal, successor or NCC tests (in-place swap on the extract, restored afterwards, hash re-checked) | **Killed:** M1 no head-on `keepVoice` (16 tests); M2 no speaker rule; M3 no `voicesOf` fallback; M4 `keepVoice` with no input hash; M5 no `keepVoice` on the quarantine path; M9 fallback for known speakers only (the 24ca2ae state); M10 kept voice merged into `mergedSourceIds`; M11 speaker rule also skipping the named id. **Survived the suite:** M6 (borrowed-activity guard removed), M7 (`keepVoice` does not index `byEvent`), M8 (`keepVoice` does not bind the activity) and M12 (overwrite instead of `hasOwn` return, which looks unreachable) |
| C4 | Differential against the mutants (O1=1; EXT, EXT+MONO and base; 3000 cases, seed 1) | **Caught:** M3 (UNEXPLAINED 1–4); M7 (rows lost 4–8, re-read unstable 6–19); M8 (rows lost 4–11, double activity 4–13). **Not caught:** M6, M9 and M12 (UNEXPLAINED 0, invariants 0). M6 is caught by nothing: see QRE-O1-01 |
| C5 | Differential reproduction | `O1=1 EXT=1 … 3000 2` and `O1=1 … 3000 2` (base-late) are byte-identical to the recorded `differential-ext-late-2.json` and `differential-base-late-2.json`, once the `size` field is removed. The 12 recorded JSONs total 105,754 passes, 19,537 differing, UNEXPLAINED 0, every invariant 0, lost/orphan/double/re-read/round-trip/nondeterministic 0 |
| C6 | Class-width audit (instrumented copy of the harness: credit gained outside the claimed classes; passes where ≥2 identities differ, re-classified per identity) | See QRE-O1-03(b) and QRE-O1-04. Credit is gained outside VOICE_AGREES, CHAIN and SPEAKER_RULE for 24 identities, across 6 classes. In every sample I read, the gain is either the original agreeing row kept in force because a correction was refused for integrity, or a same-speaker re-sync. Credit is never gained through a disagreeing voice: `unmergedVoiceOnCleanRow` = 0 is checked across the whole pass, whatever the class. Per-identity classes return on the first identity: 15–40 multi-identity passes per configuration, 1–11 per-identity UNEXPLAINED projections. The samples I read are cross-identity effects of explained mechanisms (event-id reuse, a borrowed activity) |
| C7 | Fate accounting | `fates()` still visits every incoming event id and compares refusal multisets on both trees. A refusal or admission on only one side, or a changed reason, must be explained. No gap found |
| C8 | P4 invariant, added by QRE (a clean row made by a correction of a carried dispute holds a voice of every speaker the correction does not speak for) | Candidate: 0 of 166 (base), **1 of 443 (EXT) and 1 of 430 (EXT+MONO)**. M3 gives 52–214. The two candidate hits are QRE-O1-02; FREEZE-5 produces the same final record |
| C9 | Engine persistence (`v1-safety-index.mjs` via `test/v1core-helpers.mjs`): a device run, then the athlete's symptom stop | The flagged row holds voices `q-dev` and `q-stop`, no `mergedSourceIds`, status CONFLICTED. Re-read ×3 with a JSON round trip of the whole envelope between them: row byte-identical. Probe repeated, and from a restored copy: identical answers. Replay of both voices: unchanged. `restartAfter(18)` is PROPOSED, and the plan-A row is byte-identical after the restart and after a plan-B review. In plan B the athlete corrects the stop to the device's amount: settled, with both voices merged. Plan B week 0 completed = 0 |
| C10 | Legacy record (FREEZE-5 shape: a flagged row with no parts) | Re-read as before (flagged, no parts). A new head-on report adds its voice (`l-dev`, `l-stop`). This holds at engine level; the focal test whose title claims it does not assert it (QRE-O1-03(d)) |
| C11 | `restartIntake` (f08) | Covered by the focal SEC-NCC-02 tests (ASK, the later declaration standing, an admitted stop, integrity cases). P2 reading as on FREEZE-5 (focal "never dose" test) |
| C12 | Freeze preservation | `v1core-freeze-5.mjs --check` and `--preserved` (unedited) both exit 1 on one line: `CHANGED and not declared` for the two added O-1 tests. `--check` stops at that step before its hash comparison, so I compared every `RUNTIME_FREEZE_*.json` by hash myself. FREEZE-5 is 59/60, with only `src/r6-provenance.mjs` changed. Every other record has exactly the drift it has on the FREEZE-5 tree: Core 1–4 and V1_1 as already declared; RC 30/30, RFC 163/163, STR 121/121; RWS_1/2 as before. Sporting freezes are untouched. The `--preserved` lines for FREEZE-1…4 and the sporting freezes match the record |
| C13 | Performance | Differential `size` reproduced: record bytes ×1.039 (EXT-2) and ×1.030 (base-2); normalizer ×0.99. Largest row: +88 B (EXT-2) and **+154 B** (base-2). The bench file shows ×0.96–1.02 on dispute-free journeys. I did not re-run the bench: its journeys hold no dispute, and the differential timing covers the O-1 path |

## 3. Findings

### QRE-O1-01: the borrowed-activity guard on the quarantine path is unpinned (medium; **blocks the freeze**; test-only)

The guard is `(!boundTo||boundTo.identity===identity)` on the `IDENTITY_QUARANTINED_BY_CONFLICT` path. Removing it (M6) passes the whole suite and all three differential configurations.

It is load-bearing. Reproducer, with M6 against the candidate:
1. One review holds Z (sz, `hk-z`, reported 11-05 12:00), X1 (sx, 40 min, 11-03 12:00) and X2 (sx, "not done", 11-03 13:00), so sx is flagged head-on.
2. The next review brings B (sx, `hk-z`, 30 min, 11-03 14:00).
3. **Candidate:** B is refused and not kept. Re-read ×3 is stable.
4. **M6:** B is kept on sx. At the first re-read, **Z (another session's run) is refused `ACTIVITY_BOUND_TO_TWO_SESSIONS` and leaves the record.**

The generator never sends a plain report with another session's activity on a disputed identity, and no focal test does either. The S3 borrowed-activity case meets an undisputed row.

M7 and M8 (the in-batch `byEvent` and activity bindings of `keepVoice`) also survive the suite and are caught only by the differential, which is not a suite test.

**Close:** focal tests that are RED on M6, M7 and M8 and GREEN on `b206416f`. Examples:
- the reproducer above;
- in one review, a correction of a kept voice, which must equal the three-review outcome;
- in one review, another session's report carrying a kept voice's activity.

### QRE-O1-02: a quarantine with no flagged row in force lets a correction retire another speaker's voice unheard (medium; pre-existing, FREEZE-5 gives the same final record; does not block the synthetic freeze; binds with SEC-O1-02 before real athletes)

Reproducer (normalizer, `incoming:true`, observed 11-05 09:00):
1. The record holds M1 (s1, athlete, 20 min), W1 (s1, device `hk-1`, 40 min) and M2 (s2, 40 min). s1 is flagged with voices M1 and W1.
2. One review brings:
   - C0 → M1 (athlete, 40 min, 13:00): agrees with W1, merged and clean;
   - a report on s1 with event id **M2** correcting C0 (30 min, 14:00): `EVENT_ID_REUSED_WITH_DIFFERENT_FACTS`, which flags s2 and **quarantines s1**, whose row in force is clean;
   - A9 → M1 (athlete, "not done", 15:00).
3. **Result:** A9 is in force, clean, "not done", with no voices. The device's 40 min (W1) is retired unheard.
4. Sent as three reviews, the same reports leave the dispute standing (C0 flagged with voices A9, C0 and W1).

**Mechanism:** `heldBefore` is true, but `voicesOf` looks only for a `conflicted` row, so nothing is inherited and `admit` retires every row on the identity.

So the P4 claim "no voice is retired unheard" (CANDIDATE §A.3) holds only while the quarantine has a flagged row in force. This is the SEC-O1-02 class through a second trigger (event-id reuse, besides `ACTIVITY_BOUND` and OOS-1), and with a P4 and SB-1 consequence, not only a lost stop.

**Close:** the SEC-O1-02 fix also covers this trigger, the reproducer keeps W1 as a voice (dispute stands), and the C8 invariant reads 0 in the 12 configurations.

### QRE-O1-03: four record claims are inexact (low; **blocks the freeze record**, record-only)

- **(a) §C.** "31 failures at the same locations" holds for 29. Two fail one assertion earlier:
  - `v1rws-fix-forward.test.mjs:285` now fails at :298 instead of :316;
  - the lineage EASY matrix now fails at :203 instead of :205.

  In both, the first O-1 move now masks the old one. Both are covered: their successor chains (closure-2 `successor-fix-forward`, then the O-1 successors) pass whole. The ledger should say so.
- **(b) §D.** "Credit is gained only in VOICE_AGREES, CHAIN_TO_KEPT_VOICE and SPEAKER_RULE" is false. Credit is also gained in ACTIVITY_OF_KEPT_VOICE (13), REPLAY_OF_KEPT_VOICE (4), ID_HELD_BY_KEPT_VOICE (4+1), VOICE_CARRIED (1) and DISPUTE_STAYS (1). In every case sampled, this is an agreeing row kept in force when an integrity refusal blocked a correction, or a same-speaker re-sync. The record should state that the true guarantee is `unmergedVoiceOnCleanRow` = 0.
- **(c) §F.** The `size` figures are absent from the 12 committed JSONs, which were written before the field existed. The rerun reproduces the ratios, but the largest row grows by up to +154 B, not "at most +111 B". The evidence should be re-emitted with `size`, or the claim corrected.
- **(d) Focal test title.** The test "a record written before this line … the next head-on report adds its voice" asserts only the re-read. The assertion should be added (C10 shows it holds), or the title fixed.

### QRE-O1-04: limits of the differential as a gate (low; does not block; tooling)

- The generator has no unknown or third speaker, so M9 (the SEC-O1-01a defect) is invisible to it.
- The generator never sends a plain report with a borrowed activity on a disputed identity (M6).
- No invariant checks P4: C8 found QRE-O1-02 only by adding one.
- DISPUTE_STAYS, VOICE_AGREES, SPEAKER_RULE, VOICE_CARRIED and OWN_SPEAKER_E1 return on the first matching identity and never look at the pass's other identities. This is the NCC lesson in a new form. I found no absorbed defect, but nothing in the harness prevents one.

**Close (with the SEC-O1-02 line):**
- generator sources for unknown speakers and borrowed activities;
- the C8 P4 invariant;
- every differing identity must be explained, not only the first.

### Observations (no condition)

- **OCCURRENCE_PER_SSCTR_A (13 passes).** The candidate reads an occurrence for the pause where FREEZE-5 did not, because the row is now a correction in conflict whose every voice says the session took place. This follows the existing C-F01-1 r2 (ii) and SSCTR decision A. It is noted for the C-O1-2 owners.
- **ACTIVITY_OF_KEPT_VOICE.** A correction carrying a kept voice's activity is now refused for integrity, so its content, for example "not done", is not kept, by design (P3).
- **M12** (overwrite of an existing part) is not reachable through `byEvent` on any record I could build. No test is asked for.
- **O-O1-1** (sizing source 365 → 360) is confirmed only through SSCTR's lineage evidence. QRE ran no dose matrix.

## 4. Conditions

| ID | Blocking (freeze) | Runtime change | Owner | Closing evidence |
|---|---|---|---|---|
| QRE-O1-01 | **Yes** | No (tests only) | Core (author) | New focal tests RED on M6, M7 and M8 and GREEN on `b206416f`; full suite re-run; ledger updated |
| QRE-O1-03 | **Yes** (before the FREEZE-6 record is written) | No (record) | Author | CANDIDATE §C, §D and §F and the ledger corrected; differential JSONs re-emitted with `size`; test 12 assertion added or title fixed |
| QRE-O1-02 | No; binds before real athletes, with SEC-O1-02 | Yes (normalizer) | Core, with QRE and Security | The reproducer keeps W1 (dispute stands, or the voice carried); C8 P4 invariant 0 in 12 configurations; SB-1 still asks |
| QRE-O1-04 | No | No (evidence tooling) | Author, with QRE | Generator covers unknown speakers and borrowed activities on disputed identities; P4 and whole-pass identity checks in `differential.mjs`; M6 and M9 caught by it |
| Carried | As recorded | — | — | SEC-O1-01b/c, SEC-O1-02, SEC-O1-03, C-O1-2, C-O1-3, C-O1-5, C-F01-2, SEC-CORE-03, C-NCC-3, SEC-NCC-03, OOS-1/2 and IOS_REVALIDATION_PENDING are unchanged by this review |

QRE re-check: once QRE-O1-01 and QRE-O1-03 close, a narrow re-check is enough: the new tests against M6, M7 and M8, the suite totals, and a record diff. No second fix cycle is expected.
