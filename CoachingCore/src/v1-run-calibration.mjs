import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {clone,freeze,hash} from './value.mjs';
import {utcTimestamp,localDate} from './r6-provenance.mjs';
import {standingHolds,readableF08,isF08Fact} from './v1-f08.mjs';

/**
 * CoachingCore V1 Run Calibration Extension (Founder request of 2026-11-11): V1X-RUN-CALIBRATION. COACHINGCORE-V1-FREEZE-1 prescribes running by
 * time and effort cue only. This module adds, beside the unchanged prescription: the athlete's current running capacity with its evidence and
 * uncertainty, pace bands by effort domain, heart-rate zones when the data supports them, and estimates of current race performance.
 * - It changes no dose, gate, phase or progression: the effort cue remains the prescription and a band is guidance bound to it.
 * - It is a pure function of the record: the intake's performance anchors, the logged sessions (the engine's own ledger rows) and the declared
 *   performance evidence (this extension's own append-only channel). It keeps no state of its own.
 * - It changes only at a week boundary: the calibration of week w reads evidence dated before week w starts, so a band shown for a week never
 *   moves inside it. Withdrawal (a hold, a long break, a return) is the exception and is immediate.
 * - Fail closed: the values are CoachingCore/v1/RUN_CALIBRATION_EXTENSION_V1.json, read only as the pinned bytes, and each boundary is on only with
 *   an independent SSCTR record bound to those bytes (as V1X-EVENTS). Off is the frozen behaviour: effort only.
 * - Kept from the standing authority: no pace from a goal time, nothing harder derived from easy pace, no physiological threshold claim.
 * - Every method and number is SSCTR-V1RC-DECISION-r1 (audits/coachingcore-v1-run-calibration-2026-11-11/ssctr-decision), cited here by question (Q1-Q10).
 */
export const RUN_EXTENSION_ID='V1X-RUN-CALIBRATION-1';
export const RUN_EXTENSION_SHA256='9f2cf47d84c68f57f8784c58aebbb236e9777614352cb05f9dcde1ad4e701d30';
export const RUN_EXTENSION_URL=new URL('../v1/RUN_CALIBRATION_EXTENSION_V1.json',import.meta.url);
export const RUN_RECORDS_URL=new URL('../../audits/coachingcore-v1-run-calibration-2026-11-11/reviews/ssctr/SSCTR_V1RC_RUN_RECORDS.json',import.meta.url);
/** The boundaries, each needing its own enabling record. PACE, HR and ESTIMATE also need CAPACITY. */
export const RUN_BOUNDARIES=freeze({CAPACITY:'V1X-RUN-CAPACITY',PACE:'V1X-RUN-PACE',HR:'V1X-RUN-HR',ESTIMATE:'V1X-RUN-ESTIMATE'});
export const RUN_CALIBRATION_VERSION='V1X-RUN-CALIBRATION-STATE-1';
export const RUN_EVIDENCE_DECLARED='RUN_EVIDENCE_DECLARED';
export const EVIDENCE_KINDS=freeze(['RACE_RESULT','FIELD_TEST','TIME_TRIAL','PERSONAL_BEST','LAB_TEST']);

const readBytes=url=>{try{return fs.readFileSync(url);}catch{return null;}};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const parse=bytes=>{try{return JSON.parse(bytes.toString('utf8'));}catch{return null;}};
const BYTES=readBytes(RUN_EXTENSION_URL);
export const RUN_EXTENSION_FILE_SHA256=BYTES?sha256(BYTES):null;
/** The values of a file's bytes, only when they are the pinned bytes. */
export const runExtensionOf=bytes=>bytes&&sha256(bytes)===RUN_EXTENSION_SHA256?freeze(parse(bytes)):null;
export const RUN_EXTENSION=runExtensionOf(BYTES);
const RECORD_BYTES=readBytes(RUN_RECORDS_URL),DEFAULT_RECORDS=RECORD_BYTES?parse(RECORD_BYTES):null;
const ENABLING=new Set(['APPROVE','APPROVE_WITH_CONDITIONS']),EVIDENCE_OK=new Set(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS']);

/**
 * Per-boundary activation (fail closed): a boundary is on only when the extension file is the pinned bytes and every independent SSCTR record bound
 * to that hash for the boundary enables it with supported evidence and at least one source. `options.runCalibration` supplies an authority object
 * directly (development and tests only).
 */
export function runCalibrationAuthority(options={}){
 if(options.runCalibration)return options.runCalibration;
 const records=options.runCalibrationRecords??DEFAULT_RECORDS,approved={},used=[];
 if(RUN_EXTENSION)for(const id of Object.values(RUN_BOUNDARIES)){
  const all=(Array.isArray(records?.records)?records.records:[]).filter(r=>r?.boundaryId===id&&r.extensionSha256===RUN_EXTENSION_SHA256);
  const ok=all.length>0&&all.every(r=>r.independent===true&&ENABLING.has(r.disposition)&&EVIDENCE_OK.has(r.evidenceStatus)&&Array.isArray(r.sourceIds)&&r.sourceIds.length>0);
  if(ok){approved[id]=true;used.push(...all.map(r=>({boundaryId:id,disposition:r.disposition,evidenceStatus:r.evidenceStatus,conditions:r.conditions??[],reviewId:r.reviewId??null})));}
 }
 return freeze({id:RUN_EXTENSION_ID,valid:!!RUN_EXTENSION,sha256:RUN_EXTENSION?RUN_EXTENSION_SHA256:null,approved,records:used,values:RUN_EXTENSION,source:'CURRENT_INDEPENDENT_REVIEW'});
}
/** Development-only authority: the boundaries named enabled over the file as read, pinned or not. Never sporting evidence. */
export function devRunCalibration(enabled=Object.values(RUN_BOUNDARIES),values=null){
 const v=values??(BYTES?parse(BYTES):null);
 return freeze({id:RUN_EXTENSION_ID,valid:!!v,sha256:RUN_EXTENSION_FILE_SHA256,approved:Object.fromEntries(enabled.map(id=>[id,true])),records:enabled.map(id=>({boundaryId:id,disposition:'DEV_TEST_ONLY'})),values:v,source:'DEV_TEST_ONLY'});
}
export const allowsRun=(ext,name)=>!!(ext?.valid&&ext.values&&ext.approved?.[RUN_BOUNDARIES.CAPACITY]&&ext.approved?.[RUN_BOUNDARIES[name]]);

// ---------- small values ----------
const DAY=86400000;
const num=(v,lo=-Infinity,hi=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const isoDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(Date.parse(v+'T00:00:00Z')).toISOString().slice(0,10)===v;
const onDate=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*DAY).toISOString().slice(0,10);
const dayGap=(start,end)=>Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/DAY);
const upper=v=>typeof v==='string'?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const list=v=>Array.isArray(v)?v:[];
const TIERS=['HIGH','MODERATE','LOW'];
const DISTANCES=freeze({'3K':3,'5K':5,'10K':10,'15K':15,HALF_MARATHON:21.0975,HALF:21.0975,MARATHON:42.195});
const unavailable=(reason,extra={})=>({status:'UNAVAILABLE',reason,...extra});

// ---------- evidence ----------
function secondsOf(x){
 if(num(x.seconds,1))return x.seconds;if(num(x.durationSeconds,1))return x.durationSeconds;
 if(num(x.durationMinutes,0.1))return x.durationMinutes*60;if(num(x.minutes,0.1))return x.minutes*60;
 const m=typeof x.time==='string'?x.time.match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/):null;
 return m?Number(m[1]??0)*3600+Number(m[2])*60+Number(m[3]):null;
}
/**
 * One piece of performance evidence in its canonical form, or the errors that keep it out. The same reader serves the intake's performance anchors,
 * a review's declarations and the extension's own record. A kind is never inferred beyond "a distance and a time with no kind is a race result".
 */
