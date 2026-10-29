# Product/UX architecture review — Growth Layer Figma delta (GLF-20261029)

| Field | Value |
|---|---|
| Judge | Independent Product/UX Architect instance (Opus 5.5, max effort). Not the author or a co-author of this delta. One round, read-only. |
| Artifact | Figma `TYR10AIrquCpKvKL3eyXyO` as of 2026-10-29, pages 1, 3, 5, 6, 8, 9 and 11, located through the frame map in `../RECORD.md` §4. It is an experience candidate, not promoted. |
| Rubric | `agent-system/evals/PRODUCT_ARCHITECTURE.md` 1.0.0 |
| Acceptance contract | `../FOUNDER_REQUEST.md` (verbatim Founder request; "Founder §n" below means its section n) |
| Authority read | GRW record (DR-124–133), held `PENDING_CANON_SYNC.patch` r2, GRW blocks in `CURRENT_MISSION.md`; UXS §7.2, §16/§16.1, §19/§19.1 (semantics binding, placement legacy); PA §2–§4 and §7; designer context |
| Method | `get_screenshot`, `get_metadata` and read-only `use_figma` scripts: texts, prototype reactions, component descriptions, grid cells. No Figma mutation. No repo file touched except this one. |

## Verdict

**`PRODUCT_UX_ARCHITECTURE_EVAL = FAIL`** (narrow: 2 MUST, 5 SHOULD, 3 COULD).

**What holds:**
- The four tabs and Você are unchanged.
- Growth stays embedded: no tab, hub or destination.
- Every new frame is either a state of an existing surface or one leaf screen.
- The Home gets one reflex, which replaces content instead of adding it.
- The referral is minimal.

**What blocks.** Two contradictions break journeys that the Founder named:
- **PUX-01:** in Result → Progress, the result cites evidence that its own destination contradicts.
- **PUX-02:** the consistency grid draws weeks with no plan, and a pending session, as "não feito".

The rubric makes both blocking: a broken journey and a violated invariant. Both fit the one narrow fix round allowed by the record (RECORD §1). VISUAL_READY is not issued for this revision.

No finding needs a Founder strategy decision, and none exposes an upstream authority contradiction.

## The nine questions

