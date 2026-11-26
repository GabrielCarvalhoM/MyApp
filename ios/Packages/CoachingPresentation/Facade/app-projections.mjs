// RepMile V1 shared app-facade projections (ABC foundation consolidation, 2026-11-26; CHG-UI-2 items 2.1, 2.2, 2.4 and the time-in-zone port).
//
// What this is: read-only application code over what the frozen boundary already returns (`integration.read` / `integration.visible`,
// `integration.presentation`) and re-exports of frozen engine functions. Front A links this file VERBATIM into its production bundle, beside its
// own facade, and calls it on its serial engine queue; front C decodes its outputs with the CoachingPresentation Swift types. The integration
// mission owns this file (contract §10); neither front edits it.
//
// What this is not: a sporting rule, a second engine, a copy of a frozen table, or a writer. Nothing here changes a record, a plan or a decision,
// and no CoachingCore byte is changed by it. Every projection names only fields the record holds, under the athlete's own read; boundary-reserved
// keys (provenance, context, source, sourceHash, ...) never cross to Swift (GAP-06 acceptance).
import {signsFor,exerciseSignsFor,READINESS_SIGNS,CONDITIONS,intentsFor,WARNING_SIGNS,EXERCISE_SIGNS} from '../../../../CoachingCore/src/v1-f08.mjs';
import {classifySamples} from '../../../../CoachingCore/src/v1-heart-rate-zones.mjs';

export const PROJECTIONS_VERSION='RM-APP-PROJECTIONS-1';
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const num=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
const str=v=>typeof v==='string'&&v.length?v:null;
const upper=v=>typeof v==='string'?v.trim().toUpperCase():null;

/** The channel of one voice: the device channel's qualities are the engine's WEARABLE_* words; MANUAL is the athlete's own form. */
const voiceChannel=q=>typeof q==='string'&&q.startsWith('WEARABLE')?'DEVICE':'ATHLETE';
/** The channel a single-voice row came in on, from the boundary's own source (never from a payload field). */
const rowChannel=r=>r.source?.provider==='HEALTHKIT'||typeof r.canonicalActivityId==='string'||r.provenance?.provider==='HEALTHKIT'?'DEVICE':'ATHLETE';
const setOf=s=>isObj(s)?{reps:Number.isInteger(s.reps)?s.reps:null,load:isObj(s.load)&&num(s.load.value)!==null&&str(s.load.unit)?{value:s.load.value,unit:s.load.unit,convention:str(s.load.convention)}:null,rir:num(s.rir)}:null;
const exercisesOf=a=>Array.isArray(a.exercises)?a.exercises.filter(x=>isObj(x)&&str(x.id)).map(x=>({id:x.id,sets:Array.isArray(x.sets)?x.sets.map(setOf).filter(Boolean):[]})):null;
const responseOf=r=>isObj(r)?{performance:str(r.performance),recovery:str(r.recovery),effort:str(r.effort),nextDayFunction:str(r.nextDayFunction)}:null;
/** What one voice stated, by its channel: a device states only what it measured; the athlete never states a measured distance. */
function voiceOf(eventId,channel,a,response){
 return channel==='DEVICE'
  ?{eventId,channel,completed:a.completed===true,minutes:num(a.minutes),measuredKm:num(a.distanceKm),declaredKm:null,measurement:str(a.measurement),gpsQuality:str(a.gpsQuality),rpe:null,stopReason:null,exercises:null,response:null}
  :{eventId,channel,completed:a.completed===true,minutes:num(a.minutes),measuredKm:null,declaredKm:num(a.manualDistanceKm)??num(a.distanceKm),measurement:null,gpsQuality:null,rpe:num(a.rpe),
    stopReason:isObj(a.stop)?upper(a.stop.reason)??'UNSTATED':null,exercises:exercisesOf(a),response:responseOf(response)};
}

