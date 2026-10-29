# Author rerun of the SSCTR round-11 probe on the D53 runtime

This is author material for SSCTR round 12, **not evidence**. The checks are the reviewer's round-11 probe, unchanged. Only the paths changed, so that the probe runs one folder deeper:
- the import paths;
- three paths relative to the dossier: the repository root, the reviewed round-10 sources for section Zb, and the reviewer's round-10 output that section COMPARE reads;
- the output name.

The policy hash is unchanged (`18ec48f3…`).

Against the reviewer's own round-11 output (`../../ssctr-probe-runtime-d52-r11.out.json`), **31 of the 35 sections are byte-identical**. The identical ones are A–D, G, I–Z, Zb, AA, AC, AE, AG, S, S2 and COMPARE.

| Section | Result on the D53 runtime |
|---|---|
| AH (D53) | **0** next exposures more than one set above the performed re-establishment (round 11: 120 of 584). 72 timelines, 600 performed re-establishments, 584 next exposures; none rises more than one set above the count before the gap. Example: the FIXED STRENGTH back squat is re-established in week 7 at 2 sets, then 3×5 in week 8 (round 11: 4×5) |
| AB (Q2) | Only the set counts after the re-establishment that logged no load: 3×5 → 2×5 and 4×5 → 3×5, one set per executed week |
| AD (Q4) | Only the variant "firstOnlyLogged", week 6: 3×10 → 2×10, held back from the re-establishment count |
| AF (R18) | Only the "every week reviewed" timeline, week 2 after the gap: 4×5 → 3×5. The unreviewed timelines are unchanged; R18 stays open |

- **Files:**
  - `ssctr-probe-runtime-d52-r11.rerun.mjs`;
  - `ssctr-probe-runtime-d52-r11.rerun-d53.out.json`;
  - `console-summary.json`.
- **Run it** from this folder: `node ssctr-probe-runtime-d52-r11.rerun.mjs`.
