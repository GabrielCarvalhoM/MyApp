// COACHING CORE — STATE MODEL CLOSURE: HistoricalState vs PlanningProjection (Founder request 2026-10-28; audits/domain-coaching-r7a-state-
// model-2026-10-28/STATE_MODEL_CONTRACT.md). Planning never writes history: only canonical evidence does, through one reducer. Each test names
// the Founder's required test (T1-T17) or property (P1-P7) it covers. Development authority; synthetic data.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {historicalStateOf} from '../src/r6-adaptation.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,convention='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const intake=({id,schedule={},athlete={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[K('back-squat',3,5,80),K('db-bench-press',3,8,18,'PER_HAND')],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`t7sm-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
/** A report of session s as prescribed; `kg(id,e)` chooses a logged load, `set(id,x)` edits each set, `actual` replaces the whole report. */
function obs(p,s,{kg=null,set=null,actual=null}={}){const pr=s.prescription,a={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')a.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>{const x={load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:kg?.(e.id,e)??(e.load.mode==='KNOWN'?e.load.value:20),unit:'KG',convention:e.load.convention},reps:e.reps,rir:e.rir};return set?set(e.id,x):x;})}));
 return {eventId:`t7sm-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T${s.turn==='PM'?'19:00:00':'08:00:00'}Z`,actual:actual??a,response:{...OK}};}
const evaluate=(t,review)=>evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);
const step=(t,review)=>{const r=evaluate(t,review);assert.ok(!['UNSUPPORTED','HOLD'].includes(r.status),`${review.event.kind}: ${r.status} ${r.reason}`);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;t.last=r;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,WED=s=>s.sport==='STRENGTH'&&s.day===2,RUN=s=>s.sport==='RUN';
const weekly=(t,w,keep=()=>true,o={})=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));
/** Each session reported on its own evening and Sunday's on Monday 06:00, so the week itself is never reviewed. */
const perDay=(t,w,keep,o={})=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))step(t,at(t.p,w,s.day,'21:00:00',{observations:[obs(t.p,s,typeof o==='function'?o(s):o)]}));
 step(t,at(t.p,w+1,0,'06:00:00',{observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s,typeof o==='function'?o(s):o))}));};
