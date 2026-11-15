import {clone,hash} from './value.mjs';
import {localDate} from './r6-provenance.mjs';

/**
 * CoachingCore V1 Run Workout Structure, Athlete Data Foundation (2026-11-13, gap G1): the dated distance of the runs an athlete did, as history.
 * - A pure reader. It sets no dose, credit, pace or capacity: its only consumers are the distance reference of the last 30 days (L30, the CT-3
 *   expression bound) and the comparable long run of the native continuous formats (SSCTR-RWS-R3A A2). Minutes are never turned into kilometres.
 * - Three sources, one run counted once: the engine's own record (sessions of the plan, and runs imported outside the plan that state
 *   `actual.sport: 'RUN'`), and this extension's append-only `runHistoryRecord` (the runs an intake imported or declared, which the engine does not
 *   keep). The same activity in two sources is one run, and the engine's row is the one read.
 * - The four facts of a run stay apart (R3A A1): the measured distance with its source and quality, the distance the athlete declared, and what
 *   each may be used for. The distance a run contributes as history is `historyReference`: the measurement alone, the declaration alone, or the
 *   smaller of the two; a measurement the device flagged as poor, alone, is no reference.
 * Values: CoachingCore/v1/RUN_FORMATS_V1.json (`runFacts`, `tied`), passed in as `V`.
 */
export const RUN_HISTORY_FACT='RUN_HISTORY_FACT';
export const HISTORY_ORIGINS=Object.freeze({IMPORT:'IMPORT',INTAKE_DECLARED:'INTAKE_DECLARED',LEDGER:'LEDGER',LEDGER_UNPLANNED:'LEDGER_UNPLANNED'});

const DAY=86400000;
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const list=v=>Array.isArray(v)?v:[];
const num=(v,lo=-Infinity,hi=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const upper=v=>typeof v==='string'&&v.trim()?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(Date.parse(v+'T00:00:00Z')).toISOString().slice(0,10)===v;
export const dayGap=(start,end)=>Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/DAY);
export const onDate=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*DAY).toISOString().slice(0,10);
const km=v=>Math.round(v*1000)/1000;

/**
 * The distance facts of one run, read from an execution (`actual`): never rewritten, never inferred from minutes.
 * - `measuredKm`: the distance a device or a course measured (the first recording plus any further recording of the same run, `segments`), only
 *   from a measured source. `wearable` says the report came from a device activity, whose distance is device distance when no source is stated.
 * - `manualKm`: a figure no device measured (typed into the measured slot: `measurement: 'MANUAL'`, or no source on a manual report; the composed
 *   entry point keeps it as `manualDistanceKm`): the athlete's own figure, which history reads as a declaration and no reader as a measurement.
 * - `implausible`: the measurement gives a pace outside the calibration's fault window, or more than one report may carry: a fault, never a run.
 * - `declaredKm`, `reason`: the athlete's explicit declaration (`actual.declared`) and its measurement-failure reason when it is one of the closed list.
 * - `devicePoor`: the source itself flagged the measurement (`gpsQuality: 'POOR'`, of the run or of one of its recordings).
 * - `markedPoor`: the measurement's reliability is POOR (R3A A1, fact 3): flagged by its source, or by the run's own facts, which say the first
 *   recording is not the run measured whole: it was sent in several recordings (`several`), or the athlete corrected it with a listed failure
 *   reason (`corrected`). It is read from the facts of the row as the record holds it now, never from a mark set when a report arrived: one run
 *   reported by several sources is one row, and whichever report brought each fact, the row reads the same (QRE-RWS-B-01).
 * - `untimed`: a measured distance with no duration of the run: its pace cannot be checked against the fault window, so it is no usable
 *   measurement, no pace evidence and no history (QRE-RWS-B-02).
 * - `disputed`: the athlete's own figure and the measurement differ by more than a working device is known to (the tied 0.91, R3A A1): one of
 *   them is not the run.
 * - `paceWithheld`: why this run's distance is never handed to a reader of pace or capacity (the calibration, a later forecast), or null. Beside
 *   the reasons above, `reports` is what the caller found in the reports the row was made of (v1-run-format.mjs reportsVerdict): each reason
 *   above as any one of those reports states it on its own, whatever the merged row kept of it; REPORT_NOT_CARRIED when a report still in force
 *   for the session is none of the reports the row was made of (evidence lineage, SSCTR item L1: the row no longer says all that was said of the
 *   run, and what it lost is not enumerated); or REPORTS_UNREADABLE when the record of what the reports said cannot be read whole. `reports` is
 *   that word, or the whole reading ({withheld, wholeRow, firstKm, wholeKm}). The last two reasons are of the row, not of its distance
 *   (WHOLE_ROW_WITHHELD): they stand on a row that carries no distance too, whose work pace is then no pace evidence either, and there no
 *   reason of the distance hides them: the reading gives them apart (`wholeRow`), since the one word names a reason of the distance first.
 * - `firstKm`: the first recording's own distance, when it is a measurement. `said`: what the reports in force say that can only lower this
 *   run's history reference (historyReference; SSCTR items L3 and L4), or null.
 * - `lists`, `corrects`, `ownKm`: what the report states whether or not it carries a distance itself (it lists further recordings; it declares
 *   with a listed failure reason; the athlete's own figure). They are what a report fact keeps (v1-run-format.mjs reportFactOf): the engine's
 *   merge keeps one value per field, so a row can lose what one of its reports said, and no reader of pace may lose it with the row.
 */
