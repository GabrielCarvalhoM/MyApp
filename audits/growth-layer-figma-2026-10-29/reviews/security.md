# Security, Privacy & Abuse review: Growth Layer UX/Figma (GLF-20261029)

- **Judge:** `security-privacy-abuse-architect`, an independent instance (worker ≠ judge), Opus 5.5 max. One round, read-only, design level only.
- **Revision reviewed:** Figma `TYR10AIrquCpKvKL3eyXyO` as read on 2026-10-29, around 11:30. Nodes reviewed:
  - page 11: index `592:1624`;
  - page 5: system doc `584:2215`, SH-01 to SH-07, gallery `585:2457`, ST-01 to ST-08;
  - page 9: the Growth Layer components;
  - page 6: CF-01, RF-01 to RF-03 and their notes;
  - CC-01 and CC-02 entry points, as context only.
  
  A later change to any of these nodes invalidates this verdict for the part that changed.
- **Authority read:**
  - DR-133, the full row including its "Unchanged" list (PDR-1.11 in `PENDING_CANON_SYNC.patch`);
  - DR-126 and DR-129;
  - PA §7 and its held note;
  - UXS SHR-04/05/06/09/10/13/14/16 and §16.1;
  - DR-91, DR-109, DR-111 and RUN-13.
- **Method:** screenshots, metadata and read-only `use_figma` scans. The scans covered texts (hidden layers included), instance variants and prototype reactions. No Figma edit and no repo edit other than this file. No verifier was run.

## Verdict

**SECURITY_DESIGN = PASS_WITH_CONDITIONS**

The design manifests DR-133 faithfully:
- **Initiation and defaults:** sharing is started by the person. Map and Route are off at every open; the composer opens in Dados.
- **Protection:** 200 m by default, shown by a discreet chip with "Editar". The private view in the sheet uses no map tiles, and the artifacts carry no start or end marker.
- **Preview and route options:** the preview is the exported file. There is a path without the route, and Route uses no map provider.
- **Artifact content:** payloads use allowlisted facts only and the file name is neutral. No link, code or ID appears in an artifact.
- **Reserved items, all marked open:** protection values (including reducing or turning off), minimum visible route, repeated-share inference, Privacy Zones, and the provider/tile policy.
- **Referral:** kept outside Crew. No contacts, graph, notification, reward or view of who joined.

**Blocking:** two MUSTs, SEC-01 and SEC-02, block acceptance of this revision. They clear when one narrow fix round lands and passes a read-only re-check.

**Not blocking:**
- the SHOULDs are fixed in the same round or carried by their owners;
- conditions C1–C9 carry into implementation;
- Security's re-verification of the boundary before implementation stays open (DR-133).

**No escalation:** nothing contradicts DR-133. Two implicit pre-decisions go back to their owners as SHOULDs: the map extent (SEC-03) and the referral code format (SEC-05).

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Map/Route: user-initiated, chosen per artifact, off at open, completed activities only, 200 m by default with a discreet editable indication, preview = file, a no-route option, Route without a map, Map with a map | PASS (gap: SEC-04) | SH-01 `172:3413` opens in Dados, with the footer "Mapa e Rota começam desligados a cada imagem". SH-02 `580:709` and SH-04 `580:1089` show the chip `575:1100` "Início e fim protegidos · 200 m · Editar" and the SHR-09 static warning. SH-03 `581:1513` offers "Compartilhar sem rota" and says "vale só para esta imagem". The preview frame is named "Prévia exata (= arquivo exportado)". ≥ 1 km and "nunca ao vivo" are kept (`584:2215`, `583:2980`). |
| 2 | No GPS, coordinates, address, place, time of day or hidden metadata; photo flow per SHR-10; neutral file name | PASS for artifacts; photo picker: SEC-06 | All 31 `Share · Artefato` instances on page 5: 0 hidden texts, and every unique text is allowlisted (no time of day, place, HR, effort, %, link or code). ST-01 `174:4305`: "vilumo-7f3k2.png · sem localização". The SH-05 note states SHR-10. |
| 3 | No tiles requested for the hidden area; provider/tile policy left open (G07) | PARTIAL: SEC-02, SEC-03 | The SH-03 private view `581:1567` is abstract and uses no map. The Map artifact is full-bleed (`571:578`). ST-07 loads tiles while the preview is built. The docs claim "only the safe area". |
| 4 | Reserved items left open and marked | PASS | The SH-03 note `583:2975` marks 400/800 m as placeholders, and reducing/turning off, minimum route and inference as GRW-09. Also in the doc's "Em aberto" list, the `575:1100` description and the page-11 dependencies. No zone UI. The increase-only placeholders are the conservative interim and are marked, so they do not silently decide anything. |
| 5 | Payload allowlisted per context; no link, code or ID | PASS | `Share · Bloco` `572:813`, all eight contexts. Força: ≤ 3 exercises, sets × reps · load, no tonnage. Marco: a count, never %. Excluded everywhere: HR/zones, RIR/effort, recovery, sleep/HRV, body weight or relative load, tonnage, adherence %, adjustment reasons, third parties. Map/Route exist only for a single run, never as an aggregate map. The signature is the wordmark only. |
| 6 | Referral boundary | PASS with SEC-05, SEC-08 | RF-01 `590:1749` has no contacts, link, graph, notification, view of who joined or reward. The note `590:1960` marks G07/G08/G10 and leaves "quantas pessoas entraram" open. |
| 7 | No partial or misleading share; opening the sheet ≠ publication | FAIL in the prototype (SEC-01); copy (SEC-02) | ST-02 `174:4377`: "Não sabemos se foi publicada" ✓. ST-03 ✓. ST-07 and ST-08 wire their disabled buttons to the system sheet. |

