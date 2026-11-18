# P0 — como reproduzir

Tudo com dados sintéticos. Sem rede, sem HealthKit, sem tela de produto.

## 1. Laboratório (qualquer máquina com Node 24)

Na raiz do repositório, branch `claude/v1-aif-p0-jsc`:

```
node audits/v1-aif-p0-jsc-2026-11-17/build/link.mjs      # gera o bundle, os assets e os manifestos em ios/Sources/P0Host/Resources/
node audits/v1-aif-p0-jsc-2026-11-17/lab/oracle.mjs      # grava os oráculos J5/P16 em ios/Tests/P0HostTests/Fixtures/
node audits/v1-aif-p0-jsc-2026-11-17/lab/replay-vm.mjs   # equivalência, restauração, ULP e tempos de laboratório -> results/lab-vm.json (~2 min)
node audits/v1-aif-p0-jsc-2026-11-17/lab/api-floor.mjs   # piso de iOS do bundle -> results/api-floor.json
```

Conferências:
- `link.mjs` precisa terminar com o mesmo SHA-256 do bundle registrado em `ios/Sources/P0Host/Resources/build-manifest.json` (`bundle.sha256`). Um SHA diferente quer dizer que a fonte mudou, e então o P0 não vale para o código commitado.
- `oracle.mjs` regrava os oráculos. O `git diff` precisa ficar vazio, porque os digests são determinísticos.

## 2. iPhone (Mac com Xcode 15 ou mais novo)

O pacote está em `audits/v1-aif-p0-jsc-2026-11-17/ios`. Ele traz uma biblioteca (`P0Host`) e testes (`P0HostTests`) e nenhum app.

> **Atualização de 2026-11-18 (primeira execução real; Mac mini M4, Xcode 27.2, iPhone 17 Pro Max com iOS 27.2).** Os passos 2 e 4 abaixo, pelo pacote, **não rodam no aparelho**: o Xcode responde "Tool-hosted testing is unavailable on device destinations". O caminho que funciona é o plano B, já pronto em `ios/DeviceHost/` e descrito no §2A. Pelo pacote, só o Mac (`swift test`) e o simulador.

## 2A. O caminho que rodou (plano B, 2026-11-18)

`ios/DeviceHost/P0DeviceHost.xcodeproj` tem:
- um app hospedeiro com uma cena vazia (`Color.clear`). O iOS 27 recusa abrir um app sem o ciclo de vida UIScene. Não tem tela de produto nem lógica;
- o alvo `P0DeviceTests`, hospedado nele, que compila os **mesmos** `Tests/P0HostTests/*.swift` e a **mesma** pasta `Fixtures`, e liga o produto `P0Host` do pacote local;
- `PlanB/BundleModule.swift`, que dá aos testes o `Bundle.module` que o SwiftPM geraria;
- pisos: o app e a biblioteca `P0Host` ficam em iOS 16.0, o piso do bundle. O alvo de testes fica em 17.0, o mesmo piso que o SwiftPM sintetiza para `P0HostTests`, porque o XCTest do Xcode 27 é compilado para 17.0. O piso dos testes não muda o que se mede;
- o esquema compartilhado `P0DeviceHost`: Test em Release, cobertura de código desligada (ela instrumenta o binário) e "Debug executable" desligado.

Uma vez por Mac e por aparelho:
1. Xcode > Settings > Accounts: entrar com um Apple ID (o Personal Team basta).
2. Abrir o projeto, escolher o Team nos dois alvos (Signing & Capabilities) e fechar. Isso cria o certificado. Depois **apagar** a linha `DEVELOPMENT_TEAM` do `project.pbxproj`: o ID vai só na linha de comando e não entra no repositório.
3. Primeira instalação: no iPhone, Ajustes > Geral > VPN e Gerenciamento de Dispositivos > confiar no certificado de desenvolvedor.

Execução (o `<UDID>` vem de `xcrun devicectl list devices`):

```
cd audits/v1-aif-p0-jsc-2026-11-17/ios/DeviceHost
D='platform=iOS,id=<UDID>'
xcodebuild clean build-for-testing -scheme P0DeviceHost -configuration Release -destination "$D" -allowProvisioningUpdates DEVELOPMENT_TEAM=<TEAM_ID>
T() { xcodebuild test-without-building -scheme P0DeviceHost -configuration Release -destination "$D" DEVELOPMENT_TEAM=<TEAM_ID> -only-testing:"P0DeviceTests/$1" "${@:2}"; }
T EquivalenceTests            2>&1 | tee equivalence.log
T FocalTests -testLanguage en -testRegion US     2>&1 | tee focal-en-US.log
T FocalTests/testLocaleAndSortCoverage -testLanguage pt-BR -testRegion BR 2>&1 | tee focal-pt-BR.log
T FocalTests/testDeviceState  2>&1 | grep P0RESULT    # estado térmico e bateria; medir só com "nominal" (ou registrar o desvio)
T PerformanceTests            2>&1 | tee performance.log
for i in $(seq 1 10); do T ColdStartTests/testFirstContextInProcess 2>&1 | grep '^P0RESULT cold-start'; done > cold.txt
grep -h '^P0RESULT' performance.log cold.txt > p0-results.txt
node ../../lab/device-budgets.mjs p0-results.txt
```

