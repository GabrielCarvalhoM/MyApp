// Scratch (author, pre-freeze): after a return with nothing executed, B's entry against A's, field by field (live). Prints only.
import {H,at,addDays,brk,lastR,print,copy} from '../../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const flat=(o,p='')=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>flat(v,p?p+'.'+k:k)):[[p,JSON.stringify(o)]];
const diff=(a,b)=>{const A=new Map(flat(a)),B=new Map(flat(b));return [...new Set([...A.keys(),...B.keys()])].filter(k=>A.get(k)!==B.get(k)).map(k=>`${k}: B=${A.get(k)} A=${B.get(k)}`);};
const t=H.start({id:'se-nothing',schedule:{runDays:[1,3,6],strengthDays:[2,5],longRunDay:6}},3);H.weekly(t,3,()=>false);H.weekly(t,4,()=>false);
const d0=t.p.weeks[5].startDate;H.ev(t,at(t.p,5,0,'06:00',brk(addDays(d0,-16),addDays(d0,-1))));const A=lastR(t.p);
const u=copy(t);H.ev(u,at(u.p,6,3,'06:00',brk(addDays(d0,8),addDays(d0,9))));const B=lastR(u.p);
print({A:{fromWeek:A.fromWeek,stateAt:A.interruption.stateAt},B:{stateAt:B.interruption.stateAt},diff:diff(B.interruption.entry,A.interruption.entry),week6:u.p.weeks[6].startAuthority});
