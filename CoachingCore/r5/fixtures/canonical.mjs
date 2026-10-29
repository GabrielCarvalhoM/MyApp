import {hash} from '../../src/value.mjs';
import {anchorConfigurationHash} from '../../src/r5-contract.mjs';
export function bindFixtureAlternatives(input){
 const anchors=input.athlete.anchors;
 for(const a of anchors)for(const alt of a.alternatives??[])if(['PROGRESS','REGRESS'].includes(alt.purpose))alt.weeklyContext={source:'SELF_REPORT',recovery:'COMPATIBLE',observedAt:alt.observedAt,baselineHash:anchorConfigurationHash(anchors),proposedHash:anchorConfigurationHash(anchors.map(x=>x.id===a.id?{...x,prescription:alt.prescription}:x))};
 return input;
}
export const easy=(minutes=30)=>({modality:'RUN',family:'EASY',durationMinutes:minutes,effortDomain:'EASY_CONVERSATIONAL',effort:'Comfortable full sentences; stop on abnormal symptoms',warmupMinutes:5,cooldownMinutes:5,equipment:[]});
export const strength=(load=40)=>({modality:'STRENGTH',family:'FULL_BODY',durationMinutes:45,equipment:['BARBELL'],exercises:[{id:'SQUAT',pattern:'SQUAT',sets:3,reps:6,load:{value:load,unit:'KG',convention:'TOTAL'},rir:3,restSeconds:180,preparationMinutes:5},{id:'ROW',pattern:'PULL',sets:3,reps:8,load:{value:30,unit:'KG',convention:'TOTAL'},rir:3,restSeconds:120,preparationMinutes:3}]});
export const anchor=(id,prescription,essential=true)=>({id,prescription,essential,objective:prescription.modality==='RUN'?'Aerobic development with task-specific control':'Progress familiar strength while retaining intrinsic strength goal',current:true,familiar:true,tolerated:true,observedAt:'2026-10-25',alternatives:[]});
export function canonicalAthlete(kind='HALF_MARATHON',weeks=16){
 const run=anchor('easy',easy()),long=anchor('long',{...easy(65),family:'LONG'}),quality=anchor('cruise',{modality:'RUN',family:'CRUISE',durationMinutes:39,effortDomain:'CONTROLLED_CURRENT',effort:'Personally familiar controlled cruise effort, no pace prediction',warmupMinutes:10,cooldownMinutes:5,equipment:[],calibration:{basis:'CURRENT_TASK',current:true},work:{repetitions:3,workMinutes:6,recoveryMinutes:3}}),s1=anchor('strength-a',strength()),s2=anchor('strength-b',strength());
 const shorter=easy(25),longer=easy(35),moreReps=strength();moreReps.exercises[0].reps=7;
 run.alternatives=[{id:'easy-35',purpose:'PROGRESS',prescription:longer,familiar:true,tolerated:true,observedAt:'2026-10-25'},{id:'easy-25',purpose:'REGRESS',prescription:shorter,familiar:true,tolerated:true,observedAt:'2026-10-25'}];
 s1.alternatives=[{id:'squat-rep',purpose:'PROGRESS',prescription:moreReps,familiar:true,tolerated:true,observedAt:'2026-10-25'}];
 const startDate='2026-10-26';
 const input={version:'R5-INPUT-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-10-25',startDate,weeks,learningConsent:true,athlete:{id:'SYNTHETIC-'+kind,ageYears:35,participation:'RECREATIONAL_HYBRID',runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-10-25',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},goal:{kind,priority:kind==='STRENGTH'?'STRENGTH_FIRST':kind==='HALF_MARATHON'?'RUN_FIRST':'BALANCED',secondary:kind==='HALF_MARATHON'?'Real strength development':'Retain productive running'},anchors:[run,quality,s1,s2,long],weeklyTolerance:{current:true,observedAt:'2026-10-25',source:'SELF_REPORT',anchorIds:['easy','cruise','strength-a','strength-b','long'],recovery:'COMPATIBLE'}},availability:Array.from({length:7},(_,day)=>({day,windows:[{id:'d'+day+'-am',startMinute:420,durationMinutes:100,equipment:['BARBELL']},{id:'d'+day+'-pm',startMinute:1080,durationMinutes:75,equipment:['BARBELL']}]})),scheduleOptions:[]};
 if(kind==='HALF_MARATHON')input.athlete.goal.eventDate=new Date(Date.parse(startDate)+(weeks*7-1)*86400000).toISOString().slice(0,10);
 const assignments=[{anchorId:'easy',day:0,windowId:'d0-am'},{anchorId:'strength-a',day:1,windowId:'d1-am'},{anchorId:'cruise',day:3,windowId:'d3-am'},{anchorId:'strength-b',day:4,windowId:'d4-am'},{anchorId:'long',day:6,windowId:'d6-am'}];
 input.scheduleOptions=[{id:'reported-week',assignments,evidence:{current:true,observedAt:'2026-10-25',source:'SELF_REPORT',combinedRecovery:'COMPATIBLE'}}];
 return bindFixtureAlternatives(input);
}
export const testAuthority=policy=>({policy,authority:{independent:true,records:policy.scientificBoundaryIds.map(boundaryId=>({boundaryId,policyHash:hash(policy),independent:true,disposition:'APPROVE_WITH_CONDITIONS',evidenceStatus:'SUPPORTED_WITH_LIMITS',sourceIds:['TEST_ONLY_NOT_SCIENCE']}))}});
