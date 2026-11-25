# INDEPENDENT_REVIEW — V1 test-suite sanitization

The worker is not the judge. Two independent reviewers judged the exact revision `7254984`. Their texts are kept as received in `reviews/`, and the author did not edit them. One correction cycle followed. Each reviewer then re-checked the cycle (round 2, below).

| Round | Reviewer | Revision | Verdict | File |
|---|---|---|---|---|
| R1 | QRE / Security (independent general-purpose instance, adversarial brief) | `7254984` | **READY_WITH_CONDITIONS**. 0 BLOCKER, 0 HIGH, 4 MEDIUM, 4 LOW, 1 NOTE. It verified 22 entries itself and agreed with all 22. | [reviews/qre/QRE_SAN_R1.md](reviews/qre/QRE_SAN_R1.md) |
| R1 | SSCTR, the project's sports-science reviewer (native adapter) | `7254984` | **ACCEPT_WITH_CONDITIONS**. 6 conditions, all on the record; 15 sporting entries AGREE. | [reviews/ssctr/SSCTR_SAN_R1.md](reviews/ssctr/SSCTR_SAN_R1.md) |
| R2 | both, on the cycle | see below | see below | `reviews/*/…_R2.md` |

## Disposition of the R1 findings

| Finding | Severity | Disposition | Where |
|---|---|---|---|
| **QRE-SAN-01**: a failing subtest named as a historical title could hide between phase 1 (filtered) and phase 2 (never discovered) | MEDIUM | **Fixed by redesign.** One run with nothing filtered, accounted from junit and checked against node's own failure count. Reproduced as N6: an ACTIVE FAILURE, and node counts 56 failures against 55 accounted. | `scripts/suite-active.mjs`; REGRESSION_REPORT.md §6 |
| **QRE-SAN-02**: H26's still-valid assertions had no active test: the screen byte for byte (SEC-INT-01), `missingInputs`, `recorded.length`, the reason, and "the device states no screen" | MEDIUM | **Fixed.** A new successor keeps every still-valid tm-5 assertion and inverts only QRE-INT-02 to its closed form. H26 is re-filed as category B (it pinned an open defect). | `test/v1san-successors.test.mjs`; manifest H26 |
| **QRE-SAN-03**: phase 2 accepted any failure | MEDIUM | **Fixed.** Each entry pins `failsAt.line`, and a failure elsewhere fails the suite. For the 51, the line on HEAD equals the line on `90452b8` (the generator checks it). Reproduced as N8. | manifest `failsAt`; `suite-active.mjs` |
| **QRE-SAN-04**: with `test/**` counted as infrastructure, a successor could be weakened, or a regressed test added to the manifest, with no record | MEDIUM | **Fixed for the historical layer.** REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-1 (`SANITIZATION_RECORD.json`, `254738a`) binds the manifest, the runners, `package.json` and the 16 successor files, and `v1san-record.test.mjs` checks it (N9). **Residual, accepted and stated:** an active test outside the historical layer can still be weakened by a passing commit. That is left to code review (policy §4.3). | `SANITIZATION_RECORD.json`, `test/v1san-record.test.mjs`, HISTORICAL_TEST_POLICY.md §4 |
| **QRE-SAN-05**: the policy claimed that a green `npm test` proves the historical tests green in their versions, and it linked a missing FINAL_REPORT | LOW | **Fixed.** The policy now says which command proves what (§1), and the report exists. | HISTORICAL_TEST_POLICY.md |
| **QRE-SAN-06**: three boundary tests were weaker than their titles: an unenrolled intruder, a replay not asserted, and checks inside `if(raw)` | LOW | **Fixed.** The intruder is enrolled in the same custody (correction refused, the other record holds none of these rows). The replay answers the same decision with nothing written, and the same id with another body gets `CONFLICT_IDEMPOTENCY_KEY`. `raw` is asserted to exist. | `test/v1san-boundary-safety.test.mjs` |
| **QRE-SAN-07**: H52/H53 `firstFailedAt` was wrong (90452b8), and commit order was not checked | LOW | **Fixed.** `2c527f7` (AT). `suite-historical.mjs` checks belongsTo ⊏ firstFailedAt ⊑ HEAD. | manifest; `suite-historical.mjs` |
| **QRE-SAN-08**: a skipped test titled with its own file path was hidden | LOW | **Fixed by the redesign.** Any skip fails the suite, file-level entries included (N7). | `suite-active.mjs` |
| **QRE-SAN-09**: notes | NOTE | Each is handled below. | |

