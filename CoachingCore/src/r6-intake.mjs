import {clone,freeze,hash} from './value.mjs';
import {catalogueEntry} from './r6-catalogue.mjs';
import {ordinalResistance,allowsCandidate,DEFAULT_REPERTOIRE} from './r7b-repertoire.mjs';
import {screenInterruptionReason,isYes} from './r6-clinical.mjs';

export const INTAKE_VERSION='R6-INTAKE-1';
export const isoDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export const onDate=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10);
export const dayGap=(start,end)=>(Date.parse(end.slice(0,10)+'T00:00:00Z')-Date.parse(start.slice(0,10)+'T00:00:00Z'))/86400000;
const number=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
const present=v=>v!==undefined&&v!==null&&v!=='';
const upper=v=>typeof v==='string'?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
export const RUN_GOALS={RACE:'RACE',EVENT:'RACE','10K':'RACE',RACE_10K:'RACE',HALF_MARATHON:'RACE',RACE_HALF_MARATHON:'RACE',PERFORMANCE:'PERFORMANCE',IMPROVE:'PERFORMANCE',RUN_FASTER:'PERFORMANCE',REGULAR:'REGULAR',RUN_REGULARLY:'REGULAR',CONSISTENCY:'REGULAR',GENERAL:'GENERAL',GENERAL_FITNESS:'GENERAL',HEALTH:'GENERAL',NONE:'NONE'};
export const STRENGTH_GOALS={STRENGTH:'STRENGTH',GET_STRONGER:'STRENGTH',HYPERTROPHY:'HYPERTROPHY',MUSCLE:'HYPERTROPHY',BUILD_MUSCLE:'HYPERTROPHY',RUNNING_SUPPORT:'RUNNING_SUPPORT',RUN_BETTER:'RUNNING_SUPPORT',FORCA_PARA_CORRER:'RUNNING_SUPPORT',MAINTAIN:'MAINTAIN',MAINTENANCE:'MAINTAIN',GENERAL:'GENERAL',GENERAL_FITNESS:'GENERAL',HEALTH:'GENERAL',NONE:'NONE'};
const EXPERIENCE={NONE:'NONE',NEVER:'NONE',NOVICE:'NOVICE',BEGINNER:'NOVICE',INTERMEDIATE:'INTERMEDIATE',REGULAR:'INTERMEDIATE',EXPERIENCED:'EXPERIENCED',ADVANCED:'EXPERIENCED'};
export const EVENTS={'10K':'10K','10_K':'10K',RACE_10K:'10K',HALF_MARATHON:'HALF_MARATHON',HALF:'HALF_MARATHON',RACE_HALF_MARATHON:'HALF_MARATHON','21K':'HALF_MARATHON',MARATHON:'MARATHON','42K':'MARATHON','5K':'5K',ULTRA:'ULTRA'};
const ROTATIONS=['COACH_DECIDES','EVERY_6_WEEKS','EVERY_2_WEEKS','FIXED'];
const CLINICAL_KEYS=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];
const unknown=(field,category,action,extra={})=>({field,category,action,...extra});
function days(value,name,missing,errors){
 if(value===undefined||value===null){missing.push(name);return [];}
 if(!Array.isArray(value)||value.some(d=>!Number.isInteger(d)||d<0||d>6)||new Set(value).size!==value.length){errors.push(name+'.uniqueDay0to6');return [];}
 return [...value].sort((a,b)=>a-b);
}
function eligibility(a,asOf){
 const e=a.eligibility??{},limitation=upper(a.limitation??e.limitation);
 // A clinical flag that means yes in any form routes to a human; any other non-boolean flag leaves eligibility unassessed (SSCTR R6).
 const clinical=CLINICAL_KEYS.some(k=>isYes(e[k]))||['CLINICAL','CLINICAL_HUMAN_REQUIRED','INJURED','ILL','PAIN_OR_INJURY'].includes(upper(e.status))||limitation==='PAIN_OR_INJURY'||isYes(a.clinicalConcern);
 const declared=['NONCLINICAL_CONFIRMED','ELIGIBLE_NONCLINICAL'].includes(upper(e.status))||e.nonclinicalConfirmed===true||['NONE','PAUSE_NONCLINICAL'].includes(limitation);
 const date=(e.assessedAt??asOf)?.slice?.(0,10);
 const current=isoDay(date)&&isoDay(asOf)&&dayGap(date,asOf)>=0&&dayGap(date,asOf)<=14;
 const flagsKnown=CLINICAL_KEYS.every(k=>typeof e[k]==='boolean')||['NONE','PAUSE_NONCLINICAL'].includes(limitation);
 return {status:clinical?'CLINICAL':declared&&current&&flagsKnown?'NONCLINICAL_CONFIRMED':'UNASSESSED',assessedAt:isoDay(date)?date:null,limitation,flags:Object.fromEntries(CLINICAL_KEYS.map(k=>[k,typeof e[k]==='boolean'?e[k]:null]))};
}
const currentFamiliar=(t,asOf)=>t&&t.current===true&&t.familiar===true&&t.tolerated===true&&isoDay(asOf)&&isoDay(t.observedAt?.slice?.(0,10))&&dayGap(t.observedAt.slice(0,10),asOf)>=0&&dayGap(t.observedAt.slice(0,10),asOf)<=28;
export const LB_TO_KG=0.45359237;
export const LOAD_CONVENTIONS=['TOTAL','PER_HAND','SINGLE_IMPLEMENT','BODYWEIGHT','MACHINE_STACK'];
/**
 * Loads are kilograms inside the engine (QRE-R6-01). A pound value is converted at the boundary to the nearest 0.5 kg and
 * kept as reported; any other or missing unit leaves the load unknown. Bodyweight carries no external load.
 */
