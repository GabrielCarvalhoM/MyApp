# SSCTR review of the V1CP implementation candidate (SSCTR-V1CP-IMPL-r1)

**Verdict: NOT_READY** for the V1CP sporting behavior of candidate `fa3985b`. This is not V1 authority: F08 stays F08_OPEN and V1_COACHING_AUTHORITY_READY stays NO.

The structured record, with evidence, file:line references and scenarios, is `SSCTR_V1CP_IMPL.json` in this folder.

## Who and how

- A fresh SSCTR instance (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only). It authored none of the decision record, the design, the code or I-01..I-21.
- The code was judged against `SSCTR_V1CP_DECISION.json` (sha256 `0898c59a…a166`), read in full.
- Executable evidence, rerun by this instance:
  - suite: 1058/1058 pass;
  - default-path differential: H2 300/300 identical; H1 13/130 steps differ, all of them Block 1 decisions;
  - about twenty probe scripts, kept outside the repository.
- No new literature was needed. Every ruling applies a rule the decision record already sources, and no new number is introduced.

## Fidelity per item

| Item | Fidelity |
|---|---|
| Q01 A1 screen | FAITHFUL_WITH_CONDITIONS (-10, -11) |
| Q02 A3 per-sport stop | FAITHFUL |
| Q03 E1 training months | FAITHFUL |
| Q04 E2 race results | DEVIATES, MAJOR (-07) |
| Q05 Situation 1 | DEVIATES, BLOCKING (-01; also -03, -05, -06) |
| Q06 speeds, transitionRule, D49, loadReference | DEVIATES, MAJOR (-02, -04; -12) |
| Q07 Situation 2 | FAITHFUL_WITH_CONDITIONS (-08, -09) |
| Q08 Situation 3 | FAITHFUL |
| Q09–Q11 levers | FAITHFUL |
| Q12 interactions and default byte identity | FAITHFUL |

**Verified faithful by execution:**
- the rung operations R0–R3;
- every speed sequence;
- D49 on every rung (sets 1→2→3→4);
- the load reference within 28 days (60 kg and 90 kg logged on R2/R3 never replaced 82.5 kg);
- the window wait and the window-end check, and persistence;
- the warning-sign instrument;
- the Situation 2 MODERATE floor, holds, restrictions and triggers;
- the C-Q08-2 coherence;
- the levers' one-axis rule and the byte-identical default path.

## Findings

**BLOCKING**
- **SSCTR-V1CPI-01.** A report made while an episode is open applies neither the new condition's sport coverage nor its intent ceiling (Q05, Founder B4).
  - A mild illness reported during a running-only window leaves strength at full doses, and the next review steps it up.
  - An illness reported in an R4 week keeps the long run and near-normal strength for two weeks.
  - This meets the contract's ESCALATE_IF "a relevant sign being ignored".

**MAJOR**
- **-02.** From 29 days after the last pre-window session, rungs re-establish strength by effort, and the held reference does not return at R4. The held start freezes `lastPerformed`.
- **-03.** A declared break after a rest window reads only its declared days. In the probe, 21 days without training became a SHORT return.
- **-04.** A ladder week that is neither reported nor reviewed passes on the projection. The held doses (R4) can follow an unexecuted R3: this is calendar-only progression.
- **-05.** A ladder that crosses a race keeps race effort in an R3 week. After the race, it imposes the pre-race held start on the next block (long run 70 min against the planned 40).
- **-06.** An early recovery has no exit before the chosen window end, and two lighter re-reports send an improving athlete to the clinical hold. This is a **B6 gap**.
- **-07.** A short race result caps the stated exposure for weeks. A 25-minute 5K takes 150 min/week to 75; a 12-minute 3K prescribes 12-minute runs.

**MINOR**
- **-08.** The BALANCED hold is absorbed when the entry week is partly done.
- **-09.** When a restriction ends, the record and the reason misstate the region's lapse and the hold.
- **-10.** An elliptical "me too" across a clause boundary resolves to NONCLINICAL on a structured no. This is new with A1.
- **-11.** Pre-existing lexicon misses.
- **-12.** The regression inside the ladder is untested.

## Rulings on I-01..I-21

| Ruling | Interpretations |
|---|---|
| ACCEPT | I-01, I-02, I-03, I-04, I-07, I-08, I-11, I-12, I-18, I-19, I-21 |
| ACCEPT with conditions | I-05 (needs -06), I-06 (disclosed; never the systemic case), I-13 (load shown as a ceiling), I-16 (directed test) |
| MODIFY | I-09 (count the hold in executed weeks), I-10 (record the region's own stop; no hold claim), I-14 (execution facts from the record, reference doses held), I-15 (the window's rest and waiting days count as days without the sport), I-17 (a race inside a reduced rung is asked; the ladder never crosses the race) |
| Not mine | I-20 (PCG, Q4 scoping) |

No interpretation is rejected.

## Owners and next step

**Runtime-only, under rules stated in this record:** -02, -03, -04, -07, and -08 to -12.

**Need the Chief to consolidate an SSCTR ruling first:**
- -01 (chained reports supersede the open episode and open their own window, within the 14-day bound);
- -05 (race inside the ladder);
- -06 (early window end).

**Founder:**
- the B6 judgment on -06;
- B4 on -01, for information;
- the 3-day floor for an early end (RC-16, with PCG).

**Also:** the Chief decides the cycle bound. After the fixes, a fresh SSCTR instance rechecks them. The human queue stays at 235, with no new proposal.
