# R7-D Phase 3.1: narrow SSCTR recheck (`SSCTR-R7D-P31-RECHECK-r1`)

**Disposition: ACCEPT_WITH_CONDITIONS.** 2026-11-02. No BLOCK.

**Who.** A fresh SSCTR instance (AI agent, claude-opus-5-5, xhigh) under PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY: nonclinical sporting judgment only, with no human review and no clinical, human or empirical validation.
- It did not write the runtime, the tests, the harness, PREREG-3, the interface delta or the evidence.
- It did not open `phase31/reviews/engineering/`.
- The structured record is [SSCTR_PHASE31_RECHECK_R7D.json](SSCTR_PHASE31_RECHECK_R7D.json); where the two differ, the JSON prevails.

**What was judged.**
- **Candidate:** runtime bytes of `1357638`. The only source change is `CoachingCore/src/r6-adaptation.mjs`, sha256 `9f905030…0d95`.
- **Baseline:** R7D-FREEZE-1 (`4cabd18`), rebuilt outside the repository.

**What I ran** (scratch copies only):
- **Suite:** 921/921 on the candidate.
  - A first rebuild gave 908, because 13 legacy tests need the R3, R4 and R5 SSCTR records that the rebuild note omits (O-05).
- **Directed tests:** 14/14 on the candidate; 13 of the 14 fail on FREEZE-1.
- **Updated assertions:** both pass on the candidate and fail on FREEZE-1.
- **Engineering probe:** `qe-dx02.mjs` on both runtimes.
- **My own probes:** eight scripts in [probes/](probes/).

**Literature.** WebSearch works and Europe PMC returned abstracts; no full text was read. It supports one directional claim, with limits: a stop of about three weeks detrains materially more than one of about a week. No number is taken from it.

## The Founder's question

**Yes, with conditions.** Retaining a declared break across ASK and clinical routing, without prescribing until authority permits, preserves the approved semantics.

**Return and re-entry.**
- Every kept-break application I ran equals the same break stated again at that review: 135 of 135 cells, covering three date forms, lengths of 5 to 35 days, three carriers and delays of 1 to 14 days.
- The recipe is the unchanged R6 nonclinical return. No number is new.

**Clinical first.**
- These all come before retention: a clinical flag, the eligibility question, the post-race check, a standing clinical route and a pain substitution.
- A break whose own reason is clinical routes to a human at every decision.
- Nothing synthesizes clearance.

**The QE-R7D-P3-01 stale plans are gone.** After a clinical flag and a clearance:
- FREEZE-1 validated THRESHOLD work and long runs of 70/75 min against 65 executed;
- the candidate re-enters at EASY 15 / LONG 20.

## The six points

| # | Point | Verdict |
|---|---|---|
| 1 | Re-entry from a kept break | **Preserved.** A break with no end date grows with the held days, which is conservative. Residual F01. |
| 2 | Clinical-cause break after clearance (F08) | **Acceptable.** Staying clinical is the only outcome in authority; the old VALID was an accidental clearance. Residual F03. |
| 3 | Other events while a break is kept | **Safe, with a consumer condition.** Reports are kept and clinical content is never lost. A fatigue reduction is lost unless the event is re-sent; re-sent, it equals the timely order. F04. |
| 4 | A newer declaration replaces an older one | **Fine for corrections and overlaps. A domain defect for disjoint stops (F02)**, not blocking this freeze. |
| 5 | What is not kept | **Acceptable.** A future break is a plan; a template fails closed; dropping the demonstration lowers the entry (15/20 instead of 35/40); an ongoing break is kept and asked until it ends. |
| 6 | The two updated assertions | **Both accepted.** r7a1 now requires commutativity over complete facts. r7c-phase5-cc now routes clinically instead of validating a plan that forgot an illness break. |

## Findings

