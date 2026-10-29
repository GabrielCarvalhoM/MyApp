# Account e-mails — copy in PT-BR, EN and ES (2026-10-24)

Status: **candidate copy, awaiting the Security re-check** (Security review M5 and S6). This file is the text source for the e-mails. The PT-BR mockups are in the new Figma `TYR10AIrquCpKvKL3eyXyO`, page 2, section "2.5 · E-mails da conta". These are experience artifacts. They are not Product Truth, legal text, or an implemented template.

Scope: transactional account-security e-mails only, items (a)–(g) of the Security review. No marketing e-mail.

Parameters stay with their gates and are never invented here:
- **G08/G09:** code validity, attempt and resend limits, sender address, domain authentication, and the session rules behind "we signed you out".
- **G07:** retention, deletion timelines and legal footer.
- **Founder/legal:** undoing a deletion after an account takeover (CHECKPOINT item 9).

## Rules for every account e-mail

1. **Purpose first.** The first sentence says why the e-mail arrived.
2. **Codes.**
   - The code appears once, in the body, never in the subject or the preview text, because those show on the lock screen.
   - The preview is a hidden preheader padded with invisible filler characters. Mail clients then never fill the notification snippet with body text, and the code stays out of the snippet.
   - Every code e-mail states what the code is for.
   - Every code e-mail carries three sentences, shown with emphasis rather than as small print: do not share the code; Vilumo never asks for it by message or phone; if it wasn't you, ignore the e-mail.
   - The space in `482 917` is visual only: copied text carries no space, and the app's code field ignores spaces and separators.
3. **No links and no attachments.** Every action happens in the app. This protects against phishing look-alikes, and for the export it follows DEP-14 (download inside the authenticated app). The footer tells people this, so that a look-alike e-mail with a link stands out.
4. **No tracking.**
   - No open-tracking pixel, no click tracking, no remote images.
   - The brand and headings use the system font, or a font served from a host that carries no per-recipient identifier.
   - Tracking defaults of the sending service are switched off (Engineering, G08/G09).
5. **Minimal data.** Device model and time only, never location. Never the e-mail address or a code in push or lock-screen content (Security C4).
6. **No account enumeration.**
   - The app responds the same way whether or not an account exists (AC-03, AC-07, AC-08). The e-mail may differ, because only the mailbox owner reads it.
   - A reset request for an e-mail with no account sends nothing; G08 confirms this.
   - **Only a confirmed e-mail counts as an account.** An unconfirmed sign-up is pending, not an account.
     - A new sign-up with the same e-mail gets (a) again.
     - Each code confirms only the password sent with its own request: a later sign-up never changes the password tied to an earlier code.
     - A reset request for a pending sign-up sends nothing.
   - This stops someone from blocking the real owner by registering their e-mail first. How long a pending sign-up lasts, and the rule that it is never merged with Apple/Google before confirmation, are G08.
7. **Language parity (DR-103).** PT-BR, EN and ES carry the same content. Send in the language of the app at the time of the request.
8. **Slots.** Text in `{braces}` is filled by the system. A slot marked G07, G08 or G09 waits for that gate and must not be filled with an invented value. The digits `482 917` are illustrative.
9. **Neutral greeting.** No gendered words. When the account has no name yet (sign-up), use the greeting without a name.
10. **Menu and button names** follow the app's string catalogue.
    - EN "You" and ES "Tú" stand in for "Você".
    - "Já tenho conta" (the ON-01 button that leads to sign-in) appears as EN "I already have an account" and ES "Ya tengo una cuenta" until the localized catalogue exists.

Common footer (the first sentence is part of the anti-phishing rule 3):
- PT-BR: "Os e-mails de conta do Vilumo nunca trazem links nem pedem seus códigos. E-mail automático sobre a sua conta do Vilumo. Não responda a esta mensagem. {Razão social e endereço — G07}"
- EN: "Vilumo account emails never contain links or ask for your codes. Automatic email about your Vilumo account. Please don't reply to this message. {Company name and address — G07}"
- ES: "Los correos de cuenta de Vilumo nunca incluyen enlaces ni piden tus códigos. Correo automático sobre tu cuenta de Vilumo. No respondas a este mensaje. {Razón social y dirección — G07}"

---

## (a) Sign-up code

Sent when someone taps "Criar conta" (AC-01) with an e-mail that has no confirmed account. This includes an e-mail with only a pending sign-up (rule 6). The app shows AC-03.

