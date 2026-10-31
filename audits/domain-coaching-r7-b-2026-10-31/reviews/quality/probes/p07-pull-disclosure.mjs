// Q-R7B probe 07: the PULL_LIMITED_FOR_EQUIPMENT disclosure against the equipment that triggers it (catalog strength.pullCoverage, B0-C09):
// what the disclosure says and offers, and whether its option would change anything, per equipment profile and strength experience.
import fs from 'node:fs';
import {intake,opts,generateProgram,PROFILES} from './lib.mjs';
const out=[];
for(const [name,eq] of Object.entries({...PROFILES,KETTLEBELL_BAR:['KETTLEBELL','PULL_UP_BAR']}))for(const exp of ['NOVICE','INTERMEDIATE','EXPERIENCED'])for(const nd of [2,4]){
 const g=generateProgram(intake({id:'p07',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:exp,equipment:eq,schedule:{strengthDays:nd===2?[0,4]:[0,2,4,5]}}),opts);
 const p=g.program;const d=(p?.negotiation??[]).find(n=>n.id==='PULL_LIMITED_FOR_EQUIPMENT');
 const pullRows=p?p.templates.flatMap(t=>t.rows.filter(r=>r.slotPattern==='PULL').map(r=>`${t.templateId}:${r.entry.id}/${r.role}${r.coverage?'/LIMITED':''}`)):[];
 // Would the first option change the outcome? Add bands (and a bar) and regenerate.
 let withBandBar=null;if(d){const q=generateProgram(intake({id:'p07',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:exp,equipment:[...new Set([...eq,'BANDS','PULL_UP_BAR'])],schedule:{strengthDays:nd===2?[0,4]:[0,2,4,5]}}),opts).program;withBandBar={stillLimited:!!(q.negotiation??[]).find(n=>n.id==='PULL_LIMITED_FOR_EQUIPMENT'),pullRows:q.templates.flatMap(t=>t.rows.filter(r=>r.slotPattern==='PULL').map(r=>`${t.templateId}:${r.entry.id}/${r.role}`))};}
 out.push({profile:name,equipment:eq,exp,days:nd,disclosed:!!d,detail:d?.detail??null,options:d?.options??null,pullRows,withBandBar});
}
fs.writeFileSync(new URL('./out/p07-pull-disclosure.json',import.meta.url),JSON.stringify(out,null,1));
for(const x of out)if(x.disclosed||x.profile.includes('BAR'))console.log(JSON.stringify({profile:x.profile,exp:x.exp,days:x.days,disclosed:x.disclosed,pullRows:x.pullRows,options:x.options,detail:x.detail?.slice(0,90),withBandBar:x.withBandBar}));
