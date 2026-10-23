"""Author assessment of supplemental inputs; separate from the frozen 89-case cohort."""
def build(fix,coverage,dimensions):
    rows=[]
    def row(key,source,status,scope,active,why,evidence):
        rubric={k:{'label':label,'result':'N/E','rationale':'Não exercitada por este witness no escopo indicado; não conta como PASS.'}for k,label in dimensions.items()}
        for k,(state,rationale) in active.items():rubric[k]={'label':dimensions[k],'result':state,'rationale':rationale}
        return {'id':key,'source':source,'classification':status,'scope':scope,'domain_status':'NOT_EVALUABLE_DOMAIN','in_main_89_denominator':False,'rationale':why,'rubric':rubric,'evidence_ref':evidence,'execution_status':'DOCUMENTARY_REASSESSMENT_NOT_EVALRUN'}
    for f in fix['records']:
        e=f['synthetic_extension'];sid=f['id'];strict=sid in ['S01','S02','S13','S14','S29']
        active={
          'agency':('PASS','Proposta/alcance e ato atuais, com revisão executada preservada; aprovação de teste não substitui autoridade real.'),
          'explainability':('PASS','Premissas acrescentadas, oracle original e dependência profissional explicitamente separados.')}
        if strict:
            active.update({'goal':('PASS','Preservação do propósito/conjunto requerido é premissa sintética visível, não resultado esportivo inferido.'),'stability':('PASS','Delta limitado aos objetos necessários para a restrição logística declarada; sem reconstrução ampla.'),'mec':('PASS','KEEP e opções menores não removem a inexequibilidade no conjunto finito explicitado; custo/alcance e restrições são rastreáveis.')})
            if sid in ['S01','S02']:active['priority']=('PASS','Mesmo input lógico e mesmos candidatos; somente prioridade explícita troca o objetivo protegido.')
        else:
            active.update({'goal':('PARTIAL','Receita/coverage aplicáveis não estão disponíveis para demonstrar preservação esportiva.'),'mec':('PARTIAL','A estrutura da migração está explícita, mas falta efeito/suficiência das alternativas reais.')})
            if sid in ['S05','S12']:active['recovery']=('PARTIAL','Enums/sinais ou ABOVE não escolhem dose nem provam inadequação/recuperação; sem regra aprovada.')
            if sid=='S28':active['safety']=('PASS','Sem retorno ou clearance inferido; ramo dependente retido enquanto autoridade real falta.')
        rows.append(row(e['id'],sid,'PASS' if strict else 'ACCEPTABLE','LOGICAL_CONTRACT_ONLY' if strict else 'SYMBOLIC_OR_CONTROL_ONLY',active,'Consistência lógica sob novas premissas declaradas; não fecha o input esportivo original.' if strict else 'Migração/limites defensáveis; positivo esportivo continua indeterminado.','fix01.json#'+sid+'/synthetic_extension'))
    for w in coverage['witnesses']:
        key=w['witness_id'];active={
          'agency':('PASS','Preferência/ato de escopo atual e validade de autoridade são distintos; nenhum aceite libera falta de política.'),
          'explainability':('PASS','Oracle condicional, entradas ausentes e limites de domínio são explicitamente legíveis.')}
        status='ACCEPTABLE';why='Witness documental condicionado a receitas/políticas ainda ausentes; não aprovado como decisão esportiva positiva.'
        if key=='Q-C1':
            active.update({k:('PARTIAL',reason)for k,reason in {
              'goal':'Semana e prioridades explícitas, mas sem dose/receita que prove preservação dos estímulos.',
              'priority':'Run-first declarado; efeitos esportivos das alternativas continuam condicionais.',
              'interference':'Run e Strength encadeados; efeitos de interação não fechados por receita aplicável.',
              'recovery':'Convergência e recuperação acumulada exercitadas como limites, sem modelo de dívida fisiológica validado.',
              'mec':'Adaptação mínima positiva depende da suficiência da receita não fornecida.',
              'progression':'Retorno/continuação requerem evidência e regra aplicáveis; não se fabrica progresso ou dívida.'}.items()})
            active['stability']=('PASS','Trajetória preserva versões/história; sinal isolado, recusa e repetição não geram tremor de controle.')
            active['safety']=('PASS','Retorno e liberação não ocorrem automaticamente por um autorrelato melhor; controle depende de regra/autoridade atual.')
        elif key in ['FZ-S06-DOUBLE','FZ-S06-PARETO']:
            active.update({'goal':('PARTIAL','Preservação dos dois intentos depende de payloads/efeitos ainda não sustentados.'),'priority':('PASS','Coprimários Balanced sem pesos ocultos; dominância apenas quando efeitos/admissibilidade forem sustentados.'),'interference':('PARTIAL','Janelas e ordem concretas; spacing/horizonte esportivos continuam sem aprovação.'),'recovery':('PARTIAL','Efeito no próximo estímulo foi exposto, sem transformá-lo em intervalo seguro.'),'mec':('PARTIAL','Mover resolve a colisão logística, mas menores receitas/esforços não estão fechados para mínimo esportivo.')})
        elif key=='FZ-S06-NO-DOMINANCE':
            active['priority']=('PASS','Sem dominância nem trade-off aprovado, perguntar só se preferência for a única lacuna; ausência profissional mantém controle próprio.')
        elif key=='FZ-S06-DOUBLE-REFUSED':
            active['stability']=('PASS','Recusa escopada sobrevive a replay/ID novo; janela livre não implica preferência.')
        elif key=='FZ-S01-LEVEL0':
            status='PASS';why='Positivo de contrato para plano explicitamente adequado no perfil de teste; sem mutação.'
            active['stability']=('PASS','Mesmo plano/revisão/export/avisos; só Athlete Model muda na finalidade permitida.')
        elif key=='FZ-S03-LEVEL1':
            active['mec']=('PARTIAL','Nenhum microdelta concreto com suficiência esportiva foi materializado; o witness registra a falta em vez de selecionar um parâmetro.')
        elif key=='SIL-S09-SUBSTITUTION':
            active.update({'goal':('PARTIAL','Propósito/estímulo preservado precisa de catálogo/receita; mesmo músculo não basta.'),'interference':('PARTIAL','Demanda e corrida seguinte ficam explícitas, porém não mensuradas/validadas.'),'recovery':('PARTIAL','Nenhum custo axial/excêntrico desconhecido vira baixo por default.'),'mec':('PARTIAL','Substituição positiva condicionada; inferiores e payload real não fechados.')})
        elif key in ['FZ-S09-LEVEL5-UNFILLED','FZ-S09-LEVEL6-UNFILLED']:
            why='Slot deliberadamente não preenchido: ausência de positivo não foi convertida em prova de replan.'
            active['mec']=('PARTIAL','Sem exclusão sustentada de todos os menores, não existe seleção positiva de Level5/6; INITIAL/RETURN não suprem a lacuna.')
        elif key.startswith('SIL-S10-'):
            active['goal']=('PARTIAL','Evento real no horizonte e preferência temporal são contexto; receita de taper/continuação permanece opaca.')
            active['progression']=('PARTIAL','Fase programada não prova ganho/perda; cancelamento/adiamento não escolhem nova carga.')
            active['stability']=('PASS','Executar fase já aceita não cria mutação; fato de evento novo invalida dependentes, sem restauração automática de volume.')
        elif key=='SIL-S05-ENVELOPE':
            status='PASS';why='Distinção de contrato fechada: membro já aceito e ainda válido é execução, não nova mutação ou progresso conquistado.'
            active.update({'stability':('PASS','Preserva conteúdo/revisão do plano ao selecionar membro autorizado.'),'progression':('PASS','Não confunde execução variável já aceita com nova progressão earned; conteúdo esportivo continua sem gold.')})
        elif key=='SIL-S05-OUTSIDE':
            status='PASS';why='C fora do envelope não herda ato anterior nem se torna autorregulação preaceita.'
            active.update({'stability':('PASS','Vigente explicitamente adequado no perfil de teste é conservado.'),'progression':('PASS','Novo delta exige necessidade/receita/ato próprios; renomear como progressão não os concede.')})
        elif key=='SIL-S05-EARNED-NEXT-CYCLE':
            active['progression']=('PARTIAL','Oportunidade/critério e dose comparável reais não fornecidos; futuro candidato não é autoaplicado.')
            active['stability']=('PASS','Próximo ciclo é proposta separada e não reconstrói a semana adequada por calendário.')
        elif key=='SIL-S05-UNKNOWN-EVIDENCE':
            status='PASS';why='Fatos/unknown preservados; ausência de evidência earned não bloqueia envelope válido nem inventa RIR.'
            active['progression']=('PASS','O controle impede classificação de progresso/aderência sem critério; não é prova de melhora fisiológica.')
        rows.append(row(key,','.join(w['source_ids']),status,'SYNTHETIC_CONTRACT_WITH_DOMAIN_OPEN',active,why,'coverage.json#'+key))
    return rows
