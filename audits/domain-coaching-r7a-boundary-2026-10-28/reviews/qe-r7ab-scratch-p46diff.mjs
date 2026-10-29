// R7AB-QE-r1 scratch for P46 F=1 "exact": field diff of B's entry, U (week 1 executed as projected, unreviewed) against R (reviewed), and
// the rows prescribed after B for the exercises that differ. Read-only, prints only.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live,strengthRows} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const flat=(o,p='')=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>flat(v,p?p+'.'+k:k)):[[p,JSON.stringify(o)]];
const diff=(a,b)=>{const A=new Map(flat(a)),B=new Map(flat(b));return [...new Set([...A.keys(),...B.keys()])].filter(k=>A.get(k)!==B.get(k)&&!/lastPerformed|planned|entryWeek/.test(k)).map(k=>`${k}: U=${A.get(k)} R=${B.get(k)}`);};
const F=1,base=H.start({id:'qab-p46d'},F),res={};
for(const cell of ['U','R']){const t=copy(base),rows=t.p.weeks[F].sessions.filter(live);
 if(cell==='U'){for(const s of rows.filter(s=>s.day<6))H.ev(t,at(t.p,F,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));H.ev(t,at(t.p,F+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:rows.filter(s=>s.day===6).map(s=>obs(t.p,s))}));}
 else res.review=H.ev(t,at(t.p,F,6,'21:00',{kind:'WEEKLY_REVIEW',observations:rows.map(s=>obs(t.p,s))}));
 const startF1=t.p.stateTrace[F+1];const d=t.p.weeks[F+1].startDate;H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2))));res[cell]={t,B:lastR(t.p),startF1,after:strengthRows(t.p,F+1,addDays(d,3))};}
print({reviewR:res.review,week2StartDiff:diff(res.U.startF1,res.R.startF1),entryDiff:diff(res.U.B.interruption.entry,res.R.B.interruption.entry),rowsAfterB:{U:res.U.after.filter(x=>!res.R.after.includes(x)),R:res.R.after.filter(x=>!res.U.after.includes(x))}});
