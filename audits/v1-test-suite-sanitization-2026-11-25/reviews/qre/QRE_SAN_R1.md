# QRE_SAN_R1: independent QRE and security review of the V1 test-suite sanitization

- **Reviewer:** independent QRE/Security (I am not the author). I tried to break the author's claims, not to confirm them.
- **Revision reviewed:** `7254984` (branch `claude/v1-test-suite-sanitization`). It sits two commits over `90452b8`: `2c527f7` is the code, `7254984` the docs and manifest text.
- **Environment:** Node v24.19.0, macOS. All runs used detached scratch worktrees of `7254984` under `/private/tmp/claude-502/`, each with a copied `node_modules`. They have been removed. I wrote nothing in the review worktree except this file.

## Verdict: READY_WITH_CONDITIONS

The central claim holds, and I verified it independently.

| Claim | Status |
|---|---|
| No runtime byte changed | Verified |
| All 53 delegated tests are green at the commit they belong to | Verified |
| All 53 fail on head | Verified |
| No other test fails | Verified |
| Counts: 1950 active, 1950 pass, 0 fail | Verified |

I sampled 22 entries adversarially and agree with all 22 classifications.

### Conditions

There is no BLOCKER and no HIGH. The conditions are three MEDIUM findings plus one scope risk.

- **QRE-SAN-02 (gap):** one partially superseded test (H26) leaves still-valid safety assertions with no active test. The assertions hold on head today, so this is a gap, not a regression.
- **QRE-SAN-01, QRE-SAN-03 (runner):** both are runner weaknesses. Neither is exploited on the current tree, but each falsifies a guarantee the runner states.
- **QRE-SAN-04 (scope risk):** the new integrity scope removes a protection the suite had before. Any edit or deletion of an active test, and any growth of the manifest, now passes `npm test` with no record.

Condition for promotion: fix QRE-SAN-02, and either fix QRE-SAN-01, 03 and 04 or record them explicitly as accepted risks.

## What I ran

| Check | Result |
|---|---|
| `npm test` (scratch worktree, `7254984`) | `ACTIVE SUITE: 1950 active tests, 1950 pass, 0 fail. HISTORICAL: 53 tests delegated …; on this tree 53/53 of them fail, as declared.` Exit 0, 5 min 11 s. node's own count is 1971 = 1950 + 8 helper modules + 13 files whose tests were all filtered out (reported as file-level entries). |
| `node scripts/suite-historical.mjs --json …` (all entries) | `HISTORICAL SUITE: 53/53 historical tests pass at the commit they belong to (16 commits)`. Exit 0. Each test file's bytes at its commit match `fileSha256`. |
| Raw `node --test` on head, unfiltered, junit (an independent cross-check of the runner, with no skip patterns) | 2011 entries = 8 helper modules + 2003 real tests. Exactly 53 do not pass, and they are exactly the 53 manifest `(file, title)` keys. No other test carries a manifest title. There are no nested tests (`<testsuite>` count 0), so the QRE-SAN-01 loophole is not used today. |
| Reconciliation | 1985 real tests in the evidence `junit-90452b8.xml` (1993 − 8 helper modules; 51 failing), plus 18 added (13 boundary-safety + 5 integrity) = 2003. 2003 − 53 = 1950. Confirmed. |
| `git diff --name-status 90452b8 7254984` | Every entry is `A`, except `M CoachingCore/package.json` (scripts only). Nothing under `CoachingCore/src`, `CoachingCore/v1`, `fixtures/`, the lockfile, `scripts/v1-*.mjs`, the five-zone parity mission's audit folder (`audits/v1-hr5-runna-parity-2026-11-25/`, which holds the bundle) or any existing test file. `90452b8` is an ancestor of `7254984`. |
| Every `supersededBy` | Each names an existing audit path. Its leading commit exists. `belongsTo` is an ancestor of `firstFailedAt` for all 53 entries. |
| Mutation of `src/r6-provenance.mjs` (other voices not inherited on a correction, `if(others.length)inherited=` changed to `if(false)…`) | 4 boundary-safety tests go red: the three E-1 tests and the symptom-stop test. The 9 others stay green, as expected for this mutation. |

## Entries verified (item 1, item 2)

I checked every entry carrying a `safetyPoint` (17) and 5 FREEZE_RECORD entries (H01, H24, H29, H52, H53). For each I did four things:

