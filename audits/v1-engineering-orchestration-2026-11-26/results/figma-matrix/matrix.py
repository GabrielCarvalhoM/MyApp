"""Builds specs/v1/FIGMA_MATRIX.md from inventory.json (Figma get_metadata, version "V1 alinhamento funcional · 26 nov") and rules.py.
Usage: python3 -I matrix.py <inventory.json> <out.md>"""
import collections, json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from themes import THEMES
from rules import R, P, X, N, ACC, SUB, NONE, C_ACC, C_SUB, PROF, STATE, FUT

inv = json.load(open(sys.argv[1]))
out = sys.argv[2]
NR = "NO_FIGMA_REFERENCE"

PAGES = ["10", "20", "30", "31", "40", "41", "50", "60", "70", "71", "72", "80", "81", "82", "83"]
def issue(o):
    p = o["page"][:2]
    if p == "50":
        return "#104" if o["row"] and "Histórico" in o["row"] else "#103"
    return {"10": "#101", "20": "#99", "30": "#102", "31": "#102", "72": "#102", "40": "#103", "41": "#103", "60": "#104"}.get(p, "#105")

CAPTURED = {
    "835:2069": "captura #14 `10-onboarding-abertura` + revisão independente (#99, NOT_READY)",
    "880:4257": "captura #14 `20-hoje-plano-valido` + revisão independente (#99, NOT_READY)",
    "805:410": "captura #14 `20-hoje-bloqueado` + revisão independente (#99, NOT_READY)",
    "805:492": "captura #14 `20-hoje-bloqueado-urgente` + revisão independente (#99, NOT_READY, blocker)",
}
RECORD_NO_CAPTURE = {"509:115": "`30-plano-semana`", "643:317": "`31-treino-longao`"}
NV = "não verificado visualmente (código × frame)"

def page80(o):
    row = o["row"] or ""
    if o["id"] == "825:3706":
        return (X, STATE + " `.accountErased`", "`eraseAccount()` → `GONE`", "\"Conta apagada / Esta conta foi apagada neste aparelho…\" × \"Conta excluída / Seus dados foram apagados…\" + \"Começar de novo\".",
                "Exclusão no Figma é da conta remota; sem backend (#28) o app apaga só o registro local.")
    if o["id"] in ("825:4337", "825:4469"):
        return (X, PROF + " (`confirmationDialog` \"Apagar a conta de vez?\")", "`eraseAccount()`", "Diálogo único do sistema no Perfil × folha em 2 etapas em \"Conta e acesso\".",
                "Exclusão no Figma é da conta remota; sem backend (#28) o app apaga só o registro local.")
    sub = any(k in row for k in ("Assinar", "Compra", "Assinatura", "Sem assinatura"))
    return (N, NONE, C_SUB if sub else C_ACC, SUB if sub else ACC, None)

def page82(o):
    if o["name"].startswith("Arte"):
        return (N, NONE, "—", "Arte de compartilhamento ausente (F14 não iniciado).", None)
    return (N, NONE, "`RunRecorder` (rota local), `loggedEntries()`", "Folha de compartilhar ausente (F14 não iniciado).",
            "Mapa/rota do Figma só com rota local real (`RunRecorder`); a regra de esconder 200 m precisa de dono (C ou A).")

def split(name):
    s = name.split(" / ", 1)[-1]
    s = re.sub(r"^(Motion · )", "", s)
    if " · " in s:
        a, b = s.split(" · ", 1)
        return a, b
    return s, "—"

KEYS = collections.defaultdict(list)
for k, t, desc, where in THEMES:
    for x in where.split(): KEYS[x].append(k)
rows = []
prim = [o for o in inv if not o["motion"] and not o["name"].startswith("Motion ·")]
# 83: motion frames sit in the same row with a "Motion ·" prefix
twins83 = {o["name"].replace("Motion · ", "", 1): o["id"] for o in inv if o["name"].startswith("Motion ·")}
missing = []
for o in sorted(prim, key=lambda o: (PAGES.index(o["page"][:2]), o["y"], o["x"])):
    p = o["page"][:2]
    if o["id"] in R:
        cls, view, contr, div, conf = R[o["id"]]
    elif p == "80":
        cls, view, contr, div, conf = page80(o)
    elif p == "82":
        cls, view, contr, div, conf = page82(o)
    else:
        missing.append(o["id"]); continue
    twin = o["twin"]
    if p == "83":
        twin = next((v for k, v in twins83.items() if k.endswith(o["name"].split(" / ", 1)[-1])), None)
    screen, variant = split(o["name"])
    ev = CAPTURED.get(o["id"]) or (f"registro #14 {RECORD_NO_CAPTURE[o['id']]} sem captura (NO_ROUTE); " + NV if o["id"] in RECORD_NO_CAPTURE else NV)
    rows.append(dict(id=o["id"], twin=twin, page=o["page"], screen=screen, variant=variant, view=view, contr=contr, issue=issue(o) if o["id"] not in ("805:410", "805:492") else "#99 · #102",
                     cls=cls, ev=ev, div=div, conf=conf, name=o["name"], row=o["row"]))
