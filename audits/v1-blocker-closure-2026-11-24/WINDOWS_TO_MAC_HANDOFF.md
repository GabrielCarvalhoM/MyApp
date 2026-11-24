# Windows → Mac handoff: REPMILE-COACHINGCORE-V1-RC-1

**Date:** 2026-11-24. **Made on:** Windows 11, Node v24.19.0.
**Nothing here ran on a Mac, in JavaScriptCore or on an iPhone.** Every result below is Node on Windows. The physical run is still `IOS_REVALIDATION_PENDING`.

## 1. Remote, branch, commit

| Item | Value |
|---|---|
| Remote | `git@github.com:GabrielCarvalhoM/MyApp.git` (HTTPS: `https://github.com/GabrielCarvalhoM/MyApp.git`) |
| Visibility | **PUBLIC** repository (pre-existing; the earlier engine lines were already published there) |
| Branch published | `claude/v1-cc-blocker-closure` |
| RC content commit | `89796df92688bfec69f31b4aec686742b0891a74` (pushed and checked with `git ls-remote`) |
| RC record commit | `96a8ccc` (`CoachingCore/v1/RELEASE_CANDIDATE_V1_RC_1.json`) |
| RC base | `ee256ae` (FREEZE-7 + V1INT-BOUNDARY-SUCCESSOR-1) |
| Branch tip | one commit after `89796df`, which adds only this file. `git diff --stat 89796df HEAD` must list only `audits/v1-blocker-closure-2026-11-24/WINDOWS_TO_MAC_HANDOFF.md` |

**Predecessor references:** none had to be pushed as a separate branch. The line is linear: `16577b6` (already on the remote as `claude/v1-aif-p0-jsc`) → 88 commits → `89796df`. These 88 commits cover:
- Core Safety & Lifecycle;
- closure-2;
- C2-F01;
- CF011-r2;
- SEC-R2;
- NCC;
- O-1;
- Safety Continuity / FREEZE-7 `e44d855`;
- V1INT `ee256ae`;
- the blocker closure.

They all arrive with this one branch. The RC verifier reads `ee256ae` through `git show` and `git diff`, so it needs that history.

**Do not clone with `--depth`:** a shallow clone breaks the verifier.

Local branches such as `claude/v1-cc-integration-foundation` and `claude/v1-core-safety-continuity` were **not** pushed. Their commits are ancestors of this branch, reachable by hash.

## 2. Checkout on the Mac

```
git clone git@github.com:GabrielCarvalhoM/MyApp.git RepMile && cd RepMile     # or: git fetch origin
git checkout claude/v1-cc-blocker-closure
git rev-parse HEAD                                    # the tip: a child of 89796df
git diff --stat 89796df HEAD                          # only this handoff file
git merge-base --is-ancestor ee256ae HEAD && echo ok  # base present
node --version                                        # >= 24 (CoachingCore/package.json engines)
(cd CoachingCore && npm ci)                           # ajv 8.20.0 from package-lock.json; node_modules is not versioned
```

## 3. First validation on the Mac (portable, before Xcode)

These are README §2 commands, with the branch replaced as §15 says:

```
node CoachingCore/scripts/v1-rc-1.mjs --check                          # exit 0, "87/87 consumed files byte-identical"
node audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs                    # bundle sha256 f5d684e53410b5ab…, 41 modules, 16 assets
node audits/v1-aif-p0-jsc-2026-11-17/lab/oracle.mjs                    # J5/P16
node audits/v1-aif-p0-jsc-2026-11-17/lab/focal-oracle.mjs
node audits/v1-core-safety-lifecycle-2026-11-18/mac/core-oracle.mjs
node audits/v1-core-safety-lifecycle-2026-11-18/mac/int-oracle.mjs
node audits/v1-core-safety-lifecycle-2026-11-18/mac/vm-check.mjs       # "ok": true
node --jitless audits/v1-core-safety-lifecycle-2026-11-18/mac/vm-check.mjs
git status --porcelain                                                 # empty (focal.json: defaultLocale may differ off pt-BR: record it)
```

