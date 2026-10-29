// SSCTR R7A2-SSCTR-r1 ceiling-equality check (own instrument) on the return timelines of ssctr-r7a1-grid.mjs (ret16mon, ret16thu, ret24;
// same intake and execution; the budget raise is irrelevant before the return). Read-only runtime use of the live tree, synthetic data,
// DEV_TEST_ONLY authority. Prints only. Usage: node ssctr-r7a2-ceiling.mjs > out.json
// For every exercise in the return's start state (interruption.entry), the expected ceiling is the last executed count before the break
// outside a return step and a phase reduction (strengthReturnSets; R20 reads the largest whole count of the break's week before the break):
// the break week's executed whole counts before its first day if any, else the week-start state's lastExecutedSets, else its known count.
// CEQ counts disagreements; RAISED counts ceilings above the week-start state's, with the executed count that justifies them.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const here=import.meta.dirname,CC=path.resolve(here,'../../../CoachingCore');
const load=rel=>import(pathToFileURL(path.join(CC,rel)).href);
const R=await load('src/r6-index.mjs'),{devAuthority}=await load('r6/fixtures/dev-authority.mjs'),opts={authority:devAuthority()};
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const K=(id,sets,reps,kg,conv='TOTAL')=>({id,sets,reps,load:{value:kg,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'});
const KNOWN=[K('back-squat',4,5,80),K('barbell-rdl',3,6,90),K('db-bench-press',3,8,18,'PER_HAND')];
let N=0;
const intake=(id,{goal,known,days,minutes})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,
 athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:days.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known?KNOWN:[],exerciseRotationPreference:'FIXED'},
 schedule:{runDays:[1,4,6].filter(d=>!days.includes(d)).length===3?[1,4,6]:[1,5,6],strengthDays:days,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay:6,longRunMinutes:80}});
const at=(p,w,day,hour,x)=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${d}T${hour}Z`,weekIndex:w,event:{id:`ce-${N++}`,kind:x.kind},eligibility:elig(d),observations:[],...x};};
function obs(p,s){const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};if(pr.modality==='STRENGTH')actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({load:{value:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?0:20,unit:e.load.mode==='BODYWEIGHT'?'BODYWEIGHT':'KG',convention:e.load.convention},reps:e.reps,rir:e.rir}))}));return {eventId:`ce-o-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{...OK}};}
const ev=(t,x)=>{const r=R.evaluateProgram(t.p,{...x,actualLedger:t.ledger},opts);t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;return r;};
const live=s=>s.prescription&&s.status!=='SKIPPED';
const weekly=(t,w,keep=()=>true)=>ev(t,at(t.p,w,6,'21:00:00',{kind:'WEEKLY_REVIEW',observations:t.p.weeks[w].sessions.filter(s=>live(s)&&keep(s)&&s.date<=addDays(t.p.weeks[w].startDate,6)).map(s=>obs(t.p,s))}));
const out={probe:'R7A2-SSCTR-r1-CEILING',runtime:'live tree (check the digest)',timelines:0,exercises:0,CEQ:0,RAISED:0,byMode:{},examples:{CEQ:[],RAISED:[]}};
for(const mode of ['ret16mon','ret16thu','ret24'])for(const goal of ['STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const known of [true,false])for(const days of [[0],[0,3],[0,2,4]])for(const minutes of [20,25,30,40]){
 const id=`ce-${mode}-${goal}-${known?'K':'N'}-${days.length}-${minutes}`,g=R.generateProgram(intake(id,{goal,known,days,minutes}),opts);if(!g.program)continue;
 const t={p:g.program,ledger:[]};let bStart;
 if(mode==='ret16mon'){for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,()=>false);weekly(t,5,()=>false);const d=t.p.weeks[6].startDate;bStart=addDays(d,-16);ev(t,at(t.p,6,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:bStart,endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));}
 else if(mode==='ret16thu'){for(let w=0;w<4;w++)weekly(t,w);weekly(t,4,s=>s.day<=2);weekly(t,5,()=>false);const d=addDays(t.p.weeks[6].startDate,3);bStart=addDays(d,-16);ev(t,at(t.p,6,3,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:16,startDate:bStart,endDate:addDays(d,-1),reasonCategory:'TRAVEL',reason:'Work travel'}}));}
 else{for(let w=0;w<3;w++)weekly(t,w);weekly(t,3,s=>s.day<=3);weekly(t,4,()=>false);weekly(t,5,()=>false);const d=t.p.weeks[6].startDate;bStart=addDays(d,-24);ev(t,at(t.p,6,0,'06:00:00',{kind:'RETURN_AFTER_PAUSE',interruption:{days:24,startDate:bStart,endDate:addDays(d,-1),reasonCategory:'VACATION',reason:'Vacation'}}));}
 const D=t.p.decisions.filter(d=>d.action==='REESTABLISH').at(-1);if(!D)continue;out.timelines++;
 const pw=Math.floor((Date.parse(bStart)-Date.parse(t.p.startDate))/(7*864e5)),st0=t.p.stateTrace[pw].strength.exercises,entry=D.interruption.entry.strength.exercises;
 const wk={};for(const s of t.p.weeks[pw].sessions.filter(s=>s.sport==='STRENGTH'&&live(s)&&s.date<bStart))for(const e of s.prescription.exercises){if(e.exposure?.kind==='PRACTICE')continue;const whole=!Number.isInteger(e.exposure?.phasedSets)||e.exposure.phasedSets===e.exposure.baseSets;if(whole&&!Number.isInteger(st0[e.id]?.returnStep))wk[e.id]=Math.max(wk[e.id]??0,e.sets);}
 const m=(out.byMode[mode]??={timelines:0,exercises:0,CEQ:0,RAISED:0,fromBreakWeek:0});m.timelines++;
 for(const [x,s] of Object.entries(entry)){if(s.returnStep!==0)continue;out.exercises++;m.exercises++;
  const exp=Number.isInteger(wk[x])?wk[x]:Number.isInteger(st0[x]?.lastExecutedSets)?st0[x].lastExecutedSets:Number.isInteger(st0[x]?.sets)?st0[x].sets:null;if(Number.isInteger(wk[x]))m.fromBreakWeek++;
  if((s.setCeiling??null)!==exp){out.CEQ++;m.CEQ++;if(out.examples.CEQ.length<8)out.examples.CEQ.push({id,exercise:x,setCeiling:s.setCeiling??null,expected:exp,breakWeek:pw,weekCounts:wk[x]??null,stateStart:st0[x]?{last:st0[x].lastExecutedSets,sets:st0[x].sets}:null});}
  const prev=Number.isInteger(st0[x]?.lastExecutedSets)?st0[x].lastExecutedSets:Number.isInteger(st0[x]?.sets)?st0[x].sets:null;
  if(Number.isInteger(s.setCeiling)&&prev!==null&&s.setCeiling>prev){out.RAISED++;m.RAISED++;if(out.examples.RAISED.length<6)out.examples.RAISED.push({id,exercise:x,setCeiling:s.setCeiling,weekStart:prev,executedBeforeBreak:wk[x]??null});}
 }
}
console.log(JSON.stringify(out,null,1));
