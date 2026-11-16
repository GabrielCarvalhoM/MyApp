// SSCTR-RFC review r1, probe 01: every worked example of SSCTR-RFC-DECISION-r2 (and PI-1 of r1) through the candidate's pure functions,
// with inputs built here from the example descriptions (not from the candidate's test helpers). Expected values are read from the decision.
import fs from 'node:fs';
const ROOT='C:/Users/carva/Desktop/myApp/MyApp/.claude/worktrees/v1-run-extensions/';
const M=await import('file:///'+ROOT+'CoachingCore/src/v1-race-forecast.mjs');
const PI=await import('file:///'+ROOT+'CoachingCore/src/v1-pace-insights.mjs');
const C=await import('file:///'+ROOT+'CoachingCore/src/v1-run-calibration.mjs');
const RC=JSON.parse(fs.readFileSync(ROOT+'CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json','utf8'));
const V=JSON.parse(fs.readFileSync(ROOT+'CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json','utf8'));
const r2=JSON.parse(fs.readFileSync(ROOT+'audits/v1-race-forecast-2026-11-13/ssctr/SSCTR_RFC_DECISION_R2.json','utf8'));
const r1=JSON.parse(fs.readFileSync(ROOT+'audits/v1-race-forecast-2026-11-13/ssctr/SSCTR_RFC_DECISION.json','utf8'));
const FV=V.forecast,PV=V.paceInsights,W=r2.workedExamples;
let fails=0,checks=0;const ok=(cond,msg)=>{checks++;if(!cond){fails++;console.log('FAIL',msg);}};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const day=(s,n)=>new Date(Date.parse(s+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const START='2027-01-04';
const KM={'5K':5,'10K':10,HALF_MARATHON:21.0975,MARATHON:42.195};
// My own estimate builder from the V1RC rule as written in the V1RC values (same distance: the result itself; else the three exponents).
function est(km,sec,event,m,tier='HIGH'){const t=KM[event],K=event==='MARATHON'?RC.model.marathon:RC.model.standard;const same=Math.abs(t/km-1)<=RC.model.sameDistanceRatioWithin;
 const times=same?[sec]:[K.kLow,K.kCentral,K.kHigh].map(k=>sec*Math.pow(t/km,k));return {lower:Math.min(...times)*(1-m),central:same?sec:sec*Math.pow(t/km,K.kCentral),upper:Math.max(...times)*(1+m),tier};}
const t10=(km,s)=>s*Math.pow(10/km,1.07);
const R=(km,s,date,m)=>({date,t10:t10(km,s),sigma:m/1.2816});
function plan(total,counted,taper,a){const w=[];for(let i=0;i<total;i++)w.push({index:i,startDate:day(START,7*i),phase:i<counted?'BUILD':i<counted+taper?'TAPER':i===total-1?'RACE_WEEK':'TAPER',zeroCredit:false,planned:true,a:i<a.length?a[i]:null});return w;}
const rep=(n,x)=>Array(n).fill(x);
const base=(event,exp,e,weeks,n,rw,ref,extra={})=>({event,experience:exp,unitSeconds:RC.estimates.roundOutwardSeconds[event],estimate:e,weeks,completedWeeks:n,raceWeekIndex:rw,reference:ref,pairA:null,previous:null,q8Down:false,...extra});
const IN={
 a:()=>base('10K','INTERMEDIATE',est(10,3000,'10K',0.025),plan(16,14,1,rep(4,0.95)),4,15,R(10,3000,'2027-01-01',0.025)),
 b:()=>base('10K','INTERMEDIATE',est(10,3000,'10K',0.025),plan(16,14,1,rep(4,0.6)),4,15,R(10,3000,'2027-01-01',0.025)),
 c:()=>base('10K','NOVICE',est(5,1740,'10K',0.035),plan(14,12,1,rep(6,0.9)),6,13,R(5,1740,'2027-02-14',0.035),{pairA:R(5,1800,'2027-01-02',0.035)}),
 d:()=>base('HALF_MARATHON','INTERMEDIATE',est(10,3060,'HALF_MARATHON',0.025),plan(16,14,1,rep(6,0.95)),6,15,R(10,3060,'2027-02-14',0.025),{pairA:R(10,3000,'2027-01-01',0.025)}),
 d2:()=>base('HALF_MARATHON','INTERMEDIATE',est(10,3120,'HALF_MARATHON',0.025),plan(16,14,1,rep(6,0.95)),6,15,R(10,3120,'2027-02-14',0.025),{pairA:R(10,3000,'2027-01-01',0.025)}),
 e1:()=>base('MARATHON','INTERMEDIATE',est(21.0975,6600,'MARATHON',0.025),plan(16,13,2,rep(4,0.95)),4,15,R(21.0975,6600,'2026-12-20',0.025)),
 e2:()=>base('MARATHON','INTERMEDIATE',est(21.0975,9900,'MARATHON',0.035),plan(16,13,2,rep(4,0.95)),4,15,R(21.0975,9900,'2026-12-20',0.035)),
 f:()=>base('5K','INTERMEDIATE',est(5,1500,'5K',0.025),plan(10,8,1,[]),0,9,R(5,1500,'2026-12-25',0.025)),
 g:()=>base('10K','EXPERIENCED',est(10,2700,'10K',0.04,'MODERATE'),plan(16,14,1,rep(4,1)),4,15,R(10,2700,'2027-01-01',0.04)),
 h:()=>base('10K','INTERMEDIATE',est(5,1320,'10K',0.025),plan(16,14,1,rep(4,0.95)),4,15,R(5,1320,'2027-01-01',0.025)),
 'A1-1':()=>base('HALF_MARATHON','INTERMEDIATE',est(10,3060,'HALF_MARATHON',0.025),plan(16,14,1,rep(6,0.95)),6,15,R(10,3060,'2027-02-10',0.025),{pairA:R(10,3000,'2027-01-01',0.025)}),
 'A1-2':()=>base('10K','NOVICE',est(5,1740,'10K',0.035),plan(14,12,1,rep(6,0.9)),6,13,R(5,1740,'2027-02-14',0.035),{pairA:R(5,1800,'2027-01-06',0.035)}),
 'A2-1':()=>base('5K','INTERMEDIATE',est(5,1500,'5K',0.025),plan(10,8,1,[0.7]),1,9,R(5,1500,'2026-12-25',0.025)),
 'A2-2':()=>base('5K','INTERMEDIATE',est(5,1500,'5K',0.025),plan(10,8,1,[0.7,0.7]),2,9,R(5,1500,'2026-12-25',0.025)),
 'A2-3':()=>base('10K','INTERMEDIATE',est(10,3000,'10K',0.025),plan(16,14,1,[0.95,0.95,0.4,0.45]),4,15,R(10,3000,'2027-01-01',0.025)),
 'A4-1':()=>base('10K','INTERMEDIATE',est(10,3000,'10K',0.025),plan(16,14,1,rep(14,0.95)),14,15,R(10,3000,'2027-01-01',0.025)),
};
const confExpected=s=>s==='LOW'?'LOW':'MODERATE';
for(const ex of W.forecast){
 const make=IN[ex.id];if(!make)continue;
 const out=M.forecastOf(make(),FV),o=ex.output;
 const tag='['+ex.id+']';
 ok(eq(out.planScenario.forecastSeconds,o.planScenario.forecastSeconds),tag+' plan secs '+out.planScenario.forecastSeconds+' vs '+o.planScenario.forecastSeconds);
 ok(out.planScenario.status===o.planScenario.status,tag+' plan status');
 if(o.observedForecast.status==='UNAVAILABLE'){ok(out.observedForecast.status==='UNAVAILABLE'&&out.observedForecast.reason===o.observedForecast.reason,tag+' obs unavailable');}
 else{ok(eq(out.observedForecast.forecastSeconds,o.observedForecast.forecastSeconds),tag+' obs secs '+out.observedForecast.forecastSeconds+' vs '+o.observedForecast.forecastSeconds);ok(out.observedForecast.status===o.observedForecast.status,tag+' obs status');}
 ok(out.display===o.display,tag+' display '+out.display+' vs '+o.display);
 ok(eq(out.flags,o.common.flags),tag+' flags '+out.flags);
 ok(out.confidence===confExpected(o.confidence),tag+' confidence '+out.confidence+' vs '+o.confidence);
 if(o.status)ok(out.status===o.status,tag+' status '+out.status);
 // the slow edge is the current estimate upper, always
 ok(Math.abs(out.planScenario.unrounded.high-make().estimate.upper)<1e-9,tag+' slow edge = current upper');
 // decomposition: g = U + F; O never added
 ok(Math.abs(out.planScenario.g_applied-(out.common.U_unobserved+out.planScenario.F_future))<1e-12||out.flags.length>0,tag+' g = U + F');
 // intermediate checks against the decision's debug values
 ok(Math.abs(out.common.R_c-o.common.R_c)<1e-4&&Math.abs(out.common.R_hi-o.common.R_hi)<1e-4,tag+' R_c/R_hi '+out.common.R_c+' '+out.common.R_hi);
 ok(Math.abs(out.common.H_eff_reference-o.common.H_eff_reference)<1e-9&&Math.abs(out.common.H_eff_now-o.common.H_eff_now)<1e-9,tag+' H ref/now');
}
// A4-1..A4-3 race week
{
 const last=M.forecastOf(IN['A4-1'](),FV);
 const rw={asOfDay:'2027-04-19',raceDate:'2027-04-25',raceWeekStart:'2027-04-19',lastWeekStart:'2027-04-12',last,marathon:false,completion:false,withdrawal:null,now:{referenceId:'R',tier:'HIGH',q8Down:false},then:{referenceId:'R',tier:'HIGH',q8Down:false},changedSince:null};
 const s=M.raceWeekOf(rw,FV);
 ok(s.status==='SHOWN_FROZEN'&&s.frozenRange.lowSeconds===2820&&s.frozenRange.highSeconds===3075&&s.frozenRange.centralShown===false&&s.goalRelation==='NOT_SHOWN_IN_RACE_WEEK'&&s.pacingSource===false,'[A4-1] frozen '+JSON.stringify(s.frozenRange));
 ok(s.order.at(-1)==='FROZEN_FORECAST'&&s.order.indexOf('V1RC_PACING_CAUTION')<s.order.indexOf('FROZEN_FORECAST'),'[A4-1] after caution');
 ok(/47:00-51:15/.test(s.statement)&&!/49:00/.test(s.statement),'[A4-1] statement low-high only: '+s.statement);
 ok(s.through==='2027-04-24','[A4-1] through day before race '+s.through);
 ok(M.raceWeekOf({...rw,asOfDay:'2027-04-25'},FV).status==='NOT_SHOWN','[A4] never on race day');
 ok(M.raceWeekOf({...rw,asOfDay:'2027-04-24'},FV).status==='SHOWN_FROZEN','[A4] shown day before race');
 ok(M.raceWeekOf({...rw,now:{referenceId:'R2',tier:'HIGH',q8Down:false}},FV).reason==='REFERENCE_CHANGED_SINCE_FROZEN','[A4-2]');
 ok(M.raceWeekOf({...rw,now:{referenceId:'R',tier:'MODERATE',q8Down:false}},FV).status==='NOT_SHOWN','[A4] tier change');
 ok(M.raceWeekOf({...rw,now:{referenceId:'R',tier:'HIGH',q8Down:true}},FV).status==='NOT_SHOWN','[A4] q8 down since');
 ok(M.raceWeekOf({...rw,withdrawal:'HOLD'},FV).status==='NOT_SHOWN','[A4] withdrawal');
 ok(M.raceWeekOf({...rw,marathon:true},FV).status==='NOT_SHOWN','[A4] marathon');
 ok(M.raceWeekOf({...rw,completion:true},FV).status==='NOT_SHOWN','[A4] completion');
 const h15=M.forecastOf(base('10K','INTERMEDIATE',est(5,1320,'10K',0.025),plan(16,14,1,rep(14,0.95)),14,15,R(5,1320,'2027-01-01',0.025)),FV);
 ok(M.raceWeekOf({...rw,last:h15},FV).reason==='LAST_FORECAST_NOT_SHOWN','[A4-3] '+M.raceWeekOf({...rw,last:h15},FV).reason);
 // plan-scenario-only last week: not frozen
 const f15=M.forecastOf(base('5K','INTERMEDIATE',est(5,1500,'5K',0.025),plan(10,8,1,[0.7]),1,9,R(5,1500,'2026-12-25',0.025)),FV);
 ok(M.raceWeekOf({...rw,last:f15},FV).status==='NOT_SHOWN','[A4] plan scenario only never frozen');
 // g = 0 last week (slowdown): not frozen
 const d2=M.forecastOf(IN.d2(),FV);ok(M.raceWeekOf({...rw,last:d2},FV).reason==='LAST_FORECAST_HAD_NO_GAIN','[A4] g=0 not frozen');
}
// i: window
{
 const weeks=Array.from({length:26},(_,i)=>({startDate:day(START,7*i)}));
 const w=M.windowOf(START,'2027-06-27',weeks,FV);
 ok(w&&w.status==='NOT_YET_IN_WINDOW'&&w.availableFrom==='2027-03-08'&&w.reason==='174 days > 112','[i] '+JSON.stringify(w));
 ok(M.windowOf('2027-03-08','2027-06-27',weeks,FV)===null,'[i] week 10 inside (111 days)');
 ok(M.windowOf('2027-03-07','2027-06-27',weeks,FV)===null,'[i] exactly 112 days inside');
 ok(M.windowOf('2027-03-06','2027-06-27',weeks,FV)!==null,'[i] 113 days outside');
}
// Goal relation
for(const g of W.goalRelation){
 const mk=r=>{const [l,,h]=[r.low,r.central,r.high].map(x=>x.split(':').reduce((s,v)=>s*60+ +v,0));return {lowSeconds:l,highSeconds:h};};
 if(g.range)ok(M.goalRelationOf(g.goalSeconds,mk(g.range))===g.relation,'[goal '+g.id+']');
 if(g.observedForecast){ok(M.goalRelationOf(g.goalSeconds,mk(g.observedForecast.range))===g.observedForecast.relation,'[goal '+g.id+' obs]');ok(M.goalRelationOf(g.goalSeconds,mk(g.planScenario.range))===g.planScenario.relation,'[goal '+g.id+' plan]');}
}
// AD-1 adherence, my encoding
{
 const AD=W.adherence;
 for(const s of AD.sessions){const r=M.sessionCredit(s);ok(Math.abs(r.c-s.credit.c)<1e-4&&r.rule===s.credit.rule,'[AD-1 '+s.id+'] '+r.c+' '+r.rule+' vs '+s.credit.c+' '+s.credit.rule);}
 const wk=M.weekAdherence(AD.sessions.filter(s=>AD.week.sessions.includes(s.id)));
 ok(Math.abs(wk.a-AD.week.a)<1e-4&&Math.abs(M.fOf(wk.a,FV)-AD.week.f)<1e-4,'[AD-1 week] a '+wk.a);
 ok(wk.plannedMinutes===186&&Math.abs(wk.creditedMinutes-152)<1e-6,'[AD-1 week] minutes');
}
// PI-1 (r1): threshold, band 310-330 every week, Q8 factor +1.5% (room): EXPLAIN_ONLY
{
 const ex=r1.workedExamples.paceInsights[0];
 const execs=ex.executions.map((e,i)=>({eventId:'pi'+i,sessionId:'s'+i,date:e.date,recordedOn:e.date,secondsPerKm:e.pace,rpe:e.rpe,admitted:true,completed:true,comparable:true,compatible:true,longBouts:true,measurement:'TRACK',gpsGood:false,totalWorkMinutes:24}));
 const band={fastSecondsPerKm:310,slowSecondsPerKm:330};
 const i=PI.insightOf('THRESHOLD_CONTROLLED',execs,{weekStart:'2027-03-01',cutoff:'2027-03-01',bandAt:()=>band},PV,RC);
 ok(i.state==='IMPROVING','[PI-1] state '+i.state);
 ok(Math.abs(i.median-ex.median)<1e-4&&Math.abs(i.MAD-ex.MAD)<1e-4&&Math.abs(i.exceptionalThreshold-0.05)<1e-12,'[PI-1] median/MAD '+i.median+' '+i.MAD);
 ok(i.sessions.every(s=>!s.exceptional),'[PI-1] none exceptional under 5% floor');
 ok(eq(i.sessions.map(s=>s.class),ex.executions.map(e=>e.class)),'[PI-1] classes');
 const a=PI.actionOf(i,{q8:{applies:true,fraction:0.015,withdrawn:false},p3Offered:false},PV,RC);
 ok(a.action==='EXPLAIN_ONLY','[PI-1] action '+a.action);
}
// PR-2 / PR-3
{
 const mk=(n,pace,dom,longBouts)=>Array.from({length:n},(_,k)=>({eventId:dom+k,sessionId:'s'+k,date:day('2027-02-01',7*k),recordedOn:day('2027-02-01',7*k),secondsPerKm:pace,rpe:dom==='TEN_K_EFFORT'?8:7,admitted:true,completed:true,comparable:true,compatible:true,longBouts,measurement:'TRACK',gpsGood:false,totalWorkMinutes:20}));
 const band={fastSecondsPerKm:290,slowSecondsPerKm:300};
 const i2=PI.insightOf('TEN_K_EFFORT',mk(4,278,'TEN_K_EFFORT',false),{weekStart:'2027-03-01',cutoff:'2027-03-01',bandAt:()=>band},PV,RC);
 const a2=PI.actionOf(i2,{q8:{applies:false,fraction:0},p3Offered:false},PV,RC);
 ok(i2.state==='INSUFFICIENT_DATA'&&a2.action==='INFORMATIVE_ONLY','[PR-2] '+i2.state+' '+a2.action);
 const i2b=PI.insightOf('TEN_K_EFFORT',mk(4,278,'TEN_K_EFFORT',true),{weekStart:'2027-03-01',cutoff:'2027-03-01',bandAt:()=>band},PV,RC);
 const a2b=PI.actionOf(i2b,{q8:{applies:false,fraction:0},p3Offered:false,revisionOffered:true},PV,RC);
 ok(i2b.state==='IMPROVING'&&a2b.action==='SUGGEST_REPORTING_A_RACE'&&!a2b.alternative,'[PR-2 long reps] '+a2b.action);
 ok(PI.actionOf(i2b,{q8:{applies:false,fraction:0},p3Offered:true,revisionOffered:true},PV,RC).action==='OFFER_V1RC_FIELD_TEST','[PR-2 p3]');
 const i3=PI.insightOf('HALF_MARATHON_EFFORT',mk(4,278,'HALF',true),{weekStart:'2027-03-01',cutoff:'2027-03-01',bandAt:()=>band},PV,RC);
 const a3=PI.actionOf(i3,{q8:{applies:true,fraction:0.045},p3Offered:false,revisionOffered:true},PV,RC);
 ok(a3.action==='SUGGEST_REPORTING_A_RACE'&&!a3.alternative,'[PR-3] '+JSON.stringify(a3));
}
console.log(`p01: ${checks-fails}/${checks} checks hold`);