export const PACE_WITHHELD=Object.freeze(['SEVERAL_RECORDINGS','CORRECTED_MEASUREMENT','DURATION_REQUIRED','DISTANCE_DISPUTED','REPORT_NOT_CARRIED','REPORTS_UNREADABLE']);
/** The reasons that are of the row whole and not of its distance: they withhold a row from pace readers whether or not it carries a distance. */
export const WHOLE_ROW_WITHHELD=Object.freeze(['REPORT_NOT_CARRIED','REPORTS_UNREADABLE']);
/**
 * The further recordings a report lists (`actual.segments`). No list, or an empty one, states nothing: it is never read as "one recording only".
 * A value that is there and is no list cannot be read, and is one recording nobody can read: the run is not one whole measurement (fail closed).
 */
export const recordingsOf=a=>{const v=isObj(a)?a.segments:undefined;return Array.isArray(v)?v:v===undefined||v===null?[]:[null];};
/**
 * The stop a report declares, as it was sent, or null. No stop is no key, null or false. Anything else is a stop: one that is no object has no
 * reason anybody can read, and is read as a stop with no stated reason (never as no stop: a safety signal fails closed).
 */
export const statedStop=a=>{const v=isObj(a)?a.stop:undefined;return v===undefined||v===null||v===false?null:isObj(v)?v:{};};
export function distanceFacts(actual,V,{wearable=false,reports=null}={}){
 const a=isObj(actual)?actual:{},F=V.runFacts,stated=upper(a.measurement),source=stated??(wearable&&num(a.distanceKm,0.01,F.runDistanceKmMax)?'GPS':null);
 const has=num(a.distanceKm,0.01,F.runDistanceKmMax),measuredSource=F.measuredSources.includes(source),listed=recordingsOf(a),all=listed.filter(isObj),segs=all.slice(0,F.segmentsMax);
 const segOk=all.length<=F.segmentsMax&&segs.every(s=>num(s.distanceKm,0.01,F.runDistanceKmMax)&&F.measuredSources.includes(upper(s.measurement)??source));
 const deviceQuality=upper(a.gpsQuality),devicePoor=deviceQuality==='POOR'||segs.some(s=>upper(s.gpsQuality)==='POOR');
 const d=isObj(a.declared)&&num(a.declared.distanceKm,0.01,F.runDistanceKmMax)?a.declared:null,reason=d?upper(d.reason):null;
 const several=listed.length>0,corrected=!!d&&F.declaredFailureReasons.includes(reason),markedPoor=devicePoor||has&&(several||corrected);
 const total=has&&measuredSource&&segOk?km(a.distanceKm+segs.reduce((n,s)=>n+s.distanceKm,0)):null,measuredKm=total!==null&&total<=F.runDistanceKmMax?total:null;
 // A pace outside the calibration's own fault window (2:00 to 15:00 per km) is a measurement fault, never a distance run (QRE-V1RC-07).
 const minutes=num(a.seconds,1)?a.seconds/60:num(a.minutes,0.01)?a.minutes:null,pace=measuredKm!==null&&minutes!==null?minutes*60/measuredKm:null,[fastest,slowest]=F.plausiblePaceSecondsPerKm;
 const typed=num(a.manualDistanceKm,0.01,F.runDistanceKmMax)?a.manualDistanceKm:has&&!measuredSource?a.distanceKm:null;
 const untimed=has&&measuredSource&&minutes===null,own=d?d.distanceKm:typed,disputed=own!==null&&measuredKm!==null&&Math.min(own,measuredKm)<V.tied.correctionFloorFraction*Math.max(own,measuredKm)-1e-9;
 const reading=isObj(reports)?reports:null,word=reading?reading.withheld:reports,told=PACE_WITHHELD.includes(word)?word:null;
 // The reason of the row whole is read apart from the one word (QRE-RWS-E-01): in the word a reason of the distance comes first, and on a row
 // that carries no distance it withholds nothing, so it would hide that the row does not carry every report in force.
 const ofRow=[reading?.wholeRow,told].find(w=>WHOLE_ROW_WITHHELD.includes(w))??null;
 const paceWithheld=!has?ofRow:several?'SEVERAL_RECORDINGS':corrected?'CORRECTED_MEASUREMENT':untimed?'DURATION_REQUIRED':disputed?'DISTANCE_DISPUTED':told??ofRow;
 return {measuredKm,source:measuredKm!==null?source:null,segments:segs.length,implausible:has&&measuredSource&&(measuredKm===null||pace!==null&&(pace<fastest||pace>slowest)),untimed,
  quality:measuredKm!==null?(markedPoor?'POOR':deviceQuality==='OK'?'OK':'UNKNOWN'):null,devicePoor:measuredKm!==null&&devicePoor,
  manualKm:typed,declaredKm:d?d.distanceKm:null,reason:corrected?reason:null,reasonGiven:!!reason,markedPoor,several:has&&several,corrected:has&&corrected,disputed,paceWithheld,lists:several,corrects:corrected,ownKm:own,
  firstKm:measuredKm!==null?a.distanceKm:null,said:reading?{firstKm:num(reading.firstKm,0.01)?reading.firstKm:null,wholeKm:num(reading.wholeKm,0.01)?reading.wholeKm:null}:null};
}
/**
 * The distance a run contributes as history (R3A values.historyReference): a usable measurement alone is the measured value; a declaration alone
 * (an explicit one, or a manual figure) the declared value; both, the smaller, whatever the measurement's quality; a device-flagged measurement
 * alone, none; a measurement that is a fault, or that no duration lets be checked, alone, none. A correction therefore never raises a run's history.
 * What the reports in force say of the run (`f.said`, v1-run-format.mjs reportsReading) only ever lowers it, and never gives a reference to a
 * run that has none of its own (SSCTR lineage items L3-b, L4-b; R3A A1 (6): the smaller of the usable facts):
 * - L3: the further recordings a row lists are added to the smaller of the row's first recording and the first distance the report that listed
 *   them states for itself. After a merge the row's distance can be one report's and its list another's: two sources that each measured the
 *   whole run, one of them listing a further recording, are one run counted once. The measured distance a completion reads is not touched.
 * - L4: the smaller of that and the smallest distance a report in force states for the whole run, when that report is none of the reports the
 *   row was made of, or when the row's own reports dispute its distance. The same statements then give the same reference in any arrival order.
 */
