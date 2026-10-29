import test from 'node:test';
import assert from 'node:assert/strict';
import policy from '../r5/PROGRAM_POLICY_R5.json' with {type:'json'};
import {generateProgram} from '../src/r5-program.mjs';
import {canonicalAthlete,testAuthority} from '../r5/fixtures/canonical.mjs';
import {clone,hash} from '../src/value.mjs';
const authority=testAuthority(policy),run=i=>generateProgram(i,authority);
test('whole program has executable conditional hierarchy for diverse goals and horizons',()=>{
 for(const [goal,n] of [['HALF_MARATHON',16],['STRENGTH',12],['BALANCED',8],['GENERAL_FITNESS',4]]){
  const i=canonicalAthlete(goal,n),before=hash(i),r=run(i);
  assert.equal(r.status,'PROPOSED');assert.equal(hash(i),before);assert.equal(r.program.weeks.length,n);assert.ok(r.program.blocks.length>=2);
  for(const level of [r.program,...r.program.blocks,...r.program.weeks,...r.program.weeks.flatMap(w=>w.sessions)])for(const key of ['intent','essentialOutcomes','optionalOutcomes','protectedStimuli','flexibleElements','progressionCriteria','regressionCriteria','exitCriteria','athleteResponseInputs'])assert.ok(level[key],key);
  assert.ok(r.program.weeks[0].sessions.every(s=>s.prescription.durationMinutes>0));
  assert.deepEqual(r.appliedState,r.officialPlanState);assert.equal(r.program.proposalOnly,true);
 }
});
test('clinical route precedes unknown inputs; no dose survives pain',()=>{
 const i=canonicalAthlete();i.athlete.eligibility.persistentPain=true;i.athlete.anchors=[];
 assert.equal(run(i).status,'CLINICAL_HUMAN_REQUIRED');assert.equal(run(i).program,null);
});
test('missing eligibility and missing cold-start anchors produce focused ASK, not invented fitness',()=>{
 const i=canonicalAthlete();delete i.athlete.eligibility.pain;
 assert.equal(run(i).status,'ASK');
 const low=canonicalAthlete();low.athlete.anchors=[];
 assert.equal(run(low).status,'ASK');assert.ok(run(low).missingInputs.length>0);
});
test('invalid intensity and impossible strength duration are rejected',()=>{
 for(const change of [i=>delete i.athlete.anchors[1].prescription.calibration,i=>i.athlete.anchors[2].prescription.durationMinutes=2]){
  const i=canonicalAthlete();change(i);assert.equal(run(i).status,'INVALID_INPUT');
 }
});
test('current authority hash and complete combined weekly tolerance are mandatory',()=>{
 const i=canonicalAthlete();assert.equal(generateProgram(i,{policy,authority:{records:[]}}).status,'UNSUPPORTED');
 delete i.athlete.weeklyTolerance;assert.equal(run(i).status,'ASK');
});
test('program cannot silently drop essentials or overbook supplied windows',()=>{
 const i=canonicalAthlete();i.scheduleOptions[0].assignments.pop();assert.equal(run(i).status,'UNSUPPORTED');
 const j=canonicalAthlete();j.availability.forEach(d=>d.windows.forEach(w=>w.durationMinutes=10));assert.equal(run(j).status,'UNSUPPORTED');
});
test('event recipe gap is explicit and future weeks never promise earned progression',()=>{
 const r=run(canonicalAthlete());const event=r.program.weeks.at(-1);
 assert.equal(event.status,'UNSUPPORTED_EVENT_CONFIGURATION');assert.equal(event.sessions.length,0);
 assert.ok(r.program.weeks.slice(0,-1).every(w=>w.conditional===true));
 assert.deepEqual(r.program.weeks[0].sessions.map(s=>s.prescription),r.program.weeks[1].sessions.map(s=>s.prescription));
});
test('replay and caller mutation isolation',()=>{
 const i=canonicalAthlete('BALANCED'),r=run(i);assert.deepEqual(r,run(clone(i)));assert.ok(Object.isFrozen(r.program));
 i.athlete.anchors[0].prescription.durationMinutes=100;assert.equal(r.program.weeks[0].sessions.find(s=>s.anchorId==='easy').prescription.durationMinutes,30);
});
