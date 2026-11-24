// QRE FPV R1, probe p02: mutants of the two candidate fixes, each run against the two new test files and the boundary tests of the line.
//   node p02-mutants.mjs <scratch-copy> [--wide] [--only=V2,V3]     (never on the author's worktree: it rewrites src files and restores them)
// A mutant is KILLED when any selected test file fails with it; SURVIVED otherwise. The source is restored after every mutant.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const [,,ROOT,...flags]=process.argv,CC=path.join(ROOT,'CoachingCore');
const V='src/boundary/views.mjs',C='src/boundary/custody.mjs';
const AHEAD="ahead=readableF08(f08,{athleteId:doc.athleteId,at:Infinity}).filter(o=>o.fact===ERASED_F08&&!asOf.includes(o))";
const M=[
 ['V1 drop the ahead markers',V,"holds=standingHolds([...asOf,...ahead]).holds","holds=standingHolds(asOf).holds"],
 ['V2 ahead: every fact type, not only erasures',V,AHEAD,"ahead=readableF08(f08,{athleteId:doc.athleteId,at:Infinity}).filter(o=>!asOf.includes(o))"],
 ['V3 read everything at Infinity',V,"holds=standingHolds([...asOf,...ahead]).holds","holds=standingHolds(readableF08(f08,{athleteId:doc.athleteId,at:Infinity})).holds"],
 ['V4 ahead markers first (order)',V,"standingHolds([...asOf,...ahead])","standingHolds([...ahead,...asOf])"],
 ['C1 REBINDING + sessionType',C,"const REBINDING=['mode','phaseClass'];","const REBINDING=['mode','phaseClass','sessionType'];"],
 ['C2 REBINDING + plannedMinutes',C,"const REBINDING=['mode','phaseClass'];","const REBINDING=['mode','phaseClass','plannedMinutes'];"],
 ['C3 REBINDING + sessionId,sport',C,"const REBINDING=['mode','phaseClass'];","const REBINDING=['mode','phaseClass','sessionId','sport'];"],
 ['C4 REBINDING only mode',C,"const REBINDING=['mode','phaseClass'];","const REBINDING=['mode'];"],
 ['C5 REBINDING only phaseClass',C,"const REBINDING=['mode','phaseClass'];","const REBINDING=['phaseClass'];"],
 ['C6 no typeof check',C,"||REBINDING.some(k=>typeof y.context[k]!=='string')",""],
 ['C7 asRecorded returns y unconditionally',C,"const y=asRecorded(x,found);","const y=found;"],
 ['C8 asRecorded keeps the engine context',C,"return {...y,context:x.context};};","return y;};"],
 ['C9 no omit comparison (any context accepted)',C,"if(digest(omit(x.context,REBINDING))!==digest(omit(y.context,REBINDING))||REBINDING.some(k=>typeof y.context[k]!=='string'))return y;",""],
 ['C10 facts not excluded',C,"||x.fact||y.fact||!isObj(x.context)","||!isObj(x.context)"],
 ['C11 whole context replaced by recorded (not only when keys match)',C,"if(!isObj(x)||!isObj(y)||x.fact||y.fact||!isObj(x.context)||!isObj(y.context)||digest(x.context)===digest(y.context))return y;","if(!isObj(x)||!isObj(y)||x.fact||y.fact||!isObj(x.context)||!isObj(y.context))return y;return {...y,context:x.context};"],
];
const files=['test/v1final-sec-bc-r2-01.test.mjs','test/v1final-fpv-01.test.mjs',...(flags.includes('--wide')?fs.readdirSync(path.join(CC,'test')).filter(f=>/^v1(int|bc)-.*\.test\.mjs$/.test(f)&&f!=='v1bc-rc-record.test.mjs').map(f=>'test/'+f):[])];
const run=()=>{const r=spawnSync(process.execPath,['--test','--test-reporter=tap','--test-concurrency=4',...files],{cwd:CC,encoding:'utf8',maxBuffer:1<<28});
 const fails=[...r.stdout.matchAll(/^not ok \d+ - (.*)$/gm)].map(m=>m[1]);return {code:r.status,fails};};
const base=run();console.log(JSON.stringify({files:files.length,baseline:{exit:base.code,fails:base.fails}}));
const only=flags.find(f=>f.startsWith('--only='))?.slice(7).split(',');
for(const [name,file,from,to] of M){if(only&&!only.includes(name.split(' ')[0]))continue;const p=path.join(CC,file),src=fs.readFileSync(p,'utf8');
 if(src.split(from).length!==2){console.log(JSON.stringify({name,error:'anchor not found once'}));continue;}
 fs.writeFileSync(p,src.replace(from,to));let r;try{r=run();}finally{fs.writeFileSync(p,src);}
 const newFails=r.fails.filter(f=>!base.fails.includes(f));
 console.log(JSON.stringify({name,verdict:newFails.length?'KILLED':'SURVIVED',by:newFails.map(f=>f.slice(0,90))}));}
