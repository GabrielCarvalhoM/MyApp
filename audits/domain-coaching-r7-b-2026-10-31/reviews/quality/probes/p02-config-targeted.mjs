// Q-R7B probe 02: per-configuration targeted reachability through generateProgram. For each of the 76 configurations, search
// onboarding-like inputs cheapest-first (its own equipment, then the full gym; unfamiliar, then declared familiar) and stop at the first
// program that prescribes it. Records the first witness, whether familiarity was needed and the roles seen. Output: out/p02-config-targeted.json
import fs from 'node:fs';
import {newAcc,collect,intake,opts,generateProgram,PROFILES,DAYSETS,CATALOG} from './lib.mjs';
const t0=Date.now(),res={};
const RUNS=[['NONE',null],['PERFORMANCE',null],['RACE',{kind:'HALF_MARATHON',date:'2027-01-17'}]];
const SG=['GENERAL','STRENGTH','HYPERTROPHY','RUNNING_SUPPORT','MAINTAIN'];
const EXP=['NONE','NOVICE','INTERMEDIATE'];
const fam=id=>({id,familiar:true,current:true,tolerated:true,observedAt:'2026-10-29'});
const only=process.argv[2]?process.argv[2].split(','):null;
for(const c of CATALOG.strength.configurations){
 if(only&&!only.includes(c.id))continue;
 const eqMin=c.eq.filter(q=>q!=='BODYWEIGHT');
 let hit=null,tries=0;const roles=new Set();
 outer:for(const familiar of [false,true])for(const [eqName,eq] of [['own',eqMin],['FULL_GYM',PROFILES.FULL_GYM]])for(const exp of EXP)for(const sg of SG)for(const nd of [2,4,5,3,1])for(const [rg,ev] of RUNS){
  tries++;
  const o={id:'p02',weeks:16,goals:{run:rg,strength:sg},event:ev,runExperience:'INTERMEDIATE',strengthExperience:exp,equipment:eq,knownExercises:familiar?[fam(c.id)]:[],schedule:{runDays:rg==='NONE'?[]:[1,3,6],strengthDays:DAYSETS[nd]}};
  const g=generateProgram(intake(o),opts);if(!g.program)continue;
  const acc=newAcc();collect(acc,g.program,'x');
  for(const k of acc.configRoles.keys()){const [id,role]=k.split('|');if(id===c.id)roles.add(role);}
  if(acc.configs.has(c.id)){hit={familiar,equipment:eqName,eq,strengthExperience:exp,strengthGoal:sg,days:nd,run:rg+(ev?'/'+ev.kind:''),roles:[...roles]};break outer;}
 }
 res[c.id]={origin:c.origin,skill:c.skill,roles:c.roles,eq:c.eq,pattern:c.pattern,sub:c.sub,reachable:!!hit,tries,witness:hit};
}
const unreachable=Object.entries(res).filter(([,v])=>!v.reachable).map(([k])=>k),familiarOnly=Object.entries(res).filter(([,v])=>v.reachable&&v.witness.familiar).map(([k])=>k);
const out={ms:Date.now()-t0,reachable:Object.values(res).filter(v=>v.reachable).length,total:Object.keys(res).length,unreachable,familiarOnly,res};
fs.mkdirSync(new URL('./out/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL(`./out/p02-config-targeted${only?'-partial':''}.json`,import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify({ms:out.ms,reachable:out.reachable,total:out.total,unreachable,familiarOnly},null,1));
