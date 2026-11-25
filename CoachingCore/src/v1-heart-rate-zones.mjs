import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {clone,freeze,hash} from './value.mjs';

/**
 * CoachingCore V1 five heart-rate zones, revision 2 (Founder decision FOUNDER-HR5-RUNNA-PARITY-2026-11-25, mission V1HR5R, correcting V1HR5):
 * V1X-HR-FIVE-ZONE-2, the canonical operational heart-rate model. The run calibration's three-zone `heartRateZones` (SSCTR-V1RC-DECISION-r1 Q6)
 * is kept byte for byte beside it; the five zones no longer claim to nest in its three domains.
 * - Zones: Z1 up to 65 %, Z2 above 65 up to 81, Z3 above 81 up to 89, Z4 above 89 up to 97, Z5 above 97 % of ONE maximum heart rate. A zone's
 *   highest whole bpm is floor(maximum x percent / 100), the next one starts one bpm above: no gap, no overlap, exact percentages.
 * - The maximum, in order: the athlete's own declared maximum (an explicit override), a qualifying lab maximum, the approved chest-strap observed
 *   maximum when it is above the age estimate (it is a lower bound of the true maximum), then 220 - age from the onboarding age. So every athlete
 *   with a valid age has five zones, with no watch, strap, lab or history. Each reference keeps its provenance: ESTIMATED, DECLARED or MEASURED.
 * - Custom limits the athlete sets replace the default percentages and are kept as set (never recomputed, never overwritten automatically).
 * - Effort governs every session; heart rate is never primary in V1 and may only suggest slowing in easy running; it changes no dose, gate, phase,
 *   progression, pace band, estimate, effort cue or safety route, and nothing in the engine reads it. A hold withholds the zones.
 * - Measured values are classified one by one (their sensor kept); time in zone only from a sufficient time series, never from an average.
 * The athlete's profile (v1-heart-rate-profile.mjs) reaches the zones in two stages: inside the run calibration the week's measured references are
 * read (fiveZonesOf, no profile), and the composed entry resolves them with the profile (applyHeartRateProfile), by the same `resolve`.
 * Fail closed: the values are CoachingCore/v1/HEART_RATE_FIVE_ZONE_V2.json, read only as the pinned bytes; the boundary V1X-RUN-HR-FIVE-ZONE is on
 * only with an independent SSCTR record bound to those bytes, and only while the run calibration's CAPACITY and HR boundaries are on.
 */
export const HR5_ID='V1X-HR-FIVE-ZONE-2';
export const HR5_BOUNDARY='V1X-RUN-HR-FIVE-ZONE';
export const HR5_VERSION='V1X-HR-FIVE-ZONE-STATE-2';
export const HR5_SHA256='784ba7feb3e4c61efc9ec2187e23d4abdc78504519b40559bbfc53325e75ca90';
export const HR5_URL=new URL('../v1/HEART_RATE_FIVE_ZONE_V2.json',import.meta.url);
export const HR5_RECORDS_URL=new URL('../../audits/v1-hr5-runna-parity-2026-11-25/reviews/ssctr/SSCTR_HR5R_RECORDS.json',import.meta.url);
export const ZONE_NAMES=freeze(['Z1','Z2','Z3','Z4','Z5']);
export const ROLES=freeze({CUE:'COMPLEMENTARY_CEILING_CUE',NO_GUIDANCE:'NO_HEART_RATE_GUIDANCE',NONE:'NONE'});
export const KINDS=freeze({DECLARED:'ATHLETE_DECLARED_MAXIMUM',LAB:'LAB_MEASURED_MAXIMUM',OBSERVED:'OBSERVED_MAXIMUM',AGE:'AGE_ESTIMATE'});

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
 if(options?.heartRateFiveZone)return options.heartRateFiveZone;
 const records=options?.heartRateFiveZoneRecords??DEFAULT_RECORDS,used=[];let approved=false;
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