## Findings

### SEC-01 · MUST · Disabled share opens the system sheet while the map is loading or has failed
- **Evidence:**
  - ST-07 `583:2579` and ST-08 `583:2776` show "Compartilhar…" as disabled. Their notes say sharing waits for a complete preview and nothing leaves half-done (`583:2981`, `583:2982`).
  - The prototype still wires `583:2603` and `583:2800` (ON_CLICK) to ST-01 `174:4305`.
  - Both previews use `Share · Mapa` **Estado=Pronto** (`I583:2591;573:619`, `I583:2788;573:619`), so the failed state shows a fully loaded map.
- **Rule:** DR-133 (6), the exact preview; SHR-05, honest failure.
- **Fix:**
  - remove both reactions;
  - use `Estado=Carregando` (`571:621`) in ST-07;
  - in ST-08, show a preview without the map, either the trace on the neutral background or "Prévia indisponível" as in ST-03.

### SEC-02 · MUST · The Map preview contacts a third party, but the copy says nothing was sent
- **Evidence:**
  - Choosing Mapa fetches tiles while the preview is built, before any share act. The exact preview needs this: see the ST-07 banner "Carregando o mapa…" and note `583:2981`.
  - The ST-05 toast `174:4570` reads "Compartilhamento cancelado. Nada foi enviado." After a Map preview this is false: the provider has already received the requested area, which lies near the start and end.
  - SH-02 never tells the person who the recipient is. Only the designer docs say "o provedor é um destinatário a declarar" (`584:2215`).
  - ST-08 already uses the correct words: "Nada foi compartilhado".
- **Rule:** DR-133 "Unchanged": the map provider is a recipient to declare (DR-109, G07); SHR-05; PA §7 held note.
- **Fix:**
  - change `174:4570` to "Compartilhamento cancelado. Nada foi compartilhado.";
  - add to the SH-02 note (`583:2974`) and to the doc's open list: "Mapa pede a área segura ao provedor ao montar a prévia, antes do compartilhamento; onde e como a pessoa é informada do destinatário — G07 [DEP]". This means a discreet slot, never a modal; the copy stays with G07.

### SEC-03 · SHOULD · The Map layout requests more than the share-safe geometry, while the docs say it does not
- **Evidence:**
  - `Share · Mapa` (`571:578`, `574:1101`) and `Share · Artefato` Mapa (`573:618`, `573:900`) fill the whole canvas with map.
  - The protected trace sits only in the top box: 312×240 at (24, 40) in 9:16, the top third in 4:5.
  - The map continues under the data block, just beyond the ends of the visible strands, where the hidden start and end lie (SH-02 `580:721`, gallery `585:2460`).
  - The docs say three things the layout does not support:
    - "Mapa pedido só para a área segura" (`584:2215`);
    - "recebe no máximo a área segura" (`571:694`);
    - "nenhum tile é pedido perto do início ou do fim" (SH-03 note `583:2975`), which is true only of the sheet.
- **Rule:** DR-133's PDR open item: the provider request "should carry no more than the share-safe area". What the request reveals is open to Engineering + Security, G07.
- **Fix:** do one of the following:
  - bound the map to the share-safe bounding box plus a fixed margin, and fade to the artifact background beyond it; or
  - keep the full-bleed map, and replace the three claims with a DEP stating that the extent covers the surroundings of the protected ends; acceptance belongs to Engineering + Security, G07.

  In either case, limit the SH-03 sentence to "esta folha não pede tiles".

