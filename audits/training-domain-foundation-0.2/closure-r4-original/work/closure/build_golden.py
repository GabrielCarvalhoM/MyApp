"""Materialize documentary fixtures. This is NOT an Adaptive Engine or EvalRun."""
from pathlib import Path
import json, hashlib, copy

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'outputs/closure-r4'
REV = 'AE-CLOSE-20261022-r4'

def digest(v):
    return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

CONTROL = {'FZ-S01','FZ-S02','S07','FZ-S07','SIL-S12','SIL-S04','S47','Q02','Q04','Q07'}

def build(baseline, fix):
    by = {c['id']:c for c in baseline['cases']}
    fixtures=[]
    for old in baseline['golden']:
        sid=old['id']; c=by[sid]
        f={
          'scenario_id':sid,'fixture_id':'GOLD-'+sid+'-r4','revision':REV,
          'purpose':'SYNTHETIC_ONLY','family':c['family'],
          'source':{'revision':baseline['revision'],'path':'../../inputs/product/ADAPTIVE_ENGINE_SCENARIO_LAB.md','line':c['source_line'],'input':c['source_input'],'oracle':c['source_oracle']},
          'authority_profile':{'id':'CLOSURE-CONTROL-r4','approval':'SIMULATED_TEST_AUTHORITY_ONLY','real_professional_approval':False,'domain_gold':None},
          'athlete_state':{'id':'synthetic-athlete-A','mode':'M1','adult':True,'coverage':'SIMULATED_F0','context_revision':'c1','athlete_model_revision':'am1','clinical_clearance':'NOT_ASSERTED','holds':[]},
          'goal_priority':{'mode':c['priority'],'origin':c['priority_origin'],'exercise':c['priority_exercised'],'revision':'g1','goals':['existing_declared_goal'],'hidden_weights':False},
          'relevant_history':{'facts':[],'comparability':'NOT_NEEDED_FOR_CONTROL_ASSERTIONS' if sid in CONTROL else 'DOMAIN_CRITERIA_NOT_SUPPLIED','no_history_is_not_zero':True},
          'recovery_signals':{'observations':[],'status':'NOT_EXERCISED' if c['rubric']['recovery']['result']=='N/E' else 'SEE_EXPLICIT_VARIANT','method_conversion_allowed':False,'universal_score':None},
          'planned_week':{'revision':'p1','clock':'2026-10-26T06:00:00-03:00','timezone':'America/Sao_Paulo','sessions':[],'payload_scope':'REFERENCES_ONLY; no physiological dose supplied or inferred'},
          'completed_activities':[],
          'constraints':{'permissions_revision':'u1','authority_revision':'a1','hold_revision':'h0','entitlement':'SIMULATED_VALID','outbound':'DISABLED','external_effects':'FORBIDDEN','guard':['plan','context','permission','hold','authority','session_state','act'],'prescription_without_approved_policy':'FORBIDDEN'},
          'expected_preserve':old['expected_preserve'],'expected_modify':old['expected_modify'],
          'min_change_level':None,'max_change_level':None,
          'change_bound_scope':'No ordinal bound on an unknown sporting action. Control HOLD/ASK are not change levels.',
          'must_not':old['must_not']+['infer_real_approval_from_simulated_authority','convert_fixture_to_real_training'],
          'agency_requirement':{'material_mutation':'EXPLICIT_CURRENT_ACT_AND_COMMIT_GUARD','inspect_or_start_is_acceptance':False,'export':'SEPARATE_EXPLICIT_INTENT'},
          'next_check_invariants':['No new plan revision for an empty semantic delta','New material fact invalidates only its dependencies','Current approval/coverage/agency at commit and dispatch','No duplicate active exposure per fact/revision/scope','Athlete Model update is separate from plan content mutation'],
          'candidate_recipe_set':[],
          'policy_bundle':{'id':'SYNTHETIC-CONTROL-r4','real_training_authority':False,'rules':[
            {'id':'CTRL-GUARD-r4','when':'a dependency revision differs at commit','then':'STALE; no new dependent effect'},
            {'id':'CTRL-LEARN-r4','when':'all applicable gates valid and synthetic adequacy=ADEQUATE','then':'KEEP; model may update under primary purpose; no plan delta'},
            {'id':'CTRL-NOPOLICY-r4','when':'a required rule has no valid applicable approval','then':'retain only affected prescription; no invented dose or clearance'}]},
          'variants':[],
          'expected_domain_decision':None,
          'readiness':'CLOSED_CONTROL_FIXTURE' if sid in CONTROL else 'MATERIALIZED_DOMAIN_OPEN',
          'materialization':'SELF_CONTAINED_DOCUMENTARY_INPUT_AND_ASSERTIONS',
          'domain_status':'NOT_EVALUABLE_DOMAIN',
          'required_closure':old['required_closure'],
          'gold_authority':'AI documentary contract label only; competent human sports gold absent',
          'execution_status':'NOT_EXECUTED; assertions below are expected, never observed engine output',
          'confidence':'Alta nos invariantes de contrato citados; nenhuma confiança fisiológica inferida',
          'source_case_classification':c['classification'],
        }
        def session(s,kind,window,intent):
            return {'id':s,'revision':s+'-r1','sport':kind,'window':window,'intent':intent,'recipe':s+'-OPAQUE','dose':'NOT_SUPPLIED','already_accepted':'SIMULATED_TEST_PREMISE'}
        def variant(name,inputs,expect):
            f['variants'].append({'id':sid+'/'+name,'inputs':inputs,'expected':expect,'assertion_status':'DECLARED_NOT_RUN'})
        if sid in {'S01','S02','FZ-S06','S05','S09','S06','S47','Q04','Q07'}:
            f['planned_week']['sessions']=[session('S-L','STRENGTH','2026-10-27/evening','lower'),session('S-T','RUNNING','2026-10-28/morning','threshold'),session('S-R','RUNNING','2026-11-01/morning','long_run')]
        if sid in {'S01','S02'}:
            f['goal_priority']['mode']='Run-first' if sid=='S01' else 'Strength-first'
            f['recovery_signals']={'observations':[{'id':'local-load-1','value':'SUSTAINED_LOCAL_FATIGUE','method':'SYNTHETIC_ENUM','comparable':True}],'numeric_dose_mapping':None}
            f['candidate_recipe_set']=[{'id':'KEEP','level':0},{'id':'C-A','action':'MOVE S-L','level':3},{'id':'C-B','action':'MOVE S-T','level':3}]
            variant('original-positive',{'R_CROSS':'SYNTHETIC_ONLY','adequacy_rule':'MISSING_REAL_APPROVAL','necessity':'UNDETERMINATE'}, {'sporting_winner':'NOT_EVALUABLE','plan_mutation_count':0,'candidate_levels_below_3':'MUST_BE_ASSESSED; not assumed invalid'})
            variant('approval-absent',{'policy_valid':False},{'action':'HOLD','scope':'dependent_prescription','user_confirmation_cannot_supply_approval':True})
            f['required_closure']='G01/G02 applicable rule plus the eight-field migrated positive original; logical scheduling extension remains a separate input.'
        elif sid=='FZ-S06':
            f['goal_priority']['mode']='Balanced';f['goal_priority']['goals']=['Run','Strength']
            f['constraints'].update({'double_preference':'YES_ON_TUESDAY_ONLY','same_day_windows':['07:00–08:00','18:00–19:00'],'horizon_next_key':'2026-10-29/key-run; domain interaction not approved'})
            variant('dominant',{'candidate_effects':{'D':['Run preserved','Strength preserved'],'A':['Run preserved','Strength lost'],'B':['Run lost','Strength preserved']},'dominance':'D at least as good in both and strictly better in one versus each competitor'}, {'synthetic_selection':'D','agency':'CONFIRM','real_horizon_validation':'HUMAN_REVIEW_REQUIRED'})
            variant('incomparable',{'available_candidates':['A','B'],'approved_tradeoff':None},{'action':'ASK','question':'Qual objetivo deve ceder nesta janela?','plan_mutation_count':0,'hidden_tiebreak':False})
            variant('double-refused',{'double_preference':'AVOID'},{'double_inferred_from_windows':False,'unapproved_double':'FORBIDDEN'})
        elif sid in {'FZ-S01','FZ-S02'}:
            f['planned_week']['adequacy']='ADEQUATE_SIMULATED';f['completed_activities']=[{'id':'O1','revision':1,'fact':'confirmed_session','lineage':['manual1'],'scope':'primary_model_update'}]
            f['min_change_level']=f['max_change_level']=0
            f['change_bound_scope']='Valid and adequate fixed test snapshot only; authority loss invalidates KEEP.'
            variant('learn',{'new_observation':'O1','model_update_authorized':True,'adequacy':'ADEQUATE','alternative':'BETTER_ONLY_MARGINAL' if sid=='FZ-S02' else None},{'action':'KEEP','change_level':0,'plan_revision':'p1','model_revision':'am2','change_set':None,'export_intents':0,'adaptation_notices':0})
        elif sid=='FZ-S03':
            variant('micro-sufficient',{'adequacy':'INADEQUATE_SIMULATED','material_fact':'fixture constraint violated','micro_candidate':'rest-parameter-B; physiological payload absent','micro_sufficiency':'SYNTHETIC_ONLY','cost_rule':'prefer smallest sufficient effect after HC/horizon'}, {'positive_level':1,'domain_label':'NOT_EVALUABLE_DOMAIN','no_replan_if_micro_is_sufficient':True})
            variant('volume-required',{'micro_sufficiency':False,'volume_candidate':'remove explicitly optional block; no new dose generated','volume_sufficiency':'SYNTHETIC_ONLY'}, {'positive_level':2,'domain_label':'NOT_EVALUABLE_DOMAIN','intensity_inferred_safe':False})
        elif sid=='S05':
            f['recovery_signals']={'observations':[{'id':'SL1','value':'POOR_SLEEP'},{'id':'F1','value':'HIGH_FATIGUE'},{'id':'P1','value':'DECLINING_PERFORMANCE'}],'comparability':'SIMULATED','real_instrument_anchors':None}
            variant('convergence',{'signals':['SL1','F1','P1'],'approved_signal_to_action_rule':None},{'dose':'NOT_EVALUABLE','no_percent_rule':True,'control':'retain dependent mutation; ask only missing decisive context'})
            f['required_closure']='G02: instruments, comparability, applicable adequacy/necessity and accepted reduction recipe. Three enums do not constitute physiological proof.'
        elif sid=='SIL-S09':
            f['planned_week']['sessions']=[session('LOWER','STRENGTH','2026-10-27/evening','covered lower purpose'),session('NEXT-RUN','RUNNING','2026-10-28/morning','key Run')]
            f['exercise_catalog_slice']=[{'id':'EX-A','revision':1,'pattern':'SQUAT','equipment':'barbell','demand_axial':'UNKNOWN','demand_eccentric':'UNKNOWN','dose':'NOT_SUPPLIED'},{'id':'EX-B','revision':1,'pattern':'SQUAT','equipment':'dumbbell','demand_axial':'UNKNOWN','demand_eccentric':'UNKNOWN','dose':'NOT_SUPPLIED'}]
            variant('same-group-insufficient',{'original':'EX-A','candidate':'EX-B','same_muscle':True,'approved_equivalence_rule':None},{'substitution_authorized':False,'exact_replacement':'NOT_EVALUABLE','next_run_safety':'NOT_ASSERTED'})
            f['required_closure']='G01 repertory + G02 exercise/configuration/intent/dose/demand and horizon approval. Minimal catalog slice explicitly preserves missing metadata.'
        elif sid=='S28':
            f['planned_week'].update({'revision':'old-plan-ended','status':'ENDED_BY_DECLARED_INTERRUPTION'})
            f['athlete_state']['current_context']='CHANGED; exact coverage/return restrictions not supplied'
            variant('return-rule-absent',{'plan_base':'NONE_FOR_NEW_HORIZON','return_policy':None},{'action':'HOLD','scope':'return_prescription','old_maxima_restored':False,'missed_volume_debt':False,'numeric_change_level':None})
            f['required_closure']='G01/G02/G04 competent nonclinical/clinical scope and return recipe; INITIAL/RETURN cannot establish Level5/6.'
        elif sid=='S09':
            f['completed_activities']=[{'id':'S-MISS','status':'CONFIRMED_NOT_PERFORMED','source':'explicit_synthetic_athlete_statement','not_sync_inference':True}]
            variant('confirmed-missed',{'fact':'S-MISS','future_adequacy':'UNDETERMINATE','adherence_threshold':None},{'automatic_makeup':False,'volume_debt':False,'future_action':'NOT_EVALUABLE','past_fact_preserved':True})
        elif sid=='S06':
            f['recovery_signals']={'observations':[{'id':'HRV1','construct':'RMSSD','protocol':'same_simulated_method','relative_status':'UNFAVOURABLE'},{'id':'SELF1','construct':'perceived_recovery','status':'GOOD'},{'id':'PERF1','construct':'comparable_performance','status':'GOOD'}],'thresholds':None}
            variant('discordance',{'independent_path':'synthetic R-HRV declares valid KEEP; no real policy supplied'},{'hrv_as_single_veto':False,'uncertainty_preserved':True,'real_training_decision':'NOT_EVALUABLE'})
        elif sid=='S07':
            f['planned_week']['sessions']=[session('NEXT','UNSPECIFIED','NEXT_WINDOW','next session; dependent scope only')]
            f['athlete_state']['holds']=[{'id':'H1','scope':'NEXT','status':'ACTIVE_CONFIRMED_TEST_RESTRICTION','clinical_diagnosis':None,'exit_owner':'qualified_professional_when_required','exit_evidence':'applicable rule + valid review, never HRV/consent'}]
            f['recovery_signals']={'observations':[{'id':'HRV1','value':'FAVOURABLE_SIMULATED'}]}
            variant('restriction-dominates',{'restriction':'H1','hrv':'FAVOURABLE','consent':'ACCEPT'},{'action':'HOLD','scope':'NEXT','clearance_by_hrv':False,'clearance_by_consent':False,'clinical_copy':'NOT_FINALIZED'})
            f['required_closure']='Control assertions closed. G04 remains required to create/classify/clear a real clinical restriction.'
        elif sid=='SIL-S10':
            f['planned_week'].update({'clock':'2026-12-24T06:00:00-03:00','phase':'TAPER_TEST_PREMISE'})
            f['event']={'name':'101ª São Silvestre','date':'2026-12-31','distance_km':15,'verified_source':'https://www.saosilvestre.com.br/regulamento/','retrieved':'2026-10-22','athlete_participation':'SYNTHETIC_PREMISE; not an actual registration'}
            variant('event-confirmed',{'priority':'Run-first temporal event','existing_taper_recipe':'OPAQUE; no dose approved here','new_candidate':'add hard lower block'},{'calendar_alone_prescribes':False,'percent_taper':None,'candidate_need_and_horizon':'HUMAN_REVIEW_REQUIRED'})
            variant('event-cancelled-counterfactual',{'event_status':'CANCELLED_IN_FIXTURE_ONLY'},{'invalidate_event_dependent_proposals':True,'restore_full_load_automatically':False,'new_goal_or_date_if_decisive':'ASK'})
        elif sid=='FZ-S07':
            f['planned_week']['adequacy']='VALID_ADEQUATE_AFTER_DECLINE_SIMULATED'
            variant('decline',{'proposal':'P-A','semantic_reason':'R1','response':'DECLINE','new_material_fact':None},{'agency_constraint':'scope_of_P-A','plan_revision':'p1','reoffer_same_reason_with_new_id':False,'hold_override':False})
        elif sid=='SIL-S12':
            f['planned_week']['sessions']=[session('S1','STRENGTH','2026-10-27/18:00','existing chosen session'),session('S2','RUNNING','2026-10-29/07:00','independent session')]
            variant('proposal-includes-started',{'proposal':'P1','affects':['S1','S2'],'dependencies':['S1/not-started'],'event':'S1 START before commit','new_post_start_material_fact':None},{'proposal_status':'STALE_WHOLE_COMPOSITE','mutations':0,'reoffer_remaining_same_reason':False,'executing_revision':'S1-r1'})
            variant('independent',{'proposal':'P2','affects':['S2'],'dependencies':['S2/not-started'],'event':'S1 START before commit'},{'invalidated_merely_by_S1_start':False,'other_guards_still_required':True})
        elif sid=='SIL-S04':
            f['completed_activities']=[{'id':'O1','completed_blocks':['B1','B2'],'not_completed_blocks':[],'not_observed_blocks':[]}]
            f['targets']={'A':{'revision':'A1','blocks':['B1','B2','B3']},'B':{'revision':'B1','blocks':['B1','B2'],'removed_deliberately':['B3'],'accepted':True},'block_dose':'NOT_SUPPLIED; set membership tests target provenance only'}
            variant('reduced-target',{'executed_target':'B','observed':'O1'},{'failed_original_A':False,'earned_original_A':False,'removed_target_opportunity':'NOT_ASSESSED','active_target':'B'})
            variant('original-target',{'executed_target':'A','observed':'O1','adherence_policy':None},{'adherence':'UNCLASSIFIED','supply_missing_RIR_or_tolerance':False})
        elif sid=='S47':
            f['planned_week']['sessions']=[session('S-L','STRENGTH','W-A','lower'),session('S-T','RUNNING','W-C','threshold')]
            f['candidate_recipe_set']=[{'id':'X','delta':{'S-L.window':'W-B'}},{'id':'Y','delta':{'S-T.window':'W-B'}},{'id':'XY','ordered_members':['X','Y']}]
            f['policy_bundle']['rules'].append({'id':'R-HORIZON-r1','type':'SYNTHETIC_ONLY_RESOURCE_CONSTRAINT','invalid':'S-L.window == S-T.window == W-B','reason':'COMPOSITE_HORIZON_CONFLICT','does_not_define_physiological_spacing':True})
            variant('composition',{'base':'p1','generated':['X','Y','XY'],'confirmation':None},{'admissible':['X','Y'],'rejected':['XY'],'jev_input':['X','Y'],'plan_revision':'p1','effect_intents':0,'winner_X_vs_Y':'NOT_EXERCISED'})
        elif sid=='Q02':
            f['planned_week']['sessions']=[session('S1','UNSPECIFIED','2026-10-27/morning','expected session; observation initially UNKNOWN')]
            f['event_sequence']=[{'id':1,'type':'SOURCE_LAG','session':'S1'},{'id':2,'type':'MANUAL','fact':'F1','revision':1},{'id':3,'type':'PROVIDER','confirmed_same_fact':'F1','revision':1},{'id':4,'type':'STORE_REPLICA','confirmed_same_fact':'F1','revision':1},{'id':5,'type':'LEGITIMATE_CORRECTION','fact':'F1','revision':2},{'id':6,'type':'REPLAY','fact':'F1','revision':1}]
            variant('trajectory',{'events':'event_sequence','association':'EXPLICIT_TEST_FACT'},{'missing_at_event_1':'UNKNOWN','active_facts':1,'active_revision':2,'replay_reverts_fact':False,'automatic_makeup':False})
        elif sid=='Q04':
            f['event_sequence']=[{'id':1,'type':'REORDER_SAME_FACTS','material_projection':'M1','jev':'A'},{'id':2,'type':'REORDER_SAME_FACTS','material_projection':'M1','jev':'B'},{'id':3,'type':'DECLINE','scope':'proposal-P1'},{'id':4,'type':'REPEAT','material_projection':'M1'},{'id':5,'type':'NEW_CONFIRMED_RESTRICTION','scope':'S-L'}]
            f['policy_bundle']['rules'].append({'id':'JITTER-r4','when':'only delivery order / nonmaterial advisory output differs; exact canonical fact/revision projection equal','then':'materially_same','numeric_noise_band':None})
            variant('trajectory',{'events':'event_sequence'},{'events_1_2_official_equal':True,'repeat_after_decline_reoffers':0,'last_action':'HOLD','hold_scope':'S-L','recovery_debt_model':'NOT_EXERCISED'})
        elif sid=='Q07':
            f['planned_week']['revision']='p2'
            f['planned_week']['sessions'][0]['window']='W-FREE'
            f['planned_week']['current_evaluation']={'ref':'ADEQ-Q07-p2-current','status':'ADEQUATE_SIMULATED','plan_revision':'p2','all_current_test_guards':'VALID','material_facts_since_commit':'NONE; only duplicate delivery/query/JEV variation','scope':'Current whole remaining horizon, not inferred from historical commit alone'}
            f['accepted_delta']={'proposal':'P-SCHEDULE','base':'p1','result':'p2','delta':{'S-L.window':'W-FREE'},'adequacy':'SIMULATED_VALID','necessity':'ORIGINAL_WINDOW_REMOVED_IN_TEST','authority':'SIMULATED_ONLY','acceptance':'ACT1_CURRENT','guards':'ALL_TEST_REVISIONS_MATCH','source_rebase':'FIX-01/S01 scheduling extension; not real R-CROSS proof'}
            f['event_sequence']=[{'id':1,'type':'VALID_COMMIT_TEST_PREMISE','revision':'p2'},{'id':2,'type':'REPEAT_MOTIVATING_FACT'},{'id':3,'type':'QUERY_ON_P2'},{'id':4,'type':'REPLAY_WITH_NEW_DELIVERY_ID'}]
            f['min_change_level']=f['max_change_level']=0
            f['change_bound_scope']='Only after the legitimate test premise commit in p2; not a bound on original p1 sporting adaptation.'
            variant('satisfied-delta',{'events':'event_sequence','semantic_delta_already_satisfied':True},{'new_plan_revisions':0,'plan_revision':'p2','new_export_intents':0,'new_proposals':0,'action':'KEEP'})
        f.setdefault('event_sequence',[{'id':i+1,'type':'EVALUATE_VARIANT','variant':v['id']} for i,v in enumerate(f['variants'])])
        f['authority_profile_ref']=f['authority_profile']['id']
        f['initial_snapshot']={'athlete_state':'#/athlete_state','goals':'#/goal_priority','plan':'#/planned_week','history':'#/relevant_history','recovery':'#/recovery_signals','authority':'#/authority_profile','permission_capability_state':'#/permission_capability_state','reference_scope':'JSON pointers within this same fixture; no missing external payload is implied'}
        f['facts_and_lineage']={'completed_facts':copy.deepcopy(f['completed_activities']),'recovery_facts':copy.deepcopy(f['recovery_signals']),'event_facts':'#/event_sequence','associations':'Explicit only; no inferred deduplication association','real_athlete_data':False}
        f['session_intents_demands']=[{'session_ref':s['id'],'intent':s['intent'],'dose':s['dose'],'physiological_demand':'UNKNOWN_NOT_INFERRED','profile_scope':'LOGICAL_CONTROL_ONLY'}for s in f['planned_week']['sessions']]
        f['permission_capability_state']={'revision':'u1','primary_model_purpose':'SIMULATED_AUTHORIZED','secondary_I10':'OFF','provider':'STUB_ONLY','outbound_write':'OFF','remote_effects':'FORBIDDEN'}
        f['jev_fault_or_response']={'mode':'SHADOW','variants':['UNAVAILABLE','OPPOSE_OFFICIAL','MALFORMED'],'authority_to_mutate':False}
        f['llm_fault_or_response']={'variants':['UNAVAILABLE','PROPOSE_OUT_OF_SCOPE_ACTION'],'authority_to_mutate':False,'fallback':'Trace-faithful fixed explanation; no new facts or dose'}
        f['counterfactual_links']=['GOLD-S02-r4' if sid=='S01' else 'GOLD-S01-r4'] if sid in ['S01','S02'] else []
        f['expected_oracle']={'required_outcomes':[{'variant':v['id'],'assertions':v['expected']} for v in f['variants']],
          'allowed_equivalent_outcomes':'Only semantic equivalents of declared control assertions; no invented sporting winner',
          'forbidden_outcomes':f['must_not'],'label_status':f['readiness'],'observed_outputs':None,
          'required_trace_claims':['Known/unknown facts and revisions','Rules and simulated approvals actually used','Candidate admission/adequacy/necessity/cost when exercised','Official result distinct from JEV/text','Current scope/agency and version guard'],
          'expected_plan_session_revisions':'Per variant expected assertions; otherwise unchanged until explicit legitimate current act',
          'expected_confirmation':f['agency_requirement'],'expected_remote_evidence_level':'NOT_EXERCISED / no outbound write',
          'metamorphic_relation':'Reorder same facts or change JEV/LLM advisory output: same official action/scope/delta; new material fact requires independent re-evaluation',
          'gold_authority':f['gold_authority'],'limitations':[f['required_closure'],'No missing physiological dose or professional approval is supplied by this fixture']}
        f['fixture_sha256']=digest(f)
        fixtures.append(f)
    return fixtures

if __name__=='__main__':
    baseline=json.loads((ROOT/'outputs/validation-final.json').read_text(encoding='utf8'))
    fixtures=build(baseline,None)
    OUT.mkdir(exist_ok=True,parents=True)
    (OUT/'golden-fixtures.json').write_text(json.dumps({'revision':REV,'fixtures':fixtures},ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'materialized':len(fixtures),'closed_control':sum(f['readiness']=='CLOSED_CONTROL_FIXTURE' for f in fixtures),'domain_open':sum(f['readiness']=='MATERIALIZED_DOMAIN_OPEN' for f in fixtures)}))
