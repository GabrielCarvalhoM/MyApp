# V1 Freeze → Claude sync — integration record

Date 2026-10-19 · Founder-authorised in the current Claude session (V1 FREEZE SYNC → TARGETED UX DELTA → VISUAL/UI).

## Source
- Handoff: `V1_FREEZE_CLAUDE_HANDOFF.md` (Founder/Work delivery, outside the repo); in-repo copy `audits/v1-freeze-2026-10-19/CLAUDE_HANDOFF.md`.
- Freeze commit `87537c85f152ef495d756fff2ea193fafa6439b6` on `docs/v1-freeze-before-visual` (SIL base `07a119b`). Not checked out, not merged; tree not replaced.
- Applied: `vilumo-v1-freeze-combined.patch` (SIL + freeze + training addendum) only. The standalone SIL patch was **not** applied.

## Checks
| Check | Result |
|---|---|
| Branch / HEAD / tree before apply | `main` / `6d4a153` / clean (tree `c04daada…`) |
| Combined patch SHA-256 vs manifest | `28e0a78e…84d3` = manifest ✓ |
| `git apply --check` on current HEAD | exit 0, 68 files, no conflicts |
| Post-apply hash of the 16 frozen artifacts vs `V1_FREEZE_VERIFICATION.json` | 16/16 match |
| Legacy UX verifier (`verify_uxspec.ps1 -Mode final`) | 306 pass / 27 fail / 2 warnings → see below |

### Legacy verifier result, classified
The UXSPEC verifier is a **preservation** verifier for the closed UXSPEC mission: it asserts that canon and consumers stayed byte-identical to that mission's baseline. The freeze intentionally changes them, so its 27 failures are expected and all trace to the freeze:
- 12 `preserve:*` + `canon:ptc-3.0.0` — every changed file now equals the freeze manifest hash (PTC 3.0.0 → 3.2.1, PA/AEC/RS/PDM-1.3, EM/CF-1.2, PDR-1.3).
- `scope:new-files-allowlisted` — new SIL/freeze audit folders and the three Intelligence specs.
- 6 `cover:upstream-refs:*-1.1` — references bumped to the new versions.
- `O015`, `F08`, `F09`, `Runna`, `poucos segundos`, `Architecture Eval` — conversation and Crew are deferred (F08/F09 and O015), and old mission matrices moved to Git history (UXS §25).
- `final:spec-is-reviewed-r3` — the spec is now UXS-1.1-FREEZE-r2.

There is no material regression. The pre-sync baseline (334/0 at `6d4a153`) is kept in `audits/ux-spec-2026-10-18/FINAL_VERIFICATION.json`. UXS-1.0-r3 (`598b055d…`) stays byte-identical at `audits/ux-spec-2026-10-18/review-inputs-r3/UX_SPECIFICATION.md` and in commit `6d4a153`. Freeze-side evidence (718/0 delta checks, four PASS reviews) is in `audits/v1-freeze-2026-10-19/`.

## Not done (proportionality)
No new judge cycle, research, discovery or rewrite. No material conflict was found.
