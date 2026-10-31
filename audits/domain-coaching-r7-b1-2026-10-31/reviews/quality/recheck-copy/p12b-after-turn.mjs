// Q-R7B recheck probe 12b: after the week-13 turn, the slot that held an accepted ladder step: never the rung below (bird-dog -> dead-bug case).
import fs from 'node:fs';
import {program,review,obs,live,evaluateProgram,opts} from '../../../../../CoachingCore/r7/b/fixtures/helpers.mjs';
const step=(t,w,choices)=>evaluateProgram(t.p,{...review(t.p,w,{observations:t.p.weeks[w].sessions.filter(live).map(s=>obs(t.p,s)),...(choices?{choices}:{})}),actualLedger:t.ledger},opts);
const t={p:program({id:'p12-dead-bug',weeks:16,rotation:'COACH_DECIDES',equipment:[],goals:{run:'PERFORMANCE',strength:'GENERAL'},knownExercises:[{id:'bird-dog',familiar:true,current:true,tolerated:true,observedAt:'2026-10-29'}]}),ledger:[]};
for(let w=0;w<16;w++){let r=step(t,w);if(w===4){const r2=step(t,w,[{type:'LADDER_STEP',from:'bird-dog',to:'dead-bug'}]);if(r2.status!=='ASK')r=r2;}t.ledger=r.actualLedger??t.ledger;if(r.proposal)t.p=r.proposal;}
const trunk=w=>t.p.weeks[w].sessions.filter(live).flatMap(s=>(s.prescription.exercises??[]).filter(e=>['dead-bug','bird-dog','front-plank','side-plank','pallof-press','dead-bug-practice'].includes(e.id)).map(e=>s.role+':'+e.id));
const out=Object.fromEntries([3,4,5,12,13,14].map(w=>['w'+w,trunk(w)]));
fs.writeFileSync(new URL('./out/p12b-after-turn.json',import.meta.url),JSON.stringify(out,null,1));console.log(JSON.stringify(out));
