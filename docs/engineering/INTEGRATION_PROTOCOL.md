# Protocolo de integração A · B · C

Complementa o contrato paralelo §4 de `PARALLEL_BRANCH_STRATEGY.md`, §11 (mudança de contrato) e §13 (integração). Não os substitui.

## 1. Fluxo

1. A frente conclui um incremento, roda os testes, faz commit e push, abre ou atualiza o PR (para a branch da frente) e publica o
   relatório curto ([AGENT_HANDOFF.md](AGENT_HANDOFF.md)).
2. Revisão independente do diff (quem revisa não é quem fez). Passou + CI verde → `Ready to Integrate`.
3. A integração abre um PR **da branch da frente** para `claude/v1-ios-integration` e confere: `guard.mjs` na coluna da frente,
   a frente contém a base vigente (`v1-abc-*`), os gates, e as `CONTRACT_CHANGE_PROPOSALS.md` novas.
4. Integra por merge normal (sem rebase, sem squash de histórico das frentes, sem force-push) quando for seguro.
5. Defeito encontrado na integração → issue para a frente dona (`board.mjs create … --front <X>`), ligada ao PR; o PR volta para
   `In Review` ou `Blocked`.
6. `board.mjs set … --status Integrated`; validação no simulador/iPhone; `Verified` só com evidência.

## 2. Branch de integração

`claude/v1-ios-integration`, criada da base vigente quando houver o que integrar (issue I1). Nunca merge em `main` (não existe) nem na
branch padrão sem autorização do fundador. Ao criar: ruleset exigindo o check `CI` e bloqueando force-push/exclusão.

## 3. Conflitos de contrato

Contratos compartilhados: CoachingCore, IntegrationContracts, CoachingPresentation (tipos, portas, fachada, fixtures), o contrato
paralelo, a matriz de ownership, a trava do aparelho, schemas de segurança.

- Uma frente **não edita**; propõe `CCP-<frente>-NN` e segue com um adaptador local (contrato §11).
- A integração **decide** numa linha própria, nunca aceitando a versão de um agente por cima da de outro: atualiza o contrato, sobe
  `CoachingContract.version`, regenera fixtures, roda os três `swift test` + `npm test`, publica `v1-abc-base-<n>-<data>`.
- CoachingCore: só por emenda versionada com revisão independente (HISTORICAL_TEST_POLICY §4).
- No CI, o guard só deixa passar essas mudanças com `governance:approved` no PR, depois da decisão registrada.
- Cada frente traz a nova base por `git merge --ff-only` ou merge normal. Nunca rebase.

## 4. Quem decide o quê

| Assunto | Decide |
|---|---|
| Merge de incremento na branch da frente | a frente, com CI verde e revisão |
| Merge na branch de integração | a integração, com os gates |
| Mudança de contrato compartilhado | a integração pelo §11 (com SSCTR/SEC quando o contrato exige) |
| Escopo novo, decisão de produto, branch padrão, release | o fundador |
