"""Offline documentary/fixture consistency checks; not a production coach or efficacy test."""
from pathlib import Path
import json,hashlib,sys,datetime,copy
sys.path.insert(0,r'C:/Users/carva/AppData/Local/Temp/vilumo-acf-jsonschema')
from jsonschema import Draft202012Validator,FormatChecker
P=Path(__file__).resolve().parents[2]
A=Path(__file__).resolve().parent
D=P/'product/candidates/autonomous-coaching-foundation/1.0.0'
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(name,ok,detail=None): checks.append(dict(check=name,passed=bool(ok),detail=detail))
required=['AUTONOMOUS_COACHING_FOUNDATION.md','RUN_PRESCRIPTION_ENGINE.md','STRENGTH_PRESCRIPTION_ENGINE.md','HYBRID_PLANNING_ENGINE.md','TRAINING_POLICY_LIBRARY.md','TRAINING_POLICY_LIBRARY.json','ATHLETE_RESPONSE_MODEL.md','RECOVERY_READINESS_MODEL.md','AUTONOMY_BOUNDARY_CONTRACT.md','COACHING_CONTRACTS.json','RUN_SESSION_RECIPES.json','STRENGTH_SESSION_RECIPES.json','SYNTHETIC_ATHLETE_FIXTURES.json','END_TO_END_COACHING_SCENARIOS.md','END_TO_END_COACHING_SCENARIOS.json','COACHING_COVERAGE_MATRIX.md','COACHING_COVERAGE_MATRIX.json','LITERATURE_SNAPSHOT.json','SCIENTIFIC_CLAIM_MAP.json','SCIENTIFIC_SYNTHESIS.md','SEARCH_LOG.md','OPEN_GAPS.md','OPEN_GAPS.json']
for f in required:check('artifact:'+f,(D/f).is_file())
data={}
for f in D.glob('*.json'):
    try:data[f.name]=load(f);check('json_parse:'+f.name,True)
    except Exception as e:check('json_parse:'+f.name,False,str(e))
ath=data['SYNTHETIC_ATHLETE_FIXTURES.json']['athletes']; am={x['athlete_id']:x for x in ath}
pol=data['TRAINING_POLICY_LIBRARY.json']['policies'];pm={x['policy_id']:x for x in pol}
e2=data['END_TO_END_COACHING_SCENARIOS.json'];plans=e2['plans'];plm={x['plan_id']:x for x in plans};sc=e2['scenarios'];sm={x['scenario_id']:x for x in sc}
run=data['RUN_SESSION_RECIPES.json']['recipes'];strength=data['STRENGTH_SESSION_RECIPES.json']['recipes'];rm={x['recipe_id']:x for x in run+strength}
lit=data['LITERATURE_SNAPSHOT.json'];sources=lit['sources'];so={x['source_id']:x for x in sources}
check('nine_distinct_nonclinical_athletes',len(ath)==len(am)==9 and all(x['clinical_profile'] is False and x['real_person'] is False for x in ath))
check('one_subject_specific_week_per_athlete',len(plans)==9 and {x['athlete_id'] for x in plans}==set(am))
check('twenty_consumed_policy_families',len(pm)==20 and set(pm)=={f'POL-{n:02}' for n in range(1,21)})
check('required_sixteen_scenarios_plus_extensions',set(f'E2E-{n:02}' for n in range(1,25))==set(sm))
check('sixteen_run_eight_strength_recipes',len(run)==16 and len(strength)==8 and len(rm)==24)
for p in pol:
    for f in ['problem_definition','eligible_population','required_inputs','evidence_status','candidate_actions','preserve','trade_offs','mec_ladder_relevance','forbidden_shortcuts','fallback','re_review_trigger','ssctr_disposition','consumers']:check(f'policy:{p["policy_id"]}:{f}',bool(p.get(f)))
    check('policy_sources:'+p['policy_id'],set(p['evidence_basis']['source_ids'])<=set(so))
    check('policy_scenario_consumer:'+p['policy_id'],any(p['policy_id'] in s['evidence']['policy_ids'] for s in sc))
def run_seconds(steps):
    return sum(s['completion']['value'] if s['kind']=='SINGLE' else s['iterations_total']*s['work']['completion']['value']+(s['iterations_total']-(0 if s.get('recovery_after_final') else 1))*s['between_iterations_recovery']['completion']['value'] for s in steps)
for r in run:
    check('run_total:'+r['recipe_id'],abs(run_seconds(r['executable_template']['steps'])/60-r['dose_duration_minutes'])<1e-8)
    for f in ['intent','eligibility','phase_suitability','essential_stimulus','optional_stimulus','knobs','work_recovery_structure','target_methods_allowed','calibration_requirements','progression_rules','regression_rules','deload_taper_interaction','substitution_degradation_path','stop_hold_conditions','recovery_burden_expectation','uncertainty_handling','binding_contract','numeric_provenance']:check(f'run:{r["recipe_id"]}:{f}',bool(r.get(f)))