| Id | Class | Finding | Reproduction |
|---|---|---|---|
| F01 | Residual, low; pre-existing return semantics | Days held after a stated end date are neither break nor asked. A 10-day break held 7 or 14 days by a clinical route resumes SHORT: LONG 65 (= executed), then THRESHOLD. The whole stop would give MODERATE 15/20. FREEZE-1 gave VALID with LONG 70. | `probes/p1b-held-after-end.mjs` |
| F02 | **Domain defect, not blocking**; new rule, same as FREEZE-1 on the direct path | A newer, disjoint stated break discards a kept one. A 14-day holiday (kept) followed by a 7-day trip is classed SHORT: EASY 45/34, LONG 65, then THRESHOLD 41. The 21-day stop would be MODERATE: EASY 15, LONG 20. No automated property detects it, and the PREREG-3 wording about UNREPORTED_TRAINING and D18 overstates their protection. | `probes/p4-newer-replaces.mjs`, `p4b-correction-ends-kept.mjs` |
| F03 | Residual (F08 salience) | After clearance, a clinical-cause break keeps the athlete CLINICAL indefinitely, even while they train normally. The exit "a new declaration" is not always conservative: a later nonclinical trip replaces the injury break and resumes SHORT (LONG 65, then THRESHOLD). The consumer path rewards relabelling a clinical break. | `probes/p2-clinical-cause.mjs` |
| F04 | Consumer condition | An asked event's decision effect is applied only if the event is re-sent after the return. No held signal carries it. | `probes/p3-other-kinds.mjs` |
| F05 | Interface clarity | Early returns (a clinical flag, eligibility to assess) return no record. The kept break survives only if the client keeps its previous record, which the interface does not state. | `probes/p6-record-on-early-returns.mjs` |

**Why F02 does not block:**
- No path is worse than FREEZE-1.
- Doses stay within executed capacity.
- Phase 3.1 was a narrow correction of P3-01, and that correction is complete.

It is still not "safe", and it touches the Founder's D2 ("in every case the fact survives"). Whether it must be fixed before Phase 4 is the Founder's call.

**Observations:**
- **O-01:** a days-only break moves its window to the applying review.
- **O-02:** the return names the report that first stated the break. This is a provenance gain.
- **O-03:** a template interruption in every review masks a kept break. This fails closed.
- **O-04:** a review routed by a clinical flag records its break but not its execution reports. Pre-existing.
- **O-05:** the rebuild note is missing the R3, R4 and R5 SSCTR records.
- **O-06, a domain note for Security:** the clinical screen re-reads the free-text reason at every decision. Dropping it would weaken clinical-first.

## Conditions for the freeze

| Id | Condition |
|---|---|
| CF-P31-01 | Bind this record by sha256 in R7D-FREEZE-2. It accepts only the runtime bytes of `1357638` and the directed test file; any runtime byte change needs a new recheck. |
| CF-P31-02 | Disclose F01–F03 with no envelope. Do not call F02 safe. Restate the F08 "safe, without plan" line and the "UNREPORTED_TRAINING/D18 still apply" line. |
| CF-P31-03 | Before the holdout is commissioned, tell the Founder that F02 is a defect for disjoint stops, that P17 and P08 miss it, and that the Founder decides whether it blocks Phase 4. |
| CF-P31-04 | Consumer conditions (G03):<br>• carry the record as returned, and keep the previous one when a decision returns none (state this in the interface);<br>• re-send an asked event after the return;<br>• never send a template;<br>• no repetition of a kept break is required;<br>• optionally, let the athlete correct a kept break's dates when it is applied. |
| CF-P31-05 | Route:<br>• F08 (no-plan state, replacement exit) to Founder/PCG with G04 owners and G03;<br>• F01 with F07;<br>• F02 and an optional held signal for the break ask to the next runtime mission;<br>• O-04 to the Engineering backlog. |
| CF-P31-06 | State that no new dose, threshold, increment, tolerance or cadence is added. Shadow reference only; V1 authority NO. |
| CF-P31-07 | The authorized owner appends the proposed human-revalidation item, naming R7D-FREEZE-2. The Phase 3 items also appear not to be appended yet (the queue holds 230). |
| CF-P31-08 | List the R3, R4 and R5 SSCTR records in the scratch-rebuild instructions. |

## Funded-human revalidation

**Proposed only:** `HQ-R7D-SSCTR-P31-RECHECK`, QUEUED_FOR_FUNDED_HUMAN_REVALIDATION, owner Chief / Founder.
- It covers the retention semantics, which change prescribed training relative to FREEZE-1 although no number is new.
- It is linked to `HQ-R7D-SSCTR-P3-RECHECK` and `HQ-R7D-SSCTR-F03B`.
- The queue was not touched.

## Status

- **Gate:** not closed by this record.
- **Publication:** not published; not Product Truth.
- **Clinical:** no clinical judgment was made.
- **Python:** not available, so `validate_records.py` was not run.
- **Review by 2027-05-02,** or earlier on any of:
  - a runtime byte change;
  - a policy or catalog change;
  - a holdout result touching P08, P17, RESTATE or CARRIER_CLINICAL;
  - a decision on F07, F08, G03 or D2;
  - a new SR/MA;
  - an adverse event;
  - human revalidation.