- read the failing assertion and ran the test alone on head (exact anchored pattern);
- confirmed it green at `belongsTo` (historical suite run above);
- located the supersession in that mission's ledger or report;
- compared the successor with the frozen body.

Where a successor re-runs the frozen file from a temporary copy, the substitution is stated. Those successors replace one string that must occur exactly once, and require exit 0, exactly N pass and 0 fail. Every other assertion of the frozen test therefore still runs.

| ID | Verdict | Fails on head at | Superseded by (documented in) | Successor: substitution and strength |
|---|---|---|---|---|
| H03 | AGREE | restart-sizing:228. `recent` is 0/0 where the unbounded 600/7 was pinned; the defect is closed. Next pin :238 (P4) is also superseded. | `audits/v1-core-cf011-r2-2026-11-18/SUCCESSOR_LEDGER.json` entries[0] | Separate tests A3-A4 (shape, equality with a direct "not done", JSON round trip), A5 and B1-B2. Stronger. |
| H04 | AGREE | restart-sizing:270. `[READY, undefined, 11-04]` where `[READY, true, 10-21]` was pinned; the SB-1 question is now asked. | same ledger, entries[1] | D1 and D2. I re-ran H04 on head with only part (b) inverted: it passes, so part (a) still holds. Stronger. |
| H06 | AGREE | restart-evidence:112. The pause is `{weeks:0, RUN:3}` where `null` was pinned. | `audits/v1-core-sc-2026-11-20/SUCCESSOR_LEDGER.json` entries[1] | Copy of A12, only :112 replaced. :110 (one row, conflicted) still runs. As strong. |
| H07 | AGREE | restart-evidence:144, last assertion only: 3 where 13 was pinned. | same ledger, entries[2]; the contract is corrected in `7254984` (SSCTR decision A) | Copy. Only the `direct(3)+run(13)` line is replaced, by `[3, recent equals that of run(13) alone]`. The "not done" assertions still run. Stronger: it adds the dose check. |
| H08 | AGREE | restart-evidence:156. "another kind of conflict" gives 11-07 where `null` was pinned. | same ledger, entries[3] | Copy. Only the `other` line is replaced, plus a loop over EVENT_ID_REUSED and ACTIVITY_BOUND_TO_TWO_SESSIONS (still none). Single-voice and two-voice still run. Stronger. |
| H09 | AGREE | restart-evidence:290, first assertion: no orphan is written any more. | `audits/v1-core-sec-r2-2026-11-19/SUCCESSOR_LEDGER.json` entries[0] | "SEC-R2-01 successor" and C1 (stored orphans through restartIntake and restartProgram). I re-ran H09 on head with only its first assertion inverted: it passes, so the remaining assertions hold. Stronger. |
| H13 | AGREE | ncc-normalization:101. `excluded` is `[]` where `[IDENTITY_QUARANTINED_BY_CONFLICT]` was pinned. | `audits/v1-core-o1-2026-11-19/SUCCESSOR_LEDGER.json` entries[0] | Copy, :101 replaced by `[[], ['W:EXACT_REPLAY']]`. The re-read loop still runs. As strong. |
| H16 | AGREE | o1-conflict:152. The pause is `{weeks:0,…null}` where `null` was pinned. | `audits/v1-core-sc-2026-11-20/SUCCESSOR_LEDGER.json` entries[0] | Copy, :152 replaced by pause(l2) = pause(clean) ≠ pause(single voice). The never-dose assertions still run. As strong; see QRE-SAN-09 (c). |
| H20 | AGREE | fix-forward:105. `conflicted` is true where false was pinned. | `audits/v1-core-o1-2026-11-19/SUCCESSOR_LEDGER.json` entries[3] | Copy, `[1,'app-fix',false,null,` changed to `true`. Every screen, duplicate, legacy and other-athlete assertion still runs. As strong. |
| H26 | AGREE (classification), **gap** | v1int-authorship:149 ("QRE-INT-02 as it stands"): the receipt fact is no longer kept. | `audits/v1-blocker-closure-2026-11-24/FINAL_REPORT.md` :61, :125 | Hand-written `v1bc-blocker-closure.test.mjs:101`. Stronger on QRE-INT-02 itself, but it **drops the still-valid :144-:147**. See QRE-SAN-02. |
| H27 | AGREE | v1int-cycle1:110. LIMITS has the new key `safetyExcess:3`. | same report :62 | `v1bc:231`, the same strict deepEqual of the whole LIMITS object, plus the new key. As strong. The behaviour is covered by SEC-INT-07. |
| H30 | AGREE | v1rfc-cycle:107. The new plan's ids are no longer old ids. | `audits/v1-core-safety-closure-2-2026-11-18/successors/SUCCESSOR_LEDGER.json` (QRE-CORE-R2-02) | Generated copy. "Ids collide" becomes "namespaced, none an old id, each maps back to one". An as-if equality is added. Stronger. |
| H32 | AGREE | v1rfc-evidence:240. `[ADVERSE,null]` where `[UNKNOWN,REPORT_NOT_CARRIED]` was pinned (E-1 open). | closure-2 ledger | Expected value flipped. Adds an as-if equality and an excluded-count check that keeps the loop from being vacuous. Stronger. |
| H38 | AGREE | v1rws-final-fix:133. DISTANCE_DISPUTED where REPORT_NOT_CARRIED was pinned. | closure-2 ledger (SSCTR C-C1) | 4 substitutions plus 5 appended lines. The credit change (11 km complete becomes 6.6 km partial) is documented and was reviewed by SSCTR. Stronger. |
| H39 | AGREE | v1rws-fix-forward:100. Same as H38. | closure-2 ledger | Same pattern. Stronger. |
| H40 | AGREE | v1rws-fix-forward:298. `conflicted` is true where false was pinned. | closure-2 ledger, `CYCLE1.md:17`; the O-1 ledger | Two-step chain (the closure-2 copy, which is H20, then `v1core-o1-successors:44` re-running it with `false` changed to `true`). The whole body is re-executed. Stronger. |
| H50 | AGREE | v1rws-lineage:609 ("E-1 stands"): `[ADVERSE,HARDER,1]` where `[UNKNOWN,UNKNOWN,0]` was pinned. | closure-2 ledger (C-C1, L5) | 3 substitutions. The after-state must equal the merged control, which is still pinned literally. Stronger. Also covered by the 3 boundary E-1 tests, which are mutation-sensitive. |
| H01 | AGREE | v1bc-rc-record:15: "CHANGED and not declared: package.json, scripts/suite-*.mjs, … later amendments". | 503945a, `audits/v1-final-physical-2026-11-24/FINAL_REPORT.md` | Integrity test 1 (current runtime = the bytes amendment-2 binds) and test 3 (records sealed). These assert the current contract. |
| H24 | AGREE | v1hr5-amendment-record:19. The amendment-1 verifier fails on amendment-2's declared files and on the infra files. | f363a25 / 23f6a86, the five-zone parity mission's audit | Integrity test 5: amendment-1 and the original freeze fail only on what amendment-2 declares, plus INFRA. As strong. |
| H29 | AGREE | v1rc-calibration:325. FREEZE-1 bound files differ (later amendments plus package.json). | the bcac30d line | Integrity test 1. |
| H52 | AGREE, with note | v1hr5r-successors:23. "CHANGED and not declared": only this mission's INFRA files. | **this mission** (`2c527f7`) | Integrity test 4. It is weaker in form: see QRE-SAN-09 (a). It is equivalent in substance through tests 1 and 3. |
| H53 | AGREE | v1hr5r-successors:41. The same infra files are undeclared to amendment-2. | **this mission** | Integrity test 5. Same check, with INFRA allowed. |

