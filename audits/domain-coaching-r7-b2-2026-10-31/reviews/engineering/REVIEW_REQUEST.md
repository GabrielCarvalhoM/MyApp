# R7-B.2 — Engineering review request (the one review, on R7B2-FREEZE-1)

You are a fresh, independent engineering judge (`quality-reliability-engineer`). You did not author this runtime, its fix or its evidence, and you are not the R7-B.1 judge. DOMAIN_COACHING_R7-B.2 exists only to close **QE-R7B1-04** (contract [R7B2-CONTRACT-r1](../../TASK_CONTRACT.md), Founder [request](../../FOUNDER_REQUEST.md)). This is the mission's one Engineering review (contract §7 G8). The loop is bounded (§10): at most one correction cycle follows, and only for a narrow, runtime-only issue that the B.2 change itself causes. So classify the origin of every finding.

## Bytes to judge

- **R7B2-FREEZE-1.** Record `CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`, sha256 `8d51def566f2ce8f140cb3dcf22d62d0699be73571d5d931d8f5e2e50fb59fee`, freeze commit `1a1c7286adc8b08d16f97dea86f4973fe33e5a95`, over the bytes of `63fa60271efeb8451b25d9a28f7107141f716c74`:
  - source digest `57512322331f7a0295525775da8bc86da5e95fe0f2085404637498e1f8f7ecbd`;
  - manifest digest `f9c5bd5a1bb8bd6cf2a1df3298b6b9bdc62d7f951687c9e7d756889fa753ceca`;
  - 122 files, 799 tests (786 inherited + 13 new).
