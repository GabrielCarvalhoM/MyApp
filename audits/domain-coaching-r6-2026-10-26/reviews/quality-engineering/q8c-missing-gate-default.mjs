// QRE probe Q8c: a run dimension with no gated row in the week (race week, post-event week, walk-only weeks) defaults to
// ADVANCE in advanceRun (gate[k] ?? gate.ALL ?? 'ADVANCE'), so executed-week counters advance without executed running.
// Scenario: EASY_CURRENT 10K athlete misses EVERY run (strength executed); after the race, does quality/strides unlock?
// Real authority; runtime simulator adopts proposals.
import {R6,simulateProgram,baseIntake,sessionsOf,write} from './qlib.mjs';
const input=baseIntake({id:'q-gate-default',weeks:12,athlete:{goals:{run:{kind:'RACE',event:{kind:'10K',date:process.argv[2]??'2026-12-13'}},strength:'MAINTAIN'},recent:{runDaysPerWeek:4,runMinutesPerWeek:160,longestRunMinutes:60}},schedule:{runDays:[1,3,5,6],strengthDays:[2],longRunDay:6,runMinutes:50,longRunMinutes:80}});
const sim=simulateProgram(input,{default:{missed:[{sport:'RUN'}]}});
const rows=sim.rows.map(r=>{const res=r.weekly?.result;return {week:r.weekIndex,phase:r.phase,decision:res?.action,runGates:Object.fromEntries(Object.entries(res?.gates??{}).filter(([k])=>['EASY','LONG','QUALITY','WALK_JOG'].includes(k))),runStateAfter:res?.proposal?{easyWeeksDone:res.proposal.stateTrace[r.weekIndex+1]?.run?.easyWeeksDone,mode:res.proposal.stateTrace[r.weekIndex+1]?.run?.mode}:null,nextWeekIntensity:res?.proposal?.weeks[r.weekIndex+1]?.sessions.filter(s=>s.role==='QUALITY'||s.prescription?.strides).map(s=>s.role+(s.prescription.strides?'+strides':''))??null};});
const ledgerRuns=sim.actualLedger.filter(o=>o.context?.sport==='RUN').length;
const finalIntensity=sessionsOf(sim.finalProgram).filter(s=>s.role==='QUALITY'||s.prescription?.strides).map(s=>[s.weekIndex,s.role,!!s.prescription.strides]);
const out={probe:'Q8c-missing-gate-default',authorityUsed:'REAL r6Authority()',phases:sim.finalProgram.phases.phases,executedRunsInLedger:ledgerRuns,rows,finalIntensity};
write('q8c-missing-gate-default'+(process.argv[2]?'-'+process.argv[2]:'')+'.out.json',out);
console.log(JSON.stringify({phases:out.phases.join(','),executedRunsInLedger:ledgerRuns,finalIntensity},null,0));for(const r of rows)console.log(JSON.stringify(r));
