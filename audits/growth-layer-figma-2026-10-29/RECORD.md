# Growth Layer — UX/Figma integration (GLF-20261029)

**What this is:** the design mission that manifests the Growth Layer (DR-124–132) and Map Share Privacy (DR-133) in the new Figma `TYR10AIrquCpKvKL3eyXyO`, as a delta on the approved experience. Source: the current direct [Founder request](FOUNDER_REQUEST.md) of 2026-10-29.

**Authorized:** Figma edits in `TYR10AIrquCpKvKL3eyXyO` only. **Not authorized:** implementation; any `product/` or `canon/` edit; applying `audits/growth-layer-2026-10-29/PENDING_CANON_SYNC.patch`; anything that touches the State Model Consumer Closure (R7ASC), its baseline, or any Adaptive Engine / Coaching Core freeze, blocker, review, readiness or the human queue.

**Authority read** (the canonical sync is held, so the decision lives in the GRW blocks of `CURRENT_MISSION.md`, the ledger and the [GRW record](../growth-layer-2026-10-29/RECORD.md), with the held patch as its intended text): DR-124–133; PA §7 allowlist and AR-15; UXS SHR-01–17, §16.1, HIS-01–04, CTN-02/09/11, HOJ §7.2 (read through DR-93–97: semantics kept, old placement not binding); DR-109 ("Rotas no app"); RS §2/§5; the designer context.

## 1. Task contract

| Field | Value |
|---|---|
| Routing | T3 / R2 / A4 (Founder-authorized design edits in one file). Execution level per unit below; no mission-wide level. |
| Owner / author | The current Claude Code instance (Opus 5.5, max), acting as Product/UX Architect and UI & Experience Designer; Chief coordination by the same instance (no extra Chief). |
| Judges (fresh, independent, Opus 5.5 max) | `product-ux-architect` (structure: navigation preserved, Growth not a destination, no redundant dashboards, Home audit); `ui-experience-designer` (visual/interaction quality, accessibility, system reuse); `security-privacy-abuse-architect` (DR-133 manifestation and the referral boundary, design level only). |
| Not routed | SSCTR — no training rule, G01–G04 left open, no prescriptive content (consistency criteria stay G03). Research — no material uncertainty to resolve. Engineering — no implementation; provider and tile policy recorded as open. |
| Review bound | One review round; at most one narrow fix round for MUST findings; anything else closes with an explicit blocker and owner. |
| STOP_WHEN | The Growth Layer is integrated in the minimal necessary surfaces of the current Figma at implementable quality, with no general redesign and no decision that belongs to the Adaptive Engine, Security or Engineering. |
| ESCALATE_IF | A surface would need a new destination/tab; a rule owned by Security/Engineering/G03 would have to be invented; any change would touch R7ASC files. |

| Unit | Level | Why |
|---|---|---|
| U1 Share system + Map Share Privacy affordances | L3 | Manifests a location-exposure trust boundary; Security checks the design, the policy is the Founder's. |
| U2 Post-workout delta | L2 | Material UI on an existing surface. |
| U3 History / Progress / consistency delta | L2 | Material UI; structure must not duplicate Progresso. |
| U4 Home audit | L2 | Structural decision on the most sensitive surface. |
| U5 Minimal referral | L2 (+ Security check) | Commercial attribution boundary (G07/G08), design only. |
| U6 Mission records | L0 | Insert-only bookkeeping. |

## 2. Status / resume

**Status:** DELIVERED FOR FOUNDER REVIEW (2026-10-29). Final independent verdicts after one review round and the single fix round (§7): Product/UX `PASS_WITH_CONDITIONS` (VISUAL_READY for this state), UI `UI_READY`, Security `SECURITY_DESIGN = PASS_WITH_CONDITIONS` (conditions C1–C9 carry into implementation; boundary re-verification before implementation stays open under DR-133). No MUST remains. Still an experience candidate: not implemented, not promoted. The review cycle is closed; later polish goes to the deferred list in §7, not to another review loop.

