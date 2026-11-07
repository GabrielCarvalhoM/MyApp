# SSCTR-R7D-P35-RECHECK-r2: narrow domain recheck of `33d3181`

**Disposition: ACCEPT_WITH_CONDITIONS.** No blocking finding. It does not block R7D-FREEZE-5 of `33d3181`.

**Reviewer:** a fresh SSCTR instance (PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY; no human credentials; no clinical, human or empirical validation). It did not write any Phase 3.4 or 3.5 artifact and is not the r1 instance. Native dispatch was not verified, and it opened nothing under `phase35/reviews/engineering/`.

The reference record is `SSCTR_PHASE35_RECHECK2_R7D.json`. Probes are under `probes2/`, outputs under `probes2/out/`.

## What was run

- **Rebuilds:** new scratch rebuilds (`git archive`) of `33d3181`, `8e78b8a`, `46934a0` and R7D-FREEZE-4 (`3edf3c5`). Each holds CoachingCore, the five SSCTR records and the audit folder. The runtime hashes were confirmed.
- **Directed tests on the candidate:** 13/13, 40/40, 14/14, 17/17 and 14/14.
- **RED check:** on `8e78b8a` with the candidate's Phase 3.5 test file, only T36 fails.
- **r1's own probe (`probes/p35-recheck.mjs`):** reproduces r1's `8e78b8a` output apart from labels. On `33d3181` the runtime results are unchanged. With R7D-HARNESS-7 r2, only SYc1's P18(e) reading flips from true to false.
- **The six Phase 3.4 SSCTR probes:** on `33d3181`, byte-identical to r1's `8e78b8a` outputs under the same label.

## Answers

### 1. QRE-P35-01, domain side: yes

The case: D is reported again with its dates and no name, after a return that read the holiday as its own return.

| Runtime | What the unnamed re-send gives |
|---|---|
| `8e78b8a` and `46934a0` | The holiday is dropped; strength resumes back-squat 2x8@85 |
| R7D-FREEZE-4 | ASK |
| `33d3181` | Equal to the named re-send, on every variant: the holiday stays OWN_RETURN, back-squat 1x7 ESTABLISH |

The variants probed were: plain; days and end only; a week later; another nonclinical reason text. On the candidate, the results differ from the named re-send only in the basis label.

- **QH18:** R07, then the trip confirmed by its dates. It equals the named confirmation and the start time stated from the outset (back-squat 1x9 ESTABLISH). No later review asks.
- **Why this is the right reading:**
  - The R7-A duplicate rule already makes such a report a newer report of the latest break.
  - A newer report reads what its break's return read (CF-P34-02).
  - The rule requires exact days (I9), and clinical first is untouched.
- **Controls:**
  - The TRAINING_AFTER row is kept.
  - A single-break duplicate stays `SAME_BREAK` / `DUPLICATE` with no separate breaks, identical on all four runtimes.
  - A continuity return re-sent with the trip's days asks, on all four.
  - A continuity return re-sent with the whole stop's days is now re-read, with every dose equal to `8e78b8a`.
- **Accepted behaviour:** only unnamed same-dates (DUPLICATE) shapes differ from `8e78b8a`, as the author's differential says.

### 2. SSCTR-P35-F01: closed exactly as its smallestFix states

- **The predicate:** P18(e) now equals the runtime's classify/kindOf on all 288 recovery-ADVERSE combinations, with 0 mismatches. The r1 lib miscounted 12, all with performance OVER.
- **DEV-54 (the SYc1 shape):** clean on the candidate, and false-blocked under HARNESS-7 r1.
- **Sensitivity kept:** DEV-48 is detected on `46934a0`, and W-P18j fires.
- **Wording:** Δ35 restates Δ27's necessary-condition wording.
- **Nothing weakened:** P18(a)/(c)/(d)/(f), P02, P03, P06(b) and P08 are not weakened. P17 is stricter. P18 leaves out only a restatement of a listed break: DEV-55 false-blocked under r1 and is clean under r2.

### 3. T37: yes

A report of the listed break whose reason text turns clinical is routed `CLINICAL_HUMAN_REQUIRED`:
- by declaration, by weekly review and by return report;
- inside and after the re-entry week;
- and it stays clinical, with no return applied.

The result is identical on all four runtimes.

### 4. CFP35-02: faithful in substance

Δ36 omits two points and compresses a third (finding **SSCTR-P35R2-F01**, low, non-blocking):
- O01: the final holdout's domain judge reads the two-break shape as the disclosed residual;
- O02: the strength gate for an adverse recovery above target is an R6 gate question, not reviewed;
- O03: why the "as one period" wording matters.

The smallest fix is to carry these points through CFP35R2-02 into the freeze record and the next PREREG addendum. The freeze record copies this record's conditions and findings, so no other byte is needed.

### 5. New numbers: none

## Conditions for the freeze

| Condition | Supersedes | What it requires |
|---|---|---|
| CFP35R2-01 | CFP35-01 | Freeze exactly the runtime, test and harness-property bytes checked here |
| CFP35R2-02 | CFP35-02 | Carry the disclosures, including SSCTR-P35R2-F01 |
| CFP35R2-03 | CFP35-03 | SSCTR-P35-F01 is closed on HARNESS-7 r2; any change to those properties reopens it |
| CFP35R2-04 | CFP35-04, carried unchanged | No new numbers; shadow reference only; queue at 235, no append |

## Observations (non-blocking)

- **O01:** a re-send with no new fact re-plans from its own day. This is pre-existing R7-A behaviour.
- **O02:** a stale JSDoc sentence above `adverseConvergence`.

## Human revalidation and states

- **Proposed human revalidation:** HQ-R7D-SSCTR-P35-RECHECK, r2. It is a proposal only and supersedes r1's.
- **States:** V1_COACHING_AUTHORITY_READY = NO; FINAL_HOLDOUT_EXISTS = NO; F08_OPEN (BLOCKED_BY_AUTHORITY); queue at 235, no append.
