# OB-2 — proposed product decisions and review brief (draft r1, 2026-10-25)

> **History.** These rows were applied as PDR-1.7 (DR-110–116), with changes made after the reviews. This file is no longer the decision source. Some of its details were superseded: "Outro" was dropped, "Você › Disponibilidade" became "Perfil › Rotina", and the residual Equilíbrio default became "no tag". The round-2 doc corrections are held in [PENDING_DOC_CORRECTIONS_R2.json](PENDING_DOC_CORRECTIONS_R2.json).

Source: [Founder request](FOUNDER_REQUEST.md) of 2026-10-25 (DECIDED by the Founder where it states a choice). This draft turns that request into product-truth rows and names what still needs a competent reviewer. It is an author draft, not Product Truth until applied after the reviews below. Nothing here changes runtime (`CoachingCore` stays as is; no implementation is authorized).

## Routing (Task Contract, concise)

| Unit | Level | Owner (worker) | Independent judge | Why |
|---|---|---|---|---|
| U1 Product-truth rows + doc sync | L4 decided by Founder; documentary sync L2 | Current instance (Claude, Opus 5.5 max) under the PCG constitution | Product/UX Architect (fidelity + interpretability), together with U4 | Doctrine changes (availability → chosen days, new Athlete Context fields, account order) |
| U2 Training-policy semantics | L3 domain | — | SSCTR (sports science), read-only | Chosen days binding, same-shift sequencing, rotation cadence, sex as coach input, priority recommendation |
| U3 Trust boundary | L3 | — | Security/Privacy Architect, read-only | Questionnaire, Apple Health read and body/sex/limitation data before an account exists |
| U4 Flow structure | L2 | Current instance | Product/UX Architect | New order, split schedule screens, conflict sheet, removal of ON-13, sign-in-with-existing-account state |
| U5 Figma | L2 | Current instance (UI & Experience Designer role, Opus 5.5 max) | Fresh UI & Experience Designer judge (Opus 5.5 max), read-only | Visual + interaction + motion |

Four axes for U1–U3: impact high (doctrine, trust boundary), irreversibility low (documents and a candidate Figma, history kept), uncertainty medium (science bounds, legal parameters), dependencies high (UXS, AEOS, PDM, STIL, EM, DPC, PDR, Figma). STOP_WHEN: rows applied, docs synced, Figma revised, the four judges current and passing (or findings owned). ESCALATE_IF: a reviewer finds a rule that cannot be stated without inventing science, a legal parameter that blocks the design, or a contradiction with a preserved invariant.

## Proposed rows (PDR-1.7)

**DR-110 — account access (pending since 2026-10-24, amended).** V1 account access offers Apple, Google and e-mail + password. Every path that creates an identity passes the 18+ step first (ON-01b). Order amended by DR-111.

**DR-111 — onboarding before the account.** Welcome offers "Começar" and "Já tenho conta". "Começar" → 18+ (ON-01b) → questionnaire → create account (or sign in) → week assembly → proposal → subscription offer → explicit adoption. "Já tenho conta" → sign-in (AC-04), unchanged.
- Before the account exists, answers — including what is read from Apple Health and the voluntary limitation answer — stay **on the device only**. Nothing reaches Vilumo's servers before the account is created and the terms are accepted.
- Abandoning keeps the local draft for resume (ONB-15); the person can erase it ("Recomeçar"). Draft protection and retention → G08/G07.
- Signing in to an **existing** account at the end of the questionnaire keeps that account's plan and Athlete Model. The device answers are never applied silently: they are discarded, with a one-line notice, and the person can change context in Perfil.
- Purpose consent stays at the point of use: Apple Health on ON-08, the limitation on ON-15 (ONB-05, ONB-11). Terms + privacy are accepted on the account step, before any upload.
- Supersedes only the order ON-01b → ON-02 → questionnaire of the account-access design (ARCH-ACX-r1). 18+ remains the first step after "Começar".

**DR-112 — training days and shifts are chosen by the person, per sport.**
- The person chooses: strength days + one strength shift; running days + one running shift + the long-run day (one of the running days). Per-day fine tuning later in Você › Disponibilidade.
- The plan uses exactly those days and shifts: each chosen day carries a session of that sport, in that shift; no session of that sport is placed on a day the person did not choose, except by the person's own move (EDT-02).
- The coach decides what happens inside each chosen day — session type, content, dose, order and the distribution of the week's load across the chosen days — within approved policy. More days means the weekly load is spread, not that more load is added.
- Same day in both sports = two sessions that day, accepted by the choice itself. Same day **and** same shift = back-to-back sessions; the onboarding shows a conflict notice and asks for explicit confirmation ("fazer em sequência") or a different shift.
- Safety and authority still come first: a scoped HOLD, a reported limitation or an out-of-coverage case may reduce, replace with recovery or retain a session on a chosen day — always explained, never by silently removing the day. If the chosen days cannot serve the goals, or exceed what the coach can prescribe for the profile under approved policy, the onboarding says so (ON-V7) and the person decides; the app never drops chosen days on its own.
- Supersedes UXS ONB-09 ("janela marcada = possível, não obrigação; o plano escolhe a distribuição") and ONB-21 (separate double-session preference; its screen ON-13 is removed). AEOS `practice_context`, DPC and EM follow.

**DR-113 — strength exercise rotation is a preference.** The onboarding asks how often strength exercises change: "O coach decide" (recommended), "A cada 6 semanas", "A cada 2 semanas", "Fixo". Rotation means exercise selection only; progression of load, reps, sets and effort continues under approved policy whatever the choice. "Fixo" keeps the exercises until the person asks, except an eligible substitution (equipment, discomfort or restriction), which always needs the person's agency. Editable later. Rotation recipe (what changes, how many exercises, how loads carry over) → training policy + SSCTR.

