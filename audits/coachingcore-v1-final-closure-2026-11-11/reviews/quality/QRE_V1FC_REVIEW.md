# QRE review of the V1 Final Closure candidate (QRE-V1FC-REVIEW-r1)

**Candidate:** `2d089c0` (base `3b14804`), reviewed as `git archive` extracts in the reviewer's scratchpad. The JSON record next to this file is the authoritative one.
**Question:** is the V1-scoped CoachingCore ready to freeze, from the reliability side?
**Verdict: NOT_READY.** There are two blocking findings. Each has a small directed fix that fits in the one allowed cycle.

## Blocking findings

| Id | Severity | Reproduction | Smallest fix |
|---|---|---|---|
| QRE-V1FC-01 | HIGH, marathon only, latent | Take a marathon block. Send `EVENT_DATE_CHANGE` with the race at plan start + 9 days: the engine answers MODIFY and puts the race in week 1. At + 35 days: a 2-week build, then taper, then the race. An intake with the same dates gets the preparatory plan (`RACE_TOO_CLOSE`). This bypasses B1.6 and SSCTR B4. | If a marathon's new date is less than 12 weeks after plan start, ask for a new plan. Simpler alternative: a marathon date change always asks for a new plan. Add a test. Closure by scope instead: the freeze keeps MARATHON off. |
| QRE-V1FC-02 | HIGH | Send `NOT_FEELING_100` with no condition, with condition `FLU`, or with an unknown sign key, and the 9 generic signs answered no: V1 answers KEEP. At `3b14804` the same input asks for the condition or the unknown key. When the condition is omitted, 6 of an illness's 15 signs are never asked. Custody forwards `wellbeing` unvalidated, so the app can send this. | In `temporaryReductionOutsideV1`, validate the input the way `readWellbeing` does before answering KEEP: check the condition vocabulary, unknown keys and non-boolean values. Add a test. |

QRE-V1FC-01 cannot happen today: no V1X-MARATHON record exists in the candidate or in the worktree. QRE-V1FC-02 is a reliability regression against `3b14804` whatever SSCTR rules on the sign set. Both are routed to SSCTR for the sporting reading.

## Non-blocking findings

| Id | Severity | What | Smallest fix |
|---|---|---|---|
| QRE-V1FC-03 | MEDIUM, pre-existing at 3b14804 | A second report of a session already on record, sent without `correctionOf`, fails with ENGINE_CONTRACT_VIOLATION. | Return a typed answer (ask for the correction, or say it is already recorded). This is an integration condition. |
| QRE-V1FC-04 | LOW | A V1 restart over a record holding a temporary-reduction report returns PROPOSED, then every later review is HOLD. | Under V1 scope, the restart returns HOLD `record.outsideV1Scope`. |
| QRE-V1FC-05 | LOW | Through `v1-index`, the `eventExtension` and `eventRecords` options can enable a marathon without any record. Custody passes no options. | Integration condition: never pass options. Or strip them outside development, and correct the comment. |
| QRE-V1FC-06 | LOW | Which events are on is set by a records file outside the candidate bytes, read once at module load. The worktree now holds one, untracked (`b2bcc23a…`, approves the 5K only). | The freeze names that file and its hash, and reports EVENT_EXTENSION against it. |
| QRE-V1FC-07 | LOW | 8 of 36 mutants survive. M04, M09, M15, M26, M30 and M35 are test gaps. M13 and M14 are defence in depth that no current path can reach. | Directed tests for each test gap (listed in the JSON). |

## What was verified, and how (all probes executed)

- **Suite.** 1243/1243 on the candidate, run twice, the second time under load; no test was flaky. The base `3b14804` gives 1213/1213. The journeys script regenerates its output byte for byte.
- **V1 scope.** 490 checks found no way to open a temporary reduction or record its facts. They covered every review kind and 15 aliases or near-misses, Situation 1 payloads sent on other kinds, caller options, a held-signal reference, a research-made record or program under V1, and custody. A foreign record or plan gives HOLD.
- **Offer path, through custody with the real engine.**
  - Both evaluations always agree on the record.
  - MOVE: pending, accept, decline, expiry (the moved day itself still counts), and supersession by a later review, a new plan or a consent revocation, each closed with its cause.
  - Retries: the same request is replayed; a different body under the same request id is refused.
  - A real (not stubbed) learned rearrangement is offered once; after the decline it is not offered again.
  - In 80 evidence submits, no applied change moved a session to another day.
- **Event extension fails closed.** Checked against altered or missing extension bytes, malformed, partial, vetoing or foreign records, a tampered program binding, and goal changes into a 5K or marathon (they ask). The candidate's default authority gives the 5K fallback and an UNSUPPORTED marathon.
- **Differential.** 990 digest lines over 48 programs (10 10K, 13 half marathon, 25 non-event) and their reviews are byte-identical between `3b14804` and `2d089c0`. This holds for r6 and v1 entries, under both the development and the default authority.
- **B1.8 projection re-read.** Over 2592 intakes: it terminates, is deterministic, and never flips between block and preparatory plan. All 144 blocks reach 150 minutes.
- **JSON round trips** of 5K and marathon programs work in custody's memory and file stores, and the seal verifies. Malformed inputs always return a status, never an exception.

## States

- **RUNTIME_CORRECTNESS:** NOT_READY (QRE-V1FC-02, and QRE-V1FC-01 for the marathon).
- **V1_SCOPE_ENFORCED:**
  - Temporary reduction: enforced.
  - Marathon eligibility on a date change: not enforced (latent).
- **EVENT_EXTENSION:**
  - 5K: fails closed. Off in the candidate bytes; on under the untracked worktree record.
  - MARATHON: off, and not ready to enable.
- **F08_STATUS:** Situation 1 is unreachable in V1 and Situation 2 is unchanged; the screen has QRE-V1FC-02.
- **RECORD_CUSTODY_STATUS:** a synthetic reference implementation; the operational items are still PENDING.
- **INTEGRATION_READY:** NO.
- **Real athletes:** NOT AUTHORIZED.

## Not verified

- Sporting or clinical adequacy (SSCTR's).
- Security beyond the paths these probes touched.
- The app, a device, or a production store.
- Concurrency of the file store across processes.
- The marathon under a real record (none exists).

## Disclosure, probes and recheck

**Host context.** The host injected a global CLAUDE.md, the project CLAUDE.md and MEMORY.md. They were used only to orient; their hashes are in the JSON.

**Probes.** Every probe script and output is under `C:/Users/carva/AppData/Local/Temp/claude/858165ffefe5d744/59c304d8-d767-447e-b589-a66e8b74bd72/scratchpad/qre-probes`.

**Recheck after the one fix cycle.** Rerun `p1c-condition.mjs`, `p2b-mdate.mjs`, `p2-events.mjs` and `p3-diff.mjs`, then the suite, then the mutants for any new tests.