**PT-BR**
- Assunto: Confirme seu e-mail no Vilumo
- Prévia: Use o código no app para criar sua conta.
- Corpo:
  > Olá!
  >
  > Use este código no app Vilumo para confirmar seu e-mail e criar sua conta:
  >
  > **482 917**
  >
  > Ele vale por pouco tempo.
  >
  > Não compartilhe este código. O Vilumo nunca pede seu código por mensagem ou telefone.
  >
  > Se não foi você, ignore este e-mail: nenhuma conta é criada sem o código.

**EN**
- Subject: Confirm your email for Vilumo
- Preview: Use the code in the app to create your account.
- Body:
  > Hi!
  >
  > Use this code in the Vilumo app to confirm your email and create your account:
  >
  > **482 917**
  >
  > It's only valid for a short time.
  >
  > Don't share this code. Vilumo never asks for your code by message or phone.
  >
  > If this wasn't you, ignore this email: no account is created without the code.

**ES**
- Asunto: Confirma tu correo en Vilumo
- Vista previa: Usa el código en la app para crear tu cuenta.
- Cuerpo:
  > ¡Hola!
  >
  > Usa este código en la app de Vilumo para confirmar tu correo y crear tu cuenta:
  >
  > **482 917**
  >
  > Solo es válido por poco tiempo.
  >
  > No compartas este código. Vilumo nunca te pide tu código por mensaje ni por teléfono.
  >
  > Si no fuiste tú, ignora este correo: no se crea ninguna cuenta sin el código.

## (b) "You already have an account"

Sent instead of (a) when the e-mail already has a confirmed account. The app still shows AC-03, so the screen reveals nothing; the person leaves through "Já tenho conta? Entrar".

**PT-BR**
- Assunto: Você já tem uma conta no Vilumo
- Prévia: Entre com este e-mail. Não é preciso criar outra conta.
- Corpo:
  > Olá!
  >
  > Alguém tentou criar uma conta no Vilumo com este e-mail, mas ele já tem uma conta.
  >
  > Sua conta entra com {e-mail e senha | a Apple | o Google}.
  >
  > Para continuar, abra o app e toque em “Já tenho conta”. Se não lembra a senha, toque em “Esqueci minha senha”.
  >
  > Se não foi você, ignore este e-mail. Nada mudou na sua conta.

**EN**
- Subject: You already have a Vilumo account
- Preview: Sign in with this email. There's no need to create another account.
- Body:
  > Hi!
  >
  > Someone tried to create a Vilumo account with this email, but it already has an account.
  >
  > Your account signs in with {email and password | Apple | Google}.
  >
  > To continue, open the app and tap "I already have an account". If you don't remember your password, tap "Forgot password".
  >
  > If this wasn't you, ignore this email. Nothing changed in your account.

**ES**
- Asunto: Ya tienes una cuenta en Vilumo
- Vista previa: Inicia sesión con este correo. No hace falta crear otra cuenta.
- Cuerpo:
  > ¡Hola!
  >
  > Alguien intentó crear una cuenta en Vilumo con este correo, pero ya tiene una cuenta.
  >
  > Tu cuenta inicia sesión con {correo y contraseña | Apple | Google}.
  >
  > Para continuar, abre la app y toca "Ya tengo una cuenta". Si no recuerdas la contraseña, toca "Olvidé mi contraseña".
  >
  > Si no fuiste tú, ignora este correo. Nada cambió en tu cuenta.

## (c) Password reset code

Sent after "Enviar código" (AC-07) for an account that has a password. The app shows AC-08.

**PT-BR**
- Assunto: Código para redefinir sua senha do Vilumo
- Prévia: Use o código no app para criar uma nova senha.
- Corpo:
  > Olá, {nome}.
  >
  > Use este código no app Vilumo para redefinir a senha da sua conta:
  >
  > **482 917**
  >
  > Ele vale por pouco tempo.
  >
  > Não compartilhe este código. O Vilumo nunca pede seu código por mensagem ou telefone.
  >
  > Se não foi você, ignore este e-mail: sua senha continua a mesma.

**EN**
- Subject: Code to reset your Vilumo password
- Preview: Use the code in the app to create a new password.
- Body:
  > Hi {name},
  >
  > Use this code in the Vilumo app to reset your account password:
  >
  > **482 917**
  >
  > It's only valid for a short time.
  >
  > Don't share this code. Vilumo never asks for your code by message or phone.
  >
  > If this wasn't you, ignore this email: your password stays the same.

