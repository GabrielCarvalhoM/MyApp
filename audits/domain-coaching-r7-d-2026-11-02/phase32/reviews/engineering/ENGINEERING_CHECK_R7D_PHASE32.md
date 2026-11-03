# R7-D Phase 3.2 — engineering check (R7D-ENGINEERING-PHASE32-CHECK-1)

**Candidate:** the runtime bytes of `dfd8779` (`r6-adaptation.mjs` sha256 `faa3bc12…`); evidence at `36e9f02`.
**Judge:** an independent Quality & Reliability Engineer. I wrote none of the runtime, tests, harness, PREREG-4 or evidence, and did not open the SSCTR folder.
**The JSON record prevails:** `ENGINEERING_CHECK_R7D_PHASE32.json`.

## Verdict: READY_WITH_CONDITIONS

SSCTR-P31-F02 is closed on the paths the rule names:
- W1, W2 and W4 are RED on R7D-FREEZE-2 and clean on the candidate.
- Every review kind asks the relation.
- Clinical first holds.
- Nothing is applied twice.
- The single-break path is unchanged.
- The differential is contained.

There is no blocker. One MAJOR conflict between an instrument and the runtime must be resolved on the instrument side before the freeze runs (C1).

## Findings

| Id | Class | New and runtime-only | Finding |
|---|---|---|---|
| QE-R7D-P32-01 | **MAJOR** | no (new rule meets an unchanged instrument) | A kept correction of an applied break, while a newer break is kept, is **not read**: the next plain review applies the kept break, VALID, and lists the correction in `notApplied`. The same correction **stated again** by that review is asked. The pre-registered P17 relation `RESTATE_DECLARED_BREAK` (BLOCKER, no envelope, unchanged by PREREG-4 Δ2) therefore **fails on the candidate**. The failing flow is the one INTERFACE-4 §1 documents (the SSCTR p4b path), so a holdout containing it would fail P17. Validation 4 has no case for it. After the return, the correction is never asked again unless it is re-sent. The effect on the dose is nil in the probe, and the restated variant fails closed. |
| QE-R7D-P32-02 | MINOR | yes | When two declarations have the same clock, the decision depends on their order in the carried record: one order returns, the other asks INTERRUPTION_RELATION. The same input still gives the same output. The evaluation client cannot reach this. |
| QE-R7D-P32-03 | MINOR | yes | Dateless reports with equal facts, declared two weeks apart, are joined as one declaration and nothing is asked. Under QE-R7D-P31-12 the dose is the same, and the outcome equals R7D-FREEZE-2's. Neither P18 nor INSERT can see it. |
| QE-R7D-P32-04 | MINOR | no (mechanism QE-R7D-P31-10) | A report id re-sent with other facts is read over the kept row but never recorded. This has three effects:<br>• it bypasses the no-last-write-wins rule (21 days MODERATE becomes 7 days SHORT);<br>• its `separateBreaks` entry disagrees with the record row;<br>• a relation answer sent under the kept id is lost if that decision asks something else.<br>The evaluation client cannot reach this. |
| QE-R7D-P32-05 | MINOR | yes | After a separate-breaks return, the earlier break's own identity is not addressable. A correction naming it is asked. Naming the return's episode instead replaces the whole stop: 21 days become 12, and the later break's days are dropped. |
| QE-R7D-P32-06 | TEST_GAP | no | 9 of my 18 mutants survive the whole suite. The priority ones:<br>• QM32-10: an earlier separate break with a missing or unclear reason is read into the stop without asking;<br>• QM32-13: an earlier separate break with invalid facts is read without asking;<br>• QM32-06: a conflicted report between two breaks is read as no training.<br>The runtime is correct on these paths; no test pins it. |
| QE-R7D-P32-07 | OBSERVATION | no | P18 and INSERT_NEWER_BREAK showed no false block on four extra constructed cases: training after a break, `notApplied`, dateless equal facts, and equal clocks. |
| QE-R7D-P32-08 | OBSERVATION | no | The P17 and RESTATE windows still say a later stated break "replaces" the earlier one. That is no longer true. It causes no false block. |
| QE-R7D-P32-09 | OBSERVATION | no | The freeze and the verifier need repository-relative paths, and they bind only the top-level files of each review folder. |

