// R7ASE-QE-r1 P50 (independent engineering judge, STATE-EVIDENCE-FREEZE-1): does the planner's re-establishment threshold (SSCTR D52: "not
// performed for more than moderateMaxDays, in calendar days from its last executed exposure") read a last-performed date that only a
// projection made, after a weekly review whose evidence shows that exposure was never executed?
// History (default synthetic program, weeks 0-1 trained and reviewed; P40's split):
//  week 2: every session except Saturday's lift, reported day by day; Sunday's run reported Monday 06:00. Cell U: week 2 never reviewed;
//          cell R (control): the same facts reviewed Sunday 21:00.
//  weeks 3..LAST: Saturday's lift missed again, everything else executed, weekly review Sunday 21:00 (an ordinary V1 sequence).
// Per review it records the next week's Saturday rows for the Saturday-only exercises (kind, load) and the planning start's lastPerformed,
// and, through a what-if return report that is evaluated but never applied, history's lastPerformed for the same exercises.
// Oracle (Founder §1, §3, §8, §28; D52's own definition): the planner's re-establishment decision about week k+1 is the one the executed
// record gives; U equals R. Read-only; synthetic data; DEV_TEST_ONLY authority; prints only. QE_LIVE_ROOT may point at a copy.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live,peek} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w,keep)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));
const miss=s=>s.sport==='STRENGTH'&&s.day===5,F=2,LAST=Number(process.env.QE_LAST??6),IDS=['db-rdl','db-split-squat'];
const satRows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(s=>live(s)&&s.sport==='STRENGTH'&&s.day===5).flatMap(s=>s.prescription.exercises.filter(e=>IDS.includes(e.id)).map(e=>`${s.date} ${e.id} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${e.load.value??''} kind=${e.exposure?.kind??e.kind??'-'}`));
const executed=(t,id)=>t.ledger.filter(o=>o.logs?.[id]).map(o=>`${o.localDate} ${o.logs[id].load}kg`);
// History's state of the exercises as of Monday of week k: a what-if short break Monday-Tuesday of week k, reported Wednesday 06:00, never applied.
const history=(t,k)=>{const d=t.p.weeks[k].startDate,r=peek(t,on(t,addDays(d,2),'06:00',brk(d,addDays(d,1))));const B=r.proposal?lastR(r.proposal):null;
 return B?{status:r.status,point:`${B.interruption.stateAt.kind}/w${B.interruption.stateAt.week}`,values:Object.fromEntries(IDS.map(id=>[id,B.interruption.stateAt.values?.STRENGTH?.[id]??null])),
  entry:Object.fromEntries(IDS.map(id=>{const e=B.interruption.entry.strength.exercises[id];return [id,e?`${e.mode}${e.load??''} lastPerformed ${e.lastPerformed}`:null];}))}:{status:r.status,action:r.action,reason:r.reason};};
const out={probe:'R7ASE-QE-P50',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',moderateMaxDays:28,cells:{}};
const base=H.start({id:'qse-p50'},F);
for(const cell of ['U','R']){
 const t=copy(base),c={weeks:[]};
 if(cell==='U'){perDay(t,F,s=>!miss(s));sundayOnMonday(t,F,s=>!miss(s));}else H.weekly(t,F,s=>!miss(s));
 for(let k=F+1;k<=LAST;k++){
  const plan=Object.fromEntries(IDS.map(id=>{const e=t.p.stateTrace[k].strength.exercises[id];return [id,e?`${e.mode}${e.load??''} lastPerformed ${e.lastPerformed}`:null];}));
  c.weeks.push({week:k,startAuthority:{RUN:t.p.weeks[k].startAuthority?.RUN?.provenance,STRENGTH:t.p.weeks[k].startAuthority?.STRENGTH?.provenance,projectedBase:t.p.weeks[k].startAuthority?.STRENGTH?.projectedBase??null},
   planningView:plan,saturdayRows:satRows(t.p,k),historyAtMonday:history(t,k)});
  c.weeks.at(-1).review=H.weekly(t,k,s=>!miss(s));
 }
 c.executed=Object.fromEntries(IDS.map(id=>[id,executed(t,id)]));
 out.cells[cell]=c;
}
out.rowDiff=out.cells.U.weeks.map((u,i)=>{const r=out.cells.R.weeks[i];return {week:u.week,U:u.saturdayRows.filter(x=>!r.saturdayRows.includes(x)),R:r.saturdayRows.filter(x=>!u.saturdayRows.includes(x))};}).filter(x=>x.U.length||x.R.length);
print(out);
