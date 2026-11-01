# R7-B.2 — SSCTR review addendum 1 (R7B2-SSCTR-r1-A1): the graduation-withdrawal family

**What it adds to.** [R7B2-SSCTR-r1](SSCTR_REVIEW_R7B2.md), committed at `003b612` and not edited.

**Trigger.** Quality's [R7B2-QUALITY-r1](../quality/QUALITY_REVIEW_R7B2.md) found QR7B2-01, groups B, B2 and D (92 rows). It is a second proposal source with the QE-R7B2-01 shape: the run-quality graduation withdrawal. Quality made an explicit SSCTR disposition of these groups a condition for G8/G9.

**Scope.** Only that source, on the report-identity and late-evidence exits. Everything else in r1 stands.

**Instance.** The same SSCTR instance as r1 (session 6, claude-opus-5-5 inherited). It is not an author of the runtime or of Quality's probes. This addendum extends my own gate review; it is not an independent recheck of it.

**Record.** [SSCTR_REVIEW_R7B2_ADDENDUM_1.json](SSCTR_REVIEW_R7B2_ADDENDUM_1.json).

## Identity

- **Freeze.** R7B2-FREEZE-1, record `8d51def5…fee`, source `57512322…ecbd`, manifest `f9c5bd5a…ceca`; HEAD `003b612`.
- **Predecessor.** A new full `git archive 146ebb8` in `%TEMP%/r7b2-ssctr-r1a-s6-pred`, with `node_modules` copied in. Its record is `e75a2799…`, and `verify-r7b1.mjs` inside it gives 24/24 PASS. It was deleted after the probe.
- **Verifier** (`verify-r7b2.mjs`, read-only):
  - after the probe: 34/34 PASS, same digests;
  - after these files: 34/34 PASS, same digests (`probes/r1/out/verify-r7b2-a1-after-deliverables.json`).

## Reproduction (mine: `probes/r1/a1-graduation.mjs` → `out/a1-graduation.json`)

The probe uses only the public fixture helpers and my verbatim `dual.mjs`. I re-typed Quality's fixtures and did not run its scripts. Each runtime applies its own result.

| Case | FREEZE-2 | R7-B.2 while pending | Next review carrying the state | Next review admitted without it |
|---|---|---|---|---|
| **B:** a novice graduated on weeks 2–3, a WORK return in week 4, then the same id resent as "Flu illness" with a week-3 long-run correction | ASK about the report id + withdrawal + `RUN_QUALITY_GRADUATION_WITHDRAWN`. Applied: 0 quality sessions ahead. Next review with that state: **KEEP**, so the illness is gone | CLINICAL_HUMAN_REQUIRED, no proposal, no disclosure, REQUIRES_RECONCILIATION. **10 THRESHOLD sessions stay** in the plan in force (first 2026-12-15, 34 min) | CLINICAL_HUMAN_REQUIRED | MODIFY with the withdrawal and the disclosure. 0 quality ahead; the plan **equals FREEZE-2's applied plan** |
| **B2** (week 5, the same week-3 correction) | as B | as B (10 THRESHOLD) | CLINICAL | as B; plan equal |
| **D:** late pre-break report + substitution pain + a correction of week 4's long run, in the re-entry week | R7-A's question + withdrawal + disclosure; pending ASK, so the pain is gone | CLINICAL, no proposal; **9 THRESHOLD stay** (first 2026-12-24) | CLINICAL | R7-A's question with the withdrawal and the disclosure, i.e. what FREEZE-2 gave at the step. Applied: 0 quality; plan equal |
| **B3** (the window): the resend the day before the first THRESHOLD session; the next review two days later | ASK + withdrawal: tomorrow's session becomes easy running, with the illness dropped | CLINICAL; **a THRESHOLD session tomorrow** stays in the plan in force | — | With or without that session reported executed: MODIFY with the withdrawal. An executed session stays as history; 0 quality ahead |

**Controls, identical on both runtimes:**
- The handler's own clinical route with the same correction (a new-id illness return, or pain without the late report) keeps the THRESHOLD sessions while pending. The next admitted review withdraws them. This holds in every case, including the B3 window.
- The correction without a clinical signal withdraws at once.
- B2 with a week-4 correction is not a qualifying week, so it is the factual source: the next review is KEEP and nothing is re-derived. That is SSCTR-R7B2-01, unchanged.

**Agreement with Quality.** This matches QR7B2-01, including its re-derivation pickup, and QR7B2-02 (= SSCTR-R7B2-01).

## The question: THRESHOLD runs kept while the clinical route is pending. Acceptable, with condition C4.

1. **Kept is not prescribed.** While the route is pending:
   - the decision is CLINICAL_HUMAN_REQUIRED, with plan validity REQUIRES_RECONCILIATION;
   - every later review carrying the state stays CLINICAL, with no proposal.

   The runtime authorizes no session until the human route resolves: no THRESHOLD session, no easy run, no strength session.