**ES**
- Asunto: Código para restablecer tu contraseña de Vilumo
- Vista previa: Usa el código en la app para crear una nueva contraseña.
- Cuerpo:
  > Hola, {nombre}:
  >
  > Usa este código en la app de Vilumo para restablecer la contraseña de tu cuenta:
  >
  > **482 917**
  >
  > Solo es válido por poco tiempo.
  >
  > No compartas este código. Vilumo nunca te pide tu código por mensaje ni por teléfono.
  >
  > Si no fuiste tú, ignora este correo: tu contraseña sigue igual.

## (d) "Your account signs in with Apple/Google"

Sent instead of (c) when the account has no password. The app still shows AC-08.

**PT-BR**
- Assunto: Sua conta do Vilumo entra com {a Apple | o Google}
- Prévia: Ela não usa senha. Entre pelo botão {da Apple | do Google} no app.
- Corpo:
  > Olá, {nome}.
  >
  > Recebemos um pedido para redefinir a senha desta conta, mas ela não usa senha: você entra com {a Apple | o Google}.
  >
  > Abra o app, toque em “Já tenho conta” e escolha “Continuar com {a Apple | o Google}”.
  >
  > Se não foi você, ignore este e-mail. Nada mudou na sua conta.

**EN**
- Subject: Your Vilumo account signs in with {Apple | Google}
- Preview: It doesn't use a password. Sign in with the {Apple | Google} button in the app.
- Body:
  > Hi {name},
  >
  > We received a request to reset the password for this account, but it doesn't use a password: you sign in with {Apple | Google}.
  >
  > Open the app, tap "I already have an account" and choose "Continue with {Apple | Google}".
  >
  > If this wasn't you, ignore this email. Nothing changed in your account.

**ES**
- Asunto: Tu cuenta de Vilumo inicia sesión con {Apple | Google}
- Vista previa: No usa contraseña. Inicia sesión con el botón de {Apple | Google} en la app.
- Cuerpo:
  > Hola, {nombre}:
  >
  > Recibimos una solicitud para restablecer la contraseña de esta cuenta, pero no usa contraseña: inicias sesión con {Apple | Google}.
  >
  > Abre la app, toca "Ya tengo una cuenta" y elige "Continuar con {Apple | Google}".
  >
  > Si no fuiste tú, ignora este correo. Nada cambió en tu cuenta.

## (e) "Your password was changed — wasn't you?"

Sent after a reset (AC-09) or a change (CF-18), so only to accounts that have a password. The sentence about the other devices applies only if G08 confirms the recommended default from Security M4 (end the other sessions); the mockup marks it as a dependency.

**PT-BR**
- Assunto: Sua senha do Vilumo foi alterada
- Prévia: Se não foi você, crie uma nova senha agora.
- Corpo:
  > Olá, {nome}.
  >
  > A senha da sua conta do Vilumo foi alterada em {data e hora}, em um {aparelho}. Por segurança, saímos da sua conta nos outros aparelhos.
  >
  > Se foi você, está tudo certo.
  >
  > Se não foi você, abra o app, toque em “Já tenho conta” → “Esqueci minha senha” e crie uma nova senha. Depois, confira seus aparelhos em Você → Conta e acesso.
  >
  > O Vilumo nunca pede sua senha ou seus códigos por mensagem ou telefone.

**EN**
- Subject: Your Vilumo password was changed
- Preview: If this wasn't you, create a new password now.
- Body:
  > Hi {name},
  >
  > Your Vilumo account password was changed on {date and time}, on an {device}. To keep your account safe, we signed you out on your other devices.
  >
  > If this was you, you're all set.
  >
  > If this wasn't you, open the app, tap "I already have an account" → "Forgot password" and create a new password. Then check your devices in You → Account and access.
  >
  > Vilumo never asks for your password or codes by message or phone.

**ES**
- Asunto: Se cambió tu contraseña de Vilumo
- Vista previa: Si no fuiste tú, crea una nueva contraseña ahora.
- Cuerpo:
  > Hola, {nombre}:
  >
  > La contraseña de tu cuenta de Vilumo se cambió el {fecha y hora}, en un {dispositivo}. Por seguridad, cerramos tu sesión en los demás dispositivos.
  >
  > Si fuiste tú, todo está bien.
  >
  > Si no fuiste tú, abre la app, toca "Ya tengo una cuenta" → "Olvidé mi contraseña" y crea una nueva contraseña. Después, revisa tus dispositivos en Tú → Cuenta y acceso.
  >
  > Vilumo nunca te pide tu contraseña ni tus códigos por mensaje ni por teléfono.

