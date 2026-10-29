// R7ASE-QE-r1 scratch (read-only): P40b cell sundayLong/nothing, B's entry for db-calf-raise and db-split-squat in U and R, with the ledger.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w,keep)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&keep(s)).map(s=>obs(t.p,s))}));
const miss=s=>s.sport==='RUN'&&s.day===6,F=2,IDS=['db-calf-raise','db-split-squat'],base=H.start({id:'qab-p40b-sundayLong-nothing'},F),out={};
for(const cell of ['U','R']){const t=copy(base);if(cell==='U'){perDay(t,F,s=>!miss(s));sundayOnMonday(t,F,s=>!miss(s));}else H.weekly(t,F,s=>!miss(s));
 H.weekly(t,F+1,()=>false);const d=t.p.weeks[F+2].startDate;H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2))));const B=lastR(t.p);
 out[cell]={entry:Object.fromEntries(IDS.map(id=>{const e=B.interruption.entry.strength.exercises[id];return [id,`${e.mode}${e.load} reps ${e.reps} tick ${e.loadTick} src ${e.source}`];})),values:Object.fromEntries(IDS.map(id=>[id,B.interruption.stateAt.values.STRENGTH[id]])),
  logs:t.ledger.filter(o=>IDS.some(id=>o.logs?.[id])).flatMap(o=>IDS.filter(id=>o.logs[id]).map(id=>`${o.localDate} ${id} ${o.logs[id].load}x${o.logs[id].reps}`))};}
print(out);
