# SEC-C2 R1: Security review of the closure-2 candidate

**Judge:** Security, Privacy & Abuse Architect 1.1.0. This is an independent instance; it wrote none of the candidate.
**Bound to:** candidate `219fb1c`. The worktree HEAD `8f54df6` has `CoachingCore/` byte-identical to `219fb1c`.
**Diff judged:** `git diff 4c60915 219fb1c -- CoachingCore/src`, 3 files, +24/−7.
**Scope (only):**
- SEC-CORE-14 (`r6-provenance.mjs`);
- SSCTR-CORE-B-01-R (`v1-run-format-index.mjs`);
- QRE-CORE-R2-01 (`v1-safety-index.mjs`, `deliveredOnly`);
- whether the SEC_CORE_R2 conditions change.

## Verdict: **PASS_WITH_CONDITIONS**

- All three changes are sound at the trust boundary. None of them lets a request forge provenance, authorship or clinical evidence, and none of them weakens a validation.
- No finding blocks the gate, so no fix is needed in this cycle.
- The conditions are the SEC_CORE_R2 conditions, carried unchanged.
  - Two notes are folded into existing owners: SEC-C2-01 into SEC-CORE-10 (custody) and SEC-C2-02 into SEC-CORE-15.
  - Founder impact is recorded in §4. No Founder decision is needed for this gate.

## 1. Method

- **Extracts.**
  - The candidate: `git archive 219fb1c CoachingCore audits` into `…/scratchpad/sec-c2-r1-1795041205-2245/`.
  - A differential base: `git archive 4c60915` into `…/scratchpad/sec-c2-r1-base-4c60915-1795041392-2413/`.
  - `node_modules` was copied into both.
- **Probes.** They are in `…/scratchpad/sec-c2-r1-probes/`, separate from both extracts: `p-b01r`, `p-plantdiff`, `p-clock`, `p-sec14`, `p-ownid`, `p-r201`. Each one ran on both trees.
- **Tests.** On the candidate extract, `node --test` over `v1core-closure2`, `-cycle1`, `-e1`, `-expiry` and `-voices` ran **49/49 pass**.
- **Not done.** `npm run verify` and `verify-r*` were not run. No git state was changed. Nothing in the repository was edited except this file.

## 2. Findings per item

### 2.1 SEC-CORE-14: closed (R2 note resolved)

**Validation is no weaker.**
- `validPart` is unchanged.
- The one changed line, `r6-provenance.mjs:146`, moves `validPart` from an all-or-nothing gate (`others.every(validPart)`) into a per-part filter.
- So the set of inherited parts is always a subset of the well-formed parts.
- A holder with only the corrected part gives `inherited=null` where before it gave `[]`. Both are falsy at `inherited?.length` (line 180), so the behaviour is identical.

**Probe evidence (`p-sec14`; the candidate compared with `4c60915`).**

