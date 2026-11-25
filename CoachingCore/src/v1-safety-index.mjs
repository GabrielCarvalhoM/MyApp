// CoachingCore V1 Core Safety & Lifecycle (Founder mission of 2026-11-18, QRE-AIF-01): the composed entry point an integration uses.
// - Underneath is v1-strength-index.mjs, unchanged in this module, and under it the engine. Nothing here plans, prescribes, proposes or screens:
//   every answer is an answer the engine gave.
// - The enabling records of the bound repertoire (R7B0 SSCTR records) carry a review-by date. After that UTC day the repertoire is not valid,
//   and the engine refuses every review and every new plan (UNSUPPORTED, fail closed). Before this module, that refusal also came before the
//   clinical screen: a warning sign reported after the date was answered UNSUPPORTED instead of CLINICAL_HUMAN_REQUIRED (QRE-AIF-01).
// - The precedence this module restores, for a review: input and integrity validation, then the clinical route, then the authority, then any
//   prescription. When the only reason the repertoire is not valid is that its records' dates have passed (the same records, bound to the same
//   catalog bytes, enable it once the dates are set aside), the same review is read again with the dates set aside, and exactly one kind of
//   answer is taken from that reading: CLINICAL_HUMAN_REQUIRED with no proposal, which prescribes and proposes nothing (the answer the engine
//   gives that warning sign, that pain or that standing hold before the date). Any other answer of that reading is discarded and the refusal
//   stands. It is the precedence v1-strength-index.mjs already gives a plan built under other strength rules (SI-V1-SSCTR-SQ-*).
// - A repertoire that is not valid for any other reason (catalog or records missing, altered, vetoed, bound to other bytes) is not expiry: the
//   refusal stands whatever the review says, as before. So do a caller's own repertoire and every new plan (generate, restart): an expired
//   authority makes no plan, and their clinical intake screen already answers before the authority is read.
// - Each answer given while the records are expired carries `authorityExpiry` (status EXPIRED, the review-by dates passed, whether the clinical
//   route answered). No other answer changes, by a byte.
import * as S from './v1-strength-index.mjs';
import {repertoireAuthority} from './r7b-repertoire.mjs';
import {RUN_FORMAT_EMITTED} from './v1-run-format.mjs';
import {freeze} from './value.mjs';
import {appendProfile,profileOf} from './v1-heart-rate-profile.mjs';
import {applyHeartRateProfile} from './v1-heart-rate-zones.mjs';
export * from './v1-strength-index.mjs';
export const SAFETY_LIFECYCLE_ID='V1X-SAFETY-LIFECYCLE-1';
export const V1_CORE_ENGINE=S.V1_STRENGTH_ENGINE+'+'+SAFETY_LIFECYCLE_ID;

const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
/** The UTC calendar day of a decision instant, as the repertoire reads it (r7b-repertoire.mjs utcDayOf). */
const utcDayOf=v=>{if(typeof v!=='string')return null;const t=Date.parse(v);return /T/.test(v)&&Number.isFinite(t)?new Date(t).toISOString().slice(0,10):v.slice(0,10);};
/**
 * Whether the repertoire at this decision instant is refused only because its enabling records' review-by dates have passed: null when it is
 * valid, when the caller supplies its own repertoire, or when it is not valid for another reason (then nothing here applies). Otherwise the
 * expiry, with the repertoire read with the dates set aside.
 */
export function authorityExpiry(options,asOf){
 const opts=isObj(options)?options:{},day=utcDayOf(asOf);
 if(opts.repertoire||opts.authority||!day)return null;
 const dated=repertoireAuthority({...opts,asOf:day});if(dated.valid)return null;
 const undated=repertoireAuthority({...opts,asOf:null});if(!undated.valid)return null;
 const passed=undated.records.filter(r=>typeof r.reviewBy==='string'&&day>r.reviewBy).map(r=>({id:r.id,reviewBy:r.reviewBy}));
 return passed.length?{day,passed,undated}:null;
}
const marker=(e,clinicalRouteAnswered)=>({status:'EXPIRED',asOfDay:e.day,reviewBy:[...new Set(e.passed.map(r=>r.reviewBy))].sort(),records:e.passed.map(r=>r.id),clinicalRouteAnswered});

// V1HR5R (Founder decision FOUNDER-HR5-RUNNA-PARITY-2026-11-25): the athlete's heart-rate profile (v1-heart-rate-profile.mjs). Every answer
// carries `heartRateProfileRecord` (the append-only record of the athlete's age, declared maximum and custom zone limits, which the caller keeps and
// sends back, as runEvidenceRecord) and `heartRateProfileDeclared` (what this call added, refused or found unchanged); its five-zone reading is
// resolved with the profile in force (applyHeartRateProfile). The keys `heartRateProfile` (the athlete's declaration) and `heartRateProfileRecord`
// are taken off what the engine reads, so every plan, decision and record of the engine is the one it makes without them: heart rate changes
// nothing but the five-zone reading. The age comes from the intake (athlete.ageYears) of a first plan or a restart.
const HR_KEYS=['heartRateProfile','heartRateProfileRecord'];
const without=(o,keys)=>isObj(o)?Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k))):o;
const NOT_ACCEPTED=new Set(['INVALID_INPUT','UNSUPPORTED']);
function profiled(base,{athleteId,at,record,ageYears,declaration,options,offsetMinutes=0}){
 if(!isObj(base))return base;
 const refuseAll=typeof athleteId!=='string'?'heartRateProfile.noPlan':NOT_ACCEPTED.has(base.status)?'heartRateProfile.reviewNotAccepted':null;
 let r;try{r=appendProfile(record,{athleteId,at,ageYears:refuseAll?undefined:ageYears,declaration,refuseAll,offsetMinutes});}
 catch{r={record:Array.isArray(record)?record:[],added:[],refused:declaration?[{errors:['heartRateProfile.unreadable']}]:[],unchanged:[]};}
 let rc=base.runCalibration;if(rc!==undefined&&!refuseAll)try{rc=applyHeartRateProfile(rc,profileOf(r.record,{athleteId,at,offsetMinutes}),options);}catch{rc=base.runCalibration;}
 return freeze({...base,...(rc!==undefined?{runCalibration:rc}:{}),heartRateProfileRecord:r.record,heartRateProfileDeclared:{added:r.added,refused:r.refused,unchanged:r.unchanged}});
}
const recordOf=o=>isObj(o)&&Array.isArray(o.heartRateProfileRecord)?o.heartRateProfileRecord:[];
/** A stored run calibration `rc` with its five zones resolved with the profile of `record` at `at` (the integration's setHeartRateProfile, which
 * asks the engine nothing else). */
