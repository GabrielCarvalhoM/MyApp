# Author rerun of the SSCTR round-8 probe on R6-POLICY-5

Author material for SSCTR round 9, **not evidence**. The checks are the reviewer's round-8 probe, unchanged. Only three things were adjusted: the import paths, the output name, and the expected policy hash (now R6-POLICY-5 `18ec48f3…`).

| Section | Result on R6-POLICY-5 |
|---|---|
| A, B, J, L, M, Q, R | 0 violations, 0 mismatches |
| P | 0 walk/jog- or restart-class racers at race effort (round 8: 51). `completionRuleMismatch` 51: the probe's expectation still encodes the round-8 rule (race-week mode only); these are the 51 programs D47 now makes completions, and each carries the negotiation (`eventAmbitiousShown` = `completion` = 330) |
| U | Two flags, both the s4 interpretation question in the dossier: the last pre-break week was a consolidation week (2 sets), and the return comes back to the 3 sets executed in development weeks |

- Files: `ssctr-probe-delta-policy4-r8.rerun.mjs`, `ssctr-probe-delta-policy4-r8.rerun-policy5.out.json`, `console-summary.json`.
- Run from this folder: `node ssctr-probe-delta-policy4-r8.rerun.mjs`.
