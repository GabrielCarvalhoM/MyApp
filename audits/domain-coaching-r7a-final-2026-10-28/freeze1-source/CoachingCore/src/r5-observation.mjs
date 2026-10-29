import {clone,hash} from './value.mjs';
import {dateValid,validatePrescription} from './r5-contract.mjs';

/** A physical target/execution signature, distinct from intention, measured physiology and RIR certainty. */
export function stimulusOf(p){
 if(p.modality==='RUN')return {modality:p.modality,family:p.family,durationMinutes:p.durationMinutes,warmupMinutes:p.warmupMinutes,cooldownMinutes:p.cooldownMinutes,work:clone(p.work??null),effortDomain:p.effortDomain,equipment:clone(p.equipment)};
 return {modality:p.modality,family:p.family,equipment:clone(p.equipment),exercises:p.exercises.map(e=>({id:e.id,pattern:e.pattern,sets:e.sets,reps:e.reps,load:clone(e.load),restSeconds:e.restSeconds}))};
}
export function physicalDoseMatches(p,actual){
 if(actual?.completed!==true||hash(actual.stimulus??null)!==hash(stimulusOf(p)))return false;
 if(p.modality==='RUN')return actual.minutes===p.durationMinutes;
 const sets=p.exercises.reduce((n,e)=>n+e.sets,0),reps=p.exercises.reduce((n,e)=>n+e.sets*e.reps,0);
 if(actual.sets!==sets||actual.reps!==reps)return false;
 // An inconsistent aggregate cannot overrule the complete exercise/load-basis record.
 if(actual.loadKg!==undefined&&p.exercises.some(e=>e.load.unit!=='KG'||e.load.value!==actual.loadKg))return false;
 return true;
}
export function bindActual(program,observation,historicalSessions,asOf,sessionContext){
 const o=observation,s=program.weeks.flatMap(w=>w.sessions).find(s=>s.id===o.sessionId)??historicalSessions.find(s=>s.id===o.sessionId&&s.athleteId===program.athleteId&&s.origin==='HISTORICAL_ACTUAL_TASK');
 if(!s||validatePrescription(s.prescription).length)return {valid:false,reason:'ACTUAL_TASK_SOURCE_REQUIRED'};
 const expected=s.origin==='HISTORICAL_ACTUAL_TASK'?{family:s.prescription.family,modality:s.prescription.modality,phase:s.phase,arrangement:s.arrangement,doseKey:hash(s.prescription),equipment:clone(s.prescription.equipment),priority:s.priority}:sessionContext(program,s);
 const start=Date.parse(s.date)+(s.startMinute??0)*60000;
 if(o.athleteId!==program.athleteId||o.plannedPrescriptionHash!==hash(s.prescription)||Object.entries(expected).some(([k,v])=>hash(o.context?.[k]??null)!==hash(v??null))||!dateValid(o.observedAt)||Date.parse(o.observedAt)>Date.parse(asOf)||Date.parse(o.observedAt)<start)return {valid:false,reason:'PLANNED_ACTUAL_CONTEXT_OR_CHRONOLOGY_MISMATCH'};
 return {valid:true,comparable:physicalDoseMatches(s.prescription,o.actual),reason:'PHYSICAL_STIMULUS_CHECK'};
}
