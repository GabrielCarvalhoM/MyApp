# R7-D Phase 4 — request for the two independent judgments of the sealed final holdout

**What is judged:** the single first evaluation of the R7-D final holdout on **R7D-FREEZE-5**, run by **R7D-HARNESS-8** under **R7D-PREREG-7**. It is the final gate of DOMAIN_COACHING_R7-D (R7D-PREREG-1 §4, §8.7). The coordinator gives no grade: the final status is compiled mechanically from your two records under §4.

**The commits, in order:**
- `58d6766`: the instruments, before the author started;
- `14c7ec8`: the sealed corpus and manifests, before any execution;
- `87d0978`: the evaluation outputs and both manifests with `evaluationCount 1`.

## Inputs

All paths are under `audits/domain-coaching-r7-d-2026-11-02/` unless a path says otherwise.

| Item | Path | sha256 |
|---|---|---|
| Freeze record | `CoachingCore/r7/d/RUNTIME_FREEZE_R7D_5.json` | `956da5c23c3499fd85af532e384e9302be15158fbc85a309e3d50c8721456dd8` |
| Pre-registrations | `PREREGISTRATION_R7D.md`, the base (§1 properties, §2 relations, §3 taxonomy, §4 success criteria, §5 rubric, §6 envelopes, §7 corpus errors and critical coverage, §8 protocol, §9 no tuning), then `_2` to `_7`. Each version says everything it does not change still holds; the newest prevails | PREREG-7 `2ccceb18ab5f7fde2b9479b75dc927f0618ed29b3205f2fb8da3bc59cec23ab6` |
| Phase 4 authorization | `phase4/AUTHORIZATION_PHASE4.md` | |
| H1 corpus (authored) | `final/R7D_FINAL_HOLDOUT.json`; manifest `final/FRESHNESS_MANIFEST.json` (seal digest `a0b6d7d8877adb49150a0f538406a3955624b3c6afbb0ae35a38fb08feb00641`); seal `final/SEAL.json`; builder `final/build-final-corpus.mjs` | `2f2a5d270c96117dfa5a8ef3c9b8a8ba2d380c7ec27c0835a7af8a4834b63b18` |
| Author's report | `phase4/AUTHOR_REPORT_PHASE4.md`: the case list and coverage mapping as the author claimed them. Check them; do not trust them. The author's nine interface gaps are also in the manifest (`interfaceGapsNoted`). A step that depends on one is judged with the attribution that fits (§5) | |
| H2 sample (generated) | `final/generated/R7D_GENERATED_FINAL.json`, with its manifest (seal digest `2b396d89d79f68618640e79a1a06b6d6a5044bb7da6b6d1fcc332eff488e3e83`) and seal beside it | `b69fa543c7bac184c7f3cc0af67a2d6b33f6adf4b368e881a16a9cc752edba69` |
| H1 evaluation | `final/evaluation/`: `RUN_REPORT.json`, `DOMAIN_PACKET.md` / `.json`, `SUMMARY.md` | RUN_REPORT `c6278b293b0ff87e9b8ecc15236e3bb5de0720b303b1b2264a3fac6585f77d62` |
| H2 evaluation | `final/generated/evaluation/` (the same four files) | RUN_REPORT `d5bcbd100893b84b8e33af5871f6d9bf9add6d7ee9c209a06185f89ed56192a0` |
| Harness | `harness/r7d-harness-8.mjs` and `harness/lib/properties-8.mjs` are the two new files; every other module is the R7D-HARNESS-7 r2 file the freeze binds | |
| Instrument evidence | `harness/validation/HARNESS_VALIDATION_R7D_8.json` (validation 8), `phase4/evidence/CQ41_MUTATION_PHASE4.json`, `phase4/tests/r7d-phase4-cq41.test.mjs` | |
| Phase 3.5 records | `phase35/reviews/ssctr/SSCTR_PHASE35_RECHECK2_R7D.json`, `phase35/reviews/engineering/QUALITY_CHECK_R7D_PHASE35_R2.json` | |

**What the H1 run reported** (`final/evaluation/SUMMARY.md`; these are automated results, not verdicts):
- automated FAIL units:
  - P03 in F13 and F21;
  - P05 and CARRIER_CLINICAL in F12;
  - P06 in F07.
- CARRIER_HOLD: 0 applicable cases.
- Four structural errors on session references: F22 s1, F32 s3, F33 s3, F34 s4.
- Harness errors: 0.
- No P17 `WINDOW_ENDED_BY_ROW_NAME` observation; in fact no property observation of any kind. The coordinator counted these; confirm the count.

