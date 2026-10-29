# R6 handoff rehydration — 2026-10-26

Recorded by the Claude Code continuation session (model `claude-opus-5-5`, effort max) before any R6 write. The repository was the source of truth; the Codex session rollouts were read only to recover the original request and to confirm which instance wrote which file.

## What the interrupted execution did

The Codex root session ran from 2026-10-26T13:05:11Z to 13:10:33Z (about five minutes) and stopped on `usage_limit_exceeded`. It spawned three agents; all three failed on the same limit at 13:10:12–13:10:33Z without a final answer.

| Instance | Files it wrote | State |
|---|---|---|
| root | `audits/domain-coaching-r6-2026-10-26/TASK_CONTRACT.md`; `CoachingCore/scripts/prepare-r6.mjs` (run once → `BASELINE.json`, 331 entries, 13:08:16Z); `CoachingCore/src/r6-index.mjs`; `scripts/evaluate-holdout-r6.mjs`, `regress-r5-in-r6.mjs`, `freeze-r6.mjs` | Ran the full suite on the baseline: 280/280 pass. Recorded the R5 root causes in a chat message only. |
| worker `cold_program` | `src/r6-intake.mjs`, `src/r6-prescription.mjs` | Draft; no program generator, no tests. |
| worker `adapt_learning` | `src/r6-balanced.mjs`, `src/r6-provenance.mjs`, `src/r6-learning.mjs` | Draft; no adaptation module, no tests. |
| fallback `ssctr_r6` | `reviews/ssctr-questions.md`, `reviews/ssctr-source-access.mjs`, `reviews/ssctr-access-trace.json`, seven Europe PMC full-text XML files | Bounded five questions; retrieved sources; **no decision record was issued.** |

## Confirmed state before continuation

- `r6-index.mjs` imports `r6-program.mjs`, `r6-adaptation.mjs` and `r6-legacy.mjs`, which were never written, so the R6 entrypoint cannot load. `evaluate-holdout-r6.mjs` and `regress-r5-in-r6.mjs` therefore cannot run. `freeze-r6.mjs` references `CoachingCore/r6/PROGRAM_POLICY_R6.json` and `CoachingCore/r6/holdout/INTERFACE_ONLY.md`, which do not exist. No `CoachingCore/r6/` folder exists.
- No R6 test exists; `node --test` still runs only the 280 historical tests and they pass (re-run by the continuation session).
- Against `BASELINE.json`, every bound file is unchanged except `CURRENT_MISSION.md` and `MISSION_LEDGER.md`. Their only differences are the insert-only OB-2 entries written by the parallel Claude design session at 11:39 local; every baseline line is preserved. These belong to OB-2 and are preserved as they are.
- The R5 frozen runtime, corpus, first raw, review framing and evidence are byte-identical to their R5 freeze/manifest hashes.
- The handoff description's root causes are confirmed in code: R5 `chooseSchedule` breaks a Balanced tie by candidate order when both compatible arrangements preserve both modalities; R5 `validateProgramInput` rejects the whole program when any unused alternative is multidimensional or stale; the R5 holdout adapter writes `observedAt = date + 'T22:00:00Z'` when the corpus omits it, which is later than the 20:00 review clocks.
- The original R6 request lived only in the Codex rollout. It is now preserved verbatim in [FOUNDER_REQUEST.md](FOUNDER_REQUEST.md); the continuation instruction is in [FOUNDER_CONTINUATION_REQUEST.md](FOUNDER_CONTINUATION_REQUEST.md).

## Parallel work to preserve

- OB-2 (Claude design session) holds 38 product-doc corrections and three human-queue items until R6 has a `FINAL_DISPOSITION.json`. R6 must not apply them and must not block them after it closes.
- `npm run verify` still points at `verify-r5.mjs`, which rewrites R5 evidence. The continuation session does not run it or any `verify-r*` historical script.

## Not started at handoff

Program generator, adaptation, legacy R5-input path, simulator, demonstrations, R6 policy and SSCTR decisions, tests, R5 regression run, freeze, fresh holdout, first evaluation, independent reviews, deliverables, verification, verdicts, mission/ledger entries and final disposition.
