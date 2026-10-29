# Continuation materials

Written by the Claude Code continuation root so that a new session loses nothing. Session scratchpads do not survive.

| Path | What it is | When to use it |
|---|---|---|
| `ssctr-round-prompt.md` | The SSCTR round-8 prompt as a template (task-route JSON, context, task, rules) | Every further SSCTR round |
| `ssctr-round-9-prompt.md` to `ssctr-round-12-prompt.md` | Round 9, the delta review; rounds 10 and 11, narrow runtime checks; and round 12, the narrow check of D53 at the unchanged hash and **the last R6 round** under the Founder bound (`../FOUNDER_LOOP_BOUND.md`). All as dispatched | Reference only. No round 13 in R6 |
| `judge-prompts.md` | Briefs: the engineering judge of FREEZE-1 (used), the coaching-quality judge, the R5 regression judge (used) and the **R5 reclassification after FREEZE-2**. The coaching brief covers rounds 7–10 and D52 | Step 5 of `../CURRENT_TASK.md`. Replace each `[CHECK AT DISPATCH …]` marker first |
| `engineering-rereview-message.md` | Re-review brief for FREEZE-2, updated for SSCTR rounds 7–10 (D42–D52). The D52 fix and round 11 are written as expected and marked | Step 5, after FREEZE-2 and the post-fix rerun. Replace its `[CHECK AT DISPATCH …]` markers first |
| `holdout-author-prompt.md` | The brief the fresh holdout author received | Reference only: the holdout is sealed |
| `topic-doc-drafts/` | Drafts of `EVENT_TRANSITION_R6.md`, `RUN_PROGRAMMING_R6.md` and `STRENGTH_PROGRAMMING_R6.md`, updated for the round-8 answers (D47–D49, R12, R13, the restart run history), the round-9 answers (D50, D51) and the round-10 answer (D52 as implemented: establishment follows executed work, the resume clock, the author-found conflict filter) against R6-POLICY-5 `18ec48f3…` | Step 6: adjust to any final SSCTR condition, then copy over `CoachingCore/r6/` |
| `author-checks/mutation-check-*.mjs` | The author's mutation checks: `-d44-d45-return` and `-r6-r7` (round-7 fixes), `-r8` (round-8 fixes, 16 of 16 caught), `-r9` (D50 and D51, 4 of 4 caught), `-r10` (D52 and the conflict filter, 11 of 11 caught; output in `mutation-check-r10.out.txt`), `-r11` (D53, 5 of 5 caught; `mutation-check-r11.out.txt`). Each removes a fix, runs the regression tests, then restores the source | Author evidence only. They **temporarily rewrite `CoachingCore/src`**: run them from `CoachingCore/` only while no judge or probe is reading the runtime, and **never after FREEZE-2** |
| `author-checks/author-check-*.mjs` | Author checks (dev authority): `event-return` (returns near a race), `restart-taper` (the restart run history), `one-increase` (one session increase per week under 50 minutes, D50), `easy-never` (four-run-day programs whose easy sessions step one at a time), `consolidation-long` (consolidation long run against easy runs; takes a runtime URL), `resume-clock` (D52: `lastPerformed` against the scripted executions and the rows each review issues, over 160 timelines; `.out.json`), `same-week` (D52: establishment followed by a from-log row in the same week; takes a runtime URL; `.out.json` for the current runtime and `.r10-runtime.out.json` for the round-10 one) | Author evidence only; read-only. Run from this folder |
| `author-checks/PROGRAM_POLICY_R6.interim-3ae5c6d6.json` | The interim R6-POLICY-4 bytes (hash `3ae5c6d6…`), superseded by the final `1046ad0e…` | Record only; never reviewed and never used for a freeze |
| `CURRENT_TASK.as-of-round-10-dispatch.md` | The `CURRENT_TASK.md` this session worked from (steps 0–9, with the full designs of D47–D49 and R11–R13 as specified), saved before the handoff rewrite | Reference only |

**Elsewhere** (`../reviews/ssctr-dossier/`):
- **Dossiers:** `REVISION_R6_POLICY_3.md`, `REVISION_R6_POLICY_4.md`, `REVISION_R6_POLICY_5.md`, `RUNTIME_DELTA_D50_D51.md`, `RUNTIME_DELTA_D52.md` (diff `RUNTIME_DELTA_D52.diff` against `reviewed-18ec48f3-r10-source/`) and `RUNTIME_DELTA_D53.md` (diff `RUNTIME_DELTA_D53.diff` against `reviewed-18ec48f3-r11-source/`).
- **Reviewed policy bytes:** `PROGRAM_POLICY_R6.reviewed-*.json`.
- **Reviewed runtime copies:** `reviewed-1046ad0e-source/` (round 8), `reviewed-18ec48f3-r9-source/` (round 9, rebuilt and sha-verified) and `reviewed-18ec48f3-r10-source/` (round 10, copied before any D52 edit; 24 files, the 19 the SSCTR listed match its record). Diff the D52 fix against the round-10 copy.
- **Author reruns of the SSCTR probes:** `freeze2-author-reruns/`, `policy4-author-reruns/`, `policy5-author-reruns/`, `r9-author-reruns/` `r10-author-reruns/` (the round-10 probe on the D52 runtime) and `r11-author-reruns/` (the round-11 probe on the D53 runtime). Each README compares the rerun with the reviewer's own output.
- **Reviewed runtime copies:** also `reviewed-18ec48f3-r11-source/` (round 11, copied before any D53 edit).

