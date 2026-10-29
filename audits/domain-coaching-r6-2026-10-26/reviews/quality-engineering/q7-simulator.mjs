// QRE probe Q7: runtime simulator invariants over the development trajectories with the REAL authority, plus two
// simulator defects: summary.maxWeeklyRunIncrease and a UTC-stamped review clock for athletes east of UTC+3.
import fs from 'node:fs';
import {R6,simulateProgram,write,hash} from './qlib.mjs';
const {TRAJECTORIES}=await import('../../../../CoachingCore/r6/fixtures/trajectories.mjs');
const rows=[];
for(const t of TRAJECTORIES){const s=simulateProgram(t.input,t.script);rows.push({id:t.id,status:s.status,invariants:s.invariants,allInvariants:Object.values(s.invariants).every(Boolean),decisions:s.summary.decisions,maxWeeklyRunIncrease:s.summary.maxWeeklyRunIncrease,maxWeeklyRunIncreaseIsNumber:Number.isFinite(s.summary.maxWeeklyRunIncrease)});}
const t=TRAJECTORIES[0],tz={};
for(const off of [0,180,240,330,540,-300]){const s=simulateProgram({...structuredClone(t.input),timezoneOffsetMinutes:off},t.script);tz[off]={decisions:s.summary.decisions,noDeadlock:s.invariants.noDeadlock,firstReason:s.decisions[0]?.reason};}
const test=fs.readFileSync('q7-node-test.out.txt','utf8'),m=k=>+(test.match(new RegExp('\\s'+k+' (\\d+)\\s'))?.[1]??NaN);
const out={probe:'Q7-simulator',authorityUsed:'REAL r6Authority()',trajectories:rows,allTrajectoriesInvariantsHold:rows.every(r=>r.allInvariants),summaryMetricBroken:rows.some(r=>!r.maxWeeklyRunIncreaseIsNumber),timezone:tz,nodeTest:{tests:m('tests'),pass:m('pass'),fail:m('fail'),file:'q7-node-test.out.txt'}};
write('q7-simulator.out.json',out);
console.log(JSON.stringify({all:out.allTrajectoriesInvariantsHold,summaryMetricBroken:out.summaryMetricBroken,nodeTest:out.nodeTest},null,0));
for(const r of rows)console.log(r.id,r.allInvariants,JSON.stringify(r.decisions),r.maxWeeklyRunIncrease);
console.log(JSON.stringify(tz,null,0));
