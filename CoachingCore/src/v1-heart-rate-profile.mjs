import {clone,freeze,hash} from './value.mjs';

/**
 * CoachingCore V1 athlete heart-rate profile (Founder decision FOUNDER-HR5-RUNNA-PARITY-2026-11-25, mission V1HR5R): the athlete's own heart-rate
 * facts the five zones are computed from, kept as an append-only record the caller carries and sends back (as runEvidenceRecord):
 * - the age collected at onboarding (intake `athlete.ageYears`, 18-80), appended by a first plan or a restart when it differs from the one in force;
 * - an explicit maximum the athlete enters (`maxHeartRateBpm`, a whole bpm), or null to clear it;
 * - custom zone limits (`zoneUpperBpm`: the highest whole bpm of Z1..Z4, strictly increasing), or null to clear them.
 * A row is the athlete's (source ATHLETE) or the intake's (source INTAKE); the engine never writes a maximum or a limit of its own, so an explicit
 * override is never overwritten automatically: it stays until the athlete changes or clears it. Rows are read only when they are this athlete's,
 * intact (inputHash), and declared no later than the instant read. Nothing here plans, prescribes or screens.
 */
export const HR_PROFILE_DECLARED='V1HR5R-HEART-RATE-PROFILE-DECLARED';
export const HR_PROFILE_VERSION='V1HR5R-HEART-RATE-PROFILE-1';
/** What an athlete's declaration may state. */
export const DECLARATION_FIELDS=freeze(['maxHeartRateBpm','zoneUpperBpm']);
export const PROFILE_LIMITS=freeze({ageYears:[18,80],maxHeartRateBpm:[120,230],zoneUpperBpm:[60,230],zoneLimits:4,rows:128});
export const SOURCES=freeze({INTAKE:'INTAKE',ATHLETE:'ATHLETE'});

const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const whole=(v,[lo,hi])=>Number.isInteger(v)&&v>=lo&&v<=hi;
// A day-only instant (a plan made from an intake) is that day: a row it dates holds from the day's start, and a reading at it sees the whole day.
const ms=(v,end)=>{if(typeof v!=='string')return NaN;const t=Date.parse(/T/.test(v)?v:v+(end?'T23:59:59.999Z':'T00:00:00.000Z'));return Number.isFinite(t)?t:NaN;};
const rowMs=v=>ms(v,false),readMs=v=>ms(v,true);
const dayOf=v=>typeof v==='string'?(/T/.test(v)?new Date(Date.parse(v)).toISOString().slice(0,10):v.slice(0,10)):null;

/** An age as the intake states it: a whole number of years inside the V1 range, else null (the intake's own validation refuses it). */
export const validAge=v=>whole(v,PROFILE_LIMITS.ageYears)?v:null;
/**
 * The errors of one athlete declaration (an empty list when it can be recorded). The whole declaration is refused on any error: nothing is ever
 * applied in part, coerced ("188"), rounded (187.6) or repaired (limits out of order).
 */
export function declarationErrors(d){
 if(!isObj(d))return ['heartRateProfile.object'];
 const errors=[],keys=Object.keys(d).filter(k=>d[k]!==undefined);
 if(!keys.length)errors.push('heartRateProfile.empty');
 for(const k of keys)if(!DECLARATION_FIELDS.includes(k))errors.push('heartRateProfile.unknownField');
 if(keys.includes('maxHeartRateBpm')&&d.maxHeartRateBpm!==null&&!whole(d.maxHeartRateBpm,PROFILE_LIMITS.maxHeartRateBpm))errors.push('maxHeartRateBpm.wholeBpm120to230');
 if(keys.includes('zoneUpperBpm')&&d.zoneUpperBpm!==null){
  const z=d.zoneUpperBpm;
  if(!Array.isArray(z)||z.length!==PROFILE_LIMITS.zoneLimits)errors.push('zoneUpperBpm.fourLimits');
  else if(!z.every(v=>whole(v,PROFILE_LIMITS.zoneUpperBpm)))errors.push('zoneUpperBpm.wholeBpm60to230');
  else if(!z.every((v,i)=>i===0||v>z[i-1]))errors.push('zoneUpperBpm.strictlyIncreasing');
 }
 return [...new Set(errors)];
}
const rowOf=(athleteId,at,source,declaration,n)=>({fact:HR_PROFILE_DECLARED,version:HR_PROFILE_VERSION,eventId:'hrp-'+String(n).padStart(4,'0'),athleteId,declaredAt:at,source,declaration:clone(declaration),inputHash:hash(declaration)});
/** Whether a row is readable: this athlete's, intact, and declared no later than `atMs`. */
export const readableRow=(o,athleteId,atMs)=>isObj(o)&&o.fact===HR_PROFILE_DECLARED&&o.athleteId===athleteId&&typeof o.eventId==='string'&&isObj(o.declaration)&&o.inputHash===hash(o.declaration)
 &&Object.values(SOURCES).includes(o.source)&&Number.isFinite(rowMs(o.declaredAt))&&rowMs(o.declaredAt)<=atMs;

