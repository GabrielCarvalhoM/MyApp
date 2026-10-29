// Q7 (reviewer-owned): the judge's P41 history rebuilt, recording what each cell actually lifted, to classify the U/R entry difference the live
// freeze shows for db-bench-press and db-row (different facts, or a projection reaching history?).
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q7-p41-facts',root:L.ROOT_USED,cells:{}};
const IDS=['db-bench-press','db-row','db-rdl','db-split-squat'];
for(const cell of ['U','R']){
 const t=L.start('qe-q7',4),w4=t.p.weeks[4].startDate;
 L.step(t,L.at(t.p,5,0,'06:00:00',L.brk(w4,L.addDays(w4,6))));
 // week 5: every session but Saturday's lift, day by day; Sunday's run on Monday; reviewed only in R
 for(const s of t.p.weeks[5].sessions.filter(s=>L.live(s)&&!L.SAT(s)&&s.day<6))L.step(t,L.at(t.p,5,s.day,'21:00:00',{observations:[L.obs(t.p,s)]}));
 const sun=t.p.weeks[5].sessions.filter(s=>L.live(s)&&s.day===6).map(s=>L.obs(t.p,s));
 if(cell==='R'){L.step(t,L.at(t.p,5,6,'21:00:00',{observations:sun}));L.step(t,L.at(t.p,6,0,'06:00:00',{}));}
 else L.step(t,L.at(t.p,6,0,'06:00:00',{observations:sun}));
 const rows6=L.rowsOf(t,6,s=>s.sport==='STRENGTH',IDS);
 L.weekly(t,6,s=>!L.SAT(s));
 const w7=t.p.weeks[7].startDate,d=L.step(t,L.at(t.p,7,3,'06:00:00',L.brk(L.addDays(w7,1),L.addDays(w7,2))));
 const entry=Object.fromEntries(IDS.map(id=>[id,(e=>e?`${e.mode}${e.load??''} reps ${e.reps} lastExecutedSets ${e.lastExecutedSets??'-'}`:null)(t.p.decisions.at(-1).interruption.entry.strength.exercises[id])]));const maxSets=Object.fromEntries(IDS.map(id=>[id,Math.max(0,...t.ledger.filter(o=>!o.superseded&&!o.conflicted).flatMap(o=>(o.actual?.exercises??[]).filter(e=>e.id===id).map(e=>e.sets.length)))]));
 out.cells[cell]={maxSetsExecuted:maxSets,week6Rows:rows6.map(r=>`${r.date} ${r.id} ${r.mode}${r.value??''}`),lifted:Object.fromEntries(IDS.map(id=>[id,L.logsOf(t,id).map(l=>`${l.day}:${l.load}`)])),entry};
}
const a=out.cells.U.lifted,b=out.cells.R.lifted;out.sameFactsForDifferingExercises=Object.fromEntries(['db-bench-press','db-row'].map(id=>[id,JSON.stringify(a[id])===JSON.stringify(b[id])]));
console.log(JSON.stringify(out,null,1));
