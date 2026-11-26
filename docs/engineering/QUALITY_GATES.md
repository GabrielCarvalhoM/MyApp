# Quality gates

Três camadas, cada uma dizendo o que prova e o que não prova.

## 1. CI portátil — GitHub Actions (`.github/workflows/v1-ci.yml`)

Roda em todo push para `claude/v1-**` e em todo PR. Check obrigatório único: **`CI`** (agrega os jobs).

| Job | Runner | O que roda | Por quê |
|---|---|---|---|
| Repository integrity and ownership | ubuntu | actionlint · tag da fundação no lugar (`065178f`) · testes de `tools/orchestration` · `guard.mjs` (contrato §10) · gitleaks nos commits novos | estrutura, ownership, segredos |
| CoachingCore (npm test) | ubuntu | `npm ci --ignore-scripts` + `npm test` com **histórico completo** (`fetch-depth: 0`) | a suíte oficial (1952 ativos + 53 históricos contabilizados); a prova de "escrito uma vez" do registro histórico exige o histórico inteiro (HISTORICAL_TEST_POLICY §4) |
| Swift packages (macOS) | macos-latest | `swift test` de IntegrationContracts e CoachingPresentation com **0 testes pulados**; pacotes das frentes: `swift build --build-tests`, ou `xcodebuild build` para o simulador genérico quando o pacote é só iOS (ex.: RepMileUI); detecção do app shell | contratos compartilhados; os testes chamam `node` e dariam `XCTSkip` sem ele — sem Node o `swift test` termina com exit 0 e 2 testes pulados (provado em 26/11), por isso o gate falha em qualquer skip |

Nada é condicional por caminho: os três jobs são baratos (repositório público: minutos gratuitos) e cada push deve provar o CoachingCore.

**Segurança do CI:** token `contents: read`, `persist-credentials: false`, actions fixadas por SHA, ferramentas com checksum, nenhum
segredo, nenhum Keychain, nenhuma assinatura, nunca `pull_request_target`. **Nenhum runner self-hosted**: o repositório é público e
um PR de fork executaria código no Mac mini, que tem o iPhone, o Keychain e dados reais de saúde.

**O guard (contrato §10)** — endurecido pela revisão independente R1:
- Em PR, o guard roda **a partir do commit base** do PR (o PR não reescreve as regras pelas quais é julgado) e mede o **head do PR**, não o merge com o alvo.
- A base do diff é a tag mais nova de uma **lista fechada** (`BASE_TAGS` em `lib/ownership.mjs`); criar outra tag `v1-abc-*` não muda a base.
- Diff com `-z` e `core.quotePath=false`: caminhos com acento são classificados como os outros.
- **Falha fechada:** branch sem papel na matriz, ou PR de fork (nome de branch não confiável), precisa de aprovação para tocar qualquer caminho que o contrato atribui e para mudar qualquer arquivo existente; só pode acrescentar arquivos novos fora da matriz. Instruções e infraestrutura de agentes (`.claude/`, `.agents/`, `tools/agent-runtime/`) contam como governança. Audits existentes (diretórios e arquivos de `audits/`) não aceitam mudança nem arquivo novo.
- **Aprovação** (`governance:approved`) vale só na execução disparada pela aplicação do rótulo; um push posterior roda sem ela. Aprovar = aplicar o rótulo **por último** (depois do último commit e de qualquer outro evento do PR), após a decisão (contrato §11 ou emenda); qualquer evento seguinte roda sem a aprovação. Fork não pode aplicar rótulo, e PR cuja origem não é este repositório conta como fork.
- Limite que o repositório não resolve sozinho: o arquivo do workflow vem do próprio PR (comportamento do GitHub). A defesa é a revisão exigida de code owner (`.github/CODEOWNERS`) no ruleset da branch de integração (§4).

## 2. Gate nativo — Mac mini (Xcode do Mac mini, simulador)

O Xcode dos runners hospedados não é o do Mac mini (Xcode 27.2 / iOS 27.2 aqui); o build do app e os testes de UI rodam localmente.

```bash
tools/orchestration/swift-packages.sh --fronts=test   # inclui os testes dos pacotes das frentes
tools/orchestration/sim.sh doctor                     # projeto, schemes, simulador, sem mudar nada
tools/orchestration/sim.sh all [--sim "iPhone 18 Pro"] [--locale en_US] [--appearance dark] [--content-size extra-extra-extra-large]
```

`sim.sh` descobre o projeto (`ios/*.xcworkspace`, senão `ios/App/RepMile.xcodeproj`) e o scheme, escolhe um simulador disponível, usa
`ios/.build/DerivedData-<A|B|C|INT>`, constrói, instala, abre, confere que o app continua vivo, captura log e screenshot, roda
XCTest/XCUITest num `.xcresult` e resume as falhas. O bundle id vem do `Info.plist` construído, nunca é suposto. Evidência em
`ios/.build/sim-runs/<data>/manifest.json` (`target: simulator`, commit, simulador, runtime, Xcode, hash de cada screenshot). Sem app
shell: `WAITING_FOR_APP_SHELL`, exit 3, nada é construído. Para guardar evidência num relatório, copie a pasta para o `results/` da
sua frente.

## 3. iPhone físico

Só por `tools/device-lock/with-device.sh <coachinghost|healthkit|swiftui|integration> [--wait] -- <comando>` (exit 75 = em uso). Os
scripts de orquestração nunca falam com o aparelho. Evidência do aparelho é marcada `target: device` e nunca somada à do simulador.
Dados reais de saúde: só contagens em log, nada no repositório.

## 4. Proteções no GitHub

Ativas (reversíveis, sem checks exigidos): rulesets que **bloqueiam force-push e exclusão** em `claude/v1-*` e nas tags `v1-*`
(preservam o histórico que o registro histórico do CoachingCore e a tag da fundação pressupõem). Recomendadas, não ativadas:

| Branch | Recomendação | Quando |
|---|---|---|
| `claude/v1-ios-integration` | **ativo desde 26/11** (ruleset 28186277): PR + check `CI` exigidos, sem force-push/exclusão. Revisão de code owner **não** exigida enquanto #29 (mesma identidade) estiver aberto | — |
| release (`release/v1*`) | exigir `CI`, PR e revisão; bloquear push direto | ao criar a primeira release |
| branch padrão | decidir com o fundador (hoje é `r7/decision-authority-closure-base`; não existe `main`) | issue O1 |

## 5. O que nenhum gate prova

CI verde não prova fidelidade visual ([VISUAL_VALIDATION.md](VISUAL_VALIDATION.md)), nem comportamento no iPhone, nem prontidão para
atletas reais (`REAL_ATHLETE_READY = NO`). `npm test` não prova os testes históricos nas suas versões (`npm run test:historical`).

## 6. Lacunas conhecidas

- `tools/agent-runtime`: 74/75 na base (falha "a hook planted in the repository…"); fora do CI até a issue O2.
- O runner `macos-latest` muda de imagem com o tempo; o job imprime `xcodebuild -version`. Fixe a imagem se uma mudança quebrar o build.
