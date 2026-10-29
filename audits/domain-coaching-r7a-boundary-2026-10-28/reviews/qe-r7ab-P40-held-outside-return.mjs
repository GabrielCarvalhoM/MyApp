// R7AB-QE-r1 P40 (independent engineering judge, R7A-BOUNDARY-FINAL-FREEZE): a value a weekly review HELD from a projected, unverified week
// start, before any return (contract §3: the "inside a return" base rule is not applied outside one; B3 superseded by Founder 0.1).
// History (default synthetic program; weeks 0..F-1 trained and reviewed):
//  week F:   every session executed except one (the session S), reported day by day; Sunday's run reported on Monday; NOT reviewed (cell U),
//            or reviewed on Sunday 21:00 with the same facts (cell R, the control);
//  week F+1: the same session S missed again; every other session executed; weekly review Sunday 21:00;
//  B:        a separate 2-day trip, Tuesday-Wednesday of week F+2, reported Thursday 06:00 (the first interruption of the program).
// Variants: S = Saturday's lift (F = 2: week 3's projected start lifts db-rdl/db-split-squat at 22 kg, a load never executed);
//           S = Tuesday's quality run (F = 3: week 4's projected start steps the quality dose, never executed).
// Oracle (Founder 0.1, §8, §9; contract §3 I4 rationale "a value the review held is that start's value"): B's state point holds no value
// that only a projection made. Prints only; synthetic data; DEV_TEST_ONLY authority.
import {H,at,obs,on,addDays,brk,lastR,stateSummary,strengthRows,runRows,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const auth=a=>a?`${a.authority} RUN:${a.RUN?.provenance} STR:${a.STRENGTH?.provenance}`:null;
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
const out={probe:'R7AB-QE-P40',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',tz:Number(process.env.QE_TZ??0),variants:{}};
for(const [name,{F,miss}] of Object.entries({saturdayLift:{F:2,miss:s=>s.sport==='STRENGTH'&&s.day===5},tuesdayQuality:{F:3,miss:s=>s.sport==='RUN'&&s.day===1}})){
 const base=H.start({id:'qab-p40-'+name,tz:Number(process.env.QE_TZ??0)},F),v={cells:{}};
 for(const cell of ['U','R']){
  const t=copy(base);
  if(cell==='U'){perDay(t,F,s=>!miss(s));sundayOnMonday(t,F);}else H.weekly(t,F,s=>!miss(s));
  const startF1={auth:auth(t.p.weeks[F+1].startAuthority),state:stateSummary(t.p.stateTrace[F+1]),rows:[...runRows(t.p,F+1,t.p.weeks[F+1].startDate),...strengthRows(t.p,F+1,t.p.weeks[F+1].startDate)]};
  const rv=H.weekly(t,F+1,s=>!miss(s));
  const startF2={review:rv,auth:auth(t.p.weeks[F+2].startAuthority),state:stateSummary(t.p.stateTrace[F+2])};
  const d=t.p.weeks[F+2].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
  v.cells[cell]={weekF1Start:startF1,weekF2Start:startF2,B:b,class:B.interruption.class,relation:B.interruption.relation,stateAt:{kind:B.interruption.stateAt.kind,week:B.interruption.stateAt.week,authority:B.interruption.stateAt.authority},entry:stateSummary(B.interruption.entry),
   rowsAfterB:[...runRows(t.p,F+2,addDays(d,3)),...strengthRows(t.p,F+2,addDays(d,3)),...runRows(t.p,F+3,addDays(d,7)),...strengthRows(t.p,F+3,addDays(d,7))]};
 }
 const U=v.cells.U,R=v.cells.R;
 v.entryDiff={run:U.entry.run===R.entry.run?null:{U:U.entry.run,R:R.entry.run},strength:Object.fromEntries(Object.keys({...U.entry.strength,...R.entry.strength}).filter(k=>U.entry.strength[k]!==R.entry.strength[k]).map(k=>[k,{U:U.entry.strength[k],R:R.entry.strength[k]}]))};
 v.rowsDiff={U:U.rowsAfterB.filter(x=>!R.rowsAfterB.includes(x)),R:R.rowsAfterB.filter(x=>!U.rowsAfterB.includes(x))};
 out.variants[name]=v;
}
print(out);
