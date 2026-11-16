# QRE review R1 — V1STR candidate (strength corrections N1, N2, N4, N3)

- **Judge:** Quality & Reliability Engineer 1.3.0, independent instance (claude-opus-5-5, effort xhigh). I did not author the candidate; the author is the Chief (Fable 5.2). This is a judge's record, not a fix: nothing outside `reviews/qre/` was edited.
- **Candidate:** branch `claude/v1-strength-corrections`, commit `21838cb`, base `2dfa216` (COACHINGCORE-V1-RACE-FORECAST-FREEZE-1). Judged bytes (sha256 prefix): `src/r7b-repertoire.mjs` 6bd4f365…, `src/v1-strength.mjs` 7e5eb85b…, `src/v1-strength-index.mjs` 937a0839…, `v1/STRENGTH_EXTENSION_V1.json` e375a8be…, `scripts/v1str-freeze.mjs` 06672449…, author record `V1STR_CANDIDATE.md` dc5f2d4c….
- **Environment:** Windows 11, Node 24.19.0. Joint suite and `--preserved` run in the worktree (read-only; worktree clean afterwards). Everything else in scratch clones of the repository (`21838cb`, `2dfa216`, five mutation slots, one freeze-rehearsal clone with a TEST-ONLY enabling record). No recursive deletion was used anywhere.
- **Probes:** `reviews/qre/probes/qre-*.mjs` (read-only, run from `CoachingCore/`), their outputs in `probes/outputs/`, and the scratch-only rehearsal and mutation drivers in `probes/scratch-only/` (they refuse to run outside a scratch clone).

## Verdict: NOT_READY

One BLOCKING finding: the N4 "plan in force keeps the slot as built" mechanism re-anchors on a fallback, so after a permanent equipment loss and a later regain the plane slots stay on band or bodyweight configurations (or lose the vertical) for the rest of the plan, where the frozen engine returns to external configurations and a new plan returns to the vertical (QRE-STR-A-01). Freezing it would bake the defect into the authorized bytes of a frozen file. The fix is bounded (the anchor written into `planeAlternation.built`). Five CONDITIONS (A-02, A-03, A-04, A-05, A-08) can be closed in the corrective cycle or recorded; A-04 and A-05 belong to integration.

What holds, measured by me: off-identity (V-EXT-01) over 432 plans and 70 reviews/restarts; the frozen entry points are byte-identical to `2dfa216` for callers without options (360 answers, one digest); caller rule injection is stripped on every path I tried; authority fails closed on 13 record variants; N1 leaves no hold anywhere on every path tried; N2 and N4 change only upper rows, N1 only trunk accessory rows, over 486 plans; runs, week shape, phases, blocks, arrangement and interference are untouched; N3 matches the catalog oracle on 1,728 weeks and nothing reads it; the joint suite is exactly 1581/1583 with the two named historical failures.

## Findings

