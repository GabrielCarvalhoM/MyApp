// R7-A check of CQ-R6-06 (race day at race effort with strides for athletes whose plan built only walk/jog or a restart) on a runtime.
// R7A_RUNTIME=pre runs the R6 closure snapshot. Development authority; engineering evidence only.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const base=process.env.R7A_RUNTIME==='pre'?path.resolve(import.meta.dirname,'../pre-r7a-source/CoachingCore'):path.resolve(import.meta.dirname,'../../../CoachingCore');
const {generateProgram}=await import(pathToFileURL(path.join(base,'src/r6-index.mjs')).href),{devAuthority}=await import(pathToFileURL(path.join(base,'r6/fixtures/dev-authority.mjs')).href);
const opts={authority:devAuthority()},addDays=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const elig=d=>({status:'NONCLINICAL_CONFIRMED',assessedAt:d,pain:false,persistentPain:false,injury:false,illness:false,functionalLimitation:false,clinicalConcern:false});
const cases={
 neverRunner10K:{runExperience:'NONE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0}},
 walkJogNovice10K:{runExperience:'NOVICE',recent:{runDaysPerWeek:2,runMinutesPerWeek:20,longestRunMinutes:8}},
 restartAfterPause10K:{runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0},pause:{nonclinical:true,weeks:11,reasonCategory:'WORK',reason:'Work'}},
 easyRunnerHalf:{runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:150,longestRunMinutes:70}}
};
const out={probe:'R7A-CQ-R6-06',runtime:process.env.R7A_RUNTIME==='pre'?'PRE_R7A':'CURRENT',cases:{}};
for(const [name,athlete] of Object.entries(cases)){
 const kind=name.endsWith('Half')?'HALF_MARATHON':'10K';
 const g=generateProgram({version:'R6-INTAKE-1',synthetic:true,purpose:'SHADOW_REFERENCE',asOf:'2026-11-01',startDate:'2026-11-02',weeks:16,learningConsent:true,athlete:{id:'cq06-'+name,ageEligible:true,eligibility:elig('2026-11-01'),goals:{run:{kind:'RACE',event:{kind,date:addDays('2026-11-02',14*7+6)}},strength:'GENERAL'},strengthExperience:'NOVICE',equipment:['BODYWEIGHT'],...athlete},schedule:{runDays:[1,3,6],strengthDays:[2],runTurn:'AM',strengthTurn:'PM',runMinutes:60,strengthMinutes:30,longRunDay:6,longRunMinutes:90}},opts);
 if(!g.program){out.cases[name]={status:g.status,reason:g.reason};continue;}
 const P=g.program,race=P.weeks[P.phases.raceWeek].sessions.find(s=>s.role==='RACE'),built=[...new Set(P.stateTrace.slice(0,P.phases.raceWeek).map(s=>s.run.mode))];
 // A completion race day says "no strides"; strides are prescribed only by a positive warm-up instruction.
 const ins=race.prescription.instructions??[],completion=race.prescription.completion===true,strides=ins.some(x=>/strides/i.test(x)&&!/no strides/i.test(x));
 out.cases[name]={runModesBeforeRace:built,raceCompletion:completion,raceStrides:strides,effort:race.prescription.effort??null,item:g.negotiation.find(n=>n.id==='EVENT_AMBITIOUS_FOR_CURRENT_RUNNING')?.basis??null,
  defectReproduced:built.some(m=>['WALK_JOG','RESTART'].includes(m))&&(!completion||strides)};
}
out.reproduced=Object.values(out.cases).some(c=>c.defectReproduced);
fs.writeFileSync(path.join(import.meta.dirname,process.env.R7A_PROBE_OUT??'r7a-cq06-probe.out.json'),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({reproduced:out.reproduced,cases:Object.fromEntries(Object.entries(out.cases).map(([k,v])=>[k,v.status??`${v.runModesBeforeRace?.join('+')} completion=${v.raceCompletion} strides=${v.raceStrides}`]))}));