export function readEvidence(raw,{source='DECLARED',fallbackId=null}={}){
 const errors=[];if(!isObj(raw))return {evidence:null,errors:['evidence.object']};
 if(raw.sport!==undefined&&upper(raw.sport)!=='RUN')return {evidence:null,errors:['evidence.sport']};
 const distanceKm=num(raw.distanceKm,0.1,200)?raw.distanceKm:num(raw.distanceMeters,100,200000)?raw.distanceMeters/1000:DISTANCES[upper(raw.distance)]??null,seconds=secondsOf(raw);
 let kind=upper(raw.kind);if(!kind&&distanceKm&&seconds)kind='RACE_RESULT';
 if(!EVIDENCE_KINDS.includes(kind))errors.push('evidence.kind');
 const date=raw.date===undefined||raw.date===null?null:isoDay(raw.date)?raw.date:(errors.push('evidence.date'),null);
 if(kind!=='LAB_TEST'&&(!distanceKm||!seconds))errors.push('evidence.distanceAndTime');
 if(kind!=='PERSONAL_BEST'&&!date)errors.push('evidence.date');
 const hr=isObj(raw.heartRate)?{maxBpm:num(raw.heartRate.maxBpm,80,240)?Math.round(raw.heartRate.maxBpm):null,sensor:upper(raw.heartRate.sensor)}:null;
 const lab=isObj(raw.lab)?clone(raw.lab):null;
 if(kind==='LAB_TEST'&&!lab)errors.push('evidence.lab');
 if(raw.rpe!==undefined&&raw.rpe!==null&&!num(raw.rpe,0,10))errors.push('evidence.rpe');
 if(errors.length)return {evidence:null,errors:[...new Set(errors)]};
 const core={kind,date,distanceKm:distanceKm?Math.round(distanceKm*1000)/1000:null,seconds:seconds?Math.round(seconds):null,measurement:upper(raw.measurement)??'UNKNOWN',rpe:num(raw.rpe,0,10)?raw.rpe:null,
  completed:raw.completed!==false,tolerated:raw.tolerated===undefined||raw.tolerated===null?null:raw.tolerated===true,walkBreaks:raw.walkBreaks===true,conditions:list(raw.conditions).map(upper).filter(Boolean).sort(),protocol:upper(raw.protocol),
  replacedSessionId:typeof raw.replacedSessionId==='string'?raw.replacedSessionId:null,supersedes:typeof raw.supersedes==='string'?raw.supersedes:null,heartRate:hr,lab,source};
 const id=typeof raw.id==='string'&&raw.id.trim()?raw.id.trim():fallbackId??('ev-'+hash(core).slice(0,16));
 return {evidence:{id,...core},errors:[]};
}
/** The row a declaration adds to the extension's record: append-only, one row per evidence id (the first recorded stands), bound to its content. */
export const evidenceFact=(athleteId,asOf,evidence)=>({fact:RUN_EVIDENCE_DECLARED,eventId:evidence.id,athleteId,declaredAt:asOf,evidence:clone(evidence),inputHash:hash(evidence),provenance:{firstRecordedAt:asOf}});
const readableFact=(o,athleteId,atMs)=>isObj(o)&&o.fact===RUN_EVIDENCE_DECLARED&&o.athleteId===athleteId&&typeof o.eventId==='string'&&isObj(o.evidence)&&o.evidence.id===o.eventId&&o.inputHash===hash(o.evidence)&&Number.isFinite(Date.parse(o.declaredAt))&&Date.parse(o.declaredAt)<=atMs;
/**
 * The extension's record after a review: the carried rows unchanged, plus one row per new valid declaration. A declaration dated after the review,
 * malformed, or repeating an id on record is refused and named; nothing is ever rewritten.
 */
export function appendEvidence(record,declarations,{athleteId,asOf,timezoneOffsetMinutes=0}){
 const carried=list(record).filter(isObj).map(clone),ids=new Set(carried.map(r=>r.eventId)),refused=[],added=[],today=localDate(asOf,timezoneOffsetMinutes);
 for(const raw of list(declarations)){
  const {evidence,errors}=readEvidence(raw,{source:'DECLARED'});
  if(!evidence){refused.push({id:isObj(raw)&&typeof raw.id==='string'?raw.id:null,errors});continue;}
  if(evidence.date&&evidence.date>today){refused.push({id:evidence.id,errors:['evidence.dateAfterThisReview']});continue;}
  if(ids.has(evidence.id)){refused.push({id:evidence.id,errors:['evidence.idAlreadyOnRecord']});continue;}
  ids.add(evidence.id);added.push(evidenceFact(athleteId,asOf,evidence));
 }
 return {record:[...carried,...added],added:added.map(r=>r.eventId),refused};
}

// ---------- the conversion model (SSCTR-V1RC Q3: a range, never a point) ----------
/** Time over d2 from a performance (d1, t1) by the power law with exponent k. */
export const powerLawTime=(d1,t1,d2,k)=>t1*Math.pow(d2/d1,k);
/** Speed (km/s) the same curve sustains for `seconds`: v(T; k) = (D1 / T1) x (T / T1)^(1/k - 1). */
export const speedForDuration=(d1,t1,seconds,k)=>d1/t1*Math.pow(seconds/t1,1/k-1);
const ks=m=>[m.kLow,m.kCentral,m.kHigh];
/** A pace edge in seconds per km: rounded to 0.1 s, then up to the next slower multiple (a value already on a multiple stays). */
export const paceEdge=(speed,step)=>{const p=Math.round(1/speed*10)/10;return Math.ceil(p/step-1e-9)*step;};
/** STANDARD evidence (at most the half marathon) carries the curve; longer evidence serves the marathon target only and is never converted down. */
const isStandard=(e,V)=>e.distanceKm<=V.model.standard.maxDistanceKm*(1+V.model.sameDistanceRatioWithin);
const sameDistance=(a,b,V)=>Math.abs(a/b-1)<=V.model.sameDistanceRatioWithin;
/** The one scale results of a class are compared on (Q2): the 10K-equivalent central time; a longer result only against longer results. */
const comparisonTime=(e,V)=>isStandard(e,V)?powerLawTime(e.distanceKm,e.seconds,10,V.model.standard.kCentral):sameDistance(e.distanceKm,42.195,V)?e.seconds:powerLawTime(e.distanceKm,e.seconds,42.195,V.model.marathon.kCentral);

// ---------- reading the record ----------
const compatible=r=>r?.performance!=='UNDER'&&r?.recovery!=='ADVERSE'&&r?.nextDayFunction!=='IMPAIRED';
const rpeOf=o=>num(o.actual?.rpe,0,10)?o.actual.rpe:num(o.response?.rpe,0,10)?o.response.rpe:null;
/** Q8 comparability: distance on record, not a treadmill, GPS not flagged poor, no condition flag. */
const comparableRun=(o,V)=>!V.recalibration.notComparableMeasurements.includes(upper(o.actual?.measurement))&&upper(o.actual?.gpsQuality)!=='POOR'&&!list(o.actual?.conditions).map(upper).some(c=>V.recalibration.notComparableConditions.includes(c)||V.evidence.excludedConditions.includes(c));
/** The logged run sessions a calibration may read: this athlete's completed, whole rows with a local date. */
function runRows(ledger,athleteId){
 return list(ledger).filter(o=>isObj(o)&&!o.fact&&o.superseded!==true&&o.athleteId===athleteId&&o.context?.sport==='RUN'&&o.actual?.completed===true&&o.partial!==true&&o.conflicted!==true&&isoDay(o.localDate));
}
const minutesOf=o=>num(o.actual?.seconds,1)?o.actual.seconds/60:num(o.actual?.minutes,0.1)?o.actual.minutes:null;
/** The local day a row joined the record. A week's calibration reads only what was on record before the week started, so a late report of an
 * earlier session never moves a band inside the week (it counts from the next one). */
const recordedOn=(o,tz)=>Number.isFinite(Date.parse(o.provenance?.firstRecordedAt))?localDate(new Date(Date.parse(o.provenance.firstRecordedAt)).toISOString(),tz):o.localDate;
const inForce=(o,cutoff)=>o.date<cutoff&&o.recordedOn<cutoff;
/** An easy-pace observation (P1): an easy run in EASY mode, 20 minutes or more, with its distance and a reported effort of 4 or less, no walk breaks. */
function easyObservation(o,V,tz){
 const P=V.assessment.P1,min=minutesOf(o),d=o.actual?.distanceKm,rpe=rpeOf(o);
 if(!P.families.includes(o.context?.family)||o.context?.mode!=='EASY'||!num(d,0.5,80)||!min||min<P.minDurationMinutes||!comparableRun(o,V)||o.actual?.walkBreaks===true)return null;
 if(rpe===null||rpe>P.rpeReportedMax)return null;
 return {eventId:o.eventId,date:o.localDate,recordedOn:recordedOn(o,tz),secondsPerKm:min*60/d};
}
/**
 * The execution of a harder session of a domain, with what a calibration may read of it. `comparable`: its work pace is on record under Q8.
 * `onTarget`: the reported effort is inside the cue's range and the response was compatible. `harder`: reported above the cue.
 */
