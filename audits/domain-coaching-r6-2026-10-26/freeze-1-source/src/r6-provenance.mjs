import {clone,hash} from './value.mjs';
const DAY=86400000;
export function utcTimestamp(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value)))return null;
 const day=value.slice(0,10);if(new Date(Date.parse(day+'T00:00:00Z')).toISOString().slice(0,10)!==day)return null;
 return new Date(Date.parse(value)).toISOString();
}
const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&new Date(Date.parse(v+'T00:00:00Z')).toISOString().slice(0,10)===v;
/** Local calendar date of an instant for a fixed synthetic offset (minutes east of UTC). */
export const localDate=(iso,offset=0)=>new Date(Date.parse(iso)+offset*60000).toISOString().slice(0,10);
const SOURCE_RANK={WEARABLE_FULL:3,MANUAL:2,SELF_REPORT:2,WEARABLE_PARTIAL:1};
const sourceQuality=o=>o.source?.quality??(String(o.source?.provider??o.provider??'MANUAL').startsWith('WEARABLE')||o.source?.activityId?(o.source?.completeness==='PARTIAL'?'WEARABLE_PARTIAL':'WEARABLE_FULL'):'MANUAL');
const RESPONSE={performance:['COMPATIBLE','UNDER','OVER','UNKNOWN'],recovery:['COMPATIBLE','ADVERSE','UNKNOWN'],effort:['ON_TARGET','EASIER','HARDER','UNKNOWN'],nextDayFunction:['NORMAL','IMPAIRED','UNKNOWN']};
const physicalAgrees=(a,b)=>{
 const x=a.actual,y=b.actual;if(x.completed!==y.completed)return false;
 if(Number.isFinite(x.minutes)&&Number.isFinite(y.minutes)&&Math.abs(x.minutes-y.minutes)>Math.max(3,0.1*Math.max(x.minutes,y.minutes)))return false;
 for(const k of ['sets','reps'])if(Number.isFinite(x[k])&&Number.isFinite(y[k])&&Math.abs(x[k]-y[k])>1)return false;
 return true;
};
const responseConflicts=(a,b)=>['performance','recovery','effort'].some(k=>a?.[k]&&b?.[k]&&a[k]!=='UNKNOWN'&&b[k]!=='UNKNOWN'&&a[k]!==b[k]);
/**
 * Causal, provenance-preserving normalization. An observation is usable only if it was observed and reported at or
 * before the decision clock. Day-precision facts get the latest causal instant of that local day, never an invented
 * later clock. Duplicates merge, conflicts quarantine, corrections supersede, stale facts expire for learning.
 */
