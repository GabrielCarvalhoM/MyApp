Issue: #

## Resumo
<!-- 1–3 frases: o que este incremento entrega. -->

## Módulos e contratos
- Módulos alterados:
- Contratos impactados: nenhum <!-- ou: IntegrationContracts / CoachingPresentation / CoachingCore / contrato paralelo → link da proposta CCP-* -->
- Dependências de outras frentes: nenhuma

## Testes e evidências
<!-- Comando → resultado. Links curtos, sem logs gigantes. -->
- `node tools/orchestration/guard.mjs` →
- `(cd CoachingCore && npm test)` →
- `tools/orchestration/swift-packages.sh` →
- Build / simulador (`tools/orchestration/sim.sh …`, manifest.json) →
- iPhone (só pela trava `tools/device-lock/with-device.sh`) → não se aplica
- Screenshots (se UI, com o nó do Figma):

**Implementado ≠ validado.** Validação: não validado / simulador / iPhone / dados reais <!-- deixe só a que vale -->

## Riscos e limitações
<!-- O que este PR não prova. Falha de segurança não é dívida técnica. CI verde não prova fidelidade visual. -->
