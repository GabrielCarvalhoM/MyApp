# R7-B.1 — SSCTR review request (one narrow review, on R7B1-FREEZE-1)

You are the project's independent sports-science reviewer (`sports-science-concurrent-training-reviewer`, SSCTR-1.0.0; PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY for bounded nonclinical internal decisions). You did not author this runtime. This is the **one review** the Founder's request allows for this gate (request §14, §17). A further cycle opens only for a narrow blocker created by R7-B.1's own correction.

## Bytes to judge

- **R7B1-FREEZE-1**: record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json` (source digest `976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9`, manifest digest `2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b`, freeze commit `d41df8b129495e32fe2923087d665798854609e9`). Verify read-only before and after your work, from `CoachingCore/`: `node scripts/verify-r7b1.mjs` (add `--tests` once).
- Predecessor: R7B-RUNTIME-REPERTOIRE-FREEZE-2 (`10b26d6`), which you blocked on **QE-R7B-OBS-04** in R7B-SSCTR-r2 (`audits/domain-coaching-r7-b-2026-10-31/reviews/ssctr/recheck/`).
- Read first: `CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md` (B1 is your blocker); the evidence the freeze record lists.

## Questions (narrow; areas the delta does not touch are not re-reviewed)

1. **QE-R7B-OBS-04.** Is your required change met?
   - In TAPER, RACE_WEEK and POST_EVENT, a reason-based substitution brings in only a configuration already performed in this program and not set aside, of the same pattern and role. Otherwise the exercise is omitted for those weeks and disclosed, or kept.
   - The substitute starts after POST_EVENT with effort-guided establishment.
   - The clinical screen and the questions come first.

   Your probe `r06` is the reproduction; P1 of `audits/domain-coaching-r7-b1-2026-10-31/probes/adversarial-r7b1.mjs` covers more athletes. Decide in particular:
   - the stand-in rule (an admissible alternative of the set-aside configuration under B0-C06 condition 1, performed in this program, in the SKILL_MISMATCH direction, most recently performed first);
   - "performed in this program" (an exercise reported only at intake does not count);
   - a substitute planned in the last SPECIFIC week, which a conditional projection may show in the taper until the weekly review of that week re-plans from the evidence;
   - the "keep the exercise until after the event" option, given as disclosure text.
2. **Event and taper substitution fidelity, and the planned taper.** Planned taper, combined strength taper and event-transition semantics are unchanged (timeline differential `CoachingCore/r7/b1/REGRESSION_R7B1.json`: the PRESERVE timelines, `event:planned-taper`).
   Classify the observation that the inherited R6-SUBSTITUTION path (a permanent equipment change reported in the taper week) still brings same-intent substitutes into the event weeks (adversarial P1 `inheritedEquipmentChangeInTaper`). It is not a reason-based substitution and is outside OBS-04 as stated. Say whether it is in scope, blocks, or is routed.
3. **F1 / F2 preservation** (graduation re-entry after a restart; familiar bouts only while current) and the return paths: unchanged by the delta? Your `p10`–`p16` and `r01`/`r02` gave byte-identical output on these bytes in the author's run; check it yourself.
4. **Novice and strength implications where the delta touches them:**
   - QE-R7B-R2-01, which also resolves your F9 (the lazily started cap now holds through later reviews; your `r03`/`r04` changed only there);
   - the SKILL_MISMATCH fallback after equipment loss (QE-R7B-R2-03: a rung below or a lower skill, never above the substitute in use; otherwise the decision asks);
   - the substitution's next candidate when the first cannot take every slot (QE-R7B-R2-04).
5. **Dose and progression regressions related to the delta:** any dose, set count, load or run minute above the predecessor or outside an approved envelope (your `p40` dose sweep was byte-identical in the author's run).

## Rules

- Read-only on the repository. Do not modify anything outside your folder: write only under `audits/domain-coaching-r7-b1-2026-10-31/reviews/ssctr/` (copy a probe there and point its output there if you re-run one).
- Do **not** run `scripts/mutate-r7b.mjs`, `scripts/mutate-r7b1.mjs` or `scripts/freeze-r7b1.mjs`: they edit runtime sources in place while another judge works on the same checkout. Never use `--write`, `npm run verify` or a closed `verify-r*` script with `--write`. No commits, no git state changes.
- R6-POLICY-5, R7B0-CATALOG-2 and the B0 r2 records are unchanged and are not under review.

## Output

- `reviews/ssctr/SSCTR_REVIEW_R7B1.json`: revision **R7B1-SSCTR-r1** of every R7-B record the delta affects. Those are at least FIDELITY (R7-B r2: REVISE on OBS-04), TAPER (whose approval excluded event-week substitutions), NOVICE (F9) and DECLARED (R7B-DECL-13 in event weeks, DECL-16 with F9). Each is bound to the R7B1-FREEZE-1 record and source digest, with disposition, evidence status, confidence, conditions and limitations. An R7-B r2 record the delta does not affect may be carried forward, re-bound.
- `reviews/ssctr/SSCTR_REVIEW_R7B1.md`:
  - each question answered, with its reproduction;
  - any new finding in the delta, with its severity and whether it blocks;
  - the proposed human-queue entries, as one JSON array of `HQ-R7B1-SSCTR-*` objects for every approving record, in the R7-B format (do not edit the queue);
  - exactly one final line: `R7B1_SSCTR_GATE = ACCEPT | ACCEPT_WITH_CONDITIONS | BLOCK`.
