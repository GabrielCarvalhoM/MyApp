# R7-B.2 — SSCTR review request (one narrow review, on R7B2-FREEZE-1)

You are the project's independent sports-science reviewer (`sports-science-concurrent-training-reviewer`, SSCTR-1.0.0; PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY for bounded nonclinical internal sporting decisions; clinical judgment stays CLINICAL_HUMAN_REQUIRED). Read your constitution `governance/agents/sports-science-reviewer/CONSTITUTION.md` and skill `.agents/skills/sports-science-review/SKILL.md`. You did not author this runtime, its fix or its evidence.

DOMAIN_COACHING_R7-B.2 exists only to close **QE-R7B1-04** (contract [R7B2-CONTRACT-r1](../../TASK_CONTRACT.md), Founder [request](../../FOUNDER_REQUEST.md)): once a review is admitted, the clinical route its own handler's screen would take must come before R7-A's late-evidence question and every other nonclinical re-entry question. The contract (§5) waived the SSCTR review only while every changed decision was "a nonclinical question replaced by CLINICAL_HUMAN_REQUIRED, with no proposal on either side, and no prescription differs". The Engineering judge (R7B2-ENG-r1, READY) found one case outside that condition, **QE-R7B2-01**, so this review is now required. It is the **one** SSCTR review for this gate (contract §10 bounded loop); at most one correction cycle follows, only for a narrow runtime issue the B.2 change itself causes.

## Bytes to judge

- **R7B2-FREEZE-1**: record `CoachingCore/r7/b2/RUNTIME_FREEZE_R7B2_1.json`, sha256 `8d51def566f2ce8f140cb3dcf22d62d0699be73571d5d931d8f5e2e50fb59fee`, freeze commit `1a1c7286adc8b08d16f97dea86f4973fe33e5a95`; source digest `57512322331f7a0295525775da8bc86da5e95fe0f2085404637498e1f8f7ecbd`, manifest digest `f9c5bd5a1bb8bd6cf2a1df3298b6b9bdc62d7f951687c9e7d756889fa753ceca`; 122 files, 799 tests.
- **Identity.** `node CoachingCore/scripts/verify-r7b2.mjs --tests` (read-only) gave 35/35 PASS at HEAD `53acccf` before this request was written. Run it yourself before and after your work (without `--tests` is enough the second time).
- **Predecessor.** R7B1-FREEZE-2, commit `146ebb80c51d302ef3518a61c1cab208c7778632` (the runtime your R7B1-SSCTR-r2 recheck accepted with conditions).
- **Delta.** `git diff 033f300 1a1c728 -- CoachingCore/src`: `src/r6-adaptation.mjs` only (+32 / −8), the precedence point `clinicalRoute` in `evaluateProgram`'s decision step. No dose, selection, substitution-choice, policy or catalog code changed.

## What to read (in order; nothing else by default)

1. This request, then the contract [TASK_CONTRACT.md](../../TASK_CONTRACT.md) §2–§5.
2. The U4 gate record [`evidence/U4_ENGINEERING_GATE_R7B2.md`](../../evidence/U4_ENGINEERING_GATE_R7B2.md) and the Engineering review [`reviews/engineering/ENGINEERING_REVIEW_R7B2.md`](../engineering/ENGINEERING_REVIEW_R7B2.md), section "QE-R7B2-01".
3. [`CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md`](../../../../CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md): the precedence point, CAND-01 and CAND-02.
4. The U3 evidence note [`evidence/U3_EVIDENCE_R7B2.md`](../../evidence/U3_EVIDENCE_R7B2.md), "G4 reading" (now superseded for routing by R7B2-D15; the note itself is not edited).
5. The residual-authority rule in the runtime: `withFactualReplan` (`CoachingCore/src/r6-adaptation.mjs`, about line 1145: "A clinical route proposes nothing (no dependent prescription)") and the decision step around lines 355–375.
6. Your own prior records, for consistency: `audits/domain-coaching-r7-b1-2026-10-31/reviews/ssctr/recheck/SSCTR_RECHECK_R7B1.{md,json}` (R7B1-SSCTR-r2, which records B0-C06 condition 8 and D08 as met) and, only if needed, the D08 source in `audits/domain-coaching-r6-2026-10-26/reviews/ssctr-review.r2.md`.
7. The reproduction: `reviews/engineering/probes/s5-factual-proposal.mjs`, `s5-downstream.mjs` and their helper `dual.mjs`, with the recorded output `reviews/engineering/probes/out/s5-factual-proposal.json`.

## The case (QE-R7B2-01, as reproduced by the Engineering judge and independently by the coordinator)