## Rules for both judges

**Independence and writes.**
- You did not write the runtime, the harness, the instruments or the corpus.
- Write only in your own folder (named in your section). Do not edit any other file.
- No deletion of any kind (the Founder's rule): no `rm` and no recursive removal. Rebuild into new, uniquely named scratch directories.

**No tuning (R7D-PREREG-1 §9).**
- Change no runtime, harness, oracle, envelope, rubric, threshold or criterion, and turn no case into a test. The first evaluation is the one that counts.
- You may reproduce a mechanism, such as a minimal witness or a rerun of a case without `--first-evaluation`, but only in a **new** scratch directory outside the repository.
- A rerun never names a file under `final/` as `--out`, `--manifest` or `--seal`. Copy what you need into your scratch directory first.

**How to classify.**
- **`NOT_EVALUABLE` is never `PASS`.** It stays in the denominator and is reported as such.
- **Classify by concrete impact** on what the coach prescribes or asks, not by procedural form.
- **Findings use the taxonomy of R7D-PREREG-1 §3.** Each has a class and an origin (NEW, PRE_EXISTING, KNOWN_R7C_RESIDUAL).
  - A finding inside a registered envelope (PREREG-1 §6, PREREG-2 Δ11) or a disclosed residual (PREREG-3 to -7) is KNOWN_DISCLOSED_RESIDUAL or CONSUMER_CONDITION, not a new finding. Say which disclosure covers it.
  - A behaviour outside them is a new finding.
- **CORPUS_ERROR (§7):**
  - it removes the affected case from the evidence and never counts against the runtime;
  - say what of the case stays evaluable, if anything;
  - critical coverage lost to it makes the holdout INVALID_HOLDOUT.

**Your verdict and evidence.**
- Give one of READY, READY_WITH_CONDITIONS, NOT_READY or INVALID_HOLDOUT, for your side of §4.
- With it, list the blocking findings (if any), the conditions and the residual limitations.
- If your verdict is INVALID_HOLDOUT, still report every confirmed finding on the cases that remain valid, with its class, so that the invalidity hides no confirmed blocker.
- Report the evidence for every claim: case ids, step ids, the decision fields, and the property or relation with its unit.

## Sports Science / Domain judge (SSCTR, a fresh instance)

Write `final/judgment/ssctr/SSCTR_FINAL_HOLDOUT_R7D.json` and a short `.md` beside it.

1. **Rubric per step, then per case** (PREREG-1 §5 with PREREG-2 Δ10).
   - The classes are BEST_SUPPORTED, ACCEPTABLE_ALTERNATIVE, SUBOPTIMAL, INSUFFICIENT_INFORMATION, SCOPE_MISROUTED, CLINICAL_OUT_OF_SCOPE, UNSAFE, CORPUS_ERROR, NOT_EVALUABLE_DOMAIN and EXPECTATION_OUTSIDE_AUTHORITY. A case inherits its worst step.
   - The reference is the author's `independentAssessment`, written before any output, read against the authorities.
   - For every SUBOPTIMAL or worse, give the cause, the attribution (RUNTIME, CORPUS, AMBIGUITY or AUTHORITY_SCOPE) and whether it is structural (§3).
   - Clinical routing is judged; clinical content is CLINICAL_OUT_OF_SCOPE.
2. **The DOMAIN_JUDGED parts of the properties:**
   - P07, a completion race without strides;
   - P08, strength and the identity of the break;
   - P09, step size;
   - P12, interference;
   - P14, influence with consent;
   - the P06 and P08 units the H1 run left not evaluable (`SUMMARY.md`); the result of each is yours;
   - every P18 unit `NOT_EVALUABLE` with reason `NESTED_OWN_RETURN_RECORD`: recompute the inner own return from the case timeline (PREREG-6 Δ16, Δ30). The unit's result is yours.
3. **The Founder's domain questions**, each answered with the cases that show it:
   - the coherence of the running progression;
   - the coherence of the strength progression;
   - interference between the two;
   - the response to fatigue and recovery;
   - preservation of demonstrated capacity;
   - the safety of the return after breaks;
   - no progression without evidence;
   - compatibility with the existing sports authorities: the R6 policy, the B0 catalog, F03B-MACHINE-STEP-r1 and the BR-Q readings.
4. **CFP35R2-03 (PREREG-7 Δ38, Δ42).**
   - R7D-HARNESS-8 changes where P17's window ends: two names that lead to one separate-break row of the latest applied return count as one break. Rule on that reading.
   - The H1 run lists every window it ended that way, as P17 observations `WINDOW_ENDED_BY_ROW_NAME`. Judge each one; the coordinator found none.
   - If you reject the reading, the affected units become HARNESS_GAP and return as not evaluated, never in the runtime's favour.
5. **Readings that bind your judgment:**
   - **The X2 path** (PREREG-6 Δ10, Δ19): the Founder did not reclassify it.
   - **The F08 boundary** (PREREG-7 Δ45): F08 is open, and the Founder's D2 direction is not implemented. These expectations are EXPECTATION_OUTSIDE_AUTHORITY:
     - a planned return after a clinical-cause break;
     - a temporary reduction for a clinical-cause complaint.

     The routing is still judged.
   - **O-P35-01's two-break shape** is the disclosed residual (PREREG-7 Δ40 (a)).
6. **Coverage validity, domain side.**
   - Say whether each required coverage item is met by valid, evaluable cases, after any CORPUS_ERROR. The items are those of PREREG-2 Δ9, -3 Δ6, -4 Δ5, -5 Δ3, -6 Δ5, Δ18, Δ29 and -7 Δ44.
   - Each clause says what a missing item means.
7. **Scientific blockers** (SCIENTIFIC_BLOCKER, UNSAFE) **and the domain verdict.**
   - Your authority is your provisional internal nonclinical authority. Claim no human or empirical validation, and add no new number.
   - Any queue item is proposed only.

## Quality / Reliability judge (a fresh instance)

Write `final/judgment/quality/QUALITY_FINAL_HOLDOUT_R7D.json` and a short `.md` beside it.

1. **Freeze integrity.**
   - The evaluated runtime bytes are R7D-FREEZE-5: in each RUN_REPORT's `runtime` block, the files are equal and `runtimeDiff` is empty.
   - You may run `node CoachingCore/scripts/verify-r7d-5.mjs --suite` read-only. Never pass `--write`.
   - Its `no-final-holdout` check fails by design now that `final/` exists. Nothing else should fail.
2. **Protocol integrity.**
   - The corpus bytes and the manifest seal digests match the seals.
   - `authorStartedAt` is after the freeze and after the instrument commit.
   - The seal commit precedes the evaluation.
   - Each manifest shows `evaluationCount 1` and names its report hash.
   - The outputs were written once, with `--first-evaluation` and new directories.
   - The harness and pre-registration the seal binds are the ones committed in `58d6766`.
3. **Instrument reliability.** Any harness defect you find is HARNESS_GAP (PREREG-1 §3). Confirm:
   - R7D-HARNESS-8 differs from the bound R7D-HARNESS-7 r2 only as PREREG-7 Δ38 and Δ39 state (diff the files);
   - validation 8: no false block, 27/27 sensitivity rows, 56/56 witnesses;
   - the CQ4-1 evidence: QF3, QF6 and QF7 are each killed by their own test.
4. **Properties and relations.**
   - Confirm each automated FAIL in H1, H1-M and H2 as a runtime violation, a HARNESS_GAP or a CORPUS_ERROR, with its mechanism.
   - Rule on each of the four structural errors the harness reported.
   - Cover:
     - data integrity;
     - decision consistency;
     - idempotence: RESEND, DUPLICATE_SECOND_SOURCE, and the re-sends and duplicates in the corpus;
     - record corrections;
     - determinism;
     - questions with no exit: an ASK the athlete cannot leave with any answer the interface allows, as distinct from a question the timeline simply left unanswered;
     - silent state changes (P03, P10);
     - regressions and property violations.
5. **Coverage units.** Each clause names its consequence. A unit lost to CORPUS_ERROR or HARNESS_GAP does not count. The registered units are:
   - CARRIER_CLINICAL > 0, CARRIER_HOLD > 0 and P08 ≥ 2 (PREREG-2 Δ9);
   - P17 ≥ 4 and RESTATE_DECLARED_BREAK > 0 (PREREG-3 Δ6);
   - P18 ≥ 2 and INSERT_NEWER_BREAK > 0 (PREREG-4 Δ5);
   - P18 ≥ 2 in the cases of PREREG-5 Δ3, and in the first two groups of PREREG-6 Δ5.

   Then check the case-level critical coverage (PREREG-1 §7; PREREG-2 to -7) against the cases, not against the author's mapping. List every unit not evaluable.
6. **The quality verdict**, with the blocking findings, the conditions and the residual limitations.
