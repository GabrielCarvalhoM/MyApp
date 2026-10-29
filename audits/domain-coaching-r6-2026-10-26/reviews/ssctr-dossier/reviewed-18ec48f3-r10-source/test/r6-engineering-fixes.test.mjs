import test from 'node:test';
import assert from 'node:assert/strict';
import {generateProgram,evaluateProgram} from '../src/r6-index.mjs';
import {validateWeeks,skeletonOf,runMinutesOf} from '../src/r6-program.mjs';
import {normalizeObservations} from '../src/r6-provenance.mjs';
import {screenInterruptionReason} from '../src/r6-clinical.mjs';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {EDGE_PROFILES} from '../r6/fixtures/profiles.mjs';

/**
 * Regression tests for the independent engineering review of FREEZE-1 (QRE-R6-01…23,
 * audits/domain-coaching-r6-2026-10-26/reviews/quality-engineering-review.json). Each test reproduces the judge's case.
 */
const opts={authority:devAuthority()},policy=opts.authority.policy.operational;
const elig=(d,over={})=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false,...over});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const gap=(a,b)=>(Date.parse(b)-Date.parse(a))/864e5;
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
function intake({id='t-athlete',asOf='2026-11-01',startDate='2026-11-02',weeks=8,athlete={},schedule={},...rest}={}){
 return {version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf,startDate,weeks,learningConsent:true,...rest,
  athlete:{id,ageEligible:true,eligibility:elig(asOf),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],
   knownExercises:[SQUAT,{id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'}],...athlete},
  schedule:{runDays:[1,3,6],strengthDays:[0,4],runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:50,longRunDay:6,longRunMinutes:80,...schedule}};
}
function review(p,w,{kind='WEEKLY_REVIEW',day=6,time='T21:00:00Z',id=null,eligibility=null,...extra}={}){
 const date=addDays(p.weeks[w].startDate,day);
 return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:date+time,weekIndex:w,event:{id:id??`t-${kind}-w${w}-d${day}`,kind},eligibility:eligibility??elig(date),...extra};
}
const RESPONSES={COMPATIBLE:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'},ADVERSE:{performance:'UNDER',recovery:'ADVERSE',effort:'HARDER',nextDayFunction:'IMPAIRED'}};
function obsFor(p,s,{eventId=null,observedAt=null,completed=true,minutes=null,squatLoad=null,response='COMPATIBLE',source=null}={}){
 const pr=s.prescription,actual={completed,minutes:minutes??pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,load:e.id==='back-squat'&&squatLoad?structuredClone(squatLoad):{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.unit==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},rir:e.rir}))}));
 return {eventId:eventId??`t-${p.athleteId}-${s.id}`,athleteId:p.athleteId,sessionId:s.id,observedAt:observedAt??(s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z')),actual,response:structuredClone(RESPONSES[response]),...(source?{source}:{})};
}
const sessionsOf=p=>p.weeks.flatMap(w=>w.sessions);
const week0Obs=(p,o={})=>p.weeks[0].sessions.filter(s=>s.prescription).map(s=>obsFor(p,s,o));
const squatLoads=(p,w)=>p.weeks[w].sessions.filter(s=>s.prescription?.exercises).flatMap(s=>s.prescription.exercises.filter(e=>e.id==='back-squat').map(e=>e.load));
/** Deterministic generator (mulberry32) for property checks over many synthetic athletes. */
const prng=seed=>{let a=seed>>>0;return ()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};};
function athlete(r,i){
 const pick=l=>l[Math.floor(r()*l.length)],days=n=>[...new Set(Array.from({length:7},(_,d)=>d).sort(()=>r()-0.5).slice(0,n))].sort((a,b)=>a-b);
 const runDays=days(1+Math.floor(r()*4)),strengthDays=days(1+Math.floor(r()*3)),weeks=pick([8,12,16]),event=r()<0.5?{kind:pick(['10K','HALF_MARATHON']),date:addDays('2026-11-02',7*(3+Math.floor(r()*(weeks-4)))+Math.floor(r()*7))}:null;
 const weekly=pick([0,10,20,40,60,90,120,180]),longest=weekly?Math.min(weekly,pick([5,10,20,30,45,60,90])):null;
 return intake({id:'g'+i,weeks,athlete:{goals:{run:event?{kind:'RACE',event}:pick(['PERFORMANCE','REGULAR','GENERAL']),strength:pick(['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','MAINTAIN','GENERAL'])},runExperience:pick(['NOVICE','INTERMEDIATE','EXPERIENCED']),recent:{runDaysPerWeek:weekly?Math.min(runDays.length+1,3):0,runMinutesPerWeek:weekly,longestRunMinutes:longest,strengthDaysPerWeek:2},strengthPreferences:{rotation:pick(['COACH_DECIDES','EVERY_2_WEEKS','EVERY_6_WEEKS','FIXED'])},knownExercises:r()<0.5?[SQUAT]:[]},
  schedule:{runDays,strengthDays,longRunDay:runDays.at(-1),runMinutes:pick([30,45,60]),longRunMinutes:pick([60,90,120]),strengthMinutes:pick([30,45,60]),runTurn:'AM',strengthTurn:'PM'}});
}