## Items

| Item | Result |
|---|---|
| Append-only provenance | PASS, with QE-R7D-P32-04 |
| Multiple unresolved facts (grouping, identity, `applied`) | PASS, with QE-R7D-P32-02 and -03 |
| Correction and replay semantics | PASS, with QE-R7D-P32-01 and -05 |
| Relation ASK propagation | PASS:<br>• 18 of the 19 kinds ask INTERRUPTION_RELATION, and RECOVERED gets the pending-question guard;<br>• none is VALID or returns;<br>• clinical first holds;<br>• `heldByRunGap` passes the ASK through unchanged |
| No last-write-wins | PASS for dated reports under a new id; the residual paths are QE-R7D-P32-03 and -04 |
| No double application | PASS |
| Determinism | PASS (identical bytes); record-order invariance fails only for ties (QE-R7D-P32-02) |
| Differential containment | PASS: 145 cases, 141 identical, 4 explained, 0 unexplained |
| Test, property and mutation adequacy | PASS with conditions:<br>• author mutants 8/8 killed;<br>• validation 4 identical;<br>• P18 and INSERT show no false block;<br>• RESTATE: QE-R7D-P32-01;<br>• TEST_GAP: QE-R7D-P32-06 |
| No regression of Phase 3.1 | PASS on the single-break path and the development cases; RESTATE fails only on the new `notApplied` path |
| The two updated assertions | ACCEPT:<br>• each, as it stood before, fails on the candidate;<br>• T6 as updated fails on R7D-FREEZE-2;<br>• C4/C5 as updated passes on both and keeps its intent |
| Freeze readiness | READY WITH CONDITIONS: every refusal pre-check passes read-only, and the script was not run |

## Conditions for the freeze

- **C1 (QE-R7D-P32-01):** before `freeze-r7d-3.mjs` runs and before any holdout exists, reconcile `RESTATE_DECLARED_BREAK` with the `notApplied` rule. No runtime byte changes. For example:
  - do not restate a stated correction of an applied break while another stated break is open;
  - record this as an addendum to PREREG-4;
  - add a development case of the QE-FB-2 form: no false block on the candidate, RESTATE still detects QE-R7D-P3-01 on R7D-FREEZE-1, and every witness fires;
  - state that a correction listed in `notApplied` is not asked again unless re-sent.

  If an instrument-only change is not possible in this phase, the freeze waits for a Chief/Founder disposition.
- **C2:** the freeze record lists QE-R7D-P32-02 to -05 as residuals, with these consumer conditions:
  - never re-send a report id with other facts;
  - answer INTERRUPTION_RELATION under a new id;
  - state a break's dates;
  - correct one break of a separate return by restating the whole stop under the return's episode.
- **C3:** TEST_GAP QE-R7D-P32-06. Owner: Engineering. Trigger: the next authorized runtime phase. Priority: QM32-10, -13 and -06.
- **C4:** run the freeze after C1 with:
  - repository-relative paths;
  - `--reviewed dfd8779`;
  - both review folders committed.

  Then `verify-r7d-3.mjs` (read-only) must PASS.

## Reproduced (scratch copies only)

- **Suite and directed tests:** suite 938/938; directed 17/17 and 14/14; conformance R7-B, B.1 and B.2 PASS.
- **Directed tests on R7D-FREEZE-2:** 11 Phase 3.2 tests fail, plus the updated T6.
- **Old assertions on the candidate:** both fail.
- **F02 witness:** identical to the committed outputs on both runtimes.
- **Author mutation:** 8/8.
- **Differential:** identical to the committed evidence.
- **Harness validation 4:** identical; 42/42 witnesses.

Judge probes and outputs are in `probes/`:
- `qe-p32-probes.mjs`
- `qe-p32-p18-false-block.mjs`
- `qe-p32-restate-fb2.mjs`
- `qe-p32-correction-across.mjs`
- `qe-p32-mutants.mjs`
- `out-*.json`

Not run: the freeze script, `npm run verify`, and anything with `--write`.
