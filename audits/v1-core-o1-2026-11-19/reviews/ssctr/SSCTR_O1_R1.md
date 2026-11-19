# SSCTR review of O-1 Conflict Evidence & Safety Policy, R1 (2026-11-19)

**Verdict.**
- **Policy (POLICY.md r1):** ACCEPT_WITH_CONDITIONS. I adopt P1, P3, P4, P5 and P6. I adopt P2 for dose. For occurrence, I adopt P2 only as an interim reading and replace it in A (§2).
- **Runtime candidate `24ca2ae`** (`r6-provenance.mjs` `14596080…`): ACCEPT_WITH_CONDITIONS. Nothing in it blocks the synthetic successor freeze.
- **SSCTR-NCC-01 / C-NCC-1:** CLOSED by this candidate (§3).

Two conditions need a runtime change before real-athlete use: C-O1-2 (occurrence) and C-O1-3 (adverse response under a dispute). Both are pre-existing in kind. Neither raises load in any shape I probed.

## 0. Reviewer, target, method

**Reviewer.** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), model claude-opus-5-5, launched by the Chief as a fresh instance.
- I wrote none of the policy, the candidate, its tests or its evidence. I did not read the Security or QRE reviews of O-1.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only. No human review took place, I made no clinical judgment, and I delegated nothing.

**Literature.** WebSearch and WebFetch exist as deferred tools; I did not load them.
- Every decision here is about which evidence is admitted: which report counts, when a dispute ends, and which reader may hear a voice. Each one is checked against rules already decided: QRE-R6-14, E-1, C-F01-1 r2 (ii), SB-1, SSCTR-RWS-B-01 and C-Q08-1.
- I make no empirical sporting claim, so I assign no evidence status and set no dose, threshold or progression. For that reason I wrote no structured JSON record and did not run the validator.

**Bytes judged.**
- **Commit:** `24ca2ae`, per the author's notice. The runtime diff from `f40fbe1` touches `src/r6-provenance.mjs` only. `v1-f08.mjs` is `f1065bf1…7d37` and `r6-adaptation.mjs` is `c82c5e11…57ee`, both unchanged.
- **How:** I ran everything on `git archive` extracts in my scratch directory, never on the working tree, because the working tree changed during the review.

| File | SHA-256 |
|---|---|
| `CoachingCore/src/r6-provenance.mjs` @24ca2ae | `14596080b83e13c15358ae87c2696daf1cd922789b742152ae867124f4d3ec01` |
| `CoachingCore/test/v1core-o1-conflict-evidence.test.mjs` @24ca2ae | `fed5267322a99752cd4aceafe66c10c348610e0ae7fa221e4b76830abdf1426b` |
| `POLICY.md` | `2ece13a42f37be03a06a765faa36c3058178499aacb3bf78bcbc3acc2a1ff3e1` |
| `evidence/lineage-candidate.jsonl` | `317b7d9a6c5050cfcf91ec1ee21735c47fd36aa8e4981d448c763079920dfe7d` |
| `evidence/lineage-f40fbe1.jsonl` | `f35cad6f29e853f4566b2eee488946e5663d11acdca11abddc751e03c2a13cc5` |
| `evidence/lineage-dump.mjs` | `851e407c169a24085b82f07436921c6763ef51a9cad1fcd3eea133afd236d90d` |

**Commands** (Node v24.19.0):
- Focal file: 14/14 on 24ca2ae (13/13 on 1d418d1/889d2ae).
- NCC file: 23/26. The three failures are the expected shapes in §4.
- R7-D 3.3 T4 (the conflicted-report test): passes.
- I ran `lineage-dump.mjs DOSE=1` on 24ca2ae. It reproduces `lineage-candidate.jsonl` **byte for byte**, 62 rows.
- I did not run `npm run verify`, `verify-r*` or the full suite.

**Probes.** They are read-only and synthetic, in `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/0612dfde-6eef-4e57-88d9-925d56f738f0/scratchpad/ssctr-o1-r1-7c3a/probes/`. Each ran on `f40fbe1` (worktree `v1-core-ncc`), on 889d2ae and on 24ca2ae. The 889d2ae and 24ca2ae outputs are identical.

| Probe | What it reads |
|---|---|
| `dose6.mjs` | Rows 01/08/18/19/21, w+1..w+6 |
| `rwsb01.mjs` | RWS-B-01 shape: 3 orders × 2 named ids |
| `occ2.mjs` | f08 restart pause by conflict path |
| `adv.mjs`, `adv2.mjs` | Weekly `adverseSessions` under a head-on dispute |
| `e1.mjs` | E-1/L5 hard-gate shape |

