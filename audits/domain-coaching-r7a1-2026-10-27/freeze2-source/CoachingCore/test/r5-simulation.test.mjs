import test from 'node:test';
import assert from 'node:assert/strict';
import policy from '../r5/PROGRAM_POLICY_R5.json' with {type:'json'};
import {testAuthority,canonicalAthlete} from '../r5/fixtures/canonical.mjs';
import {fixtureAthlete,noviceFixture,actualFor,reviewFor} from '../r5/fixtures/trajectories.mjs';
import {simulateProgram} from '../src/r5-simulator.mjs';
import {generateProgram,programHash} from '../src/r5-program.mjs';
import {evaluateProgram,ProgramShadowJournal} from '../src/r5-adaptation.mjs';
import {clone,hash} from '../src/value.mjs';
const options=testAuthority(policy);
test('4/8/12/16-week replay stays deterministic and stable without blanket progression or HOLD',()=>{
 for(const n of [4,8,12,16]){
  const i=fixtureAthlete('GENERAL_FITNESS',n),a=simulateProgram(i,[],options),b=simulateProgram(i,[],options);
  assert.deepEqual(a,b);assert.equal(a.rows.length,n);assert.equal(a.summary.mutations,0);assert.equal(a.summary.decisions.HOLD,undefined);assert.equal(a.summary.completedRewrites,0);assert.equal(a.summary.officialMutations,0);
  assert.ok(a.rows.every(r=>r.decision.counterfactuals.some(c=>c.action==='KEEP')));
 }
});
test('earned one-dimensional trajectory has no automatic restoration or adaptation cascade',()=>{
 const i=fixtureAthlete('HALF_MARATHON',16),events=[0,1,2].map(weekIndex=>({weekIndex,kind:'UNDERPERFORMANCE',targetAnchorId:'easy',performanceByAnchor:{easy:'UNDER'}})),r=simulateProgram(i,events,options);
 assert.equal(r.summary.mutations,1);assert.equal(r.rows[2].decision.action,'REGRESS');assert.ok(r.finalProgram.weeks.slice(3,-1).every(w=>w.sessions.find(s=>s.anchorId==='easy').prescription.durationMinutes===25));
 assert.equal(r.rows.at(-1).plannedWeek.status,'UNSUPPORTED_EVENT_CONFIGURATION');
});
test('novice asymmetry produces different bounded tasks without copying established modality loads',()=>{
 const r=generateProgram(noviceFixture('RUN'),options),s=generateProgram(noviceFixture('STRENGTH'),options);
 assert.equal(r.status,'PROPOSED');assert.equal(s.status,'PROPOSED');assert.ok(r.program.weeks[0].sessions.filter(s=>s.prescription.modality==='RUN').every(s=>s.prescription.family==='WALK_JOG'));
 assert.ok(s.program.weeks[0].sessions.filter(s=>s.prescription.modality==='STRENGTH').every(s=>s.prescription.exercises.every(e=>e.load.unit==='BODYWEIGHT')));
});
test('source-poor totals never earn loaded strength or interval progression',()=>{
 const p=generateProgram(canonicalAthlete(),options).program;
 for(const id of ['strength-a','cruise']){
  const obs=[0,1,2].map(w=>actualFor(p,p.weeks[w].sessions.find(s=>s.anchorId===id),'OVER'));
  obs.forEach(o=>{delete o.actual.stimulus;});
  const d=evaluateProgram(p,reviewFor(p,2,'OVERPERFORMANCE',{targetSessionId:obs.at(-1).sessionId,observations:obs}),options);
  assert.equal(d.status,'KEEP');assert.equal(d.updatedModel.observations.length,0);
 }
});
test('new agenda overlap, lost caller ledger and repeated event cannot evade invariants',()=>{
 const p=generateProgram(canonicalAthlete(),options).program,obs=actualFor(p,p.weeks[0].sessions[0]),r=reviewFor(p,0,'REVIEW',{observations:[obs]});
 const first=evaluateProgram(p,r,options),fatigue=reviewFor(p,0,'LOCAL_FATIGUE',{targetSessionId:obs.sessionId,athleteModel:first.updatedModel});
 const next=evaluateProgram(p,fatigue,options);assert.ok(next.actualLedger.some(o=>o.eventId===obs.eventId));assert.equal(next.proposal,null);
 const journal=new ProgramShadowJournal();assert.equal(journal.record(p,r,options).duplicate,false);assert.equal(journal.record(p,clone(r),options).duplicate,true);assert.equal(journal.record(p,{...r,learningConsent:false},options).conflict,true);
});
test('one future-dose mutation per week does not accumulate cross-modality overload',()=>{
 const p=generateProgram(canonicalAthlete(),options).program,runObs=[0,1,2].map(w=>actualFor(p,p.weeks[w].sessions.find(s=>s.anchorId==='easy'),'OVER'));
 const first=evaluateProgram(p,reviewFor(p,2,'OVERPERFORMANCE',{targetSessionId:runObs.at(-1).sessionId,observations:runObs}),options);assert.equal(first.action,'PROGRESS');
 const strengthObs=[0,1,2].map(w=>actualFor(first.proposal,first.proposal.weeks[w].sessions.find(s=>s.anchorId==='strength-a'),'OVER'));
 const second=evaluateProgram(first.proposal,reviewFor(first.proposal,2,'OVERPERFORMANCE',{event:{id:'second-dose',kind:'OVERPERFORMANCE'},targetSessionId:strengthObs.at(-1).sessionId,observations:strengthObs}),options);
 assert.equal(second.status,'KEEP');assert.match(second.reason,/already changed/);
});
test('unresolved fatigue state cannot resume by a RECOVERED label; current task reconciliation is required',()=>{
 const p=generateProgram(canonicalAthlete(),options).program,first=evaluateProgram(p,reviewFor(p,0,'SYSTEMIC_FATIGUE'),options);assert.equal(first.status,'ASK');
 const r=reviewFor(p,1,'RECOVERED',{referenceState:first.referenceState}),pending=evaluateProgram(p,r,options);assert.equal(pending.status,'ASK');assert.equal(pending.planValidity.status,'REQUIRES_RECONCILIATION');
 r.reconciliation={source:'CURRENT_SELF_REPORT',ordinaryFunction:'COMPATIBLE',recovery:'COMPATIBLE',observedAt:r.asOf,prescriptionHashes:p.weeks[1].sessions.map(s=>hash(s.prescription))};
 const resumed=evaluateProgram(p,r,options);assert.equal(resumed.status,'KEEP');assert.equal(resumed.referenceState.pending,null);
});
test('generic recovery never clears unknown return reason or downgrades a clinical dependency through missing eligibility',()=>{
 const p=generateProgram(canonicalAthlete(),options).program,unknown=evaluateProgram(p,reviewFor(p,0,'RETURN'),options),r=reviewFor(p,1,'RECOVERED',{referenceState:unknown.referenceState});
 r.reconciliation={source:'CURRENT_SELF_REPORT',ordinaryFunction:'COMPATIBLE',recovery:'COMPATIBLE',observedAt:r.asOf,prescriptionHashes:p.weeks[1].sessions.map(s=>hash(s.prescription))};
 assert.equal(evaluateProgram(p,r,options).status,'ASK');
 const clinical=reviewFor(p,0);clinical.eligibility.pain=true;const state=evaluateProgram(p,clinical,options).referenceState;
 const missing=reviewFor(p,1,'REVIEW',{referenceState:state});delete missing.eligibility;const middle=evaluateProgram(p,missing,options);assert.equal(middle.status,'CLINICAL_HUMAN_REQUIRED');
 r.referenceState=middle.referenceState;assert.equal(evaluateProgram(p,r,options).status,'CLINICAL_HUMAN_REQUIRED');
});
test('clinical dependency persists through reference continuation and journal retains prior actuals',()=>{
 const p=generateProgram(canonicalAthlete(),options).program,r=reviewFor(p,0);r.eligibility.pain=true;
 const first=evaluateProgram(p,r,options),later=reviewFor(p,1,'RECOVERED',{referenceState:first.referenceState});
 assert.equal(evaluateProgram(p,later,options).status,'CLINICAL_HUMAN_REQUIRED');
 const actual=actualFor(p,p.weeks[0].sessions[0]),journal=new ProgramShadowJournal();journal.record(p,reviewFor(p,0,'REVIEW',{observations:[actual]}),options);
 const next=journal.record(p,reviewFor(p,1),options).result;assert.ok(next.actualLedger.some(o=>o.eventId===actual.eventId));
});