for r in strength:
    check('strength_complete:'+r['recipe_id'],bool(r['exercises']) and bool(r['binding_contract']))
    for e in r['exercises']:
        w=e['work'];check('strength_dose:'+r['recipe_id']+'/'+e['exercise_id'],w['sets']>0 and w['repetitions_per_set']>0 and w['rest_between_sets_s']>0 and w['effort']['target']>=0)
def min_of(t):h,m=map(int,t.split(':'));return h*60+m
def fixture_run_min(s):
    return sum(st['duration_minutes'] if st['phase']!='repeat' else st['iterations']*st['work']['duration_minutes']+st['recovery_count']*st['recovery']['duration_minutes'] for st in s['prescription']['steps'])
for p in plans:
    a=am[p['athlete_id']];slots={(w['day'],w['start']):w['duration_minutes'] for w in a['schedule']};seen=[]
    for s in p['sessions']:
        key=p['plan_id']+'/'+s['session_id'];r=rm.get(s['recipe_ref']);check('session_subject:'+key,s['athlete_id']==p['athlete_id']);check('session_recipe:'+key,r is not None)
        dur=s['prescription'].get('total_duration_minutes',s['prescription'].get('duration_budget_minutes'))
        check('schedule_fits:'+key,(s['day'],s['start']) in slots and dur<=slots.get((s['day'],s['start']),-1))
        for old in seen:
            if old[0]==s['day']:check('no_overlap:'+key+'/'+old[3],min_of(s['start'])>=old[2] or min_of(s['start'])+dur<=old[1])
        seen.append((s['day'],min_of(s['start']),min_of(s['start'])+dur,s['session_id']))
        if s['modality']=='RUN':
            check('fixture_run_arithmetic:'+key,abs(fixture_run_min(s)-dur)<1e-8)
            check('fixture_run_catalog_duration:'+key,dur==r['dose_duration_minutes'])
            check('core_calibration_bound:'+key,not s['missing_critical_calibration'])
            check('run_familiarity:'+key,s['recipe_ref'] in a['history']['run_families'])
        else:
            check('fixture_strength_catalog:'+key,len(s['prescription']['exercises'])==len(r['exercises']) and dur==r['dose_duration_minutes'])
            for e,ce in zip(s['prescription']['exercises'],r['exercises']):
                h=a['history']['strength_configurations'][e['history_configuration_key']];kg=h.get('load_kg_per_hand') if e['load']['unit']=='kg_per_hand' else h.get('load_kg')
                check('history_load_bind:'+key+'/'+e['exercise'],e['load']['value']==kg)
                check('catalog_work_bind:'+key+'/'+e['exercise'],[e['sets'],e['reps'],e['rir'],e['rest_seconds']]==[ce['work']['sets'],ce['work']['repetitions_per_set'],ce['work']['effort']['target'],ce['work']['rest_between_sets_s']])
                check('no_unsupported_work_volume_jump:'+key+'/'+e['exercise'],e['sets']<=h['sets'] and e['reps']<=h.get('reps',h.get('reps_per_side')))
    dist=p['planned_distribution'];check('plan_total:'+p['plan_id'],dist['run_core_minutes']==sum(s['prescription']['total_duration_minutes'] for s in p['sessions'] if s['modality']=='RUN' and not s['optional']) and dist['run_optional_minutes']==sum(s['prescription']['total_duration_minutes'] for s in p['sessions'] if s['modality']=='RUN' and s['optional']))
    check('history_week_cap:'+p['plan_id'],dist['run_core_minutes']+dist['run_optional_minutes']<=a['current_capacity']['run']['familiar_week_minutes'])
    check('strength_frequency_history:'+p['plan_id'],dist['strength_sessions']<=a['current_capacity']['strength']['familiar_sessions_per_week'])
for aid in ['ATH-SF','ATH-LOW','ATH-GF']:check('no_inherited_unfamiliar_run:'+aid,not({'RUN-LONG60','RUN-CRUISE3X6'}&set(am[aid]['history']['run_families'])))
for s in sc:
    i=s['scenario_id'];check('scenario_subject:'+i,s['athlete_id']==plm[s['initial_plan_ref']['plan_id']]['athlete_id'])
    for f in ['initial_plan_ref','reasoning','evidence','execution_event','new_observation','resulting_decision','mec','preserve','modify','confidence','autonomy','next_check']:check('scenario_field:'+i+'/'+f,f in s and s[f] is not None)
    check('scenario_policy_refs:'+i,set(s['evidence']['policy_ids'])<=set(pm));check('scenario_source_refs:'+i,set(s['evidence']['source_ids'])<=set(so))
    check('scenario_autonomy:'+i,s['autonomy']['level'] in 'ABCDE')
    if s['resulting_decision'].get('effect')=='NONE':check('noop_empty_delta:'+i,not s['resulting_decision']['change_set'])