| id | severity | statement | reproduced in |
|---|---|---|---|
| QRE-STR-A-01 | BLOCKING | N4 in a plan in force: `planeAlternation.built` is rewritten from the slot's natural pick on every rebuild (`built:natural.list[0]?.id`), so once the built configuration stops fitting, the fallback becomes the new anchor and is kept after the built one fits again. Two recorded permanent EQUIPMENT_CHANGE events, full gym → bands only → full gym (INTERMEDIATE, 2 days): with the rules FULL_B ends on `band-row` + `push-up` for the rest of the plan; without them (OFF) it returns to `db-row` + `db-bench-press`; a new plan would give `lat-pulldown` + `db-overhead-press`. Full gym → no equipment → full gym: FULL_B:2 stays `push-up` (OFF `db-bench-press`); full gym → machines → full gym: FULL_B:2 stays `machine-chest-press` (the vertical never returns). The rule changes slots relative to the frozen engine, contrary to the code comment and D-2 ("keeps the configuration it was built with while that one fits … the rule never changes a slot"), and against the intent of SQ-4 c3 (never EXTERNAL down to BODYWEIGHT, ASSISTED or BAND because of the plane rule) and c5. Under RUNNING_SUPPORT it also defeats N2 in that slot. Bounded fix: keep the in-force anchor (`S.inForce[key]`) as `built` when there is one. | `qre-b-selection-paths.mjs` case B1 (output `qre-b.json`); `qre-b2-anchor-variants.mjs` (output `qre-b2.txt`) |
| QRE-STR-A-02 | CONDITION | N1 with a trunk set-aside in a bodyweight plan with CORE templates (5 days; dead-bug set aside for SKILL_MISMATCH or preference): the CORE template's second TRUNK slot is left unfilled (6 → 5 trunk rows a week) and the gap is not declared: the plan's `MOVEMENT_PATTERN_UNAVAILABLE` still lists only PULL and the answer carries no disclosure; only the template's `missingPatterns` holds it. OFF fills it with a plank. SQ-1 c3 / V-EXT-06 ask for a filled slot or a declared gap (B0-C09). The plan's negotiation is the one written at generation and is not recomputed by this review; I did not verify how review-time gaps of other patterns are declared, only that N1 makes this one reachable for TRUNK. | `qre-f-trunk-gap-and-binding.mjs` (output `qre-f.txt`) |
| QRE-STR-A-03 | CONDITION | `v1str-freeze.mjs --preserved` (and `--write`) never check the four earlier freeze records against their committed bytes, and (iv) excludes them. Rehearsed: (a) a field added to `RUNTIME_FREEZE_V1RFC_1.json` → exit 0; (b) the runtime-read `audits/v1-run-extensions-2026-11-13/phase-b/reviews/ssctr/SSCTR_V1RFC_RUN_RECORDS.json` changed (a disposition) with its hash updated in that record → "163/163 files byte-identical", exit 0, committed or not. `--check` catches a record change only after a write. Pin the four record hashes (or compare with `git show 2dfa216:<record>`) before any `--write`. I confirmed the records are unchanged at `21838cb` (`git diff 2dfa216 21838cb -- CoachingCore/v1` shows only the values file). | `scratch-only/freeze-rehearsal.mjs` (output `freeze-preserved-rehearsal.json`) |
| QRE-STR-A-04 | CONDITION (integration) | The plan's binding (`program.repertoire.strengthExtension`) is enforced only by `v1-strength-index.mjs`. Through the frozen entry points (`v1-index.mjs`, which custody calls today, and `v1-run-forecast-index.mjs`) a plan built under the rules is reviewed without them and without refusal, and an equipment change through `v1-index.mjs` brings `front-plank` back into a plan built under N1. Integration (D-11) must route every plan carrying the binding through the strength entry point. | `qre-e-frozen-entry-points.mjs mixed`; `qre-a-off-and-authority.mjs` (`planUnderRulesViaFrozenEntryPoints`) |
| QRE-STR-A-05 | CONDITION (integration, SSCTR to note) | D-1 + D-9: any change in the selection-boundary state (a record withdrawn, added or vetoed; other values bytes) strands every plan in force: each review answers UNSUPPORTED, including one carrying a fresh warning sign (pain → UNSUPPORTED, not CLINICAL_HUMAN_REQUIRED; a hold already recorded still answers first). This mirrors the frozen event-extension mismatch, so it is consistent engine behaviour, but the candidate adds four new triggers. Integration needs a restart path for stranded plans and must not rely on the engine's clinical route for them. | `qre-a-off-and-authority.mjs` (`withdrawnRulesFreshWarningSign`, `underRulesFreshWarningSign`) |
| QRE-STR-A-06 | OBSERVATION | The amended frozen file makes the frozen entry points read a `strength` field on a caller-supplied repertoire authority, which was inert at `2dfa216`: through `v1-index.mjs` the plan hash changes (29f0b2dd… → 10a89640…), dead-bug and front-plank leave the plan, and a malformed binding `strengthExtension:{id:null,sha256:null,boundaries:[]}` is recorded. Development/test path only (D-12; an integration passes no options), but the amendment's own text "without the key every authority, binding and selection is exactly as before" is not literally true. Carrying the rules under a Symbol rather than a JSON field would close it. | `qre-e-frozen-entry-points.mjs hash`, run in a `2dfa216` clone and a `21838cb` clone |
| QRE-STR-A-07 | OBSERVATION (SSCTR to dispose) | D-6 understates the dose consequences. Over 432 lifter plans, N4 changes the dose of exercises it did not select: `db-row` (282 rows) and `seated-cable-row` (144 rows) go from FROM_LOG ×8 to an establishment path with ×10 that lasts to the last week, and `lat-pulldown` (112 rows, selected) changes shape (1×12 establish vs 2×8), in 66 plans, all NONE or NOVICE. N1 changes the replacement trunk row's set count (front-plank ×1 → dead-bug ×2) and session minutes (+2 to +3) in 2,160 / 2,242 sessions. No session exceeds the athlete's strength minutes (0 of 31,104, with and without the rules); N2 alone changes no set count. | `qre-c-preservation-differential.mjs`, `qre-c2-dose-detail.mjs` |
| QRE-STR-A-08 | CONDITION | Mutation testing: 52 of 74 mutants killed; 15 non-equivalent survivors, of which eight leave a claimed behaviour untested: R18 (nothing preferred once the in-force configuration no longer fits), V05 (record independence), V17 (novice-set anchors), V25 (executed PRACTICE never counted), X03 and X15 (caller rules stripped from `authority.repertoire` and from an inherited field), X19 and X20 (errors contained). Add tests that kill them. | `scratch-only/mutate.mjs`, `scratch-only/mutants.mjs`, output `mutation-summary.json` |
| QRE-STR-A-09 | OBSERVATION (pre-existing scope) | `outside()` of the freeze verifier covers `src, v1, test, scripts, r6, r7, fixtures, package*.json` only. Committed changes to the runtime-read `CoachingCore/r5/PROGRAM_POLICY_R5.json` and `r4/PRESCRIPTION_ENVELOPE_REGISTRY.json`, a new file under `CoachingCore/r5/`, or the runtime-read `audits/domain-coaching-r5-2026-10-25/reviews/ssctr-policy-review.json` pass `--preserved` and `--check`. None of these is bound by an earlier freeze either (same scope as `v1rfc-freeze.mjs`), but the header's "(iv) … policy … changed" overclaims. `--preserved` and `--check` also ignore untracked files (only `--write` refuses them). | `freeze-preserved-rehearsal.json`, `freeze-check-rehearsal.json` |
| QRE-STR-A-10 | OBSERVATION (process) | `ADDED` binds the whole `candidate/` folder, so any file later committed there (a recheck, a closure, these review files after a freeze) makes `--check` drift (rehearsed with a committed `candidate/CLOSURE.md`). Exclude `candidate/reviews/` or write post-freeze records elsewhere. | `freeze-check-rehearsal.json` |
| QRE-STR-A-11 | OBSERVATION (record accuracy) | The author's evidence row "the same on this line: DRIFT naming `r7b-repertoire.mjs`" is incomplete. On `21838cb`: `v1rfc-freeze --check 1` names `r7b-repertoire.mjs` and the 8 added files (as outside its extension) plus the nested V1RWS drift; `v1rws-freeze --check 2` names only `r7b-repertoire.mjs`; `v1rc-freeze --check 1` names `r6-adaptation.mjs` and `r7b-repertoire.mjs` (it already failed at `2dfa216`). On `2dfa216`: v1rfc exit 0, v1rws exit 0, v1rc exit 1. All expected by design; the record should say so. | scratch clones, `--check` only |
| QRE-STR-A-12 | OBSERVATION | `I10, V6` fails at its first assertion on this line, so its remaining checks (calibration freeze untouched, `r6-adaptation.mjs` base, diff, hashes and verifier pins) no longer run in the suite; only `v1str-freeze --preserved/--write` carry them. An own test mirroring `preserved()` would keep them in the suite. | joint suite TAP; `test/v1rws-engine.test.mjs:157` |
| QRE-STR-A-13 | OBSERVATION | N3 robustness: no upper bound on logged sets (200,000 counted as 200,000), fractional repetitions count as a set, a row without `athleteId` is accepted, and a restarted plan reuses session ids (`w0-str-d1`, 24 shared). The date window keeps old reports out in the tested restart. Corrections and conflicts made through the engine are read correctly. Descriptive only; for the G03 data semantics. | `qre-d-exposure.mjs` (output `qre-d.json`) |