The QRE-SAN-09 notes, one by one:

- **H52's stdout checks.** They are covered by `v1san-runtime-integrity` tests 1 and 3: the bound bytes and the records at their commits.
- **A parent failing after its subtests.** It is now detected through node's counter.
- **The H16 successor's precision.** Recorded as it is. The successor is SC's, as reviewed by SSCTR_SC_R1.
- **H26's category.** Fixed: B.
- **H40's attribution.** Fixed (also SSCTR-SAN-03).
- **A literal `&quot;` in a title.** It fails closed, as the reviewer noted. Recorded.
- **The untracked evidence.** Committed in `02d9716`.

| SSCTR condition | Disposition |
|---|---|
| **SSCTR-SAN-01**: HQ-SSCTR-O1-02 and HQ-SSCTR-SC-01 are proposed, not queued | Applied: H06, H07, H08, H16 and RC-5. |
| **SSCTR-SAN-02**: name the authorized, less conservative consequences | Applied. On H03 and RC-3: the C-R2-1 return-floor lift (RESTART 45 → EASY_CURRENT 80, verified in DECISION.md §6) and the non-monotonic class mapping. On H06–H08, H16 and RC-5: the shorter pause, and the strength first exposure 19 → 27 min (O-SC-S1, verified in SSCTR_SC_R1). |
| **SSCTR-SAN-03**: H40's attribution | Applied: `430c493` = SSCTR-CORE-B-01 (verified in CYCLE1.md); O-1 kept the dispute in every order. |
| **SSCTR-SAN-04**: scope "E-1 closed"; commit the mutation evidence | Applied. E-1 is closed at the Core and at the boundary on synthetic inputs, and stays open for real athletes under C-C5. The evidence is committed (`02d9716`). |
| **SSCTR-SAN-05**: the row-19 and scenario-21 sporting effects; add the scenario-21 tests | Applied to H15, H21, H22, H41 and H42. `alsoCoveredBy` now includes SSCTR-NCC-01 (scenario 21) and (S21b). |
| **SSCTR-SAN-06**: H04's wording | Applied: a recognized occurrence whose minutes never count. SB-1 is asked because a voice in force says the athlete trained (`claimsDone`), and no dose credit is involved. |

Not decided here, and flagged CLINICAL_HUMAN_REQUIRED by SSCTR R1:

- whether the existing warning-sign screen is enough after a symptom stop;
- the clinical part of O-SC-S2.

Both stay with a clinician.

## Round 2 (on `119e761`)

| Reviewer | Verdict | File |
|---|---|---|
| SSCTR | **ACCEPT**: SSCTR-SAN-01 to 06 all MET; 3 non-blocking notes | [reviews/ssctr/SSCTR_SAN_R2.md](reviews/ssctr/SSCTR_SAN_R2.md) |
| QRE / Security | **READY_WITH_CONDITIONS**: QRE-SAN-01, 02, 03, 05, 06, 07, 08 and 09 CLOSED; QRE-SAN-04 partly closed. New: QRE-SAN-10 (MEDIUM), 11 (LOW), 12 (NOTE). The §4.3 residual is acceptable once 10 is fixed and 11 is fixed or named. | [reviews/qre/QRE_SAN_R2.md](reviews/qre/QRE_SAN_R2.md) |

