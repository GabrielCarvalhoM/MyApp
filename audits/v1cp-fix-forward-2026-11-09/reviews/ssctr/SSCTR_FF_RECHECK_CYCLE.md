# SSCTR: narrow recheck of the fix cycle 0950b0a (V1CP Fix-Forward)

**Record:** SSCTR-V1CPFF-RECHECK-CYCLE-r1, 2026-11-09. The JSON file next to this one is the authoritative record; this summary is short.
**Reviewer:** a fresh SSCTR instance (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical sporting content only; an AI agent with no human credentials). It authored none of the candidate, the cycle, the decision or the tests.
**Disposition: BLOCK.**

## What was checked
- All code was evaluated from fresh `git archive` extracts of 0950b0a, 4630bca and 5ee9dec, never from the worktree.
- Suite at 0950b0a: 1143/1143 pass.
- Default path: the R7-D holdout differential against 5ee9dec is unchanged (H1 0 differing steps, H2 300/300, generations 39/39).
- The 14 round-1 probes give byte-identical output at 4630bca and 0950b0a.
- 8 new probes (q01 to q08) were written and run.

## Round-1 findings
| Finding | Ruling | Evidence |
|---|---|---|
| SSCTR-FFR-01 (NB-4) | CLOSED | Unexecuted week with an off-review check on any day: the rung repeats in 32 of 32 cases. Partly executed: repeats. Fully executed and checked: advances. Adverse responses and execution are read per sport. |
| SSCTR-FFR-02 (NB-1) | CLOSED (its scenario) | 14 days without training give MODERATE at every speed, and 20 days with the wait give MODERATE. The executed variant is unchanged. |
| SSCTR-FFR-06 (NB-3) | CLOSED | No review, check or report asks to confirm the break again (both sports, RUN-only, STRENGTH-only). A truly stale return asks once, and confirming ends it. |

## New findings
- **SSCTR-FFC-01, MAJOR, BLOCKING (NB-1 residual, pre-existing).**
  - A REDUCE window with no executed session loses its days when the chain also holds a REST report.
  - Example: REDUCE_SUBSTANTIAL for 12 days (nothing done), then a 3-day REST report. At FASTER the plan is R3 then R4 (long run 55 and 12 sets at RIR 3 in week 4).
  - The REDUCE report alone gives the MODERATE recipe (15-minute entry runs).
  - Fix: in `sportPlan`, read those days as rest (C-Q05-5) when the row is REST.
- **SSCTR-FFC-02, MAJOR, BLOCKING (NB-3 principle).**
  - Setup: a REST window, the improvement check answered, a first return week with nothing executed, then a 2-day declared break.
  - Result: SHORT class and the held doses (14 sets at RIR 3, long run 50) after 17 days without training. The same days without the answered check give MODERATE.
  - The cycle's QRE-FF-01 skip removed the R3 repeat that 4630bca re-laid. 5ee9dec behaves like 0950b0a.
  - Fix: the break's per-sport reading counts the superseded episode's unexecuted return days as days without training.
- **SSCTR-FFC-03, MINOR, non-blocking.**
  - A checked ladder week with no prescribed session of a sport counts as done, so that sport's rung steps after an off-review check.
  - FF-Q2 (d) says the rung carries. No dose effect was observed.

## SEC-FFR-02 (routed to SSCTR)
**Ruling: yes.** Under D5 / FF-Q9, a newly answered item sets the guidance level while a clinical dependency stands. The cycle's version conforms:
- W2 to W5 and X1: urgent care.
- Other items: professional assessment.
- The hold is never lowered: status stays CLINICAL_HUMAN_REQUIRED and nothing is planned.

The urgent wording stays INTERIM_PENDING_G04.

## Other items
- FFR-03, FFR-04, FFR-05 and C-4 to C-10 stand. FFR-05 now also relates to FFC-03, and C-4 is only partly met by the new tests.
- O-1 to O-3 stand. O-4 is added (G03/G04: the urgent advice is not repeated at later reviews of a standing hold). O-5 is added (pre-existing and conservative: a week fully reported at the next Monday review repeats).
- **CF-OBS-1:** C-3 stands unchanged. It blocks integration readiness and real use, not the closure of this shadow candidate.

## States
| State | Value |
|---|---|
| Implementation done | Yes |
| Technical validation | NOT_READY (FFC-01, FFC-02) |
| Integration readiness | NO |
| Authorization for real athletes | NO |
| App publication readiness | NO |
| F08 | F08_OPEN |
| V1_COACHING_AUTHORITY_READY | NO |
| Clinical judgment | CLINICAL_HUMAN_REQUIRED |
| Human queue | 235 (nothing appended) |

Under the bounded-cycle rule, the mission closes NOT_READY with FFC-01 and FFC-02 as named blockers. Both go to a future mission's narrow runtime cycle and a narrow SSCTR recheck.
