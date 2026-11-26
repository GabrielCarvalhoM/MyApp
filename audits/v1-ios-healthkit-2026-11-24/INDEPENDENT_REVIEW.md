# Front B: independent review (as received)

Reviewer: QRE + Security, in a separate read-only session. It received the code and the authorities, not the author's conclusions (worker ≠ judge). Its probes ran only in a scratch copy, and the author applied no fix to its own review. The author's disposition of each finding is in `FINAL_REPORT.md` §8.

## R1, on `9570837`: READY_WITH_CONDITIONS

No BLOCKER and no HIGH. No path loses a workout, credits one twice, or reuses a `deliveryId` against §6.2, and the anchor never advances ahead of the queue entries it read. Five MEDIUM findings, each proven by a probe that failed on HEAD (P1–P6). Repo suite: 50/50.

| id | sev | finding |
|---|---|---|
| QRE-B-01 | MEDIUM | `purge` before the ingestor loaded reset the in-app switch to ON (and `authorizationRequested` to false) |
| QRE-B-02 | MEDIUM | waiting/halted/hostUnavailable did not break the "consecutive" retryLater streak: a run could be set aside early |
| QRE-B-03 | MEDIUM | a `deliveryConditionsChanged()` during an in-flight delivery was consumed by that delivery's stale waiting/NOT_RECORDED answer (lost wake-up) |
| QRE-B-04 | MEDIUM | `hostUnavailable` and B's own failed write were retried only on A's signal, not on the next trigger; a failed write in `deliveryConditionsChanged` dropped the signal |
| QRE-B-05 | MEDIUM | a purge whose write failed left the pre-purge items in memory, and they were still sent |
| QRE-B-06 | LOW | FND-ABC-06 (b) was not counted |
| QRE-B-07 | LOW | a route-query error meant "no route" (non-deterministic frozen bytes) |
| QRE-B-08 | LOW | the observer completion could run before the data was durable, and waited for the whole delivery |
| QRE-B-09 | LOW | `queue.json` is included in device and iCloud backups (D2) |
| QRE-B-10 | LOW | strict `Decodable`: a future field would make every existing file unreadable |
| QRE-B-11 | LOW | three tests proved less than they claimed |
| QRE-B-12..16 | NOTE | dead `storeLocked`; test hook in production code; `authorization` is B's bookkeeping; same id after a failed answer write; unproven on real Apple-source data, recordings in progress, held items not re-decided while blocked |

Verified clean: ownership and imports, the `deliveryId` rule, no double credit, the anchor written together with its entries, a locked file never overwritten, the §4.3 link (a restart yields new session ids, so an old link gets `UNKNOWN_SESSION`, never a wrong link), dedupe, normalization, status, logs, heart rate.

## R2, narrow recheck of `312cbef`: READY_WITH_CONDITIONS

P1–P6 pass at the new HEAD. Repo suite: 61/61.

| id | status |
|---|---|
| QRE-B-01, 02, 03, 04, 05, 06, 08, 12 | CLOSED (regression tests would fail on the old code) |
| QRE-B-07 | CLOSED (code only; not testable on macOS) |
| QRE-B-10 | PARTIAL (nested types are still strict; no round-trip test) |
| QRE-B-11 | PARTIAL (the waiting/halted loop still has no NOT_RECORDED; the streak is covered by the B-02 regression) |

| id | sev | finding |
|---|---|---|
| QRE-B-R2-01 | MEDIUM (regression) | the new read waiters deadlock if A awaits `deliveryConditionsChanged()` while B's call to `ingestContext()` is pending (probe N1 hangs at `312cbef`, passes at `9570837`) |
| QRE-B-R2-02 | LOW | purge edge cases: (a) a locked file throws, so G07 depends on A retrying; (b) an unreadable file turns the switch off, which deviates from item 15; (c) `remove()` before the write could leave no file after a crash |
| QRE-B-R2-03 | LOW/NOTE | after a background wake, the delivery to A runs after the completion handler and may wait for the next run (the workout is already durable) |
| QRE-B-R2-04 | NOTE | a route-only "not determined" now fails every read (unlikely in V1) |
| QRE-B-R2-05 | NOTE | `settled()` / `observerPump` are a test seam in production code |