| # | Answer | Findings |
|---|---|---|
| 1 Navigation | **Preserved.** The tab bar Hoje · Plano · Histórico · Progresso is unchanged (for example, the tab reactions in HJ-15 `587:3796`). Você is reached by the avatar (CF-01 note: "Sem nova aba"). The page-8 map `192:3412` adds entries only inside existing columns. The composer is a modal, and RF-01 is a leaf of Você. No Growth tab, hub or destination. | — |
| 2 New screens | **Justified**, with one exception (below). <br>• SH-02/04/05/06/07 are format states of one composer. <br>• SH-03 replaces the DR-91 confirmation; it serves DR-133 points 3 and 7. <br>• ST-06/07/08 are required by a networked map and an exact preview. <br>• HJ-15 is a state of the existing Semana tile. <br>• RF-01–03 are one leaf screen plus its states; its consumer is the "not a Crew invite" explanation. <br>**Exception:** the "Marco" share context has no defined origin. | PUX-06 |
| 3 Home | **Sound.** <br>• The closed-week state replaces the tile's low-information "0 de 7". <br>• It puts no share CTA on the Home (SHR-15). <br>• It reverts when opened or when the week's first session starts. <br>• Keeping consistency, PR and milestone off the Home passes the Founder's "only with clear benefit" test. <br>**Gap:** only the 7/7 case is defined. | PUX-05 |
| 4 History/Progress | **Requirements preserved:** calendar (HI-02), week (HI-03), month (HI-02, PL-02), list (HI-01) and detail (CC/DT). Removing the month totals is consistent with CTN-02, and no link was lost (the old card had none). <br>**Issues:** HI-01's card answers "Estou melhor?" in one card, but its drill-downs do not hold its facts. The Progresso consistency card it links to contradicts it. | PUX-02, PUX-03 |
| 5 Post-workout | The loop closes inside CC-01/CC-02 with no new screen. <br>• **CC-02:** the record cites evidence that PR-06 confirms (115 kg vs 112.5 kg on 5 Oct, same configuration). <br>• **CC-01:** the comparison cites a session that its own "Ver evolução" target contradicts, and its share button has no defined context. | PUX-01, PUX-07 |
| 6 Consistency | **In place:** weekly units, rest counts, no daily streak, "treino não feito não vira dívida", and [DEP-G03] in layer names and descriptions. <br>**Issues:** <br>• the grid encodes pre-plan weeks and pending sessions as "não feito"; <br>• HOLD, reduction, unknown and run-end states are undefined; <br>• share facts go beyond G03. | PUX-02, PUX-04, PUX-06 |
| 7 Referral | **Minimal and correct:** one row, one screen, link and code, copy, system share and an offline state. No reward, wallet, ranking, count or graph. Owners G07/G08/G10 are recorded. | PUX-09 |
| 8 Boundary | **No Adaptive Engine semantics in the delta** ("Compara fatos; não diz por quê", "Mostra o que mudou, não por quê"). "O que isso muda no plano" is untouched. <br>**DR-133 is structurally coherent:** <br>• the composer opens on Dados; <br>• Map/Route are opt-in and off on each new image; <br>• a chip with "Editar" and a static shape warning; <br>• a sheet instead of an alarm modal; <br>• "Compartilhar sem rota"; <br>• no route formats for Força. <br>**Security/Engineering items are marked open, not decided:** 400/800 m placeholders, reduce/off (GRW-09), provider and tiles (G07), no Privacy Zones UI, repeated-share inference. The "No caminho" chip and the map-like in-app route are correctly listed for reconciliation. | — |
| 9 States | **Share:** ST-06 unavailable, ST-07 loading, ST-08 failed, ST-03 generation failure, ST-02 after the sheet. **Referral:** RF-02, RF-03. **Other:** the Destaque card hides without evidence (`575:1155`); HI-07 is the empty state. <br>**Missing:** consistency and closed-week variants. | PUX-04, PUX-05 |

## Findings

### MUST

**PUX-01 · MUST · CC-01's comparison is contradicted by its own "Ver evolução" destination.**

*What CC-01 claims* (CC-01 `21:2`, card `586:3830`):
- "Média dos tiros 4:14 /km — 5 s por km mais rápida que no último 5 × 1 km (4:19 /km, 23 set)";
- reps 4:14 / 4:12 / 4:15 / 4:13 / 4:17;
- "Faixa alvo 4:11–4:19 /km" and "5 de 5 no alvo".

*What its destination shows.* "Ver evolução" (`I586:3830;575:1150`) opens PR-04 `169:3255`, which lists:
- "5 × 1 km · qua 14 out · 4:09";
- "5 × 600 m · qua 23 set · 4:15" ("23 set usou a referência anterior … alvo 4:08–4:16");
- "alvo atual 4:06–4:14 /km".

*Where they disagree:*
- **14 Oct value:** 4:14 vs 4:09.
- **The cited reference does not exist:** no 5 × 1 km comes before 14 Oct, so "último 5 × 1 km de 23 set a 4:19" has no session behind it.
- **Bands:** 4:11–4:19 vs 4:06–4:14. Under PR-04's band, the 4:15 and 4:17 reps fall outside, so "5 de 5 no alvo" breaks.
- **Comparability:** CC-01 requires "mesma estrutura", while PR-04's note compares a "família de sessões" across 600 m and 1 km reps.

The record's cross-screen check (RECORD §5) covered CC-01 and the share system, not PR-04.

*Rules broken:*
- Founder §1: "destacar PR/milestone somente quando houver evidência real";
- DR-128: no false certainty;
- SHR-04/SHR-17: a comparison only with origin and comparability `[DEP-G03]`;
- the component's own rule, "Só aparece com evidência" (`575:1155`);
- rubric: one fact, one source, and journey continuity.

