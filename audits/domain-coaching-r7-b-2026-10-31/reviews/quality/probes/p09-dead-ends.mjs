// Q-R7B probe 09: run-quality dead ends and graduation disclosure promises.
// (a) EASY_UNKNOWN (recent running minutes not reported) with a PERFORMANCE or RACE goal, executed as prescribed for 16 weeks: does any
//     quality family ever become reachable? (handoff section 5 declares no graduation path for EASY_UNKNOWN.)
// (b) NOVICE-labelled WALK_JOG starter executed as prescribed for 16 and 24 weeks: is the graduation ever reached?
// (c) After RUN_QUALITY_GRADUATION: does the introduced session carry the promised equal easy alternative (RUN_QUALITY_INTRODUCED options)?
import fs from 'node:fs';
import {program,weekly} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
import {runRepertoireOf} from '../../../../../CoachingCore/src/r7b-repertoire.mjs';
const fams=p=>[...new Set(p.weeks.flatMap(w=>w.sessions.filter(s=>s.prescription?.modality==='RUN').map(s=>runRepertoireOf(s.prescription)?.family)))];
function run(o){const t={p:program(o),ledger:[]};const cls=t.p.capability.run.class,acts=[],seen=new Set();let grad=null;
 for(let w=0;w<t.p.weeksCount;w++){let r;try{r=weekly(t,w);}catch(e){acts.push('ERR:'+e.message.slice(0,120));break;}acts.push(r.action);fams(t.p).forEach(f=>seen.add(f));if(r.action==='RUN_QUALITY_GRADUATION'&&!grad)grad={week:w,disclosure:(r.disclosures??[]).find(d=>d.id==='RUN_QUALITY_INTRODUCED')??null,introduced:t.p.weeks[w+1]?.sessions.filter(s=>s.role==='QUALITY').map(s=>({family:s.prescription.family,optional:s.optional,alternative:s.alternative??s.prescription.alternative??null,keys:Object.keys(s).concat(Object.keys(s.prescription)).filter(k=>/altern|option|choice/i.test(k))}))};}
 return {class:cls,mode0:t.p.stateTrace[0].run.mode,familiesSeen:[...seen],graduation:grad,actions:acts.join(',')};}
const RUN_ONLY={goals:{run:'PERFORMANCE',strength:'NONE'}};
const out={
 easyUnknownPerformance:run({id:'q9-eu',...RUN_ONLY,recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null},schedule:{strengthDays:[],runMinutes:60},weeks:16}),
 easyUnknownPerformanceExperienced:run({id:'q9-eu2',...RUN_ONLY,runExperience:'EXPERIENCED',recent:{runDaysPerWeek:4,runMinutesPerWeek:null,longestRunMinutes:null},schedule:{strengthDays:[],runDays:[1,3,5,6],runMinutes:60},weeks:16}),
 easyUnknownRace:run({id:'q9-eu3',goals:{run:'RACE',strength:'NONE'},event:{kind:'10K',date:'2027-02-14'},recent:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null},schedule:{strengthDays:[],runMinutes:60},weeks:16}),
 walkJogNovice16:run({id:'q9-wj16',...RUN_ONLY,runExperience:'NOVICE',recent:{runDaysPerWeek:0,runMinutesPerWeek:0,longestRunMinutes:0},schedule:{strengthDays:[],runMinutes:45},weeks:16}),
 walkJogIntermediate:run({id:'q9-wji',...RUN_ONLY,runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:3,runMinutesPerWeek:40,longestRunMinutes:12},schedule:{strengthDays:[],runMinutes:45},weeks:16}),
};
fs.writeFileSync(new URL('./out/p09-dead-ends.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
