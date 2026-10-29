# Security / Privacy review — OB-2 trust boundary (U3) · round 1 · 2026-10-25

Reviewer: Security, Privacy & Abuse Architect 1.1.0. Fresh instance, read-only. This reviewer did not author anything under review.
Gate state: **SECURITY_READY_WITH_CONDITIONS** for the design direction. It is not a design PASS: the revised frames do not exist yet.

## Scope and inputs (versions as read on 2026-10-25)
- `FOUNDER_REQUEST.md` (OB-2). The Founder decided the order. This review covers how to make that order safe, not whether to adopt it.
- `DECISIONS_DRAFT.md` draft r1: DR-110, DR-111, DR-114 and DR-116, plus the six U3 questions.
- `audits/new-figma-account-access-2026-10-24/CHECKPOINT.md` and `FOUNDER_REQUEST.md`. That Security PASS was for that design version. `ACCOUNT_EMAILS.md` gives the open G08/G09 list.
- Authority:
  - UXS ONB-01..21, J-01 (FLOW-01 order), FLOW-15, ST-CONS, NOT-05/08, DEG-24, DEP-08/09/14, SURF-13;
  - PDM I6/I10;
  - PDR G07/G08/G09, DR-53 and SEC-J3-02/04/06;
  - DPC "Integrações, privacidade e assinatura".
- Figma `TYR10AIrquCpKvKL3eyXyO`, read-only screenshots of these frames: ON-02 `118:655`, ON-08 `120:985`, ON-15 `122:1156`, AC-04f `300:2889`, and the notes for ON-01b `299:2946`, ON-02 `118:878`, ON-08 `120:1179` and ON-15 `122:1546`. Nothing was edited.

## Threat model (delta introduced by the reorder)
**Assets.** The questionnaire answers include:
- date of birth (ON-01b);
- body data and sex (ON-11);
- an Apple Health read: 8 weeks of workouts and heart rate, with optional sleep and HRV. This is health data, sensitive under LGPD art. 5 II and 11;
- the limitation answer (ON-15, health data);
- schedule;
- consent acts.

**New boundary.** These assets now live on the device, without an account, for minutes to days. They cross to the server only at the account step.

**Actors:**
- the owner of the device;
- other people with physical access to a shared or family phone;
- a person who later signs in to a different account on the same phone;
- third-party SDKs (analytics, crash reporting, attribution);
- the OS backup service (iCloud or Google);
- the engineering pipeline, through logs.

**Main abuse and failure paths:**
- **A1.** Answers leave the device before consent through analytics, crash breadcrumbs, remote computation or backup. If that happens, the "only on this device" promise is false.
- **A2.** Device answers get merged into someone else's account on a shared phone.
- **A3.** A HealthKit grant made before the account becomes ingestion into whichever account signs in later.
- **A4.** A provider token is kept across a long questionnaire after AC-04f.
- **A5.** A provisional or anonymous server identity is created before 18+ and the terms. That would be option 8A, which needs a Founder/legal decision.
- **A6.** The local draft outlives its purpose: abandoned, never erased, or exposed when the onboarding resumes.
- **A7.** The sex field turns into gender-identity collection, or an inference with no consumer.

## Verdicts

| # | Question | Verdict |
|---|---|---|
| 1 | Questionnaire before the account, kept on the device only | **PASS_WITH_CONDITIONS** |
| 2 | Terms at the account step; purpose consents at the point of use | **PASS_WITH_CONDITIONS** |
| 3 | Sex field | **PASS_WITH_CONDITIONS** |
| 4 | Signing in to an existing account at the end | **PASS_WITH_CONDITIONS** |
| 5 | AC-04f redirected to the start of the onboarding | **PASS_WITH_CONDITIONS** |
| 6 | Paywall after the account | **PASS** (SHOULDs only) |

Owner key:
- **D**: the designer, now, in the Figma (copy, states, screens).
- **G07**: Founder/legal with Security.
- **G08 / G09**: Engineering with Security, before implementation.
- **PUX**: Product/UX Architect.

---

### Q1 — Answers kept on the device until the account exists · PASS_WITH_CONDITIONS
The order is safer than the current one in one respect: no identity and no server record exist before the person has seen the plan's value and accepted the terms. That keeps 8B and DR-53 intact. The risk moves to local storage and to leaks before consent.

