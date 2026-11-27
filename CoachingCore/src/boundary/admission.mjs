// V1 CoachingCore Integration Boundary (Founder mission of 2026-11-23, SEC-O1-03 boundary part): structural admission of what the app hands the
// coach. It decides nothing about training: it refuses, whole and with a reproducible code, a request whose shape or size is not one a real
// report can have, before custody or the engine reads any of it. Nothing is ever truncated or repaired, so no evidence (a stop, an adverse
// response, a correction's target) can be silently lost here: a refused request records nothing and is answered with what to fix.
// The limits are multiples of measured legitimate shapes (scratch measure on 2026-11-23, three synthetic plans, 112 run and 54 strength
// reports: a run report 300 B, depth 2; a strength report 1,434 B, depth 7, arrays of 5, 6 keys per object; at most 6 sessions a week).
import {isYes} from '../r6-clinical.mjs';
export const ADMISSION_VERSION='V1INT-ADMISSION-1';
export const LIMITS=Object.freeze({
 /** One observation as JSON text: ~11x the largest strength report measured; room for ~150 laps of a run. */
 observationBytes:16384,
 /** One request as JSON text (every observation and the review's own fields). */
 requestBytes:131072,
 /** Observations per request: ~5x the most sessions a measured week holds; a HealthKit backfill is sent in chunks of this size. */
 observationsPerRequest:32,
 /** Nesting below the observation (measured 7: observation > actual > exercises > [i] > sets > [j] > load > value). */
 depth:8,
 /** Any one array (measured 5). */
 arrayLength:64,
 /** Keys of any one object (measured 6). */
 keysPerObject:32,
 /** Any string value or key. Identifiers have the engine's own ceiling (a report id is no longer than 128). */
 stringLength:512,idLength:128,
 /** Corrections of one report chain by its speaker (the athlete correcting one session again and again). */
 correctionsPerReport:16,
 /** Distinct device activities linked to one planned session (a run recorded in more than one workout). */
 deviceActivitiesPerSession:4,
 /** New reports one channel makes for one local day (no athlete trains in more than a handful of sessions a day). */
 reportsPerDayPerChannel:8,
 /** Cycle 1 (SEC-INT-05): the intake of a first plan or a restart (measured: 1,128 B, depth 5, arrays of 8 over ten synthetic profiles; a
  * run history brought at onboarding may hold many runs, hence its own array bound). */
 intakeBytes:65536,intakeArrayLength:512,
 /** V1 blocker closure (SEC-INT-07): past `correctionsPerReport` or `reportsPerDayPerChannel`, a report that states a safety signal (a stop, an
  * adverse recovery, an impaired next day) is still admitted, at most this many beyond the limit (the SEC-SC-01 pattern): a signal never loses
  * its route, and the record stays bounded. */
 safetyExcess:3,
});
/** The keys an observation may hold, per channel. Everything else is refused (unknown), or boundary-owned (set by the boundary, never sent). */
export const OBSERVATION_KEYS=Object.freeze({
 ATHLETE:Object.freeze(['sessionId','occurrenceDate','observedAt','actual','response','correctionOf']),
 DEVICE:Object.freeze(['activityId','activityType','sessionId','observedAt','actual','sourceQuality']),
});
/** What only the boundary sets on an observation: identity, author, provenance and the report clocks (C-NCC-3 b: one clock). */
export const BOUNDARY_OWNED=Object.freeze(['eventId','athleteId','reportedAt','correctedAt','source','provider','canonicalActivityId','provenance','context','superseded','supersededBy','supersededAt','conflicted','stale','sourceHash','localDate','fact']);
/** The device qualities a HealthKit workout may state (r6-provenance sourceQuality; the engine's own words). */
export const DEVICE_QUALITIES=Object.freeze(['WEARABLE_FULL','WEARABLE_PARTIAL']);
/** The activity types the V1 device channel admits: running only (strength is logged by the athlete; DR-117-123: HealthKit inbound, iOS). */
export const DEVICE_ACTIVITY_TYPES=Object.freeze(['RUN']);

