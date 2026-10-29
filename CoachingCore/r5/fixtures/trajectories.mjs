import {clone,hash} from '../../src/value.mjs';
import {canonicalAthlete,anchor,easy,strength,bindFixtureAlternatives} from './canonical.mjs';
import {stimulusOf} from '../../src/r5-observation.mjs';
import {sessionContext} from '../../src/r5-review-context.mjs';
export function fixtureAthlete(kind,weeks){
 const input=canonicalAthlete(kind,weeks);
 if(kind==='STRENGTH'){
  input.athlete.anchors=input.athlete.anchors.filter(a=>!['long','cruise'].includes(a.id));
  input.athlete.anchors.push(anchor('strength-c',strength(35)),anchor('easy-b',easy(25),false));
  input.scheduleOptions[0].assignments=input.scheduleOptions[0].assignments.filter(a=>!['long','cruise'].includes(a.anchorId));
  input.scheduleOptions[0].assignments.push({anchorId:'strength-c',day:3,windowId:'d3-am'},{anchorId:'easy-b',day:5,windowId:'d5-am'});
 }
 input.athlete.weeklyTolerance.anchorIds=input.athlete.anchors.map(a=>a.id);
 return bindFixtureAlternatives(input);
}
export function noviceFixture(which){
 const input=fixtureAthlete('GENERAL_FITNESS',8);
 input.athlete.id='SYNTHETIC-NOVICE-'+which;
 if(which==='RUN'){
  input.athlete.runExperience='NOVICE';
  for(const a of input.athlete.anchors.filter(a=>a.prescription.modality==='RUN')){a.prescription={...easy(20),family:'WALK_JOG',effort:'Currently demonstrated 3 x 30sec comfortable jog, 2min walk recoveries, remaining time comfortable walking; walking replaces jogging on incompatible talk/function'};a.alternatives=[];a.objective='Establish currently demonstrated easy participation; no forced running';}
 }else{
  input.athlete.strengthExperience='NOVICE';
  for(const a of input.athlete.anchors.filter(a=>a.prescription.modality==='STRENGTH')){a.prescription={modality:'STRENGTH',family:'PRACTICE',durationMinutes:20,equipment:[],exercises:[{id:'SIT_TO_STAND',pattern:'SQUAT',sets:1,reps:5,load:{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'},rir:4,restSeconds:90,preparationMinutes:3}]};a.alternatives=[];a.objective='Practice demonstrated unloaded movement; learn current response before loading';}
 }
 return bindFixtureAlternatives(input);
}
export function actualFor(program,session,performance='COMPATIBLE',suffix=''){
 return {eventId:'actual-'+session.id+suffix,athleteId:program.athleteId,sessionId:session.id,observedAt:session.date+'T20:00:00Z',origin:'ACTUAL_EXECUTION',sourceHash:hash({athleteId:program.athleteId,sessionId:session.id,performance,suffix}),plannedPrescriptionHash:hash(session.prescription),actual:{completed:true,minutes:session.prescription.durationMinutes,stimulus:stimulusOf(session.prescription),...(session.prescription.modality==='STRENGTH'?{sets:session.prescription.exercises.reduce((n,e)=>n+e.sets,0),reps:session.prescription.exercises.reduce((n,e)=>n+e.sets*e.reps,0)}:{})},response:{performance,recovery:'COMPATIBLE',effort:performance==='OVER'?'EASIER':performance==='UNDER'?'HARDER':'ON_TARGET'},context:sessionContext(program,session),comparable:true,confounded:false};
}
export function reviewFor(program,weekIndex,kind='REVIEW',extra={}){
 const week=program.weeks[weekIndex],asOf=new Date(Date.parse(week.startDate)+6*86400000).toISOString().slice(0,10)+'T23:00:00Z';
 return {version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex,event:{id:`event-${kind}-${weekIndex}`,kind},eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:asOf.slice(0,10),pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},observations:[],learningConsent:true,...clone(extra)};
}
export function learnedHistory(program,session,arrangement='reported-week',performance='UNDER'){
 const actuals=[],historicalSessions=[];
 for(let i=0;i<4;i++){
  const date=new Date(Date.parse(program.startDate)-(28-i*7)*86400000).toISOString().slice(0,10),id='historical-'+arrangement+'-'+i;
  const s={id,prescription:clone(session.prescription),date,phase:program.weeks[0].phase,arrangement,athleteId:program.athleteId,priority:program.goal.priority,origin:'HISTORICAL_ACTUAL_TASK'};
  historicalSessions.push(s);
  const o=actualFor(program,{...session,id,date},performance,'-'+arrangement);o.context={...o.context,phase:s.phase,arrangement};actuals.push(o);
 }
 return {actuals,historicalSessions};
}
