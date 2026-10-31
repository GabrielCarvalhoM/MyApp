// COACHING CORE — STATE EVIDENCE MODEL: value-scoped fact vs projection (Founder request 2026-10-28, STATE_EVIDENCE_AUTHORITY = VALUE_SCOPED;
// audits/domain-coaching-r7a-state-evidence-2026-10-28/STATE_EVIDENCE_CONTRACT.md). The plan may project the future; only what the athlete
// executed writes history, value by value: a week start, a review or a boundary never lends its authority to a value it carried. Each test
// names the Founder's §18 case, family (A–K), invariant (I1–I11) or property (P1–P7) it covers. Development authority; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
// R7-B fixture pin (audits/domain-coaching-r7-b-2026-10-31/TEST_CHANGES_R7B.md): the bound catalog's selection order puts a goal-purpose match
// before external loading, which picks bulgarian-split-squat-db for this STRENGTH-goal lunge slot; the athlete is declared familiar with
// db-split-squat (no dose) so these R7-A assertions keep their exercise. No assertion changed.
const R7B_LUNGE_PIN={id:'db-split-squat',familiar:true};
const intake=({id,schedule={},athlete={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND'),R7B_LUNGE_PIN],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7se-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** A report of session s executed as prescribed on its date and shift; a chosen load is logged at 20 kg unless `kg` gives one; `sets` edits a set. */
function obs(p,s,{kg=null,set=null,actual=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x):x;})}));
 return {eventId:`t7se-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK}};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review)=>{const r=evaluate(t,review);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason} ${JSON.stringify(r.errors??[])}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,WED=s=>s.sport==='STRENGTH'&&s.day===2;
const weekly=(t,w,keep=()=>true,o={})=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
/** Sessions of week w reported on their own evening and Sunday's on Monday 06:00: one mid-week review each, so the week is never reviewed. */
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))step(t,at(t.p,w,s.day,'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));
 step(t,at(t.p,w+1,0,'06:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));};
const start=(id,weeks,o={})=>{const g=generateProgram(intake({id,...o}),opts);assert.ok(g.program,`${id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate)=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel'}});
/** B: a separate trip in week k (Tuesday-Wednesday by default), reported the day after it ends at 06:00. */
const B=(t,k,{from=1,to=2}={})=>{const d=t.p.weeks[k].startDate;const r=step(t,at(t.p,Math.floor((Date.parse(addDays(d,to+1))-Date.parse(t.p.startDate))/(7*864e5)),(to+1)%7,'06:00:00',brk(addDays(d,from),addDays(d,to))));assert.equal(r.action,'REESTABLISH',r.reason);return t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1);};
const ex=(d,id)=>d.interruption.entry.strength.exercises[id];
const lifted=(t,id)=>t.ledger.filter(o=>o.logs?.[id]&&Number.isFinite(o.logs[id].load)).map(o=>o.logs[id].load);
/** The judge's P40 history (QE-R7AB-01): weeks 0-1 trained and reviewed; week 2 executed but for Saturday's lift and never reviewed (U), or
 * reviewed with the same facts (R); week 3 Saturday's lift missed again and the week reviewed. */
const p40=(id,cell)=>{const t=start(id,2);if(cell==='U')perDay(t,2,s=>!SAT(s));else weekly(t,2,s=>!SAT(s));weekly(t,3,s=>!SAT(s));return t;};

