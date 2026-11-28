success
All three promotion agents finished, and none of them could save a Figma version (`saveVersionHistoryAsync` is not supported). Each made a backup page as its restore point instead: 1491:5222 for #113, 1491:8262 for #114 and 1589:5314 for #107. Their final answers follow word for word.

## Brief 113 — #113 onboarding gaps

Promotion of #113 is done on the canonical page `10 · Onboarding` (551:5), but the Figma version save was not possible, so the restore point is a backup page instead. The exploration page (1128:23) is kept, and I did not touch any other page or anything #114 owns. One thing needs your attention first: D21 as briefed may clash with the Founder's condition on exit confirmation.

### D21 needs a check

The Founder approved D21 A on the condition that exit is confirmed "somente se houver perda real de dados; não adicionar confirmação redundante". As briefed, × always opens the sheet 838:4219. That sheet itself says nothing is lost ("Suas respostas ficam neste iPhone"). So in a first sign-up the sheet may be the redundant confirmation the Founder ruled out. I built it as briefed and put the condition in the sheet's Dev Mode note. Whether × should exit directly when nothing is lost is your call, or the Founder's.

### Restore point
- `figma.saveVersionHistoryAsync` failed with "not yet supported".
- Fallback: new page **`ZZ · Backup — antes da promoção #113`** (1491:5222). It holds unchanged clones of all 44 canonical frames I changed, each named `<original name> · backup de <node id>`. https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-5222
- No variables were changed, so there are no old values to record. Figma's automatic version history is still the full restore.

### What was done per decision
- **D04 A:** new frame "04 Data da prova · menos de 7 dias até a prova", copied from 1128:983. Its Dev Mode note has the engine rule, the marathon exception (838:1568, no block) and says the min/max dates come from the engine or host.
- **D09 A:** two new 08 respiro variants with no race (corrida e força; só força), placed right next to 835:2475. Their notes cover the "só corrida" and "Começar a correr" states and that no new screen is added to the flow.
- **D19 A:** new frame "23 Resultado recente · meia maratona em h:min:s". The note says 5 km and 10 km stay min:s.
- **D21 A:**
  - Each of the 45 frames got a × button, built from a copy of the canonical back-button (‹) style with the icon swapped to `Ícone/fechar` (507:149). It replaces the empty 36 pt "Respiro" slot on the right of the top bar.
  - The 45 frames are 40 existing canonical frames numbered 02–29 (main flow, other-answer variants, and the states 838:3616, 838:3819, 838:3864) plus the 5 new frames from D04, D09, D19 and D22. That is why the count is 45, not 42.
  - Prototype links: × → 838:4219. In the sheet, "Continuar respondendo" → back, and "Sair e continuar depois" → 838:3918 (Retomar o cadastro).
  - One Dev Mode note on 838:4219.
  - No frame changed size.
- **D22 A:**
  - Per-option texts from table 1130:5367 added as Dev Mode notes on 835:2349 (06) and 838:4148 (27b). Every 27b sentence is labelled INTERIM · CLINICAL_HUMAN_REQUIRED, with the #87 mitigation and no claim of human validation.
  - The 06 note flags an engine check by the sports-science reviewer (SSCTR), as the exploration notes required.
  - The two example frames (06 Hipertrofia, 27b lesão) were added.
- **D24 A:**
  - New frame "Onboarding / Hoje · retido por segurança".
  - "Entendi" in 838:3689 and 838:3756 now links to it.
  - "Declarar" is untouched. Its target, 843:1856, is on another page, so it can't be a prototype link; it is written into the Dev Mode notes on 838:3689, 838:3756 and the new frame.
  - The notes say persistence in CoachingHost must be confirmed before implementation.
- **D14 B:** 836:624 now reads "O plano conta com barra e anilhas, rack, banco, halteres e máquinas." The note now runs to two lines, so I shortened the spacer from 370 to 352 (the same value as the approved option B) to keep the frame at 852 px.
- **D18 conta B:** added "32 Salvar o plano · alpha local". 837:1323 is untouched.
- **D18 assinatura A:** added "33 Assinar · build de teste". 851:9600 is untouched. No price or "7 dias grátis" is visible. I also deleted hidden layers in this new copy that held made-up prices and offer lines ("R$ 16,66", "72%", "31 out · primeira cobrança", "Restaurar compras").

