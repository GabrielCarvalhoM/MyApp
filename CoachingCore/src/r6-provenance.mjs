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
 * decides. Every exercise either report logged is kept; where both logged it, the entry chosen is the more informative one, then the better
 * source, then the one with fewer reps, lower RIR and lower load, then a fixed order of content; it then takes each load, repetition count
 * or reserve its sets leave unknown from the other report's same set, so an agreeing report never makes a known value unknown (R7-A.1, I4).
 */
function mergeActual(a,b,ra,rb){
 const out={...a.actual},conservative=(x,y)=>Number.isFinite(x)&&Number.isFinite(y)?Math.min(x,y):x??y;
 for(const [k,v] of Object.entries(b.actual)){if(k==='exercises'||v===undefined||v===null)continue;const w=out[k];out[k]=w===undefined||w===null?v:ra!==rb?(rb>ra?v:w):typeof v==='number'?conservative(w,v):w;}
 const ea=Array.isArray(a.actual.exercises)?a.actual.exercises:null,eb=Array.isArray(b.actual.exercises)?b.actual.exercises:null;
 // A value is known when it can be read (a load in a known unit, a finite count), as the ranking and every reader count it; a value present
 // but unreadable is filled from the other report's same set and kept as provenance (R7-A.1, QE-R7A1-05).
 const known=v=>v!==undefined&&v!==null,readable={load:v=>!!kgOf(v),reps:Number.isFinite,rir:Number.isFinite},filled=(base,other)=>{const e=clone(base);if(Array.isArray(e.sets)&&Array.isArray(other.sets))e.sets=e.sets.map((s,i)=>{const o=other.sets[i];if(!s||typeof s!=='object'||!o||typeof o!=='object')return s;const t={...s};for(const k of ['load','reps','rir'])if(!readable[k](t[k])&&readable[k](o[k])){if(known(t[k]))t.unreadable={...t.unreadable,[k]:clone(t[k])};t[k]=clone(o[k]);}return t;});return e;};
 if(ea||eb){const fa=exerciseFacts(a.actual),fb=exerciseFacts(b.actual),la=(ea??[]).map(e=>e?.id).filter(x=>typeof x==='string'),lb=(eb??[]).map(e=>e?.id).filter(x=>typeof x==='string'),ids=la.join()===lb.join()?la:[...new Set([...la,...lb])].sort(byCodePoint);
  out.exercises=ids.map(id=>{const x=(ea??[]).find(e=>e?.id===id),y=(eb??[]).find(e=>e?.id===id);if(!x||!y)return clone(x??y);const p=fa[id],q=fb[id];
   const key=(f,r)=>[f.known,f.sets,r,-(f.reps??Infinity),-(f.rir??Infinity),-(f.load??Infinity)];const kp=key(p,ra),kq=key(q,rb);for(let i=0;i<kp.length;i++)if(kp[i]!==kq[i])return kp[i]>kq[i]?filled(x,y):filled(y,x);return byCodePoint(hash(x),hash(y))<=0?filled(x,y):filled(y,x);});}
 return out;
}
const responseConflicts=(a,b)=>['performance','recovery','effort'].some(k=>a?.[k]&&b?.[k]&&a[k]!=='UNKNOWN'&&b[k]!=='UNKNOWN'&&a[k]!==b[k]);
/**
 * V1 Core Safety & Lifecycle (E-1, SSCTR L5): what one report of a merged execution said (its own facts and response, and its declared source),
 * kept on the merged row (`provenance.parts`, by event id) from the first merge on. A correction is from its author and replaces only that author's
 * report: the row it makes is the corrected report merged again with every other report still in force, by the merge rules below, so a device
 * re-synchronization never erases what the athlete said, and an athlete's edit never erases what the device measured. A row merged without parts
 * (recorded before this change) is corrected as before.
 */
