# R7-B.2 — Quality narrow review request (one review, on R7B2-FREEZE-1)

You are an independent quality judge (`quality-reliability-engineer`), a fresh instance: not the R7-B.2 Engineering judge (R7B2-ENG-r1), not the author of the fix or its evidence, and not an R7-B.1 judge. DOMAIN_COACHING_R7-B.2 exists only to close **QE-R7B1-04** (contract [R7B2-CONTRACT-r1](../../TASK_CONTRACT.md), Founder [request](../../FOUNDER_REQUEST.md)).

The contract (§5) inherited R7-B.1's Quality READY only while the G4 differential against R7B1-FREEZE-2 showed nothing but "a nonclinical question replaced by CLINICAL_HUMAN_REQUIRED, with no proposal on either side, on a review carrying a clinical signal, and no prescription differs". The Engineering judge found one case outside that condition, **QE-R7B2-01**, which the U3 differential did not cover. So this **narrow** review is now required, and it is the one review for this gate (contract §10 bounded loop; at most one correction cycle follows, only for a narrow runtime issue the B.2 change itself causes). The Engineering judge already answered Q1–Q4 (clinical precedence, late-evidence preservation, R7-B.1 closures, bypasses); do not duplicate it. The SSCTR judges sports-science adequacy in parallel; do not duplicate that either.

## Bytes to judge

