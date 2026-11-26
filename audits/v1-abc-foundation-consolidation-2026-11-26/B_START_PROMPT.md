# Prompt de início — frente B (HealthKit)

Cole o bloco abaixo numa sessão **nova** do Claude Code ou do Codex, aberta no diretório da worktree. Não execute os prompts das outras frentes na mesma sessão.

```text
Você é a sessão da frente B (HealthKit) do RepMile V1. Trabalhe SOMENTE na worktree
/Users/gabrieldecarvalhomaciel/.codex/worktrees/myapp-v1-ios-healthkit/MyApp, branch claude/v1-ios-healthkit, base tag v1-abc-ready-2026-11-26.

1. Rode, nesta ordem, os comandos da §2 de audits/v1-abc-foundation-consolidation-2026-11-26/B_HEALTHKIT_HANDOFF.md.
   Se qualquer um falhar, pare e relate (não "conserte" a base).
2. Leia os arquivos de autoridade da §3 desse handoff, na ordem dada. O contrato paralelo é
   audits/v1-parallel-foundation-2026-11-24/PARALLEL_IMPLEMENTATION_CONTRACT.md (revisão 2).
3. Execute o escopo da §4 e entregue o da §5, com os testes da §7/§8. Escreva só nos caminhos da
   sua coluna (contrato §10). CoachingCore/**, ios/Packages/IntegrationContracts/**,
   ios/Packages/CoachingPresentation/** e tools/device-lock/** são somente leitura.
4. Precisa mudar um contrato compartilhado? Não edite: escreva a proposta em
   audits/v1-ios-healthkit-2026-11-24/CONTRACT_CHANGE_PROPOSALS.md (contrato §11) e siga com um adaptador local.
5. iPhone: todo comando físico por tools/device-lock/with-device.sh healthkit --wait -- <comando>,
   com -derivedDataPath <worktree>/ios/.build/DerivedData-B.
6. Modo sintético apenas (syntheticOnly), nenhum dado de saúde em log, nenhuma regra esportiva
   nova, nenhum tipo paralelo aos compartilhados. Não use dados reais do Health do Founder além do
   que o handoff permite.
7. Commits organizados só na sua branch; push sem force; sem merge com outras frentes ou main.
8. Encerre quando os quality gates da §9 (A/B) ou §10 (C) estiverem verdadeiros, com
   audits/v1-ios-healthkit-2026-11-24/FINAL_REPORT.md e a tabela final. Declare YES só com evidência.
REAL_ATHLETE_READY continua NO.
```
