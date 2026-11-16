import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {clone,freeze} from './value.mjs';

/**
 * CoachingCore V1 Race Forecast (Founder request of 2026-11-13, handoff r3; phase B of the V1 run extensions): V1X-RUN-FORECAST.
 * The run calibration (V1RC) says what the athlete can run today. This module adds, beside it and never inside it, a bounded envelope of what
 * the plan's race may look like on its date: the current estimate carried forward by a training gain that is capped by experience, scaled by the
 * adherence observed, and never applied to the slow edge.
 * - It is no prediction model and no second trainer: it reads the calibration's current estimate and the plan's weeks as they are, and feeds
 *   nothing (no band, test, estimate, goal comparison, dose, progression, phase, eligibility or race-day mode).
 * - Two ranges, each under its own condition: OBSERVED_FORECAST (the athlete keeps training as observed) and PLAN_SCENARIO (the plan is followed
 *   from now on). Both are plausibility envelopes, never probabilities. The slow edge of both is the current estimate: no improvement is assumed.
 * - The gain already inside the current estimate is never added again: g = Gamma(start of RACE_WEEK) - Gamma(reference date) (handoff 2.2).
 * - Pure functions of what they are given. The values are CoachingCore/v1/RACE_FORECAST_EXTENSION_V1.json (the `values` object of
 *   SSCTR-RFC-DECISION-r2, copied whole), read only as the pinned bytes; each boundary is on only with an independent SSCTR record bound to those
 *   bytes (as V1X-RUN-CALIBRATION and V1X-RUN-NATIVE). Off, nothing is computed.
 * - Every rule and number is SSCTR-RFC-DECISION-r1 as amended by SSCTR-RFC-DECISION-r2, cited here by item (F1-F12, A1-A7).
 * This module imports neither the engine nor the run formats: the composed entry point (v1-run-forecast-index.mjs) hands it plain data.
 */
export const FORECAST_EXTENSION_ID='V1X-RACE-FORECAST-1';
export const FORECAST_VALUES_SHA256='eae0111744d904211963ecc76a964a59d214dd84c541c9ac799480fd3f3de840';
export const FORECAST_VALUES_URL=new URL('../v1/RACE_FORECAST_EXTENSION_V1.json',import.meta.url);
export const FORECAST_RECORDS_URL=new URL('../../audits/v1-run-extensions-2026-11-13/phase-b/reviews/ssctr/SSCTR_V1RFC_RUN_RECORDS.json',import.meta.url);
/** The boundaries, each needing its own enabling record. All three also need V1X-RUN-ESTIMATE (V1RC) and V1X-RUN-NATIVE (the admitted record). */
export const FORECAST_BOUNDARIES=freeze({FORECAST:'V1X-RUN-FORECAST',INSIGHTS:'V1X-PACE-INSIGHTS',REVISION:'V1X-PACE-REVISION'});
export const RUN_FORECAST_VERSION='V1X-RUN-FORECAST-STATE-1';
export const FORECAST_MODEL_ID='SSCTR-RFC-VALUES-r2';