if missing:
    sys.exit("frames without a rule: " + " ".join(missing))

# Element row: "Já tenho conta" (hold-back documented in #99, not approved).
rows.insert(1, dict(id="835:2069", twin=None, page="10 · Onboarding", screen="01 Abertura", variant="elemento \"Já tenho conta\"", view=NONE, contr=C_ACC, issue="#101",
                    cls=N, ev="revisão #99 (registrado como \"diferença aceita\"); **sem aprovação do fundador**",
                    div="Link \"Já tenho conta\" não entra enquanto a camada de conta (#28) não existir. **Desvio pendente de aprovação do fundador: não é APPROVED_DEVIATION.**",
                    conf=None, name="", row="elemento"))

BANNER_ = "`TodayView` · `StateBanner` (`TodayContent.banners`)"
STR_ = "`Features/Run/StrengthLogView.swift` · `StrengthLogViewModel`"
APP_ONLY = [
    ("#101", "Onboarding · \"O que você tem para treinar força?\"", "`OnboardingStepView` `.equipment` (`ob.equipment.title`)", "`athlete.equipment`",
     "Tela inventada: 8 chips de equipamento sem preset. O Figma pergunta \"Onde você treina força?\" (`836:624`) e só mostra equipamentos sob \"Academia do prédio\"/\"Em casa\" (`867:2289`). Remover (#101).", None),
    ("#101", "Onboarding · \"Duração do plano\" (4/8/12/16 semanas)", "`OnboardingStepView` `.schedule` (`ob.weeks`)", "`OnboardingAnswers.weeks`",
     "Pergunta sem frame: o Figma não pergunta a duração; deriva \"8 semanas até os seus 10 km\" da data (`835:2475`).", "O contrato exige `weeks` ∈ {4, 8, 12, 16}; sem pergunta, de onde vem o valor (sem inventar)?"),
    ("#101", "Onboarding · cabeçalho \"Passo n de 8\" + barra de progresso", "`OnboardingFlow.form`", "—",
     "Elemento sem frame: o Figma usa \"Etapa n de 4 · <nome>\" e respiros entre etapas.", None),
    ("#101", "Onboarding · \"Algumas respostas não combinam entre si\" (INVALID_INPUT)", "`OnboardingFlow` `.outcome(.invalidInput)`", C_ACC.replace("nenhum (backend #28 inexistente)", "`BoundaryAnswer.planOutcome = INVALID_INPUT`, `error.fields`"),
     "Tela genérica sem frame próprio (só o caso de horizonte tem frame, `838:3864`).", None),
    ("#102 · #103 · #104", "Formulário de elegibilidade \"Antes de seguir: você tem algum destes agora?\" (6 Sim/Não + \"Confirmo…\")", "`EligibilityForm` (`SafetyComponents.swift`) em `RunReportView`, `StrengthLogView`, `NotFeeling100Flow`, `ReadinessFlow`, `UnavailableDaySheet`, `HistoryDetail`",
     "`EligibilityScreen` em `ReviewRequest`/relato (#68, #72)", "Bloco sem frame em todos esses fluxos.",
     "O motor só registra relato/revisão com triagem atual (`eligibility.currentAssessment`, 0–14 dias); o Figma não prevê a triagem nesses fluxos. Reaproveitar uma triagem recente é decisão aberta (#68)."),
    ("#103 · #104", "Rota clínica dentro do relato (`ClinicalRouteBanner`)", "`SafetyComponents.swift` em `RunReportView`, `StrengthLogView`, `HistoryDetail`", "`BoundaryAnswer` → `CLINICAL_HUMAN_REQUIRED`, `Guidance.level`",
     "Estado sem frame: o Figma tem a rota clínica só a partir de \"Não estou 100%\" (`805:410`, `805:492`).", None),
    ("#99", "Hoje · banner \"Confira a data e a hora\"", BANNER_, "`Startability.notStartable(.clockUntrusted)`", "Banner sem frame.", None),
    ("#99", "Hoje · banner \"Antes do próximo treino / Responder à triagem\"", BANNER_, "`Startability.notStartable(.screenRequired)`", "Banner sem frame em Hoje (a triagem aparece no Figma só no relato e no teste de campo).", None),
    ("#99", "Hoje · banner genérico \"Não dá para começar agora\" + motivo", BANNER_, "`NotStartableReason` (`RECORD_UNAVAILABLE`, `REPERTOIRE_EXPIRED`, `NOT_EXECUTABLE`)", "Banner sem frame.", None),
    ("#105", "Estado \"Seu registro foi perdido\"", STATE + " `.recordLost`", "`BoundaryError` `RECORD_LOST`/`RECORD_ROLLED_BACK`, `acknowledgeRecordLoss()`", "Tela sem frame.", None),
    ("#105", "Estado \"Não conseguimos abrir sua conta neste aparelho\"", "`RepMileLaunchScreen` `.identityDamaged` (#76)", "`Launch` (identidade danificada)", "Tela sem frame.", None),
    ("#105", "Perfil · \"Modo sintético: os dados deste app são de demonstração.\"", PROF + " (Sobre)", "—", "Elemento sem frame (fase sintética, `REAL_ATHLETE_READY = NO`).", None),
    ("#104", "Histórico · \"Quem registrou esta sessão\" (vozes Você / Relógio ou Apple Saúde) e \"Seus registros e os do relógio não batem\"", "`HistoryDetail`", "`LoggedEntry.channels`/voices, conflito",
     "Painel sem frame; o Figma (99 \"Pé do treino\") só diz a fonte numa linha.", None),
    ("#104", "Histórico · \"Não foi salvo como sessão separada: ficou junto de outro registro do mesmo horário.\"", "`HistoryScreen`/`HistoryDetail`", "`LoggedEntry.unplannedMerge`", "Mensagem sem frame.", None),
    ("#103", "Força · \"Fiz como prescrito\" + aviso \"Só entram no registro as séries que você confirmar…\"", STR_, "`StrengthActual` (#37)", "Ação sem frame: a 41 registra série a série.", None),
]