**The 1d418d1 → 24ca2ae amendment.** Every finding below was first reached on 1d418d1 bytes, and every one still holds on 24ca2ae with identical probe output.
- The amendment closes a hole that pointed the wrong way. On 1d418d1, an athlete's second self-correction that named an already-replaced report retired the device's disagreeing voice unheard, which would credit a disputed amount.
- It is P4 as written, and I accept it.

## 1. Disposition summary

| Item | Disposition |
|---|---|
| P1 kept voice, P3 integrity refusals never kept, P5 persistence | ADOPTED |
| P2 never dose | ADOPTED for dose readers. Occurrence: interim only, replaced in A (C-O1-2) |
| P4 resolution + speaker rule | ADOPTED, with one agency dependency (C-O1-5) |
| P6 safety signal | ADOPTED for its sporting part (ASK only, never a clinical state). The security half is Security's |
| P7 determinism | ADOPTED for dispute, voices and resolution. The "never dose" sentence is inexact (C-O1-3, C-O1-4) |

## 2. Decisions A, B, C

### A. Facts recognized under a head-on dispute: proposal adopted, with two replacements

| Fact | Decision |
|---|---|
| The execution's identity and that it is disputed | Recognized (adopted) |
| Duration, distance, intensity, completion, interruption | Contested: voices only, read by no dose reader (adopted) |
| **Occurrence** | **Replaced.** When every well-formed kept voice says the session took place (completed, or minutes > 0), occurrence is not in dispute. It is a fact for the pause and the last executed day, exactly as C-F01-1 r2 (ii) already rules for a correction in conflict. It never counts for C-Q08-1 minutes or credit. When any voice says it did not take place, occurrence is disputed and not recognized. The candidate's P2 (no occurrence from a head-on dispute) is accepted only as an interim reading for the synthetic freeze, because it errs long; C-O1-2 |
| **RPE, recovery, next-day function** | **Replaced.** A response field is contested only where two kept voices disagree on it. An adverse response (recovery ADVERSE or next day IMPAIRED) that no kept voice contradicts is heard by the protective readers (weekly adverse count and systemic convergence, the adverse hold, repeated-adverse REGRESS) in every order. It is never credit, never progression and never calibration; C-O1-3 |
| Safety events (symptom stop) | Adopted. SB-1 hears the voice (ASK only, never a clinical state). The warning-sign screen reads the run-format record (C-NCC-3, unchanged) |

### B. Effect on the coach: adopted for every dose reader, with two corrections

**Adopted for every dose reader:**
- session count and recent volume;
- calibration, Race Forecast and Pace Insights;
- Strength Intelligence (`loggedLoads` excludes CONFLICTED rows);
- restart credit;
- future prescription: the HOLD gate repeats the dose and never raises it.

**Probe evidence (`dose6.mjs`) that the cost of a dispute that never resolves is bounded:**
- **EASY family:** one EASY session at 65 instead of 70 in w+3, then identical to the control through w+6.
- **LONG family:** a one-week lag of the QUALITY ladder. Week by week, cumulative QUALITY minutes stay at or below the control's, and no week exceeds the control's peak (48).
- This is the same lineage as rows 08/10, which FREEZE-5 accepted. No dispute blocks progression indefinitely.

**Corrections:**
1. **Pause and return:** see A (C-O1-2). With the same voices, the pause reads 2 weeks for a head-on dispute and 0 weeks once a non-resolving correction arrives (`occ2.mjs`). The arrival of a later report changes the pause while the dispute stays.
2. **Recovery:** "no adverse-recovery reading" is not what the runtime does. `weekEvidence` (`r6-adaptation.mjs` ~l.231–236, called at l.611 on `bound`, conflicted rows included) takes `kind` from the flagged row's own response. So:
   - Head-on dispute, athlete's completed report ADVERSE: athlete first gives `adverseSessions` 1, device first gives 0.
   - After the device re-sync it is 0 in both orders. On FREEZE-5 the athlete-first re-sync path kept 1.
   - `recent()` reads `usable`, so repeated-adverse REGRESS never hears a conflicted row in any order.
   - The effect is limited to systemic convergence (protective) and is pre-existing in kind. It is still order-dependent, contrary to P7; C-O1-3 and C-O1-4.

### C. When a dispute counts as resolved: proposal adopted (P4)

**Resolved** only by a valid correction that agrees, under the existing `physicalAgrees`/`responseConflicts` rules, with every voice of every other speaker on the row. Concretely:
- the refused speaker correcting their own report to agree;
- the kept speaker's re-sync agreeing with the refused voice;
- a speaker's own correction settling that speaker's self-contradiction (the R7-D T4 shape).

The last case is not last-arrival-wins: it is an explicit correction, and a speaker may retract only their own statements.

**Never resolved by:**
- a later plain report, a replay or a re-sync of the same bytes;
- a refused correction;
- an average, or a pick of the larger or the smaller amount;
- source quality: a device is not preferred over the athlete, nor the athlete over a device.

