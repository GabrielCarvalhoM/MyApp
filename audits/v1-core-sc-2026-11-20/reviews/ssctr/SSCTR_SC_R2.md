# SSCTR narrow confirmation of Safety Continuity cycle 1, R2 (2026-11-20)

**Verdict on `a0fe31a2eb0062b72fbb99b10c8ca2dee5e9a6aa` (runtime `aca0f63`): ACCEPT_WITH_CONDITIONS, unchanged from R1. Nothing blocks the synthetic successor freeze.**
- The `keepVoice` fix closes **O-SC-S3** and makes no sporting change within the voice limit.
- CYCLE1.md §2 discharges **C-SC-1, C-SC-2 and C-SC-3** as written.

Apart from that, SSCTR_SC_R1 stands.

## Reviewer, bytes, method

**Reviewer:** SSCTR (SSCTR-1.0.0 / SSCTR-CONST-1.0.0), claude-opus-5-5, the same instance as R1.
- Authority: PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, nonclinical only.
- No human review took place, no clinical judgment was made and nothing was delegated. No literature was needed: this is an admission rule.
- I read CYCLE1.md, the runtime diff and the three new tests. I did not read the Security or QRE reviews.

**Bytes:** a `git archive` extract of a0fe31a (`…/scratchpad/ssctr-sc-r1-q7m2/xc1`).
- `r6-provenance.mjs`: `cd0ede9d9d178691fa02be9b64d07a27449c51e500b09cc1edf2d76a02b7928a`, +4/−1 against d6348ff.
- `v1-f08.mjs`: `7ec9b6d5…0997`, unchanged.

**Commands:**
- Focal file plus successor file: **25/25**.
- `lineage-dump.mjs DOSE=1`: SHA-256 `317b7d9a…7d`, byte-identical to R1.
- My probes `occ2`, `adv2`, `dose6`, `rwsb01`, `cls` and `integ`: byte-identical to their d6348ff outputs.
- I did not run the full suite, `npm run verify` or `verify-r*`.

## The fix

**What it does.** Past `VOICE_LIMIT`, a report is also kept when it says "took place" or "did not take place" and no kept voice says so yet. Before this change, only a first stop got that exception.
- `took` is f08's `did` (completed, or minutes > 0). `untaken` is its complement.
- f08's three readings (a stop, "took place", every voice "took place") therefore always see at least one voice of each kind the input holds, whatever the arrival order.

**O-SC-S3: CLOSED.**
- Test (a): 20 "done" reports, then the athlete's "not done". The "not done" is kept, and the last executed day and the pause are equal in both orders. So a dropped denial can no longer shorten the pause.
- Test (b): the same holds for a "done" after the declaration. SB-1 asks in both orders.

**No sporting change.**
- Within 16 voices nothing changes; the lineage matrix and all probes are byte-identical.
- Past the limit, the change only keeps a voice that makes a reading more conservative: no occurrence, or an SB-1 ASK. It never adds credit: the row stays CONFLICTED, and kept voices are never dose.
- At most 19 voices are kept.

**Residual, folded into C-O1-3.** Past the limit, an ADVERSE response can still be dropped, depending on arrival order. The protective readers do not read kept voices yet (C-O1-3), so this changes nothing today. When C-O1-3 is implemented, its readers must not depend on which excess voices were kept. That is to be checked in C-O1-3's SSCTR recheck. No new condition.

## R1 conditions

| Id | CYCLE1.md §2 | Status |
|---|---|---|
| C-SC-1 | States the pause shortening (35 → 5 days in `cls`), run doses equal to the absent case, strength 19 → 27 min as an undisputed run gives, SB-1 ASK, the SEC-O1-02 credit equalization, and no in-program change | **Discharged** for the successor-freeze record, which must carry this text |
| C-SC-2 | Reason corrected to "the flag disputes which session the evidence belongs to"; `integ.mjs` cited; the f08 comment deferred to f08's next runtime change; O-SC-S4 open | **Discharged**. The comment fix stays bound to f08's next runtime change |
| C-SC-3 | 3 of 4 orders; policy decided in SSCTR_O1_R1 A; implementation remains; binding and owner unchanged | **Discharged** (record). C-O1-3 stays open before real-athlete weekly-review gating |

**Unchanged from R1:** O-SC-S1, O-SC-S2 and O-SC-S4 (observations), C-O1-3, C-O1-5 and the carried items. SEC-O1-03 PARTIAL is a Security and QRE disposition. I have no sporting objection to it.

**Human queue:** HQ-SSCTR-SC-01..03 stand as proposed in R1 (proposed only, not written). **Re-review trigger:** add any change to `took`/`untaken` or to the voice-limit exceptions.