Concurrency note: during the build the State Model Consumer Closure froze (STATE-MODEL-CONSUMER-FREEZE-1, awaiting its own reviews). Nothing here touches it; its closing session still owns applying `PENDING_CANON_SYNC.patch`.

## 3. Plan — minimal surfaces (existing surface + small delta first)

| Area | Decision | New screen? |
|---|---|---|
| Post-workout (CC-01 run, CC-02 strength) | A reusable "Destaque do treino" card closes Workout → Result → Progress → Share inside the existing completed-session screens: record (strength) or comparison with the last comparable session (run), each with "Ver evolução" and "Compartilhar". | No |
| Share system (page 5) | Replace the DR-91 card collection with one component system: format (Mapa, Rota, Foto, Sobreposição, Dados) × proportion (Stories 9:16, post/messages 4:5), a context data block (Corrida, Força, Recorde, Marco, Semana, Evolução, Dia duplo, Prova), protected map and trace, discreet signature in the Stories safe area. Composer v2 keeps the same flow (one modal) with a format strip. | Composer states only; one protection sheet |
| Map Share Privacy | Map/Route are opt-in per artifact and off when the composer opens; start/finish protected 200 m by default, shown by a discreet chip with "Editar"; the edit sheet shows the private abstract trace (no map tiles near the hidden ends), lets the person increase protection or hide the route, and marks reducing below 200 m / turning it off as open (GRW-09). | Sheet (inside the composer) |
| History (HI-01, HI-03) | HI-01's month-totals card becomes "Desde o início do plano": two comparable facts and one consistency count, each opening its Progresso detail. HI-03 (week summary) gains share and a consistency milestone line. | No |
| Progress (PR-01) | Consistency card gains the run of complete weeks; labels marked [DEP-G03]. | No |
| Home | Existing structure kept. Only the existing week tile gets a "semana fechada" state on the first day of a new week, opening the week summary. | One state frame |
| Referral | One row in Você → one "Convidar" screen (personal link, copy, system share). No reward, wallet, ranking or view of who joined. | One screen + states |

## 4. Frame map (filled during the build)

**Design System — page 9, frame `Componentes · Growth Layer (GL-1)` `571:551`:**

| Component | Node | Variants / props |
|---|---|---|
| Ícone/mapa | `571:554` (in the Ícones frame `115:571`) | stroke 1.8, bound to texto/primário |
| Share · Traçado | set `571:575` | Tom (Corrida, Branco) × Proporção (9:16, 4:5); protected geometry, faded ends, no start/finish marker |
| Share · Mapa | set `571:694` | Estado (Pronto, Carregando) × Proporção (9:16, 4:5); label-less dark map representation + protected trace |
| Share · Bloco | set `572:813` | Contexto (Corrida, Força, Recorde, Marco, Semana, Evolução, Dia duplo, Prova); boolean `Gráfico#572:0` |
| Share · Artefato | set `573:1183` | Formato (Mapa, Rota, Foto, Sobreposição, Dados) × Proporção (9:16, 4:5); Bloco instance + `Marca · Vilumo` signature |
| Formato de share | set `575:1098` | Estado (Padrão, Selecionado, Indisponível); `Rótulo#575:0`, `Ícone#575:4` |
| Proteção de rota | `575:1100` | `Distância#575:8` |
| Destaque do treino | set `575:1155` | Tipo (Recorde, Comparação) |
| Linha de evolução | set `575:1203` | Esporte (Corrida, Força, Neutro) |

Route geometry: artifact space 360×640; 9:16 transform 0.85p + (12.55, −41.45), trace frame at (24, 40) 312×240; 4:5 transform 0.6p + (61.8, −47.2), trace frame at (24, 16) 312×160. Map art scaled with the same transform, so streets and route stay aligned.

**Screens (live frames):**

