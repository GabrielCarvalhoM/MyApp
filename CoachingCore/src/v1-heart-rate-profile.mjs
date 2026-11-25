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
// QRE-HR5R-04: every time is read in the plan's offset (`offsetMinutes`, the program's timezoneOffsetMinutes). A day-only value (a plan made
// from an intake) is that LOCAL day: a row it dates holds from the day's local start, and a reading at it sees the whole local day.
const ms=(v,end,tz)=>{if(typeof v!=='string')return NaN;if(/T/.test(v)){const t=Date.parse(v);return Number.isFinite(t)?t:NaN;}
 const t=Date.parse(v.slice(0,10)+'T00:00:00.000Z');return Number.isFinite(t)?t-tz*60000+(end?86399999:0):NaN;};
const offsetOf=tz=>Number.isInteger(tz)&&Math.abs(tz)<=14*60?tz:0;
const dayOf=(v,tz)=>typeof v!=='string'?null:/T/.test(v)?(Number.isFinite(Date.parse(v))?new Date(Date.parse(v)+tz*60000).toISOString().slice(0,10):null):v.slice(0,10);
const iso=t=>new Date(t).toISOString();

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
/** QRE-HR5R-05: a row's declaration is valid for its source: an INTAKE row is exactly a valid age; an ATHLETE row is a declaration the profile records. */
const validFor=o=>o.source===SOURCES.INTAKE?Object.keys(o.declaration).length===1&&validAge(o.declaration.ageYears)!==null:o.source===SOURCES.ATHLETE&&declarationErrors(o.declaration).length===0;
/** Whether a row is readable: this athlete's, intact, valid for its source, and declared no later than `atMs` (read in the plan's offset). */
export const readableRow=(o,athleteId,atMs,tz=0)=>isObj(o)&&o.fact===HR_PROFILE_DECLARED&&o.athleteId===athleteId&&typeof o.eventId==='string'&&isObj(o.declaration)&&o.inputHash===hash(o.declaration)
 &&Object.values(SOURCES).includes(o.source)&&validFor(o)&&Number.isFinite(ms(o.declaredAt,false,offsetOf(tz)))&&ms(o.declaredAt,false,offsetOf(tz))<=atMs;
const readable=(record,athleteId,atMs,tz)=>(Array.isArray(record)?record:[]).filter(o=>readableRow(o,athleteId,atMs,tz));

/**
 * The profile in force at `at` (an instant, or a local day read through its end): the latest readable value of each fact, in record order. The
 * age in force grows by the whole years elapsed since it was declared (anniversaries of the local declaration day passed), never by a fraction.
 */
export function profileOf(record,{athleteId,at,offsetMinutes=0}){
 const tz=offsetOf(offsetMinutes),atMs=ms(at,true,tz),rows=readable(record,athleteId,atMs,tz);
 let age=null,max=null,custom=null;
 for(const r of rows){const d=r.declaration;
  if(r.source===SOURCES.INTAKE)age={ageYears:d.ageYears,declaredOn:dayOf(r.declaredAt,tz),eventId:r.eventId};
  if(r.source===SOURCES.ATHLETE&&Object.hasOwn(d,'maxHeartRateBpm'))max=d.maxHeartRateBpm===null?null:{bpm:d.maxHeartRateBpm,declaredAt:r.declaredAt,eventId:r.eventId};
  if(r.source===SOURCES.ATHLETE&&Object.hasOwn(d,'zoneUpperBpm'))custom=d.zoneUpperBpm===null?null:{zoneUpperBpm:[...d.zoneUpperBpm],declaredAt:r.declaredAt,eventId:r.eventId};}
 const today=dayOf(at,tz);
 if(age&&today&&age.declaredOn){const [y0,m0,d0]=age.declaredOn.split('-').map(Number),[y,m,d]=today.split('-').map(Number);
  const years=Math.max(0,y-y0-(m<m0||m===m0&&d<d0?1:0));age={...age,ageInForce:age.ageYears+years,wholeYearsElapsed:years};}
 return freeze({version:HR_PROFILE_VERSION,age,declaredMaximum:max,customZones:custom,rows:rows.length,unreadableRows:(Array.isArray(record)?record.length:0)-rows.length});
}
/** The latest instant of the record's VALID rows (QRE-HR5R-05: an altered, invalid or another athlete's row never locks the record). */
const lastOf=(rows,tz)=>{let last=-Infinity;for(const o of rows){const t=ms(o.declaredAt,false,tz);if(t>last)last=t;}return last;};
const nextNumber=record=>1+Math.max(0,...(Array.isArray(record)?record:[]).map(o=>isObj(o)&&/^hrp-\d+$/.test(o.eventId)?Number(o.eventId.slice(4)):0));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
/**
 * QRE-HR5R-08: the record kept to the latest value of each fact (age, maximum, limits) when it reaches its bound: the earlier rows go, the rows in
 * force stay byte for byte (their own ids and hashes), so the profile read is the same and the record never stops accepting the athlete.
 */
