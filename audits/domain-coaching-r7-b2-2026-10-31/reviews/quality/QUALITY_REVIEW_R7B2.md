# R7-B.2 narrow Quality review: R7B2-QUALITY-r1 (the one review, on R7B2-FREEZE-1)

| | |
|---|---|
| Freeze | R7B2-FREEZE-1, record `CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`, sha256 `8d51def5…fee` (checked); commit `1a1c728`; source `57512322…ecbd`, manifest `f9c5bd5a…ceca`; 122 files, 799 tests |
| Identity | `verify-r7b2.mjs --tests` 35/35 PASS before; `verify-r7b2.mjs` 34/34 PASS after the probes and after these files (see the end) |
| Predecessor | R7B1-FREEZE-2 (`146ebb8`), full `git archive` in `%TEMP%/r7b2-quality-r1-s6-pred`. All 114 files match its record (`e75a2799…`). Deleted afterwards. |
| Judge | Fresh `quality-reliability-engineer`, `claude-opus-5-5` / `xhigh`, session 6. Not the Engineering judge, not the author, not an R7-B.1 judge. I fixed nothing; I judged routing, not clinical content. |
| Record | [QUALITY_REVIEW_R7B2.json](QUALITY_REVIEW_R7B2.json); probes in [probes/r1/](probes/r1/), outputs in `probes/r1/out/`. The run-5 files in `probes/` were left untouched and not relied on. |

## Verdict

READY on this gate's scope. The constitution state is QUALITY_READY_WITH_CONDITIONS, so this is not a plain READY: two conditions sit with the coordinator (below).

QE-R7B2-01 reproduces byte for byte from verbatim copies. Every changed decision on a contract-conforming review is the handler's own clinical route, on a review that carries a clinical signal. On none of them does the actual ledger change, a proposal's content change, a dose get proposed, or clinical-screen-first get bypassed.

The differential is **not** complete with only the QE-R7B2-01 class added. It is complete with this review's enumeration: 848 rows per runtime, every class-(b) exit × both proposal sources × every choice shape.

## Q1. G4 completeness

**How the change works.** R7-B.2 differs from FREEZE-2 only where `clinicalRoute` is not null (`src/r6-adaptation.mjs:368–372`).
- On those reviews FREEZE-2 answered one of: the late-evidence question, the factual re-plan's own question, the report-identity question, or the block-choice or unrecognised-choice question in place of one of the first two.
- `withFactualReplan` attaches the canonical factual state's proposal and disclosures to every one of those questions except the factual re-plan's own question.
- That state has **two** proposal sources:
  - `factualReplan`;
  - `graduationWithdrawal`, which is state-derived and works whether or not the return anchors the week.
- U3 and the Engineering judge exercised only the first source.

**Results** (`q1-enum.mjs`, `q1-breakdown.mjs`):

| Exit on FREEZE-2 | Proposal source | Signal rows | Class |
|---|---|---|---|
| Report identity (same-id resend) | none | 120 | nonclinical question → CLINICAL, no proposal (§5 shape i) |
| Report identity | factual re-plan | 140 | QE-R7B2-01 shape |
| Report identity | graduation withdrawal | 60 | QE-R7B2-01 shape, plus a dropped `RUN_QUALITY_GRADUATION_WITHDRAWN` disclosure (**new**) |
| Late evidence (`staleReturn`) | none, including 144 rows with corrections over three return timings | 212 | §5 shape i |
| Late evidence | graduation withdrawal | 32 | QE-R7B2-01 shape on the late-evidence path (**new**; Engineering and U4 say "not found") |
| Factual question (CAND-01) | — (it carries none) | 24 | §5 shape i |

**Coverage of the QE-R7B2-01 class.** All 8 choice shapes carry the proposal on FREEZE-2: none, empty, ladder, declined, accepted, main change, unrecognised, null entry. So do the 5 clinical-fact forms, strength and run corrections, and weeks 4 and 5.

**Branches that cannot change.**
- The report-identity KEEP branch is unreachable with clinical facts.
- No FREEZE-2 HOLD appeared on any signal row.

**Controls.** All 260 nonclinical controls are identical on both runtimes.

## Q2. Changes outside §5

- **92 rows, the graduation-withdrawal family (QR7B2-01).** Same mechanism as QE-R7B2-01, from the other source. The disclosure is dropped, and R7-B.2's plan in force keeps THRESHOLD runs the withdrawal removes: up to 25 sessions above FREEZE-2, 9–10 of them THRESHOLD instead of EASY.
- **2 rows without a JSON-expressible clinical signal (QR7B2-03).** A non-JSON reason now gives HOLD where FREEZE-2 asked.
- **Everything else holds:**
  - 0 changed among the 258 JSON controls without a signal;
  - 0 proposal-content differences;
  - 0 ledger differences;
  - pending changes only as the route itself;
  - disclosures are dropped only together with the factual proposal;
  - R7-B.2 proposes nothing on any changed row.