## What I measured

### Joint suite (my run, worktree, `node --test --test-reporter=tap`)
- `21838cb`: 1583 tests, 1581 pass, 2 fail: `V1RC COACHINGCORE-V1-FREEZE-1 is preserved: every file it binds is byte-identical here` (names `r6-adaptation.mjs` and `r7b-repertoire.mjs`) and `I10, V6: every file the two earlier freezes bind is byte-identical here except the one amended file; …` (names `r7b-repertoire.mjs`). 307 s.
- `2dfa216` (scratch clone): 1535 tests, 1534 pass, 1 fail (the same V1RC test, naming `r6-adaptation.mjs`).
- By name: every test that passes at `2dfa216` passes at `21838cb` except `I10, V6`; 48 new passing entries (47 own tests + the helpers file entry). `git diff 2dfa216 21838cb --stat -- CoachingCore/test` shows 4 added files, no edited test.
- Own tests (`test/v1str-*.test.mjs`): 47/47 (scratch clone, 109 s; also the green control of the mutation run).

### Off-identity and authority (probe A)
- With no options (the integration path; no record file exists): 432 of 432 first plans identical to `v1-run-forecast-index.mjs` but for the two keys; 70 of 70 reviews and restarts identical (no options and OFF; weekly reviews, a missed week, an adverse week, a substitution, an equipment change, a restart). Both answers are frozen objects.
- Frozen entry point `v1-run-forecast-index.mjs`, no options: 90 plans + 270 weekly reviews, digest `a0c2ab8c6a6ff78e` on both `2dfa216` and `21838cb` (probe E `population`).
- Injection through the new entry point, all stripped (the plank stays): the `STRENGTH_RULES` option key; `repertoire.strength` (own, non-enumerable, inherited); `authority.repertoire.strength`.
- Turn rules on through the new entry point, by design (D-12, same pattern as the frozen run extensions): `strengthRecords` (forged) and `strengthExtension` (a supplied authority). A supplied authority's `values` are not validated: one listing every trunk configuration as a hold empties every trunk slot and the plan is still PROPOSED.
- Fail closed: 13 record variants as expected (none, null, not an array, top-level array, string `independent`, string `sourceIds`, wrong-case id, upper-case hash, a non-enabling record vetoing, a record of other values ignored, junk entries ignored). A throwing records object throws in `strengthAuthority` and is contained by the entry point (every boundary off, the engine answers).
- Integrity: a tampered or removed binding is refused (HOLD); a plan whose rows lost `planeAlternation` is refused (HOLD). Determinism: same input, same plan and same review.