/**
 * CHG-UI-2 2.1 (GAP-06, GAP-12): the athlete's own logged sessions as the record keeps them (`integration.visible(doc)`), in record order.
 * - One entry per kept, non-fact row. A report the engine kept inside another row (O-1 voices, or a same-instant unplanned report) is a `voice`
 *   of that row; a screen shows "saved" for a report only when `keepsReport` says so (GAP-12 rule), never because an answer listed it in
 *   `recorded`.
 * - Distances keep who stated them: `measuredKm` (the device channel) and `declaredKm` (the athlete); the athlete's contest of a measured
 *   distance is `contested`. The UI never merges them into one number.
 * - Athlete-only facts (rpe, stop, response, exercises) appear only when the athlete's voice is in the row, read from that voice.
 * - QRE-ABC-01: when the voices disagree (`conflicted`, e.g. the device recorded 40 min completed and the athlete reported a stop for a symptom
 *   at 5 min), `completed`/`minutes` at the top are the engine's reading of the row; a screen that shows a conflicted row shows BOTH voices
 *   (each with its own completed, minutes and stop) and never only the top line. `stopReason` at the top is the athlete's, whenever stated.
 */
export function loggedEntries(visibleRows){
 const rows=(Array.isArray(visibleRows)?visibleRows:[]).filter(r=>isObj(r)&&!r.fact&&str(r.eventId));
 return rows.map(r=>{
  const a=isObj(r.actual)?r.actual:{},ctx=isObj(r.context)?r.context:{},parts=isObj(r.provenance?.parts)?r.provenance.parts:null;
  const voices=parts?Object.entries(parts).map(([id,p])=>voiceOf(id,voiceChannel(p?.sourceQuality),isObj(p?.actual)?p.actual:{},p?.response))
   :[voiceOf(r.eventId,rowChannel(r),a,r.response)];
  // SSCTR-ABC-S5: the athlete's own facts are read from the athlete's own voice (its part of a merged row), never from the engine's merge.
  const athletePart=parts?Object.entries(parts).find(([,p])=>voiceChannel(p?.sourceQuality)==='ATHLETE')?.[1]:null;
  const aa=athletePart&&isObj(athletePart.actual)?athletePart.actual:a,ar=athletePart?athletePart.response:r.response;
  const athlete=voices.find(v=>v.channel==='ATHLETE')??null,device=voices.find(v=>v.channel==='DEVICE')??null;
  const unplanned=ctx.sessionType==='UNPLANNED'||!str(r.sessionId);
  const sport=upper(ctx.sport)??upper(a.sport)??(device&&!athlete?'RUN':null);
  return {eventId:r.eventId,sessionId:str(r.sessionId),date:str(r.localDate)??String(r.occurrenceDate??r.observedAt??'').slice(0,10),
   observedAt:str(r.observedAt),channels:[...new Set(voices.map(v=>v.channel))].sort(),sport,unplanned,
   completed:a.completed===true,minutes:num(a.minutes),measuredKm:device?.measuredKm??null,declaredKm:athlete?.declaredKm??null,
   contested:athlete&&isObj(aa.declared)&&num(aa.declared.distanceKm)!==null?{distanceKm:aa.declared.distanceKm,reason:str(aa.declared.reason)}:null,
   measurement:device?.measurement??null,gpsQuality:device?.gpsQuality??null,
   rpe:athlete?num(aa.rpe):null,stopReason:athlete&&isObj(aa.stop)?upper(aa.stop.reason)??'UNSTATED':null,
   exercises:athlete?exercisesOf(aa):null,response:athlete?responseOf(ar):null,
   voices,
   // GAP-12 / FND-ABC-01: the engine keeps two unplanned reports of the same local day and instant as ONE row (the later one becomes a voice
   // of the first, even across sports). Such a row is shown as the record keeps it; the reports inside it are not separate sessions.
   unplannedMerge:unplanned&&voices.length>1,
   superseded:r.superseded===true,correctionOf:str(r.correctionOf),conflicted:r.conflicted===true};
 });
}
/** Whether the record keeps a report the answer named as its own session (GAP-12): its own row, or a voice of a PLANNED session (O-1: the
 * device and the athlete on one session). A report merged into another unplanned row is not kept as a session: false. */
export const keepsReport=(entries,eventId)=>entries.some(e=>e.eventId===eventId||!e.unplanned&&e.voices.some(v=>v.eventId===eventId));

/**
 * CHG-UI-2 2.2 (GAP-07): the plan's weeks with the engine's own phase and planned volume (`program.weeks[]`), and whether each is the current
 * week, past, or ahead. Phases are codes (copy by code in C); a field the plan does not hold is null, never derived from the sessions.
 */