function hardExecution(o,V,tz,sessions){
 const domain=Object.keys(V.domains).find(d=>V.domains[d].class==='HARDER'&&V.domains[d].families.includes(o.context?.family));if(!domain)return null;
 const w=o.actual?.work,pace=num(w?.paceSecondsPerKm,120,900)?w.paceSecondsPerKm:num(w?.distanceKm,0.2,60)&&num(w?.seconds,30)?w.seconds/w.distanceKm:null;
 const rpe=rpeOf(o),[lo,hi]=V.effortCues[V.domains[domain].cue].rpe,planned=sessions.get(o.sessionId)?.prescription?.work??null,T=V.recalibration.training;
 return {eventId:o.eventId,sessionId:o.sessionId,week:o.context?.weekIndex??null,date:o.localDate,recordedOn:recordedOn(o,tz),domain,secondsPerKm:pace,rpe,
  comparable:!!pace&&o.context?.mode==='EASY'&&comparableRun(o,V)&&w?.walkBreaks!==true,onTarget:rpe!==null&&rpe>=lo&&rpe<=hi&&o.response?.effort!=='HARDER'&&compatible(o.response),harder:rpe!==null&&rpe>hi||o.response?.effort==='HARDER',
  // Q8: only a session whose every work bout is 5 minutes or more and whose work adds up to 15 or more can adjust a band.
  longBouts:!!planned&&num(planned.workMinutes,T.everyWorkBoutMinutesMin)&&planned.repetitions*planned.workMinutes>=T.totalWorkMinutesMin};
}
/** A race of the plan, logged with its distance and time, is a race result (the engine's own row, never a second declaration). */
function planRaces(rows,tz){
 return rows.filter(o=>o.context?.family==='RACE'&&num(o.actual?.distanceKm,1,100)&&minutesOf(o)).map(o=>{const r=o.response??{},said=[r.performance,r.recovery,r.nextDayFunction].some(x=>typeof x==='string'&&x!=='UNKNOWN');
  return {id:'plan-race:'+o.eventId,kind:'RACE_RESULT',date:o.localDate,recordedOn:recordedOn(o,tz),distanceKm:o.actual.distanceKm,seconds:Math.round(minutesOf(o)*60),measurement:upper(o.actual.measurement)??'UNKNOWN',rpe:rpeOf(o),completed:true,
   tolerated:!compatible(r)?false:said?true:null,walkBreaks:o.actual.walkBreaks===true,conditions:list(o.actual.conditions).map(upper).filter(Boolean).sort(),protocol:null,replacedSessionId:null,supersedes:null,
   heartRate:isObj(o.actual.heartRate)?{maxBpm:num(o.actual.heartRate.maxBpm,80,240)?Math.round(o.actual.heartRate.maxBpm):null,sensor:upper(o.actual.heartRate.sensor)}:null,lab:null,source:'PLAN_RACE'};});
}
/** Every piece of performance evidence the record holds for this athlete as of an instant, with the reasons any is refused. */
function gatherEvidence({program,ledger,evidenceRecord,asOfMs,tz}){
 const out=[],refused=[],seen=new Set(),push=e=>{if(seen.has(e.id))return;seen.add(e.id);out.push(e);};
 list(program.canonical?.athlete?.performanceAnchors).forEach((raw,i)=>{const {evidence,errors}=readEvidence(raw,{source:'INTAKE',fallbackId:isObj(raw)&&typeof raw.id==='string'?null:'intake-'+i});if(evidence)push(evidence);else refused.push({id:'intake-'+i,errors});});
 for(const r of list(evidenceRecord)){if(readableFact(r,program.athleteId,asOfMs))push({...clone(r.evidence),recordedOn:localDate(new Date(Date.parse(r.declaredAt)).toISOString(),tz)});else if(isObj(r)&&r.fact===RUN_EVIDENCE_DECLARED&&Date.parse(r.declaredAt)<=asOfMs)refused.push({id:typeof r.eventId==='string'?r.eventId:null,errors:['evidence.unreadableRow']});}
 planRaces(runRows(ledger,program.athleteId),tz).forEach(push);
 const superseded=new Set(out.map(e=>e.supersedes).filter(Boolean));
 return {evidence:out.filter(e=>!superseded.has(e.id)),refused};
}
/** Declared breaks of the record as [firstDay, lastDay] local dates (a break without an end runs to its declaration). */
function breaksOf(ledger,program){
 const tz=program.timezoneOffsetMinutes??0;
 return list(ledger).filter(o=>isObj(o)&&o.fact==='INTERRUPTION_DECLARED'&&o.athleteId===program.athleteId&&isObj(o.interruption)).map(o=>{
  const i=o.interruption,declared=Number.isFinite(Date.parse(o.declaredAt))?localDate(new Date(Date.parse(o.declaredAt)).toISOString(),tz):null,start=isoDay(i.startDate)?i.startDate:utcTimestamp(i.startedAt)?localDate(utcTimestamp(i.startedAt),tz):null;
  const end=isoDay(i.endDate)?i.endDate:start&&num(i.days,1,3650)?onDate(start,Math.round(i.days)-1):declared;
  const from=start??(end&&num(i.days,1,3650)?onDate(end,-(Math.round(i.days)-1)):null);
  return from&&end&&end>=from?{from,to:end,days:dayGap(from,end)+1}:null;}).filter(Boolean);
}

// ---------- capacity (Q1, Q2) ----------
/**
 * What one piece of evidence is to the capacity of the week whose first day is `cutoff`: its use, its recency class and the reasons. An old best is
 * history, never capacity; evidence before the last withdrawal (a long break, a hold, a return) is history too.
 */
function classify(e,{cutoff,floor,V}){
 const E=V.evidence,reasons=[],age=e.date?dayGap(e.date,cutoff):null;
 const base={id:e.id,kind:e.kind,date:e.date,distanceKm:e.distanceKm,seconds:e.seconds,source:e.source,ageDays:age};
 if(e.kind==='LAB_TEST')return {...base,use:'HEART_RATE_ONLY',recency:null,reasons};
 if(e.date&&e.date>=cutoff)return {...base,use:'NOT_YET_IN_FORCE',recency:null,reasons:['DATED_IN_OR_AFTER_THIS_WEEK']};
 if(e.recordedOn&&e.recordedOn>=cutoff)return {...base,use:'NOT_YET_IN_FORCE',recency:null,reasons:['RECORDED_IN_OR_AFTER_THIS_WEEK']};
 const undated=e.kind==='PERSONAL_BEST'&&!e.date,recency=undated?'HISTORICAL':age<=E.currentDays?'CURRENT':age<=E.agingDays?'AGING':'HISTORICAL';
 if(!e.completed)reasons.push('NOT_COMPLETED');
 if(e.tolerated===false)reasons.push('NOT_TOLERATED');else if(e.tolerated!==true)reasons.push('TOLERANCE_NOT_REPORTED');
 if(e.walkBreaks)reasons.push('WALK_BREAKS');
 if(!num(e.distanceKm,E.distanceKm[0],E.distanceKm[1]))reasons.push('DISTANCE_OUTSIDE_RANGE');
 if(!num(e.seconds,E.durationMinutes[0]*60,E.durationMinutes[1]*60))reasons.push('DURATION_OUTSIDE_RANGE');
 if(e.conditions.some(c=>E.excludedConditions.includes(c)))reasons.push('CONDITIONS_NOT_COMPARABLE');
 if(!(e.measurement in E.measurementTierReductions))reasons.push('MEASUREMENT_UNKNOWN');
 if(e.kind==='FIELD_TEST'&&e.protocol&&!V.assessment.P3.protocols[e.protocol])reasons.push('UNKNOWN_PROTOCOL');
 const cls=num(e.distanceKm,0.1)&&isStandard(e,V)?'STANDARD':'LONGER_THAN_HALF_MARATHON';
 if(reasons.length)return {...base,use:'REJECTED',recency,class:cls,reasons};
 if(recency==='HISTORICAL'||e.kind==='PERSONAL_BEST'&&recency!=='CURRENT')return {...base,use:'HISTORICAL_BEST',recency:'HISTORICAL',class:cls,reasons:[undated?'UNDATED_BEST':e.kind==='PERSONAL_BEST'?'BEST_IS_NOT_CURRENT_CAPACITY':'OLDER_THAN_CAPACITY_WINDOW']};
 if(floor&&e.date<=floor)return {...base,use:'HISTORICAL_BEST',recency,class:cls,reasons:['BEFORE_BREAK_HOLD_OR_RETURN']};
 return {...base,use:'CAPACITY',recency,class:cls,reasons};
}
/**
 * The reference of one class for a week (Q1, Q2): the most recent qualifying current result; a result of the conflict window more than the threshold
 * apart makes the slower of the two the reference and costs a tier; never the fastest. A newer result within the deadband of the reference in force
 * changes nothing (Q8). With no current result, an aged STANDARD one under training continuity is a presumed capacity capped at LOW. The tier is
 * HIGH less the summed reductions (measurement, effort, conflict, a 7 to 13 day break); three or more make the capacity unavailable.
 */
