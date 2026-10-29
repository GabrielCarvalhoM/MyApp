# Product/UX spot-check — fixes for PUX-OB2-2026-10-26-r2

- **ID:** PUX-OB2-2026-10-26-r2-spot. It checks the fixes made for my [re-check](PRODUCT_UX_RECHECK.md).
- **Reviewer:** the same fresh Product/UX Architect instance that wrote the re-check. I act as a read-only judge, and I authored nothing under review.
- **What I wrote:** only this file. I made no edits to the Figma, `product/` or `canon/`. I did not run the apply script, `npm run verify` or any `verify-r*` script.
- **Inputs:**
  - Figma `TYR10AIrquCpKvKL3eyXyO`, read on 2026-10-26 between about 11:15 and 11:25 (−03:00).
  - `PENDING_DOC_CORRECTIONS_R2.json` revision r2, SHA-256 `101fbb6f…306`.
- **Independence:** `SECURITY_SPOTCHECK.md`, `SSCTR_SPOTCHECK.md` and `UI_RECHECK.md` exist. I did not read them.

## Answers

1. **N1: CLOSED.** Op 23 uses my text verbatim. The ON-15 note `122:1546` is scoped the same way.
2. **The Architecture Eval PASS holds. VISUAL_READY holds, and I re-affirm it on this revision.**
   - No Product/UX condition remains before applying the doc corrections.
   - The doc side is PASS on application of r2, after R6 closes.
3. **Blocking: nothing.**

## Evidence

### Held corrections, revision r2

- The 8 `preSha256` values are unchanged, and they still match the files.
- Each of the 34 `from` texts occurs exactly once.
- Applying the ops in memory reproduces all 8 `postSha256` values (PDR `20acdc41…`, UXS `e700af4a…`; the other six are unchanged).
- **Op 23** is my N1 text verbatim. The referral line is for "dor ou lesão" only.
- **Ops 2–3** name "the next coaching mission that takes this mapping", and say that R6 does not list it. The text stays true whenever it is applied, so the S7 condition is met.
- **Ops 4 and 26** scope load to "the exercises that stay" (N5). SSCTR owns the final wording.
- **Op 21.** In signed-in mode, every "só neste aparelho" line goes and consents are recorded directly in the account. This matches the AC-04 note `250:2080`.
- No `product/` or `canon/` file, before or after the ops, carries the old pause label or the removed follow-up question.

### M1–M3 are still closed (regression check)

Sections 2.1–2.4 gained or lost no frame and no note.

- **M1.**
  - AC-04f with no draft, `300:2889` → ON-01b.
  - AC-04f with an incomplete draft, `445:13343` → ON-01r.
  - AC-04f with a complete draft, `445:13387` → ON-02.
  - Both draft variants add "Não são minhas respostas · Recomeçar" → ON-01s. That is the explicit erase: it sits behind its confirmation sheet and is the lowest action on the screen (screenshot).
  - The AC-04 note keeps the one-draft rule. The ON-01r links are unchanged.
- **M2.** ON-02 `118:655`, ON-02b `300:2971` and ON-02d `397:4963` still show the three lines word for word.
- **M3.**
  - ON-15b on arrival `444:4793`: switch off.
  - ON-15b after the act `397:4845`: switch on → ON-02.
  - ON-15d `444:4889`: "Dor ou lesão" with the switch off, and the referral line.
  - ON-V5: `126:1813` → ON-02.

### The other changes

- **N1 note.** `122:1546`: "…em dor ou lesão (ON-15d), uma linha neutra recomenda avaliação profissional."
- **N2.**
  - The undrawn follow-up is gone. The starting point comes from ON-09/ON-10, and no reason is asked (ONB-01).
  - The pause sub-label reads "Viagem, rotina ou outro motivo — sem dor nem lesão" on ON-15, on both ON-15b frames and on ON-15d (screenshot of ON-15).
- **N3.**
  - ON-V7 note `126:2079`:
    - "Trocar a meta da corrida" → ON-04;
    - the server trigger is "goals do not fit";
    - an unsupported day has one home, ON-V7b, and is never re-asked.
  - ON-V7b note `400:4794`: the server reuses ON-V7b's rule after the account.
- **S6.**
  - The ON-01 note `118:877` points to the AC-04 table.
  - The ON-02d note `400:13237` covers an account with no plan ("Entrar na minha conta", then the AC-04 table).
  - Security's Q4 COULD is recorded as open.
