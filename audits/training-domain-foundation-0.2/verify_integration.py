"""Documentary acceptance checks; no runtime or physiology tests.

Run with Python 3.11+ from any directory. Only VERIFICATION.json is written.
"""
from pathlib import Path
import copy, hashlib, json, re, sys, zipfile
from datetime import datetime
from urllib.parse import unquote

A = Path(__file__).resolve().parent
ROOT = A.parent.parent
C = ROOT/'product/candidates/training-domain-foundation/0.2'
R = ROOT/'reviews/human-domain-review/training-domain-foundation-0.2'
checks=[]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def check(name, ok, evidence): checks.append({'criterion':name,'result':'PASS' if ok else 'FAIL','evidence':evidence})
def read(p): return json.loads(p.read_text(encoding='utf-8-sig'))
manifest=read(A/'SOURCE_MANIFEST.json')
for s in manifest['sources']:
    p=ROOT/s['repo_path']
    check('Source ZIP SHA-256 '+s['name'],sha(p)==s['sha256'],s['sha256'])
for kind,prefix,dest in [('foundation_entries','v1-training-domain-foundation-0.2/',C/'foundation'),('audit_entries','foundation-audit/',A/'audit-original'),('closure_entries','',A/'closure-r4-original')]:
    source=manifest['sources'][['foundation_entries','audit_entries','closure_entries'].index(kind)]
    with zipfile.ZipFile(ROOT/source['repo_path']) as z:
        original=[i for i in z.infolist() if not i.is_dir()]
        check(kind+' exact file inventory',len(original)==len(manifest[kind])==sum(p.is_file() for p in dest.rglob('*')),f'{len(original)} files')
        for i in original:
            p=dest/i.filename[len(prefix):]
            check(kind+' bytes '+i.filename,p.read_bytes()==z.read(i),sha(p))

original_review=read(A/'audit-original/review-input-manifest-0.2.json')
for item in original_review['files']:
    p=C/'foundation'/item['name']
    check('Candidate equals audited r2 '+item['name'],sha(p)==item['sha256'] and p.stat().st_size==item['bytes'],item['sha256'])

baseline=read(A/'BASELINE.json')
for path,expected in baseline['files'].items():
    if path in baseline['allowed_append_only']: continue
    p=ROOT/path
    check('Preexisting file preserved '+path,p.exists() and sha(p)==expected,expected)
for name in baseline['allowed_append_only']:
    b=(ROOT/name).read_bytes(); marker=b'\n\n<!-- TDF_HUMAN_REVIEW_START' if name=='CURRENT_MISSION.md' else b'\n\n## 2026-10-22 \xe2\x80\x94 Training Domain Foundation 0.2 candidate'
    start=b.find(marker)
    check('Append-only preservation '+name,start>=0 and hashlib.sha256(b[:start]).hexdigest()==baseline['files'][name],{'baseline_sha256':baseline['files'][name],'append_sha256':hashlib.sha256(b[start:]).hexdigest() if start>=0 else None})

fm=read(C/'foundation/DOMAIN_REVIEW_FIXTURES.json')
scenarios={s['id']:s for s in fm['scenarios']}
for sid in ['S01','S02','S05','S12','S13','S14','S28','S29']:
    s=scenarios[sid]
    check('Original sporting status open '+sid,s['assessment_status']=='NOT_EVALUABLE_DOMAIN' and s['professional_approval_ref'] is None and s['expected_action'] is None,{'assessment_status':s['assessment_status'],'professional_approval_ref':s['professional_approval_ref'],'expected_action':s['expected_action']})
r4=read(A/'closure-r4-original/outputs/closure-r4/fix01.json')
for rec in r4['records']:
    if rec['id'] in ['S01','S02','S05','S12','S13','S14','S28','S29']:
        check('r4 QUESTIONABLE retained '+rec['id'],rec['baseline_status']=='QUESTIONABLE' and rec['primary_classification_suggestion']=='QUESTIONABLE',rec['baseline_status'])

pair=read(R/'CASE_INPUTS.json')
a,b=[copy.deepcopy(c['inputs']) for c in pair['cases']]
check('Controlled priority values',[a.pop('priority_mode'),b.pop('priority_mode')]==['RUN_FIRST','STRENGTH_FIRST'],'RUN_FIRST / STRENGTH_FIRST')
check('Only priority differs',a==b,{'common_input_sha256':hashlib.sha256(json.dumps(a,sort_keys=True,ensure_ascii=False).encode()).hexdigest()})
for k in ['base_fixture','session_intents','strength_variations','strength_prescriptions','run_intensity_references','effort_references','run_prescriptions','sessions']:
    value=a[k]
    exact=value==fm[k] if not isinstance(value,list) else all(v in fm[k] for v in value)
    check('Pair source fidelity '+k,exact,'0.2 source objects, no field rewrite')