function selectReference(classified,byId,{cls,cutoff,breaks,V,heldId=null}){
 const usable=classified.filter(c=>c.use==='CAPACITY'&&c.class===cls).map(c=>({c,e:byId.get(c.id)})).sort((a,b)=>a.e.date<b.e.date?1:a.e.date>b.e.date?-1:a.e.id<b.e.id?-1:1);
 const current=usable.filter(x=>x.c.recency==='CURRENT'),flags=[],others=[];
 let pick=current[0]??null,presumed=false,reductions=0;
 if(!pick){
  if(cls!=='STANDARD')return null;
  pick=usable.filter(x=>x.c.recency==='AGING'&&!breaks.some(b=>b.days>=V.evidence.agingRequiresNoBreakDaysAtLeast&&b.to>x.e.date&&b.from<cutoff))[0]??null;presumed=!!pick;if(!pick)return null;
 }else{
  const C=V.conflict,t=x=>comparisonTime(x.e,V),rival=current.slice(1).filter(x=>dayGap(x.e.date,pick.e.date)<=C.windowDays&&Math.abs(t(x)/t(pick)-1)>C.thresholdFraction);
  if(rival.length){flags.push('CONFLICTING_EVIDENCE');reductions+=C.tierReduction;const slow=[pick,...rival].sort((a,b)=>t(b)-t(a))[0];others.push(...[pick,...rival].filter(x=>x!==slow).map(x=>x.e.id));pick=slow;}
  else{const held=heldId&&heldId!==pick.e.id?current.find(x=>x.e.id===heldId):null;if(held&&Math.abs(t(pick)/t(held)-1)<=V.recalibration.deadbandFraction){flags.push('NEWER_RESULT_INSIDE_DEADBAND');others.push(pick.e.id);pick=held;}}
 }
 const e=pick.e,E=V.evidence,measurement=E.measurementTierReductions[e.measurement];
 if(measurement){flags.push('MEASUREMENT_'+e.measurement);reductions+=measurement;}
 if(e.rpe===null){flags.push('EFFORT_UNKNOWN');reductions+=E.unknownEffortTierReduction;}else if(e.rpe<=E.lowerBoundRpeMax){flags.push('SUBMAXIMAL_LOWER_BOUND');reductions+=E.lowerBoundTierReduction;}
 const [lo,hi]=V.withdrawal.breakDaysTierDown;if(breaks.some(b=>b.days>=lo&&b.days<=hi&&b.to>e.date&&b.from<cutoff)){flags.push('SHORT_BREAK_SINCE_EVIDENCE');reductions+=V.confidence.shortBreakTierReduction;}
 if(e.kind==='FIELD_TEST')flags.push('TEST_NOT_RACE');
 if(presumed)flags.push('PRESUMED_FROM_AGED_EVIDENCE');
 if(reductions>=V.confidence.unavailableFromReductions)return {unsupported:true,flags,evidenceId:e.id};
 const tier=presumed?'LOW':TIERS[reductions],P=V.model.population,tenK=cls==='STANDARD'?comparisonTime(e,V)/60:null,marathonMinutes=cls==='STANDARD'?null:comparisonTime(e,V)/60;
 const slowRunner=tenK!==null?tenK>=P.slowRunnerFromTenKEquivalentMinutes:marathonMinutes>=P.slowRunnerFromMarathonMinutesWhenMarathonEvidenceOnly;
 return {evidenceId:e.id,evidence:e,cls,conflictsWith:flags.includes('CONFLICTING_EVIDENCE')?others:[],insideDeadbandOf:flags.includes('NEWER_RESULT_INSIDE_DEADBAND')?others:[],presumed,tier,flags:slowRunner?[...flags,'SLOW_RUNNER_MARGIN']:flags,
  margin:V.confidence.margin[tier]+(slowRunner?P.slowRunnerExtraMargin:0),tenKEquivalentMinutes:tenK,outsidePopulation:tenK!==null&&(tenK<P.tenKEquivalentCentralMinutes[0]||tenK>P.tenKEquivalentCentralMinutes[1]),
  result:{kind:e.kind,distanceKm:e.distanceKm,seconds:e.seconds,date:e.date,measurement:e.measurement},recency:presumed?'AGING':'CURRENT',validUntil:onDate(e.date,presumed?E.agingDays:E.currentDays)};
}

// ---------- estimates (Q7) ----------
/** The longest run the record shows in the days before the week: executed runs, results on record, and the intake's own figure while that recent. */
function longestRecentRun(program,rows,evidence,cutoff,days,tz){
 const fromLog=rows.filter(o=>o.localDate<cutoff&&recordedOn(o,tz)<cutoff&&dayGap(o.localDate,cutoff)<=days).map(minutesOf).filter(Boolean);
 const fromEvidence=evidence.filter(e=>e.date&&e.date<cutoff&&dayGap(e.date,cutoff)<=days&&e.completed&&num(e.seconds,1)&&!e.walkBreaks).map(e=>e.seconds/60);
 const intake=isoDay(program.canonical?.asOf?.slice?.(0,10))&&dayGap(program.canonical.asOf.slice(0,10),cutoff)<=days?program.capability?.run?.longestMinutes??null:null;
 return Math.max(0,...fromLog,...fromEvidence,intake??0);
}
const completionRace=program=>program.weeks.some(w=>w.sessions.some(s=>s.role==='RACE'&&s.prescription?.completion===true));
/**
 * The current estimate of one distance: its unrounded range (for the bands) and its rounded display values, or the typed reason it is unavailable.
 * STANDARD targets come from the STANDARD reference; the marathon only from a current half-marathon-or-longer result, inside the marathon block.
 */
function estimateOf(name,{program,std,long,longest,V}){
 const X=V.estimates,km=X.distancesKm[name],M=V.model,no=(reason,extra={})=>({status:'UNAVAILABLE',reason,...extra});
 let ref,K;
 if(name==='MARATHON'){
  const said={statement:X.marathon.statementWhenUnavailable};
  // A current half-marathon-or-longer result first; then the marathon block itself (its eligibility is the frozen engine's, SSCTR-V1FC B1).
  const sources=[long,std&&!std.presumed&&std.evidence.distanceKm>=X.marathon.evidenceKmMin*(1-M.sameDistanceRatioWithin)?std:null].filter(Boolean).sort((a,b)=>a.evidence.date<b.evidence.date?1:-1);
  if(!sources.length)return no(std?'MARATHON_NEEDS_HALF_OR_LONGER_RESULT':'NO_QUALIFYING_EVIDENCE',said);
  if(program.goal?.run?.event?.kind!=='MARATHON')return no('NOT_ELIGIBLE_FOR_MARATHON_BLOCK',said);
  if(completionRace(program))return no('COMPLETION_RACE_DAY');
  ref=sources[0];K=M.marathon;if(km/ref.evidence.distanceKm>K.maxDistanceRatio*(1+M.sameDistanceRatioWithin))return no('DISTANCE_RATIO_EXCEEDED',said);
 }else{
  if(!std)return no(long?'MARATHON_EVIDENCE_NOT_CONVERTED_DOWNWARD':'NO_QUALIFYING_EVIDENCE');
  if(std.outsidePopulation)return no('OUTSIDE_MODEL_POPULATION');
  ref=std;K=M.standard;const ratio=km/ref.evidence.distanceKm;
  if(!sameDistance(km,ref.evidence.distanceKm,V)&&(ratio>K.maxDistanceRatio||ratio<1/K.maxDistanceRatio))return no('DISTANCE_RATIO_EXCEEDED');
  if(ref.presumed&&!X.presumedEvidenceAllowed[name])return no('NO_QUALIFYING_EVIDENCE');
  const need=name==='10K'&&ref.evidence.distanceKm<X.tenK.fromEvidenceShorterThanKm&&!sameDistance(km,ref.evidence.distanceKm,V)?X.tenK.longestRunMinutesMin:name==='HALF_MARATHON'?(ref.evidence.distanceKm<10?X.halfMarathon.fromEvidenceShorterThan10KmLongestRunMinutesMin:X.halfMarathon.longestRunMinutesMin):0;
  if(longest<need)return no('ENDURANCE_NOT_DEMONSTRATED',{detail:`No run of ${need} minutes or more in the last ${X.longestRunWithinDays} days`});
 }
 const e=ref.evidence,m=ref.margin,same=sameDistance(km,e.distanceKm,V),times=same?[e.seconds]:ks(K).map(k=>powerLawTime(e.distanceKm,e.seconds,km,k));
 const central=same?e.seconds:powerLawTime(e.distanceKm,e.seconds,km,K.kCentral),lower=Math.min(...times)*(1-m),upper=Math.max(...times)*(1+m),u=X.roundOutwardSeconds[name];
 return {status:'AVAILABLE',kind:'CURRENT_ESTIMATE',distanceKm:km,lowSeconds:Math.floor(lower/u+1e-9)*u,centralSeconds:Math.round(central/u)*u,highSeconds:Math.ceil(upper/u-1e-9)*u,display:'RANGE_FIRST_CENTRAL_NEVER_ALONE',estimated:true,promise:false,
  basis:same?'SAME_DISTANCE_RESULT':'POWER_LAW_RANGE',model:name==='MARATHON'?'MARATHON':'STANDARD',reference:e.id,referenceKind:e.kind,referenceDate:e.date,recency:ref.recency,confidence:ref.tier,confidenceCauses:clone(ref.flags),margin:m,validUntil:ref.validUntil,
  flags:[...(ref.flags.includes('SUBMAXIMAL_LOWER_BOUND')?['EVIDENCE_IS_A_LOWER_BOUND']:[]),...(name==='MARATHON'?['MARATHON_WIDE_RANGE']:[])],statement:X.requiredText,unrounded:{central,lower,upper}};
}

