// DOMAIN_COACHING_R7-A.1 composition probes: the equivalent paths of the seven R7-A blockers, found by the author before any R7-A.1 edit.
// RT=freeze2 runs the byte-exact R7A-FREEZE-2 snapshot (freeze2-source/), anything else the live CoachingCore tree. Each probe states the
// expected property and reports `defect: true` when the runtime violates it. Synthetic data, DEV_TEST_ONLY authority, read-only runtime use.
// Usage (repository root): node audits/domain-coaching-r7a1-2026-10-27/probes/r7a1-composition-probes.mjs [> out.json]
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,ROOT=path.resolve(here,'../../..'),tag=process.env.RT==='freeze2'?'R7A-FREEZE-2':'CURRENT';
const CC=tag==='CURRENT'?path.join(ROOT,'CoachingCore'):path.join(here,'../freeze2-source/CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R={...(await load('src/r6-index.mjs'))},{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const RDL={...SQUAT,id:'barbell-rdl',reps:6,load:{value:90,unit:'KG',convention:'TOTAL'}};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const intake=({id,weeks=16,athlete={},schedule={}})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},
 schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
let N=0;
const at=(p,w,day,hour,x={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`a1-${w}-${x.kind??'WEEKLY_REVIEW'}-${N++}`,kind:x.kind??'WEEKLY_REVIEW'},eligibility:elig(d),observations:[],...x};};
function obs(p,s,over={}){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>{const o=over[e.id]??{},ld=o.load??{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:o.sets??e.sets},()=>({load:ld,reps:o.reps??e.reps,rir:e.rir}))};});
 return {eventId:`a1-o-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const step=(t,review)=>{const r=R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return `${r.status}/${r.action}`;};
const weekly=(t,w,keep=()=>true)=>step(t,at(t.p,w,6,'21:00:00',{observations:t.p.weeks[w].sessions.filter(s=>s.prescription&&keep(s)).map(s=>obs(t.p,s))}));
const start=(ia,weeks)=>{const t={p:R.generateProgram(intake(ia),opts).program,ledger:[]};if(!t.p)throw Error('no program '+ia.id);for(let w=0;w<weeks;w++)weekly(t,w);return t;};
const copy=t=>({p:t.p,ledger:t.ledger});
const line=(P,w,fromDay=0)=>P.weeks[w].sessions.filter(s=>s.day>=fromDay).map(s=>`d${s.day} ${s.sport} ${s.role}${s.status==='SKIPPED'?' SKIPPED':''}${s.prescription?' '+(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):''}`);
/** a then b, against b then a, from the same program; compares the week from `fromDay`. */
const orders=(t0,w,a,b,fromDay=1)=>{const A=copy(t0),B=copy(t0),la=[step(A,a(A.p)),step(A,b(A.p))],lb=[step(B,b(B.p)),step(B,a(B.p))];return {aThenB:la.join(' then '),aThenBWeek:line(A.p,w,fromDay),bThenA:lb.join(' then '),bThenAWeek:line(B.p,w,fromDay),sameEitherOrder:line(A.p,w,fromDay).join()===line(B.p,w,fromDay).join(),A,B};};
const slim=({A,B,...x})=>x;
const out={probe:'R7A1-COMPOSITION-PROBES-1',runtime:tag,policyHash:opts.authority.policyHash,results:{}};
const probe=(id,expected,fn)=>{try{const r=fn();out.results[id]={expected,...r};}catch(e){out.results[id]={expected,error:String(e?.stack??e).slice(0,600)};}};

probe('E01_shortReturnNextWeekThenWeeklyReview','A short return that re-plans from next week makes the first quality slot easy; the weekly review keeps it',()=>{
 const t=start({id:'a1-e01',schedule:{strengthDays:[0,4],runDays:[1,3,6]}},3),W=3,d5=addDays(t.p.weeks[W].startDate,5);
 const r1=step(t,at(t.p,W,5,'20:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:6,startDate:addDays(d5,-6),endDate:addDays(d5,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 const after=line(t.p,W+1).filter(x=>x.includes(' RUN '));const r2=weekly(t,W,()=>false),kept=line(t.p,W+1).filter(x=>x.includes(' RUN '));
 return {decisions:[r1,r2],afterReturn:after,afterReview:kept,defect:after.join()!==kept.join()||kept.some(x=>/QUALITY/.test(x))};
});
probe('E02_datedScheduleChangeThenReview','A schedule change stated from a later week is never applied to the weeks before it, at any later review',()=>{
 const t=start({id:'a1-e02'},2),W=2,from=t.p.weeks[W+2].startDate,days=w=>[...new Set(t.p.weeks[w].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.day))].join(',');
 const r1=step(t,at(t.p,W,2,'10:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6,from}})),before=days(W+1),r2=weekly(t,W),after=days(W+1);
 return {decisions:[r1,r2],week3RunDaysAfterChange:before,week3RunDaysAfterReview:after,week4RunDays:days(W+2),defect:before!==after};
});
const eqWindow=p=>({kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:p.weeks[3].startDate,to:addDays(p.weeks[3].startDate,6)}});
probe('E03_fatigueThenEquipmentChange','Systemic fatigue and a barbell-free window of the same week compose in either order',()=>{
 const t=start({id:'a1-e03'},3),o=orders(t,3,p=>at(p,3,0,'07:00:00',{kind:'SYSTEMIC_FATIGUE'}),p=>at(p,3,0,'08:00:00',eqWindow(p)));return {...slim(o),defect:!o.sameEitherOrder};
});
probe('E04_unavailableDayThenEquipmentChange','An unavailable day and a barbell-free window of the same week compose in either order; the unavailable session stays skipped',()=>{
 const t=start({id:'a1-e04'},3),wed=t.p.weeks[3].sessions.find(s=>s.day===2&&s.sport==='STRENGTH').date;
 const o=orders(t,3,p=>at(p,3,0,'07:00:00',{kind:'UNAVAILABLE_DAY',changes:{unavailableDates:[wed]}}),p=>at(p,3,0,'08:00:00',eqWindow(p)));return {...slim(o),defect:!o.sameEitherOrder};
});
probe('E06_weeklyReviewThenEquipmentChange','An equipment change after the weekly review keeps the reviewed transition (SSCTR O-1/R28)',()=>{
 const t=start({id:'a1-e06'},2),W=2;
 const r1=step(t,at(t.p,W,6,'21:00:00',{observations:t.p.weeks[W].sessions.filter(s=>s.prescription).map(s=>obs(t.p,s,{'db-bench-press':{load:{value:16,unit:'KG',convention:'PER_HAND'}}}))}));
 const b=()=>{const e=t.p.stateTrace[W+1].strength.exercises['db-bench-press'];return `${e.mode} ${e.load}`;},reviewed=b();
 const r2=step(t,at(t.p,W,6,'22:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}}));
 return {decisions:[r1,r2],benchAfterReview:reviewed,benchAfterEquipmentChange:b(),defect:reviewed!==b()};
});
probe('E10_returnThisWeekThenMissedPreBreakMove','After a return re-plans this week, a missed session planned before it is never moved into the re-entry',()=>{
 const t=start({id:'a1-e10',schedule:{runDays:[0,2,4,6],longRunDay:0,strengthDays:[1,5]}},4),W=4,key=t.p.weeks[W].sessions.find(s=>s.sport==='RUN'&&s.role==='QUALITY'),d=addDays(t.p.weeks[W].startDate,key.day+1);
 const o=orders(t,W,p=>at(p,W,key.day+1,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d,-16),endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}),p=>at(p,W,key.day+1,'07:00:00',{kind:'MISSED_SESSION',targetSessionId:key.id}),0);
 const quality=o.A.p.weeks[W].sessions.filter(s=>s.day>key.day&&s.role==='QUALITY'&&s.prescription&&s.status!=='SKIPPED');
 return {...slim(o),qualityAfterReturnInReEntry:quality.map(s=>s.id),defect:!o.sameEitherOrder||quality.length>0};
});
probe('E11_scheduleNextWeekThenEventReachingThisWeek','A schedule change from next week never moves this week’s sessions, whatever re-plans this week later',()=>{
 const t=start({id:'a1-e11',athlete:{goals:{run:RACE,strength:'STRENGTH'}}},6),W=6;
 const o=orders(t,W,p=>at(p,W,0,'05:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}}),p=>at(p,W,0,'06:00:00',{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(p.weeks[W].startDate,7)}}));
 return {...slim(o),defect:!o.sameEitherOrder};
});
probe('E12_goalNextWeekThenEquipmentChange','A strength-goal change from next week never re-doses this week’s sessions, whatever re-plans this week later',()=>{
 const t=start({id:'a1-e12'},3),o=orders(t,3,p=>at(p,3,0,'07:00:00',{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}}),p=>at(p,3,0,'08:00:00',eqWindow(p)));return {...slim(o),defect:!o.sameEitherOrder};
});
probe('E13_permanentEquipmentFromNextWeek','A permanent equipment change stated from a later date leaves the sessions before that date unchanged',()=>{
 const t=start({id:'a1-e13'},3),W=3,before=line(t.p,W,1).filter(x=>x.includes('STRENGTH'));
 const r=step(t,at(t.p,W,0,'08:00:00',{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:t.p.weeks[W+1].startDate}})),after=line(t.p,W,1).filter(x=>x.includes('STRENGTH'));
 return {decision:r,thisWeekBefore:before,thisWeekAfter:after,nextWeek:line(t.p,W+1).filter(x=>x.includes('STRENGTH')),defect:before.join()!==after.join()};
});
probe('E14_scheduleNextWeekThenReturnThisWeek','A return that re-plans this week keeps this week’s chosen days after a schedule change from next week',()=>{
 const t=start({id:'a1-e14'},4),W=4,d0=t.p.weeks[W].startDate,before=[...new Set(t.p.weeks[W].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.day))].join(',');
 const r1=step(t,at(t.p,W,0,'05:00:00',{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}}));
 const r2=step(t,at(t.p,W,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:addDays(d0,-16),endDate:addDays(d0,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));
 const after=[...new Set(t.p.weeks[W].sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.day))].join(',');
 return {decisions:[r1,r2],thisWeekRunDaysBefore:before,thisWeekRunDaysAfter:after,defect:before!==after};
});
probe('D56_timeTrimmedRegain','After a re-establishment, weeks whose executed exposures were all trimmed to the time budget neither raise nor end the regain cap; a later budget increase adds at most one set above the largest executed count',()=>{
 const res={};
 for(const raise of [true,false]){
  const t={p:R.generateProgram(intake({id:'a1-d56',athlete:{knownExercises:[SQUAT,RDL,BENCH],recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:1}},schedule:{strengthDays:[0],runDays:[1,4,6],longRunDay:6,strengthMinutes:25}}),opts).program,ledger:[]},rows=[];
  for(let w=0;w<12;w++){weekly(t,w,s=>!(s.sport==='STRENGTH'&&w>=2&&w<=6));if(raise&&w===8)step(t,at(t.p,w,6,'22:00:00',{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:75}}));}
  for(let w=7;w<12;w++){const e=t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(x=>x.id==='back-squat'));rows.push(`w${w} ${e.map(x=>`${x.sets}x${x.reps} ${x.exposure?.kind??'-'} phased=${x.exposure?.phasedSets??'-'}`).join('+')||'-'} regainCap=${t.p.stateTrace[w]?.strength?.exercises?.['back-squat']?.regainCap??'-'}`);}
  const sets=w=>t.p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(x=>x.id==='back-squat').map(x=>x.sets));
  let largest=0,jump=false;for(let w=7;w<12;w++){const s=sets(w);if(s.length&&Math.max(...s)>largest+1&&largest>0)jump=true;if(s.length)largest=Math.max(largest,...s);}
  res[raise?'budgetRaisedAfterWeek8':'constant25']={rows,jumpAboveLargestPlusOne:jump};
 }
 // With a constant budget every week after the re-establishment is trimmed, so the cap must still be there at the start of weeks 8-11.
 return {...res,defect:res.budgetRaisedAfterWeek8.jumpAboveLargestPlusOne||res.constant25.rows.slice(1).some(x=>/regainCap=-/.test(x))};
});
console.log(JSON.stringify(out,null,1));
