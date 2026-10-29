// DOMAIN_COACHING_R7-A boundary closure: week-start state authority (Founder request §0.1, §7–§16; QE-R7AF-01;
// audits/domain-coaching-r7a-boundary-2026-10-28/WEEK_START_AUTHORITY_CONTRACT.md). A week's start records why it holds its state; only an
// evidence-anchored start is reused as what the athlete had executed when an interruption began. Each test names the invariant (I1–I8), the
// family (A–H) or the property (P1–P5) it covers. Development authority; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id,schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7ab-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** A report of session s executed as prescribed on its date and shift; a chosen load is logged at 20 kg unless `kg` gives one. */
function obs(p,s,{kg=null,actual=null,response=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:kg?.(e.id)??20,unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));
 return {eventId:`t7ab-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK,...(response??{})}};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review)=>{const r=evaluate(t,review);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??[])}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s))}));
/** Sessions of week w reported on their own evening, one mid-week review each: nothing consolidates the week (its review never runs). */
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)))step(t,at(t.p,w,s.day,s.day===6?'05:00:00':'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));};
const start=(ia,weeks)=>{const g=generateProgram(intake(ia),opts);assert.ok(g.program,`${ia.id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
const lastReturn=P=>P.decisions.filter(d=>d.action==='REESTABLISH').at(-1);
const strengthRows=(P,w,from=null)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&(!from||s.date>=from)).flatMap(s=>s.prescription.exercises.map(e=>({date:s.date,e})));
const preBreakDose=(P,w,from)=>strengthRows(P,w,from).filter(({e})=>e.load.mode==='KNOWN'&&e.sets>=3);
const runs=(P,w,from)=>P.weeks[w].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.date>=from).map(s=>s.prescription.durationMinutes);
/** The state facts a return starts from: last performed dates and bookkeeping aside. */
const facts=st=>JSON.stringify({run:{...st.run,planned:undefined},strength:{...st.strength,planned:undefined,entryWeek:undefined,exercises:Object.fromEntries(Object.entries(st.strength.exercises).sort().map(([k,{lastPerformed,...e}])=>[k,e]))}});
const stepsOf=st=>({run:st.run.returnStep??null,strength:Object.fromEntries(Object.entries(st.strength.exercises).map(([k,e])=>[k,e.returnStep??null]))});
/** The loads the record shows logged for an exercise (state model: no history is above them). */
const lifted=(t,id)=>t.ledger.filter(o=>o.logs?.[id]&&Number.isFinite(o.logs[id].load)).map(o=>o.logs[id].load);
/** Weeks 0-2 trained and reviewed, 3-4 untrained (the first break), then A: a 16-day return on Monday 06:00 of week 5 (re-entry that week). */
function afterReturn(id){
 const t=start({id},3);weekly(t,3,()=>false);weekly(t,4,()=>false);
 const d0=t.p.weeks[5].startDate;step(t,at(t.p,5,0,'06:00:00',brk(addDays(d0,-16),addDays(d0,-1))));
 return {t,d0,A:lastReturn(t.p)};
}
/** B: a separate two-day trip, Tuesday and Wednesday of week 6, reported Thursday 06:00. */
const tripB=(t,d0,{from=8,to=9,said=10}={})=>{const r=step(t,at(t.p,Math.floor((Date.parse(addDays(d0,said))-Date.parse(t.p.startDate))/(7*864e5)),(said%7+7)%7,'06:00:00',brk(addDays(d0,from),addDays(d0,to))));assert.equal(r.action,'REESTABLISH',r.reason);return lastReturn(t.p);};
/** Sunday's long run of the re-entry week reported on Monday of week 6, in week 6's first review: the re-entry week is never consolidated. */
const sundayOnMonday=(t,o={})=>step(t,at(t.p,6,0,'06:00:00',{observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s,o))}));
// The loads the re-entry rows keep as their ceiling: logging them is executing the week exactly as its projection assumed.
const atKnown=t=>({kg:id=>t.p.stateTrace[5].strength.exercises[id]?.load??20});

