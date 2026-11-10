// Minimal form of the chained-report D49 residual: known 6x8; an R2 window executed at 1 set; a second report replaces it; the return's first week.
import {load,kit} from './h.mjs';
for(const name of process.argv.slice(2)){
 const M=await load(name),K=kit(M);const {timeline,reviewWeeks,doneWeek,NO,KNOWN,HYBRID,live,ladder}=K;const {F}=M;
 const bench=(t,k)=>t.p.weeks[k].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).map(s=>s.prescription.exercises.find(e=>e.id==='db-bench-press')?.sets??'-').join('/')||'-';
 const allNo=()=>({warningSigns:Object.fromEntries(Object.values(F.WARNING_SIGNS).map(k=>[k,false])),exerciseResponse:Object.fromEntries(Object.values(F.EXERCISE_SIGNS).map(k=>[k,false]))});
 const out=[];
 for(const [c2,i2,d2] of [['NEED_REST','REDUCE_LIGHT',2],['NEED_REST','REST',2],['UNUSUAL_FATIGUE','REDUCE_LIGHT',3]])for(const sp of ['FASTER','BALANCED']){
  const t=timeline(KNOWN(6,HYBRID()));reviewWeeks(t,0,1);
  t.step(1,0,'NOT_FEELING_100',{wellbeing:{condition:'MILD_ILLNESS',warningSigns:NO('MILD_ILLNESS'),intent:'REDUCE_SUBSTANTIAL',days:10,returnSpeed:'BALANCED'}},'07:00');
  t.step(1,6,'WEEKLY_REVIEW',{observations:doneWeek(t,1),check:allNo()},'20:00');
  t.step(2,2,'NOT_FEELING_100',{wellbeing:{condition:c2,warningSigns:NO(c2),intent:i2,days:d2,returnSpeed:sp},observations:doneWeek(t,2).filter(o=>t.p.weeks[2].sessions.some(s=>s.id===o.sessionId&&s.date<t.day(2,2)))},'07:00');
  let r=t.step(2,6,'WEEKLY_REVIEW',{observations:[],check:{...allNo(),improved:{MILD_ILLNESS:true,[c2]:true}}},'20:00');
  if(r.status==='ASK'&&(r.missingInputs??[]).some(k=>k.startsWith('wellbeingCheck.improved.'))){const imp={};for(const k of r.missingInputs.filter(k=>k.startsWith('wellbeingCheck.improved.')))imp[k.slice(24)]=true;r=t.step(2,6,'WEEKLY_REVIEW',{observations:[],check:{...allNo(),improved:imp}},'20:30');}
  out.push(`${c2} ${i2} ${d2}d ${sp}: ${r.status}/${r.action} | bench w1 ${bench(t,1)} w2 ${bench(t,2)} w3 ${bench(t,3)} w4 ${bench(t,4)} | rungs w3 ${JSON.stringify(ladder(t.p,3))} | ${String(r.reason).slice(0,80)}`);
 }
 console.log('== '+name.slice(-8));console.log(out.join('\n'));
}