## Small doc edits still to make at closure

These docs were updated for FREEZE-2 in the first session. They still need the answers to SSCTR rounds 7–10:

**D52, as implemented** (adjust to the round-11 rulings):
- `CoachingCore/r6/SUBSTITUTION_ENGINE_R6.md` line 13: "unused for more than 28 days" becomes "not performed for more than 28 days", counted in calendar days from the last executed exposure (`lastPerformed`) to the session date. An unfamiliar substitute whose first session was missed establishes at its next exposure.
- `CoachingCore/r6/RETURN_ENGINE_R6.md`:
  - an exercise first prescribed in a session dated inside the pause has never been performed, so it establishes by effort at its next exposure;
  - the 28-day clock for exercises not used during a return counts from their last executed exposure;
  - a never-performed exercise prescribed while an exercise in the return is still at the entry step gets the entry dose, and joins the return once performed.
- `CoachingCore/r6/COLD_START_ENGINE_R6.md`: a missed first session leaves its exercises to establish at their next exposure; later sessions of the first week repeat the establishment; a known dose's clock starts at its `observedAt`.
- `CoachingCore/r6/ADAPTIVE_COACHING_R6.md` under "Logged loads":
  - what a review counts as performed (`performedInWeek`);
  - a from-log state performed without a usable load becomes `unlogged`, and its next row is chosen by effort;
  - a conflicted report neither sets nor confirms a load (author-found).
- `continuation/topic-doc-drafts/STRENGTH_PROGRAMMING_R6.md`: done (section "Establishment follows executed work", Resumption, Return).

**`CoachingCore/r6/RETURN_ENGINE_R6.md`**
- Round-8 answers (R6-POLICY-5):
  - strength sets in a moderate or long return (D49): the ceiling is the last executed count outside a return step and a phase reduction; step 2 is max(1, min(ceiling − 1, entry + 1)); after the steps, one set per executed unreduced week up to the ceiling; above it only through a block with no return-step exposure; phase reductions on top, in the steps too; no block credit from return weeks; the return load cap as applied (`return.strengthReturnSets`, `return.returnLoadCap`);
  - a long-interruption restart clears the achieved run peaks and the longest continuous run (`return.restartRunHistory`, author-found with D47);
  - lexicon additions (R11), including the joined compounds C-section and recém-nascido; asking pregnancy/postpartum again at reviews and returns stays an open gap;
  - a return with a single long-run day completes its steps in projection (R13).
- Round-9 answer (D51): the return ends with the exercises in use. Exercises not used during it lose their return markers when those in use finish their steps, then rotation resumes on its cadence and later new exercises start with normal establishment.
- Under "Clinical flag": yes-meaning values route to a human in the intake, the review and the legacy path. "sí" counts, and so does a clinical status in any letter case. Any other non-boolean eligibility value is asked (SSCTR R6).
- Lexicon: the round-7 additions (had a baby, hit by a car, car or bike crash, parto, atropelado, bitten, mordida as clinical; baby, crash, collision, bite, slipped, escorreguei, resbalé as ambiguous). Locally negated damage is asked ("No broken bones"); a distant negation does not hide damage (SSCTR R7).
- Under Moderate:
  - every exposure of the entry week is at the entry dose, and exercises first set up in it follow the return steps (author-found);
  - a return-entry log above the load before the break is capped there and asked about (D45).

**`CoachingCore/r6/ADAPTIVE_COACHING_R6.md`**
- Round-8 answers: every proposal recomputes the completion negotiation from its own race-week state (D47); a pending row reads effort-guided selection only (D48); `stateTrace[w].strength.planned` carries the week's planned counts so a review sees them (D49).
- Under "Logged loads":
  - D44: an above-plan load only on the ADVANCE criterion;
  - D45: the establishment log stays pending until it is confirmed, repeated or matches the hint; the review field `loadConfirmations`; a changed pending value always travels in a proposal;
  - `loadQuestions` are built after the decision from its gates.
- Under "Review contract": a `loadConfirmations` value that is not a list is a HOLD.

**`CoachingCore/r6/COLD_START_ENGINE_R6.md`**
- Under "Status": a yes-meaning clinical flag in any form routes to CLINICAL_HUMAN_REQUIRED (SSCTR R6).
