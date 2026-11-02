// P7-X1: same-clock decisions. The runtime accepts a decision at the same clock as the previous one (previousValidity rejects only an earlier
// clock). GEN or R10K, weeks 0..j reviewed with strength only (RV, each review closes its week: WEEK_EVIDENCE at day 6, 21:00). Then, still in
// week j, the answer (every run of weeks 0..j: V) arrives through a clinical substitution with pain, cleared:
//  SAME  at exactly the closing review's clock (21:00:00);
//  LATER one second later (21:00:01);
// and the references DIRECT: the same reports as a plain review at the same clock (21:00:00), a review that re-gates week j; DIRECT-NEXT: the same
// reports as a plain review on day 0 of week j+1 (07:00), a decision that does not gate week j (R7-A Property B: late facts alone wait for a review). Next decisions: a plain review on day 0 and day 3 of
// week j+1 (07:00), then week j+1's review (day 6, 21:00, its sessions as prescribed). Compared: status, validity, origin and the run doses ahead.
// Read-only; prints JSON.
import {RUNTIMES,client,live,programs,strengthOf,runSessions,answer,csub,AT,brief,runsFromDay,planFrom} from './p7-lib.mjs';
const out={probe:'P7-X1 same-clock decisions',runtimes:Object.keys(RUNTIMES),cells:[],summary:{}};
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H,P=programs(H),sum={cells:0,sameDiffersFromDirect:0,laterDiffersFromDirect:0,sameStaleValidAboveDirect:0};
 for(const [prog,o] of [['GEN',P.GEN],['R10K',P.R10K]])for(const j of [2,3])for(const V of ['ADVERSE','SHORT60','EXEC','MISS']){
  const t0=client(R,H.program(o));for(let w=0;w<=j;w++)t0.step(w,{observations:strengthOf(H,t0.p,w)});
  const facts=runSessions(t0.p,0,j+1).flatMap((s,i)=>answer(H,t0.p,s,i,V));
  const follow=t=>{const steps=[];for(const [label,w,x] of [['w+1 d0',j+1,AT(0)],['w+1 d3',j+1,AT(3)],['w+1 review',j+1,{day:6,hour:'21:00:00',observations:t.p.weeks[j+1].sessions.filter(live).map(s=>H.obs(t.p,s))}]]){const r=t.step(w,x);steps.push({label,...brief(r),runs:runsFromDay(t.p,j+1,label==='w+1 review'?0:Number(label.slice(-1)),2)});}return steps;};
  const same=t0.copy(),cs=csub(same,j,facts,{day:6,hour:'21:00:00'});
  const later=t0.copy(),cl=csub(later,j,facts,{day:6,hour:'21:00:01'});
  const direct=t0.copy(),cd=direct.step(j,{day:6,hour:'21:00:00',observations:facts});
  const S=follow(same),L=follow(later),D=follow(direct);
  const dn=t0.copy();const DN=[];{const r0=dn.step(j+1,{...AT(0),observations:facts});DN.push({label:'w+1 d0',...brief(r0),runs:runsFromDay(dn.p,j+1,0,2)});const r3=dn.step(j+1,AT(3));DN.push({label:'w+1 d3',...brief(r3),runs:runsFromDay(dn.p,j+1,3,2)});const rr=dn.step(j+1,{day:6,hour:'21:00:00',observations:dn.p.weeks[j+1].sessions.filter(live).map(s=>H.obs(dn.p,s))});DN.push({label:'w+1 review',...brief(rr),runs:runsFromDay(dn.p,j+1,0,2)});}
  const laterEqNext=L.map((x,i)=>x.runs===DN[i].runs&&x.validity===DN[i].validity).every(Boolean);sum.laterEqualsDirectNext=(sum.laterEqualsDirectNext??0)+(laterEqNext?1:0);
  const eq=(a,b)=>a.map((x,i)=>x.runs===b[i].runs&&x.validity===b[i].validity).every(Boolean);
  const sameEq=eq(S,D),laterEq=eq(L,D);sum.cells++;if(!sameEq)sum.sameDiffersFromDirect++;if(!laterEq)sum.laterDiffersFromDirect++;
  const mins=s=>String(s).split('/').map(x=>Number(x.split(':')[1])||0).reduce((a,b)=>a+b,0);
  if(!sameEq&&S[0].validity==='VALID'&&mins(S[0].runs)>mins(D[0].runs))sum.sameStaleValidAboveDirect++;
  out.cells.push({runtime:name,cell:`${prog} j=${j} ${V}`,carrier:{same:cs.status,later:cl.status,direct:cd.status+'/'+(cd.action)},sameEqualsDirect:sameEq,laterEqualsDirect:laterEq,laterEqualsDirectNext:laterEqNext,same:S,later:L,direct:D,directNext:DN});
 }
 out.summary[name]=sum;
}
console.log(JSON.stringify(out,null,1));