## Findings

### QRE-SAN-01: MEDIUM. A failing active subtest whose name equals a manifest title is hidden from both phases

**Where:** `CoachingCore/scripts/suite-active.mjs:44` (phase 1 `--test-skip-pattern`) and `:56` (phase 2 `--test-name-pattern`).

**What goes wrong:** the header at `:9-11` claims that phase 2 shows "every manifest title matches exactly one test … and no other test anywhere". That does not hold for subtests:

- **Phase 1:** node's skip filter matches a test's own name, an ancestor's name, or the joined "ancestors + name". So a subtest named like a manifest title is filtered out of phase 1.
- **Phase 2:** a `test()` parent that does not match the name pattern is itself filtered. Its subtests are never discovered, so they never appear in the phase 2 report.
- **Result:** the failing subtest appears in neither report, and the exit code is 0.

`describe()` is not affected: suites always run for discovery, and that case is caught.

**Reproduction** (minimal harness: the two runner scripts, one historical test `HIST one` that fails, its successor, and a manifest):

```js
// test/x.test.mjs: either variant
test('wrapper', async t => { await t.test('HIST one', () => { assert.fail('active failure'); }); });  // own name
test('HIST',    async t => { await t.test('one',      () => { assert.fail('active failure'); }); });  // joined name
```