**Is the promise "Suas respostas ficam só neste aparelho até você criar a conta" supportable?** Yes, but only if E1–E7 below all hold in the build. If any of them fails, the copy must change and Security must review it again. As written today it is a design promise, not a verified property.

MUST, engineering (G09; Android parity on Health Connect):
- **E1 — no transmission before the account.** No answer, value derived from an answer or Apple Health value leaves the device before the account exists and the terms are accepted. This covers:
  - analytics event properties;
  - crash-report breadcrumbs and attachments;
  - remote config keyed by answers;
  - attribution SDKs;
  - server calls.

  Funnel events that carry only "step reached", with no values, are compatible with the wording "suas respostas". Whether such events may run before consent at all is a G07 decision. If analytics before consent is not cleared, none runs.
- **E2 — everything shown before the account is computed locally.** That covers the ON-09 summary, the ON-V7 "doesn't fit the schedule" check, the "Recomendado" tag (DR-115) and the conflict sheet for the same shift. If any of them needs the server or `CoachingCore`, choose one:
  - move it after the account step; or
  - change the copy and bring it back to Security.
- **E3 — no backup.** The draft is excluded from device backups:
  - iOS: `isExcludedFromBackup`, and no iCloud or Keychain sync for the draft. App Store guideline 5.1.3 already forbids health data in iCloud.
  - Android: `allowBackup`/`dataExtractionRules` exclusions.

  Without E3, "só neste aparelho" is false.
- **E4 — protection at rest.**
  - iOS: Data Protection `NSFileProtectionComplete` for the draft file. Onboarding needs no background access.
  - Android: app-private storage, encrypted with a Keystore-backed key.
  - Either way: no draft in `UserDefaults`/`SharedPreferences` in plain text, and nothing in the clipboard.
- **E5 — Apple Health minimization.** The draft keeps only the derived summary the plan needs, never the raw 8 weeks of samples. After the account exists, the app reads HealthKit again for the upload, under the HealthKit grant.
- **E6 — no identity before 18+ and the terms.** No anonymous or provisional server account is created. Examples: anonymous auth, or a device ID joined to answers. Doing so would be option 8A, which needs a Founder/legal decision.
- **E7 — the end of the draft.**
  - The draft is deleted (files and any Keychain items) when:
    - the upload has succeeded and the server has acknowledged it;
    - the person erases it ("Recomeçar");
    - the person reaches ON-V6, which also deletes the date of birth;
    - the person signs in to an existing account (Q4);
    - the draft has expired.
  - The upload is bound to the account ID created in that same session. If that session ends before the upload (sign-out, account switch), the draft is not sent to the next account.
  - The upload is idempotent: no duplicate on retry.
- **E8 — no logs.** No answer appears in local or remote logs.

MUST, G07:
- **P1 — retention of an abandoned draft.** G07 sets an inactivity expiry. This reviewer recommends 30 days or less. Do not arbitrate a number in the copy until G07 fixes it: the design either omits the number or uses the placeholder `{N} dias`.

MUST, design (draw now):
- **D1 — resume state** (ON-01 with a draft present):
  - the primary action is "Continuar de onde parou" and the secondary is "Recomeçar";
  - it shows step progress only, never answer content: no limitation, health or body data on that screen.
- **D2 — erase sheet:**
  - title: "Apagar suas respostas?";
  - body: "Tudo o que você respondeu neste aparelho será apagado.";
  - if Apple Health was connected, add: "A permissão do Apple Saúde continua nos Ajustes do iPhone." Erasing the answers cannot revoke HealthKit, so the copy must not imply that it does;
  - actions: "Apagar e recomeçar" and "Cancelar";
  - after erasing, the person lands on ON-01 with no draft.
- **D3 — the privacy promise, placed once where the first personal data is asked (ON-01b or ON-03 footnote), and again in the ON-08 "O que não fazemos" card:**
  - suggested copy: "Suas respostas ficam só neste aparelho até você criar a conta. Você pode apagá-las quando quiser.";
  - for ON-08, add the line: "Nada sai deste aparelho antes de você criar sua conta.";
  - this is valid only under E1–E7;
  - avoid "nunca" and "100%";
  - do not promise a retention period before P1.
- **D4 — ON-V6 note.** It must say that failing 18+ erases the whole draft, including the date of birth. The note must also cover the case where the person goes back and edits the date of birth to under 18 mid-questionnaire: that path also goes to ON-V6 and erases the draft. The draft only starts after 18+ passes.