### Old → new node map
| Decision | Exploration (old) | Canonical (new) | Position on 551:5 |
|---|---|---|---|
| D04 A | 1128:983 | [1491:8266](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8266) | 6149, 15000 |
| D09 A | 1129:2264 | [1491:8326](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8326) | 3784, 0 |
| D09 A | 1129:2327 | [1491:8385](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8385) | 4257, 0 |
| D19 A | 1129:3579 | [1491:8444](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8444) | 6622, 12000 |
| D22 A | 1130:5004 | [1491:8511](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8511) | 7095, 12000 |
| D22 A | 1130:5128 | [1491:8556](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8556) | 6622, 15000 |
| D24 A | 1131:3626 | [1491:8646](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8646) | 7095, 15000 |
| D18 conta B | 1131:8330 | [1491:8743](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8743) | 2838, 9000 |
| D18 assinatura A | 1131:9556 | [1491:8865](https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-8865) | 3311, 9000 |
| D21 A | 1129:5995 (× pattern) | × buttons 1491:9025 … 1491:9333 (45, step 7) | top bar of each frame |
| D14 B | 1131:29377 | text edited in place: 867:2288 (in 836:624) | in place |

The 44 changed canonical frames keep their node IDs; each backup is listed on the backup page under its original ID.

### Not done, and why
1. **Motion frames were not updated**, because they were outside the brief. Specifically:
   - The Motion rows have no × button.
   - Motion 868:5608 still says "barra,".
   - No Motion versions exist for the new 08 and 23 frames (the exploration notes name 851:11009 and 851:13441 as needing them).
2. **Not adjacent:** 04, 23, 06, 27b and the held Hoje frame could not sit directly beside their originals without moving canonical frames. I put them at the end of the matching row instead.
3. **The screen drawn behind each sheet has no ×.** This affects 838:4219, 838:4148, 1491:8556 and 1491:8743; I left those as they were.
4. **Parts of the D22 text table were not promoted**, because the brief limits D22 to 06 and 27b. Those are the 31 Plano pronto titles and the optional note for "Só peso do corpo". The 27b sentence for pregnancy or recent birth (item 7) is still open.
5. **D18 extras the exploration mentioned were not applied:** the "Já tenho conta · indisponível nesta versão" link in 01 Abertura, and the same treatment for 826:2197 and 826:2295 on page 80.
6. **D24 still has gaps:** CoachingHost persistence is unconfirmed, and the Plano tab in the held state has no design.

## Brief 114 — #114 safety states

The #114 promotion is finished. All the approved options are now on the canonical pages, and no existing canonical frame, component, style or variable was modified.

### Restore point
- **Version save:** `figma.saveVersionHistoryAsync` failed with "not yet supported", so there is no version id. Figma's automatic version history is still the full restore.
- **Fallback page:** I created "ZZ · Backup — antes da promoção #114" (1491:8262) before any edit. It holds a note (1491:8263) that records the state before the promotion, how to undo it, and every node added.
- **Why it has no clones:** the promotion only added frames next to the canonical ones and moved two component sets out of the exploration page. No canonical frame was edited, so there was nothing to clone, and no variable changed, so there are no old values to record.

### What was done per decision
- **Screening components:** 1129:104 and 1129:117 are now in "02 · Componentes", inside a new board "Componentes · triagem de elegibilidade" (1491:9017, placed next to 901:1359). They are renamed "Triagem · resposta Sim/Não" and "Triagem · confirmação", with descriptions covering states, data contract and INTERIM.
- **A5/K27 A:** the screening block now sits at the end of every report target, as new frames to the right of each row, each with a row label and a Dev Mode note.
  - On page 40, the four states (nothing answered, 4 of 6, six "Não" confirmed, one "Sim") are shown once.
  - The other targets show the starting state: nothing answered and the main button disabled.
  - The notes on 660:1313 and the one-off run say there is only one screening when "algo incomum" opens Não estou 100%.