C = collections.Counter
def esc(s): return (s or "").replace("|", "\\|").replace("\n", " ")

L = []
w = L.append
w("# FIGMA_MATRIX · reconciliação Figma × SwiftUI (V1)")
w("")
w("**Autoridade:** [PRODUCT_SCOPE.md](PRODUCT_SCOPE.md) \"Três autoridades\" · gate [QUALITY_GATES §2b](../../docs/engineering/QUALITY_GATES.md). **Issue mãe:** #14. **Data:** 2026-11-27.")
w("")
w("Matriz única de rastreabilidade entre os frames aprovados do Figma e as telas SwiftUI. É o passo 1 da reconciliação (inventário). Não corrige nada, não muda o Figma e não decide conflitos de produto.")
w("")
w("## 1. Fontes e método")
w("")
w("| Fonte | Valor |")
w("|---|---|")
w("| Figma | arquivo `90oyvXHxxBQAvr1netov7S`, versão aprovada \"V1 alinhamento funcional · 26 nov\". Lido só com `get_metadata` (uma chamada por página) via MCP; nada escrito. |")
w("| Tags | `[FUTURO · fora da V1]`, `[V1: usar variante sem FC ao vivo]`, `[V1: oculto até …]` do addendum e do changelog de nós em `origin/claude/v1-figma-final-alignment` (`audits/v1-figma-final-alignment-2026-11-26/`). |")
w("| App | `origin/claude/v1-ios-swiftui` @ `856cdf00` (frente C, RepMileUI) e `origin/claude/v1-ios-integration` @ `6bc43620` (shell e composição `ios/App/Composition`). A RepMileUI das duas difere só no Histórico (#70, frente C mais nova); a matriz usa a frente C. Caminhos relativos a `ios/Packages/RepMileUI/Sources/RepMileUI/`. |")
w("| Contratos | `ios/Packages/CoachingPresentation` (portas `CoachingReading`/`CoachingWriting`, requests) e `IntegrationContracts`. |")
w("| Capturas | piloto #14 em `origin/claude/v1-ios-integration-i14-visual` (`audits/v1-ios-swiftui-2026-11-26/visual/`); revisão independente do `visual-ux-reviewer` no #99. |")
w("| Dados auxiliares | `audits/v1-engineering-orchestration-2026-11-26/results/figma-matrix/` (inventário dos frames, regras, gerador). |")
w("")
w("**Método.** Cada frame de primeiro nível das páginas 10–83 é uma linha (o gêmeo de motion aparece entre parênteses na coluna do nó e não é classificado à parte). A copy do Figma vem dos nomes das camadas de texto no `get_metadata`, que podem truncar ou atrasar em relação ao conteúdo; a do app vem de `Copy/copy.psv` (pt-BR). Sem captura comparada pelo revisor independente, a classificação é por estrutura, conteúdo e copy, e a evidência diz \"não verificado visualmente\". Nenhuma linha é `MATCH`: não existe captura aprovada. `APPROVED_DEVIATION` exige aprovação explícita do fundador e hoje não há nenhuma.")
w("")
w("**Classes.** `PARTIAL`: a tela existe com a estrutura do frame, com elementos ou copy faltando ou diferentes. `MISMATCH`: a tela existe para esse momento, mas a estrutura, a sequência ou o conteúdo principal divergem (ou a captura comparada achou divergências). `NOT_IMPLEMENTED`: frame sem tela no app (inclui `[FUTURO]` e `[V1: oculto]`, que devem mesmo ficar fora da tela; a coluna de divergências diz quando isso está correto). `NO_FIGMA_REFERENCE`: tela ou elemento do app sem frame identificável (§4).")
w("")
w("**Fora da matriz (não são telas do app):** 00 Guia e status · 01 Fundamentos · 02 Componentes · 03 Marca · 04 Landing page · 05 Instagram. **Páginas de referência, sem telas:** 90 Fluxos (`898:23`, nove caminhos; usado para a sequência, §6), 91 Motion (`898:1284`, regras de motion; não avaliado sem captura), 99 Handoff V1 (`897:1109`, `934:37`; regras \"só o que chegou\", usadas nas divergências). **ZZ Legado:** nunca referência. A página 83 está \"A aprovar\" no Guia (`897:159`).")
w("")