**Unknown speaker:** its voice must be agreed with or corrected by name (E-1). Accepted.

**Dependency:** there is no explicit athlete act that sets aside a device voice the athlete believes wrong, for example a recording that stopped early. Until there is, such a dispute stays CONFLICTED and errs low. C-O1-5, owned by Product/UX with Security.

## 3. SSCTR-NCC-01 / C-NCC-1: CLOSED

The closing criterion is met.
- The refused voice is kept as a part of the flagged row.
- Scenario 21 and S21b agree: `occ2.mjs`, and the focal tests at ll.40 and 49. After the re-sync, both read X2 CONFLICTED with voices [A, X2].
- Both stay CONFLICTED until a speaker gives way. They resolve only by agreement (focal test l.~62), and the warning-sign screen stays REQUIRED until it is answered after the stop.
- It holds in one review or three and in any batch order (focal l.~56), and on 24ca2ae also across a second same-speaker correction (the new last test).

## 4. Dose dispositions

| Shape | Authorized rule | Previous dose (FREEZE-5) | New dose (24ca2ae) | Justification |
|---|---|---|---|---|
| Row 21, scenario 21 (device whole; athlete symptom stop refused; device re-sync), EASY + LONG | P1 + P4 (C) | COMPLETED; run-history 1 (whole device amount). EASY w+3 `EASY:70,QUALITY:48,EASY:70,LONG:100`; LONG w+2 `EASY:70,QUALITY:34,EASY:65,LONG:100` | CONFLICTED; run-history 0. EASY w+3 `…EASY:65…`; LONG w+2 `EASY:70,EASY:65,EASY:65,LONG:100`. Next long run unchanged (100 min; LONG 16 km); easy band and screen (REQUIRED) unchanged | The athlete said they stopped early for a symptom and no voice gave way. A disputed amount must not earn completion credit or a progression step. This is the closing criterion of C-NCC-1. **Authorized** |
| Row 18 (import first; app other minutes refused; re-sync), EASY + LONG | P1 + P4 | As row 21; LONG sizing source 365 s/km | As row 21; LONG sizing source 360 s/km (the control's), minutes and km unchanged | Same reasoning. The sizing source reverts to what undisputed evidence gives; withdrawn evidence informs sizing in neither direction (O-O1-1). **Authorized** |
| Row 19 (app first; import refused; app corrects itself to the whole), EASY + LONG | P1 + E-1 agreement on correction | COMPLETED, REPORT_NOT_CARRIED, run-history 1. EASY w+3 70; LONG w+2 QUALITY 34 | Reads exactly as rows 08/10: DISTANCE_DISPUTED, partial at the device's first file, run-history 1. EASY w+3 65; LONG w+2 QUALITY → EASY 65 | After the correction, the record holds the same statements as row 08. The same statements must give the same reading whatever the order of arrival (P7). FREEZE-5 lost the device's measurement. **Authorized** |
| SSCTR-RWS-B-01 shape (`successor-fix-forward:92`): device 30 min / 5 km completed; athlete symptom stop 30 min; athlete corrects to 100 min completed | P4 speaker rule (C) | Order- and name-dependent: in 3 of 6 order × named-id cases, COMPLETED 100 min with a **100-min run-history fact**; CONFLICTED in the other 3 (`rwsb01.mjs`) | CONFLICTED in all 6; no run-history fact. Screen REQUIRED after the correction and cleared only by the answer after the stop, in all 6 | **Right.** The only measurement says 30 min / 5 km. FREEZE-5 credited a 100-min long run by dropping, or by letting the athlete overwrite, the device's measurement. The symptom is still not unsaid. **Authorized.** The successor must assert CONFLICTED for every order and named id |
| R7-D 3.3 T4 (athlete said done and not done; the athlete corrects) | P4 speaker rule | REESTABLISH: SHORT / TRAINING_AFTER (done) or OWN_RETURN (not done) | Identical (passes) | A speaker's explicit correction is their word on their own voices. **Authorized; no dose change** |
| NCC F1 l.~101, F3 l.162 | P1 / P4 | A re-sent refused report was refused again; a later plain report was refused | A replay (EXACT_REPLAY), or kept as a voice and never merged; the row stays CONFLICTED | No reader changes. A later report never resolves a dispute. **Authorized; no dose change** |

The E-1/L5 hard-gate test (`v1rws-lineage:593`) fails identically on `f40fbe1` and on the candidate (`e1.mjs`). O-1 does not move it.

## 5. Conditions and findings

| Id | What | Binding | Runtime change | Owner |
|---|---|---|---|---|
| C-O1-1 | Successors and record. (a) Successors for lineage :205 (row 19), `successor-fix-forward:92` (RWS-B-01: CONFLICTED for every order and named id, the screen as now), NCC F1 l.~101 and F3 l.162. (b) The closing record states the six row moves, the RWS-B-01 move (FREEZE-5 credited a 100-min run-history fact in 3 of 6 cases), the LONG row-18 sizing source 365 → 360 with minutes and km unchanged, and the 1d418d1 → 24ca2ae amendment | **Successor freeze** | No | Author with Chief |
| C-O1-2 | Occurrence (decision A). Make f08 `occurred` recognize a head-on dispute whose every well-formed kept voice says the session took place, as C-F01-1 r2 (ii) already does for a correction in conflict. Correct the stale f08 comment ("a direct conflict keeps one voice only"). Closes when the same voices give the same pause whichever conflict path flagged the row (`occ2.mjs`: 2 vs 0 weeks), and a done vs not-done dispute is still no occurrence | **Before real-athlete restart use** (with C-F01-2). Not the synthetic freeze: the interim errs long | Yes, `v1-f08.mjs` | Core with QRE and Security (shared with SB-1 / C-F01-1); then SSCTR |
| C-O1-3 | Adverse response under a dispute (decision A). An adverse response that no kept voice contradicts is heard by the protective readers (weekly adverse count and systemic convergence, adverse hold, repeated-adverse REGRESS) in every order and after any non-resolving correction. Never credit or progression. Closes when `adv2.mjs` gives the same count in all four rows | **Before real-athlete weekly-review gating** | Yes, readers in `r6-adaptation.mjs` (QRE-R6-14 reading) | Core with QRE; then SSCTR |
| C-O1-4 | Record. Correct POLICY §3 B ("Recovery: no adverse-recovery reading") and P7 ("that amount is never dose"): the flagged row's displayed response feeds `weekEvidence.kind`. Link C-O1-2 and C-O1-3 | Closing record | No | Author with Chief |
| C-O1-5 | Agency. Define an explicit athlete act that resolves a dispute against a device voice (for example, "the recording is incomplete"), with custody. Until then, such a dispute stays CONFLICTED and errs low, costing one progression step (bounded, `dose6.mjs`) | **Before real-athlete use** | Yes, later | Product/UX with Security and Core; then SSCTR |
| O-O1-1 | When disputed evidence is withdrawn, the long-run sizing source can move either way (row 18 LONG 365 → 360). Suggested test: a withdrawn disputed fact never yields a long run above what the undisputed record gives | Observation | — | QRE |
| Carried | O-NCC-S1 (a zero-minute symptom stop does not re-open SB-1), C-NCC-3, C-SR2-5, SEC-CORE-03, C-F01-2, OOS-1, O-R2-1 | Unchanged | — | As recorded |
| Discharged | C-NCC-1 / SSCTR-NCC-01 | — | — | Closed by this review |

## 6. Disagreements

**P4, the speaker rule: no disagreement on substance.**
- Who counts as a speaker depends on the declared `activityId`/`sourceQuality`. Whether those are authentic is a custody question for Security (SEC-CORE-03, C-F01-2), not a sporting one.
- A device that re-syncs under a new activity id becomes a new speaker, so its old voice must still agree. That errs low, and I accept it.

**P2, occurrence: I disagree on the policy and accept it as interim.**
- The policy's reason ("errs long") is conservative. But it is no longer principled: a head-on dispute now holds every voice, exactly like the correction-in-conflict shape where C-F01-1 r2 (ii) recognizes occurrence.
- In practice the pause flips when a non-resolving correction arrives.
- Conservative does not mean reading less than the record shows (SSCTR-04); C-O1-2.

**For the Chief.** C-O1-2 touches f08 logic that is shared with Security's SB-1 / C-F01-1 rules. If Security's O-1 decision relies on P2's occurrence answer, the two decisions need reconciling before C-O1-2 is implemented. I have not read Security's review.

## 7. Proposed human-queue items (proposed only; not written)

| Proposed id | Decision | Status if adopted |
|---|---|---|
| HQ-SSCTR-O1-01 | Conflict-evidence admission: kept voices never count as dose; resolution only by agreement of every speaker, with the speaker rule (decisions B and C; rows 18/19/21 and the RWS-B-01 shape) | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |
| HQ-SSCTR-O1-02 | Occurrence of a disputed session whose every voice says it took place, for the pause (C-O1-2), when implemented | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |
| HQ-SSCTR-O1-03 | Protective reading of an uncontested adverse response on a disputed session (C-O1-3), when implemented | QUEUED_FOR_FUNDED_HUMAN_REVALIDATION |

**Re-review triggers:**
- any change to `speakerOf`, `keepVoice`, `physicalAgrees`/`responseConflicts`, f08 `occurred` or `claimsDone`, or `weekEvidence`;
- real-athlete data on how often disputes occur and how often they never resolve;
- the C-O1-5 design.

**Expiry:** at the successor freeze closing, or at the first of these triggers.
