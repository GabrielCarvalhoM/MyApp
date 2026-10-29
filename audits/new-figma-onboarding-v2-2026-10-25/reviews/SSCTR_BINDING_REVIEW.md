# SSCTR binding review — OB-2 docs and drawn copy against SSCTR-OB2-2026-10-25-r1

- **Review ID:** SSCTR-OB2-BIND-2026-10-26-r1 · started 2026-10-25, resumed and finished 2026-10-26 after a usage-limit interruption (no finding caused the stop; the coordinator says no target changed in between).
- **Versions:** agent SSCTR-1.0.0 · constitution SSCTR-CONST-1.0.0 · evidence protocol SSCTR-EP-1.0.0 · skill sports-science-review 1.0.0.
- **Instance and runtime:** this is a fresh reviewer instance. It did not author [SSCTR_REVIEW.md](SSCTR_REVIEW.md) or any target text. Model, tools and permissions were inherited from the caller, and no specialist was delegated. This instance cannot verify how the caller dispatched it.
- **Read-only:** no file other than this one was written. There were no queue edits and no Figma edits. The Figma file was read only through a session (`ceddd3c4-…`) using read-only `use_figma` scripts (text extraction and node screenshots).
- **What was done:** a binding check only. No new literature search was run, because no claim here needed new evidence. The scientific basis is the SSCTR-OB2-2026-10-25-r1 record, which is reused as is.
- **What did not happen:** no human review, no human or empirical validation and no clinical clearance.

## Target texts (SHA-256 at the time of review)

| File | SHA-256 | Rows read |
|---|---|---|
| `product/PRODUCT_DECISION_REGISTER.md` | `d9ea31a1…ffa5a` | PDR-1.7 block, lines 1–17 (DR-112–115 at lines 10–13) |
| `product/UX_SPECIFICATION.md` | `8d91e765…735d9` | ONB-07 :295, ONB-09 :297, ONB-20 :307, ONB-21 :308, ONB-22 :309, EDT-02 :624 |
| `product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md` | `08149de6…e02` | `profile_context` :74, `practice_context` :75, C05 :122 (diffed against `before/`) |
| `product/SPORT_INTELLIGENCE_SPEC.md` | `2f5179ae…f4e7e4d` | "Dias escolhidos" :86 |
| `product/STRENGTH_INTELLIGENCE_SPEC.md` | `2d6d20b7…c45c8` | "Troca de exercícios" :72 |
| `product/RUN_INTELLIGENCE_SPEC.md` | `d8231b0c…1cf2` | "Dias de corrida e longão" :82 |
| Basis: `reviews/SSCTR_REVIEW.md` | `971fbe95…56bd` | Q1–Q5 conditions, accepted copy and prohibited claims |

Figma `TYR10AIrquCpKvKL3eyXyO` nodes read:

- ON-06 `120:828`, ON-11 `121:1030`, ON-12a `121:1100`, ON-12b `121:1213`, ON-12c `395:4416`, ON-14b `374:3379`, ON-16 `122:1253`, PP-01 `122:1305`, ON-V7 `126:1887`, ON-V7b `400:4698`, CF-04 `178:3793`.
- Notes: `120:1177` (ON-06), `121:1291` (ON-11), `121:1292` (ON-12a), `121:1293` (ON-12b), `400:13235` (ON-12c), `400:13230` (ON-14b), `400:4794` (ON-V7b), `126:2079` (ON-V7), `122:1547` (ON-16), `122:1548` (PP-01), `396:4564` (progression footnote) and `178:4091` (CF-04).

## Summary

| Item | Status | Blocking fix |
|---|---|---|
| Q1 Chosen days | **MISBOUND** | ON-06 conflict example moves a session to another day. Also C05, ON-V7 and the ON-V7b note need fixes. |
| Q2 Back-to-back order | **BOUND** | None. One optional completion. |
| Q3 Rotation | **PARTIAL** | The DR-113 sentence "load … keep progressing" restates the rejected footnote claim. |
| Q4 Sex | **BOUND** | None. One optional completion. |
| Q5 Recomendado | **PARTIAL** | The ON-06 drawn state shows the recommended option selected, with nothing marking it as the person's own choice. |

Escalation trigger (route `escalate_if`): yes, on two points.

1. The ON-06 example contradicts the approved Q1 condition 3 and DR-112.
2. ON-V7 presents an unreviewed number as a requirement of the goal: "Ganhar massa muscular · Pede 2 treinos de força por semana". This is a new prescriptive claim. SSCTR C1.1 says frequency mostly matters through volume, and the session-floor policy is still an open item.

---

## Q1 — Chosen days are binding (DR-112) · MISBOUND

**Bound correctly:**

- **DR-112 (PDR :10)** carries conditions 1, 2, 3 and 5:
  - "weekly load — set first";
  - "more days spread the load, they never add to it";
  - "too many" is judged against recent practice, with content first and then ON-V7/V7b;
  - chosen days are never dropped;
  - long-run adjacency is handled by content, with no hour rule;
  - HOLD may reduce, replace or retain a session, always with an explanation.