- **C2.** The ON-12a `121:1292` and ON-12b `121:1293` notes give the edit-mode exit: ON-16 → PP-01.
- **C1.** ON-02 back → ON-15, and ON-02b back → ON-15.
- **UI.** ON-02c has a close control, `459:4960`.

## State after this pass

| Item | State |
|---|---|
| N1 | CLOSED |
| N2 | CLOSED. A new residual is P1 below. |
| N3 | CLOSED. One COULD alignment is P2. |
| N5 | CLOSED on application. SSCTR owns the wording. |
| S6 | CLOSED for Product/UX. Security's Q4 COULD stays open with Security. |
| S7 | CLOSED on application. One record line is wrong (P3). |
| C2 | CLOSED in the Figma, and on application. |
| C1 | PARTIAL. Still missing: the ON-V7 actions, AC-11 → ON-02c, ON-12b → ON-12c, and links into ON-15b, ON-15d, ON-V5 and the AC-04f variants. |
| C4, C6, N4 | Unchanged (PARTIAL, PARTIAL, COULD). |
| N6 | The Chief's explanation is accepted: every mission inserts entries, and R5's verifier excepts both files. |

## New items, none blocking

**P1 — SHOULD: where a return after illness goes.**

- **Finding.** The ON-15 note says the pause label "não junta doença com pausas sem restrição". It names "como identificá-la" as a G04 + Product/UX question.
  - The label's "ou outro motivo — sem dor nem lesão" does not exclude illness.
  - A person back from an illness has no other fitting answer, so they will likely pick this one.
  - The note's claim is therefore stronger than what the label does.
- **Product truth already separates the two cases:**
  - CTN-06 and AM-09: a return after illness keeps HOLD dependente and revisão qualificada `[DEP-G04]`;
  - AEC:121 and CORE_FLOWS:99: a logistic pause and a return after illness are not the same case;
  - ONB-11: the limitation instrument is `[DEP-G04]`.

  This is an improvement on the version I passed, which put "Doença" inside the pause label. It is not a regression.
- **Now.** Make the note honest: until illness has a place, a return after illness can still land under "outro motivo".
  - Do not exclude illness from the label without also giving it a place.
- **Product/UX recommendation for the open item.**
  - Give a recent illness its own answer, under the same purpose act and with no region question.
  - With the switch off, show the same neutral line as ON-15d.
  - With the switch on, apply CTN-06's plan effect. G04 defines its scope.
  - Never derive illness from "outro motivo". SSCTR may want to confirm the label.
- **Owner:** the OB-2 author, with G04. Product/UX re-checks the place.

**P2 — COULD.**

- The ON-V7 note says ON-V7b's rule adds "Mais tempo por treino" when time is what is missing.
- The ON-V7b note `400:4794` is the rule's single home, but it lists only "keep" and "fewer days". Add the third option there.

**P3 — COULD (record accuracy).**

- ONBOARDING_V2 line 116 still says MISSION_LEDGER received an insert-only entry. The coordinator says the entry will be appended at closure.
- ONBOARDING_V2 and CHECKPOINT are unchanged since my re-check (`dc5ef14f…`, `732dbf8f…`). The N6 note for R6's owner is not yet in OB-2's CHECKPOINT.

**Still open from the re-check (COULD):**

- ops 1 and 22 call AC-04f's primary action "Começar";
- the rest of C1;
- C4, the per-day tuning frame;
- C6, the offline state;
- N4, destination naming.

## Verdict

- **Architecture Eval: PASS holds** for the Figma revision read today.
  - The doc side is PASS on application of r2 after R6 closes.
- **VISUAL_READY holds,** and is re-affirmed on that revision.
  - It lapses if any M1–M3 frame, note or link listed here changes in substance.
  - It also lapses if r2's ops change.
- **Founder:** nothing new. The 2-week rotation scope stays open as surfaced.

## How I checked

- I re-ran my read-only scratchpad simulation against r2, and searched the post-op copies.
- Figma, read-only (`use_figma` scripts and `get_screenshot`):
  - an inventory diff of page 2 sections 2.1–2.4;
  - 20 notes;
  - the visible text and reactions of 17 frames;
  - the close control on ON-02c and the ON-V7 action bar;
  - screenshots of ON-15 and of the AC-04f complete-draft variant.
- Not covered: visual quality, security sufficiency and the science of the copy. Those belong to the UI, Security and SSCTR spot-checks.
