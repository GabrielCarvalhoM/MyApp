// CoachingCore V1 Race Forecast + Pace Insights (Founder request of 2026-11-13; phase B of the V1 run extensions, Founder mission of 2026-11-15):
// the V1 engine, its run calibration and its native run formats, with the race forecast and the pace insights beside them.
// - It wraps v1-run-format-index.mjs, which wraps v1-run-index.mjs, which wraps v1-index.mjs, and changes none: every plan, decision, record,
//   calibration, run session and format they return is returned as it is. One entry point serves one record.
// - It adds to each result: `runForecast` (the current estimate carried to race day as two plausibility envelopes, or the typed reason there is
//   none), `paceInsights` (what the comparable sessions of each harder domain show against the band of their own week), `paceRevision` (the
//   athlete-confirmed revision of the threshold band, behind its own boundary) and `paceRevisionRecord` (the athlete's answers to revision
//   offers, append-only: the only thing this extension asks a caller to keep).
// - A review may carry `paceRevisionResponse` ({offerId, response: ACCEPT | DECLINE | REVOKE}) and `paceRevisionRecord`; a restart input may
//   carry `paceRevisionRecord`. All are taken off before anything below reads its input. An integration passes no options.
// - Nothing here reads the engine's record on its own terms. Every execution is read through the answer of v1-run-format-index.mjs, which
//   admits the record first (COACHINGCORE-V1-RUN-FORMAT-FREEZE-2, entry contract of its closure, section 5):
//   * the calibration is the one that answer carries, or the one its exported `runCalibrationOf` gives over the record of formats it returned;
//   * adherence reads `runSessions[id].execution` (the engine's own reading of completion, the smaller usable distance, the step weights):
//     a completed session is adherence whether or not it is pace evidence;
//   * pace evidence is an execution with `paceWithheld === null`, not named in `runFormat.paceEvidenceWithheld`, and `paceEvidence !== false`:
//     a session by time has `paceEvidence: null` even when its row is withheld, so the reason is read first, and no field of the raw row
//     (`actual.work.paceSecondsPerKm`, a distance, `actual.completed`) is read to get round it.
// - With no enabling record every added key is DISABLED and everything else is v1-run-format-index.mjs, key for key. With the forecast and the
//   insights on, the same holds for every key that entry point returns: they observe. Only V1X-PACE-REVISION, off until an integration meets
//   IC-2 and its own SSCTR record exists, hands the run formats the effective threshold band (the one band source, `BAND_OF`).
// - Everything is worked out again from the record at each answer; nothing shown is stored. The forecast of a week reads what was dated and on
//   record before the week started, as the calibration does, so it does not move inside the week. What race week shows is the forecast of the
//   week before it, read the same way, and only while nothing that week read has been reported on since (it is then not shown, never changed).
// - What a week shows never changes inside the week (corrective cycle of 2026-11-16, QRE-RFC-A-01 to A-03, SSCTR-RFC-A-01 and A-02):
//   * the frozen engine rewrites a row when a second source or a correction arrives, so the record a week read cannot be read again as it
//     was. When a report arrives, from the week's first day on, for an earlier session that already had one, or a break is declared, the week
//     shows a withdrawal with its reason until the next week boundary: never another number;
//   * a row is read only for the session of the plan in force it was run in: dated inside that session's own week and first recorded once
//     the plan existed (after a restart the ids of the new plan's sessions are the old plan's ids);
//   * the band an execution is read against is the band its session was delivered with, as the record of formats holds it; the calibration
//     of a past week is never asked again for it (a later correction moves it). The one calibration of another week still asked is the
//     frozen week's, in race week, under its own guard;
//   * a declared break of 14 days or more, in progress or still to come, withdraws the forecast and the insights at once; a week a
//     clinical hold stood in earns nothing.
// - Synthetic data only. Not a prediction model, not production, no authorization for real athletes.
import * as F from './v1-run-format-index.mjs';
import {runCalibrationAuthority,allowsRun,powerLawTime} from './v1-run-calibration.mjs';
import {runFormatAuthority,allowsFormat,flatSteps,RUN_REPORT_RECEIVED,RUN_FORMAT_EMITTED} from './v1-run-format.mjs';
import {readableF08,isF08Fact,standingHolds,READINESS_DECLARED} from './v1-f08.mjs';
import {utcTimestamp,localDate} from './r6-provenance.mjs';
import {clone,freeze,hash} from './value.mjs';
import {runForecastAuthority,allowsForecast,forecastOf,raceWeekOf,weekAdherence,unknownSessionCredit,windowOf,rangeTextOf,basisTextOf,experienceOf,clock,isoDay,onDate,dayGap,FORECAST_EXTENSION_ID,FORECAST_MODEL_ID,RUN_FORECAST_VERSION} from './v1-race-forecast.mjs';
import {paceInsightsOf,paceRevisionOf,effectiveBand,REVISION_DOMAIN,PACE_INSIGHTS_VERSION} from './v1-pace-insights.mjs';
export * from './v1-run-format-index.mjs';
export {runForecastAuthority,FORECAST_BOUNDARIES,FORECAST_EXTENSION_ID} from './v1-race-forecast.mjs';
export const V1_RUN_FORECAST_ENGINE=F.V1_RUN_FORMAT_ENGINE+'+'+FORECAST_EXTENSION_ID;
export const PACE_REVISION_RESPONSE='PACE_REVISION_RESPONSE';
export const PACE_REVISION_VERSION='V1X-PACE-REVISION-STATE-1';

const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const list=v=>Array.isArray(v)?v:[];
const num=(v,lo=-Infinity,hi=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const upper=v=>typeof v==='string'&&v.trim()?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
const without=(o,keys)=>Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)));
/** The keys of this extension on a review and on a restart input: never read by anything below. */
const MINE=['paceRevisionResponse','paceRevisionRecord'];
/** A caller's options without the band hook: only this module sets it, and only with the pace revision on (preflight SC-4, SC-6). */
const internal=options=>{const {[F.BAND_OF]:_never,...rest}=isObj(options)?options:{};return rest;};
const shaped=v=>isObj(v)&&isObj(v.forecast)&&isObj(v.paceInsights)&&['events','gainCeilingLogTime','adherence','response','slowdown','q8DownInForce','ranges','raceWeek','requiredText'].every(k=>isObj(v.forecast[k]))&&Array.isArray(v.forecast.countedPhases)&&num(v.forecast.tauWeeks,1)&&num(v.forecast.horizonDaysMax,1)
 &&Array.isArray(v.paceInsights.domains)&&isObj(v.paceInsights.exceptional)&&isObj(v.paceInsights.actions)&&isObj(v.paceInsights.athleteConfirmedRevision);
/**
 * What is on (fail closed): each boundary by its own independent record, and only over the calibration's estimate boundary and the admitted
 * record of the run formats. The insights also need the calibration's pace bands; the revision also needs the insights.
 */
