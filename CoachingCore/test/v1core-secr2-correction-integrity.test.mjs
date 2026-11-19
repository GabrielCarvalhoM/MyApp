// SEC-R2-03 + SEC-R2-04 (Founder mission of 2026-11-19, after COACHINGCORE-V1-CORE-SAFETY-FREEZE-3): correction integrity.
// SEC-R2-03: a correction the normalizer refuses never retires what it names: every row it named stays in force, as it was, and the refused
// report has exactly the effect the same report has with no correctionOf (the event-id and watch-activity conflict rules, QRE-R6-13/-14,
// unchanged). A correction that resolves a conflict is never merged into a row it retires. SEC-R2-04: a replaced row is history only when
// the record holds its replacement by a positive identity (session, else activity, else the manual report's provider at its instant): two
// missing ids are never the same session. Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {restartIntake,readReadiness,readinessFact,READINESS_SIGNS} from '../src/v1-f08.mjs';
import {factsFromLedger} from '../src/v1-run-history.mjs';
import {FORMAT_VALUES_URL} from '../src/v1-run-format.mjs';
import * as S from '../src/v1-safety-index.mjs';
import {client,athleteA,reportOf,liveSessions,at,ELIG,addDays} from './v1core-helpers.mjs';
import {F,DEV,sixteen} from './v1rws-helpers.mjs';