SHOULD:
- **S1 — no reminders.** No notification about an abandoned onboarding before the account exists. If one is ever added, it follows NOT-05/08: generic, with no category and no answer.
- **S2 — app-switcher snapshot.** Blur the snapshot on ON-08/09, ON-11 and ON-15 (G09).

COULD:
- **C1 — device lock.** Require the device passcode or Face ID to resume a draft that contains health answers. This is not required, because a device lock (Security C3) was kept out of scope. The residual risk on a shared phone is accepted, given D1, D2 and P1.

### Q2 — Terms and privacy at the account step; purpose consents at the point of use · PASS_WITH_CONDITIONS
Accepting the terms can stay at the account step. Before it, Vilumo provides no server service and receives no data (E1/E2), so the terms text and the 18+ statement are not needed earlier. ON-01b already enforces 18+.

Two things must come earlier: being able to **read** the privacy policy, and the statement of how data is handled before the account exists. Purpose consent for health data cannot be folded into the terms line.

MUST, design:
- **D5 — privacy policy reachable before the account.** A "Política de privacidade" link is reachable before any personal data is collected:
  - a footer link on ON-01;
  - a link on ON-08, inside "O que vamos ler".

  Reasons: transparency (LGPD art. 9), and App Store 5.1.1(i), which requires an in-app privacy-policy link that is easy to reach. Apps that read HealthKit are checked for it. Today the only link before the account is on ON-02, which now moves to the end.
- **D6 — ON-08 and ON-15 consent copy covers storage as well as reading.** The point-of-use text must say that the data will be saved to the account once it is created and used to build the plan, not only that it is read or used.
  - Suggested line for ON-08: "Usamos esses dados para montar seu plano. Eles vão para sua conta quando você criá-la."
  - Equivalent for ON-15, shown only when the person shares a limitation ("Dor ou lesão" / "Voltando de uma pausa"): "Usamos só para ajustar seu plano. Fica neste aparelho até você criar a conta."
- **D7 — ON-15 consent act.** In the current frame, the ON-15 default state shows a purpose line ("Ajuda a não planejar o que você não deve fazer") but no explicit consent act. ONB-11 requires explicit purpose consent at the moment of the question.
  - The designer must confirm that a consent element exists in a sub-state, or draw one.
  - Either way, the act must be explicit, and choosing an option must not be taken as consent.
  - Final text: G07, under `[DEP-G07]`.
- **D8 — account step names what will be uploaded.** Next to the terms line on ON-02, as one line: "Suas respostas [e o resumo do Apple Saúde] vão para sua conta para montar seu plano." Show the bracketed part only if Apple Health was connected. Keep the terms line beside every action that creates an account (ARCH-ACX-r1, unchanged).

MUST, G07 / G09:
- **E9 — consent records made before the account.** Consents given before the account (Apple Health purpose, limitation purpose) are recorded on the device with language, text version (SEC-J3-06) and time. They are bound to the account at creation and uploaded only then.
  - If the consent text version changed between capture and account creation, ask again.
  - If the person never creates the account, the record is deleted with the draft.
- **L1 — legal check (G07, not a design blocker).** Is it enough under LGPD art. 11 I, which requires consent in a specific, highlighted form, to have point-of-use consent for health data before the account (with the storage clause in D6) plus terms at the end? G07 also decides whether funnel analytics may run before consent. Neither question blocks drawing the design, and no Founder escalation is needed now.

### Q3 — Sex field (DR-114) · PASS_WITH_CONDITIONS
**Classification.** Personal data. It is not in the LGPD art. 5 II sensitive list by itself. Here it is collected next to body data and health answers, and an option labelled for gender identity can reveal information about identity. Treat it at the same protection level as `profile_context` (restricted), and exclude it from every secondary use.

MUST:
- **Label and options (design).** The label is "Sexo" with a helper that states the one consumer. "Gênero" would ask for gender identity, which has no consumer. The suggested helper is acceptable if SSCTR confirms it is true: "Usamos como ponto de partida das cargas. Não muda seus objetivos."
- **Answering is optional; no pre-selection; no free text.** The fixed options are Feminino / Masculino / Prefiro não dizer, plus "Outro" if PUX keeps it.
- **"Outro" and "Prefiro não dizer".** Both mean no sex-specific context (DR-114). Neither is a penalty or a gate.
- **No inference from sources (G09).** No sex or date of birth is read from Apple Health characteristics (`HKBiologicalSex`, `dateOfBirth`). ON-08 does not list them, so reading them would go beyond the consent. The same applies to the Apple/Google profile, the name and any other source. Nothing is prefilled from them.
- **Prohibited uses:**
  - inferring menstrual cycle, pregnancy, hormones or clinical state;
  - analytics, advertising, pricing, sharing (SHR), notifications and widgets;
  - any LLM prompt unless G09 approves the field;
  - any comparison with others.
