import {clone,hash} from './value.mjs';
import {LB_TO_KG} from './r6-intake.mjs';
const DAY=86400000;
export function utcTimestamp(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)||!Number.isFinite(Date.parse(value)))return null;
 const day=value.slice(0,10);if(new Date(Date.parse(day+'T00:00:00Z')).toISOString().slice(0,10)!==day)return null;
 return new Date(Date.parse(value)).toISOString();
}
const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(Date.parse(v+'T00:00:00Z')).toISOString().slice(0,10)===v;
/** Code-point order: the same on every host, whatever its collation locale (QRE-R6-22). */
export const byCodePoint=(a,b)=>{const x=String(a),y=String(b);return x<y?-1:x>y?1:0;};
/** Local calendar date of an instant for a fixed synthetic offset (minutes east of UTC). */
export const localDate=(iso,offset=0)=>new Date(Date.parse(iso)+offset*60000).toISOString().slice(0,10);
const SOURCE_RANK={WEARABLE_FULL:3,MANUAL:2,SELF_REPORT:2,WEARABLE_PARTIAL:1};
const sourceQuality=o=>o.source?.quality??(o.source?.activityId?(o.source?.completeness==='PARTIAL'?'WEARABLE_PARTIAL':'WEARABLE_FULL'):'MANUAL');
const RESPONSE={performance:['COMPATIBLE','UNDER','OVER','UNKNOWN'],recovery:['COMPATIBLE','ADVERSE','UNKNOWN'],effort:['ON_TARGET','EASIER','HARDER','UNKNOWN'],nextDayFunction:['NORMAL','IMPAIRED','UNKNOWN']};
/** Per exercise a report logged: set count, heaviest load in kilograms (pounds converted as the logs read them), lowest reps and RIR. */
const kgOf=l=>{if(typeof l==='number')return Number.isFinite(l)?{v:l,c:null}:null;if(!l||typeof l!=='object'||!Number.isFinite(l.value))return null;const u=String(l.unit??'').trim().toUpperCase();return u==='KG'?{v:l.value,c:l.convention??null}:u==='LB'?{v:Math.round(l.value*LB_TO_KG*2)/2,c:l.convention??null}:null;};
const exerciseFacts=actual=>Object.fromEntries((Array.isArray(actual?.exercises)?actual.exercises:[]).filter(e=>e&&typeof e==='object'&&typeof e.id==='string').map(e=>{const sets=Array.isArray(e.sets)?e.sets.filter(s=>s&&typeof s==='object'):[],kg=sets.map(s=>kgOf(s.load)).filter(Boolean),reps=sets.map(s=>s.reps).filter(Number.isFinite),rir=sets.map(s=>s.rir).filter(Number.isFinite);return [e.id,{sets:sets.length,load:kg.length?Math.max(...kg.map(x=>x.v)):null,convention:kg.find(x=>x.c)?.c??null,reps:reps.length?Math.min(...reps):null,rir:rir.length?Math.min(...rir):null,known:kg.length+reps.length+rir.length}];}));
const physicalAgrees=(a,b,increments={})=>{
 const x=a.actual,y=b.actual;if(x.completed!==y.completed)return false;
 if(Number.isFinite(x.minutes)&&Number.isFinite(y.minutes)&&Math.abs(x.minutes-y.minutes)>Math.max(3,0.1*Math.max(x.minutes,y.minutes)))return false;
 for(const k of ['sets','reps'])if(Number.isFinite(x[k])&&Number.isFinite(y[k])&&Math.abs(x[k]-y[k])>1)return false;
 // Two reports of one strength session agree only if every exercise both logged has the same set count within one and a load within one
 // smallest increment; otherwise they are conflicting facts, never merged by arrival order (R7-A).
 const ex=exerciseFacts(x),ey=exerciseFacts(y);
 for(const [id,f] of Object.entries(ex)){const g=ey[id];if(!g)continue;if(Math.abs(f.sets-g.sets)>1||f.convention&&g.convention&&f.convention!==g.convention)return false;if(Number.isFinite(f.load)&&Number.isFinite(g.load)&&Math.abs(f.load-g.load)>(increments[f.convention??g.convention]??0)+1e-9)return false;for(const k of ['reps','rir'])if(Number.isFinite(f[k])&&Number.isFinite(g[k])&&Math.abs(f[k]-g[k])>1)return false;}
 return true;
};
/**
 * Two agreeing reports of one execution become one (R7-A): a value either report states is kept, a known value is never replaced by an
 * unknown one, and where both state one the better declared source leads, then the more conservative value, so arrival order never
 * decides. Every exercise either report logged is kept; where both logged it, the more informative entry, then the better source, then
 * the one with fewer reps, lower RIR and lower load.
 */
