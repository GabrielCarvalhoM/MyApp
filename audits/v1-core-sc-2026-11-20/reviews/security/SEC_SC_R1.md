# SEC-SC-R1: Security decision on the Safety Continuity candidate

**Judge:** Security, Privacy & Abuse Architect, acting as the PCG security judge. I am an independent instance, not the author. **Date:** 2026-11-20. Synthetic athletes only. I read no QRE or SSCTR review of this mission.

## 1. Verdict

**PASS_WITH_CONDITIONS. One condition blocks the successor freeze: SEC-SC-01.**

| Item | Decision |
|---|---|
| SEC-O1-01b/c | **CLOSED** for synthetic use on its closing evidence. One pre-existing dating residual is filed as SEC-SC-02. |
| SEC-O1-02 / QRE-O1-02 | **APPROVED** (Security side). |
| SEC-O1-03 | Policy **APPROVED**. The implementation needs changes (SEC-SC-01, blocking). SEC-O1-03 closes only together with O-SC-1 and the app-boundary size limit. |
| C-O1-2, security side | **No exposure, credit or SB-1 gain.** C-Q08-1 is unchanged. |
| Regressions | **One SB-1 regression against FREEZE-6, introduced by the cap: SEC-SC-01.** No other regression. |

**SEC-SC-01, the blocking condition.** Past `VOICE_LIMIT`, the cap drops a genuine "took place" voice on a disputed row. That voice is SB-1's other signal (SEC_O1_R1 item 1). When it is dropped, SB-1 reads **DECLARED** where FREEZE-6 **asks**. The fix is narrow.

## Identities judged

| Input | Identity |
|---|---|
| Commit | `d6348ffe7d12849fddfe7e2bc99e65c56fd3ab86` (base `48e428f`, FREEZE-6) |
| `CoachingCore/src/v1-f08.mjs` | `7ec9b6d53be49dadcbd8ab5bd28e49b0df6f146545b2db8c322c0cf488e40997` (FREEZE-6 `f1065bf1…`) |
| `CoachingCore/src/r6-provenance.mjs` | `8a850a7410c4c8b57165c684e7a1e154b21ac5926ad0fbb83c67d8f85d243087` (FREEZE-6 `b206416f…`) |
| `test/v1core-sc-safety-continuity.test.mjs` | `55ae4262029046d1…` |
| `test/v1core-sc-successors.test.mjs` | `113ba47768860ccb…` |
| `CANDIDATE.md` | `6d0c360eb34fd9d8…` |
| `SUCCESSOR_LEDGER.json` | `c3a233b3b9fce56b…` |
| Earlier probes (copied, unchanged) | `p1.mjs` `80a6910f9567759f`, `p2.mjs` `6f0449467a5d9761`, `fuzz-o1.mjs` `af3dac0b6dc925b9` |
| New probes (scratch `sec-sc-q7w3/probes/`, outside the repo) | `p3b.mjs` `c330e64c1cebc3ad`, `p4.mjs` `df52f85df65d899e`, `p5.mjs` `b363b640cd4c06c6`, `p6.mjs` `13c3268f58822cd9`, `p6z.mjs` `47d08f44f677d78c`, `fuzz-dump.mjs` `9fcbb3ccc8fd8ca6` (adds a dump of the cases that differ) |

**How it was run.**
- Everything ran on `git archive` extracts of `d6348ff` and `48e428f` in a new scratch directory, with `node_modules` copied in. Every probe ran on both trees.
- One trial fix ran on a separate scratch copy (§4). It only shows that a fix is feasible; Core owns the fix.
- No verify script was run. `v1core-freeze-6.mjs --check` was run read-only. Nothing was committed or deleted. This file is the only repository write.

## 2. Decisions per item

### Item 1. SEC-O1-01b/c: CLOSED (synthetic)

**Every shape reproduced asks on the candidate.** The table counts the shapes that asked on each side.

