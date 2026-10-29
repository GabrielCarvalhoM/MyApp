// Author rerun copy of the SSCTR round-8 probe (unchanged checks; import paths, output name and the expected hash, now R6-POLICY-5 18ec48f3..., adjusted). Author material, not evidence.
// SSCTR R6 round-8 delta probe (R6-POLICY-4, hash 1046ad0e...). Reviewer-authored, read-only use of the runtime.
// Uses a DEV_TEST_ONLY authority bound to the current policy hash (CoachingCore/r6/fixtures/dev-authority.mjs): at the
// new hash the real authority has no current records until this review is issued. Observations only; not quality evidence.
// Sections A-D, G, I-L repeat the round-7 probe logic unchanged (new hash, new output); M-T are new round-8 checks.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram,evaluateProgram} from '../../../../../CoachingCore/src/r6-index.mjs';
import {runMinutesOf} from '../../../../../CoachingCore/src/r6-program.mjs';
import {screenInterruptionReason} from '../../../../../CoachingCore/src/r6-clinical.mjs';
import {simulateProgram} from '../../../../../CoachingCore/src/r6-simulator.mjs';
import {devAuthority} from '../../../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {canonicalAthlete} from '../../../../../CoachingCore/r5/fixtures/canonical.mjs';

const opts={authority:devAuthority()},POL=opts.authority.policy,E=POL.operational.event,R=POL.operational.run,L=POL.operational.establishment,RET=POL.operational.return;
const EXPECTED='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c';
if(opts.authority.policyHash!==EXPECTED)throw new Error('policy hash changed: '+opts.authority.policyHash);
const elig=(d,o={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...o});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const RDL={...SQUAT,id:'barbell-rdl',reps:6,load:{value:90,unit:'KG',convention:'TOTAL'}};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
function intake({id,asOf='2026-11-01',startDate='2026-11-02',weeks=8,athlete={},schedule={},...rest}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,...rest,
  athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}};
}
function review(p,w,{kind='WEEKLY_REVIEW',day=6,time='T21:00:00Z',id=null,eligibility=null,...extra}={}){
 const date=addDays(p.weeks[w].startDate,day);
 return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+time,weekIndex:w,event:{id:id??`s8-${kind}-w${w}-d${day}`,kind},eligibility:eligibility??elig(date),...extra};
}
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
/** Execution report; per-exercise overrides {id:{load,reps,rir,noRir}} for strength. `sessionOver(s)` may return per-session overrides. */
function obs(p,s,{over={},eventId=null,response=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{};const load=o.load!==undefined?o.load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.unit==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:e.sets},()=>{const set={reps:o.reps??e.reps,load};if(!o.noRir)set.rir=o.rir??e.rir;return set;})};});
 return {eventId:eventId??`s8-${p.athleteId}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:response??{...OK}};
}
const weekObs=(p,w,over={},perSession=null)=>p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s,{over:perSession?perSession(s)??over:over}));
const sessionsOf=p=>p.weeks.flatMap(w=>w.sessions);
const loadsOf=(p,w,id)=>p.weeks[w].sessions.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.id===id).map(e=>({mode:e.load.mode,value:e.load.value??null,sets:e.sets,reps:e.reps,rir:e.rir,rule:e.load.rule??null,instructions:e.instructions}));
const kg=(v,c='TOTAL')=>({value:v,unit:'KG',convention:c});
const out={probe:'R6-SSCTR-DELTA-R8',policyHash:opts.authority.policyHash,authorityUsed:'DEV_TEST_ONLY devAuthority() bound to the current policy hash',sections:{}};
const guard=(name,fn)=>{try{out.sections[name]=fn();}catch(e){out.sections[name]={error:String(e?.stack??e).slice(0,1500)};}};

// ---------------------------------------------------------------- A. event proximity by days (round-7 logic unchanged) + R10 floor
guard('A_eventProximity',()=>{
 const DAYSETS=[{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6},{runDays:[0,2,4,6],strengthDays:[1,5],longRunDay:6},{runDays:[2,4,5],strengthDays:[3,6],longRunDay:5},{runDays:[0,3,5],strengthDays:[0,3,6],longRunDay:0},{runDays:[1,2,4,6],strengthDays:[1,4,6],longRunDay:4}];
 const v={},stats={programs:0,statuses:{},touches:0,windowStrengthSessions:0,progressive:{windowBelowTaper:0,taperNotAbovePreTaper:0,checked:0},raceCompletion:0,raceEffort:0,warmupStridesWithoutAchieved:0,r10Checked:0},ex={};
 const flag=(k,x)=>{(v[k]??=0);v[k]++;(ex[k]??=[]);if(ex[k].length<4)ex[k].push(x);};
 for(const kind of ['10K','HALF_MARATHON'])for(const raceWeek of [3,5,7,10])for(let raceDay=0;raceDay<7;raceDay++)for(const [di,days] of DAYSETS.entries())for(const strength of ['STRENGTH','RUNNING_SUPPORT','MAINTAIN']){
  const id=`s8-rp-${kind}-${raceWeek}-${raceDay}-${di}-${strength}`;
  const g=generateProgram(intake({id,weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',raceWeek*7+raceDay)}},strength},knownExercises:[SQUAT,RDL,BENCH],recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runMinutes:60,longRunMinutes:100,strengthMinutes:60,...days}}),opts);
  stats.statuses[g.status]=(stats.statuses[g.status]??0)+1;if(!g.program)continue;stats.programs++;
  const P=g.program,all=sessionsOf(P),race=all.find(s=>s.role==='RACE');if(!race){flag('raceMissing',{id});continue;}
  const before=s=>gap(s.date,race.date),build=all.filter(s=>s.prescription&&before(s)>13);
  const peakLong=Math.max(0,...build.filter(s=>s.role==='LONG').map(s=>s.prescription.durationMinutes)),peakEasy=Math.max(0,...build.filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes));
  const work=p=>p?.work?(p.work.repetitions*p.work.workMinutes):0,peakQ=Math.max(0,...build.filter(s=>s.role==='QUALITY').map(s=>work(s.prescription)));
  const priorIds=new Set(all.filter(s=>s.prescription?.exercises&&before(s)>13&&before(s)<=41).flatMap(s=>s.prescription.exercises.map(e=>e.id)));
  let touches=0,winStrength=0;
  for(const s of all.filter(s=>s.prescription&&s.role!=='RACE')){
   const b=before(s);
   if(b>=1&&b<=E.raceWindowDays){
    if(['LONG','QUALITY'].includes(s.role))flag('keyRunInRaceWindow',{id,session:s.id,role:s.role,b});
    if(s.role==='RACE_TOUCH'){touches++;if(b<E.raceWeekTouchMinDaysBeforeRace)flag('touchTooClose',{id,session:s.id,b});}
    if(s.role==='SHAKEOUT'&&b!==1)flag('shakeoutNotDayBefore',{id,session:s.id,b});
    if(s.role==='EASY'&&s.prescription.durationMinutes>Math.max(R.minimumSessionMinutes,0.6*peakEasy+2.5))flag('windowEasyAboveRaceWeekFraction',{id,session:s.id,minutes:s.prescription.durationMinutes,peakEasy});
    if(s.sport==='STRENGTH'){winStrength++;if(b<E.raceWeekStrengthMinDaysBeforeRace)flag('strengthTooClose',{id,session:s.id,b});if(s.prescription.exercises.some(e=>e.sets>E.raceWeekStrengthSets||e.rir<E.raceWeekStrengthMinimumRir||e.role!=='MAIN'))flag('windowStrengthNotLight',{id,session:s.id,ex:s.prescription.exercises.map(e=>`${e.id}:${e.role}:${e.sets}x${e.reps}@rir${e.rir}`)});}
   }
   const taperWeeks=Math.max(0,P.phases.raceWeek-(P.phases.taperStart??P.phases.raceWeek));
   if(taperWeeks>0&&b>E.raceWindowDays&&b<=E.raceWindowDays+7*taperWeeks){
    if(s.role==='LONG'&&peakLong&&s.prescription.durationMinutes>E.taperWeekLongRunRange[1]*peakLong+2.5)flag('taperLongAboveRange',{id,session:s.id,minutes:s.prescription.durationMinutes,peakLong});
    if(s.role==='QUALITY'&&peakQ&&work(s.prescription)>E.taperQualityWorkRange[1]*peakQ+1e-9)flag('taperQualityAboveRange',{id,session:s.id,work:work(s.prescription),peakQ});
    if(s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.rir<3))flag('taperStrengthRirBelow3',{id,session:s.id});
   }
   if(b>=1&&b<=E.raceWindowDays+7&&s.sport==='STRENGTH'){const fresh=s.prescription.exercises.filter(e=>!priorIds.has(e.id)).map(e=>e.id);if(fresh.length)flag('newExerciseNearRace',{id,session:s.id,fresh});}
   if(b<0&&s.sport==='RUN'&&-b<E.postEventFirstRunMinDaysAfterRace)flag('runTooSoonAfterRace',{id,session:s.id,daysAfter:-b});
  }
  stats.touches+=touches;stats.windowStrengthSessions+=winStrength;
  if(touches>1)flag('moreThanOneTouch',{id,touches});if(winStrength>1)flag('moreThanOneWindowStrength',{id,winStrength});
  const bin=(lo,hi)=>all.filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&s.prescription.family!=='WALK'&&before(s)>=lo&&before(s)<=hi).reduce((n,s)=>n+s.prescription.durationMinutes,0);
  if(raceWeek>=5){stats.progressive.checked++;const w0=bin(1,6),w1=bin(7,13),w2=bin(14,20);if(w0<w1)stats.progressive.windowBelowTaper++;if(w1<=w2)stats.progressive.taperNotAbovePreTaper++;else flag('taperAbovePreTaperWeek',{id,taper:w1,preTaper:w2});}
  // round 8: race-day form, warm-up strides and R10 floor
  const rs=P.stateTrace[P.phases.raceWeek].run,rp=race.prescription;
  if(rp.completion)stats.raceCompletion++;else stats.raceEffort++;
  if(rp.instructions.some(i=>/relaxed strides/.test(i))&&!((rs.achieved?.strides??0)>0))flag('warmupStridesWithoutAchieved',{id});
  const expectCompletion=['WALK_JOG','RESTART','RETURN'].includes(rs.mode)||kind==='HALF_MARATHON'&&(rs.achieved?.long??0)<E.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes;
  if(!!rp.completion!==expectCompletion)flag('completionRuleMismatch',{id,mode:rs.mode,achievedLong:rs.achieved?.long,completion:!!rp.completion});
  for(const wk of P.weeks.filter(w=>w.phase==='TAPER'||w.phase==='NEXT_BLOCK'&&P.weeks[w.index-1]?.phase==='POST_EVENT')){
   const long=wk.sessions.find(s=>s.role==='LONG'&&s.prescription),easy=wk.sessions.filter(s=>s.role==='EASY'&&s.prescription&&gap(s.date,race.date)>E.raceWindowDays||s.role==='EASY'&&s.prescription&&wk.phase==='NEXT_BLOCK');
   if(long&&easy.length){stats.r10Checked++;if(long.prescription.durationMinutes<Math.max(...easy.map(s=>s.prescription.durationMinutes)))flag('r10LongShorterThanEasy',{id,week:wk.index,phase:wk.phase,long:long.prescription.durationMinutes,easy:easy.map(s=>s.prescription.durationMinutes)});}
  }
 }
 return {stats,violations:v,examples:ex};
});

// ---------------------------------------------------------------- B. walk/jog familiar start (round-7 logic unchanged; D42)
guard('B_walkJogStart',()=>{
 const rows=[],viol={},ex={};const flag=(k,x)=>{(viol[k]??=0);viol[k]++;(ex[k]??=[]);if(ex[k].length<5)ex[k].push(x);};
 for(const exp of ['NOVICE','INTERMEDIATE','EXPERIENCED'])for(const W of [null,0,5,10,14,20,30])for(const Lg of [null,3,5,10,14,20])for(const runDays of [[3],[1,4],[1,3,5],[0,2,4,6]]){
  if(W!==null&&Lg!==null&&Lg>W&&W>0)continue;
  const id=`s8-wj-${exp}-${W}-${Lg}-${runDays.length}`;
  const g=generateProgram(intake({id,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:exp,recent:{runDaysPerWeek:Math.min(3,runDays.length),runMinutesPerWeek:W,longestRunMinutes:Lg,strengthDaysPerWeek:2}},schedule:{runDays,longRunDay:runDays.at(-1),runMinutes:45,longRunMinutes:60}}),opts);
  if(!g.program){rows.push({id,status:g.status});continue;}
  const P=g.program,cls=P.capability.run.class,st=P.stateTrace[0].run,w0=P.weeks[0].sessions.filter(s=>s.sport==='RUN'&&s.prescription);
  const wj=w0.filter(s=>s.role==='WALK_JOG'),jogPer=wj.map(s=>s.prescription.work.repetitions*s.prescription.work.workSeconds/60),seg=wj.map(s=>s.prescription.work.workSeconds/60),weeklyJog=jogPer.reduce((a,b)=>a+b,0);
  const runs=w0.filter(s=>['EASY','LONG'].includes(s.role)).map(s=>s.prescription.durationMinutes);
  const r={id,exp,W,L:Lg,days:runDays.length,cls,walkStep:st.walkStep??null,jogPerSession:jogPer[0]??null,segment:seg[0]??null,weeklyJog,week0ContinuousRuns:runs};rows.push(r);
  if(cls==='WALK_JOG'){
   if((exp==='NOVICE'||!(W>0)||!(Lg>0))&&st.walkStep!==0)flag('nonZeroStepWithoutKnownExposure',r);
   if(Number.isFinite(Lg)&&seg.some(x=>x>Lg+1e-9))flag('segmentAboveLongest',r);
   if(Number.isFinite(W)&&W>0&&weeklyJog>W+1e-9)flag('weeklyJogAboveReported',r);
   if(Number.isFinite(Lg)&&jogPer.some(x=>x>Lg+1e-9))flag('sessionJogAboveLongestCurrentRun',r);
   if(runs.length)flag('continuousRunsInWalkJogWeek0',r);
   // round 8: the start is the HIGHEST step that fits (not over-conservative)
   if(exp!=='NOVICE'&&W>0&&Lg>0&&P.capability.run.belowMinimumSession){const share=W/Math.max(1,Math.min(runDays.length,L.maxWalkJogDaysPerWeek));const best=L.walkJogLadder.map((x,i)=>x.repetitions*x.jogSeconds<=Math.min(Lg,share)*60?i:-1).filter(i=>i>=0);const want=best.length?Math.max(...best):0;if(st.walkStep!==want)flag('startNotHighestFittingStep',{...r,want});}
  }
  if(cls!=='WALK_JOG'&&Number.isFinite(Lg)&&runs.some(m=>m>Lg))flag('week0RunAboveLongest',r);
 }
 return {summary:{programs:rows.filter(r=>r.cls).length,byClass:rows.reduce((m,r)=>{m[r.cls??r.status]=(m[r.cls??r.status]??0)+1;return m;},{}),nonNoviceRaisedStarts:rows.filter(r=>r.cls==='WALK_JOG'&&r.walkStep>0).length},violations:viol,examples:ex,sample:rows.filter(r=>r.cls==='WALK_JOG'&&r.walkStep>0).slice(0,12)};
});

// ---------------------------------------------------------------- C. walk/jog, restart and below-minimum athletes with an event (round-7 cases unchanged)
const describe=(name,g)=>{
 if(!g.program)return {name,status:g.status,missing:g.missingInputs,errors:g.errors};
 const P=g.program,race=sessionsOf(P).find(s=>s.role==='RACE');
 return {name,status:g.status,class:P.capability.run.class,raceWeek:P.phases.raceWeek,phases:P.phases.phases,negotiation:g.negotiation.filter(n=>/EVENT|RUN_DAYS/.test(n.id)).map(n=>({id:n.id,blocking:n.blocking,detail:n.detail,options:n.options})),
  modeByWeek:P.stateTrace.map(s=>s.run.mode+(s.run.mode==='WALK_JOG'?':'+s.run.walkStep:s.run.mode==='RESTART'?':'+s.run.restart:'')),
  achievedAtRace:race?P.stateTrace[P.phases.raceWeek].run.achieved:null,
  runsByWeek:P.weeks.map(w=>({w:w.index,phase:w.phase,runs:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.date}:${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.work?`(${s.prescription.work.repetitions}x${s.prescription.work.workSeconds??s.prescription.work.workMinutes})`:''}${s.prescription.strides?'+strides':''}`)})),
  race:race?{date:race.date,duration:race.prescription.durationMinutes,effortDomain:race.prescription.effortDomain,completion:!!race.prescription.completion,instructions:race.prescription.instructions}:null};
};
const C_CASES=[
 {name:'QRE-R6-19 judge case',in:intake({id:'s8-walkonly',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-13'}},strength:'STRENGTH'},runExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:10,longestRunMinutes:5},knownExercises:[]},schedule:{runDays:[5],strengthDays:[4,5],runMinutes:30,strengthMinutes:45,longRunMinutes:30,longRunDay:5}})},
 {name:'novice 10K in 8 weeks, 3 run days',in:intake({id:'s8-wj-10k-8',weeks:8,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',7*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 {name:'restart after a 6-week nonclinical pause, 10K in 6 weeks',in:intake({id:'s8-rs-10k',weeks:8,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',5*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},pause:{nonclinical:true,weeks:6,reasonCategory:'TRAVEL',reason:'Work travel'},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 {name:'non-novice below minimum, HM in 12 weeks',in:intake({id:'s8-wj-hm-12',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:12,longestRunMinutes:8},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 // round 8: same below-minimum athlete with a 10K, and a raised start that exits the ladder before the race
 {name:'non-novice below minimum, 10K in 12 weeks',in:intake({id:'s8-wj-10k-12',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:12,longestRunMinutes:8},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 {name:'non-novice below minimum (L 14, W 14), 10K in 10 weeks',in:intake({id:'s8-wj-10k-10',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',9*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:14,longestRunMinutes:14},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 {name:'novice 10K in 12 weeks, 3 run days',in:intake({id:'s8-wj-10k-novice-12',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})}
];
guard('C_walkJogEvent',()=>C_CASES.map(({name,in:i})=>describe(name,generateProgram(i,opts))));

// ---------------------------------------------------------------- D. logged-load adoption (round-7 cases unchanged; D44/D45 outcomes)
guard('D_loggedLoad',()=>{
 const res={};
 const p=generateProgram(intake({id:'s8-load',weeks:8}),opts).program;
 const squat=(prog,w)=>sessionsOf(prog).filter(s=>s.weekIndex===w&&s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>({session:s.id,sets:e.sets,reps:e.reps,rir:e.rir,load:e.load})));
 res.planned=squat(p,0)[0];
 const run=(name,over)=>{const r=evaluateProgram(p,review(p,0,{observations:p.weeks[0].sessions.filter(s=>s.prescription).map(s=>obs(p,s,{over}))}),opts);res[name]={status:r.status,action:r.action,gate:r.gates?.['back-squat']??null,week1:squat(r.proposal??p,1).map(x=>x.load.value),week2:squat(r.proposal??p,2).map(x=>x.load.value),loadQuestions:(r.loadQuestions??[]).filter(q=>q.exerciseId==='back-squat').map(q=>q.reason)};};
 run('asPlanned_80',{});
 run('oneIncrementUp_82.5_rirOnTarget',{'back-squat':{load:kg(82.5)}});
 run('oneIncrementUp_82.5_rir0_repsMet',{'back-squat':{load:kg(82.5),rir:0}});
 run('oneIncrementUp_82.5_repsMissed',{'back-squat':{load:kg(82.5),reps:3,rir:0}});
 run('twoIncrementsUp_85',{'back-squat':{load:kg(85)}});
 run('typoLow_8',{'back-squat':{load:kg(8)}});
 run('lb_181_is_82',{'back-squat':{load:{value:181,unit:'LB',convention:'TOTAL'}}});
 const q=generateProgram(intake({id:'s8-est',weeks:8,athlete:{knownExercises:[]}}),opts).program;
 const estRow=sessionsOf(q).filter(s=>s.weekIndex===0&&s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='ESTABLISH').map(e=>({session:s.id,id:e.id,load:e.load,sets:e.sets,reps:e.reps,rir:e.rir})))[0]??null;
 const exRows=(prog,w,id)=>sessionsOf(prog).filter(s=>s.weekIndex===w&&s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>e.load));
 const runEst=(name,v)=>{if(!estRow){res[name]={note:'no ESTABLISH row in week 0'};return;}const r=evaluateProgram(q,review(q,0,{observations:q.weeks[0].sessions.filter(s=>s.prescription).map(s=>obs(q,s,{over:{[estRow.id]:{load:{value:v,unit:'KG',convention:estRow.load.convention}}}}))}),opts);res[name]={status:r.status,action:r.action,week0Row:estRow,week1:exRows(r.proposal??q,1,estRow.id),week2:exRows(r.proposal??q,2,estRow.id),loadQuestions:(r.loadQuestions??[]).filter(x=>x.exerciseId===estRow.id).map(x=>x.reason)};};
 runEst('establish_log_16_per_hand',16);runEst('establish_log_160_per_hand_typo',160);
 return res;
});

// ---------------------------------------------------------------- G. conflicts (round-7 logic unchanged)
guard('G_conflicts',()=>{
 const p=generateProgram(intake({id:'s8-act'}),opts).program,[a,b]=p.weeks[0].sessions.filter(s=>s.sport==='RUN');
 const src={provider:'WEARABLE:X',activityId:'act-SAME',quality:'WEARABLE_FULL'};
 const oa={...obs(p,a,{eventId:'s8-a'}),source:src},ob={...obs(p,b,{eventId:'s8-b'}),observedAt:a.date+'T08:00:00Z',source:src};
 const r=evaluateProgram(p,review(p,0,{observations:[oa,ob]}),opts);
 return {sessionStatuses:r.weekEvidence.rows.filter(x=>[a.id,b.id].includes(x.sessionId)).map(x=>({id:x.sessionId,status:x.status})),conflicts:r.provenance.conflicts,ledgerRows:r.actualLedger.filter(x=>x.provenance?.activityId==='act-SAME').map(x=>({sessionId:x.sessionId,conflicted:!!x.conflicted}))};
});

// ---------------------------------------------------------------- I. return facts (round-7 logic unchanged; R6 changes eligibility forms)
guard('I_return',()=>{
 const p=generateProgram(intake({id:'s8-ret',weeks:12}),opts).program,w=4,end=addDays(p.weeks[w].startDate,-1);
 const ret=(i,extra={})=>{const r=evaluateProgram(p,review(p,w,{kind:'RETURN_AFTER_PAUSE',day:0,interruption:i,...extra}),opts);return {status:r.status,class:r.proposal?.decisions.at(-1)?.interruption?.class??null,demo:r.proposal?.decisions.at(-1)?.demonstrationUsed??null,missing:r.missingInputs};};
 const demo=m=>({sport:'RUN',family:'EASY',completed:true,minutes:m,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL',observedAt:addDays(end,-2)+'T08:00:00Z'});
 return {
  moderate_demo10:ret({days:14,reasonCategory:'WORK'},{currentDemonstration:demo(10)}),
  moderate_demo25:ret({days:14,reasonCategory:'WORK'},{currentDemonstration:demo(25)}),
  clinicalReason_sim:ret({days:14,reasonCategory:'WORK',clinicalReason:'sim'}),
  clinicalReason_maybe:ret({days:14,reasonCategory:'WORK',clinicalReason:'maybe'}),
  eligibilityPainStringTrue:ret({days:14,reasonCategory:'WORK'},{eligibility:elig(addDays(p.weeks[w].startDate,0),{pain:'true'})}),
  eligibilityPainOne:ret({days:14,reasonCategory:'WORK'},{eligibility:elig(addDays(p.weeks[w].startDate,0),{pain:1})})
 };
});

// ---------------------------------------------------------------- J. clinical screen (round-7 battery unchanged; expectations updated only where R7 asked for a change)
guard('J_clinicalScreen',()=>{
 const T=(reason,expect,cat='WORK')=>({reason,expect,cat});
 const B=[
  T('It was hard to run without pain','X'),T('Without pain, just travel','N'),T('Sem dor, só trabalho','N'),T('Sin dolor, solo trabajo','N'),T('nothing clinical, just a busy month','N'),
  T("Didn't feel any pain",'N'),T('Não senti dor nenhuma','N'),T('No tuve dolor','N'),T('Never had any injury','N'),T("didn't feel well on the trip",'A'),
  T("Didn't feel any pain until I tried to run",'X'),T('No tuve dolor hasta que corrí','X'),T("couldn't run without pain",'C'),T('No pude correr sin dolor en el viaje','C'),
  T('Not sick - injured on holiday','C'),T('Ocupado y enfermo','C'),T('Me caí en el viaje','X'),T('Work travel, will resume Monday','A',null),
  T('heart attack','C'),T('broke my leg','C'),T('chemotherapy','C'),T('quebrei a perna','C'),T('me rompí la pierna','C'),T('fraturei o pulso','C'),T('kidney stones','C'),T('tendon rupture','C'),
  T('Broke my phone, busy at work','N'),T('Took a break from work travel','N'),T('Spring break with the kids','N'),T("Didn't break anything, just travel",'N'),
  T('No broken bones, just a work trip','A'),T("Didn't break my leg, just busy",'A'),T('Took a break, my back is fine','X'),
  T('Back from vacation','X',"VACATION"),T('Back to work after the holidays','X'),T('Family emergency, my heart was elsewhere','X',"FAMILY"),
  T('Had a baby','C','FAMILY'),T('Tive um bebê','C','FAMILY'),T('Tuve un bebé','C','FAMILY'),T('Hit by a car on the way to work','C'),T('Car crash','C','TRAVEL'),
  T('Pulled a hamstring','X'),T('Twisted my ankle on the trip','X'),T('Knee gave out','X'),T('Got COVID on the trip','C','TRAVEL'),T('Long covid','C'),T('Burnout at work','X'),
  T('Bitten by a dog','C'),T('Bike crash on holiday','C','VACATION'),T('Slipped on ice','X','WEATHER'),T('Torn meniscus','C'),T('Lesão no joelho','C'),T('Esguince de tobillo','C')
 ];
 const results=B.map(({reason,expect,cat})=>{const r=screenInterruptionReason({reason,reasonCategory:cat,nonclinical:true});const ok=expect==='C'?r.status==='CLINICAL':expect==='N'?r.status==='NONCLINICAL':expect==='A'?r.status==='ASK':r.status!=='NONCLINICAL';return {reason,category:cat,expect,status:r.status,basis:r.basis,matched:r.matched,ok};});
 return {results,mismatches:results.filter(x=>!x.ok).map(x=>`${x.reason} [${x.category}] -> ${x.status} (expected ${x.expect})`)};
});

// ---------------------------------------------------------------- K. missed-run gating (round-7 logic unchanged)
guard('K_missingGate',()=>{
 const input=intake({id:'s8-gate-wj',weeks:8,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:10,longestRunMinutes:6}},schedule:{runDays:[1,4],longRunDay:4}});
 const sim=simulateProgram(input,{default:{missed:[{sport:'RUN'}]}},opts);
 return {walkStepByWeek:sim.finalProgram.stateTrace.map(s=>s.run.mode+':'+(s.run.walkStep??'-')),executedRuns:sim.actualLedger.filter(o=>o.context?.sport==='RUN').length};
});

// ---------------------------------------------------------------- L. projection gating (round-7 logic unchanged; D46)
guard('L_projectionMissingGate',()=>{
 const rows=[];
 const inputs=[
  intake({id:'s8-L-wj',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-13'}},strength:'STRENGTH'},runExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:10,longestRunMinutes:5},knownExercises:[]},schedule:{runDays:[5],strengthDays:[4,5],runMinutes:30,strengthMinutes:45,longRunMinutes:30,longRunDay:5}}),
  intake({id:'s8-L-easy-mon',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',7*7)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:70,longestRunMinutes:30}},schedule:{runDays:[1,3,6],longRunDay:6}})
 ];
 for(const i of inputs){
  const g=generateProgram(i,opts);if(!g.program){rows.push({id:i.athlete.id,status:g.status});continue;}
  const P=g.program;
  rows.push({id:i.athlete.id,weeks:P.weeks.map((w,k)=>{const roles=[...new Set(w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role))];const st=P.stateTrace[k].run,nx=P.stateTrace[k+1]?.run;return {w:k,phase:w.phase,runRoles:roles,mode:st.mode,walkStep:st.walkStep,easyWeeksDone:st.easyWeeksDone,next:nx?{mode:nx.mode,walkStep:nx.walkStep,easyWeeksDone:nx.easyWeeksDone}:null,stepWithoutSession:!!nx&&((st.mode==='WALK_JOG'&&!roles.includes('WALK_JOG')&&(nx.walkStep>st.walkStep||nx.mode!=='WALK_JOG'))||(st.mode==='EASY'&&nx.mode==='EASY'&&!roles.includes('EASY')&&(nx.easyWeeksDone??0)>(st.easyWeeksDone??0)))};})});
 }
 return {rows,stepsWithoutSession:rows.flatMap(r=>(r.weeks??[]).filter(w=>w.stepWithoutSession).map(w=>r.id+':w'+w.w))};
});

// ---------------------------------------------------------------- M. D44: above-plan adoption only on the ADVANCE criterion
guard('M_D44',()=>{
 const p=generateProgram(intake({id:'s8-d44',weeks:8}),opts).program,res={planned:loadsOf(p,0,'back-squat').map(l=>({value:l.value,sets:l.sets,reps:l.reps,rir:l.rir}))};
 const prescribedRir=res.planned[0].rir;
 const run=(name,over,{kind='WEEKLY_REVIEW',perSession=null}={})=>{const r=evaluateProgram(p,review(p,0,{kind,observations:weekObs(p,0,over,perSession)}),opts);res[name]={status:r.status,action:r.action,gate:r.gates?.['back-squat']??null,week1:loadsOf(r.proposal??p,1,'back-squat').map(l=>l.value),week2:loadsOf(r.proposal??p,2,'back-squat').map(l=>l.value),questions:(r.loadQuestions??[]).filter(q=>q.exerciseId==='back-squat').map(q=>({reason:q.reason,logged:q.logged,planned:q.planned}))};return res[name];};
 run('above_target_met_rir_prescribed',{'back-squat':{load:kg(82.5)}});
 run('above_rir_prescribed_minus1',{'back-squat':{load:kg(82.5),rir:prescribedRir-1}});
 run('above_rir_prescribed_minus2',{'back-squat':{load:kg(82.5),rir:prescribedRir-2}});
 run('above_reps_missed',{'back-squat':{load:kg(82.5),reps:3}});
 run('above_rir_not_logged',{'back-squat':{load:kg(82.5),noRir:true}});
 run('above_systemic_fatigue_review',{'back-squat':{load:kg(82.5)}},{kind:'SYSTEMIC_FATIGUE'});
 run('above_two_increments',{'back-squat':{load:kg(85)}});
 run('at_plan_rir0',{'back-squat':{load:kg(80),rir:0}});
 run('below_plan_77.5',{'back-squat':{load:kg(77.5)}});
 // two exposures of the squat in week 0? record how many
 res.squatExposuresWeek0=loadsOf(p,0,'back-squat').length;
 // adverse response on the strength session
 {const r=evaluateProgram(p,review(p,0,{observations:p.weeks[0].sessions.filter(s=>s.prescription).map(s=>obs(p,s,{over:{'back-squat':{load:kg(82.5)}},response:s.sport==='STRENGTH'&&s.prescription.exercises.some(e=>e.id==='back-squat')?{performance:'WORSE',recovery:'POOR',effort:'HARDER',nextDayFunction:'REDUCED'}:null}))}),opts);res.above_adverse_response={status:r.status,gate:r.gates?.['back-squat']??null,week1:loadsOf(r.proposal??p,1,'back-squat').map(l=>l.value),questions:(r.loadQuestions??[]).filter(q=>q.exerciseId==='back-squat').map(q=>q.reason)};}
 const viol=[];
 for(const k of ['above_rir_prescribed_minus2','above_reps_missed','above_rir_not_logged','above_systemic_fatigue_review','above_two_increments','above_adverse_response'])if((res[k].week1??[]).some(v=>v>80))viol.push(k+': above-plan load adopted without ADVANCE');
 for(const k of ['above_target_met_rir_prescribed','above_rir_prescribed_minus1'])if(!(res[k].week1??[]).every(v=>v>=82.5))viol.push(k+': ADVANCE exposure not adopted');
 for(const k of ['above_rir_prescribed_minus2','above_reps_missed'])if(!res[k].questions.some(q=>q.reason==='LOGGED_LOAD_ABOVE_PLAN_TARGET_NOT_MET'))viol.push(k+': not asked');
 res.violations=viol;
 return res;
});

// ---------------------------------------------------------------- N. D45: establishment logs, confirmations, agreement, hint, pending carried
guard('N_D45',()=>{
 const res={};
 const p=generateProgram(intake({id:'s8-d45',weeks:8,athlete:{knownExercises:[]}}),opts).program;
 const estIds=[...new Set(p.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.load.mode==='ESTABLISH').map(e=>e.id))];
 const perHand=estIds.find(id=>loadsOf(p,0,id)[0].instructions&&p.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===id).load.convention==='PER_HAND');
 const target=perHand??estIds[0],conv=p.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===target).load.convention;
 const twice=estIds.find(id=>loadsOf(p,0,id).length>1)??null;
 res.target={id:target,convention:conv,exposuresWeek0:loadsOf(p,0,target).length,estIds,exerciseTwiceInWeek0:twice};
 const ev=(prog,w,over,extra={},perSession=null)=>evaluateProgram(prog,review(prog,w,{observations:weekObs(prog,w,over,perSession),...extra}),opts);
 const summary=(r,prog,w)=>({status:r.status,action:r.action,next:loadsOf(r.proposal??prog,w+1,target).map(l=>({mode:l.mode,value:l.value,rule:l.rule,firstInstruction:l.instructions?.[0]})),pending:r.proposal?.stateTrace?.[w+1]?.strength?.exercises?.[target]?.pendingLoad??null,questions:(r.loadQuestions??[]).filter(q=>q.exerciseId===target).map(q=>({reason:q.reason,logged:q.logged,question:q.question}))});
 const o=v=>({[target]:{load:kg(v,conv)}});
 const first=ev(p,0,o(16));res.firstLog16=summary(first,p,0);
 const typo=ev(p,0,o(160));res.firstLog160=summary(typo,p,0);
 res.confirm16kg=summary(ev(p,0,o(160),{loadConfirmations:[{exerciseId:target,value:16,unit:'KG',convention:conv}]}),p,0);
 res.confirm35lb=summary(ev(p,0,o(160),{loadConfirmations:[{exerciseId:target,value:35,unit:'LB',convention:conv}]}),p,0);
 res.confirmOtherConvention=summary(ev(p,0,o(160),{loadConfirmations:[{exerciseId:target,value:16,unit:'KG',convention:conv==='PER_HAND'?'TOTAL':'PER_HAND'}]}),p,0);
 res.confirm160=summary(ev(p,0,o(160),{loadConfirmations:[{exerciseId:target,value:160,unit:'KG',convention:conv}]}),p,0);
 res.confirmUnknownUnit=summary(ev(p,0,o(160),{loadConfirmations:[{exerciseId:target,value:16,unit:'STONE',convention:conv}]}),p,0);
 // later exposure agreeing / disagreeing
 const p1=first.proposal;
 if(p1){
  const step=POL.operational.strength.smallestIncrement[conv]??0;
  const agree=ev(p1,1,o(16+step),{actualLedger:first.actualLedger});res.week1AgreeWithinOneIncrement=summary(agree,p1,1);
  const disagree=ev(p1,1,o(16+2*step+0.5),{actualLedger:first.actualLedger});res.week1DisagreeTwoIncrements=summary(disagree,p1,1);
  res.pendingCarriedInProposalWhenChanged={proposalPresent:!!disagree.proposal,status:disagree.status,pendingNext:disagree.proposal?.stateTrace?.[2]?.strength?.exercises?.[target]?.pendingLoad??null};
  // progression while pending: none
  res.week1RowsWhilePending=loadsOf(p1,1,target).map(l=>({mode:l.mode,value:l.value,sets:l.sets,reps:l.reps,rir:l.rir,instructions:l.instructions}));
 }
 // two agreeing / disagreeing logs in the same week
 if(twice){
  const ids=p.weeks[0].sessions.filter(s=>s.prescription?.exercises?.some(e=>e.id===twice)).map(s=>s.id);
  const per=(a,b)=>s=>s.prescription?.exercises?.some(e=>e.id===twice)?{[twice]:{load:kg(s.id===ids[0]?a:b,p.weeks[0].sessions.flatMap(x=>x.prescription?.exercises??[]).find(e=>e.id===twice).load.convention)}}:{};
  const sameAgree=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,{},per(20,20))}),opts),sameDis=evaluateProgram(p,review(p,0,{observations:weekObs(p,0,{},per(20,60))}),opts);
  res.sameWeek={exercise:twice,sessions:ids,agree:loadsOf(sameAgree.proposal??p,1,twice).map(l=>({mode:l.mode,value:l.value})),disagree:loadsOf(sameDis.proposal??p,1,twice).map(l=>({mode:l.mode,value:l.value})),disagreeQuestions:(sameDis.loadQuestions??[]).filter(q=>q.exerciseId===twice).map(q=>q.reason)};
 }
 // hint
 const h=generateProgram(intake({id:'s8-d45-hint',weeks:8,athlete:{knownExercises:[{id:'goblet-squat',sets:3,reps:10,load:{value:16,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-08-01'}]}}),opts).program;
 const hv=v=>{const r=evaluateProgram(h,review(h,0,{observations:weekObs(h,0,{'goblet-squat':{load:kg(v,'PER_HAND')}})}),opts);return loadsOf(r.proposal??h,1,'goblet-squat').map(l=>({mode:l.mode,value:l.value}));};
 res.hint16={hintRowWeek0:loadsOf(h,0,'goblet-squat').map(l=>({mode:l.mode,value:l.value})),log18:hv(18),log14:hv(14),log24:hv(24)};
 return res;
});

// ---------------------------------------------------------------- O. return ceiling (Q3) and the return-entry week (Q4, author-found)
guard('O_returnStrength',()=>{
 const res={};
 const p=generateProgram(intake({id:'s8-ret-str',weeks:12,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT]}}),opts).program;
 const rows=(Q,x)=>Q.weeks[x].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>({s:s.id,id:e.id,sets:e.sets,reps:e.reps,rir:e.rir,mode:e.load.mode,value:e.load.value??null,rule:e.load.rule??null})));
 for(const [label,w,days] of [['pauseFromWeek0_18d',2,18],['pauseInWeek3_14d',4,14]]){
  const r0=evaluateProgram(p,review(p,w,{kind:'RETURN_AFTER_PAUSE',interruption:{days,reasonCategory:'TRAVEL',nonclinical:true}}),opts);
  const P=r0.proposal;if(!P){res[label]={status:r0.status,action:r0.action};continue;}
  const entryWeek=P.decisions.at(-1).fromWeek,before=rows(p,Math.max(0,entryWeek-1));
  const entryRows=rows(P,entryWeek);
  const o={entryWeek,entryRows,entryRowsNotAtEntryDose:entryRows.filter(e=>!(e.sets===RET.strengthEntrySets&&e.rir>=RET.strengthEntryMinimumRir)).map(e=>`${e.s}:${e.id}:${e.sets}@${e.rir}`)};
  for(const [name,v] of [['log100',100],['log80',80],['log70',70]]){
   const r=evaluateProgram(P,review(P,entryWeek,{observations:weekObs(P,entryWeek,{'back-squat':{load:kg(v)}})}),opts),Q=r.proposal??P;
   const step2=rows(Q,entryWeek+1),step3=entryWeek+2<Q.weeks.length?rows(Q,entryWeek+2):[];
   o[name]={status:r.status,questions:(r.loadQuestions??[]).filter(q=>q.exerciseId==='back-squat').map(q=>q.reason),squatStep2:step2.filter(e=>e.id==='back-squat'),squatStep3:step3.filter(e=>e.id==='back-squat'),
    step2NewExercises:step2.filter(e=>!before.some(b=>b.id===e.id)||true).filter(e=>e.id!=='back-squat').map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.mode}${e.value!=null?':'+e.value:''}`),
    step3Others:step3.filter(e=>e.id!=='back-squat').map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}:${e.mode}`)};
   if(name==='log70'&&r.proposal){
    // Q3: in return step 2 a heavier log is capped at the current reference
    const w2=entryWeek+1;
    for(const [n2,v2] of [['step2_log72.5',72.5],['step2_log75',75],['step2_log70',70]]){const r2=evaluateProgram(Q,review(Q,w2,{observations:weekObs(Q,w2,{'back-squat':{load:kg(v2)}}),actualLedger:r.actualLedger}),opts);o[n2]={status:r2.status,gate:r2.gates?.['back-squat']??null,questions:(r2.loadQuestions??[]).filter(q=>q.exerciseId==='back-squat').map(q=>q.reason),nextSquat:w2+1<Q.weeks.length?rows(r2.proposal??Q,w2+1).filter(e=>e.id==='back-squat'):[]};}
   }
  }
  res[label]=o;
 }
 return res;
});

// ---------------------------------------------------------------- P. D43 grid: run modes through taper, race window, race day and post-event
guard('P_D43grid',()=>{
 const viol={},ex={},stats={programs:0,byMode:{},completion:0,effort:0,initialWalkJogOrRestartRacingAtEffort:0,eventAmbitiousShown:0};const flag=(k,x)=>{(viol[k]??=0);viol[k]++;(ex[k]??=[]);if(ex[k].length<6)ex[k].push(x);};
 const effortRaces=[];
 const ATH={
  novice:{runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null}},
  belowMin_8_12:{runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:12,longestRunMinutes:8}},
  belowMin_14_14:{runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:14,longestRunMinutes:14}},
  belowMin_5_10:{runExperience:'EXPERIENCED',recent:{runDaysPerWeek:2,runMinutesPerWeek:10,longestRunMinutes:5}},
  restart6w:{runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},pause:{nonclinical:true,weeks:6,reasonCategory:'TRAVEL',reason:'Work travel'}},
  easyLow:{runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:40,longestRunMinutes:25}}
 };
 const DAYS=[{runDays:[1,3,6],longRunDay:6},{runDays:[2,5],longRunDay:5},{runDays:[0,2,4,6],longRunDay:6}];
 for(const [aName,a] of Object.entries(ATH))for(const kind of ['10K','HALF_MARATHON'])for(const raceWeek of [3,5,7,9,11])for(const raceDay of [2,6])for(const [di,d] of DAYS.entries()){
  const id=`s8-P-${aName}-${kind}-${raceWeek}-${raceDay}-${di}`;
  const g=generateProgram(intake({id,weeks:raceWeek+3<=8?8:raceWeek+3<=12?12:16,athlete:{goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',raceWeek*7+raceDay)}},strength:'RUNNING_SUPPORT'},knownExercises:[],...a},schedule:{...d,runMinutes:45,longRunMinutes:90}}),opts);
  if(!g.program){flag('noProgram',{id,status:g.status,errors:(g.errors??[]).slice(0,3)});continue;}
  stats.programs++;
  const P=g.program,race=sessionsOf(P).find(s=>s.role==='RACE');if(!race){flag('raceMissing',{id});continue;}
  const taperWeeks=Math.max(0,P.phases.raceWeek-(P.phases.taperStart??P.phases.raceWeek)),taperDays=E.raceWindowDays+7*taperWeeks;
  const rs=P.stateTrace[P.phases.raceWeek].run,cls=P.capability.run.class;
  stats.byMode[cls+'->'+rs.mode]=(stats.byMode[cls+'->'+rs.mode]??0)+1;
  for(const s of sessionsOf(P).filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE')){
   const b=gap(s.date,race.date),eventDay=b>=1&&b<=taperDays||b<0&&b>=-7,st=P.stateTrace[s.weekIndex].run;
   if(!eventDay)continue;
   if(st.mode==='WALK_JOG'){
    if(!['WALK_JOG','WALK'].includes(s.role))flag('walkJogModeContinuousRunOnEventDay',{id,s:s.id,role:s.role,b,minutes:s.prescription.durationMinutes});
    if(s.role==='WALK_JOG'&&(s.progression?.value??0)>st.walkStep)flag('walkJogAboveCurrentStepOnEventDay',{id,s:s.id,b,step:s.progression?.value,current:st.walkStep});
   }
   if(st.mode==='RESTART'){
    if(['QUALITY','RACE_TOUCH','LONG'].includes(s.role)||s.prescription.strides)flag('restartModeHardOrLongOnEventDay',{id,s:s.id,role:s.role,b});
    if(['EASY','SHAKEOUT','RECOVERY_EASY'].includes(s.role)&&s.prescription.durationMinutes>Math.max(st.restart??RET.entryRunMinutes,RET.entryRunMinutes))flag('restartModeAboveCurrentMinutes',{id,s:s.id,role:s.role,b,minutes:s.prescription.durationMinutes,current:st.restart});
   }
   if(s.prescription.strides&&!((st.achieved?.strides??0)>0))flag('stridesWithoutAchievedOnEventDay',{id,s:s.id,role:s.role,b});
  }
  // no ladder or restart step on event weeks
  for(let w=0;w<P.weeks.length-1;w++){const a1=P.stateTrace[w].run,b1=P.stateTrace[w+1].run,ph=P.phases.phases[w];if(['TAPER','RACE_WEEK','POST_EVENT'].includes(ph)){if(a1.mode==='WALK_JOG'&&b1.mode==='WALK_JOG'&&b1.walkStep>a1.walkStep)flag('ladderAdvancesInEventWeek',{id,w,ph});if(a1.mode==='WALK_JOG'&&b1.mode!=='WALK_JOG')flag('ladderExitInEventWeek',{id,w,ph,to:b1.mode});if(a1.mode==='RESTART'&&b1.mode==='RESTART'&&b1.restart>a1.restart)flag('restartAdvancesInEventWeek',{id,w,ph});}}
  const rp=race.prescription;
  const expect=['WALK_JOG','RESTART','RETURN'].includes(rs.mode)||kind==='HALF_MARATHON'&&(rs.achieved?.long??0)<E.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes;
  if(!!rp.completion!==expect)flag('completionRuleMismatch',{id,mode:rs.mode,completion:!!rp.completion});
  if(rp.completion){stats.completion++;if(rp.instructions.some(i=>/strides/.test(i)&&!/no strides/.test(i)))flag('completionWithStrides',{id});if(rp.instructions.some(i=>/whether to press/.test(i)))flag('completionWithPress',{id});}
  else{stats.effort++;if(rp.instructions.some(i=>/relaxed strides/.test(i))&&!((rs.achieved?.strides??0)>0))flag('effortRaceStridesWithoutAchieved',{id});}
  const amb=g.negotiation.find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');if(amb)stats.eventAmbitiousShown++;
  if(rp.completion&&!amb)flag('completionWithoutNegotiation',{id});
  if(amb&&!(amb.options?.some(o=>/walk breaks/i.test(o))&&amb.options?.some(o=>/later or shorter/i.test(o))))flag('negotiationOptionsIncomplete',{id,options:amb.options});
  // the round-8 question: athletes who entered the plan as WALK_JOG or RESTART and race at race effort
  if(['WALK_JOG','RESTART'].includes(cls)&&!rp.completion){
   stats.initialWalkJogOrRestartRacingAtEffort++;
   const prior=sessionsOf(P).filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&s.date<race.date);
   const longestContinuous=Math.max(0,...prior.filter(s=>['EASY','LONG','RECOVERY_EASY','SHAKEOUT'].includes(s.role)).map(s=>s.prescription.durationMinutes));
   effortRaces.push({id,cls,modeAtRace:rs.mode,kind,raceWeek,achieved:rs.achieved,longestPlannedContinuousRunBeforeRace:longestContinuous,raceEffort:rp.effortDomain,eventAmbitious:!!amb,firstEasyWeek:P.stateTrace.findIndex(x=>x.run.mode==='EASY')});
  }
 }
 const byKind=effortRaces.reduce((m,r)=>{const k=r.kind+':'+r.cls;(m[k]??=[]).push(r.longestPlannedContinuousRunBeforeRace);return m;},{});
 return {stats,violations:viol,examples:ex,initialWalkJogOrRestartAtEffort:{count:effortRaces.length,longestContinuousRunRangeByKindAndClass:Object.fromEntries(Object.entries(byKind).map(([k,v])=>[k,{n:v.length,min:Math.min(...v),max:Math.max(...v)}])),sample:effortRaces.slice(0,10)}};
});

// ---------------------------------------------------------------- Q. R6: yes-meaning eligibility flags in the intake, the review and the legacy path
guard('Q_R6flags',()=>{
 const res={intake:{},review:{},legacyGenerate:{},legacyReview:{},reviewStatus:{}};
 const p=generateProgram(intake({id:'s8-r6'}),opts).program,d=addDays(p.weeks[0].startDate,6);
 const VALUES=[true,'true','TRUE',' yes ',1,'1','sim','Sim','sí','si','y','Y',false,'false','no','não',0,'0','maybe','yes.',null,undefined,2];
 for(const v of VALUES){
  const key=JSON.stringify(v)??'undefined';
  res.intake[key]=generateProgram(intake({id:'s8-r6-in',athlete:{eligibility:{...elig('2026-11-01'),injury:v}}}),opts).status;
  res.review[key]=evaluateProgram(p,review(p,0,{eligibility:{...elig(d),pain:v}}),opts).status;
 }
 for(const st of ['clinical',' Clinical ','PAIN_OR_INJURY','pain_or_injury','nonclinical_confirmed'])res.reviewStatus[st]=evaluateProgram(p,review(p,0,{eligibility:{...elig(d),status:st}}),opts).status;
 const base=canonicalAthlete('HALF_MARATHON',16);
 const lp=generateProgram(structuredClone(base),opts);
 res.legacyBaseline=lp.status;
 for(const v of ['sim',1,'true','false','maybe']){const x=structuredClone(base);x.athlete.eligibility.pain=v;res.legacyGenerate[JSON.stringify(v)]=generateProgram(x,opts).status;}
 if(lp.program){const start=lp.program.weeks[0].startDate;for(const v of ['yes',1,'no','maybe',true]){res.legacyReview[JSON.stringify(v)]=evaluateProgram(lp.program,{version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:start+'T12:00:00Z',weekIndex:0,event:{id:'s8-r6-legacy-'+String(v),kind:'WEEKLY_REVIEW'},eligibility:{...base.athlete.eligibility,assessedAt:start,illness:v}},opts).status;}}
 const yes=[true,'true','TRUE',' yes ',1,'1','sim','Sim','sí','si','y','Y'].map(v=>JSON.stringify(v));
 res.violations=[...yes.filter(k=>res.intake[k]!=='CLINICAL_HUMAN_REQUIRED').map(k=>'intake '+k),...yes.filter(k=>res.review[k]!=='CLINICAL_HUMAN_REQUIRED').map(k=>'review '+k),...['"false"','"no"','0','"maybe"','"yes."','2'].filter(k=>res.review[k]==='KEEP'||res.review[k]==='MODIFY'||res.intake[k]==='PROPOSED').map(k=>'non-boolean treated as clearance: '+k)];
 return res;
});

// ---------------------------------------------------------------- R. R7: the round-7 residuals, local negation and round-8 adversarial phrases
guard('R_R7screen',()=>{
 const T=(reason,expect,cat='OTHER_NONCLINICAL')=>({reason,expect,cat});
 const B=[
  // dossier list
  T('No broken bones','A'),T("Didn't break my leg",'A'),T('Não quebrei a perna','A'),T('No me rompí la pierna','A'),T('Nenhum osso quebrado','A'),
  T('I could not run because I broke my leg','C'),T("Didn't break my arm and broke my leg",'C'),T('Fui atropelado','C'),T('Levei uma mordida','C'),T('Parto em setembro','C'),
  T('New baby at home','X','FAMILY'),T('Crashed on the bike path','X'),T('Dog bite','X'),T('Escorreguei na chuva','X'),T('Me resbalé','X'),
  // round-8 adversarial: negation reach and grammar
  T("I don't think I broke my leg",'C'),T('Not sure if I broke my toe','C'),T('Almost broke my ankle','C'),T('No, broke my leg','C'),T('Never broke a bone, just travel','A'),
  T('No broken bones but a torn ligament','C'),T('No broken bones, just a sprained ankle','C'),T('Nothing broken, just bruised my knee','X'),T('Not broken, but cracked my rib','C'),
  T("Haven't broken anything",'N'),T('Didnt break my leg but my knee hurts','C'),T('Doctor said no broken bones','C'),
  // round-8 residual search (owned gap): birth, violence, procedures, soft-tissue words without a lexicon entry
  T('Had a C-section','X','FAMILY'),T('Cesariana em agosto','X','FAMILY'),T('Cesárea','X','FAMILY'),T('Maternity leave','X','FAMILY'),T('Licença-maternidade','X','FAMILY'),T('Baja por maternidad','X','FAMILY'),
  T('Newborn at home','X','FAMILY'),T('Recém-nascido em casa','X','FAMILY'),T('Breastfeeding','X','FAMILY'),T('Miscarriage','X','FAMILY'),T('Aborto espontâneo','X','FAMILY'),
  T('Nothing broken, just bruised','X'),T('Got mugged and beaten up','X'),T('I was assaulted','X'),T('Vasectomy','X'),T('Colonoscopy','X'),T('Root canal','X'),T('LASIK','X'),
  T('Whiplash from a car accident','C'),T('Stung by a wasp','X'),T('Burned my hand cooking','X'),T('Cut my finger badly','X'),T('Concussion','C'),T('Got dengue on holiday','C','VACATION'),
  T('Paternity leave','N','FAMILY'),T('Funeral and grief','N','FAMILY'),T('Jet lag after a long flight','N','TRAVEL')
 ];
 const results=B.map(({reason,expect,cat})=>{const r=screenInterruptionReason({reason,reasonCategory:cat,nonclinical:true});const ok=expect==='C'?r.status==='CLINICAL':expect==='N'?r.status==='NONCLINICAL':expect==='A'?r.status==='ASK':r.status!=='NONCLINICAL';return {reason,category:cat,expect,status:r.status,basis:r.basis,matched:r.matched,ok};});
 return {results,mismatches:results.filter(x=>!x.ok).map(x=>`${x.reason} [${x.category}] -> ${x.status} (expected ${x.expect})`),negatedDamageNeverNonclinical:results.filter(x=>(x.matched??[]).some(m=>/^negated damage/.test(m))).every(x=>x.status!=='NONCLINICAL')};
});

// ---------------------------------------------------------------- T. D46 side effects: walk conversion and single-day returns in projection
guard('T_D46sideEffects',()=>{
 const res={};
 // (1) EASY_LOW athlete whose easy days are all walks: do walks ever convert to runs in projection and under executed reviews?
 const inp=intake({id:'s8-T-walks',weeks:16,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:15,longestRunMinutes:15},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:45,longRunMinutes:60}});
 const g=generateProgram(inp,opts);
 if(g.program){
  const P=g.program;
  res.allWalkEasyDays={class:P.capability.run.class,initial:{easy:P.stateTrace[0].run.easy,long:P.stateTrace[0].run.long,walks:P.stateTrace[0].run.walks},projection:P.weeks.map((w,k)=>({w:k,phase:w.phase,walks:P.stateTrace[k].run.walks,roles:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role+':'+s.prescription.durationMinutes).join(' ')}))};
  const sim=simulateProgram(inp,{},opts);
  res.allWalkEasyDays.simulatedExecuted=sim.finalProgram?sim.finalProgram.weeks.map((w,k)=>({w:k,walks:sim.finalProgram.stateTrace[k].run.walks,roles:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role+':'+s.prescription.durationMinutes).join(' ')})):{status:sim.status??null};
 }else res.allWalkEasyDays={status:g.status};
 // (2) RETURN mode with a single run day that is the long-run day
 const p2=generateProgram(intake({id:'s8-T-ret1',weeks:12,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},recent:{runDaysPerWeek:1,runMinutesPerWeek:60,longestRunMinutes:60},knownExercises:[]},schedule:{runDays:[6],longRunDay:6,runMinutes:60,longRunMinutes:70}}),opts).program;
 if(p2){
  const w=4,r=evaluateProgram(p2,review(p2,w,{kind:'RETURN_AFTER_PAUSE',day:0,interruption:{days:20,reasonCategory:'WORK',nonclinical:true}}),opts),P=r.proposal;
  res.returnSingleLongDay={status:r.status,class:p2.capability.run.class,projection:P?P.stateTrace.slice(w).map((s,i)=>({w:w+i,mode:s.run.mode,returnStep:s.run.returnStep??null,roles:P.weeks[w+i].sessions.filter(x=>x.sport==='RUN'&&x.prescription).map(x=>x.role+':'+x.prescription.durationMinutes).join(' ')})):null};
  if(P){const ew=P.decisions.at(-1).fromWeek,rv=evaluateProgram(P,review(P,ew,{observations:weekObs(P,ew)}),opts);res.returnSingleLongDay.afterExecutedEntryWeek={status:rv.status,gates:rv.gates,nextMode:rv.proposal?.stateTrace?.[ew+1]?.run?.mode??null,nextReturnStep:rv.proposal?.stateTrace?.[ew+1]?.run?.returnStep??null,laterProjection:rv.proposal?rv.proposal.stateTrace.slice(ew+1).map((s,i)=>({w:ew+1+i,mode:s.run.mode,returnStep:s.run.returnStep??null})):null};}
 }
 return res;
});