export function historyReference(f){
 const declared=f.declaredKm??f.manualKm??null,said=isObj(f.said)?f.said:null;
 const measured=f.measuredKm!==null&&f.segments>0&&said&&said.firstKm!==null&&said.firstKm<f.firstKm?km(f.measuredKm-f.firstKm+said.firstKm):f.measuredKm;
 const own=measured!==null&&declared!==null?Math.min(measured,declared):measured!==null?(f.devicePoor||f.implausible||f.untimed?null:measured):declared;
 return own!==null&&said&&said.wholeKm!==null&&said.wholeKm<own?said.wholeKm:own;
}

// ---------- the extension's record of runs the engine does not keep ----------
const factRow=(athleteId,recordedAt,run)=>({fact:RUN_HISTORY_FACT,eventId:run.id,athleteId,recordedAt,run:clone(run),inputHash:hash(run)});
const readable=(o,athleteId)=>isObj(o)&&o.fact===RUN_HISTORY_FACT&&o.athleteId===athleteId&&typeof o.eventId==='string'&&isObj(o.run)&&o.run.id===o.eventId&&o.inputHash===hash(o.run)&&isoDay(o.run.date)&&Number.isFinite(Date.parse(o.recordedAt));
/** The raw history rows of an intake (the engine reads their minutes and drops the rest). */
const historyRows=input=>list(isObj(input)?(input.history??input.athlete?.history):null);
/**
 * The runs an intake brings with a distance and a date: each imported run (a history row of sport RUN), and the one recent run the athlete may
 * declare with a distance and a run date (`athlete.recentLongestRun`). A row without a date, a distance or a stated sport is no fact and is named.
 */
