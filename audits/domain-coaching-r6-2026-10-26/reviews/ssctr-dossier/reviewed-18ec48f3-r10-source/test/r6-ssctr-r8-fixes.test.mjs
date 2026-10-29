import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {screenInterruptionReason} from '../src/r6-clinical.mjs';
import {startStrengthReturn,returnStepSets} from '../src/r6-program.mjs';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

/** Regression tests for the SSCTR round-8 binding defects D47–D49 and recommendations R11–R13 (reviews/ssctr-policy-review.json, R6-SSCTR-POLICY-r8). */
const opts={authority:devAuthority()},op=opts.authority.policy.operational;
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const sessionsOf=p=>p.weeks.flatMap(w=>w.sessions);
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
function intake({id,asOf='2026-11-01',startDate='2026-11-02',weeks=8,athlete={},schedule={}}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,
  athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}};
}
let n=0;
const review=(p,w,{day=6,kind='WEEKLY_REVIEW',...extra}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`t8-${kind}-w${w}-d${day}-${n++}`,kind},eligibility:elig(d),...extra};};
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
/** Every planned session of week w executed as prescribed, except those `live` excludes. `over(e)` overrides each logged set of exercise e. */
function weekObs(p,w,{live=()=>true,over=()=>null}={}){
 return p.weeks[w].sessions.filter(s=>s.prescription&&live(s)).map(s=>({eventId:`t8-${p.athleteId}-${s.id}-${n++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),
  actual:{completed:true,minutes:s.prescription.durationMinutes,...(s.prescription.exercises?{exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.value??20,unit:'KG',convention:e.load.convention},...(over(e)??{})}))}))}:{})},response:{...OK}}));
}
const raceOf=p=>sessionsOf(p).find(s=>s.role==='RACE');
const itemOf=r=>(r.program??r).negotiation.find(x=>x.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');
const tenK=(weeksOut,day=6)=>({run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',weeksOut*7+day)}},strength:'RUNNING_SUPPORT'});

// ---------- D47: completion race day and negotiation by program history ----------
const C_CASES=[
 ['novice 10K in 12 weeks',{id:'t8-d47-novice',weeks:16,athlete:{goals:tenK(11),runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},knownExercises:[]}},'WALK_JOG'],
 ['below-minimum 10K in 12 weeks',{id:'t8-d47-below',weeks:12,athlete:{goals:tenK(11),recent:{runDaysPerWeek:2,runMinutesPerWeek:12,longestRunMinutes:8},knownExercises:[]}},'WALK_JOG'],
 ['restart 10K in 6 weeks',{id:'t8-d47-restart',weeks:8,athlete:{goals:tenK(5),recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},pause:{nonclinical:true,weeks:6,reasonCategory:'TRAVEL',reason:'Work travel'},knownExercises:[]}},'RESTART'],
 ['below-minimum half marathon in 12 weeks',{id:'t8-d47-hm',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},recent:{runDaysPerWeek:2,runMinutesPerWeek:12,longestRunMinutes:8},knownExercises:[]}},'WALK_JOG']
];
test('SSCTR D47: an athlete who built running from walk/jog or a restart in this program completes the race, with the negotiation stating the longest continuous run reached',()=>{
 for(const [label,input,cls] of C_CASES){
  const g=generateProgram(intake(input),opts);assert.equal(g.status,'PROPOSED',label);
  const P=g.program,race=raceOf(P),rs=P.stateTrace[P.phases.raceWeek].run,item=itemOf(g);
  assert.equal(P.capability.run.class,cls,label);
  assert.equal(rs.mode,'EASY',`${label}: the case leaves ${cls} before race week`);
  assert.ok(rs.modeHistory.includes(cls),`${label}: the starting mode stays in the run state`);
  assert.equal(race.prescription.completion,true,label);assert.equal(race.prescription.effortDomain,'EASY_CONVERSATIONAL',label);
  assert.ok(!race.prescription.instructions.some(i=>/whether to press|relaxed strides/.test(i)),label);
  assert.ok(item,`${label}: the negotiation item is emitted`);assert.equal(item.basis,'PROGRAM_HISTORY',label);
  assert.ok(item.options.some(o=>/walk breaks/i.test(o))&&item.options.some(o=>/later or shorter/i.test(o)),label);
  assert.ok(item.longestContinuousRunMinutes>0&&!/\b0 minutes/.test(item.detail),`${label}: ${item.detail}`);
  assert.match(item.detail,new RegExp(`longest continuous run of ${item.longestContinuousRunMinutes} minutes`));
  // The stated run is the longest continuous run the plan reaches before race week.
  const before=sessionsOf(P).filter(s=>s.sport==='RUN'&&s.prescription&&s.weekIndex<P.phases.raceWeek&&(['EASY','LONG'].includes(s.role)||s.role==='WALK_JOG'&&s.prescription.work.recoverySeconds===0)).map(s=>s.role==='WALK_JOG'?Math.round(s.prescription.work.repetitions*s.prescription.work.workSeconds/60):s.prescription.durationMinutes);
  assert.equal(item.longestContinuousRunMinutes,Math.max(...before),label);
 }
});
test('SSCTR D47(c): without walk/jog or restart in the program, a 10K is raced by effort; no exemption removes a completion the history requires',()=>{
 const easy=generateProgram(intake({id:'t8-d47-easy',weeks:12,athlete:{goals:tenK(10),recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60}},schedule:{runMinutes:60,longRunMinutes:100}}),opts);
 assert.notEqual(raceOf(easy.program).prescription.completion,true);assert.equal(itemOf(easy),undefined);
 assert.deepEqual(op.event.raceDayCompletion.historyModes,['WALK_JOG','RESTART']);
 assert.deepEqual(Object.keys(op.event.raceDayCompletion).sort(),['halfMarathonAchievedLongRunBelowMinutes','historyModes','modes','semantics']);
});
test('SSCTR D47(a): a restart applied by a review makes race day a completion and the proposal carries the negotiation; the restart starts the run history again',()=>{
 const p=generateProgram(intake({id:'t8-d47-review',weeks:16,athlete:{goals:tenK(14),runExperience:'EXPERIENCED',recent:{runDaysPerWeek:4,runMinutesPerWeek:240,longestRunMinutes:90},knownExercises:[]},schedule:{runDays:[1,3,4,6],runMinutes:60,longRunMinutes:120}}),opts).program;
 assert.notEqual(raceOf(p).prescription.completion,true);assert.equal(itemOf(p),undefined);
 const r=evaluateProgram(p,review(p,6,{day:1,kind:'RETURN_AFTER_PAUSE',interruption:{days:30,reasonCategory:'WORK',nonclinical:true}}),opts);
 assert.equal(r.action,'REESTABLISH');const P=r.proposal,rs=P.stateTrace[P.phases.raceWeek].run,race=raceOf(P),item=itemOf(P);
 assert.equal(race.prescription.completion,true);assert.ok(rs.modeHistory.includes('RESTART'));
 assert.ok(item&&item.basis==='PROGRAM_HISTORY'&&/after a restart/.test(item.detail),item?.detail);
 // Only runs after the restart count: the statement, the taper and the race week never exceed them.
 const from=P.decisions.at(-1).fromWeek,after=sessionsOf(P).filter(s=>s.sport==='RUN'&&s.prescription&&s.weekIndex>=from&&s.role!=='RACE'&&s.prescription.family!=='WALK'),build=after.filter(s=>gap(s.date,race.date)>op.event.raceWindowDays+7);
 const peak=Math.max(...build.map(s=>s.prescription.durationMinutes));
 assert.ok(item.longestContinuousRunMinutes<=peak,`${item.longestContinuousRunMinutes} reached after the restart (build peak ${peak})`);
 for(const s of after.filter(s=>gap(s.date,race.date)>=1&&gap(s.date,race.date)<=op.event.raceWindowDays+7))assert.ok(s.prescription.durationMinutes<=peak,`${s.id} ${s.role} ${s.prescription.durationMinutes} min above the post-restart peak ${peak}`);
 assert.ok((rs.achieved.long??0)<=peak);
});
test('SSCTR D47(a): a goal change that adds a race to a program built from walk/jog emits the completion item; removing the race removes it',()=>{
 const p=generateProgram(intake({id:'t8-d47-goal',weeks:16,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},knownExercises:[]}}),opts).program;
 assert.equal(itemOf(p),undefined);
 const add=evaluateProgram(p,review(p,3,{kind:'GOAL_CHANGE',changes:{event:{kind:'10K',date:addDays(p.startDate,14*7+6)}}}),opts);
 assert.ok(add.proposal,add.reason);const item=itemOf(add.proposal);
 assert.equal(raceOf(add.proposal).prescription.completion,true);assert.ok(item&&['MODE_IN_RACE_WEEK','PROGRAM_HISTORY'].includes(item.basis),item?.basis);
 const P=add.proposal,drop=evaluateProgram(P,review(P,4,{kind:'GOAL_CHANGE',changes:{event:null}}),opts);
 assert.ok(drop.proposal,drop.reason);assert.equal(itemOf(drop.proposal),undefined);
});

// ---------- D48: a pending row never points at the logged value ----------
test('SSCTR D48: a pending load row instructs effort-guided selection only',()=>{
 const p=generateProgram(intake({id:'t8-d48',athlete:{knownExercises:[]}}),opts).program;
 const r=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,{over:e=>e.id==='goblet-squat'?{load:{value:160,unit:'KG',convention:'PER_HAND'}}:null})}),opts);
 const rows=r.proposal.weeks[1].sessions.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.id==='goblet-squat');
 assert.ok(rows.length);
 for(const e of rows){
  assert.equal(e.load.mode,'FROM_LOG');assert.equal(e.load.value,undefined);
  assert.match(e.instructions[0],/^Ramp up: start with the lightest available load/);
  assert.ok(!e.instructions.some(i=>/use the load you logged|last logged load|load you established/i.test(i)),e.instructions.join(' | '));
 }
 // A confirmed or repeated reference keeps the from-log instruction.
 const c=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,{over:e=>e.id==='goblet-squat'?{load:{value:16,unit:'KG',convention:'PER_HAND'}}:null}),loadConfirmations:[{exerciseId:'goblet-squat',value:16,unit:'KG',convention:'PER_HAND'}]}),opts);
 for(const e of c.proposal.weeks[1].sessions.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.id==='goblet-squat'))assert.equal(e.load.mode,'KNOWN');
});

// ---------- D49: strength sets through a return ----------
/** The probe-U timeline: weeks before the pause executed and reviewed; the pause from Monday of week s for d days; the return review the
 * day after; the entry and following weeks executed and reviewed. Sessions inside the pause are never executed. */
function returnTimeline(s,d,{weeks=12,known=[SQUAT],follow=4}={}){
 let p=generateProgram(intake({id:`t8-d49-s${s}-d${d}-${weeks}-${known[0].sets}`,weeks,athlete:{knownExercises:known}}),opts).program,ledger=[];
 for(let w=0;w<s;w++){const r=evaluateProgram(p,review(p,w,{observations:weekObs(p,w),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const reviewAbs=s*7+d,rw=Math.floor(reviewAbs/7),rday=reviewAbs%7;
 const r0=evaluateProgram(p,review(p,rw,{day:rday,kind:'RETURN_AFTER_PAUSE',interruption:{days:d,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),opts);
 assert.ok(r0.proposal,r0.reason);
 const pauseFrom=p.weeks[s].startDate,after=addDays(p.weeks[rw].startDate,rday),live=x=>x.date<pauseFrom||x.date>after;
 let Q=r0.proposal,led=r0.actualLedger;const ew=Q.decisions.at(-1).fromWeek;
 for(let w=ew;w<Math.min(Q.weeks.length-1,ew+follow);w++){const r=evaluateProgram(Q,review(Q,w,{observations:weekObs(Q,w,{live}),actualLedger:led}),opts);led=r.actualLedger;if(r.proposal)Q=r.proposal;}
 const sets=w=>Math.max(0,...Q.weeks[w].sessions.filter(live).flatMap(x=>x.prescription?.exercises??[]).filter(e=>e.id==='back-squat').map(e=>e.sets));
 return {Q,ew,sets,preBreak:Math.max(...[...Array(s).keys()].filter(w=>!['CONSOLIDATION','SPECIFIC','TAPER'].includes(p.phases.phases[w])).map(w=>Math.max(0,...p.weeks[w].sessions.flatMap(x=>x.prescription?.exercises??[]).filter(e=>e.id==='back-squat').map(e=>e.sets))))};
}
/** Probe-U assertions (SSCTR D49): one set per executed week, never above the count before the break, no block set from return weeks. */
function checkReturnTimeline(s,d){
 const {Q,ew,sets,preBreak}=returnTimeline(s,d);
 const first=[...Array(4).keys()].map(i=>ew+i).find(w=>sets(w)>0);
 assert.equal(sets(first),op.return.strengthEntrySets,'entry dose');
 for(let w=first+1;w<Math.min(Q.weeks.length,ew+5);w++){
  assert.ok(sets(w)-sets(w-1)<=1,`week ${w}: ${sets(w-1)} -> ${sets(w)} sets`);
  assert.ok(sets(w)<=preBreak,`week ${w}: ${sets(w)} sets above the ${preBreak} executed before the break`);
 }
 // Return-entry and return-step weeks never count toward a block-boundary set.
 for(let w=ew;w<Math.min(Q.weeks.length-1,ew+4);w++){
  const a=Q.stateTrace[w].strength.exercises['back-squat'],b=Q.stateTrace[w+1].strength.exercises['back-squat'];
  if(Number.isInteger(a?.returnStep))assert.equal(b?.blocksDone??0,a.blocksDone??0,`week ${w} is a return week`);
 }
 // The count comes back to the one before the break: the steps are over and the cap has reached it (phase reductions apply on top).
 const st=Q.stateTrace[Math.min(Q.weeks.length-1,ew+4)].strength.exercises['back-squat'];
 assert.equal(st.returnStep,undefined);assert.ok(st.setCap===undefined||st.setCap>=preBreak,`cap ${st.setCap} below ${preBreak}`);
}
test('SSCTR D49: probe-U timeline s1-d35: strength sets come back one per executed week to the count before the break; return weeks earn no block set',()=>checkReturnTimeline(1,35));
test('SSCTR D49: probe-U timeline s3-d21: strength sets come back one per executed week to the count before the break; return weeks earn no block set',()=>checkReturnTimeline(3,21));
test('SSCTR D49: probe-U timeline s5-d14: strength sets come back one per executed week to the count before the break; return weeks earn no block set',()=>checkReturnTimeline(5,14));
test('SSCTR D49: the strength return ceiling, step 2 and the phase reductions on top',()=>{
 assert.deepEqual([1,2,3,4,5].map(c=>returnStepSets(op,c)),[1,1,2,2,2]);
 assert.equal(startStrengthReturn({sets:3,lastExecutedSets:4,blocksDone:1}).setCeiling,4);
 assert.equal(startStrengthReturn({sets:3,blocksDone:1}).setCeiling,3,'without an executed count, the known count');
 assert.equal(startStrengthReturn({sets:null}).setCeiling,undefined);
 const x=startStrengthReturn({sets:3,setCap:2,setCeiling:3,returnLogged:true});assert.equal(x.returnStep,0);assert.equal(x.returnInBlock,true);assert.equal(x.setCap,undefined);assert.equal(x.returnLogged,undefined);
 // Return step 2 in a consolidation week is reduced, and the next week brings back only the step-2 count.
 const {Q,ew,sets}=returnTimeline(3,14),step2=[ew,ew+1,ew+2].find(w=>Q.stateTrace[w].strength.exercises['back-squat']?.returnStep===1);
 assert.equal(Q.phases.phases[step2],'CONSOLIDATION');assert.equal(sets(step2),1);assert.equal(sets(step2+1),2);
});
test('SSCTR D49: from a five-set strength dose, return step 2 is one set above the entry and the climb waits through a phase-reduced week',()=>{
 const {Q,ew,sets,preBreak}=returnTimeline(1,21,{weeks:16,known:[{...SQUAT,sets:5}],follow:8});
 assert.equal(preBreak,5);
 const weeks=[...Array(8).keys()].map(i=>ew+i).filter(w=>w<Q.weeks.length),first=weeks.find(w=>sets(w)>0);
 assert.equal(sets(first+1),2,'step 2 is one set above the entry, not the base count minus one');
 assert.ok(weeks.some(w=>w>first+1&&Q.phases.phases[w]==='CONSOLIDATION'&&Q.stateTrace[w].strength.exercises['back-squat'].setCap<preBreak),'the climb crosses a consolidation week');
 for(const w of weeks.filter(w=>w>first))assert.ok(sets(w)-sets(w-1)<=1,`week ${w} (${Q.phases.phases[w]}): ${sets(w-1)} -> ${sets(w)} sets`);
});
test('SSCTR D49: a return step close to a race keeps the race-window strength light',()=>{
 const p=generateProgram(intake({id:'t8-d49-race',weeks:12,athlete:{goals:tenK(8),knownExercises:[SQUAT]},schedule:{runMinutes:60,longRunMinutes:90}}),opts).program,race=raceOf(p);
 const r=evaluateProgram(p,review(p,6,{day:1,kind:'RETURN_AFTER_PAUSE',interruption:{days:14,reasonCategory:'TRAVEL',nonclinical:true}}),opts);
 let Q=r.proposal,led=r.actualLedger;const ew=Q.decisions.at(-1).fromWeek;
 for(let w=ew;w<Q.phases.raceWeek;w++){const v=evaluateProgram(Q,review(Q,w,{observations:weekObs(Q,w,{live:s=>s.date>Q.decisions.at(-1).asOf.slice(0,10)}),actualLedger:led}),opts);led=v.actualLedger;if(v.proposal)Q=v.proposal;}
 const E=op.event,window=sessionsOf(Q).filter(s=>s.sport==='STRENGTH'&&s.prescription&&gap(s.date,race.date)>=1&&gap(s.date,race.date)<=E.raceWindowDays);
 assert.ok(window.length);
 for(const s of window)for(const e of s.prescription.exercises)assert.ok(e.sets<=E.raceWeekStrengthSets&&e.rir>=E.raceWeekStrengthMinimumRir&&e.role==='MAIN',`${s.id} ${e.id} ${e.sets}@${e.rir}`);
});

// ---------- R11, R12, R13 ----------
test('SSCTR R11: the round-8 lexical residuals are no longer screened nonclinical',()=>{
 const screen=(reason,reasonCategory='OTHER_NONCLINICAL')=>screenInterruptionReason({reason,reasonCategory,nonclinical:true}).status;
 for(const r of ['Had a C-section','Cesariana em agosto','Cesárea','Miscarriage','Aborto espontâneo','Vasectomy','Colonoscopy','Root canal','LASIK','Burned my hand cooking','Cut my finger badly','Me corté el dedo','Queimei a mão','Broke my nose'])assert.equal(screen(r,'FAMILY'),'CLINICAL',r);
 for(const r of ['Maternity leave','Licença-maternidade','Baja por maternidad','Newborn at home','Recém-nascido em casa','Recém nascido','Recién nacido en casa','Breastfeeding','Nothing broken, just bruised','Got mugged and beaten up','I was assaulted','Stung by a wasp'])assert.equal(screen(r,'FAMILY'),'ASK',r);
 for(const [r,c] of [['Paternity leave','FAMILY'],['Funeral and grief','FAMILY'],['Jet lag after a long flight','TRAVEL'],['Work trip','TRAVEL']])assert.equal(screen(r,c),'NONCLINICAL',r);
});
test('SSCTR R12: when every easy day is a walk, the executed long run gates the walk conversion, in projection and under executed reviews',()=>{
 const input=intake({id:'t8-r12',weeks:16,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},recent:{runDaysPerWeek:2,runMinutesPerWeek:15,longestRunMinutes:15},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:45,longRunMinutes:60}});
 const P=generateProgram(input,opts).program,walks=w=>P.stateTrace[w].run.walks;
 assert.equal(P.capability.run.class,'EASY_LOW');assert.equal(walks(0),2);
 const converted=P.weeks.findIndex((w,i)=>walks(i)<2);
 assert.ok(converted>0,'a walk converts at a block start');
 assert.ok(P.weeks[converted].sessions.some(s=>s.role==='EASY'&&s.prescription.durationMinutes>=op.run.minimumSessionMinutes));
 const sim=simulateProgram(input,{},opts),F=sim.finalProgram;
 assert.ok(F.weeks.some((w,i)=>F.stateTrace[i].run.walks<2&&w.sessions.some(s=>s.role==='EASY')),'executed reviews convert too');
});
test('SSCTR R13: a return with a single long-run day advances its steps in projection',()=>{
 const p=generateProgram(intake({id:'t8-r13',weeks:12,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},recent:{runDaysPerWeek:1,runMinutesPerWeek:60,longestRunMinutes:60},knownExercises:[]},schedule:{runDays:[6],longRunDay:6,runMinutes:60,longRunMinutes:70}}),opts).program;
 const r=evaluateProgram(p,review(p,4,{day:0,kind:'RETURN_AFTER_PAUSE',interruption:{days:20,reasonCategory:'WORK',nonclinical:true}}),opts),P=r.proposal;
 assert.equal(P.stateTrace[4].run.mode,'RETURN');assert.equal(P.stateTrace[5].run.returnStep,1);assert.equal(P.stateTrace[6].run.mode,'EASY');
});
