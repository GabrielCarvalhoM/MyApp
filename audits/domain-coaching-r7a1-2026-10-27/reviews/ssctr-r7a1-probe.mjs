// SSCTR R7A1-SSCTR-r1 targeted probe (own instrument), one section per dossier item. Read-only runtime use, synthetic data, DEV_TEST_ONLY
// authority. RT=freeze2 runs the byte-exact R7A-FREEZE-2 snapshot (freeze2-source/), otherwise the live tree (R7A1-FREEZE-A1).
// Usage: node ssctr-r7a1-probe.mjs > out.json
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,ROOT=path.resolve(here,'../../..'),tag=process.env.RT==='freeze2'?'R7A-FREEZE-2':'R7A1-FREEZE-A1';
const CC=tag==='R7A1-FREEZE-A1'?path.join(ROOT,'CoachingCore'):path.join(here,'../freeze2-source/CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),P=await load('src/r6-program.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),{hash}=await load('src/value.mjs');
const opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const SQUAT=K('back-squat',3,5,80),RDL=K('barbell-rdl',3,6,90),BENCH=K('db-bench-press',3,8,18,'PER_HAND');
let N=0;
const intake=({id,goal='STRENGTH',run='PERFORMANCE',known=[SQUAT,RDL,BENCH],schedule={},weeks=16,recent={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run,strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:(schedule.strengthDays??[0,3]).length,...recent},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known,exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,4,6],strengthDays:[0,3],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`sp-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s,over={}){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id];const ld=o?.load??{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};const reps=o?.reps??Array(e.sets).fill(e.reps);return {id:e.id,sets:reps.map(r=>({load:ld,reps:r,rir:o?.rir??e.rir}))};});
 return {eventId:`sp-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;const tagx=`${x.event.kind}@w${x.weekIndex}d${new Date(x.asOf).getUTCDay()}:${r.status}/${r.action}`;t.log.push(tagx);return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true,over=()=>({}),hour='21:00:00')=>ev(t,at(t.p,w,6,hour,{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)).map(s=>obs(t.p,s,over(s)))}));
const fresh=(ia,weeksDone=0,keep=()=>true)=>{const g=R.generateProgram(intake(ia),opts);if(!g.program)throw Error('no program '+ia.id+' '+g.status+' '+(g.reason??''));const t={p:g.program,ledger:[],log:[]};for(let w=0;w<weeksDone;w++)weekly(t,w,s=>keep(w,s));return t;};
const fork=t=>({p:t.p,ledger:t.ledger,log:[...t.log]});
const strRows=(p,w,id)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)).flatMap(s=>s.prescription.exercises.filter(e=>!id||e.id===id).map(e=>`d${s.day} ${e.id} ${e.sets}x${e.reps}@RIR${e.rir}${e.load.mode==='KNOWN'?' '+e.load.value+'kg':' '+e.load.mode}${e.exposure?.kind?' '+e.exposure.kind:''}${e.exposure?' ['+e.exposure.phasedSets+'/'+e.exposure.baseSets+']':''}`));
const runRows=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='RUN').map(s=>`d${s.day} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''}${s.prescription?' '+s.prescription.family+':'+s.prescription.durationMinutes:''}${s.moved?' (moved from '+s.moved.from+')':''}`);
const capsOf=(p,w,ids)=>Object.fromEntries(ids.map(id=>{const e=p.stateTrace[w]?.strength.exercises[id];return [id,e?{mode:e.mode,load:e.load??null,reps:e.reps??null,sets:e.sets??null,regainCap:e.regainCap??null,setCap:e.setCap??null,priorSets:e.priorSets??null,returnStep:e.returnStep??null}:null];}));
const out={probe:'R7A1-SSCTR-PROBE-1',runtime:tag,policyHash:opts.authority.policyHash,sections:{}};
const section=(id,fn)=>{try{out.sections[id]=fn();}catch(e){out.sections[id]={error:String(e?.stack??e).slice(0,800)};}};

