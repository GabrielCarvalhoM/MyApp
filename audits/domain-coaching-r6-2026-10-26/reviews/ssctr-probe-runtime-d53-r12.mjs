// SSCTR R6 round-12 runtime delta probe (D53 fix, same policy R6-POLICY-5, hash 18ec48f3...). Reviewer-authored, read-only use of the
// runtime, with a DEV_TEST_ONLY authority bound to the current policy hash (CoachingCore/r6/fixtures/dev-authority.mjs), not the real
// authority. Observations only; not quality evidence. Built from a byte copy of ssctr-probe-runtime-d52-r11.mjs (left unchanged): every
// round-11 section keeps its logic and athlete ids, so it compares directly with ssctr-probe-runtime-d52-r11.out.json (section
// COMPARE_round11Output). Additions, all after the round-11 sections: a temporary copy of the runtime with the reviewed round-11
// r6-program.mjs (OS temp directory, removed at the end; nothing under CoachingCore/ is touched); AHb (probe AH on that copy); AI (the
// whole set-count trajectory after every performed re-establishment, over a wider grid, against the gates the reviews returned); AJ (a
// re-establishment of a from-log state: pending, unlogged or re-established without a log); AK (re-establishments in reduced phases);
// AL (the regain cap's life: returns, second gaps, held weeks, rotation, a substitution window); AM (dossier Q4 split weeks with the cap).
// The round-11 header follows unchanged.
// SSCTR R6 round-11 runtime delta probe (D52 fix, same policy R6-POLICY-5, hash 18ec48f3...). Reviewer-authored, read-only use of the
// runtime. Uses a DEV_TEST_ONLY authority bound to the current policy hash (CoachingCore/r6/fixtures/dev-authority.mjs), not the real
// authority (which also enables the boundaries through my round-10 records). Observations only; not quality evidence.
// Built from a byte copy of ssctr-probe-runtime-d50-d51-r10.mjs (left unchanged). Sections A-D, G, I-Y, S, S2, Y2 and Z keep the round-10
// logic and athlete ids, so they compare directly with ssctr-probe-runtime-d50-d51-r10.out.json (section COMPARE_round10Output). Changes:
// the runtime clock is read from lastPerformed (a local date; lastWeek no longer exists) in Y2 and Z, falling back to lastWeek only on the
// round-10 runtime copy; Y2 also audits every state's lastPerformed against this probe's own record of executed dates and every FROM_LOG
// row against its own record of logged loads; Z is a function so it can run on the reviewed round-10 runtime (Zb). S2b and Y2b (the
// reconstructed round-9 runtime) are not re-run. New round-11 sections: Zb, AA (dossier Q1), AB (Q2), AC (Q3), AD (Q4), AE (the
// author-found conflict filter), AF (skipped reviews, disclosed), AG (a never-performed exercise prescribed during a return, disclosed).
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram,evaluateProgram} from '../../../CoachingCore/src/r6-index.mjs';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {runMinutesOf,skeletonOf} from '../../../CoachingCore/src/r6-program.mjs';
import {screenInterruptionReason} from '../../../CoachingCore/src/r6-clinical.mjs';
import {simulateProgram} from '../../../CoachingCore/src/r6-simulator.mjs';
import {devAuthority} from '../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {canonicalAthlete} from '../../../CoachingCore/r5/fixtures/canonical.mjs';

