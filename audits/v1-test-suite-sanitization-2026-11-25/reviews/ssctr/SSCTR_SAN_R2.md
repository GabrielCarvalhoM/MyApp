# SSCTR narrow recheck of the V1 test-suite sanitization, R2 (2026-11-25)

**Disposition: ACCEPT** on revision **`119e761`**. SSCTR-SAN-01 to -06 are all **MET**.
- The H26 refile (category B, new successor) is sporting-consistent with SSCTR_BC_R1 §3.
- The strengthened boundary tests involve no sporting rule.
- No runtime byte changed since R1.
- I raise three non-binding notes (N1–N3). None needs another cycle.

SSCTR_SAN_R1 stands otherwise. All athletes and data are synthetic.

## 0. Reviewer and method

**Reviewer.** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5. This is the same instance as R1, so R2 rechecks my own conditions against changes another author made.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, I made no clinical judgment and I delegated nothing. I did not read QRE_SAN_R1, beyond the dispositions table in INDEPENDENT_REVIEW.md.

**Native availability.** As in R1: I run under the project native adapter's body, with no Agent tool. I cannot see the dispatch mechanism itself.

**Literature.** None needed, because this is a record-fidelity check. WebSearch and WebFetch were not loaded.

**Bytes.** The worktree equals `119e761` for `CoachingCore/` and the audit's `.md` files (empty `git diff`). The R1 file committed at `119e761` is byte-identical to the one I wrote (`893304c2…3b544`).

**Commands** (Node v24.19.0; read-only, except this file):
- **Runtime diff.** `git diff --stat 7254984 119e761 -- CoachingCore/src CoachingCore/v1 CoachingCore/fixtures` is **empty**. The CoachingCore changes since R1 are three `scripts/suite-*.mjs`, the manifest, `v1san-boundary-safety`, and the new `v1san-record` and `v1san-successors`.
- **Tests.**
  - `v1san-successors` 1/1, `v1san-boundary-safety` 13/13 and `v1san-record` 1/1.
  - `v1core-o1-successors` 4/4 and `v1core-sc-successors` 4/4.
  - H26 run by its exact manifest title fails at `v1int-authorship.test.mjs:149`, which is its pinned `failsAt.line`.
- **Queue.** `HUMAN_REVALIDATION_QUEUE.json` still holds 235 entries, and nothing under `reviews/` changed.

## 1. Conditions

| Id | Status | Where verified | Note |
|---|---|---|---|
| **SSCTR-SAN-01** (queue status) | **MET** | Manifest `contract` H06, H07, H08, H16: "HQ-SSCTR-O1-02 and HQ-SSCTR-SC-01 were proposed by SSCTR and are NOT appended". ROOT_CAUSE RC-5 says the same | Matches SSCTR_O1_R1 §7 and SSCTR_SC_R1 §7. The queue is still 235 |
| **SSCTR-SAN-02** (less conservative consequences) | **MET** | (a) H03 `contract` and RC-3: "the BOUND is lower, never higher". Also the C-R2-1 floor lift (RESTART 45 → EASY_CURRENT 80), the non-monotonic class mapping (O-1), and "C-R2-1 discharged in SSCTR_R2_R2". (b) H06, H07, H08, H16 and RC-5: the shorter pause and the strength first exposure 19 → 27 min (O-SC-S1, SSCTR_SC_R1) | Figures and ids match the decisions. See N1 |
| **SSCTR-SAN-03** (H40 attribution) | **MET** | H40 `contract`: 430c493 (cycle 1, SSCTR-CORE-B-01) made the screen REQUIRED for a symptom stop on a session the plan in force does not name; O-1 later kept the dispute CONFLICTED in every order | Matches SSCTR_CORE_R2 §2, SSCTR_C2_R1 §4 and SSCTR_O1_R1 §4 |
| **SSCTR-SAN-04** (E-1 scope; evidence) | **MET** | H32 and H50 `safetyPoint`, RESOLUTION_MATRIX H32/H50, and the ROOT_CAUSE §C E-1 row now read: closed at the Core and the integration boundary on synthetic inputs, open for real athletes under C-C5. H50's successor title also says "real HealthKit stays open (C-C5)". `evidence/red-e1-mutation.txt`, `negative-checks*.txt` and REGRESSION_REPORT.md are committed (`02d9716`, `119e761`) | Whether the mutation is adequate stays QRE's call |
| **SSCTR-SAN-05** (lineage sporting effects; scenario-21 tests) | **MET** | H15, H21, H22, H41, H42 `contract` now state: row 19 COMPLETED → PARTIAL, LONG w+2 QUALITY 34 → EASY 65, EASY w+3 70 → 65; NCC's interim scenario-21 credit reversed by O-1 to CONFLICTED, run-history 1 → 0; the E-1 matrix effects (C-C1); and the ledger `sporting` fields. All five have the "SSCTR-NCC-01 (scenario 21)" and "(S21b)" tests in `alsoCoveredBy`, and RESOLUTION_MATRIX shows them. RC-5 carries the summary | Attributing row 19 to decision C is correct (O-1 ledger). The runner now enforces `alsoCoveredBy`, per INDEPENDENT_REVIEW |
| **SSCTR-SAN-06** (H04 wording) | **MET** | H04 `contract`: "a recognized occurrence whose minutes never count; because a voice in force says the athlete trained after the declaration (claimsDone) … SB-1 asked. No dose credit is involved" | See N2 |

