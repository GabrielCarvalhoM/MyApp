// Author check for D52 (dev authority, read-only use of the runtime). Over scripted timelines (rotation cadences, skipped strength
// weeks, missed single sessions, completion reports without loads and nonclinical pauses), after every weekly review:
//  (B) each exercise state's lastPerformed equals the last date the script actually performed that exercise (or the intake observedAt
//      of a known dose never performed in the program); an exercise never performed has no state;
//  (A) every from-log row of the week the review issues is a pending row (effort-guided) or a return-step row, never a row that points
//      to a log that does not exist; and every loaded exercise with no state is prescribed as the establishment row.
// Run from this folder: node author-check-resume-clock.mjs
import {generateProgram,evaluateProgram} from '../../../../CoachingCore/src/r6-index.mjs';
import {devAuthority} from '../../../../CoachingCore/r6/fixtures/dev-authority.mjs';
const opts={authority:devAuthority()};
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const SQUAT={id:'back-squat',sets:3,reps:5,load:{value:80,unit:'KG',convention:'TOTAL'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
const BENCH={id:'db-bench-press',sets:3,reps:8,load:{value:18,unit:'KG',convention:'PER_HAND'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-10-29'};
let N=0;
const intake=(id,{pref,known,goal,strengthDays=[0,4],runDays=[1,3,6],longRunDay=6,minutes=50})=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,athlete:{id,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:'PERFORMANCE',strength:goal},runExperience:'INTERMEDIATE',strengthExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:120,longestRunMinutes:50,strengthDaysPerWeek:strengthDays.length},equipment:['DUMBBELLS','BENCH','BARBELL','RACK'],knownExercises:known,exerciseRotationPreference:pref},schedule:{runDays,strengthDays,runTurn:'AM',strengthTurn:'PM',runMinutes:50,strengthMinutes:minutes,longRunDay,longRunMinutes:80}});
const review=(p,w,{day=6,kind='WEEKLY_REVIEW',...x}={})=>{const d=addDays(p.weeks[w].startDate,day);return {version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:d+'T21:00:00Z',weekIndex:w,event:{id:`rc-${kind}-${w}-${N++}`,kind},eligibility:elig(d),...x};};
function obs(p,s,details){
 const pr=s.prescription,actual={completed:true,minutes:pr.durationMinutes};
 if(pr.modality==='STRENGTH'&&details)actual.exercises=pr.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,load:e.load.mode==='BODYWEIGHT'?{value:0,unit:'BODYWEIGHT',convention:'BODYWEIGHT'}:{value:e.load.mode==='KNOWN'?e.load.value:20,unit:'KG',convention:e.load.convention}}))}));
 return {eventId:`rc-${p.athleteId}-${s.id}-${N++}`,athleteId:p.athleteId,sessionId:s.id,observedAt:s.date+(s.turn==='PM'?'T19:00:00Z':'T08:00:00Z'),actual,response:{performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'}};
}
const violations=[],stats={timelines:0,reviews:0,statesChecked:0,rowsChecked:0,fromLogRows:0,pendingRows:0,returnStepRows:0,establishmentRows:0,reestablishmentRows:0,unloggedRows:0,splitWeeks:0,newDuringReturn:0};
// Disclosed consequences, counted, not violations: a week in which an exercise has a re-establishment row and a known or from-log
// row (the per-session clock), and a loaded exercise with no state prescribed while another exercise carries a return step.
const notes={splitWeeks:[],newDuringReturn:[]};
/** script(w,s) returns 'DONE', 'NO_LOADS' or 'MISS' for each prescribed session; pause = {s,d} for a TRAVEL pause from Monday of week s. */
function timeline(label,cfg,script,pause=null){
 stats.timelines++;
 let p=generateProgram(intake('rc-'+label,cfg),opts).program,ledger=[];const done=new Map(),windows=[];
 for(const k of cfg.known)done.set(k.id,{date:k.observedAt,logged:true});
 const live=x=>!windows.some(([a,b])=>x.date>=a&&x.date<=b);
 const check=(P,w,label2)=>{
  const st=P.stateTrace[w].strength.exercises;
  for(const [id,e] of Object.entries(st)){stats.statesChecked++;const d=done.get(id);if(!d)violations.push(`${label2} w${w}: ${id} has a state but was never performed`);else if(e.lastPerformed!==d.date)violations.push(`${label2} w${w}: ${id} lastPerformed ${e.lastPerformed} but last performed ${d.date}`);}
  for(const s of P.weeks[w].sessions)for(const e of s.prescription?.exercises??[]){
   stats.rowsChecked++;const ins=e.instructions.join(' | ');
   if(e.load.mode==='FROM_LOG'){stats.fromLogRows++;if(/^Ramp up/.test(e.instructions[0]))stats.pendingRows++;else if(/at the return entry/.test(ins))stats.returnStepRows++;else violations.push(`${label2} w${w} ${s.date} ${id(e)}: from-log row without a logged load (${ins.slice(0,140)})`);}
   if(e.load.mode==='ESTABLISH'){stats.establishmentRows++;if(/Not done for more than/.test(ins))stats.reestablishmentRows++;if(/No usable load was logged/.test(ins))stats.unloggedRows++;}
   if(e.load.mode!=='BODYWEIGHT'&&e.role!=='PRACTICE'&&!st[e.id]&&e.load.mode!=='ESTABLISH')violations.push(`${label2} w${w} ${s.date} ${e.id}: no state but ${e.load.mode}`);
   if(e.load.mode!=='BODYWEIGHT'&&e.role!=='PRACTICE'&&!st[e.id]&&Object.values(st).some(x=>Number.isInteger(x.returnStep))){stats.newDuringReturn++;if(notes.newDuringReturn.length<8)notes.newDuringReturn.push(`${label2} w${w} ${s.date} ${e.id}: ${e.sets}x${e.reps} RIR ${e.rir} ${e.load.mode} | ${e.instructions.at(-1)}`);}
  }
  const byId={};for(const s of P.weeks[w].sessions)for(const e of s.prescription?.exercises??[])(byId[e.id]??=[]).push(e.load.mode==='ESTABLISH'&&e.instructions.some(t=>/Not done for more than/.test(t))?'RE':e.load.mode);
  for(const [x,l] of Object.entries(byId))if(l.includes('RE')&&l.some(m=>['KNOWN','FROM_LOG'].includes(m))){stats.splitWeeks++;if(notes.splitWeeks.length<8)notes.splitWeeks.push(`${label2} w${w} ${x}: ${l.join(',')}`);}
 };
 const id=e=>e.id;
 const execWeek=(P,w)=>{const out=[];for(const s of P.weeks[w].sessions){if(!s.prescription||!live(s))continue;const how=script(w,s);if(how==='MISS')continue;out.push(obs(P,s,how!=='NO_LOADS'));if(s.sport==='STRENGTH')for(const e of s.prescription.exercises){const prev=done.get(e.id);if(!prev||prev.date<s.date)done.set(e.id,{date:s.date});}}return out;};
 let w=0;
 const step=w=>{const r=evaluateProgram(p,review(p,w,{observations:execWeek(p,w),actualLedger:ledger}),opts);stats.reviews++;if(!['KEEP','MODIFY'].includes(r.status))violations.push(`${label} w${w}: review ${r.status} ${r.reason}`);ledger=r.actualLedger;if(r.proposal)p=r.proposal;if(w+1<p.weeks.length)check(p,w+1,label);};
 const end=pause?pause.s:p.weeks.length-1;
 for(;w<end;w++)step(w);
 if(pause){
  const abs=pause.s*7+pause.d,rw=Math.floor(abs/7),rday=abs%7,from=p.weeks[pause.s].startDate,after=addDays(p.weeks[rw].startDate,rday);
  const r0=evaluateProgram(p,review(p,rw,{day:rday,kind:'RETURN_AFTER_PAUSE',interruption:{days:pause.d,reasonCategory:'TRAVEL',nonclinical:true},actualLedger:ledger}),opts);
  if(!r0.proposal){violations.push(`${label}: return ${r0.status}`);return;}
  windows.push([from,after]);p=r0.proposal;ledger=r0.actualLedger;w=p.decisions.at(-1).fromWeek;
  for(;w<p.weeks.length-1;w++)step(w);
 }
}
const PREFS=['EVERY_2_WEEKS','EVERY_6_WEEKS','COACH_DECIDES','FIXED'];
const SCRIPTS={
 all:()=>'DONE',
 skipStrength4to8:(w,s)=>s.sport==='STRENGTH'&&w>=4&&w<=8?'MISS':'DONE',
 skipStrength2to6:(w,s)=>s.sport==='STRENGTH'&&w>=2&&w<=6?'MISS':'DONE',
 missMondays:(w,s)=>s.sport==='STRENGTH'&&s.day===0&&w%3===1?'MISS':'DONE',
 missThursdays:(w,s)=>s.sport==='STRENGTH'&&s.day===4&&w%2===0?'MISS':'DONE',
 noLoadsEvery3:(w,s)=>s.sport==='STRENGTH'&&w%3===2?'NO_LOADS':'DONE',
 missWeek0:(w,s)=>s.sport==='STRENGTH'&&w===0?'MISS':'DONE',
};
for(const pref of PREFS)for(const [known,goal] of [[[SQUAT,BENCH],'HYPERTROPHY'],[[],'STRENGTH'],[[SQUAT],'GENERAL']])for(const [name,script] of Object.entries(SCRIPTS))
 timeline(`${pref}-${known.length}-${goal}-${name}`,{pref,known,goal},script);
for(const pref of PREFS)for(const [s,d] of [[3,14],[4,15],[5,21],[6,35],[7,12]])for(const name of ['all','missThursdays','noLoadsEvery3'])
 timeline(`${pref}-pause-s${s}-d${d}-${name}`,{pref,known:[SQUAT,BENCH],goal:'HYPERTROPHY',strengthDays:[0,4],runDays:[1,2,3],longRunDay:3},SCRIPTS[name],{s,d});
// Three strength days, full-body templates: exercises appear more than once a week.
for(const pref of ['FIXED','EVERY_2_WEEKS'])for(const name of ['all','missMondays','skipStrength2to6','noLoadsEvery3'])
 timeline(`${pref}-3days-${name}`,{pref,known:[],goal:'GENERAL',strengthDays:[0,2,4],runDays:[1,3,6],minutes:45},SCRIPTS[name]);
// Deliberate per-session clock split: in week 1 only Monday's strength is done, then weeks 2-4 have none. An exercise done that
// Monday and prescribed again on several days of week 5 sits at 28 days on Monday and beyond it later that week.
const lastMondayThenSkip=(w,s)=>s.sport==='STRENGTH'&&(w===1&&s.day!==0||w>=2&&w<=4)?'MISS':'DONE';
for(const pref of ['FIXED','EVERY_2_WEEKS'])for(const [known,goal] of [[[SQUAT,BENCH],'GENERAL'],[[],'GENERAL']])
 timeline(`${pref}-3days-${known.length}-lastMondayThenSkip`,{pref,known,goal,strengthDays:[0,2,4],runDays:[1,3,6],minutes:45},lastMondayThenSkip);
// Deliberate never-performed exercise during a return: every Thursday strength session is missed up to and including the entry
// week, so the Thursday-only exercises are still unperformed while the others carry return steps.
for(const pref of ['FIXED','COACH_DECIDES'])for(const [s,d] of [[4,14],[5,21]])
 timeline(`${pref}-pause-s${s}-d${d}-thursdaysMissedToEntry`,{pref,known:[],goal:'HYPERTROPHY',strengthDays:[0,4],runDays:[1,2,3],longRunDay:3},(w,x)=>x.sport==='STRENGTH'&&x.day===4&&w<=s+Math.floor(d/7)+1?'MISS':'DONE',{s,d});
console.log(JSON.stringify({check:'author-check-resume-clock (D52)',authority:'DEV_TEST_ONLY',stats,violations:violations.length,sample:violations.slice(0,25),notes},null,1));