*Fix:*
1. Make PR-04 (owner of the interval series) and CC-01 agree on the 14 Oct value, the band and the "no alvo" count.
2. Cite a comparable session that exists in PR-04, or add it to PR-04's history.
3. Mark in PR-04 the pair the card compares, so that "Ver evolução" lands on the evidence.
4. Use one comparability notion on both screens, `[DEP-G03]`.
5. Re-run the value check across CC-01, PR-04, the 5.0 doc and the gallery.

**PUX-02 · MUST · The consistency grid draws weeks with no plan and a pending session as "não feito", and contradicts HI-01.**

*The card* (PR-01 `22:2`, card `22:93`):
- labelled "Consistência · Semanas do plano · últimas 12 semanas", with tag `587:3786` "4 seguidas" (layer "Semanas completas seguidas [DEP-G03]");
- 12 columns, from "ago" to "hoje", with dashed "Não feito" cells in columns 2, 5, 7 and 12;
- copy: "8 semanas completas · 3 com um treino não feito".

*Why that is wrong.* The plan starts at S1 = 24–30 Aug (PL-08 `165:2825`; HI-01 "24 ago · 9 semanas"; HJ-15 "Semana 9 de 16"). So:
- **Columns 1–3** are weeks before any plan existed, yet they are drawn with plan states, and column 2 shows a miss.
- **Column 12** ("hoje") is week 9, still in progress, with 2 sessions done according to HI-01. It shows a session that is still pending as "Não feito".

*The HI-01 contradiction.* HI-01's row "Semanas completas 6 de 8" (`586:3933`) opens this card, where the person reads "8 semanas completas". The hero's "52 de 55 · 3 não feitos" uses the same 12-week window.

*Rules broken:*
- Founder §5: language that treats days without training as failure is forbidden;
- DR-127/DR-132: consistency means adherence to the plan;
- CTN-05: NO_DATA is neutral;
- HOJ-C18 / EM §5: absence of history is not failure;
- CTN-11: the current week shows done or pending per item;
- rubric: invariants, and one count per concept.

*Fix:*
1. Start the grid at S1, or draw the pre-plan columns as a neutral "sem plano" state with neither feito nor não feito.
2. Give the open week a pending state distinct from "Não feito", or leave it out of the grid.
3. Recompute the copy and the hero counts so that PR-01 and HI-01 agree. From the scenario, that gives "6 de 8 semanas completas · 2 com um treino não feito" and "4 seguidas".
4. Keep `[DEP-G03]`.

### SHOULD

**PUX-03 · SHOULD · "Estou melhor?" has two summaries and no single owner in Progresso, and drill-downs don't show what was tapped.**

*HI-01's card* (`586:3849`, "Desde o início do plano") has three rows:

| Row | Text | Opens |
|---|---|---|
| `586:3898` | "Ritmo de prova 4:58 → 4:46" | PR-02 `23:2` |
| `586:3914` | "Agachamento 105 → 115 kg · 5 repetições · mesma barra" | PR-06 `169:3466` |
| `586:3933` | "Semanas completas 6 de 8" | PR-01 |

*What Progresso shows instead:*
- **No plan window:** its period chips are 4 sem · 12 sem · 6 meses · 1 ano.
- **PR-06** leads with "1RM estimado 134 kg", an estimate, and never shows the 105 kg starting point.
- **PR-01's hero** ("Últimas 12 semanas · Mais corrida, cargas maiores") answers the same question with other facts: 412 km with "+18%", "3 de 4", "52 de 55".

*Missing Progress → Share leg.* The gallery's Evolução example (`585:2458`, "Agachamento livre 105 → 115 kg · 24 ago – 19 out") appears in no Progresso view. PR-04 and PR-06, where "Ver evolução" lands, have no share entry.

*Rules:*
- PA §3 (binding object reference): "Histórico/PR/marco/analytics → Progresso, origem de detalhes e share";
- rubric: multiple entries must not create competing sources;
- Founder §4: "evitar dashboards redundantes";
- DR-128: observed ≠ estimate, and "comparação entre ciclos";
- SHR-15: the Força deep dive is a share moment.