| Page | Frame | Node | Change |
|---|---|---|---|
| 1 | CC-01 · Corrida concluída — Intervalado 5 × 1 km | `21:2` | + Destaque do treino (Comparação) `586:3830`; "Ver evolução" → PR-04 |
| 1 | HI-01 · Histórico — Lista | `18:2` | month totals card → "Desde o início do plano" `586:3849` (3 Linha de evolução rows → PR-02, PR-06, PR-01) |
| 1 | HI-03 · Histórico — Resumo da semana | `166:2831` | + "Semanas" milestone row `587:3774`; + "Compartilhar semana" `587:3777` |
| 1 | PR-01 · Progresso — Geral | `22:2` | consistency card: "4 seguidas" tag `587:3786`; grid made consistent (misses in weeks 2, 5, 7); copy "8 semanas completas · 3 com um treino não feito" |
| 1 | HJ-15 · Hoje — Segunda, semana anterior fechada (NEW state) | `587:3796` | existing week tile shows the closed week → HI-03 |
| 3 | CC-02 · Força concluída — Inferior | `145:2350` | Destaque card → Destaque do treino (Recorde) `588:1389` with Compartilhar recorde / Ver evolução |
| 5 | 5.0 · Sistema de compartilhamento (NEW section) | `584:2214` | system documentation: formats, privacy pipeline, context × format, proportions/destinations, open items |
| 5 | SH-01 · Compor, padrão ao abrir (Dados) | `172:3413` | composer v2: format strip, exact preview from Share · Artefato, Stories/Post ratio, route row removed |
| 5 | SH-02 · Mapa | `580:709` | NEW state: map + protection chip + static shape warning |
| 5 | SH-03 · Proteção de início e fim (folha) | `581:1513` | NEW sheet (replaces the DR-91 confirmation SH-02): private abstract trace, increase-only placeholder values, "Compartilhar sem rota" |
| 5 | SH-04 · Rota / SH-05 · Foto / SH-06 · Sem fundo / SH-07 · Força · Recorde | `580:1089` / `580:1325` / `580:1568` / `580:1934` | NEW composer states |
| 5 | 5.2 · Galeria (NEW section) | `585:2457` | 16 artifact examples built from Share · Artefato |
| 5 | ST-06 / ST-07 / ST-08 | `583:2502` / `583:2579` / `583:2776` | NEW states: route unavailable, map loading, map failed |
| 6 | CF-01 · Você | `178:3413` | + group "Indicar" (row `590:1730` → RF-01); Rotina value shortened (wrap fix) |
| 6 | RF-01 · Convidar / RF-02 copiado / RF-03 sem conexão (NEW) | `590:1749` / `590:1856` / `590:1894` | minimal referral |
| 11 | 11 · Growth Layer — antes → depois (NEW page) | `576:251` | before clones `577:3684` (CC-01), `577:4074` (HI-01), `577:4453` (HI-03), `577:4622` (PR-01), `577:6149` (CC-02), `577:7795` (CF-01), `577:8985`/`577:9101`/`577:9233` (old SH-01..03); old sections 5.2 (cards) and 5.3 (overlays) parked there |

Removed from live pages (copies on page 11): old SH-02 (route confirmation) and SH-03 (composer with trace); old CD-01..07 and OV-01..06 frames (superseded by the system). The checkerboard support component moved to the GL frame on page 9.

## 5. Checks, reviews and open items

**Author checks (2026-10-29, read-only scans in the file):**