`node scripts/suite-active.mjs` gives `ACTIVE SUITE: 3 active tests, 3 pass, 0 fail … 1/1 of them fail, as declared.` Exit 0, for both variants. The `describe('HIST',()=>it('one',…))` control is correctly flagged ("a manifest title also matches a test it does not list").

**Not exploited today:** the unfiltered head run has no nested tests, and no other test carries a manifest title.

**Fix:** drop filter-based exclusion. Run the suite once, unfiltered, with junit, and account from the report:

- the failing set must equal the manifest keys exactly (file, title, top level);
- every other entry must pass;
- every successor must pass;
- there must be no skip, no todo and no load failure.

This also merges phases 1 and 2 and removes the skip/name asymmetry entirely. If filters are kept, at least require in phase 2 that no matched or filtered test is nested. For example, run phase 2 also with the parent names, or compare against an unfiltered listing.

### QRE-SAN-02: MEDIUM. H26 (tm-5) leaves four still-valid assertions with no active test

**Where:** `CoachingCore/test/v1int-authorship.test.mjs:144-147`, against the successor `CoachingCore/test/v1bc-blocker-closure.test.mjs:101-112`.

The historical test fails only at `:149`, the QRE-INT-02 pin. Before that point, it asserts four things:

- `:144`: the screen handed to the engine is the athlete's last screen, byte for byte. This is SEC-INT-01, "a delivery carries the last screen of the athlete exactly", from its title.
- `:146`: `decision.missingInputs` equals `['eligibility.currentAssessment']`.
- `:147`: `recorded.length === 0`.
- `:147`: the activity reason is `NOT_RECORDED_BY_THIS_DECISION`.

The successor asserts ASK and `NOT_RECORDED`, but none of these four. No active test reads the engine input's `eligibility`: grep for `input.eligibility` hits only the historical file. `:150` ("the device states no screen") is covered by `v1int-cycle1.test.mjs:41`.

**Reproduction:** a scratch test re-asserting `:144-:147` (with `:149` inverted) on head passes 1/1. So the behaviour holds today, but no active test protects it.

**Fix:** add the four assertions to the device-route successor. Alternatively, write a copy-and-substitute successor of tm-5 that inverts only `:149`, as `v1core-o1-successors` does.

### QRE-SAN-03: MEDIUM. Phase 2 accepts any failure, not the declared one

**Where:** `CoachingCore/scripts/suite-active.mjs:60-63`.

A historical test only has to "fail". This matters in two cases:

- **Hand-written successors (H26 today):** if a still-valid assertion that runs before the declared failure point regresses, the test still fails, and phase 2 still reports "fails, as declared".
- **PINNED_DEFECT entries:** the "the defect is back" alarm fires only if the whole test passes. A defect that returns together with any other incompatibility stays silent.

`FAILURE_INVENTORY.md` already records the expected failing line for each entry.

**Fix:** pin a failure locator per entry in `HISTORICAL_TESTS.json`: the test file line of the failing assertion from the junit `<failure>` stack, or a digest of the assertion message with volatile parts removed. Phase 2 then requires that locator.

### QRE-SAN-04: MEDIUM. Active tests and the manifest are no longer protected by any record

**Where:** `CoachingCore/test/v1san-runtime-integrity.test.mjs:27` (`INFRA`), together with H52 being made historical.

**Before this mission:** H52 (the amendment-2 verifier, "nothing else changed in CoachingCore since 4850560", tests included, `scripts/v1-hr5-runna-amendment.mjs:76-80`) made any edit, deletion or addition under `CoachingCore/test/` fail `npm test`.

**Now:** `test/**`, including `HISTORICAL_TESTS.json`, is INFRA. Three things therefore pass `npm test` with no record:

