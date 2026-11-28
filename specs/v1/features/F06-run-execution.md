# F06 · Execução de corrida com iPhone (RunRecorder) e relato

**Situação:** IMPLEMENTADO em C (inc. 04 `45cf8e9`, correções inc. 08) · simulador com localização simulada · **iPhone não testado**.
Issues: #11 (RunRecorder), #12 (execução).

**Objetivo.** Gravar a corrida no iPhone seguindo os passos do motor e enviar o relato do atleta.

**Comportamento.** `RunRecorder`: CoreLocation, passos por tempo/distância, pausa (para tempo e distância), localização em background,
arquivo protegido atômico, retomada após morte do processo (inclusive pausado), gravação finalizada sem relato volta ao relato,
precisão ruim visível e não contada, descarte e exclusão total. Relato: identidade do treino vem da gravação (`sessionId`, `sessionDate`);
parada exige motivo (sem preset); parada por sintoma é relatada como parada; "Sim" em sintomas abre "Não estou 100%" na hora;
"Concluir" ou "Sair sem salvar" (confirma e descarta). Distância do iPhone: "medido pelo iPhone, não usado pelo plano" (DR-121 pendente).

**Estados.** sem permissão · negado · sem sinal · precisão ruim · gravando · pausado · retomado · finalizado · salvando · salvo · tela exigida.

**Aceite.** Corrida por tempo nunca é bloqueada por GPS · relato planejado não leva distância · nada de relato perdido após kill.

**Contratos.** `AppRecordingIndex` (IntegrationContracts), `ReviewRequest.sessionReports`, `AthleteObservation`.
**Figma.** 40 `657:1144`, `657:1243` (localização); 50 `880:19765`, `880:20729`.

**Testes.** RunRecorder 10/10 (`testKilledProcessResumes`, `testKilledWhilePausedResumesWithFixes`, `testFinishedUnreportedRecordingComesBack`…);
XCUITest `testPlannedRunRecordReportAndSave`, `testReportCanBeLeftWithoutSaving`, `testRecordingResumesAfterTheProcessIsKilled`.

**Pendente.** QRE P2: persistência a cada 5 fixes na main thread; splits locais incluem tempo pausado; lacuna de crash ligada por reta;
re-checar Startability ao retomar se um bloqueio chegou (P2) · `RunReportViewModel` · Live Activity (F15) · teste real no iPhone (#19).
