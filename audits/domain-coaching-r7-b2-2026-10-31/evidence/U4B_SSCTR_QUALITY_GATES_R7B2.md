# R7-B.2 — U4b gate record: SSCTR and narrow Quality reviews on R7B2-FREEZE-1

Session 6 (supervised), coordinator Claude `claude-opus-5-5` / `high`. This is a new record. It does not edit U3 (`U3_EVIDENCE_R7B2.md`), U4 (`U4_ENGINEERING_GATE_R7B2.md`), the Engineering review or the freeze; where they are now wrong or incomplete, the corrections are recorded below.

## Bytes judged

- **Freeze.** R7B2-FREEZE-1: record `CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`, sha256 `8d51def566f2ce8f140cb3dcf22d62d0699be73571d5d931d8f5e2e50fb59fee`, freeze commit `1a1c728`. The coordinator re-checked the sha256 at the start of session 6.
- **Verifier.** `node CoachingCore/scripts/verify-r7b2.mjs --tests` gave 35/35 PASS before dispatch (capture `.agent-runtime/captures/2026-11-01T12-12-04-129Z-node.log`). Each judge re-ran it before and after its work, and the coordinator re-ran it after both reviews (below).
- **Predecessor.** R7B1-FREEZE-2 (`146ebb8`), extracted as a full `git archive` by each judge into its own temporary directory outside the repository. All were deleted afterwards.

## Interrupted run-5 dispatch

Session 5 dispatched both judges in the background and ended its turn, so the supervisor stopped them before they wrote any verdict (`.agent-runtime/sessions/0005.stderr.log`).
- **Their partial probes.** Classified per the Founder resolution of 2026-11-01T12:11Z and committed at `9269164`, with `probes/INTERRUPTED_RUN5.md` in each folder. They are not a review.
- **Session 6.** Dispatched one fresh instance of each judge in the foreground; their probes are under `probes/r1/`. Each gate therefore has exactly one review.
- **Leftover temporary directories.** Run 5 left `%TEMP%/r7b2-ssctr-judge-pred`, `%TEMP%/r7b2-quality-r1-pred-366` and `%TEMP%/r7b2-pred-McCNdx` outside the repository. They are reported, not deleted.

## Reviews

