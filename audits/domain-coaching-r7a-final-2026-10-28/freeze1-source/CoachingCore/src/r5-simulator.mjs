import {clone,freeze,hash} from './value.mjs';
import {generateProgram} from './r5-program.mjs';
import {evaluateProgram} from './r5-adaptation.mjs';
import {sessionContext} from './r5-review-context.mjs';
import {stimulusOf} from './r5-observation.mjs';
import {previousValidity} from './r5-validity.mjs';
/** Outcomes are supplied fixtures. This engine does not simulate or predict physiology. */
export function simulateProgram(input,eventFixtures=[],options={}){
 const initial=generateProgram(input,options);
 if(!initial.program)return freeze({status:initial.status,initial,rows:[],summary:{weeksExecuted:0}});
 let program=initial.program,model=null,actualLedger=[],referenceState=null;const rows=[];
 for(let weekIndex=0;weekIndex<input.weeks;weekIndex++){
  const week=program.weeks[weekIndex],fixture=eventFixtures.find(e=>e.weekIndex===weekIndex)??{},observations=[];
  const asOf=new Date(Date.parse(week.startDate)+6*86400000).toISOString().slice(0,10)+'T23:00:00Z';
  const reconciliation=fixture.reconciledBeforeExecution?{source:'CURRENT_SELF_REPORT',ordinaryFunction:'COMPATIBLE',recovery:'COMPATIBLE',observedAt:asOf,prescriptionHashes:week.sessions.map(s=>hash(s.prescription))}:null;
  const pendingBlock=referenceState?.pending?previousValidity(program,{referenceState,asOf,weekIndex,event:{kind:fixture.kind??'REVIEW'},reconciliation}):null;
  for(const session of week.sessions){
   if(pendingBlock)continue;
   if((fixture.missedAnchorIds??[]).includes(session.anchorId))continue;
   const performance=fixture.performanceByAnchor?.[session.anchorId]??'COMPATIBLE';
   observations.push({eventId:'sim-'+input.athlete.id+'-'+session.id,athleteId:program.athleteId,sessionId:session.id,observedAt:session.date+'T20:00:00Z',origin:'ACTUAL_EXECUTION',sourceHash:hash({fixtureId:input.athlete.id,sessionId:session.id,performance}),plannedPrescriptionHash:hash(session.prescription),actual:{completed:true,minutes:session.prescription.durationMinutes,stimulus:stimulusOf(session.prescription),...(session.prescription.modality==='STRENGTH'?{sets:session.prescription.exercises.reduce((n,e)=>n+e.sets,0),reps:session.prescription.exercises.reduce((n,e)=>n+e.reps*e.sets,0)}:{})},response:{performance,recovery:fixture.recovery??'COMPATIBLE',effort:performance==='OVER'?'EASIER':performance==='UNDER'?'HARDER':'ON_TARGET'},context:sessionContext(program,session),comparable:true,confounded:false});
  }
  const target=week.sessions.find(s=>s.anchorId===fixture.targetAnchorId)??week.sessions[0];
  const review={version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,weekIndex,event:{id:'sim-event-'+weekIndex,kind:fixture.kind??'REVIEW'},eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:asOf.slice(0,10),pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...fixture.eligibility},observations,actualLedger,learningConsent:input.learningConsent===true,...(referenceState?{referenceState}:{}),...(model?{athleteModel:model}:{}),targetSessionId:target?.id??null,...clone(fixture.reviewOverrides??{})};
  if(reconciliation)review.reconciliation=reconciliation;
  const priorProgram=program,decision=evaluateProgram(program,review,options);actualLedger=decision.actualLedger??actualLedger;model=decision.updatedModel??model;referenceState=decision.referenceState??referenceState;
  if(decision.proposal)program=decision.proposal;
  rows.push({weekIndex,phase:week.phase,programBeforeHash:priorProgram.hash,programAfterHash:program.hash,plannedWeek:clone(week),review:clone(review),decision:clone(decision),actualCount:observations.length,sourceProgramBefore:priorProgram});
 }
 const summary={weeksExecuted:rows.length,sessionsPlanned:rows.reduce((n,r)=>n+r.plannedWeek.sessions.length,0),actualExecutions:actualLedger.length,decisions:Object.fromEntries([...new Set(rows.map(r=>r.decision.status))].map(k=>[k,rows.filter(r=>r.decision.status===k).length])),mutations:rows.filter(r=>r.decision.proposal).length,unsupportedWeeks:program.gaps.length,officialMutations:rows.filter(r=>hash(r.decision.officialPlanState)!==hash(r.decision.appliedState)).length,completedRewrites:rows.filter(r=>hash(r.decision.completedWork)!==hash(initial.program.completedWork)).length,maximumRunMinutes:Math.max(...program.weeks.map(w=>w.plannedRunMinutes)),populationOutcomePrediction:false};
 return freeze({status:'SIMULATED_SYNTHETIC_FIXTURES',initial,finalProgram:program,finalModel:model,actualLedger,rows,summary});
}
