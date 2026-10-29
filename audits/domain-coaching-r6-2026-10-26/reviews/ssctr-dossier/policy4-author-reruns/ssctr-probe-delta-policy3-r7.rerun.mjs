// Author rerun copy of the SSCTR round-7 probe (unchanged checks; import paths, output name and the expected hash, now R6-POLICY-4 1046ad0e..., adjusted). Author material, not evidence.
// SSCTR R6 round-7 delta probe (R6-POLICY-3, hash e9c87e09...). Reviewer-authored, read-only use of the runtime.
// Uses a DEV_TEST_ONLY authority bound to the current policy hash (CoachingCore/r6/fixtures/dev-authority.mjs): at the
// new hash the real authority has no current records until this review is issued. Observations only; not quality evidence.
import fs from 'node:fs';
import path from 'node:path';
import {generateProgram,evaluateProgram} from '../../../../../CoachingCore/src/r6-index.mjs';
import {runMinutesOf} from '../../../../../CoachingCore/src/r6-program.mjs';
import {screenInterruptionReason} from '../../../../../CoachingCore/src/r6-clinical.mjs';
import {simulateProgram} from '../../../../../CoachingCore/src/r6-simulator.mjs';
import {devAuthority} from '../../../../../CoachingCore/r6/fixtures/dev-authority.mjs';
import {hash} from '../../../../../CoachingCore/src/value.mjs';