// ---------- bands (Q4) ----------
const cueMeta=(def,V)=>({unit:V.paceRules.unit,effortCue:def.cue,rpe:clone(V.effortCues[def.cue].rpe),ceilingOnly:def.ceiling===true,effortGoverns:true,namedFactors:clone(V.paceRules.namedFactors)});
/** The band of a domain from the reference and the estimates, before any training factor: two speeds (km/s) and what they rest on, or the reason. */
function bandSpeeds(id,{std,long,estimates,V}){
 const def=V.domains[id],R=V.paceRules,S=V.model.standard,no=reason=>({reason});
 if(def.method==='RACE_PACE_ESTIMATE'){
  const est=estimates[def.event];if(est.status!=='AVAILABLE')return no(est.reason);
  const v=est.distanceKm/est.unrounded.central,m=est.margin;
  return {fast:v*(1-m*R.racePaceFastEdgeMarginShare),slow:Math.min(est.distanceKm/est.unrounded.upper,v*(1-R.slowEdgeMarginMultiple*m)),of:est,method:'CURRENT_RACE_PACE_ESTIMATE'};
 }
 if(!std)return no(long?'MARATHON_EVIDENCE_NOT_CONVERTED_DOWNWARD':'NO_QUALIFYING_EVIDENCE');if(std.outsidePopulation)return no('OUTSIDE_MODEL_POPULATION');
 const e=std.evidence,m=std.margin,at=(min,k)=>speedForDuration(e.distanceKm,e.seconds,min*60,k),slowest=min=>Math.min(...ks(S).map(k=>at(min,k))),ref=V.model.referenceDurationMinutes;
 const of={reference:e.id,referenceKind:e.kind,referenceDate:e.date,recency:std.recency,confidence:std.tier,confidenceCauses:clone(std.flags),margin:m,validUntil:std.validUntil};
 return def.method==='DURATION_ON_CURVE'?{fast:at(def.fastEdgeDurationMinutes,S.kCentral)*(1-m),slow:slowest(def.slowEdgeDurationMinutes)*(1-R.slowEdgeMarginMultiple*m),of,method:'DURATION_RANGE_ON_POWER_LAW_CURVE'}
  :{fast:def.fastFraction*at(ref,S.kCentral)*(1-m),slow:def.slowFraction*slowest(ref)*(1-R.slowEdgeMarginMultiple*m),of,method:'FRACTION_OF_REFERENCE_SPEED'};
}
const edges=(fastSpeed,slowSpeed,def,V)=>{const step=V.paceRules.roundUpToSecondsPerKm,fast=paceEdge(fastSpeed,step);return {fastSecondsPerKm:fast,slowSecondsPerKm:Math.max(paceEdge(slowSpeed,step),fast+V.paceRules.minimumWidthSecondsPerKm[def.class])};};
/** The observed easy range (P1): the latest qualifying easy runs of the window; the fast edge is their median pace, never the fastest. */
function observedEasy(obs,cutoff,floor,V){
 const P=V.assessment.P1,used=obs.filter(o=>inForce(o,cutoff)&&dayGap(o.date,cutoff)<=P.windowDays&&(!floor||o.date>floor)).slice(-P.useLatestRunsMax),paces=used.map(o=>o.secondsPerKm).sort((a,b)=>a-b);
 if(paces.length<P.qualifyingRunsMin)return {count:paces.length,needed:P.qualifyingRunsMin,range:null};
 const step=V.paceRules.roundUpToSecondsPerKm,median=paces.length%2?paces[(paces.length-1)/2]:(paces[paces.length/2-1]+paces[paces.length/2])/2,fast=paceEdge(1/median,step);
 return {count:paces.length,needed:P.qualifyingRunsMin,range:{fastSecondsPerKm:fast,slowSecondsPerKm:Math.max(paceEdge(1/paces.at(-1),step),fast+P.slowEdgeAtLeastSecondsPerKmAboveFast)},sessions:used.map(o=>o.eventId)};
}
/** The observed range of a harder domain (P2), only while no reference exists: its last two executions, both on target, comparable and concordant;
 * the fast edge is the slower of the two work paces. */
function observedHard(execs,domain,cutoff,floor,V){
 const P=V.assessment.P2,last=execs.filter(o=>o.domain===domain&&inForce(o,cutoff)&&dayGap(o.date,cutoff)<=P.windowDays&&(!floor||o.date>floor)).slice(-P.concordantSessionsMin);
 if(last.length<P.concordantSessionsMin||!last.every(o=>o.comparable&&o.onTarget))return null;
 const p=last.map(o=>o.secondsPerKm),lo=Math.min(...p),hi=Math.max(...p);if(hi/lo-1>P.concordanceFraction)return null;
 const fast=paceEdge(1/hi,V.paceRules.roundUpToSecondsPerKm);
 return {fastSecondsPerKm:fast,slowSecondsPerKm:fast+P.slowEdgeSecondsPerKmAboveFast,sessions:last.map(o=>o.eventId)};
}
/** Every band of a week: derived from the reference (with the domain's training factor), or observed, or unavailable with its reason. */
function bandsOf(wk,{std,long,estimates,V,on}){
 const out={};
 for(const [id,def] of Object.entries(V.domains)){
  const meta=cueMeta(def,V),none=(reason,extra={})=>({status:'UNAVAILABLE',reason,...extra});
  if(!on){out[id]=none('EXTENSION_NOT_ENABLED');continue;}
  if(wk.effortOnly){out[id]=none('MODE_WALK_JOG_RESTART_RETURN');continue;}
  const f=wk.factors[id]??null;
  if(f?.withdrawn){out[id]=none('BAND_WITHDRAWN_AFTER_TRAINING_MISMATCH',{until:'A_RACE_OR_TEST'});continue;}
  const s=bandSpeeds(id,{std,long,estimates,V});
  if(!s.reason){
   const k=1+(f?.fraction??0),b=edges(s.fast*k,s.slow*k,def,V),notes=[],o=s.of;
   // P1 with a reference: the fast edge is the slower of the observed median and the derived ceiling; an observed range only ever shows slower.
   if(id==='EASY'&&wk.easy.range){if(wk.easy.range.fastSecondsPerKm<b.fastSecondsPerKm)notes.push('EASY_RUNS_FASTER_THAN_CEILING');b.fastSecondsPerKm=Math.max(b.fastSecondsPerKm,wk.easy.range.fastSecondsPerKm);b.slowSecondsPerKm=Math.max(b.slowSecondsPerKm,wk.easy.range.slowSecondsPerKm,b.fastSecondsPerKm+V.paceRules.minimumWidthSecondsPerKm.EASY);}
   if(f?.fraction)notes.push(f.fraction>0?'TRAINING_ADJUSTED_UP':'TRAINING_ADJUSTED_DOWN');
   out[id]={status:'AVAILABLE',...b,...meta,label:'ESTIMATED',estimated:true,basis:'DERIVED_FROM_CAPACITY',method:s.method,...(def.event?{event:def.event}:{}),reference:o.reference,referenceKind:o.referenceKind,referenceDate:o.referenceDate,recency:o.recency,confidence:o.confidence,confidenceCauses:clone(o.confidenceCauses),margin:o.margin,validUntil:o.validUntil,trainingFactor:f?.fraction??0,notes};
   continue;
  }
  const observed=id==='EASY'?wk.easy.range&&{...wk.easy.range,sessions:wk.easy.sessions}:def.class==='HARDER'&&!std?wk.hard[id]:null;
  if(observed){out[id]={status:'AVAILABLE',fastSecondsPerKm:observed.fastSecondsPerKm,slowSecondsPerKm:observed.slowSecondsPerKm,...meta,label:'OBSERVED_AT_EFFORT',estimated:false,basis:'OBSERVED_AT_EFFORT',method:id==='EASY'?'MEDIAN_OF_OWN_EASY_RUNS':'SLOWER_OF_TWO_CONCORDANT_SESSIONS',reference:observed.sessions??null,confidence:null,margin:null,validUntil:null,trainingFactor:0,notes:['THIS_DOMAIN_ONLY']};continue;}
  out[id]=none(s.reason,id==='EASY'?{observed:{count:wk.easy.count,needed:wk.easy.needed}}:{});
 }
 return out;
}

// ---------- the week-by-week fold ----------
const modeOf=(program,w)=>program.stateTrace?.[Math.max(0,Math.min(w,(program.stateTrace?.length??1)-1))]?.run?.mode??null;
/** The last day before which evidence no longer speaks for current capacity: the end of the last long break, or the day of a hold or its release. */
function floorOf({breaks,f08,cutoff,V,tz}){
 const day=o=>localDate(new Date(Date.parse(o.declaredAt)).toISOString(),tz),days=[...breaks.filter(b=>b.days>=V.withdrawal.breakDaysWithdrawMin&&b.from<cutoff).map(b=>b.to<cutoff?b.to:onDate(cutoff,-1))];
 const {lastReady}=standingHolds(f08);if(lastReady&&day(lastReady)<cutoff)days.push(day(lastReady));
 for(const h of f08.filter(o=>o.fact==='CLINICAL_HOLD'))if(day(h)<cutoff)days.push(day(h));
 return days.sort().at(-1)??null;
}
/**
 * The calibration of every week from 0 to `through`, each from the one before (weekly stability, Q8): the reference is held inside the deadband;
 * with the same reference, the last two executions of a training domain, both observed against the band in force, move that domain's factor one
 * bounded step. A new reference, or a withdrawal, resets the factors.
 */
