import test from 'node:test';
import assert from 'node:assert/strict';
import oracles from '../fixtures/e2e-oracles.json' with {type:'json'};
import {evaluateShadow} from '../src/runtime.mjs';
import {scenarioInput,goldenInput} from '../src/fixtures.mjs';

const level={A:'AUTO_EXECUTE_ALLOWED',B:'SUGGEST_AND_CONFIRM',C:'ASK_BEFORE_DECISION',D:'ABSTAIN_OR_HOLD',E:'CLINICAL_HUMAN_REQUIRED'};
const expectedType={REPLAN:'MODIFY',MOVE:'MODIFY',RECONCILE:'ASK'};
for(const oracle of oracles)test(oracle.id+' — independent source conformance',()=>{
  const input=scenarioInput(oracle.id),before=structuredClone(input),result=evaluateShadow(input),d=result.shadowDecision;
  const source=oracle.expected;
  assert.equal(d.decisionType,oracle.autonomy==='D'?'HOLD':expectedType[source.action_class]??source.action_class);
  assert.equal(d.autonomyLevel,level[oracle.autonomy]);
  assert.deepEqual(input,before);assert.deepEqual(result.appliedState,input.officialPlanState);assert.deepEqual(result.officialPlanState,input.officialPlanState);
  assert.deepEqual(result.observedExecutionState,input.observedExecutionState);
  assert.equal(d.applied,false);assert.equal(d.effect,'SHADOW_ONLY');
  assert.ok(d.preserve.some(p=>p.scope==='COMPLETED_AND_OBSERVED_HISTORY'));
  assert.ok(d.preserve.some(p=>p.scope==='OFFICIAL_PLAN'&&p.id===input.officialPlanState.plan_id));
  if(d.decisionType==='MODIFY') {
    assert.equal(d.mec.changeLevel,oracle.mec);
    assert.ok(d.candidate&&d.modify.length>0);
    if(source.change_set.length&&oracle.id!=='E2E-16')assert.deepEqual(d.modify,source.change_set);
    if(oracle.id==='E2E-16'){assert.equal(d.candidate.operationKind,'RANK_PRE_REVIEWED_NEXT_HORIZON_ALTERNATIVES');assert.equal(d.modify[0].scope,'PROSPECTIVE_COMPARISON_ONLY');assert.ok(input.officialPlanState.sessions.some(s=>s.session_id===d.modify[0].session_id));assert.notDeepEqual(d.candidate.comparisonBase.sessions,d.candidate.resolvedPlan.sessions);}
  } else {assert.equal(d.modify.length,0);assert.equal(d.mec.changeLevel,0);}
  if(oracle.autonomy==='C')assert.ok(d.missingInputs.length>0);
  if(oracle.autonomy==='D')assert.ok(d.unsupportedDependency);
  assert.ok(d.policyRefs.length);assert.ok(d.evidenceRefs.length);
  assert.ok(d.traceId&&d.id&&d.inputHash&&d.timestamp&&d.nextCheck.trigger&&d.nextCheck.exit);
  assert.ok(d.mustNot.includes('MUTATE_OFFICIAL_PLAN')&&d.mustNot.includes('REWRITE_COMPLETED_WORK'));
  assert.ok(d.candidateActionsConsidered.length>0);
  assert.deepEqual(evaluateShadow(input),result,'identical input must be deterministic');
});

for(const [id,type,degree]of [['S13-N','KEEP',0],['S13-T','MODIFY',3],['S14-N','KEEP',0],['S14-T','MODIFY',2],['S29-R2','MODIFY',2],['S29-N','KEEP',0],['S29-C','CLINICAL_HUMAN_REQUIRED',0]])test(id+' — exact independently approved Golden successor',()=>{
  const i=goldenInput(id),before=structuredClone(i),r=evaluateShadow(i),d=r.shadowDecision;
  assert.equal(d.decisionType,type);assert.equal(d.mec.changeLevel,degree);assert.deepEqual(i,before);assert.deepEqual(r.appliedState,before.officialPlanState);
  if(type==='MODIFY'){assert.equal(d.autonomyLevel,'SUGGEST_AND_CONFIRM');assert.ok(d.modify.length);assert.ok(d.evidenceRefs.some(e=>e.reviewId==='SDC-'+id+'-J1'));}
  if(id==='S29-R2'){assert.deepEqual(d.completedPrefix,i.event.facts.execution.completed_prefix);assert.deepEqual(d.modify[0].omit,['sq-3']);}
  if(id==='S14-T')assert.equal(d.modify[0].candidate.dose.total_min,29);
});
