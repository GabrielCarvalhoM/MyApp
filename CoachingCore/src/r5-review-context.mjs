import {clone,hash} from './value.mjs';
import {dateValid,daysBetween} from './r5-contract.mjs';
import {createLearningModel,updateLearningModel,validateLearningModel} from './r5-learning.mjs';
import {bindActual} from './r5-observation.mjs';

export const reviewKinds=['REVIEW','MISSED_ESSENTIAL','MISSED_OPTIONAL','UNDERPERFORMANCE','OVERPERFORMANCE','LOCAL_FATIGUE','SYSTEMIC_FATIGUE','SCHEDULE_CHANGE','TRAVEL','DOUBLE_INFEASIBLE','SESSION_MOVED','PROGRESSION_NOT_TOLERATED','PROGRESSION_TOO_EASY','RETURN','EVENT_NEAR','CONFLICT','GOAL_CHANGE','EQUIPMENT_CHANGE','RECOVERED'];
export function sessionContext(program,session){return {family:session.prescription.family,modality:session.prescription.modality,phase:program.weeks[session.weekIndex]?.phase,arrangement:session.arrangement??program.selectedScheduleId,doseKey:hash(session.prescription),equipment:clone(session.prescription.equipment),priority:program.goal.priority};}
export function prepareReview(program,review,{learningBlocked=false,priorClinical=false}={}){
 const errors=[],missing=[],el=review?.eligibility;
 const clinical=priorClinical||['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].some(k=>el?.[k]===true);
 if(review?.version!=='R5-REVIEW-1'||review?.synthetic!==true||review?.purpose!=='SHADOW_REFERENCE')errors.push('synthetic review contract');
 if(!dateValid(review?.asOf)||!/[T].*(?:Z|[+-]\d\d:\d\d)$/.test(review.asOf??''))errors.push('explicit asOf timestamp with timezone');
 if(!Number.isInteger(review?.weekIndex)||!program.weeks[review.weekIndex])errors.push('weekIndex');
 const currentWeek=program.weeks[review?.weekIndex];
 if(currentWeek&&dateValid(review.asOf)&&(Date.parse(review.asOf)<Date.parse(currentWeek.startDate)||Date.parse(review.asOf)>=Date.parse(currentWeek.startDate)+7*86400000))errors.push('weekIndex/asOf chronology');
 if(!review?.event?.id||!reviewKinds.includes(review?.event?.kind))errors.push('event.id/kind');
 if(!el||el.status!=='NONCLINICAL_CONFIRMED'||!dateValid(el.assessedAt)||daysBetween(el.assessedAt,review.asOf)<0||daysBetween(el.assessedAt,review.asOf)>14||['pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].some(k=>typeof el[k]!=='boolean'))missing.push('eligibility.currentAssessment');
 if(el&&Object.keys(el).some(k=>!['status','assessedAt','pain','persistentPain','injury','illness','functionalLimitation','clinicalConcern'].includes(k)))missing.push('eligibility.unreviewedScope');
 const asOf=errors.includes('explicit asOf timestamp with timezone')?'2000-01-01T00:00:00Z':review.asOf;
 let model=review.athleteModel??createLearningModel({athleteId:program.athleteId,purposeAllowed:review.learningConsent===true,asOf});
 if(!validateLearningModel(model)||model.athleteId!==program.athleteId)errors.push('athleteModel integrity/ownership');
 if(validateLearningModel(model)&&Date.parse(model.asOf)>Date.parse(asOf))errors.push('athleteModel clock exceeds review clock');
 if(review.actualLedger!==undefined&&!Array.isArray(review.actualLedger))errors.push('actualLedger array required');
 if(review.observations!==undefined&&!Array.isArray(review.observations))errors.push('observations array required');
 const actualLedger=Array.isArray(review.actualLedger)?clone(review.actualLedger):[],accepted=[],excluded=[];
 const seen=new Map(actualLedger.filter(Boolean).map(o=>[o.eventId,o]));
 const pastSessions=Array.isArray(review.historicalSessions)?review.historicalSessions:[];
 // Model evidence is also completed work. Omitting a second ledger cannot make it editable.
 for(const o of validateLearningModel(model)?model.observations:[]){
  const existing=seen.get(o.eventId);
  if(existing&&hash(existing)!==hash(o))errors.push('model/actual immutable conflict '+o.eventId);
  if(!existing){actualLedger.push(clone(o));seen.set(o.eventId,o);}
  const binding=bindActual(program,o,pastSessions,asOf,sessionContext);
  if(!binding.valid||!binding.comparable)errors.push('model evidence physical source binding '+o.eventId);
 }
 for(const o of Array.isArray(review.observations)?review.observations:[]){
  if(!o||typeof o!=='object'){errors.push('actual observation object required');continue;}
  const existing=seen.get(o.eventId);
  if(existing){if(hash(existing)!==hash(o))errors.push('immutable actual conflict '+o.eventId);continue;}
  if(actualLedger.some(p=>p.sessionId===o.sessionId)&&o.sessionId){excluded.push({eventId:o.eventId,reason:'Session already has actual execution; append correction protocol required'});continue;}
  const binding=bindActual(program,o,pastSessions,asOf,sessionContext);
  if(!binding.valid){
   errors.push('planned/actual provenance binding '+o.eventId);excluded.push({eventId:o.eventId,reason:'Actual observation does not bind the planned task, context and chronology'});continue;
  }
  seen.set(o.eventId,o);actualLedger.push(clone(o));
  const fullDose=binding.comparable;
  if(!fullDose||o.actual?.completed!==true||clinical||missing.length||learningBlocked){excluded.push({eventId:o.eventId,reason:clinical?'CLINICAL_CONTEXT_NOT_TOLERANCE':!fullDose?'ACTUAL_DOSE_NOT_COMPARABLE':'CURRENT_ELIGIBILITY_OR_COMPLETION_UNASSESSED'});continue;}
  accepted.push(clone(o));
 }
 if(!errors.length&&!missing.length&&!clinical&&!learningBlocked){
  model=updateLearningModel(model,accepted,{asOf,purposeAllowed:review.learningConsent===true});
 }
 return {errors,missing,clinical,model,actualLedger,accepted,excluded,asOf};
}