check('balanced_no_hidden_run_tiebreak',sm['E2E-21']['resulting_decision']['action_class']=='ASK' and len(sm['E2E-21']['resulting_decision']['candidates'])==2)
check('true_underperformance_witness',sm['E2E-23']['execution_event']['type']=='SYNTHETIC_COMPARABLE_STRENGTH_FAILURES')
check('in_session_prefix_arithmetic',sm['E2E-15']['execution_event']['completed_minutes_before_branch']==24 and sm['E2E-15']['resulting_decision']['actual_total_minutes']==32 and sm['E2E-15']['resulting_decision']['actual_work_minutes']==12)
check('local_branch_work_set_arithmetic',sm['E2E-24']['resulting_decision']['actual_work_sets']==sum(x['sets'] for x in sm['E2E-24']['execution_event']['actual']))
learn=sm['E2E-16']['learned_pattern'];check('learning_not_single_event',len(learn['observations'])>1 and all(learn['sufficiency'].values()) and 'not causal' in learn['claim'])
cov=data['COACHING_COVERAGE_MATRIX.json'];check('coverage_denominators',sum(x['tier']=='NORMAL_V1' for x in cov['matrix'])==cov['denominators']['normal_designed_situations']==22 and len(cov['matrix'])==31)
for c in cov['matrix']:check('coverage_refs:'+c['coverage_id'],set(c['scenario_ids'])<=set(sm))
schema=load(P/'governance/agents/sports-science-reviewer/decision.schema.json');source_schema={'$schema':schema['$schema'],'$ref':'#/$defs/source','$defs':schema['$defs']}
for s in sources:check('source_schema:'+s['source_id'],not list(Draft202012Validator(source_schema,format_checker=FormatChecker()).iter_errors(s)))
contracts=data['COACHING_CONTRACTS.json'];Draft202012Validator.check_schema(contracts)
for w in contracts['x-conformance-witnesses']:
    # Author embeds a target_schema_ref, instance, and expected validity; inspect actual keys below if contract changes.
    target=w.get('schema_ref') or w.get('target_schema_ref') or w.get('contract_ref')
    inst=w.get('instance',w.get('input',w.get('message')))
    target=target or contracts['$ref']
    if target and inst is not None:
        validator=Draft202012Validator({**contracts,'$ref':target},format_checker=FormatChecker())
        valid=not list(validator.iter_errors(inst));expected=w.get('expected_schema_valid',w.get('expected_valid',w.get('expected')=='VALID'))
        check('contract_witness:'+str(w.get('witness_id',w.get('id'))),valid==expected)
