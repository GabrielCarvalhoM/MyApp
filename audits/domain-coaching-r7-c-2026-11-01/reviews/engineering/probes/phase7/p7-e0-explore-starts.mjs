// Exploration (read-only): which decisions close weeks on the RV fork (GEN g=0 b=7), and with what clock; also when weeks g..b-2 are closed by
// an end-of-week SCHEDULE_CHANGE (day 6, 21:00, strength reports) instead of a weekly review. Prints JSON.
import {RUNTIMES,client,live,programs,strengthOf,startsOf,brief} from './p7-lib.mjs';
const out={};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,{GEN}=programs(H);
 for(const closer of ['REVIEW','SCHEDULE_CHANGE','SUBSTITUTION']){
  const t=client(R,H.program(GEN)),steps=[];
  for(let w=0;w<6;w++){
   const x={observations:strengthOf(H,t.p,w)};
   let r;
   if(closer==='REVIEW')r=t.step(w,x);
   else if(closer==='SCHEDULE_CHANGE')r=t.step(w,{...x,kind:'SCHEDULE_CHANGE',changes:{strengthDays:[0,4]}});
   else{const X=t.p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').flatMap(s=>s.prescription.exercises.map(e=>e.id))[0];r=t.step(w,{...x,kind:'EXERCISE_SUBSTITUTION',substitution:{exerciseId:X,reason:'SKILL_MISMATCH',pain:false}});}
   steps.push({w,...brief(r),gates:r.gates?Object.fromEntries(Object.entries(r.gates).filter(([k])=>['EASY','LONG','QUALITY'].includes(k))):null,reason:String(r.reason).slice(0,140)});
  }
  const q=t.step(6,{observations:strengthOf(H,t.p,6)});steps.push({w:6,...brief(q)});
  out[`${name} ${closer}`]={steps,starts:startsOf(t.p).slice(0,9),decisions:t.p.decisions.map(d=>({eventId:d.eventId,asOf:d.asOf,action:d.action,gates:d.gates?Object.fromEntries(Object.entries(d.gates).filter(([k])=>['EASY','LONG','QUALITY'].includes(k))):null,keys:Object.keys(d)}))};
 }
}
console.log(JSON.stringify(out,null,1));
