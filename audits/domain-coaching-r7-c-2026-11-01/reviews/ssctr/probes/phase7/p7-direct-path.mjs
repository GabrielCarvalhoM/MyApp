// SSCTR Phase 7 recheck, probe P7-DP (items 1, 2): is the direct answer itself (the reference every recorded answer must now equal) unchanged by
// Phase 7? The P7-SH base grid (GEN b=5,7,9; R10K b=9,10,11; gap from week 0 or 2; RV or NR; the ten answers) on R7C-FREEZE-4 (HEAD) and
// R7C-FREEZE-3 (F3): D = the answer by a plain review on day 2 07:00, then plain decisions on day 3 and day 5 07:00, the week's review with nothing
// new and the first decision of week b+1; A = the same facts at week b-1's review, then the same decisions. Compares status, action, validity and
// the run sessions of weeks b and b+1 at each step. Read-only; prints JSON.
import {runtimes,kit,GEN,R10K,FREEZE_3} from './p7-lib.mjs';
const {rt,cleanup}=await runtimes([['F3',FREEZE_3]]);
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const VS=['EXEC','SHORT60','SHORT80','LONG_SHORT','EASY_SHORT','SHORT_NOT','SHORT_ADV','SHORT_MIX','ALL_ADV','MIX_ALT'];
const progs=[['GEN',GEN,5],['GEN',GEN,7],['GEN',GEN,9],['R10K build',R10K,9],['R10K taper',R10K,10],['R10K race week',R10K,11]];
const out={check:'SSCTR-P7-DIRECT-PATH',cells:0,identicalD:0,identicalA:0,differing:[],errors:[]};
function trace(R,o,name,b,g,mode,V){
 const K=kit(R),H=K.H,short=(p,s,f,x={})=>H.obs(p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*f)),...x});
 const t={p:H.program(o(H)),ledger:[],ref:null};
 for(let w=0;w<g;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)K.step(t,w,{observations:K.strengthOf(t.p,w)});
 const st=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>K.strengthOf(t.p,w)):[]),...K.strengthOf(t.p,b-1)];
 const facts=K.runSessions(t.p,g,b).map((s,i)=>{const L=s.role==='LONG';return V==='EXEC'?H.obs(t.p,s):V==='SHORT60'?short(t.p,s,0.6):V==='SHORT80'?short(t.p,s,0.8):V==='LONG_SHORT'?(L?short(t.p,s,0.6):H.obs(t.p,s)):V==='EASY_SHORT'?(L?H.obs(t.p,s):short(t.p,s,0.6)):V==='SHORT_NOT'?(L?short(t.p,s,0.6):K.notDone(t.p,s)):V==='SHORT_ADV'?short(t.p,s,0.6,{response:BAD}):V==='SHORT_MIX'?(i%2?K.notDone(t.p,s):short(t.p,s,0.6)):V==='ALL_ADV'?H.obs(t.p,s,{response:BAD}):(i%2?K.notDone(t.p,s):H.obs(t.p,s));});
 const runs=(P,w)=>w<P.weeks.length?P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&H.live(s)).map(s=>`${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}${s.prescription.work?`(${s.prescription.work.repetitions}x${s.prescription.work.workMinutes})`:''}`).join(' '):null;
 const seq=(T,first)=>{const steps=[];const rec=r=>steps.push({s:r.status,a:r.action??null,v:r.planValidity?.status??null,q:r.question?.kind??null,wb:runs(T.p,b),wb1:runs(T.p,b+1)});
  rec(K.step(T,b,first));rec(K.step(T,b,{day:3,hour:'07:00:00'}));rec(K.step(T,b,{day:5,hour:'07:00:00'}));if(b+1<T.p.weeks.length){rec(K.step(T,b,{}));rec(K.step(T,b+1,{day:0,hour:'07:00:00'}));}return steps;};
 const A=K.copy(t),D=K.copy(t);K.step(A,b-1,{observations:[...st,...facts]});K.step(D,b-1,{observations:st});
 return {D:seq(D,{day:2,hour:'07:00:00',observations:facts}),A:seq(A,{day:2,hour:'07:00:00'})};
}
for(const [name,o,b] of progs)for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of VS){
 try{
  const h=trace(rt.HEAD,o,name,b,g,mode,V),f=trace(rt.F3,o,name,b,g,mode,V);out.cells++;
  const dD=JSON.stringify(h.D)===JSON.stringify(f.D),dA=JSON.stringify(h.A)===JSON.stringify(f.A);if(dD)out.identicalD++;if(dA)out.identicalA++;
  if(!dD||!dA)out.differing.push({key:`${name} b=${b} g=${g} ${mode} ${V}`,D:dD?'identical':{HEAD:h.D,F3:f.D},A:dA?'identical':{HEAD:h.A,F3:f.A}});
 }catch(e){out.errors.push(`${name} b=${b} g=${g} ${mode} ${V}: ${e.message}`);}
}
cleanup();
console.log(JSON.stringify(out,null,1));