test('State evidence §18 P40 (QE-R7AB-01, families A, F, H; I1, I2, I9): a review never makes a projected load history; the plan keeps projecting it',()=>{
 const U=p40('t7se-p40-u','U'),R=p40('t7se-p40-r','R');
 // The plan of week 3 projected 22 kg for db-rdl and db-split-squat (week 2's Saturday assumed lifted); they were last lifted at 20 kg.
 for(const id of ['db-rdl','db-split-squat']){assert.equal(U.p.stateTrace[3].strength.exercises[id].load,22,id);assert.equal(Math.max(...lifted(U,id)),20,id);}
 // State model: the start of week 4 records only that the review of week 3 decided it, and when. History never reads a start's values, so no
 // record of what a start carried from a projection exists any more; the plan of week 3, made before those facts were reviewed, held 22 (above).
 const a=U.p.weeks[4].startAuthority;assert.equal(a.STRENGTH.provenance,'WEEK_EVIDENCE');assert.ok(a.STRENGTH.evidenceThrough,'the clock of the evidence it read');
 assert.equal(a.STRENGTH.projectedBase,undefined,'no projected-base record: history is not rebuilt from the start');
 // That review read the facts: its gate holds the exercises the athlete did not lift, at the dose the athlete has (20), as the reviewed control
 // does. The planner keeps projecting above history where a gate allows it (I7, T3): week 3's own plan is still the 22 it projected.
 assert.equal(U.p.stateTrace[4].strength.exercises['db-rdl'].load,R.p.stateTrace[4].strength.exercises['db-rdl'].load,'the review of week 3 plans what the control plans');
 // A first interruption reads history: 20 kg, as the reviewed control, with the date it was last executed.
 const bu=B(copy(U),4),br=B(copy(R),4);
 for(const id of ['db-rdl','db-split-squat']){assert.equal(ex(bu,id).load,20,'historical = 20: '+id);assert.deepEqual(ex(bu,id),ex(br,id),id);assert.equal(ex(bu,id).lastPerformed,'2026-11-14',id);
  // State model: the value is history by the review's own rule applied to the athlete's executed state (no rebuild of a start's value).
  assert.deepEqual(bu.interruption.stateAt.values.STRENGTH[id],{basis:'WEEK_EVIDENCE',week:4},id);}
 // No value of U is more progressed than its control's: what U lacks is the unreviewed week's own steps (SSCTR S-A: they wait for a review).
 for(const [id,e] of Object.entries(br.interruption.entry.strength.exercises)){const u=ex(bu,id);assert.ok(u.load<=e.load,id);assert.ok(!(u.load===e.load&&(u.loadTick??0)>(e.loadTick??0)),id);assert.ok(!((u.lastExecutedSets??0)>(e.lastExecutedSets??0)),id);}
 // A moderate return takes the last executed load as its ceiling (family H).
 const mu=B(copy(U),4,{from:1,to:14});for(const id of ['db-rdl','db-split-squat'])assert.equal(ex(mu,id).load,20,'ceiling: '+id);
});

test('State evidence families B, I (P4, §11 completed execution): a projected load the athlete then lifts becomes history',()=>{
 const t=start('t7se-b',2);perDay(t,2,s=>!SAT(s));const prescribed=t.p.stateTrace[3].strength.exercises['db-rdl'].load;assert.equal(prescribed,22);
 const reviewed=copy(t);weekly(reviewed,3);const unreviewed=copy(t);perDay(unreviewed,3,()=>true);
 for(const [label,u] of [['reviewed',reviewed],['unreviewed',unreviewed]]){
  assert.equal(Math.max(...lifted(u,'db-rdl')),22,label);
  for(const d of [B(copy(u),4),B(copy(u),4,{from:1,to:14})])assert.equal(ex(d,'db-rdl').load,22,`${label}: the lifted 22 is history`);}
 // The step the projection took is now taken: 22 kg with the projection's own load ticks, never a tick counted at 20 kg carried onto 22 kg.
 assert.equal(ex(B(copy(unreviewed),4),'db-rdl').loadTick,t.p.stateTrace[3].strength.exercises['db-rdl'].loadTick);
});

