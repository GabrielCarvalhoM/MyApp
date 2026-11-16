// SSCTR-RFC review r1, probe 04: (1) SSCTR-RWS-A-04 / L-14: native distance work steps of harder domains whose planning weight passes the 300 s
// check while the bout at the band's fast edge is shorter than 5 min; (2) the in-week answer of a declared 14-day break (forecast and insights).
const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/CoachingCore/';
const H=await import('file:///'+ROOT+'test/v1rfc-helpers.mjs');
const {P,DEV,timeline,racePlan,runner,result,report,asPrescribed,addDays,START,live,flatSteps}=H;
const weekWith=(t,w,how=s=>asPrescribed(t,s),extra={})=>t.step(w,6,'WEEKLY_REVIEW',{...extra,observations:t.p.weeks[w].sessions.filter(live).map(s=>{const o=s.sport==='RUN'?how(s):{};return o?.eventId?o:report(t.p,s,o??{});})});
// (1) scan
const intakes=[
 racePlan({id:'b-10k'}),racePlan({id:'b-5k',event:'5K',weeks:12,anchors:[result('5K',1500,'2026-12-25')]}),racePlan({id:'b-half',event:'HALF_MARATHON'}),
 runner({id:'b-thr',asOf:'2027-01-02',start:START,weeks:16,runExperience:'EXPERIENCED',goal:'PERFORMANCE',anchors:[result('10K',3000,'2027-01-01')],recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:75,longRunMinutes:130,longRunDay:6}}),
 runner({id:'b-fast',asOf:'2027-01-02',start:START,weeks:16,runExperience:'EXPERIENCED',goal:{kind:'RACE',event:{kind:'10K',date:addDays(START,16*7-1)}},anchors:[result('10K',2400,'2027-01-01')],recent:{runDaysPerWeek:5,runMinutesPerWeek:300,longestRunMinutes:100,strengthDaysPerWeek:1},schedule:{runDays:[0,1,3,4,6],strengthDays:[2],runMinutes:70,longRunMinutes:120,longRunDay:6}}),
];
const HARDER=['THRESHOLD','TEN_K_SPECIFIC','FIVE_K_SPECIFIC','HALF_MARATHON_SPECIFIC','MARATHON_SPECIFIC'];
let steps=0,pass=0,short=0;const ex=[];
for(const intake of intakes){
 const t=timeline(intake,{opts:DEV});
 for(let w=0;w<10&&w<t.p.weeks.length-1;w++){
  for(const s of t.p.weeks[w].sessions.filter(x=>x.sport==='RUN'&&HARDER.includes(x.prescription?.family))){
   const run=t.runs?.[s.id];if(!run||run.expression!=='NATIVE')continue;
   for(const x of flatSteps(run.blocks).filter(x=>x.kind==='WORK'&&x.target?.type==='DISTANCE')){
    steps++;const q=x.estimate?.seconds,weight=Math.round((q.low+q.high)/2),fast=x.intensity?.pace?.fastSecondsPerKm,atFast=fast?x.target.metres/1000*fast:q.low,atFaster=atFast/1.015;
    if(weight>=300){pass++;if(atFaster<300){short++;if(ex.length<6)ex.push({athlete:intake.athlete.id,week:w+1,family:s.prescription.family,planWorkMin:s.prescription.work?.workMinutes,metres:x.target.metres,band:[fast,x.intensity?.pace?.slowSecondsPerKm],weight,secondsAtFastEdge:Math.round(atFast),secondsWhenFASTER:Math.round(atFaster)});}}
   }
  }
  weekWith(t,w);
 }
}
console.log('(1) native WORK distance steps in harder families:',steps,'| weight >= 300 s:',pass,'| of those, a FASTER execution runs the bout in < 300 s:',short);
for(const e of ex)console.log('   ',JSON.stringify(e));
// (2) in-week answer of a declared 14-day break
{
 const t=timeline(racePlan({id:'b-br'}),{opts:DEV});for(let w=0;w<4;w++)weekWith(t,w);
 const from=t.day(4,0);
 const r=t.step(4,1,'WEEKLY_REVIEW',{interruption:{startDate:from,endDate:addDays(from,13),days:14,reasonCategory:'TRAVEL'}},'09:00');
 console.log('(2) declared 14-day break (from Monday, declared Tuesday): engine',r.status,'| forecast',r.runForecast.status,r.runForecast.display,JSON.stringify(r.runForecast.observedForecast?.forecastSeconds),'| insights',r.paceInsights.status,'| calibration',r.runCalibration?.status);
 const later=t.step(4,4,'WEEKLY_REVIEW',{},'09:00');
 console.log('    same week, Friday: engine',later.status,'| forecast',later.runForecast.status,'| insights',later.paceInsights.status);
 // a break declared retroactively in the past (weeks 5-6), seen from week 7
 const u=timeline(racePlan({id:'b-br2'}),{opts:DEV});for(let w=0;w<4;w++)weekWith(u,w);
 const r2=u.step(5,6,'WEEKLY_REVIEW',{interruption:{startDate:u.day(4,0),endDate:u.day(5,6),days:14,reasonCategory:'TRAVEL'}},'20:00');
 console.log('    retroactive 14-day break declared on Sunday of week 6: engine',r2.status,'| forecast',r2.runForecast.status,r2.runForecast.reason??'','| next Monday',u.look(6).runForecast.status,u.look(6).runForecast.reason??'');
}