function authorityOf(opts){
 try{
  const ext=runForecastAuthority(opts),rc=runCalibrationAuthority(opts),fmt=runFormatAuthority(opts),ok=shaped(ext?.values)&&isObj(rc?.values);
  const estimate=ok&&allowsRun(rc,'ESTIMATE'),native=ok&&allowsFormat(fmt),under=estimate&&native,insights=under&&allowsRun(rc,'PACE')&&allowsForecast(ext,'INSIGHTS');
  return {ext,rc:rc?.values??null,on:{FORECAST:under&&allowsForecast(ext,'FORECAST'),INSIGHTS:insights,REVISION:insights&&allowsForecast(ext,'REVISION')},
   why:!ok||![allowsForecast(ext,'FORECAST'),allowsForecast(ext,'INSIGHTS'),allowsForecast(ext,'REVISION')].some(Boolean)?'EXTENSION_NOT_ENABLED':!estimate?'RUN_ESTIMATE_BOUNDARY_REQUIRED':!native?'RUN_NATIVE_BOUNDARY_REQUIRED':'BOUNDARY_NOT_ENABLED'};
 }catch{return {ext:null,rc:null,on:{FORECAST:false,INSIGHTS:false,REVISION:false},why:'EXTENSION_NOT_ENABLED'};}
}
const head=A=>({extension:{id:FORECAST_EXTENSION_ID,sha256:A.ext?.sha256??null,source:A.ext?.source??null,boundaries:{...A.on}}});
const forecastHead=A=>({version:RUN_FORECAST_VERSION,modelId:FORECAST_MODEL_ID,valuesSha256:A.ext?.sha256??null,...head(A)});
/** The three keys when nothing is computed: each off by its own boundary, or unavailable for one stated reason. */
const idle=(A,reason)=>({
 runForecast:{...forecastHead(A),...(A.on.FORECAST?{status:'UNAVAILABLE',reason}:{status:'DISABLED',reason:A.why})},
 paceInsights:{version:PACE_INSIGHTS_VERSION,...head(A),...(A.on.INSIGHTS?{status:'UNAVAILABLE',reason}:{status:'DISABLED',reason:A.why}),domains:{}},
 paceRevision:{version:PACE_REVISION_VERSION,...head(A),domain:REVISION_DOMAIN,...(A.on.REVISION?{status:'NONE',reason}:{status:A.on.INSIGHTS?'INERT':'DISABLED',reason:A.on.INSIGHTS?'PACE_REVISION_BOUNDARY_NOT_ENABLED':A.why}),offer:null,active:null,effectivePaceBands:{}}});
const SIGNS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];

// ---------- the record of the athlete's answers to revision offers (the only record of this extension) ----------
const RESPONSES=['ACCEPT','DECLINE','REVOKE'],ID_MAX=128,ROW_KEYS=['athleteId','eventId','fact','inputHash','recordedAt','response'],RESPONSE_KEYS=['offerId','planId','response'];
const exactly=(o,keys)=>Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
const responseKey=r=>`pace-revision|${r.planId}|${r.offerId}|${r.response}`;
const readableResponse=(o,athleteId)=>isObj(o)&&o.fact===PACE_REVISION_RESPONSE&&o.athleteId===athleteId&&exactly(o,ROW_KEYS)&&isObj(o.response)&&exactly(o.response,RESPONSE_KEYS)&&RESPONSES.includes(o.response.response)
 &&typeof o.response.offerId==='string'&&o.response.offerId.length>0&&o.response.offerId.length<=ID_MAX&&typeof o.response.planId==='string'&&typeof o.recordedAt==='string'&&utcTimestamp(o.recordedAt)===o.recordedAt
 &&o.eventId===responseKey(o.response)&&o.inputHash===hash({athleteId,recordedAt:o.recordedAt,response:o.response});
/** The answers a record holds for a plan, each with its local day; the rows that cannot be read are named and never read as an answer. */
function readResponses(record,athleteId,planId,tz){
 const rows=[],unreadable=[];
 for(const o of list(record)){if(!readableResponse(o,athleteId)){unreadable.push(isObj(o)&&typeof o.eventId==='string'?o.eventId:null);continue;}if(o.response.planId===planId)rows.push({offerId:o.response.offerId,response:o.response.response,date:localDate(o.recordedAt,tz),at:Date.parse(o.recordedAt)});}
 return {rows,unreadable:unreadable.sort(),last:list(record).filter(isObj).map(o=>Date.parse(o.recordedAt)).filter(Number.isFinite).reduce((m,t)=>Math.max(m,t),-Infinity)};
}

// ---------- reading the plan and the record ----------
const recordedDay=(o,tz)=>Number.isFinite(Date.parse(o.provenance?.firstRecordedAt))?localDate(new Date(Date.parse(o.provenance.firstRecordedAt)).toISOString(),tz):o.localDate;
const liveRun=(o,athleteId)=>isObj(o)&&!o.fact&&o.superseded!==true&&o.athleteId===athleteId&&o.context?.sport==='RUN'&&isObj(o.actual)&&typeof o.sessionId==='string'&&isoDay(o.localDate);
/** Declared breaks of the record as [from, to] local days, read as the calibration reads them (a break without an end runs to its declaration). */
function breaksOf(ledger,program,tz){
 return list(ledger).filter(o=>isObj(o)&&o.fact==='INTERRUPTION_DECLARED'&&o.athleteId===program.athleteId&&isObj(o.interruption)).map(o=>{
  const i=o.interruption,declared=Number.isFinite(Date.parse(o.declaredAt))?localDate(new Date(Date.parse(o.declaredAt)).toISOString(),tz):null,start=isoDay(i.startDate)?i.startDate:utcTimestamp(i.startedAt)?localDate(utcTimestamp(i.startedAt),tz):null;
  const end=isoDay(i.endDate)?i.endDate:start&&num(i.days,1,3650)?onDate(start,Math.round(i.days)-1):declared,from=start??(end&&num(i.days,1,3650)?onDate(end,-(Math.round(i.days)-1)):null);
  return from&&end&&end>=from?{from,to:end,days:dayGap(from,end)+1,declaredOn:declared}:null;}).filter(Boolean);
}
/**
 * The forecast's credit input of one planned run session (handoff IC-1, preflight SC-1 and SC-2): read from the execution the run formats
 * expose, never from the report. No row in force is no report. A row in conflict, or a native session read UNKNOWN, is the named point
 * `unknownSessionCredit`. The extent of a continuous run that was not completed is the smaller usable distance (`extentKm`), in metres against
 * its target; `extentFraction` is never read (SSCTR-RWS-E-03). A repetition is met or it is nothing.
 */