const start=(id,weeks,o={})=>{const g=generateProgram(intake({id,...o}),opts);assert.ok(g.program,`${id}: ${g.status} ${g.reason}`);const t={p:g.program,ledger:[]};for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const brk=(startDate,endDate,extra={})=>({kind:'RETURN_AFTER_PAUSE',interruption:{days:Math.round((Date.parse(endDate)-Date.parse(startDate))/864e5)+1,startDate,endDate,reasonCategory:'TRAVEL',reason:'Work travel',...extra}});
/** A trip in week k (Tuesday-Wednesday by default), reported the day after it ends at 06:00. */
const B=(t,k,{from=1,to=2}={})=>{const d=t.p.weeks[k].startDate,r=step(t,at(t.p,k+Math.floor((to+1)/7),(to+1)%7,'06:00:00',brk(addDays(d,from),addDays(d,to))));assert.equal(r.action,'REESTABLISH',r.reason);return t.p.decisions.filter(x=>x.action==='REESTABLISH').at(-1);};
const entry=(d,id)=>d.interruption.entry.strength.exercises[id];
/** HistoricalState at local day `day` of week w, read through the public read-only API. */
const history=(t,w,day=0,hour='06:00:00')=>historicalStateOf(t.p,{asOf:`${addDays(t.p.weeks[w].startDate,day)}T${hour}Z`,actualLedger:t.ledger},opts);
const hex=(H,id)=>H.strength.exercises[id];
const lifted=(t,id)=>t.ledger.filter(o=>o.logs?.[id]&&Number.isFinite(o.logs[id].load)).map(o=>o.logs[id].load);
const IDS=['db-rdl','db-split-squat'];
/** The judge's P40 history: weeks 0-1 trained and reviewed; week 2 executed but for Saturday's lift, never reviewed; week 3 the same and reviewed. */
const p40=id=>{const t=start(id,2);perDay(t,2,s=>!SAT(s));weekly(t,3,s=>!SAT(s));return t;};
/** The judge's P51 history: weeks 0-4 reviewed, then two development weeks executed but for Saturday's lift and never reviewed, so the plan runs
 * two steps ahead of history for the Saturday-only exercises. */
const p51=id=>{const t=start(id,5);perDay(t,5,s=>!SAT(s));perDay(t,6,s=>!SAT(s));return t;};

// ---------- T1, T2: the two blockers ----------

test('T1 (QE-R7ASE-01): a lifted projected dose promotes the load, never the projection\'s load tick',()=>{
 // Week 7's Saturday lift is done at the 24 kg the plan projected but falls short (3 of 5 reps), and the week is reviewed. The projection ran two
 // weeks ahead, so its stored tick at 24 kg counts an exposure the athlete never executed.
 const t=p51('t7sm-t1'),planned=t.p.stateTrace[7].strength.exercises['db-rdl'];
 assert.equal(planned.loadTick,1,'the projection stored a tick at the new load');
 weekly(t,7,()=>true,s=>SAT(s)?{set:(id,x)=>IDS.includes(id)?{...x,reps:3}:x}:{});
 const H=history(t,8,1);
 for(const id of IDS){
  assert.equal(hex(H,id).lastExecutedLoad,24,id+': the load lifted is history');
  assert.equal(hex(H,id).earnedProgress.loadTick,0,id+': no tick the athlete did not earn');
 }
 // And through a return: the next load step comes after a successful exposure at 24 kg, not before it.
 const d=B(copy(t),8);for(const id of IDS){assert.equal(entry(d,id).load,24,id);assert.equal(entry(d,id).loadTick,0,id);}
});

test('T2 (QE-R7ASE-02): the re-establishment threshold D52 is measured from the last executed exposure, never from a planned date',()=>{
 // P40's split, then the Saturday lift missed every week through week 6, each week reviewed. The exercises were last executed on 2026-11-14.
 const t=p40('t7sm-t2');
 for(let w=4;w<=6;w++)weekly(t,w,s=>!SAT(s));
 const H=history(t,6,6);
 for(const id of IDS)assert.equal(hex(H,id).lastPerformedAt,'2026-11-14',id+': the date executed');
 // On 2026-12-19, 35 days after that exposure, the Saturday rows establish the load by effort again (D52), never a known load never lifted.
 const rows=t.p.weeks[6].sessions.filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>({id:e.id,date:s.date,mode:e.load.mode,kind:e.exposure.kind})));
 assert.ok(rows.length,'Saturday rows exist');
 for(const r of rows){assert.equal(r.date,'2026-12-19',r.id);assert.equal(r.kind,'REESTABLISH',r.id);assert.equal(r.mode,'ESTABLISH',r.id);}
});

// ---------- T3-T5: the canonical example ----------

test('T3: 20 executed and 22 planned is a valid state: history 20, projection 22',()=>{
 const t=p40('t7sm-t3');
 for(const id of IDS){
  assert.equal(Math.max(...lifted(t,id)),20,id);
  assert.equal(t.p.stateTrace[3].strength.exercises[id].load,22,id+': the plan projects 22');
  assert.equal(hex(history(t,3,0),id).lastExecutedLoad,20,id+': history stays 20');
 }
});

test('T4: the projected 22 kg executed becomes history',()=>{
 const t=p40('t7sm-t4'),target=t.p.stateTrace[3].strength.exercises['db-rdl'].load;assert.equal(target,22);
 perDay(t,3,()=>true);
 const H=history(t,4,0);
 assert.equal(hex(H,'db-rdl').lastExecutedLoad,22);assert.equal(hex(H,'db-rdl').liftedLoad,22);
 assert.equal(entry(B(copy(t),4),'db-rdl').load,22,'a return resumes the 22 it lifted');
});

test('T5: 21 kg executed where 22 was planned is 21 kg of history, not 22',()=>{
 const t=p40('t7sm-t5'),target=t.p.stateTrace[3].strength.exercises['db-rdl'].load;assert.equal(target,22);
 perDay(t,3,()=>true,s=>SAT(s)?{kg:(id,e)=>id==='db-rdl'?21:e.load.mode==='KNOWN'?e.load.value:20}:{});
 assert.equal(hex(history(t,4,0),'db-rdl').lastExecutedLoad,21);
 assert.equal(entry(B(copy(t),4),'db-rdl').load,21);
});

// ---------- T6, T7: EARNED_PROGRESS (R42) ----------