test('R7-A boundary §14 QE-R7AF-01: after an unfinished, unreviewed re-entry week, no later decision makes the projected week start history',()=>{
 const {t,d0,A}=afterReturn('t7ab-qe');perDay(t,5,s=>s.day<3);
 assert.equal(t.p.weeks[6].startAuthority.authority,'PROJECTED','the return projects week 6 (I1)');
 const ctl=copy(t),control=tripB(ctl,d0),after=P=>[...runs(P,6,addDays(d0,10)),...runs(P,7,addDays(d0,14))];
 assert.equal(control.interruption.stateAt.kind,'RETURN');assert.equal(control.interruption.stateAt.eventId,A.eventId);
 for(const [label,x] of [['equipment window',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}}],['equipment, full kit (recorded, no change)',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:addDays(d0,21),to:addDays(d0,24)}}],['systemic fatigue',{kind:'SYSTEMIC_FATIGUE'}]]){
  const u=copy(t);step(u,at(u.p,6,0,'06:00:00',x));
  // The stored start is still the plan, whatever was stored since (I3).
  assert.equal(u.p.weeks[6].startAuthority.authority,'PROJECTED',`${label}: week 6 start`);
  const B=tripB(u,d0);
  assert.equal(B.interruption.relation,'NEW',label);assert.equal(B.interruption.stateAt.kind,'RETURN',`${label}: B starts from the re-entry, not from week 6's projected start`);
  assert.equal(facts(B.interruption.entry),facts(control.interruption.entry),`${label}: B's start equals the control's (I4, I8)`);
  assert.equal(B.interruption.entry.run.returnStep,0,`${label}: no unexecuted run return step`);
  assert.deepEqual(after(u.p),after(ctl.p),`${label}: the runs after B are the control's`);
  for(const w of [6,7])assert.deepEqual(preBreakDose(u.p,w,addDays(d0,10)),[],`${label} week ${w}: no pre-break dose`);
 }
});
test('R7-A boundary I2 (§7): every return records why its state point holds authority as history',()=>{
 const {t,d0,A}=afterReturn('t7ab-i2');
 assert.deepEqual(A.interruption.stateAt.authority,{RUN:'WEEK_EVIDENCE',STRENGTH:'WEEK_EVIDENCE'},'A: week 2, set by the review of week 1');
 perDay(t,5,s=>s.day<3);const B=tripB(t,d0);
 assert.deepEqual(B.interruption.stateAt.authority,{RUN:'RETURN_ENTRY',STRENGTH:'RETURN_ENTRY'});
 assert.deepEqual(t.p.weeks[5].startAuthority.RUN.provenance,'RETURN_ENTRY');assert.ok(t.p.weeks[5].startAuthority.RUN.evidenceThrough);
});
test('R7-A boundary I5/P3 (families D, E): execution promotes authority only through evidence; review and completed sessions agree',()=>{
 const {t,d0}=afterReturn('t7ab-i5');
 // Executed exactly as projected (the known loads the re-entry rows keep), never reviewed: completed sessions anchor week 6 (§10).
 const a=copy(t);perDay(a,5,s=>s.day<6,atKnown(a));sundayOnMonday(a,atKnown(a));
 const A6=tripB(a,d0);assert.equal(A6.interruption.stateAt.week,6);assert.deepEqual(A6.interruption.stateAt.authority,{RUN:'COMPLETED_SESSIONS',STRENGTH:'COMPLETED_SESSIONS'});
 // The same week reviewed on Sunday: the weekly review's rule (P2: the same base).
 const b=copy(t);perDay(b,5,s=>s.day<6,atKnown(b));weekly(b,5,()=>false);
 const B6=tripB(b,d0);assert.equal(B6.interruption.stateAt.week,6);assert.ok(['WEEK_EVIDENCE','COMPLETED_SESSIONS'].includes(B6.interruption.stateAt.authority.RUN));
 assert.deepEqual(stepsOf(A6.interruption.entry),stepsOf(B6.interruption.entry),'executed and reviewed give the same steps');
 assert.equal(A6.interruption.entry.run.returnStep,1);
 // State model: lifting lighter than the rows kept is still a week the athlete executed, so it is evidence: the next start is anchored on the
 // athlete's own executed state, and the known load is the 20 kg lifted, never the 82.5 the return rows carried as a ceiling.
 const c=copy(t);perDay(c,5,s=>s.day<6,{kg:()=>20});sundayOnMonday(c);
 const C=tripB(c,d0);assert.deepEqual([C.interruption.stateAt.kind,C.interruption.stateAt.week],['WEEK_START',6]);
 assert.deepEqual(C.interruption.stateAt.authority,{RUN:'COMPLETED_SESSIONS',STRENGTH:'COMPLETED_SESSIONS'});
 assert.equal(C.interruption.entry.strength.exercises['back-squat'].load,20,'the load lifted');
 for(const [id,e] of Object.entries(C.interruption.entry.strength.exercises))if(e.mode==='KNOWN')assert.ok(e.load<=20,'no load above what was lifted: '+id);
});
test('R7-A boundary I1/I3 (family H, P5): time alone, a week boundary or a stored field never makes a projection history',()=>{
 const {t,d0,A}=afterReturn('t7ab-h');
 for(const o of [{},{from:15,to:16,said:17}]){const B=tripB(copy(t),d0,o);assert.equal(B.interruption.stateAt.kind,'RETURN',JSON.stringify(o));assert.equal(facts(B.interruption.entry),facts(A.interruption.entry),'nothing executed: B starts from A\'s re-entry');}
 // The same executed history (Tuesday's run, Wednesday's lift), B on Sunday of week 5 or on Monday of week 6: the same steps (P5).
 const x=copy(t);perDay(x,5,s=>s.day<3);const sun=tripB(x,d0,{from:6,to:7,said:8});
 const y=copy(t);perDay(y,5,s=>s.day<3);const mon=tripB(y,d0,{from:7,to:8,said:9});
 assert.deepEqual(stepsOf(sun.interruption.entry),stepsOf(mon.interruption.entry));
});
test('R7-A boundary §13 premise: a week executed, but not as its projection assumed, never makes the projected start history',()=>{
 const {t,d0}=afterReturn('t7ab-premise');
 const thursday=s=>s.day===3;
 const cases={
  'reported not done':u=>perDay(u,5,s=>s.day<6,s=>thursday(s)?{actual:{completed:false,minutes:0}}:atKnown(u)),
  partial:u=>perDay(u,5,s=>s.day<6,s=>thursday(s)?{actual:{completed:true,minutes:5}}:atKnown(u)),
  adverse:u=>perDay(u,5,s=>s.day<6,s=>thursday(s)?{response:{recovery:'ADVERSE'}}:atKnown(u)),
  'skipped (unavailable day)':u=>{step(u,at(u.p,5,0,'08:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(d0,3)]}}));perDay(u,5,s=>s.day<6,atKnown(u));},
  'reduced (systemic fatigue)':u=>{step(u,at(u.p,5,0,'08:00:00',{kind:'SYSTEMIC_FATIGUE'}));perDay(u,5,s=>s.day<6,atKnown(u));}
 };
 // State model (per sport, SSCTR R40): a sport whose week was not executed as prescribed goes back to the re-entry; a sport that executed every
 // row as finally prescribed is evidence, whoever reduced those rows. The systemic report reduced only strength rows, and the athlete executed
 // the reduced week, so both sports are evidence there; in every other case the session that was not executed holds its sport.
 for(const [label,fn] of Object.entries(cases)){const u=copy(t);fn(u);sundayOnMonday(u,atKnown(u));const B=tripB(u,d0),executed=label==='reduced (systemic fatigue)';
  assert.equal(B.interruption.stateAt.kind,executed?'WEEK_START':'RETURN',label);assert.equal(B.interruption.entry.run.returnStep,executed?1:0,label);
  if(executed)assert.deepEqual(B.interruption.stateAt.authority,{RUN:'COMPLETED_SESSIONS',STRENGTH:'COMPLETED_SESSIONS'},label);
  else assert.equal(B.interruption.stateAt.authority.RUN,'RETURN_ENTRY',label);
  // Whatever the case, no load above what the athlete lifted in that week reaches the return.
  for(const [id,e] of Object.entries(B.interruption.entry.strength.exercises))if(e.mode==='KNOWN'&&Number.isFinite(e.load)){const l=lifted(u,id);if(l.length)assert.ok(e.load<=Math.max(...l)+1e-9,label+': '+id);}}
});
test('R7-A boundary I4: inside a return, a value a review held from a projected start is not history until a week is executed in full',()=>{
 const {t,d0}=afterReturn('t7ab-held');
 // Saturday's lift missed in week 5 (never consolidated) and again in week 6, which is reviewed: its exercises were never executed.
 perDay(t,5,s=>s.day<5);sundayOnMonday(t);const satOnly=[...new Set(strengthRows(t.p,5).filter(({date})=>date===addDays(d0,5)).map(({e})=>e.id))].filter(id=>!strengthRows(t.p,5).some(({date,e})=>date!==addDays(d0,5)&&e.id===id));
 assert.ok(satOnly.length,'an exercise lifted only on Saturday');
 // State evidence (value-scoped): the start the review of week 6 records names the values it carried from a projection (the Saturday-only
 // exercises among them); history rebuilds those on the re-entry by the review's rule and reads the rest from the start, so the progress
 // executed since the return (the runs of weeks 5 and 6, the lifts of week 6) is kept instead of being walked back to the re-entry.
 const held=copy(t);weekly(held,6,s=>s.day!==5);assert.equal(held.p.weeks[7].startAuthority.authority,'EVIDENCE_ANCHORED');
 // State model: the start records only the review that decided it, and when; history reads the athlete's executed state, never a start's values,
 // so no record of what a start carried from a projection exists (the Saturday-only exercises below are at the re-entry all the same).
 assert.equal(held.p.weeks[7].startAuthority.STRENGTH.projectedBase,undefined);
 const B=tripB(held,d0,{from:15,to:16,said:17});
 assert.deepEqual([B.interruption.stateAt.kind,B.interruption.stateAt.week],['WEEK_START',7]);for(const id of satOnly)assert.equal(B.interruption.entry.strength.exercises[id]?.returnStep,0,id);
 const full=copy(t);weekly(full,6);assert.equal(tripB(full,d0,{from:15,to:16,said:17}).interruption.stateAt.week,7,'week 6 in full');
 // A partial session is not a week executed in full: Saturday's lift of week 6 done with fewer sets is held too.
 const partial=copy(t),sat=partial.p.weeks[6].sessions.find(s=>live(s)&&s.day===5);
 step(partial,at(partial.p,6,6,'21:00:00',{observations:partial.p.weeks[6].sessions.filter(s=>live(s)).map(s=>s===sat?{...obs(partial.p,s),actual:{...obs(partial.p,s).actual,exercises:obs(partial.p,s).actual.exercises.map(e=>({...e,sets:e.sets.slice(0,Math.max(1,e.sets.length-1))}))}}:obs(partial.p,s))}));
 const P=tripB(partial,d0,{from:15,to:16,said:17});
 for(const id of satOnly)assert.equal(P.interruption.entry.strength.exercises[id]?.returnStep,0,'partial '+id);
});
test('R7-A boundary families A, C: an equipment statement on the last day, or an event change that re-plans this week, keeps a projected start projected',()=>{
 const {t,d0}=afterReturn('t7ab-ac');perDay(t,5,s=>s.day<3);
 const control=tripB(copy(t),d0);
 // Sunday 06:00 of the unfinished re-entry week: a strength-only change applies the weekly review's rule to strength only; the run start it
 // keeps is still the plan. State evidence (value-scoped, SSCTR R40): each sport is its own value, so strength is history as the review
 // would make it from the same complete strength week, and the run, still the plan, goes back to the re-entry.
 const sun=copy(t);step(sun,at(sun.p,5,6,'06:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}}));
 assert.equal(sun.p.weeks[6].startAuthority.RUN.provenance,'CONDITIONAL_PLAN');
 const rv=copy(t);weekly(rv,5,()=>false);const reviewed=tripB(rv,d0);
 const S=tripB(sun,d0);assert.equal(S.interruption.stateAt.kind,'RETURN');assert.deepEqual(S.interruption.stateAt.authority,{RUN:'RETURN_ENTRY',STRENGTH:'WEEK_EVIDENCE'});
 assert.equal(facts({run:S.interruption.entry.run,strength:control.interruption.entry.strength}),facts(control.interruption.entry),'the run: the re-entry');
 assert.equal(facts({run:control.interruption.entry.run,strength:S.interruption.entry.strength}),facts({run:control.interruption.entry.run,strength:reviewed.interruption.entry.strength}),'strength: as the review makes it');
 // After the weekly review on Sunday, a later strength-only change re-derives strength from the same evidence: the review's base stands.
 const r=copy(t);weekly(r,5,()=>false);const R=tripB(copy(r),d0);
 step(r,at(r.p,5,6,'22:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(d0,21),to:addDays(d0,24)}}));
 const RE=tripB(r,d0);assert.equal(RE.interruption.stateAt.week,6);assert.equal(facts(RE.interruption.entry),facts(R.interruption.entry));
 // An event moved so that this week's remaining days enter the taper re-plans from this week: the start of this week is kept, and so is its
 // authority (Founder family C).
 const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
 const g=generateProgram({...intake({id:'t7ab-event'}),athlete:{...intake({id:'t7ab-event'}).athlete,goals:{run:RACE,strength:'STRENGTH'}}},opts);
 const e={p:g.program,ledger:[]};for(let w=0;w<3;w++)weekly(e,w);weekly(e,3,()=>false);weekly(e,4,()=>false);
 const e0=e.p.weeks[5].startDate;step(e,at(e.p,5,0,'06:00:00',brk(addDays(e0,-16),addDays(e0,-1))));perDay(e,5,s=>s.day<3);
 const ectl=tripB(copy(e),e0),moved=copy(e),m=step(moved,at(moved.p,6,0,'06:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(e0,14)}}));
 assert.equal(m.proposal.decisions.at(-1).fromWeek,6,'the event change re-plans this week');assert.equal(moved.p.weeks[6].startAuthority.authority,'PROJECTED');
 const EV=tripB(moved,e0);assert.equal(EV.interruption.stateAt.kind,'RETURN');assert.equal(facts(EV.interruption.entry),facts(ectl.interruption.entry));
});
test('R7-A boundary I8/P1/P2 (families A, B, C): equivalent and no-op changes give the same base; none promotes a projection',()=>{
 const {t,d0}=afterReturn('t7ab-p1');perDay(t,5,s=>s.day<3);
 const base=tripB(copy(t),d0);
 const X={sameEquipment:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}},sameSchedule:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:60}},
  sameGoal:{kind:'GOAL_CHANGE',changes:{goals:{strength:'STRENGTH'}}},localFatigue:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}},systemicFatigue:{kind:'SYSTEMIC_FATIGUE'},
  scheduleFromNextWeek:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}},goalFromNextWeek:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},unavailable:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(d0,12)]}}};
 for(const [label,x] of Object.entries(X)){const u=copy(t);step(u,at(u.p,6,0,'06:00:00',x));const B=tripB(u,d0);
  assert.equal(B.interruption.stateAt.kind,'RETURN',label);assert.equal(facts(B.interruption.entry),facts(base.interruption.entry),label);}
 // On Sunday of week 5 the week is complete: the weekly review and a schedule change apply the same rule to it (P2).
 const r=copy(t);weekly(r,5,()=>false);const R=tripB(r,d0);
 const s=copy(t);step(s,at(s.p,5,6,'21:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));const S=tripB(s,d0);
 assert.equal(R.interruption.stateAt.week,6);assert.equal(facts(S.interruption.entry),facts(R.interruption.entry));
 assert.equal(R.interruption.entry.run.returnStep,0,'Thursday\'s run was missed: the run holds');
});
test('R7-A boundary P4 (family F): a correction that removes the evidence a start relied on withdraws its authority',()=>{
 const {t,d0}=afterReturn('t7ab-p4');perDay(t,5,s=>s.day<6,atKnown(t));sundayOnMonday(t,atKnown(t));
 assert.equal(tripB(copy(t),d0).interruption.stateAt.week,6);
 const thu=t.p.weeks[5].sessions.find(s=>live(s)&&s.day===3),orig=t.ledger.find(o=>o.sessionId===thu.id),fix=at(t.p,6,0,'07:00:00');
 step(t,{...fix,observations:[{...obs(t.p,thu),eventId:'t7ab-p4-fix',correctionOf:orig.eventId,correctedAt:fix.asOf,actual:{completed:false,minutes:0}}]});
 assert.equal(tripB(t,d0).interruption.stateAt.kind,'RETURN','recomputed from the corrected record');
});
test('R7-A boundary I6: evidence synced late counts by the time it was executed',()=>{
 const {t,d0}=afterReturn('t7ab-i6');
 // Every session of week 5 executed at the projected loads but synced only on Wednesday of week 6, during B: it was executed before B.
 const late=t.p.weeks[5].sessions.filter(s=>live(s)).map(s=>obs(t.p,s,atKnown(t)));
 step(t,at(t.p,6,2,'20:00:00',{observations:late}));
 const B=tripB(t,d0);assert.equal(B.interruption.stateAt.week,6);assert.equal(B.interruption.entry.run.returnStep,1);
});
test('R7-A boundary I7 (Founder §11): a named correction that contradicts its own executed re-entry is asked; a consistent one applies',()=>{
 const {t,d0,A}=afterReturn('t7ab-i7');perDay(t,5,s=>s.day<3);
 const fix=(u,from,to,said,id=A.interruption.episode)=>evaluate(u,at(u.p,5,said,'06:00:00',brk(addDays(d0,from),addDays(d0,to),{episodeId:id})));
 for(const [label,args] of [['moved after its own re-entry',[3,4,5]],['by its report id',[3,4,5,A.eventId]],['ending over the executed Tuesday run',[-16,1,5]]]){
  const r=fix(copy(t),...args);assert.equal(r.status,'ASK',label);assert.deepEqual(r.missingInputs,['interruption.startDate','interruption.endDate'],label);}
 const ok=copy(t),r=fix(ok,-20,-5,5);assert.equal(r.action,'REESTABLISH');assert.equal(lastReturn(r.proposal).interruption.relation,'SAME_BREAK');
 // With nothing executed since the re-entry, moving the interruption after its first report does not contradict anything.
 const {t:u,d0:e0,A:A2}=afterReturn('t7ab-i7b');
 assert.equal(evaluate(u,at(u.p,5,5,'06:00:00',brk(addDays(e0,3),addDays(e0,4),{episodeId:A2.interruption.episode}))).action,'REESTABLISH');
});
test('R7-A boundary (Founder 0.1, family G): before any return too, a planned week start is history only through evidence',()=>{
 const t=start({id:'t7ab-first'},3),d3=t.p.weeks[3].startDate;
 const breakIn4=u=>{step(u,at(u.p,4,2,'06:00:00',brk(addDays(d3,8),addDays(d3,9))));return lastReturn(u.p);};
 // Week 3 half executed and never reviewed: week 4's planned start assumed the rest.
 const half=copy(t);perDay(half,3,s=>s.day<3);const H=breakIn4(half);
 assert.notEqual(H.interruption.stateAt.week,4);assert.ok(Object.values(H.interruption.stateAt.authority).every(b=>b!=='PROJECTED'));
 const full=copy(t);weekly(full,3);assert.equal(breakIn4(full).interruption.stateAt.week,4);
});