const opts={authority:devAuthority()},POL=opts.authority.policy,E=POL.operational.event,R=POL.operational.run,L=POL.operational.establishment,RET=POL.operational.return;
const EXPECTED='18ec48f34768a7eebb2aede618db65a77385efebbda0a38d6f03135e5cd96b4c';
if(opts.authority.policyHash!==EXPECTED)throw new Error('policy hash changed: '+opts.authority.policyHash);
const elig=(d,o={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...o});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
// Round 11: the runtime's resume clock in days for a row on `date`: lastPerformed (current runtime); lastWeek only on the round-10 copy.
const clockDays=(ex,w,date)=>ex?.lastPerformed?gap(ex.lastPerformed,date):Number.isInteger(ex?.lastWeek)?(w-ex.lastWeek-1)*7:null;
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
 return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+time,weekIndex:w,event:{id:id??`s9-${kind}-w${w}-d${day}`,kind},eligibility:eligibility??elig(date),...extra};
}
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
/** Execution report; per-exercise overrides {id:{load,reps,rir,noRir}} for strength. `sessionOver(s)` may return per-session overrides. */
function obs(p,s,{over={},eventId=null,response=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{};const load=o.load!==undefined?o.load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.unit==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:e.sets},()=>{const set={reps:o.reps??e.reps,load};if(!o.noRir)set.rir=o.rir??e.rir;return set;})};});
 return {eventId:eventId??`s9-${p.athleteId}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:response??{...OK}};
}
const weekObs=(p,w,over={},perSession=null)=>p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(p,s,{over:perSession?perSession(s)??over:over}));
const sessionsOf=p=>p.weeks.flatMap(w=>w.sessions);
const loadsOf=(p,w,id)=>p.weeks[w].sessions.flatMap(s=>s.prescription?.exercises??[]).filter(e=>e.id===id).map(e=>({mode:e.load.mode,value:e.load.value??null,sets:e.sets,reps:e.reps,rir:e.rir,rule:e.load.rule??null,instructions:e.instructions}));
const kg=(v,c='TOTAL')=>({value:v,unit:'KG',convention:c});
// Round 9, computed from the prescribed sessions (not from the runtime's own history fields): did the program prescribe a walk/jog
// or restart session in any week before race week, and what is the longest continuous run prescribed before race week?
const HISTORY_DIMS=['WALK_JOG_STEP','RESTART_MINUTES'];
const historyFromSessions=(P,raceWeek)=>P.weeks.slice(0,raceWeek).some(w=>w.sessions.some(s=>s.sport==='RUN'&&s.prescription&&HISTORY_DIMS.includes(s.progression?.dimension)));
const historyFromTrace=(P,raceWeek)=>P.stateTrace.slice(0,raceWeek).some(s=>['WALK_JOG','RESTART'].includes(s.run.mode));
const continuousOf=s=>!s.prescription||s.sport!=='RUN'?0:['EASY','LONG'].includes(s.role)&&s.prescription.family!=='WALK'?s.prescription.durationMinutes:s.role==='WALK_JOG'&&s.prescription.work?.recoverySeconds===0?Math.round(s.prescription.work.repetitions*s.prescription.work.workSeconds/60):0;
const longestContinuousBefore=(P,raceWeek,fromWeek=0)=>Math.max(0,...P.weeks.slice(fromWeek,raceWeek).flatMap(w=>w.sessions.map(continuousOf)));
const expectedCompletionR9=(P,kind)=>{const rw=P.phases.raceWeek,rs=P.stateTrace[rw].run;return ['WALK_JOG','RESTART','RETURN'].includes(rs.mode)||historyFromSessions(P,rw)||kind==='HALF_MARATHON'&&(rs.achieved?.long??0)<E.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes;};
const expectedCompletionR8=(P,kind)=>{const rs=P.stateTrace[P.phases.raceWeek].run;return ['WALK_JOG','RESTART','RETURN'].includes(rs.mode)||kind==='HALF_MARATHON'&&(rs.achieved?.long??0)<E.raceDayCompletion.halfMarathonAchievedLongRunBelowMinutes;};
const ambItem=(list)=>(list??[]).find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING')??null;
const out={probe:'R6-SSCTR-RUNTIME-D53-R12',policyHash:opts.authority.policyHash,authorityUsed:'DEV_TEST_ONLY devAuthority() bound to the current policy hash',sections:{}};
const guard=(name,fn)=>{try{out.sections[name]=fn();}catch(e){out.sections[name]={error:String(e?.stack??e).slice(0,1500)};}};

// ---------------------------------------------------------------- A. event proximity by days (round-7 logic unchanged) + R10 floor
guard('A_eventProximity',()=>{
 const DAYSETS=[{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6},{runDays:[0,2,4,6],strengthDays:[1,5],longRunDay:6},{runDays:[2,4,5],strengthDays:[3,6],longRunDay:5},{runDays:[0,3,5],strengthDays:[0,3,6],longRunDay:0},{runDays:[1,2,4,6],strengthDays:[1,4,6],longRunDay:4}];
 const v={},stats={programs:0,statuses:{},touches:0,windowStrengthSessions:0,progressive:{windowBelowTaper:0,taperNotAbovePreTaper:0,checked:0},raceCompletion:0,raceEffort:0,warmupStridesWithoutAchieved:0,r10Checked:0},ex={};
 const flag=(k,x)=>{(v[k]??=0);v[k]++;(ex[k]??=[]);if(ex[k].length<4)ex[k].push(x);};
 for(const kind of ['10K','HALF_MARATHON'])for(const raceWeek of [3,5,7,10])for(let raceDay=0;raceDay<7;raceDay++)for(const [di,days] of DAYSETS.entries())for(const strength of ['STRENGTH','RUNNING_SUPPORT','MAINTAIN']){
  const id=`s9-rp-${kind}-${raceWeek}-${raceDay}-${di}-${strength}`;
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
  // round 9: completion by the D47 rule (race-week mode, program history from the sessions, half-marathon long run); the item follows it
  const expectCompletion=expectedCompletionR9(P,kind),amb=ambItem(g.negotiation);
  if(!!rp.completion!==expectCompletion)flag('completionRuleMismatch',{id,mode:rs.mode,achievedLong:rs.achieved?.long,completion:!!rp.completion});
  if(!!rp.completion!==!!amb)flag('completionItemMismatch',{id,completion:!!rp.completion,item:!!amb});
  if(historyFromSessions(P,P.phases.raceWeek)!==historyFromTrace(P,P.phases.raceWeek))flag('historySessionsTraceDisagree',{id});
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
  const id=`s9-wj-${exp}-${W}-${Lg}-${runDays.length}`;
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
 {name:'QRE-R6-19 judge case',in:intake({id:'s9-walkonly',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-13'}},strength:'STRENGTH'},runExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:10,longestRunMinutes:5},knownExercises:[]},schedule:{runDays:[5],strengthDays:[4,5],runMinutes:30,strengthMinutes:45,longRunMinutes:30,longRunDay:5}})},
 {name:'novice 10K in 8 weeks, 3 run days',in:intake({id:'s9-wj-10k-8',weeks:8,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',7*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 {name:'restart after a 6-week nonclinical pause, 10K in 6 weeks',in:intake({id:'s9-rs-10k',weeks:8,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',5*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},pause:{nonclinical:true,weeks:6,reasonCategory:'TRAVEL',reason:'Work travel'},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 {name:'non-novice below minimum, HM in 12 weeks',in:intake({id:'s9-wj-hm-12',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:12,longestRunMinutes:8},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 // round 8: same below-minimum athlete with a 10K, and a raised start that exits the ladder before the race
 {name:'non-novice below minimum, 10K in 12 weeks',in:intake({id:'s9-wj-10k-12',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:12,longestRunMinutes:8},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 {name:'non-novice below minimum (L 14, W 14), 10K in 10 weeks',in:intake({id:'s9-wj-10k-10',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',9*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:14,longestRunMinutes:14},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
 {name:'novice 10K in 12 weeks, 3 run days',in:intake({id:'s9-wj-10k-novice-12',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})}
];
guard('C_walkJogEvent',()=>C_CASES.map(({name,in:i})=>describe(name,generateProgram(i,opts))));

// ---------------------------------------------------------------- D. logged-load adoption (round-7 cases unchanged; D44/D45 outcomes)
guard('D_loggedLoad',()=>{
 const res={};
 const p=generateProgram(intake({id:'s9-load',weeks:8}),opts).program;
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
 const q=generateProgram(intake({id:'s9-est',weeks:8,athlete:{knownExercises:[]}}),opts).program;
 const estRow=sessionsOf(q).filter(s=>s.weekIndex===0&&s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='ESTABLISH').map(e=>({session:s.id,id:e.id,load:e.load,sets:e.sets,reps:e.reps,rir:e.rir})))[0]??null;
 const exRows=(prog,w,id)=>sessionsOf(prog).filter(s=>s.weekIndex===w&&s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>e.load));
 const runEst=(name,v)=>{if(!estRow){res[name]={note:'no ESTABLISH row in week 0'};return;}const r=evaluateProgram(q,review(q,0,{observations:q.weeks[0].sessions.filter(s=>s.prescription).map(s=>obs(q,s,{over:{[estRow.id]:{load:{value:v,unit:'KG',convention:estRow.load.convention}}}}))}),opts);res[name]={status:r.status,action:r.action,week0Row:estRow,week1:exRows(r.proposal??q,1,estRow.id),week2:exRows(r.proposal??q,2,estRow.id),loadQuestions:(r.loadQuestions??[]).filter(x=>x.exerciseId===estRow.id).map(x=>x.reason)};};
 runEst('establish_log_16_per_hand',16);runEst('establish_log_160_per_hand_typo',160);
 return res;
});

// ---------------------------------------------------------------- G. conflicts (round-7 logic unchanged)
guard('G_conflicts',()=>{
 const p=generateProgram(intake({id:'s9-act'}),opts).program,[a,b]=p.weeks[0].sessions.filter(s=>s.sport==='RUN');
 const src={provider:'WEARABLE:X',activityId:'act-SAME',quality:'WEARABLE_FULL'};
 const oa={...obs(p,a,{eventId:'s9-a'}),source:src},ob={...obs(p,b,{eventId:'s9-b'}),observedAt:a.date+'T08:00:00Z',source:src};
 const r=evaluateProgram(p,review(p,0,{observations:[oa,ob]}),opts);
 return {sessionStatuses:r.weekEvidence.rows.filter(x=>[a.id,b.id].includes(x.sessionId)).map(x=>({id:x.sessionId,status:x.status})),conflicts:r.provenance.conflicts,ledgerRows:r.actualLedger.filter(x=>x.provenance?.activityId==='act-SAME').map(x=>({sessionId:x.sessionId,conflicted:!!x.conflicted}))};
});

// ---------------------------------------------------------------- I. return facts (round-7 logic unchanged; R6 changes eligibility forms)
guard('I_return',()=>{
 const p=generateProgram(intake({id:'s9-ret',weeks:12}),opts).program,w=4,end=addDays(p.weeks[w].startDate,-1);
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
 const input=intake({id:'s9-gate-wj',weeks:8,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:10,longestRunMinutes:6}},schedule:{runDays:[1,4],longRunDay:4}});
 const sim=simulateProgram(input,{default:{missed:[{sport:'RUN'}]}},opts);
 return {walkStepByWeek:sim.finalProgram.stateTrace.map(s=>s.run.mode+':'+(s.run.walkStep??'-')),executedRuns:sim.actualLedger.filter(o=>o.context?.sport==='RUN').length};
});

// ---------------------------------------------------------------- L. projection gating (round-7 logic unchanged; D46)
guard('L_projectionMissingGate',()=>{
 const rows=[];
 const inputs=[
  intake({id:'s9-L-wj',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-13'}},strength:'STRENGTH'},runExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:10,longestRunMinutes:5},knownExercises:[]},schedule:{runDays:[5],strengthDays:[4,5],runMinutes:30,strengthMinutes:45,longRunMinutes:30,longRunDay:5}}),
  intake({id:'s9-L-easy-mon',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',7*7)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:70,longestRunMinutes:30}},schedule:{runDays:[1,3,6],longRunDay:6}})
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
 const p=generateProgram(intake({id:'s9-d44',weeks:8}),opts).program,res={planned:loadsOf(p,0,'back-squat').map(l=>({value:l.value,sets:l.sets,reps:l.reps,rir:l.rir}))};
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
 const p=generateProgram(intake({id:'s9-d45',weeks:8,athlete:{knownExercises:[]}}),opts).program;
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
 const h=generateProgram(intake({id:'s9-d45-hint',weeks:8,athlete:{knownExercises:[{id:'goblet-squat',sets:3,reps:10,load:{value:16,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-08-01'}]}}),opts).program;
 const hv=v=>{const r=evaluateProgram(h,review(h,0,{observations:weekObs(h,0,{'goblet-squat':{load:kg(v,'PER_HAND')}})}),opts);return loadsOf(r.proposal??h,1,'goblet-squat').map(l=>({mode:l.mode,value:l.value}));};
 res.hint16={hintRowWeek0:loadsOf(h,0,'goblet-squat').map(l=>({mode:l.mode,value:l.value})),log18:hv(18),log14:hv(14),log24:hv(24)};
 return res;
});

// ---------------------------------------------------------------- O. return ceiling (Q3) and the return-entry week (Q4, author-found)
guard('O_returnStrength',()=>{
 const res={};
 const p=generateProgram(intake({id:'s9-ret-str',weeks:12,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT]}}),opts).program;
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
  const id=`s9-P-${aName}-${kind}-${raceWeek}-${raceDay}-${di}`;
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
  // round 9: D47 expectation (program history computed from the prescribed sessions); the round-8 expectation is kept for traceability
  const expect=expectedCompletionR9(P,kind);
  if(!!rp.completion!==expect)flag('completionRuleMismatch',{id,mode:rs.mode,completion:!!rp.completion});
  if(!!rp.completion!==expectedCompletionR8(P,kind))stats.completionDiffersFromRound8Rule=(stats.completionDiffersFromRound8Rule??0)+1;
  if(historyFromSessions(P,P.phases.raceWeek)!==historyFromTrace(P,P.phases.raceWeek))flag('historySessionsTraceDisagree',{id});
  {const amb0=ambItem(g.negotiation);if(amb0){
   (stats.byBasis??={})[amb0.basis]=(stats.byBasis[amb0.basis]??0)+1;
   const L0=longestContinuousBefore(P,P.phases.raceWeek);
   if(amb0.longestContinuousRunMinutes!==L0)flag('statedLongestDiffersFromSessions',{id,stated:amb0.longestContinuousRunMinutes,fromSessions:L0,mode:rs.mode});
   if(/ 0 minutes/.test(amb0.detail))flag('itemStatesZeroMinutes',{id,detail:amb0.detail});
   if(L0>0&&rs.mode!=='RETURN'&&!amb0.detail.includes(L0+' minutes'))flag('itemOmitsLongestRun',{id,L0,detail:amb0.detail});
   (stats.statedLongestByBasisKind??={});const k=amb0.basis+':'+kind+':'+P.capability.run.class;const b=stats.statedLongestByBasisKind[k]??={n:0,min:Infinity,max:0};b.n++;b.min=Math.min(b.min,L0);b.max=Math.max(b.max,L0);
   if(stats.sampleDetails===undefined)stats.sampleDetails={};if(!stats.sampleDetails[amb0.basis])stats.sampleDetails[amb0.basis]=amb0.detail;
  }}
  if(rp.completion){stats.completion++;if(rp.instructions.some(i=>/strides/.test(i)&&!/no strides/.test(i)))flag('completionWithStrides',{id});if(rp.instructions.some(i=>/whether to press/.test(i)))flag('completionWithPress',{id});}
  else{stats.effort++;if(rp.instructions.some(i=>/relaxed strides/.test(i))&&!((rs.achieved?.strides??0)>0))flag('effortRaceStridesWithoutAchieved',{id});}
  const amb=g.negotiation.find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING');if(amb)stats.eventAmbitiousShown++;
  if(rp.completion&&!amb)flag('completionWithoutNegotiation',{id});
  if(amb&&!rp.completion)flag('negotiationWithoutCompletion',{id});
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
 const p=generateProgram(intake({id:'s9-r6'}),opts).program,d=addDays(p.weeks[0].startDate,6);
 const VALUES=[true,'true','TRUE',' yes ',1,'1','sim','Sim','sí','si','y','Y',false,'false','no','não',0,'0','maybe','yes.',null,undefined,2];
 for(const v of VALUES){
  const key=JSON.stringify(v)??'undefined';
  res.intake[key]=generateProgram(intake({id:'s9-r6-in',athlete:{eligibility:{...elig('2026-11-01'),injury:v}}}),opts).status;
  res.review[key]=evaluateProgram(p,review(p,0,{eligibility:{...elig(d),pain:v}}),opts).status;
 }
 for(const st of ['clinical',' Clinical ','PAIN_OR_INJURY','pain_or_injury','nonclinical_confirmed'])res.reviewStatus[st]=evaluateProgram(p,review(p,0,{eligibility:{...elig(d),status:st}}),opts).status;
 const base=canonicalAthlete('HALF_MARATHON',16);
 const lp=generateProgram(structuredClone(base),opts);
 res.legacyBaseline=lp.status;
 for(const v of ['sim',1,'true','false','maybe']){const x=structuredClone(base);x.athlete.eligibility.pain=v;res.legacyGenerate[JSON.stringify(v)]=generateProgram(x,opts).status;}
 if(lp.program){const start=lp.program.weeks[0].startDate;for(const v of ['yes',1,'no','maybe',true]){res.legacyReview[JSON.stringify(v)]=evaluateProgram(lp.program,{version:'R5-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:start+'T12:00:00Z',weekIndex:0,event:{id:'s9-r6-legacy-'+String(v),kind:'WEEKLY_REVIEW'},eligibility:{...base.athlete.eligibility,assessedAt:start,illness:v}},opts).status;}}
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
  T('Paternity leave','N','FAMILY'),T('Funeral and grief','N','FAMILY'),T('Jet lag after a long flight','N','TRAVEL'),
  // round 9 (R11): spellings, the hyphen join, the new body parts and damage verbs, and expected clinical outcomes
  T('C section in May','C','FAMILY'),T('c-section','C','FAMILY'),T('Caesarean birth','C','FAMILY'),T('Cesárea programada','C','FAMILY'),T('Miscarried in March','C','FAMILY'),T('Tive um aborto','C','FAMILY'),
  T('Recem nascido em casa','A','FAMILY'),T('Recién nacido en casa','A','FAMILY'),T('Recém nascidos gêmeos','A','FAMILY'),T('Amamentando','A','FAMILY'),T('Lactancia','A','FAMILY'),T('Licença maternidade','A','FAMILY'),
  T('Endoscopy','C'),T('Tratamento de canal','C'),T('Colonoscopia','C'),T('Vasectomia','C'),T('Endodoncia','C'),
  T('Burned my hand cooking','C'),T('Burnt my arm','C'),T('Queimei a mão','C'),T('Me quemé la mano','C'),T('Cortei o dedo','C'),T('Cut my thumb','C'),T('Broke my nose','C'),
  T('Got mugged','A'),T('Assaltado na rua','A'),T('Agredido','A'),T('Stung by a bee','A'),T('Picada de abelha','A'),T('Bruised my knee','X'),T('Hematoma na coxa','X'),
  // round 9: conservative false positives the new words can create (expected not NONCLINICAL; recorded, not defects)
  T('Cut back on running for a work project','X','WORK'),T('Had to face a lot of deadlines','X','WORK'),T('Keeping an eye on the kids','X','FAMILY'),T('Burned out at work','X','WORK'),
  T('Birthday trip','N','TRAVEL'),T('Moving house','N','MOVING')
 ];
 const results=B.map(({reason,expect,cat})=>{const r=screenInterruptionReason({reason,reasonCategory:cat,nonclinical:true});const ok=expect==='C'?r.status==='CLINICAL':expect==='N'?r.status==='NONCLINICAL':expect==='A'?r.status==='ASK':r.status!=='NONCLINICAL';return {reason,category:cat,expect,status:r.status,basis:r.basis,matched:r.matched,ok};});
 return {results,mismatches:results.filter(x=>!x.ok).map(x=>`${x.reason} [${x.category}] -> ${x.status} (expected ${x.expect})`),negatedDamageNeverNonclinical:results.filter(x=>(x.matched??[]).some(m=>/^negated damage/.test(m))).every(x=>x.status!=='NONCLINICAL')};
});

// ---------------------------------------------------------------- T. D46 side effects: walk conversion and single-day returns in projection
guard('T_D46sideEffects',()=>{
 const res={};
 // (1) EASY_LOW athlete whose easy days are all walks: do walks ever convert to runs in projection and under executed reviews?
 const inp=intake({id:'s9-T-walks',weeks:16,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:15,longestRunMinutes:15},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:45,longRunMinutes:60}});
 const g=generateProgram(inp,opts);
 if(g.program){
  const P=g.program;
  res.allWalkEasyDays={class:P.capability.run.class,initial:{easy:P.stateTrace[0].run.easy,long:P.stateTrace[0].run.long,walks:P.stateTrace[0].run.walks},projection:P.weeks.map((w,k)=>({w:k,phase:w.phase,walks:P.stateTrace[k].run.walks,roles:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role+':'+s.prescription.durationMinutes).join(' ')}))};
  const sim=simulateProgram(inp,{},opts);
  res.allWalkEasyDays.simulatedExecuted=sim.finalProgram?sim.finalProgram.weeks.map((w,k)=>({w:k,walks:sim.finalProgram.stateTrace[k].run.walks,roles:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role+':'+s.prescription.durationMinutes).join(' ')})):{status:sim.status??null};
 }else res.allWalkEasyDays={status:g.status};
 // (2) RETURN mode with a single run day that is the long-run day
 const p2=generateProgram(intake({id:'s9-T-ret1',weeks:12,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},recent:{runDaysPerWeek:1,runMinutesPerWeek:60,longestRunMinutes:60},knownExercises:[]},schedule:{runDays:[6],longRunDay:6,runMinutes:60,longRunMinutes:70}}),opts).program;
 if(p2){
  const w=4,r=evaluateProgram(p2,review(p2,w,{kind:'RETURN_AFTER_PAUSE',day:0,interruption:{days:20,reasonCategory:'WORK',nonclinical:true}}),opts),P=r.proposal;
  res.returnSingleLongDay={status:r.status,class:p2.capability.run.class,projection:P?P.stateTrace.slice(w).map((s,i)=>({w:w+i,mode:s.run.mode,returnStep:s.run.returnStep??null,roles:P.weeks[w+i].sessions.filter(x=>x.sport==='RUN'&&x.prescription).map(x=>x.role+':'+x.prescription.durationMinutes).join(' ')})):null};
  if(P){const ew=P.decisions.at(-1).fromWeek,rv=evaluateProgram(P,review(P,ew,{observations:weekObs(P,ew)}),opts);res.returnSingleLongDay.afterExecutedEntryWeek={status:rv.status,gates:rv.gates,nextMode:rv.proposal?.stateTrace?.[ew+1]?.run?.mode??null,nextReturnStep:rv.proposal?.stateTrace?.[ew+1]?.run?.returnStep??null,laterProjection:rv.proposal?rv.proposal.stateTrace.slice(ew+1).map((s,i)=>({w:ew+1+i,mode:s.run.mode,returnStep:s.run.returnStep??null})):null};}
 }
 return res;
});

// ---------------------------------------------------------------- U. strength sets through a return (D49), round-9 expectations
// Consistent timelines: weeks before the pause are executed and reviewed; the pause starts on the Monday of week s and lasts d days;
// the return review is the day after it ends; the entry and following weeks are then executed and reviewed.
// Round-9 ruling on dossier Q1: the ceiling is the last executed pre-break count OUTSIDE a phase reduction (reductions apply on
// top). The round-8 literal checks (compare with the last pre-break week, whatever its phase) are kept as literalR8 for traceability.
const ST=POL.operational.strength,REDUCED=['CONSOLIDATION','SPECIFIC','TAPER','RACE_WEEK','POST_EVENT'];
const phasedIndep=(n,phase)=>phase==='CONSOLIDATION'?Math.max(1,n-ST.consolidationSetReduction):phase==='SPECIFIC'?Math.max(1,n-1):phase==='TAPER'?Math.max(1,Math.round(Math.max(1,n-1)*E.taperStrengthSetFraction)):phase==='RACE_WEEK'?E.raceWeekStrengthSets:phase==='POST_EVENT'?E.postEventStrengthSets:n;
const step2Indep=ceiling=>Math.max(1,Math.min(ceiling-1,RET.strengthEntrySets+1));
let UN=0;
function returnTimeline({label,s,d,weeks=12,known=[SQUAT],goal='STRENGTH',execAfter=5,id='back-squat',rotation=null,schedule={},event=null,inspect=null}){
 const rvAt=(p,w,day,x={})=>{const dd=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:'s9-U-'+label+'-'+w+'-'+(x.kind??'W')+'-'+(UN++),kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(dd),...x};};
 let after=null,pauseFrom=null;
 const live=x=>!after||x.date<pauseFrom||x.date>after;
 const wo=(p,w)=>p.weeks[w].sessions.filter(x=>x.prescription&&live(x)).map(x=>({...obs(p,x),eventId:'s9-U-'+label+'-'+x.id+'-'+(UN++)}));
 const rowsOf=(p,w)=>p.weeks[w].sessions.filter(live).flatMap(x=>x.prescription?.exercises??[]).filter(e=>e.id===id);
 const sets=(p,w)=>Math.max(0,...rowsOf(p,w).map(e=>e.sets));
 const minRir=(p,w)=>Math.min(99,...rowsOf(p,w).map(e=>e.rir));
 const athlete={goals:{run:event?{kind:'RACE',event}:'PERFORMANCE',strength:goal},knownExercises:known,...(rotation?{exerciseRotationPreference:rotation}:{})};
 let p=generateProgram(intake({id:'s9-U-'+label,weeks,athlete,schedule}),opts).program,ledger=[];
 if(!p)return {label,status:'NO_PROGRAM'};
 for(let w=0;w<s;w++){const r=evaluateProgram(p,rvAt(p,w,6,{observations:wo(p,w),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const literalPreBreak=sets(p,s-1);
 let ceilWeek=-1;for(let w=s-1;w>=0;w--)if(!REDUCED.includes(p.phases.phases[w])&&rowsOf(p,w).length){ceilWeek=w;break;}
 const ceiling=ceilWeek>=0?sets(p,ceilWeek):null;
 const reviewAbs=s*7+d,rw=Math.floor(reviewAbs/7),rday=reviewAbs%7;
 if(rw>=p.weeks.length-1)return {label,skipped:'return review beyond horizon'};
 const r0=evaluateProgram(p,rvAt(p,rw,rday,{kind:'RETURN_AFTER_PAUSE',interruption:{days:d,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),opts);
 if(!r0.proposal)return {label,status:r0.status,reason:r0.reason};
 const P=r0.proposal,ew=P.decisions.at(-1).fromWeek,cls=P.decisions.at(-1).interruption.class;after=addDays(P.weeks[rw].startDate,rday);pauseFrom=P.weeks[s].startDate;
 let Q=P,led=r0.actualLedger;const last=Math.min(Q.weeks.length-1,ew+execAfter);
 for(let w=ew;w<last;w++){const r=evaluateProgram(Q,rvAt(Q,w,6,{observations:wo(Q,w),actualLedger:led}),opts);led=r.actualLedger;if(r.proposal)Q=r.proposal;}
 const exState=w=>Q.stateTrace[w]?.strength?.exercises?.[id]??null,planned=w=>Q.stateTrace[w]?.strength?.planned?.[id]??null;
 const rowsW=[];for(let w=Math.max(0,s-2);w<=Math.min(Q.weeks.length-1,last);w++){const e=exState(w),pl=planned(w);rowsW.push({w,phase:Q.phases.phases[w],sets:sets(Q,w),minRir:rowsOf(Q,w).length?minRir(Q,w):null,base:pl?.baseSets??null,normal:pl?.normalSets??null,returnStep:e?.returnStep??null,blocksDone:e?.blocksDone??0,setCap:e?.setCap??null,setCeiling:e?.setCeiling??null});}
 const fmt=rowsW.map(x=>`${x.w}:${x.phase.slice(0,4)}:${x.sets}${x.base!=null&&x.base!==x.sets?'(b'+x.base+')':''}${x.returnStep!=null?' rs'+x.returnStep:''} bd${x.blocksDone}`).join(' | ');
 const v=[],lit=[];
 const at=w=>rowsW.find(x=>x.w===w);
 // entry: one set at RIR >= entry minimum
 for(const x of rowsW.filter(x=>x.w>=ew&&x.returnStep===0&&x.sets))if(rowsOf(Q,x.w).some(e=>!(e.sets===RET.strengthEntrySets&&e.rir>=RET.strengthEntryMinimumRir)))v.push(label+': entry week '+x.w+' not at the entry dose');
 // step 2 (the first week whose state is return step 1): from the ceiling, one above the entry, phase reduction on top, RIR >= 3
 const s2w=rowsW.find(x=>x.w>ew&&x.returnStep===1)?.w??null,s2=s2w!==null?at(s2w):null;
 if(s2&&ceiling!==null&&s2.sets){const b=step2Indep(ceiling);if(s2.sets!==phasedIndep(b,s2.phase))v.push(`${label}: step 2 week ${s2w} has ${s2.sets} sets, expected ${phasedIndep(b,s2.phase)} (base ${b}, ceiling ${ceiling}, ${s2.phase})`);if(s2.minRir<3)v.push(label+': step 2 RIR below 3');}
 if(s2w===null&&last>ew+1)v.push(label+': no return step 2 found');
 // after the steps: never above the ceiling (plus blocks credited after the return), one set per executed unreduced week, none after a reduced week
 // (stateTrace entries for the pause weeks are the earlier projection, never used by the return; the return starts from the state at ew)
 const bdAtReturn=at(ew)?.blocksDone??0;let climbWeeks=0;
 for(let w=(s2w??ew+1)+1;w<=last;w++){
  const a=at(w-1),b=at(w);if(!a||!b||!b.sets)continue;
  const credited=Math.max(0,(b.blocksDone??0)-bdAtReturn);
  const cap=ceiling!==null?ceiling+credited:Infinity;
  if(b.base!==null&&b.sets!==phasedIndep(b.base,b.phase))v.push(`${label}: week ${w} sets ${b.sets} are not the ${b.phase} reduction of base ${b.base}`);
  const baseB=b.base??b.sets,baseA=a.base??a.sets;
  if(baseB>cap)v.push(`${label}: week ${w} base ${baseB} above the ceiling ${cap} (pre-break unreduced ${ceiling}, credited blocks ${credited})`);
  // the one-set-per-executed-week climb governs while the return cap binds (week w-1 ended the steps or carried the cap); afterwards the approved block rules apply
  const climbing=a.returnStep===1||a.setCap!==null||b.setCap!==null;
  if(climbing){climbWeeks++;const allowed=baseA+(REDUCED.includes(a.phase)?0:1);if(baseB>allowed)v.push(`${label}: week ${w} base ${baseB} after base ${baseA} in a ${a.phase} week during the return climb`);}
 }
 // block credit: any block with a return-entry or return-step exposure of this exercise earns nothing (the block in progress at the
 // break has the entry flag from the start); the first block after it with none may earn one
 const lastStep=rowsW.filter(x=>x.w>=ew&&x.returnStep!==null&&x.sets).map(x=>x.w).at(-1)??ew;
 const ends=Q.blocks.filter(b=>DEVS.includes(b.family)&&b.endWeekExclusive>ew&&b.endWeekExclusive<=last+1);
 const blockCredit=ends.map(b=>{const before=at(b.startWeek>=ew?b.startWeek:ew)?.blocksDone??null,afterB=at(b.endWeekExclusive)?.blocksDone??null;return {block:b.id,weeks:b.startWeek+'-'+(b.endWeekExclusive-1),hadReturnExposure:b.startWeek<=lastStep,credited:before!==null&&afterB!==null?afterB-before:null};});
 for(const c of blockCredit)if(c.hadReturnExposure&&c.credited>0)v.push(`${label}: block ${c.block} (weeks ${c.weeks}) with a return exposure credited a set`);
 // round-8 literal checks, kept for traceability
 for(let w=ew+1;w<=last;w++){const a1=sets(Q,w-1),b1=sets(Q,w);if(b1-a1>1&&Q.phases.phases[w-1]!=='CONSOLIDATION')lit.push(label+': back-squat '+a1+' -> '+b1+' sets in week '+w);}
 for(let w=ew+2;w<=Math.min(last,ew+3);w++)if(sets(Q,w)>literalPreBreak)lit.push(label+': week '+w+' has '+sets(Q,w)+' sets, above the '+literalPreBreak+' prescribed in the last week before the break');
 const extra=inspect?inspect(Q,{live,after,pauseFrom,ew,v,label}):null;
 return {label,pauseStartWeek:s,days:d,class:cls,entryWeek:ew,literalPreBreakSets:literalPreBreak,lastUnreducedPreBreakWeek:ceilWeek,ceiling,timeline:fmt,climbWeeksChecked:climbWeeks,blockCredit,violations:v,literalR8:lit,...(extra?{inspect:extra}:{})};
}
const DEVS=['BUILD','DEVELOPMENT','NEXT_BLOCK'];
guard('U_returnSets',()=>{
 const traces=[];
 for(const s of [1,2,3,4,5,6,7])for(const d of [14,21,35]){if(Math.floor((s*7+d)/7)>=10)continue;traces.push(returnTimeline({label:'s'+s+'-d'+d,s,d}));}
 // Q3: a known five-set squat
 const SQUAT5={...SQUAT,sets:5};
 for(const [s,d] of [[3,14],[5,14],[3,21]])traces.push(returnTimeline({label:'five-s'+s+'-d'+d,s,d,known:[SQUAT5],execAfter:6}));
 return {traces,violations:traces.flatMap(t=>t.violations??[]),literalR8:traces.flatMap(t=>t.literalR8??[]),step2InConsolidation:traces.filter(t=>/ rs1/.test(t.timeline??'')&&(t.timeline??'').split(' | ').some(x=>/^\d+:CONS:\d.* rs1/.test(x))).map(t=>t.label)};
});

// ---------------------------------------------------------------- V. D47 beyond the starting class: restarts and goal changes applied by reviews, and the restart run history
guard('V_D47reviews',()=>{
 const res={restartByReview:[],moderateReturnBeforeRace:[],goalChange:{},longPrograms:[]},viol=[];
 let n=0;const rvAt=(p,w,day,x={})=>{const dd=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:'s9-V-'+w+'-'+(x.kind??'W')+'-'+(n++),kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(dd),...x};};
 const execUntil=(p,from,to,ledger=[],skip=()=>false)=>{for(let w=from;w<to;w++){const r=evaluateProgram(p,rvAt(p,w,6,{observations:p.weeks[w].sessions.filter(x=>x.prescription&&!skip(x)).map(x=>({...obs(p,x),eventId:'s9-V-'+x.id+'-'+(n++)})),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}return {p,ledger};};
 const raceOf=P=>sessionsOf(P).find(x=>x.role==='RACE');
 // (1) EASY athlete, 10K at week 10 (Saturday); a long nonclinical break applied by a review at different distances from the race
 for(const s of [2,3,4,5])for(const d of [30,35]){
  const raceWeek=10,label=`restart-s${s}-d${d}`;
  let p=generateProgram(intake({id:'s9-V-'+label,weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',raceWeek*7+5)}},strength:'RUNNING_SUPPORT'},knownExercises:[SQUAT],recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:60,longRunMinutes:100}}),opts).program;
  const before=ambItem(p.negotiation);
  let {p:p1,ledger}=execUntil(p,0,s);
  const preLongest=longestContinuousBefore(p1,s),reviewAbs=s*7+d,rw=Math.floor(reviewAbs/7),rday=reviewAbs%7;
  const pauseFrom=p1.weeks[s].startDate,after=addDays(p1.weeks[rw].startDate,rday);
  const r0=evaluateProgram(p1,rvAt(p1,rw,rday,{kind:'RETURN_AFTER_PAUSE',interruption:{days:d,reasonCategory:'WORK',nonclinical:true},actualLedger:ledger}),opts);
  if(!r0.proposal){res.restartByReview.push({label,status:r0.status});continue;}
  const P=r0.proposal,ew=P.decisions.at(-1).fromWeek,race=raceOf(P),rs=P.stateTrace[P.phases.raceWeek].run,item=ambItem(P.negotiation);
  // execute every week after the restart as planned, to the race week
  const stale=x=>x.date>=pauseFrom&&x.date<=after;// sessions dated inside the pause stay in the plan as planned, never executed
  const ex=execUntil(P,ew,P.phases.raceWeek,r0.actualLedger,stale);const Q=ex.p,qrs=Q.stateTrace[Q.phases.raceWeek].run,qitem=ambItem(Q.negotiation),qrace=raceOf(Q);
  const postLongest=Math.max(0,...Q.weeks.slice(ew,Q.phases.raceWeek).flatMap(w=>w.sessions.filter(x=>!stale(x)).map(continuousOf)));
  const taper=Q.weeks.filter(w=>['TAPER','RACE_WEEK'].includes(w.phase)).flatMap(w=>w.sessions.filter(x=>x.sport==='RUN'&&x.prescription&&x.role!=='RACE'&&!stale(x)).map(x=>`${x.date}:${x.role}:${x.prescription.durationMinutes}${x.prescription.strides?'+strides':''}`));
  const postStrides=Q.weeks.slice(ew,Q.phases.raceWeek).some(w=>w.sessions.some(x=>!stale(x)&&x.prescription?.strides)),postQuality=Q.weeks.slice(ew,Q.phases.raceWeek).some(w=>w.sessions.some(x=>!stale(x)&&x.role==='QUALITY'&&x.prescription));
  const runTrace=Q.stateTrace.slice(ew,Q.phases.raceWeek+1).map((st,i)=>`${ew+i}:${Q.phases.phases[ew+i].slice(0,4)}:${st.run.mode}${st.run.mode==='RESTART'?':'+st.run.restart:st.run.mode==='EASY'?':E'+st.run.easy+'/L'+st.run.long:''} lc${st.run.longestContinuous??0} [${Q.weeks[ew+i].sessions.filter(x=>x.sport==='RUN'&&x.prescription&&!stale(x)).map(x=>x.role.slice(0,4)+x.prescription.durationMinutes).join(',')}]`).join(' | ');
  const touch=sessionsOf(Q).some(x=>x.role==='RACE_TOUCH'),raceStrides=qrace.prescription.instructions.some(i=>/relaxed strides/.test(i));
  const row={label,class:P.decisions.at(-1).interruption.class,entryWeek:ew,preBreakLongest:preLongest,initialItem:!!before,proposal:{completion:!!race.prescription.completion,basis:item?.basis??null,stated:item?.longestContinuousRunMinutes??null,modeAtRace:rs.mode,modeHistory:rs.modeHistory??[]},afterExecutedReviews:{completion:!!qrace.prescription.completion,basis:qitem?.basis??null,stated:qitem?.longestContinuousRunMinutes??null,postRestartLongestFromSessions:postLongest,modeAtRace:qrs.mode,achievedAtRace:qrs.achieved,detail:qitem?.detail??null,taperAndRaceWeekRuns:taper,touch,raceStrides,postRestartStridesBeforeTaper:postStrides,postRestartQualityBeforeTaper:postQuality,runTrace}};
  res.restartByReview.push(row);
  if(!race.prescription.completion||!item)viol.push(label+': restart applied by a review without completion or item');
  if(!qrace.prescription.completion||!qitem)viol.push(label+': completion or item lost after executed reviews');
  if(qitem&&qitem.longestContinuousRunMinutes!==postLongest)viol.push(`${label}: stated ${qitem.longestContinuousRunMinutes} != post-restart longest ${postLongest}`);
  if(raceStrides&&!postStrides)viol.push(label+': race-day strides without strides after the restart');
  if(touch&&!postQuality)viol.push(label+': race touch without quality after the restart');
  const maxTaperLong=Math.max(0,...Q.weeks.filter(w=>w.phase==='TAPER').flatMap(w=>w.sessions.filter(x=>x.role==='LONG'&&x.prescription).map(x=>x.prescription.durationMinutes)));
  if(maxTaperLong>Math.max(postLongest,R.minimumSessionMinutes))viol.push(`${label}: taper long ${maxTaperLong} above the post-restart longest ${postLongest}`);
 }
 // (2) moderate return (21 days) before the race: RETURN in race week, or back to EASY before it
 for(const s of [4,5,6,7]){
  const raceWeek=9,label=`moderate-s${s}`;
  let p=generateProgram(intake({id:'s9-V-'+label,weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',raceWeek*7+5)}},strength:'RUNNING_SUPPORT'},knownExercises:[SQUAT],recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:60,longRunMinutes:100}}),opts).program;
  let {p:p1,ledger}=execUntil(p,0,s);const reviewAbs=s*7+21,rw=Math.floor(reviewAbs/7),rday=reviewAbs%7;if(rw>=raceWeek){res.moderateReturnBeforeRace.push({label,skipped:'review after race week'});continue;}
  const r0=evaluateProgram(p1,rvAt(p1,rw,rday,{kind:'RETURN_AFTER_PAUSE',interruption:{days:21,reasonCategory:'WORK',nonclinical:true},actualLedger:ledger}),opts);
  if(!r0.proposal){res.moderateReturnBeforeRace.push({label,status:r0.status});continue;}
  const P=r0.proposal,rs=P.stateTrace[P.phases.raceWeek].run,item=ambItem(P.negotiation),race=raceOf(P);
  res.moderateReturnBeforeRace.push({label,entryWeek:P.decisions.at(-1).fromWeek,modeAtRace:rs.mode,completion:!!race.prescription.completion,basis:item?.basis??null,detail:item?.detail??null,raceWeekReturnEasy:rs.mode==='RETURN'?{from:rs.returnFrom?.easy,step:rs.returnStep,plannedEasyInRaceWeek:Math.max(0,...P.weeks[P.phases.raceWeek].sessions.filter(x=>x.role==='EASY'&&x.prescription).map(x=>x.prescription.durationMinutes))}:null});
  if(!!race.prescription.completion!==!!item)viol.push(label+': completion and item disagree');
  if(rs.mode==='RETURN'&&!race.prescription.completion)viol.push(label+': RETURN in race week without completion');
 }
 // (3) goal change: a walk/jog novice without an event exits the ladder; a 10K is added; then removed
 {
  let p=generateProgram(intake({id:'s9-V-gc',weeks:16,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:45,longRunMinutes:60}}),opts).program;
  const exitWeek=p.stateTrace.findIndex(x=>x.run.mode==='EASY');
  const upto=Math.min(exitWeek>0?exitWeek+1:9,11);let {p:p1,ledger}=execUntil(p,0,upto);
  const w=upto,add=evaluateProgram(p1,rvAt(p1,w,0,{kind:'GOAL_CHANGE',changes:{event:{kind:'10K',date:addDays(p1.startDate??p1.weeks[0].startDate,14*7+5)}},actualLedger:ledger}),opts);
  const A=add.proposal,item=A?ambItem(A.negotiation):null,raceA=A?raceOf(A):null;
  res.goalChange.add={status:add.status,action:add.action,exitWeekInProjection:exitWeek,reviewedThrough:upto-1,modeAtReview:p1.stateTrace[w].run.mode,completion:raceA?!!raceA.prescription.completion:null,basis:item?.basis??null,stated:item?.longestContinuousRunMinutes??null,fromSessions:A?longestContinuousBefore(A,A.phases.raceWeek):null,detail:item?.detail??null};
  if(A&&(!raceA?.prescription.completion||item?.basis!=='PROGRAM_HISTORY'))viol.push('goal change: race added to a walk/jog-built program without a history completion');
  if(A){
   const rem=evaluateProgram(A,rvAt(A,w+1,0,{kind:'GOAL_CHANGE',changes:{event:null,goals:{run:'REGULAR'}},actualLedger:add.actualLedger}),opts),B=rem.proposal;
   res.goalChange.remove={status:rem.status,action:rem.action,itemRemains:B?!!ambItem(B.negotiation):null,raceRemains:B?!!raceOf(B):null};
   if(B&&ambItem(B.negotiation))viol.push('goal change: item kept after the race was removed');
   const mv=evaluateProgram(A,rvAt(A,w+1,0,{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(A.weeks[0].startDate,15*7+5)},actualLedger:add.actualLedger}),opts),M=mv.proposal;
   const mi=M?ambItem(M.negotiation):null;res.goalChange.moveDate={status:mv.status,action:mv.action,raceWeek:M?.phases?.raceWeek??null,completion:M?!!raceOf(M)?.prescription.completion:null,basis:mi?.basis??null,stated:mi?.longestContinuousRunMinutes??null,fromSessions:M?longestContinuousBefore(M,M.phases.raceWeek):null};
   if(M&&mi&&mi.longestContinuousRunMinutes!==longestContinuousBefore(M,M.phases.raceWeek))viol.push('event date change: stated longest run not recomputed');
  }
 }
 // (4) Q5: long programs in which walk/jog- or restart-class athletes rebuild substantial running before a 10K (no exemption)
 for(const [aName,a] of Object.entries({novice:{runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null}},belowMin_14_14:{runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:14,longestRunMinutes:14}},restart6w:{runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},pause:{nonclinical:true,weeks:6,reasonCategory:'TRAVEL',reason:'Work travel'}}}))for(const kind of ['10K','HALF_MARATHON'])for(const raceWeek of [13,15]){
  const g=generateProgram(intake({id:`s9-V-long-${aName}-${kind}-${raceWeek}`,weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',raceWeek*7+6)}},strength:'RUNNING_SUPPORT'},knownExercises:[],...a},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:60,longRunMinutes:100}}),opts);
  if(!g.program){res.longPrograms.push({aName,kind,raceWeek,status:g.status});continue;}
  const P=g.program,item=ambItem(g.negotiation),race=raceOf(P),rs=P.stateTrace[P.phases.raceWeek].run;
  res.longPrograms.push({aName,kind,raceWeek,class:P.capability.run.class,modeAtRace:rs.mode,firstEasyWeek:P.stateTrace.findIndex(x=>x.run.mode==='EASY'),achievedLong:rs.achieved?.long??null,longestFromSessions:longestContinuousBefore(P,P.phases.raceWeek),completion:!!race?.prescription.completion,basis:item?.basis??null,detail:item?.detail??null});
 }
 res.violations=viol;
 return res;
});

// ---------------------------------------------------------------- W. D48: the pending row, normal FROM_LOG branch and return step-2 branch
guard('W_D48',()=>{
 const res={},viol=[];let n=0;
 const rvAt=(p,w,day,x={})=>{const dd=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:'s9-W-'+w+'-'+(x.kind??'W')+'-'+(n++),kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(dd),...x};};
 const rowsFor=(P,w,id)=>P.weeks[w].sessions.flatMap(x=>x.prescription?.exercises??[]).filter(e=>e.id===id).map(e=>({sets:e.sets,rir:e.rir,mode:e.load.mode,value:e.load.value??null,rule:e.load.rule??null,instructions:e.instructions}));
 const bad=r=>r.mode==='FROM_LOG'&&(!/^Ramp up/.test(r.instructions[0])||r.instructions.some(i=>/use the load you logged/i.test(i)));
 // normal branch: an unconfirmed establishment log
 const p=generateProgram(intake({id:'s9-W-est',weeks:8,athlete:{knownExercises:[]}}),opts).program;
 const target=[...new Set(p.weeks[0].sessions.flatMap(x=>x.prescription?.exercises??[]).filter(e=>e.load.mode==='ESTABLISH'&&e.load.convention==='PER_HAND').map(e=>e.id))][0]??[...new Set(p.weeks[0].sessions.flatMap(x=>x.prescription?.exercises??[]).filter(e=>e.load.mode==='ESTABLISH').map(e=>e.id))][0];
 const conv=p.weeks[0].sessions.flatMap(x=>x.prescription?.exercises??[]).find(e=>e.id===target).load.convention;
 const r1=evaluateProgram(p,rvAt(p,0,6,{observations:weekObs(p,0,{[target]:{load:kg(160,conv)}})}),opts);
 res.normalBranch={target,convention:conv,week1:rowsFor(r1.proposal,1,target),week2:rowsFor(r1.proposal,2,target)};
 if(rowsFor(r1.proposal,1,target).some(bad))viol.push('normal branch: pending row does not start with the ramp-up or points at the log');
 // a confirmed load: the row is a number and the KNOWN instruction (no ramp-up needed)
 const r1c=evaluateProgram(p,rvAt(p,0,6,{observations:weekObs(p,0,{[target]:{load:kg(160,conv)}}),loadConfirmations:[{exerciseId:target,value:16,unit:'KG',convention:conv}]}),opts);
 res.confirmedBranch={week1:rowsFor(r1c.proposal,1,target).map(r=>({mode:r.mode,value:r.value,first:r.instructions[0]}))};
 // return step-2 branch: pre-break log 160 (pending), break, entry log 16 (disagrees, pending), step 2 row
 let q=generateProgram(intake({id:'s9-W-ret',weeks:12,athlete:{knownExercises:[]}}),opts).program;
 const rA=evaluateProgram(q,rvAt(q,0,6,{observations:weekObs(q,0,{[target]:{load:kg(160,conv)}})}),opts);q=rA.proposal??q;
 const pauseFrom=q.weeks[1].startDate,reviewAbs=7+14,rw=Math.floor(reviewAbs/7),rday=reviewAbs%7,after=addDays(q.weeks[rw].startDate,rday);
 const rB=evaluateProgram(q,rvAt(q,rw,rday,{kind:'RETURN_AFTER_PAUSE',interruption:{days:14,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:rA.actualLedger}),opts);
 if(rB.proposal){
  // execute weeks from the entry week, logging 16 for the target, until the target has had its entry exposure; then read its step-2 row
  let Q=rB.proposal,led=rB.actualLedger;const ew=Q.decisions.at(-1).fromWeek,live=x=>x.date<pauseFrom||x.date>after;let stepWeek=null;const seen=[];
  for(let w=ew;w<Math.min(Q.weeks.length-1,ew+3);w++){
   const liveRows=Q.weeks[w].sessions.filter(x=>x.prescription&&live(x)).flatMap(x=>x.prescription.exercises??[]).filter(e=>e.id===target);
   seen.push({w,rows:liveRows.map(e=>`${e.sets}@${e.rir}:${e.load.mode}`),returnStep:Q.stateTrace[w]?.strength?.exercises?.[target]?.returnStep??null});
   const r=evaluateProgram(Q,rvAt(Q,w,6,{observations:Q.weeks[w].sessions.filter(x=>x.prescription&&live(x)).map(x=>({...obs(Q,x,{over:{[target]:{load:kg(16,conv)}}}),eventId:'s9-W-e-'+x.id+'-'+(n++)})),actualLedger:led}),opts);led=r.actualLedger;if(r.proposal)Q=r.proposal;
   if(liveRows.length&&Q.stateTrace[w+1]?.strength?.exercises?.[target]?.returnStep===1){stepWeek=w+1;res.entryQuestions=(r.loadQuestions??[]).filter(x=>x.exerciseId===target).map(x=>x.reason);break;}
  }
  const st2=stepWeek!==null?Q.stateTrace[stepWeek].strength.exercises[target]:null;
  res.returnStep2Branch={entryWeek:ew,weeksSeen:seen,stepWeek,step2:stepWeek!==null?rowsFor(Q,stepWeek,target):null,pending:st2?.pendingLoad??null,returnStep:st2?.returnStep??null};
  if(stepWeek===null)viol.push('return step 2: the target never reached return step 2 in the probe window');
  else if(rowsFor(Q,stepWeek,target).some(r=>r.mode==='FROM_LOG'&&Number.isFinite(st2?.pendingLoad)&&bad(r)))viol.push('return step 2: pending row does not start with the ramp-up or points at the log');
 }else res.returnStep2Branch={status:rB.status,reason:rB.reason};
 res.violations=viol;
 return res;
});

// ---------------------------------------------------------------- X. D49 extras: block credit after a return over 16 weeks (Q4), a second break, and returns close to a race (Q2)
guard('X_D49extras',()=>{
 const res={};
 res.q4_sixteenWeeks=[returnTimeline({label:'q4-s4-d14',s:4,d:14,weeks:16,execAfter:10}),returnTimeline({label:'q4-s4-d21',s:4,d:21,weeks:16,execAfter:9}),returnTimeline({label:'q4-s2-d14',s:2,d:14,weeks:16,execAfter:12})];
 // returns close to a 10K: race window strength stays light, taper strength RIR >= 3, step 2 takes the phase reduction
 const near=[];const viol=[];
 for(const raceWeek of [8,9])for(const s of [3,4,5,6])for(const d of [14,21]){
  const reviewAbs=s*7+d,rw=Math.floor(reviewAbs/7);if(rw>=raceWeek)continue;
  // race-window strength stays the single light main-lift session and taper-day strength keeps RIR >= 3, with a return in progress
  const inspect=(Q,{live,v,label})=>{const race=sessionsOf(Q).find(x=>x.role==='RACE');if(!race)return {race:null};let win=0,taper=0;const tw=Math.max(0,Q.phases.raceWeek-(Q.phases.taperStart??Q.phases.raceWeek)),td=E.raceWindowDays+7*tw;
   for(const x of sessionsOf(Q).filter(x=>x.sport==='STRENGTH'&&x.prescription&&live(x))){const b=gap(x.date,race.date);
    if(b>=1&&b<=E.raceWindowDays){win++;if(b<E.raceWeekStrengthMinDaysBeforeRace)v.push(label+': strength '+b+' days before the race');if(x.prescription.exercises.some(e=>e.sets>E.raceWeekStrengthSets||e.rir<E.raceWeekStrengthMinimumRir||e.role!=='MAIN'))v.push(label+': race-window strength not light: '+x.prescription.exercises.map(e=>e.id+':'+e.role+':'+e.sets+'@'+e.rir).join(','));}
    else if(b>E.raceWindowDays&&b<=td){taper++;if(x.prescription.exercises.some(e=>e.rir<3))v.push(label+': taper strength below RIR 3');}}
   const amb=ambItem(Q.negotiation),rs=Q.stateTrace[Q.phases.raceWeek].run;if(!!race.prescription.completion!==!!amb)v.push(label+': completion and item disagree');
   return {windowSessions:win,taperSessions:taper,completion:!!race.prescription.completion,basis:amb?.basis??null,modeAtRace:rs.mode};};
  const t=returnTimeline({label:`race${raceWeek}-s${s}-d${d}`,s,d,weeks:12,known:[SQUAT,RDL],goal:'RUNNING_SUPPORT',execAfter:raceWeek+1-Math.floor((s*7+d)/7),event:{kind:'10K',date:addDays('2026-11-02',raceWeek*7+5)},inspect});
  near.push({label:t.label,class:t.class,entryWeek:t.entryWeek,ceiling:t.ceiling,timeline:t.timeline,inspect:t.inspect,violations:t.violations});
  viol.push(...(t.violations??[]));
 }
 res.nearRace=near;res.violations=[...res.q4_sixteenWeeks.flatMap(t=>t.violations??[]),...viol];
 return res;
});

// ---------------------------------------------------------------- Y. rotation after a return (pre-existing behaviour check, not a round-9 change)
guard('Y_rotationAfterReturn',()=>{
 const res=[];let n=0;
 for(const pref of ['EVERY_2_WEEKS','COACH_DECIDES']){
  const rvAt=(p,w,day,x={})=>{const dd=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:'s9-Y-'+pref+'-'+w+'-'+(n++),kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(dd),...x};};
  let p=generateProgram(intake({id:'s9-Y-'+pref,weeks:16,athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:pref}}),opts).program,ledger=[];
  const idsByWeek=P=>P.weeks.map(w=>[...new Set(w.sessions.flatMap(x=>x.prescription?.exercises??[]).filter(e=>e.role!=='MAIN').map(e=>e.id))].sort().join(','));
  const projectedRotation=idsByWeek(p);
  const s=6,d=14;for(let w=0;w<s;w++){const r=evaluateProgram(p,rvAt(p,w,6,{observations:weekObs(p,w),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
  const reviewAbs=s*7+d,rw=Math.floor(reviewAbs/7),rday=reviewAbs%7,pauseFrom=p.weeks[s].startDate,after=addDays(p.weeks[rw].startDate,rday);
  const r0=evaluateProgram(p,rvAt(p,rw,rday,{kind:'RETURN_AFTER_PAUSE',interruption:{days:d,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),opts);
  if(!r0.proposal){res.push({pref,status:r0.status});continue;}
  let Q=r0.proposal,led=r0.actualLedger;const ew=Q.decisions.at(-1).fromWeek;
  for(let w=ew;w<Q.weeks.length-1;w++){const r=evaluateProgram(Q,rvAt(Q,w,6,{observations:Q.weeks[w].sessions.filter(x=>x.prescription&&(x.date<pauseFrom||x.date>after)).map(x=>({...obs(Q,x),eventId:'s9-Y-o-'+x.id+'-'+(n++)})),actualLedger:led}),opts);led=r.actualLedger;if(r.proposal)Q=r.proposal;}
  const stillReturning=Q.stateTrace.map((st,w)=>({w,ids:Object.entries(st.strength.exercises).filter(([,e])=>Number.isInteger(e.returnStep)).map(([id,e])=>id+':'+e.returnStep)})).filter(x=>x.w>=ew&&x.ids.length);
  res.push({pref,entryWeek:ew,projectedAccessoriesByWeekBeforeReviews:projectedRotation,accessoriesByWeekAfterReturn:idsByWeek(Q).map((x,w)=>w+':'+x).slice(Math.max(0,s-2)),weeksWithAnExerciseStillInReturnSteps:stillReturning.map(x=>x.w+':'+x.ids.join('/'))});
 }
 return res;
});

// ---------------------------------------------------------------- S. progression stall (found in round 9 while checking R12; pre-existing logic, unchanged since FREEZE-1)
// A build week is flat when its planned running minutes do not exceed the previous build week's and no walk converts. Under a
// 50-minute long run, advanceRun counts a long-run step as the week's single-session increase even when the long-run share cap
// keeps the prescription where it was; the easy (and quality) step then never happens and the cap never releases.
guard('S_progressionStall',()=>{
 const rows=[];
 const profile=(id,W,Lg,days,goal={run:'REGULAR',strength:'GENERAL'},exp='INTERMEDIATE',extra={})=>intake({id,weeks:16,athlete:{goals:goal,runExperience:exp,recent:{runDaysPerWeek:days.length,runMinutesPerWeek:W,longestRunMinutes:Lg,strengthDaysPerWeek:2},knownExercises:[],...extra},schedule:{runDays:days,strengthDays:[2,5].filter(d=>!days.includes(d)).concat([3,0]).filter((d,i,a)=>!days.includes(d)&&a.indexOf(d)===i).slice(0,2),runMinutes:60,strengthMinutes:45,longRunDay:days.at(-1),longRunMinutes:100}});
 const analyse=(id,P)=>{
  const wk=P.weeks.map((w,k)=>({k,phase:w.phase,run:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.prescription.family!=='WALK').reduce((n,s)=>n+s.prescription.durationMinutes,0),long:w.sessions.find(s=>s.role==='LONG'&&s.prescription)?.prescription.durationMinutes??null,easy:Math.max(0,...w.sessions.filter(s=>s.role==='EASY'&&s.prescription).map(s=>s.prescription.durationMinutes)),quality:w.sessions.find(s=>s.role==='QUALITY'&&s.prescription)?.progression?.value??null,walks:w.sessions.filter(s=>s.role==='WALK').length,held:w.sessions.some(s=>/held within its share/.test(s.explanation??''))}));
  let best=0,cur=0,prev=null;for(const x of wk){if(['CONSOLIDATION','ESTABLISHMENT','TAPER','RACE_WEEK','POST_EVENT'].includes(x.phase)){continue;}if(prev&&x.run<=prev.run&&x.walks>=prev.walks)cur++;else cur=0;best=Math.max(best,cur);prev=x;}
  const st=P.stateTrace,easyNeverSteps=st.every(s=>s.run.mode!=='EASY'||s.run.easy===st.find(x=>x.run.mode==='EASY')?.run.easy);
  const qualitySteps=st.map(s=>s.run.qualityStep??0),qualityActiveWeeks=wk.filter(x=>x.quality!==null).length;
  return {id,class:P.capability.run.class,flatBuildWeeks:best,heldWeeks:wk.filter(x=>x.held).length,easyNeverSteps,qualityActiveWeeks,qualityStepFirstLast:[qualitySteps[0],qualitySteps.at(-1)],runMinutesFirstLast:[wk[0].run,wk.at(-1).run],trace:wk.map(x=>`${x.k}:${x.phase.slice(0,3)}:E${x.easy}/L${x.long}${x.walks?'/w'+x.walks:''}${x.held?'*':''}`).join(' ')};
 };
 for(const W of [30,45,60,75,90,120,150])for(const Lg of [15,25,35,45,60])for(const days of [[1,3,6],[0,2,4,6]]){
  if(Lg>W)continue;const id=`s9-S-${W}-${Lg}-${days.length}`,g=generateProgram(profile(id,W,Lg,days),opts);
  if(!g.program){rows.push({id,status:g.status});continue;}rows.push(analyse(id,g.program));
 }
 // a 10K in week 13 and a performance goal with a familiar quality task, same mechanics
 for(const [W,Lg] of [[45,25],[60,35],[90,45]]){const id=`s9-S-10K-${W}-${Lg}`,g=generateProgram(profile(id,W,Lg,[1,3,6],{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},strength:'RUNNING_SUPPORT'}),opts);if(g.program)rows.push(analyse(id,g.program));}
 {const id='s9-S-quality-90-40',g=generateProgram(profile(id,90,40,[1,3,6],{run:'PERFORMANCE',strength:'GENERAL'},'EXPERIENCED',{recent:{runDaysPerWeek:3,runMinutesPerWeek:90,longestRunMinutes:40,strengthDaysPerWeek:2},knownRuns:[]}),opts);if(g.program)rows.push(analyse(id,g.program));}
 // executed (simulated, every session as planned with compatible responses)
 const simIn=profile('s9-S-sim-45-25',45,25,[1,3,6]),sim=simulateProgram(simIn,{},opts);
 const simRow=sim.finalProgram?analyse('s9-S-sim-45-25 (executed)',sim.finalProgram):{status:sim.status??null};
 const programs=rows.filter(r=>r.class);
 return {programs:programs.length,byClass:programs.reduce((m,r)=>{m[r.class]=(m[r.class]??0)+1;return m;},{}),flat4plus:programs.filter(r=>r.flatBuildWeeks>=4).length,flat6plus:programs.filter(r=>r.flatBuildWeeks>=6).length,easyNeverSteps:programs.filter(r=>r.easyNeverSteps).length,
  flat4plusByClass:programs.filter(r=>r.flatBuildWeeks>=4).reduce((m,r)=>{m[r.class]=(m[r.class]??0)+1;return m;},{}),
  examples:programs.filter(r=>r.flatBuildWeeks>=6).slice(0,6),eventAndQuality:rows.filter(r=>/10K|quality/.test(r.id)),executed:simRow,
  notFlat:programs.filter(r=>r.flatBuildWeeks<2).slice(0,4)};
});

// ================================================================ round 10 (runtime-only D50/D51 fixes at the same hash 18ec48f3...)
// ---------------------------------------------------------------- S2. D50: progression when the share cap holds the long run
// Measures on every program: (1) the probe-S stall measure; (2) the one-increase rule judged against the 30-day reference the policy
// names (run.singleRunCeiling.reference; in a projection earlier projected weeks count as executed): in a week whose long run steps
// beyond a sub-50-minute reference, no easy run reaches a new level, no quality step is new and no walk converts; also the author's
// pairwise measure and two easy runs stepping in one week; (3) easy versus long run in non-consolidation weeks (Q1: equal allowed,
// never above); (4) consolidation weeks (Q4): long run below an easy run, total running and the longest single run against the
// previous week, a new easy level in a deload week; (5) single-run ceiling: no run above the 30-day reference plus one step.
const BUILDP=['DEVELOPMENT','BUILD','NEXT_BLOCK','SPECIFIC'],NOSTEP=['TAPER','RACE_WEEK','POST_EVENT','ESTABLISHMENT'];
const refMin=s=>s.role==='WALK_JOG'?Math.round((s.prescription.work?.repetitions??0)*(s.prescription.work?.workSeconds??0)/60):s.prescription.durationMinutes;
function d50Weeks(P){
 const intakeLongest=P.capability?.run?.longestMinutes??null,asOf=String(P.canonical?.asOf??'').slice(0,10);
 const wk=P.weeks.map((w,k)=>{
  const run=w.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE');
  const going=run.filter(s=>s.role!=='WALK'&&s.prescription.family!=='WALK');
  const easy=going.filter(s=>s.role==='EASY').map(s=>s.prescription.durationMinutes).sort((a,b)=>a-b);
  const q=going.find(s=>s.role==='QUALITY'),longS=going.find(s=>s.role==='LONG');
  return {k,phase:w.phase,start:w.startDate,mode:P.stateTrace[k]?.run?.mode??null,long:longS?.prescription.durationMinutes??null,longExplanation:longS?.explanation??null,easy,maxEasy:easy.length?Math.max(...easy):null,qDim:q?.progression?.dimension??null,qVal:q?.progression?.value??null,walks:run.filter(s=>s.role==='WALK').length,nRunning:going.length,runMin:going.reduce((n,s)=>n+s.prescription.durationMinutes,0),maxRun:Math.max(0,...going.map(refMin)),held:going.some(s=>s.progression?.heldBy==='LONG_RUN_SHARE'),runs:going.map(s=>({date:s.date,min:refMin(s),role:s.role,qDim:s.role==='QUALITY'?s.progression?.dimension??null:null,qVal:s.role==='QUALITY'?s.progression?.value??null:null}))};
 });
 const all=wk.flatMap(x=>x.runs.map(r=>({...r,k:x.k})));
 for(const x of wk){const from=addDays(x.start,-30),win=all.filter(r=>r.date>=from&&r.date<x.start);x.ref=Math.max(0,...win.map(r=>r.min),...(Number.isFinite(intakeLongest)&&asOf&&gap(asOf,x.start)<=30?[intakeLongest]:[]));x.easyRef=Math.max(0,...win.filter(r=>r.role==='EASY').map(r=>r.min));x.qRef=Math.max(-1,...win.filter(r=>r.role==='QUALITY'&&r.qDim===x.qDim).map(r=>r.qVal??-1));x.nRef=Math.max(0,...wk.filter(y=>y.start>=from&&y.start<x.start).map(y=>y.nRunning));}
 return wk;
}
function d50Analyse(id,P){
 const wk=d50Weeks(P),v=[],ceiling=[],pairs=[],eqWeeks=[],cons=[],twoEasy=[];let heldWeeks=0,smallRefSteps=0;const afterHeld={long:0,easy:0,quality:0,convert:0,none:0};
 for(let k=1;k<wk.length;k++){
  const a=wk[k-1],b=wk[k];
  if(b.mode==='EASY'&&b.long!==null&&b.maxEasy!==null&&b.phase!=='CONSOLIDATION'){if(b.maxEasy>b.long)v.push(`${id} w${k} ${b.phase}: easy ${b.maxEasy} above the long run ${b.long}`);else if(b.maxEasy===b.long)eqWeeks.push(`w${k}:${b.phase.slice(0,4)}:E${b.easy.join('/')}/L${b.long}${a.held?' after a held week':''}`);}
  if(b.mode==='EASY'&&b.ref>0&&b.maxRun>b.ref+R.singleRunCeiling.stepMinutes)ceiling.push(`${id} w${k} ${b.phase}: run ${b.maxRun} above the 30-day reference ${b.ref} + ${R.singleRunCeiling.stepMinutes}`);
  if(b.phase==='CONSOLIDATION'&&b.mode==='EASY'&&b.long!==null&&b.maxEasy!==null){
   const c={k,long:b.long,easy:b.easy,longBelowEasyBy:Math.max(0,b.maxEasy-b.long),runMin:b.runMin,prevRunMin:a.runMin,maxRun:b.maxRun,prevMaxRun:a.maxRun,newEasyLevel:b.maxEasy>b.easyRef,longExplanation:b.longExplanation};cons.push(c);
   if(b.runMin>=a.runMin)v.push(`${id} w${k}: consolidation running ${b.runMin} not below the previous week ${a.runMin}`);
   if(b.maxRun>a.maxRun)v.push(`${id} w${k}: consolidation week has a longer single run (${b.maxRun}) than the previous week (${a.maxRun})`);
  }
  // (2) against the 30-day history, in every EASY week where steps are possible
  if(b.mode==='EASY'&&!NOSTEP.includes(b.phase)&&b.ref>0&&b.ref<50&&b.long!==null&&b.long>b.ref){
   smallRefSteps++;
   const newEasy=b.maxEasy!==null&&b.maxEasy>b.easyRef&&b.easyRef>0,newQ=b.qVal!==null&&b.qRef>=0&&b.qVal>b.qRef,conv=b.nRunning>b.nRef&&b.nRef>0;
   if(newEasy||newQ||conv)v.push(`${id} w${k} ${b.phase}: long ${b.long} beyond the 30-day reference ${b.ref} together with ${[newEasy?`a new easy level ${b.maxEasy} (30-day ${b.easyRef})`:'',newQ?`a new quality step ${b.qVal} (30-day ${b.qRef})`:'',conv?`a new running session (${b.nRunning} vs ${b.nRef})`:''].filter(Boolean).join(', ')}`);
  }
  if(a.mode!=='EASY'||b.mode!=='EASY'||!BUILDP.includes(a.phase)||!BUILDP.includes(b.phase))continue;
  const longUp=a.long!==null&&b.long!==null&&b.long>a.long,easyUps=a.easy.length===b.easy.length?b.easy.filter((x,j)=>x>a.easy[j]).length:0,conv=b.walks<a.walks,qUp=a.qDim!==null&&a.qDim===b.qDim&&b.qVal>a.qVal;
  if(longUp&&a.long<50&&(easyUps>0||qUp))pairs.push(`w${k}: L${a.long}->${b.long}${easyUps?` E${a.easy}->${b.easy}`:''}${qUp?` q${a.qVal}->${b.qVal}`:''}`);
  if(easyUps>=2)twoEasy.push(`w${k}: ${a.easy} -> ${b.easy}`);
  if(a.held){heldWeeks++;if(longUp)afterHeld.long++;if(easyUps)afterHeld.easy++;if(qUp)afterHeld.quality++;if(conv)afterHeld.convert++;if(!longUp&&!easyUps&&!qUp&&!conv)afterHeld.none++;}
 }
 let best=0,cur=0,prev=null;for(const x of wk){if(['CONSOLIDATION','ESTABLISHMENT','TAPER','RACE_WEEK','POST_EVENT'].includes(x.phase))continue;if(prev&&x.runMin<=prev.runMin&&x.walks>=prev.walks)cur++;else cur=0;best=Math.max(best,cur);prev=x;}
 const st=P.stateTrace,firstEasy=st.find(x=>x.run.mode==='EASY')?.run.easy,easyNeverSteps=st.every(s=>s.run.mode!=='EASY'||s.run.easy===firstEasy);
 const build=wk.filter(x=>BUILDP.includes(x.phase)&&x.mode==='EASY');
 return {id,class:P.capability.run.class,flatBuildWeeks:best,easyNeverSteps,heldWeeks,afterHeld,smallReferenceStepWeeks:smallRefSteps,authorPairsUnder50:pairs,twoEasyStepsInOneWeek:twoEasy,easyEqualsLong:eqWeeks,consolidation:cons,ceilingFlags:ceiling,
  buildRunFirstLast:build.length?[build[0].runMin,build.at(-1).runMin]:null,longFirstLast:build.length?[build[0].long,build.at(-1).long]:null,maxEasyFirstLast:build.length?[build[0].maxEasy,build.at(-1).maxEasy]:null,qualityStepFirstLast:[st[0].run.qualityStep??0,st.at(-1).run.qualityStep??0],violations:v,
  trace:wk.map(x=>`${x.k}:${x.phase.slice(0,3)}:${x.mode==='EASY'?'E'+x.easy.join('/')+'/L'+x.long:x.mode}${x.walks?'/w'+x.walks:''}${x.qVal!==null?'/q'+x.qVal:''}${x.held?'*':''}`).join(' ')};
}
const d50Profile=(id,W,Lg,days,goal={run:'REGULAR',strength:'GENERAL'},exp='INTERMEDIATE',extra={})=>intake({id,weeks:16,athlete:{goals:goal,runExperience:exp,recent:{runDaysPerWeek:days.length,runMinutesPerWeek:W,longestRunMinutes:Lg,strengthDaysPerWeek:2},knownExercises:[],...extra},schedule:{runDays:days,strengthDays:[2,5].filter(d=>!days.includes(d)).concat([3,0]).filter((d,i,a)=>!days.includes(d)&&a.indexOf(d)===i).slice(0,2),runMinutes:60,strengthMinutes:45,longRunDay:days.at(-1),longRunMinutes:100}});
function d50Suite(gen,sim,auth,{executed=true}={}){
 const o={authority:auth},rows=[];
 for(const W of [30,45,60,75,90,120,150])for(const Lg of [15,25,35,45,60])for(const days of [[1,3,6],[0,2,4,6]]){if(Lg>W)continue;const id=`s10-S2-${W}-${Lg}-${days.length}`,g=gen(d50Profile(id,W,Lg,days),o);rows.push(g.program?d50Analyse(id,g.program):{id,status:g.status});}
 for(const [W,Lg] of [[45,25],[60,35],[90,45]]){const id=`s10-S2-10K-${W}-${Lg}`,g=gen(d50Profile(id,W,Lg,[1,3,6],{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},strength:'RUNNING_SUPPORT'}),o);rows.push(g.program?d50Analyse(id,g.program):{id,status:g.status});}
 for(const [W,Lg] of [[90,40],[120,50],[150,60],[200,90]]){const id=`s10-S2-Q-${W}-${Lg}`,g=gen(d50Profile(id,W,Lg,[1,3,6],{run:'PERFORMANCE',strength:'GENERAL'},'EXPERIENCED'),o);rows.push(g.program?d50Analyse(id,g.program):{id,status:g.status});}
 const ex=[];
 if(executed){
  const scripted=[
   ['45/25 all executed',d50Profile('s10-S2-sim-45-25',45,25,[1,3,6]),{}],
   ['60/35 all executed',d50Profile('s10-S2-sim-60-35',60,35,[1,3,6]),{}],
   ['60/35 four run days',d50Profile('s10-S2-sim-60-35-4',60,35,[0,2,4,6]),{}],
   ['10K 60/35',d50Profile('s10-S2-sim-10K-60-35',60,35,[1,3,6],{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}},strength:'RUNNING_SUPPORT'}),{}],
   ['quality 90/40',d50Profile('s10-S2-sim-Q-90-40',90,40,[1,3,6],{run:'PERFORMANCE',strength:'GENERAL'},'EXPERIENCED'),{}],
   ['all-walk athlete (R12)',intake({id:'s10-S2-sim-walks',weeks:16,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:15,longestRunMinutes:15},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6,runMinutes:45,longRunMinutes:60}}),{}],
   ['45/25 long run missed in weeks 3, 6 and 9',d50Profile('s10-S2-sim-45-25-miss',45,25,[1,3,6]),{weeks:{3:{missed:[{sport:'RUN',role:'LONG'}]},6:{missed:[{sport:'RUN',role:'LONG'}]},9:{missed:[{sport:'RUN',role:'LONG'}]}}}],
   ['60/35 harder long run in weeks 4 and 8',d50Profile('s10-S2-sim-60-35-hard',60,35,[1,3,6]),{weeks:{4:{responses:[{sport:'RUN',role:'LONG',response:'HARDER'}]},8:{responses:[{sport:'RUN',role:'LONG',response:'HARDER'}]}}}],
   ['45/25 easy runs missed in weeks 2 and 5',d50Profile('s10-S2-sim-45-25-easymiss',45,25,[1,3,6]),{weeks:{2:{missed:[{sport:'RUN',role:'EASY'}]},5:{missed:[{sport:'RUN',role:'EASY'}]}}}]
  ];
  for(const [label,inp,script] of scripted){const r=sim(inp,script,o);ex.push(r.finalProgram?{label,...d50Analyse(label,r.finalProgram)}:{label,status:r.status??null});}
 }
 const P=rows.filter(r=>r.class),all=[...P,...ex.filter(r=>r.class)];
 const consAll=all.flatMap(r=>r.consolidation.map(c=>({id:r.id,...c})));
 return {programs:P.length,byClass:P.reduce((m,r)=>{m[r.class]=(m[r.class]??0)+1;return m;},{}),flat4plus:P.filter(r=>r.flatBuildWeeks>=4).length,flat6plus:P.filter(r=>r.flatBuildWeeks>=6).length,maxFlat:Math.max(0,...P.map(r=>r.flatBuildWeeks)),easyNeverSteps:P.filter(r=>r.easyNeverSteps).map(r=>r.id+' (flat '+r.flatBuildWeeks+')'),
  heldWeeks:all.reduce((n,r)=>n+r.heldWeeks,0),afterHeld:all.reduce((m,r)=>{for(const k of Object.keys(r.afterHeld))m[k]=(m[k]??0)+r.afterHeld[k];return m;},{}),smallReferenceStepWeeks:all.reduce((n,r)=>n+r.smallReferenceStepWeeks,0),
  authorPairsUnder50:all.reduce((n,r)=>n+r.authorPairsUnder50.length,0),twoEasyStepsInOneWeek:all.flatMap(r=>r.twoEasyStepsInOneWeek.map(x=>r.id+' '+x)),easyEqualsLongWeeks:all.reduce((n,r)=>n+r.easyEqualsLong.length,0),easyEqualsLongSample:all.flatMap(r=>r.easyEqualsLong.map(x=>r.id+' '+x)).slice(0,12),
  consolidation:{weeksWithLongRun:consAll.length,longBelowEasy:consAll.filter(c=>c.longBelowEasyBy>0).length,belowByMinutes:[...new Set(consAll.filter(c=>c.longBelowEasyBy>0).map(c=>c.longBelowEasyBy))],pairs:[...new Set(consAll.filter(c=>c.longBelowEasyBy>0).map(c=>`L${c.long}<E${Math.max(...c.easy)}`))],runningFalls:consAll.filter(c=>c.runMin<c.prevRunMin).length,longestSingleRunNotAbovePrevious:consAll.filter(c=>c.maxRun<=c.prevMaxRun).length,newEasyLevelInConsolidation:consAll.filter(c=>c.newEasyLevel).length,newEasyLevelAndLongBelowEasy:consAll.filter(c=>c.newEasyLevel&&c.longBelowEasyBy>0).length,longExplanations:[...new Set(consAll.filter(c=>c.longBelowEasyBy>0).map(c=>c.longExplanation))],examples:consAll.filter(c=>c.longBelowEasyBy>0).slice(0,8).map(c=>`${c.id} w${c.k}: L${c.long} E${c.easy.join('/')} run ${c.prevRunMin}->${c.runMin}`)},
  ceilingFlags:all.flatMap(r=>r.ceilingFlags),violations:all.flatMap(r=>r.violations),
  qualityRunners:[...P.filter(r=>/-Q-|10K/.test(r.id)),...ex].map(r=>({id:r.id??r.label,flat:r.flatBuildWeeks,quality:r.qualityStepFirstLast,run:r.buildRunFirstLast,long:r.longFirstLast,easy:r.maxEasyFirstLast,trace:r.trace})),
  stallExamples:P.filter(r=>r.flatBuildWeeks>=3).slice(0,6).map(r=>({id:r.id,flat:r.flatBuildWeeks,trace:r.trace})),
  executed:ex.map(r=>r.class?{label:r.label,flat:r.flatBuildWeeks,easyNeverSteps:r.easyNeverSteps,heldWeeks:r.heldWeeks,afterHeld:r.afterHeld,violations:r.violations,ceilingFlags:r.ceilingFlags,run:r.buildRunFirstLast,long:r.longFirstLast,easy:r.maxEasyFirstLast,quality:r.qualityStepFirstLast,trace:r.trace}:r)};
}
guard('S2_D50',()=>d50Suite(generateProgram,simulateProgram,opts.authority));

// ---------------------------------------------------------------- round 11: the reviewed round-10 runtime (comparison only)
// A temporary copy of the runtime sources and the data files they read, with r6-program.mjs and r6-adaptation.mjs replaced by the copies
// in ssctr-dossier/reviewed-18ec48f3-r10-source (each sha256 must equal my round-10 reviewedFiles record). Built in the OS temp directory,
// imported read-only and removed at the end; nothing under CoachingCore/ is touched. S2b and Y2b of round 10 are not re-run.
let r10rt=null;
try{
 const ROOT=path.resolve(import.meta.dirname,'../../..'),CC=path.join(ROOT,'CoachingCore'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ssctr-r11-r10rt-'));
 const copy=rel=>{const dst=path.join(tmp,rel);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(ROOT,rel),dst);};
 for(const f of fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs'))){copy('CoachingCore/src/'+f);const s=fs.readFileSync(path.join(CC,'src',f),'utf8');for(const m of s.matchAll(/new URL\('(\.\.\/[^']+\.json)',import\.meta\.url\)/g)){const rel=path.posix.normalize(path.posix.join('CoachingCore/src',m[1]));if(fs.existsSync(path.join(ROOT,rel)))copy(rel);}}
 copy('CoachingCore/r6/fixtures/dev-authority.mjs');
 const R10={'r6-program.mjs':'4227f5013306fef7615ce7c6040e9c1def319d8fcbc052d79e87d2ca7cfb3008','r6-adaptation.mjs':'c93f7047172ddee33cd40b68ce90c3b5c15ab46733039547841c6c505df0bf02'},shas={};
 for(const [f,h] of Object.entries(R10)){const src=path.join(import.meta.dirname,'ssctr-dossier/reviewed-18ec48f3-r10-source/src',f),s=createHash('sha256').update(fs.readFileSync(src)).digest('hex');if(s!==h)throw new Error('reviewed round-10 '+f+' does not match my round-10 record: '+s);fs.copyFileSync(src,path.join(tmp,'CoachingCore/src',f));shas[f]=s;}
 const u=p=>pathToFileURL(path.join(tmp,p)).href;
 const idx=await import(u('CoachingCore/src/r6-index.mjs')),dev=await import(u('CoachingCore/r6/fixtures/dev-authority.mjs'));
 r10rt={tmp,shas,generateProgram:idx.generateProgram,evaluateProgram:idx.evaluateProgram,authority:dev.devAuthority()};
 if(r10rt.authority.policyHash!==EXPECTED)throw new Error('round-10 runtime copy bound to another policy: '+r10rt.authority.policyHash);
}catch(e){out.sections.round10RuntimeCopy={error:String(e?.stack??e).slice(0,1500)};r10rt=null;}
// Round 12: the reviewed round-11 runtime (comparison only). Same construction, with r6-program.mjs replaced by the copy in
// ssctr-dossier/reviewed-18ec48f3-r11-source (its sha256 must equal my round-11 reviewedFiles record); every other source is the current one,
// and r6-adaptation.mjs must equal my round-11 record too. Not recorded in out.sections, so the round-11 comparison is unaffected.
let r11rt=null,r11rtError=null;
try{
 const ROOT=path.resolve(import.meta.dirname,'../../..'),CC=path.join(ROOT,'CoachingCore'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ssctr-r12-r11rt-'));
 const copy=rel=>{const dst=path.join(tmp,rel);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(ROOT,rel),dst);};
 for(const f of fs.readdirSync(path.join(CC,'src')).filter(f=>f.endsWith('.mjs'))){copy('CoachingCore/src/'+f);const s=fs.readFileSync(path.join(CC,'src',f),'utf8');for(const m of s.matchAll(/new URL\('(\.\.\/[^']+\.json)',import\.meta\.url\)/g)){const rel=path.posix.normalize(path.posix.join('CoachingCore/src',m[1]));if(fs.existsSync(path.join(ROOT,rel)))copy(rel);}}
 copy('CoachingCore/r6/fixtures/dev-authority.mjs');
 const shaOf=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
 if(shaOf(path.join(CC,'src/r6-adaptation.mjs'))!=='d6a1d6fc74b7ef5b02a389dba3429cb25a00b16a2df97120b64314e96a6ba6f4')throw new Error('current r6-adaptation.mjs differs from my round-11 record');
 const src=path.join(import.meta.dirname,'ssctr-dossier/reviewed-18ec48f3-r11-source/src/r6-program.mjs'),s=shaOf(src);
 if(s!=='8fdadf2fab88cd0c4ee7d82bdc3f3a6e8c319a9ee0e66711691e0fbe5a9769fb')throw new Error('reviewed round-11 r6-program.mjs does not match my round-11 record: '+s);
 fs.copyFileSync(src,path.join(tmp,'CoachingCore/src/r6-program.mjs'));
 const u=p=>pathToFileURL(path.join(tmp,p)).href;
 const idx=await import(u('CoachingCore/src/r6-index.mjs')),dev=await import(u('CoachingCore/r6/fixtures/dev-authority.mjs'));
 r11rt={tmp,shas:{'r6-program.mjs':s},generateProgram:idx.generateProgram,evaluateProgram:idx.evaluateProgram,authority:dev.devAuthority()};
 if(r11rt.authority.policyHash!==EXPECTED)throw new Error('round-11 runtime copy bound to another policy: '+r11rt.authority.policyHash);
}catch(e){r11rtError=String(e?.stack??e).slice(0,1500);r11rt=null;}

// ---------------------------------------------------------------- Y2. D51: the return ends with the exercises in use
// Timelines: weeks before the pause executed and reviewed (executed dates recorded per exercise); a nonclinical TRAVEL pause from the
// Monday of week s for d days; the RETURN_AFTER_PAUSE review the day it ends; then every later week executed (sessions dated inside the
// pause excluded) and reviewed, optionally with scripted missed sessions. Checks: (a) the return lasts only while an exercise in use
// carries a step; (b) afterwards every exercise is the rotation's choice for its slot that week and the accessories follow the
// original projection's calendar; (c) no exercise after the return gets the return-entry dose; (d) an exercise not used during the
// return: never done before -> normal effort-guided establishment; not performed for more than return.moderateMaxDays (by date) ->
// effort-guided re-establishment (strength.resumeAfterDays, R6-ROTATION condition 8); otherwise its dose is recorded.
let Y2N=0;
function d51Run({schedule={},athleteExtra={},label,pref,s,d,weeks=16,known=[SQUAT,BENCH],goal={run:'PERFORMANCE',strength:'HYPERTROPHY'},miss=null,second=null,gen=generateProgram,evaluate=evaluateProgram,auth=opts.authority,keep=false}){
 const o={authority:auth};
 const rv=(p,w,day,x={})=>{const dd=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:`s10-Y2-${label}-${w}-${Y2N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(dd),...x};};
 const p0=gen(intake({id:'s10-Y2-'+label,weeks,athlete:{goals:goal,knownExercises:known,exerciseRotationPreference:pref,...athleteExtra},schedule}),o).program;
 if(!p0)return {label,status:'NO_PROGRAM'};
 const done=new Map(),windows=[],returns=[],missedLog=[];
 const live=x=>!windows.some(([a,b])=>x.date>=a&&x.date<=b);
 const execWeek=(P,w)=>{const list=P.weeks[w].sessions.filter(x=>x.prescription&&live(x));const kept=list.filter(x=>!(miss&&miss(P,w,x,{returns})));for(const x of list)if(!kept.includes(x))missedLog.push(`w${w} ${x.sport} ${x.date}`);for(const x of kept)for(const e of x.prescription.exercises??[]){if(!done.has(e.id))done.set(e.id,[]);done.get(e.id).push(x.date);}return kept.map(x=>({...obs(P,x),eventId:`s10-Y2-${label}-${x.id}-${Y2N++}`}));};
 let p=p0,ledger=[],w=0;
 for(const br of [{s,d},...(second?[second]:[])]){
  for(;w<br.s;w++){const r=evaluate(p,rv(p,w,6,{observations:execWeek(p,w),actualLedger:ledger}),o);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
  const abs=br.s*7+br.d,rw=Math.floor(abs/7),rday=abs%7;if(rw>=p.weeks.length-1)return {label,skipped:'return review beyond horizon'};
  const from=p.weeks[br.s].startDate,after=addDays(p.weeks[rw].startDate,rday);
  const r0=evaluate(p,rv(p,rw,rday,{kind:'RETURN_AFTER_PAUSE',interruption:{days:br.d,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),o);
  if(!r0.proposal)return {label,status:r0.status,reason:r0.reason};
  windows.push([from,after]);p=r0.proposal;ledger=r0.actualLedger;const ew=p.decisions.at(-1).fromWeek;returns.push({s:br.s,d:br.d,from,after,ew,cls:p.decisions.at(-1).interruption.class});w=ew;
 }
 for(;w<p.weeks.length-1;w++){const r=evaluate(p,rv(p,w,6,{observations:execWeek(p,w),actualLedger:ledger}),o);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
 const Q=p,sk=skeletonOf(Q,auth),v=[],moderate=RET.moderateMaxDays;
 const stepIds=w=>Object.entries(Q.stateTrace[w]?.strength?.exercises??{}).filter(([,e])=>Number.isInteger(e.returnStep)).map(([id,e])=>id+':'+e.returnStep);
 const rowsW=w=>Q.weeks[w].sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription&&live(x)).flatMap(x=>x.prescription.exercises.map(e=>({date:x.date,id:e.id,role:e.role,sets:e.sets,reps:e.reps,rir:e.rir,mode:e.load.mode,value:e.load.value??null,instructions:e.instructions??[]})));
 const accessories=(P,w)=>[...new Set(P.weeks[w].sessions.flatMap(x=>x.prescription?.exercises??[]).filter(e=>e.role!=='MAIN').map(e=>e.id))].sort().join(',');
 const res=returns.map((r,i)=>{
  const until=i+1<returns.length?returns[i+1].s:Q.weeks.length;
  let lastRet=-1;for(let x=r.ew;x<until;x++)if(stepIds(x).length)lastRet=x;
  const used=new Set();for(let x=r.ew;x<=lastRet;x++)for(const e of rowsW(x))used.add(e.id);
  const retTrace=[];for(let x=r.ew;x<=Math.min(until-1,lastRet+1);x++)retTrace.push(`${x}:${Q.phases.phases[x].slice(0,4)}:[${stepIds(x).join(' ')}]`);
  let rotatedWeeks=0,offCalendar=0;const firstBack=[],seen=new Set(used),projectionMismatch=[];
  for(let x=lastRet+1;x<until;x++){
   const choice=new Set(),base=new Set();for(const t of sk.templatesForDate(Q.weeks[x].startDate)){const rot=sk.rotation(x,t);for(const row of t.rows){choice.add(rot[row.slot]??row.entry?.id);base.add(row.entry?.id);}}
   const rows=rowsW(x);
   for(const e of rows){if(!choice.has(e.id)){offCalendar++;v.push(`${label} return ${i+1} w${x}: ${e.id} is not the rotation's choice`);}if(e.instructions.some(t=>/^Return entry/.test(t)))v.push(`${label} return ${i+1} w${x}: ${e.id} at the return-entry dose`);}
   if(rows.some(e=>!base.has(e.id)))rotatedWeeks++;
   if(accessories(Q,x)!==accessories(p0,x))projectionMismatch.push(`w${x}: ${accessories(Q,x)} vs projected ${accessories(p0,x)}`);
   for(const e of rows){if(seen.has(e.id))continue;seen.add(e.id);
    const before=(done.get(e.id)??[]).filter(t=>t<r.from),last=before.length?before.at(-1):null,gapDays=last?gap(last,e.date):null,stateEx=Q.stateTrace[x]?.strength?.exercises?.[e.id]??null;
    const est=e.mode==='ESTABLISH',reEst=e.instructions.some(t=>/Not done for more than/.test(t)),rampPending=e.mode==='FROM_LOG'&&/^Ramp up/.test(e.instructions[0]??''),noLogRef=e.mode==='FROM_LOG'&&e.instructions.some(t=>/Use the load you logged last time/.test(t))&&!(done.get(e.id)??[]).some(t=>t<e.date);
    const kind=last===null?'NEVER_DONE_BEFORE':gapDays>moderate?'GAP_ABOVE_MODERATE':'GAP_WITHIN_MODERATE';
    firstBack.push({week:x,date:e.date,id:e.id,role:e.role,kind,effortGuided:est||rampPending||e.mode==='BODYWEIGHT',noLogReference:noLogRef,lastDoneBeforeBreak:last,gapDays,runtimeLastPerformed:stateEx?.lastPerformed??null,runtimeLastWeek:stateEx?.lastWeek??null,runtimeGapBasisDays:clockDays(stateEx,x,e.date),dose:`${e.sets}x${e.reps}@RIR${e.rir} ${e.mode}${e.value!=null?' '+e.value:''}`,firstInstruction:e.instructions[0]??null});
    if(kind==='NEVER_DONE_BEFORE'&&!est&&!rampPending&&e.mode!=='BODYWEIGHT')v.push(`D52 ${label} return ${i+1} w${x}: ${e.id}, never performed, is prescribed ${e.sets}x${e.reps}@RIR${e.rir} ${e.mode}${noLogRef?' with "Use the load you logged last time" and no log':''}, not established by effort`);
    if(kind==='GAP_ABOVE_MODERATE'&&!(est&&reEst)&&!rampPending&&e.mode!=='BODYWEIGHT')v.push('D52 '+`${label} return ${i+1} w${x}: ${e.id} last performed ${gapDays} days earlier (${last}) is prescribed ${e.sets}x${e.reps}@RIR${e.rir} ${e.mode}${e.value!=null?' '+e.value:''}, not re-established by effort`);
   }
  }
  const bdx=(w,id)=>Q.stateTrace[w]?.strength?.exercises?.[id]?.blocksDone??0,allIds=new Set(Q.stateTrace.flatMap(st=>Object.keys(st.strength.exercises))),blockAtBreak=[];
  for(const b of Q.blocks.filter(b=>['BUILD','DEVELOPMENT','NEXT_BLOCK'].includes(b.family))){const e=b.endWeekExclusive;if(!(b.startWeek<=r.s&&r.s<e)||e<=r.ew||e>=Q.stateTrace.length)continue;for(const id of allIds)if(bdx(e,id)>bdx(e-1,id)){blockAtBreak.push(`${id} at the end of block ${b.startWeek}-${e-1}`);v.push(`${label} return ${i+1}: block ${b.startWeek}-${e-1}, in progress at the break, credited ${id}`);}}
  return {return:i+1,pauseStartWeek:r.s,blockCreditAtBreak:blockAtBreak,days:r.d,class:r.cls,entryWeek:r.ew,lastWeekWithAReturnStep:lastRet,weeksInReturn:lastRet>=r.ew?lastRet-r.ew+1:0,usedDuringReturn:[...used].sort(),returnTrace:retTrace,weeksAfterReturn:Math.max(0,until-lastRet-1),rotatedWeeks,offCalendar,projectionMismatch,firstBackAfterReturn:firstBack};
 });
 // Round 11: every state's clock against this probe's own record of executed dates (or the known dose's observed date), outside the weeks
 // between a pause start and its entry week, and D48: no FROM_LOG row that points at a log before any executed (logged) exposure.
 const knownAt=Object.fromEntries(known.map(k=>[k.id,String(k.observedAt).slice(0,10)])),clock={states:0,mismatch:[],stateNeverPerformed:[],fromLogWithoutLog:[]};
 for(let x=1;x<Q.weeks.length;x++){
  if(returns.some(r=>x>r.s&&x<r.ew))continue;
  const startD=Q.weeks[x].startDate;
  for(const [id,ex] of Object.entries(Q.stateTrace[x]?.strength?.exercises??{})){clock.states++;const exp=(done.get(id)??[]).filter(t=>t<startD).sort().at(-1)??knownAt[id]??null;if(exp===null)clock.stateNeverPerformed.push(`w${x} ${id}`);else if((ex.lastPerformed??null)!==exp)clock.mismatch.push(`w${x} ${id}: runtime ${ex.lastPerformed??('lastWeek '+ex.lastWeek)} vs performed ${exp}`);}
  for(const e of rowsW(x))if(e.mode==='FROM_LOG'&&!/^Ramp up/.test(e.instructions[0]??'')&&!(done.get(e.id)??[]).some(t=>t<e.date))clock.fromLogWithoutLog.push(`w${x} ${e.date} ${e.id}: ${e.sets}x${e.reps} | ${e.instructions[0]}`);
 }
 return {label,pref,missed:missedLog,returns:res,violations:v,clock,...(keep?{program:Q,p0}:{})};
}
guard('Y2_D51',()=>{
 const grid=[];
 for(const pref of ['EVERY_2_WEEKS','EVERY_6_WEEKS','COACH_DECIDES','FIXED'])for(const [s,d] of [[3,14],[4,21],[5,14],[6,14],[6,21],[8,14],[4,35],[6,35]])grid.push(d51Run({label:`${pref}-s${s}-d${d}`,pref,s,d}));
 // Q2: in use means prescribed in the week; a missed in-use exposure keeps the return open; a week without strength exposure ends nothing
 const isStrength=x=>x.sport==='STRENGTH';
 const q2=[
  d51Run({label:'q2-miss-squat-step2',pref:'EVERY_2_WEEKS',s:6,d:14,miss:(P,w,x,{returns})=>returns.length===1&&w===returns[0].ew+1&&isStrength(x)&&x.prescription.exercises.some(e=>e.id==='back-squat')}),
  d51Run({label:'q2-miss-all-strength-step2',pref:'EVERY_2_WEEKS',s:6,d:14,miss:(P,w,x,{returns})=>returns.length===1&&w===returns[0].ew+1&&isStrength(x)}),
  d51Run({label:'q2-miss-all-strength-entry',pref:'EVERY_2_WEEKS',s:6,d:14,miss:(P,w,x,{returns})=>returns.length===1&&w===returns[0].ew&&isStrength(x)}),
  d51Run({label:'q2-miss-squat-step2-coach',pref:'COACH_DECIDES',s:5,d:21,miss:(P,w,x,{returns})=>returns.length===1&&w===returns[0].ew+1&&isStrength(x)&&x.prescription.exercises.some(e=>e.id==='back-squat')})
 ];
 // a second return after the first has ended
 const second=[
  d51Run({label:'second-e2w',pref:'EVERY_2_WEEKS',s:3,d:14,second:{s:10,d:21}}),
  d51Run({label:'second-coach',pref:'COACH_DECIDES',s:3,d:14,second:{s:10,d:21}}),
  d51Run({label:'second-e2w-long',pref:'EVERY_2_WEEKS',s:2,d:14,second:{s:8,d:35}})
 ];
 const all=[...grid,...q2,...second],rets=all.flatMap(x=>(x.returns??[]).map(r=>({label:x.label,...r})));
 const fb=rets.flatMap(r=>r.firstBackAfterReturn.map(f=>({label:r.label,return:r.return,...f})));
 return {timelines:all.length,returns:rets.length,weeksInReturnHistogram:rets.reduce((m,r)=>{m[r.weeksInReturn]=(m[r.weeksInReturn]??0)+1;return m;},{}),
  returnsEndingAfterMoreThanTwoWeeks:rets.filter(r=>r.weeksInReturn>2).map(r=>`${r.label} return ${r.return}: ${r.returnTrace.join(' | ')}`),
  rotatingTimelinesWithRotationAfterReturn:rets.filter(r=>!/^FIXED/.test(r.label)&&r.weeksAfterReturn>=3).map(r=>`${r.label}#${r.return}: rotated weeks ${r.rotatedWeeks} of ${r.weeksAfterReturn}`),
  projectionMismatchWeeks:rets.reduce((n,r)=>n+r.projectionMismatch.length,0),projectionMismatchSample:rets.flatMap(r=>r.projectionMismatch.map(m=>r.label+' '+m)).slice(0,10),
  firstBackByKind:fb.reduce((m,f)=>{m[f.kind]=(m[f.kind]??0)+1;return m;},{}),
  clockMismatch:fb.filter(f=>f.kind==='GAP_ABOVE_MODERATE'&&Number.isInteger(f.runtimeGapBasisDays)&&f.runtimeGapBasisDays<=RET.moderateMaxDays).map(f=>`${f.label}#${f.return} w${f.week} ${f.id}: ${f.gapDays} days, clock ${f.runtimeGapBasisDays} -> ${f.dose}`),
  noLogReference:fb.filter(f=>f.noLogReference).length,blockCreditAtBreak:rets.flatMap(r=>r.blockCreditAtBreak.map(b=>r.label+' '+b)),
  gapAboveModerate:fb.filter(f=>f.kind==='GAP_ABOVE_MODERATE').map(f=>`${f.label}#${f.return} w${f.week} ${f.id}: ${f.gapDays} days (runtime basis ${f.runtimeGapBasisDays}) -> ${f.dose} | ${f.firstInstruction}`),
  gapWithinModerate:fb.filter(f=>f.kind==='GAP_WITHIN_MODERATE').map(f=>`${f.label}#${f.return} w${f.week} ${f.id}: ${f.gapDays} days -> ${f.dose} | ${f.firstInstruction}`),
  neverDoneBefore:fb.filter(f=>f.kind==='NEVER_DONE_BEFORE').map(f=>`${f.label}#${f.return} w${f.week} ${f.id}: ${f.dose} | ${f.firstInstruction}`).slice(0,12),
  q2:q2.map(x=>({label:x.label,missed:x.missed,returns:(x.returns??[]).map(r=>({entryWeek:r.entryWeek,lastWeekWithAReturnStep:r.lastWeekWithAReturnStep,returnTrace:r.returnTrace})),violations:x.violations})),
  second:second.map(x=>({label:x.label,returns:(x.returns??[]).map(r=>({class:r.class,entryWeek:r.entryWeek,weeksInReturn:r.weeksInReturn,returnTrace:r.returnTrace,rotatedWeeks:r.rotatedWeeks,weeksAfterReturn:r.weeksAfterReturn})),violations:x.violations})),
  clockAudit:{states:all.reduce((n,x)=>n+(x.clock?.states??0),0),mismatch:all.flatMap(x=>(x.clock?.mismatch??[]).map(m=>x.label+' '+m)),stateNeverPerformed:all.flatMap(x=>(x.clock?.stateNeverPerformed??[]).map(m=>x.label+' '+m)),fromLogWithoutLog:all.flatMap(x=>(x.clock?.fromLogWithoutLog??[]).map(m=>x.label+' '+m))},
  violations:all.flatMap(x=>x.violations??[]),notRun:all.filter(x=>!x.returns).map(x=>({label:x.label,status:x.status??x.skipped,reason:x.reason??null})),detail:grid.map(x=>({label:x.label,returns:(x.returns??[]).map(r=>({class:r.class,entryWeek:r.entryWeek,weeksInReturn:r.weeksInReturn,returnTrace:r.returnTrace,rotatedWeeks:r.rotatedWeeks,weeksAfterReturn:r.weeksAfterReturn,firstBack:r.firstBackAfterReturn.map(f=>`w${f.week} ${f.id} ${f.kind} gap ${f.gapDays} basis ${f.runtimeGapBasisDays}: ${f.dose}`)}))}))};
});
// ---------------------------------------------------------------- Z. D52 (found in round 10): strength state from prescriptions that were not executed
// (Z1) normal operation, no return: the first (establishment) exposure of a loaded exercise is missed; what is the next exposure?
// (Z2) normal operation: runs executed, every strength session missed for five weeks (weeks 4-8), FIXED selection; the dose when
//      strength resumes, against strength.resumeAfterDays ("not performed for more than return.moderateMaxDays").
// (Z4) an equipment window (EQUIPMENT_CHANGE review, weeks 4-6 without a barbell): the unfamiliar substitute's first (establishment)
//      exposure is missed; what is its next exposure (R6-SUBSTITUTION conditions 6 and 7)?
// (Z3) after a return (reachable through the D51 clearing): an exercise first prescribed in a session dated inside the pause, and an
//      exercise rotated back 35 days after its last performance (whole-week arithmetic of the runtime clock).
function zSuite(generateProgram,evaluateProgram,opts){
 const res={missedFirstExposure:[],skippedStrength:null,afterReturn:[]},viol=[];let n=0;
 const rvW=(p,w,tag,x={})=>{const dd=addDays(p.weeks[w].startDate,6);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:`s10-Z-${tag}-${w}-${n++}`,kind:'WEEKLY_REVIEW'},eligibility:elig(dd),...x};};
 const rowsOf=(P,w,id)=>P.weeks[w].sessions.filter(z=>z.sport==='STRENGTH'&&z.prescription).flatMap(z=>z.prescription.exercises.filter(e=>e.id===id).map(e=>({date:z.date,dose:`${e.sets}x${e.reps}@RIR${e.rir} ${e.load.mode}${e.load.value!=null?' '+e.load.value:''}`,mode:e.load.mode,instructions:(e.instructions??[]).slice(0,2)})));
 for(const [pref,known,run] of [['EVERY_2_WEEKS',[SQUAT,BENCH],'PERFORMANCE'],['COACH_DECIDES',[SQUAT,BENCH],'PERFORMANCE'],['FIXED',[],'REGULAR']]){
  const tag='z1-'+pref;let p=generateProgram(intake({id:'s10-'+tag,weeks:16,athlete:{goals:{run,strength:'HYPERTROPHY'},knownExercises:known,exerciseRotationPreference:pref}}),opts).program,ledger=[];
  const first={};for(let w=0;w<p.weeks.length;w++)for(const z of p.weeks[w].sessions)for(const e of z.prescription?.exercises??[])if(!(e.id in first))first[e.id]={w,mode:e.load.mode,date:z.date};
  const cand=Object.entries(first).filter(([,f])=>f.mode==='ESTABLISH'),[tid,tf]=cand.find(([,f])=>f.w>=1)??cand[0];
  for(let w=0;w<=Math.min(p.weeks.length-2,tf.w+3);w++){const o=p.weeks[w].sessions.filter(z=>z.prescription&&!(z.date===tf.date&&z.sport==='STRENGTH')).map(z=>({...obs(p,z),eventId:`s10-Z-${tag}-${z.id}-${n++}`}));const r=evaluateProgram(p,rvW(p,w,tag,{observations:o,actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
  const next=[];for(let w=tf.w+1;w<=Math.min(p.weeks.length-1,tf.w+4);w++){const rows=rowsOf(p,w,tid);if(rows.length){next.push({week:w,phase:p.phases.phases[w],...rows[0]});break;}}
  res.missedFirstExposure.push({pref,exercise:tid,missedEstablishmentWeek:tf.w,missedDate:tf.date,nextExposure:next[0]??null});
  const nx=next[0];if(nx&&nx.mode==='FROM_LOG'&&nx.instructions.some(t=>/Use the load you logged last time/.test(t)))viol.push(`D52-A ${pref}: ${tid}, establishment exposure on ${tf.date} missed and never logged, is next prescribed ${nx.dose} with "${nx.instructions[0]}"`);
 }
 {
  const tag='z2';let p=generateProgram(intake({id:'s10-'+tag,weeks:16,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];const lastDone={};const statuses=[];
  for(let w=0;w<=9;w++){const skip=w>=4&&w<=8;const kept=p.weeks[w].sessions.filter(z=>z.prescription&&!(skip&&z.sport==='STRENGTH'));if(w<9)for(const z of kept)for(const e of z.prescription.exercises??[])lastDone[e.id]=z.date;const r=evaluateProgram(p,rvW(p,w,tag,{observations:kept.map(z=>({...obs(p,z),eventId:`s10-Z-${tag}-${z.id}-${n++}`})),actualLedger:ledger}),opts);statuses.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
  const w=9,rows=rowsOf(p,w,'back-squat'),st=p.stateTrace[w].strength.exercises['back-squat'],gapDays=rows[0]?gap(lastDone['back-squat'],rows[0].date):null;
  res.skippedStrength={reviews:statuses,lastPerformed:lastDone['back-squat']??null,resumeWeek:w,resumeRows:rows,gapDays,runtimeLastPerformed:st?.lastPerformed??null,runtimeLastWeek:st?.lastWeek??null,runtimeGapBasisDays:rows[0]?clockDays(st,w,rows[0].date):null,skippedWeekRows:[4,6,8].map(k=>({week:k,rows:rowsOf(p,k,'back-squat').map(x=>x.dose)}))};
  if(rows[0]&&gapDays>RET.moderateMaxDays&&rows[0].mode==='KNOWN')viol.push(`D52-B skipped strength: back-squat not performed for ${gapDays} days (last ${lastDone['back-squat']}) is prescribed ${rows[0].dose} in week ${w}, not re-established by effort (runtime clock ${res.skippedStrength.runtimeGapBasisDays} days from the last prescribed week)`);
 }
 const full=['DUMBBELLS','BENCH','BARBELL','RACK'],sched={strengthDays:[0,4],runDays:[1,2,3],longRunDay:3};
 for(const [label,pref,s,d] of [['z3-new-in-pause-session','COACH_DECIDES',4,15],['z3-new-in-pause-session-6w','EVERY_6_WEEKS',5,15],['z3-35-days','COACH_DECIDES',7,12],['z3-35-days-6w','EVERY_6_WEEKS',7,13]]){
  const x=d51Run({label,pref,s,d,known:[SQUAT,BENCH],athleteExtra:{equipment:full},schedule:sched,gen:generateProgram,evaluate:evaluateProgram,auth:opts.authority});
  res.afterReturn.push({label,pref,s,d,returns:(x.returns??[]).map(r=>({entryWeek:r.entryWeek,lastWeekWithAReturnStep:r.lastWeekWithAReturnStep,firstBack:r.firstBackAfterReturn.filter(f=>f.role!=='MAIN').map(f=>`w${f.week} ${f.id} ${f.kind} gap ${f.gapDays} clock ${f.runtimeGapBasisDays}: ${f.dose} | ${f.firstInstruction}`)})),violations:x.violations??[],clock:x.clock??null,status:x.status??x.skipped??null});
  viol.push(...(x.violations??[]).filter(v=>/^D52/.test(v)));
  for(const r of x.returns??[])for(const f of r.firstBackAfterReturn)if(f.kind==='GAP_ABOVE_MODERATE'&&Number.isInteger(f.runtimeGapBasisDays)&&f.runtimeGapBasisDays<=RET.moderateMaxDays&&!/BODYWEIGHT/.test(f.dose))viol.push(`D52-B ${label}: ${f.id} last performed ${f.gapDays} days earlier counts as ${f.runtimeGapBasisDays} days on the runtime clock (${f.dose} | ${f.firstInstruction})`);
 }
 {
  const tag='z4';const rvD=(p,w,day,x={})=>{const dd=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:`s10-Z-${tag}-${w}-${x.kind??'W'}-${n++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(dd),...x};};
  let p=generateProgram(intake({id:'s10-'+tag,weeks:12,athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}}),opts).program,ledger=[];
  for(let w=0;w<3;w++){const r=evaluateProgram(p,rvD(p,w,6,{observations:p.weeks[w].sessions.filter(z=>z.prescription).map(z=>({...obs(p,z),eventId:`s10-Z-${tag}-${z.id}-${n++}`})),actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}
  const r0=evaluateProgram(p,rvD(p,3,0,{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[4].startDate,to:addDays(p.weeks[6].startDate,6)},actualLedger:ledger}),opts);p=r0.proposal??p;ledger=r0.actualLedger??ledger;
  const subEx=p.weeks[4].sessions.flatMap(z=>z.prescription?.exercises??[]).find(e=>e.load.mode==='ESTABLISH'&&e.role==='MAIN');
  const firstDate=subEx?p.weeks[4].sessions.find(z=>z.prescription?.exercises?.some(e=>e.id===subEx.id))?.date:null;
  if(subEx){for(let k=3;k<=5;k++){const o=p.weeks[k].sessions.filter(z=>z.prescription&&!(z.date===firstDate&&z.sport==='STRENGTH')).map(z=>({...obs(p,z),eventId:`s10-Z-${tag}-${z.id}-${n++}`}));const r=evaluateProgram(p,rvD(p,k,6,{observations:o,actualLedger:ledger}),opts);ledger=r.actualLedger;if(r.proposal)p=r.proposal;}}
  const rows=subEx?[4,5,6].map(k=>({week:k,rows:rowsOf(p,k,subEx.id)})):[];
  res.substitution={equipmentChange:`${r0.status}/${r0.action}`,substitute:subEx?.id??null,missedFirstExposure:firstDate,rows};
  const nx=rows.find(x=>x.week===5)?.rows?.[0];if(nx&&nx.mode==='FROM_LOG'&&nx.instructions.some(t=>/Use the load you logged last time/.test(t)))viol.push(`D52-A substitution: ${subEx.id}, the substitute's establishment exposure on ${firstDate} missed and never logged, is next prescribed ${nx.dose} with "${nx.instructions[0]}" and "${nx.instructions[1]}"`);
 }
 res.violations=viol;return res;
}
guard('Z_D52',()=>zSuite(generateProgram,evaluateProgram,opts));

// ================================================================ round 11 (runtime-only D52 fix at the same hash 18ec48f3...)
// Every round-11 section reads the runtime clock from lastPerformed, a local YYYY-MM-DD date; the field lastWeek no longer exists.
let N11=0;
const rv11=(p,w,day,{tag='x',kind='WEEKLY_REVIEW',...x}={})=>{const dd=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:dd+'T21:00:00Z',weekIndex:w,event:{id:`s11-${tag}-${w}-${kind}-${N11++}`,kind},eligibility:elig(dd),...x};};
const strRows=(P,w)=>(P.weeks[w]?.sessions??[]).filter(z=>z.sport==='STRENGTH'&&z.prescription).flatMap(z=>z.prescription.exercises.map(e=>({session:z.id,day:z.day,date:z.date,id:e.id,role:e.role,mode:e.load.mode,value:e.load.value??null,sets:e.sets,reps:e.reps,rir:e.rir,establishment:!!e.establishment,pending:e.load.mode==='FROM_LOG'&&/^Ramp up/.test(e.instructions?.[0]??''),instructions:e.instructions??[]})));
const doseOf=r=>`${r.sets}x${r.reps}@RIR${r.rir} ${r.mode}${r.value!=null?' '+r.value:''}${r.pending?' (pending)':''}`;
// A FROM_LOG row that is not the pending (ramp-up) row points the athlete at a logged load.
const pointsAtLog=r=>r.mode==='FROM_LOG'&&!r.pending;
// Rows acceptable for an exercise with no state: effort-guided establishment, a bodyweight first exposure or return entry, movement practice.
const effortRow=r=>r.mode==='ESTABLISH'||r.mode==='BODYWEIGHT'&&(r.establishment||r.instructions.some(t=>/^Return entry/.test(t)))||r.role==='PRACTICE';
const noteOf=r=>r.instructions.find(t=>/^(Not done|No usable load|Return entry|Return step)/.test(t))??null;
const lastBefore=(arr,d)=>(arr??[]).filter(t=>t<d).sort().at(-1)??null;
const pickState=e=>e?{mode:e.mode,load:e.load??null,reps:e.reps??null,sets:e.sets??null,priorSets:e.priorSets??null,ceiling:e.ceiling??null,pendingLoad:e.pendingLoad??null,unlogged:!!e.unlogged,returnStep:e.returnStep??null,setCap:e.setCap??null,lastPerformed:e.lastPerformed??null,source:e.source??null}:null;
/**
 * One scripted timeline. act(P,w,z) per prescribed session: 'EXEC' (default: logged as prescribed; establishment rows at 20 kg unless
 * `loads` says otherwise), 'MISS', 'NODETAIL' (completed, no exercise details), {partial:[ids]} (not completed; only those listed, with
 * their sets) or {conflict:value} (the same event id reported twice, first with `value` and then as prescribed). review(w)===false skips
 * that week's review entirely (nothing is reported). pre[w](p,ledger,o) runs an extra review before week w's observations.
 * This probe keeps its own record of executed dates (done) and logged loads (logged) per exercise.
 */
function run11({tag,ia,weeks=12,act=()=>'EXEC',loads=null,review=null,pre=null,gen=generateProgram,evaluate=evaluateProgram,auth=opts.authority,until=null}){
 const o={authority:auth},g=gen(intake({id:'s11-'+tag,weeks,...ia}),o),P0=g.program;
 if(!P0)return {tag,status:'NO_PROGRAM',errors:g.errors??g.reason??null};
 let p=P0,ledger=[];const done={},logged={},log=[],end=until??p.weeks.length-1;
 const mark=(m,id,d)=>{(m[id]??=[]).push(d);};
 for(let w=0;w<end;w++){
  if(pre?.[w]){const r0=pre[w](p,ledger,o);log.push(`${w}<:${r0.status}/${r0.action}`);ledger=r0.actualLedger??ledger;if(r0.proposal)p=r0.proposal;}
  const list=[];
  for(const z of p.weeks[w].sessions.filter(z=>z.prescription)){
   const a=act(p,w,z)??'EXEC';if(a==='MISS')continue;
   const base=obs(p,z,{over:loads?.(p,w,z)??{},eventId:`s11-${tag}-${z.id}-${N11++}`});
   if(z.sport==='STRENGTH'){
    if(a==='NODETAIL'){delete base.actual.exercises;for(const e of z.prescription.exercises)mark(done,e.id,z.date);}
    else if(a?.partial){base.actual.completed=false;base.actual.exercises=base.actual.exercises.filter(e=>a.partial.includes(e.id));for(const e of base.actual.exercises){mark(done,e.id,z.date);mark(logged,e.id,z.date);}}
    else if(a?.conflict!==undefined){const b=structuredClone(base);for(const e of b.actual.exercises)for(const s of e.sets)if(s.load&&typeof s.load==='object'&&s.load.unit!=='BODYWEIGHT')s.load={...s.load,value:a.conflict};list.push(b);}
    else for(const e of base.actual.exercises){mark(done,e.id,z.date);mark(logged,e.id,z.date);}
   }
   list.push(base);
  }
  if(review&&review(w)===false){log.push(`${w}:NO_REVIEW`);continue;}
  const r=evaluate(p,rv11(p,w,6,{tag,observations:list,actualLedger:ledger}),o);
  log.push(`${w}:${r.status}/${r.action}`);ledger=r.actualLedger??ledger;if(r.proposal)p=r.proposal;
 }
 const known=Object.fromEntries((ia.athlete?.knownExercises??[]).map(k=>[k.id,String(k.observedAt).slice(0,10)]));
 return {tag,P0,P:p,done,logged,log,known,ledger};
}
/**
 * D52 invariants on a reviewed timeline, against this probe's own record: every state's lastPerformed is the last executed date (or the
 * known dose's observed date); no state for a never-performed exercise; a never-performed exercise gets an effort row; a FROM_LOG row
 * that points at a log has a logged load before it; a loaded exercise not performed for more than return.moderateMaxDays (outside a
 * return step) is re-established by effort. Bodyweight resumption is R17 and not counted here.
 */
function audit11(t,{from=1,to=null,skipWeeks=[]}={}){
 const {P,done,logged,known}=t,v=[];let states=0,rows=0,pointing=0,stateless=0;
 for(let w=from;w<=Math.min(to??P.weeks.length-1,P.weeks.length-1);w++){
  if(skipWeeks.includes(w))continue;
  const start=P.weeks[w].startDate,st=P.stateTrace[w]?.strength?.exercises??{};
  for(const [id,ex] of Object.entries(st)){states++;const exp=lastBefore(done[id],start)??known[id]??null;if(exp===null)v.push(`w${w} ${id}: a state for an exercise never performed`);else if((ex.lastPerformed??null)!==exp)v.push(`w${w} ${id}: lastPerformed ${ex.lastPerformed??'none'} but last performed ${exp}`);}
  for(const r of strRows(P,w)){rows++;const ex=st[r.id];
   if(pointsAtLog(r)){pointing++;if(!lastBefore(logged[r.id],r.date))v.push(`w${w} ${r.date} ${r.id}: ${doseOf(r)} "${r.instructions[0]}" with no logged load`);}
   if(!ex){stateless++;if(!effortRow(r))v.push(`w${w} ${r.date} ${r.id}: never performed, prescribed ${doseOf(r)}`);}
   if(ex?.lastPerformed&&!Number.isInteger(ex.returnStep)&&r.mode!=='BODYWEIGHT'&&gap(ex.lastPerformed,r.date)>RET.moderateMaxDays&&r.mode!=='ESTABLISH')v.push(`w${w} ${r.date} ${r.id}: ${gap(ex.lastPerformed,r.date)} days since ${ex.lastPerformed}, prescribed ${doseOf(r)}`);
  }
 }
 return {states,rows,rowsPointingAtALog:pointing,statelessRows:stateless,violations:v};
}

// ---------------------------------------------------------------- Zb. probe Z on the reviewed round-10 runtime (does Z still detect D52 there?)
if(r10rt)guard('Zb_round10Runtime',()=>({runtime:'reviewed round-10 r6-program.mjs and r6-adaptation.mjs ('+Object.entries(r10rt.shas).map(([f,h])=>f+' '+h.slice(0,8)).join(', ')+') with every other source byte-identical to the current runtime',...zSuite(r10rt.generateProgram,r10rt.evaluateProgram,{authority:r10rt.authority})}));

// ---------------------------------------------------------------- AA. dossier Q1: later sessions of the same week repeat the establishment
// (1) 180 initial programs (5 strength-day patterns x 4 rotation preferences x 3 strength backgrounds x 3 goals): every exposure of an
//     exercise with no state at the week start is an effort row, in every projected week; planned week-0 and weeks-0-3 strength sets
//     against the reviewed round-10 runtime. (2) Every fifth variant executed and reviewed weekly, audited (audit11). (3) Week-0
//     establishment logs in a three-day full-body week: which combinations confirm a load at the review (D45 "a second log").
const AA_VARIANTS=[];
for(const days of [[0,2,4],[0,4],[0,3],[1,3,5],[0,2,4,6]])for(const pref of ['FIXED','EVERY_2_WEEKS','EVERY_6_WEEKS','COACH_DECIDES'])for(const [kl,known,exp] of [['none-novice',[],'NOVICE'],['none-int',[],'INTERMEDIATE'],['known',[SQUAT,BENCH],'INTERMEDIATE']])for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL'])AA_VARIANTS.push({days,pref,kl,known,exp,goal});
const aaIntake=x=>{const f=[0,1,2,3,4,5,6].filter(d=>!x.days.includes(d)),runDays=[f[0],f.at(-1)];return {athlete:{goals:{run:'REGULAR',strength:x.goal},strengthExperience:x.exp,knownExercises:x.known,exerciseRotationPreference:x.pref,recent:{runDaysPerWeek:2,runMinutesPerWeek:80,longestRunMinutes:40,strengthDaysPerWeek:x.days.length}},schedule:{strengthDays:x.days,runDays,longRunDay:runDays[1]}};};
guard('AA_Q1_sameWeek',()=>{
 const res={programs:0,noProgram:[],round10RuntimeNonEffortRowsWithoutState:0,round10RuntimeExample:null,statelessExposures:0,statelessExerciseWeeksWithTwoOrMore:0,violations:[],week0Sets:{same:0,lower:0,higher:0,lowerBy:{},examples:[]},weeks0to3Sets:{same:0,lower:0,higher:0}};
 for(const x of AA_VARIANTS){
  const tag=`aa-${x.days.join('')}-${x.pref}-${x.kl}-${x.goal}`,ia=aaIntake(x),P=generateProgram(intake({id:'s11-'+tag,weeks:12,...ia}),opts).program;
  if(!P){res.noProgram.push(tag);continue;}res.programs++;
  for(let w=0;w<P.weeks.length;w++){const st=P.stateTrace[w].strength.exercises,by={};for(const r of strRows(P,w))(by[r.id]??=[]).push(r);
   for(const [id,list] of Object.entries(by)){if(st[id])continue;res.statelessExposures+=list.length;if(list.length>1)res.statelessExerciseWeeksWithTwoOrMore++;for(const r of list)if(!effortRow(r))res.violations.push(`${tag} w${w} ${r.date} ${id}: ${doseOf(r)} with no state at the week start`);}}
  if(r10rt){const Q=r10rt.generateProgram(intake({id:'s11-'+tag,weeks:12,...ia}),{authority:r10rt.authority}).program;if(Q){const a=P.weeks[0].plannedStrengthSets,b=Q.weeks[0].plannedStrengthSets,k=a===b?'same':a<b?'lower':'higher';res.week0Sets[k]++;if(k==='lower')res.week0Sets.lowerBy[b-a]=(res.week0Sets.lowerBy[b-a]??0)+1;if(a!==b&&res.week0Sets.examples.length<10)res.week0Sets.examples.push(`${tag}: ${b} -> ${a}`);for(let w=0;w<Q.weeks.length;w++){const st=Q.stateTrace[w].strength.exercises;for(const r of strRows(Q,w))if(!st[r.id]&&!effortRow(r)){res.round10RuntimeNonEffortRowsWithoutState++;res.round10RuntimeExample??=`${tag} w${w} ${r.date} ${r.id}: ${doseOf(r)} | ${r.instructions[0]}`;}}const s4=X=>X.weeks.slice(0,4).reduce((n,q)=>n+q.plannedStrengthSets,0),c=s4(P),d=s4(Q);res.weeks0to3Sets[c===d?'same':c<d?'lower':'higher']++;}}
 }
 const reviewed=[];
 for(const x of AA_VARIANTS.filter((_,i)=>i%5===0)){const tag=`aar-${x.days.join('')}-${x.pref}-${x.kl}-${x.goal}`,t=run11({tag,ia:aaIntake(x),weeks:12});if(!t.P)continue;reviewed.push({tag,statuses:[...new Set(t.log.map(l=>l.split(':')[1]))],audit:audit11(t)});}
 res.reviewed={timelines:reviewed.length,statuses:[...new Set(reviewed.flatMap(x=>x.statuses))],states:reviewed.reduce((n,x)=>n+x.audit.states,0),rows:reviewed.reduce((n,x)=>n+x.audit.rows,0),rowsPointingAtALog:reviewed.reduce((n,x)=>n+x.audit.rowsPointingAtALog,0),statelessRows:reviewed.reduce((n,x)=>n+x.audit.statelessRows,0),violations:reviewed.flatMap(x=>x.audit.violations.map(v=>x.tag+' '+v))};
 const ia3={athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},strengthExperience:'INTERMEDIATE',knownExercises:[],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
 const P3=generateProgram(intake({id:'s11-aa3',weeks:12,...ia3}),opts).program,by0={};for(const r of strRows(P3,0))if(r.mode==='ESTABLISH')(by0[r.id]??=[]).push(r);
 const X=Object.entries(by0).sort((a,b)=>b[1].length-a[1].length)[0]?.[0]??null,withX=P=>P.weeks[0].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X));
 res.sameWeekLogs={exercise:X,week0Rows:strRows(P3,0).filter(r=>r.id===X).map(r=>`${r.date} ${doseOf(r)} | ${r.instructions[0].slice(0,40)}`),scenarios:{}};
 for(const [k,vals] of Object.entries({agree:[20,20,20],lastTwoAgree:[20,30,30],disagree:[20,30,40],firstOnly:[20,null,null],laterOnly:[null,20,null],laterTwo:[null,20,20]})){
  const idx=(P,z)=>withX(P).findIndex(s=>s.id===z.id);
  const t=run11({tag:'aa3-'+k,ia:ia3,weeks:12,until:1,act:(P,w,z)=>{const i=idx(P,z);return i>=0&&vals[i]==null?'MISS':'EXEC';},loads:(P,w,z)=>{const i=idx(P,z),e=(z.prescription.exercises??[]).find(e=>e.id===X);return i>=0&&vals[i]!=null&&e?{[X]:{load:{value:vals[i],unit:'KG',convention:e.load.convention}}}:{};}});
  res.sameWeekLogs.scenarios[k]={logs:vals.slice(0,withX(P3).length),review:t.log[0],stateAfterWeek0:pickState(t.P.stateTrace[1].strength.exercises[X]),week1:strRows(t.P,1).filter(r=>r.id===X).map(r=>`${r.date} ${doseOf(r)}`)};
 }
 return res;
});

// ---------------------------------------------------------------- AB. dossier Q2: a completed report without exercise details
guard('AB_Q2_completedWithoutDetails',()=>{
 const res={};
 // (1) the first week of a rotated exercise reported completed without details (twin timelines), with the known squat alongside
 const ia={athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'EVERY_2_WEEKS'}};
 const P0=generateProgram(intake({id:'s11-ab1',weeks:16,...ia}),opts).program,first={};
 for(let w=0;w<P0.weeks.length;w++)for(const r of strRows(P0,w))if(!(r.id in first))first[r.id]={w,mode:r.mode};
 const [X,f]=Object.entries(first).find(([,v])=>v.mode==='ESTABLISH'&&v.w>=1)??[null,null];
 if(!X)return {error:'no rotated exercise'};
 const twin=k=>run11({tag:'ab1-'+k,ia,weeks:16,until:Math.min(15,f.w+4),act:(P,w,z)=>k==='nodetail'&&w===f.w&&z.sport==='STRENGTH'?'NODETAIL':'EXEC'});
 const nextOf=(t,id)=>{for(let k=f.w+1;k<t.P.weeks.length;k++){const r=strRows(t.P,k).filter(r=>r.id===id);if(r.length)return {week:k,rows:r.map(x=>`${x.date} ${doseOf(x)} | ${noteOf(x)??x.instructions[0]}`)};}return null;};
 const view=t=>{const st=t.P.stateTrace[f.w+1].strength.exercises;return {review:t.log[f.w],state:{[X]:pickState(st[X]),'back-squat':pickState(st['back-squat']),'db-bench-press':pickState(st['db-bench-press'])},next:{[X]:nextOf(t,X),'back-squat':nextOf(t,'back-squat')},audit:audit11(t,{to:f.w+3})};};
 res.rotatedFirstWeek={exercise:X,firstWeek:f.w,executedAndLogged:view(twin('exec')),completedWithoutDetails:view(twin('nodetail'))};
 // (2) a re-establishment reported completed without details, then performed with a log (FIXED; strength missed in weeks 4-8)
 const iaF={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}};
 const t2=run11({tag:'ab2',ia:iaF,weeks:16,until:12,act:(P,w,z)=>z.sport!=='STRENGTH'?'EXEC':w>=4&&w<=8?'MISS':w===9?'NODETAIL':'EXEC',loads:(P,w,z)=>w===10?{'back-squat':{load:kg(75)}}:{}});
 res.reEstablishmentWithoutDetails={log:t2.log,squat:[9,10,11,12].map(k=>({week:k,stateAtWeekStart:pickState(t2.P.stateTrace[k].strength.exercises['back-squat']),rows:strRows(t2.P,k).filter(r=>r.id==='back-squat').map(r=>`${r.date} ${doseOf(r)} | ${noteOf(r)??r.instructions[0]}`)})),audit:audit11(t2,{to:12})};
 // (3) a partial report listing only the squat: the other exercises of that session are not performed
 const t3=run11({tag:'ab3',ia:iaF,weeks:12,until:4,act:(P,w,z)=>w===2&&z.sport==='STRENGTH'&&z.prescription.exercises.some(e=>e.id==='back-squat')?{partial:['back-squat']}:'EXEC'});
 const s2=t3.P.weeks[2].sessions.find(z=>z.sport==='STRENGTH'&&z.prescription?.exercises.some(e=>e.id==='back-squat'));
 res.partialListingOne={session:s2?.id,date:s2?.date,exercises:s2?s2.prescription.exercises.map(e=>e.id):[],stateAtWeek3:Object.fromEntries((s2?.prescription.exercises??[]).map(e=>[e.id,pickState(t3.P.stateTrace[3].strength.exercises[e.id])])),audit:audit11(t3,{to:4})};
 return res;
});

// ---------------------------------------------------------------- AC. dossier Q3: the clock of an intake known dose starts at observedAt
guard('AC_Q3_knownDoseClock',()=>{
 const res={initialProgram:[],skippedFromWeek0:null};
 for(const days of [[0,3],[0,4]])for(const d of [0,7,14,21,24,25,26,27,28,29]){
  const obsAt=addDays('2026-11-01',-d),ia={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[{...SQUAT,observedAt:obsAt}],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:days,runDays:[1,6],longRunDay:6}};
  const P=generateProgram(intake({id:`s11-ac-${days.join('')}-${d}`,weeks:8,...ia}),opts).program;
  if(!P){res.initialProgram.push({strengthDays:days,daysBeforeAsOf:d,status:'NO_PROGRAM'});continue;}
  const st=P.stateTrace[0].strength.exercises['back-squat']??null,rows=strRows(P,0).filter(r=>r.id==='back-squat').map(r=>({date:r.date,daysSinceObserved:gap(obsAt,r.date),dose:doseOf(r),note:noteOf(r)}));
  const modes=rows.map(r=>/KNOWN/.test(r.dose)?'K':/ESTABLISH/.test(r.dose)?'E':'O');
  res.initialProgram.push({strengthDays:days,daysBeforeAsOf:d,observedAt:obsAt,knownDoseAccepted:!!st,stateLastPerformed:st?.lastPerformed??null,week0:rows,splitWeek0:modes.includes('K')&&modes.includes('E'),
   violations:st?rows.filter(r=>(r.daysSinceObserved>RET.moderateMaxDays)!==/ESTABLISH/.test(r.dose)).map(r=>`${r.date}: ${r.daysSinceObserved} days, ${r.dose}`):[]});
 }
 const t=run11({tag:'ac-skip',ia:{athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}},weeks:12,until:6,act:(P,w,z)=>z.sport==='STRENGTH'&&w<=3?'MISS':'EXEC'});
 res.skippedFromWeek0={observedAt:SQUAT.observedAt,log:t.log,squat:[1,2,3,4,5].map(k=>({week:k,rows:strRows(t.P,k).filter(r=>r.id==='back-squat').map(r=>`${r.date} (${gap(SQUAT.observedAt,r.date)} days) ${doseOf(r)} | ${noteOf(r)??r.instructions[0]}`)})),audit:audit11(t,{to:6})};
 return res;
});

// ---------------------------------------------------------------- AD. dossier Q4: the clock is judged per session
// An exercise prescribed in three sessions a week; in week 1 only its first session is performed, then weeks 2-4 have no strength. In
// week 5 its first exposure is 28 days later (within the window) and the later ones 30 and 32 days. Three ways week 5 is performed.
guard('AD_Q4_perSessionClock',()=>{
 const ia={athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},strengthExperience:'INTERMEDIATE',knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
 const P0=generateProgram(intake({id:'s11-ad',weeks:12,...ia}),opts).program,by={};for(const r of strRows(P0,1))(by[r.id]??=[]).push(r);
 const X=Object.entries(by).filter(([,l])=>l.length>=2&&l.every(r=>r.mode!=='BODYWEIGHT')).sort((a,b)=>b[1].length-a[1].length)[0]?.[0]??null;
 if(!X)return {error:'no loaded exercise prescribed twice in week 1'};
 const sessX=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X));
 const out5={};
 for(const variant of ['allPerformed','firstOnlyLogged','firstOnlyWithoutDetails']){
  const t=run11({tag:'ad-'+variant,ia,weeks:12,until:7,act:(P,w,z)=>{if(z.sport!=='STRENGTH')return 'EXEC';if(w===1)return z.id===sessX(P,1)[0]?.id?'EXEC':'MISS';if(w>=2&&w<=4)return 'MISS';if(w===5){if(variant==='allPerformed')return 'EXEC';if(z.id===sessX(P,5)[0]?.id)return variant==='firstOnlyWithoutDetails'?'NODETAIL':'EXEC';return 'MISS';}return 'EXEC';}});
  const rows=k=>strRows(t.P,k).filter(r=>r.id===X).map(r=>`${r.date} (${gap(lastBefore(t.done[X],t.P.weeks[5].startDate),r.date)} days) ${doseOf(r)} | ${noteOf(r)??r.instructions[0]}`);
  out5[variant]={log:t.log,lastPerformedBeforeWeek5:lastBefore(t.done[X],t.P.weeks[5].startDate),stateAtWeek5:pickState(t.P.stateTrace[5].strength.exercises[X]),week5:rows(5),stateAfterWeek5:pickState(t.P.stateTrace[6].strength.exercises[X]),week6:strRows(t.P,6).filter(r=>r.id===X).map(r=>`${r.date} ${doseOf(r)} | ${noteOf(r)??r.instructions[0]}`),audit:audit11(t,{to:7})};
 }
 return {exercise:X,variants:out5};
});

