# R7-B.1 — Quality narrow review request (on R7B1-FREEZE-1)

You are an independent quality judge (`quality-reliability-engineer`), separate from the engineering judge of this mission. You did not author this runtime. R7-B's Quality gate ended **READY** (R7B-QUALITY-RECHECK-1, `audits/domain-coaching-r7-b-2026-10-31/reviews/quality/recheck/`).

The Founder's request (§16) does not repeat that review automatically. The R7-B.1 delta adds user-facing decision outputs and changes some substitution choices, which touches properties that review judged. This is therefore a **narrow** review of those properties on the delta only, and it is the one review for this gate.

## Bytes to judge

- **R7B1-FREEZE-1**: record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_1.json` (source digest `976a13351f0b40ee363e9e4d6d1592e2653306ac018e3cf143d2d16968d366c9`, manifest digest `2fc0a59a7b919b6b7a039981cd995c2d511437481a713a5c74a97c57c84d614b`, freeze commit `d41df8b129495e32fe2923087d665798854609e9`). Verify read-only before and after, from `CoachingCore/`: `node scripts/verify-r7b1.mjs`.
- Delta: `git diff 10b26d6 d41df8b129495e32fe2923087d665798854609e9 -- CoachingCore/src CoachingCore/test`; read `CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md`.
- Starting evidence: the author re-ran your R7-B recheck probes from a temporary mirror on FREEZE-2 and on these bytes. Summary in `audits/domain-coaching-r7-b1-2026-10-31/probes/out/quality-probes-freeze2-vs-r7b1.json` (21 of 22 outputs identical; p04 reachability through reviews 66 → 67 configurations, none lost; p01, p08 and p16 did not complete in the mirror, for the reasons recorded there); verify it with your own copies.

## Scope (only what the delta touches)

1. **Reachability:** run families, strength configurations (74/76 at R7-B), templates and archetypes, including through reviews (your `p04`). Unchanged, or changed only as the delta intends (a substitution whose first candidate cannot take every slot of the replaced exercise now selects the next candidate)?
2. **The new decision outputs, each reachable and truthful:**
   - the disclosure `NO_NEW_EXERCISE_IN_EVENT_WEEKS`, with its stand-ins, omitted sessions, "starts after the post-event week" and its two options;
   - the question with disclosure `NO_LOWER_SKILL_ALTERNATIVE`, with its two options;
   - the rest-by-design text of an event-week strength session whose rows are all left out;
   - the session field `eventStandIns` and the template-row field `fallbackFor`.
   For each: does it match what the plan does, is any option an option without effect, and is the new question a dead end? Check also against the plan's own text, for example the taper instruction "no new exercises or heavier loads".
3. **No duplicate rows** where a stand-in fills a slot (one configuration per session), and no contradiction between a decision's `substitutions` and the plan it proposes, in every slot of the replaced exercise.
4. **Recorded items:** are the items R7-B.1 records but does not change (QE-R7B-R2-05 as the R18 path, QE-R7B-R2-OBS-01, QE-R7B-OBS-01 … -03, and the inherited equipment change in the taper week reported to the SSCTR) recorded truthfully, with owners?

The SSCTR judges sports-science adequacy, and the engineering judge judges state, persistence and factual authority. Do not duplicate them.

## Rules

- Read-only on the repository. Write only under `audits/domain-coaching-r7-b1-2026-10-31/reviews/quality/`. Re-run R7-B probes only from your own copies there, never in their committed folders.
- Do **not** run `scripts/mutate-r7b.mjs`, `scripts/mutate-r7b1.mjs` or `scripts/freeze-r7b1.mjs`: they edit runtime sources in place while other judges work on the same checkout. Never use `--write`, `npm run verify` or a closed `verify-r*` script with `--write`. No commits, no git state changes.

## Output

- `reviews/quality/QUALITY_REVIEW_R7B1.json`: review id `R7B1-QUALITY-r1`, the freeze identity you verified, findings (severity, reproduction, expected, actual), what holds, and the probes you ran.
- `reviews/quality/QUALITY_REVIEW_R7B1.md`: a short report with exactly one final line: `R7B1_QUALITY_GATE = READY | NOT_READY`.
