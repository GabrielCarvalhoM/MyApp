# R7-B.1 — Quality narrow recheck request (the one recheck, on R7B1-FREEZE-2)

You are the same independent quality judge who reviewed R7B1-FREEZE-1 (NOT_READY: QR7B1-01 and QR7B1-02 MAJOR; QR7B1-03 and -04 MINOR; observations QR7B1-05 to -07). You did not author this runtime. Request §17 allowed **one** correction cycle for a narrow blocker the mission's own correction created: correction, new freeze, narrow recheck, then stop. This is that recheck. No further cycle follows it, so a finding you raise stays a finding; it is routed, not corrected here.

## Bytes to judge

- **R7B1-FREEZE-2**: record `CoachingCore/r7/b1/RUNTIME_FREEZE_R7B1_2.json` (sha256 `e75a2799ae1b9387e7c8831646cb877967262c19aa11c18c8d54c2a7b94f27d5`, source digest `f54e5c0345aa9c1dbd9743a78127b59720b3cf4d68c1b53ed11bfdbf40ed1612`, manifest digest `980d830106f3c75722126a8c0bffb5e5aafa9a261b411c30a4779d6d3e08fae8`, freeze commit `146ebb80c51d302ef3518a61c1cab208c7778632`). Verify read-only with `node scripts/verify-r7b1.mjs --tests` (from `CoachingCore/`; the default is FREEZE-2).
- Previous: R7B1-FREEZE-1 (`d41df8b`), your review in `reviews/quality/` (committed at `2e874f1`).
- Delta: `git diff d41df8b 146ebb80c51d302ef3518a61c1cab208c7778632 -- CoachingCore/src CoachingCore/test`. Read the section "Correction cycle" (C1–C6) of `CoachingCore/r7/b1/BLOCKER_CLOSURE_R7B1.md`, `test/r7b1-correction-cycle.test.mjs`, and the `_2` evidence the freeze record lists.

## Scope (narrow)

1. **QR7B1-01.** Every option of the no-lower-skill question acts, the loss can be recorded (`changes.acceptGap` or `substitution.acceptGap`), the text names only the missing equipment, and a gap the program already holds is not asked again. Your q04, q05 and q12 apply.
2. **QR7B1-02.** In TAPER, RACE_WEEK and POST_EVENT, no configuration this program never performed enters, whatever placed it (rotation, rebuild, equipment substitute), and stand-ins or omissions are disclosed. Rotation slots take the selected exercise. Your q01, q08, q09 and q09c apply.
3. **QR7B1-03, -04, -05.** The exhaustion question offers naming only when it works (q03). A review or decision that keeps an event-week slot out discloses it (q10). A program that ends with the post-event week says so (q06, q07).
4. **The rest of the delta, for regressions only:** QE-R7B1-01, the clinical screen before any block-choice question (Engineering's finding), and the week-level slot check, which compares sessions over the week of next use, not by id.

## Rules

- Read-only on the repository. Write only under `audits/domain-coaching-r7-b1-2026-10-31/reviews/quality/recheck/`. Re-run probes only from copies there or from a temporary mirror outside the repository, never in committed probe folders. Never run `npm run verify`, any `--write`, or the freeze, mutation or integration scripts with `--write`.
- No commits, no git operations that change state. Delete any temporary archives you create outside the repository.
- Deliver `QUALITY_RECHECK_R7B1.json` and `QUALITY_RECHECK_R7B1.md`. The last line of the `.md` is `R7B1_QUALITY_GATE = READY` or `R7B1_QUALITY_GATE = NOT_READY`. For any finding give severity, origin (introduced by the cycle or pre-existing), reproduction, expected and actual.
