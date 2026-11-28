success
## BRIEF 1 — #107 light-mode contrast

I didn't promote anything for #107, and the Figma file is unchanged. The required first step failed: `figma.saveVersionHistoryAsync` returns "figma.saveVersionHistoryAsync is not yet supported" in this environment. Your brief requires the version to be saved before any edit, so I stopped there. There is no version id and no old → new node map. No nodes were created or moved, so the map would be empty anyway.

**To unblock:** someone with the file open can save a version from the Figma app (File → Save to version history). Use the title "Antes da promoção — #107" and send me the version id; with it I can run the promotion immediately. #113 and #114 will likely hit the same limit.

The Founder's approval is confirmed: comment 7228026421, recorded by `decisions.mjs` as APPROVED, B + A seletivo. Everything else I did was read-only.

**(A) Variables to change** (collection "Repmile · Cor", mode "A · Claro" only, nothing else):

| Variable | Now | New |
|---|---|---|
| `estado/negativo` (VariableID:543:1291) | #D12F36 | #B90921 |
| `estado/negativo-suave` (VariableID:543:1292) | #D12F36, alpha 0.12 | #B90921, alpha 0.12 kept |
| `texto/terciario` (VariableID:507:11) | #6B707A | #656A73 |
| `zona/4` (VariableID:531:1214) | #C98A0A | #B37A04 |

**(B) What I found about the "components":** the file has no canonical components for the today card, chips or the sets line. The page "02 · Componentes" only holds icons, the status bar, the tab bar, the line illustrations ("Traço/*") and the Apple Health mark. These roles are plain frames inside the canonical screens. So B means rebinding fills in those frames. For icons, it means overriding the fills inside the icon instances; the icon components themselves (`Ícone/forca` 507:68, `Ícone/corrida` 507:60) stay as they are.

I compared the exploration's "Atual" and "Opção B" copies to see exactly what B changes, and built the rebind rules from that. Every target goes from `forca`/`corrida` to `texto/secundario` (VariableID:507:10):

- **R1 · Chips:** text and icon inside frames named `Etiqueta · *`. These are on pages 31, 40, 41 and 50, including the strength chip with the 2.88 pair. The rule only acts when the chip's own fill is `forca/suave` or `corrida/suave`.
- **R2 · Planned minutes:** the number and "min" under `* · <sport> N min · previsto` (pages 20 and 40). That's 236 text nodes on page 20.
- **R3 · Today-card label and icon:** text and icon under `Estado/Modalidade` (page 20). That's 16 text nodes and 52 icon vectors.
- **R4 · Marks in the today card:** the vectors under `Estrutura do treino` (26 on page 20).
- **R5 · Sets line:** the caption in `Estrutura · cada bloco é uma série…` (16 on page 31).
- **R6 · Progression tag:** "+2,5 kg" and "sobe" in `Sobe` (10 on page 31).

On page 20 alone the dry run hits 330 nodes across 50 frames.

**Decisions for you before the retry:**
1. **R4 marks and R6 tag:** both are in the exploration's B, but not in your list. R4 could count as decoration, and you said not to touch decoration. I plan to include both unless you say otherwise.
2. **Run structure line** ("3 × 5 min", "Contínuo · 35 min"; 30 text nodes on page 31): this is the run version of the sets line. The Founder approved B for small run text too, but your list only names the sets line. Include it or not?
3. **Small sport-colored text outside the listed roles, which I'll leave as is unless told otherwise:**
   - "Totais" on page 20 (strength at 13 pt).
   - "3×" repeat labels on pages 31 and 40.
   - The "Ver Inferior de segunda" link on page 31.
   - "Tempo do bloco", "Objetivo", and the "2:36" timer on page 40.
   - "Descanso · supino reto" and "a definir" on page 41.
   - The order numbers and chart axis labels on page 50.
   - The icons in `Texto/1º`, `Texto/2º`, "Inferior · segunda", "Corpo inteiro · quinta" and "No afundo…" on page 31.

   Some of these are probably still below AA in the light mode and should go to the Founder or a follow-up.

