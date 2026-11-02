// SSCTR CC recheck, probe CC6: a CC1 observation. After an EXEC answer (gap executed as prescribed) later in week b, with the answer week's
// elapsed runs unreported, B's week b+1 holds a threshold step above A's on HEAD only. Prints, for HEAD, R7C-FREEZE-1 and A (facts at week b-1's
// review), weeks b and b+1 (role:minutes:family:status) and the run state of week b+1. Read-only; prints JSON.
import {runtimes,kit,GEN,FREEZE_1} from './cc-lib.mjs';
const {rt,cleanup}=await runtimes([['F1',FREEZE_1]]);
const out={check:'SSCTR-CC6-EXEC-QUALITY-STEP',cases:{}};
const wk=(K,P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}:${s.prescription.family??''}:${s.status??'PLANNED'}`);
const st=(P,w)=>{const r=P.stateTrace?.[w]?.run??{};return {mode:r.mode,qualityStep:r.qualityStep,qualityFamily:r.qualityFamily,longMinutes:r.longMinutes,easyMinutes:r.easyMinutes,establishedEasyWeeks:r.establishedEasyWeeks,planned:r.planned};};
for(const [label,R] of Object.entries(rt)){const K=kit(R),H=K.H;
 for(const [g,mode,b,d] of [[0,'NR',5,4],[0,'NR',5,2],[0,'RV',5,4],[2,'NR',7,4],[0,'NR',7,4]]){
  const f=K.fork(GEN(H),{g,b,mode,V:'EXEC'}),B=K.copy(f.B),A=K.copy(f.A);
  const rb=K.step(B,b,{day:d,hour:'07:00:00',observations:f.facts});const ra=K.step(A,b,{day:d,hour:'07:00:00'});
  const key=`GEN g=${g} ${mode} b=${b} d=${d}`;out.cases[key]=out.cases[key]??{};
  out.cases[key][label]={answer:K.brief(rb),B:{weekB:wk(K,B.p,b),weekB1:wk(K,B.p,b+1),stateB1:st(B.p,b+1)},A:{weekB:wk(K,A.p,b),weekB1:wk(K,A.p,b+1),stateB1:st(A.p,b+1)},ceilingB1:K.factualCeiling(B,b+1)};
 }}
cleanup();console.log(JSON.stringify(out,null,1));