### N1, N2, N4 along the paths of a plan in force (probe B, probe F)
- 432 plans (4/8/12/16 weeks × 1 to 6 days × 9 equipment profiles × NONE/INTERMEDIATE): status equal to OFF, no hold anywhere (rows and alternatives), at most one asking slot per pattern.
- N1 on every path tried (16 weeks, 5 days, rotation every 2 weeks, familiar planks, SKILL_MISMATCH and preference substitutions of trunk rows, a named plank target, an equipment loss, a restart): 0 hold rows; a named hold is ASK. Exception: A-02.
- Novice density (NONE, 3 and 5 days, FULL/BANDS/MACHINES): the two template sets never disagree on an annotated slot; slots kept through the first block boundary.
- Block boundary MAIN change of the vertical slot: applied, replayed on later reviews, `built` kept.
- SKILL_MISMATCH of the vertical MAIN: falls back to a horizontal lower-skill option (no lower vertical exists), then follows equipment.
- Temporary windows: loss and gain windows do not re-anchor (templates restored after the window).
- Schedule changes (D-2, declared): 2→3 days keeps both vertical slots (same keys); 2→4 and 4→2 days drop both (new keys), after which the new horizontal configurations become the anchors; 3→1 day has no asking slot.
- A-01: permanent loss then regain, see the findings table.