function mergeActual(a,b,ra,rb){
 const out={...a.actual},conservative=(x,y)=>Number.isFinite(x)&&Number.isFinite(y)?Math.min(x,y):x??y;
 for(const [k,v] of Object.entries(b.actual)){if(k==='exercises'||v===undefined||v===null)continue;const w=out[k];out[k]=w===undefined||w===null?v:ra!==rb?(rb>ra?v:w):typeof v==='number'?conservative(w,v):w;}
 const ea=Array.isArray(a.actual.exercises)?a.actual.exercises:null,eb=Array.isArray(b.actual.exercises)?b.actual.exercises:null;
 if(ea||eb){const fa=exerciseFacts(a.actual),fb=exerciseFacts(b.actual),la=(ea??[]).map(e=>e?.id).filter(x=>typeof x==='string'),lb=(eb??[]).map(e=>e?.id).filter(x=>typeof x==='string'),ids=la.join()===lb.join()?la:[...new Set([...la,...lb])].sort(byCodePoint);
  out.exercises=ids.map(id=>{const x=(ea??[]).find(e=>e?.id===id),y=(eb??[]).find(e=>e?.id===id);if(!x||!y)return clone(x??y);const p=fa[id],q=fb[id];
   const key=(f,r)=>[f.known,f.sets,r,-(f.reps??Infinity),-(f.rir??Infinity),-(f.load??Infinity)];const kp=key(p,ra),kq=key(q,rb);for(let i=0;i<kp.length;i++)if(kp[i]!==kq[i])return clone(kp[i]>kq[i]?x:y);return clone(x);});}
 return out;
}
const responseConflicts=(a,b)=>['performance','recovery','effort'].some(k=>a?.[k]&&b?.[k]&&a[k]!=='UNKNOWN'&&b[k]!=='UNKNOWN'&&a[k]!==b[k]);
/**
 * Causal, provenance-preserving normalization. An observation is usable only if it was observed and reported at or
 * before the decision clock. Day-precision facts get the latest causal instant of that local day, never an invented
 * later clock. Duplicates merge, conflicts quarantine, corrections supersede, stale facts expire for learning.
 */
