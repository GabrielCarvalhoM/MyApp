import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {clone,freeze,hash} from './value.mjs';
import {validateR6Prescription} from './r6-prescription.mjs';
import {distanceFacts,historyReference} from './v1-run-history.mjs';

/**
 * CoachingCore V1 Run Workout Structure (Founder request of 2026-11-13, handoff r3 with r3a): V1X-RUN-FORMATS. The frozen engine plans every run
 * session as a dose in minutes (family, ladder step, work, duration). This module delivers that dose as a native prescription, by distance or by
 * time, and reads its execution.
 * - It is no second planner: the day, role, family, step, minutes, budget, taper, holds and the run and strength coordination are the engine's.
 *   A format only expresses the dose inside an envelope tied to approved values (E1-E3, CT-1 to CT-3); it never enters a gate, a load sum, a ramp
 *   or the progression, and the planned prescription and its hash are untouched.
 * - Founder rule (r3, r3a): a native distance target is met by its distance. There is no time ceiling; the duration shown is an estimate; the
 *   athlete may stop at any time and a stop is never the target met; a distance is met only when it was covered (MEASURED), when a measurement
 *   failure is corrected with a listed reason (CONFIRMED_CORRECTION) or when the athlete declares it with no device (DECLARED, adherence only).
 * - Pure functions of what they are given. The values are CoachingCore/v1/RUN_FORMATS_V1.json, read only as the pinned bytes, and the boundary
 *   V1X-RUN-NATIVE is on only with an independent SSCTR record bound to those bytes (as V1X-RUN-CALIBRATION). Off, or on any fallback, a session
 *   is the TIME expression: the canonical prescription itself, in steps.
 * - Every rule and number is SSCTR-RWS-R2-DECISION as amended by SSCTR-RWS-R3-DECISION and SSCTR-RWS-R3A-AMENDMENT, cited here by item.
 */
export const FORMAT_EXTENSION_ID='V1X-RUN-FORMATS-1';
export const FORMAT_VALUES_SHA256='26c6e3fbfeee864376643c485d64a616f1cf13ea49d82b2cc223c02d7a06353c';
export const FORMAT_VALUES_URL=new URL('../v1/RUN_FORMATS_V1.json',import.meta.url);
export const FORMAT_RECORDS_URL=new URL('../../audits/v1-run-extensions-2026-11-13/phase-a/reviews/ssctr/SSCTR_V1RWS_RUN_RECORDS.json',import.meta.url);
export const FORMAT_BOUNDARIES=freeze({NATIVE:'V1X-RUN-NATIVE'});
export const RUN_FORMAT_VERSION='V1X-RUN-FORMAT-STATE-1';
export const RUN_FORMAT_EMITTED='RUN_FORMAT_EMITTED';
export const EXPRESSIONS=freeze(['NATIVE','TIME']);

const readBytes=url=>{try{return fs.readFileSync(url);}catch{return null;}};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const parse=bytes=>{try{return JSON.parse(bytes.toString('utf8'));}catch{return null;}};
const BYTES=readBytes(FORMAT_VALUES_URL);
export const FORMAT_VALUES_FILE_SHA256=BYTES?sha256(BYTES):null;
/** The values of a file's bytes, only when they are the pinned bytes. */
export const runFormatsOf=bytes=>bytes&&sha256(bytes)===FORMAT_VALUES_SHA256?freeze(parse(bytes)):null;
export const RUN_FORMATS=runFormatsOf(BYTES);
const RECORD_BYTES=readBytes(FORMAT_RECORDS_URL),DEFAULT_RECORDS=RECORD_BYTES?parse(RECORD_BYTES):null;
const ENABLING=new Set(['APPROVE','APPROVE_WITH_CONDITIONS']),EVIDENCE_OK=new Set(['WELL_SUPPORTED','SUPPORTED_WITH_LIMITS']);
/**
 * Activation (fail closed): the boundary is on only when the values file is the pinned bytes and every independent SSCTR record bound to that hash
 * enables it with supported evidence and at least one source. `options.runFormats` supplies an authority directly (development and tests only).
 */
export function runFormatAuthority(options={}){
 if(options.runFormats)return options.runFormats;
 const records=options.runFormatRecords??DEFAULT_RECORDS,approved={},used=[];
 if(RUN_FORMATS)for(const id of Object.values(FORMAT_BOUNDARIES)){
  const all=(Array.isArray(records?.records)?records.records:[]).filter(r=>r?.boundaryId===id&&r.extensionSha256===FORMAT_VALUES_SHA256);
  const ok=all.length>0&&all.every(r=>r.independent===true&&ENABLING.has(r.disposition)&&EVIDENCE_OK.has(r.evidenceStatus)&&Array.isArray(r.sourceIds)&&r.sourceIds.length>0);
  if(ok){approved[id]=true;used.push(...all.map(r=>({boundaryId:id,disposition:r.disposition,evidenceStatus:r.evidenceStatus,conditions:r.conditions??[],reviewId:r.reviewId??null})));}
 }
 return freeze({id:FORMAT_EXTENSION_ID,valid:!!RUN_FORMATS,sha256:RUN_FORMATS?FORMAT_VALUES_SHA256:null,approved,records:used,values:RUN_FORMATS,source:'CURRENT_INDEPENDENT_REVIEW'});
}
/** Development-only authority: the boundary named enabled over the file as read, pinned or not. Never sporting evidence. */
export function devRunFormats(enabled=Object.values(FORMAT_BOUNDARIES),values=null){
 const v=values??(BYTES?parse(BYTES):null);
 return freeze({id:FORMAT_EXTENSION_ID,valid:!!v,sha256:FORMAT_VALUES_FILE_SHA256,approved:Object.fromEntries(enabled.map(id=>[id,true])),records:enabled.map(id=>({boundaryId:id,disposition:'DEV_TEST_ONLY'})),values:v,source:'DEV_TEST_ONLY'});
}
export const allowsFormat=(ext,name='NATIVE')=>!!(ext?.valid&&ext.values&&ext.approved?.[FORMAT_BOUNDARIES[name]]);