- weakening or deleting any active test, including the boundary-safety tests and the successors;
- delegating a regressed test, by adding a manifest entry with a passing successor;
- changing the `test` script.

`test:historical` is not part of `npm test`, so even a false `belongsTo` is not caught by the gate.

**Reproduction:** in a scratch worktree, remove the `no report in force` assertion from `v1bc-blocker-closure.test.mjs:105` (the H26 successor), delete `test/v1core-freeze.test.mjs`, and stage both. `node --test test/v1san-runtime-integrity.test.mjs` gives 5/5 pass. Deleting the H11 file is caught by the runner's pinned-bytes check, but the weakened successor is not caught by anything.

The runtime itself remains protected: see the integrity-scope assessment below. What is lost is the immutability of the tests.

**Fix:**

1. Make `test/` append-only against a sealed anchor: every test file present at the anchor must be byte-identical, unless a reviewed record lists it.
2. Pin the manifest's entries digest, and the active test inventory (file and title set, which the evidence already holds as `titles-90452b8.json` and `titles-added.json`), in a record outside INFRA (for example under `audits/…`) that the integrity test checks.
3. Run `test:historical` whenever the manifest changes.

Item 2 also closes the "a file that `process.exit(0)`s mid-run silently loses tests" hole, which today is inherited from plain `node --test`.

### QRE-SAN-05: LOW. The policy overclaims what a green `npm test` proves

**Where:** `audits/v1-test-suite-sanitization-2026-11-25/HISTORICAL_TEST_POLICY.md:54`.

The policy says "A green active suite means … every superseded test is green in its own version". `npm test` does not run the historical suite; only `npm run test:historical` does, and nothing gates on it. The same line also links `FINAL_REPORT.md`, which does not exist at `7254984`.

**Fix:** reword §6, or make the gate include the historical run when the manifest or a historical file changes. Fix or remove the link.

### QRE-SAN-06: LOW. Three boundary-safety tests assert less than their titles claim

**Where:** `CoachingCore/test/v1san-boundary-safety.test.mjs:110` and `:148-155`.

- **(a) `:110` "another athlete …":** the intruder is not enrolled, so both calls fail with `NOT_ENROLLED`. The test proves only that an unknown actor is refused. The meaningful case is an enrolled second athlete in the same integration and store. I probed it on head: the import is OK into the intruder's own record, the `correctionOf` the victim's event is `CORRECTION_TARGET_NOT_FOUND`, and the victim's rows and version are unchanged. So isolation holds, but the active test does not cover it.
- **(b) `:148`:** the title says "a reused request id replays". No assertion exercises a reused `clientRequestId`.
- **(c) `:153`:** the rollback and tamper checks sit inside `if(typeof raw==='string')`. If the store stopped exposing `raw`, they would be skipped silently. `memoryStore` exposes it today, so they do run.

The E-1, O-1, duplicate and stop tests are meaningful. The E-1 and stop tests are proven mutation-sensitive (see "What I ran").

**Fix:** use an enrolled intruder; add the replay assertion; replace the `if` with `assert.equal(typeof raw,'string')`.

### QRE-SAN-07: LOW. Wrong `firstFailedAt` for H52/H53; the validator does not check it

**Where:** `CoachingCore/test/HISTORICAL_TESTS.json` (H52, H53), and `CoachingCore/scripts/suite-manifest.mjs:19-35`.

Both entries record `firstFailedAt.commit = 90452b8`, the same commit as `belongsTo`, where the historical suite shows them green. They first fail at `2c527f7`.

`manifestErrors` accepts this because it checks only the format of `firstFailedAt`. Nothing checks `belongsTo ≠ firstFailedAt`, or that `belongsTo` is an ancestor of `firstFailedAt`, which is an ancestor of HEAD. I checked that ordering with git for all 53 entries: it holds for all of them, and it is satisfied with equality here.

**Fix:** correct the data. Have `suite-historical.mjs` assert the ancestry and inequality, and optionally that the test fails at `firstFailedAt`.

### QRE-SAN-08: LOW. A skipped test titled with its own file path is mistaken for a file-level entry

**Where:** `CoachingCore/scripts/suite-manifest.mjs:51`.

`fileLevel` is decided by `name === 'test/'+rel || name === file`.

