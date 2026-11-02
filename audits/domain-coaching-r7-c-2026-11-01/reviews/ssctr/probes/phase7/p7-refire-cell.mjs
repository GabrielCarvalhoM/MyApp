// SSCTR Phase 7 recheck, probe P7-RC: the direct-path cells where P7-DP found the day-5 decision raising next week's easy runs on R7C-FREEZE-4
// (GEN b=5 g=0 RV, the answer every gap run at 60 %, delivered directly by a plain review on day 2 07:00). Prints, on HEAD and F3, each decision's
// reason, the run sessions of weeks b and b+1, the single-run ceiling of week b+1 on the record (cc-lib factualCeiling, policy formula), the
// answer-week run sessions elapsed with no report, and the post-review plan; and the same with the day-5 decision replaced by days 4 and 6 07:00.
// Read-only; prints JSON.
import {runtimes,kit,GEN,FREEZE_3} from './p7-lib.mjs';
const {rt,cleanup}=await runtimes([['F3',FREEZE_3]]);
const out={check:'SSCTR-P7-REFIRE-CELL',cases:{}};
for(const [label,R] of Object.entries(rt)){
 const K=kit(R),H=K.H;
 for(const [V,b,g] of [['SHORT60',5,0],['SHORT_NOT',5,0],['SHORT60',7,0]])for(const mid of [[3,5],[3,4],[3,4,5],[4,6]]){
  const t={p:H.program(GEN(H)),ledger:[],ref:null};
  for(let w=0;w<g;w++)K.step(t,w,{observations:t.p.weeks[w].sessions.filter(H.live).map(s=>H.obs(t.p,s))});
  for(let w=g;w<b;w++)K.step(t,w,{observations:K.strengthOf(t.p,w)});
  const facts=K.runSessions(t.p,g,b).map(s=>V==='SHORT_NOT'&&s.role!=='LONG'?K.notDone(t.p,s):H.obs(t.p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*0.6))}));
  const runs=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='RUN'&&H.live(s)).map(s=>`${s.date.slice(5)} ${s.role}:${s.prescription.durationMinutes}`).join(' ');
  const steps=[];const rec=(name,r,day)=>{const cut=day==null?null:K.day(t.p,b,day);steps.push({name,s:r.status,a:r.action??null,v:r.planValidity?.status??null,reason:String(r.reason??'').slice(0,160),wb:runs(t.p,b),wb1:runs(t.p,b+1),ceilingNext:K.factualCeiling(t,b+1),elapsedUnreported:cut?t.p.weeks[b].sessions.filter(s=>s.sport==='RUN'&&H.live(s)&&s.date<cut&&!t.ledger.some(o=>o.sessionId===s.id)).map(s=>s.date.slice(5)):null});};
  rec('answer d2',K.step(t,b,{day:2,hour:'07:00:00',observations:facts}),2);
  for(const d of mid)rec('plain d'+d,K.step(t,b,{day:d,hour:'07:00:00'}),d);
  rec('week review',K.step(t,b,{}),null);rec('first decision b+1',K.step(t,b+1,{day:0,hour:'07:00:00'}),null);
  out.cases[`${label} GEN b=${b} g=${g} RV ${V} mid ${mid.join(',')}`]=steps;
 }
}
cleanup();
console.log(JSON.stringify(out,null,1));
