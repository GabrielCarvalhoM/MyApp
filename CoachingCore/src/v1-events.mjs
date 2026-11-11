import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {clone,freeze} from './value.mjs';

/**
 * CoachingCore V1 Final Closure (Founder request of 2026-11-11): the V1 event extension (V1X-EVENTS). The R6 policy and the bound catalog cover the
 * 10K and the half marathon; the catalog names the 5K as a later gate and the marathon as unsupported. This module adds both as the smallest extension
 * of the same event recipe (phases, ladders by time and effort cue, taper, race week, race day, post-event): a file of values
 * (CoachingCore/v1/EVENT_EXTENSION_V1.json), used only when its exact bytes are read and an independent SSCTR record bound to those bytes enables the
 * event (per event, fail closed, as the R6 envelope records are read for the policy). Without the record a 5K keeps its R7-B fallback (a performance
 * plan, the race as context) and a marathon stays outside (UNSUPPORTED at intake).
 * Nothing here changes the R6 policy file or its hash: the values are merged into the operational view the planner reads.
 */
export const EVENT_EXTENSION_ID='V1X-EVENTS-1';
export const EXTENSION_SHA256='e53a282dc6b8dc652564173141256411186094339476c852f307a6ff36c97a2b';
export const EXTENSION_URL=new URL('../v1/EVENT_EXTENSION_V1.json',import.meta.url);
export const EVENT_RECORDS_URL=new URL('../../audits/coachingcore-v1-final-closure-2026-11-11/reviews/ssctr/SSCTR_V1FC_EVENT_RECORDS.json',import.meta.url);
/** The boundary each extension event needs an enabling record for. */
export const EVENT_BOUNDARIES=freeze({'5K':'V1X-5K',MARATHON:'V1X-MARATHON'});
/** What the planner needs to know about each event kind: the R6 kinds as the policy holds them, and the extension kinds. */
export const EVENT_RECIPES=freeze({
 '10K':{quality:'TEN_K',family:'TEN_K_SPECIFIC',cue:'TEN_K_EFFORT',ladder:'tenKSpecificLadder',name:'10K',hold:'hard but controlled'},
 HALF_MARATHON:{quality:'HALF_MARATHON',family:'HALF_MARATHON_SPECIFIC',cue:'HALF_MARATHON_EFFORT',ladder:'halfMarathonSpecificLadder',name:'half marathon',hold:'steady-hard'},
 '5K':{quality:'FIVE_K',family:'FIVE_K_SPECIFIC',cue:'FIVE_K_EFFORT',ladder:'fiveKSpecificLadder',name:'5K',hold:'hard but controlled'},
 MARATHON:{quality:'MARATHON',family:'MARATHON_SPECIFIC',cue:'MARATHON_EFFORT',ladder:'marathonSpecificLadder',name:'marathon',hold:'steady and controlled'}});
export const EVENT_KINDS=freeze(Object.keys(EVENT_RECIPES));
export const EVENT_SPECIFIC_FAMILIES=freeze(Object.values(EVENT_RECIPES).map(r=>r.family));
export const recipeOf=kind=>EVENT_RECIPES[kind]??null;
export const recipeOfFamily=family=>Object.values(EVENT_RECIPES).find(r=>r.family===family)??null;

