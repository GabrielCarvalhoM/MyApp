from pathlib import Path
import json,re,hashlib,collections,subprocess,sys,csv,datetime
from build_golden import digest
R=Path(__file__).resolve().parents[2];O=R/'outputs/closure-r4';W=R/'work/closure'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def ck(n,c,detail=None):checks.append({'name':n,'pass':bool(c),'detail':detail})
d=read(O/'validation-final.json');b=read(R/'outputs/validation-final.json');by={c['id']:c for c in d['cases']};bb={c['id']:c for c in b['cases']}
for x in read(W/'baseline-lock.json')['artifacts']:ck('r3-preserved:'+x['path'],sha(R/x['path'])==x['sha256'])
for m in read(R/'inputs/manifest.json'):
    ck('source-frozen:'+m['relative'],sha(R/'inputs'/m['relative'])==m['sha256'])
    ck('current-authority:'+m['relative'],Path(m['source']).exists() and sha(Path(m['source']))==m['sha256'])
src=(R/'inputs/product/ADAPTIVE_ENGINE_SCENARIO_LAB.md').read_text(encoding='utf-8-sig').splitlines()
ids=re.findall(r'^\| ((?:SIL-S|TD-S|FZ-S|S|Q)\d{2})(?=\s|/)','\n'.join(src),re.M)
ck('same-authoritative-89',len(d['cases'])==len(by)==89 and set(ids)==set(by)==set(bb))
ck('same-rubric',d['dimensions']==b['dimensions'] and len(d['dimensions'])==10)
ck('80-plus9',sum(c['type']=='scenario'for c in by.values())==80 and sum(c['type']=='sequence'for c in by.values())==9)
allchanges=[]
for key,c in by.items():
    ck(key+':original-source-preserved',all(c[k]==bb[key][k]for k in ['source_input','source_oracle','source_line']))
    ck(key+':source-row',src[c['source_line']-1].startswith('| '+key+' '))
    ck(key+':reassessed',c['reassessment']['status']=='RECHECKED' and set(c['rubric_before'])==set(d['dimensions']))
    ck(key+':10-valid-cells',set(c['rubric'])==set(d['dimensions']) and all(v['result']in['PASS','PARTIAL','FAIL','N/E'] and v['rationale']for v in c['rubric'].values()))
    ck(key+':complete-decision',all(c.get(k)for k in ['decision','preserve','modify','change_level','tradeoff','must_not','user_action','confidence','next_check','domain_status']))
    for k,v in c['rubric'].items():
        if v['result']!=bb[key]['rubric'][k]['result']:allchanges.append([key,k,bb[key]['rubric'][k]['result'],v['result']])
    if c['type']=='sequence':ck(key+':entire-sequence',len(c['steps'])>=4 and all(c.get(k)for k in ['trajectory','stability','cumulative_failures','final_result']))
ck('only-evidenced-cell-change',allchanges==[['FZ-S11','explainability','PARTIAL','PASS']],allchanges)
ck('only-evidenced-label-change',[c['id']for c in by.values()if c['classification']!=bb[c['id']]['classification']]==['FZ-S11'])
ck('890cells',sum(len(c['rubric'])for c in by.values())==890)
for group,rows in [('all',list(by.values())),('scenarios',[c for c in by.values()if c['type']=='scenario']),('sequences',[c for c in by.values()if c['type']=='sequence'])]:
    co=collections.Counter(c['classification']for c in rows)
    ck('summary:'+group,d['summary'][group]['total']==len(rows) and all(d['summary'][group]['counts'][s]==co[s]for s in d['summary'][group]['counts']))
for k,p in d['property_results'].items():
    co=collections.Counter(c['rubric'][k]['result']for c in by.values());ck('property:'+k,p['assessable']==89-co['N/E'] and all(p[s]==co[s]for s in ['PASS','PARTIAL','FAIL','N/E']))
