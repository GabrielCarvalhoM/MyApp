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

1. Abrir a pasta `ios` no Xcode: File > Open, escolher a pasta que contém o `Package.swift`.
2. No esquema `P0Host`, em Signing, escolher o Team. Conectar o iPhone de entrada (A13: iPhone SE de 2ª geração ou iPhone 11) com o Modo Desenvolvedor ativo.
3. Antes de medir:
   - aparelho com bateria acima de 50 %, fora do Modo de Pouco Consumo e sem apps em primeiro plano;
   - **modo avião ligado**, o que prova o funcionamento offline;
   - esperar o aparelho esfriar entre execuções.
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
- Equivalência: J5 e P16 sem nenhum passo `DIVERGED`. Um passo `EXPLAINED_LIBM` exige decisão explícita, ver `P0_REPORT.md` §4.
- Desempenho: as linhas `budgets` do resultado `performance`, todas com `pass: true`, medidas no aparelho de entrada, em Release.

O simulador e o Mac **não contam como medição**. Servem só para compilar e para uma primeira checagem de equivalência.

Se algum passo de J5 não sair idêntico, o teste anexa `j5-step<N>-reply.json` ao `.xcresult`. Para analisar:

```
node audits/v1-aif-p0-jsc-2026-11-17/lab/diff-answer.mjs <N> <caminho do anexo>
```
