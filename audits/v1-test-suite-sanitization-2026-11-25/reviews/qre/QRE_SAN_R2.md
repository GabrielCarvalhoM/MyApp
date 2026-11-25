# QRE_SAN_R2: QRE/Security narrow recheck of the review cycle

- **Reviewer:** the independent QRE/Security reviewer of R1 (not the author).
- **Revision rechecked:** `119e761`. That covers the cycle commits `02d9716`, `47da99a`, `254738a`, `5a3834f` and `119e761` on top of my R1 revision `7254984`.
- **How I worked:** in detached scratch worktrees of `119e761` under `/private/tmp/claude-502/`, each with a copied `node_modules`; both are now removed. I re-ran my R1 loopholes in minimal harnesses built from the new `suite-active.mjs` and `suite-manifest.mjs`. The only file I wrote in the review worktree is this one.

## Verdict: READY_WITH_CONDITIONS

| Finding | Status in R2 |
|---|---|
| QRE-SAN-01, 02, 03, 05, 06, 07, 08, 09 | CLOSED |
| QRE-SAN-04 | **OPEN, partly closed** |
| QRE-SAN-10 (new) | MEDIUM |
| QRE-SAN-11 (new) | LOW |
| QRE-SAN-12 (new) | NOTE |

The historical-layer record does work. But the test that enforces it is not part of the layer it binds, and nothing requires that test to run. One commit can therefore weaken a bound successor and delete the record test, and `npm test` stays green. I reproduced this on the full suite (QRE-SAN-10).

**Condition:** fix QRE-SAN-10. It is a small change, described below.

## `npm test` on 119e761

```
ACTIVE SUITE: 1952 active tests, 1952 pass, 0 fail. HISTORICAL (test/HISTORICAL_TESTS.json): 53/53 fail on this tree at their declared
assertion; each is verified green at its own commit by `npm run test:historical` (not run here). node reported 2013 entries, 8 of them
files without tests (helpers).
exit=0
```

- These are the expected numbers: 1952 active, 1952 pass, 0 fail, 53/53 at their declared lines.
- The counts reconcile: 2013 = 1952 + 53 + 8 helper modules. That is 1950 at R1, plus the new tests in `v1san-successors` and `v1san-record`.
- `node scripts/suite-historical.mjs --only 90452b8` passes 2/2 (H52, H53) under the new ancestry check.
- `test/v1san-record.test.mjs` run alone passes 1/1.
- Since `254738a` no bound file has changed. After it only these changed: `v1san-record.test.mjs` (added), `HISTORICAL_TEST_POLICY.md`, `INDEPENDENT_REVIEW.md`, `REGRESSION_REPORT.md` and the evidence files.

## R1 findings

| ID | Status | Evidence on 119e761 |
|---|---|---|
| QRE-SAN-01 (hidden subtest) | **CLOSED** | One unfiltered run now. I re-ran both R1 repros: `test('wrapper',t=>t.test('HIST one',fail))` and `test('HIST',t=>t.test('one',fail))`. Both give `✖ ACTIVE FAILURE x.test.mjs:2` and exit 1. The node-counter check fires as well. |
| QRE-SAN-02 (H26 residual assertions) | **CLOSED** | `test/v1san-successors.test.mjs` is now H26's successor and keeps every assertion of tm-5: the screen byte for byte (SEC-INT-01), `missingInputs`, `recorded.length`, the reason, and "the device states no screen". It inverts only QRE-INT-02. It passes. |
| QRE-SAN-03 (any failure accepted) | **CLOSED** | `failsAt.line` is required by `manifestErrors`; all 53 entries are integers. The R1-style repro with the declared line set to 3 while the test fails at 2 gives `H01: fails at hist.test.mjs:2, not at its declared assertion :3` and exit 1. The full suite shows 53/53 at their declared lines. One residual is recorded as QRE-SAN-12 (a). |
| QRE-SAN-04 (tests and manifest not bound) | **OPEN, partly closed** | `SANITIZATION_RECORD.json` (sealed at `254738a`) binds the manifest, the three runners, `package.json` and the 16 successor and alsoCoveredBy files, and `v1san-record.test.mjs` checks it. Weakening a successor or adding a manifest entry alone does fail `npm test`. But the guard can be removed in the same commit (QRE-SAN-10). The accepted residual is judged below. |
| QRE-SAN-05 (policy overclaim, missing link) | **CLOSED** | Policy §1 now says a green `npm test` does not prove the historical tests green in their versions, and that `test:historical` must run when the manifest changes. The `FINAL_REPORT.md` link is gone from the policy. `INDEPENDENT_REVIEW.md` says "the report exists"; that file is not in `119e761`, though an untracked one is appearing in the author's worktree. |
| QRE-SAN-06 (weak boundary tests) | **CLOSED** | The intruder is now enrolled in the same custody: the correction is refused, and the other record holds none of this athlete's rows. Replay: I probed that `decisionId` is a real id (`dc_b44c…`) equal on retry, so the check is not vacuous; the same id with another body gets `CONFLICT_IDEMPOTENCY_KEY`. `raw` is asserted to exist. |
| QRE-SAN-07 (firstFailedAt, ordering) | **CLOSED** | H52 and H53 now say `firstFailedAt 2c527f7`. `suite-historical.mjs` requires belongsTo to be a strict ancestor of firstFailedAt, and firstFailedAt an ancestor of HEAD; by code reading, `rev-parse` equality is rejected. The `--only 90452b8` run passes. The check lives only in `test:historical`, not in `npm test`; that is consistent with the policy. |
| QRE-SAN-08 (skip titled as file path) | **CLOSED** | Repro gives `SUITE: skipped: x.test.mjs: test/x.test.mjs` and `node counts 1 skipped`, exit 1. |
| QRE-SAN-09 (notes) | **CLOSED** | Each was dispositioned, and I accept them. The parent-after-subtests failure is now caught by node's counter (repro: `node counts 2 failures, 1 are accounted for here`, exit 1). |