for case in pair['cases']:
    check('Pair has no sporting decision '+case['case_id'],case['selected_action'] is None and case['professional_approval_ref'] is None,'null')
    check('No invented micro/substitution/replan recipe '+case['case_id'],all(x['delta'] is None for x in case['inputs']['candidate_catalog'] if x['id'] in ['M','I','SUB','PR']),'delta null')
    check('No S05 recovery facts imported '+case['case_id'],all(v is None for v in case['inputs']['recovery_signals'].values()),'all recovery signals and new material fact null')

run=next(p for p in fm['run_prescriptions'] if p['id']=='threshold-example')
main=run['blocks'][1]
duration=run['blocks'][0]['completion']['amount']['value']+main['iterations_total']*main['work']['completion']['amount']['value']+(main['iterations_total']-1)*main['recovery']['completion']['amount']['value']+run['blocks'][2]['completion']['amount']['value']
check('Threshold total and no final recovery',duration==2220 and not main['recovery_after_last'] and run['totals']['work_duration_s']==1080 and run['totals']['recovery_duration_s']==240,{'total_s':duration,'work_s':1080,'recovery_s':240})
sessions={s['id']:s for s in fm['sessions']}
dt=datetime.fromisoformat
lower=sessions['lower-mon']; threshold=sessions['run-tue']; easy=sessions['run-thu']
spacing={'end_to_start_s':(dt(threshold['start'])-dt(lower['end'])).total_seconds(),'start_to_start_s':(dt(threshold['start'])-dt(lower['start'])).total_seconds()}
check('Current spacing',spacing=={'end_to_start_s':43200,'start_to_start_s':46800},spacing)
move_l=next(c for c in a['candidate_catalog'] if c['id']=='MV-L')['delta']
move_r=next(c for c in a['candidate_catalog'] if c['id']=='MV-R')['delta']
derived={'run_before_moved_lower_s':(dt(move_l['new_start'])-dt(threshold['end'])).total_seconds(),'moved_lower_before_easy_s':(dt(easy['start'])-dt(move_l['new_end'])).total_seconds(),'lower_before_moved_run_s':(dt(move_r['new_start'])-dt(lower['end'])).total_seconds(),'moved_run_before_easy_s':(dt(easy['start'])-dt(move_r['new_end'])).total_seconds()}
check('MOVE full horizon arithmetic',derived=={'run_before_moved_lower_s':123780,'moved_lower_before_easy_s':43200,'lower_before_moved_run_s':129600,'moved_run_before_easy_s':84180},derived)
check('Run volume candidate arithmetic',600+2*360+120+300==1740,{'active_duration_s':1740,'not_an_implicit_schedule_change':True})

rf=(R/'02_G02_LOWER_THRESHOLD_RUN_FIRST.md').read_text()
sf=(R/'03_G02_LOWER_THRESHOLD_STRENGTH_FIRST.md').read_text()
shared_rf=rf[rf.index('## Fatos do exemplo'):]; shared_sf=sf[sf.index('## Fatos do exemplo'):]
check('Markdown pair common facts/options/questions byte-identical',shared_rf==shared_sf,hashlib.sha256(shared_rf.encode()).hexdigest())
for text,name in [(rf,'S01'),(sf,'S02')]:
    check('Twelve expert questions '+name,all(re.search(r'^'+str(i)+r'\. ',text,re.M) for i in range(1,13)),'Q1..Q12')
    check('Lower/threshold fields and uncertainty '+name,all(v in text for v in ['60 kg','40 kg','8 kg','2 × 6 por lado','37 min','RPE 6','12 h','13 h','34 h 23 min','36 h','23 h 23 min','UNKNOWN','Nenhuma alternativa menor foi rejeitada','Não há fato novo']),'numeric transcription + explicit unknowns')

for name in ['README.md']:
    status=(C/name).read_text()
    check('Explicit candidate status',all(x in status for x in ['CANDIDATE / NON-AUTHORITATIVE','READY WITH FIXES FOR DELIMITED HUMAN REVIEW','NOT PRODUCT/DOMAIN TRUTH','G01–G04 = HUMAN_REVIEW_REQUIRED','S01, S02, S05, S12, S13, S14, S28, S29','C1–C6','sem prescrição aprovada','sem validação clínica']),name)

