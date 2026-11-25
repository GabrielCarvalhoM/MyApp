# QRE_SAN_R3: narrow recheck of QRE-SAN-10 and QRE-SAN-11

**Revision:** `2a865f8`. Code commit `be2106b`, then `2a865f8`, which adds `HISTORICAL_LAYER_RECORD.json` alone.

**Reviewer:** independent QRE/Security, the same reviewer as R1 and R2. I am not the author.

**Method:** I worked in a detached scratch worktree of `2a865f8` with a copied `node_modules`, used for the clean `npm test`. For the git-history attacks I used a separate independent clone (`git clone --no-local`) and a shallow clone made from it. Commits were made only inside those scratch clones, never in the repository. All three are removed. The only file I wrote in the review worktree is this one.

## Verdict: READY

| Finding | Status |
|---|---|
| QRE-SAN-10 | **CLOSED** |
| QRE-SAN-11 | **CLOSED** |
| New QRE-SAN-13 | LOW |
| New QRE-SAN-14 | NOTE |

The stated residual is acceptable, provided the stated version of the policy is committed. That policy text is in the author's working tree, not in `2a865f8`; see QRE-SAN-14.

`npm test` on a clean `2a865f8`:

```
ACTIVE SUITE: 1952 active tests, 1952 pass, 0 fail. HISTORICAL: 53/53 fail on this tree at their declared assertion. … node reported 2013 entries, 8 of them files without tests.
exit=0
```

## QRE-SAN-10: CLOSED

I re-ran my own R2 attack: delete the SEC-INT-01 assertion from the bound H26 successor `v1san-successors.test.mjs`, and `git rm test/v1san-record.test.mjs`. `suite-active.mjs` now stops before the run:

```
RECORD: a bound file is missing: CoachingCore/test/v1san-record.test.mjs
RECORD: the historical layer changed without a new record: CoachingCore/test/v1san-successors.test.mjs
```

The check now runs inside the bound runner. The record test is itself bound, and the runner requires it (`RECORD_TEST`) to run exactly once and pass. Deleting the guard therefore needs an edit to the bound `suite-active.mjs` or `suite-manifest.mjs`, which is the stated residual.

I tried to defeat the "written by exactly one commit" rule. Each attack below weakens the successor and regenerates the record, with correct hashes and `filesDigest`, so that it matches.

| Attack | Result |
|---|---|
| B1: record rewritten in the working tree, uncommitted | `record differs from the bytes its commit wrote`: **refused** |
| B2: rewrite committed in a second commit | `2 commits touch it`: **refused** |
| C: record deleted (commit), then re-created forged (commit) | `3 commits`: **refused**. Variant with the deletion committed and the forged file left untracked: `2 commits`: **refused** |
| D: `git mv` away and back with forged content (rename) | `3 commits`: **refused**. `git log -- <path>` without `--follow` sees both the removal and the re-addition. |
| F: new record path (edit `LAYER_RECORD` in `suite-manifest.mjs` and write a new record, in one commit) | **passes**. This is the prescribed "new record file" route. It requires a visible edit of a bound guard file, so it falls under the stated residual "a commit that rewrites the guard itself". |
| E: history rewrite (fold the attack into the record's own commit with `--amend`) | **passes** (QRE-SAN-13) |
| B3: shallow clone (`--depth 1`) of a commit that rewrote the record | `layerRecordErrors` → **no errors**, so the record check fails open (QRE-SAN-13). The full `npm test` still fails there: the integrity test needs `90452b8`, `4850560` and other commits. I fetched those anchors one by one (`fetch --depth=1 <sha>`) and the record test plus 4 of the 5 integrity tests passed. Only one more anchor (`460a9ab`) was missing. So only a deliberately crafted fetch reaches the end-to-end bypass. |
| G: delete the check together with the record test (edit `suite-active.mjs`) | passes; this is the **stated residual** |

## QRE-SAN-11: CLOSED

The record binds 33 files. I computed the transitive non-runtime import closure of the 16 successor and alsoCoveredBy files, plus the record test and the three runners. **Every file in that closure is bound.** The test helpers and `audits/v1-app-integration-foundation-2026-11-16/harness/scenario.mjs` are included.

The three verifier scripts the integrity successors run are bound too. They import nothing outside `node:` and `src/`.

Appending one byte to `v1int-helpers.mjs`, to `scenario.mjs` and to `v1-five-zone-amendment.mjs` gives a `historical layer changed without a new record` error for each of the three files.

The only non-`src/` import of a historical file that is not bound is `r6/fixtures/profiles.mjs`, imported by H27 and H29. No successor runs either file, so this does not matter.

## New findings

### QRE-SAN-13: LOW. The one-commit proof assumes complete, immutable history

**Where:** `CoachingCore/scripts/suite-manifest.mjs`, `layerRecordErrors`, in the `git log --format=%H -- <record>` count.

In a shallow repository, the boundary commit appears to add every file. A record rewritten at that commit therefore counts as "written once" (attack B3). On an unprotected branch, `--amend` or rebase of the record's own commit does the same (attack E). This branch is not merged yet.

The full `npm test` fails closed in an ordinary shallow clone, because the integrity test needs the anchor commits. That is why this is LOW.

**Fix:** in `layerRecordErrors`, refuse when `git rev-parse --is-shallow-repository` is `true`. Name history rewriting, and the need for branch protection after merge, in the §4.3 residual. Optionally, also refuse when the record's commit is not reachable from a protected base ref.

### QRE-SAN-14: NOTE. The residual statement is not in the reviewed revision

At `2a865f8`, `HISTORICAL_TEST_POLICY.md` §4.2 still describes SANITIZATION-1 (`254738a`), and §4.3 states only the first residual.

The text that names all three residuals and SANITIZATION-2 exists only as an uncommitted edit in the author's worktree. These are also untracked there:
- `evidence/negative-checks-r2.txt`
- `FINAL_REPORT.md`
- `evidence/final-active.txt`

**Fix:** commit them. Policy and evidence files are not bound, so committing them does not touch the record.

## Is the stated residual acceptable?

**Yes.** The residual as written in the working-tree policy §4.3 covers three cases:
- active tests outside the layer;
- `process.exit` truncation;
- a commit that rewrites the guard itself.

Each needs either a visible edit to a bound guard file, or a test outside the layer, which is left to code review. No in-repository check can do better than that.

Two conditions apply:
- the statement must be committed (QRE-SAN-14);
- I recommend that it also name history rewriting and shallow checkouts (QRE-SAN-13).