| Shape (after the latest declaration) | FREEZE-6 | Candidate |
|---|---|---|
| `p1` B1–B5: a kept stop meets an athlete, no-source, SELF_REPORT or unknown-speaker correction naming N or S. Checked directly, after a JSON round trip, and after a re-read ×2. | 0 of 5 asked | 5 of 5 ask |
| `p2`: an unknown speaker names N after the athlete's correction | ASK | ASK |
| An admitted stop (no dispute) corrected away to "not done", `stop:false` or `stop:null`, by an athlete, no-source, unknown or device speaker; also chained twice (S→S2→S3) | 0 of 7 asked | 7 of 7 ask |
| An admitted stop corrected to "done 40" (asks either way) | ASK | ASK |
| A stop whose reason is TIME or WEATHER, or `stop:true`, `{}`, `'x'` or `0`, at zero minutes | 0 of 6 asked | 6 of 6 ask |
| A zero-minute stop carried by an agreeing merge (device + athlete), then the athlete's correction drops it (`p6z`) | DECLARED | ASK, the stop read from the history row |
| A refused correction (`INVALID_CORRECTION_CHAIN`); an exact replay; an earlier declaration replayed | ASK | ASK |

**What still releases or never asks, as agreed (no over-asking).**
- A later declaration answers the stop: DECLARED in all seven correction shapes and in `C5`.
- A new stop after that later declaration asks again (`C4`).
- A stop-less "done" retracted by its own speaker gives DECLARED (`D1`).
- A stop observed before the declaration gives DECLARED, even when it is corrected after the declaration (`D3`, `D4`).
- `stop:false` and `stop:null` in force give DECLARED.

**Clinical holds stay independent.**
- A clinical `INTERRUPTION_DECLARED` after the later declaration gives `CLINICAL_HUMAN_REQUIRED` (`E1`). The SB-1 path is read only after the clinical path.
- No stop produces a clinical status.

**A stop cannot be fabricated.** Seven integrity-refused stop reports were tried: foreign athlete, invalid minutes, event id reused, borrowed activity, future report, report before observation, and a self-flag with an invalid chain (`F1`–`F7`). In every case the stop is excluded, the record is unchanged and the result is DECLARED. The fuzz kept **0** integrity-refused ids as voices.

**Engine journeys.** The focal engine tests (weekly reviews, round trip, replay, the restart asking and then being answered) are green on the extract.

**Residuals, not closed by this item:**
- **SEC-SC-02:** dating by the row.
- **SEC-SC-03:** a same-day stop reads no pause.
- An unknown speaker's correction retracting a stop-less "done" gives DECLARED (`D2`). This is pre-existing E-1, the weaker "done" signal, and belongs to the SEC-CORE-03 dependency.

### Item 2. SEC-O1-02 / QRE-O1-02: APPROVED

**`p1` C1 and C3 now equal C2.**

| Case | FREEZE-6 | Candidate |
|---|---|---|
| C1 (borrowed activity, then the stop) | `N{}`, DECLARED; the next review DECLARED | `N[C]{N,S}`, ASK; the next review the same |
| C3 (self-flag, then the stop) | as C1 | as C1 |
| C4 (re-sent next review) | ASK | ASK |

**Fuzz (`fuzz-o1.mjs`, 3 seeds × 1500 cases).** Counts are cases where SB-1 differs by arrival or batching.

| Seed | FREEZE-6 | Candidate |
|---|---|---|
| 4242 | 86 | 2 |
| 99 | 74 | 1 |
| 7 | 72 | 1 |

- **The 4 remaining cases are integrity first-claim cases**, byte-identical on FREEZE-6 (`fuzz-dump`): three event ids reused across reports, and one device activity claimed first by another session across reviews. In each, the stop report is itself the integrity refusal (P3, item 4). None is a phantom quarantine.
- Integrity-refused ids kept: 0. Re-read and round-trip changes: 0.

**What stays the same (`p5`, both trees).**
- The borrowed and self-flagged refusals are unchanged.
- The holder `Z` keeps `ACTIVITY_BOUND_TO_TWO_SESSIONS`.
- `quarantinedIdentities` is identical.
- **No credit gain:** a later "done" now disputes the "not done" (CONFLICTED, no credit) instead of being lost.
- The author's 4 differential gains equal the two-review reading. An actor can already obtain that reading by splitting reviews, so the change grants no new power.

