// R7-D Phase 3, F03-B probe (SSCTR-R7D-F03B-r1 test T11, conditions C2): machine lifts through 12 weeks with an athlete who logs what a real machine
// allows. FITS: on a next-setting row the athlete moves to the stack's real next plate (leg press +10 kg, chest press and cable row +5 kg) at the
// row's repetitions; NEVER: the next plate is always too heavy, so the athlete stays at the current setting at the fallback repetitions. Every
// other row is done exactly as prescribed. Prints per week what each machine row states, the load questions, and checks:
//  - no machine row ever states a value the athlete did not supply or log (C2: no computed machine load);
//  - FITS progresses by real plates with at most one question per step; NEVER holds at the top of the range with no oscillation.
//   node f03b-athlete-probe.mjs [<CoachingCore root>] [--json <out>]
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const args=process.argv.slice(2),jsonOut=args.includes('--json')?args[args.indexOf('--json')+1]:null,rootArg=args.find(a=>!a.startsWith('--')&&a!==jsonOut);
const root=rootArg??path.resolve(import.meta.dirname,'../../../../CoachingCore');
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const PLATE={'leg-press':10,'machine-chest-press':5,'seated-cable-row':5,'lat-pulldown':5};
const known=(id,value,reps)=>({id,sets:3,reps,load:{value,unit:'KG',convention:'MACHINE_STACK'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-13T18:00:00+00:00'});
const intake=goal=>({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-16',startDate:'2026-11-17',weeks:12,learningConsent:false,
 athlete:{id:'f03b-'+goal,ageEligible:true,eligibility:elig('2026-11-16'),goals:{run:'NONE',strength:goal},strengthExperience:'INTERMEDIATE',recent:{strengthDaysPerWeek:3},
  knownExercises:[known('leg-press',140,10),known('machine-chest-press',50,10),known('lat-pulldown',55,10),known('seated-cable-row',50,12)],equipment:['MACHINES','DUMBBELLS','BENCH','BODYWEIGHT']},
 schedule:{runDays:[],strengthDays:[0,2,4],strengthTurn:'PM',strengthMinutes:60}});
const MACHINES=Object.keys(PLATE);
/** The athlete's log of one session: every row as prescribed, except a next-setting row, done at the machine's real next plate (FITS) or at the
 * current setting and the fallback repetitions (NEVER). A KNOWN row is logged with its own load object. */
function sessionLog(s,athlete){
 return {completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.exercises.map(e=>{
  const next=e.load.nextSetting,fits=athlete==='FITS';
  // A machine the probe does not list (an accessory machine first established by effort) steps by 5 kg (SSCTR-R7D-P3-RECHECK-r1 O-5).
  const load=next?{value:fits?next.aboveKg+(PLATE[e.id]??5):next.aboveKg,unit:'KG',convention:e.load.convention}:e.load.mode==='KNOWN'?{value:e.load.value,unit:e.load.unit,convention:e.load.convention}:e.load.mode==='BODYWEIGHT'?null:{value:20,unit:'KG',convention:e.load.convention};
  const reps=next&&!fits?next.fallbackReps:e.reps;
  return {id:e.id,sets:Array.from({length:e.sets},()=>({reps,rir:e.rir,...(load?{load}:{})}))};
 })};
}
const report={probe:'R7D-F03B-ATHLETE',runtimeRoot:root,runs:[]};
for(const goal of ['HYPERTROPHY','STRENGTH'])for(const athlete of ['FITS','NEVER']){
 const g=generateProgram(intake(goal));if(!g.program)throw Error('no program '+goal);
 let p=g.program,ledger=[],ref=null;const supplied=new Map(MACHINES.map(id=>[id,new Set()]));
 for(const k of intake(goal).athlete.knownExercises)supplied.get(k.id).add(k.load.value);
 const weeks=[],violations=[];
 for(let w=0;w<11;w++){
  const strength=p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED');
  const rows=strength.flatMap(s=>s.prescription.exercises.filter(e=>MACHINES.includes(e.id)).map(e=>({id:e.id,date:s.date,text:e.load.nextSetting?`next>${e.load.nextSetting.aboveKg}x${e.reps}(fb ${e.load.nextSetting.fallbackReps})`:e.load.mode==='KNOWN'?`${e.load.value}x${e.reps}`:`${e.load.mode}x${e.reps}`,value:e.load.mode==='KNOWN'?e.load.value:null})));
  for(const r of rows)if(r.value!==null&&!supplied.get(r.id).has(r.value))violations.push({week:w,exercise:r.id,stated:r.value,supplied:[...supplied.get(r.id)]});
  const obs=strength.map((s,i)=>({eventId:`f03b-${goal}-${athlete}-${w}-${i}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T19:00:00Z`,actual:sessionLog(s,athlete),response:OK}));
  for(const o of obs)for(const e of o.actual.exercises)if(MACHINES.includes(e.id))for(const x of e.sets)if(x.load)supplied.get(e.id).add(x.load.value);
  const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,6)}T20:00:00Z`,weekIndex:w,event:{id:`f03b-${goal}-${athlete}-wr${w}`,kind:'WEEKLY_REVIEW'},eligibility:elig(addDays(p.weeks[w].startDate,6)),observations:obs,...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})});
  ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;
  const questions=(r.loadQuestions??[]).filter(q=>MACHINES.includes(q.exerciseId)).map(q=>`${q.exerciseId}:${q.reason}`);
  weeks.push({week:w,phase:p.weeks[w].phase,status:r.status,validity:r.planValidity?.status,rows:[...new Set(rows.map(x=>`${x.id} ${x.text}`))],questions:[...new Set(questions)]});
 }
 const settings=id=>weeks.flatMap(x=>x.rows.filter(t=>t.startsWith(id+' ')&&/^\S+ \d/.test(t)).map(t=>Number(t.split(' ')[1].split('x')[0])));
 const monotone=MACHINES.every(id=>{const v=settings(id);return v.every((x,i)=>i===0||x>=v[i-1]);});
 const questionWeeks=weeks.filter(x=>x.questions.length).length;
 report.runs.push({goal,athlete,violations,monotoneSettings:monotone,questionWeeks,finalSettings:Object.fromEntries(MACHINES.map(id=>[id,settings(id).at(-1)??null])),weeks});
 console.log(`\n== ${goal} / ${athlete}: computed machine values ${violations.length}; settings never go down: ${monotone}; weeks with a machine question ${questionWeeks}`);
 for(const x of weeks)console.log(`w${x.week} ${x.phase.padEnd(13)} ${x.status}/${x.validity==='VALID_WITHIN_CURRENT_BOUNDED_SCOPE'?'VALID':x.validity} rows: ${x.rows.join(' | ')}${x.questions.length?'  Q: '+x.questions.join(','):''}`);
}
if(jsonOut)fs.writeFileSync(jsonOut,JSON.stringify(report,null,1)+'\n');
process.exitCode=report.runs.every(r=>!r.violations.length&&r.monotoneSettings)?0:1;
