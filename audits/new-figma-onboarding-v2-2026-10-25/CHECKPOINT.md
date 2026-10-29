# OB-2 checkpoint — read this first to resume

Mission: OB-2, the onboarding, account and paywall revision ([Founder request](FOUNDER_REQUEST.md), 2026-10-25). Figma file: `TYR10AIrquCpKvKL3eyXyO` only. No runtime, no implementation, no promotion: the result is still an experience candidate (DR-94).

**State on 2026-10-26: CLOSED FOR FOUNDER REVIEW.**
- The four independent gates pass for the Figma revision of 2026-10-26.
- The product-doc corrections that complete those gates are ready, but held until DOMAIN_COACHING_R6 closes.
- Nothing else is in progress.

## Gates (final)

| Gate | Result | Record |
|---|---|---|
| Product/UX | **Architecture Eval PASS, VISUAL_READY.** This holds while the M1–M3 frames, notes and links, and the r2 ops, stay as they are. | [PRODUCT_UX_SPOTCHECK](reviews/PRODUCT_UX_SPOTCHECK.md) |
| UI | **UI_READY** | [UI_SPOTCHECK](reviews/UI_SPOTCHECK.md) |
| Security | **PASS**, gate state SECURITY_READY_WITH_CONDITIONS. Conditions: apply ops 1, 6 and 18–23; G07/G08/G09; the real-build checks before implementation. | [SECURITY_SPOTCHECK](reviews/SECURITY_SPOTCHECK.md) |
| SSCTR binding | **Q1–Q5 BOUND.** The doc parts of Q1, Q3 and Q5 are bound once applied. | [SSCTR_SPOTCHECK](reviews/SSCTR_SPOTCHECK.md) |

Earlier records:
- before drawing: [SSCTR](reviews/SSCTR_REVIEW.md) and [Security round 1](reviews/SECURITY_REVIEW.md);
- round 1: [Product/UX](reviews/PRODUCT_UX_REVIEW.md), [UI](reviews/UI_REVIEW.md), [Security](reviews/SECURITY_REVIEW_R2.md) and [SSCTR](reviews/SSCTR_BINDING_REVIEW.md);
- re-check: [Product/UX](reviews/PRODUCT_UX_RECHECK.md), [UI](reviews/UI_RECHECK.md), [Security](reviews/SECURITY_RECHECK.md) and [SSCTR](reviews/SSCTR_BINDING_RECHECK.md).

What changed in each round: [ONBOARDING_V2](ONBOARDING_V2.md), sections "Round 2" and "Gates".

## Done

- **Figma.** Every Founder item is drawn, with every MUST fix and most SHOULD fixes. The frame map is in ONBOARDING_V2.
- **Product truth, round 1, applied 2026-10-25 at 18:42.** It covers the PDR-1.7 block (DR-110–116) and 13 synced `product/` and `canon/` files.
  - Pre-change copies and SHA-256 are in [`before/`](before/SHA256SUMS.txt).
  - DR-110 is applied as part of PDR-1.7. This supersedes the older CURRENT_MISSION line that calls it "written but not yet applied".
- **Doc corrections: ready, not written.** They are in [PENDING_DOC_CORRECTIONS_R2.json](PENDING_DOC_CORRECTIONS_R2.json), revision r3, SHA-256 `c511d828…`: 38 exact edits in 8 files.
  - Ops 1–34 are the round-2 corrections, byte-identical to the r2 the four judges spot-checked.
  - Ops 35–38 record the Founder's rotation decision.
  - A dry run (`--allow-open-mission` without `--apply`, which writes nothing) matched every op once and reproduced every `postSha256`.
- **Founder decision on 2026-10-26: "A cada 2 semanas" keeps the main exercises** and rotates only the accessories and close variants of the main lifts (SSCTR Q3 option a).
  - It is drawn on ON-14b (helper and note) and in the CF-04 note.
  - It is in ops 35–38.
  - SSCTR found it BOUND: [SSCTR_ROTATION_CHECK](reviews/SSCTR_ROTATION_CHECK.md).
- **Queue.** The three SSCTR items are ready in [QUEUE_ADDITIONS_PROPOSED.json](QUEUE_ADDITIONS_PROPOSED.json) but not appended, because `verify-r5` asserts exactly 114 items.
- **Mission and ledger.** On 2026-10-26, CURRENT_MISSION received an OB-2 block inside the NFV1 section and MISSION_LEDGER an OB2 entry. Both were insert-only.

## Held for DOMAIN_COACHING_R6

R6 (Codex) opened on 2026-10-26 at 10:08. Its `audits/domain-coaching-r6-2026-10-26/BASELINE.json` binds the SHA-256 of:
- all 66 `product/` files and 2 `canon/` files;
- AGENTS.md, CLAUDE.md, CURRENT_MISSION.md and MISSION_LEDGER.md.

