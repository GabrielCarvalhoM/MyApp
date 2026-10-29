// P05 (reviewer-owned, Properties C and D on the run in a re-entry): in RETURN and RESTART modes weeklyGates maps every run role to one gate key
// ('EASY'), roles visited in RUN_GATE_ROLE order (LONG, QUALITY, EASY, WALK_JOG), and setGate overwrites: a HOLD set by a missed or pending
// LONG run is replaced by the ADVANCE of the EASY runs visited after it (the strength loop guards this; the run loop does not). Measured:
//  (a) the return week of a MODERATE (17 days) and a LONG (31 days) interruption reported on Thursday 06:00, re-entry this week; Thursday's
//      run executed in every cell; Sunday's long run EXEC, MISSED, or the reverse: Thursday's easy run missed and Sunday's long run executed (EASY_MISSED).
//      Read: history's run at Thursday 22:00 (Sunday's run not yet due), the closing review's gates, history at next Monday and next week's run rows.
//  (b) control outside a re-entry (EASY mode): week 3 with its long run missed.
import * as L from './qe-r7asc-lib.mjs';
const out={probe:'qe-r7asc-P05-reentry-run-gate',root:L.ROOT_USED,cases:{}};
const runOf=st=>({mode:st.mode,returnStep:st.returnStep??null,restart:st.restart??null,easy:st.easy??null,long:st.long??null,longestContinuous:st.longestContinuous??null});
const runRows=(t,w)=>t.p.weeks[w].sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension?':'+s.progression.dimension+'='+s.progression.value:''}`).join(' ');
function reentry(days,shape){
 L.resetIds();const g=L.R.generateProgram(L.intake({id:'qe-p05'}),L.opts),t={p:g.program,ledger:[]};L.weekly(t,0);L.weekly(t,1);
 const start=t.p.weeks[2].startDate,end=L.addDays(start,days-1),report=L.addDays(end,1),W=t.p.weeks.findIndex(x=>report>=x.startDate&&report<=L.addDays(x.startDate,6));
 L.step(t,L.at(t.p,W,Math.round((Date.parse(report)-Date.parse(t.p.weeks[W].startDate))/864e5),'06:00:00',L.brk(start,end)));
 const d=t.p.decisions.at(-1),rowsW=runRows(t,W);
 const thu=t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.sport==='RUN'&&s.day===3),sun=t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.sport==='RUN'&&s.day===6),sat=t.p.weeks[W].sessions.filter(s=>L.live(s)&&s.sport==='STRENGTH'&&s.day===5);
 if(shape!=='EASY_MISSED')L.step(t,L.at(t.p,W,3,'12:00:00',{observations:thu.map(s=>L.obs(t.p,s))}));
 const midweek=runOf(L.history(t,W,3,'22:00:00').state.run);
 L.step(t,L.at(t.p,W,5,'21:00:00',{observations:sat.map(s=>L.obs(t.p,s))}));
 const r=L.step(t,L.at(t.p,W,6,'21:00:00',{observations:shape==='MISSED'?[]:sun.map(s=>L.obs(t.p,s))}));
 return {class:d.interruption?.class,reportWeek:W,fromWeek:d.fromWeek,entryRun:runOf(d.interruption.entry.run),returnWeekRunRows:rowsW,thursday:thu.map(s=>s.role),sunday:sun.map(s=>s.role),
  historyRunThu2200:midweek,closingReview:{action:r.action,gates:Object.fromEntries(Object.entries(r.gates??{}).filter(([k])=>['EASY','LONG','QUALITY','WALK_JOG'].includes(k))),reasons:(t.p.decisions.at(-1).reasons??[]).filter(x=>['EASY','LONG','QUALITY','WALK_JOG'].includes(x.key)).map(x=>x.gate+': '+x.why)},
  historyRunNextMonday:runOf(L.history(t,W+1,0).state.run),nextWeekRunRows:runRows(t,W+1)};
}
for(const [name,days] of [['MODERATE',17],['LONG',31]]){const c={};for(const shape of ['EXEC','MISSED','EASY_MISSED'])c[shape]=reentry(days,shape);
 c.missedLongStillSteps=JSON.stringify(c.MISSED.historyRunNextMonday)===JSON.stringify(c.EXEC.historyRunNextMonday);
 c.missedEasyHolds=JSON.stringify(c.EASY_MISSED.historyRunNextMonday)!==JSON.stringify(c.EXEC.historyRunNextMonday);
 c.creditedBeforeSundayExists=JSON.stringify(c.EXEC.historyRunThu2200)!==JSON.stringify(c.EXEC.entryRun);
 out.cases[name]=c;}
// (b) control outside a re-entry.
{L.resetIds();const t=L.start('qe-p05c',3),long=t.p.weeks[3].sessions.filter(s=>L.live(s)&&s.sport==='RUN'&&s.role==='LONG').map(s=>s.id);
 const r=L.weekly(t,3,s=>!long.includes(s.id));
 out.controlEasyMode={gates:Object.fromEntries(Object.entries(r.gates??{}).filter(([k])=>['EASY','LONG','QUALITY'].includes(k))),historyRun:runOf(L.history(t,4,0).state.run),rows4:runRows(t,4)};}
console.log(JSON.stringify(out,null,1));
