# QRE BC R2: narrow recheck of the single corrective cycle

**Judge:** Quality & Reliability Engineer (independent; not the author). **Synthetic only.**

**Version judged:** `220c005` (the cycle), recorded in `74aebb0`. `git diff 220c005 74aebb0 -- CoachingCore` is empty: the record commit touches only `audits/`.

**Over:** QRE BC R1 on `6e85222`.

**Scope:** only my R1 conditions as `CYCLE1.md` disposes them, the one corrected test, and the cycle diff itself. This is not a new review.

## Verdict

**READY.** All five R1 conditions are closed on `220c005`. The cycle's own runtime change (SEC-BC-01, Security's finding) regresses nothing I can see by title, by probe or by mutation.

**REPMILE-COACHINGCORE-V1-RC-1 may be written on these bytes**, by the procedure under C-BC-5 below.

## Commands

- **Copy.** A fresh scratch clone of the worktree, checked out at `220c005` (`git -c core.longpaths=true checkout -f`), with `node_modules` copied in. The suite ran there with `core.longpaths` set through the process environment only.
- **Suite.** `node --test` in `CoachingCore/`, failing titles compared with `evidence/titles.mjs` against my R1 clone runs of `ee256ae` and `6e85222`.
- **Probes.** `probes/p01-boundary-edges.mjs` (R1, unchanged) and the new `probes/r2/p06-cycle1-edges.mjs`.
- **RC verifier.** T6, T9 and the R1 cases, run in the scratch clone only. The record was written there with `--write --commit 220c005`, staged and never committed, then removed from the index again.
- **Mutation.** The author's copy `evidence/mutation-cycle1/` (identical to my R1 scripts except for BC01/BC02 added to `M`). I copied it to my scratchpad and ran it there: `mutate-survivors.mjs --set=boundary --only=A2,F6,C2,C5,C7,I2,I5,I6,S1,S2,S3,BC01,BC02`.

## Evidence

| Check | Result |
|---|---|
| Suite on `220c005` (`probes/r2/suite-220c005-qre.txt`, `titles-220c005.txt`) | **1934 tests, 1887 pass, 47 fail**, as the author reports. Against `ee256ae`: the **same 4 by-design titles** as R1 (tm-5, A04L, V1INT-BOUNDARY-SUCCESSOR-1, RC-1 with no record yet). Against `6e85222`: **0 new, 0 gone**. The 9 cycle-1 tests and the corrected SEC-INT-04 test pass |
| Tests edited | Only one test file of this line, `v1bc-blocker-closure.test.mjs`, in the SEC-INT-04 test only, plus the new `v1bc-cycle1.test.mjs` (8 tests). No earlier test of the project was edited |
| Mutation (`probes/r2/mutation-cycle1-boundary-qre.json`) | Baseline: 16 boundary-reaching files, 145 pass, 4 fail (by design). **13/13 KILLED**: A2, F6, C2, C5, C7, I2, I5, I6, S1, S2, S3, BC01, BC02. Each is killed by its own cycle-1 test. This matches the author's run |

## Status of the R1 conditions

| Id | R1 closing criterion | Evidence on `220c005` | Status |
|---|---|---|---|
| **QRE-BC-01** | After an erasure, the duplicate-only answer names the required screen; a focal test | p01 (a) (`probes/r2/p01-out-220c005.txt`): the re-send after the erasure answers `RUN_STOPPED_FOR_A_SYMPTOM` (it was `null` on `6e85222`). Every other p01 line is unchanged. p06 (a): that re-send now goes to the engine and writes nothing twice (session rows 1 → 1, live 1 → 1, run-format facts 25 → 25, version +1). Its replay under the same request id writes nothing (version +0; the only difference in the answer is `replayed:true`). The next duplicate takes the shortcut again and still names the screen. Test `SEC-BC-02 / QRE-BC-01` green; mutant BC02 killed | **CLOSED** |
| **C-BC-2** | The listed survivors killed (`--set=boundary` for nine; `--set=all` for A2 and F6) | 11/11 killed on the boundary set. The boundary set is a subset of the full suite, and each killer is a cycle-1 test green at the full-suite baseline (`suite-220c005-qre.txt`), so a kill there is a kill in `all`. The tests are substantive: each builds the shape the mutant changes and asserts the engine's answer | **CLOSED** |
| **C-BC-3** | `--write` requires HEAD = `--commit` and a clean CoachingCore; `--check` recomputes `fileCount` and `filesDigest`; T6 and T9 refused | `probes/r2/rc-verifier-220c005.txt`:<br>- T6a `--commit deadbeef` → `--commit must be HEAD`, exit 1, no record written;<br>- T6b an uncommitted change → `CoachingCore has uncommitted changes`, exit 1;<br>- T6c `--commit 220c` (too short) → refused;<br>- T9 (`fileCount:1, filesDigest:'x'`) and T9b (count only) → `fileCount or filesDigest does not match`, exit 1;<br>- T9c (a hash replaced with the digest recomputed) → `NOT byte-identical`;<br>- R1 T1–T4 and T8 still refused;<br>- the honest record checks 87/87, exit 0, and the RC-1 test passes with it | **CLOSED** |
| **C-BC-4** | FINAL_REPORT and the contract name `BEFORE_RECORD_START`; NATIVE_OBLIGATIONS covers the anchor, the set-aside, the date picker | The inventory row now names `BEFORE_RECORD_START`, with `index`, `field`, `firstDay`, and "the enrollment day". `NATIVE_OBLIGATIONS.md` §3.4a covers the refusal shape with `safetyFields`, the anchor from the enrollment day, the refused index set aside with the chunk re-sent, the date picker with no day before enrollment, and the safety draft kept and routed. The app-facing record is NATIVE_OBLIGATIONS. The closed V1INT contract is left as it was; I accept that. FINAL_REPORT does not exist yet and is written after the gates; it should name the code (see "Procedure for the record") | **CLOSED** (FINAL_REPORT pending by sequence) |
| **C-BC-5** | The record on a commit with exactly these bytes; suite with the three by-design titles and RC-1 green; `--check` exit 0 | Shown in the scratch clone: `--write --commit 220c005` on a clean tree writes 87 files, `--check` exits 0, and the RC-1 test turns green. The by-design titles on `220c005` are as required | **CLOSED** as a procedure (see "Procedure for the record") |

