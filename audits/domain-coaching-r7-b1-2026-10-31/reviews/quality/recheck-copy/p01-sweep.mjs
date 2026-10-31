// Q-R7B probe 01: generateProgram sweep over onboarding-like inputs (goals x experience x equipment x strength days x run class).
// Output: probes/out/p01-sweep.json (first witness input of every family, configuration, template, archetype observed).
import fs from 'node:fs';
import {newAcc,tryGen,ser,PROFILES,DAYSETS,CATALOG} from './lib.mjs';
const acc=newAcc(),t0=Date.now();
const RUN_GOALS=[['NONE',null],['GENERAL',null],['REGULAR',null],['PERFORMANCE',null],['RACE',{kind:'10K',date:'2027-01-17'}],['RACE',{kind:'HALF_MARATHON',date:'2027-01-17'}],['PERFORMANCE',{kind:'5K',date:'2027-01-17'}]];
const STR_GOALS=['NONE','GENERAL','MAINTAIN','STRENGTH','HYPERTROPHY','RUNNING_SUPPORT'];
const EXP=['NONE','NOVICE','INTERMEDIATE','EXPERIENCED'];
const EQUIP={...PROFILES,DB_BANDS:['DUMBBELLS','BANDS'],DB_BAR:['DUMBBELLS','PULL_UP_BAR'],BARBELL_RACK_BENCH:['BARBELL','RACK','BENCH'],KB_BANDS:['KETTLEBELL','BANDS'],BANDS_BAR_DB_BENCH:['BANDS','PULL_UP_BAR','DUMBBELLS','BENCH']};
const RECENT={
 WALK_JOG:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0,strengthDaysPerWeek:0},
 EASY_LOW:{runDaysPerWeek:1,runMinutesPerWeek:50,longestRunMinutes:30,strengthDaysPerWeek:1},
 EASY_CURRENT:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:60,strengthDaysPerWeek:2},
};
const quick=process.argv[2]==='quick';
for(const [rg,ev] of RUN_GOALS)for(const sg of STR_GOALS){
 if(rg==='NONE'&&sg==='NONE')continue;
 for(const exp of EXP)for(const [eqName,eq] of Object.entries(EQUIP))for(const nd of (sg==='NONE'?[2]:[1,2,3,4,5]))for(const [rc,recent] of Object.entries(rg==='NONE'?{EASY_CURRENT:RECENT.EASY_CURRENT}:RECENT)){
  if(quick&&(nd!==2||rc!=='EASY_CURRENT'))continue;
  const strengthDays=sg==='NONE'?[]:DAYSETS[nd],runDays=rg==='NONE'?[]:[1,3,6];
  const label=`run=${rg}${ev?'/'+ev.kind:''} str=${sg} exp=${exp} eq=${eqName} days=${nd} recent=${rc}`;
  tryGen({id:'p01',weeks:16,goals:{run:rg,strength:sg},event:ev,runExperience:exp==='NONE'?'NOVICE':exp,strengthExperience:exp,recent,equipment:eq,schedule:{runDays,strengthDays,...(rg==='NONE'?{longRunDay:null,runMinutes:undefined,longRunMinutes:undefined}:{})}},acc,label);
 }
}
const out=ser(acc);out.ms=Date.now()-t0;
const all=CATALOG.strength.configurations.map(c=>c.id);
out.configsNotSeen=all.filter(id=>!acc.configs.has(id));
out.runFamiliesNotSeen=CATALOG.run.families.map(f=>f.id).filter(id=>!acc.runFamilies.has(id));
out.templatesNotSeen=CATALOG.strength.templates.map(t=>t.id).filter(id=>!acc.templates.has(id));
out.archetypesNotSeen=CATALOG.archetypes.items.map(a=>a.id).filter(id=>!acc.archetypes.has(id));
fs.mkdirSync(new URL('./out/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL(`./out/p01-sweep${quick?'-quick':''}.json`,import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({n:acc.n,ms:out.ms,statuses:out.statuses,configsSeen:acc.configs.size,configsNotSeen:out.configsNotSeen,runFamilies:[...acc.runFamilies.keys()],runFamiliesNotSeen:out.runFamiliesNotSeen,templates:[...acc.templates.keys()],templatesNotSeen:out.templatesNotSeen,archetypes:[...acc.archetypes.keys()],archetypesNotSeen:out.archetypesNotSeen,overlays:[...acc.overlays.keys()],disclosures:[...acc.disclosures.keys()]},null,1));
