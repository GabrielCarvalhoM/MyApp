# HISTORICAL_TEST_POLICY — which version a test belongs to, and how both suites run

**Status: in force for CoachingCore from this mission's commit on.** This policy is test infrastructure only. It changes no runtime byte, no freeze record, no amendment record and no historical test file.

## 1. Commands (from `CoachingCore/`)

| Command | What it runs | Passes when |
|---|---|---|
| `npm test` (`scripts/suite-active.mjs`) | **Phase 1:** everything `node --test` discovers, except the tests listed in `test/HISTORICAL_TESTS.json`. **Phase 2:** those listed tests, and only those, on the current tree. | Every active test passes. Every successor named by the manifest passes. No test is skipped unless the manifest lists it. In phase 2, every listed test matches exactly once, nothing else matches, and **every listed test fails** on the current tree. |
| `npm run test:historical` (`scripts/suite-historical.mjs`) | Each listed test, at the commit it belongs to, in a temporary detached worktree, with its file at that commit checked against the pinned bytes. | Each one passes there. Add `--at-head` to also run phase 2; `--only <commit>` limits the run to one commit. |
| `npm run test:all-raw` | `node --test`, exactly the former `npm test`. | Not a gate. It shows the raw picture: today, the active tests plus 53 expected failures plus 8 helper modules. |

The record verifiers (`scripts/v1-*.mjs --check`) are unchanged. They are run by their own tests: historical ones at their commits, `v1san-runtime-integrity.test.mjs` on the current tree.

## 2. What makes a test historical

A test belongs to the version it was written for. It is **historical** when it is incompatible with the current version for exactly one of these three reasons (the manifest's `kind`):

| Kind | Meaning | Mission category |
|---|---|---|
| `FREEZE_RECORD_OF_ITS_LINE` | It verifies the record of its own line: what that freeze or amendment binds, or what that line declared changed. A later versioned amendment changed a bound file, or added a file. | A |
| `CONTRACT_SUPERSEDED_BY_REVIEWED_CHANGE` | It asserts a contract that a later reviewed, versioned change replaced. | A |
| `PINNED_DEFECT_CLOSED_LATER` | It pinned a defect, or the compensation for one, as its line's behaviour, so that nobody would read the defect as closed. A later versioned amendment corrected it. | B |

**Nothing else makes a test historical.** These failures are not grounds to delegate a test: a test that fails because the runtime is wrong (C), because of the environment (D), or because it demonstrates a blocker kept on purpose (E). A C failure is fixed or reported as a blocker. A D failure is fixed in the infrastructure. An E test is kept active as a **passing** test of the blocker, with its resolution condition stated in the test.

## 3. What every manifest entry must hold

The active runner refuses to run when any of these is missing:

- `file` and `title`: the exact title, matched whole. It must match one test in that file and no test anywhere else (phase 2 proves this).
- `fileSha256`: the bytes of the test file. **A historical test file is never edited**, not even to fix a typo. A historical test is corrected by writing a successor.
- `belongsTo.commit`: the last commit, first parent and touching CoachingCore, where the test passes in its own tree. The historical suite proves it passes there.
- `firstFailedAt.commit` and `supersededBy`: the versioned change that ended its line, with its audit and ledger.
- `successor`, plus optionally `alsoCoveredBy`: tests of the **current** contract, active and passing. A successor may not itself be historical: the chain must end in the active suite.
- `contract`, `reason`, and `safetyPoint` when the contract is a safety or custody contract.

## 4. The rules when the code changes

1. **A runtime amendment** (a change under `src/`, a file the runtime reads, the bundle or the lockfile) follows the existing controlled-amendment mechanism: a versioned record beside the earlier ones, its own verifier, independent review proportional to the change, and no rewriting of any earlier record. `v1san-runtime-integrity.test.mjs` fails until that record exists. That is intended: it is the gate that says a runtime change happened. With the new record in place, the amendment's mission:
   - replaces the integrity test's binding: it points it at the new record, keeping the same class-based checks;
   - lists in the manifest every earlier test that its change makes fail by design. Each listing gives the test's `belongsTo` (the last commit before the amendment), its `firstFailedAt` and its successor, as for H52/H53 here;
   - regenerates nothing by hand. The entries are data, and the runner verifies them on every run.
2. **A test-only change** (anything under `test/`, the `suite-*.mjs` scripts, or `package.json`'s `scripts`) needs no record. The integrity test allows exactly this class and nothing more. Adding tests never creates a new by-design failure.
3. **Retiring a historical entry.** If a historical test starts passing on the current tree, phase 2 fails. For a pinned defect, that means **the defect is back**: treat it as a regression first. Only when the passing is understood and intended may the entry be removed. Its removal is recorded with its provenance, and the test then runs in the active suite again.
4. **No other exclusion.** `skip`, `todo`, `only`, name filtering in `package.json` and file exclusion are not used to make the active suite pass. Phase 1 fails on any skipped test the manifest does not list.

## 5. Why the historical files stay where they are

Earlier freezes bind several historical test files by path and hash. A move would therefore be a change to bytes those records bind, and it would break the historical execution: at its own commit, the file lives at its own path. The manifest delegates by `(file, title)` instead, and the runner checks the bytes. Node omits a test excluded by a pattern from its report altogether, so phase 2 runs exactly the omitted tests. That makes the delegation visible and exact, never silent.

## 6. What the active suite does not claim

A green active suite means: the current runtime passes every current test, every superseded test has a passing successor, and every superseded test is green in its own version and incompatible with this one. It does **not** mean the product is ready for real athletes (see [FINAL_REPORT.md](FINAL_REPORT.md), REAL_ATHLETE_READY = NO). It also does not re-validate the physical (JavaScriptCore, iPhone) runs, which this mission did not need to repeat: no runtime byte changed.