export const heartRateProfileReading=(rc,record,{athleteId,at,offsetMinutes=0},options={})=>applyHeartRateProfile(rc,profileOf(record,{athleteId,at,offsetMinutes}),options);
/** A first plan: as below. An expired authority makes none (UNSUPPORTED); a clinical intake is answered before the authority is read. A first
 * plan has no profile record yet (QRE-HR5R-05: a record in an intake is never read). */
export function generateProgram(input,options={}){
 const base=S.generateProgram(without(input,HR_KEYS),options),p=base?.program;
 return profiled(base,{athleteId:p?.athleteId,at:p?.canonical?.asOf,offsetMinutes:p?.timezoneOffsetMinutes??0,record:[],ageYears:isObj(input)?input.athlete?.ageYears:undefined,declaration:isObj(input)?input.heartRateProfile:undefined,options});
}
/** A new plan from the record: as below (a clinical hold on record is answered before any plan is made). */
export function restartProgram(input,options={}){
 const intake=isObj(input)?input.intake:undefined,plain=isObj(input)?{...without(input,HR_KEYS),...(isObj(intake)?{intake:without(intake,HR_KEYS)}:{})}:input;
 const base=S.restartProgram(plain,options),p=base?.program;
 return profiled(base,{athleteId:p?.athleteId,at:p?.canonical?.asOf,offsetMinutes:p?.timezoneOffsetMinutes??0,record:recordOf(input),ageYears:isObj(intake)?intake.athlete?.ageYears:undefined,declaration:isObj(input)?input.heartRateProfile??(isObj(intake)?intake.heartRateProfile:undefined):undefined,options});
}
/** A review: as below, with the athlete's heart-rate profile (V1HR5R). */
export function evaluateProgram(program,review,options={}){
 const base=evaluateCore(program,without(review,HR_KEYS),options);
 return profiled(base,{athleteId:isObj(program)?program.athleteId:undefined,at:isObj(review)?review.asOf:undefined,offsetMinutes:isObj(program)?program.timezoneOffsetMinutes??0:0,record:recordOf(review),declaration:isObj(review)?review.heartRateProfile:undefined,options});
}
/** A review: as below, except that after the records' review-by dates the clinical route still answers before the refusal (QRE-AIF-01). */
function evaluateCore(program,review,options={}){
 const base=S.evaluateProgram(program,review,options);
 if(base?.status!=='UNSUPPORTED')return base;
 let e=null;try{e=authorityExpiry(options,isObj(review)?review.asOf:null);}catch{e=null;}
 if(!e)return base;
 let reread=null;try{reread=S.evaluateProgram(program,review,{...(isObj(options)?options:{}),repertoire:e.undated});}catch{reread=null;}
 // Not an expiry when the dates set aside still leave the plan refused (another catalog, policy or rules): the refusal stands, unmarked (SEC-CORE-05).
 if(!reread||reread.status==='UNSUPPORTED')return base;
 // The clinical answer, with every reading the refusal gives in place of those computed with the dates set aside (forecast, insights,
 // calibration, formats, exposure, learning): after the date nothing but the clinical route and the recorded facts comes from that reading (QRE-CORE-06).
 if(reread.status==='CLINICAL_HUMAN_REQUIRED'&&!reread.proposal){
  const out={...reread};for(const k of READINGS){if(k in base)out[k]=base[k];else delete out[k];}
  // Closure-2 (QRE-CORE-R2-01): the record of formats says only what was delivered. The answer delivers the refusal's run sessions, so no
  // format the reading would have emitted is recorded; what the review's reports stated (a symptom stop among it) is recorded as the clinical
  // route records it, and every row the record already held is kept as it was.
  if(Array.isArray(reread.runFormatRecord))out.runFormatRecord=deliveredOnly(reread.runFormatRecord,Array.isArray(base.runFormatRecord)?base.runFormatRecord:isObj(review)&&Array.isArray(review.runFormatRecord)?review.runFormatRecord:[]);
  return freeze({...out,authorityExpiry:marker(e,true)});
 }
 return freeze({...base,authorityExpiry:marker(e,false)});
}
/** A record of formats without the format rows `held` did not already hold (the formats a reading emitted and no answer delivered). */
const deliveredOnly=(record,held)=>{const was=new Set(held.filter(r=>isObj(r)&&r.fact===RUN_FORMAT_EMITTED).map(r=>r.eventId));return record.filter(r=>!(isObj(r)&&r.fact===RUN_FORMAT_EMITTED&&!was.has(r.eventId)));};
/** The readings of an answer that are not the clinical route or the record: after the date they are the refusal's. */
const READINGS=['runSessions','runFormat','runCalibration','runForecast','paceInsights','paceRevision','strengthExposure','updatedModel','qualityAssessment','weekEvidence'];
