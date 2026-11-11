# CoachingCore V1 Final Closure: the single directed fix cycle (V1FC-FIX-1)

The independent round on `2d089c0` gave Security FAIL (3 blocking), SSCTR NOT_READY for the marathon (2 blocking; READY_WITH_CONDITIONS without it) and QRE NOT_READY (2 blocking). This is the one fix cycle the Founder's rule allows. It is followed by one narrow recheck by the same three roles on the commit named in their dispatch. Nothing outside the findings was changed. Suite: 1258 of 1258.

New tests: `test/v1fc-review-fixes.test.mjs` (SSCTR and Security) and `test/v1fc-review-fixes-qre.test.mjs` (QRE). New sporting rule: `ssctr-decision/SSCTR_V1FC_DECISION_AMENDMENT_2.json`, written by the decision author at the judge's request.

| Finding | Blocking | What changed | Where | Test |
|---|---|---|---|---|
| SEC-V1FC-01 | yes | The annotation pointer `of` is inside each chain entry's MAC; the set of erased slots is inside the sealed envelope. Schema `V1CIB-CUSTODY-3`. A marker row can no longer be nulled and flagged erased in storage. | `custody.mjs` `link`, `envelope` | SEC-V1FC-01 |
| SEC-V1FC-02 | yes | The V1 entry point refuses any input that is not `R6-INTAKE-1` and any program that is not `R6-PROGRAM-1`, with a status, before a planner runs. Custody stores a plan only when `validProgram` holds (enroll and restart). | `v1-index.mjs`; `custody.enroll`, `restart` | SEC-V1FC-02 |
| SEC-V1FC-03 | yes | Custody refuses a `targetSessionId` that is not the session the same request reports as not done. The engine asks (never moves or copies) when the session named as missed is of another week or still ahead. | `custody.submit`; `r6-adaptation.mjs` `missedSession` | SEC-V1FC-03 |
| SEC-V1FC-04 | no | **Not fixed** (named condition before real data): after an erasure the stored program still holds health-derived planning entries of the erased events (the restart's cause and stops, held sports). Redacting the program means re-planning it; it stays PENDING with the operational parts. | — | — |
| SEC-V1FC-05 | no | Erasing a logged report also drops the cached question of that report. | `custody.eraseHealthFacts` | SEC-V1FC-05..08 |
| SEC-V1FC-06 | no | Only F08 rows (with the rows that reference them) and logged reports of how the athlete feels are scrubbed; another review named beside them keeps its entry. | same | same |
| SEC-V1FC-07 | no | Revoking the learning consent closes a waiting learned rearrangement; `accept` refuses one without that consent. | `custody.setConsent`, `accept` | same |
| SEC-V1FC-08 | no | Inventory rows for `unavailable`, the offer and the decline memory; the refusal over a hold has a neutral code (`CHANGE_NOT_ADOPTABLE`). | `inventory.mjs`, `custody.accept` | same |
| SSCTR R-01 | yes (marathon) | Amendment 2: marathon race day, its caution and the taper long run read the longest long run executed in the 30 days before the first taper day (days 21 to 50 before the race). Each executed long run is kept with its week and day, for the marathon only. The 10K and the half keep the program's highest (R6). | `r6-program.mjs` `raceDayLongRun`, `advanceRun`, `eventWeekSessions`; `v1-events.mjs`; the extension file | R-01 |
| SSCTR R-02 | yes (marathon) | The projection note is rebuilt from every proposal; when race day is a completion the completion note replaces it. One builder for the plan and the proposals. | `r6-program.mjs` `marathonProjectionItem`; `r6-adaptation.mjs` `finishProposal` | R-02 |
| SSCTR R-03 | no | A session planned under taper rules (by days, whatever its calendar week) is never the achieved quality peak. | `advanceRun` | R-03, R-04 |
| SSCTR R-04 | no | After a marathon, a light strength session is planned only when none is planned in the six days before it. | `buildWeek` | same |
| SSCTR R-05, R-06, R-07 | no | The run-days sentence at four run days; the 5K threshold note only where the plan can hold quality sessions; "do not train for 7 days". | `r6-program.mjs` notes | R-05, R-06 |
| QRE-V1FC-01 | yes (marathon) | A marathon whose date changes (by `EVENT_DATE_CHANGE` or `GOAL_CHANGE`) asks for a new plan, where eligibility is read. The same marathon stated again keeps the plan. | `r6-adaptation.mjs` `goalChange` | QRE-V1FC-01 |
| QRE-V1FC-02 | yes | The V1 screen of a "not 100%" report is the instrument's own reading (`readWellbeing`): condition vocabulary, every sign of the condition, unrecognized keys and non-boolean answers are asked. What V1 does not read (intent, days, sports, region, speed) is never asked. | `temporaryReductionOutsideV1` | QRE-V1FC-02 |
| QRE-V1FC-03 | no | **Not fixed** (same at `3b14804`; condition of INTEGRATION_READY): the same session report sent again under a new request id is an `ENGINE_CONTRACT_VIOLATION` instead of a typed answer. | — | — |
| QRE-V1FC-04 | no | The V1 restart holds over a record that has a temporary-reduction report. | `v1-index.mjs` `restartProgram` | QRE-V1FC-04 |
| QRE-V1FC-05 | no | The entry point's comment now says what it sets (the scope only). Integration condition: custody and any integration pass no options. | `v1-index.mjs` | — |
| QRE-V1FC-06 | no | The freeze record names the event records file and its hash. | `scripts/v1fc-freeze.mjs` | — |
| QRE-V1FC-07 | no | One directed test per gap: M04, M09, M15, M26, M30, M35. M13 and M14 are defence in depth no path reaches, left as they are. | tests | M04..M35 |

**The extension file changed** (Amendment 2 added three keys). Its hash is now the one pinned in `src/v1-events.mjs` at the recheck commit. The 5K record the SSCTR judge wrote is bound to the earlier hash, so in the default authority the 5K is off again until the judge binds a record to the new hash at the recheck (fail closed, as designed). The 5K values did not change.
