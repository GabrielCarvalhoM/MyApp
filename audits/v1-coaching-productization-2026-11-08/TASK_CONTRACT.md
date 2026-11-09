# Task contract: V1_COACHING_PRODUCTIZATION (V1CP-TC-r1, 2026-11-08)

**Authority:** the Founder's direct request of 2026-11-08 (V1 Coaching Productization), summarized here and not copied. It is a new functional mission, independent of DOMAIN_COACHING_R7-D (closed READY_WITH_CONDITIONS, R7D-FREEZE-6).

**Authorized:**
- the three residual defects (A1–A3), with reproduction, causal fix and regression;
- the experience and records data-path audit, plus fixes inside the existing authority;
- F08 by D2: authority deltas covered by D2 only, then runtime;
- the three coach profiles;
- independent volume and difficulty controls;
- full CoachingCore regression;
- SSCTR and QRE reviews of the deltas;
- the integration contract for the app and Figma;
- an eventual candidate or freeze.

**Not authorized:**
- reopening R7-D, a new R7-D phase, or any write under `final/` or `final2/`;
- editing any freeze record or the FREEZE-6 bytes;
- Figma edits or screens;
- HealthKit or wearables, Crew, gamification or new sports;
- a change of commercial positioning (D1);
- a paid professional audit as a precondition;
- competitive research beyond what exists;
- a new holdout program;
- a push or a merge;
- recursive deletion.

**Branch:** `claude/v1-coaching-productization`, worktree `.claude/worktrees/v1-coaching-productization`, from `32b5ce3`. The human queue stays at 235 items: proposals only, with the append left to the Founder.

| Unit | Level | Owner | Independent judge | Stop when |
|---|---|---|---|---|
| A2 last-week rule | L1 | Chief / Engineering | QRE (final) | RED → GREEN, every review kind in the last week has no error path |
| A1 screen semantics | L2 | Chief / Engineering | SSCTR (decision, then review); QRE | the question leads to its own exit; no relevant sign ignored |
| A3 per-sport stop | L2 | Chief / Engineering | SSCTR (decision, then review); QRE | H28 shape fixed, or the residual kept by decision |
| E audit and fixes | L1/L2 | Chief / Engineering | SSCTR (E1, E2); QRE | each field's path documented; synthetic athlete regression |
| F08 authority | L3 | PCG (author) | PCG fresh instance (fidelity); Founder D2 is the decision | deltas covered by D2 only, traceable |
| F08 data | L3 | Chief | Security (conditions) | minimisation, consent and retention conditions recorded |
| F08 runtime | L2/L3 | Chief / Engineering | SSCTR, QRE | Situations 1–3 working, with every protection in §1 of the F08 delta |
| Profiles, volume, difficulty | L2 | Chief / Engineering | SSCTR (decision, then review); QRE | the levers the SSCTR approves implemented; defaults byte-identical to FREEZE-6 behaviour |
| Contract and handoff | L1 | Chief | — | contract consumable by the designer and the implementer |

**Cycle bound:** one review round per judge on the candidate. At most one bounded fix cycle, and only for a new, narrow, runtime-only blocker; anything else closes with a named blocker and owner (Founder rule, 2026-10-26).

**ESCALATE_IF:**
- a need for a medical document;
- the app claiming a clearance;
- a relevant sign being ignored;
- a new number without evidence;
- a strategic or subjective choice the Founder owns.

**Design input to the judges:** `DESIGN_V1CP.md` in this folder.
