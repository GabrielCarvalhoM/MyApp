// Q-R7B probe 17: MOVEMENT_PATTERN_UNAVAILABLE for a bodyweight-only athlete (4 strength days): which patterns it names, why they are
// missing (equipment or skill), and whether its option ('Add a band or bar') would supply them. Output: out/p17-pattern-disclosure.json
import fs from 'node:fs';
import {intake,opts,generateProgram} from './lib.mjs';
const out=[];
for(const exp of ['NOVICE','INTERMEDIATE'])for(const eq of [[],['BANDS','PULL_UP_BAR']]){
 const p=generateProgram(intake({id:'p17'+exp,goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:exp,equipment:eq,schedule:{strengthDays:[0,2,4,5]}}),opts).program;
 const d=p.negotiation.find(n=>n.id==='MOVEMENT_PATTERN_UNAVAILABLE');
 out.push({exp,equipment:eq,strengthClass:p.capability.strength.class,disclosure:d??null,templates:p.templates.map(t=>({t:t.templateId,rows:t.rows.map(r=>r.slotPattern+':'+r.entry.id+'/'+r.role),missing:t.missingPatterns}))});
}
fs.writeFileSync(new URL('./out/p17-pattern-disclosure.json',import.meta.url),JSON.stringify(out,null,1));
for(const x of out)console.log(x.exp,JSON.stringify(x.equipment),x.strengthClass,'|',x.disclosure?JSON.stringify({patterns:x.disclosure.patterns,detail:x.disclosure.detail,options:x.disclosure.options}):'no disclosure','|',JSON.stringify(x.templates.find(t=>t.t==='TPL.UPPER')));