function creditInput(s,row,execution){
 const planned=s.prescription.durationMinutes;
 if(!row)return {sessionId:s.id,planned,reported:false};
 // A session the plan skipped that was reported all the same was delivered in no format: the engine's own reading of its row, by time.
 if(!execution||execution.eventId!==row.eventId)return s.status==='SKIPPED'?{sessionId:s.id,planned,reported:true,unknown:row.conflicted===true,completed:row.partial!==true&&row.actual.completed===true&&row.conflicted!==true,actualMin:num(row.actual.seconds,1)?row.actual.seconds/60:num(row.actual.minutes,0)?row.actual.minutes:null,steps:null}
  :{sessionId:s.id,planned,reported:true,unknown:true,completed:false};
 const e=execution,native=e.expression==='NATIVE',main=native?list(e.steps):[],continuous=main.length>0&&main.every(x=>x.kind==='STEADY'),works=main.filter(x=>x.kind==='WORK').length;
 return {sessionId:s.id,planned,reported:true,completed:e.completed===true,unknown:row.conflicted===true||e.status==='UNKNOWN',actualMin:e.actualMinutes,
  steps:native?main.map(x=>({kind:x.kind,w:x.weightSeconds,targetMet:x.targetMet===true,repOfRepeatedBlock:x.kind==='WORK'&&works>1,target:continuous&&num(e.targetKm,0.01)?e.targetKm*1000:null,measured:continuous&&num(e.extentKm,0)?e.extentKm*1000:null})):null,
  targetKm:native&&num(e.targetKm,0.01)?e.targetKm:null,actualKm:native&&num(e.extentKm,0)?e.extentKm:null};
}
/** The calibration's current estimate of an event, unrounded, worked out again from what the calibration shows and checked against it. */
function unroundedOf(cal,event,RC){
 const est=cal?.estimates?.[event];if(est?.status!=='AVAILABLE')return null;
 const row=list(cal.evidence).find(e=>e.id===est.reference),km=RC.estimates.distancesKm[event],u=RC.estimates.roundOutwardSeconds[event];
 if(!row||!num(row.distanceKm,0.1)||!num(row.seconds,1)||!num(est.margin,0,1)||!num(km)||!num(u,1))return null;
 const K=est.model==='MARATHON'?RC.model.marathon:RC.model.standard,same=est.basis==='SAME_DISTANCE_RESULT',times=same?[row.seconds]:[K.kLow,K.kCentral,K.kHigh].map(k=>powerLawTime(row.distanceKm,row.seconds,km,k));
 // A downward training factor on the half or the marathon slows that estimate as shown; the forecast starts from the estimate as shown.
 const d=RC.recalibration.training.down.alsoLowersEstimateOf.find(id=>RC.domains[id].event===event),f=d?cal.capacity?.trainingFactors?.[d]?.fraction??0:0,k=f<0?1/(1+f):1;
 const lower=Math.min(...times)*(1-est.margin)*k,central=(same?row.seconds:powerLawTime(row.distanceKm,row.seconds,km,K.kCentral))*k,upper=Math.max(...times)*(1+est.margin)*k;
 // Fail closed: the three values must give back the calibration's own displayed seconds, or no forecast starts from them.
 if(Math.floor(lower/u+1e-9)*u!==est.lowSeconds||Math.round(central/u)*u!==est.centralSeconds||Math.ceil(upper/u-1e-9)*u!==est.highSeconds)return null;
 return {lower,central,upper,tier:est.confidence};
}
const KIND_GROUP={RACE_RESULT:'RACE',TIME_TRIAL:'TEST',FIELD_TEST:'TEST'};
const NOT_FOR_A_PAIR=['SUBMAXIMAL_LOWER_BOUND','EFFORT_UNKNOWN','PRESUMED_FROM_AGED_EVIDENCE'];

/**
 * Everything the three outputs read, gathered once from an answer of v1-run-format-index.mjs: the plan in force, the record as that answer
 * returned it, its calibration, its run sessions. `c`: {program, ledger, formats, evidenceRecord, asOf, weekIndex, engineStatus, eligibility, hold, opts}.
 */
