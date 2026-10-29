// DOMAIN_COACHING_R7-A.1: the week-composition contract (audits/domain-coaching-r7a1-2026-10-27/WEEK_COMPOSITION_CONTRACT.md) as
// metamorphic relations and properties over the handlers that re-plan a week, plus the D56, QE-R7A-12 and QE-R7A-05 rules. Each test names
// the contract clause and the blockers or equivalent paths it covers. Development authority only; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram,programHash} from '../src/r6-index.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {hash} from '../src/value.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const RDL={...SQUAT,id:'barbell-rdl',reps:6,load:{value:90,unit:'KG',convention:'TOTAL'}};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
const intake=({id,weeks=16,athlete={},schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7a1-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** An as-prescribed report; over[id] = {load, reps (list or number), rir}. */
function obs(p,s,over={}){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{},ld=o.load??{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:e.sets},(_,i)=>({load:ld,reps:Array.isArray(o.reps)?o.reps[i]:o.reps??e.reps,rir:o.rir??e.rir}))};});
 return {eventId:`t7a1-o-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const step=(t,review)=>{const r=evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??[])}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const weekly=(t,w,keep=()=>true,over=()=>({}))=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&keep(s)).map(s=>obs(t.p,s,over(s)))}));
const start=(ia,weeks)=>{const g=generateProgram(intake(ia),opts);assert.ok(g.program,`${ia.id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const line=(P,w,fromDay=0)=>P.weeks[w].sessions.filter(s=>s.day>=fromDay).map(s=>`d${s.day} ${s.sport} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''} ${s.prescription?(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):'-'}`);
const stateOf=(P,w)=>{const {anchor,...st}=P.stateTrace[w];return JSON.stringify(st);};
/** a then b against b then a from one program: the week's sessions from `fromDay` and next week's start must agree. */
function bothOrders(t0,w,a,b,fromDay=1){const A=copy(t0),B=copy(t0);step(A,a(A.p));step(A,b(A.p));step(B,b(B.p));step(B,a(B.p));return {A:A.p,B:B.p,same:line(A.p,w,fromDay).join('\n')===line(B.p,w,fromDay).join('\n')&&stateOf(A.p,w+1)===stateOf(B.p,w+1)};}
/** Every week's rows (in their order) and every state after week w: the whole plan two orders must agree on. */
const whole=(P,w)=>JSON.stringify({rows:P.weeks.slice(w).map((x,k)=>line(P,w+k)),states:P.stateTrace.slice(w+1).map(({anchor,...st})=>st)});
const travel=(p,w,day,days=16)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days,startDate:addDays(p.weeks[w].startDate,day-days),endDate:addDays(p.weeks[w].startDate,day-1),reasonCategory:'TRAVEL',reason:'Work travel'}});
const window=(p,w)=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[w].startDate,to:addDays(p.weeks[w].startDate,6)}});
const races=P=>P.weeks.flatMap(w=>w.sessions.filter(s=>s.role==='RACE'&&s.prescription&&s.status!=='SKIPPED').map(s=>s.date));

test('R7-A.1 C3: re-planning this week keeps the next-week start a decision of this week set (QE-R7A-01, SSCTR O-1/R28)',()=>{
 // A return that re-plans from next week, then an equipment change of the same evening, in either order: next week is the return entry.
 for(const changes of [p=>({equipment:['DUMBBELLS','BENCH'],from:p.weeks[6].startDate,to:addDays(p.weeks[6].startDate,6)}),()=>({equipment:['DUMBBELLS','BENCH']})]){
  const t=start({id:'t7a1-c3a',schedule:{strengthDays:[0,4],runDays:[1,3,6]}},4);weekly(t,4,()=>false);
  const o=bothOrders(t,5,p=>at(p,5,6,'20:00:00',travel(p,5,6)),p=>at(p,5,6,'20:30:00',{kind:'EQUIPMENT_CHANGE',changes:changes(p)}),0);
  for(const P of [o.A,o.B]){const kinds=P.weeks[6].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>e.exposure.kind));assert.ok(kinds.length&&kinds.every(k=>k==='RETURN_ENTRY'),kinds.join());assert.equal(P.stateTrace[6].run.mode,'RETURN');}
  assert.equal(line(o.A,6).join('\n'),line(o.B,6).join('\n'));
 }
 // The reviewed transition (a lighter bench adopted) survives an equipment change after the review.
 const t=start({id:'t7a1-c3b'},2);weekly(t,2,()=>true,s=>s.sport==='STRENGTH'?{'db-bench-press':{load:{value:16,unit:'KG',convention:'PER_HAND'}}}:{});
 const reviewed=t.p.stateTrace[3].strength.exercises['db-bench-press'].load;assert.equal(reviewed,16);
 step(t,at(t.p,2,6,'22:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));
 assert.equal(t.p.stateTrace[3].strength.exercises['db-bench-press'].load,reviewed);
 assert.ok(t.p.weeks[3].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises).filter(e=>e.id==='db-bench-press').every(e=>e.load.value===16));
});

