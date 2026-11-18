// CORE-C2-F01 (Founder mission of 2026-11-18, after COACHINGCORE-V1-CORE-SAFETY-FREEZE-1): a new plan made from a stored record that holds a
// correction sized its easy runs from the rows the correction replaced, as if they were training done (60 min where the record in force gives
// 50). The rule C-Q08-1 is unchanged: the recent weekly exposure the intake states never exceeds what the record shows executed in the last
// 28 days. What changes is which rows show an execution: the rows in force, each counted once. A replaced row stays in the record (history,
// returned unchanged), and is not counted. The oracle of every case is the same restart over a control record that holds only the executions
// in force. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {F,DEV,report,timeline,atSixteen,sixteen,weekWith,asPrescribed,live} from './v1rws-helpers.mjs';
import {restartIntake} from '../src/v1-f08.mjs';

// ---------- end to end: the scenario of the finding (closure-2 probe p14), through the composed entry point ----------
const UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const plain=(t,s)=>{const o=s.sport==='RUN'?asPrescribed(t,s):{};return o?.eventId?o:report(t.p,s,o??{});};
const device=(t,q,actual)=>({eventId:'dev-'+q.id,athleteId:t.p.athleteId,sessionId:q.id,occurrenceDate:q.date,canonicalActivityId:'hk-'+q.id,source:{provider:'HEALTHKIT',activityId:'hk-'+q.id,quality:'WEARABLE_FULL'},actual:{completed:true,minutes:q.prescription.durationMinutes,...actual},response:UNKNOWN});
const STATE=['p','ledger','ref','ev','fmt','hist','runs','cal','state','n'];
let BASE=null;
function base(){
 if(!BASE){const t=atSixteen();t.week(1,weekWith(t,1,null,null));t.week(2,weekWith(t,2,null,null));BASE=JSON.stringify(Object.fromEntries(STATE.map(k=>[k,t[k]])));}
 const t=timeline(sixteen());Object.assign(t,JSON.parse(BASE));return t;
}
const EXTRA={plain:{},lists:{segments:[{distanceKm:4,measurement:'GPS'}]}},POOR={distanceKm:9,measurement:'GPS',gpsQuality:'POOR'};
/**
 * Weeks 3 to 6: the harder session is reported by the athlete (`app-<id>`) and, unless `watch` is null, imported from the watch (`dev-<id>`).
 * `how`: what the athlete's correction adds (null: no correction). `times`: how many successive corrections (each corrects the one before).
 * `late`: each correction arrives in the following week (after the client stored and restored the record). `first`: what the first report
 * states beside (the direct merge control states there what the correction adds). `deviceFix`: the watch's report is corrected instead.
 */