- A program is reviewed for 3 weeks; a WORK return is reported on day 3 of week 3; weeks 3 and 4 are reviewed. On day 0 of week 5 the same return report is resent **under its own event id** with the reason "Flu illness", in a review that **also corrects week 4's strength reports**.
- **FREEZE-2:** ASK with the report-identity question ("This report id already belongs to a different interruption report…; meanwhile evidence about an earlier week changed what this week starts from…") **and the factual re-plan proposal `439a61ba5e87c7206a79460c79594d857d33ddd746b52f8157aa37b9d0951240` attached**; pending ASK. With a ladder block choice (S5R8), the same shape through the block-choice question.
- **R7-B.2:** the return handler's illness route: CLINICAL_HUMAN_REQUIRED, no proposal, pending CLINICAL_HUMAN_REQUIRED. The correction is still recorded in `actualLedger`.
- **Applied:** weeks 5–11 are prescribed differently, and still differ after the next full-week review (S5R9/S5R10), because FREEZE-2 had applied the correction's re-plan while R7-B.2 has not re-planned anything yet.
- **Controls identical on both runtimes:** same report under a new id (S5R4) → CLINICAL, no proposal; substitution pain with the same correction (S5R5) → CLINICAL, no proposal; same id with other nonclinical facts (S5R6) → asked, with the proposal; same facts (S5R7) → re-planned.

## Questions (narrow; areas the delta does not touch are not re-reviewed)

1. **Acceptability of QE-R7B2-01.** Is it sports-science acceptable that, when a review carries a clinical signal the handler's own screen routes to a human, the plan is **not** re-planned from that review's factual correction (the correction is recorded but its re-plan is withheld) until the human route resolves, where FREEZE-2 had proposed that re-plan alongside a nonclinical question? Consider: clinical-screen-first (B0-C06 condition 8, D08), QE-R7B1-01 (a clinical route is the decision, with no proposal), the residual-authority rule (a clinical route proposes nothing), and what the athlete is prescribed in weeks 5–11 in each case while the clinical route is pending.
2. **No prescriptive record changed.** Confirm that the difference is a consequence of routing (which decision is returned), not of any changed dose, progression, selection, substitution, taper or deload rule; that no R7-B0, R7-B or R7B1-SSCTR-r2 prescriptive record is changed in meaning; and therefore whether any of your records needs a new revision or any human-queue entry is required (none is expected; the queue stays at 230).
3. **Withholding vs. dropping.** Is the factual correction's effect only deferred, not lost? After the human route resolves (a later review with no clinical signal and no pending clinical state, or a clinical clearance path as the runtime defines it), does the plan re-plan from the recorded correction? State what you checked; if the runtime does not re-plan from it, say whether that is acceptable, blocks, or is routed.
4. **Same class elsewhere.** On the other changed decisions (S5b, S5c, S5f, S5h, S5R3 and the K6/K6b and CAND-01/CAND-02 rows), any sports-science concern with the clinical route replacing a nonclinical question? (These had no proposal on either side.)

## Rules

- **Read-only on the repository.** Write only under `audits/domain-coaching-r7-b2-2026-10-31/reviews/ssctr/` (your probes in `reviews/ssctr/probes/`, outputs in `reviews/ssctr/probes/out/`). Re-run the Engineering probes only from copies in your folder.
- For the predecessor bytes: `git archive 146ebb8` (the full tree; the catalog binding reads files outside `CoachingCore/`) into a temporary directory **outside the repository** and named for you (for example `%TEMP%/r7b2-ssctr-pred`), copy `CoachingCore/node_modules` into it, and delete it when done. Another judge (Quality) works on the same checkout at the same time; do not share or reuse its temporary directories.
- Do **not** run `scripts/mutate-r7b*.mjs`, `scripts/freeze-r7b*.mjs` or any script that edits runtime sources in place. Never use `--write`, `npm run verify`, or a closed `verify-r*` script with `--write`. `CoachingCore/node_modules` is installed; do not reinstall.
- No commits and no git operation that changes state. Do not edit `src/`, tests, evidence, freeze records, the human queue, `CURRENT_MISSION.md`, `MISSION_LEDGER.md` or anything outside your folder. You fix nothing.
- You judge sports-science adequacy of the routing consequence, not clinical content; no new clinical keyword, flag or threshold may be proposed as a B.2 fix (contract §2.3, §10).

## Output

- `reviews/ssctr/SSCTR_REVIEW_R7B2.json`: review id **R7B2-SSCTR-r1**, instance identity, the freeze identity you verified (record sha256, source and manifest digests, verifier result before and after), per-question answers with evidence, findings (id `SSCTR-R7B2-NN`, severity, origin: introduced by B.2 or pre-existing with its origin, blocks or routed, owner), whether any SSCTR record needs a new revision (with the record ids), and proposed human-queue entries (expected: none; do not edit the queue).
- `reviews/ssctr/SSCTR_REVIEW_R7B2.md`: the human-readable review, each question answered with its reproduction, and exactly one final line: `R7B2_SSCTR_GATE = ACCEPT | ACCEPT_WITH_CONDITIONS | BLOCK`.