// F2 (Normalization Consistency): a part keeps the device activity its report carried, so a merged watch activity stays bound to its execution in
// every later review (a row merged before this change kept none, and binds only its own). Cycle 1 (QRE C1, SEC-NCC-01): a part also keeps when its
// own report became available (`availableAt`), so a correction of that report is read against that report's clock, never the clock of the row
// holding it (as `availability` reads a row: its correction, else its report, else its observed instant).
const partOf=o=>{const at=utcTimestamp(o.correctedAt)??utcTimestamp(o.reportedAt)??utcTimestamp(o.observedAt);return {actual:clone(o.actual),response:clone(o.response),sourceQuality:o.provenance?.sourceQuality??null,...(o.provenance?.activityId?{activityId:o.provenance.activityId}:{}),...(at?{availableAt:at}:{})};};
/** SEC-O1-03: the most voices a flagged row keeps (measured: at most 3 on any row of the O-1 differential's 12 configurations). Exported for tests. */
export const VOICE_LIMIT=16;
/** O-1: who gave a part or a report, as far as the record shows: one device activity, else the athlete (an own source), else nobody known. */
const speakerOf=p=>typeof p?.activityId==='string'&&p.activityId?'DEVICE:'+p.activityId:['MANUAL','SELF_REPORT'].includes(p?.sourceQuality)?'ATHLETE':null;
/** A part that can be merged again: the same checks a report passes (completion, measures, response vocabulary). */
const validPart=p=>!!p&&typeof p==='object'&&!!p.actual&&typeof p.actual==='object'&&!Array.isArray(p.actual)&&typeof p.actual.completed==='boolean'
 &&!['minutes','sets','reps','loadKg','distanceKm'].some(k=>p.actual[k]!==undefined&&p.actual[k]!==null&&(!Number.isFinite(p.actual[k])||p.actual[k]<0))
 &&!!p.response&&typeof p.response==='object'&&Object.entries(RESPONSE).every(([k,v])=>v.includes(p.response[k]??'UNKNOWN'));
/**
 * R7-C QE-R7C-10: when the completed-work record first held a report of one execution (`provenance.firstRecordedAt`): the clock of the decision
 * whose input first carried it. Rows that are one execution (an agreeing duplicate, a correction and what it corrects) take the earliest; a row
 * recorded before R7C-FREEZE-4 carries none, and was held earlier than any clock known, so then none is known. Evidence visibility only: no dose,
 * no authority, never read by the evidence reducer.
 */
const firstRecorded=(...rows)=>{const t=rows.map(r=>utcTimestamp(r?.provenance?.firstRecordedAt));return t.every(Boolean)?t.reduce((a,b)=>Date.parse(a)<=Date.parse(b)?a:b):null;};
const setFirstRecorded=(row,t)=>{if(t)row.provenance.firstRecordedAt=t;else delete row.provenance.firstRecordedAt;};
/**
 * Causal, provenance-preserving normalization. An observation is usable only if it was observed and reported at or
 * before the decision clock. Day-precision facts get the latest causal instant of that local day, never an invented
 * later clock. Duplicates merge, conflicts quarantine, corrections supersede, stale facts expire for learning.
 * `recordArrival` (a decision's own completed-work record, R7-C QE-R7C-10): each observation the decision brings is stamped with the decision
 * clock (`provenance.firstRecordedAt`), never with a value the input supplies; a carried row keeps its own. Without it no new row carries one.
 */
