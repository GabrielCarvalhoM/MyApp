// V1 Coaching Integration Boundary CF-OBS-1 (PCG-V1CPFF-CFOBS1-r1 Q1-Q7; Security C2 with Q1-Q7; QRE): the record is the source of truth of a clinical hold.
// The reference state is a cache that may add protection and never remove it; only a later valid READINESS_DECLARED, read from the record, releases a
// hold, sport by sport. Directed tests of the Founder's eight scenarios, the negative matrix (review kind x reference variant), the monotonicity
// property (absence is never more permissive than presence), release parity with and without the reference, and what never releases.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT,I,F,timeline,HYBRID,NO,XNO,RNO,READY,ELIG,doneWeek,reviewWeeks,live,clone} from './v1cib-helpers.mjs';

const V=await import(pathToFileURL(path.join(ROOT,'CoachingCore/src/value.mjs')).href);
const W7=F.WARNING_SIGNS.W7;
/** A timeline whose record holds a clinical hold: week 0 reviewed, then on week-1 Tuesday a report with a warning sign (swelling) answered yes. */
function held(){
 const t=timeline();reviewWeeks(t,0,1);const pre=clone(t.ref);
 const r=t.step(1,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[W7]:true},intent:'REST',days:5}},'08:00');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.ok(t.ledger.some(o=>o.fact===F.CLINICAL_HOLD),'the hold is on the record');
 return {t,pre,programBefore:clone(t.p)};
}
const liveAhead=(r,day)=>r.proposal?r.proposal.weeks.flatMap(w=>w.sessions).filter(s=>live(s)&&!s.optional&&s.date>day).length:0;
/** The reference variants a client could send: as kept, absent, the valid one from before the hold, the kept one with its pending removed and the
 * public digest recomputed (a client can re-seal it: the digest is keyless), and one with a broken digest. */
