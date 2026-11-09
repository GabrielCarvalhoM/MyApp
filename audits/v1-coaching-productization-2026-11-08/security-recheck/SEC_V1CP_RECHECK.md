# SEC-V1CP-25 recheck of the core boundary on 5ee9dec

**Verdict: FAILED (SECURITY_BLOCKED).** Scope: the offline core boundary of `5ee9dec` only. This was the single narrow recheck; no further cycle follows. The full record is `SEC_V1CP_RECHECK.json`.

**Reviewer.** A fresh Security instance. It wrote none of 5ee9dec, fa3985b, the design or SEC_V1CP_IMPL.

**Evidence.**
- `node --test`: 1080/1080 pass. `v1cp-fixcycle`: 22/22 pass.
- Probes ran from the scratch folder `sec-v1cpr/`, outside the repository.
- Regressions were told apart by running the same probes on an extract of fa3985b.

## What the cycle closed

- **Restart facts.** Client intake can no longer carry them; they travel only under the symbol. A stated cause is screened.
- **Hold facts.** Nine hold sources each write a CLINICAL_HOLD fact. The record alone blocks a new plan, and so does a stale reference state.
- **Unreadable rows.** Foreign, tampered, future and malformed rows are never read. Sealed rows survive JSON storage.
- **Answers.** Strength restrictions must be answered. Unknown keys are never echoed.
- **Replays and copy.** Identical replays add no row. No V1CP output string claims a clearance (222,392 strings scanned).

## Rulings on SEC-V1CPI-01..11

| Id | Ruling |
|---|---|
| -01 | CLOSED |
| -02 | **OPEN (HIGH residual).** A cause the athlete states is screened. But an old declaration still stands in for the cause of a new stop after training resumed, so the reason is never asked (RC-11). |
| -03 | CLOSED_WITH_CONDITIONS: SEC-V1CPR-01 and -02 fixed; RECORD-CUSTODY in place, because in-program holds still depend on the reference state |
| -04 | CLOSED_WITH_CONDITIONS: an unreadable row is refused, not dropped (SEC-V1CPR-01); the seal is keyless, so custody is still needed |
| -05 | CLOSED |
| -06 | **OPEN, accepted as a named blocker.** Before any erasure path, real collection or exposure: no path deletes or edits an F08 row, CLINICAL_HOLD included; the record is under server custody; the tombstone design and its regressions exist. Owners: Engineering with SSCTR; G07 for the retention basis. |
| -07 | CLOSED_WITH_CONDITIONS: the server binds `assessedAt` |
| -08 | CLOSED |
| -09 | OPEN (LOW): the named-hold check compares absent keys (`undefined === undefined`) |
| -10 | CLOSED; its side effect is SEC-V1CPR-03 |
| -11 | CLOSED_WITH_CONDITIONS: catalog scan, including the baseline reason "no automatic clearance"; urgency wording with G04 and the Founder |

## Core conditions on 5ee9dec

- **VERIFIED:** SEC-V1CP-04, 05.
- **VERIFIED_WITH_CONDITIONS:** SEC-V1CP-02, 03, 21, 22.
- **FAILED:** SEC-V1CP-14 (erasure half, carried as the named blocker) and SEC-V1CP-23 (the -02 residual, plus SEC-V1CPR-01, -02 and -04).

## New findings

| Id | Sev. | Finding |
|---|---|---|
| SEC-V1CPR-01 | MEDIUM | On the restart path, a row readableF08 rejects is read as absent, and the athlete id and clock come from the intake. An altered hold row, another athlete id in the intake, or a restart dated before the hold lifts the hold or the restriction. The athlete-id case is a regression: 32 lower-body rows, against 0 at fa3985b. |
| SEC-V1CPR-02 | MEDIUM | A clinical decision can leave no CLINICAL_HOLD fact: a numeric event id, a reused or planted id, a stale clinical reference, or a malformed ledger. A new plan then unlocks. |
| SEC-V1CPR-03 | MEDIUM | An event-id conflict now comes before the clinical route. A report, check or weekly review with chest pain yes, under an id already on record, gets an id question. fa3985b routed it clinical. This breaks RC-01 and fires ESCALATE_IF "a relevant sign being ignored" in a narrow form. |
| SEC-V1CPR-04 | MEDIUM | restartProgram throws a TypeError on the default restart: no stated pause, a record with executed sessions, no declaration. fa3985b asked the reason. |
| SEC-V1CPR-05 | LOW | The made-from-record filter treats the whole restart day as history: a clinical break declared later that day is no longer kept by the record. |
| SEC-V1CPR-06 | LOW | Minimisation: `CLINICAL_HOLD.eventKind` and an early `improved: false` are stored, and nothing reads them. |

**Blocking:** SEC-V1CPI-02 (residual) and SEC-V1CPR-03.

**Before any integration:** SEC-V1CPR-01, -02 and -04.

**Escalation.** The ESCALATE_IF trigger is routed to the Chief. The interim fail-closed fixes need no G07, G08, G09, G10, PCG or Founder decision.

**Routed observations:**
- the A1 lexicon gap "tore my acl", pre-existing (SSCTR and PCG);
- the chain counting under C-1 (SSCTR with QRE).

**Pending outside the core.**
- **RECORD-CUSTODY** (Engineering): the server appends rows, stores the reference state, binds the athlete id and the clock, and assigns string ids.
- **SEC-V1CP-01, 06–13, 15–20, 24, 26, 27:** with their recorded owners.
- **Urgency wording:** G04, unavailable, so the interim goes to the Founder.
- **RC-16:** Founder with PCG.
- **E1/E2 intake fields:** Security with G07.

Nothing was committed, pushed, merged or frozen.