export function factsFromIntake(input,V){
 const facts=[],skipped=[],asOf=isObj(input)&&typeof input.asOf==='string'&&isoDay(input.asOf.slice(0,10))?input.asOf.slice(0,10):null;
 historyRows(input).forEach((h,i)=>{
  if(!isObj(h))return;const day=typeof h.startedAt==='string'&&isoDay(h.startedAt.slice(0,10))?h.startedAt.slice(0,10):isoDay(h.date)?h.date:null,activityId=typeof(h.canonicalActivityId??h.activityId)==='string'?(h.canonicalActivityId??h.activityId):null;
  if(upper(h.sport)!=='RUN'){if(num(h.distanceKm,0.01)&&!upper(h.sport))skipped.push({index:i,reason:'SPORT_NOT_STATED'});return;}
  const f=distanceFacts({distanceKm:h.distanceKm,measurement:h.measurement,gpsQuality:h.gpsQuality,segments:h.segments,minutes:h.durationMinutes},V,{wearable:true});
  if(!day||(asOf&&day>asOf)){skipped.push({index:i,reason:'DATE_REQUIRED'});return;}
  if(f.measuredKm===null&&f.manualKm===null){if(f.implausible)skipped.push({index:i,reason:'MEASUREMENT_IMPLAUSIBLE'});return;} // minutes only: the engine's own reading, never a distance
  if(h.completeness==='PARTIAL'){skipped.push({index:i,reason:'PARTIAL_ACTIVITY'});return;}
  const id='import:'+(activityId??day+':'+hash({d:h.distanceKm,m:h.durationMinutes??null}).slice(0,12));
  facts.push({id,activityId,date:day,minutes:num(h.durationMinutes,0.5,1440)?h.durationMinutes:null,measuredKm:f.measuredKm,source:f.source,quality:f.quality,devicePoor:f.devicePoor,implausible:f.implausible||f.untimed,declaredKm:f.manualKm,conditions:list(h.conditions).map(upper).filter(Boolean).sort(),origin:HISTORY_ORIGINS.IMPORT});
 });
 const r=isObj(input?.athlete)?input.athlete.recentLongestRun:undefined;
 if(r!==undefined&&r!==null){
  // An intake declaration is the athlete's word about one run: a distance and the run's own date, never a measurement (R3A A2 ii).
  if(isObj(r)&&num(r.distanceKm,0.01,300)&&isoDay(r.date)&&(!asOf||r.date<=asOf))facts.push({id:'intake-declared:'+r.date,activityId:null,date:r.date,minutes:num(r.minutes,0.5,1440)?r.minutes:null,measuredKm:null,source:null,quality:null,devicePoor:false,implausible:false,declaredKm:r.distanceKm,conditions:[],origin:HISTORY_ORIGINS.INTAKE_DECLARED});
  else skipped.push({index:'recentLongestRun',reason:'DISTANCE_AND_RUN_DATE_REQUIRED'});
 }
 return {facts,skipped};
}
/**
 * The record after an intake: the carried rows as received (append-only, readable or not), plus one row per new run. The same activity twice in
 * one import, or again in a later intake, is one row: the first recorded stands.
 */
