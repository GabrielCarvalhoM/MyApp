# Consumer audit — state model (Founder §20)

**Scope, as the Founder bounds it:** the consumers that read `stateTrace`, a week start, `state.*`, `lastPerformed`, `load`, `loadTick` or progression on the paths that feed the weekly review, progression, the return, re-establishment, historical reconciliation and next-week planning. Not a general search of the repository. Verbatim greps over `CoachingCore/src/*.mjs` for `stateTrace`, `lastPerformed`, `loadTick`, `startAuthority`, `.facts`, `evidenceMode`, `ctx.base`, `env.base`.

Each consumer is classified **HISTORY** (must read HistoricalState), **PLANNING** (reads the projection by design) or **VIEW** (reads the PlanningView, which declares both).

## 1. The decision paths

| Consumer | Reads | Class | Note |
|---|---|---|---|
| `evaluateProgram` → `ctx.base` | `planningBase(ctx)` | VIEW | One combining function per decision; every handler below takes its start from it |
| `weeklyGates` | `base ?? stateTrace[w]` | VIEW | The week's mode, return steps and the exercises' state. The fallback is used only where no decision context exists (the reducer passes its own base) |
| `evidenceStart` (the weekly review's rule) | its `start` argument (`ctx.base`, or the week as a composition re-planned it from that view) | VIEW | Was `stateTrace[w]` before this mission |
| `loggedLoadQuestions` | `base ?? stateTrace[w]` | VIEW | A question follows the adoption the transition made |
| `weekAsPlanned` | `ctx.base` for the decision's own week, `stateTrace[w]` for a later one | VIEW / PLANNING | A later week's start is a projection by design |
| `composeWeeks` far-start chain | `ctx.base` carried forward through the weeks between as planned | VIEW | Was the stored start of `fromWeek-1` before this mission |
| `moveCandidates` (D52 window of a move) | `env.base ?? stateTrace[w]` | VIEW | The re-establishment window of a moved session |
| `strengthCandidate`, `needsReestablishment`, `exposureKindOf` | the state they are planning from | VIEW for the decision's week, PLANNING for later weeks | D52, the exposure kind and the return rows |
| `rebasedNext` | `stateTrace[w+1]` when a return decided this week | HISTORY by construction | That start is the return's entry, which the return computed from history |
| `conditionalNext`, `projectWeeks` | the start they are given | PLANNING | Future weeks are projections (Founder §14) |

## 2. The history paths

| Consumer | Reads | Class | Note |
|---|---|---|---|
| `evidenceState` (the reducer) | canonical evidence; from the planning record only the week's rows, its prescription summary (`planned`), which decision closed a week (`startAuthority.*.provenance`, `evidenceThrough`) and a return's recorded entry | HISTORY | The only writer of history |
| `stateAtBreak` | `evidenceState` + `historicalStrength` | HISTORY | The state a return starts from (I13, T13) |
| `staleReturn` | `stateAtBreak` | HISTORY | The late-evidence check |
| `historicalStateOf` | `evidenceState` + `historicalStrength` | HISTORY | Public, read-only, frozen |
| `planningBase` | `evidenceState` for history's atoms, `stateTrace[w]` for the targets | VIEW | §4 of the contract lists the atoms |

## 3. Declared planning-side reads (checked, by design)

| Consumer | Reads | Why it is correct |
|---|---|---|
| `modeOf` (an observation's context label) | `stateTrace[s.weekIndex]` | It labels an executed session by the plan it belonged to (its mode and comparability class). A mismatch with history can only make a pool smaller, so it can withhold an EARNED step, never grant one |
| `finishProposal` race-week negotiation | `proposal.stateTrace[raceWeek].run` | A statement about the plan ("by race week the plan reaches…"). Its capability atoms (`achieved`, `longestContinuous`) come from the view, so they are historical |
| `own(i,state)` in `composeWeeks` | `next.stateTrace[i]` for a sport outside the re-plan's scope | That sport's projection is unchanged by a re-plan of the other |
| `adaptThisWeek` | keeps `stateTrace` | A same-week row change writes no state |
| `horizonSummary`, `knownLoadsChanged`, `changedSessions` | the proposal's rows | Descriptions of the plan, never of history |

## 4. The write boundary, verified

- `evidenceMode: true` appears at exactly three call sites, all inside the reducer or the history readers (`r6-adaptation.mjs`: the week transition, `historicalStateOf`, `stateAtBreak`). No handler passes it.
- `.facts` (the executed doses) is written only under `evidenceMode` and is deleted by every planning transition (`advanceStrength`, `strengthAtBreak`). Test "Write ownership" asserts no `stateTrace` entry carries it.
- `r6-learning.mjs` reads no state at all: the athlete model is built from bound observations (I14), asserted by the I14 test.
- `anchoredStart` records provenance, the deciding event and the evidence clock only; `projectedStart` records the rows a projection assumed. No start records values history reads back.

## 5. What the audit found and what was done

| Finding | Action |
|---|---|
| `weeklyGates`, `loggedLoadQuestions`, `evidenceStart`, `weekAsPlanned`, `composeWeeks`'s far-start chain and `moveCandidates` all read `stateTrace[w]` for rules defined on executed history (QE-R7ASE-02's class, including the P52 return-step instance) | All six now take the decision's base explicitly; the view supplies history's atoms |
| `atDose` promoted a stored dose tuple on one atom's evidence (QE-R7ASE-01) | Removed with the copying it served: the reducer applies the review's rule to its own base, and R42 separates EARNED_PROGRESS from PROJECTED_PROGRESS |
| A past week was judged under the latest plan, so a later goal or event change changed what an earlier week had earned | The reducer judges each week under the context in force for it (`sk.at(j)`), and `withContextChange` keeps past context segments |
| Each week's gates were read at the cut, so time alone could change a gate's window | Each week's gates are read at that week's own clock (the closing decision's, else its last instant) |
| `historicalStateOf` mixed "this week's start plus its facts" with "the next week's start", so the state jumped at a week boundary | It reports the reducer's own reading of the week the cut falls in (found by the self-challenge, class C3, before any freeze) |

## 6. Limits of this audit

It is a bounded search of `CoachingCore/src` on the named paths, not a proof. `r6-legacy.mjs` (the frozen R5 replay), `r2`–`r5` runtimes and the simulator are out of scope: they do not read the R6 state model. The audit does not cover KMP, HealthKit, UI or any surface, none of which exists.
