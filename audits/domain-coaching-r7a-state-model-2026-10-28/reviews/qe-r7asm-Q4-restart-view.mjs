// Q4 (reviewer-owned): inside a LONG return the run is in RESTART mode; planningBase takes the whole run from history only when mode==='RETURN'
// (src/r6-adaptation.mjs planningBase). Cells with IDENTICAL ledgers: after the return, nothing is executed in the re-entry week (week R) nor the
// week after (R+1). U: week R is not reviewed; R+1 is reviewed. C: both weeks reviewed. Compare the plan's run after R+1's review with history.
// MODERATE variant: the same, with a 20-day interruption (RETURN mode), as the contract's own case.
import * as L from './qe-r7asm-lib.mjs';
const out={probe:'qe-r7asm-Q4-restart-view',root:L.ROOT_USED,variants:{}};
const runOf=st=>st?{mode:st.mode,restart:st.restart??null,returnStep:st.returnStep??null,easy:st.easy??null,long:st.long??null,walkStep:st.walkStep??null}:null;
const runRows=(t,w)=>t.p.weeks[w].sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>`${s.date}:${s.role}:${s.prescription.durationMinutes}`);
for(const [variant,days] of [['LONG',35],['MODERATE',20]]){
 const res={};
 for(const cell of ['U','C']){
  const t=L.start('qe-q4',3);
  const s0=t.p.weeks[3].startDate,end=L.addDays(s0,days-1),reportDay=L.addDays(end,1);
  const rw=t.p.weeks.findIndex(x=>reportDay>=x.startDate&&reportDay<=L.addDays(x.startDate,6));
  const r=L.step(t,{...L.at(t.p,rw,Math.round((Date.parse(reportDay)-Date.parse(t.p.weeks[rw].startDate))/864e5),'06:00:00',L.brk(s0,end))});
  const d=t.p.decisions.at(-1),R=d.fromWeek;
  // week R: nothing executed; reviewed only in C. Week R+1: nothing executed; reviewed in both.
  if(cell==='C')L.weekly(t,R,()=>false);
  L.weekly(t,R+1,()=>false);
  const H=L.history(t,R+2,0),P=t.p.stateTrace[R+2];
  res[cell]={returnAction:r.action,class:d.interruption.class,fromWeek:R,entryRun:runOf(d.interruption.entry.run),
   ledgerSize:t.ledger.length,ledgerHash:L.V.hash(t.ledger.map(o=>({sessionId:o.sessionId,actual:o.actual,observedAt:o.observedAt}))),
   historyRunAtR2:runOf(H.state.run),planRunAtR2:runOf(P.run),startAuthorityR1:t.p.weeks[R+1].startAuthority?.RUN?.provenance,startAuthorityR2:t.p.weeks[R+2].startAuthority?.RUN?.provenance,
   week_R2_runRows:runRows(t,R+2)};
 }
 res.identicalLedgers=res.U.ledgerHash===res.C.ledgerHash;
 res.planDiffersWithIdenticalLedgers=res.identicalLedgers&&JSON.stringify(res.U.planRunAtR2)!==JSON.stringify(res.C.planRunAtR2);
 res.historyEqual=JSON.stringify(res.U.historyRunAtR2)===JSON.stringify(res.C.historyRunAtR2);
 out.variants[variant]=res;
}
console.log(JSON.stringify(out,null,1));
