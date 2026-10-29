// R7AB-QE-r1 scratch for P40: field-level diff of B's entry (and of the start of week F+2) between cell U (week F unreviewed) and cell R
// (reviewed), with the ledger's executed loads of the exercises that differ. Read-only, prints only.
import {H,at,obs,on,addDays,brk,lastR,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
const flat=(o,p='')=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>flat(v,p?p+'.'+k:k)):[[p,JSON.stringify(o)]];
const diff=(a,b)=>{const A=new Map(flat(a)),B=new Map(flat(b));return [...new Set([...A.keys(),...B.keys()])].filter(k=>A.get(k)!==B.get(k)&&!/lastPerformed|planned|entryWeek/.test(k)).map(k=>`${k}: U=${A.get(k)} R=${B.get(k)}`);};
const out={};
for(const [name,{F,miss}] of Object.entries({saturdayLift:{F:2,miss:s=>s.sport==='STRENGTH'&&s.day===5},tuesdayQuality:{F:3,miss:s=>s.sport==='RUN'&&s.day===1}})){
 const base=H.start({id:'qab-p40d-'+name},F),cells={};
 for(const cell of ['U','R']){const t=copy(base);if(cell==='U'){perDay(t,F,s=>!miss(s));sundayOnMonday(t,F);}else H.weekly(t,F,s=>!miss(s));H.weekly(t,F+1,s=>!miss(s));
  const d=t.p.weeks[F+2].startDate;H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2))));cells[cell]={t,B:lastR(t.p)};}
 const executed=t=>t.ledger.filter(o=>o.logs&&Object.keys(o.logs).length).flatMap(o=>Object.entries(o.logs).map(([id,l])=>`${o.localDate} ${id} ${l.load}`));
 out[name]={startF1:diff(cells.U.t.p.stateTrace[F+1],cells.R.t.p.stateTrace[F+1]),startF2:diff(cells.U.t.p.stateTrace[F+2],cells.R.t.p.stateTrace[F+2]),entryB:diff(cells.U.B.interruption.entry,cells.R.B.interruption.entry),
  executedLoads:executed(cells.U.t).filter(x=>/db-rdl|db-split-squat|db-row|db-bench/.test(x)),plannedRowsF:cells.U.t.p.weeks[F].sessions.filter(s=>live(s)).map(s=>`${s.date} ${s.sport} ${s.role} ${s.prescription.family}:${s.prescription.durationMinutes}`)};
}
print(out);
