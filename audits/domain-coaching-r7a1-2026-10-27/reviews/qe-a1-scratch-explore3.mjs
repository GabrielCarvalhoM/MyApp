// Exploration: weeks that plan two QUALITY runs (or a QUALITY after a RACE_TOUCH) in generated programs.
import {runtime,make,line,addDays} from './qe-a1-lib.mjs';
const RT=await runtime('A1'),{R,opts}=RT;
import {intake} from './qe-a1-lib.mjs';
const RACE=(k,wk)=>({kind:'RACE',event:{kind:k,date:addDays('2026-11-02',wk*7+6)}});
for(const rd of [[0,1,3,4,6],[0,1,2,3,4,6],[1,2,4,6],[0,2,3,5,6]])for(const goal of ['PERFORMANCE',RACE('10K',13),RACE('HALF_MARATHON',15)]){
 const g=R.generateProgram(intake({id:'x3-'+rd.join(''),schedule:{runDays:rd,strengthDays:[0,3].filter(d=>!rd.includes(d)).length?[0,3].filter(d=>!rd.includes(d)):[5],longRunDay:6},athlete:{goals:{run:goal,strength:'STRENGTH'},runExperience:'ADVANCED',recent:{runDaysPerWeek:rd.length,runMinutesPerWeek:300,longestRunMinutes:90,strengthDaysPerWeek:2}}}),opts);
 if(!g.program){console.log(rd.join(''),JSON.stringify(goal).slice(0,40),g.status,g.reason);continue;}
 const q=g.program.weeks.map(w=>w.sessions.filter(s=>s.role==='QUALITY').length);
 console.log(rd.join(''),typeof goal==='string'?goal:goal.event.kind,q.join(''),g.program.phases.phases.join(',').slice(0,160));
}
