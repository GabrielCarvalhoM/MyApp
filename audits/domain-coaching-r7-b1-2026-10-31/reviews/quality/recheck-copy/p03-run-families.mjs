// Q-R7B probe 03: run family and run configuration reachability, through generateProgram and then weekly reviews (executed as
// prescribed, compatible responses) across the horizon. Records, per scenario, what the program prescribes at generation and what the
// reviewed proposals prescribe after it, with the review actions seen. Output: out/p03-run-families.json
import fs from 'node:fs';
import {program,weekly,reviewed} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {newAcc,collect,ser,CATALOG} from './lib.mjs';
const RUN_ONLY={goals:{run:'PERFORMANCE',strength:'NONE'},schedule:{strengthDays:[]}};
const BOUTS_TASK={category:'VO2_STYLE',current:true,familiar:true,tolerated:true,observedAt:'2026-10-28',prescription:{modality:'RUN',family:'VO2_STYLE_INTERVALS',durationMinutes:40,warmupMinutes:12,cooldownMinutes:8,work:{repetitions:4,workMinutes:3,recoveryMinutes:2}},target:{method:'PACE',construct:'FIELD_SESSION_TARGET',paceSecondsPerKm:255,provenance:'Athlete report of the last three sessions'},history:{sameTaskExposures:6,response:'TOLERATED'},conditions:{comparable:true}};
const THR_TASK={current:true,familiar:true,tolerated:true,observedAt:'2026-10-28',prescription:{modality:'RUN',family:'THRESHOLD',durationMinutes:45,warmupMinutes:12,cooldownMinutes:8,work:{repetitions:3,workMinutes:6,recoveryMinutes:2}},target:{method:'PACE',construct:'FIELD_SESSION_TARGET',paceSecondsPerKm:290,provenance:'Athlete report'},history:{sameTaskExposures:4,response:'TOLERATED'},conditions:{comparable:true}};
const S={
 walkJog:{id:'q3-wj',...RUN_ONLY,runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0},schedule:{strengthDays:[],runMinutes:45},weeks:16},
 walkJogIntermediate:{id:'q3-wj2',...RUN_ONLY,runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:40,longestRunMinutes:12},schedule:{strengthDays:[],runMinutes:45},weeks:16},
 tooManyDays:{id:'q3-walk',...RUN_ONLY,recent:{runDaysPerWeek:1,runMinutesPerWeek:50,longestRunMinutes:30},schedule:{strengthDays:[],runDays:[0,1,2,3,4,5,6],longRunDay:6},weeks:12},
 easyLow:{id:'q3-low',...RUN_ONLY,recent:{runDaysPerWeek:1,runMinutesPerWeek:50,longestRunMinutes:30},weeks:16},
 restart:{id:'q3-restart',...RUN_ONLY,pause:{nonclinical:true,weeks:6,reason:'work travel',reasonCategory:'TRAVEL'},weeks:12},
 bouts:{id:'q3-bouts',...RUN_ONLY,recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:70},knownRuns:[BOUTS_TASK],schedule:{strengthDays:[],runDays:[1,3,5,6]},weeks:12},
 familiarThreshold:{id:'q3-thr',...RUN_ONLY,recent:{runDaysPerWeek:4,runMinutesPerWeek:180,longestRunMinutes:70},knownRuns:[THR_TASK],schedule:{strengthDays:[],runDays:[1,3,5,6]},weeks:12},
 tenK:{id:'q3-10k',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'10K',date:'2027-01-24'},recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:75},schedule:{runDays:[1,3,5,6],longRunMinutes:120},weeks:16},
 half:{id:'q3-half',goals:{run:'RACE',strength:'GENERAL'},event:{kind:'HALF_MARATHON',date:'2027-01-31'},recent:{runDaysPerWeek:4,runMinutesPerWeek:200,longestRunMinutes:75},schedule:{runDays:[1,3,5,6],longRunMinutes:120},weeks:16},
 halfAmbitious:{id:'q3-half-amb',goals:{run:'RACE',strength:'NONE'},event:{kind:'HALF_MARATHON',date:'2026-12-20'},runExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:50,longestRunMinutes:25},schedule:{strengthDays:[],runDays:[1,3,6],longRunMinutes:60},weeks:12},
};
const out={},t0=Date.now();
for(const [name,o] of Object.entries(S)){
 const gen=newAcc(),rev=newAcc(),actions={};let error=null;
 try{
  const p=program(o);collect(gen,p,name);
  const t={p,ledger:[]};
  for(let w=0;w<p.weeksCount;w++){try{const r=weekly(t,w);actions[r.action??r.status]=(actions[r.action??r.status]??0)+1;collect(rev,t.p,name+'@w'+w);}catch(e){error=`week ${w}: ${e.message.slice(0,200)}`;break;}}
  out[name]={class:p.capability.run.class,generated:{families:[...gen.runFamilies.keys()],configs:[...gen.runConfigs.keys()]},afterReviews:{families:[...rev.runFamilies.keys()],configs:[...rev.runConfigs.keys()]},actions,error,negotiation:(p.negotiation??[]).map(n=>n.id)};
 }catch(e){out[name]={error:e.message.slice(0,300)};}
}
const allFam=new Set(),allCfg=new Set();for(const v of Object.values(out)){for(const k of ['generated','afterReviews']){(v[k]?.families??[]).forEach(x=>allFam.add(x));(v[k]?.configs??[]).forEach(x=>allCfg.add(x));}}
const catalogCfg=CATALOG.run.families.flatMap(f=>f.configurations.map(c=>c.id));
const res={ms:Date.now()-t0,familiesSeen:[...allFam],familiesNotSeen:CATALOG.run.families.map(f=>f.id).filter(x=>!allFam.has(x)),runConfigsSeen:[...allCfg],runConfigsNotSeen:catalogCfg.filter(x=>!allCfg.has(x)),scenarios:out};
fs.mkdirSync(new URL('./out/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('./out/p03-run-families.json',import.meta.url),JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
