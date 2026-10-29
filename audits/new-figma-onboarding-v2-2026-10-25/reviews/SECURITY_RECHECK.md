# Security / Privacy re-check — OB-2 · after round 2 · 2026-10-26

Reviewer: Security, Privacy & Abuse Architect 1.1.0. I am the same instance that wrote [SECURITY_REVIEW_R2.md](SECURITY_REVIEW_R2.md), and I did not author any of the changes reviewed here. I worked read-only and edited nothing except this file. I ran no verify scripts. The only repo check was a read-only count confirming that the `from` text of each op checked here appears exactly once in its target file.

## Verdict
**Design verdict for this revision: PASS_WITH_CONDITIONS. Gate state: SECURITY_READY_WITH_CONDITIONS.**
- All four round-2 MUSTs are resolved. M1–M3 are closed in the Figma. M4 is closed in the Figma for the AC-04 note, and **CLOSED on application** for the DR-114 wording.
- One new MUST: **N1**, a short note-level fix.
- The other conditions:
  - the held doc corrections must be applied as prepared;
  - the engineering and legal conditions stay with G09, G08 and G07, unchanged.

## Inputs
- **Figma `TYR10AIrquCpKvKL3eyXyO`**, read live on 2026-10-26.
  - I extracted the text and prototype reactions of these frames: ON-02 `118:655`, ON-02b `300:2971`, ON-15 `122:1156`, ON-15b `444:4793` and `397:4845`, ON-15d `444:4889`, ON-V5 `126:1734`, ON-02c `397:13488`, ON-11 lb·ft `443:4723`, and AC-04f `300:2889`, `445:13343` and `445:13387`.
  - I read these notes: `118:878`, `122:1546`, `400:13236`, `444:5016`, `126:2077`, `276:2856`, `250:2080`, `445:13386`, `445:13429`, `400:13238`, `121:1291`, `251:2218`, `400:13237`, `300:2970` and `300:3022`.
  - I rendered ON-02, ON-02b, both ON-15b states, ON-15d, ON-11 lb·ft and the three AC-04f frames.
- **`PENDING_DOC_CORRECTIONS_R2.json`**, in state "READY_TO_APPLY — HELD WHILE DOMAIN_COACHING_R6 IS OPEN".
  - I judged the `to` text of ops 1, 6 and 18–23 as the text that will be applied.
  - Each `from` text is still present exactly once in its target file, and no `to` text is applied yet.
  - I also scanned ops 2–5, 7–17 and 24–34 for side effects on the trust boundary. They are training and structure text, with none found.

## 1. Round-2 MUSTs

| Item | State | Evidence |
|---|---|---|
| **M1** — the upload line, 18+ and the D10 warning on the real account step | **CLOSED** | ON-02 `118:655` and ON-02b `300:2971` both render "Suas respostas e o resumo do Apple Saúde vão para sua conta para montar seu plano. Ao continuar, você aceita os Termos de uso e a Política de privacidade. O Vilumo é para maiores de 18 anos." Under "Já tenho conta · Entrar" they show "Ao entrar, as respostas deste aparelho são apagadas e o plano da sua conta continua." The ON-02 note `118:878` names ON-02 as the single source; ON-02b and the ON-02d background repeat it. ON-02b links only back. |
| **M2** — the consent switch as drawn | **CLOSED** | ON-15b `444:4793` ("ao chegar, desligado") renders the switch **off**. `397:4845` is renamed "após autorizar", and its note `400:13236` says the switch starts off and that choosing an option is not consent. |
| **M3(a)** — the limitation branch | **CLOSED** in Figma; ONB-11 **CLOSED on application** (op 23) | The ON-15 note `122:1546` makes both "Dor ou lesão" and "Voltando de uma pausa" pass the explicit act before any detail is asked. ON-15d `444:4889` renders a declined "Dor ou lesão": the switch is off, with "Sem autorização, não usamos essa resposta. Recomendamos uma avaliação profissional antes de treinar a região afetada. Você pode autorizar depois em Perfil." Its note `444:5016` says no region is collected, nothing is kept, and the answer is unknown, never "sem restrição". The ON-V5 note `126:2077` says ON-V5 comes only after the act and collects the region only with authorization. Its exit goes to ON-02, and the prototype confirms it. |
| **M3(b)** — the AC-04d upload is bound to the draft | **CLOSED** | Note `276:2856`: "Confirmar → ON-16 quando aquele cadastro pendente começou a partir deste rascunho, neste aparelho (E7, ligado à sessão): só então as respostas sobem. Caso contrário nada sobe…" |
| **M4** — the AC-04 note | **CLOSED** | Note `250:2080`: AC-04f "não cria conta aqui (sem termos nesta tela; o token do provedor é descartado, G08)". "Criar conta" follows one draft per device: no draft → ON-01b → questionnaire → ON-02; an incomplete draft → the saved step; a complete draft → ON-02. Only the explicit erase restarts the draft. |
| **M4** — the DR-114 wording | **CLOSED on application** (op 6) | The `to` text says "never used for analytics, ads, pricing, sharing, notifications or comparison with others, and kept out of LLM prompts unless G09 approves that field … erasing it in Perfil (back to 'Prefiro não dizer') deletes the stored value". All three gaps are covered. |

