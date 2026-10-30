import Ajv2020 from 'ajv/dist/2020.js';
import {fact} from './r3-input.mjs';
const str={type:'string',minLength:1},num={type:'number',minimum:0},positive={type:'number',exclusiveMinimum:0},bool={type:'boolean'},nil={type:'null'};
const obj=properties=>({type:'object',properties,required:Object.keys(properties)});
const arr=(items,minItems=1)=>({type:'array',items,minItems});
const or=(...anyOf)=>({anyOf});
const unknown=s=>or(s,nil);
const nonempty={type:'object',minProperties:1};
const context=properties=>obj(properties);
const availability=arr(obj({day:str,minutes:positive}));
const dose=obj({sets:positive,reps:positive,targetRir:num});
const exercise={...dose,properties:{...dose.properties,exercise:str},required:[...dose.required,'exercise']};
const runSession=obj({family:str,repetitions:positive,workMinutesEach:positive,recoveryMinutes:num,effortAnchor:str});
const onset=obj({goals:arr(str),availability:unknown(availability),equipment:unknown(arr(str))});
const schemas={
 FIRST_WEEK:context({onboarding:onset,reportedExposure:unknown(nonempty)}),FIRST_PRODUCT_WEEK:context({onboarding:onset,reportedExposure:unknown(nonempty)}),FIRST_RUN_SESSION:context({onboarding:onset,reportedExposure:nonempty}),FIRST_STRENGTH_SESSION:context({onboarding:{...onset,properties:{...onset.properties,movementKnowledge:unknown(or(str,nonempty))},required:[...onset.required,'movementKnowledge']}}),
 NEVER_EXPOSED_RUN_FAMILY:context({reportedExposure:obj({run:str,strength:str}),currentDemand:obj({family:str,calibration:unknown(nonempty)})}),
 LOCAL_FATIGUE:context({currentDemand:obj({session:obj({essential:arr(exercise),optional:arr(exercise),completed:arr(nonempty,0)})}),observations:obj({local:str,systemic:str,pain:bool,performance:str,athleteRequest:str}),alternatives:obj({keep:str,omitOptional:str,cancelWholeSession:str})}),
 SYSTEMIC_FATIGUE:context({currentDemand:obj({session:runSession,essentialStimulus:str}),observations:obj({severalDays:str,warmup:str,firstTwoRepetitions:str,local:str,clinicalConcern:bool}),completedPrefix:obj({repetitions:positive,actualWorkMinutes:arr(positive)}),alternatives:nonempty}),
 NEXT_STRENGTH_SESSION:context({currentDemand:{...obj({exercise:str,base:dose}),anyOf:[{required:['candidate'],properties:{candidate:dose}},{required:['availableAlternative'],properties:{availableAlternative:dose}}]},observations:{...nonempty,anyOf:[{required:['recentComparableSessions'],properties:{recentComparableSessions:arr(obj({reps:arr(positive),reportedRir:arr(num),technique:str}))}},{required:['lastSession'],properties:{lastSession:obj({actualReps:arr(num),reportedRir:arr(num),technique:str})}}]}}),
 REVIEW_NEXT_SESSION:context({currentDemand:obj({officialWeek:obj({easyMinutes:positive,longMinutes:positive,strengthSessions:positive})}),observations:obj({lastEasyRun:obj({plannedMinutes:positive,actualMinutes:positive,talk:str,response:str}),restOfWeek:str,athleteRequest:str}),history:obj({pattern:str})}),
 MISSED_OPTIONAL_SESSION:context({currentDemand:obj({session:obj({family:str,minutes:positive,optional:bool}),remainingWeek:obj({core:str,status:str})}),observations:obj({omission:str,notMissingUpload:bool,coreWork:str,recovery:str}),athletePreference:str}),
 ACUTE_INTERFERENCE_AND_SCHEDULE_CONFLICT:context({currentDemand:obj({day:str,planned:obj({run:obj({family:str,start:str,durationMinutes:positive,role:str}),strength:obj({family:str,start:str,durationMinutes:positive,role:str})}),availability:{type:'object',minProperties:1}}),observations:obj({necessity:str,recovery:str}),alternatives:arr(obj({id:str,run:str,strength:str}),2),history:obj({bothArrangementsFamiliar:bool,noSpacingThresholdClaim:bool})}),
 REVIEW_SESSION:context({currentDemand:obj({session:obj({family:str,minutes:positive,calibration:str})}),observations:obj({subjectiveRecovery:str,warmup:str,recentPerformance:str}),wearable:obj({type:str,alert:str,measurementComparability:str,newContext:bool})}),
 EQUIPMENT_SUBSTITUTION:context({currentDemand:obj({original:exercise,requested:obj({exercise:str,loadKgPerHand:unknown(num)}),reason:str}),history:obj({originalFamiliar:bool,requestedMovementFamiliar:bool,completeAlternativeRecipe:bool})}),
 FIRST_RETURN_SESSION:context({interruption:obj({reason:unknown(str),durationDays:positive,nonclinical:unknown(bool),actualExposureKnown:bool}),priorHistory:nonempty,observations:obj({currentFunction:str,runningCapacity:str,clinicalConcern:bool})}),
 FIRST_RETURN_STRENGTH:context({interruption:obj({reason:unknown(str),durationDays:positive,nonclinical:unknown(bool),actualExposureKnown:bool}),priorHistory:nonempty,observations:obj({currentCapacity:unknown(str),ordinaryFunction:str,clinicalConcern:bool})}),
 RETURN_WEEK:context({interruption:obj({reason:unknown(str),durationDays:positive,nonclinical:unknown(bool),actualExposureKnown:bool}),priorHistory:nonempty,observations:{...nonempty,anyOf:[{required:['currentCapacity'],properties:{currentCapacity:unknown(str)}},{required:['currentRestrictions'],properties:{currentRestrictions:unknown(str)}}]}}),
 RETURN_NEXT_STEP:context({interruption:obj({reason:str,durationDays:positive,nonclinical:bool,actualExposureKnown:bool}),observations:obj({entrySession:str,nextDay:str,contextComparability:str,athleteRequest:str}),currentDemand:obj({availableReviewedSmallerAlternative:unknown(nonempty)})}),
 RACE_WEEK:{...context({event:obj({distanceKm:positive,day:str,priority:str}),priorHistory:obj({run:or(str,nonempty),strength:or(str,nonempty)})}),anyOf:[{required:['availability'],properties:{availability}},{properties:{currentDemand:obj({availability})},required:['currentDemand']}]},
 DAY_AFTER_EVENT:context({event:obj({distanceKm:positive,completedAt:str,actualEffort:str}),observations:obj({postEventSymptoms:unknown(or(bool,str)),currentFunction:unknown(str),subjectiveRecovery:unknown(str)})}),
 RUN_CALIBRATION:context({currentDemand:obj({family:str}),priorHistory:nonempty,calibration:nonempty}),
 RUN_NEXT_SESSION:context({currentDemand:obj({family:str,currentMinutes:positive,candidateMinutes:positive}),priorHistory:obj({recentComparable:arr(obj({minutes:positive,talk:str,nextDay:str})),candidate60PreviouslyFamiliar:bool,candidateResponse:str}),calibration:obj({method:str})}),
 RANK_EXISTING_ADMISSIBLE_OPTIONS:context({currentDemand:obj({options:arr(obj({id:str,admissibility:str}),2)}),priorHistory:obj({observations:arr(obj({arrangement:str,cruiseResponse:str,context:str})),observational:bool,causalityEstablished:bool,confounders:str}),constraints:obj({sameDoseCandidates:bool,noNewOption:bool,populationPriorVisible:bool}),learningConsent:obj({purposeAllowed:bool})}),
 LEARN_NEW_RULE:context({currentDemand:obj({requestedRule:str}),priorHistory:obj({observations:arr(obj({fatigue:str,performance:str,confounders:arr(str)})),otherwise:str,causalityEstablished:bool}),availableAdmissibleDoseAlternatives:unknown(nonempty),learningConsent:obj({purposeAllowed:bool})})
};
const families={
 EASY:obj({sameRoute:str,talkAnchor:str,response:str}),RECOVERY:obj({easy:str}),STEADY:obj({sameFamily:obj({warmupMinutes:num,workMinutes:positive,cooldownMinutes:num,paceSecondsPerKm:positive,subjective:str,response:str})}),THRESHOLD_CRUISE:obj({sameFamily:obj({repetitions:positive,workMinutesEach:positive,recoveryMinutes:num,paceSecondsPerKm:positive,effort:str,response:str})}),VO2_STYLE_INTERVALS:obj({run:str,vo2Intervals:str}),SHORT_INTERVALS:obj({easy:str,shortIntervals:str,strides:str}),HILLS:obj({flatEasy:str,hillRepeats:str}),STRIDES:obj({sameFamily:obj({repetitions:positive,secondsEach:positive,effort:str,recovery:str,surface:str,response:str})}),RACE_PACE:obj({lastRace:obj({distanceKm:positive,timeMinutes:positive,ageMonths:num,course:str,weather:str}),recentRun:str,racePaceWork:str})
};
const ajv=new Ajv2020({strict:false,allErrors:true});
const validators=Object.fromEntries(Object.entries(schemas).map(([k,s])=>[k,ajv.compile(s)]));
const familyValidators=Object.fromEntries(Object.entries(families).map(([k,s])=>[k,ajv.compile(s)]));

