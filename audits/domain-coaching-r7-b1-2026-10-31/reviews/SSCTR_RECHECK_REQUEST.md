# R7-B.1 — SSCTR narrow recheck request (the one recheck, on R7B1-FREEZE-2)

You are the same SSCTR instance that reviewed R7B1-FREEZE-1 (R7B1-SSCTR-r1: ACCEPT_WITH_CONDITIONS; F11 MODERATE, F12 and F13 MINOR). You did not author this runtime. The other gates found two MAJORs on FREEZE-1, and request §17 allowed **one** correction cycle: correction, new freeze, narrow recheck, then stop. This is that recheck. No further cycle follows it, so a finding you raise stays a finding; it is routed, not corrected here.

## Bytes to judge

- **R7B1-FREEZE-2**: record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json` (sha256 `e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5`, source digest `f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612`, manifest digest `980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8`, freeze commit `146ebb80c51d302ef3518a61c1cab208c7778632`). Verify read-only with `node scripts/verify-r7b1.mjs --tests` (from `CoachingCore/`; the default is FREEZE-2).
- Previous: R7B1-FREEZE-1 (`d41df8b`), your review in `reviews/ssctr/` (committed at `2e874f1`).
- Delta: `git diff d41df8b 146ebb80c51d302ef3518a61c1cab208c7778632 -- CoachingCore/src CoachingCore/test`. Read the section "Correction cycle" (C1–C6) of `CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md`.

## Questions (narrow, sports-science adequacy only)

1. **The event-week rule now binds every row (C3; your F11).** In TAPER, RACE_WEEK and POST_EVENT, a configuration this program has not performed gives way to a performed admissible alternative that fits the equipment of the date: of the reason's lineage for a row a substitution placed, otherwise of the row's own configuration. Without one, its slot is left out, and the decision discloses it. This covers equipment-forced substitutes, rotation and rebuilds. Is F11 resolved? Are the stand-ins' doses and the sessions left entirely out (rest by design in the race and post-event weeks) acceptable? Your s02 and s03 apply.
2. **Leaving the slot out after a SKILL_MISMATCH (C2).** When equipment loss leaves no lower option, the question offers to keep the equipment, or to confirm the change with that pattern's slot left out until the equipment returns (R6-SUBSTITUTION condition 8), and never a harder exercise. The Quality judge left to you whether this resolution is allowed after a SKILL_MISMATCH.
3. **The clinical screen before any block-choice question (C1).** It is restored for pain and illness reports that carry a choice (B0-C06 condition 8, D08).
4. **Disclosure (C5).** A decision or review that keeps an event-week slot out now discloses it; this is the review half of your F12. The decision-time half (a substitute planned before the event weeks) and F13 were not changed and stay routed. Confirm, or say what changed.
5. **No dose regression** from the delta: your p40, p42, s01, s03 and s05 checks, as you judge proportionate.

## Records and queue

Re-bind your seven records to R7B1-FREEZE-2 under a new revision, with conditions updated to what the recheck finds, and validate them with your Node port of the skill's validator. In your recheck `.md`, give the proposed `HQ-R7B1-SSCTR-*` queue block as a fenced `json` block. Its targets must name `RUNTIME_FREEZE_R7B1_2` (or its sha256 or source digest), because `integrate-queue-r7b1.mjs` now binds the latest freeze. Run it without `--write` only, to check.

## Rules

- Read-only on the repository. Write only under `audits/domain-coaching-r7-b1-2026-10-31/reviews/ssctr/recheck/`. Re-run probes only from copies there or from a temporary mirror outside the repository, never in committed probe folders. Never run `npm run verify`, any `--write`, or the freeze, mutation or integration scripts with `--write`.
- No commits, no git operations that change state. Delete any temporary archives you create outside the repository.
- Deliver `SSCTR_RECHECK_R7B1.json` and `SSCTR_RECHECK_R7B1.md`. The last line of the `.md` is `R7B1_SSCTR_GATE = ACCEPT`, `R7B1_SSCTR_GATE = ACCEPT_WITH_CONDITIONS` or `R7B1_SSCTR_GATE = BLOCK`.
