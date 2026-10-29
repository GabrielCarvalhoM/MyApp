# CHECKPOINT — account access (sign-up / sign-in / recovery) · 2026-10-24 → 2026-10-25

**Status: the design is complete and ready for Founder review.** Both independent gates passed for the current revision:
- **UI_READY:** UI judge, round 4.
- **Security PASS / SECURITY_READY for the design:** round 3 plus a confirmation.

This is still an experience candidate. It is not implemented and not promoted (DR-94).
- **Figma:** the new file `TYR10AIrquCpKvKL3eyXyO` only. The legacy Figma is untouched.
- **Scope:** no runtime work, and no decision was reopened.

## Read to resume (in order)
1. `CURRENT_MISSION.md`, NFV1 block.
2. This file.
3. [FOUNDER_REQUEST](FOUNDER_REQUEST.md): V1 account access offers Apple, Google and e-mail + password. Also [ACCOUNT_EMAILS](ACCOUNT_EMAILS.md): the e-mail copy in PT-BR, EN and ES, with its rules.
4. The visual system: `audits/new-figma-identity-pass-2026-10-24/IDENTITY_PASS.md` and Figma page "0 · Direção de identidade".
5. Authority:
   - `product/UX_SPECIFICATION.md`: DEP-14, SURF-13, LAC-14, ONB-03 (18+ before any personal identity), DEG-24;
   - `product/PRODUCT_DECISION_REGISTER.md`: G08, G09, DR-53.

## What exists in the Figma
- **Page 2, section 2.1:**
  - ON-01b Data de nascimento `299:2879` sits between ON-01 and ON-02. Every path that creates an account passes the 18+ step first.
  - ON-11 `121:1030` no longer asks for the date of birth.
  - ON-01 "Começar" goes to ON-01b.
- **Page 2, section 2.2:** ON-V6 `126:1820` is a neutral end. It shows no date and no hint, and has one exit: Fechar → ON-01.
- **Page 2, section 2.4** `250:1688`:
  - **Row 1:** AC-01–11, fixed in place.
  - **Row 2:** AC-02b, AC-03a–d, AC-08a–c and AC-09b, covering code errors, common or leaked passwords, and resend.
  - **Row 3:**
    - AC-04b loading, AC-04c offline, AC-04d e-mail not confirmed, AC-04e keyboard;
    - **AC-04f** `300:2889`, Apple/Google with no account: it creates an account only by explicit choice, shows the terms and passes the 18+ step;
    - AC-10b–d, AC-04 · ES, AC-05s long e-mail;
    - **ON-02b** `300:2971`, provider failure or offline.
  - **AC-04g:** reserved, in notes only, until G08 item 5.
  - Each frame has a note named "Nota · …".
- **Page 2, section 2.5** `280:2845`: the e-mails EM-a–g in PT-BR (a–g plus f1/f2).
- **Page 6:** CF-17 `256:1455`, CF-18 `256:1539`, CF-18b `296:4218`, CF-18c `296:4292` and CF-19 `256:1613`, reached from the CF-01 row "Conta e acesso".
- **Page 8:**
  - map rows: Entrada (ON-01b, AC-01–11, AC-02b–10d, AC-04f/ON-02b, EM-a–g); Você (CF-17–19, AC-10);
  - updated page index;
  - two new navigation answers.
- **Page 9:**
  - **Tokens:** `texto/placeholder` and the fixed brand constants `marca/*`.
  - **New components:**
    - "Botão de provedor" `266:500`: Apple White style, Google Light theme;
    - "Marca · Vilumo" set `294:525`: Tema=Escuro and Tema=Claro;
    - "Logo/Google" `266:488`;
    - icons "Ícone/olho-fechado" `266:479` and "Ícone/carregando" `266:482`.
  - **Updated components:**
    - "Campo de texto": 44 pt icon target and the new variant "Erro com foco" `267:476`;
    - "Campo de código": stretches to the width, new variant Desativado `267:490`;
    - "Campo numérico": label now AA.
  - **Examples** frame `269:476`.
- **Contrast fix across the file:** any text in `texto/terciário` on a `superfície/interna` fill measured 4.40:1. It now uses `texto/secundário` (7.06:1) or `texto/placeholder` (5.02:1), on pages 1–4 and in "Campo numérico". Only the disabled fields remain, which WCAG 1.4.3 exempts.

## Independent reviews (read-only, fresh instances, never the author)
- **Security** (security-privacy-abuse-architect, Opus at high effort):
  - **Round 1:** PASS WITH CONDITIONS (M1–M5).
  - **Round 2:** PASS WITH CONDITIONS. M1–M5 closed; new SHOULD N1–N5 and COULD N6–N11.
  - **Round 3:** PASS WITH CONDITIONS. N1–N11 closed, and the **design side of item 8 is closed**. New SHOULD R1–R2 and COULD R3.
  - **Confirmation:** **PASS / SECURITY_READY for the design.**
