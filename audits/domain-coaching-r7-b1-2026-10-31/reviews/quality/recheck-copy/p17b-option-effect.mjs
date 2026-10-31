// Q-R7B recheck probe 17b: does following MOVEMENT_PATTERN_UNAVAILABLE's 'Add equipment for PUSH' (dumbbells) close the PUSH gap for a novice with bands and a bar?
import fs from 'node:fs';
import {intake,opts,generateProgram} from './lib.mjs';
const run=eq=>{const p=generateProgram(intake({id:'p17b',goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'NOVICE',equipment:eq,schedule:{strengthDays:[0,2,4,5]}}),opts).program;return {equipment:eq,disclosure:p.negotiation.find(n=>n.id==='MOVEMENT_PATTERN_UNAVAILABLE')??null,upper:p.templates.find(t=>t.templateId==='TPL.UPPER').rows.map(r=>r.slotPattern+':'+r.entry.id)};};
const out=[run(['BANDS','PULL_UP_BAR']),run(['BANDS','PULL_UP_BAR','DUMBBELLS'])];
fs.writeFileSync(new URL('./out/p17b-option-effect.json',import.meta.url),JSON.stringify(out,null,1));console.log(JSON.stringify(out));
