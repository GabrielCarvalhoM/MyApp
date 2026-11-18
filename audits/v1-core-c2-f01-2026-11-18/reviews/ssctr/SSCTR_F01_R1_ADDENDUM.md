# SSCTR CORE-C2-F01 review R1, addendum: QRE-F01-01 (2026-11-18)

**Decision: unchanged, ACCEPT_WITH_CONDITIONS. QRE-F01-01 is disposed of as an open condition. No runtime change now, and SSCTR does not spend the focal correction cycle.**

- **In substance, C-Q08-1 does apply** when the record holds this athlete's execution reports but none is in force.
- **The current gate falls short of the decided rule.** `rows.some(executed)` reads such a record as "covering nothing". That is a pre-existing gap between the code and C-Q08-1, not the rule's reading.
- **Shape (b) goes further than the bound.** It also shows that a session whose amount is disputed is read as no session at all. C-F01-1 is widened to cover this (r2) and now binds before any real-athlete use of `restartProgram`.
- **For this freeze and for synthetic use,** the gate stays as it is, named open.

Reviewer, authority and method are as in `SSCTR_F01_R1.md`. QRE_F01_R1 (committed `be2ea69`) is read, and this addendum answers its QRE-F01-01. The probes are new files in my scratch folder (§4). I changed no runtime, test or queue file.

## 1. Shape (b), reproduced

**Record.** The app and the watch reports are merged. The athlete then corrects the app report from 50 to 20 min while the watch says 50. Normalization flags the correction `conflicted` and supersedes the merged row. The stated intake is 600 min / 7 days.

