// REPMILE CoachingCore V1 final physical validation (Founder mission of 2026-11-24): FPV-01, found by the final journeys (G07) on 89796df and
// reproduced on ee256ae. A report on record, then a "not 100%" hold and a readiness declaration in the same week: the return the declaration
// adopts moves the week's mode, the engine binds the report on record to the new plan (context mode and phaseClass), custody read that as a
// stored row changed, and every later write of the athlete was ENGINE_CONTRACT_VIOLATION (an essential journey made impossible). Custody now
// reads such a re-binding as the row as recorded; any other change to a stored row is refused as before.
import test from 'node:test';
import assert from 'node:assert/strict';
import {athlete,spy,notFeeling100WithSign,readiness,addDays,ELIG,S} from './v1int-helpers.mjs';

const code=r=>r.ok?'OK':r.error.code;
const U3={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
function returned({id,report='done',engine}={}){
 const t=athlete({id,engine});t.enroll();const p=t.doc().program,s=t.sessions(0).find(x=>x.id==='w0-run-d1');
 t.set(s.date,'20:00');const f=report==='stop'?{...t.form(s),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}:t.form(s);
 const rec=t.weekly(s.date,[f]);assert.equal(code(rec),'OK');
 const h=addDays(p.startDate,4),rd=addDays(h,1);t.set(h,'08:00');
 assert.equal(code(t.api.notFeeling100({actor:t.actor,clientRequestId:'h',expectedVersion:t.version(),...notFeeling100WithSign(h)})),'OK');
 t.set(rd,'08:00');const ready=t.api.declareReadiness({actor:t.actor,clientRequestId:'rd',expectedVersion:t.version(),...readiness(rd)});
 return {t,s,rd,ready,eventId:rec.recorded[0],stored:t.doc().rows.find(r=>r&&r.eventId===rec.recorded[0])};
}

test('FPV-01: a report, a hold and a readiness declaration in one week: the athlete keeps writing (screen, report, correction, next week), the report kept as recorded',()=>{
 for(const report of ['done','stop']){
  const {t,s,rd,ready,eventId,stored}=returned({id:`fpv-${report}`,report});
  assert.deepEqual([code(ready),ready.status],['OK','MODIFY'],'the return is adopted');
  t.set(rd,'09:00');assert.equal(code(t.screen(ELIG(rd))),'OK','the next screen (was ENGINE_CONTRACT_VIOLATION)');
  const s3=t.sessions(0).find(x=>x.id==='w0-run-d6')??t.sessions(1)[0];t.set(s3.date,'20:00');assert.equal(code(t.weekly(s3.date,[t.form(s3)])),'OK','a report of the return week');
  t.set(s3.date,'21:00');const fix=t.weekly(s3.date,[{...t.form(s),correctionOf:eventId,actual:{...t.form(s).actual,completed:true,minutes:30},response:U3}]);
  assert.equal(code(fix),'OK','the athlete corrects the report bound to the earlier mode');
  const after=t.doc().rows.find(r=>r&&r.eventId===eventId);
  assert.deepEqual(after.context,stored.context,'the recorded context is kept');assert.deepEqual(after.actual,stored.actual);assert.equal(after.superseded,true);
  const w1=t.sessions(1)[0];t.set(w1.date,'20:00');assert.equal(code(t.weekly(w1.date,[t.form(w1)])),'OK','the next week');
 }
});

test('FPV-01: a re-binding stores nothing new; any other change an engine makes to a stored row is still refused (ENGINE_CONTRACT_VIOLATION)',()=>{
 const base=returned({id:'fpv-store'});base.t.set(base.rd,'09:00');const v=base.t.version(),chain=base.t.doc().chain.length;
 assert.equal(code(base.t.screen(ELIG(base.rd))),'OK');assert.equal(base.t.doc().chain.length,chain,'no row was added or annotated by the re-binding');assert.equal(base.t.version(),v+1);
 const forged=[
  ['another session type',c=>({...c,sessionType:'RUN:LONG'})],['another session',c=>({...c,sessionId:'w0-run-d3'})],['another sport',c=>({...c,sport:'STRENGTH'})],
  ['a mode that is no string',c=>({...c,mode:null})],['the planned minutes',c=>({...c,plannedMinutes:90})]];
 for(const [what,alter] of forged){
  let on=false;const sp=spy(),engine={...sp.engine,evaluateProgram:(p,i,o)=>{const r=sp.engine.evaluateProgram(p,i,o);if(!on||!Array.isArray(r.actualLedger))return r;
   return {...r,actualLedger:r.actualLedger.map(row=>row&&row.sessionId==='w0-run-d1'&&!row.fact&&row.context?{...row,context:alter(row.context)}:row)};}};
  const {t,rd}=returned({id:`fpv-forge-${what.replaceAll(' ','-')}`,engine});on=true;t.set(rd,'09:00');
  assert.equal(code(t.screen(ELIG(rd))),'ENGINE_CONTRACT_VIOLATION',what);
 }
 // A re-binding together with a change to a stated fact is a stored row changed.
 let on=false;const sp=spy(),engine={...sp.engine,evaluateProgram:(p,i,o)=>{const r=sp.engine.evaluateProgram(p,i,o);if(!on)return r;
  return {...r,actualLedger:r.actualLedger.map(row=>row&&row.sessionId==='w0-run-d1'&&!row.fact?{...row,actual:{...row.actual,minutes:(row.actual.minutes??0)+20}}:row)};}};
 const {t,rd}=returned({id:'fpv-forge-fact',engine});on=true;t.set(rd,'09:00');assert.equal(code(t.screen(ELIG(rd))),'ENGINE_CONTRACT_VIOLATION','a stated fact altered with the re-binding');
});

test('FPV-01: the whole class: any week-0 day of the hold, a declaration one or two days later, reports done, stopped or short, with or without the watch: no refusal',()=>{
 let cases=0;
 for(const kind of ['done','stop','short'])for(const watch of [false,true])for(let hd=1;hd<=6;hd++){
  cases++;const t=athlete({id:`fpv-sweep-${kind}-${watch}-${hd}`});t.enroll();const p=t.doc().program;
  for(const s of t.sessions(0)){if(addDays(p.startDate,hd)<=s.date)continue;t.set(s.date,'20:00');if(watch&&s.sport==='RUN')t.import([t.watch(s)],{eligibility:ELIG(s.date)});t.set(s.date,'20:30');
   const f=t.form(s),r=s.sport!=='RUN'||kind==='done'?f:kind==='stop'?{...f,actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:{...U3,recovery:'ADVERSE'}}:{...f,actual:{...f.actual,minutes:Math.max(1,(f.actual.minutes??30)-15)}};
   assert.equal(code(t.weekly(s.date,[r])),'OK');}
  const h=addDays(p.startDate,hd),rd=addDays(h,1);t.set(h,'08:00');t.api.notFeeling100({actor:t.actor,clientRequestId:'h',expectedVersion:t.version(),...notFeeling100WithSign(h)});
  t.set(rd,'08:00');assert.equal(code(t.api.declareReadiness({actor:t.actor,clientRequestId:'rd',expectedVersion:t.version(),...readiness(rd)})),'OK');
  t.set(rd,'09:00');assert.equal(code(t.screen(ELIG(rd))),'OK',`${kind}/${watch}/${hd}`);
 }
 assert.equal(cases,36);
});
