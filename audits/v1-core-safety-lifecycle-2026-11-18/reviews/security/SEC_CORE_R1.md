# SEC-CORE R1: Security, Privacy & Abuse review of the Core Safety & Lifecycle candidate

**Judge:** Security, Privacy & Abuse Architect 1.1.0 (independent instance, not the author). Rubric `evals/SECURITY.md`.
**Bound to:** candidate commit `0b8e45a` (base `16577b6`), diff `git diff 16577b6 0b8e45a`. Dossier `CANDIDATE.md` (untracked at dispatch).
**Not reviewed:** `ba59d5a` (Mac package) and `f3a8871` (namespace input). §6 says what `f3a8871` changes.
**Scope:** engine-side trust and integrity on the device-local architecture (ADR-AIF-1 §5). D1 (custody chain and HMAC on the device) and G07 are **not** decided here. No backend or cloud requirement is created.

## Verdict: **PASS_WITH_CONDITIONS**

- The four precedence and identity changes do what they claim against the actors the candidate names: the caller, a crafted review, a crafted program and the carried record.
- After expiry, nothing prescriptive or proposed comes out.
- A caller cannot set the session namespace.
- Two narrow **new** acceptance paths were found. Each lets a report carry fields the engine owns into a decision. Both are reachable through the unchanged V1CIB custody.
  - **SEC-CORE-01:** a caller-supplied `context`.
  - **SEC-CORE-02:** a caller-supplied `provenance.parts`.
  - They are not BLOCKING on the device threat model. The actors who can use them are the app's own code and the device owner, and the owner can already rewrite the unauthenticated record (D1).
  - Both must be closed before this line is frozen. Each fix is local, and Security re-checks only those fixes.
  - On a custody with a client it does not trust (the original V1CIB server design), both would be **BLOCKING**.

## 1. Evidence

Probes live in a new scratch directory outside the repository: `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/49a7da70-f8db-4241-9fa5-06052e22deea/scratchpad/sec-core-r1-1795034197-9434/`.
- Every probe ran at the `0b8e45a` bytes.
- While this review ran, another author changed `src/r6-index.mjs` in the worktree (it became `f3a8871`). The probes were therefore rerun with a Node resolve hook (`hook-0b8e45a.mjs`) that serves `r6-index.mjs` from `git show 0b8e45a:` (`at-0b8e45a/`). Every other `src/` file was byte-identical to `0b8e45a`.
- The expiry probe gives identical results under both.
- The five new test files `v1core-{restart,expiry,e1,voices,locale}` passed 45/45 on the worktree, which held the `f3a8871` `r6-index.mjs` at that moment.
- No git state was changed. Neither `verify-r*` nor `npm run verify` was run.

| Probe | What it shows (at `0b8e45a`) |
|---|---|
| `p-expiry.mjs` | **Post-expiry warning sign:** `CLINICAL_HUMAN_REQUIRED`, `proposal:null`, `offers:[]`, no executable run, `readinessRestart:null`; same key set as before the date, plus `authorityExpiry`.<br>**Integrity and mismatch:** tampered program gives `HOLD` (checked before authority). Catalog-binding mismatch and policy mismatch (`options.authority`) stay `UNSUPPORTED`, but carry an `EXPIRED` marker (SEC-CORE-05).<br>**Caller authority:** future-dated `options.repertoireRecords` after the date gives `MODIFY`, below and on the new entry alike (SEC-CORE-06).<br>**Device clock:** rolled back to 04-28 gives `KEEP` (SEC-CORE-08).<br>**Readiness after a standing hold, after the date:** `CLINICAL_HUMAN_REQUIRED`, no proposal. |
| `p-ns.mjs` | **Not settable by a caller:** `SESSION_NAMESPACE` is not exported by `v1-safety-index` or `r6-index`. A string option or intake field `sessionNamespace` is ignored on a first plan and on a restart.<br>**Crafted program:** a program whose `sessionNamespace` is altered and whose hash is recomputed (unkeyed) is accepted (D1 class).<br>**Forged context (B5):** a **new** report in a restarted plan, with a bare plan-A id and a caller-supplied `context`/`comparable:true`, is stored with the forged context. The control without it gets `UNPLANNED` (SEC-CORE-01). |
| `p-ns2.mjs` | A readiness declaration after a hold in a restarted plan, with a forged context on a new report: "running restarts after **1 day** without it, with a lighter entry" instead of "after **44 days**, restart from current capacity" (SEC-CORE-01: the forged field changes a re-entry decision). |
| `p-ns3.mjs` | A report naming a plan-B session id, dated 3 days before plan B starts, is bound and credited (`completed:1`, `dateShift:-3`). Pre-existing binding by label (SEC-CORE-11). |
| `p-ns4.mjs`, `p-ns5.mjs` | The namespace varies with ignored intake fields and with the instant's milliseconds, in both versions. Replaying the restart instant after plan-B reports refuses the restart (`HOLD`, record rows after the restart date), in both versions. |
| `p-custody.mjs` | Through the unchanged V1CIB custody, a client report carrying a forged `context` (`RUN:LONG`, BUILD, `runMinutes:150`) and a forged `provenance.parts` is accepted, and both are stored under the keyed chain (SEC-CORE-01/02). |
| `p-parts.mjs` | **Cross-author correction:** a device-shaped correction with `correctionOf:'ath-1'` (the athlete's id, which is also the merged row's `eventId` when the athlete reported first) passes `checkReportVoice('DEVICE')`. After it, `recovery ADVERSE→UNKNOWN`, `rpe 8→null`, `adverseSessions 1→0` (SEC-CORE-03). |
| `p-parts2.mjs`, `p-parts3.mjs` | **Own-part override:** a new athlete report whose own `provenance.parts` says it stated nothing loses its validated `ADVERSE` after a legitimate device re-sync (`adverse 1→0`) (SEC-CORE-02).<br>**Unvalidated part, conflict:** a part that disagrees flags the row as conflicted.<br>**Unvalidated part, invalid enum:** a part with an invalid enum (`nextDayFunction:'FINE'`) fills the row, and at the next review the carried row is rejected: the execution and its `ADVERSE` leave the record (SEC-CORE-04).<br>**Control:** `ADVERSE` kept. |

