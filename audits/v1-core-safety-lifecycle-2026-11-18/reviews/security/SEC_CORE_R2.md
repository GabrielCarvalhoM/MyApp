# SEC-CORE R2: narrow recheck of the correction cycle

**Judge:** Security, Privacy & Abuse Architect 1.1.0, an independent instance (not the author). This is the same judge as R1, and the only correction cycle.
**Bound to:** candidate `430c493` (cycle record `CYCLE1.md` in `6f747f2`). The worktree HEAD `6f747f2` has `CoachingCore/` byte-identical to `430c493`.
**Scope (only):**
- SEC-CORE-01, -02, -04, -05 and -12;
- the new `byEvent` precedence for a live row's part ids.

SEC-CORE-03, -06, -07 and -10 and the Founder items (-08, -09, D1, D2, G07) stay as carried conditions, as `CYCLE1.md` §"carried" records them. They are not re-judged here.

## Verdict: **PASS_WITH_CONDITIONS**

- The five findings in scope are closed.
- No blocking finding remains.
- The conditions are the carried ones (unchanged from R1), plus two notes on the cycle's own changes (SEC-CORE-14, SEC-CORE-15).

## 1. Evidence

All probes at `430c493`, in the R1 scratch directory outside the repository (`C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/49a7da70-f8db-4241-9fa5-06052e22deea/scratchpad/sec-core-r1-1795034197-9434/`). The R1 probes were rerun unchanged, and `r2-carried.mjs` is new. `node --test test/v1core-*.test.mjs` passed 57/57. No git state was changed, and neither `verify-r*` nor `npm run verify` was run.

| Item | R1 result (`0b8e45a`) | R2 result (`430c493`) |
|---|---|---|
| **SEC-CORE-01: forged context** (`p-ns` B5) | the new report is stored with the forged `context`, `comparable:true` | `context:{sessionType:'UNPLANNED'}`, `comparable:false`, the same as the control |
| **SEC-CORE-01: re-entry decision** (`p-ns2`) | forged context: "1 day without it, lighter entry" | forged context: "44 days, restart from current capacity", the same as the control |
| **SEC-CORE-01/02: through custody** (`p-custody`) | forged `context` and `parts` stored under the keyed chain | neither is stored |
| **SEC-CORE-02: own-part override** (`p-parts2`, `ownPartOverride`) | after a legitimate re-sync, `ADVERSE→UNKNOWN`, adverse sessions 1→0 | `ADVERSE` stands, adverse sessions 1 |
| **SEC-CORE-02: forged parts** (`p-parts` c1, `p-parts2`/`p-parts3` ghosts on a new report) | the forged ids enter the merged row | stripped: parts are only `ath-1`, `dev-1`, `dev-1b` |
| **SEC-CORE-04: malformed carried parts** (`r2-carried`) | invalid enum: row dropped at the next review (data loss) | six malformed forms tested: invalid enum, negative minutes, null part, string part, array `actual`, `parts` not an object.<br>For each: no throw, `KEEP`; the row is kept at the re-sync and at the next review.<br>The correction replaces the row as before (see SEC-CORE-14). |
| **SEC-CORE-05: marker** (`p-expiry`) | catalog and policy mismatch after the date: `UNSUPPORTED` with an `EXPIRED` marker | `UNSUPPORTED`, unmarked.<br>`options.authority` is excluded from the reread.<br>Warning sign after the date: `CLINICAL_HUMAN_REQUIRED`, `proposal:null`, `offers:[]`, no executable run. |
| **SEC-CORE-12: error text** | `e.message` at `r6-legacy:143` and `:332` | the class only (`TypeError`). None of the 38 `CoachingCore/src` files in the P0 build manifest contains `.message`. |
| **byEvent hijack** (`r2-carried`) | n/a | see §2 |

## 2. The `byEvent` precedence (new in the cycle)

**The rule.** A live row is now registered as the target for each of its part ids that its own provenance merged (`inputHashes` keys ∪ `mergedSourceIds`), ahead of whatever row claimed the id earlier.

**Hijack through a new report: not possible.**
- A review's incoming reports lose `parts`, `mergedSourceIds` and `inputHashes` before this rule runs. So the set of ids a new row "merged" is its own `eventId` only.
- Probe `hijackIncoming`: a new report of the same session claims `ath-1` in all three fields. It is merged as an ordinary agreeing report.
- The athlete's later edit of `ath-1` finds the live row. The edit applies (`nextDayFunction:IMPAIRED`), `ADVERSE` stands, and nothing is excluded.

**Hijack of facts across executions: not possible.**
- The holder of a correction is searched by `identity` (`accepted.find(x=>x.identity===identity…)`).
- A target of another identity is refused by the existing chain check (`INVALID_CORRECTION_CHAIN`).