## The corrected test (SEC-INT-04 rest)

This is **a correction, not a hidden regression**.
- p06 (b) shows that `t.it.carried({actor}).lastAt` is `undefined` on both `220c005` and `6e85222`: `carried()` does not expose `lastAt`. So the old assertion compared `undefined` with `undefined`, and was vacuous.
- The new assertion reads `t.doc().carried.lastAt` (a real ISO instant, `2026-11-18T00:00:00.000Z` in p06), and first asserts that it is a finite instant.
- p06 (b) shows that the stored `lastAt` is unchanged after the erasure under a behind clock on **both** `6e85222` and `220c005`, and that the next review with the clock restored is `OK`. The behaviour the corrected test pins already held on `6e85222`, so the correction hides nothing.

**Disclosure.** My own R1 probe p01 (b), "lastAt unchanged", used the same `carried()` read and was equally vacuous. R1's claim "lastAt unchanged" rested on it. It is now demonstrated properly by p06 (b), and it holds. My R1 also did not exercise holds across the clock-behind erasure, which is how SEC-BC-01 (Security, High) escaped my R1; it is Security's finding, and they recheck it.

## The cycle diff (`git diff 6e85222 220c005 -- CoachingCore`)

| File | Change | QRE reading |
|---|---|---|
| `src/boundary/integration.mjs` (load) | SEC-BC-01: an erasure or a revocation admitted under a behind clock gets `op.at = lastAt` | Narrow: only non-mutating `eraseHealthFacts`/`setConsent` (a revocation), and only when `lastAt` is later than `op.at`. A consent grant stays mutating and is still refused under a behind clock. `lastAt` cannot move back (p06 (b)). Test SEC-BC-01 green; BC01 killed. The suite shows no other title moved |
| `src/boundary/integration.mjs` (duplicate shortcut) | `&&op.loaded?.presentation?.readings` | QRE-BC-01, above |
| `scripts/v1-rc-1.mjs` | C-BC-3; `ADDED` names `v1bc-cycle1.test.mjs` | Above. One note: `AMENDED` still describes `integration.mjs` with the R1 findings only. The record text will not mention SEC-BC-01/-02, but the bytes are bound. Optional wording, not a condition |
| `test/v1bc-blocker-closure.test.mjs` | the SEC-INT-04 assertion | Correction, above |
| `test/v1bc-cycle1.test.mjs` | new, 8 tests | Pins all of C-BC-2, SEC-BC-01 and SEC-BC-02 |

No other `CoachingCore` file changed. The engine files are byte-identical to `6e85222`: the RC check lists the same `now` hashes for the four engine amendments.

## Procedure for the record (not a quality condition)

Write `REPMILE-COACHINGCORE-V1-RC-1` with `node scripts/v1-rc-1.mjs --write --commit <HEAD>` on a HEAD whose `CoachingCore` equals `220c005`. `74aebb0` qualifies, since its `CoachingCore` diff with `220c005` is empty. Then commit the record. On that commit:
- `--check` exits 0;
- the suite shows exactly the three by-design titles (tm-5, A04L, V1INT-BOUNDARY-SUCCESSOR-1), with RC-1 green.

FINAL_REPORT names `BEFORE_RECORD_START` and its shape. Any later change to `CoachingCore` invalidates this verdict for the changed scope.

## Findings

None open.
