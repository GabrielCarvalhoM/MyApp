# Security re-verification of the F08 core boundary (SEC_V1CP_IMPL r1, 2026-11-09)

- **Reviewer:** a fresh `security-privacy-abuse-architect` instance. It wrote none of the implementation or the design, and did not delegate. Opus 5.5, max effort, L3.
- **Scope:** SEC-V1CP-25, the offline core only, on candidate `fa3985b` (the CoachingCore tree equals the commit). There is no server, client, logging or analytics in this repository.
- **Criteria:** `security/SECURITY_V1CP_F08.json` r1 (`b570fc70…d0f2`), the SSCTR decision (`0898c59a…a166`) and PCG r2 (`fb9f3026…7806`).
- **Machine-readable twin:** `SEC_V1CP_IMPL.json`. It holds the evidence, file:line references and probe results; where the two differ, the JSON prevails.

## Verdict: FAILED (SECURITY_BLOCKED; NOT_READY on the review request's scale)

**What holds:**
- The three F08 readers are closed and fail closed.
- Every item is actively answered.
- The record is append-only.
- Readiness replays change nothing.
- No output claims a clearance.

**Where it fails:** the new-plan path.
- An intake flag the client can set skips the clinical screen.
- Once any readiness declaration is on record, a clinical cause stated in the restart intake is never screened.
- The hold check of a new plan depends on an optional, possibly stale `referenceState`.

**Escalation:** the task contract's ESCALATE_IF trigger "a relevant sign being ignored" fired (SEC-V1CPI-01, -02). It is routed to the Chief.

**Evidence run:**
- `node --test`: 1058/1058.
- `test/v1cp-f08.test.mjs`: 15/15.
- 13 probe scripts and a helper, kept in a scratch folder outside the repository.

## Conditions (core level)

| Condition | Status | Basis |
|---|---|---|
| SEC-V1CP-02 closed structure | **FAILED** | The readers reject every extra key and out-of-vocabulary value (85 probe checks). But the restart intake accepts `readinessDeclared` and `bySportDays` from the client (V1CPI-01), and a strength readiness without `restrictions` defaults to none (V1CPI-05). |
| SEC-V1CP-03 active answers | VERIFIED_WITH_CONDITIONS | Each sign, exercise item, `improved`, `ready`, `declaredRecovered` and `runningNotRestricted` is required. A non-boolean answer or a shortcut is ASK, never no. Open: V1CPI-05; the UI half. |
| SEC-V1CP-04 no professional-visit field | VERIFIED | Every such key is ASK and never read; no fact carries one. |
| SEC-V1CP-05 no free text | VERIFIED_WITH_CONDITIONS | No free text is read. Open: unknown key names are echoed and persisted (V1CPI-08); objects of sports the plan does not program are not validated (V1CPI-09). |
| SEC-V1CP-14 erasure fails closed | **FAILED** | The append-only, hash-bound half holds. But no tombstone exists, and deleting F08 rows fails open (V1CPI-06). |
| SEC-V1CP-21 no clearance wording | VERIFIED_WITH_CONDITIONS | 1.7 M output strings scanned. The only hits are negated disclaimers and an item question. Open: catalog copy and urgency wording (V1CPI-11). |
| SEC-V1CP-22 readiness integrity | VERIFIED_WITH_CONDITIONS | Own hold only; screen dated that day; every item answered; replay is a no-op; the cause is never edited; a new sign returns to the hold. Open: V1CPI-07, -04, -09; the server half. |
| SEC-V1CP-23 restart is not a bypass | **FAILED** | With the latest `referenceState` every hold source blocks, restrictions carry and the carry is minimal. It fails through V1CPI-01, -02, -03 and -04. |

## Findings