- Os anexos dos passos não idênticos saem com `xcrun xcresulttool export attachments --path <x>.xcresult --output-path <dir>`, e o `manifest.json` liga cada arquivo ao seu nome (`p16-step13-reply…`).
- `lab/focal-oracle.mjs` regrava `Fixtures/focal.json`. Como os demais oráculos, ele é determinístico e deve deixar o `git diff` vazio.
- Antes de versionar os logs, remover Team ID, UDID, Apple ID e caminhos pessoais.

1. Conectar o iPhone de entrada (A13: iPhone SE de 2ª geração ou iPhone 11), com o Modo Desenvolvedor ativo.
2. A assinatura vem só do `DEVELOPMENT_TEAM=<TEAM_ID>` na linha de comando. Um pacote Swift não tem editor de Signing no Xcode.
   - **Plano B:** se o host de teste que o Xcode sintetiza para o pacote não assinar ou não abrir no aparelho, criar um projeto Xcode mínimo. Ele tem um app host vazio, sem tela de produto, e um alvo de testes unitários hospedado nele.
   - O projeto usa as mesmas fontes (`Sources/P0Host`), os mesmos recursos (`Resources`, `Fixtures`) e os mesmos testes. Nada de código ou de medição muda.
3. Antes de medir:
   - aparelho com bateria acima de 50 %, fora do Modo de Pouco Consumo e sem apps em primeiro plano;
   - **modo avião ligado**, o que prova o funcionamento offline;
   - esperar o aparelho esfriar entre execuções;
   - sem depurador. Cada `P0RESULT` registra `debuggerAttached` (true, false ou null, quando a leitura falha).
     - Só `false` vale. Uma medição com `true` ou `null` não vale, e o `device-budgets.mjs` a recusa.
     - Verificado em 2026-11-18: pelo esquema do plano B, `xcodebuild test-without-building` roda com `debuggerAttached: false` em todas as execuções.
     - Se aparecer `true`: desligar "Debug executable" na ação Test do esquema (ou no plano B) e repetir.
4. Rodar por linha de comando, que é o jeito reproduzível:

```
cd audits/v1-aif-p0-jsc-2026-11-17/ios
xcodebuild -list                                   # confirma o nome do esquema que contém P0HostTests
xcodebuild test -scheme P0Host -configuration Release \
  -destination 'platform=iOS,name=<nome do iPhone>' \
  -allowProvisioningUpdates DEVELOPMENT_TEAM=<TEAM_ID> 2>&1 | tee p0-device.log
grep P0RESULT p0-device.log > p0-results.txt
```

5. Partida a frio, um processo novo por amostra, dez amostras:

```
for i in $(seq 1 10); do
  xcodebuild test -scheme P0Host -configuration Release -destination 'platform=iOS,name=<nome do iPhone>' \
    -only-testing:P0HostTests/ColdStartTests/testFirstContextInProcess DEVELOPMENT_TEAM=<TEAM_ID> 2>&1 | grep 'P0RESULT cold-start'
done >> p0-results.txt
```

6. Instruments: no Xcode, abrir Product > Perform Action > Profile "testP0Measurements".
   - **Time Profiler:** procurar amostras do motor na thread principal; o esperado é nenhuma.
   - **Allocations e VM Tracker:** o pico e as regiões do JavaScriptCore.
   - **os_signpost:** subsystem `fit.vilumo.p0`, intervalos `boot` e `step`.
   - Exportar os traces para `results/device/`.
7. Guardar `p0-device.log`, `p0-results.txt` e os traces em `audits/v1-aif-p0-jsc-2026-11-17/results/device/`, junto com o modelo e a versão do iOS. As linhas `P0RESULT` já incluem esses dados.

**O que conta como aprovação:**
- **Equivalência:** J5, P16 e as duas restaurações sem nenhum passo `DIVERGED`, e os contadores do host sem ausências e sem recusas ao fim de cada execução.
  - Todo passo que não sai `IDENTICAL` deixa a resposta anexada ao `.xcresult`, com o nome `<jornada>-step<N>-reply.json`.
  - Um passo `EXPLAINED_LIBM` só é aceito se o `diff-answer` confirmar a regra e se houver decisão explícita (`P0_REPORT.md` §4.2).
- **Desempenho:** `node audits/v1-aif-p0-jsc-2026-11-17/lab/device-budgets.mjs p0-results.txt` termina com código 0. O script junta:
  - os orçamentos medidos dentro do teste;
  - a carga e o primeiro plano **a frio**, calculados sobre as 10 amostras de `cold-start`;
  - a validade do ambiente: um único aparelho, Release, sem simulador, sem depurador e fora do Modo de Pouco Consumo.

O simulador e o Mac **não contam como medição**. Servem só para compilar e para uma primeira checagem de equivalência.

Para analisar uma resposta anexada (nos passos restaurados, use a jornada de origem e o mesmo N):

```
node audits/v1-aif-p0-jsc-2026-11-17/lab/diff-answer.mjs <j5|p16> <N> <caminho do anexo>
```
