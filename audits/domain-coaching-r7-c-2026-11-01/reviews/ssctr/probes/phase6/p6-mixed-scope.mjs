// SSCTR Phase 6 recheck, probe P6-MS: scope of the residual found by CC2 on R7C-FREEZE-3 (a MIXED answer recorded by a handler clinical route is
// not applied after clearance). Answers V over the gap's runs: EXEC, ADVERSE (long runs adverse), MIXED_LONG (long done, the rest not: the Phase 6
// grid's MIXED), and the other mixed patterns MIXED_ALT (every other run not done, from the first done: CC2's MIXED), MIXED_ALT1 (its complement),
// EASY_ONE (one easy run per week done, the rest not), LONG_NOT (long runs not done, the rest done), WEEKS_ALT (whole weeks alternately done and
// not done). Programs GEN b=5,7,9 and R10K b=9, taper b=10, race week b=11; gap from week 0 or 2; RV (gap weeks reviewed with strength only) or NR.
// Recorders on day 2 of week b: SUB_PAIN (substitution with pain), RET_ILL (clinical return report), R4 (schedule change in the last week). After a
// clinical route, clearance as the tests model it (no clinical reference state). Next: a plain decision on day 3 (PLAIN) or the answer re-sent
// (RESEND). Compared with D (the same answer delivered by a plain review on day 2, then the same day-3 decision) and A (the facts at week b-1's
// review). Flags among VALID cells: B differs from D; B above D (a longer non-race run in a slot, or an intense role D lacks); B keeps a race touch or
// a taper quality session D lacks; M2 (mixed: a run ahead longer than A's in the same slot); E1 (adverse: equal to EXEC's plan, or a longer long
// run). Read-only; prints JSON.
import {runtimes,kit,GEN,R10K,VALID} from '../cc/cc-lib.mjs';
const {rt,cleanup}=await runtimes([]);
const R=rt.HEAD,K=kit(R),H=K.H;
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const VS=['EXEC','ADVERSE','MIXED_LONG','MIXED_ALT','MIXED_ALT1','EASY_ONE','LONG_NOT','WEEKS_ALT'];
function factsOf(p,g,b,V){
 const runs=K.runSessions(p,g,b);const firstEasy=new Map();
 return runs.map((s,i)=>{const wk=p.weeks.findIndex(w=>w.sessions.includes(s));if(s.role==='EASY'&&!firstEasy.has(wk))firstEasy.set(wk,s.id);
  const not=V==='MIXED_LONG'?s.role!=='LONG':V==='MIXED_ALT'?i%2===1:V==='MIXED_ALT1'?i%2===0:V==='EASY_ONE'?firstEasy.get(wk)!==s.id:V==='LONG_NOT'?s.role==='LONG':V==='WEEKS_ALT'?(wk-g)%2===1:false;
  return not?K.notDone(p,s):H.obs(p,s,V==='ADVERSE'&&s.role==='LONG'?{response:BAD}:{});});
}
const RECORDERS={
 SUB_PAIN:(p,b,facts)=>{const X=p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH'&&s.date>=K.day(p,b,2)).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];return X?{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts}:null;},
 RET_ILL:(p,b,facts)=>({day:2,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',observations:facts,interruption:{startDate:p.weeks[b].startDate,endDate:K.day(p,b,1),days:2,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false}}),
 R4:(p,b,facts)=>b===p.weeks.length-1?{day:2,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts}:null
};
const slots=(P,b,d)=>{const day=K.day(P,b,d);return Object.fromEntries(P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.date>=day).map(s=>[s.date,{role:s.role,min:s.prescription.durationMinutes}]));};
const fmt=o=>Object.entries(o).map(([d,x])=>`${d.slice(5)} ${x.role}:${x.min}`).join(' ');
const INT=r=>['QUALITY','RACE_TOUCH'].includes(r);
const above=(a,ref)=>Object.entries(a).filter(([d,x])=>x.role!=='RACE'&&(!ref[d]?true:(x.min>ref[d].min||INT(x.role)&&!INT(ref[d].role)))).map(([d,x])=>`${d.slice(5)} ${x.role}:${x.min}`);
const out={check:'SSCTR-P6-MIXED-SCOPE',cells:0,byV:{},flagged:[],errors:[]};
const progs=[['GEN',GEN(H),5],['GEN',GEN(H),7],['GEN',GEN(H),9],['R10K',R10K(H),9],['R10K taper',R10K(H),10],['R10K race week',R10K(H),11]];
const EXECPLAN={};
for(const [name,o,b] of progs)for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of VS){
 let pre,st;
 try{pre={p:H.program(o),ledger:[],ref:null};
  for(let w=0;w<g;w++)K.step(pre,w,{observations:pre.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(pre.p,s))});
  if(mode==='RV')for(let w=g;w<b-1;w++)K.step(pre,w,{observations:K.strengthOf(pre.p,w)});
  st=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>K.strengthOf(pre.p,w)):[]),...K.strengthOf(pre.p,b-1)];
 }catch(e){out.errors.push(`${name} b=${b} g=${g} ${mode} ${V}: ${e.message}`);continue;}
 const facts=factsOf(pre.p,g,b,V),A=K.copy(pre),B0=K.copy(pre);
 K.step(A,b-1,{observations:[...st,...facts]});const q=K.step(B0,b-1,{observations:st});
 for(const [rec,make] of Object.entries(RECORDERS)){
  const x=make(B0.p,b,facts);if(!x)continue;
  for(const [nk,nx] of [['PLAIN',{}],['RESEND',{observations:facts}]]){
   try{
    const B=K.copy(B0),r0=K.step(B,b,x);if(r0.status==='CLINICAL_HUMAN_REQUIRED')B.ref=null;
    const D=K.copy(B0),ta=K.copy(A);K.step(D,b,{day:2,hour:'07:00:00',observations:facts});K.step(ta,b,{day:2,hour:'07:00:00'});
    const rb=K.step(B,b,{day:3,hour:'07:00:00',...nx}),rd=K.step(D,b,{day:3,hour:'07:00:00'}),ra=K.step(ta,b,{day:3,hour:'07:00:00'});
    const sB=slots(rb.proposal??B.p,b,3),sD=slots(rd.proposal??D.p,b,3),sA=slots(ra.proposal??ta.p,b,3),valid=rb.planValidity?.status===VALID;
    const key=`${name} b=${b} g=${g} ${mode} ${V} ${rec}->${nk}`;
    if(V==='EXEC'&&nk==='PLAIN'&&rec==='SUB_PAIN')EXECPLAN[`${name} b=${b} g=${g} ${mode}`]=sD;
    out.cells++;const bv=out.byV[V]??={cells:0,valid:0,notD:0,aboveD:0,raceOrTaperExtra:0,m2:0,e1:0,recorderStatus:{}};bv.cells++;bv.recorderStatus[r0.status]=(bv.recorderStatus[r0.status]??0)+1;
    if(!valid)continue;bv.valid++;
    const notD=JSON.stringify(sB)!==JSON.stringify(sD),aD=above(sB,sD);
    const extra=Object.entries(sB).filter(([d,x])=>(x.role==='RACE_TOUCH'||x.role==='QUALITY'&&/taper|race/.test(name))&&!(sD[d]&&sD[d].role===x.role)).map(([d,x])=>`${d.slice(5)} ${x.role}:${x.min}`);
    const m2=V.startsWith('MIXED')||['EASY_ONE','LONG_NOT','WEEKS_ALT'].includes(V)?Object.entries(sB).filter(([d,x])=>sA[d]&&sA[d].role===x.role&&x.min>sA[d].min&&x.role!=='RACE').map(([d,x])=>`${d.slice(5)} ${x.role}:${x.min}>${sA[d].min}`):[];
    let e1=[];if(V==='ADVERSE'){const ex=EXECPLAN[`${name} b=${b} g=${g} ${mode}`];if(ex){if(JSON.stringify(sB)===JSON.stringify(ex)&&Object.values(ex).some(z=>z.role==='LONG'))e1.push('equal to EXEC');const lb=Object.values(sB).find(z=>z.role==='LONG'),le=Object.values(ex).find(z=>z.role==='LONG');if(lb&&le&&lb.min>le.min)e1.push(`long ${lb.min}>${le.min}`);}}
    if(notD)bv.notD++;if(aD.length)bv.aboveD++;if(extra.length)bv.raceOrTaperExtra++;if(m2.length)bv.m2++;if(e1.length)bv.e1++;
    if(notD||extra.length||m2.length||e1.length)out.flagged.push({key,question:q.question?.kind??null,rec:r0.status,B:{s:rb.status,a:rb.action,reason:String(rb.reason??'').slice(0,90)},inB:fmt(sB),inD:fmt(sD),inA:fmt(sA),aboveD:aD,extra,m2,e1});
   }catch(e){out.errors.push(`${name} b=${b} g=${g} ${mode} ${V} ${rec} ${nk}: ${e.message}`);}
  }
 }
}
cleanup();
console.log(JSON.stringify(out,null,1));