| Case | `4c60915` | `219fb1c` |
|---|---|---|
| Control (no edit) | parts `[a1,d1b]`, ADVERSE | identical |
| One well-formed forged part `g1` (D1, R2's `validGhostD1`) | `g1` inherited | identical |
| `g1` plus one malformed part `g2` | nothing inherited: ADVERSE→UNKNOWN (the athlete's statement is lost) | `g1` and `a1` inherited, `g2` dropped. **This is the same result as the D1 case above, not a new class.** |
| Incoming correction carrying its own `parts`, `mergedSourceIds`, `inputHashes` | stripped | stripped (SEC-CORE-02 holds) |
| `__proto__` part key | own key, prototype intact | identical |
| A later correction naming the dropped malformed id | live row loses ADVERSE | live row keeps ADVERSE |
| SEC-CORE-15 (a carried row of another session claims `a1`) | athlete's edit refused, `INVALID_CORRECTION_CHAIN` | identical |

- **What can reach a live row.** A malformed part's id is no longer in the new row's `parts`, `mergedSourceIds` or `inputHashes`, so a malformed part cannot reach a live row. A well-formed forged part reaches it only through an edited record, exactly as before (D1).
- **`byEvent` precedence.**
  - Lines 192 and 196–197 are unchanged.
  - The ids they register are now the well-formed inherited ids, all on the same identity.
  - SEC-CORE-15 is unchanged by reading and by probe.
- **The R2 note's "flag the row" suggestion.** The R2 note also suggested flagging the row. The candidate does not, and I accept that.
  - The lineage already withholds such a row at the pace boundary. The C-C2 test shows a malformed athlete part giving `REPORT_NOT_CARRIED`.
  - A dropped forged part had no report fact to protect.

### 2.2 SSCTR-CORE-B-01-R: sound

The stop-only fact is `stopOnly(reportFactOf(o))`, recorded with `athleteId = program.athleteId` and `recordedAt = asOf`. Probe evidence comes from `p-b01r`, `p-plantdiff` and `p-clock`.

| Trust question | Evidence | Disposition |
|---|---|---|
| **Grow the record** | 500 forged session ids in one ASK request add 500 rows (286 KB). 500 stops on one *planned* session also add 500 rows, on both trees. The record has no per-request bound in either case, so this is parity and not a new class. Ids over 128 characters are named in the answer and not recorded (test). | SEC-C2-01, note |
| **Free text** | `''`, `__proto__`, `constructor` and `a\u0000b‮` are stored as `sessionId` (≤128). No throw, and the next review reads the record (`unreadableReports: []`). The caller-chosen `reportId` (≤128) was already persisted; the screen's `sessionIds` already echoed these strings at `4c60915`. | SEC-C2-01, note |
| **Forge evidence** | `report.standing:false`. `distanceKm`, `ownKm` and `wholeKm` are null, and `timed`, `several` and `corrected` are false; `readableReport` enforces this shape for `standing:false`. `readReportFacts` skips non-standing rows before the lineage, so the fact is never a report in force and never feeds `inForce` or the pace readers. A device-shaped report with 5 km GPS and 30 min gives a fact with all of those nulled. It makes no `actualLedger` row, and nothing in `runHistoryRecord` or `runEvidenceRecord`. | no forgery |
| **Impersonate a speaker or provenance** | `speaker` comes from `speakerOf` (the same closed form as planned reports, unauthenticated as before: SEC-CORE-10 and D1). For a stop-only fact the speaker is read by nothing: `stops` holds `{sessionId, reportId, reason, at}`. `athleteId` is the program's, never the caller's, and another athlete's report is ignored (test and probe). | no impersonation |
| **Clinical or sporting evidence** | A stop on a session id planted ahead of time for the next plan (restart ids are deterministic) has two effects only after the restart: the screen is `REQUIRED`, and the run sessions are `WARNING_SIGN_SCREEN_REQUIRED`, laid out by time, with forecast and insights withheld. After a screen answered after the stop, the answer is byte-identical to the control's. Execution, credit and dose do not change. | fail-safe: it can only ask for the screen |
| **Denial of service** | The screen is asked until a screen answered after the stop arrives, and then it clears (test step 10). Forcing the screen is the safety function itself, open to anyone who can already report a symptom on a planned session. A stop under a future instant (+20 d) is recorded at that instant, and a later normal review is `HOLD` with the screen `REQUIRED`. Planned stops behave the same on both trees, so this is the SEC-CORE-08 clock and not new. +200 d is refused (`UNSUPPORTED`) and records nothing. | no new class (§4, SEC-CORE-08) |
| **Dedup and identity** | Sending the same report again adds nothing: with other minutes, `stopOnly` strips the minutes and the content hash is equal. The same `eventId` with another speaker adds one row (the content differs). That is the same `reportKey` rule as planned stops, and still one stop of one report id per speaker. At most one live ledger row (test). | preserved |
| **Refused instant** | Nothing is kept for any session (test, and the `+200 d` probe). | unchanged |

**Differential.** On the candidate, the ASK answer to a review with the late stop has the same hash as at `4c60915` without `runFormatRecord` (`e4d69b01…`). The only difference is the one added row (37 rows against 36).

### 2.3 QRE-CORE-R2-01: sound; a pure narrowing

`deliveredOnly` only filters the reread's record. It cannot add a row. It removes only `RUN_FORMAT_EMITTED` rows whose `eventId` the held record did not have. Probe evidence comes from `p-r201`.

**Output against the reread.**
- No row is outside the reread's record.
- The rows removed are exactly the 4 newly emitted formats.
- 18 carried formats are kept.
- At `4c60915` those 4 formats leaked into the record.

**Caller injection.** A carried record with odd rows still comes back byte-identical, row for row (27 of 27), and no undelivered format is added. The odd rows tested:
- an *unreadable* row reusing an id the reread would emit;
- `'junk'`;
- a format with a numeric id;
- a duplicate;
- a forged report fact.

**Why the planted id cannot smuggle a row in.** `appendFormats` never emits an id the carried record already holds, readable or not. So a matching id in `held` is always the carried row itself.

**Caller drop.**
- Only rows of the fact `RUN_FORMAT_EMITTED` absent from `held` are removed. `held` is the refusal's record, which is the sent record unchanged (test `none`).
- A record that is missing, an object or a string gives `[]` and no throw. At `4c60915` it gave 12 undelivered formats.

**Report facts after the date.**
- The review's planned stop is recorded as a report fact. An earlier-plan stop is recorded as a stop-only fact, the same as before the date.
- Another athlete's report is ignored.
- The screen names both sessions.

The only post-expiry recording left is SEC-CORE-13 (carried, SSCTR/Founder).

## 3. Notes (non-blocking)

### SEC-C2-01: NOTE. Fold into SEC-CORE-10 (custody). A caller-chosen session id is now persisted
- **What changed.** Before, an earlier-plan session id was echoed in the answer only. Now an id of up to 128 characters, of any characters (control and bidi included), is kept in the durable record. Each one adds one row.
- **Not a new class.**
  - `reportId` was already caller text up to 128 characters.
  - Planned stops already grow the record per report.
  - The module's "no free text is kept" holds for reasons and speakers, not for ids.
- **Resolution (integration).**
  - The custody/`report-voices` allow-list (SEC-CORE-10) bounds the number of observations per request.
  - It also restricts `eventId` and `sessionId` to an id charset, for example `[A-Za-z0-9._:-]{1,128}`.
  - The app never renders raw ids from the screen or the record.
- **Owner:** engineering (integration). **Trigger:** before integration, with SEC-CORE-10.

### SEC-C2-02: NOTE, pre-existing (identical on `4c60915`). Fold into SEC-CORE-15. A forged part keyed by the next correction's id
- **What happens.** An *edited* carried row (D1) has a well-formed part, `inputHashes` and `mergedSourceIds` keyed by the event id the client will next use for a correction (`d1b`). When that correction arrives, the session's live row disappears: the only row is the superseded holder.
- **Variant.** With parts only, it becomes a conflict.
- **Probe:** `p-ownid`. The result is byte-identical on both trees.
- **Impact.** Denial or data loss only. It needs the record edited and the client's future id anticipated. It forges nothing.
- **Hardening.** In the line-146 filter, and in the line-196 precedence, ignore a carried part id equal to `o.eventId`.
- **Owner:** engineering, with SEC-CORE-15 at the next engine change. Not a freeze condition.

## 4. R2 conditions and Founder items: no change

- **Before integration:** SEC-CORE-03, -06, -07 and -10, plus -16 (legacy path). Unchanged. SEC-C2-01 is added to SEC-CORE-10's resolution.
- **Notes:** SEC-CORE-11, -13 and -15. Unchanged. SEC-C2-02 is added to -15.
- **SEC-CORE-14:** closed (§2.1).
- **Founder items, impact recorded, nothing decided:**
  - **SEC-CORE-08 (clock):** an earlier-plan stop is now recorded at the caller's instant, as a planned stop already was. The surface is the same, now covering one more fact.
  - **G07 / SEC-CORE-09 (retention, erasure):** stop-only `SYMPTOM` facts for sessions outside the plan in force now live in `runFormatRecord` (`report|<reportId>|<hash>`). Any erasure specified over event ids must cover these rows too.
  - **D1 (custody):** every residual above is D1 class.
  - **D2 (backup):** the envelope carries these rows.
- **Out of the Security domain.**
  - CORE-C2-F01 (restart sizing reads superseded rows) is a dose question for SSCTR/QRE.
  - Security notes only that it is reachable from a caller-kept record (D1) and is no trust-boundary change of this candidate.

## 5. Gate scope

- This verdict holds for `219fb1c` (`CoachingCore/` = HEAD `8f54df6`) only.
- It is invalidated in part by any change to:
  - `r6-provenance.mjs` (`normalizeObservations`, `validPart`, the inheritance filter, the `byEvent` rules);
  - `v1-run-format-index.mjs` (`elsewhereReports`/`elsewhereStops`, `read`, `kept`);
  - `v1-run-format.mjs` (`reportFactOf`, `stopOnly`, `readableReport`, `appendReportFacts`, `readReportFacts`, `appendFormats`);
  - `v1-safety-index.mjs` (`deliveredOnly` and the expiry path);
  - the `incoming:true` call sites in `r6-adaptation.mjs`.
- The R2 conditions remain with the integration mission and the Founder.