export function appendHistory(record,facts,{athleteId,recordedAt}){
 const carried=list(record).map(r=>clone(r)),ids=new Set(carried.filter(isObj).map(r=>r.eventId)),added=[],duplicates=[];
 for(const f of list(facts)){if(ids.has(f.id)){duplicates.push(f.id);continue;}ids.add(f.id);added.push(factRow(athleteId,recordedAt,f));}
 return {record:[...carried,...added],added:added.map(r=>r.eventId),duplicates};
}

// ---------- reading the engine's record ----------
const recordedDay=(o,tz)=>Number.isFinite(Date.parse(o.provenance?.firstRecordedAt))?localDate(new Date(Date.parse(o.provenance.firstRecordedAt)).toISOString(),tz):o.localDate;
/** The activity identities of a row: a device activity id, and every report merged into the row. */
const idsOfRow=o=>[...new Set([o.canonicalActivityId,o.source?.activityId,o.provenance?.activityId].filter(x=>typeof x==='string'&&x))];
/**
 * The runs the engine's record holds: this athlete's live, unconflicted rows of a planned run session, and the rows it could bind to no session
 * that state `actual.sport: 'RUN'` themselves (an import outside the plan: without the stated sport a row is no run, G2).
 */
export function factsFromLedger(ledger,{athleteId,tz=0,reportsOf=null},V){
 const out=[];
 for(const o of list(ledger)){
  if(!isObj(o)||o.fact||o.superseded===true||o.conflicted===true||o.athleteId!==athleteId||!isObj(o.actual)||!isoDay(o.localDate))continue;
  const planned=o.context?.sport==='RUN',loose=o.context?.sessionType==='UNPLANNED'&&upper(o.actual.sport)==='RUN';if(!planned&&!loose)continue;
  if(!(o.actual.completed===true||num(o.actual.minutes,0.01)))continue; // a report that the session was not done is no run
  const wearable=String(o.provenance?.sourceQuality??'').startsWith('WEARABLE'),f=distanceFacts(o.actual,V,{wearable,reports:typeof reportsOf==='function'?reportsOf(o):null});
  out.push({id:'ledger:'+o.eventId,eventId:o.eventId,sessionId:planned?o.sessionId:null,activityIds:idsOfRow(o),date:o.localDate,recordedOn:recordedDay(o,tz),minutes:num(o.actual.seconds,1)?o.actual.seconds/60:num(o.actual.minutes,0.01)?o.actual.minutes:null,
   ...f,family:planned?o.context.family:null,mode:planned?o.context.mode:null,partial:o.partial===true,stopReason:(stop=>stop?(V.stops.reasons.includes(upper(stop.reason))?upper(stop.reason):V.stops.missingReasonReadAs):null)(statedStop(o.actual)),conditions:list(o.actual.conditions).map(upper).filter(Boolean).sort(),formatHash:typeof o.actual.formatHash==='string'?o.actual.formatHash:null,origin:planned?HISTORY_ORIGINS.LEDGER:HISTORY_ORIGINS.LEDGER_UNPLANNED});
 }
 return out;
}
/**
 * Every run on record as one list, each run once: the engine's rows, then the extension's rows that are no run the engine already holds (the same
 * device activity). Two runs on one day with different identities stay two runs; nothing is merged by date. `unreadable` names the extension rows
 * that failed their own integrity check: they are never read and never rewritten. `reportsOf` gives, for a row of the engine's record, what the
 * reports of its session say of it (see distanceFacts): the word that withholds it from pace readers, or the whole reading.
 */
