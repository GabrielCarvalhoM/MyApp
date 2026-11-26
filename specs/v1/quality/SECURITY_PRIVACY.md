# Segurança, privacidade e segurança do atleta

## 1. Atleta
- `REAL_ATHLETE_READY = NO` até os critérios explícitos (motor real, iPhone, revisão clínica dos textos `*.interim`, G04).
- Sob `blocked`, `outsideV1Scope`, `clinicalHumanRequired`, `screenRequired`: nenhum passo, carga, alvo ou "Começar".
- **Decisão provisória do fundador (26/11):** corrida avulsa não inicia sob bloqueio clínico, condição fora do escopo da V1 ou avaliação
  de sintomas pendente, até decisão técnica autorizada em contrário (fecha QRE P1-11 provisoriamente).
- Texto clínico fica `CLINICAL_HUMAN_REQUIRED`; agente não aprova redação clínica.
- Nada reduz proteção de segurança sem aprovação do fundador.

## 2. Dados
- O repositório é **público**: nenhum dado pessoal ou de saúde em issues, logs, screenshots, fixtures, commits. Dado real no iPhone:
  só contagens em log.
- Fixtures são sintéticas (atleta fictício "Lucas Andrade").
- Persistência local com proteção de arquivo (`completeUntilFirstUserAuthentication` ou mais forte), excluída do backup quando o contrato
  exige; exclusão de conta apaga gravações de C, registro de A e fila de B (G07).
- HealthKit: só leitura na V1; escrita (DR-121, #23) pendente do fundador.
- Proveniência de atividade importada é preservada (origem do app/dispositivo); corrida de terceiros pelo Apple Saúde é aceita (política
  OPEN-1 do fundador), sem contar duas vezes a mesma corrida física e sem fundir corridas distintas só por proximidade de horário.

## 3. Engenharia
- Sem segredos no repositório (gitleaks no CI). CI com token só-leitura, sem runner self-hosted.
- Nenhum `import` proibido em RepMileUI (HealthKit, JavaScriptCore, CryptoKit, Security, CoreLocation).
- Contrato compartilhado, CoachingCore e governança só pelo processo §11 / emenda versionada.