fix=d['fix01'];ck('eight-P1',len(fix['records'])==8 and {f['id']for f in fix['records']}=={'S01','S02','S05','S12','S13','S14','S28','S29'})
for f in fix['records']:
    ck(f['id']+':baseline-snapshot',f['baseline_snapshot']==bb[f['id']])
    ck(f['id']+':ordered0to6',[a['level']for a in f['alternatives']]==list(range(7)))
    ck(f['id']+':migration-fields',all(f.get(k)for k in ['adequacy','material_fact','necessity','change_cost_rule_ref','minimum_sufficient_alternative','preserve','modify','change_level','tradeoff','must_not','user_agency','confidence','next_check','unresolved_dependencies']))
    ck(f['id']+':no-false-original-closure',by[f['id']]['classification']=='QUESTIONABLE' and f['real_runtime_readiness']!='GO')
    if f['id'] in ['S13','S14']:
        e=f['synthetic_extension'];bad=[c for c in e['candidates']if c['id']in['KEEP','MICRO']]
        ck(f['id']+':SP4-01-HC05',len(bad)==2 and all(c['hc']=='FAIL' and 'HC05'in c['hc_failures']for c in bad) and e['recipe_minimum_purpose_blocks']==['A'])
ck('four-G-gates',len(d['sport_policy']['gaps'])==4 and {g['id']for g in d['sport_policy']['gaps']}=={'G01','G02','G03','G04'})
pdr=(R/'inputs/product/PRODUCT_DECISION_REGISTER.md').read_text(encoding='utf-8-sig')
for g in d['sport_policy']['gaps']:
    ck(g['id']+':exact-definition',g['exact_definition']in pdr and g['exact_implementation_limit']in pdr)
    ck(g['id']+':real-approval-visible',g['status']=='HUMAN_REVIEW_REQUIRED' and g['professional_approval_ref']is None and g['missing_evidence'])
cov=d['closure_coverage'];gaps=cov.get('gaps',cov.get('records',[]))
ck('C1-throughC6-exact',len(gaps)==6 and {g['id']for g in gaps}=={'C1','C2','C3','C4','C5','C6'})
ck('coverage-closure-axes',cov['counts']['gaps_treated']==6 and cov['counts']['sporting_gaps_closed']==0 and cov['counts']['synthetic_witness_closed']==5)
trajectory=next(w for w in cov['witnesses']if w['witness_id']=='Q-C1')['timeline']
ck('SP4-02-eight-snapshots',len(trajectory)==8)
for idx,step in enumerate(trajectory):
    inp=step['inputs']; live=next(s for s in inp['planned_week']if s['session_ref']=='RUN-KEY-A')
    ck(step['step_id']+':SP4-02-live-lineage',inp['relevant_history']['accepted_plan_ref']=='TEST-PLAN-Q-C1-'+('r1' if idx<2 else 'r2') and live['revision']==('r1' if idx<2 else 'r2') and(idx<2 or live['recipe_ref']=='TEST-COVERED-KEY-REDUCED'))
ck('supplemental25-separate',len(d['supplemental_assessments'])==25 and all(s['in_main_89_denominator']is False and set(s['rubric'])==set(d['dimensions'])for s in d['supplemental_assessments']))
fs=d['golden'];ck('20-original-Golden',len(fs)==20 and {f['scenario_id']for f in fs}=={g['id']for g in b['golden']})
for f in fs:
    sid=f['scenario_id'];fields=['athlete_state','goal_priority','relevant_history','recovery_signals','planned_week','completed_activities','constraints','expected_preserve','expected_modify','must_not','agency_requirement','next_check_invariants','expected_oracle','event_sequence','variants']
    ck(sid+':fixture-fields',all(k in f for k in fields) and f['variants'] and all(v.get('expected')for v in f['variants']))
    base={k:v for k,v in f.items()if k!='fixture_sha256'};ck(sid+':fixture-hash',digest(base)==f['fixture_sha256'])
    ck(sid+':no-false-approval-or-execution',f['purpose']=='SYNTHETIC_ONLY' and f['authority_profile']['real_professional_approval']is False and f['expected_oracle']['observed_outputs']is None)
    ck(sid+':bounds-only-defensible',f['min_change_level'] is None or(sid in ['FZ-S01','FZ-S02','Q07']and f['min_change_level']==f['max_change_level']==0))
    if sid=='Q07':ck('Q07-current-adequacy-not-historical-inference',f['planned_week']['current_evaluation']['status']=='ADEQUATE_SIMULATED')
