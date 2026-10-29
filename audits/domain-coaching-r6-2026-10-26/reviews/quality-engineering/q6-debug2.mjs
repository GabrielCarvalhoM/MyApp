// QRE debug helper: replay one seeded athlete through the simulator script and print per-week run roles (read-only).
import {R6,prng,sessionsOf,simulateProgram,write} from './qlib.mjs';
import {athlete} from './q6-envelope-gen.mjs';
const [seed,id,script]=process.argv.slice(2);const r=prng(+seed);let a;for(let i=0;i<=+id;i++)a=athlete(r,i);
const S={allRunsMissed:{default:{missed:[{sport:'RUN'}]}},perfect:{default:{}}}[script];
const g=R6.generateProgram(a);console.log('class',g.program.capability.run.class,'goals',JSON.stringify(a.athlete.goals),'phases',g.program.phases.phases.join(','),'runDays',a.schedule.runDays,'tz',a.timezoneOffsetMinutes);
if(script){const sim=simulateProgram(a,S);
for(const row of sim.rows){const st=row.weekly;const res=st?.result;const nx=res?.proposal?.weeks[row.weekIndex+1];console.log('w'+row.weekIndex,row.phase,'decision',res?.status,res?.action,'gates',JSON.stringify(res?.gates),'next:',nx?nx.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.role+':'+s.prescription.durationMinutes+(s.prescription.strides?'+strides':'')).join(','):'-');}
}else for(const w of g.program.weeks)console.log('w'+w.index,w.phase,w.sessions.filter(s=>s.sport==='RUN'&&s.prescription).map(s=>s.day+':'+s.role+':'+s.prescription.durationMinutes+':'+s.prescription.family).join(' | '));
