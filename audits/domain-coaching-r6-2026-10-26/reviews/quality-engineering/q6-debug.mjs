// QRE debug helper for Q6 findings (re-generates the same seeded athletes; read-only).
import {R6,prng,sessionsOf,simulateProgram} from './qlib.mjs';
import {athlete} from './q6-envelope-gen.mjs';
const [seed,...ids]=process.argv.slice(2).map(Number);const r=prng(seed);const all=[];for(let i=0;i<=Math.max(...ids);i++)all.push(athlete(r,i));
for(const i of ids){const a=all[i],g=R6.generateProgram(a),p=g.program;
 console.log('#',i,'tz',a.timezoneOffsetMinutes,'goals',JSON.stringify(a.athlete.goals),'class',p.capability.run.class,p.capability.strength.class,'phases',p.phases.phases.join(','),'raceWeek',p.phases.raceWeek,'raceDay',p.phases.raceDay);
 for(const w of p.weeks.slice(0,Math.min(p.weeks.length,(p.phases.raceWeek??3)+2)))console.log(' w'+w.index,w.phase,w.sessions.filter(s=>s.prescription).map(s=>`${s.day}:${s.sport[0]}:${s.role}:${s.prescription.durationMinutes}${s.prescription.exercises?'['+s.prescription.exercises.map(e=>e.id+'x'+e.sets+'/'+e.load.mode[0]).join(' ')+']':''}`).join(' | '));
}
