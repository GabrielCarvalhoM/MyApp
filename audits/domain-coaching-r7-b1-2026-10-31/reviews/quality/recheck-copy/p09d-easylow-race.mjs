// Q-R7B recheck probe 09d: EASY_LOW, 3 run days, 10K: why no graduation in 16 executed weeks (block-review disclosures and executed minutes).
import fs from 'node:fs';
import {program,weekly} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const t={p:program({id:'p09d',goals:{run:'RACE',strength:'NONE'},event:{kind:'10K',date:'2027-02-14'},runExperience:'INTERMEDIATE',recent:{runDaysPerWeek:1,runMinutesPerWeek:50,longestRunMinutes:30},schedule:{strengthDays:[],runDays:[1,3,6],longRunDay:6,runMinutes:60},weeks:16}),ledger:[]};
const rows=[];for(let w=0;w<16;w++){const r=weekly(t,w);rows.push({w,phase:t.p.weeks[w].phase,min:t.p.weeks[w].plannedRunMinutes,action:r.action,disc:(r.disclosures??[]).filter(d=>/RUN_QUALITY/.test(d.id)).map(d=>d.id+(d.weeks?':'+JSON.stringify(d.weeks):''))});}
fs.writeFileSync(new URL('./out/p09d-easylow-race.json',import.meta.url),JSON.stringify(rows,null,1));
for(const r of rows)console.log(JSON.stringify(r).slice(0,300));
