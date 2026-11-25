# REGRESSION_REPORT — V1 test-suite sanitization

Host: Mac mini M4, macOS 27.0, Node v24.19.0, TZ America/Sao_Paulo (−03:00) unless stated. All athletes and records are synthetic. Line: `claude/v1-test-sanitization` from `90452b8`, in its own worktree. Other worktrees untouched.

## 1. Suites

| Run | Real tests | Pass | Fail | Notes |
|---|---|---|---|---|
| `90452b8`, `node --test` (base) | 1985 (+8 helper modules node counts as tests: 1993) | 1934 (1942) | **51** | the mission's input; [FAILURE_INVENTORY.md](FAILURE_INVENTORY.md) |
| **Active suite** (`npm test`), this line, phase 1 | **1950** | **1950** | **0** | 1985 − 51 − 2 (H52, H53) + 18 added |
| Active suite, phase 2 (the 53 historical tests on this tree) | 53 | 0 | 53 | each matched exactly once, nothing else matched; **all fail, as declared** |
| **Historical suite** (`npm run test:historical`) | 53 | **53** | 0 | each at its own commit (16 commits), each file at that commit = its pinned bytes |
| `npm run test:all-raw` (former `npm test`) | 2003 | 1950 | 53 | the 51 + H52/H53: exactly the delegated set |

**Test by test against the base** (junit of each run, joined on file and title):

- 1932 tests pass on both;
- the 51 failing on the base are delegated;
- the 2 passing on the base and delegated are H52 and H53 (by design, §6);
- 18 tests are new (`v1san-*`);
- **no test is missing, and no other test changed status.**

The 18 new tests: `test/v1san-boundary-safety.test.mjs` 13/13 and `test/v1san-runtime-integrity.test.mjs` 5/5.

Families in the active suite, all passing:

| Area | Tests |
|---|---|
| Integration and custody | v1int 54, v1bc 25, v1final 7, v1cib 68 |
| Core safety and lifecycle | v1core 225 |
| Running | v1rws 96, v1rc 74, v1rfc 82, v1fc 45 |
| Strength | v1str 66 |
| HR5 regression | v1hr5 33/33 (the five-zone rewrite), v1hr5r 14 (v1hr5r-boundary 13/13 and the QRE-AIF-01 successor) |
| Earlier R-lines | 1001 tests from conformance through r7d |

## 2. Freeze and amendment verifiers (`evidence/verifiers-HEAD.txt`)

| Verifier | Result on this line | Expected |
|---|---|---|
| `v1-hr5-runna-amendment.mjs --check` (FIVE-ZONE-AMENDMENT-2, the record in force) | exit 1, **one line only**: `CHANGED and not declared:` the 7 test-infrastructure files of this line | by design. Its "nothing else changed since 4850560" step counts tests. `v1san-runtime-integrity.test.mjs` proves every other check of it directly: the 91 bound files byte-identical, the consumed set equal, bundle `d087ad51` as recorded, the records at their commits |
| `v1-five-zone-amendment.mjs --check`, `v1-final-release-freeze.mjs --check` | exit 1 on amendment-2's declared files, plus this line's test files | by design, as on `90452b8` (successor test 5) |
| Every record under `CoachingCore/v1/` | byte-identical to `90452b8`. FINAL = `6482749`, AMENDMENT-1 = `bec39c5`, AMENDMENT-2 = `9a88521` | successor test 3 |
| Each historical record's own verifier | green at its own commit (historical suite) | — |

**Runtime unchanged.** `git diff --name-only 90452b8 HEAD` lists nothing under the following paths:

- `CoachingCore/src`, `v1`, `fixtures`, `artifacts`, `r2`–`r7`;
- `package-lock.json`;
- the HR5R native bundle.

It also modifies, deletes or renames no existing file under `CoachingCore/test` or `CoachingCore/scripts`. The only change to an existing file is `package.json`'s `scripts`: `test` now points at the active runner, and `test:historical` and `test:all-raw` are added.

## 3. Safety and custody through the integration API (Phase 3)

`test/v1san-boundary-safety.test.mjs` drives `createIntegration` + api.mjs, the route the app uses, for each investigation point. Results are in [ROOT_CAUSE_CLASSIFICATION.md](ROOT_CAUSE_CLASSIFICATION.md), "Category C"; all 13 pass.

