import {clone,hash} from './value.mjs';

export const INPUT_VERSION='R5-INPUT-1';
export const families={RUN:['EASY','LONG','CRUISE','FASTER','HILLS','STRIDES','EVENT_SPECIFIC','WALK_JOG'],STRENGTH:['FULL_BODY','LOWER','UPPER','PRACTICE']};
const finite=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
export const dateValid=s=>{
 if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(s)||!Number.isFinite(Date.parse(s)))return false;
 const day=s.slice(0,10),normalized=new Date(Date.parse(day+'T00:00:00Z')).toISOString().slice(0,10);
 return normalized===day;
};
export const daysBetween=(a,b)=>(Date.parse(b)-Date.parse(a))/86400000;
export const onDate=(start,days)=>new Date(Date.parse(start)+days*86400000).toISOString().slice(0,10);
export const prescriptionKey=p=>hash(p);
export const anchorConfigurationHash=anchors=>hash(anchors.map(a=>({id:a.id,prescription:a.prescription})).sort((a,b)=>a.id.localeCompare(b.id)));
export function validateAvailability(availability){
 const errors=[],days=new Set(),ids=new Set();
 if(!Array.isArray(availability)||!availability.length)return ['availability.array'];
 for(const d of availability){
  if(!d||!Number.isInteger(d.day)||!finite(d.day,0,6)||days.has(d.day)||!Array.isArray(d.windows)){errors.push('availability.day/windows');continue;}
  days.add(d.day);
  for(const w of d.windows){
   if(!w||!w.id||ids.has(w.id)||!finite(w.startMinute,0,1439)||!finite(w.durationMinutes,1,240)||w.startMinute+w.durationMinutes>1440||!Array.isArray(w.equipment)||!w.equipment.every(e=>typeof e==='string'))errors.push('availability.window');
   if(w?.id)ids.add(w.id);
  }
  const sorted=d.windows.filter(Boolean).toSorted((a,b)=>a.startMinute-b.startMinute);
  if(sorted.some((w,i)=>i>0&&sorted[i-1].startMinute+sorted[i-1].durationMinutes>w.startMinute))errors.push('availability.overlap');
 }
 return errors;
}
export function validatePrescription(p){
 const errors=[];
 if(!p||!families[p.modality]?.includes(p.family))return ['prescription.modality/family'];
 if(!finite(p.durationMinutes,1,240))errors.push('prescription.durationMinutes');
 if(!Array.isArray(p.equipment)||!p.equipment.every(x=>typeof x==='string'))errors.push('prescription.equipment');
 if(p.modality==='RUN'){
  if(typeof p.effort!=='string'||!p.effort.trim())errors.push('prescription.effort');
  if(!['EASY_CONVERSATIONAL','CONTROLLED_CURRENT','FAMILIAR_FASTER'].includes(p.effortDomain)||(['EASY','LONG','WALK_JOG'].includes(p.family)&&p.effortDomain!=='EASY_CONVERSATIONAL')||/maximal|all.?out|ignore.{0,20}symptom|through.{0,12}pain|exhaustion/i.test(p.effort??''))errors.push('prescription.effortBoundary');
  if(!finite(p.warmupMinutes,0,p.durationMinutes)||!finite(p.cooldownMinutes,0,p.durationMinutes)||p.warmupMinutes+p.cooldownMinutes>p.durationMinutes)errors.push('prescription.preparation');
  if(!['EASY','LONG','WALK_JOG'].includes(p.family)){
   const w=p.work;
   if(p.calibration?.basis!=='CURRENT_TASK'||p.calibration?.current!==true)errors.push('prescription.currentTaskCalibration');
   if(!w||!Number.isInteger(w.repetitions)||!finite(w.repetitions,1,40)||!finite(w.workMinutes,0.1,60)||!finite(w.recoveryMinutes,0,20)||w.repetitions*w.workMinutes+Math.max(0,w.repetitions-1)*w.recoveryMinutes+p.warmupMinutes+p.cooldownMinutes>p.durationMinutes+0.01)errors.push('prescription.executableWork');
  }
 }else{
  if(!Array.isArray(p.exercises)||p.exercises.length===0)errors.push('prescription.exercises');
  for(const e of p.exercises??[]){
   if(!e.id||!e.pattern||!Number.isInteger(e.sets)||!finite(e.sets,1,10)||!Number.isInteger(e.reps)||!finite(e.reps,1,30)||!finite(e.rir,2,8)||!finite(e.restSeconds,30,600)||!finite(e.load?.value,0,500)||!['KG','BODYWEIGHT'].includes(e.load?.unit)||!['TOTAL','PER_HAND','BODYWEIGHT'].includes(e.load?.convention)||!finite(e.preparationMinutes,1,30))errors.push('prescription.exercise');
   if(e.load?.unit==='BODYWEIGHT'&&(e.load.convention!=='BODYWEIGHT'||e.load.value!==0)||e.load?.unit==='KG'&&e.load.convention==='BODYWEIGHT')errors.push('prescription.loadConvention');
  }
  const min=(p.exercises??[]).reduce((n,e)=>n+(e.preparationMinutes??0)+e.sets*e.reps*3/60+Math.max(0,e.sets-1)*e.restSeconds/60,0);
  if(min>p.durationMinutes)errors.push('prescription.timeBudget');
 }
 return errors;
}
export function changedDimensions(a,b){
 const dimensions=[];
 if(a.modality!==b.modality||a.family!==b.family)dimensions.push('TASK');
 if(a.durationMinutes!==b.durationMinutes)dimensions.push('DURATION');
 if(a.effort!==b.effort)dimensions.push('EFFORT');
 if(a.effortDomain!==b.effortDomain)dimensions.push('EFFORT_DOMAIN');
 for(const key of ['repetitions','workMinutes','recoveryMinutes'])if(hash(a.work?.[key]??null)!==hash(b.work?.[key]??null))dimensions.push('WORK_'+key.toUpperCase());
 if(hash(a.calibration??null)!==hash(b.calibration??null))dimensions.push('CALIBRATION');
 if(hash(a.equipment)!==hash(b.equipment))dimensions.push('EQUIPMENT');
 if(a.warmupMinutes!==b.warmupMinutes||a.cooldownMinutes!==b.cooldownMinutes)dimensions.push('PREPARATION');
 if(a.modality==='STRENGTH'){
  if(hash((a.exercises??[]).map(e=>[e.id,e.pattern,e.load.unit,e.load.convention]))!==hash((b.exercises??[]).map(e=>[e.id,e.pattern,e.load.unit,e.load.convention])))dimensions.push('EXERCISE');
  for(const [name,key] of [['LOAD','load'],['REPS','reps'],['SETS','sets'],['RIR','rir'],['REST','restSeconds']])if(hash(a.exercises.map(e=>e[key]))!==hash((b.exercises??[]).map(e=>e[key])))dimensions.push(name);
 }
 return dimensions;
}
export function doseDirection(a,b){
 const dimensions=changedDimensions(a,b);if(dimensions.length!==1)return 'UNSUPPORTED';
 const d=dimensions[0];let deltas=[];
 if(d==='DURATION')deltas=[b.durationMinutes-a.durationMinutes];
 if(d==='WORK_REPETITIONS')deltas=[b.work.repetitions-a.work.repetitions];
 if(d==='WORK_WORKMINUTES')deltas=[b.work.workMinutes-a.work.workMinutes];
 if(['LOAD','REPS','SETS','RIR'].includes(d))deltas=b.exercises.map((e,i)=>d==='LOAD'?e.load.value-a.exercises[i].load.value:(e[d.toLowerCase()]-a.exercises[i][d.toLowerCase()])*(d==='RIR'?-1:1));
 return deltas.some(v=>v>0)&&deltas.every(v=>v>=0)?'PROGRESS':deltas.some(v=>v<0)&&deltas.every(v=>v<=0)?'REGRESS':'UNSUPPORTED';
}
export function validateProgramInput(input){
 const errors=[],missing=[];const a=input?.athlete;
 if(input?.version!==INPUT_VERSION||input.synthetic!==true||input.purpose!=='SHADOW_REFERENCE')errors.push('synthetic reference contract');
 if(!dateValid(input?.asOf)||!dateValid(input?.startDate)||daysBetween(input.asOf,input.startDate)<0)errors.push('asOf/startDate');
 if(![4,8,12,16].includes(input?.weeks))errors.push('weeks must be 4,8,12,16');
 if(!a?.id)missing.push('athlete.id');
 if(!finite(a?.ageYears,18,80)||a?.participation!=='RECREATIONAL_HYBRID')errors.push('population outside reviewed scope');
 for(const m of ['runExperience','strengthExperience'])if(!['NOVICE','INTERMEDIATE'].includes(a?.[m]))missing.push('athlete.'+m);
 const el=a?.eligibility;
 const eligibilityKeys=['status','assessedAt','pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'];
 if(el&&Object.keys(el).some(k=>!eligibilityKeys.includes(k)))errors.push('unreviewed eligibility/population context');
 const athleteKeys=['id','ageYears','participation','runExperience','strengthExperience','eligibility','goal','anchors','weeklyTolerance'];
 if(a&&Object.keys(a).some(k=>!athleteKeys.includes(k)))errors.push('unreviewed athlete/population context');
 const clinical=['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].some(k=>el?.[k]===true);
 if(el?.status!=='NONCLINICAL_CONFIRMED'||!dateValid(el?.assessedAt)||daysBetween(el.assessedAt,input.asOf)<0||daysBetween(el.assessedAt,input.asOf)>14)missing.push('athlete.eligibility.currentAssessment');
 for(const k of ['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'])if(el?.[k]!==true&&el?.[k]!==false)missing.push('athlete.eligibility.'+k);
 if(!['HALF_MARATHON','STRENGTH','BALANCED','GENERAL_FITNESS'].includes(a?.goal?.kind))missing.push('athlete.goal.kind');
 if(!['RUN_FIRST','STRENGTH_FIRST','BALANCED'].includes(a?.goal?.priority))missing.push('athlete.goal.priority');
 if(a?.goal?.kind==='HALF_MARATHON'){
  if(!dateValid(a.goal.eventDate))missing.push('athlete.goal.eventDate');
  else if(daysBetween(input.startDate,a.goal.eventDate)<0||daysBetween(input.startDate,a.goal.eventDate)>=input.weeks*7)errors.push('event outside program horizon');
 }
 if(!Array.isArray(input?.availability)||input.availability.length===0)missing.push('availability');
 const windowIds=new Set();
 const dayIds=new Set();
 for(const d of input?.availability??[]){
  if(dayIds.has(d.day))errors.push('availability.duplicateDay');dayIds.add(d.day);
  if(!Number.isInteger(d.day)||!finite(d.day,0,6)||!Array.isArray(d.windows))errors.push('availability.day/windows');
  for(const w of d.windows??[]){
   if(!w.id||windowIds.has(w.id)||!finite(w.startMinute,0,1439)||!finite(w.durationMinutes,1,240)||w.startMinute+w.durationMinutes>1440||!Array.isArray(w.equipment))errors.push('availability.window');
   windowIds.add(w.id);
  }
  const sorted=[...(d.windows??[])].sort((x,y)=>x.startMinute-y.startMinute);
  if(sorted.some((w,i)=>i>0&&sorted[i-1].startMinute+sorted[i-1].durationMinutes>w.startMinute))errors.push('availability.overlap');
 }
 const anchors=a?.anchors;
 if(!Array.isArray(anchors)||anchors.length===0)missing.push('athlete.anchors or demonstrated establishment input');
 const ids=new Set();
 for(const anchor of anchors??[]){
  if(!anchor||typeof anchor!=='object'){errors.push('anchor.object');continue;}
  if(!anchor.id||ids.has(anchor.id))errors.push('unique anchor id');ids.add(anchor.id);
  if(anchor.current!==true||anchor.familiar!==true||anchor.tolerated!==true||!dateValid(anchor.observedAt)||daysBetween(anchor.observedAt,input.asOf)<0||daysBetween(anchor.observedAt,input.asOf)>28)missing.push('anchor.'+anchor.id+'.currentToleratedExposure');
  if(typeof anchor.essential!=='boolean'||!anchor.objective)missing.push('anchor.'+anchor.id+'.intent');
  errors.push(...validatePrescription(anchor.prescription).map(e=>anchor.id+':'+e));
  const altIds=new Set();
  for(const alt of anchor.alternatives??[]){
   if(!alt.id||altIds.has(alt.id)||!['PROGRESS','REGRESS','RECOVERY','SUBSTITUTE'].includes(alt.purpose))errors.push('alternative.id/purpose');altIds.add(alt.id);
   errors.push(...validatePrescription(alt.prescription).map(e=>alt.id+':'+e));
   if(alt.familiar!==true||alt.tolerated!==true||!dateValid(alt.observedAt)||daysBetween(alt.observedAt,input.asOf)<0||daysBetween(alt.observedAt,input.asOf)>28)errors.push('alternative.currentFamiliarTolerance');
   if(alt.purpose==='PROGRESS'&&(alt.prescription.modality!==anchor.prescription.modality||changedDimensions(anchor.prescription,alt.prescription).length!==1))errors.push('progression.oneDimension');
   if(['PROGRESS','REGRESS'].includes(alt.purpose)&&doseDirection(anchor.prescription,alt.prescription)!==alt.purpose)errors.push('alternative.demandDirection');
   if(['PROGRESS','REGRESS'].includes(alt.purpose)){
    const c=alt.weeklyContext,proposed=anchors.map(a=>a.id===anchor.id?{...a,prescription:alt.prescription}:a);
    if(c?.source!=='SELF_REPORT'||c.recovery!=='COMPATIBLE'||c.baselineHash!==anchorConfigurationHash(anchors)||c.proposedHash!==anchorConfigurationHash(proposed)||!dateValid(c.observedAt)||daysBetween(c.observedAt,input.asOf)<0||daysBetween(c.observedAt,input.asOf)>28)errors.push('alternative.combinedWeekContext');
   }
  }
 }
 for(const m of ['RUN','STRENGTH'])if(anchors?.length&&!anchors.some(x=>x.prescription?.modality===m))missing.push('athlete.anchors.'+m);
 return {valid:errors.length===0&&missing.length===0&&!clinical,errors,missing:[...new Set(missing)],clinical};
}
export function levelIntent(intent,essential,optional=[]){
 return {intent,essentialOutcomes:clone(essential),optionalOutcomes:clone(optional),protectedStimuli:clone(essential),flexibleElements:['same-dose feasible placement','optional work','earned one-dimensional future dose'],progressionCriteria:['repeated comparable actual response','current familiar alternative','future horizon remains adequate'],regressionCriteria:['repeated incompatible response','material availability or recovery constraint'],exitCriteria:['intent reviewed against observed response and next horizon'],athleteResponseInputs:['actual stimulus','effort','recovery','performance','adherence','current clinical assessment']};
}
