// SSCTR Phase 7 recheck, probe P7-SH (items 1, 2, 4): shortened, adverse and mixed answers to UNREPORTED_TRAINING recorded by a decision that does
// not apply them, on R7C-FREEZE-4 (HEAD) and R7C-FREEZE-3 (F3). Is the plan the direct answer's, and is that plan inside the authorities?
// Programs GEN b=5,7,9 and R10K b=9 (build), b=10 (taper), b=11 (race week); gap from week 0 or 2; RV (gap weeks reviewed with strength only) or
// NR (not reviewed). Answers over the gap's runs in date order (i its index): EXEC; SHORT60 / SHORT80 (every run at 60 % / 80 % of its minutes);
// LONG_SHORT (long runs at 60 %, the rest in full); EASY_SHORT (every run but the long runs at 60 %); SHORT_NOT (long runs at 60 %, the rest not
// done); SHORT_ADV (every run at 60 % with an adverse response); SHORT_MIX (runs alternately at 60 % and not done); ALL_ADV (every run in full,
// adverse); MIX_ALT (P6-F01's pattern: runs alternately done and not done, from the first done).
// Recorders on day 2 07:00 of week b: SUB_PAIN (substitution with pain), RET_ILL (clinical return report), R4 (schedule change in the last week).
// After a clinical route, clearance as the tests model it (carried record, no clinical reference state). Next on day 3 07:00: PLAIN or RESEND.
// References: D (the same answer by a plain review on day 2, then day 3), A (the same facts at week b-1's review, then day 2 and day 3), the stored
// plan before the answer (S), and the policy single-run ceiling computed independently from the ledger (cc-lib factualCeiling).
// Flags among VALID cells of the recorded path B: notD; aboveA (a run ahead longer than A's in the same slot, more quality work than A's, or an
// intense role A lacks: a step the facts' reviewed reading did not earn); overCeiling (a non-race run ahead in week b above the ceiling of week b);
// raceTaperExtra (a race touch, or quality in taper or race week, that D and A lack); aboveS (a run ahead longer than the stored plan's). Also on D
// itself: D aboveA and D overCeiling. E1-type (adverse never above the same runs without adverse): SHORT_ADV vs SHORT60, ALL_ADV vs EXEC.
// LEGACY: the same cells with the record written by R7C-FREEZE-3 (fork and carrier decision on F3), then cleared and continued on R7C-FREEZE-4;
// TRANSITION: fork on F3, carrier and continuation on R7C-FREEZE-4. Read-only; prints JSON.
import {runtimes,kit,GEN,R10K,VALID,FREEZE_3} from './p7-lib.mjs';
const {rt,cleanup}=await runtimes([['F3',FREEZE_3]]);
const BAD={recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
const VS=['EXEC','SHORT60','SHORT80','LONG_SHORT','EASY_SHORT','SHORT_NOT','SHORT_ADV','SHORT_MIX','ALL_ADV','MIX_ALT'];
const RECS=['SUB_PAIN','RET_ILL','R4'];
const progs=[['GEN',GEN,5],['GEN',GEN,7],['GEN',GEN,9],['R10K build',R10K,9],['R10K taper',R10K,10],['R10K race week',R10K,11]];
const out={check:'SSCTR-P7-SHORT-ANSWER',cells:0,byRuntime:{},flagged:{HEAD:[],F3:[]},dFlags:[],e1:[],legacy:{cells:0,staleValidNotD:0,cases:[]},transition:{cells:0,notD:0,cases:[]},errors:[]};
function tools(R){
 const K=kit(R),H=K.H;
 const short=(p,s,f,x={})=>H.obs(p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*f)),...x});
 const factsOf=(p,g,b,V)=>K.runSessions(p,g,b).map((s,i)=>{
  const L=s.role==='LONG';
  switch(V){
   case 'EXEC':return H.obs(p,s);
   case 'SHORT60':return short(p,s,0.6);
   case 'SHORT80':return short(p,s,0.8);
   case 'LONG_SHORT':return L?short(p,s,0.6):H.obs(p,s);
   case 'EASY_SHORT':return L?H.obs(p,s):short(p,s,0.6);
   case 'SHORT_NOT':return L?short(p,s,0.6):K.notDone(p,s);
   case 'SHORT_ADV':return short(p,s,0.6,{response:BAD});
   case 'SHORT_MIX':return i%2?K.notDone(p,s):short(p,s,0.6);
   case 'ALL_ADV':return H.obs(p,s,{response:BAD});
   case 'MIX_ALT':return i%2?K.notDone(p,s):H.obs(p,s);
  }
 });
 const carrier=(p,b,facts,rec)=>{
  if(rec==='R4')return b===p.weeks.length-1?{day:2,hour:'07:00:00',kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,3]},observations:facts}:null;
  if(rec==='RET_ILL')return {day:2,hour:'07:00:00',kind:'RETURN_AFTER_PAUSE',observations:facts,interruption:{startDate:p.weeks[b].startDate,endDate:K.day(p,b,1),days:2,reasonCategory:'ILLNESS',reason:'flu',nonclinical:false}};
  const X=p.weeks[b].sessions.filter(s=>H.live(s)&&s.sport==='STRENGTH'&&s.date>=K.day(p,b,2)).flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];
  return X?{day:2,hour:'07:00:00',kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:true},observations:facts}:null;
 };
 const cache=new Map();
 function pre(o,g,b,mode){
  const key=`${o.name}|${g}|${b}|${mode}`;if(!cache.has(key))cache.set(key,pre0(o,g,b,mode));
  const c=cache.get(key);return {t:K.copy(c.t),st:c.st};
 }
 function pre0(o,g,b,mode){
  const t={p:H.program(o(H)),ledger:[],ref:null};
  for(let w=0;w<g;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
  if(mode==='RV')for(let w=g;w<b-1;w++)K.step(t,w,{observations:K.strengthOf(t.p,w)});
  const st=[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>K.strengthOf(t.p,w)):[]),...K.strengthOf(t.p,b-1)];
  return {t,st};
 }
 return {K,H,factsOf,carrier,pre};
}
const T={};for(const [k,R] of Object.entries(rt))T[k]=tools(R);
const slots=(K,P,b,d)=>{const day=K.day(P,b,d);return Object.fromEntries(P.weeks[b].sessions.filter(s=>s.sport==='RUN'&&K.H.live(s)&&s.date>=day).map(s=>[s.date,{role:s.role,min:s.prescription.durationMinutes,work:s.prescription.work?(s.prescription.work.repetitions??1)*(s.prescription.work.workMinutes??s.prescription.work.workMinutesEach??0):0}]));};
const fmt=o=>Object.entries(o).map(([d,x])=>`${d.slice(5)} ${x.role}:${x.min}${x.work?`(w${x.work})`:''}`).join(' ');
const INT=r=>['QUALITY','RACE_TOUCH'].includes(r);
const aboveRef=(a,ref)=>Object.entries(a).filter(([d,x])=>x.role!=='RACE'&&(ref[d]?(x.min>ref[d].min&&x.role===ref[d].role||INT(x.role)&&!INT(ref[d].role)||x.role==='QUALITY'&&ref[d].role==='QUALITY'&&x.work>ref[d].work):INT(x.role))).map(([d,x])=>`${d.slice(5)} ${x.role}:${x.min}${x.work?`(w${x.work})`:''}`);
const overC=(a,c)=>Object.entries(a).filter(([,x])=>x.role!=='RACE'&&x.min>c).map(([d,x])=>`${d.slice(5)} ${x.role}:${x.min}>${c}`);
const PLANS={};
for(const [name,o,b] of progs)for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of VS){
 const res={};
 for(const label of ['HEAD','F3']){
  const {K,factsOf,carrier,pre}=T[label];
  let base;
  try{base=pre(o,g,b,mode);}catch(e){out.errors.push(`${label} ${name} b=${b} g=${g} ${mode} ${V}: pre ${e.message}`);continue;}
  const {t,st}=base,facts=factsOf(t.p,g,b,V),A=K.copy(t),B0=K.copy(t);
  K.step(A,b-1,{observations:[...st,...facts]});const q=K.step(B0,b-1,{observations:st});
  const S=slots(K,B0.p,b,3);
  const D=K.copy(B0);K.step(D,b,{day:2,hour:'07:00:00',observations:facts});const rd=K.step(D,b,{day:3,hour:'07:00:00'});
  K.step(A,b,{day:2,hour:'07:00:00'});const ra=K.step(A,b,{day:3,hour:'07:00:00'});
  const sD=slots(K,rd.proposal??D.p,b,3),sA=slots(K,ra.proposal??A.p,b,3),cD=K.factualCeiling(D,b);
  if(label==='HEAD'){
   PLANS[`${name} b=${b} g=${g} ${mode} ${V}`]=sD;
   const dA=aboveRef(sD,sA),dC=overC(sD,cD);
   if(rd.planValidity?.status===VALID&&(dA.length||dC.length))out.dFlags.push({key:`${name} b=${b} g=${g} ${mode} ${V}`,q:q.question?.kind??null,D:fmt(sD),A:fmt(sA),ceiling:cD,DaboveA:dA,DoverCeiling:dC});
  }
  for(const rec of RECS){
   const x=carrier(B0.p,b,facts,rec);if(!x)continue;
   for(const [nk,nx] of [['PLAIN',{}],['RESEND',{observations:facts}]]){
    try{
     const B=K.copy(B0),r0=K.step(B,b,x);if(r0.status==='CLINICAL_HUMAN_REQUIRED')B.ref=null;
     const rb=K.step(B,b,{day:3,hour:'07:00:00',...nx}),sB=slots(K,rb.proposal??B.p,b,3),valid=rb.planValidity?.status===VALID,cB=K.factualCeiling(B,b);
     const bk=out.byRuntime[label]??={cells:0,valid:0,notD:0,staleValid:0,aboveA:0,overCeiling:0,raceTaperExtra:0,aboveS:0,recorderStatus:{},byV:{}};
     bk.cells++;if(label==='HEAD')out.cells++;bk.recorderStatus[r0.status]=(bk.recorderStatus[r0.status]??0)+1;
     const bv=bk.byV[V]??={cells:0,valid:0,notD:0};bv.cells++;
     if(!valid)continue;bk.valid++;bv.valid++;
     const notD=JSON.stringify(sB)!==JSON.stringify(sD),stale=notD&&JSON.stringify(sB)===JSON.stringify(S),aA=aboveRef(sB,sA),oc=overC(sB,cB),aS=aboveRef(sB,S);
     const extra=Object.entries(sB).filter(([d,z])=>(z.role==='RACE_TOUCH'||z.role==='QUALITY'&&/taper|race/.test(name))&&!(sD[d]?.role===z.role)&&!(sA[d]?.role===z.role)).map(([d,z])=>`${d.slice(5)} ${z.role}:${z.min}`);
     if(notD){bk.notD++;bv.notD++;}if(stale)bk.staleValid++;if(aA.length)bk.aboveA++;if(oc.length)bk.overCeiling++;if(extra.length)bk.raceTaperExtra++;if(aS.length)bk.aboveS++;
     if(notD||aA.length||oc.length||extra.length||aS.length)out.flagged[label].push({key:`${name} b=${b} g=${g} ${mode} ${V} ${rec}->${nk}`,rec:r0.status,B:{s:rb.status,a:rb.action,reason:String(rb.reason??'').slice(0,80)},inB:fmt(sB),inD:fmt(sD),inA:fmt(sA),stored:fmt(S),ceiling:cB,notD,stale,aboveA:aA,overCeiling:oc,extra,aboveS:aS});
    }catch(e){out.errors.push(`${label} ${name} b=${b} g=${g} ${mode} ${V} ${rec} ${nk}: ${e.message}`);}
   }
  }
 }
 // LEGACY (record written by R7C-FREEZE-3, continued on R7C-FREEZE-4) and TRANSITION (weeks on F3, answer recorded on R7C-FREEZE-4): SUB_PAIN, PLAIN.
 try{
  const F3=T.F3,F4=T.HEAD,{t,st}=F3.pre(o,g,b,mode),facts=F3.factsOf(t.p,g,b,V),B0=F3.K.copy(t);F3.K.step(B0,b-1,{observations:st});
  const D=F4.K.copy(B0);F4.K.step(D,b,{day:2,hour:'07:00:00',observations:facts});const rd=F4.K.step(D,b,{day:3,hour:'07:00:00'}),sD=slots(F4.K,rd.proposal??D.p,b,3);
  const x=F3.carrier(B0.p,b,facts,'SUB_PAIN');
  if(x){
   const L=F3.K.copy(B0);F3.K.step(L,b,x);L.ref=null;const rl=F4.K.step(L,b,{day:3,hour:'07:00:00'}),sL=slots(F4.K,rl.proposal??L.p,b,3);
   out.legacy.cells++;const lv=rl.planValidity?.status===VALID,lnd=lv&&JSON.stringify(sL)!==JSON.stringify(sD);if(lnd){out.legacy.staleValidNotD++;out.legacy.cases.push({key:`${name} b=${b} g=${g} ${mode} ${V}`,L:fmt(sL),D:fmt(sD)});}
   const Tr=F4.K.copy(B0);const rt0=F4.K.step(Tr,b,x);if(rt0.status==='CLINICAL_HUMAN_REQUIRED')Tr.ref=null;const rt1=F4.K.step(Tr,b,{day:3,hour:'07:00:00'}),sT=slots(F4.K,rt1.proposal??Tr.p,b,3);
   out.transition.cells++;if(rt1.planValidity?.status===VALID&&JSON.stringify(sT)!==JSON.stringify(sD)){out.transition.notD++;out.transition.cases.push({key:`${name} b=${b} g=${g} ${mode} ${V}`,T:fmt(sT),D:fmt(sD)});}
  }
 }catch(e){out.errors.push(`LEGACY ${name} b=${b} g=${g} ${mode} ${V}: ${e.message}`);}
}
// E1-type on the direct path (HEAD): adverse never above the same runs without adverse.
for(const [k,sD] of Object.entries(PLANS)){
 for(const [adv,ref] of [['SHORT_ADV','SHORT60'],['ALL_ADV','EXEC']]){
  if(!k.endsWith(' '+adv))continue;const r=PLANS[k.replace(new RegExp(adv+'$'),ref)];if(!r)continue;
  const up=aboveRef(sD,r);if(up.length)out.e1.push({key:k,adverse:fmt(sD),reference:fmt(r),above:up});
 }
}
cleanup();
console.log(JSON.stringify(out,null,1));