fixture_schema={'$schema':'https://json-schema.org/draft/2020-12/schema','title':'ACF documentary E2E aggregate, not logical runtime contracts','type':'object','required':['revision','synthetic_only','runtime_effects_authorized','plans','blocks','scenarios'],'properties':{'revision':{'const':'ACF-1.0.0-r1'},'synthetic_only':{'const':True},'runtime_effects_authorized':{'const':False},'plans':{'type':'array','minItems':9,'items':{'type':'object','required':['plan_id','plan_revision','athlete_id','sessions','planned_distribution'],'properties':{'sessions':{'type':'array','minItems':1,'items':{'type':'object','required':['session_id','recipe_ref','athlete_id','day','start','prescription']}}}}},'scenarios':{'type':'array','minItems':24,'items':{'type':'object','required':['scenario_id','athlete_id','initial_plan_ref','reasoning','evidence','execution_event','new_observation','resulting_decision','mec','preserve','modify','confidence','autonomy','next_check'],'properties':{'autonomy':{'type':'object','required':['level'],'properties':{'level':{'enum':list('ABCDE')}}}}}}}}
(D/'FIXTURE_SCHEMA.json').write_text(json.dumps(fixture_schema,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
v=Draft202012Validator(fixture_schema,format_checker=FormatChecker());check('fixture_aggregate_schema',not list(v.iter_errors(e2)))
bad=copy.deepcopy(e2);bad['scenarios'][0]['autonomy']['level']='AUTO_MAGIC';check('negative_invalid_autonomy_rejected',bool(list(v.iter_errors(bad))))
bad=copy.deepcopy(e2);del bad['scenarios'][0]['execution_event'];check('negative_missing_event_rejected',bool(list(v.iter_errors(bad))))
baseline=load(A/'BASELINE.json')
for f in baseline['files']:
    if f['path'] not in baseline['permitted_mutations']:check('baseline_preserved:'+f['path'],(P/f['path']).is_file() and sha(P/f['path'])==f['sha256'])
for f in ['CURRENT_MISSION.md','MISSION_LEDGER.md']:check('append_only:'+f,(P/f).read_bytes().startswith((A/'before'/f).read_bytes()))
queue=load(P/'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json');before=load(A/'before/reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json')
check('queue46_prior_items_preserved',len(before['items'])==46 and queue['items'][:46]==before['items'])
check('funding_not_invented',queue['funding_trigger']==before['funding_trigger'])
review_manifest=A/'REVIEW_INPUT_MANIFEST.json'
if review_manifest.exists():
    for f in load(review_manifest)['files']:check('review_target_current:'+f['path'],sha(P/f['path'])==f['sha256'])
mode='FINAL' if '--final' in sys.argv else 'PRE_REVIEW'
if mode=='FINAL':
    for f in ['SCIENTIFIC_DECISION_REGISTRY.json','SCIENTIFIC_DECISION_REGISTRY.md','HUMAN_REVALIDATION_QUEUE_UPDATE.json','GATE_DISPOSITION.json','FINAL_REPORT.md','reviews/SCIENCE_REVIEW.json','reviews/INDEPENDENT_SCIENTIFIC_DECISIONS.json','reviews/GOVERNANCE_REVIEW.json']:check('final_artifact:'+f,(D/f).is_file())
    gate=load(D/'GATE_DISPOSITION.json');reg=load(D/'SCIENTIFIC_DECISION_REGISTRY.json');record_check=load(A/'SSCTR_RECORD_VALIDATION.json')
    check('final_ssctr_record_validator',record_check['passed'] and not record_check['errors'] and record_check['records']==reg['decision_count'])
    check('final_review_science_hash',gate['science']['review_sha256']==sha(D/'reviews/SCIENCE_REVIEW.json') and gate['science']['records_sha256']==sha(D/'reviews/INDEPENDENT_SCIENTIFIC_DECISIONS.json'))
    check('final_review_governance_hash',gate['governance']['review_sha256']==sha(D/'reviews/GOVERNANCE_REVIEW.json'))
    check('final_governance_conditions_satisfied',all(x['satisfied'] for x in gate['governance']['guards'].values()))
    expected_verdicts={'AUTONOMOUS_COACHING_SPEC_READINESS':'NOT_READY','PRESCRIPTION_COVERAGE_READINESS':'NOT_READY','RUNTIME_IMPLEMENTATION_READINESS':'NO_GO','AUTONOMOUS_COACH_RUNTIME_READINESS':'NO_GO'}
    check('final_full_target_verdicts',gate['verdicts']==expected_verdicts and gate['definition_of_done_full_target_satisfied'] is False)
    check('final_candidate_no_runtime_publication',gate['foundation_authority']=='CANDIDATE / NON-AUTHORITATIVE' and gate['runtime_effects_authorized'] is False and gate['publication_status']=='NOT_PUBLISHED')
    check('final_queue_hash',gate['human_queue']['after_sha256']==sha(P/'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'))
    check('final_queue_exact_counts',len(queue['items'])==88 and gate['human_queue']['new_approval_items']==record_check['prescriptive_approval_queue_matches']==42)
    check('final_scientific_counts',reg['decision_count']==57 and reg['disposition_counts']=={'APPROVE_WITH_CONDITIONS':42,'LIMITED_REVERSIBLE_RECOMMENDATION':15})
result={'revision':'ACF-VERIFY-r1','mode':mode,'executed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mechanism':'Python3.12 jsonschema Draft202012Validator+FormatChecker, fixture arithmetic/subject/schedule/crossrefs, baseline hashes and append-only queue; no coach runtime executed','checks':checks,'passed':all(x['passed'] for x in checks),'counts':{'checks':len(checks),'failed':sum(not x['passed'] for x in checks),'athletes':len(ath),'plans':len(plans),'scenarios':len(sc),'policies':len(pol),'run_recipes':len(run),'strength_recipes':len(strength),'literature_sources':len(sources)},'limits':['Documentary fixture and schema consistency only','Not scientific approval, runtime behavior, safety/efficacy or population coverage','Final independence/source/queue guards recorded separately in GATE_DISPOSITION.json']}
out=D/'VERIFICATION.json' if mode=='FINAL' else A/'PRE_REVIEW_CHECKS.json'
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'passed':result['passed'],'counts':result['counts'],'failures':[x for x in checks if not x['passed']]},ensure_ascii=False,indent=2))
sys.exit(0 if result['passed'] else 1)
