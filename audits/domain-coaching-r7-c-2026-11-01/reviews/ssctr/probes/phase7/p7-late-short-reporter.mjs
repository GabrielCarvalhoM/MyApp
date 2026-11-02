// SSCTR Phase 7 addendum, probe P7-LR (QE-R7C-16): the habitual late reporter with runs done short, rebuilt independently of the Engineering
// probe. GEN and R10K; every session executed; strength reported on its day at 21:00; each week reviewed on day 6 21:00; the week's runs reported
// on day 1 07:00 of the next week; runs at 60 % or 80 % of their minutes. On R7C-FREEZE-4 (HEAD) and R7C-FREEZE-3 (F3), for every decision whose
// reason is the recorded-answer re-plan: the run sessions of later weeks whose dose rose in the same role, the single-run ceiling the record allows
// at that decision (the longest completed run in the 30 days before the current week's start, plus the policy step, from the ledger), what F3 holds
// at the same moment, and what the week's own review then plans for the same session; plus whether any run of the current week or of an executed
// week differs between the runtimes. Read-only; prints JSON.
import {runtimes,kit,GEN,R10K,FREEZE_3} from './p7-lib.mjs';
const {rt,cleanup}=await runtimes([['F3',FREEZE_3]]);
const RECORDED=/whichever decision recorded them/;
const out={check:'SSCTR-P7-LATE-SHORT-REPORTER',cases:[],summary:{recorded:0,raises:0,aboveReview:0,aboveRecordCeiling:0,raisesInCurrentWeek:0,executedDiffer:0,maxRaise:0}};
for(const F of [0.6,0.8])for(const [name,mk] of [['GEN',GEN],['R10K',R10K]]){
 const T={};for(const [k,R] of Object.entries(rt)){const K=kit(R);T[k]={K,H:K.H,t:{p:K.H.program(mk(K.H)),ledger:[],ref:null},late:[]};}
 const rep=(X,s)=>s.sport==='RUN'?X.H.obs(X.t.p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*F))}):X.H.obs(X.t.p,s);
 const pending=[],executed={HEAD:[],F3:[]};
 const W=T.HEAD.t.p.weeks.length;
 for(let w=0;w<W;w++){
  const step=(x,label)=>{
   const A=T.HEAD,before=A.t.p,r=A.K.step(A.t,w,x(A));T.F3.K.step(T.F3.t,w,x(T.F3));
   if(!RECORDED.test(r.reason??''))return;out.summary.recorded++;
   const C=A.K.C,start=A.t.p.weeks[w].startDate,gap=d=>(Date.parse(start)-Date.parse(d))/864e5;
   const done=A.t.ledger.filter(o=>o.context?.sport==='RUN'&&!o.conflicted&&o.actual?.completed===true&&gap(o.localDate)>0&&gap(o.localDate)<=C.windowDays).map(o=>o.actual.minutes);
   const ceil=done.length?Math.max(...done)+C.stepMinutes:A.K.ENTRY;
   const old=new Map(before.weeks.flatMap(k=>k.sessions).map(s=>[s.id,s])),f3=new Map(T.F3.t.p.weeks.flatMap(k=>k.sessions).map(s=>[s.id,s]));
   const raises=A.t.p.weeks.flatMap((k,i)=>k.sessions.map(s=>({s,i}))).filter(({s})=>{const o=old.get(s.id);return o&&s.sport==='RUN'&&o.role===s.role&&o.prescription&&s.prescription&&s.prescription.durationMinutes>o.prescription.durationMinutes;})
    .map(({s,i})=>({id:s.id,week:i,role:s.role,from:old.get(s.id).prescription.durationMinutes,to:s.prescription.durationMinutes,F3now:f3.get(s.id)?.prescription?.durationMinutes??null,recordCeiling:ceil}));
   const c={F,prog:name,label,validity:r.planValidity?.status??null,raises};out.cases.push(c);pending.push(c);
  };
  for(let d=0;d<6;d++){
   if(d===1&&T.HEAD.late.length){const L={HEAD:T.HEAD.late,F3:T.F3.late};step(X=>({day:1,hour:'07:00:00',observations:L[X===T.HEAD?'HEAD':'F3']}),`w${w} d1 late runs of w${w-1}`);T.HEAD.late=[];T.F3.late=[];}
   for(const X of Object.values(T))X.late.push(...X.t.p.weeks[w].sessions.filter(s=>X.H.live(s)&&s.day===d&&s.sport==='RUN').map(s=>rep(X,s)));
   if(T.HEAD.t.p.weeks[w].sessions.some(s=>T.HEAD.H.live(s)&&s.day===d&&s.sport!=='RUN'))step(X=>({day:d,hour:'21:00:00',observations:X.t.p.weeks[w].sessions.filter(s=>X.H.live(s)&&s.day===d&&s.sport!=='RUN').map(s=>rep(X,s))}),`w${w} d${d}`);
  }
  for(const X of Object.values(T))X.late.push(...X.t.p.weeks[w].sessions.filter(s=>X.H.live(s)&&s.day===6&&s.sport==='RUN').map(s=>rep(X,s)));
  for(const [k,X] of Object.entries(T))executed[k].push(X.t.p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&X.H.live(s)).map(s=>`${s.role}:${s.prescription.durationMinutes}`).join(' '));
  step(X=>({day:6,hour:'21:00:00',observations:X.t.p.weeks[w].sessions.filter(s=>X.H.live(s)&&s.day===6&&s.sport!=='RUN').map(s=>rep(X,s))}),`w${w} review`);
  for(const c of pending)for(const u of c.raises){const x=T.HEAD.t.p.weeks.flatMap(k=>k.sessions).find(y=>y.id===u.id);u.afterWeekReview=x?.prescription?.durationMinutes??null;}
  pending.length=0;
 }
 const diff=executed.HEAD.map((x,i)=>x!==executed.F3[i]?i:null).filter(i=>i!=null);if(diff.length)out.summary.executedDiffer++;
 out.cases.push({F,prog:name,executedWeeksDifferingFromF3:diff,executedHEAD:executed.HEAD});
}
for(const c of out.cases)for(const u of c.raises??[]){out.summary.raises++;const wk=+c.label.match(/^w(\d+)/)[1];if(u.week<=wk)out.summary.raisesInCurrentWeek++;if(u.afterWeekReview!=null&&u.to>u.afterWeekReview)out.summary.aboveReview++;if(u.to>u.recordCeiling)out.summary.aboveRecordCeiling++;out.summary.maxRaise=Math.max(out.summary.maxRaise,u.to-u.from);}
cleanup();
console.log(JSON.stringify(out,null,1));
