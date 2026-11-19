// Normalization Consistency Closure (Founder mission of 2026-11-19, after COACHINGCORE-V1-CORE-SAFETY-FREEZE-4): F1, F2, F3. Synthetic athletes only.
// F1: a row the record holds is never refused again because a report arrives late with an earlier clock. The record is rebuilt (history, then rows
// in force) before the incoming reports are read, so the outcome is the one a monotone clock gives: a real conflict is flagged on the carried row and
// refuses the late report. A correction made before the report it names was available is refused whichever review brought that report.
// F2: a watch activity merged into another report's row (a part) stays bound to that execution in every later review and after a correction of
// another part; a conflict is flagged on the row in force for that execution, never on a history row.
// F3: a correction in conflict, re-read with nothing new (or restored), keeps its identity's quarantine; only a valid correction resolves it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {restartIntake,readReadiness,readinessFact,READINESS_SIGNS} from '../src/v1-f08.mjs';
import {factsFromLedger} from '../src/v1-run-history.mjs';
import {FORMAT_VALUES_URL} from '../src/v1-run-format.mjs';
import * as S from '../src/v1-safety-index.mjs';
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays} from './v1core-helpers.mjs';

const VALUES=JSON.parse(fs.readFileSync(FORMAT_VALUES_URL,'utf8'));
const ATH='ath-ncc',DAY='2026-11-10',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const json=x=>JSON.parse(JSON.stringify(x));
const N=(batch,asOf,prior)=>normalizeObservations(json(batch),{athleteId:ATH,asOf,maximumAgeDays:36500,incoming:true,...(prior?{prior:json(prior)}:{})});
const rec=n=>[...n.accepted,...n.supersededRows];
const dx=shift(DAY,-5),dy=shift(DAY,-15),T1=dx+'T13:00:00Z',T2=dx+'T15:00:00Z',T3=dx+'T20:00:00Z',T4=shift(DAY,-1)+'T09:00:00Z';
const WATCH=act=>({source:{provider:'HEALTHKIT',activityId:act,quality:'WEARABLE_FULL'},canonicalActivityId:act});
const rep=(id,sid,d,extra={})=>({athleteId:ATH,...(sid?{sessionId:sid}:{}),eventId:id,observedAt:d+'T09:00:00Z',reportedAt:d+'T12:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const fix=(row,extra={},when=dx+'T14:00:00Z')=>({...row,correctionOf:row.eventId,correctedAt:when,reportedAt:when,...extra});
const inForce=(r,id)=>r.filter(o=>o.eventId===id&&o.superseded!==true);
const live=(r,sid)=>r.filter(o=>o.sessionId===sid&&o.superseded!==true);
const view=o=>o&&({eventId:o.eventId,sessionId:o.sessionId??null,actual:o.actual,response:o.response,parts:Object.keys(o.provenance?.parts??{}).sort(),conflicted:o.conflicted??false,superseded:o.superseded??false});
const state=n=>({record:rec(n).map(view),conflicts:n.conflicts.map(c=>c.reason),refused:n.excluded.map(e=>e.eventId+':'+e.reason).sort(),q:[...n.quarantinedIdentities].sort()});
/** Re-read with nothing new: what is in force, its flags and the quarantine. */
const held=n=>({live:n.accepted.map(view),q:[...n.quarantinedIdentities].sort()});
const reread=(r,asOf=T4)=>N([],asOf,r);
const STOP={completed:false,minutes:20,stop:{reason:'SYMPTOM'}},ADV={...U,recovery:'ADVERSE'};
const READY=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const ready=daysAgo=>readinessFact({athleteId:ATH},{event:{id:'ready-ncc'},readiness:{}},shift(DAY,-daysAgo)+'T08:00:00.000Z',READY,null);
const declared=record=>restartIntake({intake:{asOf:DAY,athlete:{id:ATH,recent:{runMinutesPerWeek:600,runDaysPerWeek:7}}},record:json(record),asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH}).facts?.pause?.readinessDeclared;
/** The record after X (session sx, five days ago) and its correction C: stopped for a symptom, recovery adverse (the SSCTR f1 record). */
const stopRecord=()=>{const X=rep('X','sx',dx),l1=rec(N([rep('Y','sy',dy),X],T1)),C=fix(X,{eventId:'C',actual:STOP,response:ADV});return {X,C,l2:rec(N([C],T2,l1))};};

// ---------- F1: late reports with an earlier clock ----------
test('F1 (SSCTR f1): a late watch sync of the session, reported before the carried correction, never removes it: the stop stays in force, flagged, as with a monotone clock',()=>{
 const {l2}=stopRecord(),W=rep('W','sx',dx,{reportedAt:dx+'T13:30:00Z',actual:{completed:true,minutes:40},...WATCH('hk-x')});
 const late=N([W],T3,l2),control=N([{...W,reportedAt:dx+'T16:00:00Z'}],T3,l2);
 assert.deepEqual(inForce(rec(late),'C').map(o=>[o.actual,o.conflicted]),[[STOP,true]],'FREEZE-4: C refused (DUPLICATE_CONFLICT_QUARANTINED) and gone; X left replaced by a missing row');
 assert.deepEqual(late.excluded.map(e=>e.eventId+':'+e.reason),['W:DUPLICATE_CONFLICT_QUARANTINED'],'the late conflicting report is refused against the carried one');
 assert.deepEqual(state(late),state(control),'the outcome of a monotone clock');
 assert.equal(declared([ready(10),...rec(late)]),undefined,'after a readiness declaration the stop is still asked about (SB-1)');
});
test('F1 (Security sb1): a late report reusing a carried row\'s event id for another session, dated earlier, never evicts the carried row; also a same-session "not done"',()=>{
 const X=rep('X','sx',dx,{actual:STOP,response:ADV}),l1=rec(N([rep('Y','sy',dy),X],T1));
 for(const [label,late] of [['event id of another session',rep('X','sz',dy)],['same session, not done',rep('N','sx',dx,{reportedAt:dx+'T11:00:00Z',actual:{completed:false,minutes:0}})]]){
  const n=N([late],T2,l1),control=N([{...late,reportedAt:dx+'T14:00:00Z'}],T2,l1);
  assert.deepEqual(inForce(rec(n),'X').map(o=>o.actual),[STOP],label+': FREEZE-4: X refused and gone, the declaration answered');
  assert.deepEqual(state(n),state(control),label+': as with a monotone clock');
  assert.equal(declared([ready(10),...rec(n)]),undefined,label);
 }
});
test('F1: a late agreeing report merges into the carried row, which stays the row in force; manual before or after the device gives one execution',()=>{
 const X=rep('X','sx',dx),l1=rec(N([X],T1)),W=rep('W','sx',dx,{reportedAt:dx+'T11:00:00Z',actual:{completed:true,minutes:41},...WATCH('hk-x')});
 const n=N([W],T2,l1),row=live(rec(n),'sx');
 assert.deepEqual(row.map(o=>[o.eventId,Object.keys(o.provenance.parts).sort()]),[['X',['W','X']]],'FREEZE-4: W became the row, X merged into it');
 assert.deepEqual(state(n),state(N([{...W,reportedAt:dx+'T14:00:00Z'}],T2,l1)));
 const deviceFirst=rec(N([X],T2,rec(N([W],T1))));
 assert.equal(live(deviceFirst,'sx').length,1,'device first, then the athlete: one execution');
 assert.deepEqual(live(deviceFirst,'sx')[0].actual,row[0].actual,'the same facts, whatever came first');
});
test('F1: a HealthKit activity delivered days later for another session, and a strength session the same day: both admitted, nothing carried moves',()=>{
 const {l2}=stopRecord(),late=rep('H','s2',shift(dx,-2),{...WATCH('hk-2')}),str=rep('St','sst',dx,{reportedAt:dx+'T10:00:00Z',context:{sport:'STRENGTH',sessionType:'STRENGTH_FULL'},actual:{completed:true,minutes:35}});
 const n=N([late,str],T3,l2);
 assert.deepEqual(n.excluded,[]);
 assert.deepEqual(n.accepted.map(o=>o.eventId).sort(),['C','H','St','Y']);
 assert.deepEqual(held(reread(rec(n))).live,held(n).live,'a re-read keeps them');
});
test('F1: a correction made before the report it names was available is refused, the same in one review or two; the record is unchanged',()=>{
 const X=rep('X','sx',dx),early=fix(X,{eventId:'E',actual:{completed:true,minutes:30}},dx+'T10:00:00Z');
 const one=N([X,early],T1),two=N([early],T2,rec(N([X],T1)));
 for(const n of [one,two]){assert.deepEqual(n.excluded.map(e=>e.eventId+':'+e.reason),['E:INVALID_CORRECTION_CHAIN']);assert.deepEqual(inForce(rec(n),'X').length,1);}
 // A valid correction after the late report: replaces it.
 const ok=N([fix(X,{eventId:'K',actual:{completed:true,minutes:30}},dx+'T12:30:00Z')],T2,rec(one));
 assert.deepEqual(ok.superseded.map(e=>[e.eventId,e.supersededBy]),[['X','K']]);
});
test('F1: a correction made at the very instant of the report it names, with an event id that sorts first, stays in force on every re-read (history is rebuilt first)',()=>{
 const X=rep('X','sx',dx),A=fix(X,{eventId:'A',actual:{completed:true,minutes:30}},X.reportedAt),l=rec(N([A],T2,rec(N([X],T1))));
 assert.deepEqual(inForce(l,'A').map(o=>o.actual.minutes),[30],'admitted against the carried report');
 let cur=l;for(let i=0;i<3;i++){const m=reread(json(cur));assert.deepEqual(m.accepted.map(o=>o.eventId),['A'],'re-read '+i+': a history row read after its correction would refuse it (INVALID_CORRECTION_CHAIN)');cur=rec(m);}
});
test('F1: a chain of corrections carried, then late replays (identical, and with other facts) dated earlier: the head stays in force, nothing is double counted',()=>{
 const X=rep('X','sx',dx),C1=fix(X,{eventId:'C1',actual:{completed:true,minutes:35}}),C2=fix(C1,{eventId:'C2',actual:{completed:true,minutes:30}},dx+'T14:30:00Z');
 const l=rec(N([C2],T2,rec(N([C1],T2,rec(N([X],T1))))));
 const n=N([X,{...C1,actual:{completed:true,minutes:10}}],T3,l);
 assert.deepEqual(live(rec(n),'sx').map(o=>[o.eventId,o.actual.minutes]),[['C2',30]]);
 assert.deepEqual(n.duplicates.map(d=>d.eventId+':'+d.reason),['X:EXACT_REPLAY']);
 assert.deepEqual(n.excluded.map(e=>e.eventId+':'+e.reason),['C1:EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'],'the event-id rule (QRE-R6-14) as before');
});
test('F1: the record rebuilt again and again, restored from JSON, and the same late batch re-sent: what is in force does not move',()=>{
 const {l2}=stopRecord(),W=rep('W','sx',dx,{reportedAt:dx+'T13:30:00Z',...WATCH('hk-x')}),n=N([W],T3,l2),r=rec(n);
 let cur=r;for(let i=0;i<3;i++){const m=reread(cur);assert.deepEqual(held(m).live,held(n).live,'re-read '+i);cur=json(rec(m));}
 const again=N([W],T4,r);assert.deepEqual(held(again).live,held(n).live,'the late report re-sent is refused again, nothing moves');
 assert.deepEqual(again.excluded.map(e=>e.reason),['IDENTITY_QUARANTINED_BY_CONFLICT'],'by the quarantine the carried conflict keeps (F3)');
});

// ---------- F2: merged device activities stay bound ----------
const mergedRecord=({deviceFirst=false,sport='RUN'}={})=>{const ctx=sport==='RUN'?{}:{context:{sport:'STRENGTH',sessionType:'STRENGTH_FULL'}};
 const M=rep('M','sm',dx,ctx),W=rep('W','sm',dx,{reportedAt:dx+'T12:05:00Z',actual:{completed:true,minutes:41},...WATCH('hk-m'),...ctx}),Z=rep('Z','sz',shift(dx,-1),ctx);
 return {M,W,Z,l1:rec(N(deviceFirst?[W,M,Z]:[M,W,Z],T1))};};
const borrow=(Z,extra={})=>fix(Z,{eventId:'Z2',...WATCH('hk-m'),...extra},shift(dx,-1)+'T14:00:00Z');
test('F2: an athlete\'s row that merged the watch report keeps the watch activity bound in later reviews: another session carrying it is the conflict, as when the watch report is the row',()=>{
 for(const [label,opts] of [['manual first',{}],['device first',{deviceFirst:true}],['strength',{sport:'STRENGTH'}]]){
  const {Z,l1}=mergedRecord(opts);
  for(const bad of [borrow(Z),{...rep('Q','sq',shift(dx,1)),...WATCH('hk-m')}]){
   const later=N([bad],T4,l1);
   assert.deepEqual(later.excluded.map(e=>e.reason),['ACTIVITY_BOUND_TO_TWO_SESSIONS'],label+': FREEZE-4 admitted it when the row is the athlete\'s (one activity, two sessions)');
   assert.deepEqual(live(rec(later),'sm').map(o=>o.conflicted),[true],label+': flagged on the execution that holds it');
   assert.deepEqual([live(rec(later),'sz').map(o=>[o.eventId,o.conflicted??false]),[...later.quarantinedIdentities].sort()],[[['Z',false]],['session:sm','session:'+bad.sessionId].sort()],label+': the other session keeps its own report; both identities are quarantined in this review (QRE-R6-13)');
  }
 }
});
test('F2: the same activity re-synchronized for its own session merges or replays, never refused; two distinct activities with the same facts are two executions',()=>{
 const {W,l1}=mergedRecord(),resync=N([{...W,eventId:'W-again',reportedAt:dx+'T18:00:00Z'},W],T4,l1);
 assert.deepEqual(resync.excluded,[]);assert.equal(live(rec(resync),'sm').length,1);
 assert.deepEqual(resync.duplicates.map(d=>d.reason).sort(),['EXACT_REPLAY','SAME_EXECUTION_DIFFERENT_SOURCE']);
 const twin=N([rep('T','st',dx,{...WATCH('hk-t'),actual:{completed:true,minutes:41}})],T4,l1);
 assert.deepEqual([twin.excluded,twin.accepted.length],[[],3]);
});
test('F2: missing or empty activity ids are never the same activity',()=>{
 const l=rec(N([rep('A','sa',dx),rep('B','sb',dx,{source:{provider:'HEALTHKIT',activityId:''},canonicalActivityId:''})],T1));
 const n=N([rep('C','sc',dx,{source:{provider:'HEALTHKIT',activityId:''},canonicalActivityId:''}),rep('D','sd',dx)],T4,l);
 assert.deepEqual([n.excluded,n.accepted.length],[[],4]);
});
test('F2: a correction of the athlete\'s part keeps the watch part and its binding; a device correction of the watch part keeps it too; restored from JSON as well',()=>{
 const {M,W,Z,l1}=mergedRecord();
 for(const [label,c] of [['athlete corrects own part',fix(M,{eventId:'M2',actual:{completed:true,minutes:42}})],['device corrects its part',fix(W,{eventId:'W2',actual:{completed:true,minutes:39}})]]){
  const l2=json(rec(N([c],T2,l1))),row=live(l2,'sm');
  assert.equal(row.length,1,label);assert.ok(Object.values(row[0].provenance.parts).some(p=>p.activityId==='hk-m')||row[0].canonicalActivityId==='hk-m',label+': the activity is kept on the row in force');
  const n=N([borrow(Z)],T4,l2);
  assert.deepEqual(n.excluded.map(e=>e.reason),['ACTIVITY_BOUND_TO_TWO_SESSIONS'],label);
  assert.deepEqual(live(rec(n),'sm').map(o=>[o.eventId,o.conflicted]),[[c.eventId,true]],label+': flagged on the row in force');
 }
});
test('F2: in one review, a report bound to an execution a correction just retired flags the row in force, never the history row',()=>{
 const W=rep('W',null,dx,{...WATCH('hk-w')}),l1=rec(N([W],T1)),C=fix(W,{eventId:'C',actual:{completed:true,minutes:38}}),Q={...rep('Q','sq',dx,{reportedAt:dx+'T14:30:00Z'}),...WATCH('hk-w')};
 const n=N([C,Q],T2,l1),r=rec(n);
 assert.deepEqual(inForce(r,'C').map(o=>o.conflicted),[true],'FREEZE-4: the retired W flagged, C in force unflagged');
 assert.equal(r.find(o=>o.eventId==='W'&&o.superseded).conflicted,undefined);
});

// ---------- F3: quarantine survives re-reading ----------
/** M (athlete) and W (watch) of session sm merged; the athlete then corrects their own part against the watch voice in force. */
const disputed=()=>{const {M,W,l1}=mergedRecord(),c=fix(M,{eventId:'M2',actual:{completed:true,minutes:20},response:ADV}),n=N([c],T2,l1);return {M,W,c,n,l2:rec(n)};};
test('F3: a correction in conflict, re-read with nothing new, restored and re-read again, keeps its identity\'s quarantine; so does a plain conflict',()=>{
 const {n,l2}=disputed();
 assert.ok(n.quarantinedIdentities.includes('session:sm')&&live(l2,'sm')[0].conflicted);
 let cur=l2;for(let i=0;i<3;i++){const m=reread(json(cur),shift(DAY,i)+'T09:00:00Z');assert.ok(m.quarantinedIdentities.includes('session:sm'),'re-read '+i+' (FREEZE-4: [])');assert.deepEqual(held(m).live,held(reread(l2)).live);cur=rec(m);}
 const {M,l1}=mergedRecord(),plain=rec(N([{...M,eventId:'P',actual:{completed:true,minutes:20}}],T2,l1));
 assert.ok(reread(plain).quarantinedIdentities.includes('session:sm'),'control');
});
test('F3: a later agreeing plain report of the disputed session is refused by the quarantine, never merged into the conflicted row',()=>{
 const {l2}=disputed(),n=N([rep('P','sm',dx,{reportedAt:dx+'T18:00:00Z',actual:{completed:true,minutes:20},response:ADV})],T4,l2);
 assert.deepEqual(n.excluded.map(e=>e.reason),['IDENTITY_QUARANTINED_BY_CONFLICT'],'FREEZE-4: merged into the conflicted row');
 assert.deepEqual(held(n).live,held(reread(l2)).live);
});
test('F3: a valid correction resolves the conflict in a later review, as in the review that flagged it; one still in conflict keeps it; a refused one changes nothing',()=>{
 const {c,l2}=disputed();
 const ok=N([fix(c,{eventId:'M3',actual:{completed:true,minutes:40},response:U},dx+'T18:00:00Z')],T4,l2);
 assert.deepEqual([live(rec(ok),'sm').map(o=>[o.eventId,o.conflicted??false]),ok.quarantinedIdentities],[[['M3',false]],[]],'resolved: in force, out of quarantine');
 const still=N([fix(c,{eventId:'M3',actual:{completed:true,minutes:15},response:ADV},dx+'T18:00:00Z')],T4,l2);
 assert.deepEqual(live(rec(still),'sm').map(o=>[o.eventId,o.conflicted]),[['M3',true]]);assert.ok(still.quarantinedIdentities.includes('session:sm'));
 assert.ok(reread(rec(still)).quarantinedIdentities.includes('session:sm'),'and on re-read');
 const refused=N([fix(c,{eventId:'Y-none',correctionOf:'nope',actual:{completed:true,minutes:40}},dx+'T18:00:00Z')],T4,l2);
 assert.deepEqual([refused.excluded.map(e=>e.reason),held(refused)],[['INVALID_CORRECTION_CHAIN'],held(reread(l2))]);
});

test('F3 (records not written by this line): a row in force flagged conflicted always quarantines its identity, also where a correction in conflict resolves another row',()=>{
 const chain=rec(N([rep('H','sk',dx),fix(rep('H','sk',dx),{eventId:'C',actual:{completed:true,minutes:20}})],T2)),H=chain.find(o=>o.eventId==='H'),C={...chain.find(o=>o.eventId==='C'),conflicted:true};
 const R={...rec(N([rep('R','sk',dx,{reportedAt:dx+'T12:10:00Z'})],T1))[0],conflicted:true};
 assert.ok(H.superseded&&C&&R,'the hand-built record');
 const n=reread([H,R,C]);
 assert.deepEqual(n.accepted.map(o=>[o.eventId,o.conflicted??false]),[['C',true]]);
 assert.deepEqual(n.quarantinedIdentities,['session:sk'],'the correction resolves R, and its own conflict still stands');
});

// ---------- through the composed engine (weekly review, run history, restart) ----------
function weekZero(){
 const c=client(S);c.onboard(athleteA({weeks:8,id:'ncc'}));const ss=liveSessions(c.env,0),day=addDays(c.env.program.startDate,6);
 const obs=ss.map(s=>reportOf(c.env,s)),d1=obs.find(o=>o.sessionId==='w0-run-d1');
 obs.push({...d1,eventId:'dev-d1',actual:{...d1.actual},response:U,source:{provider:'HEALTHKIT',activityId:'HK-D1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D1'});
 c.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:obs},'w0');return {c,day};
}
const statusOf=(p,sid)=>p.weekEvidence?.rows?.find(r=>r.sessionId===sid)?.status;
test('engine F1: a late watch report of run d3, dated before its carried correction, never removes the correction from the record, the review or run history',()=>{
 const {c,day}=weekZero(),x=c.env.actualLedger.find(o=>o.eventId==='aif-w0-run-d3'&&!o.superseded),d8=addDays(day,1);
 c.review('WEEKLY_REVIEW',at(d8,'08:00'),{eligibility:ELIG(d8),observations:[{sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'d3-fix',correctionOf:x.eventId,correctedAt:at(d8,'07:00'),reportedAt:at(d8,'07:00'),actual:{...x.actual,minutes:x.actual.minutes-10},response:x.response}]},'fix');
 const before=factsFromLedger(c.env.actualLedger,{athleteId:c.env.program.athleteId},VALUES).length;
 c.review('WEEKLY_REVIEW',at(d8,'20:00'),{eligibility:ELIG(d8),observations:[{sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'d3-watch',reportedAt:at(day,'21:00'),actual:{...x.actual,minutes:x.actual.minutes+15},response:U,source:{provider:'HEALTHKIT',activityId:'HK-D3',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D3'}]},'late');
 const rows=c.env.actualLedger.filter(o=>o.sessionId===x.sessionId&&!o.superseded);
 assert.deepEqual(rows.map(o=>[o.eventId,o.conflicted??false]),[['d3-fix',true]],'FREEZE-4: d3-fix gone, d3 left replaced by a missing row');
 const p=c.probe('WEEKLY_REVIEW',at(addDays(day,1),'21:00'),{eligibility:ELIG(addDays(day,1))},'p');
 assert.equal(p.status==='HOLD'&&p.errors?.length?'integrity':'ok','ok',p.reason);
 assert.ok(factsFromLedger(c.env.actualLedger,{athleteId:c.env.program.athleteId},VALUES).length<=before,'a disputed run never adds run evidence');
});
test('engine F2: one watch activity never backs two sessions in run history (dose journey B): a later correction of run d3 carrying d1\'s merged activity is refused',()=>{
 const {c,day}=weekZero(),x=c.env.actualLedger.find(o=>o.eventId==='aif-w0-run-d3'&&!o.superseded),d8=addDays(day,2),runs=()=>factsFromLedger(c.env.actualLedger,{athleteId:c.env.program.athleteId},VALUES);
 const before=runs().length;
 const r=c.review('WEEKLY_REVIEW',at(d8,'20:00'),{eligibility:ELIG(d8),observations:[{sessionId:x.sessionId,occurrenceDate:x.localDate,eventId:'aif-w0-run-d3-c',correctionOf:'aif-w0-run-d3',correctedAt:at(d8,'07:00'),reportedAt:at(d8,'07:00'),actual:{...x.actual,minutes:x.actual.minutes-5},response:x.response,source:{provider:'HEALTHKIT',activityId:'HK-D1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D1'}]},'bad');
 assert.deepEqual(r.provenance.excluded.map(e=>e.reason),['ACTIVITY_BOUND_TO_TWO_SESSIONS'],'FREEZE-4: admitted, HK-D1 on d1 and d3');
 const liveHK=c.env.actualLedger.filter(o=>!o.superseded&&!o.fact&&(o.canonicalActivityId==='HK-D1'||Object.values(o.provenance?.parts??{}).some(p=>p?.activityId==='HK-D1')));
 assert.deepEqual(liveHK.map(o=>o.sessionId),['w0-run-d1'],'one activity, one session');
 assert.ok(runs().length<=before,'no evidence is gained from a borrowed activity');
});
test('engine F3: a run whose athlete correction disputes the watch reads CONFLICTED, and still does on a later review with nothing new',()=>{
 const {c,day}=weekZero(),x=c.env.actualLedger.find(o=>o.sessionId==='w0-run-d1'&&!o.superseded);
 const part=Object.keys(x.provenance.parts).find(id=>id!=='dev-d1');
 const r=c.review('WEEKLY_REVIEW',at(day,'21:00'),{eligibility:ELIG(day),observations:[{sessionId:'w0-run-d1',occurrenceDate:x.localDate,eventId:'d1-fix',correctionOf:part,correctedAt:at(day,'20:30'),reportedAt:at(day,'20:30'),actual:{...x.actual,minutes:Math.round(x.actual.minutes/2)},response:{...U,recovery:'ADVERSE'}}]},'fix');
 assert.equal(statusOf(r,'w0-run-d1'),'CONFLICTED');
 const again=c.probe('WEEKLY_REVIEW',at(day,'23:00'),{eligibility:ELIG(day)},'again');
 assert.equal(statusOf(again,'w0-run-d1'),'CONFLICTED','FREEZE-4: PARTIAL or COMPLETED with nothing new (SSCTR f3)');
 assert.equal(again.weekEvidence.conflicted,r.weekEvidence.conflicted);
});

// ---------- cycle 1 (QRE_NCC_R1 C1/C2, SEC_NCC_R1 SEC-NCC-01): a correction is read against the named report's own clock ----------
const early=(id,sid,hhmm,extra={})=>rep(id,sid,dx,{observedAt:dx+'T07:00:00Z',reportedAt:dx+'T'+hhmm+':00Z',...extra});
const at_=hhmm=>dx+'T'+hhmm+':00Z';
// The facts in force on the session: under E-1 the row takes the event id of the last correction admitted, so which correction holds the row follows
// the order they are read; the parts, measures, answers and conflict are what must agree.
const facts=n=>n.accepted.filter(o=>o.sessionId==='s1'||o.sessionId==='sm').map(o=>({parts:Object.keys(o.provenance?.parts??{}).sort(),actual:o.actual,response:o.response,conflicted:o.conflicted??false}));
const liveView=n=>n.accepted.filter(o=>o.sessionId==='s1'||o.sessionId==='sm').map(o=>({eventId:o.eventId,parts:Object.keys(o.provenance?.parts??{}).sort(),actual:o.actual,response:o.response,conflicted:o.conflicted??false}));
test('C1 / P1-S1: a late device re-sync of a merged watch part, made after that report but before a later athlete correction, is admitted as in one review',()=>{
 const W=early('W','s1','08:00',WATCH('hk1')),A=early('A','s1','09:00'),A2=fix(A,{eventId:'A2',actual:{completed:true,minutes:38}},at_('13:00')),W2=fix(W,{eventId:'W2',actual:{completed:true,minutes:42}},at_('12:00'));
 const r1=rec(N([W,A],at_('10:00'))),r2=rec(N([A2],at_('13:30'),r1)),split=N([W2],at_('15:00'),r2),one=N([W,A,A2,W2],at_('15:00'));
 assert.deepEqual(split.excluded,[],'ef490bb: W2 INVALID_CORRECTION_CHAIN (compared with A2\'s 13:00)');
 assert.deepEqual(facts(split),facts(one),'the one-review outcome (the row is the last correction read: W2 here, A2 in one review)');
 assert.equal(split.accepted.find(o=>o.sessionId==='s1').actual.minutes,42,'the corrected watch measurement leads');
 for(const r of [rec(split),json(rec(split))])assert.deepEqual(liveView(reread(r)),liveView(split),'re-read and round trip');
});
test('C1 / P1-S2, P2: an athlete report delivered late merges into a carried watch row; its correction with an adverse answer is admitted and the answer stays in force',()=>{
 const X=early('X','s1','14:00',WATCH('hk2')),Y=early('Y','s1','09:00'),Y2=fix(Y,{eventId:'Y2',response:{...U,recovery:'ADVERSE',effort:'HARDER'}},at_('10:00'));
 const l1=rec(N([X],at_('14:30')));
 for(const [label,n] of [['same review',N([Y,Y2],at_('16:00'),l1)],['third review',N([Y2],at_('17:00'),rec(N([Y],at_('16:00'),l1)))]]){
  assert.deepEqual(n.excluded,[],label+': ef490bb refused Y2 (compared with X\'s 14:00)');
  const row=n.accepted.find(o=>o.sessionId==='s1');assert.deepEqual([row.response.recovery,row.response.effort],['ADVERSE','HARDER'],label+': the adverse answer is in force');
  assert.deepEqual(liveView(n),liveView(N([X,Y,Y2],at_('17:00'))),label+': the one-review outcome');
  assert.deepEqual(liveView(reread(json(rec(n)))),liveView(n),label+': re-read after a round trip');
 }
});
test('SEC-NCC-01 (e5d, E5a, E5c): the athlete\'s late report and its symptom-stop correction against a carried watch row read as in one review; a correction of a part made before that part was reported is refused however the reports are split',()=>{
 const W=early('W','sm','12:00',WATCH('hk-m')),A=early('A','sm','11:00'),C=fix(A,{eventId:'C',actual:{completed:false,minutes:15,stop:{reason:'SYMPTOM'}},response:ADV},at_('11:30'));
 const l1=rec(N([W],at_('12:30'))),d1=N([A,C],at_('14:00'),l1),d2=N([W,A,C],at_('14:00'));
 for(const [label,n] of [['d1: W carried, A and C together',d1],['E5a: A and C in separate reviews',N([C],at_('15:00'),rec(N([A],at_('14:00'),l1)))]]){
  assert.deepEqual(n.excluded,[],label+': ef490bb refused C');
  assert.deepEqual(n.accepted.filter(o=>o.sessionId==='sm').map(o=>[o.eventId,o.conflicted??false,o.actual.stop?.reason??null]),[['C',true,'SYMPTOM']],label);
  assert.ok(n.quarantinedIdentities.includes('session:sm'),label);
 }
 const inForce_=n=>n.accepted.filter(o=>o.sessionId==='sm').map(o=>({eventId:o.eventId,actual:o.actual,response:o.response,conflicted:o.conflicted??false}));
 assert.deepEqual([inForce_(d1),d1.quarantinedIdentities],[inForce_(d2),d2.quarantinedIdentities],'d1 = d2: C in force, conflicted, its stop, the session quarantined (split, E-1 keeps the watch voice as a part of C; in one review the watch report is refused)');
 // E5c: M (10:00) holds W2 (watch, reported 12:00); a correction of W2 made at 11:00, before W2 was reported, is no correction of it.
 const M=early('M','sm','10:00'),W2=early('W2','sm','12:00',{...WATCH('hk-2'),actual:{completed:true,minutes:41}}),Cw=fix(W2,{eventId:'Cw',actual:{completed:true,minutes:30}},at_('11:00'));
 for(const [label,n] of [['split',N([Cw],at_('13:00'),rec(N([M,W2],at_('12:30'))))],['one review',N([M,W2,Cw],at_('13:00'))]])
  assert.deepEqual(n.excluded.map(e=>e.eventId+':'+e.reason),['Cw:INVALID_CORRECTION_CHAIN'],label+' (ef490bb admitted it when split: compared with M\'s 10:00)');
 // A part written before this line keeps no clock: no refusal by this rule (FREEZE-4 behaviour).
 const old=rec(N([M,W2],at_('12:30'))).map(o=>{const c=json(o);for(const p of Object.values(c.provenance?.parts??{}))delete p.availableAt;return c;});
 assert.deepEqual(N([Cw],at_('13:00'),old).excluded,[],'a part without a clock: never refused by the rule');
});
test('C1 / P7 through the engine: a re-sync of the watch part of run d1, made before the athlete\'s later correction of their part and delivered after it, is in force',()=>{
 const {c,day}=weekZero(),x=c.env.actualLedger.find(o=>o.sessionId==='w0-run-d1'&&!o.superseded),part=Object.keys(x.provenance.parts).find(id=>id!=='dev-d1'),dev=x.provenance.parts['dev-d1'];
 c.review('WEEKLY_REVIEW',at(day,'21:00'),{eligibility:ELIG(day),observations:[{sessionId:'w0-run-d1',occurrenceDate:x.localDate,eventId:'d1-fix',correctionOf:part,correctedAt:at(day,'20:30'),reportedAt:at(day,'20:30'),actual:{...x.actual},response:{...U,effort:'ON_TARGET'}}]},'fix');
 const r=c.review('WEEKLY_REVIEW',at(day,'23:00'),{eligibility:ELIG(day),observations:[{sessionId:'w0-run-d1',occurrenceDate:x.localDate,eventId:'dev-d1-v2',correctionOf:'dev-d1',correctedAt:at(day,'20:00'),reportedAt:at(day,'20:00'),actual:{...dev.actual,minutes:dev.actual.minutes+3},response:U,source:{provider:'HEALTHKIT',activityId:'HK-D1',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D1'}]},'resync');
 assert.deepEqual(r.provenance.excluded,[],'ef490bb: dev-d1-v2 INVALID_CORRECTION_CHAIN');
 const row=c.env.actualLedger.filter(o=>o.sessionId==='w0-run-d1'&&!o.superseded&&!o.fact);
 assert.equal(row.length,1);assert.equal(row[0].actual.minutes,dev.actual.minutes+3,'the corrected device measurement leads (FREEZE-4: 43)');
 assert.ok(Object.keys(row[0].provenance.parts).includes('dev-d1-v2'));
});
test('SEC-NCC-01 through the engine (engine-e5d): run d3 known only from the watch; the athlete\'s report and its symptom-stop correction arrive the next morning: in force, conflicted, no run-history fact from the watch',()=>{
 const c=client(S);c.onboard(athleteA({weeks:8,id:'ncc-e5d'}));const ss=liveSessions(c.env,0),day=addDays(c.env.program.startDate,6);
 const obs=ss.map(s=>reportOf(c.env,s)),d3=obs.find(o=>o.sessionId==='w0-run-d3');
 const base=obs.filter(o=>o!==d3),watch={...d3,eventId:'d3-watch',reportedAt:at(day,'19:00'),response:U,source:{provider:'HEALTHKIT',activityId:'HK-D3',quality:'WEARABLE_FULL'},canonicalActivityId:'HK-D3'};
 c.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:[...base,watch]},'w0');
 const runs=()=>factsFromLedger(c.env.actualLedger,{athleteId:c.env.program.athleteId},VALUES).length,dn=addDays(day,1);
 const control=client(S);control.onboard(athleteA({weeks:8,id:'ncc-e5d'}));control.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:base},'w0');
 const athlete={...d3,eventId:'d3-app',reportedAt:at(day,'18:00')};
 const r=c.review('WEEKLY_REVIEW',at(dn,'08:00'),{eligibility:ELIG(dn),observations:[athlete,{...athlete,eventId:'d3-fix',correctionOf:'d3-app',correctedAt:at(day,'18:30'),reportedAt:at(day,'18:30'),actual:{completed:false,minutes:12,stop:{reason:'SYMPTOM'}},response:ADV}]},'late');
 assert.deepEqual(r.provenance.excluded,[],'ef490bb: d3-fix refused, the watch\'s 40 min in force unflagged');
 assert.deepEqual(c.env.actualLedger.filter(o=>o.sessionId==='w0-run-d3'&&!o.superseded&&!o.fact).map(o=>[o.eventId,o.conflicted??false]),[['d3-fix',true]]);
 assert.equal(runs(),factsFromLedger(control.env.actualLedger,{athleteId:control.env.program.athleteId},VALUES).length,'no run-history fact for a run the athlete says they stopped');
});

// ---------- successor of a frozen assertion (SUCCESSOR_LEDGER.json) ----------
import {spawnSync} from 'node:child_process';
import os from 'node:os';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
test('successor of v1core-successor-lineage.test.mjs:205 (F1, scenario 21, EASY): the frozen matrix, its one EASY expectation now the LONG one, passes whole in both families',()=>{
 // FREEZE-4 read the athlete's stop and the carried device report at one instant (no report time: the end of the run's day) and, by event id, the
 // stop first: the carried device report was refused again and left the record (F1), so the device re-sync found nothing to correct. The record is
 // now rebuilt first: the device report stays, flagged; the re-sync resolves the conflict, as LONG (whose two reports never tied) already read.
 const here=path.dirname(fileURLToPath(import.meta.url)),src=fs.readFileSync(path.join(here,'v1core-successor-lineage.test.mjs'),'utf8');
 const OLD="NOT_CARRIED,{EASY:['app-stop','dev-x','dev-x-v2'],LONG:['app-stop','dev-x-v2']},{EASY:null,LONG:'whole'}]";
 assert.equal(src.split(OLD).length,2,'the frozen expectation, once');
 const body=src.replace(OLD,"NOT_CARRIED,['app-stop','dev-x-v2'],'whole']").replaceAll("from './","from '"+pathToFileURL(here).href+'/').replaceAll("from '../","from '"+pathToFileURL(path.dirname(here)).href+'/');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ncc-lineage-')),file=path.join(dir,'lineage-successor.test.mjs');fs.writeFileSync(file,body);
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const r=spawnSync(process.execPath,['--test','--test-name-pattern=SUCCESSOR closure-2 · lineage matrix',file],{encoding:'utf8',env,cwd:path.dirname(here)});
 fs.unlinkSync(file);fs.rmdirSync(dir);
 assert.equal(r.status,0,(r.stdout+r.stderr).slice(-3000));
 assert.match(r.stdout,/ℹ pass 2\b/);assert.match(r.stdout,/ℹ fail 0\b/);
});