**Detection of E-1** (`evidence/red-e1-mutation.txt`). A scratch copy of this tree was made with one change in `r6-provenance.mjs`: the correction no longer inherits the other voices of the row (`if(others.length)inherited=…` disabled), which is the pre-E-1 behaviour. On that copy:

- the three E-1 boundary tests fail at the E-1 assertion, `[UNKNOWN, UNKNOWN]` instead of `[ADVERSE, HARDER]`;
- the stop test fails at "a dispute, never the watch alone";
- the tests for other mechanisms still pass.

The whole pre-E-1 file (`16577b6`) was also tried. The boundary refuses that engine's output outright (`ENGINE_CONTRACT_VIOLATION`, fail-closed), so that probe was not specific, and the targeted mutation above is the evidence.

**Phase 2 as a regression tripwire** (`evidence/negative-checks.txt`). With the same E-1 mutation, `suite-active.mjs --phase2-only` reports **18 historical tests passing again**, among them H50 HARD GATE E-1 and H32 LIMIT E-1, and the suite fails. A pinned defect that comes back cannot pass `npm test`.

## 4. Environment (category D)

| Run | Result |
|---|---|
| `TZ=UTC npm test` | **1950 / 1950 / 0**, phase 2 53/53 fail as declared, exit 0 (`evidence/env/tz-utc.txt`) |
| `TZ=Asia/Tokyo npm test` | **1950 / 1950 / 0**, phase 2 53/53, exit 0 (`evidence/env/tz-tokyo.txt`) |
| Wall clock +200 days (2027-06-13, past the R7B0 `review_by` 2027-04-30), injected `--import` preload, `npm test` | **1950 / 1950 / 0**, phase 2 53/53, exit 0 (`evidence/env/clock200.txt`; the preload `evidence/env/shift-clock.mjs` was confirmed to reach node's test child processes: a child read 2027-06-13) |

The runtime takes its clock by injection (`createIntegration({clock})`, `createCustody({now})`, `createBoundary({now})`). `Date.now()` is only a default there, and in `v1-f08.mjs:310` only when `asOf` is invalid.

## 5. Instrumentation defects found and fixed in this mission (not project defects)

1. A `node_modules` **symlink** in a replay worktree is an untracked *file* to the record verifiers (`.gitignore` has `node_modules/`, which matches directories only). The first replay showed several record tests as never green. They were replayed with a copy (`evidence/replay/replay-records.sh`), and `suite-historical.mjs` copies.
2. node's junit reporter leaves `>` unescaped inside attributes, so a title such as "done -> not done" ended a naive tag regex early and swallowed the following testcases. `suite-manifest.mjs` reads quoted attributes, and it agrees with an XML parser on all 1993 entries of the base run (1993 entries, 51 failures).
3. node omits a test excluded by `--test-skip-pattern` from its report entirely, rather than reporting it as skipped. Phase 2 exists for this reason: it is what makes the delegation visible and exact.
4. node reports a file whose tests were all filtered out as one file-level entry named after the file. The runners do not count these as tests. A file-level *failure* (a file that fails to load) is still a failure.

## 6. Negative checks of the new infrastructure (`evidence/negative-checks.txt`)

Each check ran on a scratch worktree of `2c527f7`.

| Check | Result |
|---|---|
| N1: E-1 re-introduced in the engine | phase 2: 18 historical tests PASS on the tree, exit 1 |
| N2: a historical test file edited (one byte) | refused before running: "not the pinned bytes", exit 1 |
| N3: a runtime file edited (`src/value.mjs`, a comment) | `v1san-runtime-integrity` tests 1, 4 and 5 fail |
| N4: a new test with a historical test's exact title | "a manifest title also matches a test it does not list", exit 1 |
| N5: an unlisted `test.skip` | "skipped and not delegated by the manifest", exit 1 |

## 7. What was not re-run, and why

**JavaScriptCore (Mac) and the iPhone runs, HR5 physical tests, and the Swift packages.** No runtime byte changed:

- the bundle the iPhone ran (`d087ad51`) is the one the integrity test checks;
- every module it lists is byte-identical to its bound source;
- the boundary API and the stored-record format are unchanged.

The physical evidence of V1HR5R therefore still describes this runtime. Repeating it would only produce another report (mission Phase 6).
