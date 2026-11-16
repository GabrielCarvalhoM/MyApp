// V1 Race Forecast + Pace Insights (phase B of the V1 run extensions): shared helpers of its directed tests (not a test file).
// - The oracle: the worked examples of SSCTR-RFC-DECISION-r2 (and PI-1 of r1), read from the decision records themselves, never restated.
// - The inputs of each worked example as plain data, built from the example's own description with the calibration's own conversion.
// - The conforming client of the composed entry point (v1-run-forecast-index.mjs): it keeps every record an answer returns and sends each back.
import fs from 'node:fs';
import {powerLawTime} from '../src/v1-run-calibration.mjs';
import {FORECAST_VALUES_URL,devRunForecast,FORECAST_BOUNDARIES} from '../src/v1-race-forecast.mjs';
import {DEV as RWS_DEV,VALUES as FORMAT_VALUES,ELIG,addDays,live,runner,result,report,hash,nativeReport,asPrescribed,flatSteps,F} from './v1rws-helpers.mjs';
import {VALUES as RC} from './v1rc-helpers.mjs';
export {ELIG,addDays,live,runner,result,report,hash,nativeReport,asPrescribed,flatSteps,F,RC,FORMAT_VALUES,FORECAST_BOUNDARIES};
export const VALUES=JSON.parse(fs.readFileSync(FORECAST_VALUES_URL,'utf8')),FV=VALUES.forecast,PV=VALUES.paceInsights;
const decision=f=>JSON.parse(fs.readFileSync(new URL('../../audits/v1-race-forecast-2026-11-13/ssctr/'+f,import.meta.url),'utf8'));
export const R2=decision('SSCTR_RFC_DECISION_R2.json'),R1=decision('SSCTR_RFC_DECISION.json'),EX=R2.workedExamples;
/** Every boundary of the three extensions on, over the files as read; the pace revision off, as it is by default. */
export const DEV={...RWS_DEV,runForecast:devRunForecast()};
/** The same with the pace revision on (development only: it stays off until IC-2 is met in an integration). */
export const DEV_REVISION={...RWS_DEV,runForecast:devRunForecast(Object.values(FORECAST_BOUNDARIES))};
/** The calibration and the native formats on, this extension off: the state before any enabling record of phase B. */
export const FORECAST_OFF={...RWS_DEV,runForecast:devRunForecast([])};

