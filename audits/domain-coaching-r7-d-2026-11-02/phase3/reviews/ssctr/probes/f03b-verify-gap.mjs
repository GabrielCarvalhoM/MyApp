// SSCTR scratch probe: does a second equal log at a later exposure verify a heavier machine setting (F03B P3(d)) when the week of the
// first log is reviewed KEEP and is not "complete"? Variant MISS: in week `missWeek` the athlete does every row but skips one accessory
// (db-biceps-curl not performed). Every machine next-setting row is done at aboveKg + plate (default 5 kg) at the row's reps.
import path from 'node:path';import {pathToFileURL} from 'node:url';
const [root,goal='HYPERTROPHY',variant='CLEAN',missWeekArg='4',nW='9']=process.argv.slice(2);const missWeek=Number(missWeekArg);
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const PLATE=id=>({'leg-press':10}[id]??5);
const known=(id,value,reps)=>({id,sets:3,reps,load:{value,unit:'KG',convention:'MACHINE_STACK'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-13T18:00:00+00:00'});
const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-16',startDate:'2026-11-17',weeks:12,learningConsent:false,athlete:{id:'ssctr-vg-'+goal,ageEligible:true,eligibility:elig('2026-11-16'),goals:{run:'NONE',strength:goal},strengthExperience:'INTERMEDIATE',recent:{strengthDaysPerWeek:3},knownExercises:[known('leg-press',140,10),known('machine-chest-press',50,10),known('lat-pulldown',55,10),known('seated-cable-row',50,12)],equipment:['MACHINES','DUMBBELLS','BENCH','BODYWEIGHT']},schedule:{runDays:[],strengthDays:[0,2,4],strengthTurn:'PM',strengthMinutes:60}};
let p=generateProgram(intake).program,ledger=[],ref=null;const est=new Map();
const summary={};
for(let w=0;w<Number(nW);w++){
 const strength=p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED');
 const lp=[];
 const obs=strength.map((s,i)=>({eventId:`vg-${w}-${i}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T19:00:00Z`,response:OK,actual:{completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.exercises.filter(e=>!(variant==='MISS'&&w===missWeek&&e.id==='db-biceps-curl')).map(e=>{
  const next=e.load.nextSetting;
  // establishment rows: a stable self-chosen value per exercise (so a second log agrees)
  if(!next&&e.load.mode!=='KNOWN'&&e.load.mode!=='BODYWEIGHT'&&!est.has(e.id))est.set(e.id,20);
  const load=next?{value:next.aboveKg+PLATE(e.id),unit:'KG',convention:e.load.convention}:e.load.mode==='KNOWN'?{value:e.load.value,unit:e.load.unit,convention:e.load.convention}:e.load.mode==='BODYWEIGHT'?null:{value:est.get(e.id),unit:'KG',convention:e.load.convention};
  if(e.id==='leg-press')lp.push(`${s.date} ${next?'NEXT>'+next.aboveKg:e.load.mode==='KNOWN'?e.load.value:e.load.mode}x${e.reps} -> ${load?.value}`);
  const ld=variant==='PIN'&&w===missWeek&&e.id==='leg-curl-machine'&&load?{value:7,unit:'PIN',convention:e.load.convention}:load;
  return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,...(ld?{load:ld}:{})}))};
 })}}));
 const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,6)}T20:00:00Z`,weekIndex:w,event:{id:`vg-wr${w}`,kind:'WEEKLY_REVIEW'},eligibility:elig(addDays(p.weeks[w].startDate,6)),observations:obs,...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})});
 ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;
 const q=(r.loadQuestions??[]).filter(x=>x.exerciseId==='leg-press').map(x=>x.reason+':'+x.logged);
 const other=(r.loadQuestions??[]).filter(x=>x.exerciseId!=='leg-press').map(x=>x.exerciseId+':'+x.reason);
 console.log(`w${w} ${p.weeks[w].phase} review ${r.status}/${r.action} leg-press: ${lp.join(' ; ')} Q=${JSON.stringify(q)} otherQ=${other.length}`);
}
