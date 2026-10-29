import {clone,freeze,hash} from './value.mjs';
import {catalogueEntry} from './r6-catalogue.mjs';
import {screenInterruptionReason} from './r6-clinical.mjs';

export const INTAKE_VERSION='R6-INTAKE-1';
export const isoDay=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export const onDate=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10);
export const dayGap=(start,end)=>(Date.parse(end.slice(0,10)+'T00:00:00Z')-Date.parse(start.slice(0,10)+'T00:00:00Z'))/86400000;
const number=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
const present=v=>v!==undefined&&v!==null&&v!=='';
const upper=v=>typeof v==='string'?v.trim().toUpperCase().replace(/[\s-]+/g,'_'):null;
const RUN_GOALS={RACE:'RACE',EVENT:'RACE','10K':'RACE',RACE_10K:'RACE',HALF_MARATHON:'RACE',RACE_HALF_MARATHON:'RACE',PERFORMANCE:'PERFORMANCE',IMPROVE:'PERFORMANCE',RUN_FASTER:'PERFORMANCE',REGULAR:'REGULAR',RUN_REGULARLY:'REGULAR',CONSISTENCY:'REGULAR',GENERAL:'GENERAL',GENERAL_FITNESS:'GENERAL',HEALTH:'GENERAL',NONE:'NONE'};
const STRENGTH_GOALS={STRENGTH:'STRENGTH',GET_STRONGER:'STRENGTH',HYPERTROPHY:'HYPERTROPHY',MUSCLE:'HYPERTROPHY',BUILD_MUSCLE:'HYPERTROPHY',RUNNING_SUPPORT:'RUNNING_SUPPORT',RUN_BETTER:'RUNNING_SUPPORT',FORCA_PARA_CORRER:'RUNNING_SUPPORT',MAINTAIN:'MAINTAIN',MAINTENANCE:'MAINTAIN',GENERAL:'GENERAL',GENERAL_FITNESS:'GENERAL',HEALTH:'GENERAL',NONE:'NONE'};
const EXPERIENCE={NONE:'NONE',NEVER:'NONE',NOVICE:'NOVICE',BEGINNER:'NOVICE',INTERMEDIATE:'INTERMEDIATE',REGULAR:'INTERMEDIATE',EXPERIENCED:'EXPERIENCED',ADVANCED:'EXPERIENCED'};
const EVENTS={'10K':'10K','10_K':'10K',RACE_10K:'10K',HALF_MARATHON:'HALF_MARATHON',HALF:'HALF_MARATHON',RACE_HALF_MARATHON:'HALF_MARATHON','21K':'HALF_MARATHON',MARATHON:'MARATHON','42K':'MARATHON','5K':'5K',ULTRA:'ULTRA'};
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
 const clinical=CLINICAL_KEYS.some(k=>e[k]===true)||['CLINICAL','CLINICAL_HUMAN_REQUIRED','INJURED','ILL','PAIN_OR_INJURY'].includes(upper(e.status))||limitation==='PAIN_OR_INJURY'||a.clinicalConcern===true;
 const declared=['NONCLINICAL_CONFIRMED','ELIGIBLE_NONCLINICAL'].includes(upper(e.status))||e.nonclinicalConfirmed===true||['NONE','PAUSE_NONCLINICAL'].includes(limitation);
 const date=(e.assessedAt??asOf)?.slice?.(0,10);
 const current=isoDay(date)&&isoDay(asOf)&&dayGap(date,asOf)>=0&&dayGap(date,asOf)<=14;
 const flagsKnown=CLINICAL_KEYS.every(k=>typeof e[k]==='boolean')||['NONE','PAUSE_NONCLINICAL'].includes(limitation);
 return {status:clinical?'CLINICAL':declared&&current&&flagsKnown?'NONCLINICAL_CONFIRMED':'UNASSESSED',assessedAt:isoDay(date)?date:null,limitation,flags:Object.fromEntries(CLINICAL_KEYS.map(k=>[k,typeof e[k]==='boolean'?e[k]:null]))};
}
const currentFamiliar=(t,asOf)=>t&&t.current===true&&t.familiar===true&&t.tolerated===true&&isoDay(t.observedAt?.slice?.(0,10))&&dayGap(t.observedAt.slice(0,10),asOf)>=0&&dayGap(t.observedAt.slice(0,10),asOf)<=28;
function knownExercise(e,asOf,errors){
 if(!e||typeof e!=='object'||!present(e.id)){errors.push('knownExercises.id');return null;}
 const entry=catalogueEntry(e.id),pattern=upper(e.pattern)??entry?.pattern??null;
 const load=typeof e.load==='number'?{value:e.load,unit:'KG',convention:e.convention??entry?.convention??'TOTAL'}:clone(e.load??null);
 const loadComplete=!!load&&number(load.value,0,500)&&['KG','LB','BODYWEIGHT'].includes(load.unit)&&['TOTAL','PER_HAND','BODYWEIGHT','MACHINE_STACK'].includes(load.convention);
 const doseComplete=loadComplete&&Number.isInteger(e.sets)&&e.sets>=1&&e.sets<=10&&Number.isInteger(e.reps)&&e.reps>=1&&e.reps<=30&&number(e.rir,0,8);
 return {id:e.id,pattern,equipment:clone(e.equipment??entry?.equipment??[]),familiar:e.familiar!==false,current:currentFamiliar({...e,familiar:e.familiar!==false},asOf),observedAt:e.observedAt??null,dose:doseComplete&&currentFamiliar({...e,familiar:e.familiar!==false},asOf)?{sets:e.sets,reps:e.reps,rir:e.rir,load:clone(load),restSeconds:e.restSeconds??null}:null,loadHint:loadComplete?clone(load):null,source:e.source??'SELF_REPORT'};
}
/** Wearable activity history is evidence with provenance, never a replacement for current eligibility. */
function historySummary(history,asOf,capabilities){
 const rows=(Array.isArray(history)?history:[]).filter(h=>h&&typeof h.startedAt==='string'&&Number.isFinite(Date.parse(h.startedAt))&&dayGap(h.startedAt.slice(0,10),asOf)>0&&dayGap(h.startedAt.slice(0,10),asOf)<=28);
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
 const special=(a.specialPopulation??[]).map(upper);if(special.some(x=>['PREGNANCY','POSTPARTUM','ELITE','ADOLESCENT'].includes(x)))scope='SPECIAL_POPULATION_OUTSIDE_V1';
 const el=eligibility(a,asOf);
 if(el.status==='UNASSESSED'){missing.push('athlete.eligibility.currentNonclinicalAssessment');uncertainty.push(unknown('eligibility','ASK_REQUIRED','Unknown limitation is not clearance and not illness; ask the current limitation question'));}
 if(el.status==='CLINICAL')uncertainty.push(unknown('eligibility','CLINICAL_OUT_OF_SCOPE','Pain, injury, illness or functional limitation routes to qualified human assessment; no substitute training dose'));
 const goals=a.goals??{},rawRun=goals.run??a.runGoal,rawStrength=goals.strength??a.strengthGoal;
 const runKindRaw=upper(typeof rawRun==='string'?rawRun:rawRun?.kind),strengthKindRaw=upper(typeof rawStrength==='string'?rawStrength:rawStrength?.kind);
 const runGoal={kind:RUN_GOALS[runKindRaw]??null,raw:runKindRaw},strengthGoal={kind:STRENGTH_GOALS[strengthKindRaw]??null,raw:strengthKindRaw};
 if(runKindRaw&&!runGoal.kind)errors.push('goals.run.vocabulary');if(strengthKindRaw&&!strengthGoal.kind)errors.push('goals.strength.vocabulary');
 if(!runGoal.kind&&!strengthGoal.kind)missing.push('athlete.goals');
 if(!runGoal.kind&&strengthGoal.kind)runGoal.kind='NONE',uncertainty.push(unknown('goals.run','SAFE_CONSERVATIVE_ESTABLISHMENT','No running goal supplied; running is not programmed without chosen run days'));
 if(!strengthGoal.kind&&runGoal.kind)strengthGoal.kind='NONE',uncertainty.push(unknown('goals.strength','SAFE_CONSERVATIVE_ESTABLISHMENT','No strength goal supplied; strength is not programmed without chosen strength days'));
 let event=clone(a.event??rawRun?.event??goals.event??source.event??null);
 if(!event&&['10K','HALF_MARATHON','RACE_10K','RACE_HALF_MARATHON'].includes(runKindRaw))event={kind:runKindRaw};
 if(event){
  event.kind=EVENTS[upper(event.kind??event.distance)]??upper(event.kind??event.distance);
  event.date=event.date??event.eventDate??rawRun?.eventDate??null;
  event.timeGoalMinutes=number(event.timeGoalMinutes,10,400)?event.timeGoalMinutes:null;
  if(['MARATHON','ULTRA'].includes(event.kind))scope=scope??'EVENT_DISTANCE_OUTSIDE_V1';
  else if(!['10K','HALF_MARATHON'].includes(event.kind))errors.push('event.supported10KOrHalfMarathon');
  if(!present(event.date))missing.push('athlete.event.date');
  else if(!isoDay(event.date)||!isoDay(startDate)||dayGap(startDate,event.date)<7||dayGap(startDate,event.date)>=weeks*7)errors.push('event.withinHorizonAndNotImmediate');
  runGoal.kind='RACE';
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
 const knownExercises=[...(Array.isArray(a.knownExercises)?a.knownExercises:Array.isArray(a.knownLoads)?a.knownLoads:[]),...(wearable.setsRepsLoadAvailable&&wearable.exerciseIdentityAvailable?summary.strengthExerciseRecords.filter(r=>catalogueEntry(r.id)).map(r=>({id:r.id,pattern:catalogueEntry(r.id).pattern,equipment:catalogueEntry(r.id).equipment,sets:r.sets,reps:r.reps,load:number(r.loadKg,0,500)?{value:r.loadKg,unit:'KG',convention:catalogueEntry(r.id).convention}:null,rir:number(r.rir,0,8)?r.rir:null,current:true,familiar:true,tolerated:r.completeness!=='PARTIAL',observedAt:r.observedAt.slice(0,10),source:r.source})):[])].map(e=>knownExercise(e,asOf,errors)).filter(Boolean);
 const dedupedExercises=[...new Map(knownExercises.map(e=>[e.id,e])).values()];
 const knownRuns=(Array.isArray(a.knownRuns)?a.knownRuns:[]).filter(t=>t?.prescription?.modality==='RUN').map(t=>({...clone(t),current:currentFamiliar(t,asOf)}));
 const equipment=clone(a.equipment??s.equipment??['BODYWEIGHT']);
 if(!Array.isArray(equipment)||equipment.some(e=>typeof e!=='string'))errors.push('athlete.equipment');
 if(recentRun.runMinutesPerWeek===null&&runGoal.kind!=='NONE')uncertainty.push(unknown('recent.runMinutesPerWeek','SAFE_CONSERVATIVE_ESTABLISHMENT','Conservative run establishment week; missing exposure is not poor tolerance'));
 if(recentSelf.strengthDaysPerWeek===null&&strengthGoal.kind!=='NONE')uncertainty.push(unknown('recent.strengthDaysPerWeek','LEARN_DURING_FIRST_SESSIONS','Initial frequency follows chosen days with low first-week volume'));
 if(!dedupedExercises.some(e=>e.dose)&&strengthGoal.kind!=='NONE'&&strengthDays.length)uncertainty.push(unknown('knownExercises.load','SAFE_CONSERVATIVE_ESTABLISHMENT','Effort-guided load establishment in the first exposure; no sex-, body-size- or cross-exercise load'));
 if(event&&recentRun.longestRunMinutes===null)uncertainty.push(unknown('recent.longestRunMinutes','LEARN_DURING_FIRST_SESSIONS','Long-run start follows current easy exposure; event trajectory stays conditional'));
 if(event?.timeGoalMinutes)uncertainty.push(unknown('event.timeGoalMinutes','SAFE_CONSERVATIVE_ESTABLISHMENT','Time goal is context only; training intensity comes from current effort anchors, never from the goal time'));
 const pause=a.pause?{nonclinical:a.pause.nonclinical===true,weeks:number(a.pause.weeks,0,104)?a.pause.weeks:null,reason:a.pause.reason??null,reasonCategory:a.pause.reasonCategory??null,screen:screenInterruptionReason({reason:a.pause.reason,reasonCategory:a.pause.reasonCategory,nonclinical:a.pause.nonclinical??null,clinicalReason:a.pause.clinicalReason??null})}:null;
 // Any clinical pause reason routes to a human regardless of flags; an unclear or missing reason is asked.
 if(pause?.screen.status==='CLINICAL')uncertainty.push(unknown('pause.reason','CLINICAL_OUT_OF_SCOPE','The pause reason is clinical or possibly clinical; qualified assessment, no nonclinical restart',{matched:pause.screen.matched}));
 if(pause?.screen.status==='ASK'){uncertainty.push(unknown('pause.reason','ASK_REQUIRED','Say what interrupted training (travel, work, family, illness, injury...) before a nonclinical restart'));missing.push('athlete.pause.reasonCategory');}
 const rotation=ROTATIONS.includes(upper(a.exerciseRotationPreference??a.strengthPreferences?.rotation))?upper(a.exerciseRotationPreference??a.strengthPreferences?.rotation):'COACH_DECIDES';
 const temporaryPreference=['RUN','STRENGTH'].includes(String(upper(s.temporaryPreference??s.temporaryOrderPreference)??'').replace('_FIRST',''))?String(upper(s.temporaryPreference??s.temporaryOrderPreference)).replace('_FIRST',''):null;
 const canonical={version:'R6-CANONICAL-INTAKE-1',asOf,startDate,weeks,learningConsent:source.learningConsent===true,timezoneOffsetMinutes:source.timezoneOffsetMinutes??0,
  athlete:{id:a.id??null,ageEligible:!missing.includes('athlete.ageEligibility')&&!scope,eligibility:el,runExperience:runExperience??'NOVICE',strengthExperience:strengthExperience??'NOVICE',experienceDeclared:{run:runExperience!==null,strength:strengthExperience!==null},recentRun,recentStrength:{daysPerWeek:recentSelf.strengthDaysPerWeek},historySummary:summary,knownExercises:dedupedExercises,knownRuns,performanceAnchors:clone(a.performanceAnchors??[]),equipment:Array.isArray(equipment)?[...new Set(equipment.map(upper))]:[],strengthPreferences:{emphasis:(a.strengthPreferences?.emphasis??a.strengthDevelopmentPreferences??[]).map(upper),movementPriorities:(a.strengthPreferences?.movementPriorities??a.movementPriorities??[]).map(upper),rotation},profileContext:{sex:a.sex??a.profileContext?.sex??null,heightCm:a.heightCm??a.profileContext?.heightCm??null,weightKg:a.weightKg??a.profileContext?.weightKg??null,doseConsumer:false},wearable,pause},
  goals:{run:runGoal,strength:strengthGoal,event},
  schedule:{runDays,strengthDays,runTurn,strengthTurn,runMinutes,strengthMinutes,longRunMinutes:longRunMinutes??runMinutes,longRunDay,sharedDays:shared,sameTurnConfirmed:s.sameTurnConfirmed===true,temporaryPreference},
  officialPlanState:clone(source.officialPlanState??null),completedWork:clone(source.completedWork??[]),uncertainty,negotiation};
 canonical.hash=hash(canonical);
 const clinical=el.status==='CLINICAL'||pause?.screen.status==='CLINICAL';
 const status=clinical?'CLINICAL_HUMAN_REQUIRED':scope?'UNSUPPORTED':errors.length?'INVALID_INPUT':missing.length?'ASK':'CANONICAL';
 return freeze({valid:status==='CANONICAL',status,scope,canonical,errors:[...new Set(errors)],missing:[...new Set(missing)],uncertainty,negotiation,clinical});
}
