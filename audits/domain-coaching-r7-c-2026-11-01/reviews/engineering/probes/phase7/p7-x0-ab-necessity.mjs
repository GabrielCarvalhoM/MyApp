// P7-X0: the Founder's A/B demonstration (is new metadata necessary?). GEN, weeks 0..6 reviewed with strength only (RV). Week j's run sessions:
//  A: no run report at week j's review; the runs (every one at 60 % of its minutes) arrive on day 2 of week 7 through a clinical substitution
//     with pain, then qualified clearance;
//  B: the same run reports (the very same observation objects, same event ids) delivered on time with week j's review; on day 2 of week 7 the
//     same clinical substitution with no observations, then clearance.
// Compared just before the day-3 decision of week 7: the durable record a rule could read (the program with its decision log, minus the decisions'
// free-text `reasons[].why`, and the completed-work record minus provenance.firstRecordedAt), and the reference state; then the day-3 decision.
// Also the direct path for A (the late runs as a plain review on day 2). Read-only; prints JSON.
import {RUNTIMES,client,live,programs,strengthOf,runSessions,short,csub,AT,brief,runsFromDay,planFrom,strip,startsOf} from './p7-lib.mjs';
const out={probe:'P7-X0 A/B necessity',runtimes:Object.keys(RUNTIMES),cases:[]};
const noWhy=p=>({...p,hash:null,revision:p.revision,decisions:p.decisions.map(d=>({...d,reasons:Array.isArray(d.reasons)?d.reasons.map(r=>{const {why,...rest}=r;return rest;}):d.reasons}))});
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,{GEN}=programs(H),{hash}=R;
 for(const j of [2,3]){
  const base=H.program(GEN),cache=new Map(),S=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>{if(!cache.has(s.id))cache.set(s.id,H.obs(p,s));return cache.get(s.id);});
  const runsJ=runSessions(base,j,j+1).map(s=>short(H,base,s,0.6));
  const build=onTime=>{const t=client(R,base);const log=[];
   for(let w=0;w<7;w++){const r=t.step(w,{observations:[...S(t.p,w),...(onTime&&w===j?runsJ:[])]});log.push({w,...brief(r),gates:r.gates?Object.fromEntries(Object.entries(r.gates).filter(([k])=>['EASY','LONG','QUALITY'].includes(k))):null});}
   const c=csub(t,7,onTime?[]:runsJ);log.push({w:7,carrier:c.status});return {t,log};};
  const A=build(false),Bb=build(true);
  const sameProgram=hash(noWhy(A.t.p))===hash(noWhy(Bb.t.p)),sameLedger=hash(strip(A.t.ledger))===hash(strip(Bb.t.ledger)),sameWithStamps=hash(A.t.ledger)===hash(Bb.t.ledger),sameRef=hash(A.t.ref??null)===hash(Bb.t.ref??null);
  const whyA=A.t.p.decisions.filter(d=>(d.reasons??[]).length).map(d=>d.reasons.map(r=>r.key+':'+r.gate+':'+String(r.why).slice(0,60))),whyB=Bb.t.p.decisions.filter(d=>(d.reasons??[]).length).map(d=>d.reasons.map(r=>r.key+':'+r.gate+':'+String(r.why).slice(0,60)));
  const diffWhy=whyA.flatMap((x,i)=>x.filter((y,k)=>y!==whyB[i]?.[k]).map((y,k)=>({A:y,B:whyB[i]?.[x.indexOf(y)]})));
  const stamps=t=>t.ledger.filter(o=>runsJ.some(r=>r.eventId===o.eventId)).map(o=>o.provenance?.firstRecordedAt??null);
  const dA=A.t.copy(),rA=dA.step(7,AT(3)),dB=Bb.t.copy(),rB=dB.step(7,AT(3));
  const D=client(R,base);for(let w=0;w<7;w++)D.step(w,{observations:S(D.p,w)});D.step(7,{...AT(2),observations:runsJ});const rD=D.step(7,AT(3));
  out.cases.push({runtime:name,j,closing:startsOf(A.t.p)[j+1],logA:A.log,logB:Bb.log,durable:{sameProgramExceptWhyText:sameProgram,sameLedgerExceptFirstRecordedAt:sameLedger,sameLedgerWithStamps:sameWithStamps,sameReferenceState:sameRef,whyTextDiffers:diffWhy.slice(0,4)},stamps:{A:stamps(A.t),B:stamps(Bb.t)},
   day3:{A:{...brief(rA),runs:runsFromDay(dA.p,7,3,2)},B:{...brief(rB),runs:runsFromDay(dB.p,7,3,2)},directA:{...brief(rD),runs:runsFromDay(D.p,7,3,2)},AequalsDirect:JSON.stringify(planFrom(R,dA.p,7,3))===JSON.stringify(planFrom(R,D.p,7,3)),BkeepsStored:JSON.stringify(planFrom(R,dB.p,7,3))===JSON.stringify(planFrom(R,Bb.t.p,7,3))}});
 }
}
console.log(JSON.stringify(out,null,1));
