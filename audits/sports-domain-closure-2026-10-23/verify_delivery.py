"""Checks documentary artifacts. Does not execute or validate training efficacy."""
from pathlib import Path
import collections, hashlib, importlib.util, json, re, sys
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[2]
AUDIT=Path(__file__).resolve().parent
OUT=ROOT/'reviews/sports-domain-closure/2026-10-23'
sys.path.insert(0,str(Path.home()/'AppData/Local/Temp/vilumo-sports-review-validation-deps'))
from jsonschema import Draft202012Validator, FormatChecker
checks=[]
def load(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def ck(k,v,detail=None): checks.append(dict(check=k,passed=bool(v),detail=detail))
def diff(a,b,p=''):
    if a==b:return []
    if isinstance(a,dict) and isinstance(b,dict):
        return [x for k in set(a)|set(b) for x in diff(a.get(k),b.get(k),p+'.'+k if p else k)]
    if isinstance(a,list) and isinstance(b,list) and len(a)==len(b):
        return [x for i,(aa,bb) in enumerate(zip(a,b)) for x in diff(aa,bb,f'{p}[{i}]')]
    return [p]
def main():
    required=['scientific/G01_COVERAGE_MATRIX.md','scientific/G01_COVERAGE_MATRIX.json','scientific/G02_POLICY_REGISTRY.md','scientific/G02_POLICY_REGISTRY.json','scientific/CASE_REVIEWS_S01_S29.md','scientific/CASE_REVIEWS_S01_S29.json','scientific/C1_C6_REVIEWS.md','scientific/C1_C6_REVIEWS.json','semantics/G03_REVIEW.md','semantics/G03_REVIEW.json','semantics/G04_NONCLINICAL_REVIEW.md','semantics/G04_NONCLINICAL_REVIEW.json','scientific/LITERATURE_SNAPSHOT.json','scientific/SEARCH_LOG.md','scientific/DECISIONS.json','AE_SUPPLEMENTAL_ASSESSMENTS.json','AE_VALIDATION_RERUN.md']
    for name in required:ck('deliverable:'+name,(OUT/name).is_file())
    baseline=load(AUDIT/'BASELINE.json')
    allowed={'CURRENT_MISSION.md','MISSION_LEDGER.md','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'}
    for f in baseline['files']:
        p=ROOT/f['path']
        if f['path'] not in allowed: ck('protected:'+f['path'],p.is_file() and sha(p)==f['sha256'])
    for p in OUT.rglob('*.json'):
        try: load(p);ck('json:'+p.relative_to(OUT).as_posix(),True)
        except Exception as e: ck('json:'+p.name,False,str(e))
    ae=load(OUT/'AE_VALIDATION_RERUN.json')
    r4=load(ROOT/ae['baselines'][1]['path'])
    ck('89-exact-ids',len(ae['cases'])==89 and {c['id'] for c in ae['cases']}=={c['id'] for c in r4['cases']})
    ck('890-cells',sum(len(c['rubric']) for c in ae['cases'])==890)
    ck('same-10-dimensions',ae['dimensions']==r4['dimensions'] and len(ae['dimensions'])==10)
    old={c['id']:c for c in r4['cases']}
    for c in ae['cases']:
        ck('frozen-input:'+c['id'],all(c[k]==old[c['id']][k] for k in ['source_input','source_oracle','source_line']))
        ck('strict-rubric:'+c['id'],c['rubric']==old[c['id']]['rubric'])
        ck('no-new-facts:'+c['id'],c['current_review']['input_augmented'] is False)
        ck('valid-cells:'+c['id'],all(v['result'] in ['PASS','PARTIAL','FAIL','N/E'] and v['rationale'] for v in c['rubric'].values()))
    for k,v in ae['counts'].items():ck('counts:'+k,v==sum(c['classification']==k for c in ae['cases']))
    for dim,vals in ae['property_results'].items():
        for k,v in vals.items():ck('cell-count:'+dim+':'+k,v==sum(c['rubric'][dim]['result']==k for c in ae['cases']))
    for b in ae['baselines']:ck('baseline-sha:'+b['revision'],sha(ROOT/b['path'])==b['sha256'])
    inventory=load(OUT/'GOLDEN_DOMAIN_FIXTURES/BASELINE_INVENTORY.json')
    ck('golden20',len(inventory['items'])==20 and len({x['scenario_id'] for x in inventory['items']})==20)
    sw=load(OUT/'semantics/SEMANTICS_WITNESSES.json')
    witnesses=sw['witnesses']
    ck('semantics-29-unique',len(witnesses)==len({w['id'] for w in witnesses})==29)
    ck('semantics-G03-19-G04-10',sum(w['id'].startswith('G03-') for w in witnesses)==19 and sum(w['id'].startswith('G04-') for w in witnesses)==10)
    for w in witnesses:
        ck('semantics-fields:'+w['id'],all(w.get(k) is not None for k in ['input','reconciled_fact','interpretation','action_bounds','expected_preserve','expected_modify','must_not','agency','re_review_trigger','evidence_refs']))
        ck('semantics-synthetic:'+w['id'],w.get('synthetic') is True and w.get('real_athlete_data') is False)
    for name in ['G03_REVIEW.json','G04_NONCLINICAL_REVIEW.json']:
        sem=load(OUT/'semantics'/name)
        for ref in sem['source_manifest']:
            if ref.get('path') and ref.get('sha256'):ck('semantic-source-current:'+ref['id']+':'+name,sha(ROOT/ref['path'])==ref['sha256'])
    st=next(w for w in witnesses if w['id']=='G03-W01')
    ck('strength-reps-arithmetic',sum(s['reps'] for s in st['input']['observed']['sets'])==st['reconciled_fact']['known_reps']==15)
    rt=next(t for t in sw['targets'] if t['ref']=='SEM-RUN-BASE@r1')
    computed=sum(b.get('duration_s',b.get('duration_s_each',0)*b.get('instances',1)) for b in rt['blocks'])
    work=next(b for b in rt['blocks'] if b['id']=='work')
    ck('run-structure-arithmetic',computed==rt['total_s']==2220 and work['instances']*work['duration_s_each']==rt['total_work_s']==1080)
    if not (OUT/'scientific/DECISIONS.json').exists():
        ck('scientific-decisions-present',False,'Author still working; precheck cannot pass')
    else:
        schema=load(ROOT/'governance/agents/sports-science-reviewer/decision.schema.json')
        helper=ROOT/'.agents/skills/sports-science-review/scripts/validate_records.py'
        spec=importlib.util.spec_from_file_location('ssctr_validator',helper);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
        records=mod.records_from(load(OUT/'scientific/DECISIONS.json'))
        errs=mod.validate_records(records,schema,ROOT)
        ck('installed-ssctr-schema-and-crossrefs',not errs,errs)
        queue_path=ROOT/'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'
        queue=load(queue_path)
        if '--final' in sys.argv:
            pilot=mod.records_from(load(ROOT/'reviews/provisional-sports-science/2026-10-23/decisions.json'))
            all_scientific=pilot+records
            scientific_ids={r['review_id'] for r in all_scientific}
            projected={**queue,'items':[x for x in queue['items'] if x['decision_id'] in scientific_ids]}
            qerrors=mod.validate_queue(all_scientific,projected,queue_path)
            ck('funded-human-queue-scientific',not qerrors,qerrors)
            ck('old-human-queue-13-preserved',queue['items'][:13]==load(AUDIT/'before/reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json')['items'])
        cases=load(OUT/'scientific/CASE_REVIEWS_S01_S29.json')['cases']
        ck('eight-cases',len(cases)>=8 and {'S01','S02','S05','S12','S13','S14','S28','S29'}<={c['case_id'] for c in cases})
        cb={c['case_id']:c for c in cases}
        for left,right,allowed_path in [('S01','S02','priority_mode'),('S13','S14','criticality_goal_linkage')]:
            ck('paired-variant-count:'+left,len(cb[left]['variants'])==len(cb[right]['variants']))
            for n,(l,r) in enumerate(zip(cb[left]['variants'],cb[right]['variants'])):
                differences=diff(l['facts'],r['facts'])
                ck('controlled-facts:'+left+':'+str(n),bool(differences) and all(x==allowed_path or x.startswith(allowed_path+'.') for x in differences),differences)
        cc=load(OUT/'scientific/C1_C6_REVIEWS.json')
        ck('C1-C6-present',{c['case_id'] for c in cc['cases']}=={'C1','C2','C3','C4','C5','C6'})
        c4=next(c for c in cc['cases'] if c['case_id']=='C4')
        ck('seven-MEC-slots',{w['level'] for w in c4['level_witnesses']}==set(range(7)))
        matrix=load(OUT/'scientific/G01_COVERAGE_MATRIX.json')
        ck('five-modes-G01',len(matrix['profiles'])==5 and len({p['mode'] for p in matrix['profiles']})==5)
        lit=load(OUT/'scientific/LITERATURE_SNAPSHOT.json')
        source_ids={s['source_id'] for s in lit['sources']}
        allvariants=[v for c in cases+cc['cases'] for v in c['variants']]+load(OUT/'scientific/CASE_REVIEWS_S01_S29.json').get('supplemental_variants',[])
        for v in allvariants:ck('variant-evidence-refs:'+v['variant_id'],set(v['evidence_refs'])<=source_ids)
        supplemental=load(OUT/'AE_SUPPLEMENTAL_ASSESSMENTS.json')
        ck('supplemental-bijection',{v['variant_id'] for v in allvariants}=={r['id'] for r in supplemental['records']})
        ck('supplemental-10-cells',all(set(r['rubric'])==set(ae['dimensions']) for r in supplemental['records']))
        for i in inventory['items']:
            if i.get('synthetic_successor_ref'):
                p=OUT/'GOLDEN_DOMAIN_FIXTURES'/i['synthetic_successor_ref'];gold=load(p)
                ck('golden-no-missing:'+i['scenario_id'],not gold['missing_variant_refs'])
                ck('golden-fields:'+i['scenario_id'],all(all(k in v for k in ['athlete_state','goals_priority','planned_week','recovery_context','expected_preserve','expected_modify','mec_bounds','must_not','agency','re_review_trigger','evidence_refs','SSCTR_disposition']) for v in gold['variants']))
    if '--freeze' in sys.argv:
        targets=[p for p in OUT.rglob('*') if p.is_file() and p.suffix in ['.md','.json'] and '/reviews/' not in p.relative_to(OUT).as_posix() and not p.name.startswith(('VERIFICATION','PRE_REVIEW_VERIFICATION','REVIEW_MANIFEST','SPORTS_DOMAIN_CLOSURE_REPORT','GATE_DISPOSITION','DECISION_REGISTRY'))]
        # The relative reviews directory is excluded explicitly; precheck notes are judge inputs, not authored policies.
        targets=[p for p in targets if p.relative_to(OUT).parts[0]!='reviews']
        targets += [AUDIT/'TASK_CONTRACT.md',Path(__file__).resolve()]
        freeze={'revision':'SDC-REVIEW-r1','frozen_at':datetime.now(timezone.utc).isoformat(),'files':[{'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)} for p in sorted(set(targets))]}
        (AUDIT/'REVIEW_MANIFEST.json').write_text(json.dumps(freeze,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if '--final' in sys.argv:
        freeze=load(AUDIT/'REVIEW_MANIFEST.json')
        for f in freeze['files']: ck('review-current:'+f['path'],sha(ROOT/f['path'])==f['sha256'])
        for n in ['SCIENCE_FIDELITY_REVIEW.json','GOVERNANCE_REVIEW.json']:
            p=OUT/'reviews'/n
            ck('independent-review-present:'+n,p.exists())
        ck('final-report-present',(OUT/'SPORTS_DOMAIN_CLOSURE_REPORT.md').exists())
    result={'revision':'SDC-VERIFY-r1','mode':'FINAL' if '--final' in sys.argv else 'PRECHECK','executed_at':datetime.now(timezone.utc).isoformat(),'mechanism':'Python documentary artifact checks + installed SSCTR record validator; no AE runtime executed','checks':checks,'total':len(checks),'passed':sum(c['passed'] for c in checks),'failed':sum(not c['passed'] for c in checks),'scientific_correctness_proved_by_checker':False}
    name='VERIFICATION.json' if '--final' in sys.argv else 'PRE_REVIEW_VERIFICATION.json'
    (OUT/name).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k!='checks'}))
    if result['failed']: print(json.dumps([c for c in checks if not c['passed']],ensure_ascii=False));sys.exit(1)
if __name__=='__main__':main()