const readBytes=url=>{try{return fs.readFileSync(url);}catch{return null;}};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const BYTES=readBytes(EXTENSION_URL);
export const EXTENSION_FILE_SHA256=BYTES?sha256(BYTES):null;
const parse=bytes=>{try{return JSON.parse(bytes.toString('utf8'));}catch{return null;}};
/** The extension values, only when the file is the reviewed bytes. */
export const EXTENSION=BYTES&&EXTENSION_FILE_SHA256===EXTENSION_SHA256?freeze(parse(BYTES)):null;
const RECORD_BYTES=readBytes(EVENT_RECORDS_URL),DEFAULT_RECORDS=RECORD_BYTES?parse(RECORD_BYTES):null;
const ENABLING=new Set(['APPROVE','APPROVE_WITH_CONDITIONS']),EVIDENCE=new Set(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS']);

/**
 * Per-event activation (fail closed): an event of the extension is planned only when the extension file is the pinned bytes and an independent SSCTR
 * record bound to that hash enables its boundary with supported evidence and at least one source. `options.eventExtension` supplies an authority
 * object directly (development and tests only, as `options.authority` does for the policy).
 */
export function eventExtensionAuthority(options={}){
 if(options.eventExtension)return options.eventExtension;
 const records=options.eventRecords??DEFAULT_RECORDS,approved={},used=[];
 if(EXTENSION)for(const id of Object.values(EVENT_BOUNDARIES)){
  const all=(Array.isArray(records?.records)?records.records:[]).filter(r=>r?.boundaryId===id&&r.extensionSha256===EXTENSION_SHA256);
  // A record bound to these bytes that does not enable vetoes its event, whatever else approves it.
  const ok=all.length>0&&all.every(r=>r.independent===true&&ENABLING.has(r.disposition)&&EVIDENCE.has(r.evidenceStatus)&&Array.isArray(r.sourceIds)&&r.sourceIds.length>0);
  if(ok){approved[id]=true;used.push(...all.map(r=>({boundaryId:id,disposition:r.disposition,evidenceStatus:r.evidenceStatus,conditions:r.conditions??[],reviewId:r.reviewId??null})));}
 }
 return freeze({id:EVENT_EXTENSION_ID,valid:!!EXTENSION,sha256:EXTENSION?EXTENSION_SHA256:null,approved,records:used,values:EXTENSION,source:'CURRENT_INDEPENDENT_REVIEW'});
}
/** Development-only authority: both events enabled over the file as read, pinned or not. Never sporting evidence. */
export function devEventExtension(enabled=Object.values(EVENT_BOUNDARIES)){
 const values=BYTES?parse(BYTES):null;
 return freeze({id:EVENT_EXTENSION_ID,valid:!!values,sha256:EXTENSION_FILE_SHA256,approved:Object.fromEntries(enabled.map(id=>[id,true])),records:enabled.map(id=>({boundaryId:id,disposition:'DEV_TEST_ONLY'})),values,source:'DEV_TEST_ONLY'});
}
/** Whether an event kind may be planned as an event: the R6 kinds always (their own boundary is R6-EVENT-TRANSITION), an extension kind by its record. */
export const allowsEvent=(ext,kind)=>!EVENT_BOUNDARIES[kind]?['10K','HALF_MARATHON'].includes(kind):!!(ext?.valid&&ext.approved?.[EVENT_BOUNDARIES[kind]]);
/** The binding a program planned for an extension event carries, and the check a review makes of it (fail closed). */
export const extensionBinding=ext=>({id:EVENT_EXTENSION_ID,sha256:ext?.sha256??null});

const merged=new WeakMap();
/**
 * The operational view the planner reads: the R6 policy with the extension's values under the same event-keyed maps, for the events enabled. The R6
 * values are never changed (the half marathon's completion threshold and every 10K value are restated from the policy), so a 10K or half-marathon
 * program is byte for byte what it was. Cached per policy object and enabled set.
 */
export function extendPolicy(policy,ext){
 if(!policy?.operational)return policy;
 const kinds=Object.keys(EVENT_BOUNDARIES).filter(k=>allowsEvent(ext,k)),key=(ext?.sha256??'-')+'|'+kinds.join(',');
 let by=merged.get(policy);if(!by){by=new Map();merged.set(policy,by);}
 if(by.has(key))return by.get(key);
 const op=policy.operational,R=op.run,E=op.event,X=ext?.values??{};
 const V={'5K':X.fiveK,MARATHON:X.marathon},on=kinds.filter(k=>V[k]),pick=f=>Object.fromEntries(on.map(k=>[k,f(V[k],k)]).filter(([,v])=>v!==undefined));
 const run={...R,longRunTargets:{...R.longRunTargets,...pick(v=>v.longRunTarget)},effortCues:{...R.effortCues,...Object.fromEntries(on.map(k=>[EVENT_RECIPES[k].cue,V[k].effortCue]))},
  ...Object.fromEntries(on.map(k=>[EVENT_RECIPES[k].ladder,clone(V[k].specificLadder)]))};
 const event={...E,raceWeekTouch:{...E.raceWeekTouch,...pick(v=>clone(v.raceWeekTouch))},specificWeeks:{...E.specificWeeks,...pick(v=>v.specificWeeks)},taperWeeks:{...E.taperWeeks,...pick(v=>v.taperWeeks)},
  raceDay:{...E.raceDay,windowMinutes:{...E.raceDay.windowMinutes,...pick(v=>v.raceDayWindowMinutes)},warmupMinutes:{...E.raceDay.warmupMinutes,...pick(v=>v.raceDayWarmupMinutes)}},
  // Read by kind where the R6 policy has one value: the completion threshold of the long run, the days without running after the race, the taper
  // points of a taper longer than one week, and the run days below which the plan says so.
  completionLongRunBelowMinutes:{HALF_MARATHON:E.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes,...pick(v=>v.completionLongRunBelowMinutes)},
  postEventFirstRunMinDaysAfterRaceByKind:pick(v=>v.postEventFirstRunMinDaysAfterRace),taperPoints:pick(v=>v.taperPoints?clone(v.taperPoints):undefined),
  minimumRunDays:{'10K':2,HALF_MARATHON:3,...pick(v=>v.minimumRunDays)},
  // SSCTR V1FC B3: the long-run target that is a cap only (its "peak below target" note is keyed to the completion threshold), the executed long run
  // below which keeping the race is cautioned, the post-event weeks (easy only through day 14 after a marathon) and the days without strength.
  longRunTargetIsCapOnly:pick(v=>v.longRunTargetIsCapOnly===true?true:undefined),keepCautionLongRunBelowMinutes:pick(v=>v.keepCautionLongRunBelowMinutes),
  postEventWeeks:pick(v=>v.postEventWeeks),postEventStrengthMinDaysAfterRaceByKind:pick(v=>v.postEventStrengthMinDaysAfterRace)};
 const out={...policy,operational:{...op,run,event}};by.set(key,out);return out;
}
/** The first day a run is planned after the race, by event kind (the R6 value unless the extension sets one). */
/** The extension states days without (the marathon: no run for 7 days, no strength on days 1 to 3), so the first day allowed is the day after them;
 * the R6 value is already a first day. */
export const postEventFirstRunDays=(E,kind)=>{const n=E.postEventFirstRunMinDaysAfterRaceByKind?.[kind];return n===undefined?E.postEventFirstRunMinDaysAfterRace:n+1;};
export const postEventFirstStrengthDays=(E,kind)=>{const n=E.postEventStrengthMinDaysAfterRaceByKind?.[kind];return n===undefined?E.postEventFirstRunMinDaysAfterRace:n+1;};