test('State evidence §8 last performed date: completed sessions verify a projection, its dates are the executed ones',()=>{
 // Week 3 executed exactly as projected and never reviewed, Wednesday's lift done on Thursday: the projection is history, with Thursday.
 const t=start('t7se-date',3),wed=t.p.weeks[3].sessions.find(WED);
 for(const s of t.p.weeks[3].sessions.filter(s=>live(s)&&s.day<6)){const o=obs(t.p,s);if(s===wed)o.observedAt=`${addDays(s.date,1)}T19:00:00Z`;step(t,at(t.p,3,s===wed?3:s.day,'21:00:00',{observations:[o]}));}
 step(t,at(t.p,4,0,'06:00:00',{observations:t.p.weeks[3].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 const d=B(copy(t),4);assert.equal(d.interruption.stateAt.authority.STRENGTH,'COMPLETED_SESSIONS');
 assert.equal(ex(d,'back-squat').lastPerformed,addDays(wed.date,1),'the date it was executed, not the date planned');
});

test('State evidence family C (§13, I5): partial evidence promotes only what was observed',()=>{
 const run=(id,set)=>{const t=start(id,2);perDay(t,2,s=>!SAT(s));weekly(t,3,()=>true,s=>SAT(s)?{set:(eid,x)=>set(eid,x)}:{});return t;};
 // Repetitions not logged: the load lifted is known (22 kg, the plan's), the repetition target stays the plan's; nothing else is counted.
 const reps=run('t7se-c-reps',(id,{reps,...x})=>x),dr=B(copy(reps),4);
 assert.equal(ex(dr,'db-rdl').load,22);assert.equal(ex(dr,'db-rdl').reps,reps.p.stateTrace[3].strength.exercises['db-rdl'].reps,'reps: the target, not a logged count');
 assert.equal(ex(dr,'db-rdl').lastExecutedSets,3,'no count is promoted without its target met');
 // A load in an unknown unit: the load is not known, so the history keeps the last known load, never the planned 22 (unknown != planned).
 const unit=run('t7se-c-unit',(id,x)=>x.load?.unit==='KG'?{...x,load:{...x.load,unit:'STONE'}}:x),du=B(copy(unit),4);
 assert.equal(ex(du,'db-rdl').load,20,'unknown is not the projection');assert.equal(ex(du,'db-rdl').lastPerformed,unit.p.weeks[3].sessions.find(SAT).date,'performed: a fact');
});

test('State evidence I2, I3 (QE-R7AB-01 through completed sessions): a week executed in full verifies a projection only on a base the athlete executed',()=>{
 // Development weeks: week 4 unreviewed with Saturday's lift missed, week 5 executed in full and never reviewed, B in week 6; the control
 // reviews both weeks. Week 6's projection assumed week 4's Saturday lifted (a load step for its exercises): it is not history.
 const base=start('t7se-cs',4),u=copy(base),r=copy(base);perDay(u,4,s=>!SAT(s));perDay(u,5,()=>true);weekly(r,4,s=>!SAT(s));weekly(r,5);
 const projected=u.p.stateTrace[6].strength.exercises['db-rdl'].load,U=B(u,6),R=B(r,6);
 assert.ok(projected>Math.max(...lifted(u,'db-rdl')),'the projection stepped db-rdl beyond what was lifted');
 assert.equal(ex(U,'db-rdl').load,Math.max(...lifted(u,'db-rdl')),'history: the load lifted');
 // State model: no value of U is above what U's athlete lifted, and where both cells lifted the same loads U is not ahead of its control. U's
 // plan ran ahead and the athlete executed it on some exercises, so U lifted more there: that is a fact (I3), not a promoted projection.
 for(const [id,e] of Object.entries(R.interruption.entry.strength.exercises)){const a=ex(U,id),mine=lifted(u,id),theirs=lifted(r,id);
  if(mine.length)assert.ok(a.load<=Math.max(...mine)+1e-9,'U above its own facts: '+id);
  if(JSON.stringify(mine)===JSON.stringify(theirs)){assert.ok(!(a.load>e.load),id);assert.ok(!(a.load===e.load&&(a.loadTick??0)>(e.loadTick??0)),id);}}
});

test('State evidence family C unreviewed (§13): a load logged in an unknown unit is no load, and verifies no projection',()=>{
 // Week 2 unreviewed with Saturday's lift missed, so week 3 prescribes the projected 22 kg; week 3's Saturday lift logged in an unknown unit
 // and never reviewed; B in week 4. History keeps the last known 20 kg, never the 22 kg the row planned.
 const t=start('t7se-c-unit2',2),stone=o=>({...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>x.load?.unit==='KG'?{...x,load:{...x.load,unit:'STONE'}}:x)}))}});
 perDay(t,2,s=>!SAT(s));const planned=t.p.weeks[3].sessions.find(SAT).prescription.exercises.find(e=>e.id==='db-rdl').load.value;assert.equal(planned,22);
 for(const s of t.p.weeks[3].sessions.filter(s=>live(s)&&s.day<6)){const o=obs(t.p,s);step(t,at(t.p,3,s.day,'21:00:00',{observations:[SAT(s)?stone(o):o]}));}
 step(t,at(t.p,4,0,'06:00:00',{observations:t.p.weeks[3].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 const d=B(t,4);assert.equal(ex(d,'db-rdl').load,20,'the last known load, not the planned one');assert.notEqual(d.interruption.stateAt.values.STRENGTH['db-rdl'].week,4,'week 4\'s projection is not db-rdl\'s history');
});

test('State evidence family C, completed sessions (§13): an unreadable load in a week otherwise executed as projected verifies nothing',()=>{
 // Weeks 0-4 reviewed; week 5 executed in full and never reviewed, its Saturday loads logged in an unknown unit; B in week 6. Week 6's
 // projection stepped db-rdl on loads the record cannot read: history keeps week 5's start for it.
 const t=start('t7se-c-cs',5),stone=o=>({...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>x.load?.unit==='KG'?{...x,load:{...x.load,unit:'STONE'}}:x)}))}});
 const before=t.p.stateTrace[5].strength.exercises['db-rdl'];
 for(const s of t.p.weeks[5].sessions.filter(s=>live(s)&&s.day<6)){const o=obs(t.p,s);step(t,at(t.p,5,s.day,'21:00:00',{observations:[SAT(s)?stone(o):o]}));}
 step(t,at(t.p,6,0,'06:00:00',{observations:t.p.weeks[5].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 const projected=t.p.stateTrace[6].strength.exercises['db-rdl'],d=B(t,6);
 assert.ok(projected.load>before.load||projected.loadTick!==before.loadTick,'the projection moved db-rdl');
 assert.equal(ex(d,'db-rdl').load,before.load);assert.equal(ex(d,'db-rdl').loadTick,before.loadTick);assert.notEqual(d.interruption.stateAt.values.STRENGTH['db-rdl'].week,6);
});

test('State evidence I3 (a gate is evidence): an exercise executed with an adverse response verifies no projection',()=>{
 // Week 2 executed in full and never reviewed, its Wednesday lift reported adverse: a review would hold that lift, so the projection that
 // stepped it is not what was executed; the reviewed control holds it too.
 const base=start('t7se-gate',2),adverse=(t,s)=>{const o=obs(t.p,s);return WED(s)?{...o,response:{...o.response,recovery:'ADVERSE'}}:o;};
 const u=copy(base),r=copy(base);
 for(const s of u.p.weeks[2].sessions.filter(s=>live(s)&&s.day<6))step(u,at(u.p,2,s.day,'21:00:00',{observations:[adverse(u,s)]}));
 step(u,at(u.p,3,0,'06:00:00',{observations:u.p.weeks[2].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(u.p,s))}));
 step(r,at(r.p,2,6,'21:00:00',{observations:r.p.weeks[2].sessions.filter(live).map(s=>adverse(r,s))}));
 const U=B(u,3),R=B(r,3);assert.notEqual(U.interruption.stateAt.authority.STRENGTH,'COMPLETED_SESSIONS');
 for(const [id,e] of Object.entries(R.interruption.entry.strength.exercises)){const a=ex(U,id);assert.ok(!(a.load>e.load),id);assert.ok(!(a.load===e.load&&(a.loadTick??0)>(e.loadTick??0)),id);}
});

