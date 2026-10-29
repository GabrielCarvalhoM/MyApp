// COACHING CORE — STATE EVIDENCE MODEL author self-challenge (Founder request §22): equivalence classes that try to make a value only a
// projection made count as history. Each class states its oracle; the probe prints the cases and the violations. Built on the R7-A final
// engineering judge's helpers (qe-r7af-lib.mjs): synthetic data, DEV_TEST_ONLY authority, read-only, prints only. QE_LIVE_ROOT=<a
// CoachingCore copy> runs another runtime (for example ../boundary-freeze-source/CoachingCore, the byte-exact R7A-BOUNDARY-FINAL-FREEZE).
//
// The main oracle (SAME FACTS): an unreviewed cell U and its reviewed control R (the same reports, the week reviewed on Sunday 21:00). Where
// both ledgers hold the same facts for a value (an exercise's logs; the runs), U's history is never more progressed than R's on that value:
// no higher load, no more load ticks at the same load, no higher last executed count, no further return step, no more counted run weeks or
// quality steps. A review can only add progress its evidence supports; a projection must add none. Declared boundary (not checked): a run
// value kept through an unreviewed week keeps that week's evidence start, so it is not trimmed by the review's cap rule (run.long, run.easy).
import {H,at,on,obs,addDays,brk,lastR,copy,live,print} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const out={probe:'R7ASE-SELF-CHALLENGE-1',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',classes:{},violations:[]};
const flag=(c,what)=>out.violations.push(`${c}: ${what}`),expect=(c,ok,what)=>{if(!ok)flag(c,what);return ok;};
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,WED=s=>s.sport==='STRENGTH'&&s.day===2,SUN=s=>s.sport==='RUN'&&s.day===6,TUE=s=>s.sport==='RUN'&&s.day===1;
const SESSIONS={saturdayLift:SAT,wednesdayLift:WED,sundayLong:SUN,tuesdayQuality:TUE};
// Reports: each session chosen by `keep` reported on its own evening (a mid-week review: nothing consolidates), Sunday's on Monday 06:00;
// or the week reviewed on Sunday 21:00. `edit` changes an observation.
const perDay=(t,w,keep,edit=o=>o)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[edit(obs(t.p,s),s)]}));H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>edit(obs(t.p,s),s))}));};
const weekly=(t,w,keep,edit=o=>o)=>H.ev(t,at(t.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>edit(obs(t.p,s),s))}));
// B: a separate trip in week k (Tuesday-Wednesday by default), reported the day after it ends at 06:00.
const B=(t,k,{from=1,to=2}={})=>{const d=t.p.weeks[k].startDate,r=H.ev(t,on(t,addDays(d,to+1),'06:00',brk(addDays(d,from),addDays(d,to))));if(r!=='MODIFY/REESTABLISH')flag('harness',`B in week ${k}: ${r} ${t.last.reason}`);return lastR(t.p);};
const logsOf=(t,id)=>JSON.stringify(t.ledger.filter(o=>o.logs?.[id]).map(o=>[o.sessionId,o.localDate,o.logs[id].load,o.logs[id].reps,o.logs[id].setsDone,o.logs[id].repsMet]).sort());
const runsOf=t=>JSON.stringify(t.ledger.filter(o=>o.context?.sport==='RUN').map(o=>[o.sessionId,o.localDate,o.actual?.minutes,o.actual?.completed]).sort());
const rank=e=>Number.isInteger(e?.returnStep)?e.returnStep:9,runRank=s=>s.mode==='RETURN'?s.returnStep:s.mode==='RESTART'?-1:9;
const RUN_COUNTS=['easyWeeksDone','qualityStep','thresholdDone','qualityDone','stridesDone','specificStep'];
/** SAME FACTS: U's history no more progressed than R's wherever both record the same facts. */
function noMore(c,tU,U,tR,R){
 const eu=U.interruption.entry,er=R.interruption.entry;let compared=0;
 for(const id of new Set([...Object.keys(eu.strength.exercises),...Object.keys(er.strength.exercises)])){
  if(logsOf(tU,id)!==logsOf(tR,id))continue;compared++;
  const a=eu.strength.exercises[id],b=er.strength.exercises[id];if(!a)continue;
  if(!b){flag(c,`${id}: in use in U, not in the reviewed control`);continue;}
  if(Number.isFinite(a.load)&&Number.isFinite(b.load)&&a.load>b.load+1e-9)flag(c,`${id}: load ${a.load} above the control's ${b.load}`);
  if(Number.isFinite(a.load)&&a.load===b.load&&(a.loadTick??0)>(b.loadTick??0))flag(c,`${id}: ${a.loadTick} load ticks at ${a.load}, the control ${b.loadTick??0}`);
  if(Number.isInteger(a.lastExecutedSets)&&!(Number.isInteger(b.lastExecutedSets)&&a.lastExecutedSets<=b.lastExecutedSets))flag(c,`${id}: last executed count ${a.lastExecutedSets}, the control ${b.lastExecutedSets??'-'}`);
  if(rank(a)>rank(b))flag(c,`${id}: return step ${a.returnStep??'done'} beyond the control's ${b.returnStep??'done'}`);
 }
 if(runsOf(tU)===runsOf(tR)){compared++;for(const k of RUN_COUNTS)if((eu.run[k]??0)>(er.run[k]??0))flag(c,`run.${k} ${eu.run[k]} above the control's ${er.run[k]}`);if(runRank(eu.run)>runRank(er.run))flag(c,'run return step beyond the control\'s');}
 return compared;
}
const bare=st=>JSON.stringify({run:{...st.run,planned:undefined,longByWeek:undefined},strength:Object.fromEntries(Object.entries(st.strength.exercises).sort())});
const summary=d=>({point:`${d.interruption.stateAt.kind}/w${d.interruption.stateAt.week}`,authority:d.interruption.stateAt.authority});
// ---------- C1. Factual + projection (QE-R7AB-01, Founder §4, §18, families A, F; I2, I3, I9): week F unreviewed with session S missed, week
// F+1 reviewed (S missed again, or nothing executed); B, the program's first interruption, in week F+2. Oracle: SAME FACTS against R.
{
 const c='C1-factual-plus-projection',cells=[];
 for(const [sn,miss] of Object.entries(SESSIONS))for(const F of [2,3])for(const f1 of ['sameMissed','nothing']){
  const base=H.start({id:`se-c1-${sn}-${F}-${f1}`},F),res={};
  for(const cell of ['U','R']){const t=copy(base);if(cell==='U')perDay(t,F,s=>!miss(s));else weekly(t,F,s=>!miss(s));weekly(t,F+1,f1==='nothing'?()=>false:s=>!miss(s));res[cell]={t,B:B(t,F+2)};}
  const n=noMore(`${c}/${sn}/F${F}/${f1}`,res.U.t,res.U.B,res.R.t,res.R.B);
  cells.push({sn,F,f1,U:summary(res.U.B),R:summary(res.R.B),compared:n,planningStartU:res.U.t.p.stateTrace[F+2].strength.exercises['db-rdl']?.load??null,historyU:res.U.B.interruption.entry.strength.exercises['db-rdl']?.load??null});
 }
 out.classes[c]=cells;
}
// ---------- C2. Projection without execution and time passage (families A, G; P2, I8): weeks F and F+1 never reviewed, S missed in both;
// B begins on Sunday of week F+1 or on Monday of week F+2 (nothing executed between). Oracle: the same history, the same state.
{
 const c='C2-time-and-week-boundary',cells=[];
 for(const [sn,miss] of Object.entries({saturdayLift:SAT,wednesdayLift:WED}))for(const F of [2,3]){
  const base=H.start({id:`se-c2-${sn}-${F}`},F);perDay(base,F,s=>!miss(s));perDay(base,F+1,s=>!miss(s)&&s.day<6);
  const sun=copy(base),mon=copy(base),X=B(sun,F+1,{from:6,to:7}),Y=B(mon,F+2,{from:0,to:1});
  expect(`${c}/${sn}/F${F}`,bare(X.interruption.entry)===bare(Y.interruption.entry),'Sunday and Monday starts differ');
  cells.push({sn,F,sunday:summary(X),monday:summary(Y)});
 }
 out.classes[c]=cells;
}
// ---------- C3. Partial evidence (Founder §13, family C; I5): S executed in week F+1 with its repetitions unlogged, with a set fewer, or with
// its load in an unknown unit; week F unreviewed with S missed. Oracle: SAME FACTS against R, and an unreadable load never becomes the
// load the plan projected.
{
 const c='C3-partial-evidence',cells=[];
 const edits={repsUnlogged:o=>({...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.map(({reps,...x})=>x)}))}}),
  setFewer:o=>({...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.slice(0,Math.max(1,e.sets.length-1))}))}}),
  unitUnknown:o=>({...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>({...e,sets:e.sets.map(x=>({...x,load:{value:x.load?.value??0,unit:'STONE',convention:x.load?.convention}}))}))}})};
 for(const [en,edit] of Object.entries(edits)){
  const base=H.start({id:`se-c3-${en}`},2),res={};
  for(const cell of ['U','R']){const t=copy(base);if(cell==='U')perDay(t,2,s=>!SAT(s));else weekly(t,2,s=>!SAT(s));weekly(t,3,()=>true,(o,s)=>SAT(s)&&o.actual.exercises?edit(o):o);res[cell]={t,B:B(t,4)};}
  noMore(`${c}/${en}`,res.U.t,res.U.B,res.R.t,res.R.B);
  const projected=res.U.t.p.stateTrace[3].strength.exercises['db-rdl']?.load,hist=res.U.B.interruption.entry.strength.exercises['db-rdl']?.load;
  if(en==='unitUnknown')expect(`${c}/${en}`,hist!==projected,`db-rdl's unreadable load became the projected ${projected}`);
  cells.push({en,U:summary(res.U.B),projected,history:hist});
 }
 out.classes[c]=cells;
}
// ---------- C4. Unrelated evidence: another sport (family D; I4, P3). Week F unreviewed with every lift missed; its runs reported, or not.
// Oracle: B's strength is the same; the runs move only the run.
{
 const c='C4-cross-sport',cells=[];
 const base=H.start({id:'se-c4'},2),a=copy(base),b=copy(base);perDay(a,2,s=>s.sport==='RUN');perDay(b,2,()=>false);
 const X=B(a,3),Y=B(b,3);expect(c,JSON.stringify(X.interruption.entry.strength.exercises)===JSON.stringify(Y.interruption.entry.strength.exercises),'run reports moved strength');
 cells.push({withRuns:summary(X),withoutRuns:summary(Y)});out.classes[c]=cells;
}
// ---------- C5. Unrelated evidence: another exercise (family E; I4, P3). Week F unreviewed, Saturday's lift missed; Wednesday's lift executed,
// or not. Oracle: the exercises lifted only on Saturday have the same history.
{
 const c='C5-cross-exercise',cells=[];
 const base=H.start({id:'se-c5'},2),satOnly=[...new Set(base.p.weeks[2].sessions.filter(s=>SAT(s)).flatMap(s=>s.prescription.exercises.map(e=>e.id)))].filter(id=>!base.p.weeks[2].sessions.some(s=>WED(s)&&s.prescription.exercises.some(e=>e.id===id)));
 const a=copy(base),b=copy(base);perDay(a,2,s=>!SAT(s));perDay(b,2,s=>!SAT(s)&&!WED(s));weekly(a,3,s=>!SAT(s));weekly(b,3,s=>!SAT(s));
 const X=B(a,4),Y=B(b,4);for(const id of satOnly)expect(`${c}/${id}`,JSON.stringify(X.interruption.entry.strength.exercises[id])===JSON.stringify(Y.interruption.entry.strength.exercises[id]),'Wednesday\'s lift moved a Saturday-only exercise');
 cells.push({satOnly,withWednesday:summary(X),withoutWednesday:summary(Y)});out.classes[c]=cells;
}
// ---------- C6. No-op and re-planning handlers (family K; I8, P1): after C1's U history (saturdayLift, F 2) one handler on Monday 06:00 of
// week 4, or a true no-op on Sunday 22:00 of week 3. Oracle: B's history equals the control's (no handler).
{
 const c='C6-handlers',cells=[];
 const base=H.start({id:'se-c6'},2);perDay(base,2,s=>!SAT(s));weekly(base,3,s=>!SAT(s));const ctl=B(copy(base),4);
 const X={sameEquipment:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}},fullKitWindow:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:'2026-12-20',to:'2026-12-24'}},
  equipmentWindow:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:'2026-12-20',to:'2026-12-24'}},sameSchedule:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:60}},
  scheduleNextWeek:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}},sameGoal:{kind:'GOAL_CHANGE',changes:{goals:{strength:'STRENGTH'}}},goalNextWeek:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},
  localFatigue:{kind:'LOCAL_FATIGUE',signals:{region:'LOWER'}},systemicFatigue:{kind:'SYSTEMIC_FATIGUE'},unavailable:{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:['2026-12-05']}}};
 for(const [label,x] of Object.entries(X)){const u=copy(base);H.ev(u,at(u.p,4,0,'06:00',x));const r=u.last;const Bx=B(u,4);
  expect(`${c}/monday/${label}`,bare(Bx.interruption.entry)===bare(ctl.interruption.entry),'the handler changed history');cells.push({clock:'monday',label,result:`${r.status}/${r.action}`,point:summary(Bx)});}
 for(const label of ['sameEquipment','sameSchedule','sameGoal']){const u=copy(base);H.ev(u,at(u.p,3,6,'22:00',X[label]));const r=u.last;const Bx=B(u,4);
  expect(`${c}/sunday/${label}`,bare(Bx.interruption.entry)===bare(ctl.interruption.entry),'the no-op changed history');cells.push({clock:'sunday',label,result:`${r.status}/${r.action}`,point:summary(Bx)});}
 out.classes[c]=cells;
}
// ---------- C7. Return after an unexecuted projection, and after an executed one (families H, I; I10): C1's U history (saturdayLift, F 2)
// with a MODERATE B (14 days); and the same with week 3's Saturday lifted as prescribed (the projected 22 kg). Oracle: the first starts from
// what was executed (SAME FACTS against R); in the second the lifted load is the history the return starts from.
{
 const c='C7-return',cells=[];
 const base=H.start({id:'se-c7'},2),res={};
 for(const cell of ['U','R']){const t=copy(base);if(cell==='U')perDay(t,2,s=>!SAT(s));else weekly(t,2,s=>!SAT(s));weekly(t,3,s=>!SAT(s));res[cell]={t,B:B(t,4,{from:1,to:14})};}
 noMore(`${c}/unexecuted`,res.U.t,res.U.B,res.R.t,res.R.B);
 const e=copy(base);perDay(e,2,s=>!SAT(s));const prescribed=e.p.stateTrace[3].strength.exercises['db-rdl'].load;weekly(e,3,()=>true);const Be=B(e,4,{from:1,to:14});
 const lifted=e.ledger.filter(o=>o.logs?.['db-rdl']).map(o=>o.logs['db-rdl'].load).at(-1);
 expect(`${c}/executed`,Be.interruption.entry.strength.exercises['db-rdl'].load===lifted&&lifted===prescribed,`the return's db-rdl ${Be.interruption.entry.strength.exercises['db-rdl'].load}, lifted ${lifted}, prescribed ${prescribed}`);
 cells.push({unexecuted:{U:summary(res.U.B),R:summary(res.R.B),ceilingU:res.U.B.interruption.entry.strength.exercises['db-rdl'].load,ceilingR:res.R.B.interruption.entry.strength.exercises['db-rdl'].load},executed:{point:summary(Be),prescribed,lifted}});
 out.classes[c]=cells;
}
// ---------- C8. Historical correction (family J; I6, P6): week 3 unreviewed, executed in full; Wednesday's back squat corrected the next day
// to a lighter load. Oracle: the history holds the corrected load, and the correction promotes no other value (P6: none becomes more
// progressed). It may demote them: the week is then no longer executed as its projection assumed, so completed sessions verify no strength
// value of it (SSCTR S-A, R7-A boundary I5/P3); the other exercises are read as facts.
{
 const c='C8-correction',cells=[];
 const base=H.start({id:'se-c8'},3);perDay(base,3,()=>true);
 const wed=base.p.weeks[3].sessions.find(s=>WED(s)),orig=base.ledger.find(o=>o.sessionId===wed.id),squat=orig.actual.exercises.find(e=>e.id==='back-squat');
 const fixed=copy(base),lighter=Math.round((squat.sets[0].load.value-5)*10)/10;
 H.ev(fixed,at(fixed.p,4,0,'07:00',{kind:'WEEKLY_REVIEW',observations:[{...obs(fixed.p,wed),eventId:'se-c8-fix',correctionOf:orig.eventId,correctedAt:at(fixed.p,4,0,'07:00',{kind:'WEEKLY_REVIEW'}).asOf,actual:{...orig.actual,exercises:orig.actual.exercises.map(e=>e.id==='back-squat'?{...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:lighter}}))}:e)}}]}));
 const X=B(copy(base),4),Y=B(fixed,4),ex=X.interruption.entry.strength.exercises,ey=Y.interruption.entry.strength.exercises;
 expect(c,ey['back-squat'].load===lighter,`back-squat ${ey['back-squat'].load} after the correction to ${lighter}`);
 for(const id of Object.keys(ex))if(id!=='back-squat'){const a=ey[id],b=ex[id];
  expect(`${c}/${id}`,!(Number.isFinite(a?.load)&&Number.isFinite(b?.load)&&a.load>b.load+1e-9)&&!(a?.load===b?.load&&(a?.loadTick??0)>(b?.loadTick??0))&&rank(a)<=rank(b)&&!(Number.isInteger(a?.lastExecutedSets)&&!(a.lastExecutedSets<=(b?.lastExecutedSets??-1))),'the correction promoted another exercise');}
 cells.push({before:ex['back-squat'].load,corrected:lighter,after:ey['back-squat'].load,point:summary(Y),pointBefore:summary(X)});out.classes[c]=cells;
}
// ---------- C9. Different execution (P5): the projected 22 kg lifted at 21 kg in an unreviewed week. Oracle: the history is 21 kg.
{
 const c='C9-different-execution',cells=[];
 const base=H.start({id:'se-c9'},2);perDay(base,2,s=>!SAT(s));const prescribed=base.p.stateTrace[3].strength.exercises['db-rdl'].load;
 perDay(base,3,()=>true,(o,s)=>SAT(s)?{...o,actual:{...o.actual,exercises:o.actual.exercises.map(e=>e.id==='db-rdl'?{...e,sets:e.sets.map(x=>({...x,load:{...x.load,value:prescribed-1}}))}:e)}}:o);
 const X=B(base,4);expect(c,X.interruption.entry.strength.exercises['db-rdl'].load===prescribed-1,`db-rdl ${X.interruption.entry.strength.exercises['db-rdl'].load}, lifted ${prescribed-1} against ${prescribed}`);
 cells.push({prescribed,lifted:prescribed-1,history:X.interruption.entry.strength.exercises['db-rdl'].load,point:summary(X)});out.classes[c]=cells;
}
// ---------- C10. Late evidence (R7-A final I6): week 3 unreviewed with Saturday missed; B reported; then Saturday's lift is synced (executed
// before B). Oracle: the next review in B's re-entry week asks to confirm B (confirmation-first), never applying the late fact silently.
{
 const c='C10-late-evidence',cells=[];
 const base=H.start({id:'se-c10'},3);perDay(base,3,s=>!SAT(s));const sat=base.p.weeks[3].sessions.find(s=>SAT(s));const X=B(base,4,{from:3,to:4});
 const r=H.ev(base,at(base.p,4,6,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(base.p,sat)]}));
 expect(c,r==='ASK/ASK',`the late Saturday lift gave ${r}`);cells.push({B:summary(X),afterLateSync:r});out.classes[c]=cells;
}
// ---------- C11. Order independence (P7): a full-kit equipment statement and a run report on Monday of week 4, in either order, after C1's U
// history. Oracle: the same history.
{
 const c='C11-order',cells=[];
 const base=H.start({id:'se-c11'},2);perDay(base,2,s=>!SAT(s));weekly(base,3,s=>!SAT(s));
 const eq={kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:'2026-12-20',to:'2026-12-24'}},run=t=>({kind:'WEEKLY_REVIEW',observations:t.p.weeks[4].sessions.filter(s=>live(s)&&s.sport==='RUN'&&s.day===0).map(s=>obs(t.p,s))});
 const a=copy(base),b=copy(base);H.ev(a,at(a.p,4,0,'06:00',eq));H.ev(a,at(a.p,4,0,'06:30',run(a)));H.ev(b,at(b.p,4,0,'06:00',run(b)));H.ev(b,at(b.p,4,0,'06:30',eq));
 const X=B(a,4),Y=B(b,4);expect(c,bare(X.interruption.entry)===bare(Y.interruption.entry),'the order changed history');cells.push({a:summary(X),b:summary(Y)});out.classes[c]=cells;
}
// ---------- C12. Two steps (I9; QE-R7AB-01 through a later projection): week F unreviewed with S missed, week F+1 reviewed with S missed
// again (the next start carries S's values from a projection), week F+2 executed in full and never reviewed, B in week F+3; R reviews every
// week. Oracle: SAME FACTS against R.
{
 const c='C12-rebuilt-then-executed',cells=[];
 for(const [sn,miss] of Object.entries(SESSIONS))for(const F of [2,4]){
  const base=H.start({id:`se-c12-${sn}-${F}`},F),res={};
  for(const cell of ['U','R']){const t=copy(base);if(cell==='U'){perDay(t,F,s=>!miss(s));weekly(t,F+1,s=>!miss(s));perDay(t,F+2,()=>true);}else{weekly(t,F,s=>!miss(s));weekly(t,F+1,s=>!miss(s));weekly(t,F+2,()=>true);}res[cell]={t,B:B(t,F+3)};}
  const n=noMore(`${c}/${sn}/F${F}`,res.U.t,res.U.B,res.R.t,res.R.B);cells.push({sn,F,U:summary(res.U.B),R:summary(res.R.B),compared:n});
 }
 out.classes[c]=cells;
}
out.summary={classes:Object.keys(out.classes).length,violations:out.violations.length};
print(out);
