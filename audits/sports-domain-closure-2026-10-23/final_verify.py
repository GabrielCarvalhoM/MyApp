"""Final extension: independent judgments, single human queue and delivery links."""
from pathlib import Path
import hashlib, importlib.util, json, re, subprocess, sys
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[2]
A=Path(__file__).resolve().parent
D=ROOT/'reviews/sports-domain-closure/2026-10-23'
sys.path.insert(0,str(Path.home()/'AppData/Local/Temp/vilumo-sports-review-validation-deps'))
def load(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
run=subprocess.run([sys.executable,str(A/'verify_delivery.py'),'--final'],capture_output=True,text=True,encoding='utf-8')
base=load(D/'VERIFICATION.json')
checks=base['checks']
def ck(k,v,detail=None):checks.append(dict(check=k,passed=bool(v),detail=detail))
ck('base-final-check-exit',run.returncode==0,run.stdout if run.returncode else None)
spec=importlib.util.spec_from_file_location('ssctr',ROOT/'.agents/skills/sports-science-review/scripts/validate_records.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
independent=mod.records_from(load(D/'reviews/INDEPENDENT_DECISIONS.json'))
schema=load(ROOT/'governance/agents/sports-science-reviewer/decision.schema.json')
errors=mod.validate_records(independent,schema,ROOT)
ck('independent-schema-crossrefs',not errors,errors)
ck('48-independent-decisions',len(independent)==48 and len({r['review_id'] for r in independent})==48)
ck('judge-independence',all(r['reviewer']['independent_of_target_author'] is True and r['reviewer']['instance_id']=='/root/source_fidelity_judge' for r in independent))
pilot=mod.records_from(load(ROOT/'reviews/provisional-sports-science/2026-10-23/decisions.json'))
qpath=ROOT/'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json';queue=load(qpath)
science_ids={r['review_id'] for r in pilot+independent}
projection={**queue,'items':[i for i in queue['items'] if i['decision_id'] in science_ids]}
errs=mod.validate_queue(pilot+independent,projection,qpath)
ck('all-scientific-approvals-single-queue',not errs,errs)
reg=load(D/'DECISION_REGISTRY.json')
norm=reg['normative_decisions']
ck('two-normative-boundary-decisions',len(norm)==2)
by_queue={q['decision_id']:q for q in queue['items']}
for n in norm:
    item=by_queue.get(n['decision_id'])
    ck('normative-queue:'+n['decision_id'],bool(item) and item['target']==n['target'] and item['conditions']==n['conditions'] and item['state']=='QUEUED_FOR_FUNDED_HUMAN_REVALIDATION')
allowed_queue_ids={r['review_id'] for r in pilot+independent if r['disposition'] in ['APPROVE','APPROVE_WITH_CONDITIONS'] and r['scope']['prescriptive_impact']}|{n['decision_id'] for n in norm}
ck('no-untracked-queue-entry',set(by_queue)==allowed_queue_ids)
ck('funding-not-invented',queue['funding_trigger']['state']=='NOT_DECLARED')
old=load(A/'BASELINE.json')
for name in ['CURRENT_MISSION.md','MISSION_LEDGER.md']:
    before=(A/'before'/name).read_bytes();live=(ROOT/name).read_bytes()
    baseline_entry=next(f for f in old['files'] if f['path']==name)
    ck('entry-before-snapshot:'+name,sha(A/'before'/name)==baseline_entry['sha256'])
    ck('entry-append-only:'+name,live.startswith(before))
for p in D.rglob('*.md'):
    for target in re.findall(r'(?<!!)\[[^\]]*\]\(([^)]+)\)',p.read_text(encoding='utf-8-sig')):
        target=target.strip().strip('<>').split('#')[0]
        if not target or re.match(r'[a-zA-Z][a-zA-Z0-9+.-]*:',target):continue
        ck('local-link:'+p.relative_to(D).as_posix()+':'+target,(p.parent/target).exists())
gate=load(D/'GATE_DISPOSITION.json')
ck('two-final-verdicts',gate['SPORTS_DOMAIN_READINESS']=='NOT_READY' and gate['AE_RUNTIME_IMPLEMENTATION_READINESS']=='NO_GO')
ck('current-manifest-sha',gate['review_manifest_sha256']==sha(A/'REVIEW_MANIFEST.json'))
ck('queue-applied-byte-identically',sha(qpath)==sha(D/'QUEUE_PROJECTION.json')==gate['human_queue']['sha256']=='a6a74e5f42acd4ec61359208bf352e03dd34820b3d4bd13e5bfadda7830c8563')
for n in ['SCIENCE_FIDELITY_REVIEW.json','GOVERNANCE_REVIEW.json']:
    review=load(D/'reviews'/n)
    ck('independent-PASS:'+n,review['verdict']=='PASS' and review['manifest_sha256']==sha(A/'REVIEW_MANIFEST.json'))
ck('consolidated-registry',reg['status']=='CONSOLIDATED_INTERNAL_REVIEW')
ck('final-report-not-pending','AUTHOR_SUBMISSION — pareceres finais pendentes' not in (D/'SPORTS_DOMAIN_CLOSURE_REPORT.md').read_text(encoding='utf-8'))
for file in ['SCIENCE_FIDELITY_REVIEW.json','GOVERNANCE_REVIEW.json','INDEPENDENT_DECISIONS.json']:
    ck('gate-review-hash:'+file,gate['review_hashes'][file]==sha(D/'reviews'/file))
result={**base,'mode':'FINAL_INDEPENDENT_AND_QUEUE_VERIFIED','executed_at':datetime.now(timezone.utc).isoformat(),'checker_sha256':sha(Path(__file__)),'total':len(checks),'passed':sum(c['passed'] for c in checks),'failed':sum(not c['passed'] for c in checks),'checks':checks,'independent_decisions':len(independent),'new_scientific_approvals':sum(r['disposition'] in ['APPROVE','APPROVE_WITH_CONDITIONS'] for r in independent),'human_queue_items':len(queue['items']),'normative_boundary_items':len(norm),'mechanism':'Frozen 1105+ documentary checks plus installed SSCTR independent record and queue validator, append-only preservation, links, current review hashes; no AE runtime executed'}
(D/'VERIFICATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='checks'},ensure_ascii=False))
if result['failed']:
    print(json.dumps([c for c in checks if not c['passed']],ensure_ascii=False));sys.exit(1)