function variant(t,pre,v){
 if(v==='KEPT')return t.ref;if(v==='ABSENT')return null;if(v==='STALE')return pre;
 const {hash:h,...body}=t.ref;if(v==='RESEALED_CLEAN'){const b={...body,pending:null};return {...b,hash:V.hash(b)};}
 return {...t.ref,hash:'0'.repeat(64)};
}
const KINDS=t=>[['WEEKLY_REVIEW',[1,6,{observations:[]}]],['MISSED_SESSION',[1,3,{observations:[]}]],['SYSTEMIC_FATIGUE',[1,3,{}]],['LOCAL_FATIGUE',[1,3,{}]],['UNDERPERFORMANCE',[1,3,{}]],
 ['SCHEDULE_CHANGE',[1,3,{changes:{runDays:[0,2,4]}}]],['PREFERENCE_CHANGE',[1,3,{changes:{coaching:{profile:'DEMANDING'}}}]],['GOAL_CHANGE',[1,3,{changes:{goals:{run:'GENERAL',strength:'GENERAL'}}}]],
 ['EQUIPMENT_CHANGE',[1,3,{changes:{equipment:['BODYWEIGHT']}}]],['UNAVAILABLE_DAY',[1,3,{changes:{unavailableDates:[t.day(1,5)]}}]],['RECOVERED',[1,3,{}]],
 ['NOT_FEELING_100',[1,3,{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REST',days:3}}]],['WELLBEING_CHECK',[1,4,{check:{warningSigns:NO('MILD_ILLNESS'),improved:true}}]],
 ['RETURN_AFTER_PAUSE',[1,5,{interruption:{startDate:t.day(1,2),endDate:t.day(1,4),reasonCategory:'TRAVEL',nonclinical:true}}]]];

test('CF-OBS-1 negative matrix: while the record holds a hold, no review kind with any reference variant prescribes anything; an invalid digest is HOLD; the absent, stale and re-sealed variants are clinical',()=>{
 let n=0;
 for(const v of ['KEPT','ABSENT','STALE','RESEALED_CLEAN','BROKEN']){
  const {t,pre}=held();
  for(const [kind,[w,d,x]] of KINDS(t)){
   const r=t.step(w,d,kind,{...x,ref:variant(t,pre,v),dry:true},'09:00');n++;
   const label=`${kind} with the reference ${v}`;
   assert.equal(liveAhead(r,t.day(w,d)),0,label+': nothing is prescribed');
   assert.equal(r.proposal??null,null,label+': no proposal');
   assert.equal(r.status,v==='BROKEN'?'HOLD':'CLINICAL_HUMAN_REQUIRED',`${label}: ${r.reason}`);
   if(r.status==='CLINICAL_HUMAN_REQUIRED')assert.equal(r.referenceState?.pending?.status,'CLINICAL_HUMAN_REQUIRED',label+': the returned reference carries the hold again (the cache is rebuilt from the record)');
  }
 }
 assert.equal(n,5*14);
});
test('CF-OBS-1 monotonicity: for every review kind, the result with the reference absent, stale or re-sealed is never less restrictive than with it as kept',()=>{
 const rank=r=>r.status==='HOLD'||r.status==='CLINICAL_HUMAN_REQUIRED'?2:r.status==='ASK'?1:0;
 const {t,pre}=held();
 for(const [kind,[w,d,x]] of KINDS(t)){
  const kept=t.step(w,d,kind,{...x,dry:true},'09:00');
  for(const v of ['ABSENT','STALE','RESEALED_CLEAN']){const r=t.step(w,d,kind,{...x,ref:variant(t,pre,v),dry:true},'09:00');assert.ok(rank(r)>=rank(kept),`${kind} ${v}: ${r.status} vs kept ${kept.status}`);assert.ok(liveAhead(r,t.day(w,d))<=liveAhead(kept,t.day(w,d)),`${kind} ${v}`);}
 }
});
test('CF-OBS-1 (1) absent reference, (2) stale reference, (3) a clean-looking re-sealed reference: the hold stands, and a single omission never launders it for the reviews after it',()=>{
 for(const v of ['ABSENT','STALE','RESEALED_CLEAN']){
  const {t,pre}=held();
  const once=t.step(1,3,'MISSED_SESSION',{observations:[],ref:variant(t,pre,v)},'09:00');
  assert.equal(once.status,'CLINICAL_HUMAN_REQUIRED',v);
  // QRE's fact: one omission used to launder the hold for good, even with the reference sent as received afterwards.
  for(const [w,d] of [[1,6],[2,6],[3,6]]){const r=t.step(w,d,'WEEKLY_REVIEW',{observations:[]});assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`${v}, later week ${w}: ${r.reason}`);assert.equal(r.proposal??null,null);}
 }
});
test('CF-OBS-1 (4) incomplete history: earlier rows missing still hold the hold; an altered or foreign hold row is unreadable (HOLD), never read as no hold',()=>{
 const {t}=held();
 const onlyHold=t.ledger.filter(o=>o.fact===F.CLINICAL_HOLD);
 const r=t.step(1,3,'WEEKLY_REVIEW',{observations:[],ledger:onlyHold,ref:null,dry:true},'09:00');
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED','the hold row alone keeps the hold');
 const altered=t.ledger.map(o=>o.fact===F.CLINICAL_HOLD?{...o,declaredAt:'2026-11-01T08:00:00-03:00'}:o);
 assert.equal(t.step(1,3,'WEEKLY_REVIEW',{observations:[],ledger:altered,ref:null,dry:true},'09:00').status,'HOLD');
 const foreign=t.ledger.map(o=>o.fact===F.CLINICAL_HOLD?{...o,athleteId:'someone-else'}:o);
 assert.equal(t.step(1,3,'WEEKLY_REVIEW',{observations:[],ledger:foreign,ref:null,dry:true},'09:00').status,'HOLD');
 // A record with the hold row deleted and no reference: the core alone cannot see a deleted row (two layers, PCG Q5): custody keeps the record
 // whole (RECORD-CUSTODY tests). Here it is shown, not hidden.
 const deleted=t.ledger.filter(o=>o.fact!==F.CLINICAL_HOLD);
 const blind=t.step(1,3,'WEEKLY_REVIEW',{observations:[],ledger:deleted,ref:null,dry:true},'09:00');
 assert.notEqual(blind.status,'CLINICAL_HUMAN_REQUIRED','documented limit of the core: a deleted row is the custody layer\'s to refuse');
});
test('CF-OBS-1 (5) a reused event id: under the hold\'s own id or a session report\'s, nothing is planned and no declaration is recorded; an earlier declaration replayed after a new hold never releases it',()=>{
 const {t}=held();const holdId=t.ledger.find(o=>o.fact===F.CLINICAL_HOLD).eventId,report=t.ledger.find(o=>!o.fact)?.eventId;
 for(const id of [holdId,report]){
  const r=t.step(1,3,'WEEKLY_REVIEW',{observations:[],eventId:id,ref:null,dry:true},'09:00');
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',id+': '+r.reason);assert.equal(r.proposal??null,null);
  for(const ref of [undefined,null]){
   const rr=t.step(1,3,'READINESS_DECLARATION',{readiness:READY(),eligibility:SCREEN(t,1,3),eventId:id,...(ref===null?{ref:null}:{}),dry:true},'09:00');
   assert.notEqual(rr.status,'MODIFY',id+': a declaration under an id already on record does not release: '+rr.reason);assert.ok(rr.missingInputs?.includes('event.id')||rr.status==='CLINICAL_HUMAN_REQUIRED',id);
   assert.ok(!(rr.actualLedger??t.ledger).some(o=>o.fact===F.READINESS_DECLARED),id+': nothing is recorded under it');
  }
 }
 // A release, then a new hold: the earlier declaration sent again (same id, same payload) is a replay, never a second release.
 const first={readiness:READY(),eligibility:SCREEN(t,1,4),eventId:'ib-ready-1'};
 assert.equal(t.step(1,4,'READINESS_DECLARATION',first,'09:00').status,'MODIFY');
 const again=t.step(2,1,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:{...NO('MILD_ILLNESS'),[W7]:true},intent:'REST',days:5}},'08:00');
 assert.equal(again.status,'CLINICAL_HUMAN_REQUIRED');
 const replay=t.step(2,2,'READINESS_DECLARATION',{...first,eligibility:SCREEN(t,2,2)},'09:00');
 assert.notEqual(replay.status,'MODIFY','the replayed declaration does not release the new hold: '+replay.reason);
 const next=t.step(2,3,'WEEKLY_REVIEW',{observations:[],ref:null,dry:true},'09:00');assert.equal(next.status,'CLINICAL_HUMAN_REQUIRED','the new hold stands');
});
test('CF-OBS-1 (6) a change of device: the stored record without the reference, or an older stored plan, never plans over the hold; after a declaration an older plan is refused (HOLD)',()=>{
 const {t,programBefore}=held();
 const fresh=t.step(1,3,'WEEKLY_REVIEW',{observations:[],ref:null,dry:true},'09:00');
 assert.equal(fresh.status,'CLINICAL_HUMAN_REQUIRED','a new device with the record and no reference');
 const old=I.evaluateProgram(programBefore,t.review(1,3,'WEEKLY_REVIEW',{observations:[],ref:null},'09:00'));
 assert.equal(old.status,'CLINICAL_HUMAN_REQUIRED','an older plan with the record');
 const ready=t.step(1,4,'READINESS_DECLARATION',{readiness:READY(),eligibility:{...ELIG(t.day(1,4)),assessedAt:`${t.day(1,4)}T09:00:00-03:00`}},'09:00');
 assert.equal(ready.status,'MODIFY',ready.reason);
 const behind=I.evaluateProgram(programBefore,t.review(1,5,'WEEKLY_REVIEW',{observations:[],ref:null},'09:00'));
 assert.equal(behind.status,'HOLD',behind.reason);assert.deepEqual(behind.errors,['program.behindRecord']);
 const current=t.step(1,5,'WEEKLY_REVIEW',{observations:[],ref:null,dry:true},'09:00');
 assert.notEqual(current.status,'CLINICAL_HUMAN_REQUIRED','the stored plan with the record after the declaration plans: '+current.reason);
});
test('CF-OBS-1 (7) later weekly reviews and (8) plan or preference changes keep the hold, the reference sent or not',()=>{
 for(const ref of ['KEPT','ABSENT']){
  const {t,pre}=held();
  for(const [w,d,kind,x] of [[2,6,'WEEKLY_REVIEW',{}],[3,0,'SCHEDULE_CHANGE',{changes:{runDays:[0,2,4]}}],[3,1,'PREFERENCE_CHANGE',{changes:{coaching:{volume:'HIGHER'}}}],[4,6,'WEEKLY_REVIEW',{}],[5,2,'GOAL_CHANGE',{changes:{goals:{run:'GENERAL',strength:'GENERAL'}}}]]){
   const r=t.step(w,d,kind,{observations:[],...x,...(ref==='ABSENT'?{ref:null}:{})},'09:00');
   assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`${ref} ${kind} week ${w}: ${r.reason}`);assert.equal(r.proposal??null,null);
  }
 }
});
test('CF-OBS-1 what never releases: time, executed sessions, a break, a report, an improved check, RECOVERED, a fresh clear screen',()=>{
 const {t}=held();
 const cases=[[2,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1)}],[3,6,'WEEKLY_REVIEW',{}],[2,2,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(1,2),endDate:t.day(2,1),reasonCategory:'TRAVEL',nonclinical:true}}],
  [2,3,'NOT_FEELING_100',{wellbeing:{condition:'NEED_REST',warningSigns:NO('NEED_REST'),intent:'REDUCE_LIGHT',days:3}}],[2,4,'WELLBEING_CHECK',{check:{warningSigns:NO('MILD_ILLNESS'),improved:true}}],[2,5,'RECOVERED',{}],
  [2,6,'WEEKLY_REVIEW',{eligibility:ELIG(t.day(2,6))}]];
 for(const [w,d,kind,x] of cases){
  for(const ref of [undefined,null]){const r=t.step(w,d,kind,{...x,...(ref===null?{ref:null}:{}),dry:true},'09:00');assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`${kind} (reference ${ref===null?'absent':'kept'}): ${r.reason}`);assert.equal(liveAhead(r,t.day(w,d)),0,kind);}
 }
 const brk=t.step(2,2,'RETURN_AFTER_PAUSE',{interruption:{startDate:t.day(1,2),endDate:t.day(2,1),reasonCategory:'TRAVEL',nonclinical:true}},'09:00');
 assert.equal(brk.status,'CLINICAL_HUMAN_REQUIRED');assert.ok((brk.actualLedger??t.ledger).some(o=>o.fact==='INTERRUPTION_DECLARED'),'the break is recorded, never a release');
});
test('CF-OBS-1 facts are still recorded during a hold (PCG Q3): a session report sent while the hold stands joins the record, nothing is planned, and the restart reads it',()=>{
 for(const ref of ['KEPT','ABSENT']){
  const {t}=held(),monday=doneWeek(t,1).filter(o=>o.occurrenceDate===t.day(1,0));assert.ok(monday.length,'Monday\'s strength, done before the hold');
  const r=t.step(1,2,'WEEKLY_REVIEW',{observations:monday,...(ref==='ABSENT'?{ref:null}:{})},'20:00');
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.proposal??null,null);
  assert.ok(monday.every(o=>t.ledger.some(x=>x.sessionId===o.sessionId&&!x.fact)),ref+': the report is on the record');
  const ready=t.step(1,4,'READINESS_DECLARATION',{readiness:READY(),eligibility:SCREEN(t,1,4)},'09:00');
  const d=t.p.decisions.at(-1),stops=d.readinessRecord?.stops??d.interruption?.stops;
  assert.equal(ready.status,'MODIFY',ready.reason);assert.equal(stops.STRENGTH.start,t.day(1,1),ref+': strength restarts from the day after the reported session');
 }
});
test('CF-OBS-1 clinical first during a hold: a warning sign answered in any payload sets the urgent guidance, the reference sent or not',()=>{
 for(const ref of ['KEPT','ABSENT']){
  const {t}=held();
  const r=t.step(1,3,'WELLBEING_CHECK',{check:{warningSigns:{...NO('MILD_ILLNESS'),[F.WARNING_SIGNS.W2]:true}},...(ref==='ABSENT'?{ref:null}:{}),dry:true},'09:00');
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');assert.equal(r.guidance?.level,'URGENT_CARE_ADVISED',ref+': '+JSON.stringify(r.guidance));
 }
});
const SCREEN=(t,w,d,h='09:00')=>({...ELIG(t.day(w,d)),assessedAt:`${t.day(w,d)}T${h}:00-03:00`});
test('CF-OBS-1 release parity: a valid readiness declaration releases with the reference kept and with it absent; the next review plans in both, with or without the reference',()=>{
 for(const ref of ['KEPT','ABSENT']){
  const {t}=held();
  const r=t.step(1,4,'READINESS_DECLARATION',{readiness:READY(),eligibility:SCREEN(t,1,4),...(ref==='ABSENT'?{ref:null}:{})},'09:00');
  assert.equal(r.status,'MODIFY',`${ref}: ${r.reason}`);assert.ok(['READINESS_RESTART','REESTABLISH'].includes(r.action));
  assert.ok(t.ledger.some(o=>o.fact===F.READINESS_DECLARED),'the release is a fact of the record');
  for(const next of [{},{ref:null}]){const n=t.step(1,6,'WEEKLY_REVIEW',{observations:[],...next,dry:true},'20:00');assert.notEqual(n.status,'CLINICAL_HUMAN_REQUIRED',`${ref}, next review ${'ref' in next?'without':'with'} the reference: ${n.reason}`);}
 }
});
test('CF-OBS-1 invalid declarations never release: a sign yes, a screen from before the hold, a named hold not on record, an unanswered item',()=>{
 const {t}=held();
 const bad=[['a warning sign yes',{readiness:{...READY(),warningSigns:{...RNO(),[F.WARNING_SIGNS.W5]:true}},eligibility:SCREEN(t,1,1,'09:00')}],
  ['a screen from the hold day before the hold',{readiness:READY(),eligibility:{...ELIG(t.day(1,1)),assessedAt:`${t.day(1,1)}T07:00:00-03:00`}}],
  ['a named hold not on record',{readiness:{...READY(),hold:{eventId:'not-a-hold'}},eligibility:SCREEN(t,1,1,'09:00')}],
  ['strength restrictions unanswered',{readiness:READY({RUN:{ready:true},STRENGTH:{ready:true}}),eligibility:SCREEN(t,1,1,'09:00')}]];
 for(const [label,x] of bad){const r=t.step(1,1,'READINESS_DECLARATION',{...x,dry:true},'09:30');assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',`${label}: ${r.status} ${r.reason}`);assert.equal(r.proposal??null,null,label);}
 assert.ok(!t.ledger.some(o=>o.fact===F.READINESS_DECLARED),'no invalid declaration is recorded');
});
test('CF-OBS-1 legitimate release by sport: running declared ready restarts while strength stays held (with or without the reference); a later declaration restarts strength',()=>{
 const {t}=held();
 const r=t.step(1,4,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true},STRENGTH:{ready:false}}),eligibility:SCREEN(t,1,4)},'09:00');
 assert.equal(r.status,'MODIFY',r.reason);
 const after=k=>t.p.weeks[k].sessions.filter(s=>live(s)&&!s.optional);
 assert.ok(after(2).some(s=>s.sport==='RUN'),'running is planned');assert.ok(!after(2).some(s=>s.sport==='STRENGTH'),'strength stays held');
 const noRef=t.step(2,6,'WEEKLY_REVIEW',{observations:doneWeek(t,2),ref:null},'20:00');
 assert.notEqual(noRef.status,'CLINICAL_HUMAN_REQUIRED',noRef.reason);assert.ok(!after(3).some(s=>s.sport==='STRENGTH'),'strength is still held with the reference absent');
 const s=t.step(3,1,'READINESS_DECLARATION',{readiness:READY({RUN:{ready:true},STRENGTH:{ready:true,restrictions:[]}}),eligibility:SCREEN(t,3,1)},'09:00');
 assert.equal(s.status,'MODIFY',s.reason);assert.ok(after(4).some(x=>x.sport==='STRENGTH'),'strength restarts after its own declaration');
});
test('CF-OBS-1 a new plan (restartProgram) reads the hold from the record whatever reference is sent, and a declaration on record lets it start',()=>{
 const {t,pre}=held();
 for(const ref of [t.ref,null,pre,variant(t,pre,'RESEALED_CLEAN')]){
  const r=I.restartProgram({intake:HYBRID(),record:t.ledger,referenceState:ref,asOf:`${t.day(2,0)}T09:00:00-03:00`});
  assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED',r.reason);assert.deepEqual(r.missingInputs,['readiness']);
 }
});