// ---------------------------------------------------------------- AE. author-found: a conflicted report neither sets nor confirms a load
// Week 0: the first session that establishes exercise X is reported twice under one event id (first at 20 kg, then at 40 kg: a conflict);
// its later establishment exposure that week is logged at 20 kg. On the round-10 runtime the conflicted 20 kg served as the agreeing
// earlier log. Also: does a conflicted report reset a known lift's clock?
guard('AE_conflictFilter',()=>{
 const res={};
 for(const days of [[0,3],[0,2,4]]){
  const ia={athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},strengthExperience:'INTERMEDIATE',knownExercises:[SQUAT],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:days,runDays:[1,5],longRunDay:5}};
  const P0=generateProgram(intake({id:'s11-ae-'+days.join(''),weeks:12,...ia}),opts).program,by={};for(const r of strRows(P0,0))if(r.mode==='ESTABLISH')(by[r.id]??=[]).push(r);
  const X=Object.entries(by).find(([,l])=>l.length>=2)?.[0]??null;if(!X){res['days'+days.join('')]={error:'no exercise established twice in week 0'};continue;}
  const sessX=P=>P.weeks[0].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X));
  const conv=P0.weeks[0].sessions.flatMap(s=>s.prescription?.exercises??[]).find(e=>e.id===X).load.convention;
  const script={act:(P,w,z)=>w===0&&z.id===sessX(P)[0]?.id?{conflict:20}:'EXEC',loads:(P,w,z)=>w===0&&z.id===sessX(P)[0]?.id?{[X]:{load:{value:40,unit:'KG',convention:conv}}}:{}};
  const mk=(gen,evaluate,auth,tag)=>{const t=run11({tag,ia,weeks:12,until:2,gen,evaluate,auth,...script});return {log:t.log,conflictedSession:sessX(t.P0)[0]?.id,stateAfterWeek0:pickState(t.P.stateTrace[1].strength.exercises[X]),squatAfterWeek0:pickState(t.P.stateTrace[1].strength.exercises['back-squat']),week1:strRows(t.P,1).filter(r=>r.id===X).map(r=>`${r.date} ${doseOf(r)} | ${r.instructions[0].slice(0,48)}`),audit:audit11(t,{to:2})};};
  res['days'+days.join('')]={exercise:X,current:mk(generateProgram,evaluateProgram,opts.authority,'ae-'+days.join('')),round10Runtime:r10rt?mk(r10rt.generateProgram,r10rt.evaluateProgram,r10rt.authority,'ae-r10-'+days.join('')):null};
 }
 return res;
});

