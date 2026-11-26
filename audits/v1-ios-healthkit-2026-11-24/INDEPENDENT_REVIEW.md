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