- **Rights.** The person can edit the field and erase it to "Prefiro não dizer" in Perfil. Erasing removes the stored value, not only the label.

SHOULD:
- **"Outro" and minimization.** "Outro" collects a distinction that nothing consumes, which is the reason for dropping it under ONB-01. If PUX keeps it for inclusion, store it as a closed enum that is only shown back to the person. Processing treats it exactly like "Prefiro não dizer", and it is never exported to any engine input as a distinct value.
- **G07 classification.** G07 adds the field to the purpose→data inventory and notes its retention.

### Q4 — Existing account at the end ("Já tenho conta" on the account step) · PASS_WITH_CONDITIONS
Discarding the device answers, rather than merging them, is the right control: it removes the shared-phone merge risk (A2). The remaining risk is A3: the HealthKit grant is per device and per app, not per account.

MUST:
- **No merge and no upload of the draft into an existing account (G09).**
  - The discard runs only **after** sign-in succeeds. A failed or cancelled sign-in keeps the draft.
  - The same rule applies to "Já tenho conta" on ON-01 when a draft exists, and to the account step when "Continuar com a Apple/Google" finds an existing account. In the current ON-02 note, that is branch (1), "entra direto".
- **The HealthKit grant is not the account's consent (G09).** The grant made before the account is never treated as Apple Health consent for the signed-in account. Nothing is ingested from this device into that account unless both hold:
  1. the account has its own valid Apple Health consent (I6, SEC-J3-04);
  2. the person confirms the connection on this device (Perfil › Integrações).

  This stops one person's health data on a shared phone from flowing into another person's account.
- **D9 — notice after sign-in (design).** A one-line notice at landing (Hoje, PP-08 or the saved step):
  - "Você entrou na sua conta. Seu plano continua o mesmo; as respostas deste aparelho foram apagadas."
  - optional link: "Mudar meu contexto em Perfil".
  - The notice shows none of the discarded content.

SHOULD:
- **D10 — tell the person before sign-in (design).**
  - Under "Já tenho conta" on the account step: "Ao entrar, as respostas deste aparelho são apagadas e seu plano atual continua."
  - When Apple/Google turns out to have an existing account at the account step, do not sign in silently. Show an interstitial: "Já existe uma conta com esta Conta Apple", with the actions "Entrar e manter meu plano" and "Criar conta de outro jeito".

  The current "entra direto" is acceptable without answers on the device. With answers, it causes silent loss and surprise.

COULD (PUX decides; Security accepts only with these conditions):
- **Account with no Athlete context.** If the existing account has none (it was created but never completed), offer "Usar as respostas deste aparelho". This is allowed only:
  - after authentication;
  - with a preview of what will be applied;
  - with an explicit choice;
  - with fresh purpose consent recorded for that account.

  It is never the default.

### Q5 — AC-04f leads to the start of the onboarding · PASS_WITH_CONDITIONS
Sending the person to ON-01b and then the questionnaire, with the account created at the end, is acceptable. It removes the immediate account creation in AC-04f and keeps 18+ before any identity.

This **invalidates the Security PASS** of the account-access gate for AC-04f and ON-02, because a gate is valid only for the version reviewed. No closed finding is reopened in substance: 8B is kept, and AC-04g stays reserved. The redrawn AC-04f and the account step need a short delta Security review.

MUST, G08/G09:
- **No provider token is kept across the questionnaire.**
  - The Apple/Google token obtained in AC-04 is used only for the account lookup.
  - At AC-04f it is discarded:
    - no exchange of the authorization code;
    - nothing stored on the server or device;
    - no provider `sub` or e-mail in logs or analytics;
    - no "pending" record.
  - The account step asks the provider for a **fresh** sign-in.
  - This extends the existing G08 item "Apple/Google tokens before the 18+ step"; that item is unchanged.

