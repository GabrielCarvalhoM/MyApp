# SSCTR binding re-check — OB-2 round 2

- **Review ID:** SSCTR-OB2-BIND-2026-10-26-r2. It re-checks [SSCTR_BINDING_REVIEW.md](SSCTR_BINDING_REVIEW.md) (r1), which stays unchanged.
- **Date:** 2026-10-26.
- **Versions:** agent SSCTR-1.0.0 · constitution SSCTR-CONST-1.0.0 · protocol SSCTR-EP-1.0.0 · skill 1.0.0.
- **Instance:** the same reviewer instance as r1. It did not author any of the target texts. Model, tools and permissions were inherited, and no specialist was delegated.
- **Read-only:** this file is the only write.
  - The Figma file was read through the existing session `ceddd3c4-…`, using read-only `use_figma` text extraction and node screenshots.
  - The docs were read from the held corrections. No queue edits, no repo or Figma edits, no verify scripts.
- **No new literature search.** The scientific basis is still SSCTR-OB2-2026-10-25-r1.
- **No human, empirical or clinical validation happened.**

## What was checked

- **Held corrections:** `PENDING_DOC_CORRECTIONS_R2.json`, SHA-256 prefix `be103e0cd58e5fc3`, 34 ops.
  - Read-only check: every op's `from` string occurs exactly once in its current target.
  - The current `product/` hashes still equal each `preSha256` (PDR `d9ea31a1…`, UXS `8d91e765…`, AEOS `08149de6…`, AEC `1db3b0e0…`, SIS `2f5179ae…`, STIL `2d6d20b7…`).
  - The `to` texts are judged as the text that will be applied. Statuses that depend on them read **BOUND on application**.
- **Figma nodes (live):**
  - ON-06 `120:828` and its note `120:1177`;
  - ON-V7 `126:1887` and its note `126:2079`;
  - ON-V7b `400:4698` and its note `400:4794`;
  - AD-04 `148:1717` (page 4) and its note `148:1818`;
  - ON-15d `444:4889` and its note `444:5016`;
  - ON-12a `121:1100` and note `121:1292`; ON-12b `121:1213` and note `121:1293`;
  - ON-12c `395:4416`; ON-14b `374:3379` and note `400:13230`; ON-11 `121:1030`.

## Status

| Item | r1 | r2 | Remaining |
|---|---|---|---|
| Q1 Chosen days | MISBOUND | **PARTIAL** (docs BOUND on application) | Note `126:2079` routes the "a day cannot be a supported session" trigger to ON-V7 options that do not let the person keep the choice or choose fewer days. Note `400:4794` routes the same trigger to ON-V7b. The zero-practice variant is still open. |
| Q2 Back-to-back | BOUND | **BOUND** (op 31 BOUND on application) | none |
| Q3 Rotation | PARTIAL | **BOUND on application** (ops 4, 26, 32) | none |
| Q4 Sex | BOUND | **BOUND** (op 5 BOUND on application) | none |
| Q5 Recomendado | PARTIAL | **BOUND on application** (Figma bound now; ops 7, 24) | none |

**r1 escalation points: both resolved.**

1. The ON-06 example now reads exactly "Corrida primeiro alivia as pernas no treino de sexta. Força primeiro mantém o agachamento e ajusta o longão. Equilíbrio pergunta qual proteger."
2. The ON-V7 strength row now reads "Este plano usa pelo menos 2 treinos de força por semana nesta fase". The body is tied to the plan ("este plano não consegue … nesses dias"), and note `126:2079` says the numbers are illustrative while the session floor is open.

## Q1 — PARTIAL

**Verified:**

- The ON-06 example, as above.
- ON-V7 copy (a) and (b) and the note's illustrative-numbers clause (c).
- **C05, op 27:** "MOVE do motor só entre dias escolhidos daquele esporte sem deixar dia escolhido sem sessão, ou por ato da pessoa; outro dia só como opção explícita, de uma vez e rotulada como exceção daquele dia". BOUND on application.
- **Ops 10, 29 and 30 (UXS, HC05, AEC)** say the same. Making chosen days a hard constraint in HC05 matches DR-112.
- **AD-04:** the other-day option is labelled "Exceção fora dos seus dias, só nesta semana", and the person chooses it. It handles the long run by content ("Sai: exercícios de pernas, para não pesar no longão"), which matches Q1 condition 3. "Nenhuma muda os seus outros dias." is correct.
- **ON-V7b note:** carries r1 fix 4. No ceiling is invented, the numbers always come from the answers, and the strength variant is fine.

**Remaining:**

1. **Trigger routing conflict (blocking for Q1).**
   - Note `126:2079` sends "depois da conta, no servidor, quando algum dia não pode ser uma sessão suportada" to ON-V7. The ON-V7 options are "Adicionar dias / Força só para manter / Trocar a meta / Mais tempo por treino".
   - Q1 condition 2(b) requires the options keep / choose fewer days / keep anyway, with the fact named. Note `400:4794` routes the same trigger to ON-V7b with those options.
   - Replace that clause of `126:2079` with: **"depois da conta, no servidor, quando algum dia não pode ser uma sessão suportada para o perfil: o texto nomeia esse fato (qual dia e por quê) e as opções são manter a escolha ou escolher menos dias, mais 'Mais tempo por treino' quando é o tempo que falta (SSCTR Q1 cond. 2b; mesma regra da ON-V7b). Nenhum dia é tirado sozinho."**
