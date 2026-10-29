# New Figma V1 completion — delivery report (NFV1-20261023-r1)

Date: 2026-10-24 · File: `TYR10AIrquCpKvKL3eyXyO` (new Figma, sole experience authority per the [Founder request](FOUNDER_REQUEST.md)).
Scope honored: Figma edits in this file only · no runtime implementation · legacy Figma `NeaZKGCzHMy6IHc47cVEHs` untouched · no Product Truth promotion or scientific policy change.

Status: **DELIVERED FOR FOUNDER REVIEW; Founder gate decisions applied 2026-10-24** ([gate closure](GATE_CLOSURE_2026-10-24.md), PDR DR-103–109). This is an experience candidate; it is not implemented, user-tested or promoted. Account access (sign-up, sign-in, recovery, re-authentication, e-mails) was added on 2026-10-24/25. Its independent design gates passed: UI_READY and Security PASS for the design ([checkpoint](../new-figma-account-access-2026-10-24/CHECKPOINT.md)).

## What the file now contains

| Page | Content | Key IDs |
|---|---|---|
| 0 · Direção de identidade (added 2026-10-24) | Identity pass IDV-1: critical reading, variants (Atual, A, C), chosen direction C · Assinatura and its rules. See [identity pass](../new-figma-identity-pass-2026-10-24/IDENTITY_PASS.md). | page `219:3409` · doc `231:252` |
| 1 · Telas · Dark | Original Hoje/Plano/Histórico/Detalhe/Progresso screens (truth-corrected), Hoje states HJ-02–14, and new sections 1c Plano (PL-03–09), 1d Histórico (HI-02–07), 2b Detalhe (DT-03–07), 3b Progresso (PR-04–08). Guide updated; old Home explorations marked archive. | page `0:1` · 1c `165:1441` · 1d `166:2539` · 2b `167:3031` · 3b `169:3254` · 1b `134:514` |
| 2 · Onboarding e primeiro plano | ON-01–16 (no language question), ON-V1–V7 variants, first plan PP-01–08. Added 2026-10-24, account access ([checkpoint](../new-figma-account-access-2026-10-24/CHECKPOINT.md)): section 2.4 holds AC-01–11 (sign-up with e-mail, sign-in, password reset, confirm identity, new iPhone), the states AC-02b–10d (code errors, common or leaked password, loading, offline, e-mail not confirmed, keyboard, Apple/Google re-authentication, export, wrong password, ES, long e-mail) and notes. Section 2.5 holds the PT-BR account e-mails EM-a–g; the copy in PT-BR, EN and ES is in [ACCOUNT_EMAILS](../new-figma-account-access-2026-10-24/ACCOUNT_EMAILS.md). Changed 2026-10-25, after a Product/UX Architect decision on the Apple/Google branches:
- ON-01b (date of birth) now comes before ON-02 and has left ON-11, so 18+ comes before any identity (ONB-03, DEG-24, DR-53).
- ON-V6 is a neutral end with a single exit.
- AC-04f (Apple/Google with no account) and ON-02b (provider failure) are added. AC-04g is reserved for G08 item 5.
- Signing in lands where the account is (AC-11 → Hoje), never back into onboarding. | page `118:510` · ON-01b `299:2879` · 2.4 `250:1688` · AC-04f `300:2889` · 2.5 `280:2845` |
| 3 · Execução e conclusão | Run execution EX-R01–13, strength execution EX-F01–10, completion CC-02/03/04/07. | page `138:1441` |
| 4 · Adaptações e recuperação | AD-01–15 (keep, reduce volume/intensity, move, substitution, partial week, material change, accepted, rejected, other options, ASK, insufficient info, stale, clinical pause, plan versions); recovery RR-00–06 (three layers; full data, no wearable, watch vs. report, subjective-only, partial, first nights — values only, no personal-range claims). | page `148:1441` · 4.1 `148:1442` · 4.2 `161:2126` |
| 5 · Compartilhar | Composer with exact preview and route opt-in per image (SH-01–03); full cards (run, run with trace, strength, double day, week, milestone, race; CD-01–07); transparent overlays and photo overlay (OV-01–06); share states (ST-01–05). | page `172:3411` |
| 6 · Perfil, ajustes e prova | Você hub and settings CF-01–16 (personal data, priority, routine, units, language, integrations with Apple Saúde, Garmin, COROS, Polar and connection states, notifications, data and privacy, delete account, subscription active/expired); race EV-01–06. Added 2026-10-24: CF-17 Conta e acesso (e-mail, sign-in method), CF-18 Alterar senha with its states CF-18b (wrong current password) and CF-18c (common or leaked new password), CF-19 Aparelhos conectados, reached from the CF-01 row "Conta e acesso". | page `178:3411` · CF-14 `209:4473` · CF-15 `209:4552` · CF-16 `209:4622` · CF-17 `256:1455` · CF-18 `256:1539` · CF-19 `256:1613` |
| 7 · Estados, idiomas e stress | System states SS-01–05; EN, ES, EN + imperial, dynamic type I18N-01–04; stress STR-01–06. | page `183:3411` |
| 8 · Mapa de navegação e auditoria | Navigation map, navigation answers, page index, adversarial audit result. Updated 2026-10-24: Entrada lists AC-01–11, AC-02b–10d and EM-a–g; Você lists CF-17–19 and AC-10; two new answers cover signing in or recovering the account and changing the password or devices. | page `192:3411` |
| 9 · Componentes e tokens | 38 color variables (collection `VariableCollectionId:115:510`), 21 text styles, 74 icons, 13 component sets. Count on 2026-10-24, after IDV-1 and account access: 46 color variables (including `texto/placeholder` and the fixed `marca/*` brand constants), 23 text styles, 6 paint styles, 76 icons, 18 component sets (new: Campo de texto, Campo de código, Botão de provedor), plus the components Marca · Vilumo and Logo/Google. | page `115:570` |

