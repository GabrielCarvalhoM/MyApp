// Q-R7B probe 05b: emphasis under time fitting. With short strength sessions, does an emphasis change which prescribed exercises
// survive (accessory choice) in the generated weeks? Compares the prescribed exercise ids per session. Output: out/p05b-emphasis-fitting.json
import fs from 'node:fs';
import {intake,opts,generateProgram} from './lib.mjs';
const FULL=['BARBELL','RACK','BENCH','DUMBBELLS','KETTLEBELL','MACHINES','BANDS','PULL_UP_BAR'];
const rx=p=>p.weeks.slice(0,6).map(w=>w.sessions.filter(s=>s.sport==='STRENGTH'&&s.prescription).map(s=>s.prescription.exercises.map(e=>e.id).sort().join(',')).join(' | ')).join(' || ');
const out=[];
for(const sg of ['GENERAL','HYPERTROPHY','RUNNING_SUPPORT'])for(const mins of [20,25,30,40])for(const nd of [2,4]){
 const mk=x=>generateProgram(intake({id:'p05b',goals:{run:'PERFORMANCE',strength:sg},equipment:FULL,schedule:{strengthMinutes:mins,strengthDays:nd===2?[0,4]:[0,2,4,5]},athlete:x}),opts).program;
 const base=mk({});if(!base){out.push({sg,mins,nd,base:null});continue;}
 for(const e of [['CALF'],['TRUNK'],['LOWER'],['PULL'],['HIP_ABDUCTION'],['ELBOW_FLEXION']]){const p=mk({strengthPreferences:{emphasis:e}});out.push({sg,mins,nd,emphasis:e,prescribedChanged:p?rx(p)!==rx(base):null});}
}
const summary={cases:out.length,prescribedChanged:out.filter(x=>x.prescribedChanged).length,examples:out.filter(x=>x.prescribedChanged).slice(0,5)};
fs.writeFileSync(new URL('./out/p05b-emphasis-fitting.json',import.meta.url),JSON.stringify({summary,out},null,1));
console.log(JSON.stringify(summary));