function compact(rows){
 const lastBy=k=>rows.filter(k).at(-1);
 const keep=new Set([lastBy(r=>r.source===SOURCES.INTAKE),lastBy(r=>r.source===SOURCES.ATHLETE&&Object.hasOwn(r.declaration,'maxHeartRateBpm')),lastBy(r=>r.source===SOURCES.ATHLETE&&Object.hasOwn(r.declaration,'zoneUpperBpm'))].filter(Boolean));
 return rows.filter(r=>keep.has(r));
}
/**
 * The record after this call: `ageYears` from an intake (a first plan or a restart), and/or the athlete's `declaration`, at the instant `at`.
 * Returns {record, added:[eventId], refused:[{errors}], unchanged:[field]}. An unchanged value is not appended again (the record stays bounded);
 * a refused declaration records nothing. `refuseAll` (a review the engine did not accept) refuses the declaration whole with that reason.
 * The intake's age is a fact of the intake, never refused for time (QRE-HR5R-04): dated no earlier than the record's last row. An athlete's
 * declaration earlier than the record is refused (never backdated). Invalid rows (another athlete's, altered, invalid for their source) are dropped.
 */
export function appendProfile(record,{athleteId,at,ageYears,declaration,refuseAll=null,offsetMinutes=0}){
 const tz=offsetOf(offsetMinutes),added=[],refused=[],unchanged=[];
 const atMs=ms(at,false,tz);
 if(!Number.isFinite(atMs)||typeof athleteId!=='string'){if(declaration!==undefined&&declaration!==null)refused.push({errors:['heartRateProfile.noInstant']});return {record:(Array.isArray(record)?record:[]).map(clone),added,refused,unchanged};}
 // Only valid rows are kept (this athlete's, intact, valid for their source), whatever their time: a row later than `at` makes `at` backdated.
 let out=readable(record,athleteId,Infinity,tz).map(clone),n=nextNumber(record);
 const room=()=>{if(out.length>=PROFILE_LIMITS.rows)out=compact(out);return out.length<PROFILE_LIMITS.rows;};
 if(validAge(ageYears)!==null){
  const now=profileOf(out,{athleteId,at,offsetMinutes:tz});
  if(now.age?.ageInForce===ageYears)unchanged.push('ageYears');
  else if(room()){const last=lastOf(out,tz),when=atMs<last?iso(last):at;const r=rowOf(athleteId,when,SOURCES.INTAKE,{ageYears},n++);out.push(r);added.push(r.eventId);}
  else refused.push({errors:['ageYears.recordFull']});
 }
 if(declaration!==undefined&&declaration!==null){
  const now=profileOf(out,{athleteId,at,offsetMinutes:tz}),behind=atMs<lastOf(out.filter(r=>r.source===SOURCES.ATHLETE),tz);
  const errors=refuseAll?[refuseAll]:behind?['heartRateProfile.beforeTheRecord']:declarationErrors(declaration);
  if(errors.length)refused.push({errors});
  else{
   const d=Object.fromEntries(Object.entries(declaration).filter(([,v])=>v!==undefined)),cur={maxHeartRateBpm:now.declaredMaximum?.bpm??null,zoneUpperBpm:now.customZones?.zoneUpperBpm??null};
   const changed=Object.fromEntries(Object.entries(d).filter(([k,v])=>!same(v,cur[k])));
   for(const k of Object.keys(d))if(!Object.hasOwn(changed,k))unchanged.push(k);
   if(Object.keys(changed).length){if(room()){const r=rowOf(athleteId,at,SOURCES.ATHLETE,changed,n++);out.push(r);added.push(r.eventId);}else refused.push({errors:['heartRateProfile.recordFull']});}
  }
 }
 return {record:out,added,refused,unchanged};
}
/**
 * QRE-HR5R-08: the athlete's erasure of their heart-rate declarations (a maximum and limits they entered): every ATHLETE row goes, history
 * included. The intake's age stays (it is onboarding data, erased with the account). Returns {record, erased:[eventId]}.
 */
export function eraseDeclarations(record,{athleteId}){
 const rows=Array.isArray(record)?record:[],erased=rows.filter(o=>isObj(o)&&o.athleteId===athleteId&&o.source===SOURCES.ATHLETE).map(o=>o.eventId);
 return {record:rows.filter(o=>!(isObj(o)&&o.athleteId===athleteId&&o.source===SOURCES.ATHLETE)).map(clone),erased};
}
