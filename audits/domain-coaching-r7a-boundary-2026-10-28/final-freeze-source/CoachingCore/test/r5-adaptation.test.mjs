import test from 'node:test';
import assert from 'node:assert/strict';
import policy from '../r5/PROGRAM_POLICY_R5.json' with {type:'json'};
import {canonicalAthlete,testAuthority} from '../r5/fixtures/canonical.mjs';
import {generateProgram} from '../src/r5-program.mjs';
import {evaluateProgram} from '../src/r5-adaptation.mjs';
import {createLearningModel,updateLearningModel} from '../src/r5-learning.mjs';
import {clone,hash} from '../src/value.mjs';
import {stimulusOf} from '../src/r5-observation.mjs';
const options=testAuthority(policy);
const initial=()=>generateProgram(canonicalAthlete(),options).program;
export function observation(program,week,anchorId='easy',performance='COMPATIBLE'){
 const s=program.weeks[week].sessions.find(s=>s.anchorId===anchorId);
 return {eventId:`actual-${week}-${anchorId}`,athleteId:program.athleteId,sessionId:s.id,observedAt:s.date+'T20:00:00Z',origin:'ACTUAL_EXECUTION',sourceHash:hash({sessionId:s.id,performance}),plannedPrescriptionHash:hash(s.prescription),actual:{completed:true,minutes:s.prescription.durationMinutes,stimulus:stimulusOf(s.prescription),...(s.prescription.modality==='STRENGTH'?{sets:s.prescription.exercises.reduce((n,e)=>n+e.sets,0),reps:s.prescription.exercises.reduce((n,e)=>n+e.sets*e.reps,0)}:{})},response:{performance,recovery:'COMPATIBLE',effort:performance==='OVER'?'EASIER':performance==='UNDER'?'HARDER':'ON_TARGET'},context:{family:s.prescription.family,modality:s.prescription.modality,phase:program.weeks[week].phase,arrangement:program.selectedScheduleId,doseKey:hash(s.prescription),equipment:clone(s.prescription.equipment),priority:program.goal.priority},comparable:true,confounded:false};
}
const review=(p,kind='REVIEW',weekIndex=0,extra={})=>({version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:p.weeks[weekIndex].startDate+'T23:00:00Z',weekIndex,event:{id:`event-${kind}-${weekIndex}`,kind},eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:p.weeks[weekIndex].startDate,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},observations:[],...extra});
test('adequate programme is stable by default and keeps official and completed work immutable',()=>{
 const p=initial(),before=hash(p),r=review(p);r.officialPlanState={realPlan:'untouched'};r.actualLedger=[{eventId:'old',actual:{minutes:20}}];
 const d=evaluateProgram(p,r,options);assert.equal(d.status,'KEEP');assert.equal(d.proposal,null);assert.equal(hash(p),before);assert.deepEqual(d.appliedState,r.officialPlanState);assert.deepEqual(d.actualLedger,r.actualLedger);assert.equal(d.horizonsConsidered.length,4);
});
test('isolated underperformance does not cause progression or regression',()=>{
 const p=initial(),o=observation(p,0,'easy','UNDER'),r=review(p,'UNDERPERFORMANCE',0,{asOf:'2026-10-26T23:00:00Z',targetSessionId:o.sessionId,observations:[o],learningConsent:true});
 const d=evaluateProgram(p,r,options);assert.equal(d.status,'KEEP');assert.equal(d.updatedModel.observations.length,1);
});
test('repeated comparable underperformance earns a minimum familiar regression in next horizon',()=>{
 const p=initial(),obs=[0,1,2].map(w=>observation(p,w,'easy','UNDER')),r=review(p,'UNDERPERFORMANCE',2,{asOf:'2026-11-09T23:00:00Z',observations:obs,targetSessionId:obs.at(-1).sessionId,learningConsent:true});
 const d=evaluateProgram(p,r,options);assert.equal(d.status,'MODIFY');assert.equal(d.action,'REGRESS');
 assert.equal(d.proposal.weeks[3].sessions.find(s=>s.anchorId==='easy').prescription.durationMinutes,25);
 assert.deepEqual(d.proposal.weeks.slice(0,3),p.weeks.slice(0,3));assert.ok(d.counterfactuals.some(c=>c.action==='KEEP'));assert.equal(d.athleteEvidence.causal,false);
});
test('earned progression changes one dimension while preserving current and completed weeks',()=>{
 const p=initial(),obs=[0,1,2].map(w=>observation(p,w,'strength-a','OVER')),r=review(p,'OVERPERFORMANCE',2,{asOf:'2026-11-10T23:00:00Z',observations:obs,targetSessionId:obs.at(-1).sessionId,learningConsent:true});
 const d=evaluateProgram(p,r,options);assert.equal(d.status,'MODIFY');assert.equal(d.action,'PROGRESS');assert.equal(d.proposal.weeks[3].sessions.find(s=>s.anchorId==='strength-a').prescription.exercises[0].reps,7);assert.deepEqual(d.proposal.weeks[2],p.weeks[2]);
});
test('clinical and stale assessment cannot be bypassed by a learned preference',()=>{
 const p=initial(),r=review(p);r.eligibility.pain=true;assert.equal(evaluateProgram(p,r,options).status,'CLINICAL_HUMAN_REQUIRED');
 delete r.eligibility;assert.equal(evaluateProgram(p,r,options).status,'ASK');
});
test('observation must bind exact planned source and cannot rewrite completed actuals',()=>{
 const p=initial(),o=observation(p,0),r=review(p,'REVIEW',0,{observations:[{...o,plannedPrescriptionHash:'a'.repeat(64)}],learningConsent:true});
 const d=evaluateProgram(p,r,options);assert.equal(d.status,'HOLD');assert.equal(d.updatedModel.observations.length,0);
 const dup=review(p,'REVIEW',0,{actualLedger:[o],observations:[{...o,actual:{completed:true,minutes:999}}],learningConsent:true});assert.equal(evaluateProgram(p,dup,options).status,'HOLD');
});
test('missed optional is discarded without debt; event horizon blocks catch-up loading',()=>{
 const p=initial(),r=review(p,'MISSED_OPTIONAL');assert.equal(evaluateProgram(p,r,options).status,'KEEP');
 const key=review(p,'MISSED_ESSENTIAL',14,{targetSessionId:p.weeks[14].sessions.at(-1).id});const d=evaluateProgram(p,key,options);assert.equal(d.status,'KEEP');assert.equal(d.action,'DISCARD');assert.match(d.reason,/debt|compress|future/i);
});
test('repeated review is deterministic and model hash corruption fails closed',()=>{
 const p=initial(),r=review(p);assert.deepEqual(evaluateProgram(p,r,options),evaluateProgram(p,clone(r),options));
 const m=clone(createLearningModel({athleteId:p.athleteId,purposeAllowed:true,asOf:r.asOf}));m.hash='0'.repeat(64);r.athleteModel=m;assert.equal(evaluateProgram(p,r,options).status,'HOLD');
});
