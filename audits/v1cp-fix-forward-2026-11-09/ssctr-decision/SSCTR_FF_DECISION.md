# SSCTR-V1CPFF-DECISION-r1: sporting mapping for the V1CP Fix-Forward (2026-11-09)

This record is written by a fresh SSCTR instance (claude-opus-5-5, effort max) acting as decision author. Its authority is PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, for nonclinical sporting content only.
- It adds no new dose, threshold, count or percentage.
- Clinical content stays CLINICAL_HUMAN_REQUIRED.
- Warning-sign content and urgency wording stay FUTURE_G04_REVALIDATION.
- Status: F08 = F08_OPEN, V1_COACHING_AUTHORITY_READY = NO, human queue 235 (unchanged).

The full record is in [SSCTR_FF_DECISION.json](SSCTR_FF_DECISION.json).

**Read:** the role files, the task contract, the binding decision, the implementation review, the recheck, the QRE and Security rechecks, the PCG form, and the concurrent PCG delta (DR-149, RC-16 r2).

**Code:** read only at `5ee9dec`, in a scratch extract. Four probes ran there (p1–p4).

**Literature:** S06 (the IOC consensus on acute respiratory infection, 2022) was re-read in full text from the postprint. Two searches returned records only (ACSM 2015 screening; the CHAMP rhabdomyolysis guidelines). Neither is used as support.

## Rulings

| Item | Ruling | Main points |
|---|---|---|
| FF-Q1 (D1, FP-4) | MODIFY | FASTER after a REDUCE_LIGHT window goes R4 → R5 only if the window holds a whole plan week at R3 that was executed and reviewed with its check, and no session was adverse; otherwise R3 → R4. No second R3 is added for a partial window. FASTER equals BALANCED only when the window was fully executed but holds no whole week (disclosed). |
| FF-Q2 (D3, NB-2) | MODIFY | In scope means two cases: a Situation 1 episode that affects running, until its running ladder completes; or a Situation 2 restart while its running return is in force (added: probe p4 planned a 75-min completion race after 15-min restart runs). In scope, the race slot takes the rung's operation for a hard session. There is no race-effort touch and no completion race day. The event stays visible as the athlete's own. A single non-blocking offer (keep, move, remove) replaces every race ASK. No pre-race start carries past the race. C-2 as modified is withdrawn. |
| FF-Q3 (D4) | APPROVE with conditions | The athlete can end the reduction early, from the day after the report, with the current eligibility screen. At a weekly review the window ends with that plan week. The speed rows need no change for 1–2-day windows. Precision: a REDUCE window that held no planned session of a sport follows its intent row, not the rest row. |
| FF-Q4 (D6) | No admissible lever | Every choice point was examined: offers, ladder steps, arrangement, block-boundary set, exercise selection, quality family, missed-session moves, gates. DEMANDING prescribes exactly what BALANCED prescribes. Its only differences are P4's "ACCEPT" advice and its disclosure. It is not a distinct prescriptive coach in V1. |
| FF-Q5 (D7) | Dispositions | Relevant to a current blocker: Q01, Q02, Q04, Q05, Q06, Q07, Q08, Q09. Future improvement: Q03, Q10, Q11, Q12. None is fully covered by an existing queue entry. No new item. The Founder makes one append at close: the twelve proposals, revised. |
| FF-Q6 (QRE-V1CPR-10) | APPROVE with conditions | The 14-day count is per sport. With no day left, the report takes the strictest persistence route among the chain's conditions and the new report. Otherwise the athlete is offered 1 day up to the smallest remaining allowance. A choice of 0 days is never offered. |
| FF-Q7 (NB-1, OBS-R2) | MODIFY | (i) A recipe step M ranks with R4. (ii, v) Only an equal or lighter report of the same condition, inside its window, changes nothing. Any other report moves the sport at the more restrictive rung. (iii, iv) Every unresolved condition is carried with its own end, and improvement is asked per condition. (vi) The count is per sport and resets only after a whole executed, reviewed ladder week. (vii) A sport no episode governs gets its own episode; a different region of the same sport merges into the whole sport. CH-r2-8: a recurrence after "improved" takes the persistence route (S06: symptoms that improve and then recur). |
| FF-Q8 (CF-1) | MODIFY | Lexicon V1CP-A1-LEX-3: a closed, elliptical self-inclusion rule (SELF, or ASK if uncertain), plus the missing words (operou, cirugía, mordeu/mordió, "bit me", tore with acl/lca/menisco). 43 directed texts; 32 are red at `5ee9dec`. |
| FF-Q9 (D5) | APPROVE with conditions | URGENT_CARE_ADVISED for W2, W3, W4, W5 and X1, which S06 Table 4 lists as indicators of possible cardiac involvement. Every other route is PROFESSIONAL_ASSESSMENT. All levels are marked INTERIM_PENDING_G04. X4 stays at professional assessment and is flagged as a G04 question. |

## New finding

**SSCTR-FF-N1 (MAJOR, runtime-only).** The return ignores the days the athlete waited before answering the window-end check.
- In probe p2, a 16-day stop got the same return as a 3-day window.
- Rule: waited days count toward the return, using the existing R6 return classes (up to 10 days, 11–28, more than 28).
- The Chief decides whether to include it in this mission's engineering.

## Changes to the named blockers

- **NB-1** is now C-1 as modified, read with FF-Q7.
- **NB-2** is replaced by FF-Q2.
- **NB-3 to NB-6** stand.

**SB-1 note:** a readiness declaration covers only the stop it answered. After later training, a new stop's reason is asked.

## Who acts next

- **Chief:** decides whether N1 is included; the S6 race scope; the stricter recurrence rule. The final recheck must be done by a fresh SSCTR instance.
- **PCG:** whether D3 also covers the R6 completion race day outside F08; the lexicon wording.
- **Security/G07:** the per-condition improvement answers; the derived guidance level.
- **G04:** urgency wording and X4.
- **G03:** copy.

No clinical item was raised.
