"""Run installed SSCTR validation functions on current records and canonical queue projection."""
from pathlib import Path
import sys,json,importlib.util,datetime,hashlib
sys.path.insert(0,r'C:/Users/carva/AppData/Local/Temp/vilumo-acf-jsonschema')
P=Path(__file__).resolve().parents[2];A=Path(__file__).resolve().parent;D=P/'product/candidates/autonomous-coaching-foundation/1.0.0'
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
helper=P/'.agents/skills/sports-science-review/scripts/validate_records.py'
spec=importlib.util.spec_from_file_location('installed_ssctr_validator',helper);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
records=m.records_from(load(D/'reviews/INDEPENDENT_SCIENTIFIC_DECISIONS.json'))
schema=load(P/'governance/agents/sports-science-reviewer/decision.schema.json')
canonical_path=P/'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'
canonical=load(canonical_path);projection=load(A/'NEW_APPROVALS_QUEUE_PROJECTION.json')
errors=m.validate_records(records,schema,root=P)+m.validate_queue(records,projection,canonical_path)
byid={x['queue_id']:x for x in canonical['items']}
if any(byid.get(x['queue_id'])!=x for x in projection['items']):errors.append('Projection differs from canonical queue items')
before=load(A/'before/reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json')
if canonical['items'][:46]!=before['items']:errors.append('Prior46 queue items changed')
if canonical['funding_trigger']!=before['funding_trigger']:errors.append('Funding trigger changed without declaration')
def covered(ids):return {i for r in records for i in r['target']['rule_ids']}>=set(ids)
for name,ids in [('policies',[f'POL-{n:02}' for n in range(1,21)]),('run',[x['recipe_id'] for x in load(D/'RUN_SESSION_RECIPES.json')['recipes']]),('strength',[x['recipe_id'] for x in load(D/'STRENGTH_SESSION_RECIPES.json')['recipes']])]:
    if not covered(ids):errors.append('Independent review coverage missing '+name)
result={'revision':'ACF-SSCTR-RECORD-CHECK-r1','executed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'helper':str(helper.relative_to(P)),'helper_sha256':hashlib.sha256(helper.read_bytes()).hexdigest(),'schema':'SSCTR decision.schema.json1.0.0','passed':not errors,'records':len(records),'prescriptive_approval_queue_matches':len(projection['items']),'prior_queue_items_preserved':46,'queue_total':len(canonical['items']),'queue_projection_explanation':'Installed validator requires a closed1:1 record/queue set. New-record projection contains exact items from canonical single queue; canonical path passed to resolver, all46prior items separately deep-compared. Projection is not another authority/queue.','errors':errors,'limits':'Schema/link/hash/queue/independence-field consistency only; source truth and scientific applicability depend on separate independent review.'}
(A/'SSCTR_RECORD_VALIDATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if not errors else 1)