test('State evidence I9 (two steps): a value a review carried from a projection never becomes history through a later projection',()=>{
 // Week 2's long run missed and never reviewed, week 3 reviewed with it missed again (week 4's run start is carried from a projection and
 // rebuilt in history), week 4 executed in full and never reviewed, B in week 5. The control reviews every week.
 const SUN=s=>s.sport==='RUN'&&s.day===6,base=start('t7se-two',2),u=copy(base),r=copy(base);
 perDay(u,2,s=>!SUN(s));weekly(u,3,s=>!SUN(s));perDay(u,4,()=>true);weekly(r,2,s=>!SUN(s));weekly(r,3,s=>!SUN(s));weekly(r,4);
 // State model: the start of week 4 records the review that decided it; no projected-base record exists (history is not rebuilt from a start).
 assert.equal(u.p.weeks[4].startAuthority.RUN.provenance,'WEEK_EVIDENCE');assert.equal(u.p.weeks[4].startAuthority.RUN.projectedBase,undefined);
 // Week 4 was executed in full, so history applies the review's rule to it on its own base (COMPLETED_SESSIONS), never to a projected base.
 const U=B(u,5),R=B(r,5);assert.deepEqual(U.interruption.stateAt.values.RUN,{basis:'COMPLETED_SESSIONS',week:5},'week 4 executed in full, on history\'s own base');
 for(const k of ['easyWeeksDone','qualityStep','thresholdDone','qualityDone','stridesDone'])assert.ok((U.interruption.entry.run[k]??0)<=(R.interruption.entry.run[k]??0),k);
});

