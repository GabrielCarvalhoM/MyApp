// DOMAIN_COACHING_R7-A.1 representation-only check: for every pair the handler grids list as representation only (context records differ,
// every row and state agree), applies a third change to both orders (a schedule, shift, goal, equipment-back or event change, the same
// morning or after the weekly review of the week as prescribed) and compares every week's rows and every state. A difference would mean a
// context record that reaches a prescription. Synthetic data, DEV_TEST_ONLY authority, read-only runtime use (CURRENT runtime only).
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const CC=path.resolve(import.meta.dirname,'../../../CoachingCore');
const L=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await L('src/r6-index.mjs'),{devAuthority}=await L('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const intake=(id,athlete={},schedule={})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:'STRENGTH'},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70,strengthDaysPerWeek:2},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:[SQUAT,BENCH],exerciseRotationPreference:'FIXED',...athlete},schedule:{runDays:[1,3,6],strengthDays:[2,5],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:60,longRunDay:6,longRunMinutes:100,...schedule}});
let N=0;
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}:00:00Z`,weekIndex:w,event:{id:`g-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`g-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,review)=>{const r=R.evaluateProgram(t.p,{...review,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r.status+'/'+r.action;};
const start=(id,athlete,schedule,weeks)=>{const t={p:R.generateProgram(intake(id,athlete,schedule),opts).program,ledger:[]};for(let w=0;w<weeks;w++)ev(t,at(t.p,w,6,'21',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>s.prescription).map(s=>obs(t.p,s))}));return t;};
const RACE={kind:'RACE',event:{kind:'10K',date:addDays('2026-11-02',13*7+6)}};
const PAIRS={race:[['EQUIPMENT_PERMANENT','SCHEDULE_NEXT'],['EQUIPMENT_PERMANENT','SCHEDULE_MINUTES'],['EQUIPMENT_PERMANENT','SCHEDULE_DATED'],['EQUIPMENT_PERMANENT','GOAL_NEXT'],['EQUIPMENT_PERMANENT','EVENT_REACHING'],['EQUIPMENT_PERMANENT','EVENT_LATER'],['SCHEDULE_NEXT','SCHEDULE_DATED'],['SCHEDULE_NEXT','EVENT_REACHING'],['SCHEDULE_NEXT','EVENT_LATER'],['SCHEDULE_DATED','EVENT_REACHING'],['SCHEDULE_DATED','EVENT_LATER']],plain:[['EQUIPMENT_PERMANENT','SCHEDULE_NEXT'],['EQUIPMENT_PERMANENT','SCHEDULE_MINUTES'],['EQUIPMENT_PERMANENT','SCHEDULE_DATED'],['EQUIPMENT_PERMANENT','GOAL_NEXT'],['SCHEDULE_NEXT','SCHEDULE_DATED']]};
const rows=P=>P.weeks.map(W=>W.sessions.map(s=>`${s.id}|${s.day}${s.turn??''}|${s.role}|${s.status??''}|${s.prescription?(s.sport==='STRENGTH'?s.prescription.exercises.map(e=>`${e.id}:${e.sets}x${e.reps}@${e.rir}/${e.load.mode}${e.load.value??''}`).join(','):`${s.prescription.family}:${s.prescription.durationMinutes}`):'-'}`).join(';')).join('\n'),states=P=>JSON.stringify(P.stateTrace.map(({anchor,...s})=>s));
let total=0,diff=0;const examples=[];
for(const [prog,list] of Object.entries(PAIRS)){
 const t=prog==='race'?start('g-race',{goals:{run:RACE,strength:'STRENGTH'}},{strengthDays:[0,3]},6):start('g-plain',{},{},3),w=prog==='race'?6:3,d0=t.p.weeks[w].startDate;
 const C={EQUIPMENT_WINDOW:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH'],from:d0,to:addDays(d0,6)}},EQUIPMENT_PERMANENT:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH']}},SCHEDULE_NEXT:{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6}},SCHEDULE_MINUTES:{kind:'SCHEDULE_CHANGE',changes:{strengthMinutes:30}},SCHEDULE_DATED:{kind:'SCHEDULE_CHANGE',changes:{runDays:[0,3,6],longRunDay:6,from:addDays(d0,14)}},GOAL_NEXT:{kind:'GOAL_CHANGE',changes:{goals:{strength:'HYPERTROPHY'}}},EVENT_REACHING:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(d0,7)}},EVENT_LATER:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:t.p.goal?.run?.event?addDays(t.p.goal.run.event.date,14):null}}};
 const Z={SCHED_B:{kind:'SCHEDULE_CHANGE',changes:{runDays:[1,3,5],longRunDay:5,strengthDays:[2,6]}},SCHED_PM:{kind:'SCHEDULE_CHANGE',changes:{runTurn:'PM',strengthTurn:'AM'}},GOAL_MAINTAIN:{kind:'GOAL_CHANGE',changes:{goals:{strength:'MAINTAIN'}}},EQUIP_BACK:{kind:'EQUIPMENT_CHANGE',changes:{equipment:['DUMBBELLS','BENCH','BARBELL','RACK']}},...(prog==='race'?{EVENT_EARLIER:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(t.p.goal.run.event.date,-21)}},EVENT_FAR:{kind:'EVENT_DATE_CHANGE',changes:{eventDate:addDays(t.p.goal.run.event.date,28)}}}:{})};
 for(const [a,b] of list)for(const [zk,z] of Object.entries(Z))for(const zw of [w,w+1]){
  const A={p:t.p,ledger:t.ledger},B={p:t.p,ledger:t.ledger};ev(A,at(A.p,w,0,'05',C[a]));ev(A,at(A.p,w,0,'06',C[b]));ev(B,at(B.p,w,0,'05',C[b]));ev(B,at(B.p,w,0,'06',C[a]));
  // The third change: the same morning, or after the weekly review of the week as prescribed.
  for(const T of [A,B]){if(zw>w)ev(T,at(T.p,w,6,'21',{kind:'WEEKLY_REVIEW',observations:T.p.weeks[w].sessions.filter(s=>s.prescription&&s.status!=='SKIPPED').map(s=>obs(T.p,s))}));}
  const sa=ev(A,at(A.p,zw,zw>w?0:0,zw>w?'07':'07',z)),sb=ev(B,at(B.p,zw,0,'07',z));total++;
  if(rows(A.p)!==rows(B.p)||states(A.p)!==states(B.p)){diff++;if(examples.length<8){const ra=rows(A.p).split('\n'),rb=rows(B.p).split('\n'),k=ra.findIndex((x,i)=>x!==rb[i]);examples.push({prog,pair:a+' x '+b,third:zk,at:zw,status:sa+' / '+sb,firstWeek:k,A:k>=0?ra[k].slice(0,300):'(states)',B:k>=0?rb[k].slice(0,300):'(states)'});}}
 }
}
console.log(JSON.stringify({total,diff,examples},null,1));