// ---------- the zones (exact whole-bpm edges) ----------
/** One zone object: inclusive whole-bpm limits (minBpm, maxBpm; null = open) and the same interval as [fromBpm, toBpm). */
const zoneObj=(zone,lo,hi,above,upTo)=>({zone,minBpm:lo,maxBpm:hi,fromBpm:lo,toBpm:hi===null?null:hi+1,abovePercent:above,upToPercent:upTo,fromFraction:above===null?null:above/100,toFraction:upTo===null?null:upTo/100});
/** The five zones of four upper limits (the highest whole bpm of Z1..Z4), or null unless they are whole and strictly increasing. */
function zonesOfLimits(upper,percents=null){
 if(!Array.isArray(upper)||upper.length!==4||!upper.every((v,i)=>Number.isInteger(v)&&v>0&&(i===0||v>upper[i-1])))return null;
 const p=percents??[null,null,null,null];
 return ZONE_NAMES.map((z,i)=>zoneObj(z,i===0?null:upper[i-1]+1,i===4?null:upper[i],i===0?null:p[i-1],i===4?null:p[i]));
}
/**
 * The five default zones of a maximum `bpm`: Z_k's highest whole bpm is floor(bpm x upToPercent / 100) in integer arithmetic (exact: a whole bpm
 * x is at most p % of the maximum exactly when x <= that floor). Null for a maximum that is not a whole bpm inside the values' plausible range
 * (the pure function refuses an impossible maximum itself, whoever calls it), or when the edges would not be strictly increasing.
 */
export function zonesFromMaximum(bpm,H5){
 const P=H5?.declaredMaximum?.plausibleBpm,Z=H5?.zones;
 if(!Array.isArray(P)||!Number.isInteger(bpm)||!num(bpm,P[0],P[1])||!Array.isArray(Z)||Z.length!==ZONE_NAMES.length||Z.some((z,i)=>z?.zone!==ZONE_NAMES[i]))return null;
 const pct=Z.slice(0,4).map(z=>z.upToPercent);
 if(!pct.every(p=>Number.isInteger(p)&&p>0&&p<100)||Z.some((z,i)=>i>0&&z.abovePercent!==pct[i-1])||Z[0].abovePercent!==null||Z[4].upToPercent!==null)return null;
 return zonesOfLimits(pct.map(p=>Math.floor(bpm*p/100)),pct);
}
/** The zones of an athlete's custom limits (validated as a declaration is: whole bpm 60-230, strictly increasing). */
export function zonesFromCustomLimits(upper,H5){
 const R=H5?.customZones?.plausibleBpm;
 if(!Array.isArray(R)||!Array.isArray(upper)||!upper.every(v=>Number.isInteger(v)&&num(v,R[0],R[1])))return null;
 return zonesOfLimits(upper);
}
/**
 * The zone of one reading: the reading is rounded half up to a whole bpm (HealthKit gives fractions), then placed in the zone whose inclusive
 * limits hold it. Null for a reading that is not a number inside `plausible` ([low, high], a caller's choice).
 */
export function zoneOfBpm(zones,bpm,plausible){
 if(!Array.isArray(zones)||!Array.isArray(plausible)||!num(bpm,plausible[0],plausible[1]))return null;
 const r=Math.floor(bpm+0.5);
 return zones.find(z=>(z.minBpm===null||r>=z.minBpm)&&(z.maxBpm===null||r<=z.maxBpm))?.zone??null;
}
/**
 * Time in zone of one heart-rate time series, for a future reviewed channel (no V1 input carries a series; nothing in the engine calls this):
 * {sensor, source?, samples:[{t: seconds from the start, bpm, artifact?}]} in time order. CHEST_STRAP, ECG and OPTICAL series are classified, the
 * sensor and source always reported (an optical series is analysis and presentation, never a maximum). A sample holds until the next one, never
 * longer than maxGapSeconds; a longer gap, an artifact or an implausible value is UNKNOWN time, never interpolated; covered and unknown time are
 * always reported; below minSamples or minCoverageFraction there is no distribution. Limits default to the values' operational defaults and may
 * be given. Never used for adherence, a quality session's judgement, progression, adaptation or safety; never derived from an average.
 */