| Check | Result |
|---|---|
| Excluded fields in every Share · Artefato instance on page 5 (31 instances, 353 texts) and in the Bloco/Artefato sets (200 texts): FC/bpm, esforço/RPE/RIR, recuperação, VFC, sono, %, place names | 0 real hits (the regex also caught the 4:1x pace labels of the interval bars, which are allowed) |
| Stray white fills from auto-layout creation in new/changed frames (pages 1, 5, 9) | 0 after fixing "Como funciona" on RF-01..03 |
| Risky wording in changed page-1 frames (streak, "não perca", causal phrasing, prontidão/fadiga, superiority) | 0 |
| Cross-screen data consistency | plan start 24 Aug (week 9 of 16 on 21 Oct); weeks 1–8: misses in W2/W4 → "6 de 8" (HI-01), run W5–W8 → "4 seguidas" (PR-01, HI-03, Marco block); PR-01 grid recoloured to match (misses in columns 2, 5, 7 of 12) and copy "8 semanas completas · 3 com um treino não feito" matches "52 de 55 · 3 não feitos"; interval paces 4:14/4:12/4:15/4:13/4:17 now identical in CC-01 and the share system (the old CD-01 used other values) |
| Prototype | page 5: 30 links (format chips, protection chip → SH-03, Pronto/sem rota, Compartilhar → ST-01); page 1: HI-01 rows → PR-02/PR-06/PR-01, CC-01 Ver evolução → PR-04, HJ-15 tile → HI-03; page 6: CF-01 row → RF-01, Copiar → RF-02. Cross-page journeys documented on page 8. |
| Repo | only this audit folder plus insert-only blocks appended to CURRENT_MISSION.md and MISSION_LEDGER.md (prefix byte-identical); no product/, canon/, CoachingCore or queue file touched; `PENDING_CANON_SYNC.patch` not applied; no verifier run |

**Independent reviews:** dispatched 2026-10-29, one round (§1 bound). Results land in `reviews/`.

## 6. Delivery (the request's twelve deliverables)