- **ONB-09 (UXS :297)** says the same, and **`practice_context` (AEOS :75)** describes a hard allocation constraint.
- **SIS :86** carries condition 3 almost word for word, including "em força principal, o conteúdo do longão pode ceder".
- **RIS :82** keeps long-run progression under current run policy and adds no number.
- **ON-12a, ON-12b, ON-16 and the CF-04 copy and notes** say "usa exatamente esses dias" and that the coach decides content and dose. These texts make no frequency claim.
- **PP-01 "Por que assim"** places lower body on Monday and upper body on Thursday so that "o treino de pernas fica longe do longão de sábado". This is condition 3 done by content. "Sexta e domingo ficam livres" is stated as a fact, not as a rest rule.
- **ON-V7b copy** is the accepted pattern string verbatim, with numbers that come from the person's answers. It contains no prohibited claim.

**Misbound or partial, with exact fixes:**

1. **ON-06 `120:828` "Exemplo de conflito" — MISBOUND (blocking).**
   - Drawn: "Corrida primeiro muda o agachamento de dia."
   - Under DR-112 and Q1 condition 3, the coach never moves a session to another day. Adjacency to the long run is handled by content.
   - Replace with: **"Corrida primeiro alivia as pernas no treino de sexta. Força primeiro mantém o agachamento e ajusta o longão. Equilíbrio pergunta qual proteger."**
2. **AEOS C05 :122 — PARTIAL.**
   - Current: "MOVE apenas dentro dos dias escolhidos". An engine MOVE between chosen days can leave a chosen day without its session, which breaks "cada dia escolhido recebe uma sessão daquele esporte".
   - Replace with: **"…SUBSTITUTE apenas repertório aprovado; MOVE do motor só entre dias escolhidos daquele esporte sem deixar dia escolhido sem sessão, ou por ato da pessoa (DR-112); senão ASK/HOLD dependente."**
3. **ON-V7 `126:1887` — PARTIAL.** Three changes:
   - (a) Strength row: "Ganhar massa muscular · Pede 2 treinos de força por semana" → **"Este plano usa pelo menos 2 treinos de força por semana nesta fase"**. This makes it parallel to the run row and turns it into a fact about the plan, not a claim about what the goal requires.
   - (b) Body: "…não dá para preparar a meia maratona e ganhar massa ao mesmo tempo." → **"…este plano não consegue preparar a meia maratona e o ganho de massa ao mesmo tempo nesses dias."**
   - (c) Note `126:2079`: "Os mínimos … vêm da política aprovada da fase" → **"Os mínimos virão da política de treino aprovada da fase; o piso de sessão suportada ainda está em aberto (política de treino + SSCTR), então os números desenhados são ilustrativos."** No approved floor exists (PDR :16 lists it as open).
4. **ON-V7b note `400:4794` — PARTIAL (consistency).**
   - The note says the screen appears only when the coach *cannot* make each day a supported session. The drawn copy, which is the accepted string, describes the case where it *can* ("Dá para usar os 6").
   - Fix the note: **"Aparece quando os dias escolhidos passam bem da prática recente (ONB-08). Se cada dia puder ser uma sessão suportada, o texto é o desenhado. Se algum não puder, o texto nomeia esse fato e as opções são manter a escolha ou escolher menos dias."**

---

## Q2 — Same shift, back to back · BOUND

**Bound correctly:**

- DR-112 (:10), ONB-21 (:308), SIS :86 and note `400:13235` all say:
  - the person's explicit confirmation is stored as a preference they can change;
  - the day's key session goes first by priority;
  - in Balanced with both sessions key → ASK;
  - the person can swap the order;
  - there is no hour rule;
  - a double counts as two sessions.
- EDT-02 :624 re-asks the sequence confirmation when a move creates a same-shift pair, and treats an off-day move as an exception made by the person.
- The ON-12c sheet `395:4416` uses the accepted title, body and buttons verbatim. "O dia fica mais longo" frames the length as logistics.
- No text uses the prohibited phrases "a ordem não importa", "sem prejuízo" or "evita interferência". The note lists them as prohibited.

**Optional completion (not blocking):**

- Q2 condition 4, a limited recommendation, is absent: avoid placing a demanding key session of one sport straight before a demanding key session of the other, handled by content.
- The "must explain" clause for an easy run in Corrida primeiro is also absent.
- Suggested addition to SIS :86, after "a pessoa pode inverter": **"Em corrida principal com corrida leve, a força pode vir antes, com explicação. Quando os dias permitem, o coach evita dois treinos-chave exigentes seguidos pelo conteúdo; se inevitável, reduz a demanda do não prioritário e explica."**

---

## Q3 — Rotation cadence (DR-113) · PARTIAL

**Bound correctly:**