2. **The choice belongs to a human.** Choosing an intensity after an illness or injury signal is a dependent prescriptive judgment that SSCTR-05 and G04 reserve to a qualified human. Answering "Flu illness" with "easy instead of threshold" is a nonclinical return recipe. The withdrawal disclosure itself says "the harder session leaves the plan and easy running continues". So dropping that disclosure on a clinical route is correct.
3. **FREEZE-2 was not the safer behaviour, despite the lower intensity.**
   - It offered that easy-running plan with a bookkeeping question.
   - It dropped the clinical dependency. In B the next review is KEEP; in D it is R7-A's question with pending ASK.

   So after flu or pain the athlete would keep running with no referral. That is the dose-instead-of-referral pattern SSCTR-05 forbids. Conservative is not automatic reduction (SSCTR-04).
4. **Authorities.** Clinical-screen-first (B0-C06 condition 8, D08) and QE-R7B1-01 make the clinical route the decision, and `withFactualReplan` makes it propose nothing. The predecessor already behaves exactly this way for the same facts on the handler's own route.

**Literature.** I tried to verify one claim: that high-intensity running soon after a systemic viral illness carries particular concern (SC-4). I re-read the IOC consensus abstract (PMID 35863871) through E-utilities. It is a scope statement only: return to sport and the risks of infection during exercise are named as topics, with no conclusions. The full text is inaccessible. So SC-4 is INSUFFICIENT_EVIDENCE as accessed, and **not relied on**. The conclusion does not need it, because the agent may choose neither intensity after an illness signal.

## Is the deferral bounded? Yes, at the first admitted review; the window before it is pre-existing.

**Bounded inside the runtime.** The withdrawal is state-derived: `graduationWithdrawal` judges the qualifying weeks on the canonical record at every review. So:
- the first review admitted without a pending clinical dependency re-derives it;
- the resulting plan equals FREEZE-2's applied withdrawal exactly (B, B2, D);
- with the state carried, the review stays CLINICAL.

This is unlike the factual source (SSCTR-R7B2-01), whose current-week rows are never re-derived mid-week.

**Not bounded by the runtime.** The runtime does not control execution of program rows before that first admitted review, either after an external resolution or when a consumer ignores the pending state. B3 shows that a THRESHOLD session can fall inside that window, the day after an illness report. This is pre-existing: it is identical on both runtimes for the handler's own route. It is a consumer and resolution-input matter, tied to SSCTR-R7B2-02. I record it as SSCTR-R7B2-03, with condition C4.

## Disposition of groups B, B2 and D

- **B: ACCEPT.** The routing consequence is required and bounded.
- **B2: ACCEPT,** as B.
- **D: ACCEPT,** as B. The re-derived withdrawal arrives with R7-A's question, as FREEZE-2 gave it.

The residual window is covered by SSCTR-R7B2-03 and C4.

## New finding

| Id | Severity | Origin | Blocks | Owner |
|---|---|---|---|---|
| SSCTR-R7B2-03 | MINOR | Pre-existing: the handler's own clinical route with a graduation-disqualifying correction, identical on both runtimes. B.2 extends its reach to the report-identity and late-evidence exits (QR7B2-01) | No (routed; not a bypass; contract §10) | Next runtime mission: Engineering (output and resolution-input contract), with Product/UX (how a pending clinical dependency is presented) and SSCTR |

**SSCTR-R7B2-03: quality sessions that a recorded correction has disqualified stay in the plan in force.** They stay during a pending clinical dependency, and until the first admitted review after it.
- **What the runtime does.** It authorizes none of these sessions while the dependency is carried, and withdraws them at the first admitted review.
- **What is missing.** Its output gives a consumer no marker that those rows are already invalidated.
- **Why it is not a U5 item.** Closing it within B.2 would mean attaching a dose or disclosure to a clinical route, which is forbidden, or defining the resolution input (SSCTR-R7B2-02), which is outside B.2.
- **Next action.** Make the invalidated rows and the pending dependency unambiguous to a consumer. Make the first decision after a documented human resolution an admitted review, before any session is presented.

## Conditions

- **C1–C3:** unchanged from r1.
- **C4,** before any use beyond the offline synthetic reference:
  - **(a)** while CLINICAL_HUMAN_REQUIRED is pending, no program session is presented as current or prescribed, and in particular no quality or intensity session;
  - **(b)** after a documented human resolution (SSCTR-R7B2-02), an admitted review re-derives the canonical factual state, including any graduation withdrawal, before any session is presented.

  No clinical keyword, flag, threshold or clearance path is implied.

## Effect on r1

- **The verdict does not change.** r1's answers stand. r1 covered the factual re-plan source only, as the request framed QE-R7B2-01.
- **r1 Q4.** "No proposal on either side" holds for the rows r1 listed. It does not hold for groups B, B2 and D, which this addendum dispositions.
- **Records and queue.** No SSCTR record needs a new revision: after re-derivation, the withdrawal content equals FREEZE-2's, and policy and catalog are unchanged. No queue entry is proposed, and the queue stays at 230.

## Rules kept

- I wrote only under `reviews/ssctr/`. r1, the run-5 files and Quality's files were not edited, and Quality's scripts were not run.
- No `--write`, no mutate or freeze script, no commit. Everything ran in the foreground.
- My temporary tree was created new and deleted.

This line supersedes R7B2-SSCTR-r1's verdict line:

R7B2_SSCTR_GATE = ACCEPT_WITH_CONDITIONS