1. **Screens changed:** CC-01, CC-02, HI-01, HI-03, PR-01, CF-01, SH-01, ST-01 (file name only), plus the share card/overlay families replaced by the system. Details and node IDs in §4; before copies on page 11.
2. **New screens/states:** SH-02, SH-03, SH-04, SH-05, SH-06, SH-07, ST-06, ST-07, ST-08, HJ-15 (state of an existing tile), RF-01, RF-02, RF-03; sections 5.0 (system) and 5.2 (gallery); page 11 (index + before).
3. **Why each new one was needed:** composer states show each format and per-context availability inside the same modal (not destinations); SH-03 is how DR-133's per-image edit is made without an alarmist modal; ST-06–08 are the honest states a real map needs (unavailable, loading, failed); HJ-15 is the only Home reflex and reuses the existing Semana tile; RF-01–03 are the minimal referral point, which has no existing surface that would not mix purposes (account, subscription).
4. **New Design System components:** Share · Artefato, Share · Bloco, Share · Mapa, Share · Traçado, Formato de share, Proteção de rota, Destaque do treino, Linha de evolução, Ícone/mapa (§4).
5. **Open dependencies (owner):** protection values incl. below 200 m or off, minimum visible route (Product/UX + Security, GRW-09); repeated-share inference and Privacy Zones (Security + Product/UX); map provider, style/labels, tile policy and what the request reveals (Engineering + Security, G07); consistency/complete-week criteria, comparability, adherence % in shares (G03 + allowlist); referral reward/terms (G10), abuse (G08), purpose/retention and whether to show how many joined (G07, Product/UX + Security); future share attribution link/code (Product/UX + Security, G07); legal/privacy copy (G07); definitive product name/domain (Founder) — link and code are placeholders.
6. **State Model–dependent assumptions:** none of the new copy carries coach semantics. Counts such as "4 seguidas", "6 de 8" and "semana completa" assume a G03 criterion; "fechada" follows CTN-11; comparisons assume a comparability rule (G03); the record follows STIL §8/HIS-03. Existing engine-facing copy ("O que isso muda no plano", "O que observamos", the race card's "No caminho") was not changed and is listed for reconciliation.
7. **No Adaptive Engine semantics invented:** no physiological state, readiness, fatigue, confidence, adaptation cause, change reason or training change appears in any new or changed surface.
8. **Crew/social:** stays out of V1 — no feed, graph, clubs, DMs, chat, ranking, events or challenges; the referral is not a Crew invite.
9. **Architecture/navigation preserved:** four tabs plus Você via the avatar; flows remain contexts of their objects.
10. **Growth is not a tab or destination:** it lives in the completion screens, History, Progress, the week summary, the Home week tile and one row in Você.
11. **Before → after:** page 11 index (`592:1624`) and before clones (`576:252`, parked 5.2/5.3).
12. **For the Final Product Reconciliation & Refinement:** apply the held canon sync (after R7ASC) and then align UXS SHR-09/11/12/14/16 and §16.1 with the system; in-app route display uses a map-like background against DR-109's abstract line (G07); History rows show tonnage (check STIL for in-app use); the race card's "No caminho" chip; Garmin/COROS/Polar rows (DR-117); cross-page prototype journeys are documented only; North Star/auxiliary metrics belong to Data/Analytics (nothing instrumented); a direct Stories shortcut would need Engineering + Security/G07.

## 7. Review round 1 and the single fix round

**Verdicts (round 1, 2026-10-29):** Product/UX `PRODUCT_UX_ARCHITECTURE_EVAL = FAIL` (narrow: PUX-01, PUX-02) · UI `NOT_UI_READY` (UI-01, UI-02) · Security `SECURITY_DESIGN = PASS_WITH_CONDITIONS` (SEC-01, SEC-02 blocking acceptance). Files in `reviews/`. Structure, navigation, scope and the Adaptive Engine boundary passed in all three.

**Fix round r1 (the one allowed by §1), MUST items:**

| Finding | Fix | Nodes |
|---|---|---|
| PUX-01 | CC-01 now uses PR-04's interval series (reps 4:10/4:08/4:09/4:09/4:07, band 4:06–4:14, 3 s spread; dots moved). The comparison cites a session that exists, with PR-04's notion of comparability: "Comparado ao último intervalado · 6 × 600 m → 5 × 1 km · ritmo médio parecido (4:10 → 4:09 /km)". PR-04 marks the compared pair in blue with a caption. Share · Bloco Corrida bars use the same paces. | CC-01 `21:2` (`586:3830`, rows `21:156`…), PR-04 `169:3255`, `572:563` |
| PUX-02 + UI-07 | PR-01 grid starts at S1 (24 ago, 9 columns); three states Feito / Não feito (dim fill) / Por vir (outline) — the dashed glyph now means only "Planejado" in the chart below; current week 2 done + pending; copy "6 de 8 semanas completas · 2 com um treino não feito · semana 9 em andamento"; hero "Treinos do plano 54 de 56 · 2 não feitos"; rules note (honored rest/reduction/HOLD/adaptation = done per DR-132 [DEP-G03], unknown neutral, tag disappears silently). | PR-01 `22:2` (`131:519`, `131:592`, `131:599`, `22:85`), note `609:3845` |
| UI-02 + SEC-01 | ST-07 uses Share · Mapa Carregando; new variant Estado=Falhou (9:16 `606:1130`, 4:5 `606:1143`) used in ST-08; reactions removed from the disabled buttons; the status notice sits right under the preview; "Usar Rota" → SH-04. | ST-07 `583:2579`, ST-08 `583:2776`, `571:694` |
| SEC-02 | Cancel toast "Nada foi compartilhado."; G07 provider dependency (tiles are requested while the preview is built) added to the SH-02 note and to the 5.0 open list; map-extent claims corrected in the 5.0 doc, the Share · Mapa description and the SH-03 note ("esta folha não pede tiles"). | `174:4570`, SH-02 note, `584:2215`, `571:694` |
| UI-01 | Foto: the reading veil is now part of the block (90 % fill + 88 px fade above it) and grows with it; Bloco labels moved from texto/terciário to texto/secundário in all contexts. | `573:759`, `573:1041`, `572:813` |

**SHOULD/COULD also fixed in r1:** PUX-03 (PR-06 leads with the observed best 5-rep set 105 → 115 kg, e1RM secondary; "Compartilhar evolução" closes Progress → Share), PUX-04/05/10 (rules in the PR-01 and HJ-15 notes), PUX-06 (Marco shows only the qualifying run, no "completo"; Semana shows done sessions by modality, no "de 7"), PUX-07 + UI-16 (comparison card has no share button; origin → initial-context table in 5.0), PUX-08 (stale notes), PUX-09 + UI-19 + SEC-05 (one verb "Convidar", neutral code `7K2F-Q9XM`, toast lifted, "Dados pessoais" no longer wraps), UI-03 (overlay shadow), UI-05 (badge pinned right, equal tile sizes), UI-06 (value line in the highlight, "Recorde" title, meta clauses removed), UI-08 (trophy on the record set), UI-10 (sheet labels secondary; protection chip 44 pt), UI-12 (narrow-phone rule), UI-14, UI-15, UI-18 ("endereço ou nome de lugar"), UI-20, UI-21 (bound chart colours, hidden tiles removed), SEC-04 (trace-on rules in SH-05/06 notes), SEC-06 (ST-04 = system picker, no library access), SEC-07 (ST-06 note), SEC-08 (referral delivery dependency), ST-01/ST-03 headers now show the format strip, EV-05 note.

**Deferred with owner (not blocking):** "Plano atual" period in Progresso and the window across plan continuation (PUX-03, Product/UX); UI-09 (empty top in media-less 9:16 artifacts — polish, UI); UI-11 (TEXT properties on Destaque/Linha de evolução — memory quirk: one shared TEXT property forces one default across variants; define the code API at implementation); UI-13 (glow 4 px above the safe line); UI-17 micro-legends; UI-22 (preview enlarge); PUX-03 #6 (PR-01 hero "+18%" km in green — pre-existing); SEC-09 (CC-01 "06:48 · Parque Ibirapuera" — pre-existing, reverse geocoding = recipient, G07); Security conditions C1–C9 carry into implementation.

**Re-check r1 (same judges, read-only, narrow):**

| Judge | Verdict | Notes |
|---|---|---|
| Product/UX | `PASS_WITH_CONDITIONS` — VISUAL_READY for the r1 state | PUX-01 and PUX-02 closed; PUX-04–10 fixed; PUX-03 partly fixed (PR-06), rest deferred (condition: "Plano atual" period, Product/UX). New COULDs R1 (title) and R2 (cells per week). |
| UI | `UI_READY` | UI-01 and UI-02 closed (date row 7.4–7.9:1 over the photo; ≥ 6.8:1 on pure white). New SHOULD UI-23 (footnote clipped by the action bar) and open UI-04; new COULDs (4:5 failed label, Foto 4:5 photo area, SH-07 divider). |
| Security | `PASS_WITH_CONDITIONS`, no MUST | SEC-01 and SEC-02 closed; SEC-03–08 resolved; SEC-09 deferred to G07 at reconciliation; 31 artifacts re-scanned, allowlisted only. Cosmetic leftover on ST-04. |

**Post-review polish (judge-recommended, no re-review needed):** composer frames got 20 px more bottom room so the four-line footnote clears the action bar (UI-23); Share · Traçado vectors use butt caps, removing the bright beads at the protected joins (UI-04, first half); comparison title "Comparado ao último intervalado com alvo" (PUX R1); failed-map label moved to the top-left in 4:5; SH-07 trailing divider removed; ST-04 renamed to the system picker with the title "Fotos"; page-11 index updated (reviews block, PR-04/PR-06/ST-05 rows, new dependencies and reconciliation items).

**Deferred after closure (owner):** UI-04 second half — fade the protected ends over ≥ 30 px (UI); UI-09, UI-11, UI-13, UI-17, UI-22 and the Foto 4:5 photo area (UI polish); PUX R2 — PR-01 draws 4–5 cells per week while the file uses 7 sessions per week (Product/UX, reconciliation); PUX-03 "Plano atual" period (Product/UX); SEC-09 and the in-app route map look (Product/UX + Security, G07); Security conditions C1–C9 (implementation).

**Integrity at close:** the 70 `product/`, `canon/`, AGENTS.md and CLAUDE.md files bound by the R7ASC `BASELINE.json` still match byte for byte (check script in the session scratchpad); no CoachingCore, queue or verifier touched; `PENDING_CANON_SYNC.patch` not applied.