| Record | `d92aa88` | `576e40c` |
|---|---|---|
| Disputed session 3 days ago, nothing else | 13 / 1, pause 3 d | **600 / 7 unbounded, pause null, last executed null** |
| Disputed session 20 days ago, nothing else | 13 / 1, pause **2 weeks** | **600 / 7, pause null** (the record's pause is lost) |
| Disputed session 3 days ago, plus one execution 13 days ago | 25 / 1, pause 3 d | 13 / 1, pause 13 d |
| Disputed session 20 days ago, plus one execution 30 days ago | 13 / 1, pause 20 d | 0 / 0, pause 30 d |

**A direct conflict with no correction gives the same result on both trees, so this is pre-existing.** The app says 50 and the watch says 20; the first row is flagged conflicted.
- Alone in the record: 600 / 7 unbounded, pause null, on `d92aa88` and on `576e40c` alike.
- After a readiness declaration (shape below): pause 2 weeks with `readinessDeclared:true`, on both trees.

The fix routes a corrected conflict into the engine's existing reading of conflicts. It did not create that reading.

## 2. What shape (b) adds: a disputed amount is not "no session"

- **What the record says.** In shape (b) every voice agrees the session took place: the merged row says done, and the conflicted correction says done, 20 min. Only the amount is disputed.
- **What the code makes of it.** It reads the session as no execution everywhere. That has four consequences:

  | Use | Effect of reading the session as none | Direction |
  |---|---|---|
  | **Bound** (minutes, days) | Counted as zero | Conservative, consistent with quarantine. Acceptable. |
  | **Pause and last executed day** | An earlier execution sets a longer pause (conservative). With nothing else in the record, the pause is lost entirely: 2 weeks read on the base, null on the candidate. | Mixed; the second case is anti-conservative |
  | **Gate** | No execution left, so C-Q08-1 does not bound at all | Anti-conservative |
  | **`trainedAfter`** | See below | Narrows a screening question |

- **`trainedAfter` in detail.** The record holds a readiness declaration on day −10, one run on day −20, and a disputed session on day −6.
  - **`d92aa88`:** the session counts as training after the declaration. The stop after it is new: pause 6 days, no `readinessDeclared`. With no reason stated, the intake screen is `ASK / MISSING_REASON` (`screenInterruptionReason`), which is the SB-1 question.
  - **`576e40c`:** no training after the declaration is read. The result is pause 20 days with `readinessDeclared:true`, so the intake screen becomes `READINESS_DECLARED` and **the reason of the new stop is not asked**.
  - **Why this matters.** The declaration now stands in for a stop it did not answer, and SEC-V1CPI-02 / RC-11 (SB-1) exist to prevent that. A plausible real case is an athlete who corrects a run down because they stopped early, after which the watch disagrees.
  - **Shape (a), for contrast:** the post-declaration session corrected to "not done" gives the same 20 days with `readinessDeclared:true`. That is correct, because no training happened after the declaration.
  - **Base behaves the same way on a direct conflict:** it also lets the declaration stand in. This too is pre-existing.

**Amendment to R1 item 4.**
- Still true: every HOLD and CLINICAL_HUMAN_REQUIRED early return is unchanged in code.
- Corrected: "clinical-screen authority unchanged" is not entirely true for shape (b) after a readiness declaration. The SB-1 reason question that `d92aa88` asked is no longer asked. The cause is the pre-existing reading of conflicts, now reached through a correction.
- This is not a clinical judgment by SSCTR. It is a narrowing of when the screen's question fires. It belongs to C-F01-1 (r2), and Security should be told, because SB-1 is theirs.

## 3. Answer to QRE's question, and why not change it now

**Does C-Q08-1 apply when the record holds execution reports but none in force? Yes, in substance.**
- The rule reads "what the record shows executed in the period it covers". Reports of sessions not done, replaced or disputed in that window mean the record covers the window.
- "Unknown stays unknown" refers to an exposure the intake does not state. It does not refer to the record.
- The current gate is therefore a gap between the code and the decided rule.

**Is the current gate acceptable for this freeze as an open condition owned by the next Core mission? Yes.** The reasons:
1. It is pre-existing and reproduces on `d92aa88`: a record of "not done" reports, or a direct conflict, gives the same result. The fix only makes corrected records read as their in-force equivalents, which is the as-if oracle C2-C1 set.
2. The worst case for the bound is the self-reported cold start that every athlete without history gets (HQ-R6-COLD-START envelope).
3. The class is narrow. No execution in force may remain anywhere in the record, or, for `trainedAfter`, among the sessions after the declaration.
4. The line has synthetic and shadow standing only, with V1 authority NO.
5. The correct change is a design decision, not a one-line fix. It needs a choice between bounding and ASK, a choice of how to count a disputed amount, and a check of the effect on direct conflicts outside F01. That is a C-Q08-1 and SB-1 fidelity change, larger than "fix only CORE-C2-F01", and it is better done with its own review than in the single focal cycle.

**But C-F01-1 must bind before any real-athlete use.** Shape (b) is an ordinary athlete-plus-watch flow, and it reaches the SB-1 screening question. So C-F01-1 becomes binding for real-athlete use, and it is no longer only something to name in the reports.

## 4. Conditions (revised)

**C-F01-1 r2 (replaces C-F01-1).**
- **Binding:** not binding for FREEZE-2 or synthetic use. **Binding before any real-athlete use of `restartProgram`.** The integration readiness report must list it as an open blocker for real-athlete exposure.
- **Owner:** the next Core mission, then an SSCTR review. Chief routes it to Security as well, for SB-1.
- **Scope:**
  - **(i) The gate.** C-Q08-1 applies whenever the record holds this athlete's execution reports in the window, whether in force, replaced, not done or conflicted. The mission chooses between bounding to the window and an ASK that confirms the stated exposure against the record.
  - **(ii) Disputed amounts.** A session whose reports all say it was completed, with only the amount disputed (conflicted), is an execution for the pause, the last executed day and `trainedAfter`. For the bound, its minutes are counted conservatively: zero, or the lowest reported value, to be decided.
  - **(iii) A session reported "not done" in force** is not an execution. That part of R1 stands.
  - **(iv) The tests.** Re-pin the tests named below to the decided reading.

**Accepted as residuals under C-F01-2:** QRE-F01-02 (order-dependent `once()`), QRE-F01-03 (an unmarked original or a stale part copy) and my R-F01-2. They are the same class: record custody and integrity.

C-F01-2, C-F01-3 and C-F01-4 are otherwise unchanged, and so are the carried conditions.

**The coordinator's planned actions (no runtime change) are endorsed, with one addition.**
- Correct CANDIDATE §2 and §7. "Never raised" and "confined to double credit" are inaccurate for this class, as R1 item 2 already found.
- Pin `recent` for shapes (a) and (b), labelled **open C-F01-1**. The label must make clear the pin records today's behaviour and is not a decided reading.
- **Addition:** the `trainedAfter` test should cover two cases.
  - (a) after readiness: `readinessDeclared:true`. This is the decided-correct reading.
  - (b) after readiness: today's `readinessDeclared:true`, labelled **open C-F01-1 (ii), SB-1 question not asked**.
- Hardening the freeze verifier is QRE's call.

**FREEZE-2.** From the SSCTR side, the `--write` may proceed once the CANDIDATE correction and these tests are recorded, and the freeze record names C-F01-1 r2 as open.

**Human queue (proposed only, not appended).** HQ-CORE-F01-SSCTR-B is widened to cover C-F01-1 r2 (i)–(iii). It stays conditional on that decision. HQ-CORE-F01-SSCTR-A is unchanged.

**Probes**, in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/a1e30549-2d0a-4d67-ba6e-d90e2d830854/scratchpad/ssctr-f01-r1-7c3a/`, all read-only and run on both trees:

| Probe | What it checks |
|---|---|
| `probe-shape-b.mjs` | Shape (b) through `normalizeObservations` |
| `probe-trained-after.mjs` | `readinessFact` with `restartIntake`: shapes u, a, b |
| `probe-direct-conflict.mjs` | The pre-existing direct conflict |

The screen check was direct: `screenInterruptionReason({})` gives `ASK / MISSING_REASON`.

**Re-review triggers** are as in R1, plus the C-F01-1 r2 decision.