function readingOf(base,c,A){
 const {program}=c,V=A.ext.values,FV=V.forecast,RC=A.rc,tz=program.timezoneOffsetMinutes??0,dayOnly=isoDay(c.asOf),at=dayOnly?c.asOf+'T23:59:59.000Z':utcTimestamp(c.asOf);
 if(!at||!Array.isArray(program.weeks)||!program.weeks.length)return null;
 const asOfDay=dayOnly?c.asOf:localDate(at,tz),w=Math.max(0,Math.min(Number.isInteger(c.weekIndex)?c.weekIndex:0,program.weeks.length-1)),startOf=k=>program.weeks[k].startDate??onDate(program.startDate,7*k);
 const modeOf=k=>program.stateTrace?.[Math.max(0,Math.min(k,(program.stateTrace?.length??1)-1))]?.run?.mode??null,sessions=new Map(program.weeks.flatMap(x=>x.sessions.map(s=>[s.id,s])));
 // A row is an execution of a session of this plan only when it is dated inside that session's own week and was first recorded once the plan
 // existed: after a restart the new plan's sessions carry the ids of the old one's, and a row of the old plan is no execution of the new.
 const created=typeof program.canonical?.asOf==='string'?(isoDay(program.canonical.asOf)?program.canonical.asOf:utcTimestamp(program.canonical.asOf)?localDate(utcTimestamp(program.canonical.asOf),tz):null):null;
 const own=o=>{const s=sessions.get(o.sessionId);return !!s&&Number.isInteger(s.weekIndex)&&s.weekIndex>=0&&s.weekIndex<program.weeks.length&&o.localDate>=startOf(s.weekIndex)&&o.localDate<=onDate(startOf(s.weekIndex),6)&&!!created&&recordedDay(o,tz)>=created;};
 const rows=list(c.ledger).filter(o=>liveRun(o,program.athleteId)&&own(o)).sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt)),bySession=new Map(rows.map(o=>[o.sessionId,o]));
 // The weeks a clinical hold stood in (the engine's own facts): from the day a hold was recorded to the day of the next declared readiness.
 const atMs=Date.parse(at),f08=readableF08(list(c.ledger).filter(isF08Fact),{athleteId:program.athleteId,at:atMs}),dayOf=t=>localDate(new Date(t).toISOString(),tz),ready=f08.filter(o=>o.fact===READINESS_DECLARED).map(o=>Date.parse(o.declaredAt)).sort((a,b)=>a-b);
 const holds=f08.filter(o=>standingHolds([o]).holds.length===1).map(o=>{const t=Date.parse(o.declaredAt),end=ready.find(x=>x>t);return {from:dayOf(t),to:end===undefined?null:dayOf(end)};});
 const underHold=k=>holds.some(h=>h.from<=onDate(startOf(k),6)&&(h.to===null||h.to>=startOf(k)));
 const breaks=breaksOf(c.ledger,program,tz);
 // What a week read that has been reported on since its first day: a run report received from that day on for an earlier session of the plan
 // that already had one (a correction, a second source, a contradiction), or a break declared since. The frozen engine rewrites the row, so
 // the week cannot be read again as it was: it is withdrawn, never shown changed.
 const changedSince=cutoff=>{
  const seen=new Map();
  for(const f of list(c.formats))if(isObj(f)&&f.fact===RUN_REPORT_RECEIVED&&f.athleteId===program.athleteId&&typeof f.sessionId==='string'&&f.report?.standing===true&&utcTimestamp(f.recordedAt)){
   const s=sessions.get(f.sessionId);if(!s||!(s.date<cutoff))continue;const x=seen.get(f.sessionId)??{before:false,since:false};if(localDate(f.recordedAt,tz)<cutoff)x.before=true;else x.since=true;seen.set(f.sessionId,x);}
  return [...seen.values()].some(x=>x.before&&x.since)?'REPORTS':breaks.some(b=>b.declaredOn&&b.declaredOn>=cutoff)?'BREAK':null;};
 // The band a session was delivered with, as the record of formats holds it: the pace on the work of the latest format of the session that
 // was on record by the day it was run (a session is delivered up to two weeks ahead, and again only when its format changes). Never worked
 // out again from the calibration of a past week.
 const delivered=new Map();
 for(const f of list(c.formats).filter(f=>isObj(f)&&f.fact===RUN_FORMAT_EMITTED&&f.athleteId===program.athleteId&&typeof f.sessionId==='string'&&isObj(f.format)&&Array.isArray(f.format.blocks)&&f.inputHash===hash(f.format)&&utcTimestamp(f.recordedAt)).sort((a,b)=>Date.parse(a.recordedAt)-Date.parse(b.recordedAt)||(a.eventId<b.eventId?-1:1))){
  const s=sessions.get(f.sessionId),day=localDate(f.recordedAt,tz);if(!s||!created||day<created)continue;
  let pace=null;try{pace=flatSteps(f.format.blocks).find(x=>x.kind==='WORK'&&isObj(x.intensity?.pace))?.intensity.pace??null;}catch{pace=null;}
  // A format with no pace on its work is delivered by effort alone: it is kept as that (the band of an earlier delivery no longer stands).
  const band=pace&&num(pace.fastSecondsPerKm,1)&&num(pace.slowSecondsPerKm,pace.fastSecondsPerKm)?{fastSecondsPerKm:pace.fastSecondsPerKm,slowSecondsPerKm:pace.slowSecondsPerKm,domain:pace.domain??null}:null;
  const all=delivered.get(s.id);if(all)all.push({day,band});else delivered.set(s.id,[{day,band}]);
 }
 const deliveredBand=(sessionId,domain,onDay)=>{const b=(delivered.get(sessionId)??[]).filter(x=>x.day<=onDay).at(-1)?.band??null;return b&&b.domain===domain?{fastSecondsPerKm:b.fastSecondsPerKm,slowSecondsPerKm:b.slowSecondsPerKm}:null;};
 const executionOf=id=>base.runSessions?.[id]?.execution??null,withheld=new Map(list(base.runFormat?.paceEvidenceWithheld).filter(isObj).map(x=>[x.eventId,x.reason]));
 // The weeks of the plan as the forecast reads them; the adherence of a week is worked out for a cutoff (what was dated and on record before it).
 const plannedRuns=(week,cutoff)=>week.sessions.filter(s=>{
  if(s.sport!=='RUN'||!isObj(s.prescription)||!num(s.prescription.durationMinutes,0.5))return false;
  const row=bySession.get(s.id),inForce=!!row&&row.localDate<cutoff&&recordedDay(row,tz)<cutoff;
  // A session the plan moved lives on in the one it moved to, and an optional one is no planned dose: each counts only when it was reported.
  return s.status==='SKIPPED'&&s.movedTo||s.optional===true?inForce:true;});
 const weeksAt=(cutoff,completed)=>program.weeks.map(week=>{
  const runs=plannedRuns(week,cutoff),done=week.index<completed,credit=done?weekAdherence(runs.map(s=>{const row=bySession.get(s.id),inForce=!!row&&row.localDate<cutoff&&recordedDay(row,tz)<cutoff;return creditInput(s,inForce?row:null,inForce?executionOf(s.id):null);})):null;
  return {index:week.index,startDate:startOf(week.index),phase:week.phase,zeroCredit:RC.paceRules.noBandModes.includes(modeOf(week.index))||underHold(week.index),planned:runs.length>0,a:credit?credit.a:null,credits:credit?credit.credits:null};});
 const ev=program.goal?.run?.event??null,event=isObj(ev)&&typeof ev.kind==='string'&&isoDay(ev.date)?{kind:ev.kind,date:ev.date}:null;
 const byPhase=program.weeks.find(x=>x.phase==='RACE_WEEK')?.index??null,byDate=event?program.weeks.find(x=>event.date>=startOf(x.index)&&event.date<=onDate(startOf(x.index),6))?.index??null:null;
 // Experience: the class of the plan's creation, and only when the athlete stated it or it was derived from stated months of training: an
 // intake that says nothing is stored as NOVICE, which is the highest ceiling, and is read here as unknown (Athlete Data Foundation, section 6).
 const athlete=program.canonical?.athlete??{},known=athlete.experienceDeclared?.run===true||isObj(athlete.experienceBasis?.run),experience=known?(program.capability?.run?.experience??athlete.runExperience??null):null;
 const el=isObj(c.eligibility)?{...c.eligibility,...(isObj(c.eligibility.flags)?c.eligibility.flags:{})}:null;
 return {V,FV,PV:V.paceInsights,RC,program,tz,at,asOfDay,w,startOf,modeOf,sessions,rows,bySession,executionOf,withheld,weeksAt,changedSince,deliveredBand,event,raceWeekIndex:byPhase??byDate,raceWeekByDate:byDate,experience,experienceKnown:known,
  breaks,completion:program.weeks.some(x=>x.sessions.some(s=>s.role==='RACE'&&s.prescription?.completion===true)),
  prescribing:typeof c.engineStatus==='string'&&!['ASK','HOLD','CLINICAL_HUMAN_REQUIRED','UNSUPPORTED','INVALID_INPUT'].includes(c.engineStatus)&&el?.status==='NONCLINICAL_CONFIRMED'&&SIGNS.every(k=>el[k]===false)};
}
/** The calibration of another week of the same record, through the run formats' own admitted reader; and the view of a week from it. */
function calibrations(base,c,r){
 const cals=new Map([[r.w,base.runCalibration]]);
 const calAt=k=>{if(!cals.has(k)){let cal;try{cal=F.runCalibrationOf({program:c.program,ledger:c.ledger,evidenceRecord:c.evidenceRecord,asOf:c.asOf,weekIndex:k,hold:c.hold===true,engineStatus:c.engineStatus,eligibility:c.eligibility,runFormatRecord:c.formats},c.opts);}catch{cal={status:'UNAVAILABLE',reason:'CALIBRATION_ERROR'};}cals.set(k,cal);}return cals.get(k);};
 // The bands and the capacity of a week: from that week's own calibration when one was made, else from the week before's view of the next.
 const views=new Map(),viewOf=j=>{
  if(views.has(j))return views.get(j);
  const n=!cals.has(j)&&j>0?cals.get(j-1)?.nextWeek:null,cal=n?.week===j?null:calAt(j),v=cal?{capacity:cal.capacity??null,paceBands:cal.paceBands??{},withheld:cal.status==='WITHHELD_HOLD'}:{capacity:n.capacity??null,paceBands:n.paceBands??{},withheld:false};
  views.set(j,v);return v;};
 /** The views of a run of weeks, made in order so that one calibration serves two weeks. */
 const warm=(from,to)=>{for(let j=Math.max(0,from);j<=to;j++)viewOf(j);};
 return {calAt,viewOf,warm};
}
const q8DownOf=cal=>Object.values(isObj(cal?.capacity?.trainingFactors)?cal.capacity.trainingFactors:{}).some(f=>isObj(f)&&(f.withdrawn===true||num(f.fraction)&&f.fraction<0));

// ---------- the forecast of a week ----------
/**
 * The periods a standard reference was in force, from the calibration's own record of changes (`projection.comparisons`), in order: each with
 * its evidence id, date, 10 km equivalent as shown and the last week it was in force. A week with no reference between two periods is kept as a gap.
 */
function referencePeriods(cal,through){
 const periods=[];let current=null;
 for(const ch of list(cal?.projection?.comparisons).filter(isObj).sort((a,b)=>a.week-b.week)){
  const id=ch.to?.evidenceId??null;if(id===(current?.id??null))continue;
  if(current)current.toWeek=ch.week-1;
  current=id?{id,date:ch.to.date,t10Shown:ch.to.tenKEquivalentSeconds,tier:ch.to.confidence??null,fromWeek:ch.week,toWeek:through,afterGap:periods.length>0&&!current}:null;if(current)periods.push(current);
 }
 return periods;
}
/**
 * The forecast as week `j` reads it: what was dated and on record before the week started. `cal` is the calibration of that week over the
 * admitted record. `now`: the immediate withdrawals of today apply (week in force); for an earlier week only what that week itself read.
 * Returns the body of `runForecast` without its head, and `basis`: what race week compares (the reference, its tier, a downward factor).
 */