function fold({program,evidence,byId,rows,breaks,f08,through,asOfDay,V,tz,on}){
 const sessions=new Map(program.weeks.flatMap(w=>w.sessions.map(s=>[s.id,s]))),sort=(a,b)=>a.date<b.date?-1:a.date>b.date?1:0;
 const easyObs=rows.map(o=>easyObservation(o,V,tz)).filter(Boolean).sort(sort),execs=rows.map(o=>hardExecution(o,V,tz,sessions)).filter(Boolean).sort(sort);
 const T=V.recalibration.training,weeks=[];let refId=null,factors={},since=null,modeFloor=null;
 for(let w=0;w<=through;w++){
  // Week 0 reads what the intake knew; the preview of the week after the review reads through the review's own day.
  const weekStart=onDate(program.startDate,7*w),cutoff=w===0?onDate(program.canonical?.asOf?.slice?.(0,10)??program.startDate,1):weekStart<=asOfDay?weekStart:onDate(asOfDay,1);
  // A week the plan ran by time and effort (walk/jog, restart, return) ends what earlier evidence says about current capacity, as a long break does.
  const mode=modeOf(program,w);if(w>0&&V.paceRules.noBandModes.includes(modeOf(program,w-1)))modeFloor=onDate(weekStart,-1);
  const floor=[floorOf({breaks,f08,cutoff,V,tz}),modeFloor].filter(Boolean).sort().at(-1)??null,classified=evidence.map(e=>classify(e,{cutoff,floor,V}));
  const effortOnly=V.paceRules.noBandModes.includes(mode)||!mode,pick=cls=>effortOnly?null:selectReference(classified,byId,{cls,cutoff,breaks,V,heldId:cls==='STANDARD'?refId:null});
  const stdRaw=pick('STANDARD'),longRaw=pick('LONGER_THAN_HALF_MARATHON'),std=stdRaw&&!stdRaw.unsupported?stdRaw:null,long=longRaw&&!longRaw.unsupported?longRaw:null;
  const before=weeks.at(-1)??null,change={week:w,weekStart,reason:null,from:before?.std?{evidenceId:before.std.evidenceId,date:before.std.evidence.date,tenKEquivalentSeconds:Math.round(before.std.tenKEquivalentMinutes*60),confidence:before.std.tier}:null,to:null};
  const key=x=>x?x.evidenceId+'|'+x.conflictsWith.join(','):null;
  if(key(std)!==key(before?.std??null)||!std){
   if(std||before?.std)change.reason=!std?(effortOnly?'WITHDRAWN_MODE':floor?'WITHDRAWN_AFTER_BREAK_HOLD_OR_RETURN':'EVIDENCE_NO_LONGER_QUALIFIES'):before?.std?'NEW_REFERENCE':'FIRST_REFERENCE';
   factors={};since=weekStart;refId=std?.evidenceId??null;
  }else{
   // Q8, same reference: per training domain, its last two executions, both since the band last changed and both read against the band they ran under.
   for(const d of T.domains){
    const f=factors[d]??{fraction:0,since,withdrawn:false},last=execs.filter(o=>o.domain===d&&inForce(o,cutoff)&&o.date>=f.since).slice(-T.consecutiveSessionsRequired);
    if(f.withdrawn||last.length<T.consecutiveSessionsRequired||!last.every(o=>o.comparable&&o.longBouts&&o.rpe!==null))continue;
    const band=o=>{const b=weeks[o.week]?.bands?.[d];return b?.status==='AVAILABLE'&&b.basis==='DERIVED_FROM_CAPACITY'?b:null;};if(!last.every(band))continue;
    const up=last.every(o=>o.onTarget&&band(o).fastSecondsPerKm/o.secondsPerKm-1>T.triggerFraction);
    const down=last.every(o=>o.secondsPerKm/band(o).slowSecondsPerKm-1>T.triggerFraction)||last.every(o=>o.harder&&o.secondsPerKm>=band(o).fastSecondsPerKm&&o.secondsPerKm<=band(o).slowSecondsPerKm);
    if(!up&&!down)continue;
    const trace={domain:d,sessions:last.map(o=>({eventId:o.eventId,secondsPerKm:Math.round(o.secondsPerKm*10)/10,rpe:o.rpe})),week:w};
    if(down&&f.fraction<=-T.down.totalMax+1e-9)factors={...factors,[d]:{...f,withdrawn:true,since:weekStart,trace}};
    else{const next=down?Math.max(-T.down.totalMax,f.fraction-T.down.stepFraction):Math.min(T.up.totalMax,f.fraction+T.up.stepFraction);if(Math.abs(next-f.fraction)<1e-9)continue;factors={...factors,[d]:{fraction:Math.round(next*1e6)/1e6,since:weekStart,withdrawn:false,trace}};}
    change.reason=change.reason??(down?'TRAINING_SLOWER_THAN_BAND':'TRAINING_FASTER_THAN_BAND');change.domain=d;change.sessions=trace.sessions;
   }
   if(!change.reason&&std&&before?.std&&std.tier!==before.std.tier)change.reason='CONFIDENCE_'+before.std.tier+'_TO_'+std.tier;
  }
  if(std)change.to={evidenceId:std.evidenceId,date:std.evidence.date,tenKEquivalentSeconds:Math.round(std.tenKEquivalentMinutes*60),confidence:std.tier};
  const easy=observedEasy(easyObs,cutoff,floor,V),hard=Object.fromEntries(Object.keys(V.domains).filter(d=>V.domains[d].class==='HARDER').map(d=>[d,observedHard(execs,d,cutoff,floor,V)]));
  const wk={week:w,weekStart,cutoff,mode,floor,classified,std,long,unsupported:stdRaw?.unsupported?stdRaw:null,effortOnly,factors:clone(factors),easy,hard,change:change.reason?change:null};
  const longest=longestRecentRun(program,rows,evidence,cutoff,V.estimates.longestRunWithinDays,tz);
  wk.estimates=Object.fromEntries(Object.keys(V.estimates.distancesKm).map(name=>[name,effortOnly?{status:'UNAVAILABLE',reason:'MODE_WALK_JOG_RESTART_RETURN'}:estimateOf(name,{program,std,long,longest,V})]));
  wk.longestRecentRunMinutes=longest;wk.bands=bandsOf(wk,{std,long,estimates:wk.estimates,V,on});
  weeks.push(wk);
 }
 return {weeks};
}