## 2. Answers to the dispatch questions

**(1) `v1-safety-index` precedence.** Sound for what it claims.
- *Integrity is not turned into a decision.* Program integrity is checked before authority (`HOLD`), so the wrapper never runs on a tampered program. Policy, catalog and event-extension mismatches refuse again in the reread.
- *Only one answer survives the reread.* `CLINICAL_HUMAN_REQUIRED` with `!proposal`. Any other reread answer is discarded, and errors in either step fall back to the refusal.
- *Caller authority.* `options.repertoire` is excluded. `options.repertoireRecords`, `options.authority`, `options.policy` and `options.review` are not excluded, but they already let any in-JS caller take the full authority, and that predates this candidate (SEC-CORE-06). The integration passes no options (`harness/lib.mjs` calls the engine with none), which is what makes this acceptable.
- *Expiry is the only dated authority.* Only the R7B0 repertoire carries `review_by`.
- *Residual.* The marker mislabels non-expiry refusals (SEC-CORE-05), and the device clock decides expiry (SEC-CORE-08).

**(2) Restart namespace.**
- *Not settable by a caller.* It is a module symbol, not re-exported. JSON cannot carry it across the bridge. It is checked by a regex. The restart sets it after the caller's options spread.
- *Accidental collision.* Removed for new restarts.
- *Replay with a reused or rolled-back instant.* Fails closed through the existing record-date check.
- *Forgeable only by actors who already own the data.* A crafted stored program can carry any `sessionNamespace` with a recomputed digest (D1). 40 bits can be ground through ignored intake fields and millisecond instants (SEC-CORE-11).
- *What it does not settle.* Binding still trusts the reported session id over its date (SEC-CORE-11, related to QRE-RFC-B-02).
- *New trust it introduced.* The "carried exactly as recorded" path trusts `context` on **new** reports (SEC-CORE-01).

**(3) `provenance.parts`.**
- *Carried rows.* A forged `parts` map in a carried row can inject facts and responses into a re-merge. That is the D1 record-trust question, and the same actor could edit the row directly. However, carried top-level fields are validated and parts are not (SEC-CORE-04).
- *New reports (the material gap).* New reports may also bring `provenance.parts` (and `inputHashes` and `mergedSourceIds`). These are kept and win over the report's validated content (SEC-CORE-02).
- *Cross-author corrections.* They are not refused (SEC-CORE-03).
- *Privacy.* See SEC-CORE-09.

**(4) `report-voices` as an ingest boundary.**
- *Origin.* Correctly taken from the channel argument, not from the body, as SEC-RWS-E-01 requires. A DEVICE report must also name an identified activity, and an ATHLETE report must not.
- *Gaps.* It has no call site: not in `src/`, not in custody. It is a deny-list (4 + 2 fields). It ignores the engine-owned keys (`context`, `comparable`, `partial`, `confounded`, `conflicted`, `superseded*`, `identity`, `inputHash`, `logs`, `provenance.*`). It ignores who `correctionOf` names. It accepts the body's own `source.quality` (SEC-CORE-10).