function forecastAt(j,cal,r,K,{now,withdrawal=null}){
 const {FV,RC,program,asOfDay,startOf}=r,weekStart=startOf(j),started=weekStart<=asOfDay,out=(status,reason,extra={})=>({status,reason,week:j,weekStart,event:r.event,...extra});
 if(!r.event||!FV.events[r.event.kind])return out('NOT_APPLICABLE',r.event?'EVENT_WITHOUT_FORECAST':'NO_RACE_EVENT_IN_THE_PLAN');
 const rw=r.raceWeekIndex;if(rw===null||r.raceWeekByDate===null||r.raceWeekByDate!==rw)return out('NOT_APPLICABLE','RACE_DATE_OUTSIDE_THE_PLANS_RACE_WEEK');
 const est=cal?.estimates?.[r.event.kind]??null,current=est?.status==='AVAILABLE'?{lowSeconds:est.lowSeconds,centralSeconds:est.centralSeconds,highSeconds:est.highSeconds,reference:est.reference,referenceKind:est.referenceKind,referenceDate:est.referenceDate,confidence:est.confidence,margin:est.margin}:null;
 const assess=cal?.assessment?.status==='OFFERED',guidance={meanwhile:FV.notYetInWindow.meanwhile,routes:['REPORT_A_RACE_RESULT_AT_THE_EVENT_DISTANCE',...(assess?['V1RC_FIELD_TEST_AS_OFFERED']:[])],never:['A_LONGER_RUN','MORE_TRAINING','A_RACE_ENTRY','A_TEST_NOT_OFFERED']};
 const none=(reason,extra={})=>out('UNAVAILABLE',reason,{current,guidance,...extra}),withdrawn=reason=>out('UNAVAILABLE',reason,{withdrawn:true});
 // The withdrawals, at once (F8): today's first, then what the plan and the week say. A withdrawal repeats nothing of the estimate.
 if(withdrawal)return withdrawn(withdrawal);
 if(r.experienceKnown&&!experienceOf(r.experience,FV))return withdrawn('EXPERIENCE_NONE');
 if(RC.paceRules.noBandModes.includes(r.modeOf(j))||!r.modeOf(j))return withdrawn('MODE_WALK_JOG_RESTART_RETURN');
 if(r.completion)return withdrawn('COMPLETION_RACE');
 if(now&&asOfDay>r.event.date)return withdrawn('AFTER_THE_RACE_DATE');
 if(j>0&&!started)return withdrawn('WEEK_NOT_STARTED');
 if(j>=rw)return none('RACE_WEEK');
 // QRE-RFC-A-01: what this week read has been reported on since its first day: the week is withdrawn until the next boundary, never changed.
 const changed=now?r.changedSince(started?weekStart:onDate(asOfDay,1)):null;if(changed)return withdrawn(changed==='REPORTS'?'REPORTS_CHANGED_SINCE_THE_WEEK_STARTED':'BREAK_DECLARED_SINCE_THE_WEEK_STARTED');
 // A7: beyond the window the forecast is not yet shown, and says from when.
 const beyond=windowOf(weekStart,r.event.date,program.weeks.map(x=>({startDate:startOf(x.index)})),FV);if(beyond)return out(beyond.status,beyond.reason,{availableFrom:beyond.availableFrom,current,guidance});
 if(!current)return none(est?.reason==='HOLD_NO_PRESCRIPTION'?'HOLD':'CURRENT_ESTIMATE_UNAVAILABLE',{v1rcReason:est?.reason??cal?.reason??null});
 const estimate=unroundedOf(cal,r.event.kind,RC);if(!estimate)return none('CURRENT_ESTIMATE_NOT_REPRODUCED');
 const cutoff=started?weekStart:onDate(asOfDay,1),completed=started?j:0,weeks=r.weeksAt(cutoff,completed),marathon=!FV.events[r.event.kind].trainingGain;
 // The reference in force, and the one pair the response may be updated by (F3): only for a standard reference, read from the calibration itself.
 const cap=cal.capacity??{},evidence=new Map(list(cal.evidence).filter(isObj).map(e=>[e.id,e])),t10Of=id=>{const e=evidence.get(id);return e&&num(e.distanceKm,0.1)&&num(e.seconds,1)?powerLawTime(e.distanceKm,e.seconds,10,RC.model.standard.kCentral):null;};
 const z=FV.response.z,reference={date:est.referenceDate,t10:marathon?null:t10Of(est.reference),sigma:est.margin/z};let pairA=null,previous=null;const pairNotes=[];
 if(!marathon&&est.reference===cap.evidenceId&&num(reference.t10,1)){
  const periods=referencePeriods(cal,j),B=periods.at(-1)??null,group=id=>KIND_GROUP[evidence.get(id)?.kind]??null;
  const eligibleB=B&&B.id===cap.evidenceId&&cap.status==='CALIBRATED'&&group(B.id)&&!list(cap.confidenceCauses).some(x=>NOT_FOR_A_PAIR.includes(x))&&Math.round(reference.t10)===B.t10Shown;
  if(!eligibleB&&periods.length>1)pairNotes.push('REFERENCE_IN_FORCE_NOT_ELIGIBLE_FOR_A_PAIR');
  if(eligibleB){
   const earliest=onDate(program.startDate,-FV.response.earliestReferenceDaysBeforePlanStartMax),gapBefore=k=>periods.slice(k+1).some(p=>p.afterGap);
   // An earlier reference is read from the answer's own record of changes, never from the calibration of a past week (a later correction
   // moves that one). It may be the first end of the pair only when that record shows it came into force at the highest confidence: no
   // reduction of any kind, so its effort was known and maximal, it was measured on a course or a track, and it was neither aged nor in
   // conflict nor after a break; and inside the model's population. Any earlier reference of the same kind serves the slowdown rule.
   const P=RC.model.population,marginOf=t10=>RC.confidence.margin.HIGH+(t10/60>=P.slowRunnerFromTenKEquivalentMinutes?P.slowRunnerExtraMargin:0);
   const eligible=(p,k)=>{
    if(p.id===B.id||!(p.date<B.date)||group(p.id)!==group(B.id)||gapBefore(k))return null;
    const t10=t10Of(p.id);if(!num(t10,1)||Math.round(t10)!==p.t10Shown)return null;
    return {date:p.date,t10,sigma:marginOf(t10)/z,id:p.id,forPair:p.tier==='HIGH'&&t10/60>=P.tenKEquivalentCentralMinutes[0]&&t10/60<=P.tenKEquivalentCentralMinutes[1]};};
   const before=periods.slice(0,-1).map((p,k)=>eligible(p,k));
   previous=before.filter(Boolean).at(-1)??null;
   // No declared break of 7 days or more between the two ends of the pair.
   pairA=before.find(p=>p&&p.forPair&&p.date>=earliest&&!r.breaks.some(b=>b.days>=7&&b.to>p.date&&b.from<B.date))??null;
   if(periods.length>1&&!pairA)pairNotes.push('NO_ELIGIBLE_EARLIER_REFERENCE');
  }
 }
 const input={event:r.event.kind,experience:r.experienceKnown?r.experience:null,unitSeconds:RC.estimates.roundOutwardSeconds[r.event.kind],estimate,weeks:weeks.map(({credits,...x})=>x),completedWeeks:completed,raceWeekIndex:rw,reference,pairA,previous,q8Down:q8DownOf(cal)};
 const core=forecastOf(input,FV);
 if(!core.planScenario)return none(core.reason??'FORECAST_UNAVAILABLE');
 const goal=cal.goal?.kind==='ATHLETE_GOAL'&&cal.goal.event===r.event.kind&&num(cal.goal.goalSeconds,1)?cal.goal.goalSeconds:null,ctx={event:r.event.kind,raceDate:r.event.date};
 // What a range carries when it is shown: its wording and, beside it, where the goal sits against it (A5). A range not shown carries neither.
 const dress=(range,coincide)=>range.status!=='SHOWN'?{...range,statement:null,goalRelation:null}:{...range,...rangeTextOf(range,{...ctx,coincide,goalSeconds:goal},FV)};
 const basis={referenceId:est.reference,tier:est.confidence,q8Down:input.q8Down},shared={current,experience:core.experience,experienceSource:r.experienceKnown?'PLAN_CREATION':'UNKNOWN_READ_AS_'+FV.unknownExperienceUses,display:core.display,flags:core.flags,confidence:core.confidence,
  decomposition:core.decomposition,response:{source:core.common.responseSource,R_c:core.common.R_c,sd:core.common.sd,R_hi:core.common.R_hi,pair:core.common.pair,notes:pairNotes},
  adherence:{weeks:weeks.filter(x=>x.index<completed).map(x=>({week:x.index,phase:x.phase,counted:core.adherence.weeks.some(k=>k.week===x.index),a:x.a,credits:x.credits})),mean:core.adherence.mean,weeksInMean:core.adherence.weeksInMean,unknownSessionCredit},
  basis:{...basis,statement:basisTextOf({referenceKind:est.referenceKind,referenceDate:est.referenceDate},FV)},inputDigest:hash(input)};
 if(marathon){
  // A7: the marathon is shown only as the current marathon estimate; never under either range kind, with no goal relation to a range.
  const m=core.planScenario,withheld=core.status==='WITHHELD_R11_CENTRAL_ABOVE_6H';
  return out(core.status,withheld?'MARATHON_CENTRAL_ABOVE_6H':core.status==='SHOWN'?null:'WIDER_THAN_THE_WIDTH_SHOWN',{...shared,...(withheld?{current:null}:{}),shown:[],observedForecast:null,planScenario:null,guidance:core.status==='SHOWN'?null:guidance,
   marathon:{currentEstimateOnly:true,labelledForecast:false,...(core.status==='SHOWN'?{lowSeconds:m.lowSeconds,centralSeconds:m.centralSeconds,highSeconds:m.highSeconds,width:m.width,wMax:m.wMax,
    statement:FV.requiredText.marathon.replace('<low>-<high>',clock(m.lowSeconds)+'-'+clock(m.highSeconds))}:{}),goalRelation:'NOT_APPLICABLE_V1RC_GOAL_COMPARISON_ONLY'}});
 }
 const same=core.observedForecast.coincidesWithPlanScenario===true;
 return out(core.status,core.status==='SHOWN'?null:'WIDER_THAN_THE_WIDTH_SHOWN',{...shared,shown:core.shown,observedForecast:core.observedForecast.status==='UNAVAILABLE'?core.observedForecast:dress(core.observedForecast,same),
  planScenario:same?{...core.planScenario,statement:null,goalRelation:null,shownAs:'THE_OBSERVED_FORECAST_IT_COINCIDES_WITH'}:dress(core.planScenario,false),guidance:core.status==='SHOWN'?null:guidance,marathon:null});
}
/** Today's immediate withdrawals (F8), in order: a hold, the warning-sign screen, then nothing else that the week itself does not also say. */
function withdrawalNow(base,cal,r=null){
 if(cal?.status==='WITHHELD_HOLD'||['HOLD','CLINICAL_HUMAN_REQUIRED'].includes(base.status))return 'HOLD';
 if(cal?.warningSignScreen?.status==='REQUIRED'||base.runFormat?.warningSignScreen?.status==='REQUIRED')return 'WARNING_SIGN_SCREEN_REQUIRED';
 // A declared break of 14 days or more that is in progress or still to come: both conditions the ranges are said under are known to be false.
 if(r&&r.breaks.some(b=>b.days>=r.RC.withdrawal.breakDaysWithdrawMin&&b.to>=r.asOfDay))return 'DECLARED_BREAK_OF_14_DAYS_OR_MORE';
 return null;
}
/**
 * Race week (A4): the forecast of the last week before RACE_WEEK, read as that week read it, shown frozen only while nothing that week read has
 * been reported on since: a report received from that week's first day on for a session that already had one before it (a correction, a second
 * source, a contradiction), or a break declared since. It is then not shown; it is never shown changed.
 */
