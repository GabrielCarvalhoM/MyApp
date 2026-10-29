// DOMAIN_COACHING_R7-A.2: the break a return reports and the state the athlete had when it began (Founder request I1–I9, P1–P6). Each test
// names the invariant and the blocker it covers (QE-R7A1-09, QE-R7A1-10, SSCTR D59). Development authority only; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')];
const intake=({id,cls='KNOWN',athlete={},schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:cls==='NONE'?'NONE':'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:cls==='NONE'?0:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:cls==='KNOWN'?KNOWN:[],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7a2-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** An as-prescribed report observed on the session's day, or on `day` when given; `short` exercises miss their repetition target by two. */
function obs(p,s,day=s.date,short=[]){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:short.includes(e.id)?e.reps-2:e.reps,rir:e.rir}))}));
 return {eventId:`t7a2-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:day+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const step=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??[])}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true,hour='21:00:00')=>step(t,at(t.p,w,6,hour,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const report=(t,w,day,hour,keep)=>step(t,at(t.p,w,day,hour,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const start=(ia,weeks)=>{const g=generateProgram(intake(ia),opts);assert.ok(g.program,`${ia.id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(start,end,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(end)-Date.parse(start))/864e5)+1,startDate:start,endDate:end,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
const line=(P,w)=>P.weeks[w].sessions.map(s=>`d${s.day} ${s.sport} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''} ${s.prescription?(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):'-'}`);
const whole=(P,w)=>JSON.stringify({rows:P.weeks.slice(w).map((x,k)=>line(P,w+k)),states:P.stateTrace.slice(w+1)});
const strengthRows=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&(!from||s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
const lastReturn=P=>P.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
const liveReturns=P=>{const all=P.decisions.filter(d=>d.action==='REESTABLISH'),gone=new Set(all.map(d=>d.interruption?.supersedes).filter(Boolean));return all.filter(d=>!gone.has(d.eventId));};
/** Weeks 0-2 trained and reviewed, 3-4 untrained (the first break), then a 16-day return on Monday 06:00 of week 5 (re-entry that week). */
function afterFirstReturn(id){
 const t=start({id},3);weekly(t,3,()=>false);weekly(t,4,()=>false);
 const d0=t.p.weeks[5].startDate;step(t,at(t.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));
 return {t,d0,A:lastReturn(t.p)};
}
/** No strength row back at the dose before the first break: the pre-break known load at three sets or more. */
const preBreakDose=(P,w,from)=>strengthRows(P,w,from).filter(({e})=>e.load.mode==='KNOWN'&&e.sets>=3);

test('R7-A.2 I1/I3 (QE-R7A1-09): a separate break in the same week starts from the re-entry, never from before the first break',()=>{
 const {t,d0,A}=afterFirstReturn('t7a2-i3s');
 assert.equal(A.interruption.relation,'NEW');
 report(t,5,2,'05:00:00',s=>s.day<2);
 // A second break, Wednesday-Thursday, reported on Friday morning: a break of its own.
 const r=step(t,at(t.p,5,4,'06:00:00',brk(addDays(d0,2),addDays(d0,3)))),B=lastReturn(t.p);
 assert.equal(r.action,'REESTABLISH');assert.equal(B.interruption.relation,'NEW');assert.equal(B.interruption.supersedes,null);assert.equal(B.interruption.episode,B.eventId);
 assert.equal(B.interruption.stateAt.kind,'RETURN');assert.equal(B.interruption.stateAt.eventId,A.eventId,'the re-entry the first return set');
 assert.equal(liveReturns(t.p).length,2,'two breaks, two episodes');
 // Saturday's strength is still the return entry; the run stays in its return; nothing comes back at the pre-break dose.
 assert.ok(strengthRows(t.p,5,addDays(d0,5)).every(({e})=>e.exposure.kind==='RETURN_ENTRY'&&e.sets<=1&&e.rir>=4));
 assert.equal(t.p.stateTrace[6].run.mode,'RETURN');
 for(const w of [5,6])assert.deepEqual(preBreakDose(t.p,w,addDays(d0,5)),[],`week ${w}`);
});

test('R7-A.2 I3 (QE-R7A1-09): a separate break across the week boundary keeps the return steps and the run return',()=>{
 for(const [endWeek,endDay,reportDay] of [[6,1,2],[5,6,0]]){
  const {t,d0,A}=afterFirstReturn('t7a2-i3x');
  // Re-entry sessions before Friday executed; the week is reviewed; then a break from Friday.
  weekly(t,5,s=>s.day<4);
  const r=step(t,at(t.p,6,reportDay,'06:00:00',brk(addDays(d0,4),addDays(t.p.weeks[endWeek].startDate,endDay)))),B=lastReturn(t.p);
  assert.equal(r.action,'REESTABLISH');assert.equal(B.interruption.relation,'NEW');assert.equal(B.interruption.stateAt.eventId,A.eventId);
  // A short second break resumes the last completed doses: the re-entry, not the dose before the first break.
  assert.deepEqual(preBreakDose(t.p,6,t.p.weeks[6].startDate),[]);assert.deepEqual(preBreakDose(t.p,7,t.p.weeks[7].startDate),[]);
  assert.ok(Object.values(t.p.stateTrace[7].strength.exercises).some(e=>Number.isInteger(e.returnStep)),'the return steps go on');
  assert.equal(t.p.stateTrace[7].run.mode,'RETURN');assert.ok(Number.isInteger(t.p.stateTrace[7].run.returnStep));
  assert.ok(t.p.weeks[6].sessions.filter(s=>s.role==='LONG'&&live(s)).every(s=>s.prescription.durationMinutes<=25),'no long run back at the pre-break length');
 }
});

test('R7-A.2 I2: a newer report of the same break supersedes the earlier one, in the same week or a later one, and creates no new break',()=>{
 const t=start({id:'t7a2-i2'},5),w=5,d0=t.p.weeks[w].startDate;
 const first=brk(addDays(d0,-12),addDays(d0,3)),fix=brk(d0,addDays(d0,3));
 step(t,at(t.p,w,4,'21:00:00',first));const A=lastReturn(t.p);
 for(const [fw,day,hour] of [[w,5,'08:00:00'],[w+1,0,'07:00:00']]){
  const T=copy(t);if(fw>w)weekly(T,w,s=>s.day>=5);
  const r=step(T,at(T.p,fw,day,hour,fix)),B=lastReturn(T.p);
  assert.equal(r.action,'REESTABLISH');assert.equal(B.interruption.relation,'SAME_BREAK');assert.equal(B.interruption.supersedes,A.eventId);assert.equal(B.interruption.episode,A.eventId);
  assert.equal(liveReturns(T.p).length,1,'one break');
  // What preceded that break: the start of its week as it stood before the first report replaced it.
  assert.equal(B.interruption.stateAt.kind,'WEEK_START');assert.equal(B.interruption.stateAt.week,w);
  assert.ok(T.p.weeks.every(x=>(x.adaptations??[]).filter(a=>['RETURN_WAIT','SHORT_RETURN_EASY'].includes(a.kind)).every(a=>a.eventId===B.eventId||a.episode!==A.eventId)),'the earlier report’s adaptations are replaced');
 }
});

test('R7-A.2 I9 (QE-R7A1-10): a second short break never adopts the first one’s easy slot; a newer report of the same break keeps it',()=>{
 const slots=(P,w0)=>P.weeks.slice(w0,w0+3).flatMap(x=>x.sessions.filter(s=>/short break runs easy/.test(s.explanation??'')).map(s=>`${s.id}:${s.easedFor}`));
 const t=start({id:'t7a2-i9'},3),w=3,d0=t.p.weeks[w].startDate;
 step(t,at(t.p,w,0,'06:00:00',brk(addDays(d0,-6),addDays(d0,-1))));const A=lastReturn(t.p);
 report(t,w,2,'05:00:00',s=>s.day<=1);
 step(t,at(t.p,w,5,'06:00:00',brk(addDays(d0,2),addDays(d0,4))));const B=lastReturn(t.p);
 assert.equal(B.interruption.relation,'NEW');
 weekly(t,w,s=>s.day>=5);
 const tue=t.p.weeks[w+1].sessions.find(s=>s.sport==='RUN'&&s.day===1);
 assert.equal(tue.role,'EASY');assert.equal(tue.easedFor,B.eventId,'the second break’s own slot');
 assert.deepEqual(slots(t.p,w).sort(),[`w${w}-run-d1:${A.eventId}`,`w${w+1}-run-d1:${B.eventId}`].sort(),'one slot per break');
 // A newer report of the first break the same morning keeps its slot: one slot, the first break's.
 const c=start({id:'t7a2-i9c'},3),e0=c.p.weeks[w].startDate;
 step(c,at(c.p,w,0,'06:00:00',brk(addDays(e0,-6),addDays(e0,-1))));const C1=lastReturn(c.p);
 step(c,at(c.p,w,0,'07:00:00',brk(addDays(e0,-5),addDays(e0,-1),{reason:'Business trip'})));
 assert.equal(lastReturn(c.p).interruption.relation,'SAME_BREAK');assert.deepEqual(slots(c.p,w),[`w${w}-run-d1:${C1.eventId}`]);
 // A newer report of the first break made the next week, after its slot was run, keeps that slot: no second slot for one break.
 const n=start({id:'t7a2-i9n'},3),n0=n.p.weeks[w].startDate;
 step(n,at(n.p,w,0,'06:00:00',brk(addDays(n0,-6),addDays(n0,-1))));const N1=lastReturn(n.p);weekly(n,w);
 step(n,at(n.p,w+1,0,'07:00:00',brk(addDays(n0,-5),addDays(n0,-1),{reason:'Business trip'})));
 assert.equal(lastReturn(n.p).interruption.relation,'SAME_BREAK');assert.deepEqual(slots(n.p,w),[`w${w}-run-d1:${N1.eventId}`]);
 // A separate short break reported while the first one's slot is still ahead: that slot stays the first break's; the new break takes the
 // next quality slot (a run eased by another adaptation is no longer a quality slot, SSCTR R7A1-r2 reading a).
 const s=start({id:'t7a2-i9s'},3),s0=s.p.weeks[w].startDate;
 step(s,at(s.p,w,0,'06:00:00',brk(addDays(s0,-6),addDays(s0,-1))));const S1=lastReturn(s.p);
 step(s,at(s.p,w,1,'05:00:00',brk(s0,s0)));const S2=lastReturn(s.p);assert.equal(S2.interruption.relation,'NEW');
 assert.deepEqual(slots(s.p,w).sort(),[`w${w}-run-d1:${S1.eventId}`,`w${w+1}-run-d1:${S2.eventId}`].sort());
});

/** First loaded week: strength on Monday and Thursday; the break starts on Saturday, after both, and lasts 14 days. */
function firstWeekBreak(cls,{breakDay=5,report=true,observedOn=null,short=[],include=null,twice=()=>false}={}){
 const t={p:generateProgram(intake({id:`t7a2-fw-${cls}`,cls,schedule:{strengthDays:[0,3],runDays:[1,4,6],longRunDay:6}}),opts).program,ledger:[]};
 const F=t.p.weeks.findIndex(x=>strengthRows(t.p,x.index).some(({e})=>e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE'));
 for(let w=0;w<F;w++)weekly(t,w);
 const bStart=addDays(t.p.weeks[F].startDate,breakDay),bEnd=addDays(bStart,13),back=addDays(bEnd,1);
 const before=strengthRows(t.p,F).filter(({date,e})=>date<bStart&&e.load.mode!=='BODYWEIGHT'&&e.exposure?.kind!=='PRACTICE');
 // `twice` sessions are reported twice under one event id with different loads (a conflict).
 const reports=s=>{const o=obs(t.p,s,observedOn?.(s)??s.date,short);if(!twice(s))return [o];const b=structuredClone(o);for(const e of b.actual.exercises??[])for(const x of e.sets)if(x.load?.unit==='KG')x.load.value+=10;return [o,b];};
 if(report)step(t,at(t.p,F,6,'21:00:00',{observations:t.p.weeks[F].sessions.filter(s=>live(s)&&(include?include(s):s.date<bStart)).flatMap(reports)}));
 const rw=Math.floor((Date.parse(back)-Date.parse(t.p.startDate))/(7*864e5));for(let w=F+1;w<rw;w++)weekly(t,w,()=>false);
 const r=step(t,at(t.p,rw,(Date.parse(back)-Date.parse(t.p.weeks[rw].startDate))/864e5,'06:00:00',brk(bStart,bEnd)));
 return {t,F,rw,back,before,r,R:lastReturn(t.p)};
}

test('R7-A.2 I4/I5/I8 (SSCTR D59): exercises first executed in the break’s week enter the return steps with their executed count as the ceiling',()=>{
 for(const cls of ['NONE','FAMILIAR','KNOWN']){
  const {t,rw,back,before,r,R}=firstWeekBreak(cls);
  assert.equal(r.action,'REESTABLISH',cls);assert.ok(before.length,cls+': exercises before the break');
  const ceiling={};for(const {e} of before)ceiling[e.id]=e.sets;
  const entry=R.interruption.entry.strength.exercises;
  for(const [id,n] of Object.entries(ceiling)){assert.equal(entry[id]?.returnStep,0,`${cls} ${id} at the entry`);assert.equal(entry[id]?.setCeiling,n,`${cls} ${id} ceiling`);}
  // The first exposure after the return is the entry; no count goes above the ceiling or more than one set above the largest since.
  const seen=new Set(),largest={};
  for(let w=rw;w<rw+5;w++){
   for(const {date,e} of strengthRows(t.p,w,back)){if(!(e.id in ceiling))continue;
    if(!seen.has(e.id)){seen.add(e.id);assert.equal(e.exposure.kind,'RETURN_ENTRY',`${cls} ${e.id}`);assert.ok(e.sets<=1&&e.rir>=4,`${cls} ${e.id} ${e.sets}@${e.rir}`);}
    assert.ok(e.sets<=ceiling[e.id],`${cls} ${e.id} w${w} ${e.sets} > ${ceiling[e.id]}`);
    if(Number.isInteger(largest[e.id]))assert.ok(e.sets<=largest[e.id]+1,`${cls} ${e.id} w${w}`);
   }
   weekly(t,w);for(const {e} of strengthRows(t.p,w,back))if(e.id in ceiling)largest[e.id]=Math.max(largest[e.id]??0,e.sets);
  }
 }
});

test('R7-A.2 I4/I6 (§11): an exercise not executed, or executed only from the break’s first day, is not in the state at the break',()=>{
 // Thursday's session is on the break's first day: reported or not, it is not before the break.
 const thu=firstWeekBreak('FAMILIAR',{breakDay:3}),bStart=addDays(thu.t.p.weeks[thu.F].startDate,3),ids=new Set(thu.before.map(({e})=>e.id));
 const monday=new Set(strengthRows(thu.t.p,thu.F).filter(({date})=>date<bStart).map(({e})=>e.id));
 const entry=thu.R.interruption.entry.strength.exercises,thursdayOnly=strengthRows(thu.t.p,thu.F).filter(({date,e})=>date===bStart&&!monday.has(e.id)).map(({e})=>e.id);
 assert.ok(thursdayOnly.length,'an exercise only on Thursday');
 for(const id of thursdayOnly)assert.equal(entry[id],undefined,id+' was not executed before the break');
 for(const id of ids)assert.equal(entry[id]?.returnStep,0,id);
 // Thursday's unexecuted rows are not part of the week before the break: Monday's executed counts stay the ceilings.
 for(const {e} of thu.before)assert.equal(entry[e.id].setCeiling,e.sets,e.id);
 // A session planned on the break's first day but executed the day before it is an exposure before the break.
 const early=firstWeekBreak('FAMILIAR',{breakDay:3,observedOn:s=>s.date===bStart?addDays(s.date,-1):s.date,include:s=>s.date<=bStart});
 for(const id of thursdayOnly)assert.equal(early.R.interruption.entry.strength.exercises[id]?.returnStep,0,id+' executed on Wednesday');
 // Two contradicting reports of that session (one event id, different loads) are a conflict: it executes nothing until corrected (QRE-R6-14).
 const conflict=firstWeekBreak('FAMILIAR',{breakDay:3,observedOn:s=>s.date===bStart?addDays(s.date,-1):s.date,include:s=>s.date<=bStart,twice:s=>s.date===bStart});
 const ce=conflict.R.interruption.entry.strength.exercises;
 for(const id of thursdayOnly)assert.equal(ce[id],undefined,id+' conflicted');
 for(const {e} of conflict.before)assert.equal(ce[e.id].setCeiling,e.sets,e.id+' keeps its Monday count');
 // Monday's session observed only on the break's first day or later is not an execution before it.
 const late=firstWeekBreak('FAMILIAR',{observedOn:s=>addDays(s.date,5)});
 for(const id of new Set(late.before.map(({e})=>e.id)))assert.equal(late.R.interruption.entry.strength.exercises[id],undefined,id);
});

test('R7-A.2 P3/P4: an exposure before the break adds to the state at the break; moved to the break’s first day it no longer counts',()=>{
 const withIt=firstWeekBreak('KNOWN'),without=firstWeekBreak('KNOWN',{report:false}),moved=firstWeekBreak('KNOWN',{breakDay:0});
 const a=withIt.R.interruption.entry.strength.exercises,b=without.R.interruption.entry.strength.exercises,c=moved.R.interruption.entry.strength.exercises;
 // P3: every exercise known without the report is known with it, and never less recently performed.
 for(const [id,e] of Object.entries(b)){assert.ok(a[id],id);assert.ok(!(e.lastPerformed>(a[id].lastPerformed??'')),id);}
 assert.ok(Object.keys(a).length>Object.keys(b).length,'the executed first exposures are added');
 // P4: with the break from Monday, Monday's exposures are after its start and leave no trace; the state is the one without the report.
 assert.deepEqual(Object.keys(c).sort(),Object.keys(b).sort());
 for(const id of Object.keys(b))assert.equal(c[id].lastPerformed,b[id].lastPerformed,id);
});

test('R7-A.2 I7: a week’s executed exposures before the break earn no step, no block set and no load adoption',()=>{
 const {t,F,R}=firstWeekBreak('KNOWN');
 const before=t.p.stateTrace[F].strength.exercises,entry=R.interruption.entry.strength.exercises;
 for(const [id,e] of Object.entries(before)){
  for(const k of ['load','reps','sets','loadTick','blocksDone','mode'])assert.deepEqual(entry[id][k],e[k],`${id}.${k}`);
 }
 // An exposure that missed its logged target is performed, but gives no executed count: the ceiling falls back as declared (SSCTR D49).
 const all=firstWeekBreak('FAMILIAR'),missed=all.before[0].e.id,one=firstWeekBreak('FAMILIAR',{short:[missed]});
 assert.equal(all.R.interruption.entry.strength.exercises[missed].setCeiling,all.before[0].e.sets);
 const m=one.R.interruption.entry.strength.exercises[missed];assert.ok(m.lastPerformed&&m.returnStep===0,'in use');assert.equal(m.setCeiling,undefined,'no executed count');
});

test('R7-A.2 P1/P6: the same break reported again, or only at another time, is the same break with the same plan',()=>{
 const t=start({id:'t7a2-p16'},3);weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;
 const one=copy(t);step(one,at(one.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));
 // P6: reported at another time of the same morning.
 const later=copy(t);step(later,at(later.p,5,0,'07:00:00',brk(addDays(d0,-16),addDays(d0,-1))));
 assert.equal(whole(later.p,5),whole(one.p,5));assert.equal(lastReturn(later.p).interruption.relation,'NEW');
 // P1: the same break reported again with another reason text: no new break, the same plan.
 const again=copy(one);step(again,at(again.p,5,0,'07:00:00',brk(addDays(d0,-16),addDays(d0,-1),{reason:'Long work trip'})));
 const B=lastReturn(again.p);assert.equal(B.interruption.relation,'SAME_BREAK');assert.equal(B.interruption.episode,lastReturn(one.p).eventId);
 assert.equal(liveReturns(again.p).length,1);assert.equal(whole(again.p,5),whole(one.p,5));
});

test('R7-A.2 P5: a break reported at 23:30 on Sunday or at 00:30 on Monday is the same break with the same next week',()=>{
 const t=start({id:'t7a2-p5'},3);weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate,b=brk(addDays(d0,-16),addDays(d0,-2));
 const sun=copy(t);step(sun,at(sun.p,4,6,'23:30:00',b));const mon=copy(t);step(mon,at(mon.p,5,0,'00:30:00',b));
 const S=lastReturn(sun.p).interruption,M=lastReturn(mon.p).interruption;
 for(const k of ['relation','startDate','endDate','days','class'])assert.equal(S[k],M[k],k);
 assert.deepEqual({kind:S.stateAt.kind,week:S.stateAt.week},{kind:M.stateAt.kind,week:M.stateAt.week});
 assert.deepEqual(line(sun.p,5),line(mon.p,5));
 assert.equal(JSON.stringify(sun.p.stateTrace[6]),JSON.stringify(mon.p.stateTrace[6]));
});

test('R7-A.2 I2/I3: three breaks; a correction after a separate break starts from that break’s re-entry, never from before the first',()=>{
 const {t,d0,A}=afterFirstReturn('t7a2-three');
 report(t,5,2,'05:00:00',s=>s.day<2);
 step(t,at(t.p,5,4,'06:00:00',brk(addDays(d0,2),addDays(d0,3))));const B=lastReturn(t.p);
 // B corrected: it began on Tuesday, not Wednesday (still after A's re-entry): the same break as B, from A's re-entry.
 step(t,at(t.p,5,4,'07:00:00',brk(addDays(d0,1),addDays(d0,3))));const C=lastReturn(t.p);
 assert.equal(C.interruption.relation,'SAME_BREAK');assert.equal(C.interruption.supersedes,B.eventId);assert.equal(C.interruption.episode,B.eventId);
 assert.equal(C.interruption.stateAt.eventId,A.eventId);assert.deepEqual(liveReturns(t.p).map(d=>d.eventId),[A.eventId,C.eventId]);
 assert.deepEqual(preBreakDose(t.p,5,addDays(d0,5)),[]);assert.deepEqual(preBreakDose(t.p,6,t.p.weeks[6].startDate),[]);
 // A third, separate break after the correction's re-entry starts from that re-entry.
 weekly(t,5);
 step(t,at(t.p,6,4,'06:00:00',brk(addDays(t.p.weeks[6].startDate,2),addDays(t.p.weeks[6].startDate,3))));const D=lastReturn(t.p);
 assert.equal(D.interruption.relation,'NEW');assert.deepEqual(preBreakDose(t.p,6,addDays(t.p.weeks[6].startDate,4)),[]);assert.deepEqual(preBreakDose(t.p,7,t.p.weeks[7].startDate),[]);
});

test('R7-A.2 I4: a return reads the executions recorded by its report; a newer report of the same break reads the ones recorded later',()=>{
 // The first loaded week's sessions are logged only after the return: the return did not know them; reporting the break again reads them.
 const {t,F,rw,back,before,R}=firstWeekBreak('FAMILIAR',{report:false}),ids=[...new Set(before.map(({e})=>e.id))];
 for(const id of ids)assert.equal(R.interruption.entry.strength.exercises[id],undefined,id+' unknown at the return');
 const bStart=R.interruption.startDate,day=(Date.parse(back)-Date.parse(t.p.weeks[rw].startDate))/864e5;
 step(t,at(t.p,rw,day,'07:00:00',{kind:'PARTIAL_SESSION',observations:t.p.weeks[F].sessions.filter(s=>live(s)&&s.date<bStart).map(s=>obs(t.p,s))}));
 step(t,at(t.p,rw,day,'08:00:00',brk(bStart,R.interruption.endDate)));const again=lastReturn(t.p);
 assert.equal(again.interruption.relation,'SAME_BREAK');
 for(const id of ids)assert.equal(again.interruption.entry.strength.exercises[id]?.returnStep,0,id+' in the return steps');
 // The order of a return and a report of the week's earlier sessions decides only what that return read: the rows agree.
 const base=start({id:'t7a2-order'},3),w=3,d0=base.p.weeks[w].startDate,ret=p=>at(p,w,6,'20:00:00',brk(addDays(d0,1),addDays(d0,5))),rep=(p,h)=>at(p,w,6,h,{kind:'PARTIAL_SESSION',observations:p.weeks[w].sessions.filter(s=>live(s)&&s.day===0).map(s=>obs(p,s))});
 const A=copy(base);step(A,ret(A.p));step(A,rep(A.p,'21:00:00'));const B=copy(base);step(B,rep(B.p,'20:00:00'));step(B,{...ret(B.p),asOf:`${addDays(d0,6)}T21:00:00Z`});
 for(const k of [w,w+1,w+2])assert.deepEqual(line(A.p,k),line(B.p,k),`week ${k}`);
});

test('R7-A.2 I4/C5: a session of the plan before a return is never a fact of a later, separate break',()=>{
 // The first break ends on Tuesday, Wednesday's lifting is done under the old plan, and the return is reported on Thursday: that session
 // belongs to the plan before the break (C5). A second break from Friday starts from the return's re-entry, without it.
 const t=start({id:'t7a2-gap'},3);weekly(t,3,()=>false);weekly(t,4,()=>false);const d0=t.p.weeks[5].startDate;
 report(t,5,2,'20:00:00',s=>s.day===2&&s.sport==='STRENGTH');
 step(t,at(t.p,5,3,'06:00:00',brk(addDays(d0,-17),addDays(d0,1))));const A=lastReturn(t.p);
 step(t,at(t.p,5,6,'06:00:00',brk(addDays(d0,4),addDays(d0,5))));const B=lastReturn(t.p);
 assert.equal(B.interruption.relation,'NEW');assert.equal(B.interruption.stateAt.eventId,A.eventId);
 for(const [id,e] of Object.entries(A.interruption.entry.strength.exercises))assert.equal(B.interruption.entry.strength.exercises[id].lastPerformed,e.lastPerformed,id);
});

test('R7-A.2 I1: a report of a break that ended before the latest reported one began is asked, never guessed',()=>{
 const {t,d0}=afterFirstReturn('t7a2-late');
 const r=evaluateProgram(t.p,{...at(t.p,5,1,'06:00:00',brk(addDays(d0,-30),addDays(d0,-25))),actualLedger:t.ledger},opts);
 assert.equal(r.status,'ASK');assert.deepEqual(r.missingInputs,['interruption.startDate','interruption.endDate']);
 // A report that would correct a later, separate break but begins before the earlier re-entry spans that re-entry: asked as well.
 report(t,5,2,'05:00:00',s=>s.day<2);step(t,at(t.p,5,4,'06:00:00',brk(addDays(d0,2),addDays(d0,3))));
 const x=evaluateProgram(t.p,{...at(t.p,5,4,'07:00:00',brk(addDays(d0,-1),addDays(d0,3))),actualLedger:t.ledger},opts);
 assert.equal(x.status,'ASK');assert.deepEqual(x.missingInputs,['interruption.startDate','interruption.endDate']);
});