export function classifySamples(zones,series,{durationSeconds=null,maxGapSeconds,minCoverageFraction,minSamples,plausibleBpm,values=HR5_VALUES}={}){
 const F=values?.sessionDistribution?.futureClassifier,D=F?.defaultLimits??{};
 maxGapSeconds??=D.maxGapSeconds;minCoverageFraction??=D.minCoverageFraction;minSamples??=D.minSamples??2;plausibleBpm??=D.plausibleBpm;
 if(!Array.isArray(zones))return {status:'UNAVAILABLE',reason:'NO_ZONES'};
 if(!F||!num(maxGapSeconds,Number.MIN_VALUE)||!num(minCoverageFraction,Number.MIN_VALUE,1)||!Number.isInteger(minSamples)||minSamples<2||!Array.isArray(plausibleBpm)||!num(plausibleBpm[0],0)||!num(plausibleBpm[1])||!(plausibleBpm[0]<plausibleBpm[1]))return {status:'UNAVAILABLE',reason:'CLASSIFIER_LIMITS_NOT_SET'};
 if(!isObj(series)||!F.sensors.includes(series.sensor))return {status:'UNAVAILABLE',reason:'SENSOR_NOT_QUALIFYING'};
 const provenance={sensor:series.sensor,source:typeof series.source==='string'?series.source:null},samples=series.samples;
 if(!Array.isArray(samples)||samples.length<minSamples)return {status:'UNAVAILABLE',reason:'INSUFFICIENT_SAMPLES',samples:Array.isArray(samples)?samples.length:0,...provenance};
 const seconds=Object.fromEntries(ZONE_NAMES.map(z=>[z,0]));let unknown=0;
 for(let i=0;i<samples.length;i++){const s=samples[i],next=samples[i+1];
  if(!isObj(s)||!num(s.t,0)||i>0&&s.t<samples[i-1].t)return {status:'UNAVAILABLE',reason:'SERIES_OUT_OF_ORDER',...provenance};
  if(!next)break;if(!isObj(next)||!num(next.t,0)||next.t<s.t)return {status:'UNAVAILABLE',reason:'SERIES_OUT_OF_ORDER',...provenance};
  const span=next.t-s.t,held=Math.min(span,maxGapSeconds),zone=s.artifact===true?null:zoneOfBpm(zones,s.bpm,plausibleBpm);
  if(zone)seconds[zone]+=held;else unknown+=held;unknown+=span-held;}
 const span=samples[samples.length-1].t-samples[0].t;if(durationSeconds!==null&&!(num(durationSeconds,1)&&durationSeconds>=span))return {status:'UNAVAILABLE',reason:'INVALID_DURATION',...provenance};
 const total=durationSeconds??span,covered=ZONE_NAMES.reduce((a,z)=>a+seconds[z],0);
 if(!(total>0))return {status:'UNAVAILABLE',reason:'NO_DURATION',...provenance};
 const coverage=Math.round(Math.min(1,covered/total)*1000)/1000,unknownSeconds=Math.max(0,Math.round(total-covered));
 if(covered/total<minCoverageFraction)return {status:'UNAVAILABLE',reason:'INSUFFICIENT_COVERAGE',coveredSeconds:covered,unknownSeconds,coverage,...provenance};
 return {status:'AVAILABLE',seconds,coveredSeconds:covered,unknownSeconds,coverage,samples:samples.length,fromAverageHeartRate:false,...provenance};
}