export function normalizeObservations(observations,{athleteId,asOf,maximumAgeDays=56,futureSkewSeconds=300,prior=[],timezoneOffsetMinutes=0,loadIncrements={}}={}){
 const now=utcTimestamp(asOf);if(!now)throw new TypeError('Explicit decision time with timezone required');
 // supersededRows keeps every fact a correction replaced, so the carried record stays append-only and a later normalization of it still
 // finds the corrected original (R7-A). They are history: never accepted, counted or bound again.
 const accepted=[],excluded=[],superseded=[],supersededRows=[],duplicates=[],conflicts=[],quarantined=new Set(),byEvent=new Map(),byIdentity=new Map();
 const effective=o=>{
  const exact=utcTimestamp(o.observedAt);if(exact)return {at:exact,precision:'EXACT'};
  const day=isoDay(o.occurrenceDate)?o.occurrenceDate:isoDay(o.observedAt)?o.observedAt:null;
  if(!day)return null;
  const endOfLocalDay=new Date(Date.parse(day+'T23:59:59Z')-timezoneOffsetMinutes*60000).toISOString();
  return {at:Date.parse(endOfLocalDay)<=Date.parse(now)?endOfLocalDay:Date.parse(new Date(Date.parse(day+'T00:00:00Z')-timezoneOffsetMinutes*60000).toISOString())<=Date.parse(now)?now:endOfLocalDay,precision:'DAY',day};
 };
 const list=v=>Array.isArray(v)?v:[],isObject=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
 for(const o of [...list(prior),...list(observations)])if(!isObject(o))excluded.push({eventId:null,sessionId:null,reason:'INVALID_OBSERVATION',inputHash:hash(o??null)});
 const rows=[...clone(list(prior)).filter(isObject).map(o=>({o,prior:true})),...clone(list(observations)).filter(isObject).map(o=>({o,prior:false}))];
 const availability=o=>Date.parse(utcTimestamp(o.correctedAt)??utcTimestamp(o.reportedAt)??effective(o)?.at??now);
 rows.sort((a,b)=>availability(a.o)-availability(b.o)||byCodePoint(a.o.eventId,b.o.eventId));
 // A fact that conflicts with another stays in the record, flagged, and is quarantined for gating and learning (QRE-R6-14).
 const flagConflict=(row,reason)=>{row.conflicted=true;row.provenance={...row.provenance,conflict:reason};};
 const byActivity=new Map();
 for(const {o:source,prior:carried} of rows){
  const o=clone(source),reject=reason=>excluded.push({eventId:o?.eventId??null,sessionId:o?.sessionId??null,reason,inputHash:hash(source)});
  if(!o||!o.eventId){reject('EVENT_ID_REQUIRED');continue;}
  if(o.athleteId&&o.athleteId!==athleteId){reject('ATHLETE_MISMATCH');continue;}
  // A fact a correction replaced in an earlier review is history: kept in the record and findable by a later correction chain (R7-A).
  if(!carried){delete o.superseded;delete o.supersededBy;delete o.supersededAt;}
  if(carried&&o.superseded===true){const row={...o,identity:o.sessionId?'session:'+o.sessionId:'activity:'+(o.canonicalActivityId??o.source?.activityId??(o.provenance?.provider??'MANUAL')+'@'+o.observedAt),inputHash:hash({...source,athleteId})};for(const id of [o.eventId,...Object.keys(o.provenance?.inputHashes??{}),...(o.provenance?.mergedSourceIds??[])])if(!byEvent.has(id))byEvent.set(id,row);supersededRows.push(row);continue;}
  o.athleteId=athleteId;
  const t=effective(o);if(!t){reject('OBSERVATION_TIME_REQUIRED');continue;}
  const reported=o.reportedAt?utcTimestamp(o.reportedAt):null;
  if(o.reportedAt&&!reported){reject('INVALID_REPORT_TIME');continue;}
  if(Date.parse(t.at)>Date.parse(now)){reject(Date.parse(t.at)-Date.parse(now)<=futureSkewSeconds*1000?'FUTURE_CLOCK_SKEW_QUARANTINED':'FUTURE_OBSERVATION');continue;}
  if(reported&&Date.parse(reported)>Date.parse(now)){reject('FUTURE_REPORT_NOT_AVAILABLE');continue;}
  // A report cannot precede what it reports (QRE-R6-23); a day-precision fact compares local dates.
  if(reported&&(t.precision==='EXACT'?Date.parse(reported)<Date.parse(t.at):localDate(reported,timezoneOffsetMinutes)<t.day)){reject('REPORT_BEFORE_OBSERVATION');continue;}
  if(o.stale===true||Date.parse(now)-Date.parse(t.at)>maximumAgeDays*DAY){reject('STALE_OBSERVATION');continue;}
  if(!o.actual||typeof o.actual.completed!=='boolean'){reject('ACTUAL_COMPLETION_REQUIRED');continue;}
  if(['minutes','sets','reps','loadKg','distanceKm'].some(k=>o.actual[k]!==undefined&&o.actual[k]!==null&&(!Number.isFinite(o.actual[k])||o.actual[k]<0))){reject('INVALID_ACTUAL');continue;}
  o.response={performance:'UNKNOWN',recovery:'UNKNOWN',effort:'UNKNOWN',nextDayFunction:'UNKNOWN',...(o.response??{})};
  if(Object.entries(RESPONSE).some(([k,values])=>!values.includes(o.response[k]))){reject('INVALID_RESPONSE');continue;}
  o.observedAt=t.at;o.localDate=t.day??localDate(t.at,timezoneOffsetMinutes);if(reported)o.reportedAt=reported;
  o.provenance={...(o.provenance??{}),provider:o.source?.provider??o.provider??'MANUAL',sourceQuality:sourceQuality(o),activityId:o.source?.activityId??o.canonicalActivityId??null,sourceHash:o.sourceHash??o.provenance?.sourceHash??hash(source),inputHashes:{...(o.provenance?.inputHashes??{}),[o.eventId]:o.provenance?.inputHashes?.[o.eventId]??hash({...source,athleteId})},timePrecision:t.precision,timeBasis:t.precision==='DAY'?'LATEST_CAUSAL_INSTANT_OF_LOCAL_DAY':'SUPPLIED_TIMESTAMP',completeness:o.actual.completed?'COMPLETE':'PARTIAL'};
  const identity=o.sessionId?'session:'+o.sessionId:'activity:'+(o.canonicalActivityId??o.source?.activityId??o.provenance.provider+'@'+o.observedAt);
  // A conflict carried in from an earlier review stays quarantined for its identity.
  if(o.conflicted===true)quarantined.add(identity);
  if(o.correctionOf){
   const old=byEvent.get(o.correctionOf),corrected=utcTimestamp(o.correctedAt??o.reportedAt);
   if(!old||!corrected||Date.parse(corrected)>Date.parse(now)||Date.parse(corrected)<Date.parse(old.observedAt)||old.identity!==identity){reject('INVALID_CORRECTION_CHAIN');continue;}
   // A correction carried in from an earlier review already replaced its original: the chain is valid and the correction stays live.
   const retire=row=>{const at=accepted.indexOf(row);if(at>=0)accepted.splice(at,1);superseded.push({eventId:row.eventId,supersededBy:o.eventId,correctedAt:corrected});const kept={...row,superseded:true,supersededBy:o.eventId,supersededAt:corrected};supersededRows.push(kept);byEvent.set(row.eventId,kept);};
   if(old.superseded!==true){if(accepted.includes(old))retire(old);else byEvent.delete(old.eventId);byIdentity.delete(identity);}
   // A correction resolves a conflict on its identity: the conflicted reports are superseded by it.
   if(quarantined.has(identity)){for(const row of accepted.filter(x=>x.identity===identity))retire(row);quarantined.delete(identity);}
  }
  const sameEvent=byEvent.get(o.eventId);
  if(sameEvent){
   const {identity:_i,...stored}=sameEvent;
   if(hash({...source,athleteId})===(sameEvent.provenance?.inputHashes?.[o.eventId]??sameEvent.inputHash)||hash(stored.actual)===hash(o.actual)&&!responseConflicts(stored.response,o.response)){duplicates.push({eventId:o.eventId,mergedInto:sameEvent.eventId,reason:'EXACT_REPLAY'});continue;}
   flagConflict(sameEvent,'EVENT_ID_REUSED_WITH_DIFFERENT_FACTS');quarantined.add(identity);
   conflicts.push({identity,eventIds:[sameEvent.eventId],reason:'EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'});reject('EVENT_ID_REUSED_WITH_DIFFERENT_FACTS');continue;
  }
  if(quarantined.has(identity)&&o.conflicted!==true){reject('IDENTITY_QUARANTINED_BY_CONFLICT');continue;}
  // One wearable activity is one execution: bound to a second session it is a conflict on both (QRE-R6-13).
  const activityId=o.source?.activityId??o.canonicalActivityId??null,boundTo=activityId?byActivity.get(activityId):null;
  if(boundTo&&boundTo.identity!==identity){flagConflict(boundTo,'ACTIVITY_BOUND_TO_TWO_SESSIONS');quarantined.add(boundTo.identity);quarantined.add(identity);conflicts.push({identity,eventIds:[boundTo.eventId,o.eventId],activityId,reason:'ACTIVITY_BOUND_TO_TWO_SESSIONS'});reject('ACTIVITY_BOUND_TO_TWO_SESSIONS');continue;}
  const previous=byIdentity.get(identity);
  if(previous){
   if(!physicalAgrees(previous,o,loadIncrements)||responseConflicts(previous.response,o.response)){
    flagConflict(previous,'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS');quarantined.add(identity);
    conflicts.push({identity,eventIds:[previous.eventId,o.eventId],reason:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS'});reject('DUPLICATE_CONFLICT_QUARANTINED');continue;
   }
   // Complementary duplicate: one execution from two reports (R7-A mergeActual); subjective response from whoever reported it.
   previous.actual=mergeActual(previous,o,SOURCE_RANK[previous.provenance.sourceQuality]??0,SOURCE_RANK[o.provenance.sourceQuality]??0);
   previous.provenance.inputHashes={...(previous.provenance.inputHashes??{}),[o.eventId]:hash({...source,athleteId})};
   for(const k of Object.keys(RESPONSE))if(previous.response[k]==='UNKNOWN'&&o.response[k]!=='UNKNOWN')previous.response[k]=o.response[k];
   previous.provenance.mergedSourceIds=[...new Set([...(previous.provenance.mergedSourceIds??[previous.eventId]),o.eventId])];
   duplicates.push({eventId:o.eventId,mergedInto:previous.eventId,reason:'SAME_EXECUTION_DIFFERENT_SOURCE'});byEvent.set(o.eventId,previous);if(activityId&&!byActivity.has(activityId))byActivity.set(activityId,previous);continue;
  }
  const row={...o,identity,inputHash:hash({...source,athleteId})};
  accepted.push(row);byEvent.set(o.eventId,row);byIdentity.set(identity,row);for(const id of [...Object.keys(o.provenance?.inputHashes??{}),...(o.provenance?.mergedSourceIds??[])])if(!byEvent.has(id))byEvent.set(id,row);if(activityId&&!byActivity.has(activityId))byActivity.set(activityId,row);
 }
 accepted.sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt)||byCodePoint(a.eventId,b.eventId));
 return {observations:accepted.map(({identity,inputHash,...o})=>o),accepted:accepted.map(({identity,inputHash,...o})=>o),excluded,superseded,supersededRows:supersededRows.map(({identity,inputHash,...o})=>o),duplicates,conflicts,quarantinedIdentities:[...quarantined],asOf:now,causalCutoff:now};
}