- **ONB-22 (:309)** and **STIL :72** carry conditions 1–4 and the open recipe:
  - selection only, preserving the essential stimulus;
  - systematic, never random or redundant;
  - the first session with a new exercise is calibration by effort;
  - Fixo allows substitution only with the person's agency, and persistent pain goes to the clinical path;
  - "O coach decide" keeps the selection within the block;
  - a rotation due in a taper or race week is deferred;
  - the cadences are preference, not a scientific optimum.
- **ON-14b `374:3379`**: all four option helpers and the footnote are the accepted strings verbatim. "Recomendado" sits on "O coach decide" while "A cada 6 semanas" is selected, which shows that the recommendation does not pre-select. Note `400:13230` lists the prohibited claims and the open anchor-lift question.

**Partial:**

- **DR-113 (PDR :11)** says: "load, sets, reps and effort keep progressing under approved policy". That repeats, in normative form, the claim SSCTR rejected in the footnote (C3.4: external-load progression on a lift restarts when the lift changes).
- Replace with: **"sets, reps and effort keep progressing under approved policy; when an exercise changes, the new one's load starts with an effort-based calibration."**

**Optional completion of Q3 condition 5** (limited recommendation), for STIL :72: **"A primeira exposição de uma troca fica, pelo conteúdo, longe do longão ou da corrida-chave quando os dias permitem; mudança de cadência nunca é apresentada como descanso ou deload."**

---

## Q4 — Sex as a coach input (DR-114) · BOUND

The envelope is carried in DR-114 (:12), ONB-20 (:307), AEOS `profile_context` :74 and note `121:1291`:

- a weak hint only for the first suggested absolute load range, and only when nothing is known;
- replaced by the first logged sets, or losing weight as observed data accumulates;
- never volume, frequency, progression, selection, pace or zone, cycle, hormones or clinical state;
- "Prefiro não dizer" is the neutral path;
- the label is "Sexo", not gender;
- any numeric prior needs its own SSCTR review.

DR-115 and ONB-07 add that the priority suggestion never depends on sex.

The ON-11 helper is the accepted string verbatim. Dropping "Outro" is a Founder/Product choice and raises no scientific issue.

**Optional completion:** to DR-114, add **"the neutral path must be adequate on its own: disclosing sex never yields a materially better plan."**

---

## Q5 — "Recomendado" priority (DR-115) · PARTIAL

**Bound correctly:**

- The precedence in DR-115 (:13), ONB-07 (:295) and note `120:1177` matches Q5 condition 2 exactly:
  - "Força para correr melhor" or "Manter a força" → Corrida primeiro;
  - a dated race → Corrida primeiro;
  - "Correr com regularidade" + development → Força primeiro;
  - performance without a date + development → Equilíbrio;
  - anything else → no tag.
- The suggestion is never pre-selected and never depends on sex. A later goal edit recomputes it for display only.
- The ON-06 reason line "Recomendado porque sua prova tem data. A escolha é sua." is acceptable. It contains none of "cientificamente melhor", "evita interferência", "garante", "necessário" or "a escolha certa".

**Partial:**

- The ON-06 `120:828` drawn state shows "Corrida primeiro" both tagged and selected, with a check and Continuar enabled. No initial-state frame exists, and the note does not mark this as the person's choice, so the frame reads as a pre-selection.
- Fix: either add an initial ON-06 state with nothing selected and Continuar disabled, or append to note `120:1177`: **"Estado desenhado = depois do toque da pessoa; ao abrir, nenhuma opção vem marcada."**

---

## Prohibited-claim scan

Every listed text and note was checked against the Q1–Q5 prohibited lists. None of the following appears as a claim (some appear only inside notes that list them as prohibited):

- "ideal", "seguro" or any injury-risk wording;
- "mais dias = mais resultado";
- "a ordem não importa", "sem prejuízo", "evita interferência", hour or minute requirements;
- "confusão muscular", "evita platô";
- sex-adapted training, cycle programming;
- "cientificamente melhor", "garante".

The two new-claim findings are the ON-06 day move and the ON-V7 "Pede 2 treinos de força" number.

PP-01 "um treino de ritmo na quarta: a base da meia maratona" describes the plan, not efficacy. It is acceptable.

## Status fields

- **Disposition:** binding check only. The basis dispositions of SSCTR-OB2-2026-10-25-r1 are unchanged.
- **Evidence status:** inherited unchanged.
- **AE action:** NOT_APPLICABLE.
- **Gate:** NOT_CLOSED_BY_THIS_RECORD.
- **Publication:** NOT_PUBLISHED.
- **Human, empirical and clinical validation:** false.
- **Queue:** no new prescriptive approval, so no queue entry.
- **Next owners:**
  - PCG/Chief for the doc wording (DR-113, C05; optional SIS, STIL and DR-114 completions);
  - Product/UX/design for the Figma copy and notes (ON-06 example, ON-06 state, ON-V7, ON-V7 note, ON-V7b note).
- **Re-review trigger:** any edit to the rows or nodes listed above, or definition of the session floor or the rotation recipe.