const readBytes=url=>{try{return fs.readFileSync(url);}catch{return null;}};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const parse=bytes=>{try{return JSON.parse(bytes.toString('utf8'));}catch{return null;}};
const BYTES=readBytes(FORECAST_VALUES_URL);
export const FORECAST_VALUES_FILE_SHA256=BYTES?sha256(BYTES):null;
/** The values of a file's bytes, only when they are the pinned bytes. */
export const raceForecastOf=bytes=>bytes&&sha256(bytes)===FORECAST_VALUES_SHA256?freeze(parse(bytes)):null;
export const RACE_FORECAST=raceForecastOf(BYTES);
const RECORD_BYTES=readBytes(FORECAST_RECORDS_URL),DEFAULT_RECORDS=RECORD_BYTES?parse(RECORD_BYTES):null;
const ENABLING=new Set(['APPROVE','APPROVE_WITH_CONDITIONS']),EVIDENCE_OK=new Set(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS']);
/**
 * Per-boundary activation (fail closed): a boundary is on only when the values file is the pinned bytes and every independent SSCTR record bound
 * to that hash for the boundary enables it with supported evidence and at least one source. `options.runForecast` supplies an authority directly
 * (development and tests only). With no record file, every boundary is off.
 */
export function runForecastAuthority(options={}){
 if(options.runForecast)return options.runForecast;
 const records=options.runForecastRecords??DEFAULT_RECORDS,approved={},used=[];
 if(RACE_FORECAST)for(const id of Object.values(FORECAST_BOUNDARIES)){
  const all=(Array.isArray(records?.records)?records.records:[]).filter(r=>r?.boundaryId===id&&r.extensionSha256===FORECAST_VALUES_SHA256);
  const ok=all.length>0&&all.every(r=>r.independent===true&&ENABLING.has(r.disposition)&&EVIDENCE_OK.has(r.evidenceStatus)&&Array.isArray(r.sourceIds)&&r.sourceIds.length>0);
  if(ok){approved[id]=true;used.push(...all.map(r=>({boundaryId:id,disposition:r.disposition,evidenceStatus:r.evidenceStatus,conditions:r.conditions??[],reviewId:r.reviewId??null})));}
 }
 return freeze({id:FORECAST_EXTENSION_ID,valid:!!RACE_FORECAST,sha256:RACE_FORECAST?FORECAST_VALUES_SHA256:null,approved,records:used,values:RACE_FORECAST,source:'CURRENT_INDEPENDENT_REVIEW'});
}
/**
 * Development-only authority: the boundaries named enabled over the file as read, pinned or not. Never sporting evidence. By default the forecast
 * and the insights; the pace revision only when it is named (handoff section 7: it stays off until IC-2 is met in an integration).
 */
export function devRunForecast(enabled=[FORECAST_BOUNDARIES.FORECAST,FORECAST_BOUNDARIES.INSIGHTS],values=null){
 const v=values??(BYTES?parse(BYTES):null);
 return freeze({id:FORECAST_EXTENSION_ID,valid:!!v,sha256:FORECAST_VALUES_FILE_SHA256,approved:Object.fromEntries(enabled.map(id=>[id,true])),records:enabled.map(id=>({boundaryId:id,disposition:'DEV_TEST_ONLY'})),values:v,source:'DEV_TEST_ONLY'});
}
export const allowsForecast=(ext,name)=>!!(ext?.valid&&ext.values&&ext.approved?.[FORECAST_BOUNDARIES[name]]);

// ---------- small values ----------
const EPS=1e-9,DAY=86400000;
const num=(v,lo=-Infinity,hi=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const list=v=>Array.isArray(v)?v:[];
export const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(Date.parse(v+'T00:00:00Z')).toISOString().slice(0,10)===v;
export const onDate=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*DAY).toISOString().slice(0,10);
export const dayGap=(start,end)=>Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/DAY);
/** A time as it is shown: h:mm:ss from one hour, m:ss below. */
export const clock=s=>{const t=Math.round(s),h=Math.floor(t/3600),m=Math.floor(t%3600/60),x=t%60;return (h?h+':'+String(m).padStart(2,'0'):String(m))+':'+String(x).padStart(2,'0');};
const TIERS=['HIGH','MODERATE','LOW'];
const RACE_NAMES=freeze({'5K':'your 5K','10K':'your 10K',HALF_MARATHON:'your half marathon',MARATHON:'your marathon'});

// ---------- adherence credit (A6; handoff IC-1) ----------
/**
 * V5 of the preflight, the one named point: a reported session the record cannot read as an execution (a native session read UNKNOWN, or a row
 * in conflict) earns nothing from its distance or its minutes. How its week counts it has two implementable readings, both kept here:
 * - 'ZERO': the session stays in the week's planned minutes with credit 0 (the conservative side for a forecast: the fast edge only slows);
 * - 'EXCLUDED': the session is left out of both sides of the week's ratio.
 * The value below is provisional: the SSCTR that judges this candidate decides it, and its answer stands without another cycle.
 */
