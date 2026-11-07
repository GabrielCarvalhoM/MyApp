# F08: menor delta de autoridade e missão curta de seguimento (preparada na Fase 3.5)

**Natureza:** preparação. Este documento não autoriza nada, não muda runtime, contrato nem governança, e não resolve o F08.

**Estado do F08:** **`F08_OPEN`** (BLOCKED_BY_AUTHORITY, F08-BLOCK-G04). Isso vale até a mudança de autoridade abaixo ser aprovada e implementada.

**Fontes:**
- a decisão do Founder D2 (`../FOUNDER_DECISIONS_PHASE35.md`), que é o gatilho T2 do `PCG-R7D-F08-r1`;
- `../../phase34/policy/PCG_F08_AUTHORITY_R7D.md`;
- `../../phase34/f08/F08_RETURN_PROPOSAL.md`, com os estados S1–S7;
- o benchmark da Fase 3.4;
- DR-99, AEC §7 e AEOS regra 4.

Não há pesquisa nova.

## 1. Proteções clínicas indispensáveis × restrições arquiteturais excessivas

| Fica (indispensável) | Sai na V1 (excessivo) |
|---|---|
| O app nunca diagnostica, nunca emite nem sugere liberação médica, nunca valida documento | Bloqueio permanente, sem saída, até existir um profissional G04 no projeto |
| Sinal atual relevante (dor, doença, lesão, limitação funcional, preocupação clínica) leva à recomendação de avaliação profissional, a qualquer momento | Liberação qualificada (atestado, upload, verificação) como única saída de toda pausa de causa clínica |
| Contraindicação ou restrição conhecida limita a prescrição até o atleta informar que acabou | Proibir que a declaração ativa de prontidão do atleta abra um recomeço esportivo |
| Recomeço conservador: cargas e ritmos antigos não voltam sem evidência; o retorno por classe e o teto continuam | Proibir um plano novo (avaliação atualizada) como saída |
| Gatilhos de retorno à rota clínica durante o recomeço; os sinais relevantes nunca são ignorados | Suspender as duas modalidades quando a restrição é de uma só |
| R-F08-1 continua: trocar o motivo para não clínico nunca é saída | — |
| A história do episódio clínico é só acréscimo, e o histórico e os recordes ficam preservados | — |

## 2. Menor delta de contratos e governança (aprovar antes de qualquer runtime)

| # | Artefato | Delta mínimo | Dono |
|---|---|---|---|
| G1 | PDR: nova DR com o D2 (número atribuído na sincronização do canon) | Registra a doutrina. Supera **em parte** o DR-99: o juízo clínico (diagnóstico, liberação, restrição clínica) segue fora do software. Depois da declaração ativa de prontidão do atleta, com triagem atual, o produto pode oferecer um recomeço esportivo conservador, que não é liberação | Founder; PCG formaliza |
| G2 | AEC §7 ("restrição clínica exige resolução competente; sem liberação por … checkbox de risco") | Uma restrição conhecida limita a prescrição e nunca é ignorada. A declaração ativa de prontidão (respostas de triagem, não uma caixa de seleção) abre um recomeço conservador e não é liberação. O resto do §7 fica | PCG |
| G3 | AEOS regra 4 ("não perguntar ao usuário por clearance") | **Inalterada.** O app pergunta prontidão e sinais atuais, nunca pede liberação | — |
| G4 | PDR §5, linha G04 | G04 mantém o clínico. As proteções do caminho de prontidão (triagem, vocabulário fechado de restrições esportivas, gatilhos, entrada) entram no escopo não clínico do SSCTR e voltam à revalidação humana financiada | Founder / PCG |
| G5 | `PCG-R7D-F08-r1`, re-revisão por T2 | P-2, P-3 e C02 cedem só para o caminho de prontidão. C01 fica, porque a entrada nova não é clearance (sem emissor, sem verificação, sem "liberado"). R-F08-1 fica. C06 passa a oferecer o recomeço | PCG, instância nova |
| G6 | Decisão SSCTR | (a) Situação 1: os modos de redução de 3–14 dias como operações sobre as doses existentes, e as três velocidades de retomada dentro das receitas e tetos existentes, **sem número novo** (se faltar evidência para uma delas, ela não entra); (b) Situação 2: entrada por modalidade a partir da classe da própria pausa, com gatilhos; (c) Situação 3: plano novo pela avaliação inicial existente, com o histórico preservado | SSCTR |
| G7 | Security/Privacy e G07 | Declaração, triagem e restrições são dado de saúde: minimização, finalidade, consentimento e retenção. Não há upload de documento na V1 | Security; G07 |
| G8 | Copy (Product/UX) | "Você informou que está pronto para voltar", nunca "liberado". As velocidades de retomada são diferentes dos perfis de treinador | Product/UX |
| G9 | PREREG e INTERFACE (com o runtime F08) | Substituem o Δ12 do PREREG-6 para o caminho de prontidão. Novos casos P02: nenhum retorno sem declaração, nenhum com sinal atual, restrições respeitadas | Chief / harness |

## 3. Missão curta: `DOMAIN_COACHING_R7-F08`

Depois do fechamento técnico da Fase 3.5. A prioridade do Founder continua sendo o holdout. Esta missão pode correr antes ou depois dele, por decisão do Founder.

1. **Autoridade:**
   - a DR do Founder (G1);
   - a re-revisão PCG (G5);
   - a decisão SSCTR (G6);
   - Security antes de qualquer entrada (G7).

   Os quatro são proporcionais e não abrem programa de pesquisa.
2. **Runtime** (só depois do passo 1):
   - **(R1)** a entrada `readiness` (episódio, recuperado, triagem atual, restrições por modalidade em vocabulário fechado), com a transição S3 → S6 pela declaração (no lugar do S5 de liberação) e S6 → S3 diante de qualquer sinal novo;
   - **(R2)** o S2 com os modos de redução escolhidos e a velocidade de retomada;
   - **(R3)** a Situação 3 como plano novo pela avaliação inicial existente, preservando o registro;
   - **(R4)** suspensão e retomada por modalidade.
3. **Testes dirigidos:**
   - sem declaração, o episódio segue clínico;
   - declaração com sinal atual: segue clínico e recomenda avaliação;
   - declaração limpa: recomeço conservador, sem cargas antigas;
   - restrição respeitada;
   - uma modalidade suspensa e a outra ativa;
   - sintoma recorrente: volta ao S3;
   - troca de motivo segue sem saída (R-F08-1);
   - histórico preservado;
   - as velocidades nunca passam dos tetos.
4. **Revisões:** SSCTR e QRE estreitos sobre o commit. Product/UX só para a copy.
5. **Freeze:** só se as duas revisões aprovarem. O F08 é então declarado resolvido no runtime de referência. A prontidão comercial continua separada (D1.5).

**STOP_WHEN:**
- os testes do passo 3 passam;
- os revisores aprovam;
- o F08 tem saída legítima, sem perda das proteções da coluna esquerda do §1.

**ESCALATE_IF:**
- qualquer necessidade de documento médico;
- alegação de liberação pelo app;
- um sinal relevante ignorado;
- um número novo sem evidência.

Nesses casos, o caso volta ao Founder.
