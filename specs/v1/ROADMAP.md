# Roadmap da V1 — milestones por dependência

Datas não são prometidas; a ordem é por dependência. O estado vivo de cada item está no quadro
(https://github.com/users/GabrielCarvalhoM/projects/1) e no [INDEX](INDEX.md).

## M0 · Infraestrutura e fechamento da C (agora)
- #31 `.DS_Store` removido sem reescrever histórico.
- Recheck independente do incremento 08 → correções P1 → nova verificação → publicar `claude/v1-ios-swiftui`.
- `specs/v1/` + gate de 350 linhas no CI.
- #15 branch `claude/v1-ios-integration` (base: infraestrutura de orquestração sobre `v1-abc-ready-2026-11-26`) e PR C → integração.
- Decisões agrupadas para o fundador (PRODUCT_SCOPE §4).

## M1 · Qualidade da C sem dependências externas (paralelo a A/B)
- #32 MVVM nos fluxos de escrita (8 incrementos pequenos) · #41 dividir arquivos > 350.
- #37 força declarada pelo atleta · #38 corrida retomada sob bloqueio · #39 P2/P3 do recheck.
- #14 validação visual Figma × simulador (depende da versão nomeada do Figma).

## M2 · Integração A + B + C (quando A e B entregarem a versão final revisada)
- Revisão das entregas finais de A (exclusão, reinscrição, aparelho bloqueado, CCP-A-*) e B (política OPEN-1 2, dedupe multi-app).
- #20 decidir CCPs (A, B, C-01..04, incluindo #40) e publicar nova base `v1-abc-base-<n>`.
- #16 portas reais na raiz de composição (`ios/App/Composition`).
- #17 primeiro onboarding real com CoachingHost e persistência.

## M3 · Primeira jornada integrada
Onboarding → motor real → plano gerado → Hoje → detalhe → execução → relato → Histórico/Progresso.
- #18 XCUITest da jornada com motor real (sintético, rotulado) · #19 iPhone pela trava (fim a fim).

## M4 · Demais jornadas integradas
Musculação · avulsos · adaptação semanal · segurança e recuperação · Apple Saúde real · persistência e retomada · exclusão e privacidade.

## M5 · Completar a V1
- #35 Live Activity · #36 motion · #34 gamificação/compartilhamento · #33 paywall (após #28 e decisão comercial).
- Revisão clínica humana dos textos INTERIM; critérios de `REAL_ATHLETE_READY`.

## Dependências críticas

```text
#31 ─▶ push C ─▶ PR C→integração ─┐
#15 (branch de integração) ───────┼─▶ #16 ─▶ #17 ─▶ #18 ─▶ #19
A final + B final ─▶ #20 (CCPs) ──┘
#28 + decisão comercial ─▶ #33
versão nomeada do Figma ─▶ #14
```