# summary
w("## 2. Resumo por jornada")
w("")
JOURNEYS = [("#101", "Onboarding (10)"), ("#99", "Hoje (20)"), ("#102", "Plano, treino planejado e adaptações (30, 31, 72)"),
            ("#103", "Execução e concluído (40, 41, 50 concluído)"), ("#104", "Histórico e Progresso (50 histórico, 60)"),
            ("#105", "Perfil e secundários (70, 71, 80, 81, 82, 83)")]
CLS = ["MATCH", "PARTIAL", "MISMATCH", NR, "NOT_IMPLEMENTED", "APPROVED_DEVIATION"]
def jkey(issue_s):
    for k, _ in JOURNEYS:
        if issue_s.startswith(k): return k
    return issue_s.split(" ")[0]
cnt = {k: C() for k, _ in JOURNEYS}
for r_ in rows: cnt[jkey(r_["issue"])][r_["cls"]] += 1
for (iss, title, view, contr, div, conf) in APP_ONLY: cnt[jkey(iss)][NR] += 1
w("| Jornada | Issue | " + " | ".join(f"`{c}`" for c in CLS) + " | Total |")
w("|---|---|" + "---:|" * (len(CLS) + 1))
tot = C()
for k, t in JOURNEYS:
    c = cnt[k]; tot.update(c)
    w(f"| {t} | {k} | " + " | ".join(str(c[x]) for x in CLS) + f" | {sum(c.values())} |")
w("| **Total** | | " + " | ".join(f"**{tot[x]}**" for x in CLS) + f" | **{sum(tot.values())}** |")
w("")
nframes = len([r_ for r_ in rows if r_["row"] != "elemento"])
w(f"{nframes} frames primários (mais 1 linha de elemento, \"Já tenho conta\") e {len(APP_ONLY)} linhas do app sem frame. As linhas `NO_FIGMA_REFERENCE` com várias issues contam na primeira. Os frames 72 `805:410` e `805:492` (referência do Hoje bloqueado no piloto) contam no #99, que tem a correção.")
w("")
fut = [r_ for r_ in rows if "[FUTURO" in r_["name"] or "[V1: oculto" in r_["name"]]
w(f"Dos `NOT_IMPLEMENTED`, {len(fut)} são frames `[FUTURO]` ou `[V1: oculto até …]`, corretos fora da tela. Os 16 frames `[V1: usar variante sem FC ao vivo]` da 40 são comparados com a tela de corrida, tendo como referência a fileira V1 `879:3062`.")
w("")