const VALUES=JSON.parse(fs.readFileSync(FORMAT_VALUES_URL,'utf8'));
const ATH='ath-s2',DAY='2026-11-10',U={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const json=x=>JSON.parse(JSON.stringify(x));
const N=(batch,asOf,prior)=>normalizeObservations(json(batch),{athleteId:ATH,asOf,maximumAgeDays:36500,...(prior?{prior:json(prior)}:{})});
const rec=n=>[...n.accepted,...n.supersededRows];
const dx=shift(DAY,-5),dy=shift(DAY,-15),T1=dx+'T13:00:00Z',T2=dx+'T15:00:00Z',T3=dx+'T18:00:00Z';
const rep=(id,sid,d,extra={})=>({athleteId:ATH,...(sid?{sessionId:sid}:{}),eventId:id,occurrenceDate:d,reportedAt:d+'T12:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U,actual:{completed:true,minutes:40},source:{provider:'MANUAL'},...extra});
const WATCH=(act)=>({source:{provider:'HEALTHKIT',activityId:act,quality:'WEARABLE_FULL'},canonicalActivityId:act});
const fix=(row,extra={},when=dx+'T14:00:00Z')=>({...row,correctionOf:row.eventId,correctedAt:when,reportedAt:when,...extra});
/** The base record: Y (session sy, 15 days ago; with `watchY` its watch report Yw carries activity hk-y) and X (session sx, 5 days ago). */
const baseRecord=({watchY=false}={})=>{const Y=watchY?rep('Yw','sy',dy,WATCH('hk-y')):rep('Y','sy',dy),X=rep('X','sx',dx);return {Y,X,l1:rec(N([Y,X],T1))};};
const inForce=(r,id)=>r.filter(o=>o.eventId===id&&o.superseded!==true);
const view=o=>o&&({eventId:o.eventId,sessionId:o.sessionId??null,actual:o.actual,response:o.response,parts:o.provenance?.parts??null,conflicted:o.conflicted??false,superseded:o.superseded??false});
/** What a refused report leaves: the same as the same report with no correctionOf (a plain conflicting report). */
const asPlain=c=>{const {correctionOf:_c,...p}=c;return p;};
const same=(a,b)=>assert.deepEqual({record:rec(a).map(view),conflicts:a.conflicts,q:[...a.quarantinedIdentities].sort()},{record:rec(b).map(view),conflicts:b.conflicts,q:[...b.quarantinedIdentities].sort()});
const runs=r=>factsFromLedger(r,{athleteId:ATH},VALUES).length;
const READY=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const ready=(daysAgo,ath=ATH)=>readinessFact({athleteId:ath},{event:{id:'ready-s2'},readiness:{}},shift(DAY,-daysAgo)+'T08:00:00.000Z',READY,null);
const restart=record=>{const r=restartIntake({intake:{asOf:DAY,athlete:{id:ATH,recent:{runMinutesPerWeek:600,runDaysPerWeek:7}}},record:json(record),asOf:DAY,screen:()=>({status:'NONCLINICAL'}),athleteId:ATH});return {status:r.status,readinessDeclared:r.facts?.pause?.readinessDeclared,recent:r.intake?.athlete?.recent??null};};

// ---------- SEC-R2-03: valid corrections still replace (cases 1-4) ----------
test('1-4: a valid correction replaces its original: done, not done, duration, effort and recovery; the original stays as history',()=>{
 const X=rep('X','sx',dx),undone=rep('X','sx',dx,{actual:{completed:false,minutes:0}});
 for(const [label,orig,actual,response] of [['execution',undone,{completed:true,minutes:35},U],['not done',X,{completed:false,minutes:0},U],['duration',X,{completed:true,minutes:30},U],
  ['effort and recovery',X,{completed:true,minutes:40},{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}]]){
  const l1=rec(N([orig],T1)),n=N([fix(orig,{eventId:'X2',actual,response})],T2,l1),r=rec(n);
  assert.deepEqual(n.excluded,[],label);
  assert.deepEqual(n.superseded.map(e=>[e.eventId,e.supersededBy]),[['X','X2']],label);
  assert.deepEqual([inForce(r,'X2')[0]?.actual,inForce(r,'X').length,r.find(o=>o.eventId==='X')?.supersededBy],[actual,0,'X2'],label+': the correction is in force, the original kept as history');
  assert.deepEqual(inForce(r,'X2')[0].response,response,label);
 }
});

// ---------- SEC-R2-03: refused corrections (cases 5-8, 13) ----------
test('5 (SEC-R2-03 A): a correction reusing another session\'s event id is refused and leaves the original in force, as it was',()=>{
 const {X,l1}=baseRecord(),c=fix(X,{eventId:'Y',actual:{completed:true,minutes:45}});
 const n=N([c],T2,l1),control=N([],T2,l1),r=rec(n);
 assert.deepEqual(n.excluded.map(e=>e.reason),['EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'],'still refused');
 assert.deepEqual(n.superseded,[],'nothing replaced (FREEZE-3: X marked replaced by Y)');
 assert.deepEqual(view(inForce(r,'X')[0]),view(inForce(rec(control),'X')[0]),'X in force, as it was');
 same(n,N([asPlain(c)],T2,l1));
 assert.equal(runs(r),runs(rec(N([asPlain(c)],T2,l1))),'run history (calibration, forecast, pace) as for the plain report');
 assert.ok(inForce(r,'X').length===1&&runs(r)>=1,'the session stays a run');
});
test('6 (SEC-R2-03 B): a correction carrying another session\'s watch activity is refused and leaves the original in force',()=>{
 const {X,l1}=baseRecord({watchY:true}),c=fix(X,{eventId:'X2',actual:{completed:true,minutes:45},...WATCH('hk-y')});
 const n=N([c],T2,l1),r=rec(n);
 assert.deepEqual(n.excluded.map(e=>e.reason),['ACTIVITY_BOUND_TO_TWO_SESSIONS']);
 assert.deepEqual(n.superseded,[],'nothing replaced (FREEZE-3: X marked replaced by X2)');
 assert.deepEqual(view(inForce(r,'X')[0]),view(inForce(rec(N([],T2,l1)),'X')[0]));
 same(n,N([asPlain(c)],T2,l1));
});
test('7-8: a correction of an event the record does not hold, or of another athlete, is refused and changes nothing',()=>{
 const {X,l1}=baseRecord(),control=N([],T2,l1);
 for(const [c,why] of [[{...fix(X,{eventId:'X2'}),correctionOf:'nowhere'},'INVALID_CORRECTION_CHAIN'],[fix(X,{eventId:'X2',athleteId:'someone-else'}),'ATHLETE_MISMATCH']]){
  const n=N([c],T2,l1);assert.deepEqual(n.excluded.map(e=>e.reason),[why]);same(n,control);
 }
});
test('13: a partly malformed correction is refused and changes nothing; one reusing its own original\'s id with other facts is the event-id conflict, the original kept',()=>{
 const {X,l1}=baseRecord(),control=N([],T2,l1);
 for(const [extra,why] of [[{actual:{completed:true,minutes:'x'}},'INVALID_ACTUAL'],[{actual:{minutes:30}},'ACTUAL_COMPLETION_REQUIRED'],[{response:{...U,recovery:'MAYBE'}},'INVALID_RESPONSE']]){
  const n=N([fix(X,{eventId:'X2',...extra})],T2,l1);assert.deepEqual(n.excluded.map(e=>e.reason),[why]);same(n,control);
 }
 const n=N([fix(X,{actual:{completed:true,minutes:20}})],T2,l1),r=rec(n);
 assert.deepEqual(n.excluded.map(e=>e.reason),['EVENT_ID_REUSED_WITH_DIFFERENT_FACTS']);
 assert.deepEqual([n.superseded,inForce(r,'X').length,inForce(r,'X')[0].actual.minutes],[[],1,40],'FREEZE-3: X marked replaced by itself and gone');
 same(n,N([asPlain(fix(X,{actual:{completed:true,minutes:20}}))],T2,l1));
});

// ---------- chains, duplicates, late corrections, restore (cases 9-12, 14) ----------
test('9: a correction that names an already replaced report and resolves a conflict is in force, never merged into the row it retires',()=>{
 const X=rep('X','sx',dx,{observedAt:dx+'T09:00:00Z'}),l1=rec(N([X],T1));
 // C1 replaces X; C2 (also naming X) disputes C1: a conflict on the session; C3 (naming X too) resolves it, agreeing with C1.
 const C1=fix(X,{eventId:'C1',actual:{completed:true,minutes:45}}),C2=fix(X,{eventId:'C2',actual:{completed:true,minutes:20}},dx+'T14:10:00Z'),C3=fix(X,{eventId:'C3',actual:{completed:true,minutes:45}},dx+'T14:20:00Z');
 const n=N([C1,C2,C3],T2,l1),r=rec(n);
 assert.deepEqual(n.excluded.map(e=>e.eventId+':'+e.reason),['C2:DUPLICATE_CONFLICT_QUARANTINED']);
 assert.equal(r.filter(o=>o.sessionId==='sx'&&o.superseded!==true).length,1,'the session has a row in force (FREEZE-3: none, C3 merged into the retired C1)');
 assert.deepEqual([inForce(r,'C3')[0]?.actual.minutes,r.find(o=>o.eventId==='C1')?.supersededBy,r.find(o=>o.eventId==='X')?.supersededBy],[45,'C3','C1'],'C3 in force; the chain kept as history');
 assert.equal(runs(r),1);
 // Out of chain, for another execution: refused, nothing changes.
 const bad=fix(X,{eventId:'C4',sessionId:'other'},dx+'T14:30:00Z');same(N([bad],T2,l1),N([],T2,l1));
});
test('10: a chain of corrections replaces in order and stays auditable; a refused correction of its head leaves the head in force',()=>{
 const {Y,X,l1}=baseRecord(),C1=fix(X,{eventId:'C1',actual:{completed:true,minutes:30}}),l2=rec(N([C1],T2,l1));
 const C2=fix(C1,{eventId:'C2',actual:{completed:false,minutes:0}},dx+'T16:00:00Z'),l3=rec(N([C2],T3,l2));
 assert.deepEqual([l3.find(o=>o.eventId==='X').supersededBy,l3.find(o=>o.eventId==='C1').supersededBy,inForce(l3,'C2').length],['C1','C2',1]);
 const n=N([fix(C2,{eventId:Y.eventId,actual:{completed:true,minutes:25}},dx+'T18:30:00Z')],dx+'T19:00:00Z',l3);
 assert.deepEqual([n.excluded.map(e=>e.reason),n.superseded,inForce(rec(n),'C2').length],[['EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'],[],1]);
});
test('11: an admitted correction sent again is a replay: nothing more is replaced, no credit is added',()=>{
 const {X,l1}=baseRecord(),C=fix(X,{eventId:'X2',actual:{completed:true,minutes:30}}),l2=rec(N([C],T2,l1));
 for(const prior of [l2,json(l2)]){const n=N([C],T3,prior);
  assert.deepEqual([n.excluded,n.superseded,n.duplicates.map(d=>d.reason)],[[],[],['EXACT_REPLAY']]);
  assert.deepEqual(rec(n).map(view),rec(N([],T3,prior)).map(view));assert.equal(runs(rec(n)),runs(l2));}
 // In the same batch twice: one replacement, one replay.
 const twice=N([C,C],T2,l1);assert.deepEqual([twice.superseded.length,twice.duplicates.length,inForce(rec(twice),'X2').length],[1,1,1]);
});
test('12: a late correction (two reviews later) still replaces; a late refused one still changes nothing',()=>{
 const {X,l1}=baseRecord(),l2=rec(N([],dx+'T20:00:00Z',l1)),late=shift(DAY,-1)+'T09:00:00Z',l3=rec(N([],late,l2));
 const ok=N([fix(X,{eventId:'X2',actual:{completed:true,minutes:30}},shift(DAY,-1)+'T08:00:00Z')],late,l3);
 assert.deepEqual(ok.superseded.map(e=>e.eventId),['X']);
 const bad=N([fix(X,{eventId:'Y',actual:{completed:true,minutes:30}},shift(DAY,-1)+'T08:00:00Z')],late,l3);
 assert.deepEqual([bad.superseded,inForce(rec(bad),'X').length],[[],1]);
});
test('14: a refused correction after the record is stored and restored, then the record normalized again and again: stable, nothing accumulates',()=>{
 const {X,l1}=baseRecord(),c=fix(X,{eventId:'Y',actual:{completed:true,minutes:45}});
 let r=rec(N([c],T2,json(l1)));const first=json(r);
 for(let i=0;i<3;i++){const n=N([c],dx+'T2'+i+':00:00Z',json(r));r=rec(n);assert.deepEqual(n.superseded,[]);}
 assert.deepEqual(r.map(view),first.map(view),'the same record after three more reviews with the same refused report');
 assert.deepEqual(rec(N([],DAY+'T09:00:00Z',json(r))).map(view),r.map(view),'and once more with nothing new');
});

test('11: a second correction of an already corrected part, reusing the merged row\'s event id, is the event-id conflict: never a second row in force',()=>{
 const b={athleteId:ATH,sessionId:'sm',occurrenceDate:dx,observedAt:dx+'T09:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U};
 const M={...b,eventId:'M',reportedAt:dx+'T12:00:00Z',actual:{completed:true,minutes:40},source:{provider:'MANUAL'}},W={...b,eventId:'W',reportedAt:dx+'T12:05:00Z',actual:{completed:true,minutes:40},...WATCH('hk-m')};
 const l1=rec(N([M,W],T1)),n=N([fix(W,{eventId:'C',actual:{completed:true,minutes:41}}),fix(W,{eventId:'M',actual:{completed:true,minutes:39}},dx+'T14:10:00Z')],T2,l1),r=rec(n);
 assert.deepEqual(n.excluded.map(e=>e.eventId+':'+e.reason),['M:EVENT_ID_REUSED_WITH_DIFFERENT_FACTS']);
 assert.equal(r.filter(o=>o.sessionId==='sm'&&o.superseded!==true).length,1,'one row in force on the session (FREEZE-3: two, the session counted twice)');
 // Two corrections of the same device part, the second naming the part the first already replaced: never a second row in force.
 for(const [minutes,why] of [[20,['C2:DUPLICATE_CONFLICT_QUARANTINED']],[40,[]]]){
  const m=N([fix(W,{eventId:'C1',actual:{completed:true,minutes:41}}),fix(W,{eventId:'C2',actual:{completed:true,minutes}},dx+'T14:10:00Z')],T2,l1);
  assert.deepEqual(m.excluded.map(e=>e.eventId+':'+e.reason),why,String(minutes));
  assert.equal(rec(m).filter(o=>o.sessionId==='sm'&&o.superseded!==true).length,1,minutes+': one row in force (FREEZE-3: C1 and C2 both in force, the session counted twice)');
 }
 // The same report the next review: the same answer (FREEZE-3 already refused it there).
 const l2=rec(N([fix(W,{eventId:'C',actual:{completed:true,minutes:41}})],T2,l1)),n2=N([fix(W,{eventId:'M',actual:{completed:true,minutes:39}},dx+'T16:00:00Z')],T3,l2);
 assert.deepEqual([n2.excluded.map(e=>e.reason),rec(n2).filter(o=>o.sessionId==='sm'&&o.superseded!==true).length],[['EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'],1]);
});

// ---------- merged voices and conflicting origins (cases 16-17) ----------
test('16: a merged row (athlete and watch): a refused correction of the athlete\'s part leaves the merged row with both parts in force',()=>{
 const b={athleteId:ATH,sessionId:'sm',occurrenceDate:dx,context:{sport:'RUN',sessionType:'RUN_EASY'},response:U};
 const M={...b,eventId:'M',reportedAt:dx+'T12:00:00Z',actual:{completed:true,minutes:40},source:{provider:'MANUAL'}},W={...b,eventId:'W',reportedAt:dx+'T12:05:00Z',actual:{completed:true,minutes:41},...WATCH('hk-m')};
 const Y=rep('Y','sy',dy),l1=rec(N([Y,M,W],T1)),c=fix(M,{eventId:'Y',actual:{completed:true,minutes:20}});
 const n=N([c],T2,l1),row=inForce(rec(n),'M')[0];
 assert.deepEqual([n.superseded,Object.keys(row?.provenance?.parts??{}).sort()],[[],['M','W']],'FREEZE-3: the merged row marked replaced by Y, both voices gone');
 same(n,N([asPlain(c)],T2,l1));
});
test('17: corrections from two origins that disagree stay a conflict with both voices; a refused third report removes neither',()=>{
 const b={athleteId:ATH,sessionId:'sm',occurrenceDate:dx,observedAt:dx+'T09:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U};
 const M={...b,eventId:'M',reportedAt:dx+'T12:00:00Z',actual:{completed:true,minutes:40},source:{provider:'MANUAL'}},W={...b,eventId:'W',reportedAt:dx+'T12:05:00Z',actual:{completed:true,minutes:40},...WATCH('hk-m')};
 const l1=rec(N([rep('Y','sy',dy),M,W],T1)),l2=rec(N([fix(W,{eventId:'W2',actual:{completed:true,minutes:41}}),fix(M,{eventId:'M2',actual:{completed:true,minutes:15}},dx+'T14:30:00Z')],T2,l1));
 const live=l2.filter(o=>o.sessionId==='sm'&&o.superseded!==true);
 assert.equal(live.length,1);assert.ok(live[0].conflicted&&Object.keys(live[0].provenance.parts).length===2,'disputed: both voices on the row in force');
 const n=N([fix(live[0],{eventId:'Y',actual:{completed:true,minutes:10}},dx+'T16:00:00Z')],T3,l2),after=rec(n).filter(o=>o.sessionId==='sm'&&o.superseded!==true);
 assert.deepEqual([n.superseded,after.map(view)],[[],live.map(view)]);
});

// ---------- safety facts (case 18; SB-1; SEC-R2-04) ----------
test('18 (SEC-R2-04 through the normalizer): two manual rows with no session, the later one after a readiness declaration; its refused correction reusing the earlier id: the new stop is asked',()=>{
 const Y=rep('Y',null,dy,{observedAt:dy+'T09:00:00Z'}),X=rep('X',null,dx,{observedAt:dx+'T09:00:00Z'}),l1=rec(N([Y,X],T1));
 const n=N([fix(X,{eventId:'Y',actual:{completed:true,minutes:45}})],T2,l1),r=rec(n);
 assert.deepEqual([n.excluded.map(e=>e.reason),n.superseded,inForce(r,'X').length],[['EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'],[],1]);
 assert.equal(restart([ready(10),...r]).readinessDeclared,undefined,'FREEZE-3: true, the session after the declaration vanished');
 // Through restartProgram, with no stated reason: ASK.
 const base=sixteen({asOf:DAY,start:shift(DAY,1)}),id=base.athlete.id,mine=r.map(o=>({...o,athleteId:id}));
 const g=F.restartProgram({intake:base,record:json([ready(10,id),...mine]),referenceState:null,asOf:DAY+'T10:00:00-03:00',athleteId:id},DEV);
 assert.equal(g.status,'ASK',g.reason);assert.ok(g.missingInputs.some(k=>k.startsWith('athlete.pause.')));
});
test('18: a session stopped for a symptom keeps its voice after a refused correction: after a declaration the new stop is asked',()=>{
 const X=rep('X','sx',dx,{actual:{completed:false,minutes:20,stop:{reason:'SYMPTOM'}},response:{...U,recovery:'ADVERSE'}}),l1=rec(N([rep('Y','sy',dy),X],T1));
 const r=rec(N([fix(X,{eventId:'Y',actual:{completed:true,minutes:40},response:U})],T2,l1));
 assert.deepEqual(view(inForce(r,'X')[0]).actual,X.actual,'the stop and its reason stay in force');
 assert.equal(restart([ready(10),...r]).readinessDeclared,undefined);
});
test('SEC-R2-04 (records kept before this fix): a replaced row whose "replacement" shares no positive identity keeps its voice; the controls stay history',()=>{
 const norm=o=>rec(N([o],T1))[0],Y=norm(rep('Y',null,dy,{observedAt:dy+'T09:00:00Z'})),X=norm(rep('X',null,dx,{observedAt:dx+'T09:00:00Z'}));
 const orphan={...X,superseded:true,supersededBy:'Y',supersededAt:dx+'T14:00:00.000Z'};
 for(const record of [[Y,orphan],json(rec(N([],DAY+'T09:00:00Z',[Y,orphan])))])
  assert.equal(restart([ready(10),...record]).readinessDeclared,undefined,'FREEZE-3: true (null === null)');
 // Controls: the same manual report corrected (same provider, same instant) is history; so is a session-bound chain.
 const X2={...X,eventId:'X2',correctionOf:'X',actual:{completed:false,minutes:0}};
 assert.equal(restart([rep('Z','sz',shift(DAY,-20)),ready(10),{...X,superseded:true,supersededBy:'X2'},X2]).readinessDeclared,true,'a legitimate manual "not done": the declaration answers');
 const watchRow={...X2,provenance:{...X2.provenance,provider:'HEALTHKIT'}};
 assert.equal(restart([ready(10),{...X,superseded:true,supersededBy:'X2'},watchRow]).readinessDeclared,undefined,'another provider at the same instant is not the same report');
 const withSession={...X2,sessionId:'sq'};
 assert.equal(restart([ready(10),{...X,superseded:true,supersededBy:'X2'},withSession]).readinessDeclared,undefined,'a row of a session does not replace a manual row with none');
});
test('SEC-R2-01 successor: the two shapes the normalizer wrote as orphans (FREEZE-3) now keep the original in force; the stop after the declaration is still asked',()=>{
 for(const [watchY,c] of [[false,X=>fix(X,{eventId:'Y',actual:{completed:true,minutes:45}})],[true,X=>fix(X,{eventId:'X2',actual:{completed:true,minutes:45},...WATCH('hk-y')})]]){
  const {X,l1}=baseRecord({watchY}),r=rec(N([c(X)],T2,l1));
  assert.ok(inForce(r,'X').length===1&&!r.some(o=>o.sessionId==='sx'&&o.superseded===true),'no orphan is written');
  assert.equal(restart([ready(10),...r]).readinessDeclared,undefined);assert.equal(restart([ready(10),...json(r)]).readinessDeclared,undefined);
 }
});

// ---------- consumers through the composed engine (weekly review, strength, run history, restart; case 15) ----------
function journey(kind,plain=false){
 const c=client(S);c.onboard(athleteA({weeks:8,id:'secr2'}));const ss=liveSessions(c.env,0),day=addDays(c.env.program.startDate,6);
 c.review('WEEKLY_REVIEW',at(day),{eligibility:ELIG(day),observations:ss.map(s=>reportOf(c.env,s))},'w0');
 const d8=addDays(day,2),x=id=>c.env.actualLedger.find(o=>o.eventId===id&&!o.superseded);
 const [target,reuse]=kind==='RUN'?['aif-w0-run-d3','aif-w0-run-d1']:['aif-w0-str-d2','aif-w0-str-d5'],t=x(target);
 if(kind){const bad={sessionId:t.sessionId,occurrenceDate:t.localDate,eventId:reuse,correctionOf:target,correctedAt:at(d8,'07:00'),reportedAt:at(d8,'07:00'),actual:{...t.actual,minutes:t.actual.minutes-5},response:t.response};
  c.review('WEEKLY_REVIEW',at(d8,'20:00'),{eligibility:ELIG(d8),observations:[plain?asPlain(bad):bad]},'bad');}
 return c;
}
const reading=c=>{const p=c.probe('WEEKLY_REVIEW',at(addDays(c.env.program.startDate,13)),{eligibility:ELIG(addDays(c.env.program.startDate,13))},'p');
 const d=addDays(c.env.program.startDate,10),upd={...athleteA({weeks:8,id:'secr2'}),asOf:d,startDate:addDays(d,3)};upd.athlete.eligibility=ELIG(d);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 const g=S.restartProgram({intake:upd,record:c.env.actualLedger,referenceState:c.env.referenceState,asOf:at(d,'10:00'),athleteId:c.env.program.athleteId,runEvidenceRecord:c.env.runEvidenceRecord,runFormatRecord:c.env.runFormatRecord,runHistoryRecord:c.env.runHistoryRecord});
 return {live:c.env.actualLedger.filter(o=>!o.fact&&!o.superseded).map(o=>o.eventId).sort(),replaced:c.env.actualLedger.filter(o=>o.superseded).length,status:p.status,action:p.action,evidence:p.weekEvidence,strength:p.strengthExposure,
  runs:factsFromLedger(c.env.actualLedger,{athleteId:c.env.program.athleteId},VALUES).length,restart:g.status,week0:g.program?.weeks?.[0]?.sessions?.map(s=>[s.sport,s.prescription?.minutes??null])};};
test('15 and consumers: a refused correction of a run or a strength session, through the engine: the weekly review, strength exposure, run history and restart read what the same plain report gives',()=>{
 const none=reading(journey(null));
 for(const kind of ['RUN','STRENGTH']){
  const bad=reading(journey(kind)),plain=reading(journey(kind,true));
  assert.deepEqual(bad,plain,kind);
  assert.equal(bad.replaced,0,kind+': nothing replaced (FREEZE-3: the corrected session marked replaced and gone)');
  assert.deepEqual(bad.live,none.live,kind+': every session still has its row in force');
 }
});
test('15: a refused correction of a session of the plan a restart replaced, in the new plan\'s review: the old session stays in force',()=>{
 const c=journey(null),old=c.env.actualLedger.find(o=>o.eventId==='aif-w0-run-d3'),d=addDays(c.env.program.startDate,10),upd={...athleteA({weeks:8,id:'secr2'}),asOf:d,startDate:addDays(d,3)};
 upd.athlete.eligibility=ELIG(d);upd.athlete.pause={reasonCategory:'SCHEDULE',nonclinical:true,weeks:0};
 assert.equal(c.restart(upd,at(d,'10:00')).status,'PROPOSED');
 const d2=addDays(c.env.program.startDate,1),bad={sessionId:old.sessionId,occurrenceDate:old.localDate,eventId:'aif-w0-run-d1',correctionOf:'aif-w0-run-d3',correctedAt:at(d2,'07:00'),reportedAt:at(d2,'07:00'),actual:{completed:true,minutes:10},response:old.response};
 c.review('WEEKLY_REVIEW',at(d2,'20:00'),{eligibility:ELIG(d2),observations:[bad]},'bad-old');
 assert.equal(c.env.actualLedger.filter(o=>o.eventId==='aif-w0-run-d3'&&!o.superseded).length,1);
 assert.equal(c.env.actualLedger.filter(o=>o.superseded).length,0);
});

// ---------- invariants on generated records (seeded; determinism) ----------
test('generated records (seeded): no pass writes an orphan, no row in force is lost under arrival order, and the result is deterministic',()=>{
 let s=20261119;const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;},pick=a=>a[Math.floor(rnd()*a.length)];
 const identity=o=>o.sessionId?'session:'+o.sessionId:'activity:'+(o.canonicalActivityId??o.source?.activityId??(o.provenance?.provider??'MANUAL')+'@'+o.observedAt);
 const holds=(rows,R)=>rows.some(x=>x!==R&&(x.eventId===R.supersededBy||(x.provenance?.mergedSourceIds??[]).includes(R.supersededBy))&&identity(x)===identity(R));
 const A=[{completed:true,minutes:40},{completed:true,minutes:41},{completed:true,minutes:20},{completed:false,minutes:0},{completed:true,minutes:45}];
 let passes=0;
 for(let k=0;k<400;k++){
  let t=0;const clock=()=>new Date(Date.parse(shift(DAY,-1)+'T00:00:00Z')+(t++)*60000).toISOString(),ev=[],sessions=[];
  for(let i=0;i<2+Math.floor(rnd()*3);i++)sessions.push({sid:rnd()<0.65?'s'+i:null,act:rnd()<0.5?'hk-'+i:null,day:shift(DAY,-(2+i*3))});
  for(const [i,x] of sessions.entries()){const b={athleteId:ATH,...(x.sid?{sessionId:x.sid}:{}),observedAt:x.day+'T09:00:00Z',context:{sport:'RUN',sessionType:'RUN_EASY'},response:U};
   ev.push({...b,eventId:'M'+i,reportedAt:clock(),actual:{...pick(A.slice(0,3))},source:{provider:'MANUAL'}});
   if(x.act&&rnd()<0.8)ev.push({...b,eventId:'W'+i,reportedAt:clock(),actual:{...pick(A.slice(0,3))},...WATCH(x.act)});}
  for(let j=0;j<1+Math.floor(rnd()*4);j++){const target=pick(ev),ids=ev.map(e=>e.eventId),r=rnd(),when=clock();
   const c={...target,eventId:r<0.15?pick(ids):r<0.22?target.eventId:'C'+k+'-'+j,correctionOf:target.eventId,correctedAt:when,reportedAt:when,actual:rnd()<0.07?{completed:true,minutes:'x'}:{...pick(A)}};
   const q=rnd();if(q<0.12){const o=pick(sessions.filter(z=>z.act));if(o)Object.assign(c,WATCH(o.act));}else if(q<0.17)c.athleteId='someone-else';else if(q<0.22)c.correctionOf=pick(ids);
   ev.push(c);}
  const size=Math.ceil(ev.length/3);let prior=[];
  for(let p=0;p<3;p++){const batch=ev.slice(p*size,(p+1)*size);if(!batch.length)continue;passes++;
   const asOf=DAY+'T0'+(p+1)+':00:00Z',n=N(batch,asOf,prior),again=N(batch,asOf,prior),rows=rec(n);
   assert.deepEqual(n,again,'deterministic');
   assert.deepEqual(n.supersededRows.filter(R=>n.superseded.some(e=>e.eventId===R.eventId&&e.supersededBy===R.supersededBy)&&!holds(rows,R)).map(R=>R.eventId),[],'no orphan written');
   for(const R of prior.filter(x=>x.superseded!==true)){const live=n.accepted.some(x=>x.eventId===R.eventId||(x.provenance?.mergedSourceIds??[]).includes(R.eventId)),kept=rows.find(x=>x.eventId===R.eventId&&x.superseded===true);
    assert.ok(live||kept&&holds(rows,kept),'row in force '+R.eventId+' is in force, merged or replaced by its execution');}
   prior=rows;}
 }
 assert.ok(passes>900);
});
