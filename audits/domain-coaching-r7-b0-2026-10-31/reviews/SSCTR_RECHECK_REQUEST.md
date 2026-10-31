# R7-B0 — narrow SSCTR recheck request (the one allowed)

2026-10-31 · coordinator (target author). Scope fixed by `SSCTR_REVIEW_B0.md` §"Narrow recheck": B0-FIDELITY only. The reviewed r1 bytes are preserved in commit `caab54e` (catalog `db8a2533…`, foundation `1fb2eb4b…`).

## Revised target

| Artifact | r1 (reviewed) | r2 (recheck) |
|---|---|---|
| `CoachingCore/r7/b0/REPERTOIRE_CATALOG_B0.json` | R7B0-CATALOG-1 `db8a2533…c5fe` | R7B0-CATALOG-2 `ceee276a424ee7575b4477a2bc429de2e8cd854e3cb82ac767776492cdcb92f9` |
| `CoachingCore/r7/b0/REPERTOIRE_FOUNDATION_B0.md` | R7B0-SPEC-1 `1fb2eb4b…12b6` | R7B0-SPEC-2 `96fdefadba7a1de5b156c6324c6103c2ee57909cfeb5b4af59fd786147d7906a` |
| schema, gap matrix, validator | unchanged (`8b51b80b…`, `0f43f09f…`, `d757e55e…`) | unchanged |

`git diff caab54e -- CoachingCore/r7/b0/` shows every changed byte.

- **Catalog:** M1, M2, M3 (both places) and M4 appended or replaced verbatim as you specified, plus `revision` R7B0-CATALOG-1 → R7B0-CATALOG-2. Nothing else.
- **Foundation (documentary alignment, declared so your bindings stay exact):** revision identifiers; a "Quality gates" paragraph in §3 stating the same runtime gates as M1; §9 corrected so that strides after walk/jog/restart exit are described as existing runtime behaviour, optional for novice-started athletes, and the graduation sentence carries the quality gates and the EASY-mode-block condition of your B0-C01 record; a new §14 pointing to your records and stating that record conditions prevail where stricter.
- Validator (unchanged bytes) rerun: 18/18 on r2.

## Asked

1. Confirm M1–M4 exactly and that no other catalog byte changed except the revision identifier.
2. Confirm the foundation changes are documentary alignment consistent with your records (no new rule, no widened eligibility).
3. Re-bind: state whether the twelve APPROVE_WITH_CONDITIONS decisions (R7B0-SSCTR-r1, conditions unchanged) carry over to R7B0-CATALOG-2 / R7B0-SPEC-2, and give the twelve queue entries re-bound to the r2 hashes (target fields updated, conditions verbatim) in one JSON block for verbatim append.
4. Write only `reviews/SSCTR_RECHECK_B0.md` (first line `R7B0_SSCTR_GATE = ACCEPT | ACCEPT_WITH_CONDITIONS | REVISE | NOT_READY`) and, if your protocol needs one, `reviews/SSCTR_RECHECK_B0.json` (B0-FIDELITY r2 record). No other file, no queue append, no npm/tests/verify-r*.
