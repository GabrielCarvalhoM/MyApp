"""Integrate independently authored records and queue without claiming authorship of judgments."""
from pathlib import Path
import json,hashlib,datetime,collections
P=Path(__file__).resolve().parents[2];A=Path(__file__).resolve().parent;D=P/'product/candidates/autonomous-coaching-foundation/1.0.0'
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
write=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
raw=load(D/'reviews/INDEPENDENT_SCIENTIFIC_DECISIONS.json')
records=raw if isinstance(raw,list) else raw.get('decisions',raw.get('records'))
assert records and len({r['review_id'] for r in records})==len(records)
for r in records:
    assert r['reviewer']['independent_of_target_author'] is True
    assert sha(P/r['target']['artifact'])==r['target']['sha256'],r['review_id']+' stale target'
queuepath=P/'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'
before=load(A/'before/reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json')
queue=load(queuepath);assert queue['items'][:46]==before['items'] and len(before['items'])==46
assert queue['funding_trigger']==before['funding_trigger'] and queue['funding_trigger']['state']=='NOT_DECLARED'
existing={x['queue_id']:x for x in queue['items']};new=[]
approved=[r for r in records if r['disposition'] in ['APPROVE','APPROVE_WITH_CONDITIONS'] and r['scope']['prescriptive_impact']]
for r in approved:
    pathtext,_,qid=r['human_revalidation']['queue_ref'].partition('#')
    assert (P/pathtext).resolve()==queuepath.resolve() and qid
    entry={'queue_id':qid,'decision_id':r['review_id'],'decision_revision':r['review_revision'],'target':r['target'],'approved_scope':r['question']+' / '+r['applicability'],'conditions':r['decision']['conditions'],'approval_date':r['review_date'],'state':'QUEUED_FOR_FUNDED_HUMAN_REVALIDATION','owner':'Chief / Founder','human_review':None,'re_review_triggers':r['expiry']['triggers']}
    if qid in existing:assert existing[qid]==entry,'Existing queue item differs; do not overwrite'
    else:new.append(entry);existing[qid]=entry
queue['queue_revision']='SSCTR-HRQ-20261023-ACF-r1';queue['items']+=new
write(queuepath,queue)
# Installed validator requires a closed one-to-one queue subset. This is a projection for validation, not a competing queue.
projection={k:v for k,v in queue.items() if k!='items'};projection['items']=[existing[r['human_revalidation']['queue_ref'].partition('#')[2]] for r in approved]
write(A/'NEW_APPROVALS_QUEUE_PROJECTION.json',projection)
update={'revision':'ACF-HRQ-UPDATE-r1','canonical_queue':'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json','before_sha256':sha(A/'before/reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'),'after_sha256':sha(queuepath),'prior_items_preserved':46,'new_approval_items':len(approved),'total_items':len(queue['items']),'funding_trigger':queue['funding_trigger'],'human_review_claimed':False,'new_queue_ids':[r['human_revalidation']['queue_ref'].partition('#')[2] for r in approved],'limits':'Only exact approved prescriptive impacts are added. Limited recommendations, abstentions and unsupported positive doses are not promoted. Projection is a validation view, never another queue.'}
write(D/'HUMAN_REVALIDATION_QUEUE_UPDATE.json',update)
counts=dict(collections.Counter(r['disposition'] for r in records))
registry={'revision':'ACF-SCI-REG-r1','foundation_revision':'ACF-1.0.0-r1','foundation_authority':'CANDIDATE / NON-AUTHORITATIVE','agent':'SSCTR-1.0.0','native_dispatch':False,'review_instance':'/root/ssctr_adversarial','mode':'PERMITTED_FRESH_DEFAULT_FALLBACK','author_instances':['/root','/root/prescription_author','/root/coaching_systems_author'],'synthesis_instance':'/root/ssctr_synthesis','independent_governance_instance':'/root/governance_judge','decision_count':len(records),'disposition_counts':counts,'records_ref':'reviews/INDEPENDENT_SCIENTIFIC_DECISIONS.json','records_sha256':sha(D/'reviews/INDEPENDENT_SCIENTIFIC_DECISIONS.json'),'decisions':records,'queue_update_ref':'HUMAN_REVALIDATION_QUEUE_UPDATE.json','publication_status':'NOT_PUBLISHED','whole_gate_closure':False,'runtime_authorized':False,'historical_cases_relabelled':False,'rule':'Independent record conditions bound each policy/recipe/action. An approval of contract/control does not approve every positive dose or entire family. Author-PENDING statuses are preserved snapshots; this registry is the exact disposition overlay.'}
write(D/'SCIENTIFIC_DECISION_REGISTRY.json',registry)
md='# Scientific Decision Registry\n\nACF-SCI-REG-r1 · autoridade científica interna provisória SSCTR-1.0.0. Fundação candidata, sem publicação/Truth/runtime. Autores, síntese, adversarial e governance são instâncias separadas; fallback default permitido, sem credencial humana.\n\n'
md+=f'{len(records)} decisões independentes: '+', '.join(f'{k}={v}' for k,v in counts.items())+'. Cada aprovação só cobre o escopo/condições escritos; não transformar controle aprovado em dose aprovada.\n\n| Review | Itens | Disposição | Limite/condições |\n|---|---|---|---|\n'
for r in records:md+=f'| {r["review_id"]} | {", ".join(r["target"]["rule_ids"])} | {r["disposition"]} | '+r['applicability'].replace('|','/')+' '+'; '.join(r['decision']['conditions']).replace('|','/')+' |\n'
md+=f'\nFila única:46 itens anteriores preservados +{len(approved)} novos approvals prescritivos ={len(queue["items"])}. Funding NOT_DECLARED; todos pendentes de futura revalidação humana financiada. Nenhuma validação humana ou clínica é alegada. Profissional futuro pode manter, alterar ou revogar sem veto. Veja HUMAN_REVALIDATION_QUEUE_UPDATE.json e registros completos com hashes/fontes.\n'
(D/'SCIENTIFIC_DECISION_REGISTRY.md').write_text(md,encoding='utf8')
print(json.dumps({'records':len(records),'dispositions':counts,'new_queue':len(approved),'prior_preserved':46,'total_queue':len(queue['items'])},ensure_ascii=False,indent=2))