### Item 3. SEC-O1-03: policy APPROVED; implementation needs changes (SEC-SC-01)

**What the cap does.**

| Shape | FREEZE-6 | Candidate |
|---|---|---|
| 2000 unknown-speaker voices, 1 KB pad each | 2001 voices, 2.62 MB, 1728 ms | 16 voices, 20.7 KB, 492 ms; still CONFLICTED |
| 2000 stops | 2.68 MB | 21.2 KB, ASK |
| Replay of those 2000 | | Byte-identical record; the excess re-refused into `excluded` with nothing written |

**What is approved:**
- the limit, 16, against a measured maximum of 6;
- the excess stays refused with its input hash;
- the stop exception;
- P7 failing beyond the limit, as an abuse-regime cost, **provided that no safety or dose reading depends on which voices survive**. SEC-SC-01 shows that today this does not hold.

**SEC-O1-03 does not close by the cap alone.** Two more bounds are needed:
- **O-SC-1, reproduced:** 2000 *agreeing* reports give 2000 parts, 2000 `mergedSourceIds` and 2.63 MB on both trees. This is unbounded growth from accepted input (R7-A, pre-existing).
- **The per-report byte size at the app boundary (C-F01-2):** `partOf` still clones the whole `actual`, padding included.

### Item 4. C-O1-2, security side: no gain

**Forged labels.** The incoming normalizer strips the parts but keeps a client-supplied `provenance.conflict` label on a self-flagged report (pre-existing). Forged parts never reach the record (`H1`: parts `null`).

| Shape | Occurrence | Effect |
|---|---|---|
| A forged `CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS` label plus a second "done" voice (`H2`) | Read (the last day moves) | Exactly what the honest head-on gives (`H3`) |
| Honest agreeing reports (`H3b`) | | Merged and credited, which is more than the forged occurrence |