| Id | Severity | Finding | Owner |
|---|---|---|---|
| SEC-V1CPI-01 | HIGH | `athlete.pause.readinessDeclared` from any intake skips the pause-reason screen. An INJURY "surgery" pause gives PROPOSED (CLINICAL without the flag). `bySportDays` overrides the stated pause (RESTART becomes EASY_CURRENT). `r6-intake.mjs:205` | Engineering |
| SEC-V1CPI-02 | HIGH | With any readiness on record, the restart intake's stated cause is never screened. A new injury after training resumed, with `clinicalReason: true`, gives PROPOSED. `v1-f08.mjs:193` | Engineering; SSCTR/PCG for the RC-11 rule |
| SEC-V1CPI-03 | HIGH | Without the `referenceState`, or with a stale one, a new plan clears these holds: an S1 entry sign, not improved, a clinical flag, pain with a substitution, an S6 sign. The record alone shows none of them. `r6-index.mjs:33`, `v1-f08.mjs:183-187` | Engineering |
| SEC-V1CPI-04 | MEDIUM | F08 rows are read without ownership, causality or integrity checks. A foreign `READINESS_DECLARED` row dated 2099 lifts AVOID_LOWER; a foreign window-end check skips the check. `r6-adaptation.mjs:453` | Engineering |
| SEC-V1CPI-05 | MEDIUM | A strength readiness with no `restrictions` key reads as "no restriction" (RC-08: no defaults). `v1-f08.mjs:144` | Engineering |
| SEC-V1CPI-06 | MEDIUM | No erasure tombstone. Removing the readiness row lifts a restriction (0 lower-body rows become 32). Removing an open window's report lets a second window open and leaves no way back. | Engineering with SSCTR; G07 |
| SEC-V1CPI-07 | LOW | The screen date is day-level and timezone-naive. A same-day screen answered before the sign is accepted, and so is a UTC-dated screen from the previous local day. | Engineering |
| SEC-V1CPI-08 | LOW | Unknown key names are echoed verbatim and unbounded (a 200,090-character reason) into `referenceState.pending`. | Engineering |
| SEC-V1CPI-09 | LOW | Values are accepted instead of asked: `runningNotRestricted: false` is ignored without a lower restriction; non-programmed sport objects are not validated; `hold` is never compared with the holds on record; a region is kept for a running-only report. | Engineering |
| SEC-V1CPI-10 | LOW | A weekly review replayed with a check duplicates the `WELLBEING_CHECKED` row and adds a decision. One event id can be reused across F08 fact types. | Engineering, with QRE |
| SEC-V1CPI-11 | LOW | The negated "clearance" disclaimers must not be translated into denylisted words. Chest pain and fainting get the same wording as swelling. | Product/UX with PCG; G04/Founder |

**Fix cycle:** SEC-V1CPI-01 to -05 are new, narrow and runtime-only, so they fit the single bounded fix cycle. SEC-V1CPI-06 needs the tombstone design; otherwise it closes as a named blocker before any erasure path or real collection.

## Vocabulary extension (SEC-V1CP-02, C-Q05-8): CONFIRMED_WITH_CONDITIONS

**Confirmed as closed booleans and enums with a named consumer, grouped as implemented:**
- W1–W9 for every condition;
- W10 and W12–W14 for the systemic conditions only;
- W11 and W15 for the illness-type conditions only;
- all fifteen at the readiness declaration;
- X1–X4 only after executed or adverse sessions, with X3 for illness-type windows;
- `improved` only at the window end;
- `runningNotRestricted` only with AVOID_LOWER_BODY_STRENGTH;
- WHOLE/UPPER/LOWER as the finest body granularity.

**What the record keeps:** less than is asked. The entry stores no sign answer, the checks store "answered no" or the yes items, and the readiness stores all no.

**No additions:** no sub-item, value, severity scale, "other" field or diagnosis label, and no label derived from a combination of answers.

**Before any real collection:**
- **G07:** the legal basis and specific consent (with a RIPD), and retention with the tombstone.
- **G04, with interim wording from the Founder:** the instrument content and urgent-care wording for W2–W5 and X1.
- **Product/UX:** unanswered one-by-one controls with no all-no control, and an unambiguous running question.
- **Engineering:** a server closed schema, no health value in logs, analytics or outbound surfaces (canary-tested), and custody of the record.
- **Core:** the fixes above.

**Not ruled here:** `trainingMonths` and the race "tolerated" answer stay PENDING (Security with G07).

## Pending outside the core

These cannot be verified in the core. The JSON lists each with its owner.

| Conditions | What is pending |
|---|---|
| 01 | inventory |
| 02, 03 | the server and client halves |
| 06, 07 | free-text handling |
| 08–12 | purpose, analytics, consent, refusal and revocation |
| 13 | retention |
| 15, 16 | hashes and logs (canary) |
| 17 | OS surfaces |
| 18 | Growth Layer artifacts and exports |
| 19, 20 | server authorization and storage |
| 22, 23 | the server halves |
| 24 | documents |
| 25 | the re-verification itself |
| 26 | entitlement |
| 27 | age |
| New | custody of the record, and the urgency wording |

No code, test, canon, product document, mission or ledger was edited. Nothing was committed, pushed, merged or frozen.