export function normalizeObservations(observations,{athleteId,asOf,maximumAgeDays=56,futureSkewSeconds=300,prior=[],timezoneOffsetMinutes=0,loadIncrements={},recordArrival=false,incoming=false}={}){
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
 // F1 (Normalization Consistency): the record a review carries is rebuilt before any report it brings is read: first its history (the reports a
 // correction replaced, so every carried correction finds the report it names), then its rows in force, then the incoming reports; each group by
 // availability. A report that arrives late with an earlier clock is read against the record as admitted, never before it: a carried row is never
 // refused again because of it, and a real conflict between them is flagged on the carried row and refuses the new report, as with a monotone clock.
 const group=r=>r.prior?(r.o.superseded===true?0:1):2;
 rows.sort((a,b)=>group(a)-group(b)||availability(a.o)-availability(b.o)||byCodePoint(a.o.eventId,b.o.eventId));
 // A fact that conflicts with another stays in the record, flagged, and is quarantined for gating and learning (QRE-R6-14).
 const flagConflict=(row,reason)=>{row.conflicted=true;row.provenance={...row.provenance,conflict:reason};};
 const byActivity=new Map();
 // O-1 (SSCTR-NCC-01, SEC-NCC-02): a report that passed every check and is refused only because it disputes the row in force for its execution
 // (a head-on conflict), or because that execution is already in dispute, is kept as a voice of that flagged row (a part, with its input hash):
 // never merged into the row's amount, never in dose. So a later correction resolves the dispute only when it agrees with every voice kept,
 // the refused one included (E-1, as for a correction in conflict), and f08's readiness question hears what that voice said. A report refused
 // for integrity (another athlete, a time or measure, an event id reused, a device activity of another execution, a correction chain) is not.
 const keepVoice=(row,o,source,activityId)=>{
  if(!isObject(row.provenance.parts))row.provenance.parts={[row.eventId]:partOf(row)};
  if(Object.hasOwn(row.provenance.parts,o.eventId))return;
  // SEC-O1-03: a flagged row keeps at most VOICE_LIMIT voices (its own and merged parts included). Beyond it a refused report stays refused,
  // with its input hash in `excluded`, and is not kept, unless it declares a stop and the row holds none yet: SB-1 never loses its signal. The
  // dispute then stays as the voices kept make it (no credit while they disagree); nothing is written for the excess, so a replay changes nothing.
  // Cycle 1 (SEC-SC-01, QRE-SC-02): f08 reads three things from the voices (a stop, "took place", "did not take place"), so beyond the limit a
  // report is also kept when it says one of them and no kept voice does: at most VOICE_LIMIT+3 voices, and arrival order never decides them.
  const kept=Object.values(row.provenance.parts),stops=p=>isObject(p?.actual)&&p.actual.stop!==undefined&&p.actual.stop!==null&&p.actual.stop!==false;
  const took=p=>isObject(p?.actual)&&(p.actual.completed===true||Number(p.actual.minutes)>0),untaken=p=>isObject(p?.actual)&&!took(p);
  if(kept.length>=VOICE_LIMIT&&![stops,took,untaken].some(says=>says(o)&&!kept.some(says)))return;
  row.provenance.parts[o.eventId]=partOf(o);row.provenance.inputHashes={...(row.provenance.inputHashes??{}),[o.eventId]:hash({...source,athleteId})};
  byEvent.set(o.eventId,row);if(activityId&&!byActivity.has(activityId))byActivity.set(activityId,row);
 };
 for(const {o:source,prior:carried} of rows){
  const o=clone(source),reject=reason=>excluded.push({eventId:o?.eventId??null,sessionId:o?.sessionId??null,reason,inputHash:hash(source)});
  if(!o||!o.eventId){reject('EVENT_ID_REQUIRED');continue;}
  if(o.athleteId&&o.athleteId!==athleteId){reject('ATHLETE_MISMATCH');continue;}
  // A fact a correction replaced in an earlier review is history: kept in the record and findable by a later correction chain (R7-A).
  if(!carried){delete o.superseded;delete o.supersededBy;delete o.supersededAt;
   // V1 Core Safety & Lifecycle (SEC-CORE-01/-02, QRE-CORE-03): what the engine writes on a row is never taken from a new report: its binding
   // context, and the provenance of a merge (the parts, the merged ids and the input hashes of other reports) are made here, from what it says.
   // Only for the reports a review receives from its client (`incoming`): the learning model and other readers pass rows the engine already bound.
   if(incoming){delete o.context;if(isObject(o.provenance)){const {parts:_p,mergedSourceIds:_m,inputHashes:_h,...own}=o.provenance;o.provenance=own;}}}
  if(carried&&o.superseded===true){const row={...o,identity:o.sessionId?'session:'+o.sessionId:'activity:'+(o.canonicalActivityId??o.source?.activityId??(o.provenance?.provider??'MANUAL')+'@'+o.observedAt),inputHash:hash({...source,athleteId})};for(const id of [o.eventId,...Object.keys(o.provenance?.inputHashes??{}),...(o.provenance?.mergedSourceIds??[])])if(!byEvent.has(id))byEvent.set(id,row);supersededRows.push(row);continue;}
  o.athleteId=athleteId;
  // R7-D DX-01: a row the record carries keeps the time precision it was accepted with. A day-precision report was stored with the latest causal
  // instant of its local day as observedAt; read again as a supplied timestamp, a report made earlier that same day would now precede it and the
  // accepted row would drop out of the record. Its stored instant and local day stand, and every screen below still applies to it as to a
  // day-precision report (the local-date comparison for a report before what it reports).
  const t=carried&&o.provenance?.timePrecision==='DAY'&&isoDay(o.localDate)&&utcTimestamp(o.observedAt)?{at:utcTimestamp(o.observedAt),precision:'DAY',day:o.localDate}:effective(o);if(!t){reject('OBSERVATION_TIME_REQUIRED');continue;}
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
  // R7-C QE-R7C-10: a carried row keeps its first-recorded clock; a new one takes this decision's when it records arrivals, else none.
  if(!carried)setFirstRecorded(o,recordArrival?now:null);
  const identity=o.sessionId?'session:'+o.sessionId:'activity:'+(o.canonicalActivityId??o.source?.activityId??o.provenance.provider+'@'+o.observedAt);
  // A conflict carried in from an earlier review stays quarantined for its identity. F3: whether a correction resolves a conflict is read from the
  // quarantine its identity held before it (`heldBefore`), never from its own carried flag: re-reading a correction in conflict never resolves it.
  // SEC-O1-02 / QRE-O1-02: an execution is in dispute while a flagged row in force on it is. A quarantine a report refused for integrity raised
  // with no row flagged on that execution (an activity of another session, a self-flagged report whose chain is refused, an event id of another
  // session's report) carries nothing to the next review, so it is no dispute of it here either: a later report of it in this review is read as
  // in the next one (P7), never refused unkept, and a correction never resolves a dispute that is not on record.
  const disputedHere=()=>quarantined.has(identity)&&accepted.some(x=>x.identity===identity&&x.conflicted===true);
  const heldBefore=disputedHere();
  if(o.conflicted===true)quarantined.add(identity);
  let inherited=null,admit=null,dropsIdentity=false;
  if(o.correctionOf){
   const old=byEvent.get(o.correctionOf),corrected=utcTimestamp(o.correctedAt??o.reportedAt);
   // F1: a correction made before the report it corrects was available is no correction of it (as when both come in one review, where it is read
   // first and finds nothing to correct): refused, whichever review brought that report. Cycle 1 (QRE C1, SEC-NCC-01): the clock is the named
   // report's own: the row's when the row is that report, else the part's; a part kept without one (before this line) is never refused by it.
   const namedAt=old?(old.eventId===o.correctionOf?availability(old):(t=>t?Date.parse(t):-Infinity)(utcTimestamp(isObject(old.provenance?.parts)&&isObject(old.provenance.parts[o.correctionOf])?old.provenance.parts[o.correctionOf].availableAt:null))):null;
   if(!old||!corrected||Date.parse(corrected)>Date.parse(now)||Date.parse(corrected)<Date.parse(old.observedAt)||Date.parse(corrected)<namedAt||old.identity!==identity){reject('INVALID_CORRECTION_CHAIN');continue;}
   // A correction carried in from an earlier review already replaced its original: the chain is valid and the correction stays live.
   const retire=row=>{const at=accepted.indexOf(row);if(at>=0)accepted.splice(at,1);superseded.push({eventId:row.eventId,supersededBy:o.eventId,correctedAt:corrected});const kept={...row,superseded:true,supersededBy:o.eventId,supersededAt:corrected};supersededRows.push(kept);byEvent.set(row.eventId,kept);};
   // E-1: the other reports of the row in force stay in force. That row is the live row on this identity that names the corrected report among
   // its parts, whichever row of the record first claimed the id (QRE-CORE-01: a superseded merged row carried before it) and also while a
   // conflict stands on it (the correction that resolves the conflict keeps the other voices). Each part is read only if it is well formed
   // (QRE-CORE-04, SEC-CORE-04). Closure-2 (SEC-CORE-14): a malformed part is not read and not carried, and the well-formed ones still are, so a
   // damaged part never discards another voice's valid report; with no well-formed part the correction replaces the row, as before. Never throws.
   const holder=accepted.find(x=>x.identity===identity&&isObject(x.provenance?.parts)&&Object.hasOwn(x.provenance.parts,o.correctionOf))??null;
   // O-1: while a dispute stands on the identity, a correction from a known speaker (the athlete, or one device activity) is that speaker's word
   // for every voice that speaker gave it, and only for those: whichever row id it names, another speaker's voice is carried and still has to
   // agree. So the refused speaker can settle the dispute, and who spoke first or which id the client named never does.
   const mine=heldBefore?speakerOf(o.provenance):null;
   // The flagged row in force answers for the dispute also when the report the correction names is no longer one of its voices (an earlier
   // correction replaced it), whoever the correction's speaker (cycle 1, SEC-O1-01a: an unknown speaker too): no voice is retired unheard.
   const voicesOf=holder??(heldBefore?accepted.find(x=>x.identity===identity&&x.conflicted===true&&isObject(x.provenance?.parts))??null:null);
   if(voicesOf){const others=Object.entries(voicesOf.provenance.parts).filter(([id,p])=>validPart(p)&&(mine?speakerOf(p)!==mine:id!==o.correctionOf));if(others.length)inherited=others.map(([id,p])=>({id,p:clone(p),inputHash:voicesOf.provenance.inputHashes?.[id]??null}));}
   // SEC-R2-03: what a correction replaces is retired only once the correction is admitted (accepted, or merged into the row in force). A
   // correction the checks below refuse (an event id or a watch activity of another session, a conflict) leaves every row it named in force, as
   // it was. The event-id check reads the record before the admission (an id the record holds is never freed for this report); the identity
   // checks read it as the admission would leave it. A report an earlier correction already replaced (its row no longer in force, even where a
   // merged part's id still names that row) is replaced already: as for a carried replaced row, the correction meets the row in force on its
   // identity (merged or in conflict), never a second row in force on one execution.
   const live=old.superseded!==true&&accepted.includes(old);
   dropsIdentity=!!holder&&holder!==old&&!heldBefore||live;
   admit=()=>{
    // A correction reports the execution its chain reported: the record first held a report of it when it first held the chain's. Only once
    // admitted (SEC-SR2-01): a refused report, or one read as a replay of another row, carries its own clock only, as with no correctionOf.
    setFirstRecorded(o,firstRecorded(o,old,...(heldBefore?accepted.filter(x=>x.identity===identity):[])));
    if(holder&&holder!==old&&!heldBefore){retire(holder);byIdentity.delete(identity);}
    if(live){retire(old);byIdentity.delete(identity);}
    // A correction resolves a conflict on its identity: the conflicted reports are superseded by it.
    if(heldBefore){for(const row of accepted.filter(x=>x.identity===identity))retire(row);quarantined.delete(identity);if(o.conflicted===true)quarantined.add(identity);}
   };
  }
  const sameEvent=byEvent.get(o.eventId);
  if(sameEvent){
   const {identity:_i,...stored}=sameEvent;
   if(hash({...source,athleteId})===(sameEvent.provenance?.inputHashes?.[o.eventId]??sameEvent.inputHash)||hash(stored.actual)===hash(o.actual)&&!responseConflicts(stored.response,o.response)){if(accepted.includes(sameEvent))setFirstRecorded(sameEvent,firstRecorded(sameEvent,o));duplicates.push({eventId:o.eventId,mergedInto:sameEvent.eventId,reason:'EXACT_REPLAY'});continue;}
   flagConflict(sameEvent,'EVENT_ID_REUSED_WITH_DIFFERENT_FACTS');quarantined.add(identity);
   conflicts.push({identity,eventIds:[sameEvent.eventId],reason:'EVENT_ID_REUSED_WITH_DIFFERENT_FACTS'});reject('EVENT_ID_REUSED_WITH_DIFFERENT_FACTS');continue;
  }
  // One wearable activity is one execution: bound to a second session it is a conflict on both (QRE-R6-13).
  // F2: an activity stays bound to the execution that first held it, also once a correction retired that row: the conflict is then flagged on the
  // row now in force for that execution, never on the history row.
  const activityId=o.source?.activityId??o.canonicalActivityId??null,bound=activityId?byActivity.get(activityId):null,boundTo=bound&&!accepted.includes(bound)?accepted.find(x=>x.identity===bound.identity)??bound:bound;
  // O-1: on an execution already in dispute, the report is kept as a voice of the flagged row in force, unless its device activity is another's.
  if(!admit&&disputedHere()&&o.conflicted!==true){const disputed=accepted.find(x=>x.identity===identity&&x.conflicted===true);if(disputed&&(!boundTo||boundTo.identity===identity))keepVoice(disputed,o,source,activityId);reject('IDENTITY_QUARANTINED_BY_CONFLICT');continue;}
  if(boundTo&&boundTo.identity!==identity){flagConflict(boundTo,'ACTIVITY_BOUND_TO_TWO_SESSIONS');quarantined.add(boundTo.identity);quarantined.add(identity);conflicts.push({identity,eventIds:[boundTo.eventId,o.eventId],activityId,reason:'ACTIVITY_BOUND_TO_TWO_SESSIONS'});reject('ACTIVITY_BOUND_TO_TWO_SESSIONS');continue;}
  // A correction that resolves a conflict retires every report on its identity: none of them is a row in force to merge it into (SEC-R2-03:
  // merged into a retired row, the correction and the session would both leave the record in force).
  const previous=dropsIdentity||admit&&heldBefore?undefined:byIdentity.get(identity);
  if(previous&&(!physicalAgrees(previous,o,loadIncrements)||responseConflicts(previous.response,o.response))){
   flagConflict(previous,'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS');quarantined.add(identity);keepVoice(previous,o,source,activityId);
   conflicts.push({identity,eventIds:[previous.eventId,o.eventId],reason:'CONFLICTING_PHYSICAL_OR_RESPONSE_REPORTS'});reject('DUPLICATE_CONFLICT_QUARANTINED');continue;
  }
  // Admitted: the correction now replaces what it names.
  admit?.();
  if(previous){
   // Complementary duplicate: one execution from two reports (R7-A mergeActual); subjective response from whoever reported it.
   const parts=previous.provenance.parts??{[previous.eventId]:partOf(previous)};
   previous.actual=mergeActual(previous,o,SOURCE_RANK[previous.provenance.sourceQuality]??0,SOURCE_RANK[o.provenance.sourceQuality]??0);
   previous.provenance.inputHashes={...(previous.provenance.inputHashes??{}),[o.eventId]:hash({...source,athleteId})};
   for(const k of Object.keys(RESPONSE))if(previous.response[k]==='UNKNOWN'&&o.response[k]!=='UNKNOWN')previous.response[k]=o.response[k];
   previous.provenance.mergedSourceIds=[...new Set([...(previous.provenance.mergedSourceIds??[previous.eventId]),o.eventId])];
   previous.provenance.parts={...parts,[o.eventId]:partOf(o)};
   setFirstRecorded(previous,firstRecorded(previous,o));
   duplicates.push({eventId:o.eventId,mergedInto:previous.eventId,reason:'SAME_EXECUTION_DIFFERENT_SOURCE'});byEvent.set(o.eventId,previous);if(activityId&&!byActivity.has(activityId))byActivity.set(activityId,previous);continue;
  }
  const row={...o,identity,inputHash:hash({...source,athleteId})};
  if(inherited?.length){
   const own=partOf(row);
   for(const {id,p,inputHash} of inherited){
    const other={actual:p.actual,response:p.response};
    // A correction that disagrees with a report still in force is a conflict on the execution: quarantined, never merged by arrival order.
    if(!physicalAgrees(row,other,loadIncrements)||responseConflicts(row.response,p.response)){flagConflict(row,'CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE');quarantined.add(identity);conflicts.push({identity,eventIds:[o.eventId,id],reason:'CORRECTION_CONFLICTS_WITH_A_REPORT_IN_FORCE'});continue;}
    row.actual=mergeActual(row,other,SOURCE_RANK[row.provenance.sourceQuality]??0,SOURCE_RANK[p.sourceQuality]??0);
    for(const k of Object.keys(RESPONSE))if(row.response[k]==='UNKNOWN'&&p.response?.[k]&&p.response[k]!=='UNKNOWN')row.response[k]=p.response[k];
    if(inputHash)row.provenance.inputHashes={...row.provenance.inputHashes,[id]:inputHash};
    row.provenance.mergedSourceIds=[...new Set([...(row.provenance.mergedSourceIds??[row.eventId]),id])];
   }
   row.provenance.parts={[o.eventId]:own,...Object.fromEntries(inherited.map(x=>[x.id,x.p]))};
   for(const {id} of inherited)byEvent.set(id,row);
  }
  // E-1 (QRE-CORE-01): a live row answers for the reports it holds as parts (the ones its own provenance merged), before any superseded row the
  // record carried earlier: a later correction of one of them finds the row in force.
  {const made=new Set([...Object.keys(row.provenance?.inputHashes??{}),...(row.provenance?.mergedSourceIds??[])]);for(const id of Object.keys(isObject(row.provenance?.parts)?row.provenance.parts:{}))if(made.has(id))byEvent.set(id,row);}
  accepted.push(row);byEvent.set(o.eventId,row);byIdentity.set(identity,row);for(const id of [...Object.keys(o.provenance?.inputHashes??{}),...(o.provenance?.mergedSourceIds??[])])if(!byEvent.has(id))byEvent.set(id,row);
  // F2: the row binds its own activity and every activity its parts carried (a watch report merged into an athlete's row, a part a correction kept).
  for(const id of [activityId,...Object.values(isObject(row.provenance?.parts)?row.provenance.parts:{}).map(p=>isObject(p)?p.activityId:null)])if(id&&!byActivity.has(id))byActivity.set(id,row);
 }
 accepted.sort((a,b)=>Date.parse(a.observedAt)-Date.parse(b.observedAt)||byCodePoint(a.eventId,b.eventId));
 return {observations:accepted.map(({identity,inputHash,...o})=>o),accepted:accepted.map(({identity,inputHash,...o})=>o),excluded,superseded,supersededRows:supersededRows.map(({identity,inputHash,...o})=>o),duplicates,conflicts,quarantinedIdentities:[...quarantined],asOf:now,causalCutoff:now};
}
