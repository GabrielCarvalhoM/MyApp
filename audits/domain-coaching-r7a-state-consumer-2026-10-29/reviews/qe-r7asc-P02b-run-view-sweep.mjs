// P02b (reviewer-owned): equivalence-class sweep of P02 (declared boundary E10: outside RETURN/RESTART the view takes the run's targets and unlock
// counters from the projection). For each week k: weeks 0..k-1 trained and reviewed; then
//   EMPTY  : weeks k and k+1 nothing executed. U: k not reviewed, k+1 reviewed. R: both reviewed.
//   NOLONG : week k executed except its long run (LONG gate HOLD), k+1 nothing executed. U: k not reviewed, k+1 reviewed. R: both reviewed.
// Identical ledgers by construction (checked). Reported: whether the rows prescribed for week k+2 differ, how (run dimensions), and whether
// U's view credits an executed easy week (easyWeeksDone) or a ladder step history does not hold. EASY and WALK_JOG athletes.
import * as L from './qe-r7asc-lib.mjs';
const out={probe:'qe-r7asc-P02b-run-view-sweep',root:L.ROOT_USED,profiles:{}};
const runOf=st=>({mode:st.mode,walkStep:st.walkStep??null,restart:st.restart??null,easy:st.easy??null,long:st.long??null,walks:st.walks??null,qualityStep:st.qualityStep??null,specificStep:st.specificStep??null,easyWeeksDone:st.easyWeeksDone??null,stridesDone:st.stridesDone??null});
const runRows=(t,w)=>t.p.weeks[w].sessions.filter(s=>L.live(s)&&s.sport==='RUN').map(s=>`${s.role}:${s.prescription.durationMinutes}${s.progression?.dimension?':'+s.progression.dimension+'='+s.progression.value:''}${s.prescription.strides?.repetitions?':strides'+s.prescription.strides.repetitions:''}`).join(' ');
const ledgerHash=t=>L.V.hash(t.ledger.filter(o=>!o.superseded).map(o=>({s:o.sessionId,a:o.actual,t:o.observedAt})));
const PROFILES={EASY:{},WALK_JOG:{athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'NONE',strengthExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,strengthDaysPerWeek:0},knownExercises:[]},schedule:{runDays:[1,3,6],strengthDays:[2,5],runMinutes:30,strengthMinutes:30,longRunDay:6,longRunMinutes:30}}};
for(const [pname,o] of Object.entries(PROFILES)){
 const res=[];
 for(let k=1;k<=11;k++)for(const shape of ['EMPTY','NOLONG']){
  const cells={};
  for(const cell of ['U','R']){
   const g=L.R.generateProgram(L.intake({id:'qe-p02b-'+pname,...o}),L.opts),t={p:g.program,ledger:[]};
   for(let w=0;w<k;w++)L.weekly(t,w);
   const keepK=shape==='EMPTY'?()=>false:s=>!(s.sport==='RUN'&&s.role==='LONG');
   if(cell==='R')L.weekly(t,k,keepK);else{const obs=t.p.weeks[k].sessions.filter(s=>L.live(s)&&keepK(s));for(const s of obs)L.step(t,L.at(t.p,k,s.day===6?5:s.day,'21:30:00',{observations:[L.obs(t.p,s)]}));}
   L.weekly(t,k+1,()=>false);
   if(k+2>=t.p.weeks.length)continue;
   cells[cell]={ledger:ledgerHash(t),phase:[t.p.phases.phases[k],t.p.phases.phases[k+1]],history:runOf(L.history(t,k+2,0).state.run),plan:runOf(t.p.stateTrace[k+2].run),rows:runRows(t,k+2)};
  }
  if(!cells.U||!cells.R)continue;
  const diff=Object.keys(cells.U.plan).filter(x=>JSON.stringify(cells.U.plan[x])!==JSON.stringify(cells.R.plan[x]));
  res.push({k,shape,phases:cells.U.phase,identicalLedgers:cells.U.ledger===cells.R.ledger,historyEqual:JSON.stringify(cells.U.history)===JSON.stringify(cells.R.history),
   rowsDiffer:cells.U.rows!==cells.R.rows,planDims:diff,U:{plan:Object.fromEntries(diff.map(x=>[x,cells.U.plan[x]])),rows:cells.U.rows},R:{plan:Object.fromEntries(diff.map(x=>[x,cells.R.plan[x]])),rows:cells.R.rows},history:Object.fromEntries(diff.map(x=>[x,cells.U.history[x]])),
   uAheadOfHistory:diff.filter(x=>Number.isFinite(cells.U.plan[x])&&Number.isFinite(cells.U.history[x])&&cells.U.plan[x]>cells.U.history[x])});
 }
 out.profiles[pname]={cases:res.length,identicalLedgersAll:res.every(r=>r.identicalLedgers),historyEqualAll:res.every(r=>r.historyEqual),rowsDiffer:res.filter(r=>r.rowsDiffer).length,uAheadCases:res.filter(r=>r.uAheadOfHistory.length).length,cases_:res};
}
console.log(JSON.stringify(out,null,1));
