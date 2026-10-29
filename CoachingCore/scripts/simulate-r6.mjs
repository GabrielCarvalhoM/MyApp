import fs from 'node:fs';
import path from 'node:path';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {r6Authority} from '../src/r6-authority.mjs';
import {hash} from '../src/value.mjs';
import {TRAJECTORIES} from '../r6/fixtures/trajectories.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';

/** 4/8/12/16-week trajectories over scripted execution fixtures. Responses are inputs, never predicted physiology. */
const weekView=w=>({index:w.index,phase:w.phase,runMinutes:w.plannedRunMinutes??null,sessions:w.sessions.filter(s=>s.prescription).map(s=>s.sport==='RUN'?`${s.day}:${s.role}:${s.prescription.durationMinutes}`:`${s.day}:${s.role}:${s.prescription.exercises.map(e=>`${e.id}@${e.sets}x${e.reps}`).join('+')}`)});
export function simulateAll(options={}){
 return TRAJECTORIES.map(t=>{
  const r=simulateProgram(t.input,t.script,options);
  if(!r.finalProgram)return {id:t.id,horizon:t.horizon,profile:t.profile,covers:t.covers,status:r.status,generation:{status:r.initial.status,reason:r.initial.reason,missingInputs:r.initial.missingInputs},invariants:r.invariants};
  return {id:t.id,horizon:t.horizon,profile:t.profile,covers:t.covers,status:r.status,invariants:r.invariants,allInvariantsHold:Object.values(r.invariants).every(Boolean),summary:r.summary,
   decisions:r.decisions.map(d=>({weekIndex:d.weekIndex,kind:d.kind,status:d.status,action:d.action,gates:d.gates??null,reason:d.reason})),
   initialProgramHash:r.initial.program.hash,finalProgramHash:r.finalProgram.hash,finalWeeks:r.finalProgram.weeks.map(weekView)};
 });
}
const main=process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename);
if(main){
 const dev=process.argv.includes('--dev'),options=dev?{authority:devAuthority()}:{},authority=r6Authority(options);
 const rows=simulateAll(options);
 const out={revision:'R6-SIMULATION-1',generatedAt:new Date().toISOString(),authority:dev?'DEV_TEST_ONLY':'CURRENT_INDEPENDENT_REVIEW',approvedBoundaries:authority.approved,policyHash:authority.policyHash,
  scope:'Synthetic scripted fixtures; development evidence, never holdout or outcome evidence',populationOutcomePrediction:false,
  totals:{trajectories:rows.length,simulated:rows.filter(r=>r.status==='SIMULATED_SYNTHETIC_FIXTURES').length,allInvariantsHold:rows.filter(r=>r.allInvariantsHold).length,horizons:[...new Set(rows.map(r=>r.horizon))].sort((a,b)=>a-b)},rows};
 const file=new URL(dev?'../r6/SIMULATION_RESULTS_R6.dev.json':'../r6/SIMULATION_RESULTS_R6.json',import.meta.url);
 fs.writeFileSync(file,JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify({...out.totals,authority:out.authority,rowsHash:hash(rows)}));
}