- **Identity.** `node CoachingCore/scripts/verify-r7b2.mjs --tests` (read-only without `--write`) gave 35/35 PASS at HEAD `d1ec207` before this request was written. Run it yourself, before and after your work.
- **Predecessor.** R7B1-FREEZE-2: record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json` (sha256 `e75a2799…`), commit `146ebb80c51d302ef3518a61c1cab208c7778632`, source `f54e5c03…`, 114 files, 786 tests. The mission base `033f300` has the same Coaching Core bytes.
- **Delta.** `git diff 033f300 1a1c728 -- CoachingCore/src CoachingCore/test`: `src/r6-adaptation.mjs` (+32 / −8) and the new `test/r7b2-clinical-precedence.test.mjs`. Nothing else in `src/` changed.

## What to read

1. This request, then [TASK_CONTRACT.md](../../TASK_CONTRACT.md) (§3 defect, §4 rule and fix shape, §7 gates, §10 correction policy).
2. [`CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md`](../../../../CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md): root cause, the precedence point, the §4 inventory (classes a/b/c), CAND-01, CAND-02 and the adjacent OBS-01.
3. [`evidence/U3_EVIDENCE_R7B2.md`](../../evidence/U3_EVIDENCE_R7B2.md): the gate table, the G4 reading (why SSCTR and Quality were not dispatched), the carried-reference-state note and the M41 equivalence argument.
4. The R7-B.1 Engineering recheck record that raised the blocker: [`ENGINEERING_RECHECK_R7B1.md`](../../../domain-coaching-r7-b1-2026-10-31/reviews/engineering/recheck/ENGINEERING_RECHECK_R7B1.md) and its `.json`.
5. The probes: K6 and K6b ([`probes/k6-stale-return-clinical.mjs`](../../probes/k6-stale-return-clinical.mjs), [`probes/k6b-stale-return-two-step.mjs`](../../probes/k6b-stale-return-two-step.mjs), verbatim copies of the R7-B.1 judge probes) and the B.2 inventory probe [`probes/b2-inventory.mjs`](../../probes/b2-inventory.mjs); their recorded outputs are in `probes/out/` (labels `B2-BASELINE-033f300`, `B2-U2-FIXED`, `R7B2-FREEZE-1`). See [`probes/README.md`](../../probes/README.md) for usage (`PROBE_ROOT` is required).
6. The evidence reports the freeze binds, as needed: `CoachingCore/r7/b2/NEIGHBORS_R7B2.json`, `REGRESSION_R7B2.json`, `REGRESSION_INTAKE_R7B2_VS_R7B1_FREEZE2.json`, `MUTATION_R7B2.json`, `CONFORMANCE_R7B2_DELTA*.json`, `SUPERSESSION_VERIFY_R7B1_ON_R7B2.json`, and the scripts that produced them (`CoachingCore/scripts/*-r7b2.mjs`).

Do not trust the evidence because it exists: read the diff and the decision step yourself, and reproduce what your verdict depends on.

## Questions (Founder request REVIEW Q1–Q4)

1. **Q1.** Does clinical screening now reliably precede the late-evidence question when required? Cover K6 (pain, injury, `pain:'yes'`, clinical text; alone, with a ladder step, a declined offer, an unrecognised choice) and K6b (late report in one review, pain alone in a later review of the same re-entry week), on the frozen bytes. The route must be CLINICAL_HUMAN_REQUIRED, with no proposal, the handler's own reason and scope, pending CLINICAL_HUMAN_REQUIRED, and the review's evidence still in `actualLedger`.
2. **Q2.** Was legitimate R7-A late-evidence behaviour preserved? A review with late pre-break evidence and no clinical signal, and a later review with no clinical signal and no pending clinical state after a clinical route, must still get R7-A's confirmation question (final I6), unchanged from R7B1-FREEZE-2. Late evidence must never be suppressed or discarded. A nonclinical factual correction with late evidence must never be routed to clinical (neighbor D).
3. **Q3.** Did the fix regress any R7-B.1 closure? In particular: taper/race/post-event substitution familiarity; reconstructed novice-template persistence; factual correction plus block choice; the SKILL_MISMATCH fallback; the QE-R7B-01 and QE-R7B-05 residuals; the clinical screen before block choice (QE-R7B1-01); the no-lower-skill question. Also R7-A, R7-B0 and R7-B behaviour in general (the G4 differential against R7B1-FREEZE-2).
4. **Q4.** Is there any new route that can bypass the required safety handling? Include:
   - whether the inventory is complete: any other exit in the decision step (or reachable before a handler's screen once a review is admitted) that returns a nonclinical question in place of a clinical route;
   - whether `clinicalRoute(kind,review)` and the handlers' screens can read a report differently (they are meant to share `substitutionClinical` and `interruptionScreen`);
   - whether the precedence point can return a clinical route for a review that is not admitted, or for a report the handler itself would not route (a false clinical route is also a defect);
   - CAND-01 and CAND-02: are the fixes correct, and does CAND-02 still keep a same-id resend of the same report as KEEP and still ask about other nonclinical facts under the same id;
   - whether the M41 equivalence argument holds, and whether the now-redundant guard matters;
   - whether R7B2-OBS-01 (a substitution report with pain but no named exercise is asked "Say which exercise should change and why") is correctly classified (c), pre-existing and outside the QE-R7B1-04 class, or is a safety bypass of the same invariant.

## Scope and bounds

- In scope: the B.2 delta and every path it can change; the claims of the closure record and the U3 evidence.
- Out of scope (routed in R7-B.1, do not reopen unless the B.2 change demonstrably makes them worse): SSCTR F12 (decision half), F13 (narrowed) and F14; QE-R7B1-02 and -03; QR7B1-06; the R7-B.1 Engineering and Quality observations (OBS-03, OBS-04); the R7-B backlog. Closed blockers stay closed unless this change regresses them: QE-R7B-OBS-04, QE-R7B-R2-01/-02/-03, the QE-R7B-01 and QE-R7B-05 residuals, QE-R7B1-01, QR7B1-01 to -05.
- Contract §10: a pre-existing finding outside the QE-R7B1-04 class is recorded and routed; it blocks READY only if it is a safety bypass of the same invariant (clinical-screen-first).
- SSCTR and Quality were not dispatched because the contract §5 condition holds (U3 evidence, "G4 reading"). If your own evidence shows any changed decision other than "a nonclinical question replaced by CLINICAL_HUMAN_REQUIRED, with no proposal on either side, on a review carrying a clinical signal", or any prescription difference, say so explicitly: that reopens the §5 condition.
- Clinical judgment stays CLINICAL_HUMAN_REQUIRED; you judge the routing, not clinical content. No new clinical keyword, flag or threshold is allowed in a fix.

## Rules

- **Read-only on the repository.** Write only under `audits/domain-coaching-r7-b2-2026-10-31/reviews/engineering/` (your probes in `reviews/engineering/probes/`, their outputs in `reviews/engineering/probes/out/`).
- Run the committed B.2 probes only from copies in your `probes/` folder or with outputs redirected there; never run a closed mission's probe or script in place if it writes outputs. For the predecessor bytes, use `git archive 146ebb8` (or `033f300`) into a temporary directory outside the repository, and delete it when done.
- Never run `npm run verify`, any script with `--write`, or the freeze, mutation, regression or neighbor scripts with `--write`. `CoachingCore/node_modules` is already installed; do not reinstall.
- No commits and no git operation that changes state (no checkout, stash, reset, branch or tag). The coordinating session commits your outputs.
- Do not edit `src/`, tests, evidence, freeze records, `CURRENT_MISSION.md`, `MISSION_LEDGER.md` or anything outside your output folder. You fix nothing.

## Deliverables

- `ENGINEERING_REVIEW_R7B2.json`: freeze identity (record sha256, source and manifest digests, verifier result before and after), verdict, per-question answers (Q1–Q4) with evidence, findings, probes run, and whether the §5 condition holds on your evidence.
- `ENGINEERING_REVIEW_R7B2.md`: the human-readable review.
- For every finding: id (`QE-R7B2-NN`), severity (BLOCKER / MAJOR / MINOR / OBSERVATION), origin (introduced by the B.2 change, or pre-existing with its origin), whether it is a safety bypass of clinical-screen-first, reproduction (probe path and command), expected and actual, and a suggested owner.
- The last line of the `.md` is exactly `R7B2_ENGINEERING_GATE = READY` or `R7B2_ENGINEERING_GATE = NOT_READY`.
