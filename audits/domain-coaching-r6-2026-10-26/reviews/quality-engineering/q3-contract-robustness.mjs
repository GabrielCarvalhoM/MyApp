// QRE probe Q3: contract robustness of R6-INTAKE-1 and R6-REVIEW-1 under malformed, missing, contradictory and
// out-of-range fields. Expectation per brief: never throw; never yield a prescription; INVALID_INPUT/ASK/HOLD/UNSUPPORTED.
// Authority: REAL r6Authority(). Every case is recorded with threw/status/proposal.
import {R6,hash,baseIntake,review,obsFor,sessionsOf,write,safe,elig,addDays} from './qlib.mjs';

const BAD=[undefined,null,'','abc',-1,0,1.5,1e9,-1e9,Infinity,NaN,true,false,[],[1,'x'],{},{a:1},'2026-13-45','2026-02-30','  '];
const setPath=(obj,path,value)=>{const o=structuredClone(obj);const keys=path.split('.');let cur=o;for(let i=0;i<keys.length-1;i++){if(cur[keys[i]]===null||typeof cur[keys[i]]!=='object')cur[keys[i]]={};cur=cur[keys[i]];}if(value===undefined)delete cur[keys.at(-1)];else cur[keys.at(-1)]=value;return o;};
const label=v=>v===undefined?'undefined':Number.isNaN(v)?'NaN':v===Infinity?'Infinity':JSON.stringify(v);
const rows=[];
// ---------- intake ----------
const HM=baseIntake({id:'q-hm',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:'2027-02-14'}},strength:'RUNNING_SUPPORT'},
 knownRuns:[{prescription:{modality:'RUN',family:'THRESHOLD',durationMinutes:40,warmupMinutes:10,cooldownMinutes:5,work:{repetitions:3,workMinutes:5,recoveryMinutes:2}},current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'}],
 wearableCapabilities:{provider:'W',activityAvailable:true,heartRateAvailable:true,exerciseIdentityAvailable:true,setsRepsLoadAvailable:true,subjectiveEffortAvailable:false,completeness:'FULL',historyWeeks:4},
 pause:{nonclinical:true,weeks:1,reasonCategory:'TRAVEL'}},
 history:[{activityId:'h1',provider:'W',sport:'RUN',startedAt:'2026-10-25T07:00:00-03:00',durationMinutes:50},{activityId:'h2',provider:'W',sport:'STRENGTH',startedAt:'2026-10-26T18:00:00-03:00',durationMinutes:40,exercises:[{id:'goblet-squat',sets:3,reps:8,loadKg:20,rir:2}]}]});