// ---------- the worked examples as plain data ----------
export const START='2027-01-04',KM={'5K':5,'10K':10,HALF_MARATHON:21.0975,MARATHON:42.195},UNIT=RC.estimates.roundOutwardSeconds,Z=FV.response.z;
export const weekStart=n=>addDays(START,7*(n-1));
/** The current estimate of an event from a result, exactly as the calibration computes it: the power-law range, widened by the margin. */
export function estimateFrom({km,seconds,margin,tier='HIGH'},event){
 const target=KM[event],K=event==='MARATHON'?RC.model.marathon:RC.model.standard,same=Math.abs(target/km-1)<=RC.model.sameDistanceRatioWithin,times=same?[seconds]:[K.kLow,K.kCentral,K.kHigh].map(k=>powerLawTime(km,seconds,target,k));
 return {lower:Math.min(...times)*(1-margin),central:same?seconds:powerLawTime(km,seconds,target,K.kCentral),upper:Math.max(...times)*(1+margin),tier};
}
export const t10=(km,seconds)=>powerLawTime(km,seconds,10,RC.model.standard.kCentral);
/** A reference as the forecast reads it: its date, its 10 km equivalent, its margin over z. */
export const ref=(km,seconds,date,margin)=>({date,t10:t10(km,seconds),sigma:margin/Z});
/** A plan as the examples describe it: `counted` weeks in a counted phase, then TAPER, then RACE_WEEK last; `a` the adherence of the finished weeks. */
export function weeksOf(total,counted,a=[]){
 return Array.from({length:total},(_,i)=>({index:i,startDate:weekStart(i+1),phase:i<counted?'BUILD':i<total-1?'TAPER':'RACE_WEEK',zeroCredit:false,planned:true,a:i<a.length?a[i]:null}));
}
const rep=(n,v)=>Array.from({length:n},()=>v);
const TEN=(a,x={})=>({event:'10K',experience:'INTERMEDIATE',unitSeconds:UNIT['10K'],estimate:estimateFrom({km:10,seconds:3000,margin:0.025},'10K'),weeks:weeksOf(16,14,a),completedWeeks:a.length,raceWeekIndex:15,reference:ref(10,3000,'2027-01-01',0.025),pairA:null,previous:null,q8Down:false,...x});
const NOVICE=(dateA,x={})=>({event:'10K',experience:'NOVICE',unitSeconds:UNIT['10K'],estimate:estimateFrom({km:5,seconds:1740,margin:0.035},'10K'),weeks:weeksOf(14,12,rep(6,0.9)),completedWeeks:6,raceWeekIndex:13,reference:ref(5,1740,'2027-02-14',0.035),pairA:ref(5,1800,dateA,0.035),previous:null,q8Down:false,...x});
const HALF=(secondsB,dateB)=>({event:'HALF_MARATHON',experience:'INTERMEDIATE',unitSeconds:UNIT.HALF_MARATHON,estimate:estimateFrom({km:10,seconds:secondsB,margin:0.025},'HALF_MARATHON'),weeks:weeksOf(16,14,rep(6,0.95)),completedWeeks:6,raceWeekIndex:15,reference:ref(10,secondsB,dateB,0.025),pairA:ref(10,3000,'2027-01-01',0.025),previous:null,q8Down:false});
const MARATHON=(seconds,margin)=>({event:'MARATHON',experience:'INTERMEDIATE',unitSeconds:UNIT.MARATHON,estimate:estimateFrom({km:21.0975,seconds,margin},'MARATHON'),weeks:weeksOf(16,13,rep(4,0.95)),completedWeeks:4,raceWeekIndex:15,reference:ref(21.0975,seconds,'2026-12-20',margin),pairA:null,previous:null,q8Down:false});
const FIVE=a=>({event:'5K',experience:'INTERMEDIATE',unitSeconds:UNIT['5K'],estimate:estimateFrom({km:5,seconds:1500,margin:0.025},'5K'),weeks:weeksOf(10,8,a),completedWeeks:a.length,raceWeekIndex:9,reference:ref(5,1500,'2026-12-25',0.025),pairA:null,previous:null,q8Down:false});
const FROM_FIVE=a=>TEN(a,{estimate:estimateFrom({km:5,seconds:1320,margin:0.025},'10K'),reference:ref(5,1320,'2027-01-01',0.025)});
/** The inputs of every worked forecast example that is a computation, by its id in the decision. */
export const INPUTS={
 a:()=>TEN(rep(4,0.95)),b:()=>TEN(rep(4,0.6)),c:()=>NOVICE('2027-01-02'),d:()=>HALF(3060,'2027-02-14'),d2:()=>HALF(3120,'2027-02-14'),e1:()=>MARATHON(6600,0.025),e2:()=>MARATHON(9900,0.035),
 f:()=>FIVE([]),g:()=>TEN(rep(4,1),{experience:'EXPERIENCED',estimate:estimateFrom({km:10,seconds:2700,margin:0.04,tier:'MODERATE'},'10K'),reference:ref(10,2700,'2027-01-01',0.04)}),h:()=>FROM_FIVE(rep(4,0.95)),
 'A1-1':()=>HALF(3060,'2027-02-10'),'A1-2':()=>NOVICE('2027-01-06'),'A2-1':()=>FIVE([0.7]),'A2-2':()=>FIVE([0.7,0.7]),'A2-3':()=>TEN([0.95,0.95,0.4,0.45]),'A4-1':()=>TEN(rep(14,0.95)),
};
/** The last week before RACE_WEEK of example (h), which A4-3 carries to week 15. */
export const H_AT_15=()=>FROM_FIVE(rep(14,0.95));
export const near=(a,b,eps)=>Math.abs(a-b)<=eps;