test('T6: a load executed without earning a step advances the load, never the progression credit',()=>{
 const t=p51('t7sm-t6');
 weekly(t,7,()=>true,s=>SAT(s)?{set:(id,x)=>IDS.includes(id)?{...x,reps:3}:x}:{});
 for(const id of IDS){const h=hex(history(t,8,1),id);assert.equal(h.lastExecutedLoad,24,id);assert.equal(h.earnedProgress.loadTick,0,id);}
});

test('T7: a tick genuinely earned advances EARNED_PROGRESS, and two of them release the next load',()=>{
 const t=p40('t7sm-t7');
 // Week 3 executed in full at the 22 kg the plan projected, and reviewed. It is a consolidation week, which earns no progression credit, so the
 // load is history and its credit at that load starts at nothing (R42: the projection's own count is never read).
 weekly(t,3);assert.equal(t.p.phases.phases[3],'CONSOLIDATION');
 const h0=hex(history(t,4,0),'db-rdl');assert.equal(h0.lastExecutedLoad,22);assert.equal(h0.earnedProgress.loadTick,0);
 // Week 4, a development week, executed in full at 22 kg: one exposure earned.
 weekly(t,4);assert.equal(t.p.phases.phases[4],'DEVELOPMENT');
 const h1=hex(history(t,5,0),'db-rdl');assert.equal(h1.earnedProgress.loadTick,1,'one exposure earned');
 assert.equal(h1.earnedProgress.stepEarned,false);assert.equal(t.p.stateTrace[5].strength.exercises['db-rdl'].load,22,'no step yet');
 // Week 5, executed in full again: the second exposure releases the step, which stays a target until it is lifted.
 weekly(t,5);
 const h2=hex(history(t,6,0),'db-rdl');
 assert.equal(h2.lastExecutedLoad,22,'history is still the load lifted');
 assert.equal(h2.earnedProgress.stepEarned,true,'the evidence released a step');
 assert.ok(t.p.stateTrace[6].strength.exercises['db-rdl'].load>22,'the plan projects the step');
});

// ---------- T8, T9: last performed ----------

test('T8: a planned date with no execution never moves lastPerformed',()=>{
 const t=p40('t7sm-t8'),before=hex(history(t,3,0),'db-rdl').lastPerformedAt;
 assert.equal(before,'2026-11-14');
 // The plan of week 3, made before those facts were reviewed, carried a later date of its own (the Saturday it assumed).
 assert.ok(t.p.stateTrace[3].strength.exercises['db-rdl'].lastPerformed>before,'the projection carried its own date');
 // Three more weeks planned, reviewed, with that Saturday missed every time: the date does not move, and the reviews that read the facts plan
 // from the executed date, so no planned date survives as if it were an exposure (QE-R7ASE-02).
 for(let w=3;w<=5;w++)weekly(t,w,s=>!SAT(s));
 assert.equal(hex(history(t,6,0),'db-rdl').lastPerformedAt,before);
 assert.equal(t.p.stateTrace[6].strength.exercises['db-rdl'].lastPerformed,before,'the plan measures D52 from the executed date');
});