const baseGen=R6.generateProgram(HM);
if(baseGen.status!=='PROPOSED')throw new Error('Base intake not PROPOSED: '+baseGen.reason+JSON.stringify(baseGen.errors??baseGen.missingInputs));
const INTAKE_PATHS=['version','synthetic','purpose','asOf','startDate','weeks','timezoneOffsetMinutes','learningConsent','athlete','athlete.id','athlete.ageEligible','athlete.ageYears','athlete.eligibility','athlete.eligibility.status','athlete.eligibility.assessedAt','athlete.eligibility.pain','athlete.goals','athlete.goals.run','athlete.goals.run.kind','athlete.goals.run.event','athlete.goals.run.event.kind','athlete.goals.run.event.date','athlete.goals.run.event.timeGoalMinutes','athlete.goals.strength','athlete.event','athlete.runExperience','athlete.strengthExperience','athlete.recent','athlete.recent.runDaysPerWeek','athlete.recent.runMinutesPerWeek','athlete.recent.longestRunMinutes','athlete.recent.strengthDaysPerWeek','athlete.performanceAnchors','athlete.knownRuns','athlete.knownRuns.0','athlete.knownRuns.0.prescription','athlete.knownRuns.0.prescription.durationMinutes','athlete.knownRuns.0.prescription.family','athlete.knownRuns.0.prescription.work','athlete.knownRuns.0.prescription.work.repetitions','athlete.knownRuns.0.prescription.work.workMinutes','athlete.knownRuns.0.observedAt','athlete.knownExercises','athlete.knownExercises.0','athlete.knownExercises.0.id','athlete.knownExercises.0.sets','athlete.knownExercises.0.reps','athlete.knownExercises.0.load','athlete.knownExercises.0.load.value','athlete.knownExercises.0.load.convention','athlete.knownExercises.0.rir','athlete.knownExercises.0.observedAt','athlete.equipment','athlete.strengthPreferences','athlete.strengthPreferences.emphasis','athlete.strengthPreferences.movementPriorities','athlete.strengthPreferences.rotation','athlete.sex','athlete.heightCm','athlete.weightKg','athlete.specialPopulation','athlete.wearableCapabilities','athlete.wearableCapabilities.historyWeeks','athlete.wearableCapabilities.completeness','athlete.pause','athlete.pause.weeks','athlete.pause.reasonCategory','athlete.pause.reason','athlete.pause.nonclinical','schedule','schedule.runDays','schedule.strengthDays','schedule.runTurn','schedule.strengthTurn','schedule.runMinutes','schedule.strengthMinutes','schedule.longRunDay','schedule.longRunMinutes','schedule.sameTurnConfirmed','schedule.temporaryPreference','history','history.0','history.0.startedAt','history.0.durationMinutes','history.0.sport','history.1.exercises','history.1.exercises.0','history.1.exercises.0.loadKg','history.1.exercises.0.sets','history.1.exercises.0.reps'];
const DOSE_IRRELEVANT=new Set(['athlete.performanceAnchors','athlete.sex','athlete.heightCm','athlete.weightKg','learningConsent','athlete.goals.run.event.timeGoalMinutes','schedule.sameTurnConfirmed','schedule.runTurn','schedule.strengthTurn','schedule.temporaryPreference','athlete.strengthPreferences.rotation','athlete.wearableCapabilities.completeness','athlete.pause.reason','athlete.pause.nonclinical']);
for(const p of INTAKE_PATHS)for(const v of BAD){
 const input=setPath(HM,p.replace(/\.(\d+)/g,'.$1'),v);
 const r=safe(()=>R6.generateProgram(input));
 rows.push({contract:'R6-INTAKE-1',path:p,value:label(v),threw:!r.ok,error:r.ok?null:r.error,status:r.ok?r.value.status:null,prescription:r.ok&&!!r.value.program,doseIrrelevant:DOSE_IRRELEVANT.has(p),errors:r.ok?r.value.errors:null,missing:r.ok?r.value.missingInputs:null});
}
// Targeted contradictory/out-of-range intakes.
const C=(name,mut)=>{const input=structuredClone(HM);mut(input);const r=safe(()=>R6.generateProgram(input));rows.push({contract:'R6-INTAKE-1',path:'CONTRADICTION:'+name,value:null,threw:!r.ok,error:r.ok?null:r.error,status:r.ok?r.value.status:null,prescription:r.ok&&!!r.value.program,errors:r.ok?r.value.errors:null,week1:r.ok&&r.value.program?r.value.program.weeks[0].plannedRunMinutes:null});};
C('longRunMinutesBelowRunMinutes',i=>{i.schedule.longRunMinutes=20;i.schedule.runMinutes=60;});
C('longestRunAboveWeekly',i=>{i.athlete.recent={runDaysPerWeek:3,runMinutesPerWeek:60,longestRunMinutes:150};});
C('zeroDaysButMinutes',i=>{i.athlete.recent={runDaysPerWeek:0,runMinutesPerWeek:200,longestRunMinutes:60};});
C('experienceNoneButHighVolume',i=>{i.athlete.runExperience='NONE';i.athlete.recent={runDaysPerWeek:5,runMinutesPerWeek:300,longestRunMinutes:90};});
C('duplicateKnownExerciseDifferentLoads',i=>{i.athlete.knownExercises=[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'},{id:'back-squat',sets:3,reps:5,load:{value:160,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-20'}];});
C('knownExerciseFutureObservedAt',i=>{i.athlete.knownExercises[0].observedAt='2026-12-01';});
C('eventBeforeStart',i=>{i.athlete.goals.run.event.date='2026-10-01';});
C('eventAfterHorizon',i=>{i.athlete.goals.run.event.date='2027-06-01';});
C('nonclinicalStatusWithInjuryFlag',i=>{i.athlete.eligibility.injury=true;});
C('ageEligibleTrueAgeYears15',i=>{i.athlete.ageYears=15;});
C('ageEligibleFalseAgeYears30',i=>{i.athlete.ageEligible=false;i.athlete.ageYears=30;});
C('eligibilityAssessedFuture',i=>{i.athlete.eligibility.assessedAt='2026-11-20';});
C('eligibilityAssessedTimestampOtherDay',i=>{i.athlete.eligibility.assessedAt='2026-11-01T23:30:00-03:00';});
C('pauseNonclinicalTrueClinicalCategory',i=>{i.athlete.pause={nonclinical:true,weeks:6,reasonCategory:'INJURY'};});
C('pauseCategoryWorkTextInjury',i=>{i.athlete.pause={nonclinical:true,weeks:6,reasonCategory:'WORK',reason:'work, and I also sprained my ankle'};});
C('pauseFreeTextOnly',i=>{i.athlete.pause={nonclinical:true,weeks:6,reason:'work travel'};});
C('historyFutureActivity',i=>{i.history.push({activityId:'hf',provider:'W',sport:'RUN',startedAt:'2026-11-05T07:00:00-03:00',durationMinutes:200});});
C('historyHugeDuration',i=>{i.history.push({activityId:'hx',provider:'W',sport:'RUN',startedAt:'2026-10-27T07:00:00-03:00',durationMinutes:599});});
C('historySameActivityTwoIds',i=>{i.history.push({activityId:'h1b',provider:'W',sport:'RUN',startedAt:'2026-10-25T07:00:00-03:00',durationMinutes:50});});
C('timezoneOffsetFraction',i=>{i.timezoneOffsetMinutes=90.5;});
C('runDaysUnsortedDupes',i=>{i.schedule.runDays=[6,1,1];});
C('strengthDaysEmptyWithStrengthGoal',i=>{i.schedule.strengthDays=[];});
C('weeksString',i=>{i.weeks='16';});
C('bigint',i=>{i.athlete.recent.runMinutesPerWeek=120n;});
C('functionValue',i=>{i.athlete.sex=()=>1;});
C('cyclic',i=>{i.athlete.self=i.athlete;});