**Expected to exit 1 on this line, by design:**
- `v1core-freeze-7.mjs --check` and `v1int-boundary-1.mjs --check`. They are earlier records, and RC-1 declares the seven amendments.
- Do not "fix" them.

Then follow the Mac README in its stated order (`audits/v1-core-safety-lifecycle-2026-11-18/mac/README.md` §15):
1. §2–§4 and §8–§13 with the RC bundle;
2. §14 (relink with the boundary, `testIntegrationBoundary`);
3. `NATIVE_OBLIGATIONS.md` §1–§8.

Any `DIVERGED` fails the run.

## 4. Checks run on Windows for this handoff

**Repository audit:**
- The RC worktree was clean.
- No submodules and no Git LFS; `.gitattributes` is `* -text`, so bytes are kept as committed.
- 88 commits were unpublished, all on the linear line above.
- Push over SSH, no `--force`. No merge, no branch or worktree deleted, no config changed.

**Publication safety, over the 88-commit diff `16577b6..89796df`:**
- No private keys, GitHub/AWS/API tokens or passwords.
- No `.env`, certificates, provisioning profiles, `node_modules` or logs of personal data.
- No e-mail addresses. No Team ID or UDID; `RUN.md` keeps `<TEAM_ID>` as a placeholder.
- All fixtures are synthetic.
- One large file: the bundle, 1.46 MB.
- **Noted, not changed:** about 47 newly published evidence and review files contain Windows stack-trace paths with the local user and temp folder names (`C:/Users/<user>/AppData/Local/Temp/...`). The same pattern was already public in 395 earlier files. They hold no credentials, and they are historical evidence bound by reviews, so they were left as committed.

**Remote verified:** `git ls-remote` gives `refs/heads/claude/v1-cc-blocker-closure` = `89796df9…` before this handoff commit.

**Fresh clone from the remote** (SSH, full history, into an empty scratch folder):
- **HEAD:** `89796df`; `ee256ae`, `e44d855`, `0c989da`, `96a8ccc` and `16577b6` present.
- **Windows-only caveat:** the longest tracked path is 163 characters (an asset under `ios/Sources/P0Host/Resources/assets/`). In a deep folder it passes Windows' 260-character limit, and the first checkout failed for that reason alone. Cloning with `-c core.longpaths=true` fixed it. macOS has no such limit.

**Results in the clean clone:**

| Check | Result |
|---|---|
| `v1-rc-1.mjs --check` (before and after `npm ci`) | exit 0, 87/87, seven amendments declared, no untracked file in CoachingCore |
| `link.mjs` | 41 modules, 759 statements, bundle 1 464 790 B, sha256 `f5d684e53410b5ab…`, 16 assets: equal to the committed `build-manifest.json` |
| `oracle.mjs`, `focal-oracle.mjs`, `core-oracle.mjs`, `int-oracle.mjs` | exit 0; collation 0 pairs, `localeCompare` calls 0; core digest `dfecdce2…` |
| `vm-check.mjs` with JIT and `--jitless` | `"ok": true` both |
| `git status` after all regenerations | empty: the committed bundle and fixtures are what a clean clone rebuilds |
| `v1core-freeze-7.mjs`, `v1int-boundary-1.mjs` | exit 1, by design, as above |
| Full suite `node --test` (CoachingCore) | tests 1934, pass 1888, fail 46 (507 s). The failing titles are exactly those of `evidence/suite-96a8ccc.txt` (`titles.mjs`: 0 new, 0 gone). They include the three by-design titles with green successors. `git status` was still empty afterwards |

**Portability:**
- The verifier, linker, oracles, drivers and vm-check use repository-relative paths (`import.meta.url`, `file:///p0/<repo path>` virtual URLs).
- No Windows absolute path is in them.
- Every file a clean clone needs is versioned, except `node_modules`, which `npm ci` restores from the lockfile.

## 5. Files the Mac needs (all in the branch)

