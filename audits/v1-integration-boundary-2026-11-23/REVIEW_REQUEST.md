# Review request: CoachingCore Integration Boundary (V1INT-1)

**Worktree:** `C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-cc-integration`, branch `claude/v1-cc-integration-foundation`. The candidate commit is the one named in the dispatch. **Base:** `e44d855` (COACHINGCORE-V1-CORE-SAFETY-FREEZE-7). Run Node from `CoachingCore/`. `node_modules` is present. Never run `npm run verify`. Do not edit any file outside your own review folder.

## What changed (diff `e44d855..<candidate>`)

- **New:**
  - `CoachingCore/src/boundary/integration.mjs` (the boundary);
  - `CoachingCore/src/boundary/admission.mjs` (structural limits);
  - tests `CoachingCore/test/v1int-{custody,authorship,limits,journeys}.test.mjs` with `v1int-helpers.mjs`;
  - `audits/v1-core-safety-lifecycle-2026-11-18/mac/int-{driver.js,oracle.mjs}` and `Fixtures/int.json`;
  - README §14.
- **Amended:** `CoachingCore/src/boundary/custody.mjs`, `reconcile` only (`evolves`). The file is bound by COACHINGCORE-V1-FREEZE-1.
- **Unchanged:** every engine file. FREEZE-7 (`node CoachingCore/scripts/v1core-freeze-7.mjs --check`) must stay 49/49.

**Read first:** `audits/v1-integration-boundary-2026-11-23/INTEGRATION_BOUNDARY_CONTRACT.md`. The source gates are:
- C-F01-2: `audits/v1-core-c2-f01-2026-11-18/reviews/ssctr/SSCTR_F01_R1.md` §5;
- SEC-CORE-03: `audits/v1-core-safety-lifecycle-2026-11-18/reviews/security/SEC_CORE_R1.md`;
- C-NCC-3: `audits/v1-core-ncc-2026-11-19/FINAL_REPORT.md`;
- SEC-O1-03: `audits/v1-core-sc-2026-11-20/reviews/security/SEC_SC_R1.md` and `SEC_SC_R2.md`.

## Questions

- **Security / PCG:**
  - Is the trust model right (the channel comes from the entry point; boundary-owned fields; origins under the carried MAC)?
  - Can a payload set its own authority? Can a correction cross authors or athletes? Can a forged evolution pass `evolves`?
  - Are the limits effective and free of silent loss?
  - Is the native-obligation list complete?
  - Should the `custody.mjs` amendment get a successor record?
  - Is SEC-CORE-03 closed, partial or open, and what exactly remains?
- **QRE:**
  - Contracts, determinism, persistence and restore, retries and replays, write failures, error mapping.
  - Do the tests discriminate (RED on base: `evidence/red-on-base-custody.txt`)? Is the regression claim exact?
  - Is the `evolves` rule minimal and sound against the engine's real in-place changes?
  - Are the native obligations clear?
- **SSCTR (narrow):** does any admission rule change what is recognised as executed, or lose a safety signal? The rules are: one live athlete report per session, after which it is a correction; a cross-author correction is refused and the athlete reports their own voice instead; a device re-sync is the device's own correction; a workout dated in the future or sent without a screen is not recorded and the app is told; the bounds of §7. Is the `evolves` amendment free of any dose effect, since it only lets custody keep what the engine already decided?

Write your verdict to `audits/v1-integration-boundary-2026-11-23/reviews/<role>/` as `.md`. Use one of these verdicts:
- Security: PASS / PASS_WITH_CONDITIONS / FAIL;
- QRE: READY / READY_WITH_CONDITIONS / NOT_READY;
- SSCTR: ACCEPT / ACCEPT_WITH_CONDITIONS / BLOCK.

List each finding with an id, its severity, whether it is blocking, a reproduction, and its owner. One focal correction cycle is allowed after this round.