MUST, design:
- **D11 — AC-04f.**
  - Body: "Para criar uma conta, primeiro algumas perguntas para montar seu plano. A conta é criada no fim."
  - Primary action: "Começar", which goes to ON-01b. Secondary: "Entrar de outro jeito".
  - **Remove the terms line from AC-04f.** It no longer creates an account. Keeping "Ao continuar, você aceita…" there would record an acceptance with no account. The terms move to the account step.
  - Update the ON-01b note: drop "(ou cria a conta direto, vindo de AC-04f)".

### Q6 — Paywall after the account · PASS
Binding the subscription to an account that already exists is the safer placement: no orphan purchases, and entitlement is cleanly separate from consent and adoption (G09 freeze). DR-116's no-dark-pattern rules are consistent with this review.

SHOULD:
- **Purchase bound to the account (G09).**
  - The purchase carries the account ID: iOS `appAccountToken`, Google Play `obfuscatedAccountId`.
  - Receipts are validated on the server.
  - A rule covers "Restaurar compra" on an Apple ID shared with a different Vilumo account. The entitlement does not move silently between Vilumo accounts.
- **Auto-renewable subscription disclosures (G10/G07; design checks PP-03).** PP-03 shows period, price, renewal and how to cancel. It also shows links to the Terms and the Privacy policy. These are App Store 3.1.2 requirements.
- **Paywall analytics.** Plan-selection analytics only after the account, under G07.

---

## New states and changes the design must draw (summary)
| ID | Where | What | Level |
|---|---|---|---|
| D1 | ON-01 with a draft | Continue / Recomeçar; no answer content | MUST |
| D2 | Sheet | Erase answers, with the line about the HealthKit permission | MUST |
| D3 | ON-01b or ON-03, and ON-08 | Promise that answers stay on this device (valid only under E1–E7) | MUST |
| D4 | ON-V6 note | Erase the whole draft, including the date of birth; editing the date of birth to under 18 later also leads here | MUST |
| D5 | ON-01, ON-08 | Privacy policy link before collection | MUST |
| D6 | ON-08, ON-15 | Consent copy covers saving to the account | MUST |
| D7 | ON-15 | Explicit purpose-consent act (confirm it exists or draw it) | MUST |
| D8 | Account step | Line naming what will be uploaded, next to the terms | MUST |
| D9 | Landing after sign-in | Notice of discarded answers | MUST |
| D10 | Account step | Warning before sign-in, and an interstitial when the provider finds an existing account | SHOULD |
| D11 | AC-04f | New copy, goes to ON-01b, no terms line | MUST |
| — | ON-11 | Sex field: optional, closed enum, helper, no default | MUST |
| — | ON-16 offline after the account exists | "Sua conta foi criada. Enviamos suas respostas quando a conexão voltar." | SHOULD |

## Conditions that belong to the gates (not in the Figma)
- **G09 (Engineering, Security verifies):**
  - E1–E9;
  - no HealthKit ingestion into an existing account without that account's consent and confirmation on the device;
  - the token discarded at AC-04f;
  - no `HKBiologicalSex` or `dateOfBirth` reads;
  - the purchase bound to the account;
  - the "Restaurar compra" rule for an Apple ID shared across accounts.
- **G07 (Founder/legal):**
  - P1, the expiry of an abandoned draft;
  - L1, the sufficiency of art. 11 consent in this order, and whether analytics may run before consent;
  - the classification and retention of the sex field;
  - final consent and terms copy.
- **G08:** existing items unchanged (18+ method, retry after ON-V6, tokens before 18+).

## Required verification before implementation is Security-ready (not run here)
Run on a real build, not on documents:
- network capture during a full onboarding without an account: zero requests carrying answers or health values;
- backup inspection: the draft is absent from iCloud and Android backups;
- file-protection attributes on the draft;
- crash-report payloads free of answers;
- sign-in to an existing account with a draft present: no merge, no ingestion from HealthKit;
- AC-04f: no token persisted;
- ON-V6 and erase: no residual files.

## Residual risks accepted
- A person with access to an unlocked shared phone can resume someone else's draft during the retention window. Mitigated by D1, D2 and P1; C1 is not required.
- The HealthKit permission outlives an erase. This is disclosed in D2.

## Escalation
- No legal decision blocks the design now.
- L1 is a G07 item before implementation.
- No closed account-access finding is reopened in substance. The gate for AC-04f and ON-02 is invalidated by version and needs a delta review after the redraw.
- Creating a provisional or anonymous account before the end would be option 8A, which needs a Founder/legal decision.
