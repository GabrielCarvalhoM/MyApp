// Scratch (author, pre-freeze): every field of B's entry that differs between the P40 cells U and R (live), as the test builds them.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const SAT=s=>s.sport==='STRENGTH'&&s.day===5;
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day===6).map(s=>obs(t.p,s))}));};
const flat=(o,p='')=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>flat(v,p?p+'.'+k:k)):[[p,JSON.stringify(o)]];
const base=H.start({id:'se-diff'},2),res={};
for(const cell of ['U','R']){const t=copy(base);if(cell==='U')perDay(t,2,s=>!SAT(s));else H.weekly(t,2,s=>!SAT(s));H.weekly(t,3,s=>!SAT(s));const d=t.p.weeks[4].startDate;H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2))));res[cell]=lastR(t.p).interruption.entry;}
const A=new Map(flat(res.U)),Bm=new Map(flat(res.R));print([...new Set([...A.keys(),...Bm.keys()])].filter(k=>A.get(k)!==Bm.get(k)).map(k=>`${k}: U=${A.get(k)} R=${Bm.get(k)}`));