// ---------- outputs of one week ----------
function capacityOf(wk){
 if(wk.effortOnly)return {status:'EFFORT_ONLY',reason:'MODE_WALK_JOG_RESTART_RETURN',mode:wk.mode};
 const long=wk.long?{evidenceId:wk.long.evidenceId,reference:wk.long.result,confidence:wk.long.tier,use:'MARATHON_ESTIMATE_ONLY',convertedDownward:false}:null;
 if(!wk.std)return {status:'NONE',reason:wk.unsupported?'EVIDENCE_BELOW_LOWEST_CONFIDENCE':wk.floor&&wk.classified.some(c=>c.reasons.includes('BEFORE_BREAK_HOLD_OR_RETURN'))?'WITHDRAWN_AFTER_BREAK':wk.long?'MARATHON_EVIDENCE_NOT_CONVERTED_DOWNWARD':'NO_QUALIFYING_EVIDENCE',...(wk.unsupported?{confidenceCauses:clone(wk.unsupported.flags)}:{}),...(long?{longerEvidence:long}:{})};
 const r=wk.std;
 return {status:r.outsidePopulation?'OUTSIDE_MODEL_POPULATION':r.presumed?'PRESUMED':'CALIBRATED',basis:r.presumed?'PRESUMED_FROM_AGED_EVIDENCE':r.evidence.kind,evidenceId:r.evidenceId,conflictsWith:r.conflictsWith,insideDeadbandOf:r.insideDeadbandOf,reference:r.result,recency:r.recency,
  tenKEquivalent:{centralSeconds:Math.round(r.tenKEquivalentMinutes*60),method:'POWER_LAW_CENTRAL_EXPONENT',estimated:true},confidence:r.tier,confidenceCauses:clone(r.flags),margin:r.margin,validUntil:r.validUntil,
  trainingFactors:Object.fromEntries(Object.entries(wk.factors).map(([d,f])=>[d,{fraction:f.fraction,withdrawn:f.withdrawn===true,since:f.since,sessions:f.trace?.sessions??[]}])),...(long?{longerEvidence:long}:{})};
}
/** The estimates as shown: without the unrounded working values; a downward training factor on the half or the marathon also slows that estimate. */
function shownEstimates(wk,V,on){
 const T=V.recalibration.training;
 return Object.fromEntries(Object.entries(wk.estimates).map(([name,e])=>{
  if(!on)return [name,{status:'UNAVAILABLE',reason:'EXTENSION_NOT_ENABLED'}];
  if(e.status!=='AVAILABLE')return [name,clone(e)];
  const {unrounded,...shown}=e,d=T.down.alsoLowersEstimateOf.find(id=>V.domains[id].event===name),f=d?wk.factors[d]?.fraction??0:0,u=V.estimates.roundOutwardSeconds[name];
  if(f>=0)return [name,clone(shown)];
  const k=1/(1+f);return [name,{...clone(shown),lowSeconds:Math.floor(unrounded.lower*k/u+1e-9)*u,centralSeconds:Math.round(unrounded.central*k/u)*u,highSeconds:Math.ceil(unrounded.upper*k/u-1e-9)*u,flags:[...shown.flags,'TRAINING_ADJUSTED_DOWN']}];}));
}
function goalOf(program,estimates){
 const ev=program.goal?.run?.event??program.canonical?.goals?.contextEvent??null,min=ev?.timeGoalMinutes;
 if(!ev||!num(min,1))return null;
 const est=estimates[ev.kind],goalSeconds=Math.round(min*60);
 return {kind:'ATHLETE_GOAL',event:ev.kind,goalSeconds,isPrediction:false,usedForPace:false,relation:est?.status!=='AVAILABLE'?'NO_CURRENT_ESTIMATE':goalSeconds<est.lowSeconds?'FASTER_THAN_RANGE':goalSeconds>est.highSeconds?'SLOWER_THAN_RANGE':'INSIDE_RANGE'};
}
/** Q6: zones only from measured anchors supplied, or from a maximum observed by chest strap in a hard effort; never from age; a reference scale only. */
function heartRateOf(wk,{evidence,breaks,V,on}){
 const none=(reason,extra={})=>({status:'UNAVAILABLE',reason,ageFormula:'AGE_FORMULA_NOT_INDIVIDUAL',...extra});
 if(!on)return none('EXTENSION_NOT_ENABLED');if(wk.effortOnly)return none('MODE_WALK_JOG_RESTART_RETURN');
 const H=V.heartRate,cutoff=wk.cutoff,known=e=>e.date&&e.date<cutoff&&(!e.recordedOn||e.recordedOn<cutoff),role={role:'REFERENCE_SCALE_ONLY',sessionTarget:false,gatesProgression:false,convertedToPaceOrEffort:false};
 const M=H.measured,labOk=l=>isObj(l)&&typeof l.protocol==='string'&&l.protocol.trim()&&typeof l.source==='string'&&l.source.trim()&&Array.isArray(l.values)&&l.values.length>0&&l.values.every(v=>isObj(v)&&typeof v.name==='string'&&v.name.trim()&&num(v.value)&&typeof v.unit==='string'&&v.unit.trim());
 const lab=evidence.filter(e=>e.kind==='LAB_TEST'&&known(e)&&dayGap(e.date,cutoff)<=M.recencyDaysMax&&labOk(e.lab)&&!breaks.some(b=>b.days>=M.noDeclaredBreakDaysAtLeastSince&&b.to>e.date&&b.from<cutoff)).sort((a,b)=>a.date<b.date?1:-1)[0];
 if(lab)return {status:'AVAILABLE',basis:M.basis,estimated:false,checkedByTheApp:false,display:M.display,reference:lab.id,date:lab.date,protocol:lab.lab.protocol,source:lab.lab.source,values:lab.lab.values.map(v=>({name:v.name,value:v.value,unit:v.unit})),engineNamesThresholds:false,...role};
 const O=H.observedMaximum,ok=new Map(wk.classified.map(c=>[c.id,c])),qualifies=e=>{const c=ok.get(e.id);return c&&['CAPACITY','HISTORICAL_BEST'].includes(c.use)&&!c.reasons.includes('BEFORE_BREAK_HOLD_OR_RETURN');};
 const max=evidence.filter(e=>O.sourceEvents.includes(e.kind)&&known(e)&&dayGap(e.date,cutoff)<=O.windowDays&&qualifies(e)&&num(e.seconds,O.effortMinutesMin*60)&&e.rpe!==null&&e.rpe>=O.rpeReportedMin&&O.sensors.includes(e.heartRate?.sensor)&&num(e.heartRate?.maxBpm,O.plausibleBpm[0],O.plausibleBpm[1])).sort((a,b)=>b.heartRate.maxBpm-a.heartRate.maxBpm)[0];
 if(!max)return none(evidence.some(e=>e.heartRate?.maxBpm)?'HEART_RATE_DATA_NOT_QUALIFYING':'NO_MEASURED_HEART_RATE');
 const bpm=max.heartRate.maxBpm;
 return {status:'AVAILABLE',basis:O.basis,estimated:true,observedMaximumBpm:bpm,reference:max.id,date:max.date,zones:O.zones.map(z=>({name:z.name,lowBpm:z.fromFraction===null?null:Math.round(bpm*z.fromFraction),highBpm:z.toFraction===null?null:Math.round(bpm*z.toFraction)})),namedThresholds:false,conservativeCueOnly:O.conservativeCueOnly,...role,notes:['NOT_THRESHOLDS','OBSERVED_MAXIMUM_MAY_BE_BELOW_TRUE_MAXIMUM']};
}

// ---------- assessment (Q5) ----------
function assessmentOf({program,wk,next,rows,evidence,target,asOfDay,V,cap,tz}){
 const A=V.assessment,progress={easyRuns:{count:wk.easy.count,needed:wk.easy.needed}},observation={P1:{name:A.P1.name},P2:{name:A.P2.name}};
 if(wk.effortOnly||(next??wk).effortOnly)return {status:'IN_USE',neverRequired:true,protocol:{id:'P0_'+A.P0.name,...clone(A.P0)},maximal:false,progress};
 const P=A.P3,G=P.eligibility,why=[],week=program.weeks?.[target]??null,quality=week?.sessions.find(s=>s.sport==='RUN'&&s.role==='QUALITY'&&s.prescription&&s.status!=='SKIPPED'&&s.date>asOfDay)??null;
 if(cap.status==='CALIBRATED'&&cap.confidence!=='LOW')return {status:'NOT_NEEDED',reason:'CURRENT_EVIDENCE_ON_RECORD',neverRequired:true,observation,progress};
 if(!week)why.push('NO_FURTHER_WEEK');else{
  if(!quality)why.push('NO_HARDER_SESSION_IN_THE_WEEK');
  if(G.excludedPhases.includes(week.phase))why.push('PHASE_'+week.phase);
  if(modeOf(program,target)!==G.planMode)why.push('MODE_'+(modeOf(program,target)??'UNKNOWN'));
  const race=program.goal?.run?.event?.date;if(quality&&isoDay(race)&&dayGap(quality.date,race)>=0&&dayGap(quality.date,race)<G.daysBeforeRaceMin)why.push('TOO_CLOSE_TO_RACE');
 }
 const day=quality?.date??onDate(program.startDate,7*target),weekStart=onDate(program.startDate,7*target),past=rows.filter(o=>o.localDate<day);
 // The test is never the athlete's first hard effort: one harder session of the plan already executed with a compatible response.
 if(past.filter(o=>o.context?.role==='QUALITY'&&compatible(o.response)&&o.response?.effort!=='HARDER').length<G.harderSessionsExecutedCompatibleMin)why.push('NO_HARDER_SESSION_EXECUTED_YET');
 if(past.some(o=>dayGap(o.localDate,day)<=G.daysAfterAdverseOrHarderThanTargetMin&&(o.response?.effort==='HARDER'||!compatible(o.response))))why.push('ADVERSE_OR_HARDER_RESPONSE_WITHIN_'+G.daysAfterAdverseOrHarderThanTargetMin+'_DAYS');
 // One completed test in the interval; an incomplete one may be repeated once, after its own wait, inside the same interval.
 const tests=evidence.filter(e=>e.kind==='FIELD_TEST'&&e.date&&e.date<day&&dayGap(e.date,day)<G.completedTestsPerDaysMax.days),I=P.protocol.incomplete;
 if(tests.filter(e=>e.completed).length>=G.completedTestsPerDaysMax.tests)why.push('TEST_WITHIN_'+G.completedTestsPerDaysMax.days+'_DAYS');
 else if(tests.length>I.repeatAttemptsMax)why.push('REPEAT_ALREADY_USED');
 else if(tests.some(e=>dayGap(e.date,day)<I.repeatAfterDaysMin))why.push('INCOMPLETE_TEST_WITHIN_'+I.repeatAfterDaysMin+'_DAYS');
 const lastWeek=rows.filter(o=>o.localDate<weekStart&&dayGap(o.localDate,weekStart)<=7).reduce((n,o)=>n+(minutesOf(o)??0),0),fresh=isoDay(program.canonical?.asOf?.slice?.(0,10))&&dayGap(program.canonical.asOf.slice(0,10),weekStart)<=G.longestRunWithinDays;
 const weekly=Math.max(lastWeek,fresh?program.capability?.run?.weeklyMinutes??0:0),longest=longestRecentRun(program,rows,evidence,weekStart,G.longestRunWithinDays,tz),exp=program.capability?.run?.experience??null,a=program.canonical?.athlete??{},months=a.experienceBasis?.run?.months??a.runTrainingMonths??null;
 // Unknown on any criterion is not eligible.
 const fits=p=>weekly>=p.weeklyRunMinutesMin&&longest>=p.longestRunMinutesMin&&p.experience.includes(exp)&&(!p.continuousMonthsMinWhenKnown||months===null||months>=p.continuousMonthsMinWhenKnown);
 const id=Object.keys(P.protocols).filter(k=>fits(P.protocols[k])).sort((x,y)=>P.protocols[y].distanceKm-P.protocols[x].distanceKm)[0]??null;
 if(!id)why.push(exp?'CURRENT_RUNNING_BELOW_TEST_ELIGIBILITY':'EXPERIENCE_UNKNOWN');
 if(why.length)return {status:'NOT_OFFERED',reasons:why,neverRequired:true,decliningHasNoPenalty:true,observation,progress};
 return {status:'OFFERED',optional:true,neverRequired:true,decliningHasNoPenalty:true,protocol:{id,distanceKm:P.protocols[id].distanceKm,...clone(P.protocol)},interpretation:clone(P.interpretation),replacesSessionId:quality.id,week:target,date:quality.date,
  report:{replacedSession:'NOT_DONE',declare:{kind:'FIELD_TEST',protocol:id,replacedSessionId:quality.id,fields:['date','distanceKm','seconds','rpe','measurement','completed','tolerated']}},observation,progress};
}