export function normalizeObservations(observations,{athleteId,asOf,maximumAgeDays=56,futureSkewSeconds=300,prior=[],timezoneOffsetMinutes=0}={}){
 const now=utcTimestamp(asOf);if(!now)throw new TypeError('Explicit decision time with timezone required');
 const accepted=[],excluded=[],superseded=[],duplicates=[],conflicts=[],quarantined=new Set(),byEvent=new Map(),byIdentity=new Map();
 const effective=o=>{
  const exact=utcTimestamp(o.observedAt);if(exact)return {at:exact,precision:'EXACT'};
  const day=isoDay(o.occurrenceDate)?o.occurrenceDate:isoDay(o.observedAt)?o.observedAt:null;
  if(!day)return null;
  const endOfLocalDay=new Date(Date.parse(day+'T23:59:59Z')-timezoneOffsetMinutes*60000).toISOString();
  return {at:Date.parse(endOfLocalDay)<=Date.parse(now)?endOfLocalDay:Date.parse(new Date(Date.parse(day+'T00:00:00Z')-timezoneOffsetMinutes*60000).toISOString())<=Date.parse(now)?now:endOfLocalDay,precision:'DAY',day};
 };
 const rows=[...clone(prior??[]).map(o=>({o,prior:true})),...clone(observations??[]).map(o=>({o,prior:false}))];
 const availability=o=>Date.parse(utcTimestamp(o.correctedAt)??utcTimestamp(o.reportedAt)??effective(o)?.at??now);
 rows.sort((a,b)=>availability(a.o)-availability(b.o)||String(a.o.eventId).localeCompare(String(b.o.eventId)));
 for(const {o:source} of rows){
  const o=clone(source),reject=reason=>excluded.push({eventId:o?.eventId??null,sessionId:o?.sessionId??null,reason,inputHash:hash(source)});
  if(!o||!o.eventId){reject('EVENT_ID_REQUIRED');continue;}
  if(o.athleteId&&o.athleteId!==athleteId){reject('ATHLETE_MISMATCH');continue;}
  o.athleteId=athleteId;
  const t=effective(o);if(!t){reject('OBSERVATION_TIME_REQUIRED');continue;}
  const reported=o.reportedAt?utcTimestamp(o.reportedAt):null;
  if(o.reportedAt&&!reported){reject('INVALID_REPORT_TIME');continue;}
  if(Date.parse(t.at)>Date.parse(now)){reject(Date.parse(t.at)-Date.parse(now)<=futureSkewSeconds*1000?'FUTURE_CLOCK_SKEW_QUARANTINED':'FUTURE_OBSERVATION');continue;}
  if(reported&&Date.parse(reported)>Date.parse(now)){reject('FUTURE_REPORT_NOT_AVAILABLE');continue;}
  if(o.stale===true||Date.parse(now)-Date.parse(t.at)>maximumAgeDays*DAY){reject('STALE_OBSERVATION');continue;}
  if(!o.actual||typeof o.actual.completed!=='boolean'){reject('ACTUAL_COMPLETION_REQUIRED');continue;}
  if(['minutes','sets','reps','loadKg','distanceKm'].some(k=>o.actual[k]!==undefined&&o.actual[k]!==null&&(!Number.isFinite(o.actual[k])||o.actual[k]<0))){reject('INVALID_ACTUAL');continue;}
  o.response={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN',...(o.response??{})};
  if(Object.entries(RESPONSE).some(([k,values])=>!values.includes(o.response[k]))){reject('INVALID_RESPONSE');continue;}
  o.observedAt=t.at;o.localDate=t.day??localDate(t.at,timezoneOffsetMinutes);if(reported)o.reportedAt=reported;
  o.provenance={...(o.provenance??{}),provider:o.source?.provider??o.provider??'MANUAL',sourceQuality:sourceQuality(o),activityId:o.source?.activityId??o.canonicalActivityId??null,sourceHash:o.sourceHash??hash(source),timePrecision:t.precision,timeBasis:t.precision==='DAY'?'LATEST_CAUSAL_INSTANT_OF_LOCAL_DAY':'SUPPLIED_TIMESTAMP',completeness:o.actual.completed?'COMPLETE':'PARTIAL'};
  const identity=o.sessionId?'session:'+o.sessionId:'activity:'+(o.canonicalActivityId??o.source?.activityId??o.provenance.provider+'@'+o.observedAt);
  if(o.correctionOf){
   const old=byEvent.get(o.correctionOf),corrected=utcTimestamp(o.correctedAt??o.reportedAt);
   if(!old||!corrected||Date.parse(corrected)>Date.parse(now)||Date.parse(corrected)<Date.parse(old.observedAt)||old.identity!==identity){reject('INVALID_CORRECTION_CHAIN');continue;}
   const i=accepted.indexOf(old);if(i>=0)accepted.splice(i,1);superseded.push({eventId:old.eventId,supersededBy:o.eventId,correctedAt:corrected});byEvent.delete(old.eventId);byIdentity.delete(identity);
  }
  const sameEvent=byEvent.get(o.eventId);
  if(sameEvent){
   const {identity:_i,...stored}=sameEvent;
   if(hash({...source,athleteId})===sameEvent.inputHash||hash(stored.actual)===hash(o.actual)&&!responseConflicts(stored.response,o.response)){duplicates.push({eventId:o.eventId,mergedInto:sameEvent.eventId,reason:'EXACT_REPLAY'});continue;}
   const i=accepted.indexOf(sameEvent);if(i>=0)accepted.splice(i,1);quarantined.add(identity);
   conflicts.push({identity,eventIds:[sameEvent.eventId],reason:'EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'});reject('EVENT_ID_REUSED_WITH_DIFFERENT_FACTS');continue;
  }
  if(quarantined.has(identity)){reject('IDENTITY_QUARANTINED_BY_CONFLICT');continue;}
  const previous=byIdentity.get(identity);
  if(previous){
   if(!physicalAgrees(previous,o)||responseConflicts(previous.response,o.response)){
    const i=accepted.indexOf(previous);if(i>=0)accepted.splice(i,1);quarantined.add(identity);
    conflicts.push({identity,eventIds:[previous.eventId,o.eventId],reason:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS'});reject('DUPLICATE_CONFLICT_QUARANTINED');continue;
   }
   // Complementary duplicate: physical facts from the better source, subjective response from whoever reported it.
   const better=SOURCE_RANK[o.provenance.sourceQuality]>SOURCE_RANK[previous.provenance.sourceQuality];
   if(better)previous.actual={...previous.actual,...Object.fromEntries(Object.entries(o.actual).filter(([,v])=>v!==undefined&&v!==null))};
   for(const k of Object.keys(RESPONSE))if(previous.response[k]==='UNKNOWN'&&o.response[k]!=='UNKNOWN')previous.response[k]=o.response[k];
   previous.provenance.mergedSourceIds=[...new Set([...(previous.provenance.mergedSourceIds??[previous.eventId]),o.eventId])];
   duplicates.push({eventId:o.eventId,mergedInto:previous.eventId,reason:'SAME_EXECUTION_DIFFERENT_SOURCE'});byEvent.set(o.eventId,previous);continue;
  }
  const row={...o,identity,inputHash:hash({...source,athleteId})};
  accepted.push(row);byEvent.set(o.eventId,row);byIdentity.set(identity,row);
 }
 accepted.sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt)||a.eventId.localeCompare(b.eventId));
 return {observations:accepted.map(({identity,inputHash,...o})=>o),accepted:accepted.map(({identity,inputHash,...o})=>o),excluded,superseded,duplicates,conflicts,quarantinedIdentities:[...quarantined],asOf:now,causalCutoff:now};
}
