# Author rerun of the SSCTR round-10 probe on the D52 runtime

This is author material for SSCTR round 11, **not evidence**. The checks are the reviewer's round-10 probe, unchanged. Only three things were adjusted, so that the probe runs one folder deeper:
- the import paths;
- the two paths relative to the dossier: the repository root and the reconstructed round-9 `r6-program.mjs`;
- the output name.

The policy hash is unchanged (`18ec48f3…`).

Against the reviewer's own round-10 output (`../../ssctr-probe-runtime-d50-d51-r10.out.json`), **24 of the 27 sections are byte-identical**:
- A, B, C, D, G, I–X, S, S2;
- S2b and Y2b, the reconstructed round-9 runtime.

Only Y, Y2 and Z differ.

| Section | Result on the D52 runtime |
|---|---|
| Z (D52) | **0 violations** (round 10: 9). Z1 is now the establishment row for every cadence: E2W and COACH 1×10 at RIR 3 in a consolidation week, FIXED 2×8. Z2: weeks 4–7 KNOWN (7–28 days), weeks 8–9 re-established by effort (35 and 42 days). Z3: db-step-up established after the pause-dated session, and re-established at 35 days. Z4: the substitute established again in week 5, then a pending row |
| Y2 (D51) | 0 violations; the histogram of return lengths is unchanged ({3: 39, 4: 3}), and so are the rotation results. The doses differ only for never-performed bodyweight accessories first prescribed in a session dated inside the pause. They now start at their first-exposure dose (2×10 instead of 2×12), and no longer carry return markers. `clockMismatch` reads 0 because the probe's `runtimeGapBasisDays` reads `lastWeek`, which no longer exists. The clock is now `lastPerformed`, a local date, and `author-check-resume-clock.mjs` checks it directly |
| Y | Only the return-marker lists differ, for the same pause-dated bodyweight accessories |
| V | Only R14, as in round 10 |
| S2 | Identical to round 10, including its 20 listed items (Q1 and Q4, now R16) |

- **Files:**
  - `ssctr-probe-runtime-d50-d51-r10.rerun.mjs`;
  - `ssctr-probe-runtime-d50-d51-r10.rerun-d52.out.json`;
  - `console-summary.json`.
- **Run it** from this folder: `node ssctr-probe-runtime-d50-d51-r10.rerun.mjs`.
