import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateShadow,ShadowJournal,arbitrate } from '../src/runtime.mjs';
import { scenarioInput,dayInput,fixturePlans } from '../src/fixtures.mjs';

test('reviewed adequate Run-first week returns KEEP without mutating official plan',()=>{
  const input=scenarioInput('E2E-01'),before=structuredClone(input);
  const result=evaluateShadow(input);
  assert.equal(result.shadowDecision.decisionType,'KEEP');
  assert.deepEqual(input,before);
  assert.deepEqual(result.appliedState,before.officialPlanState);
});

const d=i=>evaluateShadow(i).shadowDecision;
for(const [name,mutate,type]of [
  ['unknown eligibility',i=>delete i.recoveryContext.eligibilityStatus,'ASK'],
  ['clinical concern',i=>i.recoveryContext.clinicalConcern=true,'CLINICAL_HUMAN_REQUIRED'],
  ['missing metadata',i=>delete i.provenance.sourceRevision,'ASK'],
  ['source conflict',i=>i.event.source_conflict=true,'ASK'],
  ['missing upload is not missed session',i=>{i.event={event_id:'missing',type:'SYNC_ABSENT'};i.observedExecutionState.events=[i.event]},'NOT_SUPPORTED_YET'],
  ['revoked exact approval',i=>i.policyContext.revokedReviewIds=['SSCTR-ACF-E-RUNPROG'],'HOLD'],
  ['stale registry',i=>i.policyContext.registryHash='stale','HOLD'],
  ['unknown policy',i=>i.policyContext.requestedPolicyIds=['POL-UNKNOWN'],'NOT_SUPPORTED_YET'],
  ['unbound known policy',i=>i.policyContext.requestedPolicyIds=['POL-13'],'NOT_SUPPORTED_YET'],
  ['changed athlete competence',i=>i.athleteState.history.strength_configurations=[],'NOT_SUPPORTED_YET'],
  ['changed calibration',i=>i.officialPlanState.sessions[0].calibration=null,'NOT_SUPPORTED_YET'],
  ['changed exact dose',i=>i.event.exposures[0].duration_minutes=31,'NOT_SUPPORTED_YET'],
  ['current scoped hold',i=>i.policyContext.holds=['CURRENT_RESTRICTION'],'HOLD'],
  ['unknown recovery context',i=>delete i.recoveryContext.contextChanged,'ASK'],
  ['extra conflicting history',i=>i.observedExecutionState.inferred.push({claim:'Recovered'}),'HOLD'],
  ['first-ever establishment',i=>i.officialPlanState=null,'NOT_SUPPORTED_YET'],
  ['real use prohibited',i=>i.synthetic=false,'ABSTAIN']
])test(name+' fails closed without plan effects',()=>{
  const i=scenarioInput('E2E-05');mutate(i);const before=structuredClone(i),r=evaluateShadow(i);
  assert.equal(r.shadowDecision.decisionType,type);assert.equal(r.shadowDecision.modify.length,0);assert.deepEqual(i,before);assert.deepEqual(r.appliedState,i.officialPlanState);
});
test('broad envelope does not authorize a new calculated within-envelope change',()=>{const i=scenarioInput('E2E-15');i.preacceptedBranch={range:[20,40],accepted:true};assert.equal(d(i).decisionType,'NOT_SUPPORTED_YET');});
test('branch actual24+8=32 is not the original40; completed prefix retained',()=>{const i=scenarioInput('E2E-15'),r=evaluateShadow(i);assert.equal(r.shadowDecision.executionInterpretation.actualTotalMinutes,32);assert.equal(r.shadowDecision.executionInterpretation.completedMinutes,24);assert.deepEqual(r.shadowDecision.sourceFacts.event.completed_prefix,i.event.completed_prefix);assert.deepEqual(r.appliedState,i.officialPlanState);});
test('calf branch actual7 is not planned9; no replacement or debt',()=>{const r=evaluateShadow(scenarioInput('E2E-24'));assert.equal(r.shadowDecision.executionInterpretation.actualWorkSets,7);assert.equal(r.shadowDecision.executionInterpretation.plannedWorkSets,9);assert.equal(r.shadowDecision.modify.length,0);});
test('learned history uses distinct supplied observational episodes and no causal claim',()=>{const i=scenarioInput('E2E-16'),v=d(i);assert.equal(v.inferredResponse.causal,false);assert.equal(new Set(v.inferredResponse.observationRefs).size,5);i.athleteResponseHistory.observations.pop();assert.equal(d(i).decisionType,'NOT_SUPPORTED_YET');});
test('longitudinal purpose denial suspends use of learned response',()=>{const i=scenarioInput('E2E-16');i.policyContext.longitudinalPurposeAllowed=false;assert.equal(d(i).decisionType,'HOLD');});
test('same logical evaluation replay records once and never applies',()=>{const j=new ShadowJournal(),i=scenarioInput('E2E-06');assert.equal(j.record(i).duplicate,false);assert.equal(j.record(i).duplicate,true);assert.equal(j.size,1);assert.deepEqual(j.entries()[0].appliedState,i.officialPlanState);assert.equal(j.entries()[0].shadowDecision.applied,false);});
test('returned snapshots cannot mutate official input or other evaluations',()=>{const i=scenarioInput('E2E-06'),r=evaluateShadow(i);assert.throws(()=>{r.appliedState.sessions[0].day='SUN'},TypeError);assert.deepEqual(r.appliedState,i.officialPlanState);});
test('priority cannot create necessity; copriority trade-off remains ASK when needed',()=>{const candidates=[{id:'run',admissible:true,preservesGoals:['RUN']},{id:'strength',admissible:true,preservesGoals:['STRENGTH']}];for(const priority of ['RUN_FIRST','STRENGTH_FIRST','BALANCED_HYBRID'])assert.equal(arbitrate({adequacy:'ADEQUATE',necessity:'NOT_REQUIRED',priority,candidates}).action,'KEEP');assert.equal(arbitrate({adequacy:'INADEQUATE',necessity:'UNDETERMINATE',priority:'RUN_FIRST',candidates}).action,'HOLD');assert.equal(arbitrate({adequacy:'INADEQUATE',necessity:'REQUIRED',priority:'BALANCED_HYBRID',candidates}).action,'ASK');assert.equal(arbitrate({adequacy:'INADEQUATE',necessity:'REQUIRED',priority:'RUN_FIRST',candidates}).candidateId,'run');assert.equal(arbitrate({adequacy:'INADEQUATE',necessity:'REQUIRED',priority:'STRENGTH_FIRST',candidates}).candidateId,'strength');});
test('daily actual is validated independently; planned work never becomes completed by absence',()=>{const plan=fixturePlans()[0],i=dayInput(plan.plan_id,'MON',[]);assert.equal(d(i).decisionType,'ASK');const actual=plan.sessions.filter(s=>s.day==='MON').map(s=>({sessionId:s.session_id,athleteId:s.athlete_id,observedAt:'2026-10-24T00:00:00-03:00',executedRevision:s.session_revision,actualPrescription:s.prescription,status:'COMPLETED_AS_CHOSEN',factId:'ACT-'+s.session_id,sourceRevision:'r1',sourceRef:'SYNTHETIC_DECLARED',coverage:'COMPLETE'}));assert.equal(d(dayInput(plan.plan_id,'MON',actual)).decisionType,'KEEP');actual[0].actualPrescription={};assert.equal(d(dayInput(plan.plan_id,'MON',actual)).decisionType,'HOLD');});
test('malformed input remains a nonprescribing decision',()=>{for(const i of [null,undefined,[],{}])assert.equal(d(i).decisionType,'ABSTAIN');});
