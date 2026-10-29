# New Figma V1 — Founder gate decisions applied (NFV1-GATES-r1)

Date: 2026-10-24 · File: `TYR10AIrquCpKvKL3eyXyO` · Source: [Founder decisions](FOUNDER_DECISIONS_2026-10-24.md) · Normative record: PDR DR-103–109.
Scope honored: minimal edits in the new Figma only; visual direction unchanged; no exploration round; legacy Figma `NeaZKGCzHMy6IHc47cVEHs` untouched; no runtime.

## Figma changes by decision

1. **Spanish in V1.** No UI change (ES was already designed). I18N-02 no longer carries "delta de escopo"; notes on CF-06, I18N-01 and I18N-02 state PT-BR, EN and ES as V1 languages.
2. **Subscription.** Trial/paywall/expiry flows kept. Notes on PP-03 (covering PP-03/06/07 and CF-12) and CF-12: prices are provisional, not Product Truth, final values by commercial decision (G10). CF-13 note: the "Continua com você / Fica pausado" lists are illustrative; post-expiry access is pending (G10); data, history, export/delete and a session in progress are never held.
3. **Taper and race week.** Rule statements removed from copy: HJ-12 ("os treinos desta semana são curtos", chip "Sem força pesada" hidden), EV-03 header ("Treinos curtos…"), AD-07 (taper start date, leg-volume cut, "duas últimas semanas"). Sessions and doses stay as illustrative placeholders; HJ-12, EV-03 and AD-07 notes tie them to approved policy (ACF-G04).
4. **Sleep/HRV.** Every "no seu normal", "abaixo/dentro da sua faixa", "usual range", "rango habitual", "aprendendo/conhecendo seu normal" and "sono curto" claim replaced by values and observable context:
   - Hoje recovery line (HJ-01–08, HJ-11, HJ-12, EV-04, I18N-01/02/04) now shows sleep and HRV values for that date.
   - HJ-09 renamed "Plano mantido após noite de 5h40", states the value without judging it, neutral icon.
   - RR-00/01/05/06: labels show the previous night's value; copy says values are shown "sem dizer se estão altos ou baixos". RR-06 renamed "Primeiras noites com o relógio".
   - RR-03 reframed from "VFC abaixo da sua faixa" to a watch-versus-report disagreement on sleep (7h20 on the watch, "umas 5 horas" reported): both stay visible, no verdict, neutral tag.
   - AD-01 ("só como contexto"), PP-05 ("Primeiras noites"), PR-01 (deltas against the previous 4 weeks without good/bad colors).
5. **Integrations.** Authority checked first; no documentary conflict (DR-107). CF-07: Apple Watch shown as arriving through Apple Saúde. "App instalado / treino do dia e execução guiada no relógio" was removed because it is not in V1 scope. "Gravando no Apple Saúde" was removed too: UXS LAC-21 says writing there can wait and needs a new purpose under G06/G07. Garmin, COROS and Polar rows were added. New CF-14 (connect: purpose, what is received, consent before any read), CF-15 (Garmin connected, variant person) and CF-16 (connection states: not connected, awaiting authorization, connected, no new workouts, access removed, provider down, disconnected). Prototype: Garmin row → CF-14 → CF-15, with back actions. ON-08 points Garmin/COROS/Polar users to Integrations. EX-R01/EX-R13 notes no longer promise watch guidance.
6. **Account deletion.** CF-11 flow kept, no deadline shown. Its note lists what depends on the privacy/legal policy (G07): deletion scope, timelines, legal retention and final text.
7. **Route privacy.** CF-10 "Rotas no app" now starts off (it was on, contrary to the existing UXS RUN-13 default); copy says "Desligado até você ligar"; a new caption separates the location permission (measuring distance and pace) from showing or sharing the route. CC-07 note marks it as the default; CC-01/CC-03 show the route with the option on, and a background map only with a declared map provider (G07). Share trace stays opt-in per image.

Page 8: navigation map (CF-07–08 · 14–16), page index (CF-01–16), audit criteria "Veracidade" and "Poucos dados" updated, the "Em aberto" block replaced by "Decisões do Founder · 24 out 2026".

## Repository sync

- `product/PRODUCT_DECISION_REGISTER.md`: PDR-1.6 amendment DR-103–109; DR-47 disposition, §4 preserved decisions, G07 and SEC-J3-06 parity include ES.
- `product/V1_RELEASE_SCOPE.md`: overlay and transversal row (PT-BR+EN+ES).
- `canon/CANONICAL_INDEX.md`: pointer overlay.
- `product/DESIGNER_PRODUCT_CONTEXT.md`: languages, integrations, route default, subscription, recovery language.
- Language lists: PDM, PA, CORE_FLOWS, AEOS ExplanationRequest, AESL S38, UXS ONB-02/EXP-06/NOT-07/DEP-13.
- Left as provenance: FG phase-3 raw answers, the original DR-47 row inside the historical PDR-0.6 record, PTM source S3 and the thesis note that delegates languages to the PDR.

## Verification

- Screenshots after each page batch (pages 1, 2, 4, 6, 8) and after each targeted fix.
- Final text scan of pages 1–9 for the removed phrases ("seu normal", "sua faixa", "usual range", "rango habitual", "delta de escopo", "Sinais misturados", "Sono curto", "Sem força pesada", "Treinos curtos", "no futuro", "App instalado", "volume de pernas", "duas últimas semanas", "sem comparação"). Remaining hits fall into two groups. Design notes on RR-01, RR-03 and page 8 quote these phrases in order to forbid them. Two other phrases are unrelated: "execução guiada" on the paywall means guidance inside the app, and "4 treinos curtos" describes the first calibration week.
- Repo grep: "PT-BR + EN" remains only in historical records.

## Remaining dependencies (none blocks the design baseline)

G10: prices, trial, terms and post-expiry access. G07: legal copy, deletion timelines and retention, map provider as recipient. ACF-G04: combined taper/race-week recipe. RRM-03: any future personal-range claim. G06: provider selection, access, contracted cost and device proof. Promoting the file to final Experience/Design Source of Truth (DR-94) and authorizing UI implementation are Founder acts not yet taken.