export const unknownSessionCredit='ZERO';
/**
 * The forecast's credit of one planned run session, in [0, 1]: extent only, never intensity; the first applicable rule wins (values
 * forecast.adherence.sessionCredit). It feeds the forecast alone: never dose, progression, the engine's adherence or completion, or any reading
 * of the plan. `s`: {planned (minutes), reported, completed (the engine's reading of the row, never a field the report carries), unknown,
 * actualMin, steps [{kind, w, targetMet, repOfRepeatedBlock, target, measured}], targetKm, actualKm}.
 */
export function sessionCredit(s){
 if(!isObj(s)||s.reported!==true)return {c:0,rule:'MISSING_REPORT'};
 if(s.completed===true)return {c:1,rule:'COMPLETED'};
 if(s.unknown===true)return {c:0,rule:'UNKNOWN_EXECUTION'};
 const main=list(s.steps).filter(x=>isObj(x)&&(x.kind==='WORK'||x.kind==='STEADY')&&num(x.w,EPS)),total=main.reduce((n,x)=>n+x.w,0);
 if(main.length&&total>0){
  // Met is 1; a repetition of a repeated block that was not met is 0 (it is the unit of an interval session); any other step not met earns the
  // part of its own extent that was measured, in its own unit, and nothing when none was measured.
  const met=x=>x.targetMet===true?1:x.repOfRepeatedBlock===true?0:num(x.measured,0)&&num(x.target,EPS)?Math.min(1,x.measured/x.target):0;
  return {c:Math.min(1,main.reduce((n,x)=>n+x.w*met(x),0)/total),rule:'RWS_STEPS_EXTENT'};
 }
 if(num(s.targetKm,EPS)&&num(s.actualKm,0))return {c:Math.min(1,s.actualKm/s.targetKm),rule:'DISTANCE_TARGET_MEASURED_DISTANCE'};
 return {c:num(s.planned,EPS)&&num(s.actualMin,0)?Math.min(s.actualMin,s.planned)/s.planned:0,rule:'MINUTES'};
}
/**
 * The adherence of one week: a = sum(planned minutes x credit) / sum(planned minutes), planned minutes being the canonical planning dose of each
 * planned run session. Null when the week plans no run minutes (it is then not counted, and left out of the mean).
 */
export function weekAdherence(sessions,{unknown=unknownSessionCredit}={}){
 let planned=0,credited=0;const credits=[];
 for(const s of list(sessions)){
  if(!isObj(s)||!num(s.planned,EPS))continue;const k=sessionCredit(s);
  credits.push({sessionId:s.sessionId??null,plannedMinutes:s.planned,c:k.c,rule:k.rule,...(k.rule==='UNKNOWN_EXECUTION'?{counted:unknown!=='EXCLUDED'}:{})});
  if(k.rule==='UNKNOWN_EXECUTION'&&unknown==='EXCLUDED')continue;
  planned+=s.planned;credited+=s.planned*k.c;
 }
 return {plannedMinutes:planned,creditedMinutes:credited,a:planned>0?credited/planned:null,credits};
}
/** f(a): nothing below a_min, everything from a_full, a straight line between (F4). */
export const fOf=(a,V)=>{const {aMin,aFull}=V.adherence;return !num(a)||a<aMin?0:a>=aFull-EPS?1:(a-aMin)/(aFull-aMin);};
/** Gamma: the gain ceiling of an experience class reached after H effective weeks (F2). */
export const gammaOf=(H,G,tau)=>G*(1-Math.exp(-H/tau));
/** The experience class the gain ceiling is read for: the class of the plan's creation; unknown reads EXPERIENCED; NONE has no forecast (null). */
export const experienceOf=(x,V)=>V.noForecastExperience.includes(x)?null:x in V.gainCeilingLogTime?x:V.unknownExperienceUses;
const capTier=(tier,cap)=>TIERS[Math.max(TIERS.indexOf(TIERS.includes(tier)?tier:'LOW'),TIERS.indexOf(cap))];

