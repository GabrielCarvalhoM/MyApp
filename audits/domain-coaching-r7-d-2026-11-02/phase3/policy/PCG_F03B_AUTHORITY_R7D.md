# PCG-R7D-F03B-r1: authority form for F03-B (machine-stack load step)

**Date:** 2026-11-02
**Role:** Product Constitution & Governance, a fresh and independent instance. It decides the authority form only. The domain rule is the SSCTR's.
**Machine-readable record:** [PCG_F03B_AUTHORITY_R7D.json](PCG_F03B_AUTHORITY_R7D.json). Where the two differ, the JSON prevails.

**Outcome: AUTHORITY_FORM_DECIDED**

## Finding: the policy text is ambiguous

`smallestIncrement.MACHINE_STACK = 1` states no unit. Two readings are possible:

- **1 kg.** This follows from `loadUnits` and the kilogram values of TOTAL and PER_HAND. It is what the runtime's arithmetic does.
- **One setting of that machine.** This follows from:
  - the runtime's own `STACK_STEP` unit, already present in the R6 source the SSCTR reviewed;
  - the catalog's convention for MACHINE_STACK ("setting of one machine");
  - the establishment ramp's physical "smallest increment".

No R6 or B0 SSCTR record examined MACHINE_STACK, so the +1 kg step was never a reviewed decision. The Founder's Phase 3 limits are the current decision: no universal step, no impossible weight, no false precision. Those limits exclude the kilogram reading.

## Interpretation I-1

> `smallestIncrement.MACHINE_STACK = 1` means one setting of that machine: one stack or plate position, or its smallest add-on. Its size in kilograms is never assumed, converted or computed. Machine loads stay kilograms (`loadUnits`). `STACK_STEP` names the unit of the increment, never the unit of a load.

- **Scope:** I-1 applies with one reading at every use of the increment:
  - the progression step;
  - REGRESS;
  - the adoption bound;
  - establishment and hint agreement;
  - duplicate tolerance.
- **Hash-safe:** it changes no byte of the policy. Hash `18ec48f3…` holds, so all ten R6 boundaries stay enabled.
- **At the kilogram boundaries:** the engine cannot show that two different values are within one setting. Only equal values provably agree. Anything else falls to the policy's own default: "keeps the planned reference and is asked about".

## Rulings

| Option | Ruling | Form / reason |
|---|---|---|
| **A**: hold; repetitions only | **WITHIN_EXISTING_AUTHORITY** | Applies I-1 with the B0-F07 / B0-C04 c4 principle ("reps progress when the next step is unavailable, never a fabricated load") and the policy's fail-closed defaults. It adds no new number and changes no byte. The SSCTR's acceptance makes the extension from SINGLE_IMPLEMENT to MACHINE_STACK authoritative. The request's "adoption read with the 1 kg increment" mixes readings, so the adoption bound must use I-1 too. The outcome is the same: an above-plan log is asked about, not adopted. |
| **B**: the athlete's next setting, from executed evidence | **NARROW_DELTA_ADMISSIBLE** | A narrow overlay on R6-POLICY-5, for MACHINE_STACK only, carried by two records: the SSCTR F03-B record (the rule) and this record (I-1 and the form). It is the delta binding review the R6 records themselves require before a runtime freeze. It is not an interpretation alone, for two reasons. First, `loggedLoadAdoption` does not cover the log from a numberless next-setting row. Second, the D44 one-increment bound would be met by a different kind of evidence instead of the kilogram check. It is admissible because it is needed if the SSCTR finds A inadequate, and it is narrow: no new number, field or unit, and no byte or closed-record change. The SSCTR must state the adoption evidence explicitly. If it does not, the narrower variant applies: ADVANCE plus confirmation, or a second equal log. Every bound that kilograms can still check keeps applying. REGRESS goes only to a previously executed and adopted value, or lowers repetitions. |
| **C**: equipment-declared increment | **NOT_ADMISSIBLE** (this phase) | It needs a new input field and an interface change. Equipment detail belongs to Product/Data (the B0-F07 owner), not to the two owners named for this decision. It is not needed, because A or B resolves F03-B. It would also add a new athlete-supplied number. It is routed as OPEN_QUESTION PCG-F03B-Q01 to Product/Data. It does not block. |
| **SSCTR variant** built from A/B elements | Admissible under B's form only if it meets every B invariant | It is not admissible if it needs any of: a policy value change, a new input, a fixed machine kg step, or a rewrite of a closed record. If such a rule is the only one the SSCTR accepts, the outcome is `F03_POLICY_BLOCKED`. |

## Binding form

- **Records:** this record and the SSCTR F03-B record.
- **Freeze record:** both are bound by SHA-256 in the R7-D Phase 3 freeze record. The pattern is R7-C's `semanticDisposition`, for example as a `policyDecision` field with the option, `I-1` and both `{record, path, sha256}`. The freeze verifier also checks that these are unchanged:
  - the policy: sha `a75be1aa…`, value hash `18ec48f3…`;
  - the R6 SSCTR record: `6238cbf0…`;
  - the catalog: `ceee276a…`;
  - `SSCTR_RECHECK_B0.json`: `6867d3e8…`.
- **Handoff:** the R7-D handoff lists F03-B as a binding condition, with I-1 verbatim, the chosen rule and the conditions of both records.
- **Mission entry:** the coordinator's insert-only mission and ledger entry names both hashes.
- **Future policy revision:** when R6-POLICY-5 is next legitimately revised, the text absorbs I-1, and every boundary record is re-issued for the new hash.
- **Human revalidation:** if the SSCTR rule has prescriptive impact, its funded-human revalidation entry follows existing practice and is appended by the authorized owner. This record does not touch the queue.

## Proposed index entry (PROPOSED, not applied)

- **Where:** a new block in `canon/CANONICAL_INDEX.md`, directly above `R7_B0_REPERTOIRE_INDEX_START`. The B0 block says R6-POLICY-5 is unchanged and is the index's only path to the policy, so a reader would otherwise apply 1 as kilograms.
- **What it says:** the MACHINE_STACK reading overlay, with links to both records and the freeze record. It also states that this is not a policy revision, not Product Truth and not V1 authority.
- **When:** only at an authorized canon sync, and only if an option was accepted. The exact text is in the JSON `proposedIndexEntry`.

## Conditions (summary)

| Id | Condition |
|---|---|
| C01 | This record binds only with an SSCTR record that accepts A, B or an admissible variant. |
| C02 | One reading (I-1) applies everywhere. |
| C03 | No machine kg value is ever computed, and there is no fixed machine kg step. |
| C04 | No policy, catalog or closed-record byte changes, and no new number or field. |
| C05 | Scope is MACHINE_STACK only. HV-01 and F12 are untouched. |
| C06 | F03-A is consistent with this record: the row's load unit is KG. |
| C07 | The record hashes are bound in the freeze, handoff and mission entry. Any byte change to either record needs a new freeze. |
| C08 | The residuals are disclosed as the SSCTR classifies them. |
| C09 | The re-review triggers are listed in the JSON. |
| C10 | The Founder's Phase 3 authorization is preserved on disk before the freeze binds. |

**Status:** GOVERNANCE_READY_FOR_REVIEW for the authority form. It becomes binding only through the binding form above. It is not canonical, not Product Truth and not V1 coaching authority.