function raceWeekAt(base,c,r,K,cal,withdrawal){
 const {FV,startOf}=r,rw=r.raceWeekIndex,last=rw-1,marathon=!FV.events[r.event.kind].trainingGain;
 const common={asOfDay:r.asOfDay,raceDate:r.event.date,raceWeekStart:startOf(rw),lastWeekStart:last>=0?startOf(last):null,marathon,completion:r.completion,withdrawal};
 if(marathon||r.completion||withdrawal||last<0||r.asOfDay>=r.event.date)return raceWeekOf({...common,last:null,now:{},then:{},changedSince:null},FV);
 const then=forecastAt(last,K.calAt(last),r,K,{now:false}),est=cal?.estimates?.[r.event.kind],changed=r.changedSince(startOf(last)),changedSince=changed==='REPORTS'?'REPORTS_CHANGED_SINCE_FROZEN':changed==='BREAK'?'BREAK_DECLARED_SINCE_FROZEN':null;
 return raceWeekOf({...common,last:then,now:{referenceId:est?.reference??null,tier:est?.confidence??null,q8Down:q8DownOf(cal)},then:then.basis??{},changedSince},FV);
}

// ---------- the executions of the harder domains, as pace readers may read them ----------
/**
 * Each execution of a harder domain, with what an insight or a revision may read of it. Admission comes first and from the run formats alone:
 * the execution the composed answer gives for the row, not withheld (`paceWithheld === null`, and not named among the rows withheld), and not
 * refused as pace evidence. Only then is the row's work pace read. The effort the athlete reported is read on every row: it is their word.
 */
