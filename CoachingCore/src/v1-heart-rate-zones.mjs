import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {clone,freeze} from './value.mjs';

/**
 * CoachingCore V1 five heart-rate zones (Founder request of 2026-11-25, mission V1HR5): V1X-HR-FIVE-ZONE. The run calibration's three-zone
 * `heartRateZones` (RUN_CALIBRATION_EXTENSION_V1 heartRate, SSCTR-V1RC-DECISION-r1 Q6) is kept byte for byte; this module adds beside it:
 * - `heartRateFiveZones`: Z1-Z5 as fractions of ONE reference maximum, nesting the three approved domains (Z1+Z2 = LOW, Z3 = MODERATE,
 *   Z4+Z5 = HIGH), so no domain boundary moves and no artificial domain appears. The reference is a lab maximum as supplied or the approved
 *   chest-strap observed maximum; never an age formula, a heart-rate reserve, a declared maximum with no qualifying effort, or an average.
 * - the heart-rate role of each planned run session: effort governs every session; heart rate is never primary in V1 and may only suggest
 *   slowing (a complementary ceiling cue) in easy, long and recovery running.
 * - a pure classifier of heart-rate samples into the five zones, for a future reviewed channel: no V1 input carries a series, so the reading
 *   says so and time in zone is never derived from an average.
 * It changes no dose, gate, phase, progression, pace band, estimate or effort cue: nothing in the engine reads its output.
 * Fail closed: the values are CoachingCore/v1/HEART_RATE_FIVE_ZONE_V1.json, read only as the pinned bytes; the boundary V1X-RUN-HR-FIVE-ZONE is
 * on only with an independent SSCTR record bound to those bytes, and only while the run calibration's CAPACITY and HR boundaries are on.
 * Every number is SSCTR-HR5-DECISION-r1 (audits/v1-five-zone-heart-rate-2026-11-25/ssctr), cited by item (HR5-1..HR5-8).
 */
export const HR5_ID='V1X-HR-FIVE-ZONE-1';
export const HR5_BOUNDARY='V1X-RUN-HR-FIVE-ZONE';
export const HR5_VERSION='V1X-HR-FIVE-ZONE-STATE-1';
export const HR5_SHA256='11440a132a83fb5d5d7468742112064c036949b707e49497736baa2c00b409ce';
export const HR5_URL=new URL('../v1/HEART_RATE_FIVE_ZONE_V1.json',import.meta.url);
export const HR5_RECORDS_URL=new URL('../../audits/v1-five-zone-heart-rate-2026-11-25/reviews/ssctr/SSCTR_HR5_RECORDS.json',import.meta.url);
export const ZONE_NAMES=freeze(['Z1','Z2','Z3','Z4','Z5']);
export const ROLES=freeze({CUE:'COMPLEMENTARY_CEILING_CUE',NO_GUIDANCE:'NO_HEART_RATE_GUIDANCE',NONE:'NONE'});

