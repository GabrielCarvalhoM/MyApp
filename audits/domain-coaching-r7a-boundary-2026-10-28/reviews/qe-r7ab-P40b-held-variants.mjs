// R7AB-QE-r1 P40b (independent engineering judge): P40's mechanism in more cells, each against its control (cell R: week F reviewed with
// the same facts). Variants of week F+1 (reviewed on Sunday 21:00): the same session S missed again (P40); nothing executed at all; S
// executed but with its reps not logged (held by the gate). And S = Saturday's lift or Sunday's long run (F = 2), or Wednesday's lift (F = 2).
// B: Tuesday-Wednesday of week F+2, reported Thursday 06:00, the first interruption. Reports per cell: B's point and authority, and every field
// of B's entry that differs from the control, with the loads the ledger shows executed. Prints only; synthetic data; DEV_TEST_ONLY.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w,keep)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));
const flat=(o,p='')=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>flat(v,p?p+'.'+k:k)):[[p,JSON.stringify(o)]];
const diff=(a,b)=>{const A=new Map(flat(a)),B=new Map(flat(b));return [...new Set([...A.keys(),...B.keys()])].filter(k=>A.get(k)!==B.get(k)&&!/lastPerformed|planned|entryWeek/.test(k)).map(k=>`${k}: U=${A.get(k)} R=${B.get(k)}`);};
const S={saturdayLift:s=>s.sport==='STRENGTH'&&s.day===5,wednesdayLift:s=>s.sport==='STRENGTH'&&s.day===2,sundayLong:s=>s.sport==='RUN'&&s.day===6};
const F1={sameMissed:(t,w,miss)=>H.weekly(t,w,s=>!miss(s)),nothing:(t,w)=>H.weekly(t,w,()=>false),
 repsUnlogged:(t,w,miss)=>H.ev(t,at(t.p,w,6,'21:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(live).map(s=>{const o=obs(t.p,s);if(miss(s)&&o.actual.exercises)o.actual.exercises=o.actual.exercises.map(e=>({...e,sets:e.sets.map(({reps,...x})=>x)}));return o;})}))};
const out={probe:'R7AB-QE-P40b',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',cells:[]},F=2;
for(const [sn,miss] of Object.entries(S))for(const [fn,f1] of Object.entries(F1)){
 const base=H.start({id:`qab-p40b-${sn}-${fn}`},F),res={};
 for(const cell of ['U','R']){const t=copy(base);if(cell==='U'){perDay(t,F,s=>!miss(s));sundayOnMonday(t,F,s=>!miss(s));}else H.weekly(t,F,s=>!miss(s));
  const rv=f1(t,F+1,miss);const d=t.p.weeks[F+2].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
  res[cell]={t,B,rv,b};}
 const U=res.U,R=res.R,ex=U.t.ledger.filter(o=>o.logs).flatMap(o=>Object.entries(o.logs).map(([id,l])=>`${o.localDate} ${id} ${l.load}`));
 out.cells.push({session:sn,weekF1:fn,U:{f1Review:U.rv,B:U.b,point:`${U.B.interruption.stateAt.kind}/w${U.B.interruption.stateAt.week}`,authority:U.B.interruption.stateAt.authority},R:{f1Review:R.rv,B:R.b,point:`${R.B.interruption.stateAt.kind}/w${R.B.interruption.stateAt.week}`,authority:R.B.interruption.stateAt.authority},
  entryDiff:diff(U.B.interruption.entry,R.B.interruption.entry),lastRunsU:U.t.ledger.filter(o=>o.context?.sport==='RUN').map(o=>`${o.localDate} ${o.context.role} ${o.actual.minutes}`).slice(-6)});
}
out.tally={cells:out.cells.length,withEntryDiff:out.cells.filter(c=>c.entryDiff.length).length};
print(out);
