// P6-X4: the second branch of unreadRunWeeks outside the answer class. A habitual late reporter: each week's strength is reported on its day and
// the week is reviewed on day 6 (21:00), but the week's runs reach the record only on day 1 of the next week (07:00), after that review. Every
// review therefore records its run gates with no executed run; the record later shows them executed. Paths, from the same intake:
//  LATE     as above, on F2 and on F3;
//  TIMELY   the same sessions reported on their own day and the same reviews (the reference: the facts known on time), on F3;
//  LATE_SAT only Saturday's (day 6) runs are late, so each review reads the week's other runs (Property B scope), on F2 and F3.
// Recorded per week: the run plan the week holds just before its review (what the athlete was prescribed and reported), and every decision's
// status, validity and origin. Compared: per week, LATE F3 against LATE F2 and against TIMELY F3 (more run minutes than the facts known on time
// would be a raise beyond the facts). Read-only; prints JSON.
import {RUNTIMES,client,live,addDays,brief,runsOfWeek} from './p6-lib.mjs';
const out={probe:'P6-X4 habitual late reporter',runtimes:Object.keys(RUNTIMES),paths:{},comparison:{}};
const minutes=s=>String(s??'').split('/').filter(Boolean).reduce((a,x)=>a+Number(x.split(':')[1]),0);
for(const [name,R] of Object.entries(RUNTIMES)){
 const H=R.H;
 const PROGS={
  GEN:{id:'p6x4-gen',weeks:12,goals:{run:'PERFORMANCE',strength:'GENERAL'},equipment:H.FULL,knownExercises:[H.K('back-squat',3,5,82.5)]},
  R10K:{id:'p6x4-10k',weeks:12,goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},schedule:{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6,runMinutes:60,longRunMinutes:100}}
 };
 for(const [prog,o] of Object.entries(PROGS))for(const mode of ['LATE','TIMELY','LATE_SAT']){
  if(mode==='TIMELY'&&!name.startsWith('F3'))continue;
  const t=client(R,H.program(o)),N=t.p.weeks.length,log=[],executed=[];let late=[];
  const decide=(w,x,label)=>{const r=t.step(w,x);log.push({label,...brief(r),question:r.question?.kind??null,runs:`${runsOfWeek(t.p,w)} | ${runsOfWeek(t.p,w+1)??'-'}`});return r;};
  for(let w=0;w<N;w++){
   const isLate=s=>s.sport==='RUN'&&(mode==='LATE'||mode==='LATE_SAT'&&s.day===6);
   for(let d=0;d<6;d++){
    // Last week's late runs reach the record on day 1 at 07:00: after day 0's report (21:00), before day 1's, so every clock moves forward.
    if(d===1&&late.length){decide(w,{day:1,hour:'07:00:00',observations:late},`w${w} d1 07:00 late runs of w${w-1}`);late=[];}
    const ss=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===d);if(!ss.length)continue;
    const now=ss.filter(s=>!isLate(s)),held=ss.filter(isLate);
    late.push(...held.map(s=>H.obs(t.p,s)));
    if(now.length)decide(w,{day:d,hour:'21:00:00',observations:now.map(s=>H.obs(t.p,s))},`w${w} d${d}`);
   }
   const sat=t.p.weeks[w].sessions.filter(s=>live(s)&&s.day===6);
   late.push(...sat.filter(isLate).map(s=>H.obs(t.p,s)));
   executed.push(runsOfWeek(t.p,w));
   decide(w,{day:6,hour:'21:00:00',observations:sat.filter(s=>!isLate(s)).map(s=>H.obs(t.p,s))},`w${w} review`);
  }
  out.paths[`${name} ${prog} ${mode}`]={executed,minutes:executed.map(minutes),recorded:log.filter(x=>x.origin==='RECORDED').map(x=>x.label),notValid:log.filter(x=>x.validity!=='VALID').map(x=>`${x.label} ${x.status} ${x.question??''}`),log};
 }
}
for(const prog of ['GEN','R10K']){
 const get=k=>out.paths[k]?.minutes??[];
 const f2=get(`F2 ${prog} LATE`),f3=get(`F3 ${prog} LATE`),tm=get(`F3 ${prog} TIMELY`),s2=get(`F2 ${prog} LATE_SAT`),s3=get(`F3 ${prog} LATE_SAT`);
 out.comparison[prog]={LATE_F2:f2,LATE_F3:f3,TIMELY_F3:tm,LATE_SAT_F2:s2,LATE_SAT_F3:s3,
  weeksF3aboveTimely:f3.map((m,i)=>m>tm[i]?i:null).filter(x=>x!==null),weeksF3aboveF2:f3.map((m,i)=>m>f2[i]?i:null).filter(x=>x!==null),
  LATE_SAT_identical:JSON.stringify(out.paths[`F2 ${prog} LATE_SAT`]?.executed)===JSON.stringify(out.paths[`F3 ${prog} LATE_SAT`]?.executed)};
}
console.log(JSON.stringify(out,null,1));
