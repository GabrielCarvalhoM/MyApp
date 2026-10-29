# Security / Privacy review — OB-2 trust boundary · round 2 (delta) · 2026-10-26

Reviewer: Security, Privacy & Abuse Architect 1.1.0. This is a fresh instance, read-only, and independent of the round-1 reviewer and of the author. Nothing was edited in the Figma or in the repo except this file.

**Verdict for the design: PASS_WITH_CONDITIONS.** Gate state: **SECURITY_READY_WITH_CONDITIONS**.
- Four design MUSTs remain open: M1–M4 below. All four are small fixes to copy or notes, and none needs a new decision.
- The engineering conditions (E1–E9) and the legal items (G07/G08) are not design items. They stay with their gates, unchanged from round 1.
- No account-access finding reopens in substance, and no drawn promise is unsupportable as long as E1–E7 hold.

## Inputs (versions as read 2026-10-25/26)
- Round 1: `reviews/SECURITY_REVIEW.md`. Author record: `ONBOARDING_V2.md`, status "AUTHOR SUBMISSION".
- Normative rows:
  - `product/PRODUCT_DECISION_REGISTER.md`: the PDR-1.7 block (marker `OB2-20261025-r1`), with DR-110 to DR-116 and "Open / owner";
  - `product/UX_SPECIFICATION.md`: ONB-02, ONB-03, ONB-05, ONB-15, ONB-20, ONB-23 and DEG-24;
  - `product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md`: `profile_context`;
  - `product/DESIGNER_PRODUCT_CONTEXT.md` line 53, "Antes da conta".
- Figma `TYR10AIrquCpKvKL3eyXyO`, read-only. I extracted every visible text and every prototype reaction from these frames: ON-01 `118:512`, ON-01r `386:4394`, ON-01s `386:5170`, ON-01b `299:2879`, ON-08 `120:985`, ON-11 `121:1030`, ON-15 `122:1156`, ON-15b `397:4845`, ON-02 `118:655`, ON-02d `397:4963`, ON-02c `397:13488`, PP-03 `123:1304` and AC-04f `300:2889`. I also read:
  - ON-V5 `126:1734`, ON-V6 `126:1820`, ON-02b `300:2971`, AC-01 `250:1689`, AC-04d `275:2652` and AC-11 `251:2136`;
  - every "Nota · …" in sections 2.1, 2.2 and 2.4.

  I visually rendered ON-02, ON-02d, ON-15, ON-15b, ON-11, ON-08, ON-01r, AC-04f and PP-03.

## Round-1 items