In every shape:
- the bounded `recent` stays 0/0, so C-Q08-1 is unchanged (the author's differential agrees: 0 in 12 configurations);
- SB-1 still asks, with a stop or with a "done" voice (`H4`, `H5`);
- the integrity flags show no occurrence (focal and successor B7).

**What an occurrence can do.** It only ends the pause, as the honest report does. The one exception is SEC-SC-01(b) below.

### Item 5. Regressions

**Directed suites on the candidate: 121 tests, 113 pass.** The suites: SC focal and successors, O-1, O-1 successors, cf011r2, v1cp-f08 and NCC.

**The 8 failures:**
- **Four ledger moves:** O-1:146, A12, B4-B5 and B7. Each has a green successor.
- **Four pre-existing failures**, identical on `48e428f`: the cf011r2 `SEC-R2-01 engine-written orphan`, NCC F1, NCC F3, and the scenario 21 successor.

**Other results:**
- SEC-R2: 24/24.
- `p1` E (suppression), F (fabrication) and H (determinism): byte-identical to FREEZE-6.
- `v1core-freeze-6.mjs --check` reports the expected drift. It also lists `v1-f08.mjs` and the two new test files as "CHANGED and not declared". The successor freeze must declare them; this is a record item only.

**The only SB-1 regression is SEC-SC-01.**

## 3. Findings

| ID | Severity | Blocks successor freeze | Runtime | What | Closing evidence | Owner |
|---|---|---|---|---|---|---|
| **SEC-SC-01** | **Medium** | **Yes** (one narrow cycle) | Yes (`keepVoice`, one line) | Past the limit, a refused voice is dropped unless it is a first stop. Two consequences, both in the abuse regime (16 or more disputing voices on one session): **(a)** with 20 conflicting "not done" voices, a genuine "done 40" after the declaration is dropped, and SB-1 is **DECLARED** (FREEZE-6: ASK; with 3 voices: ASK). This is a regression of SEC-V1CPI-02/RC-11 and contradicts SEC_O1_R1 item 1. **(b)** With 20 conflicting "done" voices, a genuine "not done" is dropped, so C-O1-2 reads an occurrence: the RUN pause is **5 days instead of 20**. This errs short and depends on arrival order. Exposure is unchanged. | `p4` gives a_K20 ASK and b_K20 pause 20. The SEC-O1-03 focal test is green, and the 2000-voice spam stays bounded. A mutant that removes the added classes is killed. Two acceptable mechanisms: **(i)** beyond the limit, also keep a voice that adds a class no kept voice has ("took place", "did not take place"; the stop as now). That bounds a row at `VOICE_LIMIT+2`. My scratch trial of (i) gives `p4` all ASK with pause 20, keeps 16 voices at 2000 spam, and keeps the SC focal, successor and O-1 files green except the by-design O-1:146. **(ii)** Withdraw the cap from this freeze, leaving SEC-O1-03 open. | Core; Security narrow recheck of exactly these items |
| SEC-SC-02 | Medium (pre-existing; this is SEC-O-O1-2 now shown on item 6) | No | Yes | Voices are dated by their row's `observedAt`. Parts keep no `observedAt`. A stop (or "done") report on a session whose row was observed before the declaration, itself observed after it (for example a planned session done late), is kept as a voice and SB-1 is **DECLARED** (`p3b` G2, G4; both trees). A correction that moves `observedAt` does ask (G3). | Each voice is dated by its own observation: keep `observedAt` in `partOf`, read it in `stopOnRecord`/`claimsDone`. Then G2 and G4 ask, and D3 and D4 stay DECLARED. Before a real-athlete restart. | Core with QRE (C-F01-1 r2); SSCTR on whether a late execution of a planned session is the same execution |
| SEC-SC-03 | Low (pre-existing) | No | Maybe | A stop with minutes > 0 observed on the restart day ends the pause at 0 days. `facts.pause` is then null, so SB-1 asks nothing even after a declaration (`p3b` G1 `NO_PAUSE`, both trees). | Decide whether a stop after the declaration with no pause still raises the readiness question, and add a test. Before a real-athlete restart. | Core + SSCTR |
| SEC-SC-O-1 | Low (observation) | No | No | The fuzz residual is the integrity first-claim class: an event id reused, or a device activity claimed first by another session. A forged earlier claim on the athlete channel can get a later genuine report refused. | None here: it is carried by SEC-CORE-03 and C-F01-2 (activity provenance at the boundary) | Core/QRE |
| SEC-SC-O-2 | Low (observation) | No | Yes (optional) | The incoming normalizer keeps a client-supplied `provenance.conflict` label. Since C-O1-2 the label has meaning, but it gains nothing over honest reports (item 4). | Strip `conflict` on incoming, as `parts`, `mergedSourceIds` and `inputHashes` already are (OOS-1 class) | Core |
| SEC-O1-03 remainder | Medium | No | Yes | O-SC-1, the agreeing-merge growth, and the app-boundary per-report size limit | A bounded record for 2000 agreeing reports; a report size limit at the boundary. Before real athletes. | Core; C-F01-2 owner |

## 4. Dependencies (stated, not closed)

- **SEC-CORE-03 (correction author not authenticated).**
  - The speaker rule now settles only amounts. It can no longer clear a stop (item 1 holds whoever speaks).
  - It can still retract a stop-less "done" (`D2`), win a first claim (SEC-SC-O-1) and choose the resolution within credit or no credit.
- **C-F01-2 (custody and boundary).**
  - Stored parts, `availableAt`, `inputHashes`, bindings, and the client-supplied labels and sizes are trusted as custody.
  - The SEC-O1-03 remainder needs its size limit at the boundary.
  - SEC-NCC-03 and OOS-2 are unchanged.
- **C-O1-3** is not implemented, and correctly so (CANDIDATE §D). It is not in Security's scope here.

**Before real athletes:** SEC-SC-02, SEC-SC-03, the SEC-O1-03 remainder, SEC-CORE-03 and C-F01-2. The synthetic successor freeze needs SEC-SC-01 closed first.