- **Plan in force.** It stays the pre-review plan, which is above FREEZE-2's applied re-plan on all 232 rows of the QE-R7B2-01 family. The handler's own route with the same correction does the same on **both** runtimes (controls XA, XB, XD): this is the existing rule "a clinical route proposes nothing".

## Q3. Truthfulness and pickup

**The route is truthful** (S5R2 on R7-B.2, `q3-after-route.mjs`):
- the handler's exact reason (byte-equal to the new-id route);
- no proposal, horizons, disclosures, counterfactuals or question;
- `planValidity` REQUIRES_RECONCILIATION and pending CLINICAL_HUMAN_REQUIRED;
- both correction rows and their superseded originals are in `actualLedger`;
- the scope is not an output field on either runtime.

**Pickup of the correction depends on its source:**
- **Graduation withdrawal:** the very next review with no signal and no pending clinical state re-derives it. On the same-id exit it is a MODIFY with the disclosure; on the late-evidence exit it comes with the late-evidence question. The quality sessions ahead then go to 0. Carrying the clinical reference state, the route stays CLINICAL.
- **Factual re-plan:** no later review re-derives it mid-week. The next review is KEEP, and the week's remaining sessions keep the rows planned before the correction. The correction is read from the next week's start (week 6 differs from the same history without the correction).

The factual-source behaviour is **pre-existing**: identical on FREEZE-2 and R7-B.2 for the handler's route (XA). B.2 makes it reachable in more states (QR7B2-02). It is skipped, not deferred.

## Q4. Records

**What is in order:**
- QE-R7B2-01..04 are in U4 with severity and origin.
- Owners are named for QE-R7B2-02..04. QE-R7B2-01's owner (Chief / U4) is in the Engineering table only.
- R7B2-OBS-01 is cited by reference, with its origin and owner in `BLOCKER_CLOSURE_R7B2.md` and the freeze record.

**What is now wrong or incomplete, beyond what U4 supersedes (QR7B2-04):**
- (a) "Not found: the same shape on the late-evidence path" (found: group D).
- (b) The case is described from the factual re-plan source only.
- (c) "Not re-planned from the correction until the human route resolves", in U4's next unit and in the SSCTR request. For the factual source the re-plan never comes.

The U3 note's grid claims stay true for its grid.

## Findings

| Id | Severity | Origin | Bypass | Blocking | Owner |
|---|---|---|---|---|---|
| QR7B2-01 | MAJOR | Introduced by B.2 (same mechanism as QE-R7B2-01, second source) | No | Not for this gate; closure condition for G8/G9 | Chief/U4: new record; explicit SSCTR disposition of groups B, B2, D |
| QR7B2-02 | MINOR | Pre-existing (residual-authority closure, QE-R7ADA-01); reach extended by B.2 | No | No (§10) | Next runtime mission (Engineering) with the SSCTR (D44); bears on R7B2-SSCTR-r1 Q3 |
| QR7B2-03 | OBSERVATION | Introduced by B.2 (earlier screen); non-JSON input only | No | No | Next runtime mission (Engineering), optional admission check |
| QR7B2-04 | OBSERVATION | Records (U4, R7B2-ENG-r1, SSCTR request) | No | No | Chief/U4: new record only |

**Conditions on this READY (owner Chief/U4):**
1. The SSCTR gate covers QR7B2-01 explicitly before G8/G9.
2. This differential and the QR7B2-04 corrections are recorded in a new record.

This review does not stand in for the SSCTR gate and does not reopen the Engineering gate. No runtime change and no correction cycle are requested.

## Rules kept

- **Read-only** outside `reviews/quality/probes/r1/` and these two files. No commit, nothing in `src/`, the tests, the evidence, the freeze records or the mission files edited.
- **Scripts:** no `--write`, no mutate or freeze script, no `npm run verify`.
- **Isolation:** the SSCTR judge's files and temporary directories were not touched. No background command was started.

## Final identity check (after these files)

`node CoachingCore/scripts/verify-r7b2.mjs`: 34/34 PASS. The record sha256 is unchanged, and `git status` shows no tracked file modified; the only new files are this folder's and the SSCTR judge's own.

R7B2_QUALITY_GATE = READY