## New findings

### QRE-SAN-10: MEDIUM. The guard of the historical layer is outside that layer and is not required to run

**Where:**
- `audits/v1-test-suite-sanitization-2026-11-25/SANITIZATION_RECORD.json`: its `files` do not include `CoachingCore/test/v1san-record.test.mjs`.
- `CoachingCore/scripts/suite-active.mjs`: nothing requires the record test to be present or to pass.
- `test/HISTORICAL_TESTS.json`: no entry names the record test as a successor or alsoCoveredBy.

**Consequence:** deleting or neutering `v1san-record.test.mjs` removes the only check of the record. The policy §4.2 claim, "Weakening a successor … therefore fails `npm test`", fails in the case it was written for.

**Reproduction** (full suite, scratch worktree of `119e761`):

1. In the bound H26 successor `test/v1san-successors.test.mjs`, remove the SEC-INT-01 assertion: `assert.deepEqual(sp.calls.at(-1).input.eligibility, …,'the onboarding screen, byte for byte')`.
2. `git rm test/v1san-record.test.mjs`.
3. Run `npm test`. Result: `ACTIVE SUITE: 1951 active tests, 1951 pass, 0 fail … 53/53 … at their declared assertion`, `exit=0`.

The weakened successor still passes, the integrity test still passes because `test/**` counts as INFRA, and the deletion goes unnoticed.

**Fix:** make the gate check the record itself. Either:
- have `suite-active.mjs` (bound, and the `npm test` entry point) verify `SANITIZATION_RECORD.json` inline: sealed bytes at its commit, then every bound file's hash; or
- at minimum, have it require that the record test `(file, title)` is found exactly once and passes, as it already does for successors, and add `v1san-record.test.mjs` to the record's `files`.

With either fix, removing the guard means editing a bound runner or the `test` script in `package.json`. Both are bound and conspicuous.

### QRE-SAN-11: LOW. The test code the successors import is not bound

**Where:** the `SANITIZATION_RECORD.json` `files`.

The 16 successor files import unbound modules:
- `test/v1int-helpers.mjs`, `v1core-helpers.mjs`, `v1rws-helpers.mjs`, `v1rfc-helpers.mjs`, `v1rc-helpers.mjs`, `v1cib-helpers.mjs`, `v1str-helpers.mjs`, `v1cp-fixtures.mjs`;
- `audits/v1-app-integration-foundation-2026-11-16/harness/scenario.mjs`, through `v1int-helpers`.

The integrity successors also run the record verifiers `scripts/v1-*.mjs`, which are likewise not bound by the record.

A change to one of these (for example `spy`, `athlete`, `athleteA` or `reportOf`) can weaken a successor without touching its bound bytes. I did not build a mutation for this; it is by construction.

**Fix:** bind the transitive non-runtime imports of the successor files, and the verifier scripts the successors execute. Alternatively, state them explicitly in the residual of policy §4.3.

### QRE-SAN-12: NOTE. Precision items, all failing closed or acceptable

- **(a) `failLine` reads the first frame in the test's own file.** A failure thrown inside a call on the declared line is accepted as declared. Example: a `TypeError` from `src/` inside `assert.equal(fn(), x)` at that line. A message digest would pin the failure more tightly. This is acceptable as is.
- **(b) node's exit status is no longer read.** Every case I tried still fails closed through the junit accounting or node's counters:
  - a test file killed by `SIGKILL`;
  - an unhandled rejection inside a passing test;
  - `process.exitCode=1` at `beforeExit`;
  - a test that times out (cancelled);
  - a parent that fails after its subtests.

  I also tried to forge node's counters with `t.diagnostic('fail 1')`, which is the only route that would bypass `junitCounts`' first-match read. node does not write test diagnostics into the junit report, so I found no way to inject a counter comment. Titles and messages are escaped.
- **(c) Misleading wording.** A crash after a file's tests have run is reported as "a test file failed to load".
- **(d) A file that calls `process.exit(0)` mid-run still loses its pending tests silently.** Repro: the active suite reports 2/2 pass with exit 0 while a failing test never ran. This is inherited from node; it is part of the stated residual below.

## Is the stated QRE-SAN-04 residual acceptable?

**Yes, as an accepted risk, but only after QRE-SAN-10 is fixed and QRE-SAN-11 is either fixed or added to the stated residual.** The residual is "an active test outside the historical layer can be weakened; left to code review" (policy §4.3).

Why it is reasonable:
- The runtime is still bound byte for byte (`v1san-runtime-integrity` test 1, plus the verifier diff in test 4).
- The tests that stand in for history are bound (once QRE-SAN-10 is fixed).
- The earlier alternative, "nothing else changed", is what produced the 51-failure chain.
- A green suite cannot by itself prove that tests were not weakened.

Two additions are recommended, though not required, for the accepted-risk statement:
- name the `process.exit` and silent-truncation case (QRE-SAN-12 (d)) as part of the same residual;
- consider pinning the active `(file, title)` inventory (the evidence already has `titles-head.json`) so that a deleted or silently truncated active test is at least visible.
