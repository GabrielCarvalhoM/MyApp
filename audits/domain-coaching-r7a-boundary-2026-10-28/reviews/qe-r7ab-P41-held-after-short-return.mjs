// R7AB-QE-r1 P41 (independent engineering judge, R7A-BOUNDARY-FINAL-FREEZE): P40 after a return. A SHORT return carries no return steps, so
// historicalWeekStart's "inside a return" base rule (contract §3, I4) never applies to the weeks after it.
// History (default synthetic program): weeks 0-3 trained and reviewed; A: a 7-day break, Monday-Sunday of week 4, reported Monday 06:00 of
// week 5 (SHORT: re-entry this week, week 5 RETURN_ENTRY, week 6 projected).
//  week 5 (re-entry): every session but Saturday's lift executed, reported day by day, Sunday's run on Monday; NOT reviewed (cell U), or
//          reviewed Sunday 21:00 with the same facts (cell R, the control);
//  week 6: Saturday's lift missed again, the rest executed, weekly review Sunday 21:00;
//  B: a separate 2-day trip, Tuesday-Wednesday of week 7, reported Thursday 06:00.
// Oracle as P40: B starts from no value that only a projection made (the loads of Saturday's lift were last executed in week 3).
// Prints only; synthetic data; DEV_TEST_ONLY authority.
import {H,at,obs,on,addDays,brk,lastR,stateSummary,strengthRows,runRows,print,copy,live} from '../../domain-coaching-r7a-final-2026-10-28/reviews/qe-r7af-lib.mjs';
const auth=a=>a?`${a.authority} RUN:${a.RUN?.provenance} STR:${a.STRENGTH?.provenance}`:null;
const perDay=(t,w,keep)=>{for(const s of t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.day<6))H.ev(t,at(t.p,w,s.day,'21:00',{kind:'WEEKLY_REVIEW',observations:[obs(t.p,s)]}));};
const sundayOnMonday=(t,w)=>H.ev(t,at(t.p,w+1,0,'06:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6).map(s=>obs(t.p,s))}));
const flat=(o,p='')=>o&&typeof o==='object'?Object.entries(o).flatMap(([k,v])=>flat(v,p?p+'.'+k:k)):[[p,JSON.stringify(o)]];
const diff=(a,b)=>{const A=new Map(flat(a)),B=new Map(flat(b));return [...new Set([...A.keys(),...B.keys()])].filter(k=>A.get(k)!==B.get(k)&&!/lastPerformed|planned|entryWeek/.test(k)).map(k=>`${k}: U=${A.get(k)} R=${B.get(k)}`);};
const miss=s=>s.sport==='STRENGTH'&&s.day===5;
const base=H.start({id:'qab-p41'},4),d4=base.p.weeks[4].startDate;
const a=H.ev(base,at(base.p,5,0,'06:00',brk(d4,addDays(d4,6)))),A=lastR(base.p);
const out={probe:'R7AB-QE-P41',runtime:process.env.QE_LIVE_ROOT?'QE_LIVE_ROOT':'LIVE',A:{result:a,class:A.interruption.class,fromWeek:A.fromWeek,week5:auth(base.p.weeks[5].startAuthority),week6:auth(base.p.weeks[6].startAuthority)},cells:{}};
const cells={};
for(const cell of ['U','R']){
 const t=copy(base);if(cell==='U'){perDay(t,5,s=>!miss(s));sundayOnMonday(t,5);}else H.weekly(t,5,s=>!miss(s));
 const w6=auth(t.p.weeks[6].startAuthority),rv=H.weekly(t,6,s=>!miss(s)),w7=auth(t.p.weeks[7].startAuthority);
 const d=t.p.weeks[7].startDate,b=H.ev(t,on(t,addDays(d,3),'06:00',brk(addDays(d,1),addDays(d,2)))),B=lastR(t.p);
 cells[cell]={t,B};
 out.cells[cell]={week6Start:w6,week6Review:rv,week7Start:w7,B:b,class:B.interruption.class,relation:B.interruption.relation,stateAt:{kind:B.interruption.stateAt.kind,week:B.interruption.stateAt.week,authority:B.interruption.stateAt.authority},entry:stateSummary(B.interruption.entry),
  rowsAfterB:[...runRows(t.p,7,addDays(d,3)),...strengthRows(t.p,7,addDays(d,3)),...runRows(t.p,8,addDays(d,7)),...strengthRows(t.p,8,addDays(d,7))]};
}
out.entryDiffUvsR=diff(cells.U.B.interruption.entry,cells.R.B.interruption.entry);
out.rowsDiff={U:out.cells.U.rowsAfterB.filter(x=>!out.cells.R.rowsAfterB.includes(x)),R:out.cells.R.rowsAfterB.filter(x=>!out.cells.U.rowsAfterB.includes(x))};
out.executedLoadsSaturdayExercises=cells.U.t.ledger.filter(o=>o.logs).flatMap(o=>Object.entries(o.logs).filter(([id])=>/db-rdl|db-split-squat/.test(id)).map(([id,l])=>`${o.localDate} ${id} ${l.load}`));
print(out);