/**
 * The profile in force at `at` (an instant, or a day read through its end): the latest readable value of each fact, in record order. The age in
 * force grows by the whole years elapsed since it was declared (anniversaries of the declaration day passed), never by a fraction.
 */
export function profileOf(record,{athleteId,at}){
 const atMs=readMs(at),rows=(Array.isArray(record)?record:[]).filter(o=>readableRow(o,athleteId,atMs));
 let age=null,max=null,custom=null;
 for(const r of rows){const d=r.declaration;
  if(r.source===SOURCES.INTAKE&&validAge(d.ageYears)!==null)age={ageYears:d.ageYears,declaredOn:dayOf(r.declaredAt),eventId:r.eventId};
  if(r.source===SOURCES.ATHLETE&&Object.hasOwn(d,'maxHeartRateBpm'))max=d.maxHeartRateBpm===null?null:{bpm:d.maxHeartRateBpm,declaredAt:r.declaredAt,eventId:r.eventId};
  if(r.source===SOURCES.ATHLETE&&Object.hasOwn(d,'zoneUpperBpm'))custom=d.zoneUpperBpm===null?null:{zoneUpperBpm:[...d.zoneUpperBpm],declaredAt:r.declaredAt,eventId:r.eventId};}
 const today=dayOf(at);
 if(age&&today){const [y0,m0,d0]=age.declaredOn.split('-').map(Number),[y,m,d]=today.split('-').map(Number);
  const years=Math.max(0,y-y0-(m<m0||m===m0&&d<d0?1:0));age={...age,ageInForce:age.ageYears+years,wholeYearsElapsed:years};}
 return freeze({version:HR_PROFILE_VERSION,age,declaredMaximum:max,customZones:custom,rows:rows.length,unreadableRows:(Array.isArray(record)?record.length:0)-rows.length});
}
/** The latest instant the record holds (a declaration is never recorded before it). */
const lastOf=(record,athleteId)=>{let last=-Infinity;for(const o of Array.isArray(record)?record:[])if(isObj(o)&&o.athleteId===athleteId){const t=rowMs(o.declaredAt);if(t>last)last=t;}return last;};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/**
 * The record after this call: `ageYears` from an intake (a first plan or a restart), and/or the athlete's `declaration`, at the instant `at`.
 * Returns {record, added:[eventId], refused:[{errors}], unchanged:[field]}. An unchanged value is not appended again (the record stays bounded);
 * a refused declaration records nothing. `refuseAll` (a review the engine did not accept) refuses the declaration whole with that reason.
 */
export function appendProfile(record,{athleteId,at,ageYears,declaration,refuseAll=null}){
 const out=(Array.isArray(record)?record:[]).map(clone),added=[],refused=[],unchanged=[];
 const atMs=rowMs(at);
 if(!Number.isFinite(atMs)||typeof athleteId!=='string'){if(declaration!==undefined&&declaration!==null)refused.push({errors:['heartRateProfile.noInstant']});return {record:out,added,refused,unchanged};}
 const now=profileOf(out,{athleteId,at}),behind=atMs<lastOf(out,athleteId);
 if(validAge(ageYears)!==null&&!behind){
  if(now.age?.ageInForce===ageYears)unchanged.push('ageYears');
  else if(out.length<PROFILE_LIMITS.rows){const r=rowOf(athleteId,at,SOURCES.INTAKE,{ageYears},out.length+1);out.push(r);added.push(r.eventId);}
 }
 if(declaration!==undefined&&declaration!==null){
  const errors=refuseAll?[refuseAll]:behind?['heartRateProfile.beforeTheRecord']:out.length>=PROFILE_LIMITS.rows?['heartRateProfile.recordFull']:declarationErrors(declaration);
  if(errors.length)refused.push({errors});
  else{
   const d=Object.fromEntries(Object.entries(declaration).filter(([,v])=>v!==undefined)),cur={maxHeartRateBpm:now.declaredMaximum?.bpm??null,zoneUpperBpm:now.customZones?.zoneUpperBpm??null};
   const changed=Object.fromEntries(Object.entries(d).filter(([k,v])=>!same(v,cur[k])));
   for(const k of Object.keys(d))if(!Object.hasOwn(changed,k))unchanged.push(k);
   if(Object.keys(changed).length){const r=rowOf(athleteId,at,SOURCES.ATHLETE,changed,out.length+1);out.push(r);added.push(r.eventId);}
  }
 }
 return {record:out,added,refused,unchanged};
}
