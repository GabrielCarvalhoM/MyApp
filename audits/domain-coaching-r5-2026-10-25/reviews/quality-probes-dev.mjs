import fs from 'node:fs';
import crypto from 'node:crypto';
import {generateProgram} from '../../../CoachingCore/src/r5-program.mjs';
import {evaluateProgram,ProgramShadowJournal} from '../../../CoachingCore/src/r5-adaptation.mjs';
import {dateValid} from '../../../CoachingCore/src/r5-contract.mjs';
import {canonicalAthlete,testAuthority,easy,bindFixtureAlternatives} from '../../../CoachingCore/r5/fixtures/canonical.mjs';
import {stimulusOf} from '../../../CoachingCore/src/r5-observation.mjs';
import policy from '../../../CoachingCore/r5/PROGRAM_POLICY_R5.json' with {type:'json'};
import {clone,hash} from '../../../CoachingCore/src/value.mjs';

// DEV adversarial probes; not the unseen holdout and no science approval claimed.
const options=testAuthority(policy), rows=[];
const root=new URL('../../../',import.meta.url);
const sources=fs.readdirSync(new URL('CoachingCore/src/',root)).filter(x=>x.startsWith('r5-')).map(x=>['CoachingCore/src/'+x,crypto.createHash('sha256').update(fs.readFileSync(new URL('CoachingCore/src/'+x,root))).digest('hex')]);
const first=(input=canonicalAthlete())=>{const d=generateProgram(input,options);if(!d.program)throw {structuredRejection:true,status:d.status,errors:d.errors,missingInputs:d.missingInputs};return d.program;};
const el=date=>({status:'NONCLINICAL_CONFIRMED',assessedAt:date,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const review=(p,kind='REVIEW',weekIndex=0,extra={})=>({version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:p.weeks[weekIndex].startDate+'T23:00:00Z',weekIndex,event:{id:`quality-${kind}-${weekIndex}`,kind},eligibility:el(p.weeks[weekIndex].startDate),observations:[],...extra});
function observation(p,week,performance='OVER',anchorId='easy'){
 const s=p.weeks[week].sessions.find(s=>s.anchorId===anchorId);
 return {eventId:`quality-actual-${week}-${anchorId}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+'T20:00:00Z',origin:'ACTUAL_EXECUTION',sourceHash:hash({session:s.id,performance}),plannedPrescriptionHash:hash(s.prescription),actual:{completed:true,minutes:s.prescription.durationMinutes,stimulus:stimulusOf(s.prescription),...(s.prescription.modality==='STRENGTH'?{sets:s.prescription.exercises.reduce((n,e)=>n+e.sets,0),reps:s.prescription.exercises.reduce((n,e)=>n+e.sets*e.reps,0)}:{})},response:{performance,recovery:'COMPATIBLE',effort:performance==='OVER'?'EASIER':'HARDER'},context:{family:s.prescription.family,modality:s.prescription.modality,phase:p.weeks[week].phase,arrangement:s.arrangement,doseKey:hash(s.prescription),equipment:clone(s.prescription.equipment),priority:p.goal.priority},comparable:true,confounded:false};
}
const dose=(p,w=3)=>p?.weeks[w].sessions.find(s=>s.anchorId==='easy')?.prescription.durationMinutes;
const schedule=(p,asOf,id='moved')=>[{id,assignments:p.scheduleOptions[0].assignments.map(a=>a.anchorId==='easy'?{...a,day:2,windowId:'d2-am'}:a),evidence:{current:true,observedAt:asOf.slice(0,10),source:'SELF_REPORT',combinedRecovery:'COMPATIBLE'}}];
function probe(id,criterion,fn){try {rows.push({id,criterion,...fn()});}catch(e){rows.push({id,criterion,...(e.structuredRejection?{generationRejected:true,status:e.status,errors:e.errors,missingInputs:e.missingInputs}:{threw:{name:e.name,message:e.message}})});}}

probe('Q01','Direction of PROGRESS is validated',()=>{
 const i=canonicalAthlete();i.athlete.anchors[0].alternatives[0].prescription=easy(20);
 const p=first(i),obs=[0,1,2].map(w=>observation(p,w)),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,originalMinutes:dose(p),proposalMinutes:dose(d.proposal),selectedAlternative:d.alternativeId};
});
probe('Q02','Direction of REGRESS is validated',()=>{
 const i=canonicalAthlete();i.athlete.anchors[0].alternatives[1].prescription=easy(50);
 const p=first(i),obs=[0,1,2].map(w=>observation(p,w,'UNDER')),d=evaluateProgram(p,review(p,'UNDERPERFORMANCE',2,{observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,originalMinutes:dose(p),proposalMinutes:dose(d.proposal),selectedAlternative:d.alternativeId};
});
probe('Q03','Schedule movement preserves the current progressed dose',()=>{
 const p=first(),obs=[0,1,2].map(w=>observation(p,w)),a=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options),asOf='2026-11-09T23:00:00Z';
 const d=evaluateProgram(a.proposal,review(a.proposal,'SCHEDULE_CHANGE',2,{asOf,scheduleOptions:schedule(p,asOf)}),options);
 return {status:d.status,action:d.action,beforeMinutes:dose(a.proposal),afterMinutes:dose(d.proposal),followingWeekMinutes:dose(d.proposal,4)};
});
probe('Q04','Review chronology cannot rewrite already executed sessions',()=>{
 const p=first(),actual=observation(p,1),asOf='2026-11-10T23:00:00Z';
 const d=evaluateProgram(p,review(p,'SCHEDULE_CHANGE',0,{asOf,eligibility:el('2026-11-10'),actualLedger:[actual],scheduleOptions:schedule(p,asOf)}),options);
 const old=p.weeks[1].sessions.find(s=>s.id===actual.sessionId),next=d.proposal?.weeks[1].sessions.find(s=>s.id===actual.sessionId);
 return {status:d.status,action:d.action,observedAt:actual.observedAt,oldDate:old.date,newDate:next?.date,actualPreserved:d.actualLedger?.some(o=>o.eventId===actual.eventId),changedPastWeek:!!d.proposal&&hash(d.proposal.weeks[1])!==hash(p.weeks[1])};
});
probe('Q05','Malformed calendar date fails closed without crash',()=>{
 const i=canonicalAthlete();i.asOf='2026-02-28';i.startDate='2026-02-30';i.athlete.eligibility.assessedAt=i.asOf;i.athlete.goal.kind='GENERAL_FITNESS';delete i.athlete.goal.eventDate;
 for(const a of i.athlete.anchors){a.observedAt=i.asOf;for(const alt of a.alternatives)alt.observedAt=i.asOf;}i.athlete.weeklyTolerance.observedAt=i.asOf;i.scheduleOptions[0].evidence.observedAt=i.asOf;
 const d=generateProgram(i,options);return {dateValid:dateValid(i.startDate),status:d.status,inputStart:i.startDate,actualFirstDate:d.program?.weeks[0].startDate};
});
probe('Q06','Invalid review date returns structured rejection without crash',()=>{
 const p=first(),r=review(p);r.asOf='2026-02-30T23:00:00Z';r.eligibility.assessedAt='2026-02-28';const d=evaluateProgram(p,r,options);return {status:d.status,errors:d.errors};
});
probe('Q07','Backward model clock is structured HOLD rather than exception',()=>{
 const p=first(),a=evaluateProgram(p,review(p,'REVIEW',1),options),r=review(p);r.athleteModel=a.updatedModel;const d=evaluateProgram(p,r,options);return {status:d.status,errors:d.errors};
});
probe('Q08','Clinical routing does not learn a dose-compatible response during clinical concern',()=>{
 const p=first(),o=observation(p,0),r=review(p,'REVIEW',0,{observations:[o],learningConsent:true});r.eligibility.pain=true;const d=evaluateProgram(p,r,options);
 return {status:d.status,modelObservationCount:d.updatedModel?.observations.length,actualLedgerCount:d.actualLedger?.length,modelResponse:d.updatedModel?.observations[0]?.response};
});
probe('Q09','Progression must fit the actual available window',()=>{
 const i=canonicalAthlete();i.availability[0].windows[0].durationMinutes=30;const p=first(i),obs=[0,1,2].map(w=>observation(p,w)),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,windowMinutes:30,proposalMinutes:dose(d.proposal)};
});
probe('Q10','Alternatives cannot introduce unavailable equipment under one-dimensional progression',()=>{
 const i=canonicalAthlete();i.athlete.anchors[0].alternatives[0].prescription.equipment=['TREADMILL'];const p=first(i),obs=[0,1,2].map(w=>observation(p,w)),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,available:i.availability[0].windows[0].equipment,proposalEquipment:d.proposal?.weeks[3].sessions.find(s=>s.anchorId==='easy').prescription.equipment};
});
probe('Q11','Current fatigue targets the affected optional session rather than all optional work',()=>{
 const i=canonicalAthlete();i.athlete.anchors[0].essential=false;i.athlete.anchors[3].essential=false;const p=first(i),d=evaluateProgram(p,review(p,'LOCAL_FATIGUE',0,{targetSessionId:p.weeks[0].sessions.find(s=>s.anchorId==='strength-b').id}),options);
 return {status:d.status,action:d.action,removed:d.removeSessionIds,remaining:d.proposal?.weeks[0].sessions.map(s=>s.anchorId)};
});
probe('Q12','Malformed nested input returns validation result rather than uncaught TypeError',()=>{
 const i=canonicalAthlete();i.athlete.anchors[0]=null;const d=generateProgram(i,options);return {status:d.status};
});
probe('Q13','Actual current-dose exposure, not planned-dose labels, earns progression',()=>{
 const p=first(),obs=[0,1,2].map(w=>{const o=observation(p,w);o.actual.minutes=1;o.actual.stimulus.durationMinutes=1;return o;}),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,plannedMinutes:30,actualMinutes:obs.map(o=>o.actual.minutes),futureMinutes:dose(d.proposal),confidence:d.athleteEvidence?.confidence};
});
probe('Q14','Near-term event has a real EVENT block rather than overlapping pre-event phases',()=>{
 const i=canonicalAthlete();i.athlete.goal.eventDate='2026-10-30';const d=generateProgram(i,options);
 return {status:d.status,eventDate:i.athlete.goal.eventDate,eventWeekPhase:d.program?.weeks[0].phase,eventWeekSessionDates:d.program?.weeks[0].sessions.map(s=>s.date),postEventPhase:d.program?.weeks[1].phase,blocks:d.program?.blocks.map(b=>({phase:b.phase,start:b.startWeek,end:b.endWeekExclusive}))};
});
probe('Q15','Session clock prevents a response observed before the scheduled session start',()=>{
 const p=first(),o=observation(p,0);o.observedAt=p.weeks[0].startDate+'T00:01:00Z';const d=evaluateProgram(p,review(p,'REVIEW',0,{observations:[o],learningConsent:true}),options);
 return {status:d.status,scheduledStart:'07:00',observationTime:'00:01',acceptedModelCount:d.updatedModel?.observations.length};
});
probe('Q16','Changing session preparation/calibration/equipment cannot be hidden by duration-only dimension',()=>{
 const i=canonicalAthlete(),alt=i.athlete.anchors[0].alternatives[0];alt.prescription.warmupMinutes=0;alt.prescription.cooldownMinutes=0;
 const p=first(i),obs=[0,1,2].map(w=>observation(p,w)),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,original:p.weeks[3].sessions[0].prescription,selected:d.proposal?.weeks[3].sessions[0].prescription};
});
probe('Q17','Valid earned run progression still works',()=>{
 const p=first(),obs=[0,1,2].map(w=>observation(p,w)),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,before:dose(p),after:dose(d.proposal)};
});
probe('Q18','Valid earned strength progression still works with actual sets/reps',()=>{
 const p=first(),obs=[0,1,2].map(w=>{const o=observation(p,w,'OVER','strength-a'),s=p.weeks[w].sessions.find(s=>s.id===o.sessionId);return {...o,actual:{...o.actual,sets:s.prescription.exercises.reduce((n,e)=>n+e.sets,0),reps:s.prescription.exercises.reduce((n,e)=>n+e.sets*e.reps,0)}};}),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{asOf:'2026-11-10T23:00:00Z',observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,before:p.weeks[3].sessions.find(s=>s.anchorId==='strength-a').prescription.exercises[0].reps,after:d.proposal?.weeks[3].sessions.find(s=>s.anchorId==='strength-a').prescription.exercises[0].reps};
});
probe('Q19','Smallest supported run-work increment is selected independent of alternative order',()=>{
 const i=canonicalAthlete(),a=i.athlete.anchors.find(a=>a.id==='cruise');a.prescription.durationMinutes=60;
 const larger=clone(a.prescription),smaller=clone(a.prescription);larger.work.repetitions=5;smaller.work.repetitions=4;
 a.alternatives=[{id:'cruise-larger',purpose:'PROGRESS',prescription:larger,familiar:true,tolerated:true,observedAt:i.asOf},{id:'cruise-smaller',purpose:'PROGRESS',prescription:smaller,familiar:true,tolerated:true,observedAt:i.asOf}];
 bindFixtureAlternatives(i);
 const p=first(i),obs=[0,1,2].map(w=>observation(p,w,'OVER','cruise')),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{asOf:'2026-11-12T23:00:00Z',observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,smallerReps:4,largerReps:5,selected:d.alternativeId,selectedReps:d.proposal?.weeks[3].sessions.find(s=>s.anchorId==='cruise').prescription.work.repetitions};
});
probe('Q20','Strength actual load must bind current dose rather than only aggregate sets/reps',()=>{
 const p=first(),obs=[0,1,2].map(w=>{const o=observation(p,w,'OVER','strength-a');o.actual.loadKg=1;for(const e of o.actual.stimulus.exercises)e.load.value=1;return o;}),d=evaluateProgram(p,review(p,'OVERPERFORMANCE',2,{asOf:'2026-11-10T23:00:00Z',observations:obs,learningConsent:true,targetSessionId:obs[2].sessionId}),options);
 return {status:d.status,action:d.action,actualLoadKg:1,prescribedSquatKg:40,selected:d.alternativeId,modelObservationCount:d.updatedModel?.observations.length};
});
probe('Q21','An existing learned actual cannot be removed merely because review omits duplicate actualLedger',()=>{
 const i=canonicalAthlete();i.athlete.anchors[0].essential=false;const p=first(i),o=observation(p,0),a=evaluateProgram(p,review(p,'REVIEW',0,{observations:[o],learningConsent:true}),options);
 const d=evaluateProgram(p,review(p,'LOCAL_FATIGUE',0,{athleteModel:a.updatedModel,learningConsent:true,targetSessionId:o.sessionId}),options);
 return {status:d.status,action:d.action,knownCompletedSession:o.sessionId,learnedCompletedCount:d.updatedModel?.observations.length,sessionStillPresent:d.proposal?.weeks[0].sessions.some(s=>s.id===o.sessionId)};
});
probe('Q22','Updated availability cannot overbook overlapping session times',()=>{
 const p=first(),asOf='2026-10-26T23:00:00Z',availability=clone(p.availability);availability[2].windows[0].durationMinutes=100;availability[2].windows[1].startMinute=430;
 const assignments=p.scheduleOptions[0].assignments.map(a=>a.anchorId==='easy'?{...a,day:2,windowId:'d2-am'}:a.anchorId==='strength-a'?{...a,day:2,windowId:'d2-pm'}:a),opts=[{id:'overlapping',assignments,evidence:{current:true,observedAt:'2026-10-26',source:'SELF_REPORT',combinedRecovery:'COMPATIBLE'}}];
 const d=evaluateProgram(p,review(p,'SCHEDULE_CHANGE',0,{availability,scheduleOptions:opts}),options),sessions=d.proposal?.weeks[1].sessions.filter(s=>s.day===2).map(s=>({id:s.id,start:s.startMinute,end:s.startMinute+s.prescription.durationMinutes}));
 return {status:d.status,action:d.action,sessions};
});
probe('Q23','Missed essential alone does not make the next valid key session inadequate',()=>{
 const p=first(),asOf='2026-10-26T23:00:00Z',d=evaluateProgram(p,review(p,'MISSED_ESSENTIAL',0,{scheduleOptions:schedule(p,asOf)}),options);
 return {status:d.status,action:d.action,proposal:!!d.proposal};
});
probe('Q24','Clinical pending cannot be downgraded by a missing-eligibility review then auto-cleared',()=>{
 const p=first(),j=new ProgramShadowJournal(),r0=review(p,'REVIEW',0);r0.eligibility.pain=true;
 const a=j.record(p,r0,options).result,r1=review(p,'RECOVERED',1,{eligibility:undefined});r1.event.id='quality-missing-eligibility';
 const b=j.record(p,r1,options).result,r2=review(p,'RECOVERED',1,{reconciliation:{source:'CURRENT_SELF_REPORT',ordinaryFunction:'COMPATIBLE',recovery:'COMPATIBLE',observedAt:'2026-11-02',prescriptionHashes:p.weeks[1].sessions.map(s=>hash(s.prescription))}});r2.event.id='quality-reconcile-after-missing';
 const c=j.record(p,r2,options).result;
 return {firstStatus:a.status,intermediateStatus:b.status,intermediatePending:b.referenceState?.pending?.status,finalStatus:c.status,finalPending:c.referenceState?.pending?.status??null};
});
probe('Q25','RECOVERED alone does not clear a nonclinical pending reference',()=>{
 const p=first(),j=new ProgramShadowJournal(),a=j.record(p,review(p,'SYSTEMIC_FATIGUE',0),options).result,b=j.record(p,review(p,'RECOVERED',1),options).result;
 return {firstStatus:a.status,finalStatus:b.status,pending:b.referenceState?.pending?.status};
});
probe('Q26','Complete current nonclinical reconciliation can resolve the pending reference',()=>{
 const p=first(),j=new ProgramShadowJournal(),a=j.record(p,review(p,'SYSTEMIC_FATIGUE',0),options).result;
 const r=review(p,'RECOVERED',1,{reconciliation:{source:'CURRENT_SELF_REPORT',ordinaryFunction:'COMPATIBLE',recovery:'COMPATIBLE',observedAt:'2026-11-02',prescriptionHashes:p.weeks[1].sessions.map(s=>hash(s.prescription))}}),b=j.record(p,r,options).result;
 return {firstStatus:a.status,finalStatus:b.status,pending:b.referenceState?.pending?.status??null};
});
probe('Q27','Complete self-report reconciliation cannot itself clear a clinical dependency',()=>{
 const p=first(),j=new ProgramShadowJournal(),r0=review(p,'REVIEW',0);r0.eligibility.pain=true;const a=j.record(p,r0,options).result;
 const r=review(p,'RECOVERED',1,{reconciliation:{source:'CURRENT_SELF_REPORT',ordinaryFunction:'COMPATIBLE',recovery:'COMPATIBLE',observedAt:'2026-11-02',prescriptionHashes:p.weeks[1].sessions.map(s=>hash(s.prescription))}}),b=j.record(p,r,options).result;
 return {firstStatus:a.status,finalStatus:b.status,pending:b.referenceState?.pending?.status??null};
});
const report={purpose:'INDEPENDENT_DEV_ADVERSARIAL_PROBES_NOT_HOLDOUT',evaluator:'/root/quality',node:process.version,generatedAt:new Date().toISOString(),sourceHashes:Object.fromEntries(sources),authorityMode:'TEST_ONLY (production authority/binding separately reviewed)',rows};
fs.writeFileSync(new URL('./'+(process.argv[2]??'quality-probes-dev-results.json'),import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