// ---------- the conforming client of the composed entry point ----------
import * as P from '../src/v1-run-forecast-index.mjs';
export {P};
/** A client that keeps every record an answer returns and sends each back with the next review. `entry`: the entry point it talks to. */
export function timeline(intake,{opts=DEV,prefix='rf',entry=P}={}){
 const mine=entry===P,g=entry.generateProgram(intake,opts);
 const t={g,p:g.program,ledger:[],ref:null,ev:g.runEvidenceRecord??[],fmt:g.runFormatRecord??[],hist:g.runHistoryRecord??[],rev:g.paceRevisionRecord??[],runs:g.runSessions??{},cal:g.runCalibration,forecast:g.runForecast,insights:g.paceInsights,revision:g.paceRevision,n:0,results:[g],opts};
 if(!t.p)return t;
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 t.review=(w,d,kind,extra={},time='20:00')=>{const day=t.day(w,d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:extra.weekIndex??w,event:{id:extra.eventId??`${prefix}-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],
  ...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.readiness?{readiness:extra.readiness}:{}),...(extra.targetSessionId?{targetSessionId:extra.targetSessionId}:{}),...(extra.signals?{signals:extra.signals}:{}),...(extra.runExpression?{runExpression:extra.runExpression}:{}),
  ...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),...(extra.runEvidence?{runEvidence:extra.runEvidence}:{}),runEvidenceRecord:t.ev,runFormatRecord:t.fmt,runHistoryRecord:t.hist,
  ...(mine?{paceRevisionRecord:t.rev,...(extra.paceRevisionResponse?{paceRevisionResponse:extra.paceRevisionResponse}:{})}:{})};};
 t.take=r=>{t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.ev=r.runEvidenceRecord??t.ev;t.fmt=r.runFormatRecord??t.fmt;t.hist=r.runHistoryRecord??t.hist;t.rev=r.paceRevisionRecord??t.rev;t.cal=r.runCalibration;
  if(r.runFormat?.status==='ACTIVE')t.runs=r.runSessions;t.forecast=r.runForecast;t.insights=r.paceInsights;t.revision=r.paceRevision;t.results.push(r);return r;};
 t.step=(w,d,kind,extra={},time='20:00')=>t.take(entry.evaluateProgram(t.p,t.review(w,d,kind,extra,time),t.opts));
 /** The weekly review of week w (Sunday evening): `how(session)` gives a whole observation, the options of a plain report, or false for not done. */
 t.week=(w,how=()=>({}),extra={})=>t.step(w,6,'WEEKLY_REVIEW',{...extra,observations:t.p.weeks[w].sessions.filter(live).map(s=>{const o=s.sport==='RUN'?how(s):{};return o===false?report(t.p,s,{completed:false}):o?.eventId?o:report(t.p,s,o??{});})});
 /** A look at the week in force with nothing new reported (the forecast of a week is the one of its first day). */
 t.look=(w,d=0,extra={})=>t.step(w,d,'WEEKLY_REVIEW',extra,'08:00');
 t.row=id=>t.ledger.find(o=>o.sessionId===id&&!o.superseded&&!o.fact)??null;
 t.runsOf=(w,pick=()=>true)=>t.p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)&&pick(s));
 return t;
}
/** A race plan starting Mon 2027-01-04 whose race is the last Sunday of the plan, for an athlete with one current result. */
export const racePlan=({event='10K',weeks=16,anchors=[result('10K',3000,'2027-01-01')],experience='INTERMEDIATE',goalMinutes=null,id='rf-race',x={}}={})=>runner({id,asOf:'2027-01-02',start:START,weeks,runExperience:experience,
 goal:{kind:'RACE',event:{kind:event,date:addDays(START,weeks*7-1),...(goalMinutes?{timeGoalMinutes:goalMinutes}:{})}},anchors,...x});
/** Easy and long runs at an easy pace and effort; a harder session at the work pace given (or none), at an effort inside its cue. */
export const done=(workPace=null,rpe=7)=>s=>s.role==='QUALITY'?{pace:330,rpe,...(workPace?{workPace}:{})}:{pace:s.role==='LONG'?365:345,rpe:4};
