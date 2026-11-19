// C-F01-1 r2 (Founder mission of 2026-11-18, after COACHINGCORE-V1-CORE-SAFETY-FREEZE-2; SSCTR_F01_R1_ADDENDUM): what a restart reads from the
// record about sessions that took place. (i) C-Q08-1 bounds the stated exposure whenever the record holds this athlete's reports of sessions in
// the 28-day window, in force, replaced, not done or in conflict: to what it shows executed there (never left unbounded). (ii) A session every
// voice on its row says took place, only its amount disputed (a correction in conflict with a report still in force), is an execution for the
// pause, the last executed day and trainedAfter; its amount stays quarantined (zero minutes, no day, for the bound). (iii) A "not done" in force
// is no execution. SB-1: any voice in force that says a session took place after the readiness declaration is training after it. These are the
// successors of the open-labelled tests of v1core-c2f01-restart-sizing.test.mjs (C-F01-1 r2 (iv)). Synthetic athletes only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {restartIntake,readReadiness,readinessFact,READINESS_SIGNS} from '../src/v1-f08.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {factsFromLedger} from '../src/v1-run-history.mjs';
import {F,DEV,VALUES,sixteen} from './v1rws-helpers.mjs';

const ATH='ath-r2',DAY='2026-11-10',UNKNOWN={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN'};
const STATED={runMinutesPerWeek:600,runDaysPerWeek:7},intake=(recent=STATED,pause)=>({asOf:DAY,athlete:{id:ATH,recent,...(pause?{pause}:{})}});
const screen=()=>({status:'NONCLINICAL'});
const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
let seq=0;
const run=(daysAgo,minutes,extra={})=>{const d=shift(DAY,-daysAgo),id=extra.eventId??'r'+(++seq);return {eventId:id,athleteId:ATH,sessionId:extra.sessionId??'s-'+id,localDate:d,observedAt:d+'T09:00:00.000Z',context:{sport:'RUN',sessionType:'RUN_EASY'},actual:{completed:true,minutes},response:UNKNOWN,provenance:{provider:'MANUAL'},...extra};};
const replaced=(row,by)=>({...row,superseded:true,supersededBy:by.eventId,supersededAt:by.localDate+'T20:00:00.000Z'});
const corr=(row,actual,k=1)=>({...row,eventId:row.eventId+'-c'+k,correctionOf:row.eventId,correctedAt:row.localDate+'T20:00:00.000Z',actual:{...row.actual,...actual}});
const NOT_DONE={completed:false,minutes:0};
/** The record after `n` reports of one execution corrected to "not done", as hand-built rows (the replaced original kept as history). */
const undone=row=>{const c=corr(row,NOT_DONE);return [replaced(row,c),c];};
const read=(record,i=intake(),asOf=DAY)=>{const r=restartIntake({intake:i,record,asOf,screen,athleteId:ATH});return {status:r.status,recent:r.intake?.athlete?.recent??null,pause:r.facts?.pause??null,bounded:r.carried?.boundedByRecord??null,lastExecuted:r.carried?.priorCapacity?.lastExecutedDay??null,lastBySport:r.carried?.priorCapacity?.lastExecutedBySport??null};};
const json=x=>JSON.parse(JSON.stringify(x));
const ZERO={runMinutesPerWeek:0,runDaysPerWeek:0},BOTH=['recent.runMinutesPerWeek','recent.runDaysPerWeek'];

/**
 * Through the normalizer, as the engine writes it: one session `daysAgo` reported by the athlete (A) and imported from the watch (W), merged;
 * then the athlete corrects A to `fix`. Agreeing, the correction is the row in force (with W's part); disagreeing, it is in conflict
 * (CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE) and carries both voices. `watch` is what the watch says.
 */
function engine(daysAgo,fix,{watch={completed:true,minutes:50},id='x',response=UNKNOWN,watchResponse=UNKNOWN}={}){
 const d=shift(DAY,-daysAgo),b={athleteId:ATH,sessionId:'s'+id,occurrenceDate:d,context:{sport:'RUN',sessionType:'RUN_EASY'},response:UNKNOWN};
 const A={...b,eventId:'A'+id,reportedAt:d+'T12:00:00Z',actual:{completed:true,minutes:50},source:{provider:'MANUAL'}};
 const W={...b,eventId:'W'+id,reportedAt:d+'T12:05:00Z',actual:watch,response:watchResponse,source:{provider:'HEALTHKIT',activityId:'hk-'+id,quality:'WEARABLE_FULL'},canonicalActivityId:'hk-'+id};
 const o={athleteId:ATH,asOf:d+'T13:00:00Z',maximumAgeDays:36500},n1=normalizeObservations([A,W],o),l1=[...n1.accepted,...n1.supersededRows];
 if(fix===null)return l1;
 const n2=normalizeObservations([{...A,eventId:'A'+id+'2',correctionOf:'A'+id,correctedAt:d+'T14:00:00Z',reportedAt:d+'T14:00:00Z',actual:fix,response}],{...o,asOf:d+'T15:00:00Z',prior:l1});
 return [...n2.accepted,...n2.supersededRows];
}
/** A direct conflict, no correction: the app says 50, the watch 20; the normalizer keeps the first report, flagged, and refuses the second. */
function direct(daysAgo,{watch={completed:true,minutes:20},id='dc'}={}){
 const d=shift(DAY,-daysAgo),b={athleteId:ATH,sessionId:'s'+id,occurrenceDate:d,context:{sport:'RUN',sessionType:'RUN_EASY'},response:UNKNOWN};
 const n=normalizeObservations([{...b,eventId:'A'+id,reportedAt:d+'T12:00:00Z',actual:{completed:true,minutes:50},source:{provider:'MANUAL'}},{...b,eventId:'W'+id,reportedAt:d+'T12:05:00Z',actual:watch,source:{provider:'HEALTHKIT',activityId:'hk-'+id,quality:'WEARABLE_FULL'},canonicalActivityId:'hk-'+id}],{athleteId:ATH,asOf:d+'T13:00:00Z',maximumAgeDays:36500});
 return [...n.accepted,...n.supersededRows];
}
const live=rec=>rec.filter(o=>!o.fact&&o.superseded!==true);
const READY_VALUE=readReadiness({declaredRecovered:true,sports:{RUN:{ready:true}},warningSigns:Object.fromEntries(READINESS_SIGNS.map(k=>[k,false]))},{programmed:['RUN']}).value;
const ready=(daysAgo,id='ready-r2')=>readinessFact({athleteId:ATH},{event:{id},readiness:{}},shift(DAY,-daysAgo)+'T08:00:00.000Z',READY_VALUE,null);

// ---------- Problem A: C-Q08-1 when the record holds reports but no execution in force (C-F01-1 r2 (i)) ----------
test('A1: a new athlete with no record: unknown stays unknown, the stated exposure stands (the self-reported cold start)',()=>{
 const r=read([]);
 assert.deepEqual([r.recent,r.bounded,r.pause,r.lastExecuted],[STATED,[],null,null]);
 assert.deepEqual(read([],intake({})).recent,{},'an exposure the intake does not state is never made up');
});
test('A2: a valid history bounds as before (unchanged)',()=>{
 const rec=Array.from({length:8},(_,i)=>run(2+i*3,50));
 assert.deepEqual([read(rec).recent,read(rec).bounded],[{runMinutesPerWeek:100,runDaysPerWeek:2},BOTH]);
});
test('A3-A4: one execution corrected to "not done" among others; every execution corrected to "not done" (shape A): bounded to the window, 0/0',()=>{
 const rest=Array.from({length:7},(_,i)=>run(2+i*3,50)),x=run(1,50),some=[...rest,...undone(x)];
 assert.deepEqual(read(some).recent,{runMinutesPerWeek:88,runDaysPerWeek:2});
 const only=run(3,50),a=undone(only),r=read(a);
 // FREEZE-2 left 600/7 unbounded here (and d92aa88 bounded 13/1 from the replaced row alone). The record covers the window and shows 0.
 assert.deepEqual([r.recent,r.bounded,r.pause,r.lastExecuted],[ZERO,BOTH,null,null]);
 assert.deepEqual(read([{...only,actual:NOT_DONE}]),r,'as the same session reported "not done" directly');
 assert.deepEqual(read(json(a)),r,'and after the client stored and restored the record');
 // The replaced report only opens the bound: it is never counted as training.
 assert.deepEqual(read([...a,run(40,50)]).recent,ZERO);
});
test('A5: reports in conflict (P4, through the normalizer): bounded to 0/0, the disputed amount never counted',()=>{
 const p4=engine(3,{completed:true,minutes:20});
 assert.ok(live(p4).every(o=>o.conflicted===true&&o.provenance.conflict==='CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE'));
 const r=read(p4);
 assert.deepEqual([r.recent,r.bounded],[ZERO,BOTH]);
 // With another execution in the window, only that execution counts (13 min/week, 1 day), the disputed session neither its minutes nor its day.
 assert.deepEqual(read([...p4,run(13,50)]).recent,{runMinutesPerWeek:13,runDaysPerWeek:1});
});
test('A6-A7: replaced rows and duplicates: each execution once, at its value in force (CORE-C2-F01 unchanged)',()=>{
 const rest=Array.from({length:7},(_,i)=>run(2+i*3,50)),x=run(1,50),c=corr(x,{minutes:60}),rec=[...rest,replaced(x,c),c];
 assert.equal(read(rec).recent.runMinutesPerWeek,Math.round((7*50+60)/4));
 assert.deepEqual(read([...rec,json(rest[0]),json(c)]),read(rec),'the same event twice counts once');
 const a=undone(run(3,50));
 assert.deepEqual(read([...a,...json(a)]),read(a),'a "not done" record held twice is still 0/0');
});
test('A8: late rows and a late correction (after a restart, stored and restored): read as the record in force',()=>{
 const x=run(9,50),rec=[...Array.from({length:3},(_,i)=>run(20-i*3,50)),x];
 const late=[...json(rec).filter(o=>o.eventId!==x.eventId),...undone(x)].reverse();
 assert.deepEqual(read(late).recent,{runMinutesPerWeek:Math.round(150/4),runDaysPerWeek:1});
 assert.equal(read(late).lastBySport.RUN,shift(DAY,-14));
});
test('A9: reports older than 28 days: an execution there bounds to 0/0 (unchanged); a "not done" alone there does not open the window',()=>{
 assert.deepEqual(read([run(40,50)]).recent,ZERO);
 const old=undone(run(40,50));
 assert.deepEqual([read(old).recent,read(old).bounded],[STATED,[]],'the window is the last 28 days (C-F01-1 r2 (i)); residual named for SSCTR');
});
test('A10-A11: the stated exposure is only ever lowered to the record, never raised',()=>{
 const a=undone(run(3,50));
 assert.deepEqual(read(a,intake({runMinutesPerWeek:0,runDaysPerWeek:0})).recent,ZERO);
 const rec=Array.from({length:8},(_,i)=>run(2+i*3,50));
 assert.deepEqual(read(rec,intake({runMinutesPerWeek:60,runDaysPerWeek:1})).recent,{runMinutesPerWeek:60,runDaysPerWeek:1});
 assert.deepEqual(read(a,intake({})).recent,{},'unknown stays unknown even when the record covers the window');
});
test('A12: the information to resolve a conflict is missing (a direct conflict keeps one voice): bounded, and no occurrence read',()=>{
 const dc=direct(3);
 assert.ok(live(dc).length===1&&live(dc)[0].conflicted===true);
 const r=read(dc);
 assert.deepEqual([r.recent,r.pause,r.lastExecuted],[ZERO,null,null]);
});
test('A e2e: through restartProgram, shapes A and P4 start from the record (RESTART, the class of 0 weekly minutes), not from the stated 300',()=>{
 const base=sixteen({asOf:DAY,start:shift(DAY,1)}),id=base.athlete.id;
 const go=record=>F.restartProgram({intake:{...base,athlete:{...base.athlete,pause:{nonclinical:true,reasonCategory:'SCHEDULE',weeks:1}}},record:json(record).map(o=>({...o,athleteId:id})),referenceState:null,asOf:DAY+'T10:00:00-03:00',athleteId:id},DEV);
 const cls=g=>JSON.stringify(g.proposal??g.program).match(/"class":"([A-Z_]+)"/)?.[1];
 const empty=go([]),a=go(undone(run(3,50))),p4=go(engine(3,{completed:true,minutes:20}).map(o=>({...o,athleteId:id})));
 assert.equal(cls(empty),'EASY_CURRENT','no record: the self-reported cold start');
 for(const g of [a,p4]){assert.equal(g.status,'PROPOSED',g.reason);assert.equal(cls(g),'RESTART');assert.deepEqual(g.restart.boundedByRecord,BOTH);}
});

// ---------- Problem B: an execution of disputed amount (C-F01-1 r2 (ii)) ----------
test('B1-B2: a session every voice says took place, only its amount disputed, is an execution for the pause and the last executed day',()=>{
 const p4=engine(3,{completed:true,minutes:20}),r=read(p4);
 assert.deepEqual([r.pause?.bySportDays?.RUN,r.lastExecuted,r.lastBySport.RUN],[3,shift(DAY,-3),shift(DAY,-3)]);
 // 20 days ago, nothing else: the record's pause is 2 weeks (FREEZE-2 read no pause at all).
 const far=read(engine(20,{completed:true,minutes:20}));
 assert.deepEqual([far.pause?.weeks,far.lastExecuted],[2,shift(DAY,-20)]);
 // With an older execution, the disputed session is the last one (FREEZE-2: 13 days from the older one).
 assert.equal(read([...p4,run(13,50)]).pause?.bySportDays?.RUN,3);
});
test('B3: the disputed amount does not reach calibration or history: the row stays in conflict, and no run fact is made of it',()=>{
 const p4=engine(3,{completed:true,minutes:20}),r=restartIntake({intake:intake(),record:p4,asOf:DAY,screen,athleteId:ATH});
 assert.deepEqual(r.carried.record,p4,'the record is returned as given');
 assert.equal(factsFromLedger(p4,{athleteId:ATH},VALUES).length,0,'run history (calibration, forecast, pace) reads no run from a row in conflict');
 assert.equal(factsFromLedger(engine(3,{completed:true,minutes:50}),{athleteId:ATH},VALUES).length,1,'control: the agreeing correction is a run');
});
test('B4-B5: occurrence itself disputed (a voice says not done), or one voice only on the record (direct conflict): not an execution',()=>{
 const notDone=engine(3,NOT_DONE);
 assert.ok(live(notDone).every(o=>o.conflicted===true),'the athlete says not done, the watch says 50: in conflict');
 assert.deepEqual([read(notDone).lastExecuted,read(notDone).pause],[null,null]);
 assert.equal(read([...notDone,run(13,50)]).pause?.bySportDays?.RUN,13);
 assert.equal(read([...direct(3),run(13,50)]).pause?.bySportDays?.RUN,13);
});
test('B6: only the response disputed (same minutes, recovery reported adverse against a compatible one): the session took place',()=>{
 const resp=engine(3,{completed:true,minutes:50},{response:{...UNKNOWN,recovery:'ADVERSE'},watchResponse:{...UNKNOWN,recovery:'COMPATIBLE'}});
 assert.ok(live(resp).length===1&&live(resp)[0].conflicted===true,'the correction is in conflict on the response');
 assert.deepEqual([read(resp).lastExecuted,read(resp).recent],[shift(DAY,-3),ZERO]);
});
test('B7: what a row must show to be read as a disputed execution (a forged or partial flag reads as no execution, and never raises the bound)',()=>{
 const one=run(3,50),c=corr(one,{minutes:20});
 const single={...c,conflicted:true,provenance:{provider:'MANUAL',conflict:'CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE',parts:{[c.eventId]:{actual:c.actual}}}};
 assert.equal(read([single]).lastExecuted,null,'one voice: occurrence not shown');
 const other={...single,provenance:{...single.provenance,conflict:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS',parts:{a:{actual:{completed:true,minutes:20}},b:{actual:{completed:true,minutes:50}}}}};
 assert.equal(read([other]).lastExecuted,null,'another kind of conflict: occurrence not shown');
 const two={...single,provenance:{...single.provenance,parts:{a:{actual:{completed:true,minutes:20}},b:{actual:{completed:true,minutes:50}}}}};
 assert.deepEqual([read([two]).lastExecuted,read([two]).recent],[shift(DAY,-3),ZERO],'every voice says done: an execution, its amount still not counted');
});
test('B persistence: a later review re-normalizes the record (carried rows): the disputed session keeps its reading',()=>{
 const p4=engine(3,{completed:true,minutes:20}),again=normalizeObservations([],{athleteId:ATH,asOf:DAY+'T08:00:00Z',prior:json(p4),maximumAgeDays:36500});
 const rec=[...again.accepted,...again.supersededRows];
 assert.deepEqual(read(rec),read(p4));
 assert.deepEqual(read(json(rec)),read(p4));
});

// ---------- Problem C: a "not done" in force is no execution (C-F01-1 r2 (iii)) ----------
test('C1-C4: done -> not done; done -> other minutes; several corrections; not done -> done',()=>{
 const before=run(13,50),x=run(3,50);
 assert.equal(read([before,...undone(x)]).lastExecuted,shift(DAY,-13),'done -> not done: no execution');
 const m=corr(x,{minutes:30});assert.deepEqual([read([before,replaced(x,m),m]).lastExecuted,read([before,replaced(x,m),m]).recent.runMinutesPerWeek],[shift(DAY,-3),20]);
 const c1=corr(x,NOT_DONE,1),c2=corr(c1,{completed:true,minutes:45},2),back=[before,replaced(x,c1),replaced(c1,c2),c2];
 assert.deepEqual([read(back).lastExecuted,read(back).recent.runMinutesPerWeek],[shift(DAY,-3),Math.round(95/4)],'done -> not done -> done 45');
 const d1=corr(x,{minutes:40},1),d2=corr(d1,NOT_DONE,2),gone=[before,replaced(x,d1),replaced(d1,d2),d2];
 assert.equal(read(gone).lastExecuted,shift(DAY,-13),'done -> 40 -> not done');
 const nd={...x,actual:NOT_DONE},fixed=corr(nd,{completed:true,minutes:50});
 assert.equal(read([before,replaced(nd,fixed),fixed]).lastExecuted,shift(DAY,-3),'not done -> validly corrected to done');
});
test('C5: a duplicate of the replaced execution (marked) is no execution; an unmarked stale copy is the custody residual C-F01-2',()=>{
 const before=run(13,50),x=run(3,50),[old,nd]=undone(x);
 assert.equal(read([before,old,json(old),nd]).lastExecuted,shift(DAY,-13));
 // Residual, unchanged (QRE-F01-03 / C-F01-2): a copy of the original without its mark is read as in force. The engine never writes it.
 assert.equal(read([before,old,nd,{...x}]).lastExecuted,shift(DAY,-3));
});
test('C6: a correction to "not done" that arrives after a restart: the next restart reads it',()=>{
 const before=run(13,50),x=run(3,50),first=restartIntake({intake:intake(),record:[before,x],asOf:DAY,screen,athleteId:ATH});
 assert.equal(first.carried.priorCapacity.lastExecutedDay,shift(DAY,-3));
 const later=[...json(first.carried.record).filter(o=>o.eventId!==x.eventId),...undone(x)];
 assert.equal(read(later,intake(),shift(DAY,1)).lastExecuted,shift(DAY,-13));
});
test('C7-C8: a device correction and a manual correction to "not done", through the normalizer',()=>{
 // The watch corrects its own import to not done while the athlete's report says done: in conflict, occurrence disputed, no execution.
 const d=shift(DAY,-3),b={athleteId:ATH,sessionId:'sv',occurrenceDate:d,context:{sport:'RUN',sessionType:'RUN_EASY'},response:UNKNOWN};
 const A={...b,eventId:'Av',reportedAt:d+'T12:00:00Z',actual:{completed:true,minutes:50},source:{provider:'MANUAL'}},W={...b,eventId:'Wv',reportedAt:d+'T12:05:00Z',actual:{completed:true,minutes:50},source:{provider:'HEALTHKIT',activityId:'hk-v',quality:'WEARABLE_FULL'},canonicalActivityId:'hk-v'};
 const o={athleteId:ATH,asOf:d+'T13:00:00Z',maximumAgeDays:36500},l1=(n=>[...n.accepted,...n.supersededRows])(normalizeObservations([A,W],o));
 const dev=(n=>[...n.accepted,...n.supersededRows])(normalizeObservations([{...W,eventId:'Wv2',correctionOf:'Wv',correctedAt:d+'T14:00:00Z',reportedAt:d+'T14:00:00Z',actual:NOT_DONE}],{...o,asOf:d+'T15:00:00Z',prior:l1}));
 assert.equal(read(dev).lastExecuted,null);
 // The athlete alone corrects to not done (no watch): the correction is the row in force, not done.
 const solo=(n=>[...n.accepted,...n.supersededRows])(normalizeObservations([A],o));
 const man=(n=>[...n.accepted,...n.supersededRows])(normalizeObservations([{...A,eventId:'Av2',correctionOf:'Av',correctedAt:d+'T14:00:00Z',reportedAt:d+'T14:00:00Z',actual:NOT_DONE}],{...o,asOf:d+'T15:00:00Z',prior:solo}));
 assert.ok(live(man).every(x=>x.conflicted!==true&&x.actual.completed===false));
 assert.deepEqual([read(man).lastExecuted,read(man).recent],[null,ZERO]);
});
test('C9: a correction outside its chain (another session) is refused by the normalizer: the execution stays in force',()=>{
 const d=shift(DAY,-3),A={athleteId:ATH,sessionId:'sa',occurrenceDate:d,context:{sport:'RUN',sessionType:'RUN_EASY'},response:UNKNOWN,eventId:'Aa',reportedAt:d+'T12:00:00Z',actual:{completed:true,minutes:50},source:{provider:'MANUAL'}};
 const o={athleteId:ATH,asOf:d+'T13:00:00Z',maximumAgeDays:36500},l1=(n=>[...n.accepted,...n.supersededRows])(normalizeObservations([A],o));
 const n2=normalizeObservations([{...A,sessionId:'other',eventId:'Aa2',correctionOf:'Aa',correctedAt:d+'T14:00:00Z',reportedAt:d+'T14:00:00Z',actual:NOT_DONE}],{...o,asOf:d+'T15:00:00Z',prior:l1});
 assert.ok(n2.excluded.some(x=>x.reason==='INVALID_CORRECTION_CHAIN'));
 assert.equal(read([...n2.accepted,...n2.supersededRows]).lastExecuted,d);
});
test('C10: a partially malformed row is no execution and does not open the bound',()=>{
 const bad=[{...run(3,50),actual:undefined},{...run(4,50),actual:{minutes:'abc'}}];
 assert.deepEqual([read([bad[0]]).recent,read([bad[0]]).lastExecuted],[STATED,null],'no report of a session: as no record');
 assert.equal(read([bad[1]]).lastExecuted,null);
});
test('C11: a record across plans A, B, C: an execution of plan A corrected to "not done" is none, those of B and C count',()=>{
 const a=run(20,50,{sessionId:'a.w1.r1'}),b=run(10,50,{sessionId:'rb0001.w0.r1'}),c=run(3,50,{sessionId:'rc0002.w0.r1'});
 const rec=[...undone(a),b,c];
 assert.deepEqual([read(rec).recent,read(rec).lastExecuted],[{runMinutesPerWeek:25,runDaysPerWeek:1},shift(DAY,-3)]);
});

// ---------- Problem D: the readiness declaration and a later session (SB-1, C-F01-1 r2 (ii)) ----------
test('D1: readiness, then a session of disputed amount after it: training after the declaration, so the new stop is screened (SB-1 asked)',()=>{
 const rec=[run(20,50),ready(10),...engine(6,{completed:true,minutes:20})],r=read(rec);
 assert.equal(r.status,'READY');
 assert.deepEqual([r.pause?.readinessDeclared,r.pause?.bySportDays?.RUN],[undefined,6],'FREEZE-2: readinessDeclared true, last executed day 20 days ago');
});
test('D2: readiness, then a run corrected to "not done": the declaration still answers the stop (QRE-F01-04 kept)',()=>{
 const rec=[run(20,50),ready(12),...undone(run(5,50))];
 assert.equal(read(rec).pause?.readinessDeclared,true);
});
test('D3-D4: readiness, then a disputed record where one voice says the athlete trained (direct conflict; watch against "not done"): asked',()=>{
 assert.equal(read([run(20,50),ready(10),...direct(6)]).pause?.readinessDeclared,undefined,'direct conflict after the declaration');
 assert.equal(read([run(20,50),ready(10),...engine(6,NOT_DONE)]).pause?.readinessDeclared,undefined,'the watch says done, the correction not done');
 // No execution shown anywhere: the declaration still does not stand in for the later stop.
 const none=read([ready(10),...direct(6)]);
 assert.deepEqual([none.pause?.weeks,none.pause?.readinessDeclared],[0,undefined]);
 assert.equal(read([ready(10)]).pause?.readinessDeclared,true,'control: a declaration and nothing after it');
});
test('D5: a disputed session before the declaration: the declaration answers the stop',()=>{
 assert.equal(read([...engine(20,{completed:true,minutes:20}),ready(10)]).pause?.readinessDeclared,true);
});
test('D6: through the intake: the reason of the new stop is asked when none is stated; a stated reason is screened as stated',()=>{
 const base=sixteen({asOf:DAY,start:shift(DAY,1)}),id=base.athlete.id,own=o=>({...o,athleteId:id});
 const rd=readinessFact({athleteId:id},{event:{id:'ready-d6'},readiness:{}},shift(DAY,-10)+'T08:00:00.000Z',READY_VALUE,null);
 const rec=[rd,...engine(6,{completed:true,minutes:20}).map(own)];
 const go=pause=>F.restartProgram({intake:{...base,athlete:{...base.athlete,...(pause?{pause}:{})}},record:json(rec),referenceState:null,asOf:DAY+'T10:00:00-03:00',athleteId:id},DEV);
 const asked=go(null);
 assert.equal(asked.status,'ASK',asked.reason);
 assert.ok(asked.missingInputs.some(k=>k.startsWith('athlete.pause.')),JSON.stringify(asked.missingInputs));
 assert.equal(go({nonclinical:true,reasonCategory:'SCHEDULE'}).status,'PROPOSED');
 // Control: the same session with no dispute (the correction agrees) is asked the same way; with no session after it, the declaration answers.
 const agreed=F.restartProgram({intake:base,record:json([rd,...engine(6,{completed:true,minutes:50}).map(own)]),referenceState:null,asOf:DAY+'T10:00:00-03:00',athleteId:id},DEV);
 assert.equal(agreed.status,'ASK',agreed.reason);
 const quiet=F.restartProgram({intake:base,record:json([rd]),referenceState:null,asOf:DAY+'T10:00:00-03:00',athleteId:id},DEV);
 assert.equal(quiet.status,'PROPOSED',quiet.reason);
});
test('D7: restarts A -> B -> C keep the safety facts: the record returned carries the declaration and the disputed session',()=>{
 const rec=[run(20,50),ready(10),...engine(6,{completed:true,minutes:20})];
 const b=restartIntake({intake:intake(),record:json(rec),asOf:DAY,screen,athleteId:ATH});
 assert.deepEqual(b.carried.record,json(rec));
 assert.equal(read(json(b.carried.record),intake(),shift(DAY,1)).pause?.readinessDeclared,undefined);
});
test('D8: a clinical break after the declaration still answers first, whatever the disputed rows',()=>{
 const brk={fact:'INTERRUPTION_DECLARED',eventId:'int-r2',athleteId:ATH,declaredAt:shift(DAY,-2)+'T08:00:00.000Z',interruption:{reasonCategory:'INJURY'}};
 assert.equal(read([run(20,50),ready(10),...engine(6,{completed:true,minutes:20}),brk]).status,'CLINICAL_HUMAN_REQUIRED');
});
test('D9: a row marked replaced with nothing in force behind it hides the session (custody residual C-F01-2, named for Security)',()=>{
 const x=run(6,50),forged={...x,superseded:true,supersededBy:'nowhere'};
 assert.equal(read([run(20,50),ready(10),forged]).pause?.readinessDeclared,true,'residual: the record must be the one the engine returned');
});