**(5) Error text.** Fixed on the main review path (`r6-adaptation`): the class name only, with no engine wording and no athlete values. Two `e.message` sites remain in `r6-legacy.mjs` (143, 332), which is in the V1 bundle graph and reachable through the same entry for a legacy-version input or program (SEC-CORE-12).

## 3. Findings

### SEC-CORE-01: CONDITION (before freeze). A new report's own `context` is admitted in a restarted plan, and it changes decisions
- `bindObservations` (r6-adaptation:209) carries "exactly as recorded" any accepted row whose id is outside the namespace and whose `context.sessionId` equals its `sessionId`. It does not distinguish a row carried from the record from a report arriving now.
- A report can therefore set `context.sessionType`, `phaseClass`, `mode`, `runMinutes` and `comparable` itself. The engine's readers consume these:
  - `firstDayWithout` (F08 readiness re-entry);
  - learned long-run maintenance (r6-adaptation:391);
  - `recent`/`learnedInterference`.
- Probes:
  - `p-ns2` changed a return re-entry from "44 days, restart from current capacity" to "1 day, lighter entry".
  - `p-custody` showed it passes the custody.
- Before this candidate, every row's context was recomputed by the engine, so this is new.
- **Resolution:** apply the rule only to rows carried in from the record (the `prior`/`actualLedger` side), or strip the engine-owned keys from every non-carried observation in `normalizeObservations`.
- **Evidence required:** a test that a new report with a forged `context` gets the engine's own context (`UNPLANNED` or bound), directly and through custody.
- **Owner:** Chief / engineering. Security re-checks the fix only.

### SEC-CORE-02: CONDITION (before freeze). `provenance.parts` is accepted from a new report and can erase the athlete's `ADVERSE`
- New observations keep their caller-supplied `provenance` (r6-provenance, `o.provenance={...(o.provenance??{}),…}`).
- The first merge then takes `previous.provenance.parts` as the truth about each report, ahead of the report's own validated fields.
- A later legitimate device re-sync rebuilds the row from those parts: `p-parts2` `ownPartOverride` gives `recovery ADVERSE→UNKNOWN`, `adverseSessions 1→0`.
- Custody stores the forged map (`p-custody`).
- **Resolution:**
  - For non-carried observations, drop the incoming `provenance.parts`, `inputHashes`, `mergedSourceIds` and `conflict` before use.
  - Build each part only from the validated report (`partOf` on the normalized row).
- **Evidence required:** a test with a forged `parts` on a new report, plus the E-1 tests unchanged.
- **Owner:** Chief / engineering.

### SEC-CORE-03: CONDITION (before integration). A correction is not bound to its author, so E-1 recurs through a cross-author correction
- The candidate states that "a correction is from its author and replaces only that author's report". Nothing enforces it:
  - `normalizeObservations` checks the chain (existence, time, identity), not the speaker;
  - `checkReportVoice` ignores `correctionOf`.
- When the athlete reports first, the merged row's `eventId` is the athlete's. A domain layer that corrects "the row" on a HealthKit sample update then erases the athlete's response (`p-parts`: `ADVERSE→UNKNOWN`, `rpe→null`, `adverse 1→0`).
- This class predates the candidate (the base erased on every correction), so it is a limit of the fix, not a regression.
- **Resolution:**
  - Refuse (`INVALID_CORRECTION_CHAIN`) a correction whose `speakerOf` differs from the corrected part's speaker. The engine already has `speakerOf`, and RWS lineage already restricts replacement to one speaker.
  - The iOS contract (§6) states that a re-sync names the device's own previous event id.
- **Owner:** engineering, with SSCTR informed (safety signal).

### SEC-CORE-04: CONDITION (before freeze, low). Parts of carried rows are not validated
- Carried rows are re-validated (`INVALID_ACTUAL`, `INVALID_RESPONSE`), but their `parts` are merged without the same checks.
- An invalid part value (`p-parts3`, `nextDayFunction:'FINE'`) fills the corrected row. The row is then rejected at the next review, and the execution and its `ADVERSE` leave the record: silent data loss after corruption.
- Part ids are not tied to `mergedSourceIds`.
- Defending against deliberate tampering is D1. Defending against corruption is not, and is cheap.
- **Resolution:**
  - Validate each part as a report (`RESPONSE` enums, numeric `actual`).
  - Require part ids ⊆ `mergedSourceIds` ∪ {`eventId`}.
  - On failure, fall back to the documented no-parts behaviour, never to a dropped row.
