// Q-R7B probe 11: which practice configurations (catalog skillLadders.practiceFor, one per slot pattern) a strength-class-NONE athlete can
// receive. Varies every pair/triple of strength days, run days, long-run day, turns, goals and equipment, so the arrangement can put
// either full template first in the week. Records the PRACTICE rows seen and the first template of week 0. Output: out/p11-practice-patterns.json
import fs from 'node:fs';
import {intake,opts,generateProgram,CATALOG} from './lib.mjs';
const practice=new Map(),firstTpl=new Map();let n=0;
const pairs=[];for(let a=0;a<7;a++)for(let b=a+1;b<7;b++){pairs.push([a,b]);for(let c=b+1;c<7;c++)pairs.push([a,b,c]);}
const RUNSETS=[[],[1,3,6],[0,2,4],[2,5],[0,1,2,3,4,5,6]];
for(const sd of pairs)for(const rd of RUNSETS)for(const sg of ['GENERAL','RUNNING_SUPPORT','HYPERTROPHY','STRENGTH'])for(const eq of [['DUMBBELLS'],['DUMBBELLS','BENCH'],[],['BANDS'],['KETTLEBELL']])for(const turns of [['AM','PM'],['PM','AM']]){
 const g=generateProgram(intake({id:'p11',goals:{run:rd.length?'PERFORMANCE':'NONE',strength:sg},strengthExperience:'NONE',equipment:eq,schedule:{strengthDays:sd,runDays:rd,longRunDay:rd.length?rd.at(-1):null,runTurn:turns[0],strengthTurn:turns[1]}}),opts);
 if(!g.program)continue;n++;
 const w0=g.program.weeks[0].sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).sort((a,b)=>a.day-b.day);
 if(w0[0])firstTpl.set(w0[0].role,(firstTpl.get(w0[0].role)??0)+1);
 for(const wk of g.program.weeks)for(const s of wk.sessions)for(const e of s.prescription?.exercises??[])if(e.role==='PRACTICE'&&!practice.has(e.id))practice.set(e.id,{week:wk.index,session:s.role,sd,rd,sg,eq});
}
const practiceFor=CATALOG.strength.skillLadders.practiceFor;
const out={programs:n,firstStrengthTemplateOfWeek0:Object.fromEntries(firstTpl),practiceRowsSeen:Object.fromEntries(practice),practiceForNeverPrescribed:Object.entries(practiceFor).filter(([,id])=>!practice.has(id)).map(([p,id])=>p+':'+id)};
fs.writeFileSync(new URL('./out/p11-practice-patterns.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