test('T9: an actual execution moves lastPerformed to the date executed, not the date planned',()=>{
 const t=p40('t7sm-t9'),sat=t.p.weeks[3].sessions.find(SAT);
 // Saturday's lift executed on Sunday and reported then: the executed date is the fact.
 for(const s of t.p.weeks[3].sessions.filter(s=>live(s)&&s.day<6)){const o=obs(t.p,s);if(s===sat)o.observedAt=`${addDays(s.date,1)}T19:00:00Z`;step(t,at(t.p,3,s===sat?6:s.day,'21:00:00',{observations:[o]}));}
 step(t,at(t.p,4,0,'06:00:00',{observations:t.p.weeks[3].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 assert.equal(hex(history(t,4,1),'db-rdl').lastPerformedAt,addDays(sat.date,1));
});

// ---------- T10: partial evidence ----------

test('T10: partial execution advances only the facts it carries',()=>{
 const t=p40('t7sm-t10');
 // Saturday's lift of week 3 logged with no repetition count, and with its load in an unknown unit for db-split-squat.
 weekly(t,3,()=>true,s=>SAT(s)?{set:(id,x)=>{const y=id==='db-split-squat'?{...x,load:{...x.load,unit:'STONE'}}:x;const {reps,...z}=y;return z;}}:{});
 const H=history(t,4,0);
 assert.equal(hex(H,'db-rdl').lastExecutedLoad,22,'the load lifted is known');
 assert.equal(hex(H,'db-rdl').liftedReps,null,'repetitions were not logged');
 assert.equal(hex(H,'db-rdl').lastExecutedReps,t.p.stateTrace[3].strength.exercises['db-rdl'].reps,'the target of that load stays');
 assert.equal(hex(H,'db-split-squat').lastExecutedLoad,20,'an unreadable load is no load: the last known one stays');
 assert.ok(hex(H,'db-split-squat').lastPerformedAt>'2026-11-14','it was performed, which is a fact');
});

test('T10b: a load the record cannot read is never prescribed as known: the next row keeps the last readable load',()=>{
 // Week 3's Saturday lift logged with db-split-squat's load in an unknown unit, and the week reviewed: that load is no evidence of any load, so
 // neither history nor the plan may hold the 22 kg the row prescribed (Founder §13; the planner would otherwise prescribe an unreadable load).
 const t=p40('t7sm-t10b');
 weekly(t,3,()=>true,s=>SAT(s)?{set:(id,x)=>id==='db-split-squat'?{...x,load:{...x.load,unit:'STONE'}}:x}:{});
 assert.equal(hex(history(t,4,0),'db-split-squat').lastExecutedLoad,20);
 assert.equal(history(t,4,0).state.strength.exercises['db-split-squat'].load,20,'history\'s own state holds the last readable load');
 assert.equal(t.p.stateTrace[4].strength.exercises['db-split-squat'].load,20,'the plan does not hold it either');
 const rows=t.p.weeks[4].sessions.filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='db-split-squat').map(e=>[e.load.mode,e.load.value]));
 assert.ok(rows.length,'a Saturday row exists');
 for(const [mode,value] of rows)assert.ok(mode!=='KNOWN'||value===20,'never the unreadable 22: '+mode+value);
});

test('T6b: a load first reached by execution needs its own successful exposures before the next step',()=>{
 // The projection ran two weeks ahead and stored a tick at 24 kg. Week 7 is then executed in full at that 24 kg and reviewed: the load is history
 // (T4) but its credit starts from the athlete's own exposure, so the plan does not step the week after (R42; EARNED_PROGRESS, not the plan's).
 const t=p51('t7sm-t6b');
 assert.equal(t.p.stateTrace[7].strength.exercises['db-rdl'].loadTick,1,'the projection stored a tick at 24');
 weekly(t,7);
 assert.equal(hex(history(t,8,1),'db-rdl').lastExecutedLoad,24);
 assert.equal(t.p.stateTrace[8].strength.exercises['db-rdl'].load,24,'no step on the projection\'s count');
});

test('T13b: a handler that re-plans this week prescribes from history, never from the stored projection',()=>{
 // P40's history (the Saturday-only exercises last lifted at 20, the plan of week 4 made by a review that read those facts). A schedule change
 // and a fatigue report re-plan week 4: their rows are the 20 the athlete lifted.
 for(const review of [{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:55}},{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}}]){
  const t=p40('t7sm-t13b-'+review.kind);
  const r=step(t,at(t.p,4,0,'07:00:00',review));
  assert.ok(r.proposal,review.kind+': a proposal');
  const rows=t.p.weeks[4].sessions.filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>[e.id,e.load.mode,e.load.value]));
  assert.ok(rows.length,review.kind+': Saturday rows');
  for(const [id,mode,value] of rows)assert.ok(mode!=='KNOWN'||value===20,`${review.kind}: ${id} ${mode}${value}`);
 }
});

test('T13d: a handler that re-plans a week whose stored start is still a projection prescribes from history',()=>{
 // Week 2 executed but for Saturday's lift and never reviewed, so the stored start of week 3 projects 22 kg while history holds the 20 lifted.
 // An equipment change inside week 3 re-plans its strength rows: they are the 20 kg of history, never the projected 22.
 const t=start('t7sm-t13d',2);perDay(t,2,s=>!SAT(s));
 assert.equal(t.p.stateTrace[3].strength.exercises['db-rdl'].load,22,'the stored start projects 22');
 assert.equal(hex(history(t,3,0),'db-rdl').lastExecutedLoad,20,'history holds the 20 lifted');
 const r=step(t,at(t.p,3,0,'07:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));
 assert.equal(r.action,'SUBSTITUTE');
 const rows=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>[e.id,e.load.mode,e.load.value]));
 assert.ok(rows.length,'the kept exercises are still prescribed');
 for(const [id,mode,value] of rows)assert.ok(mode!=='KNOWN'||value===20,`${id} ${mode}${value}`);
});

