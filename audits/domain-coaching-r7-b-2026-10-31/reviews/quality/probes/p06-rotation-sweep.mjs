// Q-R7B probe 06: generateProgram sweep with a rotating preference (EVERY_2_WEEKS, COACH_DECIDES, EVERY_6_WEEKS): configurations that
// enter only through calendar rotation in later weeks. Output: out/p06-rotation-sweep.json
import fs from 'node:fs';
import {newAcc,tryGen,ser,PROFILES,DAYSETS,CATALOG} from './lib.mjs';
const acc=newAcc(),byPref={},t0=Date.now();
const EQUIP={...PROFILES,DB_BANDS:['DUMBBELLS','BANDS'],DB_BAR:['DUMBBELLS','PULL_UP_BAR'],BARBELL_RACK_BENCH:['BARBELL','RACK','BENCH'],KB_BANDS:['KETTLEBELL','BANDS'],MACHINES:['MACHINES'],BANDS_BAR_DB_BENCH:['BANDS','PULL_UP_BAR','DUMBBELLS','BENCH']};
for(const rot of ['EVERY_2_WEEKS','COACH_DECIDES','EVERY_6_WEEKS']){
 const a=newAcc();
 for(const [rg,ev] of [['NONE',null],['PERFORMANCE',null],['RACE',{kind:'HALF_MARATHON',date:'2027-02-14'}]])for(const sg of ['GENERAL','MAINTAIN','STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'])for(const exp of ['NOVICE','INTERMEDIATE'])for(const [eqName,eq] of Object.entries(EQUIP))for(const nd of [1,2,3,4,5]){
  const label=`rot=${rot} run=${rg} str=${sg} exp=${exp} eq=${eqName} days=${nd}`;
  const o={id:'p06',weeks:16,rotation:rot,goals:{run:rg,strength:sg},event:ev,strengthExperience:exp,equipment:eq,schedule:{runDays:rg==='NONE'?[]:[1,3,6],strengthDays:DAYSETS[nd]}};
  tryGen(o,a,label);tryGen(o,acc,label);
 }
 byPref[rot]={n:a.n,configs:[...a.configs.keys()]};
}
const out=ser(acc);out.ms=Date.now()-t0;out.byPref=byPref;
out.configsNotSeen=CATALOG.strength.configurations.map(c=>c.id).filter(id=>!acc.configs.has(id));
fs.mkdirSync(new URL('./out/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('./out/p06-rotation-sweep.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({n:acc.n,ms:out.ms,statuses:out.statuses,configsSeen:acc.configs.size,configsNotSeen:out.configsNotSeen},null,1));
