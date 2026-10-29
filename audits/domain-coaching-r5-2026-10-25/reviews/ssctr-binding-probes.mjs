import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {generateProgram as rawGenerateProgram,baselinePrescriptionHash} from '../../../CoachingCore/src/r5-program.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r5-adaptation.mjs';
import {canonicalAthlete,bindFixtureAlternatives} from '../../../CoachingCore/r5/fixtures/canonical.mjs';
import {sessionContext} from '../../../CoachingCore/src/r5-review-context.mjs';
import {stimulusOf} from '../../../CoachingCore/src/r5-observation.mjs';
import {createLearningModel,updateLearningModel} from '../../../CoachingCore/src/r5-learning.mjs';
import {simulateProgram} from '../../../CoachingCore/src/r5-simulator.mjs';
import {clone,hash} from '../../../CoachingCore/src/value.mjs';
const base=new URL('../../../',import.meta.url),out=new URL('./ssctr-binding-probes.json',import.meta.url);
const generateProgram=input=>rawGenerateProgram(bindFixtureAlternatives(input));
function observation(p,w,performance='OVER',actualOverride=null){
 const s=p.weeks[w].sessions.find(s=>s.anchorId==='easy');
 return {eventId:`ssctr-${w}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+'T20:00:00Z',origin:'ACTUAL_EXECUTION',sourceHash:hash({s:s.id,performance}),plannedPrescriptionHash:hash(s.prescription),actual:actualOverride??{completed:true,minutes:s.prescription.durationMinutes,stimulus:stimulusOf(s.prescription)},response:{performance,recovery:'COMPATIBLE',effort:performance==='UNDER'?'HARDER':'EASIER'},context:sessionContext(p,s),comparable:true,confounded:false};
}
function review(p,performance='OVER',extra={}){
 const observations=[0,1,2].map(w=>observation(p,w,performance));
 return {version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-09T23:00:00Z',weekIndex:2,event:{id:'ssctr-review',kind:performance==='UNDER'?'UNDERPERFORMANCE':'OVERPERFORMANCE'},eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-11-09',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},observations,targetSessionId:observations.at(-1).sessionId,learningConsent:true,...extra};
}
function taskObservation(p,w,anchorId='strength-a',performance='OVER'){
 const s=p.weeks[w].sessions.find(s=>s.anchorId===anchorId),prescription=s.prescription,o=observation(p,w,performance);
 return {...o,eventId:`ssctr-${anchorId}-${w}`,sessionId:s.id,observedAt:s.date+'T20:00:00Z',sourceHash:hash({id:s.id,physical:stimulusOf(prescription),performance}),plannedPrescriptionHash:hash(prescription),context:sessionContext(p,s),actual:{completed:true,minutes:prescription.durationMinutes,stimulus:stimulusOf(prescription),...(prescription.modality==='STRENGTH'?{sets:prescription.exercises.reduce((n,e)=>n+e.sets,0),reps:prescription.exercises.reduce((n,e)=>n+e.sets*e.reps,0)}:{})}};
}
const rows=[];
const record=(id,expected,actual,passed,detail)=>rows.push({id,expected,actual,passed,detail});
const dose=(r,w=3)=>r.proposal?.weeks[w]?.sessions.find(s=>s.anchorId==='easy')?.prescription.durationMinutes;
{
 const i=canonicalAthlete();i.athlete.anchors.find(a=>a.id==='easy').alternatives[0].prescription.durationMinutes=25;
 const generated=generateProgram(i),p=generated.program,r=p?evaluateProgram(p,review(p)):generated;
 record('progress-direction','Reject lower-demand alternative mislabeled PROGRESS',r.action??r.status,r.action!=='PROGRESS'||dose(r)>30,{selectedMinutes:dose(r)});
}
{
 const i=canonicalAthlete();i.athlete.anchors.find(a=>a.id==='easy').alternatives.find(a=>a.purpose==='REGRESS').prescription.durationMinutes=120;
 const generated=generateProgram(i),p=generated.program,r=p?evaluateProgram(p,review(p,'UNDER')):generated;
 record('regression-direction','Reject higher-demand alternative mislabeled REGRESS',r.action??r.status,r.action!=='REGRESS'||dose(r)<30,{selectedMinutes:dose(r)});
}
{
 const i=canonicalAthlete();i.availability[0].windows[0].durationMinutes=30;
 const p=generateProgram(i).program,r=evaluateProgram(p,review(p));
 record('progression-window-fit','Future complete task must fit actual window',r.action,!r.proposal||dose(r)<=30,{selectedMinutes:dose(r),availableMinutes:30});
}
{
 const p=generateProgram(canonicalAthlete()).program,r=evaluateProgram(p,review(p,'OVER',{observations:[0,1,2].map(w=>observation(p,w,'OVER',{completed:true,minutes:1}))}));
 record('actual-dose-comparability','A one-minute actual cannot earn full thirty-minute task progression',r.action,r.action!=='PROGRESS',{selectedMinutes:dose(r),actualMinutes:1});
}
{
 const i=canonicalAthlete(),event=clone(i.athlete.anchors);event.find(a=>a.id==='easy').prescription.durationMinutes=20;event.forEach(a=>a.alternatives=[]);
 i.eventWeek={goalKind:i.athlete.goal.kind,eventDate:i.athlete.goal.eventDate,baselineHash:baselinePrescriptionHash(i.athlete.anchors),anchors:event,weeklyTolerance:clone(i.athlete.weeklyTolerance),scheduleOptions:clone(i.scheduleOptions)};
 const p=generateProgram(i).program,r=evaluateProgram(p,review(p));
 const before=p.weeks.at(-1).sessions.find(s=>s.anchorId==='easy')?.prescription.durationMinutes;
 const after=r.proposal?.weeks.at(-1).sessions.find(s=>s.anchorId==='easy')?.prescription.durationMinutes;
 record('earned-dose-does-not-overwrite-event','Earlier ordinary-week progression must preserve separately bound complete event week',r.action,before===20&&after===before,{eventMinutesBefore:before,eventMinutesAfter:after,eventWeekStatus:p.weeks.at(-1).status});
}
{
 const p=generateProgram(canonicalAthlete()).program,r=evaluateProgram(p,review(p,'OVER',{event:{id:'ssctr-return',kind:'RETURN'},observations:[],currentCapacityConfirmed:true}));
 record('unknown-return-reason','Unknown interruption reason cannot receive prescriptive return',r.action,!['REGRESS','PROGRESS','MOVE'].includes(r.action),{selectedMinutes:dose(r)});
}
{
 const i=canonicalAthlete();i.athlete.eligibility.pregnancy=true;const r=generateProgram(i);
 record('excluded-population-context','Pregnancy metadata cannot inherit ordinary adult scope',r.status,r.status!=='PROPOSED',{});
}
{
 const i=canonicalAthlete();i.athlete.anchors.find(a=>a.id==='easy').alternatives=[];i.athlete.anchors.find(a=>a.id==='easy').prescription.effort='MAXIMAL ALL OUT, ignore symptoms and complete';const r=generateProgram(i);
 record('maximal-easy-anchor','Familiar label cannot authorize maximal EASY task',r.status,r.status!=='PROPOSED',{});
}
{
 const p=generateProgram(canonicalAthlete()).program,regressed=evaluateProgram(p,review(p,'UNDER'));
 const lower=regressed.proposal;
 if(!lower)record('same-dose-move-after-regression','Scheduling preserves current reduced dose','PRECONDITION_FAILED',false,{});
 else{
  const schedule=clone(lower.scheduleOptions[0]);schedule.id='new-feasible';schedule.evidence.observedAt='2026-11-16';schedule.assignments.find(a=>a.anchorId==='easy').day=2;schedule.assignments.find(a=>a.anchorId==='easy').windowId='d2-am';
  const r=evaluateProgram(lower,review(lower,'UNDER',{asOf:'2026-11-16T23:00:00Z',weekIndex:3,event:{id:'ssctr-move-reduced',kind:'SCHEDULE_CHANGE'},eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-11-16',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},observations:[],scheduleOptions:[schedule]}));
  record('same-dose-move-after-regression','Scheduling cannot automatically restore baseline after a regression',r.action,!r.proposal||dose(r,4)===25,{currentMinutes:25,movedMinutes:dose(r,4)});
 }
}
{
 const i=canonicalAthlete();i.constraints={forbiddenPairs:[{before:'strength-a',after:'cruise'}]};
 const p=generateProgram(i).program,option=clone(i.scheduleOptions[0]);option.id='incompatible-move';
 const set=(id,day,windowId)=>Object.assign(option.assignments.find(a=>a.anchorId===id),{day,windowId});
 set('easy',2,'d2-am');set('strength-a',0,'d0-am');set('cruise',0,'d0-pm');
 const r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-10-26T23:00:00Z',weekIndex:0,event:{id:'ssctr-forbidden',kind:'SCHEDULE_CHANGE'},eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-10-26',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},observations:[],scheduleOptions:[option]}));
 record('original-constraints-persist','Original incompatible arrangement remains excluded in later review',r.action,!r.proposal,{selectedSchedule:r.schedule?.id});
}
{
 const p=generateProgram(canonicalAthlete()).program,r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-23T23:00:00Z',weekIndex:2,eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-11-23',pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false},observations:[]}));
 record('review-week-clock-consistency','A stale week index cannot mutate an already elapsed horizon',r.action,['ASK','HOLD','UNSUPPORTED'].includes(r.action),{});
}
{
 const i=canonicalAthlete();for(const a of i.athlete.anchors)a.alternatives=[];
 const a=i.athlete.anchors.find(a=>a.id==='strength-a');a.prescription.exercises[0].load={value:40,unit:'BODYWEIGHT',convention:'PER_HAND'};
 const r=generateProgram(i);
 record('unambiguous-strength-load-basis','Mutually inconsistent bodyweight/per-hand load units cannot be executed',r.status,r.status!=='PROPOSED',{});
}
{
 const p=generateProgram(canonicalAthlete()).program;
 const observations=[0,1,2].map(w=>{
  const s=p.weeks[w].sessions.find(s=>s.anchorId==='strength-a'),o=observation(p,w);
  const stimulus=stimulusOf(s.prescription);stimulus.exercises[0].load.value=1;
  return {...o,eventId:'ssctr-strength-'+w,sessionId:s.id,observedAt:s.date+'T20:00:00Z',sourceHash:hash({id:s.id,actualLoad:1}),plannedPrescriptionHash:hash(s.prescription),context:sessionContext(p,s),actual:{completed:true,minutes:s.prescription.durationMinutes,sets:6,reps:42,stimulus}};
 });
 const r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-10T23:00:00Z',observations,targetSessionId:observations.at(-1).sessionId}));
 record('strength-actual-load-comparability','Matching aggregate reps/sets at a different/unknown load cannot earn planned-load progression',r.action,r.action!=='PROGRESS',{selectedReps:r.proposal?.weeks[3]?.sessions.find(s=>s.anchorId==='strength-a')?.prescription.exercises[0].reps,actualLoadKg:1});
}
{
 const p=generateProgram(canonicalAthlete()).program,bad=[0,1,2].map(w=>observation(p,w,'OVER',{completed:true,minutes:1}));
 const model=updateLearningModel(createLearningModel({athleteId:p.athleteId,purposeAllowed:true,asOf:'2026-11-09T23:00:00Z'}),bad,{asOf:'2026-11-09T23:00:00Z'});
 const r=evaluateProgram(p,review(p,'OVER',{observations:[],athleteModel:model}));
 record('imported-model-actual-rebinding','A locally valid hash cannot authorize physically noncomparable model evidence',r.action,r.action==='HOLD',{modelRows:model.observations.length,errors:r.errors});
}
{
 const p=generateProgram(canonicalAthlete()).program,observations=[0,1,2].map(w=>taskObservation(p,w));
 const r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-10T23:00:00Z',observations,targetSessionId:observations.at(-1).sessionId}));
 const reps=r.proposal?.weeks[3].sessions.find(s=>s.anchorId==='strength-a').prescription.exercises[0].reps;
 record('complete-strength-positive-control','Complete comparable familiar strength actuals can earn the known smallest reps option',r.action,r.action==='PROGRESS'&&reps===7,{selectedReps:reps});
}
{
 const p=generateProgram(canonicalAthlete()).program,first=evaluateProgram(p,review(p)),next=first.proposal;
 if(!next)record('one-prospective-week-dose-budget','A second dose dimension cannot cascade into the same next week','PRECONDITION_FAILED',false,{});
 else{
  const observations=[0,1,2].map(w=>taskObservation(next,w));
  const second=evaluateProgram(next,review(next,'OVER',{asOf:'2026-11-10T23:00:00Z',observations,targetSessionId:observations.at(-1).sessionId,athleteModel:first.updatedModel,event:{id:'ssctr-second-dimension',kind:'OVERPERFORMANCE'}}));
  record('one-prospective-week-dose-budget','A second dose dimension cannot cascade into the same next week',second.action,first.action==='PROGRESS'&&second.action==='KEEP',{firstAction:first.action,secondReason:second.reason});
 }
}
{
 const p=generateProgram(canonicalAthlete()).program,observations=[0,1,2].map(w=>taskObservation(p,w,'cruise'));
 for(const o of observations)o.actual.stimulus.work.repetitions=1;
 const r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-12T23:00:00Z',observations,targetSessionId:observations.at(-1).sessionId}));
 record('hard-run-work-comparability','Matching total minutes with different hard repetitions cannot establish planned-task tolerance',r.action,r.updatedModel?.observations.length===0,{acceptedModelRows:r.updatedModel?.observations.length,actualWorkRepetitions:1});
}
{
 const i=canonicalAthlete();delete i.athlete.anchors[0].alternatives[0].weeklyContext;
 const r=rawGenerateProgram(i);
 record('alternative-combined-context-required','A session-only familiar alternative cannot establish combined-week dose admissibility',r.status,r.status==='INVALID_INPUT',{errors:r.errors});
}
{
 const p=generateProgram(canonicalAthlete()).program,observations=[0,1,2].map(w=>observation(p,w));
 const r=evaluateProgram(p,review(p,'OVER',{observations,eligibility:{status:'NONCLINICAL_CONFIRMED',assessedAt:'2026-11-09',pain:true,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false}}));
 record('clinical-observation-not-tolerance-learning','Clinical context cannot add prescriptive tolerance evidence',r.action,r.action==='CLINICAL_HUMAN_REQUIRED'&&r.updatedModel?.observations.length===0,{modelRows:r.updatedModel?.observations.length});
}
{
 const i=canonicalAthlete(),a=i.athlete.anchors.find(a=>a.id==='cruise');a.prescription.durationMinutes=50;
 const alt=(id,minutes)=>({id,purpose:'PROGRESS',prescription:{...clone(a.prescription),work:{...clone(a.prescription.work),workMinutes:minutes}},familiar:true,tolerated:true,observedAt:'2026-10-25'});
 a.alternatives=[alt('larger-8',8),alt('smaller-7',7)];
 const generated=generateProgram(i),p=generated.program;
 if(!p)record('minimum-work-magnitude','Compare actual work-minute deltas inside one physical dimension','PRECONDITION_FAILED',false,{status:generated.status,errors:generated.errors});
 else{
  const observations=[0,1,2].map(w=>taskObservation(p,w,'cruise')),r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-12T23:00:00Z',observations,targetSessionId:observations.at(-1).sessionId}));
  const selected=r.proposal?.weeks[3].sessions.find(s=>s.anchorId==='cruise')?.prescription.work.workMinutes;
  record('minimum-work-magnitude','Compare actual work-minute deltas inside one physical dimension',r.action,r.action==='PROGRESS'&&selected===7,{selectedWorkMinutes:selected,alternativeOrder:[8,7]});
 }
}
{
 const p=generateProgram(canonicalAthlete()).program,option=clone(p.scheduleOptions[0]);option.id='other-possible-date';option.assignments.find(a=>a.anchorId==='long').day=5;option.assignments.find(a=>a.anchorId==='long').windowId='d5-am';
 const r=evaluateProgram(p,review(p,'OVER',{observations:[],event:{id:'ssctr-missed-alone',kind:'MISSED_ESSENTIAL'},scheduleOptions:[option]}));
 record('missed-essential-alone-stability','A missed essential plus a feasible alternative alone does not require moving the next adequate stimulus',r.action,r.action==='DISCARD'||r.action==='KEEP',{});
}
const reconciliation=(p,w,observedAt)=>({source:'CURRENT_SELF_REPORT',ordinaryFunction:'COMPATIBLE',recovery:'COMPATIBLE',observedAt,prescriptionHashes:p.weeks[w].sessions.map(s=>hash(s.prescription))});
const freshEligibility=day=>({status:'NONCLINICAL_CONFIRMED',assessedAt:day,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
{
 const p=generateProgram(canonicalAthlete()).program;
 const first=evaluateProgram(p,review(p,'OVER',{observations:[],eligibility:{...freshEligibility('2026-11-09'),pain:true}}));
 const r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-16T23:00:00Z',weekIndex:3,observations:[],event:{id:'ssctr-clinical-sticky',kind:'RECOVERED'},eligibility:freshEligibility('2026-11-16'),referenceState:first.referenceState,reconciliation:reconciliation(p,3,'2026-11-16T22:00:00Z')}));
 record('pending-clinical-never-clears','Generic normal task/function reconciliation cannot clear a clinical dependency',r.action,r.action==='CLINICAL_HUMAN_REQUIRED',{});
}
{
 const p=generateProgram(canonicalAthlete()).program;
 const first=evaluateProgram(p,review(p,'OVER',{observations:[],event:{id:'ssctr-unknown-pause',kind:'RETURN'},currentCapacityConfirmed:true}));
 const r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-16T23:00:00Z',weekIndex:3,observations:[],event:{id:'ssctr-return-recovered',kind:'RECOVERED'},eligibility:freshEligibility('2026-11-16'),referenceState:first.referenceState,reconciliation:reconciliation(p,3,'2026-11-16T22:00:00Z')}));
 record('unknown-return-not-generically-reconciled','Recovery compatibility cannot erase unknown interruption reason or missing re-establishment evidence',r.action,first.action==='ASK'&&['ASK','HOLD','UNSUPPORTED','CLINICAL_HUMAN_REQUIRED'].includes(r.action),{initial:first.action,reason:r.reason});
}
{
 const p=generateProgram(canonicalAthlete()).program;
 const first=evaluateProgram(p,review(p,'OVER',{observations:[],event:{id:'ssctr-systemic-pending',kind:'SYSTEMIC_FATIGUE'}}));
 const r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-16T23:00:00Z',weekIndex:3,observations:[],event:{id:'ssctr-nonclinical-recovered',kind:'RECOVERED'},eligibility:freshEligibility('2026-11-16'),referenceState:first.referenceState,reconciliation:reconciliation(p,3,'2026-11-16T22:00:00Z')}));
 record('current-combined-nonclinical-reconciliation','Current complete task/function/recovery evidence can resume bounded familiar nonclinical scope',r.action,first.action==='ASK'&&r.action==='KEEP'&&r.planValidity?.status==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE',{initial:first.action});
}
{
 const sim=simulateProgram(canonicalAthlete('GENERAL_FITNESS',4),[{weekIndex:0,eligibility:{pain:true}},{weekIndex:1,reconciledBeforeExecution:true}]);
 record('simulator-clinical-state-no-auto-execution','A generic reconciliation fixture cannot make the simulator execute a clinically suspended proposal',sim.rows[1].decision.action,sim.rows[0].decision.action==='CLINICAL_HUMAN_REQUIRED'&&sim.rows[1].actualCount===0,{firstAction:sim.rows[0].decision.action,nextActualCount:sim.rows[1].actualCount});
}
{
 const p=generateProgram(canonicalAthlete()).program;
 const first=evaluateProgram(p,review(p,'OVER',{observations:[],eligibility:{...freshEligibility('2026-11-09'),pain:true}}));
 const r=evaluateProgram(p,review(p,'OVER',{asOf:'2026-11-16T23:00:00Z',weekIndex:3,observations:[observation(p,3)],event:{id:'ssctr-sticky-clinical-learning',kind:'REVIEW'},eligibility:freshEligibility('2026-11-16'),referenceState:first.referenceState}));
 record('prior-clinical-dependency-not-tolerance-learning','New actual facts under unresolved clinical validity cannot add prescriptive tolerance evidence',r.action,r.action==='CLINICAL_HUMAN_REQUIRED'&&r.updatedModel?.observations.length===0,{modelRows:r.updatedModel?.observations.length});
}
const reviewed=fs.readdirSync(new URL('../../../CoachingCore/src/',import.meta.url)).filter(n=>/^r5-.*\.mjs$/.test(n)).map(n=>'CoachingCore/src/'+n);
const result={revision:'R5-SSCTR-PROBES-r4',date:'2026-10-26',independent:true,total:rows.length,passing:rows.filter(r=>r.passed).length,passed:rows.every(r=>r.passed),rows,reviewedFiles:reviewed.map(path=>({path,sha256:createHash('sha256').update(fs.readFileSync(new URL(path,base))).digest('hex')}))};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