export function toKilograms(load){
 if(!load||typeof load!=='object'||!LOAD_CONVENTIONS.includes(load.convention))return null;
 const unit=upper(load.unit);
 if(unit==='BODYWEIGHT'||load.convention==='BODYWEIGHT')return {value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'};
 if(unit==='KG')return number(load.value,0,500)?{value:load.value,unit:'KG',convention:load.convention}:null;
 if(unit==='LB'){const kg=Math.round(load.value*LB_TO_KG*2)/2;return number(load.value,0,1100)&&number(kg,0,500)?{value:kg,unit:'KG',convention:load.convention,reported:{value:load.value,unit:'LB'}}:null;}
 return null;
}
function knownExercise(e,asOf,errors){
 if(!e||typeof e!=='object'||!present(e.id)){errors.push('knownExercises.id');return null;}
 const entry=catalogueEntry(e.id),pattern=upper(e.pattern)??entry?.pattern??null;
 let load=toKilograms(typeof e.load==='number'?{value:e.load,unit:'KG',convention:e.convention??entry?.convention??'TOTAL'}:e.load??null);
 if(load?.unit==='BODYWEIGHT'&&entry&&entry.loading!=='BODYWEIGHT')load=null;
 // A band or assistance level is ordinal and athlete-reported: no value of it is ever a load (B0-C04).
 if(entry&&ordinalResistance(entry))load=null;
 const loadComplete=!!load;
 // A reported dose above the prescription envelope's six sets is history; the plan starts at six (QRE-R6-12).
 const doseComplete=loadComplete&&Number.isInteger(e.sets)&&e.sets>=1&&e.sets<=10&&Number.isInteger(e.reps)&&e.reps>=1&&e.reps<=30&&number(e.rir,0,8);
 return {id:e.id,pattern,equipment:clone(e.equipment??entry?.equipment??[]),familiar:e.familiar!==false,current:currentFamiliar({...e,familiar:e.familiar!==false},asOf),observedAt:e.observedAt??null,dose:doseComplete&&currentFamiliar({...e,familiar:e.familiar!==false},asOf)?{sets:Math.min(6,e.sets),reps:e.reps,rir:e.rir,load:clone(load),restSeconds:e.restSeconds??null,...(e.sets>6?{reportedSets:e.sets}:{})}:null,loadHint:loadComplete?clone(load):null,source:e.source??'SELF_REPORT'};
}
/** A familiar quality task is used only when its work adds up inside its duration (QRE-R6-12). */
const plausibleRunTask=p=>{const w=p?.work;if(!w)return true;return Number.isInteger(w.repetitions)&&w.repetitions>=1&&w.repetitions<=20&&number(w.workMinutes,0.5,60)&&number(w.recoveryMinutes??0,0,15)&&number(p.durationMinutes,5,240)&&(p.warmupMinutes??0)+(p.cooldownMinutes??0)+w.repetitions*w.workMinutes+Math.max(0,w.repetitions-1)*(w.recoveryMinutes??0)<=p.durationMinutes+0.01;};
/** Wearable activity history is evidence with provenance, never a replacement for current eligibility. */
function historySummary(history,asOf,capabilities){
 const rows=(Array.isArray(history)&&isoDay(asOf)?history:[]).filter(h=>h&&typeof h.startedAt==='string'&&isoDay(h.startedAt.slice(0,10))&&Number.isFinite(Date.parse(h.startedAt))&&dayGap(h.startedAt.slice(0,10),asOf)>0&&dayGap(h.startedAt.slice(0,10),asOf)<=28);
 const seen=new Set(),unique=rows.filter(h=>{const key=h.canonicalActivityId??h.activityId??h.startedAt+':'+h.sport;if(seen.has(key))return false;seen.add(key);return true;});
 const runs=unique.filter(h=>upper(h.sport)==='RUN'&&number(h.durationMinutes,1,600)&&h.completeness!=='PARTIAL'),strength=unique.filter(h=>upper(h.sport)==='STRENGTH');
 const weeks=Math.max(1,Math.min(4,number(capabilities?.historyWeeks,1,520)?capabilities.historyWeeks:4));
 const runDays=new Set(runs.map(r=>r.startedAt.slice(0,10)));
 return {activities:unique.length,duplicatesRemoved:rows.length-unique.length,weeksCovered:weeks,run:runs.length?{daysPerWeek:Math.round(runDays.size/weeks*10)/10,minutesPerWeek:Math.round(runs.reduce((n,r)=>n+r.durationMinutes,0)/weeks),longestMinutes:Math.max(...runs.map(r=>r.durationMinutes))}:null,strengthSessions:strength.length,strengthExerciseRecords:strength.flatMap(s=>Array.isArray(s.exercises)?s.exercises.map(e=>({...clone(e),observedAt:s.startedAt,source:s.provider??'WEARABLE'})):[]),partialActivities:rows.filter(h=>h.completeness==='PARTIAL').length};
}
/** Canonical intake deliberately has no required static priority, known dose or perfect history. */
export function canonicalizeIntake(input){
 const source=clone(input??{}),a=source.athlete??source.onboarding??{},s=source.schedule??a.schedule??{},errors=[],missing=[],uncertainty=[],negotiation=[];
 if(source.version!==INTAKE_VERSION||source.synthetic!==true||source.purpose!=='SHADOW_REFERENCE')errors.push('offlineSyntheticContract');
 const asOf=typeof source.asOf==='string'?source.asOf.slice(0,10):null,startDate=source.startDate;
 if(!isoDay(asOf)||!isoDay(startDate)||startDate<asOf)errors.push('asOf/startDate');
 const weeks=source.weeks??12;if(![4,8,12,16].includes(weeks))errors.push('weeks.4/8/12/16');
 if(source.timezoneOffsetMinutes!==undefined&&!(Number.isInteger(source.timezoneOffsetMinutes)&&Math.abs(source.timezoneOffsetMinutes)<=14*60))errors.push('timezoneOffsetMinutes');
 if(!present(a.id))missing.push('athlete.id');
 let scope=null;
 if(present(a.ageYears)&&!number(a.ageYears,18,80))scope='POPULATION_OUTSIDE_V1_AGE_RANGE';
 if(a.ageEligible!==true&&a.ageEligibilitySatisfied!==true&&!number(a.ageYears,18,80)&&!scope)missing.push('athlete.ageEligibility');
 const special=(Array.isArray(a.specialPopulation)?a.specialPopulation:a.specialPopulation==null?[]:[a.specialPopulation]).map(upper);if(special.some(x=>['PREGNANCY','POSTPARTUM','ELITE','ADOLESCENT'].includes(x)))scope='SPECIAL_POPULATION_OUTSIDE_V1';
 const el=eligibility(a,asOf);
 if(el.status==='UNASSESSED'){missing.push('athlete.eligibility.currentNonclinicalAssessment');uncertainty.push(unknown('eligibility','ASK_REQUIRED','Unknown limitation is not clearance and not illness; ask the current limitation question'));}
 if(el.status==='CLINICAL')uncertainty.push(unknown('eligibility','CLINICAL_OUT_OF_SCOPE','Pain, injury, illness or functional limitation routes to qualified human assessment; no substitute training dose'));
 const goals=a.goals&&typeof a.goals==='object'?a.goals:{},rawRun=goals.run??a.runGoal,rawStrength=goals.strength??a.strengthGoal;
 // A goal is a word or an object with a kind (a run goal may carry only its event); anything else is malformed, never "no goal" (QRE-R6-12).
 const goalShape=(v,eventAllowed)=>v===undefined||v===null||typeof v==='string'||typeof v==='object'&&!Array.isArray(v)&&(typeof v.kind==='string'||eventAllowed&&v.kind===undefined&&!!v.event&&typeof v.event==='object');
 if(!goalShape(rawRun,true))errors.push('goals.run.type');if(!goalShape(rawStrength,false))errors.push('goals.strength.type');
 const runKindRaw=upper(typeof rawRun==='string'?rawRun:rawRun?.kind),strengthKindRaw=upper(typeof rawStrength==='string'?rawStrength:rawStrength?.kind);
 const runGoal={kind:RUN_GOALS[runKindRaw]??null,raw:runKindRaw},strengthGoal={kind:STRENGTH_GOALS[strengthKindRaw]??null,raw:strengthKindRaw};
 if(runKindRaw&&!runGoal.kind)errors.push('goals.run.vocabulary');if(strengthKindRaw&&!strengthGoal.kind)errors.push('goals.strength.vocabulary');
 if(!runGoal.kind&&!strengthGoal.kind)missing.push('athlete.goals');
 if(!runGoal.kind&&strengthGoal.kind)runGoal.kind='NONE',uncertainty.push(unknown('goals.run','SAFE_CONSERVATIVE_ESTABLISHMENT','No running goal supplied; running is not programmed without chosen run days'));
 if(!strengthGoal.kind&&runGoal.kind)strengthGoal.kind='NONE',uncertainty.push(unknown('goals.strength','SAFE_CONSERVATIVE_ESTABLISHMENT','No strength goal supplied; strength is not programmed without chosen strength days'));
 let event=clone(a.event??(rawRun&&typeof rawRun==='object'?rawRun.event:undefined)??goals.event??source.event??null),contextEvent=null;
 if(typeof event==='string')event={kind:event};
 else if(event!==null&&(typeof event!=='object'||Array.isArray(event))){errors.push('event.object');event=null;}
 if(!event&&['10K','HALF_MARATHON','RACE_10K','RACE_HALF_MARATHON'].includes(runKindRaw))event={kind:runKindRaw};
 if(event){
  event.kind=EVENTS[upper(event.kind??event.distance)]??upper(event.kind??event.distance);
  event.date=event.date??event.eventDate??rawRun?.eventDate??null;
  event.timeGoalMinutes=number(event.timeGoalMinutes,10,400)?event.timeGoalMinutes:null;
  // B0-C10 (LATER.EVENT.5K): a 5K has no event recipe in V1; the athlete gets a performance plan without event phases, the race kept as context.
  if(event.kind==='5K'&&allowsCandidate(DEFAULT_REPERTOIRE,'B0-C10')){contextEvent={kind:'5K',date:isoDay(event.date)?event.date:null,timeGoalMinutes:event.timeGoalMinutes};event=null;runGoal.kind='PERFORMANCE';uncertainty.push(unknown('event.kind','SAFE_CONSERVATIVE_ESTABLISHMENT','A 5K has no event recipe in V1: a performance plan without specific, taper or race-week phases; the race date and any time goal are context only'));}
  else{
  if(['MARATHON','ULTRA'].includes(event.kind))scope=scope??'EVENT_DISTANCE_OUTSIDE_V1';
  else if(!['10K','HALF_MARATHON'].includes(event.kind))errors.push('event.supported10KOrHalfMarathon');
  if(!present(event.date))missing.push('athlete.event.date');
  else if(!isoDay(event.date)||!isoDay(startDate)||dayGap(startDate,event.date)<7||dayGap(startDate,event.date)>=weeks*7)errors.push('event.withinHorizonAndNotImmediate');
  runGoal.kind='RACE';
  }
 }else if(runGoal.kind==='RACE')missing.push('athlete.event');
 const runExperience=EXPERIENCE[upper(a.runExperience)]??null,strengthExperience=EXPERIENCE[upper(a.strengthExperience??a.strengthTrainingAge)]??null;
 if(!runExperience&&runGoal.kind!=='NONE')uncertainty.push(unknown('runExperience','SAFE_CONSERVATIVE_ESTABLISHMENT','Treated as novice for establishment; first observed sessions update the estimate'));
 if(!strengthExperience&&strengthGoal.kind!=='NONE')uncertainty.push(unknown('strengthExperience','SAFE_CONSERVATIVE_ESTABLISHMENT','Treated as novice for movement practice and effort-guided load selection'));
 const runDays=runGoal.kind==='NONE'&&s.runDays===undefined?[]:days(s.runDays??a.runDays,'schedule.runDays',missing,errors);
 const strengthDays=strengthGoal.kind==='NONE'&&s.strengthDays===undefined?[]:days(s.strengthDays??a.strengthDays,'schedule.strengthDays',missing,errors);
 if(runGoal.kind!=='NONE'&&Array.isArray(s.runDays??a.runDays)&&runDays.length===0)missing.push('schedule.runDays.atLeastOneForRunGoal');
 if(strengthGoal.kind!=='NONE'&&Array.isArray(s.strengthDays??a.strengthDays)&&strengthDays.length===0)missing.push('schedule.strengthDays.atLeastOneForStrengthGoal');
 const turn=v=>['AM','PM'].includes(upper(v))?upper(v):null;
 const runTurn=turn(s.runTurn??a.runTurn),strengthTurn=turn(s.strengthTurn??a.strengthTurn);
 const shared=runDays.filter(d=>strengthDays.includes(d));
 if(shared.length&&(!runTurn||!strengthTurn))negotiation.push({id:'SHARED_DAY_TURN_UNKNOWN',days:shared,blocking:false,question:'Which shift for each sport on shared days?',defaultApplied:'Treat as one shift with back-to-back order proposed; confirmation required'});
 const minutes=(v,name)=>{if(!present(v))return null;if(!number(v,10,240)){errors.push(name);return null;}return v;};
 const runMinutes=minutes(s.runMinutes??s.runSessionMinutes,'schedule.runMinutes'),strengthMinutes=minutes(s.strengthMinutes??s.strengthSessionMinutes,'schedule.strengthMinutes'),longRunMinutes=minutes(s.longRunMinutes,'schedule.longRunMinutes');
 if(runDays.length&&runMinutes===null)missing.push('schedule.runMinutes');
 if(strengthDays.length&&strengthMinutes===null)missing.push('schedule.strengthMinutes');
 let longRunDay=s.longRunDay??a.preferredLongRunDay??null;
 if(longRunDay!==null&&!runDays.includes(longRunDay))errors.push('schedule.longRunDay.mustBeChosenRunDay');
 if(longRunDay===null&&runDays.length>=2&&['RACE','PERFORMANCE','REGULAR','GENERAL'].includes(runGoal.kind)){longRunDay=runDays.at(-1);uncertainty.push(unknown('schedule.longRunDay','SAFE_CONSERVATIVE_ESTABLISHMENT','Longer easy run placed on the last chosen run day of the week; the athlete can move it',{defaultApplied:longRunDay}));}
 const recent=a.recent??{};
 const rn=(v,max,name)=>{if(!present(v))return null;if(!number(v,0,max)){errors.push(name);return null;}return v;};
 const recentSelf={runDaysPerWeek:rn(recent.runDaysPerWeek??a.recentRunFrequency??a.recentRunDaysPerWeek,7,'recent.runDaysPerWeek'),runMinutesPerWeek:rn(recent.runMinutesPerWeek??a.recentRunMinutes,1500,'recent.runMinutesPerWeek'),longestRunMinutes:rn(recent.longestRunMinutes??a.recentLongRunMinutes,300,'recent.longestRunMinutes'),strengthDaysPerWeek:rn(recent.strengthDaysPerWeek??a.recentStrengthFrequency,7,'recent.strengthDaysPerWeek')};
 const wearable={activityAvailable:false,heartRateAvailable:false,exerciseIdentityAvailable:false,setsRepsLoadAvailable:false,subjectiveEffortAvailable:false,completeness:'NONE',provider:null,...clone(source.wearableCapabilities??a.wearableCapabilities??a.wearable??{})};
 const summary=historySummary(source.history??a.history,asOf,wearable);
 const recentRun={...recentSelf,basis:'SELF_REPORT'};
 if(summary.run){
  // Disagreement keeps the lower current exposure; a partial history never raises self-report.
  const conservative=(self,wear)=>self===null?wear:Math.min(self,wear);
  if(wearable.completeness==='FULL'||recentSelf.runMinutesPerWeek===null){recentRun.runDaysPerWeek=conservative(recentSelf.runDaysPerWeek,summary.run.daysPerWeek);recentRun.runMinutesPerWeek=conservative(recentSelf.runMinutesPerWeek,summary.run.minutesPerWeek);recentRun.longestRunMinutes=conservative(recentSelf.longestRunMinutes,summary.run.longestMinutes);recentRun.basis=recentSelf.runMinutesPerWeek===null?'WEARABLE_'+(wearable.completeness==='FULL'?'FULL':'PARTIAL'):'SELF_REPORT_AND_WEARABLE_CONSERVATIVE';}
  if(recentSelf.runMinutesPerWeek!==null&&Math.abs(recentSelf.runMinutesPerWeek-summary.run.minutesPerWeek)>Math.max(30,0.3*recentSelf.runMinutesPerWeek))uncertainty.push(unknown('recent.runMinutesPerWeek','LEARN_DURING_FIRST_SESSIONS','Self-report and wearable history disagree; the lower current exposure is used until observed sessions resolve it'));
 }
 if(wearable.activityAvailable&&!wearable.subjectiveEffortAvailable)uncertainty.push(unknown('wearable.subjectiveEffort','LEARN_DURING_FIRST_SESSIONS','Activity duration may arrive without effort; request optional effort after execution and never infer effort from heart-rate absence'));
 if(wearable.activityAvailable&&wearable.completeness==='PARTIAL')uncertainty.push(unknown('wearable.history','LEARN_DURING_FIRST_SESSIONS','Partial wearable history informs exposure as a lower bound only'));
 // Where a record came from (the athlete's own list or an external history), whatever its label (R7-A).
 const origin=new Map(),ownCount=(Array.isArray(a.knownExercises)?a.knownExercises:Array.isArray(a.knownLoads)?a.knownLoads:[]).length;
 const knownExercises=[...(Array.isArray(a.knownExercises)?a.knownExercises:Array.isArray(a.knownLoads)?a.knownLoads:[]),...(wearable.setsRepsLoadAvailable&&wearable.exerciseIdentityAvailable?summary.strengthExerciseRecords.filter(r=>catalogueEntry(r.id)).map(r=>({id:r.id,pattern:catalogueEntry(r.id).pattern,equipment:catalogueEntry(r.id).equipment,sets:r.sets,reps:r.reps,load:number(r.loadKg,0,500)?{value:r.loadKg,unit:'KG',convention:catalogueEntry(r.id).convention}:null,rir:number(r.rir,0,8)?r.rir:null,current:true,familiar:true,tolerated:r.completeness!=='PARTIAL',observedAt:r.observedAt.slice(0,10),source:r.source})):[])].map((e,i)=>{const k=knownExercise(e,asOf,errors);if(k)origin.set(k,i<ownCount?'ATHLETE':'EXTERNAL');return k;}).filter(Boolean);
 // One record per exercise whatever the order or source of the records (R7-A): a record without a complete current dose never displaces
 // one with it; between complete doses the latest observation leads and, on the same date, the athlete's own report. Complete doses
 // that disagree are disclosed and resolved by the first observed sessions.
 // Observation instants compare as instants; a date-only record counts from the latest instant of its day, as observations do. A source
 // label never decides: the last tie is what the record says, the label only between records that say the same.
 const own=e=>origin.get(e)==='ATHLETE',at=e=>{const v=typeof e.observedAt==='string'?e.observedAt:null,t=v?Date.parse(v.length===10?v+'T23:59:59Z':v):NaN;return Number.isFinite(t)?t:-Infinity;},said=e=>{const {source:_s,...rest}=e;return hash(rest);};
 const lead=(a,b)=>!!a.dose!==!!b.dose?(a.dose?a:b):at(a)!==at(b)?(at(a)>at(b)?a:b):own(a)!==own(b)?(own(a)?a:b):said(a)!==said(b)?(said(a)<said(b)?a:b):hash(a)<=hash(b)?a:b;
 const byExercise=new Map(),disagree=new Set();
 for(const e of knownExercises){const x=byExercise.get(e.id);if(x?.dose&&e.dose&&hash(x.dose)!==hash(e.dose))disagree.add(e.id);if(!x){byExercise.set(e.id,e);continue;}const l=lead(x,e),other=l===x?e:x,kept=l.loadHint||!other.loadHint?l:{...l,loadHint:clone(other.loadHint)};origin.set(kept,origin.get(l));byExercise.set(e.id,kept);}
 const dedupedExercises=[...byExercise.values()];
 for(const id of disagree)uncertainty.push(unknown('knownExercises.'+id,'LEARN_DURING_FIRST_SESSIONS','Two current records of this exercise disagree; the latest one is used and the first logged sessions confirm or replace it'));
 const knownRuns=(Array.isArray(a.knownRuns)?a.knownRuns:[]).filter(t=>t?.prescription?.modality==='RUN').map(t=>plausibleRunTask(t.prescription)?{...clone(t),current:currentFamiliar(t,asOf)}:{...clone(t),current:false,implausible:true});
 if(knownRuns.some(t=>t.implausible))uncertainty.push(unknown('knownRuns','LEARN_DURING_FIRST_SESSIONS','A reported familiar quality task does not add up (work, recovery and duration); it is kept as history and does not start the quality ladder'));
 const equipment=clone(a.equipment??s.equipment??['BODYWEIGHT']);
 if(!Array.isArray(equipment)||equipment.some(e=>typeof e!=='string'))errors.push('athlete.equipment');
 if(recentRun.runMinutesPerWeek===null&&runGoal.kind!=='NONE')uncertainty.push(unknown('recent.runMinutesPerWeek','SAFE_CONSERVATIVE_ESTABLISHMENT','Conservative run establishment week; missing exposure is not poor tolerance'));
 if(recentSelf.strengthDaysPerWeek===null&&strengthGoal.kind!=='NONE')uncertainty.push(unknown('recent.strengthDaysPerWeek','LEARN_DURING_FIRST_SESSIONS','Initial frequency follows chosen days with low first-week volume'));
 if(!dedupedExercises.some(e=>e.dose)&&strengthGoal.kind!=='NONE'&&strengthDays.length)uncertainty.push(unknown('knownExercises.load','SAFE_CONSERVATIVE_ESTABLISHMENT','Effort-guided load establishment in the first exposure; no sex-, body-size- or cross-exercise load'));
 if(event&&recentRun.longestRunMinutes===null)uncertainty.push(unknown('recent.longestRunMinutes','LEARN_DURING_FIRST_SESSIONS','Long-run start follows current easy exposure; event trajectory stays conditional'));
 if(event?.timeGoalMinutes)uncertainty.push(unknown('event.timeGoalMinutes','SAFE_CONSERVATIVE_ESTABLISHMENT','Time goal is context only; training intensity comes from current effort anchors, never from the goal time'));
 if(a.pause!==undefined&&a.pause!==null&&(typeof a.pause!=='object'||Array.isArray(a.pause)))errors.push('athlete.pause.object');
 const P=a.pause&&typeof a.pause==='object'&&!Array.isArray(a.pause)?a.pause:null;
 // A pause length that is not a number is asked, never read as no pause; any length of four weeks or more restarts (QRE-R6-12).
 const pause=P?{nonclinical:P.nonclinical===true,weeks:typeof P.weeks==='number'&&Number.isFinite(P.weeks)&&P.weeks>=0?P.weeks:null,reason:P.reason??null,reasonCategory:P.reasonCategory??null,screen:screenInterruptionReason({reason:P.reason,reasonCategory:P.reasonCategory,nonclinical:P.nonclinical??null,clinicalReason:P.clinicalReason??null})}:null;
 // Any clinical pause reason routes to a human regardless of flags; an unclear or missing reason is asked.
 if(pause?.screen.status==='CLINICAL')uncertainty.push(unknown('pause.reason','CLINICAL_OUT_OF_SCOPE','The pause reason is clinical or possibly clinical; qualified assessment, no nonclinical restart',{matched:pause.screen.matched}));
 if(pause?.screen.status==='ASK'){uncertainty.push(unknown('pause.reason','ASK_REQUIRED','Say what interrupted training (travel, work, family, illness, injury...) before a nonclinical restart'));missing.push('athlete.pause.reasonCategory');}
 if(pause&&pause.screen.status!=='CLINICAL'&&pause.weeks===null){uncertainty.push(unknown('pause.weeks','ASK_REQUIRED','How many weeks the pause lasted decides whether training restarts from current capacity'));missing.push('athlete.pause.weeks');}
 const prefs=a.strengthPreferences&&typeof a.strengthPreferences==='object'?a.strengthPreferences:{},listOf=(v,name)=>{if(v===undefined||v===null)return [];if(Array.isArray(v))return v;errors.push(name);return [];};
 const emphasis=listOf(prefs.emphasis??a.strengthDevelopmentPreferences,'strengthPreferences.emphasis'),movementPriorities=listOf(prefs.movementPriorities??a.movementPriorities,'strengthPreferences.movementPriorities');
 const rotation=ROTATIONS.includes(upper(a.exerciseRotationPreference??prefs.rotation))?upper(a.exerciseRotationPreference??prefs.rotation):'COACH_DECIDES';
 const temporaryPreference=['RUN','STRENGTH'].includes(String(upper(s.temporaryPreference??s.temporaryOrderPreference)??'').replace('_FIRST',''))?String(upper(s.temporaryPreference??s.temporaryOrderPreference)).replace('_FIRST',''):null;
 const canonical={version:'R6-CANONICAL-INTAKE-1',asOf,startDate,weeks,learningConsent:source.learningConsent===true,timezoneOffsetMinutes:source.timezoneOffsetMinutes??0,
  athlete:{id:a.id??null,ageEligible:!missing.includes('athlete.ageEligibility')&&!scope,eligibility:el,runExperience:runExperience??'NOVICE',strengthExperience:strengthExperience??'NOVICE',experienceDeclared:{run:runExperience!==null,strength:strengthExperience!==null},recentRun,recentStrength:{daysPerWeek:recentSelf.strengthDaysPerWeek},historySummary:summary,knownExercises:dedupedExercises,knownRuns,performanceAnchors:clone(a.performanceAnchors??[]),equipment:Array.isArray(equipment)?[...new Set(equipment.map(upper))]:[],strengthPreferences:{emphasis:emphasis.map(upper),movementPriorities:movementPriorities.map(upper),rotation},profileContext:{sex:a.sex??a.profileContext?.sex??null,heightCm:a.heightCm??a.profileContext?.heightCm??null,weightKg:a.weightKg??a.profileContext?.weightKg??null,doseConsumer:false},wearable,pause},
  goals:{run:runGoal,strength:strengthGoal,event,...(contextEvent?{contextEvent}:{})},
  schedule:{runDays,strengthDays,runTurn,strengthTurn,runMinutes,strengthMinutes,longRunMinutes:longRunMinutes??runMinutes,longRunDay,sharedDays:shared,sameTurnConfirmed:s.sameTurnConfirmed===true,temporaryPreference},
  officialPlanState:clone(source.officialPlanState??null),completedWork:clone(source.completedWork??[]),uncertainty,negotiation};
 canonical.hash=hash(canonical);
 const clinical=el.status==='CLINICAL'||pause?.screen.status==='CLINICAL';
 const status=clinical?'CLINICAL_HUMAN_REQUIRED':scope?'UNSUPPORTED':errors.length?'INVALID_INPUT':missing.length?'ASK':'CANONICAL';
 return freeze({valid:status==='CANONICAL',status,scope,canonical,errors:[...new Set(errors)],missing:[...new Set(missing)],uncertainty,negotiation,clinical});
}