function executionsOf(base,r){
 const {RC,program,tz,sessions}=r,T=RC.recalibration.training,domainOf=family=>Object.keys(RC.domains).find(d=>RC.domains[d].class==='HARDER'&&RC.domains[d].families.includes(family))??null,out={};
 for(const o of r.rows){
  const domain=domainOf(o.context?.family);if(!domain)continue;
  const a=o.actual,e=r.executionOf(o.sessionId),mine=!!e&&e.eventId===o.eventId,why=!mine?'NO_EXECUTION_READING':e.paceWithheld??r.withheld.get(o.eventId)??(e.paceEvidence===false?'NOT_PACE_EVIDENCE':null),admitted=mine&&why===null;
  const w=isObj(a.work)?a.work:null,raw=!admitted||!w?null:num(w.paceSecondsPerKm)?w.paceSecondsPerKm:num(w.distanceKm,0.2,60)&&num(w.seconds,30)?w.seconds/w.distanceKm:null,[fastest,slowest]=[120,900];
  const planned=sessions.get(o.sessionId)?.prescription?.work??null,rpe=num(a.rpe,0,10)?a.rpe:num(o.response?.rpe,0,10)?o.response.rpe:null;
  // The calibration's long-bout rule on the planned step, and on every step of the format the session was run in (SSCTR-RWS-A-04).
  const bouts=!!planned&&num(planned.workMinutes,T.everyWorkBoutMinutesMin)&&(!mine||e.expression!=='NATIVE'||list(e.steps).every(x=>num(x.weightSeconds,T.everyWorkBoutMinutesMin*60)));
  const conditions=list(a.conditions).map(upper),comparable=o.context?.mode==='EASY'&&!RC.recalibration.notComparableMeasurements.includes(upper(a.measurement))&&upper(a.gpsQuality)!=='POOR'&&!conditions.some(x=>RC.recalibration.notComparableConditions.includes(x)||RC.evidence.excludedConditions.includes(x))&&w?.walkBreaks!==true;
  (out[domain]??=[]).push({eventId:o.eventId,sessionId:o.sessionId,date:o.localDate,recordedOn:recordedDay(o,tz),week:Number.isInteger(o.context?.weekIndex)?o.context.weekIndex:null,secondsPerKm:num(raw,fastest,slowest)?raw:null,rpe,admitted,withheld:why,
   completed:mine&&e.completed===true,comparable,compatible:o.response?.performance!=='UNDER'&&o.response?.recovery!=='ADVERSE'&&o.response?.nextDayFunction!=='IMPAIRED',effortHarder:o.response?.effort==='HARDER',longBouts:bouts,
   totalWorkMinutes:planned&&num(planned.repetitions,1)&&num(planned.workMinutes,0)?planned.repetitions*planned.workMinutes:null,measurement:upper(a.measurement),gpsGood:['GOOD','OK'].includes(upper(a.gpsQuality)),band:r.deliveredBand(o.sessionId,domain,o.localDate)});
 }
 return out;
}
const derivedBand=b=>b?.status==='AVAILABLE'&&b.basis==='DERIVED_FROM_CAPACITY'?{fastSecondsPerKm:b.fastSecondsPerKm,slowSecondsPerKm:b.slowSecondsPerKm,derived:true}:null;
const factorOf=(capacity,domain)=>{const f=capacity?.trainingFactors?.[domain];return {fraction:num(f?.fraction)?f.fraction:0,withdrawn:f?.withdrawn===true};};
/** Why the insights are withdrawn today (F8: as the forecast, but for the slowdown and the downward factor, which they still explain). */
function insightsWithdrawn(base,cal,r){
 const now=withdrawalNow(base,cal,r);if(now)return now;
 if(r.experienceKnown&&r.experience==='NONE')return 'EXPERIENCE_NONE';
 if(r.RC.paceRules.noBandModes.includes(r.modeOf(r.w))||!r.modeOf(r.w))return 'MODE_WALK_JOG_RESTART_RETURN';
 if(r.startOf(r.w)>r.asOfDay&&r.w>0)return 'WEEK_NOT_STARTED';
 if(r.event){if(r.completion)return 'COMPLETION_RACE';if(r.asOfDay>r.event.date)return 'AFTER_THE_RACE_DATE';if(r.raceWeekIndex!==null&&r.w>=r.raceWeekIndex)return 'RACE_WEEK';}
 const changed=r.changedSince(r.startOf(r.w)<=r.asOfDay?r.startOf(r.w):onDate(r.asOfDay,1));
 return changed==='REPORTS'?'REPORTS_CHANGED_SINCE_THE_WEEK_STARTED':changed==='BREAK'?'BREAK_DECLARED_SINCE_THE_WEEK_STARTED':null;
}
/**
 * The revision of the threshold band from the record (v1-pace-insights.mjs paceRevisionOf): the snapshots of the weeks it reads, from six weeks
 * before the athlete's first answer on record (or from the window of the week in force when there is none) to the week in force.
 */
function revisionOf(base,c,r,K,cal,executions,responses){
 const {PV,RC,program,w,startOf}=r,first=responses.length?Math.max(0,Math.floor(dayGap(program.startDate,responses[0].date)/7)):w,from=Math.max(0,Math.min(first,w)-Math.ceil(PV.windowDays/7)),now=withdrawalNow(base,cal,r);
 K.warm(from,w);
 const weeks=[];for(let j=from;j<=w;j++){const v=K.viewOf(j),f=factorOf(v.capacity,REVISION_DOMAIN);
  weeks.push({index:j,startDate:startOf(j),phase:program.weeks[j].phase,mode:r.modeOf(j),band:derivedBand(v.paceBands?.[REVISION_DOMAIN]),factor:f.fraction,withdrawn:f.withdrawn,referenceId:v.capacity?.evidenceId??null,
   withdrawal:v.withheld||['EFFORT_ONLY','WITHHELD'].includes(v.capacity?.status)?'V1RC_WITHHOLDS':j===w&&now?now:null});}
 const adverse=[...new Set(r.rows.filter(o=>o.response?.recovery==='ADVERSE').map(o=>o.localDate))].sort();
 return paceRevisionOf({now:w,weeks,executions:executions[REVISION_DOMAIN]??[],adverse,breaks:r.breaks,responses,raceDate:r.event?.date??null,experience:r.experienceKnown?r.experience:r.FV.unknownExperienceUses,asOfDay:r.asOfDay,
  screenRequired:now==='WARNING_SIGN_SCREEN_REQUIRED',p3Offered:cal?.assessment?.status==='OFFERED',scope:program.id},PV,RC);
}

// ---------- the three outputs of an answer ----------
/** The extension's part of a result. Never fails the result it is added to: an error here leaves every key below it whole and says unavailable. */
function finish(base,c,A,revision=null){
 if(!A.on.FORECAST&&!A.on.INSIGHTS)return idle(A,null);
 // Only an answer that read the record as admitted and delivered its sessions is read: every other answer of the run formats says why itself.
 if(base?.runFormat?.status!=='ACTIVE'||!isObj(base.runCalibration))return idle(A,'RUN_FORMATS_'+(base?.runFormat?.reason??base?.runFormat?.status??'NOT_ACTIVE'));
 try{
  const r=readingOf(base,c,A);if(!r)return idle(A,'REVIEW_TIME_REQUIRED');
  const cal=base.runCalibration,K=calibrations(base,c,r),out=idle(A,null),stamp={asOf:r.at,week:r.w};
  if(A.on.FORECAST){
   const now=withdrawalNow(base,cal,r),body=forecastAt(r.w,cal,r,K,{now:true,withdrawal:now}),inRaceWeek=!!r.event&&r.raceWeekIndex!==null&&r.raceWeekByDate===r.raceWeekIndex&&r.w>=r.raceWeekIndex&&r.FV.events[r.event.kind];
   const whole={...forecastHead(A),...stamp,...body,raceWeek:inRaceWeek?raceWeekAt(base,c,r,K,cal,now):{status:'NOT_RACE_WEEK'},neverFeeds:clone(r.FV.neverFeeds)};
   out.runForecast={...whole,hash:hash(whole)};
  }
  if(A.on.INSIGHTS){
   const why=insightsWithdrawn(base,cal,r);
   if(why)out.paceInsights={...out.paceInsights,...stamp,status:'UNAVAILABLE',reason:why};
   else{
    const executions=executionsOf(base,r),T=r.RC.recalibration.training,weekStart=r.startOf(r.w),cutoff=weekStart<=r.asOfDay?weekStart:onDate(r.asOfDay,1);
    // The band an execution is read against is the band its session was delivered with in its own week, as the record of formats holds it
    // (with a revision in force that week, the effective band the format was sized by). Never a band worked out again for a past week.
    const bandAt=(domain,e)=>e.band??null;
    const domains=Object.fromEntries(r.PV.domains.map(d=>[d,{executions:executions[d]??[],q8:{applies:T.domains.includes(d),...factorOf(cal.capacity,d)}}]));
    const body={version:PACE_INSIGHTS_VERSION,...head(A),...stamp,status:'ACTIVE',...paceInsightsOf({week:r.w,weekStart,cutoff,domains,bandAt,p3Offered:cal.assessment?.status==='OFFERED',revisionOffered:!!revision?.state?.offer},r.PV,r.RC)};
    out.paceInsights={...body,hash:hash(body)};
   }
  }
  // IC-2, one source of the threshold band: the effective band when a revision is in force this week, else the calibration's own.
  const v1rc=cal.paceBands?.[REVISION_DOMAIN]??null,state=revision?.state??null,fraction=state?state.fractionOn(r.asOfDay>r.startOf(r.w)?r.asOfDay:r.startOf(r.w),r.program.weeks[r.w].phase):0;
  const {fractionOn:_f,fractionAt:_a,bandAt:_x,...told}=state??{};
  out.paceRevision={...out.paceRevision,...stamp,...(state?{...told,reason:null,response:revision.response??null,unreadableResponses:revision.unreadable}:{}),effectivePaceBands:{[REVISION_DOMAIN]:effectiveBand(v1rc,fraction,r.RC)},
   changesOnly:r.PV.athleteConfirmedRevision.changesOnly,neverChanges:clone(r.PV.athleteConfirmedRevision.neverChanges)};
  return out;
 }catch{return idle(A,'FORECAST_ERROR');}
}
const joined=(base,out,record)=>freeze({...base,...out,paceRevisionRecord:clone(list(record))});

