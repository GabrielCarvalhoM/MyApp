// QRE probe Q3b: targeted malformed / contradictory / out-of-range cases found while reading the source. Real authority.
import {R6,baseIntake,review,obsFor,sessionsOf,write,safe,elig,addDays,hash} from './qlib.mjs';
const out={probe:'Q3b-targeted-contract',authorityUsed:'REAL r6Authority()',cases:{}};
const rec=(name,fn)=>{const r=safe(fn);out.cases[name]=r.ok?r.value:{threw:r.error};};
const brief=r=>({status:r.status,action:r.action??null,reason:String(r.reason??'').slice(0,200),hasProgram:!!(r.program??r.proposal),missing:r.missingInputs??null,errors:r.errors??null});
const qualityOf=p=>sessionsOf(p).filter(s=>s.role==='QUALITY').map(s=>({week:s.weekIndex,work:s.prescription.work,progression:s.progression}));

// I1. Known familiar quality task with implausible work values: does it move the threshold-ladder start?
for(const [name,work] of [['plausible_3x5',{repetitions:3,workMinutes:5,recoveryMinutes:2}],['implausible_1e9reps',{repetitions:1e9,workMinutes:5,recoveryMinutes:2}],['implausible_workMinutes600',{repetitions:3,workMinutes:600,recoveryMinutes:2}]])
 rec('I1_knownRunWork_'+name,()=>{const r=R6.generateProgram(baseIntake({id:'q-kr-'+name,weeks:8,athlete:{knownRuns:[{prescription:{modality:'RUN',family:'THRESHOLD',durationMinutes:40,warmupMinutes:10,cooldownMinutes:5,work},current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'}]}}));return {...brief(r),runClass:r.program?.capability.run.class,quality:r.program?qualityOf(r.program).slice(0,3):null};});
// I2. Known strength dose with 7-10 sets (allowed by the canonicalizer, above the prescription validator's 6).
rec('I2_knownSets8',()=>{const r=R6.generateProgram(baseIntake({id:'q-sets8',athlete:{knownExercises:[{id:'back-squat',sets:8,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}]}}));return {...brief(r),errorsSample:(r.errors??[]).slice(0,3)};});
// I3. Pause length out of range / unknown: is the restart class still applied?
for(const weeks of [6,104,200,'abc',undefined])rec('I3_pauseWeeks_'+String(weeks),()=>{const r=R6.generateProgram(baseIntake({id:'q-pause',athlete:{pause:{nonclinical:true,weeks,reasonCategory:'WORK'}}}));return {...brief(r),runClass:r.program?.capability.run.class,restart:r.program?.capability.restartAfterPause,week0RunMinutes:r.program?.weeks[0].plannedRunMinutes};});
// I4. Self-reported weekly running below the minimum session (10 min/week, INTERMEDIATE): week 1 vs reported.
for(const mins of [10,14,20])rec('I4_lowWeekly_'+mins,()=>{const r=R6.generateProgram(baseIntake({id:'q-low'+mins,athlete:{recent:{runDaysPerWeek:1,runMinutesPerWeek:mins,longestRunMinutes:mins}}}));const p=r.program;return {...brief(r),runClass:p?.capability.run.class,reportedWeekly:mins,reportedLongest:mins,week0:p?{plannedRunMinutes:p.weeks[0].plannedRunMinutes,runs:p.weeks[0].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>[s.role,s.prescription.durationMinutes])}:null};});
// I5. Unknown/typed-wrong goal enums at intake.
for(const run of [5,{},['RACE'],'run_faster'])rec('I5_goalRun_'+JSON.stringify(run),()=>{const i=baseIntake({id:'q-goal'});i.athlete.goals={run,strength:'STRENGTH'};const r=R6.generateProgram(i);return {...brief(r),runProgrammed:r.program?.capability.run.programmed,chosenRunDays:i.schedule.runDays};});

// ---------- review side ----------
const P=R6.generateProgram(baseIntake({id:'q-rv',weeks:12})).program;
const HM=R6.generateProgram(baseIntake({id:'q-rv-hm',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2027-01-24'}},strength:'RUNNING_SUPPORT'}}})).program;
const ev=(p,rv)=>R6.evaluateProgram(p,rv);
// R1. SCHEDULE_CHANGE with out-of-range, duplicate and fractional days and malformed minutes.
for(const [name,changes] of [['runDays_7_8',{runDays:[1,7,8]}],['runDays_dupes',{runDays:[1,1,3]}],['runDays_negative',{runDays:[-1,3,5]}],['runDays_fraction',{runDays:[1.5,3,5]}],['runMinutes_1.5',{runMinutes:1.5}],['runMinutes_true',{runMinutes:true}],['runMinutes_500',{runMinutes:500}],['strengthMinutes_abc',{strengthMinutes:'abc'}],['strengthMinutes_5',{strengthMinutes:5}],['longRunMinutes_1e9',{longRunMinutes:1e9}]])
 rec('R1_schedule_'+name,()=>{const r=ev(P,review(P,1,{kind:'SCHEDULE_CHANGE',day:2,changes}));const nx=r.proposal?r.proposal.weeks[2]:null;return {...brief(r),nextWeek:nx?nx.sessions.filter(s=>s.prescription||s.role==='REST_BY_DESIGN').map(s=>[s.day,s.date,s.sport,s.role,s.prescription?.durationMinutes??null]):null};});
// R2. GOAL_CHANGE / EVENT_DATE_CHANGE with an invalid event date and unknown goal enums.
for(const [name,p,kind,changes] of [['eventDate_abc',P,'GOAL_CHANGE',{event:{kind:'10K',date:'abc'}}],['eventDate_month13',P,'GOAL_CHANGE',{event:{kind:'10K',date:'2026-13-45'}}],['eventDateChange_abc',HM,'EVENT_DATE_CHANGE',{eventDate:'abc'}],['goalRun_FOO',P,'GOAL_CHANGE',{goals:{run:'FOO'}}],['goalStrength_XYZ',P,'GOAL_CHANGE',{goals:{strength:'XYZ'}}],['eventKind_marathon',P,'GOAL_CHANGE',{event:{kind:'MARATHON',date:addDays(P.startDate,70)}}]])
 rec('R2_'+name,()=>{const r=ev(p,review(p,1,{kind,day:2,changes}));const q=r.proposal;return {...brief(r),goal:q?q.goal.run:null,strengthGoal:q?q.goal.strength:null,raceWeek:q?q.phases.raceWeek:null,phases:q?q.phases.phases:null,hasRaceSession:q?sessionsOf(q).some(s=>s.role==='RACE'):null};});
// R3. RETURN_AFTER_PAUSE: contradictory days vs dates, negative/huge days, typed-wrong clinical flag.
const w=4,ret=(interruption,extra={})=>ev(P,review(P,w,{kind:'RETURN_AFTER_PAUSE',day:0,interruption,...extra}));
const end=addDays(P.weeks[w].startDate,-1);
for(const [name,i] of [['days2_dates40',{days:2,startDate:addDays(end,-39),endDate:end,reasonCategory:'WORK'}],['dates40_only',{startDate:addDays(end,-39),endDate:end,reasonCategory:'WORK'}],['days_negative',{days:-5,reasonCategory:'WORK'}],['days_1e9',{days:1e9,reasonCategory:'WORK'}],['clinicalReason_string_true',{days:14,reasonCategory:'WORK',clinicalReason:'true'}],['clinicalReason_1',{days:14,reasonCategory:'WORK',clinicalReason:1}],['nonclinicalFalse_categoryWork',{days:14,reasonCategory:'WORK',nonclinical:false}],['endDate_future',{days:3,endDate:addDays(P.weeks[w].startDate,10),reasonCategory:'WORK'}],['startAfterEnd',{startDate:addDays(end,5),endDate:end,reasonCategory:'WORK'}]])
 rec('R3_return_'+name,()=>{const r=ret(i);return {...brief(r),interruption:r.proposal?.decisions.at(-1)?.interruption??null};});
rec('R3_return_LONG_demo1min',()=>{const r=ret({days:40,reasonCategory:'WORK'},{currentDemonstration:{observedAt:addDays(P.weeks[w].startDate,-1),sport:'RUN',family:'EASY',minutes:1,completed:true,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL'}});return {...brief(r),runs:r.proposal?r.proposal.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>[s.role,s.prescription.durationMinutes]):null};});
// R4. Review eligibility.assessedAt malformed (string that is not a date): treated as current?
rec('R4_eligibility_assessedAt_garbage',()=>{const r=ev(P,review(P,1,{eligibility:elig('not-a-date')}));return brief(r);});
rec('R4_return_assessedAt_garbage_bypasses_onOrAfterEnd',()=>{const r=ret({days:14,reasonCategory:'WORK',endDate:addDays(P.weeks[w].startDate,0)},{eligibility:elig('garbage')});return brief(r);});
rec('R4_return_assessedAt_beforeEnd_control',()=>{const r=ret({days:14,reasonCategory:'WORK',endDate:addDays(P.weeks[w].startDate,0)},{eligibility:elig(addDays(P.weeks[w].startDate,-3))});return brief(r);});
// R5. Post-race eligibility: assessedAt before race vs garbage.
const raceWeek=HM.phases.raceWeek,raceDate=addDays(HM.startDate,raceWeek*7+HM.phases.raceDay);
for(const [name,assessed] of [['beforeRace',addDays(raceDate,-2)],['garbage','xx'],['onRace',raceDate]])
 rec('R5_postRace_'+name,()=>{const rv=review(HM,raceWeek+1,{day:2,eligibility:elig(assessed)});return {raceDate,asOf:rv.asOf,...brief(ev(HM,rv))};});
write('q3b-targeted-contract.out.json',out);
for(const [k,v] of Object.entries(out.cases))console.log(k,JSON.stringify(v).slice(0,420));
