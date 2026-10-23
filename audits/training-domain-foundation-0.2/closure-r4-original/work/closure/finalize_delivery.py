from pathlib import Path
import json,hashlib,datetime,zipfile
R=Path(__file__).resolve().parents[2];O=R/'outputs/closure-r4'
def read(p):return json.loads(p.read_text(encoding='utf8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
d=read(O/'validation-final.json');reviews=read(O/'review-index.json');b=d['baseline']['summary']['all']['counts'];a=d['summary']['all']['counts']
rows='\n'.join(f'| {k} | {b[k]} | {a[k]} |'for k in ['PASS','ACCEPTABLE','QUESTIONABLE','WRONG','DANGEROUS'])
cov=d['closure_coverage'];gaps=cov.get('gaps',cov.get('records',[]))
coverage_rows='\n'.join(f"| {g['id']} | {g.get('title',g.get('name',''))} | Tratado; ver witness e limites em COVERAGE.md |"for g in gaps)
text=f'''# Adaptive Engine — fechamento documental r4

Revisão **{d['revision']}**, 22/10/2026, America/Sao_Paulo. Baseline **AE-DOC-20261022-r3** preservada por SHA-256.

**Veredito: NO-GO para futura implementação do runtime prescritivo como autoridade final de treino.** A missão de auditoria foi executada com bloqueios explícitos; o fechamento esportivo não está concluído. Infraestrutura neutra/fixtures sintéticas podem ser objeto de futura missão autorizada, **GO WITH FIXES**. Nenhuma implementação ou alteração no Figma ocorreu.

| Mesma base de 89 registros | r3 | r4 |
| --- | ---: | ---: |
{rows}

São os mesmos **80 cenários + 9 sequências**, com as mesmas **10 dimensões/890 células**. Witnesses novos e suas variantes ficam fora desse denominador. Zero WRONG/DANGEROUS demonstrados não é taxa de segurança. PASS continua restrito à coerência documental exercitada; NOT_EVALUABLE_DOMAIN permanece um eixo paralelo.

## Etapa 1 — FIX-01 / P1

**8/8 oráculos migrados explicitamente;0/8 positivos esportivos originais fechados;8/8 bloqueados por política/witness aplicável.** S01, S02, S05, S12, S13, S14, S28 e S29 conservam QUESTIONABLE. Cada registro contém adequacy, fato material, necessity, KEEP insuficiente ou indeterminado, opções0–6 e suas razões, ChangeCostRule, alcance/horizonte, preserve/modify, trade-off, must-not, agência, confiança e next check. “Indeterminado” não foi preenchido com uma dose inventada.

Cinco extensões fornecem witnesses lógicos concretos: pares S01/S02 de colisão de agenda; S13/S14 com bloco essencial versus opcional; S29 com fechamento de sala comunicado após início. Três extensões são simbólicas/controle. As premissas acrescentadas estão registradas e não substituem o input original. Resolver inexequibilidade de agenda não prova que a proximidade de lower/threshold exija MOVE num atleta real.

Oito QUESTIONABLE continuam abertos. O nono, **FZ-S11**, passou a PASS somente no escopo documental: a redação abreviada foi qualificada pelas condições de DR-91 já vigente. A entrada e o oracle antigos permanecem preservados ao lado da emenda; isso não adiciona feature ou prova implementação de share.

Fontes: [migrações completas](FIX01.md), [registros estruturados](fix01.json) e [89 avaliações](validation-final.json).

## Etapa 2 — C1–C6

**6/6 tratados individualmente; nenhum dos seis é declarado integralmente fechado como competência esportiva/prescritiva.** Há witnesses com premissas explícitas e critérios de saída. A separação de fechamento lógico/contratual e esportivo consta de cada gap.

| Gap | Tema | Disposição |
| --- | --- | --- |
{coverage_rows}

C1 encadeia estado de treino, sinal isolado, convergência, ação mínima condicional, reavaliação/retorno, falta confirmada sem reposição e recuperação acumulada. Não estima dívida fisiológica por um escalar ou assume que um dia melhor libera carga. C2/C3 explicitam preferência de double, janelas, ordem, horizonte, dominância/Pareto e a variante incomparável que exige ASK. Uma janela disponível não concede preferência ou aprovação de double.

C4 discrimina positivos limitados e graus sem witness: várias ações MOVE não viram automaticamente Level 5; INITIAL/RETURN não provam Level 6. Level 5/6 seguem sem positivo esportivo justificado. C5 usa evento real no horizonte, com participação de atleta/clock sintéticos e variantes hipotéticas cancelada/adiada. A São Silvestre de 15 km em 31/12/2026 é contexto verificável no [regulamento oficial](https://www.saosilvestre.com.br/regulamento/); isso não aprova taper, percentual ou espaçamento. C6 distingue execução dentro do envelope já aceito, nova mutação fora dele, progresso earned do próximo ciclo e evidência insuficiente. Estabilidade não pode proibir executar estrutura variável já adotada.

Veja [witnesses e critérios por gap](COVERAGE.md) e [inputs completos](coverage.json). Nenhum novo witness entra nos 89 para melhorar a distribuição.

## Etapa 3 — G01–G04

**0/4 gates profissionais fechados; todos HUMAN_REVIEW_REQUIRED.** Foram recuperadas as definições literais atuais, owners, triggers, limites e evidência de saída. Há 12 cláusulas documentais derivadas e evidence review com 12 fontes científicas, métodos, populações, contraevidência e limites. IDs PC-* são referências de submissão, não um registro concorrente de policies aprovadas.

- **G01:** profissional habilitado e escopo versionado de perfis/objetivos/repertório/equipamento, com casos positivos/negativos; qualificação jurídica já requerida na autoridade existente.
- **G02:** autoridade de treino aprova regras/revisões de sinais, instrumentos, adequação, materialidade, necessity, custo, intensidade/volume, spacing, substituição, progressão, deload/taper e trade-offs Balanced; Engineering prova device/execução quando aplicável.
- **G03:** Product/UX e profissional de treino aceitam critérios de aderência/parcial/tolerâncias por modalidade/sessão, incluindo correção e ausência de sync.
- **G04:** profissionais competentes aprovam classes concretas de restrição/retorno, urgência/copy, elegibilidade e evidência de saída; médico quando houver avaliação clínica. Score, confirmação ou LLM não dão clearance.

As revisões sobre treino concorrente distinguem força máxima, hipertrofia e potência e impedem regra universal de ordem/spacing. HRV depende de protocolo/referência individual; convergência de sinais não escolhe dose. Autorregulação e taper têm benefícios e limitações contextuais, sem superioridade garantida. Literatura não substitui aprovação aplicável nem valida eficácia/safety do Vilumo. Não se adicionou percentual, threshold clínico ou default supostamente seguro.

Veja [evidence review e submissão profissional](POLICY_EVIDENCE.md) e [definições/regras estruturadas](policy.json).

## Etapa 4 — Golden e mesma auditoria

**20/20 payloads materializados;10 fixtures de controle fechadas;10 com oracle esportivo pendente;0 executadas contra runtime;0 com gold profissional.** Cada Golden inclui athlete state, prioridade, histórico, sinais, planned week, atividades, constraints, preserve/modify, bounds somente quando defensáveis, must-not, agência, next-check invariants, eventos e expected assertions. Receitas opacas não recebem dose inventada. Min/max ficam nulos quando a ação esportiva não é decidível ou quando o outcome é HOLD/ASK.

As 10 fixtures de controle são FZ-S01, FZ-S02, S07, FZ-S07, SIL-S12, SIL-S04, S47, Q02, Q04 e Q07. As outras10 preservam o elo esportivo pendente. Fechamento de controle significa input e oracle contratual utilizáveis numa futura harness; não demonstra que qualquer software já os passe. Q07 começa de commit explicitamente legítimo no perfil de teste; a origem esportiva não foi declarada validada.

Dependentes e contrafactuais foram rebaseados com escopo explícito. S15/S32/S43/Q01/SIL-S01 mantêm os inputs e labels do corpus original; companions de controle não os substituem. As9 trajetórias Q foram reavaliadas integralmente. Novos witnesses têm dimensão e escopo próprios.

Só uma célula muda na base comparável: explainability de FZ-S11, PARTIAL→PASS, por emenda rastreável. Safety, goal, priority, interference, recovery, stability, MEC, progression e agency não recebem promoção por adicionar documentação. A principal melhora está na rastreabilidade, materialização e identificação das condições de suficiência ainda ausentes.

Veja [20 fixtures](golden-fixtures.json), [CSV](cases.csv), [dashboard](dashboard.html) e [checks objetivos](VERIFICATION.json). Checks de arquivo não são testes do motor.

## Revisão adversarial e decisão

{reviews['summary']}

Os pareceres são de instâncias independentes da autoria. [Disposição dos findings](REVISION_DISPOSITION.md), [índice de revisão](review-index.json) e [manifesto do input por hash](review-input-manifest.json) preservam escopo, REQUEST_CHANGES e limitações. Aceite de um relatório honesto de NO-GO não é aceite de runtime prescritivo.

## Riscos e próximo handoff

O maior risco novo é “lavar” input: trocar um conflito fisiológico incompleto por um exemplo fácil de agenda e alegar que o primeiro fechou. Outro é tratar20 arquivos estruturados como 20 oráculos esportivos aprovados. Também permanecem o risco de inflar Level 5/6, confundir ABOVE com fadiga e aplicar carga automaticamente após cancelamento de evento ou recuperação aparente.

O próximo handoff concreto é o pacote de submissão de treino: matriz G01 e regras/casos G02–G04 com responsável real, revisão/aplicabilidade, evidência positiva/negativa e assinatura rastreável. Após isso, reavaliar os mesmos positivos originais e os witnesses pendentes. **Não há GO prescritivo nesta rodada.** G09/prova runtime e G11/claims de efeito continuam dependências futuras nos triggers existentes, sem abrir essas implementações nesta missão.

Nenhum Figma, runtime, Canon, dado de atleta ou serviço externo foi alterado. O pacote é local; os artefatos r3 e fontes permanecem íntegros.
'''
(O/'RELATORIO_EXECUTIVO.md').write_text(text,encoding='utf8')
print('Report written',len(text.encode('utf8')))