function scenario(how,{watch=POOR,first={},times=1,late=false,deviceFix=false}={}){
 const t=base(),pending=[];
 const flush=w=>{if(pending.length)t.step(w,2,'WEEKLY_REVIEW',{observations:pending.splice(0).map(o=>({...o,correctedAt:`${t.day(w,2)}T09:00:00-03:00`}))},'10:00');};
 for(const w of [3,4,5,6]){
  flush(w);
  const q=t.runsOf(w,s=>s.role==='QUALITY')[0],run=t.runs[q.id],rest=t.p.weeks[w].sessions.filter(live).filter(s=>s.id!==q.id).map(s=>plain(t,s)),day=t.day(w,6);
  const said=(b=>({...b,actual:{...b.actual,formatHash:run.timeFormatHash}}))(report(t.p,q,{workPace:255,rpe:7}));
  const a1={...said,eventId:'app-'+q.id,actual:{...said.actual,...first}},d1=watch?device(t,q,watch):null;
  t.step(w,6,'WEEKLY_REVIEW',{observations:[...rest,a1,...(d1?[d1]:[])]},'18:00');
  if(how!==null){
   let prev=deviceFix?d1:a1;
   for(let k=2;k<=times+1;k++){
    const next=deviceFix?{...prev,eventId:'dev-'+q.id+'-v'+k,actual:{...prev.actual,...EXTRA[how]},correctionOf:prev.eventId,correctedAt:`${day}T19:${10+k}:00-03:00`}
     :{...prev,eventId:a1.eventId+'-v'+k,actual:{...prev.actual,...EXTRA[how]},correctionOf:prev.eventId,correctedAt:`${day}T19:${10+k}:00-03:00`};
    if(late)pending.push(next);else t.step(w,6,'WEEKLY_REVIEW',{observations:[next]},'20:'+String(k).padStart(2,'0'));
    prev=next;
   }
  }
 }
 for(let w=7;w<=7;w++){flush(w);t.week(w,weekWith(t,w,null,null));}
 return t;
}
const runsOf=g=>(g.proposal??g.program).weeks.map(w=>w.sessions.filter(s=>s.sport==='RUN').map(s=>s.prescription?.durationMinutes??null));
function restartFrom(t,{record=null,asOfDay=null,startDay=null}={}){
 const day=asOfDay??t.day(8,0),fresh={...sixteen({asOf:day,start:startDay??t.day(8,1)}),athlete:{...sixteen({asOf:day}).athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE'}}};
 const s=JSON.parse(JSON.stringify({ledger:record??t.ledger,fmt:t.fmt,ev:t.ev,hist:t.hist,ref:t.ref}));
 return F.restartProgram({intake:fresh,record:s.ledger,referenceState:s.ref,asOf:`${day}T10:00:00-03:00`,athleteId:t.p.athleteId,runEvidenceRecord:s.ev,runFormatRecord:s.fmt,runHistoryRecord:s.hist},DEV);
}
const rowsOf=t=>t.ledger.filter(o=>!o.fact);
const supersededOf=t=>rowsOf(t).filter(o=>o.superseded===true);
/** What a restart decides from the record: the status, the plan's run doses (every week), what the record bounded, and the record as returned. */
const decided=g=>({status:g.status,runs:runsOf(g),bounded:g.restart?.boundedByRecord??null,prior:g.restart?.priorCapacity?{...g.restart.priorCapacity,observations:null}:null});
const CTRL={};
const control=(how,o={})=>CTRL[how+JSON.stringify(o)]??=scenario(null,{...o,first:{...(o.first??{}),...EXTRA[how]}});

test('CORE-C2-F01 e2e: a restart from a record with corrections sizes the new plan as the record in force (the direct merge control)',()=>{
 const cases=[['athlete correction + watch (lists)','lists',{}],['athlete correction + watch (plain)','plain',{}],['athlete correction alone (plain)','plain',{watch:null}],['athlete correction alone (lists)','lists',{watch:null}]];
 for(const [lab,how,o] of cases){
  const t=scenario(how,o),c=control(how,o),g=restartFrom(t),k=restartFrom(c);
  assert.equal(supersededOf(t).length,4,lab+': the record holds the four replaced rows');
  assert.equal(supersededOf(c).length,0,lab+': the control holds none');
  assert.deepEqual(decided(g),decided(k),lab);
  // The record is kept whole: the replaced rows are returned with the new plan, unchanged.
  assert.deepEqual(g.restart.carriedRecord,JSON.parse(JSON.stringify(t.ledger)),lab+': the record returned unchanged');
 }
});

test('CORE-C2-F01 e2e: the values before and after, pinned (easy runs 50 min, long run 100, as the control)',()=>{
 const g=restartFrom(scenario('lists')),k=restartFrom(control('lists'));
 assert.deepEqual(runsOf(g)[0],runsOf(k)[0]);
 assert.deepEqual(runsOf(k)[0].slice().sort((a,b)=>a-b),[50,50,50,100]);
 assert.ok(g.restart.boundedByRecord.includes('recent.runMinutesPerWeek'),'the stated exposure is bounded by the record in force');
});

test('CORE-C2-F01 e2e: several corrections of the same execution count it once',()=>{
 for(const times of [2,3]){const t=scenario('plain',{watch:null,times});assert.equal(supersededOf(t).length,4*times);assert.deepEqual(decided(restartFrom(t)),decided(restartFrom(control('plain',{watch:null}))),'times '+times);}
});

test('CORE-C2-F01 e2e: a correction of the watch import (device correction) counts the execution once',()=>{
 const t=scenario('plain',{deviceFix:true});
 assert.ok(supersededOf(t).length>=4);
 assert.deepEqual(decided(restartFrom(t)),decided(restartFrom(scenario(null))));
});

test('CORE-C2-F01 e2e: a correction that arrives in the next week, after the client stored and restored the record',()=>{
 const t=scenario('plain',{watch:null,late:true});
 assert.equal(supersededOf(t).length,4);
 assert.deepEqual(decided(restartFrom(t)),decided(restartFrom(control('plain',{watch:null}))));
});

test('CORE-C2-F01 e2e: the record order (late or shuffled rows) and a second JSON round trip change nothing',()=>{
 const t=scenario('lists'),g=decided(restartFrom(t));
 assert.deepEqual(decided(restartFrom(t,{record:[...t.ledger].reverse()})),g);
 assert.deepEqual(decided(restartFrom(t,{record:JSON.parse(JSON.stringify(JSON.parse(JSON.stringify(t.ledger))))})),g);
});

test('CORE-C2-F01 e2e: a restart A, then B, then C: each reads only the executions in force, never a replaced row of an earlier plan',()=>{
 const t=scenario('lists'),c=control('lists');
 const b=restartFrom(t),bc=restartFrom(c);
 assert.deepEqual(decided(b),decided(bc));
 // Plan C is made from the record plan B returned (A's record, kept whole), on a later day: the same as from the control's.
 const later={asOfDay:t.day(9,0),startDay:t.day(9,1)},fromB=restartFrom(t,{record:b.restart.carriedRecord,...later}),fromBc=restartFrom(c,{record:bc.restart.carriedRecord,...later});
 assert.equal(fromB.status,'PROPOSED',fromB.reason);
 assert.deepEqual(decided(fromB),decided(fromBc));
 assert.equal(fromB.restart.carriedRecord.filter(o=>o.superseded===true).length,4,'the replaced rows still travel with the record');
});

// ---------- unit: restartIntake (C-Q08-1) over records built by hand, against the record in force ----------
const ATH='ath-f01',DAY='2026-11-10';
const intake=(recent={runMinutesPerWeek:600,runDaysPerWeek:7})=>({asOf:DAY,athlete:{id:ATH,recent}});
const screen=()=>({status:'NONCLINICAL'});
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
let seq=0;
const run=(daysAgo,minutes,extra={})=>{const d=shift(DAY,-daysAgo),id=extra.eventId??'e'+(++seq);return {eventId:id,athleteId:ATH,sessionId:extra.sessionId??'s-'+id,localDate:d,observedAt:d+'T09:00:00.000Z',context:{sport:'RUN',sessionType:'RUN_EASY'},actual:{completed:true,minutes},response:UNKNOWN,provenance:{provider:'MANUAL'},...extra};};
const replaced=(row,by)=>({...row,superseded:true,supersededBy:by.eventId,supersededAt:by.localDate+'T20:00:00.000Z'});
const corr=(row,minutes,extra={})=>({...row,eventId:row.eventId+'-c'+(extra.k??1),correctionOf:row.eventId,correctedAt:row.localDate+'T20:00:00.000Z',actual:{...row.actual,minutes},...extra});
const read=(record,i=intake())=>{const r=restartIntake({intake:i,record,asOf:DAY,screen,athleteId:ATH});return {status:r.status,recent:r.intake?.athlete?.recent??null,pause:r.facts?.pause??null,restart:r.facts?.restart??null,bounded:r.carried?.boundedByRecord??null,lastExecuted:r.carried?.priorCapacity?.lastExecutedDay??null,lastBySport:r.carried?.priorCapacity?.lastExecutedBySport??null};};
const inForce=record=>record.filter(o=>o.superseded!==true);
const week=(n,minutes=50)=>Array.from({length:n},(_,i)=>run(2+i*3,minutes));

test('CORE-C2-F01 unit 1: a record without corrections is read as before',()=>{
 const rec=week(8);const r=read(rec);
 assert.deepEqual(r.recent,{runMinutesPerWeek:100,runDaysPerWeek:2});
 assert.deepEqual(r.bounded,['recent.runMinutesPerWeek','recent.runDaysPerWeek']);
});

test('CORE-C2-F01 unit 2-3: an execution corrected once, or several times, counts once, at its value in force',()=>{
 const rest=week(7),x=run(1,50);
 const c1=corr(x,60),once=[...rest,replaced(x,c1),c1];
 assert.deepEqual(read(once),read(inForce(once)));
 assert.equal(read(once).recent.runMinutesPerWeek,Math.round((7*50+60)/4));
 const c2=corr(c1,55,{k:2}),c3=corr(c2,45,{k:3}),thrice=[...rest,replaced(x,c1),replaced(c1,c2),replaced(c2,c3),c3];
 assert.deepEqual(read(thrice),read(inForce(thrice)));
 assert.equal(read(thrice).recent.runMinutesPerWeek,Math.round((7*50+45)/4));
});

test('CORE-C2-F01 unit 4-5: a device correction and an athlete-declared correction',()=>{
 const rest=week(6),dv=run(1,50,{source:{provider:'HEALTHKIT',activityId:'hk-1'},canonicalActivityId:'hk-1',provenance:{provider:'HEALTHKIT'}}),dc=corr(dv,52);
 const ap=run(4,50),ac=corr(ap,40,{provenance:{provider:'MANUAL'}});
 const rec=[...rest,replaced(dv,dc),dc,replaced(ap,ac),ac];
 assert.deepEqual(read(rec),read(inForce(rec)));
 // A correction that says the session was not done leaves no execution behind it: the replaced row does not shorten the pause.
 const only=run(3,50),undone=corr(only,0,{actual:{completed:false,minutes:0}}),lone=[replaced(only,undone),undone];
 assert.deepEqual(read(lone),read(inForce(lone)));
 assert.equal(read(lone).lastExecuted,null);
});

test('CORE-C2-F01 unit 6: two complementary reports of one execution, merged into one row in force (with its parts), count once',()=>{
 const a=run(1,50,{eventId:'app-m'}),merged={...a,provenance:{provider:'MANUAL',parts:{'app-m':{actual:{completed:true,minutes:50}},'dev-m':{actual:{completed:true,minutes:50}}},mergedSourceIds:['dev-m']}};
 const rec=[...week(7),merged];
 assert.equal(read(rec).recent.runMinutesPerWeek,100);
 // And merged once more by a correction of one part: the earlier merged row is replaced, the new one carries both parts.
 const c=corr(merged,50),again=[...week(7),replaced(merged,c),c];
 assert.deepEqual(read(again),read(inForce(again)));
 assert.equal(read(again).recent.runMinutesPerWeek,100);
});

test('CORE-C2-F01 unit 7: a correction after the record was stored and restored (JSON round trip)',()=>{
 const x=run(2,50),c=corr(x,50),rec=[...week(7),replaced(x,c),c];
 assert.deepEqual(read(JSON.parse(JSON.stringify(rec))),read(inForce(rec)));
});

test('CORE-C2-F01 unit 8: replaced and current rows mixed, in any order; distinct executions are all counted',()=>{
 const xs=week(8),cs=xs.slice(0,4).map(x=>corr(x,50)),rec=[...xs.slice(0,4).map((x,i)=>replaced(x,cs[i])),...cs,...xs.slice(4)];
 for(const order of [rec,[...rec].reverse(),[...rec.filter((_,i)=>i%2),...rec.filter((_,i)=>!(i%2))]])assert.deepEqual(read(order),read(inForce(rec)));
 // No reduction: eight distinct executions in force give the same as eight with no correction at all.
 assert.deepEqual(read(rec),read(week(8)));
});

test('CORE-C2-F01 unit 9: plans A, B then C: executions of each plan count, replaced rows of none',()=>{
 const a=[run(20,50,{sessionId:'a.w1.r1'}),run(17,50,{sessionId:'a.w1.r2'})],ac=corr(a[1],50);
 const b=[run(10,50,{sessionId:'rb0001.w0.r1'}),run(7,50,{sessionId:'rb0001.w0.r2'})],bc=corr(b[0],50);
 const cRows=[run(3,50,{sessionId:'rc0002.w0.r1'})];
 const rec=[a[0],replaced(a[1],ac),ac,replaced(b[0],bc),bc,b[1],...cRows];
 assert.deepEqual(read(rec),read(inForce(rec)));
 assert.equal(read(rec).recent.runMinutesPerWeek,Math.round(5*50/4));
});

test('CORE-C2-F01 unit 10: a duplicated row (the same event twice in the record) and a late row count once',()=>{
 const rec=week(8),dup=[...rec,JSON.parse(JSON.stringify(rec[0])),JSON.parse(JSON.stringify(rec[3]))];
 assert.deepEqual(read(dup),read(rec));
 // A late row (an execution of 20 days ago listed last) is an execution like any other.
 const late=[...week(7),run(20,50)];
 assert.equal(read(late).recent.runMinutesPerWeek,100);
});

test('CORE-C2-F01 unit 11: rows without the newer metadata (no parts, no provenance, no superseded field) still count',()=>{
 const legacy=week(8).map(({provenance:_p,response:_r,...o})=>o);
 assert.deepEqual(read(legacy),read(week(8)));
 assert.equal(read(legacy).recent.runMinutesPerWeek,100);
});

test('CORE-C2-F01 unit 12: a clinical or adverse record still answers first, whatever the corrections',()=>{
 const x=run(2,50),c=corr(x,50),rec=[...week(7),replaced(x,c),c];
 const brk={fact:'INTERRUPTION_DECLARED',eventId:'int-1',athleteId:ATH,declaredAt:shift(DAY,-1)+'T08:00:00.000Z',interruption:{reasonCategory:'INJURY'}};
 const r=restartIntake({intake:intake(),record:[...rec,brk],asOf:DAY,screen,athleteId:ATH});
 assert.equal(r.status,'CLINICAL_HUMAN_REQUIRED');
 assert.equal(restartIntake({intake:intake(),record:[...inForce(rec),brk],asOf:DAY,screen,athleteId:ATH}).status,'CLINICAL_HUMAN_REQUIRED');
 // An adverse response on a replaced row is still in the record returned (history); the row in force is what the bound reads.
 const adverse={...replaced(x,c),response:{...UNKNOWN,recovery:'WORSE'}},kept=restartIntake({intake:intake(),record:[...week(7),adverse,c],asOf:DAY,screen,athleteId:ATH});
 assert.ok(kept.carried.record.some(o=>o.superseded&&o.response.recovery==='WORSE'));
 assert.deepEqual(kept.intake.athlete.recent,read([...week(7),c]).recent);
});

test('CORE-C2-F01 unit: the stated exposure is only ever lowered to the record, never raised, and unknown stays unknown',()=>{
 const x=run(2,50),c=corr(x,50),rec=[...week(7),replaced(x,c),c];
 assert.deepEqual(read(rec,intake({runMinutesPerWeek:60,runDaysPerWeek:1})).recent,{runMinutesPerWeek:60,runDaysPerWeek:1});
 assert.deepEqual(read(rec,intake({})).recent,{});
});