Prototype: tab navigation on every tab screen of page 1 plus key drill-downs and back actions; click-through flows with starting points on pages 2–6. Figma prototypes cannot link across pages, so cross-page journeys are documented on page 8 instead.

## Product-truth alignment

- No readiness or fatigue score, no ACWR/CTL/ATL/TSB, no race-time prediction, no HRmax estimated from age, no ideal per-muscle ranges; e1RM always labeled as an estimate.
- Adaptations follow stable-by-default and the A–E autonomy levels: proposals show what happened, what stays, what changes, what is lost and why it is the minimum; material changes need confirmation; rejection is a valid answer; proposals go stale when the original session starts; no catch-up debt; "sem registro" ≠ "não feito".
- Recovery keeps recovery state, session readiness and plan decision separate; missing data is shown as missing, never as zero or alert.
- Sharing follows DR-91: allowlisted facts only, route trace opt-in per image (off by default, trimmed, no map or time), photo composed on device without metadata, no claim that opening the share sheet means it was published.
- Strength: per-hand dumbbell loads; no load conversion between exercises; loads found by reps in reserve when there is no history.

## Verification

- Every batch of screens was checked with screenshots during construction; defects found were fixed and rechecked.
- Final text scan of all pages for banned or risky terms (scores, load metrics, AI claims, predictions, injury-risk wording, clichés, percentages, legacy terms). Remaining hits are factual (HR-zone time split, completion counts) or explicit denials ("Não existe nota de prontidão").
- Cross-screen data consistency pass (dates, watch, loads, race-pace segments, interval counts) with corrections listed on page 8.

## Open items as delivered → Founder decisions 2026-10-24

Each item below was decided by the Founder ([decisions](FOUNDER_DECISIONS_2026-10-24.md), PDR DR-103–109) and applied as listed in the [gate closure](GATE_CLOSURE_2026-10-24.md).

1. **Español** — was flagged as a scope delta → **V1 language** (DR-103); scope and authorities synced.
2. **Subscription** — trial, legal copy, what pauses on expiry → flows kept; displayed prices provisional, not Product Truth; post-expiry access still G10, legal copy G07 (DR-104).
3. **Taper and race week** → experience kept under approved policy only (ACF-G04); rule statements removed from copy, sessions illustrative (DR-105).
4. **Personal range for sleep/HRV** — the delivered screens still said "no seu normal" → removed everywhere; values and observable context only until an approved rule (DR-106, RRM-03).
5. **Integrations** — the delivery wrongly limited them to Apple → per product authority, Garmin, COROS and Polar are candidate V1 routes under G06, now with connection states. The Apple Watch app/guided execution and the Apple Health write, neither in V1 scope, were removed (DR-107).
6. **Account deletion** → flow kept; scope, timelines, retention and legal text depend on policy (G07, DR-108).
7. **"Rotas no app" default** — already specified off in UXS RUN-13, while the delivered CF-10 showed it on → now off by default, explicitly user-controlled, separate from GPS permission (DR-109).