test('State evidence P5: a target of 22 kg executed at 21 kg is 21 kg of history',()=>{
 const t=start('t7se-p5',2);perDay(t,2,s=>!SAT(s));const target=t.p.stateTrace[3].strength.exercises['db-rdl'].load;
 perDay(t,3,()=>true,s=>SAT(s)?{kg:(id,e)=>id==='db-rdl'?target-1:e.load.mode==='KNOWN'?e.load.value:20}:{});
 assert.equal(ex(B(copy(t),4),'db-rdl').load,target-1);
});

test('State evidence families D, E (I4, P3): evidence about another sport or exercise moves nothing else',()=>{
 const base=start('t7se-de',2);
 const runs=copy(base),none=copy(base);perDay(runs,2,s=>s.sport==='RUN');perDay(none,2,()=>false);
 assert.deepEqual(B(runs,3).interruption.entry.strength,B(none,3).interruption.entry.strength,'run reports do not move strength (D)');
 const satOnly=[...new Set(base.p.weeks[2].sessions.filter(SAT).flatMap(s=>s.prescription.exercises.map(e=>e.id)))].filter(id=>!base.p.weeks[2].sessions.some(s=>WED(s)&&s.prescription.exercises.some(e=>e.id===id)));
 assert.ok(satOnly.length);
 const w=copy(base),n=copy(base);perDay(w,2,s=>!SAT(s));perDay(n,2,s=>!SAT(s)&&!WED(s));weekly(w,3,s=>!SAT(s));weekly(n,3,s=>!SAT(s));
 const X=B(w,4),Y=B(n,4);for(const id of satOnly)assert.deepEqual(ex(X,id),ex(Y,id),'Wednesday\'s lift does not move '+id+' (E)');
});

test('State evidence families G, K (I8, P1, P2, P7): no week boundary, clock, handler or order makes a projection history',()=>{
 const base=start('t7se-gk',2);perDay(base,2,s=>!SAT(s));
 // Week 3 never reviewed either: a break on Sunday of week 3 or on Monday of week 4 (nothing executed between) starts from the same state.
 const nr=copy(base);perDay(nr,3,s=>!SAT(s)&&s.day<6);
 const bare=st=>JSON.stringify({run:{...st.run,planned:undefined,longByWeek:undefined},strength:st.strength.exercises});
 assert.equal(bare(B(copy(nr),3,{from:6,to:7}).interruption.entry),bare(B(copy(nr),4,{from:0,to:1}).interruption.entry),'P2: time and the week boundary');
 // After the reviewed week 3, no-op and re-planning handlers on Monday of week 4 leave history as it was (P1).
 const rv=copy(base);weekly(rv,3,s=>!SAT(s));const ctl=B(copy(rv),4);
 for(const x of [{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}},{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:'2026-12-20',to:'2026-12-24'}},
  {kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}},{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},{kind:'SYSTEMIC_FATIGUE'},{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:['2026-12-05']}}]){
  const u=copy(rv);step(u,at(u.p,4,0,'06:00:00',x));assert.equal(bare(B(u,4).interruption.entry),bare(ctl.interruption.entry),x.kind);}
 // P7: an equipment statement and a run report, in either order.
 const eq={kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:'2026-12-20',to:'2026-12-24'}};
 const runRep=t=>({observations:t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.day===1).map(s=>obs(t.p,s))});
 const a=copy(rv),b=copy(rv);step(a,at(a.p,4,0,'06:00:00',eq));step(a,at(a.p,4,1,'21:00:00',runRep(a)));step(b,at(b.p,4,1,'09:00:00',runRep(b)));step(b,at(b.p,4,1,'21:00:00',eq));
 assert.equal(bare(B(a,4,{from:2,to:3}).interruption.entry),bare(B(b,4,{from:2,to:3}).interruption.entry),'P7: order');
});

