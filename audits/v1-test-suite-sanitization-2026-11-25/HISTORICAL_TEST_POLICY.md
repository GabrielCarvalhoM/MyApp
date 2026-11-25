# HISTORICAL_TEST_POLICY — which version a test belongs to, and how both suites run

**Status: in force for CoachingCore from this mission's commits on.** This policy is test infrastructure only. It changes no runtime byte, no freeze or amendment record, and no historical test file. Revised in the review cycle (QRE_SAN_R1).

## 1. Commands (from `CoachingCore/`)

| Command | What it runs | Passes when |
|---|---|---|
| `npm test` (`scripts/suite-active.mjs`) | **One run of everything `node --test` discovers, with nothing filtered**: no name pattern, no skip pattern, no file excluded. The verdict is read from the junit report. The full spec output goes to a log whose path is printed. | (a) Every test the manifest does not list passes. (b) Each of the 53 listed tests is found exactly once and **fails at the assertion line the manifest pins** (`failsAt.line`). (c) Every successor and `alsoCoveredBy` test passes. (d) Nothing is skipped, todo or cancelled, and no file fails to load. (e) node's own failure count equals the failures accounted for. |
| `npm run test:historical` (`scripts/suite-historical.mjs`) | Each listed test at the commit it belongs to, in a temporary detached worktree with a *copy* of `node_modules`. It also checks that the file at that commit is the pinned bytes, and that `belongsTo` is a strict ancestor of `firstFailedAt`, which is an ancestor of HEAD. | Each one passes there. `--only <commit>` runs one commit; `--at-head` then runs `npm test`. |
| `npm run test:all-raw` | `node --test`, exactly the former `npm test`. | Not a gate: its exit code is 1 while historical tests exist. |

**What each command proves, and what it does not.**

- **A green `npm test`** proves that the current runtime passes every current test, that every superseded test has a passing successor, and that every superseded test is incompatible with this tree in exactly the way the manifest declares.
- **It does not prove** that the historical tests are green in their own versions. Only `npm run test:historical` proves that, and it must be run whenever the manifest changes. This mission ran it: 53/53, REGRESSION_REPORT.md.
- **Neither command** is a readiness claim for real athletes.

## 2. What makes a test historical