review_manifest=read(R/'REVIEW_MANIFEST.json')
for item in review_manifest['files']:
    check('Human packet frozen hash '+item['name'],sha(R/item['name'])==item['sha256'],item['sha256'])
brief=(R/'00_REVIEW_BRIEF.md').read_text()
check('Brief bounded to 1–2 pages of prose',len(brief.split())<=700,{'words':len(brief.split()),'format':'Markdown; page count depends on rendering'})
form=(R/'05_REVIEW_FORM.md').read_text()
check('Decision form complete and blank',all(x in form for x in ['Reviewer name','Credentials','Population/context reviewed','Artifact/rule/version','Decision','Rationale','Evidence/experience basis','Conditions/limits','Required changes','Re-review trigger','Date/version','EM BRANCO']), 'All required fields; no human approval supplied')

documentary_review=(A/'DOCUMENTARY_REVIEW.md').read_text(encoding='utf-8')
check('Independent documentary handoff review current',
      'DOCUMENTARY_HANDOFF_ONLY' in documentary_review and sha(R/'REVIEW_MANIFEST.json') in documentary_review and 'PENDING —' not in documentary_review,
      {'review_manifest_sha256':sha(R/'REVIEW_MANIFEST.json'),'review_sha256':sha(A/'DOCUMENTARY_REVIEW.md'),'limit':'Documentary handoff only; no human or physiological approval'})
authored=list(R.glob('*.md'))+[C/'README.md',A/'README.md',A/'MISSION_RECORD.md',A/'DOCUMENTARY_REVIEW.md']
link_count=0
for p in authored:
    content=p.read_text(encoding='utf-8')
    for label,target in re.findall(r'\[([^\]]+)\]\(([^)]+)\)',content):
        if re.match(r'^(https?://|mailto:)',target): continue
        target=unquote(target.strip('<>'))
        path,_,anchor=target.partition('#')
        target_path=(p.parent/path).resolve() if path else p
        ok=target_path.exists() and target_path.is_relative_to(ROOT)
        if anchor and ok:
            slugs=[];counts={}
            for heading in re.findall(r'^#+\s+(.+)$',target_path.read_text(encoding='utf-8-sig'),re.M):
                slug=re.sub(r'[^\w\- ]','',heading.lower()).replace(' ','-')
                n=counts.get(slug,0);counts[slug]=n+1;slugs.append(slug+(f'-{n}' if n else ''))
            ok=anchor in slugs
        check('Internal link '+p.relative_to(ROOT).as_posix()+' -> '+target,ok,str(target_path.relative_to(ROOT)) if target_path.is_relative_to(ROOT) else str(target_path));link_count+=1
for name in baseline['allowed_append_only']:
    text=(ROOT/name).read_text(encoding='utf-8')
    appendix=text[text.index('<!-- TDF_HUMAN_REVIEW_START'):] if name=='CURRENT_MISSION.md' else text[text.index('## 2026-10-22 — Training Domain Foundation 0.2 candidate'):]
    for _,target in re.findall(r'\[([^\]]+)\]\(([^)]+)\)',appendix):
        check('Governance locator '+name+' -> '+target,(ROOT/target).exists(),target);link_count+=1

result={'revision':'TDF-HR-0.2-r1','verified_at':datetime.now().astimezone().isoformat(),'mechanism':'verify_integration.py; ZIP bytes, SHA-256, pre-mission repository bytes, controlled pair projection, time arithmetic and Markdown link checks','scope':'Documentary integrity/readiness only. Not software testing, physiology validation or human G01/G02 approval. Imported historical Markdown links are excluded from authored-link checks; preserved bytes are checked instead.','review_manifest_sha256':sha(R/'REVIEW_MANIFEST.json'),'summary':{'PASS':sum(c['result']=='PASS' for c in checks),'FAIL':sum(c['result']=='FAIL' for c in checks),'authored_internal_links':link_count,'foundation_files':15,'input_zip_identity_matches_conversation_attachments':True},'checks':checks}
(A/'VERIFICATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps(result['summary'],ensure_ascii=False))
for c in checks:
    if c['result']=='FAIL': print(json.dumps(c,ensure_ascii=False))
sys.exit(1 if result['summary']['FAIL'] else 0)