| Item | State | Evidence |
|---|---|---|
| D1 resume state | **CLOSED** | ON-01r reads "Seu questionário está salvo neste aparelho" and "Etapa 9 de 14 · suas respostas não aparecem aqui". The primary action is "Continuar de onde parou" and the secondary is "Recomeçar". The only content is the marketing carousel; no answer is shown. Its note states that the draft is erased only after a successful sign-in, and that no expiry number appears until G07 decides. |
| D2 erase sheet | **CLOSED** | ON-01s carries the exact title, body and HealthKit line, with the actions "Apagar e recomeçar" and "Cancelar". "Apagar e recomeçar" goes to ON-01 (no draft), and "Cancelar" goes to ON-01r. Its note says files and Keychain items are erased. |
| D3 promise | **CLOSED** | The promise appears on ON-01b ("Suas respostas ficam só neste aparelho até você criar a conta. Você pode apagá-las quando quiser.") and on ON-08 ("Nada sai deste aparelho antes de você criar sua conta."). The copy uses neither "nunca" nor "100%" and gives no retention period. The ON-01b note states that the promise is valid only under E1–E7 and goes back to Security if they fail. |
| D4 ON-V6 note | **CLOSED** | The ON-V6 note says the whole draft is erased, including the date of birth, and that editing the date to under 18 mid-questionnaire leads to the same place. "Fechar" goes to ON-01. ONB-03 encodes this as well. |
| D5 privacy policy before collection | **CLOSED** | "Política de privacidade" appears on ON-01, ON-01r and ON-08. |
| D6 storage clause | **CLOSED** | ON-08: "Usamos esses dados para montar seu plano. Eles vão para sua conta quando você criá-la." ON-15b: "…Fica neste aparelho até você criar a conta, e depois vai para ela." ONB-05 encodes the clause. |
| D7 explicit act at ON-15 | **PARTIAL** → M2, M3 | ON-15b has the switch "Autorizo usar no meu plano", and its note says "começa desligado" and "escolher a opção não é consentimento". Two problems remain: (a) the only drawn state shows the switch **on**; (b) the notes disagree on the "Dor ou lesão" path. The ON-15 note sends only "Voltando de pausa" to ON-15b and sends "Dor ou lesão" straight to ON-V5. The ON-15b note says the act covers both. ON-V5 collects the body region and draws no consent act. |
| D8 upload line at the account step | **OPEN** → M1 | The line "Suas respostas e o resumo do Apple Saúde vão para sua conta…" plus "O Vilumo é para maiores de 18 anos" exists only in the dimmed copy of ON-02 that sits behind the ON-02d sheet. **The main ON-02 frame (`118:655`) and its error state ON-02b do not carry it.** ON-02 shows only "Ao continuar, você aceita os Termos de uso e a Política de privacidade." The ON-02 note claims the line is there. |
| D9 notice after sign-in | **CLOSED** | ON-02c reads: "Você entrou na sua conta. Seu plano continua o mesmo; as respostas deste aparelho foram apagadas." It links to "Mudar meu contexto em Perfil" and shows none of the discarded content. |
| D10 (SHOULD) warning and interstitial | **PARTIAL** | The ON-02d sheet is right: "Já existe uma conta com esta Conta Apple", with "Entrar e manter meu plano" going to AC-11 and "Criar conta de outro jeito" going back to ON-02. The warning under "Já tenho conta" ("Ao entrar, as respostas deste aparelho são apagadas…") again exists only behind the sheet, not on the main ON-02. M1 fixes this. |
| D11 AC-04f | **CLOSED** | The body copy is exact. "Começar" goes to ON-01b and "Entrar de outro jeito" goes to AC-04. There is no terms line. The note discards the token: no code exchange, nothing stored, no identifier in logs (G08/G09). The ON-01b note is updated. Two leftovers, which M4 fixes: the AC-04 note still says AC-04f is "explícita, com termos e 18+", and it lists "Criar conta → ON-01b (18+) → ON-02". The layer name "Botão · Criar conta" on AC-04f is a naming nit. |
| Sex: label and helper | **CLOSED** | The label is "Sexo" and the field is marked "opcional". The helper reads: "Só ajuda a sugerir as primeiras cargas. Depois, o que conta é como você treina." It names the one consumer, and the author record says SSCTR accepted it. |
| Sex: optional, closed enum, no free text, no pre-selection | **CLOSED** (note) / SHOULD S1 (drawing) | The options are Feminino / Masculino / Prefiro não dizer. "Outro" was dropped for minimization, which resolves the round-1 SHOULD. The note and DR-114 say "sem pré-seleção". The drawn frame shows "Masculino" selected as a filled example, next to the filled height and weight. |
| Sex: no inference from sources | **CLOSED** | The ON-11 note says "Nunca lido do Apple Saúde". DR-114 says "never read from Apple Health or provider profiles". ONB-20 says the same. |
| Sex: prohibited uses and rights | **PARTIAL** → M4 | Gaps in the text: (1) In DR-114, "excluded from analytics, ads, pricing, sharing, notifications and LLM prompts unless G09 approves" can be read as letting G09 approve every one of those uses; round 1 allowed a G09 exception for LLM prompts only. (2) "Comparison with others" is absent. (3) Erasing the field to "Prefiro não dizer" must remove the stored value; this is not encoded. The field is editable in Perfil (ON-11 note). |
| Offline after account (SHOULD) | **CLOSED** | The ON-16 note reads: "Sua conta foi criada. Enviamos suas respostas quando a conexão voltar." |
| Q6 disclosures (SHOULD) | **CLOSED** | PP-03 shows "R$ 199,90 cobrados por ano pela App Store. Renova automaticamente; cancele quando quiser nos Ajustes do iPhone." It also shows Restaurar compra, Termos and Privacidade. The discount arithmetic holds: 199,90 ÷ 12 = 16,66, and 1 − 199,90 / 718,80 = 72%. DR-116 places the purchase after the account. |
| Q4 MUSTs (discard after success only; HealthKit grant ≠ consent) | **CLOSED** as design text, G09 for verification | These notes say the draft is discarded only after success and never merged: ON-01r, ON-02d, ON-02c and ON-02b ("nada é criado sem sucesso"). The ON-02d note and DR-111 say the HealthKit grant is not consent. See S3 about AC-11. |
| E1–E9, P1, L1, token rule | Not design items. Encoded in rows, unchanged. | DR-111 lists E1–E9, sends the token rule to G08 and the retention, art. 11 and analytics questions to G07, and says the copy goes back to Security if a condition fails. No row fixes a retention number (ONB-15 says "Validade do rascunho abandonado: G07"). |

## Cross-checks requested

**1. No copy promises more than E1–E7 support.**
PASS. The promise copy is on ON-01b, ON-08 ("Nada sai deste aparelho…", "Não gravamos nada no Apple Saúde"), ON-01r ("salvo neste aparelho") and ON-15b. It stays inside E1 (no transmission), E3 and E4 (on this device only) and E7 (erasable).
- "Lemos as últimas 8 semanas" describes the read, not what is stored. E5 keeps only a derived summary, and that is consistent with the copy.
- The "Recomendado" tag and the ON-V7/V7b checks are noted as computed on the device (E2).
- One copy finding: the AC-04d note promises an upload that E7 does not support. See M3.