2. **Zero-practice variant (`400:4794`).**
   - "Você escolheu 6 dias de corrida e ainda não corre…" must not continue with "Dá para usar os 6" unless a reviewed beginner (familiarization) recipe makes every chosen day a supported session. Otherwise it takes the named-fact branch.
   - Append to the note: **"Na variante sem prática, 'dá para usar todos' só vale se a receita de familiarização revisada cobrir cada dia; senão, nomeia o fato."**
3. **Non-blocking (Product/UX):** AD-04 is drawn with the first option checked. Mark it as the person's tap (as ON-06 now does), because the note says the app asks rather than chooses.

## Q2, Q3, Q4, Q5

- **Q2:** op 31 is my r1 completion verbatim. ON-12c is unchanged and verbatim.
- **Q3:**
  - Op 4 (DR-113) and op 26 (ONB-22) carry the replacement: "séries, repetições e esforço seguem evoluindo…; quando um exercício muda, a carga do novo começa por um ajuste pelo esforço".
  - Op 32 (STIL) is my completion verbatim.
  - ON-14b and its note are unchanged and bound.
- **Q4:** op 5 adds "which must be adequate on its own: disclosing sex never yields a materially better plan". Op 6 (Security wording) adds no physiological use. ON-11 is unchanged and verbatim.
- **Q5:**
  - Note `120:1177` now states that the drawn state is after the person's tap and that nothing is selected on open. The reason line sits under the recommended option.
  - Op 7 and op 24: the precedence is unchanged. Mapping "Correr mais rápido / Correr mais longe" to the run-performance-without-date class is consistent with Q5 condition 2.
  - The four reason templates name the person's own goals and contain no prohibited wording. The dated-race template shortens the accepted line, and that is acceptable.

## Prohibited-claim scan (new and changed texts)

No Q1–Q5 prohibited claim appears in the texts below. Checked for: "ideal", "seguro", injury risk, "mais dias = mais resultado", "a ordem não importa", "sem prejuízo", "evita interferência", hour rules, "confusão muscular", "evita platô", sex-adapted training, "cientificamente melhor", "garante".

Texts scanned:

- ON-06, ON-V7, ON-V7b, AD-04, ON-12a, ON-12b and ON-15d, with their notes;
- ops 4, 5, 7, 23–32.

The shift semantics (op 25 and op 28: "Horário" is a preferred start range that does not lock the time) and the Rotina renames (ops 8–17, 33, 34) add no sporting claim.

Clinical-boundary findings. These are outside Q1–Q5 and not my escalation points, but they need owners.

1. **Op 23 (UXS ONB-11).**
   - "contar uma limitação (dor ou lesão, ou volta de pausa) … uma linha neutra recomenda avaliação profissional" extends the referral line to every pause. That includes travel and routine pauses, which turns an unknown into an automatic referral (SSCTR-05).
   - Replace with: **"…a resposta vale como desconhecida; para dor ou lesão, uma linha neutra recomenda avaliação profissional; a pessoa pode autorizar depois em Perfil…"**
   - ON-15d itself is correct: it covers pain or injury only, collects no region and says "O Vilumo não diagnostica nem trata lesões".
2. **Pre-existing, now repeated in ON-15d `444:4889`** (also on ON-15 `122:1156` and the ON-15b frames).
   - The option sub-label "Doença, viagem ou rotina — sem lesão" groups illness with non-clinical pauses. UXS AM-09 and CTN-06 keep return after illness on a dependent HOLD with qualified review `[DEP-G04]`.
   - Suggested sub-label: **"Viagem, rotina ou outro motivo — sem dor nem lesão"**. Illness as the stated reason should follow CTN-06.
   - Owner: G04 + Product/UX.
3. **Optional (same frames):** the subtitle "Ajuda a não planejar o que você não deve fazer" implies the app knows what is contraindicated. Suggested: **"Ajuda a planejar em volta do que limita você agora."**

## Status fields

- **Disposition:** binding re-check only. The basis dispositions are unchanged.
- **AE action:** NOT_APPLICABLE.
- **Gate:** NOT_CLOSED_BY_THIS_RECORD.
- **Publication:** NOT_PUBLISHED.
- **Human, empirical and clinical validation:** false.
- **Queue:** no new prescriptive approval, so no new queue entry.
- **"BOUND on application"** holds only if the held ops are applied byte-for-byte after DOMAIN_COACHING_R6 closes, with the `preSha256` and `postSha256` checks. Any re-based op needs this reviewer to re-check it.
- **Re-review triggers:** an edit to `126:2079`, `400:4794` or op 23; definition of the session floor or the familiarization recipe.