// ---------------------------------------------------------------- AF. disclosed: a week whose review is skipped keeps the projection
// FIXED, known squat and bench; weeks 0-3 executed and reviewed; nothing executed in weeks 4-8. (1) every week reviewed; (2) no review at
// all in weeks 4-8 (nothing reported), then week 9 reviewed with everything missed; (3) as (2), with the absence declared on Monday of
// week 9 as a 35-day nonclinical pause (RETURN_AFTER_PAUSE), then weekly reviews.
guard('AF_skippedReviews',()=>{
 const ia={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}};
 const view=(t,ws)=>ws.map(k=>({week:k,squat:strRows(t.P,k).filter(r=>r.id==='back-squat').map(r=>`${r.date} ${doseOf(r)} | ${noteOf(r)??r.instructions[0]}`),longRunMinutes:t.P.weeks[k].sessions.find(s=>s.role==='LONG')?.prescription?.durationMinutes??null,runs:t.P.weeks[k].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.progression?.value!=null?'@'+JSON.stringify(s.progression.value):''}`).join(' '),squatState:pickState(t.P.stateTrace[k].strength.exercises['back-squat'])}));
 const t1=run11({tag:'af-reviewed',ia,weeks:16,until:11,act:(P,w)=>w>=4&&w<=8?'MISS':'EXEC'});
 const t2=run11({tag:'af-unreviewed',ia,weeks:16,until:11,act:(P,w)=>w>=4&&w<=9?'MISS':'EXEC',review:w=>!(w>=4&&w<=8)});
 const t3=run11({tag:'af-declared',ia,weeks:16,until:12,act:(P,w,z)=>w>=4&&w<=8||w===9&&z.day===0?'MISS':'EXEC',review:w=>!(w>=4&&w<=8),
  pre:{9:(p,ledger,o)=>evaluateProgram(p,rv11(p,9,0,{tag:'af-declared',kind:'RETURN_AFTER_PAUSE',interruption:{days:35,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),o)}});
 // (4) path (A): a rotated exercise first prescribed in weeks that are never reviewed (EVERY_2_WEEKS; nothing reported in weeks 2-3), the
 // athlete back and reviewed from week 4
 const iaR={athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'EVERY_2_WEEKS'}};
 const t4=run11({tag:'af-rotation',ia:iaR,weeks:16,until:12,act:(P,w)=>w===2||w===3?'MISS':'EXEC',review:w=>!(w===2||w===3)});
 const firstIn=(P,w0)=>{const seen=new Set();for(let k=0;k<w0;k++)for(const r of strRows(P,k))seen.add(r.id);return [...new Set(strRows(P,w0).map(r=>r.id))].filter(id=>!seen.has(id));};
 const newIn2=firstIn(t4.P0,2);
 const rotation={newInUnreviewedWeek2:newIn2,log:t4.log,statesAtWeek4:Object.fromEntries(newIn2.map(id=>[id,pickState(t4.P.stateTrace[4].strength.exercises[id])])),rows:[4,5,6,7,8,9,10,11].map(k=>({week:k,rows:strRows(t4.P,k).filter(r=>newIn2.includes(r.id)).map(r=>`${r.date} ${r.id} ${doseOf(r)} | ${r.instructions[0].slice(0,60)}`)})).filter(x=>x.rows.length),auditFromWeek4:audit11(t4,{from:4,to:12})};
 const lastSquat=t=>lastBefore(t.done['back-squat'],'2026-12-28');
 return {lastSquatPerformed:{reviewed:lastSquat(t1),unreviewed:lastSquat(t2),declared:lastSquat(t3)},
  everyWeekReviewed:{log:t1.log,weeks:view(t1,[8,9,10]),audit:audit11(t1,{to:11})},
  weeks4to8Unreviewed:{log:t2.log,weeks:view(t2,[8,9,10]),auditFromWeek10:audit11(t2,{from:10,to:11})},
  declaredReturnAtWeek9:{log:t3.log,weeks:view(t3,[9,10,11]),auditFromWeek10:audit11(t3,{from:10,to:12})},
  rotationFirstPrescribedInUnreviewedWeeks:rotation,
  weeks3and9runsUnreviewed:view(t2,[3]).map(x=>x.runs)};
});

// ---------------------------------------------------------------- AG. disclosed: a never-performed exercise prescribed during a return
// FIXED, Monday and Thursday strength; every Thursday session is missed up to and including the return-entry week, so the Thursday-only
// exercises have never been performed when the return starts. Pauses of 13, 14 and 20 days. Rows and return markers in the entry week
// and the four weeks after it, on the current and on the reviewed round-10 runtime.
guard('AG_neverPerformedDuringReturn',()=>{
 const mk=(gen,evaluate,auth,label,s,d)=>d51Run({label,pref:'FIXED',s,d,weeks:16,known:[SQUAT,BENCH],miss:(P,w,x,{returns})=>x.sport==='STRENGTH'&&x.day===4&&(returns.length===0||w<=returns[0].ew),gen,evaluate,auth,keep:true});
 const pick=x=>{if(!x.program)return {status:x.status??x.skipped??null,reason:x.reason??null};const Q=x.program,ew=x.returns?.[0]?.entryWeek,weeks=[];
  for(let k=ew;k<Math.min(Q.weeks.length,ew+5);k++){const st=Q.stateTrace[k].strength.exercises;weeks.push({week:k,phase:Q.phases.phases[k],rows:strRows(Q,k).map(r=>`d${r.day} ${r.id} ${doseOf(r)}${st[r.id]?(Number.isInteger(st[r.id].returnStep)?' [step '+st[r.id].returnStep+']':'')+(Number.isInteger(st[r.id].setCap)?' [cap '+st[r.id].setCap+']':''):' [no state]'}${noteOf(r)?' | '+noteOf(r):''}`)});}
  return {entryWeek:ew,returnTrace:x.returns?.[0]?.returnTrace??null,weeks,clock:x.clock,violations:x.violations};};
 const res={};
 for(const [s,d] of [[4,13],[4,14],[5,20]])res[`s${s}-d${d}`]={current:pick(mk(generateProgram,evaluateProgram,opts.authority,`ag-s${s}-d${d}`,s,d)),round10Runtime:r10rt?pick(mk(r10rt.generateProgram,r10rt.evaluateProgram,r10rt.authority,`ag-r10-s${s}-d${d}`,s,d)):null};
 return res;
});


// ---------------------------------------------------------------- AH. re-establishment reachable after skipped strength (D52-B): sets afterwards
// strength.setsAfterReestablishment: "After an exercise is re-established by effort, its earlier set count comes back one set per executed
// week, never at once." Grid: FIXED and EVERY_2_WEEKS; goals STRENGTH, HYPERTROPHY, GENERAL, RUNNING_SUPPORT; strength missed for 4, 5 or 6
// weeks from week 3, 4 or 5 (runs executed), every week reviewed, everything else executed and logged. For every performed
// re-establishment (an ESTABLISH row with the "Not done for more than" or "No usable load" note), the sets of the next exposure in a later
// week against the re-establishment sets, and the count prescribed at the last exposure before the gap.
guard('AH_setsAfterReestablishment',()=>{
 const rows=[],jumps=[],flavour={creditEarnedByTheReestablishmentWeek:0,creditEarnedBeforeTheGap:0};let reestablishments=0,timelines=0,aboveEarlier=0;
 for(const pref of ['FIXED','EVERY_2_WEEKS'])for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const from of [3,4,5])for(const len of [4,5,6]){
  const tag=`ah-${pref}-${goal}-${from}-${len}`,t=run11({tag,ia:{athlete:{goals:{run:'PERFORMANCE',strength:goal},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:pref}},weeks:16,act:(P,w,z)=>z.sport==='STRENGTH'&&w>=from&&w<from+len?'MISS':'EXEC'});
  if(!t.P)continue;timelines++;
  const byId={};for(let w=0;w<t.P.weeks.length-1;w++)for(const r of strRows(t.P,w))if((t.done[r.id]??[]).includes(r.date))(byId[r.id]??=[]).push({w,...r});
  for(const [id,list] of Object.entries(byId))list.forEach((r,i)=>{
   if(r.mode!=='ESTABLISH'||!/^(Not done for more than|No usable load)/.test(noteOf(r)??''))return;reestablishments++;
   const before=list.filter(x=>x.date<r.date&&x.mode!=='ESTABLISH').at(-1),next=list.slice(i+1).find(x=>x.w>r.w);if(!next)return;
   const row=`${tag} ${id}: before ${before?before.sets+' sets (w'+before.w+')':'none'}; re-established w${r.w} ${r.sets} sets; next w${next.w} ${next.sets}x${next.reps} ${next.mode}${next.value!=null?' '+next.value:''} (${t.P.phases.phases[next.w]}); blocksDone before the gap ${before?t.P.stateTrace[before.w].strength.exercises[id]?.blocksDone??0:0}, at the re-establishment ${t.P.stateTrace[r.w].strength.exercises[id]?.blocksDone??0}, at the next ${t.P.stateTrace[next.w].strength.exercises[id]?.blocksDone??0}; block ends ${t.P.blocks.map(b=>b.endWeekExclusive-1).join('/')}`;
   const bd=w=>t.P.stateTrace[w].strength.exercises[id]?.blocksDone??0;
   rows.push(row);if(next.sets>r.sets+1){jumps.push(row);(flavour[bd(next.w)>bd(r.w)?'creditEarnedByTheReestablishmentWeek':'creditEarnedBeforeTheGap']++);if(before&&next.sets>before.sets+1)aboveEarlier++;}
  });
 }
 return {timelines,performedReestablishments:reestablishments,nextExposures:rows.length,moreThanOneSetAboveTheReestablishment:jumps.length,byBlockCredit:flavour,moreThanOneSetAboveTheLastCountBeforeTheGap:aboveEarlier,jumps:jumps.slice(0,24),sample:rows.slice(0,16)};
});

// ---------------------------------------------------------------- comparison with my round-10 output, section by section
guard('COMPARE_round10Output',()=>{
 const prev=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'ssctr-probe-runtime-d50-d51-r10.out.json'),'utf8')).sections,identical=[],different=[],notRerun=[];
 for(const k of Object.keys(prev)){if(!(k in out.sections)){notRerun.push(k);continue;}(JSON.stringify(prev[k])===JSON.stringify(out.sections[k])?identical:different).push(k);}
 return {identical,different,notRerun};
});

// ================================================================ round 12 (runtime-only D53 fix at the same hash 18ec48f3...)
// The round-12 sections read set counts from the prescribed rows and from the week's planned counts, which travel in the state
// (stateTrace[w].strength.planned[id]: sets, baseSets = the count before the phase reduction, normalSets = the count without a cap; they
// describe the last exposure of the exercise that week). They read the runtime's regainCap field only to describe it, never to judge.
// Executed, for the regain: the review saw the exercise performed with a logged load that week and its gate was ADVANCE or EARNED
// (the gates are the ones each weekly review returned); "without a phase reduction": the planned sets equal the planned base count.
const capturing=(evaluate,G)=>(p,rv,o)=>{const r=evaluate(p,rv,o);if(Number.isInteger(rv.weekIndex)&&rv.event?.kind==='WEEKLY_REVIEW')G[rv.weekIndex]={status:r.status,action:r.action,gates:r.gates??null};return r;};
function run12(o){const G={};const t=run11({...o,evaluate:capturing(o.evaluate??evaluateProgram,G)});return {...t,G};}
const gateFor=(G,w,id)=>{const g=G?.[w]?.gates;if(!g)return G?.[w]?'NO_GATES':'NO_REVIEW';return g[id]??g.STRENGTH??'HOLD';};
const effortKind=r=>{if(r.mode!=='ESTABLISH')return null;const n=noteOf(r)??'';return /^Not done for more than/.test(n)?'NOT_DONE':/^No usable load/.test(n)?'NO_USABLE_LOAD':/^Return entry/.test(n)?'RETURN_ENTRY':'FIRST';};
const weekOfDate=(P,d)=>P.weeks.findIndex((x,i)=>d>=x.startDate&&(i+1>=P.weeks.length||d<P.weeks[i+1].startDate));
const loggedInWeek=(t,id,w)=>(t.logged[id]??[]).some(d=>weekOfDate(t.P,d)===w);
const stateTag=e=>!e?'none':[e.mode,Number.isFinite(e.pendingLoad)?'pending':null,e.unlogged?'unlogged':null,e.source==='RE_ESTABLISHED'?'re-established':null,Number.isInteger(e.returnStep)?'step'+e.returnStep:null,(e.blocksDone??0)>0?'blocks'+e.blocksDone:null].filter(Boolean).join('/');
const isDev=ph=>['BUILD','DEVELOPMENT','NEXT_BLOCK','ESTABLISHMENT'].includes(ph);
const rowsById=P=>{const by={};for(let w=0;w<P.weeks.length;w++)for(const r of strRows(P,w))((by[r.id]??={})[w]??=[]).push(r);return by;};
/**
 * D53 audit of one timeline. For every performed re-establishment ("Not done for more than" row performed that week) the count of each
 * later exposure week, before its phase reduction, must not exceed the re-establishment count plus one per executed week without a phase
 * reduction since then (including the re-establishment week), until it reaches the count the exercise would otherwise have. A trace
 * stops at that count, at a return step (D49 then governs), at the next re-establishment or at the end. "allowed" counts a week whose
 * review returned no gates as executed (lenient); "strictly allowed" does not. Held back: below both the strict allowance and the
 * normal count (not a violation of "at most", reported for the cost side).
 */
function regainAudit(t,label,{reLog=20}={}){
 const {P}=t,out={reestablishments:0,nextJumps:0,firstNext:{setRise:0,prescribedMoreThanOneAbove:0,loadStep:0,repStep:0,setRiseWithLoadOrRepStep:0},traces:[],violations:[],strictViolations:[],heldBack:[],aboveBeforeGap:[],rowCountMismatch:[],stop:{},reachedNormalAfterWeeks:{},stateAtReestablishment:{},capFieldAfterReestablishment:{present:0,absent:0}};
 const byId=rowsById(P),done=id=>t.done[id]??[];
 for(const [id,W] of Object.entries(byId)){
  const ws=Object.keys(W).map(Number).sort((a,b)=>a-b);
  for(const r0 of ws){
   const rows0=W[r0];if(!rows0.some(r=>effortKind(r)==='NOT_DONE'&&done(id).includes(r.date)))continue;
   out.reestablishments++;
   const st0=P.stateTrace[r0].strength.exercises[id],tag0=stateTag(st0);out.stateAtReestablishment[tag0]=(out.stateAtReestablishment[tag0]??0)+1;
   const lastRow=rows0.at(-1),c0=lastRow.sets;
   if(r0+1<P.stateTrace.length)out.capFieldAfterReestablishment[Number.isInteger(P.stateTrace[r0+1].strength.exercises[id]?.regainCap)?'present':'absent']++;
   const before=ws.filter(k=>k<r0).flatMap(k=>W[k].filter(r=>r.mode!=='ESTABLISH'&&done(id).includes(r.date)).map(r=>({w:k,sets:r.sets,base:P.stateTrace[k].strength.planned?.[id]?.baseSets??r.sets}))).at(-1)??null;
   let aL=c0,aS=c0,first=true,stop='END',reached=null;
   const step=k=>{const pl=P.stateTrace[k].strength.planned?.[id],un=!pl||!Number.isInteger(pl.sets)||pl.sets===pl.baseSets,lg=loggedInWeek(t,id,k),g=gateFor(t.G,k,id);if(un&&lg&&['ADVANCE','EARNED'].includes(g)){aL++;aS++;}else if(un&&lg&&['NO_GATES','NO_REVIEW'].includes(g))aL++;return {un,lg,g};};
   const s0=step(r0),traj=[`w${r0} RE ${c0}${effortKind(lastRow)==='NOT_DONE'?'':'(last '+lastRow.mode+')'}${s0.lg?'':' nolog'}${['ADVANCE','EARNED'].includes(s0.g)?'':' '+s0.g}`];
   for(const k of ws.filter(k=>k>r0)){
    const st=P.stateTrace[k].strength.exercises[id],pl=P.stateTrace[k].strength.planned?.[id];
    if(st&&Number.isInteger(st.returnStep)){stop='RETURN';break;}
    if(W[k].some(r=>effortKind(r)==='NOT_DONE')){stop='NEXT_REESTABLISHMENT';break;}
    if(!pl||!Number.isInteger(pl.baseSets)){stop='NO_PLANNED_COUNT';break;}
    const base=pl.baseSets,normal=Number.isInteger(pl.normalSets)?pl.normalSets:null,phase=P.phases.phases[k],last=W[k].at(-1);
    if(last.mode!=='ESTABLISH'&&last.mode!=='BODYWEIGHT'&&!['TAPER','RACE_WEEK','POST_EVENT'].includes(phase)&&last.sets!==phasedIndep(base,phase))out.rowCountMismatch.push(`${label} ${id} w${k} ${phase}: row ${last.sets} sets, planned base ${base}`);
    const desc=`${label} ${id}: re-established w${r0} at ${c0} (state ${tag0}); ${traj.join(' ')} | w${k} ${pl.sets}/${base}/${normal} ${phase}`;
    if(base>aL)out.violations.push(`${desc} above the allowed ${aL}`);else if(base>aS)out.strictViolations.push(`${desc} above the strictly allowed ${aS}`);
    if(normal!==null&&base<Math.min(aS,normal))out.heldBack.push(`${desc} below ${Math.min(aS,normal)}`);
    if(first){const nx=W[k].at(-1),loadStep=reLog!==null&&nx.mode==='KNOWN'&&Number.isFinite(nx.value)&&nx.value>reLog+1e-9,repStep=nx.reps>lastRow.reps;if(base>c0)out.firstNext.setRise++;if(pl.sets>c0+1)out.firstNext.prescribedMoreThanOneAbove++;if(loadStep)out.firstNext.loadStep++;if(repStep)out.firstNext.repStep++;if(base>c0&&(loadStep||repStep))out.firstNext.setRiseWithLoadOrRepStep++;}
    if(first){first=false;if(base>c0+1)out.nextJumps++;if(before&&base>before.base+1)out.aboveBeforeGap.push(`${desc} (before the gap w${before.w}: ${before.sets} sets, base ${before.base})`);}
    const s=step(k);traj.push(`w${k} ${pl.sets}/${base}/${normal}${isDev(phase)?'':' '+phase.slice(0,5)}${s.lg?'':' nolog'}${['ADVANCE','EARNED'].includes(s.g)?'':' '+s.g}`);
    if(normal!==null&&base>=normal){reached=k-r0;stop='REACHED_NORMAL';break;}
   }
   out.stop[stop]=(out.stop[stop]??0)+1;if(reached!==null)out.reachedNormalAfterWeeks[reached]=(out.reachedNormalAfterWeeks[reached]??0)+1;
   out.traces.push(`${label} ${id} [${tag0}]: ${traj.join(' | ')} [${stop}]`);
  }
 }
 return out;
}
/** After a performed first establishment or a "No usable load" re-establishment by effort: the next exposure's count before its phase reduction. */
function effortNext(t,label){
 const {P}=t,out={FIRST:{performed:0,next:0,moreThanOneAbove:0,examples:[]},NO_USABLE_LOAD:{performed:0,next:0,moreThanOneAbove:0,aboveTheCountBeforeByMoreThanOne:0,examples:[]}};
 const byId=rowsById(P),done=id=>t.done[id]??[];
 for(const [id,W] of Object.entries(byId)){
  const ws=Object.keys(W).map(Number).sort((a,b)=>a-b);
  for(const r0 of ws){
   const last=W[r0].at(-1),kind=effortKind(last);if(!['FIRST','NO_USABLE_LOAD'].includes(kind)||W[r0].some(r=>effortKind(r)==='NOT_DONE')||!done(id).includes(last.date))continue;
   const o=out[kind];o.performed++;const k=ws.find(x=>x>r0);if(k===undefined)continue;const pl=P.stateTrace[k].strength.planned?.[id];if(!pl||!Number.isInteger(pl.baseSets))continue;o.next++;
   const bd=w=>P.stateTrace[w]?.strength?.exercises?.[id]?.blocksDone??0,prior=ws.filter(x=>x<r0).flatMap(x=>W[x].filter(r=>r.mode!=='ESTABLISH').map(r=>({w:x,base:P.stateTrace[x].strength.planned?.[id]?.baseSets??r.sets}))).at(-1)??null;
   if(pl.baseSets>last.sets+1){o.moreThanOneAbove++;if(o.examples.length<8)o.examples.push(`${label} ${id}: ${kind} w${r0} ${last.sets} sets (${P.phases.phases[r0]}${loggedInWeek(t,id,r0)?'':', no log'}), next w${k} ${pl.sets}/${pl.baseSets}/${pl.normalSets} (${P.phases.phases[k]}); blocksDone ${bd(r0)} -> ${bd(k)}${prior?'; before: '+prior.base+' (w'+prior.w+')':''}`);if(kind==='NO_USABLE_LOAD'&&prior&&pl.baseSets>prior.base+1)o.aboveTheCountBeforeByMoreThanOne++;}
  }
 }
 return out;
}
const mergeAudit=list=>{const m={timelines:list.length,reestablishments:0,nextExposureMoreThanOneAbove:0,firstNext:{setRise:0,prescribedMoreThanOneAbove:0,loadStep:0,repStep:0,setRiseWithLoadOrRepStep:0},violations:[],strictViolations:[],heldBack:[],aboveBeforeGap:[],rowCountMismatch:[],stop:{},reachedNormalAfterWeeks:{},stateAtReestablishment:{},capFieldAfterReestablishment:{present:0,absent:0},traces:[]};
 for(const a of list){m.reestablishments+=a.reestablishments;m.nextExposureMoreThanOneAbove+=a.nextJumps;for(const x of Object.keys(m.firstNext))m.firstNext[x]+=a.firstNext[x];for(const k of ['violations','strictViolations','heldBack','aboveBeforeGap','rowCountMismatch','traces'])m[k].push(...a[k]);for(const k of ['stop','reachedNormalAfterWeeks','stateAtReestablishment','capFieldAfterReestablishment'])for(const [x,n] of Object.entries(a[k]))m[k][x]=(m[k][x]??0)+n;}
 return m;};
const summarize=(m,keep=16)=>({timelines:m.timelines,reestablishments:m.reestablishments,nextExposureMoreThanOneAbove:m.nextExposureMoreThanOneAbove,firstNextExposure:m.firstNext,violationCount:m.violations.length,strictViolationCount:m.strictViolations.length,aboveBeforeGapCount:m.aboveBeforeGap.length,heldBackCount:m.heldBack.length,rowCountMismatchCount:m.rowCountMismatch.length,stop:m.stop,reachedNormalAfterWeeks:m.reachedNormalAfterWeeks,stateAtReestablishment:m.stateAtReestablishment,capFieldAfterReestablishment:m.capFieldAfterReestablishment,violations:m.violations.slice(0,keep),strictViolations:m.strictViolations.slice(0,keep),aboveBeforeGap:m.aboveBeforeGap.slice(0,keep),heldBack:m.heldBack.slice(0,keep),rowCountMismatch:m.rowCountMismatch.slice(0,keep),traces:m.traces.slice(0,keep)});
const mergeEffort=list=>{const m={FIRST:{performed:0,next:0,moreThanOneAbove:0,examples:[]},NO_USABLE_LOAD:{performed:0,next:0,moreThanOneAbove:0,aboveTheCountBeforeByMoreThanOne:0,examples:[]}};for(const a of list)for(const k of Object.keys(m))for(const [x,v] of Object.entries(a[k])){if(x==='examples'){if(m[k].examples.length<12)m[k].examples.push(...v.slice(0,12-m[k].examples.length));}else m[k][x]+=v;}return m;};

// ---------------------------------------------------------------- AHb. probe AH on the reviewed round-11 runtime (does AH still detect D53 there?)
// The AH loop, as a function of the runtime (same grid, tags and logic as section AH); run on the current runtime as a self-check.
function ahSuite(gen,evaluate,auth){
 const rows=[],jumps=[],flavour={creditEarnedByTheReestablishmentWeek:0,creditEarnedBeforeTheGap:0};let reestablishments=0,timelines=0,aboveEarlier=0;
 for(const pref of ['FIXED','EVERY_2_WEEKS'])for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const from of [3,4,5])for(const len of [4,5,6]){
  const tag=`ah-${pref}-${goal}-${from}-${len}`,t=run11({tag,ia:{athlete:{goals:{run:'PERFORMANCE',strength:goal},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:pref}},weeks:16,act:(P,w,z)=>z.sport==='STRENGTH'&&w>=from&&w<from+len?'MISS':'EXEC',gen,evaluate,auth});
  if(!t.P)continue;timelines++;
  const byId={};for(let w=0;w<t.P.weeks.length-1;w++)for(const r of strRows(t.P,w))if((t.done[r.id]??[]).includes(r.date))(byId[r.id]??=[]).push({w,...r});
  for(const [id,list] of Object.entries(byId))list.forEach((r,i)=>{
   if(r.mode!=='ESTABLISH'||!/^(Not done for more than|No usable load)/.test(noteOf(r)??''))return;reestablishments++;
   const before=list.filter(x=>x.date<r.date&&x.mode!=='ESTABLISH').at(-1),next=list.slice(i+1).find(x=>x.w>r.w);if(!next)return;
   const row=`${tag} ${id}: before ${before?before.sets+' sets (w'+before.w+')':'none'}; re-established w${r.w} ${r.sets} sets; next w${next.w} ${next.sets}x${next.reps} ${next.mode}${next.value!=null?' '+next.value:''} (${t.P.phases.phases[next.w]}); blocksDone before the gap ${before?t.P.stateTrace[before.w].strength.exercises[id]?.blocksDone??0:0}, at the re-establishment ${t.P.stateTrace[r.w].strength.exercises[id]?.blocksDone??0}, at the next ${t.P.stateTrace[next.w].strength.exercises[id]?.blocksDone??0}; block ends ${t.P.blocks.map(b=>b.endWeekExclusive-1).join('/')}`;
   const bd=w=>t.P.stateTrace[w].strength.exercises[id]?.blocksDone??0;
   rows.push(row);if(next.sets>r.sets+1){jumps.push(row);(flavour[bd(next.w)>bd(r.w)?'creditEarnedByTheReestablishmentWeek':'creditEarnedBeforeTheGap']++);if(before&&next.sets>before.sets+1)aboveEarlier++;}
  });
 }
 return {timelines,performedReestablishments:reestablishments,nextExposures:rows.length,moreThanOneSetAboveTheReestablishment:jumps.length,byBlockCredit:flavour,moreThanOneSetAboveTheLastCountBeforeTheGap:aboveEarlier,jumps:jumps.slice(0,24),sample:rows.slice(0,16)};
}
guard('AHb_round11Runtime',()=>{
 const cur=ahSuite(generateProgram,evaluateProgram,opts.authority);
 return {selfCheckEqualsSectionAH:JSON.stringify(cur)===JSON.stringify(out.sections.AH_setsAfterReestablishment),
  round11Runtime:r11rt?{runtime:'reviewed round-11 r6-program.mjs ('+r11rt.shas['r6-program.mjs'].slice(0,8)+') with every other source byte-identical to the current runtime',...ahSuite(r11rt.generateProgram,r11rt.evaluateProgram,r11rt.authority)}:{error:r11rtError}};
});

// ---------------------------------------------------------------- AI. the whole set-count trajectory after every performed re-establishment
// Grid: FIXED, EVERY_2_WEEKS, EVERY_6_WEEKS and COACH_DECIDES; STRENGTH, HYPERTROPHY, GENERAL and RUNNING_SUPPORT; a known squat and
// bench (INTERMEDIATE) or no known exercise (INTERMEDIATE); strength on Monday/Friday or Monday/Wednesday/Friday; strength missed for 4
// or 5 weeks from week 2, 4 or 6 (runs executed); every week reviewed; 16 weeks. Logs as prescribed (establishment rows at 20 kg).
// Also a noisy-log variant on half the grid: every load of an exercise without a known dose alternates 20 and 40 kg between its
// exposures, so its establishment log stays pending (D45). Each timeline is audited (regainAudit, effortNext).
const AI_GRID=[];
for(const pref of ['FIXED','EVERY_2_WEEKS','EVERY_6_WEEKS','COACH_DECIDES'])for(const goal of ['STRENGTH','HYPERTROPHY','GENERAL','RUNNING_SUPPORT'])for(const [kl,known] of [['known',[SQUAT,BENCH]],['none',[]]])for(const days of [[0,4],[0,2,4]])for(const from of [2,4,6])for(const len of [4,5])AI_GRID.push({pref,goal,kl,known,days,from,len});
const aiIntake=x=>({athlete:{goals:{run:'PERFORMANCE',strength:x.goal},strengthExperience:'INTERMEDIATE',knownExercises:x.known,exerciseRotationPreference:x.pref,recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:x.days.length}},schedule:x.days.length===3?{strengthDays:x.days,runDays:[1,3,6],longRunDay:6}:{strengthDays:x.days,runDays:[1,3,6],longRunDay:6}});
const noisyLoads=known=>{const n={},knownIds=new Set(known.map(k=>k.id));return (P,w,z)=>{const o={};for(const e of z.prescription?.exercises??[]){if(knownIds.has(e.id)||e.load.mode==='BODYWEIGHT')continue;n[e.id]=(n[e.id]??0)+1;o[e.id]={load:{value:n[e.id]%2?20:40,unit:'KG',convention:e.load.convention}};}return o;};};
const aiRun=(x,{noisy=false,gen=generateProgram,evaluate=evaluateProgram,auth=opts.authority,prefix='ai'}={})=>{const tag=`${prefix}-${noisy?'noisy-':''}${x.pref}-${x.goal}-${x.kl}-${x.days.join('')}-${x.from}-${x.len}`;return {tag,t:run12({tag,ia:aiIntake(x),weeks:16,act:(P,w,z)=>z.sport==='STRENGTH'&&w>=x.from&&w<x.from+x.len?'MISS':'EXEC',loads:noisy?noisyLoads(x.known):null,gen,evaluate,auth})};};
guard('AI_regainTrajectory',()=>{
 const audits=[],efforts=[],noisyAudits=[],noisyEfforts=[],noProgram=[],statuses=new Set();
 for(const x of AI_GRID){const {tag,t}=aiRun(x);if(!t.P){noProgram.push(tag);continue;}t.log.forEach(l=>statuses.add(l.split(':')[1]));audits.push(regainAudit(t,tag));efforts.push(effortNext(t,tag));}
 for(const x of AI_GRID.filter(x=>x.len===5)){const {tag,t}=aiRun(x,{noisy:true});if(!t.P){noProgram.push(tag);continue;}t.log.forEach(l=>statuses.add(l.split(':')[1]));noisyAudits.push(regainAudit(t,tag,{reLog:null}));noisyEfforts.push(effortNext(t,tag));}
 return {grid:AI_GRID.length,noisyGrid:AI_GRID.filter(x=>x.len===5).length,noProgram,reviewStatuses:[...statuses].sort(),asPrescribed:{...summarize(mergeAudit(audits)),afterOtherEffortRows:mergeEffort(efforts)},noisyLogs:{...summarize(mergeAudit(noisyAudits)),afterOtherEffortRows:mergeEffort(noisyEfforts)}};
});

// ---------------------------------------------------------------- AJ. a re-establishment of a from-log state (pending, unlogged, re-established without a log)
// Scripted, FIXED, Monday/Friday strength, 16 weeks, every week reviewed; run on the current and the reviewed round-11 runtime. With no
// known exercise the first development block ends with the consolidation week 4 (then 8 and 12). (1) pending through a block end:
// establishment loads alternate 20/40 kg in weeks 0-4, strength missed in weeks 5-9, then 20 kg as prescribed; (2) as (1) with the
// re-establishment logged at the pending load, so it is adopted; (3) pending once: week 0 performed, strength missed in weeks 1-5;
// (4) unlogged through the gap: as (1) with week 5 reported completed without details and strength missed in weeks 6-10; (5) a known
// squat and bench: a re-establishment reported without details in week 7, then strength missed in weeks 8-12 and logged from week 13;
// (6) a known squat and bench with noisy logs for the other exercises (weeks 0-1), strength missed in weeks 2-6: the re-establishment in
// the block-end week 7.
guard('AJ_fromLogReestablishment',()=>{
 const scripts={
  pendingThroughBlockEnd:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[],exerciseRotationPreference:'FIXED'}},act:(P,w,z)=>z.sport==='STRENGTH'&&w>=5&&w<=9?'MISS':'EXEC',loads:(()=>{const nl=noisyLoads([]);return (P,w,z)=>w<=4?nl(P,w,z):{};})()},
  pendingThroughBlockEndAdopted:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[],exerciseRotationPreference:'FIXED'}},act:(P,w,z)=>z.sport==='STRENGTH'&&w>=5&&w<=9?'MISS':'EXEC',loads:(()=>{const nl=noisyLoads([]);return (P,w,z)=>w<=4?nl(P,w,z):w===10?Object.fromEntries((z.prescription?.exercises??[]).filter(e=>e.load.mode!=='BODYWEIGHT'&&Number.isFinite(P.stateTrace[w].strength.exercises[e.id]?.pendingLoad)).map(e=>[e.id,{load:{value:P.stateTrace[w].strength.exercises[e.id].pendingLoad,unit:'KG',convention:e.load.convention}}])):{};})()},
  pendingOnce:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[],exerciseRotationPreference:'FIXED'}},act:(P,w,z)=>z.sport==='STRENGTH'&&w>=1&&w<=5?'MISS':'EXEC'},
  unloggedThroughGap:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'HYPERTROPHY'},knownExercises:[],exerciseRotationPreference:'FIXED'}},act:(P,w,z)=>z.sport!=='STRENGTH'?'EXEC':w===5?'NODETAIL':w>=6&&w<=10?'MISS':'EXEC',loads:(()=>{const nl=noisyLoads([]);return (P,w,z)=>w<=4?nl(P,w,z):{};})()},
  reestablishedWithoutLogThenSecondGap:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}},act:(P,w,z)=>z.sport!=='STRENGTH'?'EXEC':w>=2&&w<=6?'MISS':w===7?'NODETAIL':w>=8&&w<=12?'MISS':'EXEC'},
  knownAthleteNoisyAccessories:{ia:{athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}},act:(P,w,z)=>z.sport==='STRENGTH'&&w>=2&&w<=6?'MISS':'EXEC',loads:(()=>{const nl=noisyLoads([SQUAT,BENCH]);return (P,w,z)=>w<=1?nl(P,w,z):{};})()}
 };
 const res={};
 const one=(name,s,gen,evaluate,auth,prefix)=>{const t=run12({tag:`${prefix}-${name}`,ia:s.ia,weeks:16,act:s.act,loads:s.loads??null,gen,evaluate,auth});if(!t.P)return {status:'NO_PROGRAM'};const a=regainAudit(t,name),e=effortNext(t,name);
  const ids=[...new Set(a.traces.map(x=>x.split(' ')[1]))];
  return {log:t.log.join(' '),audit:summarize(mergeAudit([a]),12),afterOtherEffortRows:e,rows:Object.fromEntries(ids.slice(0,3).map(id=>[id,Array.from({length:t.P.weeks.length},(_,k)=>k).map(k=>{const r=strRows(t.P,k).filter(r=>r.id===id);if(!r.length)return null;const st=t.P.stateTrace[k].strength.exercises[id];return `w${k} ${t.P.phases.phases[k].slice(0,5)} ${r.map(doseOf).join(' + ')}${noteOf(r.at(-1))?' | '+noteOf(r.at(-1)).slice(0,24):''} [${stateTag(st)}${Number.isInteger(st?.regainCap)?' cap '+st.regainCap:''}]`;}).filter(Boolean)]))};};
 for(const [name,s] of Object.entries(scripts))res[name]={current:one(name,s,generateProgram,evaluateProgram,opts.authority,'aj'),round11Runtime:r11rt?one(name,s,r11rt.generateProgram,r11rt.evaluateProgram,r11rt.authority,'aj-r11').audit:{error:r11rtError}};
 return res;
});

// ---------------------------------------------------------------- AK. re-establishments in reduced phases (pre-existing row, reachable since D52 (B))
// Race programs (10K and half marathon, 16 weeks, race in week 13; a known squat, RDL and bench; Monday/Thursday strength; goals
// STRENGTH, RUNNING_SUPPORT and GENERAL), and the same athletes without an event (CONSOLIDATION only). For each phase X among
// CONSOLIDATION, SPECIFIC, TAPER, RACE_WEEK and POST_EVENT, strength is missed in the five weeks before the first week of
// X, so its first exposure there follows a gap of more than 28 days. Each "Not done for more than" row is compared with the same
// exercise on the same date in the twin timeline executed throughout (the phase dose), and the regain afterwards is audited.
guard('AK_reducedPhaseReestablishment',()=>{
 const res={},over=[];
 for(const kind of ['10K','HALF_MARATHON',null])for(const goal of ['STRENGTH','RUNNING_SUPPORT','GENERAL']){
  const ia={athlete:{goals:{run:kind?{kind:'RACE',event:{kind,date:addDays('2026-11-02',13*7+6)}}:'PERFORMANCE',strength:goal},knownExercises:[SQUAT,RDL,BENCH],exerciseRotationPreference:'FIXED',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runDays:[1,3,6],strengthDays:[0,3],longRunDay:6,runMinutes:60,longRunMinutes:100,strengthMinutes:60}};
  const label=`ak-${kind??'noEvent'}-${goal}`,twin=run12({tag:label+'-twin',ia,weeks:16});if(!twin.P){res[label]={status:'NO_PROGRAM'};continue;}
  const ph=twin.P.phases.phases,firstOf=X=>ph.findIndex((p,i)=>p===X&&i>=6);res[label]={phases:ph.join(','),cases:{}};
  for(const X of kind?['CONSOLIDATION','SPECIFIC','TAPER','RACE_WEEK','POST_EVENT']:['CONSOLIDATION']){
   const wX=firstOf(X);if(wX<0){res[label].cases[X]={status:'PHASE_NOT_IN_PLAN'};continue;}
   const t=run12({tag:`${label}-${X}`,ia,weeks:16,act:(P,w,z)=>z.sport==='STRENGTH'&&w>=wX-5&&w<wX?'MISS':'EXEC'});if(!t.P){res[label].cases[X]={status:'NO_PROGRAM'};continue;}
   const rows=[];for(let k=wX;k<Math.min(t.P.weeks.length,wX+2);k++)for(const r of strRows(t.P,k).filter(r=>effortKind(r)==='NOT_DONE')){const tw=strRows(twin.P,k).find(x=>x.id===r.id&&x.date===r.date)??null;const line=`w${k} ${r.date} ${t.P.phases.phases[k]} ${r.id} (${r.role}): ${doseOf(r)} vs phase dose ${tw?doseOf(tw):'none on that date'}`;rows.push(line);if(tw&&(r.sets>tw.sets||r.rir<tw.rir))over.push(`${label} ${line}`);}
   const a=regainAudit(t,`${label}-${X}`);
   res[label].cases[X]={firstWeek:wX,log:t.log.slice(wX-1,wX+2).join(' '),reestablishmentRows:rows,regain:{violations:a.violations,strictViolations:a.strictViolations,traces:a.traces.slice(0,4)}};
  }
 }
 return {aboveThePhaseDose:over,detail:res};
});

// ---------------------------------------------------------------- AL. the regain cap's life
// (1) a declared 14-day return two weeks after a re-establishment (FIXED, known squat and bench, STRENGTH): the cap is cleared and the
// D49 return steps govern; (2) a second gap while the cap still holds; (3) a re-establishment week held by a missed later session
// (Monday/Wednesday/Friday, the Wednesday session missed in the re-establishment week); (4) an equipment window (weeks 4-9 without a
// barbell) that ends with the back squat re-established. Runtime field regainCap is shown for description only.
guard('AL_capLife',()=>{
 const ia={athlete:{goals:{run:'PERFORMANCE',strength:'STRENGTH'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}};
 const capView=(t,id,from,to)=>Array.from({length:to-from+1},(_,i)=>from+i).filter(k=>k<t.P.weeks.length).map(k=>{const r=strRows(t.P,k).filter(r=>r.id===id),st=t.P.stateTrace[k].strength.exercises[id],pl=t.P.stateTrace[k].strength.planned?.[id];return `w${k} ${t.P.phases.phases[k].slice(0,5)} ${r.length?r.map(doseOf).join(' + '):'-'}${pl?` (${pl.sets}/${pl.baseSets}/${pl.normalSets})`:''} [${stateTag(st)}${Number.isInteger(st?.regainCap)?' cap '+st.regainCap:''}${Number.isInteger(st?.setCap)?' setCap '+st.setCap:''}${Number.isInteger(st?.setCeiling)?' ceiling '+st.setCeiling:''}]`;});
 const res={};
 // (1) return after a re-establishment
 {const tag='al-return',t=run12({tag,ia,weeks:16,act:(P,w,z)=>w>=9&&w<=10||w===11&&z.day===0?'MISS':z.sport==='STRENGTH'&&w>=2&&w<=6?'MISS':'EXEC',
   pre:{11:(p,ledger,o)=>evaluateProgram(p,rv11(p,11,0,{tag,kind:'RETURN_AFTER_PAUSE',interruption:{days:14,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),o)}});
  const after=[];let prev=null;for(let k=12;k<t.P.weeks.length;k++){const pl=t.P.stateTrace[k].strength.planned?.['back-squat'],st=t.P.stateTrace[k].strength.exercises['back-squat'];if(!pl)continue;if(prev&&!Number.isInteger(st?.returnStep)&&pl.baseSets>prev.base+(prev.un&&loggedInWeek(t,'back-squat',prev.k)?1:0))after.push(`w${k}: base ${pl.baseSets} after ${prev.base} (w${prev.k})`);prev={k,base:pl.baseSets,un:pl.sets===pl.baseSets};}
  res.returnAfterReestablishment={log:t.log.join(' '),squat:capView(t,'back-squat',6,15),bench:capView(t,'db-bench-press',6,15),capClearedAtTheReturn:!Number.isInteger(t.P.stateTrace[11]?.strength?.exercises?.['back-squat']?.regainCap),riseAboveOnePerExecutedWeekAfterTheReturn:after,audit:summarize(mergeAudit([regainAudit(t,tag)]),6)};}
 // (2) a second gap while the cap holds
 {const tag='al-second-gap',t=run12({tag,ia,weeks:16,act:(P,w,z)=>z.sport==='STRENGTH'&&(w>=2&&w<=6||w>=9&&w<=13)?'MISS':'EXEC'});
  res.secondGap={log:t.log.join(' '),squat:capView(t,'back-squat',6,15),audit:summarize(mergeAudit([regainAudit(t,tag)]),6)};}
 // (3) a re-establishment week held by a missed later session
 {const ia3={athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
  const tag='al-held',t=run12({tag,ia:ia3,weeks:16,act:(P,w,z)=>z.sport!=='STRENGTH'?'EXEC':w>=2&&w<=6?'MISS':w===7&&z.day===2?'MISS':'EXEC'});
  const a=regainAudit(t,tag),ids=[...new Set(a.traces.map(x=>x.split(' ')[1]))];
  res.heldReestablishmentWeek={log:t.log.join(' '),gatesWeek7:t.G[7]?.gates??null,exercises:Object.fromEntries(ids.slice(0,4).map(id=>[id,capView(t,id,6,12)])),audit:summarize(mergeAudit([a]),6)};}
 // (4) an equipment window that ends with a re-establishment
 {const tag='al-window',t=run12({tag,ia,weeks:16,pre:{3:(p,ledger,o)=>evaluateProgram(p,rv11(p,3,0,{tag,kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[4].startDate,to:addDays(p.weeks[9].startDate,6)},actualLedger:ledger}),o)}});
  res.equipmentWindowEnd={log:t.log.join(' '),squat:capView(t,'back-squat',2,14),audit:summarize(mergeAudit([regainAudit(t,tag)]),6)};}
 return res;
});

// ---------------------------------------------------------------- AM. dossier Q4 split weeks with the regain cap (R19)
// Probe AD's three variants, followed four more weeks, on the current and the reviewed round-11 runtime.
guard('AM_splitWeekWithCap',()=>{
 const ia={athlete:{goals:{run:'REGULAR',strength:'HYPERTROPHY'},strengthExperience:'INTERMEDIATE',knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'},schedule:{strengthDays:[0,2,4],runDays:[1,5],longRunDay:5}};
 const X=out.sections.AD_Q4_perSessionClock?.exercise;if(!X)return {error:'no AD exercise'};
 const res={exercise:X};
 for(const variant of ['allPerformed','firstOnlyLogged','firstOnlyWithoutDetails']){
  const mk=(gen,evaluate,auth,prefix)=>{const sessX=(P,w)=>P.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription?.exercises.some(e=>e.id===X));
   const t=run12({tag:`${prefix}-${variant}`,ia,weeks:12,until:11,gen,evaluate,auth,act:(P,w,z)=>{if(z.sport!=='STRENGTH')return 'EXEC';if(w===1)return z.id===sessX(P,1)[0]?.id?'EXEC':'MISS';if(w>=2&&w<=4)return 'MISS';if(w===5){if(variant==='allPerformed')return 'EXEC';if(z.id===sessX(P,5)[0]?.id)return variant==='firstOnlyWithoutDetails'?'NODETAIL':'EXEC';return 'MISS';}return 'EXEC';}});
   return {gateWeek5:gateFor(t.G,5,X),weeks:Array.from({length:6},(_,i)=>5+i).map(k=>{const r=strRows(t.P,k).filter(r=>r.id===X),pl=t.P.stateTrace[k].strength.planned?.[X],st=t.P.stateTrace[k].strength.exercises[X];return `w${k} ${t.P.phases.phases[k].slice(0,5)} ${r.map(doseOf).join(' + ')}${pl?` (${pl.sets}/${pl.baseSets}/${pl.normalSets})`:''} [${stateTag(st)}${Number.isInteger(st?.regainCap)?' cap '+st.regainCap:''}]`;})};};
  res[variant]={current:mk(generateProgram,evaluateProgram,opts.authority,'am'),round11Runtime:r11rt?mk(r11rt.generateProgram,r11rt.evaluateProgram,r11rt.authority,'am-r11'):{error:r11rtError}};
 }
 return res;
});

// ---------------------------------------------------------------- AN. load and repetitions right after a re-establishment
// FIXED, known squat and bench, strength missed in weeks 2-6, every week reviewed: the re-establishment in week 7 logged (a) at 20 kg,
// (b) at the ceiling (the load before the gap), (c) at the ceiling with the HYPERTROPHY goal; the squat's rows in weeks 7-11 and the
// ceiling it was re-established under. Counters over grid AI are in AI (firstNextExposure: a set rise, a load step above the 20 kg
// re-establishment log, a repetition step, and a set rise together with a load or repetition step).
guard('AN_loadAfterReestablishment',()=>{
 const res={};
 for(const [k,goal,atCeiling] of [['at20','STRENGTH',false],['atCeiling','STRENGTH',true],['atCeilingHypertrophy','HYPERTROPHY',true]]){
  const ia={athlete:{goals:{run:'PERFORMANCE',strength:goal},knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED'}};
  const t=run12({tag:'an-'+k,ia,weeks:16,until:12,act:(P,w,z)=>z.sport==='STRENGTH'&&w>=2&&w<=6?'MISS':'EXEC',loads:(P,w,z)=>{if(!atCeiling||w!==7)return {};const o={};for(const e of z.prescription?.exercises??[]){const st=P.stateTrace[w].strength.exercises[e.id];if(e.load.mode==='ESTABLISH'&&Number.isFinite(st?.load))o[e.id]={load:{value:st.load,unit:'KG',convention:e.load.convention}};}return o;}});
  const ceiling=t.P.stateTrace[7].strength.exercises['back-squat']?.load??null;
  res[k]={ceiling,lastBeforeGap:strRows(t.P,1).filter(r=>r.id==='back-squat').map(doseOf),weeks:[7,8,9,10,11].map(w=>{const st=t.P.stateTrace[w].strength.exercises['back-squat'],pl=t.P.stateTrace[w].strength.planned?.['back-squat'];return `w${w} ${t.P.phases.phases[w].slice(0,5)} ${strRows(t.P,w).filter(r=>r.id==='back-squat').map(doseOf).join(' + ')}${pl?` (${pl.sets}/${pl.baseSets}/${pl.normalSets})`:''} [${stateTag(st)}${Number.isInteger(st?.regainCap)?' cap '+st.regainCap:''}${Number.isFinite(st?.load)?' load '+st.load:''}]`;}),aboveTheCeilingWithinTwoWeeks:[8,9].some(w=>strRows(t.P,w).some(r=>r.id==='back-squat'&&r.mode==='KNOWN'&&r.value>ceiling+1e-9))};
 }
 return res;
});

// ---------------------------------------------------------------- comparison with my round-11 output, section by section
guard('COMPARE_round11Output',()=>{
 const prev=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'ssctr-probe-runtime-d52-r11.out.json'),'utf8')).sections,identical=[],different=[],notRerun=[];
 for(const k of Object.keys(prev)){if(!(k in out.sections)){notRerun.push(k);continue;}(JSON.stringify(prev[k])===JSON.stringify(out.sections[k])?identical:different).push(k);}
 return {identical,different,notRerun,newInRound12:Object.keys(out.sections).filter(k=>!(k in prev))};
});

fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-runtime-d53-r12.out.json'),JSON.stringify(out,null,1)+'\n');
const S=out.sections,cnt=x=>x?.error?x.error.slice(0,300):x;
console.log(JSON.stringify({
 compare11:S.COMPARE_round11Output,
 compare10:S.COMPARE_round10Output,
 Z:S.Z_D52?.error??{violations:S.Z_D52.violations},
 Y2:S.Y2_D51?.error??{returns:S.Y2_D51.returns,violations:S.Y2_D51.violations.length,clockAudit:{states:S.Y2_D51.clockAudit.states,mismatch:S.Y2_D51.clockAudit.mismatch.length}},
 AH:S.AH_setsAfterReestablishment?.error??{reestablishments:S.AH_setsAfterReestablishment.performedReestablishments,next:S.AH_setsAfterReestablishment.nextExposures,jumps:S.AH_setsAfterReestablishment.moreThanOneSetAboveTheReestablishment,aboveEarlier:S.AH_setsAfterReestablishment.moreThanOneSetAboveTheLastCountBeforeTheGap},
 AHb:S.AHb_round11Runtime?.error??{selfCheck:S.AHb_round11Runtime.selfCheckEqualsSectionAH,r11:S.AHb_round11Runtime.round11Runtime?.error??{reestablishments:S.AHb_round11Runtime.round11Runtime.performedReestablishments,jumps:S.AHb_round11Runtime.round11Runtime.moreThanOneSetAboveTheReestablishment}},
 AI:S.AI_regainTrajectory?.error??{asPrescribed:(({violations,strictViolations,aboveBeforeGap,heldBack,rowCountMismatch,traces,afterOtherEffortRows,...r})=>r)(S.AI_regainTrajectory.asPrescribed),noisy:(({violations,strictViolations,aboveBeforeGap,heldBack,rowCountMismatch,traces,afterOtherEffortRows,...r})=>r)(S.AI_regainTrajectory.noisyLogs),firstEff:S.AI_regainTrajectory.asPrescribed.afterOtherEffortRows,noisyEff:S.AI_regainTrajectory.noisyLogs.afterOtherEffortRows},
 AJ:S.AJ_fromLogReestablishment?.error??Object.fromEntries(Object.entries(S.AJ_fromLogReestablishment).map(([k,v])=>[k,{cur:v.current?.audit?{re:v.current.audit.reestablishments,viol:v.current.audit.violationCount,strict:v.current.audit.strictViolationCount,next:v.current.audit.nextExposureMoreThanOneAbove,state:v.current.audit.stateAtReestablishment}:v.current,r11:v.round11Runtime?.violationCount}])),
 AK:S.AK_reducedPhaseReestablishment?.error??{aboveThePhaseDose:S.AK_reducedPhaseReestablishment.aboveThePhaseDose.length},
 AL:S.AL_capLife?.error??'ok',AM:S.AM_splitWeekWithCap?.error??'ok',AN:S.AN_loadAfterReestablishment?.error??Object.fromEntries(Object.entries(S.AN_loadAfterReestablishment).map(([k,v])=>[k,v.aboveTheCeilingWithinTwoWeeks])),
 errors:Object.entries(S).filter(([,v])=>v?.error).map(([k,v])=>k+': '+v.error.slice(0,400))
},null,1));
if(r10rt)try{fs.rmSync(r10rt.tmp,{recursive:true,force:true});}catch{}
if(r11rt)try{fs.rmSync(r11rt.tmp,{recursive:true,force:true});}catch{}