test('T7b (R42 in the planner): a load adopted above the state\'s own starts its credit at nothing, in the plan as in history',()=>{
 // Week 2 unreviewed with Saturday's lift missed: history holds 20 with one exposure earned, the plan projects 22. Week 3 is then executed at the
 // 22 the row prescribed and reviewed: both readings hold 22 with one exposure earned, so the next step waits for a second exposure at 22.
 const t=start('t7sm-t7b',2);perDay(t,2,s=>!SAT(s));
 const h0=hex(history(t,3,0),'db-rdl');assert.equal(h0.lastExecutedLoad,20);assert.equal(h0.earnedProgress.loadTick,1,'one exposure earned at 20');
 weekly(t,3);
 const h1=hex(history(t,4,0),'db-rdl');
 assert.equal(h1.lastExecutedLoad,22,'the 22 lifted is history');
 assert.equal(h1.earnedProgress.loadTick,0,'the credit earned at 20 does not move to 22');
 const P=t.p.stateTrace[4].strength.exercises['db-rdl'];
 assert.equal(P.load,22,'the plan does not step on a credit earned at another load');
 assert.equal(P.loadTick,h1.earnedProgress.loadTick,'the plan and history agree on the credit');
});

test('T7c: the plan never holds a progression credit history does not hold at that load',()=>{
 // The projection ran two weeks ahead and stored a credit at 24 kg while history was still at 22. Week 7 is executed in full at the 24 the row
 // prescribed, then week 8: at every week where both hold the same load they hold the same credit, and the step waits for the second exposure.
 const t=p51('t7sm-t7c'),id='db-rdl';
 assert.equal(t.p.stateTrace[7].strength.exercises[id].load,24);assert.equal(hex(history(t,7,1),id).lastExecutedLoad,22);
 weekly(t,7);
 const P8=t.p.stateTrace[8].strength.exercises[id],H8=hex(history(t,8,1),id);
 assert.equal(P8.load,24);assert.equal(H8.lastExecutedLoad,24,'the 24 lifted is history');
 assert.equal(P8.loadTick,H8.earnedProgress.loadTick,'the same credit at the same load');
 assert.equal(H8.earnedProgress.loadTick,0,'the credit earned at 22 did not move to 24');
 weekly(t,8);
 const P9=t.p.stateTrace[9].strength.exercises[id],H9=hex(history(t,9,1),id);
 assert.equal(P9.load,24,'no step: only the first exposure at 24 is earned');
 assert.equal(P9.loadTick,H9.earnedProgress.loadTick);assert.equal(H9.earnedProgress.loadTick,1);
});