## (f1) Data export ready

Sent when the export requested after AC-10c is ready. There is no link and no attachment: the download happens in the app, after the identity check (DEP-14).

**PT-BR**
- Assunto: Seus dados do Vilumo estão prontos
- Prévia: Baixe o arquivo dentro do app.
- Corpo:
  > Olá, {nome}.
  >
  > O arquivo com seus dados está pronto. Para baixar, abra o app e vá em Você → Dados e privacidade.
  >
  > Por segurança, este e-mail não traz link nem anexo, e o app confirma que é você antes do download.
  >
  > {Por quanto tempo o arquivo fica disponível — G07}
  >
  > Se você não pediu seus dados, abra o app e troque sua senha em Você → Conta e acesso. [Conta Apple/Google: em Você → Conta e acesso → Aparelhos conectados, toque em “Sair de todos os outros aparelhos” e revise a segurança da sua conta {Apple | Google}.]

**EN**
- Subject: Your Vilumo data is ready
- Preview: Download the file inside the app.
- Body:
  > Hi {name},
  >
  > The file with your data is ready. To download it, open the app and go to You → Data and privacy.
  >
  > For your security, this email has no link or attachment, and the app confirms it's you before the download.
  >
  > {How long the file stays available — G07}
  >
  > If you didn't request your data, open the app and change your password in You → Account and access. [Apple/Google account: in You → Account and access → Connected devices, tap "Sign out of all other devices" and review the security of your {Apple | Google} account.]

**ES**
- Asunto: Tus datos de Vilumo están listos
- Vista previa: Descarga el archivo dentro de la app.
- Cuerpo:
  > Hola, {nombre}:
  >
  > El archivo con tus datos está listo. Para descargarlo, abre la app y ve a Tú → Datos y privacidad.
  >
  > Por seguridad, este correo no incluye enlaces ni adjuntos, y la app confirma que eres tú antes de la descarga.
  >
  > {Cuánto tiempo está disponible el archivo — G07}
  >
  > Si no pediste tus datos, abre la app y cambia tu contraseña en Tú → Cuenta y acceso. [Cuenta de Apple/Google: en Tú → Cuenta y acceso → Dispositivos conectados, toca "Cerrar sesión en todos los demás dispositivos" y revisa la seguridad de tu cuenta de {Apple | Google}.]

## (f2) Account deletion requested

Sent after "Apagar conta" (CF-11 → AC-10). Scope, timelines and legal retention depend on G07 (DR-108). Whether there is a window to undo after an account takeover is a Founder/legal decision (CHECKPOINT item 9). Until both are decided, this e-mail is a structure with marked slots.

**PT-BR**
- Assunto: Recebemos o pedido para apagar sua conta do Vilumo
- Prévia: Veja o que acontece com seus dados.
- Corpo:
  > Olá, {nome}.
  >
  > Recebemos em {data e hora} o pedido para apagar sua conta do Vilumo e seus dados.
  >
  > {O que é apagado, quando, e o que precisa ser mantido por obrigação legal — G07}
  >
  > {Se houver prazo para desfazer: como e até quando — decisão do Founder/jurídico}
  >
  > Se não foi você, {canal de ajuda — a definir com o item 9}.

**EN**
- Subject: We received the request to delete your Vilumo account
- Preview: Here's what happens to your data.
- Body:
  > Hi {name},
  >
  > On {date and time} we received the request to delete your Vilumo account and your data.
  >
  > {What is deleted, when, and what must be kept by law — G07}
  >
  > {If there is a window to undo: how and until when — Founder/legal decision}
  >
  > If this wasn't you, {help channel — to be defined with item 9}.

**ES**
- Asunto: Recibimos la solicitud para eliminar tu cuenta de Vilumo
- Vista previa: Esto es lo que pasa con tus datos.
- Cuerpo:
  > Hola, {nombre}:
  >
  > El {fecha y hora} recibimos la solicitud para eliminar tu cuenta de Vilumo y tus datos.
  >
  > {Qué se elimina, cuándo y qué debe conservarse por ley — G07}
  >
  > {Si hay un plazo para deshacer: cómo y hasta cuándo — decisión del Founder/jurídico}
  >
  > Si no fuiste tú, {canal de ayuda — a definir con el ítem 9}.