// ---------- the measured references of a week (the run calibration's own reading rules) ----------
/**
 * The measured candidates of the week whose calibration is `wk`, read with the very rules of the three zones (heartRateOf): evidence on record
 * before the week starts, after the last withdrawal, not superseded.
 * - LAB_MEASURED_MAXIMUM: a LAB_TEST under RUN_CALIBRATION_EXTENSION_V1 heartRate.measured (182 days, no declared break of 14 days or more since)
 *   that states a maximum in the plausible range, from a declared running test (`lab.modality`), by chest strap or ECG, at a reported RPE of 8 or
 *   more, neither stopped nor reported not tolerated. The most recent.
 * - OBSERVED_MAXIMUM: the approved Q6(b) rule, unchanged: the highest qualifying chest-strap value of the window.
 * - measurements: every value of the window (any listed sensor, optical included), classified later one by one; never a distribution.
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
 const ref=(kind,e)=>e&&{kind,provenance:'MEASURED',bpm:e.heartRate.maxBpm,evidenceId:e.id,evidenceKind:e.kind,date:e.date,ageDays:dayGap(e.date,start),sensor:e.heartRate.sensor??null,
  ...(kind===KINDS.LAB?{protocol:e.lab.protocol,source:e.lab.source,modality:e.lab.modality,checkedByTheApp:false}:{})};
 const X=H5.measurements,measurements=evidence.filter(e=>known(e)&&dayGap(e.date,start)<=X.windowDays&&X.sensors.includes(e.heartRate?.sensor)&&num(e.heartRate?.maxBpm,X.plausibleBpm[0],X.plausibleBpm[1]))
  .sort(newest).slice(0,X.mostShown).map(e=>({evidenceId:e.id,evidenceKind:e.kind,date:e.date,kind:X.kind,bpm:e.heartRate.maxBpm,sensor:e.heartRate.sensor}));
 return {lab:ref(KINDS.LAB,lab),observed:ref(KINDS.OBSERVED,observed),labNotRunning,anyHeartRate:evidence.some(e=>e.heartRate?.maxBpm),measurements};
}

// ---------- the reading: measured references resolved with the athlete's profile ----------
const KEEP_REASONS=freeze(['HOLD_NO_PRESCRIPTION','EXTENSION_NOT_ENABLED','FIVE_ZONE_ERROR']);
/** The reasons a reading is unavailable that the profile can change (a cue family's session then waits for the zones). */
export const PROFILE_REASONS=freeze(['AGE_REQUIRED','AGE_OUTSIDE_ESTIMATE_RANGE','REFERENCE_CONFLICT','ZONE_BOUNDARIES_DEGENERATE']);
const withdrawnBy=freeze({READING:['HOLD'],MEASURED_REFERENCE:['BREAK_OF_14_DAYS_OR_MORE','HOLD','WALK_JOG_RESTART_OR_RETURN_MODE','REFERENCE_PAST_ITS_RECENCY']});
/**
 * The five-zone reading of the measured references `measured` and the athlete `profile` (profileOf; null inside the run calibration). The
 * reference order of the values: declared, lab, observed (only above the age estimate), age estimate. Every candidate not used is listed with
 * why. Unavailable is typed; nothing is fabricated.
 */
