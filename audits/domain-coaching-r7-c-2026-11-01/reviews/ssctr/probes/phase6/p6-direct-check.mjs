// SSCTR Phase 6 recheck, probe P6-DC: the P6-MS flags where the recorder path equals the direct answer (B == D), checked on the direct path itself
// on R7C-FREEZE-3 (HEAD) and R7C-FREEZE-2 (F2): GEN b=5 g=2 RV/NR EXEC and ADVERSE (E1 flag), GEN b=7 g=2 RV LONG_NOT and GEN b=9 g=2 RV
// MIXED_ALT1 (M2 flag on quality minutes), and the on-time path A. Prints the run sessions from day 3 of week b with the quality work structure.
// Also the residual cell GEN b=7 g=0 RV MIXED_ALT through a clinical route on both runtimes (B), and week b+1 after week b's review. Read-only.
import {runtimes,kit,GEN} from '../cc/cc-lib.mjs';
const F2='a10cec04071be97e409f11a4f831f13eae0c9769';
const {rt,cleanup}=await runtimes([['F2',F2]]);
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const out={check:'SSCTR-P6-DIRECT-CHECK',cases:{}};
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H;
 const runs=(P,b,d)=>{const day=K.day(P,b,d);return P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.date>=day).map(s=>`${s.role}:${s.prescription.durationMinutes}${s.prescription.work?` ${s.prescription.work.repetitions}x${s.prescription.work.workMinutes}`:''}`).join(' | ');};
 const facts=(p,g,b,V)=>K.runSessions(p,g,b).map((s,i)=>{const not=V==='LONG_NOT'?s.role==='LONG':V==='MIXED_ALT1'?i%2===0:V==='MIXED_ALT'?i%2===1:false;return not?K.notDone(p,s):H.obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{});});
 for(const [b,g,mode,V,clin] of [[5,2,'RV','EXEC'],[5,2,'RV','ADVERSE'],[5,2,'NR','EXEC'],[5,2,'NR','ADVERSE'],[7,2,'RV','LONG_NOT'],[9,2,'RV','MIXED_ALT1'],[7,0,'RV','MIXED_ALT',true]]){
  const pre={p:H.program(GEN(H)),ledger:[],ref:null};
  for(let w=0;w<g;w++)K.step(pre,w,{observations:pre.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(pre.p,s))});
  if(mode==='RV')for(let w=g;w<b-1;w++)K.step(pre,w,{observations:K.strengthOf(pre.p,w)});
  const st=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>K.strengthOf(pre.p,w)):[]),...K.strengthOf(pre.p,b-1)];
  const f=facts(pre.p,g,b,V),A=K.copy(pre),B=K.copy(pre);K.step(A,b-1,{observations:[...st,...f]});K.step(B,b-1,{observations:st});
  const D=K.copy(B);K.step(D,b,{day:2,hour:'07:00:00',observations:f});const rd=K.step(D,b,{day:3,hour:'07:00:00'});
  K.step(A,b,{day:2,hour:'07:00:00'});const ra=K.step(A,b,{day:3,hour:'07:00:00'});
  const res={D:{status:rd.status,action:rd.action,runs:runs(rd.proposal??D.p,b,3)},A:{status:ra.status,action:ra.action,runs:runs(ra.proposal??A.p,b,3)}};
  if(clin){const C=K.copy(B),X=C.p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH'&&s.date>=K.day(C.p,b,2)).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
   const c=K.step(C,b,{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:f});C.ref=null;const rb=K.step(C,b,{day:3,hour:'07:00:00'});
   res.B={carrier:c.status,status:rb.status,action:rb.action,validity:rb.planValidity?.status,runs:runs(rb.proposal??C.p,b,3)};
   for(const [n,T] of [['B',C],['D',D]]){K.step(T,b,{});const nx=K.step(T,b+1,{day:0,hour:'07:00:00'});res[n].nextWeek={status:nx.status,action:nx.action,validity:nx.planValidity?.status,runs:runs(nx.proposal??T.p,b+1,0)};}}
  out.cases[`GEN b=${b} g=${g} ${mode} ${V} ${label}`]=res;
 }
}
cleanup();
console.log(JSON.stringify(out,null,1));
