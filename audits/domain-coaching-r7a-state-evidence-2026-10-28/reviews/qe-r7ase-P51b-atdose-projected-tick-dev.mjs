// R7ASE-QE-r1 P51b (independent engineering judge, STATE-EVIDENCE-FREEZE-1): P51 on development weeks. atDose promotes the stored start's
// load, repetitions and load ticks when the athlete lifts the projected load. When the projection ran two weeks ahead of history, the stored
// ticks at the new load include an exposure at that load the athlete never executed.
// History (default synthetic program; weeks 0-4 trained and reviewed; week 5 starts db-rdl/db-split-squat at 22 kg, tick 1, as evidence):
//  cell U : weeks 5 and 6 (DEVELOPMENT) each executed but for Saturday's lift and never reviewed (per-day reports; Sunday's run on Monday
//           06:00). The projection: week 6 at 24 kg tick 0 (week 5's Saturday assumed lifted, the step), week 7 at 24 kg tick 1 (week 6's
//           Saturday at 24 kg assumed lifted). Week 7 (CONSOLIDATION) executed in full as prescribed (Saturday at 24 kg) and reviewed Sunday.
//  cell R6: the same facts, with week 6 reviewed on Sunday 21:00 (Saturday missed). Week 7 identical: prescribed 24 kg, lifted, reviewed.
//  B: a 2-day trip Tuesday-Wednesday of week 8, reported Thursday 06:00 (SHORT: resumes the state).
// Oracle (Founder §1, §11, P4, P7; contract §5): U and R6 have the same facts, so B's state is the same; 24 kg was lifted once, in week 7, and
// the tick a projection assumed for week 6's missed Saturday is no fact. QE_TZ sets the time zone. Read-only; synthetic; DEV_TEST_ONLY; prints only.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));
 H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));};
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,IDS=['db-rdl','db-split-squat'];
const exs=st=>Object.fromEntries(IDS.map(id=>{const e=st?.strength?.exercises?.[id]??st?.exercises?.[id];return [id,e?`${e.mode}${e.load??''} reps ${e.reps} tick ${e.loadTick??0} lastPerformed ${e.lastPerformed}`:null];}));
const satRows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value??''}`));
const auth=(t,k)=>({RUN:t.p.weeks[k].startAuthority?.RUN?.provenance,STRENGTH:t.p.weeks[k].startAuthority?.STRENGTH?.provenance,projectedBase:t.p.weeks[k].startAuthority?.STRENGTH?.projectedBase??null});
const TZ=Number(process.env.QE_TZ??0),base=H.start({id:'qse-p51b',tz:TZ},5),out={probe:'R7ASE-QE-P51b',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',tz:TZ,phases:base.p.phases.phases.slice(4,9),week5Start:exs(base.p.stateTrace[5]),cells:{}};
const plans={U:t=>{perDay(t,5,s=>!SAT(s));perDay(t,6,s=>!SAT(s));},R6:t=>{perDay(t,5,s=>!SAT(s));H.weekly(t,6,s=>!SAT(s));}};
for(const [cell,f] of Object.entries(plans)){
 const t=copy(base);f(t);
 const w7={authority:auth(t,7),planning:exs(t.p.stateTrace[7]),saturdayRows:satRows(t.p,7)};
 const rv=H.weekly(t,7);
 const w8={authority:auth(t,8),planning:exs(t.p.stateTrace[8]),saturdayRows:satRows(t.p,8)};
 const d=t.p.weeks[8].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
 out.cells[cell]={week7Start:w7,week7Review:rv,week8Start:w8,B:b,class:B.interruption.class,stateAt:{kind:B.interruption.stateAt.kind,week:B.interruption.stateAt.week,values:Object.fromEntries(IDS.map(id=>[id,B.interruption.stateAt.values?.STRENGTH?.[id]]))},
  entry:exs(B.interruption.entry),rowsAfterB:[...satRows(t.p,8),...satRows(t.p,9),...satRows(t.p,10)],
  lifted:Object.fromEntries(IDS.map(id=>[id,t.ledger.filter(o=>o.logs?.[id]).map(o=>`${o.localDate} ${o.logs[id].load}kg x${o.logs[id].reps} repsMet=${o.logs[id].repsMet}`)]))};
}
out.UequalsR6={entry:JSON.stringify(out.cells.U.entry)===JSON.stringify(out.cells.R6.entry),rowsAfterB:JSON.stringify(out.cells.U.rowsAfterB)===JSON.stringify(out.cells.R6.rowsAfterB)};
print(out);