**Residual: denial through an edited record (D1 class).**
- Probe `hijackCarriedOtherSession`: a *carried* row of another session was edited to name `ath-1` in its parts and `mergedSourceIds`. It takes `byEvent('ath-1')`, and the athlete's legitimate edit of `ath-1` is then refused (`INVALID_CORRECTION_CHAIN`). The original statement stays in force; no fact moves.
- Before the cycle, the `!byEvent.has(id)` guard kept the first claimant, so this denial needs the new precedence plus an edited record. Only someone who can already rewrite the unauthenticated record (D1) can trigger it.
- See SEC-CORE-15.

## 3. Findings

### Closed
- **SEC-CORE-01:** closed. `normalizeObservations(..., {incoming:true})` drops `context` from a review's new reports at both review call sites (r6-adaptation:569 and :605). The namespace "carried as recorded" path is now reachable only by rows of the record.
  - *Scoping is sound for V1.* The other callers pass engine-made rows:
    - the learning model receives `usableBound`;
    - r6-adaptation:2521 passes `prior` only.
  - *Legacy exception:* r6-legacy:208 is the one review path left unscoped (SEC-CORE-16).
- **SEC-CORE-02:** closed. The same strip drops the incoming `parts`, `mergedSourceIds` and `inputHashes`. Parts are built only from validated reports. `comparable` is still taken from the report, but it can only lower comparability (`o.comparable!==false&&…`) and it is ignored on the `UNPLANNED` path, so no escalation is possible.
- **SEC-CORE-04:** closed as specified. `validPart` applies a report's checks. A malformed part is not read, nothing throws and no row is lost. The residual is in SEC-CORE-14.
- **SEC-CORE-05:** closed. A reread that is still `UNSUPPORTED` (or that fails) returns the refusal unmarked. A caller's `authority` excludes the reread, like `repertoire`. Caller-supplied `repertoireRecords` still reach the marker path; that is SEC-CORE-06, carried, and harmless because only a clinical answer can come out of it.
- **SEC-CORE-12:** closed.

### SEC-CORE-14: NOTE. The fallback for a malformed part is all-or-nothing
- When any *other* part is malformed, the correction replaces the whole row, as before E-1.
- So one corrupt ghost part also discards the athlete's valid part. `r2-carried`: an athlete's `ADVERSE` became `UNKNOWN` after a device re-sync on a row with one malformed extra part.
- This is the documented pre-E-1 behaviour. It is reached only through a damaged or edited record (D1), and it is far better than R1's dropped row.
- Recommended for SSCTR/engineering (not required here): inherit the well-formed parts and flag the row (`provenance.conflict`) instead of discarding them.
- An *edited* record with *well-formed* forged parts still enters the re-merge (`validGhostD1`, `ownPartRewrittenD1`). That is the D1 record-trust decision, as in R1.

### SEC-CORE-15: NOTE. Restrict the new precedence to the same identity
- An edited carried row of another identity can take a report id and block that report's legitimate correction (§2). The impact is denial only, it needs an edited record, and it is D1 class.
- One-line hardening: register `byEvent(id)` for the live row only when no row holds the id yet, or when the current holder has the same `identity` or is superseded.
- Owner: engineering, any later engine change. Not a freeze condition.

### SEC-CORE-16: NOTE. The legacy review path is not scoped
- `r6-legacy.mjs:208` calls `normalizeObservations` without `incoming:true`.
- A program of the legacy version (made only from an `R5-INPUT-1` intake, which `r6-index.mjs:19` routes to the legacy generator) would keep a new report's own `parts`, `mergedSourceIds` and `inputHashes`. This is by reading; I did not probe it.
- V1 onboarding never produces such a program.
- Recommended: the V1 bridge refuses `R5-INPUT-1` intakes and legacy programs. This belongs with the integration conditions (SEC-CORE-06/-10), or legacy passes `incoming:true` too.

## 4. Carried, unchanged (not re-judged)

- **Before integration:** SEC-CORE-03 (a correction bound to its author: `p-parts` c2 still shows `ADVERSE→UNKNOWN` through a device-shaped correction of `ath-1`), -06, -07, -10. Owners and triggers as in `CYCLE1.md`.
- **Founder:** SEC-CORE-08 (clock), SEC-CORE-09 / G07 (retention and erasure of parts), D1, D2.
- **Notes:** SEC-CORE-11, -13.

## 5. Gate scope

- This verdict holds for `430c493` only.
- It is invalidated in part by any change to:
  - `r6-provenance.mjs` (`normalizeObservations`, `validPart`, the `byEvent` rules);
  - the two `incoming:true` call sites in `r6-adaptation.mjs`;
  - `v1-safety-index.mjs`.
- No further cycle follows. The carried conditions belong to the integration mission and to the Founder.