Also verified: the conditions epoch is in memory only and captured just before `deliver`; attempts never count twice; the pending-write retry re-sends the same delivery id (a replay).

## Round O1 (OPEN-1 policy 2), on the working tree over `4cffa10`: NOT_READY

Same reviewer, same rules (read-only; probes in a scratch copy; no device). It received the request and the authorities, not the author's conclusions. Author suite: 90/90.

| id | sev | finding | disposition |
|---|---|---|---|
| QRE-B-O1-01 | HIGH | the app-recording dedupe was applied to the run's chosen copy only; (a) a copy matching an unplanned reported recording was consolidated into a delivered copy that did not; (b) a chosen copy set aside `OVERLAPS_APP_RECORDING` left the groups and its copy was promoted and sent | FIXED: set-aside `OVERLAPS_APP_RECORDING` stays a fixed member; the index is consulted for every copy (`ReviewOpen1RegressionTests`) |
| QRE-B-O1-02 | HIGH | any overlap > 0 s below `sameRun` was inconclusive; a copy's drift dragged a distinct back-to-back run into `RECONCILE_SEVERAL_RUNS`; a 1 s overlap of two watch runs held both (regression) | FIXED: 60 s touching tolerance, PROVISIONAL OPEN-B-3 |
| QRE-B-O1-03 | MEDIUM | no way to reconcile; CCP-B-07 had no "distinct runs" outcome | CCP-B-07 amended (keep a set of non-overlapping runs); "withheld until changed in Apple Health" left to Product/UX acceptance |
| QRE-B-O1-04 | MEDIUM (Sec) | SEC-INT-09 (a) not re-dispositioned by Security; policy doc said every run without a route is PARTIAL (false for indoor) | doc §6 corrected; Security disposition is an integration condition |
| QRE-B-O1-05 | LOW | lost-distance counter counted copies | FIXED with 01 |
| QRE-B-O1-06 | LOW | a promoted copy waited for the next trigger | FIXED (`pumpAgain`) |
| QRE-B-O1-07 | LOW | test gaps (restart leg never re-read; unplanned recording + copies; drift; migration without anchor) | FIXED: tests added or corrected |
| QRE-B-O1-08 | LOW | `FINAL_REPORT.md` still described policy 1 | FIXED |
| QRE-B-O1-09 | NOTE | group id not stable; `preferred` not a strict order; sync id ignores time; ledger regroup cost; migration read in background budget; reuse of `RecordingDedupe.sameRun` | `preferred` replaced by a strict total order (`representative`); the rest documented in the policy doc §4 |

Verified clean in O1: no edits to read-only paths and no new shared type; exact identity; chunking (40 runs + 40 copies); crash between send and answer; restart; deletions and new versions; reentrancy of a better copy during the index await; anchor written with both reads; policy-1 migration; user-entered runs kept off DEVICE; logs counts and codes only; close distinct runs kept.

## Round O1-R2, narrow recheck of the O1 fixes: NOT_READY (narrow)

01, 02, 05, 06 closed; `representative` deterministic and order-independent (all 24 orders).

| id | sev | finding | disposition |
|---|---|---|---|
| QRE-B-O1-10 | HIGH | the copy set used for the index check came from a snapshot taken before the awaits; a copy committed during the await that was the recorded run escaped it (two counts) | FIXED with the reviewer's checked sketch: copy set compared in phase 2, decided again on a change |
| QRE-B-O1-11 | MEDIUM | the 60 s tolerance was checked before `sameRun`: two copies of a run ≤ ~2 min were delivered twice | FIXED with the reviewer's checked sketch: tolerance only for a non-`sameRun` overlap |

## Round O1-R3, confirmation: READY_WITH_CONDITIONS

The applied code matches the checked sketches (comments only differ). 10 and 11 closed. Reviewer's full probe set on the final tree: 111/111 (101 author + 10 probes). Conditions (documents and owners, not code): CCP-B-07 "distinct runs" outcome (done in the amendment); Security disposition of SEC-INT-09 (a); SSCTR + Engineering on OPEN-B-1 and OPEN-B-3; the accepted limit of copies offset by nearly their whole duration.