test('T10c: a load the record cannot read advances nothing, through a week no review closed',()=>{
 // Weeks 0-1 trained and reviewed, so the evidence released 22 kg after two met exposures at 20. Week 2 is then reported day by day, with
 // db-split-squat's load in an unknown unit, and no review closes it: the facts-only reading keeps the last readable load and that exposure
 // advances nothing, in history's own state as in what it reports.
 const t=start('t7sm-t10c',2),id='db-split-squat';
 const before=hex(history(t,2,0),id),planned=t.p.stateTrace[3].strength.exercises[id].load;
 for(const s of t.p.weeks[2].sessions.filter(s=>live(s)&&s.day<6))step(t,at(t.p,2,s.day,'21:00:00',{observations:[obs(t.p,s,SAT(s)?{set:(e,x)=>e===id?{...x,load:{...x.load,unit:'STONE'}}:x}:{})]}));
 step(t,at(t.p,3,0,'06:00:00',{observations:t.p.weeks[2].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
 const H=history(t,3,1);
 assert.equal(H.state.strength.exercises[id].load,before.lastExecutedLoad,'history keeps the last readable load');
 assert.equal(hex(H,id).lastExecutedLoad,before.lastExecutedLoad);
 assert.equal(hex(H,id).earnedProgress.loadTick,before.earnedProgress.loadTick,'the unreadable exposure earns nothing');
 assert.equal(t.p.stateTrace[3].strength.exercises[id].load,planned,'and the plan is where the earlier evidence left it');
 // A decision that re-plans this week prescribes from that history, never from the load the row had assumed.
 const r=step(t,at(t.p,3,1,'08:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));
 assert.equal(r.action,'SUBSTITUTE');
 const rows=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>[e.load.mode,e.load.value]));
 assert.ok(rows.length,'the exercise is still prescribed');
 for(const [mode,value] of rows)assert.ok(mode!=='KNOWN'||value===before.lastExecutedLoad,`${mode}${value}`);
});

test('T13c: an exercise the evidence never established is not in history, and its next exposure establishes it',()=>{
 // An equipment change substitutes a new exercise into week 2, whose strength sessions are then missed: the plan set it up, the athlete never
 // performed it, so history does not hold it and its next row is a first establishment (SSCTR D52).
 const t=start('t7sm-t13c',2);
 const r=step(t,at(t.p,2,0,'07:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));
 assert.equal(r.action,'SUBSTITUTE');
 const ids=[...new Set(t.p.weeks[2].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id)))];
 const fresh=ids.filter(id=>!t.ledger.some(o=>o.logs?.[id]));
 assert.ok(fresh.length,'a substitute the athlete never performed');
 weekly(t,2,s=>s.sport!=='STRENGTH');
 const H=history(t,3,0);
 for(const id of fresh){
  assert.equal(hex(H,id),undefined,id+': never established, so not in history');
  const rows=t.p.weeks[3].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>e.exposure.kind));
  assert.ok(rows.length&&rows.every(k=>k==='FIRST_ESTABLISH'),id+': '+rows.join());
 }
});

// ---------- T11, T12: a review and a week boundary never promote ----------

test('T11: an unrelated weekly review never promotes a target',()=>{
 const t=p40('t7sm-t11'),before=JSON.stringify(history(t,4,0).strength);
 // Four more weeks of running only, each reviewed: no strength evidence at all.
 for(let w=4;w<=7;w++)weekly(t,w,RUN);
 const H=history(t,8,0);
 for(const id of IDS)assert.equal(hex(H,id).lastExecutedLoad,20,id);
 assert.equal(JSON.stringify(Object.fromEntries(Object.entries(H.strength.exercises).map(([k,v])=>[k,v.lastExecutedLoad]))),
  JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(before).exercises).map(([k,v])=>[k,v.lastExecutedLoad]))),'no load moved');
});

test('T12: a week boundary never promotes a target',()=>{
 const t=p40('t7sm-t12');
 // The same facts, read on Sunday of week 3 and on Monday of week 4, with nothing executed between.
 const a=history(t,3,6,'23:30:00'),b=history(t,4,0,'00:30:00');
 for(const id of IDS)assert.deepEqual(hex(a,id),hex(b,id),id);
});

// ---------- T13, T14: a return reads history ----------

test('T13: a return after a target that was never executed starts from the executed dose',()=>{
 const t=p40('t7sm-t13');
 // The review of week 3 released nothing for the Saturday-only exercises (never lifted since week 2), and the plan still targets 22.
 for(const id of IDS){const d=B(copy(t),4);assert.equal(entry(d,id).load,20,id+': the dose last executed');}
 // A moderate interruption takes the same base, with the executed load as its ceiling.
 const m=B(copy(t),4,{from:1,to:14});for(const id of IDS)assert.equal(entry(m,id).load,20,id);
});

test('T14: a return after the target was executed starts from the promoted execution',()=>{
 const t=p40('t7sm-t14');perDay(t,3,()=>true);
 for(const id of IDS)assert.equal(entry(B(copy(t),4),id).load,22,id+': the 22 it lifted');
});

// ---------- T15: corrections ----------

test('T15: an authorized historical correction replaces the fact it corrects',()=>{
 const t=p40('t7sm-t15');
 // Week 3 reported as executed at 22 kg, then corrected: the Saturday session was not done at all.
 const sat=t.p.weeks[3].sessions.find(SAT),first=obs(t.p,sat);
 step(t,at(t.p,3,5,'21:00:00',{observations:[first]}));
 assert.equal(hex(history(t,3,6),'db-rdl').lastExecutedLoad,22,'the report as first made');
 step(t,at(t.p,3,6,'21:00:00',{observations:[{...obs(t.p,sat),eventId:`${first.eventId}-fix`,supersedes:first.eventId,actual:{completed:false,minutes:0}}]}));
 const H=history(t,4,0);
 for(const id of IDS){assert.equal(hex(H,id).lastExecutedLoad,20,id+': the correction stands');assert.equal(hex(H,id).lastPerformedAt,'2026-11-14',id);}
});