**Engine and boundary:**
- Engine: `CoachingCore/src/` (entry `v1-safety-index.mjs`).
- Boundary: `src/boundary/integration.mjs`, `admission.mjs`, `custody.mjs`, `api.mjs`, `store.mjs`.
- The 16 data files read by URL.

**Records and their verifiers:**
- RC record `CoachingCore/v1/RELEASE_CANDIDATE_V1_RC_1.json`, verifier `CoachingCore/scripts/v1-rc-1.mjs`.
- The FREEZE-7 and V1INT records it reads.

**Harness** (`audits/v1-aif-p0-jsc-2026-11-17/`):
- `RUN.md` (`T()` §2A);
- `build/` (`link.mjs`, `entry.mjs`, `prelude.js`);
- `lab/` (oracles, focal driver);
- `ios/`: `Package.swift`, `DeviceHost/` Xcode project and scheme, `Sources/P0Host/` with the RC bundle, `build-manifest.json`, `assets-manifest.json` and 16 assets, and `Tests/P0HostTests/`;
- the fixtures `focal`, `core`, `int`, `j5`, `p16`.

**Mac package** (`audits/v1-core-safety-lifecycle-2026-11-18/mac/`):
- `README.md` (§14 and §15 present);
- `core-driver.js`, `core-oracle.mjs`, `int-driver.js`, `int-oracle.mjs`, `vm-check.mjs`.

**Contracts and reports:**
- `audits/v1-integration-boundary-2026-11-23/INTEGRATION_BOUNDARY_CONTRACT.md`;
- `audits/v1-blocker-closure-2026-11-24/FINAL_REPORT.md`, `NATIVE_OBLIGATIONS.md`, `V1_BLOCKER_INVENTORY.md`, `CYCLE1.md`, `evidence/`, `reviews/`.

## 6. Still open (unchanged by this handoff)

**For the physical run:**
- The bundle does not yet include the boundary.
- Until README §14 step 2 relinks it (`entry.mjs` exports `integration` and `store`, with `integration.mjs` `5b4530ed…`, `custody.mjs` `f58b5239…` and `admission.mjs` `fe78490f…`), the iPhone validates the engine, not the boundary.
- The prelude needs the host `hmacSHA256` / `constantTimeEqual` shims and a minimal `Buffer.from` (§14 step 1).

**Before real athletes** (`FINAL_REPORT.md` §G):
- SEC-BC-R2-01;
- the Founder's G07 retention confirmation;
- SEC-INT-05 rest, SEC-INT-12;
- SSCTR-BC-01;
- C-BC-3 / SSCTR-BC-05 copy;
- the native list;
- R7-B0 records renewal before **2027-04-30**.

**Founder decisions:** D1 (trusted clock, 300 s), D2 (backup), D3 (minimum iOS).

**State:**
- `READY_FOR_PHYSICAL_VALIDATION` (synthetic);
- `APPLICATION_NOT_READY`;
- `REAL_ATHLETE_READY` = NO;
- not the FINAL RELEASE FREEZE.

## 7. Physical-run constraints

**Where results go:**
- Logs go to `audits/v1-core-safety-lifecycle-2026-11-18/results/device/`.
- Strip the Team ID, UDID, Apple ID and personal paths from them (README §6).
- Write the report `IOS_REVALIDATION_REPORT.md`, with `IOS_REVALIDATED` or `IOS_REVALIDATION_FAILED` per criterion.

**The bundle's SHA must stay tied to the source:**
- A bundle SHA that differs from `build-manifest.json` means the source changed, and the run is not valid for this commit.
- After the §14 relink, record the new SHA.

**What only the physical iPhone proves:**
- HealthKit background delivery with the app closed;
- file protection while locked;
- the Keychain across reinstall;
- process death mid-write;
- disk full;
- CryptoKit HMAC equal to Node's;
- a real synced week.

**What this handoff does not do:**
- It changes no sporting rule.
- It is not a new freeze.
- It does not reopen any audit.
- It is no SwiftUI or backend work.
- It is not a public product release.