const readBytes=url=>{try{return fs.readFileSync(url);}catch{return null;}};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const parse=bytes=>{try{return JSON.parse(bytes.toString('utf8'));}catch{return null;}};
const BYTES=readBytes(HR5_URL);
export const HR5_FILE_SHA256=BYTES?sha256(BYTES):null;
/** The values of a file's bytes, only when they are the pinned bytes. */
export const fiveZoneValuesOf=bytes=>bytes&&sha256(bytes)===HR5_SHA256?freeze(parse(bytes)):null;
export const HR5_VALUES=fiveZoneValuesOf(BYTES);
const RECORD_BYTES=readBytes(HR5_RECORDS_URL),DEFAULT_RECORDS=RECORD_BYTES?parse(RECORD_BYTES):null;
const ENABLING=new Set(['APPROVE','APPROVE_WITH_CONDITIONS']),EVIDENCE_OK=new Set(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS']);

/**
 * The boundary's activation (fail closed, as runCalibrationAuthority): on only when the values file is the pinned bytes and every independent
 * SSCTR record bound to that hash for V1X-RUN-HR-FIVE-ZONE enables it with supported evidence and at least one source.
 * `options.heartRateFiveZone` supplies an authority object directly (development and tests only).
 */
export function fiveZoneAuthority(options={}){
 if(options.heartRateFiveZone)return options.heartRateFiveZone;
 const records=options.heartRateFiveZoneRecords??DEFAULT_RECORDS,used=[];let approved=false;
 if(HR5_VALUES){
  const all=(Array.isArray(records?.records)?records.records:[]).filter(r=>r?.boundaryId===HR5_BOUNDARY&&r.valuesSha256===HR5_SHA256);
  approved=all.length>0&&all.every(r=>r.independent===true&&ENABLING.has(r.disposition)&&EVIDENCE_OK.has(r.evidenceStatus)&&Array.isArray(r.sourceIds)&&r.sourceIds.length>0);
  if(approved)used.push(...all.map(r=>({boundaryId:HR5_BOUNDARY,disposition:r.disposition,evidenceStatus:r.evidenceStatus,conditions:r.conditions??[],reviewId:r.reviewId??null})));
 }
 return freeze({id:HR5_ID,valid:!!HR5_VALUES,sha256:HR5_VALUES?HR5_SHA256:null,approved,records:used,values:HR5_VALUES,source:'CURRENT_INDEPENDENT_REVIEW'});
}
/** Development-only authority over the file as read, pinned or not (or over the values given). Never sporting evidence. */
export function devFiveZone(values=null){
 const v=values??(BYTES?parse(BYTES):null);
 return freeze({id:HR5_ID,valid:!!v,sha256:HR5_FILE_SHA256,approved:true,records:[{boundaryId:HR5_BOUNDARY,disposition:'DEV_TEST_ONLY'}],values:v,source:'DEV_TEST_ONLY'});
}
export const allowsFiveZones=auth=>!!(auth?.valid&&auth.values&&auth.approved===true);

// ---------- small values (the run calibration's own definitions) ----------
const DAY=86400000;
const num=(v,lo=-Infinity,hi=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const dayGap=(start,end)=>Math.round((Date.parse(end+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/DAY);
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const AGE='AGE_FORMULA_NOT_INDIVIDUAL';

// ---------- the zones of one reference (HR5-1, HR5-4) ----------
/**
 * The five zones of a reference maximum. Each edge is floor((bpm x perMille + 500) / 1000): integer arithmetic, half up (HR5-4); for every
 * maximum of the plausible range it equals the three zones' Math.round(bpm x fraction), so the edges both outputs have (800 and 870 per mille)
 * are the same bpm. Intervals are [fromBpm, toBpm): a reading on an edge belongs to the higher zone; Z1 is open below and Z5 open above (an
 * observed maximum may be below the true one). Returns null for a reference that is not a whole bpm inside the plausible range of the values
 * (the pure function refuses an impossible maximum itself, whoever calls it), and unless the edges are integers, strictly increasing and contiguous.
 */
export function zonesFromMaximum(bpm,H5){
 const P=H5?.plausibleReferenceBpm;
 if(!Array.isArray(P)||!Number.isInteger(bpm)||!num(bpm,P[0],P[1])||!Array.isArray(H5?.zones)||H5.zones.length!==ZONE_NAMES.length)return null;
 const edge=pm=>pm===null?null:Number.isInteger(pm)&&pm>0&&pm<1000?Math.floor((bpm*pm+500)/1000):NaN;
 const zones=H5.zones.map((z,i)=>({zone:ZONE_NAMES[i],domain:z.domain,fromBpm:edge(z.fromPerMille),toBpm:edge(z.toPerMille),fromFraction:z.fromFraction,toFraction:z.toFraction}));
 if(zones.some((z,i)=>H5.zones[i].zone!==z.zone))return null;
 if(zones[0].fromBpm!==null||zones[zones.length-1].toBpm!==null)return null;
 for(let i=0;i<zones.length;i++){const z=zones[i];
  if(z.fromBpm!==null&&!Number.isInteger(z.fromBpm)||z.toBpm!==null&&!Number.isInteger(z.toBpm))return null;
  if(z.fromBpm!==null&&z.toBpm!==null&&!(z.fromBpm<z.toBpm))return null;
  if(i>0&&zones[i-1].toBpm!==z.fromBpm)return null;}
 return zones;
}
/** The zone of one reading under [from, to): null for a reading that is not a number inside `plausible` ([low, high], a caller's choice). */
export function zoneOfBpm(zones,bpm,plausible){
 if(!Array.isArray(zones)||!Array.isArray(plausible)||!num(bpm,plausible[0],plausible[1]))return null;
 return zones.find(z=>(z.fromBpm===null||bpm>=z.fromBpm)&&(z.toBpm===null||bpm<z.toBpm))?.zone??null;
}
/**
 * HR5-7, for a future reviewed channel (no V1 input carries a series; nothing in the engine calls this; classifierWiredToInput false). Seconds
 * per zone of one series {sensor, samples:[{t: seconds from the start, bpm, artifact?}]} in time order, classified with the zones of the week
 * the session belongs to. Only a CHEST_STRAP or ECG series is classified. A sample holds until the next one, never longer than maxGapSeconds;
 * a longer gap, an artifact, a value outside the plausible range or above 220 bpm is UNKNOWN time, never interpolated; covered and unknown time
 * are always reported. The numeric limits (maxGapSeconds, minCoverageFraction, plausibleBpm) are NOT set by the decision: the caller must give
 * them (a future SSCTR and Data review of the channel); without them there is no distribution. Never used for adherence, a quality session's
 * judgement, progression or adaptation.
 */
export function classifySamples(zones,series,{durationSeconds=null,maxGapSeconds,minCoverageFraction,plausibleBpm,values=HR5_VALUES}={}){
 const F=values?.sessionDistribution?.futureClassifier;
 if(!Array.isArray(zones))return {status:'UNAVAILABLE',reason:'NO_ZONES'};
 if(!F||!num(maxGapSeconds,0)||!num(minCoverageFraction,0,1)||!Array.isArray(plausibleBpm)||!num(plausibleBpm[0])||!num(plausibleBpm[1]))return {status:'UNAVAILABLE',reason:'CLASSIFIER_LIMITS_NOT_SET'};
 if(!isObj(series)||!F.sensors.includes(series.sensor))return {status:'UNAVAILABLE',reason:'SENSOR_NOT_QUALIFYING'};
 const samples=series.samples,hi=Math.min(plausibleBpm[1],F.samplesAboveBpmUnknown);
 if(!Array.isArray(samples)||samples.length<2)return {status:'UNAVAILABLE',reason:'NO_HEART_RATE_SERIES'};
 const seconds=Object.fromEntries(ZONE_NAMES.map(z=>[z,0]));let unknown=0;
 for(let i=0;i<samples.length;i++){const s=samples[i],next=samples[i+1];
  if(!isObj(s)||!num(s.t,0)||i>0&&s.t<samples[i-1].t)return {status:'UNAVAILABLE',reason:'SERIES_OUT_OF_ORDER'};
  if(!next)break;if(!isObj(next)||!num(next.t,0)||next.t<s.t)return {status:'UNAVAILABLE',reason:'SERIES_OUT_OF_ORDER'};
  const span=next.t-s.t,held=Math.min(span,maxGapSeconds),zone=s.artifact===true?null:zoneOfBpm(zones,s.bpm,[plausibleBpm[0],hi]);
  if(zone)seconds[zone]+=held;else unknown+=held;unknown+=span-held;}
 const total=num(durationSeconds,1)?durationSeconds:samples[samples.length-1].t-samples[0].t,covered=ZONE_NAMES.reduce((a,z)=>a+seconds[z],0);
 if(!(total>0))return {status:'UNAVAILABLE',reason:'NO_DURATION'};
 const coverage=Math.round(Math.min(1,covered/total)*1000)/1000,unknownSeconds=Math.max(0,Math.round(total-covered));
 if(covered/total<minCoverageFraction)return {status:'UNAVAILABLE',reason:'INSUFFICIENT_COVERAGE',coveredSeconds:covered,unknownSeconds,coverage};
 return {status:'AVAILABLE',seconds,coveredSeconds:covered,unknownSeconds,coverage,fromAverageHeartRate:false};
}

// ---------- the reference of a week (HR5-2, HR5-3, HR5-5, HR5-8) ----------
/**
 * The candidate references of the week whose calibration is `wk`, read with the very rules of the three zones (heartRateOf): evidence on record
 * before the week starts, after the last withdrawal, not superseded.
 * - LAB_MEASURED_MAXIMUM (HR5-2): a LAB_TEST under RUN_CALIBRATION_EXTENSION_V1 heartRate.measured (182 days, no declared break of 14 days or
 *   more since; SSCTR-V1RC-R-09) that also states a maximum in the plausible range, from a running test declared in `lab.modality` (the
 *   existing free-form lab object, carried whole by readEvidence), measured by chest strap or ECG, at a reported RPE of 8 or more, and neither
 *   stopped nor reported not tolerated. The most recent such test.
 * - OBSERVED_MAXIMUM: the approved Q6(b) rule, unchanged: the highest qualifying value of the window.
 * `labNotRunning`: a lab maximum that meets every rule but the declared running modality (its own typed reason when nothing else qualifies).
 */
function candidatesOf(wk,{evidence,breaks,V,H5}){
 const use=new Map(wk.classified.map(c=>[c.id,c.use])),H=V.heartRate,cutoff=wk.cutoff,start=wk.weekStart;
 const known=e=>e.date&&e.date<cutoff&&(!e.recordedOn||e.recordedOn<cutoff)&&(!wk.floor||e.date>wk.floor)&&use.get(e.id)!=='SUPERSEDED';
 const M=H.measured,L=H5.references.LAB_MEASURED_MAXIMUM,labOk=l=>isObj(l)&&typeof l.protocol==='string'&&l.protocol.trim()&&typeof l.source==='string'&&l.source.trim()&&Array.isArray(l.values)&&l.values.length>0&&l.values.every(v=>isObj(v)&&typeof v.name==='string'&&v.name.trim()&&num(v.value)&&typeof v.unit==='string'&&v.unit.trim());
 const running=e=>typeof e.lab?.modality==='string'&&L.runningModalities.includes(e.lab.modality.trim().toUpperCase().replace(/[\s-]+/g,'_'));
 const newest=(a,b)=>a.date<b.date?1:a.date>b.date?-1:a.id<b.id?-1:1;
 const labs=evidence.filter(e=>e.kind===L.evidenceKind&&known(e)&&dayGap(e.date,start)<=M.recencyDaysMax&&labOk(e.lab)&&!breaks.some(b=>b.days>=M.noDeclaredBreakDaysAtLeastSince&&b.to>e.date&&b.from<cutoff)
  &&num(e.heartRate?.maxBpm,L.plausibleBpm[0],L.plausibleBpm[1])&&L.sensors.includes(e.heartRate?.sensor)&&e.rpe!==null&&e.rpe>=L.rpeReportedMin&&(!L.completedNotFalse||e.completed!==false)&&(!L.toleratedNotFalse||e.tolerated!==false)).sort(newest);
 const lab=labs.find(running)??null,labNotRunning=!lab&&labs.length>0;
 const O=H.observedMaximum,ok=new Map(wk.classified.map(c=>[c.id,c])),qualifies=e=>{const c=ok.get(e.id);return c&&['CAPACITY','HISTORICAL_BEST'].includes(c.use)&&!c.reasons.includes('BEFORE_BREAK_HOLD_OR_RETURN');};
 const observed=evidence.filter(e=>O.sourceEvents.includes(e.kind)&&known(e)&&dayGap(e.date,start)<=O.windowDays&&qualifies(e)&&num(e.seconds,O.effortMinutesMin*60)&&e.rpe!==null&&e.rpe>=O.rpeReportedMin&&O.sensors.includes(e.heartRate?.sensor)&&num(e.heartRate?.maxBpm,O.plausibleBpm[0],O.plausibleBpm[1])).sort((a,b)=>b.heartRate.maxBpm-a.heartRate.maxBpm||newest(a,b))[0]??null;
 const ref=(kind,e)=>e&&{kind,bpm:e.heartRate.maxBpm,evidenceId:e.id,evidenceKind:e.kind,date:e.date,ageDays:dayGap(e.date,start),sensor:e.heartRate.sensor??null,
  ...(kind==='LAB_MEASURED_MAXIMUM'?{protocol:e.lab.protocol,source:e.lab.source,modality:e.lab.modality,checkedByTheApp:false}:{})};
 return {lab:ref('LAB_MEASURED_MAXIMUM',lab),observed:ref('OBSERVED_MAXIMUM',observed),labNotRunning,anyHeartRate:evidence.some(e=>e.heartRate?.maxBpm)};
}
const withdrawnBy=freeze(['BREAK_OF_14_DAYS_OR_MORE','HOLD','WALK_JOG_RESTART_OR_RETURN_MODE','REFERENCE_PAST_ITS_RECENCY']);
/**
 * The five zones of the week `wk` (the run calibration's internal week, built by its fold). `on` is the run calibration's HR boundary (with
 * CAPACITY); `auth` is this boundary's authority; `experience` the athlete's running experience (a newer runner's disclosure). Unavailable is
 * typed; nothing is ever fabricated without a qualifying reference.
 */
export function fiveZonesOf(wk,{evidence,breaks,V,on,auth,hold=false,experience=null}){
 const H5=auth?.values,head={version:HR5_VERSION,model:HR5_ID,sha256:auth?.sha256??null,source:auth?.source??null};
 const none=(reason,extra={})=>({...head,status:'UNAVAILABLE',reason,ageFormula:AGE,...extra});
 // A hold withholds them first, whatever else holds (as the three zones: HOLD_NO_PRESCRIPTION).
 if(hold)return none('HOLD_NO_PRESCRIPTION');
 if(!on||!allowsFiveZones(auth))return none('EXTENSION_NOT_ENABLED');
 if(wk.effortOnly)return none('MODE_WALK_JOG_RESTART_RETURN');
 const {lab,observed,labNotRunning,anyHeartRate}=candidatesOf(wk,{evidence,breaks,V,H5}),R=H5.references,C=H5.conflict;
 if(!lab&&!observed)return none(labNotRunning?'LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN':anyHeartRate?'HEART_RATE_DATA_NOT_QUALIFYING':'NO_MEASURED_HEART_RATE');
 // HR5-3: an accurate chest-strap reading cannot exceed the true maximum. An observed maximum more than the band ABOVE the lab maximum is a
 // conflict: no zones, both shown, re-read every week. A lab maximum above the observed one is expected: the lab maximum is used.
 if(lab&&observed&&observed.bpm-lab.bpm>C.observedAboveLabMoreThanBpm)
  return none(C.outcome,{conflict:{status:C.outcome,labMaxBpm:lab.bpm,labDate:lab.date,labEvidenceId:lab.evidenceId,observedMaxBpm:observed.bpm,observedDate:observed.date,observedEvidenceId:observed.evidenceId,differenceBpm:observed.bpm-lab.bpm,bandBpm:C.observedAboveLabMoreThanBpm},disclosures:[C.outcome]});
 const reference=R.order.map(k=>k==='LAB_MEASURED_MAXIMUM'?lab:observed).find(Boolean);
 const zones=zonesFromMaximum(reference.bpm,H5);
 if(!zones)return none('ZONE_BOUNDARIES_DEGENERATE');
 const rule=R[reference.kind];
 return {...head,status:'AVAILABLE',method:H5.method,basis:rule.basis,estimated:true,reference:clone(reference),
  referenceConfidence:rule.referenceConfidence,zoneModelConfidence:H5.zoneModelConfidence,conflict:null,
  convention:H5.convention,rounding:H5.rounding,zones,
  domains:Object.fromEntries(['LOW','MODERATE','HIGH'].map(d=>[d,zones.filter(z=>z.domain===d).map(z=>z.zone)])),withinDomainSplitsHaveSportingRole:false,
  role:'REFERENCE_SCALE_ONLY',primaryGuidance:false,sessionTarget:false,gatesProgression:false,convertedToPaceOrEffort:false,namedThresholds:false,
  sessionDistribution:{status:H5.sessionDistribution.status,reason:H5.sessionDistribution.reason,fromAverageHeartRate:false},
  changesAt:'WEEK_BOUNDARY',withdrawnBy:[...withdrawnBy],ageFormula:AGE,notes:[...H5.notes[reference.kind]],
  disclosures:['ZONES',reference.kind,...(H5.newerRunnerExperience.includes(experience)?['NEWER_RUNNER']:[])]};
}

// ---------- the role of heart rate in one planned run session (HR5-6) ----------
/**
 * Effort governs every session; heart rate is never primary in V1. In easy, long and recovery running a reading at or above the cue zone may
 * suggest slowing, never speeding up; elsewhere there is no heart-rate guidance (zones are not individual thresholds; heart rate lags short hard
 * bouts; race guidance is unchanged). With no zones, a hold or an effort-only mode there is none, with its reason.
 */
export function sessionHeartRate(s,{zones5,hold,effortOnly,auth}){
 const base={primary:false,effortGoverns:true};
 const none=reason=>({...base,role:ROLES.NONE,reason});
 const p=s?.prescription,H5=auth?.values;
 if(!allowsFiveZones(auth))return none('EXTENSION_NOT_ENABLED');
 if(hold)return none('HOLD_NO_PRESCRIPTION');
 if(effortOnly)return none('MODE_WALK_JOG_RESTART_RETURN');
 const U=H5.sessionUse,use=U.families[p?.family]??U.unknownFamily,out={...base,role:use.role};
 if(use.role===ROLES.NONE)return {...out,reason:use.reason};
 if(use.role===ROLES.NO_GUIDANCE)Object.assign(out,{reason:use.reason});
 else if(use.role===ROLES.CUE){
  if(zones5?.status!=='AVAILABLE')return none(zones5?.reason??'NO_HEART_RATE_ZONES');
  const z=zones5.zones.find(x=>x.zone===use.slowDownCueFromZone);
  if(!z||!Number.isInteger(z.fromBpm))return none('ZONE_BOUNDARIES_DEGENERATE');
  // The cue rules of the decision: a sustained reading only, never a cue to speed up, no health meaning, no "usual zone" of the family.
  Object.assign(out,{slowDownCueFromZone:z.zone,slowDownCueAtOrAboveBpm:z.fromBpm,sustainedReadingOnly:U.cueRules.sustainedReadingOnly,neverSpeedUp:true,healthMeaning:false,
   effortConflict:U.effortConflict,reference:zones5.reference.kind,disclosure:'CUE'});
 }else return none('UNKNOWN_ROLE');
 if(p?.strides){const st=U.families.STRIDES;out.strides={...base,role:st.role,reason:st.reason};}
 return out;
}
