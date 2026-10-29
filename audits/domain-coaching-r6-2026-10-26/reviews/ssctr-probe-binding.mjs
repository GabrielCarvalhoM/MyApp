// SSCTR R6 independent probe 2: targeted runtime-binding checks against PROGRAM_POLICY_R6 (hash 81114d89...).
// Reviewer-authored. Uses DEV_TEST_ONLY authority (all boundaries or explicit subsets) to observe what approval would allow.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram,skeletonOf} from '../../../CoachingCore/src/r6-program.mjs';
import {evaluateProgram} from '../../../CoachingCore/src/r6-adaptation.mjs';
import {chooseBalanced,interferenceCosts} from '../../../CoachingCore/src/r6-balanced.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {PROFILES,EDGE_PROFILES,intake} from '../../../CoachingCore/r6/fixtures/profiles.mjs';

const ALL=devAuthority();
const without=(...ids)=>devAuthority(ALL.policy.scientificBoundaryIds.filter(x=>!ids.includes(x)));
const el=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const R={COMPATIBLE:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},EASIER:{performance:'OVER',recovery:'COMPATIBLE',effort:'EASIER',nextDayFunction:'NORMAL'}};
let n=0;
const obs=(p,s,{response='COMPATIBLE',logs=null,completed=true}={})=>{const o={eventId:`probe-${s.id}-${n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual:{completed,minutes:s.prescription.durationMinutes},response:R[response],source:{provider:'MANUAL'}};if(logs)o.actual.exercises=logs(s);return o;};
const review=(p,w,kind,date,extra={})=>({version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+'T21:00:00Z',weekIndex:w,event:{id:`probe-${kind}-${w}-${n++}`,kind},eligibility:el(date),...extra});
const lastDay=(p,w)=>p.weeks[w].sessions.reduce((m,s)=>s.date>m?s.date:m,p.weeks[w].startDate).replace(/.*/,x=>{const d=new Date(Date.parse(p.weeks[w].startDate+'T00:00:00Z')+6*86400000);return d.toISOString().slice(0,10);});
const runWeek=(p,w,{responses={},skip=false,logs=null}={},ledger=[],opts={authority:ALL})=>{
 const observations=skip?[]:p.weeks[w].sessions.filter(s=>s.prescription&&s.role!=='RACE').map(s=>obs(p,s,{response:responses[s.role]??responses[s.sport]??'COMPATIBLE',logs:s.sport==='STRENGTH'?logs:null}));
 const r=evaluateProgram(p,review(p,w,'WEEKLY_REVIEW',lastDay(p,w),{observations,actualLedger:ledger}),opts);
 return {r,next:r.proposal??p,ledger:r.actualLedger??ledger};
};
const summarizeWeek=wk=>wk.sessions.filter(s=>s.prescription).map(s=>`${s.day}:${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.work?`(${s.prescription.work.repetitions}x${s.prescription.work.workMinutes})`:''}${s.prescription.strides?`+str${s.prescription.strides.repetitions}`:''}${s.prescription.exercises?'['+s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}${e.load.mode==='KNOWN'?'@'+e.load.value:'/'+e.load.mode}`).join(',')+']':''}`);
const results={};

// P1 race-week touch / shakeout strides when quality authority is off, and for a qualityRunner with no build quality.
{
 const noQ=generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,{authority:without('R6-RUN-QUALITY')});
 const rw=noQ.program?.weeks.find(w=>w.phase==='RACE_WEEK');
 const twoDays=intake('probe-10k-two-days',{weeks:8,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-20'}},strength:'MAINTAIN'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:90,longestRunMinutes:50}},schedule:{runDays:[2,6],strengthDays:[4],longRunDay:6}});
 const g2=generateProgram(twoDays,{authority:ALL}),rw2=g2.program?.weeks.find(w=>w.phase==='RACE_WEEK');
 const buildQuality=g2.program?.weeks.some(w=>!['TAPER','RACE_WEEK','POST_EVENT'].includes(w.phase)&&w.sessions.some(s=>s.role==='QUALITY'));
 const buildStrides=g2.program?.weeks.some(w=>!['TAPER','RACE_WEEK','POST_EVENT'].includes(w.phase)&&w.sessions.some(s=>s.prescription?.strides));
 results.P1_RACE_WEEK_NEW_INTENSITY={qualityAuthorityOff:{status:noQ.status,buildQuality:noQ.program?.weeks.some(w=>w.sessions.some(s=>s.role==='QUALITY')),raceWeek:rw?summarizeWeek(rw):null},twoRunDays10K:{status:g2.status,runClass:g2.program?.capability.run.class,buildQuality,buildStrides,raceWeek:rw2?summarizeWeek(rw2):null}};
}
// P2 quality introduction is calendar-based: weeks 0-2 entirely missed, then is week 3 threshold still planned?
{
 let p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:ALL}).program,ledger=[];const trace=[];
 for(const w of [0,1,2]){const x=runWeek(p,w,{skip:true},ledger);trace.push({w,status:x.r.status,action:x.r.action,gates:x.r.gates});p=x.next;ledger=x.ledger;}
 results.P2_QUALITY_AFTER_MISSED_ESTABLISHMENT={plannedQualityFromWeek:3,weeksExecuted:0,trace,week3:summarizeWeek(p.weeks[3]),week4:summarizeWeek(p.weeks[4])};
}
// P3 strength +1 set at block boundary when the whole first block was missed.
{
 let p=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:ALL}).program,ledger=[];
 const before=p.weeks[5].sessions.filter(s=>s.sport==='STRENGTH').map(s=>s.prescription?.exercises.map(e=>e.sets));
 for(const w of [0,1,2,3,4]){const x=runWeek(p,w,{skip:true},ledger);p=x.next;ledger=x.ledger;}
 results.P3_SET_INCREASE_AFTER_MISSED_BLOCK={week3Sets:p.weeks[3].sessions.filter(s=>s.sport==='STRENGTH').map(s=>s.prescription?.exercises.map(e=>e.sets)),week5PlannedOriginally:before,week5AfterFiveMissedWeeks:p.weeks[5].sessions.filter(s=>s.sport==='STRENGTH').map(s=>s.prescription?.exercises.map(e=>`${e.id}:${e.sets}`))};
}
// P4 EARNED magnitudes: walk/jog and long run, with three EASIER responses.
{
 let p=generateProgram(PROFILES.G_LOW_DATA_NO_WEARABLE,{authority:ALL}).program,ledger=[];const steps=[];
 for(const w of [0,1,2,3,4]){const x=runWeek(p,w,{responses:{RUN:'EASIER'}},ledger);steps.push({w,gates:x.r.gates,next:x.next.weeks[w+1]?summarizeWeek(x.next.weeks[w+1]).filter(s=>s.includes('WALK_JOG')).slice(0,1):null});p=x.next;ledger=x.ledger;}
 let q=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:ALL}).program,l2=[];const longSteps=[];
 for(const w of [0,1,2,3,4,5,6]){const x=runWeek(q,w,{responses:{LONG:'EASIER',QUALITY:'EASIER'}},l2);longSteps.push({w,phase:q.weeks[w].phase,gates:x.r.gates,longNext:x.next.weeks[w+1]?.sessions.find(s=>s.role==='LONG')?.prescription.durationMinutes,qualityNext:x.next.weeks[w+1]?.sessions.find(s=>s.role==='QUALITY')?.prescription.work});q=x.next;l2=x.ledger;}
 results.P4_EARNED_MAGNITUDE={walkJog:steps,balancedLongAndQuality:longSteps};
}
// P5 return: interruption reason names illness but nonclinical:true; and a false-positive word ("will").
{
 const base=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:ALL}).program;let p=base,ledger=[];
 for(const w of [0,1,2,3]){const x=runWeek(p,w,{},ledger);p=x.next;ledger=x.ledger;}
 const w=5,date=p.weeks[w].startDate;
 const mk=i=>evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',date,{interruption:i,actualLedger:ledger}),{authority:ALL});
 const ill=mk({days:14,nonclinical:true,reason:'Flu illness, now feeling fine'});
 const will=mk({days:14,reason:'Work travel, will resume Monday'});
 const sick=mk({days:14,nonclinical:true,clinicalReason:false,reason:'Sick with a fever'});
 results.P5_RETURN_CLINICAL_REASON_TEXT={illnessFlaggedNonclinical:{status:ill.status,action:ill.action},illnessWithClinicalReasonFalse:{status:sick.status,action:sick.action},travelWillResume:{status:will.status,action:will.action,reason:will.reason}};
 // P6 demonstration of a non-run modality used as run entry; P7 pre-pause surplus counted toward EARNED in return.
 const demo=mk({days:20,nonclinical:true,clinicalReason:false,reason:'Work travel'});
 const demoStrength=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',date,{interruption:{days:20,nonclinical:true,clinicalReason:false,reason:'Work travel'},currentDemonstration:{observedAt:date,response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',minutes:45,prescription:{modality:'STRENGTH',durationMinutes:45}},actualLedger:ledger}),{authority:ALL});
 const firstRun=r=>r.proposal?.weeks[r.proposal.decisions.at(-1).fromWeek]?.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role}:${s.prescription.durationMinutes}`);
 results.P6_RETURN_DEMONSTRATION_MODALITY={noDemo:{status:demo.status,firstWeek:firstRun(demo)},strengthDemoUsedForRunEntry:{status:demoStrength.status,demonstrationUsed:demoStrength.proposal?.decisions.at(-1).demonstrationUsed,firstWeek:firstRun(demoStrength)}};
}
// P7 strength return after long and moderate pauses without logged entry load (KNOWN prior load in step 1?).
{
 let p=generateProgram(PROFILES.D_NOVICE_RUNNER_EXPERIENCED_STRENGTH,{authority:ALL}).program,ledger=[];
 for(const w of [0,1]){const x=runWeek(p,w,{},ledger);p=x.next;ledger=x.ledger;}
 const out={};
 for(const days of [20,90]){
  const w=3,date=p.weeks[w].startDate;
  const r=evaluateProgram(p,review(p,w,'RETURN_AFTER_PAUSE',date,{interruption:{days,nonclinical:true,clinicalReason:false,reason:'Work travel'},actualLedger:ledger}),{authority:ALL});
  if(!r.proposal){out[days]={status:r.status};continue;}
  const from=r.proposal.decisions.at(-1).fromWeek;let q=r.proposal,l=r.actualLedger;
  const entry=summarizeWeek(q.weeks[from]).filter(x=>x.includes('STRENGTH')||x.includes('['));
  // Execute the entry week with completion but no exercise logs.
  const x=runWeek(q,from,{},l);
  out[days]={status:r.status,from,entryWeek:entry,stepOneWeekNoLogs:summarizeWeek(x.next.weeks[from+1]).filter(s=>s.includes('['))};
 }
 results.P7_STRENGTH_RETURN_STEP_ONE_WITHOUT_LOG=out;
}
// P8 load increments without any logged sets (completion only) for a LOAD-mode strength goal.
{
 let p=generateProgram(PROFILES.D_NOVICE_RUNNER_EXPERIENCED_STRENGTH,{authority:ALL}).program,ledger=[];const loads=[];
 for(const w of [0,1,2,3,4,5]){const x=runWeek(p,w,{},ledger);p=x.next;ledger=x.ledger;loads.push({w:w+1,squat:p.weeks[w+1]?.sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id==='back-squat')});}
 results.P8_LOAD_PROGRESSION_WITHOUT_LOGS=loads.map(x=>({week:x.w,squat:x.squat?`${x.squat.sets}x${x.squat.reps}@${x.squat.load.value} RIR${x.squat.rir}`:null}));
}
// P9 strength progression when the logged reserve is below the prescribed reserve.
{
 let p=generateProgram(PROFILES.B_STRENGTH_FIRST,{authority:ALL}).program,ledger=[];
 const logs=rir=>s=>s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,load:{value:e.load.value??20,unit:'KG',convention:e.load.convention},rir}))}));
 const squatOf=q=>w=>q.weeks[w].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id==='back-squat');
 const before=squatOf(p)(1);
 const x=runWeek(p,0,{logs:logs(1)},ledger);
 results.P9_PROGRESS_WITH_LOW_LOGGED_RESERVE={prescribedWeek0:(()=>{const e=squatOf(p)(0);return `${e.sets}x${e.reps}@${e.load.value} RIR${e.rir}`;})(),loggedRir:1,gate:x.r.gates?.['back-squat'],week1Before:`${before.sets}x${before.reps}@${before.load.value}`,week1After:(()=>{const e=squatOf(x.next)(1);return `${e.sets}x${e.reps}@${e.load.value} RIR${e.rir}`;})()};
}
// P10 permanent equipment substitution survives the next weekly review?
{
 let p=generateProgram(PROFILES.F_GENERAL_HYBRID,{authority:ALL}).program,ledger=[];
 for(const w of [0,1]){const x=runWeek(p,w,{},ledger);p=x.next;ledger=x.ledger;}
 const w=2,date=p.weeks[w].startDate;
 const sub=evaluateProgram(p,review(p,w,'EQUIPMENT_CHANGE',date,{changes:{equipment:['BODYWEIGHT']},actualLedger:ledger}),{authority:ALL});
 const q=sub.proposal??p;
 const usesDb=wk=>wk.sessions.some(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.equipment.includes('DUMBBELLS')));
 const after=runWeek(q,w,{},sub.actualLedger??ledger);
 results.P10_SUBSTITUTION_PERSISTENCE={substitutionStatus:sub.status,week3UsesDumbbellsAfterSubstitution:usesDb(q.weeks[3]),week3UsesDumbbellsAfterNextWeeklyReview:usesDb(after.next.weeks[3]),week3AfterReview:summarizeWeek(after.next.weeks[3]).filter(s=>s.includes('['))};
}
// P11 same-session order with an easy run and heavy lower strength (shared same-turn day).
{
 const sh=intake('probe-shared',{weeks:8,athlete:{goals:{run:'REGULAR',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:100,longestRunMinutes:45,strengthDaysPerWeek:2},equipment:['BARBELL','RACK','BENCH','DUMBBELLS'],knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-27'},{id:'barbell-rdl',sets:3,reps:6,load:{value:85,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]},schedule:{runDays:[1,3,6],strengthDays:[1,4],runTurn:'PM',strengthTurn:'PM',sameTurnConfirmed:true,longRunDay:6,runMinutes:45,strengthMinutes:60}});
 const g=generateProgram(sh,{authority:ALL});
 const d1=g.program?.weeks[1].sessions.filter(s=>s.day===1).map(s=>`${s.backToBackOrder}:${s.sport}:${s.role}`);
 results.P11_SAME_SESSION_EASY_RUN_ORDER={status:g.status,arrangement:g.trace?.arrangement?Object.fromEntries(Object.entries(g.trace.arrangement).map(([k,v])=>[k,{basis:v.basis,selected:v.selectedId,counterfactuals:v.counterfactuals.map(c=>({id:c.id,costs:c.costs.map(x=>x.axis+':'+x.severity+':'+x.cause)}))}])):null,day1Order:d1};
}
// P12 asymmetric residual-interference: forced trade-off for an equal-standing athlete.
{
 const bal=intake('probe-asym',{weeks:8,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['BARBELL','RACK','BENCH','DUMBBELLS'],knownExercises:[{id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-27'},{id:'barbell-rdl',sets:3,reps:6,load:{value:85,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]},schedule:{runDays:[1,2,6],strengthDays:[1,3],runTurn:'AM',strengthTurn:'PM',longRunDay:6,runMinutes:50,strengthMinutes:50,longRunMinutes:80}});
 const g=generateProgram(bal,{authority:ALL});
 results.P12_ASYMMETRY_DECISIVE={status:g.status,question:g.question??null,arrangement:g.trace?.arrangement?Object.fromEntries(Object.entries(g.trace.arrangement).map(([k,v])=>[k,{lead:v.lead,basis:v.basis,reason:v.reason,selected:v.selectedId,counterfactuals:v.counterfactuals.map(c=>({id:c.id,selected:c.selected,costs:c.costs.map(x=>x.axis+':'+x.severity+':'+x.cause+'@'+x.gapHours+'h'),H3:c.horizons?.H3}))}])):null};
}
// P13 post-event redevelopment with an eligibility assessment that predates the race.
{
 let p=generateProgram(EDGE_PROFILES.TEN_K_EIGHT_WEEKS,{authority:ALL}).program,ledger=[];
 const pe=p.weeks.findIndex(w=>w.phase==='POST_EVENT'),rw=p.weeks.findIndex(w=>w.phase==='RACE_WEEK');
 for(let w=0;w<pe;w++){const x=runWeek(p,w,{},ledger);p=x.next;ledger=x.ledger;}
 const race=p.weeks[rw].sessions.find(s=>s.role==='RACE').date,date=lastDay(p,pe),assessed=new Date(Date.parse(race+'T00:00:00Z')-2*86400000).toISOString().slice(0,10);
 const observations=p.weeks[pe].sessions.filter(s=>s.prescription).map(s=>obs(p,s,{}));
 const r=evaluateProgram(p,{...review(p,pe,'WEEKLY_REVIEW',date,{observations,actualLedger:ledger}),eligibility:el(assessed)},{authority:ALL});
 results.P13_POST_EVENT_ELIGIBILITY_PREDATES_RACE={raceDate:race,eligibilityAssessedAt:assessed,reviewDate:date,status:r.status,action:r.action,nextBlockWeek:r.proposal?summarizeWeek(r.proposal.weeks[pe+1]):null};
}
// P14 fail-closed checks for each boundary disabled one at a time.
{
 const out={};
 for(const id of ALL.policy.scientificBoundaryIds){
  const a=without(id);
  const gA=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:a}),gE=generateProgram(PROFILES.E_EXPERIENCED_RUNNER_NOVICE_STRENGTH,{authority:a}),gC=generateProgram(PROFILES.C_BALANCED_HYBRID,{authority:a});
  out[id]={A:gA.status,E:gE.status,C:gC.status,A_quality:gA.program?.weeks.some(w=>w.sessions.some(s=>s.role==='QUALITY'))??null,A_raceTouch:gA.program?.weeks.some(w=>w.sessions.some(s=>s.role==='RACE_TOUCH'))??null,A_strides:gA.program?.weeks.some(w=>w.sessions.some(s=>s.prescription?.strides))??null};
 }
 const none=devAuthority([]);
 out.NONE={A:generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:none}).status};
 results.P14_FAIL_CLOSED=out;
}
// P15 taper quality fraction and long-run share against the policy ranges.
{
 const g=generateProgram(PROFILES.A_RUN_FIRST_HALF_MARATHON,{authority:ALL}).program;
 const peakQ=Math.max(...g.weeks.filter(w=>w.phase==='SPECIFIC').map(w=>w.sessions.find(s=>s.role==='QUALITY')?.prescription.work.repetitions??0));
 const taperQ=g.weeks.find(w=>w.phase==='TAPER').sessions.find(s=>s.role==='QUALITY')?.prescription.work.repetitions;
 const share=g.weeks.map(w=>{const run=w.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&s.prescription.family!=='WALK');const tot=run.reduce((a,s)=>a+s.prescription.durationMinutes,0),long=run.find(s=>s.role==='LONG')?.prescription.durationMinutes??0;return {w:w.index,phase:w.phase,longShare:tot?Math.round(long/tot*100)/100:null};});
 results.P15_RANGES={taperQualityRepsFraction:taperQ/peakQ,policyRange:ALL.policy.operational.event.taperQualityWorkRange,longRunShareByWeek:share,policyLongRunShareMax:ALL.policy.operational.run.longRunShareOfWeeklyMinutesMax};
}
const file=path.join(import.meta.dirname,'ssctr-probe-binding.out.json');
fs.writeFileSync(file,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,1).slice(0,30000));