| Gate | Review | Instance | Verdict | Files (sha256) |
|---|---|---|---|---|
| SSCTR | R7B2-SSCTR-r1, plus addendum R7B2-SSCTR-r1-A1 (same instance, same review) | fresh `sports-science-concurrent-training-reviewer`, `claude-opus-5-5` / `xhigh`, `productization` | **ACCEPT_WITH_CONDITIONS** (A1 supersedes r1's line, with the same verdict) | `reviews/ssctr/SSCTR_REVIEW_R7B2.md` `d2f6fbd7…397a`, `.json` `b0383a29…53cb`; `SSCTR_REVIEW_R7B2_ADDENDUM_1.md` `2ed384bb…f43f748`, `.json` `a56c3030…f98669` |
| Quality (narrow) | R7B2-QUALITY-r1 | fresh `quality-reliability-engineer`, `claude-opus-5-5` / `xhigh`, `productization`; not the Engineering judge | **READY** (constitution state QUALITY_READY_WITH_CONDITIONS) | `reviews/quality/QUALITY_REVIEW_R7B2.md` `8b47d8bb…676e`, `.json` `d23c5ad6…ff129` |

**Why the addendum.** The two judges ran in parallel. Quality found a second proposal source with the QE-R7B2-01 shape, the run-quality graduation withdrawal (QR7B2-01). It made an explicit SSCTR disposition of that family a condition for G8/G9, and the SSCTR's r1 had covered only the factual re-plan source, as its request framed it. The coordinator asked the same SSCTR instance, within its one review, for a scoped addendum on groups B, B2 and D. This is not a second SSCTR review; r1's files are committed unchanged at `003b612`.

## Results

**SSCTR (r1 + A1).**
- QE-R7B2-01 is acceptable: on an illness or injury signal, a clinical route that proposes nothing is what clinical-screen-first and no-dose-instead-of-referral require. FREEZE-2's question-with-re-plan was the defect.
- Only routing changed. No SSCTR record needs a new revision, no queue entry is proposed, and the queue stays at 230.
- Groups B, B2 and D (graduation withdrawal) are each ACCEPT: the withdrawal is state-derived, and the first admitted review re-derives it exactly as FREEZE-2 applied it.
- Conditions:
  - C1: SSCTR-R7B2-01 is resolved before any use beyond the offline reference.
  - C2: never by attaching a re-plan or dose to a clinical decision.
  - C3: the R7B1-SSCTR-r2 routed items, QE-R7B2-02 and QE-R7B2-03 stay with their owners.
  - C4: while CLINICAL_HUMAN_REQUIRED is pending, no session is presented as current or prescribed; after a documented human resolution, an admitted review re-derives the factual state before any session is presented.
- C1–C4 bind use beyond the offline synthetic reference. They require no B.2 runtime change.

**Quality.**
- The differential is complete with the judge's enumeration: 848 rows per runtime, covering every class-(b) exit × both proposal sources × every choice shape.
- 0 ledger differences, 0 proposal-content differences and 0 of 260 nonclinical controls changed. No dose is proposed on any changed row, and nothing bypasses clinical-screen-first.
- The route output is truthful.
- No runtime change and no correction cycle requested.

## Findings recorded by these reviews

| Id | Severity | Origin | Bypass | Blocks | Owner |
|---|---|---|---|---|---|
| QR7B2-01 | MAJOR | Introduced by B.2: QE-R7B2-01 shape from the graduation-withdrawal source, on the report-identity exit (60 rows) and the late-evidence exit (32 rows). The RUN_QUALITY_GRADUATION_WITHDRAWN disclosure is dropped, and THRESHOLD runs stay in the plan in force | No | No. The closure condition was an SSCTR disposition, which A1 gave (ACCEPT for B, B2 and D) | Chief/U4b, **disposed** by R7B2-SSCTR-r1-A1; residual window → SSCTR-R7B2-03 |
| QR7B2-02 | MINOR | Pre-existing (QE-R7ADA-01); reach extended by B.2 | No | No (§10) | Next runtime mission (Engineering) with SSCTR (D44) |
| QR7B2-03 | OBSERVATION | Introduced by B.2: a non-JSON reason now gives HOLD instead of a question (2 rows); fails closed | No | No | Next runtime mission (Engineering), optional admission check |
| QR7B2-04 | OBSERVATION | Records: U4, R7B2-ENG-r1, the SSCTR request | No | No | Chief/U4b: corrected in this record (below) |
| SSCTR-R7B2-01 | MINOR | Pre-existing (QE-R7ADA-01 with the factual re-plan trigger); B.2 extends its reach to the same-id resend | No | No | Next runtime mission (Engineering), with SSCTR and Data |
| SSCTR-R7B2-02 | OBSERVATION | Pre-existing: no runtime input represents a human resolution of a clinical dependency | No | No | Founder/Product (service model), with Engineering and the qualified-human route |
| SSCTR-R7B2-03 | MINOR | Pre-existing (handler's own route, identical on both runtimes); B.2 extends its reach (QR7B2-01) | No | No | Next runtime mission: Engineering, with Product/UX and SSCTR |

QR7B2-02 and SSCTR-R7B2-01 describe the same behaviour from the Quality and SSCTR sides. A factual correction recorded by a clinically routed review is read only from the next whole-week review; the rest of the current week is not re-planned from it.

## Record corrections (QR7B2-04; the original records are not edited)

1. **U4 and R7B2-ENG-r1, "not found: the same shape on the late-evidence path".** Wrong. Group D (32 rows): the late-evidence question with an attached graduation withdrawal changes to CLINICAL_HUMAN_REQUIRED with no proposal.
2. **U4, the framing of QE-R7B2-01.** Incomplete. The case is described from the factual re-plan source only. It also arises from the graduation-withdrawal source (QR7B2-01, groups B, B2 and D).
3. **U4 "Next unit" and the SSCTR request, "not re-planned from the correction until the human route resolves".** Inaccurate for the factual source: a later review in the same week does not re-plan, even once no clinical state is carried; the correction is read from the next week's start (QR7B2-02, SSCTR-R7B2-01). It is accurate for the graduation-withdrawal source, which the first admitted review re-derives.
4. **QE-R7B2-01's owner.** U4's table names none. It is DOMAIN_COACHING_R7-B.2 U4b, and it is now disposed: SSCTR ACCEPT (r1 Q1) and Quality READY (r1 Q1–Q3).
5. **The freeze's `routing.conditionHolds = true` and U3's "G4 reading".** Superseded for routing, as U4 already records (R7B2-D15). U3's grid claims stay true for its own grid. The freeze record is not edited.

## Gate states after U4b

- R7B2_ENGINEERING_GATE: **READY** (R7B2-ENG-r1).
- R7B2_SSCTR_GATE: **ACCEPT_WITH_CONDITIONS** (R7B2-SSCTR-r1 + A1). Conditions C1–C4 are routed; they bind use beyond the offline synthetic reference, not B.2's runtime.
- R7B2_QUALITY_GATE: **READY**, with conditions. Both are met: the SSCTR disposition of QR7B2-01 (A1), and the differential and record corrections in a new record (this file, with the judge's `probes/r1/`).
- **G8.** Holds: the Engineering judge accepts, and SSCTR and Quality are reviewed as §5 requires.
- Correction cycles used: 0. No judge reported a narrow runtime issue caused by B.2 that needs correcting; U5 is not entered.

## Next unit

U6 closure (contract §6, `claude-opus-5-5` / `high`):
- the final disposition against G1–G9;
- the closure handoff and the `CoachingCore/r7/b2` README;
- closed blocks in CURRENT_MISSION and MISSION_LEDGER (insert-only);
- push, with remote HEAD verified.

The routed findings above, and the R7-B.1 routed minors, carry into the handoff with their owners. `V1_COACHING_AUTHORITY_READY` stays NO, and R7-C is not authorized.