test('State evidence family J (I6, P6): a historical correction replaces the fact it corrects and promotes nothing else',()=>{
 const t=start('t7se-j',3);perDay(t,3,()=>true);
 const wed=t.p.weeks[3].sessions.find(WED),orig=t.ledger.find(o=>o.sessionId===wed.id),squat=orig.actual.exercises.find(e=>e.id==='back-squat'),lighter=squat.sets[0].load.value-5;
 const before=B(copy(t),4),fix=at(t.p,4,0,'07:00:00');
 step(t,{...fix,observations:[{...obs(t.p,wed),eventId:'t7se-j-fix',correctionOf:orig.eventId,correctedAt:fix.asOf,actual:{...orig.actual,exercises:orig.actual.exercises.map(e=>e.id==='back-squat'?{...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:lighter}}))}:e)}}]});
 const after=B(t,4);assert.equal(ex(after,'back-squat').load,lighter,'the corrected load is history');
 for(const [id,e] of Object.entries(before.interruption.entry.strength.exercises))if(id!=='back-squat'){const a=ex(after,id);assert.ok(!(a.load>e.load),id);assert.ok(!(a.load===e.load&&(a.loadTick??0)>(e.loadTick??0)),id);}
});

test('State evidence I7, I10: planning keeps projecting; a first review after unreported weeks plans next week from what was executed, history keeps the facts',()=>{
 // Weeks 0-3 never reported, week 4 executed in full and reviewed: a break starts from what the record shows executed. Decision authority
 // closure (QE-R7ASC-02, Founder 1.2): next week starts from what was executed too. The unreported weeks earn no executed easy week, so they
 // unlock no quality run; the weeks after it are still projected (assumed executed). The earlier version of this test expected week 5 to keep
 // the quality run the projection had unlocked from four unexecuted weeks (declared boundary E10, withdrawn).
 const g=generateProgram(intake({id:'t7se-i7'}),opts),t={p:g.program,ledger:[]},projected=t.p.stateTrace[5].run.easyWeeksDone,quality=w=>t.p.weeks[w].sessions.some(s=>live(s)&&s.role==='QUALITY');
 assert.ok(t.p.weeks[5].sessions.some(s=>live(s)&&s.role==='QUALITY'),'the projection had unlocked quality in week 5');
 weekly(t,4);
 assert.ok(t.p.stateTrace[5].run.easyWeeksDone<=1&&!quality(5),`next week starts from the one executed week (${t.p.stateTrace[5].run.easyWeeksDone}): no quality unlocked`);
 assert.ok(t.p.weeks.slice(6).some((x,i)=>quality(6+i)),'later weeks are still projected');
 const d=B(copy(t),5);
 assert.ok(d.interruption.entry.run.easyWeeksDone<projected,`history counts executed weeks only (${d.interruption.entry.run.easyWeeksDone} < ${projected})`);
 assert.ok(d.interruption.entry.run.easyWeeksDone<=1);
});

test('State evidence I11: the athlete model learns only from reported observations, never from a projection',()=>{
 const t=p40('t7se-i11','U'),reported=new Set(t.ledger.map(o=>o.eventId)),r=evaluate(t,at(t.p,4,1,'21:00:00',{observations:t.p.weeks[4].sessions.filter(s=>live(s)&&s.day===1).map(s=>obs(t.p,s))}));
 assert.ok(r.updatedModel.observations.length>0);for(const o of r.updatedModel.observations)assert.ok(reported.has(o.eventId)||r.actualLedger.some(x=>x.eventId===o.eventId),o.eventId);
});
