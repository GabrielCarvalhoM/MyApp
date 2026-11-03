# R7-D Phase 3.2: narrow SSCTR recheck (`SSCTR-R7D-P32-RECHECK-r1`)

**Disposition: ACCEPT_WITH_CONDITIONS.** 2026-11-03. No BLOCK.

**Who.** A fresh SSCTR instance (AI agent, claude-opus-5-5, xhigh) under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY: nonclinical sporting judgment only. No human review, and no clinical, human or empirical validation.
- It did not write the runtime, the tests, the harness, PREREG-4, the interface delta or the evidence.
- It did not open `phase32/reviews/engineering/`.
- Whether this was a native adapter dispatch was not verified.
- The structured record is [SSCTR_PHASE32_RECHECK_R7D.json](SSCTR_PHASE32_RECHECK_R7D.json). Where the two differ, the JSON prevails.

**What was judged.**
- **Candidate:** the runtime bytes of `dfd8779`, `r6-adaptation.mjs` sha256 `faa3bc12…`.
- **Baseline:** R7D-FREEZE-2 (`9f905030…`), the coordinator's rebuild, used read-only.

**What I ran** (scratch copies only; my rebuild came from the committed bytes):
- **Suite:** 938/938.
- **Directed tests:** 17/17 (Phase 3.2) and 14/14 (Phase 3.1); r7a1-composition passes.
- **My predecessor's probes:** `p4` and `p4b`.
- **My own probes:** five, each run on both runtimes. They are in [probes/](probes/), with outputs in `probes/out/`.

**Literature.** I used WebSearch and Europe PMC abstracts; no full text. Coyle 1984, Neufer 1989, Hickson 1981 and 1985, Mujika & Padilla 2000 and Barbieri 2023 support direction only, with limits. No number is taken from them.

## Answers

| # | Question | Verdict |
|---|---|---|
| 1 | F02 factual preservation | **Preserved, residual F01.** See below. |
| 2 | Separate versus corrected; answer protocol; exact replay | **Protocol right.** See below. |
| 3 | New dose or clinical authority | **None.** See below. |
| 4 | Return conservatism | **Conservative; both flagged readings accepted; residual F01.** See below. |
| 5 | Clinical first | **Intact.** See below. |
| 6 | I9 | **Preserved.** See below. |
| 7 | Unknown training between | **Accepted.** See below. |
| 8 | F08 unchanged | **Acceptable only with a corrected disclosure (F02).** See below. |
| – | The two updated assertions | **Both accepted.** See below. |

**1. F02 factual preservation.**
- A newer break that names none never replaces, joins or outranks a kept one. I tried every carrier; contiguous, overlapping, disjoint and partial dates; both declaration orders; the clinical route between the two reports; and a chain of three breaks.
- In each case the relation is asked, no return dose is chosen, and both facts are recorded.
- Answered "separate", the stop equals the stop declared once:
  - 21 days give MODERATE, at EASY 15 / LONG 20;
  - 31 days give LONG, where R7D-FREEZE-2 gave SHORT 10 days with LONG 65.

**2. Separate versus corrected.**
- The protocol is right, and both answers are dose-safe. A wrong "separate" errs to the longer stop. A name the record does not hold, such as a typo, also gives the longer stop.
- The exact-replay rule has no consequence for dated breaks: identical days give the same stop whether joined or not.
- It is not identity for days-only reports stated on different days (F03).

**3. New dose or clinical authority.**
- The return is the unchanged R6 recipe, classed by the calendar span the facts establish, not by a sum of declared days.
- The diff adds no numeric literal except 0/±1 date offsets and the existing 200-character name bound.
- No policy or catalog byte changed.

**4. Return conservatism.**
- **Touching or overlapping breaks** equal the stop declared once.
- **Rest days only between two breaks** count as no training. A 9-day and a 4-day break around a rest day give MODERATE 14, equal to the 14 days declared once. R7D-FREEZE-2 gave SHORT 4 with LONG 65 and THRESHOLD 41.
- **A conflicted report between** is asked. The answer decides: done gives SHORT 4, not done gives MODERATE 21.
- **Training between:** see F01.

**5. Clinical first.**
- Every path routes to a human with no proposal: an older or newer clinical break, named or not, a clinical break in the middle of three, and a flag, pain substitution or standing clinical route while the relation is unresolved.
- DEV-25 went from VALID on R7D-FREEZE-2 to CLINICAL on the candidate.

**6. I9.**
- Dates never join identity.
- They only form the stop read for breaks the athlete has said are separate, which is the factual continuity the Founder authorized.
- Equal dates with different facts are asked.

**7. Unknown training between.**
- It is always asked, with the session ids. The answer decides, and a partial answer is asked again for the rest.
- The runtime asks even where the class could not change (O-01). That over-asks, but it is conservative.

**8. F08 unchanged.**
- A clinical-cause break stays clinical, also after clearance and four weeks of training.
- An unnamed newer break no longer relabels it.
- A named correction to a nonclinical reason re-enters as on R7D-FREEZE-2. It is the athlete's statement, bounded by the free-text screen and the eligibility gate.
- That exit is not "fail closed", and INTERFACE-4 overstates it. PREREG-4 states it correctly.

