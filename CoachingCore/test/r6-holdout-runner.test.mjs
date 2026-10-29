import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateHoldoutCase,resolveSession,nativeObservation} from '../scripts/evaluate-holdout-r6.mjs';
import {generateProgram} from '../src/r6-index.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {PROFILES} from '../r6/fixtures/profiles.mjs';

// Runner mechanics only, on a development profile; never holdout evidence.
const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const ok={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET'};
const intake=PROFILES.A_RUN_FIRST_HALF_MARATHON;
const program=generateProgram(intake,opts).program;
const weekEnd=w=>program.weeks[w].sessions.at(-1).date;
const weekly=(w,id)=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:weekEnd(w)+'T21:00:00Z',weekIndex:w,event:{id,kind:'WEEKLY_REVIEW'},eligibility:elig(weekEnd(w))});

test('Runner: references resolve to the earliest matching session and record ambiguity',()=>{
 const easy=program.weeks[0].sessions.filter(s=>s.role==='EASY');
 const {session,resolution}=resolveSession(program,{weekIndex:0,sport:'RUN',role:'EASY'});
 assert.equal(session.id,easy[0].id);assert.equal(resolution.ambiguous,easy.length>1);
 assert.throws(()=>resolveSession(program,{weekIndex:0,sport:'RUN',role:'RACE'}),/matches no session/);
});
test('Runner: AS_PRESCRIBED keeps day precision and leaves an unstated chosen load unknown',()=>{
 const s=program.weeks[0].sessions.find(x=>x.sport==='STRENGTH'),o=nativeObservation(program,s,{completed:true,actualStimulus:'AS_PRESCRIBED',response:ok},'C1');
 assert.equal(o.observedAt,undefined);assert.equal(o.occurrenceDate,s.date);
 for(const [i,e] of s.prescription.exercises.entries()){
  assert.equal(o.actual.exercises[i].sets.length,e.sets);
  const set=o.actual.exercises[i].sets[0];assert.equal(set.reps,e.reps);assert.equal(set.rir,e.rir);
  if(e.load.mode==='KNOWN')assert.equal(set.load.value,e.load.value);else if(e.load.mode!=='BODYWEIGHT')assert.equal(set.load,undefined);
 }
 const stated=nativeObservation(program,s,{completed:true,actualStimulus:'AS_PRESCRIBED',loadsByPattern:{SQUAT:18,HINGE:22,PUSH:12,PULL:14,LUNGE:8,CALF:10,TRUNK:0},response:ok},'C1');
 for(const [i,e] of s.prescription.exercises.entries())if(!['KNOWN','BODYWEIGHT'].includes(e.load.mode))assert.ok(Number.isFinite(stated.actual.exercises[i].sets[0].load.value));
});
test('Runner: a sequence carries model, ledger and reference state and adopts only when asked',()=>{
 const facts=w=>program.weeks[w].sessions.filter(s=>s.prescription).map(s=>({weekIndex:w,sport:s.sport,role:s.role,day:s.day,completed:true,actualStimulus:'AS_PRESCRIBED',response:ok}));
 const out=evaluateHoldoutCase({caseId:'DEV-RUNNER',operation:'SEQUENCE',intake,steps:[{review:weekly(0,'r0'),observationFacts:facts(0),adoptProposal:false},{review:weekly(1,'r1'),observationFacts:facts(1),adoptProposal:true}]},opts);
 assert.equal(out.steps.length,2);
 assert.ok(out.steps.every(x=>x.resolutions.length===facts(0).length||x.resolutions.length===facts(1).length));
 assert.ok(out.steps[1].review.actualLedger.length>=facts(0).length,'ledger carried');
 assert.ok(out.steps.every(x=>x.result.applied===false));
 assert.equal(out.steps[1].sourceProgramHash,program.hash,'the first proposal was not adopted');
});
test('Runner: a role list is a preference order and records which role was used',()=>{
 const roles=program.weeks[0].sessions.filter(s=>s.sport==='RUN').map(s=>s.role);
 const {session,resolution}=resolveSession(program,{weekIndex:0,sport:'RUN',role:['RACE',roles[0]]});
 assert.equal(session.role,roles[0]);assert.equal(resolution.role,roles[0]);
 assert.throws(()=>resolveSession(program,{weekIndex:0,sport:'RUN',role:['RACE','SHAKEOUT']}),/matches no session/);
});
