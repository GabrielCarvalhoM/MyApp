import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { hash } from '../src/value.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const core = path.join(root, 'CoachingCore');
const acf = 'product/candidates/autonomous-coaching-foundation/1.0.0/';
const sdc = 'reviews/sports-domain-closure/2026-10-23/';
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const bytesHash = p => createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const write = (p,v) => { fs.mkdirSync(path.dirname(path.join(core,p)),{recursive:true}); fs.writeFileSync(path.join(core,p),JSON.stringify(v,null,2)+'\n'); };
const scenarios = read(acf+'END_TO_END_COACHING_SCENARIOS.json');
const athletes = read(acf+'SYNTHETIC_ATHLETE_FIXTURES.json').athletes;
const registry = read(acf+'SCIENTIFIC_DECISION_REGISTRY.json');
const policies = read(acf+'TRAINING_POLICY_LIBRARY.json').policies;
const records = read(acf+'reviews/INDEPENDENT_SCIENTIFIC_DECISIONS.json').records;
const sdcRegistry=read(sdc+'DECISION_REGISTRY.json');
const sdcCatalog=read(sdc+'scientific/G02_POLICY_REGISTRY.json');
assert.equal(hash(registry.decisions),hash(records),'registry must equal independent records');
for(const d of records) assert.equal(bytesHash(d.target.artifact),d.target.sha256,'stale scientific target '+d.review_id);

