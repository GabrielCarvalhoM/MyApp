# UI review: Growth Layer Figma delta (GLF-20261029)

| Field | Value |
|---|---|
| Artifact | Figma `TYR10AIrquCpKvKL3eyXyO`, state as of 2026-10-29 ~11:30–11:55: page 9 `571:551`; page 5 `584:2214`, SH-01–07, gallery `585:2457`, ST-06–08; page 1 CC-01, HI-01, HI-03, PR-01, HJ-15; page 3 CC-02; page 6 CF-01, RF-01–03; page 11 index `592:1624` and the "before" clones |
| Contract | `FOUNDER_REQUEST.md` §2, §3, §10; `RECORD.md` §4 frame map |
| Evaluator / mode | `ui-experience-designer` 1.2.0, a separate instance from the author (Opus 5.5, max effort), **independent**, one round. Read-only. |
| Rubric | `agent-system/evals/UI.md` 1.0.0 (verify-ui) |
| Method | `get_screenshot` of every listed node. Read-only `use_figma` to read layers, variant props, constraints and reactions, and to compute contrast with variables resolved per node (`resolveForConsumer`) and layered backgrounds. Pixel sampling of the renders for text over photo. A few inline `node.screenshot` renders at 3–4×. Nothing was created, changed or deleted. Other judges' reviews were not read. |

## Verdict: **NOT_UI_READY**

Two MUST findings: **UI-01** (text over photo is not readable in the Foto format) and **UI-02** (the map loading and failure states show a finished map, and their disabled button still opens the share sheet). The rest of the delta is coherent and implementable.

- **Fits the file.** It follows the IDV-1 type roles (Sofia for titles and numbers, Inter for reading), dark-first surfaces and bound tokens. It reuses existing components: Aviso, Botão, Segmentos, Pílula de seleção, Chip de esporte, Marca · Vilumo and Luz de esporte. Selection is green with a check, and HJ-15 uses white dashes. There is no new visual direction.
- **Share artifacts.** They read as one family. Every block has the same anatomy. The two-dash signature is discreet and recognisable, and stays inside the Stories safe area (signature at 512–528, blocks start at 142 or later). The 4:5 framings are balanced. Map and Rota look good and on brand. The protected ends read as natural, not alarming (polish fix in UI-04).
- **Composer and protection.** The format strip is clear: icons and labels, the green check, and unavailable formats dimmed with the reason in an Aviso. The "Início e fim protegidos · 200 m · Editar" chip is discreet. The protection sheet is calm and clear, with a private trace, the existing selection pill and "Compartilhar sem rota". The shape warning informs without alarm. Button hierarchy is consistent.
- **In-app deltas.** The HI-01 card, HI-03 share and milestone line, PR-01 "4 seguidas" tag (neutral, not gamified), HJ-15 state, CF-01 row and RF-01–03 all follow existing patterns and stay low-density. The copy avoids streak pressure.
- **Contrast.** All new in-app text measures ≥ 4.84:1 except UI-10. This excludes disabled controls, which AA exempts, and the scaled artifact previews. Baseline failures outside this delta (tab bar labels 4.37:1; "Plano/Aprendizado" and "VFC/Sono/Repouso" 4.40:1) are not counted here.

## Criteria

| Criterion | Result | Evidence |
|---|---|---|
| Structural fidelity, no new direction | PASS | Same tabs and surfaces; the deltas sit in place; tokens and components reused (see above) |
| Perceptual hierarchy | PASS, with SHOULD items | UI-06, UI-09 |
| Design system | PASS, with SHOULD items | UI-05, UI-11 |
| States and interaction | **FAIL** | UI-02. ST-06 and RF-03 are good. |
| Accessibility | **FAIL** | UI-01; also UI-03, UI-08, UI-10 |
| Adaptation | Not certified | Only 393-pt frames exist. UI-12 is computed for a 375-pt screen. Larger Dynamic Type sizes are not drawn. |
| Motion | N/A | This delta specifies no motion |
| Variant choice | N/A | This is a delta on an approved direction, so competing variants were not required |

## MUST

**UI-01 · MUST: in the Foto format, the chip, date, labels and title sit on the raw photo.**
- **Evidence.**
  - Share · Artefato Foto 9:16 `573:759`. The "Véu de leitura" (reading veil) has alpha 0 from 0 to 288 px, then 0.82 at 493 px. The Bloco starts at 276 px. So the chip and date (276–304) and the title (314–340) get alpha 0–0.16.
  - Foto 4:5 `573:1041`: the veil is at alpha 0 down to 180 px, and the Bloco starts at 178.
  - The veil is fixed, but the Bloco grows upward (Força is 253 px tall, Dia duplo 338). Taller contexts therefore put more text on the raw photo.