// ---------- review ----------
const program=baseGen.program;
const w=2,wk=program.weeks[w];
const pastRuns=sessionsOf(program).filter(s=>s.weekIndex===w&&s.prescription&&s.date<=addDays(wk.startDate,3));
const goodObs=pastRuns.map(s=>obsFor(program,s));
const RV=review(program,w,{day:3,observations:goodObs,targetSessionId:pastRuns[0]?.id});
const base=R6.evaluateProgram(program,RV);
const REVIEW_PATHS=['version','synthetic','purpose','asOf','weekIndex','event','event.id','event.kind','eligibility','eligibility.status','eligibility.assessedAt','eligibility.pain','eligibility.injury','observations','observations.0','observations.0.eventId','observations.0.sessionId','observations.0.observedAt','observations.0.occurrenceDate','observations.0.reportedAt','observations.0.correctionOf','observations.0.actual','observations.0.actual.completed','observations.0.actual.minutes','observations.0.actual.exercises','observations.0.response','observations.0.response.performance','observations.0.response.recovery','observations.0.source','observations.0.athleteId','observations.0.comparable','observations.0.confounded','targetSessionId','learningConsent','actualLedger','athleteModel','referenceState','officialPlanState','signals','signals.region'];
for(const p of REVIEW_PATHS)for(const v of BAD){
 const rv=setPath(RV,p,v);const r=safe(()=>R6.evaluateProgram(program,rv));
 rows.push({contract:'R6-REVIEW-1',kind:'WEEKLY_REVIEW',path:p,value:label(v),threw:!r.ok,error:r.ok?null:r.error,status:r.ok?r.value.status:null,prescription:r.ok&&!!r.value.proposal,action:r.ok?r.value.action:null,reason:r.ok?r.value.reason:null});
}
// Kind-specific payloads.
const KIND_PAYLOADS={
 SCHEDULE_CHANGE:['changes','changes.runDays','changes.strengthDays','changes.runMinutes','changes.strengthMinutes','changes.longRunDay','changes.longRunMinutes','changes.runTurn','changes.temporaryPreference'],
 UNAVAILABLE_DAY:['changes','changes.unavailableDates'],
 EQUIPMENT_CHANGE:['changes','changes.equipment','changes.from','changes.to'],
 GOAL_CHANGE:['changes','changes.goals','changes.goals.run','changes.goals.strength','changes.event','changes.event.kind','changes.event.date'],
 EVENT_DATE_CHANGE:['changes','changes.eventDate'],
 RETURN_AFTER_PAUSE:['interruption','interruption.days','interruption.startDate','interruption.endDate','interruption.reasonCategory','interruption.reason','interruption.nonclinical','interruption.clinicalReason','currentDemonstration','currentDemonstration.minutes','currentDemonstration.observedAt'],
 LOCAL_FATIGUE:['signals','signals.region'],
 MISSED_SESSION:['targetSessionId'],
 DOUBLE_CONFLICT:['changes','changes.runTurn'],
 EVENT_WEEK_CONFLICT:['changes','changes.unavailableDates']
};
const VALID={SCHEDULE_CHANGE:{changes:{runDays:[1,3,5],strengthDays:[0,4],longRunDay:5}},UNAVAILABLE_DAY:{changes:{unavailableDates:[addDays(wk.startDate,5)]}},EQUIPMENT_CHANGE:{changes:{equipment:['BODYWEIGHT','BANDS'],from:addDays(wk.startDate,4),to:addDays(wk.startDate,20)}},GOAL_CHANGE:{changes:{event:{kind:'10K',date:addDays(program.startDate,70)}}},EVENT_DATE_CHANGE:{changes:{eventDate:addDays(program.startDate,91)}},
 RETURN_AFTER_PAUSE:{interruption:{days:14,reasonCategory:'WORK',nonclinical:true,clinicalReason:false},currentDemonstration:{observedAt:addDays(wk.startDate,2),sport:'RUN',family:'EASY',minutes:25,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'}},LOCAL_FATIGUE:{signals:{region:'LOWER'}},MISSED_SESSION:{targetSessionId:pastRuns[0]?.id},DOUBLE_CONFLICT:{changes:{runTurn:'PM'}},EVENT_WEEK_CONFLICT:{changes:{unavailableDates:[addDays(wk.startDate,5)]}}};
const kindBase={};
for(const [kind,paths] of Object.entries(KIND_PAYLOADS)){
 const rv0={...review(program,w,{kind,day:3,observations:goodObs}),...structuredClone(VALID[kind])};
 kindBase[kind]=(()=>{const r=safe(()=>R6.evaluateProgram(program,rv0));return r.ok?{status:r.value.status,action:r.value.action}:{threw:r.error};})();
 for(const p of paths)for(const v of BAD){const rv=setPath(rv0,p,v);const r=safe(()=>R6.evaluateProgram(program,rv));rows.push({contract:'R6-REVIEW-1',kind,path:p,value:label(v),threw:!r.ok,error:r.ok?null:r.error,status:r.ok?r.value.status:null,prescription:r.ok&&!!r.value.proposal,action:r.ok?r.value.action:null,reason:r.ok?String(r.value.reason).slice(0,160):null});}
}
const summary={total:rows.length,threw:rows.filter(r=>r.threw).length,byStatus:Object.fromEntries([...new Set(rows.map(r=>r.status))].map(s=>[s,rows.filter(r=>r.status===s).length]))};
const crashes=rows.filter(r=>r.threw).map(r=>({contract:r.contract,kind:r.kind,path:r.path,value:r.value,error:r.error}));
// Accepted malformed: intake PROPOSED / review proposal for a value that is not a valid value of that field.
const intakeAccepted=rows.filter(r=>r.contract==='R6-INTAKE-1'&&r.prescription&&!r.path.startsWith('CONTRADICTION')).map(r=>({path:r.path,value:r.value,doseIrrelevant:r.doseIrrelevant}));
const reviewAccepted=rows.filter(r=>r.contract==='R6-REVIEW-1'&&r.prescription).map(r=>({kind:r.kind,path:r.path,value:r.value,action:r.action}));
write('q3-contract-robustness.out.json',{probe:'Q3-contract-robustness',authorityUsed:'REAL r6Authority()',baseIntakeStatus:baseGen.status,baseReview:{status:base.status,action:base.action},kindBase,summary,crashes,intakeAccepted,reviewAccepted,contradictions:rows.filter(r=>r.path.startsWith('CONTRADICTION')),rows});
console.log(JSON.stringify({summary,kindBase,crashCount:crashes.length},null,0));
const groupBy=(list,f)=>{const m={};for(const x of list){const k=f(x);(m[k]??=[]).push(x.value);}return m;};
console.log('CRASHES',JSON.stringify(groupBy(crashes,c=>c.contract+'|'+(c.kind??'')+'|'+c.path+'|'+c.error.slice(0,90)),null,0));
console.log('INTAKE ACCEPTED (dose-relevant)',JSON.stringify(groupBy(intakeAccepted.filter(x=>!x.doseIrrelevant),x=>x.path),null,0));
console.log('REVIEW ACCEPTED',JSON.stringify(groupBy(reviewAccepted,x=>x.kind+'|'+x.path+'|'+x.action),null,0));
console.log('CONTRADICTIONS',JSON.stringify(rows.filter(r=>r.path.startsWith('CONTRADICTION')).map(r=>[r.path,r.status,r.threw?r.error:'',r.week1]),null,0));