// Programs are an explicit engineering binding, not derived from expected action strings.
const programs = ['keep','keep','keep','runProgress','runProgress','strengthProgress','optionalMiss','jointHold','fatigueAsk','overTargetKeep','sourceAsk','keep','taperHold','returnAsk','cruiseBranch','learnedMove','strengthChoice','runChoice','keep','familiarNovice','paretoAsk','keep','strengthRegression','calfBranch'];
const programRecord = ['E-WEEKS','E-WEEKS','E-WEEKS','E-RUNPROG','E-RUNPROG','E-STRPROG','E-WEEKS','E-CONTROLS','E-CONTROLS','E-WEEKS','E-CONTROLS','E-WEEKS','E-CONTROLS','E-CONTROLS','E-INSESSION','E-LEARN','E-CONTROLS','E-CONTROLS','E-WEEKS','E-NOVICES','E-CONTROLS','E-WEEKS','E-UNDERPERF','E-LOCALBRANCH'];
const profiles = scenarios.scenarios.map((s,i) => {
  const athlete = athletes.find(a=>a.athlete_id===s.athlete_id);
  const plan = scenarios.plans.find(p=>p.plan_id===s.initial_plan_ref.plan_id);
  const facts = {event:s.execution_event,observation:s.new_observation,branch:s.preaccepted_branch??null,history:s.learned_pattern??null,planContext:s.initial_plan_context??null};
  const reviews = ['SSCTR-ACF-'+programRecord[i],'SSCTR-ACF-ABC',...s.evidence.policy_ids.map(id=>'SSCTR-ACF-P'+id.slice(4)).filter(id=>records.some(r=>r.review_id===id&&r.disposition==='APPROVE_WITH_CONDITIONS'))];
  // Recipe approval is necessary for every positive/no-op dependent dose. Controls do not approve doses.
  const recipeIds = [...new Set(plan.sessions.map(t=>t.recipe_ref))];
  const recipeRecords = records.filter(d=>d.target.rule_ids.some(id=>recipeIds.includes(id)));
  const p = {id:s.scenario_id,program:programs[i],athleteHash:hash(athlete),planHash:hash(plan),factsHash:hash(facts),policyIds:s.evidence.policy_ids,reviewIds:[...new Set([...reviews,...recipeRecords.filter(d=>d.disposition==='APPROVE_WITH_CONDITIONS').map(d=>d.review_id)])],facts,planId:plan.plan_id,athleteId:athlete.athlete_id};
  // These are approved candidate resources, not inferred prescriptions. Expected dispositions stay out of the bundle.
  if(['runProgress','strengthProgress','strengthRegression','learnedMove'].includes(p.program)) p.candidateResource={scope:s.resulting_decision.scope,changeSet:s.resulting_decision.change_set,candidate:s.resulting_decision.candidate??null,candidateRef:s.resulting_decision.candidate_ref??null};
  if(['runProgress','strengthProgress','strengthRegression','learnedMove'].includes(p.program)){
    const candidatePlan=structuredClone(plan);
    if(p.program==='runProgress'){
      for(const delta of scenarios.blocks[0].weeks[2].deltas){
        const session=candidatePlan.sessions.find(s=>s.session_id===delta.session_id);
        if(delta.path==='prescription.steps[1].duration_minutes'){assert.equal(session.prescription.steps[1].duration_minutes,delta.from);session.prescription.steps[1].duration_minutes=delta.to;}
        else if(delta.path==='prescription.total_duration_minutes'){assert.equal(session.prescription.total_duration_minutes,delta.from);session.prescription.total_duration_minutes=delta.to;}
        else throw new Error('Unbound candidate path');
      }
      // Work duration is the exact work-step duration, a structural derived field rather than a dose rule.
      const session=candidatePlan.sessions.find(s=>s.session_id==='RF-MON-R');session.prescription.work_duration_minutes=session.prescription.steps[1].duration_minutes;
    }
    if(['strengthProgress','strengthRegression'].includes(p.program)){
      const session=candidatePlan.sessions.find(s=>s.recipe_ref==='STR-LOWER-STRENGTH'),target=s.resulting_decision.candidate;
      const exercise=session.prescription.exercises.find(e=>e.exercise===target.exercise);
      assert.equal(exercise.load.value,60);assert.equal(exercise.sets,target.sets);assert.equal(exercise.reps,target.reps);assert.equal(exercise.rest_seconds,target.rest_seconds);exercise.load.value=target.load_kg;
    }
    p.candidateResource.resolvedPlan={candidateId:p.id+'-NEXT',basePlanId:plan.plan_id,basePlanRevision:plan.plan_revision,basePlanHash:hash(plan),athleteId:athlete.athlete_id,scope:'NEXT_HORIZON',sessions:candidatePlan.sessions,adoption:'PROPOSE_ONLY_REQUIRES_CURRENT_CONFIRMATION',applicabilityContext:s.initial_plan_context??null};
    if(p.program==='learnedMove'){
      const target=plan.sessions.find(s=>s.recipe_ref==='STR-LOWER-STRENGTH');
      const comparison=structuredClone(plan.sessions);comparison.find(s=>s.session_id===target.session_id).day='WED';
      p.candidateResource.operationKind='RANK_PRE_REVIEWED_NEXT_HORIZON_ALTERNATIVES';
      p.candidateResource.comparisonBase={kind:'PROSPECTIVE_AVAILABILITY_ALTERNATIVE',status:'SOURCE_DESCRIBED_PLACEMENT_COMPARISON_NOT_VALIDATED_AS_COMPLETE_WEEK',context:s.initial_plan_context,sessions:comparison};
      p.candidateResource.changeSet=[{session_id:target.session_id,scope:'PROSPECTIVE_COMPARISON_ONLY',from:'WED18:00 candidate',to:'MON18:00 admissible candidate',dose:'UNCHANGED'}];
      p.candidateResource.resolvedPlan.kind='SELECTED_NEXT_HORIZON_ALTERNATIVE_NOT_OFFICIAL_PATCH';
    }
    p.candidateResource.candidateHash=hash(p.candidateResource.resolvedPlan);
  }
  if(p.program==='familiarNovice') p.candidateResource={scope:'INITIAL',plans:s.candidate_weeks.filter(p=>p.athlete_id===athlete.athlete_id)};
  if(p.program==='cruiseBranch') p.branchResult={branchId:s.preaccepted_branch.branch_id,actualSuffix:s.resulting_decision.actual_suffix,actualTotalMinutes:32,actualWorkMinutes:12,completedMinutes:24};
  if(p.program==='calfBranch') p.branchResult={branchId:s.preaccepted_branch.branch_id,actualWorkSets:7,plannedWorkSets:9};
  return p;
});
// One assessment cannot authorize a different athlete's novice prescription.
const noviceSource=scenarios.scenarios.find(s=>s.scenario_id==='E2E-20');
const noviceSN=structuredClone(profiles.find(p=>p.id==='E2E-20'));
noviceSN.id='E2E-20-SN';noviceSN.athleteId='ATH-SN';noviceSN.planId='WEEK-SN';
noviceSN.athleteHash=hash(athletes.find(a=>a.athlete_id==='ATH-SN'));noviceSN.planHash=hash(scenarios.plans.find(p=>p.plan_id==='WEEK-SN'));
noviceSN.candidateResource={scope:'INITIAL',plans:noviceSource.candidate_weeks.filter(p=>p.athlete_id==='ATH-SN')};
profiles.push(noviceSN);
for(const p of profiles.filter(p=>p.program==='familiarNovice')){
  const ids=p.candidateResource.plans.flatMap(p=>p.sessions.map(s=>s.recipe_ref));
  p.reviewIds=[...new Set([...p.reviewIds,...records.filter(d=>d.disposition==='APPROVE_WITH_CONDITIONS'&&d.target.rule_ids.some(id=>ids.includes(id))).map(d=>d.review_id)])];
}

