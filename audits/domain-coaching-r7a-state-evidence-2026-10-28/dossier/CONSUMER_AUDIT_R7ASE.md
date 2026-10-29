# COACHING CORE — STATE EVIDENCE MODEL — consumer audit (Founder §21)

**Scope (§21):** the readers of the stored state that feed progression, return, weekly review, planning and historical reconciliation: `state.*`, the week starts (`stateTrace[k]`, `weeks[k].startAuthority`), and review evidence. The question for each reader: does it treat a value that is present as a fact?

**Method:** I grepped `src/*.mjs` at the source frozen as STATE-EVIDENCE-FREEZE-1 for:
- `stateTrace`, `startAuthority`, `startBeforeReturn`;
- `lastPerformed`, `needsReestablishment`;
- `historicalView`, `stateAtBreak`, `staleReturn`.

Each reader is classified by the view it must read (contract §2). Line numbers are those of the frozen bytes. The search was bounded to the state path, as §21 asks; tests and scripts are not runtime consumers.

## History: must read the historical view

| Reader | Where | What it decides | Reads |
|---|---|---|---|
| `stateAtBreak` | `r6-adaptation.mjs:826` | The state at an interruption, and so every return's entry, its ceilings and its staleness | `historicalView` (line 834), value by value. Only the return week's facts are added (`at.atDose`, `strengthAtBreak`) |
| `returnAfterPause` | `r6-adaptation.mjs:874` (lines 917–919, 950) | The RETURN_AFTER_PAUSE handler: the episode, the entry and the replaced start | `stateAtBreak`. Line 950 *records* the start a return replaces (`startBeforeReturn`) without reading a value from it |
| `staleReturn` | `r6-adaptation.mjs:866` | Whether late evidence changes a return in force | `stateAtBreak` |
| `projectedBaseOf` | `r6-adaptation.mjs:250` | Which values a review's start carried from a projection (`projectedBase`) | The stored start compared with `historicalView` at the review's clock. A record, read only by `historicalView` |
| `historicalView` | `r6-adaptation.mjs:683` | The one reader of the stored starts and their authority for history | `stateTrace[k]`, `startAuthority` (or `startBeforeReturn` and its authority for a replaced start), under the rules of contract §4 |
| `updateLearningModel` | `r6-learning.mjs:16` | The athlete model (I11) | Only reported observations, never a stored start. An observation is bound to the prescription it executed by `bindObservations` |

## Planning: reads the planning view by design (E1)

| Reader | Where | What it decides | Why the planning view is right |
|---|---|---|---|
| `evidenceStart` | `r6-adaptation.mjs:256` | Next week's start after a review | The planner continues from what was prescribed (Founder §15, §16). The values it carried from a projection are recorded (`projectedBase`), and history rebuilds them |
| `weeklyGates` | `r6-adaptation.mjs:151` (lines 154, 171) | The review's gates | They judge the week *as prescribed* (its run mode, the return steps of its rows) against the week's evidence |
| `loggedLoadQuestions` | `r6-adaptation.mjs:86` | Questions about logged loads | Loads logged against the rows as prescribed |
| `weeklyReview` | `r6-adaptation.mjs:383` | Whether a pending load moved | A comparison with next week's stored start: planning bookkeeping |
| `finishProposal` | `r6-adaptation.mjs:267` | The race-week assessment | The projected race-week start (E1) |
| `rebuild`, `equipmentChange` | `r6-adaptation.mjs:462`, `:544` | Proposals re-planned from the stored start | Planning. Their `WEEK_EVIDENCE` starts carry `projectedBase` |
| `bindObservations` / `modeOf` | `r6-adaptation.mjs:111–121` | The context of a reported observation | It labels a fact with the prescription the athlete executed; it reads no state value as a fact |
| `rebasedNext`, `moveCandidates`, `weekAsPlanned`, `composeWeeks` | `r6-composition.mjs:32`, `:55`, `:172`, `:204` | The plan's weeks, their rows and starts | Planning; each placed week records its start's authority |
| `strengthCandidate` (`needsReestablishment`, D52) | `r6-program.mjs:340` (line 362); `:335` | A row's exposure, from the planning start's last-performed date | E1: a plan made before facts arrive cannot know them, and the next review reads them |

## Finding

No history consumer reads the planning view except through `historicalView`. Every planning reader is one the contract declares under E1.

The same pattern appeared in four places, and each was fixed in this mission before the freeze:
- **`historicalWeekStart`:** it trusted a review's start as a whole. It is replaced by `historicalView` (QE-R7AB-01).
- **`strengthAtBreak`:** it kept a known load the athlete did not lift. It now has the load fact (P5).
- **Last-performed dates:** history kept the planned date of a verified projection. It now keeps the executed date (B7).
- **Projection verification:** a gate advanced on a log in an unknown unit counted as verifying a projection. It no longer does (inherited from R7A-BOUNDARY-FINAL-FREEZE).

E1 to E6 remain declared boundaries (contract §7), not findings.
