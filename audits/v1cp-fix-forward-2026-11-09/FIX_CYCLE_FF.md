# V1CP Fix-Forward: the single narrow fix cycle (2026-11-09)

**Input:** the one independent review round of candidate `4630bca`:
- SSCTR (fresh instance): **BLOCK**, three MAJOR blocking findings (`reviews/ssctr/SSCTR_FF_RECHECK.json`);
- QRE: **NOT_READY**, two blocking findings (`reviews/quality/QRE_FF_RECHECK.json`);
- Security: **PASS_WITH_CONDITIONS**, no blocking finding (`reviews/security/SEC_FF_RECHECK.json`).

**Bound (Founder rule on bounded review cycles):** every blocking finding is new or a residual, narrow and runtime-only, so this one cycle is allowed. It is followed by one narrow recheck by the same judges. Whatever that recheck still finds blocking closes the mission with a named blocker; there is no further cycle.

## Fixed in the cycle

| Finding | Owner | Fix | Directed test (red on `4630bca`) |
|---|---|---|---|
| SSCTR-FFR-01 (NB-4 residual) | SSCTR | `missedLadderWeek`: a checked week is skipped for a sport only when its prescribed sessions were all executed with no adverse or conflicting response; a check sent outside the weekly review never makes an unexecuted week done | Cycle SSCTR-FFR-01 (FASTER and BALANCED) |
| SSCTR-FFR-02 (NB-1 residual) | SSCTR | `sportPlan`: a stretch of the chain's own return with no executed session of the sport, between two of its windows, is read as days without training and the scan continues into the earlier window; a stretch with an executed session stops it | Cycle SSCTR-FFR-02 (14 days: MODERATE at every speed; 20 with the wait; the executed variant unchanged) |
| SSCTR-FFR-06 (introduced by NB-3) | SSCTR | `staleReturn` compares the strength entry with the class the return recorded for strength (`classBySport`); `breakOf` exposes it | Cycle SSCTR-FFR-06 |
| QRE-FF-01 | QRE | `missedLadderWeek` ignores a ladder week behind a readiness restart or a declared break's return (a REESTABLISH or READINESS_RESTART dated on or after the week's start) | Cycle QRE-FF-01 |
| QRE-FF-02 | QRE | `composeWeeks`: a marker an extension adds to a week with no start of its own (or one the race rule drops) is applied by placing that week again; `composeReturn`'s hold loop recomposes from that week | Cycle QRE-FF-02 (a) race in a recipe step; (b) D49 after a race moved into the return |
| SEC-FFR-01 (condition C1) | Security | `readCheck`: a key of the improvement answer that is not an open condition is reported once as `wellbeingCheck.improved.unrecognized`, never echoed | Cycle SEC-FFR-01 (a 2,000-character canary never appears in the decision, reference state or record) |
| SEC-FFR-02 (condition C3; D5) | Security, routed to SSCTR/QRE | the clinical guard reads the items the review answers yes and sets the guidance level and wording from them | Cycle SEC-FFR-02 |
| QRE-FF-03 (minor) | QRE | the default guidance level is set from the final status, after the reference state preserves a clinical dependency | none at scenario level (fuzz seeds 131, 227, 366 in the QRE record) |

Coverage tests the judges asked for, already green at `4630bca`: FF-Q1 DT4 (an adverse trailing session removes FASTER's shortcut), QRE-V1CPR-05 (a) with CF-OBS-2 (a date change into a return week), and the M12 guard with known rows (QRE-V1CPR-06 residual).

## Not in the cycle (named, with owner)

- **CF-OBS-1** (a record hold is not enforced when the reference state is omitted). All three judges classify it as an integration condition, not a blocker of this candidate. The narrow rule was tried on a scratch copy and broke 28 tests of the R7-B.2, R7-C and R7-D qualified-clearance path, which works today by dropping the reference state. A fix needs a recorded clearance form, or a reference state the server makes mandatory once F08 facts exist, decided by Security and PCG before integration (Security C2, SSCTR C-3, QRE).
- **Non-blocking:**
  - SSCTR-FFR-03 (FASTER's jump to R4 after up to 10 waited days: a precision for the SSCTR decision);
  - SSCTR-FFR-04 (a break that supersedes a wait starts the return a week late);
  - SSCTR-FFR-05 (a week with no strength session reads as "not done as planned"; the dose is unchanged);
  - QRE-FF-04 (`interruption.class` and its headline stay SHORT while both sports restart MODERATE under NB-3);
  - QRE-FF-05 (I-09's entry-week repeat counts the held days before a mid-week restart; an SSCTR reading and a copy fix);
  - QRE-FF-06 (pre-existing since FREEZE-6: `validProgram` fails after a JSON round trip; an integration condition);
  - SSCTR C-4 (directed tests the candidate's tests do not cover; the SSCTR's own probes ran them, and each behaves as ruled now that FFR-01 is fixed).
- **Security conditions C4–C7:** the data inventory and keeping the derived fields off outbound surfaces; `inputHash` and `rowHash` under custody; the tombstone extended to cross-report references; RECORD-CUSTODY and the server schema. The earlier SEC-V1CP pendings stay pending.

## Evidence

- RED: `evidence/RED_CYCLE_ON_4630bca.txt` (8 of 11 fail at `4630bca`; the 3 that pass are the coverage tests).
- GREEN: the full CoachingCore suite, 1143/1143 (`evidence/GREEN_FULL_SUITE.txt`).
- Differential (`evidence/DIFFERENTIAL_FF_vs_FREEZE6.json`, `_vs_5ee9dec.json`): unchanged by the cycle (the same 13 H1 steps vs FREEZE-6; 0 summary differences vs `5ee9dec`; H2 300/300; generations 39/39). Journeys A–G: weeks identical. Cycle mutation (`evidence/MUTATION_CYCLE.json`): 8 of 10 killed (MC-QRE02a covered by the composeWeeks-level fix; MF-D3-strength equivalent in practice; MF-M12 now killed). QRE fuzz re-run, same seeds (`evidence/FUZZ_QRE_CYCLE.json`): s1AfterRestart 78 to 0, raceAtEffortInScope 1 to 0, noGuidance 6 to 0, d49Executed 25 to 7 (the checker-limit cases).
