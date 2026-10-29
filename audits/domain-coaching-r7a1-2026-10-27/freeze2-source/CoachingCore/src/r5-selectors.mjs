import {clone,hash} from './value.mjs';
import {changedDimensions,doseDirection,daysBetween,validatePrescription,anchorConfigurationHash} from './r5-contract.mjs';
import {scheduleCandidates,chooseSchedule} from './r5-schedule.mjs';
import {evidenceFor,preferredArrangement} from './r5-learning.mjs';
import {sessionContext} from './r5-review-context.mjs';

const counter=(action,admissible,reason,extra={})=>({action,admissible,reason,goalContribution:'Context-dependent; no universal numeric score',protectedStimulus:'Current essential run and strength intent',futureImpact:'Preserve next key stimulus and subsequent phase unless explicitly scoped',disruption:action==='KEEP'?'NONE':action==='PROGRESS'||action==='REGRESS'?'ONE_FUTURE_DOSE':'SCOPED',reversible:true,...extra});
function selectAlternative(anchor,purpose,asOf,configuration){
 const alternatives=(anchor?.alternatives??[]).filter(a=>a.purpose===purpose&&a.familiar===true&&a.tolerated===true&&daysBetween(a.observedAt,asOf)>=0&&daysBetween(a.observedAt,asOf)<=28&&!validatePrescription(a.prescription).length&&a.weeklyContext?.baselineHash===anchorConfigurationHash(configuration)&&a.weeklyContext?.proposedHash===anchorConfigurationHash(configuration.map(x=>x.id===anchor.id?{...x,prescription:a.prescription}:x))&&a.weeklyContext.recovery==='COMPATIBLE');
 const single=alternatives.filter(a=>changedDimensions(anchor.prescription,a.prescription).length===1&&doseDirection(anchor.prescription,a.prescription)===purpose);
 const magnitude=(p,dimension)=>dimension==='DURATION'?Math.abs(p.durationMinutes-anchor.prescription.durationMinutes):dimension==='WORK_REPETITIONS'?Math.abs(p.work.repetitions-anchor.prescription.work.repetitions):dimension==='WORK_WORKMINUTES'?Math.abs(p.work.workMinutes-anchor.prescription.work.workMinutes):p.exercises.reduce((sum,e,i)=>sum+Math.abs(dimension==='LOAD'?e.load.value-anchor.prescription.exercises[i].load.value:e[dimension.toLowerCase()]-anchor.prescription.exercises[i][dimension.toLowerCase()]),0);
 // Compare magnitude only within an identical physical dimension; never sum unlike dimensions for a global score.
 const first=single[0],dimension=first&&changedDimensions(anchor.prescription,first.prescription)[0];
 return first?[...single.filter(a=>changedDimensions(anchor.prescription,a.prescription)[0]===dimension)].sort((a,b)=>magnitude(a.prescription,dimension)-magnitude(b.prescription,dimension))[0]:null;
}
export function selectProgramAction(program,review,prepared){
 const week=program.weeks[review.weekIndex],kind=review.event.kind,all=program.weeks.flatMap(w=>w.sessions),target=all.find(s=>s.id===review.targetSessionId),next=program.weeks[review.weekIndex+1];
 const keep=counter('KEEP',true,'The supplied plan remains adequate; no material necessity for mutation');
 const result=(action,reason,extra={})=>({...extra,action,reason,counterfactuals:[keep,...(extra.counterfactuals??[])]});
 const futureProtected=next&&['EVENT','REVIEW'].includes(next.phase)||week.phase==='EVENT';
 if(kind==='GOAL_CHANGE')return result('ASK','A changed goal needs a newly validated horizon and program proposal; do not silently change priority',{missingInputs:['newProgramInput'],counterfactuals:[counter('PARTIAL_REPLAN',false,'New goal/date and current anchors must be supplied as a complete proposal')]});
 if(kind==='MISSED_OPTIONAL')return result('DISCARD','Discard the missed optional exposure; no load debt and no compensatory training');
 if(kind==='MISSED_ESSENTIAL'&&!review.availability&&!review.forbiddenPairs?.length)return result('DISCARD','A missed essential workout alone does not make the next planned key session inadequate. Preserve the future trajectory without debt or unnecessary movement',{counterfactuals:[counter('MOVE',false,'A feasible alternate date does not establish a need to move the next valid stimulus')]});
 if(kind==='MISSED_ESSENTIAL'&&!review.scheduleOptions)return result('DISCARD','Do not compress missed essential work or create load debt; preserve the next future key session and review the remaining block',{counterfactuals:[counter('MOVE',false,'No complete current admissible same-dose arrangement supplied'),counter('PARTIAL_REPLAN',false,'A larger change has no demonstrated advantage over preserving the next horizon')],nextObservation:'Check whether remaining block intent is still achievable; request revised horizon if repeated essential losses accumulate'});
 if(kind==='RETURN'){
  if(review.interruption?.clinicalReason===true)return result('CLINICAL_HUMAN_REQUIRED','Clinical interruption requires qualified human return assessment');
  if(review.currentCapacityConfirmed!==true||review.interruption?.reason!=='NONCLINICAL_SCHEDULE_BREAK'||review.interruption?.clinicalReason!==false)return result('ASK','Nonclinical interruption still requires known nonclinical reason, current capacity and compatible task evidence; historical maxima do not restore automatically',{missingInputs:['interruption.nonclinicalReason','currentCapacityConfirmed','currentCompatiblePrescription']});
  const anchor=program.anchors.find(a=>a.id===target?.anchorId),alt=selectAlternative(anchor,'REGRESS',review.asOf,program.anchors);
  if(!target||!alt)return result('UNSUPPORTED','Current re-establishment recipe is not independently bound; no automatic restoration');
  const demonstration=review.currentDemonstration;
  if(!['EASY','WALK_JOG'].includes(alt.prescription.family)||alt.prescription.durationMinutes>15||demonstration?.current!==true||demonstration.response!=='COMPATIBLE'||demonstration.ordinaryFunction!=='COMPATIBLE'||hash(demonstration.prescription??null)!==hash(alt.prescription)||daysBetween(demonstration.observedAt,review.asOf)<0||daysBetween(demonstration.observedAt,review.asOf)>1)return result('ASK','Return requires a current compatible bounded easy re-establishment demonstration and ordinary function; a generic regression is insufficient',{missingInputs:['currentCompatibleBoundedReestablishmentTask']});
  return result('REGRESS','Use the familiar lower-demand current-capacity alternative for re-establishment; reassess actual recovery',{anchorId:anchor.id,prescription:alt.prescription,alternativeId:alt.id,fromWeek:review.weekIndex+1,counterfactuals:[counter('REGRESS',true,'Familiar compatible lower dose; no debt restoration') ]});
 }
 const scheduling=['SCHEDULE_CHANGE','TRAVEL','DOUBLE_INFEASIBLE','SESSION_MOVED','CONFLICT','MISSED_ESSENTIAL','EQUIPMENT_CHANGE'].includes(kind);
 if(scheduling){
  const availability=review.availability??program.availability,options=review.scheduleOptions??program.scheduleOptions;
  const currentAnchors=next?.sessions.map(s=>({...program.anchors.find(a=>a.id===s.anchorId),prescription:s.prescription}))??program.anchors;
  const candidates=scheduleCandidates(currentAnchors,availability,options,review.asOf,{allowOmissions:true,forbiddenPairs:[...(program.constraints?.forbiddenPairs??[]),...(review.forbiddenPairs??[])]});
  const ranking=chooseSchedule(candidates,program.goal.priority),current=candidates.find(c=>c.id===program.selectedScheduleId&&c.admissible);
  const counterfactuals=candidates.map(c=>counter(c.omitted.length?'PARTIAL_REPLAN':'MOVE',c.admissible,c.reasons.join('; ')||'Same-dose configuration is feasible and has compatible combined response',{id:c.id,preservesRun:c.preservesRun,preservesStrength:c.preservesStrength,omitted:c.omitted}));
  if(current&&current.preservesRun&&current.preservesStrength&&kind!=='MISSED_ESSENTIAL')return result('KEEP','Current arrangement remains feasible and adequate; priority creates no necessity',{counterfactuals,ranking});
  if(!ranking.selected)return result(ranking.tiedIds.length?'ASK':'UNSUPPORTED',ranking.reason,{missingInputs:ranking.tiedIds.length?['temporaryTradeOffPreference']:[],counterfactuals,ranking});
  if(futureProtected&&ranking.selected.omitted.some(id=>program.anchors.find(a=>a.id===id)?.essential))return result('ASK','Event horizon makes essential-work loss material; a complete baseline-relative event proposal is required',{missingInputs:['eventWeekConfiguration'],counterfactuals,ranking});
  return result(ranking.selected.omitted.length?'PARTIAL_REPLAN':'MOVE',ranking.reason,{schedule:ranking.selected,availability,fromWeek:review.weekIndex+1,throughWeek:review.weekIndex+1,counterfactuals,ranking});
 }
 if(kind==='LOCAL_FATIGUE'||kind==='SYSTEMIC_FATIGUE'){
  const affected=review.affectedSessionIds??(target?[target.id]:[]);
  const optional=week.sessions.filter(s=>s.optional&&(kind==='SYSTEMIC_FATIGUE'||affected.includes(s.id))&&Date.parse(s.date+'T23:59:59Z')>=Date.parse(review.asOf)&&!prepared.actualLedger.some(o=>o.sessionId===s.id));
  if(optional.length)return result('REDUCE','Remove only uncompleted optional work affected by the current fatigue signal; preserve protected stimuli',{removeSessionIds:optional.map(s=>s.id),fromWeek:review.weekIndex,throughWeek:review.weekIndex,counterfactuals:[counter('REDUCE',true,'Optional-only suffix reduction is the smallest effective change'),counter('BLOCK_ADJUSTMENT',false,'No evidence that wider replan is necessary')]});
  if(kind==='SYSTEMIC_FATIGUE')return result('ASK','No covered optional reduction can restore the session; reconcile current performance, recovery and compatible reduced task rather than continue hard work',{missingInputs:['currentCompatibleReducedTask'],counterfactuals:[counter('KEEP',false,'Current systemic fatigue concern cannot justify further hard work')]});
  return result('KEEP','No affected uncompleted optional work; monitor current function rather than infer systemic incapacity');
 }
 if(kind==='EVENT_NEAR'||futureProtected)return result('KEEP','Protect event/next key horizon; no new overload or catch-up session. Missing event configuration remains explicitly unsupported');
 if(!target)return result('KEEP','No targeted material inadequacy; retain the valid programme and collect actual response');
 const context=sessionContext(program,target),evidence=evidenceFor(prepared.model,context,{asOf:review.asOf}),originalAnchor=program.anchors.find(a=>a.id===target.anchorId),anchor=originalAnchor?{...originalAnchor,prescription:target.prescription}:null;
 const repeated=evidence.confidence==='EMERGING'||evidence.confidence==='STRONG';
 const adverse=repeated&&evidence.direction==='ADVERSE';
 const earned=repeated&&evidence.direction==='COMPATIBLE'&&evidence.responseSummary.over>=3&&evidence.responseSummary.easier>=3;
 const configuration=week.sessions.map(s=>({...program.anchors.find(a=>a.id===s.anchorId),prescription:s.prescription}));
 const purpose=adverse?'REGRESS':earned?'PROGRESS':null,alt=purpose&&selectAlternative(anchor,purpose,review.asOf,configuration);
 if(review.scheduleOptions&&next){
  const currentAnchors=next.sessions.map(s=>({...program.anchors.find(a=>a.id===s.anchorId),prescription:s.prescription}));
  const candidates=scheduleCandidates(currentAnchors,program.availability,review.scheduleOptions,review.asOf,{forbiddenPairs:program.constraints?.forbiddenPairs??[]}),opts=candidates.map(c=>({id:c.id,admissible:c.admissible,arrangement:c.id}));
  const soft=preferredArrangement(prepared.model,opts,context,{asOf:review.asOf}),selected=candidates.find(c=>c.id===soft.preferredId);
  if(selected&&selected.id!==(next.sessions[0]?.arrangement??program.selectedScheduleId))return result('MOVE','Strong comparable athlete-specific association changes future same-dose scheduling preference; causal effect remains unknown',{schedule:selected,availability:program.availability,fromWeek:review.weekIndex+1,throughWeek:review.weekIndex+1,athleteEvidence:soft,counterfactuals:candidates.map(c=>counter('MOVE',c.admissible,'Independently feasible same-dose schedule',{id:c.id}))});
 }
 if(purpose&&alt&&next){
  if(program.decisions.some(d=>['PROGRESS','REGRESS'].includes(d.action)&&d.fromWeek===review.weekIndex+1))return result('KEEP','One prospective dose dimension is already changed for this next horizon; observe and reconcile the combined response before another change',{athleteEvidence:evidence});
  return result(purpose,purpose==='REGRESS'?'Repeated comparable actual mismatch favors a familiar minimum regression before a wider block adjustment':'Repeated comparable overperformance and recovery earn one familiar dose dimension at the next horizon',{anchorId:anchor.id,prescription:alt.prescription,alternativeId:alt.id,fromWeek:review.weekIndex+1,throughWeek:program.weeks.length-1,athleteEvidence:evidence,counterfactuals:[counter(purpose,true,'Current known single-dimension alternative; subsequent dose remains conditional'),counter('BLOCK_ADJUSTMENT',false,'Wider change is not yet necessary') ]});
 }
 if(purpose&&!alt)return result('ASK','Individual evidence suggests a dose review, but no current familiar complete alternative is admissible',{athleteEvidence:evidence,missingInputs:['currentFamiliarDoseAlternative'],counterfactuals:[counter(purpose,false,'No current alternative can be authorized by an association alone')]});
 return result('KEEP','Current evidence does not justify a stronger intervention; preserve the population prior, adequate week and next observation',{athleteEvidence:evidence,counterfactuals:[counter('PROGRESS',false,'Repeated comparable surplus/known dose or phase context not established'),counter('REGRESS',false,'Recurring comparable mismatch not established')]});
}