/** A first plan: the answer of the run formats, and the forecast the intake's own evidence supports before any week is done. */
export function generateProgram(input,options={}){
 const opts=internal(options),A=authorityOf(opts),base=F.generateProgram(isObj(input)?without(input,MINE):input,opts);
 if(!base?.program)return joined(base,idle(A,'NO_PLAN'),[]);
 const c={program:base.program,ledger:[],formats:base.runFormatRecord,evidenceRecord:base.runEvidenceRecord,asOf:base.program.canonical?.asOf,weekIndex:0,engineStatus:base.status,eligibility:input?.athlete?.eligibility??null,hold:false,opts};
 return joined(base,finish(base,c,A),[]);
}
/**
 * A review: the answer of the run formats on the review without this extension's keys, then the forecast, the insights and the revision of the
 * plan in force, each read from that answer.
 * - With the pace revision on, the athlete's answer to an offer (`paceRevisionResponse`) joins the record only under an instant the answer
 *   below accepted, never earlier than the record already is, and only when it names the offer open this week (or revokes a revision in
 *   force). The run formats are then answered again with the band hook, so the band shown and the band a format was sized by are one.
 */
export function evaluateProgram(program,review,options={}){
 const opts=internal(options),A=authorityOf(opts),carried=isObj(review)&&Array.isArray(review.paceRevisionRecord)?review.paceRevisionRecord:[],plain=isObj(review)?without(review,MINE):review;
 let base=F.evaluateProgram(program,plain,opts);
 if(!isObj(review)||!A.on.FORECAST&&!A.on.INSIGHTS||base?.runFormat?.status!=='ACTIVE')return joined(base,finish(base,null,A),carried);
 const contextOf=b=>({program:F.validProgram(b.proposal)?b.proposal:program,ledger:Array.isArray(b.actualLedger)?b.actualLedger:Array.isArray(plain.actualLedger)?plain.actualLedger:[],formats:b.runFormatRecord,evidenceRecord:b.runEvidenceRecord,asOf:review.asOf,weekIndex:review.weekIndex,
  engineStatus:b.status,eligibility:review.eligibility??null,hold:['HOLD','CLINICAL_HUMAN_REQUIRED'].includes(b.status),opts});
 let c=contextOf(base),record=carried,revision=null;
 if(A.on.REVISION)try{
  const r=readingOf(base,c,A),K=calibrations(base,c,r),cal=base.runCalibration,executions=executionsOf(base,r),tz=r.tz,read=rec=>readResponses(rec,program.athleteId,c.program.id,tz),stateOf=rows=>revisionOf(base,c,r,K,cal,executions,rows);
  let held=read(record),state=stateOf(held.rows),response=null;
  const said=review.paceRevisionResponse;
  if(said!==undefined&&said!==null){
   const asOf=utcTimestamp(review.asOf),ok=isObj(said)&&typeof said.offerId==='string'&&said.offerId.length>0&&said.offerId.length<=ID_MAX&&RESPONSES.includes(said.response);
   const why=!ok?'RESPONSE_UNREADABLE':!asOf||Date.parse(asOf)<held.last?'REVIEW_BEFORE_THE_RECORD':said.response==='REVOKE'?(state.status==='ACTIVE'?null:'NO_REVISION_IN_FORCE'):state.offer?.offerId===said.offerId?null:'NO_SUCH_OFFER_THIS_WEEK';
   if(!why){
    const body={offerId:said.offerId,planId:c.program.id,response:said.response},row={fact:PACE_REVISION_RESPONSE,eventId:responseKey(body),athleteId:program.athleteId,recordedAt:asOf,response:body,inputHash:hash({athleteId:program.athleteId,recordedAt:asOf,response:body})};
    if(!list(record).some(o=>isObj(o)&&o.eventId===row.eventId)){record=[...list(record).map(o=>clone(o)),row];held=read(record);state=stateOf(held.rows);}
    response={recorded:true,offerId:said.offerId,response:said.response};
   }else response={recorded:false,offerId:isObj(said)&&typeof said.offerId==='string'&&said.offerId.length<=ID_MAX?said.offerId:null,response:isObj(said)&&RESPONSES.includes(said.response)?said.response:null,reason:why};
  }
  revision={state,response,unreadable:held.unreadable};
  // IC-2: when a revision gives any delivered week another threshold band, the run formats are answered again with it: the selector and the
  // band shown read one source. The engine's own answer is the same (it reads no option of this extension).
  const delivered=[0,1,2].map(k=>r.w+k).filter(j=>j<c.program.weeks.length),fractionOf=j=>state.fractionOn(j===r.w&&r.asOfDay>r.startOf(j)?r.asOfDay:r.startOf(j),c.program.weeks[j].phase);
  if(delivered.some(j=>fractionOf(j)>0)){
   const again=F.evaluateProgram(program,plain,{...opts,[F.BAND_OF]:({week,domain,band})=>domain===REVISION_DOMAIN&&Number.isInteger(week)&&week>=r.w&&week<c.program.weeks.length?effectiveBand(band,fractionOf(week),r.RC):band});
   if(again?.runFormat?.status==='ACTIVE'&&again.inputHash===base.inputHash){base=again;c=contextOf(base);}
  }
 }catch{revision=null;record=carried;}
 return joined(base,finish(base,c,A,revision),record);
}
/** A new plan from the record: the restart of the run formats, the carried answers kept (they are of the plan they were given for). */
export function restartProgram(input,options={}){
 const opts=internal(options),A=authorityOf(opts),carried=isObj(input)&&Array.isArray(input.paceRevisionRecord)?input.paceRevisionRecord:[],base=F.restartProgram(isObj(input)?{...without(input,MINE),...(isObj(input.intake)?{intake:without(input.intake,MINE)}:{})}:input,opts);
 if(!base?.program)return joined(base,idle(A,'NO_PLAN'),carried);
 const c={program:base.program,ledger:Array.isArray(base.carriedRecord)?base.carriedRecord:Array.isArray(input.record)?input.record:[],formats:base.runFormatRecord,evidenceRecord:base.runEvidenceRecord,asOf:base.program.canonical?.asOf,weekIndex:0,engineStatus:base.status,eligibility:input.intake?.athlete?.eligibility??null,hold:false,opts};
 return joined(base,finish(base,c,A),carried);
}