I didn't touch the #101 or #14 exploration pages, any other node, or the #107 exploration page.

Links:
- [Exploration page](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1128-1126)
- [Leia primeiro](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1131-5106)
- [Opção B](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1128-1135)
- [Recomendação B+A](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1128-1139)

Figma session id: 02a9605f-31c2-44b4-897f-7d13f4bfe5b8.

## BRIEF 2 — #113 onboarding gaps

I promoted nothing. The required restore point couldn't be created, so I made no edits to the file.

**Why it's blocked:** the first call ran `await figma.saveVersionHistoryAsync("Antes da promoção — #113", …)`. The Figma runtime threw `figma.saveVersionHistoryAsync is not yet supported` on that line, before anything else ran. The brief and my agent definition both require the version to be saved before any edit. Without it there's no restore point for 40+ canonical frames, with two other agents editing the same file. After that I only ran read-only discovery.

- **Version id:** none, the save failed.
- **Old → new node map:** empty, nothing was created or changed. No pages, frames, components, styles or variables were touched, and the exploration page 1128:23 is intact.

**To unblock (orchestrator or Founder):** someone saves a named version in the Figma app (File → Save to version history), "Antes da promoção — #113", and puts its timestamp or id in the brief. Then relaunch me. The #107 and #114 agents will hit the same error. A single manual save covers all three only if it's taken before any of them edits; if any has already changed canonical nodes, it isn't a clean "before" point for that agent.

**Promotion plan, ready to run once a version exists.** Everything is on page "10 · Onboarding" (551:5) unless noted.

| Decision | Approved option in the exploration | Canonical target | Change |
|---|---|---|---|
| D04 A | 1128:983 | new state frame next to 835:2245 / 838:3864 | Adds the error "A prova está perto demais para montar um plano" with "Seguir sem prova por enquanto", reusing the box from 838:3864. Marathon exception kept. 835:2245 is not edited. |
| D09 A | 1129:2264 (running + strength), 1129:2327 (strength only) | two new variants next to 835:2475 | "sem data de prova" plus the contextual sentence; the strength-only variant says "A corrida pode entrar depois…". No new screens in the flow. |
| D19 A | 1129:3579 | new half-marathon/marathon state next to 836:2994 | Picker gains an "h" column (h:min:s) for half marathon and marathon only. 5 km/10 km stay on the canonical 836:2994. |
| D21 A | 1129:5900 | the 42 canonical frames named 02–29 (starting with 835:2114) | Adds a × button (close icon, 36 pt, same style as ‹) that opens the sheet 838:4219. The sheet and 838:3918 stay as they are. |
| D22 A | 1130:5004, 1130:5128 and text table 1130:5367 | 835:2349 (06) and 838:4148 (27b) | One short helper per option, from the text table. The 27b sentences stay labelled INTERIM under the #87 risk-mitigation plan. |
| D24 A | 1131:3626 | new frame "Hoje · retido por segurança" next to 838:3689 / 838:3756 | "Entendi" goes to Hoje · retido; "Declarar" goes to 843:1856 on page 72, which stays untouched as a destination. |
| D14 B | 1131:29350 | 836:624 | Text becomes "O plano conta com barra e anilhas, rack, banco, halteres e máquinas." |
| D18 account (B) | 1131:8330 | new labelled variant "Salvar o plano · alpha local" next to 837:1323 | 837:1323 is not edited. |
| D18 subscription (A) | 1131:9556 | new labelled variant "Assinar · build de teste" next to 851:9600 | No price and no "7 dias grátis"; I'll check its text before placing it. 851:9600 is not edited. |

**Open points for the relaunch:**
1. **D21 wiring:** none of the 121 frames on "10 · Onboarding" has a prototype link today. "Wired to 838:4219" means either the page's first prototype links or a Dev Mode note per frame. The Founder said technical details don't need a new decision, so I'll add the links plus one note unless you say otherwise.
2. **Notes on the page:** 4 frames already have Dev Mode notes. I'll update the ones on any frame I change.
3. **Possible overlap with #114:** the D24 "Hoje · retido" state is a safety state, which is #114's subject. Please confirm with that agent that it isn't also creating a Hoje-held frame, so we don't end up with two.
4. **Not something Figma can settle:** D24's condition that the hold is actually saved in CoachingHost has to be checked in the code.

