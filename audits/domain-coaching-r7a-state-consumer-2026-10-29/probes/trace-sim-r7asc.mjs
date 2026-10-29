// Author probe (prints only): one R6 simulation trajectory traced exercise by exercise, on the runtime R7ASC_ROOT selects (default: the live
// tree): per week, the rows of the named exercises (sets x reps, load mode and value, kind), the gates of the weekly review and of each event,
// what the simulated athlete logged, and the PlanningView / HistoricalState / projection doses at the week start when the runtime exports them.
// Usage: node trace-sim-r7asc.mjs <trajectoryId> <exerciseId,...>
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {ROOT} from './r7asc-lib.mjs';
const imp=p=>import(pathToFileURL(path.join(ROOT,p)).href);
const {simulateProgram}=await imp('src/r6-simulator.mjs'),A=await imp('src/r6-adaptation.mjs'),{devAuthority}=await imp('r6/fixtures/dev-authority.mjs'),{TRAJECTORIES}=await imp('r6/fixtures/trajectories.mjs');
const [id,list]=process.argv.slice(2),IDS=(list??'').split(',').filter(Boolean),opts={authority:devAuthority()};
const t=TRAJECTORIES.find(x=>x.id===id);if(!t)throw Error('No trajectory '+id);
const r=simulateProgram(t.input,t.script,opts),P=r.finalProgram,goal=P.goal.strength.kind;
const row=(s,e)=>`${s.date} ${e.sets}x${e.reps}@${e.rir} ${e.load.mode}${Number.isFinite(e.load.value)?' '+e.load.value:''} ${e.exposure?.kind??''}`.trim();
const dose=x=>x?`${x.mode} ${x.load??'-'} x${x.reps} t${x.loadTick??0}${Number.isInteger(x.returnStep)?' rs'+x.returnStep:''}${x.unlogged?' unlogged':''}${Number.isFinite(x.pendingLoad)?' pending'+x.pendingLoad:''}`:null;
const out={probe:'trace-sim-r7asc',root:ROOT,trajectory:id,goal,weeks:[]};
for(const w of r.rows){
 const planned=w.plannedWeek,ids=IDS.length?IDS:[...new Set(planned.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.map(e=>e.id)))];
 let H=null;try{H=A.historicalStateOf?A.historicalStateOf(P,{asOf:`${planned.startDate}T00:30:00Z`,actualLedger:r.actualLedger},opts):null;}catch(e){H={error:e.message,state:{strength:{exercises:{}}}};}
 const decisions=[...w.events,...(w.weekly?[w.weekly]:[])].map(d=>({kind:d.review.event.kind,status:`${d.result.status}/${d.result.action}`,gates:Object.fromEntries(Object.entries(d.result.gates??{}).filter(([k])=>!ids.length||ids.includes(k)||k==='STRENGTH'))}));
 const logged=Object.fromEntries(ids.map(x=>[x,r.actualLedger.filter(o=>o.context?.weekIndex===w.weekIndex&&o.logs?.[x]).map(o=>`${o.localDate} ${o.logs[x].load??'-'}x${o.logs[x].reps}@${o.logs[x].minRir}`)]));
 out.weeks.push({week:w.weekIndex,phase:w.phase,rows:Object.fromEntries(ids.map(x=>[x,planned.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).flatMap(s=>s.prescription.exercises.filter(e=>e.id===x).map(e=>row(s,e)))])),
  projection:Object.fromEntries(ids.map(x=>[x,dose(P.stateTrace[w.weekIndex]?.strength?.exercises?.[x])])),history:H?Object.fromEntries(ids.map(x=>[x,dose(H.state.strength.exercises[x])])):'not exported',decisions,logged});
}
console.log(JSON.stringify(out,null,1));
