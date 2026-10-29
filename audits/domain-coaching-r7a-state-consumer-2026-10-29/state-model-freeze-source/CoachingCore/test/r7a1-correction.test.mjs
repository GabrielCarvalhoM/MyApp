// DOMAIN_COACHING_R7-A.1 correction cycle: one test per material finding of the reviews of R7A1-FREEZE-A1 (engineering QE-R7A1-01 to 05,
// SSCTR D57 and D58), with a second test for the QE-R7A1-01 guard of the final validation, the D57 whole-week rule and the D58 week's other
// changes; each fails on that freeze. They extend the week-composition contract (WEEK_COMPOSITION_CONTRACT.md) to the inputs the reviews
// showed still differed between handlers. Development authority only; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {skeletonOf,validateWeeks} from '../src/r6-program.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const SQUAT=K('back-squat',3,5,80),BENCH=K('db-bench-press',3,8,18,'PER_HAND');
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
const intake=({id,athlete={},schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7a1c-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`t7a1c-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const step=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??[])}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true,hour='21:00:00')=>step(t,at(t.p,w,6,hour,{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
const start=(ia,weeks)=>{const g=generateProgram(intake(ia),opts);assert.ok(g.program,`${ia.id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const line=(P,w)=>P.weeks[w].sessions.map(s=>`d${s.day} ${s.sport} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''} ${s.prescription?(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):'-'}`);
const whole=(P,w)=>JSON.stringify({rows:P.weeks.slice(w).map((x,k)=>line(P,w+k)),states:P.stateTrace.slice(w+1).map(({anchor,...st})=>st)});
const travel=(p,w,day,days)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days,startDate:addDays(p.weeks[w].startDate,day-days),endDate:addDays(p.weeks[w].startDate,day-1),reasonCategory:'TRAVEL',reason:'Work travel'}});
const sets=(P,w)=>{const d={};for(const s of P.weeks[w].sessions.filter(x=>x.sport==='STRENGTH'&&live(x)))for(const e of s.prescription.exercises)d[e.id]=Math.max(d[e.id]??0,e.sets);return d;};