### Preservation differential (probe C, C2; 486 plans: 432 lifters + 54 hybrids, each against OFF)
| authority | status / runs / week shape / phases-blocks / interference differences | rows changed (of 77,940) | rows outside scope | same-exercise dose differences |
|---|---|---|---|---|
| DEV | 0 / 0 / 0 / 0 / 0 | 12,075 (upper MAIN push 4,336, upper MAIN pull 3,061, trunk accessory 3,960, upper accessory push 544, pull 174) | 0 | 562 rows |
| HOLD | 0 / 0 / 0 / 0 / 0 | 3,960, all trunk accessory | 0 | 0 |
| UPPER | 0 / 0 / 0 / 0 / 0 | 3,334, all upper | 0 | 0 |
| PLANE | 0 / 0 / 0 / 0 / 0 | 5,684, all upper MAIN | 0 | 574 rows (reps 508, establishment 118, exposure 130, load 82, instructions 82, sets 56) |

Session minutes differ in 3,430 (DEV), 2,242 (HOLD), 1,369 (UPPER) and 658 (PLANE) sessions; none exceeds the athlete's strength minutes. Session set totals differ in 2,160 (HOLD) and 56 (PLANE) sessions, 0 for UPPER. Details in A-07.

### N3 (probe D)
- Planned counts equal the catalog oracle (`prim`, `lat`) on 1,728 weeks, 0 mismatches (3,087 unilateral rows seen, each counted once).
- A correction made through the engine (`correctionOf`, `correctedAt`): the corrected report is counted, the superseded one is not. A conflicting double report through the engine: the session is CONFLICTED in the engine and not counted.
- Hostile ledgers (null, a string, junk rows, odd repetitions, prototype names, missing dates, dates with a time, 200,000 sets, 100,000 rows in 53 ms): no throw, no imputation. Odd `weekIndex` values: NOT_APPLICABLE.
- Nothing reads it: 18 of 18 answers identical with EXPOSURE on and off, but for `strengthExposure` and the `boundaries` map of `strengthExtension`.

### Freeze verifier (`scripts/v1str-freeze.mjs`)
- `--preserved` on the worktree: exit 0; 196/196, 30/30, 98/98, 163/163; `r6-adaptation.mjs` the authorized V1RWS-2 bytes; `r7b-repertoire.mjs` base, bytes and diff (36+/10-) authorized; nothing else changed since `4f0561b`.
- Refuses correctly: a changed frozen file in `src` (working tree or committed), one byte in a comment of the amended file, a trailing newline in it, a committed new file in `src`.
- Passes when it should not: A-03 (earlier record edited, alone or with a bound file outside CoachingCore), A-09 (r4/r5 policy, untracked files).
- `--write 1 --commit HEAD` rehearsed in a scratch clone over a TEST-ONLY enabling record (all four boundaries on by default): succeeded; it ran the joint suite itself (1581/1583, the same two failures, so turning the boundaries on by default breaks no test) and the own tests (47/47); 11 added files bound. `--check 1` then exit 0, and it drifts correctly on a withdrawn enabling record (file and boundary), a changed earlier record, a later file under `candidate/` and one byte of the amended file; it misses an untracked `src` file and an r5 change (A-09).

