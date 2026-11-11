# Security recheck 2: SEC-V1FC-01 on `a23460b`

**SEC-V1FC-01: CLOSED.**

**Verdict on the V1-scoped synthetic candidate: PASS_WITH_CONDITIONS** (SECURITY_READY_WITH_CONDITIONS). **Nothing in this role blocks the freeze.**

The JSON record prevails. I am the same judge as in the review and the first recheck. I reviewed a fresh `git archive` extract of `a23460b`. The suite passes 1258/1258. I used synthetic data only, ran no `verify` scripts and did no recursive deletion. The host injected CLAUDE.md and MEMORY.md; no ruling rests on them.

## SEC-V1FC-01
- **`r1-tamper.mjs` (the residual):** nulling the marker row and setting `erased` to `1`, `"true"`, `{}` or `[]` now fails as `INTEGRITY_FAILURE:entry`. At `06bbc7f` each of these read as `VALID_PLAN`.
- **`r4-entry.mjs` (wider sweep):** I tried 24 forms a chain entry or row slot could take on a record with an annotation entry, an erased slot and a marker. Every one either fails verification or leaves the view BLOCKED, so no form releases the hold. The forms:
  - `erased` as false or null, or true on an annotation entry;
  - `of` removed, as a string, a float or null;
  - `seq` as a string;
  - an extra key, or a `__proto__` key;
  - a null entry, or a duplicated entry;
  - content in an erased slot or an annotation slot;
  - the marker replaced by an older row;
  - rows extended.
- The seal and the verifier now read the erased flag the same way.

## New finding (INFO, not blocking)
**SEC-V1FC-09:** `link()` builds its MAC input as a string, so a one-element-array form of a field produces the same input. An erased slot's `digest` written as `["<hex>"]`, or an entry's `recordedAt` written as `["<time>"]`, still verifies. Nothing outside `link()` reads either field, so there is no effect. Optional hardening: check that both fields are strings in the entry check.

## No regression
- A clean record verifies.
- A record with an annotation entry, an erased slot and a marker verifies.
- A file-store round trip through a new store and a new custody verifies.
- The tamper suite gives `INTEGRITY_FAILURE` on read and write.
- A foreign key fails.
- Idempotency, versions, the cross-athlete check, consents, the tombstone, CF-OBS-1 at the engine layer, the decline memory, adoption orderings and erasure scope all hold.

## The four distinctions
1. **Synthetic candidate:** PASS_WITH_CONDITIONS. No blocking finding remains.
2. **Integration boundary:** NOT_READY. It needs §7's operational PENDING parts with the additions, plus QRE-V1FC-03.
3. **Before real data:** it needs:
   - **SEC-V1FC-04** resolved (named condition): the stored program keeps health-derived planning entries of erased events;
   - authentication;
   - KMS with per-purpose keys;
   - a production database with access control and encryption at rest;
   - an external version counter;
   - backups that honour erasure;
   - monitoring;
   - rate and request-size limits;
   - pinned authority files, including the event records file;
   - the learning model after a LEARNING revocation;
   - G07 (owner: the Founder with legal counsel; not ruled on here);
   - the SEC-V1CP pending items and the F08/G04 wording.
4. **Real athletes:** NO. Everything in item 3 plus human and clinical revalidation.