Links:
- Exploration page: https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1128-23
- Canonical page: https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=551-5

## BRIEF 3 — #114 safety states

I stopped before making any edit. The promotion is blocked at its first step.

**Blocker: I can't save the version first.** `figma.saveVersionHistoryAsync("Antes da promoção — #114", …)` failed with `figma.saveVersionHistoryAsync is not yet supported` (Figma Debug UUID bfe2102e-67d7-468d-a163-e777491928b8). The rules require a saved version before any edit to a canonical page, so I didn't promote anything. I didn't touch variables, page "10 · Onboarding", or any canonical frame or component. I have no version id and no old → new node map to give you.

The other two promotion agents (#107, #113) call the same API and should hit the same error. If either of them edited canonical pages anyway, those edits have no named rollback point. Please check.

**To unblock:**
1. The Founder (or anyone with edit access) saves the version by hand in Figma: File → Save to version history, named "Antes da promoção — #114". The plugin API can't do this.
2. Relaunch me with a brief that says the version exists.

Figma's own autosave history is not a named checkpoint, and I can't get an id for it.

**What I checked, without editing, so the relaunch is quick:**
- **Exploration page:** 1128:512, https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1128-512
- **Local components to move into "02 · Componentes" (551:4):**
  - "EXP · Triagem · resposta Sim/Não" (1129:104), with variants nenhuma / nao / sim.
  - "EXP · Triagem · confirmação" (1129:117), with variants indisponivel / disponivel / confirmado.
- **A5/K27 A:** the states are 1129:131 (vazio), 1129:279 (parcial), 1129:427 (confirmado) and 1129:578 (um Sim). The history correction sheet is 1129:5189. The flow map 1129:5662 lists 7 targets: 660:1229/660:1313, 661:1215, 666:1401, 843:1751, 843:1980, 597:1542 and 683:1141.
- **Two scope questions in the flow map:**
  - The flow map has two run-report targets: planned (660:1229/660:1313) and avulsa (661:1215). Your brief names one "run report". Should the block go on both?
  - "Não posso neste dia" (597:1542) is on page "30 · Plano", which isn't in your list of pages. Should I place it there?
- **A6 A:** 1130:4185 (avaliação profissional) and 1130:4339 (urgente). Both still say "Este relato da sessão não foi salvo…". That is exactly the wording the Founder ruled out, so it has to change during promotion. My draft, labelled INTERIM: "Este relato ainda não entrou no seu plano. Os dados da sessão continuam guardados no seu histórico." The urgent variant keeps its "Urgente" label and the hold. Its clinical sentences stay CLINICAL_HUMAN_REQUIRED (#87).
- **A7 A:** 1131:1068.
- **A8 C:** 1131:1456. The "Responder à triagem" button shows only when the screening really is the next valid action.
- **A9 A:** 1131:1656, plus the three reason variants in 1131:1829.
- **A10 A:** 1131:7721. It covers only "perdido" ("O registro deste aparelho não pode ser recuperado"). The Founder asked to tell "perdido" apart from "não sincronizado", so promotion needs a second "não sincronizado" state that's written to match it. It should offer recovery only if a real mechanism exists.
- **#76 A:** 1131:7929, with no "Ajuda" button. The Founder's comment also asks for a simple support task before the commercial V1. That's for you to open, not me.
- **A14 A:** 1131:8892, the card in the session detail, based on 682:2528 on page 50.
- **Not promoted:** A11. Options B (A5 1129:4946 / 1129:5013, A6 1130:4494, A8 1131:1905, A10 1131:7776, #76 1131:7986, A14 1131:9133) and A8 option A (1131:1261) stay where they are.

The Founder's approval is comment 7228023318 on #114, recorded by `decisions.mjs`.