- **A6 A (with the Founder's adjustment):** the copy is now "Este relato ainda não entrou no seu plano. Os dados da sessão continuam guardados no seu histórico." in both variants. The urgent variant keeps "Urgente" and the hold. Both frames are marked `[INTERIM · #87]`.
- **A7 A, A8 C, A9 A plus reasons:** all on page 20. The A8 note says "Responder à triagem" appears only when the screening is really the next valid action, and never when another hold applies.
- **A10 A:** the body is now "O registro guardado neste aparelho foi perdido e não pode ser recuperado. Nesta versão não existe cópia em outro lugar. Um plano novo começa por um cadastro novo." (INTERIM). It has no recovery action. I did not create a "não sincronizado" state; the Dev Mode note says to design it only once account sync exists (#28).
- **#76 A:** no action and no "Ajuda" button; the note points to #118.
- **A14 A:** on page 50, next to 682:2528.

### Old → new node map
| Source | New | Page |
|---|---|---|
| 1129:104 (component set) | 1129:104, moved and renamed | 02 |
| 1129:117 (component set) | 1129:117, moved and renamed | 02 |
| (new board) | 1491:9017 | 02 |
| 1129:131 | 1499:2218 | 40 |
| 1129:279 | 1499:2357 | 40 |
| 1129:427 | 1499:2496 | 40 |
| 1129:578 | 1499:2640 | 40 |
| 660:1313 + block 1129:213 | 1499:2779 | 40 |
| 661:1215 + block 1129:213 | 1499:3237 | 40 |
| 1130:4185 (A6, professional assessment) | 1499:2922 | 40 |
| 1130:4339 (A6, urgent) | 1499:3079 | 40 |
| 666:1401 + sheet block 1129:5603 | 1499:8438 | 41 |
| 843:1751 + block | 1499:10233 | 72 |
| 843:1980 + block | 1499:10401 | 72 |
| 597:1542 + block | 1499:15327 | 30 |
| 1129:5189 (for 683:1141) | 1499:23651 | 50 |
| 1131:8892 (A14) | 1499:24205 | 50 |
| 1131:1068 (A7) | 1499:29033 | 20 |
| 1131:1456 (A8) | 1499:29277 | 20 |
| 1131:1656 (A9) | 1499:29526 | 20 |
| 1131:1829 (A9 reasons) | 1499:29770 | 20 |
| 1131:7721 (A10) | 1499:32904 | 81 |
| 1131:7929 (#76) | 1499:32949 | 81 |

- **Row labels:** 1499:2216, 1499:2217, 1499:8626, 1499:10400, 1499:10597, 1499:15483, 1499:24481, 1499:24482, 1499:29801, 1499:32991.
- **Variables:** none changed.
- **Checks:** none of the new frames overlaps an existing one on its page, and I took a screenshot of each type of change.
- **Links:** to open any node, use `https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=<id>` with `:` replaced by `-`.
  - Exploration page: https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1128-512
  - Components board: https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1491-9017

### Not done, and points for you
- **Not done, as instructed:** A11, any option B, and the "Hoje · retido por segurança" frame (the #113 agent owns it). The exploration page is kept. Its "Componentes" frame (1129:82) is now empty because the two sets moved, but its instances still link to them.
- **A6 buttons not changed:** they were outside the brief. "Sair sem salvar" may still suggest data loss, which works against the Founder's adjustment. The urgent variant also still shows "Salvar registro". Both may need a Founder or #87 decision.
- **72 screens:** the six-question screening now sits below the existing 13/15 warning-sign lists, as the approved flow map says. That may conflict with the Founder's "evitar repetição"; worth an SSCTR or Founder look.
- **Button labels:** the flow map's names differ from the canonical buttons, which I kept: "Continuar" on 660:1313, "Aceitar mudança" on 597:1542.
- **Correction sheet (1499:23651):** it keeps the exploration's confirmed state with the save button enabled. The other new targets show the starting state.
- **Text style:** the flow map's own wording is the source; A10's new copy reuses the existing text node's style.

## Brief 107 — #107 contrast tokens

I've promoted #107 (the B+A combination) into the canonical Figma file. I couldn't create a named version, because `saveVersionHistoryAsync` is not supported in this runtime. The restore point is a backup page plus the old variable values below, and Figma's automatic version history still holds the full previous state.

### Restore point
- **Backup page:** `ZZ · Backup — antes da promoção #107` (1589:5314). It holds untouched clones of all 240 frames I changed, each named `<original name> · backup de <node id>`, one row per source page.
- **Old variable values** (collection "Repmile · Cor", mode "A · Claro" 507:3; the other three modes are untouched):

| Variable | Old (exact rgba) | Old → new |
|---|---|---|
| estado/negativo `VariableID:543:1291` | r 0.81960785 g 0.18431373 b 0.21176471 a 1 | #D12F36 → #B90921 |
| estado/negativo-suave `VariableID:543:1292` | r 0.81960785 g 0.18431373 b 0.21176471 a 0.11999999731779099 | #D12F36 @0.12 → #B90921 @0.12 (alpha kept) |
| texto/terciario `VariableID:507:11` | r 0.41960785 g 0.43921569 b 0.47843137 a 1 | #6B707A → #656A73 |
| zona/4 `VariableID:531:1214` | r 0.78823531 g 0.54117650 b 0.03921569 a 1 | #C98A0A → #B37A04 |

After the change, the exploration's ratios apply: urgent banner label 4.93, texto/terciario 4.56 and 4.94, zona/4 bar 3.68 / 3.35 / 3.09. I took these from the exploration table and did not recompute them.

### Rebinding to texto/secundario
634 text nodes and 70 icon paints now use texto/secundario (`VariableID:507:10`). I changed only the sport-coloured segments and the bindings, so node ids, layers and names are unchanged. Every old binding was corrida (`507:12`) or forca (`507:17`). This change applies in both modes, as option B intended. Ratios are light → after (dark → after), measured on the real composited background:

| Rule | What | Light | Dark |
|---|---|---|---|
| R1 chips | strength chips | 2.88 → 6.49 | 5.59 → 6.70 |
| R1 chips | run chips | 4.14 → 6.36 | 4.92 → 6.74 |
| R2 planned minutes | strength | 3.15 → 7.10 | 5.05 → 6.05 |
| R2 planned minutes | run | 4.52 → 6.95 | 4.43 → 6.07 |
| R3 today-card label | strength label and icon fill | 2.67 → 6.02 | 4.51 → 5.40 |
| R3 today-card label | run label and icon stroke | 3.83 → 5.89 | 3.95 → 5.41 |
| R5 sets line | | 3.32 → 7.48 | 6.80 → 8.16 |
| R6 "+2,5 kg" / "sobe" | | 2.88 → 6.49 | 5.59 → 6.70 |
| Run structure line | | 4.87 → 7.48 | 5.96 → 8.16 |

The run structure line already passed in light; I included it because you directed it.

**Other small text included** (all under large-text size and failing 4.5 in light):

| Item | Light → after |
|---|---|
| Totais "Força N min" | 3.66 → 8.23 |
| "Ver Inferior de segunda" link (31, 83) | 3.66 → 8.23 |
| "3×" (31, 40, 83) | 4.14 → 6.36 |
| "Descanso · supino reto" | 3.32 → 7.48 |
| "a definir" | 3.32 → 7.48 |
| Order numbers (50) | 4.14 → 6.36 |
| Progresso legend "Força N% · Nh" | 3.66 → 8.23 |
| Axis label "Força relativa…" | 3.32 → 7.48 |
| "Força N%" readings (70, 80) | 3.66 → 8.23 |

**Old → new binding map.** Each listed id keeps its id; its fill moves from corrida/forca to texto/secundario.
- **Page 20:**
  - R2 (254 nodes): 508:127/128/130/131, 544:1848/1849/1851/1852, 572:278–282, 507–511, 746–753, 978–988, 1223–1230, 1454–1461, 575:776–780, 1031–1038, 1266–1270, 1515–1519, 1781–1785, 2001–2008, 2213/2214, 2226–2233, 576:1361/1362, 1601/1602, 1814/1815, 2195–2205, 2428–2438, 2647/2648, 2654/2655, 2843/2844, 3044–3048, 581:2206–2210, 2655–2659, 3080–3084, 3543–3550, 3974–3984, 4407–4414, 4840–4847, 582:2793–2797, 3249–3256, 3682–3686, 4162–4166, 4606–4610, 5021–5028, 5457–5473, 7238/7239, 7645/7646, 8022/8023, 8661–8671, 9090–9100, 9841/9842, 9846/9847, 10188/10189, 10526–10530, 11332–11336, 880:4307–4311, 4467–4471, 4891–4895, 5051–5055, 1499:29088–29095, 29332–29339, 29581–29588.
  - R3 text: 572:291, 575:790, 1528, 1794, 2242, 576:2456, 581:2664, 582:2803, 4171, 4615, 5478, 9108, 880:4316, 4476, 4900, 5060.
  - R3 icons (instance overrides): run icons (strokes, sublayers ;507:57–59) on I572:286, I575:785, I575:1523, I575:1789, I575:2237, I581:2663, I582:2802, I582:4170, I582:4614, I582:5477, I880:4315, I880:4475, I880:4899, I880:5059; strength icons (fills, ;507:63–67) on I576:2449, I582:9107.
  - Other: 576:2159, 582:8636.
- **Page 31:**
  - R1: 510:243, 643:86, 358, 629, 929, 1196, 1432, 644:290, 588, 886, 1138, 1394, 1574, 1841, 645:823, 1139, 1423, 1700, 647:5569, 6255, 6950, 7590, 8132, 8530, 9514, 10194, 652:1548, 2225, 2764, 3298, 3964, 4624, 5131, 5519, 6207, 6766.
  - Run line: 510:271, 280, 643:125, 396, 667, 675, 974, 1237, 1244, 1463, 645:861, 869, 1177, 1462, 652:1586, 1594, 2264, 2802, 3336, 3344, 4009, 4665, 4672, 5162, 5567, 5575, 6255, 6815.
  - R5: 644:332, 630, 921, 1184, 1415, 1617, 1886, 645:1742, 647:5611, 6297, 6985, 7630, 8153, 8572, 9555, 10234.
  - R6: 644:350, 397, 717, 645:1760, 1807, 647:5629, 5676, 6384, 8590, 8637.
  - Other: 651:1552, 1796, 1920, 2022, 2194, 510:397, 645:1002, 652:1631, 1757, 3381, 4068, 4708, 5612, 5732.
- **Page 40:**
  - R1: 661:867, 1320, 1380, 1468, 662:7289, 8036, 8153, 8265.
  - R2: 660:1072/1073/1075/1076, 662:6365/6366/6368/6369.
  - Other: 660:572, 730, 862, 662:1062, 1261, 1426.
- **Page 41:**
  - R1: 511:493, 665:280, 609, 781, 855, 1102, 666:355, 530, 700, 861, 1424, 668:821, 913, 1003, 1138, 669:1306, 1562, 1870, 2441, 2697, 2835, 3024, 3214, 3414, 3596, 5539, 5845, 5988, 6181, 6330, 1499:8461.
  - Other: 665:458, 524, 1016, 668:738, 745, 752, 669:2057, 2187, 2293, 5740, 5747, 5754.
- **Page 50:**
  - R1: 531:1660, 1250, 530:1161, 544:1359, 682:367, 934, 1494, 2558, 683:752, 1172, 1585, 1995, 2123, 2390, 684:1251, 1690, 2212, 2738, 2971, 3354, 3705, 4093, 4424, 4686, 4928, 688:3704, 691:3949, 4557, 5382, 5876, 6495, 6936, 7373, 7984, 8546, 9102, 10208, 10581, 10749, 11130, 12613, 13165, 13824, 14536, 14839, 15353, 15738, 16121, 16547, 16951, 17190, 21314, 880:19795, 20197, 20745, 21043, 21519, 21827, 945:14812, 14957, 1499:23682, 24234.
  - Other (order numbers): 531:1711/1722/1733, 1301/1312/1323, 530:1212/1223/1234, 544:1410/1421/1432, 682:1545/1556, 683:803/814/825, 1223/1234/1245, 1636/1647/1658, 691:4000/4011/4022, 4608/4619/4630, 5433/5444/5455, 5927/5938/5949, 6546/6557/6568, 6987/6998/7009, 7426/7437/7448, 9153/9164, 880:19846/19857/19868, 20248/20259/20270, 1499:23733/23744/23755.
- **Page 60, other:** 512:399, 520:1127, 728:328, 953, 1348, 731:2480, 2859, 732:1408, 1507, 2619, 4021, 4468, 733:9761, 10677, 880:9551, 9926, 10807, 11182.
- **Page 70, other:** 512:1053, 751:515, 842:8025, 8454.
- **Page 80:**
  - R2: 825:4638/4639/4641/4642, 846:13118/13119/13121/13122.
  - Other: 825:4196, 846:12374.
- **Page 83:**
  - R2: 887:52/53/55/56, 294/295/297/298, 787/788/790/791, 1016/1017/1019/1020, 889:539/540/542/543, 741/742/744/745.
  - R3 text: 887:61, 303, 796, 1025, 889:548, 750.
  - R3 icons: I887:60, I887:302, I887:795, I887:1024, I889:547, I889:749 (sublayers ;507:57–59).
  - R1: 887:1475, 1816.
  - Run line: 887:1513, 1521, 1854, 1862.
  - Other: 887:1558, 1684, 1899, 2025, 892:1852, 1951, 2553, 2652.

**Frame → backup map (old → clone):** the full 240 pairs were returned by the promotion calls. They are also findable by name on 1589:5314, since each clone ends in `backup de <id>`. Examples:
- 576:2363 → 1590:7751
- 644:247 → 1590:27108
- 1499:29033 → 1590:18473
- 1499:29277 → 1590:18633
- 1499:29526 → 1590:18793
- 1499:8438 → 1590:53448
- 1499:23651 → 1590:82576
- 1499:24205 → 1590:83008

**#113/#114 frames.** These were changed: 1499:29033, 1499:29277, 1499:29526 (planned minutes), 1499:8438 (chip), 1499:23651 and 1499:24205 (chips and order numbers). The rest had no sport-coloured text, so only the variable change reaches them: all #113 frames and × buttons on page 10, 1499:29770, the eight #114 frames on page 40, 1499:10233, 10401, 15327, 32904, 32949 and the components board 1491:9017.

### Excluded, with light ratio
- **R4 marks, per your brief:** day, week and block marks (3.32 / 3.66), today-card structure marks (2.36), and the "Marca · …" frames on 02 and 10.
- **Icons beside text** (not text, label now carries the meaning):
  - Chip icons stay orange at 2.88, which is below the 3:1 non-text minimum.
  - Icons on fundo/app 3.32 and on elevado 3.66.
  - "Iniciar treino de força" tile icon 3.15.
- **Passing text, left alone:**
  - Totais "Corrida N min" 5.36.
  - "Tempo do bloco" and "Objetivo" 4.87 (pages 40, 71, 83).
  - Running chart axis labels on page 50 (104 nodes) 4.87.
  - "VO₂ máx" 4.87.
  - Running legend/readings ("Corrida N%", "Leve/Limiar/Longão N%") 5.36.
- **Large titles, buttons, fills, borders:** no sport-coloured text at large-text size exists on canonical pages; acao/* buttons and all fills and borders are untouched.

### Not done, and why
1. **"2:36" timer in the Dynamic Island** (510:603, 662:6140; 15 pt semibold on black): it fails at 3.92, but texto/secundario on black would be worse at 2.55, so I left it. Fixing it needs another approach, for example pinning the island to the dark mode (6.44). That needs a decision.
2. **"· Z4" text** in zona/4 (544:1507): still fails as text even with the new value (3.68). This was an open item in the exploration and is outside the brief.
3. **Not scanned or touched:** pages 00, 01, 03–05 (brand, landing, Instagram) and ZZ · Legado. Exploration pages and the #113/#114 backup pages are untouched; the exploration page 1128:1126 is kept.
4. **Dev Mode annotations:** I did not check or update them on the changed frames.
5. **Visual check for your reviewer:** some rows now mix colours. "Corrida N min" / "Corrida N%" stay blue next to grey "Força N min" / "Força N%" in Totais, Partes and Leitura. That is the literal result of the 4.5 rule; the Founder's "no monochrome / no regression" criterion is worth a check by the visual reviewer.
6. **Visual verification:** I only looked at one chip row and one exercise row on page 31, rendered without the frame background (in dark), and they looked as intended. I did not screenshot the screens in light mode.

Not done here: the SwiftUI `PaletteTokens.swift` update, screenshots and tests.

Links:
- Backup page: https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1589-5314
- Exploration: https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1128-1126
- Recommendation frame: https://www.figma.com/design/90oyvXHxxBQAvr1netov7S/?node-id=1128-1139