ck('10-control10-open',sum(f['readiness']=='CLOSED_CONTROL_FIXTURE'for f in fs)==10 and sum(f['readiness']=='MATERIALIZED_DOMAIN_OPEN'for f in fs)==10)
page=(O/'dashboard.html').read_text(encoding='utf8');embedded=re.search(r'<script id="report-data" type="application/json">(.*?)</script>',page,re.S)
ck('dashboard-exact-data',bool(embedded) and json.loads(embedded.group(1))==d)
js=W/'dashboard.js';node=Path('C:/Users/carva/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')
p=subprocess.run([str(node),'--check',str(js)],capture_output=True,text=True);ck('javascript-syntax',p.returncode==0,p.stderr)
with (O/'cases.csv').open(encoding='utf-8-sig',newline='')as f:rows=list(csv.DictReader(f))
ck('csv89',len(rows)==89 and {r['id']for r in rows}==set(by))
ck('no-runtime-no-clinical-approval',d['readiness']=='NO-GO' and d['golden_summary']['professionally_approved']==d['golden_summary']['executed_against_runtime']==0)
if (O/'review-input-manifest.json').exists():
    review_manifest=read(O/'review-input-manifest.json')
    for a in review_manifest['artifacts']:ck('frozen-review-input:'+a['path'],sha(O/a['path'])==a['sha256'])
if (O/'review-index.json').exists():
    review_index=read(O/'review-index.json')
    for rv in review_index['reviews']:ck('review-evidence:'+rv['perspective'],sha(O/rv['file'])==rv['file_sha256'])
    ck('no-false-unanimity',review_index['completion_state']=='PARTIAL_INDEPENDENT_REVIEW' and sum(rv['final_hash_signoff']for rv in review_index['reviews'])==1)
    embedded_reviews=re.search(r'<script id="review-data" type="application/json">(.*?)</script>',page,re.S)
    ck('dashboard-exact-review-state',bool(embedded_reviews) and json.loads(embedded_reviews.group(1))==review_index)
if (O/'BROWSER_QA.json').exists():
    qa=read(O/'BROWSER_QA.json')
    ck('browser-checks-observed',qa['all_checks_pass'] and len(qa['checks'])>=9 and all(x['observed']==x['expected']for x in qa['checks']))
    ck('representative-no-page-overflow',qa['desktop']['viewport_width']==qa['desktop']['page_width'] and qa['mobile']['client_width']==qa['mobile']['page_width'])
    ck('representative-contrast',qa['contrast_sample']['minimum']>=4.5 and not qa['contrast_sample']['below4_5'])
    ck('current-tab-no-console-errors',qa['console_errors_current_tab']==[])
    for p in qa['screenshots']:ck('visual-evidence:'+p,(O/p).exists() and(O/p).stat().st_size>1000)
if (O/'COMPLETION_STATUS.json').exists():
    completion=read(O/'COMPLETION_STATUS.json')
    ck('completion-does-not-hide-incomplete-reviews',completion['all_requested_acceptance_criteria_satisfied']is False and completion['prescriptive_future_runtime_verdict']=='NO-GO')
if (O/'RELATORIO_EXECUTIVO.md').exists():
    narrative=(O/'RELATORIO_EXECUTIVO.md').read_text(encoding='utf8')
    ck('final-report-honest-and-substantive',len(narrative)>7000 and'NO-GO'in narrative and'limite de uso'in narrative and'G01'in narrative)
    local_targets=set(re.findall(r'\]\(([^)#]+)',narrative))
    ck('report-file-links',all((O/p).exists()for p in local_targets if not p.startswith('http')))
rep={'revision':d['revision'],'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Artifact integrity, completeness and honest denominators; NOT an Adaptive Engine EvalRun, physiological validation or independent semantic gate','passed':sum(c['pass']for c in checks),'failed':sum(not c['pass']for c in checks),'checks':checks,'semantic_cell_changes':allchanges,'artifacts':[{'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}for p in [O/'validation-final.json',O/'golden-fixtures.json',O/'fix01.json',O/'coverage.json',O/'policy.json',O/'cases.csv',O/'dashboard.html']]}
(O/'VERIFICATION.json').write_text(json.dumps(rep,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'passed':rep['passed'],'failed':rep['failed'],'failures':[c for c in checks if not c['pass']]},ensure_ascii=False));sys.exit(bool(rep['failed']))