// ---------- the forecast (F1-F8, A1, A2) ----------
/**
 * The two ranges of one week, from plain data. Nothing here decides whether a forecast may be shown at all (the withdrawals, the window and race
 * week are the caller's, `forecastStateOf`); this is the arithmetic and the reading of its own result.
 * `x`:
 * - `event`, `experience` (the class of the plan's creation), `unitSeconds` (the calibration's outward rounding for the event);
 * - `estimate` {lower, central, upper, tier}: the calibration's current estimate of the event, unrounded, with its confidence tier;
 * - `weeks` [{index, startDate, phase, zeroCredit, planned, a}]: every week of the plan in force. `a` is the adherence observed in a completed
 *   week (null when it planned no run minutes); `zeroCredit` marks a week under a hold or in a walk/jog, restart or return mode;
 * - `completedWeeks`: how many weeks are finished at the start of the week in force (the weeks with a lower index);
 * - `raceWeekIndex`: the week RACE_WEEK starts;
 * - `reference` {date, t10, sigma}: the calibration's reference in force (its date, its 10 km equivalent central time, its margin / z);
 * - `pairA` {date, t10, sigma} or null: the earlier end of the one eligible pair (its eligibility by kind and quality is the caller's);
 * - `previous` {t10} or null: the most recent eligible reference of the same kind before the reference in force (the slowdown rule);
 * - `q8Down`: a downward training factor of the calibration is in force in any domain.
 * A reference dated inside a week that is not finished is outside what the decision reviewed (A1, its one condition): nothing is computed.
 */