// ---------- T16, T17: isolation ----------

test('T16: running evidence never promotes a strength target, and strength evidence never promotes a run target',()=>{
 const base=p40('t7sm-t16');
 const runs=copy(base),none=copy(base);perDay(runs,4,RUN);perDay(none,4,()=>false);
 assert.deepEqual(history(runs,5,0).strength,history(none,5,0).strength,'run reports move no strength value');
 const lifts=copy(base);perDay(lifts,4,s=>s.sport==='STRENGTH');
 assert.deepEqual(history(lifts,5,0).run,history(none,5,0).run,'strength reports move no run value');
});

test('T17: the execution of one exercise never promotes another',()=>{
 const base=p40('t7sm-t17');
 const satOnly=[...new Set(base.p.weeks[4].sessions.filter(SAT).flatMap(s=>s.prescription.exercises.map(e=>e.id)))].filter(id=>!base.p.weeks[4].sessions.some(s=>WED(s)&&s.prescription.exercises.some(e=>e.id===id)));
 assert.ok(satOnly.length,'an exercise lifted only on Saturday');
 const wed=copy(base),neither=copy(base);perDay(wed,4,s=>!SAT(s));perDay(neither,4,s=>!SAT(s)&&!WED(s));
 const a=history(wed,5,0),b=history(neither,5,0);
 for(const id of satOnly)assert.deepEqual(hex(a,id),hex(b,id),'Wednesday\'s lifting does not move '+id);
});

// ---------- P1-P7: properties ----------