/** Source-bound eligibility representation checks; no sporting dose choice or scientific inference. */
export function assessMaterialConsumption(input){
 const source=fact(input,''),kind=source?.currentDemand?.kind,validate=validators[kind];
 const errors=[];
 if(!validate)return {recognized:false,valid:false,contract:'R3-MATERIAL-1',errors:[{path:'/currentDemand/kind',reason:'UNIMPLEMENTED_SEMANTIC_REQUEST'}]};
 const add=(vs,prefix='')=>{for(const e of vs??[])errors.push({path:prefix+(e.instancePath||'')+(e.params?.missingProperty?'/'+e.params.missingProperty:''),reason:e.message,keyword:e.keyword});};
 if(!validate(source))add(validate.errors);
 if(kind==='RUN_CALIBRATION'){
  const v=familyValidators[source.currentDemand.family];
  if(!v)errors.push({path:'/currentDemand/family',reason:'UNIMPLEMENTED_SEMANTIC_FAMILY'});
  else if(!v(source.priorHistory))add(v.errors,'/priorHistory');
 }
 if(kind==='SYSTEMIC_FATIGUE'&&source.completedPrefix&&Array.isArray(source.completedPrefix.actualWorkMinutes)&&source.completedPrefix.repetitions!==source.completedPrefix.actualWorkMinutes.length)errors.push({path:'/completedPrefix',reason:'Declared completed count and actual dose vector conflict'});
 return {recognized:true,valid:errors.length===0,contract:'R3-MATERIAL-1',request:kind,errors,scope:'Typed source-bound request operands, explicit unknowns and eligibility/gap routing; not arbitrary narrative comprehension, sporting sufficiency, dose-readiness or population coverage'};
}