test('QRE-R6-01: pound loads become kilograms at intake and in logs; a log in an unknown unit is never adopted',()=>{
 const lb=generateProgram(intake({id:'t-lb',athlete:{knownExercises:[{...SQUAT,load:{value:135,unit:'LB',convention:'TOTAL'}}]}}),opts);
 assert.equal(lb.status,'PROPOSED');
 const known=lb.program.canonical.athlete.knownExercises.find(e=>e.id==='back-squat').dose.load;
 assert.deepEqual([known.value,known.unit],[61,'KG']);assert.deepEqual(known.reported,{value:135,unit:'LB'});
 for(const l of squatLoads(lb.program,0))assert.ok(l.unit==='KG'&&l.value<=61,`135 lb is about 61 kg, never 135 kg (${l.value})`);
 const p=generateProgram(intake({id:'t-lblog'}),opts).program;
 const r=evaluateProgram(p,review(p,0,{observations:week0Obs(p,{squatLoad:{value:176,unit:'LB',convention:'TOTAL'}})}),opts);
 for(const l of squatLoads(r.proposal??p,1))assert.ok(l.value>=77.5&&l.value<=82.5,`176 lb is about 80 kg (${l.value})`);
 const u=evaluateProgram(p,review(p,0,{observations:week0Obs(p,{squatLoad:{value:400,unit:'STONE',convention:'TOTAL'}})}),opts);
 for(const l of squatLoads(u.proposal??p,1))assert.ok(l.value<=82.5,'an unknown unit is not adopted');
 assert.ok(u.loadQuestions?.some(q=>q.exerciseId==='back-squat'&&q.reason==='LOGGED_UNIT_OR_CONVENTION_UNKNOWN'));
});
test('QRE-R6-02: a logged load outside 0–500 kg or more than one increment above the plan is not adopted and is asked about',()=>{
 const p=generateProgram(intake({id:'t-bound'}),opts).program;
 for(const value of [800,200,95]){
  const r=evaluateProgram(p,review(p,0,{observations:week0Obs(p,{squatLoad:{value,unit:'KG',convention:'TOTAL'}})}),opts);
  for(const l of squatLoads(r.proposal??p,1))assert.ok(l.value<=82.5,`logged ${value} kg is not adopted (${l.value})`);
  assert.ok(r.loadQuestions?.some(q=>q.exerciseId==='back-squat'&&q.logged===value),'the athlete is asked to confirm the logged load');
 }
 const up=evaluateProgram(p,review(p,0,{observations:week0Obs(p,{squatLoad:{value:82.5,unit:'KG',convention:'TOTAL'}})}),opts);
 for(const l of squatLoads(up.proposal??p,1))assert.ok(l.value>=82.5&&l.value<=85,'one increment above the plan is executed evidence');
 const down=evaluateProgram(p,review(p,0,{observations:week0Obs(p,{squatLoad:{value:75,unit:'KG',convention:'TOTAL'}})}),opts);
 for(const l of squatLoads(down.proposal,1))assert.ok(l.value<=77.5,'a lighter executed load is the new reference');
 assert.equal(down.status,'MODIFY','a changed known load is a modification, not an instantiation');assert.equal(down.instantiationOnly,false);
});
test('QRE-R6-03: event rules follow days to the race, whatever the race weekday',()=>{
 const E=policy.event;let programs=0;
 const DAYSETS=[{runDays:[1,3,6],strengthDays:[0,4],longRunDay:6},{runDays:[0,2,4,6],strengthDays:[1,5],longRunDay:6},{runDays:[2,4,5],strengthDays:[3,6],longRunDay:5},{runDays:[0,3,5],strengthDays:[0,3,6],longRunDay:0}];
 for(const kind of ['10K','HALF_MARATHON'])for(const raceWeek of [5,8])for(let raceDay=0;raceDay<7;raceDay++)for(const days of DAYSETS){
  const g=generateProgram(intake({id:`t-rp-${kind}-${raceWeek}-${raceDay}`,weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',raceWeek*7+raceDay)}},strength:'STRENGTH'},knownExercises:[SQUAT,{...SQUAT,id:'barbell-rdl',reps:6,load:{value:90,unit:'KG',convention:'TOTAL'}}],recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}},schedule:{runMinutes:60,longRunMinutes:100,strengthMinutes:60,...days}}),opts);
  if(!g.program)continue;programs++;
  const race=sessionsOf(g.program).find(s=>s.role==='RACE');assert.ok(race);
  const window=sessionsOf(g.program).filter(s=>s.prescription&&gap(s.date,race.date)>=1&&gap(s.date,race.date)<=6);
  for(const s of window){
   const before=gap(s.date,race.date);
   assert.ok(!['LONG','QUALITY'].includes(s.role),`${kind} raceDay ${raceDay}: ${s.role} ${before} day(s) before the race`);
   if(s.role==='RACE_TOUCH')assert.ok(before>=E.raceWeekTouchMinDaysBeforeRace);
   if(s.sport==='STRENGTH'){assert.ok(before>=E.raceWeekStrengthMinDaysBeforeRace,`strength ${before} day(s) before the race`);assert.ok(s.prescription.exercises.every(e=>e.sets<=E.raceWeekStrengthSets));}
  }
  assert.ok(window.filter(s=>s.sport==='STRENGTH').length<=1,'one light strength session at most in the final six days');
  for(const s of sessionsOf(g.program).filter(s=>s.sport==='RUN'&&s.prescription&&s.role!=='RACE'&&gap(race.date,s.date)>0))assert.ok(gap(race.date,s.date)>=E.postEventFirstRunMinDaysAfterRace);
 }
 assert.ok(programs>=100,'the sweep generated event programs ('+programs+')');
});
test('QRE-R6-04: a run dimension without executed sessions never counts as an executed week',()=>{
 const input=intake({id:'t-gate',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-07'}},strength:'MAINTAIN'},recent:{runDaysPerWeek:4,runMinutesPerWeek:160,longestRunMinutes:60}},schedule:{runDays:[1,3,5,6],strengthDays:[2],longRunDay:6,runMinutes:50,longRunMinutes:80}});
 const sim=simulateProgram(input,{default:{missed:[{sport:'RUN'}]}},opts);
 assert.equal(sim.actualLedger.filter(o=>o.context?.sport==='RUN').length,0);
 const intense=sessionsOf(sim.finalProgram).filter(s=>s.weekIndex>0&&s.prescription&&(s.role==='QUALITY'||s.role==='RACE_TOUCH'||s.prescription.strides));
 assert.deepEqual(intense.map(s=>s.id),[],'no quality, touch or strides without executed easy running');
 assert.ok(sim.finalProgram.stateTrace.every(st=>(st.run.easyWeeksDone??0)===0));
});
test('QRE-R6-05: an eligibility date that is not a date is not a current assessment, and never throws',()=>{
 const p=generateProgram(intake({id:'t-elig',weeks:12}),opts).program;
 for(const assessedAt of ['not-a-date','xx',5,true,{}]){const r=evaluateProgram(p,review(p,1,{eligibility:elig(assessedAt)}),opts);assert.equal(r.status,'ASK',String(assessedAt));}
 const w=4,end=addDays(p.weeks[w].startDate,0);
 const ret=evaluateProgram(p,review(p,w,{kind:'RETURN_AFTER_PAUSE',day:0,interruption:{days:14,reasonCategory:'WORK',endDate:end},eligibility:elig('garbage')}),opts);
 assert.equal(ret.status,'ASK');
 const hm=generateProgram(intake({id:'t-elig-hm',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2027-01-24'}},strength:'RUNNING_SUPPORT'}}}),opts).program;
 const post=evaluateProgram(hm,review(hm,hm.phases.raceWeek+1,{day:2,eligibility:elig('xx')}),opts);
 assert.equal(post.status,'ASK');
});
test('QRE-R6-06: contradictory or out-of-range interruption facts are asked about; a truthy clinical flag routes to a human',()=>{
 const p=generateProgram(intake({id:'t-int',weeks:12}),opts).program,w=4,end=addDays(p.weeks[w].startDate,-1);
 const ret=i=>evaluateProgram(p,review(p,w,{kind:'RETURN_AFTER_PAUSE',day:0,interruption:i}),opts);
 for(const i of [{days:2,startDate:addDays(end,-39),endDate:end,reasonCategory:'WORK'},{days:-5,reasonCategory:'WORK'},{startDate:addDays(end,5),endDate:end,reasonCategory:'WORK'},{days:1e9,reasonCategory:'WORK'},{days:1.5,reasonCategory:'WORK'},{days:3,endDate:addDays(p.weeks[w].startDate,10),reasonCategory:'WORK'}])
  assert.equal(ret(i).status,'ASK',JSON.stringify(i));
 for(const clinicalReason of ['true',1,'yes'])assert.equal(ret({days:14,reasonCategory:'WORK',clinicalReason}).status,'CLINICAL_HUMAN_REQUIRED',String(clinicalReason));
 const long=ret({startDate:addDays(end,-39),endDate:end,reasonCategory:'WORK'});
 assert.equal(long.status,'MODIFY');assert.equal(long.proposal.decisions.at(-1).interruption.class,'LONG');
 assert.equal(ret({days:14,reasonCategory:'WORK'}).proposal.decisions.at(-1).interruption.class,'MODERATE');
});
test('QRE-R6-07: clinical events named in free text are never given a nonclinical return, whatever the category',()=>{
 const clinical=['broke my leg','cancer treatment','chemotherapy','heart attack','chest tightness','nausea','bad headache','muscle cramps','got stitches','appendicitis','kidney stones','dengue','bleeding','high blood pressure','diabetes','depression','panic attacks','mononucleosis','hernia','shingles','wisdom teeth removed','quebrei a perna','fraturei o pulso','náuseas','sore legs','tendon rupture',
  'stroke','had an operation','broken arm','dislocated shoulder','covid positive','food poisoning','kidney infection','torn ligament','sprained my ankle','tive dengue','quebrei o braço','cirurgia no joelho','me rompí la pierna','tuve una operación','ataque de pánico','dolor de cabeza','enxaqueca','pressão alta','tratamento de câncer','infarto'];
 for(const reason of clinical)assert.notEqual(screenInterruptionReason({reason,reasonCategory:'WORK',nonclinical:true}).status,'NONCLINICAL',reason);
 const plain=['Work trip to Lisbon','Busy month at work, deadlines','Family wedding','Moved house','Exams at university','Holiday with the kids','Viagem a trabalho','Mudança de casa','Vacaciones en la playa','Conference abroad','Gym closed for renovation','Too much rain'];
 for(const reason of plain)assert.equal(screenInterruptionReason({reason,reasonCategory:'WORK',nonclinical:true}).status,'NONCLINICAL',reason);
});
test('QRE-R6-08: an invalid schedule change is asked about; validation rejects duplicate sessions and key runs sharing a date',()=>{
 const p=generateProgram(intake({id:'t-sched',weeks:8}),opts).program;
 for(const changes of [{runDays:[1,1,3]},{runDays:[1,7,8]},{runDays:[-1,3,5]},{runDays:[1.5,3,5]},{runMinutes:1.5},{runMinutes:true},{runMinutes:500},{strengthMinutes:'abc'},{strengthMinutes:5},{longRunMinutes:1e9},{longRunDay:9},{runTurn:'NOON'}]){
  const r=evaluateProgram(p,review(p,1,{kind:'SCHEDULE_CHANGE',day:2,changes}),opts);
  assert.equal(r.status,'ASK',JSON.stringify(changes));assert.equal(r.proposal,null);
 }
 assert.equal(evaluateProgram(p,review(p,1,{kind:'SCHEDULE_CHANGE',day:2,changes:{runDays:[1,3,5],longRunDay:5}}),opts).status,'MODIFY');
 const sk=skeletonOf(p,opts.authority),wk=structuredClone(p.weeks[2]),q=wk.sessions.find(s=>s.role==='QUALITY')??wk.sessions.find(s=>s.role==='EASY'),long=wk.sessions.find(s=>s.role==='LONG');
 const dup={...structuredClone(q),role:'QUALITY'},clash={...structuredClone(q),id:q.id+'-x',role:'QUALITY',day:long.day,date:long.date};
 const errors=validateWeeks(sk,[{...wk,sessions:[...wk.sessions,dup,clash]}]);
 assert.ok(errors.some(e=>/duplicateSessionId/.test(e)));assert.ok(errors.some(e=>/keyRunsSameDate/.test(e)));
});
test('QRE-R6-09: week 1 never exceeds reported running and every later run respects the single-run ceiling',()=>{
 for(const mins of [10,14]){
  const g=generateProgram(intake({id:'t-low'+mins,athlete:{recent:{runDaysPerWeek:1,runMinutesPerWeek:mins,longestRunMinutes:mins}}}),opts),w0=g.program.weeks[0];
  assert.equal(g.program.capability.run.class,'WALK_JOG','a longest current run under the minimum easy session starts on the walk/jog ladder');
  assert.ok(w0.sessions.filter(s=>s.sport==='RUN'&&s.prescription&&['EASY','LONG'].includes(s.role)).every(s=>s.prescription.durationMinutes<=mins));
 }
 const r=prng(20261026),C=policy.run.singleRunCeiling;let checked=0;
 for(let i=0;i<160;i++){
  const g=generateProgram(athlete(r,i),opts);if(!g.program)continue;
  const P=g.program,runs=sessionsOf(P).filter(s=>runMinutesOf(s)>0),cap=P.capability.run,intakeLongest=['EASY_CURRENT','QUALITY_FAMILIAR','EASY_LOW'].includes(cap.class)&&Number.isFinite(cap.longestMinutes)?[{date:P.canonical.asOf,minutes:cap.longestMinutes}]:[];
  for(const s of runs.filter(s=>s.weekIndex>0&&!['WALK_JOG','RACE'].includes(s.role))){
   const start=addDays(P.startDate,s.weekIndex*7),prior=[...intakeLongest,...runs.filter(x=>x.date<start).map(x=>({date:x.date,minutes:runMinutesOf(x)}))].filter(x=>gap(x.date,start)>0&&gap(x.date,start)<=C.windowDays).map(x=>x.minutes);
   const ceiling=prior.length?Math.max(...prior)+C.stepMinutes:policy.return.entryRunMinutes;
   assert.ok(s.prescription.durationMinutes<=ceiling,`${P.athleteId} ${s.id} ${s.role} ${s.prescription.durationMinutes} > ${ceiling}`);checked++;
  }
 }
 assert.ok(checked>500,'ceiling checked on '+checked+' runs');
});
test('QRE-R6-10: malformed intake and review values give a status, never an exception',()=>{
 const bad=[i=>{delete i.asOf;},i=>{i.asOf=5;},i=>{i.athlete.event='HALF_MARATHON';},i=>{i.athlete.goals={run:{kind:'RACE',event:7},strength:'STRENGTH'};},i=>{i.athlete.strengthPreferences={emphasis:'SQUAT'};},i=>{i.athlete.strengthPreferences={movementPriorities:4};},i=>{i.athlete.specialPopulation='NONE';},i=>{i.athlete=null;},i=>{i.schedule=5;}];
 for(const f of bad){const i=intake({id:'t-bad'});f(i);const r=generateProgram(i,opts);assert.ok(['ASK','INVALID_INPUT','UNSUPPORTED','PROPOSED'].includes(r.status),r.status);}
 const p=generateProgram(intake({id:'t-badrv'}),opts).program,s=p.weeks[0].sessions.find(x=>x.sport==='STRENGTH');
 const reviews=[{observations:'x'},{observations:[null]},{observations:[{...obsFor(p,s),actual:{completed:true,exercises:5}}]},{observations:[{...obsFor(p,s),observedAt:undefined,occurrenceDate:'2026-13-45'}]},{athleteModel:''},{athleteModel:0},{kind:'SCHEDULE_CHANGE',changes:{runDays:['x']}},{kind:'RETURN_AFTER_PAUSE',interruption:{days:1e9,reasonCategory:'WORK'}},{kind:'RETURN_AFTER_PAUSE',interruption:'two weeks'}];
 for(const extra of reviews){const r=evaluateProgram(p,review(p,0,extra),opts);assert.ok(['HOLD','ASK','KEEP','MODIFY'].includes(r.status),JSON.stringify(extra).slice(0,60)+' → '+r.status);}
});
test('QRE-R6-11: an invalid event date or an unknown goal is asked about, never planned',()=>{
 const p=generateProgram(intake({id:'t-goal',weeks:12}),opts).program;
 const hm=generateProgram(intake({id:'t-goal-hm',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2027-01-24'}},strength:'RUNNING_SUPPORT'}}}),opts).program;
 for(const [prog,kind,changes] of [[p,'GOAL_CHANGE',{event:{kind:'10K',date:'abc'}}],[p,'GOAL_CHANGE',{event:{kind:'10K',date:'2026-13-45'}}],[hm,'EVENT_DATE_CHANGE',{eventDate:'abc'}],[p,'GOAL_CHANGE',{goals:{run:'FOO'}}],[p,'GOAL_CHANGE',{goals:{strength:'XYZ'}}],[p,'GOAL_CHANGE',{goals:{run:5}}]]){
  const r=evaluateProgram(prog,review(prog,1,{kind,day:2,changes}),opts);assert.equal(r.status,'ASK',JSON.stringify(changes));
 }
});
test('QRE-R6-12: unclear intake values are asked about or bounded, never silently dropped',()=>{
 const pause=weeks=>generateProgram(intake({id:'t-pause',athlete:{pause:{nonclinical:true,weeks,reasonCategory:'WORK'}}}),opts);
 assert.equal(pause('abc').status,'ASK');assert.equal(pause(undefined).status,'ASK');
 assert.equal(pause(200).program.capability.run.class,'RESTART');
 const odd=generateProgram(intake({id:'t-kr',athlete:{knownRuns:[{prescription:{modality:'RUN',family:'THRESHOLD',durationMinutes:40,warmupMinutes:10,cooldownMinutes:5,work:{repetitions:1e9,workMinutes:5,recoveryMinutes:2}},current:true,familiar:true,tolerated:true,observedAt:'2026-10-28'}]}}),opts);
 assert.notEqual(odd.program.capability.run.class,'QUALITY_FAMILIAR');assert.ok(odd.uncertainty.some(u=>u.field==='knownRuns'));
 for(const run of [5,{},['RACE']]){const i=intake({id:'t-goaltype'});i.athlete.goals={run,strength:'STRENGTH'};assert.equal(generateProgram(i,opts).status,'INVALID_INPUT',JSON.stringify(run));}
 const eight=generateProgram(intake({id:'t-sets8',athlete:{knownExercises:[{...SQUAT,sets:8}]}}),opts);
 assert.equal(eight.status,'PROPOSED');assert.ok(sessionsOf(eight.program).flatMap(s=>s.prescription?.exercises??[]).every(e=>e.sets<=6));
});
test('QRE-R6-13: one wearable activity counts once even when attached to two sessions',()=>{
 const p=generateProgram(intake({id:'t-act'}),opts).program,[a,b]=p.weeks[0].sessions.filter(s=>s.sport==='RUN');
 const src={provider:'WEARABLE:X',activityId:'act-SAME',quality:'WEARABLE_FULL'};
 const r=evaluateProgram(p,review(p,0,{observations:[obsFor(p,a,{eventId:'t-a',source:src}),obsFor(p,b,{eventId:'t-b',observedAt:a.date+'T08:00:00Z',minutes:a.prescription.durationMinutes,source:src})]}),opts);
 assert.equal(r.actualLedger.filter(x=>x.provenance?.activityId==='act-SAME').length,1);
 assert.ok(r.provenance.conflicts.some(c=>c.reason==='ACTIVITY_BOUND_TO_TWO_SESSIONS'));
});
test('QRE-R6-14: the completed-work ledger is append-only; a conflicting report quarantines the fact for gating and learning',()=>{
 const p=generateProgram(intake({id:'t-ledger'}),opts).program,obs=week0Obs(p),base=evaluateProgram(p,review(p,0,{observations:obs}),opts);
 const s=p.weeks[0].sessions.find(x=>x.sport==='RUN'),again={...obsFor(p,s,{eventId:obs.find(o=>o.sessionId===s.id).eventId,completed:false,minutes:3})};
 const r=evaluateProgram(p,review(p,1,{day:3,observations:[again],actualLedger:base.actualLedger}),opts);
 assert.equal(r.actualLedger.length,base.actualLedger.length,'executed work stays recorded');
 const row=r.actualLedger.find(x=>x.sessionId===s.id);assert.equal(row.conflicted,true);
 assert.ok(!r.updatedModel.observations.some(o=>o.eventId===row.eventId),'conflicted facts are excluded from learning');
 const same=evaluateProgram(p,review(p,0,{observations:[...obs.filter(o=>o.sessionId!==s.id),obsFor(p,s,{eventId:'t-same'}),obsFor(p,s,{eventId:'t-same',completed:false,minutes:5})]}),opts);
 assert.equal(same.weekEvidence.rows.find(x=>x.sessionId===s.id).status,'CONFLICTED');
});
test('QRE-R6-15: a missed-session report for a session recorded as completed is asked about, never moved',()=>{
 const p=generateProgram(intake({id:'t-missed',weeks:8}),opts).program,s=p.weeks[0].sessions.find(x=>x.sport==='STRENGTH'&&x.day===0);
 const base=evaluateProgram(p,review(p,0,{day:1,observations:[obsFor(p,s)]}),opts);
 const r=evaluateProgram(p,review(p,0,{kind:'MISSED_SESSION',day:2,targetSessionId:s.id,actualLedger:base.actualLedger}),opts);
 assert.equal(r.status,'ASK');assert.equal(r.proposal,null);
});
test('QRE-R6-16: without learning consent no athlete-specific pattern changes the plan',()=>{
 for(const consent of [true,false]){
  const sh=EDGE_PROFILES.SHARED_SAME_TURN,input={...structuredClone(sh),learningConsent:consent,schedule:{...sh.schedule,temporaryPreference:'STRENGTH',sameTurnConfirmed:true}};
  const sim=simulateProgram(input,{weeks:Array.from({length:8},(_,x)=>x>=3&&x<=5?{responses:[{sport:'RUN',role:'QUALITY',response:'HARDER'}]}:{})},opts);
  const learned=sim.decisions.filter(d=>d.action==='LEARNED_REARRANGEMENT').length;
  if(consent)assert.ok(learned>=1,'with consent the learned pattern can change the arrangement');else assert.equal(learned,0);
 }
});
test('QRE-R6-17: after an exercise is re-established, sets return one per executed week',()=>{
 const r=prng(777);let checked=0;
 for(let i=0;i<200;i++){
  const g=generateProgram(athlete(r,i),opts);if(!g.program)continue;
  const seen={};
  for(const wk of g.program.weeks)for(const s of wk.sessions.filter(x=>x.sport==='STRENGTH'&&x.prescription))for(const e of s.prescription.exercises){
   const prev=seen[e.id];
   if(prev&&prev.reestablished&&wk.index>prev.week){assert.ok(e.sets<=prev.sets+1,`${g.program.athleteId} ${e.id} ${prev.sets} → ${e.sets} in week ${wk.index}`);checked++;}
   if(!prev||wk.index>prev.week)seen[e.id]={week:wk.index,sets:e.sets,reestablished:e.load.mode==='ESTABLISH'&&!!prev};
  }
 }
 assert.ok(checked>0,'re-established exercises were checked ('+checked+')');
});
test('QRE-R6-18: a race date marked unavailable is asked about',()=>{
 const hm=generateProgram(intake({id:'t-racedate',weeks:16,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2027-01-24'}},strength:'RUNNING_SUPPORT'}}}),opts).program;
 const race=sessionsOf(hm).find(s=>s.role==='RACE');
 const r=evaluateProgram(hm,review(hm,hm.phases.raceWeek,{kind:'EVENT_WEEK_CONFLICT',day:0,changes:{unavailableDates:[race.date]}}),opts);
 assert.equal(r.status,'ASK');assert.ok(r.missingInputs.includes('event.date'));
});
test('QRE-R6-19: an event plan never leaves the race without preparatory running',()=>{
 const input=intake({id:'t-walkonly',asOf:'2026-11-12',startDate:'2026-11-17',athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:'2026-12-13'}},strength:'STRENGTH'},runExperience:'EXPERIENCED',recent:{runDaysPerWeek:3,runMinutesPerWeek:10,longestRunMinutes:5},knownExercises:[]},schedule:{runDays:[5],strengthDays:[4,5],runMinutes:30,strengthMinutes:45,longRunMinutes:30,longRunDay:5}});
 const g=generateProgram(input,opts);
 if(g.program){const raceWeek=g.program.phases.raceWeek;assert.ok(g.program.weeks.slice(0,raceWeek).some(w=>w.sessions.some(s=>s.sport==='RUN'&&s.prescription&&runMinutesOf(s)>0)),'running before the race');}
 else assert.equal(g.status,'ASK');
});
test('QRE-R6-20/21: the simulator works east of UTC+3 and reports a finite weekly increase',()=>{
 for(const tz of [180,540,-300]){
  const sim=simulateProgram(intake({id:'t-tz'+tz,timezoneOffsetMinutes:tz}),{},opts);
  assert.ok(sim.invariants.noDeadlock,'tz '+tz);assert.ok(!sim.decisions.some(d=>d.status==='HOLD'),'tz '+tz+': '+sim.decisions.filter(d=>d.status==='HOLD').map(d=>d.reason).join('; '));
  assert.ok(Number.isFinite(sim.summary.maxWeeklyRunIncrease));
 }
});
test('QRE-R6-22/23: ordering is code-point, not locale; a report dated before its activity is rejected',()=>{
 const base={athleteId:'a',sessionId:'s',actual:{completed:true,minutes:30},observedAt:'2026-11-02T08:00:00Z'};
 const n=normalizeObservations([{...base,eventId:'b',sessionId:'s1'},{...base,eventId:'B',sessionId:'s2'},{...base,eventId:'a',sessionId:'s3'}],{athleteId:'a',asOf:'2026-11-03T00:00:00Z'});
 assert.deepEqual(n.accepted.map(o=>o.eventId),['B','a','b']);
 const m=normalizeObservations([{...base,eventId:'early',reportedAt:'2026-11-01T08:00:00Z'}],{athleteId:'a',asOf:'2026-11-03T00:00:00Z'});
 assert.ok(m.excluded.some(e=>e.eventId==='early'&&e.reason==='REPORT_BEFORE_OBSERVATION'));
});
