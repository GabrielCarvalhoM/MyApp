# SSCTR spot-check — OB-2 round 3

- **Review ID:** SSCTR-OB2-BIND-2026-10-26-r3. It spot-checks the fixes requested in [SSCTR_BINDING_RECHECK.md](SSCTR_BINDING_RECHECK.md) (r2). The r1 and r2 records are unchanged.
- **Date:** 2026-10-26.
- **Versions:** agent SSCTR-1.0.0 · constitution SSCTR-CONST-1.0.0 · protocol SSCTR-EP-1.0.0 · skill 1.0.0.
- **Instance:** the same reviewer instance. It did not author any target text. Model, tools and permissions were inherited, and no specialist was delegated.
- **Read-only:** this file is the only write.
  - The Figma file was read through session `ceddd3c4-…` with read-only `use_figma` text reads.
  - No queue, repo or Figma edits and no verify scripts.
  - No new literature search; the basis is still SSCTR-OB2-2026-10-25-r1.
- **No human, empirical or clinical validation happened.**

## Inputs verified

- **Held corrections:** `PENDING_DOC_CORRECTIONS_R2.json` r2, SHA-256 prefix `101fbb6fd744483c`, state "READY_TO_APPLY — HELD WHILE DOMAIN_COACHING_R6 IS OPEN".
  - A read-only check found that all 34 `from` strings occur exactly once in their targets.
  - All 8 target files still equal their `preSha256`.
  - Ops 2, 3, 4, 21, 23 and 26 were read in full.
- **Figma (live):**
  - ON-V7 note `126:2079`; ON-V7b note `400:4794`; AD-04 note `148:1818`;
  - ON-15 `122:1156` and its note `122:1546`; ON-15b `397:4845` and `444:4793`; ON-15d `444:4889` and its note `444:5016`.
  - The text "Doença, viagem" no longer appears on page 2.

## 1. Q1 — BOUND (docs BOUND on application)

**The r2 blocker is resolved.**

- Note `126:2079` now separates the two cases.
  - Too few days for the goal is handled by ON-V7, with no silent reduction of a goal or addition of days.
  - A day that cannot be a supported session has "uma casa só, a da ON-V7b". The text names the fact, and the options are keep the choice or choose fewer days, plus "Mais tempo por treino" when time is what is missing. "Nenhum dia é tirado sozinho".
  - This matches Q1 condition 2(b) and the r2 fix text. "O servidor nunca pergunta de novo uma escolha … já confirmada" respects the person's agency. It is acceptable because a newly found fact would still be named under the same rule.
- Note `400:4794` carries the zero-practice sentence verbatim, plus the same server-side rule.
- **AD-04 note `148:1818`:** the drawn state is the person's tap; nothing is selected on open; "Usar esta opção" is disabled until a choice. The r2 non-blocking point is resolved.
- **Nit (optional):** the `400:4794` sentence "as opções são manter a escolha ou escolher menos dias" could add "(e 'Mais tempo por treino' quando é o tempo que falta)" so it matches `126:2079` word for word. The rule is the same either way.

## 2. Ops 4, 23 and 26, and the ON-15 changes

### Ops 4 and 26 — ACCEPTED, as written

- Op 4: "the load of the exercises that stay, sets, reps and effort keep progressing under approved policy; when an exercise changes, the new one's load starts with an effort-based calibration".
- Op 26: "a carga dos exercícios que ficam, séries, repetições e esforço seguem evoluindo pela política aprovada; quando um exercício muda, a carga do novo começa por um ajuste pelo esforço".
- Scoping load progression to unchanged exercises is what C3.4 says: external-load progression restarts only for a changed lift. It meets the Founder's "deve continuar evoluindo normalmente" for the lifts that stay.
- "Under approved policy" keeps progression autoregulated. It is not a promise that load rises every session. No change is needed.

### Op 23 — ACCEPTED

- The text now reads "…a resposta vale como desconhecida e a pessoa pode autorizar depois em Perfil — o plano não a trata como 'sem restrição'; em dor ou lesão, uma linha neutra recomenda avaliação profissional".
- The referral line is limited to pain or injury, and an unknown stays unknown rather than becoming an automatic referral (SSCTR-05). This is equivalent to the r2 fix.

### ON-15 family — ACCEPTED

- The sub-label is now "Viagem, rotina ou outro motivo — sem dor nem lesão" on all four frames. Illness is no longer grouped with pauses that have no restriction.
- Note `122:1546` says:
  - the pause path starts from recent practice without restoring old volume;
  - no reason question is asked, which is consistent with AM-09 and ONB-01;
  - the referral is scoped to pain or injury;
  - "volta depois de doença segue CTN-06", with identification assigned to G04 + Product/UX.
- ON-15d text and its note are unchanged and correct, including "O Vilumo não diagnostica nem trata lesões".

**Residual dependency (not a blocker for Q1–Q5).**

- Because no reason is asked and "outro motivo" is open, someone returning after an illness can choose the pause option. They would then get the practice-based start instead of the CTN-06 dependent HOLD.
- This is the open G04 + Product/UX item named in the note. It is owned, not silently resolved. SSCTR-05 says an unexplained interruption cannot be assumed nonclinical.
- Suggestion for G04 (a SHOULD, not a binding condition): make the self-declaration in the label explicit ("…— sem dor, lesão ou doença recente"), together with a separate way for a person to declare an illness. G04 + Product/UX choose the mechanism. AM-09 forbids *requiring* a reason, not offering a self-declared route.

### Other changed ops

- **Op 21** (Security, account routing) and **ops 2 and 3** (coaching-mission ownership) contain no sporting claim.

## 3. Remaining blockers

**None for Q1–Q5.**

| Item | Status |
|---|---|
| Q1 | BOUND (docs on application) |
| Q2 | BOUND |
| Q3 | BOUND on application (ops 4, 26, 32) |
| Q4 | BOUND |
| Q5 | BOUND on application |

- **Prohibited-claim scan** of the changed texts: nothing found.
- **"BOUND on application"** holds only if the r2 ops are applied byte-for-byte after DOMAIN_COACHING_R6 closes, with the `pre/postSha256` checks. Any re-based op needs a re-check.
- **Open, owned and non-blocking:**
  - identification of a return after illness (G04 + Product/UX);
  - the session floor and the familiarization recipe (training policy + SSCTR);
  - the ON-15 subtitle COULD.

## Status fields

- **Disposition:** binding spot-check only.
- **AE action:** NOT_APPLICABLE.
- **Gate:** NOT_CLOSED_BY_THIS_RECORD.
- **Publication:** NOT_PUBLISHED.
- **Human, empirical and clinical validation:** false.
- **Queue:** no new entry.
- **Re-review triggers:**
  - any edit to the nodes or ops above;
  - re-basing of the held ops;
  - definition of the session floor, the familiarization recipe or the G04 illness-identification mechanism.