- **Contrast on the file's own renders** (backgrounds pixel-sampled):

  | Text | Where | Ratio |
  |---|---|---|
  | "Qua, 14 out" (#a6acb5, 12 px) | Foto 9:16, on the sky | 2.1:1 |
  | "Qua, 14 out" | Foto 9:16, where it meets the sun | 1.2:1 |
  | "Duração/Séries" (#80868f, 12 px) | gallery "Foto 4:5 com força" | 1.8:1 |
  | "Seg, 19 out" | gallery "Foto 4:5 com força" | 2.6:1 |
  | "Exercícios" | same, sits entirely on the sun | ≈1.1:1 |
  | "13 dez" | gallery Prova | 2.3:1 |
  | Chip label on its 16 % tint | Foto 9:16 | ≈4.3:1 |

  In the gallery Prova artifact, the hero "1:39:12" also overlaps the sun. The SH-05 preview `580:1325` shows the same problem. Real bright photos (sky, white walls, gym light) will be worse.
- **Fix.**
  - Attach the scrim to the block, not the frame. Start it ≥ 64 px above the Bloco's top and reach ≥ 0.7 alpha by the chip row. A local gradient behind the Bloco that grows with it also works.
  - In Foto, draw secondary text (date, labels, unit) in texto/primário at ~85 % instead of secundário/terciário, and give the chip a denser fill.
  - Test against a bright photo, for example a pale sky (#CFE0F0) and a white wall. Targets: ≥ 4.5:1 for 12–13 px text, ≥ 3:1 for the title and hero number.
  - Update SH-05 and the gallery's Foto 9:16, Foto 4:5 Força and Prova.

**UI-02 · MUST: ST-07 and ST-08 previews contradict their state, and the disabled button still shares.**
- **Evidence.**
  - In both ST-07 `583:2579` (loading) and ST-08 `583:2776` (failed), the preview frame "Prévia exata (= arquivo exportado)" holds Share · Mapa **Estado=Pronto**, a fully drawn map. Meanwhile the notice says "Carregando o mapa…" or "Não deu para carregar o mapa". This breaks the "preview = exported file" rule (DR-133, Founder §3).
  - The Carregando variants (`571:621`, `574:1368`) are not used anywhere, and there is no failed variant.
  - "Compartilhar…" is a regular Neutro button at 35 % opacity that keeps NAVIGATE → `174:4305` (ST-01, the iPhone share sheet) in both states. So the failure prototype reaches the share sheet right below "Nada foi compartilhado." This is the same "error state links to success" defect seen in earlier rounds.
  - "Usar Rota" has no link.
  - The status notice sits below the chip and the shape warning, near the fold, while the preview above looks finished.
- **Fix.**
  - ST-07: switch the nested Share · Mapa to Carregando.
  - Add `Estado=Falhou`: the route on the plain Rota background, with a small "Mapa indisponível" label in the preview that is never exported. Use it in ST-08.
  - Remove the reactions from the disabled buttons, or use a disabled variant.
  - Link "Usar Rota" → SH-04 `580:1089`.
  - Put the status notice directly under the preview, above the protection chip.

## SHOULD

**UI-03 · Sobreposição has no legibility protection.**
- **Evidence.** `573:809` and `573:1091` have no veil or shadow. Labels use texto/terciário and the date and unit use texto/secundário. Even over the composer checkerboard (SH-06 `580:1568`), "Tempo/Ritmo médio" measure 3.76:1. On mid-tone or bright photos the grey labels and the white wordmark disappear.
- **Fix.** Make all overlay text white (or 90 %) and bake a soft shadow into the PNG (≈ 0 1 8 #000 at 35 %). Optionally add a `Tom` (Claro/Escuro) property, like Share · Traçado has.

**UI-04 · Bright "beads" where the faded route ends join the path.**
- **Evidence.** Share · Traçado `571:558` and all its variants. The main path's 13-px glow (round cap, #3b8fea at 0.22) overlaps the round cap of each fade segment's glow (gradient 0.22 → 0). The doubled alpha makes a visible bright dot exactly at the protection boundary (4× render of `571:558`; 3× render of SH-04 preview `580:1100`). The fade lasts only 17–18 px, so the ends look like a cut brush stroke with a knot rather than a taper.
- **Fix.** Use butt caps at the joins, or one path with an alpha mask. Fade both the core and the glow over ≥ 30 px. Bind the strokes to esporte/corrida (texto/primário for Branco); they are currently hard-coded.

**UI-05 · The check badge collides with the icon on wide format tiles.**
- **Evidence.** Formato de share, Selecionado variant `575:1082`. "Selecionado · check" is absolutely positioned with MIN/MIN constraints at x 46. In SH-07 `580:1934` the tiles are 116 px wide, so the badge sits on the "Dados" icon (tile `580:1943`). The variants also differ in size (Padrão 66×68, Selecionado 66×69, Indisponível 66×66), which makes the gaps uneven in ST-06.
- **Fix.** Pin the badge top-right with a fixed inset. Make all variants the same size, using inside strokes.

**UI-06 · Post-workout highlight: the fact is buried in prose, and the copy talks about itself.**
- **Evidence.** Destaque do treino `575:1109` and `575:1133` (used in CC-01 `586:3830` and CC-02 `588:1389`).
  - The record or comparison is a three-line sentence with no visual anchor. The system already has the "antes → agora" pattern (Linha de evolução, Bloco Evolução), and the share artifact makes the same fact its hero.
  - The criterion line ends with "Compara fatos; não diz por quê.", and the HI-01 card `586:3849` ends with "Mostra o que mudou, não por quê." These read like an internal disclaimer.
  - "Destaque" is a generic title for a record.
- **Fix.**
  - Lead with a value line in Sofia ("112,5 → 115 kg × 5" / "4:19 → 4:14 /km").
  - Add one secondary line with the criterion and the date ("Mesma estrutura e recuperação · último em 23 set").
  - Drop the meta clauses; the criterion already carries the honesty.
  - Title the Recorde variant "Recorde".

**UI-07 · PR-01 consistency grid shows the current week as "Não feito", and the dashed glyph means two things on one screen.**
- **Evidence.** PR-01 `22:2`, Consistência card.
  - Column 12 ("hoje", week 9 in progress) shows 3 "Feito" and 1 dashed "Não feito". The scenario has only two sessions so far (HI-01: Seg 19, Ter 20) and nothing missed.
  - The chart right below, "Tempo de treino por semana", uses the same dashed outline for "Planejado".
  - This was there before the delta, but this delta reworked the card, and §5 forbids treating untrained days as failure.
- **Fix.** Show the current week as done plus upcoming, with a distinct glyph for upcoming (for example a solid 1-px outline at 40 %) and "Por vir" in the legend. Or leave the in-progress week out. Use the dashed glyph for one meaning per screen.

**UI-08 · The Força share marks the record by colour only.**
- **Evidence.** Share · Bloco Força `572:602` and the gallery: "4 × 5 · 115 kg" is orange (gallery caption: "recorde do dia destacado") with no icon or label. Viewers cannot decode it, and the record claim is only implied.
- **Fix.** Add the trophy glyph or a small "recorde" label next to the set, as Bloco Recorde does, or keep the set neutral.

**UI-09 · Artifacts without a photo, map or route leave a large empty area.**
- **Evidence.** Gallery `585:2457` row 2 and the SH-07 preview. The 9:16 Dados versions of Força, Recorde, Marco, Semana and Evolução anchor the block to the bottom safe line, leaving the top 35–45 % as empty glow. Recorde, the most shareable moment, is the emptiest.
- **Fix.** For formats with no media, centre the block within 56–528 (the signature can stay anchored) or enlarge the hero number to use the space. Keep bottom anchoring for Mapa, Rota and Foto. This is a polish recommendation within UI authority, not a Founder escalation.

**UI-10 · One WCAG AA contrast failure and touch targets under 44 pt in new UI.**
- **Contrast.** In the SH-03 sheet `581:1562`, "Início · oculto" and "Fim · oculto" (`582:1713`, `582:1714`) are 11 px #80868f on #1e2126 = **4.40:1**. This is the known texto/terciário on superfície/interna pair.
- **Touch targets.**
  - Proteção de rota chip `575:1100`: 361×40.
  - Distance pills: 32 px tall.
  - Aviso text actions such as "Ativar": 41×19.
  - The Destaque buttons use the system's 40-px Médio size.
- **Fix.** Use texto/secundário for those two labels (7.06:1). Make the chip 44 px tall, or annotate 44-pt hit areas for the chip, the pills and the Aviso actions in the handoff.

**UI-11 · Component properties limit reuse.**
- **Evidence.** Destaque do treino and Linha de evolução expose no TEXT properties; their copy is built into the variants (Esporte=Força literally contains "Agachamento · 5 repetições · 105 → 115 kg"). The rest of the file exposes text as Rótulo/Valor/Ajuda properties. Share · Artefato does not expose its nested Bloco.
- **Fix.** Add TEXT properties (Título, Antes, Agora, Unidade, Critério, Ação) and let the Tipo/Esporte variants switch only icon and colour. Set the Bloco instance as exposed (`isExposedInstance`) on Share · Artefato.

**UI-12 · The format strip does not fit narrower phones.**
- **Evidence.** The "Sem fundo" label is 63 px wide inside a 66-px tile, leaving ~1.5 px padding per side. On a 375-pt iPhone (343-pt content width) five tiles get ~62 px each, so the label truncates. Larger text sizes break it too.
- **Fix.** Make the strip scroll horizontally with fixed tile widths, or add a rule for a shorter or two-line label. Check at 375 pt and at larger Dynamic Type sizes.

## COULD

| ID | Finding | Fix |
|---|---|---|
| UI-13 | In 9:16 Mapa/Rota, the route glow reaches y ≈ 52 (trace frame at y 40, loop at 59, 6.5-px glow), above the 56-px safe line. The tails end ~15 px above the chip. | Scale the trace to ~0.92 or start it at y ≥ 64 |
| UI-14 | ST-06 unavailable-format labels are #42464c = 1.98:1. Disabled controls are exempt from AA, but the reason banner refers to them by name. | Raise to ~3:1 |
| UI-15 | The Linha de evolução Força subtitle wraps with a one-word last line ("… mesma / barra") in the component and in HI-01 | "5 reps · mesma barra", or a wider text column |
| UI-16 | "Compartilhar" on Destaque Comparação opens the generic run artifact, not the comparison | Label it "Compartilhar treino" until a comparison context is allowed (G03) |
| UI-17 | Marco block: grey vs white squares have no legend. Semana block: sport colours have no key. Dia duplo lacks the chip row the other contexts have. | Add micro-legends; add the chip row |
| UI-18 | "Nunca entram: … local …" appears under a real map | "nome de lugar, endereço" (wording may be Security's call) |
| UI-19 | Referral naming varies: Indicar / Convidar para o Vilumo / Indique o Vilumo / Compartilhar convite…. The RF-02 toast cuts through the footer line. CF-01 "Dados pessoais" still wraps. | Use one verb; lift the toast; shorten that value as was done for Rotina |
| UI-20 | HJ-15: "fechada · ver resumo" is all link blue, but "fechada" is a state, not an action | "Semana fechada" in secondary text plus a "Ver resumo" link |
| UI-21 | No composer state for "Post 4:5". ST-06 "Ativar" is not linked. SH-07 keeps two hidden tile instances. The Evolução chart colours (#e8662c, #ff8a52, #2a2e34) are not bound to tokens. | Add the state or link; delete the hidden tiles; bind the colours |
| UI-22 | Preview text renders at ~7 px (60 % scale), too small to check what is shared. When the chip, warning and notice stack, "Stories/Post" falls under a pinned action bar (SH-02/04 at 681–717 vs bar top 705) or below the fold (ST-07/08). | Tap-to-enlarge preview; move the ratio control next to the preview |

## Not verified

- **Prototype.** Not clicked through; reactions were read through the API instead.
- **VoiceOver and focus order.** Cannot be inspected in Figma, so not certified.
- **Other sizes.** Only 393-pt frames exist, and larger Dynamic Type sizes are not drawn.
- **Artifact scale.** Artifacts were judged at the 360×640 design size, not at 1080×1920 export resolution.
- **Sub-node colours.** Inline renders of sub-nodes can show the wrong token colours (the frame's explicit variable mode is not inherited), so colours come from full-frame renders and resolved variables.

## Next action

- **Author.** Fix UI-01 and UI-02 in the single narrow fix round allowed by `RECORD.md` §1. The SHOULD items can go in the same pass or into the reconciliation list.
- **Re-check.** A UI re-check limited to UI-01, UI-02 and any component touched by the fixes (Share · Artefato, Share · Mapa, Formato de share).

## Re-check r1 (2026-10-29, same evaluator, independent of the author, read-only)

**Scope:** UI-01 and UI-02, plus a quick look at the components the fix touched (`RECORD.md` §7). Method as before: full-frame `get_screenshot`, read-only `use_figma` for structure, variants and reactions, and pixel sampling. No Figma changes. SHOULD and COULD items from round 1 were not re-reviewed beyond this quick look.

### Verdict: **UI_READY**. No MUST findings remain.

**UI-01: resolved.**
- **Structure.** In `573:759` and `573:1041`, the veil is now the "Leitura (véu acompanha o bloco)" frame: a vertical auto-layout frame with a 90 % #0b0c0e fill that wraps the Bloco and the signature. It starts 8 px above the Bloco. Above it sits an absolute "Véu · transição" rectangle, an 88-px gradient from 0 to 0.9 pinned to the frame's top.
- **Coverage.** Every Foto instance on page 5 keeps all of its text inside the 90 % zone, and the veil's top follows the Bloco's top in each one (0 texts outside):

  | Instance | Veil top | Bloco top |
  |---|---|---|
  | SH-05 `580:1337` | 41.4 % | 42.7 % |
  | 5.0 doc `584:2372` | 40.6 % | 41.9 % |
  | Gallery Corrida `585:2610` | 41.9 % | 43.1 % |
  | Gallery Prova `585:3370` | 37.8 % | 39.1 % |
  | Gallery Força 4:5 `585:3646` | 29.6 % | 31.3 % |

- **Labels.** Share · Bloco labels now use texto/secundário (13 labels) or texto/primário (3).
- **Contrast.** Behind the date and chip row, the sampled backgrounds are #1A1515–#211C18, including over the sun. Date (#a6acb5) = 7.4–7.9:1. Worst case is a pure-white photo under the 90 % veil, giving a background ≈ #232426: secondary text ≥ 6.8:1, primary ≫ 7:1.
- **Renders.** In the gallery Prova and Foto 4:5 Força renders, "13 dez", "1:39:12" and "Exercícios" are now clearly readable.

**UI-02: resolved.**
- **ST-07 `583:2579`:** the nested Share · Mapa is `Estado=Carregando` (`571:621`): tile skeleton with the route on top.
- **ST-08 `583:2776`:** uses the new `Estado=Falhou` (`606:1130`; 4:5 `606:1143`): dimmed route on a plain background with a "Mapa indisponível" pill.
- **Disabled buttons:** they have no reactions anymore. ST-07 has no reactions at all.
- **Notice:** the status notice now comes right after the preview (order: preview, notice, protection chip, shape warning, ratio).
- **"Usar Rota":** the whole failure notice links to SH-04 `580:1089`, which also gives a large tap target.

**Touched components (quick look): fixed.**
- **UI-05:** Formato de share variants are all 66×68, and the badge is pinned MAX/MIN, so it now sits in the top-right corner in SH-07.
- **UI-10:** Proteção de rota is 361×44. The SH-03 hidden-end labels use texto/secundário (7.06:1).
- **UI-06:** Destaque do treino now leads with a value line ("112,5 → 115 kg × 5"; "6 × 600 m → 5 × 1 km"). The record variant is titled "Recorde", the meta clauses are gone, and Comparação keeps only "Ver evolução".

**New, not blocking:**
- **UI-23 · SHOULD: the footnote is now cut off by the action bar (regression from the r1 copy change).**
  - **Evidence.** "Nunca entram: … endereço ou nome de lugar …" now runs to four lines. It overlaps the action bar by 8–12 px in SH-01, SH-02, SH-04, SH-05, SH-06, ST-06, ST-07 and ST-08 (footnote bottom vs action bar top, for example SH-05 1148 vs 1140 and ST-08 1193 vs 1181). The last line ("…a cada imagem.") is visibly clipped in the renders. SH-07 is fine.
  - **Fix.** Add about 16 px of bottom padding to the content area, or move the action bar down, in those eight frames.
- **UI-24 · COULD: the failed-map pill collides with the route in 4:5.** In Share · Mapa Falhou 4:5 `606:1143`, the "Mapa indisponível" pill overlaps the top of the loop. Inset it or move it top-left in 4:5.
- **UI-25 · COULD: tall blocks leave little photo in Foto 4:5.** With a tall Bloco in Foto 4:5 (Força), the photo shows clearly only in the top ~45 px before the fade. A 0.80 veil would still keep secondary text ≥ 4.5:1 on a white photo (minimum ≈ 0.78), or the exercise list could be capped in Foto 4:5.
- **UI-26 · COULD: dangling divider in SH-07.** SH-07's options card ends with the last row's divider. Hide that divider on the last row.

**Remaining from round 1:**
- **UI-09, UI-11, UI-13, UI-17, UI-22:** deferred with an owner in `RECORD.md` §7.
- **Fixed in r1 per `RECORD.md` §7 but not re-checked here:** UI-03 and UI-07.
- **UI-04 is still open (SHOULD).** `571:558` is unchanged: round caps at the joins, a 17–18 px fade, hard-coded strokes. `RECORD.md` §7 does not list it as fixed or deferred, so it needs a deferral entry with an owner.