export function forecastOf(x,V){
 const E=V.events[x?.event],exp=experienceOf(x?.experience,V),est=x?.estimate,u=x?.unitSeconds;
 if(!E)return {status:'NOT_APPLICABLE',reason:'EVENT_WITHOUT_FORECAST'};
 if(!exp)return {status:'UNAVAILABLE',reason:'EXPERIENCE_NONE'};
 if(!isObj(est)||!num(est.lower,1)||!num(est.central,est.lower)||!num(est.upper,est.central)||!num(u,1)||!isObj(x.reference)||!isoDay(x.reference.date))return {status:'UNAVAILABLE',reason:'CURRENT_ESTIMATE_UNAVAILABLE'};
 const G=V.gainCeilingLogTime[exp],tau=V.tauWeeks,Rv=V.response,n=x.completedWeeks,rw=x.raceWeekIndex,weeks=list(x.weeks),gamma=H=>gammaOf(H,G,tau);
 const counted=w=>V.countedPhases.includes(w.phase)&&!w.zeroCredit&&w.planned!==false&&w.index<rw,done=weeks.filter(w=>w.index<n&&counted(w)&&num(w.a,0)).sort((a,b)=>a.index-b.index);
 // A1: at a reference date, every counted week whose first day is on or before it (the week that holds the reference is credited as observed);
 // at a week start, every counted week already finished.
 const unfinished=d=>weeks.some(w=>w.index>=n&&w.startDate<=d),Hat=d=>done.filter(w=>w.startDate<=d).reduce((s,w)=>s+fOf(w.a,V),0);
 if(unfinished(x.reference.date)||x.pairA&&unfinished(x.pairA.date))return {status:'UNAVAILABLE',reason:'REFERENCE_INSIDE_AN_UNFINISHED_WEEK'};
 const Hnow=done.reduce((s,w)=>s+fOf(w.a,V),0),Href=Hat(x.reference.date),future=weeks.filter(w=>w.index>=n&&counted(w)).length;
 // The slowdown rule (F3): the reference in force 3% or more slower than the previous eligible one of its kind assumes no gain.
 const before=x.previous??x.pairA??null,slowerBy=before&&num(before.t10,1)&&num(x.reference.t10,1)?x.reference.t10/before.t10-1:null,slow=slowerBy!==null&&slowerBy>=V.slowdown.fractionAtLeast-EPS;
 // The response (F3): the prior, updated by one pair of references of the same kind, at least 28 days and 0.005 of Gamma apart.
 let Rc=Rv.priorCentral,sd=Rv.priorSd,pair=null,source='PRIOR';
 if(x.pairA&&num(x.pairA.t10,1)&&num(x.reference.t10,1)){
  const HA=Hat(x.pairA.date),dGamma=gamma(Href)-gamma(HA),days=dayGap(x.pairA.date,x.reference.date);
  pair={H_A:HA,H_B:Href,T10_A:x.pairA.t10,T10_B:x.reference.t10,dGamma,days,slowerByFraction:x.reference.t10/x.pairA.t10-1,used:false};
  if(!slow&&days>=Rv.minPairDays&&dGamma>=Rv.minDeltaGamma-EPS&&num(x.pairA.sigma,0)&&num(x.reference.sigma,0)){
   const Robs=Math.log(x.pairA.t10/x.reference.t10)/dGamma,variance=(x.pairA.sigma**2+x.reference.sigma**2)/dGamma**2,w0=1/Rv.priorSd**2,w1=variance>0?1/variance:0;
   if(w1>0){Rc=Math.min(1,Math.max(0,(Rv.priorCentral*w0+Robs*w1)/(w0+w1)));sd=(w0+w1)**-0.5;pair={...pair,Robs,sdObs:Math.sqrt(variance),used:true};source='PRIOR_UPDATED_BY_ONE_PAIR';}
  }
 }
 const Rhi=Math.min(1,Rc+Rv.z*sd);
 // No gain at all (both ranges): the marathon, a slowdown, a downward training factor in force. Adherence never overrides them.
 const flags=[...(!E.trainingGain?[E.flag]:[]),...(slow?[V.slowdown.flag]:[]),...(x.q8Down===true?[V.q8DownInForce.flag]:[])],zero=flags.length>0;
 const U=zero?0:gamma(Hnow)-gamma(Href),floor=v=>Math.floor(v/u+1e-9)*u,ceil=v=>Math.ceil(v/u-1e-9)*u,nearest=v=>Math.round(v/u)*u;
 const range=(kind,futureAdherence,fFuture,conditionalOn,extra={})=>{
  const Hrw=Hnow+future*fFuture,F=zero?0:gamma(Hrw)-gamma(Hnow),g=zero?0:U+F,low=est.lower*Math.exp(-Rhi*g),central=est.central*Math.exp(-Rc*g),high=est.upper;
  const lowSeconds=floor(low),centralSeconds=nearest(central),highSeconds=ceil(high),width=highSeconds/lowSeconds-1;
  return {kind,futureAdherence,fFuture,...extra,H_eff_raceWeekStart:Hrw,F_future:F,g_applied:g,unrounded:{low,central,high},width,wMax:E.wMax,status:width<=E.wMax+1e-12?'SHOWN':'TOO_UNCERTAIN_TO_SHOW',
   forecastSeconds:[lowSeconds,centralSeconds,highSeconds],lowSeconds,centralSeconds,highSeconds,interval:clone(V.ranges.interval),conditionalOn};
 };
 const planScenario=range(V.ranges.planScenario.kind,V.ranges.planScenario.futureAdherence,1,V.ranges.planScenario.conditionalOn),O=V.ranges.observedForecast;
 // A2: the observed forecast from two completed counted weeks: the mean adherence of the last four at most, then f once.
 const last=done.slice(-V.adherence.futureFromLastCountedWeeksMax),mean=last.length?last.reduce((s,w)=>s+w.a,0)/last.length:null;
 const observedForecast=done.length>=O.minCompletedCountedWeeks?range(O.kind,mean,fOf(mean,V),O.conditionalOn,{weeksInMean:last.length}):{kind:O.kind,status:O.beforeThat.status,reason:O.beforeThat.reason,completedCountedWeeks:done.length,needed:O.minCompletedCountedWeeks};
 const available=observedForecast.status!=='UNAVAILABLE',same=available&&(observedForecast.fFuture>=1-EPS||observedForecast.forecastSeconds.every((v,i)=>v===planScenario.forecastSeconds[i]));
 if(available)observedForecast.coincidesWithPlanScenario=same;
 const marathon=!E.trainingGain,display=marathon?'CURRENT_MARATHON_ESTIMATE_ONLY_NEVER_LABELLED_FORECAST':!available?'PLAN_SCENARIO_ONLY':same?'ONE_RANGE_OBSERVED_FORECAST_COINCIDES_WITH_PLAN_SCENARIO':'BOTH_RANGES';
 // What is shown, in order: the observed forecast first; the plan scenario beside it only when it differs; each range whole or not at all.
 const shown=marathon?[]:[...(available&&observedForecast.status==='SHOWN'?[O.kind]:[]),...(!same&&planScenario.status==='SHOWN'?[planScenario.kind]:[])];
 const status=marathon?(num(E.centralMaxSeconds)&&nearest(est.central)>E.centralMaxSeconds?'WITHHELD_R11_CENTRAL_ABOVE_6H':planScenario.status):shown.length?'SHOWN':'TOO_UNCERTAIN_TO_SHOW';
 const gained=Math.max(planScenario.g_applied,available?observedForecast.g_applied:0)>0;
 return {status,event:x.event,experience:exp,display,shown,flags,gZeroReason:flags[0]??null,confidence:gained?V.confidence.withGain:capTier(est.tier,'MODERATE'),
  common:{completedCountedWeeks:done.length,H_eff_reference:Href,H_eff_now:Hnow,gamma_reference:gamma(Href),gamma_now:gamma(Hnow),U_unobserved:U,futureCountedWeeks:future,pair,R_c:Rc,sd,R_hi:Rhi,R_slowEdge:Rv.slowEdgeR,responseSource:source,flags},
  decomposition:{O:pair?Math.log(pair.T10_A/pair.T10_B):null,U,F:{planScenario:planScenario.F_future,observedForecast:available?observedForecast.F_future:null},g:{planScenario:planScenario.g_applied,observedForecast:available?observedForecast.g_applied:null},gZeroReason:flags[0]??null},
  planScenario,observedForecast,adherence:{weeks:done.map(w=>({week:w.index,a:w.a,f:fOf(w.a,V)})),mean,weeksInMean:last.length}};
}