export function runHistory({ledger,record,athleteId,tz=0,reportsOf=null},V){
 const runs=factsFromLedger(ledger,{athleteId,tz,reportsOf},V),held=new Set(runs.flatMap(r=>r.activityIds)),unreadable=[],seen=new Set();
 // An activity the engine holds in any row, usable or not (a conflicted or superseded row too), is the engine's to read.
 for(const o of list(ledger))if(isObj(o)&&!o.fact)for(const id of idsOfRow(o))held.add(id);
 for(const r of list(record)){
  if(!readable(r,athleteId)){if(isObj(r)&&r.fact===RUN_HISTORY_FACT)unreadable.push(typeof r.eventId==='string'?r.eventId:null);continue;}
  if(seen.has(r.eventId))continue;seen.add(r.eventId);
  const f=r.run;if(f.activityId&&held.has(f.activityId))continue;
  // A run an intake brought was on record when its plan was made: it is in force by its own date.
  runs.push({...clone(f),activityIds:f.activityId?[f.activityId]:[],recordedOn:f.date,manualKm:null,reason:null,reasonGiven:false,markedPoor:f.quality==='POOR',untimed:false,paceWithheld:null,lists:false,corrects:false,ownKm:f.declaredKm??null,segments:0,family:null,mode:null,partial:false,stopReason:null,formatHash:null,sessionId:null});
 }
 return {runs:runs.map(r=>({...r,referenceKm:historyReference(r)})).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.id<b.id?-1:1),unreadable};
}
/** What a week reads: runs dated and recorded before its cutoff (the week's first day, or the day after the review for a week not yet started). */
export const inForce=(r,cutoff)=>r.date<cutoff&&r.recordedOn<cutoff;
/**
 * L30 (R3A values.continuous.checks.CT-3): the largest history reference among executed runs of any family and status, races included, dated
 * within the 30 days before the week's first day, from any source. Null when no such run has a reference (DISTANCE_HISTORY_UNKNOWN).
 */
export function L30(runs,{cutoff,weekStart},V){
 const used=runs.filter(r=>inForce(r,cutoff)&&dayGap(r.date,weekStart)<=V.tied.distanceReferenceDays&&r.referenceKm!==null).sort((a,b)=>b.referenceKm-a.referenceKm||(a.id<b.id?-1:1))[0]??null;
 return used?{km:used.referenceKm,runId:used.id,date:used.date,origin:used.origin}:null;
}
/**
 * The comparable long run (R3A values.eligibility.continuous.LONG): the latest executed run in the record (the engine's rows or an import) dated
 * within the 28 days before the week's first day, with at least M - 5 minutes and a history reference. An intake declaration is no executed run
 * in the record and never qualifies. Its pace (sizing source S2) is its minutes over its history reference, so a correction or a declaration only
 * ever makes it slower; a treadmill run or one under a flagged condition qualifies and gives no pace.
 */
export function comparableLongRun(runs,{cutoff,weekStart,minutes},V){
 const T=V.tied,X=V.sizingExclusions,r=runs.filter(x=>inForce(x,cutoff)&&dayGap(x.date,weekStart)<=T.windowDays&&x.origin!==HISTORY_ORIGINS.INTAKE_DECLARED&&x.minutes!==null&&x.minutes>=minutes-T.longRunStepMinutes-1e-9&&x.referenceKm!==null).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:a.id<b.id?-1:1)[0]??null;
 if(!r)return null;
 const noPace=X.measurements.includes(r.source)||r.conditions.some(c=>X.conditions.includes(c));
 return {runId:r.id,date:r.date,minutes:r.minutes,referenceKm:r.referenceKm,origin:r.origin,secondsPerKm:noPace?null:r.minutes*60/r.referenceKm};
}
/**
 * The latest executed run of a class (sizing source S3, R3 values.continuous.paceSizingSources): the newest planned run of that family in the 28
 * days before the week's first day with recorded minutes and a distance, whatever its status; never a treadmill run, a measurement marked POOR
 * (by its source or by the run's own facts), a distance withheld from pace readers, a flagged condition or a stop for a symptom.
 */
export function latestClassRun(runs,{cutoff,weekStart,family},V){
 const T=V.tied,X=V.sizingExclusions,r=runs.filter(x=>inForce(x,cutoff)&&dayGap(x.date,weekStart)<=T.windowDays&&x.origin===HISTORY_ORIGINS.LEDGER&&x.family===family&&x.minutes!==null&&x.referenceKm!==null
  &&!X.measurements.includes(x.source)&&!x.markedPoor&&!x.devicePoor&&!x.paceWithheld&&!x.conditions.some(c=>X.conditions.includes(c))&&!X.stopReasons.includes(x.stopReason)).sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:a.id<b.id?-1:1)[0]??null;
 return r?{runId:r.id,date:r.date,secondsPerKm:r.minutes*60/r.referenceKm}:null;
}
