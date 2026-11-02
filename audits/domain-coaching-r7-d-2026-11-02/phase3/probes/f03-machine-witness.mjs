// R7-D Phase 3, F03 witness: a machine-stack exercise through prescription -> log as prescribed -> ingestion -> record -> next cycle.
//   node f03-machine-witness.mjs [<CoachingCore root>]   (default: this worktree's CoachingCore)
// Read-only on the runtime. Prints, per weekly review, what the plan prescribes for each machine exercise, what the log sent, whether the
// review read it (load questions) and what the next week prescribes.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.argv[2]??path.resolve(import.meta.dirname,'../../../../CoachingCore');
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const known=(id,value,reps)=>({id,sets:3,reps,load:{value,unit:'KG',convention:'MACHINE_STACK'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-13T18:00:00+00:00'});
const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-16',startDate:'2026-11-17',weeks:12,learningConsent:false,
 athlete:{id:'f03',ageEligible:true,eligibility:elig('2026-11-16'),goals:{run:'NONE',strength:process.env.GOAL??'HYPERTROPHY'},strengthExperience:'INTERMEDIATE',recent:{strengthDaysPerWeek:3},
  knownExercises:[known('leg-press',140,10),known('machine-chest-press',50,10),known('lat-pulldown',55,10),known('seated-cable-row',50,12)],equipment:['MACHINES','DUMBBELLS','BENCH','BODYWEIGHT']},
 schedule:{runDays:[],strengthDays:[0,2,4],strengthTurn:'PM',strengthMinutes:60}};
const g=generateProgram(intake);if(!g.program)throw Error('no program: '+JSON.stringify(g).slice(0,400));
const MACHINES=['leg-press','machine-chest-press','lat-pulldown','seated-cable-row'];
// The log a client sends for a strength session done exactly as prescribed: each set at the prescribed reps, reserve and load as the row states it.
const asPrescribed=(s,mode)=>({completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.exercises.map(e=>({id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,...(e.load.mode==='KNOWN'?{load:mode==='KG'?{value:e.load.value,unit:'KG',convention:e.load.convention}:{value:e.load.value,unit:e.load.unit,convention:e.load.convention}}:{})}))}))});
const rowsOf=(p,w)=>p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>MACHINES.includes(e.id)).map(e=>`${e.id}:${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''} ${e.load.unit}x${e.reps}`));
for(const mode of ['AS_PRESCRIBED','KG']){
 let p=g.program,ledger=[],ref=null;console.log(`\n== log mode ${mode} ==`);console.log('week 0 prescribes',[...new Set(rowsOf(p,0))].join(' | '));
 for(const w of [0,1,2,3,4,5]){
  const obs=p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED').map((s,i)=>({eventId:`s${w}-${i}`,athleteId:p.athleteId,sessionId:s.id,occurrenceDate:s.date,actual:asPrescribed(s,mode),response:OK}));
  const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,6)}T20:00:00Z`,weekIndex:w,event:{id:`wr${w}`,kind:'WEEKLY_REVIEW'},eligibility:elig(addDays(p.weeks[w].startDate,6)),observations:obs,...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})});
  ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;
  const qs=(r.loadQuestions??[]).filter(q=>MACHINES.includes(q.exerciseId)).map(q=>`${q.exerciseId}:${q.reason}`);
  console.log(`w${w} review ${r.status}/${r.action} ${r.planValidity?.status}; machine questions ${qs.length?[...new Set(qs)].join(','):'none'}; week ${w+1} prescribes ${[...new Set(rowsOf(p,w+1))].join(' | ')}`);
 }
}