# matrix
w("## 3. Matriz")
w("")
w("Colunas: nó Figma (gêmeo de motion) → página → tela → variante/estado → SwiftUI → contratos → issue → classe → evidência → divergências concretas. \"conflito — decisão pendente\" marca um conflito Figma × motor, listado também em §7.")
w("")
cur = None
for r_ in rows:
    if r_["page"] != cur:
        cur = r_["page"]
        w(f"### {cur}")
        w("")
        w("| Nó Figma | Página | Tela | Variante / estado | SwiftUI | Contratos | Issue | Classe | Evidência | Divergências concretas |")
        w("|---|---|---|---|---|---|---|---|---|---|")
    node = f"`{r_['id']}`" + (f" (`{r_['twin']}`)" if r_["twin"] else "")
    if r_["conf"] and not KEYS.get(r_["id"]): sys.exit("conflict without theme: " + r_["id"])
    ks = "/".join(KEYS.get(r_["id"], [])) if r_["conf"] else ""
    div = esc(r_["div"]) + (f" **Conflito — decisão pendente ({ks}):** {esc(r_['conf'])}" if r_["conf"] else "")
    w(f"| {node} | {r_['page'][:2]} | {esc(r_['screen'])} | {esc(r_['variant'])} | {esc(r_['view'])} | {esc(r_['contr'])} | {r_['issue']} | `{r_['cls']}` | {esc(r_['ev'])} | {div} |")
    # page close handled by next header
w("")

w("## 4. Telas e elementos do app sem frame (`NO_FIGMA_REFERENCE`)")
w("")
w("| # | Tela / elemento | SwiftUI | Contratos | Issue | Classe | Evidência | Divergências concretas |")
w("|---|---|---|---|---|---|---|---|")
for n_, (iss, title, view, contr, div, conf) in enumerate(APP_ONLY, 1):
    ks = "/".join(KEYS.get(f"A{n_}", []))
    if conf and not ks: sys.exit(f"app-only conflict without theme: A{n_}")
    d = esc(div) + (f" **Conflito — decisão pendente ({ks}):** {esc(conf)}" if conf else "")
    w(f"| A{n_} | {esc(title)} | {esc(view)} | {esc(contr)} | {iss} | `{NR}` | {NV} | {d} |")
w("")

w("## 5. Telas aprovadas que faltam no app")
w("")
w("Frames `NOT_IMPLEMENTED` fora das tags `[FUTURO]`/`[V1: oculto]`. A página 83 ainda está \"A aprovar\" no Guia.")
w("")
for pg in PAGES:
    miss = [r_ for r_ in rows if r_["page"][:2] == pg and r_["cls"] == N and r_["row"] != "elemento" and r_ not in fut]
    if not miss: continue
    pname = miss[0]["page"]
    w(f"- **{pname}** ({len(miss)}): " + "; ".join(f"`{m['id']}` {esc(m['screen'])}" + (f" · {esc(m['variant'])}" if m['variant'] != '—' else "") for m in miss) + ".")
w("")
w("Telas `[FUTURO]`/`[V1: oculto]` (corretas fora da tela; o addendum pede o componente completo e oculto, que não existe): " + ", ".join(f"`{r_['id']}`" for r_ in fut) + ".")
w("")

# fix lists
w(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixes.md")).read().rstrip())
w("")
# conflicts
w("## 7. Conflitos Figma × motor — decisão pendente")
w("")
w("Registrados, não resolvidos (PRODUCT_SCOPE: nenhum agente resolve conflito de produto criando uma tela diferente). Cada linha da matriz com conflito cita a chave.")
w("")
w("| # | Tema | Conflito | Onde |")
w("|---|---|---|---|")
for k, t, desc, where in THEMES:
    w(f"| {k} | {t} | {esc(desc)} | " + ", ".join(f"`{x}`" if ":" in x else f"§4 {x}" for x in where.split()) + " |")
w("")
open(out, "w").write("\n".join(L) + "\n")
print("rows", len(rows), "app-only", len(APP_ONLY), "themes", len(THEMES))
print({k: dict(v) for k, v in cnt.items()})
