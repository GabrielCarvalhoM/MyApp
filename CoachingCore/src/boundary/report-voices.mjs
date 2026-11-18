// V1 Core Safety & Lifecycle (QRE-RWS-F-01, closure (a) of E01_PATCH_CLOSURE §4; IOS_RUN_REPORT_INTEGRATION_CONTRACT §2): the ingest guard of the
// two voices of a run. The domain layer (or custody) calls it for every run report before it reaches the engine, with the channel the report came
// in by (a HealthKit query or the app's form). It decides nothing about training and changes no report: it refuses a report whose fields are not
// its channel's, so no comparability fact one voice states can be overwritten in the engine's merge by the other voice (the merge keeps one value
// per field). It uses the engine's own reading of who speaks (v1-run-format.mjs speakerOf), never a vocabulary of its own.
//   DEVICE (an HKWorkout): an identified activity (source.activityId and canonicalActivityId, equal), never a provider of the athlete's own; only what
//     the device measured. Never conditions, walk breaks, a stop, effort (rpe) or any response other than UNKNOWN.
//   ATHLETE (the app's form): no activity id in any field, no source other than the athlete's own; only what the athlete declares. Never gpsQuality
//     or a measurement, which are the device's.
// What it does not settle (open, recorded in the closure report): the field in which an athlete states the running surface (treadmill, track)
// apart from the device's `measurement` (E01_PATCH_CLOSURE §4.1, last clause): no such field exists, and inventing one is not this guard's to do.
import {speakerOf,SPEAKER} from '../v1-run-format.mjs';
export const REPORT_VOICES_VERSION='VF-APP-REPORT-VOICES-1';
export const CHANNELS=Object.freeze(['DEVICE','ATHLETE']);
/** The comparability and declaration facts only the athlete states (contract §2; QRE-RWS-F-01). */
export const ATHLETE_ONLY=Object.freeze(['conditions','walkBreaks','stop','rpe']);
/** The facts only the device measures (contract §2; E01_PATCH_CLOSURE §4.1). */
export const DEVICE_ONLY=Object.freeze(['gpsQuality','measurement']);
const RESPONSE_KEYS=['performance','recovery','effort','nextDayFunction'];
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const present=v=>v!==undefined&&v!==null;
/** The fields of `report` that are not its channel's; an empty list admits it. Never throws. */
export function voiceErrors(channel,report){
 if(!CHANNELS.includes(channel))return ['channel'];
 if(!isObj(report)||!isObj(report.actual))return ['report'];
 const errors=[],a=report.actual,speaker=speakerOf(report);
 if(channel==='DEVICE'){
  if(!(typeof speaker==='string'&&speaker.startsWith(SPEAKER.DEVICE)))errors.push('source.identifiedActivity');
  for(const k of ATHLETE_ONLY)if(present(a[k]))errors.push('actual.'+k);
  if(isObj(report.response))for(const k of RESPONSE_KEYS)if(present(report.response[k])&&report.response[k]!=='UNKNOWN')errors.push('response.'+k);
 }else{
  if(speaker!==SPEAKER.ATHLETE)errors.push('source.notTheAthlete');
  for(const k of DEVICE_ONLY)if(present(a[k]))errors.push('actual.'+k);
 }
 return errors;
}
/** The guard: {ok:true} or {ok:false, code:'REPORT_VOICE_MIXED', errors}. */
export function checkReportVoice(channel,report){
 const errors=voiceErrors(channel,report);
 return errors.length?{ok:false,code:'REPORT_VOICE_MIXED',errors}:{ok:true};
}