const bindings = policies.map(p=>{
  const d=records.find(d=>d.target.rule_ids.includes(p.policy_id));
  return {policyId:p.policy_id,version:registry.foundation_revision,policyHash:hash(p),requiredInputs:p.required_inputs,eligibility:p.eligible_population,evidenceStatus:d.evidence_status,reviewId:d.review_id,reviewDisposition:d.disposition,reviewHash:hash(d),conditions:d.decision.conditions,candidateActions:p.candidate_actions,preserve:p.preserve,tradeOffs:p.trade_offs,mecRelevance:p.mec_ladder_relevance,forbiddenShortcuts:p.forbidden_shortcuts,fallback:p.fallback,reReviewTrigger:p.re_review_trigger,executablePrograms:profiles.filter(x=>x.policyIds.includes(p.policy_id)).map(x=>x.program),scope:'ONLY_EXACT_PROFILE_ACTION; control approval never supplies missing dose'};
});
const sdcProfiles=[];
for(const parent of ['S13','S14','S29'])for(const v of read(sdc+'GOLDEN_DOMAIN_FIXTURES/'+parent+'-supplemental.json').variants){
  const record=sdcRegistry.scientific_decisions.find(d=>d.target.rule_ids.includes(v.variant_id));
  assert.ok(record);assert.equal(bytesHash(record.target.artifact),record.target.sha256);
  sdcProfiles.push({id:v.variant_id,program:parent==='S29'?'executingRemainder':'criticality',facts:v.facts,factsHash:hash(v.facts),record,recordHash:hash(record)});
}
const selected = ['AGENTS.md','CLAUDE.md','CURRENT_MISSION.md','MISSION_LEDGER.md','canon/CANONICAL_INDEX.md','product/ADAPTIVE_ENGINE_CONTRACT.md','product/ADAPTIVE_ENGINE_OPERATIONAL_SPEC.md','product/RUN_INTELLIGENCE_SPEC.md','product/STRENGTH_INTELLIGENCE_SPEC.md','product/SPORT_INTELLIGENCE_SPEC.md','product/PRODUCT_DOMAIN_MODEL.md',...['END_TO_END_COACHING_SCENARIOS.json','SYNTHETIC_ATHLETE_FIXTURES.json','TRAINING_POLICY_LIBRARY.json','RUN_SESSION_RECIPES.json','STRENGTH_SESSION_RECIPES.json','SCIENTIFIC_DECISION_REGISTRY.json','reviews/INDEPENDENT_SCIENTIFIC_DECISIONS.json','COACHING_CONTRACTS.json','AUTONOMY_BOUNDARY_CONTRACT.md','ATHLETE_RESPONSE_MODEL.md','RECOVERY_READINESS_MODEL.md','OPEN_GAPS.json','GATE_DISPOSITION.json'].map(x=>acf+x),sdc+'DECISION_REGISTRY.json',sdc+'semantics/G03_REVIEW.json',sdc+'semantics/G04_NONCLINICAL_REVIEW.json'];
const sourceManifest=Object.fromEntries(selected.map(p=>[p,bytesHash(p)]));
for(const p of [sdc+'scientific/G02_POLICY_REGISTRY.json',sdc+'scientific/CASE_REVIEWS_S01_S29.json',...['S13','S14','S29'].map(n=>sdc+'GOLDEN_DOMAIN_FIXTURES/'+n+'-supplemental.json')])sourceManifest[p]=bytesHash(p);
const bundle={version:'BSR-0.1.0',registryVersion:registry.revision,registryHash:hash(registry),profiles,bindings,records,sdcProfiles,sdcCatalog,plans:scenarios.plans,athletes,block:scenarios.blocks[0],sourceManifest};
bundle.bundleHash=hash(bundle);
write('POLICY_REGISTRY_RUNTIME_BINDINGS.json',{version:bundle.version,registryVersion:bundle.registryVersion,registryHash:bundle.registryHash,bindings,profiles:profiles.map(({facts,candidateResource,branchResult,...p})=>p),sdcBindings:sdcProfiles.map(({facts,...p})=>p)});
write('fixtures/authority-bundle.json',bundle);
write('fixtures/e2e-inputs.json',profiles.map(p=>({fixtureId:p.id,athleteState:athletes.find(a=>a.athlete_id===p.athleteId),officialPlanState:scenarios.plans.find(x=>x.plan_id===p.planId),facts:p.facts})));
write('fixtures/e2e-oracles.json',scenarios.scenarios.map(s=>({id:s.scenario_id,source:acf+'END_TO_END_COACHING_SCENARIOS.json#'+s.scenario_id,expected:s.resulting_decision,autonomy:s.autonomy.level,mec:s.mec.conceptual_degree,preserve:s.preserve,modify:s.modify,nextCheck:s.next_check})));
console.log(JSON.stringify({profiles:profiles.length,bindings:bindings.length,records:records.length,bundleHash:bundle.bundleHash}));