*Fix:*
1. Add a "Plano atual" period (since S1) to Progresso, and open HI-01's rows with it preselected.
2. Make PR-06's headline the observed series of the best comparable 5-rep set, with e1RM secondary `[DEP-G02]`.
3. HI-01's card then becomes a compact selection of that view, with the same numbers. The Evolução share starts from the Progresso deep dive.
4. Define the window across plan continuation: per cycle, or since the first plan.
5. Card rule: a row appears only when it has a comparable pair, and the card is absent when no row qualifies.
6. Reconcile PR-01's hero with the same comparable facts. Its green "+18%" on km frames volume as merit (PA §4, L020); this predates the delta and belongs on the reconciliation list.

**PUX-04 · SHOULD · The consistency state model leaves DR-125/DR-132 cases to the UI.**
- **Evidence:**
  - PR-01's legend has only "Feito / Não feito" (`22:93`).
  - The copy on PR-01, in the HI-01 row subtitle, in HI-03 `587:3774` and on the Marco block covers only "Descanso planejado conta".
  - Undefined: a week with an honored HOLD, a load reduction or an accepted adaptation; a partial session; "sem registro" (unknown).
  - Nothing says what "4 seguidas" shows when the run ends.
- **Rules:**
  - DR-125: no growth mechanic pressures against rest, reduction or HOLD;
  - DR-132: honored rest, reduction and HOLD count as completion (decided);
  - DR-127: unknown is neither failure nor success; the criteria are G03;
  - CTN-05 and HOJ-C23;
  - rubric: "UI não precisará inventar regra de produto".
- **Fix:** write the rules in the PR-01 note or in the `575:1203` description, and draw one week with an honored adaptation.
  - Honored HOLD, reduction and adaptation render as done (DR-132; exact criterion `[DEP-G03]`).
  - Unknown renders neutral, never as "não feito".
  - Partial follows G03.
  - When the run ends, the tag simply disappears: no "0 seguidas", no "recomece", no loss copy and no notification.

**PUX-05 · SHOULD · HJ-15 defines only the perfect week.**
- **Evidence:**
  - HJ-15 tile `587:3830`: "Semana 8 · 7 de 7 · fechada · ver resumo".
  - Note `587:3903` defines persistence and target, but no variants.
- **Rules:**
  - HOJ-S5/S6: never a failure label, a list of misses or a demand;
  - HOJ-C23;
  - CTN-04: a pause shows as a pause;
  - CTN-11;
  - DR-125.
- **Fix:** draw (a), or write all three in the note.
  - **(a) Incomplete week:** same neutral form ("6 de 7 · fechada"), no failure colour, no list of misses.
  - **(b) Honored adaptation or HOLD:** counted per DR-132 `[DEP-G03]`.
  - **(c) Declared pause, NO_DATA week or the plan's first week:** no closed-week reflex; the tile shows the current week.

**PUX-06 · SHOULD · Consistency facts in external shares go beyond G03 and the §16.1 fields, and Marco has no origin.**
- **Evidence:**
  - Marco block (gallery `585:2458`): "4 semanas seguidas · com o plano da semana completo", with an 8-week grid that shows the two missed weeks.
  - Semana block: "Minha semana · 7 de 7 treinos".
  - Before this delta, the approved CD-05 (`172:3966`, page 11) showed "Treinos 7", with no planned denominator. The old CD-06 Marco was a distance milestone.
  - Inconsistent treatment: the Semana block applies SHR-17's fallback ("Minha semana" until G03), but Marco asserts "completo".
  - No frame or note says where Marco is chosen.
- **Rules:**
  - SHR-17;
  - SHR-13 / §16.1 Semana: "sessões feitas por modalidade";
  - DR-127 / GRW-06: adherence stays out of shares until G03 + allowlist, and labels are provisional;
  - PA §7: "semana elegível … conforme critério aprovado";
  - Founder §9: neutral content where semantics are not authorized;
  - Founder §11: no artifact without a consumer.
- **Fix:**
  - **Until G03 and the allowlist decision:** either don't offer Marco externally, or give it neutral copy without "completo" that shows only the qualifying run, not the missed weeks.
  - **Semana:** show done counts by modality without "de N", or make "de N" an off-by-default field marked `[DEP-G03 + allowlist]`.
  - **Origin:** define where Marco is chosen, for example a context switch in the composer opened from HI-03, like SH-07's "Treino | Recorde".

