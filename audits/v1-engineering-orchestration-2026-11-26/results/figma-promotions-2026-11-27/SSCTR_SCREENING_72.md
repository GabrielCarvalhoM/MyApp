# SSCTR — triagem × sinais de alerta na tela 72 (#114 A5/K27), 27/11

Revisor: SSCTR-1.0.0, PROVISIONAL_INTERNAL_DOMAIN_AUTHORITY, uma instância, só leitura. Não é revisão humana nem clínica.

**Veredito: as duas listas continuam separadas.** Nenhuma das seis chaves da triagem (`pain`, `persistentPain`, `injury`, `illness`,
`functionalLimitation`, `clinicalConcern`; `r6-intake.mjs:20`, lidas em `r6-adaptation.mjs:554-559`) pode ser respondida a partir dos
sinais de alerta (`v1-f08.mjs`) sem inferir. Cada sinal é mais estreito que a chave parecida (W8 "Lesão por queda ou pancada" ≠ "Lesão";
W6 só limitação por dor; nenhum sinal mede persistência; "Outra preocupação" é aberta). O inverso também falha: W2, W3, W4, W5 e X1
definem a urgência, que "Dor" não carrega. A lista tem 9, 13 ou 15 itens conforme a condição (`signsFor`).

**Respostas presumidas (proibidas, #114):** preencher uma chave a partir de um sinal; pré-preencher ou trazer resposta de outra etapa; um
"não para todos"; deixar "Confirmo: nenhum desses itens se aplica a mim agora" marcar as seis (só habilita depois das seis respondidas "Não").

**"Evitar repetição":** atendido perguntando as seis uma vez por relato, no fim, e nunca de novo no mesmo relato. Juntar visualmente num
cartão compacto com dois grupos rotulados é decisão de Produto/UX; juntar o significado não. Reaproveitar triagem entre relatos é o #68.

**Defeito de segurança encontrado:** triagem com "Sim" + sinal urgente rebaixa a orientação para PROFESSIONAL_ASSESSMENT → **#124**
(Founder Decision, P0; correção preparada em branch sem merge).

Revisar de novo se `CLINICAL_KEYS` ou `WARNING_SIGNS` mudarem, se a redação das seis mudar, se o #68 for decidido ou se o #124 for corrigido.