test('R7-A.1 C2/C4 (QE-R7A1-01): a moved session never brings equipment the athlete has not got on its date',()=>{
 const t=start({id:'t7a1c-01',schedule:{strengthDays:[0,2,5],runDays:[1,3,6],longRunDay:6}},3),d0=t.p.weeks[3].startDate,DB=['DUMBBELLS','BENCH'];
 const lacking=(P,fromDay)=>{const have=new Set([...DB,'BODYWEIGHT']);return P.weeks[3].sessions.filter(s=>s.day>=fromDay&&s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.filter(e=>(e.equipment??[]).some(q=>!have.has(q))).map(e=>`${s.id}:${e.id}`));};
 // The Monday session missed and moved, then the equipment changes (permanently, or for the week): nothing barbell is left in the week.
 for(const changes of [{equipment:DB},{equipment:DB,from:d0,to:addDays(d0,6)}]){
  const A=copy(t);step(A,at(A.p,3,1,'07:00:00',{kind:'MISSED_SESSION',targetSessionId:'w3-str-d0'}));step(A,at(A.p,3,1,'07:30:00',{kind:'EQUIPMENT_CHANGE',changes}));
  assert.deepEqual(lacking(A.p,1),[],JSON.stringify(changes));
 }
 // A window stated on Sunday for Wednesday to Sunday, then the Monday session missed: the move never brings the barbell into the window.
 const B=copy(t);step(B,at(B.p,2,6,'22:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:DB,from:addDays(d0,2),to:addDays(d0,6)}}));
 step(B,at(B.p,3,1,'07:00:00',{kind:'MISSED_SESSION',targetSessionId:'w3-str-d0'}));assert.deepEqual(lacking(B.p,2),[]);
});

test('R7-A.1 C3 (QE-R7A1-02): a change after the weekly review starts next week from the review’s own inputs (systemic hold, confirmed loads)',()=>{
 // A systemic fatigue report with nothing left to reduce, then the weekly review: next week holds. A later change that evening keeps the hold.
 const t=start({id:'t7a1c-02a',schedule:{runDays:[1,4,6],strengthDays:[0,2],longRunDay:6}},3);
 step(t,at(t.p,3,6,'07:00:00',{kind:'SYSTEMIC_FATIGUE'}));const held=weekly(t,3);assert.ok(Object.values(held.gates).every(g=>g!=='ADVANCE'),'the review holds');
 const heldSets=sets(t.p,4),heldStart=JSON.stringify(t.p.stateTrace[4]);
 const S=copy(t);step(S,at(S.p,3,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[1,3,6],longRunDay:6}}));assert.equal(JSON.stringify(S.p.stateTrace[4]),heldStart,'schedule change');
 const G=copy(t),goal=step(G,at(G.p,3,6,'22:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}));assert.ok(Object.values(goal.gates??{}).every(g=>g!=='ADVANCE'),'goal change');
 const E=copy(t);step(E,at(E.p,3,6,'22:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));
 for(const [id,n] of Object.entries(sets(E.p,4)))if(Number.isFinite(heldSets[id]))assert.ok(n<=heldSets[id],`${id} ${heldSets[id]} -> ${n}`);
 // First loads chosen by effort and confirmed in the weekly review stay confirmed through a change the same evening.
 const c={p:generateProgram(intake({id:'t7a1c-02b'}),opts).program,ledger:[]},w0=c.p.weeks[0].sessions,ids=[...new Set(w0.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='ESTABLISH').map(e=>e.id)))];
 assert.ok(ids.length,'an exercise established by effort');
 const conf=ids.map(id=>({exerciseId:id,value:20,unit:'KG',convention:w0.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===id).load.convention}));
 step(c,at(c.p,0,6,'21:00:00',{observations:w0.filter(live).map(s=>obs(c.p,s)),loadConfirmations:conf}));
 const known=P=>ids.map(id=>{const e=P.stateTrace[1].strength.exercises[id];return `${id}:${e.mode}:${e.load}`;});assert.ok(known(c.p).every(x=>x.endsWith('KNOWN:20')),known(c.p).join());
 for(const x of [{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK','KETTLEBELL']}},{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}},{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}]){
  const T=copy(c);step(T,at(T.p,0,6,'22:00:00',x));assert.deepEqual(known(T.p),known(c.p),x.kind);
 }
});

test('R7-A.1 C5 (QE-R7A1-03): a return correction supersedes the earlier return whichever week it is reported in',()=>{
 // A 16-day return reported Friday evening re-plans the weekend; the weekend is executed and reviewed; the break was in fact Monday-Thursday.
 const t=start({id:'t7a1c-03'},5),w=5,d0=t.p.weeks[w].startDate,weekend=s=>s.day>=5;
 const first={kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d0,-12),endDate:addDays(d0,3),reasonCategory:'TRAVEL',reason:'Work travel'}};
 const fix={kind:'RETURN_AFTER_PAUSE',interruption:{days:4,startDate:d0,endDate:addDays(d0,3),reasonCategory:'TRAVEL',reason:'Work travel'}};
 const run=(fw,day,hour)=>{const T=copy(t);step(T,at(T.p,w,4,'21:00:00',first));weekly(T,w,weekend);step(T,at(T.p,fw,day,hour,fix));return T.p;};
 assert.equal(whole(run(w,6,'22:00:00'),w+1),whole(run(w+1,0,'07:00:00'),w+1));
});

test('R7-A.1 C1 (QE-R7A1-04): an adaptation reaches every session still ahead the same day, and none already past',()=>{
 const t=start({id:'t7a1c-04',schedule:{runDays:[1,3,6],strengthDays:[0,3]}},3),pm=t.p.weeks[3].sessions.find(s=>s.day===0&&s.sport==='STRENGTH');
 const U=copy(t);step(U,at(U.p,3,0,'06:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[pm.date]}}));assert.equal(U.p.weeks[3].sessions.find(s=>s.id===pm.id).status,'SKIPPED');
 const F=copy(t);step(F,at(F.p,3,0,'06:00:00',{kind:'SYSTEMIC_FATIGUE'}));
 const before=pm.prescription.exercises.reduce((n,e)=>n+e.sets,0),after=F.p.weeks[3].sessions.find(s=>s.id===pm.id).prescription.exercises.reduce((n,e)=>n+e.sets,0);assert.ok(after<before,`${before} -> ${after}`);
 // The morning quality run is past at 13:00 of its day: a fatigue report then leaves it as it was.
 const q=t.p.weeks[3].sessions.find(s=>s.role==='QUALITY');assert.equal(q.turn,'AM');
 const L=copy(t);step(L,at(L.p,3,q.day,'13:00:00',{kind:'SYSTEMIC_FATIGUE'}));assert.equal(JSON.stringify(L.p.weeks[3].sessions.find(s=>s.id===q.id).prescription),JSON.stringify(q.prescription));
 const r=start({id:'t7a1c-04r',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},6),rpm=r.p.weeks[6].sessions.find(s=>s.day===0&&s.sport==='STRENGTH');
 step(r,at(r.p,6,0,'06:00:00',{kind:'EVENT_WEEK_CONFLICT',changes:{unavailableDates:[rpm.date]}}));assert.equal(r.p.weeks[6].sessions.find(s=>s.id===rpm.id).status,'SKIPPED');
});

test('R7-A.1 I4 (QE-R7A1-05): an unreadable load never hides the other report’s known load, in either arrival order',()=>{
 const set=(load,rir)=>({...(load===undefined?{}:{load}),reps:5,...(rir===undefined?{}:{rir})});
 const report=(id,sets,source)=>({eventId:id,athleteId:'a',sessionId:'w0-str-d0',observedAt:'2026-11-02T19:00:00Z',actual:{completed:true,minutes:40,exercises:[{id:'back-squat',sets}]},response:{...OK},...(source?{source}:{})});
 const manual=report('m',[0,1,2].map(()=>set({value:80,unit:'KG',convention:'TOTAL'})));
 for(const load of [{value:80},{value:176,unit:'LBS',convention:'TOTAL'},{value:176,unit:'pounds',convention:'TOTAL'}]){
  const device=report('d',[0,1,2].map(()=>set(load,3)),{provider:'WATCH',activityId:'x1'});
  for(const list of [[manual,device],[device,manual]]){
   const acc=normalizeObservations(list,{athleteId:'a',asOf:'2026-11-03T00:00:00Z',loadIncrements:{TOTAL:2.5}}).accepted;
   assert.equal(acc.length,1);assert.ok(acc[0].actual.exercises[0].sets.every(s=>s.load?.value===80&&s.load?.unit==='KG'&&s.rir===3),JSON.stringify(load));
  }
 }
});

test('R7-A.1 D57: after a return, a cap ends only after a whole week that covers next week’s count; no count comes back two sets at once',()=>{
 // RUNNING_SUPPORT with a 20-minute strength day before a 16-day break; more time from the second week back (SSCTR traced timeline).
 for(const days of [[0],[0,3]]){
  const ia=intake({id:'t7a1c-57-'+days.length,athlete:{goals:{run:'PERFORMANCE',strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:days.length},knownExercises:[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),BENCH]},schedule:{runDays:[1,4,6],strengthDays:days,runMinutes:50,strengthMinutes:20,longRunDay:6,longRunMinutes:80}});
  const t={p:generateProgram(ia,opts).program,ledger:[]};
  for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,()=>false);weekly(t,5,()=>false);step(t,at(t.p,6,0,'06:00:00',travel(t.p,6,0,16)));
  const largest={},covered=new Set();
  for(let w=6;w<15;w++){
   for(const [id,ex] of Object.entries(t.p.stateTrace[w].strength.exercises))if(Number.isInteger(ex.setCap)||Number.isInteger(ex.regainCap)||Number.isInteger(ex.returnStep))covered.add(id);
   for(const [id,n] of Object.entries(sets(t.p,w)))if(covered.has(id)&&Number.isInteger(largest[id]))assert.ok(n<=largest[id]+1,`${days} w${w} ${id}: ${n} after ${largest[id]}`);
   weekly(t,w);if(w===7)step(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));
   for(const [id,n] of Object.entries(sets(t.p,w)))largest[id]=Math.max(largest[id]??0,n);
  }
  assert.ok(covered.has('db-row'),'the traced exercise is covered');
 }
});