test('R7-A.1 C3/C5: next week’s conditional plan never counts a session from the plan before a return of this week',()=>{
 // A return reported on Thursday morning re-plans the rest of the week; Wednesday's lifting (back squat) was missed during the break.
 const t=start({id:'t7a1-c3c'},4),w=4,d3=addDays(t.p.weeks[w].startDate,3);
 step(t,at(t.p,w,3,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d3,-16),endDate:addDays(d3,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 assert.equal(t.p.decisions.at(-1).fromWeek,w,'re-entry starts this week');
 assert.equal(t.p.stateTrace[w+1].strength.exercises['back-squat'].returnStep,0,'a lift not done since the break starts at the entry');
 const squat=t.p.weeks[w+1].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat'));
 assert.ok(squat.length&&squat.every(e=>e.exposure.kind==='RETURN_ENTRY'),squat.map(e=>e.exposure.kind).join());
});

test('R7-A.1 C5/C7: a moved race replaces the earlier one in either order, never two races (QE-R7A-03)',()=>{
 const t=start({id:'t7a1-c5',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},0);const RW=t.p.phases.raceWeek;
 for(let w=0;w<RW;w++)weekly(t,w,()=>w<RW-2);
 const later=addDays(t.p.goal.run.event.date,7);
 const o=bothOrders(t,RW,p=>at(p,RW,5,'07:00:00',travel(p,RW,5)),p=>at(p,RW,5,'08:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:later}}),5);
 assert.deepEqual(races(o.A),[later]);assert.deepEqual(races(o.B),[later]);assert.ok(o.same,line(o.A,RW,5).join('|')+' vs '+line(o.B,RW,5).join('|'));
});

test('R7-A.1 C4: same-week adaptations and a later re-plan of the week compose in either order (QE-R7A-19, E03, E04)',()=>{
 const race=start({id:'t7a1-c4r',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},6),plain=start({id:'t7a1-c4p'},3);
 const eventChange=p=>at(p,6,0,'06:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(p.weeks[6].startDate,7)}});
 const thu=p=>p.weeks[6].sessions.find(s=>s.day===3&&s.sport==='RUN').date,wed=p=>p.weeks[3].sessions.find(s=>s.day===2&&s.sport==='STRENGTH').date;
 const cases=[
  [race,6,p=>at(p,6,0,'05:00:00',{kind:'SYSTEMIC_FATIGUE'}),eventChange],
  [race,6,p=>at(p,6,0,'05:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[thu(p)]}}),eventChange],
  [race,6,p=>at(p,6,0,'05:00:00',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),eventChange],
  [plain,3,p=>at(p,3,0,'07:00:00',{kind:'SYSTEMIC_FATIGUE'}),p=>at(p,3,0,'08:00:00',window(p,3))],
  [plain,3,p=>at(p,3,0,'07:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[wed(p)]}}),p=>at(p,3,0,'08:00:00',window(p,3))],
  [plain,3,p=>at(p,3,0,'07:00:00',{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}),p=>at(p,3,0,'08:00:00',window(p,3))]
 ];
 for(const [t,w,a,b] of cases){const o=bothOrders(t,w,a,b);assert.ok(o.same,`${a(t.p).event.kind} x ${b(t.p).event.kind}\n${line(o.A,w,1).join('\n')}\n---\n${line(o.B,w,1).join('\n')}`);}
 // The unavailable session stays skipped after the re-plan.
 const o=bothOrders(plain,3,cases[4][2],cases[4][3]);assert.ok(o.A.weeks[3].sessions.find(s=>s.day===2&&s.sport==='STRENGTH').status==='SKIPPED');
});

test('R7-A.1 C2: a change stated from a later week never re-plans the weeks before it, whatever re-plans them later (E02, E11-E14)',()=>{
 const days=(P,w,sport='RUN')=>[...new Set(P.weeks[w].sessions.filter(s=>s.sport===sport&&s.prescription).map(s=>s.day))].join();
 // A dated schedule change from week 4, then the weekly review of week 2: week 3 keeps its days.
 let t=start({id:'t7a1-c2a'},2);const before=days(t.p,3);
 step(t,at(t.p,2,2,'10:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6,from:t.p.weeks[4].startDate}}));weekly(t,2);
 assert.equal(days(t.p,3),before);assert.equal(days(t.p,4),'0,3,6');
 // A schedule change from next week, then a return or an event change that re-plans this week: this week keeps its days.
 t=start({id:'t7a1-c2b'},4);const w4=days(t.p,4),d0=t.p.weeks[4].startDate;
 step(t,at(t.p,4,0,'05:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}}));
 step(t,at(t.p,4,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d0,-16),endDate:addDays(d0,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 assert.equal(days(t.p,4),w4);assert.equal(days(t.p,5),'0,3,6');
 const r=start({id:'t7a1-c2c',athlete:{goals:{run:RACE,strength:'STRENGTH'}}},6);
 const o=bothOrders(r,6,p=>at(p,6,0,'05:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}}),p=>at(p,6,0,'06:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(p.weeks[6].startDate,7)}}));
 assert.ok(o.same);assert.equal(days(o.A,6),days(r.p,6));
 // A goal change from next week never re-doses this week; a permanent equipment change from next Monday leaves this week as it is.
 const g=start({id:'t7a1-c2d'},3);
 const og=bothOrders(g,3,p=>at(p,3,0,'07:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),p=>at(p,3,0,'08:00:00',window(p,3)));assert.ok(og.same);
 const e=start({id:'t7a1-c2e'},3),thisWeek=line(e.p,3,1).join('\n');
 step(e,at(e.p,3,0,'08:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:e.p.weeks[4].startDate}}));
 assert.equal(line(e.p,3,1).join('\n'),thisWeek);assert.ok(!line(e.p,4).join().includes('back-squat'));
});

test('R7-A.1 C1: same-day eligibility follows the chosen shift (QE-R7A-02, QE-R7A-23)',()=>{
 // A short return reported at 05:00 on a quality morning: the first run back, that morning, is easy; reported the evening before, the same.
 const runs=P=>P.weeks[5].sessions.filter(s=>s.sport==='RUN'&&s.day>=3&&s.prescription).map(s=>`${s.day}:${s.role}`).join();
 const t=start({id:'t7a1-c1a',schedule:{strengthDays:[0,4],runDays:[1,3,6]}},5),qualityDay=t.p.weeks[5].sessions.find(s=>s.role==='QUALITY');
 assert.equal(qualityDay?.day,3);
 const short=(P,day,hour)=>at(P,5,day,hour,{kind:'RETURN_AFTER_PAUSE',interruption:{days:5,startDate:addDays(P.weeks[5].startDate,-2),endDate:addDays(P.weeks[5].startDate,2),reasonCategory:'TRAVEL',reason:'Work travel'}});
 const morning=copy(t),evening=copy(t);step(morning,short(morning.p,3,'05:00:00'));step(evening,short(evening.p,2,'21:00:00'));
 assert.equal(runs(morning.p),runs(evening.p));assert.ok(runs(morning.p).startsWith('3:EASY'),runs(morning.p));
 // An evening re-plan never rewrites that morning's session: its report may still arrive, and it arrives to the row it was executed from.
 const r=start({id:'t7a1-c1b',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},6),thuRun=r.p.weeks[6].sessions.find(s=>s.day===3&&s.sport==='RUN');
 step(r,{...at(r.p,6,3,'21:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(r.p.weeks[6].startDate,11)}})});
 assert.equal(hash(r.p.weeks[6].sessions.find(s=>s.id===thuRun.id).prescription),hash(thuRun.prescription));
});

test('R7-A.1 C4/C5: a short return’s easy slot survives the review; a pre-break session never moves into a re-entry (E01, E10)',()=>{
 const t=start({id:'t7a1-c45a',schedule:{strengthDays:[0,4],runDays:[1,3,6]}},3),d5=addDays(t.p.weeks[3].startDate,5);
 step(t,at(t.p,3,5,'20:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:6,startDate:addDays(d5,-6),endDate:addDays(d5,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 const easy=line(t.p,4).filter(x=>x.includes(' RUN '));assert.ok(!easy.some(x=>/QUALITY/.test(x)),easy.join('|'));
 weekly(t,3,()=>false);assert.deepEqual(line(t.p,4).filter(x=>x.includes(' RUN ')),easy);
 const m=start({id:'t7a1-c45b',schedule:{runDays:[0,2,4,6],longRunDay:0,strengthDays:[1,5]}},4),key=m.p.weeks[4].sessions.find(s=>s.role==='QUALITY'),d=addDays(m.p.weeks[4].startDate,key.day+1);
 const o=bothOrders(m,4,p=>at(p,4,key.day+1,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}),p=>at(p,4,key.day+1,'07:00:00',{kind:'MISSED_SESSION',targetSessionId:key.id}),0);
 assert.ok(o.same);assert.ok(!o.A.weeks[4].sessions.some(s=>s.day>key.day&&s.role==='QUALITY'&&s.prescription&&s.status!=='SKIPPED'));
});

/** STRENGTH; one 25-minute strength day; strength missed in weeks 2-6, re-established in week 7 (SSCTR D56 minimal timeline). */
function trimmed({raise,strip=false}){
 const t={p:generateProgram(intake({id:'t7a1-d56',athlete:{knownExercises:[SQUAT,RDL,BENCH],recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:1}},schedule:{strengthDays:[0],runDays:[1,4,6],longRunDay:6,strengthMinutes:25}}),opts).program,ledger:[]};
 const legacy=P=>{const q=structuredClone(P);for(const w of q.weeks)for(const s of w.sessions)if(s.sport==='STRENGTH'&&s.prescription){for(const e of s.prescription.exercises)delete e.exposure;s.plannedPrescriptionHash=hash(s.prescription);}delete q.hash;q.hash=programHash(q);return q;};
 const sets=[],caps=[],ceilings=[];
 for(let w=0;w<12;w++){if(strip)t.p=legacy(t.p);weekly(t,w,s=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));if(raise&&w===8)step(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));}
 for(let w=7;w<12;w++){const ex=t.p.stateTrace[w].strength.exercises['back-squat'];sets.push(Math.max(0,...t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>e.sets))));caps.push(ex?.regainCap??null);ceilings.push(ex?.lastExecutedSets??null);}
 return {sets,caps,ceilings};
}
test('R7-A.1 D56: weeks trimmed to the time budget neither raise nor end the regain cap; more time adds one set at a time, in every representation',()=>{
 const constant=trimmed({raise:false}),raised=trimmed({raise:true});
 assert.ok(constant.caps.slice(1).every(c=>Number.isInteger(c)),'cap held through trimmed weeks: '+constant.caps);
 for(let i=1;i<raised.sets.length;i++)assert.ok(raised.sets[i]<=Math.max(...raised.sets.slice(0,i))+1,'one set at a time: '+raised.sets);
 assert.deepEqual(raised.sets,[2,2,3,4,4].slice(0,raised.sets.length).map((x,i)=>i<4?x:raised.sets[4]));
 // A program written before R7-A (rows without exposure) reads the trimmed weeks the same way, caps and return ceiling alike (its week's
 // planned counts are those before the time fit).
 const legacyRaised=trimmed({raise:true,strip:true}),legacyConstant=trimmed({raise:false,strip:true});
 assert.deepEqual(legacyRaised.sets,raised.sets);assert.deepEqual(legacyConstant.caps,constant.caps);
 assert.deepEqual(legacyRaised.ceilings,raised.ceilings);assert.deepEqual(legacyConstant.ceilings,constant.ceilings);
});

test('R7-A.1 D56/R19: the last executed exposure gives the week’s counts; a whole first session does not lift a cap the week then reduced (QE-R7A-22)',()=>{
 const t=start({id:'t7a1-r19',schedule:{strengthDays:[0,4],runDays:[1,3,6]}},4);weekly(t,4,()=>false);weekly(t,5,()=>false);
 step(t,at(t.p,6,0,'06:00:00',travel(t.p,6,0)));
 let checked=0;
 for(let w=6;w<13;w++){
  const twice=['db-row','db-bench-press'].filter(id=>t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===id)).length>1);
  const capped=twice.filter(id=>{const e=t.p.stateTrace[w].strength.exercises[id];return e&&(Number.isInteger(e.setCap)||Number.isInteger(e.regainCap));});
  if(capped.length){
   const b={p:t.p,ledger:t.ledger};step(b,at(b.p,w,1,'05:00:00',{kind:'SYSTEMIC_FATIGUE',observations:b.p.weeks[w].sessions.filter(s=>s.prescription&&s.day===0).map(s=>obs(b.p,s))}));
   weekly(b,w,s=>s.day>0);
   for(const id of capped){const before=t.p.stateTrace[w].strength.exercises[id],after=b.p.stateTrace[w+1].strength.exercises[id];if(Number.isInteger(before.setCap))assert.equal(after.setCap,before.setCap,`${id} w${w}`);if(Number.isInteger(before.regainCap))assert.equal(after.regainCap,before.regainCap,`${id} w${w}`);checked++;}
  }
  weekly(t,w);
 }
 assert.ok(checked>0,'a capped exercise prescribed twice in a week was reached');
});

test('R7-A.1 QE-R7A-12: a lighter known-load shortfall keeps the repetition target; an advanced lighter log takes its repetitions as at the planned load',()=>{
 for(const [load,reps,target] of [[77.5,[5,3,5],5],[75,[4,4,2],5],[77.5,[5,5,5],5]]){
  const t={p:generateProgram(intake({id:'t7a1-q12',weeks:12,schedule:{strengthDays:[0],runDays:[1,4,6],longRunDay:6}}),opts).program,ledger:[]};
  const r=weekly(t,0,()=>true,s=>s.sport==='STRENGTH'?{'back-squat':{load:{value:load,unit:'KG',convention:'TOTAL'},reps}}:{});
  const sq=t.p.weeks[1].sessions.find(s=>s.sport==='STRENGTH').prescription.exercises.find(e=>e.id==='back-squat');
  assert.equal(sq.load.value,load);assert.equal(sq.reps,target,`${load} ${reps} -> ${sq.sets}x${sq.reps} (${r.gates?.['back-squat']})`);
 }
});

test('R7-A.1 QE-R7A-05: an agreeing report never makes a known field unknown, in either arrival order',()=>{
 const sets=(mask,{load=80,reps=5,rir=2})=>Array.from({length:3},()=>({...(mask.includes('load')?{load:{value:load,unit:'KG',convention:'TOTAL'}}:{}),...(mask.includes('reps')?{reps}:{}),...(mask.includes('rir')?{rir}:{})}));
 const report=(id,mask,source,minutes)=>({eventId:id,athleteId:'a',sessionId:'w0-str-d0',observedAt:'2026-11-02T19:00:00Z',actual:{completed:true,minutes,exercises:[{id:'back-squat',sets:sets(mask,{})}]},response:{...OK},...(source?{source}:{})});
 const masks=[['load','reps'],['reps','rir'],['load','rir'],['load'],['reps'],['rir'],['load','reps','rir']];
 for(const m1 of masks)for(const m2 of masks){
  const a=report('m1',m1,null,40),b=report('m2',m2,{provider:'WATCH',activityId:'x1'},41);
  const merged=[[a,b],[b,a]].map(list=>normalizeObservations(list,{athleteId:'a',asOf:'2026-11-03T00:00:00Z',loadIncrements:{TOTAL:2.5}}).accepted);
  for(const acc of merged){assert.equal(acc.length,1,`${m1}+${m2} merge into one`);const s=acc[0].actual.exercises[0].sets;for(const k of new Set([...m1,...m2]))assert.ok(s.every(x=>x[k]!==undefined&&x[k]!==null),`${m1}+${m2}: ${k} known`);}
  assert.equal(JSON.stringify(merged[0][0].actual.exercises),JSON.stringify(merged[1][0].actual.exercises),`${m1}+${m2} order`);
 }
});

test('R7-A.1 C2/C3: a change from a later week composes the weeks before it as planned, whatever change came first (run ceiling, goals)',()=>{
 const t=start({id:'t7a1-c2f'},3),d0=t.p.weeks[3].startDate,dated=p=>at(p,3,0,'05:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6,from:addDays(d0,14)}});
 for(const other of [p=>at(p,3,0,'06:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:30}}),p=>at(p,3,0,'06:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}})]){
  const A=copy(t),B=copy(t);step(A,dated(A.p));step(A,other(A.p));step(B,other(B.p));step(B,dated(B.p));assert.equal(whole(A.p,3),whole(B.p,3));
 }
 // A dated goal change and a later run-goal change: each context keeps what was stated for it, in either order.
 const g=start({id:'t7a1-c2g'},2),datedGoal=p=>at(p,2,1,'07:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'},from:p.weeks[5].startDate}});
 const race=p=>at(p,2,1,'08:00:00',{kind:'GOAL_CHANGE',changes:{goals:{run:'RACE'},event:{kind:'10K',date:addDays(p.weeks[0].startDate,13*7+6)}}});
 const A=copy(g),B=copy(g);step(A,datedGoal(A.p));step(A,race(A.p));step(B,race(B.p));step(B,datedGoal(B.p));
 assert.equal(whole(A.p,2),whole(B.p,2));assert.equal(A.p.goal.strength.kind,'HYPERTROPHY');assert.equal(A.p.contextBefore.at(-1).goal.strength.kind,'STRENGTH');
});

test('R7-A.1 C5: the newer equipment statement is in force (two windows; a permanent change after a window); rows of one slot keep the plan order',()=>{
 const rows=P=>line(P,3).join('\n'),t=start({id:'t7a1-c5e'},3),d0=t.p.weeks[3].startDate,win=(eq,h)=>p=>at(p,3,0,h,{kind:'EQUIPMENT_CHANGE',changes:{equipment:eq,from:d0,to:addDays(d0,6)}});
 const two=copy(t),one=copy(t);step(two,win(['MACHINES'],'05:00:00')(two.p));step(two,win(['DUMBBELLS','BENCH'],'06:00:00')(two.p));step(one,win(['DUMBBELLS','BENCH'],'06:00:00')(one.p));
 assert.equal(rows(two.p),rows(one.p));
 // A window, then the full equipment again from today: the window ends the day before, so this week is planned as before the window.
 const back=copy(t);step(back,win(['DUMBBELLS','BENCH'],'05:00:00')(back.p));step(back,at(back.p,3,0,'06:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}}));
 assert.equal(rows(back.p),rows(t.p));assert.equal(back.p.canonical.equipmentWindows,undefined);
 // A race-day strength rest and the race share a day: their order follows the plan whichever sports the last change re-planned.
 const r=start({id:'t7a1-c5o',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},6),r0=r.p.weeks[6].startDate;
 const o=bothOrders(r,6,p=>at(p,6,0,'05:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:r0,to:addDays(r0,6)}}),p=>at(p,6,0,'06:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(r0,7)}}));
 assert.equal(whole(o.A,6),whole(o.B,6));
});

test('R7-A.1 C4/C6: a re-applied adaptation changes only the re-planned rows; a move whose slot is history is consumed; a newer return replaces the earlier one',()=>{
 // A missed Monday key run moved to Thursday (runs Monday, Wednesday, Thursday, Saturday).
 const m=start({id:'t7a1-c4m',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{runDays:[0,2,3,5],longRunDay:5,strengthDays:[1,4]}},6),q=m.p.weeks[6].sessions.find(s=>s.role==='QUALITY');
 const moved=step(m,at(m.p,6,q.day,'20:00:00',{kind:'MISSED_SESSION',targetSessionId:q.id})),slot=m.p.weeks[6].sessions.find(s=>s.moved?.from===q.id);
 assert.equal(moved.action,'MOVE');assert.ok(slot&&slot.day>q.day,'moved later in the week');
 // A strength-only re-plan (equipment) the same evening: the run rows stay exactly as the move left them.
 const runs=P=>JSON.stringify(P.weeks[6].sessions.filter(s=>s.sport==='RUN')),e=copy(m),r0=runs(e.p);
 step(e,at(e.p,6,q.day,'21:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));assert.equal(runs(e.p),r0);
 // Once the slot is history, an event change that re-plans the rest of the week leaves the target and the slot as they are.
 const history=line(m.p,6,0).filter((x,i)=>m.p.weeks[6].sessions[i].day<=slot.day);
 step(m,at(m.p,6,slot.day,'20:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(m.p.weeks[6].startDate,9)}}));
 assert.deepEqual(line(m.p,6,0).filter((x,i)=>m.p.weeks[6].sessions[i].day<=slot.day),history);
 // A 16-day return, then its correction to 5 days the same morning: the week is as if the 5-day return alone had been reported.
 // R7-A final (Founder §8, 0.4): a correction names the interruption it corrects (interruption.episodeId); dates alone are asked.
 const r=start({id:'t7a1-c5r'},3),ret=(days,h)=>p=>at(p,3,5,h,travel(p,3,5,days)),named=x=>p=>{const y=x(p);return {...y,interruption:{...y.interruption,episodeId:p.decisions.filter(d=>d.action==='REESTABLISH').at(-1).interruption.episode}};};
 const corrected=copy(r),direct=copy(r);step(corrected,ret(16,'07:00:00')(corrected.p));assert.equal(step(copy(corrected),ret(5,'08:00:00')(corrected.p)).status,'ASK');step(corrected,named(ret(5,'08:00:00'))(corrected.p));step(direct,ret(5,'08:00:00')(direct.p));
 assert.equal(line(corrected.p,3,5).join('\n'),line(direct.p,3,5).join('\n'));assert.equal(whole(corrected.p,3),whole(direct.p,3));
 const late=copy(r),sun=(days,h)=>p=>at(p,3,6,h,travel(p,3,6,days));step(late,sun(16,'07:00:00')(late.p));step(late,named(sun(5,'08:00:00'))(late.p));
 assert.equal((late.p.weeks[3].adaptations??[]).filter(a=>a.kind==='RETURN_WAIT').length,1,'one wait, from the newer report');
});

test('R7-A.1 I6: a week reduced for fatigue is a reduction for the return ceiling; only a time fit is not (QE-R7A-14, SSCTR FR2, R20)',()=>{
 // A full-dose week (no phase reduction), reduced for fatigue on Monday and executed as reduced: the ceiling keeps the last whole count.
 const t=start({id:'t7a1-fr'},5),squat=()=>t.p.weeks[5].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat'));
 const before=t.p.stateTrace[5].strength.exercises['back-squat'].lastExecutedSets;
 assert.ok(Number.isInteger(before)&&squat().length&&squat().every(e=>e.exposure.phasedSets===e.exposure.baseSets),'a full-dose week');
 step(t,at(t.p,5,0,'05:00:00',{kind:'SYSTEMIC_FATIGUE'}));weekly(t,5);
 assert.ok(squat().every(e=>e.sets<e.exposure.baseSets),'every squat exposure of the week was reduced');
 assert.equal(t.p.stateTrace[6].strength.exercises['back-squat'].lastExecutedSets,before);
});

test('R7-A.1 QE-R7A-05: two agreeing reports from equal sources that tie on every criterion merge by content, never by their labels',()=>{
 const report=(id,reps)=>({eventId:id,athleteId:'a',sessionId:'w0-str-d0',observedAt:'2026-11-02T19:00:00Z',actual:{completed:true,minutes:40,exercises:[{id:'back-squat',sets:reps.map(r=>({load:{value:80,unit:'KG',convention:'TOTAL'},reps:r,rir:2}))}]},response:{...OK}});
 const merge=list=>normalizeObservations(list,{athleteId:'a',asOf:'2026-11-03T00:00:00Z',loadIncrements:{TOTAL:2.5}}).accepted;
 const one=merge([report('t1',[5,5,4]),report('t2',[4,5,5])]),swapped=merge([report('t2',[5,5,4]),report('t1',[4,5,5])]);
 assert.equal(one.length,1);assert.equal(JSON.stringify(one[0].actual.exercises),JSON.stringify(swapped[0].actual.exercises));
});

test('R7-A.1 C5: of two statements of one event date the later is the event in either order; its taper and race window follow it (SSCTR S4)',()=>{
 const t=start({id:'t7a1-c5d',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},6),d0=t.p.weeks[6].startDate;
 const reach={kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(d0,7)}},later={kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(t.p.goal.run.event.date,14)}};
 for(const [first,second] of [[reach,later],[later,reach]]){
  const both=copy(t),alone=copy(t);step(both,at(both.p,6,0,'05:00:00',first));step(both,at(both.p,6,0,'06:00:00',second));step(alone,at(alone.p,6,0,'06:00:00',second));
  assert.equal(whole(both.p,6),whole(alone.p,6));
 }
});

test('R7-A.1 C4: a later adaptation keeps the week’s earlier ones on what it moves; a move never uses a skipped slot; a late fatigue signal survives the review',()=>{
 // Tuesday's quality run missed; a short return the same evening, a systemic fatigue report, or Thursday made unavailable, reported first.
 const t=start({id:'t7a1-c4b'},3),q=t.p.weeks[3].sessions.find(s=>s.role==='QUALITY'),thu=t.p.weeks[3].sessions.find(s=>s.day===3&&s.sport==='RUN');
 assert.equal(q.day,1);
 const ahead=(P,day)=>P.weeks[3].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED'&&s.day>day);
 const missed=(p,day)=>at(p,3,day,'21:00:00',{kind:'MISSED_SESSION',targetSessionId:q.id});
 const sr=copy(t);step(sr,at(sr.p,3,1,'20:00:00',travel(sr.p,3,1,5)));step(sr,missed(sr.p,1));
 assert.ok(!ahead(sr.p,1).some(s=>s.role==='QUALITY'),'the first quality slot after a short break runs easy');
 const sf=copy(t);step(sf,at(sf.p,3,2,'20:00:00',{kind:'SYSTEMIC_FATIGUE'}));step(sf,missed(sf.p,2));
 assert.ok(!ahead(sf.p,2).some(s=>['QUALITY','RACE_TOUCH'].includes(s.role)),'no hard run after converging fatigue');
 const ud=copy(t);step(ud,at(ud.p,3,2,'20:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[thu.date]}}));assert.notEqual(step(ud,missed(ud.p,2)).action,'MOVE','no move into the skipped slot');
 assert.ok(!ahead(ud.p,2).some(s=>s.date===thu.date),'nothing moves onto the unavailable day');
 // A systemic fatigue report with nothing left to reduce reviews the week with its signal; the weekly reports after it keep the signal.
 const A=copy(t),B=copy(t),reports=(p,h)=>at(p,3,6,h,{observations:p.weeks[3].sessions.filter(s=>s.prescription).map(s=>obs(p,s))});
 step(A,at(A.p,3,6,'20:00:00',{kind:'SYSTEMIC_FATIGUE'}));step(A,reports(A.p,'21:00:00'));step(B,reports(B.p,'20:00:00'));step(B,at(B.p,3,6,'21:00:00',{kind:'SYSTEMIC_FATIGUE'}));
 assert.equal(whole(A.p,3),whole(B.p,3));
});

test('R7-A.1 C4/C5: a waiting or event-conflict day carries no session in either order; a goal stated from a later date starts there',()=>{
 const r=start({id:'t7a1-c4w',athlete:{goals:{run:RACE,strength:'STRENGTH'}},schedule:{strengthDays:[0,3]}},6),last=r.p.weeks[6].sessions.filter(s=>s.prescription).at(-1);
 const ret=(days,day,h)=>p=>at(p,6,day,h,travel(p,6,day,days)),off=(kind,day,h)=>p=>at(p,6,day,h,{kind,changes:{unavailableDates:[last.date]}});
 for(const [x,y,day] of [[16,'UNAVAILABLE_DAY',5],[5,'EVENT_WEEK_CONFLICT',4]]){
  const A=copy(r),B=copy(r);step(A,ret(x,day,'20:00:00')(A.p));step(A,off(y,day,'21:00:00')(A.p));step(B,off(y,day,'20:00:00')(B.p));step(B,ret(x,day,'21:00:00')(B.p));
  assert.equal(line(A.p,6).join('\n'),line(B.p,6).join('\n'),y);
 }
 const g=start({id:'t7a1-c5g'},2),dated=step(g,at(g.p,2,1,'07:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'},from:g.p.weeks[5].startDate}}));
 assert.equal(dated.proposal.decisions.at(-1).fromWeek,5);assert.equal(g.p.contextBefore.at(-1).goal.strength.kind,'STRENGTH');assert.equal(g.p.goal.strength.kind,'HYPERTROPHY');
});