test('P1: saving a projection again, any number of times, leaves HistoricalState unchanged',()=>{
 const t=p40('t7sm-p1'),before=JSON.stringify(history(t,4,0));
 // Four handlers that re-plan without any new fact: an equipment window, a schedule change, a goal change and an unavailable day.
 step(t,at(t.p,4,0,'07:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}}));
 step(t,at(t.p,4,0,'08:00:00',{kind:'SCHEDULE_CHANGE',changes:{runMinutes:65}}));
 step(t,at(t.p,4,0,'09:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}));
 step(t,at(t.p,4,0,'10:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[addDays(t.p.weeks[4].startDate,3)]}}));
 assert.equal(JSON.stringify(history(t,4,0)),before);
});

test('P2: time passing with no evidence leaves HistoricalState unchanged',()=>{
 const t=p40('t7sm-p2'),a=history(t,4,0),b=history(t,4,6,'23:00:00');
 assert.deepEqual(a.strength,b.strength);assert.deepEqual(a.run,b.run);
 // And a week later, still with nothing reported: the same facts.
 const c=history(t,5,3);assert.deepEqual(c.strength.exercises,a.strength.exercises);
});

test('P3: changing only a future target leaves HistoricalState unchanged',()=>{
 const t=p40('t7sm-p3'),before=JSON.stringify(history(t,4,0));
 step(t,at(t.p,4,0,'07:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'},from:t.p.weeks[6].startDate}}));
 assert.ok(t.p.weeks.slice(6).some(w=>w.sessions.some(s=>s.sport==='STRENGTH'&&live(s))),'later weeks were re-planned');
 assert.equal(JSON.stringify(history(t,4,0)),before);
});

test('P4: adding a relevant execution moves only what that evidence supports',()=>{
 const t=p40('t7sm-p4'),before=history(t,4,0);
 // One Wednesday session of week 4 executed and reported: only its own exercises move.
 const wed=t.p.weeks[4].sessions.find(WED);
 step(t,at(t.p,4,2,'21:00:00',{observations:[obs(t.p,wed)]}));
 const after=history(t,4,3),ids=new Set(wed.prescription.exercises.map(e=>e.id));
 for(const [id,h] of Object.entries(after.strength.exercises)){
  if(ids.has(id))assert.ok(h.lastPerformedAt>=wed.date,id+': performed');
  else assert.deepEqual(h,hex(before,id),id+': untouched');
 }
 assert.deepEqual(after.run,before.run,'no run value moved');
});

test('P5: a projection and an unrelated fact in either order give the same HistoricalState',()=>{
 const base=p40('t7sm-p5'),run=base.p.weeks[4].sessions.find(s=>RUN(s)&&s.day===1);
 const plan=p=>at(p,4,0,'07:00:00',{kind:'SCHEDULE_CHANGE',changes:{runMinutes:65}});
 const fact=p=>at(p,4,1,'21:00:00',{observations:[obs(p,p.weeks[4].sessions.find(s=>RUN(s)&&s.day===1))]});
 const a=copy(base);step(a,plan(a.p));step(a,fact(a.p));
 const b=copy(base);step(b,fact(b.p));step(b,plan(b.p));
 assert.deepEqual(history(a,4,2),history(b,4,2));
 assert.ok(run,'the run session exists');
});

test('P6: deleting a future plan leaves HistoricalState intact',()=>{
 const t=p40('t7sm-p6'),before=JSON.stringify(history(t,4,0));
 // A schedule change that drops two run days and both strength days of every later week is asked about, never applied silently; a change that
 // keeps one day of each re-plans the future and removes the rest of the planned work.
 step(t,at(t.p,4,0,'07:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[1],longRunDay:1,strengthDays:[2]}}));
 const planned=t.p.weeks.slice(5).flatMap(w=>w.sessions.filter(live));
 assert.ok(planned.every(s=>[1,2].includes(s.day)),'the future plan is reduced to the days chosen');
 assert.equal(JSON.stringify(history(t,4,0)),before);
});

test('P7: a correction changes the fact it corrects and no unrelated projection',()=>{
 const t=p40('t7sm-p7');
 const wed=t.p.weeks[4].sessions.find(WED),first=obs(t.p,wed);
 step(t,at(t.p,4,2,'21:00:00',{observations:[first]}));
 const plannedBefore=JSON.stringify(t.p.weeks.slice(6).map(w=>w.sessions.map(s=>s.prescription)));
 step(t,at(t.p,4,3,'08:00:00',{observations:[{...obs(t.p,wed),eventId:`${first.eventId}-fix`,supersedes:first.eventId,actual:{completed:false,minutes:0}}]}));
 const H=history(t,4,4);
 for(const e of wed.prescription.exercises)assert.ok((hex(H,e.id)?.lastPerformedAt??'')<wed.date,e.id+': the correction removed that exposure');
 assert.equal(JSON.stringify(t.p.weeks.slice(6).map(w=>w.sessions.map(s=>s.prescription))),plannedBefore,'no unrelated future plan changed');
});

// ---------- write ownership and the views ----------

test('Write ownership: HistoricalState is read-only, PlanningProjection holds the targets, PlanningView is derived per decision',()=>{
 const t=p40('t7sm-own'),H=history(t,3,0);
 assert.equal(H.version,'R7-HISTORICAL-STATE-1');assert.ok(Object.isFrozen(H),'read-only');
 // The planning record keeps its own projection, above history, with its own tick and date (the start of week 3, projected from week 2).
 const P=t.p.stateTrace[3].strength.exercises['db-rdl'];
 assert.ok(P.load>hex(H,'db-rdl').lastExecutedLoad,'the projection may run ahead');
 assert.ok(P.lastPerformed>hex(H,'db-rdl').lastPerformedAt,'the plan carries its own date');
 // No executed-dose record leaks into the planning record.
 for(const st of t.p.stateTrace)assert.equal(st.strength.facts,undefined,'the planner never carries the executed doses');
 // A start records why it holds its state, and never which values it carried.
 const a=t.p.weeks[4].startAuthority;assert.equal(a.STRENGTH.provenance,'WEEK_EVIDENCE');assert.equal(a.STRENGTH.projectedBase,undefined);
});

test('I14 (learning): the athlete model reads reported observations only, never a projection',()=>{
 const t=p40('t7sm-i14'),m=t.last.updatedModel;
 assert.ok(m,'a model is kept');
 const reported=new Set(t.ledger.map(o=>o.eventId));
 assert.ok((m.observations??[]).length,'the model holds observations');
 for(const o of m.observations){
  assert.ok(reported.has(o.eventId),'every observation is a reported one: '+o.eventId);
  assert.ok(o.actual&&(o.actual.completed!==undefined||Number.isFinite(o.actual.minutes)),'each one carries what was reported: '+o.eventId);
 }
});
