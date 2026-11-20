# Safety Continuity: the one correction cycle (after R1 on `d6348ff`)

R1, as received, is committed in `1211fb1`:
- SSCTR_SC_R1: ACCEPT_WITH_CONDITIONS, nothing blocking;
- SEC_SC_R1: PASS_WITH_CONDITIONS, with **SEC-SC-01** blocking;
- QRE_SC_R1: READY_WITH_CONDITIONS, with **QRE-SC-02** binding the runtime and **QRE-SC-01** binding the record.

SEC-SC-01 and QRE-SC-02 are one defect. Both judges preferred the same fix. This is the mission's single focal cycle.

## 1. The runtime change: `r6-provenance.mjs` `keepVoice` only (commit `aca0f63`, sha256 `cd0ede9d…`; f08 unchanged at `7ec9b6d5…`)

- **The defect.** Past `VOICE_LIMIT`, only a first stop was kept. But f08 reads three things from the voices:
  - a stop (`stopOnRecord`);
  - "took place" (SB-1's `claimsDone`);
  - "did not take place" (`occurred`'s every-voice rule).

  So past 16 voices, arrival order could drop a genuine "done" after the declaration, and SB-1 then read DECLARED where FREEZE-6 asked. It could also drop a genuine "not done", and the pause was then read too short.
- **The fix.** Past the limit, a report is still kept when it says one of the three and no kept voice does. A row holds at most `VOICE_LIMIT + 3` = 19 voices. Within the limit nothing changes. The excess still writes nothing and is not indexed (QRE QM11).
- **Tests.** There are three, in the focal file. The two QRE-SC-02 shapes are tested in both orders; both are RED on `d6348ff` (`evidence/red-cycle1-on-d6348ff.txt`). The third covers QRE-SC-03: `stop:false` is no stop, and an excess id reused writes nothing, across reviews and within one.
  - Focal: **21/21**, successors 4/4.
- **Mutants:** **19/19 killed**, control 25/25 (`evidence/mutation-sc.txt`). The new ones are:
  - L3, the stop exception only (`d6348ff` itself);
  - L4, no "took place" exception;
  - L5, no "did not take place" exception;
  - L6, the exceptions unbounded;
  - L7, the excess indexed (QRE QM11);
  - S6, `stop:false` read as a stop (QRE QM8).

## 2. Records (QRE-SC-01, C-SC-1..3)

- **QRE-SC-01a.** The differential's "declaration just before the latest stop" arm copied the declaration with a new date, which broke its seal, so every comparison in that arm was HOLD on both trees. It now builds the declaration with `readinessFact` (`sc-main.part.mjs`; `beforeStopCompared` counts that arm's comparisons). Results on the cycle-1 bytes are in `evidence/sc-diff/SUMMARY.txt`.
- **QRE-SC-01b.** CANDIDATE §B's millisecond figures did not match `bench/voice-load.json`. The bench has been re-run on the cycle-1 bytes, and §3 below quotes that file only. Timings vary between runs: 3 rounds against 5, and a parallel suite on the first run. Bytes and voice counts are exact.
- **QRE-SC-01c.** "The pass's `quarantinedIdentities` list is unchanged" (CANDIDATE §A.3) is inexact.
  - **What is unchanged:** no identity is removed by the new rule, and the refusals and the holder's flag are as before.
  - **What differs:** FREEZE-6 removed a phantom identity from the list when a later correction "resolved" it. The candidate keeps it listed for that pass (PHANTOM_LISTED), so the weekly evidence reads that session as conflicted for one review. That errs low, and the next review is identical. Recorded as **QRE-SC-04**.
- **C-SC-1.** The successor freeze record states the dose differences:
  - **the restart pause** ends at a disputed session that took place (C-O1-2). In SSCTR's `cls.mjs` a 35-day pause reads 5 days, run doses equal the absent case, and the strength first exposure goes from 19 to 27 min, as an undisputed run gives;
  - **SB-1 asks** where FREEZE-6 declared (SEC-O1-01b/c);
  - **the SEC-O1-02 credit equalization**: the same-review reading equals the two-review reading;
  - **none in-program:** the lineage matrix is byte-identical.
- **C-SC-2.** The reason for excluding integrity flags from C-O1-2 is corrected. It is not that "those flags keep no voice": SSCTR's `integ.mjs` shows such rows can later hold several "done" voices. The reason is that **the flag disputes which session the evidence belongs to**. The pause then errs long, as on FREEZE-6.
  - The f08 comment that states the old reason is corrected at f08's next runtime change. This cycle leaves f08's bytes as R1 judged them.
  - O-SC-S4 (a decision on integrity-flagged rows whose every voice says done) is open, with SSCTR as owner.
- **C-SC-3.** The C-O1-3 record (CANDIDATE §D) is corrected:
  - the runtime under-protects in **3 of the 4 orders** (`adv2` 0/0/1/0 against a criterion of the same adverse count in all four), not only athlete first then re-sync;
  - the policy was already decided (SSCTR_O1_R1 decision A); what remains is the **implementation** in `r6-adaptation.mjs`;
  - C-O1-3 stays open and binds before real-athlete weekly-review gating. Owner: Core with QRE, then SSCTR.

## 3. SEC-O1-03: disposition

- **Security's decision:** the policy and the cap are approved, but the cap **does not close SEC-O1-03 alone**. It also needs:
  - a bound on agreeing merges (**O-SC-1**: Security reproduced 2000 parts and 2.63 MB on both trees; pre-existing since R7-A);
  - a per-report size limit at the app boundary (C-F01-2).
- **QRE's decision:** the value 16 is accepted.
- **So SEC-O1-03 is PARTIAL.** Disputing voices are bounded and implemented. Agreeing-merge growth and report size stay open before real athletes. Owner: Core for the merge bound, the app boundary for the size limit.
- **Measured on the cycle-1 bytes** (`bench/voice-load.json`, 5 rounds; FREEZE-6 → candidate):
  - normal: 3 → 3 voices, 1666 → 1666 B;
  - elevated (40 disputing reports): 41 → 16 voices, 12.9 → 5.5 KB;
  - abuse (2000 reports, 1 KB pad each): 2001 → 16 voices, 2.62 MB → 20.7 KB, ingestion 596 → 120 ms, re-read 34.5 → 0.34 ms;
  - stable on re-read, still CONFLICTED.
  - The transient heap during ingestion is the same on both (about 48 MB, the 2000 incoming reports themselves).

## 4. Regression on the cycle-1 bytes (`bb38a8b`)

- **Suite: 1849 / 1807 / 42** (`evidence/suite-cycle1.txt`).
  - The failing titles are exactly R1's: FREEZE-6's 37, plus the same 5 by design.
  - The 3 added tests are green. Nothing is fixed or masked.
- **SC differential:** 12 configurations, 3000 cases each, on the cycle-1 runtime with the sealed before-stop arm (`evidence/sc-diff/SUMMARY.txt`).
  - **UNEXPLAINED is 0** on both the normalizer and the f08 side.
  - **Every invariant is 0.**
  - The before-stop arm now compares: 103–198 STOP_ON_RECORD per configuration, and OCCURRENCE.
  - The normalizer classes and credit are identical to R1's. The generator never reaches the limit (at most 6 parts).
- **Lineage dose:** unchanged. The voice limit is never reached by the matrix.
- **Performance:** R1's ratios stand. The keepVoice change runs only past the limit.

## 5. Not binding, recorded

| ID | What | Binding | Owner |
|---|---|---|---|
| SEC-SC-02 | Medium, pre-existing (SEC-O-O1-2): a voice is dated by its row's `observedAt`, so a stop or "done" observed after the declaration but kept on a row observed before it gives DECLARED on both trees | Before real athletes | Core with Security |
| SEC-SC-03 | Low, pre-existing: a stop with minutes > 0 observed on the restart day gives no pause, so no SB-1 question | Before real athletes | Core |
| SEC-SC-O-1 / -O-2 | The integrity first-claim class (depends on SEC-CORE-03 and C-F01-2); a client-supplied `provenance.conflict` label is kept by the incoming normalizer | Observation | Security |
| QRE-SC-04 | See QRE-SC-01c | Before real-athlete weekly-review gating | Core with Security |
| O-SC-1 | Agreeing-merge growth | Before real athletes (with SEC-O1-03) | Core |
| O-SC-S1..S4 | SSCTR observations (SSCTR_SC_R1) | Observation | As recorded |