function resolve(H5,{head,measured,profile,newerRunner}){
 const none=(reason,extra={})=>({...head,status:'UNAVAILABLE',reason,ageFormula:H5.ageEstimate.formula,...extra});
 const C=H5.conflict,A=H5.ageEstimate,{lab,observed}=measured;
 const conflict=lab&&observed&&observed.bpm-lab.bpm>C.observedAboveLabMoreThanBpm?{status:C.outcome,labMaxBpm:lab.bpm,labDate:lab.date,labEvidenceId:lab.evidenceId,observedMaxBpm:observed.bpm,observedDate:observed.date,observedEvidenceId:observed.evidenceId,differenceBpm:observed.bpm-lab.bpm,bandBpm:C.observedAboveLabMoreThanBpm}:null;
 const age=profile?.age&&Number.isInteger(profile.age.ageInForce)?profile.age:null;
 // SSCTR-HR5R-REV-3: an estimate only inside the formula's population range (18-80); past it there is none (a declared or measured maximum,
 // or custom limits, still give zones). Extending the population is a Founder / G01 decision.
 const ageOutside=!!age&&!(age.ageInForce>=A.ageYears[0]&&age.ageInForce<=A.ageYears[1]);
 const ageRef=age&&!ageOutside?{kind:KINDS.AGE,provenance:A.provenance,bpm:A.constant-age.ageInForce,formula:A.formula,ageYears:age.ageInForce,ageDeclared:age.ageYears,ageDeclaredOn:age.declaredOn}:null;
 const declared=profile?.declaredMaximum?{kind:KINDS.DECLARED,provenance:H5.declaredMaximum.provenance,bpm:profile.declaredMaximum.bpm,declaredAt:profile.declaredMaximum.declaredAt,checkedByTheApp:false}:null;
 const notUsed=[],candidates=[];
 if(declared)candidates.push(declared);
 for(const m of [lab,observed].filter(Boolean)){
  if(conflict)notUsed.push({kind:m.kind,bpm:m.bpm,reason:C.outcome});
  // SSCTR-HR5R-N1: under a lab maximum an observed one is simply not the more specific reference.
  else if(m.kind===KINDS.OBSERVED&&!lab&&ageRef&&!(m.bpm>ageRef.bpm))notUsed.push({kind:m.kind,bpm:m.bpm,reason:'OBSERVED_NOT_ABOVE_THE_AGE_ESTIMATE'});
  else candidates.push(m);}
 if(ageRef)candidates.push(ageRef);
 const reference=candidates[0]??null;
 for(const c of candidates.slice(1))notUsed.push({kind:c.kind,bpm:c.bpm,reason:reference.kind===KINDS.DECLARED?'ATHLETE_DECLARED_MAXIMUM_IN_FORCE':'A_MORE_SPECIFIC_REFERENCE_IN_FORCE'});
 const custom=profile?.customZones?.zoneUpperBpm??null;
 const measuredReferences={lab:lab?clone(lab):null,observed:observed?clone(observed):null,conflict,labNotRunning:!!measured.labNotRunning,anyHeartRate:!!measured.anyHeartRate,
  status:lab||observed?'AVAILABLE':'UNAVAILABLE',...(lab||observed?{}:{reason:measured.labNotRunning?'LAB_MODALITY_NOT_RUNNING_OR_UNKNOWN':measured.anyHeartRate?'HEART_RATE_DATA_NOT_QUALIFYING':'NO_MEASURED_HEART_RATE'})};
 const profileOut={ageYears:age?.ageInForce??null,ageDeclared:age?.ageYears??null,ageDeclaredOn:age?.declaredOn??null,declaredMaximumBpm:declared?.bpm??null,customZoneUpperBpm:custom?[...custom]:null};
 const shared={...(ageOutside?{ageOutsideEstimateRange:true}:{}),measuredReferences,profile:profileOut,newerRunner:!!newerRunner,measurementInputs:clone(measured.measurements??[])};
 if(!reference&&!custom)return none(conflict?C.outcome:ageOutside?A.outsideTheRange:'AGE_REQUIRED',{...shared,conflict,notUsed,...(conflict?{disclosures:[C.outcome]}:{})});
 const zones=custom?zonesFromCustomLimits(custom,H5):zonesFromMaximum(reference.bpm,H5);
 if(!zones)return none('ZONE_BOUNDARIES_DEGENERATE',{...shared,conflict,notUsed});
 const kind=reference?.kind??null,rule=kind===KINDS.AGE?A:kind===KINDS.DECLARED?H5.declaredMaximum:kind?H5.references[kind]:null;
 const measurements=(measured.measurements??[]).map(m=>({...m,zone:zoneOfBpm(zones,m.bpm,H5.measurements.plausibleBpm),singleValue:true,isADistribution:false}));
 return {...head,status:'AVAILABLE',method:custom?'ATHLETE_CUSTOM_LIMITS':H5.method,basis:rule?.basis??null,provenance:reference?.provenance??null,
  estimated:kind===KINDS.AGE||kind===KINDS.OBSERVED,reference:reference?clone(reference):null,
  referenceConfidence:rule?.referenceConfidence??null,zoneModelConfidence:H5.zoneModelConfidence,boundarySource:custom?'ATHLETE_CUSTOM':'DEFAULT_PERCENT_OF_MAXIMUM',
  conflict,notUsed,convention:custom?'INCLUSIVE_WHOLE_BPM_LIMITS':H5.convention,rounding:custom?'AS_SET_BY_THE_ATHLETE':H5.rounding,readingRounding:H5.readingRounding,zones,
  threeDomains:H5.threeDomains,withinDomainSplitsHaveSportingRole:false,
  role:'REFERENCE_SCALE_ONLY',primaryGuidance:false,sessionTarget:false,gatesProgression:false,convertedToPaceOrEffort:false,namedThresholds:false,
  changesThePlan:false,medicalEvidence:false,releasesASafetyBlock:false,
  measuredHeartRate:measurements.length?{status:'AVAILABLE',count:measurements.length}:{status:'UNAVAILABLE',reason:'NO_HEART_RATE_MEASUREMENTS'},measurements,
  sessionDistribution:{status:H5.sessionDistribution.status,reason:H5.sessionDistribution.reason,fromAverageHeartRate:false},
  liveHeartRate:clone(H5.liveHeartRate),
  changesAt:'WEEK_BOUNDARY',withdrawnBy:clone(withdrawnBy),ageFormula:A.formula,
  ...(custom&&reference&&custom[3]>=reference.bpm?{customLimitsReachTheMaximum:true}:{}),
  notes:[...new Set([...H5.notes.ALL,...(kind?H5.notes[kind]:[]),...(custom?H5.notes.ATHLETE_CUSTOM:[])])],
  disclosures:['ZONES',...(kind?[kind]:[]),...(custom?['ATHLETE_CUSTOM']:[]),...(conflict?[C.outcome]:[]),...(measurements.some(m=>m.sensor==='OPTICAL')?['OPTICAL_MEASUREMENT']:[]),...(newerRunner?['NEWER_RUNNER']:[]),'NOT_MEDICAL'],
  ...shared};
}
/**
 * The five-zone reading of the week `wk` (the run calibration's internal week, built by its fold), with no athlete profile (the composed entry
 * resolves it with the profile, applyHeartRateProfile). `on` is the run calibration's HR boundary (with CAPACITY); `auth` this boundary's
 * authority; `experience` the athlete's running experience (a newer runner's disclosure).
 */