**2. No screen pre-selects consent.**
PASS by rule, PARTIAL as drawn.
- ON-08's consent goes through the iOS system sheet.
- The terms acceptance on ON-02 is the ARCH-ACX-r1 action-adjacent pattern, unchanged.
- ON-15b's switch is specified "off" by default, but the only drawn state shows it on. See M2.
- PP-03's annual pre-selection chooses a plan, not a consent. The purchase needs the App Store sheet, so it is acceptable.

**3. Error and alternative states do not link to success.**
PASS.
- ON-02b links only back.
- ON-V6 → ON-01.
- ON-01s → ON-01 or ON-01r.
- ON-02d → AC-11 (sign-in to the existing account: the correct alternative outcome, not ON-16) or back to ON-02.
- AC-04f → ON-01b or AC-04.
- ON-02 → ON-16 only from Apple/Google (the "no account exists" branch).
- AC-04d's code field → ON-16 completes a pending sign-up, which is legitimate. The upload condition is in M3.

**4. Normative rows encode the conditions without inventing parameters.**
PASS with M4.
- DR-111, ONB-03, ONB-05, ONB-15, ONB-23 and the DPC paragraph carry the round-1 conditions faithfully.
- No row invents a retention period, an analytics rule or a token parameter.
- DR-116's prices are flagged provisional (G10).
- `profile_context` defers any sex-based numeric value to SSCTR.
- The only defects are the DR-114 wording gaps above.

## Open MUSTs (design; owner D, the designer; trigger: before Product/UX/UI gates close)
- **M1 — the D8 line on the real account step.** Copy the upload line and the 18+ sentence from the ON-02d background into ON-02 `118:655` and ON-02b `300:2971`: "Suas respostas [e o resumo do Apple Saúde] vão para sua conta para montar seu plano. Ao continuar, você aceita os Termos… O Vilumo é para maiores de 18 anos." Add the D10 warning under "Já tenho conta · Entrar" while there. Evidence of resolution: the text extracted from both frames contains the lines.
- **M2 — the consent switch as drawn.** Draw ON-15b in its arrival state with the switch **off**, and keep the current frame as "após autorizar". If the designer prefers, label the current frame explicitly as the post-act state instead.
- **M3 — consent and upload paths written consistently.** Two notes need changes:
  - (a) Change the ON-15 note so that "Dor ou lesão" also passes the explicit purpose act (ON-15b) before ON-V5, matching the ON-15b note. Declining the act stores nothing. PUX/SSCTR decide how a declined "Dor ou lesão" is planned; it must not be treated as "sem restrição" (see S2).
  - (b) Change the AC-04d note: "as respostas sobem só agora" holds **only if that pending sign-up was started from this draft on this device** (E7, binding to the session). Otherwise nothing is uploaded and the rule for signing in to an existing account applies. As written, the note lets one person's draft on a shared phone flow into another person's account: the A2 path through a pending e-mail sign-up.
- **M4 — normative wording (owner: author of the PDR/UXS rows).**
  - DR-114: restrict "unless G09 approves" to LLM prompts. Add "no comparison with others". Add that erasing the field to "Prefiro não dizer" in Perfil deletes the stored value.
  - AC-04 note: drop "com termos e 18+" from the AC-04f description, and change "Criar conta → ON-01b (18+) → ON-02" to "→ ON-01b → questionnaire → ON-02".

## SHOULD
- **S1.** On ON-11, draw or annotate the empty arrival state of the Sexo field so that the selected "Masculino" is not read as a default.
- **S2.** PUX/SSCTR/G07: define what happens when "Dor ou lesão" is declined at the purpose act. The referral guidance can be shown without storing the answer. The affected region must not be planned as if nothing had been said.
- **S3.** On AC-11, reached from ON-02d with a HealthKit grant made before the account:
  - iOS hides the read-permission status, so the app cannot tell whether the grant exists;
  - ingestion into the existing account therefore needs an explicit on-device confirmation for Apple Health;
  - "Continuar" alone is not that confirmation.

  Annotate the AC-11 note; G09 verifies.
- **S4.** For "Criar conta de outro jeito" on ON-02d, note that the provider token from that sheet is discarded under the same AC-04f rule (G08).

## Conditions unchanged (owners per round 1)
- **G09:**
  - E1–E9;
  - no HealthKit ingestion into an existing account without that account's consent and an on-device confirmation;
  - no reads of `HKBiologicalSex` or `dateOfBirth`;
  - the purchase bound to the account, and the restore rule.
- **G08:** the token discarded at AC-04f and ON-02d, plus the existing items.
- **G07:**
  - P1, the expiry of an abandoned draft;
  - L1, art. 11 sufficiency and analytics before consent;
  - the classification and retention of the sex field;
  - the final consent and terms copy.
- The verification on a real build listed in round 1 is still required before implementation can be Security-ready. None of it was run here, because no build exists.

## Limits
- The renders were taken at 1x. The CF-02 Sexo row (page 6) was not inspected in detail: its text extraction returned only the section headers.
- Prototype links were read from reactions. The flows were not played.