## Mutation testing

74 hand-written mutants of the amended lines of `r7b-repertoire.mjs` (24), `v1-strength.mjs` (30) and `v1-strength-index.mjs` (20), each old text checked to occur exactly once, each run against the 47 own tests in five scratch slots. Green control: 47/47 with no failure, so every failing test name counts as a kill; no kill came from a timeout or a missing test.

| file | mutants | killed | survived | of which equivalent or unreachable |
|---|---|---|---|---|
| `r7b-repertoire.mjs` (amended lines) | 24 | 19 | 5 | 3 (R14, R15, R21) |
| `v1-strength.mjs` | 30 | 20 | 10 | 4 (V01, V02, V16, V24) |
| `v1-strength-index.mjs` | 20 | 13 | 7 | 0 |
| total | 74 | 52 (70%) | 22 | 7; score over non-equivalent mutants 52/67 = 78% |

Survivors, named:
- **R01** rules dropped on a caller-supplied repertoire — non-equivalent, development path: the plan is built without the rules while the answer says ACTIVE and the binding records nothing.
- **R14** trigger with one slot — equivalent (index 0 never asks).
- **R15** accessory slots counted for N4 — equivalent under the pinned catalog (accessory slots carry no subpatterns).
- **R18** the plane preference kept once the in-force configuration no longer fits — non-equivalent: it brings a vertical exercise into a running plan; the declared "nothing is preferred once it no longer fits" has no test (the same mechanism as A-01).
- **R21** N2 dropped in the B0-C09 downgrade list — equivalent under the pinned catalog (that list is reached only without MACHINES, and then holds no externally loaded accessory pull).
- **V01** a non-null time dose accepted, **V02** catalog binding unchecked — equivalent under the values hash pin.
- **V05** `independent` loosened to "not false" — non-equivalent: a record without `independent`, or with `"true"`, would enable a boundary; only `independent:false` is tested.
- **V16** clashing slots kept — unreachable for engine-built plans (no clash arises, probe B7).
- **V17** novice set not read by `slotsInForce` — non-equivalent for NONE athletes with 5+ days (novice keys `FULL_B:*` differ from the regular `UPPER_B:*`).
- **V19** a set with 0 repetitions counted; **V30** an exercise logged with only rep-less sets listed with 0 sets per muscle — non-equivalent, minor (SQ-3 c4).
- **V24** the earliest live report read — equivalent for engine-normalized ledgers (one live row per session).
- **V25** logged PRACTICE rows counted as executed — non-equivalent (SQ-3 c1).
- **V27** SKIPPED (moved) sessions counted in planned exposure — non-equivalent.
- **X03** a caller rule on `authority.repertoire.strength` not stripped; **X15** an inherited `strength` not stripped; **X04** the rules not handed to a caller-supplied `authority.repertoire` — non-equivalent, development path. My probe A shows the candidate strips X03 and X15 correctly, but no test holds it, although the record and the brief claim it.
- **X09** the known limitation shown on reviews of plans built without, or under other, rules — non-equivalent, display.
- **X16** the exposure describing the plan before the proposal — non-equivalent when a review modifies the reviewed week.
- **X19** an error reading the authority, **X20** an error inside the exposure, not contained — non-equivalent: the fail-closed containment the entry point claims has no test (probe A shows the original contains a throwing records object).

QRE-STR-A-08 asks, as a CONDITION, for tests that kill at least R18, V05, V17, V25, X03, X15, X19 and X20: each guards a behaviour the candidate claims.