export function fiveZonesOf(wk,ctx){
 // QRE-HR5-08: a fault here can never take the run calibration with it: the five zones are then UNAVAILABLE / FIVE_ZONE_ERROR, typed.
 try{return fiveZonesOfWeek(wk,ctx);}catch{return {version:HR5_VERSION,model:HR5_ID,sha256:ctx?.auth?.sha256??null,source:ctx?.auth?.source??null,status:'UNAVAILABLE',reason:'FIVE_ZONE_ERROR'};}
}
function fiveZonesOfWeek(wk,{evidence,breaks,V,on,auth,hold=false,experience=null,profile=null}){
 const H5=auth?.values,head={version:HR5_VERSION,model:HR5_ID,sha256:auth?.sha256??null,source:auth?.source??null};
 // A hold withholds them first, whatever else holds (as the three zones: HOLD_NO_PRESCRIPTION).
 if(hold)return {...head,status:'UNAVAILABLE',reason:'HOLD_NO_PRESCRIPTION'};
 if(!on||!allowsFiveZones(auth))return {...head,status:'UNAVAILABLE',reason:'EXTENSION_NOT_ENABLED'};
 // A walk/jog, restart or return mode keeps the zones (they describe the athlete, not the week); its sessions carry no heart-rate role.
 return resolve(H5,{head,measured:candidatesOf(wk,{evidence,breaks,V,H5}),profile,newerRunner:H5.newerRunnerExperience.includes(experience)});
}

// ---------- the role of heart rate in one planned run session ----------
/**
 * Effort governs every session; heart rate is never primary in V1. In easy, long and recovery running a reading at or above the cue zone may
 * suggest slowing, never speeding up; elsewhere there is no heart-rate guidance (zones are not individual thresholds; heart rate lags short hard
 * bouts; race guidance is unchanged). With no zones, a hold or an effort-only mode there is none, with its reason.
 */
export function sessionHeartRate(s,ctx){
 try{return roleOf(s,ctx);}catch{return {primary:false,effortGoverns:true,role:ROLES.NONE,reason:'FIVE_ZONE_ERROR'};}
}
/** The family's use under the values (an own key only; anything else is the unknown family). */
const useOf=(U,family)=>typeof family==='string'&&Object.hasOwn(U.families,family)?U.families[family]:U.unknownFamily;
/** The cue fields of a cue family over available zones, or a NONE with the reason. */
function cueOf(use,U,zones5,base){
 const z=zones5.zones.find(x=>x.zone===use.slowDownCueFromZone);
 if(!z||!Number.isInteger(z.minBpm))return {...base,role:ROLES.NONE,reason:'ZONE_BOUNDARIES_DEGENERATE'};
 return {...base,role:ROLES.CUE,slowDownCueFromZone:z.zone,slowDownCueAtOrAboveBpm:z.minBpm,sustainedReadingOnly:U.cueRules.sustainedReadingOnly,neverSpeedUp:true,healthMeaning:false,
  effortConflict:U.effortConflict,reference:zones5.reference?.kind??null,boundarySource:zones5.boundarySource,disclosure:'CUE'};
}
/**
 * The order (C5, SSCTR-HR5-R-02): a hold, then the boundary off, then an effort-only mode or a family that holds only in another mode, then the
 * family's role; a cue family with no zones in force is NONE with the zones' typed reason.
 */