export function weekPlan(doc,{today}={}){
 const p=doc?.program;if(!isObj(p)||!Array.isArray(p.weeks))return {programHash:null,weeks:[]};
 const end=d=>new Date(Date.parse(d+'T00:00:00Z')+6*864e5).toISOString().slice(0,10);
 return {programHash:str(p.hash),startDate:str(p.startDate),weeks:p.weeks.map((w,index)=>({index,startDate:str(w.startDate),phase:str(w.phase),
  plannedRunMinutes:num(w.plannedRunMinutes),plannedStrengthSets:num(w.plannedStrengthSets),
  timing:!str(today)||!str(w.startDate)?null:today<w.startDate?'AHEAD':today>end(w.startDate)?'PAST':'CURRENT'}))};
}

/**
 * CHG-UI-2 2.4 (GAP-03): the warning signs the engine asks for one condition, in the engine's order (`v1-f08.mjs signsFor`, frozen): 9, 13 or 15
 * signs, and the exercise-response signs. `READINESS` gives the 15 the readiness declaration reads. The UI never holds a copy of this table, asks
 * exactly these, and never sends a sign it did not ask (an unasked sign is not "no"; an unanswered one is a question again).
 */
export function warningSignSet(condition){
 if(condition==='READINESS')return {condition:'READINESS',warningSigns:[...READINESS_SIGNS],exerciseSigns:[],intents:[]};
 if(!CONDITIONS.includes(condition))return {condition,error:'UNKNOWN_CONDITION',known:[...CONDITIONS]};
 return {condition,warningSigns:signsFor(condition),exerciseSigns:exerciseSignsFor(condition),intents:intentsFor(condition)};
}
/** Every condition's set, for a fixture or a cache keyed by the projections version. */
export const warningSignSets=()=>[...CONDITIONS,'READINESS'].map(warningSignSet);
export const SIGN_VOCABULARY=Object.freeze({warningSigns:Object.values(WARNING_SIGNS),exerciseSigns:Object.values(EXERCISE_SIGNS)});

/**
 * Time in zone (mission phase 6.3): the distribution of ONE authorised heart-rate series over the five zones the engine computed, by the engine's
 * own classifier (`classifySamples`, frozen; nothing here classifies). The zones are the current reading's (`readings.runCalibration
 * .heartRateFiveZones.zones`); none, or a reading not AVAILABLE, gives UNAVAILABLE with the engine's reason. Never from an average.
 *
 * Gate: the series channel is not reviewed (SSCTR C10: the classifier's limits are placeholders). Until a reviewed record enables it, the
 * answer is `{status:'UNAVAILABLE', reason:'SERIES_CHANNEL_NOT_REVIEWED', engine:<what the classifier would say>}`; `enabled` is set only by
 * the integration mission after that review, never by a front.
 */
/** The gate (QRE-ABC-04): a module constant, changed only by the integration mission, in a reviewed commit, after SSCTR C10. Never a parameter. */
export const TIME_IN_ZONE_GATE=Object.freeze({enabled:false,record:null});
export function timeInZones(readings,series,{durationSeconds=null}={}){return timeInZonesOf(readings,series,{durationSeconds,enabled:TIME_IN_ZONE_GATE.enabled});}
/** REVIEW AND TEST ONLY (never linked into a production call path; front A's gate greps for it): the same reading with the gate open, so the
 * C10 review can see what the engine classifier would give. */
export const timeInZonesForReviewOnly=(readings,series,{durationSeconds=null}={})=>timeInZonesOf(readings,series,{durationSeconds,enabled:true});
function timeInZonesOf(readings,series,{durationSeconds=null,enabled=false}={}){
 const z=readings?.runCalibration?.heartRateFiveZones;
 if(!isObj(z))return {status:'UNAVAILABLE',reason:'NO_FIVE_ZONE_READING',fromAverageHeartRate:false};
 if(z.status!=='AVAILABLE'||!Array.isArray(z.zones))return {status:'UNAVAILABLE',reason:z.reason??'ZONES_UNAVAILABLE',fromAverageHeartRate:false};
 const engine=classifySamples(z.zones,series,{durationSeconds});
 // SSCTR-ABC-S3: the gated answer carries no distribution at all (nothing a screen could show by mistake).
 if(!enabled)return {status:'UNAVAILABLE',reason:'SERIES_CHANNEL_NOT_REVIEWED',fromAverageHeartRate:false};
 return {...engine,fromAverageHeartRate:false};
}
