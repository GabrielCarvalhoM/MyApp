// QRE V1STR R1: mutation driver. node mutate.mjs <slot-root> <slotIndex> <slotCount> <out.json>
// For each mutant of this slot: check the old text occurs exactly once in the clean file, write the mutant, run the 47 own tests (tap), record the
// failing test names, write the clean bytes back. Scratch clones only.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {MUTANTS} from './r2-mutants.mjs';
const [ROOT,slot,count,OUT]=process.argv.slice(2);
if(!/scratchpad[\\/]qre-v1str[\\/]r2-mut-\d$/.test(ROOT))throw new Error('scratch mutation slot only: '+ROOT);
const control0=Number(process.env.QRE_OWN_TESTS);if(!Number.isInteger(control0)||control0<1)throw new Error('QRE_OWN_TESTS: the green control count');
const TESTS=['test/v1str-extension.test.mjs','test/v1str-preservation.test.mjs','test/v1str-exposure.test.mjs','test/v1str-time.test.mjs'];
const run=()=>{const r=spawnSync(process.execPath,['--test','--test-reporter=tap',...TESTS],{cwd:path.join(ROOT,'CoachingCore'),encoding:'utf8',maxBuffer:1<<28,timeout:900000});
 const out=String(r.stdout??'');const failed=[...out.matchAll(/^not ok \d+ - (.*)$/gm)].map(m=>m[1].replace(/\s+#.*$/,'').trim());
 const n=k=>{const m=out.match(new RegExp(`^# ${k} (\\d+)$`,'m'));return m?Number(m[1]):null;};return {tests:n('tests'),pass:n('pass'),fail:n('fail'),failed,timedOut:r.error?.code==='ETIMEDOUT'};};
const results=[];
const mine=MUTANTS.filter((_,i)=>i%Number(count)===Number(slot));
const control=MUTANTS.length&&slot==='0'?run():null;if(control)results.push({id:'CONTROL',...control});
for(const m of mine){
 const f=path.join(ROOT,m.file),clean=fs.readFileSync(f,'utf8'),n=clean.split(m.old).length-1;
 if(n!==1){results.push({id:m.id,what:m.what,invalid:`old text occurs ${n} times`});continue;}
 fs.writeFileSync(f,clean.replace(m.old,()=>m.new));
 const t0=Date.now();let r;try{r=run();}finally{fs.writeFileSync(f,clean);}
 results.push({id:m.id,file:m.file,what:m.what,ms:Date.now()-t0,...r,killed:(r.fail??0)>0||r.tests!==control0||r.timedOut});
 fs.writeFileSync(OUT,JSON.stringify(results,null,1));
}
fs.writeFileSync(OUT,JSON.stringify(results,null,1));
console.log('slot',slot,'done',results.length);
