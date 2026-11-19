# O-1 Conflict Evidence & Safety Policy Closure: final report

**State: CLOSED, freeze emitted.**

- **The freeze:** **COACHINGCORE-V1-CORE-SAFETY-FREEZE-6** (`CoachingCore/v1/RUNTIME_FREEZE_V1CORE_6.json`). It binds 60 files at `8389ff9` (filesDigest `e670817b…`).
- **The runtime:** `src/r6-provenance.mjs` only, sha256 `b206416f…` (from `4ccca2d`).
- **Verification:** `node CoachingCore/scripts/v1core-freeze-6.mjs --check` gives 60/60.
- **Earlier freezes:** the ten earlier records are FREEZE-5's bytes. Every sporting freeze is untouched. By design, `v1core-freeze-5.mjs --check` now names this line's files.
- **The line:** branch `claude/v1-core-conflict-policy`, worktree `.claude/worktrees/v1-core-o1`, from `f40fbe1`. Nothing has been pushed or merged.

Records:
- `POLICY.md` (r1);
- `CANDIDATE.md` (§B is the policy as decided, r2);
- `SUCCESSOR_LEDGER.json`;
- `evidence/`, `bench/`;
- `reviews/` (SSCTR, Security and QRE, R1 and R2 each).

## The fourteen questions

1. **Is SSCTR-NCC-01 closed?** Yes, for synthetic use (SSCTR_O1_R1 §3, R2). The refused voice is kept, scenario 21 and S21b agree, and both stay CONFLICTED until the speakers agree.
2. **Is SEC-NCC-02 closed?** Yes, on its stated evidence (SEC_O1_R1 §3, R2). f08's SB-1 hears a refused report's stop, `e7` asks, and this survives a re-read, a JSON round trip and a later review. Its residuals are SEC-O1-01b/c and SEC-O1-02.
3. **Is the O-1 policy formalized and approved?** Yes.
   - P1, P3, P4 and P5 were adopted by both judges.
   - SSCTR replaced decision A: a disputed session counts as occurred when every voice says it took place (C-O1-2), and an uncontested adverse response is read in every order (C-O1-3). Both are deferred, and both err long or low in the meantime.
   - Security replaced items 6/7 (SEC-O1-01b/c) and SSCTR agreed. No divergence goes to the Founder.
4. **How does a refused report keep what resolving the conflict needs?** A report refused only because it conflicts with the row in force for its execution, or because that execution is already in dispute, is kept as a voice of the flagged row. It is stored as a `provenance.parts` entry plus its input hash, in the existing part format. It survives re-reads, restores and later reviews, and the history row keeps it once a correction retires the row. A correction resolves the dispute only by agreeing with every carried voice. While a dispute stands, a correction replaces only its own speaker's voices. Arrival order and the id the client names do not change the outcome.
5. **How is a safety signal kept without becoming sporting evidence?**
   - The kept voice is never merged into the row's amount and never put in `mergedSourceIds`. The row stays CONFLICTED: no credit, HOLD, and withheld from run history, calibration, forecast, Pace Insights and strength loads.
   - f08's `claimsDone` reads every voice, so a stop after a readiness declaration re-opens the question (ASK). That is the only effect: no clinical state, no restriction, no referral.
6. **Can a conflict end without a valid resolution?** No, in every case covered.
   - A re-read, replay, JSON round trip, re-sync of the same bytes, refused correction or non-agreeing correction leaves it standing.
   - 12 differential configurations show 0 unmerged voices on a clean row.
7. **Can a screening be forgotten after a review or a restore?** Not in the covered paths: the voice persists, and SB-1 asks after a re-read, a round trip, a later review and a restart (focal tests, Mac journey `o1-readiness`). There is one open residual, **SEC-O1-01b/c**, binding before a real-athlete restart: a correction can still set a kept stop aside in four shapes (CANDIDATE §B).
8. **Can an untrusted event bypass or fabricate decisions?** Reports refused for integrity are never kept (0 in Security's fuzz and in the differential). A kept voice can at most cause an ASK or keep a session CONFLICTED, which errs low. It never gains dose or clinical authority. Still open:
   - SEC-CORE-03 (a correction's author is not validated) and C-F01-2 (custody);
   - SEC-O1-02 together with QRE-O1-02 (phantom quarantine, pre-existing);
   - SEC-O1-03 (unbounded voice spam).
9. **Did any dose change?** Yes, only downward:
   - In 6 of 62 lineage rows, sessions 18 and 21 stay CONFLICTED, so LONG w+2 drops QUALITY 34 min and EASY w+3 drops one EASY from 70 to 65. The long-run sizing source moves 365 → 360 with minutes and km unchanged. Row 19 now reads like rows 08/10.
   - In the RWS-B-01 shape, a disputed 100-min claim is no longer credited.
   - Over six weeks the effect is bounded (SSCTR `dose6`).
   - No rule, threshold or formula changed, and Pace Revision stays off.
10. **Do F1/F2/F3 and the earlier freezes still hold?** Yes.
    - The FREEZE-5-class invariants are 0 in all 12 configurations.
    - NCC, SEC-R2, f08 and C-F01-1 r2 pass, apart from the 6 by-design moves, each with a green successor, and the pre-existing failures.
    - The suite is **1823 / 1786 / 37**: FREEZE-5's 31 failures plus 6 by design, all with successors.
11. **What did performance cost (Node)?**
    - Review ×0.98, restart ×1.01, normalizer ×0.99–1.02.
    - Record ×1.00 on dispute-free journeys, ×1.028–1.042 on dispute-heavy generated records, with the largest row at most +295 B.
    - No iPhone claim.
12. **What still stands before real athletes?**
    - Before a real-athlete restart: C-O1-2, SEC-O1-01b/c.
    - Before weekly-review gating: C-O1-3.
    - Before real athletes: SEC-O1-02 with QRE-O1-02, SEC-O1-03, C-O1-5 (an athlete act against a device voice: Product/UX).
    - Unchanged: C-F01-2, SEC-CORE-03, C-NCC-3, SEC-NCC-03 (migration of stored records), OOS-1/2, local custody, and **IOS_REVALIDATION_PENDING**.
13. **Is the Mac package ready?** Prepared (README §12, `evidence/MAC_PACKAGE.json`):
    - the bundle is relinked to `679fcf48…`;
    - there are two new journeys;
    - `ncc-late-report` moves digests only, with 0 differences once kept voices are removed;
    - J5 and P16 are unchanged;
    - vm-check is ok with JIT and with `--jitless`, and a second run changes nothing.

    No JavaScriptCore run was made on Windows.
14. **What is the next minimal action?**
    1. The Founder authorizes the push of `claude/v1-core-conflict-policy` (and of the earlier unpushed lines).
    2. The Mac/iPhone run: README §2–§4 and §8–§12.
    3. A narrow Core mission for the restart-binding items: SEC-O1-01b/c (a declared stop keeps SB-1 asking until a later declaration) with C-O1-2, then SEC-O1-02/QRE-O1-02 and C-O1-3.
    4. Then C-F01-2 custody.

    No further mission is started here.

Proposed human-queue items, not appended: HQ-SSCTR-O1-01 to -04.