function roleOf(s,{zones5,hold,effortOnly,auth,on=true,mode=null}){
 const base={primary:false,effortGoverns:true};
 const none=reason=>({...base,role:ROLES.NONE,reason});
 const p=s?.prescription,H5=auth?.values;
 if(hold)return none('HOLD_NO_PRESCRIPTION');
 if(!on||!allowsFiveZones(auth))return none('EXTENSION_NOT_ENABLED');
 if(effortOnly)return none('MODE_WALK_JOG_RESTART_RETURN');
 const U=H5.sessionUse,use=useOf(U,p?.family);
 if(use.onlyInMode&&use.onlyInMode!==mode)return none('MODE_WALK_JOG_RESTART_RETURN');
 if(zones5?.status!=='AVAILABLE'&&use.role===ROLES.CUE)return none(zones5?.reason??'NO_HEART_RATE_ZONES');
 let out;
 if(use.role===ROLES.NONE)return {...base,role:ROLES.NONE,reason:use.reason};
 if(use.role===ROLES.NO_GUIDANCE)out={...base,role:use.role,reason:use.reason};
 else if(use.role===ROLES.CUE){out=cueOf(use,U,zones5,base);if(out.role!==ROLES.CUE)return out;}
 else return none('UNKNOWN_ROLE');
 if(p?.strides){const st=U.families.STRIDES;out.strides={...base,role:st.role,reason:st.reason};}
 return out;
}

// ---------- the composed entry: the athlete's profile ----------
const CUE_FIELDS=['role','reason','slowDownCueFromZone','slowDownCueAtOrAboveBpm','sustainedReadingOnly','neverSpeedUp','healthMeaning','effortConflict','reference','boundarySource','disclosure'];
/**
 * The run calibration `rc` with its five-zone reading resolved with the athlete's `profile` (v1-heart-rate-profile.mjs profileOf), by the same
 * `resolve`, and the cue of each easy-running session set from the zones in force (a session that waited for zones gets its cue; one with no zones
 * keeps NONE with the reason). Nothing else of `rc` changes; its hash is recomputed over the new reading. A reading the profile cannot change (a
 * hold, the boundary off, a fault, or no five-zone key at all) is returned as it is.
 */
export function applyHeartRateProfile(rc,profile,options={}){
 const z=rc?.heartRateFiveZones;
 if(!isObj(rc)||!isObj(z)||z.status!=='AVAILABLE'&&KEEP_REASONS.includes(z.reason)||!isObj(z.measuredReferences))return rc;
 const sealed=five=>{const {hash:_old,...body}=rc,out={...body,heartRateFiveZones:five};return freeze({...out,hash:hash(out)});};
 try{
  const auth=fiveZoneAuthority(options),H5=auth.values;
  if(!allowsFiveZones(auth)||auth.sha256!==z.sha256)return rc;
  const head={version:z.version,model:z.model,sha256:z.sha256,source:z.source},U=H5.sessionUse;
  const next=resolve(H5,{head,measured:{...z.measuredReferences,measurements:z.measurementInputs??[]},profile,newerRunner:z.newerRunner});
  const sessions={};
  for(const [id,s] of Object.entries(z.sessions??{})){
   const use=useOf(U,s.family),waits=s.role===ROLES.CUE||s.role===ROLES.NONE&&PROFILE_REASONS.includes(s.reason)&&use.role===ROLES.CUE;
   if(!waits){sessions[id]=s;continue;}
   const keep=Object.fromEntries(Object.entries(s).filter(([k])=>!CUE_FIELDS.includes(k)));
   const role=next.status==='AVAILABLE'?cueOf(use,U,next,{primary:false,effortGoverns:true}):{primary:false,effortGoverns:true,role:ROLES.NONE,reason:next.reason};
   // The stride part and the plan fields (family, week, provisional) are kept; only the cue moves with the zones.
   sessions[id]={...keep,...role};
  }
  return sealed({...next,sessions});
 }catch{
  return sealed({version:z.version,model:z.model,sha256:z.sha256,source:z.source,status:'UNAVAILABLE',reason:'FIVE_ZONE_ERROR',sessions:{}});
 }
}