const opts={authority:devAuthority()},POL=opts.authority.policy,E=POL.operational.event,R=POL.operational.run,L=POL.operational.establishment;
if(opts.authority.policyHash!=='1046ad0ef1291068b309e229852b782e8a8f0eee478c3f8aec59facedd80a554')throw new Error('policy hash changed: '+opts.authority.policyHash);
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
 return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+time,weekIndex:w,event:{id:id??`s7-${kind}-w${w}-d${day}`,kind},eligibility:eligibility??elig(date),...extra};
}
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
/** Execution report; per-exercise overrides {id:{load,reps,rir}} for strength. */
function obs(p,s,{over={},eventId=null}={}){
 const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{};const load=o.load!==undefined?o.load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.unit==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:o.reps??e.reps,load,rir:o.rir??e.rir}))};});
 return {eventId:eventId??`s7-${p.athleteId}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};
}
const sessionsOf=p=>p.weeks.flatMap(w=>w.sessions);
const out={probe:'R6-SSCTR-DELTA-R7',policyHash:opts.authority.policyHash,authorityUsed:'DEV_TEST_ONLY devAuthority() bound to the current policy hash',sections:{}};

// ---------------------------------------------------------------- A. event proximity by days (QRE-R6-03, dossier Q1)
{
 const DAYSETS=[{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6},{runDays:[0,2,4,6],strengthDays:[1,5],longRunDay:6},{runDays:[2,4,5],strengthDays:[3,6],longRunDay:5},{runDays:[0,3,5],strengthDays:[0,3,6],longRunDay:0},{runDays:[1,2,4,6],strengthDays:[1,4,6],longRunDay:4}];
 const v={},stats={programs:0,statuses:{},touches:0,windowStrengthSessions:0,progressive:{windowBelowTaper:0,taperNotAbovePreTaper:0,checked:0}},ex={};
 const flag=(k,x)=>{(v[k]??=0);v[k]++;(ex[k]??=[]);if(ex[k].length<4)ex[k].push(x);};
 for(const kind of ['10K','HALF_MARATHON'])for(const raceWeek of [3,5,7,10])for(let raceDay=0;raceDay<7;raceDay++)for(const [di,days] of DAYSETS.entries())for(const strength of ['STRENGTH','RUNNING_SUPPORT','MAINTAIN']){
  const id=`s7-rp-${kind}-${raceWeek}-${raceDay}-${di}-${strength}`;
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
 }
 out.sections.A_eventProximity={stats,violations:v,examples:ex};
}

// ---------------------------------------------------------------- B. walk/jog familiar start (QRE-R6-09, dossier Q2) and C. walk/jog event weeks (QRE-R6-19, Q13)
{
 const rows=[],viol={},ex={};const flag=(k,x)=>{(viol[k]??=0);viol[k]++;(ex[k]??=[]);if(ex[k].length<5)ex[k].push(x);};
 for(const exp of ['NOVICE','INTERMEDIATE','EXPERIENCED'])for(const W of [null,0,5,10,14,20,30])for(const Lg of [null,3,5,10,14,20])for(const runDays of [[3],[1,4],[1,3,5],[0,2,4,6]]){
  if(W!==null&&Lg!==null&&Lg>W&&W>0)continue;
  const id=`s7-wj-${exp}-${W}-${Lg}-${runDays.length}`;
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
  }
  if(cls!=='WALK_JOG'&&Number.isFinite(Lg)&&runs.some(m=>m>Lg))flag('week0RunAboveLongest',r);
 }
 out.sections.B_walkJogStart={summary:{programs:rows.filter(r=>r.cls).length,byClass:rows.reduce((m,r)=>{m[r.cls??r.status]=(m[r.cls??r.status]??0)+1;return m;},{}),nonNoviceRaisedStarts:rows.filter(r=>r.cls==='WALK_JOG'&&r.walkStep>0).length},violations:viol,examples:ex,sample:rows.filter(r=>r.cls==='WALK_JOG'&&r.walkStep>0).slice(0,12)};
 // C. walk/jog-prepared athletes with an event: event weeks and race day
 const cases=[
  {name:'QRE-R6-19 judge case',in:intake({id:'s7-walkonly',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-13'}},strength:'STRENGTH'},runExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:10,longestRunMinutes:5},knownExercises:[]},schedule:{runDays:[5],strengthDays:[4,5],runMinutes:30,strengthMinutes:45,longRunMinutes:30,longRunDay:5}})},
  {name:'novice 10K in 8 weeks, 3 run days',in:intake({id:'s7-wj-10k-8',weeks:8,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',7*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
  {name:'restart after a 6-week nonclinical pause, 10K in 6 weeks',in:intake({id:'s7-rs-10k',weeks:8,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',5*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:null},pause:{nonclinical:true,weeks:6,reasonCategory:'TRAVEL',reason:'Work travel'},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})},
  {name:'non-novice below minimum, HM in 12 weeks',in:intake({id:'s7-wj-hm-12',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'HALF_MARATHON',date:addDays('2026-11-02',11*7+6)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:12,longestRunMinutes:8},knownExercises:[]},schedule:{runDays:[1,3,6],longRunDay:6}})}
 ];
 out.sections.C_walkJogEvent=cases.map(({name,in:i})=>{
  const g=generateProgram(i,opts);if(!g.program)return {name,status:g.status,missing:g.missingInputs,errors:g.errors};
  const P=g.program,race=sessionsOf(P).find(s=>s.role==='RACE');
  return {name,status:g.status,class:P.capability.run.class,raceWeek:P.phases.raceWeek,phases:P.phases.phases,negotiation:g.negotiation.filter(n=>/EVENT|RUN_DAYS/.test(n.id)).map(n=>({id:n.id,blocking:n.blocking,detail:n.detail})),
   modeByWeek:P.stateTrace.map(s=>s.run.mode+(s.run.mode==='WALK_JOG'?':'+s.run.walkStep:'')),
   runsByWeek:P.weeks.map(w=>({w:w.index,phase:w.phase,runs:w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>`${s.date}:${s.role}:${s.prescription.family}:${s.prescription.durationMinutes}${s.prescription.work?`(${s.prescription.work.repetitions}x${s.prescription.work.workSeconds??s.prescription.work.workMinutes})`:''}${s.prescription.strides?'+strides':''}`)})),
   race:race?{date:race.date,duration:race.prescription.durationMinutes,effortDomain:race.prescription.effortDomain,instructions:race.prescription.instructions}:null};
 });
}

// ---------------------------------------------------------------- D. logged-load adoption (QRE-R6-01/02, dossier Q5) and E. sets after re-establishment
{
 const res={};
 const p=generateProgram(intake({id:'s7-load',weeks:8}),opts).program;
 const squat=(prog,w)=>sessionsOf(prog).filter(s=>s.weekIndex===w&&s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>({session:s.id,sets:e.sets,reps:e.reps,rir:e.rir,load:e.load})));
 const planned=squat(p,0)[0];res.planned=planned;
 const run=(name,over)=>{const r=evaluateProgram(p,review(p,0,{observations:p.weeks[0].sessions.filter(s=>s.prescription).map(s=>obs(p,s,{over}))}),opts);res[name]={status:r.status,action:r.action,gate:r.gates?.['back-squat']??null,week1:squat(r.proposal??p,1).map(x=>x.load.value),week2:squat(r.proposal??p,2).map(x=>x.load.value),loadQuestions:(r.loadQuestions??[]).filter(q=>q.exerciseId==='back-squat').map(q=>q.reason)};};
 const kg=v=>({value:v,unit:'KG',convention:'TOTAL'});
 run('asPlanned_80',{});
 run('oneIncrementUp_82.5_rirOnTarget',{'back-squat':{load:kg(82.5)}});
 run('oneIncrementUp_82.5_rir0_repsMet',{'back-squat':{load:kg(82.5),rir:0}});
 run('oneIncrementUp_82.5_repsMissed',{'back-squat':{load:kg(82.5),reps:3,rir:0}});
 run('twoIncrementsUp_85',{'back-squat':{load:kg(85)}});
 run('typoLow_8',{'back-squat':{load:kg(8)}});
 run('lb_181_is_82',{'back-squat':{load:{value:181,unit:'LB',convention:'TOTAL'}}});
 // establishment row: familiar-unknown-load athlete logs an implausible first established load
 const q=generateProgram(intake({id:'s7-est',weeks:8,athlete:{knownExercises:[]}}),opts).program;
 const estRow=sessionsOf(q).filter(s=>s.weekIndex===0&&s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.load.mode==='ESTABLISH').map(e=>({session:s.id,id:e.id,load:e.load,sets:e.sets,reps:e.reps,rir:e.rir})))[0]??null;
 const exRows=(prog,w,id)=>sessionsOf(prog).filter(s=>s.weekIndex===w&&s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.id===id).map(e=>e.load));
 const runEst=(name,v)=>{if(!estRow){res[name]={note:'no ESTABLISH row in week 0'};return;}const r=evaluateProgram(q,review(q,0,{observations:q.weeks[0].sessions.filter(s=>s.prescription).map(s=>obs(q,s,{over:{[estRow.id]:{load:{value:v,unit:'KG',convention:estRow.load.convention}}}}))}),opts);res[name]={status:r.status,action:r.action,week0Row:estRow,week1:exRows(r.proposal??q,1,estRow.id),week2:exRows(r.proposal??q,2,estRow.id),loadQuestions:(r.loadQuestions??[]).filter(x=>x.exerciseId===estRow.id).map(x=>x.reason)};};
 runEst('establish_log_16_per_hand',16);runEst('establish_log_160_per_hand_typo',160);
 out.sections.D_loggedLoad=res;
}

// ---------------------------------------------------------------- G. conflicts: one wearable activity on two sessions (QRE-R6-13/14)
{
 const p=generateProgram(intake({id:'s7-act'}),opts).program,[a,b]=p.weeks[0].sessions.filter(s=>s.sport==='RUN');
 const src={provider:'WEARABLE:X',activityId:'act-SAME',quality:'WEARABLE_FULL'};
 const oa={...obs(p,a,{eventId:'s7-a'}),source:src},ob={...obs(p,b,{eventId:'s7-b'}),observedAt:a.date+'T08:00:00Z',source:src};
 const r=evaluateProgram(p,review(p,0,{observations:[oa,ob]}),opts);
 out.sections.G_conflicts={sessionStatuses:r.weekEvidence.rows.filter(x=>[a.id,b.id].includes(x.sessionId)).map(x=>({id:x.sessionId,status:x.status})),conflicts:r.provenance.conflicts,ledgerRows:r.actualLedger.filter(x=>x.provenance?.activityId==='act-SAME').map(x=>({sessionId:x.sessionId,conflicted:!!x.conflicted}))};
}

// ---------------------------------------------------------------- I. return facts, demonstration, eligibility flag forms (QRE-R6-05/06)
{
 const p=generateProgram(intake({id:'s7-ret',weeks:12}),opts).program,w=4,end=addDays(p.weeks[w].startDate,-1);
 const ret=(i,extra={})=>{const r=evaluateProgram(p,review(p,w,{kind:'RETURN_AFTER_PAUSE',day:0,interruption:i,...extra}),opts);return {status:r.status,class:r.proposal?.decisions.at(-1)?.interruption?.class??null,demo:r.proposal?.decisions.at(-1)?.demonstrationUsed??null,missing:r.missingInputs};};
 const demo=m=>({sport:'RUN',family:'EASY',completed:true,minutes:m,effort:'CONVERSATIONAL',response:'COMPATIBLE',ordinaryFunction:'COMPATIBLE',nextDayFunction:'NORMAL',observedAt:addDays(end,-2)+'T08:00:00Z'});
 out.sections.I_return={
  moderate_demo10:ret({days:14,reasonCategory:'WORK'},{currentDemonstration:demo(10)}),
  moderate_demo25:ret({days:14,reasonCategory:'WORK'},{currentDemonstration:demo(25)}),
  clinicalReason_sim:ret({days:14,reasonCategory:'WORK',clinicalReason:'sim'}),
  clinicalReason_maybe:ret({days:14,reasonCategory:'WORK',clinicalReason:'maybe'}),
  eligibilityPainStringTrue:ret({days:14,reasonCategory:'WORK'},{eligibility:elig(addDays(p.weeks[w].startDate,0),{pain:'true'})}),
  eligibilityPainOne:ret({days:14,reasonCategory:'WORK'},{eligibility:elig(addDays(p.weeks[w].startDate,0),{pain:1})})
 };
}

// ---------------------------------------------------------------- J. clinical screen (QRE-R6-07, dossier Q11)
{
 const T=(reason,expect,cat='WORK')=>({reason,expect,cat});
 // expect: C clinical, N nonclinical, A ask, X not nonclinical
 const B=[
  // round-5/6 battery (must remain)
  T('It was hard to run without pain','X'),T('Without pain, just travel','N'),T('Sem dor, só trabalho','N'),T('Sin dolor, solo trabajo','N'),T('nothing clinical, just a busy month','N'),
  T("Didn't feel any pain",'N'),T('Não senti dor nenhuma','N'),T('No tuve dolor','N'),T('Never had any injury','N'),T("didn't feel well on the trip",'A'),
  T("Didn't feel any pain until I tried to run",'X'),T('No tuve dolor hasta que corrí','X'),T("couldn't run without pain",'C'),T('No pude correr sin dolor en el viaje','C'),
  T('Not sick - injured on holiday','C'),T('Ocupado y enfermo','C'),T('Me caí en el viaje','X'),T('Work travel, will resume Monday','A',null),
  // judge's misses and widened lexicon
  T('heart attack','C'),T('broke my leg','C'),T('chemotherapy','C'),T('quebrei a perna','C'),T('me rompí la pierna','C'),T('fraturei o pulso','C'),T('kidney stones','C'),T('tendon rupture','C'),
  // damage verb + body part in separate clauses / negated / unrelated objects
  T('Broke my phone, busy at work','N'),T('Took a break from work travel','N'),T('Spring break with the kids','N'),T("Didn't break anything, just travel",'N'),
  T('No broken bones, just a work trip','X'),T("Didn't break my leg, just busy",'X'),T('Took a break, my back is fine','X'),
  // plain nonclinical with common words that are also body parts
  T('Back from vacation','X',"VACATION"),T('Back to work after the holidays','X'),T('Family emergency, my heart was elsewhere','X',"FAMILY"),
  // residual probes (owned gap; any NONCLINICAL here is a lexical residual, not a blocking defect)
  T('Had a baby','X','FAMILY'),T('Tive um bebê','X','FAMILY'),T('Tuve un bebé','X','FAMILY'),T('Hit by a car on the way to work','X'),T('Car crash','X','TRAVEL'),
  T('Pulled a hamstring','X'),T('Twisted my ankle on the trip','X'),T('Knee gave out','X'),T('Got COVID on the trip','C','TRAVEL'),T('Long covid','C'),T('Burnout at work','X'),
  T('Bitten by a dog','X'),T('Bike crash on holiday','X','VACATION'),T('Slipped on ice','X','WEATHER'),T('Torn meniscus','C'),T('Lesão no joelho','C'),T('Esguince de tobillo','C')
 ];
 const results=B.map(({reason,expect,cat})=>{const r=screenInterruptionReason({reason,reasonCategory:cat,nonclinical:true});const ok=expect==='C'?r.status==='CLINICAL':expect==='N'?r.status==='NONCLINICAL':expect==='A'?r.status==='ASK':r.status!=='NONCLINICAL';return {reason,category:cat,expect,status:r.status,basis:r.basis,matched:r.matched,ok};});
 out.sections.J_clinicalScreen={results,mismatches:results.filter(x=>!x.ok).map(x=>`${x.reason} [${x.category}] -> ${x.status} (expected ${x.expect})`)};
}

// ---------------------------------------------------------------- K. missing gate (QRE-R6-04): walk/jog and easy runs not executed never advance
{
 const input=intake({id:'s7-gate-wj',weeks:8,athlete:{goals:{run:'REGULAR',strength:'GENERAL'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:2,runMinutesPerWeek:10,longestRunMinutes:6}},schedule:{runDays:[1,4],longRunDay:4}});
 const sim=simulateProgram(input,{default:{missed:[{sport:'RUN'}]}},opts);
 out.sections.K_missingGate={walkStepByWeek:sim.finalProgram.stateTrace.map(s=>s.run.mode+':'+(s.run.walkStep??'-')),executedRuns:sim.actualLedger.filter(o=>o.context?.sport==='RUN').length};
}

// ---------------------------------------------------------------- L. projection analogue of the missing gate: steps counted in weeks with no session of that dimension
{
 const rows=[];
 const cases=[['walk/jog judge case',out.sections.C_walkJogEvent?null:null]];
 const inputs=[
  intake({id:'s7-L-wj',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-13'}},strength:'STRENGTH'},runExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:10,longestRunMinutes:5},knownExercises:[]},schedule:{runDays:[5],strengthDays:[4,5],runMinutes:30,strengthMinutes:45,longRunMinutes:30,longRunDay:5}}),
  intake({id:'s7-L-easy-mon',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',7*7)}},strength:'RUNNING_SUPPORT'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:70,longestRunMinutes:30}},schedule:{runDays:[1,3,6],longRunDay:6}})
 ];
 for(const i of inputs){
  const g=generateProgram(i,opts);if(!g.program){rows.push({id:i.athlete.id,status:g.status});continue;}
  const P=g.program;
  rows.push({id:i.athlete.id,weeks:P.weeks.map((w,k)=>{const roles=[...new Set(w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role))];const st=P.stateTrace[k].run,nx=P.stateTrace[k+1]?.run;return {w:k,phase:w.phase,runRoles:roles,mode:st.mode,walkStep:st.walkStep,easyWeeksDone:st.easyWeeksDone,next:nx?{mode:nx.mode,walkStep:nx.walkStep,easyWeeksDone:nx.easyWeeksDone}:null,stepWithoutSession:!!nx&&((st.mode==='WALK_JOG'&&!roles.includes('WALK_JOG')&&(nx.walkStep>st.walkStep||nx.mode!=='WALK_JOG'))||(st.mode==='EASY'&&nx.mode==='EASY'&&!roles.includes('EASY')&&(nx.easyWeeksDone??0)>(st.easyWeeksDone??0)))};})});
 }
 out.sections.L_projectionMissingGate=rows;
}

fs.writeFileSync(path.join(import.meta.dirname,'ssctr-probe-delta-policy3-r7.rerun-policy4.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({A:{stats:out.sections.A_eventProximity.stats,violations:out.sections.A_eventProximity.violations},B:{summary:out.sections.B_walkJogStart.summary,violations:out.sections.B_walkJogStart.violations},J:out.sections.J_clinicalScreen.mismatches},null,1));
