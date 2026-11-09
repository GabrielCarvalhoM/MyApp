# PCG-V1CPFF-F08-r1: the Founder's D1–D7 as F08 authority (2026-11-09)

Author: a fresh PCG instance (constitution 1.2.0). Status: GOVERNANCE_READY_FOR_REVIEW / PRODUCT_CONSTITUTION_DRAFT. Edits are in the working tree, uncommitted. This record is not canonical and not runtime authority. F08 = F08_OPEN; V1_COACHING_AUTHORITY_READY = NO. Full record: [PCG_V1CPFF_F08_DELTA.json](PCG_V1CPFF_F08_DELTA.json).

**Authority.** The Founder's decisions D1–D7 of 2026-11-09, summarized with quotes in [TASK_CONTRACT_FF.md](../TASK_CONTRACT_FF.md). Quotes are on disk for D1, D3 and D4 only (F04).

## What was inserted (insert-only, byte suffix verified)

- `product/PRODUCT_DECISION_REGISTER.md`: a new block **PDR-1.15 / DR-149** at the top, before PDR-1.14, with +12 −0 lines. Markers `F08_FOUNDER_D1_D7_START/END: V1CPFF-F08-r1`. DR-149 amends DR-148 clauses (2), (3) and (5) and its urgency-wording line. DR-135–147 stay skipped.
- `canon/CANONICAL_INDEX.md`: one pointer block at the top, with +6 −0 lines. The F08 pointer named DR-148 only.
- Binding check: no open mission binds either file by hash (the JSON's `bindingCheck`).

## DR-149 in one line each

1. **D1.** Low-friction return, with no daily questionnaire. No watch, exam, certificate or physical test is required for a conservative return. Executed sessions decide progression. A window's end, the elapsed time or the speed chosen never restores the prior doses by itself. A missing record is neither intolerance nor evidence. **FP-4 answered:** no speed reaches the held doses just because the window ended.
2. **D2.** The three speeds stay. They are distinct where there is margin, never artificially aggressive, temporary, and not the coach profiles.
3. **D3.** A registered race stays visible. During an incompatible return it is never automatically adequate or authorized. The athlete can move it, remove it, or keep it registered without it becoming a prescription. The athlete's decision to take part is kept separate from the coach's recommendation. The question is never asked endlessly, and eligible training is never blocked. **B6 answered.**
4. **D4.** The athlete can end a reduction early, before the third day included. A short check follows. It presumes no clinical recovery and bypasses no restriction. The 3–14 days are a choice made at the report, not an obligation.
5. **D5.** Interim warning-sign wording: stop and seek a professional assessment. A potentially serious sign gets urgent care proportional to the risk, using the existing instrument. No diagnosis, urgency class or clearance is invented. Wording that depends on G04 is marked for review. Mild indisposition is never an emergency.
6. **D6.** Demanding is distinct only if the SSCTR finds a real, admissible difference. Otherwise it is not declared complete or presented as distinct prescription in V1. **C-Q09-2 answered.**
7. **D7.** Each of the 12 queue proposals gets a traceable disposition, with nothing automatic. The queue stays at 235.

## RC-16 r2

> No new dose, threshold, count, length, increment, cadence or percentage unless the SSCTR approves it as a NEW PARAMETER in a separate file with its own decision record. The 3-14 day range is Founder-decided (D2, B1) as the reduction the athlete chooses at the report (DR-149 (4), D4): it is neither an obligation to stay in the reduction nor a minimum time of indisposition. The athlete may end the reduction early, before the third day included, by stating they have recovered; the statement opens the short check, with the clinical screen first (RC-01) and every warning-sign item and restriction the existing instrument requires for that context (an unanswered item is ASK). An early end presumes no clinical recovery, is never a clearance, and never bypasses a limit, a contraindication or a restriction in force (RC-09). The return after it follows the return rules (RC-12, DR-149 (1)) from the window's actual days. An early end never resets the per-sport 14-day count (RC-06 reading). The upper bound stands: a reduction never extends a continuous per-sport window past 14 days without a Founder decision.

The previous text is kept in the JSON record. RC-16 r2 ends the day-3 floor that the recheck's C-3 used as an interim. The last sentence is a PCG reading (F08), and the Chief may strike it.

## Open PCG items

- **RC-06 and RC-07 under the modified C-1:** no conflict, under the conditions in `R-RC06-RC07-1`:
  - The rules apply per sport, and the result is never less conservative than any open episode.
  - Each sport is counted from the first window start of its chain. An episode on a disjoint sport neither resets nor extends that count.
  - A continuous window never goes past 14 days.
  - Neither an early end nor a declared break resets the count.
  - Supersession inside Situation 1 is not a conversion. A report and a break are never converted into each other, and each keeps its type, cause and record.
- **The two race questions:** both offer the same three paths, and "keep" means D3's keep at both (`R-RACE-1`, finding F01):
  - C-Q05-3's "end the window before it" no longer comes with keep. Ending early is the athlete's D4 act.
  - C-2's "the return ends before the race week … event rules" does not apply to an incompatible return.
  - A pending answer never blocks eligible sessions.
  - The SSCTR maps compatibility and the coach's recommendation.
- **Also answered:** C-Q01-5 is consistent with R-F08-1. MILD_INDISPOSITION as illness-type is consistent with DR-148. I-20 is consistent with RC-03.

## Not recorded here, and why

- No sporting mapping, rung or dose. That belongs to the SSCTR, whose `ssctr-decision/` folder was absent and was not used.
- No copy (Product/UX with G03), no new field (Security with G07) and no clinical content (G04).
- No per-item queue disposition. That belongs to the SSCTR.
- The earlier records are not edited. PCG-V1CP-F02 (FP-4) and F03 (urgency) are marked answered only in this record.
- Not run: `npm run verify`, `verify-r*`, `scripts/agent_system.py` (no Python available).
