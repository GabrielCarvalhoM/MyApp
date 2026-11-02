// SSCTR scratch probe (flagged behaviour 4): a machine step week whose gate is HOLD (logged at R with an adverse response, or reps short),
// then what the next week states, against a non-machine (PER_HAND dumbbell) control under the same week pattern.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const [root,variant='ADVERSE']=process.argv.slice(2);
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const known=(id,value,reps,conv)=>({id,sets:3,reps,load:{value,unit:'KG',convention:conv},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-13T18:00:00+00:00'});
const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-16',startDate:'2026-11-17',weeks:12,learningConsent:false,athlete:{id:'cad',ageEligible:true,eligibility:elig('2026-11-16'),goals:{run:'NONE',strength:'HYPERTROPHY'},strengthExperience:'INTERMEDIATE',recent:{strengthDaysPerWeek:3},knownExercises:[known('leg-press',140,10,'MACHINE_STACK'),known('db-rdl',22,10,'PER_HAND')],equipment:['MACHINES','DUMBBELLS','BENCH','BODYWEIGHT']},schedule:{runDays:[],strengthDays:[0,2,4],strengthTurn:'PM',strengthMinutes:60}};
let p=generateProgram(intake).program,ledger=[],ref=null;
const watch=['leg-press','db-rdl'];
for(let w=0;w<5;w++){
 const strength=p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED');
 const txt=[];
 const obs=strength.map((s,i)=>{let resp=OK;const ex=s.prescription.exercises.map(e=>{
  const next=e.load.nextSetting,bad=w===2&&watch.includes(e.id);
  const value=next?next.aboveKg:e.load.mode==='KNOWN'?e.load.value:e.load.mode==='BODYWEIGHT'?null:20;
  const reps=next?next.fallbackReps:e.reps;
  const r=bad&&variant==='SHORT'?Math.max(1,reps-3):reps;
  if(watch.includes(e.id))txt.push(`${e.id}:${next?`NEXT>${next.aboveKg} x${e.reps} fb${next.fallbackReps}`:e.load.mode==='KNOWN'?`${e.load.value}x${e.reps}`:e.load.mode}->${value}x${r}`);
  return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:r,rir:e.rir,...(value!=null?{load:{value,unit:'KG',convention:e.load.convention}}:{})}))};});
  if(w===2&&variant==='ADVERSE'&&s.prescription.exercises.some(e=>watch.includes(e.id)))resp={...OK,recovery:'ADVERSE',nextDayFunction:'IMPAIRED'};
  return {eventId:`cd-${w}-${i}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T19:00:00Z`,response:resp,actual:{completed:true,minutes:s.prescription.durationMinutes,exercises:ex}};});
 const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,6)}T20:00:00Z`,weekIndex:w,event:{id:`cd-wr${w}`,kind:'WEEKLY_REVIEW'},eligibility:elig(addDays(p.weeks[w].startDate,6)),observations:obs,...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})});
 ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;
 console.log(`w${w} ${p.weeks[w].phase} ${[...new Set(txt)].join(' | ')} gates ${watch.map(id=>id+'='+r.gates?.[id]).join(',')}`);
}