const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const present=v=>v!==undefined;
/** The structural measure of a JSON value, stopping at the first excess. Returns null or {limit, at}. Never throws (cycles are refused). */
export function structureError(value,{depth=LIMITS.depth,arrayLength=LIMITS.arrayLength,keysPerObject=LIMITS.keysPerObject,stringLength=LIMITS.stringLength}={}){
 const seen=new Set();
 const walk=(v,d,at)=>{
  if(d>depth)return {limit:'depth',at};
  if(typeof v==='string')return v.length>stringLength?{limit:'stringLength',at}:null;
  if(typeof v==='number')return Number.isFinite(v)?null:{limit:'number',at};
  if(v===null||typeof v==='boolean'||v===undefined)return null;
  if(typeof v!=='object')return {limit:'type',at};
  if(seen.has(v))return {limit:'cycle',at};seen.add(v);
  if(Array.isArray(v)){if(v.length>arrayLength)return {limit:'arrayLength',at};for(let i=0;i<v.length;i++){const e=walk(v[i],d+1,`${at}[${i}]`);if(e)return e;}return null;}
  const keys=Object.keys(v);if(keys.length>keysPerObject)return {limit:'keysPerObject',at};
  for(const k of keys){if(k.length>stringLength)return {limit:'stringLength',at:`${at}.<key>`};const e=walk(v[k],d+1,`${at}.${k}`);if(e)return e;}
  return null;
 };
 return walk(value,0,'$');
}
/** The UTF-8 length of a string, counted from its code points (no TextEncoder: a bare JavaScriptCore context has none). A lone surrogate counts
 * 3, as its replacement character would. */
export function utf8Length(s){let n=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);
 if(c<0x80)n+=1;else if(c<0x800)n+=2;else if(c>=0xd800&&c<0xdc00&&i+1<s.length&&(s.charCodeAt(i+1)&0xfc00)===0xdc00){n+=4;i++;}else n+=3;}return n;}
const bytes=v=>{try{const t=JSON.stringify(v);return typeof t==='string'?utf8Length(t):Infinity;}catch{return Infinity;}};
const idOk=v=>typeof v==='string'&&v.length>0&&v.length<=LIMITS.idLength&&!/[\u0000-\u001f]/.test(v);
/** An instant with its offset (Z or ±hh:mm): one without is read in the runtime's own zone (QRE-INT-02, cycle 1). */
const instantOk=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/.test(v)&&Number.isFinite(Date.parse(v));
const dayOk=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'));
/** The names (never the values) of what an observation or review states that the warning-sign screen and SB-1 read: shown on a refusal so the
 * app keeps the athlete's draft and asks again. It is no clinical reading and changes nothing on record. */
export function safetyFieldsOf(x){
 const out=new Set();
 const obs=o=>{if(!isObj(o))return;const a=isObj(o.actual)?o.actual:{},r=isObj(o.response)?o.response:{};
  if(present(a.stop)&&a.stop!==null&&a.stop!==false)out.add('actual.stop');if(r.recovery==='ADVERSE')out.add('response.recovery');if(r.nextDayFunction==='IMPAIRED')out.add('response.nextDayFunction');};
 if(isObj(x)&&Array.isArray(x.observations))x.observations.forEach(obs);else obs(x);
 if(isObj(x))for(const k of ['wellbeing','wellbeingCheck','readiness','interruption','eligibility'])if(present(x[k])&&x[k]!==null)out.add(k);
 // Cycle 1 (SSCTR-INT-01): a review of how the athlete feels, a check, a readiness declaration or a break is itself safety content.
 if(isObj(x)&&SAFETY_KINDS.includes(x.kind))out.add('kind:'+x.kind);
 return [...out].sort();
};
/** The review kinds that are themselves safety content (F08 and a declared break). */
/** V1 blocker closure (SEC-INT-07): whether an observation states a safety signal (what `safetyFieldsOf` names of an observation). */
/** CCP-79 (#79 item 4; Founder decision on #79, 2026-11-27): the eligibility screen the athlete sends with the request states a clinical flag (any flag
 * that means yes in any form, or a clinical status), read exactly as the engine's eligibility gate reads it (r6-adaptation, CLINICAL_KEYS and isYes). */
const SCREEN_FLAGS=Object.freeze(['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern']);
export const screenStatesFlag=el=>isObj(el)&&(SCREEN_FLAGS.some(k=>isYes(el[k]))||['CLINICAL','PAIN_OR_INJURY'].includes(typeof el.status==='string'?el.status.trim().toUpperCase():el.status));
/** `screen`: the eligibility screen of the athlete's own request (CCP-79 item 4: a flag answered yes there is a safety signal too, so an honest "yes"
 * past a limit still reaches the clinical route, at most safetyExcess beyond it). */