## 2. The H26 refile (tm-5)

**The sporting meaning is unchanged and on record.**
- The superseded assertion pinned QRE-INT-02 "as it stands": a receipt fact was kept for a workout that the decision did not record.
- The current contract was closed in SSCTR_BC_R1 §3, ACCEPTED on SSCTR's R2 constraint. A workout the engine asked about is not recorded, and its receipt is no report in force. Once re-delivered after the screen is answered, it is admitted once and carried. Credit, program, calibration and forecast equal the control (b5). A stop on an ASKed form still leaves its stop fact and the screen.

**The successor (`v1san-successors.test.mjs`)** is tm-5's body (`v1int-authorship.test.mjs:141–151`). Its only changes:
- the QRE-INT-02 assertion is inverted to "no RUN_REPORT_RECEIVED fact for that session";
- `t.doc()&&` is dropped from the eligibility comparison, which is equivalent while the document exists.

This workout states no stop, so zero report facts is the closed reading SSCTR_BC_R1 §3 describes. The kept assertions are unchanged: ASK with `eligibility.currentAssessment` missing, nothing recorded, NOT_RECORDED_BY_THIS_DECISION, and the device stating no screen. They keep a stale screen from letting a workout through as training.

**Category B is right:** the pinned value was an open, routed defect. The H26 `contract` text is accurate. Re-filing it changes no sporting reading.

## 3. Boundary tests (QRE-SAN-06): nothing sporting

The diff of `v1san-boundary-safety.test.mjs` since R1 touches two tests.
- **Another-athlete test.** A second, enrolled athlete is added in the same custody. That athlete's correction of this athlete's report is refused, and neither record holds the other's rows.
- **Custody test.** It adds:
  - a retried request, which answers the same decision and writes nothing;
  - the same id with another body, which gets `CONFLICT_IDEMPOTENCY_KEY`;
  - an assertion that the raw document exists, replacing an `if`.

These are isolation, idempotency and custody properties. A retried submission giving the same decision is consistent with the duplicate rule already accepted (effort counted once). **No prescription, dose, pause, screen or clinical rule is involved.**

## 4. Notes (non-binding)

- **N1.** H03's `safetyPoint` still reads "restart exposure (dose) — the current reading is the conservative one", in the manifest and in RESOLUTION_MATRIX. It is true of the bound in H03's own shapes, and the `contract` now carries the qualification. Prefixing it with "the bound:" would remove any ambiguity. Optional.
- **N2.** The `supersededBy` label of H03 and H04 still quotes the change's title, "a disputed amount is an execution". I accept it as a quotation: DECISION §1 defines that term as "execution of disputed amount (recognized occurrence)", and H04's `contract` now states the meaning.
- **N3 (not sporting; for the author and QRE).** ROOT_CAUSE_CLASSIFICATION.md still says "51 = 29 A + 22 B" (A 31/29, B 22) and lists RC-6 (H26, H27) as A. The manifest at `119e761` files H26 as B: 30 A and 23 B overall, 28 A and 23 B of the 51. RESOLUTION_MATRIX agrees with the manifest. The counts and RC-6 should be brought in line.

## 5. Clinical scope

Unchanged from R1 §4. Two points remain flagged **CLINICAL_HUMAN_REQUIRED** and undecided:
- whether the existing warning-sign screen is sufficient after a symptom stop;
- the clinical part of O-SC-S2.

Nothing in this cycle touches them.

## 6. Record fields

- **Evidence status:** none, because no empirical claim is made. **Confidence:** HIGH in the fidelity findings, each read or run at `119e761`.
- **Gate:** NOT_CLOSED_BY_THIS_RECORD. **Publication:** NOT_PUBLISHED.
- **Validation:** human validation false, clinical clearance false. **Human queue:** no new item proposed.
- **Re-review triggers:** as R1, plus any change to `v1san-successors.test.mjs` or to the H26 entry. **Expiry:** at this mission's closing record, or at the first trigger.
- **Supersedes:** nothing. SSCTR_SAN_R1's conditions are discharged here.
