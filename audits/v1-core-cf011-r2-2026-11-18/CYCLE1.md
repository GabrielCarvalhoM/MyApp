# C-F01-1 r2: the focal correction cycle (one, used)

**Input:** three reviews of candidate `3f0b04f`, committed as received (`317ec5b`):
- SSCTR_R2_R1: ACCEPT_WITH_CONDITIONS, nothing blocking;
- SEC_R2_R1: PASS_WITH_CONDITIONS, SEC-R2-01 blocking;
- QRE_R2_R1: READY_WITH_CONDITIONS, C1 and C2 blocking the `--write`.

**Cycle candidate:** `37c0f6f`. The runtime change stays in `restartIntake` (`src/v1-f08.mjs`), and nothing else moves. `executed`, the bound and its amount are the `3f0b04f` bytes.

| Condition | What was done | Evidence |
|---|---|---|
| **SEC-R2-01** (blocking) | A row marked replaced keeps its voice for `trainedAfter` unless the record holds its replacement (same session, else same activity). DECISION §6. | Tests: **D9** (inverted; 3f0b04f gave the declaration standing in); **SEC-R2-01** (both engine-written orphans after a declaration, through the normalizer, after a restore, and ASK through `restartProgram`); **controls** (a legitimate "not done" through the normalizer still lets the declaration answer; a chain of corrections is history; the watch against "not done" is asked). D9 and SEC-R2-01 fail on the `3f0b04f` runtime. |
| **SEC-R2-02** (hardening) | `occurred` admits only well-formed voices. | Test **SEC-R2-02**: five malformed parts give no occurrence, and the control does. It fails on `3f0b04f`. |
| **SEC-R2-03** | Routed as an independent issue: the normalizer retires the original before the correction is accepted. DECISION §6 gives severity and owner. | Not changed (`r6-provenance.mjs` is untouched). |
| **QRE-R2-01 / C1** (blocking) | New test: P4, then a further correction to "not done", through the normalizer. | Test **QRE-R2-01**. On a copy, mutant M06 (`superseded!==true` removed from `occurred`) fails it, 35/36, and the copy was restored and byte-checked. It passes on the cycle candidate. |
| **QRE-R2-02 / C2** (blocking) | Fresh full-suite evidence on the cycle candidate. CANDIDATE §4 count corrected to 1744. | `evidence/suite-37c0f6f.txt` (below). |
| **QRE-R2-03 / C3**, **SSCTR C-R2-2** | Residual line for both variants of the window (a "not done" or a disputed session older than 28 days). | DECISION §6. Owner: the next Core mission with Data, then SSCTR. |
| **QRE-R2-04 / C4** | Pinned: a row with minutes only (stopped early), a row with a completion only, and the strict boundary at the declaration instant. | Test **QRE-R2-04**, which kills M30, M31 and M27. |
| **QRE-R2-05** | Informational. A record with conflicted rows costs about ×1.12 (+0.28 ms) in QRE's micro-bench. Not material. | — |
| **SSCTR C-R2-1** | The return-floor lift is named. | DECISION §6. |
| **SSCTR O-1, O-2** | Observations carried to the final report: the non-monotonic start classes (B0-F05), and telling the athlete that the start was lowered to the record (Product/UX). | — |

**Tests:** `v1core-cf011r2-restart-evidence.test.mjs` is now **36/36** (31 + 5). On the `3f0b04f` runtime it gives 33/36: D9, SEC-R2-01 and SEC-R2-02 fail; QRE-R2-01 and QRE-R2-04 are guards.

**Full suite on `37c0f6f`** (`evidence/suite-37c0f6f.txt`): **1749 / 1721 / 28**. That is 1744 plus the five cycle tests.
- 27 failures are the same locations as on `3f0b04f`: the 24 inherited plus the three re-pinned.
- The 28th is `v1core-cf011r2-freeze.test.mjs:12`. During the run, `CYCLE1.md` was an untracked file in the audit folder, which check (iv) refuses. This is a working-tree artifact, not the runtime.
- Once this record and `CYCLE1.md` (now bound by `v1core-freeze-3.mjs`) were committed at `944d9fb`, that test passes (1/1). So on the committed tree the suite is **1749 / 1722 / 27**.

**Rechecks requested, narrow, on `37c0f6f`:**
- Security: SEC-R2-01 and -02;
- QRE: C1, C2 and the runtime delta;
- SSCTR: a confirmation that the delta moves no dose. Its re-review trigger is any change to `restartIntake`.

There is no second cycle. Under the bounded-cycle rule, a blocker found in the rechecks closes this line BLOCKED or PARTIAL.