- **UI** (UI & Experience Designer judge, Opus 5.5 at max effort):
  - **Round 1:** NOT UI_READY (M1, placeholder contrast).
  - **Round 2:** NOT UI_READY (two SHOULDs).
  - **Round 3:** NOT UI_READY (one MUST, in-field label contrast).
  - **Round 4:** **UI_READY.** Labels measure 7.06:1, values 5.02:1, and no failing pair remains in the file.
- **Product/UX Architect** (Opus 5.5 at max effort), decision ARCH-ACX-r1 on the Apple/Google branches:
  - AC-04f;
  - signing in to an existing account lands where the account is (AC-11 → Hoje);
  - the terms sit next to every action that creates an account;
  - the 18+ step comes before any identity;
  - AC-04g is reserved.
  - The Chief accepted **option 8B as conformance** with ONB-03, DEG-24 and DR-53. The alternative 8A (a provisional account until ON-11) would be a deviation needing a Founder/legal decision.

The reviewers' evidence is in the session scratchpad (`judge/ac-r2..r4`, `architect/`). It is temporary; re-render from the Figma if needed.

## Not done (deliberate)
- **Security C3, an optional Face ID app lock:** a new capability, outside the approved scope.
- **Large-text (Dynamic Type) frames:** not drawn.
- **Empty or picker state for ON-01b:** not drawn; the field uses the iOS date picker.
- **EN and ES e-mail mockups:** not drawn; their copy is complete in ACCOUNT_EMAILS.
- **Terms line "Ao continuar…":** kept word for word on ON-02 and AC-04f. The copy owner and G07 can change both together.
- **Checks not run:** no device or simulator check of VoiceOver, Dynamic Type or autofill. Prototype links were read statically, not played.

## Owned elsewhere: gates before implementation
- **G08/G09:**
  - Security items 1–7: password rule, slowing down attempts, codes, sessions, linking Apple/Google, passkeys and multi-factor, losing access to the e-mail.
  - Pending sign-ups: how long they last, and no link to Apple/Google before confirmation.
  - Each code bound to its own request.
  - AC-04g only when the provider has verified the e-mail.
  - Apple/Google tokens before the 18+ step.
  - A fresh provider re-authentication for AC-10b.
  - The e-mail service's tracking switched off, and SPF/DKIM/DMARC.
  - The age-check method and whether someone may try again after ON-V6, together with DR-53 and the Founder's legal memo.
- **G07:**
  - the e-mail footer;
  - how long an export stays available;
  - deletion timelines;
  - the date of birth kept as plan context, as a record separate from the eligibility result (SEC-J3-02 vs ONB-20);
  - the record of the terms acceptance.
- **Founder/legal, item 9:** a grace period, or a way to undo a deletion made after an account takeover (LGPD). This covers the slots in e-mail (f2). If a grace period exists, signing in during it is an account state that is not designed yet.

## Records
- **Done:**
  - `audits/new-figma-v1-completion-2026-10-23/DELIVERY_REPORT.md`, rows for pages 2, 6, 8 and 9;
  - the Figma page 8 map;
  - a status line in the NFV1 block of `CURRENT_MISSION.md`;
  - an entry in `MISSION_LEDGER.md`.
- **Pending: PDR DR-110.**
  - Why it is not applied: the concurrent DOMAIN CLOSURE R3 mission runs R2's verifier (`npm run verify`). That verifier fails on any change to `product/PRODUCT_DECISION_REGISTER.md`, which is part of R2's baseline.
  - When to apply: after R3's final verification, or when the Founder says so.
  - Text, ready to add after DR-109, with the source line updated:

    > | DR-110 | V1 account access offers Apple, Google and e-mail + password. Every path that creates an identity passes the 18+ step first (ON-01b), as DR-53, UXS ONB-03 and DEG-24 already require. Security parameters stay with G08/G09; deletion timelines with G07. | Founder decision 2026-10-24 ([request](../audits/new-figma-account-access-2026-10-24/FOUNDER_REQUEST.md)). Experience in the new Figma: AC-01–11 and their states, ON-01b, AC-04f, CF-17–19, and e-mails EM-a–g ([copy](../audits/new-figma-account-access-2026-10-24/ACCOUNT_EMAILS.md)). Independent design gates: UI_READY and Security PASS (design only). Open: item 9 (deletion after an account takeover) with Founder/legal; AC-04g with G08 item 5. |

## Next step (Founder)
1. Review the design in the Figma: page 2, sections 2.1, 2.4 and 2.5; page 6, CF-17–19.
2. Decide item 9.
3. Say whether to apply DR-110 now, or after R3.
4. Optionally confirm 8B, or ask for 8A, which needs a legal decision.

Promotion to the final Experience/Design Source of Truth, and any implementation, still need explicit Founder authorization.
