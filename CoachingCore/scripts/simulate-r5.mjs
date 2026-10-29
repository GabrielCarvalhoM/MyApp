import fs from 'node:fs';
import {fixtureAthlete,noviceFixture,actualFor,reviewFor,learnedHistory} from '../r5/fixtures/trajectories.mjs';
import {simulateProgram} from '../src/r5-simulator.mjs';
import {generateProgram} from '../src/r5-program.mjs';
import {evaluateProgram} from '../src/r5-adaptation.mjs';
import {clone,hash} from '../src/value.mjs';
const out=new URL('../r5/',import.meta.url),write=(p,v)=>fs.writeFileSync(new URL(p,out),JSON.stringify(v,null,2)+'\n');
const scenarios=[
 {id:'A',input:fixtureAthlete('HALF_MARATHON',16),events:[0,1,2].map(weekIndex=>({weekIndex,kind:'OVERPERFORMANCE',targetAnchorId:'easy',performanceByAnchor:{easy:'OVER'}}))},
 {id:'B',input:fixtureAthlete('STRENGTH',12),events:[0,1,2].map(weekIndex=>({weekIndex,kind:'OVERPERFORMANCE',targetAnchorId:'strength-a',performanceByAnchor:{'strength-a':'OVER'}}))},
 {id:'C',input:fixtureAthlete('BALANCED',8),events:[{weekIndex:2,kind:'CONFLICT',targetAnchorId:'cruise',reviewOverrides:{forbiddenPairs:[{before:'strength-a',after:'cruise'}]}}]},
 {id:'D',input:fixtureAthlete('HALF_MARATHON',16),events:[{weekIndex:10,kind:'MISSED_ESSENTIAL',targetAnchorId:'long',missedAnchorIds:['long']}]},
 {id:'E',input:fixtureAthlete('HALF_MARATHON',16),events:[0,1,2].map(weekIndex=>({weekIndex,kind:'UNDERPERFORMANCE',targetAnchorId:'easy',performanceByAnchor:{easy:'UNDER'}}))},
 {id:'F',input:fixtureAthlete('HALF_MARATHON',16),events:[0,1,2].map(weekIndex=>({weekIndex,kind:'OVERPERFORMANCE',targetAnchorId:'strength-a',performanceByAnchor:{'strength-a':'OVER'}}))},
 {id:'GENERAL4',input:fixtureAthlete('GENERAL_FITNESS',4),events:[{weekIndex:1,kind:'MISSED_OPTIONAL',missedAnchorIds:['easy']}]},
 {id:'NOVICE_RUN8',input:noviceFixture('RUN'),events:[]},
 {id:'NOVICE_STRENGTH8',input:noviceFixture('STRENGTH'),events:[]},
 {id:'RETURN8',input:fixtureAthlete('GENERAL_FITNESS',8),events:[{weekIndex:2,kind:'RETURN',missedAnchorIds:['easy','cruise','long'],reviewOverrides:{currentCapacityConfirmed:false}},{weekIndex:3,kind:'RECOVERED',reconciledBeforeExecution:true}]},
 {id:'FATIGUE8',input:fixtureAthlete('GENERAL_FITNESS',8),events:[{weekIndex:2,kind:'SYSTEMIC_FATIGUE',recovery:'ADVERSE'},{weekIndex:3,kind:'RECOVERED',reconciledBeforeExecution:true}]}
];
const balanced=scenarios.find(s=>s.id==='C'),balancedAlternate=clone(balanced.input.scheduleOptions[0]);
balancedAlternate.id='familiar-travel-week';balancedAlternate.evidence.observedAt='2026-11-15';balancedAlternate.assignments.find(a=>a.anchorId==='strength-a').day=2;balancedAlternate.assignments.find(a=>a.anchorId==='strength-a').windowId='d2-pm';
const travelAvailability=clone(balanced.input.availability);travelAvailability[1].windows.forEach(w=>w.durationMinutes=10);
balanced.events=[{weekIndex:2,kind:'SCHEDULE_CHANGE',targetAnchorId:'strength-a',reviewOverrides:{availability:travelAvailability,scheduleOptions:[balanced.input.scheduleOptions[0],balancedAlternate]}}];
const missed=scenarios.find(s=>s.id==='D'),nextLong=clone(missed.input.scheduleOptions[0]);
nextLong.id='protect-next-long';nextLong.evidence.observedAt='2027-01-10';nextLong.assignments.find(a=>a.anchorId==='long').day=5;nextLong.assignments.find(a=>a.anchorId==='long').windowId='d5-am';
const nextLongAvailability=clone(missed.input.availability);nextLongAvailability[6].windows.forEach(w=>w.durationMinutes=10);
missed.events[0].reviewOverrides={availability:nextLongAvailability,scheduleOptions:[nextLong]};
const results=scenarios.map(s=>({id:s.id,description:'Deterministic supplied synthetic outcomes; no physiological forecast',input:s.input,eventFixtures:s.events,result:simulateProgram(s.input,s.events)}));
const input=fixtureAthlete('BALANCED',16),initial=generateProgram(input),program=initial.program,session=program.weeks[0].sessions.find(s=>s.anchorId==='easy');
const alternate=clone(input.scheduleOptions[0]);alternate.id='reported-alternate';alternate.assignments.find(a=>a.anchorId==='easy').windowId='d0-pm';
const historical=learnedHistory(program,session,'reported-week','UNDER');
const review=reviewFor(program,0,'REVIEW',{targetSessionId:session.id,observations:historical.actuals,historicalSessions:historical.historicalSessions,scheduleOptions:[input.scheduleOptions[0],alternate]});
// No fresh dose alternative: this demonstration isolates same-dose schedule ranking.
const historyProgram=clone(program);historyProgram.anchors.find(a=>a.id==='easy').alternatives=[];
const {programHash}=await import('../src/r5-program.mjs');historyProgram.hash=programHash(historyProgram);
const decision=evaluateProgram(historyProgram,review);
const g={id:'G',initialAthleteState:input.athlete,initial,review,programBefore:historyProgram,decision,synthetic:true,causalClaim:false};
write('SIMULATION_RESULTS_R5.json',{runtime:'Node '+process.version,syntheticOutcomesAreFixtures:true,trajectories:results});
write('DEMONSTRATIONS_R5.json',{scenarios:results.filter(x=>['A','B','C','D','E','F'].includes(x.id)).map(x=>({id:x.id,initialAthleteState:x.input.athlete,goal:x.input.athlete.goal,initialProgram:x.result.initial.program,rows:x.result.rows,summary:x.result.summary})).concat(g)});
write('PROGRAM_FIXTURES_R5.json',{scenarios:scenarios.map(s=>({id:s.id,input:s.input,events:s.events})),additional:{G:g}});
write('SIMULATION_SUMMARY_R5.json',{trajectories:results.map(r=>({id:r.id,...r.result.summary})),learnedScheduling:{status:decision.status,action:decision.action,reason:decision.reason},artifactsAreNotEmpiricalValidation:true});
console.log(JSON.stringify(results.map(r=>({id:r.id,...r.result.summary})).concat({id:'G',status:decision.status,action:decision.action})));