**The two updated assertions.**
- **T6:** a newer report covering the second week of a kept break is either a correction or an overlap, so asking is right. Named, it gives SHORT 7. Answered "separate", it would give MODERATE 14, which is conservative.
- **C4/C5:** naming the corrected report is the protocol, and the test still requires commutativity over complete facts.

## Findings

| Id | Class | Finding | Reproduction |
|---|---|---|---|
| F01 | **Domain residual, not blocking.** The rule is new; the outcome is identical to R7D-FREEZE-2. | With any recorded session between two separate breaks, the earlier break has no effect on the decision. The session can be of any sport, completed or with minutes > 0, even one strength session or a 5-minute aborted run. The re-entry is classed by the later break and resumes the doses executed before the earlier one. **Example (14-day holiday, one session, 4-day trip):** SHORT, EASY 34, LONG 65, then THRESHOLD 41. With the holiday applied when it was stated, the same trip re-enters at LONG 20. **Example (30-day break, one run, 4-day trip):** SHORT, with threshold the next week; the 37 days declared once give LONG (restart). The interface's "a session reported done" and "from what was actually done" understate this. P18(a) does not detect it. | `q4-between-breaks.mjs` TB1-TB4; `q4b-long-then-session.mjs` |
| F02 | **Disclosure correction** (F08 salience) | A named correction can turn a kept clinical-cause break nonclinical: the athlete's statement, not a clearance. INTERFACE-4 says a newer nonclinical break "never" does so. | `q5-clinical-f08.mjs` C3, C6; C4 and C5 stay clinical |
| F03 | **Domain residual, low** (equal to R7D-FREEZE-2) | Identical days-only reports sent on different days are joined as one declaration, so two 7-day stops become one SHORT 7-day break. Dated, the same two stops give MODERATE 14. | `q6-i9-replay.mjs` R4 |
| F04 | **Consumer condition** | TRAINING_BETWEEN_BREAKS lists a conflicted session as having no report. A plain new report of it is rejected and the question repeats; only a correction of the conflicting report answers it. Fail-closed. | `q4-between-breaks.mjs` CF |

**Why F01 does not block:**
- It follows the Founder's clause "known training between them lets the existing rules act on that reality".
- It is not worse than R7D-FREEZE-2 on any path.
- Doses stay within the capacity executed before the earlier break (P08).
- Blocking would leave R7D-FREEZE-2 in place, which is worse on every other path.

It is still the F02 mechanism behind a single session. The direction is supported with limits (S1–S4).

**Options for the Founder** (not decided here; no new number): read the later break from the state the earlier break's own return would have set, the existing episode rule; or at least align the runtime with "reported done".

## Conditions for the freeze

| Id | Condition |
|---|---|
| CF-P32-01 | Bind this record by sha256 in R7D-FREEZE-3. It accepts only the runtime bytes of `dfd8779` (`faa3bc12…`, every other source file equal to R7D-FREEZE-2), the directed test file (`ab50199c…`) and the two updated assertions. Any runtime byte change needs a new recheck. |
| CF-P32-02 | Disclose F01 with no envelope. Do not call the F02 family fully closed. Restate "a session reported done" and "from what was actually done". |
| CF-P32-03 | Before the holdout is commissioned, tell the Founder about F01: P18 misses it, a "break, one session, break" case will be judged without envelope, and the reading of "known training between" is the Founder's decision. |
| CF-P32-04 | Write the F08 disclosure as PREREG-4 does: fail-closed while the stated reason is clinical, plus the named-correction exit, which is not a clearance. Qualify the interface sentence if INTERFACE-4 is amended before any holdout. |
| CF-P32-05 | Consumer conditions (G03), added to CF-P31-04:<br>• name corrections, and never generate an `episodeId` automatically;<br>• ask the relation in plain words, with no default answer;<br>• answer a conflicted session with a correction (F04);<br>• prefer dated breaks (F03);<br>• never present the stale plan while a question stands. |
| CF-P32-06 | State that this phase adds no new dose, threshold, increment, tolerance, cadence, recipe or clinical authority. Shadow reference only; V1 authority stays NO. |
| CF-P32-07 | Route:<br>• F01 and F03 to the Founder and the next runtime or interface mission;<br>• F02 with F08 to Founder/PCG, the G04 owners and G03;<br>• F04 to G03. |
| CF-P32-08 | Append the proposed queue item only in a phase with queue authorization, by its owner, naming R7D-FREEZE-3. Never this instance. |

## Funded-human revalidation

**Proposed only:** `HQ-R7D-SSCTR-P32-RECHECK`, QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, owner Chief / Founder.
- Linked to the P31, P3 and F03B items.
- The queue was not touched (233 items).

## Status

- **Gate:** not closed by this record.
- **Publication:** not published; not Product Truth.
- **Clinical:** no clinical judgment was made.
- **`validate_records.py`:** not run, because Python is not installed here.
- **Review by 2027-05-03,** or earlier on any of:
  - a runtime byte change;
  - a decision on F01, F08, G03 or D2;
  - a holdout result touching P18, INSERT_NEWER_BREAK, TRAINING_BETWEEN_BREAKS or P08;
  - a new SR/MA;
  - an adverse event;
  - human revalidation.
