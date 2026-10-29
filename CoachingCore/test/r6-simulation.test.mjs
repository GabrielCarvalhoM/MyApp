import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateProgram} from '../src/r6-simulator.mjs';
import {devAuthority} from '../r6/fixtures/dev-authority.mjs';
import {TRAJECTORIES} from '../r6/fixtures/trajectories.mjs';

const opts={authority:devAuthority()};
const results=Object.fromEntries(TRAJECTORIES.map(t=>[t.id,simulateProgram(t.input,t.script,opts)]));

test('Simulation: 4-, 8-, 12- and 16-week trajectories run end to end with every invariant',()=>{
 assert.deepEqual([...new Set(TRAJECTORIES.map(t=>t.horizon))].sort((a,b)=>a-b),[4,8,12,16]);
 for(const [id,r] of Object.entries(results)){
  assert.equal(r.status,'SIMULATED_SYNTHETIC_FIXTURES',id);
  for(const [name,ok] of Object.entries(r.invariants))assert.equal(ok,true,id+' '+name);
  assert.equal(r.summary.populationOutcomePrediction,false);
 }
});
test('Simulation: strong adherence keeps the plan; supported events reach race week and post-event',()=>{
 const r=results.T01_HM16_STRONG_ADHERENCE;
 assert.deepEqual(Object.keys(r.summary.decisions),['KEEP']);
 assert.ok(r.finalProgram.weeks.some(w=>w.phase==='RACE_WEEK'&&w.sessions.some(s=>s.role==='RACE')));
 assert.equal(r.finalProgram.weeks.at(-1).phase,'POST_EVENT');
 assert.ok(results.T10_10K12_SPECIFIC_MISSED_AND_POST_EVENT.finalProgram.weeks.some(w=>w.phase==='NEXT_BLOCK'));
});
test('Simulation: irregular adherence holds affected steps without debt; the missed key run is moved once',()=>{
 const r=results.T02_HM16_IRREGULAR_ADHERENCE;
 assert.ok(r.decisions.some(d=>d.gates?.LONG==='HOLD'));
 assert.equal(r.summary.actions.MOVE,1);
 // A missed session holds its own dimension next week; no compensation, and no quality step runs ahead of strong adherence.
 const weeks=r.rows.map(x=>x.plannedWeek),value=(wk,role)=>wk.sessions.find(s=>s.role===role)?.progression?.value??null;
 assert.equal(Math.max(...weeks[3].sessions.filter(s=>s.role==='EASY').map(s=>s.progression.value)),Math.max(...weeks[2].sessions.filter(s=>s.role==='EASY').map(s=>s.progression.value)),'missed easy run: next week repeats the easy dose');
 const strong=results.T01_HM16_STRONG_ADHERENCE.rows.map(x=>x.plannedWeek),step=wk=>wk.sessions.find(s=>s.role==='QUALITY')?.progression??null;
 assert.ok(weeks.every((wk,i)=>{const x=step(wk),y=step(strong[i]);return !x||y&&x.ladder===y.ladder&&x.value<=y.value||y&&x.ladder!==y.ladder;}),'irregular adherence never runs ahead on the quality ladder');
});
test('Simulation: repeated surplus earns, repeated adverse regresses, single signals hold, conflicts stay uncertain',()=>{
 assert.ok(results.T03_BALANCED12_OVERPERFORMANCE.decisions.some(d=>Object.values(d.gates??{}).includes('EARNED')));
 assert.ok(results.T04_STRENGTH12_REPEATED_UNDERPERFORMANCE.decisions.some(d=>d.gates?.['back-squat']==='REGRESS'));
 const noisy=results.T09_PARTIAL_WEARABLE12_NOISY.decisions;
 assert.ok(noisy.some(d=>d.duplicates>0));
 assert.ok(noisy.some(d=>d.excluded.includes('FUTURE_OBSERVATION')));
 assert.equal(noisy[3].gates.LONG,'HOLD');assert.equal(noisy[4].gates.LONG,'HOLD');
 assert.ok(!noisy.some(d=>d.gates?.LONG==='REGRESS'),'one bad and one conflicting session never regress');
});
test('Simulation: interruptions, schedule change, substitution and fatigue are handled with the smallest valid change',()=>{
 assert.equal(results.T05_10K8_SHORT_INTERRUPTION.summary.actions.REESTABLISH,1);
 assert.equal(results.T08_NOVICE8_MODERATE_INTERRUPTION.summary.actions.REESTABLISH,1);
 assert.equal(results.T07_GENERAL8_SCHEDULE_AND_EQUIPMENT.summary.actions.REARRANGE_FUTURE_WEEKS,1);
 assert.equal(results.T07_GENERAL8_SCHEDULE_AND_EQUIPMENT.summary.actions.SUBSTITUTE,1);
 assert.equal(results.T13_HM16_FATIGUE_SIGNALS.summary.actions.REDUCE,2);
});
test('Simulation: no official-plan effects and no completed-work rewrites anywhere',()=>{
 for(const r of Object.values(results)){assert.equal(r.invariants.noOfficialEffect,true);assert.equal(r.invariants.completedWorkImmutable,true);}
});
