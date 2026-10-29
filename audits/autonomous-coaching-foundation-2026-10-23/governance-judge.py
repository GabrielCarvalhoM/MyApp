"""Independent documentary governance checks; no sports/runtime/efficacy approval."""
from pathlib import Path
import datetime, hashlib, json

PROJECT = Path(__file__).resolve().parents[2]
AUDIT = Path(__file__).resolve().parent
CANDIDATE = PROJECT / 'product/candidates/autonomous-coaching-foundation/1.0.0'
def load(p): return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
checks = []
def check(name, passed, evidence):
    checks.append({'check': name, 'passed': bool(passed), 'evidence': evidence})

baseline = load(AUDIT / 'BASELINE.json')
immutable = [x for x in baseline['files'] if x['path'] not in baseline['permitted_mutations']]
changed = [x['path'] for x in immutable if not (PROJECT/x['path']).is_file() or sha(PROJECT/x['path']) != x['sha256']]
check('all_preexisting_immutable_files_byte_preserved', not changed,
      {'baseline_file_count': len(baseline['files']), 'immutable_checked': len(immutable), 'changed': changed})

policy = load(CANDIDATE/'TRAINING_POLICY_LIBRARY.json')
scenarios = load(CANDIDATE/'END_TO_END_COACHING_SCENARIOS.json')
athletes = load(CANDIDATE/'SYNTHETIC_ATHLETE_FIXTURES.json')
coverage = load(CANDIDATE/'COACHING_COVERAGE_MATRIX.json')
contracts = load(CANDIDATE/'COACHING_CONTRACTS.json')
ids = {p['policy_id'] for p in policy['policies']}
consumed = {p for s in scenarios['scenarios'] for p in s['evidence']['policy_ids']}
check('all_twenty_policy_families_have_real_scenario_consumers',
      ids == {f'POL-{n:02}' for n in range(1,21)} and ids <= consumed,
      {'policies': sorted(ids), 'unconsumed': sorted(ids-consumed)})
check('nine_synthetic_nonclinical_athletes_and_subject_weeks',
      len(athletes['athletes']) == 9 and all(a['real_person'] is False and a['clinical_profile'] is False for a in athletes['athletes']) and {a['athlete_id'] for a in athletes['athletes']} == {p['athlete_id'] for p in scenarios['plans']},
      {'athlete_count': len(athletes['athletes']), 'week_count': len(scenarios['plans'])})
check('documentary_inputs_do_not_authorize_runtime',
      all(d['runtime_effects_authorized'] is False for d in [policy,scenarios,athletes,coverage]),
      'All four fixture aggregates explicitly prohibit runtime effects.')
a_actions = [s for s in scenarios['scenarios'] if s['autonomy']['level']=='A']
check('A_scenarios_have_zero_plan_mutation',
      all(s['resulting_decision']['effect']=='NONE' and s['resulting_decision'].get('change_set')==[] for s in a_actions),
      [s['scenario_id'] for s in a_actions])
check('A_policy_actions_only_KEEP_branches_or_noop',
      all(a['action_class']=='KEEP' for p in policy['policies'] for a in p['candidate_actions'] if a['autonomy_ceiling']=='A'),
      [(p['policy_id'],a['action_id']) for p in policy['policies'] for a in p['candidate_actions'] if a['autonomy_ceiling']=='A'])
sm={s['scenario_id']:s for s in scenarios['scenarios']}
check('balanced_conflict_ASK_preserves_two_competing_goal_options',
      sm['E2E-21']['resulting_decision']['action_class']=='ASK' and sm['E2E-21']['autonomy']['level']=='C' and len(sm['E2E-21']['resulting_decision']['candidates'])==2,
      sm['E2E-21']['resulting_decision'])
check('unresolved_taper_and_return_do_not_gain_A_or_B',
      sm['E2E-13']['autonomy']['level']=='D' and sm['E2E-14']['autonomy']['level']=='C',
      {'taper':sm['E2E-13']['autonomy'],'return':sm['E2E-14']['autonomy']})
check('coverage_denominators_are_separate_and_accurate',
      {k:sum(x['tier']==v for x in coverage['matrix']) for k,v in [('normal_designed_situations','NORMAL_V1'),('uncommon_designed_situations','UNCOMMON_NONCLINICAL'),('clinical_out_of_scope_routes','CLINICAL_OR_OUT_OF_SCOPE')]} == {k:coverage['denominators'][k] for k in ['normal_designed_situations','uncommon_designed_situations','clinical_out_of_scope_routes']}
      and all(x['runtime_or_empirical_proof'] is False for x in coverage['matrix']),
      coverage['denominators'])
inv={x['id']:x['requirement'] for x in contracts['x-invariants']}
check('lineage_dedup_revision_and_agency_invariants_present',
      all(i in inv for i in ['CC-03','CC-04','CC-05','CC-07','CC-18','CC-19','CC-22','CC-24','CC-28','CC-29','CC-31','CC-33']),
      {i:inv[i] for i in ['CC-03','CC-05','CC-07','CC-18','CC-22','CC-24','CC-28','CC-31']})
before = load(AUDIT/'before/reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json')
current = load(PROJECT/'reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json')
check('queue_preserves_all_46_previous_entries',
      len(before['items'])==46 and current['items'][:46]==before['items'],
      {'before':len(before['items']),'current':len(current['items'])})
check('funding_not_invented', current['funding_trigger']==before['funding_trigger'] and current['funding_trigger']['state']=='NOT_DECLARED', current['funding_trigger'])

manifest = load(AUDIT/'REVIEW_INPUT_MANIFEST.json')
manifest_changes=[f['path'] for f in manifest['files'] if sha(PROJECT/f['path'])!=f['sha256']]
check('exact_twentyfour_frozen_targets_current', len(manifest['files'])==24 and not manifest_changes,
      {'manifest_revision':manifest['revision'],'manifest_sha256':sha(AUDIT/'REVIEW_INPUT_MANIFEST.json'),'mismatched':manifest_changes})
prechecks=load(PROJECT/manifest['checks_ref'])
check('deterministic_prechecks_passed_before_final_judgment',
      len(prechecks['checks'])==2268 and all(c['passed'] for c in prechecks['checks']),
      {'ref':manifest['checks_ref'],'sha256':sha(PROJECT/manifest['checks_ref']),'check_count':len(prechecks['checks']),'executed_at':prechecks['executed_at']})

targets={str(p.relative_to(PROJECT)).replace('\\','/'):sha(p) for p in CANDIDATE.rglob('*') if p.is_file() and 'reviews' not in p.relative_to(CANDIDATE).parts}
targets['audits/autonomous-coaching-foundation-2026-10-23/TASK_CONTRACT.md']=sha(AUDIT/'TASK_CONTRACT.md')
result={'revision':'ACF-GOV-CHECKS-r1','evaluator_instance':'/root/governance_judge','artifact_revision':'ACF-1.0.0-r1','contract_revision':'ACF-1.0.0-r1','captured_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Independent documentary governance consistency only; no scientific or runtime gate. Queue projection completeness and frozen review binding are separately final checked.','passed':all(x['passed'] for x in checks),'checks':checks,'reviewed_targets_sha256':targets}
out=AUDIT/'governance-judge.checks.json'
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'passed':result['passed'],'checks':len(checks),'failed':[x['check'] for x in checks if not x['passed']],'target_count':len(targets)},ensure_ascii=True))
