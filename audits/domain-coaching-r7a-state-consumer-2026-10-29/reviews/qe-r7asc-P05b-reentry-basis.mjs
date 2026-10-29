// P05b (reviewer-owned): P05's MODERATE return week, read by the public reader at Thursday 22:00 (Thursday's easy run executed, Sunday's long
// run not yet due) and at Sunday 23:00 after a missed long run: the basis HistoricalState gives the run (COMPLETED_SESSIONS means the reducer
// read the week as executed completely) and the return step, beside the evidence reducer's own definition of "complete" (every run gate
// ADVANCE, a gate holding when any row of its role was not executed as prescribed).
import * as L from './qe-r7asc-lib.mjs';
const out={probe:'qe-r7asc-P05b-reentry-basis',root:L.ROOT_USED,cells:{}};
for(const shape of ['SUNDAY_PENDING','SUNDAY_MISSED']){
 L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-p05'}),L.opts),t={p:g.program,ledger:[]};L.weekly(t,0);L.weekly(t,1);
 const start=t.p.weeks[2].startDate,end=L.addDays(start,16),report=L.addDays(end,1),W=t.p.weeks.findIndex(x=>report>=x.startDate&&report<=L.addDays(x.startDate,6));
 L.step(t,L.at(t.p,W,3,'06:00:00',L.brk(start,end)));
 const thu=t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.sport==='RUN'&&s.day===3);L.step(t,L.at(t.p,W,3,'12:00:00',{observations:thu.map(s=>L.obs(t.p,s))}));
 const cut=shape==='SUNDAY_PENDING'?`${L.addDays(t.p.weeks[W].startDate,3)}T22:00:00Z`:`${L.addDays(t.p.weeks[W].startDate,6)}T23:00:00Z`;
 const H=L.historyAt(t,cut),runRows=t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>({role:s.role,date:s.date,executed:t.ledger.some(o=>o.sessionId===s.id),afterReturnPoint:s.date>=L.addDays(t.p.weeks[W].startDate,3)}));
 out.cells[shape]={cut,basis:H.basis,point:H.point,run:{mode:H.state.run.mode,returnStep:H.state.run.returnStep??null},runRowsOfReturnWeek:runRows};
}
console.log(JSON.stringify(out,null,1));