test('R7-A.1 D57: a return or regain cap neither rises nor ends after a week whose last exposure did not do its whole count',()=>{
 // The SSCTR grid timeline sg-ret16mon-STRENGTH-N-1-30-none: no known exercises, one 30-minute strength day, a 16-day return reported Monday.
 const ia=intake({id:'t7a1c-57b',athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:1},knownExercises:[]},schedule:{runDays:[1,4,6],strengthDays:[0],runMinutes:50,strengthMinutes:30,longRunDay:6,longRunMinutes:80}});
 const t={p:generateProgram(ia,opts).program,ledger:[]},cap=x=>Number.isInteger(x?.regainCap)?x.regainCap:Number.isInteger(x?.setCap)?x.setCap:null;
 for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,()=>false);weekly(t,5,()=>false);step(t,at(t.p,6,0,'06:00:00',travel(t.p,6,0,16)));
 let checked=0;
 for(let w=6;w<14;w++){
  weekly(t,w);
  const last={};for(const s of t.p.weeks[w].sessions.filter(x=>x.sport==='STRENGTH'&&live(x)))for(const e of s.prescription.exercises)last[e.id]=e;
  for(const [id,e] of Object.entries(last)){
   const before=t.p.stateTrace[w].strength.exercises[id],after=t.p.stateTrace[w+1].strength.exercises[id];
   if(cap(before)===null||Number.isInteger(before.returnStep)||!Number.isInteger(e.exposure?.baseSets)||e.sets===e.exposure.baseSets)continue;
   checked++;assert.equal(cap(after),cap(before),`w${w} ${id}: ${e.sets} of ${e.exposure.baseSets} sets, cap ${cap(before)} -> ${cap(after)}`);
  }
 }
 assert.ok(checked>0,'a capped week whose last exposure was reduced or trimmed is reached');
});

