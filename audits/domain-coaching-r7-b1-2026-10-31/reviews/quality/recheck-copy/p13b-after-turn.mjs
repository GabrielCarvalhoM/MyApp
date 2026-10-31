// Q-R7B recheck probe 13b: what fills the pull-up slot after the week-13 rotation turn (COACH_DECIDES) once the accepted step held.
import fs from 'node:fs';
import {program,review,obs,live,evaluateProgram,opts} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const step=(t,w,choices)=>evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s)),...(choices?{choices}:{})}),actualLedger:t.ledger},opts);
const out={};
for(const rotation of ['COACH_DECIDES','EVERY_6_WEEKS']){
 const t={p:program({id:'p13b-'+rotation,weeks:16,rotation,equipment:['BANDS','PULL_UP_BAR'],goals:{run:'PERFORMANCE',strength:'GENERAL'},strengthExperience:'INTERMEDIATE',schedule:{strengthDays:[0,2,4,5]}}),ledger:[]};
 for(let w=0;w<16;w++){let r=step(t,w);if(w===4){const r2=step(t,w,[{type:'LADDER_STEP',from:'band-assisted-pull-up',to:'pull-up'}]);if(r2.status!=='ASK')r=r2;}t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;}
 out[rotation]=Object.fromEntries([8,12,13,14].map(w=>['w'+w,t.p.weeks[w].sessions.filter(s=>s.role==='STRENGTH_UPPER'&&live(s)).flatMap(s=>s.prescription.exercises.map(e=>e.id+'/'+e.role+'/'+(e.load?.mode??'')))]));
}
fs.writeFileSync(new URL('./out/p13b-after-turn.json',import.meta.url),JSON.stringify(out,null,1));
console.log(JSON.stringify(out,null,1));
