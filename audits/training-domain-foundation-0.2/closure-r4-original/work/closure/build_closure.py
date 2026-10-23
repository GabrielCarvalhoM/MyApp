"""Assemble a versioned documentary re-audit, never execute training decisions."""
from pathlib import Path
import json, copy, hashlib, csv, collections
from build_golden import build as build_golden
from supplemental_audit import build as supplemental_audit

R=Path(__file__).resolve().parents[2]; W=R/'work/closure'; O=R/'outputs/closure-r4'
REV='AE-CLOSE-20261022-r4'
STATUSES=['PASS','ACCEPTABLE','QUESTIONABLE','WRONG','DANGEROUS']
P1=['S01','S02','S05','S12','S13','S14','S28','S29']
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf8')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def summary(cs):
    out={}
    for name,rows in [('all',cs),('scenarios',[c for c in cs if c['type']=='scenario']),('sequences',[c for c in cs if c['type']=='sequence'])]:
        co=collections.Counter(c['classification'] for c in rows)
        out[name]={'total':len(rows),'counts':{s:co[s] for s in STATUSES},'percent':{s:round(100*co[s]/len(rows),2) for s in STATUSES}}
    return out

def main():
    b=read(R/'outputs/validation-final.json')
    for name in ['fix01','coverage','policy']:
        if not (W/(name+'.json')).exists():raise SystemExit('Required author artifact absent: '+name)
    fix,coverage,policy=[read(W/(n+'.json')) for n in ['fix01','coverage','policy']]
    d=copy.deepcopy(b);d['revision']=REV;d['scope']='Closure documental adversarial; sem runtime, observações humanas ou gold profissional. Extensões sintéticas não substituem os inputs r3.'
    d['review_status']='Consultar review-index.json e pareceres independentes por hash. Este payload não presume resultado de revisão.'
    d['baseline']={'revision':b['revision'],'path':'../validation-final.json','sha256':sha(R/'outputs/validation-final.json'),'summary':b['summary'],'property_results':b['property_results']}
    d['rubric_contract']={'primary':{'PASS':'Decisão boa e coerente no escopo documental exercitado','ACCEPTABLE':'Defensável, com fragilidade/fechamento limitado','QUESTIONABLE':'Trade-off, evidência ou estabilidade mal resolvidos','WRONG':'Contraria objetivo, prioridade ou evidência de modo demonstrado','DANGEROUS':'Recomendação fisicamente irresponsável demonstrada'},'dimensions':b['dimensions'],'cells':['PASS','PARTIAL','FAIL','N/E'],'ne_rule':'Propriedade não exercitada: N/E, sem contá-la como PASS ou no denominador avaliável. NOT_EVALUABLE_DOMAIN é eixo paralelo, não classificação automática.','no_composite_score':True,'source':'R3 e rubrica da conversa de referência, preservadas sem recalibrar.'}
    d['fix01']=fix;d['closure_coverage']=coverage;d['sport_policy']=policy
    d['gaps']=coverage.get('gaps',coverage.get('records',[]))
    d['coverage']={'source':'coverage.json','note':'Current C1–C6 dispositions replace the r3 proposal-only view; sporting and contract closure are separate.'}
    d['golden_uncovered_slots']=coverage.get('golden_slot_dispositions',coverage.get('golden_slots',coverage.get('slots',[])))
    for oldfix in d['fixes']:
        oldfix['status']='CLOSED_DOCUMENTARY_ALIGNMENT' if oldfix['id']=='FIX-06' else 'TREATED_WITH_REMAINING_DEPENDENCIES'
        if oldfix['id']=='FIX-01':oldfix['action']='Eight explicit migrations in fix01.json; original positive actions blocked by applicable sports policy. Do not substitute synthetic extensions for original inputs.'
        if oldfix['id']=='FIX-04':oldfix['action']='Control companion rebases specified; Q07 Golden starts from explicitly legitimate simulated scheduling commit. Main sporting premises remain open.'
        if oldfix['id']=='FIX-05':oldfix['action']='C1–C6 witnesses and limitations in coverage.json; domain approval G01–G04 remains open.'
    d['source_current_verification']=[{'path':x['relative'],'sha256':x['sha256'],'current_matches':Path(x['source']).exists() and sha(Path(x['source']))==x['sha256']} for x in read(R/'inputs/manifest.json')]
    for c in d['cases']:
        c['baseline_classification']=c['classification']
        c['reassessment']={'status':'RECHECKED','method':'Source input/oracle and all 10 r3 cells re-read against unchanged current authority; new closure evidence tested for relevance. No promotion from new inputs.','source_bytes_unchanged':True,'changed_dimensions':[],'new_input_substitution':False}
        c['rubric_before']={k:v['result'] for k,v in c['rubric'].items()}
        if c['id'] in P1:
            c['decision']='Migração explícita documentada; a decisão positiva do input original continua NOT_EVALUABLE. Falta política aplicável/receita ou witness de suficiência. HOLD/ASK apenas conforme a causa e o escopo na instância futura.'
            c['rationale']='FIX-01 agora expõe adequacy, material fact, necessity, KEEP insuficiente, alternativas, custo, horizonte e agência. Não há autoridade para preencher o elo esportivo ausente; a extensão sintética é outro input e não resolve o oracle original.'
            c['fix_required']='FIX-01 / HUMAN_REVIEW_REQUIRED — ver registro individual e G01–G04 conforme dependência'
            c['evidence']+=' | R4: fix01.json, registro '+c['id']+'; política profissional continua aberta.'
            c['confidence']='Alta quanto à identificação da dependência e limites; insuficiente para selecionar prescrição real do caso original.'
            c['next_check']='Cumprir os critérios de saída e aprovações do registro FIX-01/'+c['id']+'; então reavaliar o mesmo input, alternativas menores e horizonte com revisão independente.'
            for k in ['mec','stability','explainability']:
                if c['rubric'][k]['result']=='PARTIAL':
                    c['rubric'][k]['rationale']='R4: migração explícita deixa a dependência verificável, mas a menor alteração suficiente do input original ainda não está provada por política/witness esportivo. A extensão sintética não autoriza promover esta célula.'
        if c['id']=='FZ-S11':
            c['oracle_amendment']={'id':'R4-FZ11-ALIGNMENT','kind':'CURRENT_AUTHORITY_CLARIFICATION_ONLY','supersedes':'abbreviated route exclusion in this one r3 oracle','source':'PDR current overlay lines16 and DR-91 line201; CI-3.3.0 authority filter','new_oracle':'Saúde, terceiros e metadados ocultos excluídos; sem auto-post. Rota própria de corrida concluída só por escolha explícita em cada artefato, desligada por padrão, corte fixo início/fim, linha abstrata sem mapa/horário; foto composta no aparelho e sem metadados. Condições de exposição/implementação continuam não provadas. Unknown não completa semana e descanso correto não quebra streak.'}
            c['classification']='PASS';c['fix_required']='—'
            c['rationale']='A ambiguidade abreviada foi removida pela qualificação literal da autoridade já vigente DR-91. Não se criam comportamento, rollout ou prova de implementação de share. O oracle r3 original permanece lado a lado com a emenda.'
            c['rubric']['explainability']={'label':b['dimensions']['explainability'],'result':'PASS','rationale':'Emenda R4-FZ11-ALIGNMENT distingue exclusão de dados sensíveis e escolha explícita de rota própria nas condições exatas de DR-91; nenhum claim de implementação ou efeito humano.'}
            c['reassessment']['changed_dimensions']=['explainability']
        c['partial_or_failed_dimensions']=[v['label'] for v in c['rubric'].values() if v['result'] in ['PARTIAL','FAIL']]
        c['reassessment']['label_changed']=c['classification']!=c['baseline_classification']
    d['summary']=summary(d['cases']);d['counts']=d['summary']['all']['counts']
    d['property_results']={}
    for k,label in d['dimensions'].items():
        co=collections.Counter(c['rubric'][k]['result'] for c in d['cases'])
        d['property_results'][k]={'label':label,**{s:co[s] for s in ['PASS','PARTIAL','FAIL','N/E']},'assessable':89-co['N/E']}
    for p in d['priority_results']:
        rows=[c for c in d['cases'] if p['priority'] in c['priority_modes']];co=collections.Counter(c['classification'] for c in rows)
        p.update({'total':len(rows),'counts':{s:co[s] for s in STATUSES},'percent':{s:round(100*co[s]/len(rows),2) for s in STATUSES}})
    fixtures=build_golden(b,fix)
    d['golden']=fixtures
    d['golden_summary']={'existing_records':20,'materialized':len(fixtures),'closed_control_fixture':sum(f['readiness']=='CLOSED_CONTROL_FIXTURE' for f in fixtures),'materialized_domain_open':sum(f['readiness']=='MATERIALIZED_DOMAIN_OPEN' for f in fixtures),'professionally_approved':0,'executed_against_runtime':0,'meaning':'Materialização, fechamento do oracle de controle e aprovação esportiva são contagens distintas.'}
    d['supplemental_assessments']=supplemental_audit(fix,coverage,d['dimensions'])
    co=collections.Counter(s['classification']for s in d['supplemental_assessments'])
    d['supplemental_summary']={'total':len(d['supplemental_assessments']),'source_groups':{'fix01_extensions':8,'coverage_witnesses':len(coverage['witnesses'])},'counts':{s:co[s]for s in STATUSES},'domain_approved':0,'not_in_core_89':True,'unit':'Documentary witness or explicit unfilled-slot record; not athletes or runtime executions'}
    d['comparison']={'core_before':b['summary'],'core_after':d['summary'],'questionable_resolved':['FZ-S11'],'questionable_remaining':[c['id'] for c in d['cases'] if c['classification']=='QUESTIONABLE'],'p1':{'treated':8,'original_positive_closed':0,'explicitly_blocked':P1},'gates':{'treated':['G01','G02','G03','G04'],'fully_closed':[],'status':'HUMAN_REVIEW_REQUIRED'},'golden_before':{'records':20,'materialized':0,'closed_control_fixture':0,'pending':20},'golden_after':d['golden_summary'],'scope_note':'Exactly the same 89 core records and rubric. Supplemental witnesses and hypothetical branches have a separate denominator.'}
    d['blockers']=[
      {'id':'B1','title':'Oráculos originais agora migrados explicitamente, mas sem fechamento positivo esportivo','status':'BLOCKED_EXTERNAL_POLICY','evidence':'8/8 tratados; 0/8 positivos originais fechados. Alternativas e dependências explícitas; extensões sintéticas não apagam QUESTIONABLE.','owner':'AE owner + autoridade real G01/G02/G03/G04 por caso','scope':'Antes de congelar as ações esportivas originais'},
      {'id':'B2','title':'G01–G04 exigem aprovadores e regras reais','status':'HUMAN_REVIEW_REQUIRED','evidence':'Definições exatas recuperadas; propostas/evidência não são assinatura profissional. Quatro gates seguem abertos.','owner':'Owners exatos PDR §5','scope':'Antes de implementação como autoridade prescritiva final / ativação no trigger específico'},
      {'id':'B3','title':'Cobertura esportiva e Golden ainda têm elos não demonstrados','status':'PARTIAL_DOCUMENTARY_CLOSURE','evidence':'C1–C6 tratados; witnesses e fixtures materializados, com suficiência esportiva ainda limitada. Sem positivo5/6 fabricado.','owner':'Treino + AE + Quality','scope':'Antes de declarar competência prescritiva / Golden de domínio completo'}]
    d['failure_queue']=[{'id':c['id'],'classification':c['classification'],'fix':c['fix_required'],'rationale':c['rationale'],'owner':'AE + domain owner' if c['id'] in P1 else 'AE/domain/Quality conforme dependência'} for c in d['cases'] if c['classification'] in ['QUESTIONABLE','WRONG','DANGEROUS'] or(c['classification']=='ACCEPTABLE' and c['fix_required']!='—')]
    d['rebases']=[{'id':s,'source_input_preserved':True,'dependent_on':'S01/F-CROSS','rebase_scope':'Companion control fixture uses new explicitly simulated scheduling witness with current adequacy/necessity/cost/act. Original athletic choice stays blocked.','classification_promoted':False} for s in ['S15','S32','S43','Q01','Q07','SIL-S01']]
    d['counterfactual_rebase']=[{'id':'CF1','fixed':'Original F-CROSS unchanged; migrated limitations now explicit. Only goal revision may change in the original priority pair.','result':'Original Run/Strength ranking still conditional; no positive dose/spacing rule from scheduling witness. Balanced concrete companion is separate.','status':'PARTIAL'}, {'id':'CF2','fixed':'Same active safety restriction across Run-first/Strength-first/Balanced','result':'Same scoped HOLD; no priority flip may grant clearance','status':'PASS_CONTROL'}, {'id':'CF3','fixed':'Isolated vs convergent signal family; no numeric threshold added','result':'Observation does not itself establish inadequacy or dose; G02 remains required','status':'PARTIAL'}, {'id':'CF4','fixed':'F-KEY criticality HIGH vs LOW, all original facts fixed','result':'No forced move/reduction winner until essential stimulus, smaller alternatives and cost are supported','status':'QUESTIONABLE'}]
    d['counterfactuals']=d['counterfactual_rebase']
    d['patterns']=[{'when':'KEEP / learn','scope':'Adequacy and authority must be valid; Athlete Model update is separate from plan content'}, {'when':'Mutation','scope':'Material fact, necessity, smaller alternatives, full effect/cost/horizon and current agency are required; labels alone do not prove sufficiency'}, {'when':'HOLD / ASK','scope':'Cause-scoped missing authority or decisive context; not an ordinal change level or clinical diagnosis'}]
    d['new_risks']=[
      'Input laundering: substituting an easy scheduling extension for an unresolved fatigue/physiology input would falsely close FIX-01.',
      'Fixture completeness can be mistaken for a clinically or professionally approved training oracle; closed-control and domain-open are explicit.',
      'Counting several MOVE deltas as Level5, or INITIAL/RETURN as Level6, would manufacture coverage.',
      'A real event date provides temporal context but cannot choose taper dose or automatically restore load after cancellation.',
      'A signal convergence or ABOVE adherence enum cannot itself prove recovery debt, inadequacy, causality or a dose response.'
    ]
    d['improvements']=['Eight legacy oracles now expose every migration requirement and the missing sporting link','Twenty Golden input payloads with event variants and machine-readable expected control invariants','Multi-day/double/Balanced/taper/envelope witnesses separated from baseline labels','Exact G01–G04 ownership and exit evidence, with current scientific counterevidence','FZ-S11 abbreviated oracle aligned to existing DR-91, preserving the old text']
    d['limits']=[
      'Documentary re-audit by AI, without runtime, athlete data, clinical validation or competent human sports gold.',
      'The core denominator stays89 (80 scenarios+9 sequences),890 rubric cells. New witnesses/branches are supplemental, not more independent athlete observations.',
      'PASS is scoped documentary consistency; zero WRONG/DANGEROUS is not a safety rate. Unknown domain conclusions remain NOT_EVALUABLE_DOMAIN.',
      'Literature supports constraints, uncertainty and candidate evaluation; it cannot satisfy actual professional approvals required by G01–G04.',
      'Dose absent in sources was not filled. Opaque recipes and assumed candidate effects are marked; those dependent sports assertions remain open.',
      'Ten Golden close control invariants only; ten remain domain-open. None has been executed against an Adaptive Engine or approved for real training.',
      'All6 coverage gaps are treated; detailed synthetic witnesses are not a claim that all6 sporting gaps are closed.',
      'No product runtime, Figma, canonical publication, cycling/swimming/social/nutrition expansion or external service change.'
    ]
    d['reviews']=[{'perspective':p,'reviewer':'fresh independent instance','file':'../../reviews/closure-r4/'+f+'.md'} for p,f in [('Sports / training logic','sports'),('AE / governance consistency','governance'),('Product safety / evidence','safety')]]
    O.mkdir(parents=True,exist_ok=True)
    write(O/'validation-final.json',d);write(O/'golden-fixtures.json',{'revision':REV,'fixtures':fixtures})
    write(O/'supplemental-assessments.json',{'revision':REV,'summary':d['supplemental_summary'],'assessments':d['supplemental_assessments']})
    for name in ['fix01','coverage','policy']:(O/(name+'.json')).write_bytes((W/(name+'.json')).read_bytes())
    for source,target in [('FIX01.md','FIX01.md'),('COVERAGE.md','COVERAGE.md'),('POLICY_EVIDENCE.md','POLICY_EVIDENCE.md')]:
        if (W/source).exists():(O/target).write_bytes((W/source).read_bytes())
    with (O/'cases.csv').open('w',encoding='utf-8-sig',newline='') as out:
        fields=['id','type','priority','baseline_classification','classification','domain_status','decision','preserve','modify','change_level','tradeoff','must_not','user_action','confidence','next_check','rationale','fix_required']+[k+'_'+part for k in d['dimensions'] for part in ['result','rationale']]
        w=csv.DictWriter(out,fields);w.writeheader()
        for c in d['cases']:
            row={k:c[k] for k in fields if k in c}
            for k in d['dimensions']:
                for part in ['result','rationale']:row[k+'_'+part]=c['rubric'][k][part]
            w.writerow(row)
    print(json.dumps({'summary':d['summary']['all'],'golden':d['golden_summary']},ensure_ascii=False))

if __name__=='__main__':main()
