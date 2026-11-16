// QRE V1STR N4 recheck R3: apply one mutant to a scratch slot, run probe I there, restore the clean bytes. node r3-apply-run.mjs <slot-root> <mutantId>
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';import {MUTANTS} from './r3-mutants.mjs';
const [ROOT,id]=process.argv.slice(2);if(!/judges[\/]qre-n4[\/]r3-mut-\d$/.test(ROOT))throw new Error('scratch slot only');
const m=MUTANTS.find(x=>x.id===id),f=path.join(ROOT,m.file),clean=fs.readFileSync(f,'utf8');if(clean.split(m.old).length!==2)throw new Error('old text');
fs.writeFileSync(f,clean.replace(m.old,()=>m.new));
try{const r=spawnSync(process.execPath,['../audits/v1-strength-corrections-2026-11-16/candidate/reviews/qre/probes/r3-i-inforce-digest.mjs'],{cwd:path.join(ROOT,'CoachingCore'),encoding:'utf8'});console.log(id,(r.stdout+r.stderr).trim());}finally{fs.writeFileSync(f,clean);}
