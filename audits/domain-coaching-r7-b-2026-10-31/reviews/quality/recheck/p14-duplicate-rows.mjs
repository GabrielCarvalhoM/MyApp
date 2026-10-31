// Q-R7B probe 14: catalog templateRules.selection "a configuration is used at most once per session (R6 exclude-used)" against the
// sessions the runtime prescribes. Scans generated programs for any strength session that carries the same configuration twice.
// Output: out/p14-duplicate-rows.json
import fs from 'node:fs';
import {intake,opts,generateProgram,PROFILES,DAYSETS} from './lib.mjs';
const hits=new Map();let n=0,sessions=0;
for(const exp of ['NONE','NOVICE','INTERMEDIATE'])for(const sg of ['GENERAL','STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','MAINTAIN'])for(const [eqName,eq] of Object.entries(PROFILES))for(const nd of [1,2,3,4,5])for(const rg of ['PERFORMANCE','NONE']){
 const g=generateProgram(intake({id:'p14',weeks:12,goals:{run:rg,strength:sg},strengthExperience:exp,recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:exp==='NONE'?0:2},equipment:eq,schedule:{runDays:rg==='NONE'?[]:[1,3,6],longRunDay:rg==='NONE'?null:6,strengthDays:DAYSETS[nd]}}),opts);
 if(!g.program)continue;n++;
 for(const wk of g.program.weeks)for(const s of wk.sessions){if(s.sport!=='STRENGTH'||!s.prescription)continue;sessions++;const c={};for(const e of s.prescription.exercises??[])c[e.id]=(c[e.id]??0)+1;for(const [id,k] of Object.entries(c))if(k>1){const key=`${id} x${k} in ${s.role}`;if(!hits.has(key))hits.set(key,{count:0,first:{exp,sg,eq:eqName,days:nd,run:rg,week:wk.index,phase:wk.phase,rows:s.prescription.exercises.map(e=>e.id+'/'+e.role)}});hits.get(key).count++;}}
}
const out={programs:n,strengthSessions:sessions,duplicates:Object.fromEntries(hits)};
fs.writeFileSync(new URL('./out/p14-duplicate-rows.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