**Why the doc corrections wait.** Writing the eight target files now would make R6's baseline check report changes R6 did not make. They match R6's baseline today, and that value is the `preSha256` in the JSON:
- PDR `d9ea31a1…`;
- UXS `8d91e765…`;
- AEOS `08149de6…`;
- AEC `1db3b0e0…`;
- SIS `2f5179ae…`;
- STIL `2d6d20b7…`;
- CORE_FLOWS `e054cde8…`;
- PRODUCT_ARCHITECTURE `1a7182d8…`.

R6 wrote nothing after 10:10 that day.

**A note for R6's owner.** CURRENT_MISSION.md and MISSION_LEDGER.md now differ from R6's baseline, because of the insert-only OB-2 entries described above. That is how every mission writes these two shared logs: R5's verifier excepts both files, and R6 must add its own entries. Every baseline line is still present, in order. If R6's closing check flags them, this OB-2 text is the only change.

## Next steps, in order

1. **When R6 has `FINAL_DISPOSITION.json`, apply the doc corrections.** From the repo root:
   - run `node audits/new-figma-onboarding-v2-2026-10-25/apply-pending-doc-corrections.mjs` (a dry run);
   - then run the same command with `--apply`.

   The script refuses if a target changed. In that case:
   - re-validate each op;
   - have the owning judges re-check before applying: Security for ops 1, 6 and 21–23; SSCTR for ops 4, 23, 26, 27, 31–32 and 35–38; Product/UX for op 23.

   The script snapshots the eight files to `before-r2/` first. After it runs:
   - add one insert-only MISSION_LEDGER line saying the round-2 corrections were applied;
   - change the state in the JSON to APPLIED.
2. **Queue.** The next queue owner appends the three items verbatim, keeps the earlier items byte-identical, and bumps `queue_revision`.
3. **DR-112–114 mapping into CoachingCore.** This goes to the next coaching mission that takes it; R6's contract does not list it. Three things still use the old availability-window model:
   - the R5 scheduler;
   - the AESL fixtures that move sessions to free windows;
   - the candidate POL-07 "double preference".
4. **The rotation recipe, with training policy + SSCTR, before runtime.** It includes which exercises count as main ones and what counts as a close variant. The Founder already decided the 2-week scope (option a).
5. **G04 + Product/UX: where a return after illness goes.**
   - The pause label no longer names illness, but it does not exclude it either.
   - Product/UX recommends its own answer under the same consent act, with no region question. With the switch off, it shows the ON-15d neutral line; with it on, it applies CTN-06's hold and review.
   - SSCTR suggests the label say "sem dor, lesão ou doença recente".
6. **Security Q4 COULD.** Decide whether to offer "Usar as respostas deste aparelho" when signing in to an account that has no answers.
7. **Gates that stay with their owners:**
   - G07: retention, LGPD art. 11, analytics before consent, the sex field, whether the primary consent is a separate act, and the final copy;
   - G08: the provider token discarded at AC-04f, its variants and ON-02d; AC-04g;
   - G09: E1–E9, no HealthKit ingestion without consent, and a declined limitation stored only as "unknown";
   - G10: prices.
8. **COULD items.** They are listed in ONBOARDING_V2, "Gates". None blocks a gate.

## Facts the Founder should know

- **"Sexo" replaced "gênero", with no "Outro".**
  - The coach can only use the physiological construct, and gender identity has no consumer in the product.
  - "Prefiro não dizer" takes the same neutral path, which must be adequate on its own.
  - Sex is only a weak hint for the first suggested loads, and the first logged sets replace it.
- **The account sits right after the questionnaire.** The plan is assembled on the server, and nothing leaves the device before the account exists.
- **On load progression, the Founder's words hold.** Load keeps progressing on the exercises that stay. When an exercise changes, the new one starts with an effort-based calibration. SSCTR agreed to this wording.
- **ON-02's account-step lines went missing once.** The upload line, the 18+ sentence and the D10 warning were drawn on 2026-10-25 and found missing on 2026-10-26. The author did not remove them, and the cause is unknown. They were restored, and every judge confirmed them.
- **Changes the judges asked for:**
  - "Não são minhas respostas · Recomeçar" on the AC-04f draft variants, for shared phones;
  - the pause label "Viagem, rotina ou outro motivo — sem dor nem lesão";
  - the slide-2 headline lost "primeiro" so it fits two lines.
- **R4's historical verifier reports the 13 round-1 files as changed.** That is expected: they were changed by this later, Founder-authorized mission.

## Rules for whoever resumes

- Never run `npm run verify` or any `verify-r*` script: they rewrite closed missions' evidence.
- CURRENT_MISSION and MISSION_LEDGER are insert-only.
- Edit only `TYR10AIrquCpKvKL3eyXyO`. The legacy Figma stays untouched.
