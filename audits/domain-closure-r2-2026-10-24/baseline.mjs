import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
const out=path.join(import.meta.dirname,'before');fs.mkdirSync(out,{recursive:true});
const hashes={};
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','domain-closure-r2-2026-10-24','r2'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else hashes[path.relative(root,p).replaceAll('\\','/')]=createHash('sha256').update(fs.readFileSync(p)).digest('hex');}}
walk(root);
for(const p of ['CURRENT_MISSION.md','MISSION_LEDGER.md','reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json'])fs.copyFileSync(path.join(root,p),path.join(out,path.basename(p)));
fs.writeFileSync(path.join(out,'MANIFEST.json'),JSON.stringify({revision:'R2-BASELINE-1',at:new Date().toISOString(),node:process.version,hashes},null,2)+'\n');
fs.writeFileSync(path.join(out,'git-status.txt'),execFileSync('git',['status','--short'],{cwd:root}));
console.log(JSON.stringify({files:Object.keys(hashes).length,queueHash:hashes['reviews/provisional-sports-science/2026-10-23/HUMAN_REVALIDATION_QUEUE.json']}));
