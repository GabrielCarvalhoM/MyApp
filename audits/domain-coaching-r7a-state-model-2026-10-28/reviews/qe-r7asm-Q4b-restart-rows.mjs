// Q4b (reviewer-owned): continues Q4's LONG cells. From week R+2 on, both cells execute every run as prescribed and review each week, so the
// ledgers stay identical as long as the prescriptions do. Reports, per week, the plan's run state, history's run state and the run rows.
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q4b-restart-rows',root:L.ROOT_USED,cells:{}};
const runOf=st=>st?{mode:st.mode,restart:st.restart??null,easy:st.easy??null,long:st.long??null,easyWeeksDone:st.easyWeeksDone??null,longestContinuous:st.longestContinuous??null}:null;
const runRows=(t,w)=>t.p.weeks[w].sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}`).join(' ');
for(const cell of ['U','C']){
 const t=L.start('qe-q4b',3),s0=t.p.weeks[3].startDate,end=L.addDays(s0,34),reportDay=L.addDays(end,1);
 const rw=t.p.weeks.findIndex(x=>reportDay>=x.startDate&&reportDay<=L.addDays(x.startDate,6));
 L.step(t,L.at(t.p,rw,Math.round((Date.parse(reportDay)-Date.parse(t.p.weeks[rw].startDate))/864e5),'06:00:00',L.brk(s0,end)));
 const R=t.p.decisions.at(-1).fromWeek;
 if(cell==='C')L.weekly(t,R,()=>false);
 L.weekly(t,R+1,()=>false);
 const weeks=[];
 for(let w=R+2;w<Math.min(R+8,t.p.weeks.length-1);w++){
  weeks.push({week:w,phase:t.p.phases.phases[w],planRun:runOf(t.p.stateTrace[w].run),historyRun:runOf(L.history(t,w,0).state.run),rows:runRows(t,w)});
  L.weekly(t,w,s=>s.sport==='RUN');
 }
 out.cells[cell]={fromWeek:R,weeks,ledgerHash:L.V.hash(t.ledger.map(o=>({s:o.sessionId,a:o.actual,t:o.observedAt})))};
}
const U=out.cells.U.weeks,C=out.cells.C.weeks;
out.firstWeekRowsDiffer=U.find((x,i)=>x.rows!==C[i]?.rows)?.week??null;
out.firstWeekPlanStateDiffers=U.find((x,i)=>JSON.stringify(x.planRun)!==JSON.stringify(C[i]?.planRun))?.week??null;
out.historyAlwaysEqual=U.every((x,i)=>JSON.stringify(x.historyRun)===JSON.stringify(C[i]?.historyRun));
console.log(JSON.stringify(out,null,1));
