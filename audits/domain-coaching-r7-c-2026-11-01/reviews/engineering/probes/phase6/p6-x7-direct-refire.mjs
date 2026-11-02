// P6-X7: the recorded-answer re-plan on the DIRECT path. The answer to UNREPORTED_TRAINING is delivered as a plain review (day 1 or 2, 07:00),
// so the transition path applies it at once; then the athlete reports nothing more of the answer week: plain reviews every later day (07:00) and
// the week's review (day 6, 21:00). On F3 the recorded-answer re-plan can fire again at those later decisions (the window is still unanchored
// and more of the answer week's runs elapse with no report: C9). Compared with F2 decision by decision: status, validity, origin and the run
// doses of the answer week (from the decision's day) and of the next week. For every F3 re-plan that F2 does not make, reported: whether it
// raises any run dose of the next week above (a) the plan before it and (b) the next week the week's review then plans on F3.
// Programs GEN (b 7, 9), R10K (b 8, 10); gap from week 0 or 2; RV or NR; answers MISS, EXEC, MIXED, ADVERSE, LONGONE, SHORT, EASYONLY.
// Read-only; prints JSON.
import {RUNTIMES,client,live,addDays,notDone,BAD,brief,runsOfWeek,runsFromDay} from './p6-lib.mjs';
const out={probe:'P6-X7 the recorded-answer re-plan after a direct answer',runtimes:Object.keys(RUNTIMES),cells:0,differingCells:0,extraReplans:0,raisesNextWeek:[],raisesAboveReview:[],validDiffering:0};
const names=Object.keys(RUNTIMES),F2=RUNTIMES[names.find(n=>n.startsWith('F2'))],F3=RUNTIMES[names.find(n=>n.startsWith('F3'))];
const mins=s=>String(s??'').split('/').filter(Boolean).map(x=>({role:x.split(':')[0],m:Number(x.split(':')[1])}));
function trajectory(R,o,{g,b,mode,V,d}){
 const H=R.H,strengthOf=(p,w)=>p.weeks[w].sessions.filter(s=>live(s)&&s.sport==='STRENGTH').map(s=>H.obs(p,s));
 const t=client(R,H.program(o));
 for(let w=0;w<g;w++)t.step(w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>H.obs(t.p,s))});
 if(mode==='RV')for(let w=g;w<b-1;w++)t.step(w,{observations:strengthOf(t.p,w)});
 const q=t.step(b-1,{observations:[...(mode==='NR'?Array.from({length:Math.max(0,b-1-g)},(_,i)=>g+i).flatMap(w=>strengthOf(t.p,w)):[]),...strengthOf(t.p,b-1)]});
 if(q.question?.kind!=='UNREPORTED_TRAINING')return null;
 const runs=t.p.weeks.slice(g,b).flatMap(x=>x.sessions.filter(s=>live(s)&&s.sport==='RUN')),start=t.p.weeks[b].startDate,oldest=runs.filter(s=>s.role==='LONG'&&addDays(s.date,30)>=start).sort((x,y)=>x.date<y.date?-1:1)[0];
 const facts=runs.map(s=>{switch(V){case 'MISS':return notDone(t.p,s);case 'EXEC':return H.obs(t.p,s);case 'MIXED':return s.role==='LONG'?H.obs(t.p,s):notDone(t.p,s);case 'ADVERSE':return H.obs(t.p,s,s.role==='LONG'?{response:BAD}:{});case 'LONGONE':return s.id===oldest?.id?H.obs(t.p,s):notDone(t.p,s);case 'SHORT':return H.obs(t.p,s,{minutes:Math.max(10,Math.round(s.prescription.durationMinutes*0.6))});case 'EASYONLY':return s.role==='LONG'?notDone(t.p,s):H.obs(t.p,s);}});
 const steps=[],rec=(label,day,r,before)=>steps.push({label,...brief(r),wb:runsFromDay(t.p,b,day),wb1:runsOfWeek(t.p,b+1),beforeWb1:runsOfWeek(before,b+1)});
 let before=t.p;rec(`d${d} answer`,d,t.step(b,{day:d,hour:'07:00:00',observations:facts}),before);
 for(let day=d+1;day<=5;day++){before=t.p;rec(`d${day} plain`,day,t.step(b,{day,hour:'07:00:00'}),before);}
 before=t.p;rec('d6 review',6,t.step(b,{day:6,hour:'21:00:00'}),before);
 return steps;
}
for(const [prog,o,b] of [['GEN',null,7],['GEN',null,9],['R10K',null,8],['R10K',null,10]])for(const g of [0,2])for(const mode of ['RV','NR'])for(const V of ['MISS','EXEC','MIXED','ADVERSE','LONGONE','SHORT','EASYONLY'])for(const d of [1,2]){
 const progOf=H=>prog==='GEN'?{id:'p6x7-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]}:{id:'p6x7-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}};
 const A=trajectory(F2,progOf(F2.H),{g,b,mode,V,d}),B=trajectory(F3,progOf(F3.H),{g,b,mode,V,d});
 if(!A||!B)continue;out.cells++;
 const label=`${prog} b=${b} g=${g} ${mode} ${V} d=${d}`,review=B.at(-1).wb1;let differs=false;
 for(let i=0;i<B.length;i++){
  const a=A[i],x=B[i];
  if(a.validity!==x.validity||a.wb!==x.wb||a.wb1!==x.wb1||a.question!==x.question){differs=true;if(x.validity==='VALID'&&a.validity==='VALID')out.validDiffering++;}
  if(x.origin==='RECORDED'&&a.origin!=='RECORDED'&&i<B.length-1){
   out.extraReplans++;
   const nb=mins(x.wb1),pb=mins(x.beforeWb1),rv=mins(review);
   const up=nb.filter((s,k)=>pb[k]&&s.role===pb[k].role&&s.m>pb[k].m).map((s,k)=>`${s.role} ${pb[nb.indexOf(s)].m}->${s.m}`);
   const aboveReview=nb.filter((s,k)=>rv[k]&&s.role===rv[k].role&&s.m>rv[k].m).map(s=>`${s.role} ${s.m} > review ${rv[nb.indexOf(s)].m}`);
   if(up.length)out.raisesNextWeek.push({label,step:x.label,validity:x.validity,before:x.beforeWb1,after:x.wb1,F2:a.wb1,review});
   if(aboveReview.length)out.raisesAboveReview.push({label,step:x.label,validity:x.validity,after:x.wb1,review,F2:a.wb1});
  }
 }
 if(differs)out.differingCells++;
}
out.raisesNextWeekCount=out.raisesNextWeek.length;out.raisesAboveReviewCount=out.raisesAboveReview.length;
console.log(JSON.stringify(out,null,1));
