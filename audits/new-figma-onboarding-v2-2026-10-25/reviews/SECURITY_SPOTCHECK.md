# Security / Privacy spot-check — OB-2 · after the re-check · 2026-10-26

Reviewer: Security, Privacy & Abuse Architect 1.1.0. This is the same instance that wrote [SECURITY_RECHECK.md](SECURITY_RECHECK.md). I did not author the fixes. I worked read-only and wrote only this file.

## Verdict
**Design verdict: PASS. Gate state: SECURITY_READY_WITH_CONDITIONS.**
- No design MUST is open.
- Every round-1, round-2 and re-check MUST is closed in the Figma.
- **The conditions that remain are not design work:**
  - apply the held doc corrections as prepared;
  - engineering conditions E1–E9 and the related G09 items;
  - the provider-token rules (G08);
  - the legal items (G07);
  - the round-1 checks on a real build before implementation.

## Inputs
- **Figma `TYR10AIrquCpKvKL3eyXyO`**, read live.
  - I read the text and prototype reactions of these nodes: notes `250:2080`, `445:13386`, `445:13429`, `400:13237` and `122:1546`; frames AC-04f `445:13343` and `445:13387`, with buttons `459:4952` and `459:4956`; ON-02 `118:655`, ON-02b `300:2971`, ON-01s `386:5170` and ON-02c `397:13488`.
  - I rendered ON-02c and AC-04f `445:13387`.
- **`PENDING_DOC_CORRECTIONS_R2.json`** at revision r2. Its SHA-256 is `101fbb6fd744483cec8af99cc7f6de8beb71193636eb9ceedb89b9604ba61306`, which matches the `101fbb6f…` given.
  - Its state is "READY_TO_APPLY — HELD WHILE DOMAIN_COACHING_R6 IS OPEN".
  - The `from` texts of ops 21 and 23 each occur once in `product/UX_SPECIFICATION.md`, so the ops are not yet applied.

## 1. N1 and S5

| Item | State | Evidence |
|---|---|---|
| **N1** — the account mode drops every device-only clause | **CLOSED** (Figma). ONB-23 **CLOSED on application** (op 21) | Note `250:2080` reads: "sem respostas → questionário no modo com conta → ON-16, sem ON-02 e sem nenhuma frase de 'só neste aparelho' (ON-01b, ON-08, ON-15b, ON-15d): o consentimento de finalidade diz que os dados vão para a conta, para montar o plano, e os consentimentos ficam registrados direto na conta (sem o registro no aparelho, E9)." Op 21 r2 carries the same rule and names the same four frames. |
| **S5** — a way out of the AC-04f draft variants | **CLOSED** | Both variants render a third action, "Não são minhas respostas · Recomeçar". Its links are `459:4952` on `445:13343` and `459:4956` on `445:13387`, both going to ON-01s `386:5170` (the erase sheet). Notes `445:13386` and `445:13429` state the shared-phone reason. In ON-01s, "Apagar e recomeçar" goes to ON-01 with no draft, and "Cancelar" goes to ON-01r, which shows progress only. Neither path leads to a success screen. |

## 2. Ops 21 and 23 (r2)
- **Op 21 (ONB-23): acceptable.**
  - It keeps the rule from round 1: no merge, device answers deleted after a successful sign-in, with a notice. The notice shows only when a draft existed.
  - It routes by account state and adds the N1 rule.
  - It invents no parameters.
- **Op 23 (ONB-11): acceptable.**
  - The explicit purpose act before any detail is unchanged.
  - Without the act, nothing is kept, the answer counts as unknown (never "sem restrição"), and the person can authorize later in Perfil.
  - Limiting the referral line to pain or injury is a Product/UX and SSCTR content choice. It does not weaken any privacy or consent control.
  - The op says "Antes da conta (DR-111)". In the account mode, the general ONB-11 rule still requires an explicit purpose consent at the moment of the question, and N1 makes that consent go to the account. Nothing is lost.

## Other changes reviewed
- **ON-02d note `400:13237`.**
  - If the account found has no plan, the sheet says "Entrar na minha conta" and follows the AC-04 table. That keeps "no merge, erase after success" and the HealthKit-grant rule.
  - Recording the Q4 COULD ("Usar as respostas deste aparelho") as open is correct. It stays optional, and if it is ever adopted, the round-1 conditions apply: after authentication, a preview, an explicit choice and fresh consent.
  - Nit for Product/UX, not Security: when the account has no plan, ON-02c's wording "Seu plano continua o mesmo" does not fit.
- **ON-15 note `122:1546`.**
  - The consent act and the declined-state rules are unchanged.
  - The onboarding no longer asks the reason for a pause, which collects less data.
- **ON-02c `397:13488`.** It renders the one-line notice with a close X and shows none of the erased content.
- **Back links.** ON-02 and ON-02b go back to ON-15. Neither error state links to success.

## Conditions that remain (owners as before)
- **Doc corrections.** Apply r2 ops 1, 6 and 18–23 as prepared, after R6 closes, with the hash checks. If a target changes first, Security re-checks ops 1, 6 and 21–23.
- **G09:**
  - E1–E9;
  - a declined limitation is stored only as unknown;
  - no HealthKit ingestion into an existing account without that account's consent and a confirmation on the device;
  - no reads of `HKBiologicalSex` or `dateOfBirth`;
  - the purchase is bound to the account, and the restore rule.
- **G08:** the provider token is discarded at AC-04f (all three variants) and at ON-02d.
- **G07:**
  - how long an abandoned draft is kept;
  - whether consent in this order satisfies LGPD art. 11, and whether analytics may run before consent;
  - whether the primary consent is a separate act or comes with the terms;
  - the classification and retention of the sex field;
  - the final copy.
- **Real build.** The round-1 checks must run on a real build before implementation can be Security-ready.