**PUX-07 · SHOULD · The comparison card's "Compartilhar" has no defined target.**
- **Evidence:**
  - CC-01 card `586:3830` has a "Compartilhar" button (not wired) next to the header share icon.
  - `575:1155` says the button "abre o compositor com o contexto já escolhido", but:
    - no Bloco context carries a run comparison (`572:813`: Corrida, Força, Recorde, Marco, Semana, Evolução, Dia duplo, Prova);
    - the run composer (SH-01–06) has no context switch;
    - Evolução is drawn only for strength.
  - Consequence: either the button duplicates the header share and the highlighted fact never reaches the artifact, or the UI invents a block.
- **Rules:**
  - SHR-16: the initial context follows the origin of the tap;
  - rubric: journey from entry to completion;
  - Founder §1: Result → Share.
- **Fix:**
  - Add an origin → initial-context table to 5.0, covering CC-01 Comparação, CC-02 Recorde, the header shares, HI-03 and Progresso.
  - For Comparação, pick one:
    - Corrida/Intervalado, with the comparison as an optional allowlisted field `[DEP-G03]`;
    - Evolução for runs;
    - drop the card's button and keep a single run share entry.

### COULD

**PUX-08 · COULD · Stale cross-references after renumbering.**
- The CC-02 note `145:2615` says "Compartilhar → SH-05", but SH-05 is now the Foto state (`580:1325`).
- The ST-04 note `174:4580` says "ver OV-06", a frame now parked on page 11 as superseded.
- Point both at the current frames.

**PUX-09 · COULD · Referral wording and a name-based code.**
- RF-01 `590:1749` uses two verbs: "INDICAR", "Convidar para o Vilumo", "Indique o Vilumo", "Compartilhar convite…". Pick one.
- The placeholder link and code embed the person's first name ("vilumo.app/c/lucas-7k2f", "LUCAS-7K2F"). A name-based code is an identity and enumeration choice (G07/G08, Security). List the code format as open, rather than leaving it implied by the mock.
- The loading state for first link generation is not drawn.

**PUX-10 · COULD · The Semana tile's destination depends on its state.**
- HJ-15's tile opens HI-03 (History).
- The tile's normal destination is undocumented and unwired: the HJ-01/02/06 tiles have no reaction.
- Document the normal destination (AR-02, stable references) and record that the closed state opens the week summary by design.

## Re-review and handoff

- **Fix round** (RECORD §1 bound):
  - PUX-01 and PUX-02, kept narrow.
  - Re-review covers only those nodes: CC-01, PR-04, PR-01, HI-01 row `586:3933`, and the 5.0 or gallery values if they are touched.
- **SHOULDs:** fix them in the same round where cheap. Otherwise record each in the record's open items with its owner:
  - G03 with Product/UX for PUX-04 and PUX-06;
  - Product/UX for PUX-03, PUX-05 and PUX-07.
- **COULDs:** go to the Final Product Reconciliation list.
- **Handoff:** no handoff to the Designer gate is emitted on FAIL. After a passing re-review, VISUAL_READY applies only to the revision reviewed.
- This is an independent judgment of another instance's work, not a self-assessment. The Figma file was not modified.

## Re-check r1 (2026-10-29, after the single fix round)

**Scope:**
- Re-checked: only the nodes behind PUX-01 and PUX-02, as listed in `../RECORD.md` §7.
- Same judge, same rubric, read-only.
- On request, a quick look at the SHOULD/COULD fixes.

**`PRODUCT_UX_ARCHITECTURE_EVAL = PASS_WITH_CONDITIONS`**
- No MUST remains.
- VISUAL_READY applies only to the reviewed revision: `TYR10AIrquCpKvKL3eyXyO` in its fix-round-r1 state, 2026-10-29.
- The one condition below is non-blocking and carried with its owner.

