# SSCTR rotation check — Founder choice of Q3 option (a)

- **Review ID:** SSCTR-OB2-BIND-2026-10-26-r4.
- **Basis:** SSCTR-OB2-2026-10-25-r1, Q3 conditions 1–8 and claims C3.1–C3.5. The r1–r3 binding records are unchanged.
- **Date:** 2026-10-26.
- **Versions:** agent SSCTR-1.0.0 · constitution SSCTR-CONST-1.0.0 · protocol SSCTR-EP-1.0.0 · skill 1.0.0.
- **Instance:** the same reviewer instance. It did not author the target texts. Model, tools and permissions were inherited, and no specialist was delegated.
- **Read-only:** this file is the only write. No queue, repo or Figma edits and no verify scripts. No new literature search was needed.
- **Validation:** no human, empirical or clinical validation happened.
- **What this record does not do:** the Founder decision is DECIDED product scope. This record only checks that it is bound faithfully and adds no science.

## Inputs verified

**Held corrections:** `PENDING_DOC_CORRECTIONS_R2.json` revision r3, SHA-256 prefix `c511d82828925361`, 38 ops.
- A read-only check found that all 38 `from` strings occur exactly once in their targets.
- All 8 target files still equal their `preSha256`.
- Ops 35–38 were read in full.

**Figma (live, session `ceddd3c4-…`, read-only text reads and a node screenshot):**
- ON-14b `374:3379`.
- The helper `I396:4490;117:581` now reads "Os principais ficam; trocam os acessórios e as variações deles".
- The footnote `396:4564` (inside "Respostas", on the same screen) is unchanged: "Em qualquer opção o treino continua evoluindo. Quando um exercício muda, a carga do novo começa por um ajuste."
- The other three helpers are unchanged.
- The drawn selection is still "A cada 6 semanas", and "Recomendado" is on "O coach decide", so nothing is pre-selected.
- Note `400:13230` carries the "Decidido (Founder, 2026-10-26; SSCTR Q3, opção a)…" sentence. It keeps the prohibited-claims list and "Receita de rotação: política de treino + SSCTR antes do runtime".

## 1. Binding to Q3 conditions and option (a): BOUND (docs BOUND on application)

**Option (a) is bound as written.**
- r1 Q3 condition 6(a) says: "The 2-week option rotates accessories and close variants of the main lifts, and says so in its helper text."
- Ops 35 (DR-113), 37 (UXS ONB-22) and 38 (STIL) and the note each state: main exercises stay; only accessories and close variants rotate; the helper text says so.
- Op 36 removes only the now-decided open item, and keeps "Rotation recipe → training policy + SSCTR".

**The rest of Q3 is preserved.**

| Condition | How it is preserved |
|---|---|
| 1 — selection only, essential stimulus, systematic | Ops 4, 26 and 32 and the existing STIL text are untouched. |
| 2 — calibration of a new exercise | Ops 4 and 26 and the footnote. |
| 3 — Fixo | The note and ONB-22. |
| 4 — "O coach decide" behaviour | The note. |
| 5 — taper deferral, placement and no deload framing | Op 32. |
| 7 — no forced override for novices | Untouched. |
| 8 — recipe open | Kept. |

**There is no new scientific claim.**
- "para o progresso continuar legível nos principais" is a statement about legibility, consistent with C3.4: external-load progression stays continuous on a lift that does not change.
- It does not say that option (a), or rotating every 2 weeks, gives better strength or hypertrophy than any other option. That would still be ABSTAIN under C3.3.
- The cadences are still called preferences, not an optimum.
- No prohibited claim ("confusão muscular", "evita platô", "variar dá mais…", "ideal", "não perde nada") appears.

**What stays open (owner: training policy + SSCTR, before runtime).** Two definitions belong to the rotation recipe and are not approved by this record:
- which exercises count as "principais" (anchor lifts per goal or profile);
- what counts as a "variação próxima", including that it must preserve the essential stimulus (condition 1).

## 2. Honesty of the helper without the load-reset clause: YES

- r1 rejected "a progressão continua" because it *hid* the load reset. The new helper makes no progression claim at all, so it hides nothing.
- The reset is disclosed on the same screen, for every option, by the unchanged footnote `396:4564`, which is the accepted string.
- Under option (a), the reset now applies only to the rotated accessories and variants, while the main lifts keep their load progression. That makes the footnote's "Quando um exercício muda…" exactly accurate.
- Repeating the clause in the helper is not required.
- **Condition for this verdict:** the footnote must stay on ON-14b, and in the Perfil edit of the same preference, whenever the 2-week option is shown. If a surface shows the 2-week helper without that footnote, the helper on that surface must add ", e cada um novo começa com uma carga de ajuste".

## 3. Required changes: none

**Optional clarity:** "as variações deles" could be misread as "os principais são variados". If Product/UX wants it unambiguous, use: **"Os principais ficam; trocam os acessórios e as variações próximas dos principais"**. If that is too long, keep the current string; it is acceptable as is.

## Status fields

- **Disposition:** binding check only.
- **AE action:** NOT_APPLICABLE.
- **Gate:** NOT_CLOSED_BY_THIS_RECORD.
- **Publication:** NOT_PUBLISHED.
- **Human, empirical and clinical validation:** false.
- **Queue:** no new prescriptive approval and no new entry. The proposed OB2-Q3-ROTATION queue scope is unchanged, because option (a) narrows rotation and approves no dose.
- **"BOUND on application"** holds only if ops 35–38, and the other ops, are applied byte-for-byte after DOMAIN_COACHING_R6 closes, with the `pre/postSha256` checks.
- **Re-review triggers:**
  - definition of the rotation recipe (principais / variações próximas);
  - removal of the footnote from any surface that shows the 2-week option;
  - any further edit to `I396:4490;117:581`, `396:4564`, `400:13230` or ops 35–38.