**Reproduction:** `test('test/x.test.mjs',{skip:true},()=>assert.fail())` in `test/x.test.mjs`. `suite-active` reports `2 active tests, 2 pass, 0 fail`, exit 0; node itself reports `skipped 1`. A failing test with that title is still caught, as a "load failure", so the case is contrived.

**Fix:** treat a skipped or todo file-level entry as a problem. Alternatively, identify file-level entries structurally: node writes them for files with no reported test, so cross-check against the discovered file list.

### QRE-SAN-09: NOTE. Precision items, all failing closed or harmless

- **(a) H52's successor (integrity test 4):**
  - It checks only that the verifier's stderr lines are `CHANGED and not declared` or `UNTRACKED`, naming INFRA files. Because the verifier exits at `scripts/v1-hr5-runna-amendment.mjs:94` when `bad` is non-empty, its record comparisons at `:111-116` (enabling state, recorded diffs, bundle) never run on this tree.
  - H52's explicit stdout pins are also dropped: both records byte-identical, run calibration byte-identical, `ENABLED by`.
  - All of this is implied by integrity tests 1 and 3, since `fiveZoneAuthority()` is a pure function of bound bytes with no time dependence.
  - Suggested fix: assert `fiveZoneAuthority().approved === true` and the run-calibration hash directly.
- **(b) Unclear output on a parent failure:** a parent test that fails after its subtests pass gets no `<failure>` in junit. `suite-active` prints "0 fail", but it still exits 1 through `p1.status`. This fails closed, but the summary should say why.
- **(c) H16's successor is less specific:** it distinguishes "an occurrence within the window" from "none", but not the occurrence day. The day is covered by the H06 and H07 successors and B1-B2.
- **(d) Small manifest inaccuracies:**
  - H26 is filed as category A (`CONTRACT_SUPERSEDED`), but its own title and contract say "QRE-INT-02 (open) pinned", which makes it B (`PINNED_DEFECT_CLOSED_LATER`).
  - H40's `supersededBy` names only `CYCLE1.md`; the O-1 ledger is where today's failure is documented.
  - The manifest `line` field points at the test, while the ledgers cite assertion lines.
- **(e) Parser decoding:** `parseJunit` decodes a title that literally contains `&quot;` into `"` (reproduced). This fails closed, as "matched 0 times".
- **(f) Evidence missing from the reviewed revision:** the mutation evidence cited for H50 and the E-1 safety points, and `REGRESSION_REPORT.md`, were untracked during this review, so they are not part of `7254984`. While I was reviewing, the author committed `02d9716` on top. It says it commits that evidence and makes the runner enforce `alsoCoveredBy`. I have **not** reviewed `02d9716`; this review covers `7254984` only.

## Item 4: integrity-test scope

- **Nothing runtime is reachable through INFRA.**
  - No file under `CoachingCore/src` imports or reads anything under `test/`. The only `test/` string is a comment in `src/boundary/integration.mjs:5`.
  - The JavaScriptCore bundle is pinned by hash (test 1).
  - `package.json` fields other than `scripts` are pinned, earlier scripts are unchanged, and the lockfile is byte-identical to `90452b8` (test 2).
  - No node-discovered test file lives outside `test/`.
- **Coverage gap in test 1, closed by test 4.** The runtime's statically imported JSON (`fixtures/authority-bundle.json`, `SHADOW_INPUT_SCHEMA.json`, `r2/*.json`) is not in `consumed()` and not in the amendment-2 `files`, so test 1 does not cover it. A change to those files is caught by test 4: the verifier's `git diff --name-only 4850560 -- CoachingCore` names them, and they are not INFRA.
- **Conclusion:** a runtime-affecting change cannot pass the integrity test through the INFRA class. The residual risk concerns test immutability and governance, not runtime bytes (QRE-SAN-04).

## Item 3: runner probes that held

The runner correctly fails on each of these:

- a title collision with a test in another file ("also matches a test it does not list");
- a collision under `describe`;
- a failing `todo`;
- `test.only` (ignored without `--test-only`, so the other tests still run);
- an active `skip`;
- a file that fails to load;
- a late subtest after its parent ends;
- a parent that fails after its children (by exit code);
- a manifest with an id, key or self-successor repeated, or a successor that is itself historical (by code reading);
- titles containing `"`, `>`, `&`, `<` and regex metacharacters.

The `exactPattern` escaping is complete for node's `new RegExp(str)` parsing.