## (g) "New sign-in on an iPhone — wasn't you?"

Sent on the first sign-in on a new device (AC-11). For an Apple or Google account, the last paragraph uses the variant in brackets.

**PT-BR**
- Assunto: Novo acesso à sua conta do Vilumo
- Prévia: Sua conta entrou em um {iPhone}. Foi você?
- Corpo:
  > Olá, {nome}.
  >
  > Sua conta do Vilumo entrou em um novo aparelho: {iPhone}, em {data e hora}.
  >
  > Se foi você, não precisa fazer nada.
  >
  > Se não foi você, troque sua senha agora: no app, Você → Conta e acesso → Alterar senha. Depois, em Aparelhos conectados, toque em “Sair de todos os outros aparelhos”. [Conta Apple/Google: em Aparelhos conectados, toque em “Sair de todos os outros aparelhos” e revise a segurança da sua conta {Apple | Google}.]
  >
  > O Vilumo nunca pede sua senha ou seus códigos por mensagem ou telefone.

**EN**
- Subject: New sign-in to your Vilumo account
- Preview: Your account was signed in on an {iPhone}. Was this you?
- Body:
  > Hi {name},
  >
  > Your Vilumo account was signed in on a new device: {iPhone}, on {date and time}.
  >
  > If this was you, there's nothing to do.
  >
  > If this wasn't you, change your password now: in the app, go to You → Account and access → Change password. Then, in Connected devices, tap "Sign out of all other devices". [Apple/Google account: in Connected devices, tap "Sign out of all other devices" and review the security of your {Apple | Google} account.]
  >
  > Vilumo never asks for your password or codes by message or phone.

**ES**
- Asunto: Nuevo inicio de sesión en tu cuenta de Vilumo
- Vista previa: Se inició sesión en tu cuenta en un {iPhone}. ¿Fuiste tú?
- Cuerpo:
  > Hola, {nombre}:
  >
  > Se inició sesión en tu cuenta de Vilumo en un dispositivo nuevo: {iPhone}, el {fecha y hora}.
  >
  > Si fuiste tú, no tienes que hacer nada.
  >
  > Si no fuiste tú, cambia tu contraseña ahora: en la app, ve a Tú → Cuenta y acceso → Cambiar contraseña. Después, en Dispositivos conectados, toca "Cerrar sesión en todos los demás dispositivos". [Cuenta de Apple/Google: en Dispositivos conectados, toca "Cerrar sesión en todos los demás dispositivos" y revisa la seguridad de tu cuenta de {Apple | Google}.]
  >
  > Vilumo nunca te pide tu contraseña ni tus códigos por mensaje ni por teléfono.

---

## Open dependencies (owned elsewhere, not decided here)

- **G08/G09:**
  - code validity: replace "pouco tempo" with the exact minutes once fixed, in all three languages;
  - attempt and resend limits;
  - whether a reset request for an e-mail with no account sends nothing;
  - whether a password change ends the other sessions (M4 default: yes);
  - sender address and domain authentication (SPF/DKIM/DMARC);
  - Apple "Hide My Email" relay addresses and linking Apple/Google to an e-mail account;
  - pending (unconfirmed) sign-ups: how long they last, and that they are never merged with Apple/Google before confirmation (rule 6);
  - the provider re-authentication behind AC-10b: the Apple/Google sign-in time must fall inside the re-authentication window, and Google must actually prompt;
  - the sending service's tracking defaults (opens, clicks, remote images) switched off (rule 4), and the padded preheader (rule 2);
  - each confirmation code bound to the password of its own request (rule 6; item 3);
  - the AC-04g branch (the provider e-mail already has an account): only when the provider vouches for the e-mail (for Google, `email_verified=true`); otherwise AC-04f. Never link or merge, never show the e-mail;
  - Apple/Google tokens before the 18+ step passes: used only to look up the account, with no code exchange, nothing stored on the server and no provider e-mail in logs.
- **G07:** export availability window, deletion scope and timelines, legal retention, and the legal footer.
- **Founder/legal (CHECKPOINT items 8 and 9):**
  - the identity exists before the 18+ check at ON-11 (DR-53);
  - a grace period or reversal for a deletion made after an account takeover (LGPD).
  - These decide parts of (a) and (f2).
