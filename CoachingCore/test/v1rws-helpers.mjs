// V1 Run Workout Structure (Founder request of 2026-11-13): shared helpers of its directed tests (not a test file). The timeline is a conforming
// client of the composed entry point: it keeps the plan, the engine's record, the reference state, the calibration's evidence record and this
// extension's two records, and sends each back with every review.
import fs from 'node:fs';
import * as F from '../src/v1-run-format-index.mjs';
import {devRunFormats,FORMAT_VALUES_URL,flatSteps,selectRunSession} from '../src/v1-run-format.mjs';
import {qualityPrescription,easyPrescription} from '../src/r6-prescription.mjs';
import {DEV as RC_DEV,ELIG,addDays,live,runner,result,report,hash,X,V1} from './v1rc-helpers.mjs';
export {F,X,V1,ELIG,addDays,live,runner,result,report,hash,flatSteps};
export const VALUES=JSON.parse(fs.readFileSync(FORMAT_VALUES_URL,'utf8'));
/** Every boundary on, over the files as read (development authorities): what the tests run under until the independent records exist. */
export const DEV={...RC_DEV,runFormats:devRunFormats()};
/** The run calibration on and the native formats off: the state before an enabling record for V1X-RUN-NATIVE. */
export const FORMATS_OFF={...RC_DEV,runFormats:devRunFormats([])};
const read=f=>JSON.parse(fs.readFileSync(new URL('../../audits/v1-run-workout-structure-2026-11-13/ssctr/'+f,import.meta.url),'utf8'));
export const R2=read('SSCTR_RWS_R2_DECISION.json'),R3=read('SSCTR_RWS_R3_DECISION.json'),R3A=read('SSCTR_RWS_R3A_AMENDMENT.json');
export const CUES={EASY_CONVERSATIONAL:'Easy: full sentences',THRESHOLD_CONTROLLED:'Comfortably hard: short phrases',TEN_K_EFFORT:'Hard but controlled: a few words',HALF_MARATHON_EFFORT:'Steady hard: controlled breathing',FIVE_K_EFFORT:'Hard: single words, never a sprint',MARATHON_EFFORT:'Steady and controlled: short sentences'};
const KIND={THRESHOLD:'THRESHOLD',TEN_K_SPECIFIC:'TEN_K',HALF_MARATHON_SPECIFIC:'HALF_MARATHON',FIVE_K_SPECIFIC:'FIVE_K',MARATHON_SPECIFIC:'MARATHON',RACE_TOUCH:'TOUCH'};
export const DOMAIN={THRESHOLD:'THRESHOLD_CONTROLLED',TEN_K_SPECIFIC:'TEN_K_EFFORT',HALF_MARATHON_SPECIFIC:'HALF_MARATHON_EFFORT',FIVE_K_SPECIFIC:'FIVE_K_EFFORT',MARATHON_SPECIFIC:'MARATHON_EFFORT',EASY:'EASY',LONG:'LONG',RECOVERY_EASY:'RECOVERY',SHAKEOUT:'RECOVERY'};
const EVENT_DOMAIN={'5K':'FIVE_K_EFFORT','10K':'TEN_K_EFFORT',HALF_MARATHON:'HALF_MARATHON_EFFORT',MARATHON:'MARATHON_EFFORT'};
/** A planned run session as the engine shapes it, built with the engine's own prescription builders. */
export function session({family,step=null,minutes=null,strides=null,firstExposure=false,ladderStep=1,event=null,id='w3-run-d1',week=3,date='2026-12-01',converted=null,role=null}){
 const quality=!!step,prescription=quality?qualityPrescription(KIND[family],step,{cues:CUES,firstExposure,touchCue:event?EVENT_DOMAIN[event]:null}):easyPrescription(minutes,{family,strides,cue:CUES.EASY_CONVERSATIONAL});
 return {id,weekIndex:week,date,sport:'RUN',role:role??(quality?'QUALITY':family==='LONG'?'LONG':'EASY'),progression:quality?{dimension:'STEP',value:ladderStep,ladder:family}:{dimension:'MINUTES',value:minutes},converted,status:'PLANNED',prescription,plannedPrescriptionHash:hash(prescription)};
}
const band=(fast,slow,domain)=>({status:'AVAILABLE',fastSecondsPerKm:fast,slowSecondsPerKm:slow,domain});
/** The selector's input for one session, as the composed entry point builds it from the plan, the calibration and the record. */
export function input({s,fast,slow,domain=null,experience='INTERMEDIATE',phase='DEVELOPMENT',mode='EASY',recovery=null,history=null,prior=null,weekIndex=null,budget=120,available=null,preference='NATIVE',engineStatus='KEEP',screenRequired=false,enabled=true,eventKind=null,marathonEstimate=null,guidance=undefined}){
 const family=s.prescription.family,d=domain??(family==='RACE_TOUCH'?EVENT_DOMAIN[eventKind]:DOMAIN[family]);
 return {session:s,weekIndex:weekIndex??s.weekIndex,phase,mode,experience,eventKind,guidance:guidance!==undefined?guidance:{sessionId:s.id,pace:fast?band(fast,slow,d):{status:'UNAVAILABLE',reason:'NO_QUALIFYING_EVIDENCE'}},recoveryBand:recovery?band(recovery[0],recovery[1],'RECOVERY'):null,marathonEstimate,
  cues:Object.fromEntries(Object.entries(CUES).map(([k,v])=>[k,{rpe:[2,4],talk:v}])),budgetMinutes:budget,availableMinutes:available??budget,preference,enabled,engineStatus,screenRequired,history,prior};
}
export const select=x=>selectRunSession(x,VALUES);
/** The work of a session as a line: "6 x 800 m", "700-800-800-700 m", "2 x 1500 m + 2 x 8 min". */
export function line(run){
 const work=flatSteps(run.blocks).filter(s=>s.kind==='WORK'),d=work.filter(s=>s.target.type==='DISTANCE').map(s=>s.target.metres),t=work.filter(s=>s.target.type==='TIME').map(s=>s.target.seconds/60),rec=flatSteps(run.blocks).find(s=>s.kind==='RECOVERY');
 const main=d.length?(d.every(x=>x===d[0])?`${d.length} x ${d[0]} m`:d.join('-')+' m')+(t.length?` + ${t.length} x ${t[0]} min`:''):`${t.length} x ${t[0]} min`;
 return main+(rec?rec.target.type==='DISTANCE'?`, ${rec.target.metres} m easy jog between`:`, ${rec.target.seconds/60} min walk-or-jog between`:'');
}
/** A report of a native session done as prescribed: every main step met by a lap, or the run's own distance facts. */
export function nativeReport(t,s,{minutes,km=null,measurement='GPS',rpe=null,actual={},response={},met=()=>true,completed=true,eventId=null}={}){
 const run=t.runs[s.id],main=flatSteps(run.blocks).filter(x=>x.kind==='WORK');
 return {eventId:eventId??'rw-done-'+s.id,athleteId:t.p.athleteId,sessionId:s.id,occurrenceDate:s.date,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL',...response},
  actual:{completed,minutes:minutes??s.prescription.durationMinutes,...(km!==null?{distanceKm:km,measurement}:{}),...(rpe!==null?{rpe}:{}),formatHash:run.formatHash,...(main.length?{steps:main.map(x=>({block:x.block,rep:x.rep,kind:'WORK',targetMet:met(x)}))}:{}),...actual}};
}
/** The conforming client of the composed entry point. */
export function timeline(intake,{opts=DEV,prefix='rw',entry=F}={}){
 const mine=entry===F,g=entry.generateProgram(intake,opts);
 const t={g,p:g.program,ledger:[],ref:null,ev:g.runEvidenceRecord??[],fmt:g.runFormatRecord??[],hist:g.runHistoryRecord??[],runs:g.runSessions??{},cal:g.runCalibration,state:g.runFormat,n:0,results:[],opts};
 if(!t.p)return t;
 t.day=(w,d)=>addDays(t.p.startDate,w*7+d);
 t.review=(w,d,kind,extra={},time='20:00')=>{const day=t.day(w,d);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${day}T${time}:00-03:00`,weekIndex:w,event:{id:extra.eventId??`${prefix}-${++t.n}`,kind},eligibility:extra.eligibility??ELIG(day),observations:extra.observations??[],
  ...(extra.interruption?{interruption:extra.interruption}:{}),...(extra.targetSessionId?{targetSessionId:extra.targetSessionId}:{}),...(extra.signals?{signals:extra.signals}:{}),...(extra.runExpression?{runExpression:extra.runExpression}:{}),
  ...(t.ledger.length?{actualLedger:t.ledger}:{}),...(t.ref?{referenceState:t.ref}:{}),...(extra.runEvidence?{runEvidence:extra.runEvidence}:{}),runEvidenceRecord:t.ev,...(mine?{runFormatRecord:t.fmt,runHistoryRecord:t.hist}:{})};};
 t.take=r=>{t.ledger=r.actualLedger??t.ledger;t.ref=r.referenceState??t.ref;if(r.proposal)t.p=r.proposal;t.ev=r.runEvidenceRecord??t.ev;t.fmt=r.runFormatRecord??t.fmt;t.hist=r.runHistoryRecord??t.hist;t.cal=r.runCalibration;if(r.runFormat?.status==='ACTIVE')t.runs=r.runSessions;t.state=r.runFormat;t.results.push(r);return r;};
 t.step=(w,d,kind,extra={},time='20:00')=>t.take(entry.evaluateProgram(t.p,t.review(w,d,kind,extra,time),t.opts));
 /** The weekly review of week w (Sunday evening): `how(session)` gives a whole observation, the options of a plain report, or false for not done. */
 t.week=(w,how=()=>({}),extra={})=>t.step(w,6,'WEEKLY_REVIEW',{...extra,observations:t.p.weeks[w].sessions.filter(live).map(s=>{const o=s.sport==='RUN'?how(s):{};return o===false?report(t.p,s,{completed:false}):o?.eventId?o:report(t.p,s,o??{});})});
 t.row=id=>t.ledger.find(o=>o.sessionId===id&&!o.superseded&&!o.fact)??null;
 t.runsOf=(w,pick=()=>true)=>t.p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&live(s)&&pick(s));
 return t;
}
/** An experienced runner whose plan reaches a 100-minute long run at once: with easy runs at 5:40 per km and long runs at 6:05, the long run of
 * week 1 is natively 16 km (R3 WE3-01's shape, reached through the engine and the calibration, not built by hand). */
export const sixteen=(x={})=>runner({id:'rw-16',weeks:12,runExperience:'EXPERIENCED',anchors:[result('10K',46*60,'2026-10-25')],recent:{runDaysPerWeek:4,runMinutesPerWeek:300,longestRunMinutes:100,strengthDaysPerWeek:1},
 schedule:{runDays:[0,1,3,6],strengthDays:[2],runMinutes:75,longRunMinutes:130,longRunDay:6},...x});
export const paced=s=>s.role==='LONG'?{pace:365,rpe:4}:{pace:340,rpe:4};
/** That athlete after week 0 as reported, and the long run session of week 1. */
export function atSixteen(options={}){const t=timeline(sixteen(options.intake??{}),options.opts?{opts:options.opts}:{});t.week(0,paced);t.long=t.runsOf(1,s=>s.role==='LONG')[0];return t;}
/** A session reported as it was prescribed: a native continuous run by its distance at the athlete's usual pace (the low end of its estimate), native repetitions by their laps, a time session by its minutes. */
export function asPrescribed(t,s){
 const run=t.runs[s.id];if(s.sport!=='RUN'||run?.expression!=='NATIVE')return paced(s);
 const main=flatSteps(run.blocks).find(x=>x.kind==='STEADY'&&x.target.type==='DISTANCE');
 return nativeReport(t,s,{minutes:main?Math.round(run.estimate.durationMinutes.low):s.prescription.durationMinutes,km:main?main.target.metres/1000:null,rpe:4});
}
/** The reports of week w, each as prescribed, with one session's report replaced. */
export const weekWith=(t,w,id,observation)=>s=>s.id===id?observation:asPrescribed(t,s);
/** A 10 km race plan (12 weeks) of an intermediate runner with a current result: its harder sessions become native after their first exposure. */
export const raceTen=(x={})=>runner({id:'rw-ev',weeks:12,goal:{kind:'RACE',event:{kind:'10K',date:'2027-01-24'}},anchors:[result('10K',3000,'2026-10-25')],...x});