- **Owner:** engineering.

### SEC-CORE-05: CONDITION (before integration, low). The `EXPIRED` marker is attached to refusals that expiry did not cause
- A program bound to another catalog, or an authority with another policy, after the date: the answer stays `UNSUPPORTED`, as it should, but carries `authorityExpiry.status:'EXPIRED'` (`p-expiry`).
- An app keying the "rules need renewal" message on the marker would hide an integrity or version failure.
- The dossier's claim that "no other answer changes, by a byte" does not hold for these answers.
- **Resolution:** mark only when the reread is not itself `UNSUPPORTED`; otherwise return the refusal unmarked.
- **Owner:** engineering.

### SEC-CORE-06: CONDITION (integration, carried). Engine options are full authority overrides; the bridge must never forward them
- `repertoireRecords` with future `review_by` gives `MODIFY` after expiry, below and on the new entry alike. The same holds for `authority`, `policy` and `review`. This predates the candidate.
- The new module excludes only `repertoire`.
- **Resolution:**
  - The integration bridge calls the engine with no options, and a bridge test pins that (`harness/lib.mjs` does so today).
  - The dossier says `options.repertoire` is excluded; it should say that the other option keys are not, and that they are integration-only exclusions.
- **Owner:** engineering (integration).

### SEC-CORE-07: CONDITION (integration). Expiry and the new entry must reach the app surface
- The P0 facade still serves `V1_STRENGTH_ENGINE` (the bridge `api`), so on the device the QRE-AIF-01 fix exists only for the focal revalidation.
- `todayView`/`weekView` build sessions from the stored plan with no expiry reading. After the date, the engine prescribes nothing, but the app would keep showing the stored plan's sessions as today's work.
- **Resolution:**
  - The integration moves to `v1-safety-index` (the engine id change is an explicit envelope migration, as §5 of the dossier says).
  - The views honor the authority state (the last answer's `authorityExpiry`, and the records' `reviewBy` against the decision clock).
- **Owners:** engineering + Product/UX for the wording. Security re-checks when integrated.

### SEC-CORE-08: FOUNDER (D1 threat model). Expiry and every date gate read the caller's clock
- On the device, the decision instant is the device clock. Rolling it back evades expiry (`KEEP` on 04-28).
- The restart replay is refused by the record-date check, but a review is not.
- Whether expiry must resist the device owner (for example a monotonic "latest decision instant" kept with the envelope, or a trusted time source) belongs to the D1 custody decision and to the ADR §5 threat-model change.
- **Not decided here.**

### SEC-CORE-09: FOUNDER (G07) + engineering condition. Per-report health facts are duplicated inside merged rows
- `provenance.parts` keeps each report's `actual` (rpe, conditions, `stop.reason` incl. `SYMPTOM`, minutes, exercises), its `response` (recovery, effort, next-day function) and its declared source, in addition to the merged values.
- Superseded rows keep their own copies, append-only, for the life of the record.
- Minimization: this is the least the as-if re-merge needs. Each report's own `actual` and `response` must be kept to rebuild the row, so no field can be dropped without breaking E-1.
- **Consequences:**
  - Erasing one report (athlete deletion, a HealthKit sample deleted, or HealthKit authorization revoked) is incomplete unless it also removes that event id from every `parts` map and every superseded row.
  - Any envelope backup (D2) carries these copies.
- **Founder (G07):** retention periods and erasure semantics, including whether a revoked HealthKit source must be erased from the record.
- **Engineering condition:** any erasure or export feature is specified over event ids, including inside `parts`, before it ships.
- **Not decided here.**

### SEC-CORE-10: CONDITION (integration). `report-voices` is not yet a boundary
- No call site exists in `src/` or in custody.
- It is a deny-list, and it does not cover SEC-CORE-01/02/03.
- **Resolution:**
  - Wire it into the domain-layer ingest and into custody `submit`.
  - Make it an allow-list per channel.
  - Refuse engine-owned keys on new reports.
  - Refuse a `correctionOf` that names another speaker's report.
  - Derive DEVICE `source.quality` from the channel and the HealthKit query, never from the body.
- Origin from the channel is correct and should stay.
- **Owner:** engineering.