A test belongs to the version it was written for. It is **historical** only when it is incompatible with the current version for one of these reasons (the manifest's `kind`):

| Kind | Meaning | Mission category |
|---|---|---|
| `FREEZE_RECORD_OF_ITS_LINE` | It verifies the record of its own line: what that freeze or amendment binds, or what that line declared changed. A later versioned amendment changed a bound file or added a file. | A |
| `CONTRACT_SUPERSEDED_BY_REVIEWED_CHANGE` | It asserts a contract that a later reviewed, versioned change replaced. | A |
| `PINNED_DEFECT_CLOSED_LATER` | It pinned a defect, or the compensation for one, as its line's behaviour, so that nobody reads the defect as closed. A later versioned amendment corrected it. | B |

**Nothing else makes a test historical.** Three kinds of failing test are never delegated:

- **C**, a test that fails because the runtime is wrong. Fix it, or report it as a blocker.
- **D**, a test that fails because of the environment. Fix the infrastructure.
- **E**, a test that demonstrates a blocker kept on purpose. It stays active as a **passing** test of the blocker, with its resolution condition stated in it.

## 3. What every manifest entry holds

The runner refuses a malformed manifest.

| Field | Content |
|---|---|
| `file`, `title` | The exact title, matched whole. It is found exactly once in that file. |
| `fileSha256` | The bytes of the test file. **A historical test file is never edited**: it is corrected by a successor. |
| `failsAt.line` | The assertion it fails at on the current tree. For the 51, this is the same line as on `90452b8`; the generator checks it. A failure anywhere else fails the suite: that is the tripwire against a regression before the pinned point. |
| `belongsTo.commit` | The last commit (first parent, touching CoachingCore) where it passes, in its own tree. |
| `firstFailedAt.commit`, `supersededBy` | The versioned change that ended its line, with its audit and ledger. |
| `successor`, `alsoCoveredBy` | Tests of the current contract, active and passing. None may itself be historical. When only part of a historical test is superseded, the successor keeps every still-valid assertion (for example, H26 → `v1san-successors.test.mjs`). |
| `contract`, `reason`, `safetyPoint` | The contract, why it is historical, and the safety point it touches, if any. |

## 4. The rules when the code changes

1. **Runtime amendment** (`src/`, a file the runtime reads, the bundle, the lockfile). Follow the existing controlled-amendment mechanism: a versioned record beside the earlier ones, its own verifier, proportional independent review, and no earlier record rewritten. `v1san-runtime-integrity.test.mjs` fails until that is done: it is the gate that says a runtime change happened. The amendment's mission then:
   - points that test at the new record, keeping its class-based checks;
   - adds a manifest entry, with its `failsAt`, for every earlier test the change makes fail by design;
   - writes a new version of the historical-layer record (rule 2).
2. **The historical layer** is bound by **REPMILE-COACHINGCORE-V1-TEST-SUITE-SANITIZATION-2** (`HISTORICAL_LAYER_RECORD.json`). It supersedes -1, `SANITIZATION_RECORD.json`, which is kept unchanged as history. The layer is:
   - the manifest, the three `suite-*.mjs` scripts, `package.json` and `v1san-record.test.mjs`;
   - every test file holding a successor or an `alsoCoveredBy` test;
   - the helper modules and audit harness those files import, and the verifier scripts they run (QRE-SAN-11).

   **The record file is written by exactly one commit and never modified.** `layerRecordErrors()` in `suite-manifest.mjs` proves this from git's history, so no commit hash is written into a file the record binds. `npm test` runs that check **before the suite**, and it also **requires** `v1san-record.test.mjs` to run and pass (QRE-SAN-10).

   As a result, none of these passes `npm test`: weakening a successor or a helper, deleting the record test, adding a manifest entry for a regressed test, or editing the record. A change to the layer is accepted only as a **new record file** (a new version, written by `evidence/write_layer_record.py`, which refuses to overwrite) with an independent review.
3. **Other test work** needs no record: adding tests, or changing a test outside the layer. Ordinary code review governs it. **Residual risks, stated and accepted (QRE_SAN_R2):**
   - An active test outside the layer can be weakened by a commit that passes `npm test`. Before this mission, each record's "nothing else changed" step caught every such change, at the cost of the 51-failure chain. This policy keeps the guard where it matters (the runtime, and the tests that stand in for history) and leaves the rest to review.
   - A test file that calls `process.exit(0)` part-way silently drops the tests after it (QRE-SAN-12). An inventory of every active test is not pinned.
   - The guard lives in the repository. A single commit that rewrites the guard itself (`suite-manifest.mjs` or `suite-active.mjs`) cannot be stopped from inside the repository. Such a commit is a visible change to a bound file, and only review or branch protection can refuse it.
   - The written-once proof assumes the complete, unrewritten history (QRE-SAN-13). In a shallow clone, the boundary commit looks like the record's only commit. An `--amend` of the record's own commit, possible on an unprotected branch, rewrites that history. **Run `npm test` on a full clone, and protect the branch before real-athlete work.** A plain shallow `npm test` still fails, because the integrity test needs the older anchor commits.
4. **Retiring a historical entry.** A historical test that passes on the current tree fails `npm test`. For a pinned defect, that means **the defect may be back**: treat it as a regression first. The entry is removed only when the passing is understood and intended, with its provenance and a new record version.
5. **No other exclusion.** `skip`, `todo`, `only`, name filtering and file exclusion are not used to make the active suite pass, and the runner fails on any of them.

## 5. Why the historical files stay where they are

Earlier freezes bind several historical test files by path and hash, and at its own commit each file lives at its own path. Moving them would change bytes that those records bind, and it would break the historical execution. The manifest therefore names each test by `(file, title)`, and the runner checks its bytes. Because nothing is filtered, a historical test still runs in every `npm test`. It is accounted as historical (expected to fail exactly where declared), never as active, and it is visible in the spec log.