### SEC-04 · SHOULD · The Photo/Overlay state with a route is never shown
- **Evidence:**
  - SH-05 `580:1325` and SH-06 `580:1568` offer a "Traçado protegido" toggle, off by default.
  - No composer state, artifact variant or gallery example shows it on. The Foto/Sobreposição variants `573:759`, `573:809`, `573:1041` and `573:1091` have no `Share · Traçado`.
  - `575:1100` says the chip appears when the trace is on, but the static shape warning is not specified for this case.
- **Rule:** DR-133 (6) and (7); the SHR-09 static warning (in DR-133's "Unchanged" list).
- **Fix:** add one state, or a note. With the trace on:
  - the white trace uses the same share-safe geometry and protection value as Map/Route;
  - the chip, "Editar" and the static warning appear;
  - the toggle is off for every new image;
  - it is unavailable without "Rotas no app" or below the 1 km visible minimum.

### SEC-05 · SHOULD · The example referral code contains the person's first name
- **Evidence:** RF-01 to RF-03 show `590:1826` "vilumo.app/c/lucas-7k2f" and `590:1832` "LUCAS-7K2F".
  - Note `590:1960` calls the link and code placeholders, but the example anchors a name-based, low-entropy format.
  - It puts personal data in a token meant to travel: forwarded, or posted publicly on Stories.
  - The namespace is guessable, which enables enumeration and self-referral farming (G08).
- **Rule:** DR-129: no shared data beyond the attribution itself; abuse is G08. PA §7 held note: any link/code field belongs to Product/UX + Security, G07.
- **Fix:**
  - use a neutral random example, such as `vilumo.app/c/7K2F-Q9XM`;
  - add to the note: "formato do código sem dado pessoal, não sequencial; entropia e limites de resolução — Product/UX + Security (G07/G08)".

### SEC-06 · SHOULD · ST-04 shows a photo flow that needs library permission, contrary to SHR-10
- **Evidence:**
  - ST-04 `174:4500` is an in-app grid under iOS limited library access ("O app só vê as fotos que você escolher", "Escolher outras fotos"), which requires a Photos authorization.
  - Its note `174:4580` points to OV-06, which has been removed.
  - The SH-05 note states SHR-10 correctly, so for the new Foto format the file contradicts itself. ST-04 predates this mission; the new format inherits it.
- **Rule:** SHR-10: the system picker gives access only to the chosen item, with no library permission.
- **Fix:**
  - replace ST-04 with the system picker (no permission prompt), or mark it as superseded by SHR-10;
  - drop "Escolher outras fotos" and the OV-06 reference.

### SEC-07 · SHOULD · ST-06 "Ativar" does not say what turning on "Rotas no app" does
- **Evidence:** the ST-06 `583:2502` banner reads "…que está desligado. Ativar" (`I583:2572;116:725`, `I583:2572;116:726`). The note `583:2980` only says "o caminho para mudar".
- **Rule:**
  - SHR-09: granting the permission never turns the route on by itself;
  - RUN-13 / DR-109: while the purpose is off, the phone trace is discarded after derivation.
- **Fix:** state in the note that:
  - turning it on never selects Mapa or Rota;
  - a phone-recorded run made while it was off has no kept trace, so it shows the reason "esta corrida não guardou o percurso";
  - no trace is ever kept "just in case";
  - only Apple Health routes become readable.

### SEC-08 · COULD · The on-device referral promise needs a marked dependency
- **Evidence:**
  - `590:1850` reads "Até lá, o convite fica guardado só no aparelho dela."
  - The depicted link is a path on Vilumo's own domain.
  - Common deferred-deep-link methods would break the promise. Examples: server-side fingerprinting, attribution SDKs.
- **Rule:** DR-129 and DR-111: attribution before the account stays on the device. If an engineering condition cannot hold, the copy changes and returns to Security.
- **Fix:** add to `590:1960`: "entrega do convite ao aparelho sem correspondência no servidor — Engineering + Security, G07/G09".

### SEC-09 · COULD · Predates this mission and sits outside the delta, for the reconciliation pass
- CC-01 `21:2` shows "06:48 · Parque Ibirapuera", and the before-clone `577:3684` shows the same.
  - An in-app place label implies reverse geocoding, which means a location recipient (G07).
  - The author already lists the in-app map-like route on page 11 (DR-109). Send both to Product/UX + Security at reconciliation.
  - It is never shared and affects no artifact.

**Outside my domain (for their owners, no severity):**
- SH-07 `580:1934` makes "Critério do recorde" a toggle, while §16.1 and its own note say the criterion is fixed (Product/UX).
- ST-01, ST-03 and ST-04 still show the old composer header (UI).
- The EV-05 note `180:4777` points to CD-07, which has been removed (Product/UX).

## Conditions carried into implementation

Security re-verifies these before implementation (DR-133).

| ID | Condition | Owner |
|---|---|---|
| C1 | **Pipeline.** Privacy filtering runs on the device before any rendering or network call. The renderer and the map request receive only share-safe geometry; hidden segments are never passed, not even at alpha 0. The faded ends are drawn inside the share-safe geometry. Framing, zoom, centre and scale come from the share-safe geometry only. No start or end marker. Test: the output is identical with or without the hidden segments in the input. | Engineering; Security verifies |
| C2 | **Map provider (G07).** Decide the provider and the requested extent (SEC-03). Request only after the person picks Mapa. Never send: the raw route, the full-route bounding box, prefetch around the raw start/end, account or activity identifiers, per-user tokens, cookies or ad IDs. Keep the tile cache session-only and outside backups. Declare the recipient. Decide the label policy (street and POI names). | Engineering + Security, G07 |
| C3 | **Export.** Re-encode the image with no EXIF, GPS, XMP, IPTC, MakerNote or thumbnail; for PNG, no tEXt, iTXt, zTXt, eXIf or tIME chunks. Use a random file name per export, never built from IDs or dates. Alt text lists only the included fields. The share items are the image only: no URL, text or code until attribution is decided. Save with add-only Photos access. Delete the temporary photo and composition on finish or cancel. Pick photos with the system picker, with no library permission. | Engineering |
| C4 | **State.** Map/Route off at every open. Protection resets to 200 m per image and is never remembered. Only completed activities whose trace is kept under "Rotas no app" qualify. Keep the ≥ 1 km visible route until it is revised. Never during execution or an open session. Turning on "Rotas no app" never selects Map/Route. No trace is kept while the purpose is off. | Engineering |
| C5 | **Text sources.** Titles come only from the plan's purpose or modality labels, never from free text or imported workout names: names from Apple Health or other apps can carry a place or a time of day. The background light depends on the sport, never on the time of day. Dates stay at day level. | Engineering |
| C6 | **Integrity.** Share and save stay disabled until the preview is complete. Preview and export use the same render. A map failure exports nothing, and no fallback happens silently. | Engineering; QA |
| C7 | **Projection record (G07).** Record only "rota/mapa incluídos: sim/não" and the format: no geometry, no area, no protection value. | Product/UX + Security, G07 |
| C8 | **Residual risks to settle before exposure (GRW-09, Privacy Zones).** (a) Trimming along the route leaves later passes near the start or end visible. (b) A fixed, known 200 m plus a street map lets a viewer walk back from the visible ends; the SH-02 strands point at the start. Evaluate randomized or extended trimming, or suppression within a radius. (c) Repeated shares from the same start. (d) Posting right after the run signals where the person is now. (e) Map labels. (f) The Semana weekday rhythm combined with map shares reveals a routine. (g) Values below 200 m, or protection off. | Product/UX + Security |
| C9 | **Referral (before any build).** The code holds no personal data, is not sequential and has enough entropy. Resolution is rate-limited and returns no inviter identity. The link-to-install handoff uses no server-side fingerprinting or third-party attribution SDK, and the landing page keeps no log tying the code to IP or user agent; otherwise change the "só no aparelho dela" copy and return to Security. The share payload is the link plus neutral text. No tracking of destination or recipient. Self-referral and fake-account controls (G08) before any reward. Purpose and retention of the referral record (G07). Any "who joined" count is guarded against inference when the link went to a single person. | Product/UX + Security, Engineering; G07/G08/G10 |

**Evidence that closes the MUSTs (read-only re-check):**
- no reactions remain on `583:2603` or `583:2800`;
- the ST-07 and ST-08 previews no longer show `Estado=Pronto`;
- the text of `174:4570` is changed;
- the SH-02 note and the doc's open list carry the provider dependency.

## Re-check r1 (2026-10-29, read-only)

- **Scope:** the single fix round recorded in `RECORD.md` §7, on the same Figma file, read on 2026-10-29 after the fix.
- **Method:** as before. Read-only `use_figma` scans of reactions, instance variants and texts, plus screenshots of ST-04, ST-07 and ST-08.
- **Edits:** none in Figma; in the repo, only this section.

**Updated verdict: SECURITY_DESIGN = PASS_WITH_CONDITIONS. No MUST is open.**
- The design is accepted at design level.
- C1–C9 and the open DR-133 items carry, with their owners.
- Security's re-verification of the boundary before implementation stays open (DR-133).

| Finding | Result | Evidence (current revision) |
|---|---|---|
| SEC-01 MUST | CLOSED | `583:2603` and `583:2800`: 0 reactions, opacity 0.35 (disabled). ST-07 `583:2579`: no reactions; its preview uses `Share · Mapa` Estado=Carregando (`571:621`), drawn as tiles loading. ST-08 `583:2776`: its preview uses `Share · Mapa` Estado=Falhou (`606:1130`; 4:5 `606:1143`), which is the route only plus "Mapa indisponível" in a layer named "só na prévia, nunca exportado". Share and save stay disabled. The only link is on the status notice, to SH-04 `580:1089` ("Usar Rota"): an explicit act, not a silent fallback. |
| SEC-02 MUST | CLOSED | `174:4570` now reads "Compartilhamento cancelado. Nada foi compartilhado.", matching ST-03 and ST-08. The SH-02 note `583:2974` carries "DEP G07: ao montar a prévia o Mapa já pede a área ao provedor, antes de compartilhar; onde e como a pessoa é informada desse destinatário fica com G07 (espaço discreto, nunca modal)". The 5.0 open list `584:2215` carries the same item. |
| SEC-03 SHOULD | Resolved | `584:2215` step 4: "Mapa pedido ao montar a prévia; extensão e o que a requisição revela: em aberto (G07)", plus "O mapa cobre o artefato inteiro, inclusive o entorno das pontas ocultas…". The `571:694` description says the same. The SH-03 note `583:2975` now says "esta folha não pede tiles". The open list still says "(no máximo a área segura)": I read it as the PDR target that the open extent must meet (C2), not as a claim. |
| SEC-04 SHOULD | Resolved, by note | The SH-05 `583:2977` and SH-06 `583:2978` notes cover the trace-on state: white trace from the same share-safe geometry and protection; chip, "Editar" and shape warning; off for each new image; unavailable without "Rotas no app" or below 1 km. |
| SEC-05 SHOULD | Resolved | RF-01 to RF-03 show `vilumo.app/c/7K2F-Q9XM` and `7K2F-Q9XM`. Note `590:1960` adds "formato sem dado pessoal, não sequencial; entropia e limites de resolução — Product/UX + Security (G07/G08)". |
| SEC-06 SHOULD | Resolved, one nit | ST-04 copy now reads "Seletor do sistema: o app recebe só a foto que você escolher.", and "Escolher outras fotos" is gone. Note `174:4580` states SHR-10, with no library permission, and no longer points to OV-06. Nit (COULD, UI owner): the frame is still named "… (acesso limitado)", the header still says "Sobre foto", and the grid looks drawn by the app. The note governs. |
| SEC-07 SHOULD | Resolved | ST-06 note `583:2980`: "Ativar" opens Dados e privacidade and applies from then on. It never selects Mapa or Rota by itself. An iPhone-recorded run made while the option was off "não guardou o percurso". No trace is kept "por precaução". |
| SEC-08 COULD | Resolved | `590:1960`: the invite reaches the device without server-side matching (no fingerprinting or attribution SDK), owned by Engineering + Security (G07/G09). If that cannot hold, the "só no aparelho dela" copy changes and returns to Security. |
| SEC-09 COULD | Deferred, with owner | Predates this mission. `RECORD.md` §7 routes it to G07 at reconciliation. |

**Regression scan:**
- All 31 `Share · Artefato` instances on page 5 have 0 hidden texts. The new texts are allowlisted:
  - Corrida paces 4:10 / 4:08 / 4:09 / 4:07;
  - Marco: "semanas seguidas no plano · descanso planejado conta";
  - Semana: "7 treinos · Corrida 4 · Força 3", with no planned denominator.
- "Mapa indisponível" appears only in the preview of a state where share is disabled.
- No time of day, place, HR, effort, %, link, code or ID appears.
- ST-01 keeps "vilumo-7f3k2.png · sem localização"; its header now shows the format strip.
- The composer footer now names "endereço ou nome de lugar".
- Referral still has no contacts, graph, notification, reward or count; "Enviar convite…" opens the system sheet.
