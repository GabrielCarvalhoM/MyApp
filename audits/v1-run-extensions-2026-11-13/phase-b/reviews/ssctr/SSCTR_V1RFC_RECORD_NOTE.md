# SSCTR — nota de emissão dos registros habilitadores da fase B — 2026-11-16

**Decisão: EMITIDOS**, só para dados sintéticos, os registros de `V1X-RUN-FORECAST` e `V1X-PACE-INSIGHTS`, em `SSCTR_V1RFC_RUN_RECORDS.json`. Ambos são `APPROVE_WITH_CONDITIONS` / `SUPPORTED_WITH_LIMITS` e estão amarrados aos valores `eae01117…e840` e aos quatro arquivos de runtime de `0d3015b`.

- **Não há registro de `V1X-PACE-REVISION`.** O arquivo diz que nenhum registro dela vale sobre estes bytes: ela não está aprovada e não falha fechado.
- **Isto não é um freeze.**

## Por que emiti

- **Os três juízes** liberam a previsão e os insights sem bloqueio. Li inteiros:
  - `QRE_V1RFC_RECHECK_R2` (READY_WITH_CONDITIONS);
  - `SEC_V1RFC_FOCAL_R2` (PASS_WITH_CONDITIONS);
  - a minha `SSCTR_V1RFC_RECHECK_R2` (ACCEPT_WITH_CONDITIONS).
- **QRE-RFC-B-02 não muda a minha decisão.**
  - O caso é um restart no mesmo dia, numa semana e numa sessão.
  - A linha creditada é uma corrida feita de fato naquela semana do calendário. No caso do juiz, a = 0,43 dá f = 0 de ganho.
  - Fica como condição antes de integração ou atleta real.
- **SEC-RFC-B-01 não muda a minha decisão.**
  - É da classe de custódia, e os insights só observam.
  - Endosso, do lado esportivo, a recomendação de ler o formato que a execução cita. É a leitura mais exata da faixa que o atleta recebeu; fica para um sucessor.
- **SEC-RFC-B-02, QRE-RFC-B-01 e B-03:** custódia e revisão. Viajam como condições.

## O que o leitor deu

`runForecastAuthority()` sem opções, com o arquivo presente:
- `valid` true, sha `eae01117…e840`, `source` CURRENT_INDEPENDENT_REVIEW;
- `allowsForecast`: FORECAST **true**, INSIGHTS **true**, REVISION **false**.

O teste "activation fails closed…" passa (`test/v1rfc-entry.test.mjs` 15/15), e a suíte da extensão inteira dá 85/85 com o arquivo presente.

## O que o encerramento e o freeze devem copiar

As condições estão no texto dos registros. O freeze deve dizer também o que a SEC-RFC-B-03 e a QRE R2 (seção 5) pedem:
- a revisão está implementada, desligada, **não aprovada**, e **não falha fechado**, com os abertos nomeados;
- nenhum registro dela vale sobre estes bytes;
- o verificador falha se houver um registro com `boundaryId: V1X-PACE-REVISION`;
- fechar qualquer condição da revisão exige um freeze sucessor;
- a garantia "nunca mostrada alterada" e a faixa entregue valem só sob custódia.

**Fila humana:** HQ-RFC-SSCTR-FORECAST e HQ-RFC-SSCTR-INSIGHTS ficam só propostas. A fila é decisão do Founder (F-8).
