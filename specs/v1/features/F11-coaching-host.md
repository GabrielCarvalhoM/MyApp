# F11 · CoachingHost — motor real no iPhone (frente A)

**Situação:** EM ANDAMENTO na sessão A (`claude/v1-ios-coachinghost` @ `df9b69b` publicado + trabalho local não commitado sobre exclusão,
CCP-A-04). **Não tocar.** Issues: #1 (acompanhamento), #17 (onboarding real), #16 (portas reais).

**Objetivo.** Executar o CoachingCore congelado (bundle de produção + `app-projections`) em JavaScriptCore e implementar
`CoachingReading`/`CoachingWriting` com persistência protegida, integridade, relógio confiável e exclusão.

**Já entregue (publicado).** Bundle de produção (AMENDMENT-2), fachada, host nativo e portas; reprodução de fixtures 98/99 pela fachada;
equivalência no bundle; testes de plataforma, cross-process, item 18; host no iPhone com evidência; correções QRE/Security R1; CCPs.

**A verificar na entrega final (integração).** Segurança de persistência e integridade · semântica da exclusão de conta · reinscrição legítima
após exclusão · teste físico com aparelho bloqueado · decisões das CCP-A-* · revisão independente das correções finais.

**Contratos.** CoachingPresentation (portas, fixtures); CoachingCore congelado. **Testes.** `swift test` CoachingHost; DeviceTests pela trava.

**Regra.** Testes sintéticos verdes não significam prontidão para atleta real.