The normative ops that carry round-1 conditions read correctly. Each is **CLOSED on application**:
- **Op 1 (DR-111)** names "no answer, Apple Health value or derived value" and adds logs. It sends value-free funnel events before consent to G07 and adds the one-draft-per-device rule.
- **Op 22 (ONB-15)** applies the same draft rule.
- **Op 21 (ONB-23)** routes sign-in to wherever the account stands, and shows the notice only when a draft existed.
- **Ops 18–20** move the primary consent (M1 in the domain model, not this review's M1) to the account step, before any upload.
  - Whether that act is separate from accepting the terms is left to G07, which is the right owner.
  - If G07 requires a separate act, ON-02 gains a control and returns to Security.
  - The current D8 line names the purpose ("para montar seu plano"), so this does not block the design.

## 2. SHOULDs from round 2

| Item | State | Evidence |
|---|---|---|
| S1 — ON-11 arrival state | **CLOSED** | Note `121:1291`: "Estado ao chegar: nenhum sexo marcado (o frame mostra a resposta de Lucas)". |
| S2 — declined "Dor ou lesão" | **CLOSED** (planning treatment → HC03/ONB-12, op 23) | ON-15d and note `444:5016`. |
| S3 — AC-11 with a HealthKit grant made before the account | **CLOSED** (G09 verifies) | Note `251:2218`: the grant is not this account's consent, iOS hides the read status, nothing enters the account without its consent plus an on-device confirmation, and "'Continuar' sozinho não confirma". |
| S4 — token discarded on ON-02d's "Criar conta de outro jeito" | **CLOSED** (G08) | Note `400:13237`. |

## 3. Does any new frame promise more than E1–E7 support?
**No drawn frame does.** Details:
- **ON-15d:** "não usamos essa resposta" is supportable. It adds one item to verify on a real build (G09): a declined limitation leaves only "unknown" in the draft, with no option value and no region.
- **The AC-04f variants** say only that answers exist on this device, never what they are.
- **ON-02 and ON-02b:** the upload line tells the truth about the upload under E1/E7.

**One gap in an undrawn mode, which becomes N1.** Op 21 and note `250:2080` define a "questionário no modo com conta": after signing in to an account that has no answers, the person answers the questionnaire with the account already open. In that mode, answers go to the account as they are given. The note removes only "a linha 'só neste aparelho'" (ON-01b). The other device-only clauses would become false:
- ON-08: "Nada sai deste aparelho antes de você criar sua conta" and "Eles vão para sua conta quando você criá-la";
- ON-15b and ON-15d: "Fica neste aparelho até você criar a conta".

## Open MUST
- **N1 — copy for the account mode (owners: the designer for the AC-04 note, and the author of op 21).** State that in the account mode **every** device-only clause is dropped (ON-01b, ON-08, ON-15b and ON-15d). The purpose-consent copy then says the data goes to the account and is used for the plan. Consents are recorded directly to the account, so the E9 device record is not used.
  - Resolution evidence: the note text, plus op 21's `to` text, or a follow-up op.
  - Trigger: before the Product/UX and UI gates close, and in any case before implementation handoff.
  - No new decision is needed.

## New SHOULD
- **S5 — a way out of the AC-04f draft variants (designer).**
  - **The risk.** `445:13343` and `445:13387` offer only "Continuar minhas respostas" or "Criar conta com estas respostas", plus "Entrar de outro jeito". On a shared phone, a different Apple ID would be steered into adopting another person's answers. Those answers include the health summary, the limitation and the date of birth, so the 18+ check was passed by someone else.
  - **The fix.** Add a secondary "Não são minhas respostas · Começar do zero" that goes to ON-01s, the erase sheet.
  - **Why not a MUST.** The round-1 residual risk for an unlocked shared phone already accepts the same reach through ON-01r. The explicit "create with these answers" call to action makes it more likely to happen.

## Conditions unchanged
- **Doc application.** Apply the held ops 1, 6 and 18–23 as prepared, after R6 closes, with the hash checks in the apply script. If any target changed in the meantime, Security re-checks ops 1, 6 and 21–23 before they are applied.
- **G09:**
  - E1–E9;
  - no HealthKit ingestion into an existing account without that account's consent plus an on-device confirmation;
  - no reads of `HKBiologicalSex` or `dateOfBirth`;
  - a declined limitation is stored only as "unknown";
  - the purchase is bound to the account, and the restore rule applies.
- **G08:** the token discarded at AC-04f, at both AC-04f variants and at ON-02d, plus the existing items.
- **G07:**
  - the expiry of an abandoned draft;
  - the sufficiency of LGPD art. 11 consent, and whether analytics may run before consent;
  - whether the primary consent is a separate act or comes with the terms (ops 18–20);
  - the classification and retention of the sex field;
  - the final consent and terms copy.
- Real-build verification (round 1 list) is still required before implementation can be Security-ready. None of it was run here.

## Limits
- Renders were taken at 0.5–0.6x and the flows were not played.
- The ON-15b, ON-15d and AC-04f variants are support states with no prototype links. I checked their routing in the notes.
