# R7-B.2 probes

Read-only probes for DOMAIN_COACHING_R7-B.2. Run each one from the repository root with the tree under test named explicitly:

```sh
PROBE_ROOT="$PWD" PROBE_LABEL=<label> node audits/domain-coaching-r7-b2-2026-10-31/probes/<probe>.mjs
```

`PROBE_ROOT` is required. `lib.mjs` resolves its default root six levels up, which from this folder is outside this repository. Each probe writes only `out/<probe>-<label>.json`.

| File | Origin | sha256 |
|---|---|---|
| `lib.mjs` | Verbatim copy of the R7-B.1 Engineering recheck probe library (`audits/domain-coaching-r7-b1-2026-10-31/reviews/engineering/recheck/probes/lib.mjs`) | `922bf59b…0885` (equal to the original) |
| `k6-stale-return-clinical.mjs` | Verbatim copy of the R7-B.1 judge probe K6 | `0917988c…ee71` (equal to the original) |
| `k6b-stale-return-two-step.mjs` | Verbatim copy of the R7-B.1 judge probe K6b | `f21b811d…a7` (equal to the original) |
| `b2-inventory.mjs` | New in B.2 (U2): the contract §4 inventory, with CAND-01, CAND-02 and the adjacent exits | — |

The originals are not run in place, because they write into the closed mission's own `out/` folder.

Labels used:
- `B2-BASELINE-033f300`: the baseline bytes, equal to R7B1-FREEZE-2 in Coaching Core.
- `B2-U2-FIXED`: the U2 fix, before the freeze.

The results are discussed in [`CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md`](../../../CoachingCore/r7/b2/BLOCKER_CLOSURE_R7B2.md).
