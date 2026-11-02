// P7-X5b: what the recorded re-plans of the shortened habitual late reporter (P7-X5, LATE, F = 0.6 and 0.8) change on F4: for each decision whose
// origin is RECORDED, the sessions whose prescription differs before and after (id, role, minutes or loads), the decision's validity, and the
// same decision's plan on F3 (same inputs, same clock); for each same-role run raise against the replaced plan, F3's dose at that moment and what
// the week's own review then plans for that session. Read-only; prints JSON.
import {RUNTIMES,client,live,programs,brief} from './p7-lib.mjs';
const out={probe:'P7-X5b recorded re-plans of the shortened late reporter',cases:[]};let pending=[];
const names=Object.keys(RUNTIMES),R4=RUNTIMES[names.at(-1)],R3=RUNTIMES[names[0]];
const desc=s=>s.sport==='RUN'?`${s.id} ${s.role}:${s.prescription.durationMinutes}`:`${s.id} ${(s.prescription.exercises??[]).map(e=>e.id+':'+(e.load?.value??e.load?.mode)+'x'+e.sets+'x'+e.reps).join(',')}`;
for(const F of [0.6,0.8])for(const prog of ['GEN','R10K']){
 const mk=R=>{const H=R.H,o=programs(H)[prog];return {H,t:client(R,H.program(o))};};
 const A=mk(R4),B=mk(R3);let late=[],lateB=[];
 const rep=(H,t,s)=>s.sport==='RUN'?H.obs(t.p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*F))}):H.obs(t.p,s);
 for(let w=0;w<A.t.p.weeks.length;w++){
  const step=(x,label)=>{const before=A.t.p,r=A.t.step(w,x(A.H,A.t,'A')),rb=B.t.step(w,x(B.H,B.t,'B'));
   if(brief(r).origin==='RECORDED'){const old=new Map(before.weeks.flatMap(k=>k.sessions).map(s=>[s.id,s]));const changed=A.t.p.weeks.flatMap(k=>k.sessions).filter(s=>{const o=old.get(s.id);return o&&JSON.stringify(o.prescription)!==JSON.stringify(s.prescription);}).map(s=>`${desc(old.get(s.id))} -> ${desc(s)}`);
    const ups=A.t.p.weeks.flatMap(k=>k.sessions).filter(x=>{const o=old.get(x.id);return o&&x.sport==='RUN'&&o.prescription&&x.prescription&&o.prescription.durationMinutes<x.prescription.durationMinutes&&o.role===x.role;}).map(x=>({id:x.id,role:x.role,from:old.get(x.id).prescription.durationMinutes,to:x.prescription.durationMinutes,F3now:B.t.p.weeks.flatMap(k=>k.sessions).find(y=>y.id===x.id)?.prescription?.durationMinutes??null}));
    const c={F,prog,label,F4:brief(r),F3:brief(rb),changed:changed.slice(0,8),changedCount:changed.length,raises:ups};out.cases.push(c);pending.push(c);}};
  for(let d=0;d<6;d++){
   if(d===1&&late.length){const L=late,LB=lateB;step((H,t,k)=>({day:1,hour:'07:00:00',observations:k==='A'?L:LB}),`w${w} d1 late runs of w${w-1}`);late=[];lateB=[];}
   const ss=A.t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===d);if(!ss.length)continue;
   late.push(...ss.filter(s=>s.sport==='RUN').map(s=>rep(A.H,A.t,s)));lateB.push(...B.t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===d&&s.sport==='RUN').map(s=>rep(B.H,B.t,s)));
   const now=k=>(k==='A'?A:B).t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===d&&s.sport!=='RUN');
   if(now('A').length)step((H,t,k)=>({day:d,hour:'21:00:00',observations:now(k).map(s=>rep(H,t,s))}),`w${w} d${d}`);
  }
  late.push(...A.t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&s.sport==='RUN').map(s=>rep(A.H,A.t,s)));lateB.push(...B.t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&s.sport==='RUN').map(s=>rep(B.H,B.t,s)));
  step((H,t,k)=>({day:6,hour:'21:00:00',observations:(k==='A'?A:B).t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6&&s.sport!=='RUN').map(s=>rep(H,t,s))}),`w${w} review`);
  for(const c of pending)for(const u of c.raises){const x=A.t.p.weeks.flatMap(k=>k.sessions).find(y=>y.id===u.id);u.afterWeekReview=x?.prescription?.durationMinutes??null;}pending=[];
 }
}
console.log(JSON.stringify(out,null,1));
