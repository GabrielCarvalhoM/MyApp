// print rows of given weeks for all strength exercises after running the FITS athlete (same as trace-machine), scratch only
import path from 'node:path';import {pathToFileURL} from 'node:url';
const [root,goal='HYPERTROPHY',upto='5']=process.argv.slice(2);
const {generateProgram,evaluateProgram}=await import(pathToFileURL(path.join(root,'src/r6-index.mjs')).href);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const OK={performance:'COMPATIBLE',recovery:'COMPATIBLE',effort:'ON_TARGET',nextDayFunction:'NORMAL'};
const PLATE={'leg-press':10,'machine-chest-press':5,'seated-cable-row':5,'lat-pulldown':5};
const known=(id,value,reps)=>({id,sets:3,reps,load:{value,unit:'KG',convention:'MACHINE_STACK'},rir:2,current:true,familiar:true,tolerated:true,observedAt:'2026-11-13T18:00:00+00:00'});
const intake={version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-16',startDate:'2026-11-17',weeks:12,learningConsent:false,athlete:{id:'ssctr-rows',ageEligible:true,eligibility:elig('2026-11-16'),goals:{run:'NONE',strength:goal},strengthExperience:'INTERMEDIATE',recent:{strengthDaysPerWeek:3},knownExercises:[known('leg-press',140,10),known('machine-chest-press',50,10),known('lat-pulldown',55,10),known('seated-cable-row',50,12)],equipment:['MACHINES','DUMBBELLS','BENCH','BODYWEIGHT']},schedule:{runDays:[],strengthDays:[0,2,4],strengthTurn:'PM',strengthMinutes:60}};
let p=generateProgram(intake).program,ledger=[],ref=null;
for(let w=0;w<=Number(upto);w++){
 const strength=p.weeks[w].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription&&s.status!=='SKIPPED');
 console.log('--- week',w,p.weeks[w].phase);
 for(const s of strength)for(const e of s.prescription.exercises)console.log(' ',s.date,e.id,e.load.mode,e.load.value??'',e.load.convention,e.load.nextSetting?JSON.stringify(e.load.nextSetting):'',`${e.sets}x${e.reps}@${e.rir}`);
 const obs=strength.map((s,i)=>({eventId:`rw-${w}-${i}`,athleteId:p.athleteId,sessionId:s.id,observedAt:`${s.date}T19:00:00Z`,response:OK,actual:{completed:true,minutes:s.prescription.durationMinutes,exercises:s.prescription.exercises.map(e=>{const next=e.load.nextSetting;const load=next?{value:next.aboveKg+PLATE[e.id],unit:'KG',convention:e.load.convention}:e.load.mode==='KNOWN'?{value:e.load.value,unit:e.load.unit,convention:e.load.convention}:e.load.mode==='BODYWEIGHT'?null:{value:20,unit:'KG',convention:e.load.convention};return {id:e.id,sets:Array.from({length:e.sets},()=>({reps:e.reps,rir:e.rir,...(load?{load}:{})}))};})}}));
 const r=evaluateProgram(p,{version:'R6-REVIEW-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:`${addDays(p.weeks[w].startDate,6)}T20:00:00Z`,weekIndex:w,event:{id:`rw-wr${w}`,kind:'WEEKLY_REVIEW'},eligibility:elig(addDays(p.weeks[w].startDate,6)),observations:obs,...(ledger.length?{actualLedger:ledger}:{}),...(ref?{referenceState:ref}:{})});
 ledger=r.actualLedger??ledger;ref=r.referenceState??ref;if(r.proposal)p=r.proposal;
 console.log('  review:',r.status,r.action,'Q:',JSON.stringify((r.loadQuestions??[]).map(q=>[q.exerciseId,q.reason,q.logged])),'gates:',JSON.stringify(r.gates));
}