| Finding | Re-check evidence | Status |
|---|---|---|
| PUX-01 | **CC-01 `21:2`:** <br>• reps 4:10 / 4:08 / 4:09 / 4:09 / 4:07, mean 4:09; <br>• band `21:222`: "Faixa alvo 4:06–4:14 /km · variação de 3 s"; <br>• observation `21:343`: "3 s de variação"; <br>• "5 de 5 no alvo" now holds under the band. <br>**Highlight `586:3830`:** "Comparado ao último intervalado · 6 × 600 m → 5 × 1 km · Ritmo médio dos tiros parecido (4:10 → 4:09 /km) … anterior em 30 set". Its only button is "Ver evolução", wired to `169:3255`. <br>**PR-04 `169:3255`:** shows 14 out 4:09 and 30 set 4:10 in blue, with the caption "Em azul: o par comparado no treino de 14 out (mesma família de treino)". "alvo atual 4:06–4:14" matches CC-01. <br>**Component `575:1155`:** now defines Comparação with PR-04's notion ("o último treino da mesma família … [DEP-G03]"). <br>**Share values:** Bloco Corrida `572:563` bars read 4:10 / 4:08 / 4:09 / 4:09 / 4:07. No old interval pace remains on page 5 or in the GL components frame. | Closed |
| PUX-02 | **PR-01 grid `131:519`:** "Semanas do plano (S1–S9)", labelled "desde 24 ago", 9 columns. <br>**Legend `131:592`:** Feito / Não feito / Por vir. <br>**Cells:** S2 and S4 each have one "Não feito"; S9 shows 2 done + 2 "Por vir", so the open week shows no failure. <br>**Copy `131:599`:** "6 de 8 semanas completas · 2 com um treino não feito · semana 9 em andamento". <br>**Hero `22:85`:** "Treinos do plano 54 de 56 · 2 não feitos". <br>**HI-01 row `586:3933`:** "6 de 8" now lands on the same count. <br>**Rules note `609:3845`:** <br>• honored rest, reduction, HOLD and accepted adjustment count as done (DR-132, DEP-G03); <br>• unknown is neutral; partial follows G03; <br>• the tag shows only from 2 consecutive weeks and disappears silently. | Closed |

**SHOULD/COULD (quick look):**
- **Fixed:**
  - PUX-04: note `609:3845`.
  - PUX-05: variants (a)–(c) in the HJ-15 note.
  - PUX-06, Marco: "4 semanas seguidas no plano", no "completo", only the qualifying run, marked `[DEP-G03 + allowlist]`, origin HI-03.
  - PUX-06, Semana: "7 treinos · Corrida 4 · Força 3", no planned denominator.
  - PUX-07: the comparison card has no share button, and 5.0 now has an origin → context table.
  - PUX-08: the CC-02 note points to SH-07, and the ST-04 note no longer cites OV-06.
  - PUX-09: one verb ("Convide", "Convidar alguém", "Enviar convite…"), neutral code 7K2F-Q9XM.
  - PUX-10: the HJ-15 note documents both destinations.
- **Partly fixed:** PUX-03. PR-06 now leads with the observed "Melhor série de 5 repetições · 115 kg · Desde 24 ago: 105 → 115 kg", with e1RM secondary, and "Compartilhar evolução" closes Progress → Share.

**Condition** (non-blocking; owner Product/UX; correctly deferred in RECORD §7):
- What remains of PUX-03: a "Plano atual" period (since S1) in Progresso, and the window across plan continuation.
- Until then, HI-01's "Ritmo de prova 4:58 → 4:46" row still lands on PR-02's 12-week view.

**New residuals** (COULD; no re-review needed):
- **R1 · CC-01 title "Comparado ao último intervalado".** The last interval session was 7 Oct (6 × 800 m, by effort); it was skipped because it has no pace target. Retitle to "último intervalado com alvo de ritmo" (or "último comparável"), and state the skip rule in `575:1155`.
- **R2 · PR-01 cells per week.** The grid shows 4–5 cells per week (S9 = 2 + 2). The rest of the file uses 7 sessions per week: HI-03 "7 de 7", HJ-02 "1 de 7", and the hero's 54 de 56 = 8 × 7. The legend reads a cell as a session, so draw one cell per planned session.

No escalation. The Figma file was not modified; this section is the only change to this file.
