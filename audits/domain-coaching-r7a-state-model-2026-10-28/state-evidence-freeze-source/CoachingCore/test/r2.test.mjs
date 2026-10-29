import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateShadow,ShadowJournal} from '../src/index.mjs';
import {r2Input,r2Requests} from '../src/r2-fixtures.mjs';
import Ajv2020 from 'ajv/dist/2020.js';
import decisionSchema from '../SHADOW_DECISION_SCHEMA.json' with {type:'json'};
const validDecision=new Ajv2020({strict:false,allErrors:true}).compile(decisionSchema);
const positive=r2Requests().filter(r=>!r.startsWith('TAPER'));
const decision=i=>evaluateShadow(i).shadowDecision;
for(const request of positive)test('R2 bounded positive consumer '+request,()=>{
 const i=r2Input(request),before=structuredClone(i),r=evaluateShadow(i),d=r.shadowDecision;
 assert.equal(d.decisionType,'MODIFY',JSON.stringify({reason:d.rationale,missing:d.missingInputs}));
 assert.ok(d.candidate);assert.ok(d.evidenceRefs.length);assert.ok(d.policyRefs.length);assert.ok(d.modify.length);
 assert.deepEqual(i,before);assert.deepEqual(r.appliedState,r.officialPlanState);assert.equal(d.applied,false);
 const j=new ShadowJournal();assert.equal(j.record(i).duplicate,false);assert.equal(j.record(i).duplicate,true);assert.equal(j.size,1);assert.deepEqual(evaluateShadow(i),r);
 assert.ok(validDecision(d),JSON.stringify(validDecision.errors));
});
for(const request of r2Requests()){
 test('R2 '+request+' unknown eligibility, clinical and missing-input guards',()=>{
  let i=r2Input(request);i.recoveryContext.eligibilityStatus='ELIGIBILITY_UNASSESSED';assert.equal(decision(i).decisionType,'ASK');
  i.recoveryContext.persistentPain=true;delete i.event;assert.equal(decision(i).decisionType,'CLINICAL_HUMAN_REQUIRED');
  i=r2Input(request);delete i.observation;assert.equal(decision(i).decisionType,'ASK');
  i=r2Input(request);i.observation.coverage='PARTIAL';assert.equal(decision(i).decisionType,'ASK');
  i=r2Input(request);i.synthetic=false;assert.equal(decision(i).decisionType,'ABSTAIN');
 });
 test('R2 '+request+' unsupported, boundary, stale/revoked and metadata guards',()=>{
  let i=r2Input(request);i.athleteState.adult=false;assert.notEqual(decision(i).decisionType,'MODIFY');
  i=r2Input(request);i.event.facts.extraUnreviewedSignal=1;assert.equal(decision(i).decisionType,'ASK');
  i=r2Input(request);i.policyContext.registryHash='stale';assert.equal(decision(i).decisionType,'HOLD');
  i=r2Input(request);i.policyContext.holds=['CONTEXT_REVIEW'];assert.equal(decision(i).decisionType,'HOLD');
  i=r2Input(request);i.observedExecutionState.inferred=[{description:'unreviewed recovery inference'}];assert.equal(decision(i).decisionType,'HOLD');
  i=r2Input(request);const d=decision(i);if(d.evidenceRefs.length){i.policyContext.revokedReviewIds=d.evidenceRefs.map(e=>e.reviewId);assert.equal(decision(i).decisionType,'HOLD');}
 });
}
for(const request of ['TAPER_10K','TAPER_HALF','TAPER_BALANCED'])test('R2 '+request+' joint hybrid week remains scientifically unsupported',()=>{
 const i=r2Input(request),r=evaluateShadow(i);assert.equal(r.shadowDecision.decisionType,'HOLD');assert.ok(r.shadowDecision.unsupportedDependency);assert.equal(r.shadowDecision.modify.length,0);assert.deepEqual(r.appliedState,r.officialPlanState);
});
test('R2 first establishment bounds and independent modality competence',()=>{
 let i=r2Input('ESTABLISH_RUN');i.athleteState.ageYears=66;assert.equal(decision(i).decisionType,'NOT_SUPPORTED_YET');
 i.athleteState.ageYears=35;i.event.facts.walkMinutes=29;assert.equal(decision(i).decisionType,'ASK');
 i=r2Input('ESTABLISH_RUN');i.event.facts.availableDays=['TUE','THU','SAT'];assert.deepEqual(decision(i).candidate.sessions.map(s=>s.day),['TUE','THU','SAT']);
 i=r2Input('ESTABLISH_STRENGTH');i.athleteState.runLevel='INTERMEDIATE';i.athleteState.movementCompetence='UNKNOWN';assert.equal(decision(i).decisionType,'ASK');
 i=r2Input('ESTABLISH_STRENGTH');delete i.event.facts.loadsKg.legPress;assert.equal(decision(i).decisionType,'ASK');
});
test('R2 positive and negative deviations keep adequate work, no forced progression',()=>{
 for(const request of ['PROGRESS_STRENGTH','PROGRESS_RUN']){const i=r2Input(request);i.event.facts.nextHorizonNeedConfirmed=false;assert.equal(decision(i).decisionType,'KEEP');}
 for(const request of ['LOCAL_FATIGUE','SYSTEMIC_FATIGUE','UNDER_TARGET_STRENGTH','REDUCE_RUN_REPETITION']){const i=r2Input(request);i.event.facts.materialProblem=false;assert.equal(decision(i).decisionType,'KEEP');}
 const i=r2Input('PROGRESS_STRENGTH');i.event.facts.episodes.forEach(e=>e.actualReps=9);assert.equal(decision(i).decisionType,'KEEP');
});
test('R2 local fatigue chooses the smaller sufficient action and preserves essentials',()=>{
 let i=r2Input('LOCAL_FATIGUE');let d=decision(i);assert.deepEqual(d.candidate.sessions[0].prescription.exercises.map(e=>e.exercise),['back_squat_familiar_configuration']);
 i.event.facts.oneOptionalSetStillInadequate=false;d=decision(i);assert.equal(d.candidate.sessions[0].prescription.exercises[1].sets,1);assert.equal(d.candidate.sessions[0].prescription.exercises[0].sets,3);
 i.event.facts.essentialPerformance='DEGRADED';assert.equal(decision(i).decisionType,'HOLD');
 i=r2Input('LOCAL_FATIGUE');i.officialPlanState.sessions[0].status='COMPLETED';assert.equal(decision(i).decisionType,'HOLD');
});
test('R2 systemic change cannot bypass a sufficient smaller change or invent a branch',()=>{
 let i=r2Input('SYSTEMIC_FATIGUE');i.event.facts.optionalRemovalSufficient=true;assert.equal(decision(i).decisionType,'ASK');
 i=r2Input('SYSTEMIC_FATIGUE');i.event.facts.branchWindowAllowed=false;assert.equal(decision(i).decisionType,'HOLD');
 i=r2Input('SYSTEMIC_FATIGUE');i.event.facts.subjectiveFatigue=false;assert.equal(decision(i).decisionType,'ASK');
});
test('R2 set/repetition reduction requires sufficient essential intent and smaller-alternative review',()=>{
 for(const request of ['UNDER_TARGET_STRENGTH','REDUCE_RUN_REPETITION']){
  let i=r2Input(request);i.event.facts.essentialIntentPreserved=false;assert.equal(decision(i).decisionType,'HOLD');
  i=r2Input(request);i.event.facts.smallerRestChangeSufficient=true;assert.equal(decision(i).decisionType,'ASK');
  i=r2Input(request);i.event.facts.episodes[1].observedAt=i.event.facts.episodes[0].observedAt;assert.equal(decision(i).decisionType,'ASK');
 }
 const i=r2Input('PROGRESS_STRENGTH');i.event.facts.episodes[0].uniformRepsAcrossAllSets=false;assert.equal(decision(i).decisionType,'ASK');
});
test('R2 run reduction preserves established field target and does not equate VO2/LT2',()=>{
 const i=r2Input('REDUCE_RUN_REPETITION'),d=decision(i),p=d.candidate.sessions[0].prescription;
 assert.equal(p.repetitions,4);assert.equal(p.workMinutes,3);assert.equal(p.recoveryBetweenRepetitionsSeconds,120);assert.equal(p.target.paceSecondsPerKm,300);assert.equal(p.target.noVO2OrLT2Equivalence,true);
 i.event.facts.paceSecondsPerKm=250;assert.equal(decision(i).decisionType,'ASK');
});
test('R2 return ignores elapsed days as a dose formula and requires current capacity',()=>{
 const i=r2Input('RETURN_RUN'),p=decision(i).candidate.sessions[0].prescription;
 for(const n of [4,14,28]){i.event.facts.interruptionDays=n;assert.deepEqual(decision(i).candidate.sessions[0].prescription,p);}
 i.event.facts.capacityEstablishedToday=false;assert.equal(decision(i).decisionType,'ASK');
 i.event.facts.reason='INJURY';assert.equal(decision(i).decisionType,'CLINICAL_HUMAN_REQUIRED');
 const s=r2Input('RETURN_STRENGTH');s.event.facts.currentLoadEstablished=false;assert.equal(decision(s).decisionType,'ASK');
});
test('R2 calibration is specific to construct, method, exact recipe tolerance and labels',()=>{
 const definitions=[['EASY','TALK_RPE','EASY_EFFORT','R2-EASY-20',null],['LONG','TALK_RPE','LONG_EASY','R2-EASY-40',null],['THRESHOLD','PACE','FIELD_SESSION_TARGET','R2-CRUISE-3X5',330],['VO2','PACE','FIELD_SESSION_TARGET','R2-RUN-4X3',300],['STRIDES','TALK_RPE','RELAXED_STRIDE','R2-EASY20-STRIDES',null]];
 for(const [family,targetMethod,construct,id,paceSecondsPerKm]of definitions){
  const i=r2Input('CALIBRATE_RUN');Object.assign(i.event.facts,{family,targetMethod,construct,toleratedRecipeId:id,paceSecondsPerKm});i.officialPlanState.sessions[0].recipeId='R2-LABEL-'+family;
  assert.equal(decision(i).candidate.sessions[0].recipeId,id);
  i.event.facts.toleratedRecipeId='UNSUPPORTED';assert.equal(decision(i).decisionType,'ASK');
 }
 const i=r2Input('CALIBRATE_RUN');i.event.facts.construct='CS';assert.equal(decision(i).decisionType,'NOT_SUPPORTED_YET');
 i.event.facts.construct='LT2';assert.equal(decision(i).decisionType,'NOT_SUPPORTED_YET');
 i.event.facts.construct='EASY_EFFORT';i.event.facts.targetMethod='HR';assert.equal(decision(i).decisionType,'NOT_SUPPORTED_YET');
 const same=r2Input('CALIBRATE_RUN');same.officialPlanState.sessions[0].recipeId='R2-EASY-20';assert.equal(decision(same).decisionType,'KEEP');
 const standalone=r2Input('CALIBRATE_RUN');standalone.officialPlanState=null;standalone.event.sessionId=null;assert.equal(decision(standalone).candidate.scope,'SINGLE_UNSCHEDULED_SESSION');
});
test('R2 learned history cannot rank inadmissible options, duplicates, one noisy event or denied purpose',()=>{
 let i=r2Input('RANK_OPTIONS'),d=decision(i);assert.equal(d.candidate.learning.causalClaim,false);assert.equal(d.candidate.learning.populationPriorVisible,true);
 i.event.facts.episodes=i.event.facts.episodes.slice(0,1);assert.equal(decision(i).decisionType,'ASK');
 i=r2Input('RANK_OPTIONS');i.event.facts.episodes[1].observedAt=i.event.facts.episodes[0].observedAt;assert.equal(decision(i).decisionType,'ASK');
 i=r2Input('RANK_OPTIONS');i.event.facts.candidatesAdmissible=false;assert.equal(decision(i).decisionType,'ASK');
 i=r2Input('RANK_OPTIONS');i.policyContext.longitudinalPurposeAllowed=false;assert.equal(decision(i).decisionType,'HOLD');
});
test('R2 regression: proposals preserve unrelated completed work byte-for-byte',()=>{
 for(const request of ['PROGRESS_STRENGTH','LOCAL_FATIGUE','SYSTEMIC_FATIGUE','UNDER_TARGET_STRENGTH','REDUCE_RUN_REPETITION','PROGRESS_RUN','RETURN_RUN','RETURN_STRENGTH','CALIBRATE_RUN','RANK_OPTIONS']){
  const i=r2Input(request),completed={session_id:'history',day:'SUN',recipeId:'R2-EASY-20',status:'COMPLETED',optional:false,parameters:{}};i.officialPlanState.sessions.push(completed);
  const d=decision(i);assert.equal(d.decisionType,'MODIFY');assert.deepEqual(d.candidate.sessions.find(s=>s.session_id==='history'),completed);
 }
});
test('R2 regression: calibration cannot remove concrete hard or strength stimulus',()=>{
 for(const [id,parameters]of [['R2-RUN-5X3',{paceSecondsPerKm:300}],['R2-SQUAT-3X8',{loadKg:60,targetRir:2}]]){const i=r2Input('CALIBRATE_RUN');Object.assign(i.officialPlanState.sessions[0],{recipeId:id,parameters});assert.equal(decision(i).decisionType,'HOLD');}
});
test('R2 regression: irrelevant/invalid recipe parameters cannot be discarded',()=>{
 const i=r2Input('LOCAL_FATIGUE');i.officialPlanState.sessions.push({session_id:'unrelated',day:'SAT',recipeId:'R2-EASY-20',status:'PLANNED',optional:false,parameters:{racePaceSecondsPerKm:1}});assert.equal(decision(i).decisionType,'ASK');
 const s=r2Input('SYSTEMIC_FATIGUE');s.officialPlanState.sessions[0].parameters.paceSecondsPerKm=0;assert.equal(decision(s).decisionType,'ASK');
});
test('R2 regression: contradictory age and impossible calendar dates cannot establish eligibility',()=>{
 for(const request of positive){const i=r2Input(request);i.athleteState.ageYears=16;assert.equal(decision(i).decisionType,'NOT_SUPPORTED_YET');}
 const i=r2Input('LOCAL_FATIGUE');i.observation.observedAt='2026-02-30T12:00:00Z';assert.equal(decision(i).decisionType,'ASK');
 const h=r2Input('PROGRESS_RUN');h.event.facts.episodes[0].observedAt='2026-02-30T12:00:00Z';assert.equal(decision(h).decisionType,'ASK');
});
test('R2 first week to observed response to week-two retention is explicit, never assumed completion',()=>{
 for(const request of ['ESTABLISH_RUN','ESTABLISH_STRENGTH']){
  const i=r2Input(request),first=decision(i),sessions=first.candidate.sessions.map(({session_id,day,recipeId,status,optional,parameters})=>({session_id,day,recipeId,status,optional,parameters}));
  i.officialPlanState={plan_id:'SYNTHETIC-CHOSEN-ESTABLISHMENT',plan_revision:'observed-week1',athlete_id:i.athleteFixtureId,sessions};
  i.evaluatedAt='2026-11-02T12:00:00-03:00';i.observation.observedAt='2026-11-01T12:00:00-03:00';
  assert.equal(decision(i).decisionType,'ASK');
  i.observedExecutionState.completed=sessions.map((s,n)=>({sessionId:s.session_id,athleteId:i.athleteFixtureId,factId:'EST-ACTUAL-'+n,sourceRef:'SYNTHETIC-OBSERVED-WEEK1',sourceRevision:'1',observedAt:'2026-11-01T12:00:00-03:00',recipeId:s.recipeId,parameters:s.parameters,executedRevision:'observed-week1',coverage:'COMPLETE'}));
  assert.equal(decision(i).decisionType,'KEEP');
  const observed=structuredClone(i);observed.event.facts.timeBudgetMinutes=1;assert.equal(decision(observed).decisionType,'ASK');
  observed.event.facts.timeBudgetMinutes=30;observed.event.facts.availableDays=['SUN'];assert.equal(decision(observed).decisionType,'ASK');
  const invalid=structuredClone(i);invalid.officialPlanState.sessions.forEach(s=>s.day='MON');assert.equal(decision(invalid).decisionType,'NOT_SUPPORTED_YET');
  i.observedExecutionState.completed[0].executedRevision='unrelated';assert.equal(decision(i).decisionType,'ASK');
 }
});
test('R2 regression: return sessions have deterministic new identities and cannot reuse current/completed work',()=>{
 for(const request of ['RETURN_RUN','RETURN_STRENGTH']){
  const i=r2Input(request),oldId=request==='RETURN_RUN'?'return-run':'est-strength-0';i.officialPlanState.sessions.push({session_id:oldId,day:'SUN',recipeId:'R2-EASY-20',status:'COMPLETED',optional:false,parameters:{}});
  const d=decision(i),ids=d.candidate.sessions.map(s=>s.session_id);assert.equal(new Set(ids).size,ids.length);assert.deepEqual(d.candidate.preservedOfficialPlan,i.officialPlanState);assert.deepEqual(decision(i),d);
 }
});