// ---------- small values ----------
const EPS=1e-9;
const isObj=o=>!!o&&typeof o==='object'&&!Array.isArray(o);
const list=v=>Array.isArray(v)?v:[];
const num=(v,lo=-Infinity,hi=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
const upper=v=>typeof v==='string'&&v.trim()?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
const r2=n=>Math.round(n*100)/100;
/** Minutes a distance takes at a pace (R2 values.envelope.estimates). */
export const minutesAt=(metres,secondsPerKm)=>metres/1000*secondsPerKm/60;
const CONTINUOUS=new Set(['CONTINUOUS_DISTANCE','PROGRESSIVE_EASY']);
/** The reasons a selection itself gives (no native format fits); every other reason is a state read again at each review. */
export const SELECTION_REASONS=freeze(['NO_FORMAT_WITHIN_ENVELOPE','NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE','TEXT_CHECK_FAILED','STRUCTURE_ERROR']);

// ---------- the step model (handoff section 3) ----------
const T=seconds=>({type:'TIME',seconds:Math.round(seconds)});
const D=metres=>({type:'DISTANCE',metres:Math.round(metres)});
const cue=(cues,id,text=null)=>({effortDomain:id,...(cues?.[id]?{rpe:clone(cues[id].rpe),talk:cues[id].talk}:{}),...(text?{effort:text}:{})});
const withPace=(intensity,band)=>band?{...intensity,pace:{fastSecondsPerKm:band.fastSecondsPerKm,slowSecondsPerKm:band.slowSecondsPerKm,domain:band.domain??null}}:intensity;
const step=(kind,target,intensity,extra={})=>({kind,target,intensity,...extra,effortGoverns:true});
/** Every step of a session in order, each with its block, its repetition and its place inside the block. */
export function flatSteps(blocks){
 const out=[];
 list(blocks).forEach((b,bi)=>{for(let r=0;r<b.repeat;r++)b.steps.forEach((s,si)=>{if(b.omitLastRecovery&&r===b.repeat-1&&s.kind==='RECOVERY')return;out.push({...s,block:bi,rep:r,index:si});});});
 return out;
}
const secondsOf=(s,edge)=>s.target.type==='TIME'?s.target.seconds:s.estimate?.seconds?.[edge]??0;
/** The minutes the steps add up to: targets by time exactly, targets by distance at the low or the high edge of their estimate. */
export const stepsMinutes=(blocks,edge='high')=>flatSteps(blocks).reduce((n,s)=>n+secondsOf(s,edge),0)/60;
const metresEstimate=(seconds,band)=>band?{metres:{low:Math.round(seconds/band.slowSecondsPerKm*1000),high:Math.round(seconds/band.fastSecondsPerKm*1000)}}:null;
const stridesBlockMinutes=p=>p.strides?p.strides.repetitions*(p.strides.workSeconds+p.strides.recoverySeconds)/60:0;
const stridesBlock=(p,cues)=>({repeat:p.strides.repetitions,steps:[step('STRIDES',T(p.strides.workSeconds),{effortDomain:'STRIDES_RELAXED_FAST',effort:'Relaxed and fast, smooth, never a sprint'},p.strides.optional?{optional:true}:{}),step('RECOVERY',T(p.strides.recoverySeconds),cue(cues,'EASY_CONVERSATIONAL'),{recoveryMode:'WALK_OR_JOG'})]});
/**
 * TIME: the canonical prescription in steps, with no decision of its own (handoff section 3): warm-up, then work and recovery n times with no
 * recovery after the last, then cool-down; walk/jog in seconds; an easy run as one steady step, its strides after it. The steps add up to the
 * prescription's own minutes (whatever remains of its duration is cool-down, as the engine counts it).
 */
export function timeBlocks(p,{cues=null,band=null}={}){
 const easy=cue(cues,'EASY_CONVERSATIONAL'),main=withPace(cue(cues,p.effortDomain,p.effort),band),blocks=[],warm=(p.warmupMinutes??0)*60,total=p.durationMinutes*60;
 const w=p.work??null;
 if(w&&num(w.workMinutes,0.01)){
  const work=w.workMinutes*60,rec=(w.recoveryMinutes??0)*60,used=warm+w.repetitions*work+Math.max(0,w.repetitions-1)*rec;
  if(warm)blocks.push({repeat:1,steps:[step('WARMUP',T(warm),easy)]});
  blocks.push({repeat:w.repetitions,steps:[step('WORK',T(work),main,{estimate:metresEstimate(work,band)??undefined}),...(rec?[step('RECOVERY',T(rec),easy,{recoveryMode:'WALK_OR_JOG'})]:[])],...(rec?{omitLastRecovery:true}:{})});
  if(total-used>0)blocks.push({repeat:1,steps:[step('COOLDOWN',T(total-used),easy)]});
 }else if(w&&num(w.workSeconds,1)){
  const used=warm+w.repetitions*(w.workSeconds+(w.recoverySeconds??0));
  if(warm)blocks.push({repeat:1,steps:[step('WARMUP',T(warm),easy,{recoveryMode:'WALK'})]});
  blocks.push(w.recoverySeconds>0?{repeat:w.repetitions,steps:[step('WORK',T(w.workSeconds),main),step('RECOVERY',T(w.recoverySeconds),easy,{recoveryMode:'WALK'})]}:{repeat:1,steps:[step('STEADY',T(w.repetitions*w.workSeconds),main)]});
  if(total-used>0)blocks.push({repeat:1,steps:[step('COOLDOWN',T(total-used),easy,{recoveryMode:'WALK'})]});
 }else{
  const cool=(p.cooldownMinutes??0)*60,strides=stridesBlockMinutes(p)*60,steady=total-warm-cool-strides;
  if(steady<=0)throw new Error('structure');
  if(warm)blocks.push({repeat:1,steps:[step('WARMUP',T(warm),easy)]});
  blocks.push({repeat:1,steps:[step('STEADY',T(steady),main,{...(p.family==='RACE'?{windowIsUpperBound:true}:{}),estimate:p.family==='RACE'?undefined:metresEstimate(steady,band)??undefined})]});
  if(p.strides)blocks.push(stridesBlock(p,cues));
  if(cool)blocks.push({repeat:1,steps:[step('COOLDOWN',T(cool),easy)]});
 }
 return clean(blocks);
}
const clean=v=>JSON.parse(JSON.stringify(v)); // drops the undefined estimates; a format is a JSON value

// ---------- repetitions: the envelope (R2 N2, values.envelope; R3 C6) ----------
/** Every repetition distance of the catalog: 200 to 950 m in 50 m units, 1000 to 6000 m in 100 m units (R2 values.distances). */
export function repetitionGrid(V){
 const g=V.distances.repetitionMetres,out=[];
 for(let d=g.from;d<1000;d+=g.below1000UnitMetres)out.push(d);for(let d=1000;d<=g.max;d+=g.from1000UnitMetres)out.push(d);
 return out;
}
/**
 * One candidate against the envelope. `works` is the work sequence ({metres} or {minutes}; `flank` marks a pyramid flank), `recovery` what lies
 * between two of them ({minutes}, or {metres} with the RECOVERY band in `c.recoveryBand`), `c` the canonical step and the band.
 * - E2: each distance repetition at the slow edge is at most 1.015 of the step's repetition, and at the fast edge at least 0.9 of it (a pyramid
 *   flank: of the family's shortest ladder repetition).
 * - E1: the work at the slow edge is at most 1.015 of the step's work, and at the fast edge at least 0.9 of it; work by time counts exactly.
 * - E3: the duration at the slow edges is within the session's budget and at most one recovery interval of the step above the canonical duration.
 * E4 is not applied: a session completed by distance is read by its distance (R3 C6). Returns the first check that fails, or the estimates.
 */
export function checkRepetitions(works,recovery,c,V){
 const E=V.envelope,fast=c.band.fastSecondsPerKm,slow=c.band.slowSecondsPerKm,stepWork=c.step.repetitions*c.step.workMinutes,rep=c.step.workMinutes;
 let lowDistance=0,lowTime=0,high=0;
 for(const w of works){
  if(!num(w.metres)){lowTime+=w.minutes;high+=w.minutes;continue;}
  const f=minutesAt(w.metres,fast),s=minutesAt(w.metres,slow);
  if(s>E.E2.repetitionHighMaxFractionOfStepRepetition*rep+EPS||f<E.E2.repetitionLowMinFraction*(w.flank?c.familyMinRepetitionMinutes:rep)-EPS)return {ok:false,failed:'E2'};
  lowDistance+=f;high+=s;
 }
 if(high>E.E1.workHighMaxFractionOfStepWork*stepWork+EPS||lowDistance+lowTime<E.E1.workLowMinFractionOfStepWork*stepWork-EPS)return {ok:false,failed:'E1'};
 const gaps=works.length-1,on=1+V.tied.onBandFraction,recoveryHigh=num(recovery.metres)?minutesAt(recovery.metres,c.recoveryBand.slowSecondsPerKm):recovery.minutes,recoveryLow=num(recovery.metres)?minutesAt(recovery.metres,c.recoveryBand.fastSecondsPerKm)/on:recovery.minutes;
 const fixed=c.warmupMinutes+c.cooldownMinutes,durationHigh=fixed+high+gaps*recoveryHigh,max=Math.min(c.budgetMinutes,c.canonicalDurationMinutes+E.E3.extraRecoveryIntervalsOfTheStep*c.step.recoveryMinutes);
 if(durationHigh>max+EPS)return {ok:false,failed:'E3'};
 return {ok:true,work:{low:lowDistance+lowTime,high},duration:{low:fixed+lowDistance/on+lowTime+gaps*recoveryLow,high:durationHigh},checks:{E1:{stepWork,low:r2(lowDistance+lowTime),high:r2(high)},E2:{stepRepetition:rep},E3:{max,high:r2(durationHigh)}}};
}
/** The jog recovery by distance of a step (R2 N5): its recovery minutes at the fast edge of the RECOVERY band, rounded up to 50 m. */
export const recoveryMetres=(recoveryMinutes,recoveryBand,V)=>Math.ceil(recoveryMinutes*60/recoveryBand.fastSecondsPerKm*1000/V.distances.recoveryUnitMetres-EPS)*V.distances.recoveryUnitMetres;
const byUnit=(grid,unit)=>grid.filter(d=>d%unit===0).sort((a,b)=>b-a);
/**
 * The candidates of a rotation entry, in the catalog's order (R2 values.candidateOrder; the SSCTR review of the candidate ruled, on F-1, that the
 * written order stands for MIXED as for the others).
 * - EVEN_REPEATS: the distance unit, coarsest first (1000, 400, 200, 100, 50); then the repetition count n, n-1, n+1; then the longer distance.
 * - MIXED: floor(n/2) distance repetitions, then the rest by time at exactly the step's minutes; the unit, coarsest first, then the longer distance.
 * - PYRAMID: the peak's unit, coarsest first, the longer peak first; then the larger flank step; then the shapes in their listed order.
 */
export function* repetitionCandidates(entry,c,V){
 const grid=repetitionGrid(V),units=V.distances.candidateUnitPreferenceCoarsestFirst,n=c.step.repetitions,P=V.patterns,time={minutes:c.step.recoveryMinutes};
 if(entry==='EVEN_REPEATS'||entry==='PROGRESSIVE_REPEATS'||entry==='EVEN_REPEATS_DISTANCE_RECOVERY'){
  if(entry==='EVEN_REPEATS_DISTANCE_RECOVERY'&&!c.recoveryBand)return;
  const recovery=entry==='EVEN_REPEATS_DISTANCE_RECOVERY'?{metres:recoveryMetres(c.step.recoveryMinutes,c.recoveryBand,V)}:time,min=Math.max(P.EVEN_REPEATS.minRepetitions,entry==='PROGRESSIVE_REPEATS'?P.PROGRESSIVE_REPEATS.minRepetitions:0);
  for(const unit of units)for(const offset of P.EVEN_REPEATS.repetitionCountOffsets){const k=n+offset;if(k<min)continue;for(const d of byUnit(grid,unit))yield {works:Array.from({length:k},()=>({metres:d})),recovery};}
  return;
 }
 if(entry==='MIXED'){
  if(n<P.MIXED.minRepetitions)return;const a=Math.floor(n/2);
  for(const unit of units)for(const d of byUnit(grid,unit))yield {works:[...Array.from({length:a},()=>({metres:d})),...Array.from({length:n-a},()=>({minutes:c.step.workMinutes}))],recovery:time};
  return;
 }
 if(entry==='PYRAMID'){
  if(!(c.step.workMinutes>c.familyMinRepetitionMinutes))return;const Y=P.PYRAMID,from=V.distances.repetitionMetres.from;
  for(const unit of units)for(const peak of byUnit(grid,unit))for(const flank of peak>=1000?Y.flankStepMetres.peakAtLeast1000:Y.flankStepMetres.peakBelow1000)for(const shape of Y.shapesInOrder){
   if(shape.length>n+Y.maxRepetitionsAboveStep)continue;
   const works=shape.map(k=>({metres:peak-k*flank,...(k?{flank:true}:{})}));if(works.some(w=>w.metres<from))continue;
   yield {works,recovery:time};}
 }
}
/** The first candidate of an entry that passes the envelope: the entry's format. */
export function repetitionCandidate(entry,c,V){
 for(const cand of repetitionCandidates(entry,c,V)){const r=checkRepetitions(cand.works,cand.recovery,c,V);if(r.ok)return {pattern:entry,...cand,...r};}
 return null;
}

// ---------- continuous runs: sizing (R3 C1, values.continuous; R3A A2) ----------
/**
 * The distance of a native continuous run. P_typ, the fastest compliant pace, is the slower of the class band's fast edge and the observed easy
 * median (P1). P_size, the athlete's own slow pace, is the slowest of P_typ, the observed range's slow edge (S1), the comparable long run's pace
 * (S2, LONG only), the latest run of the class (S3) and, for a long run at the marathon cap, the LONG band's slow edge (S4); S2 and S3 rounded up
 * to 5 s. D is the largest multiple of 1 km, else of 0.5 km, with
 *   CT-1  D x P_size (+ strides) <= min(M, the athlete's available minutes)   no planned excess
 *   CT-2  D x P_typ  (+ strides) >= 0.9 x M                                   dose parity with the time version
 *   CT-3  D <= 1.10 x L30                                                     a conservative expression bound, never a dose rule
 * Null when no D passes: the session is the TIME expression of the same dose.
 */
export function sizeContinuous({minutes,stridesMinutes=0,availableMinutes,bandFast,bandSlow,p1,comparablePace=null,latestPace=null,atMarathonCap=false,l30Km,fixedKm=null},V){
 const Q=V.tied,units=V.distances.continuousKmUnitsCoarsestFirst,up=x=>Math.ceil(x/Q.paceRoundUpSeconds-EPS)*Q.paceRoundUpSeconds;
 const pTyp=Math.max(bandFast,p1.fastSecondsPerKm),sources={S1:p1.slowSecondsPerKm,...(num(comparablePace,1)?{S2:up(comparablePace)}:{}),...(num(latestPace,1)?{S3:up(latestPace)}:{}),...(atMarathonCap?{S4:bandSlow}:{})};
 const pSize=Math.max(pTyp,...Object.values(sources)),ceiling=Math.min(minutes,availableMinutes),bound=Q.distanceReferenceMaxFraction*l30Km,floor=Q.doseFloor*minutes;
 const base={pTyp,pSize,sources,ceilingMinutes:ceiling,boundKm:Math.round(bound*1000)/1000};
 const at=d=>({high:d*pSize/60+stridesMinutes,low:d*pTyp/60+stridesMinutes});
 const found=(d,unit,t)=>({...base,distanceKm:d,unitKm:unit,estimate:t,checks:{'CT-1':{value:r2(t.high),max:ceiling},'CT-2':{value:r2(t.low),min:r2(floor)},'CT-3':{value:d,max:base.boundKm}}});
 // A distance delivered earlier in the week is kept only while it still passes the three checks with today's inputs: never taken as given.
 if(fixedKm!==null){
  const unit=num(fixedKm,0.5)?units.find(u=>Math.abs(fixedKm/u-Math.round(fixedKm/u))<EPS)??null:null,t=unit?at(fixedKm):null;
  return t&&t.high<=ceiling+EPS&&t.low>=floor-EPS&&fixedKm<=bound+EPS?found(fixedKm,unit,t):{...base,distanceKm:null};
 }
 for(const unit of units)for(let k=Math.floor(Math.min((ceiling-stridesMinutes)*60/pSize,bound)/unit+EPS);k>=1;k--){
  const d=k*unit,t=at(d);
  if(t.low<floor-EPS)break; // a shorter distance fails the dose floor too
  if(t.high<=ceiling+EPS&&d<=bound+EPS)return found(d,unit,t);
 }
 return {...base,distanceKm:null};
}

// ---------- the selector (handoff section 4; R2 N3, N8, N10; R3 C2) ----------
const experienceOf=x=>['INTERMEDIATE','EXPERIENCED'].includes(x)?x:'NOVICE';
/** Whether a rotation entry is admitted for this family, experience and phase (R2 values.eligibility, values.recoveryByDistance, values.patterns). */
function admitted(entry,{family,experience,phase},V){
 const G=V.eligibility,phases=G.phase[phase];if(!Array.isArray(phases)||!phases.includes(entry))return false;
 if(phase==='RACE_WEEK'&&!(G.raceWeek[entry]??[]).includes(family))return false;
 if(experience==='NOVICE'&&!G.noviceRotationEntries.includes(entry))return false;
 if(entry==='EVEN_REPEATS_DISTANCE_RECOVERY'){const R=V.recoveryByDistance;return R.experience.includes(experience)&&R.families.includes(family)&&R.phases.includes(phase);}
 if(entry==='PROGRESSIVE_REPEATS')return V.patterns.PROGRESSIVE_REPEATS.families.includes(family);
 if(entry==='PROGRESSIVE_EASY')return V.patterns.PROGRESSIVE_EASY.families.includes(family);
 return true;
}
/**
 * The first reason, in the catalog's order (R3 values.suppression.order), for which a session is the TIME expression before any format is tried.
 * Each is a state of the plan, the athlete or the record read again at every review, so a withdrawal to TIME is immediate.
 */
export function suppressionOf(x,V){
 const s=x.session,p=s.prescription,family=p.family,C=V.catalog,G=V.eligibility,pace=x.guidance?.pace??null,continuous=G.continuous.families.includes(family),experience=experienceOf(x.experience);
 if(!x.enabled)return {reason:'EXTENSION_NOT_ENABLED'};
 if(x.engineStatus==='HOLD'||pace?.reason==='HOLD_NO_PRESCRIPTION'&&x.engineStatus!=='CLINICAL_HUMAN_REQUIRED')return {reason:'HOLD_NO_PRESCRIPTION'};
 if(x.engineStatus==='CLINICAL_HUMAN_REQUIRED')return {reason:'CLINICAL_ROUTE'};
 if(x.screenRequired)return {reason:'WARNING_SIGN_SCREEN_REQUIRED',...(typeof x.screenRequired==='string'?{detail:x.screenRequired}:{})};
 if(!x.mode||G.timeOnlyModes.includes(x.mode)||pace?.reason==='MODE_WALK_JOG_RESTART_RETURN')return {reason:'MODE_WALK_JOG_RESTART_RETURN'};
 if(s.converted!==null&&s.converted!==undefined)return {reason:'ENGINE_CONVERTED_TO_EASY',detail:String(s.converted)};
 if(pace?.reason==='TEST_ALREADY_DONE_THIS_WEEK')return {reason:'TEST_ALREADY_DONE_THIS_WEEK'};
 if(C.TIME_ONLY_FAMILIES.includes(family)||!C[family]||!C[family].rotationEntries.length)return {reason:'NOT_A_NATIVE_FAMILY'};
 // The phase is read before the experience (the catalog's order): a continuous run of a novice in an eligible phase is EXPERIENCE_NOT_ELIGIBLE.
 const entries=C[family].rotationEntries.filter(e=>admitted(e,{family,experience:continuous?'EXPERIENCED':experience,phase:x.phase},V));
 if(!entries.length)return {reason:'PHASE_NOT_ELIGIBLE'};
 if(p.calibration?.firstExposure===true)return {reason:'FIRST_EXPOSURE'};
 if(x.preference==='TIME')return {reason:'EXPRESSION_PREFERENCE_TIME'};
 if(continuous&&!G.continuous.experience.includes(experience))return {reason:'EXPERIENCE_NOT_ELIGIBLE'};
 if(pace?.status!=='AVAILABLE')return {reason:'BAND_UNAVAILABLE',detail:pace?.reason??'NO_GUIDANCE'};
 if(continuous){
  if(!x.history?.p1)return {reason:'CONTINUOUS_PACE_UNOBSERVED'};
  if(family==='LONG'&&!x.history.comparable)return {reason:'LONG_HISTORY_NOT_COMPARABLE'};
  if(!x.history.l30)return {reason:'DISTANCE_HISTORY_UNKNOWN'};
  if(x.history.pausedUntil&&s.date<x.history.pausedUntil)return {reason:'CONTINUOUS_FORMAT_PAUSED',detail:x.history.pausedUntil};
 }
 if(C[family].extraSuppression==='MARATHON_ESTIMATE_ABOVE_360_MIN'&&(family==='MARATHON_SPECIFIC'||x.eventKind==='MARATHON')&&x.marathonEstimate?.status==='AVAILABLE'&&x.marathonEstimate.centralSeconds>V.tied.marathonEstimateCentralMaxSeconds)return {reason:'MARATHON_ESTIMATE_ABOVE_360_MIN'};
 return null;
}
const mmss=s=>`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
const kmText=km=>(Number.isInteger(km)?String(km):km.toFixed(1))+' km';
const range=(lo,hi)=>Math.round(lo)===Math.round(hi)?`about ${Math.round(lo)} min`:`about ${Math.round(lo)}-${Math.round(hi)} min`;
/** E5 (R2 values.envelope.E5): every text passes the frozen prescription validator's claim and effort-boundary checks. */
export const textsPass=(texts,p)=>texts.every(t=>{const e=validateR6Prescription({...p,effort:t,instructions:[t]});return !e.includes('claim')&&!e.includes('run.effortBoundary');});
const label=works=>{const d=works.filter(w=>num(w.metres)),t=works.filter(w=>!num(w.metres)),same=d.every(w=>w.metres===d[0].metres);
 return (same?`${d.length} x ${d[0].metres} m`:d.map(w=>w.metres).join('-')+' m')+(t.length?` + ${t.length} x ${t[0].minutes} min`:'');};
const hashOf=core=>hash({sessionId:core.sessionId,plannedPrescriptionHash:core.plannedPrescriptionHash,expression:core.expression,pattern:core.pattern,blocks:core.blocks});
const planningOf=(s,budget)=>{const p=s.prescription,w=p.work??null;return {plannedPrescriptionHash:s.plannedPrescriptionHash,family:p.family,ladder:s.progression?.ladder??null,step:s.progression?.value??null,workMinutes:w&&num(w.workMinutes)?w.repetitions*w.workMinutes:null,durationMinutes:p.durationMinutes,budgetMinutes:budget};};
/** The TIME expression of a session, whole: the canonical prescription in steps, its own instructions, and why no native format is given. */
function timeSession(x,reason){
 const s=x.session,p=s.prescription,band=x.guidance?.pace?.status==='AVAILABLE'?{...x.guidance.pace}:null,blocks=timeBlocks(p,{cues:x.cues,band}),minutes=stepsMinutes(blocks);
 const core={sessionId:s.id,plannedPrescriptionHash:s.plannedPrescriptionHash,expression:'TIME',pattern:'TIME',blocks};
 return {...core,formatId:'TIME:'+p.family,formatHash:hashOf(core),timeFormatHash:hashOf(core),week:s.weekIndex,date:s.date,role:s.role,family:p.family,planning:planningOf(s,x.budgetMinutes),
  estimate:{durationMinutes:{low:r2(minutes),high:r2(minutes)},basis:'CANONICAL_PRESCRIPTION'},dose:{withinEnvelope:true,canonical:true},unavailable:reason?{native:reason.reason,...(reason.detail?{detail:reason.detail}:{})}:null,instructions:clone(p.instructions??[])};
}
/** A native repetition session from the candidate that passed. */
function repetitionSession(x,cand,V){
 const s=x.session,p=s.prescription,X=V.texts,band={...x.guidance.pace},easy=cue(x.cues,'EASY_CONVERSATIONAL'),main=withPace(cue(x.cues,p.effortDomain,p.effort),band),byDistance=num(cand.recovery.metres);
 const work=w=>num(w.metres)?step('WORK',D(w.metres),main,{estimate:{seconds:{low:Math.round(w.metres/1000*band.fastSecondsPerKm),high:Math.round(w.metres/1000*band.slowSecondsPerKm)}}}):step('WORK',T(w.minutes*60),main,{estimate:metresEstimate(w.minutes*60,band)});
 const recovery=byDistance?step('RECOVERY',D(cand.recovery.metres),easy,{recoveryMode:'JOG',estimate:{seconds:{low:Math.round(cand.recovery.metres/1000*x.recoveryBand.fastSecondsPerKm),high:Math.round(cand.recovery.metres/1000*x.recoveryBand.slowSecondsPerKm)}}}):step('RECOVERY',T(cand.recovery.minutes*60),easy,{recoveryMode:'WALK_OR_JOG'});
 // Equal neighbours fold into one repeated block; the last block has no recovery after its last repetition.
 const groups=[];for(const w of cand.works){const g=groups.at(-1);if(g&&g.w.metres===w.metres&&g.w.minutes===w.minutes)g.n++;else groups.push({w,n:1});}
 const blocks=clean([{repeat:1,steps:[step('WARMUP',T(p.warmupMinutes*60),easy)]},...groups.map((g,i)=>({repeat:g.n,steps:[work(g.w),recovery],...(i===groups.length-1?{omitLastRecovery:true}:{})})),{repeat:1,steps:[step('COOLDOWN',T(p.cooldownMinutes*60),easy)]}]);
 const metres=cand.works.filter(w=>num(w.metres)),shortest=Math.min(...metres.map(w=>w.metres)),what=label(cand.works)+(cand.pattern==='PROGRESSIVE_REPEATS'?' progressive':'');
 const instructions=[`Warm up ${p.warmupMinutes} minutes easy`,`${what} - ${p.effort}; `+(byDistance?`${cand.recovery.metres} m between: ${X.recoveryByDistance}`:`${cand.recovery.minutes} min between: ${X.recoveryByTime}`),
  ...(cand.pattern==='PROGRESSIVE_REPEATS'?[`${X.progressiveRepeats} (${mmss(band.slowSecondsPerKm)} to ${mmss(band.fastSecondsPerKm)} per km)`]:[]),`Cool down ${p.cooldownMinutes} minutes easy`,`Whole session ${range(cand.duration.low,cand.duration.high)} (estimate)`,X.effortGoverns,X.repetitionStop,X.repetitionEstimate,...(shortest<1000?[X.shortRepetition]:[]),X.timeVersion,'Record the repetitions you completed, your effort and how you feel the next day'];
 const core={sessionId:s.id,plannedPrescriptionHash:s.plannedPrescriptionHash,expression:'NATIVE',pattern:cand.pattern,blocks},time=timeSession(x,null);
 if(!textsPass(instructions,p))return null;
 return {...core,formatId:`${cand.pattern}:${p.family}:${what.replace(/\s+/g,'')}`,formatHash:hashOf(core),timeFormatHash:time.formatHash,week:s.weekIndex,date:s.date,role:s.role,family:p.family,planning:planningOf(s,x.budgetMinutes),
  estimate:{durationMinutes:{low:r2(cand.duration.low),high:r2(cand.duration.high)},distanceKm:{low:r2(metres.reduce((n,w)=>n+w.metres,0)/1000),high:r2(metres.reduce((n,w)=>n+w.metres,0)/1000),of:'DISTANCE_WORK_TARGETS'},basis:'BAND_EDGES'},
  dose:{workMinutesAtBand:{low:r2(cand.work.low),high:r2(cand.work.high)},withinEnvelope:true,checks:cand.checks},unavailable:null,instructions,timeVersion:{formatHash:time.formatHash,blocks:time.blocks,durationMinutes:p.durationMinutes}};
}
/** A native continuous session from the distance the sizing gave. */
function continuousSession(x,pattern,size,V){
 const s=x.session,p=s.prescription,X=V.texts,band={...x.guidance.pace},main=withPace(cue(x.cues,p.effortDomain,p.effort),band),strides=stridesBlockMinutes(p);
 const run=step('STEADY',D(size.distanceKm*1000),main,{estimate:{seconds:{low:Math.round((size.estimate.low-strides)*60),high:Math.round((size.estimate.high-strides)*60)}}});
 const blocks=clean([{repeat:1,steps:[run]},...(p.strides?[stridesBlock(p,x.cues)]:[])]),what=kmText(size.distanceKm)+(p.family==='LONG'?' long run':' easy run');
 const instructions=[`${what}, ${range(size.estimate.low,size.estimate.high)} (estimate)`,X.continuous,...(pattern==='PROGRESSIVE_EASY'?[`${X.progressiveEasy} (never quicker than ${mmss(band.fastSecondsPerKm)} per km)`]:[]),X.continuousWalk,X.continuousStop,
  ...(p.strides?[`${X.stridesAfter}: ${p.strides.repetitions} x ${p.strides.workSeconds} s relaxed fast strides with ${p.strides.recoverySeconds} s easy walk or jog between, smooth, never a sprint`,...(p.strides.optional?['The strides are optional: the run without them is an equal choice']:[])]:[]),X.timeVersion,'Record the distance, the minutes and your effort'];
 const core={sessionId:s.id,plannedPrescriptionHash:s.plannedPrescriptionHash,expression:'NATIVE',pattern,blocks},time=timeSession(x,null);
 if(!textsPass(instructions,p))return null;
 return {...core,formatId:`${pattern}:${p.family}:${size.distanceKm}km`,formatHash:hashOf(core),timeFormatHash:time.formatHash,week:s.weekIndex,date:s.date,role:s.role,family:p.family,planning:planningOf(s,x.budgetMinutes),
  estimate:{durationMinutes:{low:r2(size.estimate.low),high:r2(size.estimate.high)},distanceKm:{low:size.distanceKm,high:size.distanceKm,of:'TARGET'},basis:'OWN_PACE_P_TYP_TO_P_SIZE'},
  dose:{planningMinutes:p.durationMinutes,withinEnvelope:true,checks:size.checks,sizing:{pTyp:size.pTyp,pSize:size.pSize,sources:size.sources}},unavailable:null,instructions,timeVersion:{formatHash:time.formatHash,blocks:time.blocks,durationMinutes:p.durationMinutes}};
}
/** What a candidate of a repetition session is checked against: the canonical step, the band of its domain, the session's budget. */
const contextOf=(x,V)=>{const p=x.session.prescription;return {step:p.work,band:x.guidance.pace,recoveryBand:x.recoveryBand?.status==='AVAILABLE'?x.recoveryBand:null,familyMinRepetitionMinutes:V.catalog[p.family].familyMinRepetitionMinutes??p.work.workMinutes,warmupMinutes:p.warmupMinutes,cooldownMinutes:p.cooldownMinutes,budgetMinutes:x.budgetMinutes,canonicalDurationMinutes:p.durationMinutes};};
/** The sizing of a continuous session from the band and the record (`fixedKm`: the one distance to check, instead of the largest that passes). */
const sizingOf=(x,V,fixedKm=null)=>{const p=x.session.prescription,band=x.guidance.pace,h=x.history,long=p.family==='LONG';
 return sizeContinuous({minutes:p.durationMinutes,stridesMinutes:stridesBlockMinutes(p),availableMinutes:x.availableMinutes,bandFast:band.fastSecondsPerKm,bandSlow:band.slowSecondsPerKm,p1:h.p1,comparablePace:long?h.comparable?.secondsPerKm??null:null,latestPace:h.latest?.secondsPerKm??null,atMarathonCap:long&&p.durationMinutes>=V.tied.marathonLongRunCapMinutes,l30Km:h.l30.km,fixedKm},V);};
/**
 * The prescribed form of one planned run session (deterministic; handoff section 4). `x`: the session and its week (`phase`, `mode`), the athlete
 * (`experience`, `eventKind`), the V1RC guidance of the session (`guidance`, its band never recomputed), the RECOVERY band and the marathon
 * estimate of its week, the cue texts, the session's budget and the athlete's available minutes, the expression preference, the engine's status,
 * and what the record says: `history` (P1, L30, the comparable long run, the latest run of the class, a pause) and `prior` (`evenOnly`: the last
 * session at this step was partial, missed or harder than its cue; `peakMetres`: the repetition distance of the achieved peak, in taper).
 */
export function selectRunSession(x,V){
 const s=x.session,p=s.prescription,family=p.family;
 try{
  const why=suppressionOf(x,V);if(why)return timeSession(x,why);
  const C=V.catalog[family],experience=experienceOf(x.experience);
  if(V.eligibility.continuous.families.includes(family)){
   const entries=C.rotationEntries.filter(e=>admitted(e,{family,experience,phase:x.phase},V)),size=sizingOf(x,V);
   if(size.distanceKm===null)return timeSession(x,{reason:'NO_DISTANCE_WITHIN_CONTINUOUS_ENVELOPE'});
   return continuousSession(x,x.prior?.evenOnly?entries[0]:entries[x.weekIndex%entries.length],size,V)??timeSession(x,{reason:'TEXT_CHECK_FAILED'});
  }
  const band=x.guidance.pace;
  if(C.domain!=='EVENT'&&band.domain!==C.domain)return timeSession(x,{reason:'STRUCTURE_ERROR',detail:'BAND_DOMAIN'});
  const c=contextOf(x,V);
  // R2 N9: in taper the achieved peak's own repetition distance is kept, with the engine's reduced count, when the reduced step still admits it.
  if(x.phase==='TAPER'&&num(x.prior?.peakMetres)&&admitted('EVEN_REPEATS',{family,experience,phase:x.phase},V)){
   const works=Array.from({length:p.work.repetitions},()=>({metres:x.prior.peakMetres})),recovery={minutes:p.work.recoveryMinutes},r=p.work.repetitions>=V.patterns.EVEN_REPEATS.minRepetitions?checkRepetitions(works,recovery,c,V):{ok:false};
   if(r.ok){const made=repetitionSession(x,{pattern:'EVEN_REPEATS',works,recovery,...r},V);if(made)return {...made,dose:{...made.dose,keptFromPeak:true}};}
  }
  const passing=C.rotationEntries.filter(e=>admitted(e,{family,experience,phase:x.phase},V)).map(e=>repetitionCandidate(e,c,V)).filter(Boolean);
  if(!passing.length)return timeSession(x,{reason:'NO_FORMAT_WITHIN_ENVELOPE',...(C.equivalentFallback===true?{detail:'EQUIVALENT_MODE_NOT_PART_OF_THIS_EXTENSION'}:{})});
  // R2 N10: rotation by the week's index among the entries that pass; after a partial, missed or harder-than-target session at this step, the first.
  return repetitionSession(x,x.prior?.evenOnly?passing[0]:passing[x.weekIndex%passing.length],V)??timeSession(x,{reason:'TEXT_CHECK_FAILED'});
 }catch{
  try{return timeSession(x,{reason:'STRUCTURE_ERROR'});}catch{return null;}
 }
}

/** What a selection chose, read back from a delivered format: the work sequence and what lies between, or the distance. Never its texts or its band. */
function structureOf(format){
 const steps=flatSteps(format.blocks);
 if(CONTINUOUS.has(format.pattern)){const run=steps.find(s=>s.kind==='STEADY'&&s.target.type==='DISTANCE');return run?{distanceKm:run.target.metres/1000}:null;}
 const work=steps.filter(s=>s.kind==='WORK'),rec=steps.find(s=>s.kind==='RECOVERY')??null;if(!work.length||!rec)return null;
 return {works:work.map(s=>s.target.type==='DISTANCE'?{metres:s.target.metres}:{minutes:s.target.seconds/60}),recovery:rec.target.type==='DISTANCE'?{metres:rec.target.metres}:{minutes:rec.target.seconds/60}};
}
const sameWork=(a,b)=>a.length===b.length&&a.every((w,i)=>w.metres===b[i].metres&&w.minutes===b[i].minutes);
/**
 * The format of a session is fixed for its week once a selection delivered it (R2 N10; handoff section 3): its structure is kept while it is
 * still a candidate of the catalog that passes the envelope with today's band and record, and the session is built again from that structure.
 * Nothing of the stored row is delivered as it is (a row is carried by the client): its texts, its estimates and its band are today's, and a
 * structure that is no candidate, or passes no more, gives way to a new selection. A protective state still withdraws the session to time at once.
 */
export function reselectRunSession(x,settled,V){
 const s=x.session,family=s.prescription.family;
 try{
  if(!isObj(settled)||settled.plannedPrescriptionHash!==s.plannedPrescriptionHash||suppressionOf(x,V))return selectRunSession(x,V);
  if(settled.expression==='TIME')return SELECTION_REASONS.includes(settled.unavailable?.native)?timeSession(x,{reason:settled.unavailable.native}):selectRunSession(x,V);
  const C=V.catalog[family],st=structureOf(settled);
  if(!st||!C.rotationEntries.includes(settled.pattern)||!admitted(settled.pattern,{family,experience:experienceOf(x.experience),phase:x.phase},V))return selectRunSession(x,V);
  if(V.eligibility.continuous.families.includes(family)){
   const size=num(st.distanceKm)?sizingOf(x,V,st.distanceKm):null;
   return size&&size.distanceKm!==null?continuousSession(x,settled.pattern,size,V)??selectRunSession(x,V):selectRunSession(x,V);
  }
  if(!st.works)return selectRunSession(x,V);
  const c=contextOf(x,V);
  for(const cand of repetitionCandidates(settled.pattern,c,V)){
   if(!sameWork(cand.works,st.works)||cand.recovery.metres!==st.recovery.metres||cand.recovery.minutes!==st.recovery.minutes)continue;
   const r=checkRepetitions(cand.works,cand.recovery,c,V);
   return r.ok?repetitionSession(x,{pattern:settled.pattern,...cand,...r},V)??selectRunSession(x,V):selectRunSession(x,V);
  }
  return selectRunSession(x,V);
 }catch{return selectRunSession(x,V);}
}

// ---------- the record of formats delivered (preflight V2) ----------
/** What a format row keeps: the structure a report is read against and what identifies it. No instruction, no free text of the session. */
const compact=s=>({sessionId:s.sessionId,plannedPrescriptionHash:s.plannedPrescriptionHash,expression:s.expression,pattern:s.pattern,blocks:s.blocks,formatId:s.formatId,formatHash:s.formatHash,timeFormatHash:s.timeFormatHash,week:s.week,date:s.date,role:s.role,family:s.family,estimate:s.estimate,unavailable:s.unavailable});
const formatKey=(sessionId,formatHash,settled)=>`${sessionId}|${formatHash}|${settled?'W':'P'}`;
const STEP_KINDS=new Set(['WARMUP','WORK','RECOVERY','COOLDOWN','STEADY','STRIDES']);
/** The blocks of a format are a small closed structure; anything else is no format (so a row can cost nothing to read, whatever it holds). */
function boundedBlocks(blocks){
 if(!Array.isArray(blocks)||blocks.length<1||blocks.length>24)return false;let steps=0;
 for(const b of blocks){
  if(!isObj(b)||!Number.isInteger(b.repeat)||b.repeat<1||b.repeat>60||!Array.isArray(b.steps)||b.steps.length<1||b.steps.length>4)return false;
  for(const s of b.steps){const t=isObj(s)?s.target:null;if(!isObj(t)||!STEP_KINDS.has(s.kind)||!(t.type==='TIME'&&num(t.seconds,1,6*3600)||t.type==='DISTANCE'&&num(t.metres,50,100000)))return false;}
  steps+=b.repeat*b.steps.length;if(steps>400)return false;
 }
 return true;
}
const readableFormat=(o,athleteId)=>isObj(o)&&o.fact===RUN_FORMAT_EMITTED&&o.athleteId===athleteId&&isObj(o.format)&&typeof o.sessionId==='string'&&o.format.sessionId===o.sessionId&&EXPRESSIONS.includes(o.format.expression)&&boundedBlocks(o.format.blocks)&&o.inputHash===hash(o.format)
 &&o.format.formatHash===o.formatHash&&hashOf(o.format)===o.formatHash&&o.eventId===formatKey(o.sessionId,o.formatHash,o.settled===true)&&Number.isFinite(Date.parse(o.recordedAt));
/**
 * The carried record read: every readable format by session and hash (what a report cites is resolved here, never recomputed with today's bands),
 * the settled format of each session (the last one delivered while its own week was in force, by a selection and not by a protective state),
 * and the rows that failed their integrity check, named and never read.
 */
export function readFormatRecord(record,athleteId){
 const byHash=new Map(),settled=new Map(),unreadable=[],rows=[];
 for(const r of list(record)){if(readableFormat(r,athleteId))rows.push(r);else if(isObj(r)&&r.fact===RUN_FORMAT_EMITTED)unreadable.push(typeof r.eventId==='string'?r.eventId:null);}
 // Read in the order the rows were recorded, whatever order they arrive in: the record is a set of facts, never a sequence the sender controls.
 rows.sort((x,y)=>Date.parse(x.recordedAt)-Date.parse(y.recordedAt)||(x.eventId<y.eventId?-1:x.eventId>y.eventId?1:0));
 for(const r of rows){
  const key=r.sessionId+'|'+r.formatHash;if(!byHash.has(key)||r.settled===true)byHash.set(key,r.format);
  if(r.format.timeFormatHash&&!byHash.has(r.sessionId+'|'+r.format.timeFormatHash))byHash.set(r.sessionId+'|'+r.format.timeFormatHash,{sessionId:r.sessionId,plannedPrescriptionHash:r.format.plannedPrescriptionHash,expression:'TIME',pattern:'TIME',formatHash:r.format.timeFormatHash});
  if(r.settled===true)settled.set(r.sessionId,r.format);
 }
 return {resolve:(sessionId,formatHash)=>byHash.get(sessionId+'|'+formatHash)??null,settledOf:sessionId=>settled.get(sessionId)??null,unreadable:unreadable.sort(),size:byHash.size};
}
/** The record after a review: the carried rows as received, plus one row per format delivered that it does not hold yet (append-only). */
export function appendFormats(record,sessions,{athleteId,recordedAt}){
 const carried=list(record).map(r=>clone(r)),ids=new Set(carried.filter(isObj).map(r=>r.eventId)),added=[];
 for(const s of sessions){
  const settled=s.provisional!==true&&(s.expression==='NATIVE'||SELECTION_REASONS.includes(s.unavailable?.native)),id=formatKey(s.sessionId,s.formatHash,settled);
  if(ids.has(id))continue;ids.add(id);const format=clean(compact(s));
  added.push({fact:RUN_FORMAT_EMITTED,eventId:id,athleteId,recordedAt,sessionId:s.sessionId,formatHash:s.formatHash,settled,week:s.week,format,inputHash:hash(format)});
 }
 return {record:[...carried,...added],added:added.map(r=>r.eventId)};
}

// ---------- what each run report said (fix-forward of 2026-11-14: QRE-RWS-B-01, SSCTR-RWS-B-01) ----------
/**
 * The engine keeps one row per execution: two reports of one run that agree become one row, and a report that contradicts another is refused and
 * its row marked in conflict. Two things a report says can therefore be on no row, or on a row nothing reads: a stop it declares, and the distance
 * it measured. They are kept here, in the same append-only record as the formats, one row per report received that states either:
 * - `stop`: the stop as it is read (a reason of the closed list; none stated, or one not listed, is SYMPTOM). A safety signal only: it asks for
 *   the warning-sign screen and is never credit, never the pause rule and never sizing. It is kept whatever the engine does with the report.
 * - `distanceKm`: the distance the report itself measured (a measured source), and `timed`: whether the report carried the duration of that run.
 *   Read only to withhold a distance from pace readers (reportsVerdict), never to add one.
 * No free text is kept: a reason is the closed word it is read as.
 */
export const RUN_REPORT_RECEIVED='RUN_REPORT_RECEIVED';
/** The longest id of a report a fact row names it by (the custody's own bound on a request id); a longer one is named by its content. */
const REPORT_ID_MAX=128;
const reportKey=(reportId,inputHash)=>`report|${reportId}|${inputHash.slice(0,16)}`;
/**
 * What one received run report states, or null when it states neither a stop nor a measured distance. `fromDevice`: a device activity's report.
 * A report with no id of its own (the engine refuses it) is named by its content, so a stop it declares is still kept.
 */
export function reportFactOf(o,V,{fromDevice=false}={}){
 if(!isObj(o)||!isObj(o.actual)||typeof o.sessionId!=='string')return null;
 const a=o.actual,F=V.runFacts,stop=stopOf(a,V),measured=num(a.distanceKm,0.01,F.runDistanceKmMax)&&F.measuredSources.includes(upper(a.measurement)??(fromDevice?'GPS':null));
 if(!stop&&!measured)return null;
 const reportId=typeof o.eventId==='string'&&o.eventId&&o.eventId.length<=REPORT_ID_MAX?o.eventId:'unidentified:'+hash({sessionId:o.sessionId,actual:clean(a)}).slice(0,16);
 return {sessionId:o.sessionId,reportId,stop:stop?{reason:stop.reason,stated:stop.stated}:null,distanceKm:measured?a.distanceKm:null,timed:minutesOfActual(a)!==null};
}
const readableReport=(o,athleteId,V)=>isObj(o)&&o.fact===RUN_REPORT_RECEIVED&&o.athleteId===athleteId&&isObj(o.report)&&typeof o.sessionId==='string'&&o.report.sessionId===o.sessionId&&typeof o.report.reportId==='string'&&o.report.reportId.length>0&&o.report.reportId.length<=REPORT_ID_MAX&&Object.keys(o.report).length===5&&typeof o.inputHash==='string'&&o.inputHash===hash(o.report)
 &&o.eventId===reportKey(o.report.reportId,o.inputHash)&&Number.isFinite(Date.parse(o.recordedAt))&&(o.report.stop===null||isObj(o.report.stop)&&V.stops.reasons.includes(o.report.stop.reason)&&typeof o.report.stop.stated==='boolean')
 &&(o.report.distanceKm===null||num(o.report.distanceKm,0.01,V.runFacts.runDistanceKmMax))&&typeof o.report.timed==='boolean'&&(o.report.stop!==null||o.report.distanceKm!==null);
/** The record with one row per fact it does not hold yet (append-only; the same report sent again adds nothing). */
export function appendReportFacts(record,facts,{athleteId,recordedAt}){
 const carried=list(record).map(r=>clone(r)),ids=new Set(carried.filter(isObj).map(r=>r.eventId)),added=[];
 for(const f of list(facts)){if(!f)continue;const report=clean(f),inputHash=hash(report),id=reportKey(report.reportId,inputHash);if(ids.has(id))continue;ids.add(id);added.push({fact:RUN_REPORT_RECEIVED,eventId:id,athleteId,recordedAt,sessionId:report.sessionId,report,inputHash});}
 return {record:[...carried,...added],added:added.map(r=>r.eventId)};
}
/**
 * The report facts of a carried record: by the report that stated them (`of`), every declared stop with the instant the record first held it
 * (`stops`), and the rows that failed their integrity check, named and never read.
 */
export function readReportFacts(record,athleteId,V){
 const by=new Map(),stops=[],unreadable=[];
 for(const r of list(record)){
  if(!readableReport(r,athleteId,V)){if(isObj(r)&&r.fact===RUN_REPORT_RECEIVED)unreadable.push(typeof r.eventId==='string'?r.eventId:null);continue;}
  if(!by.has(r.report.reportId))by.set(r.report.reportId,[]);by.get(r.report.reportId).push(r.report);
  if(r.report.stop)stops.push({sessionId:r.sessionId,reportId:r.report.reportId,reason:r.report.stop.reason,at:Date.parse(r.recordedAt)});
 }
 return {of:reportId=>by.get(reportId)??[],stops,unreadable:unreadable.sort(),size:by.size};
}
/** The reports a row of the engine's record was made of: the reports merged into it, or its own. */
export const sourcesOf=row=>Array.isArray(row?.provenance?.mergedSourceIds)&&row.provenance.mergedSourceIds.length?row.provenance.mergedSourceIds.filter(x=>typeof x==='string'):typeof row?.eventId==='string'?[row.eventId]:[];
/**
 * What the reports a row was made of say about its distance, for pace readers only: DURATION_REQUIRED when one of them measured a distance with
 * no duration of its own (the row's minutes are then another report's: the pace is of no single recording), DISTANCE_DISPUTED when two of them
 * measured distances further apart than a working device is known to read (the tied 0.91: one of them is not the whole run), else null.
 */
export function reportsVerdict(row,facts,V){
 if(!facts||!isObj(row))return null;
 const said=sourcesOf(row).flatMap(id=>facts.of(id)).filter(f=>f.sessionId===row.sessionId&&f.distanceKm!==null);
 if(said.some(f=>!f.timed))return 'DURATION_REQUIRED';
 const d=said.map(f=>f.distanceKm);
 return d.length>1&&Math.min(...d)<V.tied.correctionFloorFraction*Math.max(...d)-EPS?'DISTANCE_DISPUTED':null;
}

// ---------- reading an execution (handoff section 5; R3 C3-C5; R3A A1) ----------
const mainSteps=format=>flatSteps(format.blocks).filter(s=>CONTINUOUS.has(format.pattern)?s.kind==='STEADY':s.kind==='WORK');
const minutesOfActual=a=>num(a.seconds,1)?a.seconds/60:num(a.minutes,0.01)?a.minutes:null;
const notComparable=(a,V)=>list(a.conditions).slice(0,20).map(upper).some(c=>V.exposure.neutralConditions.includes(c));
/** A declared stop, with its reason: one the catalog lists, or SYMPTOM when none is stated or the one stated is not listed (V1RC R-01). */
export const stopOf=(a,V)=>{if(!isObj(a?.stop))return null;const stated=upper(a.stop.reason),known=V.stops.reasons.includes(stated);return {reason:known?stated:V.stops.missingReasonReadAs,stated:known,atStep:a.stop.atStep??null,metres:num(a.stop.metres,0)?a.stop.metres:null,seconds:num(a.stop.seconds,0)?a.stop.seconds:null};};
/**
 * The completion of a native session, derived from the raw facts of its report and the format the report cites; never accepted from anywhere.
 * Precedence (R3 values.statuses): STOPPED, PARTIAL, UNKNOWN, then met. Null status for a format with no distance target: the engine's own read.
 * - STOPPED: a declared stop, with its reason (none stated is read as SYMPTOM, V1RC R-01). Never the target met.
 * - A continuous run (R3A values.completion.continuous): met as MEASURED (a usable measurement at or above the target and no declaration below
 *   it; several recordings of one run are summed), as CONFIRMED_CORRECTION (a measurement below the target or flagged by the device, at least
 *   0.91 of the target, and the athlete declaring the target with a listed failure reason or under the device's own flag; its reliability is
 *   POOR and the measured value stays as it was measured), or as DECLARED (no measurement and an explicit declaration). No tolerance turns a
 *   shorter measurement into a met target. A declaration below the target, or a usable shorter measurement with no answer, is PARTIAL; no
 *   evidence, a flagged measurement with no answer, a measurement no duration lets be checked, or a conflict, is UNKNOWN.
 * - Every fact is read from the row as the record holds it now (distanceFacts): the reading never depends on which report brought a fact, or on
 *   a mark set when a report arrived (QRE-RWS-B-01).
 * - Repetitions (R2 N7, R3 C3): each WORK step is met by a lap (the athlete's or the device's), never by a GPS distance; a step by time, by its
 *   seconds when reported. A step not met is PARTIAL; a step with no lap and no confirmation is UNKNOWN.
 * `exposure.aboveEstimate` is a record flag, not a status: the real minutes exceeded 1.015 of the high estimate.
 */
export function readCompletion(actual,format,V,{wearable=false,reports=null}={}){
 const a=isObj(actual)?actual:{},minutes=minutesOfActual(a),est=format.estimate?.durationMinutes??null,above=minutes!==null&&!!est&&minutes>(1+V.tied.onBandFraction)*est.high+EPS;
 const f=distanceFacts(a,V,{wearable,reports}),evidence={source:f.source,quality:f.quality,measuredKm:f.measuredKm,declaredKm:f.declaredKm};
 const out=(status,extra={})=>({status,basis:null,tier:null,flag:null,ask:null,stop:null,formatHash:format.formatHash,evidence,...extra,exposure:{estimateMinutes:est?{low:est.low,high:est.high}:null,actualMinutes:minutes,aboveEstimate:above}});
 const main=mainSteps(format);if(!main.some(s=>s.target.type==='DISTANCE'))return out(null);
 if(isObj(a.stop))return out('STOPPED',{stop:stopOf(a,V)});
 if(CONTINUOUS.has(format.pattern)){
  // Usable: measured, checked against its duration, not flagged by its source, and either the sum of several recordings or a single one the
  // athlete did not correct.
  const target=main[0].target.metres/1000,floor=V.tied.correctionFloorFraction*target,usable=f.measuredKm!==null&&!f.devicePoor&&!f.implausible&&!f.untimed&&(f.segments>0||!f.markedPoor),SHORT='STOP_REASON_OR_CORRECTION_OR_RAN_LESS';
  const own=f.declaredKm??f.manualKm;
  if(own!==null&&own<target-EPS)return out('PARTIAL',{flag:'SHORTFALL_DECLARED',countsForPause:true});
  if(a.completed===false)return out('PARTIAL',{flag:'REPORTED_NOT_COMPLETED',ask:SHORT,countsForPause:true});
  if(f.manualKm!==null)return out('UNKNOWN',{flag:'DISTANCE_SOURCE_REQUIRED',ask:'SEND_THE_MEASURED_DISTANCE_WITH_ITS_SOURCE_OR_A_DECLARATION'});
  if(usable&&f.measuredKm>=target-EPS)return out('DISTANCE',{basis:'MEASURED',tier:f.source});
  if(f.declaredKm!==null){
   if(f.measuredKm===null)return out('DISTANCE',{basis:'DECLARED',tier:'DECLARED'});
   if(f.reason===null&&!f.devicePoor)return out('UNKNOWN',{flag:'MEASUREMENT_CONFLICT',ask:'FAILURE_REASON_OR_SOURCE_CORRECTION'});
   if(f.measuredKm<floor-EPS)return out('UNKNOWN',{flag:'MEASUREMENT_CONFLICT',ask:'MEASURE_THE_MISSING_PART'});
   // A corrected run is never pace evidence: its reliability is POOR by its own facts, and no reader of pace is handed its distance (SC-3;
   // v1-run-format-index.mjs admits the record before the calibration reads it).
   return out('DISTANCE',{basis:'CONFIRMED_CORRECTION',tier:'CONFIRMED_CORRECTION'});
  }
  if(f.measuredKm===null)return out('UNKNOWN',{ask:'CONFIRM_OR_MEASURE'});
  // A measurement that is a fault (an impossible pace), that no duration lets be checked, or that its source flagged, is no usable measurement.
  if(!usable)return out('UNKNOWN',f.implausible?{flag:'MEASUREMENT_IMPLAUSIBLE',ask:'CONFIRM_OR_CORRECT'}:f.untimed?{flag:'DURATION_REQUIRED',ask:'SEND_THE_DURATION_OF_THE_RUN'}:{flag:'MEASUREMENT_FLAGGED_POOR',ask:'CONFIRM_OR_CORRECT'});
  // A usable measurement a little short, with no stop and no answer: it neither counts for the pause rule nor resets it (R3A X-2 counting).
  return out('PARTIAL',{ask:SHORT,countsForPause:f.measuredKm<floor-EPS});
 }
 const laps=list(a.steps).slice(0,400).filter(isObj),reportOf=s=>laps.find(e=>e.block===s.block&&e.rep===s.rep&&upper(e.kind)==='WORK')??null;
 const met=main.map(s=>{const e=reportOf(s);if(!e)return null;if(s.target.type==='TIME'&&num(e.seconds,0))return e.targetMet!==false&&e.seconds>=s.target.seconds-0.5;return e.targetMet===true?true:e.targetMet===false?false:null;});
 const done=met.filter(m=>m===true).length;
 if(met.includes(false)||a.completed===false)return out('PARTIAL',{ask:'STOP_REASON_OR_RAN_LESS',stepsMet:done,stepsPlanned:main.length,countsForPause:true});
 if(met.includes(null))return out('UNKNOWN',{ask:'LAP_CONFIRMATION',stepsMet:done,stepsPlanned:main.length});
 return out('DISTANCE',{basis:'LAP',tier:f.source??'LAP',stepsMet:done,stepsPlanned:main.length});
}
/**
 * What an executed session exposes to a reader beside the engine (the contract a later Race Forecast reads; nothing here is credit): the status and
 * its basis, the target, the measured and the declared distance, the smaller usable distance (`extentKm`, the history rule), the real and the
 * estimated minutes, whether the execution may be pace evidence (never a declared or corrected distance, a treadmill, a POOR measurement, a
 * distance withheld from pace readers (`paceWithheld`, with its reason) or a flagged condition), and the planning weight of each main step with
 * whether its target was met. `completed` is the engine's own reading of the row. `reports`: what the reports the row was made of say about its
 * distance (reportsVerdict), when the caller holds them.
 */
export function executionOf(row,format,V,{boutMinutes=null,reports=null}={}){
 const a=row.actual??{},wearable=String(row.provenance?.sourceQuality??'').startsWith('WEARABLE'),f=distanceFacts(a,V,{wearable,reports}),ref=historyReference(f),base={eventId:row.eventId,completed:row.partial!==true&&a.completed===true&&row.conflicted!==true,actualMinutes:minutesOfActual(a),measuredKm:f.measuredKm,declaredKm:f.declaredKm,extentKm:ref,reliability:f.quality,paceWithheld:f.paceWithheld};
 // A session done by time (or whose cited format expresses another dose) is the engine's own reading; a stop it declares is still a stop.
 if(!format||format.expression!=='NATIVE')return {...base,status:'TIME',basis:null,expression:'TIME',formatHash:format?.formatHash??null,paceEvidence:null,stop:stopOf(a,V)};
 const read=readCompletion(a,format,V,{wearable,reports}),main=mainSteps(format),continuous=CONTINUOUS.has(format.pattern),targetKm=continuous?main[0].target.metres/1000:r2(main.filter(s=>s.target.type==='DISTANCE').reduce((n,s)=>n+s.target.metres,0)/1000);
 const laps=list(a.steps).slice(0,400).filter(isObj),clear=upper(a.measurement)!=='TREADMILL'&&!f.markedPoor&&!f.implausible&&!f.paceWithheld&&f.segments===0&&!notComparable(a,V);
 // Repetitions shorter than the calibration's bout (5 minutes of the planned step) are never pace evidence (R2 N7; V1RC Q8).
 const bouts=num(boutMinutes,V.tied.calibrationBoutMinutesMin);
 return {...base,status:read.status,basis:read.basis,tier:read.tier,flag:read.flag,ask:read.ask,stop:read.stop,expression:'NATIVE',pattern:format.pattern,formatHash:format.formatHash,targetKm,estimateMinutes:read.exposure.estimateMinutes,aboveEstimate:read.exposure.aboveEstimate,
  paceEvidence:read.status==='DISTANCE'&&clear&&(read.basis==='MEASURED'||read.basis==='LAP'&&bouts),countsForPause:read.countsForPause===true,
  steps:main.map(s=>{const e=laps.find(r=>r.block===s.block&&r.rep===s.rep&&upper(r.kind)===s.kind)??null,q=s.estimate?.seconds,weightSeconds=s.target.type==='TIME'?s.target.seconds:num(q?.low)&&num(q?.high)?Math.round((q.low+q.high)/2):null;
   return {block:s.block,rep:s.rep,kind:s.kind,target:clone(s.target),weightSeconds,targetMet:continuous?read.status==='DISTANCE':e?.targetMet===true?true:e?.targetMet===false?false:null,...(continuous&&read.status!=='DISTANCE'&&ref!==null?{extentFraction:Math.min(1,r2(ref/targetKm))}:{})};})};
}
/**
 * The pause of a class of continuous runs (R3 X-2, counting as amended by R3A): two consecutive distance-expressed continuous sessions of one
 * class (EASY or LONG), each above its estimate, stopped or partial, put that class in TIME for 28 days from the second. A session of the class
 * by time that the engine reads as complete, with no stop, or a distance session that met its target inside its estimate, starts the count again;
 * a time session not completed neither counts nor resets (SSCTR review of the candidate, A-03). A treadmill session, one
 * under a flagged condition, an UNKNOWN one, and a PARTIAL resting only on a usable measurement of at least 0.91 of the target neither count nor
 * reset. `rows` are the class's executions in date order, each {date, execution, actual}. Returns the day the pause ends, or null.
 */
export function pausedUntil(rows,V,addDays){
 let count=0,until=null;
 for(const r of rows){
  const e=r.execution,a=r.actual??{};
  if(V.exposure.neutralMeasurements.includes(upper(a.measurement))||notComparable(a,V)||e.status==='UNKNOWN')continue;
  if(e.expression!=='NATIVE'){if(e.completed===true&&!isObj(a.stop))count=0;continue;}
  if(e.status==='PARTIAL'&&!e.countsForPause)continue;
  if(e.status==='STOPPED'||e.status==='PARTIAL'||e.status==='DISTANCE'&&e.aboveEstimate){count++;if(count>=V.tied.consecutiveSessions){until=addDays(r.date,V.tied.windowDays);count=0;}}else count=0;
 }
 return until;
}
