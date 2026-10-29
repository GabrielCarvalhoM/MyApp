// R7ASE-QE-r1 P51 (independent engineering judge, STATE-EVIDENCE-FREEZE-1): atDose ("a projected dose the athlete then lifted is a fact")
// promotes the stored start's load, repetitions AND load ticks. Can a tick the projection assumed from a week the athlete never executed
// reach history through it (two steps: a projection over a projection, then the lifted dose)?
// History (default synthetic program; weeks 0-1 trained and reviewed):
//  cell U : week 2 and week 3 each executed but for Saturday's lift and never reviewed (per-day reports; Sunday's run reported Monday 06:00);
//           so week 4's projected start assumed week 3's Saturday lifted at the projected 22 kg (one tick at 22). Week 4 executed in full as
//           prescribed (Saturday at 22 kg) and reviewed Sunday 21:00.
//  cell R3: the same facts, with week 3 reviewed on Sunday 21:00 (Saturday missed). Week 4 identical (prescribed 22, lifted 22, reviewed).
//  cell R : every week reviewed (week 4 then prescribes and lifts 20 kg: different facts, shown for reference).
//  B: a 2-day trip Tuesday-Wednesday of week 5, reported Thursday 06:00.
// Oracle (Founder §1, §11, P4, P7; contract §5 "the step the projection took and the athlete then took"): U and R3 have the same facts, so
// B's entry is the same; 22 kg lifted once (target met) is never two ticks at 22 kg. Read-only; synthetic; DEV_TEST_ONLY; prints only.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));
 H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));};
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,IDS=['db-rdl','db-split-squat'];
const exs=(st,ids=IDS)=>Object.fromEntries(ids.map(id=>{const e=st?.strength?.exercises?.[id]??st?.exercises?.[id];return [id,e?`${e.mode}${e.load??''} reps ${e.reps} tick ${e.loadTick??0} lastPerformed ${e.lastPerformed}`:null];}));
const satRows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value??''}`));
const TZ=Number(process.env.QE_TZ??0),base=H.start({id:'qse-p51',tz:TZ},2),out={probe:'R7ASE-QE-P51',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',tz:TZ,cells:{}};
const plans={U:t=>{perDay(t,2,s=>!SAT(s));perDay(t,3,s=>!SAT(s));},R3:t=>{perDay(t,2,s=>!SAT(s));H.weekly(t,3,s=>!SAT(s));},R:t=>{H.weekly(t,2,s=>!SAT(s));H.weekly(t,3,s=>!SAT(s));}};
for(const [cell,f] of Object.entries(plans)){
 const t=copy(base);f(t);
 const w4={authority:{RUN:t.p.weeks[4].startAuthority?.RUN?.provenance,STRENGTH:t.p.weeks[4].startAuthority?.STRENGTH?.provenance,projectedBase:t.p.weeks[4].startAuthority?.STRENGTH?.projectedBase??null},planning:exs(t.p.stateTrace[4]),saturdayRows:satRows(t.p,4)};
 const rv=H.weekly(t,4);
 const w5={authority:{STRENGTH:t.p.weeks[5].startAuthority?.STRENGTH?.provenance,projectedBase:t.p.weeks[5].startAuthority?.STRENGTH?.projectedBase??null},planning:exs(t.p.stateTrace[5]),saturdayRows:satRows(t.p,5)};
 const d=t.p.weeks[5].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
 out.cells[cell]={week4Start:w4,week4Review:rv,week5Start:w5,B:b,stateAt:{kind:B.interruption.stateAt.kind,week:B.interruption.stateAt.week,values:Object.fromEntries(IDS.map(id=>[id,B.interruption.stateAt.values?.STRENGTH?.[id]]))},
  entry:exs(B.interruption.entry),lifted:Object.fromEntries(IDS.map(id=>[id,t.ledger.filter(o=>o.logs?.[id]).map(o=>`${o.localDate} ${o.logs[id].load}kg x${o.logs[id].reps} repsMet=${o.logs[id].repsMet}`)]))};
}
out.UequalsR3=JSON.stringify(out.cells.U.entry)===JSON.stringify(out.cells.R3.entry);
print(out);