test('R7-A.1 C7 (QE-R7A1-01): the final validation refuses a row that needs equipment the athlete has not got on its date',()=>{
 // Fail closed: moves and templates read the same per-date equipment, so no composition path is known to write such a row; the guard is
 // pinned directly. A dumbbell-and-bench window over week 3, then a barbell exercise written into a row inside it.
 const t=start({id:'t7a1c-01b'},3),d0=t.p.weeks[3].startDate;
 step(t,at(t.p,2,6,'22:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:d0,to:addDays(d0,6)}}));
 const sk=skeletonOf(t.p,opts.authority),weeks=structuredClone(t.p.weeks.filter(x=>x.index>=3));
 assert.deepEqual(validateWeeks(sk,weeks).filter(e=>/equipmentUnavailable/.test(e)),[],'the plan as composed needs nothing missing');
 const row=weeks[0].sessions.find(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED'),e=row.prescription.exercises[0];
 row.prescription.exercises[0]={...e,equipment:['BARBELL','RACK']};
 assert.ok(validateWeeks(sk,weeks).includes(`${row.id}:equipmentUnavailable:${e.id}`));
});

test('R7-A.1 C4/C5 (D58): after a short break the first quality slot still ahead runs easy, this week or the next, and only that one',()=>{
 // The week's quality run is Tuesday; a 6-day break ending Tuesday is reported Wednesday morning: re-entry starts this week.
 const t=start({id:'t7a1c-58'},3);assert.equal(t.p.weeks[3].sessions.find(s=>s.role==='QUALITY').day,1);
 const r=step(t,at(t.p,3,2,'09:00:00',travel(t.p,3,2,6)));assert.equal(r.proposal.decisions.at(-1).fromWeek,3,'re-entry this week');
 const easy=P=>P.weeks.slice(3).flatMap(x=>x.sessions.filter(s=>/short break runs easy/.test(s.explanation??'')).map(s=>s.id));
 const firstQualitySlot=P=>P.weeks[4].sessions.find(s=>s.sport==='RUN'&&s.day===1);
 assert.deepEqual(easy(t.p),[firstQualitySlot(t.p).id]);assert.equal(firstQualitySlot(t.p).role,'EASY');
 weekly(t,3,s=>s.day>=2);assert.deepEqual(easy(t.p),[firstQualitySlot(t.p).id]);assert.equal(firstQualitySlot(t.p).role,'EASY','after the weekly review');
 // A Tuesday quality run missed and reported after that return is part of the plan before the break: it is not moved into the re-entry.
 const m=start({id:'t7a1c-58'},3);step(m,at(m.p,3,2,'09:00:00',travel(m.p,3,2,6)));
 assert.notEqual(step(m,at(m.p,3,2,'10:00:00',{kind:'MISSED_SESSION',targetSessionId:m.p.weeks[3].sessions.find(s=>s.role==='QUALITY').id})).action,'MOVE');
});

test('R7-A.1 C4 (D58): the easy slot stays one slot whatever else the week holds: one already history stays it, one skipped passes on',()=>{
 const easy=(P,w0)=>P.weeks.slice(w0).flatMap((x,k)=>x.sessions.filter(s=>/short break runs easy/.test(s.explanation??'')).map(s=>`w${w0+k}:${s.id}`));
 // Carried to next week's Tuesday, then a strength-only change of that week after it, then its weekly review: no second slot.
 const A=start({id:'t7a1c-58'},3);step(A,at(A.p,3,2,'09:00:00',travel(A.p,3,2,6)));weekly(A,3,s=>s.day>=2);
 step(A,at(A.p,4,2,'21:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));weekly(A,4);
 assert.deepEqual(easy(A.p,3),['w4:w4-run-d1']);assert.equal(A.p.weeks[5].sessions.find(s=>s.sport==='RUN'&&s.day===1).role,'QUALITY');
 // The Tuesday quality day unavailable and a short return reported the same Monday, in both orders: no quality run is left in the week and,
 // after its weekly review, one slot is easy: the quality moved to Thursday, or next week's when the slot made easy was then skipped.
 for(const order of [0,1]){
  const t=start({id:'t7a1c-58b'},3),un=p=>at(p,3,0,order?'06:00:00':'05:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(p.weeks[3].startDate,1)]}}),rt=p=>at(p,3,0,order?'05:00:00':'06:00:00',travel(p,3,0,6));
  for(const f of order?[rt,un]:[un,rt])step(t,f(t.p));weekly(t,3);
  assert.ok(!t.p.weeks[3].sessions.some(s=>live(s)&&s.role==='QUALITY'),'no quality run after the short return');
  assert.deepEqual(easy(t.p,3),[order?'w4:w4-run-d1':'w3:w3-run-d3'],'order '+order);
 }
});
