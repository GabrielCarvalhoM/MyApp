// Q-R7B recheck probe 09c: the QUALITY_AFTER_EVIDENCE path stated per run class and run-day count, against whether a block review can
// actually graduate that athlete (16 weeks executed as prescribed). Output: out/p09c-quality-path.json
import fs from 'node:fs';
import {program,weekly} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const RECENT={WALK_JOG:{runDaysPerWeek:3,runMinutesPerWeek:40,longestRunMinutes:12},EASY_LOW:{runDaysPerWeek:1,runMinutesPerWeek:50,longestRunMinutes:30},EASY_UNKNOWN:{runDaysPerWeek:3,runMinutesPerWeek:null,longestRunMinutes:null}};
const out=[];
for(const [cls,recent] of Object.entries(RECENT))for(const runDays of [[1,3,6],[2,6]])for(const goal of ['PERFORMANCE','RACE']){
 const o={id:'p09c-'+cls+runDays.length+goal,goals:{run:goal,strength:'NONE'},...(goal==='RACE'?{event:{kind:'10K',date:'2027-02-14'}}:{}),runExperience:'INTERMEDIATE',recent,schedule:{strengthDays:[],runDays,longRunDay:runDays.at(-1),runMinutes:60},weeks:16};
 const t={p:program(o),ledger:[]};const red=t.p.feasibility.reductions.filter(r=>/QUALITY/.test(r.id)).map(r=>({id:r.id,path:r.path??null,detail:r.detail}));let grad=null;
 for(let w=0;w<16;w++){const r=weekly(t,w);if(r.action==='RUN_QUALITY_GRADUATION'&&grad===null)grad=w;}
 out.push({cls:t.p.capability.run.class,runDays:runDays.length,goal,reductions:red,graduatedAtWeek:grad});
}
fs.writeFileSync(new URL('./out/p09c-quality-path.json',import.meta.url),JSON.stringify(out,null,1));
for(const x of out)console.log(x.cls,x.runDays,x.goal,'grad',x.graduatedAtWeek,'|',x.reductions.map(r=>r.id+':'+(r.path??'-')).join(', '));