**DR-114 — body data step: sex and units.** "Sobre você" asks sex (Feminino / Masculino / Outro / Prefiro não dizer) with height and weight. Units switch inline: kg ↔ lb and cm ↔ ft/in, default from the locale, also editable in settings. Sex is cold-start context for the coach within approved policy, never a standalone determinant, never a stereotype, never a menstrual-cycle, hormonal or clinical inference; "Outro" and "Prefiro não dizer" are not penalized and mean no sex-specific context. Supersedes the part of ONB-02 that kept units out of the onboarding and extends ONB-20 / `profile_context`.

**DR-115 — "Recomendado" only where derived.** A "Recomendado" tag appears only when the recommendation comes from the person's own earlier answers or from approved policy, and never pre-selects: priority (ON-06) from the goals; rotation (ON-14b) "O coach decide". Never on goals, personal facts, limitations or consent.
- Priority mapping (draft): strength goal "Manter a força" or "Força para correr melhor" → Corrida primeiro; run goal "Correr com regularidade" with strength goal "Ficar mais forte" or "Ganhar massa muscular" → Força primeiro; run goal "Uma prova com data" with a strength development goal → Corrida primeiro (the date is fixed); any other pair → Equilíbrio.

**DR-116 — paywall presentation.** The subscription offer emphasizes the selected plan and the annual plan: the monthly equivalent and the discount % against the monthly price are computed from the displayed prices (provisional, G10: R$ 199,90/ano → R$ 16,66/mês, 72% below R$ 59,90). Benefits are product facts. No ratings, testimonials, countdowns, "only today" offers or efficacy claims without evidence. Value before hard ask (ONB-18) unchanged: the offer follows the proposal.

## Questions for SSCTR (U2) — answer per item: decision, conditions, copy limits, sources

1. **Chosen days binding (DR-112).** Is "each chosen day carries a session; the coach decides content/dose and spreads weekly load" a defensible envelope for running and strength? Which guardrails are needed when the chosen frequency is high for the profile (e.g. novice runner choosing 6 run days) — lighter/shorter sessions only, or an honest limit that asks the person (ON-V7)? Any constraint on the long-run day relative to strength days that the coach must handle by content rather than by moving days?
2. **Same shift back-to-back.** Is it acceptable to plan two sessions in sequence when confirmed? Who decides the order (by priority?) and what may the UI say about order without inventing a universal rule?
3. **Rotation cadence (DR-113).** Are 6 weeks / 2 weeks / fixed / coach decides defensible options? Is "O coach decide" a defensible recommendation? Is the statement "progression continues whatever the rotation" honest, especially for a 2-week rotation (new exercises need new loads)? Proposed option copy:
   - O coach decide — "Troca quando o seu objetivo pede, geralmente ao fim de um bloco"
   - A cada 6 semanas — "Tempo para progredir nos mesmos exercícios"
   - A cada 2 semanas — "Mais variedade; a progressão continua"
   - Fixo — "Os mesmos exercícios até você pedir para trocar"
   - footnote — "Trocar exercícios não interrompe a progressão: cargas, séries e repetições seguem evoluindo."
4. **Sex as coach input (DR-114).** What bounded nonclinical uses are supported (e.g. starting-load estimates when no load is known)? What is prohibited? Is "Outro / Prefiro não dizer = no sex-specific context" acceptable? Proposed helper copy: "Usamos como ponto de partida das cargas. Não muda seus objetivos."
5. **Priority recommendation (DR-115).** Is the mapping defensible as a suggestion? Especially "prova com data → Corrida primeiro" and "Força para correr melhor → Corrida primeiro".

## Questions for Security/Privacy (U3)

1. Questionnaire before the account: on-device only until the account step; HealthKit read on device (ON-08/ON-09 summary computed locally); upload after account creation and terms acceptance. Conditions for the local draft (protection class, retention when abandoned, erase control, no analytics with answers before consent)?
2. Terms/privacy acceptance moved to the account step at the end; purpose consents stay at the point of use (HealthKit, limitation). Any consent that must move earlier?
3. Sex field: classification and minimization (options, "Prefiro não dizer", label "Sexo" rather than gender identity), storage with `profile_context`.
4. Existing account at the end ("Já tenho conta" on the account step): keep the account's plan, discard device answers with a notice. Any risk (e.g. merging answers into someone else's account on a shared phone)?
5. AC-04f (Apple/Google with no account, from "Já tenho conta"): it should now send the person to the start of the onboarding (18+ first) instead of creating the account immediately. Is the provider token handling still acceptable (no account until the end; token not kept)?
6. Paywall placement after the account (subscription bound to the account); "Restaurar compra" unchanged.

## Doc sync list (after reviews)

PDR (PDR-1.7 block, DR-110–116, G-list owners) · UXS ONB-02/07/09/20/21, §6.2 table, EDT-02 wording, J-01/FLOW-01 order · AEOS `profile_context`, `practice_context` · STIL (rotation preference consumer) · PDM Athlete Context line (preferences) · EM onboarding paragraph · DPC (Athlete Model and decisions paragraphs) · canon index pointer · CURRENT_MISSION NFV1 block and MISSION_LEDGER (insert-only) · memory. Candidate foundation and `CoachingCore` are not edited; their owners must map the new inputs in R5 (gap recorded).