// ---------- goal, window, race week (A4, A5, A7) ----------
/** A5: where the goal sits against the rounded low and high of one shown range, inclusive; never against the central. */
export const goalRelationOf=(goalSeconds,range)=>!num(goalSeconds,1)||!isObj(range)||!num(range.lowSeconds,1)||!num(range.highSeconds,range.lowSeconds)?null:goalSeconds<range.lowSeconds?'FASTER_THAN_RANGE':goalSeconds>range.highSeconds?'SLOWER_THAN_RANGE':'INSIDE_RANGE';
/** A7: the first week start of the plan on or after (race date - 112 days), or null when the plan has none. */
export const availableFromOf=(weeks,raceDate,V)=>{const from=onDate(raceDate,-V.horizonDaysMax);return list(weeks).map(w=>w.startDate).filter(d=>isoDay(d)&&d>=from).sort()[0]??null;};
/** A7: a race further than the window from the first day of the week in force: no forecast yet, and the day one appears; null inside the window. */
export const windowOf=(weekStart,raceDate,weeks,V)=>{const days=dayGap(weekStart,raceDate);return days>V.horizonDaysMax?{status:V.notYetInWindow.status,reason:`${days} days > ${V.horizonDaysMax}`,availableFrom:availableFromOf(weeks,raceDate,V)}:null;};
/**
 * A4: what race week may show of the forecast: the observed forecast that was SHOWN for the last week before RACE_WEEK, frozen: its low and
 * high, dated, with no central and no goal relation, from the first day of RACE_WEEK to the day before race day, and never a pacing source.
 * `x`: {asOfDay, raceDate, raceWeekStart, lastWeekStart, last (the forecast of that last week, or null), marathon, completion, withdrawal (a
 * reason, when any withdrawal applies now), now {referenceId, tier, q8Down}, then {referenceId, tier, q8Down}, changedSince (a reason, when the
 * record that last week read has been reported on since)}.
 */
