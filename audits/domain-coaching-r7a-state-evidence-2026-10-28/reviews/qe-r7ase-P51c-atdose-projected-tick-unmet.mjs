// R7ASE-QE-r1 P51c (independent engineering judge, STATE-EVIDENCE-FREEZE-1): P51b with week 7's Saturday lift at the projected 24 kg but
// NOT a success at 24 kg: the repetition target missed (reps 3 of 5), the repetitions unlogged, or reps in reserve below the prescription.
// The record then holds no successful exposure at 24 kg at all, so a load tick at 24 kg can only come from the projection (it assumed week 6's
// missed Saturday lifted at 24 kg). Cells: U (weeks 5 and 6 unreviewed) against R6 (the same facts, week 6 reviewed). Week 7 reviewed Sunday.
// B: a 2-day trip Tuesday-Wednesday of week 8, reported Thursday 06:00 (SHORT: resumes the state).
// Oracle (Founder §1, §11, §13, P4, P7; contract §5): U = R6; no tick at 24 kg without an executed success at 24 kg.
// QE_TZ sets the time zone. Read-only; synthetic; DEV_TEST_ONLY; prints only.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));
 H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));};
const SAT=s=>s.sport==='STRENGTH'&&s.day===5,IDS=['db-rdl','db-split-squat'];
const exs=st=>Object.fromEntries(IDS.map(id=>{const e=st?.strength?.exercises?.[id]??st?.exercises?.[id];return [id,e?`${e.mode}${e.load??''} reps ${e.reps} tick ${e.loadTick??0}`:null];}));
const satRows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&SAT(s)).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value??''}`));
// Week 7's Saturday report: every set at the prescribed load, with `edit` applied to each set of the two exercises.
const VAR={met:null,repsShort:x=>({...x,reps:3}),repsUnlogged:({reps,...x})=>x,rirBelow:x=>({...x,rir:0})};
const week7=(t,edit)=>H.ev(t,at(t.p,7,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[7].sessions.filter(live).map(s=>{const o=obs(t.p,s);if(edit&&SAT(s))o.actual.exercises=o.actual.exercises.map(e=>IDS.includes(e.id)?{...e,sets:e.sets.map(edit)}:e);return o;})}));
const TZ=Number(process.env.QE_TZ??0),base=H.start({id:'qse-p51c',tz:TZ},5),out={probe:'R7ASE-QE-P51c',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',tz:TZ,variants:{}};
for(const [vn,edit] of Object.entries(VAR)){
 const v={cells:{}};
 for(const [cell,f] of Object.entries({U:t=>{perDay(t,5,s=>!SAT(s));perDay(t,6,s=>!SAT(s));},R6:t=>{perDay(t,5,s=>!SAT(s));H.weekly(t,6,s=>!SAT(s));}})){
  const t=copy(base);f(t);const w7=exs(t.p.stateTrace[7]),rv=week7(t,edit),w8=exs(t.p.stateTrace[8]);
  const d=t.p.weeks[8].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
  v.cells[cell]={week7Planning:w7,week7Review:rv,week8Planning:w8,B:b,stateAt:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}`,values:Object.fromEntries(IDS.map(id=>[id,B.interruption.stateAt.values?.STRENGTH?.[id]])),
   entry:exs(B.interruption.entry),rowsAfterB:[...satRows(t.p,8),...satRows(t.p,9),...satRows(t.p,10)],
   at24:Object.fromEntries(IDS.map(id=>[id,t.ledger.filter(o=>o.logs?.[id]&&o.logs[id].load===24).map(o=>`${o.localDate} 24kg reps ${o.logs[id].reps} rir ${o.logs[id].minRir} repsMet=${o.logs[id].repsMet}`)]))};
 }
 v.UequalsR6={entry:JSON.stringify(v.cells.U.entry)===JSON.stringify(v.cells.R6.entry),rowsAfterB:JSON.stringify(v.cells.U.rowsAfterB)===JSON.stringify(v.cells.R6.rowsAfterB)};
 out.variants[vn]=v;
}
print(out);