export const statesSafetySignal=(o,screen=null)=>{if(screenStatesFlag(screen))return true;if(!isObj(o))return false;const a=isObj(o.actual)?o.actual:{},r=isObj(o.response)?o.response:{};return present(a.stop)&&a.stop!==null&&a.stop!==false||r.recovery==='ADVERSE'||r.nextDayFunction==='IMPAIRED';};
export const SAFETY_KINDS=Object.freeze(['NOT_FEELING_100','WELLBEING_CHECK','READINESS_DECLARATION','RETURN_AFTER_PAUSE']);
/** The intake of a first plan or a restart: its size and structure (cycle 1, SEC-INT-05). Returns null or a refusal. */
export function intakeError(intake){
 if(!isObj(intake))return {code:'INVALID_REQUEST',field:'intake'};
 if(bytes(intake)>LIMITS.intakeBytes)return {code:'LIMIT_EXCEEDED',limit:'intakeBytes'};
 const s=structureError(intake,{arrayLength:LIMITS.intakeArrayLength});return s?{code:'LIMIT_EXCEEDED',limit:s.limit,at:s.at}:null;
}
const refuse=(code,extra={})=>({ok:false,error:{code,...extra}});
/**
 * The shape of one observation from `channel`. Returns {ok:true} or a refusal {code, index, field|limit, at}. It does not build the engine's
 * observation (integration.mjs does) and reads no record.
 */
export function observationError(channel,o,index){
 if(!isObj(o))return {code:'INVALID_OBSERVATION',index};
 const keys=OBSERVATION_KEYS[channel];if(!keys)return {code:'UNKNOWN_CHANNEL',index};
 for(const k of Object.keys(o)){if(!present(o[k]))continue;
  if(BOUNDARY_OWNED.includes(k))return {code:'BOUNDARY_OWNED_FIELD',index,field:k};
  if(!keys.includes(k))return {code:'UNKNOWN_FIELD',index,field:k};}
 if(bytes(o)>LIMITS.observationBytes)return {code:'LIMIT_EXCEEDED',index,limit:'observationBytes'};
 const s=structureError(o);if(s)return {code:'LIMIT_EXCEEDED',index,limit:s.limit,at:s.at};
 if(!isObj(o.actual)||typeof o.actual.completed!=='boolean')return {code:'INVALID_OBSERVATION',index,field:'actual.completed'};
 for(const k of Object.keys(o.actual))if(BOUNDARY_OWNED.includes(k))return {code:'BOUNDARY_OWNED_FIELD',index,field:'actual.'+k};
 if(present(o.response)&&!isObj(o.response))return {code:'INVALID_OBSERVATION',index,field:'response'};
 for(const k of ['sessionId','correctionOf'])if(present(o[k])&&!idOk(o[k]))return {code:'INVALID_IDENTIFIER',index,field:k};
 if(present(o.observedAt)&&!instantOk(o.observedAt))return {code:'INVALID_TIME',index,field:'observedAt'};
 if(present(o.occurrenceDate)&&!dayOk(o.occurrenceDate))return {code:'INVALID_TIME',index,field:'occurrenceDate'};
 if(channel==='DEVICE'){
  if(!idOk(o.activityId))return {code:'INVALID_IDENTIFIER',index,field:'activityId'};
  if(!DEVICE_ACTIVITY_TYPES.includes(o.activityType))return {code:'UNSUPPORTED_ACTIVITY',index,field:'activityType'};
  if(!instantOk(o.observedAt))return {code:'INVALID_TIME',index,field:'observedAt'};
  if(present(o.sourceQuality)&&!DEVICE_QUALITIES.includes(o.sourceQuality))return {code:'INVALID_OBSERVATION',index,field:'sourceQuality'};
 }else if(!present(o.observedAt)&&!present(o.occurrenceDate))return {code:'INVALID_TIME',index,field:'occurrenceDate'};
 return null;
}
/** The whole request: its size, the number of observations, and the structure of every other field of the review. */
export function requestError(review,{observations}){
 if(!isObj(review))return {code:'INVALID_REQUEST'};
 if(observations!==undefined&&!Array.isArray(observations))return {code:'INVALID_REQUEST',field:'observations'};
 if((observations?.length??0)>LIMITS.observationsPerRequest)return {code:'LIMIT_EXCEEDED',limit:'observationsPerRequest'};
 if(bytes(review)>LIMITS.requestBytes)return {code:'LIMIT_EXCEEDED',limit:'requestBytes'};
 const {observations:_o,...rest}=review,s=structureError(rest);if(s)return {code:'LIMIT_EXCEEDED',limit:s.limit,at:s.at};
 return null;
}
export {refuse};