export function raceWeekOf(x,V){
 const shownThrough=onDate(x.raceDate,-1),base={from:x.raceWeekStart,through:shownThrough,goalRelation:'NOT_SHOWN_IN_RACE_WEEK',pacingSource:V.raceWeek.pacingSource},no=reason=>({status:'NOT_SHOWN',reason,...base});
 if(x.marathon)return no('MARATHON');
 if(x.completion)return no('COMPLETION_RACE');
 if(x.asOfDay>=x.raceDate)return no(x.asOfDay===x.raceDate?'RACE_DAY':'AFTER_THE_RACE_DATE');
 if(x.withdrawal)return no('WITHDRAWN_'+x.withdrawal);
 const o=x.last?.observedForecast;
 if(!x.last||x.last.status!=='SHOWN'||!o||o.status!=='SHOWN')return no('LAST_FORECAST_NOT_SHOWN');
 if(!(o.g_applied>0))return no('LAST_FORECAST_HAD_NO_GAIN');
 if(x.now?.referenceId!==x.then?.referenceId)return no('REFERENCE_CHANGED_SINCE_FROZEN');
 if(x.now?.tier!==x.then?.tier)return no('CONFIDENCE_CHANGED_SINCE_FROZEN');
 if(x.now?.q8Down===true&&x.then?.q8Down!==true)return no('TRAINING_FACTOR_DOWN_SINCE_FROZEN');
 if(x.changedSince)return no(x.changedSince);
 return {status:'SHOWN_FROZEN',...base,notOn:x.raceDate,order:['V1RC_CURRENT_ESTIMATE','V1RC_RACE_DAY_TEXT','V1RC_PACING_CAUTION','FROZEN_FORECAST'],
  frozenRange:{lowSeconds:o.lowSeconds,highSeconds:o.highSeconds,centralShown:V.raceWeek.display.central},forecastOf:x.lastWeekStart,label:`Forecast of ${x.lastWeekStart}; not updated in race week`,
  statement:V.requiredText.raceWeek.replace('<date>',x.lastWeekStart).replace('<low>-<high>',clock(o.lowSeconds)+'-'+clock(o.highSeconds)),interval:clone(V.ranges.interval)};
}

// ---------- texts (F11, A2, A5, A7) ----------
/** The required wording of one shown range, with its goal relation when the athlete has a goal for the event (A5: beside its own range). */
export function rangeTextOf(range,{event,raceDate,coincide=false,goalSeconds=null},V){
 const T=V.requiredText,span=clock(range.lowSeconds)+'-'+clock(range.highSeconds),fill=t=>t.replace('<n>',String(range.weeksInMean??'')).replace('<race>',RACE_NAMES[event]??'your race').replace('<date>',raceDate).replace('<low>-<high>',span);
 const relation=goalRelationOf(goalSeconds,range),word={FASTER_THAN_RANGE:'faster than',INSIDE_RANGE:'within',SLOWER_THAN_RANGE:'slower than'}[relation];
 return {statement:fill(range.kind===V.ranges.planScenario.kind?T.planScenario:coincide?T.coincide:T.observedForecast),
  goalRelation:relation?{relation,goalSeconds,against:'ROUNDED_LOW_AND_HIGH_INCLUSIVE',styling:'NEUTRAL',statement:T.goal.replace('<time>',clock(goalSeconds)).replace('faster than / within / slower than',word)}:null};
}
/** The wording of the basis every shown range carries: the reference and its date; never a probability. */
export const basisTextOf=({referenceKind,referenceDate},V)=>V.requiredText.basis.replace('<reference>',({RACE_RESULT:'race result',FIELD_TEST:'field test',TIME_TRIAL:'time trial',PERSONAL_BEST:'best time'})[referenceKind]??'result').replace('<date>',referenceDate??'');