- **R7B2-FREEZE-1**: record `CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`, sha256 `8d51def566f2ce8f140cb3dcf22d62d0699be73571d5d931d8f5e2e50fb59fee`, freeze commit `1a1c7286adc8b08d16f97dea86f4973fe33e5a95`; source digest `57512322331f7a0295525775da8bc86da5e95fe0f2085404637498e1f8f7ecbd`, manifest digest `f9c5bd5a1bb8bd6cf2a1df3298b6b9bdc62d7f951687c9e7d756889fa753ceca`; 122 files, 799 tests.
- **Identity.** `node CoachingCore/scripts/verify-r7b2.mjs --tests` (read-only) gave 35/35 PASS at HEAD `53acccf` before this request was written. Run it yourself before and after your work (without `--tests` is enough the second time).
- **Predecessor.** R7B1-FREEZE-2, commit `146ebb80c51d302ef3518a61c1cab208c7778632` (record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json`).
- **Delta.** `git diff 033f300 1a1c728 -- CoachingCore/src CoachingCore/test`: `src/r6-adaptation.mjs` (+32 / −8, the precedence point `clinicalRoute` in `evaluateProgram`'s decision step) and the new `test/r7b2-clinical-precedence.test.mjs`.

## What to read (in order; nothing else by default)

1. This request, then the contract [TASK_CONTRACT.md](../../TASK_CONTRACT.md) §4, §5, §7 (G3, G4) and §10.
2. The U4 gate record [`evidence/U4_ENGINEERING_GATE_R7B2.md`](../../evidence/U4_ENGINEERING_GATE_R7B2.md) and the Engineering review [`reviews/engineering/ENGINEERING_REVIEW_R7B2.md`](../engineering/ENGINEERING_REVIEW_R7B2.md) with its `.json` (QE-R7B2-01 and the §5 reading).
3. The U3 evidence note [`evidence/U3_EVIDENCE_R7B2.md`](../../evidence/U3_EVIDENCE_R7B2.md) (the G4 rows and "G4 reading", now superseded for routing by R7B2-D15; the note is not edited) and the differential it cites: `CoachingCore/r7/b2/REGRESSION_R7B2.json` (script `CoachingCore/scripts/regress-r7b2.mjs`) and `REGRESSION_INTAKE_R7B2_VS_R7B1_FREEZE2.json`.
4. [`CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md`](../../../../CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md): the §4 inventory and the three class-(b) exits (QE-R7B1-04's late-evidence question, CAND-01's factual re-plan question, CAND-02's report-identity question).
5. The reproduction of QE-R7B2-01: `reviews/engineering/probes/s5-factual-proposal.mjs`, `s5-downstream.mjs`, helper `dual.mjs`, output `reviews/engineering/probes/out/s5-factual-proposal.json`.

## Questions (narrow)

1. **G4 completeness.** The changed decisions are, by construction, those where the precedence point returns a clinical route in place of a class-(b) exit. For each class-(b) exit (late-evidence question, factual re-plan question `factual?.ask`, report-identity question, and the block-choice / unrecognised-choice questions that can carry a proposal through `withFactualReplan`), enumerate the combinations in which the FREEZE-2 output **carries a proposal** (a factual re-plan attached to a question, or any other proposal) or leads to a different prescription once applied. Add the missing class the Engineering judge found (same-id return resend × factual correction × block choice: none, ladder, declined, unrecognised) and any other class your enumeration yields. Is the differential complete once those are added? Run the additions yourself on both runtimes.
2. **Other changes outside §5.** Across your enumeration and the existing grids, is any changed decision anything other than (i) a nonclinical question → CLINICAL_HUMAN_REQUIRED with no proposal on either side, or (ii) the QE-R7B2-01 shape (a nonclinical question carrying the factual re-plan → CLINICAL_HUMAN_REQUIRED with no proposal)? In particular: any changed decision on a review **without** a clinical signal, any change to a proposal's content (as opposed to its presence), any change to `actualLedger`, pending/sticky state or disclosures beyond the route itself, any dose above the predecessor.
3. **Truthfulness of the QE-R7B2-01 output.** On the clinical route that replaces the question-with-re-plan: is the decision truthful about the plan (no proposal, reason and scope of the handler, the correction recorded in `actualLedger`)? After the clinical route, does a later review with no clinical signal and no pending clinical state pick up the recorded correction (re-plan from it, or ask about it), so the correction is not lost? Report what the runtime does; classify it.
4. **Records.** Are QE-R7B2-01..04 and R7B2-OBS-01 recorded truthfully in the U4 gate record, with origin and owner? Is anything the U3 note or the freeze's `routing.conditionHolds = true` claims now wrong beyond what U4 already records as superseded?

## Rules

- **Read-only on the repository.** Write only under `audits/domain-coaching-r7-b2-2026-10-31/reviews/quality/` (your probes in `reviews/quality/probes/`, outputs in `reviews/quality/probes/out/`). Re-run the Engineering or U3 probes and scripts only from copies in your folder, or with their outputs redirected there.
- For the predecessor bytes: `git archive 146ebb8` (the full tree; the catalog binding reads files outside `CoachingCore/`) into a temporary directory **outside the repository** and named for you (for example `%TEMP%/r7b2-quality-pred`), copy `CoachingCore/node_modules` into it, and delete it when done. Another judge (SSCTR) works on the same checkout at the same time; do not share or reuse its temporary directories.
- Do **not** run `scripts/mutate-r7b*.mjs`, `scripts/freeze-r7b*.mjs` or any script that edits runtime sources in place. Never use `--write`, `npm run verify`, or a closed `verify-r*` script with `--write`. `CoachingCore/node_modules` is installed; do not reinstall.
- No commits and no git operation that changes state. Do not edit `src/`, tests, evidence, freeze records, `CURRENT_MISSION.md`, `MISSION_LEDGER.md` or anything outside your folder. You fix nothing.
- Clinical judgment stays CLINICAL_HUMAN_REQUIRED; you judge routing and differential completeness, not clinical content.

## Output

- `reviews/quality/QUALITY_REVIEW_R7B2.json`: review id **R7B2-QUALITY-r1**, the freeze identity you verified (record sha256, source and manifest digests, verifier result before and after), per-question answers with evidence, the enumeration and its counts per class on both runtimes, findings (id `QR7B2-NN`, severity BLOCKER / MAJOR / MINOR / OBSERVATION, origin: introduced by B.2 or pre-existing with its origin, whether it is a safety bypass of clinical-screen-first, reproduction, expected, actual, owner), and the probes you ran.
- `reviews/quality/QUALITY_REVIEW_R7B2.md`: a short report with exactly one final line: `R7B2_QUALITY_GATE = READY | NOT_READY`.