| R2 item | Disposition |
|---|---|
| **QRE-SAN-10** (MEDIUM): the record test was neither bound nor required, so deleting it together with a weakened successor stayed green | **Fixed**, condition met. |
| **QRE-SAN-11** (LOW): the helpers, harness and verifier scripts the successors use were not bound | **Fixed.** |
| **QRE-SAN-12** (NOTE) | Named in the residual (policy §4.3). |
| SSCTR R2 N3: the A/B counts | **Fixed**: ROOT_CAUSE now says 28 A + 23 B, with H26 under B. |
| SSCTR R2 N1: H03's `safetyPoint` wording | **Left as recorded.** It is optional per SSCTR, the `contract` field carries the qualification, and the manifest is now bound. |
| SSCTR R2 N2 | Accepted by SSCTR; no action. |
| QRE R2 remark: INDEPENDENT_REVIEW cited a FINAL_REPORT not yet committed | **Fixed.** The report is committed with this round. |

**How QRE-SAN-10 and -11 were fixed.**

- **The record.** REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-2 (`HISTORICAL_LAYER_RECORD.json`, commit `2a865f8`) binds 33 files: the layer's core including the record test, the 16 successor files, and 11 dependencies (8 test helpers and the audit harness `scenario.mjs`, plus the 3 verifier scripts).
- **The check.** The runner verifies the record before anything runs, and it requires the record test to run and pass. The record is proven by git to be written once and never modified, so its check needs no hash inside a bound file. That is what made -1 unable to bind its own test.

**The attacks re-run on `2a865f8`** (`evidence/negative-checks-r2.txt`). Each one exits 1 before the suite runs:

| Attack | Refused with |
|---|---|
| A1: QRE R2's own repro: SEC-INT-01 dropped from the H26 successor, and `git rm` of the record test, committed | "a bound file is missing", "the historical layer changed" |
| A2: the record edited to bless the weakening, committed | "2 commits touch it" |
| A3: a helper weakened | the same refusal |
| A4: a verifier script edited | the same refusal |

The SSCTR clinical flags remain: whether the warning-sign screen is enough after a symptom stop, and the clinical part of O-SC-S2 (CLINICAL_HUMAN_REQUIRED).

## Round 3 (QRE only, narrow: QRE-SAN-10 and -11, on `2a865f8`)

| Reviewer | Verdict | File |
|---|---|---|
| QRE / Security | **READY**. QRE-SAN-10 CLOSED, QRE-SAN-11 CLOSED. The residual is acceptable. | [reviews/qre/QRE_SAN_R3.md](reviews/qre/QRE_SAN_R3.md) |

**The reviewer's own attacks on `2a865f8`:**

- **Refused:** its R2 attack again; an uncommitted rewrite of the record; a rewrite committed separately; the record deleted and re-added forged; a `git mv` away and back.
- **Passes, through a visible edit of a bound guard file:** a new record path (an edit of `LAYER_RECORD`), and removing the check together with its test. Both are the stated residual.
- **Passes, as new finding QRE-SAN-13 (LOW):** a shallow clone, and an `--amend` of the record's own commit.

| Item | Disposition |
|---|---|
| **QRE-SAN-13** (LOW) | **Accepted residual, named** in policy §4.3: run `npm test` on a full clone, and protect the branch before real-athlete work. It was not fixed in code: that would need a third record version for a LOW item that R3 already rates READY. |
| **QRE-SAN-14** (NOTE): the policy text, the R2 evidence and the final report were uncommitted at `2a865f8` | **Fixed**: committed with this round. None of these files is bound by the record. |

**Independent review: PASSED.**

- QRE/Security: **READY** (R3).
- SSCTR: **ACCEPT** (R2).
- No BLOCKER, HIGH or MEDIUM finding is open.
- Accepted residuals, named in policy §4.3: active tests outside the historical layer; `process.exit` truncation; a commit rewriting the guard itself; shallow history or rewritten history.
- The SSCTR clinical flags stay CLINICAL_HUMAN_REQUIRED.