// ---------------------------------------------------------------- U. strength sets through a return (D49): executed weeks, return review, executed entry and step weeks
guard('U_returnSets',()=>{
 // Consistent timelines: weeks before the pause are executed and reviewed; the pause starts on the Monday of week s and lasts d days;
 // the return review is the day after it ends; the entry and following weeks are then executed and reviewed.
 let n=0;
 const rvAt=(p,w,day,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:'s8-U-'+w+'-'+(x.kind??'W')+'-'+(n++),kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),...x};};
 let after=null,pauseFrom=null;// sessions dated inside the pause (from its start to the return review) are never executed or counted
 const live=s=>!after||s.date<pauseFrom||s.date>after;
 const wo=(p,w)=>p.weeks[w].sessions.filter(s=>s.prescription&&live(s)).map(s=>({...obs(p,s),eventId:'s8-U-'+s.id+'-'+(n++)}));
 const sets=(p,w,id)=>Math.max(0,...p.weeks[w].sessions.filter(live).flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.id===id).map(e=>e.sets));
 const st=(Q,w,id)=>{const e=Q.stateTrace[w]?.strength?.exercises?.[id];return e?' rs'+(e.returnStep??'-')+' bd'+(e.blocksDone??0):'';};
 const traces=[],viol=[];
 for(const s of [1,2,3,4,5,6,7])for(const d of [14,21,35]){
  const label='s'+s+'-d'+d,reviewAbs=s*7+d;if(Math.floor(reviewAbs/7)>=10)continue;
  after=null;pauseFrom=null;let p=generateProgram(intake({id:'s8-U-'+label,weeks:12,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT]}}),opts).program,ledger=[];
  for(let w=0;w<s;w++){const r=evaluateProgram(p,rvAt(p,w,6,{observations:wo(p,w),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
  const preBreak=sets(p,s-1,'back-squat'),rw=Math.floor(reviewAbs/7),rday=reviewAbs%7;
  const r0=evaluateProgram(p,rvAt(p,rw,rday,{kind:'RETURN_AFTER_PAUSE',interruption:{days:d,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),opts);
  if(!r0.proposal){traces.push({label,status:r0.status,reason:r0.reason});continue;}
  const P=r0.proposal,ew=P.decisions.at(-1).fromWeek,cls=P.decisions.at(-1).interruption.class;after=addDays(P.weeks[rw].startDate,rday);pauseFrom=P.weeks[s].startDate;
  let Q=P,led=r0.actualLedger;for(let w=ew;w<Math.min(Q.weeks.length-1,ew+3);w++){const r=evaluateProgram(Q,rvAt(Q,w,6,{observations:wo(Q,w),actualLedger:led}),opts);led=r.actualLedger;if(r.proposal)Q=r.proposal;}
  const ws=[];for(let w=Math.max(0,s-2);w<Math.min(Q.weeks.length,ew+4);w++)ws.push(w);
  traces.push({label,pauseStartWeek:s,days:d,class:cls,returnReviewWeek:rw,entryWeek:ew,preBreakSquatSets:preBreak,squat:ws.map(w=>w+':'+Q.phases.phases[w]+':'+sets(Q,w,'back-squat')+st(Q,w,'back-squat')).join(' | '),bench:ws.map(w=>w+':'+sets(Q,w,'db-bench-press')+st(Q,w,'db-bench-press')).join(' | ')});
  for(let w=ew+1;w<Math.min(Q.weeks.length,ew+4);w++){const a1=sets(Q,w-1,'back-squat'),b1=sets(Q,w,'back-squat');if(b1-a1>1&&Q.phases.phases[w-1]!=='CONSOLIDATION')viol.push(label+': back-squat '+a1+' -> '+b1+' sets in week '+w);}
  for(let w=ew+2;w<Math.min(Q.weeks.length,ew+4);w++)if(sets(Q,w,'back-squat')>preBreak)viol.push(label+': week '+w+' has '+sets(Q,w,'back-squat')+' back-squat sets, above the '+preBreak+' prescribed in the last week before the break');
 }
 return {traces,violations:viol};
});

fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-delta-policy4-r8.rerun-policy5.out.json'),JSON.stringify(out,null,1)+'\n');
const S=out.sections;
console.log(JSON.stringify({
 A:{stats:S.A_eventProximity.stats,violations:S.A_eventProximity.violations,error:S.A_eventProximity.error},
 B:{summary:S.B_walkJogStart.summary,violations:S.B_walkJogStart.violations,error:S.B_walkJogStart.error},
 J:S.J_clinicalScreen.mismatches??S.J_clinicalScreen.error,
 L:S.L_projectionMissingGate.stepsWithoutSession??S.L_projectionMissingGate.error,
 M:S.M_D44.violations??S.M_D44.error,
 P:{stats:S.P_D43grid.stats,violations:S.P_D43grid.violations,effort:S.P_D43grid.initialWalkJogOrRestartAtEffort,error:S.P_D43grid.error},
 Q:S.Q_R6flags.violations??S.Q_R6flags.error,
 R:{mismatches:S.R_R7screen.mismatches,neverNonclinical:S.R_R7screen.negatedDamageNeverNonclinical,error:S.R_R7screen.error},
 errors:Object.entries(S).filter(([,v])=>v?.error).map(([k,v])=>k+': '+v.error.slice(0,300))
},null,1));
