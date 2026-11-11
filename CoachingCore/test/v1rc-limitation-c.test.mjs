// V1 Run Calibration Extension, section 8 (limitation C, secondary): evidence for the viability opinion. No runtime change. These tests state what the
// frozen V1 engine (v1-index.mjs, COACHINGCORE-V1-FREEZE-1) already does with the R6 review kinds SYSTEMIC_FATIGUE and LOCAL_FATIGUE, which the app
// boundary does not expose: a one-week adaptation with no window, ladder, check or chain. They approve nothing and wire nothing.
import test from 'node:test';
import assert from 'node:assert/strict';
import {V1,ELIG,addDays,live,runner,report,hash} from './v1rc-helpers.mjs';
import {isF08Fact} from '../src/v1-f08.mjs';

function start(){
 let p=V1.generateProgram(runner({id:'rc-c',weeks:12})).program,ledger=[],ref=null,n=0;
 const t={get p(){return p;},get ledger(){return ledger;}};
 t.step=(w,d,kind,extra={})=>{const day=addDays(p.startDate,w*7+d),r=V1.evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T20:00:00-03:00`,weekIndex:w,event:{id:`c-${++n}`,kind},eligibility:ELIG(day),observations:[],...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{}),...extra});
  ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;return r;};
 t.week=w=>t.step(w,6,'WEEKLY_REVIEW',{observations:p.weeks[w].sessions.filter(live).filter(s=>!ledger.some(o=>o.sessionId===s.id)).map(s=>report(p,s,{}))});
 return t;
}
const hard=w=>w.sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.role==='QUALITY').length,sets=w=>w.sessions.filter(s=>live(s)&&s.sport==='STRENGTH').reduce((n,s)=>n+s.prescription.exercises.reduce((m,e)=>m+e.sets,0),0);

test('V1RC limitation C: a systemic fatigue report in the frozen V1 engine reduces the rest of this week only and opens nothing',()=>{
 const t=start();let q=0;while(!hard(t.p.weeks[q]))t.week(q++);
 const before=t.p.weeks[q],next=hash(t.p.weeks[q+1].sessions.map(s=>s.prescription)),runMinutes=w=>w.sessions.filter(s=>live(s)&&s.sport==='RUN').reduce((n,s)=>n+s.prescription.durationMinutes,0);
 const r=t.step(q,0,'SYSTEMIC_FATIGUE',{signals:{}});
 assert.equal(r.status,'MODIFY');assert.equal(r.action,'REDUCE');assert.equal(r.unavailable,undefined);
 const after=t.p.weeks[q];
 assert.equal(hard(after),0,'the remaining harder session becomes an easy run');assert.equal(runMinutes(after),runMinutes(before),'easy participation is kept, minute for minute');
 assert.ok(sets(after)<sets(before),'strength keeps a reduced dose');
 assert.equal(hash(t.p.weeks[q+1].sessions.map(s=>s.prescription)),next,'next week is untouched');
 assert.equal(t.ledger.filter(isF08Fact).length,0,'no F08 fact, window, check or episode is created');
 assert.deepEqual(after.adaptations.map(a=>a.kind),['SYSTEMIC_FATIGUE'],'one adaptation of this week, on the record');
 // The ordinary weekly review gates the next week as always; the plan continues with its harder session.
 const w=t.week(q);assert.notEqual(w.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(hard(t.p.weeks[q+1]),1);
});
test('V1RC limitation C: the same report with a clinical flag is the clinical route, never a reduction; a local report removes only optional work',()=>{
 const t=start();let q=0;while(!hard(t.p.weeks[q]))t.week(q++);
 const day=addDays(t.p.startDate,q*7),weekBefore=hash(t.p.weeks[q]);
 const clinical=V1.evaluateProgram(t.p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T20:00:00-03:00`,weekIndex:q,event:{id:'c-clin',kind:'SYSTEMIC_FATIGUE'},eligibility:ELIG(day,{illness:true}),observations:[],actualLedger:t.ledger,signals:{}});
 assert.equal(clinical.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(clinical.proposal,null);
 const local=t.step(q,0,'LOCAL_FATIGUE',{signals:{region:'LOWER'}});
 assert.ok(['KEEP','MODIFY'].includes(local.status));assert.equal(hard(t.p.weeks[q]),1,'the harder run stays');
 if(local.status==='KEEP')assert.equal(hash(t.p.weeks[q]),weekBefore);
});
test('V1RC limitation C: a repeated systemic report does the same again next week; the engine holds no repetition limit of its own',()=>{
 const t=start();let q=0;while(!hard(t.p.weeks[q]))t.week(q++);
 t.step(q,0,'SYSTEMIC_FATIGUE',{signals:{}});t.week(q);
 const again=t.step(q+1,0,'SYSTEMIC_FATIGUE',{signals:{}});
 assert.equal(again.action,'REDUCE');assert.equal(hard(t.p.weeks[q+1]),0);
});
