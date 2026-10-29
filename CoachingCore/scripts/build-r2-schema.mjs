import fs from 'node:fs';
import path from 'node:path';
const core=path.resolve(import.meta.dirname,'..');
const str={type:'string',minLength:1}, bool={type:'boolean'}, num={type:'number',minimum:0};
const en=(...v)=>({enum:v}), nullable=s=>({anyOf:[s,{type:'null'}]});
const obj=(properties,required=Object.keys(properties))=>({type:'object',additionalProperties:false,required,properties});
const arr=(items,minItems=0)=>({type:'array',items,minItems,uniqueItems:true});
const days=arr(en('MON','TUE','WED','THU','FRI','SAT','SUN'),1);
const observation=obj({sourceRef:str,sourceRevision:str,observedAt:str,coverage:en('COMPLETE','PARTIAL','UNKNOWN'),association:en('CONFIRMED','UNCERTAIN'),response:en('COMPATIBLE','ADVERSE','UNKNOWN'),contextComparable:bool});
const episode=obj({factId:str,athleteId:str,observedAt:str,sourceRef:str,sourceRevision:str,coverage:en('COMPLETE','PARTIAL'),comparable:bool,recipeId:str,result:en('COMPATIBLE','OVER_TARGET','UNDER_TARGET','ADVERSE'),completed:bool,technique:en('ACCEPTABLE','DEGRADED','UNKNOWN'),actualReps:num,setsCompleted:num,uniformRepsAcrossAllSets:bool,actualRir:num,actualLoadKg:num});
const commonHistory={episodes:arr(episode),relevantContextUnchanged:bool};
const loads=obj({legPress:num,machineChestPress:num,seatedCableRow:num,seatedLegCurl:num});
const raceLoads=obj({legPress:num,machineChestPress:num,seatedCableRow:num});
const facts={
 ESTABLISH_RUN:obj({walkMinutes:num,comfortableTalk:bool,runExposure:en('NEVER','REPORTED','KNOWN'),timeBudgetMinutes:num,availableDays:days}),
 ESTABLISH_STRENGTH:obj({configurationFamiliar:bool,techniqueDemonstrated:bool,loadEstablished:bool,loadsKg:loads,timeBudgetMinutes:num,availableDays:days}),
 PROGRESS_STRENGTH:obj({...commonHistory,loadKg:num,rirCalibratedForTask:bool,establishedTargetRir:num,nextHorizonNeedConfirmed:bool,smallestIncrementAvailable:bool}),
 LOCAL_FATIGUE:obj({loadKg:num,rirCalibratedForTask:bool,establishedTargetRir:num,fatigueScope:en('LOCAL','SYSTEMIC','UNKNOWN'),affectedComponent:str,essentialPerformance:en('COMPATIBLE','DEGRADED','UNKNOWN'),optionalComponentUnperformed:bool,oneOptionalSetStillInadequate:bool,materialProblem:bool}),
 SYSTEMIC_FATIGUE:obj({subjectiveFatigue:bool,performanceDecline:bool,contextComparable:bool,branchAuthorized:bool,branchFamiliar:bool,branchWindowAllowed:bool,easyCurrentlyTolerated:bool,optionalRemovalSufficient:bool,materialProblem:bool}),
 UNDER_TARGET_STRENGTH:obj({...commonHistory,loadKg:num,rirCalibratedForTask:bool,establishedTargetRir:num,reducedCandidateTolerated:bool,essentialIntentPreserved:bool,smallerRestChangeSufficient:bool,materialProblem:bool}),
 REDUCE_RUN_REPETITION:obj({...commonHistory,paceSecondsPerKm:num,fifthRepDegrades:bool,fourRepsTolerated:bool,targetCalibrated:bool,essentialIntentPreserved:bool,smallerRestChangeSufficient:bool,materialProblem:bool}),
 PROGRESS_RUN:obj({...commonHistory,family:en('EASY','LONG'),candidatePreviouslyTolerated:bool,nextHorizonNeedConfirmed:bool}),
 RETURN_RUN:obj({reason:en('TRAVEL','SCHEDULE','INJURY','ILLNESS','UNKNOWN'),interruptionDays:num,priorFamiliar:bool,currentRunMinutes:num,capacityEstablishedToday:bool,currentComfortableTalk:bool,timeBudgetMinutes:num,availableDays:days}),
 RETURN_STRENGTH:obj({reason:en('TRAVEL','SCHEDULE','INJURY','ILLNESS','UNKNOWN'),interruptionDays:num,priorFamiliar:bool,currentConfigurationDemonstrated:bool,currentLoadEstablished:bool,loadsKg:loads,timeBudgetMinutes:num,availableDays:days}),
 TAPER_10K:obj({daysToRace:num,eventDistance:en('10K'),eventPriorityConfirmed:bool,allRecipesFamiliar:bool,runTargetsCalibrated:bool,racePaceSecondsPerKm:num,loadsKg:raceLoads,essentialRunFeasible:bool,strengthIntent:en('MAINTAIN_FAMILIAR','OMIT','INTRODUCE_NEW'),scheduleConfirmed:bool}),
 TAPER_HALF:obj({daysToRace:num,eventDistance:en('HALF_MARATHON'),eventPriorityConfirmed:bool,allRecipesFamiliar:bool,runTargetsCalibrated:bool,racePaceSecondsPerKm:num,loadsKg:raceLoads,essentialRunFeasible:bool,strengthIntent:en('MAINTAIN_FAMILIAR','OMIT','INTRODUCE_NEW'),scheduleConfirmed:bool}),
 TAPER_BALANCED:obj({daysToRace:num,eventDistance:en('10K'),eventPriorityConfirmed:bool,allRecipesFamiliar:bool,runTargetsCalibrated:bool,racePaceSecondsPerKm:num,loadsKg:raceLoads,essentialRunFeasible:bool,strengthIntent:en('MAINTAIN_FAMILIAR','OMIT','INTRODUCE_NEW'),scheduleConfirmed:bool}),
 CALIBRATE_RUN:obj({family:en('EASY','RECOVERY','STEADY','THRESHOLD','VO2','SHORT_INTERVALS','LONG','HILLS','STRIDES','RACE_PACE'),targetMethod:en('TALK_RPE','PACE','HR','POWER','LAB','FIELD'),construct:en('EASY_EFFORT','STEADY_EFFORT','LT2','CS','VO2_STYLE','SHORT_FAST','LONG_EASY','HILL_EFFORT','RELAXED_STRIDE','FIELD_SESSION_TARGET','RACE_PACE','UNKNOWN'),paceSecondsPerKm:nullable(num),familyFamiliar:bool,targetEstablished:bool,conditionsComparable:bool,toleranceKnown:bool,toleratedRecipeId:str,toleranceFactId:str,noLab:bool}),
 RANK_OPTIONS:obj({necessityEstablished:bool,candidatesAdmissible:bool,alternatives:arr(en('MON_LOWER','WED_LOWER'),2),episodes:arr(obj({factId:str,athleteId:str,observedAt:str,sourceRef:str,sourceRevision:str,coverage:en('COMPLETE','PARTIAL'),comparable:bool,placement:en('MON_LOWER','WED_LOWER'),response:en('COMPATIBLE','DEGRADED','UNKNOWN')})),counterevidenceConsidered:bool,relevantContextUnchanged:bool})
};
const recovery=obj({eligibilityStatus:en('NONCLINICAL_CONFIRMED','ELIGIBILITY_UNASSESSED','CLINICAL_CONCERN'),clinicalConcern:bool,interrupted:bool,sourceRef:str,contextChanged:bool,clinicalFlags:arr(str),persistentPain:bool,injury:bool,illness:bool,functionalLimitation:bool,clearanceRequired:bool});
const policyContext=obj({registryVersion:str,registryHash:str,revokedReviewIds:arr(str),holds:arr(str),longitudinalPurposeAllowed:bool,requestedPolicyIds:arr(str)});
const parameters=obj({loadKg:num,targetRir:num,loadsKg:{type:'object',additionalProperties:num},paceSecondsPerKm:num,racePaceSecondsPerKm:num},[]);
const session=obj({session_id:str,day:en('MON','TUE','WED','THU','FRI','SAT','SUN'),recipeId:str,status:en('PLANNED','COMPLETED'),optional:bool,parameters});
const provenance=obj({dataClass:en('SYNTHETIC','REAL'),sourceRef:str,sourceRevision:str,coverage:en('EXPLICIT_FIXTURE_FACTS','PARTIAL','UNKNOWN'),association:en('CONFIRMED','UNCERTAIN')});
const schema={$schema:'https://json-schema.org/draft/2020-12/schema',$id:'urn:vilumo:bounded-shadow:input:r2',...obj({inputVersion:en('BSR-INPUT-R2'),purpose:str,synthetic:bool,evaluatedAt:str,athleteFixtureId:str,athleteState:obj({athlete_id:str,adult:bool,priority:en('RUN_FIRST','STRENGTH_FIRST','BALANCED'),runLevel:en('NOVICE','INTERMEDIATE'),strengthLevel:en('NOVICE','INTERMEDIATE'),dataMode:en('NONE','PARTIAL','RICH'),history:en('NONE','LIMITED','KNOWN'),movementCompetence:en('KNOWN','UNKNOWN')}),officialPlanState:nullable(obj({plan_id:str,plan_revision:str,athlete_id:str,sessions:arr(session)})),event:{oneOf:Object.entries(facts).map(([request,f])=>obj({event_id:str,type:en('R2_REQUEST'),request:en(request),sessionId:nullable(str),facts:f}))},observation,observedExecutionState:obj({events:arr(obj({event_id:str})),completed:arr(obj({sessionId:str,athleteId:str,factId:str,sourceRef:str,sourceRevision:str,observedAt:str,recipeId:str,coverage:en('COMPLETE','PARTIAL')})),inferred:arr(obj({description:str}))}),recoveryContext:recovery,policyContext,provenance})};
schema.properties.athleteState.properties.ageYears={type:'number',minimum:0,maximum:120};
schema.properties.observedExecutionState.properties.completed.items.properties.executedRevision=str;
schema.properties.observedExecutionState.properties.completed.items.properties.parameters=parameters;
schema.properties.observedExecutionState.properties.completed.items.required.push('executedRevision','parameters');
fs.mkdirSync(path.join(core,'r2'),{recursive:true});
fs.writeFileSync(path.join(core,'r2/SHADOW_INPUT_R2_SCHEMA.json'),JSON.stringify(schema,null,2)+'\n');
console.log('Wrote strict R2 schema for '+Object.keys(facts).length+' requests');
