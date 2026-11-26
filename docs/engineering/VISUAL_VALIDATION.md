# Validação visual Figma × app

O Figma é a autoridade visual (`90oyvXHxxBQAvr1netov7S`, na **versão nomeada** que o fundador salvar; mapa de telas, nós e fixtures em
`audits/v1-figma-final-alignment-2026-11-26/SWIFTUI_VISUAL_HANDOFF_ADDENDUM.md`). Critérios de aceite visual: `SWIFTUI_IMPLEMENTATION_HANDOFF.md`
§9. Este procedimento não edita o Figma.

## Procedimento por tela

1. **Nó.** Pegue o nó da tela no adendo (ex.: 71 zonas estimadas = `1102:4302`) e a fixture do mesmo estado.
2. **Registro.** `node tools/orchestration/visual.mjs init --dir audits/v1-ios-swiftui-2026-11-26/visual --screen 71-zonas-estimadas --node 1102:4302 --version "<versão nomeada>"`
3. **Referência.** Exporte o nó como `figma.png` no registro (Figma MCP `get_screenshot` com `fileKey` + `nodeId`, ou exportação PNG 3×).
4. **App.** Rode o app no estado da fixture: `tools/orchestration/sim.sh run --sim "iPhone 18 Pro" --locale pt_BR --appearance light --label 71-zonas-estimadas`.
   Repita para cada condição exigida pelo registro: claro e escuro, PT-BR · EN · ES, texto grande (`--content-size extra-extra-extra-large`).
5. **Anexe.** `node tools/orchestration/visual.mjs attach <registro> --run ios/.build/sim-runs/<data>` (só aceita execução com `result=ok`).
6. **Compare** em condições equivalentes (mesmo modelo de tela, idioma, aparência, estado de dado) e registre em `record.json` →
   `differences`: `{ "area", "expected", "actual", "severity": "blocker|major|minor", "status": "open|fixed|accepted" }`.
   `accepted` só com motivo (ex.: variante de dado ausente que fecha o espaço, §9.2).
7. **Corrija** a implementação e volte ao passo 4.
8. **Veredito.** `MATCHES` quando não houver diferença aberta; `node tools/orchestration/visual.mjs verify --dir audits/v1-ios-swiftui-2026-11-26/visual`.

## Regras

- Nenhuma screenshot fictícia: `verify` confere o hash de cada captura com o `manifest.json` da execução do `sim.sh` que a produziu.
- Nenhuma fidelidade declarada sem o app rodando: `MATCHES` exige captura de cada condição exigida e a referência do Figma.
- Simulador e iPhone são capturas distintas (`target` no manifest).
- CI verde não é validação visual.

## Estrutura

```text
audits/v1-ios-swiftui-2026-11-26/visual/
  71-zonas-estimadas/
    record.json            # nó, versão do Figma, condições exigidas, diferenças, veredito
    figma.png              # referência exportada do nó
    captures/<execução>/   # manifest.json do sim.sh + screenshots (hash conferido)
```