// S1 / D56: the dossier's minimal timeline (STRENGTH, one 25-minute day, known squat/RDL/bench, strength missed weeks 2-6), constant and raised.
section('S1_D56_minimal',()=>{
 const res={};
 for(const raise of [false,true]){
  const t=fresh({id:`sp-d56-${raise}`,schedule:{strengthDays:[0],strengthMinutes:25}},7,(w,s)=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));const weeks={};
  for(let w=7;w<=12;w++){weeks['w'+w]={rows:strRows(t.p,w,'back-squat').concat(strRows(t.p,w,'db-bench-press')),capsAtStart:capsOf(t.p,w,['back-squat','db-bench-press'])};weekly(t,w);if(raise&&w===8)ev(t,at(t.p,8,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));}
  res[raise?'raisedTo75AfterWeek8':'constant25']=weeks;
 }
 return res;
});
// S1 / QE-R7A-22: a cap week with a whole first session (day 0) and a mid-week systemic fatigue that reduces the day-3 session; no time trim.
// The bench press is a main lift on both strength days (the squat is on day 0 only).
section('S1_QE22_lastVsAny',()=>{
 const t=fresh({id:'sp-qe22',schedule:{strengthDays:[0,3],strengthMinutes:75}},7,(w,s)=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));
 weekly(t,7);const W=8,before={rows:strRows(t.p,W,'db-bench-press'),caps:capsOf(t.p,W,['db-bench-press'])};
 const mon=t.p.weeks[W].sessions.find(s=>s.sport==='STRENGTH'&&s.day===0);
 const f=ev(t,at(t.p,W,1,'20:00:00',{kind:'SYSTEMIC_FATIGUE',observations:[obs(t.p,mon)]}));
 const afterFatigue=strRows(t.p,W,'db-bench-press');
 weekly(t,W,s=>s.id!==mon.id);
 return {fatigue:`${f.status}/${f.action}`,weekBefore:before,weekAfterFatigue:afterFatigue,capsNextWeek:capsOf(t.p,W+1,['db-bench-press']),nextWeekRows:strRows(t.p,W+1,'db-bench-press'),weekAfter:strRows(t.p,W+2,'db-bench-press'),log:t.log.slice(-3)};
});
// S1 legacy representation: the minimal timeline's week 8 rows without counts (a row written before R7-A), then its weekly review.
section('S1_D56_legacyRows',()=>{
 const t=fresh({id:'sp-d56-legacy',schedule:{strengthDays:[0],strengthMinutes:25}},8,(w,s)=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));
 const W=8,ref=fork(t);weekly(ref,W);
 const p=structuredClone(t.p);for(const s of p.weeks[W].sessions)if(s.sport==='STRENGTH'&&s.prescription){for(const e of s.prescription.exercises)delete e.exposure;s.plannedPrescriptionHash=hash(s.prescription);}
 delete p.hash;p.hash=R.programHash(p);const L={p,ledger:t.ledger,log:[]};const r=weekly(L,W);
 return {legacyReview:`${r.status}/${r.action}`,errors:r.errors??r.validationErrors??null,withCounts:capsOf(ref.p,W+1,['back-squat','db-bench-press']),legacyKeptProposal:L.p===p,legacy:capsOf(L.p,W+1,['back-squat','db-bench-press']),legacyNextRows:strRows(L.p,W+1,'back-squat'),withCountsNextRows:strRows(ref.p,W+1,'back-squat')};
});
// S4 / QE-R7A-12: a logged load against a known-load exposure (planned 3x5 at 80 kg, STRENGTH range 4-6), and variants.
section('S4_QE12_doseReading',()=>{
 const base=fresh({id:'sp-qe12',schedule:{strengthDays:[0],strengthMinutes:75}},0);const W=0,row=base.p.weeks[W].sessions.find(s=>s.sport==='STRENGTH').prescription.exercises.find(e=>e.id==='back-squat');
 const variants={a_77p5_5_3_5:[77.5,[5,3,5]],b_75_4_4_2:[75,[4,4,2]],c_77p5_5_5_5:[77.5,[5,5,5]],d_80_5_3_5:[80,[5,3,5]],e_70_10_10_10:[70,[10,10,10]],f_82p5_5_5_5:[82.5,[5,5,5]],g_75_3_3_3:[75,[3,3,3]],h_80_5_5_5:[80,[5,5,5]]};
 const res={planned:`${row.sets}x${row.reps}@RIR${row.rir} ${row.load.value}kg`};
 for(const [k,[kg,reps]] of Object.entries(variants)){const t=fork(base);const r=weekly(t,W,()=>true,s=>s.sport==='STRENGTH'?{'back-squat':{load:{value:kg,unit:'KG',convention:'TOTAL'},reps}}:{});res[k]={review:`${r.status}/${r.action}`,gate:r.gates?.['back-squat']??r.gates?.STRENGTH??null,next:strRows(t.p,W+1,'back-squat'),state:capsOf(t.p,W+1,['back-squat'])['back-squat']};}
 return res;
});
// S5 / C5: a 17-day vacation reported Thursday 07:00 (the Monday lifting of that week predates the return and was not done).
section('S5_returnSupersedesPreBreak',()=>{
 const W=6,mk=()=>fresh({id:'sp-h26',goal:'HYPERTROPHY',known:[],schedule:{strengthDays:[0,3],strengthTurn:'PM'}},W,(w,s)=>w<3||w===3&&s.day<=3);
 const t=mk(),thu=addDays(t.p.weeks[W].startDate,3);
 const before={thisWeek:strRows(t.p,W),nextWeek:strRows(t.p,W+1)};
 const r=ev(t,at(t.p,W,3,'07:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:17,startDate:addDays(thu,-17),endDate:addDays(thu,-1),reasonCategory:'VACATION',reason:'Vacation'}}));
 const res={return:`${r.status}/${r.action}`,before,afterReturn:{thisWeek:strRows(t.p,W),nextWeek:strRows(t.p,W+1),weekAfter:strRows(t.p,W+2)}};
 // Then the week is executed from Thursday and reviewed: next week from evidence.
 weekly(t,W,s=>s.day>=3);res.afterReview={nextWeek:strRows(t.p,W+1),weekAfter:strRows(t.p,W+2)};
 // A corrected report: 16 days at Saturday 07:00, corrected to 5 days at 08:00, against the 5-day report alone.
 const sat=addDays(t.p.weeks[W].startDate,5),c=fresh({id:'sp-corr',known:[SQUAT,RDL,BENCH],schedule:{strengthDays:[0,5],strengthTurn:'PM'}},W,(w,s)=>w<W),alone=fork(c);
 // The athlete trained through Friday of week W in the 5-day reading; only the return reports differ.
 ev(c,at(c.p,W,5,'07:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(sat,-16),endDate:addDays(sat,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 const r2=ev(c,at(c.p,W,5,'08:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:5,startDate:addDays(sat,-5),endDate:addDays(sat,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 const r3=ev(alone,at(alone.p,W,5,'08:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:5,startDate:addDays(sat,-5),endDate:addDays(sat,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 const same=[W,W+1,W+2].every(w=>hash(c.p.weeks[w].sessions.map(s=>[s.id,s.prescription]))===hash(alone.p.weeks[w].sessions.map(s=>[s.id,s.prescription])));
 res.corrected={corrected:`${r2.status}/${r2.action}`,alone:`${r3.status}/${r3.action}`,equalToFiveDayAlone:same,correctedSat:strRows(c.p,W).filter(x=>x.startsWith('d5')).concat(runRows(c.p,W).filter(x=>x.startsWith('d6'))),aloneSat:strRows(alone.p,W).filter(x=>x.startsWith('d5')).concat(runRows(alone.p,W).filter(x=>x.startsWith('d6')))};
 return res;
});
// S6 / C3: a mid-week change of next week, then the weekly review with a partly executed week, against the review first and then the change.
section('S6_conditionalStartIsNotSticky',()=>{
 const res={};
 const keep=s=>!(s.day>=3);// Thursday onwards missed
 for(const [name,change] of [['schedule',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:45}}],['goal',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}]]){
  const t=fresh({id:`sp-s6-${name}`},4),A=fork(t),B=fork(t),W=4;
  ev(A,at(A.p,W,2,'12:00:00',change));const midweek=capsOf(A.p,W+1,['back-squat','db-bench-press']);weekly(A,W,keep);
  weekly(B,W,keep);ev(B,at(B.p,W,6,'22:00:00',change));
  const sa=A.p.stateTrace[W+1],sb=B.p.stateTrace[W+1];
  res[name]={changeThenReview:A.log.slice(-2),reviewThenChange:B.log.slice(-2),startAfterMidweekChange:midweek,strengthStateEqual:hash(sa.strength.exercises)===hash(sb.strength.exercises),runStateEqual:hash({...sa.run,planned:null})===hash({...sb.run,planned:null}),A:capsOf(A.p,W+1,['back-squat','db-bench-press']),B:capsOf(B.p,W+1,['back-squat','db-bench-press'])};
 }
 // A complete week with no reports, then an equipment window on Sunday evening, then the weekly review with every session reported.
 const t=fresh({id:'sp-s6-eq'},4),A=fork(t),B=fork(t),W=4,win={kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:t.p.weeks[W+2].startDate,to:addDays(t.p.weeks[W+2].startDate,6)}};
 ev(A,at(A.p,W,6,'20:00:00',win));const held=capsOf(A.p,W+1,['back-squat','db-bench-press']);weekly(A,W);weekly(B,W);ev(B,at(B.p,W,6,'22:00:00',win));
 res.unreportedCompleteWeek={afterWindow:held,afterLaterReview:capsOf(A.p,W+1,['back-squat','db-bench-press']),reviewFirst:capsOf(B.p,W+1,['back-squat','db-bench-press']),equal:hash(A.p.stateTrace[W+1].strength.exercises)===hash(B.p.stateTrace[W+1].strength.exercises)};
 return res;
});
// S7: an equipment change reported in the morning, with a strength session that afternoon (no barbell from today).
section('S7_sameDaySubstitution',()=>{
 const t=fresh({id:'sp-s7',schedule:{strengthDays:[0,3],strengthTurn:'PM'}},3),W=3,before=strRows(t.p,W).filter(x=>x.startsWith('d3'));
 const r=ev(t,at(t.p,W,3,'07:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:addDays(t.p.weeks[W].startDate,3),to:addDays(t.p.weeks[W].startDate,9)}}));
 return {change:`${r.status}/${r.action}`,afternoonBefore:before,afternoonAfter:strRows(t.p,W).filter(x=>x.startsWith('d3')),nextWeek:strRows(t.p,W+1)};
});
// S8 confirmations (sporting outcome only).
section('S8_confirmations',()=>{
 const res={};
 // QE-R7A-01: a return that re-plans from next week (Saturday 20:00), then an equipment change the same evening.
 for(const order of ['returnThenEquipment','equipmentThenReturn']){
  const t=fresh({id:`sp-q01-${order}`,schedule:{strengthDays:[0,3]}},6,(w,s)=>w<4),W=6,sat=addDays(t.p.weeks[W].startDate,5);
  const ret=p=>at(p,W,5,'20:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(sat,-16),endDate:addDays(sat,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}),eq=p=>at(p,W,5,'20:30:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],from:t.p.weeks[W+2].startDate,to:addDays(t.p.weeks[W+2].startDate,6)}});
  if(order==='returnThenEquipment'){ev(t,ret(t.p));ev(t,eq(t.p));}else{ev(t,eq(t.p));ev(t,ret(t.p));}
  res['QE01_'+order]={log:t.log.slice(-2),firstWeekBack:strRows(t.p,W+1),runMode:t.p.stateTrace[W+1].run.mode};
 }
 // O-1/R28: the weekly review logs the bench at 16 kg, then an equipment change that evening.
 const t=fresh({id:'sp-o1'},3),W=3;weekly(t,W,()=>true,s=>s.sport==='STRENGTH'?{'db-bench-press':{load:{value:16,unit:'KG',convention:'PER_HAND'}}}:{});
 const reviewed=capsOf(t.p,W+1,['db-bench-press']);ev(t,at(t.p,W,6,'22:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));
 res.O1={reviewed,afterEquipment:capsOf(t.p,W+1,['db-bench-press']),log:t.log.slice(-2)};
 return res;
});
// S9: a 10K postponed by four weeks while this week's remaining days are inside its taper window.
section('S9_eventOutOfWindow',()=>{
 const race=addDays('2026-11-02',9*7+6),t=fresh({id:'sp-s9',run:{kind:'RACE',event:{kind:'10K',date:race}},goal:'STRENGTH'},0);
 const sk=()=>P.skeletonOf(t.p,opts.authority),phases=w=>[0,1,2,3,4,5,6].map(d=>P.dayPhaseOf(sk(),w,d)).join(',');
 let W=null;for(let w=0;w<9;w++){weekly(t,w-1<0?0:w-1,()=>true);}
 // Find the first week whose Wednesday-to-Sunday days include a taper day while Monday-Tuesday do not all.
 const fresh2=fresh({id:'sp-s9b',run:{kind:'RACE',event:{kind:'10K',date:race}},goal:'STRENGTH'},0);for(let w=0;w<10;w++){const ph=[0,1,2,3,4,5,6].map(d=>P.dayPhaseOf(P.skeletonOf(fresh2.p,opts.authority),w,d));if(ph.includes('TAPER')){W=w;break;}}
 const u=fresh({id:'sp-s9c',run:{kind:'RACE',event:{kind:'10K',date:race}},goal:'STRENGTH'},W);
 const skU=()=>P.skeletonOf(u.p,opts.authority),ph=w=>[0,1,2,3,4,5,6].map(d=>P.dayPhaseOf(skU(),w,d)).join(',');
 const before={week:W,phases:ph(W),nextPhases:ph(W+1),runs:runRows(u.p,W),strength:strRows(u.p,W)};
 const r=ev(u,at(u.p,W,1,'20:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(race,28)}}));
 const after={phases:ph(W),nextPhases:ph(W+1),runs:runRows(u.p,W),strength:strRows(u.p,W)};
 const taperWeeks=u.p.weeks.map((x,i)=>[0,1,2,3,4,5,6].some(d=>P.dayPhaseOf(skU(),i,d)==='TAPER')?i:null).filter(x=>x!==null);
 const races=u.p.weeks.flatMap(x=>x.sessions).filter(s=>s.role==='RACE').map(s=>s.date);
 return {change:`${r.status}/${r.action}`,before,after,taperWeeksAfter:taperWeeks,racesAfter:races,newRaceWeek:u.p.phases.raceWeek};
});
// S10: adaptations that meet in one week.
section('S10_adaptationsMeet',()=>{
 const res={},sched={runDays:[1,3,5,6],longRunDay:6,strengthDays:[0,4]};
 const base=fresh({id:'sp-s10',schedule:sched},4),W=4,q=base.p.weeks[W].sessions.find(s=>s.sport==='RUN'&&s.role==='QUALITY');
 res.quality=q?`${q.id} d${q.day}`:null;if(!q)return res;
 const fat=p=>at(p,W,q.day-1>=0?q.day-1:0,'20:00:00',{kind:'SYSTEMIC_FATIGUE'}),mis=p=>at(p,W,q.day,'20:00:00',{kind:'MISSED_SESSION',targetSessionId:q.id});
 for(const [name,seq] of [['fatigueThenMissed',[fat,mis]],['missedThenFatigue',[mis,p=>at(p,W,q.day,'21:00:00',{kind:'SYSTEMIC_FATIGUE'})]]]){const t=fork(base);for(const f of seq)ev(t,f(t.p));res[name]={log:t.log.slice(-2),runs:runRows(t.p,W),qualityAfter:runRows(t.p,W).filter(x=>/QUALITY/.test(x)&&Number(x.slice(1,2))>q.day)};}
 // A short return reported the evening of the quality day, with that quality run missed.
 const ret=p=>{const d=addDays(p.weeks[W].startDate,q.day);return at(p,W,q.day,'20:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:6,startDate:addDays(d,-6),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}});};
 for(const [name,seq] of [['shortReturnThenMissed',[ret,p=>at(p,W,q.day,'20:30:00',{kind:'MISSED_SESSION',targetSessionId:q.id})]],['missedThenShortReturn',[mis,p=>{const d=addDays(p.weeks[W].startDate,q.day);return at(p,W,q.day,'20:30:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:6,startDate:addDays(d,-6),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}});}]]]){
  const b=fresh({id:'sp-s10r',schedule:sched},W,(w,s)=>s.date<addDays(base.p.weeks[W].startDate,q.day-6)),t=fork(b);for(const f of seq)ev(t,f(t.p));res[name]={log:t.log.slice(-2),runs:runRows(t.p,W),nextWeek:runRows(t.p,W+1)};}
 // An unavailable later day, then the missed quality run: the move never uses the skipped slot.
 {const t=fork(base),later=base.p.weeks[W].sessions.filter(s=>s.sport==='RUN'&&s.day>q.day&&s.role==='EASY').map(s=>s.date);ev(t,at(t.p,W,q.day-1,'20:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[later[0]]}}));ev(t,mis(t.p));res.unavailableThenMissed={unavailable:later[0],log:t.log.slice(-2),runs:runRows(t.p,W)};}
 // A systemic fatigue report on Sunday evening with nothing left, then the week's reports an hour later.
 {const A=fork(base),B=fork(base);ev(A,at(A.p,W,6,'20:00:00',{kind:'SYSTEMIC_FATIGUE'}));weekly(A,W,()=>true,()=>({}),'21:00:00');weekly(B,W);
  res.sundayFatigueThenReports={log:A.log.slice(-2),withSignal:capsOf(A.p,W+1,['back-squat','barbell-rdl']),withoutSignal:capsOf(B.p,W+1,['back-squat','barbell-rdl']),runWithSignal:{easy:A.p.stateTrace[W+1].run.easy,long:A.p.stateTrace[W+1].run.long,q:A.p.stateTrace[W+1].run.qualityStep},runWithout:{easy:B.p.stateTrace[W+1].run.easy,long:B.p.stateTrace[W+1].run.long,q:B.p.stateTrace[W+1].run.qualityStep}};}
 // A strength goal stated from a later date (the Monday of week W+3), reported in week W.
 {const t=fork(base),from=base.p.weeks[W+3].startDate,before=[W+1,W+2,W+3].map(w=>strRows(t.p,w,'back-squat'));const r=ev(t,at(t.p,W,2,'10:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'},from}}));
  res.goalFromLaterDate={change:`${r.status}/${r.action}`,from,before,after:[W+1,W+2,W+3].map(w=>strRows(t.p,w,'back-squat'))};}
 return res;
});
console.log(JSON.stringify(out,null,1));