// ---------- session guidance ----------
/** The guidance of one planned run session: its effort cue, and the pace band of its domain when one is available for the session's week. */
function sessionGuidance(s,{effortOnly,bands,estimates,V,on,hold}){
 const p=s.prescription,cue=V.effortCues[p.effortDomain]??null,g={sessionId:s.id,date:s.date,family:p.family,effortCue:p.effortDomain,rpe:cue?clone(cue.rpe):null,effortGoverns:true};
 const none=reason=>({...g,pace:{status:'UNAVAILABLE',reason}});
 if(hold)return none('HOLD_NO_PRESCRIPTION');
 if(!on)return none('EXTENSION_NOT_ENABLED');
 if(effortOnly)return none('MODE_WALK_JOG_RESTART_RETURN');
 if(V.paceRules.noBandFamilies.includes(p.family))return none('NO_BAND_FOR_SESSION_TYPE');
 if(p.family==='RACE'){
  if(p.completion===true)return none('COMPLETION_RACE_DAY');
  const est=estimates[p.event?.kind],X=V.estimates;if(est?.status!=='AVAILABLE')return none(est?.reason??'NO_QUALIFYING_EVIDENCE');
  const slow=Math.ceil(est.highSeconds/est.distanceKm);
  return {...g,pace:{status:'REFERENCE_ONLY',unit:V.paceRules.unit,fastSecondsPerKm:Math.ceil(est.lowSeconds/est.distanceKm),slowSecondsPerKm:slow,estimated:true,promise:false,text:X.raceDayText,basis:'CURRENT_ESTIMATE_OF_THIS_EVENT',reference:est.reference,
   ...(V.paceRules.raceDayPacingCautionEvents.includes(p.event.kind)?{pacingCaution:X.pacingCaution,startAtOrSlowerThanSecondsPerKm:slow}:{})}};
 }
 // A race-week touch runs at its event's effort: the band of that event's domain.
 const id=Object.keys(V.domains).find(d=>V.domains[d].families.includes(p.family))??(p.family==='RACE_TOUCH'&&V.paceRules.raceTouchUsesEventDomain?Object.keys(V.domains).find(d=>V.domains[d].class==='HARDER'&&V.domains[d].cue===p.effortDomain):null);
 if(!id||!bands[id])return none('NO_BAND_FOR_SESSION_TYPE');
 const out={...g,pace:{...clone(bands[id]),domain:id}};
 if(p.strides)out.strides={pace:{status:'UNAVAILABLE',reason:'NO_BAND_FOR_SESSION_TYPE',note:'BY_FEEL'}};
 return out;
}

// ---------- the public function ----------
/**
 * The run calibration of an athlete's record as of a review: `program` is the plan in force (its sessions get the guidance), `ledger` the engine's
 * record, `evidenceRecord` this extension's record, `asOf` the review's instant and `weekIndex` its week. `hold` withholds every guidance.
 */
export function runCalibrationOf({program,ledger=[],evidenceRecord=[],asOf,weekIndex=0,hold=false},options={}){
 const ext=runCalibrationAuthority(options),V=ext.values,on={CAPACITY:allowsRun(ext,'CAPACITY'),PACE:allowsRun(ext,'PACE'),HR:allowsRun(ext,'HR'),ESTIMATE:allowsRun(ext,'ESTIMATE')};
 const head={version:RUN_CALIBRATION_VERSION,extension:{id:RUN_EXTENSION_ID,sha256:ext.sha256,source:ext.source,boundaries:on}};
 // A day-only instant (a plan made from an intake) is that local day, read through its end.
 const dayOnly=isoDay(asOf),at=dayOnly?asOf+'T23:59:59.000Z':utcTimestamp(asOf);
 if(!V||!on.CAPACITY||!program?.weeks||!at||program.capability?.run?.programmed===false)return freeze({...head,status:!V||!on.CAPACITY?'DISABLED':'NOT_APPLICABLE',reason:!V||!on.CAPACITY?'EXTENSION_NOT_ENABLED':!at?'REVIEW_TIME_REQUIRED':'RUNNING_NOT_PROGRAMMED',sessions:{}});
 const tz=program.timezoneOffsetMinutes??0,asOfMs=dayOnly?Date.parse(at)-tz*60000:Date.parse(at),asOfDay=dayOnly?asOf:localDate(at,tz),w=Math.max(0,Math.min(Number.isInteger(weekIndex)?weekIndex:0,program.weeks.length-1));
 const {evidence,refused}=gatherEvidence({program,ledger,evidenceRecord,asOfMs,tz}),byId=new Map(evidence.map(e=>[e.id,e])),rows=runRows(ledger,program.athleteId),breaks=breaksOf(ledger,program);
 const f08=readableF08(list(ledger).filter(isF08Fact),{athleteId:program.athleteId,at:asOfMs}),standing=standingHolds(f08).holds.length>0||hold;
 const last=Math.min(w+1,program.weeks.length-1),{weeks}=fold({program,evidence,byId,rows,breaks,f08,through:last,asOfDay,V,tz,on:on.PACE}),wk=weeks[w],nx=last>w?weeks[last]:null;
 const view=k=>({cap:capacityOf(k),bands:k.bands,estimates:shownEstimates(k,V,on.ESTIMATE)});
 const now=view(wk),after=nx?view(nx):null,sessions={};
 for(const week of program.weeks)for(const s of week.sessions)if(s.sport==='RUN'&&s.prescription&&s.status!=='SKIPPED'&&week.index>=w){
  const k=week.index===w||!nx?wk:nx,v=week.index===w||!after?now:after;
  // The week in force is fixed; a later week shows what is known today and is settled when its own week starts. A later week takes its own mode
  // from the plan (a return planned ahead is by time and effort whatever the preview says).
  sessions[s.id]={...sessionGuidance(s,{effortOnly:k.effortOnly||V.paceRules.noBandModes.includes(modeOf(program,week.index)),bands:v.bands,estimates:v.estimates,V,on:on.PACE,hold:standing}),week:week.index,provisional:week.index>w};
 }
 const held=reason=>({status:'UNAVAILABLE',reason}),withheld=standing?{status:'WITHHELD',reason:'HOLD_NO_PRESCRIPTION'}:null;
 const historicalBest=wk.classified.filter(c=>c.use==='HISTORICAL_BEST').map(c=>({id:c.id,kind:c.kind,date:c.date,distanceKm:c.distanceKm,seconds:c.seconds,isCurrentCapacity:false,isEstimate:false,reasons:c.reasons}));
 const actualResults=wk.classified.filter(c=>['RACE_RESULT','FIELD_TEST','TIME_TRIAL'].includes(c.kind)&&c.use!=='NOT_YET_IN_FORCE').map(c=>({id:c.id,kind:c.kind,date:c.date,distanceKm:c.distanceKm,seconds:c.seconds,isEstimate:false}));
 const body={...head,asOf:at,week:w,status:standing?'WITHHELD_HOLD':wk.effortOnly?'EFFORT_ONLY':now.cap.status==='CALIBRATED'?'CALIBRATED':now.cap.status==='PRESUMED'?'PROVISIONAL':Object.values(now.bands).some(b=>b.status==='AVAILABLE')||Object.values(now.estimates).some(e=>e.status==='AVAILABLE')?'PARTIAL':'EFFORT_ONLY',
  capacity:withheld??now.cap,
  evidence:wk.classified.map(c=>({...c})),refusedEvidence:refused,historicalBest,actualResults,
  effortDomains:Object.entries(V.effortCues).map(([id,d])=>({id,rpe:clone(d.rpe),scale:'0-10',talk:d.talk,availableWithoutDevice:true})),
  paceBands:withheld?Object.fromEntries(Object.keys(V.domains).map(id=>[id,held('HOLD_NO_PRESCRIPTION')])):now.bands,
  heartRateZones:withheld?held('HOLD_NO_PRESCRIPTION'):heartRateOf(wk,{evidence,breaks,V,on:on.HR}),
  estimates:withheld?Object.fromEntries(Object.keys(V.estimates.distancesKm).map(id=>[id,held('HOLD_NO_PRESCRIPTION')])):now.estimates,
  goal:goalOf(program,withheld?{}:now.estimates),
  projection:{status:'UNAVAILABLE',kind:'FUTURE_PROJECTION',reason:'NO_VALIDATED_PROJECTION_MODEL',comparisons:weeks.filter(x=>x.change&&x.week<=w).map(x=>clone(x.change))},
  assessment:withheld??assessmentOf({program,wk,next:nx,rows,evidence,target:asOfDay<onDate(program.startDate,7*w)?w:last,asOfDay,V,cap:now.cap,tz}),
  nextWeek:nx&&!withheld?{week:nx.week,capacity:after.cap,paceBands:after.bands,estimates:after.estimates,change:nx.change?clone(nx.change):null,provisionalUntil:nx.weekStart}:null,
  sessions,representations:{effortDomains:'ALWAYS',paceBands:'FROM_CALIBRATED_CAPACITY_OR_OBSERVED',heartRateZones:'FROM_MEASURED_HEART_RATE_ONLY',interchangeable:false}};
 return freeze({...body,hash:hash(body)});
}