## Declared readings D-1 to D-12 (engineering)
- **D-1 (plan pinned to the rules it was built under, no migration).** Sound and fail-closed: the binding is in the integrity-hashed plan, a tampered binding is HOLD, a plan built without the rules is reviewed exactly as the frozen entry point reviews it (70/70 identical). The cost is real: SQ-1 c7 has no implementation, and together with D-9 every boundary-state change strands plans (A-05). Acceptable for a synthetic candidate if integration owns the restart path.
- **D-2 (N4 in force only conserves).** The declared costs reproduce (no adoption on equipment gain, none for a slot new after a schedule change). The mechanism does not do what D-2 says on a loss-then-regain path: A-01, BLOCKING.
- **D-3 (guard relative to the slot's choice without the rule).** Implemented as `plain` = the head of the ordinary order (with N2 when on). The three declared examples reproduce (dumbbells + band keep `db-row`, bands only take `band-pulldown`, bodyweight only takes `pike-push-up`). The guard does not apply to rotation alternatives (`pike-push-up` is an alternative of an external vertical slot); SSCTR to note.
- **D-4, D-5.** Implemented as described; sporting readings are SSCTR's. N2 never changed a row outside the upper region in 486 plans.
- **D-6.** Real and broader than written: A-07.
- **D-7.** Matches the code and my probes; see A-13 for the edges.
- **D-8.** Same as the run extensions: the runtime never reads the review-by date; switching off is withdrawing the record, which makes `--check` drift and strands plans (A-05).
- **D-9 (fail closed on other rules).** Verified (other bytes, other boundaries, none). A prior clinical hold answers first; a fresh warning sign on a stranded plan answers UNSUPPORTED (A-05).
- **D-10.** Verified exactly, by name, on both commits. Engineering reading: acceptable under the Founder rule that no historical test is edited; see A-12 for what the suite stops checking.
- **D-11.** Confirmed: `src/boundary/custody.mjs` is untouched and still calls `v1-index.mjs`. A-04 and A-06 are what integration must handle.
- **D-12.** Consistent with the frozen run extensions (a supplied authority or records turn boundaries on, and supplied values are not validated). The new entry point strips caller rules; the frozen entry points now honour a `strength` field on a supplied repertoire (A-06).

## Security
No focal Security review is needed for this candidate as it stands: the diff touches no custody code (`src/boundary/` unchanged), adds one read-only authority file path (hash-bound values, independent records), keeps the input boundary of the engine (the new option affordances mirror the existing run-extension ones), and the plan binding is integrity-protected. A focal Security review is needed at integration (D-11): options must never be forwarded from a client (A-06, D-12), plans must be routed by their binding (A-04), and the custody of `SSCTR_V1STR_RECORDS.json` decides what is on for every athlete.

## For the SSCTR judge
- A-01 has a sporting consequence: after a gym closure and reopening recorded as permanent changes, the second push MAIN stays push-up for the rest of the plan.
- A-02: trunk work drops a slot, undeclared, after a trunk set-aside in bodyweight plans with CORE templates (SQ-1 c3).
- A-07: the dose of unselected exercises changes in 66 NONE/NOVICE plans (reps 8 → 10 for the whole plan); the plank's replacement carries more sets and minutes.
- D-2 schedule changes: 2→4 and 4→2 strength days lose both verticals in a plan in force.
- A-05: a fresh warning sign on a stranded plan does not reach the clinical route.
- D-3: the loading guard does not cover rotation alternatives.

## Not verified
- The sporting content of any rule, threshold or reading (SSCTR's).
- An integration through custody (D-11) or any real data; no app, device or UI was exercised.
- Every permutation of event sequences: the paths above were built by hand, not fuzzed; long multi-event chains (several directives, windows and schedule changes together) were sampled, not exhausted.
- The author's own probes (`candidate/probes/probe-v1str.mjs`, the foundation probe) were not rerun; my own probes stand in for them.
- The SSCTR review files present in `reviews/ssctr/` were not read, to keep this review independent.
