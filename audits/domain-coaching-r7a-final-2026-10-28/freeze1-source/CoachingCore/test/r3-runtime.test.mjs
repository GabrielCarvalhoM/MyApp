import test from 'node:test';
import assert from 'node:assert/strict';
import corpus from '../r2/evaluation/REPRESENTATIVE_CORPUS_R2.json' with {type:'json'};
import {normalizeRepresentative,validateCanonical,fact} from '../src/r3-input.mjs';
import {evaluateCanonicalShadow,CanonicalShadowJournal} from '../src/r3-runtime.mjs';
import {hash,clone} from '../src/value.mjs';
const fixture=n=>clone(corpus.cases[n-1]);
function input(n,change){const c=fixture(n);if(change){change(c.scenarioFacts);c.caseId='ADVERSARIAL';c.scenarioFactsSha256=hash(c.scenarioFacts);}return normalizeRepresentative(c);}
const run=(n,change,options)=>evaluateCanonicalShadow(input(n,change),options).shadowDecision;

test('existing familiar20 witness preserves a concrete R2 review and dose without wearable or case identity',()=>{
 const a=input(31),b=clone(a);b.source.caseId='UNRELATED_ID';
 for(const i of [a,b]){assert.equal(validateCanonical(i).valid,true);const d=evaluateCanonicalShadow(i).shadowDecision;assert.equal(d.decisionType,'MODIFY');assert.equal(d.policyRefs[0].id,'R2-P14');assert.equal(d.candidate.recipe.prescription.durationMinutes,20);assert.equal(d.candidate.recipe.prescription.target.method,'TALK_RPE');assert.equal(d.candidate.recipe.prescription.target.noPhysiologicalZoneClaim,true);}
});
test('current interruption and adverse observations cannot reuse familiar calibration',()=>{
 for(const n of [31,33,39]){
  assert.notEqual(run(n,f=>f.interruption={reason:'TRAVEL',nonclinical:true,durationDays:8}).decisionType,'MODIFY');
  assert.notEqual(run(n,f=>f.observations={response:'INCOMPATIBLE',currentFunction:'limited training tolerance'}).decisionType,'MODIFY');
 }
});
test('explicit clinical observations override nonclinical historical eligibility',()=>{
 assert.equal(run(31,f=>f.observations={clinicalConcern:true,persistentPain:true}).decisionType,'CLINICAL_HUMAN_REQUIRED');
});
test('stale and duplicated evidence are retained and never positive tolerance evidence',()=>{
 for(const extension of [{observations:[{eventId:'x'},{eventId:'x'}]},{stale:true}])assert.notEqual(run(31,f=>Object.assign(f.priorHistory,extension)).decisionType,'MODIFY');
});
test('out-of-scope modality experience never promotes a familiar20 task',()=>{
 assert.notEqual(run(31,f=>f.population.runExperience='ELITE').decisionType,'MODIFY');
 assert.notEqual(run(31,f=>f.population.ageYears=15).decisionType,'MODIFY');
});
test('source hash mismatch is a software/contract block, never useful ASK or positive',()=>{
 const c=fixture(31);c.scenarioFacts.currentDemand.requestedMinutes=25;
 const i=normalizeRepresentative(c);assert.equal(i.adapter.blocked,true);
 const d=evaluateCanonicalShadow(i).shadowDecision;assert.equal(d.coverage,'NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP');assert.equal(d.semanticConsumption.consumed,false);
});
test('extra unreviewed current-context facts cannot be silently discarded by positive selectors',()=>{
 assert.notEqual(run(31,f=>f.observations={newSignal:'unreviewed'}).decisionType,'MODIFY');
 assert.notEqual(run(31,f=>f.newContext={unreviewed:true}).decisionType,'MODIFY');
 assert.notEqual(run(31,f=>f.calibration.newUnreviewedTarget=100).decisionType,'MODIFY');
});
test('missing calibration fact yields no invented replacement, source schema error is separate',()=>{
 assert.notEqual(run(31,f=>delete f.priorHistory.response).decisionType,'MODIFY');
 const i=input(31);delete i.structuredContexts;
 const d=evaluateCanonicalShadow(i).shadowDecision;assert.equal(d.coverage,'NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP');
});
test('all42 trace actual material reads, preserve source plan and partial completed work, and are deterministic',()=>{
 const journal=new CanonicalShadowJournal();
 for(const c of corpus.cases){const i=normalizeRepresentative(c),h=hash(i),r=journal.record(i).result,d=r.shadowDecision;assert.equal(hash(i),h);assert.equal(d.applied,false);assert.equal(d.effect,'SHADOW_ONLY');assert.deepEqual(r.appliedState,r.officialPlanState);assert.deepEqual(evaluateCanonicalShadow(i),r);assert.equal(journal.record(i).duplicate,true);assert.ok(d.trace.reads.some(p=>p.path==='/currentDemand/kind'));if(d.coverage==='USEFUL_ASK')assert.ok(d.missingInputs.length);}
 const r=evaluateCanonicalShadow(input(10));assert.deepEqual(r.observedExecutionState.actualWorkMinutes,[5,3]);assert.deepEqual(fact(input(10),'/completedPrefix/actualWorkMinutes'),[5,3]);
 assert.equal(journal.size,42);
});
test('return, race-week and noisy learning never invent capacity, prescriptions or causality',()=>{
 for(const n of [19,20,21,22,23,25,26,27,28,29,35,36,40,41,42])assert.notEqual(run(n).decisionType,'MODIFY');
 assert.equal(run(24).decisionType,'CLINICAL_HUMAN_REQUIRED');assert.equal(run(30).decisionType,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(run(42).decisionType,'HOLD');
});
test('planning does not replace an unknown or mismatched hybrid week with a familiar run subtask',()=>{
 for(const n of [1,2,3,6,7])assert.equal(run(n).coverage,'NOT_SUPPORTED_DOMAIN_GAP');
 assert.equal(run(4).coverage,'USEFUL_ASK');assert.equal(run(8).coverage,'USEFUL_ASK');
});
test('exact optional omission and bounded adequate week retain actual work without catch-up',()=>{
 assert.equal(run(13).decisionType,'KEEP');assert.equal(run(14).decisionType,'KEEP');
 assert.notEqual(run(14,f=>f.observations.notMissingUpload=false).decisionType,'KEEP');
 assert.notEqual(run(13,f=>f.observations.lastEasyRun.actualMinutes=80).decisionType,'KEEP');
});
test('pre-expansion option disables new recipes without suppressing R2 reuse',()=>{
 assert.equal(run(31,undefined,{enableExpansion:false}).decisionType,'MODIFY');
 for(const n of [33,39])assert.notEqual(run(n,undefined,{enableExpansion:false}).decisionType,'MODIFY');
});
test('stride block cannot count as a full prescribed session without preparation context',()=>{
 const d=run(39);assert.notEqual(d.decisionType,'MODIFY');assert.equal(d.coverage,'USEFUL_ASK');assert.ok(d.missingInputs.includes('/currentDemand/sessionEnvelope'));
});
test('kind-only routing cannot claim semantic consumption or supplied dose details',()=>{
 for(const n of [1,9,10,11,15,23,25,28,35,41,42]){
  const d=run(n,f=>{for(const key of Object.keys(f))if(!['population','eligibility','currentDemand'].includes(key))delete f[key];f.currentDemand={kind:f.currentDemand.kind};});
  assert.equal(d.semanticConsumption.consumed,false);assert.equal(d.decisionType,'ASK');assert.ok(d.missingInputs.length);assert.ok(!d.rationale.includes('5min'));
 }
 const typed=run(9,f=>f.currentDemand.session.essential='not an exercise array');assert.equal(typed.semanticConsumption.consumed,false);
 assert.equal(typed.coverage,'NOT_SUPPORTED_SOFTWARE_CONTRACT_GAP');
});
test('supplied missing facts change ASK into an actual remaining binding assessment',()=>{
 const updated=[
  run(29,f=>f.observations={postEventSymptoms:false,currentFunction:'normal',subjectiveRecovery:'usual'}),
  run(32,f=>{f.calibration.recoveryDistinctConstruct='supplied distinct intent';f.observations.needForSeparateRecoveryIntent='explicit athlete intent';}),
  run(34,f=>Object.assign(f.priorHistory.sameFamily,{warmupMinutes:10,cooldownMinutes:10}))
 ];
 for(const d of updated){assert.equal(d.coverage,'NOT_SUPPORTED_DOMAIN_GAP');assert.equal(d.missingInputs.length,0);}
});
test('clinical narrative observations and task/context substitutions fail closed',()=>{
 for(const n of [23,25])assert.equal(run(n,f=>f.observations={pain:'persistent with ordinary jogging'}).decisionType,'CLINICAL_HUMAN_REQUIRED');
 assert.notEqual(run(31,f=>f.environment.terrain='unfamiliar steep rocky hill').decisionType,'MODIFY');
 assert.notEqual(run(33,f=>f.priorHistory.currentCapacity='unknown after interruption').decisionType,'MODIFY');
 assert.notEqual(run(13,f=>f.observations.systemic='incompatible').decisionType,'KEEP');
 assert.notEqual(run(14,f=>f.observations.recovery='incompatible').decisionType,'KEEP');
});
test('empty material containers never count as consumed and actual partial dose is reported truthfully',()=>{
 for(const [n,mutate] of [[1,f=>{f.onboarding={};f.reportedExposure={};}],[9,f=>{f.currentDemand.session.essential=[];f.currentDemand.session.optional=[];}],[10,f=>f.completedPrefix={}],[11,f=>{f.currentDemand.base={};f.currentDemand.candidate={};f.observations={};}],[25,f=>{f.event={};f.priorHistory={};f.currentDemand.availability=[];}],[35,f=>{f.priorHistory={};f.calibration={};}],[41,f=>{f.currentDemand.options=[];f.priorHistory.observations=[];}],[42,f=>f.priorHistory.observations=[]]])assert.equal(run(n,mutate).semanticConsumption.consumed,false);
 const d=run(10,f=>f.completedPrefix.actualWorkMinutes=[4,2]);assert.equal(d.semanticConsumption.consumed,true);assert.ok(d.rationale.includes('[4,2]'));assert.ok(!d.rationale.includes('5min'));
});
test('generic missing-input resolution applies to substitution, hills, strides and event history',()=>{
 const ds=[run(18,f=>{f.currentDemand.requested.loadKgPerHand=12;f.history.requestedMovementFamiliar=true;f.history.completeAlternativeRecipe=true;}),run(38,f=>{Object.assign(f.calibration,{grade:4,duration:30,downhillExposure:'familiar'});f.environment.surface='dry firm';}),run(39,f=>{f.priorHistory.sameFamily.preparation='supplied familiar preparation';f.currentDemand.sessionEnvelope={warmup:'supplied'};}),run(28,f=>{f.priorHistory.run={longestRecentRun:90};f.calibration.halfMarathonPace=360;})];
 for(const d of ds){assert.notEqual(d.coverage,'USEFUL_ASK');assert.notEqual(d.decisionType,'MODIFY');}
});
test('positive and unknown/negative clinical narrative states remain distinct',()=>{
 assert.equal(run(23,f=>f.observations.persistentPain='present').decisionType,'CLINICAL_HUMAN_REQUIRED');
 for(const value of ['none','unknown','no persistent pain'])assert.notEqual(run(23,f=>f.observations.persistentPain=value).decisionType,'CLINICAL_HUMAN_REQUIRED');
});
