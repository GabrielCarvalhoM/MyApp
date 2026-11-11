# Security recheck: V1FC fix cycle (`06bbc7f`)

**Verdict: FAIL.** Gate: SECURITY_BLOCKED. One blocker is still open: **SEC-V1FC-01**, through a residual variant of the same keyless tamper. This was the single narrow recheck the rule allows, and I am the same judge as the review. The JSON record prevails.

**Method.** I extracted `06bbc7f` fresh with `git archive`. I reran my earlier probes without changes and added three new ones: `r1-tamper`, `r2-legacy` and `r3-target-kinds`. All data is synthetic. I did not run `verify` and deleted nothing recursively. Suite: 1258/1258. The host injected CLAUDE.md and MEMORY.md; no ruling rests on them.

| finding | status | evidence |
|---|---|---|
| **SEC-V1FC-01** (HIGH, blocks freeze) | **OPEN** | The tamper from my review (null the marker row, set `erased:true`) now fails. Moving the erased flag fails, an integer `of` pointer fails, and the hold-row variant fails. **Residual:** the seal counts a slot as erased only when `erased === true`, but `verify()` accepts a null row whenever `erased` is truthy (custody.mjs:74). Setting `erased` to `1`, `"true"`, `{}` or `[]` on the nulled marker, without the key, gives read OK and `VALID_PLAN` with 4 executable sessions. The fix's test only tries `true`. **Smallest fix:** in `verify()`, accept a slot as erased only when `c.erased === true`, and fail any entry that has an `erased` key with another value. Add those four values to the test. |
| SEC-V1FC-02 | CLOSED | R5 intake: `INVALID_INPUT`. Legacy program: `HOLD`. Nothing is stored and the account is not locked (the same id enrolls afterwards). Restart is refused and the record still reads. Other versions are refused too. |
| SEC-V1FC-03 | CLOSED | A target that differs from the reported session, an object, or a 100 KB string all give `INVALID_REQUEST` with no state change. A future-week session or a later session this week gives `ASK`, with nothing moved and no offer made. The other review kinds are unaffected. The past-week `ENGINE_CONTRACT_VIOLATION` belongs to QRE-V1FC-03 and is not reopened here. |
| SEC-V1FC-04 | OPEN, named condition before real data | The program still keeps `cause: CLINICAL`, the hold's kind and time, and the held sports after erasure, as FIX_CYCLE_V1FC.md records. |
| SEC-V1FC-05 | CLOSED | Erasing the report clears its cached question; the view returns to `VALID_PLAN`. |
| SEC-V1FC-06 | CLOSED | A review named alongside a health event keeps its decision entry on both erasure paths. |
| SEC-V1FC-07 | CLOSED | Revoking LEARNING closes the waiting learned rearrangement, and `accept` refuses it. |
| SEC-V1FC-08 | CLOSED | The inventory rows are present. All 18 custody error codes are free of canary words (`CHANGE_NOT_ADOPTABLE`), and telemetry is clean. |

**No new finding. No regression from the fixes** in any of these: CF-OBS-1 at both layers (a sweep of 24 kinds × 4 payloads under a hold), the V1 gate, the seal and chain, the decline memory, idempotency and versions, server-owned and unknown fields, the cross-athlete check, the tombstone, consents, the restart gates, adoption orderings, telemetry and push, and the event authority against client values.

## The four distinctions
1. **Synthetic candidate:** FAIL, because SEC-V1FC-01's residual blocks the freeze. Its fix is one predicate. Since the single fix cycle is used, whether that line may still be applied is a cycle-rule decision for the Founder through the Chief. Otherwise it closes as a named blocker.
2. **Integration boundary:** NOT_READY. Blocked by SEC-V1FC-01, §7's operational PENDING items plus the additions, and QRE-V1FC-03.
3. **Before real data:**
   - SEC-V1FC-01 and -04 resolved.
   - The operational pieces built: authentication, KMS, a production database with access control and encryption at rest, an external version counter, backups that reach erasure, monitoring, and rate and size limits.
   - Authority files pinned, including the event records file.
   - Learning-model handling after a LEARNING revocation, and per-purpose keys.
   - G07 (owner: the Founder with legal counsel; not ruled on here).
   - The SEC-V1CP pending items, and the F08/G04 wording.
4. **Real athletes:** NO. They need everything in item 3 plus human and clinical revalidation.