### SEC-CORE-11: NOTE. Namespace hardening (defense in depth)
- **(a) No shape check on read.** `validProgram` and `skeletonOf` do not check `sessionNamespace`. A program re-hashed with any string (such as `'w0-run-d1'`) is reviewed. This is D1 class. Recommended: the regex, and presence only when `canonical.restart.fromRecord`.
- **(b) Short and grindable.** 40 bits, and variable through ignored intake fields and millisecond instants. A targeted second preimage (about 2^40 work) is within reach of the device owner only, who gains nothing they cannot do by editing the record. Recommended: at least 128 bits, or refuse a restart whose namespace already prefixes a row on the record (closes collision outright).
- **(c) Binding by label.** A report naming a plan-B session but dated before plan B is credited (`p-ns3`). This predates the candidate and is related to QRE-RFC-B-02; the decision belongs to SSCTR/QRE (a date window on binding).

### SEC-CORE-12: NOTE. Residual engine message text on the legacy path
- `r6-legacy.mjs:143` (`'Malformed nested input: '+e.message`) and `:332` (`'Malformed review context: '+e.message`).
- They are in the V1 bundle graph and reachable through the same entry.
- They carry no athlete values (V8/JSC wording and source snippets), so this is determinism, not privacy.
- Recommended: the same class-only form, or refuse legacy inputs at the V1 bridge.

### SEC-CORE-13: NOTE. After expiry, the clinical answer still records
- It accepts observations, updates the athlete model and returns a `referenceState`, exactly as before the date.
- Nothing is prescribed or proposed (verified).
- Whether learning should continue while authority is expired is SSCTR/Founder, not Security.

## 4. Separation

**Technically fixed (verified at `0b8e45a`):**
- **QRE-AIF-01 precedence:** the clinical route answers after expiry; nothing prescribed, proposed or planned; integrity first; `options.repertoire` excluded.
- **QRE-AIF-02:** session ids collide no more for restarts made from now on; the namespace cannot be set by a caller; replaying a restart instant is refused.
- **E-1:** a same-author device re-sync keeps the athlete's statement.
- **QRE-P0-03:** fixed on the main review path.
- **Locale order:** no security content.

**Stays limited (conditions with owner and trigger):**
- **Before freeze:** SEC-CORE-01, -02 and -04.
- **Before integration:** SEC-CORE-03, -05, -06, -07 and -10.
- **Notes:** SEC-CORE-11 to -13.
- **Already in the dossier:** plans restarted under an earlier engine and older merged rows keep their limits (dossier §5).

**Founder decisions (not decided here):**
- **D1:** custody chain and HMAC on the device, record and program tamper resistance, and trusted or monotonic time for expiry (SEC-CORE-08; context for -04 and -11a).
- **G07:** retention and erasure of per-report health facts, including revoked sources and backup (SEC-CORE-09).
- **D2:** backup scope.

**New Security review needed:**
- A narrow re-check of the fixes for SEC-CORE-01, -02 and -04.
- The focal integration review already listed in the AIF readiness report (ADR §5 threat-model change), covering SEC-CORE-03, -05, -06, -07 and -10 as integrated.

## 5. Gate scope

- This verdict holds for `0b8e45a` only.
- A change to `r6-adaptation.mjs` (`bindObservations`), `r6-provenance.mjs` (`normalizeObservations`), `v1-safety-index.mjs`, `boundary/report-voices.mjs` or `boundary/custody.mjs` invalidates the parts of this verdict that depend on it.

## 6. Does `f3a8871` change any finding?

**No.**
- `f3a8871` changes only the namespace input: the caller's raw intake instead of the post-`restartIntake` intake, plus the same UTC instant.
- Rerun on both:
  - **Values:** the namespace values differ (`r1670a9b911` at `0b8e45a`, `r404a1c3300` at `f3a8871`, same scenario).
  - **Forgeability:** unchanged. A caller still cannot set the value, and in both versions it varies with ignored intake fields and with the instant's milliseconds (`p-ns4`), so the 40-bit grinding note (SEC-CORE-11b) applies equally.
  - **Collision:** same intake at the same instant gives the same namespace in both. That is the intended idempotent replay.
  - **Replay:** a replayed or rolled-back restart instant after new reports is refused by the record-date check in both (`p-ns5`).
- **One effect:** under `f3a8871` the namespace no longer depends on the record. Two restarts with byte-identical caller intake at the same millisecond collide whatever the record holds. The only way to reach that is the same-instant replay, which `p-ns5` shows is refused once the record has moved past it. With the uniqueness check recommended in SEC-CORE-11b, neither version depends on it.
- SEC-CORE-01 and -02 do not depend on how the namespace is derived. They hold on both.
